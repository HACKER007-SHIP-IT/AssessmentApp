"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { emailUpdateSchema, type EmailUpdateInput } from "@/lib/validation/profile"
import { updateEmail } from "@/lib/actions/auth"
import { useToast } from "@/hooks/use-toast"

interface EmailChangeFormProps {
  currentEmail: string
}

/**
 * EmailChangeForm Component
 *
 * Allows users to update their email with:
 * - Validation
 * - Verification email sent to new address
 * - Persistent banner until confirmed
 */
export function EmailChangeForm({ currentEmail }: EmailChangeFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmailUpdateInput>({
    resolver: zodResolver(emailUpdateSchema),
  })

  const onSubmit = async (data: EmailUpdateInput) => {
    setIsSubmitting(true)

    try {
      const result = await updateEmail(data.newEmail)

      if (result.success) {
        setVerificationSent(true)
        setPendingEmail(data.newEmail)
        reset()

        toast({
          title: "Verification email sent",
          description: result.message || `Check your inbox at ${data.newEmail}`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Email update failed",
          description: result.error || "Please try again",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update email",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Change Email Address
        </CardTitle>
        <CardDescription>
          Update the email address associated with your account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Verification Banner - Persistent until confirmed */}
        {verificationSent && pendingEmail && (
          <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Verification Email Sent</p>
                <p className="text-sm text-blue-800 mt-1">
                  We've sent a verification email to <strong>{pendingEmail}</strong>.
                  Please check your inbox and click the confirmation link to complete the change.
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Your email will remain <strong>{currentEmail}</strong> until verified.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Email (Read-only) */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="text-sm text-muted-foreground mb-1">Current Email</p>
          <p className="text-lg font-medium">{currentEmail}</p>
        </div>

        {/* Change Email Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newEmail">
              New Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="new.email@example.com"
              {...register("newEmail")}
              className={errors.newEmail ? "border-destructive" : ""}
              disabled={isSubmitting}
            />
            {errors.newEmail && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {errors.newEmail.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending verification email...
              </>
            ) : (
              'Update email address'
            )}
          </Button>

          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">Important:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>A verification email will be sent to your new address</li>
              <li>Click the link in the email to confirm the change</li>
              <li>Your current email remains active until verified</li>
              <li>You'll be able to sign in with either email during verification</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
