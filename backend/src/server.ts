import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ENV, validateEnv } from './config/env.js';
import workflowRoutes from './routes/workflow.routes.js';
import executionRoutes from './routes/execution.routes.js';
import credentialRoutes from './routes/credential.routes.js';
import healthRoutes from './routes/health.routes.js';

validateEnv();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));
app.use(express.json({ limit: '10mb' }));

// Rate Limiter for AI Generation & Execution
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again shortly.' },
});

// Mount Routes
app.use('/api', healthRoutes);
app.use('/api/workflows/generate', aiRateLimiter);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/credentials', credentialRoutes);

// Root Welcome Endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Smart Automation Platform API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: [
      'POST /api/workflows/generate',
      'GET /api/workflows',
      'POST /api/workflows',
      'POST /api/workflows/:id/execute',
      'GET /api/executions',
      'POST /api/executions/:id/diagnose',
      'GET /api/credentials',
      'POST /api/credentials',
      'GET /api/health',
    ],
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[UNHANDLED_ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

const server = app.listen(ENV.PORT, () => {
  console.log(`[READY] Smart Automation Backend running on http://localhost:${ENV.PORT}`);
  console.log(`[READY] Connected to Supabase at: ${ENV.SUPABASE_URL}`);
});

export default app;
