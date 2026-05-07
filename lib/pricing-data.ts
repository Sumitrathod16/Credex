// ============================================================
// SpendLens — Pricing Data
// All prices verified from official vendor pages — see PRICING_DATA.md
// Last verified: 2026-05-07
// ============================================================

import { ToolId } from "@/types/audit";

export interface PlanPrice {
  id: string;
  label: string;
  pricePerSeat: number; // USD / seat / month (0 = free, -1 = usage-based/custom)
  minSeats: number;
  maxSeats?: number; // undefined = unlimited
  isUsageBased?: boolean; // true for API plans
  notes?: string;
}

export interface ToolMeta {
  id: ToolId;
  name: string;
  category: "coding" | "writing" | "general" | "api";
  plans: PlanPrice[];
}

export const TOOLS: ToolMeta[] = [
  {
    id: "cursor",
    name: "Cursor",
    category: "coding",
    plans: [
      { id: "hobby", label: "Hobby", pricePerSeat: 0, minSeats: 1 },
      { id: "pro", label: "Pro", pricePerSeat: 20, minSeats: 1 },
      { id: "business", label: "Business", pricePerSeat: 40, minSeats: 1 },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeat: -1,
        minSeats: 20,
        notes: "Custom pricing",
      },
    ],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    category: "coding",
    plans: [
      { id: "individual", label: "Individual", pricePerSeat: 10, minSeats: 1 },
      { id: "business", label: "Business", pricePerSeat: 19, minSeats: 1 },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeat: 39,
        minSeats: 1,
      },
    ],
  },
  {
    id: "claude",
    name: "Claude (Anthropic)",
    category: "general",
    plans: [
      { id: "free", label: "Free", pricePerSeat: 0, minSeats: 1 },
      { id: "pro", label: "Pro", pricePerSeat: 20, minSeats: 1, maxSeats: 1, notes: "Single user only" },
      { id: "max", label: "Max", pricePerSeat: 100, minSeats: 1, maxSeats: 1, notes: "Single user, 5x usage" },
      { id: "team", label: "Team", pricePerSeat: 30, minSeats: 5, notes: "Min 5 seats" },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeat: -1,
        minSeats: 1,
        notes: "Custom pricing",
      },
      {
        id: "api",
        label: "API Direct",
        pricePerSeat: -1,
        minSeats: 1,
        isUsageBased: true,
        notes: "Pay per token",
      },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT (OpenAI)",
    category: "general",
    plans: [
      { id: "plus", label: "Plus", pricePerSeat: 20, minSeats: 1, maxSeats: 1, notes: "Single user" },
      { id: "team", label: "Team", pricePerSeat: 30, minSeats: 2, notes: "Min 2 seats; billed annually $25/seat" },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeat: -1,
        minSeats: 1,
        notes: "Custom pricing",
      },
      {
        id: "api",
        label: "API Direct",
        pricePerSeat: -1,
        minSeats: 1,
        isUsageBased: true,
        notes: "Pay per token",
      },
    ],
  },
  {
    id: "anthropic-api",
    name: "Anthropic API",
    category: "api",
    plans: [
      {
        id: "api",
        label: "API",
        pricePerSeat: -1,
        minSeats: 1,
        isUsageBased: true,
        notes: "Pay per token. claude-3-5-sonnet: $3/$15 per M tokens in/out",
      },
    ],
  },
  {
    id: "openai-api",
    name: "OpenAI API",
    category: "api",
    plans: [
      {
        id: "api",
        label: "API",
        pricePerSeat: -1,
        minSeats: 1,
        isUsageBased: true,
        notes: "Pay per token. gpt-4o: $2.50/$10 per M tokens in/out",
      },
    ],
  },
  {
    id: "gemini",
    name: "Gemini (Google)",
    category: "general",
    plans: [
      { id: "free", label: "Free", pricePerSeat: 0, minSeats: 1 },
      { id: "pro", label: "Google One AI Premium", pricePerSeat: 19.99, minSeats: 1 },
      {
        id: "ultra",
        label: "Gemini for Workspace",
        pricePerSeat: 30,
        minSeats: 1,
        notes: "$30/user/month add-on to Google Workspace",
      },
      {
        id: "api",
        label: "API",
        pricePerSeat: -1,
        minSeats: 1,
        isUsageBased: true,
        notes: "Pay per token. Gemini 2.0 Flash: $0.10/$0.40 per M tokens",
      },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    category: "coding",
    plans: [
      { id: "free", label: "Free", pricePerSeat: 0, minSeats: 1 },
      { id: "pro", label: "Pro", pricePerSeat: 15, minSeats: 1 },
      { id: "teams", label: "Teams", pricePerSeat: 35, minSeats: 1 },
    ],
  },
];

export const TOOL_MAP: Record<ToolId, ToolMeta> = TOOLS.reduce(
  (acc, tool) => ({ ...acc, [tool.id]: tool }),
  {} as Record<ToolId, ToolMeta>
);

export function getPlanPrice(toolId: ToolId, planId: string): PlanPrice | undefined {
  return TOOL_MAP[toolId]?.plans.find((p) => p.id === planId);
}

export function getCheaperPlans(toolId: ToolId, currentPlanId: string, seats: number): PlanPrice[] {
  const tool = TOOL_MAP[toolId];
  if (!tool) return [];
  const currentPlan = getPlanPrice(toolId, currentPlanId);
  if (!currentPlan) return [];
  return tool.plans.filter(
    (p) =>
      p.id !== currentPlanId &&
      p.pricePerSeat >= 0 &&
      p.pricePerSeat < currentPlan.pricePerSeat &&
      p.minSeats <= seats &&
      (p.maxSeats === undefined || p.maxSeats >= seats)
  );
}

// Coding alternatives by monthly cost per seat (ascending)
export const CODING_ALTERNATIVES: { toolId: ToolId; plan: string; pricePerSeat: number; label: string }[] = [
  { toolId: "windsurf", plan: "free", pricePerSeat: 0, label: "Windsurf Free" },
  { toolId: "github-copilot", plan: "individual", pricePerSeat: 10, label: "GitHub Copilot Individual" },
  { toolId: "windsurf", plan: "pro", pricePerSeat: 15, label: "Windsurf Pro" },
  { toolId: "github-copilot", plan: "business", pricePerSeat: 19, label: "GitHub Copilot Business" },
  { toolId: "cursor", plan: "pro", pricePerSeat: 20, label: "Cursor Pro" },
  { toolId: "cursor", plan: "business", pricePerSeat: 40, label: "Cursor Business" },
];
