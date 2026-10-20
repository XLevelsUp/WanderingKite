'use client';

import React, { createContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast, ToastProps } from './Toast';

type OmittedToastProps = Omit<ToastProps, 'id' | 'onClose'>;

interface ToastContextType {
  showSuccess: (title: string, options?: OmittedToastProps) => void;
  showError: (title: string, options?: OmittedToastProps) => void;
  showWarning: (title: string, options?: OmittedToastProps) => void;
  showInfo: (title: string, options?: OmittedToastProps) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback(
    (props: OmittedToastProps & { variant: ToastProps['variant'] }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { ...props, id, onClose: removeToast }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (title: string, options?: OmittedToastProps) => {
      addToast({ title, variant: 'success', ...options });
    },
    [addToast]
  );

  const showError = useCallback(
    (title: string, options?: OmittedToastProps) => {
      addToast({ title, variant: 'error', ...options });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (title: string, options?: OmittedToastProps) => {
      addToast({ title, variant: 'warning', ...options });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, options?: OmittedToastProps) => {
      addToast({ title, variant: 'info', ...options });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ showSuccess, showError, showWarning, showInfo, removeToast }}
    >
      {children}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-[100] flex px-4 py-6 sm:p-6 flex-col items-center justify-start sm:items-end sm:justify-end gap-2"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
