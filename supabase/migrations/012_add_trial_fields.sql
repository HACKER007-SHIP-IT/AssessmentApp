-- Migration 012: Add trial and plan management fields to organisations
-- Adds trial tracking, plan tiers, and onboarding status

-- ============================================================================
-- 1. Add new columns to organisations table
-- ============================================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
  ADD COLUMN IF NOT EXISTS plan TEXT CHECK (plan IN ('trial','starter','team','pro')) DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS seats INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ============================================================================
-- 2. Backfill existing organisations
-- ============================================================================

UPDATE organizations
SET
  trial_end_date = COALESCE(trial_end_date, now() + interval '14 days'),
  plan = COALESCE(plan, 'trial'),
  seats = COALESCE(seats, 1),
  onboarding_completed = COALESCE(onboarding_completed, false),
  created_at = COALESCE(created_at, now())
WHERE trial_end_date IS NULL
   OR plan IS NULL
   OR seats IS NULL
   OR onboarding_completed IS NULL
   OR created_at IS NULL;

-- ============================================================================
-- 3. Create indexes for performance
-- ============================================================================

-- Index for trial expiry queries (only trial organizations)
CREATE INDEX IF NOT EXISTS idx_organizations_trial_end
ON organizations(trial_end_date)
WHERE plan = 'trial';

-- Index for plan lookups
CREATE INDEX IF NOT EXISTS idx_organizations_plan
ON organizations(plan);

-- Index for created_at ordering
CREATE INDEX IF NOT EXISTS idx_organizations_created
ON organizations(created_at DESC);

-- ============================================================================
-- 4. Verification queries (for manual testing)
-- ============================================================================

-- Verify columns added and backfilled
-- SELECT
--   COUNT(*) as total_orgs,
--   COUNT(trial_end_date) as with_trial,
--   COUNT(plan) as with_plan,
--   COUNT(seats) as with_seats,
--   COUNT(onboarding_completed) as with_onboarding
-- FROM organizations;

-- Check plan distribution
-- SELECT plan, COUNT(*) FROM organizations GROUP BY plan;

-- Check trial expiry dates
-- SELECT
--   name,
--   plan,
--   trial_end_date,
--   trial_end_date > now() as is_active
-- FROM organizations
-- WHERE plan = 'trial';
