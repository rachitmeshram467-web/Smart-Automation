import React, { useState } from 'react';
import { Database, Sparkles, User, LogOut, ExternalLink, Plus, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onNewWorkflow, onOpenSettings }) {
  const { user, isDemo, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-14 border-b border-white/10 bg-dark-bg/85 backdrop-blur-xl px-5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-sky-400 p-[1px]">
            <div className="w-full h-full bg-dark-bg rounded-[7px] flex items-center justify-center text-brand-400 shadow-glow-brand">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-white">Smart Automation</span>
            <span className="text-[10px] bg-brand-500/15 text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/30 font-semibold uppercase tracking-wider">
              AI Platform
            </span>
          </div>
        </div>

        {/* Supabase status indicator */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/10 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse shadow-glow-brand"></span>
          <span>Supabase PostgreSQL: <strong className="text-slate-200">Connected</strong></span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNewWorkflow}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-dark-bg bg-brand-400 hover:bg-brand-300 rounded-lg shadow-glow-brand transition-all"
        >
          <Plus size={14} />
          <span>New Workflow</span>
        </button>

        <a
          href="https://supabase.com/dashboard/project/txyysjpubwljltvhiksx"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
        >
          <Database size={13} className="text-brand-400" />
          <span>Supabase Studio</span>
          <ExternalLink size={11} className="text-slate-500" />
        </a>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-500/30">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden lg:inline text-xs text-slate-300 font-medium truncate max-w-[130px]">
              {user?.email || 'Developer'}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-dark-surface border border-white/15 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <div className="text-xs font-semibold text-white truncate">{user?.email}</div>
                <div className="text-[10px] text-brand-400 capitalize">
                  {isDemo ? 'Developer Demo Account' : 'Supabase Authenticated'}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  if (onOpenSettings) onOpenSettings();
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-md flex items-center gap-2 transition-colors"
              >
                <User size={13} />
                <span>Workspace Settings</span>
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  signOut();
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-md flex items-center gap-2 transition-colors mt-1"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
