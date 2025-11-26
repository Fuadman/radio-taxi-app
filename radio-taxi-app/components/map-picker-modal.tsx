import React from 'react';
import { Modal, SafeAreaView, View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { Region } from '../types/ride';

interface MapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  pickerMapRegion: Region | null;
  pickerAddress: string;
  isPickerMapMoving: boolean;
  location: Location.LocationObjectCoords | null;
  pickerMapRef: React.MutableRefObject<any>;
  onRegionChange: () => void;
  onRegionChangeComplete: (region: Region) => void;
  onDone: () => void;
}

export function MapPickerModal({
  visible,
  onClose,
  pickerMapRegion,
  pickerAddress,
  isPickerMapMoving,
  location,
  pickerMapRef,
  onRegionChange,
  onRegionChangeComplete,
  onDone,
}: MapPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }}>
          <View style={styles.mapPickerHeader}>
            <TouchableOpacity onPress={onClose} style={styles.mapPickerClose}>
              <Text style={{ fontSize: 24 }}>×</Text>
            </TouchableOpacity>
            <Text style={styles.mapPickerTitle}>Choose Destination</Text>
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
              return (
                <View style={{ flex: 1, position: 'relative' }}>
                  <NativeMapView
                    ref={pickerMapRef}
                    style={{ flex: 1 }}
                    initialRegion={
                      pickerMapRegion || {
                        latitude: location?.latitude || 0,
                        longitude: location?.longitude || 0,
                        latitudeDelta: 0.001,
                        longitudeDelta: 0.001,
                      }
                    }
                    onRegionChange={onRegionChange}
                    onRegionChangeComplete={onRegionChangeComplete}
                    rotateEnabled={false}
                  />
                  <View style={styles.centerMarkerFullScreen} pointerEvents="none">
                    <View style={styles.addressContainer}>
                      <Text style={styles.markerLabel} numberOfLines={2}>
                        {pickerAddress || 'Move map to select'}
                      </Text>
                    </View>
                    <View style={styles.destinationPin} />
                  </View>
                </View>
              );
            })()
          )}

          <View style={styles.mapPickerFooter}>
            <TouchableOpacity
              style={[styles.doneButton, isPickerMapMoving && styles.doneButtonDisabled]}
              onPress={onDone}
              disabled={isPickerMapMoving}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  mapPickerClose: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  mapPickerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonDisabled: {
    backgroundColor: '#ccc',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  centerMarkerFullScreen: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -125,
    marginTop: -10,
    alignItems: 'center',
    width: 250,
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
