import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Eye, CheckCircle2, XCircle, Clock, Users, TrendingUp, Award } from "lucide-react"
import { getSittingByToken } from "@/lib/actions/sittings"
import { getTheoryResultsForSitting, getSittingStatistics } from "@/lib/actions/results"

export default async function TrainerResultsPage({ params }: { params: { token: string } }) {
  const sittingData = await getSittingByToken(params.token)

  if (!sittingData) {
    redirect('/trainer/sign-in')
  }

  const results = await getTheoryResultsForSitting(sittingData.id)
  const stats = await getSittingStatistics(sittingData.id)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (attempt: any) => {
    if (!attempt.submitted_at) {
      return <Badge variant="outline" className="bg-yellow-50"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>
    }
    if (attempt.passed) {
      return <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Pass</Badge>
    }
    return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Fail</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link href={`/trainer/${params.token}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Console
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Assessment Results</h1>
            <p className="text-muted-foreground mt-1">
              {sittingData.paper.course_type.name} - {sittingData.paper.label}
            </p>
            <p className="text-sm text-muted-foreground">
              Code: <span className="font-mono font-bold">{sittingData.short_code}</span>
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="rounded-2xl shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.submittedStudents} submitted
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4" />
                Pass Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.passRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.passedStudents} of {stats.submittedStudents} passed
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all submissions
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.inProgressStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Not yet submitted
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Individual Results</CardTitle>
            <CardDescription>
              Detailed results for each student
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No students have joined this assessment yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold">{(attempt.student as any).name}</span>
                        {getStatusBadge(attempt)}
                      </div>
                      {attempt.submitted_at ? (
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Score:</span> {attempt.score}/{attempt.total_questions} ({Math.round((attempt.score! / attempt.total_questions!) * 100)}%)
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span> {formatDate(attempt.submitted_at)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Started:</span> {formatDate(attempt.started_at)}
                        </div>
                      )}
                    </div>

                    {attempt.submitted_at && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/trainer/${params.token}/results/${attempt.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
