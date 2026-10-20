// components/sections/ServiceTerms.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Defined types for service-specific content logic
type ServiceType = 'photography' | 'rentals' | 'studio';

interface TermItem {
  title: string;
  details: string;
}

const termsData: Record<ServiceType, { header: string; items: TermItem[] }> = {
  photography: {
    header: 'Photography Service Agreement',
    items: [
      {
        title: 'Usage License',
        details:
          'Standard personal and commercial usage rights are granted upon full payment. Attribution is appreciated but not mandatory for commercial licenses.',
      },
      {
        title: 'Booking Requirement',
        details:
          'For events and weddings, we recommend booking at least 30 days in advance. Bookings are on a first-come, first-served basis.',
      },
      {
        title: 'ID Verification',
        details:
          'MANDATORY: Submission of a valid ID proof and two active mobile numbers is required for final session confirmation.',
      },
    ],
  },
  rentals: {
    header: 'Equipment Rental Policy',
    items: [
      {
        title: 'Security Deposit',
        details:
          'High-value gear rentals require the submission of a Blank Cheque as a mandatory security measure.',
      },
      {
        title: 'Liability',
        details:
          'The renter assumes 100% liability for repair or replacement costs in the event of equipment damage or loss during the rental period.',
      },
      {
        title: 'Mandatory Documentation',
        details:
          'Original ID proof (Aadhar or Voter ID) and two secondary contact numbers must be provided at the time of pickup.',
      },
    ],
  },
  studio: {
    header: 'Studio Space Regulations',
    items: [
      {
        title: 'Access Control',
        details:
          'Entry is strictly restricted to the booked hours. Early arrivals or late departures may incur additional hourly charges.',
      },
      {
        title: 'Personal Belongings',
        details:
          'The studio is not responsible for any personal belongings. Clients are advised to secure their valuables during the session.',
      },
      {
        title: 'Studio Conduct',
        details:
          'Submission of a personal information form and two mobile numbers is mandatory for all individuals entering the Coimbatore studio space.',
      },
    ],
  },
};

export default function ServiceTerms({ type }: { type: ServiceType }) {
  const content = termsData[type];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-16 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-amber-500 mb-8 tracking-tight">
          {content.header}
        </h2>

        {/* Scroll-Box for Premium UI feel */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-8 max-h-[400px] overflow-y-auto custom-scrollbar shadow-2xl">
          <div className="space-y-8">
            {content.items.map((item, index) => (
              <div
                key={index}
                className="group border-b border-zinc-800 pb-6 last:border-0 last:pb-0"
              >
                <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block"></span>
                  {item.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-zinc-500 text-xs italic text-center">
          *By proceeding with a booking, you agree to the terms outlined above.
        </p>
      </div>
    </motion.section>
  );
}
