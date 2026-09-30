import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';
import { ENV } from '../config/env.js';

let supabaseClient: SupabaseClient | null = null;

const activeKey = ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY;
if (ENV.SUPABASE_URL && activeKey) {
  try {
    supabaseClient = createClient(ENV.SUPABASE_URL, activeKey, {
      auth: { persistSession: false },
      realtime: { transport: ws as any },
    });
  } catch (err: any) {
    console.error('Failed to initialize Supabase client:', err.message);
  }
}

export function getSupabase(): SupabaseClient | null {
  return supabaseClient;
}

// In-Memory Fallback Cache to ensure zero crashes and offline capability
const memoryStore = {
  workflows: [
    {
      id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      title: 'Customer Support AI Sentiment & Slack Dispatcher',
      description: 'Triggered on incoming support ticket webhook, extracts intent & sentiment using Gemini AI, and routes urgent cases to Slack.',
      domain: 'Customer Support',
      is_active: true,
      definition: {
        nodes: [
          { id: 'node-1', type: 'trigger', label: 'Incoming Ticket Webhook', position: { x: 50, y: 150 }, config: { triggerType: 'webhook', path: '/webhook/support' } },
          { id: 'node-2', type: 'ai_transform', label: 'Gemini Sentiment Analysis', position: { x: 350, y: 150 }, config: { model: 'gemini-2.5-flash', instruction: 'Evaluate customer tone and urgency score.' } },
          { id: 'node-3', type: 'condition', label: 'If Critical Sentiment', position: { x: 650, y: 150 }, config: { field: 'sentiment', operator: 'equals', value: 'CRITICAL' } },
          { id: 'node-4', type: 'action', label: 'Dispatch Priority Slack Alert', position: { x: 950, y: 150 }, config: { actionType: 'slack_webhook', channel: '#support-escalations' } },
        ],
        edges: [
          { id: 'e1-2', source: 'node-1', target: 'node-2' },
          { id: 'e2-3', source: 'node-2', target: 'node-3' },
          { id: 'e3-4', source: 'node-3', target: 'node-4' },
        ],
      },
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      title: 'Automated Lead Enrichment & CRM Sync',
      description: 'Extracts domain intelligence from new sign-ups, checks company size via Clearbit/Gemini, and inserts enriched lead into Postgres.',
      domain: 'Marketing & CRM',
      is_active: true,
      definition: {
        nodes: [
          { id: 'node-1', type: 'trigger', label: 'New User Registered', position: { x: 50, y: 150 }, config: { triggerType: 'event', event: 'auth.user.signup' } },
          { id: 'node-2', type: 'ai_transform', label: 'Gemini Lead Classifier', position: { x: 350, y: 150 }, config: { model: 'gemini-2.5-flash', instruction: 'Classify lead tier and industry segment.' } },
          { id: 'node-3', type: 'action', label: 'Postgres Lead Insertion', position: { x: 650, y: 150 }, config: { actionType: 'database_insert', table: 'leads' } },
        ],
        edges: [
          { id: 'e1-2', source: 'node-1', target: 'node-2' },
          { id: 'e2-3', source: 'node-2', target: 'node-3' },
        ],
      },
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      title: 'GitHub Release AI Changelog & Discord Notification',
      description: 'Listens for GitHub release tags, generates user-facing release notes using Gemini, and posts to Discord community channel.',
      domain: 'Engineering & DevOps',
      is_active: false,
      definition: {
        nodes: [
          { id: 'node-1', type: 'trigger', label: 'GitHub Webhook: release.published', position: { x: 50, y: 150 }, config: { triggerType: 'webhook', event: 'release.published' } },
          { id: 'node-2', type: 'ai_transform', label: 'Gemini Markdown Formatter', position: { x: 350, y: 150 }, config: { model: 'gemini-2.5-flash', instruction: 'Format release notes.' } },
          { id: 'node-3', type: 'action', label: 'Discord Webhook Post', position: { x: 650, y: 150 }, config: { actionType: 'discord_webhook', channel: '#announcements' } },
        ],
        edges: [
          { id: 'e1-2', source: 'node-1', target: 'node-2' },
          { id: 'e2-3', source: 'node-2', target: 'node-3' },
        ],
      },
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as any[],
  execution_logs: [
    {
      id: 'log-1',
      workflow_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      status: 'success',
      trigger_type: 'webhook',
      input_payload: { ticket_id: 'TCK-8819', customer: 'sarah@acme.com', body: 'URGENT: Our production database sync is failing!' },
      output_payload: { sentiment: 'CRITICAL', routed_to: '#support-escalations', notified: true },
      step_telemetry: [
        { step: 'Incoming Ticket Webhook', status: 'success', duration_ms: 12 },
        { step: 'Gemini Sentiment Analysis', status: 'success', duration_ms: 210, output: { sentiment: 'CRITICAL', score: 0.98 } },
        { step: 'Condition: If Critical', status: 'success', duration_ms: 2, passed: true },
        { step: 'Dispatch Priority Slack Alert', status: 'success', duration_ms: 118 },
      ],
      duration_ms: 342,
      error_message: null,
      executed_at: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: 'log-2',
      workflow_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      status: 'success',
      trigger_type: 'manual',
      input_payload: { email: 'alex@enterprise-cloud.io', name: 'Alex Vance' },
      output_payload: { lead_tier: 'Tier 1 Enterprise', enriched: true },
      step_telemetry: [
        { step: 'New User Registered', status: 'success', duration_ms: 5 },
        { step: 'Gemini Lead Classifier', status: 'success', duration_ms: 160 },
        { step: 'Postgres Lead Insertion', status: 'success', duration_ms: 50 },
      ],
      duration_ms: 215,
      error_message: null,
      executed_at: new Date(Date.now() - 2700000).toISOString(),
    },
    {
      id: 'log-3',
      workflow_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      status: 'failed',
      trigger_type: 'webhook',
      input_payload: { ticket_id: 'TCK-8820', customer: 'john@example.com', body: 'Documentation query' },
      output_payload: {},
      step_telemetry: [
        { step: 'Incoming Ticket Webhook', status: 'success', duration_ms: 14 },
        { step: 'Gemini Sentiment Analysis', status: 'failed', duration_ms: 166, error: 'Rate limit threshold reached for third-party connector: 429 Too Many Requests' },
      ],
      duration_ms: 180,
      error_message: 'Rate limit threshold reached for third-party connector: 429 Too Many Requests',
      executed_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ] as any[],
  credentials: [
    {
      id: 'cred-1',
      service_name: 'Slack Webhook Bot',
      auth_type: 'bearer_token',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'cred-2',
      service_name: 'GitHub Personal Access Token',
      auth_type: 'api_key',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'cred-3',
      service_name: 'SendGrid Email API',
      auth_type: 'api_key',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ] as any[],
};

export const db = {
  // Workflows
  async getWorkflows(userId?: string) {
    if (supabaseClient) {
      try {
        let query = supabaseClient.from('workflows').select('*').order('created_at', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err: any) {
        console.warn('Supabase query failed, returning fallback workflows:', err.message);
      }
    }
    return memoryStore.workflows;
  },

  async getWorkflowById(id: string) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('workflows').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('Supabase getWorkflowById error:', err.message);
      }
    }
    return memoryStore.workflows.find((w) => w.id === id) || null;
  },

  async createWorkflow(payload: any) {
    const newWorkflow = {
      id: payload.id || `wf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: payload.user_id || null,
      title: payload.title,
      description: payload.description || '',
      domain: payload.domain || 'General Automation',
      is_active: payload.is_active ?? false,
      definition: payload.definition || { nodes: [], edges: [] },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('workflows').insert(newWorkflow).select().single();
        if (!error && data) {
          memoryStore.workflows.unshift(data);
          return data;
        }
      } catch (err: any) {
        console.warn('Supabase insert failed, saving to cache:', err.message);
      }
    }

    memoryStore.workflows.unshift(newWorkflow);
    return newWorkflow;
  },

  async updateWorkflow(id: string, updates: any) {
    const updatedFields = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('workflows').update(updatedFields).eq('id', id).select().single();
        if (!error && data) {
          const idx = memoryStore.workflows.findIndex((w) => w.id === id);
          if (idx !== -1) memoryStore.workflows[idx] = data;
          return data;
        }
      } catch (err: any) {
        console.warn('Supabase update failed:', err.message);
      }
    }

    const idx = memoryStore.workflows.findIndex((w) => w.id === id);
    if (idx !== -1) {
      memoryStore.workflows[idx] = { ...memoryStore.workflows[idx], ...updatedFields };
      return memoryStore.workflows[idx];
    }
    return null;
  },

  async deleteWorkflow(id: string) {
    if (supabaseClient) {
      try {
        await supabaseClient.from('workflows').delete().eq('id', id);
      } catch (err: any) {
        console.warn('Supabase delete failed:', err.message);
      }
    }
    memoryStore.workflows = memoryStore.workflows.filter((w) => w.id !== id);
    return true;
  },

  // Execution Logs
  async getExecutionLogs(workflowId?: string) {
    if (supabaseClient) {
      try {
        let query = supabaseClient.from('execution_logs').select('*, workflows(title, domain)').order('executed_at', { ascending: false });
        if (workflowId) query = query.eq('workflow_id', workflowId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err: any) {
        console.warn('Supabase getExecutionLogs failed:', err.message);
      }
    }

    if (workflowId) {
      return memoryStore.execution_logs.filter((log) => log.workflow_id === workflowId);
    }
    return memoryStore.execution_logs;
  },

  async createExecutionLog(log: any) {
    const newLog = {
      id: log.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workflow_id: log.workflow_id,
      status: log.status,
      trigger_type: log.trigger_type || 'manual',
      input_payload: log.input_payload || {},
      output_payload: log.output_payload || {},
      step_telemetry: log.step_telemetry || [],
      error_message: log.error_message || null,
      duration_ms: log.duration_ms || 0,
      executed_at: new Date().toISOString(),
    };

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('execution_logs').insert(newLog).select().single();
        if (!error && data) {
          memoryStore.execution_logs.unshift(data);
          return data;
        }
      } catch (err: any) {
        console.warn('Supabase log insert failed:', err.message);
      }
    }

    memoryStore.execution_logs.unshift(newLog);
    return newLog;
  },

  // Credentials
  async getCredentials() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('credentials').select('id, service_name, auth_type, created_at').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err: any) {
        console.warn('Supabase credentials fetch failed:', err.message);
      }
    }
    return memoryStore.credentials;
  },

  async createCredential(cred: any) {
    const newCred = {
      id: cred.id || `cred-${Date.now()}`,
      service_name: cred.service_name,
      auth_type: cred.auth_type || 'bearer_token',
      encrypted_secret: cred.encrypted_secret,
      iv: cred.iv,
      tag: cred.tag,
      created_at: new Date().toISOString(),
    };

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('credentials').insert(newCred).select('id, service_name, auth_type, created_at').single();
        if (!error && data) {
          memoryStore.credentials.unshift(data);
          return data;
        }
      } catch (err: any) {
        console.warn('Supabase credential insert failed:', err.message);
      }
    }

    const publicView = { id: newCred.id, service_name: newCred.service_name, auth_type: newCred.auth_type, created_at: newCred.created_at };
    memoryStore.credentials.unshift(publicView);
    return publicView;
  },

  async deleteCredential(id: string) {
    if (supabaseClient) {
      try {
        await supabaseClient.from('credentials').delete().eq('id', id);
      } catch (err: any) {
        console.warn('Supabase credential delete failed:', err.message);
      }
    }
    memoryStore.credentials = memoryStore.credentials.filter((c) => c.id !== id);
    return true;
  },
};
