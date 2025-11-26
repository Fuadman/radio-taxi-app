require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  user: process.env.DB_USER || 'taxi',
  password: process.env.DB_PASSWORD || 'taxi_password',
  database: process.env.DB_NAME || 'taxi_db',
});

async function runSeed() {
  try {
    console.log('Seeding database with sample users, driver, and rides...');
    const pw1 = await bcrypt.hash('password123', 10);
    const pw2 = await bcrypt.hash('driverpass', 10);

    // Insert rider
    const r1 = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id`,
      ['john.doe@example.com', pw1]
    );
    const riderId = r1.rows[0].id;
    await pool.query(
      `INSERT INTO profiles (id, user_type, full_name, phone) VALUES ($1, $2, $3, $4)`,
      [riderId, 'rider', 'John Doe', '123-456-7890']
    );

    // Insert driver
    const r2 = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id`,
      ['jane.driver@example.com', pw2]
    );
    const driverUserId = r2.rows[0].id;
    await pool.query(
      `INSERT INTO profiles (id, user_type, full_name, phone) VALUES ($1, $2, $3, $4)`,
      [driverUserId, 'driver', 'Jane Driver', '098-765-4321']
    );

    const drv = await pool.query(
      `INSERT INTO driver_info (user_id, vehicle_make, vehicle_model, vehicle_year, license_plate, vehicle_color, is_available, current_lat, current_lng) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [driverUserId, 'Toyota', 'Camry', 2020, 'XYZ 1234', 'Blue', true, 37.7749, -122.4194]
    );
    const driverInfoId = drv.rows[0].id;

    // Insert a completed ride for history
    await pool.query(
      `INSERT INTO rides (rider_id, driver_id, start_location, end_location, ride_status, fare) VALUES ($1, $2, $3, $4, $5, $6)`,
      [riderId, driverInfoId, '123 Main St, Springfield', '456 Elm St, Springfield', 'completed', 12.5]
    );

    console.log('Seeding complete');
  } catch (err) {
    console.error('Seed failed:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

module.exports = { runSeed };
