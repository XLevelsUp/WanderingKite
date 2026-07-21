'use client';

import { useRentalCart } from './RentalCartContext';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { Loader2 } from 'lucide-react';

export function RentalCartSummary() {
  const { selectedItems, subtotal, discountAmount, gst, finalTotal, clearCart, isRepeatClient, discountPercentage, billingPolicy } =
    useRentalCart();
  const [isLoading, setIsLoading] = useState(false);
  const { showError, showInfo } = useNotify();

  if (selectedItems.size === 0) return null;

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const generateBookingMessage = () => {
    const itemDetails = Array.from(selectedItems.values())
      .map((item) => `${item.name} (${item.selectedPlan.name} - ${formatINR(item.selectedPlan.rate)})`)
      .join('\n- ');
    
    let msg = `Hi! I'd like to request a rental booking for the following equipment:\n\n- ${itemDetails}\n\n`;
    msg += `Billing Mode: ${billingPolicy === 'HOURLY' ? 'Hourly' : 'Slot Based'}\n`;
    msg += `Subtotal: ${formatINR(subtotal)}\n`;
    if (isRepeatClient && discountAmount > 0) {
      msg += `Discount (${discountPercentage}% repeat client): -${formatINR(discountAmount)}\n`;
    }
    msg += `GST (18%): ${formatINR(Math.round(gst))}\n`;
    msg += `Total Estimated Quote: ${formatINR(Math.round(finalTotal))} (incl. GST).`;
    return msg;
  };

  const handleBookingRequest = async () => {
    setIsLoading(true);
    let timeoutId: NodeJS.Timeout;

    try {
      timeoutId = setTimeout(() => {
        showInfo(
          'This is taking longer than usual. Please check your connection.'
        );
      }, 8000);

      await new Promise((resolve) => setTimeout(resolve, 300));
      window.open(
        generateWhatsAppLink('rentals', generateBookingMessage()),
        '_blank',
        'noopener,noreferrer'
      );
    } catch (error) {
      showError('Failed to initiate booking request. Please try again.');
    } finally {
      clearTimeout(timeoutId!);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 w-full z-50 p-4 pointer-events-none"
    >
      <div className="container mx-auto max-w-5xl">
        <div className="pointer-events-auto rounded-2xl border border-warning/30 bg-zinc-950/95 backdrop-blur-xl p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Estimated Quote Summary
              </h4>
              <button
                onClick={clearCart}
                className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
              >
                Clear Cart
              </button>
            </div>

            <div className="flex flex-wrap items-end gap-6 sm:gap-12">
              <div>
                <p className="text-zinc-500 text-xs mb-1">Items</p>
                <p className="font-mono text-lg text-white">
                  {selectedItems.size}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Subtotal</p>
                <p className="font-mono text-lg text-zinc-300">
                  {formatINR(subtotal)}
                </p>
              </div>
              {discountAmount > 0 && (
                <div>
                  <p className="text-emerald-500 text-xs mb-1 font-semibold">{discountPercentage}% Discount</p>
                  <p className="font-mono text-lg text-emerald-400">
                    -{formatINR(discountAmount)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-zinc-500 text-xs mb-1">GST (18%)</p>
                <p className="font-mono text-lg text-zinc-500">
                  {formatINR(Math.round(gst))}
                </p>
              </div>
              <div>
                <p className="text-white text-sm mb-1 font-bold">Total</p>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={finalTotal}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-3xl font-bold text-warning inline-block"
                  >
                    {formatINR(Math.round(finalTotal))}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col items-center flex-shrink-0">
            <button
              onClick={handleBookingRequest}
              disabled={isLoading}
              className="w-full md:w-auto flex items-center justify-center gap-2 rounded-full bg-warning px-8 py-4 text-center font-bold text-warning-foreground transition-all hover:opacity-90 hover:shadow-[0_0_30px_-5px_hsl(var(--color-warning)/0.5)] whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Opening...' : 'Request Booking'}
            </button>
            <p className="text-xs text-zinc-500 mt-2">No payment required</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
