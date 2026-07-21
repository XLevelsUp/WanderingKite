'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Plus, Trash2, Link as LinkIcon, User, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
// Force IDE refresh
import { formatDateStable } from '@/lib/utils/date-format';
import { parseNotesMetadata } from '@/lib/utils/booking-metadata';
import { useRouter } from 'next/navigation';

export function BookingDrawer({
  isOpen,
  onClose,
  bookingId,
  bookingType,
  bookingData,
  initialTab,
  editors,
  assignees,
  charges
}: {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  bookingType?: 'PHOTOGRAPHY' | 'STUDIO' | 'RENTAL';
  bookingData?: any;
  initialTab?: 'DETAILS' | 'PAYMENTS' | 'WORKFLOW';
  editors: any[];
  assignees: any[];
  charges: any[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'PAYMENTS' | 'WORKFLOW'>(initialTab || 'DETAILS');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'DETAILS');
    }
  }, [isOpen, initialTab]);

  // Charges state
  const [chargeType, setChargeType] = useState('EXTENDED_HOURS');
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmt, setChargeAmt] = useState('');
  const [isAddingCharge, setIsAddingCharge] = useState(false);

  // Workflow state
  const [deliveryLink, setDeliveryLink] = useState(bookingData?.delivery_link || '');
  const [isSavingLink, setIsSavingLink] = useState(false);

  // Payment update state
  const [updateAmountPaid, setUpdateAmountPaid] = useState('');
  const [updateQuotationAmount, setUpdateQuotationAmount] = useState('');
  const [updatePaymentStatus, setUpdatePaymentStatus] = useState('PARTIALLY_COMPLETED');
  const [updateAdvancePaid, setUpdateAdvancePaid] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [bookingUpdateError, setBookingUpdateError] = useState('');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  useEffect(() => {
    if (bookingData) {
      setDeliveryLink(bookingData.delivery_link || bookingData.album?.downloadLink || '');
      setUpdateAmountPaid(bookingData.amount_paid?.toString() || bookingData.amountPaid?.toString() || '0');
      const { metadata } = parseNotesMetadata(bookingData.notes || '');
      setUpdateQuotationAmount(metadata.quotationAmount?.toString() || metadata.estimatedBreakdown?.estimatedTotal?.toString() || '');
      setUpdatePaymentStatus(metadata.paymentStatus || 'PARTIALLY_COMPLETED');
      setUpdateAdvancePaid(metadata.advancePaid?.toString() || bookingData.advancePaid?.toString() || '0');
      setNewPaymentAmount('');
      setBookingUpdateError('');
    }
  }, [bookingData]);

  const cleanNumberInput = (val: string) => val.replace(/^0+(?=\d)/, '');

  const handleUpdatePayment = async () => {
    let finalAmountPaid = updateAmountPaid === '' ? 0 : Number(updateAmountPaid);
    const parsedNewPayment = newPaymentAmount === '' ? 0 : Number(newPaymentAmount);

    if (updatePaymentStatus !== 'COMPLETED') {
      finalAmountPaid += parsedNewPayment;
    }

    if (updatePaymentStatus !== 'COMPLETED' && updateQuotationAmount) {
      const q = Number(updateQuotationAmount);
      if (finalAmountPaid > q) {
        setBookingUpdateError('New payment plus existing total exceeds the quotation amount. Please select "Fully Paid" if the balance is settled.');
        return;
      }
    }

    setIsUpdatingPayment(true);
    try {
      const res = await fetch('/api/admin/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          bookingType,
          status: bookingData.status,
          amountPaid: finalAmountPaid,
          advancePaid: updateAdvancePaid,
          paymentStatus: updatePaymentStatus,
          quotationAmount: updateQuotationAmount
        })
      });
      if (!res.ok) throw new Error('Failed to update payment');
      toast.success('Payment logged successfully');
      setUpdateAmountPaid(String(finalAmountPaid));
      setNewPaymentAmount('');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  if (!isOpen || !bookingData) return null;

  const currentCharges = charges.filter(c => c.booking_id === bookingId);
  const currentAssignees = assignees.filter(a => 
    (bookingType === 'STUDIO' && a.studio_booking_id === bookingId) ||
    (bookingType === 'PHOTOGRAPHY' && a.photography_booking_id === bookingId)
  );

  const handleAddCharge = async () => {
    if (!chargeAmt) return toast.error('Enter an amount');
    setIsAddingCharge(true);
    try {
      const res = await fetch('/api/admin/bookings/charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          bookingType,
          chargeType,
          description: chargeDesc,
          amount: chargeAmt
        })
      });
      if (!res.ok) throw new Error('Failed to add charge');
      toast.success('Charge added successfully');
      setChargeDesc('');
      setChargeAmt('');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsAddingCharge(false);
    }
  };

  const handleAssignEditor = async (employeeId: string) => {
    try {
      const res = await fetch('/api/admin/bookings/assignees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADD', bookingId, bookingType, employeeId })
      });
      if (!res.ok) throw new Error('Failed to assign');
      toast.success('Editor assigned');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRemoveAssignee = async (employeeId: string) => {
    try {
      const res = await fetch('/api/admin/bookings/assignees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REMOVE', bookingId, bookingType, employeeId })
      });
      if (!res.ok) throw new Error('Failed to remove');
      toast.success('Editor removed');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSaveDeliveryLink = async () => {
    setIsSavingLink(true);
    try {
      const res = await fetch('/api/admin/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType,
          bookingId,
          status: bookingData.status,
          deliveryLink
        })
      });
      if (!res.ok) throw new Error('Failed to save link');
      toast.success('Delivery link saved');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSavingLink(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (newStatus === 'HANDED_OVER' && !deliveryLink && !bookingData.delivery_link && !bookingData.album?.downloadLink) {
      toast.error('Please provide a delivery link before marking as Handed Over.');
      return;
    }
    
    try {
      const res = await fetch('/api/admin/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType,
          bookingId,
          status: newStatus,
        })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success('Status updated');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const { userNotes, metadata } = parseNotesMetadata(bookingData.notes || '');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-slate-950 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h2 className="text-lg font-bold text-white">Booking Details</h2>
                <p className="text-xs text-slate-400 capitalize">{bookingType?.replace('_', ' ').toLowerCase()}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} data-no-track className="text-slate-400 hover:text-white rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex px-4 py-2 gap-4 border-b border-slate-800 bg-slate-900/30">
              <button onClick={() => setActiveTab('DETAILS')} data-no-track className={`text-sm font-semibold pb-2 border-b-2 ${activeTab === 'DETAILS' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500'}`}>Details</button>
              {bookingType !== 'RENTAL' && <button onClick={() => setActiveTab('PAYMENTS')} data-no-track className={`text-sm font-semibold pb-2 border-b-2 ${activeTab === 'PAYMENTS' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500'}`}>Payments</button>}
              <button onClick={() => setActiveTab('WORKFLOW')} data-no-track className={`text-sm font-semibold pb-2 border-b-2 ${activeTab === 'WORKFLOW' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500'}`}>Workflow</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'DETAILS' && (
                <div className="space-y-4">
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs uppercase font-bold">Client</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{bookingData.client?.name}</span>
                        {bookingData.client_id && (
                          <Button variant="ghost" className="h-6 px-2 text-xs text-amber-500 hover:text-amber-400 hover:bg-amber-500/10" onClick={() => router.push(`/dashboard/clients/${bookingData.client_id}`)}>
                            View Profile &rarr;
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs uppercase font-bold">Status</span>
                      <Badge variant="outline" className="text-amber-500 border-amber-500/20">{bookingData.status}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs uppercase font-bold">Date</span>
                      <span className="text-white text-sm">{formatDateStable(bookingData.date_time || bookingData.start_date)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs uppercase font-bold">Total Paid</span>
                      <span className="text-emerald-400 font-bold text-sm">₹{bookingData.amount_paid || 0}</span>
                    </div>
                  </div>

                  {userNotes && (
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                      <span className="text-slate-500 text-xs uppercase font-bold block mb-2">Notes</span>
                      <p className="text-sm text-slate-300">{userNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'PAYMENTS' && bookingType !== 'RENTAL' && (
                <div className="space-y-6">
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">Financial Details</h3>
                    
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Quotation Amount (₹)</label>
                        <Input type="number" placeholder="e.g. 15000" value={updateQuotationAmount} disabled className="bg-slate-900 border border-slate-800 text-slate-400 text-sm h-9 font-medium" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Advance Already Paid (₹)</label>
                        <Input type="number" value={updateAdvancePaid} disabled className="bg-slate-900 border border-slate-800 text-slate-450 text-sm h-9" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Payment Status *</label>
                        <select
                          value={updatePaymentStatus}
                          onChange={(e) => {
                            const newStatus = e.target.value as any;
                            setUpdatePaymentStatus(newStatus);
                            if (newStatus === 'COMPLETED') {
                              setUpdateAmountPaid(updateQuotationAmount);
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg h-9 px-3 text-sm focus:border-amber-500/50 focus:outline-none"
                        >
                          <option value="COMPLETED">Fully Paid</option>
                          <option value="PARTIALLY_COMPLETED">Partially Paid</option>
                        </select>
                      </div>

                      {updatePaymentStatus !== 'COMPLETED' && (
                        <div className="space-y-4">
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Total Received So Far</span>
                              <span className="text-white font-medium">₹{updateAmountPaid}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Outstanding Balance</span>
                              <span className={`font-bold ${Number(updateQuotationAmount) - Number(updateAmountPaid) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                ₹{Math.max(0, Number(updateQuotationAmount) - Number(updateAmountPaid))}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                            <label className="text-xs font-bold text-slate-300">Log New Payment (₹)</label>
                            <p className="text-[10px] text-slate-400">
                              Enter the <strong>new</strong> amount you just received. It will be added to the total of ₹{updateAmountPaid}.
                            </p>
                            <Input type="number" placeholder="e.g. 5000" value={newPaymentAmount} onChange={e => { setNewPaymentAmount(cleanNumberInput(e.target.value)); setBookingUpdateError(''); }} className="bg-slate-950 border-indigo-500/20 text-sm h-9 text-white focus-visible:ring-indigo-500/50" />
                            {bookingUpdateError && bookingUpdateError.includes('exceed') && (
                              <p className="text-[11px] text-amber-400 mt-1 font-semibold flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                <span>{bookingUpdateError}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Balance preview */}
                      {updateQuotationAmount && (
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-xs flex items-center justify-between mt-2">
                          <span className="text-slate-400">Outstanding Balance</span>
                          <span className={`font-bold ${Number(updateQuotationAmount) - Number(updateAmountPaid) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            ₹{Math.max(0, Number(updateQuotationAmount) - Number(updateAmountPaid))}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button onClick={handleUpdatePayment} disabled={isUpdatingPayment} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-9 mt-2">
                      {isUpdatingPayment && <Loader2 className="animate-spin h-3 w-3 mr-1" />} Save Financials
                    </Button>
                  </div>

                  {bookingType === 'STUDIO' && (
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2"><Plus className="h-4 w-4 text-amber-500" /> Add Charge</h3>
                      <div className="space-y-2">
                        <Select value={chargeType} onValueChange={setChargeType}>
                          <SelectTrigger className="bg-slate-950 border-slate-800 text-sm h-9">
                            <SelectValue placeholder="Charge Type" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-800 text-white">
                            <SelectItem value="EXTENDED_HOURS">Extended Hours</SelectItem>
                            <SelectItem value="EXTRA_EQUIPMENT">Extra Equipment</SelectItem>
                            <SelectItem value="MISC">Miscellaneous</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="Description (Optional)" value={chargeDesc} onChange={e => setChargeDesc(e.target.value)} className="bg-slate-950 border-slate-800 text-sm h-9" />
                        <div className="flex gap-2">
                          <Input type="number" placeholder="Amount (₹)" value={chargeAmt} onChange={e => setChargeAmt(e.target.value)} className="bg-slate-950 border-slate-800 text-sm h-9" />
                          <Button onClick={handleAddCharge} disabled={isAddingCharge} className="bg-amber-500 hover:bg-amber-400 text-slate-950 h-9 px-4">
                            {isAddingCharge && <Loader2 className="animate-spin h-3 w-3 mr-1" />} Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {bookingType === 'STUDIO' && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-500 uppercase">Charge History</h3>
                      {currentCharges.length === 0 ? (
                        <p className="text-slate-500 text-xs italic">No additional charges added.</p>
                      ) : (
                        <div className="space-y-2">
                          {currentCharges.map(c => (
                            <div key={c.id} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-lg border border-slate-800/50">
                              <div>
                                <div className="text-sm font-semibold text-white">{c.charge_type.replace('_', ' ')}</div>
                                {c.description && <div className="text-xs text-slate-400">{c.description}</div>}
                              </div>
                              <div className="text-emerald-400 font-bold text-sm">+ ₹{c.amount}</div>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                            <span className="text-sm font-bold text-slate-300">Total Additional</span>
                            <span className="text-emerald-500 font-bold">₹{bookingData.additional_charges}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'WORKFLOW' && (
                <div className="space-y-8">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold text-slate-300">Update Booking Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {bookingData.status === 'PENDING' && (
                        <>
                          <Button onClick={() => updateStatus(bookingType === 'RENTAL' ? 'ACTIVE' : 'CONFIRMED')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3">Approve</Button>
                          <Button onClick={() => updateStatus('CANCELLED')} className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8 px-3">Reject</Button>
                        </>
                      )}
                      {bookingData.status === 'CONFIRMED' && (
                        <Button onClick={() => updateStatus('COMPLETED')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3">Mark Complete</Button>
                      )}
                      {bookingType === 'RENTAL' && bookingData.status === 'ACTIVE' && (
                        <Button onClick={() => updateStatus('RETURNED')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3">Mark Returned</Button>
                      )}
                      {bookingType !== 'RENTAL' && (bookingData.status === 'COMPLETED' || bookingData.status === 'IN_EDITING') && (
                        <>
                          <Button onClick={() => updateStatus('IN_EDITING')} variant={bookingData.status === 'IN_EDITING' ? 'default' : 'outline'} className={`text-xs h-8 px-3 ${bookingData.status === 'IN_EDITING' ? 'bg-purple-600 hover:bg-purple-500 text-white border-transparent' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}>Set In Editing</Button>
                          <Button onClick={() => updateStatus('HANDED_OVER')} variant={bookingData.status === 'HANDED_OVER' ? 'default' : 'outline'} className={`text-xs h-8 px-3 ${bookingData.status === 'HANDED_OVER' ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}>Set Handed Over</Button>
                        </>
                      )}
                      {bookingData.status === 'CANCELLED' && (
                        <p className="text-xs text-rose-400 italic">This booking has been cancelled.</p>
                      )}
                      {bookingData.status === 'HANDED_OVER' && (
                        <p className="text-xs text-indigo-400 italic">This booking has been handed over successfully.</p>
                      )}
                    </div>
                  </div>

                  {bookingData.status === 'IN_EDITING' && (
                    <div className="bg-purple-500/5 rounded-xl p-4 border border-purple-500/20 space-y-4">
                      <h3 className="text-sm font-bold text-purple-400">Assign Editors</h3>
                      <div className="flex flex-wrap gap-2">
                        {editors.map(ed => {
                          const isAssigned = currentAssignees.some(a => a.employee_id === ed.id);
                          return (
                            <Badge 
                              key={ed.id}
                              onClick={() => isAssigned ? handleRemoveAssignee(ed.id) : handleAssignEditor(ed.id)}
                              className={`cursor-pointer px-3 py-1 ${isAssigned ? 'bg-purple-500 hover:bg-purple-400 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'}`}
                            >
                              {ed.fullName || ed.full_name || 'Staff'} {isAssigned && <Check className="h-3 w-3 ml-1.5" />}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(bookingData.status === 'IN_EDITING' || bookingData.status === 'HANDED_OVER') && (
                    <div className="bg-indigo-500/5 rounded-xl p-4 border border-indigo-500/20 space-y-3">
                      <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Delivery Link <span className="text-[10px] font-normal text-slate-400">(Required for Handover)</span></h3>
                      <div className="flex gap-2">
                        <Input placeholder="https://drive.google.com/..." value={deliveryLink} onChange={e => setDeliveryLink(e.target.value)} className="bg-slate-950 border-indigo-500/30 text-sm h-9" />
                        <Button onClick={handleSaveDeliveryLink} disabled={isSavingLink} className="bg-indigo-500 hover:bg-indigo-400 text-white h-9 px-4">
                          {isSavingLink && <Loader2 className="animate-spin h-3 w-3 mr-1" />} Save
                        </Button>
                      </div>
                      {(bookingData.delivery_link || deliveryLink) && (
                        <p className="text-xs text-slate-400">Client will see this link in their dashboard once handed over.</p>
                      )}
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Timeline</h3>
                    <div className="space-y-3 pl-2 border-l border-slate-800 ml-2">
                      <div className="relative">
                        <div className="absolute w-2 h-2 bg-slate-500 rounded-full -left-[21px] top-1.5" />
                        <p className="text-sm text-slate-300">Created</p>
                        <p className="text-xs text-slate-500">{formatDateStable(bookingData.created_at)}</p>
                      </div>
                      {metadata.completedAt && (
                        <div className="relative">
                          <div className="absolute w-2 h-2 bg-emerald-500 rounded-full -left-[21px] top-1.5" />
                          <p className="text-sm text-emerald-400">Completed</p>
                          <p className="text-xs text-slate-500">{formatDateStable(metadata.completedAt)}</p>
                        </div>
                      )}
                      {metadata.inEditingAt && (
                        <div className="relative">
                          <div className="absolute w-2 h-2 bg-purple-500 rounded-full -left-[21px] top-1.5" />
                          <p className="text-sm text-purple-400">In Editing</p>
                          <p className="text-xs text-slate-500">{formatDateStable(metadata.inEditingAt)}</p>
                        </div>
                      )}
                      {metadata.handedOverAt && (
                        <div className="relative">
                          <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[21px] top-1.5" />
                          <p className="text-sm text-indigo-400">Handed Over</p>
                          <p className="text-xs text-slate-500">{formatDateStable(metadata.handedOverAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
