"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertCircle, Home, LogIn, Loader2, CheckCircle2, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { getAttempt } from "@/lib/actions/attempts"
import { getQuestionsForAttempt, getResponsesForAttempt, saveResponse, calculateAndSubmitScore } from "@/lib/actions/questions"

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
  sitting: {
    short_code: string
    settings: any
    status: string
    paper: {
      label: string
      course_type: {
        code: string
        name: string
      }
    }
    trainer: {
      name: string
    }
  }
}

interface Question {
  id: string
  question_number: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

export default function AttemptPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [attempt, setAttempt] = useState<AttemptData | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  useEffect(() => {
    async function loadAttempt() {
      try {
        const data = await getAttempt(params.id)
        setAttempt(data)

        // If already submitted, don't load questions
        if (data.submitted_at) {
          setLoading(false)
          return
        }

        // Load questions and responses
        const questionsData = await getQuestionsForAttempt(params.id)
        const responsesData = await getResponsesForAttempt(params.id)

        setQuestions(questionsData)
        setResponses(responsesData)

        // Calculate time remaining
        const settings = data.sitting.settings || {}
        const durationMinutes = settings.duration || 45
        const startedAt = new Date(data.started_at)
        const now = new Date()
        const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000)
        const totalSeconds = durationMinutes * 60
        const remaining = Math.max(0, totalSeconds - elapsedSeconds)
        setTimeRemaining(remaining)

      } catch (err) {
        console.error("Failed to load attempt:", err)
        setError("Failed to load assessment")
      } finally {
        setLoading(false)
      }
    }

    loadAttempt()
  }, [params.id])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining === 0 || attempt?.submitted_at) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Time's up - auto-submit
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, attempt?.submitted_at])

  const handleAnswerChange = async (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex]

    // Update local state
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }))

    // Save to database
    setIsSaving(true)
    try {
      await saveResponse(params.id, currentQuestion.id, answer as 'A' | 'B' | 'C' | 'D')
    } catch (err) {
      console.error("Failed to save response:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!attempt || attempt.submitted_at || isSubmitting) return

    setIsSubmitting(true)

    try {
      await calculateAndSubmitScore(params.id)
      // Refresh the attempt data to show submitted state
      const updated = await getAttempt(params.id)
      setAttempt(updated)
      setTimeRemaining(0)
    } catch (err) {
      console.error("Failed to submit attempt:", err)
      setError("Failed to submit assessment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !attempt) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card className="rounded-2xl shadow-lg border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error || "Attempt not found"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const settings = attempt.sitting.settings || {}
  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = Object.keys(responses).length

  // If already submitted, show results
  if (attempt.submitted_at) {
    const scorePercentage = attempt.total_questions
      ? Math.round((attempt.score! / attempt.total_questions) * 100)
      : 0

    return (
      <div className="max-w-2xl mx-auto mt-8 space-y-6">
        {/* Header Card */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>
              {attempt.sitting.paper.course_type.name}
            </CardTitle>
            <CardDescription>
              {attempt.sitting.paper.label} • Trainer: {attempt.sitting.trainer.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">
                {attempt.student.name}
              </p>
              <p className="text-sm text-blue-800">
                Sitting Code: <span className="font-mono font-bold">{attempt.sitting.short_code}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className={`rounded-2xl shadow-lg border-2 ${attempt.passed ? 'border-green-500' : 'border-red-500'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className={`h-6 w-6 ${attempt.passed ? 'text-green-600' : 'text-red-600'}`} />
              Assessment Complete
            </CardTitle>
            <CardDescription>
              Submitted at: {new Date(attempt.submitted_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`rounded-lg p-6 text-center ${attempt.passed ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
              <p className={`text-5xl font-bold mb-2 ${attempt.passed ? 'text-green-700' : 'text-red-700'}`}>
                {scorePercentage}%
              </p>
              <p className={`text-xl font-semibold mb-4 ${attempt.passed ? 'text-green-900' : 'text-red-900'}`}>
                {attempt.passed ? 'PASS' : 'FAIL'}
              </p>
              <p className="text-sm text-muted-foreground">
                Score: {attempt.score} / {attempt.total_questions} questions correct
              </p>
              <p className="text-sm text-muted-foreground">
                Pass mark: {attempt.pass_mark}%
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/join">
                  <LogIn className="h-4 w-4 mr-2" />
                  Join Another
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Active assessment view
  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      {/* Header Card */}
      <Card className="rounded-2xl shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">
                {attempt.sitting.paper.course_type.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {attempt.sitting.paper.label} • {attempt.student.name}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-lg font-bold">{answeredCount}/{questions.length}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2">
                  <Clock className={`h-4 w-4 ${timeRemaining !== null && timeRemaining < 300 ? 'text-red-600' : 'text-muted-foreground'}`} />
                  <p className={`text-2xl font-bold tabular-nums ${timeRemaining !== null && timeRemaining < 300 ? 'text-red-600' : ''}`}>
                    {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <Card className="rounded-2xl shadow-lg">
        <CardContent className="pt-6">
          <div className="grid grid-cols-10 gap-2">
            {questions.map((q, idx) => (
              <Button
                key={q.id}
                variant={idx === currentQuestionIndex ? "default" : responses[q.id] ? "outline" : "ghost"}
                size="sm"
                onClick={() => goToQuestion(idx)}
                className={`h-10 ${responses[q.id] && idx !== currentQuestionIndex ? 'bg-green-50 border-green-500 hover:bg-green-100' : ''}`}
              >
                {q.question_number}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      {currentQuestion && (
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">
              Question {currentQuestion.question_number} of {questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted p-6">
              <p className="text-lg leading-relaxed">{currentQuestion.question_text}</p>
            </div>

            <RadioGroup
              value={responses[currentQuestion.id] || ""}
              onValueChange={handleAnswerChange}
            >
              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <div
                    key={option}
                    className={`flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors ${
                      responses[currentQuestion.id] === option ? 'bg-blue-50 border-blue-500' : ''
                    }`}
                  >
                    <RadioGroupItem value={option} id={`option-${option}`} className="mt-1" />
                    <Label htmlFor={`option-${option}`} className="flex-1 cursor-pointer text-base leading-relaxed">
                      <span className="font-semibold mr-2">{option}.</span>
                      {currentQuestion[`option_${option.toLowerCase()}` as keyof Question]}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  onClick={() => goToQuestion(currentQuestionIndex + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || answeredCount < questions.length}
                  className="min-w-32"
                  variant="default"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Assessment'
                  )}
                </Button>
              )}
            </div>

            {answeredCount < questions.length && currentQuestionIndex === questions.length - 1 && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-900">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                You must answer all questions before submitting
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
