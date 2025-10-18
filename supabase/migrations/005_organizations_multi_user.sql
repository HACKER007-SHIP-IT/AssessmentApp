-- Block 6: Organizations and Multi-User System
-- This migration creates the foundation for training provider organizations,
-- organization admins, and trainer users

-- Organizations (Training Provider Companies)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Organization Users (Admin accounts for training providers)
CREATE TABLE organization_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL, -- References Supabase auth.users
  role TEXT CHECK (role IN ('owner', 'admin')) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Trainer Users (Trainer accounts - assigned to sittings)
CREATE TABLE trainer_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID, -- References Supabase auth.users (nullable until they accept invite)
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- Add organization_id and assigned_trainer_id to sittings
ALTER TABLE sittings
  ADD COLUMN organization_id UUID REFERENCES organizations(id),
  ADD COLUMN assigned_trainer_id UUID REFERENCES trainer_users(id);

-- Add organization_id to students (for data isolation)
ALTER TABLE students
  ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_users_org ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_user ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_trainer_users_org ON trainer_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_trainer_users_user ON trainer_users(user_id);
CREATE INDEX IF NOT EXISTS idx_sittings_organization ON sittings(organization_id);
CREATE INDEX IF NOT EXISTS idx_sittings_assigned_trainer ON sittings(assigned_trainer_id);
CREATE INDEX IF NOT EXISTS idx_students_organization ON students(organization_id);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organizations
-- Organization owners/admins can see their own organization
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
  );

-- Only owners can update organization details
CREATE POLICY "Owners can update their organization" ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM organization_users
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- RLS Policies for Organization Users
-- Users can see members of their organization
CREATE POLICY "Users can view org members" ON organization_users
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
  );

-- Owners can insert new org users (invite admins)
CREATE POLICY "Owners can add org members" ON organization_users
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_users
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- RLS Policies for Trainer Users
-- Org admins can view their organization's trainers
CREATE POLICY "Org admins can view trainers" ON trainer_users
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid() -- Trainers can see themselves
  );

-- Org admins can create trainers
CREATE POLICY "Org admins can create trainers" ON trainer_users
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
  );

-- Org admins can update trainers
CREATE POLICY "Org admins can update trainers" ON trainer_users
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
  );

-- Update RLS policies for existing tables to respect organization boundaries

-- Sittings: Org admins see their org's sittings, trainers see assigned sittings
DROP POLICY IF EXISTS "Allow service role all on sittings" ON sittings;
CREATE POLICY "Org admins can view sittings" ON sittings
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
    OR assigned_trainer_id IN (
      SELECT id FROM trainer_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can create sittings" ON sittings
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can update sittings" ON sittings
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
  );

-- Students: Org members can see their org's students
DROP POLICY IF EXISTS "Allow service role all on students" ON students;
CREATE POLICY "Org members can view students" ON students
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can create students" ON students
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
  );

-- Attempts: Org members and trainers can view attempts for their sittings
DROP POLICY IF EXISTS "Allow service role all on attempts" ON attempts;
CREATE POLICY "Org members can view attempts" ON attempts
  FOR SELECT
  USING (
    sitting_id IN (
      SELECT id FROM sittings WHERE organization_id IN (
        SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
      )
    )
    OR sitting_id IN (
      SELECT id FROM sittings WHERE assigned_trainer_id IN (
        SELECT id FROM trainer_users WHERE user_id = auth.uid()
      )
    )
  );

-- Responses: Org members and trainers can view responses for their sittings
DROP POLICY IF EXISTS "Allow service role all on responses" ON responses;
CREATE POLICY "Org members can view responses" ON responses
  FOR SELECT
  USING (
    attempt_id IN (
      SELECT id FROM attempts WHERE sitting_id IN (
        SELECT id FROM sittings WHERE organization_id IN (
          SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Service role bypass (for server actions)
-- Note: In production, we'll use service role client which bypasses RLS
-- These policies are for when admins/trainers access data through their accounts

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_trainer_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_organizations_updated_at();

CREATE TRIGGER update_trainer_users_updated_at
  BEFORE UPDATE ON trainer_users
  FOR EACH ROW
  EXECUTE FUNCTION update_trainer_users_updated_at();
