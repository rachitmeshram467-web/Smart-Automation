import React, { useState } from 'react';
import { Terminal, Send, Copy, Check, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ApiConsoleTab({ config, isConnected, onOpenConfig }) {
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('');
  const [queryParams, setQueryParams] = useState('');
  const [requestBody, setRequestBody] = useState('{\n  \n}');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const baseUrl = config.url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '') + '/rest/v1/';
  const fullUrl = `${baseUrl}${path}${queryParams ? (queryParams.startsWith('?') ? queryParams : `?${queryParams}`) : ''}`;

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    const startTime = performance.now();

    try {
      const headers = {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      };

      const options = {
        method,
        headers,
      };

      if (['POST', 'PATCH', 'PUT'].includes(method) && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(fullUrl, options);
      const latency = Math.round(performance.now() - startTime);

      let data = null;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      const resHeaders = {};
      res.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        latency,
        data,
        headers: resHeaders,
      });
    } catch (err) {
      const latency = Math.round(performance.now() - startTime);
      setResponse({
        status: 0,
        statusText: 'Network Error',
        ok: false,
        latency,
        data: { error: err.message },
        headers: {},
      });
    } finally {
      setLoading(false);
    }
  };

  const copyAsCurl = () => {
    const curl = `curl -X ${method} "${fullUrl}" \\\n  -H "apikey: ${config.anonKey || 'YOUR_KEY'}" \\\n  -H "Authorization: Bearer ${config.anonKey || 'YOUR_KEY'}" \\\n  -H "Content-Type: application/json"${['POST', 'PATCH', 'PUT'].includes(method) ? ` \\\n  -d '${requestBody.replace(/\n/g, '')}'` : ''}`;
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Terminal size={22} className="card-icon-box amber" style={{ display: 'inline-flex' }} />
            PostgREST API Playground
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Direct REST testing against endpoint <code>{baseUrl}</code>
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={copyAsCurl}>
          {copiedCurl ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
          {copiedCurl ? 'Copied curl' : 'Copy as cURL'}
        </button>
      </div>

      {!isConnected && (
        <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <div>
            Requests require an API key to pass authentication.
            <button
              onClick={onOpenConfig}
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: '0.75rem', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              Add API Key
            </button>
          </div>
        </div>
      )}

      {/* Request Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="input-field"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ width: '100px', fontWeight: 600, color: 'var(--accent-green)' }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>

          <div style={{ flex: 1, minWidth: '280px', display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ padding: '0.55rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
              {baseUrl}
            </span>
            <input
              type="text"
              className="input-field mono"
              style={{ border: 'none', background: 'transparent', paddingLeft: 0 }}
              placeholder="table_name (leave blank for root schema)"
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={handleSend} disabled={loading}>
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
            Send Request
          </button>
        </div>

        {/* Quick query presets */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
          <button
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            onClick={() => { setPath(''); setQueryParams(''); setMethod('GET'); }}
          >
            / (Root OpenAPI Specs)
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            onClick={() => { setPath('automations'); setQueryParams('select=*&limit=10'); setMethod('GET'); }}
          >
            automations?select=*
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            onClick={() => { setPath('tasks'); setQueryParams('select=*&limit=5'); setMethod('GET'); }}
          >
            tasks?select=*
          </button>
        </div>

        {['POST', 'PATCH'].includes(method) && (
          <div style={{ marginTop: '1rem' }}>
            <label className="form-label">Request Body (JSON)</label>
            <textarea
              className="input-field mono"
              rows={4}
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Response Viewer */}
      {response && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                className="brand-badge"
                style={{
                  background: response.ok ? 'rgba(62, 207, 142, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  color: response.ok ? 'var(--accent-green)' : '#f43f5e',
                  borderColor: response.ok ? 'rgba(62, 207, 142, 0.3)' : 'rgba(244, 63, 94, 0.3)',
                  fontSize: '0.8rem',
                  padding: '4px 10px',
                }}
              >
                HTTP {response.status} {response.statusText}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Response Time: <strong style={{ color: '#fff' }}>{response.latency}ms</strong>
              </span>
            </div>

            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              {response.headers['content-type'] || 'application/json'}
            </div>
          </div>

          <div className="code-box" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <pre>{JSON.stringify(response.data, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
