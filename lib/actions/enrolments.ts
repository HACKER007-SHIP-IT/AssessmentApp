"use server"

import { createServiceClient } from "@/lib/supabase/service"
import { generateId } from "@/lib/utils"
import { revalidatePath } from "next/cache"

// ============================================================================
// Types
// ============================================================================

export type WrittenStatus = 'enrolled' | 'in_progress' | 'submitted'
export type PracticalStatus = 'not_started' | 'in_progress' | 'passed' | 'failed'

export type Enrolment = {
  id: string
  sitting_id: string
  student_id: string
  written_attempt_id: string | null
  written_status: WrittenStatus
  practical_status: PracticalStatus
  created_at: string
  updated_at: string
}

export type EnrolledStudent = {
  id: string
  enrolment_id: string
  name: string
  email: string | null
  written_status: WrittenStatus
  practical_status: PracticalStatus
  attempt: {
    id: string
    started_at: string
    submitted_at: string | null
    score: number | null
    total_questions: number | null
    pass_mark: number | null
    passed: boolean | null
  } | null
  practical_attempt: {
    id: string
    started_at: string
    completed_at: string | null
    overall_pass: boolean | null
  } | null
  created_at: string
}

// ============================================================================
// Get Enrolled Students for Sitting
// ============================================================================

export async function getEnrolledStudents(sittingId: string): Promise<EnrolledStudent[]> {
  const supabase = createServiceClient()

  // Fetch enrolments with students and written attempts
  const { data: enrolments, error } = await supabase
    .from('enrolments')
    .select(`
      id,
      student_id,
      written_attempt_id,
      written_status,
      practical_status,
      created_at,
      student:students(id, name),
      written_attempt:attempts(id, started_at, submitted_at, score, total_questions, pass_mark, passed)
    `)
    .eq('sitting_id', sittingId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching enrolled students:', error)
    throw new Error('Failed to fetch enrolled students')
  }

  // Fetch practical attempts for this sitting separately
  // (Composite join not supported by Supabase automatic relationships)
  const { data: practicalAttempts } = await supabase
    .from('practical_attempts')
    .select('id, student_id, started_at, completed_at, overall_pass')
    .eq('sitting_id', sittingId)

  // Create a map of practical attempts by student_id for quick lookup
  const practicalAttemptsMap = new Map(
    (practicalAttempts || []).map(pa => [pa.student_id, pa])
  )

  // Transform the data, matching practical attempts by student_id
  return (enrolments || []).map((enrolment: any) => ({
    id: enrolment.student.id,
    enrolment_id: enrolment.id,
    name: enrolment.student.name,
    email: null, // Students table has no email column
    written_status: enrolment.written_status,
    practical_status: enrolment.practical_status,
    attempt: enrolment.written_attempt,
    practical_attempt: practicalAttemptsMap.get(enrolment.student_id) || null,
    created_at: enrolment.created_at,
  }))
}

// ============================================================================
// Get Student Enrolment by Name (for waiting room / re-access)
// ============================================================================

export async function getStudentEnrolment(sittingId: string, studentName: string) {
  const supabase = createServiceClient()

  const { data: enrolments, error } = await supabase
    .from('enrolments')
    .select(`
      id,
      written_attempt_id,
      written_status,
      practical_status,
      student:students!inner(id, name)
    `)
    .eq('sitting_id', sittingId)
    .ilike('students.name', studentName.trim())
    .maybeSingle()

  if (error) {
    console.error('Error fetching student enrolment:', error)
    return null
  }

  if (!enrolments) {
    return null
  }

  return {
    id: enrolments.id,
    written_attempt_id: enrolments.written_attempt_id,
    written_status: enrolments.written_status,
    practical_status: enrolments.practical_status,
    student: enrolments.student,
  }
}

// ============================================================================
// Enroll Student (Idempotent)
// ============================================================================

