import { Header } from "@/components/marketing/Header"
import { Footer } from "@/components/marketing/Footer"

export const metadata = {
  title: "Terms of Service - AssessmentApp",
  description: "Terms and conditions for using AssessmentApp.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-GB')}</p>

        <div className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using AssessmentApp, you accept and agree to be bound by the terms and provision of this agreement.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground">
              AssessmentApp provides a digital platform for managing training assessments, including written and practical assessments,
              student management, and reporting tools for training providers in the emergency services sector.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Account Registration</h2>
            <p className="text-muted-foreground mb-2">To use our service, you must:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorised use</li>
              <li>Be responsible for all activities under your account</li>
              <li>Be at least 18 years old or have parental consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Free Trial</h2>
            <p className="text-muted-foreground">
              We offer a 14-day free trial for new users. No credit card is required to start your trial.
              At the end of the trial period, you must select a paid plan to continue using the service.
              We will notify you before your trial expires.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Subscription and Payment</h2>
            <p className="text-muted-foreground mb-2">
              Paid subscriptions are billed monthly in advance. By subscribing, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Provide valid payment information</li>
              <li>Authorise automatic monthly charges</li>
              <li>Pay all fees and applicable taxes</li>
              <li>Accept that prices may change with 30 days notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Cancellation and Refunds</h2>
            <p className="text-muted-foreground">
              You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period.
              We do not provide refunds for partial months or unused portions of the service. All fees are non-refundable except
              as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. User Content</h2>
            <p className="text-muted-foreground">
              You retain ownership of all content you upload to AssessmentApp. By uploading content, you grant us a licence
              to store, process, and display that content as necessary to provide the service. You are responsible for ensuring
              you have the right to upload all content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Acceptable Use</h2>
            <p className="text-muted-foreground mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorised access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Upload malicious code or viruses</li>
              <li>Abuse, harass, or harm other users</li>
              <li>Share your account with unauthorised parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Service Availability</h2>
            <p className="text-muted-foreground">
              We strive to maintain high availability but do not guarantee uninterrupted access. We may perform maintenance,
              updates, or modifications that temporarily affect service availability. We are not liable for any downtime
              or service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Data Protection</h2>
            <p className="text-muted-foreground">
              We take data protection seriously. Your use of the service is also governed by our Privacy Policy,
              which explains how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, AssessmentApp shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will provide notice of significant changes
              via email or through the service. Your continued use of the service after changes constitute acceptance
              of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">13. Termination</h2>
            <p className="text-muted-foreground">
              We may suspend or terminate your account if you violate these terms. Upon termination, your right to
              use the service ceases immediately. We will provide reasonable opportunity to export your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">14. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive
              jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">15. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these terms, please contact us at:
              <br />
              Email: legal@assessmentapp.com
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
