'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { getCurrentUserOrganization } from './organizations'

/**
 * Get KPI metrics for admin dashboard
 */
export async function getAdminKPIs(days: number = 30) {
  const supabase = createServiceClient()
  const orgData = await getCurrentUserOrganization()

  if (!orgData) {
    throw new Error('No organisation found')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get sittings count (last N days)
  const { count: sittingsCount } = await supabase
    .from('sittings')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgData.organization.id)
    .gte('created_at', startDate.toISOString())

  // Get attempts count (last N days)
  const { data: attempts } = await supabase
    .from('attempts')
    .select(`
      id,
      score,
      total_questions,
      passed,
      sitting:sittings!inner(organization_id)
    `)
    .eq('sitting.organization_id', orgData.organization.id)
    .gte('created_at', startDate.toISOString())
    .not('submitted_at', 'is', null)

  const attemptsCount = attempts?.length || 0
  const passedCount = attempts?.filter(a => a.passed).length || 0
  const passRate = attemptsCount > 0 ? Math.round((passedCount / attemptsCount) * 100) : 0

  const scores = attempts
    ?.filter(a => a.score !== null && a.total_questions !== null)
    .map(a => (a.score! / a.total_questions!) * 100) || []

  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  return {
    sittings: sittingsCount || 0,
    attempts: attemptsCount,
    passRate,
    averageScore
  }
}

/**
 * Get pass rate over time for chart
 */
export async function getPassRateOverTime(days: number = 30) {
  const supabase = createServiceClient()
  const orgData = await getCurrentUserOrganization()

  if (!orgData) {
    throw new Error('No organisation found')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: attempts } = await supabase
    .from('attempts')
    .select(`
      submitted_at,
      passed,
      sitting:sittings!inner(organization_id)
    `)
    .eq('sitting.organization_id', orgData.organization.id)
    .gte('submitted_at', startDate.toISOString())
    .not('submitted_at', 'is', null)
    .order('submitted_at')

  // Group by date
  const dateGroups: Record<string, { total: number, passed: number }> = {}

  attempts?.forEach(attempt => {
    const date = new Date(attempt.submitted_at!).toISOString().split('T')[0]
    if (!dateGroups[date]) {
      dateGroups[date] = { total: 0, passed: 0 }
    }
    dateGroups[date].total++
    if (attempt.passed) {
      dateGroups[date].passed++
    }
  })

  // Convert to chart format
  const chartData = Object.entries(dateGroups).map(([date, stats]) => ({
    date: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    passRate: Math.round((stats.passed / stats.total) * 100)
  }))

  return chartData
}

/**
 * Get attempts by course type for chart
 */
export async function getAttemptsByCourse(days: number = 30) {
  const supabase = createServiceClient()
  const orgData = await getCurrentUserOrganization()

  if (!orgData) {
    throw new Error('No organisation found')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: attempts } = await supabase
    .from('attempts')
    .select(`
      id,
      sitting:sittings!inner(
        organization_id,
        paper:papers!inner(
          course_type:course_types!inner(
            code,
            name
          )
        )
      )
    `)
    .eq('sitting.organization_id', orgData.organization.id)
    .gte('created_at', startDate.toISOString())

  // Count by course type
  const courseGroups: Record<string, number> = {}

  attempts?.forEach(attempt => {
    const courseCode = (attempt.sitting as any).paper.course_type.code
    if (!courseGroups[courseCode]) {
      courseGroups[courseCode] = 0
    }
    courseGroups[courseCode]++
  })

  // Convert to chart format
  const chartData = Object.entries(courseGroups).map(([course, count]) => ({
    course,
    attempts: count
  }))

  return chartData
}

/**
 * Get recent sittings for table
 */
export async function getRecentSittings(limit: number = 10) {
  const supabase = createServiceClient()
  const orgData = await getCurrentUserOrganization()

  if (!orgData) {
    throw new Error('No organisation found')
  }

  const { data: sittings } = await supabase
    .from('sittings')
    .select(`
      id,
      short_code,
      token,
      sitting_type,
      session_date,
      session_time,
      status,
      created_at,
      paper:papers(
        label,
        course_type:course_types(
          code,
          name
        )
      ),
      assigned_trainer:trainer_users(
        name
      )
    `)
    .eq('organization_id', orgData.organization.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!sittings) return []

  // Get attempt stats for each sitting
  const sittingsWithStats = await Promise.all(sittings.map(async (sitting) => {
    const { data: attempts } = await supabase
      .from('attempts')
      .select('id, passed, submitted_at')
      .eq('sitting_id', sitting.id)

    const totalAttempts = attempts?.length || 0
    const submittedAttempts = attempts?.filter(a => a.submitted_at).length || 0
    const passedAttempts = attempts?.filter(a => a.passed).length || 0
    const passRate = submittedAttempts > 0
      ? Math.round((passedAttempts / submittedAttempts) * 100)
      : null

    return {
      ...sitting,
      totalAttempts,
      submittedAttempts,
      passRate
    }
  }))

  return sittingsWithStats
}
