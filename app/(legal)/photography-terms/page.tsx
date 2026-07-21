import type { Metadata } from 'next';
import { Camera, ShieldCheck, Copyright, CreditCard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Photography Service Agreement | Wandering Kite',
  description:
    'Usage rights, licensing, and booking terms for professional photography sessions in Coimbatore.',
};

export default function PhotographyTerms() {
  return (
    <main className="min-h-screen bg-zinc-950 pt-24 text-zinc-300">
      <section className="border-b border-zinc-900 bg-gradient-to-b from-zinc-900 to-zinc-950 py-16">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <Camera className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl tracking-tight">
            Photography Service Agreement
          </h1>
          <p className="text-zinc-500 italic">
            Ensuring Creative Excellence & Legal Clarity
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6 prose prose-invert prose-amber max-w-4xl">
          <div className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900/30 p-8">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-white mb-6">
              <Copyright className="text-amber-500" /> 1. Usage License & Rights
            </h2>
            <p>
              Upon full payment of the session fees, Wandering Kite grants the
              client a <strong>standard usage license</strong> for personal or
              commercial use.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                The studio retains original copyright ownership of all raw and
                edited assets.
              </li>
              <li>
                Licenses are non-transferable to third-party agencies without
                written consent.
              </li>
            </ul>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <CreditCard className="text-amber-500" /> 2. Booking & Financial
              Commitment
            </h2>
            <p>
              To provide a premium, dedicated experience, we operate on a strict
              booking schedule:
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                For events and weddings, we recommend booking at least 30 days in advance.
              </li>
              <li>
                Slots are secured only after payment and receipt of mandatory
                documentation.
              </li>
            </ul>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Mandatory Identification
            </h2>
            <p>
              For session security, clients must submit{' '}
              <strong>one valid ID proof</strong> and{' '}
              <strong>two (2) active mobile numbers</strong> prior to the
              session start.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
