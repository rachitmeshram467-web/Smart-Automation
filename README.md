# Smart Automation Platform

A production-grade, event-driven autonomous workflow and task automation platform powered by **Google Gemini AI** and **Supabase PostgreSQL**.

---

## Architecture Overview

```text
smart-automation/
├── backend/                  # Node.js + Express + TypeScript Server (Port 5000)
│   ├── src/
│   │   ├── config/           # Environment validation & configuration
│   │   ├── controllers/      # Workflow, Execution, and Credential controllers
│   │   ├── middleware/       # Supabase JWT Auth & Rate Limiting
│   │   ├── routes/           # REST endpoints (/api/workflows, /api/executions, ...)
│   │   ├── services/
│   │   │   ├── gemini.service.ts   # @google/genai SDK (gemini-2.5-flash & pro)
│   │   │   ├── supabase.service.ts # Supabase PostgreSQL & Real-time Client
│   │   │   └── crypto.service.ts   # AES-256-GCM Secret Encryption
│   │   └── server.ts         # Express server with Helmet, CORS & Security
│   ├── package.json
│   └── tsconfig.json
├── src/                      # React 19 + Vite SPA (Port 5173)
│   ├── components/
│   │   ├── canvas/           # React Flow Visual Graph Canvas & Custom Nodes
│   │   └── layout/           # Navbar, Sidebar, and Global Modals
│   ├── context/              # Supabase AuthContext & Instant Demo Session
│   ├── pages/                # Dashboard, Workflows, Editor, Executions, Vault, Settings
│   └── services/api.js       # Typed API Client
├── supabase-schema.sql       # Production PostgreSQL schema, RLS policies & Triggers
├── tailwind.config.js        # Dark green/neon custom design system
└── .env                      # Environment Variables
```

---

## Key Features

1. **Natural Language Workflow Generator**:
   - Uses `@google/genai` (`gemini-2.5-flash` / `gemini-2.5-pro`) to translate plain English prompts into structured, executable node topologies.
2. **Visual Workflow Canvas**:
   - Interactive React Flow canvas supporting:
     - **Triggers**: Inbound Webhooks, Scheduled Cron Poller, Supabase DB Events.
     - **Gemini AI**: Prompt reasoning, sentiment classification, entity extraction.
     - **Conditions**: Dynamic branching gates (`equals`, `gte`, `lte`, `contains`).
     - **Actions**: Slack / Discord alerts, Supabase PostgreSQL upserts, REST relays.
3. **Encrypted Credential Vault**:
   - Server-side AES-256-GCM encryption with IV and authentication tag for third-party API tokens.
4. **Execution Telemetry Engine & Sandbox**:
   - Sequential step evaluation, payload propagation, and duration measurement in milliseconds.
5. **AI Error Diagnostics**:
   - Automatic root-cause analysis and actionable repair patches for failed runs using Gemini.
6. **Supabase Database & Auth**:
   - Direct integration with Supabase Project `txyysjpubwljltvhiksx`.
   - Complete Row Level Security (RLS) policies and automatic profile creation trigger.

---

## Quickstart Guide

### 1. Database Setup in Supabase
1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/txyysjpubwljltvhiksx/sql/new).
2. Copy and paste the contents of [`supabase-schema.sql`](./supabase-schema.sql).
3. Click **Run** to provision the tables, RLS policies, indexes, and seed data.

### 2. Environment Variables (.env)
```env
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://txyysjpubwljltvhiksx.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio

# Vault Encryption (32-byte secret)
ENCRYPTION_SECRET_KEY=a1b2c3d4e5f678901234567890123456
```

### 3. Running Locally

**Start the Backend API Server:**
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

**Start the Frontend Web Application:**
```bash
npm run dev
# Web App running at http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/workflows/generate` | Synthesizes workflow topology from natural language prompt |
| `GET` | `/api/workflows` | Retrieves all workflows for user |
| `POST` | `/api/workflows` | Saves a new workflow definition |
| `GET` | `/api/workflows/:id` | Fetches a single workflow definition |
| `PUT` | `/api/workflows/:id` | Updates a workflow definition |
| `DELETE` | `/api/workflows/:id` | Deletes a workflow |
| `POST` | `/api/workflows/:id/execute` | Executes an automation and records step telemetry |
| `GET` | `/api/executions` | Lists execution audit logs |
| `POST` | `/api/executions/:id/diagnose`| Prompts Gemini AI to analyze failed step and return fix |
| `GET` | `/api/credentials` | Lists masked credentials in vault |
| `POST` | `/api/credentials` | Encrypts and stores credential |
| `DELETE` | `/api/credentials/:id` | Deletes credential |
| `GET` | `/api/health` | Service health and integration status |
