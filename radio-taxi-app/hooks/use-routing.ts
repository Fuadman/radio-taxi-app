import { Coordinate } from '../types/ride';
import { calculatePrice } from '../utils/pricing';

const OPENROUTE_API_KEY = process.env.EXPO_PUBLIC_OPENROUTE_API_KEY || '';

interface RouteResult {
  coordinates: Coordinate[];
  distance: number;
  price: number;
}

// Simple local routing that creates a reasonable path
function createLocalRoute(
  pickup: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): RouteResult {
  console.log('📍 Creating local route (no external API needed)');
  
  // Calculate straight-line distance using Haversine formula
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(destination.lat - pickup.lat);
  const dLon = toRad(destination.lng - pickup.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(pickup.lat)) * Math.cos(toRad(destination.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;
  
  // Estimate driving distance (typically 1.2-1.4x straight line in cities)
  const distance = straightDistance * 1.3;
  
  // Create a smooth curve between pickup and destination
  // This makes the route look more realistic than a straight line
  const numPoints = 20;
  const coordinates: Coordinate[] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    
    // Use a slight S-curve for more realistic path
    const easedT = t < 0.5 
      ? 2 * t * t 
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
    
    // Add slight variation to make path look less straight
    const latVariation = Math.sin(t * Math.PI) * (destination.lng - pickup.lng) * 0.15;
    const lngVariation = Math.sin(t * Math.PI) * (destination.lat - pickup.lat) * 0.15;
    
    coordinates.push({
      latitude: pickup.lat + (destination.lat - pickup.lat) * easedT + latVariation,
      longitude: pickup.lng + (destination.lng - pickup.lng) * easedT + lngVariation,
    });
  }
  
  console.log('✅ Local route created:', { distance: distance.toFixed(2), numPoints: coordinates.length });
  
  return {
    coordinates,
    distance,
    price: calculatePrice(distance),
  };
}

async function tryOpenRouteService(
  pickup: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteResult | null> {
  try {
    if (!OPENROUTE_API_KEY || OPENROUTE_API_KEY === 'YOUR_API_KEY_HERE') {
      console.log('⚠️ OpenRouteService API key not configured');
      return null;
    }

    const url = 'https://api.openrouteservice.org/v2/directions/driving-car';
    const body = {
      coordinates: [[pickup.lng, pickup.lat], [destination.lng, destination.lat]],
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Request timed out after 10 seconds');
      controller.abort();
    }, 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, application/geo+json',
        'Content-Type': 'application/json',
        'Authorization': OPENROUTE_API_KEY,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ OpenRouteService error response:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('📦 Full response data:', JSON.stringify(data, null, 2));

    if (data.features && data.features.length > 0) {
      const route = data.features[0];
      const coords = route.geometry.coordinates.map((coord: number[]) => ({
        latitude: coord[1],
        longitude: coord[0],
      }));

      const distance = route.properties.segments[0].distance / 1000; // meters to km
      console.log('✅ OpenRouteService route success:', distance.toFixed(2), 'km');
      
      return {
        coordinates: coords,
        distance,
        price: calculatePrice(distance),
      };
    }
    
    return null;
  } catch (error) {
    console.log('⚠️ OpenRouteService not available:', error instanceof Error ? error.message : 'Network error');
    return null;
  }
}

async function tryOSRMRoute(
  pickup: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteResult | null> {
  try {
    // Using public OSRM demo server (free, no API key required)
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

    console.log('🚗 Trying OSRM API...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 5000); // Reduced to 5 seconds for faster fallback

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log('⚠️ OSRM returned status:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      const coords = route.geometry.coordinates.map((coord: number[]) => ({
        longitude: coord[0],
        latitude: coord[1],
      }));
      
      const distance = route.distance / 1000;
      console.log('✅ OSRM route success:', distance.toFixed(2), 'km');
      
      return {
        coordinates: coords,
        distance,
        price: calculatePrice(distance),
      };
    }
    
    return null;
  } catch (error) {
    console.log('⚠️ OSRM not available:', error instanceof Error ? error.message : 'Network error');
    return null;
  }
}

export async function calculateRoute(
  pickup: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteResult> {
  console.log('🗺️ Calculating route...');

  // Try OpenRouteService first (primary)
  const openRouteResult = await tryOpenRouteService(pickup, destination);
  if (openRouteResult) {
    return openRouteResult;
  }

  // Try OSRM as backup
  const osrmResult = await tryOSRMRoute(pickup, destination);
  if (osrmResult) {
    return osrmResult;
  }

  // Use local routing algorithm (always works, no network needed)
  console.log('📱 Using offline routing algorithm');
  return createLocalRoute(pickup, destination);
}
