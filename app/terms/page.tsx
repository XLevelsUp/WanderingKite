import type { Metadata } from 'next';
import { Footer } from '@/components/shared/Footer';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Rental Terms & Conditions | Wandering Kite Studio',
    description: 'Terms and conditions for equipment rentals, studio bookings, and services at Wandering Kite Studio.',
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background pt-20">
            {/* Hero */}
            <section className="border-b border-border bg-gradient-to-b from-zinc-900 to-zinc-950 py-16">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
                                <FileText className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>
                        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Rental Terms & Conditions</h1>
                        <p className="text-muted-foreground">Last updated: January 20, 2026</p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="prose prose-invert mx-auto max-w-4xl">
                        <div className="space-y-8 text-muted-foreground">
                            {/* Agreement */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">1. Agreement to Terms</h2>
                                <p className="leading-relaxed">
                                    By renting equipment or booking studio/podcast space from Wandering Kite Studio ("we," "our," or "us"), you ("Renter," "you," or "your") agree to be bound by these Terms and Conditions. Please read them carefully before making a booking.
                                </p>
                            </div>

                            {/* Booking & Reservations */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">2. Booking & Reservations</h2>
                                <h3 className="mb-3 text-xl font-semibold text-foreground">2.1 How to Book</h3>
                                <ul className="mb-4 list-disc space-y-2 pl-6">
                                    <li>All bookings must be made via WhatsApp at +91 70100 92090</li>
                                    <li>Minimum advance booking: 24 hours for equipment, 48 hours for studio/podcast space</li>
                                    <li>Bookings are confirmed only after payment of the security deposit</li>
                                </ul>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">2.2 Availability</h3>
                                <p className="leading-relaxed">
                                    Equipment and space availability is subject to real-time status. We reserve the right to decline bookings if items are unavailable or under maintenance.
                                </p>
                            </div>

                            {/* Security Deposit */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">3. Security Deposit</h2>
                                <h3 className="mb-3 text-xl font-semibold text-foreground">3.1 Deposit Amounts</h3>
                                <ul className="mb-4 list-disc space-y-2 pl-6">
                                    <li><strong>Cameras & Lenses:</strong> ₹5,000 - ₹10,000 (depending on equipment value)</li>
                                    <li><strong>Lighting & Audio:</strong> ₹2,000 - ₹5,000</li>
                                    <li><strong>Studio/Podcast Space:</strong> ₹3,000</li>
                                </ul>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">3.2 Refund Policy</h3>
                                <p className="mb-4 leading-relaxed">
                                    Security deposits are fully refundable upon safe return of equipment or completion of studio booking, subject to:
                                </p>
                                <ul className="list-disc space-y-2 pl-6">
                                    <li>Equipment returned in the same condition as received</li>
                                    <li>No damage, loss, or theft</li>
                                    <li>Return within the agreed rental period</li>
                                    <li>Refund processed within 3-5 business days via original payment method</li>
                                </ul>
                            </div>

                            {/* Rental Period */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">4. Rental Period & Pricing</h2>
                                <h3 className="mb-3 text-xl font-semibold text-foreground">4.1 Rental Duration</h3>
                                <ul className="mb-4 list-disc space-y-2 pl-6">
                                    <li><strong>Daily Rental:</strong> 24-hour period from pickup time</li>
                                    <li><strong>Weekly Rental:</strong> 7 consecutive days</li>
                                    <li><strong>Studio/Podcast:</strong> Hourly, half-day (4 hours), or full-day (8 hours)</li>
                                </ul>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">4.2 Late Returns</h3>
                                <p className="leading-relaxed">
                                    Late returns incur additional charges: 50% of daily rate for delays up to 4 hours, full daily rate for delays beyond 4 hours. Contact us immediately if you need an extension (subject to availability).
                                </p>
                            </div>

                            {/* Pickup & Delivery */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">5. Pickup & Delivery</h2>
                                <h3 className="mb-3 text-xl font-semibold text-foreground">5.1 Pickup</h3>
                                <ul className="mb-4 list-disc space-y-2 pl-6">
                                    <li>Equipment must be picked up from our location: 123 Creative Hub, MG Road, Bangalore</li>
                                    <li>Valid government-issued ID required at pickup</li>
                                    <li>Renter must inspect equipment and sign rental agreement</li>
                                </ul>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">5.2 Delivery (Optional)</h3>
                                <p className="leading-relaxed">
                                    Delivery and pickup services available within Bangalore city limits for an additional fee (₹500-₹1,500 depending on distance). Delivery must be arranged at least 48 hours in advance.
                                </p>
                            </div>

                            {/* Equipment Care */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">6. Equipment Care & Responsibility</h2>
                                <h3 className="mb-3 text-xl font-semibold text-foreground">6.1 Renter's Responsibility</h3>
                                <p className="mb-4 leading-relaxed">You agree to:</p>
                                <ul className="mb-4 list-disc space-y-2 pl-6">
                                    <li>Use equipment in a professional and careful manner</li>
                                    <li>Not sublet, lend, or transfer equipment to third parties</li>
                                    <li>Keep equipment secure and protected from theft, damage, or loss</li>
                                    <li>Return equipment in the same condition as received (normal wear and tear excepted)</li>
                                    <li>Immediately report any malfunction or damage</li>
                                </ul>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">6.2 Prohibited Uses</h3>
                                <ul className="list-disc space-y-2 pl-6">
                                    <li>Using equipment in hazardous environments (extreme weather, water, etc.) without prior approval</li>
                                    <li>Commercial use beyond agreed scope</li>
                                    <li>Illegal activities or content creation that violates laws</li>
                                </ul>
                            </div>

                            {/* Damage & Loss */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">7. Damage, Loss & Theft</h2>
                                <h3 className="mb-3 text-xl font-semibold text-foreground">7.1 Minor Damage</h3>
                                <p className="leading-relaxed">
                                    Normal wear and tear is expected. Minor cosmetic damage (scratches, scuffs) will not incur charges.
                                </p>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">7.2 Major Damage</h3>
                                <p className="mb-4 leading-relaxed">
                                    Renter is liable for repair costs for functional damage. Costs will be deducted from the security deposit. If repair costs exceed the deposit, Renter must pay the difference.
                                </p>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">7.3 Loss or Theft</h3>
                                <p className="mb-4 leading-relaxed">
                                    In case of loss or theft, Renter must:
                                </p>
                                <ul className="mb-4 list-disc space-y-2 pl-6">
                                    <li>File a police report within 24 hours</li>
                                    <li>Provide a copy of the FIR to Wandering Kite Studio</li>
                                    <li>Pay the full replacement value of the equipment (market price or insured value)</li>
                                </ul>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">7.4 Damage Waiver (Optional)</h3>
                                <p className="leading-relaxed">
                                    Purchase optional damage waiver for 10% of rental cost. Covers accidental damage (excludes theft, loss, and negligence).
                                </p>
                            </div>

                            {/* Studio/Podcast Terms */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">8. Studio & Podcast Space Terms</h2>
                                <h3 className="mb-3 text-xl font-semibold text-foreground">8.1 Usage Rules</h3>
                                <ul className="mb-4 list-disc space-y-2 pl-6">
                                    <li>Maximum occupancy: 10 persons for studio, 6 persons for podcast space</li>
                                    <li>No smoking, alcohol, or illegal substances on premises</li>
                                    <li>Renter responsible for cleaning up after session</li>
                                    <li>Equipment included in booking must not be removed from premises</li>
                                </ul>

                                <h3 className="mb-3 text-xl font-semibold text-foreground">8.2 Cancellation</h3>
                                <p className="leading-relaxed">
                                    Cancellations made 48+ hours in advance: Full refund. Cancellations within 48 hours: 50% refund. No-shows: No refund.
                                </p>
                            </div>

                            {/* Payment Terms */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">9. Payment Terms</h2>
                                <ul className="list-disc space-y-2 pl-6">
                                    <li>Payment accepted via UPI, bank transfer, cash, or card</li>
                                    <li>Full rental fee + security deposit due at booking confirmation</li>
                                    <li>GST (18%) applicable on all rentals</li>
                                    <li>Invoices provided via email within 24 hours of payment</li>
                                </ul>
                            </div>

                            {/* Liability */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">10. Limitation of Liability</h2>
                                <p className="leading-relaxed">
                                    Wandering Kite Studio is not liable for any indirect, incidental, or consequential damages arising from equipment malfunction, data loss, or project delays. Our maximum liability is limited to the rental fee paid.
                                </p>
                            </div>

                            {/* Termination */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">11. Termination of Rental</h2>
                                <p className="mb-4 leading-relaxed">
                                    We reserve the right to terminate a rental and demand immediate return of equipment if:
                                </p>
                                <ul className="list-disc space-y-2 pl-6">
                                    <li>Renter violates these terms</li>
                                    <li>Equipment is being misused or damaged</li>
                                    <li>Renter provides false information</li>
                                    <li>Payment is dishonored or reversed</li>
                                </ul>
                            </div>

                            {/* Governing Law */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-foreground">12. Governing Law</h2>
                                <p className="leading-relaxed">
                                    These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bangalore, Karnataka.
                                </p>
                            </div>

                            {/* Contact */}
                            <div className="rounded-xl border border-border bg-muted/50 p-6">
                                <h2 className="mb-4 text-2xl font-bold text-foreground">13. Contact Us</h2>
                                <p className="mb-4 leading-relaxed">
                                    For questions about these terms or to report issues:
                                </p>
                                <ul className="space-y-2">
                                    <li><strong>WhatsApp:</strong> <a href="https://wa.me/919876543210" className="text-purple-400 hover:text-purple-300"> +91 70100 92090</a></li>
                                    <li><strong>Email:</strong> <a href="mailto:hello@wanderingkite.in" className="text-purple-400 hover:text-purple-300">hello@wanderingkite.in</a></li>
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
