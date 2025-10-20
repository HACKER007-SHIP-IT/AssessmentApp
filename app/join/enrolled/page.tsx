"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { getStudentEnrolment } from "@/lib/actions/enrolments"
import { getSittingByShortCode } from "@/lib/actions/sittings"
import { createClient } from "@/lib/supabase/client"

const POLL_INTERVAL = 15000 // 15 seconds fallback polling
const STORAGE_KEY = 'assessment_enrolment'

export default function EnrolledPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shortCode = searchParams.get("sc") || ""
  const studentName = searchParams.get("name") || ""

  const [status, setStatus] = useState<'loading' | 'waiting' | 'starting' | 'error'>('loading')
  const [error, setError] = useState("")
  const [sittingId, setSittingId] = useState<string | null>(null)
  const [enrolmentId, setEnrolmentId] = useState<string | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Store enrollment data in localStorage
  useEffect(() => {
    if (sittingId && studentName && enrolmentId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sittingId,
        studentName,
        enrolmentId,
        shortCode,
        timestamp: Date.now()
      }))
    }
  }, [sittingId, studentName, enrolmentId, shortCode])

  // Check for existing enrollment and redirect if attempt exists
  const checkEnrolment = async () => {
    if (!shortCode || !studentName) {
      setError("Missing enrollment information. Please return to the join page.")
      setStatus('error')
      return
    }

    try {
      // Get sitting details
      const sitting = await getSittingByShortCode(shortCode)
      setSittingId(sitting.id)

      // Get student's enrollment
      const enrolment = await getStudentEnrolment(sitting.id, studentName)

      if (!enrolment) {
        setError("Enrollment not found. Please return to the join page and enroll again.")
        setStatus('error')
        return
      }

      setEnrolmentId(enrolment.id)

      // If attempt already exists, redirect immediately
      if (enrolment.written_attempt_id) {
        setStatus('starting')
        router.push(`/attempt/${enrolment.written_attempt_id}`)
        return
      }

      // Otherwise, wait for trainer to start
      setStatus('waiting')
    } catch (err) {
      console.error("Failed to check enrollment:", err)
      setError("Failed to check enrollment status. Please refresh the page.")
      setStatus('error')
    }
  }

  // Initial check
  useEffect(() => {
    checkEnrolment()
  }, [shortCode, studentName])

  // Set up real-time subscription
  useEffect(() => {
    if (!enrolmentId || status !== 'waiting') return

    const supabase = createClient()

    const channel = supabase
      .channel(`enrolment:${enrolmentId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'enrolments',
        filter: `id=eq.${enrolmentId}`
      }, (payload: any) => {
        if (payload.new.written_attempt_id) {
          setStatus('starting')
          // Clear localStorage on redirect
          localStorage.removeItem(STORAGE_KEY)
          router.push(`/attempt/${payload.new.written_attempt_id}`)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enrolmentId, status, router])

  // Set up polling fallback
  useEffect(() => {
    if (!sittingId || !studentName || status !== 'waiting') return

    const pollForAttempt = async () => {
      try {
        const enrolment = await getStudentEnrolment(sittingId, studentName)
        if (enrolment?.written_attempt_id) {
          setStatus('starting')
          // Clear localStorage on redirect
          localStorage.removeItem(STORAGE_KEY)
          router.push(`/attempt/${enrolment.written_attempt_id}`)
        }
      } catch (err) {
        console.error("Polling error:", err)
      }
    }

    pollIntervalRef.current = setInterval(pollForAttempt, POLL_INTERVAL)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [sittingId, studentName, status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card className="rounded-2xl shadow-lg border-2 border-destructive">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">Enrollment Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <button
              onClick={() => router.push('/join')}
              className="text-primary hover:underline"
            >
              Return to Join Page
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'starting') {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card className="rounded-2xl shadow-lg border-2 border-green-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              Your trainer has started!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Redirecting to your assessment now...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card className="rounded-2xl shadow-lg border-2 border-blue-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            You're Enrolled!
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {studentName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm font-medium text-blue-900">
              Assessment Code
            </p>
            <p className="text-2xl font-mono font-bold text-blue-700 mt-1">
              {shortCode}
            </p>
          </div>

          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>

          <div className="space-y-3">
            <p className="text-base font-medium text-foreground">
              Waiting for your trainer to start the written assessment...
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You'll be redirected automatically when your trainer presses "Start".
            </p>
          </div>

          <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              You can close this tab – it will reopen automatically when ready. If your trainer says to start and nothing happens, tap Refresh.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
