'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

/**
 * Get the current user's organisation
 */
export async function getCurrentUserOrganization() {
  const supabase = createServiceClient()
  const serverSupabase = await createClient()

  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('organization_users')
    .select(`
      role,
      organization:organizations(
        id,
        name,
        email,
        phone,
        address,
        is_active,
        trial_end_date,
        plan,
        seats,
        onboarding_completed
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error fetching organisation:', error)
    return null
  }

  if (!data || data.length === 0) {
    return null
  }

  return {
    role: data[0].role,
    organization: data[0].organization as any
  }
}

/**
 * Create a new organisation and link the current user as owner (SAFE VERSION)
 *
 * Uses a SECURITY DEFINER RPC to bypass RLS and ensure atomic creation.
 * Returns a serializable result object instead of throwing errors.
 *
 * IDEMPOTENT: If user already has an organization, returns existing org instead of creating new one.
 *
 * @returns { ok: true, orgId: string } on success, { ok: false, message: string } on failure
 */
export async function createOrganizationSafe(data: {
  name: string
  email?: string
  phone?: string
  address?: string
}): Promise<{ ok: boolean; orgId?: string; message?: string }> {
  try {
    const serverSupabase = await createClient()

    // Check authentication
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (!user) {
      return { ok: false, message: 'Not authenticated' }
    }

    // IDEMPOTENCY CHECK: Check if user already has an organization
    const existingOrg = await getCurrentUserOrganization()
    if (existingOrg && existingOrg.organization) {
      // User already has an org - return it instead of creating a new one
      return {
        ok: true,
        orgId: existingOrg.organization.id,
        message: 'Using existing organization'
      }
    }

    // Call the RPC function (runs with SECURITY DEFINER)
    const { data: result, error } = await serverSupabase.rpc(
      'create_organisation_and_membership',
      {
        p_name: data.name,
        p_email: data.email || null,
        p_phone: data.phone || null,
        p_address: data.address || null,
      }
    )

    if (error) {
      console.error('RPC error creating organisation:', error)
      return {
        ok: false,
        message: error.message || 'Failed to create organisation'
      }
    }

    // Result is an array with one row containing organisation_id
    const orgId = result?.[0]?.organisation_id

    if (!orgId) {
      return {
        ok: false,
        message: 'Organisation created but ID not returned'
      }
    }

    return { ok: true, orgId }

  } catch (error: any) {
    console.error('Unexpected error creating organisation:', error)
    return {
      ok: false,
      message: error?.message || 'An unexpected error occurred'
    }
  }
}

/**
 * Create a new organisation and link the current user as owner (LEGACY VERSION)
 *
 * @deprecated Use createOrganizationSafe() instead for better error handling
 */
export async function createOrganization(data: {
  name: string
  email?: string
  phone?: string
  address?: string
}) {
  const supabase = createServiceClient()
  const serverSupabase = await createClient()

  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      onboarding_completed: true,
      trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      plan: 'trial',
      seats: 1,
    })
    .select()
    .single()

  if (orgError) {
    console.error('Error creating organisation:', orgError)
    throw new Error('Failed to create organisation')
  }

  // Link user as owner
  const { error: userError } = await supabase
    .from('organization_users')
    .insert({
      organization_id: org.id,
      user_id: user.id,
      role: 'owner'
    })

  if (userError) {
    console.error('Error linking user to organisation:', userError)
    throw new Error('Failed to link user to organisation')
  }

  return org
}

/**
 * Update the current user's organization plan
 * Used during onboarding plan selection
 */
export async function updateOrganizationPlan(plan: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const supabase = createServiceClient()
    const serverSupabase = await createClient()

    const { data: { user } } = await serverSupabase.auth.getUser()
    if (!user) {
      return { ok: false, message: 'Not authenticated' }
    }

    // Get user's organization
    const orgData = await getCurrentUserOrganization()
    if (!orgData || !orgData.organization) {
      return { ok: false, message: 'No organization found' }
    }

    // Update the plan
    const { error } = await supabase
      .from('organizations')
      .update({ plan })
      .eq('id', orgData.organization.id)

    if (error) {
      console.error('Error updating organization plan:', error)
      return { ok: false, message: 'Failed to update plan' }
    }

    return { ok: true }
  } catch (error: any) {
    console.error('Unexpected error updating plan:', error)
    return { ok: false, message: error?.message || 'An unexpected error occurred' }
  }
}

/**
 * Update organisation details
 */
export async function updateOrganization(
  organizationId: string,
  data: {
    name?: string
    email?: string
    phone?: string
    address?: string
  }
) {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('organizations')
    .update(data)
    .eq('id', organizationId)

  if (error) {
    console.error('Error updating organisation:', error)
    throw new Error('Failed to update organisation')
  }

  return { success: true }
}

/**
 * Check if the current user is an organization admin (owner or admin role)
 * OR an active trainer (which also grants assignment permissions)
 */
export async function isCurrentUserOrgAdmin(): Promise<boolean> {
  try {
    const supabase = createServiceClient()
    const serverSupabase = await createClient()

    // Get current user
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (!user) return false

    // First check if user is organization admin
    const orgData = await getCurrentUserOrganization()
    if (orgData && (orgData.role === 'owner' || orgData.role === 'admin')) {
      return true
    }

    // If not org admin, check if user is an active trainer
    const { data: trainerData } = await supabase
      .from('trainer_users')
      .select('is_active')
      .eq('user_id', user.id)
      .single()

    return trainerData?.is_active === true
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Get full user profile with organization details
 * Used for profile page
 */
export async function getUserProfile() {
  const supabase = createServiceClient()
  const serverSupabase = await createClient()

  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('organization_users')
    .select(`
      role,
      created_at,
      organization:organizations(
        id,
        name,
        email,
        phone,
        address,
        legal_name,
        billing_email,
        timezone,
        logo_url,
        brand_color,
        is_active,
        trial_end_date,
        plan,
        seats,
        onboarding_completed,
        is_deleted,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error fetching user profile:', error)
    throw new Error('Failed to fetch user profile')
  }

  if (!data || data.length === 0) {
    throw new Error('No organization found for user')
  }

  return {
    user: {
      id: user.id,
      email: user.email || '',
      created_at: user.created_at,
    },
    role: data[0].role,
    organization: data[0].organization as any,
    joined_at: data[0].created_at,
  }
}

/**
 * Get organization usage statistics
 * Returns seats used, total seats, sittings count, trainers count
 */
export async function getOrgUsageStats() {
  const supabase = createServiceClient()
  const serverSupabase = await createClient()

  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get organization
  const orgData = await getCurrentUserOrganization()
  if (!orgData || !orgData.organization) {
    throw new Error('No organization found')
  }

  const orgId = orgData.organization.id

  // Count trainers
  const { count: trainersCount } = await supabase
    .from('trainer_users')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('is_active', true)

  // Count sittings
  const { count: sittingsCount } = await supabase
    .from('sittings')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)

  return {
    trainersCount: trainersCount || 0,
    sittingsCount: sittingsCount || 0,
    seatsTotal: orgData.organization.seats || 1,
  }
}

