import React, { useState, useEffect } from 'react';
import { X, Trash2, Sparkles, Settings2, Sliders } from 'lucide-react';

export default function NodeConfigDrawer({ selectedNode, onClose, onUpdateNode, onDeleteNode }) {
  const [label, setLabel] = useState('');
  const [config, setConfig] = useState({});

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data?.label || selectedNode.label || '');
      setConfig(selectedNode.data?.config || selectedNode.config || {});
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const nodeType = selectedNode.type;

  const handleChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdateNode(selectedNode.id, {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        label,
        config: newConfig,
      },
    });
  };

  const handleLabelChange = (newLabel) => {
    setLabel(newLabel);
    onUpdateNode(selectedNode.id, {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        label: newLabel,
        config,
      },
    });
  };

  return (
    <aside className="w-80 border-l border-white/10 bg-dark-surface/95 backdrop-blur-xl p-5 flex flex-col h-full z-20 shadow-2xl animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
        <div className="flex items-center gap-2">
          <Settings2 size={18} className="text-brand-400" />
          <h3 className="font-semibold text-white text-sm">Node Configuration</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Node Type Badge */}
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-white/5 border border-white/10 text-brand-300">
            {nodeType}
          </span>
        </div>

        {/* Label Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Node Label</label>
          <input
            type="text"
            className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
          />
        </div>

        {/* Dynamic Type Configs */}
        {nodeType === 'trigger' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Trigger Type</label>
              <select
                className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                value={config.triggerType || 'webhook'}
                onChange={(e) => handleChange('triggerType', e.target.value)}
              >
                <option value="webhook">Inbound Webhook</option>
                <option value="cron">Scheduled Poller (Cron)</option>
                <option value="event">Database Event (Supabase)</option>
                <option value="manual">Manual Trigger</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Endpoint / Path</label>
              <input
                type="text"
                className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white"
                value={config.path || config.endpoint || '/webhook/event'}
                onChange={(e) => handleChange('path', e.target.value)}
              />
            </div>
          </>
        )}

        {nodeType === 'ai_transform' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Gemini AI Model</label>
              <select
                className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 font-mono text-xs"
                value={config.model || 'gemini-2.5-flash'}
                onChange={(e) => handleChange('model', e.target.value)}
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (High Throughput)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Complex Reasoning)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Prompt Instruction</span>
                <Sparkles size={13} className="text-brand-400" />
              </label>
              <textarea
                rows={5}
                className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                placeholder="Instruct Gemini what to parse, summarize, classify, or transform..."
                value={config.instruction || ''}
                onChange={(e) => handleChange('instruction', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Temperature</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="w-full accent-brand-500"
                value={config.temperature ?? 0.2}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Deterministic (0.0)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>
          </>
        )}

        {nodeType === 'condition' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Field to Evaluate</label>
              <input
                type="text"
                className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white"
                placeholder="e.g. sentiment or payload.score"
                value={config.field || ''}
                onChange={(e) => handleChange('field', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Operator</label>
              <select
                className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                value={config.operator || 'equals'}
                onChange={(e) => handleChange('operator', e.target.value)}
              >
                <option value="equals">Equals (==)</option>
                <option value="gte">Greater Than or Equal (&gt;=)</option>
                <option value="lte">Less Than or Equal (&lt;=)</option>
                <option value="contains">Contains Substring</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Comparison Value</label>
              <input
                type="text"
                className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white"
                placeholder="e.g. CRITICAL or 80"
                value={config.value || ''}
                onChange={(e) => handleChange('value', e.target.value)}
              />
            </div>
          </>
        )}

        {nodeType === 'action' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Action Type</label>
              <select
                className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                value={config.actionType || 'slack_webhook'}
                onChange={(e) => handleChange('actionType', e.target.value)}
              >
                <option value="slack_webhook">Slack Webhook Alert</option>
                <option value="discord_webhook">Discord Notification</option>
                <option value="database_insert">Supabase Postgres Insert</option>
                <option value="http_post">External REST API Call</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Destination / Channel</label>
              <input
                type="text"
                className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white"
                placeholder="e.g. #support-urgent or https://hooks.slack.com/..."
                value={config.channel || config.destination || config.table || ''}
                onChange={(e) => handleChange('channel', e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {/* Delete Node Footer */}
      <div className="pt-4 border-t border-white/10 mt-auto">
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
          Remove Node from Canvas
        </button>
      </div>
    </aside>
  );
}
