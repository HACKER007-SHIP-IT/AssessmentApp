import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Calendar, Users, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

async function getTrainerInfo(userId: string) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('trainer_users')
    .select(`
      id,
      name,
      email,
      organization:organizations(
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching trainer:', error)
    return null
  }

  return data
}

async function getTrainerSittings(trainerId: string) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('sittings')
    .select(`
      id,
      short_code,
      token,
      sitting_type,
      session_date,
      session_time,
      status
    `)
    .eq('assigned_trainer_id', trainerId)
    .order('session_date', { ascending: true })

  if (error) {
    console.error('Error fetching sittings:', error)
    return []
  }

  return data
}

export default async function TrainerDashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/trainer/sign-in")
  }

  const trainerInfo = await getTrainerInfo(user.id)

  if (!trainerInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md rounded-2xl shadow-lg">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Not Authorized</h2>
            <p className="text-muted-foreground mb-4">
              You are not registered as a trainer. Please contact your organization administrator.
            </p>
            <Button onClick={() => redirect("/trainer/sign-in")}>
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sittings = await getTrainerSittings(trainerInfo.id)

  const upcomingSittings = sittings.filter(s => s.status === 'scheduled')
  const activeSittings = sittings.filter(s => s.status === 'active')
  const completedSittings = sittings.filter(s => s.status === 'completed')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>
      case 'active':
        return <Badge className="bg-green-600">Active</Badge>
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Trainer Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {trainerInfo.name}
              </div>
              <form action="/auth/sign-out" method="post">
                <Button type="submit" variant="outline" size="sm">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {trainerInfo.name}</h2>
          <p className="text-muted-foreground mt-1">
            {(trainerInfo.organization as any)?.name}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{upcomingSittings.length}</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activeSittings.length}</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedSittings.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>My Assessment Sessions</CardTitle>
            <CardDescription>
              Sessions assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sittings.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No sessions assigned yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sittings.map((sitting) => (
                  <div
                    key={sitting.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold">{sitting.short_code}</span>
                        {getStatusBadge(sitting.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="uppercase">{sitting.sitting_type}</span>
                        {sitting.session_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(sitting.session_date)} {sitting.session_time}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/trainer/${sitting.token}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
