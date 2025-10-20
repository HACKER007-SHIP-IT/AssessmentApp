/**
 * Temporary diagnostic endpoint for onboarding issues
 *
 * Returns information about:
 * - Current user authentication status
 * - Organisations readable by user (RLS check)
 * - Organisation memberships readable by user (RLS check)
 *
 * Usage: GET /api/debug/onboarding
 *
 * ⚠️ IMPORTANT: Remove this before production deploy!
 */

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // Check what organisations the user can read (RLS test)
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, plan, trial_end_date')
      .limit(5)

    // Check what organisation memberships the user can read (RLS test)
    const { data: memberships, error: membershipsError } = await supabase
      .from('organization_users')
      .select('organization_id, user_id, role')
      .limit(5)

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      auth: {
        authenticated: !!user,
        userId: user?.id || null,
        email: user?.email || null,
        error: userError?.message || null,
      },
      organisations: {
        readable: !!orgs && orgs.length > 0,
        count: orgs?.length || 0,
        data: orgs || null,
        error: orgsError?.message || null,
      },
      memberships: {
        readable: !!memberships && memberships.length > 0,
        count: memberships?.length || 0,
        data: memberships || null,
        error: membershipsError?.message || null,
      },
      diagnosis: {
        hasUser: !!user,
        canReadOrgs: !orgsError,
        canReadMemberships: !membershipsError,
        hasOrg: !!orgs && orgs.length > 0,
        hasMembership: !!memberships && memberships.length > 0,
      },
      recommendations: getDiagnosisRecommendations({
        hasUser: !!user,
        orgsError,
        membershipsError,
        hasOrg: !!orgs && orgs.length > 0,
        hasMembership: !!memberships && memberships.length > 0,
      }),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Diagnostic failed',
        message: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    )
  }
}

function getDiagnosisRecommendations(checks: {
  hasUser: boolean
  orgsError: any
  membershipsError: any
  hasOrg: boolean
  hasMembership: boolean
}): string[] {
  const recommendations: string[] = []

  if (!checks.hasUser) {
    recommendations.push('User is not authenticated. Sign in first.')
  }

  if (checks.orgsError) {
    recommendations.push(
      `Cannot read organisations table: ${checks.orgsError.message}. Check RLS policies.`
    )
  }

  if (checks.membershipsError) {
    recommendations.push(
      `Cannot read organisation_users table: ${checks.membershipsError.message}. Check RLS policies.`
    )
  }

  if (checks.hasUser && !checks.hasOrg && !checks.orgsError) {
    recommendations.push('User has no organisations. This is expected for new users.')
  }

  if (checks.hasUser && checks.hasOrg && !checks.hasMembership) {
    recommendations.push(
      'User has organisations but no memberships. Link might be missing. Run migration 014.'
    )
  }

  if (recommendations.length === 0) {
    recommendations.push('All checks passed! Onboarding should work.')
  }

  return recommendations
}
