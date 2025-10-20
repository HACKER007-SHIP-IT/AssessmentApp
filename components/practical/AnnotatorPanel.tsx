"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Circle, X } from "lucide-react"

type LO = {
  id: string
  lo_number: string
  skill_description: string
}

type AnnotatorPanelProps = {
  open: boolean
  mode: 'pass_oral' | 'fail'
  loList: LO[]
  selectedLOs: Set<string>
  notes: string
  onToggleLO: (loId: string) => void
  onNotesChange: (notes: string) => void
  onSave: () => void
  onClose: () => void
  isSaving?: boolean
}

export function AnnotatorPanel({
  open,
  mode,
  loList,
  selectedLOs,
  notes,
  onToggleLO,
  onNotesChange,
  onSave,
  onClose,
  isSaving = false,
}: AnnotatorPanelProps) {
  const isOralMode = mode === 'pass_oral'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isOralMode ? (
              <>
                <Circle className="h-5 w-5 text-blue-600" />
                Pass (Oral) - Select LOs
              </>
            ) : (
              <>
                <X className="h-5 w-5 text-red-600" />
                Record Failures - Select LOs
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isOralMode
              ? "Select the Learning Outcomes that required oral questioning to confirm underpinning knowledge."
              : "Select the Learning Outcomes that the student failed to demonstrate competently."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* LO Selection */}
          <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-4">
            {loList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No learning outcomes available for this section.
              </p>
            ) : (
              loList.map((lo) => (
                <div
                  key={lo.id}
                  className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition"
                >
                  <Checkbox
                    id={`lo-${lo.id}`}
                    checked={selectedLOs.has(lo.id)}
                    onCheckedChange={() => onToggleLO(lo.id)}
                    className="mt-1"
                  />
                  <Label
                    htmlFor={`lo-${lo.id}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    <span className="font-semibold text-focus-text">
                      {lo.lo_number}
                    </span>{" "}
                    {lo.skill_description}
                  </Label>
                </div>
              ))
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="annotator-notes" className="text-sm font-medium">
              Notes {isOralMode ? "(Optional)" : "(Recommended)"}
            </Label>
            <Textarea
              id="annotator-notes"
              placeholder={
                isOralMode
                  ? "Add notes about the oral questioning (optional)..."
                  : "Describe what went wrong and any feedback provided..."
              }
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="mt-2 min-h-[100px]"
              disabled={isSaving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving || selectedLOs.size === 0}
            className={isOralMode ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
