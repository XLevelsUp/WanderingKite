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
import { BulkInvoiceDownload } from '@/components/invoices/BulkInvoiceDownload';

export type InvoiceRow = {
  id: string;
  invoice_number: string;
  /** false → a non-invoiced REF- entry, kept out of the filed GST series. */
  is_invoiced: boolean;
  issue_date: string;
  status: string;
  total: number;
  client?: { name?: string | null } | null;
};

type Book = 'INVOICED' | 'NON_INVOICED' | 'ALL';

const BOOK_LABELS: Record<Book, string> = {
  INVOICED: 'Invoiced',
  NON_INVOICED: 'Non-invoiced',
  ALL: 'All entries',
};

// Rows written before 00071 have no flag in older cached payloads; they are all
// real invoices, matching the column's DEFAULT true.
function isInvoiced(inv: InvoiceRow) {
  return inv.is_invoiced ?? true;
}

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

  // Which book is on screen. Everything below — month grouping, swipe range,
  // totals — works off the scoped list, so the month navigator only ever
  // offers months that the selected book actually has entries in.
  const [book, setBook] = useState<Book>('INVOICED');

  const counts = useMemo(() => {
    let invoiced = 0;
    for (const inv of invoices) if (isInvoiced(inv)) invoiced += 1;
    return {
      INVOICED: invoiced,
      NON_INVOICED: invoices.length - invoiced,
      ALL: invoices.length,
    };
  }, [invoices]);

  const scopedInvoices = useMemo(() => {
    if (book === 'ALL') return invoices;
    const want = book === 'INVOICED';
    return invoices.filter((inv) => isInvoiced(inv) === want);
  }, [invoices, book]);

  const byMonth = useMemo(() => {
    const map = new Map<string, InvoiceRow[]>();
    for (const inv of scopedInvoices) {
      const key = monthKey(inv.issue_date);
      const bucket = map.get(key);
      if (bucket) bucket.push(inv);
      else map.set(key, [inv]);
    }
    return map;
  }, [scopedInvoices]);

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
    () => (showAll ? scopedInvoices : monthInvoices),
    [showAll, scopedInvoices, monthInvoices]
  );

  // Split as well as combined, so the All tab can show what each book
  // contributes instead of only a single figure that hides the mix.
  const visibleTotals = useMemo(() => {
    let invoicedTotal = 0;
    let nonInvoicedTotal = 0;
    for (const inv of visibleInvoices) {
      const amount = Number(inv.total ?? 0);
      if (isInvoiced(inv)) invoicedTotal += amount;
      else nonInvoicedTotal += amount;
    }
    return {
      invoiced: invoicedTotal,
      nonInvoiced: nonInvoicedTotal,
      combined: invoicedTotal + nonInvoicedTotal,
    };
  }, [visibleInvoices]);

  // The bulk download takes exactly what the table is showing, in the order
  // it is showing it. Memoised so the array identity only changes when the
  // visible set actually does, rather than on every render.
  const visibleIds = useMemo(
    () => visibleInvoices.map((inv) => inv.id),
    [visibleInvoices]
  );

  // Names the downloaded file after the filter that produced it, e.g.
  // Invoices-Invoiced-2026-09.pdf, so a month's file is identifiable later.
  const downloadScope = useMemo(() => {
    const bookPart = book === 'NON_INVOICED' ? 'Non-invoiced' : book === 'ALL' ? 'All' : 'Invoiced';
    return `${bookPart}-${showAll ? 'all-months' : activeKey}`;
  }, [book, showAll, activeKey]);

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
      {/* Book selector — the filed GST series, the entries kept out of it, or
          both together. */}
      <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/5 rounded-xl self-start w-fit">
        {(['INVOICED', 'NON_INVOICED', 'ALL'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setBook(key)}
            aria-pressed={book === key}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              book === key
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {BOOK_LABELS[key]}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                book === key ? 'bg-black/20' : 'bg-white/5 text-muted-foreground'
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

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
            {showAll ? `${BOOK_LABELS[book]} — every month` : monthLabel(activeKey)}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {visibleInvoices.length === 0
              ? 'No entries'
              : `${visibleInvoices.length} ${visibleInvoices.length === 1 ? 'entry' : 'entries'} · ${fmt(visibleTotals.combined)}`}
          </p>
          {book === 'ALL' && visibleInvoices.length > 0 && (
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              Invoiced {fmt(visibleTotals.invoiced)} · Non-invoiced{' '}
              {fmt(visibleTotals.nonInvoiced)}
            </p>
          )}
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
      <div className="flex items-center justify-center flex-wrap gap-2">
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

        {/* Takes whatever the filters above have left on screen. Hides itself
            when there is nothing to download. */}
        <BulkInvoiceDownload ids={visibleIds} scopeLabel={downloadScope} />
      </div>

      {/* Swipe surface */}
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={`${book}-${showAll ? 'all' : activeKey}`}
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
                  No {BOOK_LABELS[book].toLowerCase()} in {monthLabel(activeKey)}.
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Swipe or use the arrows to browse other months, or clear the
                  filters to see every month.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      {book === 'ALL' && <TableHead>Book</TableHead>}
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
                        {book === 'ALL' && (
                          <TableCell>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                isInvoiced(inv)
                                  ? 'bg-primary/10 text-primary border-primary/25'
                                  : 'bg-amber-500/10 text-amber-500 border-amber-500/25'
                              }`}
                            >
                              {isInvoiced(inv) ? 'Invoiced' : 'Not invoiced'}
                            </span>
                          </TableCell>
                        )}
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
