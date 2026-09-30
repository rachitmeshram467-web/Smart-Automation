# Smart Automation Platform

A production-grade, event-driven autonomous workflow and task automation platform powered by **Google Gemini AI** and **Supabase PostgreSQL**.

---

## Deployment Architecture

The workspace is organized into independent **`client/`** (Frontend) and **`server/`** (Backend) packages:

```text
Smart AutoMation/
├── 📁 client/                 # Frontend SPA (React 19, Vite, Tailwind CSS, React Flow)
│   ├── 📁 src/                # Components, Pages, Canvas, AuthContext
│   ├── 📁 public/             # Static assets
│   ├── 📄 .env                # Client environment variables (VITE_SUPABASE_URL, etc.)
│   ├── 📄 index.html          # HTML entry point
│   ├── 📄 vite.config.js      # Vite build configuration
│   ├── 📄 tailwind.config.js  # Dark neon design tokens
│   └── 📄 package.json        # Client dependencies & scripts
│
├── 📁 server/                 # Backend REST API (Node.js, Express, TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 config/         # Zod environment validation
│   │   ├── 📁 controllers/    # Workflows, Executions, Credential Vault
│   │   ├── 📁 middleware/     # Supabase Auth JWT validation
│   │   ├── 📁 routes/         # Express API routes
│   │   ├── 📁 services/       # @google/genai SDK, Supabase client, AES-256 cipher
│   │   └── 📄 server.ts       # Server entry point (Port 5000)
│   ├── 📄 .env                # Server secrets (GEMINI_API_KEY, SUPABASE_ANON_KEY, etc.)
│   ├── 📄 tsconfig.json       # TypeScript configuration
│   └── 📄 package.json        # Server dependencies & scripts
│
├── 📄 supabase-schema.sql     # Complete PostgreSQL schema, RLS policies & Triggers
├── 📄 package.json            # Monorepo orchestration scripts
└── 📄 README.md               # Platform documentation
```

---

## Environment Variables

### Client (`client/.env`)
```env
VITE_SUPABASE_URL=https://txyysjpubwljltvhiksx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_BACKEND_URL=http://localhost:5000/api
```

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://txyysjpubwljltvhiksx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=your_gemini_api_key
ENCRYPTION_SECRET_KEY=a1b2c3d4e5f678901234567890123456
```

---

## Running Locally & Deployment

From the root workspace directory:

```bash
# Start Server (Port 5000)
npm run dev:server

# Start Client (Port 5173)
npm run dev:client

# Production Build for Both
npm run build
```

Or run directly inside each respective folder:
- **Server**: `cd server && npm run dev`
- **Client**: `cd client && npm run dev`
