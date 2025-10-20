import { NextResponse } from 'next/server'
import { createCustomerPortalSession } from '@/lib/actions/subscriptions'

export async function POST() {
  try {
    const { url } = await createCustomerPortalSession()
    return NextResponse.json({ url })
  } catch (error: any) {
    console.error('Portal session error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
