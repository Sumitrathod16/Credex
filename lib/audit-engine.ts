// ============================================================
// SpendLens — Audit Engine
// Pure functions — no side effects, no API calls, fully testable
// ============================================================

import {
  AuditInput,
  AuditResult,
  RecommendationType,
  ToolAuditResult,
  ToolId,
} from "@/types/audit";
import {
  CODING_ALTERNATIVES,
  TOOL_MAP,
  getCheaperPlans,
  getPlanPrice,
} from "@/lib/pricing-data";

// ---- Per-tool audit ----

function auditTool(
  toolId: string,
  plan: string,
  seats: number,
  monthlySpend: number,
  useCase: string
): ToolAuditResult {
  const tool = TOOL_MAP[toolId as keyof typeof TOOL_MAP];
  const currentPlan = getPlanPrice(toolId as ToolId, plan);

  // Default baseline: no savings
  let recommendation: RecommendationType = "optimal";
  let recommendedPlan: string | undefined;
  let recommendedTool: string | undefined;
  let projectedMonthlySpend = monthlySpend;
  let reasoning = "Your current plan is appropriately sized for your usage.";

  const toolName = tool?.name ?? toolId;
  const planLabel = currentPlan?.label ?? plan;

  // ---- Rule 1: Plan overage (paying more than catalogue price implies) ----
  if (currentPlan && currentPlan.pricePerSeat > 0 && !currentPlan.isUsageBased) {
    const expectedCost = currentPlan.pricePerSeat * seats;
    // If reported spend is >20% higher than expected, note discrepancy
    if (monthlySpend > expectedCost * 1.2) {
      // User may be paying add-ons or be on a higher tier — flag
      reasoning = `Your reported spend ($${monthlySpend}/mo) exceeds the list price for ${planLabel} with ${seats} seat(s) ($${expectedCost}/mo). Check for add-ons or billing tier mismatches.`;
    }
  }

  // ---- Rule 2: Cheaper plan from same vendor ----
  const cheaperPlans = getCheaperPlans(toolId as ToolId, plan, seats);
  if (cheaperPlans.length > 0) {
    const best = cheaperPlans.sort((a, b) => a.pricePerSeat - b.pricePerSeat)[0];
    const projectedCost = best.pricePerSeat * seats;
    if (projectedCost < monthlySpend) {
      recommendation = "downgrade";
      recommendedPlan = best.label;
      projectedMonthlySpend = projectedCost;
      reasoning = `${planLabel} at $${currentPlan?.pricePerSeat ?? "?"}/seat is more expensive than ${best.label} at $${best.pricePerSeat}/seat. With ${seats} seat(s), you'd save $${(monthlySpend - projectedCost).toFixed(0)}/mo without losing core functionality.`;
    }
  }

  // ---- Rule 3: Min-seats mismatch (e.g., Team plan requires 5 seats but you have 2) ----
  if (currentPlan && seats < currentPlan.minSeats && currentPlan.minSeats > 1) {
    reasoning = `You're paying for the ${planLabel} plan (min ${currentPlan.minSeats} seats) but only have ${seats} user(s). You're forced to pay for at least ${currentPlan.minSeats} seats — consider whether this tier is necessary.`;
    if (recommendation === "optimal") recommendation = "downgrade";
  }

  // ---- Rule 4: Coding tools — cross-tool comparison ----
  if (
    (useCase === "coding" || useCase === "mixed") &&
    (toolId === "cursor" || toolId === "github-copilot" || toolId === "windsurf")
  ) {
    const costPerSeat = monthlySpend / Math.max(seats, 1);
    const cheaper = CODING_ALTERNATIVES.filter(
      (a) => a.toolId !== toolId && a.pricePerSeat < costPerSeat * 0.7 // >30% cheaper
    );
    if (cheaper.length > 0 && recommendation === "optimal") {
      const alt = cheaper[0];
      const projectedCost = alt.pricePerSeat * seats;
      recommendation = "switch";
      recommendedTool = alt.label;
      projectedMonthlySpend = projectedCost;
      reasoning = `At $${costPerSeat.toFixed(0)}/seat, ${toolName} ${planLabel} is significantly more expensive than ${alt.label} at $${alt.pricePerSeat}/seat with comparable AI coding assistance for ${seats} developer(s).`;
    }
  }

  // ---- Rule 5: Claude Team plan — min 5 seats check ----
  if (toolId === "claude" && plan === "team") {
    const listCost = 30 * Math.max(seats, 5); // billed for at least 5
    if (seats < 5) {
      projectedMonthlySpend = listCost;
      reasoning = `Claude Team requires a minimum of 5 seats. With ${seats} user(s), you're paying for 5 seats anyway ($${listCost}/mo). If your team is under 5, Claude Pro individual ($20/seat) may be more economical.`;
      recommendation = "downgrade";
      recommendedPlan = "Claude Pro (individual)";
      projectedMonthlySpend = 20 * seats;
    }
  }

  // ---- Rule 6: ChatGPT Team — min 2 seats check ----
  if (toolId === "chatgpt" && plan === "team") {
    if (seats === 1) {
      recommendation = "downgrade";
      recommendedPlan = "ChatGPT Plus";
      projectedMonthlySpend = 20;
      reasoning = `ChatGPT Team is designed for 2+ users at $30/seat. With 1 user, ChatGPT Plus at $20/month gives equivalent capabilities at 33% less cost.`;
    }
  }

  // ---- Rule 7: High spend → Credex credits opportunity ----
  if (monthlySpend >= 200 && recommendation === "optimal") {
    recommendation = "credits";
    projectedMonthlySpend = monthlySpend * 0.7; // typical 30% discount via credits
    reasoning = `Your ${toolName} spend ($${monthlySpend}/mo) is substantial. Credex sourced credits typically yield 20-40% savings on AI tool subscriptions at this scale — no plan change needed.`;
  }

  const monthlySavings = Math.max(0, monthlySpend - projectedMonthlySpend);
  const annualSavings = monthlySavings * 12;

  return {
    toolId: toolId as ToolId,
    toolName,
    currentPlan: planLabel,
    currentMonthlySpend: monthlySpend,
    recommendation,
    recommendedPlan,
    recommendedTool,
    projectedMonthlySpend: Math.round(projectedMonthlySpend * 100) / 100,
    monthlySavings: Math.round(monthlySavings * 100) / 100,
    annualSavings: Math.round(annualSavings * 100) / 100,
    reasoning,
  };
}

