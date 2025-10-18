'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from './organizations'

/**
 * Get all trainers for the current user's organization
 */
export async function getOrganizationTrainers() {
  const supabase = createServiceClient()

  const orgData = await getCurrentUserOrganization()
  if (!orgData) {
    throw new Error('No organization found')
  }

  const { data, error } = await supabase
    .from('trainer_users')
    .select('*')
    .eq('organization_id', orgData.organization.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching trainers:', error)
    throw new Error('Failed to fetch trainers')
  }

  return data
}

/**
 * Create a new trainer for the current user's organization
 */
export async function createTrainer(data: {
  name: string
  email: string
}) {
  const supabase = createServiceClient()

  const orgData = await getCurrentUserOrganization()
  if (!orgData) {
    throw new Error('No organization found')
  }

  const { data: trainer, error } = await supabase
    .from('trainer_users')
    .insert({
      organization_id: orgData.organization.id,
      name: data.name,
      email: data.email.toLowerCase(),
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating trainer:', error)
    if (error.code === '23505') {
      throw new Error('A trainer with this email already exists in your organization')
    }
    throw new Error('Failed to create trainer')
  }

  return trainer
}

/**
 * Update a trainer's details
 */
export async function updateTrainer(
  trainerId: string,
  data: {
    name?: string
    email?: string
    is_active?: boolean
  }
) {
  const supabase = createServiceClient()

  const orgData = await getCurrentUserOrganization()
  if (!orgData) {
    throw new Error('No organization found')
  }

  // Verify the trainer belongs to the user's organization
  const { data: trainer } = await supabase
    .from('trainer_users')
    .select('organization_id')
    .eq('id', trainerId)
    .single()

  if (!trainer || trainer.organization_id !== orgData.organization.id) {
    throw new Error('Trainer not found or does not belong to your organization')
  }

  const updateData: any = {}
  if (data.name) updateData.name = data.name
  if (data.email) updateData.email = data.email.toLowerCase()
  if (data.is_active !== undefined) updateData.is_active = data.is_active

  const { error } = await supabase
    .from('trainer_users')
    .update(updateData)
    .eq('id', trainerId)

  if (error) {
    console.error('Error updating trainer:', error)
    if (error.code === '23505') {
      throw new Error('A trainer with this email already exists in your organization')
    }
    throw new Error('Failed to update trainer')
  }

  return { success: true }
}

/**
 * Delete (deactivate) a trainer
 */
export async function deleteTrainer(trainerId: string) {
  const supabase = createServiceClient()

  const orgData = await getCurrentUserOrganization()
  if (!orgData) {
    throw new Error('No organization found')
  }

  // Verify the trainer belongs to the user's organization
  const { data: trainer } = await supabase
    .from('trainer_users')
    .select('organization_id')
    .eq('id', trainerId)
    .single()

  if (!trainer || trainer.organization_id !== orgData.organization.id) {
    throw new Error('Trainer not found or does not belong to your organization')
  }

  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from('trainer_users')
    .update({ is_active: false })
    .eq('id', trainerId)

  if (error) {
    console.error('Error deleting trainer:', error)
    throw new Error('Failed to delete trainer')
  }

  return { success: true }
}
