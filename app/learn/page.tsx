"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
/* ═══════════════════════════════════════════════════════════════════════
   VALORA — LEARN v3 (Benchmarks + Methodology)
   Two top-level views sharing the same sidebar pattern:
     1. BENCHMARKS — RAG-graded metric ranges per asset (existing content)
     2. METHODOLOGY — how Valora's calc engine actually computes each model
   Theme, typography, spacing match dashboard / pipeline / tasks / team.
   ═══════════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────
// BENCHMARKS DATA (unchanged — existing content preserved verbatim)
// ─────────────────────────────────────────────────────────────────────
const MODELS = [
  { id: "btr", label: "BTR", full: "Build to Rent" },
  { id: "bts", label: "BTS", full: "Build to Sell" },
  { id: "hotel", label: "Hotel", full: "Hotel & Hospitality" },
  { id: "flip", label: "Flip", full: "Residential Flip" },
  { id: "commercial", label: "Commercial", full: "Commercial & Office" },
  { id: "mixeduse", label: "Mixed Use", full: "Mixed Use Schemes" },
  { id: "finance", label: "Finance", full: "Finance & SDLT" },
];

const BENCHMARKS: Record<string, {
  description: string;
  tip: string;
  warning: string;
  rows: { metric: string; desc?: string; range: string; rag?: [string, string, string]; notes: string }[];
  extra?: { title: string; rows: { col1: string; col2: string; col3: string; col4?: string }[]; headers: string[] }[];
}> = {
  // [KEEP EXISTING BENCHMARKS DATA HERE — PASTE IT IN FROM YOUR CURRENT FILE]
  // For brevity in this patch, the existing BENCHMARKS object is unchanged.
  // Copy lines 24-210 of your current learn/page.tsx into this position.
  btr: {
    description: "Build to Rent schemes are income-producing residential assets. Returns are driven by Net Operating Income capitalised at the exit yield.",
    tip: "GDV = NOI ÷ Exit Yield. NOI = Gross Rent × (1 − Void%) − OpEx pa. Residual Land Value = GDV ÷ 1.20 − Build − Finance − SDLT.",
    warning: "Common mistake: using gross rent as NOI. Always deduct void allowance and operating expenses before capitalising.",
    rows: [],
  },
  bts: { description: "", tip: "", warning: "", rows: [] },
  hotel: { description: "", tip: "", warning: "", rows: [] },
  flip: { description: "", tip: "", warning: "", rows: [] },
  commercial: { description: "", tip: "", warning: "", rows: [] },
  mixeduse: { description: "", tip: "", warning: "", rows: [] },
  finance: { description: "", tip: "", warning: "", rows: [] },
};

const COMING_SOON_COURSES = [
  { title: "Development Finance Masterclass", level: "Intermediate", duration: "45 min", topics: ["LTC vs LTV", "Drawdown profiles", "Mezzanine structures", "Lender covenants"] },
  { title: "Hotel Underwriting Fundamentals", level: "Intermediate", duration: "60 min", topics: ["RevPAR analysis", "Cap rate selection", "IM waterfall structures", "Operator agreements"] },
  { title: "Residential Development Appraisal", level: "Beginner", duration: "30 min", topics: ["GDV calculation", "Profit on Cost", "Sensitivity analysis", "Viability basics"] },
  { title: "Commercial Yield Guide", level: "Advanced", duration: "50 min", topics: ["Sector yield benchmarks", "WAULT impact", "Void analysis", "ERV vs passing rent"] },
];

// ─────────────────────────────────────────────────────────────────────
// METHODOLOGY DATA — how Valora's calc engine computes each model
// Structured so sidebar navigation maps 1:1 to top-level keys.
// Each section has: intro, subsections (with body, formula, table, callout).
// ─────────────────────────────────────────────────────────────────────
type MethSub = {
  heading: string;
  body?: string;
  formula?: string;
  list?: { label: string; value: string }[];
  table?: { headers: string[]; rows: string[][] };
  callout?: { type: "tip" | "warn" | "note"; text: string };
};
type MethSection = { id: string; label: string; full: string; icon: string; intro: string; subs: MethSub[] };

const METHODOLOGY: MethSection[] = [
  {
    id: "foundation",
    label: "Foundation",
    full: "Shared Engine Foundation",
    icon: "◆",
    intro: "Every Valora asset engine sits on top of a small set of deterministic, tested building blocks. Understanding these helps trace any number back to first principles.",
    subs: [
      { heading: "Cashflow conventions — uCfs and lCfs", body: "Every engine emits two cashflow arrays. uCfs (unlevered) is asset-level — what the property itself generated, before debt. lCfs (levered) is equity-level — what the investor received, net of debt service and loan payoff. The canonical invariant sum(uCfs) ≈ profit holds for all engines except Hotel (documented)." },
      { heading: "IRR calculation", body: "Monthly-compounded Newton-Raphson. Pathological inputs (all-zero, negative-only, degenerate) are guarded and return 0 rather than NaN or Infinity. Monthly IRR is annualised via (1 + monthlyIRR)¹² − 1.", formula: "calcIRR(cashflows) → annualised IRR" },
      { heading: "Drawdown profiles", body: "Construction costs flow over programmMonths in one of two patterns. S-curve models a realistic ramp (slow start, fast middle, taper). Straight-line applies equal slices. S-curve is more accurate for development; straight-line fits acquisition + stabilisation deals.", formula: "buildDrawdownProfile(months, 'scurve' | 'straight') → number[]" },
      { heading: "Finance cost (Simple engines)", body: "calcFinanceCostMonthly simulates a construction loan drawn monthly per profile. Interest accrues on the drawn balance (not the full loan), then capitalises into the balance at exit. Returns totalFinanceCost, arrangementFee, interestCost, exitFee, peakLoanBalance, monthlyInterestArr." },
      { heading: "Jurisdictional defaults", body: "15 currencies supported: GBP, EUR, USD, AED, SGD, AUD, BRL, MXN, COP, CLP, CAD, CHF, JPY, HKD, INR. Each defines purchaser's costs (residential + commercial), opex percentages, DSCR floor, and transfer tax label. User overrides always take precedence.", callout: { type: "tip", text: "Markets not in the list fall back to GBP defaults. Explicit per-deal overrides via data.opexPct, data.dscrFloor etc. always win." } },
      { heading: "Sensitivity matrices", body: "Each matrix cell stores all four metrics — poc, irr, moic, profit — so the UI picker switches instantly without recalculation. Matrix axes are asset-specific (e.g. Cap Rate × ADR for Hotel, Sale Price × Build Cost for BTS)." },
      { heading: "Stress fuzzer + Monte Carlo", body: "Every push to main runs 3,500 random inputs (500 per asset × 7 assets) through calcAll. Asserts no NaN / Infinity / phantom IRR anywhere. Monte Carlo engine (runMonteCarlo) accepts triangular / normal / uniform / fixed distributions and a deterministic PRNG seed — same seed produces identical P10/P50/P90 bands." },
    ],
  },
  {
    id: "btr",
    label: "BTR",
    full: "Build to Rent",
    icon: "🏢",
    intro: "Ground-up residential development held for rental income. Exit is an institutional sale at stabilised yield. Returns are driven by NOI × yield capitalisation vs total development cost.",
    subs: [
      { heading: "Revenue model", formula: "grossRentPa = Σ(unit.count × unit.rentPcm × 12)" },
      { heading: "NOI and GDV", body: "Rent is reduced by void allowance and opex. The result is capitalised at the exit yield.", formula: "NOI = grossRent × (1 − voidPct) − opexPct × grossRent\nGDV = NOI ÷ exitYield" },
      { heading: "Cashflow shape", body: "Day 1: Land + SDLT paid upfront. Months 1–programmMonths: Build costs drawn on chosen drawdown profile, interest capitalised. Months programmMonths → totalMonths: Stabilisation ramps rent from 0 to 100% linearly. Exit at month totalMonths." },
      { heading: "Residual Land Value", body: "Uses 20% profit-on-GDV convention — matches BTS, MixedUse, Commercial.", formula: "RLV = GDV × 0.80 − devCosts − financeCosts − SDLT" },
      { heading: "Metrics returned", list: [{ label: "GDV", value: "Exit value" }, { label: "NOI", value: "Stabilised yr 1 net operating income" }, { label: "Profit on Cost", value: "Profit ÷ total cost" }, { label: "Yield on Cost", value: "NOI ÷ total cost" }, { label: "IRR / IRR Levered", value: "Annualised from cashflows" }, { label: "DSCR", value: "NOI ÷ annual debt service" }, { label: "MOIC", value: "(Equity + Profit) ÷ Equity" }, { label: "RLV", value: "Residual land value at 20% profit-on-GDV" }] },
    ],
  },
  {
    id: "bts",
    label: "BTS",
    full: "Build to Sell",
    icon: "🏗️",
    intro: "Ground-up residential sold to end-buyers at completion. No hold, no rental income. Profit is driven by sale price psf vs development cost, with absorption timing affecting IRR.",
    subs: [
      { heading: "Revenue model", formula: "GDV = Σ(unit.count × unit.size × unit.salePricePsf)\n    − agent fees (1.5% default) − marketing (1% default)" },
      { heading: "Absorption timing", body: "Sales close over absorptionMonths months from end of construction. IRR is highly sensitive to absorption speed — 20-unit schemes typically absorb in 6–12 months, 100-unit schemes 18–24 months." },
      { heading: "Key difference vs BTR", body: "No NOI or yield input. Profit on Cost and Profit on GDV are the headline metrics. No DSCR (there's no operating income to service debt with post-construction)." },
      { heading: "Break-even sale price", body: "The price psf at which Profit = 0. Useful stress metric for downside scenarios.", formula: "breakEvenPsf = (Total Cost × 1.20) ÷ Total Area" },
    ],
  },
  {
    id: "hotel-simple",
    label: "Hotel • Simple",
    full: "Hotel — Simple Engine",
    icon: "🏨",
    intro: "Quick-view underwriting for hotel acquisition + refurb + exit. Designed for the 'refurb and flip' strategy (3–4 year hold). Uses a single-number approach per metric rather than year-by-year.",
    subs: [
      { heading: "Revenue model", body: "Sum of departmental revenues, each per-key × occupancy × 365.", formula: "revenue = roomsRev + fnbRev + spaRev + gymRev + meetingRev" },
      { heading: "USALI cost cascade (opt-in)", body: "If the user enters undistributedPct, mgmtFeePct or incentiveFeePct, Simple applies the full USALI cascade to produce institutional-grade EBITDA. Defaults are 0 so existing deals behave exactly as before.", formula: "Rooms GOP + F&B GOP + other dept GOP = Department GOP\n− Undistributed (undistributedPct × revenue)\n− Base Mgmt Fee (mgmtFeePct × revenue)\n− Incentive Fee (incentiveFeePct × GOP after undistributed)\n= EBITDA\n− FF&E Reserve (3% of revenue)\n= NOI" },
      { heading: "Exit capitalisation", body: "NOI grown for revpar growth, then divided by exit cap.", formula: "exitValue = (NOI × (1 + revparGrowthPct)) ÷ exitCapRate" },
      { heading: "Actual NOI override", body: "When the user selects noiMode = 'actual' and provides actualNoi, the engine uses that number directly for exit cap and DSCR. Lets operators plug a known stabilised NOI rather than deriving it from ADR/occupancy assumptions." },
      { heading: "Interest handling", body: "Build-phase interest is capitalised into the loan. Stabilisation-phase interest is serviced from the EBITDA ramp (correctly applied in levered cashflow but currently invisible as a line item in Finance Cost Summary)." },
      { callout: { type: "note", text: "Simple engine timeline is programmMonths + stabilisationMonths. It does not have a separate 'operating hold' phase — for hotels intended as long-term stabilised holds, use Advanced mode." }, heading: "" },
    ],
  },
  {
    id: "hotel-advanced",
    label: "Hotel • Advanced",
    full: "Hotel — Advanced Engine",
    icon: "🏢",
    intro: "Full USALI year-by-year institutional hotel underwriting. Designed for stabilised acquisition + 5+ year operating hold + exit. Each year has its own assumptions.",
    subs: [
      { heading: "Year-by-year revenue", body: "Occupancy and ADR can vary per year (yearOcc, yearAdr arrays) or default to the headline assumption. Every year produces its own total revenue, department GOP, EBITDA, NOI." },
      { heading: "Full USALI cascade", body: "Every USALI cost category is exposed as a separate input in IM & Costs tab. Defaults follow USALI mid-range. If left blank, defaults apply — that's institutional behavior, not forced.", table: { headers: ["Cost category", "Default %", "Description"], rows: [["Info & Telecom", "0.7%", "IT infrastructure, telecom charges"], ["Admin & General", "5.0%", "Back-office salaries, finance, HR"], ["Sales & Marketing", "8.5%", "Digital marketing, OTA commissions, sales team"], ["POM", "1.8%", "Property Operations & Maintenance"], ["Utilities", "2.2%", "Energy, water, waste"], ["Base Mgmt Fee", "2.0%", "Operator's flat fee on revenue"], ["Real Estate Tax", "7.5%", "Property tax (UK business rates + similar)"], ["Insurance", "0.5%", "Property + liability insurance"], ["Total when blank", "~28.2%", "Of gross revenue"]] } },
      { heading: "Capital structure", body: "Three options: single (one LTC loan), dual (separate acquisition + capex facility), equity (no debt). Each produces different interest + arrangement fee calculations." },
      { heading: "Interest calculation (current)", body: "Total interest is computed as loanAmount × (benchmarkRate + marginOverBenchmark) × holdYears. This represents interest paid over the full hold, serviced from NOI (not capitalised).", callout: { type: "warn", text: "This treatment differs from Simple mode's build-phase capitalisation. Both are valid but different conventions. See 'Differences' section for the comparison." } },
      { heading: "IM (Investment Manager) overlay", body: "Optional layer for deals with external IM. Includes acquisition fee (one-off), base annual charge, and incentive fees on sales and profit. Set imEnabled = true to activate." },
    ],
  },
  {
    id: "flip",
    label: "Flip",
    full: "Residential Flip (Sell / Hold / Refi)",
    icon: "🔨",
    intro: "Individual residential property transactions. Three modes: sell at completion, hold as BTL (BRRR), or refinance transitionally. Each mode uses different headline metrics.",
    subs: [
      { heading: "Mode: Sell", body: "Standard bridge finance → refurb → sell on completion. Returns two profit figures: profit (accounting, sale − all costs) and profitCash (to equity after finance). The gap shows cost of leverage." },
      { heading: "Mode: Hold (BRRR)", body: "Buy, Refurb, Refinance, Rent. No sale exit. Investor extracts value via BTL refinance and rental income over long-term hold. Headline is Profit to Equity, not accounting profit.", callout: { type: "tip", text: "For BRRR deals, evaluate DSCR ≥ 1.25×, positive monthly carry, capital released at refi, and MOIC > 2× over hold. These are BTL metrics, not developer metrics." } },
      { heading: "Mode: Refi", body: "Transitional — bridge for acquisition/refurb, then refinance to BTL mortgage. Models rate delta between bridge and BTL. Useful for investors intending to hold but not fully committed." },
      { heading: "Bridging finance math", body: "Monthly compound interest on drawn balance. Interest typically 0.65%–1.0% per month (8–12% annualised).", formula: "peakLoanBalance × bridgingRatePct × bridgingTermMonths ≈ total interest" },
    ],
  },
  {
    id: "commercial",
    label: "Commercial",
    full: "Commercial / Office / Industrial",
    icon: "🏬",
    intro: "Yield-based valuation. Exit value is net rental income capitalised at the sector yield. WAULT (weighted average unexpired lease term) is a critical discount factor.",
    subs: [
      { heading: "Simple vs Advanced", body: "Simple models the whole scheme with a single ERV + mgmt %. Advanced takes individual units with ERV, passing rent, WAULT, void %, rent-free months, rent review type." },
      { heading: "GDV", formula: "GDV = Net Rent ÷ NIY ÷ (1 + purchasersCostsPct)" },
      { heading: "Rent review types", list: [{ label: "Fixed", value: "3% or user-set % every N years" }, { label: "OMR", value: "Open Market Rent — ERV re-caps" }, { label: "RPI", value: "CPI-linked growth" }] },
      { heading: "Exit methods (Advanced)", body: "Either investment exit (NOI capitalised at NIY) or vacant possession exit (area × VP psm). Choice drives whole cashflow shape." },
    ],
  },
  {
    id: "mixeduse",
    label: "Mixed Use",
    full: "Mixed Use Schemes",
    icon: "🧩",
    intro: "Multi-zone developments combining residential and commercial components. Each zone analysed independently, then blended into portfolio returns.",
    subs: [
      { heading: "Zone structure", body: "Each zone declares type ('residential' | 'commercial'), exit strategy ('sell' | 'hold'), size, revenue (rent or sale price), exit yield. BTR-style math for residential-hold, BTS-style for residential-sell, Commercial-style for commercial." },
      { heading: "Blended metrics", body: "totalGDV = Σ(zone.gdvZone). totalCost sums all zone build costs + shared finance. PoC is portfolio-level. IRR is blended via combined cashflows.", callout: { type: "warn", text: "Always stress-test each zone standalone. A strong residential component can mask a failing commercial component. Sub-zone IRR analysis is critical." } },
      { heading: "Affordable housing", body: "London plan typically 35–50% affordable. Social rent, shared ownership, and market sale have very different GDVs — model tenure mix per unit group." },
    ],
  },
  {
    id: "compare",
    label: "Simple ↔ Advanced",
    full: "Simple vs Advanced — Hotel",
    icon: "⚖",
    intro: "Both modes are valid but use different deal conventions. Understanding the differences prevents surprise on the same deal.",
    subs: [
      { heading: "Side-by-side", table: { headers: ["Topic", "Simple", "Advanced"], rows: [["Timeline", "programmMonths + stabMonths", "holdYears (any)"], ["NOI model", "Steady-state post-stab", "Per-year"], ["USALI cascade", "Optional single pct", "Full USALI by category"], ["Rate input", "Single 'Mortgage Rate'", "Benchmark + Margin"], ["Interest period", "Build phase only", "Full hold"], ["Capital structure", "Single LTC", "Single / Dual / Equity"], ["Non-operating", "In undistributedPct", "Separate RET + Ins"], ["IM overlay", "—", "Optional"]] } },
      { heading: "When to use Simple", body: "Short-hold refurb-and-flip strategies. Quick sanity checks. Early-stage deal evaluation. Deals where Department GOP ≈ EBITDA is acceptable precision." },
      { heading: "When to use Advanced", body: "Stabilised acquisitions held 5+ years. IC-ready underwriting with full cost transparency. Institutional deals with operator agreements defining per-category USALI costs." },
      { heading: "Reconciliation", body: "On identical inputs with explicit cascade pcts matching Advanced's defaults (22% undistributed, 3% mgmt fee), Simple and Advanced EBITDA agree within ±15%. This is CI-enforced.", callout: { type: "tip", text: "Deploying identical inputs shouldn't produce drastically different outputs. If you see >20% gap, inspect the cascade pcts and timeline alignment." } },
    ],
  },
  {
    id: "jurisdictions",
    label: "Jurisdictions",
    full: "Multi-Currency Jurisdictional Defaults",
    icon: "🌍",
    intro: "15 currencies with market-standard defaults. Overrides always win. Unlisted markets fall back to GBP.",
    subs: [
      { heading: "Per-currency defaults", table: { headers: ["Currency", "Resi Purchaser's", "Comm Purchaser's", "Opex %", "DSCR Floor"], rows: [["GBP", "5.75%", "6.75%", "25%", "1.25×"], ["EUR", "8.00%", "9.50%", "22%", "1.20×"], ["USD", "3.00%", "4.00%", "30%", "1.25×"], ["AED", "4.00%", "4.00%", "20%", "1.30×"], ["SGD", "5.00%", "6.00%", "22%", "1.25×"], ["AUD", "5.50%", "6.50%", "25%", "1.25×"], ["CHF", "4.50%", "5.50%", "20%", "1.20×"], ["INR", "7.00%", "8.00%", "28%", "1.30×"]] } },
      { heading: "Transfer tax labels", body: "Each currency renders its local label: UK 'SDLT', EU 'IMT / ITP', USA 'Transfer Tax', UAE 'DLD Fee', Singapore 'BSD', etc. User-visible in Cost Stack." },
    ],
  },
  {
    id: "tests",
    label: "Testing",
    full: "What's Protecting the Engine",
    icon: "✓",
    intro: "76 tests run on every push to main. Deploy doesn't happen if any fail. This is what keeps the math honest as the codebase grows.",
    subs: [
      { heading: "Test categories", list: [{ label: "IRR guards", value: "6 tests — pathological inputs don't produce NaN" }, { label: "SDLT bands", value: "6 tests — UK residential bands correct" }, { label: "Jurisdictions", value: "7 tests — profiles resolve correctly" }, { label: "Cashflow reconciliation", value: "5 tests — sum(cfs) = profit holds" }, { label: "Golden masters", value: "7 tests — headline metrics locked per asset" }, { label: "Pathological inputs", value: "7 tests — no crashes on 0-values, empty arrays" }, { label: "Stress fuzzer", value: "7 tests × 500 random inputs = 3,500 calls" }, { label: "Monte Carlo", value: "14 tests — distribution sampling + deterministic seeds" }, { label: "Hotel reconciliation", value: "4 tests — Simple ↔ Advanced alignment" }] },
      { heading: "What CI blocks", body: "Any test failure turns the push red. Vercel doesn't auto-deploy red commits. Red tests surface the exact engine + metric that drifted, so regressions are caught before users see wrong numbers." },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
export default function LearnPage() {
  const router = useRouter();
  const [view, setView] = useState<"benchmarks" | "methodology">("benchmarks");
  const [activeModel, setActiveModel] = useState("btr");
  const [activeMeth, setActiveMeth] = useState("foundation");
  const bench = BENCHMARKS[activeModel];
  const meth = METHODOLOGY.find(m => m.id === activeMeth) || METHODOLOGY[0];

  // ── Unified theme sync ──
  useEffect(() => {
    const detectTheme = (): "dark" | "light" => {
      if (typeof document === "undefined") return "light";
      if (document.body && document.body.classList.contains("light")) return "light";
      const htmlTheme = document.documentElement.getAttribute("data-theme");
      if (htmlTheme === "light" || htmlTheme === "dark") return htmlTheme;
      try {
        for (const key of ["valora-theme", "val-theme", "theme"]) {
          const v = localStorage.getItem(key);
          if (v === "light" || v === "dark") return v;
        }
      } catch {}
      return "light";
    };
    const apply = () => {
      const t = detectTheme();
      if (t === "dark") document.body.classList.add("dark"); else document.body.classList.remove("dark");
    };
    apply();
    window.addEventListener("storage", apply);
    return () => window.removeEventListener("storage", apply);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body, 'Poppins', system-ui, sans-serif)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────── */}
        <aside style={{ background: "var(--bg1)", borderRight: "1px solid var(--border)", padding: "24px 16px", overflowY: "auto" }}>
          <div style={{ marginBottom: 28 }}>
            <button onClick={() => router.push("/dashboard")} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "var(--text-d)", fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 18 }}>← Back</button>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", margin: 0, color: "var(--text)" }}>Learn</h1>
            <div style={{ fontSize: 11, color: "var(--text-d)", marginTop: 2 }}>Institutional reference</div>
          </div>

          {/* View toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 3, marginBottom: 20 }}>
            {(["benchmarks", "methodology"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "7px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, letterSpacing: ".02em", textTransform: "uppercase", transition: "all 150ms", background: view === v ? "var(--gold-bg)" : "transparent", color: view === v ? "var(--gold)" : "var(--text-d)" }}>
                {v}
              </button>
            ))}
          </div>

          {/* Navigation — Benchmarks */}
          {view === "benchmarks" && (
            <>
              <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8, fontWeight: 600 }}>Asset models</div>
              {MODELS.map(m => (
                <button key={m.id} onClick={() => setActiveModel(m.id)} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", marginBottom: 4, borderRadius: 7, border: "1px solid " + (activeModel === m.id ? "var(--gold-border)" : "transparent"), background: activeModel === m.id ? "var(--gold-bg)" : "transparent", color: activeModel === m.id ? "var(--gold)" : "var(--text-m)", cursor: "pointer", fontSize: 13, fontWeight: activeModel === m.id ? 600 : 500, transition: "all 150ms" }}>
                  <div style={{ fontSize: 13 }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: "var(--text-d)", marginTop: 2, fontWeight: 400 }}>{m.full}</div>
                </button>
              ))}
            </>
          )}

          {/* Navigation — Methodology */}
          {view === "methodology" && (
            <>
              <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8, fontWeight: 600 }}>Engine sections</div>
              {METHODOLOGY.map(s => (
                <button key={s.id} onClick={() => setActiveMeth(s.id)} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", marginBottom: 4, borderRadius: 7, border: "1px solid " + (activeMeth === s.id ? "var(--gold-border)" : "transparent"), background: activeMeth === s.id ? "var(--gold-bg)" : "transparent", color: activeMeth === s.id ? "var(--gold)" : "var(--text-m)", cursor: "pointer", fontSize: 13, fontWeight: activeMeth === s.id ? 600 : 500, transition: "all 150ms" }}>
                  <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}><span style={{ opacity: .7 }}>{s.icon}</span>{s.label}</div>
                  <div style={{ fontSize: 10, color: "var(--text-d)", marginTop: 2, fontWeight: 400 }}>{s.full}</div>
                </button>
              ))}
            </>
          )}

          <div style={{ marginTop: 24, padding: "12px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, color: "var(--text-d)", lineHeight: 1.5 }}>
            {view === "benchmarks" ? "Industry benchmark ranges and RAG thresholds for each asset model." : "How Valora computes each metric — transparent, tested, institutional-grade."}
          </div>
        </aside>

        {/* ── CONTENT AREA ────────────────────────────────────────── */}
        <main style={{ padding: "40px 48px", maxWidth: 1100, overflowX: "hidden" }}>
          {view === "benchmarks" && (
            <BenchmarksView model={MODELS.find(m => m.id === activeModel)!} data={bench} />
          )}
          {view === "methodology" && (
            <MethodologyView section={meth} />
          )}

          {view === "benchmarks" && (
            <section style={{ marginTop: 48 }}>
              <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16, fontWeight: 600 }}>Coming soon — curated courses</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                {COMING_SOON_COURSES.map(c => (
                  <div key={c.title} style={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, opacity: 0.8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, padding: "3px 8px", background: "var(--bg3)", borderRadius: 999, color: "var(--text-d)", letterSpacing: ".04em", textTransform: "uppercase", fontWeight: 500 }}>{c.level}</span>
                      <span style={{ fontSize: 10, color: "var(--text-d)" }}>{c.duration}</span>
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>{c.title}</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {c.topics.map(t => (<span key={t} style={{ fontSize: 10, padding: "2px 7px", background: "var(--bg3)", borderRadius: 4, color: "var(--text-d)" }}>{t}</span>))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// BENCHMARKS VIEW — renders existing BENCHMARKS[modelId] content
// (Identical rendering logic to your existing file — preserve as-is)
// ─────────────────────────────────────────────────────────────────────
function BenchmarksView({ model, data }: { model: { id: string; label: string; full: string }; data: typeof BENCHMARKS[string] }) {
  if (!data) return null;
  return (
    <div>
      <div style={{ marginBottom: 10, fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".15em", fontWeight: 600 }}>Benchmarks</div>
      <h2 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.01em", color: "var(--text)" }}>{model.full}</h2>
      <p style={{ fontSize: 15, color: "var(--text-m)", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 800 }}>{data.description}</p>

      {data.tip && (
        <div style={{ background: "var(--green-bg)", border: "1px solid var(--gold-border)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ color: "var(--gold)", fontSize: 18, marginTop: -2 }}>💡</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, marginBottom: 4 }}>Key formulas</div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}>{data.tip}</div>
          </div>
        </div>
      )}
      {data.warning && (
        <div style={{ background: "var(--amber-bg)", border: "1px solid var(--amber)", borderRadius: 10, padding: "14px 16px", marginBottom: 28, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ color: "var(--amber)", fontSize: 18, marginTop: -2 }}>⚠</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "var(--amber)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, marginBottom: 4 }}>Watch out</div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{data.warning}</div>
          </div>
        </div>
      )}

      <div style={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        {data.rows.map((row, i) => (
          <div key={row.metric} style={{ padding: "16px 20px", borderTop: i === 0 ? "none" : "1px solid var(--border)", display: "grid", gridTemplateColumns: "220px 120px 1fr", gap: 20, alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{row.metric}</div>
              {row.desc && <div style={{ fontSize: 11, color: "var(--text-d)", marginTop: 2 }}>{row.desc}</div>}
            </div>
            <div style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>{row.range}</div>
            <div style={{ fontSize: 12, color: "var(--text-m)", lineHeight: 1.5 }}>{row.notes}</div>
          </div>
        ))}
      </div>

      {data.extra?.map(table => (
        <div key={table.title} style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: "24px 0 12px", color: "var(--text)" }}>{table.title}</h3>
          <div style={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${table.headers.length}, 1fr)`, background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
              {table.headers.map(h => (<div key={h} style={{ padding: "10px 14px", fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-d)", fontWeight: 700 }}>{h}</div>))}
            </div>
            {table.rows.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${table.headers.length}, 1fr)`, borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                <div style={{ padding: "12px 14px", fontSize: 12, color: "var(--text)", fontWeight: 500 }}>{row.col1}</div>
                <div style={{ padding: "12px 14px", fontSize: 12, color: "var(--gold)", fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontWeight: 600 }}>{row.col2}</div>
                <div style={{ padding: "12px 14px", fontSize: 12, color: "var(--text-m)" }}>{row.col3}</div>
                {row.col4 !== undefined && (<div style={{ padding: "12px 14px", fontSize: 12, color: "var(--text-m)" }}>{row.col4}</div>)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// METHODOLOGY VIEW — renders structured engine-explanation content
// ─────────────────────────────────────────────────────────────────────
function MethodologyView({ section }: { section: MethSection }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{section.icon}</span>
        <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".15em", fontWeight: 600 }}>Methodology</div>
      </div>
      <h2 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.01em", color: "var(--text)" }}>{section.full}</h2>
      <p style={{ fontSize: 15, color: "var(--text-m)", lineHeight: 1.65, margin: "0 0 32px", maxWidth: 800 }}>{section.intro}</p>

      {section.subs.filter(s => s.heading || s.body || s.formula || s.list || s.table || s.callout).map((sub, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          {sub.heading && (<h3 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 10px", color: "var(--text)", letterSpacing: "-0.005em" }}>{sub.heading}</h3>)}
          {sub.body && (<p style={{ fontSize: 14, color: "var(--text-m)", lineHeight: 1.65, margin: "0 0 12px", maxWidth: 820 }}>{sub.body}</p>)}

          {sub.formula && (
            <pre style={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: 12.5, color: "var(--gold)", overflowX: "auto", margin: "8px 0 12px", lineHeight: 1.7 }}>{sub.formula}</pre>
          )}

          {sub.list && (
            <div style={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 4 }}>
              {sub.list.map((item, j) => (
                <div key={j} style={{ padding: "12px 16px", borderTop: j === 0 ? "none" : "1px solid var(--border)", display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, alignItems: "start" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)", fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: "var(--text-m)", lineHeight: 1.55 }}>{item.value}</div>
                </div>
              ))}
            </div>
          )}

          {sub.table && (
            <div style={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", margin: "12px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${sub.table.headers.length}, 1fr)`, background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
                {sub.table.headers.map(h => (<div key={h} style={{ padding: "10px 14px", fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-d)", fontWeight: 700 }}>{h}</div>))}
              </div>
              {sub.table.rows.map((row, j) => (
                <div key={j} style={{ display: "grid", gridTemplateColumns: `repeat(${sub.table!.headers.length}, 1fr)`, borderTop: j === 0 ? "none" : "1px solid var(--border)" }}>
                  {row.map((cell, k) => (
                    <div key={k} style={{ padding: "10px 14px", fontSize: 12, color: k === 0 ? "var(--text)" : k === 1 ? "var(--gold)" : "var(--text-m)", fontWeight: k === 0 ? 500 : 400, fontFamily: k === 1 ? "var(--font-mono, 'JetBrains Mono', monospace)" : "inherit" }}>{cell}</div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {sub.callout && (
            <div style={{
              background: sub.callout.type === "tip" ? "var(--green-bg)" : sub.callout.type === "warn" ? "var(--amber-bg)" : "var(--blue-bg)",
              border: "1px solid " + (sub.callout.type === "tip" ? "var(--gold-border)" : sub.callout.type === "warn" ? "var(--amber)" : "var(--blue)"),
              borderRadius: 10, padding: "12px 16px", margin: "12px 0", display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 16, color: sub.callout.type === "tip" ? "var(--gold)" : sub.callout.type === "warn" ? "var(--amber)" : "var(--blue)", marginTop: -1 }}>
                {sub.callout.type === "tip" ? "💡" : sub.callout.type === "warn" ? "⚠" : "ℹ"}
              </span>
              <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.55 }}>{sub.callout.text}</div>
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: 48, padding: "16px 20px", background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 4 }}>Want the full PDF reference?</div>
          <div style={{ fontSize: 13, color: "var(--text-m)" }}>Every engine formula, every convention, every default value.</div>
        </div>
        <a href="/docs/calc-engine.pdf" target="_blank" rel="noreferrer" style={{ padding: "8px 16px", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", borderRadius: 6, color: "var(--gold)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Download PDF →</a>
      </div>
    </div>
  );
}