// ---- Main audit function ----

export function runAudit(input: AuditInput): AuditResult {
  const toolResults: ToolAuditResult[] = input.tools.map((t) =>
    auditTool(t.toolId, t.plan, t.seats, t.monthlySpend, input.useCase)
  );

  const totalMonthlySavings = toolResults.reduce(
    (sum, r) => sum + r.monthlySavings,
    0
  );
  const totalAnnualSavings = totalMonthlySavings * 12;

  let savingsTier: AuditResult["savingsTier"];
  if (totalMonthlySavings >= 500) savingsTier = "high";
  else if (totalMonthlySavings < 100) savingsTier = "low";
  else savingsTier = "optimal";

  return {
    input,
    toolResults,
    totalMonthlySavings: Math.round(totalMonthlySavings * 100) / 100,
    totalAnnualSavings: Math.round(totalAnnualSavings * 100) / 100,
    savingsTier,
    createdAt: new Date().toISOString(),
  };
}

// ---- Helper: format savings tier message ----

export function getSavingsTierMessage(tier: AuditResult["savingsTier"]): string {
  switch (tier) {
    case "high":
      return "Significant overspend detected. Here's how to cut your AI bill immediately.";
    case "low":
      return "You're spending well. Your AI stack looks lean and appropriately sized.";
    default:
      return "A few optimizations could trim your AI spend without impacting productivity.";
  }
}
