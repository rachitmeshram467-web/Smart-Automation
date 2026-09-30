import React from 'react';
import { Database, Zap, Table, Terminal, Shield, Activity, RefreshCw, Key, CheckCircle2, ArrowRight } from 'lucide-react';

export default function OverviewTab({
  config,
  connectionStatus,
  latency,
  automationsCount,
  onOpenConfig,
  onRecheckConnection,
  checking,
  setActiveTab
}) {
  const isConnected = connectionStatus === 'connected';

  return (
    <div>
      {/* Top Banner if not connected */}
      {!isConnected && (
        <div className="connection-banner">
          <div className="banner-left">
            <Key className="banner-icon" size={24} />
            <div className="banner-text">
              <h4>Database API Key Required</h4>
              <p>
                Your project URL <code>{config.url}</code> is set. Please add your Supabase <strong>anon public key</strong> to connect and run queries.
              </p>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onOpenConfig}>
            Configure Key Now
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="cards-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-box green">
                <Database size={18} />
              </div>
              <span className="card-title">Database Status</span>
            </div>
            <button
              className="btn-icon"
              style={{ width: '28px', height: '28px' }}
              onClick={onRecheckConnection}
              disabled={checking}
              title="Ping Supabase"
            >
              <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="card-value" style={{ fontSize: '1.25rem', color: isConnected ? 'var(--accent-green)' : '#f43f5e' }}>
            {isConnected ? 'ONLINE & READY' : 'AUTH PENDING'}
          </div>
          <div className="card-subtext">
            <Activity size={13} />
            {latency ? `Ping Latency: ${latency}ms` : 'Awaiting credentials'}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-box blue">
                <Shield size={18} />
              </div>
              <span className="card-title">Supabase Project Ref</span>
            </div>
          </div>
          <div className="card-value" style={{ fontSize: '1.25rem' }}>
            txyysjpubwljltvhiksx
          </div>
          <div className="card-subtext">
            <span>Region: Supabase Cloud (PostgreSQL 15+)</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-box purple">
                <Zap size={18} />
              </div>
              <span className="card-title">Automations</span>
            </div>
          </div>
          <div className="card-value">
            {automationsCount}
          </div>
          <div className="card-subtext">
            <span>Workflows & Event Listeners</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-box amber">
                <Terminal size={18} />
              </div>
              <span className="card-title">REST API v1</span>
            </div>
          </div>
          <div className="card-value" style={{ fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            /rest/v1/
          </div>
          <div className="card-subtext">
            <span>PostgREST OpenAPI Enabled</span>
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Explore Capabilities</span>
        </h3>

        <div className="cards-grid">
          <div 
            className="card" 
            style={{ cursor: 'pointer', border: '1px solid rgba(62, 207, 142, 0.2)' }}
            onClick={() => setActiveTab('tables')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="card-icon-box green">
                <Table size={20} />
              </div>
              <ArrowRight size={18} color="var(--text-muted)" />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: '#ffffff' }}>Table Data Explorer</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Browse rows, insert new documents, edit records, and test real-time reads and writes from your Supabase tables.
            </p>
          </div>

          <div 
            className="card" 
            style={{ cursor: 'pointer', border: '1px solid rgba(168, 85, 247, 0.2)' }}
            onClick={() => setActiveTab('automations')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="card-icon-box purple">
                <Zap size={20} />
              </div>
              <ArrowRight size={18} color="var(--text-muted)" />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: '#ffffff' }}>Smart Automations</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Set up reactive database workflows: automatic alerts, webhook dispatchers, database cleanup schedules, and event hooks.
            </p>
          </div>

          <div 
            className="card" 
            style={{ cursor: 'pointer', border: '1px solid rgba(56, 189, 248, 0.2)' }}
            onClick={() => setActiveTab('api')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="card-icon-box blue">
                <Terminal size={20} />
              </div>
              <ArrowRight size={18} color="var(--text-muted)" />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: '#ffffff' }}>REST API Playground</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Run live HTTP GET, POST, PATCH requests directly to your PostgREST endpoint with custom headers and payload testing.
            </p>
          </div>

          <div 
            className="card" 
            style={{ cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.2)' }}
            onClick={() => setActiveTab('sql')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="card-icon-box amber">
                <Database size={20} />
              </div>
              <ArrowRight size={18} color="var(--text-muted)" />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: '#ffffff' }}>SQL Schema Starters</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Ready-to-run SQL templates for creating tables, triggers, and Row Level Security (RLS) policies in the Supabase SQL editor.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Architecture Info */}
      <div className="card" style={{ marginTop: '1.75rem', background: 'rgba(14, 19, 27, 0.5)' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} color="var(--accent-green)" />
          How Smart Automation connects to your Database
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>1. Client Authentication</strong>
            Uses your project API key (anon or service_role) transmitted via standard <code>apikey</code> and <code>Authorization: Bearer</code> headers.
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>2. PostgREST Endpoint</strong>
            Auto-translates table and schema operations directly to PostgreSQL queries via <code>{config.url}/rest/v1/</code>.
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>3. Reactive Workflows</strong>
            Automations monitor records, handle triggers, and sync external systems with your database tables.
          </div>
        </div>
      </div>
    </div>
  );
}
