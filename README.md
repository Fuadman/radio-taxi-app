# Radio Taxi - Full Stack Taxi Booking Application

A complete taxi booking platform with real-time location tracking, ride management, and turn-by-turn navigation. Built with React Native (Expo), Node.js, Express, PostgreSQL, and WebSockets.

## Project Structure

```
radio-taxi/
├── radio-taxi-app/       # React Native mobile application (Expo)
├── taxi-server/          # Node.js/Express backend API
└── docker-compose.yml    # PostgreSQL database container
```

## Features

- 🚗 **Dual-mode Application**: Separate interfaces for riders and drivers
- 📍 **Real-time Location Tracking**: Live driver location updates via WebSocket
- 🗺️ **Interactive Maps**: React Native Maps with route visualization
- 🔄 **Multi-tier Routing**: OpenRouteService, OSRM, and offline fallback
- 💰 **Dynamic Pricing**: Distance and duration-based fare calculation
- 🔐 **JWT Authentication**: Secure user authentication for both roles
- 📱 **Cross-platform**: iOS and Android support via Expo

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Expo CLI**: `npm install -g expo-cli`
- **Git** - [Download](https://git-scm.com/)

Optional:
- **iOS Simulator** (Mac only) - via Xcode
- **Android Emulator** - via Android Studio

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Fuadman/radio-taxi-app.git
cd radio-taxi-app
```

### 2. Set Up the Database

Start PostgreSQL using Docker Compose:

```bash
docker compose up -d
```

This will start PostgreSQL on port `5433` (to avoid conflicts with local installations).

**Verify the database is running:**
```bash
docker ps
```

You should see a container named `radio-taxi-postgres-1` running.

### 3. Configure Backend Environment

Create the backend environment file:

```bash
cd taxi-server
cp .env.example .env
```

Your `.env` file should contain:
```env
DB_USER=taxi
DB_PASSWORD=taxi_password
DB_NAME=taxi_db
DB_PORT=5433
```

### 4. Install Backend Dependencies

```bash
npm install
```

### 5. Create and Seed the Database

Run migrations to create tables:
```bash
npm run migrate
```

Seed the database with test data (includes test users):
```bash
npm run seed
```

This creates:
- Database schema (users and rides tables)
- Test users (see [Test Users](#test-users) section below)

### 6. Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:4000`

**Verify the server is running:**
Open [http://localhost:4000/health](http://localhost:4000/health) in your browser.

### 7. Configure Mobile App Environment

Open a new terminal window and navigate to the mobile app:

```bash
cd ../radio-taxi-app
cp .env.example .env
```

Edit `.env` with your local IP address (important for physical device testing):

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:4000
EXPO_PUBLIC_OPENROUTE_API_KEY=your_api_key_here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Finding your local IP:**
- **Mac/Linux**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows**: `ipconfig`

> ⚠️ **Important**: Don't use `localhost` or `127.0.0.1` - these won't work on physical devices or emulators!

### 8. Install Mobile App Dependencies

```bash
npm install
```

### 9. Start the Mobile App

```bash
npx expo start
```

### 10. Run on Device/Simulator

Once the Expo dev server starts, you have several options:

- **Press `i`** - Open in iOS Simulator (Mac only)
- **Press `a`** - Open in Android Emulator
- **Scan QR code** - Use Expo Go app on your physical device

## Test Users

The seed script creates the following test accounts:

### Rider Account
- **Email**: `rider@test.com`
- **Password**: `password`
- **Role**: Rider

### Driver Account
- **Email**: `driver@test.com`
- **Password**: `password`
- **Role**: Driver

### Creating Additional Users

You can create more test users by modifying `taxi-server/migrations/seed.sql` or using the registration API:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "rider"
  }'
```

## Building for Production

### Backend (Production Build)

```bash
cd taxi-server
npm install --production
npm start
```

For deployment, consider using:
- **PM2** for process management
- **Docker** for containerization
- **Environment variables** for production configuration

### Mobile App (Production Build)

#### Development Build (Recommended)
```bash
cd radio-taxi-app
npx expo install expo-dev-client
npx expo run:ios    # or expo run:android
```

#### EAS Build (Expo Application Services)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure your project:
```bash
eas build:configure
```

3. Build for iOS:
```bash
eas build --platform ios
```

4. Build for Android:
```bash
eas build --platform android
```

See [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/) for detailed instructions.

## Testing

### Backend Tests

Currently, the backend uses manual testing via the API endpoints.

**Test the health endpoint:**
```bash
curl http://localhost:4000/health
```

**Test user login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rider@test.com",
    "password": "password"
  }'
```

### Mobile App Tests

1. **Login as Rider** (`rider@test.com` / `password`)
   - View map with current location
   - Select destination
   - Preview route and price
   - Create ride request

2. **Login as Driver** (`driver@test.com` / `password`)
   - View available rides
   - Accept a ride
   - Navigate to pickup location
   - Complete the ride

## Database Management

### View Database Data

Connect to PostgreSQL:
```bash
docker exec -it radio-taxi-postgres-1 psql -U taxi -d taxi_db
```

Useful commands:
```sql
\dt              -- List all tables
\d users         -- Describe users table
\d rides         -- Describe rides table

SELECT * FROM users;
SELECT * FROM rides;
```

Exit: `\q`

### Reset Database

Clear all data:
```bash
cd taxi-server
npm run migrate  # Re-run migrations
npm run seed     # Re-seed test data
```

Or use SQL:
```bash
docker exec -it radio-taxi-postgres-1 psql -U taxi -d taxi_db -c "TRUNCATE TABLE rides, users RESTART IDENTITY CASCADE;"
```

### Backup Database

```bash
docker exec -it radio-taxi-postgres-1 pg_dump -U taxi taxi_db > backup.sql
```

### Restore Database

```bash
docker exec -i radio-taxi-postgres-1 psql -U taxi taxi_db < backup.sql
```

## Troubleshooting

### Database Connection Issues

**Problem**: Backend can't connect to database

**Solutions**:
1. Verify Docker container is running: `docker ps`
2. Check port 5433 is not in use: `lsof -i :5433`
3. Restart Docker container: `docker compose restart`
4. Check `.env` file has correct credentials

### Mobile App Can't Connect to Backend

**Problem**: API requests timing out or failing

**Solutions**:
1. Verify backend is running: `curl http://localhost:4000/health`
2. Use your local IP (not localhost) in `EXPO_PUBLIC_API_URL`
3. Ensure your device/emulator is on the same network
4. Check firewall settings aren't blocking port 4000
5. Restart Expo dev server: `npx expo start -c`

### Routing Not Working

**Problem**: Routes not displaying or API timeouts

**Solutions**:
1. Check if API keys are set in `.env`
2. Verify network connectivity
3. The local fallback algorithm always works offline
4. Check routing debug logs in the app

### Location Not Showing

**Problem**: Map doesn't show current location

**Solutions**:
1. Grant location permissions when prompted
2. Enable location services on your device
3. iOS Simulator: Debug > Location > Custom Location
4. Android Emulator: Use Extended Controls to set location

### Port Already in Use

**Problem**: Port 4000 or 5433 already in use

**Solutions**:

For backend (port 4000):
```bash
# Find process using port 4000
lsof -i :4000
# Kill the process
kill -9 <PID>
```

For database (port 5433):
```bash
# Stop Docker container
docker compose down
# Start again
docker compose up -d
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Ride Endpoints

- `POST /api/rides` - Create ride request
- `GET /api/rides/:id` - Get ride details
- `PUT /api/rides/:id/accept` - Accept ride (driver)
- `PUT /api/rides/:id/start` - Start ride (driver)
- `PUT /api/rides/:id/complete` - Complete ride (driver)
- `GET /api/rides/driver/:driverId` - Get driver's rides

For detailed API documentation, see `taxi-server/API.md`

## WebSocket Events

Connect to `ws://localhost:4000`

### Client → Server
- `driver-location` - Driver shares location update

### Server → Client
- `ride-created` - New ride request available
- `ride-accepted` - Ride accepted by driver
- `ride-started` - Ride started
- `ride-completed` - Ride completed
- `driver-location` - Driver location update

## Project Documentation

- **Backend**: See `taxi-server/README.md` for detailed backend documentation
- **Mobile App**: See `radio-taxi-app/README.md` for detailed mobile app documentation
- **API Reference**: See `taxi-server/API.md` for complete API documentation

## Technology Stack

### Backend
- Node.js + Express.js
- PostgreSQL
- WebSocket (ws)
- JWT Authentication
- bcrypt

### Mobile App
- React Native
- Expo
- TypeScript
- React Native Maps
- Expo Router
- Expo Location

### Infrastructure
- Docker (PostgreSQL)
- Git

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

This project is for educational and demonstration purposes.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review individual README files in each project directory
