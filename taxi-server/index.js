require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  user: process.env.DB_USER || 'taxi',
  password: process.env.DB_PASSWORD || 'taxi_password',
  database: process.env.DB_NAME || 'taxi_db',
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Simple in-memory ws client registry: userId -> ws
const wsClients = new Map();

function broadcastToUser(userId, msg) {
  const ws = wsClients.get(userId);
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function broadcastToDriverUserIds(userIds, msg) {
  userIds.forEach((uid) => broadcastToUser(uid, msg));
}

function haversineKm(lat1, lon1, lat2, lon2) {
  function toRad(n) { return (n * Math.PI) / 180; }
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

app.get('/health', async (req, res) => {
  try {
    const now = await pool.query('SELECT now()');
    res.json({ ok: true, now: now.rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/', (req, res) => res.send('Taxi server running'));

// Auth: signup
app.post('/auth/signup', async (req, res) => {
  const { email, password, full_name, phone, user_type } = req.body;
  if (!email || !password || !full_name || !phone || !user_type) {
    return res.status(400).json({ error: 'missing fields' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const insertUser = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hash]
    );
    const user = insertUser.rows[0];
    await pool.query(
      'INSERT INTO profiles (id, user_type, full_name, phone) VALUES ($1, $2, $3, $4)',
      [user.id, user_type, full_name, phone]
    );
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth: login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing fields' });
  try {
    const r = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    if (!r.rows.length) return res.status(401).json({ error: 'invalid credentials' });
    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    
    // Get user profile to include user_type
    const profileRes = await pool.query('SELECT user_type, full_name, phone FROM profiles WHERE id = $1', [user.id]);
    const profile = profileRes.rows[0] || {};
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email,
        user_type: profile.user_type,
        full_name: profile.full_name,
        phone: profile.phone
      }, 
      token 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create ride (protected)
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'no token' });
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// Return nearby available drivers
app.get('/drivers/nearby', authMiddleware, async (req, res) => {
  const { lat, lng, radius = 5 } = req.query; // radius km
  if (!lat || !lng) return res.status(400).json({ error: 'missing lat/lng' });
  try {
    const r = await pool.query('SELECT * FROM driver_info WHERE is_available = true');
    const drivers = r.rows
      .map(d => ({ id: d.id, user_id: d.user_id, vehicle_make: d.vehicle_make, vehicle_model: d.vehicle_model, vehicle_year: d.vehicle_year, license_plate: d.license_plate, current_lat: d.current_lat, current_lng: d.current_lng }))
      .filter(d => d.current_lat && d.current_lng)
      .map(d => ({ ...d, distance_km: haversineKm(parseFloat(lat), parseFloat(lng), parseFloat(d.current_lat), parseFloat(d.current_lng)) }))
      .filter(d => d.distance_km <= parseFloat(radius))
      .sort((a,b) => a.distance_km - b.distance_km);
    res.json({ drivers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/drivers/location', authMiddleware, async (req, res) => {
  const { lat, lng, is_available } = req.body;
  const userId = req.user.id;
  if (typeof lat !== 'number' || typeof lng !== 'number') return res.status(400).json({ error: 'invalid lat/lng' });
  try {
    const di = await pool.query('SELECT * FROM driver_info WHERE user_id = $1 LIMIT 1', [userId]);
    if (!di.rows.length) return res.status(404).json({ error: 'driver not found' });
    const driver = di.rows[0];
    await pool.query('UPDATE driver_info SET current_lat = $1, current_lng = $2, is_available = COALESCE($3, is_available), updated_at = now() WHERE id = $4', [lat, lng, is_available, driver.id]);
    // broadcast to interested clients
    broadcastToUser(driver.user_id, { type: 'driver_location', driverId: driver.id, lat, lng });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/rides', authMiddleware, async (req, res) => {
  const { start_location, end_location, start_lat, start_lng, end_lat, end_lng } = req.body;
  const rider_id = req.user.id;
  if (!start_location || !end_location) return res.status(400).json({ error: 'missing fields' });
  try {
    const insert = await pool.query(
      'INSERT INTO rides (rider_id, start_location, end_location, start_lat, start_lng, end_lat, end_lng, ride_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [rider_id, start_location, end_location, start_lat, start_lng, end_lat, end_lng, 'pending']
    );
    const ride = insert.rows[0];
    // notify nearby drivers if coordinates provided
    if (start_lat && start_lng) {
      const allDrivers = (await pool.query('SELECT * FROM driver_info WHERE is_available = true')).rows;
      const nearby = allDrivers.filter(d => d.current_lat && d.current_lng && haversineKm(start_lat, start_lng, d.current_lat, d.current_lng) <= 5);
      const driverUserIds = nearby.map(d => d.user_id);
      broadcastToDriverUserIds(driverUserIds, { type: 'new_ride', ride });
    }
    res.json({ ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get rides (optionally filter by status)
app.get('/rides', authMiddleware, async (req, res) => {
  const { status } = req.query;
  try {
    let query = 'SELECT * FROM rides';
    const params = [];
    
    if (status) {
      query += ' WHERE ride_status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const r = await pool.query(query, params);
    res.json({ rides: r.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/rides/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const r = await pool.query('SELECT * FROM rides WHERE id = $1 LIMIT 1', [id]);
    if (!r.rows.length) return res.status(404).json({ error: 'ride not found' });
    res.json({ ride: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/rides/:id/accept', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // driver user id
  try {
    const di = await pool.query('SELECT * FROM driver_info WHERE user_id = $1 LIMIT 1', [userId]);
    if (!di.rows.length) return res.status(404).json({ error: 'driver not found' });
    const driver = di.rows[0];
    // assign driver to ride
    await pool.query('UPDATE rides SET driver_id = $1, ride_status = $2, updated_at = now() WHERE id = $3', [driver.id, 'accepted', id]);
    const r = await pool.query('SELECT * FROM rides WHERE id = $1 LIMIT 1', [id]);
    const ride = r.rows[0];
    // notify rider
    broadcastToUser(ride.rider_id, { type: 'ride_update', ride });
    res.json({ ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/rides/:id/complete', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE rides SET ride_status = $1, updated_at = now() WHERE id = $2', ['completed', id]);
    const r = await pool.query('SELECT * FROM rides WHERE id = $1 LIMIT 1', [id]);
    const ride = r.rows[0];
    
    // Notify rider
    if (ride.rider_id) {
      broadcastToUser(ride.rider_id, { type: 'ride_update', ride });
    }
    
    res.json({ ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/rides/:id/update-status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status, lat, lng } = req.body;
  if (!status) return res.status(400).json({ error: 'missing status' });
  try {
    await pool.query('UPDATE rides SET ride_status = $1, updated_at = now() WHERE id = $2', [status, id]);
    const r = await pool.query('SELECT * FROM rides WHERE id = $1 LIMIT 1', [id]);
    const ride = r.rows[0];
    // broadcast update to rider and driver
    if (ride.rider_id) broadcastToUser(ride.rider_id, { type: 'ride_update', ride });
    if (ride.driver_id) {
      // get driver_info to find user_id
      const drv = await pool.query('SELECT * FROM driver_info WHERE id = $1 LIMIT 1', [ride.driver_id]);
      if (drv.rows.length) broadcastToUser(drv.rows[0].user_id, { type: 'ride_update', ride });
    }
    // optionally broadcast driver location
    if (lat && lng) {
      // if driver exists, update driver location
      if (ride.driver_id) {
        await pool.query('UPDATE driver_info SET current_lat = $1, current_lng = $2, updated_at = now() WHERE id = $3', [lat, lng, ride.driver_id]);
        // get driver_info row
        const drv = await pool.query('SELECT * FROM driver_info WHERE id = $1 LIMIT 1', [ride.driver_id]);
        if (drv.rows.length) broadcastToUser(drv.rows[0].user_id, { type: 'driver_location', driverId: drv.rows[0].id, lat, lng });
      }
    }
    res.json({ ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// start HTTP + WS server
const port = process.env.PORT || 4000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (socket) => {
  let authenticatedUserId = null;
  socket.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === 'auth' && data.token) {
        try {
          const payload = jwt.verify(data.token, JWT_SECRET);
          authenticatedUserId = payload.id;
          wsClients.set(authenticatedUserId, socket);
          socket.send(JSON.stringify({ type: 'auth_ok' }));
        } catch (err) {
          socket.send(JSON.stringify({ type: 'auth_error', error: 'invalid token' }));
        }
      }
      if (data.type === 'driver_location' && authenticatedUserId) {
        // driver posted location via ws
        const { lat, lng } = data;
        (async () => {
          try {
            const di = await pool.query('SELECT * FROM driver_info WHERE user_id = $1 LIMIT 1', [authenticatedUserId]);
            if (di.rows.length) {
              const driver = di.rows[0];
              await pool.query('UPDATE driver_info SET current_lat = $1, current_lng = $2, updated_at = now() WHERE id = $3', [lat, lng, driver.id]);
              // broadcast to any subscribers (for simplicity broadcast to rider if assigned)
              const rides = await pool.query('SELECT * FROM rides WHERE driver_id = $1 AND ride_status IN (\'accepted\', \'on_trip\')', [driver.id]);
              rides.rows.forEach(r => broadcastToUser(r.rider_id, { type: 'driver_location', driverId: driver.id, lat, lng }));
            }
          } catch (err) {
            console.error('ws driver_location error', err.message);
          }
        })();
      }
    } catch (err) {
      console.warn('invalid ws message', err.message);
    }
  });
  socket.on('close', () => {
    if (authenticatedUserId) wsClients.delete(authenticatedUserId);
  });
});

server.listen(port, () => console.log(`Server listening on ${port}`));

module.exports = { pool };
