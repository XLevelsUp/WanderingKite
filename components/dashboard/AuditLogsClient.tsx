'use client';

import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Clock,
  User,
  Camera,
  CalendarOff,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { resolveStudioBookingConflict } from '@/actions/audit';

interface Props {
  clashLogs: any[];
  studioConflicts: any[];
  defaultTab?: 'equipment' | 'studio';
}

function formatDateTime(isoString: string) {
  const d = new Date(isoString);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

export function AuditLogsClient({ clashLogs, studioConflicts: initialStudioConflicts, defaultTab = 'equipment' }: Props) {
  const [activeTab, setActiveTab] = useState<'equipment' | 'studio'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [studioConflicts, setStudioConflicts] = useState(initialStudioConflicts);
  
  // Resolution Modal State
  const [selectedConflict, setSelectedConflict] = useState<any | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<'approved' | 'rejected'>('approved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleOpenResolve = (conflict: any) => {
    setSelectedConflict(conflict);
    setResolutionStatus('approved');
    setResolutionNotes('');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConflict) return;

    startTransition(async () => {
      const result = await resolveStudioBookingConflict(
        selectedConflict.id,
        resolutionStatus,
        resolutionNotes
      );

      if (result.success) {
        toast.success(`Conflict successfully marked as ${resolutionStatus}.`);
        // Update local state to reflect resolution
        setStudioConflicts((prev) =>
          prev.map((c) =>
            c.id === selectedConflict.id
              ? {
                  ...c,
                  status: resolutionStatus,
                  resolved_by_name: 'You (Admin)',
                  resolved_at: new Date().toISOString(),
                  resolution_notes: resolutionNotes,
                }
              : c
          )
        );
        setSelectedConflict(null);
      } else {
        toast.error(result.error || 'Failed to update conflict status.');
      }
    });
  };

  // Filters
  const filteredClashLogs = clashLogs.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      (log.user_name || '').toLowerCase().includes(query) ||
      (log.user_email || '').toLowerCase().includes(query) ||
      (log.equipment_name || '').toLowerCase().includes(query) ||
      (log.equipment_serial || '').toLowerCase().includes(query)
    );
  });

  const filteredStudioConflicts = studioConflicts.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      (c.client_name || '').toLowerCase().includes(query) ||
      (c.client_email || '').toLowerCase().includes(query) ||
      (c.attempted_purpose || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Tab Select & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/5 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'equipment'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Equipment Clashes
            {clashLogs.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                activeTab === 'equipment' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {clashLogs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'studio'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Studio Conflicts
            {studioConflicts.filter((c) => c.status === 'blocked').length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                activeTab === 'studio' ? 'bg-slate-950 text-amber-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {studioConflicts.filter((c) => c.status === 'blocked').length}
              </span>
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={
              activeTab === 'equipment'
                ? 'Search clashes by user, equipment...'
                : 'Search conflicts by client...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/8 text-foreground/80 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Tab 1: Equipment Clashes ─── */}
        {activeTab === 'equipment' && (
          <motion.div
            key="equipment-clashes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="border border-white/10 rounded-2xl bg-[#0a0a0a] overflow-hidden"
          >
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-foreground/40 font-medium">
                    <th className="px-5 py-3 font-medium">Attempted By</th>
                    <th className="px-5 py-3 font-medium">Equipment Requested</th>
                    <th className="px-5 py-3 font-medium">Dates Requested</th>
                    <th className="px-5 py-3 font-medium text-right">Attempt Logged At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredClashLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-foreground/40">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShieldAlert className="w-8 h-8 opacity-20 text-rose-400" />
                          <p>No equipment clashes match your filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredClashLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* User */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-foreground/50" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground/90">
                                {log.user_name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-foreground/40">
                                {log.user_email || 'No email available'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Equipment */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-primary/70 shrink-0" />
                            <div>
                              <p className="text-foreground/80">{log.equipment_name || 'Unknown Equipment'}</p>
                              <p className="text-[10px] text-foreground/40">{log.equipment_serial}</p>
                            </div>
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-foreground/70">
                              <Clock className="w-3.5 h-3.5 opacity-50" />
                              <span className="text-xs">{formatDateTime(log.attempted_start)}</span>
                            </div>
                            {log.attempted_end && (
                              <div className="flex items-center gap-2 text-foreground/70">
                                <CalendarOff className="w-3.5 h-3.5 opacity-50" />
                                <span className="text-xs">{formatDateTime(log.attempted_end)}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Timestamp */}
                        <td className="px-5 py-4 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-foreground/50">
                            {formatDateTime(log.created_at)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ─── Tab 2: Studio Booking Conflicts ─── */}
        {activeTab === 'studio' && (
          <motion.div
            key="studio-conflicts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="border border-white/10 rounded-2xl bg-[#0a0a0a] overflow-hidden"
          >
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-foreground/40 font-medium">
                    <th className="px-5 py-3 font-medium">Requested By</th>
                    <th className="px-5 py-3 font-medium">Attempted Slot</th>
                    <th className="px-5 py-3 font-medium">Existing Conflicting Booking</th>
                    <th className="px-5 py-3 font-medium">Status & Resolution</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudioConflicts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-foreground/40">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Building2 className="w-8 h-8 opacity-20 text-rose-400" />
                          <p>No studio conflicts found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudioConflicts.map((c: any) => {
                      const statusColor = {
                        blocked: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                        approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                        rejected: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                      }[c.status as string] || 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                      return (
                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Requested By */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-foreground/50" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground/90">{c.client_name}</p>
                                <p className="text-xs text-foreground/40">{c.client_email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Attempted Slot */}
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-foreground/80">
                                <Clock className="w-3.5 h-3.5 opacity-55 text-amber-400" />
                                <span>{formatDateTime(c.attempted_date_time)}</span>
                              </div>
                              <p className="text-[10px] text-foreground/40">
                                Duration: {c.attempted_duration_hours} hr{c.attempted_duration_hours !== 1 ? 's' : ''} | "{c.attempted_purpose}"
                              </p>
                            </div>
                          </td>

                          {/* Conflicting Booking Details */}
                          <td className="px-5 py-4">
                            {c.conflicting_booking_details ? (
                              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1 max-w-xs">
                                <p className="text-xs font-semibold text-white/90">
                                  Occupant: {c.conflicting_booking_details.client_name}
                                </p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-500" />
                                  {formatDateTime(c.conflicting_booking_details.date_time)} ({c.conflicting_booking_details.duration_hours}h)
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  Purpose: {c.conflicting_booking_details.purpose}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-600 italic">No snapshot details</span>
                            )}
                          </td>

                          {/* Status & Resolution */}
                          <td className="px-5 py-4">
                            <div className="space-y-1.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                                {c.status}
                              </span>
                              {c.status !== 'blocked' && (
                                <div className="text-[10px] text-slate-500 max-w-xs whitespace-normal leading-relaxed">
                                  <p className="font-medium">
                                    Resolved by {c.resolved_by_name || 'Admin'}
                                  </p>
                                  {c.resolution_notes && (
                                    <p className="italic text-slate-400 mt-0.5">
                                      "{c.resolution_notes}"
                                    </p>
                                  )}
                                  <p className="text-[9px] text-slate-600 mt-0.5">
                                    {formatDateTime(c.resolved_at)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4 text-right">
                            {c.status === 'blocked' ? (
                              <button
                                onClick={() => handleOpenResolve(c)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg shadow-sm hover:shadow transition-all"
                              >
                                Resolve
                              </button>
                            ) : (
                              <span className="text-xs text-slate-500 flex items-center justify-end gap-1 font-medium">
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                Handled
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resolution Dialog Modal */}
      <AnimatePresence>
        {selectedConflict && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedConflict(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#111119] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden"
            >
              <h3 className="text-base font-semibold text-white/90 mb-1 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                Resolve Booking Conflict
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Update status of attempt by <strong className="text-white">{selectedConflict.client_name}</strong> for slot <strong className="text-white">{formatDateTime(selectedConflict.attempted_date_time)}</strong>.
              </p>

              <form onSubmit={handleResolveSubmit} className="space-y-4">
                {/* Status Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Resolution Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setResolutionStatus('approved')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        resolutionStatus === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-white/[0.02] text-slate-400 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Override
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolutionStatus('rejected')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        resolutionStatus === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-white/[0.02] text-slate-400 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      Dismiss / Reject
                    </button>
                  </div>
                </div>

                {/* Resolution Notes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Resolution Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter details on how the conflict was resolved (e.g. rescheduled client, manually added to secondary room, dismissed as invalid)..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.03] border border-white/8 text-foreground/80 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setSelectedConflict(null)}
                    disabled={isPending}
                    className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                  >
                    {isPending ? 'Saving...' : 'Save Resolution'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
