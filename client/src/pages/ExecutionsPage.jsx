import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Check,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';

export default function ExecutionsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.listExecutions();
      setLogs(res.data || []);
      if (res.data && res.data.length > 0 && !selectedLog) {
        setSelectedLog(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDiagnose = async (logId) => {
    setDiagnosing(true);
    setDiagnosticResult(null);
    try {
      const res = await api.diagnoseExecution(logId);
      setDiagnosticResult(res.diagnostic);
    } catch (err) {
      setDiagnosticResult({
        rootCause: 'Failed to complete AI diagnostic query.',
        suggestedFix: err.message,
      });
    } finally {
      setDiagnosing(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (statusFilter === 'all') return true;
    return l.status === statusFilter;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity size={20} className="text-brand-400" />
            Global Execution Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable telemetry records and AI-powered failure root-cause analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-dark-surface border border-white/10 rounded-xl p-1 text-xs">
            {['all', 'success', 'failed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={fetchLogs}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-dark-surface border border-white/10 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Split Layout: Log List + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Logs List Table */}
        <div className="lg:col-span-6 bg-dark-surface border border-white/10 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-3.5 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
            Execution Events ({filteredLogs.length})
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-slate-400">
              <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-brand-400" />
              Fetching audit records...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No matching logs found.</div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => {
                      setSelectedLog(log);
                      setDiagnosticResult(null);
                    }}
                    className={`p-3.5 hover:bg-white/[0.03] transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected ? 'bg-brand-500/10 border-l-2 border-brand-400' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            log.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {log.status}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {log.duration_ms || 180}ms
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-1">
                        {log.workflows?.title || 'Support Sentiment & Slack Dispatcher'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Trigger: <span className="font-mono text-slate-400">{log.trigger_type || 'webhook'}</span> • {new Date(log.executed_at).toLocaleTimeString()}
                      </div>
                    </div>

                    <ChevronRight size={16} className={isSelected ? 'text-brand-400' : 'text-slate-600'} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed Inspector Panel */}
        <div className="lg:col-span-6 bg-dark-surface border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
          {selectedLog ? (
            <>
              <div className="flex items-start justify-between pb-3 border-b border-white/10">
                <div>
                  <div className="text-xs text-slate-400">Execution Telemetry Inspector</div>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    {selectedLog.workflows?.title || 'Execution Detail'}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">ID: {selectedLog.id}</div>
                </div>

                {selectedLog.status === 'failed' && (
                  <button
                    onClick={() => handleDiagnose(selectedLog.id)}
                    disabled={diagnosing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-dark-bg bg-brand-400 hover:bg-brand-300 rounded-lg shadow-glow-brand transition-all disabled:opacity-50"
                  >
                    <Sparkles size={13} />
                    <span>{diagnosing ? 'Analyzing...' : 'Diagnose with Gemini'}</span>
                  </button>
                )}
              </div>

              {/* AI Diagnostic Report Banner */}
              {diagnosticResult && (
                <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-brand-300">
                    <Sparkles size={14} className="text-brand-400" />
                    <span>Gemini AI Diagnostic Report</span>
                  </div>
                  <div>
                    <strong className="text-slate-200">Root Cause:</strong>
                    <p className="text-slate-400 mt-0.5">{diagnosticResult.rootCause}</p>
                  </div>
                  <div>
                    <strong className="text-slate-200">Recommended Fix:</strong>
                    <p className="text-slate-400 mt-0.5">{diagnosticResult.suggestedFix}</p>
                  </div>
                </div>
              )}

              {/* Error Message if Failed */}
              {selectedLog.error_message && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 font-mono">
                  <strong>Error:</strong> {selectedLog.error_message}
                </div>
              )}

              {/* Step By Step Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Execution Steps</span>
                {(selectedLog.step_telemetry || []).map((step, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-dark-bg border border-white/5 space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between font-sans">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className={step.status === 'success' ? 'text-brand-400' : 'text-rose-400'} />
                        {step.step}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{step.duration_ms}ms</span>
                    </div>
                    {step.output && (
                      <pre className="text-[10px] text-slate-400 bg-black/40 p-2 rounded overflow-x-auto mt-1">
                        {JSON.stringify(step.output, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>

              {/* Input Payload */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Input Trigger Payload
                </span>
                <pre className="text-[11px] font-mono text-slate-300 bg-dark-bg border border-white/5 p-3 rounded-xl overflow-x-auto">
                  {JSON.stringify(selectedLog.input_payload || {}, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              Select an execution log to inspect step telemetry and debug data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
