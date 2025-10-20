"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Check, Mail, PhoneCall } from "lucide-react"

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "49",
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

export default function TrialExpiredPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState("team")
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    // TODO: Integrate with Stripe checkout
    // For now, redirect to payment page
    router.push("/onboarding/payment")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Alert Banner */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-orange-900 mb-2">
                  Your 14-Day Free Trial Has Ended
                </h2>
                <p className="text-orange-800 mb-4">
                  Thank you for trying Focus Assessments! To continue using our platform and accessing your data,
                  please subscribe to one of our plans below.
                </p>
                <div className="flex gap-4">
                  <Button onClick={handleSubscribe} className="bg-orange-600 hover:bg-orange-700">
                    Subscribe Now
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="mailto:sales@focusassessments.com">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Sales
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose a Plan to Continue</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the plan that best fits your organisation's needs
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
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
                  <span className="text-muted-foreground">/month</span>
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

        {/* Subscribe Button */}
        <div className="max-w-md mx-auto mb-12">
          <Button
            onClick={handleSubscribe}
            disabled={loading || !selectedPlan}
            className="w-full"
            size="lg"
          >
            {loading ? "Please wait..." : "Subscribe to Selected Plan"}
          </Button>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What happens to my data during the trial period?</h3>
              <p className="text-sm text-muted-foreground">
                All your data remains safe and secure. Once you subscribe, you'll have immediate access
                to everything you created during your trial.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I change my plan later?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time from your billing settings.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Do you offer custom plans for larger organisations?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely. Contact our sales team at{" "}
                <Link href="mailto:sales@focusassessments.com" className="text-primary hover:underline">
                  sales@focusassessments.com
                </Link>{" "}
                for enterprise pricing and features.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Need help deciding?</h3>
              <p className="text-sm text-muted-foreground">
                We're here to help! Reach out to us at{" "}
                <Link href="mailto:support@focusassessments.com" className="text-primary hover:underline">
                  support@focusassessments.com
                </Link>{" "}
                or call us at{" "}
                <Link href="tel:+442012345678" className="text-primary hover:underline">
                  +44 20 1234 5678
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
