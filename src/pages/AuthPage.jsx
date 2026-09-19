import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../storage';
import { useAuth } from '../context/AuthContext';

// ── Icon components ──────────────────────────────────────────────────

function MailIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeOnIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path
        clipRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
        fillRule="evenodd"
      />
    </svg>
  );
}

// ── Validation helpers ───────────────────────────────────────────────

function validateEmail(v) {
  if (!v.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Please enter a valid email address';
  return '';
}

function validatePassword(v) {
  if (!v) return 'Password is required';
  if (v.length < 8) return 'Password must be at least 8 characters';
  return '';
}

function validateName(v) {
  if (!v.trim()) return 'Name is required';
  return '';
}

// ── AuthPage ─────────────────────────────────────────────────────────

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Inline errors
  const [errors, setErrors] = useState({ email: '', password: '', name: '', form: '' });
  const [loading, setLoading] = useState(false);

  function switchMode(newMode) {
    setMode(newMode);
    setErrors({ email: '', password: '', name: '', form: '' });
    setEmail('');
    setPassword('');
    setName('');
    setShowPassword(false);
  }

  function validateAll() {
    const next = {
      email: validateEmail(email),
      password: validatePassword(password),
      name: mode === 'register' ? validateName(name) : '',
      form: '',
    };
    setErrors(next);
    return !next.email && !next.password && !next.name;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    setErrors((prev) => ({ ...prev, form: '' }));

    try {
      let data;
      if (mode === 'login') {
        data = await login(email.trim(), password);
      } else {
        data = await register(email.trim(), password, name.trim());
      }

      signIn(data.user, data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err.message || 'Something went wrong. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  }

  // Field-level blur validation
  function onBlurEmail() {
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
  }
  function onBlurPassword() {
    setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
  }
  function onBlurName() {
    if (mode === 'register') {
      setErrors((prev) => ({ ...prev, name: validateName(name) }));
    }
  }

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="bg-[#F0F2F6] min-h-screen flex items-center justify-center p-3 sm:p-5">
      <main className="w-full max-w-md bg-white rounded-3xl shadow-sm sm:shadow-lg p-6 sm:p-8 flex flex-col justify-between">
        <div>
          {/* ── Segmented tab switcher ─────────────────────────────── */}
          <nav
            aria-label="Authentication Type"
            className="bg-[#EEF1F6] p-1.5 rounded-2xl flex items-center mb-8"
          >
            <button
              type="button"
              aria-current={mode === 'login' ? 'page' : undefined}
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition-all focus:outline-none ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-[#6366F1] to-[#585CE5] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              aria-current={mode === 'register' ? 'page' : undefined}
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition-all focus:outline-none ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-[#6366F1] to-[#585CE5] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </nav>

          {/* ── Header ────────────────────────────────────────────── */}
          <header className="mb-7">
            <h1 className="text-[1.75rem] font-bold tracking-tight text-slate-900 leading-tight">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 font-normal">
              {mode === 'login'
                ? 'Sign in to continue to your dashboard'
                : 'Start tracking your daily progress'}
            </p>
          </header>

          {/* ── Form ──────────────────────────────────────────────── */}
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Name field (register only) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800" htmlFor="auth-name">
                  Full Name
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon />
                  </div>
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={onBlurName}
                    className={`block w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-slate-800 text-sm transition-colors focus:outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-2 border-red-500 focus:ring-red-400 focus:border-red-500'
                        : 'border-slate-300 focus:ring-[#6366F1] focus:border-[#6366F1]'
                    }`}
                  />
                </div>
                {errors.name && (
                  <div className="flex items-center gap-1.5 pt-0.5" role="alert">
                    <ErrorIcon />
                    <span className="text-xs text-red-500 font-medium tracking-tight">{errors.name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800" htmlFor="auth-email">
                Email Address
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MailIcon />
                </div>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={onBlurEmail}
                  className={`block w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-slate-800 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-2 border-red-500 focus:ring-red-400 focus:border-red-500'
                      : 'border-slate-300 focus:ring-[#6366F1] focus:border-[#6366F1]'
                  }`}
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-1.5 pt-0.5" role="alert">
                  <ErrorIcon />
                  <span className="text-xs text-red-500 font-medium tracking-tight">{errors.email}</span>
                </div>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800" htmlFor="auth-password">
                Password
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <LockIcon />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={onBlurPassword}
                  className={`block w-full pl-10 pr-10 py-3 bg-white border rounded-xl text-slate-800 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-2 border-red-500 focus:ring-red-400 focus:border-red-500'
                      : 'border-slate-300 focus:ring-[#6366F1] focus:border-[#6366F1]'
                  }`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOnIcon /> : <EyeOffIcon />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1.5 pt-0.5" role="alert">
                  <ErrorIcon />
                  <span className="text-xs text-red-500 font-medium tracking-tight">{errors.password}</span>
                </div>
              )}
            </div>

            {/* Remember me + Forgot password (login only) */}
            {mode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1] focus:ring-offset-0 accent-[#6366F1]"
                  />
                  <span className="ml-2 text-sm text-slate-600 font-normal">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Form-level error */}
            {errors.form && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl" role="alert">
                <ErrorIcon />
                <span className="text-xs text-red-600 font-medium">{errors.form}</span>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#6366F1] to-[#585CE5] hover:opacity-95 active:scale-[0.99] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#6366F1]/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6366F1] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? mode === 'login'
                    ? 'Signing in…'
                    : 'Creating account…'
                  : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Brand footer ────────────────────────────────────────── */}
        <footer className="mt-12 pt-4 border-t border-slate-100 flex items-center justify-start">
          <span className="text-xs text-slate-400 font-normal tracking-wide">ProgressMap</span>
        </footer>
      </main>
    </div>
  );
}
