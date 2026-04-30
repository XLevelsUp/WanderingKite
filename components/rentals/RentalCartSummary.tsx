'use client';

import { useRentalCart } from './RentalCartContext';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { motion, AnimatePresence } from 'framer-motion';

export function RentalCartSummary() {
  const { selectedItems, subtotal, gst, finalTotal, clearCart } = useRentalCart();

  if (selectedItems.size === 0) return null;

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const generateBookingMessage = () => {
    const itemNames = Array.from(selectedItems.values()).map(item => item.name).join(', ');
    return `Hi! I'd like to request a rental booking for the following equipment:\n\n[ ${itemNames} ]\n\nTotal Estimated Rate: ${formatINR(Math.round(finalTotal))} (incl. GST) / day.`;
  };

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 w-full z-50 p-4 pointer-events-none"
    >
      <div className="container mx-auto max-w-5xl">
        <div className="pointer-events-auto rounded-2xl border border-amber-500/30 bg-zinc-950/95 backdrop-blur-xl p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Estimated Total (Per Day)</h4>
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
                <p className="font-mono text-lg text-white">{selectedItems.size}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Subtotal</p>
                <p className="font-mono text-lg text-zinc-300">{formatINR(subtotal)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">GST (18%)</p>
                <p className="font-mono text-lg text-zinc-500">{formatINR(Math.round(gst))}</p>
              </div>
              <div>
                <p className="text-white text-sm mb-1 font-bold">Total</p>
                <AnimatePresence mode="popLayout">
                  <motion.span 
                    key={finalTotal}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-3xl font-bold text-amber-500 inline-block"
                  >
                    {formatINR(Math.round(finalTotal))}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-auto flex flex-col items-center flex-shrink-0">
            <a
              href={generateWhatsAppLink('rentals', generateBookingMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto rounded-full bg-amber-500 px-8 py-4 text-center font-bold text-zinc-950 transition-all hover:bg-amber-400 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)] whitespace-nowrap"
            >
              Request Booking
            </a>
            <p className="text-xs text-zinc-500 mt-2">No payment required</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
