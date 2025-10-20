import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "GBP 49",
    period: "/month",
    description: "Perfect for small training providers",
    features: [
      "Up to 25 students per month",
      "Written & practical assessments",
      "Basic reporting",
      "Email support",
    ],
  },
  {
    name: "Team",
    price: "GBP 99",
    period: "/month",
    description: "For growing organisations",
    features: [
      "Up to 100 students per month",
      "Everything in Starter",
      "Advanced reporting & analytics",
      "Priority email support",
      "Multiple trainers",
    ],
    popular: true,
  },
  {
    name: "Pro",
    price: "GBP 199",
    period: "/month",
    description: "For established training centres",
    features: [
      "Unlimited students",
      "Everything in Team",
      "Custom branding",
      "API access",
      "Dedicated account manager",
      "Phone support",
    ],
  },
]

export function PricingPreview() {
  return (
    <section className="container py-20 md:py-24 lg:py-28 bg-muted/30">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your organisation. Start with a 14-day free trial, no credit card required.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-lg border p-8 ${
              plan.popular
                ? "border-primary shadow-lg scale-105"
                : "border-border"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={plan.popular ? "default" : "outline"}
              asChild
            >
              <Link href="/signup">Start free trial</Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-muted-foreground mb-4">
          All plans include our 14-day free trial and can be cancelled anytime
        </p>
        <Link href="/pricing" className="text-primary hover:underline">
          View full pricing details
        </Link>
      </div>
    </section>
  )
}
