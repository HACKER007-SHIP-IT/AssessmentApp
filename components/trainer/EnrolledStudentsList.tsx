"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users } from "lucide-react"
import { TRAINER_COPY } from "@/lib/constants/trainer-copy"
import { StudentActionMenu } from "./StudentActionMenu"
import type { EnrolledStudent } from "@/lib/actions/enrolments"
import { cn } from "@/lib/utils"

type EnrolledStudentsListProps = {
  students: EnrolledStudent[]
  sittingStatus: 'scheduled' | 'in_progress' | 'closed'
  sittingId: string
  token: string
  onRefresh: () => void
}

export function EnrolledStudentsList({
  students,
  sittingStatus,
  sittingId,
  token,
  onRefresh,
}: EnrolledStudentsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'enrolled' | 'in_progress' | 'submitted'>('all')

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = students

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.written_status === statusFilter)
    }

    // Sort by status (enrolled → in_progress → submitted), then by name
    return filtered.sort((a, b) => {
      const statusOrder = { 'enrolled': 0, 'in_progress': 1, 'submitted': 2 }
      const statusDiff = statusOrder[a.written_status] - statusOrder[b.written_status]
      if (statusDiff !== 0) return statusDiff
      return a.name.localeCompare(b.name)
    })
  }, [students, searchQuery, statusFilter])

  const getWrittenBadgeClass = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'in_progress':
        return 'bg-amber-100 text-amber-700 border-amber-300'
      case 'submitted':
        return 'bg-green-100 text-green-700 border-green-300'
      default:
        return ''
    }
  }

  const getPracticalBadgeClass = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-600 border-gray-300'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'passed':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return ''
    }
  }

  const getTimeInAttempt = (student: EnrolledStudent) => {
    if (!student.attempt || !student.attempt.started_at) return null

    const start = new Date(student.attempt.started_at)
    const end = student.attempt.submitted_at ? new Date(student.attempt.submitted_at) : new Date()
    const diff = end.getTime() - start.getTime()

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    return TRAINER_COPY.duration(minutes, seconds)
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Waiting for students to join...</p>
        <p className="text-sm text-muted-foreground mt-1">
          Share the QR code or short code above
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={TRAINER_COPY.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              statusFilter === 'all'
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('enrolled')}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              statusFilter === 'enrolled'
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Enrolled
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              statusFilter === 'in_progress'
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('submitted')}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              statusFilter === 'submitted'
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Submitted
          </button>
        </div>
      </div>

      {/* Student list */}
      <div className="space-y-2">
        {filteredStudents.map((student) => {
          const percentage = student.attempt?.score && student.attempt?.total_questions
            ? Math.round((student.attempt.score / student.attempt.total_questions) * 100)
            : null

          return (
            <div
              key={student.id}
              className={cn(
                "p-4 rounded-lg border-2 transition-all",
                student.written_status === 'submitted' && student.attempt?.passed
                  ? "border-green-200 bg-green-50/30"
                  : student.written_status === 'submitted' && !student.attempt?.passed
                  ? "border-red-200 bg-red-50/30"
                  : student.written_status === 'in_progress'
                  ? "border-blue-200 bg-blue-50/30"
                  : "border-gray-200 bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href={{
                        pathname: `/trainer/${token}/practical`,
                        query: { student: student.id }
                      }}
                      prefetch={true}
                      className="font-semibold text-base text-focus-blue hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-focus-blue/20 rounded transition-colors"
                      aria-label={`Open practical assessment for ${student.name}`}
                      title="Open practical checklist"
                    >
                      {student.name}
                    </Link>
                    <StudentActionMenu
                      student={student}
                      sittingId={sittingId}
                      sittingToken={token}
                      sittingStatus={sittingStatus}
                      onSuccess={onRefresh}
                    />
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Written:</span>
                      <Badge variant="outline" className={getWrittenBadgeClass(student.written_status)}>
                        {student.written_status === 'enrolled' && TRAINER_COPY.enrolled}
                        {student.written_status === 'in_progress' && TRAINER_COPY.inProgress}
                        {student.written_status === 'submitted' && TRAINER_COPY.submitted}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Practical:</span>
                      <Badge variant="outline" className={getPracticalBadgeClass(student.practical_status)}>
                        {student.practical_status === 'not_started' && TRAINER_COPY.notStarted}
                        {student.practical_status === 'in_progress' && TRAINER_COPY.inProgress}
                        {student.practical_status === 'passed' && TRAINER_COPY.passed}
                        {student.practical_status === 'failed' && TRAINER_COPY.failed}
                      </Badge>
                    </div>

                    {getTimeInAttempt(student) && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Time:</span>
                        <span className="text-xs font-mono">{getTimeInAttempt(student)}</span>
                      </div>
                    )}
                  </div>

                  {student.written_status === 'submitted' && percentage !== null && (
                    <div className="mt-2 flex items-center gap-3">
                      <div className={cn(
                        "px-3 py-1 rounded-full font-bold text-lg",
                        student.attempt?.passed
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      )}>
                        {percentage}%
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {student.attempt?.score}/{student.attempt?.total_questions} correct
                      </span>
                      {student.attempt && student.attempt.passed !== null && (
                        <Badge className={student.attempt.passed ? "bg-green-600" : "bg-red-600"}>
                          {student.attempt.passed ? 'PASS' : 'FAIL'}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No students match your search or filter</p>
        </div>
      )}
    </div>
  )
}
