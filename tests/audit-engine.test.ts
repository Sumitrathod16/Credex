// ============================================================
// Vitest — Audit Engine Tests (≥5 required by assignment)
// Run: npm run test
// ============================================================

import { describe, it, expect } from "vitest";
import { runAudit, getSavingsTierMessage } from "@/lib/audit-engine";
import { AuditInput } from "@/types/audit";

// ---- Test 1: Cursor Business to Pro downgrade ----
describe("Audit Engine — Cursor", () => {
  it("recommends downgrading Cursor Business to Pro for a solo developer", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "cursor", plan: "business", seats: 1, monthlySpend: 40 },
      ],
      teamSize: 1,
      useCase: "coding",
    };
    const result = runAudit(input);
    const cursorResult = result.toolResults[0];

    // Should detect cheaper plan
    expect(cursorResult.recommendation).toBe("downgrade");
    expect(cursorResult.monthlySavings).toBeGreaterThan(0);
    expect(cursorResult.annualSavings).toBe(cursorResult.monthlySavings * 12);
    expect(cursorResult.reasoning).toContain("$");
  });
});

// ---- Test 2: Claude Team with fewer than 5 seats ----
describe("Audit Engine — Claude", () => {
  it("flags Claude Team as inefficient for fewer than 5 users", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "claude", plan: "team", seats: 2, monthlySpend: 60 },
      ],
      teamSize: 2,
      useCase: "writing",
    };
    const result = runAudit(input);
    const claudeResult = result.toolResults[0];

    expect(claudeResult.recommendation).toBe("downgrade");
    expect(claudeResult.monthlySavings).toBeGreaterThan(0);
    expect(claudeResult.reasoning).toMatch(/team|5 seat/i);
  });
});

// ---- Test 3: ChatGPT Team for 1 user should suggest Plus ----
describe("Audit Engine — ChatGPT", () => {
  it("recommends ChatGPT Plus over Team for a single user", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "chatgpt", plan: "team", seats: 1, monthlySpend: 30 },
      ],
      teamSize: 1,
      useCase: "writing",
    };
    const result = runAudit(input);
    const chatgptResult = result.toolResults[0];

    expect(chatgptResult.recommendation).toBe("downgrade");
    expect(chatgptResult.recommendedPlan).toMatch(/plus/i);
    expect(chatgptResult.monthlySavings).toBe(10);
  });
});

// ---- Test 4: Optimal spend — GitHub Copilot Individual for solo dev ----
describe("Audit Engine — Optimal Case", () => {
  it("marks GitHub Copilot Individual for 1 user as optimal or credits", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "github-copilot", plan: "individual", seats: 1, monthlySpend: 10 },
      ],
      teamSize: 1,
      useCase: "coding",
    };
    const result = runAudit(input);
    const copilotResult = result.toolResults[0];

    // Should be optimal (cheapest coding plan) or credits (if high spend, but $10 is not)
    expect(["optimal", "switch"]).toContain(copilotResult.recommendation);
    // Annual savings should be 12x monthly
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });
});

// ---- Test 5: Savings tier thresholds ----
describe("Audit Engine — Savings Tier", () => {
  it("assigns 'high' tier when total monthly savings ≥ $500", () => {
    // Simulate a result with very high spend across many tools
    const input: AuditInput = {
      tools: [
        { toolId: "cursor", plan: "business", seats: 20, monthlySpend: 800 },
        { toolId: "claude", plan: "team", seats: 20, monthlySpend: 600 },
        { toolId: "chatgpt", plan: "team", seats: 20, monthlySpend: 600 },
      ],
      teamSize: 20,
      useCase: "coding",
    };
    const result = runAudit(input);
    expect(result.savingsTier).toBe("high");
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(500);
  });

  it("assigns 'low' tier when total monthly savings < $100", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "github-copilot", plan: "individual", seats: 1, monthlySpend: 10 },
      ],
      teamSize: 1,
      useCase: "coding",
    };
    const result = runAudit(input);
    expect(result.savingsTier).toBe("low");
    expect(result.totalMonthlySavings).toBeLessThan(100);
  });
});

// ---- Test 6: Annual savings = 12x monthly ----
describe("Audit Engine — Math Consistency", () => {
  it("annual savings equals exactly 12x monthly savings", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "cursor", plan: "business", seats: 5, monthlySpend: 200 },
        { toolId: "claude", plan: "pro", seats: 5, monthlySpend: 100 },
      ],
      teamSize: 5,
      useCase: "mixed",
    };
    const result = runAudit(input);
    expect(result.totalAnnualSavings).toBeCloseTo(result.totalMonthlySavings * 12, 2);
  });
});

// ---- Test 7: getSavingsTierMessage returns distinct messages ----
describe("getSavingsTierMessage", () => {
  it("returns different messages for each tier", () => {
    const highMsg = getSavingsTierMessage("high");
    const lowMsg = getSavingsTierMessage("low");
    const optMsg = getSavingsTierMessage("optimal");

    expect(highMsg).not.toBe(lowMsg);
    expect(highMsg).not.toBe(optMsg);
    expect(lowMsg).not.toBe(optMsg);
    expect(typeof highMsg).toBe("string");
  });
});
