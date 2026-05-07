"use client";

// ============================================================
// SpendLens — Shareable Audit Page (Client Component)
// Public view: no PII, tools + savings, share CTA
// ============================================================

import { useState } from "react";
import { StoredAudit } from "@/types/audit";
import { TOOL_MAP } from "@/lib/pricing-data";
import { getSavingsTierMessage } from "@/lib/audit-engine";

interface Props {
  audit: StoredAudit;
}

const RECOMMENDATION_LABELS: Record<string, { label: string; chipClass: string }> = {
  downgrade: { label: "Downgrade Plan", chipClass: "chip-amber" },
  switch: { label: "Switch Tool", chipClass: "chip-purple" },
  credits: { label: "Get Credits", chipClass: "chip-blue" },
  optimal: { label: "Optimal", chipClass: "chip-green" },
  "api-switch": { label: "Use API", chipClass: "chip-purple" },
};

export default function SharePageClient({ audit }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const savings = Math.round(audit.total_monthly_savings);
  const annualSavings = Math.round(audit.total_annual_savings);
  const isHighSavings = audit.savings_tier === "high";
  const isOptimal = audit.savings_tier === "low";
  const tierMessage = getSavingsTierMessage(audit.savings_tier);
  const toolCount = audit.tools?.length ?? 0;
  const date = new Date(audit.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <span style={{ fontSize: "22px" }}>🔍</span>
            <span style={{ fontWeight: 700, fontSize: "18px", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Spend<span className="gradient-text">Lens</span>
            </span>
          </a>
          <a href="/" className="btn-primary" id="audit-my-stack-btn" style={{ fontSize: "13px", padding: "8px 16px" }}>
            Audit My Stack →
          </a>
        </div>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Share header */}
        <div className="animate-fade-in" style={{ marginBottom: "28px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
            Shared audit · {date} · {toolCount} tool(s) reviewed
          </div>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "12px" }}>
            {isOptimal
              ? "This team's AI stack is already lean"
              : savings > 0
              ? `Found $${savings.toLocaleString()}/mo in AI savings`
              : "AI Spend Audit Results"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>{tierMessage}</p>
        </div>

        {/* Savings hero */}
        {!isOptimal && savings > 0 && (
          <div className="savings-hero animate-fade-in" style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              Potential Monthly Savings
            </div>
            <div className="savings-amount">${savings.toLocaleString()}</div>
            <div style={{ fontSize: "18px", color: "var(--text-secondary)", marginTop: "8px" }}>
              ${annualSavings.toLocaleString()}/year
            </div>
          </div>
        )}

        {/* AI Summary */}
        {audit.ai_summary && (
          <div className="glass-card animate-fade-in-delay" style={{ padding: "24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span>✨</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-purple)", textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Analysis</span>
            </div>
            <p style={{ fontSize: "15px", lineHeight: "1.7", color: "var(--text-secondary)" }}>{audit.ai_summary}</p>
          </div>
        )}

        {/* Per-tool results */}
        <div className="animate-fade-in-delay-2">
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
            Per-tool breakdown
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
            {(audit.tool_results ?? [])
              .sort((a: any, b: any) => (b.monthlySavings ?? 0) - (a.monthlySavings ?? 0))
              .map((result: any) => {
                const rec = RECOMMENDATION_LABELS[result.recommendation] ?? { label: result.recommendation, chipClass: "chip-blue" };
                const hasSavings = (result.monthlySavings ?? 0) > 0;
                return (
                  <div key={result.toolId} className={`tool-result-card ${hasSavings ? "has-savings" : "optimal"}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "2px" }}>{result.toolName}</h3>
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{result.currentPlan}</span>
                      </div>
                      <span className={`chip ${rec.chipClass}`}>{rec.label}</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: hasSavings ? "8px" : 0 }}>
                      {result.reasoning}
                    </p>
                    {hasSavings && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Saves</span>
                        <span style={{ fontWeight: 700, color: "var(--accent-green)" }}>
                          ${(result.monthlySavings ?? 0).toFixed(0)}/mo
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          (${((result.annualSavings ?? 0)).toFixed(0)}/yr)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Credex CTA */}
        {isHighSavings && (
          <div style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(14,165,233,0.1))",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "16px",
            padding: "28px",
            marginBottom: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-purple)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                💡 Credex can help
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "6px" }}>
                Get these tools at 20–40% less through Credex credits
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "400px", lineHeight: "1.6" }}>
                Credex sources real AI credits from companies that overforecast. No plan change needed — same tools, less cost.
              </p>
            </div>
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="btn-primary" id="credex-share-cta">
              Learn More →
            </a>
          </div>
        )}

        {/* CTA to run own audit */}
        <div className="glass-card" style={{ padding: "32px", textAlign: "center" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
            How does your AI stack compare?
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
            Run your own free audit in 2 minutes. No login required.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/" className="btn-primary" id="run-own-audit-btn">
              🔍 Audit My Stack — Free
            </a>
            <button className="btn-secondary" onClick={handleShare} id="copy-share-link-btn">
              {copied ? "✓ Copied!" : "🔗 Copy Share Link"}
            </button>
          </div>
        </div>

        <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", marginTop: "24px", lineHeight: "1.6" }}>
          Company and personal details are excluded from this shared view. Pricing data sourced from official vendor pages.
        </p>
      </div>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 20px", textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          © 2025 SpendLens · Built by{" "}
          <a href="https://credex.rocks" style={{ color: "var(--accent-purple)", textDecoration: "none" }}>
            Credex
          </a>
        </p>
      </footer>
    </div>
  );
}
