/**
 * Pure utility — no React, no client hooks. Safe to import in both Server
 * and Client Components.
 */
import { type ClientSource } from '@/lib/validations/schemas';

export const SOURCE_META: Record<ClientSource, { label: string; emoji: string; color: string }> = {
  INSTAGRAM: { label: 'Instagram', emoji: '📸', color: 'border-pink-500/40 bg-pink-500/10 text-pink-300 hover:border-pink-500/70' },
  REDDIT:    { label: 'Reddit',    emoji: '🟠', color: 'border-orange-500/40 bg-orange-500/10 text-orange-300 hover:border-orange-500/70' },
  YOUTUBE:   { label: 'YouTube',   emoji: '🎥', color: 'border-red-500/40 bg-red-500/10 text-red-300 hover:border-red-500/70' },
  WHATSAPP:  { label: 'WhatsApp',  emoji: '💬', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:border-emerald-500/70' },
  REFERRAL:  { label: 'Referral',  emoji: '🔗', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300 hover:border-blue-500/70' },
  BLOGGER:   { label: 'Blogger',   emoji: '✍️', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:border-amber-500/70' },
  OTHER:     { label: 'Other',     emoji: '➕', color: 'border-slate-500/40 bg-slate-800/60 text-slate-300 hover:border-slate-400/60' },
};

/** Returns a human-readable label + emoji for a stored source value. Returns null if source is empty. */
export function sourceLabel(source: ClientSource | null | undefined): { label: string; emoji: string } | null {
  if (!source) return null;
  return SOURCE_META[source] ?? null;
}
