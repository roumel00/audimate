import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Terms of Service - Audimate",
  description: "Terms and conditions for using the Audimate AI-powered calling platform",
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-6">
        <div className="container max-w-4xl mx-auto">
          <Link href="/" className="text-2xl font-bold">
            Audimate
          </Link>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Audimate - Terms & Services</h1>
          <p className="text-muted-foreground mb-8">Effective 1 May 2025</p>

          <section className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Audimate (the &quot;Service&quot;) at https://audimate.io, you agree to be bound by these
                Terms & Services (&quot;Terms&quot;). If you do not agree, please do not use the Service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. The Service</h2>
              <p>
                Audimate is a web-application that leverages artificial intelligence to automatically cold call clients
                on your behalf. Features, functionality, and content may change at any time without notice.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. Accounts</h2>
              <p>
                You must be at least 18 years old and provide accurate, current, and complete information when creating
                an account. You are responsible for safeguarding your login credentials and for all activity under your
                account.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. Credits, Payments, and Refunds</h2>
              <p>
                Audimate operates on a credit system. Credits can be purchased through the platform and are consumed
                when you use call-related features.
              </p>
              <p className="mt-2">Credits are non-refundable and have no monetary value outside the Service.</p>
              <p className="mt-2">All prices are listed in Australian dollars unless stated otherwise.</p>
              <p className="mt-2">
                You authorise us (or our payment processor) to charge your provided payment method for all purchases and
                applicable taxes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Ownership and Licence</h2>
              <p>
                Audimate and all related software, code, content, and data are owned by Audimate or its licensors.
                Purchasing credits or accessing the Service grants you a limited, non-exclusive, revocable licence to
                use the Service as provided; no ownership rights transfer to you.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">6. User Data</h2>
              <p>We collect the following personal data when you use Audimate:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Name</li>
                <li>Email address</li>
                <li>Company name</li>
                <li>Payment information</li>
              </ul>
              <p className="mt-2">
                Our use of personal data is governed by our{" "}
                <Link href="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                (https://audimate.io/privacy-policy). By using the Service, you consent to such collection and use.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">7. Cookies and Non-Personal Data</h2>
              <p>
                Audimate uses web cookies and similar technologies to operate the Service, analyse performance, and
                improve user experience. You may disable cookies in your browser, but some features may not function
                properly.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">8. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Violate any applicable law or regulation;</li>
                <li>Infringe on the rights of others;</li>
                <li>Use the Service to transmit spam or unlawful, harmful, or misleading content;</li>
                <li>Interfere with, disrupt, or compromise the integrity or security of the Service.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">9. Disclaimer of Warranties</h2>
              <p>
                The Service is provided &quot;as is&quot; and &quot;as available.&quot; To the maximum extent permitted by law, Audimate
                disclaims all warranties, express or implied, including merchantability, fitness for a particular
                purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, secure, or
                error-free.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Audimate, its directors, employees, and agents will not be
                liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits
                or revenues, arising out of or in connection with your use of the Service. Our total liability for any
                claim arising out of or relating to these Terms or the Service will not exceed the greater of (a) AUD
                100 or (b) the amount you paid Audimate in the 12 months preceding the claim.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">11. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Audimate, its affiliates, and their respective officers,
                directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees)
                arising from your use of the Service or violation of these Terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
              <p>
                These Terms are governed by the laws of Australia. You agree to submit to the exclusive jurisdiction of
                the courts of Australia for any dispute arising out of or relating to these Terms or the Service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">13. Changes to These Terms</h2>
              <p>
                We may update these Terms from time to time. We will notify you of any material changes by email at
                least 7 days before the new terms take effect. Continued use of the Service after such notice
                constitutes acceptance of the revised Terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">14. Contact</h2>
              <p>
                Questions, comments, or concerns? Contact us at{" "}
                <a href="mailto:info@audimate.io" className="text-primary hover:underline">
                  info@audimate.io
                </a>
                .
              </p>
            </div>

            <div className="pt-4">
              <p className="italic">
                By using Audimate, you acknowledge that you have read, understood, and agree to these Terms & Services.
              </p>
            </div>
          </section>

          <div className="mt-12">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t p-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Audimate. All rights reserved.</p>
      </footer>
    </div>
  )
}
