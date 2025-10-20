"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, Building2, AlertCircle } from "lucide-react"
import { createOrganizationSafe, getCurrentUserOrganization } from "@/lib/actions/organizations"

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/admin"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Check if user already has an organization on mount
  useEffect(() => {
    async function checkOrganization() {
      try {
        // Skip auto-redirect if coming from setup wizard
        const fromSetup = searchParams.get("from") === "setup"
        if (fromSetup) {
          setChecking(false)
          return
        }

        const orgData = await getCurrentUserOrganization()
        if (orgData && orgData.organization) {
          // User already has organization AND membership - they're fully set up
          // Redirect to admin dashboard, bypassing the rest of onboarding
          router.push(next || '/admin')
          return
        }

        // No org or membership - stay on this page to create org
      } catch (err) {
        console.error("Error checking organization:", err)
      } finally {
        setChecking(false)
      }
    }

    checkOrganization()
  }, [router, next, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Organization name is required")
      return
    }

    setError(null)

    // Hard timeout to prevent infinite spinner
    const timeoutId = setTimeout(() => {
      setError("This is taking longer than expected. Please check your internet connection and try again.")
    }, 12000) // 12 second timeout

    startTransition(async () => {
      try {
        const result = await createOrganizationSafe({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
        })

        clearTimeout(timeoutId)

        if (!result.ok) {
          setError(result.message || "Failed to create organization. Please try again.")
          return
        }

        // Success! Organization created with membership
        // Redirect to admin dashboard - onboarding complete!
        router.push(next || '/admin')

      } catch (err: any) {
        clearTimeout(timeoutId)
        console.error("Unexpected onboarding error:", err)
        setError("An unexpected error occurred. Please try again.")
      }
    })
  }

  const handleQuickStart = async () => {
    setError(null)

    const timeoutId = setTimeout(() => {
      setError("This is taking longer than expected. Please check your internet connection and try again.")
    }, 12000)

    startTransition(async () => {
      try {
        // Create org with default name
        const defaultName = `My Organization ${new Date().getFullYear()}`

        const result = await createOrganizationSafe({
          name: defaultName,
        })

        clearTimeout(timeoutId)

        if (!result.ok) {
          setError(result.message || "Failed to create organization. Please try again.")
          return
        }

        // Success - redirect to admin
        router.push(next || '/admin')

      } catch (err: any) {
        clearTimeout(timeoutId)
        console.error("Unexpected quick start error:", err)
        setError("An unexpected error occurred. Please try again.")
      }
    })
  }

  // Show loading while checking if user already has organization
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to AssessmentApp!</CardTitle>
          <CardDescription>
            Your email has been verified. Let's set up your organization to get started with your 14-day free trial.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message with retry */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive mb-2">{error}</p>
                    <details className="text-xs text-destructive/80">
                      <summary className="cursor-pointer hover:underline">What might cause this?</summary>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>You may be offline or have a poor connection</li>
                        <li>The database migration may not have been applied yet</li>
                        <li>Your account may not have the required permissions</li>
                      </ul>
                    </details>
                  </div>
                </div>
              </div>
            )}

            {/* Trial info banner */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">14-Day Free Trial</p>
                  <p className="text-blue-800">
                    Your trial starts today. No payment required. Cancel anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* Organization name (required) */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Organization Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. Fire Training Academy Ltd"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
              />
              <p className="text-xs text-muted-foreground">
                This is your training provider or company name
              </p>
            </div>

            {/* Optional fields */}
            <div className="space-y-4 pt-2">
              <p className="text-sm font-medium text-muted-foreground">
                Optional information (you can add these later)
              </p>

              {/* Organization email */}
              <div className="space-y-2">
                <Label htmlFor="email">Organization Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+44 20 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isPending}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main Street, London, UK"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Submit button */}
            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up your organization...
                </>
              ) : (
                "Complete setup and start trial"
              )}
            </Button>

            {/* Quick start button */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleQuickStart}
              disabled={isPending}
            >
              Quick Start (skip details)
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
