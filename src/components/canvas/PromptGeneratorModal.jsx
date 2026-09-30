import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

const EXAMPLE_PROMPTS = [
  {
    title: 'Customer Ticket Sentiment Triage',
    domain: 'Customer Support',
    prompt: 'When a new support ticket arrives via webhook, analyze the sentiment with Gemini AI, and if critical, dispatch a high-priority Slack alert.',
  },
  {
    title: 'Lead Qualification & CRM Relay',
    domain: 'Marketing & CRM',
    prompt: 'When a user signs up, use Gemini to classify company size from their email domain and upsert the enriched lead into our Postgres database.',
  },
  {
    title: 'GitHub PR Release Summarizer',
    domain: 'Engineering & DevOps',
    prompt: 'Listen for GitHub release webhooks, summarize git commit logs into user highlights with Gemini, and notify Discord announcements.',
  },
  {
    title: 'Nightly Database Hygiene & Archive',
    domain: 'Data Operations',
    prompt: 'Run every night on a schedule, delete logs older than 30 days from database, and send an execution report via webhook.',
  },
];

export default function PromptGeneratorModal({ isOpen, onClose, onGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [domain, setDomain] = useState('Customer Support');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.generateWorkflow(prompt, domain);
      if (response.success && response.data) {
        onGenerated(response.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to synthesize workflow from prompt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-dark-surface border border-white/15 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-glow-brand">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Prompt-to-Workflow Generator
                <span className="text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full font-mono">
                  Gemini 2.5
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Describe your desired automation in plain English. Gemini AI will build the complete node graph.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Target Domain Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Business Domain</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Customer Support', 'Marketing & CRM', 'Engineering & DevOps', 'Data Operations'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDomain(d)}
                className={`py-1.5 px-2.5 text-xs rounded-lg font-medium border text-center transition-all ${
                  domain === d
                    ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 shadow-sm'
                    : 'bg-dark-bg text-slate-400 border-white/10 hover:border-white/20'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">What should this automation do?</label>
          <textarea
            rows={4}
            className="w-full bg-dark-bg border border-white/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 placeholder:text-slate-500 resize-none transition-all"
            placeholder="e.g., When an order event arrives, classify customer loyalty tier with Gemini, and if VIP, trigger an instant Slack message..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {/* Example Quick-Chips */}
        <div className="mb-5">
          <span className="text-[11px] text-slate-400 font-medium block mb-2">Or click an enterprise template:</span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setPrompt(ex.prompt);
                  setDomain(ex.domain);
                }}
                className="w-full text-left p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-brand-300 transition-colors">
                    {ex.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{ex.prompt}</div>
                </div>
                <ArrowRight size={13} className="text-slate-600 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-dark-bg bg-brand-400 hover:bg-brand-300 rounded-lg shadow-glow-brand transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? 'Synthesizing with Gemini...' : 'Generate Workflow'}
          </button>
        </div>
      </div>
    </div>
  );
}
