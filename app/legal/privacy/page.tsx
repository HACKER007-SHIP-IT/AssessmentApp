import { Header } from "@/components/marketing/Header"
import { Footer } from "@/components/marketing/Footer"

export const metadata = {
  title: "Privacy Policy - AssessmentApp",
  description: "Our privacy policy and how we handle your data.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-GB')}</p>

        <div className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
            <p className="text-muted-foreground">
              This privacy policy explains how AssessmentApp ("we", "us", "our") collects, uses, and protects your personal information
              when you use our assessment management platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
            <p className="text-muted-foreground mb-2">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Account information (name, email address, organisation details)</li>
              <li>Student and trainer information</li>
              <li>Assessment results and performance data</li>
              <li>Payment information (processed securely by our payment provider)</li>
              <li>Communications with our support team</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Provide, maintain, and improve our services</li>
              <li>Process assessments and generate reports</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyse trends and usage</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Data Storage and Security</h2>
            <p className="text-muted-foreground">
              Your data is stored securely in UK-based servers. We implement appropriate technical and organisational measures
              to protect your personal information against unauthorised access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. We may share your information with third-party service providers
              who assist us in operating our platform, such as hosting providers and payment processors. These providers
              are contractually obligated to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
            <p className="text-muted-foreground mb-2">Under UK data protection law, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Request transfer of your information</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to collect information about your browsing activities.
              You can control cookies through your browser settings. See our Cookie Policy for more information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new
              privacy policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this privacy policy or our data practices, please contact us at:
              <br />
              Email: privacy@assessmentapp.com
              <br />
              Address: [Your company address]
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
