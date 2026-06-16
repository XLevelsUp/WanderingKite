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
  Image as ImageIcon,
  Link as LinkIcon,
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
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
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
  createdAt?: string;
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
  createdAt?: string;
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
  createdAt?: string;
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
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed' | 'editing' | 'handed_over'>('pending');
  const [visibleCompleted, setVisibleCompleted] = useState(5);
  const [mobileActionsBooking, setMobileActionsBooking] = useState<{ id: string, type: 'PHOTOGRAPHY' | 'STUDIO' | 'RENTAL', status: string, data: any } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, desc: string, onConfirm: () => void, isDestructive: boolean }>({ isOpen: false, title: '', desc: '', onConfirm: () => {}, isDestructive: false });
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

  type UnifiedBooking = {
    id: string;
    type: 'PHOTOGRAPHY' | 'STUDIO' | 'RENTAL';
    status: string;
    sortDate: number;
    data: any;
  };

  const allBookings: UnifiedBooking[] = [
    ...photographyBookings.map(b => ({ id: b.id, type: 'PHOTOGRAPHY' as const, status: b.status, sortDate: new Date(b.createdAt || b.dateTime || 0).getTime(), data: b })),
    ...studioBookings.map(b => ({ id: b.id, type: 'STUDIO' as const, status: b.status, sortDate: new Date(b.createdAt || b.dateTime || 0).getTime(), data: b })),
    ...rentalBookings.map(b => ({ id: b.id, type: 'RENTAL' as const, status: b.status, sortDate: new Date(b.createdAt || b.startDate || 0).getTime(), data: b })),
  ].sort((a, b) => b.sortDate - a.sortDate);

  const pendingBookings = allBookings.filter(b => b.status === 'PENDING');
  const activeBookings = allBookings.filter(b => b.status === 'CONFIRMED');
  const editingBookings = allBookings.filter(b => b.status === 'IN_EDITING');
  const handedOverBookings = allBookings.filter(b => b.status === 'HANDED_OVER');
  const completedBookings = allBookings.filter(b => ['COMPLETED', 'RETURNED', 'DAMAGED', 'CANCELLED'].includes(b.status));


  const handleSimpleStatusUpdate = async (bookingId: string, bookingType: string, newStatus: string, booking?: any) => {
    if (newStatus === 'HANDED_OVER' && booking && !booking.delivery_link) {
      toast.error('Please add a delivery link from the main dashboard workflow first.');
      return;
    }
    showLoader('Updating status...');
    try {
      const res = await fetch('/api/admin/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, bookingType, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success('Status updated successfully');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      hideLoader();
    }
  };

  const renderActions = (bookingType: 'PHOTOGRAPHY' | 'STUDIO' | 'RENTAL', status: string, booking: any, isMobileSheet = false) => {
    const btnClass = isMobileSheet 
      ? "w-full justify-start text-sm h-10 px-4 mb-2 rounded-xl" 
      : "text-xs h-8 py-1 px-3 rounded-lg shadow-sm font-medium";

    if (status === 'PENDING') {
      const idNotVerified = bookingType === 'RENTAL' && (!idProof || idProof.status !== 'VERIFIED');
      return (
        <div className={`flex ${isMobileSheet ? 'flex-col' : 'items-center gap-2'}`}>
          <Button 
            variant="outline" 
            className={`border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 ${btnClass} ${idNotVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (idNotVerified) {
                if(isMobileSheet) toast.error('Verify client ID before confirming rental');
                return;
              }
              if (isMobileSheet) setMobileActionsBooking(null);
              if (bookingType === 'RENTAL') {
                handleConfirmRental(booking.id);
              } else {
                setActiveBookingId(booking.id);
                setActiveBookingType(bookingType as 'PHOTOGRAPHY' | 'STUDIO');
                setUpdateStatus('CONFIRMED');
                const { metadata: meta } = parseNotesMetadata(booking.notes);
                setUpdateQuotationAmount(String(meta.quotationAmount || meta.estimatedBreakdown?.estimatedTotal || ''));
                setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                setUpdateAmountPaid(String(booking.amountPaid || '0'));
                setUpdateAdvancePaid(String(booking.advancePaid || meta.advancePaid || '0'));
                setBookingUpdateError('');
                setIsBookingUpdateOpen(true);
              }
            }}
            title={idNotVerified ? 'Verify client ID before confirming rental' : undefined}
          >
            {idNotVerified ? (
              <><Shield className="h-3 w-3 mr-1.5 text-amber-400" /> ID Not Verified</>
            ) : (
              <><Check className="h-3 w-3 mr-1.5" /> Approve</>
            )}
          </Button>
          <Button 
            variant="outline" 
            className={`border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 ${btnClass}`}
            onClick={() => {
              if (isMobileSheet) setMobileActionsBooking(null);
              setConfirmDialog({
                isOpen: true,
                title: 'Reject Request',
                desc: 'Are you sure you want to reject this booking request? This action cannot be undone.',
                isDestructive: true,
                onConfirm: () => {
                  if (bookingType === 'RENTAL') {
                    // Assuming we have a way to cancel rental
                  } else {
                    setActiveBookingId(booking.id);
                    setActiveBookingType(bookingType as 'PHOTOGRAPHY' | 'STUDIO');
                    setUpdateStatus('CANCELLED');
                    const { metadata: meta } = parseNotesMetadata(booking.notes);
                    setUpdateQuotationAmount(String(meta.quotationAmount || meta.estimatedBreakdown?.estimatedTotal || ''));
                    setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                    setUpdateAmountPaid(String(booking.amountPaid || '0'));
                    setUpdateAdvancePaid(String(booking.advancePaid || meta.advancePaid || '0'));
                    setBookingUpdateError('');
                    setIsBookingUpdateOpen(true);
                  }
                }
              });
            }}
          >
            <X className="h-3 w-3 mr-1.5" /> Reject
          </Button>
        </div>
      );
    }

    if (status === 'CONFIRMED') {
      return (
        <div className={`flex ${isMobileSheet ? 'flex-col' : 'items-center gap-2'}`}>
          <Button 
            variant="outline" 
            className={`border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 ${btnClass}`}
            onClick={() => {
              if (isMobileSheet) setMobileActionsBooking(null);
              if (bookingType === 'RENTAL') {
                setActiveRentalBooking(booking);
                setRentalStatus('RETURNED');
                setIsRentalUpdateOpen(true);
              } else {
                setActiveBookingId(booking.id);
                setActiveBookingType(bookingType as 'PHOTOGRAPHY' | 'STUDIO');
                setUpdateStatus('CONFIRMED');
                const { metadata: meta } = parseNotesMetadata(booking.notes);
                setUpdateQuotationAmount(String(meta.quotationAmount || meta.estimatedBreakdown?.estimatedTotal || ''));
                setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                setUpdateAmountPaid(String(booking.amountPaid || '0'));
                setUpdateAdvancePaid(String(booking.advancePaid || meta.advancePaid || '0'));
                setBookingUpdateError('');
                setIsBookingUpdateOpen(true);
              }
            }}
          >
            <CircleDollarSign className="h-3 w-3 mr-1.5" /> {bookingType === 'RENTAL' ? 'Process Return' : 'Update Payments'}
          </Button>
          
          <Button 
            variant="outline" 
            className={`border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 ${btnClass}`}
            onClick={() => {
              if (isMobileSheet) setMobileActionsBooking(null);
              if (bookingType === 'PHOTOGRAPHY') {
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
              } else if (bookingType === 'STUDIO') {
                setActiveBookingId(booking.id);
                setActiveBookingType(bookingType as 'PHOTOGRAPHY' | 'STUDIO');
                setUpdateStatus('COMPLETED');
                const { metadata: meta } = parseNotesMetadata(booking.notes);
                setUpdateQuotationAmount(String(meta.quotationAmount || meta.estimatedBreakdown?.estimatedTotal || ''));
                setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                setUpdateAmountPaid(String(booking.amountPaid || '0'));
                setUpdateAdvancePaid(String(booking.advancePaid || meta.advancePaid || '0'));
                setBookingUpdateError('');
                setIsBookingUpdateOpen(true);
              } else {
                 // For Rental, damage is a constructive action in a way
                 setActiveRentalBooking(booking);
                 setRentalStatus('DAMAGED');
                 setIsRentalUpdateOpen(true);
              }
            }}
          >
            <Check className="h-3 w-3 mr-1.5" /> {bookingType === 'RENTAL' ? 'Mark Damaged' : 'Mark Complete'}
          </Button>

          <Button 
            variant="outline" 
            className={`border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 ${btnClass}`}
            onClick={() => {
              if (isMobileSheet) setMobileActionsBooking(null);
              setConfirmDialog({
                isOpen: true,
                title: 'Cancel Booking',
                desc: 'Are you sure you want to cancel this booking? This action cannot be undone.',
                isDestructive: true,
                onConfirm: () => {
                  setActiveBookingId(booking.id);
                  setActiveBookingType(bookingType as 'PHOTOGRAPHY' | 'STUDIO');
                  setUpdateStatus('CANCELLED');
                  const { metadata: meta } = parseNotesMetadata(booking.notes);
                  setUpdateQuotationAmount(String(meta.quotationAmount || meta.estimatedBreakdown?.estimatedTotal || ''));
                  setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                  setUpdateAmountPaid(String(booking.amountPaid || '0'));
                  setUpdateAdvancePaid(String(booking.advancePaid || meta.advancePaid || '0'));
                  setBookingUpdateError('');
                  setIsBookingUpdateOpen(true);
                }
              });
            }}
          >
            <X className="h-3 w-3 mr-1.5" /> Cancel
          </Button>
        </div>
      );
    }

    if (['COMPLETED', 'IN_EDITING', 'HANDED_OVER', 'RETURNED', 'DAMAGED', 'CANCELLED'].includes(status)) {
       // Completed usually only has "View Details" or "Update Payments" if there is an outstanding balance
       // We can allow "Update Payments" for completed bookings if needed.
       return (
        <div className={`flex ${isMobileSheet ? 'flex-col' : 'items-center gap-2'}`}>
          {bookingType !== 'RENTAL' && status === 'COMPLETED' && (
             <Button 
              variant="outline" 
              className={`border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 ${btnClass}`}
              onClick={() => {
                if (isMobileSheet) setMobileActionsBooking(null);
                handleSimpleStatusUpdate(booking.id, bookingType, 'IN_EDITING');
              }}
            >
              <Check className="h-3 w-3 mr-1.5" /> Set Editing
            </Button>
          )}
          {bookingType !== 'RENTAL' && status === 'IN_EDITING' && (
             <Button 
              variant="outline" 
              className={`border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 ${btnClass}`}
              onClick={() => {
                if (isMobileSheet) setMobileActionsBooking(null);
                handleSimpleStatusUpdate(booking.id, bookingType, 'HANDED_OVER', booking);
              }}
            >
              <Check className="h-3 w-3 mr-1.5" /> Handed Over
            </Button>
          )}
          {bookingType !== 'RENTAL' && status !== 'CANCELLED' && (
             <Button 
              variant="outline" 
              className={`border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white ${btnClass}`}
              onClick={() => {
                if (isMobileSheet) setMobileActionsBooking(null);
                setActiveBookingId(booking.id);
                setActiveBookingType(bookingType as 'PHOTOGRAPHY' | 'STUDIO');
                setUpdateStatus('COMPLETED');
                const { metadata: meta } = parseNotesMetadata(booking.notes);
                setUpdateQuotationAmount(String(meta.quotationAmount || meta.estimatedBreakdown?.estimatedTotal || ''));
                setUpdatePaymentStatus(meta.paymentStatus || 'PARTIALLY_COMPLETED');
                setUpdateAmountPaid(String(booking.amountPaid || '0'));
                setUpdateAdvancePaid(String(booking.advancePaid || meta.advancePaid || '0'));
                setBookingUpdateError('');
                setIsBookingUpdateOpen(true);
              }}
            >
              <CircleDollarSign className="h-3 w-3 mr-1.5" /> Update Payments
            </Button>
          )}
        </div>
       );
    }
    
    return null;
  };

  const renderUnifiedBooking = (unified: UnifiedBooking) => {
    const { type, status, data: booking } = unified;
    const { userNotes, metadata } = parseNotesMetadata(booking.notes);
    
    const Icon = type === 'PHOTOGRAPHY' ? Camera : type === 'STUDIO' ? Home : Film;
    
    return (
      <div
        key={`${type}-${booking.id}`}
        className="p-3.5 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all duration-200 text-xs w-full relative"
      >
        <div className="absolute top-3.5 right-3.5 sm:hidden">
           <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={() => setMobileActionsBooking({ id: booking.id, type, status, data: booking })}>
             <ChevronDown className="h-4 w-4" />
           </Button>
        </div>

        <div className="space-y-1 w-full sm:max-w-[70%]">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Icon className="h-3.5 w-3.5 text-amber-500" />
            <span className="uppercase text-[10px] tracking-wider text-amber-500 font-bold">{type === 'PHOTOGRAPHY' ? 'Photography' : type === 'STUDIO' ? 'Studio Space' : 'Equipment Rental'}</span>
            <span className="text-slate-500 px-1">•</span>
            {type === 'RENTAL' ? `Out: ${formatDateTime12h(booking.startDate)}` : `${formatDateTime12h(booking.dateTime || booking.createdAt)} ${type === 'STUDIO' ? `(${booking.durationHours} hrs)` : ''}`}
          </div>
          
          <div className="text-slate-400">
            {type === 'PHOTOGRAPHY' && <><span className="text-slate-200">{booking.sessionType}</span> | Location: <span className="text-slate-200">{booking.location}</span></>}
            {type === 'STUDIO' && <>Purpose: <span className="text-slate-200">{booking.purpose}</span></>}
            {type === 'RENTAL' && <>In: <span className="text-slate-200">{formatDateTime12h(booking.endDate)}</span></>}
          </div>

          {(type === 'STUDIO' || type === 'RENTAL') && (
            <div className="flex flex-wrap gap-1 pt-1">
              {booking.equipments?.map((eq: any) => (
                <span key={eq.id} className="bg-slate-900 text-slate-355 border border-slate-800 px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold shrink-0">
                  {eq.name || eq.equipment?.name || 'Unknown Item'}
                </span>
              ))}
            </div>
          )}

          {booking.delivery_link && (
            <div className="pt-2">
              <a href={booking.delivery_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-md border border-indigo-500/20 transition-colors">
                <LinkIcon className="h-3 w-3" /> View Deliverables
              </a>
            </div>
          )}
          
          {type === 'RENTAL' && booking.purpose && (
            <div className="text-slate-400 pt-0.5">Purpose: <span className="text-slate-200">{booking.purpose}</span></div>
          )}

          {userNotes && <div className="text-[10px] text-slate-500 italic max-w-sm whitespace-pre-line break-words">"{userNotes}"</div>}
          
          {/* Payment Details for Studio and Photo */}
          {(type === 'PHOTOGRAPHY' || type === 'STUDIO') && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[11px] text-slate-450 bg-slate-900/40 p-2 rounded-lg border border-slate-850/50 w-full sm:w-fit">
              {metadata.quotationAmount !== undefined && (
                <span>Quotation: <span className="font-semibold text-white">₹{metadata.quotationAmount}</span></span>
              )}
              <span>Total Paid: <span className="font-semibold text-slate-300">₹{booking.amountPaid || 0}</span></span>
              {metadata.quotationAmount !== undefined && booking.status !== 'CANCELLED' && (
                <span className="font-medium">
                  Balance: <span className={Number(metadata.quotationAmount) - Number(booking.amountPaid || 0) > 0 ? 'text-amber-500 font-bold' : 'text-emerald-500'}>
                    ₹{Math.max(0, Number(metadata.quotationAmount) - Number(booking.amountPaid || 0))}
                  </span>
                </span>
              )}
            </div>
          )}
          
          {type === 'PHOTOGRAPHY' && booking.album && (
            <div className="pt-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <a href={booking.album.downloadLink || ''} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 font-semibold inline-flex items-center gap-0.5">
                Album: {booking.album.name} <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          )}

          {booking.delivery_link && (
            <div className="pt-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <a href={booking.delivery_link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-0.5">
                Delivery Link <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          )}
          
          {type === 'RENTAL' && booking.agreementUrl && (
            <div className="pt-1 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <a href={booking.agreementUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 font-semibold inline-flex items-center gap-0.5 text-[10px]">
                Signed Agreement File <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end justify-between gap-2.5 shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-850/50 w-full sm:w-auto">
          <div>
            {status === 'PENDING' && <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px]">Pending Review</Badge>}
            {status === 'CONFIRMED' && <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px]">{type === 'RENTAL' ? 'Leased Out' : 'Confirmed'}</Badge>}
            {status === 'COMPLETED' && <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">Shoot Completed</Badge>}
            {status === 'IN_EDITING' && <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px]">In Editing</Badge>}
            {status === 'HANDED_OVER' && <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px]">Handed Over</Badge>}
            {status === 'RETURNED' && <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">Returned Clean</Badge>}
            {status === 'DAMAGED' && <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px]">Damaged</Badge>}
            {status === 'CANCELLED' && <Badge className="bg-slate-800 text-slate-450 border border-slate-700 px-2 py-0.5 rounded text-[10px]">Cancelled</Badge>}
          </div>

          <div className="hidden sm:block">
            {renderActions(type, status, booking)}
          </div>
        </div>
      </div>
    );
  };

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

    const roundedQuotation = Math.round(parsedQuotation);
    const roundedAdvance = Math.round(parsedAdvance);
    const roundedAmount = Math.round(parsedAmount);

    console.log('Pre-submit booking update payload:', {
      bookingType: activeBookingType,
      bookingId: activeBookingId,
      status: updateStatus,
      amountPaid: roundedAmount,
      advancePaid: roundedAdvance,
      quotationAmount: roundedQuotation,
      paymentStatus: finalPaymentStatus,
    });

    showLoader('Updating booking details...');
    try {
      const res = await fetch('/api/admin/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType: activeBookingType,
          bookingId: activeBookingId,
          status: updateStatus,
          amountPaid: roundedAmount,
          advancePaid: roundedAdvance,
          quotationAmount: roundedQuotation,
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
                  amountPaid: roundedAmount,
                  advancePaid: roundedAdvance,
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
                  amountPaid: roundedAmount,
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

    const roundedQuotation = Math.round(parsedQuotation);
    const roundedAdvance = Math.round(parsedAdvance);
    const roundedAmount = Math.round(parsedAmount);

    console.log('Pre-submit photography booking complete payload:', {
      bookingType: 'PHOTOGRAPHY',
      bookingId: activePhotoBookingId,
      status: 'COMPLETED',
      albumName,
      downloadLink: albumLink || null,
      amountPaid: roundedAmount,
      advancePaid: roundedAdvance,
      quotationAmount: roundedQuotation,
      paymentStatus: finalPaymentStatus,
    });

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
          amountPaid: roundedAmount,
          advancePaid: roundedAdvance,
          quotationAmount: roundedQuotation,
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
                amountPaid: roundedAmount,
                advancePaid: roundedAdvance,
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

    const parsedDamageCost = rentalStatus === 'DAMAGED' && damageCost ? Math.round(parseFloat(damageCost)) : null;

    console.log('Pre-submit rental return payload:', {
      bookingId: activeRentalBooking?.id,
      status: rentalStatus,
      returnCondition,
      damageCost: parsedDamageCost,
      damageDescription: rentalStatus === 'DAMAGED' ? damageDescription : null,
      agreementUrl: agreementUrlInput || undefined,
    });

    showLoader('Saving return assessment...');
    try {
      const res = await fetch('/api/admin/rentals/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeRentalBooking?.id,
          status: rentalStatus,
          returnCondition,
          damageCost: parsedDamageCost,
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
                damageCost: parsedDamageCost,
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
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/60">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Total Bookings</div>
                  <div className="text-xl font-bold text-white">{allBookings.length}</div>
                </div>
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/60">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Lifetime Spent</div>
                  <div className="text-xl font-bold text-emerald-500">₹{allBookings.reduce((sum, b) => sum + Number(b.data.amountPaid || 0), 0)}</div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-500 font-semibold uppercase mb-2">Interested Services</div>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((svc) => (
                    <Badge
                      key={svc}
                      variant="outline"
                      className="text-[10px] uppercase border-slate-800 bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md"
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

        {/* Right column: Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm min-h-[500px]">
            <CardHeader className="border-b border-slate-800 pb-0 pt-4 px-4">
              <div className="flex gap-6 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => { setActiveTab('pending'); setVisibleCompleted(5); }}
                  className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'pending' ? 'border-amber-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  Pending Requests {pendingBookings.length > 0 && <span className="ml-1.5 bg-amber-500/20 text-amber-500 py-0.5 px-2 rounded-full text-[10px]">{pendingBookings.length}</span>}
                </button>
                <button
                  onClick={() => { setActiveTab('active'); setVisibleCompleted(5); }}
                  className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'active' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  Active & Ongoing {activeBookings.length > 0 && <span className="ml-1.5 bg-blue-500/20 text-blue-400 py-0.5 px-2 rounded-full text-[10px]">{activeBookings.length}</span>}
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'completed' ? 'border-emerald-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  Shoot Completed & Archived {completedBookings.length > 0 && <span className="ml-1.5 bg-slate-800 text-slate-400 py-0.5 px-2 rounded-full text-[10px]">{completedBookings.length}</span>}
                </button>
                <button
                  onClick={() => { setActiveTab('editing'); setVisibleCompleted(5); }}
                  className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'editing' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  In Editing {editingBookings.length > 0 && <span className="ml-1.5 bg-purple-500/20 text-purple-400 py-0.5 px-2 rounded-full text-[10px]">{editingBookings.length}</span>}
                </button>
                <button
                  onClick={() => { setActiveTab('handed_over'); setVisibleCompleted(5); }}
                  className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'handed_over' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  Handed Over {handedOverBookings.length > 0 && <span className="ml-1.5 bg-indigo-500/20 text-indigo-400 py-0.5 px-2 rounded-full text-[10px]">{handedOverBookings.length}</span>}
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {activeTab === 'pending' && (
                <div className="space-y-3">
                  {pendingBookings.length === 0 ? (
                     <div className="text-center py-12 text-slate-500 text-sm">No pending requests right now.</div>
                  ) : pendingBookings.map(renderUnifiedBooking)}
                </div>
              )}
              {activeTab === 'active' && (
                <div className="space-y-3">
                  {activeBookings.length === 0 ? (
                     <div className="text-center py-12 text-slate-500 text-sm">No active bookings right now.</div>
                  ) : activeBookings.map(renderUnifiedBooking)}
                </div>
              )}
              {activeTab === 'editing' && (
                <div className="space-y-3">
                  {editingBookings.length === 0 ? (
                     <div className="text-center py-12 text-slate-500 text-sm">No bookings in editing right now.</div>
                  ) : editingBookings.map(renderUnifiedBooking)}
                </div>
              )}
              {activeTab === 'handed_over' && (
                <div className="space-y-3">
                  {handedOverBookings.length === 0 ? (
                     <div className="text-center py-12 text-slate-500 text-sm">No handed over bookings right now.</div>
                  ) : handedOverBookings.map(renderUnifiedBooking)}
                </div>
              )}
              {activeTab === 'completed' && (
                <div className="space-y-3">
                  {completedBookings.length === 0 ? (
                     <div className="text-center py-12 text-slate-500 text-sm">No history found.</div>
                  ) : (
                    <>
                      {completedBookings.slice(0, visibleCompleted).map(renderUnifiedBooking)}
                      {visibleCompleted < completedBookings.length && (
                        <div className="pt-4 text-center">
                          <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white" onClick={() => setVisibleCompleted(v => v + 5)}>
                            Show More
                          </Button>
                        </div>
                      )}
                    </>
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
                Mark Shoot Completed
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
                 updateStatus === 'COMPLETED' ? 'Shoot Completed & Delivered' : 'Cancelled'}
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
                    disabled={activeBookingType === 'STUDIO'}
                    placeholder="e.g. 15000"
                    min="0"
                    className="bg-slate-950 border-slate-800 text-white rounded-lg h-9 text-xs disabled:opacity-75 disabled:cursor-not-allowed"
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

      <AnimatePresence>
        {mobileActionsBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[100] sm:hidden"
              onClick={() => setMobileActionsBooking(null)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 rounded-t-2xl z-[101] sm:hidden pb-8"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white">Booking Actions</h3>
                <Button variant="ghost" size="icon" onClick={() => setMobileActionsBooking(null)} className="h-8 w-8 text-slate-400">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {renderActions(mobileActionsBooking.type, mobileActionsBooking.status, mobileActionsBooking.data, true)}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog(prev => ({...prev, isOpen: false}))}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white rounded-xl">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {confirmDialog.desc}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => setConfirmDialog(prev => ({...prev, isOpen: false}))}>
              Cancel
            </Button>
            <Button 
              className={confirmDialog.isDestructive ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"}
              onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(prev => ({...prev, isOpen: false})); }}
            >
              Confirm
            </Button>
          </div>
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
