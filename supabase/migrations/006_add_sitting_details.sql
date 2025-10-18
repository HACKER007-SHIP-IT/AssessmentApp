-- Migration 006: Add sitting details columns
-- Adds columns needed for Block 6: session scheduling and sitting type tracking

-- Add new columns to sittings table
ALTER TABLE sittings
  ADD COLUMN IF NOT EXISTS sitting_type TEXT,
  ADD COLUMN IF NOT EXISTS session_date DATE,
  ADD COLUMN IF NOT EXISTS session_time TEXT;

-- Update the status check constraint to include new statuses
ALTER TABLE sittings
  DROP CONSTRAINT IF EXISTS sittings_status_check;

ALTER TABLE sittings
  ADD CONSTRAINT sittings_status_check
  CHECK (status IN ('ready', 'scheduled', 'active', 'in_progress', 'completed', 'closed'));

-- Create index for session_date for better query performance
CREATE INDEX IF NOT EXISTS idx_sittings_session_date ON sittings(session_date);
