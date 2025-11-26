import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Region } from '../types/ride';

export function useLocation(token: string | null) {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [pickupAddress, setPickupAddress] = useState<string>('Loading location...');

  // Request location permission on mount
  useEffect(() => {
    if (!token) return;
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        const latitudeDelta = 0.003;
        const longitudeDelta = 0.003;
        const latitudeOffset = -latitudeDelta * 0.5;
        const region = {
          latitude: loc.coords.latitude + latitudeOffset,
          longitude: loc.coords.longitude,
          latitudeDelta,
          longitudeDelta,
        };
        setMapRegion(region);
      } else {
        const result = await Location.requestForegroundPermissionsAsync();
        if (result.status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setLocation(loc.coords);
          const latitudeDelta = 0.003;
          const longitudeDelta = 0.003;
          const latitudeOffset = -latitudeDelta * 0.5;
          const region = {
            latitude: loc.coords.latitude + latitudeOffset,
            longitude: loc.coords.longitude,
            latitudeDelta,
            longitudeDelta,
          };
          setMapRegion(region);
        }
      }
    })();
  }, [token]);

  async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result && result.length > 0) {
        const addr = result[0];
        const parts = [addr.streetNumber, addr.street, addr.city, addr.region].filter(Boolean);
        return parts.join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }
    } catch {
      // Fall through
    }
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }

  async function geocode(address: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const result = await Location.geocodeAsync(address);
      if (result && result.length > 0) {
        return { latitude: result[0].latitude, longitude: result[0].longitude };
      }
    } catch {
      // Fall through
    }
    return null;
  }

  return {
    location,
    mapRegion,
    setMapRegion,
    pickupAddress,
    setPickupAddress,
    reverseGeocode,
    geocode,
  };
}
