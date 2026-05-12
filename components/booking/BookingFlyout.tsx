"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Loader2 } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { useNotify } from "@/hooks/useNotify";

interface BookingFlyoutProps {
  service?: string;
}

export function BookingFlyout({ service }: BookingFlyoutProps = {}) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showError, showInfo } = useNotify();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = async () => {
    setIsLoading(true);
    let timeoutId: NodeJS.Timeout;

    try {
      // Show slow network warning if it takes > 8s
      timeoutId = setTimeout(() => {
        showInfo("This is taking longer than usual. Please check your connection.");
      }, 8000);

      // Simulate a small delay for the spinner (since it's just a URL open)
      // If there were a real tracking API call, it would go here.
      await new Promise(resolve => setTimeout(resolve, 300));
      
      window.open(generateWhatsAppLink(service), '_blank', 'noopener,noreferrer');
    } catch (error) {
      showError("Failed to open WhatsApp. Please try again.");
    } finally {
      clearTimeout(timeoutId!);
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 36 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <AnimatePresence mode="wait">
            {expanded ? (
              /* ── Expanded mini panel ── */
              <motion.div
                key="panel"
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="
                  w-72 overflow-hidden rounded-2xl
                  border border-primary/22
                  bg-[rgba(14,15,22,0.96)] backdrop-blur-2xl
                  shadow-[0_24px_80px_rgba(0,0,0,0.50),0_0_0_1px_hsl(var(--primary)/0.08)]
                "
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-primary/12 p-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary opacity-80">
                      Quick Inquiry
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {service ?? "Book a Session"}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpanded(false)}
                    className="
                      flex h-7 w-7 items-center justify-center rounded-lg
                      border border-primary/15 text-primary
                      transition-all duration-200
                      hover:border-primary/40 hover:bg-primary/12
                    "
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-4">
                  <p className="mb-4 text-xs text-foreground/55 leading-relaxed">
                    Tap below to open WhatsApp with your enquiry pre-filled. We
                    typically respond within 30 minutes.
                  </p>
                  <button
                    onClick={handleWhatsAppClick}
                    disabled={isLoading}
                    className="
                      flex w-full items-center justify-center gap-2 rounded-xl py-3
                      bg-primary text-primary-foreground
                      text-sm font-semibold
                      transition-all duration-200
                      hover:opacity-90 hover:shadow-[0_8px_28px_hsl(var(--primary)/0.40)]
                      hover:scale-[1.02] active:scale-[0.98]
                      disabled:opacity-50 disabled:pointer-events-none
                    "
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4" />
                    )}
                    {isLoading ? "Opening..." : "Open WhatsApp"}
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ── Collapsed pill button ── */
              <motion.button
                key="pill"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.18 }}
                onClick={() => setExpanded(true)}
                aria-label="Open quick inquiry"
                className="
                  flex items-center gap-3 rounded-full
                  border border-primary/35
                  bg-[rgba(14,15,22,0.90)] backdrop-blur-xl
                  px-5 py-3.5 text-sm font-semibold text-primary
                  shadow-[0_8px_32px_rgba(0,0,0,0.40),0_0_0_1px_hsl(var(--primary)/0.08)]
                  transition-all duration-200
                  hover:border-primary/60
                  hover:bg-primary/12
                  hover:text-foreground
                  hover:shadow-[0_8px_32px_hsl(var(--primary)/0.25)]
                "
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Quick Inquiry</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
