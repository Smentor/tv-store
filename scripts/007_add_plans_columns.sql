-- Add missing columns to plans table for admin management
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS max_devices INTEGER DEFAULT 1;

-- Update existing plans with default values if they are null
UPDATE plans 
SET duration_days = 30 
WHERE duration_days IS NULL;

UPDATE plans 
SET max_devices = 1 
WHERE max_devices IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN plans.duration_days IS 'Duration of the plan in days';
COMMENT ON COLUMN plans.max_devices IS 'Maximum number of devices allowed for this plan';
