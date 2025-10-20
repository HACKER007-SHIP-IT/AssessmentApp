"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Mail, AlertCircle, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get email from query param or localStorage
  const email = useMemo(() => {
    const emailParam = searchParams.get("e")
    if (emailParam) {
      // Store in localStorage for persistence across refresh
      if (typeof window !== "undefined") {
        localStorage.setItem("signup_email", emailParam)
      }
      return emailParam
    }
    // Fall back to localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem("signup_email") || ""
    }
    return ""
  }, [searchParams])

  // Mask email for display (mark******@domain.com)
  const maskedEmail = useMemo(() => {
    if (!email) return ""
    const [localPart, domain] = email.split("@")
    if (!domain) return email
    const maskedLocal = localPart[0] + "*".repeat(Math.max(0, localPart.length - 1))
    return `${maskedLocal}@${domain}`
  }, [email])

  const [code, setCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")
  const [cooldown, setCooldown] = useState(0)
  const [resendCount, setResendCount] = useState(0)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Check if user arrived from old magic link
  const showInfoBanner = searchParams.get("info") === "use-code"

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // Error mapping to UK-friendly messages
  function mapSupabaseOtpError(error: any): string {
    const msg = error.message.toLowerCase()

    if (msg.includes("expired")) {
      return "That code's expired. Please request a new one below."
    }
    if (msg.includes("invalid") || msg.includes("mismatch") || msg.includes("not found")) {
      return "That code doesn't look right. Please try again."
    }
    if (msg.includes("rate") || msg.includes("too many")) {
      return "Too many tries — please wait a minute."
    }

    return "Something went wrong. Please try again."
  }

  // Handle code input (strip non-digits, auto-submit)
  function handleCodeChange(value: string) {
    // Strip non-digits and limit to 6
    const cleaned = value.replace(/\D/g, "").slice(0, 6)
    setCode(cleaned)
    setError("") // Clear error on typing

    // Auto-submit when 6 digits entered
    if (cleaned.length === 6) {
      handleVerify(cleaned)
    }
  }

  // Verify the OTP code
  async function handleVerify(codeValue: string) {
    if (!email) {
      setError("Email address not found. Please sign up again.")
      return
    }

    setVerifying(true)
    setError("")

    try {
      const supabase = createClient()

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: codeValue,
        type: "email",
      })

      if (verifyError) {
        // Handle "already verified" as success
        const msg = verifyError.message.toLowerCase()
        if (msg.includes("already") || msg.includes("verified")) {
          // Treat as success
          const next = searchParams.get("next") || "/admin"
          router.push(`/onboarding?next=${encodeURIComponent(next)}`)
          return
        }

        setError(mapSupabaseOtpError(verifyError))
        setVerifying(false)
        setCode("") // Clear code on error
        return
      }

      // Success! Clear localStorage and redirect
      if (typeof window !== "undefined") {
        localStorage.removeItem("signup_email")
      }

      const next = searchParams.get("next") || "/admin"
      router.push(`/onboarding?next=${encodeURIComponent(next)}`)

    } catch (err) {
      console.error("Verification error:", err)
      setError("An unexpected error occurred. Please try again.")
      setVerifying(false)
      setCode("")
    }
  }

  // Resend verification code
  async function handleResend() {
    if (cooldown > 0) return
    if (resendCount >= 5) {
      setError("Maximum resends reached. Please try again in an hour.")
      return
    }

    if (!email) {
      setError("Email address not found. Please sign up again.")
      return
    }

    setResending(true)
    setError("")
    setResendSuccess(false)

    try {
      const supabase = createClient()
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (resendError) {
        const msg = resendError.message.toLowerCase()
        if (msg.includes("rate") || msg.includes("too many")) {
          setError("Too many requests. Please wait a minute.")
        } else {
          setError("Failed to resend code. Please try again.")
        }
        setResending(false)
        return
      }

      // Success
      setResendCount(prev => prev + 1)
      setCooldown(60) // 60 second cooldown
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 3000)

    } catch (err) {
      console.error("Resend error:", err)
      setError("Failed to resend code. Please try again.")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to{" "}
            <span className="font-semibold text-foreground">{maskedEmail || "your email"}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Info banner for users arriving from old magic links */}
          {showInfoBanner && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Verification links have been updated</p>
                <p>Please check your email for a 6-digit verification code and enter it below instead.</p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-3 text-sm text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Resend success */}
          {resendSuccess && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>New code sent! Check your inbox.</p>
            </div>
          )}

          {/* OTP Input */}
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">
              Verification Code
            </label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              disabled={verifying}
              autoFocus
              autoComplete="one-time-code"
              aria-label="Verification code"
              className="text-center text-2xl font-mono tracking-wider"
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground text-center">
              Enter the 6-digit code from your email
            </p>
          </div>

          {/* Verify Button */}
          <Button
            onClick={() => handleVerify(code)}
            disabled={code.length !== 6 || verifying}
            className="w-full"
            size="lg"
          >
            {verifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>

          {/* Instructions */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
            <p className="font-medium mb-2">What to do next:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Check your inbox for an email from us</li>
              <li>Copy the 6-digit code from the email</li>
              <li>Enter it above to verify your account</li>
            </ol>
          </div>

          {/* Spam reminder */}
          <p className="text-sm text-muted-foreground text-center">
            Not arrived? Check your spam/junk folder
          </p>

          {/* Resend button */}
          <Button
            onClick={handleResend}
            disabled={cooldown > 0 || resending || resendCount >= 5}
            variant="outline"
            className="w-full"
          >
            {resending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : resendCount >= 5 ? (
              "Maximum resends reached"
            ) : (
              "Resend verification code"
            )}
          </Button>

          {/* Support link */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <Link href="mailto:support@example.com" className="text-primary hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
