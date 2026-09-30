import { Router, Request, Response } from 'express';
import { ENV } from '../config/env.js';
import { getSupabase } from '../services/supabase.service.js';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  let supabaseStatus = 'disconnected';
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { error } = await supabase.from('workflows').select('id').limit(1);
      supabaseStatus = error ? `connected (table query note: ${error.message})` : 'connected';
    } catch (err: any) {
      supabaseStatus = `error: ${err.message}`;
    }
  }

  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smart Automation Platform Backend',
    version: '1.0.0',
    env: ENV.NODE_ENV,
    integrations: {
      supabase: {
        configured: !!(ENV.SUPABASE_URL && (ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY)),
        status: supabaseStatus,
        url: ENV.SUPABASE_URL,
      },
      geminiAi: {
        configured: !!ENV.GEMINI_API_KEY,
        model: 'gemini-2.5-flash / gemini-2.5-pro',
      },
    },
  });
});

export default router;
