import React, { useEffect, useState, useRef } from 'react';
import { View, Alert, Platform, KeyboardAvoidingView, Keyboard, Animated } from 'react-native';
import * as Api from '../utils/api';
import { LoginScreen } from '../components/login-screen';
import { DriverScreen } from '../components/driver-screen';
import { MenuModal } from '../components/menu-modal';
import { RouteModal } from '../components/route-modal';
import { MapPickerModal } from '../components/map-picker-modal';
import { RoutePreviewModal } from '../components/route-preview-modal';
import { MainMap } from '../components/main-map';
import { useAuth } from '../hooks/use-auth';
import { useLocation } from '../hooks/use-location';
import { useWebSocket } from '../hooks/use-websocket';
import { calculateRoute } from '../hooks/use-routing';
import { Coordinate, Region, Driver, Ride } from '../types/ride';

export default function MapDemo() {
  const { email, setEmail, password, setPassword, token, userInfo, login, logout } = useAuth();
  const { location, mapRegion, setMapRegion, pickupAddress, setPickupAddress, reverseGeocode, geocode } =
    useLocation(token);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const { closeConnection } = useWebSocket(token, setDrivers, setActiveRide);

  const mapRef = useRef<any | null>(null);
  const [endCoord, setEndCoord] = useState<Coordinate | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [panelVisible, setPanelVisible] = useState(true);
  const panelTranslateY = useRef(new Animated.Value(0)).current;
  const [routeModalVisible, setRouteModalVisible] = useState(false);
  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const [tempDestinationText, setTempDestinationText] = useState<string>('');
  const [pickerMapRegion, setPickerMapRegion] = useState<Region | null>(null);
  const [pickerAddress, setPickerAddress] = useState<string>('');
  const [isPickerMapMoving, setIsPickerMapMoving] = useState(false);
  const pickerMapRef = useRef<any | null>(null);
  const [routePreviewVisible, setRoutePreviewVisible] = useState(false);
  const routePreviewMapRef = useRef<any | null>(null);
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [routePrice, setRoutePrice] = useState<number>(0);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);

  // Animate panel visibility
  useEffect(() => {
    Animated.timing(panelTranslateY, {
      toValue: panelVisible ? 0 : 600,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [panelVisible, panelTranslateY]);

  // Animate to user location when it becomes available
  useEffect(() => {
    if (location && mapRef.current) {
      const region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      };
      setMapRegion(region);
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [location, setMapRegion]);

  async function handleLogout() {
    closeConnection();
    setDrivers([]);
    setActiveRide(null);
    await logout();
  }

  async function onRegionChangeComplete(region: Region) {
    setPanelVisible(true);
    setMapRegion(region);
    const address = await reverseGeocode(region.latitude, region.longitude);
    setPickupAddress(address);
  }

  function onRegionChange() {
    Keyboard.dismiss();
    setPanelVisible(false);
  }

  async function handleUseCurrentLocation() {
    if (!location) {
      Alert.alert('Location not available', 'Please enable location services');
      return;
    }

    // Set pickup to current GPS location
    const currentAddress = await reverseGeocode(location.latitude, location.longitude);
    setPickupAddress(currentAddress);
    
    // Update map region to current location
    const region = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.003,
      longitudeDelta: 0.003,
    };
    setMapRegion(region);
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 500);
    }
    
    // Open destination input
    Keyboard.dismiss();
    setTempDestinationText(destinationAddress);
    setRouteModalVisible(true);
  }

  async function handleDestinationChange(address: string) {
    setTempDestinationText(address);
    if (!address.trim()) return;

    const coords = await geocode(address);
    if (!coords || !mapRegion) return;

    setEndCoord(coords);
    setDestinationAddress(address);
    setRouteModalVisible(false);

    const route = await calculateRoute(
      { lat: mapRegion.latitude, lng: mapRegion.longitude },
      { lat: coords.latitude, lng: coords.longitude }
    );

    setRouteCoordinates(route.coordinates);
    setRouteDistance(route.distance);
    setRoutePrice(route.price);
    setRoutePreviewVisible(true);
  }

  async function openMapPicker() {
    setMapPickerVisible(true);
    setRouteModalVisible(false);
    if (location) {
      const initialRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setPickerMapRegion(initialRegion);
      const address = await reverseGeocode(location.latitude, location.longitude);
      setPickerAddress(address);
    } else if (mapRegion) {
      const initialRegion = {
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setPickerMapRegion(initialRegion);
      const address = await reverseGeocode(mapRegion.latitude, mapRegion.longitude);
      setPickerAddress(address);
    }
  }

  async function onPickerRegionChange() {
    setIsPickerMapMoving(true);
  }

  async function onPickerRegionChangeComplete(region: Region) {
    setIsPickerMapMoving(false);
    setPickerMapRegion(region);
    const address = await reverseGeocode(region.latitude, region.longitude);
    setPickerAddress(address);
  }

  async function confirmMapPicker() {
    if (!pickerMapRegion || !mapRegion) return;

    setEndCoord({
      latitude: pickerMapRegion.latitude,
      longitude: pickerMapRegion.longitude,
    });
    setDestinationAddress(pickerAddress);

    const route = await calculateRoute(
      { lat: mapRegion.latitude, lng: mapRegion.longitude },
      { lat: pickerMapRegion.latitude, lng: pickerMapRegion.longitude }
    );

    setRouteCoordinates(route.coordinates);
    setRouteDistance(route.distance);
    setRoutePrice(route.price);
    setMapPickerVisible(false);
    setRoutePreviewVisible(true);
  }

  async function createRide() {
    if (!token) return Alert.alert('Not authenticated');
    if (!mapRegion) return Alert.alert('Map not ready', 'Please wait for map to load');
    if (!endCoord) return Alert.alert('Enter destination', 'Please enter a destination address');
    try {
      // Get the current pickup address at time of ride creation
      const currentPickupAddress = await reverseGeocode(mapRegion.latitude, mapRegion.longitude);
      
      const j = await Api.createRide(token, {
        start_location: currentPickupAddress || pickupAddress || `${mapRegion.latitude},${mapRegion.longitude}`,
        end_location: destinationAddress || `${endCoord.latitude},${endCoord.longitude}`,
        start_lat: mapRegion.latitude,
        start_lng: mapRegion.longitude,
        end_lat: endCoord.latitude,
        end_lng: endCoord.longitude,
      });
      if (j.error) return Alert.alert('Error', j.error || 'create ride failed');
      Alert.alert('Ride created', JSON.stringify(j.ride));
      setActiveRide(j.ride);
      setEndCoord(null);
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  }

  if (!token) {
    return (
      <LoginScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} onLogin={login} />
    );
  }

  // Show driver screen if user is a driver
  if (userInfo?.user_type === 'driver') {
    return <DriverScreen token={token} onLogout={handleLogout} />;
  }

  // Show rider screen
  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={{ flex: 1 }}>
          <MenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} onLogout={handleLogout} />

          <RouteModal
            visible={routeModalVisible}
            onClose={() => setRouteModalVisible(false)}
            tempDestinationText={tempDestinationText}
            setTempDestinationText={setTempDestinationText}
            onSubmit={handleDestinationChange}
            onOpenMapPicker={openMapPicker}
          />

          <MapPickerModal
            visible={mapPickerVisible}
            onClose={() => setMapPickerVisible(false)}
            pickerMapRegion={pickerMapRegion}
            pickerAddress={pickerAddress}
            isPickerMapMoving={isPickerMapMoving}
            location={location}
            pickerMapRef={pickerMapRef}
            onRegionChange={onPickerRegionChange}
            onRegionChangeComplete={onPickerRegionChangeComplete}
            onDone={confirmMapPicker}
          />

          <RoutePreviewModal
            visible={routePreviewVisible}
            onClose={() => setRoutePreviewVisible(false)}
            mapRegion={mapRegion}
            endCoord={endCoord}
            routeCoordinates={routeCoordinates}
            routeDistance={routeDistance}
            routePrice={routePrice}
            pickupAddress={pickupAddress}
            destinationAddress={destinationAddress}
            routePreviewMapRef={routePreviewMapRef}
            onCreateRide={() => {
              setRoutePreviewVisible(false);
              createRide();
            }}
          />

          <MainMap
            mapRef={mapRef}
            mapRegion={mapRegion}
            location={location}
            endCoord={endCoord}
            drivers={drivers}
            pickupAddress={pickupAddress}
            destinationAddress={destinationAddress}
            activeRide={activeRide}
            panelTranslateY={panelTranslateY}
            onRegionChange={onRegionChange}
            onRegionChangeComplete={onRegionChangeComplete}
            onDestinationFocus={() => {
              Keyboard.dismiss();
              setTempDestinationText(destinationAddress);
              setRouteModalVisible(true);
            }}
            onMenuOpen={() => setMenuVisible(true)}
            onUseCurrentLocation={handleUseCurrentLocation}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
