import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Sparkles, GitBranch, ArrowRightCircle, Cpu, Clock, Globe } from 'lucide-react';

export const TriggerNode = memo(({ data, selected }) => {
  return (
    <div className={`px-4 py-3 rounded-xl border bg-dark-card shadow-lg transition-all min-w-[220px] ${
      selected ? 'border-sky-400 ring-2 ring-sky-400/30 shadow-glow-cyan' : 'border-sky-500/30 hover:border-sky-500/60'
    }`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
            {data.config?.triggerType === 'cron' ? <Clock size={16} /> : <Zap size={16} />}
          </div>
          <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">Trigger</span>
        </div>
        <span className="text-[10px] bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/20">
          {data.config?.triggerType || 'webhook'}
        </span>
      </div>
      <div className="font-semibold text-sm text-slate-100">{data.label || 'Event Trigger'}</div>
      <div className="text-[11px] text-slate-400 font-mono mt-1 truncate">
        {data.config?.path || data.config?.endpoint || data.config?.expression || 'inbound-event'}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-sky-400 !w-2.5 !h-2.5" />
    </div>
  );
});

export const AiTransformNode = memo(({ data, selected }) => {
  return (
    <div className={`px-4 py-3 rounded-xl border bg-dark-card shadow-lg transition-all min-w-[240px] ${
      selected ? 'border-brand-400 ring-2 ring-brand-400/30 shadow-glow-brand' : 'border-brand-500/30 hover:border-brand-500/60'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-brand-400 !w-2.5 !h-2.5" />
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider">Gemini AI</span>
        </div>
        <span className="text-[10px] bg-brand-500/10 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/20 font-mono">
          {data.config?.model || 'gemini-2.5-flash'}
        </span>
      </div>
      <div className="font-semibold text-sm text-slate-100">{data.label || 'AI Transformation'}</div>
      <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
        {data.config?.instruction || 'Natural language reasoning and schema extraction.'}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-brand-400 !w-2.5 !h-2.5" />
    </div>
  );
});

export const ConditionNode = memo(({ data, selected }) => {
  return (
    <div className={`px-4 py-3 rounded-xl border bg-dark-card shadow-lg transition-all min-w-[220px] ${
      selected ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-amber-500/30 hover:border-amber-500/60'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-amber-400 !w-2.5 !h-2.5" />
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <GitBranch size={16} />
          </div>
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Condition</span>
        </div>
        <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
          {data.config?.operator || 'filter'}
        </span>
      </div>
      <div className="font-semibold text-sm text-slate-100">{data.label || 'Decision Gate'}</div>
      <div className="text-[11px] text-slate-400 font-mono mt-1">
        {data.config?.field ? `${data.config.field} == "${data.config.value}"` : 'Evaluate payload'}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-amber-400 !w-2.5 !h-2.5" />
    </div>
  );
});

export const ActionNode = memo(({ data, selected }) => {
  return (
    <div className={`px-4 py-3 rounded-xl border bg-dark-card shadow-lg transition-all min-w-[220px] ${
      selected ? 'border-purple-400 ring-2 ring-purple-400/30' : 'border-purple-500/30 hover:border-purple-500/60'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-purple-400 !w-2.5 !h-2.5" />
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <ArrowRightCircle size={16} />
          </div>
          <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">Action</span>
        </div>
        <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20 font-mono">
          {data.config?.actionType || 'dispatch'}
        </span>
      </div>
      <div className="font-semibold text-sm text-slate-100">{data.label || 'Execute Action'}</div>
      <div className="text-[11px] text-slate-400 font-mono mt-1 truncate">
        {data.config?.channel || data.config?.destination || data.config?.table || 'External Target'}
      </div>
    </div>
  );
});
