"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, Maximize, StopCircle, Copy, Check, UserCircle } from "lucide-react"
import { TRAINER_COPY, formatTimeRemaining, getTimerColorClass } from "@/lib/constants/trainer-copy"
import { cn } from "@/lib/utils"

type StickyHeaderProps = {
  courseCode: string
  courseName: string
  paperLabel: string
  shortCode: string
  status: 'scheduled' | 'in_progress' | 'closed'
  timerEndAt: string | null
  attemptCount: number
  assignedTrainer: { id: string; name: string; email: string } | null | undefined
  isOrgAdmin: boolean
  onPrintQR: () => void
  onExportCSV: () => void
  onToggleProjector: () => void
  onEndSitting: () => void
  onAssignTrainer: () => void
}

export function StickyHeader({
  courseCode,
  courseName,
  paperLabel,
  shortCode,
  status,
  timerEndAt,
  attemptCount,
  assignedTrainer,
  isOrgAdmin,
  onPrintQR,
  onExportCSV,
  onToggleProjector,
  onEndSitting,
  onAssignTrainer,
}: StickyHeaderProps) {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(timerEndAt))
  const [copied, setCopied] = useState(false)

  // Update timer every second
  useEffect(() => {
    if (!timerEndAt) {
      setTimeRemaining('--:--')
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(timerEndAt))
    }, 1000)

    return () => clearInterval(interval)
  }, [timerEndAt])

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(shortCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'scheduled':
        return TRAINER_COPY.statusWaitingRoom
      case 'in_progress':
        return TRAINER_COPY.statusWrittenInProgress
      case 'closed':
        return TRAINER_COPY.statusSittingEnded
    }
  }

  const getStatusBadgeVariant = () => {
    switch (status) {
      case 'scheduled':
        return 'outline'
      case 'in_progress':
        return 'default'
      case 'closed':
        return 'destructive'
    }
  }

  const timerColorClass = getTimerColorClass(timerEndAt)

  return (
    <div className="sticky top-0 z-50 bg-white border-b-2 shadow-sm">
      {/* Main header row */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Course info */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {courseCode} • {paperLabel}
              </h1>
              <p className="text-sm text-muted-foreground">{courseName}</p>
            </div>
          </div>

          {/* Center: Short code */}
          <div className="flex items-center gap-2">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{TRAINER_COPY.shortCode}</p>
              <p className="text-2xl font-mono font-bold tracking-wider">{shortCode}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Timer */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Time remaining</p>
            <p className={cn("text-3xl font-mono font-bold tabular-nums", timerColorClass)}>
              {timeRemaining}
            </p>
          </div>

          {/* Status */}
          <Badge variant={getStatusBadgeVariant()} className="text-sm px-3 py-1">
            {status === 'scheduled' && 'Scheduled'}
            {status === 'in_progress' && 'In Progress'}
            {status === 'closed' && 'Ended'}
          </Badge>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrintQR}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print QR
            </Button>

            {status === 'closed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleProjector}
            >
              <Maximize className="h-4 w-4 mr-2" />
              Projector
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={onEndSitting}
              disabled={attemptCount === 0 || status === 'closed'}
              className="outline outline-2 outline-red-600"
            >
              <StopCircle className="h-4 w-4 mr-2" />
              End Sitting
            </Button>
          </div>
        </div>
      </div>

      {/* Subheader */}
      <div className="px-6 py-2 bg-muted/30 border-t">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {getStatusLabel()}
          </p>

          <div className="flex items-center gap-2">
            {assignedTrainer ? (
              <>
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Trainer: <span className="font-medium text-foreground">{assignedTrainer.name}</span>
                </span>
                {isOrgAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAssignTrainer}
                    className="h-7 text-xs"
                  >
                    Change
                  </Button>
                )}
              </>
            ) : (
              <>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                  No trainer assigned
                </Badge>
                {isOrgAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAssignTrainer}
                    className="h-7"
                  >
                    <UserCircle className="h-3 w-3 mr-1" />
                    Assign Trainer
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
