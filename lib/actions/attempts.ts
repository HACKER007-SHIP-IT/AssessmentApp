'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { generateId } from '@/lib/utils'

export interface CreateAttemptData {
  sittingId: string
  studentName: string
}

export async function createAttempt(data: CreateAttemptData) {
  const supabase = createServiceClient()

  try {
    // 1. Create student record
    const studentId = generateId()
    const { error: studentError } = await supabase
      .from('students')
      .insert({
        id: studentId,
        name: data.studentName,
      })

    if (studentError) throw studentError

    // 2. Create attempt record
    const attemptId = generateId()
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .insert({
        id: attemptId,
        sitting_id: data.sittingId,
        student_id: studentId,
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (attemptError) throw attemptError

    return { attemptId: attempt.id }
  } catch (error) {
    console.error('Error creating attempt:', error)
    throw error
  }
}

export async function getAttempt(attemptId: string) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('attempts')
    .select(`
      *,
      student:students(
        id,
        name
      ),
      sitting:sittings(
        id,
        short_code,
        settings,
        paper:papers(
          id,
          label,
          course_type:course_types(
            code,
            name
          )
        ),
        trainer:trainers(
          name
        )
      )
    `)
    .eq('id', attemptId)
    .single()

  if (error) throw error
  return data
}

export async function submitAttempt(attemptId: string) {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('attempts')
    .update({
      submitted_at: new Date().toISOString(),
    })
    .eq('id', attemptId)

  if (error) throw error
}
