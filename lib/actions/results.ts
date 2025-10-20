'use server'

import { createServiceClient } from '@/lib/supabase/service'

/**
 * Get theory (MCQ) results for a sitting
 */
export async function getTheoryResultsForSitting(sittingId: string) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('attempts')
    .select(`
      id,
      started_at,
      submitted_at,
      score,
      total_questions,
      pass_mark,
      passed,
      student:students(
        id,
        name
      )
    `)
    .eq('sitting_id', sittingId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching theory results:', error)
    throw new Error('Failed to fetch theory results')
  }

  return data || []
}

/**
 * Get detailed question-by-question results for a specific attempt
 */
export async function getDetailedAttemptResults(attemptId: string) {
  const supabase = createServiceClient()

  // Get attempt info
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select(`
      id,
      started_at,
      submitted_at,
      score,
      total_questions,
      pass_mark,
      passed,
      student:students(
        id,
        name
      ),
      sitting:sittings(
        id,
        short_code,
        paper:papers(
          id,
          label,
          course_type:course_types(
            code,
            name
          )
        )
      )
    `)
    .eq('id', attemptId)
    .single()

  if (attemptError || !attempt) {
    throw new Error('Failed to fetch attempt')
  }

  // Get all questions for this attempt's paper
  const paperId = (attempt.sitting as any).paper.id

  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('paper_id', paperId)
    .order('question_number')

  if (questionsError) {
    throw new Error('Failed to fetch questions')
  }

  // Get student's responses
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select('question_id, selected_index')
    .eq('attempt_id', attemptId)

  if (responsesError) {
    throw new Error('Failed to fetch responses')
  }

  // Map responses by question_id
  const responsesMap: Record<string, number> = {}
  responses?.forEach(r => {
    if (r.selected_index !== null) {
      responsesMap[r.question_id] = r.selected_index
    }
  })

  // Combine questions with student answers
  const indexToLetter = ['A', 'B', 'C', 'D']
  const letterToIndex: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }

  const questionResults = questions?.map(q => {
    const studentAnswerIndex = responsesMap[q.id]
    const correctAnswerIndex = letterToIndex[q.correct_answer]
    const isCorrect = studentAnswerIndex !== undefined && studentAnswerIndex === correctAnswerIndex

    return {
      questionNumber: q.question_number,
      questionText: q.question_text,
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      correctAnswer: q.correct_answer,
      studentAnswer: studentAnswerIndex !== undefined ? indexToLetter[studentAnswerIndex] : null,
      isCorrect,
      isAnswered: studentAnswerIndex !== undefined
    }
  })

  return {
    attempt,
    questionResults: questionResults || []
  }
}

/**
 * Calculate statistics for a sitting's theory results
 */
export async function getSittingStatistics(sittingId: string) {
  const results = await getTheoryResultsForSitting(sittingId)

  const totalStudents = results.length
  const submittedStudents = results.filter(r => r.submitted_at).length
  const passedStudents = results.filter(r => r.passed).length

  const scores = results
    .filter(r => r.score !== null && r.total_questions !== null)
    .map(r => (r.score! / r.total_questions!) * 100)

  const averageScore = scores.length > 0
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0

  const passRate = submittedStudents > 0
    ? (passedStudents / submittedStudents) * 100
    : 0

  return {
    totalStudents,
    submittedStudents,
    inProgressStudents: totalStudents - submittedStudents,
    passedStudents,
    failedStudents: submittedStudents - passedStudents,
    averageScore: Math.round(averageScore),
    passRate: Math.round(passRate)
  }
}
