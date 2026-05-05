// src/pages/DataEntry.tsx
// ─────────────────────────────────────────────────────────────────
// Data Entry page — matches ChatsHero dashboard aesthetic exactly.
// Syncs directly to Google Sheets via Apps Script Web App.
// Add VITE_SHEETS_URL=https://script.google.com/macros/s/.../exec
// to your .env file to enable live sync.
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Plus, Search, RefreshCw, Download, Trash2,
  ChevronRight, Wifi, WifiOff, Loader2, X, Check,
  Users, Calendar, Phone, CheckSquare, Megaphone,
  XCircle, Banknote, Building2, AlertCircle, Settings2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../components/AuthProvider';

// ── Config ────────────────────────────────────────────────────────
const RAW_URL = import.meta.env.VITE_SHEETS_URL 
  || 'https://script.google.com/macros/s/AKfycbwOVVFP-PpVv3EbhPL__PWikpqAChYkvpJPMeOah1Ox3eRBNdEUx9F4AADDi19_qCP1/exec';

const SCRIPT_URL = RAW_URL.replace(/^["']|["']$/g, '').trim();

// ── Dropdown options ──────────────────────────────────────────────
const INDUSTRIES = [
  'e-Commerce','Beauty Services','Property Agent','Properties Management',
  'Financial & Loan','Education','Food & Beverage','Professional Services',
  'Auto Parts and Spare Parts','Manufacturer & Supplier','Construction & Renovations',
  'Telecommunication','Tour & Travel','Motor','Tyre','Online Casino',
  'Interior Design','Loan','Printing Service','Room Management','Marketing',
  'Retails','Others',
];
const PLANS = [
  'Starter (Q)','Starter (A)','Growth (Q)','Growth (A)',
  'Advance (Q)','Advance (A)','VIP (A)','WE-DO','Monthly','7-day free trial','Custom',
];
const SOURCES   = ['WhatsApp','Facebook','Instagram','Website','WhatsApp Casino','Referral'];
const TEAM      = ['Jacky','Collins','Raymond','William','Melissa','Chiun','CY','Fikri','Wei Xin','En Ting','Ling Hue'];
const S_CONTACT = ['New','Contacted','Appointment','No Appointment','Purchased','Not Interested','Pending'];
const S_APPT    = ['Upcoming','Attended','Absence','Reschedule','Cancelled','Done'];
const S_CALL    = ['📲 Called','☎️ Miss Call','WhatsApp','Rescheduled','Pending'];
const S_DEP     = ['Hold','Pending','Done','Cancelled'];

// ── Sheet definitions ─────────────────────────────────────────────
type SheetId = 'contacts'|'appointments'|'calling'|'checklist'|'blasting'|'cancelled'|'deposits'|'customers';

interface FieldDef {
  k: string; l: string; t: 'text'|'date'|'time'|'datetime-local'|'email'|'url'|'number'|'sel'|'ta';
  o?: string[]; req?: boolean; full?: boolean;
}

interface SheetDef {
  icon: React.ReactNode;
  label: string;
  color: string;
  fields: FieldDef[];
  cols: string[];
  rowFn: (r: any) => string[];
}

const SHEETS: Record<SheetId, SheetDef> = {
  contacts: {
    icon: <Users size={14}/>, label: 'New Contacts', color: 'text-violet-400',
    cols: ['Name','Contact','Date','Source','Company','Industry','Size','Status'],
    rowFn: r=>[r.name,r.phone,r.date,r.source,r.company,r.industry,r.companySize,r.status],
    fields: [
      {k:'date',l:'Date',t:'date',req:true},{k:'source',l:'Source',t:'sel',o:SOURCES},
      {k:'name',l:'Name',t:'text',req:true},{k:'phone',l:'Contact Number',t:'text',req:true},
      {k:'company',l:'Company Name',t:'text'},{k:'industry',l:'Industry',t:'sel',o:INDUSTRIES},
      {k:'companySize',l:'Company Size',t:'sel',o:['1-10','11-50','51-100','>100']},
      {k:'country',l:'Country',t:'text'},{k:'usedManychat',l:'Used Manychat?',t:'sel',o:['Yes','No']},
      {k:'email',l:'Email',t:'email'},{k:'status',l:'Status',t:'sel',o:S_CONTACT},{k:'adsId',l:'Ads ID',t:'text'},
    ],
  },
  appointments: {
    icon: <Calendar size={14}/>, label: 'Appointment List', color: 'text-blue-400',
    cols: ['Name','Contact','Date','Time','Assigned To','Company','Status'],
    rowFn: r=>[r.name,r.contact,r.date,r.time,r.assignedTo,r.company,r.status],
    fields: [
      {k:'assignedTo',l:'Assigned To',t:'sel',o:TEAM},{k:'date',l:'Appt. Date',t:'date',req:true},
      {k:'time',l:'Time',t:'time',req:true},{k:'name',l:'Name',t:'text',req:true},
      {k:'contact',l:'Contact',t:'text',req:true},{k:'company',l:'Company',t:'text'},
      {k:'industry',l:'Industry',t:'sel',o:INDUSTRIES},
      {k:'companySize',l:'Company Size',t:'sel',o:['1-10','11-50','51-100','>100']},
      {k:'status',l:'Status',t:'sel',o:S_APPT},{k:'source',l:'Source',t:'sel',o:SOURCES},
      {k:'demoRecording',l:'Demo Recording URL',t:'url',full:true},
    ],
  },
  calling: {
    icon: <Phone size={14}/>, label: 'Calling Schedule', color: 'text-green-400',
    cols: ['Customer','Phone','Date & Time','Status','Remark'],
    rowFn: r=>[r.customer,r.phone,r.callDateTime,r.status,r.remark],
    fields: [
      {k:'customer',l:'Customer',t:'text',req:true},{k:'phone',l:'Contact Number',t:'text',req:true},
      {k:'callDateTime',l:'Call Date & Time',t:'datetime-local',req:true},
      {k:'status',l:'Status',t:'sel',o:S_CALL},{k:'remark',l:'Remark',t:'ta',full:true},
    ],
  },
  checklist: {
    icon: <CheckSquare size={14}/>, label: 'App Checklist', color: 'text-emerald-400',
    cols: ['Project','Testing Bot','Actual No.','In Charge','Bot','Biz','Live Status'],
    rowFn: r=>[r.project,r.testingBot,r.actual,r.inCharge,r.botStatus,r.bizStatus,r.liveStatus],
    fields: [
      {k:'project',l:'Project',t:'text',req:true},{k:'testingBot',l:'Testing Bot No.',t:'text'},
      {k:'actual',l:'Actual Number',t:'text'},{k:'inCharge',l:'In Charge',t:'sel',o:TEAM},
      {k:'location',l:'Location / Note',t:'text'},
      {k:'botStatus',l:'Bot Status',t:'sel',o:['Active','Inactive','Pending']},
      {k:'bizStatus',l:'Biz Status',t:'sel',o:['Active','Inactive','Pending']},
      {k:'liveStatus',l:'Live Status',t:'sel',o:['Ready to use','Pending updates','Do Later']},
    ],
  },
  blasting: {
    icon: <Megaphone size={14}/>, label: "Colin's Blasting", color: 'text-orange-400',
    cols: ['Name','Contact','Date Sent','Campaign','Response'],
    rowFn: r=>[r.name,r.contact,r.dateSent,r.campaign,r.response],
    fields: [
      {k:'name',l:'Name',t:'text',req:true},{k:'contact',l:'Contact',t:'text'},
      {k:'dateSent',l:'Date Sent',t:'date'},{k:'campaign',l:'Campaign',t:'text'},
      {k:'response',l:'Response',t:'sel',o:['Replied','No Reply','Interested','Not Interested']},
      {k:'notes',l:'Notes',t:'ta',full:true},
    ],
  },
  cancelled: {
    icon: <XCircle size={14}/>, label: 'Plan Cancelled', color: 'text-red-400',
    cols: ['Customer','Plan','Currency','Amount','PIC','Reason'],
    rowFn: r=>[r.customerName,r.planCategory,r.currency,r.amount,r.projectPic,r.cancelledReason],
    fields: [
      {k:'customerName',l:'Customer Name',t:'text',req:true},
      {k:'planCategory',l:'Plan',t:'sel',o:['WE-DO','Starter','Growth','Advance','VIP']},
      {k:'email',l:'Email',t:'email'},{k:'currency',l:'Currency',t:'sel',o:['MYR','SGD','USD']},
      {k:'amount',l:'Amount',t:'number'},{k:'date',l:'Date',t:'date'},
      {k:'projectPic',l:'Project PIC',t:'sel',o:TEAM},
      {k:'cancelledReason',l:'Cancelled Reason',t:'ta',full:true},
      {k:'approved',l:'Approved',t:'sel',o:['Acceptable Reason','Review Needed','Rejected']},
    ],
  },
  deposits: {
    icon: <Banknote size={14}/>, label: 'Deposit', color: 'text-amber-400',
    cols: ['Name','Phone','Date (Bank In)','Industry','Consultant','Discount','Status'],
    rowFn: r=>[r.name,r.phone,r.dateBankIn,r.industry,r.consultant,r.discount,r.status],
    fields: [
      {k:'name',l:'Name',t:'text',req:true},{k:'phone',l:'Phone',t:'text',req:true},
      {k:'dateBankIn',l:'Date (Bank In)',t:'date'},{k:'industry',l:'Industry',t:'sel',o:INDUSTRIES},
      {k:'consultant',l:'Consultant',t:'sel',o:TEAM},{k:'discount',l:'Discount %',t:'text'},
      {k:'status',l:'Status',t:'sel',o:S_DEP},{k:'liveChatUrl',l:'Live Chat URL',t:'url'},
      {k:'driveLink',l:'Drive Link',t:'url'},{k:'remark',l:'Remark',t:'text',full:true},
    ],
  },
  customers: {
    icon: <Building2 size={14}/>, label: 'Customer Lists', color: 'text-pink-400',
    cols: ['Customer','Contact','Purchase Date','Industry','Plan','Sales','Status'],
    rowFn: r=>[r.customerName,r.contact,r.purchaseDate,r.industry,r.plan,r.salesConsultant,r.projectStatus],
    fields: [
      {k:'customerName',l:'Customer Name',t:'text',req:true},{k:'contact',l:'Contact',t:'text',req:true},
      {k:'purchaseDate',l:'Purchase Date',t:'date'},{k:'expiryDate',l:'Expiry Date',t:'date'},
      {k:'industry',l:'Industry',t:'sel',o:INDUSTRIES},{k:'email',l:'Email',t:'email'},
      {k:'plan',l:'Plan',t:'sel',o:PLANS},{k:'mainPic',l:'Main PIC',t:'sel',o:TEAM},
      {k:'salesConsultant',l:'Sales Consultant',t:'sel',o:TEAM},
      {k:'projectStatus',l:'Status',t:'sel',o:['Active','Pending','Cancelled','On Hold']},
      {k:'liveChatUrl',l:'Live Chat URL',t:'url',full:true},{k:'remark',l:'Remark',t:'ta',full:true},
    ],
  },
};

const SHEET_IDS = Object.keys(SHEETS) as SheetId[];

// ── Tab name mapping (frontend SheetId → Apps Script tab name) ────
const TAB_MAP: Record<SheetId, string> = {
  contacts:     'new_customer',
  appointments: 'appointment_lists',
  calling:      'calling_callback',
  checklist:    'app_checklist',
  blasting:     'blasting',
  cancelled:    'cancelled',
  deposits:     'deposit',
  customers:    'customers',
};

// ── API helpers ───────────────────────────────────────────────────
async function apiPost(tab: string, row: any, action = 'append') {
  if (!SCRIPT_URL || !SCRIPT_URL.startsWith('http')) throw new Error('No valid VITE_SHEETS_URL configured');
  const backendTab = TAB_MAP[tab as SheetId] || tab;
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ tab: backendTab, row, action }),
    redirect: 'follow',
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    if (text.includes('Page Not Found')) throw new Error('Google Apps Script URL is invalid (404)');
    throw new Error('Invalid response from server');
  }
}

