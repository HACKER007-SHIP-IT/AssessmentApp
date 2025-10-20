import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserOrganization } from "@/lib/actions/organizations"
import { NavBar } from "./nav/NavBar"
import { shouldShowHeader } from "@/lib/nav/config"

/**
 * AppHeader (Server Component)
 *
 * Server-side wrapper that:
 * 1. Checks if header should be shown (hides on /trainer/* routes)
 * 2. Fetches auth session server-side
 * 3. Fetches organization data if authenticated
 * 4. Computes trial days server-side (avoids hydration issues)
 * 5. Passes serializable props to NavBar client component
 */
export async function AppHeader() {
  // Get pathname from headers
  const headersList = await headers()
  const pathname = headersList.get("x-invoke-path") || "/"

  // Early return for trainer routes (no header)
  if (!shouldShowHeader(pathname)) {
    return null
  }

  // Fetch auth session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let trialDays: number | null = null

  // If authenticated, fetch organization and compute trial days
  if (user) {
    try {
      const orgData = await getCurrentUserOrganization()

      if (orgData?.organization) {
        const org = orgData.organization

        // Only compute trial days if user is on trial plan
        if (org.plan === 'trial' && org.trial_end_date) {
          const now = new Date()
          const trialEnd = new Date(org.trial_end_date)
          const diffMs = trialEnd.getTime() - now.getTime()
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

          // Store trial days (can be negative if expired, but UI will handle)
          trialDays = diffDays
        }
      }
    } catch (error) {
      console.error('Error fetching organization for header:', error)
      // Continue rendering header even if org fetch fails
    }
  }

  return (
    <NavBar
      authed={!!user}
      trialDays={trialDays}
      pathname={pathname}
    />
  )
}
