import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getSettings, updateSettings, deleteAccount } from '../storage';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { user, setUser, signOut } = useAuth();
  const { toggleTheme, theme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    dailyTarget: 3,
    weekStart: 'Monday'
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getSettings();
        if (data) {
          setName(data.name || '');
          setAvatar(data.avatar || '');
          setPreferences({
            theme: data.preferences?.theme || 'dark',
            dailyTarget: data.preferences?.dailyTarget || 3,
            weekStart: data.preferences?.weekStart || 'Monday'
          });
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target.result;
      setAvatar(base64Str);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updatedUser = await updateSettings({ name, avatar });
      if (updatedUser && setUser) {
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    
    if (key === 'theme' && value !== theme) {
      toggleTheme();
    }

    try {
      const updatedUser = await updateSettings({ preferences: newPrefs });
      if (updatedUser && setUser) {
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you absolutely sure? This will delete all your tasks, notes, and account data permanently.")) {
      try {
        await deleteAccount();
        signOut();
        navigate('/auth');
      } catch (err) {
        alert("Failed to delete account");
      }
    }
  };

  const handleLogout = () => {
    signOut();
    navigate('/auth');
  };

  const handleExportJSON = () => {
    alert("Export JSON not fully implemented yet.");
  };
  
  const handleImportJSON = () => {
    alert("Import JSON not fully implemented yet.");
  };

  const handleExportPNG = () => {
    navigate('/dashboard?export=true'); // Easy way to trigger export from dashboard
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-app flex items-center justify-center text-theme-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-page p-3 sm:p-6 lg:p-10 flex items-start justify-center transition-colors duration-300">
      <div className="w-full max-w-[1520px] rounded-3xl p-4 sm:p-7 bg-theme-card border border-theme-border shadow-2xl space-y-6 transition-colors duration-300">
        <Navbar />

        <main className="max-w-2xl mx-auto px-4 py-8 text-theme-text selection:bg-amber-500/20">
          
          <header className="mb-8" data-purpose="page-header">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#7d5e2a] bg-[#1d1912]/50 text-[#e6b359] text-xs font-semibold tracking-wider mb-4 uppercase">
              <span>S4 · Settings</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-text mb-2">Settings & Profile</h1>
                <p className="text-theme-muted text-sm sm:text-base">Manage your account, preferences, and data.</p>
              </div>
              {saving && (
                <div className="flex items-center gap-2 text-[#e5ad42] text-sm font-medium">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              )}
            </div>
          </header>

          <div className="space-y-6">
            
            {/* ── Profile Section ── */}
            <section className="bg-theme-elevated border border-theme-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-[11px] font-bold tracking-wider text-[#e6b359] uppercase">Profile</h2>
                <div className="flex-1 h-px bg-theme-border" />
              </div>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full border border-[#3e465e] flex items-center justify-center overflow-hidden bg-theme-input shrink-0 relative">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-10 h-10 text-theme-muted" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 bg-theme-input hover:bg-theme-border text-theme-text text-xs font-semibold px-4 py-2 rounded-lg border border-theme-border transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      Upload new avatar
                    </button>
                    <p className="text-xs text-theme-muted mt-2">PNG or JPG, square images work best.</p>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-theme-muted tracking-wider uppercase mb-1.5">Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-theme-input border border-theme-border rounded-lg px-4 py-2.5 text-sm text-theme-text focus:outline-none focus:border-[#e6b359] focus:ring-1 focus:ring-[#e6b359] transition shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-theme-muted tracking-wider uppercase mb-1.5">Email</label>
                  <input 
                    type="email" 
                    value={user?.email || ''}
                    disabled
                    placeholder="you@example.com"
                    className="w-full bg-theme-input border border-theme-border rounded-lg px-4 py-2.5 text-sm text-theme-muted cursor-not-allowed shadow-inner"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-[#e6b359] hover:bg-[#d4a046] text-[#1a1202] text-sm font-bold px-6 py-2.5 rounded-lg shadow-md shadow-[#e6b359]/20 transition"
                  >
                    Save profile
                  </button>
                </div>
              </div>
            </section>

            {/* ── Preferences Section ── */}
            <section className="bg-theme-elevated border border-theme-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-[11px] font-bold tracking-wider text-[#e6b359] uppercase">Preferences</h2>
                <div className="flex-1 h-px bg-theme-border" />
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-theme-text">Theme</div>
                    <div className="text-xs text-theme-muted mt-0.5">Choose your interface appearance.</div>
                  </div>
                  <div className="flex bg-theme-input border border-theme-border rounded-lg p-1">
                    <button 
                      onClick={() => handlePreferenceChange('theme', 'dark')}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition ${preferences.theme === 'dark' ? 'bg-[#e6b359] text-[#1a1202] shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}
                    >
                      🌙 Dark
                    </button>
                    <button 
                      onClick={() => handlePreferenceChange('theme', 'light')}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition ${preferences.theme === 'light' ? 'bg-[#e6b359] text-[#1a1202] shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}
                    >
                      ☀️ Light
                    </button>
                  </div>
                </div>

                <div className="w-full h-px bg-theme-border" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-theme-text">Daily task target</div>
                    <div className="text-xs text-theme-muted mt-0.5">Tasks needed for a "perfect day".</div>
                  </div>
                  <input 
                    type="number"
                    min="1"
                    max="20"
                    value={preferences.dailyTarget}
                    onChange={(e) => handlePreferenceChange('dailyTarget', parseInt(e.target.value, 10) || 3)}
                    className="w-20 bg-theme-input border border-theme-border rounded-lg px-3 py-1.5 text-sm font-bold text-theme-text text-center focus:outline-none focus:border-[#e6b359] shadow-inner"
                  />
                </div>

                <div className="w-full h-px bg-theme-border" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-theme-text">Week starts on</div>
                    <div className="text-xs text-theme-muted mt-0.5">Used for the weekly heatmap view.</div>
                  </div>
                  <div className="flex bg-theme-input border border-theme-border rounded-lg p-1">
                    <button 
                      onClick={() => handlePreferenceChange('weekStart', 'Monday')}
                      className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${preferences.weekStart === 'Monday' ? 'bg-[#e6b359] text-[#1a1202] shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}
                    >
                      Monday
                    </button>
                    <button 
                      onClick={() => handlePreferenceChange('weekStart', 'Sunday')}
                      className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${preferences.weekStart === 'Sunday' ? 'bg-[#e6b359] text-[#1a1202] shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}
                    >
                      Sunday
                    </button>
                  </div>
                </div>
                
                <p className="text-[11px] text-theme-muted pt-2">Preferences are saved automatically.</p>
              </div>
            </section>

            {/* ── Data Section ── */}
            <section className="bg-theme-elevated border border-theme-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-[11px] font-bold tracking-wider text-[#e6b359] uppercase">Data</h2>
                <div className="flex-1 h-px bg-theme-border" />
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-2 bg-theme-input hover:bg-theme-border border border-theme-border text-theme-text text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-sm"
                >
                  ⬇ Export JSON
                </button>
                <button
                  onClick={handleImportJSON}
                  className="flex items-center gap-2 bg-theme-input hover:bg-theme-border border border-theme-border text-theme-text text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-sm"
                >
                  ⬆ Import JSON
                </button>
                <button
                  onClick={handleExportPNG}
                  className="flex items-center gap-2 bg-theme-input hover:bg-theme-border border border-theme-border text-theme-text text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-sm"
                >
                  🖼️ Export heatmap PNG
                </button>
              </div>
              <p className="text-[11px] text-theme-muted mt-4">
                Export your full history as JSON, restore from a backup, or download your streak heatmap as an image.
              </p>
            </section>

            {/* ── Danger Zone ── */}
            <section className="bg-theme-elevated border border-red-500/20 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-[11px] font-bold tracking-wider text-red-500 uppercase">Danger Zone</h2>
                <div className="flex-1 h-px bg-red-500/20" />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-2 px-5 py-2.5 bg-theme-input hover:bg-red-500/10 text-red-500 text-sm font-bold rounded-lg border border-red-500/30 transition shadow-sm shrink-0"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                  Delete all data
                </button>
                <p className="text-xs text-theme-muted">
                  Permanently removes streaks, tasks, and badges. This cannot be undone.
                </p>
              </div>
            </section>
            
            {/* ── Logout Button ── */}
            <div className="pt-2 pb-8">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-theme-elevated border border-theme-border hover:border-red-500/50 hover:bg-red-500/5 text-red-500 text-sm font-bold rounded-xl transition shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Log out
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
