-- ==========================================================
-- SMART AUTOMATION PLATFORM: PRODUCTION DATABASE MIGRATION
-- Project: Supabase PostgreSQL (txyysjpubwljltvhiksx)
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'developer' CHECK (role IN ('owner', 'admin', 'developer', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Workflows Table
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    domain TEXT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE NOT NULL,
    definition JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Credentials Vault Table (Encrypted secrets with AES-256-GCM)
CREATE TABLE IF NOT EXISTS public.credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    auth_type TEXT DEFAULT 'bearer_token' CHECK (auth_type IN ('bearer_token', 'api_key', 'basic', 'oauth2')),
    encrypted_secret TEXT NOT NULL,
    iv TEXT NOT NULL,
    tag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Execution Logs Table (Immutable audit trail & telemetry)
CREATE TABLE IF NOT EXISTS public.execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'running', 'success', 'failed')) NOT NULL,
    trigger_type TEXT DEFAULT 'manual',
    input_payload JSONB DEFAULT '{}'::jsonb,
    output_payload JSONB DEFAULT '{}'::jsonb,
    step_telemetry JSONB DEFAULT '[]'::jsonb,
    error_message TEXT,
    duration_ms INTEGER DEFAULT 0,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_is_active ON public.workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_execution_logs_workflow_id ON public.execution_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_status ON public.execution_logs(status);
CREATE INDEX IF NOT EXISTS idx_execution_logs_executed_at ON public.execution_logs(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON public.credentials(user_id);

-- 7. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if updating
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon read/write profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can CRUD own workflows" ON public.workflows;
DROP POLICY IF EXISTS "Allow anon read/write workflows" ON public.workflows;

DROP POLICY IF EXISTS "Users can CRUD own credentials" ON public.credentials;
DROP POLICY IF EXISTS "Allow anon read/write credentials" ON public.credentials;

DROP POLICY IF EXISTS "Users can view execution logs of own workflows" ON public.execution_logs;
DROP POLICY IF EXISTS "Allow anon read/write execution_logs" ON public.execution_logs;

-- Authenticated User Policies (JWT Bearer Auth)
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own workflows" 
ON public.workflows FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can CRUD own credentials" 
ON public.credentials FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view execution logs of own workflows" 
ON public.execution_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.workflows 
    WHERE workflows.id = execution_logs.workflow_id 
    AND (workflows.user_id = auth.uid() OR workflows.user_id IS NULL)
  )
);

CREATE POLICY "Users can insert execution logs" 
ON public.execution_logs FOR INSERT WITH CHECK (true);

-- Permissive Anon policy for testing when authenticated without strict user_id mapping
CREATE POLICY "Allow anon read/write workflows" 
ON public.workflows FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read/write credentials" 
ON public.credentials FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read/write execution_logs" 
ON public.execution_logs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read/write profiles" 
ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 8. Auto-create Profile Trigger on auth.users Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================================
-- SEED DATA (Ready-to-use production workflows & samples)
-- ==========================================================

