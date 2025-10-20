'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { generateId, generateToken, generateShortCode } from '@/lib/utils'
import { getCurrentUserOrganization } from './organizations'
import { revalidatePath } from 'next/cache'

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
    // 1. Get current user's organisation
    const orgData = await getCurrentUserOrganization()
    if (!orgData) {
      throw new Error('No organisation found')
    }

    console.log('Creating sitting for organization:', orgData.organization.id)
    console.log('Looking for paper:', data.courseType, '-', data.paper)

    // 2. Get paper ID based on course type and paper label
    // Use proper join syntax and limit to avoid duplicate errors
    const { data: papers, error: paperError } = await supabase
      .from('papers')
      .select('id, course_type_id, course_types!inner(code)')
      .eq('course_types.code', data.courseType)
      .eq('label', data.paper)
      .limit(1)

    if (paperError) {
      console.error('Error fetching paper:', paperError)
      throw new Error(`Database error: ${paperError.message}`)
    }

    if (!papers || papers.length === 0) {
      console.error('No papers found for:', data.courseType, data.paper)
      throw new Error(`Could not find paper for ${data.courseType} - ${data.paper}`)
    }

    const paper = papers[0]
    const paperId = paper.id
    const courseTypeId = paper.course_type_id

    console.log('Found paper ID:', paperId)

    // 3. Get practical assessment template for this course type
    // All FAIB courses require both written and practical assessments
    const { data: practicalAssessment } = await supabase
      .from('practical_assessments')
      .select('id')
      .eq('course_type_id', courseTypeId)
      .single()

    const practicalAssessmentId = practicalAssessment?.id || null

    // 3. Generate unique identifiers
    const id = generateId()
    const token = generateToken()
    const shortCode = generateShortCode(data.courseType)

    // 4. Create sitting (always combined for FAIB courses)
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
        assessment_type: 'combined', // All FAIB courses require written + practical
        practical_assessment_id: practicalAssessmentId,
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
          id,
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

  // Normalize the input - convert to uppercase
  const normalizedCode = shortCode.toUpperCase().trim()

  // First, try exact match
  let { data, error } = await supabase
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
    .eq('short_code', normalizedCode)
    .single()

  // If exact match fails and code doesn't contain a dash, try matching the suffix
  // This allows "AB3D" to match "FAW-AB3D"
  if (error && !normalizedCode.includes('-')) {
    const { data: dataWithSuffix, error: suffixError } = await supabase
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
      .like('short_code', `%-${normalizedCode}`)
      .single()

    if (!suffixError && dataWithSuffix) {
      data = dataWithSuffix
      error = null
    }
  }

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
 * Extend timer by minutes (updates timer_end_at directly)
 */
