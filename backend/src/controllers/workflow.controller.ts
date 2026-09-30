import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { generateWorkflowStructure, executeAiTransformation } from '../services/gemini.service.js';
import { db } from '../services/supabase.service.js';

// Master Prompt Section 16: Zod Schemas
export const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['trigger', 'condition', 'ai_transform', 'action']),
  label: z.string().min(1),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  config: z.record(z.any()),
});

export const CreateWorkflowSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  domain: z.string().default('General Automation'),
  isActive: z.boolean().default(false),
  definition: z.object({
    nodes: z.array(WorkflowNodeSchema),
    edges: z.array(z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
    })).optional(),
  }),
});

export const GeneratePromptSchema = z.object({
  prompt: z.string().min(5, 'Prompt must be at least 5 characters'),
  domain: z.string().optional(),
});

export async function generateWorkflow(req: AuthenticatedRequest, res: Response) {
  try {
    const { prompt, domain } = GeneratePromptSchema.parse(req.body);
    const generated = await generateWorkflowStructure(prompt, domain);
    return res.json({
      success: true,
      data: generated,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    return res.status(500).json({ error: 'Failed to generate workflow with AI', details: err.message });
  }
}

export async function listWorkflows(req: AuthenticatedRequest, res: Response) {
  try {
    const workflows = await db.getWorkflows(req.user?.id);
    return res.json({ success: true, data: workflows });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch workflows', details: err.message });
  }
}

export async function getWorkflow(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const workflow = await db.getWorkflowById(id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    return res.json({ success: true, data: workflow });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch workflow', details: err.message });
  }
}

export async function createWorkflow(req: AuthenticatedRequest, res: Response) {
  try {
    const validated = CreateWorkflowSchema.parse(req.body);
    const created = await db.createWorkflow({
      ...validated,
      is_active: validated.isActive,
      user_id: req.user?.id,
    });
    return res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    return res.status(500).json({ error: 'Failed to create workflow', details: err.message });
  }
}

export async function updateWorkflow(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const updated = await db.updateWorkflow(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Workflow not found or update failed' });
    }
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update workflow', details: err.message });
  }
}

export async function deleteWorkflow(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await db.deleteWorkflow(id);
    return res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete workflow', details: err.message });
  }
}

export async function executeWorkflow(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const inputPayload = req.body.payload || {
    sampleData: true,
    triggeredAt: new Date().toISOString(),
    event: 'manual_test_dispatch',
  };

  const startTime = performance.now();
  const stepTelemetry: any[] = [];
  let currentPayload = { ...inputPayload };
  let status: 'success' | 'failed' = 'success';
  let errorMessage: string | null = null;

  try {
    const workflow = await db.getWorkflowById(id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found for execution' });
    }

    const nodes = workflow.definition?.nodes || [];

    for (const node of nodes) {
      const stepStart = performance.now();
      try {
        if (node.type === 'trigger') {
          stepTelemetry.push({
            nodeId: node.id,
            step: node.label,
            type: 'trigger',
            status: 'success',
            duration_ms: Math.max(1, Math.round(performance.now() - stepStart)),
            output: currentPayload,
          });
        } else if (node.type === 'ai_transform') {
          const aiResult = await executeAiTransformation(
            node.config?.instruction || 'Process and summarize input parameters',
            currentPayload
          );
          currentPayload = { ...currentPayload, ...aiResult };
          stepTelemetry.push({
            nodeId: node.id,
            step: node.label,
            type: 'ai_transform',
            status: 'success',
            duration_ms: Math.max(1, Math.round(performance.now() - stepStart)),
            output: aiResult,
          });
        } else if (node.type === 'condition') {
          const field = node.config?.field || 'status';
          const operator = node.config?.operator || 'equals';
          const targetVal = node.config?.value;

          let passed = true;
          if (operator === 'equals' && targetVal !== undefined) {
            passed = String(currentPayload[field] || '').toLowerCase() === String(targetVal).toLowerCase();
          } else if (operator === 'gte' && targetVal !== undefined) {
            passed = Number(currentPayload[field] || 0) >= Number(targetVal);
          }

          stepTelemetry.push({
            nodeId: node.id,
            step: node.label,
            type: 'condition',
            status: 'success',
            duration_ms: Math.max(1, Math.round(performance.now() - stepStart)),
            output: { conditionPassed: passed, evaluatedField: field },
          });

          if (!passed) {
            currentPayload.branchTerminated = true;
            break;
          }
        } else if (node.type === 'action') {
          stepTelemetry.push({
            nodeId: node.id,
            step: node.label,
            type: 'action',
            status: 'success',
            duration_ms: Math.max(1, Math.round(performance.now() - stepStart)),
            output: { actionExecuted: true, target: node.config?.target || 'webhook_relay' },
          });
        }
      } catch (stepErr: any) {
        status = 'failed';
        errorMessage = `Node "${node.label}" failed: ${stepErr.message}`;
        stepTelemetry.push({
          nodeId: node.id,
          step: node.label,
          type: node.type,
          status: 'failed',
          duration_ms: Math.max(1, Math.round(performance.now() - stepStart)),
          error: stepErr.message,
        });
        break;
      }
    }

    const duration_ms = Math.round(performance.now() - startTime);

    const logEntry = await db.createExecutionLog({
      workflow_id: id,
      status,
      trigger_type: req.body.trigger_type || 'manual',
      input_payload: inputPayload,
      output_payload: currentPayload,
      step_telemetry: stepTelemetry,
      error_message: errorMessage,
      duration_ms,
    });

    return res.json({
      success: status === 'success',
      executionId: logEntry.id,
      status,
      duration_ms,
      telemetry: stepTelemetry,
      output: currentPayload,
      error: errorMessage,
    });
  } catch (err: any) {
    const duration_ms = Math.round(performance.now() - startTime);
    return res.status(500).json({
      success: false,
      status: 'failed',
      duration_ms,
      error: err.message,
    });
  }
}
