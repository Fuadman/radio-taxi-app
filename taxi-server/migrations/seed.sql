-- Seed a sample user/profile/driver and a ride
-- Note: Use the /auth/signup endpoint to create users with proper password hashing
-- Example: POST /auth/signup with {"email": "john.doe@example.com", "password": "password123", "full_name": "John Doe", "phone": "123-456-7890", "user_type": "rider"}
-- Example: POST /auth/signup with {"email": "jane.driver@example.com", "password": "password123", "full_name": "Jane Driver", "phone": "098-765-4321", "user_type": "driver"}

-- For manual DB seeding (passwords will NOT work, use signup endpoint instead):
-- INSERT INTO users (id, email, password_hash) VALUES
--   (gen_random_uuid(), 'john.doe@example.com', 'hashed_pw');

-- INSERT INTO profiles (id, user_type, full_name, phone) VALUES
--   ((SELECT id FROM users WHERE email = 'john.doe@example.com'), 'rider', 'John Doe', '123-456-7890');

-- INSERT INTO users (id, email, password_hash) VALUES
--   (gen_random_uuid(), 'jane.driver@example.com', 'hashed_pw2');

-- INSERT INTO profiles (id, user_type, full_name, phone) VALUES
--   ((SELECT id FROM users WHERE email = 'jane.driver@example.com'), 'driver', 'Jane Driver', '098-765-4321');

-- INSERT INTO driver_info (user_id, vehicle_make, vehicle_model, vehicle_year, license_plate, vehicle_color, is_available, current_lat, current_lng)
-- VALUES
--   ((SELECT id FROM profiles WHERE full_name = 'Jane Driver'), 'Toyota', 'Camry', 2020, 'XYZ 1234', 'Blue', true, 37.7749, -122.4194);

-- INSERT INTO rides (rider_id, driver_id, start_location, end_location, ride_status, fare)
-- VALUES
--   ((SELECT id FROM profiles WHERE full_name = 'John Doe'), (SELECT id FROM driver_info WHERE user_id = (SELECT id FROM profiles WHERE full_name = 'Jane Driver')),
--    '123 Main St, Springfield', '456 Elm St, Springfield', 'completed', 12.50);
