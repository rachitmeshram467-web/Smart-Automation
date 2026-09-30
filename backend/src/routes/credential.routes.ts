import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { listCredentials, createCredential, deleteCredential } from '../controllers/credential.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listCredentials);
router.post('/', createCredential);
router.delete('/:id', deleteCredential);

export default router;
