import React, { useState } from 'react';
import { Settings, Database, Sparkles, Users, Key, Copy, Check, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { testSupabaseConnection, saveConfig, getConfig } from '../supabaseClient';

export default function SettingsPage() {
  const currentConfig = getConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url || 'https://txyysjpubwljltvhiksx.supabase.co');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [geminiKey, setGeminiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTestAndSave = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(supabaseUrl, anonKey);
      setTestResult(res);
      if (res.success) {
        saveConfig(supabaseUrl, anonKey);
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const copyMigrationSql = () => {
    const sql = `-- SMART AUTOMATION SQL MIGRATION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'developer'
);

CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  definition JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name TEXT NOT NULL,
  encrypted_secret TEXT NOT NULL,
  iv TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  input_payload JSONB DEFAULT '{}'::jsonb,
  output_payload JSONB DEFAULT '{}'::jsonb,
  step_telemetry JSONB DEFAULT '[]'::jsonb,
  duration_ms INTEGER DEFAULT 0,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read/write workflows" ON public.workflows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write logs" ON public.execution_logs FOR ALL USING (true) WITH CHECK (true);
`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings size={20} className="text-brand-400" />
          Workspace Settings & Integrations
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage database connectivity, Gemini AI keys, and team permissions.
        </p>
      </div>

      {/* Supabase Integration Card */}
      <div className="bg-dark-surface border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Database size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Supabase PostgreSQL Connection</h3>
              <p className="text-xs text-slate-400">Project Reference: txyysjpubwljltvhiksx</p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard/project/txyysjpubwljltvhiksx/settings/api"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
          >
            <span>Supabase API Keys</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Project REST Endpoint</label>
            <input
              type="text"
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Supabase Anon Public Key (or Service Role Secret)
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
            />
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              testResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/10 text-rose-300 border border-rose-500/25'
            }`}>
              {testResult.success ? <CheckCircle2 size={16} /> : <Database size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleTestAndSave}
              disabled={testing || !anonKey.trim()}
              className="px-4 py-2 text-xs font-bold text-dark-bg bg-brand-400 hover:bg-brand-300 rounded-xl shadow-glow-brand transition-all disabled:opacity-50"
            >
              {testing ? 'Testing Endpoint...' : 'Test & Save Supabase Key'}
            </button>

            <button
              onClick={copyMigrationSql}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-white/5 border border-white/10 rounded-xl transition-colors"
            >
              {copiedSql ? <Check size={13} className="text-brand-400" /> : <Copy size={13} />}
              <span>{copiedSql ? 'Copied Migration SQL!' : 'Copy Schema SQL'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Google Gemini AI Configuration */}
      <div className="bg-dark-surface border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <Sparkles size={17} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Google Gemini AI Engine</h3>
            <p className="text-xs text-slate-400">Powering Prompt-to-Workflow & Failure Diagnostics</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            GEMINI_API_KEY (from Google AI Studio)
          </label>
          <input
            type="password"
            placeholder="AIzaSy..."
            className="w-full bg-dark-bg border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Model orchestration uses <code>gemini-2.5-flash</code> for sub-second generation and <code>gemini-2.5-pro</code> for complex topology reasoning.
          </p>
        </div>
      </div>

      {/* Team & RBAC Members */}
      <div className="bg-dark-surface border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Users size={17} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Team & Role-Based Access Control</h3>
            <p className="text-xs text-slate-400">Multi-tenant workspace permissions</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          {[
            { email: 'alex.developer@smartautomation.io', role: 'Owner', badge: 'bg-brand-500/15 text-brand-300 border-brand-500/30' },
            { email: 'sarah.engineer@smartautomation.io', role: 'Developer', badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
            { email: 'ops.lead@smartautomation.io', role: 'Admin', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
          ].map((m, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-dark-bg border border-white/5">
              <span className="text-slate-200 font-medium">{m.email}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${m.badge}`}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
