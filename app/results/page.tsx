"use client";

// ============================================================
// SpendLens — Audit Results Page
// Shows full per-tool breakdown, hero savings, email gate, share URL
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuditResult, RecommendationType, ToolAuditResult } from "@/types/audit";
import { getSavingsTierMessage } from "@/lib/audit-engine";

const RESULT_KEY = "spendlens_result_v1";

const RECOMMENDATION_LABELS: Record<RecommendationType, { label: string; chipClass: string }> = {
  downgrade: { label: "Downgrade Plan", chipClass: "chip-amber" },
  switch: { label: "Switch Tool", chipClass: "chip-purple" },
  credits: { label: "Get Credits", chipClass: "chip-blue" },
  optimal: { label: "Optimal", chipClass: "chip-green" },
  "api-switch": { label: "Use API", chipClass: "chip-purple" },
};

function AnimatedCounter({ value, prefix = "$", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const step = 16;
    const increment = value / (duration / step);
    ref.current = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        if (ref.current) clearInterval(ref.current);
      } else {
        setDisplay(Math.floor(start));
      }
    }, step);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [value]);

  return <>{prefix}{display.toLocaleString()}{suffix}</>;
}

function ToolResultCard({ result }: { result: ToolAuditResult }) {
  const rec = RECOMMENDATION_LABELS[result.recommendation];
  const hasSavings = result.monthlySavings > 0;

  return (
    <div className={`tool-result-card ${hasSavings ? "has-savings" : "optimal"}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>{result.toolName}</h3>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{result.currentPlan}</span>
        </div>
        <span className={`chip ${rec.chipClass}`}>{rec.label}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", minWidth: "80px" }}>Current</span>
            <span style={{ fontWeight: 600 }}>${result.currentMonthlySpend.toFixed(0)}/mo</span>
          </div>
          {result.recommendation !== "optimal" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", minWidth: "80px" }}>Projected</span>
              <span style={{ fontWeight: 600, color: "var(--accent-green)" }}>
                ${result.projectedMonthlySpend.toFixed(0)}/mo
                {result.recommendedPlan && <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "6px" }}>({result.recommendedPlan})</span>}
                {result.recommendedTool && <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "6px" }}>({result.recommendedTool})</span>}
              </span>
            </div>
          )}
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", marginTop: "4px" }}>
            {result.reasoning}
          </p>
        </div>
        {hasSavings && (
          <div style={{ textAlign: "right", minWidth: "90px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>SAVES</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent-green)", lineHeight: 1 }}>
              ${result.monthlySavings.toFixed(0)}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>/mo</div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeadCaptureModal({
  onClose,
  auditId,
  onSuccess,
}: {
  onClose: () => void;
  auditId: string | null;
  onSuccess: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState(""); // must stay empty
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!auditId) { onSuccess(email); return; }
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, email, companyName: company, role, honeypot }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      onSuccess(email);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content">
        <button onClick={onClose} aria-label="Close modal" style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "20px" }}>×</button>
        <div style={{ marginBottom: "24px" }}>
          <h2 id="modal-title" style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
            Get your full report
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            We&apos;ll email you a permanent link to this audit. High-savings cases get a personal Credex follow-up.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Honeypot — hidden from real users */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            style={{ display: "none" }}
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            aria-hidden="true"
          />

          <div style={{ marginBottom: "14px" }}>
            <label className="form-label" htmlFor="lead-email">Work email *</label>
            <input
              id="lead-email"
              type="email"
              className="form-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <div>
              <label className="form-label" htmlFor="lead-company">Company (optional)</label>
              <input id="lead-company" type="text" className="form-input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc" />
            </div>
            <div>
              <label className="form-label" htmlFor="lead-role">Your role (optional)</label>
              <input id="lead-role" type="text" className="form-input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="CTO" />
            </div>
          </div>

          {error && <p style={{ color: "var(--accent-red)", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading} id="submit-lead" style={{ width: "100%" }}>
            {loading ? "Sending…" : "📧 Email Me the Report"}
          </button>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", marginTop: "10px" }}>
            No spam. Unsubscribe any time.
          </p>
        </form>
      </div>
    </div>
  );
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="toast">✓ {message}</div>;
}

export default function ResultsPage() {
  const router = useRouter();
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(RESULT_KEY);
      if (!saved) { router.push("/"); return; }
      const { result } = JSON.parse(saved);
      setAuditResult(result);
      const id = sessionStorage.getItem("spendlens_audit_id");
      if (id) setAuditId(id);
    } catch {
      router.push("/");
    }
  }, [router]);

  const handleShare = () => {
    if (auditId) {
      const url = `${window.location.origin}/audit/${auditId}`;
      navigator.clipboard.writeText(url).then(() => setToast("Share link copied!"));
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => setToast("Link copied!"));
    }
  };

  const handleEmailSuccess = (email: string) => {
    setShowModal(false);
    setEmailCaptured(true);
    setToast(`Report sent to ${email}`);
  };

  if (!auditResult) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
          <p style={{ color: "var(--text-secondary)" }}>Loading your audit…</p>
        </div>
      </div>
    );
  }

  const { toolResults, totalMonthlySavings, totalAnnualSavings, savingsTier, aiSummary } = auditResult;
  const isHighSavings = savingsTier === "high";
  const isOptimal = savingsTier === "low";
  const tierMessage = getSavingsTierMessage(savingsTier);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <span style={{ fontSize: "22px" }}>🔍</span>
            <span style={{ fontWeight: 700, fontSize: "18px", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Spend<span className="gradient-text">Lens</span>
            </span>
          </Link>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-secondary" onClick={handleShare} id="share-btn" style={{ fontSize: "13px", padding: "8px 16px" }}>
              🔗 Share
            </button>
            {!emailCaptured && (
              <button className="btn-primary" onClick={() => setShowModal(true)} id="get-report-btn" style={{ fontSize: "13px", padding: "8px 16px" }}>
                📧 Get Full Report
              </button>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Hero savings block */}
        <div className="savings-hero animate-fade-in">
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
            {isOptimal ? "✓ You're spending well" : "💰 Potential Monthly Savings"}
          </div>
          {!isOptimal ? (
            <>
              <div className="savings-amount">
                <AnimatedCounter value={totalMonthlySavings} />
              </div>
              <div style={{ fontSize: "18px", color: "var(--text-secondary)", marginTop: "8px" }}>
                <AnimatedCounter value={totalAnnualSavings} suffix="/year" />
              </div>
            </>
          ) : (
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--accent-green)", marginTop: "8px" }}>
              No significant overspend detected
            </div>
          )}
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginTop: "16px", maxWidth: "500px", margin: "16px auto 0" }}>
            {tierMessage}
          </p>
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <div className="glass-card animate-fade-in-delay" style={{ padding: "24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "16px" }}>✨</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-purple)", textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Analysis</span>
            </div>
            <p style={{ fontSize: "15px", lineHeight: "1.7", color: "var(--text-secondary)" }}>{aiSummary}</p>
          </div>
        )}

        {/* Credex CTA for high savings */}
        {isHighSavings && (
          <div className="animate-fade-in-delay" style={{
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
                Capture more of this savings with discounted AI credits
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "400px", lineHeight: "1.6" }}>
                Credex sources real AI infrastructure credits from companies that overforecast. Typical savings: 20–40% on your current tools, no plan change needed.
              </p>
            </div>
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="btn-primary" id="credex-cta-btn">
              Book a Consultation →
            </a>
          </div>
        )}

        {/* Per-tool breakdown */}
        <div className="animate-fade-in-delay-2">
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
            Per-tool breakdown
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {toolResults
              .sort((a, b) => b.monthlySavings - a.monthlySavings)
              .map((result) => (
                <ToolResultCard key={result.toolId} result={result} />
              ))}
          </div>
        </div>

        {/* Optimal spend CTA */}
        {isOptimal && (
          <div style={{ marginTop: "24px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", padding: "20px 24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>🎯 Your stack looks lean</h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "12px" }}>
              Want to be notified when new optimizations apply to your stack? We&apos;ll ping you when better deals emerge for your tools.
            </p>
            {!emailCaptured && (
              <button className="btn-secondary" onClick={() => setShowModal(true)} id="notify-me-btn" style={{ fontSize: "13px" }}>
                Notify me of new deals →
              </button>
            )}
          </div>
        )}

        {/* Bottom CTA row */}
        <div style={{ marginTop: "36px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-secondary" onClick={handleShare} id="share-bottom-btn">
            🔗 Share this audit
          </button>
          {!emailCaptured && (
            <button className="btn-primary" onClick={() => setShowModal(true)} id="email-report-btn">
              📧 Email me the full report
            </button>
          )}
          <Link href="/" className="btn-secondary" id="new-audit-btn">
            ↩ New audit
          </Link>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", marginTop: "24px", lineHeight: "1.6" }}>
          Pricing data sourced from official vendor pages. Savings estimates are projections based on public pricing. Actual savings may vary.
        </p>
      </div>

      {showModal && (
        <LeadCaptureModal
          onClose={() => setShowModal(false)}
          auditId={auditId}
          onSuccess={handleEmailSuccess}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
