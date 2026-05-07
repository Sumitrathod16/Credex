# PROMPTS.md — SpendLens LLM Prompts

## Feature: AI-Generated Audit Summary

### Why I used AI here (and didn't elsewhere)

The assignment explicitly tested whether candidates know *when not* to use AI.

**The audit engine is hardcoded rules** — because savings calculations must be deterministic, auditable, and correct. An LLM hallucinating a $500/mo savings figure would be worse than no AI at all. A finance person should be able to read the rules and agree with them.

**The summary paragraph uses AI** — because this is a flavor/narrative task, not a math task. The goal is a 100-word paragraph that feels personalized and reads naturally. Template-generated text is obvious and off-putting. Here, LLM adds real value.

---

## Final Prompt (used in production)

```
You are a concise, honest AI spend advisor. Write a personalized ~100-word audit summary for a team.

Context:
- Team size: {teamSize} people
- Primary use case: {useCase}
- AI tools in use: {toolsWithPrices}
- Total potential monthly savings: ${totalMonthlySavings}
- Total potential annual savings: ${totalAnnualSavings}

Instructions:
- Be specific. Mention actual tool names and dollar amounts.
- Lead with the biggest saving opportunity.
- Tone: direct, financially literate, not salesy.
- Do NOT recommend Credex directly — focus on the audit findings.
- End with one sentence on what they should prioritize first.
- 90–110 words. No bullet points. Plain prose.
```

**Model used:** `claude-3-5-haiku-20241022`  
**Max tokens:** 200  
**Why Haiku:** Fast (< 1 second), cheap (< $0.001 per audit), and the task is short-form prose where Sonnet's extra reasoning doesn't add value.

---

## What I tried that didn't work

### Attempt 1: One-shot summary with no structure constraints

```
Write a short summary of this AI spend audit: {json}
```

**Problem:** Output was verbose (200–300 words), inconsistent formatting, sometimes listed every tool even if savings were $0. Felt generic, not personalized.

### Attempt 2: Structured output (JSON)

Tried asking for `{"summary": "...", "priority": "..."}` to parse programmatically.

**Problem:** With a token budget of 200 and Haiku, it sometimes returned malformed JSON, requiring try/catch and fallback. The extra complexity wasn't worth it for a single text field.

### Attempt 3: System prompt + shorter user message

Moved personality/tone instructions to system prompt, kept user message to data only.

**Problem:** Haiku's system prompt compliance is weaker than Sonnet. Results were less consistent on tone. Moved everything back to user message.

### What worked: Explicit word count + prose requirement

Adding "90–110 words. No bullet points. Plain prose." reduced variance significantly. Haiku respects explicit word count instructions ~80% of the time, which is acceptable for a summary paragraph.

---

## Fallback Strategy

If the Anthropic API is unavailable (rate limit, key missing, network error), the system falls back to `buildFallbackSummary()` in `lib/anthropic.ts` — a template function that produces grammatically correct, data-accurate prose using the audit result directly. It's not as natural as AI output but is never wrong on numbers.
