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
import { enrollStudent as enrollStudentOld } from "@/lib/actions/students"
import { enrollStudent as createEnrolment } from "@/lib/actions/enrolments"

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

        // QA: Friendly error messages with clear next steps
        // Check if sitting is closed
        if (sitting.status === 'closed') {
          setError("This assessment has ended and is no longer accepting students. Please check with your trainer if you need to join a different session.")
          setIsLoadingSitting(false)
          return
        }

        // Check if joins are locked
        const settings = sitting.settings || {}
        if (settings.joinsLocked) {
          setError("The trainer has locked this assessment. Please speak to your trainer if you believe you should have access.")
          setIsLoadingSitting(false)
          return
        }

        setSittingId(sitting.id)
      } catch (err) {
        console.error("Failed to load sitting:", err)
        // QA: More helpful error message with troubleshooting steps
        setError("We couldn't find an assessment with that code. Please check the code on your trainer's screen and try again. Remember, you can enter it with or without the course prefix (e.g., 'AB3D' or 'FAW-AB3D').")
      } finally {
        setIsLoadingSitting(false)
      }
    }

    loadSitting()
  }, [shortCode])

  const handleEnroll = async () => {
    if (!studentName.trim() || !agreedToRules || !sittingId) return

    setIsSubmitting(true)
    setError("")

    try {
      // First create the student record
      const { studentId } = await enrollStudentOld({
        sittingId,
        studentName: studentName.trim(),
      })

      // Then create the enrolment record
      await createEnrolment({
        sittingId,
        studentId,
      })

      // Redirect to thank you page
      router.push(`/join/enrolled?sc=${shortCode}&name=${encodeURIComponent(studentName.trim())}`)
    } catch (err) {
      console.error("Failed to enroll student:", err)
      setError("Failed to enroll. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && studentName.trim() && agreedToRules) {
      handleEnroll()
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

          {/* QA: Privacy notice for GDPR compliance */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              🔒 <strong>Privacy:</strong> Your name and assessment results will be stored securely and shared only with your trainer and organisation. We comply with UK GDPR regulations. Data is stored in the UK.
            </p>
          </div>

          {/* QA: Simplified checkbox label for better readability */}
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
              I agree to follow the assessment rules
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
              onClick={handleEnroll}
              disabled={!studentName.trim() || !agreedToRules || isSubmitting || !sittingId}
              className="flex-1 h-12 text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                'Enroll'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
