import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import AgentHub from './pages/AgentHub';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Sales from './pages/Sales';
import Settings from './pages/Settings';
import Login from './pages/Login';
import StaffWorkspace from './pages/StaffWorkspace';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { playClickSound, playGlorySound, playTransitionSound } from './lib/sounds';
import GlobalNotifier from './components/GlobalNotifier';

// ── EXTENDED TAB TYPE ─────────────────────────────────────────────
type TabType = 'hub' | 'analytics' | 'profile' | 'settings' | 'workspace' | 'sales';

function AuthenticatedApp() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('hub');
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/hub') setActiveTab('hub');
    if (path === '/analytics') setActiveTab('analytics');
    if (path === '/sales') setActiveTab('sales');
    if (path === '/profile') setActiveTab('profile');
    if (path === '/settings') setActiveTab('settings');
    if (path === '/workspace') setActiveTab('workspace');
  }, [location.pathname]);

  useEffect(() => {
    const hasPlayedGlory = sessionStorage.getItem('hasPlayedGlorySound');
    if (!hasPlayedGlory) {
      playGlorySound();
      sessionStorage.setItem('hasPlayedGlorySound', 'true');
    } else {
      playTransitionSound();
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('[role="button"]') || target.closest('select')) {
        playClickSound();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (profile?.role === 'pending' && !profile?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 text-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-8 rounded-[2rem] max-w-md shadow-xl">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-4">Pending Approval</h2>
          <p className="text-slate-500 mb-6">Your account requires an administrator's approval before you can access the system. Please wait.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const isRestricted = profile?.role === 'Intern IT' || profile?.role === 'Intern Graphic';

  return (
    <>
      <GlobalNotifier />
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        <Routes>
          <Route path="/hub"        element={<AgentHub />} />
          <Route path="/sales"      element={isRestricted ? <Navigate to="/hub" /> : <Sales />} />
          <Route path="/profile"    element={<Profile />} />
          <Route path="/analytics"  element={isRestricted ? <Navigate to="/hub" /> : <Analytics />} />
          <Route path="/workspace"  element={isRestricted ? <Navigate to="/hub" /> : <StaffWorkspace />} />
          <Route path="/settings"   element={<Settings />} />
          <Route path="*"           element={<Navigate to="/hub" />} />
        </Routes>
      </Layout>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AuthenticatedApp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
