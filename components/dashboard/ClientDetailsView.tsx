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

      if (!res.ok) throw new Error('Booking status update failed');
      
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
    } catch (error) {
      console.error(error);
      toast.error('Could not update booking status.');
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
        }),
      });

      if (!res.ok) throw new Error('Failed to complete photography booking');
      const data = await res.json();

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
            Registered client since {new Date(client.createdAt).toLocaleDateString()}
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
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {photographyBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-3.5 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-xl flex items-start justify-between gap-4 transition-all duration-200"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-white">
                          {new Date(booking.dateTime).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </div>
                        <div className="text-slate-400">
                          Type: <span className="text-slate-200">{booking.sessionType}</span> | Location:{' '}
                          <span className="text-slate-200">{booking.location}</span>
                        </div>
                        {booking.notes && <div className="text-[10px] text-slate-500 italic max-w-sm">"{booking.notes}"</div>}
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

                      <div className="flex flex-col items-end gap-2.5 shrink-0">
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
                            Completed
                          </Badge>
                        )}
                        {booking.status === 'CANCELLED' && (
                          <Badge className="bg-slate-800 text-slate-450 border border-slate-700 px-2 py-0.5 rounded text-[10px]">
                            Cancelled
                          </Badge>
                        )}

                        {/* Dropdown status update */}
                        {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="border-slate-800 hover:bg-slate-900 text-[10px] h-6 py-0.5 px-2 rounded">
                                Update
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-950 border border-slate-850 text-white text-xs">
                              {booking.status === 'PENDING' && (
                                <DropdownMenuItem onClick={() => handleUpdateBookingStatus('PHOTOGRAPHY', booking.id, 'CONFIRMED')}>
                                  Confirm Shoot
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  setActivePhotoBookingId(booking.id);
                                  setIsPhotoCompleteOpen(true);
                                }}
                              >
                                Mark Completed (Deliver Album)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateBookingStatus('PHOTOGRAPHY', booking.id, 'CANCELLED')} className="text-rose-400 hover:bg-rose-500/10">
                                Cancel Session
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
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
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {rentalBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-white">
                          Out: {new Date(booking.startDate).toLocaleDateString()} | In:{' '}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {booking.equipments.map((eq) => (
                            <span
                              key={eq.id}
                              className="bg-slate-900 text-slate-350 border border-slate-800 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold"
                            >
                              {eq.name}
                            </span>
                          ))}
                        </div>
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
                      </div>

                      <div className="flex flex-col items-end gap-2.5 shrink-0">
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

                        {/* Return/Damage updating */}
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
                                <DropdownMenuItem onClick={() => handleConfirmRental(booking.id)}>
                                  Mark Picked Up (Confirm)
                                </DropdownMenuItem>
                              )}
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
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
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {studioBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-white">
                          {new Date(booking.dateTime).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}{' '}
                          ({booking.durationHours} hrs)
                        </div>
                        <div className="text-slate-400">
                          Purpose: <span className="text-slate-200">{booking.purpose}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {booking.equipments.map((eq) => (
                            <span
                              key={eq.id}
                              className="bg-slate-900 text-slate-350 border border-slate-800 px-1.5 py-0.5 rounded text-[9px]"
                            >
                              {eq.name}
                            </span>
                          ))}
                        </div>
                        {booking.notes && <div className="text-[10px] text-slate-500 italic">"{booking.notes}"</div>}
                      </div>

                      <div className="flex flex-col items-end gap-2.5 shrink-0">
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
                            Completed
                          </Badge>
                        )}
                        {booking.status === 'CANCELLED' && (
                          <Badge className="bg-slate-800 text-slate-450 border border-slate-700 px-2 py-0.5 rounded text-[10px]">
                            Cancelled
                          </Badge>
                        )}

                        {/* Dropdown status update */}
                        {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="border-slate-800 hover:bg-slate-900 text-[10px] h-6 py-0.5 px-2 rounded">
                                Update
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-950 border border-slate-855 text-white text-xs">
                              {booking.status === 'PENDING' && (
                                <DropdownMenuItem onClick={() => handleUpdateBookingStatus('STUDIO', booking.id, 'CONFIRMED')}>
                                  Confirm Space
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleUpdateBookingStatus('STUDIO', booking.id, 'CONFIRMED')}>
                                Mark Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateBookingStatus('STUDIO', booking.id, 'CANCELLED')} className="text-rose-400 hover:bg-rose-500/10">
                                Cancel Booking
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
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
              Mark this photography session as complete and optionally associate a high-resolution download link for the client.
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
              <Label htmlFor="albumLink" className="text-xs font-semibold text-slate-350">Download / Gallery URL</Label>
              <Input
                type="url"
                id="albumLink"
                value={albumLink}
                onChange={(e) => setAlbumLink(e.target.value)}
                placeholder="e.g. https://pixieset.com/gallery/123"
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
                      onChange={(e) => setDamageCost(e.target.value)}
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
    </div>
  );
}
