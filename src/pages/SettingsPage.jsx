import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getSettings, updateSettings, deleteAccount } from '../storage';

export default function SettingsPage() {
  const { user, setUser, signOut } = useAuth();
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

  // Auto-save logic
  const autoSave = async (updates) => {
    setSaving(true);
    try {
      const updatedUser = await updateSettings(updates);
      if (updatedUser && setUser) {
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setTimeout(() => setSaving(false), 500); // UI feedback delay
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target.result;
      setAvatar(base64Str);
      autoSave({ avatar: base64Str });
    };
    reader.readAsDataURL(file);
  };

  const handleNameBlur = () => {
    autoSave({ name });
  };

  const handlePreferenceChange = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    autoSave({ preferences: newPrefs });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e17] flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e17] p-3 sm:p-6 lg:p-10 flex items-start justify-center">
      <div className="w-full max-w-[1520px] rounded-3xl p-4 sm:p-7 bg-[#0d121c] border border-white/5 shadow-2xl space-y-6">
        <Navbar />

        <main className="max-w-3xl mx-auto px-4 py-8 text-slate-200">
          
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Settings</h1>
              <p className="text-slate-400 text-sm">Manage your account, preferences, and data.</p>
            </div>
            {saving && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            )}
          </header>

          <div className="space-y-8">
            {/* ── Profile Section ── */}
            <section className="bg-[#141823] border border-[#222938] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">Profile</h2>
              
              <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center mb-6">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-lg shadow-cyan-500/20">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.slice(0, 2).toUpperCase() || '?'
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-sm font-semibold text-white backdrop-blur-sm"
                  >
                    Change
                  </button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleAvatarChange} 
                  />
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1.5">Display Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={handleNameBlur}
                      className="w-full bg-[#0d121c] border border-[#222938] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-[#0d121c]/50 border border-[#222938]/50 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Preferences Section ── */}
            <section className="bg-[#141823] border border-[#222938] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">App Preferences</h2>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">Theme Interface</div>
                    <div className="text-sm text-slate-400">Select your preferred color scheme</div>
                  </div>
                  <select 
                    value={preferences.theme}
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    className="bg-[#0d121c] border border-[#222938] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="dark">Dark Mode</option>
                    <option value="light">Light Mode</option>
                  </select>
                </div>

                <div className="w-full h-[1px] bg-[#222938]" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">First Day of Week</div>
                    <div className="text-sm text-slate-400">Used for heatmap and weekly charts</div>
                  </div>
                  <select 
                    value={preferences.weekStart}
                    onChange={(e) => handlePreferenceChange('weekStart', e.target.value)}
                    className="bg-[#0d121c] border border-[#222938] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div className="w-full h-[1px] bg-[#222938]" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">Daily Target</div>
                    <div className="text-sm text-slate-400">Tasks required for a perfect day</div>
                  </div>
                  <input 
                    type="number"
                    min="1"
                    max="20"
                    value={preferences.dailyTarget}
                    onChange={(e) => handlePreferenceChange('dailyTarget', parseInt(e.target.value, 10) || 3)}
                    className="w-24 bg-[#0d121c] border border-[#222938] rounded-lg px-4 py-2 text-white text-center focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </section>

            {/* ── Danger Zone ── */}
            <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h2>
              <p className="text-sm text-slate-400 mb-6">Irreversible actions regarding your account and data.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Sign Out</span>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-[#1b202c] hover:bg-[#222938] text-slate-300 font-semibold rounded-lg border border-[#2b3346] transition"
                  >
                    Log out
                  </button>
                </div>
                <div className="w-full h-[1px] bg-red-500/10" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">Delete Account</div>
                    <div className="text-xs text-red-400 mt-1 max-w-[200px] sm:max-w-none">Permanently delete all your data.</div>
                  </div>
                  <button 
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-lg border border-red-500/30 transition"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
