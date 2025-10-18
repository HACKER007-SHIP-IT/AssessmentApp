"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Home, LogIn } from "lucide-react"

export default function AttemptDemoPage() {
  const searchParams = useSearchParams()
  const studentName = searchParams.get("name") || "Student"
  const shortCode = searchParams.get("sc") || "UNKNOWN"

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card className="rounded-2xl shadow-lg border-2 border-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            UI Demo Mode
          </CardTitle>
          <CardDescription>
            This is a placeholder page for the assessment attempt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm font-medium text-yellow-900 mb-2">
              Welcome, {studentName}!
            </p>
            <p className="text-sm text-yellow-800">
              You have successfully joined assessment sitting: <span className="font-mono font-bold">{shortCode}</span>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">UI-Only Demo Notice</h3>
            <p className="text-sm text-muted-foreground">
              This is a placeholder page for Block 3. In future blocks, this page will display:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-4">
              <li>Assessment questions loaded from the database</li>
              <li>Multiple choice answer options with randomization</li>
              <li>Timer showing remaining time</li>
              <li>Progress indicator showing questions completed</li>
              <li>Submit button to finalize answers</li>
              <li>Real-time sync with trainer console</li>
            </ul>
          </div>

          <div className="rounded-lg border p-4 bg-muted">
            <p className="text-sm font-medium mb-2">Current Status:</p>
            <p className="text-sm text-muted-foreground">
              No questions or answer data will be saved. This is purely a UI demonstration
              of the student join flow.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/join">
                <LogIn className="h-4 w-4 mr-2" />
                Join Another
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
