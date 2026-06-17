'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Film, Calendar, Shield, Upload, FileText, CheckCircle2, AlertCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Equipment {
  id: string;
  name: string;
  description: string | null;
}

interface RentalBooking {
  id: string;
  startDate: string;
  endDate: string;
  purpose: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'RETURNED' | 'DAMAGED' | 'CANCELLED';
  pickupCondition: string | null;
  returnCondition: string | null;
  returnedAt: string | null;
  damageCost: number | null;
  damageDescription: string | null;
  agreementUrl: string | null;
  equipments: Equipment[];
  createdAt: string;
}

interface IdProof {
  id: string;
  idType: string;
  fileUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectReason: string | null;
}

interface RentalsTabProps {
  clientName: string;
  initialIdProof: IdProof | null;
}

export default function RentalsTab({ clientName, initialIdProof }: RentalsTabProps) {
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [idProof, setIdProof] = useState<IdProof | null>(initialIdProof);
  const [equipmentCatalog, setEquipmentCatalog] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  
  const { showLoader, hideLoader } = useNotifications();

  // ID Upload Form States
  const [idType, setIdType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');

  // Rental Booking Form States
  const [startDate, setStartDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [startMinute, setStartMinute] = useState('');
  const [startAmpm, setStartAmpm] = useState('');
  
  const [endDate, setEndDate] = useState('');
  const [endHour, setEndHour] = useState('');
  const [endMinute, setEndMinute] = useState('');
  const [endAmpm, setEndAmpm] = useState('');

  const [purpose, setPurpose] = useState('');
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [bookingError, setBookingError] = useState('');

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/client/rentals/list');
      if (!res.ok) throw new Error('Failed to fetch rental list');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error(error);
      toast.error('Could not load rentals');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/client/rentals/equipment');
      if (res.ok) {
        const data = await res.json();
        setEquipmentCatalog(data.equipment || []);
      }
    } catch (error) {
      console.error('Failed to load equipment catalog:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchCatalog();
  }, []);

  const handleIdUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    if (!idType) {
      setUploadError('Please select your ID document type.');
      return;
    }
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('idType', idType);

    showLoader('Uploading ID Proof...');
    try {
      const res = await fetch('/api/client/rentals/id-proof', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'ID Upload failed');
      }

      toast.success('ID proof uploaded successfully! Our team will review it.');
      setIdProof({
        id: '',
        idType,
        fileUrl: '',
        status: 'PENDING',
        rejectReason: null,
      });
      setSelectedFile(null);
      setIdType('');
    } catch (error: any) {
      console.error(error);
      setUploadError(error.message || 'Something went wrong uploading your ID. Please try again.');
      toast.error(error.message || 'ID Upload failed.');
    } finally {
      hideLoader();
    }
  };

  const handleBookRental = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (!startDate || !startHour || !startMinute || !startAmpm) {
      setBookingError('Please enter complete start date and time.');
      return;
    }
    if (!endDate || !endHour || !endMinute || !endAmpm) {
      setBookingError('Please enter complete end date and time.');
      return;
    }
    if (selectedEquipmentIds.length === 0) {
      setBookingError('Please select at least one equipment item.');
      return;
    }

    const formatDateTime = (dateStr: string, hourStr: string, minStr: string, ampmStr: string) => {
      let hourNum = parseInt(hourStr, 10);
      if (ampmStr === 'PM' && hourNum < 12) hourNum += 12;
      if (ampmStr === 'AM' && hourNum === 12) hourNum = 0;
      const h = hourNum.toString().padStart(2, '0');
      return `${dateStr}T${h}:${minStr}:00`;
    };

    const startDateTimeStr = formatDateTime(startDate, startHour, startMinute, startAmpm);
    const endDateTimeStr = formatDateTime(endDate, endHour, endMinute, endAmpm);

    const start = new Date(startDateTimeStr);
    const end = new Date(endDateTimeStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setBookingError('Invalid date or time selected.');
      return;
    }

    if (start.getTime() <= Date.now()) {
      setBookingError('Rental start date must be in the future.');
      return;
    }
    if (end.getTime() <= start.getTime()) {
      setBookingError('Rental end date must be after the start date.');
      return;
    }

    showLoader('Submitting rental request...');
    try {
      const res = await fetch('/api/client/rentals/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDateTimeStr,
          endDate: endDateTimeStr,
          purpose,
          equipmentIds: selectedEquipmentIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Rental booking failed');
      }

      toast.success('Equipment rental requested successfully!');
      setIsBookDialogOpen(false);
      // Reset form
      setStartDate('');
      setStartHour('');
      setStartMinute('');
      setStartAmpm('');
      setEndDate('');
      setEndHour('');
      setEndMinute('');
      setEndAmpm('');
      setPurpose('');
      setSelectedEquipmentIds([]);
      fetchBookings();
    } catch (error: any) {
      console.error(error);
      setBookingError(error.message || 'Failed to submit rental request.');
      toast.error(error.message || 'Rental booking failed.');
    } finally {
      hideLoader();
    }
  };

  const toggleEquipmentSelection = (id: string) => {
    setSelectedEquipmentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: RentalBooking['status']) => {
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
            Approved / Picked Up
          </Badge>
        );
      case 'RETURNED':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="h-3 w-3" />
            Returned
          </Badge>
        );
      case 'DAMAGED':
        return (
          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit">
            <AlertTriangle className="h-3 w-3 animate-pulse" />
            Returned Damaged
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit">
            <AlertCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
    }
  };

  const columns: ColumnDef<RentalBooking>[] = [
    {
      accessorKey: 'startDate',
      header: 'Rental Period',
      cell: ({ row }) => {
        const start = row.getValue('startDate') as string;
        const end = row.original.endDate;
        return (
          <div className="flex flex-col text-xs space-y-0.5">
            <div className="flex items-center gap-1.5 text-white font-medium">
              <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>{formatDate12h(start)}</span>
            </div>
            <div className="text-slate-400 pl-5">
              to {formatDate12h(end)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'equipments',
      header: 'Equipment Rented',
      cell: ({ row }) => {
        const list = row.getValue('equipments') as Equipment[];
        return (
          <div className="flex flex-wrap gap-1 max-w-[220px]">
            {list.map((eq) => (
              <span
                key={eq.id}
                className="bg-slate-950 text-slate-300 border border-slate-800/80 px-2 py-0.5 rounded text-[10px] uppercase font-semibold truncate max-w-full inline-block"
                title={eq.name}
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
      accessorKey: 'pickupCondition',
      header: 'Condition',
      cell: ({ row }) => {
        const pickup = row.getValue('pickupCondition') as string;
        const ret = row.original.returnCondition;
        const isDamaged = row.original.status === 'DAMAGED';
        
        return (
          <div className="text-xs space-y-0.5">
            {pickup && (
              <div className="text-slate-400">
                Out: <span className="text-slate-350">{pickup}</span>
              </div>
            )}
            {ret && (
              <div className={isDamaged ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                In: <span>{ret}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'damageCost',
      header: 'Assessment',
      cell: ({ row }) => {
        const cost = row.getValue('damageCost') as number | null;
        const desc = row.original.damageDescription;
        if (cost !== null || desc) {
          return (
            <div className="text-xs space-y-0.5 text-rose-400">
              <div className="font-bold">Charge: ₹{cost}</div>
              <div className="text-[10px] text-slate-400 max-w-[150px] truncate" title={desc || ''}>
                {desc}
              </div>
            </div>
          );
        }
        return <span className="text-xs text-slate-650">-</span>;
      },
    },
    {
      id: 'agreement',
      header: 'Agreement File',
      cell: ({ row }) => {
        const fileUrl = row.original.agreementUrl;
        if (fileUrl) {
          return (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-semibold transition-colors group"
            >
              <span>View Agreement</span>
              <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          );
        }
        if (row.original.status === 'CONFIRMED' || row.original.status === 'RETURNED') {
          return <span className="text-xs text-slate-500 italic">No file uploaded</span>;
        }
        return <span className="text-xs text-slate-650">-</span>;
      },
    },
  ];

  const isVerified = idProof?.status === 'VERIFIED';
  const isPending = idProof?.status === 'PENDING';
  const isRejected = idProof?.status === 'REJECTED';

  const pendingRequests = bookings.filter((b) => b.status === 'PENDING');
  const confirmedBookings = bookings.filter((b) => b.status !== 'PENDING');

  return (
    <div className="space-y-6">
      {/* Notice Banner based on ID Verification State */}
      {!idProof && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Identity Verification Required</p>
              <p className="text-xs text-slate-400 mt-0.5">
                To lease cameras, lenses, and other gear, you must upload a copy of a government-issued ID.
              </p>
            </div>
          </div>
        </div>
      )}

      {isPending && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5 animate-spin-slow" />
          <div>
            <p className="font-bold">ID Review In Progress</p>
            <p className="text-xs text-slate-400 mt-0.5">
              We are verifying your documents. Our team typically approves records within 12-24 hours. The rental catalog will unlock automatically.
            </p>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Identity Verification Rejected</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Your ID verification was rejected. Reason: <span className="text-rose-400 font-semibold">{idProof.rejectReason || 'Invalid or unreadable document.'}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {isVerified && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Identity Verified</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Your profile is verified. You have full access to schedule equipment rentals and sign lease agreements.
            </p>
          </div>
        </div>
      )}

      {/* Show rental terms/bill back image only after uploading an ID (pending or verified) */}
      {idProof && !isRejected && (
        <div className="mt-6 mb-8 bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
          <img 
            src="/rental-bill-back.webp" 
            alt="Wandering Kite Rental Terms and Conditions" 
            className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Film className="h-5 w-5 text-amber-500" />
            Equipment Rentals
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Browse our rental listings, request equipment pickups, and track gear conditions.
          </p>
        </div>

        {isVerified && (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-full shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:scale-[1.02] transition-all duration-200 w-full sm:w-auto">
                  <Film className="h-4 w-4 mr-2" />
                  Rent Equipment
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-lg w-full p-6 shadow-2xl rounded-2xl overflow-y-auto max-h-[85vh]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Film className="h-5 w-5 text-amber-500" />
                    Lease Equipment
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 text-xs mt-1">
                    Select gear items and duration to request a custom rental.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleBookRental} className="space-y-4 mt-2">
                  {bookingError && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-shake">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-amber-500" />
                        Start Date & Time *
                      </Label>
                      <div className="relative mb-2">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-amber-500 pointer-events-none" />
                        <input
                          type="date"
                          value={startDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            if (bookingError) setBookingError('');
                          }}
                          onClick={(e) => {
                            try { e.currentTarget.showPicker(); } catch (err) {}
                          }}
                          style={{ colorScheme: 'dark' }}
                          className="flex h-9 w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-3 py-1 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50 cursor-pointer"
                          required
                        />
                      </div>
                      <div className="flex gap-1.5">
                        <div className="flex-1">
                          <Select value={startHour} onValueChange={(val) => { setStartHour(val); if(bookingError) setBookingError(''); }}>
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
                        <div className="flex-1">
                          <Select value={startMinute} onValueChange={setStartMinute}>
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
                        <div className="w-[72px] shrink-0">
                          <Select value={startAmpm} onValueChange={(val) => { setStartAmpm(val); if(bookingError) setBookingError(''); }}>
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

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-amber-500" />
                        End Date & Time *
                      </Label>
                      <div className="relative mb-2">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-amber-500 pointer-events-none" />
                        <input
                          type="date"
                          value={endDate}
                          min={startDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            if (bookingError) setBookingError('');
                          }}
                          onClick={(e) => {
                            try { e.currentTarget.showPicker(); } catch (err) {}
                          }}
                          style={{ colorScheme: 'dark' }}
                          className="flex h-9 w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-3 py-1 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50 cursor-pointer"
                          required
                        />
                      </div>
                      <div className="flex gap-1.5">
                        <div className="flex-1">
                          <Select value={endHour} onValueChange={(val) => { setEndHour(val); if(bookingError) setBookingError(''); }}>
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
                        <div className="flex-1">
                          <Select value={endMinute} onValueChange={setEndMinute}>
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
                        <div className="w-[72px] shrink-0">
                          <Select value={endAmpm} onValueChange={(val) => { setEndAmpm(val); if(bookingError) setBookingError(''); }}>
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
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="purpose" className="text-xs font-semibold text-slate-300">Rental Purpose</Label>
                    <Input
                      id="purpose"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white rounded-lg h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-300">Select Equipment Catalog *</Label>
                    <div className="border border-slate-800 rounded-xl bg-slate-950 p-3 max-h-48 overflow-y-auto space-y-2">
                      {equipmentCatalog.length === 0 ? (
                        <p className="text-xs text-slate-500 italic text-center py-4">No active rental gear available right now.</p>
                      ) : (
                        equipmentCatalog.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-900/50 cursor-pointer border border-transparent hover:border-slate-800 transition-colors"
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

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <DialogClose asChild>
                      <Button type="button" variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg">
                      Submit Booking
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* ID Upload Section if missing or rejected */}
      {(!idProof || isRejected) && (
        <Card className="bg-slate-900/30 border-slate-850 backdrop-blur-md max-w-xl mx-auto rounded-2xl overflow-hidden shadow-xl border-dashed border">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="h-4.5 w-4.5 text-amber-500" />
              Upload ID Proof Document
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Submit your document to activate renting access. PDF, JPG, PNG or WebP files up to 10MB are allowed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIdUpload} className="space-y-4">
              {uploadError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="idType" className="text-xs font-semibold text-slate-300">ID Document Type *</Label>
                <Select value={idType} onValueChange={setIdType}>
                  <SelectTrigger id="idType" className="bg-slate-950 border-slate-800 text-white rounded-lg h-9">
                    <SelectValue placeholder="Select ID Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border border-slate-800 text-white">
                    <SelectItem value="Driving License">Driving License</SelectItem>
                    <SelectItem value="Passport">Passport</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="idFile" className="text-xs font-semibold text-slate-300">Select Document File *</Label>
                <div className="border border-slate-800 bg-slate-950 hover:bg-slate-900/40 p-5 rounded-lg text-center cursor-pointer transition-colors duration-200 relative group flex flex-col items-center">
                  <input
                    type="file"
                    id="idFile"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="h-8 w-8 text-slate-500 group-hover:text-amber-500 transition-colors mb-2" />
                  <span className="text-xs font-semibold text-slate-300 block">
                    {selectedFile ? selectedFile.name : 'Click to browse or drag and drop file'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, JPG, PNG (Max 10MB)'}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold h-9 rounded-lg"
              >
                Upload Document
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Rentals List */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-44 bg-slate-900/30 border border-slate-800 rounded-xl animate-pulse flex flex-col justify-center items-center gap-2">
            <div className="h-6 w-1/3 bg-slate-800 rounded" />
            <div className="h-4 w-1/4 bg-slate-800 rounded" />
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No equipment rentals yet"
          description={
            isVerified
              ? "Your profile is verified! Click below to request your first equipment lease."
              : "Upload your ID proof above to get verified and start renting high-end production equipment."
          }
          actionLabel={isVerified ? "Rent Equipment" : undefined}
          onAction={isVerified ? () => setIsBookDialogOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-8">
          {pendingRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold tracking-wider text-amber-400 uppercase">
                Rental Requests (Pending Approval)
              </h3>
              <BookingTable columns={columns} data={pendingRequests} emptyMessage="No pending rental requests." />
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
              Confirmed Rentals & Leased Gear
            </h3>
            <BookingTable
              columns={columns}
              data={confirmedBookings}
              emptyMessage={pendingRequests.length > 0 ? "No confirmed rentals yet. Your request is pending review." : "No confirmed rentals yet."}
            />
          </div>
        </div>
      )}

      {/* Agreement Terms Scrollable Dialog Modal */}
      <Dialog open={isAgreementOpen} onOpenChange={setIsAgreementOpen}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-2xl w-full p-6 shadow-2xl rounded-2xl flex flex-col max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Standard Rental Agreement Terms
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs mt-1">
              General terms and conditions for leasing equipment from WanderingKite Studio.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto border border-slate-850 bg-slate-950/80 p-5 rounded-xl text-xs leading-relaxed text-slate-300 space-y-4 my-4">
            <h4 className="font-bold text-white text-sm">1. Parties & Definitions</h4>
            <p>
              This Equipment Rental Agreement is made between WanderingKite Studio ("Lessor") and the verified registered account holder ("Lessee"), represented by <strong className="text-amber-500">{clientName}</strong>. "Equipment" refers to all cameras, lenses, lighting, audio gear, accessories, and kits leased under the booking transaction.
            </p>

            <h4 className="font-bold text-white text-sm">2. Rental Period & Return</h4>
            <p>
              The rental period starts and ends at the exact datetimes designated in the confirmed booking. The Lessee agrees to pick up and return the gear during official studio business hours. Late returns will incur penal rates of double the daily rate per additional hour overdue, unless extended and confirmed in writing beforehand.
            </p>

            <h4 className="font-bold text-white text-sm">3. Condition of Equipment</h4>
            <p>
              Lessor will verify all equipment is clean, calibrated, and in good operating condition prior to dispatch. Lessee has the duty to inspect and flag any defects upon pickup. Returns will be evaluated by studio technicians. Any returns classified under <strong>DAMAGED</strong> or displaying excessive wear will hold the Lessee liable for the full repair assessment or standard replacement costs.
            </p>

            <h4 className="font-bold text-white text-sm">4. Loss, Theft & Damage Liabilities</h4>
            <p>
              Lessee assumes all risks of loss, theft, damage, or destruction of the equipment from the moment of pickup until return is acknowledged by staff. In the event of damage, Lessee agrees to compensate the assessment fee, spare parts fees, and repair labor as cataloged by the Lessor.
            </p>

            <h4 className="font-bold text-white text-sm">5. Prohibited Uses</h4>
            <p>
              Lessee shall not: (a) sub-lease, lend, or transfer the equipment to third parties; (b) disassemble, modify, or attempt repairs on any device; (c) use the equipment in hazardous environments or underwater without specialized protective housings approved by the Lessor.
            </p>

            <p className="text-slate-500 italic">
              By confirming your rental order on our portal, you acknowledge and bind yourself to these terms.
            </p>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <DialogClose asChild>
              <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg">
                I Understand
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Custom date formatting helper
const formatDate12h = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

