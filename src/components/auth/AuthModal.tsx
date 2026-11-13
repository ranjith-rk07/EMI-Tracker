import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithPhoneOtp,
  verifyPhoneOtp,
  signInWithGoogleOAuth,
} from '../../services/supabase';
import { BrandLogo } from '../common/BrandLogo';
import {
  X,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const AuthModal: React.FC<{ presentation?: 'modal' | 'page' }> = ({ presentation = 'modal' }) => {
  const {
    authModalOpen,
    closeAuthModal,
    authModalTab,
    isConfigured,
    continueAsGuest,
  } = useAuth();
  const isPage = presentation === 'page';
  const Heading = isPage ? 'h1' : 'h2';

  const { setStorageMode, updateSettings, settings } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalTab);
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('email');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone form state
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status and loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authModalOpen || isPage) {
      setMode(authModalTab);
      setError(null);
      setInfoMessage(null);
    }
  }, [authModalOpen, authModalTab, isPage]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timeout = window.setTimeout(() => setResendCooldown(value => value - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [resendCooldown]);

  if (!isPage && !authModalOpen) return null;

  const handleContinueAsGuest = () => {
    setStorageMode('guest');
    continueAsGuest();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!isConfigured) {
      setError('Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file, or continue as guest.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error: signUpErr } = await signUpWithEmail(email, password);
        if (signUpErr) throw signUpErr;
        if (data.session) {
          setStorageMode('account');
          closeAuthModal();
        } else {
          setInfoMessage('Verification email sent! Please check your inbox to confirm your account.');
        }
      } else {
        const { error: signInErr } = await signInWithEmail(email, password);
        if (signInErr) throw signInErr;
        setStorageMode('account');
        closeAuthModal();
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const fullPhone = `${countryCode}${phoneNumber.replace(/\s+/g, '')}`;
    if (!phoneNumber.trim()) {
      setError('Please enter your mobile phone number.');
      return;
    }

    if (!isConfigured) {
      setError('Phone SMS authentication requires an SMS provider configured in Supabase (Twilio / MessageBird). You can continue as guest to start immediately.');
      return;
    }

    setLoading(true);
    try {
      const { error: otpErr } = await signInWithPhoneOtp(fullPhone);
      if (otpErr) throw otpErr;
      setOtpSent(true);
      setInfoMessage(`6-digit verification code sent to ${fullPhone}.`);
      setResendCooldown(60);
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP code. Ensure SMS provider is active in Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullPhone = `${countryCode}${phoneNumber.replace(/\s+/g, '')}`;
    if (!otpCode.trim() || otpCode.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const { error: verifyErr } = await verifyPhoneOtp(fullPhone, otpCode);
      if (verifyErr) throw verifyErr;
      setStorageMode('account');
      closeAuthModal();
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    if (!isConfigured) {
      setError('Google Sign-In requires Google OAuth provider enabled in your Supabase dashboard.');
      return;
    }

    try {
      const { error: googleError } = await signInWithGoogleOAuth();
      if (googleError) throw googleError;
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed.');
    }
  };

  return (
    <div
      role={isPage ? 'main' : undefined}
      className={isPage
        ? 'min-h-screen flex items-center justify-center bg-[#F4F7F5] dark:bg-[#111915] p-4 sm:p-8'
        : 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10'}
    >
      {/* Backdrop */}
      {!isPage && <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeAuthModal}
      />}

      {/* Split-screen Modal Window */}
      <div
        role={isPage ? undefined : 'dialog'}
        aria-modal={isPage ? undefined : true}
        aria-labelledby="auth-heading"
        className={`relative z-10 w-full bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row ${isPage ? 'max-w-5xl shadow-lg' : 'max-w-4xl shadow-2xl max-h-[92vh]'}`}
      >
        {/* Close Button top right */}
        {!isPage && <button
          onClick={closeAuthModal}
          aria-label="Close sign-in dialog"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>}

        {/* LEFT COLUMN: Finance Photograph from Design */}
        <div className="hidden md:block md:w-1/2 relative bg-[#143D2B] overflow-hidden p-6">
          <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner">
            <img
              src="/auth-finance-photo.jpg"
              alt="Finance calendar and calculator"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Subtle aesthetic overlay vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-[0.7rem] uppercase tracking-wider font-bold text-emerald-300">
                Peace of mind
              </span>
              <h4 className="text-lg font-bold mt-1 text-white">
                Never miss an EMI instalment again.
              </h4>
              <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
                Track all your active loans, payment schedules, and debt-free milestones in one elegant workspace.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Form & Auth Controls */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Logo and Theme Toggle */}
            <div className="flex items-center justify-between pb-6">
              <BrandLogo lightText={false} />
              
              <button
                onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                aria-label={settings.theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* Header: Title & Subtitle */}
            <div className="mt-2">
              <Heading id="auth-heading" className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {mode === 'signup' ? 'Sign up' : isPage ? 'Sign in to Duewise' : 'Welcome back'}
              </Heading>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {mode === 'signup'
                  ? 'Create a Duewise account with your email or mobile number.'
                  : 'Sign in to access your synced loans and instalments.'}
              </p>
            </div>

            {/* Unconfigured Alert Notice if applicable */}
            {!isConfigured && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold">Supabase is not configured yet.</span> Add your Supabase project keys to <code className="font-mono text-[0.7rem] bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">.env</code> to activate cloud sync, or continue as guest to track immediately.
                </div>
              </div>
            )}

            {/* Error or Info message */}
            {error && (
              <div role="alert" className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}
            {infoMessage && (
              <div role="status" className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{infoMessage}</span>
              </div>
            )}

            {/* Segmented Control: [Mobile number] [Email] */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 mt-6">
              <button
                type="button"
                onClick={() => { setActiveTab('phone'); setError(null); }}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'phone'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile number</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('email'); setError(null); }}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'email'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>
            </div>

            {/* Form Area */}
            {activeTab === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="mt-5 flex flex-col gap-4">
                <div>
                  <label htmlFor="auth-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Email
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5B3E] transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="auth-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setInfoMessage('Password reset instructions can be configured in Supabase Auth.')}
                        className="text-[0.68rem] text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="auth-password"
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5B3E] pr-10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[0.65rem] text-slate-400 mt-1 block">
                    Use at least 8 characters.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#1B5B3E] hover:bg-[#164831] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all mt-1"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'signup' ? 'Sign up' : 'Sign in'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              // Mobile Tab
              <div className="mt-5 flex flex-col gap-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                    <div>
                      <label htmlFor="auth-phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Mobile number
                      </label>
                      <div className="flex gap-2">
                        <select
                          aria-label="Country code"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5B3E]"
                        >
                          <option value="+91">+91 (IN)</option>
                          <option value="+1">+1 (US)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+971">+971 (UAE)</option>
                        </select>
                        <input
                          id="auth-phone"
                          type="tel"
                          autoComplete="tel-national"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="98765 43210"
                          className="min-w-0 flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5B3E]"
                        />
                      </div>
                      <span className="text-[0.65rem] text-slate-400 mt-1 block">
                        We'll text you a 6-digit code to verify it's you.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-[#1B5B3E] hover:bg-[#164831] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Send verification code</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                    <div>
                      <label htmlFor="auth-otp" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Enter 6-digit code
                      </label>
                      <input
                        id="auth-otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full text-center text-lg tracking-widest px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5B3E]"
                      />
                      <div className="flex items-center justify-between mt-1 text-[0.68rem]">
                        <span className="text-slate-400">Didn't receive code?</span>
                        {resendCooldown > 0 ? (
                          <span className="text-slate-400">Resend in {resendCooldown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                          >
                            Resend code
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-[#1B5B3E] hover:bg-[#164831] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Verify & Sign in</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Divider OR */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative px-3 bg-white dark:bg-slate-900 text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
                OR
              </span>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Bottom Switch Mode & Continue as Guest */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3 text-center">
            <button
              onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null); setInfoMessage(null); }}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {mode === 'signup' ? (
                <>Already have an account? <span className="font-bold text-emerald-700 dark:text-emerald-400">Sign in</span></>
              ) : (
                <>Don't have an account? <span className="font-bold text-emerald-700 dark:text-emerald-400">Sign up</span></>
              )}
            </button>

            <button
              onClick={handleContinueAsGuest}
              disabled={loading}
              aria-label="Continue as guest"
              className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex flex-col items-center"
            >
              <span className="font-bold flex items-center gap-1 text-emerald-800 dark:text-emerald-400">
                Continue as guest <ArrowRight className="w-3.5 h-3.5 inline" />
              </span>
              <span className="text-[0.68rem] text-slate-400 mt-0.5">
                Duewise stores your plans in this browser.
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

