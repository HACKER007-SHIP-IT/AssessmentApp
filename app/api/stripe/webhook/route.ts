import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import { upsertSubscription, updateSubscriptionStatus } from '@/lib/actions/subscriptions'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          ) as Stripe.Subscription

          const userId = session.metadata?.user_id
          if (!userId) {
            console.error('No user_id in session metadata')
            break
          }

          // Get or create organisation for this user
          const { data: orgUser, error: orgUserError } = await supabase
            .from('organization_users')
            .select('organization_id')
            .eq('user_id', userId)
            .single()

          let organizationId: string

          if (orgUserError || !orgUser) {
            // User hasn't created organisation yet
            // This will be handled after they complete the org setup
            console.log('User has not created organisation yet, will link subscription after setup')

            // Store the Stripe customer ID in a pending state
            // We'll need to link it when they create their organisation
            // For now, we'll store it temporarily
            break
          } else {
            organizationId = orgUser.organization_id
          }

          // Create subscription record
          await upsertSubscription({
            organizationId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            status: subscription.status,
            priceId: subscription.items.data[0].price.id,
            currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any

        await updateSubscriptionStatus(
          subscription.id,
          subscription.status,
          new Date(subscription.current_period_end * 1000),
          subscription.cancel_at_period_end,
          subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined
        )
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any

        await updateSubscriptionStatus(
          subscription.id,
          'cancelled',
          new Date(subscription.current_period_end * 1000),
          true,
          new Date()
        )
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any

        if (invoice.subscription) {
          // Mark subscription as past_due
          await updateSubscriptionStatus(
            invoice.subscription as string,
            'past_due',
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          )
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          ) as any

          // Update subscription to active if it was past_due
          await updateSubscriptionStatus(
            subscription.id,
            subscription.status,
            new Date(subscription.current_period_end * 1000)
          )
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
