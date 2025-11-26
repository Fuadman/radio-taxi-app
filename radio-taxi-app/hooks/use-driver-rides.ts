import { useState, useEffect } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

interface Ride {
  id: string;
  rider_id: string;
  start_location: string;
  end_location: string;
  ride_status: string;
  fare?: number;
  start_lat: number;
  start_lng: number;
  end_lat?: number;
  end_lng?: number;
  created_at: string;
}

export function useDriverRides(token: string | null) {
  const [pendingRides, setPendingRides] = useState<Ride[]>([]);
  const [acceptedRide, setAcceptedRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch pending rides
  const fetchPendingRides = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/rides?status=pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingRides(data.rides || []);
      }
    } catch {
      // Silently fail - will retry on next poll
    }
  };

  // Accept a ride
  const acceptRide = async (rideId: string) => {
    if (!token) return false;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/rides/${rideId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAcceptedRide(data.ride);
        // Remove from pending rides
        setPendingRides(prev => prev.filter(ride => ride.id !== rideId));
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Complete a ride
  const completeRide = async (rideId: string) => {
    if (!token) return false;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/rides/${rideId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAcceptedRide(null);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Poll for pending rides every 5 seconds
  useEffect(() => {
    if (!token) return;

    fetchPendingRides();
    const interval = setInterval(fetchPendingRides, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return {
    pendingRides,
    acceptedRide,
    loading,
    acceptRide,
    completeRide,
    refreshRides: fetchPendingRides,
  };
}
