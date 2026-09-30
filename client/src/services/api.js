const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('supabase_auth_token') || 'demo-token';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export const api = {
  // Health
  async getHealth() {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      return await res.json();
    } catch {
      return { status: 'offline', integrations: { supabase: { configured: false } } };
    }
  },

  // Workflows
  async generateWorkflow(prompt, domain) {
    const res = await fetch(`${BACKEND_URL}/workflows/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ prompt, domain }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate workflow');
    }
    return await res.json();
  },

  async listWorkflows() {
    const res = await fetch(`${BACKEND_URL}/workflows`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch workflows');
    return await res.json();
  },

  async getWorkflow(id) {
    const res = await fetch(`${BACKEND_URL}/workflows/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Workflow not found');
    return await res.json();
  },

  async createWorkflow(payload) {
    const res = await fetch(`${BACKEND_URL}/workflows`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create workflow');
    }
    return await res.json();
  },

  async updateWorkflow(id, updates) {
    const res = await fetch(`${BACKEND_URL}/workflows/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update workflow');
    return await res.json();
  },

  async deleteWorkflow(id) {
    const res = await fetch(`${BACKEND_URL}/workflows/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete workflow');
    return await res.json();
  },

  async executeWorkflow(id, payload, triggerType = 'manual') {
    const res = await fetch(`${BACKEND_URL}/workflows/${id}/execute`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ payload, trigger_type: triggerType }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Execution failed');
    }
    return await res.json();
  },

  // Executions & AI Diagnostics
  async listExecutions(workflowId) {
    const url = workflowId ? `${BACKEND_URL}/executions?workflowId=${workflowId}` : `${BACKEND_URL}/executions`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch execution logs');
    return await res.json();
  },

  async diagnoseExecution(logId) {
    const res = await fetch(`${BACKEND_URL}/executions/${logId}/diagnose`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to run AI diagnostic');
    return await res.json();
  },

  // Credentials Vault
  async listCredentials() {
    const res = await fetch(`${BACKEND_URL}/credentials`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch credentials');
    return await res.json();
  },

  async createCredential(serviceName, secret, authType = 'bearer_token') {
    const res = await fetch(`${BACKEND_URL}/credentials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ serviceName, secret, authType }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save credential');
    }
    return await res.json();
  },

  async deleteCredential(id) {
    const res = await fetch(`${BACKEND_URL}/credentials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete credential');
    return await res.json();
  },
};
