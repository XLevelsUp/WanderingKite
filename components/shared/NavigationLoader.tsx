'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationLoader } from '@/hooks/useNavigationLoader';
import { siteConfig } from '@/config/site';

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
            {/* Brand Identity */}
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-[0.3em] text-amber-500 uppercase">
                {siteConfig.name}
              </h2>
              <div className="mt-1 h-px w-full bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            </div>
            
            {/* Smooth Animated Spinner/Ring System */}
            <div className="relative h-20 w-20">
              {/* Static Outer Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/10" />
              
              {/* Spinning Main Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-t-2 border-amber-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Pulsing Inner Core */}
              <motion.div
                className="absolute inset-4 rounded-full bg-amber-500/20"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
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