/**
 * Update organization details (owner-only)
 * Validates role and normalizes data
 */
export async function updateOrganizationProfile(input: {
  name: string
  email?: string
  phone?: string
  address?: string
  legal_name?: string
  billing_email?: string
  timezone?: string
}) {
  const supabase = createServiceClient()
  const serverSupabase = await createClient()

  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get user's role
  const profile = await getUserProfile()
  if (profile.role !== 'owner') {
    throw new Error('Only organization owners can update organization details')
  }

  if (profile.organization.is_deleted) {
    throw new Error('Cannot update deleted organization')
  }

  // Normalize phone number
  const normalizePhone = (phone: string | undefined): string | undefined => {
    if (!phone || phone.trim() === '') return undefined
    const cleaned = phone.replace(/[^\d+]/g, '')
    if (cleaned.startsWith('0')) return '+44' + cleaned.slice(1)
    if (cleaned.startsWith('44')) return '+' + cleaned
    return cleaned
  }

  const updateData = {
    name: input.name,
    email: input.email || null,
    phone: normalizePhone(input.phone) || null,
    address: input.address || null,
    legal_name: input.legal_name || null,
    billing_email: input.billing_email || null,
    timezone: input.timezone || 'Europe/London',
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('organizations')
    .update(updateData)
    .eq('id', profile.organization.id)

  if (error) {
    console.error('Error updating organization:', error)
    throw new Error('Failed to update organization')
  }

  // Log the update
  await logOrgEvent(profile.organization.id, user.id, 'update_organization', {
    fields: Object.keys(input),
  })

  return { success: true }
}

/**
 * Upload organization logo
 * Validates file type and size, uploads to Supabase Storage
 */
export async function uploadOrgLogo(formData: FormData) {
  const supabase = createServiceClient()
  const serverSupabase = await createClient()

  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get user's role
  const profile = await getUserProfile()
  if (profile.role !== 'owner') {
    throw new Error('Only organization owners can upload logos')
  }

  const file = formData.get('file') as File
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file type
  if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
    throw new Error('Only PNG and JPEG images are allowed')
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File size must be less than 2MB')
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${profile.organization.id}-${Date.now()}.${fileExt}`

  // Upload to Supabase Storage
  const { data, error: uploadError } = await supabase.storage
    .from('organization-logos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    console.error('Error uploading logo:', uploadError)
    throw new Error('Failed to upload logo')
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('organization-logos')
    .getPublicUrl(fileName)

  // Update organization with logo URL
  const { error: updateError } = await supabase
    .from('organizations')
    .update({ logo_url: publicUrl })
    .eq('id', profile.organization.id)

  if (updateError) {
    console.error('Error updating organization logo:', updateError)
    throw new Error('Failed to update organization logo')
  }

  // Log the update
  await logOrgEvent(profile.organization.id, user.id, 'upload_logo', {
    logo_url: publicUrl,
  })

  return { success: true, logo_url: publicUrl }
}

/**
 * Update brand color (owner-only)
 */
export async function updateBrandColor(hex: string) {
  const supabase = createServiceClient()
  const serverSupabase = await createClient()

  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get user's role
  const profile = await getUserProfile()
  if (profile.role !== 'owner') {
    throw new Error('Only organization owners can update brand color')
  }

  // Validate hex format
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error('Invalid hex color format. Use #RRGGBB')
  }

  const { error } = await supabase
    .from('organizations')
    .update({ brand_color: hex })
    .eq('id', profile.organization.id)

  if (error) {
    console.error('Error updating brand color:', error)
    throw new Error('Failed to update brand color')
  }

  // Log the update
  await logOrgEvent(profile.organization.id, user.id, 'update_brand_color', {
    brand_color: hex,
  })

  return { success: true }
}

/**
 * Soft delete organization (owner-only)
 * Checks for active sittings/attempts first
 */
export async function deleteOrganization(confirmName: string) {
  const supabase = createServiceClient()
  const serverSupabase = await createClient()

  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get user's role
  const profile = await getUserProfile()
  if (profile.role !== 'owner') {
    throw new Error('Only organization owners can delete the organization')
  }

  // Verify confirmation name matches
  if (confirmName !== profile.organization.name) {
    throw new Error('Organization name does not match')
  }

  // Check for active sittings or attempts
  const { count: sittingsCount } = await supabase
    .from('sittings')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', profile.organization.id)

  if (sittingsCount && sittingsCount > 0) {
    throw new Error('Cannot delete organization with active sittings. Please contact support.')
  }

  // Soft delete (set is_deleted flag)
  const { error } = await supabase
    .from('organizations')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', profile.organization.id)

  if (error) {
    console.error('Error deleting organization:', error)
    throw new Error('Failed to delete organization')
  }

  // Log the deletion
  await logOrgEvent(profile.organization.id, user.id, 'delete_organization', {
    organization_name: profile.organization.name,
  })

  return { success: true }
}

/**
 * Log organization event to audit trail
 * Internal helper function
 */
async function logOrgEvent(
  organizationId: string,
  actorId: string,
  action: string,
  metadata: any = {}
) {
  const supabase = createServiceClient()

  await supabase
    .from('organization_events')
    .insert({
      organization_id: organizationId,
      actor_id: actorId,
      action,
      metadata,
    })

  // Don't throw on error - logging failures shouldn't block the main operation
}
