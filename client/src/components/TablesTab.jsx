import React, { useState, useEffect, useCallback } from 'react';
import { Table, Plus, RefreshCw, Search, Trash2, AlertCircle, Database, Code, CheckCircle2 } from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';

const PRESET_TABLES = ['automations', 'tasks', 'devices', 'users', 'logs'];

export default function TablesTab({ isConnected, onOpenConfig, onSwitchToSql }) {
  const [selectedTable, setSelectedTable] = useState('automations');
  const [customTable, setCustomTable] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Insert row modal state
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [newRowJson, setNewRowJson] = useState('{\n  "name": "Daily Sync Routine",\n  "trigger": "scheduled",\n  "status": "active"\n}');
  const [inserting, setInserting] = useState(false);
  const [insertStatus, setInsertStatus] = useState(null);

  const activeTableName = customTable.trim() || selectedTable;

  const fetchTableData = useCallback(async () => {
    if (!isConnected) return;
    const client = getSupabaseClient();
    if (!client) {
      setError('Supabase client not initialized. Check your credentials.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: rows, error: fetchErr } = await client
        .from(activeTableName)
        .select('*')
        .limit(50);

      if (fetchErr) {
        throw fetchErr;
      }
      setData(rows || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch table records.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [isConnected, activeTableName]);

  useEffect(() => {
    if (isConnected) {
      fetchTableData();
    }
  }, [fetchTableData, isConnected]);

  const handleInsertRow = async () => {
    const client = getSupabaseClient();
    if (!client) return;

    let parsed = null;
    try {
      parsed = JSON.parse(newRowJson);
    } catch {
      setInsertStatus({ success: false, message: 'Invalid JSON format. Please verify syntax.' });
      return;
    }

    setInserting(true);
    setInsertStatus(null);
    try {
      const { data: inserted, error: insertErr } = await client
        .from(activeTableName)
        .insert(parsed)
        .select();

      if (insertErr) throw insertErr;

      setInsertStatus({ success: true, message: `Successfully inserted record into ${activeTableName}!` });
      setTimeout(() => {
        setShowInsertModal(false);
        setInsertStatus(null);
        fetchTableData();
      }, 1000);
    } catch (err) {
      setInsertStatus({ success: false, message: err.message || 'Insert operation failed.' });
    } finally {
      setInserting(false);
    }
  };

  const handleDeleteRow = async (id) => {
    if (!window.confirm(`Delete record with ID "${id}" from ${activeTableName}?`)) return;

    const client = getSupabaseClient();
    if (!client) return;

    try {
      const { error: delErr } = await client
        .from(activeTableName)
        .delete()
        .eq('id', id);

      if (delErr) throw delErr;
      setData((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Filtered rows
  const filteredData = data.filter((row) => {
    if (!searchQuery.trim()) return true;
    const str = JSON.stringify(row).toLowerCase();
    return str.includes(searchQuery.toLowerCase());
  });

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  if (!isConnected) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
        <Database size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#ffffff' }}>Connect Supabase to Explore Tables</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
          To view tables, insert records, or browse data from <code>https://txyysjpubwljltvhiksx.supabase.co</code>, connect your API key.
        </p>
        <button className="btn btn-primary" onClick={onOpenConfig}>
          Configure Connection
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Table size={22} className="card-icon-box green" style={{ display: 'inline-flex' }} />
            Table Data Explorer
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Query, inspect, and manage records stored in your Supabase database.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchTableData}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowInsertModal(true)}
          >
            <Plus size={16} />
            Insert Row
          </button>
        </div>
      </div>

      {/* Table Selector Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Active Table:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {PRESET_TABLES.map((table) => (
              <button
                key={table}
                className={`btn btn-sm ${selectedTable === table && !customTable ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setSelectedTable(table);
                  setCustomTable('');
                }}
              >
                {table}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              className="input-field mono"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}
              placeholder="Or enter custom table name..."
              value={customTable}
              onChange={(e) => setCustomTable(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTableData()}
            />
            {customTable && (
              <button className="btn btn-secondary btn-sm" onClick={fetchTableData}>
                Load
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Query Error on table "{activeTableName}":</strong> {error}
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
              Table might not exist yet or lacks Row Level Security (RLS) select policy.
              <button
                onClick={onSwitchToSql}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: '0.75rem', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              >
                View SQL Creator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table & Search Header */}
      <div className="table-container">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {activeTableName}
            </span>
            <span className="brand-badge" style={{ fontSize: '0.7rem' }}>
              {filteredData.length} records
            </span>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '2rem', padding: '0.4rem 0.75rem 0.4rem 2rem', fontSize: '0.825rem' }}
              placeholder="Search in table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Data List / Table */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
            <p>Querying Supabase database...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '0.75rem' }}>No records found in table <code>{activeTableName}</code>.</p>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowInsertModal(true)}>
              <Plus size={14} /> Insert First Row
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                  <th style={{ width: '60px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={row.id || index}>
                    {columns.map((col) => {
                      const val = row[col];
                      const displayVal = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? 'null');
                      return (
                        <td key={col} title={displayVal}>
                          {displayVal.length > 50 ? `${displayVal.substring(0, 48)}...` : displayVal}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center' }}>
                      {row.id && (
                        <button
                          className="btn-icon"
                          style={{ width: '28px', height: '28px' }}
                          title="Delete row"
                          onClick={() => handleDeleteRow(row.id)}
                        >
                          <Trash2 size={13} color="#f43f5e" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Insert Row Modal */}
      {showInsertModal && (
        <div className="modal-overlay" onClick={() => setShowInsertModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Code size={20} color="var(--accent-green)" />
                Insert Row into `{activeTableName}`
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Row Data (JSON format)</label>
              <textarea
                className="input-field mono"
                rows={8}
                value={newRowJson}
                onChange={(e) => setNewRowJson(e.target.value)}
              />
              <div className="input-helper">
                Define the keys and values matching your table schema. ID and timestamps are auto-generated if defaults are configured.
              </div>
            </div>

            {insertStatus && (
              <div className={`alert ${insertStatus.success ? 'alert-success' : 'alert-error'}`}>
                {insertStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{insertStatus.message}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowInsertModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleInsertRow} disabled={inserting}>
                {inserting ? <RefreshCw size={15} className="animate-spin" /> : <Plus size={15} />}
                Confirm Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
