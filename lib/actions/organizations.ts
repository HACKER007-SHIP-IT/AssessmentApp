'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

/**
 * Get the current user's organization
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
        is_active
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching organization:', error)
    return null
  }

  return {
    role: data.role,
    organization: data.organization as any
  }
}

/**
 * Create a new organization and link the current user as owner
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
    })
    .select()
    .single()

  if (orgError) {
    console.error('Error creating organization:', orgError)
    throw new Error('Failed to create organization')
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
    console.error('Error linking user to organization:', userError)
    throw new Error('Failed to link user to organization')
  }

  return org
}

/**
 * Update organization details
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
    console.error('Error updating organization:', error)
    throw new Error('Failed to update organization')
  }

  return { success: true }
}
