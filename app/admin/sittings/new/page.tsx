"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Stepper } from "@/components/wizard/Stepper"
import { createSitting } from "@/lib/actions/sittings"
import { getOrganizationTrainers } from "@/lib/actions/trainers"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"

const STEPS = [
  { title: "Course Type", description: "Select course" },
  { title: "Paper", description: "Choose paper" },
  { title: "Settings", description: "Configure options" },
  { title: "Session Details", description: "Date, time & trainer" },
]

export default function NewSittingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromSetup = searchParams.get('from') === 'setup'

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [trainers, setTrainers] = useState<any[]>([])

  // Form data
  const [courseType, setCourseType] = useState("")
  const [paper, setPaper] = useState("")
  const [duration, setDuration] = useState("45")
  const [randomiseQuestions, setRandomiseQuestions] = useState(true)
  const [randomiseAnswers, setRandomiseAnswers] = useState(true)
  const [assignedTrainerId, setAssignedTrainerId] = useState("")
  const [sessionDate, setSessionDate] = useState("")
  const [sessionTime, setSessionTime] = useState("")

  // Load trainers on mount
  useEffect(() => {
    async function loadTrainers() {
      try {
        const data = await getOrganizationTrainers()
        setTrainers(data.filter(t => t.is_active))
      } catch (err) {
        console.error("Failed to load trainers:", err)
      }
    }
    loadTrainers()
  }, [])

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return courseType !== ""
      case 1:
        return paper !== ""
      case 2:
        return duration !== "" && parseInt(duration) > 0
      case 3:
        return true // Session details are optional
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = async () => {
    setIsSubmitting(true)
    setError("")

    try {
      // Create sitting in database
      const result = await createSitting({
        courseType,
        paper,
        duration: parseInt(duration),
        randomiseQuestions,
        randomiseAnswers,
        assignedTrainerId: assignedTrainerId && assignedTrainerId !== "none" ? assignedTrainerId : undefined,
        sessionDate: sessionDate || undefined,
        sessionTime: sessionTime || undefined,
      })

      // If coming from setup wizard, mark sitting as created and redirect back
      if (fromSetup) {
        localStorage.setItem("sittingCreated", "true")
        router.push("/onboarding/setup")
      } else {
        router.push("/admin/sittings")
      }
    } catch (err) {
      console.error("Failed to create sitting:", err)
      setError("Failed to create sitting. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Start a New Sitting</h1>
        <p className="text-muted-foreground mt-2">
          Configure and launch an assessment sitting
        </p>
      </div>

      <Stepper steps={STEPS} currentStep={currentStep} />

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>{STEPS[currentStep].title}</CardTitle>
          <CardDescription>{STEPS[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Course Type */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <Label htmlFor="courseType">Course Type</Label>
              <Select value={courseType} onValueChange={setCourseType}>
                <SelectTrigger id="courseType" className="text-lg h-12">
                  <SelectValue placeholder="Select a course type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FAW">First Aid at Work (FAW)</SelectItem>
                  <SelectItem value="EFAW">Emergency First Aid at Work (EFAW)</SelectItem>
                  <SelectItem value="PFA">Paediatric First Aid (PFA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 2: Paper */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Label>Select Paper</Label>
              <RadioGroup value={paper} onValueChange={setPaper} className="gap-4">
                <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="Paper 1" id="paper1" />
                  <Label htmlFor="paper1" className="flex-1 cursor-pointer text-base">
                    Paper 1
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="Paper 2" id="paper2" />
                  <Label htmlFor="paper2" className="flex-1 cursor-pointer text-base">
                    Paper 2
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Settings */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="randomiseQ" className="text-base">
                      Randomise Question Order
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Questions appear in random order for each student
                    </p>
                  </div>
                  <Switch
                    id="randomiseQ"
                    checked={randomiseQuestions}
                    onCheckedChange={setRandomiseQuestions}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="randomiseA" className="text-base">
                      Randomise Answer Order
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Answer options appear in random order
                    </p>
                  </div>
                  <Switch
                    id="randomiseA"
                    checked={randomiseAnswers}
                    onCheckedChange={setRandomiseAnswers}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Session Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sessionDate">Session Date (Optional)</Label>
                <Input
                  id="sessionDate"
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTime">Session Time (Optional)</Label>
                <Input
                  id="sessionTime"
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTrainer">Assign Trainer (Optional)</Label>
                <Select value={assignedTrainerId} onValueChange={setAssignedTrainerId}>
                  <SelectTrigger id="assignedTrainer" className="text-lg h-12">
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
                {trainers.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No trainers available. Add trainers in the Trainers section first.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
              className="min-w-32"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isSubmitting}
                className="min-w-32"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!isStepValid() || isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Finish
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