async function apiGet(tab: string) {
  if (!SCRIPT_URL || !SCRIPT_URL.startsWith('http')) throw new Error('No valid VITE_SHEETS_URL configured');
  const backendTab = TAB_MAP[tab as SheetId] || tab;
  const fetchUrlMethod = SCRIPT_URL.includes('?') ? '&' : '?';
  const res = await fetch(`${SCRIPT_URL}${fetchUrlMethod}tab=${backendTab}&t=${Date.now()}`, {
    method: 'GET',
    redirect: 'follow',
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    if (text.includes('Page Not Found')) throw new Error('Google Apps Script URL is invalid (404)');
    throw new Error('Invalid response from server');
  }
}

// ── Status badge ──────────────────────────────────────────────────
function StatusBadge({ value }: { value: string }) {
  const green  = ['Active','Done','Attended','Ready to use','Purchased','Replied','Interested','Acceptable Reason'];
  const red    = ['Off','Cancelled','Absence','Not Interested','Rejected'];
  const orange = ['Pending','Hold','Pending updates','Reschedule','Review Needed'];
  const blue   = ['Upcoming','In Progress'];

  const cls = green.some(s => value?.includes(s))  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : red.some(s => value?.includes(s))              ? 'bg-red-500/10 text-red-400 border-red-500/20'
    : orange.some(s => value?.includes(s))           ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    : blue.some(s => value?.includes(s))             ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    : 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border', cls)}>
      <span className="w-1 h-1 rounded-full bg-current" />
      {value}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function DataEntry() {
  const { profile } = useAuth();
  const [activeSheet, setActiveSheet] = useState<SheetId>('contacts');
  const [data, setData]   = useState<Record<SheetId, any[]>>({
    contacts:[], appointments:[], calling:[], checklist:[],
    blasting:[], cancelled:[], deposits:[], customers:[],
  });
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState<Record<string, string>>({});
  const [saving, setSaving]   = useState(false);
  const [syncState, setSyncState] = useState<'idle'|'syncing'|'ok'|'error'>('idle');
  const [syncMsg, setSyncMsg] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [setupOpen, setSetupOpen] = useState(false);

  const sheet = SHEETS[activeSheet];
  const rows  = data[activeSheet];
  const filtered = search
    ? rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase())))
    : rows;

  // Auto-load sheet on tab switch
  useEffect(() => {
    if (!SCRIPT_URL) return;
    loadSheet(activeSheet);
  }, [activeSheet]);

  async function loadSheet(id: SheetId) {
    setSyncState('syncing'); setSyncMsg('Loading...');
    try {
      const j = await apiGet(id);
      if (j.ok) {
        setData(prev => ({ ...prev, [id]: j.rows || [] }));
        setSyncState('ok'); setSyncMsg(`✓ ${j.count} rows`);
      } else {
        setSyncState('error'); setSyncMsg('Load failed');
      }
    } catch (e: any) {
      setSyncState('error'); setSyncMsg(e.message);
    }
  }

  function openModal() {
    const today = new Date().toISOString().split('T')[0];
    const defaults: Record<string,string> = { date: today, dateBankIn: today, purchaseDate: today, dateSent: today };
    setForm(defaults);
    setModal(true);
  }

  function closeModal() { setModal(false); setForm({}); }

  async function saveRow() {
    const flds = sheet.fields;
    // Validate required
    for (const f of flds) {
      if (f.req && !form[f.k]?.trim()) {
        alert(`"${f.l}" is required.`); return;
      }
    }
    setSaving(true);
    // Optimistic local add
    const newRow = { ...form };
    setData(prev => ({ ...prev, [activeSheet]: [newRow, ...prev[activeSheet]] }));
    closeModal();

    try {
      const result = await apiPost(activeSheet, newRow, 'append');
      if (result.ok) {
        setSyncState('ok'); setSyncMsg('✓ Saved to Sheets');
        setTimeout(() => setSyncMsg('Connected'), 2500);
      } else {
        setSyncState('error'); setSyncMsg('Sync failed');
      }
    } catch (e: any) {
      setSyncState('error'); setSyncMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  function toggleSelect(i: number) {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(i) ? s.delete(i) : s.add(i);
      return s;
    });
  }

  function exportCSV() {
    if (!filtered.length) return;
    const hdrs = Object.keys(filtered[0]);
    const csv = [hdrs.join(','), ...filtered.map(r => hdrs.map(h => `"${(r[h]||'').replace(/"/g,'""')}"`).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `chatshero_${activeSheet}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  return (
    <div className="w-full space-y-0 -mt-8 -mx-12 min-h-[calc(100vh-120px)]">
      {/* ── Header ── */}
      <div className="px-12 pt-8 pb-0 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm sticky top-16 z-30">
        <div className="flex items-center gap-3 pb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
            <ClipboardList size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight italic text-slate-900 dark:text-white">Data Entry</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CRM Management System</p>
          </div>
        </div>

        {/* Sync status */}
        <div className="flex items-center gap-3 pb-4">
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all',
            syncState === 'ok'      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            syncState === 'error'   ? 'bg-red-500/10 text-red-400 border-red-500/20' :
            syncState === 'syncing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
          )} onClick={() => setSetupOpen(true)}>
            {syncState === 'syncing' ? <Loader2 size={10} className="animate-spin" /> :
             syncState === 'ok'      ? <Wifi size={10} /> :
             syncState === 'error'   ? <WifiOff size={10} /> :
                                       <Settings2 size={10} />}
            {syncState === 'idle' && !SCRIPT_URL ? 'Connect Sheets' : syncMsg || 'Not connected'}
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-white/5 transition-all">
            <Download size={10}/> Export CSV
          </button>
          <button onClick={openModal}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black bg-primary text-white hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Plus size={12}/> Add Row
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-172px)]">
        {/* ── Sidebar ── */}
        <div className="w-52 shrink-0 border-r border-slate-200 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 flex flex-col py-4 gap-1 overflow-y-auto">
          <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Sheet 1</p>
          {(['contacts','appointments','calling','checklist','blasting'] as SheetId[]).map(id => (
            <button key={id} onClick={() => { setActiveSheet(id); setSearch(''); setSelected(new Set()); }}
              className={cn(
                'flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-all text-left relative',
                activeSheet === id
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-white'
              )}>
              {activeSheet === id && <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r-full" />}
              <span className={cn(activeSheet === id ? 'text-primary' : SHEETS[id].color)}>{SHEETS[id].icon}</span>
              {SHEETS[id].label}
              <span className="ml-auto text-[9px] font-mono bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded-full text-slate-400">
                {data[id].length}
              </span>
            </button>
          ))}
          <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 mb-2">Sheet 2</p>
          {(['cancelled','deposits','customers'] as SheetId[]).map(id => (
            <button key={id} onClick={() => { setActiveSheet(id); setSearch(''); setSelected(new Set()); }}
              className={cn(
                'flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-all text-left relative',
                activeSheet === id
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-white'
              )}>
              {activeSheet === id && <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r-full" />}
              <span className={cn(activeSheet === id ? 'text-primary' : SHEETS[id].color)}>{SHEETS[id].icon}</span>
              {SHEETS[id].label}
              <span className="ml-auto text-[9px] font-mono bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded-full text-slate-400">
                {data[id].length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Table area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-200 dark:border-white/5 bg-white/20 dark:bg-slate-900/20 shrink-0">
            <button onClick={openModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-primary/30 hover:text-primary transition-all">
              <Plus size={11}/> Insert Row
            </button>
            {selected.size > 0 && (
              <button onClick={() => {
                setData(prev => ({ ...prev, [activeSheet]: prev[activeSheet].filter((_,i) => !selected.has(i)) }));
                setSelected(new Set());
              }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-200 dark:border-red-500/20 transition-all">
                <Trash2 size={11}/> Delete ({selected.size})
              </button>
            )}
            <div className="w-px h-4 bg-slate-200 dark:bg-white/10" />
            <button onClick={() => loadSheet(activeSheet)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:text-primary transition-all">
              <RefreshCw size={11} className={syncState === 'syncing' ? 'animate-spin' : ''}/> Refresh
            </button>
            <div className="flex items-center gap-2 ml-auto bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5">
              <Search size={12} className="text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="bg-transparent text-xs outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 w-40" />
            </div>
            <span className="text-[10px] font-mono text-slate-400">{filtered.length} rows</span>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse min-w-max">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="w-10 h-9 bg-slate-50 dark:bg-[#0f1020] border-b border-slate-200 dark:border-white/5 text-[9px] font-black text-slate-400 uppercase text-center">#</th>
                  {sheet.cols.map(c => (
                    <th key={c} className="h-9 px-4 bg-slate-50 dark:bg-[#0f1020] border-b border-r border-slate-200 dark:border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={sheet.cols.length + 1} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                          <ClipboardList size={20} className="opacity-40" />
                        </div>
                        <p className="text-sm font-bold">No entries yet</p>
                        <button onClick={openModal}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all">
                          <Plus size={12}/> Add First Row
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((row, i) => {
                  const cells = sheet.rowFn(row);
                  const isSelected = selected.has(i);
                  return (
                    <tr key={i}
                      className={cn(
                        'border-b border-slate-100 dark:border-white/[0.04] transition-colors group',
                        isSelected ? 'bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                      )}>
                      <td className="w-10 text-center">
                        <span onClick={() => toggleSelect(i)}
                          className={cn(
                            'inline-flex items-center justify-center w-5 h-5 rounded cursor-pointer border text-[9px] font-mono transition-all',
                            isSelected
                              ? 'bg-primary text-white border-primary'
                              : 'bg-transparent text-slate-400 border-slate-200 dark:border-white/10 hover:border-primary/40'
                          )}>
                          {isSelected ? <Check size={9}/> : i + 1}
                        </span>
                      </td>
                      {cells.map((cell, ci) => (
                        <td key={ci} className="px-4 py-2.5 border-r border-slate-100 dark:border-white/[0.04] text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                          {ci === sheet.cols.length - 1 || cell?.includes('%') || ['Status','status'].includes(sheet.cols[ci])
                            ? <StatusBadge value={cell} />
                            : cell || <span className="text-slate-300 dark:text-slate-600">—</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Status bar */}
          <div className="flex items-center px-4 py-1.5 border-t border-slate-200 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 shrink-0 gap-4">
            <span className="text-[10px] font-mono text-slate-400">
              {activeSheet} · <span className="text-primary font-bold">{filtered.length}</span> rows
              {selected.size > 0 && <> · <span className="text-amber-400">{selected.size} selected</span></>}
            </span>
            <span className="ml-auto text-[10px] text-slate-400">Click row # to select · Add row to sync to Sheets</span>
          </div>
        </div>
      </div>

      {/* ── Add Row Modal ── */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {sheet.icon}
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight text-slate-900 dark:text-white text-sm">
                      Add to {sheet.label}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Fill required fields (*) and click Save</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all">
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <div className="overflow-y-auto flex-1 px-6 py-5">
                <div className="grid grid-cols-2 gap-4">
                  {sheet.fields.map(f => (
                    <div key={f.k} className={cn('flex flex-col gap-1.5', f.full ? 'col-span-2' : '')}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {f.l}{f.req && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {f.t === 'sel' ? (
                        <select value={form[f.k] || ''} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all appearance-none cursor-pointer">
                          <option value="">Select...</option>
                          {(f.o || []).map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : f.t === 'ta' ? (
                        <textarea value={form[f.k] || ''} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                          rows={3} placeholder={`${f.l}...`}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none placeholder:text-slate-400" />
                      ) : (
                        <input type={f.t} value={form[f.k] || ''} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                          placeholder={`${f.l}...`}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-slate-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
                <p className="text-[10px] text-slate-400">
                  {SCRIPT_URL ? '✓ Will sync to Google Sheets' : '⚠ No Sheets URL — saves locally only'}
                </p>
                <div className="flex gap-3">
                  <button onClick={closeModal} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                    Cancel
                  </button>
                  <button onClick={saveRow} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black bg-primary text-white hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50">
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    {saving ? 'Saving...' : 'Save to Sheets'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Setup Modal ── */}
      <AnimatePresence>
        {setupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSetupOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black uppercase text-slate-900 dark:text-white tracking-tight">Connect Google Sheets</h3>
                <button onClick={() => setSetupOpen(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400"><X size={14}/></button>
              </div>
              <div className="space-y-3 mb-5 text-xs text-slate-500 bg-slate-50 dark:bg-white/5 rounded-2xl p-4 leading-relaxed border border-slate-100 dark:border-white/5">
                <p className="font-bold text-slate-700 dark:text-slate-200">Setup Steps:</p>
                <p>1. Add to your <code className="bg-slate-200 dark:bg-white/10 px-1 rounded text-primary">.env</code> file:</p>
                <pre className="bg-slate-100 dark:bg-black/30 px-3 py-2 rounded-xl text-[10px] font-mono text-primary overflow-x-auto">
                  VITE_SHEETS_URL=https://script.google.com/macros/s/AKfycbwOVVFP-PpVv3EbhPL__PWikpqAChYkvpJPMeOah1Ox3eRBNdEUx9F4AADDi19_qCP1/exec
                </pre>
                <p>2. Restart the dev server (<code className="text-primary">npm run dev</code>)</p>
                <p>3. The Data Entry page will auto-connect on refresh</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSetupOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-500">Close</button>
                <button onClick={() => { setSetupOpen(false); loadSheet(activeSheet); }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-primary text-white">
                  Test Connection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