export async function extendTimer(sittingId: string, additionalMinutes: number = 5) {
  const supabase = createServiceClient()

  // Get current timer_end_at
  const { data: sitting, error: fetchError } = await supabase
    .from('sittings')
    .select('timer_end_at')
    .eq('id', sittingId)
    .single()

  if (fetchError || !sitting) {
    throw new Error('Failed to fetch sitting')
  }

  if (!sitting.timer_end_at) {
    throw new Error('Timer has not been started yet')
  }

  // Add minutes to existing timer_end_at
  const currentEndTime = new Date(sitting.timer_end_at)
  const newEndTime = new Date(currentEndTime.getTime() + additionalMinutes * 60 * 1000)

  const { error } = await supabase
    .from('sittings')
    .update({ timer_end_at: newEndTime.toISOString() })
    .eq('id', sittingId)

  if (error) {
    console.error('Error extending timer:', error)
    throw new Error('Failed to extend timer')
  }

  return { success: true, newEndTime: newEndTime.toISOString(), addedMinutes: additionalMinutes }
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

/**
 * Export sitting results as CSV
 */
export async function exportSittingCSV(sittingId: string) {
  const supabase = createServiceClient()

  // Check sitting is closed
  const { data: sitting, error: sittingError } = await supabase
    .from('sittings')
    .select('status')
    .eq('id', sittingId)
    .single()

  if (sittingError) {
    throw new Error('Failed to fetch sitting')
  }

  if (sitting.status !== 'closed') {
    throw new Error('Can only export results after sitting has ended')
  }

  // Get all enrolments with attempts and practical results
  const { data: enrolments, error } = await supabase
    .from('enrolments')
    .select(`
      student:students(name),
      written_attempt:attempts(score, total_questions, passed),
      practical_attempt:practical_attempts(overall_pass)
    `)
    .eq('sitting_id', sittingId)
    .order('student(name)')

  if (error) {
    console.error('Error fetching enrolments for export:', error)
    throw new Error('Failed to fetch results for export')
  }

  // Generate CSV
  const headers = ['Name', 'Written %', 'Written Pass', 'Practical Pass', 'Overall Pass']
  const rows = (enrolments || []).map((enrolment: any) => {
    const student = enrolment.student
    const written = enrolment.written_attempt
    const practical = enrolment.practical_attempt

    const writtenPercentage = written?.score && written?.total_questions
      ? Math.round((written.score / written.total_questions) * 100)
      : 'N/A'

    const writtenPass = written?.passed === true ? 'Yes' : written?.passed === false ? 'No' : 'N/A'
    const practicalPass = practical?.overall_pass === true ? 'Yes' : practical?.overall_pass === false ? 'No' : 'N/A'

    // Overall pass: both written and practical must pass
    const overallPass = written?.passed === true && practical?.overall_pass === true ? 'Yes' : 'No'

    return [
      student.name,
      writtenPercentage,
      writtenPass,
      practicalPass,
      overallPass,
    ]
  })

  // Build CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  return { csvContent, filename: `sitting-${sittingId}.csv` }
}

/**
 * Assign a trainer to a sitting
 * Only organization admins and trainers from the same organization can assign trainers
 */
export async function assignTrainerToSitting(sittingId: string, trainerId: string | null) {
  const supabase = createServiceClient()
  const serverSupabase = await createClient()

  // Get current user
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // First, get the sitting to find its organization
  const { data: sitting, error: sittingError } = await supabase
    .from('sittings')
    .select('organization_id')
    .eq('id', sittingId)
    .single()

  if (sittingError || !sitting) {
    throw new Error('Sitting not found')
  }

  // Check if user is organization admin
  const orgData = await getCurrentUserOrganization()
  const isOrgAdmin = orgData && (orgData.role === 'owner' || orgData.role === 'admin') && orgData.organization.id === sitting.organization_id

  // If not org admin, check if user is a trainer in the same organization
  let isOrgTrainer = false
  if (!isOrgAdmin) {
    const { data: trainerData } = await supabase
      .from('trainer_users')
      .select('organization_id, is_active')
      .eq('user_id', user.id)
      .single()

    isOrgTrainer = trainerData?.organization_id === sitting.organization_id && trainerData?.is_active === true
  }

  // User must be either org admin or trainer in the same organization
  if (!isOrgAdmin && !isOrgTrainer) {
    throw new Error('Only organization administrators and trainers can assign trainers')
  }

  // If trainerId provided, verify trainer belongs to the organization
  if (trainerId) {
    const { data: trainer, error: trainerError } = await supabase
      .from('trainer_users')
      .select('organization_id, is_active')
      .eq('id', trainerId)
      .single()

    if (trainerError || !trainer) {
      throw new Error('Trainer not found')
    }

    if (trainer.organization_id !== sitting.organization_id) {
      throw new Error('Trainer does not belong to your organization')
    }

    if (!trainer.is_active) {
      throw new Error('Cannot assign inactive trainer')
    }
  }

  // Update sitting
  const { error: updateError } = await supabase
    .from('sittings')
    .update({ assigned_trainer_id: trainerId })
    .eq('id', sittingId)

  if (updateError) {
    console.error('Error assigning trainer:', updateError)
    throw new Error('Failed to assign trainer')
  }

  revalidatePath(`/trainer/[token]`, 'page')
  return { success: true }
}
