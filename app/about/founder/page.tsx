import { Metadata } from 'next';
import { FounderProfile } from './FounderProfile';

export const metadata: Metadata = {
    title: 'Our Founder | Wandering Kite - Creative Visionary in Coimbatore',
    description: 'Meet the visionary behind Wandering Kite. Discover our founder\'s journey, professional expertise, and contact details.',
};

export default function FounderPage() {
    return <FounderProfile />;
}
