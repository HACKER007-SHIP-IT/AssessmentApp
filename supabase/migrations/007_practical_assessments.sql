-- Migration 007: Practical Assessments System
-- This migration adds support for practical assessments alongside theory (MCQ) assessments

-- ============================================================================
-- 1. Update sittings table to support assessment types
-- ============================================================================

ALTER TABLE sittings
  ADD COLUMN IF NOT EXISTS assessment_type TEXT DEFAULT 'theory'
  CHECK (assessment_type IN ('theory', 'practical', 'combined'));

COMMENT ON COLUMN sittings.assessment_type IS 'Type of assessment: theory (MCQ), practical (hands-on), or combined';

-- ============================================================================
-- 2. Create practical_assessments table
-- ============================================================================

CREATE TABLE IF NOT EXISTS practical_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_type_id UUID NOT NULL REFERENCES course_types(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT 'Version 1 (June 2025)',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE practical_assessments IS 'Practical assessment templates for each course type (FAW, EFAW, EPFA)';

CREATE INDEX IF NOT EXISTS idx_practical_assessments_course_type
  ON practical_assessments(course_type_id);

-- ============================================================================
-- 3. Create practical_scenarios table (e.g., CPR & AED, Choking, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS practical_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practical_assessment_id UUID NOT NULL REFERENCES practical_assessments(id) ON DELETE CASCADE,
  scenario_number INTEGER NOT NULL,
  title TEXT NOT NULL, -- e.g., "CPR & The Safe Use of an AED"
  description TEXT,
  is_optional BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE practical_scenarios IS 'Individual scenarios within a practical assessment (e.g., CPR, Choking, Wounds)';

CREATE INDEX IF NOT EXISTS idx_practical_scenarios_assessment
  ON practical_scenarios(practical_assessment_id);

-- ============================================================================
-- 4. Create practical_skills table (Learning Outcomes - LOs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS practical_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practical_scenario_id UUID NOT NULL REFERENCES practical_scenarios(id) ON DELETE CASCADE,
  lo_number TEXT NOT NULL, -- e.g., "2.1", "3.3", "4.2"
  skill_description TEXT NOT NULL,
  is_critical BOOLEAN DEFAULT false, -- Some skills may be marked as critical
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE practical_skills IS 'Individual skills/learning outcomes within each practical scenario';
COMMENT ON COLUMN practical_skills.lo_number IS 'Learning Outcome number from FAIB documentation (e.g., 2.1, 3.3)';
COMMENT ON COLUMN practical_skills.is_critical IS 'Whether this skill is critical for passing';

CREATE INDEX IF NOT EXISTS idx_practical_skills_scenario
  ON practical_skills(practical_scenario_id);

-- ============================================================================
-- 5. Create practical_attempts table
-- ============================================================================

CREATE TABLE IF NOT EXISTS practical_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitting_id UUID NOT NULL REFERENCES sittings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  overall_pass BOOLEAN,
  trainer_notes TEXT,
  assessed_by_trainer_id UUID REFERENCES trainer_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one practical attempt per student per sitting
  UNIQUE(sitting_id, student_id)
);

COMMENT ON TABLE practical_attempts IS 'Student attempts at practical assessments';
COMMENT ON COLUMN practical_attempts.overall_pass IS 'True if student passed all required scenarios';
COMMENT ON COLUMN practical_attempts.trainer_notes IS 'Overall feedback from trainer';

CREATE INDEX IF NOT EXISTS idx_practical_attempts_sitting
  ON practical_attempts(sitting_id);
CREATE INDEX IF NOT EXISTS idx_practical_attempts_student
  ON practical_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_practical_attempts_trainer
  ON practical_attempts(assessed_by_trainer_id);

-- ============================================================================
-- 6. Create practical_scenario_results table
-- ============================================================================

CREATE TABLE IF NOT EXISTS practical_scenario_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practical_attempt_id UUID NOT NULL REFERENCES practical_attempts(id) ON DELETE CASCADE,
  practical_scenario_id UUID NOT NULL REFERENCES practical_scenarios(id) ON DELETE CASCADE,
  passed BOOLEAN,
  trainer_notes TEXT,
  assessed_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one result per scenario per attempt
  UNIQUE(practical_attempt_id, practical_scenario_id)
);

COMMENT ON TABLE practical_scenario_results IS 'Pass/fail results for each scenario within a practical attempt';

CREATE INDEX IF NOT EXISTS idx_practical_scenario_results_attempt
  ON practical_scenario_results(practical_attempt_id);

-- ============================================================================
-- 7. Create practical_skill_results table
-- ============================================================================

CREATE TABLE IF NOT EXISTS practical_skill_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practical_attempt_id UUID NOT NULL REFERENCES practical_attempts(id) ON DELETE CASCADE,
  practical_skill_id UUID NOT NULL REFERENCES practical_skills(id) ON DELETE CASCADE,
  result TEXT NOT NULL CHECK (result IN ('pass', 'pass_oral', 'fail')),
  trainer_notes TEXT,
  assessed_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one result per skill per attempt
  UNIQUE(practical_attempt_id, practical_skill_id)
);

