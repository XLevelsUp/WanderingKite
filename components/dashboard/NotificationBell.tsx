'use client';

import React, { useEffect, useState, useContext } from 'react';
import { Bell, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationContext } from '@/components/ui/NotificationProvider';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  reference_id: string;
  client_id: string;
  is_read: boolean;
  created_at: string;
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

    // 1. Fetch initial unread/recent notifications from DB
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (!error && data) {
        setNotifications(data as Notification[]);
      }
    };
    fetchNotifications();

    // 2. Realtime listener for the new table
    const handleNewNotification = (payload: any) => {
      const newNotif = payload.new as Notification;
      if (!newNotif) return;

      setNotifications((prev) => [newNotif, ...prev]);
      router.refresh();

      // Show toast popup when notification arrives
      if (notificationCtx && !newNotif.is_read) {
        notificationCtx.showInfo(newNotif.title, {
          title: newNotif.title,
          message: newNotif.message,
          action: (
            <button
              onClick={() => {
                supabase.from('admin_notifications').update({ is_read: true }).eq('id', newNotif.id).then();
                router.push(`/dashboard/clients/${newNotif.client_id}`);
              }}
              className="text-amber-500 font-bold underline text-xs hover:text-amber-400"
            >
              View Details
            </button>
          ),
        });
      }
    };

    const channel = supabase
      .channel('admin-notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
        handleNewNotification
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'admin_notifications' },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router, notificationCtx, isSuperAdmin]);

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isSuperAdmin) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllAsRead = async () => {
    // Optimistically update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    // Persist to DB
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      await supabase.from('admin_notifications').update({ is_read: true }).in('id', unreadIds);
    }
  };

  const handleMarkAsRead = async (notifId: string) => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)));
    // Persist to DB
    supabase.from('admin_notifications').update({ is_read: true }).eq('id', notifId).then();
  };

  const handleView = async (clientId: string, notifId: string) => {
    setIsOpen(false);
    
    // Mark specific notification as read in DB
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)));
    supabase.from('admin_notifications').update({ is_read: true }).eq('id', notifId).then();
    
    router.push(`/dashboard/clients/${clientId}`);
  };
  return (
    <div className="relative" ref={dropdownRef}>
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
                {notifications.filter(n => !n.is_read).length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.filter(n => !n.is_read).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border transition-colors ${
                        n.is_read
                          ? 'border-transparent bg-transparent hover:bg-slate-800/50'
                          : 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-200">
                            {n.title}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 break-words">
                            {n.message}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-1">
                            {new Date(n.created_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => handleView(n.client_id, n.id)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-medium rounded text-slate-300 transition-colors w-full text-center"
                          >
                            View
                          </button>
                          {!n.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(n.id);
                              }}
                              className="px-2 py-1 hover:bg-amber-500/10 text-amber-500 text-[10px] font-medium rounded transition-colors flex items-center justify-center gap-1 w-full"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3" />
                              Read
                            </button>
                          )}
                        </div>
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
