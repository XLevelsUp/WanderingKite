'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogClose } from '@/components/ui/dialog';
import { useNotifications } from '@/components/ui/useNotifications';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface Equipment {
  id: string;
  name: string;
  description: string | null;
}

interface RentalBookingFormProps {
  equipmentCatalog: Equipment[];
  onSuccess: () => void;
}

const bookingSchema = z.object({
  startDate: z.string().min(1, 'Required'),
  startHour: z.string().min(1, 'Req'),
  startMinute: z.string().min(1, 'Req'),
  startAmpm: z.string().min(1, 'Req'),
  endDate: z.string().min(1, 'Required'),
  endHour: z.string().min(1, 'Req'),
  endMinute: z.string().min(1, 'Req'),
  endAmpm: z.string().min(1, 'Req'),
  purpose: z.string().optional(),
  equipmentIds: z.array(z.string()).min(1, 'Select at least one equipment item'),
}).refine(data => {
  const formatDateTime = (dateStr: string, hourStr: string, minStr: string, ampmStr: string) => {
    if (!dateStr || !hourStr || !minStr || !ampmStr) return 0;
    let hourNum = parseInt(hourStr, 10);
    if (ampmStr === 'PM' && hourNum < 12) hourNum += 12;
    if (ampmStr === 'AM' && hourNum === 12) hourNum = 0;
    return new Date(`${dateStr}T${hourNum.toString().padStart(2, '0')}:${minStr}:00`).getTime();
  };
  const start = formatDateTime(data.startDate, data.startHour, data.startMinute, data.startAmpm);
  const end = formatDateTime(data.endDate, data.endHour, data.endMinute, data.endAmpm);
  return end > start;
}, { message: "End time must be after start time", path: ["endDate"] });

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function RentalBookingForm({ equipmentCatalog, onSuccess }: RentalBookingFormProps) {
  const { showLoader, hideLoader } = useNotifications();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      startDate: '', startHour: '', startMinute: '', startAmpm: '',
      endDate: '', endHour: '', endMinute: '', endAmpm: '',
      purpose: '', equipmentIds: [],
    }
  });

  const onSubmit = async (values: BookingFormValues) => {
    const formatDateTime = (dateStr: string, hourStr: string, minStr: string, ampmStr: string) => {
      let hourNum = parseInt(hourStr, 10);
      if (ampmStr === 'PM' && hourNum < 12) hourNum += 12;
      if (ampmStr === 'AM' && hourNum === 12) hourNum = 0;
      const h = hourNum.toString().padStart(2, '0');
      return `${dateStr}T${h}:${minStr}:00`;
    };

    const startDateTimeStr = formatDateTime(values.startDate, values.startHour, values.startMinute, values.startAmpm);
    const endDateTimeStr = formatDateTime(values.endDate, values.endHour, values.endMinute, values.endAmpm);

    if (new Date(startDateTimeStr).getTime() <= Date.now()) {
      form.setError('startDate', { message: 'Start time must be in the future' });
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
          purpose: values.purpose,
          equipmentIds: values.equipmentIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Rental booking failed');
      }

      toast.success('Equipment rental requested successfully!');
      onSuccess();
    } catch (error: any) {
      logger.error(error);
      toast.error(error.message || 'Rental booking failed.');
    } finally {
      hideLoader();
    }
  };

  const { errors } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
      {errors.root && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-shake">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errors.root.message}</span>
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
        `}</style>
        
        {/* Start Date & Time */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-amber-500" /> Start Date & Time *</span>
            {errors.startDate && <span className="text-rose-400 font-normal">{errors.startDate.message}</span>}
          </Label>
          <div className="relative mb-2">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-amber-500 pointer-events-none" />
            <Controller
              name="startDate"
              control={form.control}
              render={({ field }) => (
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...field}
                  style={{ colorScheme: 'dark' }}
                  className={`flex h-9 w-full rounded-lg border bg-slate-950 pl-10 pr-3 py-1 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50 cursor-pointer ${errors.startDate ? 'border-rose-500' : 'border-slate-800'}`}
                />
              )}
            />
          </div>
          
          <div className={`flex gap-0.5 rounded-lg border p-0.5 ${errors.startHour || errors.startMinute || errors.startAmpm ? 'border-rose-500' : 'border-slate-800 bg-slate-950'}`}>
            <div className="flex-1">
              <Controller name="startHour" control={form.control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full bg-transparent border-0 focus:ring-0 text-white h-8 text-xs px-2">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border border-slate-800 text-white max-h-[200px]">
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = (i + 1).toString().padStart(2, '0');
                      return <SelectItem key={h} value={h}>{h}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="w-[1px] bg-slate-800 mx-0.5 my-1" />
            <div className="flex-1">
              <Controller name="startMinute" control={form.control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full bg-transparent border-0 focus:ring-0 text-white h-8 text-xs px-2">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border border-slate-800 text-white max-h-[200px]">
                    {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="w-[1px] bg-slate-800 mx-0.5 my-1" />
            <div className="w-[60px] shrink-0">
              <Controller name="startAmpm" control={form.control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full bg-transparent border-0 focus:ring-0 text-white h-8 text-xs px-2">
                    <SelectValue placeholder="AM/PM" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border border-slate-800 text-white">
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>
        </div>

        {/* End Date & Time */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-amber-500" /> End Date & Time *</span>
            {errors.endDate && <span className="text-rose-400 font-normal">{errors.endDate.message}</span>}
          </Label>
          <div className="relative mb-2">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-amber-500 pointer-events-none" />
            <Controller
              name="endDate"
              control={form.control}
              render={({ field }) => (
                <input
                  type="date"
                  min={form.watch('startDate') || new Date().toISOString().split('T')[0]}
                  {...field}
                  style={{ colorScheme: 'dark' }}
                  className={`flex h-9 w-full rounded-lg border bg-slate-950 pl-10 pr-3 py-1 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50 cursor-pointer ${errors.endDate ? 'border-rose-500' : 'border-slate-800'}`}
                />
              )}
            />
          </div>
          
          <div className={`flex gap-0.5 rounded-lg border p-0.5 ${errors.endHour || errors.endMinute || errors.endAmpm ? 'border-rose-500' : 'border-slate-800 bg-slate-950'}`}>
            <div className="flex-1">
              <Controller name="endHour" control={form.control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full bg-transparent border-0 focus:ring-0 text-white h-8 text-xs px-2">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border border-slate-800 text-white max-h-[200px]">
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = (i + 1).toString().padStart(2, '0');
                      return <SelectItem key={h} value={h}>{h}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="w-[1px] bg-slate-800 mx-0.5 my-1" />
            <div className="flex-1">
              <Controller name="endMinute" control={form.control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full bg-transparent border-0 focus:ring-0 text-white h-8 text-xs px-2">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border border-slate-800 text-white max-h-[200px]">
                    {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="w-[1px] bg-slate-800 mx-0.5 my-1" />
            <div className="w-[60px] shrink-0">
              <Controller name="endAmpm" control={form.control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full bg-transparent border-0 focus:ring-0 text-white h-8 text-xs px-2">
                    <SelectValue placeholder="AM/PM" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border border-slate-800 text-white">
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="purpose" className="text-xs font-semibold text-slate-300">Rental Purpose</Label>
        <Controller name="purpose" control={form.control} render={({ field }) => (
          <Input
            id="purpose"
            {...field}
            className="bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white rounded-lg h-9"
          />
        )} />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Select Equipment Catalog *</span>
          {errors.equipmentIds && <span className="text-rose-400 font-normal">{errors.equipmentIds.message}</span>}
        </Label>
        <div className={`border rounded-xl bg-slate-950 p-3 max-h-48 overflow-y-auto space-y-2 ${errors.equipmentIds ? 'border-rose-500' : 'border-slate-800'}`}>
          {equipmentCatalog.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-4">No active rental gear available right now.</p>
          ) : (
            equipmentCatalog.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-900/50 cursor-pointer border border-transparent hover:border-slate-800 transition-colors focus-within:ring-2 focus-within:ring-amber-500"
              >
                <Controller
                  name="equipmentIds"
                  control={form.control}
                  render={({ field }) => {
                    const isChecked = field.value.includes(item.id);
                    return (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            field.onChange([...field.value, item.id]);
                          } else {
                            field.onChange(field.value.filter((id) => id !== item.id));
                          }
                        }}
                        className="mt-1 h-4 w-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-950 bg-slate-950"
                      />
                    );
                  }}
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
  );
}
