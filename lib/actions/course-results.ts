"use server"

import { createClient } from "@/lib/supabase/server"
import { getPracticalAttemptResults, getStudentPracticalAttempt } from "./practicals"

// ============================================================================
// Types
// ============================================================================

export type CourseResult = {
  studentId: string
  studentName: string
  studentEmail: string
  written: {
    attemptId?: string
    score?: number
    totalQuestions?: number
    percentage?: number
    passed?: boolean
    completed: boolean
    submittedAt?: string
  }
  practical: {
    attemptId?: string
    passed?: boolean
    completed: boolean
    completedAt?: string
  }
  overall: {
    status: 'incomplete' | 'pass' | 'fail'
    canCertify: boolean
  }
}

// ============================================================================
// Get Individual Student's Course Result
// ============================================================================

export async function getStudentCourseResult(
  studentId: string,
  sittingId: string
): Promise<CourseResult> {
  const supabase = await createClient()

  // Get student info
  const { data: student } = await supabase
    .from('students')
    .select('id, name, email')
    .eq('id', studentId)
    .single()

  if (!student) {
    throw new Error('Student not found')
  }

  // Get written assessment result
  const { data: writtenAttempt } = await supabase
    .from('attempts')
    .select(`
      id,
      score,
      total_questions,
      submitted_at,
      sitting:sittings(
        paper:papers(
          pass_mark
        )
      )
    `)
    .eq('student_id', studentId)
    .eq('sitting_id', sittingId)
    .maybeSingle()

  // Get practical assessment result
  const practicalAttempt = await getStudentPracticalAttempt(sittingId, studentId)

  // Calculate written result
  const writtenResult = {
    attemptId: writtenAttempt?.id,
    score: writtenAttempt?.score,
    totalQuestions: writtenAttempt?.total_questions,
    percentage: writtenAttempt?.score && writtenAttempt?.total_questions
      ? Math.round((writtenAttempt.score / writtenAttempt.total_questions) * 100)
      : undefined,
    passed: writtenAttempt?.score && writtenAttempt?.total_questions && (writtenAttempt.sitting as any)?.paper?.pass_mark
      ? ((writtenAttempt.score / writtenAttempt.total_questions) * 100) >= (writtenAttempt.sitting as any).paper.pass_mark
      : undefined,
    completed: !!writtenAttempt?.submitted_at,
    submittedAt: writtenAttempt?.submitted_at,
  }

  // Calculate practical result
  const practicalResult = {
    attemptId: practicalAttempt?.id,
    passed: practicalAttempt?.overall_pass,
    completed: !!practicalAttempt?.completed_at,
    completedAt: practicalAttempt?.completed_at,
  }

  // Calculate overall result
  let overallStatus: 'incomplete' | 'pass' | 'fail' = 'incomplete'
  let canCertify = false

  if (writtenResult.completed && practicalResult.completed) {
    if (writtenResult.passed && practicalResult.passed) {
      overallStatus = 'pass'
      canCertify = true
    } else {
      overallStatus = 'fail'
      canCertify = false
    }
  }

  return {
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    written: writtenResult,
    practical: practicalResult,
    overall: {
      status: overallStatus,
      canCertify,
    },
  }
}

// ============================================================================
// Get All Students' Course Results for a Sitting
// ============================================================================

export async function getSittingCombinedResults(
  sittingId: string
): Promise<CourseResult[]> {
  const supabase = await createClient()

  // Get all students who have attempts in this sitting
  const { data: attempts } = await supabase
    .from('attempts')
    .select('student_id, student:students(id, name, email)')
    .eq('sitting_id', sittingId)

  if (!attempts || attempts.length === 0) {
    return []
  }

  // Get unique students
  const uniqueStudentIds = Array.from(new Set(attempts.map(a => a.student_id)))

  // Get course results for each student
  const results = await Promise.all(
    uniqueStudentIds.map(studentId =>
      getStudentCourseResult(studentId, sittingId)
    )
  )

  return results
}

// ============================================================================
// Check if Student Can Be Certified
// ============================================================================

export async function canIssueCertificate(
  studentId: string,
  sittingId: string
): Promise<boolean> {
  const result = await getStudentCourseResult(studentId, sittingId)
  return result.overall.canCertify
}

// ============================================================================
// Get Sitting Summary Statistics
// ============================================================================

export async function getSittingSummaryStats(sittingId: string) {
  const results = await getSittingCombinedResults(sittingId)

  const totalStudents = results.length
  const completedBoth = results.filter(r =>
    r.written.completed && r.practical.completed
  ).length
  const overallPassed = results.filter(r =>
    r.overall.status === 'pass'
  ).length
  const overallFailed = results.filter(r =>
    r.overall.status === 'fail'
  ).length
  const incomplete = results.filter(r =>
    r.overall.status === 'incomplete'
  ).length

  const overallPassRate = completedBoth > 0
    ? Math.round((overallPassed / completedBoth) * 100)
    : 0

  return {
    totalStudents,
    completedBoth,
    overallPassed,
    overallFailed,
    incomplete,
    overallPassRate,
  }
}

// ============================================================================
// Export Results to CSV Format
// ============================================================================

export async function exportSittingResultsCSV(sittingId: string): Promise<string> {
  const results = await getSittingCombinedResults(sittingId)

  // CSV header
  const header = [
    'Student Name',
    'Email',
    'Written Score',
    'Written Percentage',
    'Written Status',
    'Practical Status',
    'Overall Result',
    'Can Certify'
  ].join(',')

  // CSV rows
  const rows = results.map(r => [
    `"${r.studentName}"`,
    `"${r.studentEmail}"`,
    r.written.score !== undefined ? `${r.written.score}/${r.written.totalQuestions}` : 'Not Completed',
    r.written.percentage !== undefined ? `${r.written.percentage}%` : '',
    r.written.passed ? 'Pass' : (r.written.completed ? 'Fail' : 'Not Completed'),
    r.practical.passed ? 'Pass' : (r.practical.completed ? 'Fail' : 'Not Completed'),
    r.overall.status === 'pass' ? 'PASS' : (r.overall.status === 'fail' ? 'FAIL' : 'INCOMPLETE'),
    r.overall.canCertify ? 'Yes' : 'No'
  ].join(','))

  return [header, ...rows].join('\n')
}
