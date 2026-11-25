'use client';

import dynamic from 'next/dynamic';

// sonner's <Toaster> is only needed once something calls toast() (blog share/comments, client portal) — always
// after a user action. Loading it in its own chunk after hydration keeps ~33 KB off every page's critical path.
const Toaster = dynamic(() => import('sonner').then((m) => m.Toaster), { ssr: false });

export function LazyToaster() {
  return <Toaster richColors position="bottom-right" />;
}
