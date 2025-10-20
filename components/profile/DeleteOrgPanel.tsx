"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Loader2, AlertCircle } from "lucide-react"
import { deleteOrganization } from "@/lib/actions/organizations"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteOrgPanelProps {
  organizationName: string
  role: 'owner' | 'admin'
  hasActiveSittings: boolean
}

/**
 * DeleteOrgPanel Component
 *
 * Danger zone for organization deletion with:
 * - Owner-only access
 * - Type organization name to confirm
 * - Blocks deletion if active sittings exist
 * - Soft delete (is_deleted flag)
 * - Audit trail logging
 */
export function DeleteOrgPanel({ organizationName, role, hasActiveSittings }: DeleteOrgPanelProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [confirmName, setConfirmName] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const isOwner = role === 'owner'
  const canDelete = isOwner && !hasActiveSittings && confirmName === organizationName

  const handleDelete = async () => {
    if (!canDelete) return

    setIsDeleting(true)

    try {
      const result = await deleteOrganization(confirmName)

      if (result.success) {
        toast({
          title: "Organization deleted",
          description: "Your organization has been deleted. Redirecting to sign in...",
        })

        // Redirect to signin after deletion
        setTimeout(() => {
          router.push('/signin')
        }, 2000)
      } else {
        throw new Error('Deletion failed')
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: error.message || "Failed to delete organization",
      })
      setIsDeleting(false)
      setDialogOpen(false)
    }
  }

  if (!isOwner) {
    return null // Don't show to non-owners
  }

  return (
    <Card className="rounded-2xl shadow-lg border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Permanently delete your organization and all associated data
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Warning for active sittings */}
        {hasActiveSittings && (
          <div className="p-4 rounded-lg border bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Cannot Delete Organization</p>
                <p className="text-sm text-amber-800 mt-1">
                  Your organization has active sittings or student data.
                  Please contact support at <strong>support@focusassessments.com</strong> to request deletion.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Deletion Form */}
        {!hasActiveSittings && (
          <>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive font-medium mb-2">
                Warning: This action cannot be undone
              </p>
              <p className="text-sm text-muted-foreground">
                Deleting your organization will:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>Remove all trainers and their accounts</li>
                <li>Delete all assessment data</li>
                <li>Cancel any active subscriptions</li>
                <li>Remove all organization settings</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmName">
                Type <strong className="text-destructive">{organizationName}</strong> to confirm
              </Label>
              <Input
                id="confirmName"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={organizationName}
                disabled={isDeleting}
              />
            </div>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={!canDelete || isDeleting}
                  className="w-full"
                >
                  Delete Organization
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete <strong>{organizationName}</strong> and all associated data.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Organization'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {/* Contact Support */}
        {hasActiveSittings && (
          <Button
            variant="outline"
            asChild
            className="w-full"
          >
            <a href="mailto:support@focusassessments.com?subject=Organization Deletion Request">
              Contact Support
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
