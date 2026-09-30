import React from 'react';
import { LayoutDashboard, GitFork, Activity, KeyRound, Settings, Sparkles, Terminal } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'workflows', label: 'Workflows', icon: GitFork },
  { id: 'executions', label: 'Execution Logs', icon: Activity },
  { id: 'credentials', label: 'Credential Vault', icon: KeyRound },
  { id: 'settings', label: 'Settings & Supabase', icon: Settings },
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="w-60 border-r border-white/10 bg-dark-bg/60 backdrop-blur-md flex flex-col justify-between p-3 select-none flex-shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-glow-brand font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-brand-400' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom AI & Engine Pill */}
      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Sparkles size={14} className="text-brand-400" />
          <span>Gemini 2.5 Orchestrator</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Autonomous workflow compiler & runtime diagnostics active.
        </p>
        <div className="flex items-center gap-2 pt-1 border-t border-white/5 text-[10px] text-slate-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
          <span>Engine v1.0 • Node.js</span>
        </div>
      </div>
    </aside>
  );
}
