'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { STATUS_META, type MediaRecordStatus } from './status';

interface EmployeeOption {
  id: string;
  fullName: string | null;
}

export function MediaTrackerFilterBar({
  employees,
}: {
  employees: EmployeeOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [employee, setEmployee] = useState(searchParams.get('employee') || 'all');

  const updateFilters = useCallback(
    (q: string, st: string, emp: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set('q', q);
      else params.delete('q');

      if (st && st !== 'all') params.set('status', st);
      else params.delete('status');

      if (emp && emp !== 'all') params.set('employee', emp);
      else params.delete('employee');

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== (searchParams.get('q') || '')) {
        updateFilters(query, status, employee);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, status, employee, updateFilters, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by shoot title..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-[200px]">
        <Select
          value={status}
          onValueChange={(val) => {
            setStatus(val);
            updateFilters(query, val, employee);
          }}
        >
          <SelectTrigger data-no-track>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.keys(STATUS_META) as MediaRecordStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_META[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-[200px]">
        <Select
          value={employee}
          onValueChange={(val) => {
            setEmployee(val);
            updateFilters(query, status, val);
          }}
        >
          <SelectTrigger data-no-track>
            <SelectValue placeholder="All Employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.fullName ?? 'Unnamed'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
