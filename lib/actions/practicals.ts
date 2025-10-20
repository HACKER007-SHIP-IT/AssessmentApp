"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"
import type { SectionMarkPayload, SectionMarkState } from '@/lib/types/practical'

// ============================================================================
// Types
// ============================================================================

export type PracticalAssessment = {
  id: string
  course_type_id: string
  title: string
  description: string | null
  version: string
  created_at: string
  updated_at: string
}

export type PracticalScenario = {
  id: string
  practical_assessment_id: string
  scenario_number: number
  title: string
  description: string | null
  is_optional: boolean
  display_order: number
  created_at: string
}

export type PracticalSkill = {
  id: string
  practical_scenario_id: string
  lo_number: string
  skill_description: string
  is_critical: boolean
  display_order: number
  created_at: string
}

export type SkillResult = 'pass' | 'pass_oral' | 'fail'

export type PracticalAttempt = {
  id: string
  sitting_id: string
  student_id: string
  started_at: string
  completed_at: string | null
  overall_pass: boolean | null
  trainer_notes: string | null
  assessed_by_trainer_id: string | null
  created_at: string
  updated_at: string
}

export type PracticalSkillResult = {
  id: string
  practical_attempt_id: string
  practical_skill_id: string
  result: SkillResult
  trainer_notes: string | null
  assessed_at: string
}

export type PracticalScenarioResult = {
  id: string
  practical_attempt_id: string
  practical_scenario_id: string
  passed: boolean | null
  trainer_notes: string | null
  assessed_at: string
}

// ============================================================================
// Get Practical Assessment Template
// ============================================================================

export async function getPracticalAssessmentByCourseType(courseTypeId: string) {
  const supabase = createServiceClient()

  const { data: assessment, error: assessmentError } = await supabase
    .from('practical_assessments')
    .select('*')
    .eq('course_type_id', courseTypeId)
    .maybeSingle()

  if (assessmentError) {
    console.error('Error fetching practical assessment:', assessmentError)
    throw new Error('Failed to fetch practical assessment')
  }

  if (!assessment) {
    console.error('No practical assessment template found for course type:', courseTypeId)
    throw new Error('No practical assessment template found for this course type. Please contact your administrator to seed the practical assessment data.')
  }

  const { data: scenarios, error: scenariosError } = await supabase
    .from('practical_scenarios')
    .select('*')
    .eq('practical_assessment_id', assessment.id)
    .order('display_order')

  if (scenariosError) {
    console.error('Error fetching scenarios:', scenariosError)
    throw new Error('Failed to fetch scenarios')
  }

  // Get skills for each scenario
  const scenariosWithSkills = await Promise.all(
    scenarios.map(async (scenario) => {
      const { data: skills, error: skillsError } = await supabase
        .from('practical_skills')
        .select('*')
        .eq('practical_scenario_id', scenario.id)
        .order('display_order')

      if (skillsError) {
        console.error('Error fetching skills:', skillsError)
        throw new Error('Failed to fetch skills')
      }

      return {
        ...scenario,
        skills,
      }
    })
  )

  return {
    assessment,
    scenarios: scenariosWithSkills,
  }
}

// ============================================================================
// Create Practical Attempt
// ============================================================================

export async function createPracticalAttempt(
  sittingId: string,
  studentId: string,
  trainerId: string
) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('practical_attempts')
    .insert({
      sitting_id: sittingId,
      student_id: studentId,
      assessed_by_trainer_id: trainerId,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    // Check if attempt already exists
    if (error.code === '23505') {
      // Unique constraint violation - attempt already exists
      const { data: existing } = await supabase
        .from('practical_attempts')
        .select('*')
        .eq('sitting_id', sittingId)
        .eq('student_id', studentId)
        .single()

      return existing
    }

    console.error('Error creating practical attempt:', error)
    throw new Error('Failed to create practical attempt')
  }

  revalidatePath(`/trainer/practical/${sittingId}`)
  return data
}

// ============================================================================
// Update Skill Result
// ============================================================================

export async function updateSkillResult(
  attemptId: string,
  skillId: string,
  result: SkillResult,
  notes?: string
) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('practical_skill_results')
    .upsert(
      {
        practical_attempt_id: attemptId,
        practical_skill_id: skillId,
        result,
        trainer_notes: notes || null,
        assessed_at: new Date().toISOString(),
      },
      {
        onConflict: 'practical_attempt_id,practical_skill_id',
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error updating skill result:', error)
    throw new Error('Failed to update skill result')
  }

  // Update the attempt's updated_at timestamp
  await supabase
    .from('practical_attempts')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', attemptId)

  return data
}

// ============================================================================
// Update Scenario Result
// ============================================================================

export async function updateScenarioResult(
  attemptId: string,
  scenarioId: string,
  passed: boolean | null,
  notes?: string
) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('practical_scenario_results')
    .upsert(
      {
        practical_attempt_id: attemptId,
        practical_scenario_id: scenarioId,
        passed,
        trainer_notes: notes || null,
        assessed_at: new Date().toISOString(),
      },
      {
        onConflict: 'practical_attempt_id,practical_scenario_id',
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error updating scenario result:', error)
    throw new Error('Failed to update scenario result')
  }

  return data
}

// ============================================================================
// Finalize Practical Attempt
// ============================================================================

