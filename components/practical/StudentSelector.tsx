"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, Circle, User, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Student = {
  id: string
  name: string
  email: string
  practicalAttempt?: {
    id: string
    completed_at: string | null
    overall_pass: boolean | null
  } | null
}

type StudentSelectorProps = {
  students: Student[]
  selectedStudentId?: string
  onSelectStudent: (studentId: string) => void
}

export function StudentSelector({
  students,
  selectedStudentId,
  onSelectStudent,
}: StudentSelectorProps) {
  const getStatusInfo = (student: Student) => {
    if (!student.practicalAttempt) {
      return {
        icon: Circle,
        label: "Not Started",
        color: "text-gray-400",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
      }
    }

    if (student.practicalAttempt.completed_at) {
      if (student.practicalAttempt.overall_pass) {
        return {
          icon: CheckCircle2,
          label: "Passed",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        }
      } else {
        return {
          icon: XCircle,
          label: "Failed",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        }
      }
    }

    return {
      icon: Clock,
      label: "In Progress",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    }
  }

  const groupedStudents = {
    inProgress: students.filter(s => s.practicalAttempt && !s.practicalAttempt.completed_at),
    notStarted: students.filter(s => !s.practicalAttempt),
    completed: students.filter(s => s.practicalAttempt?.completed_at),
  }

  const renderStudentCard = (student: Student) => {
    const status = getStatusInfo(student)
    const StatusIcon = status.icon
    const isSelected = selectedStudentId === student.id

    return (
      <Card
        key={student.id}
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isSelected && "ring-2 ring-focus-blue shadow-lg",
          status.borderColor
        )}
        onClick={() => onSelectStudent(student.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              status.bgColor
            )}>
              <StatusIcon className={cn("h-5 w-5", status.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <p className="font-medium text-focus-text truncate">{student.name}</p>
              </div>
              <p className="text-sm text-muted-foreground truncate">{student.email}</p>
            </div>
            <Badge variant="outline" className={cn("flex-shrink-0", status.color)}>
              {status.label}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* In Progress */}
      {groupedStudents.inProgress.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-focus-text mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            In Progress ({groupedStudents.inProgress.length})
          </h3>
          <div className="space-y-2">
            {groupedStudents.inProgress.map(renderStudentCard)}
          </div>
        </div>
      )}

      {/* Not Started */}
      {groupedStudents.notStarted.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-focus-text mb-3 flex items-center gap-2">
            <Circle className="h-4 w-4 text-gray-400" />
            Not Started ({groupedStudents.notStarted.length})
          </h3>
          <div className="space-y-2">
            {groupedStudents.notStarted.map(renderStudentCard)}
          </div>
        </div>
      )}

      {/* Completed */}
      {groupedStudents.completed.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-focus-text mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Completed ({groupedStudents.completed.length})
          </h3>
          <div className="space-y-2">
            {groupedStudents.completed.map(renderStudentCard)}
          </div>
        </div>
      )}

      {students.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Circle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No students have joined this sitting yet
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
