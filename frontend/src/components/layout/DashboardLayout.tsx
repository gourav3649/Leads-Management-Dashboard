import React, { useContext, useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { ThemeContext } from '../../App.tsx';
import {
  LayoutDashboard,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  TrendingUp,
  User,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
import { CommandPalette } from '../common/CommandPalette.tsx';
import { ConfettiEffect } from '../common/ConfettiEffect.tsx';
import { ActivityFeed } from './ActivityFeed.tsx';
import { LeadFormModal } from '../leads/LeadFormModal.tsx';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activityFeedOpen, setActivityFeedOpen] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  // Keyboard shortcut listener for Ctrl/Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Custom event listener for triggering Confetti
  useEffect(() => {
    const triggerConfetti = () => {
      setConfettiActive(true);
    };
    window.addEventListener('smart_leads_confetti', triggerConfetti);
    return () => window.removeEventListener('smart_leads_confetti', triggerConfetti);
  }, []);

  const handleGlobalSuccess = () => {
    // Notify all active page components that data should be re-synced
    window.dispatchEvent(new CustomEvent('smart_leads_refresh_data'));
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: 'Leads',
      path: '/leads',
      icon: <Users size={18} />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Confetti Celebration Overlay */}
      <ConfettiEffect 
        active={confettiActive} 
        onComplete={() => setConfettiActive(false)} 
      />

      {/* Smart Command Palette Overlay */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)}
        onOpenLeadModal={() => setLeadModalOpen(true)}
      />

      {/* Real-time Activity Feed Sidebar */}
      <ActivityFeed 
        isOpen={activityFeedOpen} 
        onClose={() => setActivityFeedOpen(false)} 
      />

      {/* Global Quick Lead Form Modal */}
      <LeadFormModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        onSuccess={handleGlobalSuccess}
        lead={null}
      />

      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-200/50 dark:border-slate-800/40 z-20 sticky top-0 h-screen overflow-hidden">
        {/* Brand Header with top theme switch */}
        <div className="p-6 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                SmartLeads
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
                Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation section */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Pinned bottom sidebar footer controls (Image 2) */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/40 space-y-3 bg-white/40 dark:bg-slate-900/20 backdrop-blur-md">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/30 shadow-inner">
            <div className="bg-indigo-100 dark:bg-indigo-950/40 p-2 rounded-full text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              <User size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                  user?.role === 'admin' 
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActivityFeedOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all font-semibold text-xs shadow-sm"
              title="Activity Audit Logs"
            >
              <Clock size={15} />
              <span>Logs</span>
            </button>
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-rose-200/50 dark:border-rose-950/30 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-all font-semibold text-xs shadow-sm"
              title="Logout"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMobile}
        />
      )}
      
      {/* Mobile Drawer */}
      <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 md:hidden flex flex-col ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-lg text-white">
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight">SmartLeads</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Dashboard</span>
            </div>
          </div>
          <button onClick={toggleMobile} className="text-slate-500 dark:text-slate-400 p-1">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={toggleMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              <User size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">{user?.name}</p>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                toggleMobile();
                setActivityFeedOpen(true);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-semibold text-xs shadow-sm"
            >
              <Clock size={15} />
              <span>Logs</span>
            </button>
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-rose-200 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all font-semibold text-xs shadow-sm"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex md:hidden items-center justify-between px-6 py-4 glass-panel border-b border-slate-200/50 dark:border-slate-800/40 z-30">
          <div className="flex items-center gap-3">
            <button onClick={toggleMobile} className="text-slate-600 dark:text-slate-400 p-1 rounded-lg">
              <Menu size={22} />
            </button>
            <h1 className="font-bold text-base tracking-tight text-slate-800 dark:text-slate-200">
              SmartLeads
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile Sliding Theme Toggle Switch */}
            <button
              onClick={toggleTheme}
              className="relative w-12 h-7 rounded-full p-0.5 bg-slate-250 dark:bg-slate-800 transition-colors duration-300 flex items-center justify-between shadow-inner focus:outline-none border border-slate-200/50 dark:border-slate-700/50 scale-90"
              aria-label="Toggle Theme"
            >
              <Sun className={`w-3 h-3 text-amber-500 z-10 pl-0.5 transition-transform duration-300 ${theme === 'dark' ? 'scale-75 opacity-40' : 'scale-100'}`} />
              <Moon className={`w-3 h-3 text-indigo-400 z-10 pr-0.5 transition-transform duration-300 ${theme === 'light' ? 'scale-75 opacity-40' : 'scale-100'}`} />
              <div
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white dark:bg-slate-950 shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                {theme === 'dark' ? <Moon className="w-3 h-3 text-indigo-400" /> : <Sun className="w-3 h-3 text-amber-500" />}
              </div>
            </button>

            <button
              onClick={() => setActivityFeedOpen(true)}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-250"
              title="Activity Logs"
            >
              <Clock size={18} />
            </button>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
              user?.role === 'admin' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}>
              {user?.role}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8 relative">
          {/* Subtle Ambient Radial Glow Backdrops */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          
          {/* Top-Right Control Bar */}
          <div className="hidden md:flex items-center justify-between max-w-7xl mx-auto w-full mb-6 border-b border-slate-200/30 dark:border-slate-800/20 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                System Status: <span className="text-emerald-500 font-semibold animate-pulse">● Online</span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all shadow-sm focus:outline-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span>Press <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border">Ctrl</kbd> + <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border">K</kbd> to explore</span>
              </button>

              {/* Sliding Theme Toggle Switch */}
              <button
                onClick={toggleTheme}
                className="relative w-14 h-8 rounded-full p-1 bg-slate-200 dark:bg-slate-800 transition-colors duration-300 flex items-center justify-between shadow-inner focus:outline-none border border-slate-200/50 dark:border-slate-700/50"
                aria-label="Toggle Theme"
              >
                <Sun className={`w-3.5 h-3.5 text-amber-500 z-10 transition-transform duration-300 ${theme === 'dark' ? 'scale-75 opacity-40' : 'scale-100'}`} />
                <Moon className={`w-3.5 h-3.5 text-indigo-400 z-10 transition-transform duration-300 ${theme === 'light' ? 'scale-75 opacity-40' : 'scale-100'}`} />
                <div
                  className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-slate-950 shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                >
                  {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                </div>
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
