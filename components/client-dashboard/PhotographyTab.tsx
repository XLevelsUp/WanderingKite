'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Camera, Calendar, MapPin, Users, FileText, CheckCircle2, AlertCircle, Clock, ExternalLink, Pencil } from 'lucide-react';
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
  const [otherDescription, setOtherDescription] = useState('');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('');
  const [location, setLocation] = useState('');

  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const isOther = sessionType === 'Other';

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

  const resetForm = () => {
    setSessionType('');
    setOtherDescription('');
    setDate('');
    setHour('');
    setMinute('');
    setAmpm('');
    setLocation('');

    setNotes('');
    setFormError('');
  };

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!sessionType) {
      setFormError('Please select a session type.');
      return;
    }
    if (isOther && !otherDescription.trim()) {
      setFormError('Please describe your creative requirement.');
      return;
    }
    if (!date || !hour || !minute || !ampm) {
      setFormError('Please select a date and time.');
      return;
    }
    if (!location.trim()) {
      setFormError('Please enter the shoot location.');
      return;
    }

    // Combine separate date + 12-hour time inputs into ISO string
    let hourNum = parseInt(hour, 10);
    if (ampm === 'PM' && hourNum < 12) hourNum += 12;
    if (ampm === 'AM' && hourNum === 12) hourNum = 0;
    const formattedHour = hourNum.toString().padStart(2, '0');
    const dateTime = `${date}T${formattedHour}:${minute}:00`;
    const bookingTime = new Date(dateTime);
    if (isNaN(bookingTime.getTime())) {
      setFormError('Invalid date or time selected.');
      return;
    }
    if (bookingTime.getTime() <= Date.now()) {
      setFormError('You cannot schedule a booking in the past.');
      return;
    }

    // For "Other Creative", append the custom description to the session type label
    const resolvedSessionType = isOther
      ? `Other: ${otherDescription.trim()}`
      : sessionType;

    showLoader('Scheduling your session...');
    try {
      const res = await fetch('/api/client/photography/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: resolvedSessionType,
          dateTime: bookingTime.toISOString(),
          location,
          notes,
          peopleCount: null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to book session');
      }

      if (data.hasConflict) {
        toast.warning(
          "A booking already exists for this time slot. We will check staff availability and confirm your booking shortly.",
          { duration: 8000 }
        );
      } else {
        toast.success('Photography session scheduled successfully!');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchBookings();
    } catch (error: any) {
      console.error(error);
      setFormError(error.message || 'An error occurred while booking. Please try again.');
      toast.error(error.message || 'Could not schedule booking.');
    } finally {
      hideLoader();
    }
  };

  // Today's date string for min attribute (YYYY-MM-DD)
  const todayDate = new Date().toISOString().split('T')[0];

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
            Shoot Completed
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
              {formatDateTime12h(val)}
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
      id: 'payments',
      header: 'Payments & Quotation',
      cell: ({ row }) => {
        const { metadata } = parseNotesMetadata(row.original.notes);
        const quotation = metadata.quotationAmount !== undefined ? Number(metadata.quotationAmount) : null;
        const advance = Number(row.original.advancePaid || 0);
        const paid = Number(row.original.amountPaid || 0);
        const balance = quotation !== null ? Math.max(0, quotation - paid) : null;
        const paymentStatus = metadata.paymentStatus || null;

        return (
          <div className="text-xs space-y-1 py-1">
            {quotation !== null && (
              <div className="text-slate-300 font-medium">
                Quotation: <span className="text-white">₹{quotation}</span>
              </div>
            )}
            {advance > 0 && (
              <div className="text-slate-400">
                Advance: <span className="text-slate-300">₹{advance}</span>
              </div>
            )}
            <div className="text-slate-400">
              Paid: <span className="font-semibold text-white">₹{paid}</span>
            </div>
            {balance !== null && balance > 0 && (
              <div className="text-slate-400 font-medium">
                Balance:{' '}
                <span className="text-amber-500 font-bold">₹{balance}</span>
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

  const pendingRequests = bookings.filter((b) => b.status === 'PENDING');
  const confirmedBookings = bookings.filter((b) => b.status !== 'PENDING');

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

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-full shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:scale-[1.02] transition-all duration-200 w-full sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              Book Photography Session
            </Button>
          </DialogTrigger>
          <DialogContent
            className="bg-slate-900 border border-slate-800 text-white max-w-md w-full p-6 shadow-2xl rounded-2xl"
            onInteractOutside={(e) => e.preventDefault()}
          >
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

              {/* Session Type */}
              <div className="space-y-1">
                <Label htmlFor="sessionType" className="text-xs font-semibold text-slate-300">Session Type *</Label>
                <Select value={sessionType} onValueChange={(val) => { setSessionType(val); setOtherDescription(''); }}>
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

              {/* Other Creative – conditional description field */}
              {isOther && (
                <div className="space-y-1">
                  <Label htmlFor="otherDescription" className="text-xs font-semibold text-slate-300">
                    Describe Your Creative Requirement *
                  </Label>
                  <div className="relative">
                    <Pencil className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                    <Input
                      id="otherDescription"
                      value={otherDescription}
                      onChange={(e) => setOtherDescription(e.target.value)}
                      className="bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white pl-9 rounded-lg h-9 text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Let us know exactly what you have in mind so we can prepare the right setup.
                  </p>
                </div>
              )}

              {/* Date & Time */}
              <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                  display: block !important;
                  opacity: 0.85 !important;
                  cursor: pointer;
                  filter: invert(62%) sepia(93%) saturate(1682%) hue-rotate(15deg) brightness(102%) contrast(101%) !important;
                }
                input[type="date"]::-webkit-calendar-picker-indicator:hover {
                  opacity: 1 !important;
                  filter: invert(72%) sepia(61%) saturate(3033%) hue-rotate(5deg) brightness(101%) contrast(97%) !important;
                }
              `}</style>
              <div className="space-y-1">
                <Label htmlFor="shootDate" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" />
                  Shoot Date *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-amber-500 pointer-events-none" />
                  <input
                    type="date"
                    id="shootDate"
                    value={date}
                    min={todayDate}
                    onChange={(e) => setDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch (err) { }
                    }}
                    style={{ colorScheme: 'dark' }}
                    className="flex h-9 w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-3 py-1 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Shoot Time *
                </Label>
                <div className="flex gap-2">
                  {/* Hour Select */}
                  <div className="flex-1">
                    <Select value={hour} onValueChange={setHour}>
                      <SelectTrigger className="w-full bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white rounded-lg h-9 text-xs">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border border-slate-800 text-white max-h-[200px]">
                        {Array.from({ length: 12 }, (_, i) => {
                          const h = (i + 1).toString().padStart(2, '0');
                          return <SelectItem key={h} value={h}>{h}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Minute Select */}
                  <div className="flex-1">
                    <Select value={minute} onValueChange={setMinute}>
                      <SelectTrigger className="w-full bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white rounded-lg h-9 text-xs">
                        <SelectValue placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border border-slate-800 text-white max-h-[200px]">
                        {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* AM/PM Select */}
                  <div className="w-[84px] shrink-0">
                    <Select value={ampm} onValueChange={setAmpm}>
                      <SelectTrigger className="w-full bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white rounded-lg h-9 text-xs">
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border border-slate-800 text-white">
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>



              {/* Shoot Location */}
              <div className="space-y-1">
                <Label htmlFor="location" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  Shoot Location *
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white rounded-lg h-9 text-sm"
                  required
                />
              </div>

              {/* Creative Brief / Notes – icon in label, not inside textarea */}
              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-slate-400" />
                  Creative Brief / Notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white rounded-lg min-h-[72px] text-sm resize-none"
                />
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
        <div className="space-y-8">
          {pendingRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold tracking-wider text-amber-400 uppercase">
                Booking Requests (Pending Approval)
              </h3>
              <BookingTable columns={columns} data={pendingRequests} emptyMessage="No pending photography requests." />
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
              Confirmed Bookings
            </h3>
            <BookingTable
              columns={columns}
              data={confirmedBookings}
              emptyMessage={pendingRequests.length > 0 ? "No confirmed bookings yet. Your request is pending review." : "No confirmed bookings yet."}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// 12-hour datetime formatting helper
const formatDateTime12h = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
};

// Notes metadata parsing helper
const parseNotesMetadata = (notes: string | null): { userNotes: string; metadata: any } => {
  if (!notes) return { userNotes: '', metadata: {} };
  const marker = '\n---METADATA---\n';
  const parts = notes.split(marker);
  if (parts.length > 1) {
    try {
      const metadata = JSON.parse(parts[1]);
      return { userNotes: parts[0], metadata };
    } catch (e) {
      // Ignore parsing error
    }
  }
  return { userNotes: notes, metadata: {} };
};

