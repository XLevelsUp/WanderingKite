'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationLoader } from '@/hooks/useNavigationLoader';
import { WKLogo } from '@/components/shared/WKLogo';

/**
 * Global navigation loader component.
 * Displays a full-screen semi-transparent overlay with a spinner and dynamic labels
 * when the user navigates between internal routes.
 */
export function NavigationLoader() {
  const { isLoading, destination } = useNavigationLoader();

  /**
   * Generates a context-aware label based on the target URL.
   */
  const getLabel = () => {
    const url = destination.toLowerCase();
    if (url.includes('/photography')) return 'Loading photography...';
    if (url.includes('/studiospace')) return 'Loading studio space...';
    if (url.includes('/rentals')) return 'Loading equipment rentals...';
    if (url.includes('/podcast')) return 'Loading podcast studio...';
    if (url.includes('/about')) return 'Loading about us...';
    if (url.includes('/dashboard')) return 'Entering dashboard...';
    return 'Loading...';
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-8">
            {/* WK Logo with spinning ring */}
            <div className="relative h-24 w-24 flex items-center justify-center">
              {/* Static faint outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/10" />

              {/* Spinning amber ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-t-2 border-amber-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />

              {/* WK Logo inline SVG component */}
              <WKLogo className="w-12 h-12 text-amber-500" />
            </div>

            {/* Dynamic Destination Label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-1"
            >
              <p className="text-sm font-medium tracking-widest text-zinc-400 uppercase">
                {getLabel()}
              </p>
              <span className="text-[10px] text-zinc-600 tracking-wider">
                Wandering Kite Studio Coimbatore
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
