import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Check email verification status API
 * Used by verify-email page for polling
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return NextResponse.json({
    verified: user?.email_confirmed_at !== null,
    email: user?.email || null,
  })
}
