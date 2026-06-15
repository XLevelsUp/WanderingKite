'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Film,
  Home,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Check,
  X,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  ChevronDown,
  Lock,
  Unlock,
  AlertTriangle,
  MapPin,
  CircleDollarSign,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useNotifications } from '@/components/ui/useNotifications';

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
  amountPaid: number | string;
  advancePaid: number | string;
  album?: AlbumDetail | null;
}

interface Equipment {
  id: string;
  name: string;
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
  damageCost: number | string | null;
  damageDescription: string | null;
  agreementUrl: string | null;
  equipments: Equipment[];
}

interface StudioBooking {
  id: string;
  dateTime: string;
  durationHours: number;
  purpose: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  amountPaid: number | string;
  additionalCharges: number | string;
  notes: string | null;
  equipments: Equipment[];
}

interface ClientProfile {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  isActive: boolean;
  createdAt: string;
}

interface IdProof {
  id: string;
  idType: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectReason: string | null;
  fileUrl: string;
}

interface ClientDetailsViewProps {
  client: ClientProfile;
  services: string[];
  idProof: IdProof | null;
  photographyBookings: PhotographyBooking[];
  rentalBookings: RentalBooking[];
  studioBookings: StudioBooking[];
}

export default function ClientDetailsView({
  client: initialClient,
  services,
  idProof: initialIdProof,
  photographyBookings: initialPhotographyBookings,
  rentalBookings: initialRentalBookings,
  studioBookings: initialStudioBookings,
}: ClientDetailsViewProps) {
  const router = useRouter();
  const { showLoader, hideLoader } = useNotifications();

  // Local state for toggling views and tracking operations
  const [client, setClient] = useState<ClientProfile>(initialClient);
  const [idProof, setIdProof] = useState<IdProof | null>(initialIdProof);
  const [photographyBookings, setPhotographyBookings] = useState<PhotographyBooking[]>(initialPhotographyBookings);
  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>(initialRentalBookings);
  const [studioBookings, setStudioBookings] = useState<StudioBooking[]>(initialStudioBookings);

  // Reject ID State
  const [isRejectingId, setIsRejectingId] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Complete Photography Shoot Dialog State
  const [isPhotoCompleteOpen, setIsPhotoCompleteOpen] = useState(false);
  const [activePhotoBookingId, setActivePhotoBookingId] = useState<string | null>(null);
  const [albumName, setAlbumName] = useState('');
  const [albumLink, setAlbumLink] = useState('');
  const [photoError, setPhotoError] = useState('');

  // Complete/Damage Rental Dialog State
  const [isRentalUpdateOpen, setIsRentalUpdateOpen] = useState(false);
  const [activeRentalBooking, setActiveRentalBooking] = useState<RentalBooking | null>(null);
  const [rentalStatus, setRentalStatus] = useState<'RETURNED' | 'DAMAGED'>('RETURNED');
  const [returnCondition, setReturnCondition] = useState('');
  const [damageCost, setDamageCost] = useState('');
  const [damageDescription, setDamageDescription] = useState('');
  const [agreementUrlInput, setAgreementUrlInput] = useState('');
  const [rentalError, setRentalError] = useState('');

  // Booking Update Dialog State
  const [isBookingUpdateOpen, setIsBookingUpdateOpen] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [activeBookingType, setActiveBookingType] = useState<'PHOTOGRAPHY' | 'STUDIO' | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('PENDING');
  const [updateAmountPaid, setUpdateAmountPaid] = useState('');
  const [updateAdvancePaid, setUpdateAdvancePaid] = useState('');
  const [updateQuotationAmount, setUpdateQuotationAmount] = useState('');
  const [updatePaymentStatus, setUpdatePaymentStatus] = useState<'COMPLETED' | 'PARTIALLY_COMPLETED' | 'PENDING'>('PARTIALLY_COMPLETED');
  const [bookingUpdateError, setBookingUpdateError] = useState('');

  const activeBooking = activeBookingType === 'PHOTOGRAPHY'
    ? photographyBookings.find((b) => b.id === activeBookingId)
    : studioBookings.find((b) => b.id === activeBookingId);

  const pendingPhotography = photographyBookings.filter((b) => b.status === 'PENDING');
  const confirmedPhotography = photographyBookings.filter((b) => b.status !== 'PENDING');

  const pendingStudio = studioBookings.filter((b) => b.status === 'PENDING');
  const confirmedStudio = studioBookings.filter((b) => b.status !== 'PENDING');

  const pendingRentals = rentalBookings.filter((b) => b.status === 'PENDING');
  const confirmedRentals = rentalBookings.filter((b) => b.status !== 'PENDING');

  const renderPhotographyBookingItem = (booking: any) => {
    const { userNotes, metadata } = parseNotesMetadata(booking.notes);
    
    return (
      <div
        key={booking.id}
        className="p-3.5 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all duration-200 text-xs w-full"
      >
        <div className="space-y-1 w-full sm:max-w-[70%]">
          <div className="font-semibold text-white">
            {formatDateTime12h(booking.dateTime)}
          </div>
          <div className="text-slate-400">
            Type: <span className="text-slate-200">{booking.sessionType}</span> | Location:{' '}
            <span className="text-slate-200">{booking.location}</span>
          </div>
          {userNotes && <div className="text-[10px] text-slate-500 italic max-w-sm">"{userNotes}"</div>}
          
          {/* Payment & Quotation details: Visible only to Super Admin */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5 text-[11px] text-slate-450 bg-slate-900/40 p-2 rounded-lg border border-slate-850/50 w-full sm:w-fit">
            {metadata.quotationAmount !== undefined && (
              <span>Quotation: <span className="font-semibold text-white">₹{metadata.quotationAmount}</span></span>
            )}
            {booking.advancePaid !== undefined && Number(booking.advancePaid) > 0 && (
              <span>Advance Recd: <span className="font-semibold text-slate-300">₹{booking.advancePaid}</span></span>
            )}
            <span>Total Paid: <span className="font-semibold text-slate-300">₹{booking.amountPaid || 0}</span></span>
            
            {/* Outstanding Balance */}
            {metadata.quotationAmount !== undefined && (
              <span className="font-medium">
                Balance:{' '}
                <span className={Number(metadata.quotationAmount) - Number(booking.amountPaid || 0) > 0 ? 'text-amber-500 font-bold' : 'text-emerald-500'}>
                  ₹{Math.max(0, Number(metadata.quotationAmount) - Number(booking.amountPaid || 0))}
                </span>
              </span>
            )}

            {metadata.paymentStatus && (
              <Badge className={`py-0.5 px-1.5 text-[9px] uppercase font-bold rounded ${
                booking.status === 'CANCELLED' && (Number(booking.advancePaid || 0) > 0 || Number(booking.amountPaid || 0) > 0)
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : metadata.paymentStatus === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : metadata.paymentStatus === 'PENDING'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {booking.status === 'CANCELLED' && (Number(booking.advancePaid || 0) > 0 || Number(booking.amountPaid || 0) > 0)
                  ? 'Cancelled (Retained Advance)'
                  : metadata.paymentStatus === 'COMPLETED'
                  ? 'Paid Fully'
                  : metadata.paymentStatus === 'PENDING'
                  ? 'Payment Pending'
                  : 'Partial'}
              </Badge>
            )}
          </div>

          {booking.album && (
            <div className="pt-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <a
                href={booking.album.downloadLink || ''}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-400 font-semibold inline-flex items-center gap-0.5"
              >
                Album: {booking.album.name}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-850/50 w-full sm:w-auto">
          <div>
            {booking.status === 'PENDING' && (
              <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px]">
                Pending
              </Badge>
            )}
            {booking.status === 'CONFIRMED' && (
              <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px]">
                Confirmed
              </Badge>
            )}
            {booking.status === 'COMPLETED' && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                Completed & Delivered
              </Badge>
            )}
            {booking.status === 'CANCELLED' && (
              <Badge className="bg-slate-800 text-slate-450 border border-slate-700 px-2 py-0.5 rounded text-[10px]">
                Cancelled
              </Badge>
            )}
          </div>

          {booking.status !== 'CANCELLED' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-800 hover:bg-slate-900 text-[10px] h-6 py-0.5 px-2 rounded">
                  Update
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-950 border border-slate-855 text-white text-xs">
                {booking.status !== 'COMPLETED' ? (
                  <>
                    {booking.status === 'PENDING' && (
                      <DropdownMenuItem
                        onClick={() => {
                          setActiveBookingId(booking.id);
                          setActiveBookingType('PHOTOGRAPHY');
                          setUpdateStatus('CONFIRMED');
                          
                          const { metadata: meta } = parseNotesMetadata(booking.notes);
                          setUpdateQuotationAmount(String(meta.quotationAmount || ''));
                          setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                          setUpdateAmountPaid(String(booking.amountPaid || '0'));
                          setUpdateAdvancePaid(String(booking.advancePaid || '0'));
                          setBookingUpdateError('');
                          setIsBookingUpdateOpen(true);
                        }}
                      >
                        Confirm & Collect Advance
                      </DropdownMenuItem>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setActiveBookingId(booking.id);
                            setActiveBookingType('PHOTOGRAPHY');
                            setUpdateStatus('CONFIRMED');
                            const { metadata: meta } = parseNotesMetadata(booking.notes);
                            setUpdateQuotationAmount(String(meta.quotationAmount || ''));
                            setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                            setUpdateAmountPaid(String(booking.amountPaid || '0'));
                            setUpdateAdvancePaid(String(booking.advancePaid || '0'));
                            setBookingUpdateError('');
                            setIsBookingUpdateOpen(true);
                          }}
                        >
                          Update Payments
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setActivePhotoBookingId(booking.id);
                            const { metadata: meta } = parseNotesMetadata(booking.notes);
                            setUpdateQuotationAmount(String(meta.quotationAmount || ''));
                            setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                            setUpdateAmountPaid(String(booking.amountPaid || '0'));
                            setUpdateAdvancePaid(String(booking.advancePaid || '0'));
                            setAlbumName(booking.album?.name || '');
                            setAlbumLink(booking.album?.downloadLink || '');
                            setPhotoError('');
                            setIsPhotoCompleteOpen(true);
                          }}
                        >
                          Mark Completed (Deliver Album)
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => {
                        setActiveBookingId(booking.id);
                        setActiveBookingType('PHOTOGRAPHY');
                        setUpdateStatus('CANCELLED');
                        
                        const { metadata: meta } = parseNotesMetadata(booking.notes);
                        setUpdateQuotationAmount(String(meta.quotationAmount || ''));
                        setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                        setUpdateAmountPaid(String(booking.amountPaid || '0'));
                        setUpdateAdvancePaid(String(booking.advancePaid || '0'));
                        setBookingUpdateError('');
                        setIsBookingUpdateOpen(true);
                      }}
                      className="text-rose-400 hover:bg-rose-500/10"
                    >
                      Cancel Session
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={() => {
                      setActiveBookingId(booking.id);
                      setActiveBookingType('PHOTOGRAPHY');
                      setUpdateStatus('COMPLETED');
                      
                      const { metadata: meta } = parseNotesMetadata(booking.notes);
                      setUpdateQuotationAmount(String(meta.quotationAmount || ''));
                      setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                      setUpdateAmountPaid(String(booking.amountPaid || '0'));
                      setUpdateAdvancePaid(String(booking.advancePaid || '0'));
                      setBookingUpdateError('');
                      setIsBookingUpdateOpen(true);
                    }}
                  >
                    Update Payments
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  const renderStudioBookingItem = (booking: any) => {
    const { userNotes, metadata } = parseNotesMetadata(booking.notes);

    return (
      <div
        key={booking.id}
        className="p-3.5 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all duration-200 text-xs w-full"
      >
        <div className="space-y-1 w-full sm:max-w-[70%]">
          <div className="font-semibold text-white">
            {formatDateTime12h(booking.dateTime)} ({booking.durationHours} hrs)
          </div>
          <div className="text-slate-400">
            Purpose: <span className="text-slate-200">{booking.purpose}</span>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {booking.equipments.map((eq: any) => (
              <span
                key={eq.id}
                className="bg-slate-900 text-slate-355 border border-slate-800 px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold shrink-0"
              >
                {eq.name}
              </span>
            ))}
          </div>
          {userNotes && <div className="text-[10px] text-slate-500 italic max-w-sm whitespace-pre-line break-words">"{userNotes}"</div>}

          {/* Cost breakdown from estimatedBreakdown if available */}
          {metadata.estimatedBreakdown && (
            <div className="mt-3.5 p-3.5 rounded-xl border border-slate-850 bg-slate-950 text-[11px] text-slate-400 space-y-2 max-w-sm shadow-inner">
              <div className="text-amber-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-800 pb-1 flex items-center gap-1.5">
                <CircleDollarSign className="h-3.5 w-3.5" />
                Estimated Price Breakdown
              </div>
              <div className="space-y-1">
                {metadata.estimatedBreakdown.package && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span>
                      Package: {metadata.estimatedBreakdown.package.name}{' '}
                      <span className="text-[10px] text-slate-500 font-mono">
                        (₹{metadata.estimatedBreakdown.package.price} x {metadata.estimatedBreakdown.packageHours} hrs)
                      </span>
                    </span>
                    <span className="font-mono font-medium text-white">₹{metadata.estimatedBreakdown.packageTotal}</span>
                  </div>
                )}
                {metadata.estimatedBreakdown.addOns && metadata.estimatedBreakdown.addOns.length > 0 && (
                  <div className="space-y-1 pt-0.5">
                    {metadata.estimatedBreakdown.addOns.map((add: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-slate-300 pl-2 border-l border-slate-800">
                        <span>
                          {add.name}{' '}
                          <span className="text-[10px] text-slate-500 font-mono">
                            (₹{add.price} x {metadata.estimatedBreakdown.packageHours} hrs)
                          </span>
                        </span>
                        <span className="font-mono text-slate-200">₹{add.total}</span>
                      </div>
                    ))}
                  </div>
                )}
                {metadata.estimatedBreakdown.equipment && metadata.estimatedBreakdown.equipment.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[9.5px] font-semibold text-slate-500 block">Equipment:</span>
                    {metadata.estimatedBreakdown.equipment.map((eq: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-slate-300 pl-2 border-l border-slate-800">
                        <span>
                          {eq.name}{' '}
                          <span className="text-[10px] text-slate-500 font-mono">
                            (₹{eq.price} x {metadata.estimatedBreakdown.packageHours} hrs)
                          </span>
                        </span>
                        <span className="font-mono text-slate-200">₹{eq.total}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="h-px bg-slate-800/80 my-1.5" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450">Subtotal</span>
                <span className="font-mono font-semibold text-slate-200">₹{Math.round(metadata.estimatedBreakdown.subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450">GST (18%)</span>
                <span className="font-mono text-slate-300">₹{Math.round(metadata.estimatedBreakdown.gst).toLocaleString('en-IN')}</span>
              </div>
              <div className="h-px bg-slate-800/80 my-1.5" />
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-white">Estimated Total</span>
                <span className="text-amber-500 font-mono">₹{Math.round(metadata.estimatedBreakdown.estimatedTotal).toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {/* Payment & Quotation details: Visible only to Super Admin */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[11px] text-slate-450 bg-slate-900/40 p-2 rounded-lg border border-slate-850/50 w-full sm:w-fit">
            {metadata.quotationAmount !== undefined && (
              <span>Quotation: <span className="font-semibold text-white">₹{metadata.quotationAmount}</span></span>
            )}
            {metadata.advancePaid !== undefined && Number(metadata.advancePaid) > 0 && (
              <span>Advance Recd: <span className="font-semibold text-slate-300">₹{metadata.advancePaid}</span></span>
            )}
            <span>Total Paid: <span className="font-semibold text-slate-300">₹{booking.amountPaid || 0}</span></span>
            
            {/* Outstanding Balance */}
            {metadata.quotationAmount !== undefined && booking.status !== 'CANCELLED' && (
              <span className="font-medium">
                Balance:{' '}
                <span className={Number(metadata.quotationAmount) - Number(booking.amountPaid || 0) > 0 ? 'text-amber-500 font-bold' : 'text-emerald-500'}>
                  ₹{Math.max(0, Number(metadata.quotationAmount) - Number(booking.amountPaid || 0))}
                </span>
              </span>
            )}

            {metadata.paymentStatus && (
              <Badge className={`py-0.5 px-1.5 text-[9px] uppercase font-bold rounded ${
                booking.status === 'CANCELLED' && (Number(metadata.advancePaid || 0) > 0 || Number(booking.amountPaid || 0) > 0)
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : metadata.paymentStatus === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : metadata.paymentStatus === 'PENDING'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {booking.status === 'CANCELLED' && (Number(metadata.advancePaid || 0) > 0 || Number(booking.amountPaid || 0) > 0)
                  ? 'Cancelled (Retained Advance)'
                  : metadata.paymentStatus === 'COMPLETED'
                  ? 'Paid Fully'
                  : metadata.paymentStatus === 'PENDING'
                  ? 'Payment Pending'
                  : 'Partial'}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-850/50 w-full sm:w-auto">
          <div>
            {booking.status === 'PENDING' && (
              <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px]">
                Pending
              </Badge>
            )}
            {booking.status === 'CONFIRMED' && (
              <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px]">
                Confirmed
              </Badge>
            )}
            {booking.status === 'COMPLETED' && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                Completed & Delivered
              </Badge>
            )}
            {booking.status === 'CANCELLED' && (
              <Badge className="bg-slate-800 text-slate-450 border border-slate-700 px-2 py-0.5 rounded text-[10px]">
                Cancelled
              </Badge>
            )}
          </div>

          {booking.status !== 'CANCELLED' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-800 hover:bg-slate-900 text-[10px] h-6 py-0.5 px-2 rounded">
                  Update
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-950 border border-slate-855 text-white text-xs">
                {booking.status !== 'COMPLETED' ? (
                  <>
                    {booking.status === 'PENDING' && (
                      <DropdownMenuItem
                        onClick={() => {
                          setActiveBookingId(booking.id);
                          setActiveBookingType('STUDIO');
                          setUpdateStatus('CONFIRMED');
                          
                          const { metadata: meta } = parseNotesMetadata(booking.notes);
                          setUpdateQuotationAmount(String(meta.quotationAmount || ''));
                          setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                          setUpdateAmountPaid(String(booking.amountPaid || '0'));
                          setUpdateAdvancePaid(String(meta.advancePaid || '0'));
                          setBookingUpdateError('');
                          setIsBookingUpdateOpen(true);
                        }}
                      >
                        Confirm & Collect Advance
                      </DropdownMenuItem>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setActiveBookingId(booking.id);
                            setActiveBookingType('STUDIO');
                            setUpdateStatus('CONFIRMED');
                            const { metadata: meta } = parseNotesMetadata(booking.notes);
                            setUpdateQuotationAmount(String(meta.quotationAmount || ''));
                            setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                            setUpdateAmountPaid(String(booking.amountPaid || '0'));
                            setUpdateAdvancePaid(String(meta.advancePaid || '0'));
                            setBookingUpdateError('');
                            setIsBookingUpdateOpen(true);
                          }}
                        >
                          Update Payments
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setActiveBookingId(booking.id);
                            setActiveBookingType('STUDIO');
                            setUpdateStatus('COMPLETED');
                            const { metadata: meta } = parseNotesMetadata(booking.notes);
                            setUpdateQuotationAmount(String(meta.quotationAmount || ''));
                            setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                            setUpdateAmountPaid(String(booking.amountPaid || '0'));
                            setUpdateAdvancePaid(String(meta.advancePaid || '0'));
                            setBookingUpdateError('');
                            setIsBookingUpdateOpen(true);
                          }}
                        >
                          Mark Completed
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => {
                        setActiveBookingId(booking.id);
                        setActiveBookingType('STUDIO');
                        setUpdateStatus('CANCELLED');
                        
                        const { metadata: meta } = parseNotesMetadata(booking.notes);
                        setUpdateQuotationAmount(String(meta.quotationAmount || ''));
                        setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                        setUpdateAmountPaid(String(booking.amountPaid || '0'));
                        setUpdateAdvancePaid(String(meta.advancePaid || '0'));
                        setBookingUpdateError('');
                        setIsBookingUpdateOpen(true);
                      }}
                      className="text-rose-400 hover:bg-rose-500/10"
                    >
                      Cancel Booking
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={() => {
                      setActiveBookingId(booking.id);
                      setActiveBookingType('STUDIO');
                      setUpdateStatus('COMPLETED');
                      
                      const { metadata: meta } = parseNotesMetadata(booking.notes);
                      setUpdateQuotationAmount(String(meta.quotationAmount || ''));
                      setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                      setUpdateAmountPaid(String(booking.amountPaid || '0'));
                      setUpdateAdvancePaid(String(meta.advancePaid || '0'));
                      setBookingUpdateError('');
                      setIsBookingUpdateOpen(true);
                    }}
                  >
                    Update Payments
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  const renderRentalBookingItem = (booking: any) => {
    const idNotVerified = !idProof || idProof.status !== 'VERIFIED';
    return (
      <div
        key={booking.id}
        className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs w-full"
      >
        <div className="space-y-1 w-full sm:max-w-[70%]">
          <div className="font-semibold text-white">
            Out: {formatDateTime12h(booking.startDate)}
          </div>
          <div className="text-slate-400">
            In: {formatDateTime12h(booking.endDate)}
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {booking.equipments.map((eq: any) => (
              <span
                key={eq.id}
                className="bg-slate-900 text-slate-355 border border-slate-800 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold shrink-0"
              >
                {eq.name}
              </span>
            ))}
          </div>
          {booking.purpose && (
            <div className="text-slate-400 pt-0.5">
              Purpose: <span className="text-slate-200">{booking.purpose}</span>
            </div>
          )}
          {booking.pickupCondition && (
            <div className="text-[10px] text-slate-400 mt-1">
              Condition: Out = <span className="text-slate-300">{booking.pickupCondition}</span>
              {booking.returnCondition && (
                <>
                  , In = <span className={booking.status === 'DAMAGED' ? 'text-rose-400 font-bold' : 'text-slate-300'}>{booking.returnCondition}</span>
                </>
              )}
            </div>
          )}
          {booking.returnedAt && (
            <div className="text-[10px] text-slate-450 mt-0.5">
              Returned at: <span className="text-slate-300">{formatDateTime12h(booking.returnedAt)}</span>
            </div>
          )}
          {booking.status === 'DAMAGED' && (
            <div className="text-[10px] text-rose-400 font-medium">
              Damage assessment charge: ₹{booking.damageCost} ({booking.damageDescription})
            </div>
          )}
          {booking.agreementUrl && (
            <div className="pt-1 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <a
                href={booking.agreementUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-400 font-semibold inline-flex items-center gap-0.5 text-[10px]"
              >
                Signed Agreement File
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          )}
          {/* ID Verification indicator for PENDING/unconfirmed rentals */}
          {booking.status === 'PENDING' && idNotVerified && (
            <div className="mt-2 flex items-center gap-1.5 p-2 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <Shield className="h-3 w-3 text-amber-500 shrink-0" />
              <span className="text-[10px] text-amber-400 font-medium">
                {!idProof ? 'No ID uploaded — verify before confirming.' : 'ID under review — verify before confirming.'}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-850/50 w-full sm:w-auto">
          {/* ID proof badge */}
          {booking.status === 'PENDING' && (
            <div>
              {!idProof && (
                <Badge className="bg-slate-800 text-slate-450 border border-slate-700 px-2 py-0.5 rounded text-[9px] flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" /> No ID
                </Badge>
              )}
              {idProof?.status === 'PENDING' && (
                <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" /> ID Pending
                </Badge>
              )}
              {idProof?.status === 'VERIFIED' && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" /> ID Verified
                </Badge>
              )}
              {idProof?.status === 'REJECTED' && (
                <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[9px] flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" /> ID Rejected
                </Badge>
              )}
            </div>
          )}

          <div>
            {booking.status === 'PENDING' && (
              <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px]">
                Pending Review
              </Badge>
            )}
            {booking.status === 'CONFIRMED' && (
              <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px]">
                Leased Out
              </Badge>
            )}
            {booking.status === 'RETURNED' && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                Returned
              </Badge>
            )}
            {booking.status === 'DAMAGED' && (
              <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px]">
                Damaged
              </Badge>
            )}
            {booking.status === 'CANCELLED' && (
              <Badge className="bg-slate-800 text-slate-450 border border-slate-700 px-2 py-0.5 rounded text-[10px]">
                Cancelled
              </Badge>
            )}
          </div>

          {booking.status !== 'RETURNED' && booking.status !== 'DAMAGED' && booking.status !== 'CANCELLED' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-800 hover:bg-slate-900 text-[10px] h-6 py-0.5 px-2 rounded">
                  Update
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-950 border border-slate-850 text-white text-xs">
                {booking.status === 'PENDING' && (
                  <DropdownMenuItem
                    onClick={() => handleConfirmRental(booking.id)}
                    disabled={idNotVerified}
                    className={idNotVerified ? 'opacity-50 cursor-not-allowed' : ''}
                    title={idNotVerified ? 'Verify client ID before confirming rental' : undefined}
                  >
                    <Shield className={`h-3 w-3 mr-1.5 ${idNotVerified ? 'text-amber-400' : 'text-emerald-400'}`} />
                    {idNotVerified ? 'ID Not Verified — Cannot Confirm' : 'Mark Picked Up (Confirm)'}
                  </DropdownMenuItem>
                )}
                {booking.status === 'CONFIRMED' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        setActiveRentalBooking(booking);
                        setRentalStatus('RETURNED');
                        setIsRentalUpdateOpen(true);
                      }}
                    >
                      Mark Returned
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setActiveRentalBooking(booking);
                        setRentalStatus('DAMAGED');
                        setIsRentalUpdateOpen(true);
                      }}
                      className="text-rose-400 hover:bg-rose-500/10"
                    >
                      Mark Returned Damaged
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };


  // Account Toggle
  const handleToggleAccount = async () => {
    const nextActiveState = !client.isActive;
    showLoader(nextActiveState ? 'Activating account...' : 'Deactivating account...');

    try {
      const res = await fetch('/api/admin/clients/toggle-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, isActive: nextActiveState }),
      });

      if (!res.ok) throw new Error('Failed to toggle active state');
      const data = await res.json();
      setClient(data.client);
      toast.success(`Account has been ${nextActiveState ? 'activated' : 'deactivated'} successfully.`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Could not update account status.');
    } finally {
      hideLoader();
    }
  };

  // Verify ID Proof
  const handleVerifyId = async (status: 'VERIFIED' | 'REJECTED') => {
    if (status === 'REJECTED' && !rejectReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }

    showLoader(status === 'VERIFIED' ? 'Approving ID...' : 'Rejecting ID...');
    try {
      const res = await fetch('/api/admin/id-proof/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          status,
          rejectReason: status === 'REJECTED' ? rejectReason : null,
        }),
      });

      if (!res.ok) throw new Error('ID status update failed');
      const data = await res.json();
      setIdProof(data.idProof);
      setIsRejectingId(false);
      setRejectReason('');
      toast.success(`ID proof successfully ${status === 'VERIFIED' ? 'Approved' : 'Rejected'}.`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Could not verify ID Proof.');
    } finally {
      hideLoader();
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (
    bookingType: 'PHOTOGRAPHY' | 'STUDIO',
    bookingId: string,
    status: 'CONFIRMED' | 'CANCELLED'
  ) => {
    showLoader('Updating status...');
    try {
      const res = await fetch('/api/admin/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingType, bookingId, status }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Booking status update failed');
      }
      
      toast.success(`Booking status set to ${status}.`);
      
      if (bookingType === 'PHOTOGRAPHY') {
        setPhotographyBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
        );
      } else {
        setStudioBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
        );
      }
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Could not update booking status.');
    } finally {
      hideLoader();
    }
  };

  // Handle Booking Update & Payments Submit
  const handleBookingUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingUpdateError('');

    if (!activeBookingId || !activeBookingType) return;

    const parsedQuotation = updateQuotationAmount === '' ? 0 : Number(updateQuotationAmount);
    const parsedAdvance = updateAdvancePaid === '' ? 0 : Number(updateAdvancePaid);
    let parsedAmount = updateAmountPaid === '' ? 0 : Number(updateAmountPaid);

    if (isNaN(parsedQuotation) || isNaN(parsedAdvance) || isNaN(parsedAmount)) {
      setBookingUpdateError('Please enter valid numeric amounts.');
      return;
    }

    // Determine amountPaid based on the booking's ORIGINAL status (before admin action)
    // activeBooking?.status reflects the pre-action state from local state arrays
    let finalPaymentStatus = updatePaymentStatus;
    if (activeBooking?.status === 'PENDING') {
      // Initial confirmation (PENDING → CONFIRMED): paid amount = advance collected now
      parsedAmount = parsedAdvance;
      finalPaymentStatus = 'PARTIALLY_COMPLETED';
    } else if (updatePaymentStatus === 'COMPLETED') {
      // Admin selected "Fully Paid" — set total to quotation
      parsedAmount = parsedQuotation;
    }
    // For CONFIRMED or COMPLETED "Update Payments", use the admin's entered amount as-is

    showLoader('Updating booking details...');
    try {
      const res = await fetch('/api/admin/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType: activeBookingType,
          bookingId: activeBookingId,
          status: updateStatus,
          amountPaid: parsedAmount,
          advancePaid: parsedAdvance,
          quotationAmount: parsedQuotation,
          paymentStatus: finalPaymentStatus,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Booking update failed');
      }

      const resData = await res.json();
      const updatedBooking = resData.booking;

      toast.success('Booking updated successfully.');
      setIsBookingUpdateOpen(false);

      if (activeBookingType === 'PHOTOGRAPHY') {
        setPhotographyBookings((prev) =>
          prev.map((b) =>
            b.id === activeBookingId
              ? {
                  ...b,
                  status: updateStatus,
                  amountPaid: parsedAmount,
                  advancePaid: parsedAdvance,
                  notes: updatedBooking?.notes || b.notes
                }
              : b
          )
        );
      } else {
        setStudioBookings((prev) =>
          prev.map((b) =>
            b.id === activeBookingId
              ? {
                  ...b,
                  status: updateStatus,
                  amountPaid: parsedAmount,
                  notes: updatedBooking?.notes || b.notes
                }
              : b
          )
        );
      }
      router.refresh();
    } catch (error: any) {
      console.error(error);
      setBookingUpdateError(error.message || 'Could not update booking.');
    } finally {
      hideLoader();
    }
  };

  // Complete Photography Booking (Save album)
  const handleCompletePhotoBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhotoError('');

    if (!albumName.trim()) {
      setPhotoError('Please enter an album name.');
      return;
    }

    const parsedQuotation = updateQuotationAmount === '' ? 0 : Number(updateQuotationAmount);
    const parsedAdvance = updateAdvancePaid === '' ? 0 : Number(updateAdvancePaid);
    let parsedAmount = updateAmountPaid === '' ? 0 : Number(updateAmountPaid);

    if (isNaN(parsedQuotation) || isNaN(parsedAdvance) || isNaN(parsedAmount)) {
      setPhotoError('Please enter valid numeric amounts.');
      return;
    }

    let finalPaymentStatus = updatePaymentStatus;
    if (updatePaymentStatus === 'COMPLETED') {
      parsedAmount = parsedQuotation; // Fully Paid: amountPaid is set to quotation
    }

    showLoader('Completing shoot & delivering album...');
    try {
      const res = await fetch('/api/admin/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType: 'PHOTOGRAPHY',
          bookingId: activePhotoBookingId,
          status: 'COMPLETED',
          albumName,
          downloadLink: albumLink || null,
          amountPaid: parsedAmount,
          advancePaid: parsedAdvance,
          quotationAmount: parsedQuotation,
          paymentStatus: finalPaymentStatus,
        }),
      });

      if (!res.ok) throw new Error('Failed to complete photography booking');
      const data = await res.json();
      const updatedBooking = data.booking;

      toast.success('Shoot marked as completed and album link delivered!');
      setIsPhotoCompleteOpen(false);
      setAlbumName('');
      setAlbumLink('');
      
      setPhotographyBookings((prev) =>
        prev.map((b) =>
          b.id === activePhotoBookingId
            ? {
                ...b,
                status: 'COMPLETED',
                amountPaid: parsedAmount,
                advancePaid: parsedAdvance,
                notes: updatedBooking?.notes || b.notes,
                album: {
                  id: '',
                  name: albumName,
                  deliveryDate: new Date().toISOString(),
                  downloadLink: albumLink || null,
                },
              }
            : b
        )
      );
      router.refresh();
    } catch (error: any) {
      console.error(error);
      setPhotoError(error.message || 'Could not complete booking.');
    } finally {
      hideLoader();
    }
  };

  // Confirm / Mark Picked Up Rental
  const handleConfirmRental = async (bookingId: string) => {
    showLoader('Marking gear as picked up...');
    try {
      const res = await fetch('/api/admin/rentals/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          status: 'CONFIRMED',
          pickupCondition: 'GOOD', // default condition
        }),
      });

      if (!res.ok) throw new Error('Rental confirmation failed');
      toast.success('Rental marked as picked up.');
      setRentalBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CONFIRMED', pickupCondition: 'GOOD' } : b))
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Could not confirm rental.');
    } finally {
      hideLoader();
    }
  };

  // Complete Return / Damage Assessment
  const handleUpdateRentalReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setRentalError('');

    if (!returnCondition.trim()) {
      setRentalError('Please enter return condition.');
      return;
    }

    if (rentalStatus === 'DAMAGED') {
      if (!damageCost) {
        setRentalError('Please enter damage charges.');
        return;
      }
      if (!damageDescription.trim()) {
        setRentalError('Please write a short damage assessment summary.');
        return;
      }
    }

    showLoader('Saving return assessment...');
    try {
      const res = await fetch('/api/admin/rentals/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeRentalBooking?.id,
          status: rentalStatus,
          returnCondition,
          damageCost: rentalStatus === 'DAMAGED' ? damageCost : null,
          damageDescription: rentalStatus === 'DAMAGED' ? damageDescription : null,
          agreementUrl: agreementUrlInput || undefined,
        }),
      });

      if (!res.ok) throw new Error('Return update failed');
      const data = await res.json();

      toast.success(`Rental returns completed as ${rentalStatus}.`);
      setIsRentalUpdateOpen(false);
      setReturnCondition('');
      setDamageCost('');
      setDamageDescription('');
      setAgreementUrlInput('');

      setRentalBookings((prev) =>
        prev.map((b) =>
          b.id === activeRentalBooking?.id
            ? {
                ...b,
                status: rentalStatus,
                returnCondition,
                damageCost: rentalStatus === 'DAMAGED' ? Number(damageCost) : null,
                damageDescription: rentalStatus === 'DAMAGED' ? damageDescription : null,
                agreementUrl: agreementUrlInput || b.agreementUrl,
                returnedAt: new Date().toISOString(),
              }
            : b
        )
      );
      router.refresh();
    } catch (error: any) {
      console.error(error);
      setRentalError(error.message || 'Could not save return record.');
    } finally {
      hideLoader();
    }
  };

  const clientName = client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unnamed';

  return (
    <div className="space-y-8 text-slate-100">
      {/* Top Banner & Profile Overview */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{clientName}</h1>
          <p className="text-slate-400 mt-2 flex items-center gap-1.5 text-sm">
            <User className="h-4 w-4 text-amber-500" />
            Registered client since {formatDateStable(client.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            onClick={handleToggleAccount}
            variant="outline"
            className={`w-full md:w-auto rounded-lg border-slate-800 hover:text-white ${
              client.isActive
                ? 'hover:bg-rose-500/10 hover:border-rose-500/20 text-rose-400'
                : 'hover:bg-emerald-500/10 hover:border-emerald-500/20 text-emerald-400'
            }`}
          >
            {client.isActive ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Deactivate Account
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Activate Account
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Contact Info & ID Verification */}
        <div className="space-y-6 lg:col-span-1">
          {/* Profile Card */}
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Contact details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-350">
              <div className="flex items-center gap-3">
                <Mail className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4.5 w-4.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{client.address}</span>
                </div>
              )}
              {client.dateOfBirth && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                  <span>DOB: {formatDateStable(client.dateOfBirth)}</span>
                </div>
              )}
              {client.gender && (
                <div className="flex items-center gap-3">
                  <User className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                  <span className="capitalize">Gender: {client.gender.toLowerCase()}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs text-slate-500 font-semibold uppercase">Interested Services</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {services.map((svc) => (
                    <Badge
                      key={svc}
                      variant="outline"
                      className="text-[10px] uppercase border-slate-800 bg-slate-950 text-slate-400 px-2 py-0.5 rounded"
                    >
                      {svc.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Verification Panel */}
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-amber-500" />
                ID Proof Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {!idProof ? (
                <div className="text-center py-6 text-slate-500 italic text-xs">No ID documents uploaded yet.</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">Document Type</span>
                    <span className="font-semibold text-white text-xs bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded-full">
                      {idProof.idType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">Verification Status</span>
                    {idProof.status === 'VERIFIED' && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs">
                        Verified
                      </Badge>
                    )}
                    {idProof.status === 'PENDING' && (
                      <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs animate-pulse">
                        Under Review
                      </Badge>
                    )}
                    {idProof.status === 'REJECTED' && (
                      <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full text-xs">
                        Rejected
                      </Badge>
                    )}
                  </div>

                  {idProof.status === 'REJECTED' && idProof.rejectReason && (
                    <div className="p-3 bg-rose-500/5 border border-rose-500/15 text-rose-400 text-xs rounded-xl">
                      <strong>Rejection reason:</strong> {idProof.rejectReason}
                    </div>
                  )}

                  {idProof.fileUrl && (
                    <a
                      href={idProof.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-300 font-semibold py-2 rounded-xl text-xs transition-colors group"
                    >
                      <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-amber-500 transition-colors" />
                      View Uploaded ID File
                    </a>
                  )}

                  {idProof.status === 'PENDING' && !isRejectingId && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button
                        onClick={() => setIsRejectingId(true)}
                        variant="outline"
                        className="border-slate-850 hover:bg-rose-500/10 text-rose-400 hover:text-white rounded-xl text-xs"
                      >
                        <X className="h-4.5 w-4.5 mr-1.5" />
                        Reject ID
                      </Button>
                      <Button
                        onClick={() => handleVerifyId('VERIFIED')}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs"
                      >
                        <Check className="h-4.5 w-4.5 mr-1.5" />
                        Approve ID
                      </Button>
                    </div>
                  )}

                  {isRejectingId && (
                    <div className="space-y-3 pt-2 border-t border-slate-805">
                      <Label htmlFor="reason" className="text-xs text-rose-400 font-bold">Reason for Rejection *</Label>
                      <Textarea
                        id="reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Image blurry, name does not match profile, expired license..."
                        className="bg-slate-950 border-slate-800 text-white rounded-lg min-h-[70px] text-xs py-2"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsRejectingId(false)}
                          className="text-slate-400 hover:bg-slate-900/50"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleVerifyId('REJECTED')}
                          className="bg-rose-500 hover:bg-rose-400 text-white rounded-lg text-xs"
                        >
                          Submit Rejection
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Grids of photography, studio, rentals activity logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photography section */}
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-amber-500" />
                Photography Shoots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {photographyBookings.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No photo session logs.</p>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {pendingPhotography.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/5 px-2.5 py-1 rounded border border-amber-500/10">
                        Booking Requests (Pending Approval)
                      </div>
                      <div className="space-y-2">
                        {pendingPhotography.map((booking) => renderPhotographyBookingItem(booking))}
                      </div>
                    </div>
                  )}
                  {confirmedPhotography.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10">
                        Confirmed Bookings
                      </div>
                      <div className="space-y-2">
                        {confirmedPhotography.map((booking) => renderPhotographyBookingItem(booking))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rentals section */}
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Film className="h-5 w-5 text-amber-500" />
                Equipment Rentals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rentalBookings.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No equipment lease logs.</p>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {pendingRentals.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/5 px-2.5 py-1 rounded border border-amber-500/10">
                        Booking Requests (Pending Approval)
                      </div>
                      <div className="space-y-2">
                        {pendingRentals.map((booking) => renderRentalBookingItem(booking))}
                      </div>
                    </div>
                  )}
                  {confirmedRentals.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10">
                        Confirmed Bookings
                      </div>
                      <div className="space-y-2">
                        {confirmedRentals.map((booking) => renderRentalBookingItem(booking))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Studio section */}
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Home className="h-5 w-5 text-amber-500" />
                Studio Reservations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studioBookings.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No studio space logs.</p>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {pendingStudio.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/5 px-2.5 py-1 rounded border border-amber-500/10">
                        Booking Requests (Pending Approval)
                      </div>
                      <div className="space-y-2">
                        {pendingStudio.map((booking) => renderStudioBookingItem(booking))}
                      </div>
                    </div>
                  )}
                  {confirmedStudio.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10">
                        Confirmed Bookings
                      </div>
                      <div className="space-y-2">
                        {confirmedStudio.map((booking) => renderStudioBookingItem(booking))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* COMPLETED Photography / Deliverable Dialog Modal */}
      <Dialog open={isPhotoCompleteOpen} onOpenChange={setIsPhotoCompleteOpen}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md w-full p-6 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Camera className="h-5 w-5 text-amber-500" />
              Complete Shoot & Deliver Album
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs mt-1">
              Mark this photography session as complete and update final album delivery and payment records.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCompletePhotoBooking} className="space-y-4 mt-2">
            {photoError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="albumName" className="text-xs font-semibold text-slate-350">Album Title *</Label>
              <Input
                id="albumName"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                placeholder="e.g. Portrait Shoot Deliverables, Smith Wedding"
                className="bg-slate-950 border-slate-800 text-white rounded-lg h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="albumLink" className="text-xs font-semibold text-slate-355">Download / Gallery URL</Label>
              <Input
                type="url"
                id="albumLink"
                value={albumLink}
                onChange={(e) => setAlbumLink(e.target.value)}
                placeholder="e.g. https://pixieset.com/gallery/123"
                className="bg-slate-950 border-slate-800 text-white rounded-lg h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="albumQuotationAmount" className="text-xs font-semibold text-slate-350">Quotation Amount (₹)</Label>
              <Input
                type="number"
                id="albumQuotationAmount"
                value={updateQuotationAmount}
                disabled
                className="bg-slate-955 border border-slate-850 text-slate-400 rounded-lg h-9 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="albumPaymentStatus" className="text-xs font-semibold text-slate-350">Payment Tracking *</Label>
              <select
                id="albumPaymentStatus"
                value={updatePaymentStatus}
                onChange={(e) => {
                  const newStatus = e.target.value as any;
                  setUpdatePaymentStatus(newStatus);
                  if (newStatus === 'COMPLETED') {
                    setUpdateAmountPaid(updateQuotationAmount);
                  } else if (newStatus === 'PENDING') {
                    setUpdateAmountPaid(updateAdvancePaid);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg h-9 px-3 text-xs focus:border-amber-500/50 focus:outline-none"
              >
                <option value="COMPLETED">Fully Paid</option>
                <option value="PARTIALLY_COMPLETED">Partially Paid</option>
                <option value="PENDING">Payment Pending</option>
              </select>
            </div>

            {updatePaymentStatus !== 'COMPLETED' && (
              <div className="space-y-1">
                <Label htmlFor="albumAmountPaid" className="text-xs font-semibold text-slate-355">Total Paid Amount (₹) *</Label>
                <Input
                  type="number"
                  id="albumAmountPaid"
                  value={updateAmountPaid}
                  onChange={(e) => setUpdateAmountPaid(cleanNumberInput(e.target.value))}
                  placeholder="e.g. 8000"
                  min="0"
                  className="bg-slate-950 border-slate-800 text-white rounded-lg h-9 text-xs"
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-350 rounded-lg">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg">
                Mark Completed
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* RETURNED / DAMAGED Assessment Dialog Modal */}
      <Dialog open={isRentalUpdateOpen} onOpenChange={setIsRentalUpdateOpen}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md w-full p-6 shadow-2xl rounded-2xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="h-5 w-5 text-amber-500" />
              Complete Return Assessment
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs mt-1">
              Log returned condition details and assess damage claims for this equipment lease order.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateRentalReturn} className="space-y-4 mt-2">
            {rentalError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{rentalError}</span>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="rentalStatus" className="text-xs font-semibold text-slate-355">Return Outcome *</Label>
              <select
                id="rentalStatus"
                value={rentalStatus}
                onChange={(e) => setRentalStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg h-9 px-3 text-xs focus:border-amber-500/50 focus:outline-none"
              >
                <option value="RETURNED">Standard Clean Return</option>
                <option value="DAMAGED">Returned with Damages / Deficiencies</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="returnCondition" className="text-xs font-semibold text-slate-355">Returned Condition Comments *</Label>
              <Input
                id="returnCondition"
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                placeholder="e.g. Clean & fully functional, lens caps missing, minor scuffs..."
                className="bg-slate-950 border-slate-800 text-white rounded-lg h-9 text-xs"
                required
              />
            </div>

            {rentalStatus === 'DAMAGED' && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="damageCost" className="text-xs font-semibold text-slate-355">Damage Assessment Fee (INR) *</Label>
                  <div className="relative">
                    <CircleDollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      type="number"
                      id="damageCost"
                      value={damageCost}
                      onChange={(e) => setDamageCost(cleanNumberInput(e.target.value))}
                      placeholder="e.g. 5000"
                      min="0"
                      className="bg-slate-950 border-slate-800 text-white pl-9 rounded-lg h-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="damageDescription" className="text-xs font-semibold text-slate-355">Damage Assessment Summary *</Label>
                  <Textarea
                    id="damageDescription"
                    value={damageDescription}
                    onChange={(e) => setDamageDescription(e.target.value)}
                    placeholder="Provide details about structural breakage, cracked elements, sensor dust, missing items..."
                    className="bg-slate-950 border-slate-800 text-white rounded-lg min-h-[60px] text-xs py-2"
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <Label htmlFor="agreementUrlInput" className="text-xs font-semibold text-slate-355">Upload Signed Lease Agreement copy Link</Label>
              <Input
                type="url"
                id="agreementUrlInput"
                value={agreementUrlInput}
                onChange={(e) => setAgreementUrlInput(e.target.value)}
                placeholder="e.g. https://supabase.storage.co/agreement.pdf"
                className="bg-slate-950 border-slate-800 text-white rounded-lg h-9 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-350 rounded-lg">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg">
                Save Outcome
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Booking Update / Payment Dialog Modal */}
      <Dialog open={isBookingUpdateOpen} onOpenChange={setIsBookingUpdateOpen}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md w-full p-6 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-amber-500" />
              Update Booking & Payments
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs mt-1">
              Modify the status and record payment amounts for this {activeBookingType === 'PHOTOGRAPHY' ? 'photography session' : 'studio reservation'}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookingUpdateSubmit} className="space-y-4 mt-2">
            {bookingUpdateError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{bookingUpdateError}</span>
              </div>
            )}

            {/* Status — always read-only badge, prevents manual status regressions */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-350">Booking Status</Label>
              <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border ${
                updateStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                updateStatus === 'CONFIRMED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                updateStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {updateStatus === 'PENDING' ? 'Pending Review' :
                 updateStatus === 'CONFIRMED' ? 'Confirmed' :
                 updateStatus === 'COMPLETED' ? 'Completed & Delivered' : 'Cancelled'}
              </div>
            </div>

            {/* PENDING → Confirmation: set quotation + advance */}
            {activeBooking?.status === 'PENDING' && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="updateQuotationAmount" className="text-xs font-semibold text-slate-350">Quotation Amount (₹) *</Label>
                  <Input
                    type="number"
                    id="updateQuotationAmount"
                    value={updateQuotationAmount}
                    onChange={(e) => setUpdateQuotationAmount(cleanNumberInput(e.target.value))}
                    placeholder="e.g. 15000"
                    min="0"
                    className="bg-slate-950 border-slate-800 text-white rounded-lg h-9 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="updateAdvancePaid" className="text-xs font-semibold text-slate-350">Advance Amount Received (₹) *</Label>
                  <Input
                    type="number"
                    id="updateAdvancePaid"
                    value={updateAdvancePaid}
                    onChange={(e) => setUpdateAdvancePaid(cleanNumberInput(e.target.value))}
                    placeholder="e.g. 3000"
                    min="0"
                    className="bg-slate-950 border-slate-800 text-white rounded-lg h-9 text-xs"
                    required
                  />
                </div>
              </>
            )}

            {/* CONFIRMED → Update Payments: show full payment fields */}
            {activeBooking?.status === 'CONFIRMED' && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="updateQuotationAmount" className="text-xs font-semibold text-slate-350">Quotation Amount (₹)</Label>
                  <Input
                    type="number"
                    id="updateQuotationAmount"
                    value={updateQuotationAmount}
                    onChange={(e) => setUpdateQuotationAmount(cleanNumberInput(e.target.value))}
                    placeholder="e.g. 15000"
                    min="0"
                    className="bg-slate-955 border border-slate-850 text-slate-400 rounded-lg h-9 text-xs"
                    disabled
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="updateAdvancePaid" className="text-xs font-semibold text-slate-350">Advance Already Paid (₹)</Label>
                  <Input
                    type="number"
                    id="updateAdvancePaid"
                    value={updateAdvancePaid}
                    onChange={(e) => setUpdateAdvancePaid(cleanNumberInput(e.target.value))}
                    placeholder="e.g. 3000"
                    min="0"
                    className="bg-slate-955 border border-slate-850 text-slate-400 rounded-lg h-9 text-xs"
                    disabled
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="updatePaymentStatus" className="text-xs font-semibold text-slate-350">Payment Status *</Label>
                  <select
                    id="updatePaymentStatus"
                    value={updatePaymentStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value as any;
                      setUpdatePaymentStatus(newStatus);
                      if (newStatus === 'COMPLETED') {
                        setUpdateAmountPaid(updateQuotationAmount);
                      } else if (newStatus === 'PENDING') {
                        setUpdateAmountPaid(updateAdvancePaid);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg h-9 px-3 text-xs focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="COMPLETED">Fully Paid</option>
                    <option value="PARTIALLY_COMPLETED">Partially Paid</option>
                    <option value="PENDING">Payment Pending</option>
                  </select>
                </div>
                {updatePaymentStatus !== 'COMPLETED' && (
                  <div className="space-y-1">
                    <Label htmlFor="updateAmountPaid" className="text-xs font-semibold text-slate-350">Total Amount Received So Far (₹) *</Label>
                    <Input
                      type="number"
                      id="updateAmountPaid"
                      value={updateAmountPaid}
                      onChange={(e) => setUpdateAmountPaid(cleanNumberInput(e.target.value))}
                      placeholder="e.g. 8000"
                      min="0"
                      className="bg-slate-950 border-slate-800 text-white rounded-lg h-9 text-xs"
                      required
                    />
                  </div>
                )}
                {/* Outstanding balance preview */}
                {updateQuotationAmount && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Outstanding Balance</span>
                    <span className={`font-bold ${Number(updateQuotationAmount) - Number(updateAmountPaid) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      ₹{Math.max(0, Number(updateQuotationAmount) - Number(updateAmountPaid))}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* COMPLETED — editable payment update (e.g. client pays balance later) */}
            {activeBooking?.status === 'COMPLETED' && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="cpl-quotation" className="text-xs font-semibold text-slate-350">Quotation Amount (₹)</Label>
                  <Input
                    type="number"
                    id="cpl-quotation"
                    value={updateQuotationAmount}
                    disabled
                    className="bg-slate-955 border border-slate-850 text-slate-400 rounded-lg h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cpl-advance" className="text-xs font-semibold text-slate-350">Advance Already Paid (₹)</Label>
                  <Input
                    type="number"
                    id="cpl-advance"
                    value={updateAdvancePaid}
                    disabled
                    className="bg-slate-955 border border-slate-850 text-slate-400 rounded-lg h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cpl-payment-status" className="text-xs font-semibold text-slate-350">Payment Status *</Label>
                  <select
                    id="cpl-payment-status"
                    value={updatePaymentStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value as any;
                      setUpdatePaymentStatus(newStatus);
                      if (newStatus === 'COMPLETED') {
                        setUpdateAmountPaid(updateQuotationAmount);
                      } else if (newStatus === 'PENDING') {
                        setUpdateAmountPaid(updateAdvancePaid);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg h-9 px-3 text-xs focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="COMPLETED">Fully Paid</option>
                    <option value="PARTIALLY_COMPLETED">Partially Paid</option>
                    <option value="PENDING">Payment Pending</option>
                  </select>
                </div>
                {updatePaymentStatus !== 'COMPLETED' && (
                  <div className="space-y-1">
                    <Label htmlFor="cpl-amount-paid" className="text-xs font-semibold text-slate-350">Total Amount Received So Far (₹) *</Label>
                    <Input
                      type="number"
                      id="cpl-amount-paid"
                      value={updateAmountPaid}
                      onChange={(e) => setUpdateAmountPaid(cleanNumberInput(e.target.value))}
                      placeholder="e.g. 8000"
                      min="0"
                      className="bg-slate-950 border-slate-800 text-white rounded-lg h-9 text-xs"
                      required
                    />
                  </div>
                )}
                {/* Balance preview */}
                {updateQuotationAmount && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Outstanding Balance</span>
                    <span className={`font-bold ${
                      Number(updateQuotationAmount) - Number(updateAmountPaid) > 0
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      ₹{Math.max(0, Number(updateQuotationAmount) - Number(updateAmountPaid))}
                    </span>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-350 rounded-lg">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg">
                Save Updates
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helpers for parsing/serializing metadata in notes field and 12h date formatting
const cleanNumberInput = (val: string) => {
  if (val.startsWith('0') && val.length > 1 && !val.startsWith('0.')) {
    return val.replace(/^0+/, '');
  }
  return val;
};

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

const formatDateStable = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};
