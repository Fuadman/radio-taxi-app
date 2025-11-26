# Radio Taxi App - Mobile Application

A full-featured taxi booking mobile application built with React Native and Expo. Supports both rider and driver roles with real-time location tracking and ride management.

## Features

### For Riders
- **Interactive Map**: View your location and select pickup/destination points
- **Route Preview**: See estimated route, distance, duration, and price before booking
- **Live Tracking**: Track your driver's location in real-time
- **Ride Management**: View ride status, driver details, and ride history
- **Smart Pricing**: Dynamic pricing based on distance and estimated duration

### For Drivers
- **Available Rides**: Browse nearby ride requests
- **Accept Rides**: View rider details and route before accepting
- **Turn-by-Turn Navigation**: Navigate to pickup and destination points
- **Ride Status Updates**: Update ride status (accepted, started, completed)
- **Real-time Location Sharing**: Share your location with riders during trips

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Maps**: React Native Maps
- **Routing**: Multiple providers (OpenRouteService, OSRM, local fallback)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React hooks
- **Real-time**: WebSocket connection to backend
- **Location**: Expo Location API
- **Authentication**: JWT token storage

## Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Backend server running (see `taxi-server/README.md`)

## Quick Start

1. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:4000
EXPO_PUBLIC_OPENROUTE_API_KEY=your_api_key_here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

> **Note**: Use your computer's local IP address (not localhost) for the API URL to work on physical devices.

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npx expo start
```

4. **Run on device/simulator**

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## Project Structure

```
radio-taxi-app/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with auth logic
│   └── map-demo.tsx       # Main map screen
├── components/            # React components
│   ├── driver-home.tsx   # Driver's main screen
│   ├── driver-navigation.tsx  # Turn-by-turn navigation
│   ├── driver-screen.tsx # Driver ride management
│   ├── login-screen.tsx  # Authentication screen
│   ├── main-map.tsx      # Rider's map interface
│   ├── map-picker-modal.tsx   # Location picker
│   ├── menu-modal.tsx    # User menu
│   ├── ride-details-modal.tsx # Ride information
│   ├── route-modal.tsx   # Available rides for drivers
│   └── route-preview-modal.tsx # Route preview before booking
├── hooks/                 # Custom React hooks
│   ├── use-auth.ts       # Authentication logic
│   ├── use-driver-rides.ts    # Driver ride management
│   ├── use-location.ts   # Location tracking
│   ├── use-routing.ts    # Route calculation (multi-provider)
│   └── use-websocket.ts  # WebSocket connection
├── utils/                 # Utility functions
│   ├── api.ts            # API client
│   ├── pricing.ts        # Price calculation
│   └── ws.ts             # WebSocket helpers
└── types/                 # TypeScript definitions
    └── ride.ts           # Ride-related types
```

## Key Components

### Routing System (`hooks/use-routing.ts`)
Multi-tier routing with automatic fallback:
1. **Primary**: OpenRouteService (requires API key)
2. **Backup**: OSRM public server (free, no key required)
3. **Fallback**: Local S-curve algorithm (offline support)

### Authentication (`hooks/use-auth.ts`)
- JWT token-based authentication
- Secure token storage
- Auto-login on app restart
- Support for rider and driver roles

### Real-time Updates (`hooks/use-websocket.ts`)
- WebSocket connection to backend
- Real-time ride status updates
- Live driver location tracking
- Automatic reconnection

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## Configuration

### Map Centering
- Pickup marker positioned at 50% of screen height
- Bottom panel takes 20% of screen height
- Map coordinates use exact center (no offsets)

### Routing Providers
Configure in `hooks/use-routing.ts`:
- Set API keys in `.env` file
- Adjust timeout values if needed
- Modify fallback algorithm parameters

## Testing

### Test Users (from seed data)
**Rider**:
- Email: `rider@test.com`
- Password: `password`

**Driver**:
- Email: `driver@test.com`
- Password: `password`

## Troubleshooting

### API Connection Issues
- Ensure backend server is running on port 4000
- Use your local IP (not localhost) in `EXPO_PUBLIC_API_URL`
- Check firewall settings

### Routing Failures
- Verify API keys in `.env` file
- Check network connectivity
- Local fallback algorithm always works offline

### Location Issues
- Grant location permissions when prompted
- Enable location services on your device
- iOS simulator: Debug > Location > Custom Location

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [TypeScript](https://www.typescriptlang.org/)

