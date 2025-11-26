import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, Animated, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Coordinate, Region, Driver } from '../types/ride';

interface MainMapProps {
  mapRef: React.MutableRefObject<any>;
  mapRegion: Region | null;
  location: Location.LocationObjectCoords | null;
  endCoord: Coordinate | null;
  drivers: Driver[];
  pickupAddress: string;
  destinationAddress: string;
  activeRide: any;
  panelTranslateY: Animated.Value;
  onRegionChange: () => void;
  onRegionChangeComplete: (region: Region) => void;
  onDestinationFocus: () => void;
  onMenuOpen: () => void;
  onUseCurrentLocation: () => void;
}

export function MainMap({
  mapRef,
  mapRegion,
  location,
  endCoord,
  drivers,
  pickupAddress,
  destinationAddress,
  activeRide,
  panelTranslateY,
  onRegionChange,
  onRegionChangeComplete,
  onDestinationFocus,
  onMenuOpen,
  onUseCurrentLocation,
}: MainMapProps) {
  const inputBg = useThemeColor({ light: '#fff', dark: '#1e1f20' }, 'background');
  const inputTextColor = useThemeColor({}, 'text');
  const inputBorder = useThemeColor({ light: '#ccc', dark: '#333' }, 'background');
  const placeholderColor = useThemeColor({ light: '#666', dark: '#9a9a9a' }, 'text');

  return (
    <>
      <Text style={styles.title}>Radio Taxi</Text>
      {Platform.OS === 'web' ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Text style={{ textAlign: 'center' }}>Map is not available in the web build.</Text>
          <Text style={{ textAlign: 'center', marginTop: 8 }}>
            Run the app on iOS/Android or use Expo Go (or set up a web map iframe yourself).
          </Text>
        </View>
      ) : (
        (() => {
          // eslint-disable-next-line
          const Maps = require('react-native-maps');
          const NativeMapView = Maps.default || Maps.MapView || Maps;
          const NativeMarker = Maps.Marker || Maps.MapMarker || Maps;
          return (
            <View style={{ flex: 1, position: 'relative' }}>
              <TouchableOpacity onPress={onMenuOpen} style={styles.floatingMenuButton}>
                <Text style={styles.floatingMenuIcon}>☰</Text>
              </TouchableOpacity>
              <NativeMapView
                ref={mapRef}
                style={{ flex: 1 }}
                initialRegion={
                  mapRegion ||
                  (location
                    ? {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.003,
                        longitudeDelta: 0.003,
                      }
                    : { latitude: 0, longitude: 0, latitudeDelta: 50, longitudeDelta: 50 })
                }
                onRegionChange={onRegionChange}
                onRegionChangeComplete={onRegionChangeComplete}
                showsUserLocation={true}
                rotateEnabled={false}
              >
                {endCoord && (
                  <NativeMarker coordinate={endCoord} anchor={{ x: 0.5, y: 0.5 }}>
                    <View style={styles.destinationPin} />
                  </NativeMarker>
                )}
                {drivers.map((d, i) => {
                  const coord =
                    d.current_lat && d.current_lng
                      ? { latitude: Number(d.current_lat), longitude: Number(d.current_lng) }
                      : null;
                  if (!coord) return null;
                  return (
                    <NativeMarker
                      key={d.driverId || d.id || i}
                      coordinate={coord}
                      pinColor="blue"
                      title={d.full_name || 'Driver'}
                      description={`${d.vehicle_make || ''} ${d.vehicle_model || ''}`}
                    />
                  );
                })}
              </NativeMapView>
              <View style={styles.centerMarker} pointerEvents="none">
                <View style={styles.addressContainer}>
                  <Text style={styles.markerLabel} numberOfLines={2}>
                    {pickupAddress}
                  </Text>
                </View>
                <View style={styles.pickupPin} />
              </View>
            </View>
          );
        })()
      )}

      <Animated.View
        style={[styles.bottomPanel, { transform: [{ translateY: panelTranslateY }] }]}
        pointerEvents="box-none"
      >
        <View style={styles.panelContent}>
          <View style={{ marginHorizontal: 8, marginBottom: 8 }}>
            <Text style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>Pickup Location</Text>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{pickupAddress}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.useCurrentLocationButton}
            onPress={onUseCurrentLocation}
          >
            <Text style={styles.useCurrentLocationText}>📍 Use Current Location</Text>
          </TouchableOpacity>
          
          <TextInput
            style={[
              styles.input,
              { backgroundColor: inputBg, color: inputTextColor, borderColor: inputBorder, margin: 8 },
            ]}
            placeholder="Enter destination address"
            placeholderTextColor={placeholderColor}
            value={destinationAddress}
            onFocus={onDestinationFocus}
            showSoftInputOnFocus={false}
            returnKeyType="done"
          />
          {activeRide && (
            <View style={{ marginTop: 8, padding: 8, backgroundColor: '#333', borderRadius: 6, marginHorizontal: 8 }}>
              <Text style={{ color: '#fff' }}>Active Ride: {activeRide.id}</Text>
              <Text style={{ color: '#fff' }}>Status: {activeRide.ride_status}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', margin: 12, textAlign: 'center' },
  floatingMenuButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    backgroundColor: '#808080',
    borderRadius: 20,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  floatingMenuIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -125,
    marginTop: -70,
    alignItems: 'center',
    width: 250,
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
  addressContainer: {
    maxWidth: 250,
    marginBottom: 4,
  },
  markerLabel: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20%',
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  panelContent: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
  },
  useCurrentLocationButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  useCurrentLocationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
