import React, { useState } from 'react';
import { FileCode, Copy, Check, ExternalLink, ShieldAlert } from 'lucide-react';

const SQL_TEMPLATES = [
  {
    title: '1. Complete "Smart Automation" Suite (automations, tasks, logs)',
    description: 'Creates core automation tables with UUID primary keys and permissive RLS policies for testing with anon API key.',
    sql: `-- 1. Create Automations Table
create table if not exists public.automations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  trigger text not null,
  action text not null,
  status text default 'active',
  target text default 'tasks',
  runs_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Tasks Table
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  status text default 'pending',
  priority text default 'normal',
  payload jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Logs Table
create table if not exists public.logs (
  id uuid default gen_random_uuid() primary key,
  event text not null,
  target_table text,
  executed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS) & Policies
alter table public.automations enable row level security;
create policy "Allow anon access to automations" on public.automations for all using (true) with check (true);

alter table public.tasks enable row level security;
create policy "Allow anon access to tasks" on public.tasks for all using (true) with check (true);

alter table public.logs enable row level security;
create policy "Allow anon access to logs" on public.logs for all using (true) with check (true);

-- Insert sample data
insert into public.tasks (title, status, priority) values
  ('Initial database sync', 'completed', 'high'),
  ('Configure webhook listener', 'pending', 'normal');
`
  },
  {
    title: '2. Fix "Row Level Security (RLS)" Access Errors',
    description: 'Run this if your queries return 401 or empty array due to Postgres RLS policies.',
    sql: `-- Grant public / anon access for rapid development & testing
alter table public.automations enable row level security;
create policy "Enable full access for anon" on public.automations for all using (true) with check (true);
`
  }
];

export default function SqlSchemaTab() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copySql = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <FileCode size={22} className="card-icon-box amber" style={{ display: 'inline-flex' }} />
            SQL Schema Starters
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Copy and paste these SQL scripts directly into your Supabase SQL Editor.
          </p>
        </div>

        <a
          href="https://supabase.com/dashboard/project/txyysjpubwljltvhiksx/sql/new"
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary btn-sm"
        >
          <span>Open Supabase SQL Editor</span>
          <ExternalLink size={14} />
        </a>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {SQL_TEMPLATES.map((item, idx) => (
          <div key={idx} className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#ffffff' }}>{item.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {item.description}
                </p>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copySql(item.sql, idx)}
              >
                {copiedIndex === idx ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
                {copiedIndex === idx ? 'Copied to Clipboard' : 'Copy SQL'}
              </button>
            </div>

            <div className="code-box" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <pre>{item.sql}</pre>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <ShieldAlert size={20} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            <strong style={{ color: '#fef3c7', display: 'block', marginBottom: '2px' }}>
              Row Level Security (RLS) Tip:
            </strong>
            By default, Supabase enables RLS which restricts anonymous read/write queries unless a policy is explicitly defined. Running the SQL snippet above adds the necessary <code>create policy</code> rule for your anon key.
          </div>
        </div>
      </div>
    </div>
  );
}
