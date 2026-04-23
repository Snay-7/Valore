import type { Metadata } from "next";
import LandingClient from "../components/LandingClient";

/* ═══════════════════════════════════════════════════════════════════
   VALORA — LANDING PAGE (Server Component)
   Drop at: app/page.tsx
   ───────────────────────────────────────────────────────────────────
   This file exports SEO metadata + JSON-LD structured data and renders
   the interactive LandingClient. Keeping metadata on the server is
   required — "use client" files can't export Next.js metadata.
   ═══════════════════════════════════════════════════════════════════ */

const SITE = "https://valoraplatform.io";
const TITLE = "Valora · Institutional Real Estate AI — Underwriting + Valuation in Seconds";
const DESCRIPTION =
  "Valora is the AI-native platform for institutional real estate. Underwrite any deal or value any property in under 60 seconds — with a real calc engine, jurisdiction-aware defaults, and IC-ready PDF reports. Used by PE funds, family offices, hotel operators, and deal-desk analysts across the UK, US, UAE, Singapore, and Europe.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "institutional real estate",
    "real estate underwriting",
    "property valuation",
    "AI real estate platform",
    "real estate AI copilot",
    "BTR underwriting",
    "hotel USALI",
    "IRR DSCR debt yield",
    "investment committee PDF",
    "development appraisal",
    "cross-border property valuation",
    "real estate SaaS",
    "real estate proptech",
    "comparative market valuation",
    "monte carlo sensitivity",
    "IC ready brochure",
  ],
  authors: [{ name: "Valora" }],
  creator: "Valora",
  publisher: "Valora",
  alternates: { canonical: SITE },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Valora",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: `${SITE}/og-image.png`, width: 1200, height: 630, alt: "Valora — Institutional Real Estate AI" }],
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE}/og-image.png`],
    creator: "@valoraplatform",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  category: "Software",
};

// JSON-LD structured data for SoftwareApplication + FAQPage + Organization.
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Valora",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Real Estate Underwriting & Valuation",
    operatingSystem: "Web",
    description: DESCRIPTION,
    url: SITE,
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD", description: "1 full appraisal · 3 free valuations · all 7 asset classes unlocked" },
      { "@type": "Offer", name: "Pro",  price: "119", priceCurrency: "USD", description: "Unlimited appraisals + unlimited valuations + full Copilot, billed annually" },
      { "@type": "Offer", name: "Enterprise", price: "319", priceCurrency: "USD", description: "Everything in Pro + 5 team members + white-label + SLA, billed annually" },
    ],
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "32", bestRating: "5" },
    author: { "@type": "Organization", name: "Valora", url: SITE },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Valora",
    url: SITE,
    logo: `${SITE}/logo.png`,
    description: "AI-native platform for institutional real estate underwriting and valuation.",
    sameAs: [
      "https://www.linkedin.com/company/valora-platform",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What is Valora?", acceptedAnswer: { "@type": "Answer", text: "Valora is an AI-native platform for institutional real estate. Describe a deal or property in one sentence and Valora's Copilot builds a full underwriting model or comparative market valuation — IRR, DSCR, cashflows, sensitivities, comparables, drivers, risks — and produces an IC-ready PDF in under 60 seconds." } },
      { "@type": "Question", name: "Which asset classes does Valora cover?", acceptedAnswer: { "@type": "Answer", text: "Seven institutional asset classes: Build to Rent (BTR), Build to Sell (BTS), Hotel (with USALI Advanced), Residential Flip, Commercial (office/retail/industrial), Mixed Use, and Industrial. Plus cross-border valuations for any property type." } },
      { "@type": "Question", name: "Which markets does Valora support?", acceptedAnswer: { "@type": "Answer", text: "UK, US, UAE, Singapore, Europe (Germany, France, and more), and APAC. Valora is jurisdiction-aware — it handles SDLT, VAT, SONIA, SOFR, EURIBOR, USALI, and local conventions automatically." } },
      { "@type": "Question", name: "Is Valora a replacement for RICS Red Book valuations?", acceptedAnswer: { "@type": "Answer", text: "No. Valora produces directional valuations for internal decision-support — deal screening, investor pitching, IC preparation. Formal Red Book or USPAP valuations should still be commissioned separately for regulated purposes like secured lending." } },
      { "@type": "Question", name: "How much does Valora cost?", acceptedAnswer: { "@type": "Answer", text: "Free forever — 1 full appraisal and 3 free valuations unlocked. Pro is $119/month billed annually ($149/month monthly) with unlimited appraisals, valuations, and Copilot messages. Enterprise is $319/month billed annually with team features and white-labelling." } },
      { "@type": "Question", name: "What outputs does Valora produce?", acceptedAnswer: { "@type": "Answer", text: "Complete institutional models with IRR, DSCR, Debt Yield, Equity Multiple, MOIC, payback, and sensitivity matrices. IC-ready PDF brochures and valuation reports. Live investor share links with real models, not static files." } },
      { "@type": "Question", name: "Is Valora just ChatGPT with a prompt?", acceptedAnswer: { "@type": "Answer", text: "No. Valora combines a peer-reviewed calc engine (with Simple↔Advanced reconciliation tests, USALI cascades, Monte Carlo, stress tests) with an AI Copilot on top. The AI parses your input and runs the real math; it doesn't hallucinate the numbers." } },
      { "@type": "Question", name: "Can I import a property URL from Rightmove or Zillow?", acceptedAnswer: { "@type": "Answer", text: "Yes. Paste a listing URL from Rightmove, Zoopla, Zillow, Redfin, Bayut, PropertyFinder, PropertyGuru, Immobilienscout24, and similar sites. The Copilot extracts property data and pre-fills your model." } },
      { "@type": "Question", name: "Who uses Valora?", acceptedAnswer: { "@type": "Answer", text: "PE funds, family offices, development teams, hotel operators, brokers, investment advisors, and solo analysts. Institutional output without institutional headcount." } },
      { "@type": "Question", name: "Is my data private?", acceptedAnswer: { "@type": "Answer", text: "Yes. Your deals are stored in your private workspace. Copilot conversations are session-only by default. Team workspaces on Enterprise keep firm data isolated with row-level security." } },
    ],
  },
];

export default function LandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingClient />
    </>
  );
}
