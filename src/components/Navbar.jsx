import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LogoIcon() {
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7752fe] to-[#4f3ff0] flex items-center justify-center shadow-lg shadow-indigo-600/30 flex-shrink-0">
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 12l10 10 10-10L12 2zm0 4.5l5.5 5.5-5.5 5.5L6.5 12 12 6.5z" />
      </svg>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function useLiveDate() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
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

function getInitials(user) {
  if (!user) return '?';
  const name = user.name || user.email || '';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function Navbar({ onExportPng }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const now = useLiveDate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
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
      
      <div className="flex items-center space-x-3">
        <LogoIcon />
        <span className="text-xl font-bold tracking-tight text-white/95">ProgressMap</span>
      </div>

      
      <div className="relative -top-1 text-sm font-medium text-slate-400 bg-white/[0.02] px-4 py-1.5 rounded-full border border-white/5 select-none">
        {formatDate(now)}
      </div>

      
      <div className="flex items-center space-x-3">
        
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

        
        <div className="relative" ref={menuRef}>
          <button
            id="avatar-menu-btn"
            type="button"
            aria-label="User profile"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-xl bg-[#6b56ff] hover:bg-[#5b45f5] text-white font-bold text-sm flex items-center justify-center shadow-md shadow-indigo-600/30 select-none"
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

          
          {menuOpen && (
            <div
              className="absolute right-0 top-12 w-52 bg-[#171f2e] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
              role="menu"
            >
              
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
              </div>

              
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
