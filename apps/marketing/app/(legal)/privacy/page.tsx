import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/legal/LegalPage';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy | Wandering Kite Studio',
  description:
    'Privacy policy for Wandering Kite Studio - How we collect, use, and protect your personal information.',
};

const { email, phone, address } = siteConfig.contact;
const tel = `tel:${phone.replace(/[^0-9+]/g, '')}`;

const sections: LegalSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    body: (
      <p>
        Wandering Kite Studio (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us via WhatsApp or other communication channels.
      </p>
    ),
  },
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    body: (
      <>
        <h3>2.1 Personal Information</h3>
        <p>We may collect the following personal information:</p>
        <ul>
          <li>Name and contact details (phone number, email address)</li>
          <li>WhatsApp number and chat history related to bookings</li>
          <li>Payment information (processed securely through third-party payment gateways)</li>
          <li>Government-issued ID for equipment rentals (security deposit purposes)</li>
          <li>Business information (if booking for commercial purposes)</li>
        </ul>
        <h3>2.2 Automatically Collected Information</h3>
        <ul className="mt-4">
          <li>IP address and browser type</li>
          <li>Device information and operating system</li>
          <li>Pages visited and time spent on our website</li>
          <li>Referral source and exit pages</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Information',
    body: (
      <>
        <p>We use your information to:</p>
        <ul>
          <li>Process bookings and rental agreements</li>
          <li>Communicate with you via WhatsApp, email, or phone regarding your bookings</li>
          <li>Process payments and manage security deposits</li>
          <li>Send promotional offers and updates (with your consent)</li>
          <li>Improve our services and website functionality</li>
          <li>Comply with legal obligations and resolve disputes</li>
        </ul>
      </>
    ),
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing and Disclosure',
    body: (
      <>
        <p>We do not sell your personal information. We may share your data with:</p>
        <ul>
          <li><strong>Payment Processors:</strong> To process transactions securely</li>
          <li><strong>Service Providers:</strong> Third-party vendors who assist in our operations (e.g., hosting, analytics)</li>
          <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
          <li><strong>Insurance Providers:</strong> In case of equipment damage claims</li>
        </ul>
      </>
    ),
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Communication',
    body: (
      <p>
        By initiating contact via WhatsApp, you consent to receive booking confirmations, updates, and promotional messages through this channel. We use WhatsApp Business and comply with their privacy policies. You can opt out of promotional messages at any time by messaging &quot;STOP.&quot;
      </p>
    ),
  },
  {
    id: 'data-security',
    title: 'Data Security',
    body: (
      <p>
        We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and restricted access. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
      </p>
    ),
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    body: (
      <p>
        We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, and resolve disputes. Rental records are kept for a minimum of 3 years for accounting and legal purposes.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your Rights',
    body: (
      <>
        <p>You have the right to:</p>
        <ul>
          <li>Access and request a copy of your personal data</li>
          <li>Correct inaccurate or incomplete information</li>
          <li>Request deletion of your data (subject to legal retention requirements)</li>
          <li>Opt out of marketing communications</li>
          <li>Withdraw consent for data processing</li>
        </ul>
        <p>
          To exercise these rights, contact us at <a href={`mailto:${email}`}>{email}</a>
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and Tracking',
    body: (
      <p>
        We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can control cookie preferences through your browser settings.
      </p>
    ),
  },
  {
    id: 'third-party-links',
    title: 'Third-Party Links',
    body: (
      <p>
        Our website may contain links to third-party websites (e.g., Instagram, YouTube, Google Maps). We are not responsible for the privacy practices of these external sites. Please review their privacy policies before sharing your information.
      </p>
    ),
  },
  {
    id: 'childrens-privacy',
    title: "Children's Privacy",
    body: (
      <p>
        Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected such data, please contact us immediately.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    body: (
      <p>
        We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last Updated&quot; date. Continued use of our services after changes constitutes acceptance of the revised policy.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact Us',
    body: (
      <>
        <p>If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:</p>
        {/* Contact details come from siteConfig so they can't drift (the old copy had a Bangalore placeholder address). */}
        <dl className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          <div className="bg-card p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Email</dt>
            <dd className="mt-2"><a href={`mailto:${email}`}>{email}</a></dd>
          </div>
          <div className="bg-card p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Phone</dt>
            <dd className="mt-2"><a href={tel}>{phone}</a></dd>
          </div>
          <div className="bg-card p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Address</dt>
            <dd className="mt-2 text-foreground">{address.street}, {address.city}, {address.state} {address.zip}</dd>
          </div>
        </dl>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated="Last updated: January 20, 2026" sections={sections} current="/privacy" />;
}
