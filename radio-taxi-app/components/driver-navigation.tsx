import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useThemeColor } from '@/hooks/use-theme-color';

interface DriverNavigationProps {
  driverLocation: { latitude: number; longitude: number };
  pickupLocation: { latitude: number; longitude: number };
  pickupAddress: string;
  routeCoordinates?: { latitude: number; longitude: number }[];
  distance?: number;
}

export function DriverNavigation({
  driverLocation,
  pickupLocation,
  pickupAddress,
  routeCoordinates,
  distance,
}: DriverNavigationProps) {
  const inputBg = useThemeColor({ light: '#fff', dark: '#1e1f20' }, 'background');
  const inputTextColor = useThemeColor({}, 'text');

  // Validate coordinates
  const isValidCoord = (coord: { latitude: number; longitude: number }) => {
    return coord && 
           typeof coord.latitude === 'number' && 
           typeof coord.longitude === 'number' &&
           !isNaN(coord.latitude) && 
           !isNaN(coord.longitude);
  };

  if (!isValidCoord(driverLocation) || !isValidCoord(pickupLocation)) {
    return (
      <View style={styles.container}>
        <View style={[styles.infoPanel, { backgroundColor: inputBg }]}>
          <Text style={[{ color: inputTextColor }]}>Loading location data...</Text>
        </View>
      </View>
    );
  }

  const initialRegion = {
    latitude: (driverLocation.latitude + pickupLocation.latitude) / 2,
    longitude: (driverLocation.longitude + pickupLocation.longitude) / 2,
    latitudeDelta: Math.abs(driverLocation.latitude - pickupLocation.latitude) * 2 || 0.05,
    longitudeDelta: Math.abs(driverLocation.longitude - pickupLocation.longitude) * 2 || 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {/* Driver Location */}
        <Marker
          coordinate={driverLocation}
          title="Your Location"
          pinColor="#007AFF"
        >
          <View style={styles.driverMarker}>
            <Text style={styles.driverMarkerText}>🚗</Text>
          </View>
        </Marker>

        {/* Pickup Location */}
        <Marker
          coordinate={pickupLocation}
          title="Pickup Location"
          description={pickupAddress}
          pinColor="#4CAF50"
        />

        {/* Route */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Navigation Info Panel */}
      <View style={[styles.infoPanel, { backgroundColor: inputBg }]}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>En route to pickup</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>📍 Pickup:</Text>
          <Text style={[styles.value, { color: inputTextColor }]} numberOfLines={2}>
            {pickupAddress}
          </Text>
        </View>

        {distance && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>📏 Distance:</Text>
            <Text style={[styles.value, { color: inputTextColor }]}>
              {distance.toFixed(2)} km
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  driverMarker: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  driverMarkerText: {
    fontSize: 20,
  },
  infoPanel: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  statusBadge: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: 90,
  },
  value: {
    fontSize: 14,
    flex: 1,
  },
});
