'use client';

import React, { useState, useMemo } from 'react';
import { Camera, Film, Home, FileText, User, ArrowRight, Loader2, LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateStable } from '@/lib/utils/date-format';
import { parseNotesMetadata } from '@/lib/utils/booking-metadata';
import { BookingDrawer } from './BookingDrawer';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'IN_EDITING' | 'HANDED_OVER'>('ALL');
  const [activeDrawerBooking, setActiveDrawerBooking] = useState<{ id: string, type: 'PHOTOGRAPHY' | 'STUDIO' | 'RENTAL', data: any, tab?: 'DETAILS' | 'PAYMENTS' | 'WORKFLOW' } | null>(null);
  const router = useRouter();
  const [updatingState, setUpdatingState] = useState<{ id: string, status: string } | null>(null);

  const handleUpdateStatus = async (e: React.MouseEvent, bookingId: string, bookingType: string, newStatus: string, openWorkflow?: boolean, booking?: any) => {
    e.stopPropagation();
    
    if (newStatus === 'HANDED_OVER' && booking && !booking.delivery_link) {
      toast.error('Please provide a delivery link before marking as Handed Over.');
      if (openWorkflow) {
        setActiveDrawerBooking({ id: bookingId, type: bookingType as any, data: booking, tab: 'WORKFLOW' });
      }
      return;
    }

    if (updatingState) return;
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
      
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdatingState(null);
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

  const filteredBookings = useMemo(() => {
    if (activeTab === 'ALL') return allBookings;
    return allBookings.filter(b => b.status === activeTab);
  }, [allBookings, activeTab]);

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
          <div className={`p-2.5 rounded-lg flex items-center justify-center ${
            booking.__type === 'PHOTOGRAPHY' ? 'bg-amber-500/10 text-amber-500' :
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
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2" onClick={e => e.stopPropagation()}>
          {booking.status === 'PENDING' && (
            <>
              <Button disabled={!!updatingState} onClick={(e) => handleUpdateStatus(e, booking.id, booking.__type, booking.__type === 'RENTAL' ? 'ACTIVE' : 'CONFIRMED')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3">
                {updatingState?.id === booking.id && updatingState?.status === (booking.__type === 'RENTAL' ? 'ACTIVE' : 'CONFIRMED') && <Loader2 className="animate-spin h-3 w-3 mr-1" />} Approve
              </Button>
              <Button disabled={!!updatingState} onClick={(e) => handleUpdateStatus(e, booking.id, booking.__type, 'CANCELLED')} className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8 px-3">
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
            <Button disabled={!!updatingState} onClick={(e) => handleUpdateStatus(e, booking.id, booking.__type, 'IN_EDITING', true, booking)} className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-8 px-3">
              {updatingState?.id === booking.id && updatingState?.status === 'IN_EDITING' && <Loader2 className="animate-spin h-3 w-3 mr-1" />} Set Editing
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
        </div>
      </div>
    );
  };

  const renderGroup = (title: string, items: any[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-3 mb-8">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title} ({items.length})</h3>
        {items.map(renderBookingCard)}
      </div>
    );
  };
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.id ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'
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
          filteredBookings.map(renderBookingCard)
        )}
      </div>

      <BookingDrawer
        isOpen={activeDrawerBooking !== null}
        onClose={() => setActiveDrawerBooking(null)}
        bookingId={activeDrawerBooking?.id}
        bookingType={activeDrawerBooking?.type}
        bookingData={activeDrawerBooking?.data}
        initialTab={activeDrawerBooking?.tab}
        editors={editors}
        assignees={assignees}
        charges={charges}
      />
    </div>
  );
}
