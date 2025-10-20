"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { StudentSelector } from "@/components/practical/StudentSelector"
import { ScenarioCard } from "@/components/practical/ScenarioCard"
import { AssessmentTabs } from "@/components/trainer/AssessmentTabs"
import {
  getPracticalAssessmentByCourseType,
  createPracticalAttempt,
  updateSkillResult,
  deleteSkillResult,
  updateScenarioResult,
  finalizePracticalAttempt,
  getPracticalAttemptResults,
  type SkillResult,
} from "@/lib/actions/practicals"
import { getSittingByToken } from "@/lib/actions/sittings"
import { getEnrolledStudents } from "@/lib/actions/enrolments"

type PageProps = {
  params: { token: string }
}

export default function TrainerPracticalPage({ params }: PageProps) {
  const { token } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentIdFromQuery = searchParams.get('student')

  const [sitting, setSitting] = useState<any>(null)
  const [trainer, setTrainer] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>()
  const [assessment, setAssessment] = useState<any>(null)
  const [currentAttempt, setCurrentAttempt] = useState<any>(null)
  const [attemptResults, setAttemptResults] = useState<any>(null)
  const [skillResults, setSkillResults] = useState<Record<string, { result: SkillResult; notes?: string }>>({})
  const [scenarioResults, setScenarioResults] = useState<Record<string, { passed: boolean | null; notes?: string }>>({})
  const [overallNotes, setOverallNotes] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [error, setError] = useState("")

  // Load sitting and assessment data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError("")

      try {
        // Get sitting
        const sittingData = await getSittingByToken(token)
        if (!sittingData) {
          setError("Sitting not found")
          return
        }
        setSitting(sittingData)

        // Get trainer from sitting data
        if (!sittingData.assigned_trainer) {
          setError("No trainer assigned to this sitting")
          return
        }
        setTrainer(sittingData.assigned_trainer)

        // Get practical assessment template
        try {
          console.log('🔍 [DEBUG] Fetching practical assessment for course type:', {
            course_type_id: sittingData.paper.course_type.id,
            course_type_code: sittingData.paper.course_type.code,
            course_type_name: sittingData.paper.course_type.name,
          })

          const assessmentData = await getPracticalAssessmentByCourseType(
            sittingData.paper.course_type.id
          )

          console.log('✅ [DEBUG] Successfully loaded practical assessment:', {
            assessment_id: assessmentData.assessment.id,
            scenario_count: assessmentData.scenarios.length,
          })

          setAssessment(assessmentData)
        } catch (assessmentError: any) {
          console.error('❌ [DEBUG] Error loading practical assessment:', {
            error_message: assessmentError.message,
            course_type_id: sittingData.paper.course_type.id,
            full_error: assessmentError,
          })
          setError(
            assessmentError.message ||
            'Failed to load practical assessment template. Please contact your administrator.'
          )
          return
        }

        // Get students
        const studentsData = await getEnrolledStudents(sittingData.id)
        setStudents(studentsData)

        // Auto-select student from query parameter if provided
        if (studentIdFromQuery && studentsData.length > 0) {
          const student = studentsData.find(s => s.id === studentIdFromQuery)
          if (student) {
            setSelectedStudentId(studentIdFromQuery)
          } else {
            // Invalid student ID - redirect back to console
            setError("We couldn't find that student. Return to the trainer console.")
            setTimeout(() => {
              router.push(`/trainer/${token}`)
            }, 3000)
          }
        } else if (studentsData.length > 0 && !selectedStudentId) {
          // Auto-select first student if no query param and no student selected
          setSelectedStudentId(studentsData[0].id)
        }
      } catch (err: any) {
        console.error("Error loading data:", err)
        setError(err.message || "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [token])

  // Handle student selection with shallow routing
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId)
    router.push(`/trainer/${token}/practical?student=${studentId}`, { scroll: false })
  }

  // Load student's attempt when selected
  useEffect(() => {
    if (!selectedStudentId || !sitting || !trainer) return

    async function loadAttempt() {
      try {
        const student = students.find(s => s.id === selectedStudentId)
        let attempt = student?.practical_attempt

        // Create attempt if doesn't exist
        if (!attempt) {
          attempt = await createPracticalAttempt(sitting.id, selectedStudentId!, trainer.id)
        }

        setCurrentAttempt(attempt)

        // Load existing results
        const results = await getPracticalAttemptResults(attempt.id)
        setAttemptResults(results)

        // Build skill results map
        const skillMap: Record<string, { result: SkillResult; notes?: string }> = {}
        results.skillResults.forEach((sr: any) => {
          skillMap[sr.practical_skill_id] = {
            result: sr.result,
            notes: sr.trainer_notes,
          }
        })
        setSkillResults(skillMap)

        // Build scenario results map
        const scenarioMap: Record<string, { passed: boolean | null; notes?: string }> = {}
        results.scenarioResults.forEach((sr: any) => {
          scenarioMap[sr.practical_scenario_id] = {
            passed: sr.passed,
            notes: sr.trainer_notes,
          }
        })
        setScenarioResults(scenarioMap)

        // Set overall notes
        setOverallNotes(attempt.trainer_notes || "")
      } catch (err: any) {
        console.error("Error loading attempt:", err)
        setError(err.message || "Failed to load student's attempt")
      }
    }

    loadAttempt()
  }, [selectedStudentId, sitting, trainer, students])

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentAttempt && !currentAttempt.completed_at) {
        setSaveStatus("saving")
        setTimeout(() => setSaveStatus("saved"), 500)
        setTimeout(() => setSaveStatus("idle"), 2000)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [currentAttempt])

  const handleUpdateSkill = async (skillId: string, result: SkillResult, notes?: string) => {
    if (!currentAttempt) return

    try {
      setSaveStatus("saving")
      await updateSkillResult(currentAttempt.id, skillId, result, notes)
      setSkillResults(prev => ({
        ...prev,
        [skillId]: { result, notes },
      }))
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (err: any) {
      console.error("Error updating skill:", err)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  const handleClearSkill = async (skillId: string) => {
    if (!currentAttempt) return

    try {
      setSaveStatus("saving")
      await deleteSkillResult(currentAttempt.id, skillId)
      setSkillResults(prev => {
        const updated = { ...prev }
        delete updated[skillId]
        return updated
      })
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (err: any) {
      console.error("Error clearing skill:", err)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  const handleUpdateScenario = async (scenarioId: string, passed: boolean | null, notes?: string) => {
    if (!currentAttempt) return

    try {
      setSaveStatus("saving")
      await updateScenarioResult(currentAttempt.id, scenarioId, passed, notes)
      setScenarioResults(prev => ({
        ...prev,
        [scenarioId]: { passed, notes },
      }))
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (err: any) {
      console.error("Error updating scenario:", err)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  const handleFinalize = async (overallPass: boolean) => {
    if (!currentAttempt) return

    const confirmed = confirm(
      `Are you sure you want to ${overallPass ? 'PASS' : 'FAIL'} this student's practical assessment? This action will finalize the assessment.`
    )

    if (!confirmed) return

    try {
      setIsSaving(true)
      await finalizePracticalAttempt(currentAttempt.id, overallPass, overallNotes)

      // Refresh student list
      const studentsData = await getEnrolledStudents(sitting.id)
      setStudents(studentsData)

      // Clear selection to refresh
      const nextStudent = studentsData.find(s => !s.practical_attempt?.completed_at)
      if (nextStudent) {
        setSelectedStudentId(nextStudent.id)
      } else {
        setSelectedStudentId(undefined)
      }

      alert(`Student ${overallPass ? 'passed' : 'failed'} successfully!`)
    } catch (err: any) {
      console.error("Error finalizing:", err)
      alert("Failed to finalize assessment: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-focus-blue" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const selectedStudent = students.find(s => s.id === selectedStudentId)
  const isCompleted = currentAttempt?.completed_at

  return (
    <div className="min-h-screen bg-focus-grey">
      {/* Header */}
      <div className="bg-focus-gradient py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Practical Assessment Marking</h1>
              <p className="text-white/80 mt-1">
                {sitting?.paper?.course_type?.name} • <span className="font-mono">{sitting?.short_code}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {saveStatus === "saving" && (
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Saving...
                </Badge>
              )}
              {saveStatus === "saved" && (
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Type Navigation */}
      <AssessmentTabs token={token} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Student Sidebar */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>Select a student to assess</CardDescription>
              </CardHeader>
              <CardContent>
                <StudentSelector
                  students={students}
                  selectedStudentId={selectedStudentId}
                  onSelectStudent={handleSelectStudent}
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedStudent && assessment && currentAttempt ? (
              <>
                {/* Student Info */}
                <Card className="rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle>{selectedStudent.name}</CardTitle>
                    <CardDescription>{selectedStudent.email}</CardDescription>
                  </CardHeader>
                  {isCompleted && (
                    <CardContent>
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          This assessment has been completed and finalized.
                          Result: <strong>{currentAttempt.overall_pass ? "PASS" : "FAIL"}</strong>
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  )}
                </Card>

                {/* Scenarios */}
                {assessment.scenarios.map((scenario: any, index: number) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    attemptId={currentAttempt.id}
                    disabled={isCompleted}
                    defaultExpanded={index === 0}
                  />
                ))}

                {/* Overall Assessment */}
                {!isCompleted && (
                  <Card className="rounded-2xl shadow-lg border-2 border-focus-blue">
                    <CardHeader>
                      <CardTitle>Finalize Assessment</CardTitle>
                      <CardDescription>
                        Overall trainer notes and final pass/fail decision
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-focus-text mb-2 block">
                          Overall Trainer Notes
                        </label>
                        <Textarea
                          placeholder="Overall feedback for this student's practical assessment..."
                          value={overallNotes}
                          onChange={(e) => setOverallNotes(e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          size="lg"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleFinalize(true)}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          Pass Student
                        </Button>
                        <Button
                          size="lg"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleFinalize(false)}
                          disabled={isSaving}
                        >
                          Fail Student
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="rounded-2xl shadow-lg">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    Select a student from the sidebar to begin assessment
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
