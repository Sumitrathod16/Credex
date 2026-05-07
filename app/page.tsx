"use client";

// ============================================================
// SpendLens — Landing Page + Spend Input Form
// Multi-step form with localStorage persistence
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { runAudit } from "@/lib/audit-engine";
import { TOOLS } from "@/lib/pricing-data";
import { AuditInput, AuditResult, ToolEntry, ToolId, UseCase } from "@/types/audit";

const STORAGE_KEY = "spendlens_form_v1";
const RESULT_KEY = "spendlens_result_v1";

const USE_CASES: { value: UseCase; label: string; icon: string }[] = [
  { value: "coding", label: "Software Development", icon: "💻" },
  { value: "writing", label: "Content & Writing", icon: "✍️" },
  { value: "data", label: "Data & Analytics", icon: "📊" },
  { value: "research", label: "Research", icon: "🔬" },
  { value: "mixed", label: "Mixed / General", icon: "⚡" },
];

const DEFAULT_TOOL_ENTRY = (toolId: ToolId): ToolEntry => ({
  toolId,
  plan: TOOLS.find((t) => t.id === toolId)?.plans[0]?.id as any ?? "free",
  seats: 1,
  monthlySpend: 0,
});

function Navbar() {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-inner">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px" }}>🔍</span>
          <span style={{ fontWeight: 700, fontSize: "18px", letterSpacing: "-0.02em" }}>
            Spend<span className="gradient-text">Lens</span>
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", padding: "2px 8px", borderRadius: "4px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", fontWeight: 600, letterSpacing: "0.05em" }}>BETA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>by</span>
          <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "var(--accent-purple)", fontWeight: 600, textDecoration: "none" }}>
            credex.rocks
          </a>
        </div>
      </div>
    </nav>
  );
}

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
          Step {step} of {total}
        </span>
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {step === 1 ? "Add your AI tools" : step === 2 ? "Team context" : "Ready to audit"}
        </span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  );
}

