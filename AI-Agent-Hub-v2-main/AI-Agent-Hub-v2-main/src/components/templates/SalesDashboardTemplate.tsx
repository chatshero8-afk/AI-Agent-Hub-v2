import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, LabelList } from 'recharts';
import { Trophy, Coins, Target, Award, Wallet, Phone, PhoneOff, Users, ArrowUpRight, ArrowDownRight, Activity, Handshake, ChevronRight, ActivitySquare, MonitorPlay, BarChart3, Presentation, Briefcase, Filter, Upload, History, Clock, DollarSign, Calendar, ShoppingBag, RefreshCcw, LayoutDashboard, Check, Landmark, MousePointer2, Sparkles, CreditCard, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#8b5cf6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#cbd5e1'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const salesData = MONTHS.map((m, i) => ({
  name: m,
  sales: [300000, 480000, 430000, 750000, 1286450, 700000, 800000, 850000, 1200000, 1000000, 800000, 950000][i]
}));

const closingData = MONTHS.map((m, i) => ({
  name: m,
  rate: [18.5, 16.2, 14.8, 20.1, 22.7, 15.3, 16.1, 21.4, 18.2, 16.5, 19.3, 22.0][i]
}));

const industryData = [
  { name: 'Real Estate', value: 452180, pct: '35.1%' },
  { name: 'Education', value: 206743, pct: '22.1%' },
  { name: 'Finance', value: 191540, pct: '14.9%' },
  { name: 'Retail', value: 142990, pct: '11.1%' },
  { name: 'Tech', value: 105650, pct: '8.2%' },
  { name: 'Others', value: 96990, pct: '7.7%' },
];

