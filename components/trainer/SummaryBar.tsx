"use client"

import { TRAINER_COPY } from "@/lib/constants/trainer-copy"
import type { EnrolledStudent } from "@/lib/actions/enrolments"

type SummaryBarProps = {
  students: EnrolledStudent[]
  onFilterChange?: (filter: 'all' | 'enrolled' | 'in_progress' | 'submitted') => void
}

export function SummaryBar({ students, onFilterChange }: SummaryBarProps) {
  const enrolledCount = students.filter(s => s.written_status === 'enrolled').length
  const inProgressCount = students.filter(s => s.written_status === 'in_progress').length
  const submittedCount = students.filter(s => s.written_status === 'submitted').length

  const passedCount = students.filter(s => s.attempt?.passed === true).length
  const passRate = submittedCount > 0 ? Math.round((passedCount / submittedCount) * 100) : 0

  const avgScore = submittedCount > 0
    ? Math.round(
        students
          .filter(s => s.attempt?.score != null && s.attempt?.total_questions != null)
          .reduce((sum, s) => sum + ((s.attempt!.score! / s.attempt!.total_questions!) * 100), 0) / submittedCount
      )
    : 0

  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-6">
        <button
          onClick={() => onFilterChange?.('enrolled')}
          className="text-sm hover:underline"
        >
          {TRAINER_COPY.enrolledCount(enrolledCount)}
        </button>
        <button
          onClick={() => onFilterChange?.('in_progress')}
          className="text-sm hover:underline"
        >
          {TRAINER_COPY.inProgressCount(inProgressCount)}
        </button>
        <button
          onClick={() => onFilterChange?.('submitted')}
          className="text-sm hover:underline"
        >
          {TRAINER_COPY.submittedCount(submittedCount)}
        </button>
        {submittedCount > 0 && (
          <>
            <span className="text-sm">{TRAINER_COPY.passRate(passRate)}</span>
            <span className="text-sm">{TRAINER_COPY.avgScore(avgScore)}</span>
          </>
        )}
      </div>

      {/* TODO: Add <SyncStatus /> component here */}
    </div>
  )
}
