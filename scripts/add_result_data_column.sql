-- Add result_data column to diagnostics table
ALTER TABLE diagnostics ADD COLUMN IF NOT EXISTS result_data TEXT;

-- Update existing records to have NULL result_data (already the default)
-- This is just for completeness
UPDATE diagnostics SET result_data = NULL WHERE result_data IS NULL;
