/**
 * analytics.ts
 * Typed GA4 event helpers for Wandering Kite.
 *
 * All functions are no-ops when gtag is not loaded (dev / SSR).
 */

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

/** Fire a GA4 custom event safely (client-side only). */
function track(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params ?? {});
}

// ─── WhatsApp / Contact ───────────────────────────────────────────────────────

/** User clicked a WhatsApp CTA. */
export function trackWhatsAppClick(params: {
  location: 'navbar' | 'flyout' | 'faq' | 'equipment_card' | 'service_page' | 'footer';
  service?: string;
  equipment_name?: string;
}) {
  track('whatsapp_click', {
    event_category: 'engagement',
    event_label: params.location,
    service: params.service ?? 'general',
    equipment_name: params.equipment_name ?? undefined,
  });
}

// ─── Booking Flyout ───────────────────────────────────────────────────────────

/** User expanded the booking flyout. */
export function trackFlyoutOpen(service?: string) {
  track('flyout_open', {
    event_category: 'engagement',
    service: service ?? 'general',
  });
}

// ─── Service Cards (home page) ────────────────────────────────────────────────

/** User clicked a service card on the home page. */
export function trackServiceCardClick(params: {
  service_name: string;
  destination_url: string;
}) {
  track('service_card_click', {
    event_category: 'navigation',
    event_label: params.service_name,
    destination_url: params.destination_url,
  });
}

// ─── Equipment Rentals ────────────────────────────────────────────────────────

/** User clicked "Rent This" on an equipment card. */
export function trackEquipmentRentClick(params: {
  equipment_name: string;
  daily_rate: number;
  available: boolean;
}) {
  track('equipment_rent_click', {
    event_category: 'conversion',
    event_label: params.equipment_name,
    daily_rate: params.daily_rate,
    available: params.available,
    currency: 'INR',
  });
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

/** User opened a FAQ accordion item. */
export function trackFAQOpen(params: {
  question: string;
  index: number;
  page?: string;
}) {
  track('faq_open', {
    event_category: 'engagement',
    event_label: params.question,
    faq_index: params.index,
    page: params.page ?? 'home',
  });
}

// ─── Navigation ───────────────────────────────────────────────────────────────

/** User clicked a navigation link. */
export function trackNavClick(params: {
  label: string;
  href: string;
}) {
  track('nav_click', {
    event_category: 'navigation',
    event_label: params.label,
    destination_url: params.href,
  });
}

// ─── Page-level ───────────────────────────────────────────────────────────────

/** Manually fire a page_view for client-navigated pages. */
export function trackPageView(params: {
  page_path: string;
  page_title?: string;
}) {
  track('page_view', {
    page_path: params.page_path,
    page_title: params.page_title ?? document.title,
  });
}
