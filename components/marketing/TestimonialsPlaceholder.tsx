import { Quote } from "lucide-react"

const testimonials = [
  {
    quote: "This platform has transformed how we manage our first aid training assessments. The time savings alone are worth it.",
    author: "Sarah Mitchell",
    role: "Training Manager",
    organisation: "London Emergency Training",
  },
  {
    quote: "Finally, a system that understands the needs of emergency services training providers. Highly recommended.",
    author: "James Peterson",
    role: "Lead Trainer",
    organisation: "UK First Response Academy",
  },
  {
    quote: "The automated marking and reporting features have made compliance audits so much easier for our team.",
    author: "Emma Williams",
    role: "Operations Director",
    organisation: "National Safety Training Ltd",
  },
]

export function TestimonialsPlaceholder() {
  return (
    <section className="container py-20 md:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Trusted by training providers across the UK
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what other training organisations are saying about our platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              <blockquote className="text-sm mb-4">
                "{testimonial.quote}"
              </blockquote>
              <div className="border-t pt-4">
                <div className="font-semibold text-sm">{testimonial.author}</div>
                <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                <div className="text-xs text-muted-foreground">{testimonial.organisation}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Testimonials are illustrative examples. Actual client testimonials will be added.
        </p>
      </div>
    </section>
  )
}
