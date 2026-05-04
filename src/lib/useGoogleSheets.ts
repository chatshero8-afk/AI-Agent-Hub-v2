// src/lib/useGoogleSheets.ts
// ─────────────────────────────────────────────────────────────────
// Hook to fetch real CRM data from Google Sheets via Apps Script.
// Used by Profile.tsx to replace dummy hardcoded numbers.
//
// SETUP: Add your Apps Script Web App URL to .env:
//   VITE_SHEETS_URL=https://script.google.com/macros/s/AKfycbwOVVFP-PpVv3EbhPL__PWikpqAChYkvpJPMeOah1Ox3eRBNdEUx9F4AADDi19_qCP1/exec
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';

const SCRIPT_URL = import.meta.env.VITE_SHEETS_URL || '';

// ── Types ─────────────────────────────────────────────────────────
export interface ContactRow {
  name: string;
  phone: string;
  date: string;
  source: string;
  company: string;
  industry: string;
  status: string;
  assignedTo?: string;
  [key: string]: string | undefined;
}

export interface AppointmentRow {
  name: string;
  contact: string;
  date: string;
  time: string;
  assignedTo: string;
  status: string;
  industry: string;
  [key: string]: string | undefined;
}

export interface CustomerRow {
  customerName: string;
  contact: string;
  purchaseDate: string;
  industry: string;
  plan: string;
  mainPic: string;
  salesConsultant: string;
  projectStatus: string;
  [key: string]: string | undefined;
}

export interface DepositRow {
  name: string;
  phone: string;
  dateBankIn: string;
  industry: string;
  consultant: string;
  status: string;
  [key: string]: string | undefined;
}

export interface SheetData {
  contacts: ContactRow[];
  appointments: AppointmentRow[];
  customers: CustomerRow[];
  deposits: DepositRow[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: Date | null;
}

// ── Derived consultant stats from real sheet data ─────────────────
export interface ConsultantStats {
  // Contacts / Leads
  totalLeads: number;
  leadsThisMonth: number;
  // Appointments
  totalAppointments: number;
  appointmentsThisMonth: number;
  attended: number;
  attendedRate: number;
  // Customers / Closed
  totalClosed: number;
  closedThisMonth: number;
  closingRate: number;          // appointments → closed %
  // Deposits
  totalDeposits: number;
  depositsThisMonth: number;
  depositConversionRate: number; // leads → deposit %
  // Revenue (from plan names — rough estimate)
  estimatedRevenue: number;
  // Source breakdown
  sourceBreakdown: Record<string, number>;
  // Industry breakdown
  industryBreakdown: Record<string, number>;
  // Monthly trend (last 6 months contacts)
  monthlyContactsTrend: { name: string; value: number }[];
}

// ── Helpers ───────────────────────────────────────────────────────
function isThisMonth(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const now = new Date();
    // Handle dd/MM/yyyy and yyyy-MM-dd
    let d: Date;
    const cleanDateStr = String(dateStr).trim();
    if (cleanDateStr.includes('/')) {
      const [day, month, year] = cleanDateStr.split('/');
      d = new Date(Number(year), Number(month) - 1, Number(day));
    } else {
      d = new Date(cleanDateStr);
    }
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  } catch {
    return false;
  }
}

const PLAN_VALUES: Record<string, number> = {
  'Starter (Q)': 2850,
  'Starter (A)': 9500,
  'Growth (Q)': 4850,
  'Growth (A)': 16000,
  'Advance (Q)': 7850,
  'Advance (A)': 26000,
  'VIP (A)': 36000,
  'WE-DO': 2850,
  'Monthly': 950,
  'Custom': 5000,
};

