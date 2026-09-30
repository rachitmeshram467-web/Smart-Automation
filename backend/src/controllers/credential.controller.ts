import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { db } from '../services/supabase.service.js';
import { encryptSecret } from '../services/crypto.service.js';

export const CredentialSchema = z.object({
  serviceName: z.string().min(2, 'Service name must be at least 2 characters'),
  secret: z.string().min(1, 'Secret is required'),
  authType: z.enum(['bearer_token', 'api_key', 'basic', 'oauth2']).default('bearer_token'),
});

export async function listCredentials(req: AuthenticatedRequest, res: Response) {
  try {
    const creds = await db.getCredentials();
    return res.json({ success: true, data: creds });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch credentials', details: err.message });
  }
}

export async function createCredential(req: AuthenticatedRequest, res: Response) {
  try {
    const validated = CredentialSchema.parse(req.body);
    const { encrypted, iv, tag } = encryptSecret(validated.secret);

    const created = await db.createCredential({
      service_name: validated.serviceName,
      auth_type: validated.authType,
      encrypted_secret: encrypted,
      iv,
      tag,
      user_id: req.user?.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Credential encrypted and stored securely in vault.',
      data: created,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    return res.status(500).json({ error: 'Failed to store credential', details: err.message });
  }
}

export async function deleteCredential(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await db.deleteCredential(id);
    return res.json({ success: true, message: 'Credential deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete credential', details: err.message });
  }
}
