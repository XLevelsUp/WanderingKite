'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Activity,
  ExternalLink,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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
  createdAt?: string;
  updatedAt?: string;
}

interface IdProofEntry {
  clientId: string;
  clientName: string;
  idType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  fileUrl: string;
}

interface Props {
  allBookings?: BaseBooking[];
  pendingBookings: BaseBooking[];
  confirmedBookings: BaseBooking[];
  outstandingBookings: BaseBooking[];
  idProofs: IdProofEntry[];
  conflictLogs: any[];
  todaysBookingsCount?: number;
  recentActivity?: BaseBooking[];
  /** Gates super-admin-only tabs (Studio Booking Conflicts). */
  isSuperAdmin?: boolean;
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
  { key: 'allBookings', label: 'All Bookings', icon: CalendarCheck },
  { key: 'pending',   label: 'Pending Requests', icon: Bell },
  { key: 'balances',  label: 'Outstanding Balances', icon: CreditCard },
  { key: 'activity',  label: 'Activity Feed', icon: Activity },
  { key: 'idProofs',  label: 'ID Verifications',  icon: ShieldCheck },
  { key: 'conflicts', label: 'Studio Booking Conflicts', icon: AlertCircle },
] as const;

type TabKey = typeof TABS[number]['key'];
type FilterChip = 'All' | 'Pending Request' | 'Confirmed' | 'Shoot Completed';

