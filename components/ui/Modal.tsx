'use client';

import { motion, AnimatePresence } from 'framer-motion';

export interface ModalProps {
  id: string;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isBlocking?: boolean; // If true, hides the cancel button
}

export function Modal({
  title,
  description,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isBlocking = false,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-[rgba(17,17,22,0.96)] border border-white/10 shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>

        <div className="bg-zinc-900/50 p-4 border-t border-white/5 flex items-center justify-end gap-3">
          {!isBlocking && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-6 py-2 rounded-full text-sm font-semibold bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors shadow-[0_0_15px_-3px_hsl(var(--color-warning)/0.4)]"
            >
              {confirmText}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
