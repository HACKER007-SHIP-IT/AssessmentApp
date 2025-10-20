import { Badge } from "@/components/ui/badge"

interface TrialBadgeProps {
  daysRemaining: number
}

/**
 * TrialBadge Component
 *
 * Displays trial countdown with color-coded urgency.
 * Days are computed server-side to avoid hydration mismatches.
 *
 * Color scheme:
 * - Blue (info): > 7 days remaining
 * - Orange (warning): 4-7 days remaining
 * - Red (urgent): 1-3 days remaining
 */
export function TrialBadge({ daysRemaining }: TrialBadgeProps) {
  if (daysRemaining < 0) return null

  // Determine urgency level
  const isUrgent = daysRemaining <= 3
  const isWarning = daysRemaining > 3 && daysRemaining <= 7
  const isInfo = daysRemaining > 7

  // Color classes based on urgency
  const colorClasses = isUrgent
    ? "bg-red-100 text-red-800 border-red-300"
    : isWarning
    ? "bg-orange-100 text-orange-800 border-orange-300"
    : "bg-blue-100 text-blue-800 border-blue-300"

  // Generate message
  const message = daysRemaining === 0
    ? "Trial expires today"
    : daysRemaining === 1
    ? "1 day remaining"
    : `${daysRemaining} days remaining`

  return (
    <Badge
      variant="outline"
      className={`${colorClasses} font-medium px-3 py-1 text-xs`}
      data-qa="trial-badge"
      aria-label={`Trial period: ${message}`}
    >
      {message}
    </Badge>
  )
}
