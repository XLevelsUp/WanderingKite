import type { Metadata } from 'next';
import { LegalCallout, LegalPage, type LegalSection } from '@/components/legal/LegalPage';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Equipment Rental Policy | Wandering Kite Coimbatore',
  description:
    'Professional terms for cinematography gear, lighting, and studio equipment rentals at Wandering Kite.',
};

const { email, phone } = siteConfig.contact;

const sections: LegalSection[] = [
  {
    id: 'security-documentation',
    title: 'Security & Mandatory Documentation',
    body: (
      <>
        <p>To maintain the integrity of our high-value inventory, we enforce strict verification protocols for all renters.</p>
        <ul>
          <li>
            <strong>Blank Cheque Protocol:</strong> Submission of a Blank Cheque is <strong className="underline decoration-primary underline-offset-4">mandatory</strong> for all high-value camera bodies, cinema lenses, and professional lighting kits.
          </li>
          <li>
            <strong>Dual Verification:</strong> You must provide <strong>two (2) active mobile numbers</strong> and a permanent emergency contact number.
          </li>
          <li>
            <strong>Identity Proof:</strong> Submission of original Government-issued ID (Aadhar/Voter ID) is required during pickup. A digital copy will be retained in our secure records.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'usage-license',
    title: 'Usage License & Intellectual Property',
    body: (
      <>
        <p>
          All rented equipment is provided under a temporary usage license. Wandering Kite Studio grants the Renter the right to use the equipment for the duration of the rental period for personal or commercial productions.
        </p>
        <ul>
          <li>The license is non-transferable; equipment cannot be sub-rented or shared with third parties.</li>
          <li>Equipment firmware or internal software configurations must not be altered.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'booking-financials',
    title: 'Booking & Financials',
    body: (
      <>
        <p>
          All rental bookings are finalized only after the <strong>50% non-refundable advance</strong> is processed.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="!mt-0">Rental Tiers</h3>
            <ul className="mt-2 !list-none !pl-0 text-sm">
              <li><strong>Daily:</strong> 24-hour cycle</li>
              <li><strong>Weekly:</strong> 7 consecutive days</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="!mt-0">Late Fees</h3>
            <p className="mt-2 text-sm">50% of daily rate for &lt;4 hours delay. Full day rate applies after 4 hours.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Liability & Asset Protection',
    body: (
      <>
        <p>
          The Renter assumes <strong>100% liability</strong> for the equipment from the moment of pickup until the final inspection is cleared by our technicians.
        </p>
        <LegalCallout>
          &quot;In the event of major damage, loss, or theft, the Renter is liable for the full replacement market value of the equipment plus any associated shipping and calibration costs.&quot;
        </LegalCallout>
      </>
    ),
  },
  {
    id: 'questions',
    title: 'Questions or Dispute Resolution?',
    body: (
      <>
        <p>Our legal team and studio managers are available via WhatsApp for immediate assistance.</p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <a
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="!no-underline inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold !text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            WhatsApp: {phone}
          </a>
          <a
            href={`mailto:${email}`}
            className="!no-underline inline-flex h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold transition-colors duration-200 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Email: {email}
          </a>
        </div>
      </>
    ),
  },
];

export default function RentalPolicyPage() {
  return <LegalPage title="Equipment Rental Policy" updated="Last updated: April 30, 2026 • Coimbatore, TN" sections={sections} current="/terms" />;
}
