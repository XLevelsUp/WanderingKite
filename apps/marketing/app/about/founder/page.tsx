import { Metadata } from 'next';
import { FounderProfile } from './FounderProfile';

export const metadata: Metadata = {
  title: 'Our Founder | Wandering Kite - Creative Visionary in Coimbatore',
  description:
    "Meet the visionary behind Wandering Kite. Discover our founder's journey, professional expertise, and contact details.",
  openGraph: {
    title: 'Our Founder | Wandering Kite Studio Coimbatore',
    description:
      "Meet the visionary behind Wandering Kite Studio in Coimbatore. Learn about our founder's creative journey and professional expertise.",
    url: 'https://wanderingkite.in/about/founder',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://wanderingkite.in/about/founder',
  },
};

export default function FounderPage() {
  return <FounderProfile />;
}
