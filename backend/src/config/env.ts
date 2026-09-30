import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root or workspace root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://txyysjpubwljltvhiksx.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  ENCRYPTION_SECRET_KEY: process.env.ENCRYPTION_SECRET_KEY || 'a1b2c3d4e5f678901234567890123456', // 32 bytes
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

export function validateEnv() {
  const warnings: string[] = [];
  if (!ENV.GEMINI_API_KEY) {
    warnings.push('[WARN] GEMINI_API_KEY is not set. AI workflow generation will use intelligent fallback templates until provided.');
  }
  if (!ENV.SUPABASE_ANON_KEY && !ENV.SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push('[WARN] SUPABASE_ANON_KEY / SERVICE_ROLE_KEY is not set. Data will be cached in high-performance local store.');
  }
  if (warnings.length > 0) {
    warnings.forEach((w) => console.warn(w));
  } else {
    console.log('[INFO] Environment variables loaded & verified successfully.');
  }
}
