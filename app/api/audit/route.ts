// ============================================================
// API: POST /api/audit — Save audit to Supabase, return UUID
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateAISummary } from "@/lib/anthropic";
import { SaveAuditPayload } from "@/types/audit";

export async function POST(request: Request) {
  try {
    const body: SaveAuditPayload = await request.json();
    const { auditInput, auditResult } = body;

    // Generate AI summary (with fallback)
    const fullAudit = { ...auditResult, input: auditInput, createdAt: new Date().toISOString() };
    const aiSummary = await generateAISummary(fullAudit as any);

    const { data, error } = await supabaseAdmin
      .from("audits")
      .insert({
        tools: auditInput.tools,
        use_case: auditInput.useCase,
        team_size: auditInput.teamSize,
        tool_results: auditResult.toolResults,
        total_monthly_savings: auditResult.totalMonthlySavings,
        total_annual_savings: auditResult.totalAnnualSavings,
        savings_tier: auditResult.savingsTier,
        ai_summary: aiSummary,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[SpendLens] Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save audit" }, { status: 500 });
    }

    return NextResponse.json({ auditId: data.id, aiSummary }, { status: 201 });
  } catch (err) {
    console.error("[SpendLens] /api/audit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
