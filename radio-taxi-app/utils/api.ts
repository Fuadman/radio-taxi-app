export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

// Signup is intentionally disabled in the client for now.
// Server may still expose a /auth/signup endpoint but the app will use sign-in only.

export async function login(payload: { email: string; password: string }) {
  const r = await fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return r.json();
}

export async function createRide(token: string, payload: { 
  start_location: string; 
  end_location: string; 
  start_lat?: number; 
  start_lng?: number;
  end_lat?: number;
  end_lng?: number;
}) {
  const r = await fetch(API_BASE + '/rides', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return r.json();
}

export async function getNearbyDrivers(token: string, lat: number, lng: number, radius = 5) {
  const q = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radius) });
  const r = await fetch(API_BASE + '/drivers/nearby?' + q.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return r.json();
}

export async function updateDriverLocation(token: string, lat: number, lng: number, is_available?: boolean) {
  const r = await fetch(API_BASE + '/drivers/location', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ lat, lng, is_available }),
  });
  return r.json();
}

export async function acceptRide(token: string, rideId: string) {
  const r = await fetch(API_BASE + `/rides/${rideId}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return r.json();
}

export default { API_BASE };
