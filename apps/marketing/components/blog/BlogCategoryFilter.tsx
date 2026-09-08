'use client';

import Link from 'next/link';
import {
  CATEGORY_LABELS,
  CATEGORY_SLUGS,
  categoriesForSection,
  type BlogCategory,
  type BlogSectionKey,
} from '@/lib/blog';

interface BlogCategoryFilterProps {
  /**
   * The active category, derived on the server from the URL. Passed as a prop
   * rather than held in local state: useState's initial value does NOT update
   * when props change after mount, so keeping it in state would leave the
   * pills out of sync after a client-side navigation.
   */
  active: BlogCategory | null;
  /** Which blog's categories to show. */
  section: BlogSectionKey;
  /** Listing route these pills link to, e.g. "/blog" or "/studiospace/blog". */
  basePath: string;
}

export function BlogCategoryFilter({
  active,
  section,
  basePath,
}: BlogCategoryFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Link
        href={basePath}
        scroll={false}
        aria-current={active === null ? 'page' : undefined}
        className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
          active === null
            ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
            : 'border-border bg-card/50 text-muted-foreground hover:border-amber-500/30 hover:text-white'
        }`}
      >
        All posts
      </Link>

      {categoriesForSection(section).map((category) => {
        const isActive = active === category;
        return (
          <Link
            key={category}
            href={`${basePath}?category=${CATEGORY_SLUGS[category]}`}
            scroll={false}
            aria-current={isActive ? 'page' : undefined}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
              isActive
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                : 'border-border bg-card/50 text-muted-foreground hover:border-amber-500/30 hover:text-white'
            }`}
          >
            {CATEGORY_LABELS[category]}
          </Link>
        );
      })}
    </div>
  );
}
