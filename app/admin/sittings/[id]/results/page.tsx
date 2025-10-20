"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  FileText,
  Stethoscope,
  BarChart3,
  Loader2,
  AlertCircle,
} from "lucide-react"
import {
  getSittingCombinedResults,
  getSittingSummaryStats,
  exportSittingResultsCSV,
  type CourseResult,
} from "@/lib/actions/course-results"
import { createClient } from "@/lib/supabase/client"

type PageProps = {
  params: { id: string }
}

export default function AdminSittingResultsPage({ params }: PageProps) {
  const { id: sittingId } = params
  const router = useRouter()

  const [results, setResults] = useState<CourseResult[]>([])
  const [filteredResults, setFilteredResults] = useState<CourseResult[]>([])
  const [stats, setStats] = useState<any>(null)
  const [sitting, setSitting] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pass" | "fail" | "incomplete">("all")
  const [selectedStudent, setSelectedStudent] = useState<CourseResult | null>(null)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError("")

      try {
        // Get sitting details
        const supabase = createClient()
        const { data: sittingData, error: sittingError } = await supabase
          .from("sittings")
          .select(`
            id,
            short_code,
            status,
            paper:papers(
              label,
              course_type:course_types(
                code,
                name
              )
            )
          `)
          .eq("id", sittingId)
          .single()

        if (sittingError) throw sittingError
        setSitting(sittingData)

        // Get combined results
        const resultsData = await getSittingCombinedResults(sittingId)
        setResults(resultsData)
        setFilteredResults(resultsData)

        // Get summary stats
        const statsData = await getSittingSummaryStats(sittingId)
        setStats(statsData)
      } catch (err: any) {
        console.error("Error loading results:", err)
        setError(err.message || "Failed to load results")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [sittingId])

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredResults(results)
    } else {
      setFilteredResults(results.filter(r => r.overall.status === statusFilter))
    }
  }, [statusFilter, results])

  const handleExportCSV = async () => {
    try {
      const csv = await exportSittingResultsCSV(sittingId)
      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `results-${sitting?.short_code || sittingId}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error("Error exporting CSV:", err)
      alert("Failed to export CSV: " + err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-focus-blue" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-focus-grey">
      {/* Header */}
      <div className="bg-focus-gradient py-6 px-4 sm:px-6 lg:px-8 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" className="text-white hover:bg-white/10">
                <Link href="/admin/sittings">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sittings
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Course Results</h1>
                <p className="text-white/80 mt-1">
                  {sitting?.paper?.course_type?.name} • {sitting?.short_code}
                </p>
              </div>
            </div>

            <Button onClick={handleExportCSV} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6">
        {/* Summary Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="rounded-2xl shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalStudents}</p>
                  </div>
                  <Activity className="h-8 w-8 text-focus-blue" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Both</p>
                    <p className="text-3xl font-bold mt-1">{stats.completedBoth}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Pass</p>
                    <p className="text-3xl font-bold mt-1 text-green-600">{stats.overallPassed}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Fail</p>
                    <p className="text-3xl font-bold mt-1 text-red-600">{stats.overallFailed}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pass Rate</p>
                    <p className="text-3xl font-bold mt-1">{stats.overallPassRate}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-focus-teal" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Table */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Combined Results
                </CardTitle>
                <CardDescription>Written + Practical Assessment Results</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All ({results.length})
                </Button>
                <Button
                  variant={statusFilter === "pass" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("pass")}
                  className={statusFilter === "pass" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Pass ({results.filter(r => r.overall.status === "pass").length})
                </Button>
                <Button
                  variant={statusFilter === "fail" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("fail")}
                  className={statusFilter === "fail" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  Fail ({results.filter(r => r.overall.status === "fail").length})
                </Button>
                <Button
                  variant={statusFilter === "incomplete" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("incomplete")}
                >
                  Incomplete ({results.filter(r => r.overall.status === "incomplete").length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {statusFilter === "all" ? "No students have joined this sitting yet" : `No students with ${statusFilter} status`}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold">Student</th>
                      <th className="text-center p-3 text-sm font-semibold">Written Assessment</th>
                      <th className="text-center p-3 text-sm font-semibold">Practical Assessment</th>
                      <th className="text-center p-3 text-sm font-semibold">Overall Result</th>
                      <th className="text-center p-3 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result, idx) => (
                      <tr key={result.studentId} className={idx % 2 === 0 ? "bg-white" : "bg-muted/30"}>
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{result.studentName}</p>
                            <p className="text-xs text-muted-foreground">{result.studentEmail}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          {result.written.completed ? (
                            <div className="flex flex-col items-center gap-1">
                              <Badge
                                variant={result.written.passed ? "default" : "destructive"}
                                className={result.written.passed ? "bg-green-600" : ""}
                              >
                                {result.written.percentage}%
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {result.written.score}/{result.written.totalQuestions} correct
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {result.written.passed ? (
                                  <span className="text-green-600 font-medium">Pass</span>
                                ) : (
                                  <span className="text-red-600 font-medium">Fail</span>
                                )}
                              </span>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                Not Completed
                              </Badge>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          {result.practical.completed ? (
                            <div className="flex flex-col items-center gap-1">
                              <Badge
                                variant={result.practical.passed ? "default" : "destructive"}
                                className={result.practical.passed ? "bg-green-600" : ""}
                              >
                                {result.practical.passed ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Pass
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Fail
                                  </>
                                )}
                              </Badge>
                              {result.practical.completedAt && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(result.practical.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                Not Completed
                              </Badge>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center">
                            {result.overall.status === "pass" && (
                              <Badge className="bg-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                PASS
                              </Badge>
                            )}
                            {result.overall.status === "fail" && (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                FAIL
                              </Badge>
                            )}
                            {result.overall.status === "incomplete" && (
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                Incomplete
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStudent(result)}
                            >
                              View Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Detail Modal/Card */}
        {selectedStudent && (
          <Card className="rounded-2xl shadow-lg border-2 border-focus-blue">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Detail</CardTitle>
                  <CardDescription>{selectedStudent.studentName} • {selectedStudent.studentEmail}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Written Assessment Detail */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-focus-blue" />
                  Written Assessment
                </h3>
                <div className="rounded-lg border p-4 space-y-2">
                  {selectedStudent.written.completed ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Score:</span>
                        <span className="font-medium">
                          {selectedStudent.written.score}/{selectedStudent.written.totalQuestions} ({selectedStudent.written.percentage}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Result:</span>
                        <Badge variant={selectedStudent.written.passed ? "default" : "destructive"} className={selectedStudent.written.passed ? "bg-green-600" : ""}>
                          {selectedStudent.written.passed ? "Pass" : "Fail"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Submitted:</span>
                        <span className="font-medium">
                          {selectedStudent.written.submittedAt && new Date(selectedStudent.written.submittedAt).toLocaleString()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-center py-2">Not completed</p>
                  )}
                </div>
              </div>

              {/* Practical Assessment Detail */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-focus-teal" />
                  Practical Assessment
                </h3>
                <div className="rounded-lg border p-4 space-y-2">
                  {selectedStudent.practical.completed ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Result:</span>
                        <Badge variant={selectedStudent.practical.passed ? "default" : "destructive"} className={selectedStudent.practical.passed ? "bg-green-600" : ""}>
                          {selectedStudent.practical.passed ? "Pass" : "Fail"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completed:</span>
                        <span className="font-medium">
                          {selectedStudent.practical.completedAt && new Date(selectedStudent.practical.completedAt).toLocaleString()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-center py-2">Not completed</p>
                  )}
                </div>
              </div>

              {/* Overall Result */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Overall Course Result
                </h3>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {selectedStudent.overall.status === "pass" && (
                      <Badge className="bg-green-600 text-lg py-2 px-4">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        PASS
                      </Badge>
                    )}
                    {selectedStudent.overall.status === "fail" && (
                      <Badge variant="destructive" className="text-lg py-2 px-4">
                        <XCircle className="h-4 w-4 mr-2" />
                        FAIL
                      </Badge>
                    )}
                    {selectedStudent.overall.status === "incomplete" && (
                      <Badge variant="outline" className="text-lg py-2 px-4">
                        <Clock className="h-4 w-4 mr-2" />
                        INCOMPLETE
                      </Badge>
                    )}
                  </div>
                  {selectedStudent.overall.canCertify && (
                    <Alert className="mt-4 bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        This student is eligible for certification
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
