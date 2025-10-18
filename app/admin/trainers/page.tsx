import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus, Mail, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserOrganization } from "@/lib/actions/organizations"
import { getOrganizationTrainers } from "@/lib/actions/trainers"
import { TrainersList } from "./trainers-list"

export default async function TrainersPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/sign-in")
  }

  const orgData = await getCurrentUserOrganization()

  if (!orgData) {
    redirect("/admin/setup")
  }

  const trainers = await getOrganizationTrainers()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trainers</h1>
          <p className="text-muted-foreground mt-1">
            Manage trainers for {orgData.organization.name}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/trainers/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Trainer
          </Link>
        </Button>
      </div>

      {trainers.length === 0 ? (
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No trainers yet</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              Add trainers to your organization so they can be assigned to assessment sittings.
            </p>
            <Button asChild>
              <Link href="/admin/trainers/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Trainer
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TrainersList trainers={trainers} />
      )}
    </div>
  )
}
