import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SpendLens — Free AI Spend Audit for Startups",
  description:
    "Find out if you're overspending on AI tools. Enter your stack in 2 minutes and get an instant audit showing exact savings — free, no login required.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://spendlens.vercel.app"
  ),
  openGraph: {
    title: "SpendLens — Free AI Spend Audit",
    description:
      "How much are you overspending on Cursor, Claude, ChatGPT? Find out in 2 minutes.",
    type: "website",
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens — Free AI Spend Audit",
    description:
      "How much are you overspending on Cursor, Claude, ChatGPT? Find out in 2 minutes.",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} style={{ colorScheme: "light" }}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
