import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Users, TrendingUp, Award, Calendar, Download, CreditCard } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserOrganization } from "@/lib/actions/organizations"
import { getAdminKPIs, getPassRateOverTime, getAttemptsByCourse, getRecentSittings } from "@/lib/actions/analytics"
import { PassRateChart } from "@/components/charts/PassRateChart"
import { CourseAttemptsChart } from "@/components/charts/CourseAttemptsChart"
import { TrialBanner } from "@/components/TrialBanner"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/sign-in")
  }

  // Check if user has an organisation
  const orgData = await getCurrentUserOrganization()

  if (!orgData) {
    redirect("/admin/setup")
  }

  const { organization } = orgData

  // Fetch analytics data
  const kpis = await getAdminKPIs(30)
  const passRateData = await getPassRateOverTime(30)
  const courseData = await getAttemptsByCourse(30)
  const recentSittings = await getRecentSittings(10)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>
      case 'in_progress':
      case 'active':
        return <Badge className="bg-focus-green">Active</Badge>
      case 'completed':
      case 'closed':
        return <Badge variant="secondary">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Gradient Header Bar */}
      <div className="bg-focus-gradient -mt-6 -mx-6 px-6 py-8 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-white/80 mt-1">
                {organization.name} • Last 30 days
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="lg" className="bg-white text-focus-blue hover:bg-white/90 shadow-lg lift-hover">
                <Link href="/admin/sittings/new">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  New Sitting
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
      {/* Trial Banner */}
      <TrialBanner
        trialEndDate={organization.trial_end_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()}
        plan={organization.plan || "trial"}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl shadow-lg border-l-4 border-l-focus-blue lift-hover animate-scale-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Sittings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-focus-blue">{kpis.sittings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Created in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-l-4 border-l-focus-teal lift-hover animate-scale-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-focus-teal">{kpis.attempts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Submitted assessments
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-l-4 border-l-focus-green lift-hover animate-scale-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-focus-green">{kpis.passRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Students passing
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-l-4 border-l-purple-500 lift-hover animate-scale-in" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{kpis.averageScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all attempts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Pass Rate Over Time</CardTitle>
            <CardDescription>Daily pass rate trend for last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {passRateData.length > 0 ? (
              <PassRateChart data={passRateData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Attempts by Course</CardTitle>
            <CardDescription>Assessment attempts breakdown by course type</CardDescription>
          </CardHeader>
          <CardContent>
            {courseData.length > 0 ? (
              <CourseAttemptsChart data={courseData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sittings Table */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Sittings</CardTitle>
              <CardDescription>Latest assessment sessions</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentSittings.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No sittings created yet
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/sittings/new">Create Your First Sitting</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSittings.map((sitting) => (
                <div
                  key={sitting.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-focus-light/30 transition"
                >
                  <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="font-semibold">{sitting.short_code}</p>
                      <p className="text-sm text-muted-foreground">
                        {(sitting.paper as any).course_type.code}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Trainer</p>
                      <p className="text-sm font-medium">
                        {(sitting.assigned_trainer as any)?.name || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">
                        {sitting.session_date ? formatDate(sitting.session_date) : formatDate(sitting.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Students</p>
                      <p className="text-sm font-medium">
                        {sitting.submittedAttempts}/{sitting.totalAttempts}
                      </p>
                    </div>
                    <div>
                      {sitting.passRate !== null && sitting.submittedAttempts > 0 ? (
                        <div>
                          <p className="text-sm text-muted-foreground">Pass Rate</p>
                          <p className={`text-sm font-bold ${
                            sitting.passRate >= 70 ? 'text-focus-green' : 'text-red-600'
                          }`}>
                            {sitting.passRate}%
                          </p>
                        </div>
                      ) : (
                        <Badge variant="outline">No submissions</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {getStatusBadge(sitting.status)}
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/trainer/${sitting.token}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-focus-blue" />
              Trainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your organisation's trainers
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/trainers">
                Manage Trainers
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-focus-blue" />
              All Sittings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage all assessment sittings
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/sittings">
                View All Sittings
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-focus-blue" />
              Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your subscription and billing
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/billing">
                View Billing
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
