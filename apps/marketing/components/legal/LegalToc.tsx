'use client';

import { useEffect, useState } from 'react';

type Item = { id: string; title: string };

/** Sticky "On this page" list; highlights the section currently in view (IntersectionObserver, no scroll handlers). */
export function LegalToc({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-96px 0px -60% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <ol className="space-y-1 border-l border-border">
      {items.map((i, n) => (
        <li key={i.id}>
          <a
            href={`#${i.id}`}
            aria-current={active === i.id ? 'location' : undefined}
            className={`-ml-px flex gap-2 border-l-2 py-1 pl-4 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active === i.id ? 'border-primary font-semibold text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="tabular-nums">{String(n + 1).padStart(2, '0')}</span>
            {i.title}
          </a>
        </li>
      ))}
    </ol>
  );
}
