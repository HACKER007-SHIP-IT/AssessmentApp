'use server'

import { createServiceClient } from '@/lib/supabase/service'

export interface Question {
  id: string
  paper_id: string
  question_number: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D'
}

export interface QuestionForStudent {
  id: string
  question_number: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  // Note: correct_answer is NOT included for students
}

/**
 * Get all questions for a paper (admin/trainer view - includes correct answers)
 */
export async function getQuestionsByPaperId(paperId: string): Promise<Question[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('paper_id', paperId)
    .order('question_number')

  if (error) {
    console.error('Error fetching questions:', error)
    throw new Error('Failed to fetch questions')
  }

  return data
}

/**
 * Get questions for a student (without correct answers)
 */
export async function getQuestionsForAttempt(attemptId: string): Promise<QuestionForStudent[]> {
  const supabase = createServiceClient()

  // First get the attempt to find the paper_id
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select(`
      sitting:sittings(
        paper_id
      )
    `)
    .eq('id', attemptId)
    .single()

  if (attemptError || !attempt) {
    console.error('Error fetching attempt:', attemptError)
    throw new Error('Failed to fetch attempt')
  }

  const paperId = (attempt.sitting as any).paper_id

  // Get questions without the correct_answer field
  const { data, error } = await supabase
    .from('questions')
    .select('id, question_number, question_text, option_a, option_b, option_c, option_d')
    .eq('paper_id', paperId)
    .order('question_number')

  if (error) {
    console.error('Error fetching questions:', error)
    throw new Error('Failed to fetch questions')
  }

  return data
}

/**
 * Get a student's existing responses for an attempt
 */
export async function getResponsesForAttempt(attemptId: string) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('responses')
    .select('question_id, selected_index')
    .eq('attempt_id', attemptId)

  if (error) {
    console.error('Error fetching responses:', error)
    throw new Error('Failed to fetch responses')
  }

  // Convert to a map for easy lookup, converting index to letter
  const responsesMap: Record<string, string> = {}
  const indexToLetter = ['A', 'B', 'C', 'D']
  data.forEach(response => {
    if (response.selected_index !== null && response.selected_index >= 0 && response.selected_index < 4) {
      responsesMap[response.question_id] = indexToLetter[response.selected_index]
    }
  })

  return responsesMap
}

/**
 * Save or update a student's answer to a question
 */
export async function saveResponse(
  attemptId: string,
  questionId: string,
  selectedAnswer: 'A' | 'B' | 'C' | 'D'
) {
  const supabase = createServiceClient()

  // Convert letter to index (A=0, B=1, C=2, D=3)
  const letterToIndex: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }
  const selectedIndex = letterToIndex[selectedAnswer]

  // Check if response already exists
  const { data: existing } = await supabase
    .from('responses')
    .select('id')
    .eq('attempt_id', attemptId)
    .eq('question_id', questionId)
    .single()

  if (existing) {
    // Update existing response
    const { error } = await supabase
      .from('responses')
      .update({
        selected_index: selectedIndex,
      })
      .eq('attempt_id', attemptId)
      .eq('question_id', questionId)

    if (error) {
      console.error('Error updating response:', error)
      throw new Error('Failed to update response')
    }
  } else {
    // Insert new response
    const { error } = await supabase
      .from('responses')
      .insert({
        attempt_id: attemptId,
        question_id: questionId,
        selected_index: selectedIndex,
      })

    if (error) {
      console.error('Error saving response:', error)
      throw new Error('Failed to save response')
    }
  }

  return { success: true }
}

/**
 * Calculate score when submitting an attempt
 */
export async function calculateAndSubmitScore(attemptId: string) {
  const supabase = createServiceClient()

  // Get the attempt with sitting and paper info
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select(`
      id,
      sitting:sittings(
        paper_id,
        paper:papers(
          id,
          course_type:course_types(
            default_pass_mark
          )
        )
      )
    `)
    .eq('id', attemptId)
    .single()

  if (attemptError || !attempt) {
    throw new Error('Failed to fetch attempt')
  }

  const paperId = (attempt.sitting as any).paper_id
  const passMarkPercentage = (attempt.sitting as any).paper.course_type.default_pass_mark

  // Get all questions for this paper
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, correct_answer')
    .eq('paper_id', paperId)

  if (questionsError || !questions) {
    throw new Error('Failed to fetch questions')
  }

  // Get all responses for this attempt
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select('question_id, selected_index')
    .eq('attempt_id', attemptId)

  if (responsesError) {
    throw new Error('Failed to fetch responses')
  }

  // Calculate score
  const totalQuestions = questions.length
  let correctCount = 0

  const responsesMap: Record<string, number> = {}
  responses?.forEach(r => {
    if (r.selected_index !== null) {
      responsesMap[r.question_id] = r.selected_index
    }
  })

  // Convert correct answer letter to index for comparison
  const letterToIndex: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }

  questions.forEach(question => {
    const studentAnswerIndex = responsesMap[question.id]
    const correctAnswerIndex = letterToIndex[question.correct_answer]
    if (studentAnswerIndex !== undefined && studentAnswerIndex === correctAnswerIndex) {
      correctCount++
    }
  })

  const scorePercentage = Math.round((correctCount / totalQuestions) * 100)
  const passed = scorePercentage >= passMarkPercentage

  // Update the attempt with score and submit timestamp
  const { error: updateError } = await supabase
    .from('attempts')
    .update({
      submitted_at: new Date().toISOString(),
      score: correctCount,
      total_questions: totalQuestions,
      pass_mark: passMarkPercentage,
      passed: passed,
    })
    .eq('id', attemptId)

  if (updateError) {
    throw new Error('Failed to update attempt with score')
  }

  // Update the enrolment status to 'submitted'
  const { data: attemptData } = await supabase
    .from('attempts')
    .select('sitting_id, student_id')
    .eq('id', attemptId)
    .single()

  if (attemptData) {
    await supabase
      .from('enrolments')
      .update({ written_status: 'submitted' })
      .eq('sitting_id', attemptData.sitting_id)
      .eq('student_id', attemptData.student_id)
  }

  return {
    score: correctCount,
    totalQuestions,
    percentage: scorePercentage,
    passMarkPercentage,
    passed,
  }
}
