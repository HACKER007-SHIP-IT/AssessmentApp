-- Migration 014: Bulletproof Organization Creation with RPC
-- Creates a SECURITY DEFINER function that atomically creates organization + membership
-- This bypasses RLS policies and ensures both inserts succeed or fail together

-- Add created_by column to track who created the organization
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create the RPC function that creates organization and links the user
CREATE OR REPLACE FUNCTION public.create_organisation_and_membership(
  p_name TEXT,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL
)
RETURNS TABLE (organisation_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_org_id UUID;
BEGIN
  -- Check authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert organization
  INSERT INTO organizations (
    name,
    email,
    phone,
    address,
    created_by,
    plan,
    trial_end_date,
    seats,
    onboarding_completed
  )
  VALUES (
    p_name,
    p_email,
    p_phone,
    p_address,
    v_user_id,
    'trial',
    NOW() + INTERVAL '14 days',
    1,
    false
  )
  RETURNING id INTO v_org_id;

  -- Link user as owner
  INSERT INTO organization_users (organization_id, user_id, role)
  VALUES (v_org_id, v_user_id, 'owner')
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  -- Return the organization ID
  RETURN QUERY SELECT v_org_id;
END;
$$;

-- Security: Revoke public access, grant only to authenticated users
REVOKE ALL ON FUNCTION public.create_organisation_and_membership(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_organisation_and_membership(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Add RLS policies if they don't exist (for normal CRUD operations)

-- Policy: Users can read their own organizations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'organizations'
    AND policyname = 'Users can read own organization'
  ) THEN
    CREATE POLICY "Users can read own organization"
    ON organizations FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM organization_users
        WHERE organization_users.organization_id = organizations.id
        AND organization_users.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Policy: Users can read their own organization membership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'organization_users'
    AND policyname = 'Users can read own membership'
  ) THEN
    CREATE POLICY "Users can read own membership"
    ON organization_users FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
END $$;

-- Comment for documentation
COMMENT ON FUNCTION public.create_organisation_and_membership IS
  'Atomically creates an organization and links the current user as owner. Runs with SECURITY DEFINER to bypass RLS.';
