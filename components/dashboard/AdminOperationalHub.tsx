'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CalendarCheck,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Clock,
  Camera,
  Building2,
  Package,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
type PaymentStatus = 'PENDING' | 'PARTIALLY_COMPLETED' | 'COMPLETED';

interface BaseBooking {
  id: string;
  clientId: string;
  clientName: string;
  status: BookingStatus;
  dateTime: string;
  type: 'PHOTOGRAPHY' | 'STUDIO' | 'RENTAL';
  quotation: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
}

interface IdProofEntry {
  clientId: string;
  clientName: string;
  idType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  fileUrl: string;
}

interface Props {
  pendingBookings: BaseBooking[];
  confirmedBookings: BaseBooking[];
  outstandingBookings: BaseBooking[];
  idProofs: IdProofEntry[];
  conflictLogs: any[];
}

const SERVICE_ICON = {
  PHOTOGRAPHY: Camera,
  STUDIO: Building2,
  RENTAL: Package,
};

const SERVICE_COLOR = {
  PHOTOGRAPHY: 'text-violet-400',
  STUDIO: 'text-sky-400',
  RENTAL: 'text-amber-400',
};

const PAYMENT_LABEL: Record<PaymentStatus, { label: string; cls: string }> = {
  COMPLETED: { label: 'Fully Paid', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  PARTIALLY_COMPLETED: { label: 'Partial', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  PENDING: { label: 'Unpaid', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

function formatDate(dt: string) {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(dt: string) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const TABS = [
  { key: 'pending',   label: 'Pending Requests', icon: Bell },
  { key: 'active',    label: 'Active Bookings',   icon: CalendarCheck },
  { key: 'balances',  label: 'Outstanding Balances', icon: CreditCard },
  { key: 'idProofs',  label: 'ID Verifications',  icon: ShieldCheck },
  { key: 'conflicts', label: 'Booking Conflicts', icon: AlertCircle },
] as const;

type TabKey = typeof TABS[number]['key'];

export function AdminOperationalHub({ pendingBookings, confirmedBookings, outstandingBookings, idProofs, conflictLogs = [] }: Props) {
  const [active, setActive] = useState<TabKey>('pending');

  const counts: Record<TabKey, number> = {
    pending:   pendingBookings.length,
    active:    confirmedBookings.length,
    balances:  outstandingBookings.length,
    idProofs:  idProofs.filter((p) => p.status === 'PENDING').length,
    conflicts: conflictLogs.filter((c) => c.status === 'blocked').length,
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/50 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          const count = counts[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`relative flex items-center gap-2 px-5 py-4 text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {count > 0 && (
                <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                }`}>
                  {count}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="hub-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-4 min-h-[320px]">
        <AnimatePresence mode="wait">
          {/* ─── PENDING ─── */}
          {active === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {pendingBookings.length === 0 ? (
                <EmptyState icon={Bell} message="No pending booking requests." />
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">
                    {pendingBookings.length} request{pendingBookings.length !== 1 ? 's' : ''} awaiting confirmation
                  </p>
                  {pendingBookings.map((b) => (
                    <BookingRow key={b.id} booking={b} showPayment={false} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── ACTIVE ─── */}
          {active === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {confirmedBookings.length === 0 ? (
                <EmptyState icon={CalendarCheck} message="No confirmed bookings at the moment." />
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">
                    {confirmedBookings.length} confirmed booking{confirmedBookings.length !== 1 ? 's' : ''}
                  </p>
                  {confirmedBookings.map((b) => (
                    <BookingRow key={b.id} booking={b} showPayment />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── BALANCES ─── */}
          {active === 'balances' && (
            <motion.div
              key="balances"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {outstandingBookings.length === 0 ? (
                <EmptyState icon={CreditCard} message="All balances are settled." />
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">
                    {outstandingBookings.length} booking{outstandingBookings.length !== 1 ? 's' : ''} with outstanding balance
                  </p>
                  {outstandingBookings.map((b) => (
                    <BalanceRow key={b.id} booking={b} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── ID PROOFS ─── */}
          {active === 'idProofs' && (
            <motion.div
              key="idProofs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {idProofs.length === 0 ? (
                <EmptyState icon={ShieldCheck} message="No ID verification submissions." />
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">
                    {idProofs.length} submission{idProofs.length !== 1 ? 's' : ''}
                  </p>
                  {idProofs.map((proof) => (
                    <IdProofRow key={`${proof.clientId}-${proof.idType}`} proof={proof} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── BOOKING CONFLICTS ─── */}
          {active === 'conflicts' && (
            <motion.div
              key="conflicts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {conflictLogs.length === 0 ? (
                <EmptyState icon={AlertCircle} message="No booking conflicts logged." />
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">
                    {conflictLogs.length} conflict{conflictLogs.length !== 1 ? 's' : ''} logged ({counts.conflicts} unresolved)
                  </p>
                  {conflictLogs.map((conflict) => (
                    <ConflictRow key={conflict.id} conflict={conflict} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConflictRow({ conflict }: { conflict: any }) {
  const isResolved = conflict.status !== 'blocked';
  const statusColors = {
    blocked: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  }[conflict.status as string] || 'bg-rose-500/10 text-rose-400 border-rose-500/20';

  return (
    <Link href="/dashboard/audit-logs?tab=studio">
      <div className="group flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:border-amber-500/30 hover:bg-slate-800/50 transition-all cursor-pointer">
        <div className="flex-shrink-0 p-2 rounded-lg bg-slate-800/80">
          <AlertCircle className="h-4 w-4 text-rose-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-white truncate">{conflict.client_name}</span>
            <span className="text-[10px] text-slate-400 font-normal">attempted</span>
            <span className="text-[10px] text-amber-400 font-semibold">Studio Space</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(conflict.attempted_date_time)} {formatTime(conflict.attempted_date_time)} ({conflict.attempted_duration_hours}h)
            </span>
            {conflict.conflicting_booking_details && (
              <span className="text-[10px] text-rose-400/80">
                Clash with: {conflict.conflicting_booking_details.client_name}
              </span>
            )}
          </div>
          {isResolved && (
            <div className="text-[10px] text-slate-500 mt-1">
              Resolved by {conflict.resolved_by_name || 'Admin'}
              {conflict.resolution_notes && ` — "${conflict.resolution_notes}"`}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusColors}`}>
            {conflict.status}
          </span>
        </div>

        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-500 transition-colors flex-shrink-0" />
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
      <Icon className="h-8 w-8" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function BookingRow({ booking, showPayment }: { booking: BaseBooking; showPayment: boolean }) {
  const ServiceIcon = SERVICE_ICON[booking.type] ?? Package;
  const serviceColor = SERVICE_COLOR[booking.type] ?? 'text-slate-400';
  const payInfo = PAYMENT_LABEL[booking.paymentStatus];

  return (
    <Link href={`/dashboard/clients/${booking.clientId}`}>
      <div className="group flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:border-amber-500/30 hover:bg-slate-800/50 transition-all cursor-pointer">
        {/* Service icon */}
        <div className={`flex-shrink-0 p-2 rounded-lg bg-slate-800/80 ${serviceColor}`}>
          <ServiceIcon className="h-4 w-4" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-white truncate">{booking.clientName}</span>
            <span className={`text-[10px] font-bold uppercase ${serviceColor}`}>
              {booking.type === 'PHOTOGRAPHY' ? 'Photo' : booking.type === 'STUDIO' ? 'Studio' : 'Rental'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(booking.dateTime)} {formatTime(booking.dateTime)}
            </span>
            {booking.quotation > 0 && (
              <span className="text-[10px] text-slate-400">₹{booking.quotation.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>

        {/* Payment badge for active bookings */}
        {showPayment && (
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-bold ${payInfo.cls}`}>
            {payInfo.label}
          </span>
        )}

        {/* Arrow */}
        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-500 transition-colors flex-shrink-0" />
      </div>
    </Link>
  );
}

function BalanceRow({ booking }: { booking: BaseBooking }) {
  const ServiceIcon = SERVICE_ICON[booking.type] ?? Package;
  const serviceColor = SERVICE_COLOR[booking.type] ?? 'text-slate-400';
  const balance = Math.max(0, booking.quotation - booking.amountPaid);
  const payInfo = PAYMENT_LABEL[booking.paymentStatus];

  return (
    <Link href={`/dashboard/clients/${booking.clientId}`}>
      <div className="group flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:border-amber-500/30 hover:bg-slate-800/50 transition-all cursor-pointer">
        <div className={`flex-shrink-0 p-2 rounded-lg bg-slate-800/80 ${serviceColor}`}>
          <ServiceIcon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-white truncate">{booking.clientName}</span>
            <span className={`text-[10px] font-bold uppercase ${serviceColor}`}>
              {booking.type === 'PHOTOGRAPHY' ? 'Photo' : booking.type === 'STUDIO' ? 'Studio' : 'Rental'}
            </span>
            {/* Booking lifecycle status */}
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
              booking.status === 'COMPLETED'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              {booking.status === 'COMPLETED' ? 'Delivered' : 'Confirmed'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(booking.dateTime)}
            </span>
            <span className="text-[10px] text-slate-400">
              Quoted: ₹{booking.quotation.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400">
              Paid: ₹{booking.amountPaid.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Balance highlight */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs font-bold text-amber-400">₹{balance.toLocaleString('en-IN')}</span>
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${payInfo.cls}`}>
            {payInfo.label}
          </span>
        </div>

        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-500 transition-colors flex-shrink-0" />
      </div>
    </Link>
  );
}

function IdProofRow({ proof }: { proof: IdProofEntry }) {
  const statusMeta = {
    PENDING:  { icon: AlertCircle, cls: 'text-amber-400', label: 'Pending Review' },
    APPROVED: { icon: CheckCircle2, cls: 'text-emerald-400', label: 'Approved' },
    REJECTED: { icon: XCircle, cls: 'text-rose-400', label: 'Rejected' },
  }[proof.status];
  const StatusIcon = statusMeta.icon;

  return (
    <Link href={`/dashboard/clients/${proof.clientId}`}>
      <div className="group flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:border-amber-500/30 hover:bg-slate-800/50 transition-all cursor-pointer">
        <div className="flex-shrink-0 p-2 rounded-lg bg-slate-800/80">
          <User className="h-4 w-4 text-slate-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-white truncate">{proof.clientName}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">{proof.idType}</div>
        </div>

        <div className={`flex items-center gap-1.5 flex-shrink-0 text-[10px] font-bold ${statusMeta.cls}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {statusMeta.label}
        </div>

        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-500 transition-colors flex-shrink-0" />
      </div>
    </Link>
  );
}
