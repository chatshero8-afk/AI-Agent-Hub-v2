import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield,
  Crown,
  CheckCircle2,
  Zap,
  Award,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { cn } from '../lib/utils';

export default function Profile() {
  const { profile } = useAuth();

  const vanguardHistory = [
    { id: 1, title: 'RTST', sub: 'CHATSHERO', date: 'FORGED: MAY 2026', icon: Zap, color: 'bg-green-500/20 text-green-400' },
    { id: 2, title: 'AI SALES', sub: 'CHATSHERO', date: 'FORGED: MAY 2026', icon: Award, color: 'bg-purple-500/20 text-purple-400' },
    { id: 3, title: 'DOUBLE KILL', sub: 'CHATSHERO', date: 'FORGED: MAY 2026', icon: TrendingUp, color: 'bg-blue-500/20 text-blue-400' },
  ];
  
  return (
    <div className="min-h-screen bg-[#070b14] text-white pb-20 pt-6 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* 1. EPIC HERO SECTION - "THE FORGE" DESIGN */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-[#121826] to-[#070b14] border border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
        >
          {/* Visual FX Layers */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-t from-transparent via-transparent to-indigo-500/5 pointer-events-none" />
          
          <div className="relative p-10 lg:p-14 flex flex-col lg:flex-row items-center gap-12">
            {/* Left: Brand Identity */}
            <div className="flex-1 space-y-10 text-center lg:text-left z-10">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <span className="px-5 py-2 bg-indigo-500/15 border border-indigo-400/30 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  NEW LEGEND FORGED
                </span>
                <div className="flex items-center gap-2.5 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <Crown size={14} className="text-purple-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">SUPERIOR ARCHITECT</span>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-[7rem] lg:text-[9rem] font-black italic tracking-tighter uppercase leading-[0.75] drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                  AI <span className="text-slate-300">WRITE</span>
                </h1>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-14 pt-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 p-2.5 border border-white/10 shadow-2xl backdrop-blur-xl">
                    <img src={profile?.avatar || "/images/8.svg"} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">ARCHITECT</p>
                    <p className="text-2xl font-black text-white uppercase tracking-tighter">{profile?.name || 'CHATSHERO'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">FORGE DATE</p>
                  <p className="text-2xl font-black text-white uppercase tracking-tighter">06 MAY 2026</p>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">ACTIVE STATUS</p>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse" />
                      <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-40" />
                    </div>
                    <p className="text-2xl font-black text-emerald-400 uppercase tracking-tighter">UNIT OPERATIONAL</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle: Character Visual */}
            <div className="relative w-72 h-72 lg:w-[420px] lg:h-[420px] shrink-0 group">
              <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-[100px] scale-75 group-hover:scale-90 transition-all duration-1000 opacity-60" />
              <motion.img 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                src="/images/2.svg" 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_35px_60px_rgba(0,0,0,0.6)]"
                alt="Character"
              />
            </div>

            {/* Right: History Feed */}
            <div className="w-full lg:w-80 shrink-0 z-10">
              <div className="bg-[#1a212e]/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-7 space-y-7 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Shield size={18} className="text-indigo-400" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-300">VANGUARD HISTORY</span>
                </div>
                
                <div className="space-y-6">
                  {vanguardHistory.map((item) => (
                    <div key={item.id} className="flex items-center gap-5 group cursor-default">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110", item.color)}>
                        <item.icon size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-base font-black text-white italic tracking-tighter uppercase">{item.title}</p>
                          <CheckCircle2 size={12} className="text-emerald-400/40" />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                          <span className="text-indigo-400">@</span> {item.sub}
                        </p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em] mt-1">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
