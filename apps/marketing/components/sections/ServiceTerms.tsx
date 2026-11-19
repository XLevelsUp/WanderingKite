// components/sections/ServiceTerms.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

import { termsData, type ServiceType } from '@/lib/service-terms';

export default function ServiceTerms({ type }: { type: ServiceType }) {
  const content = termsData[type];

  // Theme tokens throughout: dark on studio pages (data-theme="studio"), light porcelain on photography. Studio heading uses its orange.
  const accent = type === 'studio' ? { text: 'text-primary', dot: 'bg-primary' } : { text: 'text-foreground', dot: 'bg-accent-text' };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-16 bg-background border-t border-border"
    >
      <div className="max-w-4xl mx-auto px-6">
        <h2 className={`text-2xl font-bold ${accent.text} mb-8 tracking-tight`}>
          {content.header}
        </h2>

        {/* Scroll-Box for Premium UI feel */}
        <div className="bg-card border border-border rounded-xl p-8 max-h-[400px] overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            {content.items.map((item, index) => (
              <div
                key={index}
                className="group border-b border-border pb-6 last:border-0 last:pb-0"
              >
                <h3 className="text-foreground font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 ${accent.dot} rounded-full inline-block`}></span>
                  {item.title}
                </h3>
                <p className="text-foreground/75 text-sm leading-relaxed transition-colors group-hover:text-foreground">
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-foreground/60 text-xs italic text-center">
          *By proceeding with a booking, you agree to the terms outlined above.
        </p>
      </div>
    </motion.section>
  );
}
