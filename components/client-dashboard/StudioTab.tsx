'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Home, Calendar, Clock, CheckCircle2, AlertCircle, FileText, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { BookingTable } from './BookingTable';
import EmptyState from './EmptyState';
import { useNotifications } from '@/components/ui/useNotifications';
import { toast } from 'sonner';

interface StudioEquipment {
  id: string;
  name: string;
  description: string | null;
}

interface StudioBooking {
  id: string;
  dateTime: string;
  durationHours: number;
  purpose: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  amountPaid: number;
  additionalCharges: number;
  notes: string | null;
  equipments: StudioEquipment[];
  createdAt: string;
}

export default function StudioTab() {
  const [bookings, setBookings] = useState<StudioBooking[]>([]);
  const [equipmentCatalog, setEquipmentCatalog] = useState<StudioEquipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showLoader, hideLoader } = useNotifications();

  // Form states
  const [dateTime, setDateTime] = useState('');
  const [durationHours, setDurationHours] = useState('2');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/client/studio/list');
      if (!res.ok) throw new Error('Failed to fetch studio bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error(error);
      toast.error('Could not load studio bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/client/studio/equipment');
      if (res.ok) {
        const data = await res.json();
        setEquipmentCatalog(data.equipment || []);
      }
    } catch (error) {
      console.error('Failed to load studio accessories:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchCatalog();
  }, []);

  const handleBookStudio = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!dateTime) {
      setFormError('Please select a date and time.');
      return;
    }
    const duration = parseInt(durationHours, 10);
    if (isNaN(duration) || duration <= 0) {
      setFormError('Please select a valid duration.');
      return;
    }
    if (!purpose.trim()) {
      setFormError('Please enter the session purpose.');
      return;
    }
    if (selectedEquipmentIds.length === 0) {
      setFormError('Please select at least one lighting, sound or backdrop accessory.');
      return;
    }

    const bookingTime = new Date(dateTime);
    if (bookingTime.getTime() <= Date.now()) {
      setFormError('Studio bookings must be in the future.');
      return;
    }

    showLoader('Reserving studio slot...');
    try {
      const res = await fetch('/api/client/studio/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateTime,
          durationHours: duration,
          purpose,
          notes,
          equipmentIds: selectedEquipmentIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Studio booking failed');
      }

      toast.success('Studio slot reserved successfully!');
      setIsDialogOpen(false);
      // Reset form
      setDateTime('');
      setDurationHours('2');
      setPurpose('');
      setNotes('');
      setSelectedEquipmentIds([]);
      fetchBookings();
    } catch (error: any) {
      console.error(error);
      setFormError(error.message || 'An error occurred while reserving the slot.');
      toast.error(error.message || 'Could not reserve studio slot.');
    } finally {
      hideLoader();
    }
  };

  const toggleEquipmentSelection = (id: string) => {
    setSelectedEquipmentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: StudioBooking['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        );
      case 'CONFIRMED':
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="h-3 w-3" />
            Confirmed
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit">
            <AlertCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
    }
  };

  const columns: ColumnDef<StudioBooking>[] = [
    {
      accessorKey: 'dateTime',
      header: 'Session Slot',
      cell: ({ row }) => {
        const val = row.getValue('dateTime') as string;
        const duration = row.original.durationHours;
        const date = new Date(val);
        const end = new Date(date.getTime() + duration * 60 * 60 * 1000);
        
        return (
          <div className="flex flex-col text-xs space-y-0.5">
            <div className="flex items-center gap-1.5 text-white font-medium">
              <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>{date.toLocaleDateString([], { dateStyle: 'medium' })}</span>
            </div>
            <div className="text-slate-400 pl-5">
              {date.toLocaleTimeString([], { timeStyle: 'short' })} - {end.toLocaleTimeString([], { timeStyle: 'short' })} ({duration} hrs)
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'purpose',
      header: 'Purpose / Shoot',
      cell: ({ row }) => (
        <span className="text-slate-200 font-medium truncate max-w-[150px] block" title={row.getValue('purpose')}>
          {row.getValue('purpose')}
        </span>
      ),
    },
    {
      accessorKey: 'equipments',
      header: 'Included Accessories',
      cell: ({ row }) => {
        const list = row.getValue('equipments') as StudioEquipment[];
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {list.map((eq) => (
              <span
                key={eq.id}
                className="bg-slate-950 text-slate-350 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 uppercase"
              >
                {eq.name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
      accessorKey: 'amountPaid',
      header: 'Booking Costs',
      cell: ({ row }) => {
        const amount = Number(row.getValue('amountPaid') || 0);
        const extra = Number(row.original.additionalCharges || 0);
        return (
          <div className="text-xs space-y-0.5">
            <div className="text-slate-300">
              Paid: <span className="font-semibold text-white">₹{amount}</span>
            </div>
            {extra > 0 && (
              <div className="text-rose-400 font-medium">
                Add-on: ₹{extra}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'notes',
      header: 'Client Notes',
      cell: ({ row }) => {
        const notes = row.getValue('notes') as string | null;
        return notes ? (
          <span className="text-xs text-slate-400 block max-w-[150px] truncate" title={notes}>
            {notes}
          </span>
        ) : (
          <span className="text-xs text-slate-650">-</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Home className="h-5 w-5 text-amber-500" />
            Studio Spaces
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Reserve professional production studio floors, sound booths, or lighting setup spaces.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-full shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:scale-[1.02] transition-all duration-200 w-full sm:w-auto">
              <Sparkles className="h-4 w-4 mr-2" />
              Book Studio Space
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-lg w-full p-6 shadow-2xl rounded-2xl overflow-y-auto max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Home className="h-5 w-5 text-amber-500" />
                Book Studio Floor
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-1">
                A 30-minute cleaning and turnaround buffer is automatically appended after each studio reservation.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleBookStudio} className="space-y-4 mt-2">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="dateTime" className="text-xs font-semibold text-slate-300">Date & Start Time *</Label>
                  <Input
                    type="datetime-local"
                    id="dateTime"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white rounded-lg h-9"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="duration" className="text-xs font-semibold text-slate-300">Duration (Hours) *</Label>
                  <select
                    id="duration"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg h-9 px-3 text-sm focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="3">3 Hours</option>
                    <option value="4">4 Hours</option>
                    <option value="6">6 Hours</option>
                    <option value="8">8 Hours</option>
                    <option value="12">12 Hours (Full Day)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="purpose" className="text-xs font-semibold text-slate-300">Purpose of Session *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Cyclorama Shoot, Podcast, Video Production"
                    className="bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white pl-9 rounded-lg h-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-300">Included Gear & Space Add-ons *</Label>
                <div className="border border-slate-800 rounded-xl bg-slate-950 p-3 max-h-40 overflow-y-auto space-y-2">
                  {equipmentCatalog.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-4">No active studio accessories found.</p>
                  ) : (
                    equipmentCatalog.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start gap-3 p-1.5 rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEquipmentIds.includes(item.id)}
                          onChange={() => toggleEquipmentSelection(item.id)}
                          className="mt-1 h-4 w-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-950 bg-slate-950"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-white block">{item.name}</span>
                          {item.description && (
                            <span className="text-[10px] text-slate-400 block leading-tight">{item.description}</span>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs font-semibold text-slate-300">Special Requests / Setup Instructions</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Backdrop color preferences, acoustic requirements, etc..."
                    className="bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white pl-9 rounded-lg min-h-[70px] text-sm py-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg">
                  Confirm Booking
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-44 bg-slate-900/30 border border-slate-800 rounded-xl animate-pulse flex flex-col justify-center items-center gap-2">
            <div className="h-6 w-1/3 bg-slate-800 rounded" />
            <div className="h-4 w-1/4 bg-slate-800 rounded" />
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No studio space bookings yet"
          description="Ready to reserve our acoustically isolated cyclorama wall or sound stage? Click below to book a slot."
          actionLabel="Book Studio Space"
          onAction={() => setIsDialogOpen(true)}
        />
      ) : (
        <BookingTable columns={columns} data={bookings} emptyMessage="No studio space reservations." />
      )}
    </div>
  );
}
