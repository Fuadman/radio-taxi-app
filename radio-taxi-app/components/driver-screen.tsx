import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { DriverHome } from '@/components/driver-home';
import { RideDetailsModal } from '@/components/ride-details-modal';
import { DriverNavigation } from '@/components/driver-navigation';
import { MenuModal } from '@/components/menu-modal';
import { useDriverRides } from '@/hooks/use-driver-rides';
import { useLocation } from '@/hooks/use-location';
import { calculateRoute as calculateRouteAPI } from '@/hooks/use-routing';
import { calculatePrice } from '@/utils/pricing';

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

interface RideNotification {
  ride: Ride;
  distance?: number;
  price?: number;
}

interface DriverScreenProps {
  token: string;
  onLogout: () => void;
}

export function DriverScreen({ token, onLogout }: DriverScreenProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedRide, setSelectedRide] = useState<RideNotification | null>(null);
  const [rideDetailsVisible, setRideDetailsVisible] = useState(false);
  const [navigationMode, setNavigationMode] = useState(false);

  const { pendingRides, acceptedRide, loading, acceptRide } = useDriverRides(token);
  const { location } = useLocation(token);

  const [rideNotifications, setRideNotifications] = useState<RideNotification[]>([]);
  const [rideDetailsRoute, setRideDetailsRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [navigationRoute, setNavigationRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [navigationDistance, setNavigationDistance] = useState<number | undefined>();

  // Calculate distance and price for pending rides
  useEffect(() => {
    const enrichRides = async () => {
      const enriched = await Promise.all(
        pendingRides.map(async (ride) => {
          if (ride.end_lat && ride.end_lng) {
            const routeData = await calculateRouteAPI(
              { lat: ride.start_lat, lng: ride.start_lng },
              { lat: ride.end_lat, lng: ride.end_lng }
            );

            if (routeData) {
              return {
                ride,
                distance: routeData.distance,
                price: calculatePrice(routeData.distance),
              };
            }
          }
          return { ride };
        })
      );
      setRideNotifications(enriched);
    };

    enrichRides();
  }, [pendingRides]);

  // Handle view ride details
  const handleViewRide = async (rideNotification: RideNotification) => {
    setSelectedRide(rideNotification);
    setRideDetailsVisible(true);
    
    // Calculate route for the ride (async, will update when ready)
    if (rideNotification.ride.end_lat && rideNotification.ride.end_lng) {
      try {
        const routeData = await calculateRouteAPI(
          { lat: rideNotification.ride.start_lat, lng: rideNotification.ride.start_lng },
          { lat: rideNotification.ride.end_lat, lng: rideNotification.ride.end_lng }
        );

        if (routeData && routeData.coordinates) {
          setRideDetailsRoute(routeData.coordinates);
        }
      } catch {
        // Failed to calculate route, map will show without polyline
        setRideDetailsRoute([]);
      }
    }
  };

  // Handle accept ride
  const handleAcceptRide = async () => {
    if (!selectedRide || !location) return;

    const success = await acceptRide(selectedRide.ride.id);
    
    if (success) {
      Alert.alert('Success', 'Ride accepted! Navigate to pickup location.');
      setRideDetailsVisible(false);
      
      // Calculate route from driver location to pickup
      const routeData = await calculateRouteAPI(
        { lat: location.latitude, lng: location.longitude },
        { lat: selectedRide.ride.start_lat, lng: selectedRide.ride.start_lng }
      );

      if (routeData && routeData.coordinates) {
        setNavigationRoute(routeData.coordinates);
        setNavigationDistance(routeData.distance);
      }

      setNavigationMode(true);
    } else {
      Alert.alert('Error', 'Failed to accept ride. Please try again.');
    }
  };

  // Handle decline ride
  const handleDeclineRide = () => {
    setSelectedRide(null);
    setRideDetailsVisible(false);
    setRideDetailsRoute([]);
  };

  if (loading && !pendingRides.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show navigation if ride is accepted
  if (navigationMode && acceptedRide && location) {
    return (
      <DriverNavigation
        driverLocation={location}
        pickupLocation={{
          latitude: acceptedRide.start_lat,
          longitude: acceptedRide.start_lng,
        }}
        pickupAddress={acceptedRide.start_location}
        routeCoordinates={navigationRoute}
        distance={navigationDistance}
      />
    );
  }

  return (
    <View style={styles.container}>
      <DriverHome
        onLogout={onLogout}
        pendingRides={rideNotifications}
        onViewRide={handleViewRide}
        onMenuOpen={() => setMenuVisible(true)}
      />

      {/* Menu Modal */}
      <MenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} onLogout={onLogout} />

      {/* Ride Details Modal */}
      <Modal
        visible={rideDetailsVisible}
        animationType="slide"
        onRequestClose={handleDeclineRide}
      >
        {selectedRide && selectedRide.ride && (
          <RideDetailsModal
            rideNotification={selectedRide}
            onAccept={handleAcceptRide}
            onDecline={handleDeclineRide}
            routeCoordinates={rideDetailsRoute}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
