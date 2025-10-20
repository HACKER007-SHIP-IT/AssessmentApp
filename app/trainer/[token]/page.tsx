"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { getSittingByToken } from "@/lib/actions/sittings"
import { getEnrolledStudents } from "@/lib/actions/enrolments"
import { extendTimer, lockSitting, endSitting, exportSittingCSV } from "@/lib/actions/sittings"
import { isCurrentUserOrgAdmin } from "@/lib/actions/organizations"
import { getOrganizationTrainers } from "@/lib/actions/trainers"
import { useTrainerRealtime } from "@/lib/hooks/useTrainerRealtime"
import { StickyHeader } from "@/components/trainer/StickyHeader"
import { QRPanel } from "@/components/trainer/QRPanel"
import { SummaryBar } from "@/components/trainer/SummaryBar"
import { StartAllButton } from "@/components/trainer/StartAllButton"
import { EnrolledStudentsList } from "@/components/trainer/EnrolledStudentsList"
import { ResultsPanel } from "@/components/trainer/ResultsPanel"
import { KeyboardShortcuts } from "@/components/trainer/KeyboardShortcuts"
import { ProjectorMode } from "@/components/trainer/ProjectorMode"
import { AssignTrainerDialog } from "@/components/trainer/AssignTrainerDialog"
import { AssessmentTabs } from "@/components/trainer/AssessmentTabs"
import type { EnrolledStudent } from "@/lib/actions/enrolments"

type SittingData = {
  id: string
  short_code: string
  token: string
  status: 'scheduled' | 'in_progress' | 'closed'
  timer_end_at: string | null
  settings: any
  paper: {
    label: string
    course_type: {
      id: string
      code: string
      name: string
    }
  }
  assigned_trainer?: {
    id: string
    name: string
    email: string
  } | null
}

