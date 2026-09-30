import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env.js';

let aiClient: GoogleGenAI | null = null;

if (ENV.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
  } catch (err: any) {
    console.error('Failed to initialize GoogleGenAI client:', err.message);
  }
}

export interface GeneratedNode {
  id: string;
  type: 'trigger' | 'condition' | 'ai_transform' | 'action';
  label: string;
  position?: { x: number; y: number };
  config: Record<string, any>;
}

export interface GeneratedWorkflow {
  title: string;
  description: string;
  domain: string;
  nodes: GeneratedNode[];
  edges: Array<{ id: string; source: string; target: string }>;
}

async function callGemini(contents: string, systemInstruction?: string) {
  if (!aiClient) throw new Error('Gemini AI client not initialized');

  const models = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await aiClient.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: systemInstruction || "You are Smart Automation Architect AI. Return valid JSON matching the schema.",
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });
      return response;
    } catch (err: any) {
      lastError = err;
      if (err.message?.includes('not found') || err.message?.includes('no longer available')) {
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function generateWorkflowStructure(userPrompt: string, domainHint?: string): Promise<GeneratedWorkflow> {
  if (aiClient && ENV.GEMINI_API_KEY) {
    try {
      const prompt = `
Task: Transform this user automation goal into a complete, executable workflow graph.
User Objective: "${userPrompt}"
Domain Category: "${domainHint || 'General Automation'}"

Rules:
1. Generate an array of nodes containing:
   - At least 1 "trigger" node (e.g., webhook, schedule, event, manual).
   - Relevant "ai_transform" nodes (e.g. sentiment classification, entity extraction, summarization, text formatting).
   - "condition" nodes if decision logic is appropriate (e.g., if sentiment is critical, if amount > threshold).
   - At least 1 "action" node (e.g., database insert, webhook dispatch, slack notification, email send).
2. Connect them sequentially with edges.
3. Return ONLY valid JSON adhering strictly to this schema:
{
  "title": "Concise workflow name",
  "description": "Comprehensive explanation of what this automation executes",
  "domain": "Target domain (Marketing & CRM, Engineering & DevOps, Customer Support, or Data Operations)",
  "nodes": [
    {
      "id": "node-1",
      "type": "trigger",
      "label": "Human readable label",
      "config": { "triggerType": "webhook", "endpoint": "/webhook/path" }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "node-1", "target": "node-2" }
  ]
}
`;

      const response = await callGemini(
        prompt,
        "You are Smart Automation Architect AI, an elite autonomous workflow systems engineer. Return ONLY valid JSON matching the exact schema requested."
      );

      const parsed: GeneratedWorkflow = JSON.parse(response.text || '{}');
      return enrichWorkflowWithLayout(parsed);
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to heuristic workflow synthesis:', err.message);
    }
  }

  // Heuristic Rule-Based Generation when GEMINI_API_KEY is pending or unavailable
  return generateHeuristicWorkflow(userPrompt, domainHint);
}

export async function diagnoseExecutionError(
  workflowTitle: string,
  failedStep: string,
  errorMessage: string,
  inputPayload: any
) {
  if (aiClient && ENV.GEMINI_API_KEY) {
    try {
      const prompt = `
Analyze this failed automation step:
Workflow: "${workflowTitle}"
Failed Step: "${failedStep}"
Error Message: "${errorMessage}"
Input Payload: ${JSON.stringify(inputPayload, null, 2)}

Provide a diagnostic report as JSON:
{
  "rootCause": "Clear explanation of why this step failed",
  "suggestedFix": "Concrete action required to resolve this issue",
  "recommendedConfig": { "retryCount": 3, "timeoutMs": 5000 },
  "confidenceScore": 0.95
}
`;

      const response = await callGemini(prompt);
      return JSON.parse(response.text || '{}');
    } catch (err: any) {
      console.warn('Gemini diagnostic call failed:', err.message);
    }
  }

  return {
    rootCause: `Execution error in step "${failedStep}": ${errorMessage}. Likely caused by upstream payload schema divergence, rate limits, or network timeout.`,
    suggestedFix: "Verify endpoint URL accessibility, check API authentication credentials, and ensure input JSON schema matches expected parameters.",
    recommendedConfig: { retryCount: 3, timeoutMs: 5000 },
    confidenceScore: 0.88,
  };
}

export async function executeAiTransformation(instruction: string, inputData: any) {
  if (aiClient && ENV.GEMINI_API_KEY) {
    try {
      const prompt = `
Instruction: ${instruction}
Input Data: ${JSON.stringify(inputData, null, 2)}
Respond with the transformed output in JSON format.
`;
      const response = await callGemini(prompt);
      return JSON.parse(response.text || '{}');
    } catch (err: any) {
      console.warn('AI transformation failed, using mock transform:', err.message);
    }
  }

  // Fallback transformer
  return {
    transformed: true,
    instructionApplied: instruction,
    summary: typeof inputData === 'object' ? `Processed ${Object.keys(inputData).length} input attributes` : String(inputData),
    sentiment: 'POSITIVE',
    extractedEntities: ['AutoGenerated', 'SmartPipeline'],
    timestamp: new Date().toISOString(),
  };
}

function enrichWorkflowWithLayout(wf: GeneratedWorkflow): GeneratedWorkflow {
  const nodes = (wf.nodes || []).map((node, idx) => ({
    ...node,
    position: node.position || { x: 100 + (idx % 3) * 280, y: 100 + Math.floor(idx / 3) * 160 },
  }));

  const edges = wf.edges && wf.edges.length > 0
    ? wf.edges
    : nodes.slice(0, -1).map((node, i) => ({
        id: `e-${node.id}-${nodes[i + 1].id}`,
        source: node.id,
        target: nodes[i + 1].id,
      }));

  return {
    ...wf,
    nodes,
    edges,
  };
}

function generateHeuristicWorkflow(prompt: string, domainHint?: string): GeneratedWorkflow {
  const lower = prompt.toLowerCase();
  let domain = domainHint || 'General Automation';
  let title = 'Intelligent Event Pipeline';
  let description = `Autonomous multi-step pipeline synthesized from user requirement: "${prompt}"`;

  const nodes: GeneratedNode[] = [];
  const edges: Array<{ id: string; source: string; target: string }> = [];

  if (lower.includes('schedule') || lower.includes('every') || lower.includes('cron') || lower.includes('nightly')) {
    nodes.push({
      id: 'node-1',
      type: 'trigger',
      label: 'Scheduled Cron Poller',
      config: { triggerType: 'cron', interval: '0 0 * * *', expression: 'Daily midnight' },
    });
  } else if (lower.includes('github') || lower.includes('commit') || lower.includes('pr')) {
    domain = 'Engineering & DevOps';
    nodes.push({
      id: 'node-1',
      type: 'trigger',
      label: 'GitHub Webhook Listener',
      config: { triggerType: 'webhook', event: 'push_or_pr', path: '/webhook/github' },
    });
  } else {
    nodes.push({
      id: 'node-1',
      type: 'trigger',
      label: 'Inbound Webhook Receiver',
      config: { triggerType: 'webhook', path: '/webhook/inbound-event', method: 'POST' },
    });
  }

  nodes.push({
    id: 'node-2',
    type: 'ai_transform',
    label: 'Gemini 2.5 AI Reasoning & Extraction',
    config: {
      model: 'gemini-2.5-flash',
      instruction: `Parse input data, evaluate prompt objective ("${prompt}"), and extract structured entities and priority score.`,
    },
  });
  edges.push({ id: 'e1-2', source: 'node-1', target: 'node-2' });

  if (lower.includes('if') || lower.includes('filter') || lower.includes('critical') || lower.includes('urgent')) {
    nodes.push({
      id: 'node-3',
      type: 'condition',
      label: 'Condition Gate: Threshold Check',
      config: { field: 'priority_score', operator: 'gte', value: 80 },
    });
    edges.push({ id: 'e2-3', source: 'node-2', target: 'node-3' });

    nodes.push({
      id: 'node-4',
      type: 'action',
      label: lower.includes('slack') ? 'Slack Alert Dispatcher' : 'Supabase Postgres Record Upsert',
      config: {
        actionType: lower.includes('slack') ? 'slack_notification' : 'database_upsert',
        target: lower.includes('slack') ? '#alerts' : 'workflows_output',
      },
    });
    edges.push({ id: 'e3-4', source: 'node-3', target: 'node-4' });
  } else {
    nodes.push({
      id: 'node-3',
      type: 'action',
      label: 'Sync Data to Destination',
      config: { actionType: 'http_post', destination: 'https://api.external-service.com/sync' },
    });
    edges.push({ id: 'e2-3', source: 'node-2', target: 'node-3' });
  }

  if (lower.includes('ticket') || lower.includes('support') || lower.includes('customer')) {
    domain = 'Customer Support';
    title = 'Automated Support Ticket Triage';
  } else if (lower.includes('lead') || lower.includes('crm') || lower.includes('marketing')) {
    domain = 'Marketing & CRM';
    title = 'Lead Intelligence & CRM Ingestion';
  } else if (lower.includes('data') || lower.includes('csv') || lower.includes('sync')) {
    domain = 'Data Operations';
    title = 'Automated Data Pipeline & Relay';
  }

  return enrichWorkflowWithLayout({
    title,
    description,
    domain,
    nodes,
    edges,
  });
}
