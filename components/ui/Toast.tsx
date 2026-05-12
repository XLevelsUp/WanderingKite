import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  title: string;
  message?: string;
  variant?: ToastVariant;
  action?: React.ReactNode;
  onClose: (id: string) => void;
  duration?: number;
}

const variantStyles = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

const Icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function Toast({
  id,
  title,
  message,
  variant = 'info',
  action,
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const Icon = Icons[variant];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className="pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-xl bg-[rgba(17,17,22,0.96)] border border-white/10 shadow-2xl backdrop-blur-md"
    >
      <div className="flex w-full items-start p-4">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${variantStyles[variant]}`} aria-hidden="true" />
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-white">{title}</p>
          {message && <p className="mt-1 text-sm text-zinc-400">{message}</p>}
          {action && <div className="mt-3">{action}</div>}
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            type="button"
            className="inline-flex rounded-md text-zinc-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            onClick={() => onClose(id)}
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