export default function TrainerConsolePage({ params }: { params: { token: string } }) {
  const [sitting, setSitting] = useState<SittingData | null>(null)
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([])
  const [origin, setOrigin] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [projectorMode, setProjectorMode] = useState(false)
  const [isOrgAdmin, setIsOrgAdmin] = useState(false)
  const [trainers, setTrainers] = useState<any[]>([])
  const [showAssignTrainerDialog, setShowAssignTrainerDialog] = useState(false)

  // Load sitting and students
  const loadData = async () => {
    try {
      const sittingData = await getSittingByToken(params.token)
      setSitting(sittingData as SittingData)

      const students = await getEnrolledStudents(sittingData.id)
      setEnrolledStudents(students)
    } catch (err) {
      console.error("Failed to load data:", err)
      setError("Failed to load sitting data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setOrigin(window.location.origin)
    loadData()

    // Load admin status and trainers
    async function loadAdminData() {
      try {
        const adminStatus = await isCurrentUserOrgAdmin()
        setIsOrgAdmin(adminStatus)

        if (adminStatus) {
          const trainersData = await getOrganizationTrainers()
          setTrainers(trainersData.filter(t => t.is_active))
        }
      } catch (err) {
        console.error("Failed to load admin data:", err)
      }
    }
    loadAdminData()
  }, [params.token])

  // Real-time subscriptions
  useTrainerRealtime(sitting?.id || null, {
    onEnrolmentChange: loadData,
    onAttemptChange: loadData,
    onSittingChange: loadData,
  })

  // Handlers
  const handlePrintQR = () => {
    window.print()
  }

  const handleExportCSV = async () => {
    if (!sitting) return

    try {
      const { csvContent, filename } = await exportSittingCSV(sitting.id)
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export CSV')
    }
  }

  const handleToggleProjector = () => {
    setProjectorMode(!projectorMode)
  }

  const handleEndSitting = async () => {
    if (!sitting) return
    if (!confirm("End the sitting now? Students will no longer be able to submit answers.")) return

    try {
      await endSitting(sitting.id)
      await loadData()
    } catch (error) {
      console.error('Error ending sitting:', error)
      alert('Failed to end sitting')
    }
  }

  const handleExtend5 = async () => {
    if (!sitting?.timer_end_at) {
      alert('Timer has not been started yet')
      return
    }

    try {
      await extendTimer(sitting.id, 5)
      await loadData()
    } catch (error) {
      console.error('Error extending timer:', error)
      alert('Failed to extend timer')
    }
  }

  const handleExtend10 = async () => {
    if (!sitting?.timer_end_at) {
      alert('Timer has not been started yet')
      return
    }

    try {
      await extendTimer(sitting.id, 10)
      await loadData()
    } catch (error) {
      console.error('Error extending timer:', error)
      alert('Failed to extend timer')
    }
  }

  const handleLockJoins = async () => {
    if (!sitting) return
    if (!confirm("Lock joins? No more students will be able to enrol after this.")) return

    try {
      await lockSitting(sitting.id)
      await loadData()
    } catch (error) {
      console.error('Error locking joins:', error)
      alert('Failed to lock joins')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !sitting) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 border-2 border-destructive rounded-2xl">
        <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Sitting</h1>
        <p className="text-muted-foreground">{error || "Sitting not found"}</p>
      </div>
    )
  }

  const joinUrl = `${origin}/join?code=${sitting.short_code}`

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Sticky Header */}
        <StickyHeader
          courseCode={sitting.paper.course_type.code}
          courseName={sitting.paper.course_type.name}
          paperLabel={sitting.paper.label}
          shortCode={sitting.short_code}
          status={sitting.status}
          timerEndAt={sitting.timer_end_at}
          attemptCount={enrolledStudents.filter(s => s.attempt).length}
          assignedTrainer={sitting.assigned_trainer}
          isOrgAdmin={isOrgAdmin}
          onPrintQR={handlePrintQR}
          onExportCSV={handleExportCSV}
          onToggleProjector={handleToggleProjector}
          onEndSitting={handleEndSitting}
          onAssignTrainer={() => setShowAssignTrainerDialog(true)}
        />

        {/* Assessment Type Navigation */}
        <AssessmentTabs token={params.token} />

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar: QR Panel (hidden when closed) */}
            {sitting.status !== 'closed' && (
              <div className="lg:col-span-1">
                <QRPanel
                  shortCode={sitting.short_code}
                  joinUrl={joinUrl}
                  origin={origin}
                />
              </div>
            )}

            {/* Main content */}
            <div className={sitting.status !== 'closed' ? "lg:col-span-3" : "lg:col-span-4"}>
              {sitting.status === 'closed' ? (
                <ResultsPanel students={enrolledStudents} sittingId={sitting.id} />
              ) : (
                <>
                  <SummaryBar students={enrolledStudents} />
                  <StartAllButton
                    sittingId={sitting.id}
                    enrolledCount={enrolledStudents.filter(s => s.written_status === 'enrolled').length}
                    onSuccess={loadData}
                  />
                  <EnrolledStudentsList
                    students={enrolledStudents}
                    sittingStatus={sitting.status}
                    sittingId={sitting.id}
                    token={params.token}
                    onRefresh={loadData}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <KeyboardShortcuts
        onStartAll={() => {
          // TODO: Trigger StartAllButton
        }}
        onExtend5={handleExtend5}
        onExtend10={handleExtend10}
        onLock={handleLockJoins}
        onEnd={handleEndSitting}
        onToggleProjector={handleToggleProjector}
        onShowHelp={() => {
          // TODO: Show help modal
        }}
      />

      {/* Projector mode */}
      <ProjectorMode enabled={projectorMode} />

      {/* Assign trainer dialog */}
      {sitting && (
        <AssignTrainerDialog
          open={showAssignTrainerDialog}
          onOpenChange={setShowAssignTrainerDialog}
          sittingId={sitting.id}
          currentTrainerId={sitting.assigned_trainer?.id || null}
          trainers={trainers}
          currentUserId={trainers.find(t => t.user_id)?.id}
          onSuccess={loadData}
        />
      )}
    </>
  )
}
