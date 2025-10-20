-- ============================================================================
-- CLEANUP SCRIPT: Remove Duplicate Practical Assessments
-- ============================================================================
-- This script deletes all practical assessment data and prepares for a clean
-- migration 008 run. Use this if migration 008 was run multiple times.
--
-- INSTRUCTIONS:
-- 1. Run this script in Supabase SQL Editor
-- 2. Then run migration 008_seed_practical_assessments.sql ONCE
-- ============================================================================

-- Delete all practical skill results (student data)
DELETE FROM practical_skill_results;

-- Delete all practical scenario results (student data)
DELETE FROM practical_scenario_results;

-- Delete all practical attempts (student data)
DELETE FROM practical_attempts;

-- Delete all practical skills (template data)
DELETE FROM practical_skills;

-- Delete all practical scenarios (template data)
DELETE FROM practical_scenarios;

-- Delete all practical assessments (template data)
DELETE FROM practical_assessments;

-- Verify deletion
SELECT
  (SELECT COUNT(*) FROM practical_assessments) as assessments_count,
  (SELECT COUNT(*) FROM practical_scenarios) as scenarios_count,
  (SELECT COUNT(*) FROM practical_skills) as skills_count,
  (SELECT COUNT(*) FROM practical_attempts) as attempts_count,
  (SELECT COUNT(*) FROM practical_skill_results) as skill_results_count,
  (SELECT COUNT(*) FROM practical_scenario_results) as scenario_results_count;

-- Expected result: All counts should be 0
