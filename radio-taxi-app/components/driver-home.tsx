import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, StatusBar, Platform } from 'react-native';
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

interface DriverHomeProps {
  onLogout: () => void;
  pendingRides: RideNotification[];
  onViewRide: (ride: RideNotification) => void;
  onMenuOpen: () => void;
}

export function DriverHome({ onLogout, pendingRides, onViewRide, onMenuOpen }: DriverHomeProps) {
  const inputBg = useThemeColor({ light: '#fff', dark: '#1e1f20' }, 'background');
  const inputTextColor = useThemeColor({}, 'text');

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Menu Button */}
        <TouchableOpacity onPress={onMenuOpen} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Radio Taxi - Driver</Text>
      </View>

      {/* Status */}
      <View style={[styles.statusCard, { backgroundColor: inputBg }]}>
        <View style={styles.statusIndicator}>
          <View style={styles.availableDot} />
          <Text style={[styles.statusText, { color: inputTextColor }]}>Available for rides</Text>
        </View>
      </View>

      {/* Ride Notifications */}
      <View style={styles.notificationsSection}>
        <Text style={styles.sectionTitle}>New Ride Requests</Text>
        {pendingRides.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: inputBg }]}>
            <Text style={[styles.emptyText, { color: inputTextColor }]}>
              No pending ride requests
            </Text>
            <Text style={[styles.emptySubtext, { color: '#888' }]}>
              You&apos;ll be notified when riders request a ride
            </Text>
          </View>
        ) : (
          <FlatList
            data={pendingRides}
            keyExtractor={(item) => item.ride.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.rideCard, { backgroundColor: inputBg }]}
                onPress={() => onViewRide(item)}
              >
                <View style={styles.rideHeader}>
                  <Text style={[styles.rideTitle, { color: inputTextColor }]}>New Ride Request</Text>
                  <Text style={styles.rideBadge}>NEW</Text>
                </View>
                <View style={styles.rideDetails}>
                  <View style={styles.rideRow}>
                    <Text style={styles.rideLabel}>📍 Pickup:</Text>
                    <Text style={[styles.rideValue, { color: inputTextColor }]} numberOfLines={1}>
                      {item.ride.start_location}
                    </Text>
                  </View>
                  <View style={styles.rideRow}>
                    <Text style={styles.rideLabel}>🎯 Drop-off:</Text>
                    <Text style={[styles.rideValue, { color: inputTextColor }]} numberOfLines={1}>
                      {item.ride.end_location}
                    </Text>
                  </View>
                  {item.distance && (
                    <View style={styles.rideRow}>
                      <Text style={styles.rideLabel}>📏 Distance:</Text>
                      <Text style={[styles.rideValue, { color: inputTextColor }]}>
                        {item.distance.toFixed(2)} km
                      </Text>
                    </View>
                  )}
                  {item.price && (
                    <View style={styles.rideRow}>
                      <Text style={styles.rideLabel}>💰 Fare:</Text>
                      <Text style={[styles.fareValue, { color: '#4CAF50' }]}>Bs. {item.price}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Details →</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    backgroundColor: '#808080',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationsSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  rideCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rideBadge: {
    backgroundColor: '#FF6B6B',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  rideDetails: {
    marginBottom: 12,
  },
  rideRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  rideLabel: {
    fontSize: 14,
    color: '#666',
    width: 90,
  },
  rideValue: {
    fontSize: 14,
    flex: 1,
  },
  fareValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
