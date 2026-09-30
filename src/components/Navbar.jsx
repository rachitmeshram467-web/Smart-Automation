import React from 'react';
import { Database, Zap, Table, Terminal, FileCode, Settings, ExternalLink } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, connectionStatus, latency, onOpenConfig }) {
  const getStatusClass = () => {
    if (connectionStatus === 'connected') return 'connected';
    if (connectionStatus === 'checking') return 'connecting';
    return 'disconnected';
  };

  const getStatusLabel = () => {
    if (connectionStatus === 'connected') return latency ? `Connected (${latency}ms)` : 'Connected';
    if (connectionStatus === 'checking') return 'Checking...';
    return 'Not Connected';
  };

  return (
    <header className="navbar">
      <div className="brand-wrapper">
        <div className="brand-icon-box">
          <Database size={22} />
        </div>
        <div>
          <div className="brand-title">
            Smart Automation
            <span className="brand-badge">Supabase DB</span>
          </div>
        </div>
      </div>

      <nav className="nav-center">
        <button
          className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Database size={16} />
          Overview
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
          onClick={() => setActiveTab('tables')}
        >
          <Table size={16} />
          Tables & Data
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'automations' ? 'active' : ''}`}
          onClick={() => setActiveTab('automations')}
        >
          <Zap size={16} />
          Automations
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => setActiveTab('api')}
        >
          <Terminal size={16} />
          REST API
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'sql' ? 'active' : ''}`}
          onClick={() => setActiveTab('sql')}
        >
          <FileCode size={16} />
          SQL Schema
        </button>
      </nav>

      <div className="nav-right">
        <div 
          className={`status-pill ${getStatusClass()}`}
          onClick={onOpenConfig}
          title="Click to manage database connection settings"
        >
          <span className="status-dot"></span>
          <span>{getStatusLabel()}</span>
        </div>

        <button 
          className="btn-icon" 
          onClick={onOpenConfig}
          title="Configure Database Connection"
        >
          <Settings size={18} />
        </button>

        <a 
          href="https://supabase.com/dashboard/project/txyysjpubwljltvhiksx" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <span>Dashboard</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </header>
  );
}
