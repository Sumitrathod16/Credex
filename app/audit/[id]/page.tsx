// ============================================================
// SpendLens — Shareable Public Audit Page /audit/[id]
// Strips PII, shows tools + savings, with OG meta tags
// ============================================================

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { StoredAudit } from "@/types/audit";
import SharePageClient from "./SharePageClient";

interface Props {
  params: Promise<{ id: string }>;
}

async function getAudit(id: string): Promise<StoredAudit | null> {
  try {
    const { data, error } = await supabase
      .from("audits")
      .select("id, tools, use_case, team_size, tool_results, total_monthly_savings, total_annual_savings, savings_tier, ai_summary, created_at")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return data as StoredAudit;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) {
    return {
      title: "Audit Not Found — SpendLens",
    };
  }

  const savings = Math.round(audit.total_monthly_savings);
  const toolCount = audit.tools?.length ?? 0;
  const title = savings > 0
    ? `I found $${savings}/mo in AI tool savings — SpendLens`
    : `My AI Stack Audit — SpendLens`;
  const description = audit.ai_summary?.slice(0, 155) ??
    `Free AI spend audit across ${toolCount} tool(s). Find out if you're overspending on Cursor, Claude, ChatGPT, and more.`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://spendlens.vercel.app";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${appUrl}/audit/${id}`,
      images: [`${appUrl}/og-default.png`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${appUrl}/og-default.png`],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) notFound();
  return <SharePageClient audit={audit} />;
}
