import { z } from 'zod'

/**
 * Organization Update Schema
 * Validates organization details for profile updates
 */
export const organizationUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be 100 characters or less')
    .trim(),

  email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),

  phone: z.string()
    .max(20, 'Phone number must be 20 characters or less')
    .optional()
    .or(z.literal('')),

  address: z.string()
    .max(200, 'Address must be 200 characters or less')
    .optional()
    .or(z.literal('')),

  legal_name: z.string()
    .max(100, 'Legal name must be 100 characters or less')
    .optional()
    .or(z.literal('')),

  billing_email: z.string()
    .email('Invalid billing email address')
    .optional()
    .or(z.literal('')),

  timezone: z.string()
    .min(1, 'Timezone is required'),
})

export type OrganizationUpdateInput = z.infer<typeof organizationUpdateSchema>

/**
 * Brand Color Schema
 * Validates hex color format (#RRGGBB)
 */
export const brandColorSchema = z.string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format. Use #RRGGBB')

/**
 * Password Update Schema
 * Validates password change with current password verification
 */
export const passwordUpdateSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),

  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),

  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
})

export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>

/**
 * Email Update Schema
 * Validates email change request
 */
export const emailUpdateSchema = z.object({
  newEmail: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
})

export type EmailUpdateInput = z.infer<typeof emailUpdateSchema>

/**
 * Organization Delete Schema
 * Validates organization deletion with name confirmation
 */
export const organizationDeleteSchema = z.object({
  confirmName: z.string()
    .min(1, 'Please enter your organization name to confirm'),
})

export type OrganizationDeleteInput = z.infer<typeof organizationDeleteSchema>

/**
 * Logo Upload Schema
 * Validates file upload constraints
 */
export const logoUploadSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, 'File is required')
    .refine(
      (file) => ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type),
      'Only PNG and JPEG images are allowed'
    )
    .refine(
      (file) => file.size <= 2 * 1024 * 1024, // 2MB
      'File size must be less than 2MB'
    ),
})

/**
 * Timezone options
 * Common UK and international timezones
 */
export const timezoneOptions = [
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Dublin', label: 'Dublin (GMT/IST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
] as const

/**
 * Phone normalization helper
 * Normalize UK phone formats (lenient)
 */
export function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone || phone.trim() === '') return undefined

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')

  // If starts with 0, convert to +44
  if (cleaned.startsWith('0')) {
    return '+44' + cleaned.slice(1)
  }

  // If starts with 44, add +
  if (cleaned.startsWith('44')) {
    return '+' + cleaned
  }

  return cleaned
}
