export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface Driver {
  driverId?: string;
  id?: string;
  current_lat?: number;
  current_lng?: number;
  full_name?: string;
  vehicle_make?: string;
  vehicle_model?: string;
}

export interface Ride {
  id: string;
  ride_status: string;
  start_location: string;
  end_location: string;
  start_lat: number;
  start_lng: number;
}
