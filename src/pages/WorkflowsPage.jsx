import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Search,
  Plus,
  Play,
  Trash2,
  Copy,
  Edit,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';

export default function WorkflowsPage({ onOpenEditor, onNewPromptWorkflow }) {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await api.listWorkflows();
      setWorkflows(res.data || []);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleToggleActive = async (wf, e) => {
    e.stopPropagation();
    try {
      const newStatus = !wf.is_active;
      await api.updateWorkflow(wf.id, { is_active: newStatus });
      setWorkflows((prev) =>
        prev.map((item) => (item.id === wf.id ? { ...item, is_active: newStatus } : item))
      );
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this workflow definition?')) return;
    try {
      await api.deleteWorkflow(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleDuplicate = async (wf, e) => {
    e.stopPropagation();
    try {
      const duplicated = {
        title: `${wf.title} (Copy)`,
        description: wf.description,
        domain: wf.domain,
        isActive: false,
        definition: wf.definition,
      };
      const res = await api.createWorkflow(duplicated);
      if (res.data) {
        setWorkflows([res.data, ...workflows]);
      }
    } catch (err) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDomain = selectedDomain === 'All' || w.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitFork size={20} className="text-brand-400" />
            Workflow Pipelines
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage, configure, and monitor your automated event pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNewPromptWorkflow}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-dark-bg bg-brand-400 hover:bg-brand-300 rounded-xl shadow-glow-brand transition-all"
          >
            <Sparkles size={14} />
            <span>Generate with AI</span>
          </button>
          <button
            onClick={() => onOpenEditor('new')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
          >
            <Plus size={14} />
            <span>Blank Canvas</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-dark-surface border border-white/10 rounded-xl p-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full bg-dark-bg border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            placeholder="Search workflows by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Domain:</span>
          <select
            className="bg-dark-bg border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
          >
            <option value="All">All Domains</option>
            <option value="Customer Support">Customer Support</option>
            <option value="Marketing & CRM">Marketing & CRM</option>
            <option value="Engineering & DevOps">Engineering & DevOps</option>
            <option value="Data Operations">Data Operations</option>
          </select>

          <button
            onClick={fetchWorkflows}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Workflows Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <RefreshCw size={22} className="animate-spin mx-auto mb-2 text-brand-400" />
          Loading workflows...
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="p-12 text-center border border-white/10 rounded-2xl bg-dark-surface">
          <Layers size={32} className="text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No Workflows Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Try adjusting your search criteria or create an automation using Gemini AI.
          </p>
          <button
            onClick={onNewPromptWorkflow}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-dark-bg bg-brand-400 hover:bg-brand-300 rounded-xl shadow-glow-brand transition-all"
          >
            <Sparkles size={14} />
            <span>Generate with Gemini</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredWorkflows.map((wf) => {
            const nodesCount = wf.definition?.nodes?.length || 0;
            return (
              <div
                key={wf.id}
                onClick={() => onOpenEditor(wf.id)}
                className="bg-dark-surface border border-white/10 hover:border-brand-500/40 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      {wf.domain}
                    </span>

                    {/* Active Toggle Switch */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className={`text-[10px] font-medium ${wf.is_active ? 'text-brand-400' : 'text-slate-500'}`}>
                        {wf.is_active ? 'Active' : 'Paused'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleToggleActive(wf, e)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          wf.is_active ? 'bg-brand-500' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            wf.is_active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                    {wf.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {wf.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Layers size={12} className="text-brand-400" />
                      {nodesCount} Nodes
                    </span>
                    <span>•</span>
                    <span>Updated {new Date(wf.updated_at || wf.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditor(wf.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-200 bg-white/5 hover:bg-brand-500/15 hover:text-brand-300 rounded-lg border border-white/10 transition-colors"
                  >
                    <Edit size={13} />
                    <span>Open Canvas</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDuplicate(wf, e)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(wf.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
