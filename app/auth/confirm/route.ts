/**
 * /auth/confirm - Graceful fallback for old email verification links
 *
 * This route now simply redirects to /verify-email with a friendly message.
 * Users should enter the 6-digit verification code from their email instead of clicking links.
 *
 * Note: This exists for backwards compatibility with old magic link emails that might still be in circulation.
 */

import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const dest = new URL("/verify-email", url)

  // Add info parameter to show a friendly message on the verify-email page
  dest.searchParams.set("info", "use-code")

  return NextResponse.redirect(dest)
}
