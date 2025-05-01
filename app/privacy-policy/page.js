import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Privacy Policy | Audimate",
  description: "Privacy Policy for Audimate - AI-powered cold calling solution",
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-2xl font-bold text-white">
            Audimate
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Audimate – Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Effective 1 May 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Audimate ("we," "our," "us") operates the web-application available at{" "}
            <Link href="https://audimate.io" className="text-blue-400 hover:underline">
              https://audimate.io
            </Link>{" "}
            (the "Service"). This Privacy Policy explains what information we collect, how we use it, and your choices.
            By using the Service, you agree to the terms of this Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 px-4 py-2 text-left">Category</th>
                  <th className="border border-gray-700 px-4 py-2 text-left">Details</th>
                  <th className="border border-gray-700 px-4 py-2 text-left">Source</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-700 px-4 py-2">Personal Information</td>
                  <td className="border border-gray-700 px-4 py-2">
                    • Name
                    <br />• Email address
                    <br />• Company name
                    <br />• Payment information
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    Provided directly by you during account registration, purchase, or correspondence
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-700 px-4 py-2">Non-Personal Information</td>
                  <td className="border border-gray-700 px-4 py-2">
                    Web cookies and similar technologies (browser type, device information, pages visited, time spent)
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    Collected automatically when you interact with the Service
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We process the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Provide, maintain, and improve the Service;</li>
            <li>Process orders, payments, and manage credits;</li>
            <li>Communicate with you about updates, support, or transactional matters;</li>
            <li>Monitor performance and product quality;</li>
            <li>Detect, prevent, and address technical issues or security incidents.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Cookies</h2>
          <p className="mb-4">We use cookies to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Keep you signed in;</li>
            <li>Remember preferences;</li>
            <li>Analyse site traffic and performance.</li>
          </ul>
          <p>You can disable cookies in your browser settings, but the Service may not function properly.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Sharing</h2>
          <p>
            We do not sell, rent, or share your personal data with third parties. Data may be disclosed only if required
            by law or to protect the rights and safety of Audimate, our users, or others.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
          <p>
            We employ industry-standard administrative, technical, and physical safeguards to protect your data. No
            method of transmission over the Internet or electronic storage is 100% secure; therefore, we cannot
            guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
          <p>
            Audimate is not directed to children under 13. We do not knowingly collect personal data from children. If
            you believe a child has provided us with personal information, please contact us and we will delete it
            promptly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Your Rights and Choices</h2>
          <p>
            Subject to applicable law, you may have the right to access, correct, or delete your personal information.
            To exercise these rights, contact us at{" "}
            <a href="mailto:info@audimate.io" className="text-blue-400 hover:underline">
              info@audimate.io
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Policy from time to time. We will notify you of material changes by email at least 7 days
            before they take effect. Continued use of the Service after the effective date constitutes acceptance of the
            updated Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
          <p className="mb-4">
            If you have questions or concerns about this Privacy Policy, please email{" "}
            <a href="mailto:info@audimate.io" className="text-blue-400 hover:underline">
              info@audimate.io
            </a>
            .
          </p>
          <p>By using Audimate, you acknowledge that you have read and understood this Privacy Policy.</p>
        </section>

        <div className="mt-12 mb-8 text-center">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Audimate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
