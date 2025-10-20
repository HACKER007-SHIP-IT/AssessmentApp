"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Loader2 } from "lucide-react"
import { updateOrganizationPlan } from "@/lib/actions/organizations"

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
    ],
  },
]

export default function PlanSelectionPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState("team") // Default to most popular
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    setLoading(true)
    setError(null)

    try {
      // Update organization plan in database
      const result = await updateOrganizationPlan(selectedPlan)

      if (!result.ok) {
        setError(result.message || "Failed to update plan")
        setLoading(false)
        return
      }

      // Success - redirect to admin dashboard
      // Skip the setup wizard since org is already created
      router.push("/admin")
    } catch (err) {
      console.error("Error updating plan:", err)
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required. Choose the plan that fits your organisation.
          </p>
        </div>

        {/* Trial Info Banner */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <p className="font-semibold text-blue-900">14-Day Free Trial</p>
            </div>
            <p className="text-sm text-blue-800">
              Your trial starts today. Full access to all features. No payment required until trial ends.
            </p>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? "ring-2 ring-primary shadow-lg scale-105"
                  : "hover:shadow-md"
              } ${plan.popular ? "border-primary" : ""}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div>
                  <span className="text-4xl font-bold">GBP {plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                  <p className="text-xs text-muted-foreground mt-2">
                    Free for 14 days, then GBP {plan.price}/month
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Select Button */}
                <Button
                  className="w-full"
                  variant={selectedPlan === plan.id ? "default" : "outline"}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="max-w-md mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}
          <Button
            onClick={handleContinue}
            disabled={loading || !selectedPlan}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving plan...
              </>
            ) : (
              "Start 14-Day Free Trial"
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
