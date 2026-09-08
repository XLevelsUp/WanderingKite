/**
 * Pure utility — no React, no client hooks. Safe to import in both Server
 * and Client Components.
 */
import { type ClientSource } from '@/lib/validations/schemas';

export const SOURCE_META: Record<ClientSource, { label: string; emoji: string; color: string }> = {
  ADS:          { label: 'Ads',          emoji: '📣', color: 'border-violet-500/40 bg-violet-500/10 text-violet-300 hover:border-violet-500/70' },
  GOOGLE:       { label: 'Google',       emoji: '🔍', color: 'border-sky-500/40 bg-sky-500/10 text-sky-300 hover:border-sky-500/70' },
  WEBSITE:      { label: 'Website',      emoji: '🌐', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:border-cyan-500/70' },
  WALKIN:       { label: 'Walk-in',      emoji: '🚶', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:border-emerald-500/70' },
  REFERRAL:     { label: 'Referral',     emoji: '🔗', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300 hover:border-blue-500/70' },
  AI:           { label: 'AI',           emoji: '🤖', color: 'border-teal-500/40 bg-teal-500/10 text-teal-300 hover:border-teal-500/70' },
  SOCIAL_MEDIA: { label: 'Social Media', emoji: '📱', color: 'border-pink-500/40 bg-pink-500/10 text-pink-300 hover:border-pink-500/70' },
  // Legacy-only: clients created before source tracking became mandatory.
  UNKNOWN:      { label: 'Unknown',      emoji: '❔', color: 'border-slate-500/40 bg-slate-800/60 text-slate-300 hover:border-slate-400/60' },
};

/** Returns a human-readable label + emoji for a stored source value. Returns null if source is empty. */
export function sourceLabel(source: ClientSource | null | undefined): { label: string; emoji: string } | null {
  if (!source) return null;
  return SOURCE_META[source] ?? null;
}
