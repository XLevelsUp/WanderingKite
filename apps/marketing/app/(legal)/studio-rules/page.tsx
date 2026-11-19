import type { Metadata } from 'next';
import { LegalCallout, LegalPage, type LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Studio Space Regulations | Wandering Kite Coimbatore',
  description:
    'Access rules and conduct guidelines for the Wandering Kite creative studio space.',
};

const sections: LegalSection[] = [
  {
    id: 'access-hours',
    title: 'Access Hours',
    body: <p>Entry is strictly restricted to the booked hours. Early arrivals or late exits will be billed at standard hourly rates.</p>,
  },
  {
    id: 'mandatory-info',
    title: 'Mandatory Info',
    body: (
      <p>
        All visitors must complete a personal info form and provide <strong>two (2) active mobile numbers</strong> for safety protocols.
      </p>
    ),
  },
  {
    id: 'professional-conduct',
    title: 'Professional Conduct',
    body: <p>We maintain a high-end atmosphere. No smoking, illegal substances, or unprofessional conduct is permitted within the studio premises.</p>,
  },
  {
    id: 'liability',
    title: 'Liability Disclaimer',
    body: (
      <LegalCallout>
        Wandering Kite is <strong>not responsible</strong> for personal belongings or external equipment brought into the studio. Clients are advised to maintain their own insurance for high-value items.
      </LegalCallout>
    ),
  },
];

// Studio family page: dark studio palette (header follows via isStudioRoute).
export default function StudioRules() {
  return <LegalPage studio title="Studio Space Regulations" updated="Maintaining a Premium Creative Environment in Coimbatore" sections={sections} current="/studio-rules" />;
}
