"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Play } from "lucide-react"
import { TRAINER_COPY } from "@/lib/constants/trainer-copy"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { startWrittenForAll } from "@/lib/actions/enrolments"

type StartAllButtonProps = {
  sittingId: string
  enrolledCount: number
  onSuccess: () => void
}

export function StartAllButton({ sittingId, enrolledCount, onSuccess }: StartAllButtonProps) {
  const [isStarting, setIsStarting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleStartAll = async () => {
    setShowConfirm(false)
    setIsStarting(true)

    try {
      const result = await startWrittenForAll({ sittingId })
      console.log('Started written for all:', result)
      onSuccess()
    } catch (error) {
      console.error('Error starting written for all:', error)
      alert('Failed to start written assessments. Please try again.')
    } finally {
      setIsStarting(false)
    }
  }

  const isDisabled = enrolledCount === 0 || isStarting

  return (
    <>
      <div className="flex flex-col items-center gap-3 py-8">
        <Button
          size="lg"
          onClick={() => setShowConfirm(true)}
          disabled={isDisabled}
          className="h-16 px-12 text-lg font-bold bg-focus-blue hover:bg-focus-blue/90"
        >
          {isStarting ? (
            <>
              <Loader2 className="h-6 w-6 mr-3 animate-spin" />
              {TRAINER_COPY.startingAll(enrolledCount)}
            </>
          ) : (
            <>
              <Play className="h-6 w-6 mr-3" />
              {TRAINER_COPY.startAll}
            </>
          )}
        </Button>

        {enrolledCount === 0 && (
          <p className="text-sm text-muted-foreground">{TRAINER_COPY.noEnrolled}</p>
        )}
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start written assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              {TRAINER_COPY.startAllConfirm(enrolledCount)}
              <br /><br />
              The timer will start and students will be able to begin their written assessment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartAll}>
              Start Assessment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
