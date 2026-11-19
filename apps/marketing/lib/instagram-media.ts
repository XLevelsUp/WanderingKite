// Instagram CDN host allowlist for the /api/instagram/media relay (https only), so it can never act as an open proxy.
const ALLOWED = /(^|\.)(fbcdn\.net|cdninstagram\.com)$/i;

export const isAllowedMediaUrl = (raw: string) => {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' && ALLOWED.test(u.hostname);
  } catch {
    return false;
  }
};

// Same-origin URL for a CDN file; used only as an onError fallback when an edge sends CORP same-origin and the browser blocks it.
export const relayUrl = (raw: string) => `/api/instagram/media?u=${encodeURIComponent(raw)}`;

/** onError handler for <video>/<img>: swap to the relay once (never loops, since the relay URL is same-origin). */
export const retryViaRelay = (e: { currentTarget: HTMLVideoElement | HTMLImageElement }, raw: string) => {
  const el = e.currentTarget;
  if (!raw || el.dataset.relayed || !isAllowedMediaUrl(raw)) return;
  el.dataset.relayed = '1';
  el.src = relayUrl(raw);
  if (el instanceof HTMLVideoElement) {
    el.load();
    if (el.autoplay) el.play().catch(() => {});
  }
};
