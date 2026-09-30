import React, { useState, useEffect } from 'react';
import { Zap, Play, Plus, Clock, Globe, Bell, CheckCircle2, RefreshCw, Trash2, Cpu } from 'lucide-react';
import { getSupabaseClient, STORAGE_KEYS } from '../supabaseClient';

const DEFAULT_WORKFLOWS = [
  {
    id: 'wf-1',
    name: 'Real-time Row Insert Dispatcher',
    trigger: 'DB: Insert on "tasks"',
    action: 'POST to Webhook endpoint',
    status: 'active',
    lastRun: '12 mins ago',
    runsCount: 42,
    target: 'tasks',
  },
  {
    id: 'wf-2',
    name: 'Scheduled Data Hygiene & Cleanup',
    trigger: 'Schedule: Every night at 00:00 UTC',
    action: 'DELETE WHERE created_at < NOW() - 30d',
    status: 'active',
    lastRun: '14 hours ago',
    runsCount: 18,
    target: 'logs',
  },
  {
    id: 'wf-3',
    name: 'Critical Event Discord / Slack Alert',
    trigger: 'Threshold: status == "failed"',
    action: 'Send alert payload',
    status: 'paused',
    lastRun: '2 days ago',
    runsCount: 5,
    target: 'events',
  },
];

export default function AutomationsTab({ isConnected, onAutomationsCountChange }) {
  const [workflows, setWorkflows] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_WORKFLOWS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_WORKFLOWS;
      }
    }
    return DEFAULT_WORKFLOWS;
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('db_insert');
  const [newTarget, setNewTarget] = useState('automations');
  const [newAction, setNewAction] = useState('webhook');
  const [executingId, setExecutingId] = useState(null);
  const [runLog, setRunLog] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_WORKFLOWS, JSON.stringify(workflows));
    if (onAutomationsCountChange) {
      onAutomationsCountChange(workflows.length);
    }
  }, [workflows, onAutomationsCountChange]);

  const toggleStatus = (id) => {
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === id ? { ...wf, status: wf.status === 'active' ? 'paused' : 'active' } : wf
      )
    );
  };

  const deleteWorkflow = (id) => {
    setWorkflows((prev) => prev.filter((wf) => wf.id !== id));
  };

  const handleCreateWorkflow = () => {
    if (!newName.trim()) return;

    const triggerLabels = {
      db_insert: `DB: Insert on "${newTarget}"`,
      db_update: `DB: Update on "${newTarget}"`,
      cron: 'Schedule: Every 1 hour',
      webhook: 'Inbound Webhook Received',
    };

    const actionLabels = {
      webhook: 'Forward payload to Webhook',
      audit: `Append log entry to "${newTarget}"`,
      alert: 'Dispatch Notification',
    };

    const newWf = {
      id: `wf-${Date.now()}`,
      name: newName.trim(),
      trigger: triggerLabels[newTrigger] || newTrigger,
      action: actionLabels[newAction] || newAction,
      status: 'active',
      lastRun: 'Just now',
      runsCount: 0,
      target: newTarget,
    };

    setWorkflows([newWf, ...workflows]);
    setNewName('');
    setShowCreateModal(false);
  };

  const handleTestRun = async (wf) => {
    setExecutingId(wf.id);
    setRunLog(null);

    const startTime = performance.now();

    // If connected to Supabase, we can optionally log the run to Supabase
    const client = getSupabaseClient();
    let supabaseLogged = false;

    if (client) {
      try {
        await client.from('logs').insert({
          event: `Automation executed: ${wf.name}`,
          target_table: wf.target,
          executed_at: new Date().toISOString(),
        });
        supabaseLogged = true;
      } catch {
        // Table 'logs' might not exist, fallback silently
      }
    }

    setTimeout(() => {
      const elapsed = Math.round(performance.now() - startTime + 80);
      setWorkflows((prev) =>
        prev.map((item) =>
          item.id === wf.id
            ? {
                ...item,
                runsCount: item.runsCount + 1,
                lastRun: 'A few seconds ago',
              }
            : item
        )
      );

      setRunLog({
        id: wf.id,
        name: wf.name,
        timestamp: new Date().toLocaleTimeString(),
        elapsedMs: elapsed,
        status: 'SUCCESS (200 OK)',
        supabaseSync: supabaseLogged ? 'Synced to Supabase `logs` table' : 'Executed in runner sandbox',
      });
      setExecutingId(null);
    }, 600);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Zap size={22} className="card-icon-box purple" style={{ display: 'inline-flex' }} />
            Smart Automation Studio
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Build and trigger automated workflows connected to your Supabase PostgreSQL database.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          Create Automation
        </button>
      </div>

      {/* Execution Log Alert */}
      {runLog && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={18} />
            <div>
              <strong>Automation Run Completed: "{runLog.name}"</strong>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                Latency: {runLog.elapsedMs}ms • Status: {runLog.status} • {runLog.supabaseSync}
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.6rem' }} onClick={() => setRunLog(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* Workflows Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {workflows.map((wf) => {
          const isRunning = executingId === wf.id;

          return (
            <div key={wf.id} className="workflow-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="card-icon-box purple">
                      <Zap size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', color: '#ffffff' }}>{wf.name}</h4>
                      <span className="brand-badge" style={{ fontSize: '0.65rem', marginTop: '2px', display: 'inline-block' }}>
                        Target: {wf.target}
                      </span>
                    </div>
                  </div>

                  <label className="toggle-switch" title={wf.status === 'active' ? 'Active' : 'Paused'}>
                    <input
                      type="checkbox"
                      checked={wf.status === 'active'}
                      onChange={() => toggleStatus(wf.id)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--accent-blue)' }}>Trigger:</strong> {wf.trigger}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--accent-green)' }}>Action:</strong> {wf.action}
                  </div>
                </div>

                <div className="workflow-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={12} /> Last run: {wf.lastRun}
                  </span>
                  <span>•</span>
                  <span>{wf.runsCount} executions</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                <button
                  className="btn btn-outline-green btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleTestRun(wf)}
                  disabled={isRunning}
                >
                  {isRunning ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                  {isRunning ? 'Running...' : 'Run Simulation'}
                </button>

                <button
                  className="btn-icon"
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => deleteWorkflow(wf.id)}
                  title="Delete workflow"
                >
                  <Trash2 size={13} color="#f43f5e" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Cpu size={20} color="var(--accent-purple)" />
                Create New Smart Automation
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Workflow Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Sync Stripe Transactions to Supabase"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Database Table</label>
              <input
                type="text"
                className="input-field mono"
                placeholder="e.g. automations, tasks, users, orders"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trigger Condition</label>
              <select
                className="input-field"
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                style={{ background: 'var(--bg-input)' }}
              >
                <option value="db_insert">Database Record Inserted (POST)</option>
                <option value="db_update">Database Record Updated (PATCH)</option>
                <option value="cron">Scheduled Timer (Recurring interval)</option>
                <option value="webhook">External Inbound Webhook</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Action to Execute</label>
              <select
                className="input-field"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                style={{ background: 'var(--bg-input)' }}
              >
                <option value="webhook">Dispatch HTTP POST Webhook</option>
                <option value="audit">Log to Supabase audit trail</option>
                <option value="alert">Send Real-time Web Notification</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateWorkflow} disabled={!newName.trim()}>
                <Plus size={16} /> Save & Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
