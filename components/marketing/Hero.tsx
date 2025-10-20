import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export function Hero() {
  return (
    <section className="container py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm mb-8">
          <span className="text-primary font-semibold">New</span>
          <span className="mx-2">·</span>
          <span className="text-muted-foreground">14-day free trial available</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">
          Simplify training assessments for{" "}
          <span className="text-primary">emergency services</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg text-muted-foreground sm:text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Manage written and practical assessments, track student progress, and maintain compliance —
          all in one platform built for training providers.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" asChild className="text-base">
            <Link href="/signup">
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-base">
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>UK-based support</span>
          </div>
        </div>
      </div>
    </section>
  )
}