export async function finalizePracticalAttempt(
  attemptId: string,
  overallPass: boolean,
  trainerNotes?: string
) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('practical_attempts')
    .update({
      completed_at: new Date().toISOString(),
      overall_pass: overallPass,
      trainer_notes: trainerNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', attemptId)
    .select()
    .single()

  if (error) {
    console.error('Error finalizing practical attempt:', error)
    throw new Error('Failed to finalize practical attempt')
  }

  revalidatePath('/admin/sittings')
  return data
}

// ============================================================================
// Get Practical Attempt with Results
// ============================================================================

export async function getPracticalAttemptResults(attemptId: string) {
  const supabase = createServiceClient()

  // Get the attempt
  const { data: attempt, error: attemptError } = await supabase
    .from('practical_attempts')
    .select(`
      *,
      student:students(*),
      trainer:trainer_users(*),
      sitting:sittings(*)
    `)
    .eq('id', attemptId)
    .single()

  if (attemptError) {
    console.error('Error fetching practical attempt:', attemptError)
    throw new Error('Failed to fetch practical attempt')
  }

  // Get skill results
  const { data: skillResults, error: skillResultsError } = await supabase
    .from('practical_skill_results')
    .select(`
      *,
      skill:practical_skills(*)
    `)
    .eq('practical_attempt_id', attemptId)

  if (skillResultsError) {
    console.error('Error fetching skill results:', skillResultsError)
    throw new Error('Failed to fetch skill results')
  }

  // Get scenario results
  const { data: scenarioResults, error: scenarioResultsError } = await supabase
    .from('practical_scenario_results')
    .select(`
      *,
      scenario:practical_scenarios(*)
    `)
    .eq('practical_attempt_id', attemptId)

  if (scenarioResultsError) {
    console.error('Error fetching scenario results:', scenarioResultsError)
    throw new Error('Failed to fetch scenario results')
  }

  return {
    attempt,
    skillResults: skillResults || [],
    scenarioResults: scenarioResults || [],
  }
}

// ============================================================================
// Get All Practical Attempts for a Sitting
// ============================================================================

export async function getPracticalSittingResults(sittingId: string) {
  const supabase = createServiceClient()

  const { data: attempts, error } = await supabase
    .from('practical_attempts')
    .select(`
      *,
      student:students(id, name, email)
    `)
    .eq('sitting_id', sittingId)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('Error fetching practical sitting results:', error)
    throw new Error('Failed to fetch practical sitting results')
  }

  return attempts || []
}

// ============================================================================
// Get Student's Practical Attempt for Sitting
// ============================================================================

export async function getStudentPracticalAttempt(
  sittingId: string,
  studentId: string
) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('practical_attempts')
    .select('*')
    .eq('sitting_id', sittingId)
    .eq('student_id', studentId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching student practical attempt:', error)
    throw new Error('Failed to fetch student practical attempt')
  }

  return data
}

// ============================================================================
// Get All Students for Practical Sitting
// ============================================================================

/**
 * @deprecated Use getEnrolledStudents() from lib/actions/enrolments instead.
 *
 * This function queries the old `attempts` table and only shows students
 * who have started the written test. The enrolments table is the correct
 * source of truth for showing all enrolled students regardless of their
 * written test status.
 *
 * Migration: Replace `getPracticalSittingStudents(sittingId)` with
 * `getEnrolledStudents(sittingId)` and update field references from
 * `practicalAttempt` to `practical_attempt`.
 *
 * TODO: Remove this function after verifying no other call sites exist
 * (search codebase for "getPracticalSittingStudents")
 */
export async function getPracticalSittingStudents(sittingId: string) {
  // Thin wrapper to new function for backward compatibility
  const { getEnrolledStudents } = await import('./enrolments')
  return getEnrolledStudents(sittingId)
}

// ============================================================================
// Delete Skill Result
// ============================================================================

export async function deleteSkillResult(attemptId: string, skillId: string) {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('practical_skill_results')
    .delete()
    .eq('practical_attempt_id', attemptId)
    .eq('practical_skill_id', skillId)

  if (error) {
    console.error('Error deleting skill result:', error)
    throw new Error('Failed to delete skill result')
  }

  // Update the attempt's updated_at timestamp
  await supabase
    .from('practical_attempts')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', attemptId)
}

// ============================================================================
// Save Section-Level Mark with Annotations
// ============================================================================

export async function saveSectionMark(payload: SectionMarkPayload): Promise<SectionMarkState> {
  const supabase = createServiceClient()

  // Map result to passed boolean
  const passed = payload.result === 'pass' || payload.result === 'pass_oral' ? true :
                 payload.result === 'fail' ? false : null

  // Format trainer notes with annotations
  let formattedNotes = payload.notes || ''

  if (payload.annotations.length > 0) {
    const annotationsText = payload.annotations
      .map(a => `[${a.reason === 'oral' ? 'Oral' : 'Failed'}] LO ${a.loNumber}`)
      .join('\n')

    formattedNotes = formattedNotes
      ? `${annotationsText}\n\n${formattedNotes}`
      : annotationsText
  }

  // Upsert scenario result
  const { data, error } = await supabase
    .from('practical_scenario_results')
    .upsert(
      {
        practical_attempt_id: payload.sittingId, // Note: This should be attempt_id, not sitting_id
        practical_scenario_id: payload.sectionId,
        passed,
        trainer_notes: formattedNotes || null,
        assessed_at: new Date().toISOString(),
      },
      {
        onConflict: 'practical_attempt_id,practical_scenario_id',
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error saving section mark:', error)
    throw new Error('Failed to save section mark')
  }

  // Calculate counts
  const oralCount = payload.annotations.filter(a => a.reason === 'oral').length
  const failCount = payload.annotations.filter(a => a.reason === 'fail').length

  return {
    result: payload.result,
    annotations: payload.annotations,
    notes: payload.notes || '',
    oralCount,
    failCount,
  }
}
