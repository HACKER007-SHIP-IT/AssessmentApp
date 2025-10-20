'use server'

import { createClient } from '@/lib/supabase/server'
import { emailUpdateSchema, passwordUpdateSchema } from '@/lib/validation/profile'
import { revalidatePath } from 'next/cache'

/**
 * Update user email
 * Triggers Supabase email verification flow
 */
export async function updateEmail(newEmail: string) {
  try {
    // Validate input
    const validatedData = emailUpdateSchema.parse({ newEmail })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Check if email is already in use
    const { data: existingUser, error: checkError } = await supabase.auth.admin.listUsers()
    if (!checkError && existingUser) {
      const emailExists = existingUser.users.some(
        u => u.email === validatedData.newEmail && u.id !== user.id
      )
      if (emailExists) {
        throw new Error('This email is already in use')
      }
    }

    // Update email (triggers verification email)
    const { error } = await supabase.auth.updateUser({
      email: validatedData.newEmail,
    })

    if (error) {
      console.error('Error updating email:', error)
      throw new Error(error.message || 'Failed to update email')
    }

    return {
      success: true,
      message: `Verification email sent to ${validatedData.newEmail}. Please check your inbox and click the confirmation link.`,
    }
  } catch (error: any) {
    console.error('updateEmail error:', error)
    return {
      success: false,
      error: error.message || 'Failed to update email',
    }
  }
}

/**
 * Update user password
 * Requires current password for re-authentication
 */
export async function updatePassword(input: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) {
  try {
    // Validate input
    const validatedData = passwordUpdateSchema.parse(input)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      throw new Error('Not authenticated')
    }

    // Re-authenticate with current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: validatedData.currentPassword,
    })

    if (signInError) {
      throw new Error('Current password is incorrect')
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.newPassword,
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      throw new Error(updateError.message || 'Failed to update password')
    }

    return {
      success: true,
      message: 'Password updated successfully',
    }
  } catch (error: any) {
    console.error('updatePassword error:', error)
    return {
      success: false,
      error: error.message || 'Failed to update password',
    }
  }
}

/**
 * Refresh session after auth changes
 * Revalidates the current path to pick up new session data
 */
export async function refreshSession() {
  try {
    const supabase = await createClient()

    // Refresh the session
    const { error } = await supabase.auth.refreshSession()

    if (error) {
      console.error('Error refreshing session:', error)
      throw new Error('Failed to refresh session')
    }

    // Revalidate the current path
    revalidatePath('/admin/profile')

    return {
      success: true,
    }
  } catch (error: any) {
    console.error('refreshSession error:', error)
    return {
      success: false,
      error: error.message || 'Failed to refresh session',
    }
  }
}

/**
 * Sign out user
 * Clears session and redirects to signin
 */
export async function signOutUser() {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error signing out:', error)
      throw new Error('Failed to sign out')
    }

    return {
      success: true,
    }
  } catch (error: any) {
    console.error('signOutUser error:', error)
    return {
      success: false,
      error: error.message || 'Failed to sign out',
    }
  }
}
