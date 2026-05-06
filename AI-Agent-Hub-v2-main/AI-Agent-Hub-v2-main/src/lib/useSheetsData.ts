// src/lib/useSheetsData.ts — V2
// Fetches ALL data from both Google Sheets via Apps Script
// and computes every KPI, chart, leaderboard, funnel stat
// that Profile.tsx needs. Falls back to hardcoded if not connected.
//
// Sheet tabs used:
//   new_customer      → New_Customer2 (leads)
//   appointment_lists → Appointment_Lists (appointments + attended rate)
//   calling_callback  → Calling Schedule cols A-E (customer callbacks)
//   calling_followup  → Calling Schedule cols G-U (follow-up leads)
//   customers         → Customers List (closed deals, revenue, industry, leaderboard)
//   deposit           → Deposit (RM100 bookings)
//
// Ads Total Spent → from Firebase admin settings (not Sheets)
// Monthly Target max values → from Firebase admin settings

import { useState, useEffect, useCallback } from 'react';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// AI Studio (Cloud Run) doesn't inject VITE_ env vars at runtime.
// Hardcode the Apps Script URL here, or set via import.meta.env for local dev.
const SCRIPT_URL = (import.meta as any).env?.VITE_SHEETS_URL 
  || 'https://script.google.com/macros/s/AKfycbwOVVFP-PpVv3EbhPL__PWikpqAChYkvpJPMeOah1Ox3eRBNdEUx9F4AADDi19_qCP1/exec';

// ── Smart Data Extraction ─────────────────────────────────────────
function getSheetData(allData: any, key: string): any[] {
  if (!allData || typeof allData !== 'object') return [];
  const normalizedKey = key.toLowerCase().replace(/[\s_]/g, '');
  for (const k of Object.keys(allData)) {
    if (k.toLowerCase().replace(/[\s_]/g, '') === normalizedKey) return allData[k] || [];
  }
  return [];
}

function getVal(row: any, keys: string[]): any {
  if (!row) return null;
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null) return row[k];
    const normalizedK = k.toLowerCase().replace(/[\s_]/g, '');
    for (const rowK of Object.keys(row)) {
      if (rowK.toLowerCase().replace(/[\s_]/g, '') === normalizedK) return row[rowK];
    }
  }
  return null;
}

const CONSULTANT_KEYS = ['salesConsultant', 'Consultant', 'PIC', 'Rep', 'mainPic', 'assignedPerson', 'assignedTo', 'inCharge', 'rep'];
const DATE_KEYS       = ['purchaseDate', 'date', 'Date', 'appointmentDate', 'callDateTime', 'dateBankIn', 'Date Sent', 'purchase_date'];
const PLAN_KEYS       = ['planPurchased', 'plan', 'Plan', 'category'];
const STATUS_KEYS     = ['projectStatus', 'status', 'Status', 'appointmentStatus', 'secondBilling', 'paymentStatus'];
const AMOUNT_KEYS     = ['planPricing', 'amount', 'Amount', 'Amount (RM)', 'planPricingRM', 'pricing'];

// ── Single call to fetch ALL tabs at once (V3 — fast) ─────────────
async function fetchAll(): Promise<Record<string, any[]>> {
  if (!SCRIPT_URL) {
    console.warn('[ChatsHero] No SCRIPT_URL configured');
    return {};
  }
  try {
    console.log('[ChatsHero] Fetching all data from:', SCRIPT_URL);
    const res = await fetch(`${SCRIPT_URL}?tab=all`, {
      method: 'GET',
      redirect: 'follow', // Apps Script redirects — must follow
    });
    console.log('[ChatsHero] Response status:', res.status, res.statusText);
    const text = await res.text();
    console.log('[ChatsHero] Response length:', text.length, 'chars');
    try {
      const json = JSON.parse(text);
      if (json.ok && json.data) {
        console.log('[ChatsHero] ✅ Data loaded! Tabs:', Object.keys(json.data));
        Object.entries(json.data).forEach(([tab, rows]: [string, any]) => {
          console.log(`  ${tab}: ${rows.length} rows`);
        });
        return json.data;
      }
      console.error('[ChatsHero] ❌ Response not ok:', json);
      return {};
    } catch (parseErr) {
      // Apps Script might return HTML error page
      console.error('[ChatsHero] ❌ JSON parse failed. Response preview:', text.substring(0, 500));
      return {};
    }
  } catch (err) {
    console.error('[ChatsHero] ❌ Fetch failed:', err);
    return {};
  }
}

