// src/components/ProfileSheetsStats.tsx
// ─────────────────────────────────────────────────────────────────
// Drop this component into Profile.tsx to replace hardcoded numbers
// with real Google Sheets data.
//
// Usage in Profile.tsx — find the "Current Month Sales" section and
// wrap the stats with <ProfileSheetsStats />.
//
// Or use the hook directly:
//   const stats = useConsultantStats(profile?.name);
//   Then replace hardcoded values with stats.xxx
// ─────────────────────────────────────────────────────────────────

import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useSheetsData, type SheetsStats } from '../lib/useSheetsData';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';

export default function ProfileSheetsStats() {
  const { profile } = useAuth();
  const { stats, loading, refetch, connected } = useSheetsData(profile?.name || 'Jacky');

  // Calculate days left in month
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - new Date().getDate();

  if (!connected) {
    return (
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
        <WifiOff size={10} /> Sheets Connection Required
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
        <RefreshCw size={10} className="animate-spin" /> Fetching Neural Data...
      </div>
    );
  }

  const s = stats as SheetsStats;
  if (!s) return null;

  return (
    <div className="space-y-8 w-full group">
       {/* Top Header Labels */}
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Output Result</span>
            <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(139,92,246,1)]" />
              Live KPI
            </span>
         </div>
         <div className="text-[10px] font-black text-[#ff2a5f] bg-[#ff2a5f]/10 px-4 py-1.5 rounded-full border border-[#ff2a5f]/30 drop-shadow-[0_0_8px_rgba(255,42,95,0.4)] flex items-center gap-2">
           <span className="animate-pulse">⌛</span> {daysLeft} Days Left
         </div>
       </div>

       {/* Main "Big Numbers" section */}
       <div className="relative pt-2">
          <div className="flex items-center gap-3 mb-2">
             <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] drop-shadow-[0_0_5px_rgba(0,255,157,0.8)]" />
             <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Month Sales</span>
          </div>

          <div className="flex items-baseline gap-4">
             <div className="relative">
                <span className="text-6xl sm:text-7xl lg:text-[8rem] xl:text-[9rem] font-black text-[#00ff9d] leading-[0.9] tracking-tighter drop-shadow-[0_0_35px_rgba(0,255,157,0.7)] transition-all duration-500 font-sans italic">
                  RM {s.currentMonthSales.toLocaleString()}
                </span>
             </div>
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <p className="text-[11px] font-bold text-[#00ff9d] drop-shadow-[0_0_5px_rgba(0,255,157,0.4)] flex items-center gap-1.5 uppercase tracking-wider">
              ▲ {stats?.salesGrowth || '0'}% <span className="text-slate-500 font-medium drop-shadow-none cursor-default">vs last month</span>
            </p>
          </div>
       </div>

       {/* Horizontal Stats Row */}
       <div className="flex flex-wrap gap-x-12 gap-y-6 pt-4">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Cases Closed</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 dark:text-white leading-none tracking-tighter font-sans italic">
                {s.totalDeals}
              </span>
              <span className="bg-[#00ff9d]/10 text-[#00ff9d] px-2 py-1 rounded text-[9px] font-black uppercase border border-[#00ff9d]/20 drop-shadow-[0_0_8px_rgba(0,255,157,0.3)]">
                +{s.casesClosedRecent} Recent
              </span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Closing Rate</p>
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#a78bfa] leading-none tracking-tighter font-sans italic drop-shadow-[0_0_15px_rgba(167,139,250,0.4)]">
              {s.closingRate}%
            </span>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Engagements</p>
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#3b82f6] leading-none tracking-tighter font-sans italic drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              {s.engagements}
            </span>
          </div>

          <div className="group/bonus">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-1">
              <span className="text-amber-500">🔗</span> Bonus Earned
            </p>
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#ffaa00] leading-none tracking-tighter font-sans italic drop-shadow-[0_0_20px_rgba(255,170,0,0.6)] group-hover/bonus:drop-shadow-[0_0_35px_rgba(255,170,0,1)] transition-all">
              RM {s.bonusEarned?.toLocaleString()}
            </span>
          </div>
       </div>

       {/* Footer Sync Status */}
       <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5 opacity-50">
          <div className="flex items-center gap-3">
             <div className={cn("w-2 h-2 rounded-full", !connected ? "bg-red-500 animate-pulse" : "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]")}/>
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
               {!connected ? "Sync Error" : `Neural Sync: Active • ${s.leads || 0} Records Processed`}
             </span>
          </div>
          <button onClick={refetch} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors group/refresh">
             <RefreshCw size={12} className={cn("text-slate-400 group-hover/refresh:text-primary", loading && "animate-spin")} />
          </button>
       </div>
    </div>
  );
}

