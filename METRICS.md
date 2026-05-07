# METRICS.md — SpendLens North Star & Measurement Plan

## North Star Metric

**Weekly Qualified Leads** — defined as: audits completed in the past 7 days where the user captured their email AND total monthly savings > $100.

**Why this, not DAU or total audits:**
- SpendLens is a B2B lead-gen tool. Value to Credex is qualified pipeline, not traffic.
- A user who completes an audit and doesn't enter email is interesting but not a lead.
- A user who enters email but has $0 savings is not a qualified Credex prospect.
- Weekly qualified leads directly predicts revenue within 4–6 weeks (consultation → close lag).
- "DAU" is wrong for a tool people use once per quarter — it would stay near 0 even if the tool is working perfectly.

**Target:** 10 qualified leads/week within 60 days of launch.

---

## 3 Input Metrics That Drive the North Star

| Input Metric | How It Drives NS | What to Optimize |
|--------------|-----------------|-----------------|
| **Audit Completion Rate** (% of visitors who reach the results page) | More audits completed = more chances for qualified leads | Reduce form friction. Currently 3 steps — test 2-step variants. |
| **Email Capture Rate** (% of audited users who submit email) | Email is required to count as a lead | Timing of modal (show after seeing savings, not before). Copy of lead capture CTA. |
| **Savings Distribution** (% of audits showing > $100/mo savings) | High-savings audits yield qualified leads | Not directly controllable — but segmentation helps (focus GTM on larger teams who spend more) |

---

## What to Instrument First

**Day 1 instrumentation (before any paid promotion):**

1. `audit_started` — user clicks "Run Free Audit" on step 3
2. `audit_completed` — results page rendered with a valid result
3. `email_submitted` — lead form submitted successfully
4. `share_link_copied` — user clicks the share button
5. `credex_cta_clicked` — user clicks "Book a Consultation" on high-savings results

**Lightweight implementation:** Vercel Analytics (free, zero-config) covers page-level metrics. For custom events, a single `fetch('/api/track', { event: '...', props: {} })` endpoint writing to a `events` Supabase table is sufficient for MVP. No need for Segment/Mixpanel at this stage.

**Dashboard query to check NS metric:**
```sql
SELECT COUNT(DISTINCT l.id) as qualified_leads
FROM leads l
JOIN audits a ON l.audit_id = a.id
WHERE l.created_at > now() - interval '7 days'
  AND a.total_monthly_savings > 100;
```

---

## Pivot Trigger

**If, after 30 days of active distribution:**
- Audit completion rate < 15% → The form is too long or the value prop isn't clear enough. Pivot: cut to a 1-step form (just total spend + team size) for a faster result, upsell detailed breakdown after.
- Email capture rate < 10% → The email gate is being skipped. Pivot: make the detailed per-tool breakdown email-gated, with only the total savings number shown before capture.
- Qualified leads < 2/week → Either traffic is wrong (targeting wrong personas) or the savings found are too small (targeting too-small teams). Pivot GTM toward larger team sizes (50+ employees) where AI spend is higher.

**The number that triggers a pivot:** 4 weeks of data with < 5 qualified leads/week despite > 200 audits/week = something in the funnel is broken.