// ── Fetch a single tab ────────────────────────────────────────────
async function fetchTab(tab: string): Promise<any[]> {
  if (!SCRIPT_URL) return [];
  try {
    const separator = SCRIPT_URL.includes('?') ? '&' : '?';
    const res = await fetch(`${SCRIPT_URL}${separator}tab=${tab}&t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    return json.ok ? json.rows || [] : [];
  } catch (e) {
    console.warn(`Failed to fetch tab ${tab}:`, e);
    return [];
  }
}

// ── Main hook with Caching ──────────────────────────────────────────
export function useGoogleSheets(consultantName?: string): SheetData {
  const [contacts, setContacts] = useState<ContactRow[]>(() => {
    const cached = localStorage.getItem('gs_cache_contacts');
    return cached ? JSON.parse(cached) : [];
  });
  const [appointments, setAppointments] = useState<AppointmentRow[]>(() => {
    const cached = localStorage.getItem('gs_cache_appointments');
    return cached ? JSON.parse(cached) : [];
  });
  const [customers, setCustomers] = useState<CustomerRow[]>(() => {
    const cached = localStorage.getItem('gs_cache_customers');
    return cached ? JSON.parse(cached) : [];
  });
  const [deposits, setDeposits] = useState<DepositRow[]>(() => {
    const cached = localStorage.getItem('gs_cache_deposits');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(() => {
    const cached = localStorage.getItem('gs_cache_time');
    return cached ? new Date(cached) : null;
  });
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!SCRIPT_URL || SCRIPT_URL === 'YOUR_URL_HERE') {
      return;
    }

    let cancelled = false;
    // Only show loading spinner if we have NO cached data
    if (contacts.length === 0) setLoading(true);
    setError(null);

    Promise.all([
      fetchTab('contacts'),
      fetchTab('appointments'),
      fetchTab('customers'),
      fetchTab('deposits'),
    ])
      .then(([c, a, cu, d]) => {
        if (cancelled) return;
        
        const filter = (rows: any[], key: string) => {
          if (!consultantName) return rows;
          const search = consultantName.toLowerCase().trim();
          return rows.filter(r => {
            const val = String(r[key] || '').toLowerCase().trim();
            return val.includes(search) || search.includes(val);
          });
        };

        const filteredC = filter(c, 'assignedTo') as ContactRow[];
        const filteredA = filter(a, 'assignedTo') as AppointmentRow[];
        const filteredCu = filter(cu, 'salesConsultant') as CustomerRow[];
        const filteredD = filter(d, 'consultant') as DepositRow[];

        setContacts(filteredC);
        setAppointments(filteredA);
        setCustomers(filteredCu);
        setDeposits(filteredD);
        const now = new Date();
        setLastUpdated(now);

        // Update Cache
        localStorage.setItem('gs_cache_contacts', JSON.stringify(filteredC));
        localStorage.setItem('gs_cache_appointments', JSON.stringify(filteredA));
        localStorage.setItem('gs_cache_customers', JSON.stringify(filteredCu));
        localStorage.setItem('gs_cache_deposits', JSON.stringify(filteredD));
        localStorage.setItem('gs_cache_time', now.toISOString());
      })
      .catch(e => {
        if (!cancelled) {
          console.error('Google Sheets fetch error:', e);
          setError(e.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tick, consultantName]);

  return { contacts, appointments, customers, deposits, loading, error, refetch, lastUpdated };
}

// ── Derived stats hook (used by Profile page) ─────────────────────
export function useConsultantStats(consultantName?: string): ConsultantStats & { loading: boolean; error: string | null; refetch: () => void } {
  const { contacts, appointments, customers, deposits, loading, error, refetch } = useGoogleSheets(consultantName);

  // Leads
  const totalLeads = contacts.length;
  const leadsThisMonth = contacts.filter(c => isThisMonth(c.date)).length;

  // Appointments
  const totalAppointments = appointments.length;
  const appointmentsThisMonth = appointments.filter(a => isThisMonth(a.date)).length;
  const attended = appointments.filter(a => ['Attended', 'Done'].includes(a.status)).length;
  const attendedRate = totalAppointments > 0 ? Math.round((attended / totalAppointments) * 100) : 0;

  // Customers / closed
  const totalClosed = customers.length;
  const closedThisMonth = customers.filter(c => isThisMonth(c.purchaseDate)).length;
  const closingRate = totalAppointments > 0 ? Math.round((totalClosed / totalAppointments) * 100 * 10) / 10 : 0;

  // Deposits
  const totalDeposits = deposits.length;
  const depositsThisMonth = deposits.filter(d => isThisMonth(d.dateBankIn)).length;
  const depositConversionRate = totalLeads > 0 ? Math.round((totalDeposits / totalLeads) * 100 * 10) / 10 : 0;

  // Revenue estimate from plan names
  const estimatedRevenue = customers.reduce((sum, c) => {
    return sum + (PLAN_VALUES[c.plan] || 0);
  }, 0);

  // Source breakdown
  const sourceBreakdown: Record<string, number> = {};
  contacts.forEach(c => {
    const s = c.source || 'Unknown';
    sourceBreakdown[s] = (sourceBreakdown[s] || 0) + 1;
  });

  // Industry breakdown
  const industryBreakdown: Record<string, number> = {};
  customers.forEach(c => {
    const ind = c.industry || 'Others';
    industryBreakdown[ind] = (industryBreakdown[ind] || 0) + 1;
  });

  // Monthly contacts trend (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const monthlyContactsTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const count = contacts.filter(c => {
      try {
        let cd: Date;
        if (c.date?.includes('/')) {
          const [day, month, year] = c.date.split('/');
          cd = new Date(Number(year), Number(month) - 1, Number(day));
        } else {
          cd = new Date(c.date);
        }
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      } catch { return false; }
    }).length;
    return { name: monthNames[d.getMonth()], value: count };
  });

  return {
    totalLeads,
    leadsThisMonth,
    totalAppointments,
    appointmentsThisMonth,
    attended,
    attendedRate,
    totalClosed,
    closedThisMonth,
    closingRate,
    totalDeposits,
    depositsThisMonth,
    depositConversionRate,
    estimatedRevenue,
    sourceBreakdown,
    industryBreakdown,
    monthlyContactsTrend,
    loading,
    error,
    refetch,
  };
}
