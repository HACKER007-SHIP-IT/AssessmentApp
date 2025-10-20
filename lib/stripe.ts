import Stripe from 'stripe'

// Initialize Stripe only if the secret key is available
// This allows the build to succeed even without Stripe configured
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  : null as any as Stripe // Type assertion for build-time compatibility

// Stripe product and price configuration
export const STRIPE_CONFIG = {
  // You'll need to create these in your Stripe dashboard and add the IDs here
  MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID || '',
  SUCCESS_URL: process.env.NEXT_PUBLIC_APP_URL + '/admin/setup?session_id={CHECKOUT_SESSION_ID}',
  CANCEL_URL: process.env.NEXT_PUBLIC_APP_URL + '/admin/sign-up?cancelled=true',
}

/**
 * Helper function to format Stripe amounts (cents to pounds)
 */
export function formatAmount(amount: number): string {
  return `£${(amount / 100).toFixed(2)}`
}

/**
 * Helper function to check if subscription is active
 */
export function isSubscriptionActive(status: string): boolean {
  return status === 'active' || status === 'trialing'
}

/**
 * Helper function to check if subscription needs attention
 */
export function needsSubscriptionAttention(status: string): boolean {
  return status === 'past_due' || status === 'cancelled' || status === 'unpaid' || status === 'inactive'
}
