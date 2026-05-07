# DEVLOG.md — SpendLens Build Log

## Day 1 — 2026-05-07

**Hours worked:** 8

**What I did:**
- Read the full assignment document twice, identified the 6 required MVP features and the evaluation rubric weights
- Decided on app name: **SpendLens** — descriptive, clean, memorable, different from generic "AI Audit" names
- Stack decision: Next.js 14 (App Router) + TypeScript + Tailwind + Supabase + Resend + Anthropic. Wrote rationale in ARCHITECTURE.md
- Scaffolded the Next.js project in the Credex repo root using `create-next-app`
- Installed all production and dev dependencies: `@supabase/supabase-js`, `@anthropic-ai/sdk`, `resend`, `lucide-react`, `framer-motion`, `vitest`, `@testing-library/react`
- Built TypeScript types (`types/audit.ts`) — all interfaces for AuditInput, AuditResult, ToolAuditResult, StoredAudit, Lead, API payloads
- Researched and verified all 8 tool pricing pages — pulled current prices from official Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, and Windsurf pricing pages
- Built `lib/pricing-data.ts` — all tool pricing as typed constants with helper functions
- Built `lib/audit-engine.ts` — 7 audit rules: plan fit, downgrade detection, min-seat checks, cross-tool comparisons, Credex credits rule
- Built `lib/anthropic.ts` — Anthropic API integration with prompt and fallback template
- Built `lib/resend.ts` — transactional email with branded HTML template
- Built `lib/supabase.ts` — public and admin clients
- Built API routes: `/api/audit`, `/api/lead`
- Built CI: `.github/workflows/ci.yml`
- Written `PRICING_DATA.md`, `PROMPTS.md`, `ARCHITECTURE.md`, `TESTS.md`, `README.md` (initial)
- Built full landing page (`app/page.tsx`) with 3-step form, localStorage persistence, all 8 tools
- Built results page (`app/results/page.tsx`) with animated counter, per-tool cards, lead capture modal, share button
- Built shareable audit page (`app/audit/[id]/page.tsx`) with SSR OG meta tags
- Written unit tests: 7 tests covering audit engine logic
- Created `.env.example` with all required env vars

**What I learned:**
- The npm naming restriction means the directory name can't contain capital letters — had to scaffold to a subdirectory then move files up
- Claude Team plan has a minimum of 5 seats, which is an important audit rule for small teams
- Windsurf's pricing changed recently — their Pro plan is now $15/seat (was $10 in early 2025 references online). Always pull from the official source, never trust secondary sources
- Haiku is significantly faster than Sonnet for short-form prose tasks and the quality difference is negligible at 100 words

**Blockers / what I'm stuck on:**
- Need to set up Supabase project and get credentials to test the database integration end-to-end
- Need Anthropic API key to test the summary generation
- The OG image for shareable URLs is currently a static `/og-default.png` — ideally would be dynamically generated per audit, but that requires @vercel/og which adds complexity. Keeping static for MVP.

**Plan for tomorrow:**
- Set up Supabase project, create tables, get credentials
- Create `.env.local` with real credentials and test the full flow end-to-end locally
- Run all tests and verify they pass
- Fix any TypeScript errors (`npm run typecheck`)
- Begin polishing UI — animations, mobile layout, accessibility
- Draft DEVLOG Day 2 entry
