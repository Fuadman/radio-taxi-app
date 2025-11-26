-- Add coordinate columns to rides table
ALTER TABLE rides 
ADD COLUMN IF NOT EXISTS start_lat numeric,
ADD COLUMN IF NOT EXISTS start_lng numeric,
ADD COLUMN IF NOT EXISTS end_lat numeric,
ADD COLUMN IF NOT EXISTS end_lng numeric;
