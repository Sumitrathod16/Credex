// ============================================================
// SpendLens — Resend Email Helper
// Transactional email for audit lead confirmation
// ============================================================

import { Resend } from "resend";
import { AuditResult } from "@/types/audit";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@spendlens.credex.rocks";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://spendlens.vercel.app";

export async function sendAuditConfirmationEmail(
  email: string,
  auditId: string,
  audit: AuditResult,
  companyName?: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[SpendLens] RESEND_API_KEY not set — skipping email");
    return;
  }

  const auditUrl = `${APP_URL}/audit/${auditId}`;
  const isHighSavings = audit.savingsTier === "high";
  const greeting = companyName ? `Hi ${companyName} team,` : "Hi there,";

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #6366f1, #0ea5e9); padding: 32px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 24px;">Your AI Spend Audit</h1>
      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">SpendLens by Credex</p>
    </div>
    <div style="padding: 32px;">
      <p style="margin: 0 0 16px;">${greeting}</p>
      <p style="margin: 0 0 24px;">Your audit is ready. Here's the summary:</p>
      
      <div style="background: #0f172a; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <p style="margin: 0 0 4px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Potential Monthly Savings</p>
        <p style="margin: 0; font-size: 40px; font-weight: 700; color: #10b981;">$${audit.totalMonthlySavings.toFixed(0)}</p>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">$${audit.totalAnnualSavings.toFixed(0)}/year</p>
      </div>

      ${audit.aiSummary ? `<p style="margin: 0 0 24px; line-height: 1.6; color: #cbd5e1;">${audit.aiSummary}</p>` : ""}

      <a href="${auditUrl}" style="display: block; background: linear-gradient(135deg, #6366f1, #0ea5e9); color: white; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 8px; font-weight: 600; margin-bottom: 24px;">
        View Full Audit Report →
      </a>

      ${isHighSavings ? `
      <div style="background: #1a1f35; border: 1px solid #6366f1; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #818cf8;">💡 You qualify for a Credex consultation</p>
        <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">With potential savings of $${audit.totalMonthlySavings.toFixed(0)}/month, you could benefit from Credex's sourced AI credits — the same tools at 20–40% less. A team member will reach out within 2 business days.</p>
      </div>` : ""}

      <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6;">
        Share your audit: <a href="${auditUrl}" style="color: #6366f1;">${auditUrl}</a><br>
        (Company and personal details are stripped from the shared view.)
      </p>
    </div>
    <div style="padding: 20px 32px; border-top: 1px solid #1e293b; text-align: center;">
      <p style="margin: 0; color: #475569; font-size: 12px;">SpendLens by Credex · <a href="https://credex.rocks" style="color: #6366f1;">credex.rocks</a></p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your AI Spend Audit — $${audit.totalMonthlySavings.toFixed(0)}/mo savings found`,
    html: htmlBody,
  });
}
