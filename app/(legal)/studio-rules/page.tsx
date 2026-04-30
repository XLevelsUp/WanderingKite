import type { Metadata } from 'next';
import { Home, Clock, AlertTriangle, Users } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Studio Space Regulations | Wandering Kite Coimbatore',
    description: 'Access rules and conduct guidelines for the Wandering Kite creative studio space.',
};

export default function StudioRules() {
    return (
        <main className="min-h-screen bg-zinc-950 pt-24 text-zinc-300">
            <section className="border-b border-zinc-900 bg-gradient-to-b from-zinc-900 to-zinc-950 py-16">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                            <Home className="h-8 w-8 text-amber-500" />
                        </div>
                    </div>
                    <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl tracking-tight">Studio Space Regulations</h1>
                    <p className="text-zinc-500">Maintaining a Premium Creative Environment in Coimbatore</p>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-6 prose prose-invert prose-amber max-w-4xl">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <h3 className="text-amber-500 font-bold flex items-center gap-2 mb-3"><Clock size={20}/> 1. Access Hours</h3>
                            <p className="text-sm">Entry is strictly restricted to the booked hours. Early arrivals or late exits will be billed at standard hourly rates.</p>
                        </div>
                        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <h3 className="text-amber-500 font-bold flex items-center gap-2 mb-3"><Users size={20}/> 2. Mandatory Info</h3>
                            <p className="text-sm">All visitors must complete a personal info form and provide <strong>two (2) active mobile numbers</strong> for safety protocols.</p>
                        </div>
                    </div>

                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">3. Professional Conduct</h2>
                        <p>We maintain a high-end atmosphere. No smoking, illegal substances, or unprofessional conduct is permitted within the studio premises[cite: 1].</p>
                    </div>

                    <div className="mb-12 p-8 border-l-4 border-amber-500 bg-zinc-900/50">
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><AlertTriangle className="text-amber-500"/> 4. Liability Disclaimer</h2>
                        <p className="text-sm leading-relaxed">
                            Wandering Kite is <strong>not responsible</strong> for personal belongings or external equipment brought into the studio[cite: 1]. Clients are advised to maintain their own insurance for high-value items[cite: 1].
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}