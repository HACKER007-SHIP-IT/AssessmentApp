"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { EnrolledStudent } from "@/lib/actions/enrolments"

type ResultsPanelProps = {
  students: EnrolledStudent[]
  sittingId: string
}

export function ResultsPanel({ students, sittingId }: ResultsPanelProps) {
  const handleExportCSV = async () => {
    // TODO: Call exportSittingCSV and download file
    console.log('Export CSV for sitting:', sittingId)
  }

  // TODO: Calculate KPIs (pass rate, avg score, duration)
  // TODO: Render sortable table
  // TODO: Implement print summary

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Results</h2>
        <Button onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* TODO: KPIs row */}
      {/* TODO: Results table */}

      <p className="text-muted-foreground">
        Results panel scaffold - {students.length} students
      </p>
    </div>
  )
}
