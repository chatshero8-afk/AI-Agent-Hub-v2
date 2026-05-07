import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  X,
  RefreshCw,
  Info,
  Undo2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../AuthProvider';
import { AppNotification } from '../../types';

export default function NotificationsPanel() {
  const { user } = useAuth();
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppNotification));
      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return AlertCircle;
      case 'task_progress': return CheckCircle2;
      case 'task_correction': return Undo2;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'task_assigned': return 'text-indigo-400';
      case 'task_progress': return 'text-emerald-400';
      case 'task_correction': return 'text-amber-400';
      case 'info': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'task_assigned': return 'bg-indigo-400/10';
      case 'task_progress': return 'bg-emerald-400/10';
      case 'task_correction': return 'bg-amber-400/10';
      case 'info': return 'bg-blue-400/10';
      default: return 'bg-white/5';
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const recentNotifications = notifications.slice(0, 4);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={20} className={cn("transition-colors", unreadCount > 0 ? "text-indigo-400" : "text-slate-400")} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#070b14] animate-pulse"></span>
            )}
          </div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Alerts</h2>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAllAlerts(true)}
            className="text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-slate-200 transition-colors"
          >
            View all ({notifications.length})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-[1.5rem] bg-white/5 border border-white/5 animate-pulse" />
          ))
        ) : recentNotifications.length === 0 ? (
          <div className="col-span-full py-8 text-center border border-dashed border-white/10 rounded-[1.5rem] bg-black/10">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Alerts</p>
          </div>
        ) : (
          recentNotifications.map((notif) => {
            const Icon = getIcon(notif.type);
            return (
              <motion.div 
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => markAsRead(notif.id)}
                className={cn(
                  "group relative overflow-hidden rounded-[1.5rem] p-4 transition-all duration-300 cursor-pointer",
                  "bg-[#151c2b]/80 border backdrop-blur-md",
                  !notif.read ? "border-indigo-500/30 shadow-[0_8px_30px_rgba(99,102,241,0.15)] hover:bg-[#1a2235]" : "border-transparent opacity-70 hover:opacity-100 bg-white/5"
                )}
              >
                <div className="relative z-10 flex gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", getBg(notif.type), getColor(notif.type), "border-white/5")}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-bold text-white truncate">{notif.title}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 shrink-0">{formatTime(notif.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug line-clamp-2">{notif.message}</p>
                  </div>
                </div>

                {!notif.read && (
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-8 rounded-full bg-indigo-500/50 blur-sm" />
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* View All Modal */}
      <AnimatePresence>
        {showAllAlerts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#121826] border border-white/10 rounded-[2rem] p-6 w-full max-w-2xl shadow-2xl relative max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Bell size={24} className="text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter drop-shadow-md">Past Alerts</h3>
                </div>
                <button 
                  onClick={() => setShowAllAlerts(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center border border-white/5 hover:border-rose-500/30 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 font-bold uppercase tracking-widest text-sm">No notification history</div>
                ) : (
                  notifications.map((notif) => {
                    const Icon = getIcon(notif.type);
                    return (
                      <div 
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 flex gap-4 cursor-pointer",
                          "bg-[#151c2b]/80 border backdrop-blur-md",
                          !notif.read ? "border-indigo-500/30 shadow-[0_8px_30px_rgba(99,102,241,0.12)] hover:bg-[#1a2235]" : "border-transparent opacity-70 hover:opacity-100 bg-white/5"
                        )}
                      >
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", getBg(notif.type), getColor(notif.type), "border-white/5")}>
                          <Icon size={22} />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-base font-bold text-white">{notif.title}</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 shrink-0">{formatTime(notif.createdAt)}</span>
                          </div>
                          <p className="text-sm text-slate-400 leading-snug">{notif.message}</p>
                          {notif.senderName && <p className="text-[10px] text-indigo-400/70 mt-1 uppercase font-black">From: {notif.senderName}</p>}
                        </div>

                        {!notif.read && (
                          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-8 rounded-full bg-indigo-500/50 blur-sm" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  );
}