COMMENT ON TABLE practical_skill_results IS 'Individual skill results within a practical attempt';
COMMENT ON COLUMN practical_skill_results.result IS 'pass (✓), pass_oral (O - passed after oral questioning), fail (✘)';

CREATE INDEX IF NOT EXISTS idx_practical_skill_results_attempt
  ON practical_skill_results(practical_attempt_id);

-- ============================================================================
-- 8. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE practical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_scenario_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_skill_results ENABLE ROW LEVEL SECURITY;

-- Practical assessments (templates) - readable by all authenticated users
CREATE POLICY "Practical assessments are viewable by authenticated users"
  ON practical_assessments FOR SELECT
  TO authenticated
  USING (true);

-- Practical scenarios - readable by all authenticated users
CREATE POLICY "Practical scenarios are viewable by authenticated users"
  ON practical_scenarios FOR SELECT
  TO authenticated
  USING (true);

-- Practical skills - readable by all authenticated users
CREATE POLICY "Practical skills are viewable by authenticated users"
  ON practical_skills FOR SELECT
  TO authenticated
  USING (true);

-- Practical attempts - organization-scoped
CREATE POLICY "Users can view practical attempts from their organization"
  ON practical_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sittings s
      INNER JOIN trainer_users tu ON s.organization_id = tu.organization_id
      WHERE s.id = practical_attempts.sitting_id
      AND tu.user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can insert practical attempts for their organization"
  ON practical_attempts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sittings s
      INNER JOIN trainer_users tu ON s.organization_id = tu.organization_id
      WHERE s.id = sitting_id
      AND tu.user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can update practical attempts for their organization"
  ON practical_attempts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sittings s
      INNER JOIN trainer_users tu ON s.organization_id = tu.organization_id
      WHERE s.id = practical_attempts.sitting_id
      AND tu.user_id = auth.uid()
    )
  );

-- Practical scenario results - organization-scoped
CREATE POLICY "Users can view practical scenario results from their organization"
  ON practical_scenario_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practical_attempts pa
      INNER JOIN sittings s ON pa.sitting_id = s.id
      INNER JOIN trainer_users tu ON s.organization_id = tu.organization_id
      WHERE pa.id = practical_scenario_results.practical_attempt_id
      AND tu.user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can manage practical scenario results for their organization"
  ON practical_scenario_results FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practical_attempts pa
      INNER JOIN sittings s ON pa.sitting_id = s.id
      INNER JOIN trainer_users tu ON s.organization_id = tu.organization_id
      WHERE pa.id = practical_attempt_id
      AND tu.user_id = auth.uid()
    )
  );

-- Practical skill results - organization-scoped
CREATE POLICY "Users can view practical skill results from their organization"
  ON practical_skill_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practical_attempts pa
      INNER JOIN sittings s ON pa.sitting_id = s.id
      INNER JOIN trainer_users tu ON s.organization_id = tu.organization_id
      WHERE pa.id = practical_skill_results.practical_attempt_id
      AND tu.user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can manage practical skill results for their organization"
  ON practical_skill_results FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practical_attempts pa
      INNER JOIN sittings s ON pa.sitting_id = s.id
      INNER JOIN trainer_users tu ON s.organization_id = tu.organization_id
      WHERE pa.id = practical_attempt_id
      AND tu.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 9. Update sittings to link to practical assessments
-- ============================================================================

ALTER TABLE sittings
  ADD COLUMN IF NOT EXISTS practical_assessment_id UUID REFERENCES practical_assessments(id) ON DELETE SET NULL;

COMMENT ON COLUMN sittings.practical_assessment_id IS 'Link to practical assessment template (null for theory-only sittings)';

-- ============================================================================
-- Complete
-- ============================================================================
