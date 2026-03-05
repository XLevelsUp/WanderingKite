import type { Metadata } from 'next';
import { Footer } from '@/components/shared/Footer';
import { RefreshCcw } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Refund Policy | Wandering Kite Studio',
    description: 'Refund and cancellation policy for equipment rentals, studio bookings, and services at Wandering Kite Studio.',
};

export default function RefundsPage() {
    return (
        <main className="min-h-screen bg-background pt-20">
            {/* Hero */}
            <section className="border-b border-border bg-gradient-to-b from-zinc-900 to-zinc-950 py-16">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                                <RefreshCcw className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Refund Policy</h1>
                        <p className="text-muted-foreground">Last updated: January 20, 2026</p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="prose prose-invert mx-auto max-w-4xl">
                        <div className="space-y-8 text-muted-foreground">
                            {/* Overview */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">1. Overview</h2>
                                <p className="leading-relaxed">
                                    At Wandering Kite Studio, we strive to provide exceptional service. This Refund Policy outlines the conditions under which refunds are issued for equipment rentals, studio bookings, photography services, and security deposits.
                                </p>
                            </div>

                            {/* Equipment Rentals */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">2. Equipment Rental Refunds</h2>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">2.1 Cancellation Before Pickup</h3>
                                <div className="mb-4 overflow-hidden rounded-xl border border-border">
                                    <table className="w-full">
                                        <thead className="bg-card">
                                            <tr>
                                                <th className="border-b border-border px-6 py-3 text-left font-semibold text-foreground">Cancellation Timing</th>
                                                <th className="border-b border-border px-6 py-3 text-left font-semibold text-foreground">Refund Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-border">
                                                <td className="px-6 py-3">48+ hours before pickup</td>
                                                <td className="px-6 py-3 text-green-400">100% refund</td>
                                            </tr>
                                            <tr className="border-b border-border">
                                                <td className="px-6 py-3">24-48 hours before pickup</td>
                                                <td className="px-6 py-3 text-yellow-400">75% refund</td>
                                            </tr>
                                            <tr className="border-b border-border">
                                                <td className="px-6 py-3">12-24 hours before pickup</td>
                                                <td className="px-6 py-3 text-orange-400">50% refund</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3">Less than 12 hours or no-show</td>
                                                <td className="px-6 py-3 text-red-400">No refund</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">2.2 Equipment Malfunction</h3>
                                <p className="mb-4 leading-relaxed">
                                    If rented equipment malfunctions due to our fault (not user error):
                                </p>
                                <ul className="list-disc space-y-2 pl-6">
                                    <li><strong>Replacement Available:</strong> Immediate replacement with equivalent or better equipment, no refund</li>
                                    <li><strong>No Replacement Available:</strong> Full refund of rental fee + security deposit</li>
                                    <li><strong>Partial Malfunction:</strong> Prorated refund for unusable rental period</li>
                                </ul>

                                <h3 className="mb-3 mt-6 text-xl font-semibold text-foreground">2.3 Early Returns</h3>
                                <p className="leading-relaxed">
                                    No refunds for early returns. If you return equipment before the rental period ends, the full rental fee still applies. Consider booking shorter rental periods if unsure.
                                </p>
                            </div>

                            {/* Studio & Podcast */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">3. Studio & Podcast Space Refunds</h2>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">3.1 Cancellation Policy</h3>
                                <div className="mb-4 overflow-hidden rounded-xl border border-border">
                                    <table className="w-full">
                                        <thead className="bg-card">
                                            <tr>
                                                <th className="border-b border-border px-6 py-3 text-left font-semibold text-foreground">Cancellation Timing</th>
                                                <th className="border-b border-border px-6 py-3 text-left font-semibold text-foreground">Refund Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-border">
                                                <td className="px-6 py-3">72+ hours before booking</td>
                                                <td className="px-6 py-3 text-green-400">100% refund</td>
                                            </tr>
                                            <tr className="border-b border-border">
                                                <td className="px-6 py-3">48-72 hours before booking</td>
                                                <td className="px-6 py-3 text-yellow-400">75% refund</td>
                                            </tr>
                                            <tr className="border-b border-border">
                                                <td className="px-6 py-3">24-48 hours before booking</td>
                                                <td className="px-6 py-3 text-orange-400">50% refund</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3">Less than 24 hours or no-show</td>
                                                <td className="px-6 py-3 text-red-400">No refund</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">3.2 Facility Issues</h3>
                                <p className="mb-4 leading-relaxed">
                                    If studio/podcast space is unavailable due to our fault (power outage, double booking, maintenance):
                                </p>
                                <ul className="list-disc space-y-2 pl-6">
                                    <li><strong>Rescheduling:</strong> Free rescheduling to another available slot + 10% discount</li>
                                    <li><strong>Cannot Reschedule:</strong> Full refund + ₹1,000 compensation for inconvenience</li>
                                </ul>

                                <h3 className="mb-3 mt-6 text-xl font-semibold text-foreground">3.3 Unused Time</h3>
                                <p className="leading-relaxed">
                                    No refunds for unused time. If you book 4 hours but only use 2 hours, the full booking fee applies.
                                </p>
                            </div>

                            {/* Photography Services */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">4. Photography Service Refunds</h2>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">4.1 Cancellation by Client</h3>
                                <ul className="mb-4 list-disc space-y-2 pl-6">
                                    <li><strong>30+ days before event:</strong> Full refund minus ₹2,000 booking fee</li>
                                    <li><strong>15-30 days before event:</strong> 50% refund</li>
                                    <li><strong>Less than 15 days:</strong> No refund (date may be rescheduled once, subject to availability)</li>
                                </ul>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">4.2 Cancellation by Wandering Kite</h3>
                                <p className="mb-4 leading-relaxed">
                                    If we cancel due to photographer unavailability or unforeseen circumstances:
                                </p>
                                <ul className="list-disc space-y-2 pl-6">
                                    <li>Full refund of all payments made</li>
                                    <li>Assistance in finding alternative photographers (if requested)</li>
                                    <li>₹5,000 compensation for last-minute cancellations (within 7 days of event)</li>
                                </ul>

                                <h3 className="mb-3 mt-6 text-xl font-semibold text-foreground">4.3 Dissatisfaction with Photos</h3>
                                <p className="leading-relaxed">
                                    We offer unlimited revisions during the editing phase. If you're still unsatisfied after final delivery, we'll discuss a partial refund on a case-by-case basis (up to 30% of service fee).
                                </p>
                            </div>

                            {/* Security Deposits */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">5. Security Deposit Refunds</h2>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">5.1 Full Refund Conditions</h3>
                                <p className="mb-4 leading-relaxed">
                                    Security deposits are refunded in full if:
                                </p>
                                <ul className="mb-4 list-disc space-y-2 pl-6">
                                    <li>Equipment returned in original condition (normal wear and tear accepted)</li>
                                    <li>No damage, loss, or theft</li>
                                    <li>Returned within agreed rental period</li>
                                    <li>Studio/podcast space left clean and undamaged</li>
                                </ul>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">5.2 Partial Refund</h3>
                                <p className="mb-4 leading-relaxed">
                                    Deductions from security deposit may occur for:
                                </p>
                                <ul className="mb-4 list-disc space-y-2 pl-6">
                                    <li>Minor damage: Repair costs deducted</li>
                                    <li>Late return fees: As per rental terms</li>
                                    <li>Cleaning charges: ₹500-₹1,500 for studio/podcast space</li>
                                    <li>Missing accessories: Replacement cost deducted</li>
                                </ul>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">5.3 Refund Timeline</h3>
                                <p className="leading-relaxed">
                                    Security deposits are refunded within 3-5 business days after equipment return or booking completion via the original payment method.
                                </p>
                            </div>

                            {/* Refund Process */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">6. Refund Process</h2>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">6.1 How to Request a Refund</h3>
                                <ol className="mb-4 list-decimal space-y-2 pl-6">
                                    <li>Contact us via WhatsApp ( +91 70100 92090) or email (hello@wanderingkite.in)</li>
                                    <li>Provide booking ID and reason for refund request</li>
                                    <li>We'll review your request within 24 hours</li>
                                    <li>Approved refunds processed within 5-7 business days</li>
                                </ol>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">6.2 Refund Methods</h3>
                                <ul className="list-disc space-y-2 pl-6">
                                    <li>Refunds issued via original payment method (UPI, bank transfer, card)</li>
                                    <li>Bank transfers may take 5-7 business days to reflect</li>
                                    <li>Cash payments refunded in cash or UPI</li>
                                </ul>
                            </div>

                            {/* Force Majeure */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">7. Force Majeure</h2>
                                <p className="mb-4 leading-relaxed">
                                    In case of events beyond our control (natural disasters, government restrictions, pandemics):
                                </p>
                                <ul className="list-disc space-y-2 pl-6">
                                    <li>Full refund or free rescheduling (your choice)</li>
                                    <li>No compensation for consequential damages</li>
                                    <li>We'll notify you as soon as possible if such events occur</li>
                                </ul>
                            </div>

                            {/* Non-Refundable Items */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">8. Non-Refundable Items</h2>
                                <p className="mb-4 leading-relaxed">The following are non-refundable:</p>
                                <ul className="list-disc space-y-2 pl-6">
                                    <li>Booking fees (₹500-₹2,000 depending on service)</li>
                                    <li>Damage waiver fees (optional insurance)</li>
                                    <li>Delivery/pickup charges</li>
                                    <li>Third-party service fees (payment gateway charges)</li>
                                </ul>
                            </div>

                            {/* Disputes */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">9. Dispute Resolution</h2>
                                <p className="leading-relaxed">
                                    If you disagree with a refund decision, please contact our management team at disputes@wanderingkite.in. We'll review your case within 48 hours and provide a final decision. All decisions are at our sole discretion.
                                </p>
                            </div>

                            {/* Contact */}
                            <div className="rounded-xl border border-border bg-muted/50 p-6">
                                <h2 className="mb-4 text-2xl font-bold text-foreground">10. Contact Us</h2>
                                <p className="mb-4 leading-relaxed">
                                    For refund requests or questions about this policy:
                                </p>
                                <ul className="space-y-2">
                                    <li><strong>WhatsApp:</strong> <a href="https://wa.me/919876543210" className="text-green-400 hover:text-green-300"> +91 70100 92090</a></li>
                                    <li><strong>Email:</strong> <a href="mailto:hello@wanderingkite.in" className="text-green-400 hover:text-green-300">hello@wanderingkite.in</a></li>
                                    <li><strong>Phone:</strong> <a href="tel:+919876543210" className="text-green-400 hover:text-green-300"> +91 70100 92090</a></li>
                                    <li><strong>Address:</strong> 123 Creative Hub, MG Road, Bangalore, Karnataka 560001</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
