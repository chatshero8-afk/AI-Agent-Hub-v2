import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronRight, X, Info, PartyPopper } from 'lucide-react';
import { MALAYSIAN_HOLIDAYS_2026, Holiday } from '../constants/holidays';
import { cn } from '../lib/utils';

export default function HolidayBar() {
  const [showFullRegistry, setShowFullRegistry] = useState(false);
  
  // Current date for simulation (May 2026 based on system time)
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // getMonth() is 0-indexed
  
  // Filter holidays for the current month
  const currentMonthHolidays = useMemo(() => {
    return MALAYSIAN_HOLIDAYS_2026.filter(h => h.month === currentMonth);
  }, [currentMonth]);

  const monthName = today.toLocaleString('en-US', { month: 'long' });

  if (currentMonthHolidays.length === 0 && !showFullRegistry) {
    // Optional: Return a small prompt to view all holidays even if none this month
    return (
      <div className="flex justify-end px-6 mb-2">
        <button 
          onClick={() => setShowFullRegistry(true)}
          className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-wider"
        >
          <Calendar size={10} /> View Holiday Calendar
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative px-6 py-3 mb-6">
        <div className="flex items-center gap-4 bg-white/5 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg group overflow-hidden">
          {/* Animated Background Accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-violet-500/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3">
             <div className="p-2 bg-primary/20 rounded-xl text-primary animate-pulse">
                <PartyPopper size={20} />
             </div>
             <div>
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1">
                  Public Holidays in {monthName}
                </h4>
                <div className="flex gap-4 items-center">
                  {currentMonthHolidays.length > 0 ? (
                    currentMonthHolidays.map((h, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                          {h.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {new Date(h.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm font-bold text-slate-500 italic">No public holidays this month</span>
                  )}
                </div>
             </div>
          </div>

          <div className="ml-auto relative z-10">
            <button 
              onClick={() => setShowFullRegistry(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-primary text-white rounded-xl text-xs font-black transition-all group/btn border border-white/10"
            >
              LEARN MORE <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Holiday Modal */}
      <AnimatePresence>
        {showFullRegistry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowFullRegistry(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                <div>
                   <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Holiday Registry</h2>
                   <p className="text-sm font-bold text-primary tracking-tight">Malaysian Public Holidays 2026</p>
                </div>
                <button 
                  onClick={() => setShowFullRegistry(false)}
                  className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 no-scrollbar">
                <div className="grid grid-cols-1 gap-3">
                  {MALAYSIAN_HOLIDAYS_2026.map((h, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "p-4 rounded-2xl border transition-all flex items-center justify-between group",
                        h.month === currentMonth 
                          ? "bg-primary/10 border-primary shadow-lg shadow-primary/10" 
                          : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black",
                          h.month === currentMonth ? "bg-primary text-white" : "bg-slate-200 dark:bg-white/5 text-slate-500"
                        )}>
                          {h.month}
                        </div>
                        <div>
                          <h4 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                            {h.name}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(h.date).toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      {h.month === currentMonth && (
                        <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/30">
                          Active Month
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Info size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400 leading-relaxed uppercase tracking-wider">
                    Dates for lunar-based holidays (Chinese New Year, Hari Raya, Deepavali) are approximate and subject to official sighting components.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
