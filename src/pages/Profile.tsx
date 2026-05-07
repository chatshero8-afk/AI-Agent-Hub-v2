import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Crown,
  Star,
  Gift,
  ChevronRight,
  CalendarCheck,
  CheckCircle2,
  Calendar,
  Info,
  X
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '../lib/utils';
import { playEpicGamingAlert } from '../lib/sounds';
import TodoSection from '../components/profile/TodoSection';
import LeaveDashboardModal from '../components/profile/LeaveDashboardModal';
import NotificationsPanel from '../components/profile/NotificationsPanel';

export default function Profile() {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showAttendanceInfo, setShowAttendanceInfo] = useState(false);
  const [showTreasurePopup, setShowTreasurePopup] = useState(false);
  const [demoStreak, setDemoStreak] = useState<number | null>(null);
  const { profile } = useAuth();
  
  // Calculate attendance info based on current month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const checkedInDates = profile?.checkedInDates || [];
  const formattedToday = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  const hasCheckedInToday = checkedInDates.includes(formattedToday);
  
  const checkinsThisMonth = checkedInDates.filter(d => {
    if (!d) return false;
    const [y, m] = d.split('-');
    return parseInt(y) === currentYear && parseInt(m) === currentMonth + 1;
  });
  
  const attendancePercentage = Math.round((checkinsThisMonth.length / daysInMonth) * 100);
  const daysLeft = daysInMonth - checkinsThisMonth.length;
  
  // Calculate attendance bonus
  const streak = demoStreak !== null ? demoStreak : (profile?.attendanceStreak || 0);
  let bonusAmount = 300;
  if (streak === 2) {
    bonusAmount = 400;
  } else if (streak >= 3) {
    bonusAmount = 500;
  }

  return (
    <div className="w-full text-white pb-20 pt-6 selection:bg-indigo-500/30">
      <AnimatePresence>
        {showTreasurePopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="relative z-10 flex flex-col items-center justify-center text-center p-12"
            >
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,#fbbf24_360deg)] animate-[spin_3s_linear_infinite] rounded-full blur-2xl opacity-50 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4" />
              
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="w-48 h-48 rounded-full mb-8 relative flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-amber-400/20 shadow-[0_0_100px_rgba(251,191,36,0.6)] rounded-full blur-xl" />
                <Crown size={80} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] z-10" />
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 uppercase tracking-tighter drop-shadow-2xl mb-4"
              >
                Streak Increased!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-amber-200/80 font-bold max-w-lg mx-auto leading-relaxed"
              >
                Your dedication pays off. Bonus is now <span className="text-white text-3xl mx-2">{bonusAmount}</span> Credits!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
          
          <div className="relative p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-32">
            
            {/* Left: Brand Identity */}
            <div className="flex-1 space-y-8 text-center lg:text-left z-10 max-w-xl">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <span className="px-5 py-2 bg-indigo-500/15 border border-indigo-400/30 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  NEW LEGEND FORGED
                </span>
                <div className="flex items-center gap-2.5 px-4 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <Crown size={14} className="text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">SUPERIOR ARCHITECT</span>
                </div>
              </div>

              <div className="space-y-4 lg:space-y-2">
                <h1 className="text-[3.5rem] leading-[0.9] sm:text-[4.5rem] lg:text-[6rem] font-black italic tracking-tighter uppercase lg:leading-[0.85] drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] ml-1">
                  HELLO <br className="hidden lg:block"/><span className="text-slate-300 lg:pl-2">{profile?.name || 'CHATSHERO'}</span>
                </h1>
              </div>

              <div className="flex flex-col gap-8 pt-4">
                <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-8 lg:gap-10">
                  
                  {/* Avatar with Circular Progress */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    {/* SVG Progress Circle */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                      {/* Background Track */}
                      <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                      {/* Progress Line */}
                      <circle 
                        cx="50" cy="50" r="44" 
                        fill="none" 
                        stroke="#d8b4fe" // match reference light purple
                        strokeWidth="6" 
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 44} 
                        strokeDashoffset={(2 * Math.PI * 44) - (attendancePercentage / 100) * (2 * Math.PI * 44)} 
                        style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                      />
                    </svg>
                    
                    {/* Badge */}
                    <div className="absolute top-1 right-0 translate-x-3 -translate-y-1 z-10">
                      <div className="bg-[#2a1a08] text-amber-500 border border-amber-600/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-lg">
                        Active Streak
                      </div>
                    </div>
                    
                    {/* Inner Avatar Image */}
                    <div className="w-[96px] h-[96px] rounded-full bg-[#121826] overflow-hidden flex items-center justify-center z-0 p-1 relative group cursor-pointer border border-white/5">
                      <img src={profile?.avatar || "/images/8.svg"} alt="Logo" className="w-full h-full object-cover rounded-full transition-all group-hover:opacity-40 bg-indigo-600" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xl font-bold text-white drop-shadow-md">{attendancePercentage}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Info */}
                  <div className="text-center lg:text-left py-2 relative">
                    <div className="flex items-start justify-center lg:justify-start gap-2">
                      <p className="text-xl lg:text-2xl font-bold text-[#f8fafc] leading-tight">Full Attendance <br className="hidden lg:block"/>Bonus</p>
                      <button 
                        onClick={() => setShowAttendanceInfo(!showAttendanceInfo)}
                        className="text-slate-400 hover:text-indigo-400 transition-colors mt-1"
                      >
                        <Info size={18} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {showAttendanceInfo && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute top-12 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 mt-2 w-72 bg-[#121826]/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-4 shadow-2xl z-50 text-left"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Bonus Tiers</h4>
                            <button onClick={() => setShowAttendanceInfo(false)} className="text-slate-400 hover:text-rose-400 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                              <span className="text-slate-300 font-semibold">1 Month Streak</span>
                              <span className="font-bold text-indigo-400">300 Credits</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                              <span className="text-slate-300 font-semibold">2 Month Streak</span>
                              <span className="font-bold text-indigo-400">400 Credits</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                              <span className="text-indigo-200 font-bold">3+ Month Streak</span>
                              <span className="font-bold text-indigo-400">500 Credits (Max)</span>
                            </div>
                            <div className="p-2 mt-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                              <p className="text-[10px] text-rose-300">
                                * Missing full attendance resets streak to 300 credits.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <p className="text-4xl lg:text-5xl font-black text-[#d8b4fe] mt-2 mb-2 tracking-tight">{bonusAmount} Credits</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                        <CalendarCheck size={14} className="text-amber-400" />
                        <p className="text-xs font-semibold text-slate-300">{daysLeft} more days</p>
                      </div>
                      <button 
                        onClick={() => setShowLeaveModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] cursor-pointer"
                      >
                        <Calendar size={14} className="mb-0.5" />
                        Apply Leave
                      </button>
                      <button 
                        onClick={() => {
                          const nextStreak = streak + 1;
                          setDemoStreak(nextStreak);
                          playEpicGamingAlert();
                          setShowTreasurePopup(true);
                          setTimeout(() => setShowTreasurePopup(false), 5000);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg bg-amber-600 hover:bg-amber-500 text-white border border-amber-400/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer ml-2"
                      >
                        Simulate Next Month
                      </button>
                    </div>
                  </div>

                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-12 mt-4 pt-6 border-t border-white/10">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">JOINED DATE</p>
                    <p className="text-xl font-black text-white uppercase tracking-tighter">06 MAY 2026</p>
                  </div>

                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">BIRTH DATE</p>
                    <p className="text-xl font-black text-white uppercase tracking-tighter">15 AUG 1998</p>
                  </div>

                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">ROLE</p>
                    <p className="text-xl font-black text-white uppercase tracking-tighter">{profile?.role?.replace('_', ' ') || 'Pending'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Character Visual and Rewards */}
            <div className="flex flex-col items-center gap-6 z-10 shrink-0">
              <div className="relative w-72 h-72 lg:w-[460px] lg:h-[460px] group perspective-1000 lg:-mt-12">
                {/* Spotlight base light */}
                <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-[100px] scale-75 group-hover:scale-90 transition-all duration-1000 opacity-60" />
                
                {/* Animated Spotlight Cone */}
                <motion.div 
                  className="absolute -top-40 left-1/2 -translate-x-1/2 w-40 h-[600px] bg-gradient-to-b from-white/30 via-indigo-400/10 to-transparent blur-3xl origin-top rounded-full pointer-events-none z-20"
                  animate={{ rotate: [-8, 8, -8], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                  className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-[500px] bg-gradient-to-b from-purple-400/20 via-blue-500/10 to-transparent blur-2xl origin-top rounded-full pointer-events-none z-20"
                  animate={{ rotate: [5, -5, 5], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />

                {/* Pedestal/Floor glow for spotlight */}
                <motion.div 
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-20 bg-indigo-500/40 rounded-[100%] blur-2xl z-0"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.img 
                  animate={{ y: [32, 12, 32] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  src="/Profile/Irish.svg" 
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_35px_60px_rgba(0,0,0,0.8)]"
                  alt="Character"
                />
              </div>

              {/* Rewards Cards */}
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[460px] relative z-20">
                {/* Reward Points */}
                <div className="flex-1 bg-[#151c2b]/95 border border-white/5 rounded-[1.5rem] p-5 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Star className="text-purple-400 fill-purple-400" size={20} />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Reward Points</span>
                      <span className="text-2xl font-black text-white tracking-tight">12,450</span>
                      <span className="text-[10px] font-bold text-emerald-400 mt-1.5">+350 this week</span>
                    </div>
                  </div>
                </div>

                {/* Rewards Redeemed */}
                <div className="flex-1 bg-[#151c2b]/95 border border-white/5 rounded-[1.5rem] p-5 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Gift className="text-purple-400" size={20} />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Rewards Redeemed</span>
                      <span className="text-2xl font-black text-white tracking-tight">24</span>
                      <button className="text-[10px] font-bold text-indigo-400 mt-1.5 flex items-center hover:text-indigo-300 transition-colors">
                        View history <ChevronRight size={12} className="ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* 2. NOTIFICATIONS SECTION */}
        <div className="w-full">
          <NotificationsPanel />
        </div>

        {/* 3. TASK SECTION */}
        <div className="w-full">
          <TodoSection />
        </div>
      </div>

      <LeaveDashboardModal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} />
    </div>
  );
}
