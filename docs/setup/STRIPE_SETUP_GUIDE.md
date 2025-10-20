# Stripe Subscription Setup Guide

This guide will help you set up Stripe payments for the Focus Assessments platform.

## Prerequisites

- A Stripe account (sign up at https://stripe.com)
- Access to your Stripe Dashboard
- Supabase project running

## Step 1: Run the Database Migration

1. Open Supabase Studio (your Supabase project dashboard)
2. Go to **SQL Editor**
3. Run the migration file: `supabase/migrations/010_subscription_management.sql`
4. Verify the tables were created:
   - `subscriptions`
   - Updated `organizations` table with subscription fields

## Step 2: Create Stripe Product and Price

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Products** → **Add Product**
3. Fill in the details:
   - **Name**: Focus Assessments Monthly Subscription
   - **Description**: Monthly subscription to Focus Assessments platform
   - **Pricing Model**: Recurring
   - **Price**: £29.00 GBP
   - **Billing Period**: Monthly
4. Click **Save Product**
5. Copy the **Price ID** (starts with `price_...`)

## Step 3: Get Your Stripe API Keys

### Get Secret Key:
1. In Stripe Dashboard, go to **Developers** → **API Keys**
2. Copy your **Secret key** (starts with `sk_test_...` for test mode)
3. For production, use the live secret key (starts with `sk_live_...`)

### Get Publishable Key:
1. In the same page, copy your **Publishable key** (starts with `pk_test_...`)

## Step 4: Set Up Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. Enter your webhook URL:
   - **Local development**: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) for local testing
   - **Production**: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Click **Add Endpoint**
6. Copy the **Signing Secret** (starts with `whsec_...`)

## Step 5: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_MONTHLY_PRICE_ID=price_your_price_id_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For production, use:
# STRIPE_SECRET_KEY=sk_live_your_live_secret_key
# NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Step 6: Enable Stripe Customer Portal

1. In Stripe Dashboard, go to **Settings** → **Billing** → **Customer Portal**
2. Click **Activate**
3. Configure portal settings:
   - **Allow customers to**:
     - ✅ Update payment method
     - ✅ View invoices
     - ✅ Cancel subscription
   - **Save Changes**

## Step 7: Test the Integration

### Test Mode Testing:

1. Visit `http://localhost:3000/admin/sign-up`
2. Create an account with test email
3. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
4. Complete the checkout
5. You should be redirected to organisation setup

### Test Webhook (Local Development):

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Copy the webhook signing secret from the CLI output
4. Update `STRIPE_WEBHOOK_SECRET` in `.env.local`
5. Test a payment to verify webhooks are received

## Step 8: Go Live

### Before going live:

1. Complete Stripe account verification
2. Switch to live API keys in environment variables
3. Update webhook endpoint URL to production domain
4. Test with real payment methods
5. Set up proper error monitoring

### Production Environment Variables:

```bash
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
STRIPE_MONTHLY_PRICE_ID=price_your_live_price_id
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

## User Flow After Setup

1. **New user visits** `/admin/sign-up`
2. **Creates account** with email/password
3. **Redirected to Stripe Checkout** (£29/month subscription)
4. **Completes payment**
5. **Redirected to** `/admin/setup` to create organisation
6. **After setup**, redirected to admin dashboard
7. **Full access** to all features

## Managing Subscriptions

### Users can:
- View subscription status at `/admin/billing`
- Click "Manage Billing" to open Stripe Customer Portal
- Update payment method
- View invoices
- Cancel subscription (access continues until period end)

### Admin (You) can:
- View all subscriptions in Stripe Dashboard
- Issue refunds
- Pause subscriptions
- View payment history
- Export customer data

## Troubleshooting

### Webhook not working:
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Verify webhook events are selected
- Check server logs for errors
- Use Stripe CLI for local testing

### Payment failing:
- Verify `STRIPE_MONTHLY_PRICE_ID` is correct
- Check API keys are from the same mode (test/live)
- Ensure Stripe account is activated

### Subscription not activating:
- Check webhook endpoint is receiving events
- Verify database migration ran successfully
- Check server logs for errors in webhook handler

## Support

For Stripe-specific issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For app-specific issues:
- Check server logs
- Verify environment variables
- Test webhook delivery in Stripe Dashboard
