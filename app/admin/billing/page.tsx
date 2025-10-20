"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, AlertCircle, CheckCircle2, Calendar, Loader2, ArrowLeft, ExternalLink } from "lucide-react"
import { getCurrentSubscription } from "@/lib/actions/subscriptions"

interface Subscription {
  id: string
  status: string
  current_period_end: string
  cancel_at_period_end: boolean
  cancelled_at: string | null
}

export default function BillingPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    try {
      const sub = await getCurrentSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error("Failed to load subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Failed to open billing portal:", error)
      alert("Failed to open billing portal. Please try again.")
      setPortalLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-focus-green text-white">Active</Badge>
      case 'trialing':
        return <Badge className="bg-focus-blue text-white">Free Trial</Badge>
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-focus-text">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing details
        </p>
      </div>

      {subscription ? (
        <>
          {/* Subscription Status Card */}
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Current Subscription
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Monthly subscription to Focus Assessments
                  </CardDescription>
                </div>
                {getStatusBadge(subscription.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Plan</p>
                  <p className="text-lg font-semibold">Monthly Subscription</p>
                  <p className="text-sm text-muted-foreground mt-1">£29.00 / month</p>
                </div>

                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Next Billing Date</p>
                  <p className="text-lg font-semibold">
                    {formatDate(subscription.current_period_end)}
                  </p>
                  {subscription.cancel_at_period_end && (
                    <p className="text-sm text-destructive mt-1">
                      Subscription will cancel on this date
                    </p>
                  )}
                </div>
              </div>

              {subscription.status === 'trialing' && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-focus-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-focus-text">Free Trial Active</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your 14-day free trial ends on {formatDate(subscription.current_period_end)}. You won't be charged until then.
                    </p>
                  </div>
                </div>
              )}

              {subscription.status === 'past_due' && (
                <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Payment Failed</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your last payment failed. Please update your payment method to continue using Focus Assessments.
                    </p>
                  </div>
                </div>
              )}

              {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                <div className="flex items-start gap-3 p-4 bg-focus-light/50 border border-focus-green/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-focus-green flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-focus-text">Subscription Active</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your subscription is active and will automatically renew on {formatDate(subscription.current_period_end)}.
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="w-full"
                size="lg"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Opening Billing Portal...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage Billing
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You'll be redirected to our secure payment portal where you can update your payment method,
                view invoices, and manage your subscription.
              </p>
            </CardContent>
          </Card>

          {/* Features Included */}
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
              <CardDescription>Your subscription includes all features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  'Unlimited assessment sittings',
                  'Real-time trainer console',
                  'QR code generation',
                  'Detailed analytics & reports',
                  'Multi-trainer support',
                  'Automatic result calculation',
                  'Student management',
                  'Export functionality',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-focus-green flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="rounded-2xl shadow-lg border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">No Active Subscription</CardTitle>
            <CardDescription>
              You don't have an active subscription. Please contact support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/admin/sign-up")}>
              Subscribe Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
