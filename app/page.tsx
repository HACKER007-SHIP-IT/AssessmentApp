import { Header } from "@/components/marketing/Header"
import { Hero } from "@/components/marketing/Hero"
import { Features } from "@/components/marketing/Features"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { PricingPreview } from "@/components/marketing/PricingPreview"
import { TestimonialsPlaceholder } from "@/components/marketing/TestimonialsPlaceholder"
import { Footer } from "@/components/marketing/Footer"
import { CookieConsent } from "@/components/marketing/CookieConsent"

export const metadata = {
  title: "AssessmentApp - Simplify training assessments for emergency services",
  description: "Manage written and practical assessments, track student progress, and maintain compliance — all in one platform built for training providers. Start your 14-day free trial today.",
  keywords: ["emergency services", "training", "assessments", "first aid", "UK", "digital assessments", "student management"],
  openGraph: {
    title: "AssessmentApp - Simplify training assessments for emergency services",
    description: "Manage written and practical assessments, track student progress, and maintain compliance — all in one platform built for training providers.",
    type: "website",
  },
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <TestimonialsPlaceholder />
        <PricingPreview />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  )
}
