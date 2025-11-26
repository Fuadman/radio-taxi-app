# Taxi Server API

This document describes a minimal API for a ride-hailing backend used by `radio-taxi`.

Authentication
- JWT-based authentication for drivers and riders.

Endpoints (REST)

Auth
- POST /auth/signup
  - Body: { name, email, password, role: "rider" | "driver" }
  - Response: { user: { id, name, email, role }, token }
- POST /auth/login
  - Body: { email, password }
  - Response: { user, token }

Drivers
- GET /drivers/nearby?lat=&lon=&radius=
  - Headers: Authorization: Bearer <token>
  - Response: [{ id, name, vehicle, location: { lat, lon }, rating }]
- POST /drivers/:id/location
  - Headers: Authorization: Bearer <token>
  - Body: { lat, lon }
  - Used by drivers (or driver client) to update position.

Trips
- POST /trips
  - Headers: Authorization: Bearer <token>
  - Body: { pickup: {lat,lon}, dropoff: {lat,lon}, riderId?, paymentMethod? }
  - Response: { tripId, status: "requested", estimatedFare }
- GET /trips/:id
  - Headers: Authorization: Bearer <token>
  - Response: full trip object
- POST /trips/:id/cancel
  - Headers: Authorization: Bearer <token>
  - Cancels the trip
- POST /trips/:id/accept
  - Headers: Authorization: Bearer <token>
  - Body: { driverId }
  - Driver accepts a trip
- POST /trips/:id/update-status
  - Headers: Authorization: Bearer <token>
  - Body: { status: "accepted"|"arrived"|"on_trip"|"completed", lat?, lon? }
  - Updates progress and optionally driver location

Real-time (WebSocket)
- WebSocket endpoint: /ws
  - After connecting, client sends: { type: "auth", token }
  - Messages:
    - Driver location updates: { type: "driver_location", driverId, lat, lon }
    - Trip updates: { type: "trip_update", tripId, payload }
    - New trip requests (to drivers): { type: "new_trip", trip }

Database Schema (minimal)
- users (id, name, email, password_hash, role)
- drivers (id, user_id, vehicle_info, rating, status)
- vehicles (id, driver_id, make, model, plate)
- trips (id, rider_id, driver_id, pickup_lat, pickup_lon, dropoff_lat, dropoff_lon, status, fare, created_at, updated_at)
- driver_locations (id, driver_id, lat, lon, timestamp)

Notes & Implementation hints
- Use `jsonwebtoken` for JWTs, `bcrypt` for passwords, `pg` for Postgres.
- Provide CORS for the Expo app during development.
- For local dev, WebSocket server can be implemented with the `ws` package or via `socket.io`.
- Keep trip matching simple: when a rider requests a trip, broadcast `new_trip` to nearby drivers via WebSocket.

Sample interaction
1. Rider signs up / logs in and requests a trip via POST /trips.
2. Server calculates estimated fare and creates a trip row with status `requested`.
3. Server finds nearby drivers and sends `new_trip` messages via WebSocket.
4. Driver accepts via POST /trips/:id/accept, server assigns driver to trip and broadcasts `trip_update`.
5. Driver updates location via WebSocket or POST /drivers/:id/location; rider receives updates.
6. On completion, driver calls POST /trips/:id/update-status with `completed`.

Run & dev notes
- `npm run dev` to run server with nodemon.
- `npm run migrate` to apply SQL migrations in `migrations/`.

Security
- Protect endpoints with JWT middleware.
- Validate inputs and rate-limit sensitive endpoints.

This spec is intentionally minimal to get a working prototype. Feel free to iterate on the data model and add features like pricing algorithms, payment integration, or push notifications later.
