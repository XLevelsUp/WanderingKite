import type { Metadata } from 'next';
import { Footer } from '@/components/shared/Footer';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Wandering Kite Studio',
  description:
    'Privacy policy for Wandering Kite Studio - How we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background pt-20">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-zinc-900 to-zinc-950 py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 20, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="prose prose-invert mx-auto max-w-4xl">
            <div className="space-y-8 text-muted-foreground">
              {/* Introduction */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  1. Introduction
                </h2>
                <p className="leading-relaxed">
                  Wandering Kite Studio ("we," "our," or "us") is committed to
                  protecting your privacy. This Privacy Policy explains how we
                  collect, use, disclose, and safeguard your information when
                  you visit our website, use our services, or interact with us
                  via WhatsApp or other communication channels.
                </p>
              </div>

              {/* Information We Collect */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  2. Information We Collect
                </h2>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  2.1 Personal Information
                </h3>
                <p className="mb-4 leading-relaxed">
                  We may collect the following personal information:
                </p>
                <ul className="mb-4 list-disc space-y-2 pl-6">
                  <li>
                    Name and contact details (phone number, email address)
                  </li>
                  <li>WhatsApp number and chat history related to bookings</li>
                  <li>
                    Payment information (processed securely through third-party
                    payment gateways)
                  </li>
                  <li>
                    Government-issued ID for equipment rentals (security deposit
                    purposes)
                  </li>
                  <li>
                    Business information (if booking for commercial purposes)
                  </li>
                </ul>

                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  2.2 Automatically Collected Information
                </h3>
                <ul className="list-disc space-y-2 pl-6">
                  <li>IP address and browser type</li>
                  <li>Device information and operating system</li>
                  <li>Pages visited and time spent on our website</li>
                  <li>Referral source and exit pages</li>
                </ul>
              </div>

              {/* How We Use Your Information */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  3. How We Use Your Information
                </h2>
                <p className="mb-4 leading-relaxed">
                  We use your information to:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Process bookings and rental agreements</li>
                  <li>
                    Communicate with you via WhatsApp, email, or phone regarding
                    your bookings
                  </li>
                  <li>Process payments and manage security deposits</li>
                  <li>
                    Send promotional offers and updates (with your consent)
                  </li>
                  <li>Improve our services and website functionality</li>
                  <li>Comply with legal obligations and resolve disputes</li>
                </ul>
              </div>

              {/* Data Sharing */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  4. Data Sharing and Disclosure
                </h2>
                <p className="mb-4 leading-relaxed">
                  We do not sell your personal information. We may share your
                  data with:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    <strong>Payment Processors:</strong> To process transactions
                    securely
                  </li>
                  <li>
                    <strong>Service Providers:</strong> Third-party vendors who
                    assist in our operations (e.g., hosting, analytics)
                  </li>
                  <li>
                    <strong>Legal Authorities:</strong> When required by law or
                    to protect our rights
                  </li>
                  <li>
                    <strong>Insurance Providers:</strong> In case of equipment
                    damage claims
                  </li>
                </ul>
              </div>

              {/* WhatsApp Communication */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  5. WhatsApp Communication
                </h2>
                <p className="leading-relaxed">
                  By initiating contact via WhatsApp, you consent to receive
                  booking confirmations, updates, and promotional messages
                  through this channel. We use WhatsApp Business and comply with
                  their privacy policies. You can opt out of promotional
                  messages at any time by messaging "STOP."
                </p>
              </div>

              {/* Data Security */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  6. Data Security
                </h2>
                <p className="leading-relaxed">
                  We implement industry-standard security measures to protect
                  your personal information, including encryption, secure
                  servers, and restricted access. However, no method of
                  transmission over the internet is 100% secure, and we cannot
                  guarantee absolute security.
                </p>
              </div>

              {/* Data Retention */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  7. Data Retention
                </h2>
                <p className="leading-relaxed">
                  We retain your personal information for as long as necessary
                  to fulfill the purposes outlined in this policy, comply with
                  legal obligations, and resolve disputes. Rental records are
                  kept for a minimum of 3 years for accounting and legal
                  purposes.
                </p>
              </div>

              {/* Your Rights */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  8. Your Rights
                </h2>
                <p className="mb-4 leading-relaxed">You have the right to:</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Access and request a copy of your personal data</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>
                    Request deletion of your data (subject to legal retention
                    requirements)
                  </li>
                  <li>Opt out of marketing communications</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
                <p className="mt-4 leading-relaxed">
                  To exercise these rights, contact us at{' '}
                  <a
                    href="mailto:hello@wanderingkite.in"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    hello@wanderingkite.in
                  </a>
                </p>
              </div>

              {/* Cookies */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  9. Cookies and Tracking
                </h2>
                <p className="leading-relaxed">
                  We use cookies and similar technologies to enhance your
                  browsing experience, analyze website traffic, and personalize
                  content. You can control cookie preferences through your
                  browser settings.
                </p>
              </div>

              {/* Third-Party Links */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  10. Third-Party Links
                </h2>
                <p className="leading-relaxed">
                  Our website may contain links to third-party websites (e.g.,
                  Instagram, YouTube, Google Maps). We are not responsible for
                  the privacy practices of these external sites. Please review
                  their privacy policies before sharing your information.
                </p>
              </div>

              {/* Children's Privacy */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  11. Children's Privacy
                </h2>
                <p className="leading-relaxed">
                  Our services are not intended for individuals under 18 years
                  of age. We do not knowingly collect personal information from
                  minors. If you believe we have inadvertently collected such
                  data, please contact us immediately.
                </p>
              </div>

              {/* Changes to Policy */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  12. Changes to This Policy
                </h2>
                <p className="leading-relaxed">
                  We may update this Privacy Policy from time to time. Changes
                  will be posted on this page with an updated "Last Updated"
                  date. Continued use of our services after changes constitutes
                  acceptance of the revised policy.
                </p>
              </div>

              {/* Contact */}
              <div className="rounded-xl border border-border bg-muted/50 p-6">
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  13. Contact Us
                </h2>
                <p className="mb-4 leading-relaxed">
                  If you have questions about this Privacy Policy or wish to
                  exercise your rights, please contact us:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Email:</strong>{' '}
                    <a
                      href="mailto:hello@wanderingkite.in"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      hello@wanderingkite.in
                    </a>
                  </li>
                  <li>
                    <strong>Phone:</strong>{' '}
                    <a
                      href="tel:+917010092090"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {' '}
                      +91 70100 92090
                    </a>
                  </li>
                  <li>
                    <strong>Address:</strong> 123 Creative Hub, MG Road,
                    Bangalore, Karnataka 560001
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
