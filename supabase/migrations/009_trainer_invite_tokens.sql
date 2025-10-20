-- Block 8: Trainer Magic Link Invitations
-- This migration creates a system for generating single-use magic links
-- that allow trainers to access their assigned sittings

-- Trainer Invite Tokens (for magic links)
CREATE TABLE trainer_invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES trainer_users(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_trainer_invite_tokens_token ON trainer_invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_trainer_invite_tokens_trainer ON trainer_invite_tokens(trainer_id);

-- Enable RLS
ALTER TABLE trainer_invite_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Trainer Invite Tokens
-- Org admins can view tokens for their trainers
CREATE POLICY "Org admins can view invite tokens" ON trainer_invite_tokens
  FOR SELECT
  USING (
    trainer_id IN (
      SELECT id FROM trainer_users WHERE organization_id IN (
        SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
      )
    )
  );

-- Org admins can create invite tokens for their trainers
CREATE POLICY "Org admins can create invite tokens" ON trainer_invite_tokens
  FOR INSERT
  WITH CHECK (
    trainer_id IN (
      SELECT id FROM trainer_users WHERE organization_id IN (
        SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
      )
    )
  );

-- Org admins can update tokens (mark as used)
CREATE POLICY "Org admins can update invite tokens" ON trainer_invite_tokens
  FOR UPDATE
  USING (
    trainer_id IN (
      SELECT id FROM trainer_users WHERE organization_id IN (
        SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
      )
    )
  );
