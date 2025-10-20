import { UserPlus, Calendar, ClipboardList, CheckCircle } from "lucide-react"

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: "Sign up & set up your organisation",
    description: "Create your account in minutes. Add your organisation details and invite your trainers to join.",
  },
  {
    number: 2,
    icon: Calendar,
    title: "Create a sitting for your students",
    description: "Schedule assessment dates, enrol students, and assign trainers. Everything organised in one place.",
  },
  {
    number: 3,
    icon: ClipboardList,
    title: "Students complete assessments",
    description: "Students log in to take written tests and practical assessments. All progress tracked automatically.",
  },
  {
    number: 4,
    icon: CheckCircle,
    title: "Review results & generate reports",
    description: "Trainers mark practical assessments, view automatic scoring, and export reports for compliance.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container py-20 md:py-24 lg:py-28">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get up and running in four simple steps. No technical expertise required.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === steps.length - 1

            return (
              <div key={step.number} className="relative">
                {/* Connector Line */}
                {!isLast && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border hidden sm:block" />
                )}

                <div className="flex gap-6 items-start">
                  {/* Step Number & Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 rounded-lg bg-primary/10 p-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
