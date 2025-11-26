-- Reset test users
-- Run this to delete old users with bad password hashes
DELETE FROM rides;
DELETE FROM driver_info;
DELETE FROM profiles;
DELETE FROM users WHERE email IN ('john.doe@example.com', 'jane.driver@example.com');

-- Then use the signup endpoint to create new users:
-- curl -X POST http://localhost:4000/auth/signup -H "Content-Type: application/json" -d '{"email":"john.doe@example.com","password":"password123","full_name":"John Doe","phone":"123-456-7890","user_type":"rider"}'
-- curl -X POST http://localhost:4000/auth/signup -H "Content-Type: application/json" -d '{"email":"jane.driver@example.com","password":"password123","full_name":"Jane Driver","phone":"098-765-4321","user_type":"driver"}'
