"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X, Sparkles, AlertTriangle, Clock } from "lucide-react"

interface TrialBannerProps {
  trialEndDate: string
  plan?: string
}

export function TrialBanner({ trialEndDate, plan = "trial" }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  // Calculate days remaining
  const now = new Date()
  const endDate = new Date(trialEndDate)
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Don't show banner if not on trial plan
  if (plan !== "trial") {
    return null
  }

  // Don't show if dismissed (reappears on next session)
  if (dismissed) {
    return null
  }

  // Determine banner style based on days remaining
  const isUrgent = daysRemaining <= 3
  const isWarning = daysRemaining > 3 && daysRemaining <= 7
  const isInfo = daysRemaining > 7

  const getBannerStyles = () => {
    if (isUrgent) {
      return {
        container: "bg-red-50 border-red-200",
        text: "text-red-900",
        icon: AlertTriangle,
        iconColor: "text-red-600",
        button: "bg-red-600 hover:bg-red-700 text-white",
      }
    }
    if (isWarning) {
      return {
        container: "bg-orange-50 border-orange-200",
        text: "text-orange-900",
        icon: Clock,
        iconColor: "text-orange-600",
        button: "bg-orange-600 hover:bg-orange-700 text-white",
      }
    }
    return {
      container: "bg-blue-50 border-blue-200",
      text: "text-blue-900",
      icon: Sparkles,
      iconColor: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    }
  }

  const styles = getBannerStyles()
  const Icon = styles.icon

  const getMessage = () => {
    if (daysRemaining <= 0) {
      return "Your trial has expired"
    }
    if (daysRemaining === 1) {
      return "Last day of your free trial!"
    }
    return `${daysRemaining} days left in your free trial`
  }

  const getSubMessage = () => {
    if (isUrgent) {
      return "Subscribe now to keep using Focus Assessments and retain access to all your data."
    }
    if (isWarning) {
      return "Your trial is ending soon. Upgrade to continue using all features."
    }
    return "Upgrade to keep using Focus Assessments after your trial ends."
  }

  return (
    <div
      className={`relative border rounded-lg p-4 ${styles.container} mb-6 animate-in slide-in-from-top duration-300`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <Icon className={`h-6 w-6 ${styles.iconColor} flex-shrink-0 mt-0.5`} />

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className={`font-semibold ${styles.text} mb-1`}>
                {getMessage()}
              </h3>
              <p className={`text-sm ${styles.text} opacity-90`}>
                {getSubMessage()}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => setDismissed(true)}
              className={`${styles.iconColor} hover:opacity-70 transition-opacity`}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Action Button */}
          <div className="mt-4 flex gap-3">
            <Button
              asChild
              size="sm"
              className={styles.button}
            >
              <Link href="/admin/billing">
                Upgrade Now
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-current"
            >
              <Link href="/pricing">
                View Plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
