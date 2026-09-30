import React, { useState, useEffect } from 'react';
import { KeyRound, Plus, Trash2, ShieldCheck, Lock, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [secret, setSecret] = useState('');
  const [authType, setAuthType] = useState('bearer_token');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const res = await api.listCredentials();
      setCredentials(res.data || []);
    } catch (err) {
      console.error('Failed to load credentials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!serviceName.trim() || !secret.trim()) return;
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await api.createCredential(serviceName, secret, authType);
      if (res.data) {
        setCredentials([res.data, ...credentials]);
      }
      setShowAddModal(false);
      setServiceName('');
      setSecret('');
      setStatusMsg({ success: true, message: 'Credential encrypted with AES-256-GCM and stored.' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      alert(`Failed to save credential: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this integration secret from the vault?')) return;
    try {
      await api.deleteCredential(id);
      setCredentials((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <KeyRound size={20} className="text-brand-400" />
            Encrypted Credential Vault
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Store third-party API keys, OAuth tokens, and secrets protected with AES-256-GCM.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-dark-bg bg-brand-400 hover:bg-brand-300 rounded-xl shadow-glow-brand transition-all"
        >
          <Plus size={14} />
          <span>Add Credential</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={15} />
          {statusMsg.message}
        </div>
      )}

      {/* Credentials Table */}
      <div className="bg-dark-surface border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3.5 pl-5">Service / Connector</th>
                <th className="p-3.5">Auth Type</th>
                <th className="p-3.5">Encryption Status</th>
                <th className="p-3.5">Created Date</th>
                <th className="p-3.5 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <RefreshCw size={18} className="animate-spin mx-auto mb-1 text-brand-400" />
                    Accessing vault...
                  </td>
                </tr>
              ) : credentials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No stored credentials. Add an API token to use in third-party automation nodes.
                  </td>
                </tr>
              ) : (
                credentials.map((cred) => (
                  <tr key={cred.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 pl-5 font-semibold text-white flex items-center gap-2">
                      <Lock size={13} className="text-brand-400" />
                      {cred.service_name}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {cred.auth_type}
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <ShieldCheck size={13} />
                        AES-256-GCM Encrypted
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(cred.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => handleDelete(cred.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete credential"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Credential Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-dark-surface border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-brand-400" />
                <h3 className="font-bold text-white text-sm">Add Encrypted Credential</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Service / Integration Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Slack Webhook Bot or Stripe Secret"
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Authentication Type</label>
                <select
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value)}
                >
                  <option value="bearer_token">Bearer Token (OAuth / Bot)</option>
                  <option value="api_key">API Key (Header / Query)</option>
                  <option value="basic">Basic Auth</option>
                  <option value="oauth2">OAuth2 Access Token</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Secret Value / API Key</label>
                <input
                  type="password"
                  required
                  placeholder="sk_live_..."
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Encrypted immediately with server-side AES-256-GCM before database write.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-dark-bg bg-brand-400 hover:bg-brand-300 rounded-lg shadow-glow-brand transition-all disabled:opacity-50"
                >
                  {saving ? 'Encrypting & Storing...' : 'Save Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