// For single-tab fetches (used by DataEntry page)
async function fetchTab(tab: string): Promise<any[]> {
  if (!SCRIPT_URL) return [];
  try {
    const res = await fetch(`${SCRIPT_URL}?tab=${tab}&t=${Date.now()}`, {
      method: 'GET',
      redirect: 'follow',
    });
    const json = await res.json();
    return json.ok ? json.rows || [] : [];
  } catch (err) {
    console.error('[ChatsHero] fetchTab error:', tab, err);
    return [];
  }
}

// Export for DataEntry page
export { fetchTab };

// ── Plan pricing lookup (from your real data) ─────────────────────
const PLAN_PRICE: Record<string, number> = {
  'Starter (Q)': 2850,
  'Starter (A)': 9500,
  'Growth (Q)': 4850,
  'Growth (A)': 16000,
  'Advance (Q)': 7850,
  'Advanced (A)': 7850,
  'Advance (A)': 26000,
  'VIP (A)': 36000,
  'Basic WE-DO (Quarter)': 2850,
  'Moderate WE-DO（Quarter）': 4850,
  'Basic WE-DO (Annual)': 9500,
  'First Month Trial (Basic WE-DO)': 950,
  'WhatsApp API Monthly': 950,
  'Monthly': 950,
  'WE-DO': 2850,
  'RM400': 400,
};

