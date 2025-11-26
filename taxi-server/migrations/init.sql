-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles table (one-to-one with users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  user_type text NOT NULL CHECK (user_type IN ('rider','driver')),
  full_name text NOT NULL,
  phone text NOT NULL,
  avatar_url text,
  rating numeric DEFAULT 5.0,
  total_rides integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (id) REFERENCES users (id) ON DELETE CASCADE
);

-- Driver info
CREATE TABLE IF NOT EXISTS driver_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  license_plate text,
  vehicle_color text,
  is_available boolean DEFAULT false,
  current_lat double precision,
  current_lng double precision,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_profile FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE
);

-- Rides
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL,
  driver_id uuid,
  start_location text NOT NULL,
  end_location text NOT NULL,
  ride_status text NOT NULL DEFAULT 'pending',
  fare numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT fk_rider FOREIGN KEY (rider_id) REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT fk_driver FOREIGN KEY (driver_id) REFERENCES driver_info (id) ON DELETE SET NULL
);
