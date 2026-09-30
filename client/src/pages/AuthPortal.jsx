import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Database,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Key,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getConfig, saveConfig, testSupabaseConnection } from '../supabaseClient';

export default function AuthPortal() {
  const { signIn, signUp, enterDemoMode } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Supabase Quick Key Configuration Drawer
  const config = getConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(config.url || 'https://txyysjpubwljltvhiksx.supabase.co');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [showConfig, setShowConfig] = useState(!config.anonKey); // Open by default if key is missing!
  const [keyTesting, setKeyTesting] = useState(false);
  const [keyMsg, setKeyMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    if (!config.anonKey && !anonKey.trim()) {
      setShowConfig(true);
      setError('Please provide your Supabase Anon Public Key below so your user account is registered in your Supabase dashboard.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const res = await signUp(email, password, fullName);
        if (res.isEmailConfirmationRequired) {
          setSuccessMsg('Account registered in Supabase auth.users! Check your email inbox to verify, or disable "Confirm email" in Supabase Auth settings.');
        } else {
          setSuccessMsg('Account created and registered in Supabase auth.users successfully!');
        }
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
      if (err.message?.includes('Anon Key is missing')) {
        setShowConfig(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndTestKey = async () => {
    setKeyTesting(true);
    setKeyMsg(null);
    try {
      const result = await testSupabaseConnection(supabaseUrl, anonKey);
      setKeyMsg(result);
      if (result.success) {
        saveConfig(supabaseUrl, anonKey);
        // Force refresh state
        window.location.reload();
      }
    } catch (err) {
      setKeyMsg({ success: false, message: err.message });
    } finally {
      setKeyTesting(false);
    }
  };

  const hasKey = !!(config.anonKey || anonKey.trim());

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-dark-bg relative overflow-hidden">
      {/* Background Neon Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-sky-400 p-[1px] mb-3 shadow-glow-brand">
            <div className="w-full h-full bg-dark-bg rounded-[15px] flex items-center justify-center text-brand-400">
              <Sparkles size={28} />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Smart Automation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Connected to Supabase Project: <strong className="text-brand-400 font-mono">txyysjpubwljltvhiksx</strong>
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-dark-surface/90 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
          
          {/* Missing Key Warning Banner */}
          {!hasKey && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertTriangle size={18} className="flex-shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Supabase API Key Needed for Cloud Accounts</strong>
                To view signed-in users in your <a href="https://supabase.com/dashboard/project/txyysjpubwljltvhiksx/auth/users" target="_blank" rel="noreferrer" className="underline font-bold text-amber-200">Supabase Auth Dashboard</a>, enter your <code>anon</code> key below.
              </div>
            </div>
          )}

          {/* Quick Demo Access Button */}
          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-brand-300 flex items-center gap-1.5">
                <Zap size={14} className="text-brand-400" />
                Local Sandbox Mode
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Test UI, workflows & canvas without Supabase keys.</p>
            </div>
            <button
              type="button"
              onClick={enterDemoMode}
              className="px-3.5 py-1.5 text-xs font-bold text-dark-bg bg-brand-400 hover:bg-brand-300 rounded-lg shadow-glow-brand transition-all flex-shrink-0"
            >
              Enter Demo
            </button>
          </div>

          {/* Sign In vs Create Account Tabs */}
          <div className="flex border-b border-white/10 pt-1">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
                !isSignUp ? 'border-brand-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Sign In to Supabase
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
                isSignUp ? 'border-brand-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Create Supabase Account
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2">
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Vance"
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="developer@company.com"
                className="w-full bg-dark-bg border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock size={13} className="text-slate-400" />
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                className="w-full bg-dark-bg border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-dark-bg bg-brand-400 hover:bg-brand-300 rounded-xl shadow-glow-brand transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating with Supabase...' : isSignUp ? 'Create Account in Supabase' : 'Sign In'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Supabase Key Configuration Drawer */}
          <div className="pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-white py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Database size={12} className="text-brand-400" />
                <span>Supabase API Key Configuration</span>
                {!hasKey && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                    Action Required
                  </span>
                )}
              </span>
              {showConfig ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showConfig && (
              <div className="mt-2.5 p-3.5 rounded-xl bg-dark-bg border border-white/10 space-y-3 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Step-by-step Setup:</span>
                  <a
                    href="https://supabase.com/dashboard/project/txyysjpubwljltvhiksx/settings/api"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-brand-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Open Supabase Settings</span>
                    <ExternalLink size={11} />
                  </a>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                  1. Visit your <strong className="text-white">Supabase API Settings</strong>.<br />
                  2. Under <strong className="text-white">Project API keys</strong>, copy the <strong className="text-brand-400">anon public key</strong>.<br />
                  3. Paste it below and click <strong className="text-white">Save & Connect</strong>.
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1 font-medium">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-dark-surface border border-white/15 rounded-lg px-2.5 py-2 text-[11px] font-mono text-white focus:outline-none focus:border-brand-500"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    You can also paste it into line 5 of your <code className="text-slate-400">.env</code> file.
                  </span>
                </div>

                {keyMsg && (
                  <div className={`p-2.5 rounded-lg text-[11px] ${
                    keyMsg.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/10 text-rose-300 border border-rose-500/25'
                  }`}>
                    {keyMsg.message}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveAndTestKey}
                  disabled={keyTesting || !anonKey.trim()}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-brand-400 hover:bg-brand-300 text-dark-bg shadow-glow-brand transition-all disabled:opacity-40"
                >
                  {keyTesting ? 'Testing & Saving Key...' : 'Save & Connect to Supabase Cloud'}
                </button>
              </div>
            )}
          </div>

          {/* Security footnote */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <ShieldCheck size={12} className="text-brand-400" />
            <span>Supabase Cloud PostgreSQL • Project: txyysjpubwljltvhiksx</span>
          </div>
        </div>
      </div>
    </div>
  );
}
