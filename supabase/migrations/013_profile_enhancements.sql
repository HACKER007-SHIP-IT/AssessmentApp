-- Migration 013: Profile & Organization Enhancements
-- Adds branding, billing, audit logging, and soft delete capabilities

-- ============================================================================
-- 1. Extend organizations table with new fields
-- ============================================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS brand_color TEXT CHECK (brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  ADD COLUMN IF NOT EXISTS billing_email TEXT,
  ADD COLUMN IF NOT EXISTS legal_name TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/London',
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ============================================================================
-- 2. Create organization_events table for audit logging
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID NOT NULL, -- user_id from auth.users
  action TEXT NOT NULL, -- 'update_org', 'change_plan', 'upload_logo', etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_org_events_org
  ON organization_events(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_org_events_actor
  ON organization_events(actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_organizations_deleted
  ON organizations(is_deleted)
  WHERE is_deleted = true;

-- ============================================================================
-- 4. Enable RLS on organization_events
-- ============================================================================

ALTER TABLE organization_events ENABLE ROW LEVEL SECURITY;

-- Organization members can view events for their organization
CREATE POLICY "Org members can view org events" ON organization_events
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
  );

-- Service role can insert events (used by server actions)
-- Note: In production, server actions use service role which bypasses RLS

-- ============================================================================
-- 5. Update RLS policy for organizations (owner-only updates)
-- ============================================================================

-- Drop existing update policy
DROP POLICY IF EXISTS "Owners can update their organization" ON organizations;

-- Create new policy: Only owners can update, excluding deleted orgs
CREATE POLICY "Owners can update their organization" ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM organization_users
      WHERE user_id = auth.uid() AND role = 'owner'
    )
    AND is_deleted = false
  );

-- ============================================================================
-- 6. Backfill existing organizations with defaults
-- ============================================================================

UPDATE organizations
SET
  timezone = COALESCE(timezone, 'Europe/London'),
  is_deleted = COALESCE(is_deleted, false)
WHERE timezone IS NULL
   OR is_deleted IS NULL;

-- ============================================================================
-- 7. Create Supabase Storage bucket for organization logos
-- ============================================================================

-- Note: This must be run with appropriate permissions
-- Insert bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-logos', 'organization-logos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8. Storage RLS policies for organization logos
-- ============================================================================

-- Users can upload logos for their own organization (owners only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload org logos'
  ) THEN
    CREATE POLICY "Users can upload org logos"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'organization-logos' AND
      auth.uid() IN (
        SELECT user_id FROM organization_users
        WHERE role = 'owner'
      )
    );
  END IF;
END $$;

-- Anyone can view logos (public bucket)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Logos are publicly accessible'
  ) THEN
    CREATE POLICY "Logos are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'organization-logos');
  END IF;
END $$;

-- Users can delete their own organization's logos (owners only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Owners can delete org logos'
  ) THEN
    CREATE POLICY "Owners can delete org logos"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'organization-logos' AND
      auth.uid() IN (
        SELECT user_id FROM organization_users
        WHERE role = 'owner'
      )
    );
  END IF;
END $$;

-- ============================================================================
-- 9. Verification queries (for manual testing)
-- ============================================================================

-- Verify new columns added
-- SELECT
--   column_name,
--   data_type,
--   column_default
-- FROM information_schema.columns
-- WHERE table_name = 'organizations'
--   AND column_name IN ('logo_url', 'brand_color', 'billing_email', 'legal_name', 'timezone', 'is_deleted', 'deleted_at');

-- Check organization_events table
-- SELECT COUNT(*) FROM organization_events;

-- Check storage bucket
-- SELECT * FROM storage.buckets WHERE id = 'organization-logos';
