import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Play,
  Plus,
  Sparkles,
  GitFork,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  X,
} from 'lucide-react';
import WorkflowCanvas from '../components/canvas/WorkflowCanvas';
import NodeConfigDrawer from '../components/canvas/NodeConfigDrawer';
import { api } from '../services/api';

const DEFAULT_NEW_NODES = [
  {
    id: 'node-1',
    type: 'trigger',
    label: 'Inbound Webhook',
    position: { x: 80, y: 150 },
    data: { label: 'Inbound Webhook', config: { triggerType: 'webhook', path: '/webhook/event' } },
  },
  {
    id: 'node-2',
    type: 'ai_transform',
    label: 'Gemini AI Processor',
    position: { x: 380, y: 150 },
    data: { label: 'Gemini AI Processor', config: { model: 'gemini-2.5-flash', instruction: 'Extract key attributes and evaluate priority.' } },
  },
  {
    id: 'node-3',
    type: 'action',
    label: 'Supabase Data Relay',
    position: { x: 680, y: 150 },
    data: { label: 'Supabase Data Relay', config: { actionType: 'database_insert', table: 'events' } },
  },
];

const DEFAULT_NEW_EDGES = [
  { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#3ecf8e', strokeWidth: 2 } },
  { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#3ecf8e', strokeWidth: 2 } },
];

export default function WorkflowEditorPage({ workflowId, initialData, onBack }) {
  const [title, setTitle] = useState('New Automation Workflow');
  const [domain, setDomain] = useState('Customer Support');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [nodes, setNodes] = useState(DEFAULT_NEW_NODES);
  const [edges, setEdges] = useState(DEFAULT_NEW_EDGES);
  const [selectedNode, setSelectedNode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Execution Sandbox State
  const [showSandbox, setShowSandbox] = useState(false);
  const [testPayload, setTestPayload] = useState('{\n  "ticket_id": "TCK-9901",\n  "customer": "dev@company.io",\n  "message": "Urgent: payment webhook failed with 401 Unauthorized"\n}');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || 'Synthesized Pipeline');
      setDomain(initialData.domain || 'Customer Support');
      setDescription(initialData.description || '');
      if (initialData.nodes) {
        setNodes(initialData.nodes.map(n => ({ ...n, data: { label: n.label, config: n.config } })));
      }
      if (initialData.edges) {
        setEdges(initialData.edges.map(e => ({ ...e, animated: true, style: { stroke: '#3ecf8e', strokeWidth: 2 } })));
      }
      return;
    }

    if (workflowId && workflowId !== 'new') {
      api.getWorkflow(workflowId)
        .then((res) => {
          const wf = res.data;
          if (wf) {
            setTitle(wf.title);
            setDomain(wf.domain || 'General Automation');
            setDescription(wf.description || '');
            setIsActive(wf.is_active || false);
            if (wf.definition?.nodes) {
              setNodes(wf.definition.nodes.map(n => ({ ...n, data: { label: n.label, config: n.config } })));
            }
            if (wf.definition?.edges) {
              setEdges(wf.definition.edges.map(e => ({ ...e, animated: true, style: { stroke: '#3ecf8e', strokeWidth: 2 } })));
            }
          }
        })
        .catch((err) => console.error('Failed to load workflow:', err));
    }
  }, [workflowId, initialData]);

  const handleAddNode = (type) => {
    const id = `node-${Date.now().toString().slice(-4)}`;
    const labels = {
      trigger: 'Event Trigger',
      ai_transform: 'Gemini AI Logic',
      condition: 'Decision Branch',
      action: 'Target Action',
    };

    const newPositions = {
      x: 100 + (nodes.length % 3) * 260,
      y: 100 + Math.floor(nodes.length / 3) * 160,
    };

    const newNode = {
      id,
      type,
      label: labels[type] || 'Step',
      position: newPositions,
      data: {
        label: labels[type] || 'Step',
        config: type === 'ai_transform' ? { model: 'gemini-2.5-flash', instruction: 'Analyze payload' } : {},
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
  };

  const handleUpdateNode = (id, updatedNode) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? updatedNode : n)));
    setSelectedNode(updatedNode);
  };

  const handleDeleteNode = (id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);

    const payload = {
      title,
      description,
      domain,
      isActive,
      definition: {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type,
          label: n.data?.label || n.label || 'Step',
          position: n.position,
          config: n.data?.config || n.config || {},
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
        })),
      },
    };

    try {
      if (workflowId && workflowId !== 'new') {
        await api.updateWorkflow(workflowId, payload);
      } else {
        await api.createWorkflow(payload);
      }
      setSaveStatus({ success: true, message: 'Workflow saved to Supabase database!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus({ success: false, message: err.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleRunExecution = async () => {
    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(testPayload);
    } catch {
      alert('Invalid JSON in test payload');
      return;
    }

    setExecuting(true);
    setExecutionResult(null);

    try {
      const activeId = workflowId && workflowId !== 'new' ? workflowId : 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
      const result = await api.executeWorkflow(activeId, parsedPayload, 'manual');
      setExecutionResult(result);
    } catch (err) {
      setExecutionResult({
        success: false,
        error: err.message || 'Execution error occurred',
        telemetry: [],
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-5 relative overflow-hidden">
      {/* Editor Top Control Bar */}
      <div className="h-14 border-b border-white/10 bg-dark-surface/90 backdrop-blur-md px-5 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Back to Workflows"
          >
            <ArrowLeft size={16} />
          </button>

          <input
            type="text"
            className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-white/20 focus:border-brand-500 focus:outline-none px-1.5 py-0.5 max-w-[280px] truncate"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="bg-dark-bg border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          >
            <option value="Customer Support">Customer Support</option>
            <option value="Marketing & CRM">Marketing & CRM</option>
            <option value="Engineering & DevOps">Engineering & DevOps</option>
            <option value="Data Operations">Data Operations</option>
          </select>
        </div>

        {/* Node Addition Palette & Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-dark-bg border border-white/10 rounded-xl p-1">
            <button
              onClick={() => handleAddNode('trigger')}
              className="px-2 py-1 text-[11px] font-medium text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors flex items-center gap-1"
            >
              <Zap size={12} />
              <span>+ Trigger</span>
            </button>
            <button
              onClick={() => handleAddNode('ai_transform')}
              className="px-2 py-1 text-[11px] font-medium text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors flex items-center gap-1"
            >
              <Sparkles size={12} />
              <span>+ Gemini AI</span>
            </button>
            <button
              onClick={() => handleAddNode('condition')}
              className="px-2 py-1 text-[11px] font-medium text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors flex items-center gap-1"
            >
              <GitFork size={12} />
              <span>+ Condition</span>
            </button>
            <button
              onClick={() => handleAddNode('action')}
              className="px-2 py-1 text-[11px] font-medium text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus size={12} />
              <span>+ Action</span>
            </button>
          </div>

          <button
            onClick={() => setShowSandbox(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
          >
            <Play size={13} className="text-brand-400" />
            <span>Test Sandbox</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-dark-bg bg-brand-400 hover:bg-brand-300 rounded-xl shadow-glow-brand transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveStatus && (
        <div className={`absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in duration-150 ${
          saveStatus.success ? 'bg-emerald-500/90 text-dark-bg' : 'bg-rose-500 text-white'
        }`}>
          {saveStatus.success ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Main Canvas & Config Area */}
      <div className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 h-full">
          <WorkflowCanvas
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
            onNodeSelect={(node) => setSelectedNode(node)}
            selectedNodeId={selectedNode?.id}
          />
        </div>

        {selectedNode && (
          <NodeConfigDrawer
            selectedNode={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
          />
        )}
      </div>

      {/* Test Execution Sandbox Slide-Over */}
      {showSandbox && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-dark-surface/98 border-l border-white/10 backdrop-blur-2xl z-50 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Terminal size={18} className="text-brand-400" />
              <h3 className="font-bold text-white text-sm">Execution Sandbox</h3>
            </div>
            <button onClick={() => setShowSandbox(false)} className="text-slate-400 hover:text-white p-1 rounded-md">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Input Trigger Payload (JSON)
              </label>
              <textarea
                rows={6}
                className="w-full bg-dark-bg border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
              />
            </div>

            <button
              onClick={handleRunExecution}
              disabled={executing}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-dark-bg bg-brand-400 hover:bg-brand-300 rounded-xl shadow-glow-brand transition-all disabled:opacity-50"
            >
              {executing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              <span>{executing ? 'Executing Pipeline...' : 'Run Simulation'}</span>
            </button>

            {executionResult && (
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    executionResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {executionResult.success ? 'SUCCESS (200 OK)' : 'FAILED'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Duration: {executionResult.duration_ms}ms
                  </span>
                </div>

                {/* Step Telemetry Timeline */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step Telemetry:</span>
                  {(executionResult.telemetry || []).map((step, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-dark-bg border border-white/5 text-xs font-mono">
                      <div className="flex items-center justify-between text-slate-200 font-semibold mb-1">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className={step.status === 'success' ? 'text-brand-400' : 'text-rose-400'} />
                          {step.step}
                        </span>
                        <span className="text-[10px] text-slate-500">{step.duration_ms}ms</span>
                      </div>
                      {step.output && (
                        <pre className="text-[10px] text-slate-400 overflow-x-auto bg-black/30 p-1.5 rounded mt-1">
                          {JSON.stringify(step.output, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
