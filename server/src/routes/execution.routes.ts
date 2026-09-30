import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { listExecutions, diagnoseExecution } from '../controllers/execution.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listExecutions);
router.post('/:id/diagnose', diagnoseExecution);

export default router;
