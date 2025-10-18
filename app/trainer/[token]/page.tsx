"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Qr } from "@/components/qr/Qr"
import { Users, Play, Clock, Lock, StopCircle, AlertCircle, CheckCircle2, Activity, Loader2, ArrowLeft } from "lucide-react"
import { getSittingByToken, getAttemptsBySittingId, startSitting, extendSitting, lockSitting, endSitting } from "@/lib/actions/sittings"
import { createClient } from "@/lib/supabase/client"

interface SittingData {
  id: string
  short_code: string
  token: string
  settings: any
  status: string
  paper: {
    label: string
    course_type: {
      code: string
      name: string
    }
  }
  assigned_trainer?: {
    name: string
    email: string
  } | null
}

interface AttemptData {
  id: string
  started_at: string
  submitted_at: string | null
  score: number | null
  total_questions: number | null
  pass_mark: number | null
  passed: boolean | null
  student: {
    name: string
  }
}

export default function TrainerPage({ params }: { params: { token: string } }) {
  const [sittingData, setSittingData] = useState<SittingData | null>(null)
  const [attempts, setAttempts] = useState<AttemptData[]>([])
  const [origin, setOrigin] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)

    async function loadSitting() {
      try {
        const sitting = await getSittingByToken(params.token)
        setSittingData(sitting)

        const attemptsList = await getAttemptsBySittingId(sitting.id)
        setAttempts(attemptsList)
      } catch (err) {
        console.error("Failed to load sitting:", err)
        setError("Failed to load sitting data")
      } finally {
        setLoading(false)
      }
    }

    loadSitting()
  }, [params.token])

  // Subscribe to real-time updates for attempts
  useEffect(() => {
    if (!sittingData) return

    const supabase = createClient()

    const channel = supabase
      .channel(`sitting:${sittingData.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attempts',
          filter: `sitting_id=eq.${sittingData.id}`
        },
        async () => {
          // Refresh attempts list when changes occur
          const attemptsList = await getAttemptsBySittingId(sittingData.id)
          setAttempts(attemptsList)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sittingData])

  const handleStart = async () => {
    if (!sittingData) return
    setIsProcessing(true)
    try {
      await startSitting(sittingData.id)
      // Refresh sitting data
      const updated = await getSittingByToken(params.token)
      setSittingData(updated)
    } catch (err) {
      console.error("Failed to start sitting:", err)
      alert("Failed to start sitting. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExtend = async () => {
    if (!sittingData) return
    setIsProcessing(true)
    try {
      const result = await extendSitting(sittingData.id, 5)
      // Refresh sitting data
      const updated = await getSittingByToken(params.token)
      setSittingData(updated)
      alert(`Duration extended to ${result.newDuration} minutes`)
    } catch (err) {
      console.error("Failed to extend sitting:", err)
      alert("Failed to extend sitting. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLock = async () => {
    if (!sittingData) return
    if (!confirm("Are you sure you want to lock joins? No more students will be able to join.")) return

    setIsProcessing(true)
    try {
      await lockSitting(sittingData.id)
      // Refresh sitting data
      const updated = await getSittingByToken(params.token)
      setSittingData(updated)
      alert("Joins locked successfully")
    } catch (err) {
      console.error("Failed to lock sitting:", err)
      alert("Failed to lock sitting. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEnd = async () => {
    if (!sittingData) return
    if (!confirm("Are you sure you want to end this sitting? All unsubmitted assessments will be automatically submitted.")) return

    setIsProcessing(true)
    try {
      await endSitting(sittingData.id)
      // Refresh sitting data
      const updated = await getSittingByToken(params.token)
      setSittingData(updated)
      alert("Sitting ended successfully")
    } catch (err) {
      console.error("Failed to end sitting:", err)
      alert("Failed to end sitting. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !sittingData) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card className="rounded-2xl shadow-lg border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Sitting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error || "Sitting not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const joinUrl = `${origin}/join?code=${sittingData.short_code}`
  const settings = sittingData.settings || {}
  const joinsLocked = settings.joinsLocked || false
  const isReady = sittingData.status === 'ready'
  const isInProgress = sittingData.status === 'in_progress'
  const isClosed = sittingData.status === 'closed'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/sittings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sittings
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Trainer Console</h1>
        <p className="text-muted-foreground mt-1">
          {sittingData.paper.course_type.name} - {sittingData.paper.label}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Code & Join Info */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Join Information
            </CardTitle>
            <CardDescription>Students scan or enter code to join</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Qr value={joinUrl} size={200} />
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Short Code</p>
                <p className="text-3xl font-bold tracking-wider mt-1">{sittingData.short_code}</p>
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center text-sm">
              <p className="text-muted-foreground">Students visit:</p>
              <p className="font-mono text-xs mt-1">{origin}/join</p>
            </div>
          </CardContent>
        </Card>

        {/* Sitting Details */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Sitting Details</CardTitle>
            <CardDescription>Assessment configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Course</span>
              <span className="font-medium">{sittingData.paper.course_type.code}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Paper</span>
              <span className="font-medium">{sittingData.paper.label}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Duration</span>
              <span className="font-medium">{settings.duration || 45} minutes</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Trainer</span>
              <span className="font-medium">{sittingData.assigned_trainer?.name || "Not assigned"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Randomise Questions</span>
              <span className="font-medium">{settings.randomiseQuestions ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-muted-foreground">Randomise Answers</span>
              <span className="font-medium">{settings.randomiseAnswers ? "Yes" : "No"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Session Controls
            {isReady && <span className="text-sm font-normal text-muted-foreground">(Ready to start)</span>}
            {isInProgress && <span className="text-sm font-normal text-green-600">(In Progress)</span>}
            {isClosed && <span className="text-sm font-normal text-red-600">(Closed)</span>}
          </CardTitle>
          <CardDescription>Manage the assessment sitting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={handleStart}
              disabled={!isReady || isProcessing || isClosed}
              className="h-20 flex-col gap-2"
              size="lg"
            >
              {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Play className="h-6 w-6" />}
              <span>Start</span>
            </Button>
            <Button
              onClick={handleExtend}
              disabled={!isInProgress || isProcessing || isClosed}
              variant="outline"
              className="h-20 flex-col gap-2"
              size="lg"
            >
              {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Clock className="h-6 w-6" />}
              <span>Extend +5m</span>
            </Button>
            <Button
              onClick={handleLock}
              disabled={joinsLocked || isClosed || isProcessing}
              variant="outline"
              className="h-20 flex-col gap-2"
              size="lg"
            >
              {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Lock className="h-6 w-6" />}
              <span>{joinsLocked ? 'Locked' : 'Lock Joins'}</span>
            </Button>
            <Button
              onClick={handleEnd}
              disabled={isClosed || isProcessing}
              variant="destructive"
              className="h-20 flex-col gap-2"
              size="lg"
            >
              {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <StopCircle className="h-6 w-6" />}
              <span>End</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health Check */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">System Health Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Realtime</p>
                <p className="text-xs text-muted-foreground">Not connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Storage</p>
                <p className="text-xs text-muted-foreground">OK</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Latency</p>
                <p className="text-xs text-muted-foreground">~45ms</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Joined Students
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {attempts.length} {attempts.length === 1 ? 'student' : 'students'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Waiting for students to join...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Share the QR code or short code above
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {attempts.map((attempt) => {
                const scorePercentage = attempt.total_questions && attempt.score !== null
                  ? Math.round((attempt.score / attempt.total_questions) * 100)
                  : null

                const startTime = new Date(attempt.started_at)
                const endTime = attempt.submitted_at ? new Date(attempt.submitted_at) : null
                const durationMs = endTime ? endTime.getTime() - startTime.getTime() : null
                const durationMins = durationMs ? Math.floor(durationMs / 60000) : null
                const durationSecs = durationMs ? Math.floor((durationMs % 60000) / 1000) : null

                return (
                  <div
                    key={attempt.id}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      attempt.passed === true ? 'border-green-500 bg-green-50/50' :
                      attempt.passed === false ? 'border-red-500 bg-red-50/50' :
                      'border-blue-500 bg-blue-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`h-3 w-3 rounded-full mt-1 ${
                          attempt.passed === true ? 'bg-green-500' :
                          attempt.passed === false ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-semibold text-base">{attempt.student.name}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <p className="text-xs text-muted-foreground">
                              Started: {startTime.toLocaleTimeString()}
                            </p>
                            {attempt.submitted_at && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <p className="text-xs text-muted-foreground">
                                  Submitted: {endTime?.toLocaleTimeString()}
                                </p>
                              </>
                            )}
                            {durationMins !== null && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <p className="text-xs text-muted-foreground">
                                  Duration: {durationMins}m {durationSecs}s
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {attempt.submitted_at ? (
                        <div className="flex flex-col items-end gap-1 ml-4">
                          {scorePercentage !== null && (
                            <div className={`px-3 py-1 rounded-full font-bold text-lg ${
                              attempt.passed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                              {scorePercentage}%
                            </div>
                          )}
                          {attempt.passed !== null && (
                            <div className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              attempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {attempt.passed ? 'PASS' : 'FAIL'}
                            </div>
                          )}
                          {attempt.score !== null && attempt.total_questions !== null && (
                            <p className="text-xs text-muted-foreground">
                              {attempt.score}/{attempt.total_questions} correct
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 ml-4">
                          <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                            In Progress
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
