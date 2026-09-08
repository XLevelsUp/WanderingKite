'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ColumnDef } from '@tanstack/react-table';
import { Home, Calendar, Clock, CheckCircle2, AlertCircle, FileText, Sparkles, MapPin, Clapperboard, ClipboardList, Package, Users } from 'lucide-react';
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
import { logger } from '@/lib/logger';
import { getStudioPackages, getStudioAddOns } from '@/actions/studio-pricing-public';

interface StudioEquipment {
  id: string;
  name: string;
  description: string | null;
  category_name?: string | null;
  categoryName?: string | null;
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

const CATEGORIES = [
  { title: 'Cameras', key: 'camera' },
  { title: 'Lenses', key: 'lens' },
  { title: 'Lighting', key: 'light' },
  { title: 'Audio/Mic', key: 'audio' },
  { title: 'Others', key: 'other' },
];

const getEquipmentHourlyRate = (item: StudioEquipment): number => {
  if (!item) return 0;
  const anyItem = item as any;
  
  // 1. Try studioPricingPlans first
  const studioPlans = Array.isArray(anyItem.studioPricingPlans) ? anyItem.studioPricingPlans : [];
  const studioHourlyPlan = studioPlans.find((p: any) => p.name?.toLowerCase() === 'hourly');
  if (studioHourlyPlan) return Number(studioHourlyPlan.rate) || 0;

  // 2. Try flat studio_hourly_rate column
  if (anyItem.studio_hourly_rate && Number(anyItem.studio_hourly_rate) > 0) {
    return Number(anyItem.studio_hourly_rate);
  }
  
  // 3. Fallback to legacy pricingPlans
  const plans = Array.isArray(anyItem.pricingPlans) ? anyItem.pricingPlans : [];
  const hourlyPlan = plans.find((p: any) => p.name?.toLowerCase() === 'hourly');
  if (hourlyPlan) return Number(hourlyPlan.rate) || 0;
  
  const dailyPlan = plans.find((p: any) => p.name?.toLowerCase() === 'daily');
  if (dailyPlan) return Math.round((Number(dailyPlan.rate) || 0) / 10);
  
  if (plans.length > 0) {
    const first = plans[0];
    const duration = Number(first.durationHours) || 1;
    return Math.round((Number(first.rate) || 0) / duration);
  }
  
  return 0;
};

export default function StudioTab() {
  const [bookings, setBookings] = useState<StudioBooking[]>([]);
  const [equipmentCatalog, setEquipmentCatalog] = useState<StudioEquipment[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [addOns, setAddOns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showLoader, hideLoader } = useNotifications();

  // Form states
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [hourlyDuration, setHourlyDuration] = useState('2');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  const minDateTime = React.useMemo(() => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    const localTime = new Date(now.getTime() - offsetMs);
    return localTime.toISOString().slice(0, 16);
  }, []);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedPackage = React.useMemo(
    () => packages.find((p) => p.id === selectedPackageId) ?? null,
    [packages, selectedPackageId]
  );

  // A package is "metered by the hour" (client picks how many hours) when its
  // duration label has no leading number (e.g. "Per Hour"); a label starting
  // with a digit (e.g. "4 Hours") is a fixed-duration package instead.
  const isHourlyMetered = !selectedPackage || !/^\d/.test(selectedPackage.duration_label ?? '');

  const packageHours = React.useMemo(() => {
    if (isHourlyMetered) {
      return parseInt(hourlyDuration, 10) || 1;
    }
    return parseInt(selectedPackage?.duration_label?.match(/^(\d+)/)?.[1] ?? '1', 10);
  }, [isHourlyMetered, hourlyDuration, selectedPackage]);

  const subtotal = React.useMemo(() => {
    if (!selectedPackage) return 0;

    let total = isHourlyMetered ? selectedPackage.price * packageHours : selectedPackage.price;

    selectedAddOns.forEach((id) => {
      const addon = addOns.find((a) => a.id === id);
      if (addon) {
        total += addon.price * packageHours;
      }
    });

    selectedEquipmentIds.forEach((id) => {
      const eq = equipmentCatalog.find((e) => e.id === id);
      if (eq) {
        total += getEquipmentHourlyRate(eq) * packageHours;
      }
    });

    return total;
  }, [selectedPackage, isHourlyMetered, packageHours, selectedAddOns, addOns, selectedEquipmentIds, equipmentCatalog]);

  const gst = subtotal * 0.18;
  const finalTotal = subtotal + gst;

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/client/studio/list', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch studio bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (error) {
      logger.error(error);
      toast.error('Could not load studio bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/client/studio/equipment', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const items = data.equipment || [];
        if (items.length === 0) {
          logger.debug('No active studio accessories found. Triggering auto-seed...');
          const seedRes = await fetch('/api/seed-equipment');
          if (seedRes.ok) {
            const retryRes = await fetch('/api/client/studio/equipment', { cache: 'no-store' });
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              setEquipmentCatalog(retryData.equipment || []);
              return;
            }
          }
        }
        setEquipmentCatalog(items);
      }
    } catch (error) {
      logger.error('Failed to load studio accessories:', error);
    }
  };

  const fetchPricing = async () => {
    try {
      const [pkgs, addons] = await Promise.all([getStudioPackages(), getStudioAddOns()]);
      setPackages(pkgs as any[]);
      setAddOns(addons as any[]);
    } catch (error) {
      logger.error('Failed to load studio pricing:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchCatalog();
    fetchPricing();

    const supabase = createClient();
    const channel = supabase
      .channel('client-studio-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'studio_bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Default to the best-value package once pricing has loaded.
  useEffect(() => {
    if (!selectedPackageId && packages.length > 0) {
      const best = packages.find((p) => p.is_best_value) ?? packages[0];
      setSelectedPackageId(best.id);
    }
  }, [packages, selectedPackageId]);

  const handleBookStudio = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!date || !hour || !minute || !ampm) {
      setFormError('Please select a date and time.');
      return;
    }

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

    const duration = packageHours;

    if (isNaN(duration) || duration <= 0) {
      setFormError('Please enter a valid number of hours.');
      return;
    }
    if (!selectedPackage) {
      setFormError('Please select a package.');
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

    if (bookingTime.getTime() <= Date.now()) {
      setFormError('Studio bookings must be in the future.');
      return;
    }

    const packageLabel = `${selectedPackage.name} (${isHourlyMetered ? `${duration} Hours` : selectedPackage.duration_label})`;

    const addOnLabels = selectedAddOns
      .map((id) => {
        const addon = addOns.find((a) => a.id === id);
        return addon ? `${addon.name} (+₹${addon.price}/${addon.unit})` : '';
      })
      .filter(Boolean);

    const addonsLabel = addOnLabels.length > 0 ? addOnLabels.join(', ') : 'None';

    const userNotes = [
      `Package: ${packageLabel}`,
      `Add-ons: ${addonsLabel}`,
      notes ? `Instructions: ${notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const breakdown = {
      package: { id: selectedPackage.id, name: selectedPackage.name, price: selectedPackage.price },
      packageHours: duration,
      packageTotal: isHourlyMetered ? selectedPackage.price * duration : selectedPackage.price,
      addOns: selectedAddOns.map((id) => {
        const addon = addOns.find((a) => a.id === id);
        return addon ? { id: addon.id, name: addon.name, price: addon.price, total: addon.price * duration } : null;
      }).filter(Boolean),
      equipment: selectedEquipmentIds.map((id) => {
        const eq = equipmentCatalog.find((e) => e.id === id);
        if (eq) {
          const rate = getEquipmentHourlyRate(eq);
          return { id: eq.id, name: eq.name, price: rate, total: rate * duration };
        }
        return null;
      }).filter(Boolean),
      subtotal,
      gst,
      estimatedTotal: finalTotal,
    };

    const metadata = {
      estimatedBreakdown: breakdown,
      quotationAmount: Math.round(finalTotal),
      paymentStatus: 'PENDING',
    };

    const combinedNotes = `${userNotes}\n---METADATA---\n${JSON.stringify(metadata)}`;

    showLoader('Reserving studio slot...');
    try {
      const res = await fetch('/api/client/studio/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateTime: bookingTime.toISOString(),
          durationHours: duration,
          purpose,
          notes: combinedNotes,
          equipmentIds: selectedEquipmentIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.message || 'Studio booking failed. Please try again.';
        setFormError(errorMsg);
        // For booking conflicts, the inline error is sufficient — skip the toast
        // to avoid overwhelming the user with duplicate error messages.
        if (data.error !== 'booking_conflict') {
          toast.error(errorMsg);
        }
        hideLoader();
        return;
      }

      toast.success('Studio slot reserved successfully!');
      setIsDialogOpen(false);
      // Reset form
      setDate('');
      setHour('');
      setMinute('');
      setAmpm('');
      setSelectedPackageId((packages.find((p) => p.is_best_value) ?? packages[0])?.id ?? '');
      setHourlyDuration('2');
      setSelectedAddOns([]);
      setPurpose('');
      setNotes('');
      setSelectedEquipmentIds([]);
      fetchBookings();
    } catch (error: any) {
      logger.error('Unexpected booking error:', error);
      setFormError('An unexpected error occurred while reserving the slot.');
      toast.error('Could not reserve studio slot.');
    } finally {
      hideLoader();
      setIsSubmitting(false);
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
            Shoot Completed & Delivered
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
              <span>{formatDate12h(val)}</span>
            </div>
            <div className="text-slate-400 pl-5">
              {formatTime12h(val)} - {formatTime12h(end.toISOString())} ({duration} hrs)
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
        const list = (row.getValue('equipments') as StudioEquipment[]) || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {list.map((eq) => (
              <span
                key={eq.id}
                className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold truncate max-w-full uppercase inline-block"
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
      id: 'payments',
      header: 'Payments & Quotation',
      cell: ({ row }) => {
        const { metadata } = parseNotesMetadata(row.original.notes);
        const quotation = metadata.quotationAmount !== undefined ? Number(metadata.quotationAmount) : null;
        const advance = metadata.advancePaid !== undefined ? Number(metadata.advancePaid) : null;
        const paid = Number(row.original.amountPaid || 0);
        const balance = quotation !== null && row.original.status !== 'CANCELLED' ? Math.max(0, quotation - paid) : null;
        const extra = Number(row.original.additionalCharges || 0);
        const estTotal = metadata.estimatedBreakdown?.estimatedTotal !== undefined ? Number(metadata.estimatedBreakdown.estimatedTotal) : null;
        const isPending = row.original.status === 'PENDING';

        return (
          <div className="text-xs space-y-1 py-1">
            {isPending ? (
              (estTotal !== null || quotation !== null) && (
                <div className="text-slate-300 font-medium">
                  Est. Total: <span className="text-amber-500 font-bold">₹{Math.round(estTotal ?? quotation ?? 0).toLocaleString('en-IN')}</span>
                </div>
              )
            ) : (
              quotation !== null && (
                <div className="text-slate-300 font-medium">
                  Quotation: <span className="text-white">₹{quotation.toLocaleString('en-IN')}</span>
                </div>
              )
            )}
            {advance !== null && advance > 0 && (
              <div className="text-slate-400">
                Advance: <span className="text-slate-300">₹{advance.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="text-slate-400">
              Paid: <span className="font-semibold text-white">₹{paid.toLocaleString('en-IN')}</span>
            </div>
            {extra > 0 && (
              <div className="text-rose-400 font-medium">
                Add-on: ₹{extra.toLocaleString('en-IN')}
              </div>
            )}
            {balance !== null && balance > 0 && (
              <div className="text-slate-400 font-medium">
                Balance:{' '}
                <span className="text-amber-500 font-bold">₹{balance.toLocaleString('en-IN')}</span>
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
        const rawNotes = row.getValue('notes') as string | null;
        if (!rawNotes) return <span className="text-xs text-slate-500">-</span>;
        const { userNotes } = parseNotesMetadata(rawNotes);
        if (!userNotes) return <span className="text-xs text-slate-500">-</span>;
        
        const lines = userNotes.split('\n');
        return (
          <div className="flex flex-col text-[11px] space-y-1 max-w-[220px] max-h-[100px] overflow-y-auto custom-scrollbar pr-1 break-words" title={userNotes}>
            {lines.map((line, idx) => {
              if (line.startsWith('Package:')) {
                return (
                  <div key={idx} className="text-slate-300 font-medium">
                    <span className="text-amber-500 font-semibold">Pkg:</span> {line.replace('Package:', '').trim()}
                  </div>
                );
              }
              if (line.startsWith('Add-ons:')) {
                return (
                  <div key={idx} className="text-slate-400">
                    <span className="text-slate-500 font-semibold">Add:</span> {line.replace('Add-ons:', '').trim()}
                  </div>
                );
              }
              if (line.startsWith('Instructions:')) {
                return (
                  <div key={idx} className="text-slate-400 italic font-light whitespace-pre-line">
                    <span className="text-slate-500 font-semibold">Inst:</span> {line.replace('Instructions:', '').trim()}
                  </div>
                );
              }
              return (
                <div key={idx} className="text-slate-400 whitespace-pre-line">
                  {line}
                </div>
              );
            })}
          </div>
        );
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
          <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-lg w-full p-6 shadow-2xl rounded-2xl overflow-y-auto max-h-[85vh] custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Home className="h-5 w-5 text-amber-500" />
                Book Studio Floor
              </DialogTitle>
              <div className="flex flex-col gap-1 mt-1 text-left">
                <span className="text-amber-400 text-xs font-semibold tracking-wider uppercase">1200 Sq Ft | RS Puram | Coimbatore</span>
                <span className="text-slate-400 text-[11px]">A Professional Photography Studio Built for Creators. Book by the hour, half day, or full day.</span>
              </div>
            </DialogHeader>

            <form onSubmit={handleBookStudio} className="space-y-4 mt-2">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold">Booking Unavailable</p>
                    <p className="text-rose-300/80 leading-relaxed">{formError}</p>
                  </div>
                </div>
              )}
              <div className="space-y-4">
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
                    Date & Start Time *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-amber-500 pointer-events-none" />
                    <input
                      type="date"
                      id="shootDate"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setDate(e.target.value);
                        if (formError) setFormError('');
                      }}
                      onClick={(e) => {
                        try {
                          e.currentTarget.showPicker();
                        } catch (err) {}
                      }}
                      style={{ colorScheme: 'dark' }}
                      className="flex h-9 w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-3 py-1 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select value={hour} onValueChange={(val) => { setHour(val); if(formError) setFormError(''); }}>
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

                    <div className="w-[84px] shrink-0">
                      <Select value={ampm} onValueChange={(val) => { setAmpm(val); if(formError) setFormError(''); }}>
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
                  {date && hour && ampm && (
                    <div className="text-[10px] text-amber-400 mt-1 pl-1 font-medium flex flex-col gap-0.5">
                      <span className="text-slate-400 text-[9.5px]">
                        Session duration: {isHourlyMetered ? `${hourlyDuration} hours` : `${packageHours} hours (${selectedPackage?.name ?? ''})`}
                        {selectedAddOns.length > 0 && ` • with ${selectedAddOns.map(id => addOns.find(a => a.id === id)?.name).join(', ')}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="purpose" className="text-xs font-semibold text-slate-300">Purpose of Session *</Label>
                  <div className="relative">
                    <Clapperboard className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="purpose"
                      value={purpose}
                      placeholder="e.g. Portrait photoshoot, YouTube video, podcast episode"
                      onChange={(e) => setPurpose(e.target.value)}
                      className="bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white pl-9 rounded-lg h-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    Select Studio Rental Package *
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    {packages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id;
                      const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`cursor-pointer transition-all duration-200 rounded-xl border p-3 flex items-center justify-between gap-4 text-left select-none
                            ${
                              isSelected
                                ? 'border-amber-500 bg-amber-500/10 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                : 'border-slate-800 bg-slate-950 hover:bg-slate-900/50 text-slate-400'
                            }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white block">{pkg.name}</span>
                              <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500">
                                <Clock className="w-2.5 h-2.5" />
                                {pkg.duration_label}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{pkg.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-baseline gap-1.5 justify-end">
                              <span className="text-[11px] font-medium text-slate-300 line-through decoration-rose-500/70">{formatINR(pkg.original_price)}</span>
                              <span className="text-sm font-extrabold text-amber-500">{formatINR(pkg.price)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {isHourlyMetered && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <Label htmlFor="hourlyDuration" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      Specify Hours *
                    </Label>
                    <Input
                      type="number"
                      id="hourlyDuration"
                      min="1"
                      max="24"
                      placeholder="Number of hours"
                      value={hourlyDuration}
                      onChange={(e) => setHourlyDuration(e.target.value)}
                      className="bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white rounded-lg h-9"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    Add-ons (Optional)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {addOns.map((addon) => {
                      const isSelected = selectedAddOns.includes(addon.id);
                      return (
                        <label
                          key={addon.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all duration-200 select-none
                            ${isSelected ? 'border-amber-500 bg-amber-500/5 text-white' : 'border-slate-800 bg-slate-950 hover:bg-slate-900/50'}`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-950"
                              checked={isSelected}
                              onChange={() => toggleAddOn(addon.id)}
                            />
                            <span className="text-[11px] font-medium text-slate-300">{addon.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            +₹{addon.price}/hr
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-col">
                    <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      In-Studio Equipment Add-ons *
                    </Label>
                    <span className="text-[10px] text-slate-500">Rent gear directly for your studio session (Select at least one)</span>
                  </div>
                  <div className="border border-slate-800 rounded-xl bg-slate-950 p-3 max-h-56 overflow-y-auto space-y-4 custom-scrollbar">
                    {equipmentCatalog.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-4">No active studio accessories found.</p>
                    ) : (
                      (() => {
                        // Identical category filter to StudioPricingEngine on /studiospace.
                        // Only items whose category_name matches one of the 5 known keys appear —
                        // this keeps the booking form in sync with what the public page shows.
                        const STUDIO_CATS = [
                          { title: 'Cameras',    key: 'camera' },
                          { title: 'Lenses',     key: 'lens'   },
                          { title: 'Lighting',   key: 'light'  },
                          { title: 'Audio / Mic',key: 'audio'  },
                          { title: 'Others',     key: 'other'  },
                        ];
                        return STUDIO_CATS.map((cat) => {
                          const items = equipmentCatalog.filter((e) => {
                            // Mirror StudioPricingEngine exactly:
                            // category_name (flat col) → categories.name (joined) → ''
                            const catName =
                              (e as any).category_name?.toLowerCase() ||
                              (e as any).categories?.name?.toLowerCase() ||
                              (e as any).categoryName?.toLowerCase() ||
                              '';
                            return catName.includes(cat.key);
                          });
                          if (items.length === 0) return null;
                          return (
                            <div key={cat.key} className="space-y-1.5">
                              <h5 className="text-[10px] font-bold tracking-wider text-amber-500 uppercase border-b border-slate-800/60 pb-0.5">
                                {cat.title}
                              </h5>
                              <div className="space-y-1">
                                {items.map((item) => {
                                  const isSelected = selectedEquipmentIds.includes(item.id);
                                  const hourlyRate = getEquipmentHourlyRate(item);
                                  return (
                                    <label
                                      key={item.id}
                                      className="flex items-start gap-2.5 p-1 rounded hover:bg-slate-900/50 cursor-pointer transition-colors select-none"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleEquipmentSelection(item.id)}
                                        className="mt-0.5 h-3.5 w-3.5 rounded border-slate-800 text-amber-500 focus:ring-amber-500 bg-slate-950"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline gap-2">
                                          <span className="text-[11px] font-semibold text-white truncate">{item.name}</span>
                                          <span className="text-[10px] text-amber-400 shrink-0 font-mono">₹{hourlyRate}/hr</span>
                                        </div>
                                        {item.description && (
                                          <span className="text-[9px] text-slate-400 block truncate">{item.description}</span>
                                        )}
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="notes" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <ClipboardList className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    Special Requests / Setup Instructions
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="notes"
                      value={notes}
                      placeholder="e.g. Please set up the white cyclorama, 3 softboxes, and have the podcast microphone stands ready."
                      onChange={(e) => setNotes(e.target.value)}
                      className="bg-slate-950 border-slate-800 focus:border-amber-550/50 text-white pl-3 rounded-lg min-h-[60px] text-xs py-2 placeholder:text-[10px] placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-slate-950 to-slate-900 p-3.5 shadow-md space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-mono text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">GST (18%)</span>
                    <span className="font-mono text-slate-400">₹{Math.round(gst).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-px bg-slate-800/80" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">Estimated Total</span>
                    <span className="text-base font-bold text-amber-500 font-mono">₹{Math.round(finalTotal).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg">
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
        <div className="space-y-8">
          {pendingRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold tracking-wider text-amber-400 uppercase">
                Studio Booking Requests (Pending Approval)
              </h3>
              <BookingTable columns={columns} data={pendingRequests} emptyMessage="No pending studio space requests." />
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
              Confirmed Reservations
            </h3>
            <BookingTable
              columns={columns}
              data={confirmedBookings}
              emptyMessage={pendingRequests.length > 0 ? "No confirmed reservations yet. Your request is pending review." : "No confirmed reservations yet."}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Custom 12-hour formatting helpers
const formatDate12h = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatTime12h = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
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


