import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { db } from '../services/supabase.service.js';
import { diagnoseExecutionError } from '../services/gemini.service.js';

export async function listExecutions(req: AuthenticatedRequest, res: Response) {
  try {
    const { workflowId } = req.query;
    const logs = await db.getExecutionLogs(workflowId as string | undefined);
    return res.json({ success: true, data: logs });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch execution logs', details: err.message });
  }
}

export async function diagnoseExecution(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const logs = await db.getExecutionLogs();
    const targetLog = logs.find((l: any) => l.id === id);

    if (!targetLog) {
      return res.status(404).json({ error: 'Execution log not found' });
    }

    const workflow = await db.getWorkflowById(targetLog.workflow_id);
    const failedStep = (targetLog.step_telemetry || []).find((s: any) => s.status === 'failed')?.step || 'Execution Step';

    const diagnostic = await diagnoseExecutionError(
      workflow?.title || 'Automation Workflow',
      failedStep,
      targetLog.error_message || 'Unknown runtime error occurred',
      targetLog.input_payload || {}
    );

    return res.json({
      success: true,
      executionId: id,
      diagnostic,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'AI Diagnostic analysis failed', details: err.message });
  }
}
