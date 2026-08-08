'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MediaTrackerFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [unlinked, setUnlinked] = useState(searchParams.get('unlinked') === '1');

  const updateFilters = useCallback(
    (q: string, unl: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set('q', q);
      else params.delete('q');

      if (unl) params.set('unlinked', '1');
      else params.delete('unlinked');

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== (searchParams.get('q') || '')) {
        updateFilters(query, unlinked);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, unlinked, updateFilters, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title or folder path..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        data-no-track
        className={cn(
          'shrink-0 h-9',
          unlinked && 'bg-primary/10 border-primary/40 text-primary'
        )}
        onClick={() => {
          const next = !unlinked;
          setUnlinked(next);
          updateFilters(query, next);
        }}
      >
        <Users className="h-3.5 w-3.5 mr-1.5" />
        No Client
      </Button>
    </div>
  );
}
