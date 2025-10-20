-- Block 9: Subscription Management with Stripe
-- This migration adds subscription tracking for organisations

-- Add subscription fields to organizations table
ALTER TABLE organizations
  ADD COLUMN stripe_customer_id TEXT UNIQUE,
  ADD COLUMN subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'inactive', 'trialing')),
  ADD COLUMN subscription_id TEXT,
  ADD COLUMN current_period_end TIMESTAMPTZ;

-- Create subscriptions table for detailed tracking
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'cancelled', 'incomplete', 'trialing', 'unpaid')),
  price_id TEXT NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_organization ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON organizations(stripe_customer_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Subscriptions
-- Org owners can view their subscription
CREATE POLICY "Org owners can view subscription" ON subscriptions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Service role can manage all subscriptions (for webhook handlers)
-- Note: Service role bypasses RLS, but we add this for documentation

-- Function to update subscription updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Function to sync organization subscription status from subscriptions table
CREATE OR REPLACE FUNCTION sync_organization_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE organizations
  SET
    subscription_status = NEW.status,
    subscription_id = NEW.stripe_subscription_id,
    current_period_end = NEW.current_period_end,
    stripe_customer_id = NEW.stripe_customer_id
  WHERE id = NEW.organization_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-sync organization when subscription changes
CREATE TRIGGER sync_organization_on_subscription_update
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_organization_subscription_status();
