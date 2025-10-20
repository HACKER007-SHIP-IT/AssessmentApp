import { ClipboardCheck, Users, BarChart3, FileText, Shield, Clock } from "lucide-react"

const features = [
  {
    icon: ClipboardCheck,
    title: "Written & practical assessments",
    description: "Deliver both written multiple-choice tests and practical scenario-based assessments in one platform.",
  },
  {
    icon: Users,
    title: "Student & trainer management",
    description: "Organise students into sittings, assign trainers, and manage enrolments with ease.",
  },
  {
    icon: BarChart3,
    title: "Real-time progress tracking",
    description: "Monitor student performance, track completion rates, and identify areas for improvement instantly.",
  },
  {
    icon: FileText,
    title: "Automated scoring & reporting",
    description: "Save time with automatic marking, instant results, and comprehensive reporting for audits.",
  },
  {
    icon: Shield,
    title: "Secure & compliant",
    description: "Built with security first. Your data is encrypted and stored safely in UK-based servers.",
  },
  {
    icon: Clock,
    title: "Save hours every week",
    description: "Eliminate paperwork, manual marking, and spreadsheets. Focus on what matters: training quality.",
  },
]

export function Features() {
  return (
    <section id="features" className="container py-20 md:py-24 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Everything you need to run assessments
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Purpose-built for emergency services training providers who need reliable, efficient assessment management.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative rounded-lg border bg-background p-6 hover:shadow-md transition-shadow"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
