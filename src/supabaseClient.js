import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://txyysjpubwljltvhiksx.supabase.co';
const DEFAULT_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const STORAGE_KEYS = {
  URL: 'smart_automation_supabase_url',
  ANON_KEY: 'smart_automation_supabase_anon_key',
  SAVED_TABLES: 'smart_automation_saved_tables',
  CUSTOM_WORKFLOWS: 'smart_automation_workflows',
};

// Retrieve stored or env configuration
export function getConfig() {
  const storedUrl = localStorage.getItem(STORAGE_KEYS.URL);
  const storedKey = localStorage.getItem(STORAGE_KEYS.ANON_KEY);
  
  return {
    url: storedUrl || DEFAULT_URL,
    anonKey: storedKey || DEFAULT_KEY,
    isUsingEnv: !storedKey && !!DEFAULT_KEY,
  };
}

export function saveConfig(url, anonKey) {
  if (url) localStorage.setItem(STORAGE_KEYS.URL, url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, ''));
  if (anonKey) localStorage.setItem(STORAGE_KEYS.ANON_KEY, anonKey.trim());
}

export function clearStoredConfig() {
  localStorage.removeItem(STORAGE_KEYS.URL);
  localStorage.removeItem(STORAGE_KEYS.ANON_KEY);
}

let cachedClient = null;
let lastClientKey = '';

export function getSupabaseClient() {
  const { url, anonKey } = getConfig();
  
  if (!url || !anonKey) {
    return null;
  }
  
  const cacheKey = `${url}:${anonKey}`;
  if (cachedClient && lastClientKey === cacheKey) {
    return cachedClient;
  }
  
  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastClientKey = cacheKey;
    return cachedClient;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
}

/**
 * Test connectivity against the Supabase REST API
 * Returns { success: boolean, latencyMs: number, message: string, details?: any }
 */
export async function testSupabaseConnection(overrideUrl, overrideKey) {
  const config = getConfig();
  let url = (overrideUrl || config.url || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  const key = (overrideKey !== undefined ? overrideKey : config.anonKey || '').trim();

  if (!url) {
    return {
      success: false,
      latencyMs: 0,
      status: 400,
      message: 'Supabase project URL is missing.',
    };
  }

  if (!key) {
    return {
      success: false,
      latencyMs: 0,
      status: 401,
      message: 'Anon / API key is required. Please provide your Supabase API key.',
    };
  }

  const startTime = performance.now();
  const authEndpoint = `${url}/auth/v1/settings`;

  try {
    const response = await fetch(authEndpoint, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (response.ok) {
      let authData = null;
      try {
        authData = await response.json();
      } catch {
        // fallback
      }

      return {
        success: true,
        latencyMs,
        status: response.status,
        message: `Successfully connected to Supabase (${latencyMs}ms)!`,
        authSettings: authData,
        url,
      };
    } else {
      let errorBody = '';
      try {
        const errJson = await response.json();
        errorBody = errJson.message || errJson.error || JSON.stringify(errJson);
      } catch {
        errorBody = response.statusText;
      }

      if (response.status === 401) {
        return {
          success: false,
          latencyMs,
          status: 401,
          message: 'Authentication failed (401): The provided API key is invalid or unauthorized.',
          details: errorBody,
        };
      }

      return {
        success: false,
        latencyMs,
        status: response.status,
        message: `Connection returned HTTP ${response.status}: ${errorBody || response.statusText}`,
        details: errorBody,
      };
    }
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      latencyMs,
      status: 0,
      message: `Network or CORS error connecting to ${restEndpoint}: ${err.message}`,
    };
  }
}
