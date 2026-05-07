import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Calendar as CalendarIcon, CheckCircle2, XCircle, AlertCircle, Clock, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function NotificationsPanel() {
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  
  const allNotifications = [
    {
      id: 1,
      type: 'task_reminder',
      title: 'Task Due Soon',
      desc: 'Upgrade AI Model due in 2 hours',
      time: 'Just now',
      unread: true,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20'
    },
    {
      id: 2,
      type: 'leave_approved',
      title: 'Leave Request Approved',
      desc: 'Medical Leave (MC) for 29 May approved.',
      time: '2 hours ago',
      unread: true,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20'
    },
    {
      id: 3,
      type: 'leave_rejected',
      title: 'Leave Request Rejected',
      desc: 'Annual leave (AL) for 12 Jun rejected. See notes.',
      time: '1 day ago',
      unread: false,
      icon: XCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
      border: 'border-rose-400/20'
    },
    {
      id: 4,
      type: 'task_assigned',
      title: 'New Task Assigned',
      desc: 'Bob assigned "Review Chat Logs" to you.',
      time: '2 days ago',
      unread: false,
      icon: AlertCircle,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
      border: 'border-indigo-400/20'
    },
    {
      id: 5,
      type: 'leave_approved',
      title: 'Leave Request Approved',
      desc: 'Annual Leave (AL) for 15 May approved.',
      time: '1 week ago',
      unread: false,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20'
    },
    {
      id: 6,
      type: 'task_completed',
      title: 'Task Completed',
      desc: 'You completed "Write documentation".',
      time: '2 weeks ago',
      unread: false,
      icon: CheckCircle2,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
      border: 'border-indigo-400/20'
    }
  ];

  const recentNotifications = allNotifications.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={20} className="text-slate-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#070b14]"></span>
          </div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Alerts</h2>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAllAlerts(true)}
            className="text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-slate-200 transition-colors"
          >
            View all
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentNotifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <motion.div 
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "group relative overflow-hidden rounded-[1.5rem] p-4 transition-all duration-300",
                "bg-[#151c2b]/80 border backdrop-blur-md",
                notif.unread ? "border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:bg-[#1a2235]" : "border-transparent opacity-70 hover:opacity-100 bg-white/5"
              )}
            >
              <div className="relative z-10 flex gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", notif.bg, notif.color, notif.border)}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-bold text-white truncate">{notif.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug line-clamp-2">{notif.desc}</p>
                </div>
              </div>

              {/* Unread Indicator */}
              {notif.unread && (
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-8 rounded-full bg-indigo-500/50 blur-sm" />
              )}
            </motion.div>
          );
        })}
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
                <div className="flex items-center gap-3">
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
                {allNotifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div 
                      key={notif.id}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 flex gap-4",
                        "bg-[#151c2b]/80 border backdrop-blur-md",
                        notif.unread ? "border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:bg-[#1a2235]" : "border-transparent opacity-70 hover:opacity-100 bg-white/5"
                      )}
                    >
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", notif.bg, notif.color, notif.border)}>
                        <Icon size={22} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-base font-bold text-white">{notif.title}</span>
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-snug">{notif.desc}</p>
                      </div>

                      {/* Unread Indicator */}
                      {notif.unread && (
                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-8 rounded-full bg-indigo-500/50 blur-sm" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
