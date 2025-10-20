import { redirect } from "next/navigation"
import { createServiceClient } from "@/lib/supabase/service"

interface PageProps {
  params: {
    token: string
  }
}

export default async function TrainerInvitePage({ params }: PageProps) {
  const { token } = params
  const supabase = createServiceClient()

  // Validate the token
  const { data: inviteToken, error: tokenError } = await supabase
    .from('trainer_invite_tokens')
    .select(`
      id,
      trainer_id,
      expires_at,
      used_at,
      trainer_users (
        id,
        name,
        email,
        organization_id
      )
    `)
    .eq('token', token)
    .single()

  // Check if token is invalid, expired, or already used
  if (tokenError || !inviteToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-focus-grey">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Link</h1>
          <p className="text-muted-foreground">
            This magic link is invalid or has expired. Please contact your administrator for a new link.
          </p>
        </div>
      </div>
    )
  }

  if (inviteToken.used_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-focus-grey">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Link Already Used</h1>
          <p className="text-muted-foreground">
            This magic link has already been used. Please contact your administrator if you need a new link.
          </p>
        </div>
      </div>
    )
  }

  const expiresAt = new Date(inviteToken.expires_at)
  if (expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-focus-grey">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Link Expired</h1>
          <p className="text-muted-foreground">
            This magic link has expired. Please contact your administrator for a new link.
          </p>
        </div>
      </div>
    )
  }

  // Mark token as used
  await supabase
    .from('trainer_invite_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', inviteToken.id)

  // Get trainer's sittings
  const { data: sittings } = await supabase
    .from('sittings')
    .select('token')
    .eq('assigned_trainer_id', inviteToken.trainer_id)
    .eq('organization_id', (inviteToken.trainer_users as any).organization_id)
    .order('created_at', { ascending: false })
    .limit(1)

  // Redirect to first sitting or trainer dashboard
  if (sittings && sittings.length > 0) {
    redirect(`/trainer/${sittings[0].token}`)
  } else {
    // No sittings assigned yet - show welcome page
    return (
      <div className="min-h-screen flex items-center justify-center bg-focus-grey">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-focus-text mb-4">
            Welcome, {(inviteToken.trainer_users as any).name}!
          </h1>
          <p className="text-muted-foreground">
            You don't have any training sessions assigned yet. Your administrator will assign sessions to you soon.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            You'll receive a link when sessions are available.
          </p>
        </div>
      </div>
    )
  }
}
