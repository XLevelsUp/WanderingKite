'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Camera, Calendar, MapPin, Users, FileText, CheckCircle2, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingTable } from './BookingTable';
import EmptyState from './EmptyState';
import { useNotifications } from '@/components/ui/useNotifications';
import { toast } from 'sonner';

interface AlbumDetail {
  id: string;
  name: string;
  deliveryDate: string | null;
  downloadLink: string | null;
}

interface PhotographyBooking {
  id: string;
  sessionType: string;
  dateTime: string;
  location: string;
  notes: string | null;
  peopleCount: number | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  amountPaid: number;
  advancePaid: number;
  album?: AlbumDetail | null;
  createdAt: string;
}

export default function PhotographyTab() {
  const [bookings, setBookings] = useState<PhotographyBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showLoader, hideLoader } = useNotifications();

  // Form states
  const [sessionType, setSessionType] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [peopleCount, setPeopleCount] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/client/photography/list');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error(error);
      toast.error('Could not load photography bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!sessionType) {
      setFormError('Please select a session type.');
      return;
    }
    if (!dateTime) {
      setFormError('Please select a date and time.');
      return;
    }
    if (!location.trim()) {
      setFormError('Please enter a location.');
      return;
    }

    const bookingTime = new Date(dateTime);
    if (bookingTime.getTime() <= Date.now()) {
      setFormError('You cannot schedule a booking in the past.');
      return;
    }

    showLoader('Scheduling your session...');
    try {
      const res = await fetch('/api/client/photography/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType,
          dateTime,
          location,
          notes,
          peopleCount: peopleCount ? parseInt(peopleCount, 10) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to book session');
      }

      toast.success('Photography session scheduled successfully!');
      setIsDialogOpen(false);
      // Reset form
      setSessionType('');
      setDateTime('');
      setLocation('');
      setPeopleCount('');
      setNotes('');
      fetchBookings();
    } catch (error: any) {
      console.error(error);
      setFormError(error.message || 'An error occurred while booking. Please try again.');
      toast.error(error.message || 'Could not schedule booking.');
    } finally {
      hideLoader();
    }
  };

  const getStatusBadge = (status: PhotographyBooking['status']) => {
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

  const columns: ColumnDef<PhotographyBooking>[] = [
    {
      accessorKey: 'dateTime',
      header: 'Date & Time',
      cell: ({ row }) => {
        const val = row.getValue('dateTime') as string;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="font-medium text-white">
              {new Date(val).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'sessionType',
      header: 'Session Type',
      cell: ({ row }) => (
        <span className="bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {row.getValue('sessionType')}
        </span>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 max-w-[200px] truncate text-slate-300">
          <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span>{row.getValue('location')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
      accessorKey: 'amountPaid',
      header: 'Payment Status',
      cell: ({ row }) => {
        const amount = Number(row.getValue('amountPaid') || 0);
        const advance = Number(row.original.advancePaid || 0);
        const status = row.original.status;
        
        return (
          <div className="text-xs space-y-0.5">
            <div className="text-slate-300">
              Paid: <span className="font-semibold text-white">₹{amount}</span>
            </div>
            {status !== 'COMPLETED' && (
              <div className="text-slate-400">
                Advance: <span className="text-slate-300">₹{advance}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Deliverables',
      cell: ({ row }) => {
        const album = row.original.album;
        if (album && album.downloadLink) {
          return (
            <a
              href={album.downloadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-semibold transition-colors group"
            >
              <span>View Album</span>
              <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          );
        }
        if (row.original.status === 'COMPLETED') {
          return <span className="text-xs text-slate-500 italic">Processing deliverables...</span>;
        }
        return <span className="text-xs text-slate-650">-</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Camera className="h-5 w-5 text-amber-500" />
            Photography Shoots
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Book professional photo sessions, track review statuses, and download final high-res albums.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-full shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:scale-[1.02] transition-all duration-200 w-full sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              Book Photography Session
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md w-full p-6 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-amber-500" />
                Book Session
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-1">
                Enter details to request a custom photography shoot. We will review and confirm your slot.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleBookSession} className="space-y-4 mt-2">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="sessionType" className="text-xs font-semibold text-slate-300">Session Type *</Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger id="sessionType" className="w-full bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white rounded-lg h-9">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border border-slate-800 text-white">
                    <SelectItem value="Portrait">Portrait Shoot</SelectItem>
                    <SelectItem value="Wedding">Wedding / Engagement</SelectItem>
                    <SelectItem value="Event">Event Coverage</SelectItem>
                    <SelectItem value="Product">Product / Commercial</SelectItem>
                    <SelectItem value="Other">Other Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="dateTime" className="text-xs font-semibold text-slate-300">Date & Time *</Label>
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
                  <Label htmlFor="peopleCount" className="text-xs font-semibold text-slate-300">People Count</Label>
                  <Input
                    type="number"
                    id="peopleCount"
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(e.target.value)}
                    placeholder="e.g. 2"
                    min="1"
                    className="bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white rounded-lg h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="location" className="text-xs font-semibold text-slate-300">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Studio address or outdoor location"
                    className="bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white pl-9 rounded-lg h-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs font-semibold text-slate-300">Creative Brief / Notes</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your vision, mood board details, or specific shots needed..."
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
                  Submit Request
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
          icon={Camera}
          title="No photography bookings yet"
          description="Ready to schedule your first portrait, commercial or wedding shoot? Click below to request a session."
          actionLabel="Book a Session"
          onAction={() => setIsDialogOpen(true)}
        />
      ) : (
        <BookingTable columns={columns} data={bookings} emptyMessage="No photography bookings." />
      )}
    </div>
  );
}
