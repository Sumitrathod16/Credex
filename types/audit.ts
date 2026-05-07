// ============================================================
// SpendLens — Shared TypeScript Types
// ============================================================

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolId =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf";

// ---- Plan IDs per tool ----
export type CursorPlan = "hobby" | "pro" | "business" | "enterprise";
export type CopilotPlan = "individual" | "business" | "enterprise";
export type ClaudePlan = "free" | "pro" | "max" | "team" | "enterprise" | "api";
export type ChatGPTPlan = "plus" | "team" | "enterprise" | "api";
export type AnthropicApiPlan = "api";
export type OpenAiApiPlan = "api";
export type GeminiPlan = "free" | "pro" | "ultra" | "api";
export type WindsurfPlan = "free" | "pro" | "teams";

export type AnyPlan =
  | CursorPlan
  | CopilotPlan
  | ClaudePlan
  | ChatGPTPlan
  | AnthropicApiPlan
  | OpenAiApiPlan
  | GeminiPlan
  | WindsurfPlan;

// ---- Input ----
export interface ToolEntry {
  toolId: ToolId;
  plan: AnyPlan;
  seats: number;
  monthlySpend: number; // actual dollars paid
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

// ---- Output ----
export type RecommendationType =
  | "downgrade"
  | "switch"
  | "credits"
  | "optimal"
  | "api-switch";

export interface ToolAuditResult {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentMonthlySpend: number;
  recommendation: RecommendationType;
  recommendedPlan?: string;
  recommendedTool?: string;
  projectedMonthlySpend: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string;
}

export interface AuditResult {
  input: AuditInput;
  toolResults: ToolAuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsTier: "high" | "low" | "optimal"; // high > $500/mo, low < $100/mo
  aiSummary?: string;
  createdAt: string;
}

// ---- Stored in DB ----
export interface StoredAudit {
  id: string;
  tools: ToolEntry[];
  use_case: UseCase;
  team_size: number;
  tool_results: ToolAuditResult[];
  total_monthly_savings: number;
  total_annual_savings: number;
  savings_tier: "high" | "low" | "optimal";
  ai_summary: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  audit_id: string;
  email: string;
  company_name?: string;
  role?: string;
  team_size?: number;
  created_at: string;
}

// ---- API Payloads ----
export interface SaveAuditPayload {
  auditInput: AuditInput;
  auditResult: Omit<AuditResult, "input" | "createdAt">;
}

export interface SaveLeadPayload {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  honeypot?: string; // must be empty
}

export interface GenerateSummaryPayload {
  auditResult: AuditResult;
}
