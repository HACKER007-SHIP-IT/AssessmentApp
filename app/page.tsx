import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Users, LogIn } from "lucide-react"

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Focus Assessments</h1>
        <p className="text-lg text-muted-foreground">
          Simple, reliable assessments for FAIB providers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Admin</CardTitle>
            </div>
            <CardDescription>
              Manage sittings, trainers, and assessment configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin">Go to Admin</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle>Trainer Console</CardTitle>
            </div>
            <CardDescription>
              Monitor and manage your assessment sitting in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/trainer/demo-token">View Demo</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogIn className="h-6 w-6 text-primary" />
              <CardTitle>Join Assessment</CardTitle>
            </div>
            <CardDescription>
              Enter your short code to join an assessment sitting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="secondary">
              <Link href="/join">Join Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
