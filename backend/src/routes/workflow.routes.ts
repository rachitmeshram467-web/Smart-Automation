import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  generateWorkflow,
  listWorkflows,
  createWorkflow,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
} from '../controllers/workflow.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/generate', generateWorkflow);
router.get('/', listWorkflows);
router.post('/', createWorkflow);
router.get('/:id', getWorkflow);
router.put('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);
router.post('/:id/execute', executeWorkflow);

export default router;
