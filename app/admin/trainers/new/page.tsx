"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, UserPlus } from "lucide-react"
import { createTrainer } from "@/lib/actions/trainers"

export default function NewTrainerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromSetup = searchParams.get('from') === 'setup'

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Name is required")
      return
    }

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await createTrainer({
        name: name.trim(),
        email: email.trim(),
      })

      // If coming from setup wizard, mark trainer as added and redirect back
      if (fromSetup) {
        localStorage.setItem("trainerAdded", "true")
        router.push("/onboarding/setup")
      } else {
        router.push("/admin/trainers")
      }
      router.refresh()
    } catch (err: any) {
      console.error("Failed to create trainer:", err)
      setError(err.message || "Failed to create trainer. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href={fromSetup ? "/onboarding/setup" : "/admin/trainers"}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {fromSetup ? "Back to Setup" : "Back to Trainers"}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Add New Trainer</h1>
        <p className="text-muted-foreground mt-1">
          Add a trainer to your organisation
        </p>
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Trainer Details
          </CardTitle>
          <CardDescription>
            Enter the trainer's name and email address. They can later create their own account using this email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., john.smith@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
              <p className="text-xs text-muted-foreground">
                The trainer will use this email to sign in
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(fromSetup ? "/onboarding/setup" : "/admin/trainers")}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Trainer...
                  </>
                ) : (
                  'Add Trainer'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