const systemActivities = [
  { time: '09:30', name: 'Alex W.', text: 'Completed client follow-up - Sunshine Properties', tag: 'Follow-up', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
  { time: '09:15', name: 'Sarah L.', text: 'Created new sales opportunity - Pioneer Education', tag: 'Opportunity', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20' },
  { time: '09:05', name: 'David C.', text: 'Updated client status - Global Finance Group', tag: 'Follow-up', color: 'text-primary dark:text-purple-400 bg-primary/10 dark:bg-primary/10 border-primary/20 dark:border-primary/20 dark:border-primary/30' },
  { time: '08:50', name: 'Emma R.', text: 'Updated deal amount - Smart Tech Mfg.', tag: 'Deal', color: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' },
  { time: '08:30', name: 'System', text: 'Generated daily call report - 90%', tag: 'System', color: 'text-primary dark:text-purple-400 bg-primary/10 dark:bg-primary/10 border-primary/20 dark:border-primary/20 dark:border-primary/30' },
];

export default function SalesDashboardTemplate() {
  const [startDate, setStartDate] = useState('2025-05-01');
  const [endDate, setEndDate] = useState('2025-05-31');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState('2025-05-01');
  const [tempEndDate, setTempEndDate] = useState('2025-05-31');
  const [activePreset, setActivePreset] = useState('Last 30 days');

  const handleOpenDatePicker = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setShowDatePicker(true);
  };

  const handleSaveDate = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setShowDatePicker(false);
  };

  const setPreset = (preset: string) => {
    setActivePreset(preset);
    const today = new Date();
    let start = '';
    let end = '';
    if (preset === 'Today') {
      start = end = today.toISOString().split('T')[0];
    } else if (preset === 'Yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      start = end = y.toISOString().split('T')[0];
    } else if (preset === 'Last 7 days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 7);
      start = past.toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
    } else if (preset === 'Last 14 days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 14);
      start = past.toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
    } else if (preset === 'Last 30 days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      start = past.toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
    } else if (preset === 'This month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (preset === 'Last month') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
      end = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
    } else if (preset === 'This year') {
      start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      end = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
    }
    
    if (start && end) {
      setTempStartDate(start);
      setTempEndDate(end);
    }
  };


  interface KpiCardProps {
    icon: any;
    titleEn: string;
    titleCn: string;
    value: string | number;
    trend: string;
    trendDir: 'up' | 'down';
    unit?: string;
    color?: 'purple' | 'blue' | 'teal' | 'red' | 'indigo' | 'emerald';
  }

  const KpiCard = ({ icon: Icon, titleEn, titleCn, value, trend, trendDir, unit = '', color = 'indigo' }: KpiCardProps) => {
    const getColorClasses = () => {
      switch(color) {
        case 'purple': return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/10', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]' };
        case 'blue': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/10', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]' };
        case 'teal': return { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/10', glow: 'shadow-[0_0_20px_rgba(20,184,166,0.2)]' };
        case 'red': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/10', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]' };
        case 'emerald': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/10', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' };
        case 'indigo': return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/10', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)]' };
        default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/10', glow: 'none' };
      }
    };
    const c = getColorClasses();

    return (
      <div className="bg-[#0f0f1b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-[185px] shadow-2xl group transition-all duration-300">
        {/* Header: Icon + Titles */}
        <div className="flex items-center gap-4">
           <div className={`w-11 h-11 rounded-full ${c.bg} flex items-center justify-center ${c.text} border ${c.border} ${c.glow} shrink-0`}>
             <Icon size={18} strokeWidth={2.5} />
           </div>
           <div className="flex flex-col">
             <h4 className="text-[15px] font-black text-white italic tracking-tight leading-tight">{titleEn}</h4>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-0.5">{titleCn}</p>
           </div>
        </div>

        {/* Main Value */}
        <div className="mt-2">
           <div className="flex items-baseline">
             {unit === 'RM' && <span className="text-[12px] font-black text-white/40 italic mr-1.5 translate-y-[-1px]">RM</span>}
             <span className="text-3xl md:text-3xl lg:text-4xl font-black text-white italic tracking-tighter leading-none">{value}</span>
             {unit !== 'RM' && unit && <span className="text-base font-black text-white/40 italic ml-1.5">{unit}</span>}
           </div>
        </div>

        {/* Footer: Trend */}
        <div className="flex items-center justify-between mt-auto">
           <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.1em]">vs last month</span>
           <div className={`flex items-center gap-1.5 font-black text-[15px] italic ${trendDir === 'up' ? 'text-[#00ff9d]' : 'text-[#ff2a5f]'}`}>
             {trendDir === 'up' ? '↗' : '↘'} {trend}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full font-sans px-2 sm:px-4 md:px-6 pb-8">
      {/* Top Header Filter Row */}
      <div className="flex justify-end items-center mb-8 gap-3 flex-wrap relative">
        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest text-[10px]">Date Range:</label>
        
        <button 
          onClick={handleOpenDatePicker}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {startDate} - {endDate}
        </button>

        <button 
          onClick={() => {
            const btn = document.getElementById('refresh-icon');
            if(btn) { btn.classList.add('animate-spin'); setTimeout(() => btn.classList.remove('animate-spin'), 1000); }
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-2 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 ml-1 transition-all"
        >
           <svg id="refresh-icon" className="w-5 h-5 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </button>

        {showDatePicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)}></div>
            <div className="absolute top-12 right-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl w-[480px] p-0 flex flex-col md:flex-row overflow-hidden">
              
              {/* Presets Sidebar */}
              <div className="w-full md:w-36 bg-slate-50 dark:bg-slate-800/50 py-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 flex flex-row md:flex-col overflow-x-auto">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Recently Used</div>
                {['Today', 'Yesterday', 'Last 7 days', 'Last 14 days', 'Last 30 days', 'This month', 'Last month', 'This year'].map(preset => (
                  <button 
                    key={preset}
                    onClick={() => setPreset(preset)}
                    className={`text-left px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${activePreset === preset ? 'bg-primary/10 text-primary dark:text-purple-400 font-bold border-l-2 border-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 border-l-2 border-transparent'}`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Date Pickers */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Start Date</label>
                    <input 
                      type="date"
                      value={tempStartDate}
                      onChange={e => { setTempStartDate(e.target.value); setActivePreset('Custom'); }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">End Date</label>
                    <input 
                      type="date"
                      value={tempEndDate}
                      onChange={e => { setTempEndDate(e.target.value); setActivePreset('Custom'); }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button 
                    onClick={() => setShowDatePicker(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveDate}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                  >
                    Update
                  </button>
                </div>
              </div>
              
            </div>
          </>
        )}
      </div>

      <div className="space-y-8">
        {/* Main KPI Row (6 items) at the TOP */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-4">
          <KpiCard icon={Trophy} color="purple" titleEn="Total Sales" titleCn="(SALES)" value="1,286,450" unit="RM" trend="18.6%" trendDir="up" />
          <KpiCard icon={Briefcase} color="indigo" titleEn="Total Deals" titleCn="(DEALS CLOSED)" value="356" trend="12.4%" trendDir="up" />
          <KpiCard icon={Target} color="purple" titleEn="Closing Rate" titleCn="(CONVERSION RATE)" value="22.7" unit="%" trend="1.2pp" trendDir="up" />
          <KpiCard icon={Phone} color="blue" titleEn="Calls Connected" titleCn="(CALLS OBJECTIVE)" value="1,200" trend="8.7%" trendDir="up" />
          <KpiCard icon={PieChartIcon} color="blue" titleEn="Connection Rate" titleCn="(CALL SUCCESS %)" value="82.5" unit="%" trend="4.7pp" trendDir="up" />
          <KpiCard icon={PhoneOff} color="red" titleEn="Missed Calls" titleCn="(MISSED)" value="58" trend="9.3%" trendDir="down" />
        </div>

        {/* Row 2: Sales Funnel & Payment Conversion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sales Conversion Funnel (Left) */}
          <div className="lg:col-span-4 bg-[#11111d] border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <h3 className="text-xs font-black text-white uppercase italic tracking-[0.2em] mb-1">
                  Sales Conversion Overview
                </h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Customer Journey Log</p>
              </div>
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/10 shadow-inner">
                <Filter size={16} />
              </div>
            </div>

            <div className="flex flex-col items-center">
               <div className="w-full max-w-[280px] h-[220px] relative mt-4">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                     <polygon points="0,0 100,0 85,25 15,25" fill="#8b5cf6" className="opacity-90" />
                     <polygon points="15,27 85,27 70,52 30,52" fill="#a78bfa" className="opacity-90" />
                     <polygon points="30,54 70,54 55,79 45,79" fill="#2dd4bf" className="opacity-90" />
                     <polygon points="45,81 55,81 50,100" fill="#34d399" className="opacity-90" />
                  </svg>
                  <div className="absolute top-[8%] left-1/2 -translate-x-1/2 text-[10px] text-white font-black tracking-widest uppercase">Leads: 1,982</div>
                  <div className="absolute top-[35%] left-1/2 -translate-x-1/2 text-[10px] text-white font-black tracking-widest uppercase">Appointment: 642</div>
                  <div className="absolute top-[62%] left-1/2 -translate-x-1/2 text-[10px] text-white font-black tracking-widest uppercase">Attended: 412</div>
                  <div className="absolute top-[88%] left-1/2 -translate-x-1/2 text-[10px] text-white font-black tracking-widest uppercase">Closed: 256</div>
               </div>
               
               <div className="w-full mt-10 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">MQL → SQL</p>
                    <p className="text-xl font-black text-white italic">32.4%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">SQL → Closed</p>
                    <p className="text-xl font-black text-[#00ff9d] italic">62.1%</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Payment Conversion (Right) - Using the KpiCard array logic */}
          <div className="lg:col-span-8 bg-[#11111d] border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/10 shadow-inner">
                  <CreditCard size={18} />
                </div>
                <h3 className="text-sm font-black text-white uppercase italic tracking-[0.2em]">Payment Conversion Analysis</h3>
              </div>
              <div className="flex gap-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5 whitespace-nowrap">Live Stream</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                 {[
                   { titleEn: "Paid Customers", titleCn: "(FULLY BILLED)", value: "98", unit: "Pax", icon: Check, trend: "8.6%", trendDir: "up", color: "emerald" },
                   { titleEn: "Deposit", titleCn: "(BOOKING FEE)", value: "56", unit: "Pax", icon: Landmark, trend: "10.7%", trendDir: "up", color: "emerald" },
                   { titleEn: "Paid Conv.", titleCn: "(FINAL PMT %)", value: "15.6", unit: "%", icon: RefreshCcw, trend: "2.1pp", trendDir: "up", color: "emerald" },
                   { titleEn: "Deposit Conv.", titleCn: "(DEP RATE)", value: "8.9", unit: "%", icon: MousePointer2, trend: "1.4pp", trendDir: "up", color: "emerald" },
                   { titleEn: "Pending", titleCn: "(UNBILLED VOL)", value: "156", unit: "Pax", icon: Wallet, trend: "12.3%", trendDir: "up", color: "indigo" },
                   { titleEn: "Follow-up", titleCn: "(NEEDS ACTION)", value: "42", unit: "Lead", icon: Sparkles, trend: "9.1%", trendDir: "up", color: "indigo" }
                 ].map((kpi, i) => (
                   <KpiCard 
                     key={i}
                     icon={kpi.icon}
                     titleEn={kpi.titleEn}
                     titleCn={kpi.titleCn}
                     value={kpi.value}
                     unit={kpi.unit}
                     trend={kpi.trend}
                     trendDir={kpi.trendDir as 'up' | 'down'}
                     color={kpi.color as any}
                   />
                 ))}
            </div>
          </div>
        </div>
                {/* Bottom Bento Layout: Ads Performance, Cases, Industry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Ads Performance Analysis (Left) */}
          <div className="lg:col-span-3 bg-[#11111d] border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <h3 className="text-xs font-black text-white uppercase italic tracking-[0.2em] mb-1">
                    Ads Performance
                  </h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Marketing ROI</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/10 shadow-inner">
                  <MonitorPlay size={16} />
                </div>
              </div>

              <div className="space-y-6 flex-1 flex flex-col justify-center">
                 {[
                   { label: "Total Spent", val: "RM 58,420", trend: "+11.5%", icon: DollarSign, color: "text-blue-400", bg: "bg-blue-500/10" },
                   { label: "Leads", val: "325", trend: "+8.1%", icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                   { label: "Appointment", val: "156", trend: "+9.7%", icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10" },
                   { label: "ROAS", val: "4.38x", trend: "+0.5x", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between group/item">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center ${item.color} border border-white/5 shadow-inner group-hover/item:scale-110 transition-transform`}>
                          <item.icon size={18} strokeWidth={2} />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{item.label}</p>
                          <p className="text-sm font-black text-white italic tracking-tight">{item.val}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black italic ${item.trend.startsWith('+') ? 'text-[#00ff9d]' : 'text-[#ff2a5f]'}`}>{item.trend}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Recent Closed Cases (Middle) */}
          <div className="lg:col-span-6 bg-[#11111d] border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col">
                <h3 className="text-xs font-black text-white uppercase italic tracking-[0.2em] mb-1">
                  Recent Closed Cases
                </h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Live Transaction Stream</p>
              </div>
              <button className="text-[9px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-[0.2em] flex items-center gap-1.5 group/btn bg-primary/5 px-4 py-2 rounded-full border border-primary/20">
                Full Log <ArrowUpRight size={12} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                 <thead>
                   <tr className="text-[8px] font-black text-slate-500 underline uppercase tracking-[0.3em]">
                     <th className="pb-5">Client</th>
                     <th className="pb-5">Status</th>
                     <th className="pb-5">Value</th>
                     <th className="pb-5 text-right">Date</th>
                   </tr>
                 </thead>
                 <tbody className="text-[10px] font-bold text-white">
                   {[
                     { name: 'Sunshine Estate', amount: '128,690', date: 'May 31', status: 'Completed', color: 'text-emerald-400' },
                     { name: 'Qihang Group', amount: '98,540', date: 'May 30', status: 'Processing', color: 'text-blue-400' },
                     { name: 'Global Finance', amount: '76,320', date: 'May 29', status: 'Active', color: 'text-purple-400' },
                     { name: 'Smart Tech Mfg', amount: '112,300', date: 'May 28', status: 'In Review', color: 'text-amber-400' },
                     { name: 'Youyi Retail', amount: '68,210', date: 'May 27', status: 'Pending', color: 'text-slate-400' },
                   ].map((row, i) => (
                     <tr key={i} className="border-b last:border-0 border-white/5 hover:bg-white/5 transition-colors">
                       <td className="py-4 pr-4 font-black">{row.name}</td>
                       <td className="py-4 px-4 text-[8px] uppercase tracking-widest">
                         <span className={row.color}>{row.status}</span>
                       </td>
                       <td className="py-4 px-4 font-black text-[#00ff9d]">RM {row.amount}</td>
                       <td className="py-4 pl-4 text-slate-500 font-mono text-[9px] text-right">{row.date}</td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            </div>
          </div>

          {/* Industry Distribution (Right) - Replanned as Donut */}
          <div className="lg:col-span-3 bg-[#11111d] border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="flex flex-col h-full">
               <div className="flex items-center justify-between mb-8">
                 <div className="flex flex-col">
                   <h3 className="text-xs font-black text-white uppercase italic tracking-[0.2em] mb-1">
                     Industry Mix
                   </h3>
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Revenue Attribution</p>
                 </div>
                 <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/10 shadow-inner">
                   <PieChartIcon size={16} />
                 </div>
               </div>

               <div className="flex-1 flex flex-col items-center justify-center relative min-h-[160px]">
                  <ResponsiveContainer width="100%" height={160}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Real Estate', value: 35.1, color: '#a85cf6' },
                          { name: 'Education', value: 22.1, color: '#3b82f6' },
                          { name: 'Financial', value: 14.9, color: '#10b981' },
                          { name: 'Retail', value: 11.1, color: '#f59e0b' },
                          { name: 'Others', value: 16.8, color: '#6366f1' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {[0,1,2,3,4].map((i) => <Cell key={i} fill={['#a85cf6','#3b82f6','#10b981','#f59e0b','#6366f1'][i]} />)}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-2">
                     <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Growth</p>
                     <p className="text-lg font-black text-white italic">+24%</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-2 mt-4 text-[8px] font-bold text-white uppercase tracking-widest">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Real Estate</div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Education</div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Finance</div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Retail</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