export function AdminOperationalHub({ 
  allBookings = [],
  pendingBookings, 
  confirmedBookings, 
  outstandingBookings, 
  idProofs, 
  conflictLogs = [],
  todaysBookingsCount = 0,
  recentActivity = [],
  isSuperAdmin = false
}: Props) {
  // Conflicts tab is super-admin only.
  const tabs = TABS.filter((t) => t.key !== 'conflicts' || isSuperAdmin);
  const [active, setActive] = useState<TabKey>('allBookings');
  const [bookingFilter, setBookingFilter] = useState<FilterChip>('All');
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, desc: string, onConfirm: () => void, isDestructive: boolean }>({ isOpen: false, title: '', desc: '', onConfirm: () => { }, isDestructive: false });
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const counts: Record<TabKey, number> = {
    allBookings: allBookings.length,
    pending:   pendingBookings.length,
    balances:  outstandingBookings.length,
    activity:  recentActivity.length,
    idProofs:  idProofs.filter((p) => p.status === 'PENDING').length,
    conflicts: conflictLogs.filter((c) => c.status === 'blocked').length,
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      {/* Tab Bar */}
      <div 
        className="flex items-center border-b border-slate-800 bg-slate-950/50 overflow-x-auto scrollbar-none"
        style={{ WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)', maskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          const count = counts[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`relative flex flex-shrink-0 items-center gap-2 px-3 sm:px-5 py-3 sm:py-4 text-xs font-semibold whitespace-nowrap transition-colors ${
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

      {/* Top Cards for Today's Bookings */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="px-5 py-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between sm:justify-start gap-4 hover:border-amber-500/30 transition-colors w-full sm:w-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Today's Bookings</span>
          </div>
          <span className="text-2xl font-bold text-amber-400">{todaysBookingsCount}</span>
        </div>
        <button
          onClick={() => router.push('/admin/bookings')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-300 transition-all duration-200 whitespace-nowrap cursor-pointer w-full sm:w-auto"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Manage All Bookings
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 min-h-[320px]">
        <AnimatePresence mode="wait">
          {/* ─── ALL BOOKINGS ─── */}
          {active === 'allBookings' && (
            <motion.div
              key="allBookings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {/* Quick Filter Chips */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                {(['All', 'Pending Request', 'Confirmed', 'Shoot Completed'] as FilterChip[]).map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setBookingFilter(chip)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                      bookingFilter === chip
                        ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {allBookings.length === 0 ? (
                <EmptyState icon={CalendarCheck} message="No bookings found." />
              ) : (
                <div className="space-y-6">
                  {bookingFilter === 'All' ? (
                    <>
                      <BookingGroup 
                        title="Pending Requests" 
                        bookings={allBookings.filter(b => b.status === 'PENDING')} 
                      />
                      <BookingGroup 
                        title="Active & Confirmed" 
                        bookings={allBookings.filter(b => b.status === 'CONFIRMED')} 
                      />
                      <BookingGroup 
                        title="Shoot Completed" 
                        bookings={allBookings.filter(b => b.status === 'COMPLETED')} 
                      />
                      <BookingGroup 
                        title="Cancelled" 
                        bookings={allBookings.filter(b => b.status === 'CANCELLED')} 
                      />
                    </>
                  ) : (
                    <div className="space-y-2">
                      <GroupedBookingsList 
                        bookings={allBookings
                          .filter(b => {
                            if (bookingFilter === 'Pending Request') return b.status === 'PENDING';
                            if (bookingFilter === 'Confirmed') return b.status === 'CONFIRMED';
                            if (bookingFilter === 'Shoot Completed') return b.status === 'COMPLETED';
                            return true;
                          })
                          .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
                        } 
                        showPayment 
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

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
                <EmptyState icon={Bell} message="No pending requests at the moment." />
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">
                    {pendingBookings.length} request{pendingBookings.length !== 1 ? 's' : ''} awaiting approval
                  </p>
                  <GroupedBookingsList 
                    bookings={pendingBookings
                      .sort((a, b) => new Date(a.createdAt || a.dateTime).getTime() - new Date(b.createdAt || b.dateTime).getTime())
                    } 
                    showPayment 
                  />
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

          {/* ─── ACTIVITY FEED ─── */}
          {active === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {recentActivity.length === 0 ? (
                <EmptyState icon={Activity} message="No recent activity found." />
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">
                    Last 5 status changes
                  </p>
                  {recentActivity.map((b) => (
                    <BookingRow key={b.id} booking={b} showPayment />
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
                <EmptyState icon={AlertCircle} message="No studio booking conflicts logged." />
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">
                    {conflictLogs.length} conflict{conflictLogs.length !== 1 ? 's' : ''} logged ({counts.conflicts} unresolved)
                  </p>
                  {conflictLogs.map((conflict) => (
                    <ConflictRow key={conflict.id} conflict={conflict} setConfirmDialog={setConfirmDialog} setIsDeleting={setIsDeleting} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && !isDeleting && setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className={confirmDialog.isDestructive ? "text-rose-500" : ""}>
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {confirmDialog.desc}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="outline" 
              className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white" 
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.isDestructive ? "destructive" : "default"}
              className={confirmDialog.isDestructive ? "bg-rose-600 hover:bg-rose-500 text-white" : ""}
              onClick={() => { confirmDialog.onConfirm(); }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Global Loading Overlay */}
      <AnimatePresence>
        {isDeleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4 bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-2xl">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <p className="text-slate-200 font-medium">Deleting record safely...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConflictRow({ conflict, setConfirmDialog, setIsDeleting }: { conflict: any, setConfirmDialog: any, setIsDeleting: any }) {
  const router = useRouter();
  const isResolved = conflict.status !== 'blocked';
  const statusColors = {
    blocked: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  }[conflict.status as string] || 'bg-rose-500/10 text-rose-400 border-rose-500/20';

  const handleDeleteConflict = async (e: React.MouseEvent) => {
    e.preventDefault();
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Conflict Log',
      desc: 'Are you sure you want to permanently delete this conflict log? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const res = await fetch(`/api/admin/audit/delete?id=${conflict.id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete log');
          toast.success('Log deleted successfully');
          setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }));
          router.refresh();
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

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

        <button 
          onClick={handleDeleteConflict}
          className="p-1.5 ml-2 rounded-md hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
          title="Delete Log"
        >
          <Trash2 className="h-4 w-4" />
        </button>

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

function GroupedBookingsList({ bookings, showPayment }: { bookings: BaseBooking[]; showPayment: boolean }) {
  const photography = bookings.filter(b => b.type === 'PHOTOGRAPHY');
  const studio = bookings.filter(b => b.type === 'STUDIO');
  const rental = bookings.filter(b => b.type === 'RENTAL');

  return (
    <div className="space-y-4">
      {photography.length > 0 && (
        <div className="space-y-2 pl-2 border-l border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-violet-400 font-bold uppercase tracking-wider">
            <Camera className="h-3.5 w-3.5" />
            <span>Photography ({photography.length})</span>
          </div>
          <div className="space-y-2">
            {photography.map(b => (
              <BookingRow key={b.id} booking={b} showPayment={showPayment} />
            ))}
          </div>
        </div>
      )}
      {studio.length > 0 && (
        <div className="space-y-2 pl-2 border-l border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold uppercase tracking-wider">
            <Building2 className="h-3.5 w-3.5" />
            <span>Studio Space ({studio.length})</span>
          </div>
          <div className="space-y-2">
            {studio.map(b => (
              <BookingRow key={b.id} booking={b} showPayment={showPayment} />
            ))}
          </div>
        </div>
      )}
      {rental.length > 0 && (
        <div className="space-y-2 pl-2 border-l border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
            <Package className="h-3.5 w-3.5" />
            <span>Rentals ({rental.length})</span>
          </div>
          <div className="space-y-2">
            {rental.map(b => (
              <BookingRow key={b.id} booking={b} showPayment={showPayment} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BookingGroup({ title, bookings }: { title: string; bookings: BaseBooking[] }) {
  if (bookings.length === 0) return null;
  const sorted = [...bookings].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  return (
    <div className="space-y-2">
      <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold pb-1 border-b border-slate-800">
        {title} ({bookings.length})
      </h3>
      <GroupedBookingsList bookings={sorted} showPayment />
    </div>
  );
}

function BookingRow({ booking, showPayment }: { booking: BaseBooking; showPayment: boolean }) {
  const ServiceIcon = SERVICE_ICON[booking.type] ?? Package;
  const serviceColor = SERVICE_COLOR[booking.type] ?? 'text-slate-400';
  const payInfo = PAYMENT_LABEL[booking.paymentStatus];

  const statusColors = {
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }[booking.status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

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
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${statusColors}`}>
              {booking.status}
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
      <div className="group flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-xl border border-slate-800 hover:border-amber-500/30 hover:bg-slate-800/50 transition-all cursor-pointer">
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

        {/* Balance highlight — inline row on mobile, right-aligned column from sm */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 flex-shrink-0 ml-auto sm:ml-0">
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
