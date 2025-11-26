import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useThemeColor } from '@/hooks/use-theme-color';

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

interface RideDetailsModalProps {
  rideNotification: RideNotification;
  onAccept: () => void;
  onDecline: () => void;
  routeCoordinates?: { latitude: number; longitude: number }[];
}

export function RideDetailsModal({
  rideNotification,
  onAccept,
  onDecline,
  routeCoordinates,
}: RideDetailsModalProps) {
  const { ride, distance, price } = rideNotification;
  const inputBg = useThemeColor({ light: '#fff', dark: '#1e1f20' }, 'background');
  const inputTextColor = useThemeColor({}, 'text');

  // Ensure coordinates are numbers (PostgreSQL may return them as strings)
  const startLat = typeof ride.start_lat === 'string' ? parseFloat(ride.start_lat) : ride.start_lat;
  const startLng = typeof ride.start_lng === 'string' ? parseFloat(ride.start_lng) : ride.start_lng;
  const endLat = ride.end_lat ? (typeof ride.end_lat === 'string' ? parseFloat(ride.end_lat) : ride.end_lat) : null;
  const endLng = ride.end_lng ? (typeof ride.end_lng === 'string' ? parseFloat(ride.end_lng) : ride.end_lng) : null;

  // Validate coordinates exist and are valid numbers
  if (!startLat || !startLng || isNaN(startLat) || isNaN(startLng)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.detailsPanel, { backgroundColor: inputBg }]}>
          <Text style={[styles.title, { color: inputTextColor }]}>Error</Text>
          <Text style={[styles.value, { color: inputTextColor }]}>
            Invalid ride coordinates. Please try again.
          </Text>
          <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
            <Text style={styles.declineButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate initial region, ensuring valid coordinates
  const initialRegion = {
    latitude: startLat,
    longitude: startLng,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // If we have both pickup and destination, center between them
  if (endLat && endLng && startLat && startLng) {
    const midLat = (startLat + endLat) / 2;
    const midLng = (startLng + endLng) / 2;
    const latDelta = Math.abs(startLat - endLat) * 1.5 || 0.05;
    const lngDelta = Math.abs(startLng - endLng) * 1.5 || 0.05;
    
    initialRegion.latitude = midLat;
    initialRegion.longitude = midLng;
    initialRegion.latitudeDelta = Math.max(latDelta, 0.02);
    initialRegion.longitudeDelta = Math.max(lngDelta, 0.02);
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Map View */}
      <MapView 
        style={styles.map} 
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {/* Pickup Marker */}
        {startLat && startLng && !isNaN(startLat) && !isNaN(startLng) && (
          <Marker
            coordinate={{ latitude: startLat, longitude: startLng }}
            title="Pickup Location"
            pinColor="#4CAF50"
          />
        )}
        
        {/* Destination Marker */}
        {endLat && endLng && !isNaN(endLat) && !isNaN(endLng) && (
          <Marker
            coordinate={{ latitude: endLat, longitude: endLng }}
            title="Destination"
            pinColor="#FF6B6B"
          />
        )}

        {/* Route Polyline */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Details Panel */}
      <View style={[styles.detailsPanel, { backgroundColor: inputBg }]}>
        <Text style={[styles.title, { color: inputTextColor }]}>Ride Request Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>📍 Pickup:</Text>
          <Text style={[styles.value, { color: inputTextColor }]}>{ride.start_location}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>🎯 Destination:</Text>
          <Text style={[styles.value, { color: inputTextColor }]}>{ride.end_location}</Text>
        </View>

        {distance && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>📏 Distance:</Text>
            <Text style={[styles.value, { color: inputTextColor }]}>
              {distance.toFixed(2)} km
            </Text>
          </View>
        )}

        {price && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>💰 Fare:</Text>
            <Text style={[styles.fareText, { color: '#4CAF50' }]}>Bs. {price}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <Text style={styles.acceptButtonText}>Accept Ride</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  detailsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: 110,
  },
  value: {
    fontSize: 14,
    flex: 1,
  },
  fareText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
