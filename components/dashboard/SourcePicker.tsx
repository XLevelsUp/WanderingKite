'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  SELECTABLE_CLIENT_SOURCES,
  SOURCE_REQUIRES_DETAIL,
  type ClientSource,
} from '@/lib/validations/schemas';
import { SOURCE_META, sourceLabel } from '@/lib/sourceUtils';

// Re-export for convenience so client components only need one import
export { sourceLabel };

// ─── Form-based picker (hidden inputs, used in NewClientForm) ─────────────────

interface SourcePickerProps {
  /** Current value — pass the client's saved source on the edit form, or undefined for a blank new form */
  initialSource?: ClientSource | null;
  /** Current free-text detail — relevant only when initialSource is SOCIAL_MEDIA */
  initialDetail?: string | null;
  disabled?: boolean;
}

/**
 * Pill-based channel selector.
 * Renders hidden inputs named "source" and "source_detail" so it works
 * inside any <form> that submits via FormData (createNewClient / updateClient).
 */
export function SourcePicker({ initialSource, initialDetail, disabled }: SourcePickerProps) {
  const [selected, setSelected] = useState<ClientSource | undefined>(
    initialSource ?? undefined
  );
  const [detail, setDetail] = useState(initialDetail ?? '');

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-slate-300">
        How did they find us?{' '}
        <span className="text-red-400 font-normal" aria-hidden>*</span>
        <span className="sr-only">(required)</span>
      </Label>

      {/* Hidden inputs for FormData submission */}
      <input type="hidden" name="source" value={selected ?? ''} />
      {selected === SOURCE_REQUIRES_DETAIL && (
        <input type="hidden" name="source_detail" value={detail} />
      )}

      {/* Pill grid */}
      <div className="flex flex-wrap gap-2">
        {SELECTABLE_CLIENT_SOURCES.map((src) => {
          const meta = SOURCE_META[src];
          const isActive = selected === src;
          return (
            <button
              key={src}
              type="button"
              disabled={disabled}
              data-no-track
              // Source is mandatory — clicking the active pill must not clear it.
              onClick={() => setSelected(src)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold
                transition-all duration-150 select-none
                ${meta.color}
                ${isActive
                  ? 'ring-2 ring-offset-1 ring-offset-slate-950 opacity-100 scale-105'
                  : 'opacity-75 hover:opacity-100'
                }
                disabled:cursor-not-allowed disabled:opacity-50
              `}
            >
              <span>{meta.emoji}</span>
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Social-media platform input — animates in/out */}
      <AnimatePresence>
        {selected === SOURCE_REQUIRES_DETAIL && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <Input
              placeholder="Which platform? e.g. Instagram, Facebook…"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              disabled={disabled}
              maxLength={100}
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-sm mt-1"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Controlled picker (used in inline edit on client detail page) ─────────────
// No hidden inputs — values are lifted to the parent via callbacks.

interface SourcePickerControlledProps {
  value: ClientSource | null;
  detail: string;
  onChangeSource: (src: ClientSource | null) => void;
  onChangeDetail: (detail: string) => void;
  disabled?: boolean;
}

export function SourcePickerControlled({
  value,
  detail,
  onChangeSource,
  onChangeDetail,
  disabled,
}: SourcePickerControlledProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {SELECTABLE_CLIENT_SOURCES.map((src) => {
          const meta = SOURCE_META[src];
          const isActive = value === src;
          return (
            <button
              key={src}
              type="button"
              disabled={disabled}
              data-no-track
              // Source is mandatory — clicking the active pill must not clear it.
              onClick={() => onChangeSource(src)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold
                transition-all duration-150 select-none
                ${meta.color}
                ${isActive
                  ? 'ring-2 ring-offset-1 ring-offset-slate-950 opacity-100 scale-105'
                  : 'opacity-75 hover:opacity-100'
                }
                disabled:cursor-not-allowed disabled:opacity-50
              `}
            >
              <span>{meta.emoji}</span>
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {value === SOURCE_REQUIRES_DETAIL && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <Input
              placeholder="Which platform? e.g. Instagram, Facebook…"
              value={detail}
              onChange={(e) => onChangeDetail(e.target.value)}
              disabled={disabled}
              maxLength={100}
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-sm mt-1"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