export async function enrollStudent({
  sittingId,
  studentId,
}: {
  sittingId: string
  studentId: string
}) {
  const supabase = createServiceClient()

  // Check if already enrolled
  const { data: existing } = await supabase
    .from('enrolments')
    .select('id')
    .eq('sitting_id', sittingId)
    .eq('student_id', studentId)
    .maybeSingle()

  if (existing) {
    return { enrolmentId: existing.id, alreadyEnrolled: true }
  }

  // Create new enrolment
  const { data, error } = await supabase
    .from('enrolments')
    .insert({
      sitting_id: sittingId,
      student_id: studentId,
      written_status: 'enrolled',
      practical_status: 'not_started',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error enrolling student:', error)
    throw new Error('Failed to enroll student')
  }

  revalidatePath(`/trainer/*/practical`)
  return { enrolmentId: data.id, alreadyEnrolled: false }
}

// ============================================================================
// Start Written for Student (Idempotent - does NOT set timer)
// ============================================================================

export async function startWrittenForStudent({
  sittingId,
  studentId,
}: {
  sittingId: string
  studentId: string
}) {
  const supabase = createServiceClient()

  // Get enrolment
  const { data: enrolment, error: enrolmentError } = await supabase
    .from('enrolments')
    .select('id, written_attempt_id')
    .eq('sitting_id', sittingId)
    .eq('student_id', studentId)
    .single()

  if (enrolmentError) {
    console.error('Error fetching enrolment:', enrolmentError)
    throw new Error('Student not enrolled in this sitting')
  }

  // If attempt already exists, return it (idempotent)
  if (enrolment.written_attempt_id) {
    const { data: existingAttempt } = await supabase
      .from('attempts')
      .select('*')
      .eq('id', enrolment.written_attempt_id)
      .single()

    return { attemptId: enrolment.written_attempt_id, alreadyStarted: true, attempt: existingAttempt }
  }

  // Create new attempt
  const attemptId = generateId()
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .insert({
      id: attemptId,
      sitting_id: sittingId,
      student_id: studentId,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (attemptError) {
    console.error('Error creating attempt:', attemptError)
    throw new Error('Failed to create written attempt')
  }

  // Update enrolment
  const { error: updateError } = await supabase
    .from('enrolments')
    .update({
      written_attempt_id: attemptId,
      written_status: 'in_progress',
    })
    .eq('id', enrolment.id)

  if (updateError) {
    console.error('Error updating enrolment:', updateError)
    throw new Error('Failed to update enrolment status')
  }

  revalidatePath(`/trainer/*/practical`)
  return { attemptId, alreadyStarted: false, attempt }
}

// ============================================================================
// Start Written for All Students (Sets timer)
// ============================================================================

export async function startWrittenForAll({ sittingId }: { sittingId: string }) {
  const supabase = createServiceClient()

  // Get sitting details
  const { data: sitting, error: sittingError } = await supabase
    .from('sittings')
    .select('settings, timer_end_at')
    .eq('id', sittingId)
    .single()

  if (sittingError) {
    throw new Error('Failed to fetch sitting')
  }

  const settings = sitting.settings || {}
  const duration = settings.duration || 45

  // Get all enrolled students without written attempts
  const { data: enrolments, error: enrolmentsError } = await supabase
    .from('enrolments')
    .select('id, student_id, written_attempt_id')
    .eq('sitting_id', sittingId)
    .is('written_attempt_id', null)

  if (enrolmentsError) {
    throw new Error('Failed to fetch enrolments')
  }

  if (!enrolments || enrolments.length === 0) {
    return { count: 0, message: 'No students to start' }
  }

  // Start written for each student
  const results = await Promise.all(
    enrolments.map(enrolment =>
      startWrittenForStudent({
        sittingId,
        studentId: enrolment.student_id,
      })
    )
  )

  // Set timer_end_at if not already set
  if (!sitting.timer_end_at) {
    const timerEndAt = new Date(Date.now() + duration * 60 * 1000).toISOString()

    await supabase
      .from('sittings')
      .update({ timer_end_at: timerEndAt })
      .eq('id', sittingId)
  }

  revalidatePath(`/trainer/*/practical`)
  return { count: results.length, message: `Started written for ${results.length} students` }
}

// ============================================================================
// Mark Practical Status
// ============================================================================

export async function markPracticalStatus({
  enrolmentId,
  status,
}: {
  enrolmentId: string
  status: 'passed' | 'failed'
}) {
  const supabase = createServiceClient()

  // Check sitting not closed
  const { data: enrolment } = await supabase
    .from('enrolments')
    .select('sitting_id, sittings(status)')
    .eq('id', enrolmentId)
    .single()

  if ((enrolment?.sittings as any)?.status === 'closed') {
    throw new Error('Cannot mark practical after sitting has ended')
  }

  const { error } = await supabase
    .from('enrolments')
    .update({ practical_status: status })
    .eq('id', enrolmentId)

  if (error) {
    console.error('Error marking practical status:', error)
    throw new Error('Failed to mark practical status')
  }

  revalidatePath(`/trainer/*/practical`)
  return { success: true }
}

// ============================================================================
// Undo Practical Status
// ============================================================================

export async function undoPracticalStatus({ enrolmentId }: { enrolmentId: string }) {
  const supabase = createServiceClient()

  // Get enrolment details
  const { data: enrolment, error: fetchError } = await supabase
    .from('enrolments')
    .select('written_status, sitting_id, sittings(status)')
    .eq('id', enrolmentId)
    .single()

  if (fetchError) {
    throw new Error('Failed to fetch enrolment')
  }

  // Check sitting not closed
  if ((enrolment.sittings as any)?.status === 'closed') {
    throw new Error('Cannot undo practical after sitting has ended')
  }

  // Check written not submitted
  if (enrolment.written_status === 'submitted') {
    throw new Error("Cannot undo practical after written is submitted")
  }

  const { error } = await supabase
    .from('enrolments')
    .update({ practical_status: 'not_started' })
    .eq('id', enrolmentId)

  if (error) {
    console.error('Error undoing practical status:', error)
    throw new Error('Failed to undo practical status')
  }

  revalidatePath(`/trainer/*/practical`)
  return { success: true }
}
