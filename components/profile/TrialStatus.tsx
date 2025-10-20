import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, AlertCircle, CheckCircle2, Users, ArrowRight } from "lucide-react"

interface TrialStatusProps {
  plan: 'trial' | 'starter' | 'team' | 'pro'
  trialDays: number | null // Days remaining (null if not on trial)
  trialEndDate: string | null
  seatsUsed: number
  seatsTotal: number
}

/**
 * TrialStatus Component
 *
 * Displays trial/subscription status with:
 * - Plan badge with color coding
 * - Days remaining for trial users
 * - Seats usage (trainers)
 * - Upgrade/manage billing CTAs
 */
export function TrialStatus({
  plan,
  trialDays,
  trialEndDate,
  seatsUsed,
  seatsTotal,
}: TrialStatusProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getPlanBadge = () => {
    switch (plan) {
      case 'trial':
        return (
          <Badge className="bg-blue-600 text-white">
            Free Trial
          </Badge>
        )
      case 'starter':
        return (
          <Badge className="bg-green-600 text-white">
            Starter Plan
          </Badge>
        )
      case 'team':
        return (
          <Badge className="bg-focus-blue text-white">
            Team Plan
          </Badge>
        )
      case 'pro':
        return (
          <Badge className="bg-purple-600 text-white">
            Pro Plan
          </Badge>
        )
      default:
        return <Badge variant="outline">{plan}</Badge>
    }
  }

  const isTrialExpired = plan === 'trial' && trialDays !== null && trialDays < 0
  const isTrialUrgent = plan === 'trial' && trialDays !== null && trialDays <= 3 && trialDays >= 0

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Subscription & Trial
            </CardTitle>
            <CardDescription className="mt-1">
              Your current plan and usage
            </CardDescription>
          </div>
          {getPlanBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trial Status - Only show for trial users */}
        {plan === 'trial' && trialDays !== null && (
          <div className={`p-4 rounded-lg border ${
            isTrialExpired
              ? 'bg-destructive/10 border-destructive/20'
              : isTrialUrgent
              ? 'bg-amber-50 border-amber-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              {isTrialExpired ? (
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                  isTrialUrgent ? 'text-amber-600' : 'text-blue-600'
                }`} />
              )}
              <div className="flex-1">
                {isTrialExpired ? (
                  <>
                    <p className="font-medium text-destructive">Trial Expired</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your trial ended on {trialEndDate && formatDate(trialEndDate)}. Please upgrade to continue using Focus Assessments.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-foreground">
                      {trialDays === 0 ? 'Trial Expires Today' : `${trialDays} ${trialDays === 1 ? 'Day' : 'Days'} Remaining`}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your trial ends on {trialEndDate && formatDate(trialEndDate)}. Upgrade anytime to continue without interruption.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Seats Usage */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Trainer Seats</p>
            </div>
            <Link
              href="/admin/trainers"
              className="text-xs text-primary hover:underline"
            >
              Manage trainers
            </Link>
          </div>
          <p className="text-lg font-medium">
            {seatsUsed} of {seatsTotal} {plan === 'trial' ? 'trial' : ''} seats in use
          </p>
          {seatsUsed >= seatsTotal && (
            <p className="text-xs text-amber-600 mt-1">
              You've reached your seat limit. Upgrade for more trainers.
            </p>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {plan === 'trial' ? (
            <Button asChild size="lg" className="w-full">
              <Link href="/onboarding/plan-selection">
                {isTrialExpired ? 'Subscribe Now' : 'Upgrade Plan'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" variant="outline" className="w-full">
              <Link href="/admin/billing">
                Manage Billing
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          )}

          {plan === 'trial' && !isTrialExpired && (
            <Button asChild size="sm" variant="ghost" className="w-full">
              <Link href="/pricing">
                View all plans
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
