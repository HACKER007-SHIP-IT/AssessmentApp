-- Migration 015: Fix infinite recursion in organization_users RLS policies
-- The original policy in 005_organizations_multi_user.sql has infinite recursion
-- because it queries organization_users from within the organization_users policy

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view org members" ON organization_users;

-- Replace with simple, non-recursive policy
-- Users can only see their own membership record
CREATE POLICY "Users can read own membership"
  ON organization_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Also ensure the organizations policy doesn't have recursion
-- Drop and recreate if needed
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;

CREATE POLICY "Users can read own organization"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON POLICY "Users can read own membership" ON organization_users IS
  'Users can view their own organization membership. Non-recursive to avoid infinite loops.';
