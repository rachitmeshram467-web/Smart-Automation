import React, { useState } from 'react';
import { X, Key, Globe, CheckCircle2, AlertTriangle, RefreshCw, Copy, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { testSupabaseConnection, saveConfig } from '../supabaseClient';

export default function ConnectionModal({ isOpen, onClose, currentConfig, onConnectionUpdated }) {
  const [url, setUrl] = useState(currentConfig.url || 'https://txyysjpubwljltvhiksx.supabase.co');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection(url, anonKey);
      setTestResult(result);
      if (result.success) {
        saveConfig(url, anonKey);
        onConnectionUpdated();
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to execute connection test.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveOnly = () => {
    saveConfig(url, anonKey);
    onConnectionUpdated();
    onClose();
  };

  const copyEnvSnippet = () => {
    const text = `VITE_SUPABASE_URL=${url}\nVITE_SUPABASE_ANON_KEY=${anonKey || 'YOUR_ANON_KEY_HERE'}`;
    navigator.clipboard.writeText(text);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">
              <Key size={22} className="card-icon-box green" style={{ display: 'inline-flex' }} />
              Supabase Connection Setup
            </div>
            <p className="modal-subtitle">
              Configure credentials for Project: <strong style={{ color: 'var(--accent-green)' }}>txyysjpubwljltvhiksx</strong>
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Step-by-step guidance */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.85rem'
        }}>
          <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ShieldCheck size={16} /> How to get your API Key:
          </div>
          <ol style={{ paddingLeft: '1.25rem', color: '#94a3b8', lineHeight: 1.6 }}>
            <li>Go to your <a href="https://supabase.com/dashboard/project/txyysjpubwljltvhiksx/settings/api" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-green)', textDecoration: 'underline' }}>Supabase Project API Settings</a></li>
            <li>Look for <strong>Project API keys</strong> and copy the <code>anon</code> / <code>public</code> key</li>
            <li>Paste it in the field below and click <strong>Test & Save</strong></li>
          </ol>
        </div>

        <div className="form-group">
          <label className="form-label">
            <Globe size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Supabase Project REST URL
          </label>
          <input
            type="text"
            className="input-field mono"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://<project-ref>.supabase.co"
          />
          <div className="input-helper">The base URL of your Supabase instance.</div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <Key size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Supabase API Key (Anon or Service Role)
            </span>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
            >
              {showKey ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Show</>}
            </button>
          </label>
          <input
            type={showKey ? 'text' : 'password'}
            className="input-field mono"
            value={anonKey}
            onChange={(e) => setAnonKey(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          />
          <div className="input-helper">
            Required for REST requests (`apikey` and `Authorization: Bearer`).
          </div>
        </div>

        {/* Live Test Feedback */}
        {testResult && (
          <div className={`alert ${testResult.success ? 'alert-success' : 'alert-error'}`}>
            {testResult.success ? <CheckCircle2 size={18} style={{ flexShrink: 0 }} /> : <AlertTriangle size={18} style={{ flexShrink: 0 }} />}
            <div>
              <div style={{ fontWeight: 600 }}>{testResult.message}</div>
              {testResult.details && (
                <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', opacity: 0.9 }}>
                  {typeof testResult.details === 'object' ? JSON.stringify(testResult.details) : testResult.details}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleTestConnection}
            disabled={testing || !url.trim() || !anonKey.trim()}
            style={{ flex: 1 }}
          >
            {testing ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Connecting & Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Test & Save Connection
              </>
            )}
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleSaveOnly}
          >
            Save Locally
          </button>

          <button
            className="btn btn-secondary"
            onClick={copyEnvSnippet}
            title="Copy as .env variables"
          >
            {copiedEnv ? <Check size={16} color="var(--accent-green)" /> : <Copy size={16} />}
            {copiedEnv ? 'Copied!' : 'Copy .env'}
          </button>
        </div>
      </div>
    </div>
  );
}
