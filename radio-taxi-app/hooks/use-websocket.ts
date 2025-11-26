import { useEffect, useRef } from 'react';
import { connectWebSocket } from '../utils/ws';
import { Driver } from '../types/ride';

export function useWebSocket(
  token: string | null,
  setDrivers: (updater: (prev: Driver[]) => Driver[]) => void,
  setActiveRide: (ride: any) => void
) {
  const wsClientRef = useRef<any | null>(null);

  useEffect(() => {
    if (!token) {
      if (wsClientRef.current) {
        wsClientRef.current.close();
        wsClientRef.current = null;
      }
      return;
    }

    const client = connectWebSocket(token, (msg: any) => {
      if (msg.type === 'driver_location') {
        setDrivers((prev) => {
          const exists = prev.find((d) => d.driverId === msg.driverId || d.id === msg.driverId);
          if (exists) {
            return prev.map((d) =>
              d.driverId === msg.driverId || d.id === msg.driverId
                ? { ...d, current_lat: msg.lat, current_lng: msg.lng }
                : d
            );
          }
          return [...prev, { driverId: msg.driverId, current_lat: msg.lat, current_lng: msg.lng }];
        });
      }
      if (msg.type === 'new_ride') {
        console.log('new_ride', msg);
      }
      if (msg.type === 'ride_update') {
        setActiveRide(msg.ride);
      }
    });

    wsClientRef.current = client;
    return () => client.close();
  }, [token, setDrivers, setActiveRide]);

  function closeConnection() {
    if (wsClientRef.current) {
      wsClientRef.current.close();
      wsClientRef.current = null;
    }
  }

  return { closeConnection };
}
