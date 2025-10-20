import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getUserProfile, getOrgUsageStats } from "@/lib/actions/organizations"
import { AccountCard } from "@/components/profile/AccountCard"
import { OrganizationForm } from "@/components/profile/OrganizationForm"
import { TrialStatus } from "@/components/profile/TrialStatus"
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm"
import { EmailChangeForm } from "@/components/profile/EmailChangeForm"
import { DeleteOrgPanel } from "@/components/profile/DeleteOrgPanel"
import { Toaster } from "@/components/ui/toaster"

/**
 * Profile Page (Server Component)
 *
 * Comprehensive organization and user profile management page
 * - Fetches all data server-side
 * - Computes trial days to avoid hydration issues
 * - Passes serializable props to client components
 * - Organized into clear sections
 */
export default async function ProfilePage() {
  // Fetch user profile and organization
  const profile = await getUserProfile()
  const stats = await getOrgUsageStats()

  // Compute trial days server-side (avoid hydration)
  let trialDays: number | null = null
  if (profile.organization.plan === 'trial' && profile.organization.trial_end_date) {
    const now = new Date()
    const end = new Date(profile.organization.trial_end_date)
    trialDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  const hasActiveSittings = stats.sittingsCount > 0

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-4xl font-bold">Profile & Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account, organization, and subscription
          </p>
        </div>

        {/* Account Information Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
          <AccountCard
            email={profile.user.email}
            role={profile.role}
            createdAt={profile.user.created_at}
          />
        </section>

        {/* Organization Details Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Organization Details</h2>
          <OrganizationForm
            organization={profile.organization}
            role={profile.role}
          />
        </section>

        {/* Trial & Subscription Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Subscription & Trial</h2>
          <TrialStatus
            plan={profile.organization.plan as any}
            trialDays={trialDays}
            trialEndDate={profile.organization.trial_end_date}
            seatsUsed={stats.trainersCount}
            seatsTotal={profile.organization.seats || 1}
          />
        </section>

        {/* Security Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Security</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <EmailChangeForm currentEmail={profile.user.email} />
            <PasswordChangeForm />
          </div>
        </section>

        {/* Danger Zone Section - Owner Only */}
        {profile.role === 'owner' && (
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-destructive">Danger Zone</h2>
            <DeleteOrgPanel
              organizationName={profile.organization.name}
              role={profile.role}
              hasActiveSittings={hasActiveSittings}
            />
          </section>
        )}
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </>
  )
}
