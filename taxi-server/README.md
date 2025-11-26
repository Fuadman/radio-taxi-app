# Taxi Server - Backend API

Backend API server for the Radio Taxi application. Built with Node.js, Express, PostgreSQL, and WebSockets.

## Features

- **User Authentication**: JWT-based authentication for riders and drivers
- **Ride Management**: Create, accept, and track rides in real-time
- **Real-time Updates**: WebSocket support for live ride status and driver location updates
- **Location Tracking**: Store and retrieve ride coordinates, pickup/dropoff locations
- **Database**: PostgreSQL with migrations for schema management
- **RESTful API**: Complete CRUD operations for users and rides

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Docker)
- **Real-time**: WebSocket (ws)
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt for password hashing

## Quick Start

1. **Configure environment variables**

```bash
cp .env.example .env
# Edit .env with your database credentials
```

2. **Start PostgreSQL via Docker Compose**

```bash
cd ..  # Navigate to project root
docker compose up -d
```

The database runs on port `5433` to avoid conflicts with local PostgreSQL instances.

3. **Install dependencies and run migrations**

```bash
npm install
npm run migrate        # Run database migrations
npm run seed           # Run migrations + seed test data
```

4. **Start the development server**

```bash
npm run dev            # Start with nodemon (auto-reload)
# or
npm start              # Start without auto-reload
```

5. **Health check**

Open [http://localhost:4000/health](http://localhost:4000/health)

## Available Scripts

- `npm run migrate` - Run database migrations
- `npm run seed` - Run migrations and seed test data
- `npm run dev` - Start server with nodemon
- `npm start` - Start server in production mode

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (rider/driver)
- `POST /api/auth/login` - Login and receive JWT token

### Rides
- `POST /api/rides` - Create new ride request
- `GET /api/rides/:id` - Get ride details
- `PUT /api/rides/:id/accept` - Driver accepts ride
- `PUT /api/rides/:id/start` - Start ride
- `PUT /api/rides/:id/complete` - Complete ride
- `GET /api/rides/driver/:driverId` - Get driver's rides

### Users
- `GET /api/users/me` - Get current user profile

### WebSocket
- Connect to `ws://localhost:4000` for real-time updates
- Events: `ride-created`, `ride-accepted`, `ride-started`, `ride-completed`, `driver-location`

## Database Schema

- **users**: User accounts (riders and drivers)
- **rides**: Ride requests and trip data
- Migrations stored in `migrations/` directory

## Notes

- Database runs on port `5433` (configurable in `.env`)
- Server runs on port `4000` (configurable in `index.js`)
- See `API.md` for detailed API documentation

