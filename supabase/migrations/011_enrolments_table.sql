-- Migration 011: Enrolments Table & Trainer Console Improvements
-- Separates student enrollment from written assessment attempts
-- Adds timer support and flexible assessment workflow

-- ============================================================================
-- 1. Create enrolments table
-- ============================================================================

CREATE TABLE enrolments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitting_id UUID REFERENCES sittings(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  written_attempt_id UUID REFERENCES attempts(id) ON DELETE SET NULL,
  written_status TEXT CHECK (written_status IN ('enrolled', 'in_progress', 'submitted')) DEFAULT 'enrolled',
  practical_status TEXT CHECK (practical_status IN ('not_started', 'in_progress', 'passed', 'failed')) DEFAULT 'not_started',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(sitting_id, student_id)
);

-- Indexes for performance
CREATE INDEX idx_enrolments_sitting ON enrolments(sitting_id);
CREATE INDEX idx_enrolments_student ON enrolments(student_id);
CREATE INDEX idx_enrolments_written_attempt ON enrolments(written_attempt_id);
CREATE INDEX idx_enrolments_written_status ON enrolments(written_status);
CREATE INDEX idx_enrolments_practical_status ON enrolments(practical_status);

-- Enable RLS
ALTER TABLE enrolments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow service role all access
CREATE POLICY "Allow service role all on enrolments" ON enrolments FOR ALL USING (true);

-- ============================================================================
-- 2. Modify sittings table
-- ============================================================================

-- Add timer_end_at column for absolute timer tracking
ALTER TABLE sittings ADD COLUMN IF NOT EXISTS timer_end_at TIMESTAMPTZ;

-- FIRST: Update existing 'ready' status to 'scheduled' (BEFORE changing constraint)
UPDATE sittings SET status = 'scheduled' WHERE status = 'ready';

-- THEN: Drop old status constraint and add new one with 'scheduled' state
ALTER TABLE sittings DROP CONSTRAINT IF EXISTS sittings_status_check;
ALTER TABLE sittings ADD CONSTRAINT sittings_status_check
  CHECK (status IN ('scheduled', 'in_progress', 'closed'));

-- ============================================================================
-- 3. Backfill existing data into enrolments
-- ============================================================================

-- Create enrolments from existing attempts
INSERT INTO enrolments (sitting_id, student_id, written_attempt_id, written_status, practical_status)
SELECT
  a.sitting_id,
  a.student_id,
  a.id,
  CASE
    WHEN a.submitted_at IS NOT NULL THEN 'submitted'
    WHEN a.started_at IS NOT NULL THEN 'in_progress'
    ELSE 'enrolled'
  END,
  COALESCE(
    (SELECT
       CASE
         WHEN pa.overall_pass = true THEN 'passed'
         WHEN pa.overall_pass = false THEN 'failed'
         WHEN pa.completed_at IS NOT NULL THEN 'in_progress'
         ELSE 'not_started'
       END
     FROM practical_attempts pa
     WHERE pa.sitting_id = a.sitting_id
       AND pa.student_id = a.student_id
     LIMIT 1),
    'not_started'
  )
FROM attempts a
ON CONFLICT (sitting_id, student_id) DO NOTHING;

-- ============================================================================
-- 4. Add updated_at trigger for enrolments
-- ============================================================================

CREATE OR REPLACE FUNCTION update_enrolments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_enrolments_updated_at
  BEFORE UPDATE ON enrolments
  FOR EACH ROW
  EXECUTE FUNCTION update_enrolments_updated_at();

-- ============================================================================
-- 5. Verification queries (commented out - run manually if needed)
-- ============================================================================

-- Verify enrolments created
-- SELECT COUNT(*) as enrolments_count FROM enrolments;

-- Verify status distribution
-- SELECT written_status, practical_status, COUNT(*)
-- FROM enrolments
-- GROUP BY written_status, practical_status;

-- Verify sittings updated
-- SELECT status, COUNT(*) FROM sittings GROUP BY status;
