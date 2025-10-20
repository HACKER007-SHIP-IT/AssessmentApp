"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Calendar, MoreVertical, Trash2, Edit, Link2, Copy, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteTrainer, generateTrainerMagicLink } from "@/lib/actions/trainers"

interface Trainer {
  id: string
  name: string
  email: string
  is_active: boolean
  created_at: string
  user_id: string | null
}

export function TrainersList({ trainers }: { trainers: Trainer[] }) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [magicLinkDialogOpen, setMagicLinkDialogOpen] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [magicLink, setMagicLink] = useState<string>("")
  const [linkCopied, setLinkCopied] = useState(false)

  const handleDelete = async () => {
    if (!selectedTrainer) return

    setIsDeleting(true)
    try {
      await deleteTrainer(selectedTrainer.id)
      router.refresh()
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Failed to delete trainer:", error)
      alert("Failed to delete trainer. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleGenerateMagicLink = async (trainer: Trainer) => {
    setSelectedTrainer(trainer)
    setIsGeneratingLink(true)
    setMagicLinkDialogOpen(true)
    setLinkCopied(false)

    try {
      const result = await generateTrainerMagicLink(trainer.id)
      setMagicLink(result.magicLink)
    } catch (error: any) {
      console.error("Failed to generate magic link:", error)
      alert(error.message || "Failed to generate magic link. Please try again.")
      setMagicLinkDialogOpen(false)
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(magicLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <>
      <div className="grid gap-4">
        {trainers.map((trainer) => (
          <Card key={trainer.id} className="rounded-2xl shadow-lg">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{trainer.name}</h3>
                  {!trainer.is_active && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  {trainer.user_id && (
                    <Badge variant="outline" className="text-xs">
                      Account Active
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {trainer.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Added {formatDate(trainer.created_at)}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleGenerateMagicLink(trainer)}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Generate Magic Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/trainers/${trainer.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      setSelectedTrainer(trainer)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={magicLinkDialogOpen} onOpenChange={setMagicLinkDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Magic Link Generated</DialogTitle>
            <DialogDescription>
              Share this link with {selectedTrainer?.name} to give them access to their assigned sittings. This link expires in 7 days.
            </DialogDescription>
          </DialogHeader>

          {isGeneratingLink ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-mono break-all">{magicLink}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCopyLink}
                  className="flex-1"
                  variant={linkCopied ? "secondary" : "default"}
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    window.open(`mailto:${selectedTrainer?.email}?subject=Training Session Access&body=Hi ${selectedTrainer?.name},%0D%0A%0D%0APlease use this link to access your assigned training sessions:%0D%0A%0D%0A${magicLink}%0D%0A%0D%0AThis link expires in 7 days.`, '_blank')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trainer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTrainer?.name}? This will deactivate their account but preserve historical data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
