# LANDING_COPY.md — SpendLens

## Hero Headline (≤ 10 words)

**Your AI tools are costing you more than you think.**

*Alternatives considered:*
- "Stop overpaying for AI tools." (too generic)
- "Find out if you're wasting money on AI." (too negative)
- "The free AI spend audit your finance team wants." (too long)

---

## Subheadline (≤ 25 words)

**Enter your stack in 2 minutes. Get an instant, specific audit — exactly where you're overspending and what to do.**

---

## Primary CTA Copy

**🔍 Run Free Audit — No Login**

*Why this CTA:* The word "Free" and "No Login" address the two biggest objections for a new tool. "Audit" sets expectations (you're getting analysis, not a sales pitch).

---

## Social Proof Block

> *Note: The following is mocked social proof for MVP. Indicated with [MOCKED].*

---

**[MOCKED]** ⭐⭐⭐⭐⭐

> "Found $1,200/month we were wasting on Cursor Business for 3 people. Took 90 seconds."
> — **Alex T., CTO @ a Series A SaaS startup**

**[MOCKED]** ⭐⭐⭐⭐⭐

> "I expected generic advice. Got line-by-line reasoning with actual dollar amounts. This is the tool I wanted."
> — **Priya M., VP Engineering @ a B2B startup**

**[MOCKED]** ⭐⭐⭐⭐⭐

> "We were on Claude Team with 3 users — didn't know the minimum was 5 seats. Saved $600/mo immediately."
> — **Jordan K., Founder @ a dev tools company**

---

**Numbers bar:**

| 8 tools audited | 2 minutes avg | No login required |
|-----------------|---------------|-------------------|
| Cursor, Claude, ChatGPT + 5 more | Instant results | Email only after value shown |

---

## FAQ — 5 Real Q&As

**Q1: Is this actually free? What's the catch?**

Yes, fully free. No credit card, no account. SpendLens is built by [Credex](https://credex.rocks) — a company that sells discounted AI credits. If your audit shows significant overspend, we may mention that Credex could help. That's the business model: we give you a genuinely useful tool, and for users with large AI bills, we're the solution. You never pay to use SpendLens.

---

**Q2: How accurate is the savings estimate?**

The audit uses current public pricing from official vendor pages (sourced in [PRICING_DATA.md](./PRICING_DATA.md), verified weekly). Savings estimates are projections based on public list prices — actual savings depend on your negotiated rates and usage patterns. We're conservative: we don't manufacture savings. If your stack is optimized, we'll say so.

---

**Q3: Is my spend data stored? Is it private?**

Your tool spend data (which tools, which plans, how many seats) is stored to generate your shareable audit URL. Your email (if you provide it) is stored separately and never included in the public share URL. No passwords, no payment info, no company secrets. See the architecture diagram for how PII is separated.

---

**Q4: Do I need to enter exact numbers?**

Approximate numbers are fine. If you're paying ~$200/month for Claude Team, enter that. The audit logic works on reported spend — it will flag if your reported spend is significantly higher than the list price (which might indicate hidden charges or plan mismatches).

---

**Q5: What if I'm already spending optimally?**

We'll tell you exactly that — honestly. The tool doesn't manufacture savings to make itself look useful. If your stack is well-optimized for your use case and team size, you'll see a "You're spending well" result with a note on what to monitor as you scale.
