import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ClipboardList, Calendar, Users, BarChart3 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { getCurrentUserOrganization } from "@/lib/actions/organizations"

async function getOrganizationSittings(organizationId: string) {
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
      status,
      created_at,
      assigned_trainer:trainer_users(
        name,
        email
      )
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sittings:', error)
    return []
  }

  return data
}

export default async function SittingsPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/sign-in")
  }

  const orgData = await getCurrentUserOrganization()

  if (!orgData) {
    redirect("/admin/setup")
  }

  const sittings = await getOrganizationSittings(orgData.organization.id)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled'
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assessment Sittings</h1>
          <p className="text-muted-foreground mt-1">
            Manage assessment sessions for {orgData.organization.name}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/sittings/new">
            <Plus className="h-4 w-4 mr-2" />
            New Sitting
          </Link>
        </Button>
      </div>

      {sittings.length === 0 ? (
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sittings yet</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              Create your first assessment sitting to get started.
            </p>
            <Button asChild>
              <Link href="/admin/sittings/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Sitting
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sittings.map((sitting) => (
            <Card key={sitting.id} className="rounded-2xl shadow-lg">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{sitting.short_code}</h3>
                    {getStatusBadge(sitting.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="uppercase">{sitting.sitting_type}</span>
                    {sitting.session_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(sitting.session_date)} {sitting.session_time || ''}
                      </div>
                    )}
                    {sitting.assigned_trainer && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {(sitting.assigned_trainer as any).name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/sittings/${sitting.id}/results`}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Results
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/trainer/${sitting.token}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
