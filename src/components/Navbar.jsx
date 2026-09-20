import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// ── Inline SVG icons ──────────────────────────────────────────────────

function LogoIcon() {
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7752fe] to-[#4f3ff0] flex items-center justify-center shadow-lg shadow-indigo-600/30 flex-shrink-0">
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 12l10 10 10-10L12 2zm0 4.5l5.5 5.5-5.5 5.5L6.5 12 12 6.5z" />
      </svg>
    </div>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Live date helpers ─────────────────────────────────────────────────

function useLiveDate() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Update every minute
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return now;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Avatar initials helper ─────────────────────────────────────────────

function getInitials(user) {
  if (!user) return '?';
  const name = user.name || user.email || '';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ── Navbar Component ───────────────────────────────────────────────────

export default function Navbar({ onExportPng }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const now = useLiveDate();

  const [hasNotification] = useState(true); // placeholder until Step 19 milestone system
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSignOut() {
    setMenuOpen(false);
    signOut();
    navigate('/auth', { replace: true });
  }

  const initials = getInitials(user);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-1">
      {/* ── Brand Logo + Name ─────────────────────────── */}
      <div className="flex items-center space-x-3">
        <LogoIcon />
        <span className="text-xl font-bold tracking-tight text-white/95">ProgressMap</span>
      </div>

      {/* ── Live Date Pill ────────────────────────────── */}
      <div className="text-sm font-medium text-slate-400 bg-white/[0.02] px-4 py-1.5 rounded-full border border-white/5 select-none">
        {formatDate(now)}
      </div>

      {/* ── Right Controls ────────────────────────────── */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <button
          id="theme-toggle"
          type="button"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl bg-[#171f2e] border border-white/5 hover:border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
        >
          {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </button>

        {/* Export PNG Button */}
        {onExportPng && (
          <button
            id="export-png-btn"
            type="button"
            onClick={onExportPng}
            className="flex items-center space-x-2 bg-[#6b56ff] hover:bg-[#5b45f5] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <DownloadIcon />
            <span>Export PNG</span>
          </button>
        )}

        {/* Notification Bell */}
        <button
          id="notification-bell"
          type="button"
          aria-label="Notifications"
          className="w-9 h-9 rounded-xl bg-[#171f2e] border border-white/5 flex items-center justify-center text-slate-300 relative hover:border-white/10 transition"
        >
          <BellIcon />
          {hasNotification && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        {/* Avatar + Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            id="avatar-menu-btn"
            type="button"
            aria-label="User profile"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-cyan-500/20 select-none"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              initials
            )}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              className="absolute right-0 top-12 w-52 bg-[#171f2e] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
              role="menu"
            >
              {/* User info header */}
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
              </div>

              {/* Menu items */}
              <button
                type="button"
                role="menuitem"
                onClick={() => { setMenuOpen(false); navigate('/dashboard'); }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
              >
                Dashboard
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => { setMenuOpen(false); navigate('/achievements'); }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
              >
                Achievements
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
              >
                Settings
              </button>

              <div className="border-t border-white/5 mt-1">
                <button
                  type="button"
                  role="menuitem"
                  id="sign-out-btn"
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
