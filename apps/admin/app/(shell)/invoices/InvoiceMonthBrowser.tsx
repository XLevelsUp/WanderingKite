'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Receipt, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type InvoiceRow = {
  id: string;
  invoice_number: string;
  issue_date: string;
  status: string;
  total: number;
  client?: { name?: string | null } | null;
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  ISSUED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

// A swipe only counts once it clears this many px horizontally, and is at least
// this much more horizontal than vertical — otherwise a diagonal flick while
// scrolling the table would yank the user into another month.
const SWIPE_THRESHOLD_PX = 50;
const HORIZONTAL_BIAS = 1.5;

function fmt(n: number) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

// issue_date is a DATE column, so Supabase hands back a bare 'YYYY-MM-DD'.
// Slicing the key off the string keeps grouping stable in every timezone —
// new Date('2026-09-01') parses as UTC midnight and rolls back to August for
// any viewer west of Greenwich.
function monthKey(issueDate: string) {
  return issueDate.slice(0, 7);
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

function shiftMonth(key: string, delta: number) {
  const [year, month] = key.split('-').map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function keyOf(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function currentMonthKey() {
  const now = new Date();
  return keyOf(now.getFullYear(), now.getMonth() + 1);
}

const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleString('en-IN', { month: 'long' })
);

// How far the year dropdown reaches beyond the data, so a month can be picked
// before the first invoice or slightly ahead of today.
const YEARS_BEHIND = 5;
const YEARS_AHEAD = 1;

export function InvoiceMonthBrowser({ invoices }: { invoices: InvoiceRow[] }) {
  const reduceMotion = useReducedMotion();

  const byMonth = useMemo(() => {
    const map = new Map<string, InvoiceRow[]>();
    for (const inv of invoices) {
      const key = monthKey(inv.issue_date);
      const bucket = map.get(key);
      if (bucket) bucket.push(inv);
      else map.set(key, [inv]);
    }
    return map;
  }, [invoices]);

  // The cursor is the month itself, not an index into a fixed list — the
  // picker can land on any month, including ones far outside the invoice range.
  const [activeKey, setActiveKey] = useState(currentMonthKey);
  // Which way the panel should slide. Set on every navigation.
  const [direction, setDirection] = useState(0);
  // Unfiltered: no month, no year. activeKey is still kept underneath so that
  // picking either dropdown again lands somewhere sensible rather than resetting.
  const [showAll, setShowAll] = useState(false);

  // Swipe range: the span the invoices cover, always widened to include today
  // and wherever the picker has jumped to — so you can always swipe back out
  // of a month you selected, but never wander into unbounded empty months.
  const [minKey, maxKey] = useMemo(() => {
    const all = [...byMonth.keys(), currentMonthKey(), activeKey].sort();
    return [all[0], all[all.length - 1]];
  }, [byMonth, activeKey]);

  // Memoised so the empty-month `[]` isn't a fresh array on every render, which
  // would invalidate the visibleTotal memo below each time.
  const monthInvoices = useMemo(
    () => byMonth.get(activeKey) ?? [],
    [byMonth, activeKey]
  );

  // In "all" mode the server's ordering (created_at desc) is used as-is, which
  // is how this list read before any month filtering existed.
  const visibleInvoices = useMemo(
    () => (showAll ? invoices : monthInvoices),
    [showAll, invoices, monthInvoices]
  );

  const visibleTotal = useMemo(
    () => visibleInvoices.reduce((sum, inv) => sum + Number(inv.total ?? 0), 0),
    [visibleInvoices]
  );

  const years = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const invoiceYears = [...byMonth.keys()].map((k) => Number(k.slice(0, 4)));
    const activeYear = Number(activeKey.slice(0, 4));
    const lo = Math.min(thisYear - YEARS_BEHIND, activeYear, ...invoiceYears);
    const hi = Math.max(thisYear + YEARS_AHEAD, activeYear, ...invoiceYears);

    // Newest first — invoice work skews recent.
    const out: number[] = [];
    for (let y = hi; y >= lo; y--) out.push(y);
    return out;
  }, [byMonth, activeKey]);

  const canGoPrev = !showAll && activeKey > minKey;
  const canGoNext = !showAll && activeKey < maxKey;

  const go = useCallback(
    (delta: number) => {
      // Month stepping is meaningless while every month is on screen. Guarding
      // here covers the keyboard and swipe paths too, not just the chevrons.
      if (showAll) return;
      // Direction is set unconditionally: the state updater has to stay pure
      // (StrictMode double-invokes it), and a clamped move changes no key, so
      // AnimatePresence never runs a transition for it anyway.
      setDirection(delta);
      setActiveKey((prev) => {
        const next = shiftMonth(prev, delta);
        return next < minKey || next > maxKey ? prev : next;
      });
    },
    [minKey, maxKey, showAll]
  );

  const jumpTo = useCallback(
    (key: string) => {
      setDirection(key < activeKey ? -1 : 1);
      setActiveKey(key);
      // Picking a month is an unambiguous request for that month.
      setShowAll(false);
    },
    [activeKey]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't steal arrow keys from a field the user is typing in.
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    if (Math.abs(dx) < Math.abs(dy) * HORIZONTAL_BIAS) return;

    // Swiping left (negative dx) pulls the next month in from the right.
    go(dx < 0 ? 1 : -1);
  }

  const slide = reduceMotion ? 0 : 24;

  return (
    <div className="space-y-6">
      {/* Month navigator */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl border border-primary/25 text-foreground/50 transition-all hover:text-foreground hover:bg-primary/8 disabled:border-white/8 disabled:text-foreground/20 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center min-w-0">
          <h2
            aria-live="polite"
            className="text-base font-semibold text-foreground truncate"
          >
            {showAll ? 'All invoices' : monthLabel(activeKey)}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {visibleInvoices.length === 0
              ? 'No invoices'
              : `${visibleInvoices.length} invoice${visibleInvoices.length === 1 ? '' : 's'} · ${fmt(visibleTotal)}`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          disabled={!canGoNext}
          aria-label="Next month"
          className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl border border-primary/25 text-foreground/50 transition-all hover:text-foreground hover:bg-primary/8 disabled:border-white/8 disabled:text-foreground/20 disabled:pointer-events-none"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Jump to any month / year */}
      <div className="flex items-center justify-center gap-2">
        <Select
          value={showAll ? '' : String(Number(activeKey.slice(5, 7)))}
          onValueChange={(m) =>
            jumpTo(keyOf(Number(activeKey.slice(0, 4)), Number(m)))
          }
        >
          <SelectTrigger className="w-[150px]" aria-label="Month">
            <SelectValue placeholder="All months" />
          </SelectTrigger>
          <SelectContent>
            {MONTH_NAMES.map((name, i) => (
              <SelectItem key={name} value={String(i + 1)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={showAll ? '' : activeKey.slice(0, 4)}
          onValueChange={(y) =>
            jumpTo(keyOf(Number(y), Number(activeKey.slice(5, 7))))
          }
        >
          <SelectTrigger className="w-[110px]" aria-label="Year">
            <SelectValue placeholder="All years" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={showAll}
          onClick={() => setShowAll(true)}
        >
          <X className="h-4 w-4 mr-1.5" />
          Clear filters
        </Button>
      </div>

      {/* Swipe surface */}
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={showAll ? 'all' : activeKey}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? slide : -slide }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -slide : slide }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
          >
            {visibleInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
                <Receipt className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No invoices in {monthLabel(activeKey)}.
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Swipe or use the arrows to browse other months, or clear the
                  filters to see every invoice.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleInvoices.map((inv) => (
                      <TableRow
                        key={inv.id}
                        className="cursor-pointer hover:bg-accent/40"
                      >
                        <TableCell className="font-medium">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="hover:underline"
                          >
                            {inv.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell>{inv.client?.name ?? '—'}</TableCell>
                        <TableCell>
                          {new Date(inv.issue_date).toLocaleDateString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${STATUS_STYLES[inv.status] ?? ''}`}
                          >
                            {inv.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {fmt(inv.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
