'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

export interface BannerProps {
  id: string;
  message: string;
  type: 'offline' | 'online' | 'maintenance';
}

const icons = {
  offline: WifiOff,
  online: Wifi,
  maintenance: AlertCircle,
};

const styles = {
  offline: 'bg-red-500/90 text-white',
  online: 'bg-emerald-500/90 text-white',
  maintenance: 'bg-amber-500/90 text-white',
};

export function Banner({ id, message, type }: BannerProps) {
  const Icon = icons[type];

  return (
    <motion.div
      layout
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`w-full py-2 px-4 shadow-md backdrop-blur-md z-[200] flex items-center justify-center gap-2 ${styles[type]}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
}
