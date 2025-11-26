-- Clear core application tables
-- WARNING: This will remove ALL data in these tables. Use with caution.
-- Truncates dependent tables and restarts identity counters.

BEGIN;

TRUNCATE TABLE rides, driver_info, profiles, users RESTART IDENTITY CASCADE;

COMMIT;

-- Run this file with psql, or use the provided script at `scripts/clear_db.sh`.
