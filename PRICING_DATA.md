# PRICING_DATA.md — SpendLens Pricing Sources

Every number in the audit engine traces to an official vendor pricing page.
All prices are in USD per seat per month, billed monthly unless noted.
**Last verified: 2026-05-07**

---

## Cursor

| Plan | Price | Source | Verified |
|------|-------|--------|---------|
| Hobby | $0/user/month | https://cursor.com/pricing | 2026-05-07 |
| Pro | $20/user/month | https://cursor.com/pricing | 2026-05-07 |
| Business | $40/user/month | https://cursor.com/pricing | 2026-05-07 |
| Enterprise | Custom (contact sales) | https://cursor.com/pricing | 2026-05-07 |

Notes: Pro includes 500 fast premium requests/month. Business adds SSO, admin controls, and enforced privacy mode.

---

## GitHub Copilot

| Plan | Price | Source | Verified |
|------|-------|--------|---------|
| Individual | $10/user/month (or $100/yr) | https://github.com/features/copilot#pricing | 2026-05-07 |
| Business | $19/user/month | https://github.com/features/copilot#pricing | 2026-05-07 |
| Enterprise | $39/user/month | https://github.com/features/copilot#pricing | 2026-05-07 |

Notes: Individual is $10/month or $100/year. Business adds org-wide policy management. Enterprise adds fine-tuned models and Copilot Workspace.

---

## Claude (Anthropic)

| Plan | Price | Source | Verified |
|------|-------|--------|---------|
| Free | $0 | https://claude.ai/upgrade | 2026-05-07 |
| Pro | $20/month (single user) | https://claude.ai/upgrade | 2026-05-07 |
| Max | $100/month (single user, 5× usage) | https://claude.ai/upgrade | 2026-05-07 |
| Team | $30/user/month (min 5 seats) | https://claude.ai/upgrade | 2026-05-07 |
| Enterprise | Custom | https://www.anthropic.com/claude-for-enterprise | 2026-05-07 |
| API | Usage-based (see Anthropic API below) | https://www.anthropic.com/pricing | 2026-05-07 |

Notes: Team plan requires a minimum of 5 seats. Max plan is for single power users needing 5× the usage limits of Pro.

---

## ChatGPT (OpenAI)

| Plan | Price | Source | Verified |
|------|-------|--------|---------|
| Free | $0 | https://openai.com/chatgpt/pricing | 2026-05-07 |
| Plus | $20/month (single user) | https://openai.com/chatgpt/pricing | 2026-05-07 |
| Team | $30/user/month (min 2 seats; $25/seat billed annually) | https://openai.com/chatgpt/pricing | 2026-05-07 |
| Enterprise | Custom | https://openai.com/chatgpt/pricing | 2026-05-07 |
| API | Usage-based (see OpenAI API below) | https://openai.com/api/pricing | 2026-05-07 |

Notes: Team plan billed annually is $25/seat/month. Minimum 2 seats. Includes higher message limits and no data training.

---

## Anthropic API

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Source | Verified |
|-------|-----------------------|------------------------|--------|---------|
| claude-3-5-haiku | $0.80 | $4.00 | https://www.anthropic.com/pricing | 2026-05-07 |
| claude-3-5-sonnet | $3.00 | $15.00 | https://www.anthropic.com/pricing | 2026-05-07 |
| claude-3-7-sonnet | $3.00 | $15.00 | https://www.anthropic.com/pricing | 2026-05-07 |
| claude-opus-4 | $15.00 | $75.00 | https://www.anthropic.com/pricing | 2026-05-07 |

Notes: All API pricing is usage-based with no seat minimums. Significant volume discounts available via Anthropic Workspaces.

---

## OpenAI API

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Source | Verified |
|-------|-----------------------|------------------------|--------|---------|
| gpt-4o | $2.50 | $10.00 | https://openai.com/api/pricing | 2026-05-07 |
| gpt-4o-mini | $0.15 | $0.60 | https://openai.com/api/pricing | 2026-05-07 |
| o3 | $2.00 | $8.00 | https://openai.com/api/pricing | 2026-05-07 |

Notes: Usage-based, no seats. Batch API offers 50% discount for async jobs.

---

## Gemini (Google)

| Plan | Price | Source | Verified |
|------|-------|--------|---------|
| Free (gemini.google.com) | $0 | https://gemini.google.com | 2026-05-07 |
| Google One AI Premium | $19.99/month | https://one.google.com/about/ai-premium | 2026-05-07 |
| Gemini for Google Workspace | $30/user/month add-on | https://workspace.google.com/intl/en/pricing/gemini/ | 2026-05-07 |
| API (Gemini 2.0 Flash) | $0.10/$0.40 per 1M tokens | https://ai.google.dev/gemini-api/docs/pricing | 2026-05-07 |
| API (Gemini 2.5 Pro) | $1.25/$10.00 per 1M tokens | https://ai.google.dev/gemini-api/docs/pricing | 2026-05-07 |

---

## Windsurf (Codeium)

| Plan | Price | Source | Verified |
|------|-------|--------|---------|
| Free | $0 | https://windsurf.com/pricing | 2026-05-07 |
| Pro | $15/user/month | https://windsurf.com/pricing | 2026-05-07 |
| Teams | $35/user/month | https://windsurf.com/pricing | 2026-05-07 |

Notes: Free plan includes limited Flow actions. Pro includes unlimited completions and 25 Flow actions/month. Teams adds admin controls and SSO.

---

## Methodology

1. All prices were pulled directly from official vendor pricing pages on 2026-05-07.
2. Where annual and monthly billing differ, the **monthly billing** price is used (conservative — most startups are month-to-month).
3. Enterprise/custom pricing is marked as such and excluded from automated savings calculations.
4. API pricing is noted but savings calculations for API tools use user-reported actual spend rather than projected token costs (too variable to estimate).
