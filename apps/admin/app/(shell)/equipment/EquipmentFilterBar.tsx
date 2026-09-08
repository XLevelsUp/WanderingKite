'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';

export function EquipmentFilterBar({ categories }: { categories: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [usage, setUsage] = useState(searchParams.get('usage') || 'all');

  const updateFilters = useCallback((q: string, cat: string, usg: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set('q', q);
    else params.delete('q');
    
    if (cat && cat !== 'all') params.set('category', cat);
    else params.delete('category');
    
    if (usg && usg !== 'all') params.set('usage', usg);
    else params.delete('usage');

    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== (searchParams.get('q') || '')) {
        updateFilters(query, category, usage);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, category, usage, updateFilters, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or serial number..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-[200px]">
        <Select 
          value={category} 
          onValueChange={(val) => {
            setCategory(val);
            updateFilters(query, val, usage);
          }}
        >
          <SelectTrigger data-no-track>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-[200px]">
        <Select 
          value={usage} 
          onValueChange={(val) => {
            setUsage(val);
            updateFilters(query, category, val);
          }}
        >
          <SelectTrigger data-no-track>
            <SelectValue placeholder="All Usages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Usages</SelectItem>
            <SelectItem value="rentals">Rentals</SelectItem>
            <SelectItem value="studiospace">Studio Space</SelectItem>
            <SelectItem value="inhouse">In-House</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
