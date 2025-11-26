#!/usr/bin/env node

/**
 * Script to create test users (rider and driver) via the API
 * Run this after the server is running and database is initialized
 */

const API_BASE = process.env.API_URL || 'http://localhost:4000';

async function createUser(email, password, fullName, phone, userType) {
  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        phone,
        user_type: userType,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Created ${userType}: ${email}`);
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Token: ${data.token.substring(0, 20)}...`);
      return data;
    } else {
      console.error(`❌ Failed to create ${userType} ${email}:`, data.error);
      return null;
    }
  } catch (err) {
    console.error(`❌ Error creating ${userType} ${email}:`, err.message);
    return null;
  }
}

async function createDriverInfo(token, vehicleData) {
  try {
    // Note: You need to implement a POST /drivers endpoint to create driver_info
    // For now, this would need to be done via SQL or a new endpoint
    console.log('⚠️  Driver info needs to be added via SQL or new endpoint');
    console.log('   Run this SQL manually:');
    console.log(`   INSERT INTO driver_info (user_id, vehicle_make, vehicle_model, vehicle_year, license_plate, vehicle_color, is_available, current_lat, current_lng)`);
    console.log(`   VALUES ((SELECT id FROM profiles WHERE full_name = '${vehicleData.driverName}'), '${vehicleData.make}', '${vehicleData.model}', ${vehicleData.year}, '${vehicleData.plate}', '${vehicleData.color}', true, ${vehicleData.lat}, ${vehicleData.lng});`);
  } catch (err) {
    console.error('❌ Error setting up driver info:', err.message);
  }
}

async function main() {
  console.log('🚀 Creating test users...\n');

  // Create rider
  const rider = await createUser(
    'john.doe@example.com',
    'password123',
    'John Doe',
    '123-456-7890',
    'rider'
  );

  console.log('');

  // Create driver
  const driver = await createUser(
    'jane.driver@example.com',
    'password123',
    'Jane Driver',
    '098-765-4321',
    'driver'
  );

  console.log('');

  if (driver) {
    await createDriverInfo(driver.token, {
      driverName: 'Jane Driver',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      plate: 'XYZ 1234',
      color: 'Blue',
      lat: -17.3895,
      lng: -66.1568,
    });
  }

  console.log('\n✨ Done! Test credentials:');
  console.log('   Rider: john.doe@example.com / password123');
  console.log('   Driver: jane.driver@example.com / password123');
}

main().catch(console.error);
