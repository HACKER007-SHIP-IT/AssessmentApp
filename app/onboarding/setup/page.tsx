"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Circle, Users, ClipboardList, QrCode, ArrowRight, Sparkles } from "lucide-react"

export default function SetupWizardPage() {
  const router = useRouter()
  const [setupComplete, setSetupComplete] = useState(false)

  // Check setup status from localStorage (in production, fetch from database)
  const [hasTrainer, setHasTrainer] = useState(false)
  const [hasSitting, setHasSitting] = useState(false)

  useEffect(() => {
    // Check localStorage for setup progress
    const trainerAdded = localStorage.getItem("trainerAdded") === "true"
    const sittingCreated = localStorage.getItem("sittingCreated") === "true"

    setHasTrainer(trainerAdded)
    setHasSitting(sittingCreated)

    if (trainerAdded && sittingCreated) {
      setSetupComplete(true)
    }
  }, [])

  const handleSkip = () => {
    router.push("/admin")
  }

  const handleComplete = () => {
    router.push("/admin")
  }

  const setupSteps = [
    {
      title: "Add Your First Trainer",
      description: "Create a trainer account to manage and run assessments",
      icon: Users,
      completed: hasTrainer,
      action: "/admin/trainers/new?from=setup",
      actionLabel: hasTrainer ? "Add Another" : "Add Trainer",
    },
    {
      title: "Schedule Your First Sitting",
      description: "Create an assessment session for your students",
      icon: ClipboardList,
      completed: hasSitting,
      action: "/admin/sittings/new?from=setup",
      actionLabel: hasSitting ? "Create Another" : "Create Sitting",
    },
    {
      title: "Students Can Join",
      description: "Share the QR code or short code with your students",
      icon: QrCode,
      completed: hasSitting, // Auto-complete when sitting is created
      info: hasSitting ? "QR codes available on sitting page" : "Complete after creating a sitting",
    },
  ]

  const completedSteps = setupSteps.filter(step => step.completed).length
  const progress = (completedSteps / setupSteps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Quick Setup Guide</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Let's Get You Started</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete these quick steps to run your first assessment with Focus Assessments
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Setup Progress</span>
              <span className="text-sm font-medium text-primary">
                {completedSteps} of {setupSteps.length} complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-600 to-teal-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <div className="space-y-4 mb-8">
          {setupSteps.map((step, index) => (
            <Card
              key={index}
              className={`transition-all ${
                step.completed ? "bg-green-50 border-green-200" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-lg ${
                      step.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {step.completed ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      {step.completed && (
                        <Badge className="bg-green-600">Completed</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {step.description}
                    </p>

                    {/* Action Button or Info */}
                    {step.action ? (
                      <Button
                        asChild
                        variant={step.completed ? "outline" : "default"}
                        size="sm"
                      >
                        <Link href={step.action}>
                          {step.actionLabel}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        {step.info}
                      </p>
                    )}
                  </div>

                  {/* Step Number */}
                  <div
                    className={`text-2xl font-bold ${
                      step.completed ? "text-green-600" : "text-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        {setupComplete ? (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">You're All Set!</h3>
                <p className="text-muted-foreground">
                  Your first sitting is ready. Students can now join and take their assessments.
                </p>
              </div>
              <Button
                onClick={handleComplete}
                size="lg"
                className="w-full max-w-md"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!hasTrainer && !hasSitting}
              className="flex-1"
            >
              {hasTrainer || hasSitting ? "Continue to Dashboard" : "Complete Setup First"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-center text-muted-foreground mt-6">
          Need help? Check out our{" "}
          <Link href="/docs" className="text-primary hover:underline">
            documentation
          </Link>{" "}
          or{" "}
          <Link href="mailto:support@focusassessments.com" className="text-primary hover:underline">
            contact support
          </Link>
        </p>
      </div>
    </div>
  )
}
