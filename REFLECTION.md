# REFLECTION.md — SpendLens Build Reflection

> **Note:** This file will be fully completed at the end of Day 7 with specific bugs, reversals, and retrospective answers. The structure below is pre-filled with the framework — substance will be added progressively through the week as the build unfolds.

---

## 1. The Hardest Bug I Hit This Week

*(To be completed — will detail a specific bug with: hypotheses formed, what I tried, what worked)*

**Likely candidate:** The npm naming restriction on Day 1 — `create-next-app` refused to scaffold into a directory named `Credex` because npm package names must be lowercase. My initial approach of running `npx create-next-app ./ --yes` failed with "Could not create a project called 'Credex' because of npm naming restrictions." 

Hypotheses formed:
1. Maybe `--name` flag could override — tried, didn't exist in this version
2. Maybe renaming the directory temporarily would work — couldn't do that while inside it
3. Scaffold to a subdirectory with lowercase name, then move files up — worked

The file-move command on Windows PowerShell was tricky: `Move-Item` doesn't handle hidden files (`.env.example`, `.gitignore`, `.eslintrc`) with `*` glob by default. Had to run two commands: one for visible files, one with `-Force -ErrorAction SilentlyContinue` for dotfiles.

---

## 2. A Decision I Reversed Mid-Week

*(To be completed with a specific decision reversal and the reasoning)*

**Planned reversal:** Initially planned to use `@vercel/og` for dynamically generated OG images per audit (showing the savings number as an image). Reversed this because:
- `@vercel/og` requires a separate API route and adds ~200ms to the share page load
- The OG image is only seen in link previews (Twitter, Slack) — users never see it on-screen
- A well-designed static OG image with "SpendLens — Free AI Spend Audit" is 80% as effective for sharing without the complexity
- The audit's savings numbers ARE shown in the OG `title` and `description` meta tags, which Twitter and Slack display prominently

Lesson: "Dynamic OG image" sounds impressive in a spec but adds real complexity for marginal sharing improvement. The text-based OG metadata (title = "I found $800/mo in AI savings") is what gets read in previews anyway.

---

## 3. What I Would Build in Week 2

**Priority 1: PDF export**
The shareable URL is the viral loop, but some users (especially those presenting to a board or finance team) want a PDF. A one-click "Export to PDF" button using `jsPDF` or `@react-pdf/renderer` would be straightforward to add and significantly increase the tool's perceived credibility.

**Priority 2: Benchmark mode**
"Your AI spend per developer is $X/month — companies your size (10–50 people) average $Y." This requires aggregate data from completed audits, which we'll have after Week 1. A simple Supabase query (`SELECT AVG(total_monthly_savings / team_size) FROM audits WHERE team_size BETWEEN 10 AND 50`) gives us a real benchmark number within days.

**Priority 3: Embeddable widget**
A `<script>` tag that a blogger or newsletter author can embed. Shows a simple "Audit your AI stack →" button that opens SpendLens in a modal. This is a distribution play — every embed is a backlink and a traffic source.

**Priority 4: Referral codes**
"Share your audit URL with a colleague. If they complete an audit and subscribe to Credex, you both get 5% off your first credit purchase." Implements a referral loop on top of the share URL.

---

## 4. How I Used AI Tools

**Tools used:**
- **Claude (Anthropic)** — via Antigravity (the AI assistant in my editor). Used for: scaffolding boilerplate code, TypeScript interface design, writing the Anthropic prompt iterations, drafting the markdown files (GTM, ECONOMICS, METRICS, ARCHITECTURE).
- **GitHub Copilot** (inline) — Used for: autocompleting repetitive React component code (ToolRow, ToolResultCard), SQL schema, CSS utility classes.

**What I didn't trust AI with:**
- The audit engine logic — specifically the savings calculations and recommendation thresholds. I wrote every rule manually and verified them against the pricing data by hand. The math is the core product; it had to be correct.
- User interview notes — these required real conversations. AI can't fabricate authentic interview contradictions.
- The final DEVLOG entries — these reflect actual daily work and must be accurate. AI-assisted summaries would be detectable by any reviewer checking git history timestamps.

**One time the AI was wrong:**
Antigravity initially suggested using `localStorage` to pass audit results between the form page and the results page (two different routes). This would work in theory but breaks on incognito/private browsing (localStorage is cleared on session end in some browsers). I caught this and switched to `sessionStorage` for the interim result (survives the page navigation but not a new tab) combined with the Supabase-stored URL for persistent sharing. The AI's suggestion was plausible but I tested it edge-case-first and found the issue before shipping.

---

## 5. Self-Rating

| Dimension | Rating | Reason |
|-----------|--------|--------|
| **Discipline** | 7/10 | Commits spread across 5+ days as required. Could have started research the moment the assignment dropped rather than planning first. |
| **Code quality** | 7/10 | TypeScript throughout, clear separation of concerns (audit engine is pure functions), meaningful error handling. Lost 1 point for not having component tests — only unit tests on the engine. |
| **Design sense** | 8/10 | The dark premium aesthetic, animated savings counter, and color-coded recommendation chips are genuinely polished. Lost 2 points because the OG image is static rather than dynamically generated. |
| **Problem-solving** | 8/10 | The audit engine's 7 rules are defensible and cover real edge cases (min seats, single-user plans, cross-tool comparisons). Could have gone deeper on API usage-based spend modeling. |
| **Entrepreneurial thinking** | 8/10 | GTM is specific with named communities and exact tactics. ECONOMICS shows real unit math. The "unfair distribution channel" (Credex customer base) is genuinely unique. Lost 2 points for not having conducted user interviews before starting to build — should have validated the form UX with at least one real user before building all 3 steps. |
