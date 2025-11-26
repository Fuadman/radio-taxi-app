#!/bin/bash

echo "🔄 Resetting and recreating test users..."

# Database connection details
export PGPASSWORD="taxi_password"
DB_HOST="localhost"
DB_PORT="5433"
DB_USER="taxi"
DB_NAME="taxi_db"

# Delete existing users
echo "🗑️  Deleting old test users..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
DELETE FROM rides;
DELETE FROM driver_info;
DELETE FROM profiles;
DELETE FROM users WHERE email IN ('john.doe@example.com', 'jane.driver@example.com');
EOF

echo ""
echo "👤 Creating rider account..."
RIDER_RESPONSE=$(curl -s -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"password123","full_name":"John Doe","phone":"123-456-7890","user_type":"rider"}')

echo "$RIDER_RESPONSE" | grep -q "token" && echo "✅ Rider created successfully" || echo "❌ Failed: $RIDER_RESPONSE"

echo ""
echo "🚗 Creating driver account..."
DRIVER_RESPONSE=$(curl -s -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.driver@example.com","password":"password123","full_name":"Jane Driver","phone":"098-765-4321","user_type":"driver"}')

echo "$DRIVER_RESPONSE" | grep -q "token" && echo "✅ Driver created successfully" || echo "❌ Failed: $DRIVER_RESPONSE"

# Extract user ID from driver response
DRIVER_USER_ID=$(echo "$DRIVER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$DRIVER_USER_ID" ]; then
  echo ""
  echo "🚙 Adding driver vehicle info..."
  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
INSERT INTO driver_info (user_id, vehicle_make, vehicle_model, vehicle_year, license_plate, vehicle_color, is_available, current_lat, current_lng)
VALUES ('$DRIVER_USER_ID', 'Toyota', 'Camry', 2020, 'XYZ 1234', 'Blue', true, -17.3895, -66.1568);
EOF
  echo "✅ Driver vehicle info added"
fi

echo ""
echo "✨ Done! Test credentials:"
echo "   📱 Rider:  john.doe@example.com / password123"
echo "   🚕 Driver: jane.driver@example.com / password123"
