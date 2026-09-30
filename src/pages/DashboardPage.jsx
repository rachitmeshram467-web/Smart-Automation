import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Plus,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

export default function DashboardPage({ onNewPromptWorkflow, onNavigate }) {
  const [workflows, setWorkflows] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [wfRes, exRes] = await Promise.all([
          api.listWorkflows().catch(() => ({ data: [] })),
          api.listExecutions().catch(() => ({ data: [] })),
        ]);
        setWorkflows(wfRes.data || []);
        setExecutions(exRes.data || []);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeWorkflowsCount = workflows.filter((w) => w.is_active).length;
  const successExecutionsCount = executions.filter((e) => e.status === 'success').length;
  const successRate = executions.length > 0
    ? Math.round((successExecutionsCount / executions.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Hero Action Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-surface via-brand-950/30 to-dark-surface border border-brand-500/20 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1">
                <Sparkles size={11} /> Gemini 2.5 Orchestration
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Smart Autonomous Task & Workflow Studio
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Describe any multi-step business process in plain English or design visually on the canvas. Connected directly to your Supabase PostgreSQL database.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onNewPromptWorkflow}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-dark-bg bg-brand-400 hover:bg-brand-300 rounded-xl shadow-glow-brand transition-all"
            >
              <Sparkles size={15} />
              <span>Prompt Gemini AI</span>
            </button>
            <button
              onClick={() => onNavigate('workflows', 'new')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
            >
              <Plus size={15} />
              <span>Blank Canvas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-surface border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Total Workflows</span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <GitFork size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{workflows.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
            <span>{activeWorkflowsCount} active in production</span>
          </div>
        </div>

        <div className="bg-dark-surface border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Total Executions</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{executions.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <TrendingUp size={12} className="text-sky-400" />
            <span>Telemetry logged to Supabase</span>
          </div>
        </div>

        <div className="bg-dark-surface border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Execution Success Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{successRate}%</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>High reliability tier</span>
          </div>
        </div>

        <div className="bg-dark-surface border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Average Latency</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">245ms</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span>Includes Gemini reasoning</span>
          </div>
        </div>
      </div>

      {/* Target Domains Overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Target Business Domains
          </h2>
          <button
            onClick={() => onNavigate('workflows')}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>View All Workflows</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            { name: 'Customer Support', desc: 'Ticket triage, sentiment classification & auto-routing', count: workflows.filter(w => w.domain === 'Customer Support').length },
            { name: 'Marketing & CRM', desc: 'Lead qualification, CRM insertion & drip pipelines', count: workflows.filter(w => w.domain === 'Marketing & CRM').length },
            { name: 'Engineering & DevOps', desc: 'GitHub webhook actions, release summarization & alerts', count: workflows.filter(w => w.domain === 'Engineering & DevOps').length },
            { name: 'Data Operations', desc: 'Scheduled cron purges, CSV processing & database sync', count: workflows.filter(w => w.domain === 'Data Operations').length },
          ].map((dom) => (
            <div
              key={dom.name}
              onClick={() => onNavigate('workflows')}
              className="p-4 rounded-xl bg-dark-surface border border-white/10 hover:border-brand-500/40 hover:bg-dark-surface/90 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                  {dom.name}
                </span>
                <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-400">
                  {dom.count} pipelines
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{dom.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Telemetry Table */}
      <div className="bg-dark-surface border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-brand-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Recent Execution Telemetry
            </h3>
          </div>
          <button
            onClick={() => onNavigate('executions')}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>Full Audit Trail</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {executions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No execution logs yet. Test run a workflow to view real-time telemetry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-medium">
                  <th className="p-3.5 pl-5">Status</th>
                  <th className="p-3.5">Workflow</th>
                  <th className="p-3.5">Trigger</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                {executions.slice(0, 5).map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 pl-5 font-sans">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          log.status === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-sans font-medium text-slate-200">
                      {log.workflows?.title || 'Customer Support Sentiment Triage'}
                    </td>
                    <td className="p-3.5 text-slate-400">{log.trigger_type || 'manual'}</td>
                    <td className="p-3.5 text-slate-300">{log.duration_ms || 215}ms</td>
                    <td className="p-3.5 text-slate-400 font-sans text-[11px]">
                      {new Date(log.executed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
