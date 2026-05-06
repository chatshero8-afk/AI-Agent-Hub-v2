import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  Coins, 
  Award, 
  ListTodo, 
  CheckCircle2, 
  Plus, 
  Edit2, 
  Briefcase,
  TrendingUp,
  Filter,
  Zap,
  ArrowRight,
  Shield,
  Crown
} from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { cn } from '../lib/utils';

export default function StaffWorkspace() {
  const { profile } = useAuth();
  const [activeView, setActiveView] = useState<'list' | 'board'>('list');

  // Mock tasks matching the UI requirements (Active Operations)
  const tasks = [
    { id: '1', title: 'Update POS sync checking', source: 'SELF', supervisor: 'MEI LING', status: 'PENDING', statusColor: 'bg-red-500', reward: '+20 pts', due: 'NO DEADLINE' },
    { id: '2', title: 'Fix CRM login issue', source: 'ADMIN', supervisor: 'JASON', status: 'ONGOING', statusColor: 'bg-blue-500', reward: '+35 pts', due: '12 MAY' },
    { id: '3', title: 'Server backup report', source: 'SELF', supervisor: 'TAN', status: 'PENDING', statusColor: 'bg-orange-500', reward: '+30 pts', due: 'TODAY' },
    { id: '4', title: 'Clean duplicate records', source: 'SELF', supervisor: 'MEI LING', status: 'COMPLETED', statusColor: 'bg-green-500', reward: '+50 pts', due: 'DONE' },
    { id: '5', title: 'Inventory module test', source: 'SELF', supervisor: 'JASON', status: 'ONGOING', statusColor: 'bg-blue-500', reward: '+25 pts', due: 'FRIDAY' },
  ];

  const vanguardHistory = [
    { id: 1, title: 'RTST', sub: 'CHATSHERO', date: 'FORGED: MAY 2026', icon: Zap, color: 'bg-green-500/20 text-green-400' },
    { id: 2, title: 'AI SALES', sub: 'CHATSHERO', date: 'FORGED: MAY 2026', icon: Award, color: 'bg-purple-500/20 text-purple-400' },
    { id: 3, title: 'DOUBLE KILL', sub: 'CHATSHERO', date: 'FORGED: MAY 2026', icon: TrendingUp, color: 'bg-blue-500/20 text-blue-400' },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-white pb-20 pt-6 selection:bg-indigo-500/30">
      <div className="max-w-[1600px] mx-auto px-6 space-y-12">
        
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
          
          <div className="relative p-10 lg:p-16 flex flex-col lg:flex-row items-center gap-16">
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
                <h1 className="text-[9rem] lg:text-[11rem] font-black italic tracking-tighter uppercase leading-[0.75] drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
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
            <div className="relative w-80 h-80 lg:w-[480px] lg:h-[480px] shrink-0 group">
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
            <div className="w-full lg:w-85 shrink-0 z-10">
              <div className="bg-[#1a212e]/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
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

        {/* 2. ATTENDANCE & REWARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* ATTENDANCE LOG */}
          <div className="lg:col-span-2 bg-[#121826]/50 backdrop-blur-2xl rounded-[3.5rem] border border-white/5 p-12 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tight">ATTENDANCE LOG</h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.25em] mt-2">REWARD MULTIPLIERS ACTIVE</p>
              </div>
              <div className="px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-lg shadow-emerald-950/20">
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-400">PERFECT STREAK: 12 DAYS</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="bg-white/5 rounded-3xl p-8 border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] group hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-emerald-500/15 rounded-xl shadow-lg ring-1 ring-emerald-500/20">
                      <Clock size={20} className="text-emerald-400" />
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">TODAY STATUS</span>
                  </div>
                  <div className="relative">
                    <p className="text-2xl font-bold text-slate-200">Clocked at <span className="text-emerald-400">08:56 AM</span></p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">STATUS: PUNCTUAL</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-3xl p-8 border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] group hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-500/15 rounded-xl shadow-lg ring-1 ring-blue-500/20">
                      <TrendingUp size={20} className="text-blue-400" />
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">MONTHLY PULSE</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-200">Bonus Tier: <span className="text-blue-400 italic">Diamond</span></p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 italic shadow-inner">PROJECTED PAYOUT: +300 CR</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5 shadow-[inset_0_4px_20px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-4 mb-10">
                  <Briefcase size={18} className="text-slate-500" />
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">LEAVE CREDIT STATUS</span>
                </div>
                <div className="space-y-10">
                  {[
                    { label: 'ANNUAL LEAVE', val: 0, total: 14, color: 'bg-blue-500' },
                    { label: 'MEDICAL LEAVE', val: 0, total: 10, color: 'bg-orange-500' },
                    { label: 'EMERGENCY', val: 0, total: 3, color: 'bg-rose-500' },
                  ].map((leave, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{leave.label}</span>
                        <span className="text-sm font-black text-slate-100">{leave.val} <span className="text-slate-600">/ {leave.total}</span></span>
                      </div>
                      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(1 - leave.val / leave.total) * 100}%` }}
                          className={cn("h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.3)]", leave.color)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* REWARD STORE CARDS */}
          <div className="space-y-8 flex flex-col">
            {/* 1. GOLD BALANCE CARD (REWARD STORE) */}
            <motion.div 
              whileHover={{ scale: 1.02, translateY: -5 }}
              className="relative flex-1 p-10 rounded-[2.5rem] bg-gradient-to-br from-[#b8860b] via-[#d4af37] to-[#8b7000] shadow-[0_20px_50px_-10px_rgba(212,175,55,0.4)] overflow-hidden group border border-white/20"
            >
              <div className="absolute top-6 right-6 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-xs font-black shadow-xl">1</div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 bg-[#0a0e14] rounded-2xl flex items-center justify-center shadow-2xl ring-1 ring-white/10">
                    <Coins size={32} className="text-amber-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-black/60 uppercase tracking-widest">CURRENT BALANCE</p>
                    <h4 className="text-5xl font-black tracking-tight text-[#0a0e14]">3,883 <span className="text-xl">PTS</span></h4>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <p className="text-[11px] font-black text-black/60 uppercase tracking-[0.2em] border-b border-black/10 pb-2">AVAILABLE REWARDS</p>
                  <div className="space-y-3">
                    {[
                      { label: 'RM10 Food Voucher', cost: '100 pts' },
                      { label: 'Grab Discount RM5', cost: '50 pts' },
                      { label: 'Starbucks Drink', cost: '150 pts' },
                      { label: 'Cinema Ticket', cost: '200 pts' },
                    ].map((reward, i) => (
                      <div key={i} className="flex items-center justify-between group/item">
                        <span className="text-sm font-black text-[#0a0e14]/80">{reward.label}</span>
                        <button className="px-3 py-1 bg-black/10 hover:bg-black/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#0a0e14] transition-all">
                          Redeem {reward.cost}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Background Glows */}
              <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-white/20 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
            </motion.div>

            {/* 2. BLUE DISCOUNT CARD */}
            <motion.div 
              whileHover={{ scale: 1.02, translateY: -5 }}
              className="relative flex-1 p-10 rounded-[2.5rem] bg-[#0c162d] border border-blue-500/30 shadow-[0_20px_50px_-10px_rgba(30,58,138,0.6)] overflow-hidden group"
            >
              <div className="absolute top-6 right-6 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-xs font-black shadow-xl">2</div>
              <div className="relative z-10 space-y-10">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-full blur-[3px] shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
                  <span className="text-2xl font-black tracking-tighter text-slate-100 italic uppercase">Grab Rewards</span>
                </div>
                <div className="space-y-6">
                  <div className="bg-blue-400/5 backdrop-blur-3xl rounded-2xl p-4 border border-blue-500/20 text-center shadow-inner">
                    <p className="text-lg font-black text-blue-400 tracking-tight">RM5 Promo Code (-50 PTS)</p>
                  </div>
                  <button className="w-full py-5 bg-blue-600 rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] hover:bg-blue-500 active:scale-[0.98] transition-all">
                    兑换
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none" />
            </motion.div>

            {/* 3. GREEN SUCCESS CARD */}
            <motion.div 
              whileHover={{ scale: 1.02, translateY: -5 }}
              className="relative flex-1 p-10 rounded-[2.5rem] bg-[#164132] border border-emerald-500/30 shadow-[0_20px_50px_-10px_rgba(6,78,59,0.6)] overflow-hidden group"
            >
              <div className="absolute top-6 right-6 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-xs font-black shadow-xl">3</div>
              <div className="relative z-10 flex flex-col items-center text-center space-y-6 py-4 h-full justify-center">
                <div className="w-16 h-16 bg-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.4)] group-hover:scale-110 transition-transform duration-500">
                  <CheckCircle2 size={32} className="text-emerald-950" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-4xl font-black tracking-tight text-emerald-50 italic">RM10 VOUCHER</h4>
                  <p className="text-base font-black text-emerald-400/80 uppercase tracking-widest leading-snug">
                    已加入购物车<br/><span className="text-white/40">-100 PTS</span>
                  </p>
                </div>
              </div>
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />
            </motion.div>
          </div>
        </div>

        {/* 3. ACTIVE OPERATIONS SECTION - REFINED TABLE DESIGN */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121826]/40 backdrop-blur-2xl rounded-[3.5rem] border border-white/5 p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-16">
            <div className="space-y-1">
              <h3 className="text-4xl font-black uppercase tracking-tight">ACTIVE OPERATIONS</h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">GROWTH TASKS CONTRIBUTE TO BADGE XP</p>
            </div>
            
            <div className="flex items-center gap-3 bg-[#070b14] p-2 rounded-[1.5rem] border border-white/5 shadow-inner">
              <button 
                onClick={() => setActiveView('list')}
                className={cn(
                  "px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                  activeView === 'list' ? "bg-blue-600 text-white shadow-[0_10px_30px_-5px_rgba(37,99,235,0.6)]" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                )}
              >
                LIST
              </button>
              <button 
                onClick={() => setActiveView('board')}
                className={cn(
                  "px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                  activeView === 'board' ? "bg-blue-600 text-white shadow-[0_10px_30px_-5px_rgba(37,99,235,0.6)]" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                )}
              >
                BOARD
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-left min-w-[1000px] border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em]">
                  <th className="px-8 pb-4">TASK DEFINITION</th>
                  <th className="px-8 pb-4">OWNERSHIP</th>
                  <th className="px-8 pb-4">SUPERVISOR</th>
                  <th className="px-8 pb-4 text-center">STATE</th>
                  <th className="px-8 pb-4">XP REWARD</th>
                  <th className="px-8 pb-4 text-right"><Filter size={16} className="ml-auto opacity-40" /></th>
                </tr>
              </thead>
              <tbody className="font-sans">
                {tasks.map((task) => (
                  <tr key={task.id} className="group transition-all duration-300">
                    <td className="py-8 px-8 bg-[#1a212e]/40 first:rounded-l-[2rem] border-y border-l border-white/5 group-hover:bg-white/10 transition-colors">
                      <p className="font-black text-lg text-slate-200 uppercase tracking-tight group-hover:text-white">{task.title}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase mt-1 tracking-widest flex items-center gap-2">
                        <Clock size={10} className="text-slate-600" />
                        DUE: {task.due}
                      </p>
                    </td>
                    <td className="py-8 px-8 bg-[#1a212e]/40 border-y border-white/5 group-hover:bg-white/10">
                      <span className={cn(
                        "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-inner",
                        task.source === 'SELF' ? "bg-[#070b14] text-slate-500" : "bg-blue-900/40 text-blue-300 border border-blue-500/20"
                      )}>
                        {task.source}
                      </span>
                    </td>
                    <td className="py-8 px-8 bg-[#1a212e]/40 border-y border-white/5 group-hover:bg-white/10 text-xs font-black text-slate-400 uppercase tracking-[0.1em]">
                      {task.supervisor}
                    </td>
                    <td className="py-8 px-8 bg-[#1a212e]/40 border-y border-white/5 group-hover:bg-white/10 text-center">
                      <div className="flex justify-center">
                        <span className={cn(
                          "px-8 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-2xl min-w-[140px] inline-flex items-center justify-center gap-3",
                          task.statusColor
                        )}>
                          {task.status === 'ONGOING' && (
                            <div className="flex gap-1.5">
                              <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                              <div className="w-5 h-1.5 bg-white rounded-full animate-pulse" />
                              <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                            </div>
                          )}
                          {task.status === 'PENDING' && <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping opacity-60" />}
                          {task.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-8 px-8 bg-[#1a212e]/40 border-y border-white/5 group-hover:bg-white/10 text-[11px] font-black text-purple-400 tracking-[0.25em] italic">
                      {task.reward}
                    </td>
                    <td className="py-8 px-8 bg-[#1a212e]/40 last:rounded-r-[2rem] border-y border-r border-white/5 group-hover:bg-white/10 text-right">
                      <button className="p-3.5 bg-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5 shadow-xl">
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Create Launchpad */}
          <div className="mt-12 flex flex-col lg:flex-row items-center justify-between gap-10 p-10 bg-[#070b14]/50 rounded-[2.5rem] border border-white/5 shadow-inner">
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_15px_40px_-5px_rgba(37,99,235,0.5)]">
                <Plus size={32} className="text-white" />
              </div>
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight">INITIALIZE OPERATION</h4>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">REPORT NEW ACTIVITY FOR XP VALIDATION</p>
              </div>
            </div>
            <button className="w-full lg:w-auto px-12 py-6 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-3xl text-sm font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:scale-[1.03] active:scale-95 transition-all text-white">
              LAUNCH TASK CREATOR
            </button>
          </div>
        </motion.div>

        {/* 4. UTILITY FOOTER NAV */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
          {[
            { label: 'MY WALLET', sub: 'HISTORY & CREDITS', icon: Coins, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: 'STAFF HANDBOOK', sub: 'VANGUARD PROTOCOLS', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'SUPPORT', sub: 'COMMAND FEEDBACK', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          ].map((item, idx) => (
            <motion.button 
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="group bg-[#121826]/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 flex items-center gap-8 hover:bg-white/5 transition-all text-left shadow-2xl"
            >
              <div className={cn("p-5 rounded-2xl group-hover:scale-110 transition-transform border border-white/5 shadow-2xl", item.bg)}>
                <item.icon size={28} className={item.color} />
              </div>
              <div className="flex-1">
                <p className="text-lg font-black uppercase tracking-widest text-slate-200">{item.label}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 opacity-60">{item.sub}</p>
              </div>
              <ArrowRight size={24} className="text-slate-700 group-hover:text-white group-hover:translate-x-2 transition-all" />
            </motion.button>
          ))}
        </div>

      </div>
    </div>
  );
}
