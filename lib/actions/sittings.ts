'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { generateId, generateToken, generateShortCode } from '@/lib/utils'
import { getCurrentUserOrganization } from './organizations'

export interface CreateSittingData {
  courseType: string
  paper: string
  duration: number
  randomiseQuestions: boolean
  randomiseAnswers: boolean
  assignedTrainerId?: string
  sessionDate?: string
  sessionTime?: string
}

export interface SittingResult {
  id: string
  token: string
  shortCode: string
  paperId: string
  trainerId: string
}

export async function createSitting(data: CreateSittingData): Promise<SittingResult> {
  const supabase = createServiceClient()

  try {
    // 1. Get current user's organization
    const orgData = await getCurrentUserOrganization()
    if (!orgData) {
      throw new Error('No organization found')
    }

    // 2. Get paper ID based on course type and paper label
    const { data: paper, error: paperError } = await supabase
      .from('papers')
      .select('id, course_type_id')
      .eq('label', data.paper)
      .eq('course_types.code', data.courseType)
      .single()

    if (paperError || !paper) {
      // Fallback: get any paper for this course type
      const { data: fallbackPaper, error: fallbackError } = await supabase
        .from('papers')
        .select('id, course_types!inner(code)')
        .eq('course_types.code', data.courseType)
        .eq('label', data.paper)
        .single()

      if (fallbackError) throw new Error(`Could not find paper for ${data.courseType} - ${data.paper}`)

      var paperId = fallbackPaper.id
    } else {
      var paperId = paper.id
    }

    // 3. Generate unique identifiers
    const id = generateId()
    const token = generateToken()
    const shortCode = generateShortCode(data.courseType)

    // 4. Create sitting
    const { data: sitting, error: sittingError } = await supabase
      .from('sittings')
      .insert({
        id,
        paper_id: paperId,
        organization_id: orgData.organization.id,
        assigned_trainer_id: data.assignedTrainerId || null,
        sitting_type: data.courseType,
        session_date: data.sessionDate || null,
        session_time: data.sessionTime || null,
        status: 'scheduled',
        settings: {
          duration: data.duration,
          randomiseQuestions: data.randomiseQuestions,
          randomiseAnswers: data.randomiseAnswers,
        },
        short_code: shortCode,
        token: token,
      })
      .select('id, token, short_code, paper_id, assigned_trainer_id')
      .single()

    if (sittingError) throw sittingError

    return {
      id: sitting.id,
      token: sitting.token,
      shortCode: sitting.short_code,
      paperId: sitting.paper_id,
      trainerId: sitting.assigned_trainer_id || '',
    }
  } catch (error) {
    console.error('Error creating sitting:', error)
    throw error
  }
}

export async function getSittingByToken(token: string) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('sittings')
    .select(`
      *,
      paper:papers(
        id,
        label,
        course_type:course_types(
          code,
          name
        )
      ),
      assigned_trainer:trainer_users(
        id,
        name,
        email
      )
    `)
    .eq('token', token)
    .single()

  if (error) throw error
  return data
}

export async function getSittingByShortCode(shortCode: string) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('sittings')
    .select(`
      *,
      paper:papers(
        id,
        label,
        course_type:course_types(
          code,
          name
        )
      ),
      assigned_trainer:trainer_users(
        id,
        name,
        email
      )
    `)
    .eq('short_code', shortCode)
    .single()

  if (error) throw error
  return data
}

export async function getAttemptsBySittingId(sittingId: string) {
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
      created_at,
      student:students(
        id,
        name
      )
    `)
    .eq('sitting_id', sittingId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Start a sitting (change status to in_progress)
 */
export async function startSitting(sittingId: string) {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('sittings')
    .update({
      status: 'in_progress',
      start_at: new Date().toISOString(),
    })
    .eq('id', sittingId)

  if (error) {
    console.error('Error starting sitting:', error)
    throw new Error('Failed to start sitting')
  }

  return { success: true }
}

/**
 * Extend sitting duration by minutes
 */
export async function extendSitting(sittingId: string, additionalMinutes: number = 5) {
  const supabase = createServiceClient()

  // Get current sitting
  const { data: sitting, error: fetchError } = await supabase
    .from('sittings')
    .select('settings')
    .eq('id', sittingId)
    .single()

  if (fetchError || !sitting) {
    throw new Error('Failed to fetch sitting')
  }

  const currentSettings = sitting.settings || {}
  const currentDuration = currentSettings.duration || 45
  const newDuration = currentDuration + additionalMinutes

  const { error } = await supabase
    .from('sittings')
    .update({
      settings: {
        ...currentSettings,
        duration: newDuration,
      }
    })
    .eq('id', sittingId)

  if (error) {
    console.error('Error extending sitting:', error)
    throw new Error('Failed to extend sitting')
  }

  return { success: true, newDuration }
}

/**
 * Lock joins (prevent new students from joining)
 */
export async function lockSitting(sittingId: string) {
  const supabase = createServiceClient()

  const { data: sitting, error: fetchError } = await supabase
    .from('sittings')
    .select('settings')
    .eq('id', sittingId)
    .single()

  if (fetchError || !sitting) {
    throw new Error('Failed to fetch sitting')
  }

  const currentSettings = sitting.settings || {}

  const { error } = await supabase
    .from('sittings')
    .update({
      settings: {
        ...currentSettings,
        joinsLocked: true,
      }
    })
    .eq('id', sittingId)

  if (error) {
    console.error('Error locking sitting:', error)
    throw new Error('Failed to lock sitting')
  }

  return { success: true }
}

/**
 * End a sitting (change status to closed and force submit all attempts)
 */
export async function endSitting(sittingId: string) {
  const supabase = createServiceClient()

  // Update sitting status
  const { error: sittingError } = await supabase
    .from('sittings')
    .update({
      status: 'closed',
      end_at: new Date().toISOString(),
    })
    .eq('id', sittingId)

  if (sittingError) {
    console.error('Error ending sitting:', sittingError)
    throw new Error('Failed to end sitting')
  }

  // Auto-submit all unsubmitted attempts
  // Import calculateAndSubmitScore would cause circular dependency,
  // so we'll do a simple submission here
  const { data: attempts } = await supabase
    .from('attempts')
    .select('id, submitted_at')
    .eq('sitting_id', sittingId)
    .is('submitted_at', null)

  if (attempts && attempts.length > 0) {
    // For each attempt, we just mark as submitted
    // Scoring will be calculated on-demand when viewing results
    const attemptIds = attempts.map(a => a.id)
    await supabase
      .from('attempts')
      .update({ submitted_at: new Date().toISOString() })
      .in('id', attemptIds)
  }

  return { success: true }
}
