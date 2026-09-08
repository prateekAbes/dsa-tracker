import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { UserButton, SignInButton, useAuth } from '@clerk/react';
import { Menu, X, Moon, Sun, Flame, RotateCcw, BookOpen } from 'lucide-react';
import { fetchStats, fetchStreak, resetAllProgress } from '../api/client';
import toast from 'react-hot-toast';

export const TOPICS = [
  { index: 1, name: 'Arrays', slug: 'arrays' },
  { index: 2, name: 'Binary Search', slug: 'binary-search' },
  { index: 3, name: 'Strings', slug: 'strings' },
  { index: 4, name: 'Linked List', slug: 'linked-list' },
  { index: 5, name: 'Recursion', slug: 'recursion' },
  { index: 6, name: 'Bit Manipulation', slug: 'bit-manipulation' },
  { index: 7, name: 'Stack and Queues', slug: 'stack-and-queues' },
  { index: 8, name: 'Sliding Window', slug: 'sliding-window' },
  { index: 9, name: 'Heaps', slug: 'heaps' },
  { index: 10, name: 'Greedy Approach', slug: 'greedy-approach' },
  { index: 11, name: 'Binary Trees', slug: 'binary-trees' },
  { index: 12, name: 'Binary Search Trees', slug: 'binary-search-trees' },
  { index: 13, name: 'Graphs', slug: 'graphs' },
  { index: 14, name: 'Dynamic Programming', slug: 'dynamic-programming' },
  { index: 15, name: 'Tries', slug: 'tries' },
  { index: 16, name: 'Strings (Hard)', slug: 'strings-hard' },
];

const Layout = ({ setAuth }) => {
  const { isSignedIn } = useAuth();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({});
  const location = useLocation();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDark]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [statsData, streakData] = await Promise.all([
          fetchStats(),
          fetchStreak()
        ]);
        setStats({
          ...statsData,
          streak: streakData?.currentStreak ?? statsData?.streak ?? 0
        });
      } catch (e) {
        console.error("Failed to load global stats", e);
      }
    };
    loadStats();
  }, [location]);

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
      try {
        await resetAllProgress();
        toast.success('Progress reset successfully');
        window.location.reload();
      } catch (e) {
        toast.error('Failed to reset progress');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setAuth(false);
    toast.success('Logged out successfully');
  };

  const username = localStorage.getItem('username');

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-sans transition-colors duration-200">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static'}
      `}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-lg text-brand-600 dark:text-brand-500">
            <BookOpen className="w-5 h-5" />
            <span>MyDSA Tracker</span>
          </NavLink>
          <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          {/* Main Top Navigation */}
          <div className="px-3 space-y-1 mb-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `
                flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all
                ${isActive 
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'}
              `}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-brand-500" />
                <span>All 1700 Roadmap</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold">
                1700
              </span>
            </NavLink>

            <NavLink
              to="/original-369"
              className={({ isActive }) => `
                flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all
                ${isActive 
                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 shadow-xs' 
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-500/10'}
              `}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">⭐</span>
                <span>Original 369 Sheet</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-extrabold border border-amber-500/20">
                Core
              </span>
            </NavLink>
          </div>

          <div className="px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>Roadmap Topics</span>
            <span>18 Topics</span>
          </div>

          <div className="px-3 space-y-0.5">
            {TOPICS.map((topic) => (
              <NavLink
                key={topic.slug}
                to={`/topic/${topic.slug}`}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors
                  ${isActive 
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'}
                `}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-4 text-center font-mono text-[11px] opacity-40">{topic.index}</span>
                  <span className="truncate">{topic.name}</span>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Progress
          </button>

          {isSignedIn ? (
            <div className="flex items-center gap-2 w-full px-3 py-2 mt-2">
              <UserButton afterSignOutUrl="/" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Account</span>
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="flex items-center justify-center gap-2 w-full px-3 py-2 mt-2 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-400 text-white transition-all shadow-sm">
                Sign In to Save Progress
              </button>
            </SignInButton>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Total Progress:</span>
              <span className="text-brand-600 dark:text-brand-500">
                {stats.done ?? stats.totalCompleted ?? 0} / {stats.total || 1700}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 font-medium text-sm">
              <Flame className="w-4 h-4" />
              <span>{stats.streak || 0} Day Streak</span>
            </div>

            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <button className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-400 text-white shadow-sm transition-all active:scale-95">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
