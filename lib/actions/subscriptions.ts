'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { getCurrentUserOrganization } from './organizations'

/**
 * Get subscription details for the current user's organisation
 */
export async function getCurrentSubscription() {
  const supabase = createServiceClient()

  const orgData = await getCurrentUserOrganization()
  if (!orgData) {
    return null
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', orgData.organization.id)
    .single()

  if (error) {
    console.error('Error fetching subscription:', error)
    return null
  }

  return data
}

/**
 * Create or update subscription record after Stripe checkout
 */
export async function upsertSubscription(data: {
  organizationId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  status: string
  priceId: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
}) {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      organization_id: data.organizationId,
      stripe_subscription_id: data.stripeSubscriptionId,
      stripe_customer_id: data.stripeCustomerId,
      status: data.status,
      price_id: data.priceId,
      current_period_start: data.currentPeriodStart.toISOString(),
      current_period_end: data.currentPeriodEnd.toISOString(),
    }, {
      onConflict: 'organization_id'
    })

  if (error) {
    console.error('Error upserting subscription:', error)
    throw new Error('Failed to save subscription')
  }

  return { success: true }
}

/**
 * Update subscription status (called by webhooks)
 */
export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  status: string,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: boolean = false,
  cancelledAt?: Date
) {
  const supabase = createServiceClient()

  const updateData: any = {
    status,
    current_period_end: currentPeriodEnd.toISOString(),
    cancel_at_period_end: cancelAtPeriodEnd,
  }

  if (cancelledAt) {
    updateData.cancelled_at = cancelledAt.toISOString()
  }

  const { error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', stripeSubscriptionId)

  if (error) {
    console.error('Error updating subscription status:', error)
    throw new Error('Failed to update subscription status')
  }

  return { success: true }
}

/**
 * Check if current user has active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const orgData = await getCurrentUserOrganization()
  if (!orgData) {
    return false
  }

  const subscription = await getCurrentSubscription()
  if (!subscription) {
    return false
  }

  return subscription.status === 'active' || subscription.status === 'trialing'
}

/**
 * Create Stripe Customer Portal session
 */
export async function createCustomerPortalSession() {
  const serverSupabase = await createClient()
  const orgData = await getCurrentUserOrganization()

  if (!orgData) {
    throw new Error('No organisation found')
  }

  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const subscription = await getCurrentSubscription()
  if (!subscription) {
    throw new Error('No subscription found')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing`,
  })

  return { url: session.url }
}
