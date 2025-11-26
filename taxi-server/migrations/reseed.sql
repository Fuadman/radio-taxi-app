-- Reseed the database: truncate existing data and insert sample records
-- Note: uses pgcrypto's crypt() with bcrypt salt via gen_salt('bf') for password hashes.

BEGIN;

-- Remove existing data (truncate in dependency order)
TRUNCATE TABLE rides, driver_info, profiles, users RESTART IDENTITY CASCADE;

-- Insert a rider user
INSERT INTO users (id, email, password_hash)
VALUES (gen_random_uuid(), 'john.doe@example.com', crypt('password123', gen_salt('bf')));

INSERT INTO profiles (id, user_type, full_name, phone)
VALUES ((SELECT id FROM users WHERE email = 'john.doe@example.com'), 'rider', 'John Doe', '123-456-7890');

-- Insert a driver user
INSERT INTO users (id, email, password_hash)
VALUES (gen_random_uuid(), 'jane.driver@example.com', crypt('driverpass', gen_salt('bf')));

INSERT INTO profiles (id, user_type, full_name, phone)
VALUES ((SELECT id FROM users WHERE email = 'jane.driver@example.com'), 'driver', 'Jane Driver', '098-765-4321');

-- Insert driver_info for the driver
INSERT INTO driver_info (user_id, vehicle_make, vehicle_model, vehicle_year, license_plate, vehicle_color, is_available, current_lat, current_lng)
VALUES ((SELECT id FROM profiles WHERE full_name = 'Jane Driver'), 'Toyota', 'Camry', 2020, 'XYZ 1234', 'Blue', true, 37.7749, -122.4194);

-- Insert a sample ride between the rider and driver
INSERT INTO rides (rider_id, driver_id, start_location, end_location, ride_status, fare)
VALUES (
  (SELECT id FROM profiles WHERE full_name = 'John Doe'),
  (SELECT id FROM driver_info WHERE user_id = (SELECT id FROM profiles WHERE full_name = 'Jane Driver')),
  '123 Main St, Springfield',
  '456 Elm St, Springfield',
  'completed',
  12.50
);

COMMIT;

-- Helpful note: run this with psql or from your migration tool. Ensure the DB user has pgcrypto extension available.
