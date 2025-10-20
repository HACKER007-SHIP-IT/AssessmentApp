"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, Play, CheckCircle, XCircle, Undo, ClipboardList, FileText, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { startWrittenForStudent, markPracticalStatus, undoPracticalStatus } from "@/lib/actions/enrolments"
import type { EnrolledStudent } from "@/lib/actions/enrolments"

type StudentActionMenuProps = {
  student: EnrolledStudent
  sittingId: string
  sittingToken: string
  sittingStatus: 'scheduled' | 'in_progress' | 'closed'
  onSuccess: () => void
}

export function StudentActionMenu({
  student,
  sittingId,
  sittingToken,
  sittingStatus,
  onSuccess,
}: StudentActionMenuProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleStartWritten = async () => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      await startWrittenForStudent({ sittingId, studentId: student.id })
      onSuccess()
    } catch (error) {
      console.error('Error starting written:', error)
      alert('Failed to start written assessment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMarkPractical = async (status: 'passed' | 'failed') => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      await markPracticalStatus({ enrolmentId: student.enrolment_id, status })
      onSuccess()
    } catch (error) {
      console.error('Error marking practical:', error)
      alert('Failed to mark practical status')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUndoPractical = async () => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      await undoPracticalStatus({ enrolmentId: student.enrolment_id })
      onSuccess()
    } catch (error) {
      console.error('Error undoing practical:', error)
      alert(error instanceof Error ? error.message : 'Failed to undo practical status')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopyLink = async () => {
    // TODO: Implement copy written link
    console.log('Copy link for student:', student.id)
  }

  const handleViewPractical = () => {
    router.push(`/trainer/${sittingToken}/practical?student=${student.id}`)
  }

  const handleViewAnswers = () => {
    // TODO: Navigate to written answers
    console.log('View answers for student:', student.id)
  }

  const canStartWritten = student.written_status === 'enrolled'
  const canMarkPractical = sittingStatus !== 'closed'
  const canUndoPractical =
    student.practical_status !== 'not_started' &&
    student.written_status !== 'submitted' &&
    sittingStatus !== 'closed'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={isProcessing}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canStartWritten && (
          <>
            <DropdownMenuItem onClick={handleStartWritten}>
              <Play className="h-4 w-4 mr-2" />
              Start written
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {canMarkPractical && (
          <>
            <DropdownMenuItem onClick={() => handleMarkPractical('passed')}>
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Mark practical → Pass
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMarkPractical('failed')}>
              <XCircle className="h-4 w-4 mr-2 text-red-600" />
              Mark practical → Fail
            </DropdownMenuItem>
          </>
        )}

        {canUndoPractical && (
          <DropdownMenuItem onClick={handleUndoPractical}>
            <Undo className="h-4 w-4 mr-2" />
            Undo practical
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleViewPractical}>
          <ClipboardList className="h-4 w-4 mr-2" />
          View practical checklist
        </DropdownMenuItem>

        {student.written_status === 'submitted' && (
          <DropdownMenuItem onClick={handleViewAnswers}>
            <FileText className="h-4 w-4 mr-2" />
            View written answers
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleCopyLink}>
          <Link className="h-4 w-4 mr-2" />
          Copy written link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
