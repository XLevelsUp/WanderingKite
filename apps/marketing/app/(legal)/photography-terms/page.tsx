import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Photography Service Agreement | Wandering Kite',
  description:
    'Usage rights, licensing, and booking terms for professional photography sessions in Coimbatore.',
};

const sections: LegalSection[] = [
  {
    id: 'usage-license',
    title: 'Usage License & Rights',
    body: (
      <>
        <p>
          Upon full payment of the session fees, Wandering Kite grants the client a <strong>standard usage license</strong> for personal or commercial use.
        </p>
        <ul>
          <li>The studio retains original copyright ownership of all raw and edited assets.</li>
          <li>Licenses are non-transferable to third-party agencies without written consent.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'booking',
    title: 'Booking & Financial Commitment',
    body: (
      <>
        <p>To provide a premium, dedicated experience, we operate on a strict booking schedule:</p>
        <ul>
          <li>For events and weddings, we recommend booking at least 30 days in advance.</li>
          <li>Slots are secured only after payment and receipt of mandatory documentation.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'identification',
    title: 'Mandatory Identification',
    body: (
      <p>
        For session security, clients must submit <strong>one valid ID proof</strong> and <strong>two (2) active mobile numbers</strong> prior to the session start.
      </p>
    ),
  },
];

export default function PhotographyTerms() {
  return <LegalPage title="Photography Service Agreement" updated="Ensuring Creative Excellence & Legal Clarity" sections={sections} current="/photography-terms" />;
}
