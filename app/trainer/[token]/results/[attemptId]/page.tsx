import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { getDetailedAttemptResults } from "@/lib/actions/results"

export default async function AttemptDetailPage({ params }: { params: { token: string, attemptId: string } }) {
  try {
    const { attempt, questionResults } = await getDetailedAttemptResults(params.attemptId)

    const scorePercentage = attempt.total_questions
      ? Math.round((attempt.score! / attempt.total_questions!) * 100)
      : 0

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link href={`/trainer/${params.token}/results`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Results
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{(attempt.student as any).name}</h1>
            <p className="text-muted-foreground mt-1">
              {(attempt.sitting as any).paper.course_type.name} - {(attempt.sitting as any).paper.label}
            </p>
          </div>

          {/* Summary Card */}
          <Card className={`rounded-2xl shadow-lg border-2 ${attempt.passed ? 'border-green-500' : 'border-red-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {attempt.passed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                {attempt.passed ? 'Pass' : 'Fail'}
              </CardTitle>
              <CardDescription>
                Submitted: {new Date(attempt.submitted_at!).toLocaleString('en-GB')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Score</p>
                  <p className="text-2xl font-bold">{attempt.score}/{attempt.total_questions}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Percentage</p>
                  <p className={`text-2xl font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {scorePercentage}%
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Pass Mark</p>
                  <p className="text-2xl font-bold">{attempt.pass_mark}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question-by-Question Breakdown */}
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Question-by-Question Breakdown</CardTitle>
              <CardDescription>
                Detailed analysis of each question
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questionResults.map((q, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 ${
                    q.isCorrect
                      ? 'bg-green-50 border-green-200'
                      : q.isAnswered
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      {q.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : q.isAnswered ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold mb-2">
                        Question {q.questionNumber}: {q.questionText}
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-1 gap-2">
                          {['A', 'B', 'C', 'D'].map((option) => {
                            const optionKey = `option${option}` as keyof typeof q
                            const isCorrect = q.correctAnswer === option
                            const isStudentAnswer = q.studentAnswer === option

                            return (
                              <div
                                key={option}
                                className={`p-2 rounded ${
                                  isCorrect && isStudentAnswer
                                    ? 'bg-green-200 border border-green-400'
                                    : isCorrect
                                    ? 'bg-green-100 border border-green-300'
                                    : isStudentAnswer
                                    ? 'bg-red-100 border border-red-300'
                                    : 'bg-white border border-gray-200'
                                }`}
                              >
                                <span className="font-semibold mr-2">{option}.</span>
                                {q[optionKey] as string}
                                {isCorrect && (
                                  <Badge className="ml-2 bg-green-600">Correct Answer</Badge>
                                )}
                                {isStudentAnswer && !isCorrect && (
                                  <Badge variant="destructive" className="ml-2">Student's Answer</Badge>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {!q.isAnswered && (
                        <p className="text-sm text-yellow-700 mt-2">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          Student did not answer this question
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    redirect(`/trainer/${params.token}/results`)
  }
}
