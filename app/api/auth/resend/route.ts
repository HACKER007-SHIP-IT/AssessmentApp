import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Simple in-memory rate limiting (use Redis/KV in production)
const resendAttempts = new Map<string, number>()

/**
 * Resend verification email API
 * Rate-limited to prevent abuse
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 }
    )
  }

  // Rate limiting: 60 second cooldown between resends
  const now = Date.now()
  const lastAttempt = resendAttempts.get(user.email) || 0

  if (now - lastAttempt < 60000) {
    const secondsRemaining = Math.ceil((60000 - (now - lastAttempt)) / 1000)
    return NextResponse.json(
      {
        ok: false,
        error: `Please wait ${secondsRemaining} seconds before requesting another email`,
      },
      { status: 429 }
    )
  }

  // Update rate limit tracker
  resendAttempts.set(user.email, now)

  // Clean up old entries (older than 10 minutes)
  for (const [email, timestamp] of Array.from(resendAttempts.entries())) {
    if (now - timestamp > 600000) {
      resendAttempts.delete(email)
    }
  }

  // Resend verification email
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: user.email,
  })

  if (error) {
    console.error("Resend email error:", error.message)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ ok: true })
}
