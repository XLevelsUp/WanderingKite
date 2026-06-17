'use client';

import React, { useEffect, useState, useContext } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationContext } from '@/components/ui/NotificationProvider';

interface Notification {
  id: string;
  clientId: string;
  clientName: string;
  serviceType: string;
  createdAt: Date;
  read: boolean;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const notificationCtx = useContext(NotificationContext);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role === 'SUPER_ADMIN') {
        setIsSuperAdmin(true);
      }
    };
    checkRole();
  }, [supabase]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const handleNewBooking = async (payload: any, serviceType: string) => {
      const { new: newBooking } = payload;
      if (!newBooking || !newBooking.client_id) return;

      // Fetch client name
      const { data: client } = await supabase
        .from('clients')
        .select('name')
        .eq('id', newBooking.client_id)
        .single();

      const clientName = client?.name || 'Unknown Client';

      const notification: Notification = {
        id: newBooking.id,
        clientId: newBooking.client_id,
        clientName,
        serviceType,
        createdAt: new Date(),
        read: false,
      };

      setNotifications((prev) => [notification, ...prev]);
      router.refresh(); // Refresh the server components to update counts and lists

      // Show toast
      if (notificationCtx) {
        notificationCtx.showInfo(`New booking from ${clientName} — ${serviceType}`, {
          title: `New booking from ${clientName} — ${serviceType}`,
          message: 'A new booking request has been received.',
          action: (
            <button
              onClick={() => router.push(`/dashboard/clients/${newBooking.client_id}`)}
              className="text-amber-500 font-bold underline text-xs hover:text-amber-400"
            >
              View Booking
            </button>
          ),
        });
      }
    };

    const handleNewIdProof = async (payload: any) => {
      const { new: newProof, old: oldProof } = payload;
      if (!newProof || !newProof.client_id) return;

      // Only notify if it's newly inserted or status changed to PENDING
      if (payload.eventType === 'UPDATE' && (oldProof.status === newProof.status || newProof.status !== 'PENDING')) return;

      // Fetch client name
      const { data: client } = await supabase
        .from('clients')
        .select('name')
        .eq('id', newProof.client_id)
        .single();

      const clientName = client?.name || 'Unknown Client';

      const notification: Notification = {
        id: `id_proof_${newProof.id}_${Date.now()}`,
        clientId: newProof.client_id,
        clientName,
        serviceType: 'ID Verification',
        createdAt: new Date(),
        read: false,
      };

      setNotifications((prev) => [notification, ...prev]);
      router.refresh();

      // Show toast
      if (notificationCtx) {
        notificationCtx.showInfo(`New ID Proof from ${clientName}`, {
          title: `ID Verification Required`,
          message: `${clientName} has uploaded a new ID document for review.`,
          action: (
            <button
              onClick={() => router.push(`/dashboard/clients/${newProof.client_id}`)}
              className="text-amber-500 font-bold underline text-xs hover:text-amber-400"
            >
              View Document
            </button>
          ),
        });
      }
    };

    const channel = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photography_bookings' },
        (payload) => handleNewBooking(payload, 'Photography')
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'studio_bookings' },
        (payload) => handleNewBooking(payload, 'Studio')
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rental_bookings' },
        (payload) => handleNewBooking(payload, 'Rental')
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'client_id_proofs' },
        (payload) => handleNewIdProof(payload)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'client_id_proofs' },
        (payload) => handleNewIdProof(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router, notificationCtx, isSuperAdmin]);

  if (!isSuperAdmin) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleView = (clientId: string) => {
    setIsOpen(false);
    router.push(`/dashboard/clients/${clientId}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-slate-800 shadow-xl rounded-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900/50 sticky top-0 backdrop-blur-md">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="p-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={`${n.id}-${n.createdAt.getTime()}`}
                      className={`p-3 rounded-xl border transition-colors ${
                        n.read
                          ? 'border-transparent bg-transparent hover:bg-slate-800/50'
                          : 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-200">
                            New {n.serviceType} Booking
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                            From: <span className="font-semibold text-slate-300">{n.clientName}</span>
                          </p>
                          <p className="text-[9px] text-slate-500 mt-1">
                            {n.createdAt.toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.map((notif) =>
                                notif.id === n.id ? { ...notif, read: true } : notif
                              )
                            );
                            handleView(n.clientId);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-medium rounded text-slate-300 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
