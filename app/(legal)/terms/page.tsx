import type { Metadata } from 'next';
import { FileText, ShieldCheck, AlertCircle, HardDrive } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Equipment Rental Policy | Wandering Kite Coimbatore',
    description: 'Professional terms for cinematography gear, lighting, and studio equipment rentals at Wandering Kite.',
};

export default function RentalPolicyPage() {
    return (
        <main className="min-h-screen bg-zinc-950 pt-24 text-zinc-300">
            {/* Header Section */}
            <section className="border-b border-zinc-900 bg-gradient-to-b from-zinc-900 to-zinc-950 py-16">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                                <ShieldCheck className="h-8 w-8 text-amber-500" />
                            </div>
                        </div>
                        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl tracking-tight">Equipment Rental Policy</h1>
                        <p className="text-zinc-500">Last updated: April 30, 2026 • Coimbatore, TN</p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="prose prose-invert prose-amber mx-auto max-w-4xl">
                        
                        {/* 1. Security & Documentation */}
                        <div className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900/30 p-8">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-white mb-6">
                                <AlertCircle className="text-amber-500" /> 1. Security & Mandatory Documentation
                            </h2>
                            <div className="space-y-4">
                                <p className="leading-relaxed">
                                    To maintain the integrity of our high-value inventory, we enforce strict verification protocols for all renters.
                                </p>
                                <ul className="list-disc space-y-3 pl-6">
                                    <li><strong className="text-amber-500">Blank Cheque Protocol:</strong> Submission of a Blank Cheque is <span className="underline italic">mandatory</span> for all high-value camera bodies, cinema lenses, and professional lighting kits.</li>
                                    <li><strong className="text-amber-500">Dual Verification:</strong> You must provide <strong>two (2) active mobile numbers</strong> and a permanent emergency contact number.</li>
                                    <li><strong className="text-amber-500">Identity Proof:</strong> Submission of original Government-issued ID (Aadhar/Voter ID) is required during pickup. A digital copy will be retained in our secure records.</li>
                                </ul>
                            </div>
                        </div>

                        {/* 2. Usage & Licensing */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-white mb-4">2. Usage License & Intellectual Property</h2>
                            <p>
                                All rented equipment is provided under a temporary usage license. Wandering Kite Studio grants the Renter the right to use the equipment for the duration of the rental period for personal or commercial productions.
                            </p>
                            <ul className="list-disc space-y-2 pl-6 mt-4">
                                <li>The license is non-transferable; equipment cannot be sub-rented or shared with third parties.</li>
                                <li>Equipment firmware or internal software configurations must not be altered.</li>
                            </ul>
                        </div>

                        {/* 3. Booking & Payments */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-white mb-4">3. Booking & Financials</h2>
                            <p>All rental bookings are finalized only after the <strong>50% non-refundable advance</strong> is processed.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                                    <h4 className="font-bold text-amber-500 mb-2">Rental Tiers</h4>
                                    <ul className="text-sm space-y-1">
                                        <li><strong>Daily:</strong> 24-hour cycle</li>
                                        <li><strong>Weekly:</strong> 7 consecutive days</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                                    <h4 className="font-bold text-amber-500 mb-2">Late Fees</h4>
                                    <p className="text-sm">50% of daily rate for &lt;4 hours delay. Full day rate applies after 4 hours.</p>
                                </div>
                            </div>
                        </div>

                        {/* 4. Damage & Liability */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-white mb-4">4. Liability & Asset Protection</h2>
                            <p className="mb-4">
                                The Renter assumes <strong>100% liability</strong> for the equipment from the moment of pickup until the final inspection is cleared by our technicians.
                            </p>
                            <div className="bg-amber-500/5 border-l-4 border-amber-500 p-6 italic">
                                "In the event of major damage, loss, or theft, the Renter is liable for the full replacement market value of the equipment plus any associated shipping and calibration costs."
                            </div>
                        </div>

                        {/* Contact Support */}
                        <div className="mt-16 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                            <h3 className="text-xl font-bold text-white mb-4">Questions or Dispute Resolution?</h3>
                            <p className="text-zinc-400 mb-6">Our legal team and studio managers are available via WhatsApp for immediate assistance.</p>
                            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                                <a href="https://wa.me/917010092090" className="text-amber-500 font-bold hover:underline">
                                    WhatsApp: +91 70100 92090
                                </a>
                                <span className="hidden md:block text-zinc-700">|</span>
                                <a href="mailto:hello@wanderingkite.in" className="text-amber-500 font-bold hover:underline">
                                    Email: hello@wanderingkite.in
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </main>
    );
}