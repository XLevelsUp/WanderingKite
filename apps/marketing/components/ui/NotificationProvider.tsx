'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toast, ToastProps } from './Toast';
import { Banner, BannerProps } from './Banner';
import { Modal, ModalProps } from './Modal';
import { setupFetchInterceptor, restoreFetch } from '@/lib/fetch-interceptor';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';
import { WKLogo } from '@/components/shared/WKLogo';

type OmittedToastProps = Omit<ToastProps, 'id' | 'onClose'>;
type OmittedModalProps = Omit<ModalProps, 'id'>;
type OmittedBannerProps = Omit<BannerProps, 'id'>;

export interface NotificationContextType {
  showSuccess: (title: string, options?: OmittedToastProps) => void;
  showError: (title: string, options?: OmittedToastProps) => void;
  showWarning: (title: string, options?: OmittedToastProps) => void;
  showInfo: (title: string, options?: OmittedToastProps) => void;
  removeToast: (id: string) => void;

  showModal: (options: OmittedModalProps) => string;
  removeModal: (id: string) => void;

  showBanner: (options: OmittedBannerProps) => string;
  removeBanner: (id: string) => void;

  showLoader: (message?: string) => void;
  hideLoader: () => void;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [modals, setModals] = useState<ModalProps[]>([]);
  const [banners, setBanners] = useState<BannerProps[]>([]);
  const [loaderMessage, setLoaderMessage] = useState<string | null>(null);

  const pathname = usePathname();

  // Clear loader automatically when the route (pathname) changes.
  // usePathname is safe to call directly — it does NOT require Suspense in Next.js 15.
  useEffect(() => {
    setLoaderMessage(null);
  }, [pathname]);

  // Toasts
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (props: OmittedToastProps & { variant: ToastProps['variant'] }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => {
        // Keep only up to 3 toasts max
        const updated = [...prev, { ...props, id, onClose: removeToast }];
        return updated.slice(-3); // Get the last 3 items
      });
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (title: string, options?: OmittedToastProps) =>
      addToast({ title, variant: 'success', ...options }),
    [addToast]
  );
  const showError = useCallback(
    (title: string, options?: OmittedToastProps) =>
      addToast({ title, variant: 'error', ...options }),
    [addToast]
  );
  const showWarning = useCallback(
    (title: string, options?: OmittedToastProps) =>
      addToast({ title, variant: 'warning', ...options }),
    [addToast]
  );
  const showInfo = useCallback(
    (title: string, options?: OmittedToastProps) =>
      addToast({ title, variant: 'info', ...options }),
    [addToast]
  );

  // Modals
  const removeModal = useCallback((id: string) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const showModal = useCallback((options: OmittedModalProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setModals((prev) => [...prev, { ...options, id }]);
    return id;
  }, []);

  // Banners
  const removeBanner = useCallback((id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const showBanner = useCallback((options: OmittedBannerProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setBanners((prev) => [...prev, { ...options, id }]);
    return id;
  }, []);

  // Loader
  const showLoader = useCallback((message = 'Processing...') => {
    setLoaderMessage(message);
  }, []);

  const hideLoader = useCallback(() => {
    setLoaderMessage(null);
  }, []);

  // 1. Offline Detector
  useEffect(() => {
    let offlineBannerId: string | null = null;
    let onlineBannerId: string | null = null;

    const handleOffline = () => {
      if (onlineBannerId) {
        removeBanner(onlineBannerId);
        onlineBannerId = null;
      }
      offlineBannerId = showBanner({
        message: 'No internet connection. Please check your network.',
        type: 'offline',
      });
    };

    const handleOnline = () => {
      if (offlineBannerId) {
        removeBanner(offlineBannerId);
        offlineBannerId = null;
      }

      onlineBannerId = showBanner({
        message: "You're back online!",
        type: 'online',
      });

      // Auto dismiss online banner
      setTimeout(() => {
        if (onlineBannerId) removeBanner(onlineBannerId);
      }, 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Initial check (in case they load the app offline via service worker)
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [showBanner, removeBanner]);

  // 2. Session Expiry Alert
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // NOTE: For true 2-minute warning, you'd need to inspect session.expires_at and set a timer.
      // This basic implementation handles the actual expiry / logout event.
      if (event === 'SIGNED_OUT') {
        showModal({
          title: 'Session expired',
          description: 'Your session has expired. Please log in again.',
          confirmText: 'Log In',
          isBlocking: true,
          onConfirm: () => {
            window.location.href = '/login';
          },
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [showModal]);

  // 3. Global Fetch Interceptor
  useEffect(() => {
    setupFetchInterceptor({
      allowedOrigins: ['supabase.co', window.location.hostname],
      allowedPrefixes: ['/api/', '/v1/'],
      silentCodes: [404, 409], // Silently ignore 404s and 409s for global fetch logic
      onError: (status, url, message) => {
        showError(message || `An error occurred (${status})`);
      },
      onAuthError: () => {
        // Handled silently by Supabase auth listener mostly, but just in case:
        // We could redirect or do nothing.
      },
    });

    return () => {
      restoreFetch();
    };
  }, [showError]);

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast,
        showModal,
        removeModal,
        showBanner,
        removeBanner,
        showLoader,
        hideLoader,
      }}
    >
      {/* Banners */}
      <div className="fixed top-0 left-0 right-0 z-[200] flex flex-col pointer-events-none">
        <AnimatePresence>
          {banners.map((banner) => (
            <Banner key={banner.id} {...banner} />
          ))}
        </AnimatePresence>
      </div>

      {/* Global Loader Overlay */}
      <AnimatePresence>
        {loaderMessage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-sm pointer-events-auto"
          >
            <div className="flex flex-col items-center gap-8">
              {/* WK Logo with spinning amber ring */}
              <div className="relative h-24 w-24 flex items-center justify-center">
                {/* Static faint outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-amber-500/10" />
                {/* Spinning amber ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-t-2 border-amber-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                {/* WK Logo */}
                <WKLogo className="w-12 h-12 text-amber-500" />
              </div>
              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-medium tracking-widest text-zinc-400 uppercase"
              >
                {loaderMessage}
              </motion.p>
              <span className="text-[10px] text-zinc-600 tracking-wider -mt-6">
                Wandering Kite Studio Coimbatore
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {children}

      {/* Toasts */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-[100] flex px-4 py-6 sm:p-6 flex-col items-center justify-start gap-2"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modals.map((modal) => (
          <Modal key={modal.id} {...modal} />
        ))}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}
