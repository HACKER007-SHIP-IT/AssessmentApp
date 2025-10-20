import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowRight } from "lucide-react"

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "49",
    period: "/month",
    description: "Perfect for small training providers",
    features: [
      "Up to 25 students per month",
      "Written & practical assessments",
      "Basic reporting",
      "Email support",
      "QR code generation",
      "Student progress tracking",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "99",
    period: "/month",
    description: "For growing organisations",
    features: [
      "Up to 100 students per month",
      "Everything in Starter",
      "Advanced reporting & analytics",
      "Priority email support",
      "Multiple trainers",
      "Custom branding options",
      "Data export (CSV, PDF)",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "199",
    period: "/month",
    description: "For established training centres",
    features: [
      "Unlimited students",
      "Everything in Team",
      "Custom branding",
      "API access",
      "Dedicated account manager",
      "Phone support",
      "SSO integration",
      "Custom integrations",
    ],
  },
]

const faqs = [
  {
    question: "What happens after my 14-day free trial?",
    answer: "After your trial ends, you'll need to choose a paid plan to continue using Focus Assessments. All your data is preserved and you can pick up right where you left off.",
  },
  {
    question: "Can I change plans later?",
    answer: "Yes! You can upgrade or downgrade your plan at any time from your billing settings. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards via Stripe. Enterprise customers can also arrange invoice billing.",
  },
  {
    question: "Is there a setup fee?",
    answer: "No setup fees, ever. You only pay for your monthly subscription.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your access continues until the end of your current billing period.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes! Contact our sales team for annual billing discounts and enterprise pricing.",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-focus-gradient text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            Start with a 14-day free trial. No credit card required. Choose the plan that fits your organisation.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
            <Check className="h-5 w-5" />
            <span className="font-medium">All plans include 14-day free trial</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-primary shadow-xl scale-105"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                    <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-medium text-muted-foreground">GBP</span>
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Billed monthly, cancel anytime
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link href="/signup">
                      Start Free Trial
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enterprise CTA */}
          <div className="max-w-4xl mx-auto mt-16">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Need a custom solution?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  We offer custom plans for large organisations with specific requirements.
                  Get in touch to discuss volume discounts, custom integrations, and dedicated support.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="mailto:sales@focusassessments.com">
                      Contact Sales
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="tel:+442012345678">
                      Call Us
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Got questions? We have answers.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Final CTA */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold mb-4">
              Ready to get started?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Start your 14-day free trial today. No credit card required.
            </p>
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
