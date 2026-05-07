# SpendLens — Free AI Spend Audit for Startups

**SpendLens** is a free web app that audits your team's AI tool spend in 2 minutes — showing exactly where you're overpaying on Cursor, Claude, ChatGPT, GitHub Copilot, Gemini, and more, with specific, defensible recommendations. Built by Credex as a lead-generation asset that genuinely helps startup founders and engineering managers.

## Live Demo

🔗 **[spendlens.vercel.app](https://spendlens.vercel.app)**

## Screenshots

> Screenshots and recording to be added after deployment (Day 7)

## Quick Start

### Prerequisites
- Node.js 20+
- npm 9+
- Supabase project (free tier)
- Resend account (optional, for emails)
- Anthropic API key (optional, for AI summaries)

### Install & Run Locally

```bash
git clone https://github.com/Sumitrathod16/Credex
cd Credex
npm install
cp .env.example .env.local
# Fill in your Supabase, Anthropic, and Resend keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Run Tests

```bash
npm run test
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
# Set environment variables in Vercel dashboard
```

### Supabase Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Audits table (public shareable data)
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tools JSONB NOT NULL,
  use_case TEXT,
  team_size INTEGER,
  tool_results JSONB,
  total_monthly_savings DECIMAL,
  total_annual_savings DECIMAL,
  savings_tier TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leads table (private — not exposed via public API)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id),
  email TEXT NOT NULL,
  company_name TEXT,
  role TEXT,
  team_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row-level security: audits are publicly readable, leads are service-role only
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audits are publicly readable" ON audits FOR SELECT USING (true);
CREATE POLICY "Audits are insertable via service role" ON audits FOR INSERT WITH CHECK (true);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- leads: no public access — only via service role key
```

## Decisions

| # | Decision | Reasoning |
|---|----------|-----------|
| 1 | **Next.js 14 (App Router)** over Vite/SPA | Server-side rendering is essential for dynamic OG meta tags on shareable `/audit/[id]` URLs — this is the viral loop. A pure SPA can't generate per-audit previews without a separate edge function. |
| 2 | **Hardcoded audit rules, not LLM** for the core engine | The assignment explicitly tested whether I knew when *not* to use AI. Audit math must be deterministic, auditable, and correct — an LLM could hallucinate savings figures. LLM is reserved for the summary paragraph, where flavor matters more than precision. |
| 3 | **Supabase over Firebase** | Supabase gives us Postgres (real relational DB), which matters for queries like "how many $500+ savings audits this week." Firebase's document model would require denormalization. Supabase's Row-Level Security also makes PII separation cleaner. |
| 4 | **In-process IP rate limiting** over Redis for MVP | Adding Upstash Redis would require another service, another env var, and another billing account. For MVP scale, in-memory rate limiting + honeypot is sufficient. ARCHITECTURE.md documents the upgrade path. |
| 5 | **localStorage for form state** (no Redux/Zustand) | The assignment required persistence across reloads. A state management library would be overkill for a single form. `localStorage` with a versioned key (`spendlens_form_v1`) is simple, fast, and zero-dependency. |