function ToolRow({
  entry,
  onUpdate,
  onRemove,
}: {
  entry: ToolEntry;
  onUpdate: (e: ToolEntry) => void;
  onRemove: () => void;
}) {
  const tool = TOOLS.find((t) => t.id === entry.toolId);
  if (!tool) return null;

  return (
    <div className="tool-result-card" style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <span style={{ fontWeight: 600, fontSize: "15px" }}>{tool.name}</span>
        <button
          onClick={onRemove}
          aria-label={`Remove ${tool.name}`}
          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "18px", lineHeight: 1, padding: "4px" }}
        >
          ×
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 140px", gap: "10px" }}>
        <div>
          <label className="form-label" htmlFor={`plan-${entry.toolId}`}>Plan</label>
          <select
            id={`plan-${entry.toolId}`}
            className="form-select"
            value={entry.plan}
            onChange={(e) => onUpdate({ ...entry, plan: e.target.value as any })}
          >
            {tool.plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}{p.pricePerSeat > 0 ? ` — $${p.pricePerSeat}/seat` : p.isUsageBased ? " — Usage" : " — Free"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label" htmlFor={`seats-${entry.toolId}`}>Seats</label>
          <input
            id={`seats-${entry.toolId}`}
            type="number"
            className="form-input"
            min={1}
            max={10000}
            value={entry.seats}
            onChange={(e) => onUpdate({ ...entry, seats: Math.max(1, parseInt(e.target.value) || 1) })}
          />
        </div>
        <div>
          <label className="form-label" htmlFor={`spend-${entry.toolId}`}>Monthly Spend ($)</label>
          <input
            id={`spend-${entry.toolId}`}
            type="number"
            className="form-input"
            min={0}
            step={1}
            placeholder="0"
            value={entry.monthlySpend || ""}
            onChange={(e) => onUpdate({ ...entry, monthlySpend: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedTools, setSelectedTools] = useState<ToolEntry[]>([]);
  const [teamSize, setTeamSize] = useState(5);
  const [useCase, setUseCase] = useState<UseCase>("coding");
  const [loading, setLoading] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tools) setSelectedTools(parsed.tools);
        if (parsed.teamSize) setTeamSize(parsed.teamSize);
        if (parsed.useCase) setUseCase(parsed.useCase);
        if (parsed.step && parsed.step > 1) setStep(parsed.step);
      }
    } catch {}
  }, []);

  // Persist to localStorage on every change
  const persist = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tools: selectedTools, teamSize, useCase, step }));
    } catch {}
  }, [selectedTools, teamSize, useCase, step]);

  useEffect(() => { persist(); }, [persist]);

  const addTool = (toolId: ToolId) => {
    if (selectedTools.some((t) => t.toolId === toolId)) return;
    setSelectedTools((prev) => [...prev, DEFAULT_TOOL_ENTRY(toolId)]);
  };

  const updateTool = (index: number, updated: ToolEntry) => {
    setSelectedTools((prev) => prev.map((t, i) => (i === index ? updated : t)));
  };

  const removeTool = (index: number) => {
    setSelectedTools((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRunAudit = async () => {
    if (selectedTools.length === 0) return;
    setLoading(true);
    try {
      const input: AuditInput = { tools: selectedTools, teamSize, useCase };
      const result: AuditResult = runAudit(input);

      // Save to sessionStorage for results page
      sessionStorage.setItem(RESULT_KEY, JSON.stringify({ input, result }));

      // Save to Supabase (async — don't block navigation)
      try {
        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auditInput: input,
            auditResult: {
              toolResults: result.toolResults,
              totalMonthlySavings: result.totalMonthlySavings,
              totalAnnualSavings: result.totalAnnualSavings,
              savingsTier: result.savingsTier,
            },
          }),
        });
        const data = await res.json();
        if (data.auditId) {
          sessionStorage.setItem("spendlens_audit_id", data.auditId);
          if (data.aiSummary) {
            const existing = JSON.parse(sessionStorage.getItem(RESULT_KEY) || "{}");
            existing.result = { ...existing.result, aiSummary: data.aiSummary };
            sessionStorage.setItem(RESULT_KEY, JSON.stringify(existing));
          }
        }
      } catch (apiErr) {
        console.error("API save failed (non-fatal):", apiErr);
      }

      router.push("/results");
    } catch (err) {
      console.error("Audit failed:", err);
      setLoading(false);
    }
  };

  const availableTools = TOOLS.filter(
    (t) => !selectedTools.some((s) => s.toolId === t.id)
  );

  const totalSpend = selectedTools.reduce((s, t) => s + t.monthlySpend, 0);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="animate-fade-in">
          <div className="hero-eyebrow">
            ✦ Free AI Spend Audit
          </div>
        </div>
        <div className="animate-fade-in-delay">
          <h1>
            Are you <span className="gradient-text">overpaying</span>
            <br />for AI tools?
          </h1>
          <p>
            Enter your AI stack in 2 minutes. Get an instant audit showing exactly where you're
            overspending and what to do about it — no account required.
          </p>
        </div>
        <div className="animate-fade-in-delay-2" style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "16px", flexWrap: "wrap" }}>
          {[
            { label: "Free forever", icon: "✓" },
            { label: "No login required", icon: "✓" },
            { label: "Results in 60 seconds", icon: "✓" },
          ].map((item) => (
            <span key={item.label} style={{ fontSize: "14px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>{item.icon}</span>
              {item.label}
            </span>
          ))}
        </div>
      </section>

      {/* Form */}
      <section style={{ padding: "0 20px 80px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div className="glass-card" style={{ padding: "36px" }}>
            <StepIndicator step={step} total={3} />

            {/* Step 1: Add tools */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>
                  Which AI tools does your team use?
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
                  Add each tool and enter your actual monthly spend.
                </p>

                {selectedTools.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    {selectedTools.map((entry, idx) => (
                      <ToolRow
                        key={entry.toolId}
                        entry={entry}
                        onUpdate={(updated) => updateTool(idx, updated)}
                        onRemove={() => removeTool(idx)}
                      />
                    ))}
                    <div style={{ textAlign: "right", fontSize: "14px", color: "var(--text-secondary)", marginTop: "8px" }}>
                      Total tracked spend:{" "}
                      <strong style={{ color: "var(--text-primary)" }}>${totalSpend.toFixed(0)}/mo</strong>
                    </div>
                  </div>
                )}

                {availableTools.length > 0 && (
                  <div>
                    <p className="form-label" style={{ marginBottom: "10px" }}>
                      {selectedTools.length === 0 ? "Select your tools:" : "Add more tools:"}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {availableTools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => addTool(tool.id as ToolId)}
                          style={{
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 500,
                            padding: "8px 14px",
                            transition: "border-color 0.2s, background 0.2s",
                          }}
                          onMouseOver={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-purple)";
                            (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-card-hover)";
                          }}
                          onMouseOut={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                            (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-secondary)";
                          }}
                        >
                          + {tool.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTools.length === 0 && availableTools.length === 0 && (
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", padding: "20px 0" }}>
                    All available tools added!
                  </p>
                )}

                <div style={{ marginTop: "28px", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="btn-primary"
                    onClick={() => setStep(2)}
                    disabled={selectedTools.length === 0}
                    id="step1-continue"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Team context */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>
                  Tell us about your team
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
                  This helps us calibrate recommendations to your actual usage pattern.
                </p>

                <div style={{ marginBottom: "20px" }}>
                  <label className="form-label" htmlFor="team-size">Total team size</label>
                  <input
                    id="team-size"
                    type="number"
                    className="form-input"
                    min={1}
                    max={10000}
                    value={teamSize}
                    onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ maxWidth: "160px" }}
                  />
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    People in total (not just AI tool users)
                  </p>
                </div>

                <div style={{ marginBottom: "28px" }}>
                  <p className="form-label" style={{ marginBottom: "10px" }}>Primary use case</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                    {USE_CASES.map((uc) => (
                      <button
                        key={uc.value}
                        id={`usecase-${uc.value}`}
                        onClick={() => setUseCase(uc.value)}
                        style={{
                          background: useCase === uc.value ? "rgba(99,102,241,0.15)" : "var(--bg-secondary)",
                          border: `1px solid ${useCase === uc.value ? "var(--accent-purple)" : "var(--border)"}`,
                          borderRadius: "10px",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          padding: "14px",
                          textAlign: "left",
                          transition: "all 0.2s",
                          fontFamily: "inherit",
                        }}
                      >
                        <div style={{ fontSize: "22px", marginBottom: "4px" }}>{uc.icon}</div>
                        <div style={{ fontSize: "13px", fontWeight: 500 }}>{uc.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button className="btn-secondary" onClick={() => setStep(1)} id="step2-back">
                    ← Back
                  </button>
                  <button className="btn-primary" onClick={() => setStep(3)} id="step2-continue">
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review + run */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>
                  Ready to audit
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
                  Reviewing <strong>{selectedTools.length} tool(s)</strong> for a team of{" "}
                  <strong>{teamSize}</strong> — primary use case:{" "}
                  <strong>{USE_CASES.find((u) => u.value === useCase)?.label}</strong>
                </p>

                <div style={{ background: "var(--bg-secondary)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    <span>Tool</span>
                    <span>Monthly Spend</span>
                  </div>
                  {selectedTools.map((t) => {
                    const tool = TOOLS.find((tl) => tl.id === t.toolId);
                    return (
                      <div key={t.toolId} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--border)", fontSize: "14px" }}>
                        <span>{tool?.name} — {t.seats} seat(s)</span>
                        <span style={{ fontWeight: 600 }}>${t.monthlySpend}/mo</span>
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: "15px", fontWeight: 700, borderTop: "1px solid rgba(99,102,241,0.2)", marginTop: "4px" }}>
                    <span>Total</span>
                    <span style={{ color: "var(--accent-purple)" }}>${totalSpend.toFixed(0)}/mo</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button className="btn-secondary" onClick={() => setStep(2)} id="step3-back">
                    ← Back
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleRunAudit}
                    disabled={loading}
                    id="run-audit-btn"
                    style={{ minWidth: "160px" }}
                  >
                    {loading ? (
                      <>
                        <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                        Analyzing…
                      </>
                    ) : (
                      "🔍 Run Free Audit"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div style={{ textAlign: "center", marginTop: "24px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            {[
              "🔒 No account needed",
              "📊 Instant results",
              "📧 Email only after value shown",
            ].map((item) => (
              <span key={item} style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof section */}
      <section style={{ borderTop: "1px solid var(--border)", padding: "60px 20px", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
            Built for founders who are tired of guessing
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", maxWidth: "500px", margin: "0 auto 40px" }}>
            Most startups overspend on AI tools because there's no benchmark. SpendLens gives you one, free.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", maxWidth: "700px", margin: "0 auto" }}>
            {[
              { stat: "8", label: "AI tools audited" },
              { stat: "30%", label: "Average savings found" },
              { stat: "2 min", label: "Time to complete" },
            ].map((item) => (
              <div key={item.label} className="glass-card" style={{ padding: "24px" }}>
                <div style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.03em" }} className="gradient-text">{item.stat}</div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 20px", textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          © 2025 SpendLens · Built by{" "}
          <a href="https://credex.rocks" style={{ color: "var(--accent-purple)", textDecoration: "none" }}>
            Credex
          </a>{" "}
          · <a href="mailto:hi@credex.rocks" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Contact</a>
        </p>
      </footer>
    </div>
  );
}
