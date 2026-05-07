// ============================================================
// SpendLens — Anthropic AI Summary
// Generates ~100-word personalized audit summary
// Falls back to templated string on any error
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { AuditResult } from "@/types/audit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const USE_CASE_LABEL: Record<string, string> = {
  coding: "software development",
  writing: "content and writing",
  data: "data analysis",
  research: "research workflows",
  mixed: "general productivity",
};

export function buildPrompt(audit: AuditResult): string {
  const { toolResults, totalMonthlySavings, totalAnnualSavings, input } = audit;
  const topTools = toolResults
    .map((r) => `${r.toolName} (${r.currentPlan}, $${r.currentMonthlySpend}/mo, savings: $${r.monthlySavings}/mo)`)
    .join("; ");

  return `You are a concise AI spend advisor. Write a single paragraph (~100 words) summarizing this team's AI tool audit.

Team: ${input.teamSize} people focused on ${USE_CASE_LABEL[input.useCase] ?? input.useCase}.
Tools audited: ${topTools}.
Total potential monthly savings: $${totalMonthlySavings}. Annual: $${totalAnnualSavings}.

Rules: mention specific tool names and dollar figures. Lead with the top saving opportunity. Be direct and financially literate, not salesy. End with one actionable priority sentence. Write 90–110 words as a single prose paragraph with no lists or headers.`;
}

export function buildFallbackSummary(audit: AuditResult): string {
  const { toolResults, totalMonthlySavings, input } = audit;
  const topSaving = toolResults.reduce((a, b) =>
    a.monthlySavings > b.monthlySavings ? a : b
  );

  if (totalMonthlySavings < 10) {
    return `Your AI stack of ${input.tools.length} tool(s) for ${input.teamSize} team members looks lean and well-optimized for ${USE_CASE_LABEL[input.useCase] ?? input.useCase}. No significant overspend detected. Keep monitoring as your team scales — plan fit can shift quickly when you cross seat thresholds. Set a calendar reminder to re-audit when your team grows by 5+ people or when any subscription renews annually.`;
  }

  return `Your team is spending $${audit.input.tools.reduce((s, t) => s + t.monthlySpend, 0).toFixed(0)}/month across ${input.tools.length} AI tool(s). The biggest immediate opportunity is ${topSaving.toolName}: switching from ${topSaving.currentPlan} could save ~$${topSaving.monthlySavings.toFixed(0)}/month. In total, optimizing your stack could free up $${totalMonthlySavings.toFixed(0)}/month — $${audit.totalAnnualSavings.toFixed(0)} annually. Start with ${topSaving.toolName} first; it delivers the highest return with the lowest switching friction for a ${USE_CASE_LABEL[input.useCase] ?? input.useCase} team.`;
}

export async function generateAISummary(audit: AuditResult): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return buildFallbackSummary(audit);
  }

  try {
    const prompt = buildPrompt(audit);
    const message = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 250,
      stop_sequences: ["\n\n\n", "---"],
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type === "text") {
      return content.text.trim();
    }
    return buildFallbackSummary(audit);
  } catch (error: any) {
    const msg = error?.message ?? error?.error?.message ?? String(error);
    console.error("[SpendLens] Anthropic API error — using fallback summary:", msg);
    return buildFallbackSummary(audit);
  }
}
