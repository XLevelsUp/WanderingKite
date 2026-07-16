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
  Trash2,
  Loader2,
  LogIn,
  Globe,
  MousePointerClick,
  Trophy,
  History,
  ChevronDown,
  ChevronRight,
  Laptop,
  RefreshCw,
} from 'lucide-react';
import type {
  LoginActivityRow,
  ClickEventRow,
  ClickLeaderboardRow,
  AuditLogRow,
} from '@/actions/activity';
import {
  getLoginActivity,
  getClickEvents,
  getClickLeaderboard,
  getAuditLog,
} from '@/actions/activity';
import { toast } from 'sonner';
import { resolveStudioBookingConflict } from '@/actions/audit';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Props {
  clashLogs: any[];
  studioConflicts: any[];
  loginActivity: LoginActivityRow[];
  clickEvents: ClickEventRow[];
  clickLeaderboard: ClickLeaderboardRow[];
  auditLog: AuditLogRow[];
  defaultTab?: 'equipment' | 'studio' | 'logins' | 'clicks' | 'changes';
}

const PAGE_SIZE = 100;
const DAYS_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
  { label: 'All time', value: undefined },
];

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

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${seconds}s`;
}

export function AuditLogsClient({
  clashLogs,
  studioConflicts: initialStudioConflicts,
  loginActivity: initialLoginActivity,
  clickEvents: initialClickEvents,
  clickLeaderboard: initialClickLeaderboard,
  auditLog: initialAuditLog,
  defaultTab = 'equipment',
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'equipment' | 'studio' | 'logins' | 'clicks' | 'changes'>(defaultTab);
  const [clickView, setClickView] = useState<'log' | 'leaderboard'>('leaderboard');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [studioConflicts, setStudioConflicts] = useState(initialStudioConflicts);

  // Login/Click/Data-Change activity — locally refetchable with a date
  // range + "load more", since these tables can grow large over time.
  const [loginActivity, setLoginActivity] = useState(initialLoginActivity);
  const [clickEvents, setClickEvents] = useState(initialClickEvents);
  const [clickLeaderboard, setClickLeaderboard] = useState(initialClickLeaderboard);
  const [auditLog, setAuditLog] = useState(initialAuditLog);
  const [activityDays, setActivityDays] = useState<number | undefined>(30);
  const [loginLimit, setLoginLimit] = useState(PAGE_SIZE);
  const [clickLimit, setClickLimit] = useState(PAGE_SIZE);
  const [changesLimit, setChangesLimit] = useState(PAGE_SIZE);
  const [isActivityPending, startActivityTransition] = useTransition();

  const refreshLogins = (days: number | undefined, limit: number) => {
    startActivityTransition(async () => {
      setLoginActivity(await getLoginActivity({ days, limit }));
    });
  };
  const refreshClicks = (days: number | undefined, limit: number) => {
    startActivityTransition(async () => {
      const [events, leaderboard] = await Promise.all([
        getClickEvents({ days, limit }),
        getClickLeaderboard(days),
      ]);
      setClickEvents(events);
      setClickLeaderboard(leaderboard);
    });
  };
  const refreshChanges = (days: number | undefined, limit: number) => {
    startActivityTransition(async () => {
      setAuditLog(await getAuditLog({ days, limit }));
    });
  };

  const handleDaysChange = (days: number | undefined) => {
    setActivityDays(days);
    if (activeTab === 'logins') {
      setLoginLimit(PAGE_SIZE);
      refreshLogins(days, PAGE_SIZE);
    } else if (activeTab === 'clicks') {
      setClickLimit(PAGE_SIZE);
      refreshClicks(days, PAGE_SIZE);
    } else if (activeTab === 'changes') {
      setChangesLimit(PAGE_SIZE);
      refreshChanges(days, PAGE_SIZE);
    }
  };

  const handleLoadMore = () => {
    if (activeTab === 'logins') {
      const next = loginLimit + PAGE_SIZE;
      setLoginLimit(next);
      refreshLogins(activityDays, next);
    } else if (activeTab === 'clicks') {
      const next = clickLimit + PAGE_SIZE;
      setClickLimit(next);
      refreshClicks(activityDays, next);
    } else if (activeTab === 'changes') {
      const next = changesLimit + PAGE_SIZE;
      setChangesLimit(next);
      refreshChanges(activityDays, next);
    }
  };

  const canLoadMoreLogins = loginActivity.length >= loginLimit;
  const canLoadMoreClicks = clickEvents.length >= clickLimit;
  const canLoadMoreChanges = auditLog.length >= changesLimit;

  // Resolution Modal State
  const [selectedConflict, setSelectedConflict] = useState<any | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<'approved' | 'rejected'>('approved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, desc: string, onConfirm: () => void, isDestructive: boolean }>({ isOpen: false, title: '', desc: '', onConfirm: () => { }, isDestructive: false });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenResolve = (conflict: any) => {
    setSelectedConflict(conflict);
    setResolutionStatus('approved');
    setResolutionNotes('');
  };

  const handleDeleteLog = (id: string, type: 'clash' | 'conflict') => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Log',
      desc: 'Are you sure you want to permanently delete this log? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const res = await fetch(`/api/admin/audit/delete?id=${id}&type=${type}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete log');
          toast.success('Log deleted successfully');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          router.refresh();
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setIsDeleting(false);
        }
      }
    });
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

  const filteredLoginActivity = loginActivity.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      (s.user_name || '').toLowerCase().includes(query) ||
      (s.user_email || '').toLowerCase().includes(query) ||
      (s.ip_address || '').toLowerCase().includes(query)
    );
  });

  const filteredClickEvents = clickEvents.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      (c.user_name || '').toLowerCase().includes(query) ||
      (c.user_email || '').toLowerCase().includes(query) ||
      c.label.toLowerCase().includes(query) ||
      c.path.toLowerCase().includes(query)
    );
  });

  const filteredLeaderboard = clickLeaderboard.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.label.toLowerCase().includes(query) || c.path.toLowerCase().includes(query)
    );
  });
  const leaderboardMax = Math.max(1, ...clickLeaderboard.map((c) => c.count));

  const filteredAuditLog = auditLog.filter((l) => {
    const query = searchQuery.toLowerCase();
    return (
      (l.user_name || '').toLowerCase().includes(query) ||
      (l.user_email || '').toLowerCase().includes(query) ||
      l.action.toLowerCase().includes(query) ||
      l.table_name.toLowerCase().includes(query) ||
      (l.record_id || '').toLowerCase().includes(query)
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
          <button
            onClick={() => setActiveTab('logins')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'logins'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Login Activity
            {loginActivity.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                activeTab === 'logins' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {loginActivity.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('clicks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'clicks'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            Click Analytics
          </button>
          <button
            onClick={() => setActiveTab('changes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'changes'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Data Changes
            {auditLog.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                activeTab === 'changes' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {auditLog.length}
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
                : activeTab === 'studio'
                  ? 'Search conflicts by client...'
                  : activeTab === 'logins'
                    ? 'Search by employee, email, IP...'
                    : activeTab === 'clicks'
                      ? 'Search by employee, button, or page...'
                      : 'Search by employee, action, or table...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/8 text-foreground/80 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
          />
        </div>
      </div>

      {/* Date range — only the tabs backed by a growing activity table */}
      {(activeTab === 'logins' || activeTab === 'clicks' || activeTab === 'changes') && (
        <div className="flex items-center gap-1.5">
          {DAYS_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleDaysChange(opt.value)}
              disabled={isActivityPending}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-50 ${
                activityDays === opt.value
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-500 border border-transparent hover:text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
          {isActivityPending && (
            <RefreshCw className="w-3.5 h-3.5 text-slate-500 animate-spin ml-1" />
          )}
        </div>
      )}

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

                        {/* Timestamp & Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-foreground/50">
                              {formatDateTime(log.created_at)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLog(log.id, 'clash');
                              }}
                              title="Delete Log"
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
                            <div className="flex items-center justify-end gap-3">
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLog(c.id, 'conflict');
                                }}
                                title="Delete Log"
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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

        {/* ─── Tab 3: Login Activity ─── */}
        {activeTab === 'logins' && (
          <motion.div
            key="login-activity"
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
                    <th className="px-5 py-3 font-medium">Employee</th>
                    <th className="px-5 py-3 font-medium">Login Time</th>
                    <th className="px-5 py-3 font-medium">Last Active / Logout</th>
                    <th className="px-5 py-3 font-medium">Duration</th>
                    <th className="px-5 py-3 font-medium">Device</th>
                    <th className="px-5 py-3 font-medium text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLoginActivity.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-foreground/40">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <LogIn className="w-8 h-8 opacity-20 text-rose-400" />
                          <p>No login activity recorded yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLoginActivity.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-foreground/50" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground/90">
                                {s.user_name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-foreground/40">
                                {s.user_email || 'No email available'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-foreground/70">{formatDateTime(s.login_at)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-0.5">
                            <span className="text-xs text-foreground/70">
                              {formatDateTime(s.logout_at ?? s.last_active_at)}
                            </span>
                            {s.status === 'active' && (
                              <span className="block text-[10px] text-emerald-400 font-medium">
                                active now
                              </span>
                            )}
                            {s.status === 'stale' && (
                              <span className="block text-[10px] text-amber-400 font-medium">
                                ended (not signed out)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-foreground/70">
                            {formatDuration(s.duration_seconds)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-foreground/50">
                            <Laptop className="w-3.5 h-3.5 opacity-50" />
                            {s.device_label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 text-xs text-foreground/50">
                            <Globe className="w-3.5 h-3.5 opacity-50" />
                            {s.ip_address || '—'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {canLoadMoreLogins && (
              <div className="border-t border-white/10 p-3 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isActivityPending}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-50"
                >
                  {isActivityPending ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Tab 4: Click Analytics ─── */}
        {activeTab === 'clicks' && (
          <motion.div
            key="click-analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/5 rounded-xl self-start w-fit">
              <button
                onClick={() => setClickView('leaderboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  clickView === 'leaderboard'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                Leaderboard
              </button>
              <button
                onClick={() => setClickView('log')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  clickView === 'log'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MousePointerClick className="w-3.5 h-3.5" />
                Raw Log
              </button>
            </div>

            {clickView === 'leaderboard' ? (
              <div className="border border-white/10 rounded-2xl bg-[#0a0a0a] p-5">
                {filteredLeaderboard.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-12 text-foreground/40">
                    <Trophy className="w-8 h-8 opacity-20 text-amber-400" />
                    <p>No clicks recorded yet.</p>
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {filteredLeaderboard.map((c, i) => (
                      <li key={`${c.label}::${c.path}`} className="relative">
                        <div
                          className="absolute inset-y-0 left-0 rounded-lg bg-amber-500/10"
                          style={{ width: `${(c.count / leaderboardMax) * 100}%` }}
                        />
                        <div className="relative flex items-center justify-between gap-3 px-3 py-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[10px] font-bold text-foreground/30 w-4 shrink-0">
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground/90 truncate">{c.label}</p>
                              <p className="text-[10px] text-foreground/40 truncate">{c.path}</p>
                            </div>
                          </div>
                          <span className="shrink-0 text-xs font-semibold text-amber-400">
                            {c.count}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="border border-white/10 rounded-2xl bg-[#0a0a0a] overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-foreground/40 font-medium">
                        <th className="px-5 py-3 font-medium">Employee</th>
                        <th className="px-5 py-3 font-medium">Button / Link</th>
                        <th className="px-5 py-3 font-medium">Page</th>
                        <th className="px-5 py-3 font-medium text-right">When</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredClickEvents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-12 text-center text-foreground/40">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <MousePointerClick className="w-8 h-8 opacity-20 text-amber-400" />
                              <p>No clicks recorded yet.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredClickEvents.map((c) => (
                          <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-4">
                              <p className="font-medium text-foreground/90">{c.user_name || 'Unknown User'}</p>
                              <p className="text-xs text-foreground/40">{c.user_email || 'No email available'}</p>
                            </td>
                            <td className="px-5 py-4 text-foreground/80">{c.label}</td>
                            <td className="px-5 py-4 text-xs text-foreground/50">{c.path}</td>
                            <td className="px-5 py-4 text-right text-xs text-foreground/50">
                              {formatDateTime(c.created_at)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {canLoadMoreClicks && (
                  <div className="border-t border-white/10 p-3 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={isActivityPending}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-50"
                    >
                      {isActivityPending ? 'Loading…' : 'Load more'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Tab 5: Data Changes ─── */}
        {activeTab === 'changes' && (
          <motion.div
            key="data-changes"
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
                    <th className="px-5 py-3 font-medium w-8"></th>
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                    <th className="px-5 py-3 font-medium">Table</th>
                    <th className="px-5 py-3 font-medium text-right">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAuditLog.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-foreground/40">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <History className="w-8 h-8 opacity-20 text-amber-400" />
                          <p>No data changes recorded yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLog.map((l) => {
                      const isExpanded = expandedLogId === l.id;
                      return (
                        <React.Fragment key={l.id}>
                          <tr
                            className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                            onClick={() => setExpandedLogId(isExpanded ? null : l.id)}
                          >
                            <td className="px-5 py-4 text-foreground/40">
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-medium text-foreground/90">{l.user_name || 'Unknown User'}</p>
                              <p className="text-xs text-foreground/40">{l.user_email || 'No email available'}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
                                {l.action}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs text-foreground/60">{l.table_name}</td>
                            <td className="px-5 py-4 text-right text-xs text-foreground/50">
                              {formatDateTime(l.created_at)}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={5} className="px-5 pb-4 bg-white/[0.01]">
                                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wide text-foreground/40 mb-1">Before</p>
                                    <pre className="text-[11px] leading-relaxed text-foreground/70 bg-black/30 border border-white/5 rounded-lg p-3 overflow-x-auto max-h-64">
                                      {l.old_data ? JSON.stringify(l.old_data, null, 2) : '—'}
                                    </pre>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wide text-foreground/40 mb-1">After</p>
                                    <pre className="text-[11px] leading-relaxed text-foreground/70 bg-black/30 border border-white/5 rounded-lg p-3 overflow-x-auto max-h-64">
                                      {l.new_data ? JSON.stringify(l.new_data, null, 2) : '—'}
                                    </pre>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {canLoadMoreChanges && (
              <div className="border-t border-white/10 p-3 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isActivityPending}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-50"
                >
                  {isActivityPending ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
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
                Resolve Studio Booking Conflict
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
              <p className="text-slate-200 font-medium">Deleting log safely...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
