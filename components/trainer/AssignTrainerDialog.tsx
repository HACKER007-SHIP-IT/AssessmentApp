"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, UserCheck } from "lucide-react"
import { assignTrainerToSitting } from "@/lib/actions/sittings"

type Trainer = {
  id: string
  name: string
  email: string
}

type AssignTrainerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sittingId: string
  currentTrainerId: string | null
  trainers: Trainer[]
  currentUserId?: string
  onSuccess: () => void
}

export function AssignTrainerDialog({
  open,
  onOpenChange,
  sittingId,
  currentTrainerId,
  trainers,
  currentUserId,
  onSuccess,
}: AssignTrainerDialogProps) {
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(currentTrainerId)
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState("")

  const handleAssign = async () => {
    if (isAssigning) return

    setIsAssigning(true)
    setError("")

    try {
      await assignTrainerToSitting(sittingId, selectedTrainerId)
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to assign trainer:", err)
      setError(err instanceof Error ? err.message : "Failed to assign trainer")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleAssignToMe = async () => {
    if (!currentUserId || isAssigning) return

    setIsAssigning(true)
    setError("")

    try {
      await assignTrainerToSitting(sittingId, currentUserId)
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to assign trainer:", err)
      setError(err instanceof Error ? err.message : "Failed to assign trainer")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassign = async () => {
    if (isAssigning) return
    if (!confirm("Remove trainer assignment? The practical assessment will not be accessible until a trainer is assigned.")) return

    setIsAssigning(true)
    setError("")

    try {
      await assignTrainerToSitting(sittingId, null)
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to unassign trainer:", err)
      setError(err instanceof Error ? err.message : "Failed to unassign trainer")
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Trainer</DialogTitle>
          <DialogDescription>
            Select a trainer to conduct this sitting's practical assessment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {currentUserId && (
            <Button
              onClick={handleAssignToMe}
              disabled={isAssigning}
              variant="outline"
              className="w-full"
            >
              {isAssigning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4 mr-2" />
              )}
              Assign to Me
            </Button>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Trainer</label>
            <Select
              value={selectedTrainerId || "none"}
              onValueChange={(value) => setSelectedTrainerId(value === "none" ? null : value)}
              disabled={isAssigning}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a trainer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No trainer assigned</SelectItem>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name} ({trainer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          {currentTrainerId && (
            <Button
              onClick={handleUnassign}
              disabled={isAssigning}
              variant="outline"
            >
              Unassign
            </Button>
          )}
          <Button
            onClick={handleAssign}
            disabled={isAssigning || selectedTrainerId === currentTrainerId}
          >
            {isAssigning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Trainer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
