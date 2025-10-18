import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Base32 alphabet (excluding ambiguous characters)
const BASE32_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

/**
 * Generate a random base32 string of specified length
 */
export function randomBase32(length: number): string {
  let result = ""
  for (let i = 0; i < length; i++) {
    result += BASE32_ALPHABET.charAt(Math.floor(Math.random() * BASE32_ALPHABET.length))
  }
  return result
}

/**
 * Generate a short code for a sitting (e.g., FAW-AB3D)
 */
export function generateShortCode(courseType: string): string {
  const code = randomBase32(4)
  return `${courseType}-${code}`
}

/**
 * Generate a random token for trainer console
 */
export function generateToken(): string {
  return randomBase32(24)
}

/**
 * Generate a unique ID (simple UUID v4)
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
