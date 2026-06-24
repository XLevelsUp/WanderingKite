'use client';

import React, { useState, useMemo, useOptimistic, startTransition, useTransition, useEffect } from 'react';
import { Camera, Film, Home, FileText, User, ArrowRight, Loader2, LinkIcon, Wrench, Check, AlertCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateStable } from '@/lib/utils/date-format';
import { parseNotesMetadata } from '@/lib/utils/booking-metadata';
import { BookingDrawer } from './BookingDrawer';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useNotifications } from '@/components/ui/useNotifications';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function BookingsList({
  photographyBookings,
  studioBookings,
  rentalBookings,
  editors,
  assignees,
  charges
}: {
  photographyBookings: any[];
  studioBookings: any[];
  rentalBookings: any[];
  editors: any[];
  assignees: any[];
  charges: any[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const validTabs = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'IN_EDITING', 'HANDED_OVER'] as const;
  type TabType = typeof validTabs[number];
  const tabFromUrl = searchParams.get('tab')?.toUpperCase() as TabType | null;
  const activeTab: TabType = tabFromUrl && validTabs.includes(tabFromUrl as TabType) ? tabFromUrl : 'ALL';

  const { showLoader, hideLoader } = useNotifications();
  const [isTabPending, startTabTransition] = useTransition();

  const setActiveTab = (tab: TabType) => {
    showLoader();
    startTabTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Hide the loader once the tab transition finishes rendering
  useEffect(() => {
    if (!isTabPending) {
      hideLoader();
    }
  }, [isTabPending]);

  const [activeDrawerBooking, setActiveDrawerBooking] = useState<{ id: string, type: 'PHOTOGRAPHY' | 'STUDIO' | 'RENTAL', data: any, tab?: 'DETAILS' | 'PAYMENTS' | 'WORKFLOW' } | null>(null);
  const [updatingState, setUpdatingState] = useState<{ id: string, status: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, desc: string, onConfirm: () => void, isDestructive: boolean }>({ isOpen: false, title: '', desc: '', onConfirm: () => { }, isDestructive: false });

  // Set to In Editing Dialog State
  const [isSetEditingOpen, setIsSetEditingOpen] = useState(false);
  const [setEditingBookingId, setSetEditingBookingId] = useState<string | null>(null);
  const [setEditingBookingType, setSetEditingBookingType] = useState<'PHOTOGRAPHY' | 'STUDIO' | null>(null);
  const [selectedSetEditingEditors, setSelectedSetEditingEditors] = useState<string[]>([]);
  const [setEditingError, setSetEditingError] = useState('');
  const [isSubmittingSetEditing, setIsSubmittingSetEditing] = useState(false);

  const handleConfirmSetEditing = async () => {
    if (!setEditingBookingId || !setEditingBookingType) return;
    if (selectedSetEditingEditors.length === 0) {
      setSetEditingError('Please select at least one editor to assign.');
      return;
    }

    setIsSubmittingSetEditing(true);
    setSetEditingError('');
    try {
      // 1. Update status to IN_EDITING
      const statusRes = await fetch('/api/admin/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: setEditingBookingId, bookingType: setEditingBookingType, status: 'IN_EDITING' }),
      });
      if (!statusRes.ok) {
        const errData = await statusRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update status to In Editing');
      }

      // 2. Assign editors
      for (const employeeId of selectedSetEditingEditors) {
        const assignRes = await fetch('/api/admin/bookings/assignees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ADD',
            bookingId: setEditingBookingId,
            bookingType: setEditingBookingType,
            employeeId
          })
        });
        if (!assignRes.ok) {
          const assignErr = await assignRes.json().catch(() => ({}));
          if (assignErr.error !== 'already_assigned') {
            console.warn(`Failed to assign editor ${employeeId}:`, assignErr.error);
          }
        }
      }

      toast.success('Booking status set to In Editing and editors assigned.');
      setIsSetEditingOpen(false);
      setSetEditingBookingId(null);
      setSetEditingBookingType(null);
      setSelectedSetEditingEditors([]);

      router.refresh();
    } catch (err: any) {
      setSetEditingError(err.message || 'Failed to complete workflow transition.');
    } finally {
      setIsSubmittingSetEditing(false);
    }
  };

  const handleUpdateStatus = async (e: React.MouseEvent, bookingId: string, bookingType: string, newStatus: string, openWorkflow?: boolean, booking?: any) => {
    e.stopPropagation();

    if (newStatus === 'HANDED_OVER' && booking && !booking.delivery_link && !booking.album?.downloadLink) {
      toast.warning('Please provide a delivery link before marking as Handed Over.');
      if (openWorkflow) {
        setActiveDrawerBooking({ id: bookingId, type: bookingType as any, data: booking, tab: 'WORKFLOW' });
      }
      return;
    }

    if (updatingState) return;

    // Optimistically update UI immediately
    startTransition(() => {
      addOptimisticBooking({ id: bookingId, status: newStatus });
    });
    setUpdatingState({ id: bookingId, status: newStatus });

    try {
      const res = await fetch('/api/admin/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, bookingType, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success('Status updated successfully');

      if (openWorkflow && booking) {
        setActiveDrawerBooking({ id: bookingId, type: bookingType as any, data: { ...booking, status: newStatus }, tab: 'WORKFLOW' });
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdatingState(null);
    }
  };

  const handleDeleteBooking = async (bookingId: string, bookingType: string) => {
    showLoader('Deleting booking...');
    try {
      const res = await fetch(`/api/admin/bookings/delete?id=${bookingId}&type=${bookingType}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete booking');
      }
      toast.success('Booking deleted successfully');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      hideLoader();
    }
  };

  const allBookings = useMemo(() => {
    const list = [
      ...photographyBookings.map(b => ({ ...b, __type: 'PHOTOGRAPHY' })),
      ...studioBookings.map(b => ({ ...b, __type: 'STUDIO' })),
      ...rentalBookings.map(b => ({ ...b, __type: 'RENTAL' }))
    ];
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [photographyBookings, studioBookings, rentalBookings]);

  const [optimisticBookings, addOptimisticBooking] = useOptimistic(
    allBookings,
    (state, updatedBooking: { id: string; status: string }) => {
      return state.map(b => b.id === updatedBooking.id ? { ...b, status: updatedBooking.status } : b);
    }
  );

  const filteredBookings = useMemo(() => {
    if (activeTab === 'ALL') return optimisticBookings;
    return optimisticBookings.filter(b => b.status === activeTab);
  }, [optimisticBookings, activeTab]);

  const tabs = [
    { id: 'ALL', label: 'All' },
    { id: 'PENDING', label: 'Needs Review' },
    { id: 'CONFIRMED', label: 'Active/Confirmed' },
    { id: 'COMPLETED', label: 'Shoot Completed' },
    { id: 'IN_EDITING', label: 'In Editing' },
    { id: 'HANDED_OVER', label: 'Handed Over' },
  ] as const;

  const renderBadge = (status: string, type: string) => {
    if (status === 'PENDING') return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px]">Pending Review</Badge>;
    if (status === 'CONFIRMED' || status === 'ACTIVE') return <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px]">{type === 'RENTAL' ? 'Leased Out' : 'Confirmed'}</Badge>;
    if (status === 'COMPLETED') return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">Shoot Completed</Badge>;
    if (status === 'IN_EDITING') return <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px]">In Editing</Badge>;
    if (status === 'HANDED_OVER') return <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px]">Handed Over</Badge>;
    if (status === 'RETURNED') return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">Returned</Badge>;
    if (status === 'DAMAGED') return <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px]">Damaged</Badge>;
    if (status === 'CANCELLED') return <Badge className="bg-slate-800 text-slate-450 border border-slate-700 px-2 py-0.5 rounded text-[10px]">Cancelled</Badge>;
    return <Badge>{status}</Badge>;
  };

  const renderBookingCard = (booking: any) => {
    const clientName = booking.client?.name || 'Unknown Client';
    const dateStr = booking.__type === 'RENTAL' ? booking.start_date : booking.date_time;

    return (
      <div
        key={`${booking.__type}-${booking.id}`}
        onClick={() => setActiveDrawerBooking({ id: booking.id, type: booking.__type, data: booking })}
        className="bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-lg flex items-center justify-center ${booking.__type === 'PHOTOGRAPHY' ? 'bg-amber-500/10 text-amber-500' :
              booking.__type === 'STUDIO' ? 'bg-purple-500/10 text-purple-500' :
                'bg-emerald-500/10 text-emerald-500'
            }`}>
            {booking.__type === 'PHOTOGRAPHY' && <Camera className="h-5 w-5" />}
            {booking.__type === 'STUDIO' && <Home className="h-5 w-5" />}
            {booking.__type === 'RENTAL' && <Film className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-200">{clientName}</h3>
              {renderBadge(booking.status, booking.__type)}
            </div>
            <div className="text-xs text-slate-400 space-x-3 flex items-center">
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {booking.__type.replace('_', ' ')}</span>
              <span>•</span>
              <span>{formatDateStable(dateStr)}</span>
            </div>
            {booking.__type !== 'RENTAL' && (() => {
              const { metadata: meta } = parseNotesMetadata(booking.notes || '');
              const quotation = meta.quotationAmount || meta.estimatedBreakdown?.estimatedTotal || 0;
              const paid = booking.amount_paid || booking.amountPaid || 0;
              return (
                <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-3">
                  <span>Quotation: <span className="text-slate-300 font-medium">₹{quotation}</span></span>
                  <span>Paid: <span className="text-emerald-400 font-medium">₹{paid}</span></span>
                </div>
              );
            })()}
            {booking.delivery_link && (
              <div className="mt-2">
                <a href={booking.delivery_link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-md border border-indigo-500/20 transition-colors">
                  <LinkIcon className="h-3 w-3" /> View Deliverables
                </a>
              </div>
            )}
            {(booking.status === 'IN_EDITING' || booking.status === 'HANDED_OVER') && (() => {
              const bookingAssignees = assignees.filter((a: any) =>
                (booking.__type === 'PHOTOGRAPHY' && a.photography_booking_id === booking.id) ||
                (booking.__type === 'STUDIO' && a.studio_booking_id === booking.id)
              );
              if (bookingAssignees.length === 0) return null;
              return (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {bookingAssignees.map((a: any) => (
                    <span key={a.employee_id} className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded text-[10px] font-medium">
                      <User className="h-2.5 w-2.5" /> {a.profile?.fullName || 'Editor'}
                    </span>
                  ))}
                </div>
              );
            })()}

          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2" onClick={e => e.stopPropagation()}>
          {booking.status === 'PENDING' && (
            <>
              <Button disabled={!!updatingState} onClick={(e) => handleUpdateStatus(e, booking.id, booking.__type, booking.__type === 'RENTAL' ? 'ACTIVE' : 'CONFIRMED')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3">
                {updatingState?.id === booking.id && updatingState?.status === (booking.__type === 'RENTAL' ? 'ACTIVE' : 'CONFIRMED') && <Loader2 className="animate-spin h-3 w-3 mr-1" />} Approve
              </Button>
              <Button disabled={!!updatingState} onClick={(e) => {
                e.stopPropagation();
                setConfirmDialog({
                  isOpen: true,
                  title: 'Reject Booking',
                  desc: 'Are you sure you want to reject this booking? This action cannot be undone.',
                  isDestructive: true,
                  onConfirm: () => handleUpdateStatus(e, booking.id, booking.__type, 'CANCELLED')
                });
              }} className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8 px-3">
                {updatingState?.id === booking.id && updatingState?.status === 'CANCELLED' && <Loader2 className="animate-spin h-3 w-3 mr-1" />} Reject
              </Button>
            </>
          )}
          {booking.status === 'CONFIRMED' && (
            <Button disabled={!!updatingState} onClick={(e) => handleUpdateStatus(e, booking.id, booking.__type, 'COMPLETED')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3">
              {updatingState?.id === booking.id && updatingState?.status === 'COMPLETED' && <Loader2 className="animate-spin h-3 w-3 mr-1" />} Mark Complete
            </Button>
          )}
          {booking.__type === 'RENTAL' && booking.status === 'ACTIVE' && (
            <Button disabled={!!updatingState} onClick={(e) => handleUpdateStatus(e, booking.id, booking.__type, 'RETURNED')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3">
              {updatingState?.id === booking.id && updatingState?.status === 'RETURNED' && <Loader2 className="animate-spin h-3 w-3 mr-1" />} Mark Returned
            </Button>
          )}
          {booking.__type !== 'RENTAL' && booking.status === 'COMPLETED' && (
            <Button disabled={!!updatingState} onClick={(e) => { e.stopPropagation(); setSetEditingBookingId(booking.id); setSetEditingBookingType(booking.__type); setSelectedSetEditingEditors([]); setSetEditingError(''); setIsSetEditingOpen(true); }} className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-8 px-3">
              Set Editing
            </Button>
          )}
          {booking.__type !== 'RENTAL' && booking.status === 'IN_EDITING' && (
            <Button disabled={!!updatingState} onClick={(e) => handleUpdateStatus(e, booking.id, booking.__type, 'HANDED_OVER', true, booking)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-3">
              {updatingState?.id === booking.id && updatingState?.status === 'HANDED_OVER' && <Loader2 className="animate-spin h-3 w-3 mr-1" />} Handed Over
            </Button>
          )}

          {booking.__type !== 'RENTAL' && (
            <Button variant="outline" onClick={(e) => { e.stopPropagation(); setActiveDrawerBooking({ id: booking.id, type: booking.__type, data: booking, tab: 'PAYMENTS' }); }} className="text-amber-500 border-amber-500/20 hover:text-amber-400 hover:bg-amber-500/10 h-8 px-3 text-xs ml-2">
              Payments
            </Button>
          )}

          <Button variant="outline" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/clients/${booking.client_id}`); }} className="text-amber-500 border-amber-500/20 hover:text-amber-400 hover:bg-amber-500/10 h-8 px-3 text-xs ml-2">
            Client Details <User className="h-3 w-3 ml-1.5" />
          </Button>

          <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setActiveDrawerBooking({ id: booking.id, type: booking.__type, data: booking, tab: 'DETAILS' }); }} className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 px-3 text-xs">
            Manage / Timeline <ArrowRight className="h-3 w-3 ml-1.5" />
          </Button>

          <Button variant="ghost" onClick={(e) => { 
            e.stopPropagation(); 
            setConfirmDialog({
              isOpen: true,
              title: 'Delete Booking',
              desc: `Are you sure you want to permanently delete this ${booking.__type.toLowerCase()} booking? This action cannot be undone.`,
              isDestructive: true,
              onConfirm: () => handleDeleteBooking(booking.id, booking.__type)
            });
          }} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 px-3 text-xs ml-auto border border-rose-500/20">
            <Trash2 className="h-3 w-3 mr-1.5" /> Delete
          </Button>
        </div>
      </div>
    );
  };

  const renderGroupedByService = (items: any[]) => {
    const photography = items.filter(b => b.__type === 'PHOTOGRAPHY');
    const studio = items.filter(b => b.__type === 'STUDIO');
    const rental = items.filter(b => b.__type === 'RENTAL');

    return (
      <div className="space-y-4">
        {photography.length > 0 && (
          <div className="space-y-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-violet-400 font-bold uppercase tracking-wider">
              <Camera className="h-3.5 w-3.5" />
              <span>Photography ({photography.length})</span>
            </div>
            <div className="space-y-2">
              {photography.map(renderBookingCard)}
            </div>
          </div>
        )}
        {studio.length > 0 && (
          <div className="space-y-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold uppercase tracking-wider">
              <Home className="h-3.5 w-3.5" />
              <span>Studio Space ({studio.length})</span>
            </div>
            <div className="space-y-2">
              {studio.map(renderBookingCard)}
            </div>
          </div>
        )}
        {rental.length > 0 && (
          <div className="space-y-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
              <Film className="h-3.5 w-3.5" />
              <span>Rentals ({rental.length})</span>
            </div>
            <div className="space-y-2">
              {rental.map(renderBookingCard)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGroup = (title: string, items: any[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-3 mb-8">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title} ({items.length})</h3>
        {renderGroupedByService(items)}
      </div>
    );
  };
  const getLatestDrawerBookingData = () => {
    if (!activeDrawerBooking) return null;
    const { id, type } = activeDrawerBooking;
    return optimisticBookings.find(b => b.id === id && b.__type === type);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === tab.id ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-t-md" />
            )}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-slate-500 italic bg-slate-900/20 rounded-xl border border-slate-800">
            No bookings found in this category.
          </div>
        ) : activeTab === 'ALL' ? (
          <>
            {renderGroup('Pending Requests', filteredBookings.filter(b => b.status === 'PENDING'))}
            {renderGroup('Confirmed', filteredBookings.filter(b => b.status === 'CONFIRMED' || (b.__type === 'RENTAL' && b.status === 'ACTIVE')))}
            {renderGroup('Shoot Completed', filteredBookings.filter(b => b.status === 'COMPLETED'))}
            {renderGroup('In Editing', filteredBookings.filter(b => b.status === 'IN_EDITING'))}
            {renderGroup('Handed Over / Returned', filteredBookings.filter(b => b.status === 'HANDED_OVER' || (b.__type === 'RENTAL' && b.status === 'RETURNED')))}
            {renderGroup('Cancelled', filteredBookings.filter(b => b.status === 'CANCELLED'))}
          </>
        ) : (
          renderGroupedByService(filteredBookings)
        )}
      </div>

      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white rounded-xl">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {confirmDialog.desc}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button
              className={confirmDialog.isDestructive ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"}
              onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(prev => ({ ...prev, isOpen: false })); }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set In Editing Dialog Modal */}
      <Dialog open={isSetEditingOpen} onOpenChange={(open) => {
        setIsSetEditingOpen(open);
        if (!open) {
          setSetEditingBookingId(null);
          setSetEditingBookingType(null);
          setSelectedSetEditingEditors([]);
          setSetEditingError('');
        }
      }}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md w-full p-6 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Wrench className="h-5 w-5 text-purple-400" />
              Set to In Editing
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs mt-1">
              Select one or more active editors to assign before setting this shoot to In Editing status.
            </DialogDescription>
          </DialogHeader>

          {setEditingError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{setEditingError}</span>
            </div>
          )}

          <div className="space-y-3 py-2">
            <Label className="text-xs font-semibold text-slate-350">Active Editors *</Label>
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-1">
              {editors.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No active editors available.</p>
              ) : (
                editors.map((ed) => {
                  const isSelected = selectedSetEditingEditors.includes(ed.id);
                  return (
                    <Badge
                      key={ed.id}
                      onClick={() => {
                        setSelectedSetEditingEditors(prev =>
                          isSelected ? prev.filter(id => id !== ed.id) : [...prev, ed.id]
                        );
                      }}
                      className={`cursor-pointer px-3 py-1.5 transition-colors ${isSelected
                          ? 'bg-purple-500 hover:bg-purple-400 text-white font-semibold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                    >
                      {ed.fullName || ed.full_name || 'Staff'} {isSelected && <Check className="h-3 w-3 ml-1.5 inline" />}
                    </Badge>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-355 rounded-lg">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleConfirmSetEditing}
              disabled={selectedSetEditingEditors.length === 0 || isSubmittingSetEditing}
              className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-4"
            >
              {isSubmittingSetEditing && <Loader2 className="animate-spin h-3 w-3 mr-1.5 inline" />}
              Confirm & Set Editing
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BookingDrawer
        isOpen={activeDrawerBooking !== null}
        onClose={() => setActiveDrawerBooking(null)}
        bookingId={activeDrawerBooking?.id}
        bookingType={activeDrawerBooking?.type}
        bookingData={getLatestDrawerBookingData()}
        initialTab={activeDrawerBooking?.tab}
        editors={editors}
        assignees={assignees}
        charges={charges}
      />
    </div>
  );
}
