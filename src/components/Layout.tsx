import React, { useState, useEffect } from 'react';
import { Sun, Moon, LayoutGrid, BarChart3, Menu, X, LogOut, User, Shield, LayoutTemplate, ClipboardList, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'hub' | 'analytics' | 'profile' | 'settings' | 'workspace' | 'sales';
  onTabChange: (tab: 'hub' | 'analytics' | 'profile' | 'settings' | 'workspace' | 'sales') => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, profile } = useAuth();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/hub') onTabChange('hub');
    if (path === '/analytics') onTabChange('analytics');
    if (path === '/sales') onTabChange('sales');
    if (path === '/profile') onTabChange('profile');
    if (path === '/settings') onTabChange('settings');
    if (path === '/workspace') onTabChange('workspace');
  }, [location.pathname, onTabChange]);

  const isRestricted = profile?.role === 'Intern IT' || profile?.role === 'Intern Graphic';

  const navItems: Array<{
    id: 'hub' | 'analytics' | 'profile' | 'settings' | 'workspace' | 'sales';
    label: string;
    icon: any;
    path: string;
  }> = [
    { id: 'hub',        label: 'Agent Hub',  icon: LayoutGrid,    path: '/hub' },
  ];

  if (!isRestricted) {
    navItems.push({ id: 'analytics',  label: 'Dashboard',  icon: BarChart3,     path: '/analytics' });
    navItems.push({ id: 'sales',      label: 'Sales',      icon: ClipboardList, path: '/sales' });
  }
  navItems.push({ id: 'profile',    label: 'Profile',    icon: User,          path: '/profile' });

  if (profile?.role === 'admin') {
    navItems.push({ id: 'settings', label: 'Settings',  icon: Shield,         path: '/settings' });
  }

  const handleNav = (
    id: 'hub' | 'analytics' | 'profile' | 'settings' | 'workspace' | 'sales',
    path: string
  ) => {
    onTabChange(id);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-grid flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/50 backdrop-blur-md dark:border-white/5 dark:bg-slate-900/50">
        <div className={cn("mx-auto", activeTab === 'sales' ? "max-w-full px-12" : "max-w-7xl px-4 sm:px-6 lg:px-8")}>
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3 group px-4 py-2 bg-slate-900 rounded-2xl shadow-xl border border-white/5 cursor-pointer" onClick={() => navigate('/hub')}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg overflow-hidden transition-all duration-300 transform group-hover:rotate-12">
                <img src="/icons/chatshero.webp" alt="ChatsHero" className="h-full w-full object-cover" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all">
                <span className="text-white">Chats</span>
                <span className="text-primary ml-1.5 focus:text-white">Hero</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id, item.path)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                      activeTab === item.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}

                <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-2" />

                <button
                  onClick={() => window.location.reload()}
                  className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95 group"
                  title="Clear Cache & Sync"
                >
                  <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
                </button>

                <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-2" />

                <button
                  onClick={() => setIsDark(!isDark)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:scale-110 transition-transform"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-2" />

                <div className="flex items-center gap-3 pl-2">
                  <div 
                    onClick={() => handleNav('profile', '/profile')}
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none">{profile?.name}</span>
                      <span className="text-[8px] font-bold text-primary uppercase tracking-widest">{profile?.role}</span>
                    </div>
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-200 border border-slate-300 dark:border-white/10 shrink-0">
                      <img
                        src={profile?.avatar || "/icons/chatshero.webp"}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-zinc-600 dark:text-zinc-400"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-zinc-200 dark:border-zinc-800"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-zinc-950">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNav(item.id, item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-4 rounded-xl text-base font-bold",
                      activeTab === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => logout()}
                  className="flex w-full items-center gap-2 px-3 py-4 rounded-xl text-base font-bold text-red-500 hover:bg-red-500/10"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className={cn(
        "flex-1",
        (activeTab === 'sales' || activeTab === 'profile' || activeTab === 'workspace') ? "w-full relative" : "mx-auto py-8 max-w-7xl px-4 sm:px-6 lg:px-8 w-full"
      )}>
        {children}
      </main>

      {(activeTab !== 'sales' && activeTab !== 'profile' && activeTab !== 'workspace') && (
        <footer className="mt-auto py-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto text-center text-zinc-500 text-xs font-medium tracking-widest uppercase max-w-7xl px-4">
            © {new Date().getFullYear()} ChatsHero AI Hub • Built with Power
          </div>
        </footer>
      )}
    </div>
  );
}
