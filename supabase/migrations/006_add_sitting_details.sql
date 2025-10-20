-- Migration 006: Add sitting scheduling details
-- Adds fields for tracking sitting type and session scheduling

ALTER TABLE sittings
  ADD COLUMN IF NOT EXISTS sitting_type TEXT,
  ADD COLUMN IF NOT EXISTS session_date DATE,
  ADD COLUMN IF NOT EXISTS session_time TEXT;

COMMENT ON COLUMN sittings.sitting_type IS 'Course type code (FAW, EFAW, PFA) for quick reference';
COMMENT ON COLUMN sittings.session_date IS 'Scheduled date for the assessment session';
COMMENT ON COLUMN sittings.session_time IS 'Scheduled time for the assessment session (e.g., "09:00", "14:00")';

-- Add practical_assessment_id reference (will be populated by practical assessments migration)
ALTER TABLE sittings
  ADD COLUMN IF NOT EXISTS practical_assessment_id UUID REFERENCES practical_assessments(id);

COMMENT ON COLUMN sittings.practical_assessment_id IS 'Reference to practical assessment template (for combined assessments)';