INSERT INTO public.workflows (id, title, description, domain, is_active, definition)
VALUES 
(
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  'Customer Support AI Sentiment & Slack Dispatcher',
  'Triggered on incoming support ticket webhook, extracts intent & sentiment using Gemini AI, and routes urgent cases to Slack.',
  'Customer Support',
  true,
  '{
    "nodes": [
      {
        "id": "node-1",
        "type": "trigger",
        "label": "Incoming Ticket Webhook",
        "config": {
          "triggerType": "webhook",
          "endpoint": "/webhook/support-ticket",
          "method": "POST"
        }
      },
      {
        "id": "node-2",
        "type": "ai_transform",
        "label": "Gemini Sentiment Analysis",
        "config": {
          "model": "gemini-2.5-flash",
          "instruction": "Analyze the ticket tone, extract root issue, and classify sentiment as POSITIVE, NEUTRAL, or CRITICAL."
        }
      },
      {
        "id": "node-3",
        "type": "condition",
        "label": "If Critical Sentiment",
        "config": {
          "field": "sentiment",
          "operator": "equals",
          "value": "CRITICAL"
        }
      },
      {
        "id": "node-4",
        "type": "action",
        "label": "Dispatch Priority Slack Alert",
        "config": {
          "actionType": "slack_webhook",
          "channel": "#support-escalations"
        }
      }
    ],
    "edges": [
      { "id": "e1-2", "source": "node-1", "target": "node-2" },
      { "id": "e2-3", "source": "node-2", "target": "node-3" },
      { "id": "e3-4", "source": "node-3", "target": "node-4" }
    ]
  }'::jsonb
),
(
  'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  'Automated Lead Enrichment & CRM Sync',
  'Extracts domain intelligence from new sign-ups, checks company size via Clearbit/Gemini, and inserts enriched lead into Postgres.',
  'Marketing & CRM',
  true,
  '{
    "nodes": [
      {
        "id": "node-1",
        "type": "trigger",
        "label": "New User Registered",
        "config": {
          "triggerType": "event",
          "event": "auth.user.signup"
        }
      },
      {
        "id": "node-2",
        "type": "ai_transform",
        "label": "Gemini Lead Classifier",
        "config": {
          "model": "gemini-2.5-flash",
          "instruction": "Parse email domain, determine industry category and estimate company scale."
        }
      },
      {
        "id": "node-3",
        "type": "action",
        "label": "Postgres Lead Insertion",
        "config": {
          "actionType": "database_insert",
          "table": "leads"
        }
      }
    ],
    "edges": [
      { "id": "e1-2", "source": "node-1", "target": "node-2" },
      { "id": "e2-3", "source": "node-2", "target": "node-3" }
    ]
  }'::jsonb
),
(
  'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
  'GitHub Release AI Changelog & Discord Notification',
  'Listens for GitHub release tags, generates user-facing release notes using Gemini, and posts to Discord community channel.',
  'Engineering & DevOps',
  false,
  '{
    "nodes": [
      {
        "id": "node-1",
        "type": "trigger",
        "label": "GitHub Webhook: release.published",
        "config": {
          "triggerType": "webhook",
          "event": "release.published"
        }
      },
      {
        "id": "node-2",
        "type": "ai_transform",
        "label": "Gemini Markdown Formatter",
        "config": {
          "model": "gemini-2.5-flash",
          "instruction": "Convert raw commit logs into clean, emoji-accented release highlights."
        }
      },
      {
        "id": "node-3",
        "type": "action",
        "label": "Discord Webhook Post",
        "config": {
          "actionType": "discord_webhook",
          "channel": "#announcements"
        }
      }
    ],
    "edges": [
      { "id": "e1-2", "source": "node-1", "target": "node-2" },
      { "id": "e2-3", "source": "node-2", "target": "node-3" }
    ]
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Seed Execution Logs
INSERT INTO public.execution_logs (workflow_id, status, trigger_type, duration_ms, input_payload, output_payload, step_telemetry, executed_at)
VALUES 
(
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  'success',
  'webhook',
  342,
  '{"ticket_id": "TCK-8819", "customer": "sarah@acme.com", "body": "URGENT: Our production database sync is failing with 500 error!"}'::jsonb,
  '{"sentiment": "CRITICAL", "routed_to": "#support-escalations", "notified": true}'::jsonb,
  '[
    {"step": "Webhook Ingestion", "status": "success", "duration_ms": 12},
    {"step": "Gemini AI Sentiment Analysis", "status": "success", "duration_ms": 210, "output": {"sentiment": "CRITICAL", "confidence": 0.98}},
    {"step": "Condition: If Critical", "status": "success", "duration_ms": 2, "passed": true},
    {"step": "Dispatch Priority Slack Alert", "status": "success", "duration_ms": 118}
  ]'::jsonb,
  NOW() - INTERVAL '15 minutes'
),
(
  'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  'success',
  'manual',
  215,
  '{"email": "alex@enterprise-cloud.io", "name": "Alex Vance"}'::jsonb,
  '{"lead_tier": "Tier 1 Enterprise", "enriched": true}'::jsonb,
  '[
    {"step": "User Signup Trigger", "status": "success", "duration_ms": 5},
    {"step": "Gemini Lead Classifier", "status": "success", "duration_ms": 160, "output": {"industry": "Cloud Infrastructure", "scale": "Enterprise"}},
    {"step": "Database Lead Insertion", "status": "success", "duration_ms": 50}
  ]'::jsonb,
  NOW() - INTERVAL '45 minutes'
),
(
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  'failed',
  'webhook',
  180,
  '{"ticket_id": "TCK-8820", "customer": "john@example.com", "body": "Where can I find documentation?"}'::jsonb,
  '{}'::jsonb,
  '[
    {"step": "Webhook Ingestion", "status": "success", "duration_ms": 14},
    {"step": "Gemini AI Sentiment Analysis", "status": "failed", "duration_ms": 166, "error": "Rate limit threshold reached for third-party connector: 429 Too Many Requests"}
  ]'::jsonb,
  NOW() - INTERVAL '2 hours'
);
