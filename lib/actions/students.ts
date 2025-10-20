"use server"

import { createServiceClient } from "@/lib/supabase/service"
import { generateId } from "@/lib/utils"
import { createAttempt } from "./attempts"

export type EnrollStudentData = {
  sittingId: string
  studentName: string
}

/**
 * Enroll a student in a sitting without creating a written assessment attempt.
 * This allows trainers to control when assessments (practical/written) begin.
 */
export async function enrollStudent(data: EnrollStudentData) {
  const supabase = createServiceClient()

  try {
    // Get the sitting to retrieve organization_id
    const { data: sitting, error: sittingError } = await supabase
      .from('sittings')
      .select('organization_id')
      .eq('id', data.sittingId)
      .single()

    if (sittingError) throw sittingError
    if (!sitting) throw new Error('Sitting not found')

    // Create student record
    const studentId = generateId()
    const { error: studentError } = await supabase
      .from('students')
      .insert({
        id: studentId,
        name: data.studentName,
        organization_id: sitting.organization_id,
      })

    if (studentError) throw studentError

    return { studentId, sittingId: data.sittingId }
  } catch (error) {
    console.error('Error enrolling student:', error)
    throw error
  }
}

/**
 * Get all students enrolled in a sitting, with their attempt status.
 * Returns all students from attempts table (written assessment) for now.
 * TODO: In future, query students table directly and LEFT JOIN attempts.
 */
export async function getEnrolledStudents(sittingId: string) {
  const supabase = createServiceClient()

  try {
    // For now, get all students who have created attempts for this sitting
    // This maintains backward compatibility with existing data
    const { data: attempts, error: attemptsError } = await supabase
      .from('attempts')
      .select(`
        id,
        started_at,
        submitted_at,
        score,
        total_questions,
        pass_mark,
        passed,
        student_id,
        student:students(
          id,
          name
        )
      `)
      .eq('sitting_id', sittingId)
      .order('started_at', { ascending: false })

    if (attemptsError) throw attemptsError

    return attempts || []
  } catch (error) {
    console.error('Error fetching enrolled students:', error)
    throw error
  }
}

/**
 * Start a written assessment for an enrolled student
 */
export async function startWrittenAssessment(sittingId: string, studentId: string, studentName: string) {
  try {
    const { attemptId } = await createAttempt({
      sittingId,
      studentName,
    })

    return { attemptId }
  } catch (error) {
    console.error('Error starting written assessment:', error)
    throw error
  }
}

/**
 * Get combined written and practical results for a student
 */
export async function getCombinedStudentResults(sittingId: string, studentId: string) {
  const supabase = createServiceClient()

  try {
    // Get written assessment attempt
    const { data: writtenAttempt, error: writtenError } = await supabase
      .from('attempts')
      .select('*')
      .eq('sitting_id', sittingId)
      .eq('student_id', studentId)
      .maybeSingle()

    if (writtenError) throw writtenError

    // Get practical attempt
    const { data: practicalAttempt, error: practicalError } = await supabase
      .from('practical_attempts')
      .select('*')
      .eq('sitting_id', sittingId)
      .eq('student_id', studentId)
      .maybeSingle()

    if (practicalError) throw practicalError

    // Get student details
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name, email')
      .eq('id', studentId)
      .single()

    if (studentError) throw studentError

    // Determine overall status
    const writtenComplete = writtenAttempt?.submitted_at != null
    const writtenPassed = writtenAttempt?.passed === true
    const practicalComplete = practicalAttempt?.completed_at != null
    const practicalPassed = practicalAttempt?.overall_pass === true

    let overallStatus: 'pass' | 'fail' | 'incomplete'
    if (writtenComplete && practicalComplete) {
      overallStatus = writtenPassed && practicalPassed ? 'pass' : 'fail'
    } else {
      overallStatus = 'incomplete'
    }

    return {
      student,
      written: {
        attempt: writtenAttempt,
        completed: writtenComplete,
        passed: writtenPassed,
        score: writtenAttempt?.score || 0,
        totalQuestions: writtenAttempt?.total_questions || 0,
        passMark: writtenAttempt?.pass_mark || 0,
      },
      practical: {
        attempt: practicalAttempt,
        completed: practicalComplete,
        passed: practicalPassed,
      },
      overall: overallStatus,
    }
  } catch (error) {
    console.error('Error fetching combined student results:', error)
    throw error
  }
}
