// ============================================================
// API: POST /api/lead — Save lead, send confirmation email
// Rate limiting via IP check + honeypot
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendAuditConfirmationEmail } from "@/lib/resend";
import { SaveLeadPayload } from "@/types/audit";

// Simple in-memory rate limit (per process — use Upstash in production at scale)
const ipTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipTimestamps.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  ipTimestamps.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
  // Rate limit by IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body: SaveLeadPayload = await request.json();

    // Honeypot — bots fill hidden fields, humans don't
    if (body.honeypot) {
      // Silently accept but don't store
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Fetch the audit to include in email
    const { data: auditData } = await supabaseAdmin
      .from("audits")
      .select("*")
      .eq("id", body.auditId)
      .single();

    // Save lead
    const { error: leadError } = await supabaseAdmin.from("leads").insert({
      audit_id: body.auditId,
      email,
      company_name: body.companyName,
      role: body.role,
      team_size: body.teamSize,
    });

    if (leadError) {
      console.error("[SpendLens] Lead insert error:", leadError);
      return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
    }

    // Send confirmation email (non-blocking on failure)
    if (auditData) {
      try {
        const auditResult = {
          input: {
            tools: auditData.tools,
            useCase: auditData.use_case,
            teamSize: auditData.team_size,
          },
          toolResults: auditData.tool_results,
          totalMonthlySavings: auditData.total_monthly_savings,
          totalAnnualSavings: auditData.total_annual_savings,
          savingsTier: auditData.savings_tier,
          aiSummary: auditData.ai_summary,
          createdAt: auditData.created_at,
        };
        await sendAuditConfirmationEmail(
          email,
          body.auditId,
          auditResult as any,
          body.companyName
        );
      } catch (emailErr) {
        console.error("[SpendLens] Email send error (non-fatal):", emailErr);
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[SpendLens] /api/lead error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
