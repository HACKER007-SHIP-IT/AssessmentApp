import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle2, Users, ClipboardList, Building2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserOrganization } from "@/lib/actions/organizations"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/sign-in")
  }

  // Check if user has an organization
  const orgData = await getCurrentUserOrganization()

  if (!orgData) {
    redirect("/admin/setup")
  }

  const { organization, role } = orgData

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {organization.name}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Organization Card */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{organization.name}</p>
              </div>
              {organization.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{organization.email}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Your Role</p>
                <p className="font-medium capitalize">{role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trainers Card */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Trainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your organization's trainers
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/trainers">
                Manage Trainers
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Sittings Card */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-primary" />
              Sittings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage assessment sittings
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/sittings">
                View Sittings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="font-medium">Signed in as:</span>
            <span className="text-muted-foreground">{user.email}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
