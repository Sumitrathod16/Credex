# ECONOMICS.md — SpendLens Unit Economics

## What a Converted Lead Is Worth to Credex

Credex's core product: AI infrastructure credits at a discount. Let's model the economics.

**Assumptions:**
- Average startup buying Credex credits: $3,000/month AI spend → $2,100 via Credex (30% discount)
- Credex margin on credits: ~15% of transaction value = $450/month per customer
- Average customer LTV: 18 months (early startup, tends to grow or churn)
- **LTV per customer: $450 × 18 = $8,100**

This is conservative. Customers who expand (more seats, more tools) could be 3–5× this.

---

## CAC at Each Channel

| Channel | Cost | Estimated Conversions | CAC |
|---------|------|----------------------|-----|
| SpendLens (this tool) | $0 direct spend | 1–5 consults/month from leads | **$0 CAC** (tool is sunk cost) |
| HN Show HN post | $0 | 5–10 signups per post (2–3 converting) | ~$0, time cost only |
| Twitter thread | $0 | 2–5 leads per viral thread | $0 |
| IndieHackers DMs | $0 | 1–2 per 20 DMs | $0 |
| Google Ads (hypothetical) | $50 CPC × 200 clicks | ~10% landing to audit, ~5% to lead = 1 conversion | $10,000 CAC — terrible |
| LinkedIn outreach (hypothetical) | $5/contact × 100 | 3–5 meetings, 1–2 conversions | $250–$500 CAC |

**Key insight:** SpendLens creates a $0 CAC channel where the economics are otherwise brutal. At $8,100 LTV and $0 CAC, every conversion is pure profit minus the cost of running the tool (~$0 at MVP scale on free tiers).

---

## Conversion Funnel

```
100 users complete an audit
  ↓ 30% email capture = 30 leads
    ↓ 40% of leads are high-savings (>$500/mo) = 12 qualified leads
      ↓ 25% book a consultation = 3 consultations
        ↓ 50% close = 1.5 customers per 100 audits
```

**Revenue per 100 audits:** 1.5 customers × $8,100 LTV = **$12,150**

This means SpendLens needs to drive ~100 audits/month to generate ~1–2 customers/month, generating ~$8,100–$16,200 in LTV.

---

## Profitability Threshold

**Running cost of SpendLens at 1,000 audits/month:**
| Service | Cost |
|---------|------|
| Vercel (Pro) | $20/month |
| Supabase (Pro) | $25/month |
| Anthropic API (Haiku, 1000 summaries @ $0.001 each) | $1/month |
| Resend (3,000 emails free) | $0 |
| **Total** | **~$46/month** |

**Break-even:** Need 1 customer per month from SpendLens. At 100 audits/month, that's achievable (1.5 expected). The tool pays for itself at 100 audits/month.

---

## Path to $1M ARR in 18 Months

**What needs to be true:**

$1M ARR = ~$55,500 MRR = ~123 active customers paying ~$450 MRR each

**Working backwards:**
- 123 customers in 18 months = ~7 net new customers/month
- At 1.5 customers per 100 audits: need ~470 audits/month by month 18
- At 25% completion rate: need ~1,880 visitors/month

**This is achievable if:**
1. SpendLens gets 1 HN front-page post (1,000–3,000 visits, sustainable organic via SEO)
2. Credex deploys the embeddable widget version to 2–3 founder newsletters (each with 5,000+ subscribers)
3. The referral loop works: 30% of high-savings users share their audit → viral coefficient of ~0.3 compounds traffic
4. SEO: "AI tool cost comparison," "Cursor vs Copilot pricing" — these are low-competition, high-intent queries. 3–6 months to rank → sustainable organic baseline

**What would kill this:**
- Completion rate drops below 10% (form too long, value prop not clear)
- Email capture rate below 15% (modal too aggressive or shown before value)
- Conversion from consultation to close below 30% (Credex sales execution problem, not tool problem)

**Most likely failure mode:** Tool drives audits but Credex consultation booking is not smooth. The booking CTA on the results page links to `credex.rocks` — if there's no clear consultation booking flow there, leads evaporate. Fix: Add a Calendly link directly on the >$500 savings CTA.
