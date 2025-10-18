"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { UserCheck, ArrowLeft, Loader2 } from "lucide-react"
import { getSittingByShortCode } from "@/lib/actions/sittings"
import { createAttempt } from "@/lib/actions/attempts"

export default function JoinConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shortCode = searchParams.get("sc") || "UNKNOWN"

  const [studentName, setStudentName] = useState("")
  const [agreedToRules, setAgreedToRules] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSitting, setIsLoadingSitting] = useState(true)
  const [error, setError] = useState("")
  const [sittingId, setSittingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadSitting() {
      try {
        const sitting = await getSittingByShortCode(shortCode)

        // Check if sitting is closed
        if (sitting.status === 'closed') {
          setError("This assessment has ended and is no longer accepting students")
          setIsLoadingSitting(false)
          return
        }

        // Check if joins are locked
        const settings = sitting.settings || {}
        if (settings.joinsLocked) {
          setError("This assessment is no longer accepting new students")
          setIsLoadingSitting(false)
          return
        }

        setSittingId(sitting.id)
      } catch (err) {
        console.error("Failed to load sitting:", err)
        setError("Invalid or expired short code")
      } finally {
        setIsLoadingSitting(false)
      }
    }

    loadSitting()
  }, [shortCode])

  const handleStart = async () => {
    if (!studentName.trim() || !agreedToRules || !sittingId) return

    setIsSubmitting(true)
    setError("")

    try {
      const { attemptId } = await createAttempt({
        sittingId,
        studentName: studentName.trim(),
      })

      router.push(`/attempt/${attemptId}`)
    } catch (err) {
      console.error("Failed to create attempt:", err)
      setError("Failed to join assessment. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && studentName.trim() && agreedToRules) {
      handleStart()
    }
  }

  if (isLoadingSitting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            Confirm Details
          </CardTitle>
          <CardDescription>
            Joining assessment: <span className="font-mono font-bold">{shortCode}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && !sittingId && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="studentName">Your Full Name</Label>
            <Input
              id="studentName"
              type="text"
              placeholder="Enter your name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-lg h-12"
              autoFocus
              disabled={isSubmitting || !sittingId}
            />
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-medium text-sm">Assessment Rules</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Work independently without assistance</li>
              <li>Do not use external resources or materials</li>
              <li>Complete within the allocated time</li>
              <li>Submit your answers before time expires</li>
            </ul>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
            <Checkbox
              id="agree"
              checked={agreedToRules}
              onCheckedChange={(checked) => setAgreedToRules(checked === true)}
            />
            <Label
              htmlFor="agree"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I have read and agree to follow the assessment rules and understand that
              violations may result in disqualification
            </Label>
          </div>

          {error && sittingId && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleStart}
              disabled={!studentName.trim() || !agreedToRules || isSubmitting || !sittingId}
              className="flex-1 h-12 text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Start Assessment'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
