import React from 'react';
import { Modal, SafeAreaView, View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Coordinate, Region } from '../types/ride';

interface RoutePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  mapRegion: Region | null;
  endCoord: Coordinate | null;
  routeCoordinates: Coordinate[];
  routeDistance: number;
  routePrice: number;
  pickupAddress: string;
  destinationAddress: string;
  routePreviewMapRef: React.MutableRefObject<any>;
  onCreateRide: () => void;
}

export function RoutePreviewModal({
  visible,
  onClose,
  mapRegion,
  endCoord,
  routeCoordinates,
  routeDistance,
  routePrice,
  pickupAddress,
  destinationAddress,
  routePreviewMapRef,
  onCreateRide,
}: RoutePreviewModalProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }}>
          <View style={styles.routePreviewHeader}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Text style={{ fontSize: 24 }}>←</Text>
            </TouchableOpacity>
            <Text style={styles.routePreviewTitle}>Route Preview</Text>
            <View style={{ width: 40 }} />
          </View>

          {Platform.OS === 'web' ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <Text style={{ textAlign: 'center' }}>Map is not available in the web build.</Text>
            </View>
          ) : (
            (() => {
              // eslint-disable-next-line
              const Maps = require('react-native-maps');
              const NativeMapView = Maps.default || Maps.MapView || Maps;
              const NativeMarker = Maps.Marker || Maps.MapMarker || Maps;
              const Polyline = Maps.Polyline;

              // Use exact map center for pickup coordinates
              const pickupLat = mapRegion?.latitude || 0;
              const pickupLng = mapRegion?.longitude || 0;

              // Calculate region to show both points
              const minLat = Math.min(pickupLat, endCoord?.latitude || 0);
              const maxLat = Math.max(pickupLat, endCoord?.latitude || 0);
              const minLng = Math.min(pickupLng, endCoord?.longitude || 0);
              const maxLng = Math.max(pickupLng, endCoord?.longitude || 0);

              // Use distance-based delta calculation for better zoom
              const baseLat = maxLat - minLat;
              const baseLng = maxLng - minLng;
              // Add 60% padding and ensure minimum zoom level
              const latDelta = Math.max(baseLat * 1.6, 0.003);
              const lngDelta = Math.max(baseLng * 1.6, 0.003);
              const centerLat = (minLat + maxLat) / 2;
              const centerLng = (minLng + maxLng) / 2;

              return (
                <View style={{ height: '50%', position: 'relative' }}>
                  <NativeMapView
                    ref={routePreviewMapRef}
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: centerLat,
                      longitude: centerLng,
                      latitudeDelta: latDelta,
                      longitudeDelta: lngDelta,
                    }}
                    rotateEnabled={false}
                  >
                    <Polyline
                      coordinates={
                        routeCoordinates.length > 0
                          ? routeCoordinates
                          : [
                              { latitude: pickupLat, longitude: pickupLng },
                              { latitude: endCoord?.latitude || 0, longitude: endCoord?.longitude || 0 },
                            ]
                      }
                      strokeColor="#007AFF"
                      strokeWidth={4}
                    />
                    {mapRegion && (
                      <NativeMarker coordinate={{ latitude: pickupLat, longitude: pickupLng }} anchor={{ x: 0.5, y: 0.5 }}>
                        <View style={styles.pickupPin} />
                      </NativeMarker>
                    )}
                    {endCoord && (
                      <NativeMarker coordinate={endCoord} anchor={{ x: 0.5, y: 0.5 }}>
                        <View style={styles.destinationPin} />
                      </NativeMarker>
                    )}
                  </NativeMapView>
                </View>
              );
            })()
          )}

          <View style={styles.routeAddressPanel}>
            <View style={styles.routeInfoRow}>
              <View style={styles.routeInfoItem}>
                <Text style={styles.routeInfoLabel}>Distance</Text>
                <Text style={styles.routeInfoValue}>{routeDistance.toFixed(2)} km</Text>
              </View>
              <View style={styles.routeInfoItem}>
                <Text style={styles.routeInfoLabel}>Estimated Price</Text>
                <Text style={styles.routeInfoValue}>Bs. {routePrice}</Text>
              </View>
            </View>
            <View style={styles.addressRow}>
              <View style={styles.pickupDot} />
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressLabel}>Pickup</Text>
                <Text style={styles.addressText}>{pickupAddress}</Text>
              </View>
            </View>
            <View style={styles.addressRow}>
              <View style={styles.destinationDot} />
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressLabel}>Destination</Text>
                <Text style={styles.addressText}>{destinationAddress}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.createRideButton} onPress={onCreateRide}>
              <Text style={styles.createRideButtonText}>Create Ride</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  routePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routePreviewTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  routeAddressPanel: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  routeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 16,
  },
  routeInfoItem: {
    alignItems: 'center',
  },
  routeInfoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  routeInfoValue: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '700',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickupDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00AA00',
    marginRight: 12,
  },
  destinationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF0000',
    marginRight: 12,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  createRideButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  createRideButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickupPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00AA00',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  destinationPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF0000',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