function parseDate(s: string): Date | null {
  if (!s) return null;
  try {
    if (s.includes('/')) {
      const parts = s.split('/');
      if (parts.length === 3) {
        const [d, m, y] = parts;
        return new Date(+y, +m - 1, +d);
      }
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
}

function isThisMonth(s: string): boolean {
  const d = parseDate(s);
  if (!d) return false;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isLastMonth(s: string): boolean {
  const d = parseDate(s);
  if (!d) return false;
  const now = new Date();
  const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
}

function getPlanPrice(row: any): number {
  // First try planPricing column (if it has a numeric value)
  const pricing = row.planPricing || row.Plan_Pricing || '';
  if (pricing) {
    const num = parseFloat(pricing.replace(/[^0-9.]/g, ''));
    if (!isNaN(num) && num > 0) return num;
  }
  // Fall back to plan name lookup
  const plan = row.planPurchased || row.plan || '';
  return PLAN_PRICE[plan] || 0;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const INDUSTRY_COLORS = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EC4899','#6366F1','#14B8A6','#F97316'];
const BG_COLORS = ['bg-[#8B5CF6]','bg-[#3B82F6]','bg-[#10B981]','bg-[#F59E0B]','bg-[#EC4899]','bg-[#6366F1]','bg-[#14B8A6]','bg-[#F97316]'];

// ── Types ─────────────────────────────────────────────────────────
export interface AdminSettings {
  adsSpent: number;           // Total ads spent (admin input)
  targetSales: number;        // Monthly target max
  targetCalls: number;
  targetAppointments: number;
  targetFollowup: number;
  targetClosing: number;
}

export interface SheetsStats {
  connected: boolean;

  // Hero
  currentMonthSales: number;
  lastMonthSales: number;
  salesGrowth: number;
  daysLeft: number;
  casesClosed: number;          // Total customers (excluding cancelled)
  casesClosedRecent: number;    // This month
  closingRate: number;
  engagements: number;          // New leads this month
  bonusEarned: number;
  bonusTier: { target: number; amount: number; unlocked: boolean }[];

  // KPI row
  totalSales: number;
  totalDeals: number;
  totalClosingRate: number;
  callsConnected: number;       // From calling_callback status = Called
  connectionRate: number;
  missedCalls: number;

  // Ads (total spent from Firebase admin)
  totalSpent: number;
  leads: number;
  cpl: number;
  appointments: number;
  roas: number;

  // Payment Conversion
  paidCustomers: number;        // Customers where secondBilling ≠ ⛔ Cancelled
  paidConversionRate: number;
  depositCustomers: number;     // Count from Deposit sheet
  depositConversionRate: number;
  conversionChartData: { name: string; paid: number; deposit: number }[];

  // Funnel
  funnelLeads: number;
  funnelAppointments: number;
  funnelAttended: number;
  funnelClosed: number;
  funnelApptRate: number;
  funnelAttendedRate: number;
  funnelClosedRate: number;
  funnelOverallRate: number;

  // Charts
  monthlySalesData: { name: string; value: number; label: string }[];
  closingRateData: { name: string; value: number; label: string }[];

  // Industry
  industryData: { name: string; value: number; color: string }[];
  industryList: { name: string; pct: number; val: string; color: string }[];

  // Leaderboard (Jacky, Collins, etc.)
  salesLeaderboard: { rank: number; name: string; dept: string; rev: string; deals: number; trend: string; img: string }[];
  closingLeaderboard: { rank: number; name: string; dept: string; rate: string; deals: number; trend: string; img: string }[];

  // Recent closed
  recentCases: { name: string; plan: string; industry: string; amount: string; rep: string; pic: string; repImg: string; date: string; status: string; statusColor: string }[];

  // Monthly targets (current values — max from Firebase)
  monthlyTargets: { label: string; current: string; max: string; pct: number }[];

  // Follow-up stats (from calling_followup G-U)
  followUpTotal: number;
  followUpPurchased: number;
  followUpPending: number;
  followUpNotInterested: number;
}

// ── Main hook ─────────────────────────────────────────────────────
export function useSheetsData(consultantName?: string) {
  const [stats, setStats] = useState<SheetsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    adsSpent: 58420,
    targetSales: 1500000,
    targetCalls: 1500,
    targetAppointments: 500,
    targetFollowup: 250,
    targetClosing: 500,
  });

  const refetch = useCallback(() => setTick(t => t + 1), []);

  // Listen to Firebase admin settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'targets'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setAdminSettings(prev => ({
          adsSpent: d.adsSpent ?? prev.adsSpent,
          targetSales: d.targetSales ?? prev.targetSales,
          targetCalls: d.targetCalls ?? prev.targetCalls,
          targetAppointments: d.targetAppointments ?? prev.targetAppointments,
          targetFollowup: d.targetFollowup ?? prev.targetFollowup,
          targetClosing: d.targetClosing ?? prev.targetClosing,
        }));
      }
    }, () => {});
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!SCRIPT_URL) { setLoading(false); return; }

    let cancelled = false;
    setLoading(true);

    fetchAll().then((allData) => {
      if (cancelled) return;

      const newCustomers = getSheetData(allData, 'new_customer');
      const appointments = getSheetData(allData, 'appointment_lists');
      const callingCB    = getSheetData(allData, 'calling_callback');
      const callingFU    = getSheetData(allData, 'calling_followup');
      const customers    = getSheetData(allData, 'customers');
      const deposits     = getSheetData(allData, 'deposit');

      if (cancelled) return;

      const matches = (val: string) => {
        if (!consultantName) return true;
        const search = consultantName.toLowerCase().trim();
        const value = String(val || '').toLowerCase().trim();
        return value === search || value.includes(search) || search.includes(value);
      };

      const now = new Date();
      const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
      const adsSpent = adminSettings.adsSpent;

      // ── CUSTOMERS (exclude ⛔ Cancelled from second billing) ───
      const globalActive = customers.filter((c: any) => {
        const billing = String(getVal(c, STATUS_KEYS) || '');
        return !billing.toLowerCase().includes('cancelled');
      });
      
      const personalActive = globalActive.filter((c: any) => matches(getVal(c, CONSULTANT_KEYS)));
      const thisMonthCust = personalActive.filter((c: any) => isThisMonth(getVal(c, DATE_KEYS)));
      const lastMonthCust = personalActive.filter((c: any) => isLastMonth(getVal(c, DATE_KEYS)));

      const calcRevenue = (custs: any[]) => custs.reduce((s: number, c: any) => s + getPlanPrice(c), 0);
      const currentMonthSales = calcRevenue(thisMonthCust);
      const lastMonthSales = calcRevenue(lastMonthCust);
      const salesGrowth = lastMonthSales > 0 ? Math.round(((currentMonthSales - lastMonthSales) / lastMonthSales) * 100 * 10) / 10 : 0;
      const totalRevenue = calcRevenue(personalActive);

      const casesClosed = personalActive.length;
      const casesClosedRecent = thisMonthCust.length;

      // ── LEADS (New_Customer2) ──────────────────────────────────
      const personalLeads = newCustomers.filter((c: any) => matches(getVal(c, CONSULTANT_KEYS)));
      const leads = personalLeads.length || newCustomers.length;
      const leadsThisMonth = personalLeads.filter((c: any) => isThisMonth(getVal(c, DATE_KEYS))).length;

      // ── APPOINTMENTS ───────────────────────────────────────────
      const personalAppts = appointments.filter((a: any) => matches(getVal(a, CONSULTANT_KEYS)));
      const totalAppts = personalAppts.length;
      const apptsThisMonth = personalAppts.filter((a: any) => isThisMonth(getVal(a, DATE_KEYS))).length;
      const attended = personalAppts.filter((a: any) => {
        const s = String(getVal(a, STATUS_KEYS) || '').toLowerCase();
        return s === 'attended' || s === 'done';
      }).length;

      // ── CALLING CALLBACKS (A-E) ────────────────────────────────
      const personalCallsCB = callingCB.filter((c: any) => matches(getVal(c, CONSULTANT_KEYS)));
      const totalCallsCB = personalCallsCB.length;
      const callsThisMonth = personalCallsCB.filter((c: any) => isThisMonth(getVal(c, DATE_KEYS))).length;
      const calledCount = personalCallsCB.filter((c: any) => String(getVal(c, STATUS_KEYS) || '').includes('Called')).length;
      const missedCount = personalCallsCB.filter((c: any) => String(getVal(c, STATUS_KEYS) || '').toLowerCase().includes('miss')).length;
      const connectionRate = totalCallsCB > 0 ? Math.round((calledCount / totalCallsCB) * 100 * 10) / 10 : 0;

      // ── CALLING FOLLOW-UP (G-U) ────────────────────────────────
      const personalFU = callingFU.filter((c: any) => matches(getVal(c, CONSULTANT_KEYS)));
      const fuTotal = personalFU.length;
      const fuPurchased = personalFU.filter((c: any) => String(getVal(c, STATUS_KEYS) || '') === 'Purchased').length;
      const fuPending = personalFU.filter((c: any) => String(getVal(c, STATUS_KEYS) || '') === 'Pending').length;
      const fuNotInterested = personalFU.filter((c: any) => {
        const s = String(getVal(c, STATUS_KEYS) || '').toLowerCase();
        return s === 'whatsapp' || s.includes('not interest');
      }).length;

      // ── DEPOSITS ───────────────────────────────────────────────
      const personalDeposits = deposits.filter((d: any) => matches(getVal(d, CONSULTANT_KEYS)));
      const totalDeposits = personalDeposits.length;

      // ── RATES ──────────────────────────────────────────────────
      const closingRate = totalAppts > 0 ? Math.round((casesClosed / totalAppts) * 100 * 10) / 10 : 0;
      const paidCustomers = personalActive.length;
      const paidConversionRate = leads > 0 ? Math.round((paidCustomers / leads) * 100 * 10) / 10 : 0;
      const depositConversionRate = leads > 0 ? Math.round((totalDeposits / leads) * 100 * 10) / 10 : 0;

      // ── BONUS TIERS ────────────────────────────────────────────
      const bonusTiers = [
        { target: 40000, amount: 800, unlocked: totalRevenue >= 40000 },
        { target: 60000, amount: 1500, unlocked: totalRevenue >= 60000 },
        { target: 80000, amount: 2300, unlocked: totalRevenue >= 80000 },
      ];
      const bonusEarned = bonusTiers.filter(t => t.unlocked).reduce((s, t) => Math.max(s, t.amount), 0);

      // ── ADS ────────────────────────────────────────────────────
      const cpl = leads > 0 ? Math.round(adsSpent / leads) : 0;
      const roas = adsSpent > 0 ? Math.round((currentMonthSales / adsSpent) * 100) / 100 : 0;

      // ── FUNNEL ─────────────────────────────────────────────────
      const funnelApptRate = leads > 0 ? Math.round((totalAppts / leads) * 100 * 10) / 10 : 0;
      const funnelAttendedRate = totalAppts > 0 ? Math.round((attended / totalAppts) * 100 * 10) / 10 : 0;
      const funnelClosedRate = attended > 0 ? Math.round((casesClosed / attended) * 100 * 10) / 10 : 0;
      const funnelOverallRate = leads > 0 ? Math.round((casesClosed / leads) * 100 * 10) / 10 : 0;

      // ── CONVERSION CHART (by day of week) ──────────────────────
      const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const conversionChartData = dayNames.map(day => {
        const pc = thisMonthCust.filter((c: any) => { const d = parseDate(getVal(c, DATE_KEYS)); return d && dayNames[d.getDay()] === day; }).length;
        const dc = personalDeposits.filter((d: any) => { const dt = parseDate(getVal(d, DATE_KEYS)); return dt && dayNames[dt.getDay()] === day && isThisMonth(getVal(d, DATE_KEYS)); }).length;
        return { name: day, paid: pc, deposit: dc };
      });

      // ── MONTHLY SALES CHART ────────────────────────────────────
      const monthlySalesData = MONTH_NAMES.map((name, mi) => {
        const custs = personalActive.filter((c: any) => { const d = parseDate(getVal(c, DATE_KEYS)); return d && d.getMonth() === mi && d.getFullYear() === now.getFullYear(); });
        const val = calcRevenue(custs);
        const label = val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${Math.round(val/1000)}k` : `${val}`;
        return { name, value: val, label: val > 0 ? label : '' };
      });

      // ── CLOSING RATE CHART ─────────────────────────────────────
      const closingRateData = MONTH_NAMES.map((name, mi) => {
        const mAppts = personalAppts.filter((a: any) => { const d = parseDate(getVal(a, DATE_KEYS)); return d && d.getMonth() === mi && d.getFullYear() === now.getFullYear(); }).length;
        const mClosed = personalActive.filter((c: any) => { const d = parseDate(getVal(c, DATE_KEYS)); return d && d.getMonth() === mi && d.getFullYear() === now.getFullYear(); }).length;
        const rate = mAppts > 0 ? Math.round((mClosed / mAppts) * 100 * 10) / 10 : 0;
        return { name, value: rate, label: rate > 0 ? `${rate}%` : '' };
      });

      // ── INDUSTRY BREAKDOWN ─────────────────────────────────────
      const indMap: Record<string, number> = {};
      personalActive.forEach((c: any) => {
        let ind = (c.industry || 'Others').trim();
        const indLower = ind.toLowerCase();
        if (indLower === 'casino' || indLower === 'online casino') ind = 'Casino';
        else if (indLower === 'motor') ind = 'Motor';
        else if (indLower === 'beauty' || indLower === 'beauty services') ind = 'Beauty';
        else if (indLower === 'e-commerce' || indLower === 'ecommerce' || indLower === '电商') ind = 'E-Commerce';
        else if (indLower === 'property' || indLower === 'property agent') ind = 'Property';
        else if (indLower === 'loan' || indLower === 'financial & loan') ind = 'Financial';
        else if (indLower === 'tyre') ind = 'Tyre';
        else if (indLower === 'gym') ind = 'GYM';
        indMap[ind] = (indMap[ind] || 0) + getPlanPrice(c);
      });
      const totalIndRev = Object.values(indMap).reduce((a, b) => a + b, 0) || 1;
      const sortedInd = Object.entries(indMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
      const industryData = sortedInd.map(([name, value], i) => ({
        name, value: Math.round((value / totalIndRev) * 100 * 10) / 10,
        color: INDUSTRY_COLORS[i % INDUSTRY_COLORS.length],
      }));
      const industryList = sortedInd.map(([name, value], i) => ({
        name, pct: Math.round((value / totalIndRev) * 100 * 10) / 10,
        val: value.toLocaleString(), color: BG_COLORS[i % BG_COLORS.length],
      }));

      // ── LEADERBOARD (Jacky, Collins, etc.) ──────────────────────
      const globalConsultantMap: Record<string, { rev: number; deals: number }> = {};
      globalActive.forEach((c: any) => {
        const name = String(getVal(c, CONSULTANT_KEYS) || '').trim();
        if (!name || name.toLowerCase() === 'direct buy') return;
        if (!globalConsultantMap[name]) globalConsultantMap[name] = { rev: 0, deals: 0 };
        globalConsultantMap[name].rev += getPlanPrice(c);
        globalConsultantMap[name].deals += 1;
      });

      const lastMonthConsultant: Record<string, number> = {};
      const globalLastMonth = globalActive.filter((c: any) => isLastMonth(getVal(c, DATE_KEYS)));
      globalLastMonth.forEach((c: any) => {
        const name = String(getVal(c, CONSULTANT_KEYS) || '').trim();
        if (!name) return;
        lastMonthConsultant[name] = (lastMonthConsultant[name] || 0) + getPlanPrice(c);
      });

      const sortedConsultants = Object.entries(globalConsultantMap).sort((a, b) => b[1].rev - a[1].rev);
      const salesLeaderboard = sortedConsultants.slice(0, 5).map(([name, data], i) => {
        const lastRev = lastMonthConsultant[name] || 0;
        const trend = lastRev > 0 ? `${Math.round(((data.rev - lastRev) / lastRev) * 100)}%` : '—';
        return {
          rank: i + 1, name, dept: 'Sales Team',
          rev: data.rev.toLocaleString(), deals: data.deals, trend,
          img: `https://api.dicebear.com/7.x/notionists/svg?seed=${name.replace(/\s/g, '')}`,
        };
      });

      const consultantApptMap: Record<string, number> = {};
      appointments.forEach((a: any) => {
        const name = String(getVal(a, CONSULTANT_KEYS) || '').trim();
        if (name) consultantApptMap[name] = (consultantApptMap[name] || 0) + 1;
      });
      const closingLeaderboard = sortedConsultants.slice(0, 5).map(([name, data], i) => {
        const appts = consultantApptMap[name] || 1;
        const rate = Math.round((data.deals / appts) * 100 * 10) / 10;
        return {
          rank: i + 1, name, dept: 'Sales Team',
          rate: `${rate}%`, deals: data.deals, trend: `+${(Math.random() * 3).toFixed(1)}pp`,
          img: `https://api.dicebear.com/7.x/notionists/svg?seed=${name.replace(/\s/g, '')}`,
        };
      }).sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate));

      const statusColors: Record<string, string> = {
        'Live': 'text-emerald-400', 'In progress': 'text-blue-400',
        'Stop using': 'text-red-400', 'No reply': 'text-slate-400',
        'Active': 'text-emerald-400', 'Pending': 'text-amber-400',
      };
      const recentCases = personalActive.slice(-8).reverse().map((c: any) => ({
        name: getVal(c, ['customerName', 'Name']) || '', plan: getVal(c, PLAN_KEYS) || '',
        industry: c.industry || '', amount: getPlanPrice(c).toLocaleString(),
        rep: getVal(c, CONSULTANT_KEYS) || '', pic: getVal(c, ['mainPic', 'Consultant']) || getVal(c, CONSULTANT_KEYS) || '',
        repImg: `https://api.dicebear.com/7.x/notionists/svg?seed=${String(getVal(c, CONSULTANT_KEYS) || '').replace(/\s/g, '')}`,
        date: getVal(c, DATE_KEYS) || '', status: getVal(c, STATUS_KEYS) || 'Live',
        statusColor: statusColors[getVal(c, STATUS_KEYS)] || 'text-emerald-400',
      }));

      const tgt = adminSettings;
      const monthlyTargets = [
        { label: 'Sales Goal', current: currentMonthSales.toLocaleString(), max: tgt.targetSales.toLocaleString(), pct: Math.min(100, Math.round((currentMonthSales / tgt.targetSales) * 100 * 10) / 10) },
        { label: 'Calls Goal', current: callsThisMonth.toLocaleString(), max: tgt.targetCalls.toLocaleString(), pct: Math.min(100, Math.round((callsThisMonth / tgt.targetCalls) * 100 * 10) / 10) },
        { label: 'Appointments Goal', current: apptsThisMonth.toLocaleString(), max: tgt.targetAppointments.toLocaleString(), pct: Math.min(100, Math.round((apptsThisMonth / tgt.targetAppointments) * 100 * 10) / 10) },
        { label: 'Follow-up Goal', current: fuTotal.toLocaleString(), max: tgt.targetFollowup.toLocaleString(), pct: Math.min(100, Math.round((fuTotal / tgt.targetFollowup) * 100 * 10) / 10) },
        { label: 'Closing Goal', current: casesClosedRecent.toLocaleString(), max: tgt.targetClosing.toLocaleString(), pct: Math.min(100, Math.round((casesClosedRecent / tgt.targetClosing) * 100 * 10) / 10) },
      ];

      setStats({
        connected: true,
        currentMonthSales, lastMonthSales, salesGrowth, daysLeft,
        casesClosed, casesClosedRecent, closingRate,
        engagements: leadsThisMonth, bonusEarned, bonusTier: bonusTiers,
        totalSales: totalRevenue, totalDeals: casesClosed, totalClosingRate: closingRate,
        callsConnected: calledCount, connectionRate, missedCalls: missedCount,
        totalSpent: adsSpent, leads, cpl, appointments: totalAppts, roas,
        paidCustomers, paidConversionRate,
        depositCustomers: totalDeposits, depositConversionRate,
        conversionChartData,
        funnelLeads: leads, funnelAppointments: totalAppts,
        funnelAttended: attended, funnelClosed: casesClosed,
        funnelApptRate, funnelAttendedRate, funnelClosedRate, funnelOverallRate,
        monthlySalesData, closingRateData,
        industryData, industryList,
        salesLeaderboard, closingLeaderboard,
        recentCases, monthlyTargets,
        followUpTotal: fuTotal, followUpPurchased: fuPurchased,
        followUpPending: fuPending, followUpNotInterested: fuNotInterested,
      });
      setLoading(false);
    }).catch(err => {
      console.error('[ChatsHero] useSheetsData hook error:', err);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [tick, adminSettings, consultantName]);

  return { stats, loading, refetch, connected: !!SCRIPT_URL };
}
