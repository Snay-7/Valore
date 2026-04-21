"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ════════════════════════════════════════════════════════════════════
   VALORA — LEARN v3 (Benchmarks + Methodology)
   Premium editorial design. Two views, shared sidebar, unified tokens.
   ════════════════════════════════════════════════════════════════════ */

// ─── BENCHMARKS (existing content — merge your current data here) ───
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
  // ⚠️ MERGE: paste your existing BENCHMARKS object here (from current learn/page.tsx, ~lines 24–210)
  btr: { description: "", tip: "", warning: "", rows: [] },
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

// ─── METHODOLOGY DATA ───
type MethSub = {
  heading?: string;
  body?: string;
  formula?: string;
  list?: { label: string; value: string }[];
  table?: { headers: string[]; rows: string[][] };
  callout?: { type: "tip" | "warn" | "note"; text: string };
};
type MethSection = { id: string; label: string; full: string; num: string; tldr: string; intro: string; subs: MethSub[] };

const METHODOLOGY: MethSection[] = [
  {
    id: "foundation", num: "01", label: "Foundation", full: "Shared Engine Foundation",
    tldr: "Deterministic building blocks that every asset engine sits on top of.",
    intro: "Every Valora asset engine reduces to a small set of tested, pure functions. Understanding these lets you trace any number back to first principles — which is exactly what an IC analyst will want to do.",
    subs: [
      { heading: "Cashflow conventions — uCfs and lCfs", body: "Every engine emits two monthly cashflow arrays. uCfs (unlevered) is asset-level: what the property generated, before debt. lCfs (levered) is equity-level: what the investor received, net of debt service and loan payoff. The canonical invariant sum(uCfs) ≈ profit holds for every engine except Hotel (where a documented stabilisation-NOI gap exists)." },
      { heading: "IRR — Newton-Raphson, monthly-compounded", body: "Pathological inputs (all-zero arrays, negative-only flows, degenerate shapes) are guarded and return 0 rather than NaN or Infinity. Monthly IRR is annualised via (1 + monthlyIRR)¹² − 1.", formula: "calcIRR(cashflows)  →  annualised IRR" },
      { heading: "Drawdown profiles", body: "Construction costs flow over programmMonths in one of two shapes. S-curve models a realistic ramp — slow start, accelerating middle, tapered end. Straight-line applies equal slices. S-curve is more accurate for development; straight-line fits acquisition + stabilisation deals.", formula: "buildDrawdownProfile(months, 'scurve' | 'straight')  →  number[]" },
      { heading: "Finance cost", body: "calcFinanceCostMonthly simulates a construction loan drawn monthly per profile. Interest accrues only on the drawn balance (not the full loan), then capitalises into principal at exit. Returns totalFinanceCost, arrangementFee, interestCost, exitFee, peakLoanBalance, and monthly drawdown/interest arrays." },
      { heading: "Jurisdictional defaults", body: "15 currencies shipped with market-standard defaults. Per-currency: purchaser's costs (residential + commercial), opex percentages, DSCR floor, and local transfer-tax label. User overrides always take precedence.", callout: { type: "tip", text: "Currencies not in the list fall back to GBP. Explicit per-deal overrides via data.opexPct, data.dscrFloor etc. always win over jurisdiction defaults." } },
      { heading: "Sensitivity + Monte Carlo + Stress fuzzer", body: "Each sensitivity cell stores all four metrics (poc, irr, moic, profit) so switching the UI picker is instant — no recalculation. Monte Carlo runs deterministic seeds with triangular / normal / uniform / fixed distributions. CI runs 3,500 random inputs on every push to ensure no NaN or phantom IRR ever leaks." },
    ],
  },
  {
    id: "btr", num: "02", label: "BTR", full: "Build to Rent",
    tldr: "Ground-up residential, held for rental income, exited via institutional sale at stabilised yield.",
    intro: "Returns are driven by Net Operating Income capitalised at the exit yield. The strength of the thesis is the spread between yield-on-cost and exit yield.",
    subs: [
      { heading: "Revenue model", formula: "grossRentPa = Σ(unit.count × unit.rentPcm × 12)" },
      { heading: "NOI and GDV", body: "Rent is reduced by void allowance and opex — what the investor actually receives. That NOI is capitalised at exit yield.", formula: "NOI = grossRent × (1 − voidPct) − opexPct × grossRent\nGDV = NOI ÷ exitYield" },
      { heading: "Cashflow shape", body: "Day 1: Land + SDLT paid. Months 1 → programmMonths: Build costs drawn on the chosen profile, interest capitalised. Months programmMonths → totalMonths: Rent ramps linearly from 0 → 100% during stabilisation. Exit at totalMonths." },
      { heading: "Residual Land Value", body: "Uses 20% profit-on-GDV convention — matches BTS, MixedUse, Commercial.", formula: "RLV = GDV × 0.80 − devCosts − financeCosts − SDLT" },
      { heading: "What you get back", list: [
        { label: "GDV", value: "Institutional exit value at stabilised yield" },
        { label: "NOI", value: "Stabilised yr 1 net operating income" },
        { label: "PoC / YoC", value: "Profit on Cost, Yield on Cost" },
        { label: "IRR, Levered IRR", value: "Annualised from monthly cashflows" },
        { label: "DSCR", value: "NOI ÷ annual debt service" },
        { label: "MOIC", value: "(Equity + Profit) ÷ Equity" },
        { label: "RLV", value: "Residual land value at 20% profit-on-GDV" },
      ] },
    ],
  },
  {
    id: "bts", num: "03", label: "BTS", full: "Build to Sell",
    tldr: "Sold to end-buyers at completion. No hold, no rental income — a developer-trader model.",
    intro: "Profit is driven by sale price psf vs development cost, with absorption timing affecting IRR materially. The hold risk isn't rental — it's price discovery.",
    subs: [
      { heading: "Revenue model", formula: "GDV = Σ(unit.count × unit.size × unit.salePricePsf)\n      − agent fees (1.5% default)\n      − marketing (1% default)" },
      { heading: "Absorption timing", body: "Sales close over absorptionMonths from end of construction. IRR is highly sensitive to absorption speed — a 20-unit scheme absorbs in 6–12 months, a 100-unit scheme in 18–24, a 200+ scheme in 24–48." },
      { heading: "How BTS differs from BTR", body: "No NOI, no yield input, no DSCR (there's no income to service debt with after construction). Profit on Cost and Profit on GDV are the only headline metrics." },
      { heading: "Break-even sale price", body: "Sale price psf at which Profit = 0. Critical for downside stress scenarios.", formula: "breakEvenPsf = (totalCost × 1.20) ÷ totalArea" },
    ],
  },
  {
    id: "hotel-simple", num: "04", label: "Hotel • Simple", full: "Hotel — Simple Engine",
    tldr: "Quick-view underwriting for refurb-and-flip hotel strategies. Single-number metrics, not year-by-year.",
    intro: "Designed for 3–4 year holds where the deal is buy, refurb, stabilise, sell. Simple engine produces institutional-grade output for this narrow use case while keeping the input surface tiny.",
    subs: [
      { heading: "Revenue model", body: "Sum of departmental revenues, each computed per-key × occupancy × 365.", formula: "revenue = roomsRev + fnbRev + spaRev + gymRev + meetingRev" },
      { heading: "USALI cascade (opt-in)", body: "If the user enters undistributedPct, mgmtFeePct, or incentiveFeePct, Simple applies the full USALI cascade to produce institutional EBITDA. Defaults are 0 — existing deals behave exactly as before.", formula: "Rooms GOP + F&B GOP + other dept GOP  =  Department GOP\n  − Undistributed (undistributedPct × revenue)\n  − Base Mgmt Fee (mgmtFeePct × revenue)\n  − Incentive Fee (incentiveFeePct × GOP after undistributed)\n  =  EBITDA\n  − FF&E Reserve (3% of revenue)\n  =  NOI" },
      { heading: "Exit capitalisation", body: "NOI grown for revpar growth, then capitalised at exit yield.", formula: "exitValue = (NOI × (1 + revparGrowthPct)) ÷ exitCapRate" },
      { heading: "Actual NOI override", body: "noiMode='actual' lets the user plug a known stabilised NOI (e.g. from the operator), bypassing the ADR/occupancy-derived figure. Engine uses it for exit cap, DSCR, and yield-on-cost." },
      { heading: "Interest handling", body: "Build-phase interest is capitalised into the loan principal. Stabilisation-phase interest is serviced from the ramping EBITDA (correctly applied in levered cashflow, but currently not shown as its own line item in Finance Cost Summary)." },
      { callout: { type: "note", text: "Simple engine's timeline is programmMonths + stabilisationMonths. It does not have a separate 'operating hold' phase. For hotels intended as long-term stabilised holds, Advanced mode is the right tool." } },
    ],
  },
  {
    id: "hotel-advanced", num: "05", label: "Hotel • Advanced", full: "Hotel — Advanced Engine",
    tldr: "Full USALI year-by-year institutional hotel model. 5+ year holds with per-category cost control.",
    intro: "Designed for stabilised acquisition + operating hold + exit. Each year has its own assumptions. Every USALI cost category is a separate editable input.",
    subs: [
      { heading: "Year-by-year revenue", body: "Occupancy and ADR can vary per year via yearOcc / yearAdr arrays, or default to the headline assumption. Each year produces its own total revenue, Department GOP, EBITDA, and NOI." },
      { heading: "Full USALI cost cascade", body: "Every USALI category is exposed as a separate input in IM & Costs. Defaults follow USALI mid-range.", table: { headers: ["Category", "Default", "What it covers"], rows: [
        ["Info & Telecom", "0.7%", "IT infrastructure, telecom"],
        ["Admin & General", "5.0%", "Back-office, finance, HR"],
        ["Sales & Marketing", "8.5%", "Digital, OTA commission, sales"],
        ["POM", "1.8%", "Property Ops & Maintenance"],
        ["Utilities", "2.2%", "Energy, water, waste"],
        ["Base Mgmt Fee", "2.0%", "Operator flat fee on revenue"],
        ["Real Estate Tax", "7.5%", "UK business rates equivalent"],
        ["Insurance", "0.5%", "Property + liability"],
        ["Total when blank", "~28.2%", "Of gross revenue"],
      ] } },
      { heading: "Capital structure", list: [
        { label: "Single", value: "One LTC loan covering purchase + CapEx" },
        { label: "Dual", value: "Separate acquisition loan + capex facility at different rates" },
        { label: "Equity", value: "No debt (all-equity acquisition)" },
      ] },
      { heading: "Interest calculation", body: "Total interest is computed as loanAmount × (benchmarkRate + marginOverBenchmark) × holdYears. This is paid over the hold, serviced from NOI — not capitalised.", callout: { type: "warn", text: "This treatment differs from Simple mode's build-phase capitalisation. Both are valid but different. The 'Simple ↔ Advanced' section below compares them side by side." } },
      { heading: "IM (Investment Manager) overlay", body: "Optional layer for deals with external IM involvement — acquisition fee (one-off), base annual charge, and incentive fees on sales and profit. Activate with imEnabled = true." },
    ],
  },
  {
    id: "flip", num: "06", label: "Flip", full: "Residential Flip",
    tldr: "Individual residential — three distinct modes with mode-specific metrics.",
    intro: "One engine, three underlying strategies: sell on completion, hold as BTL, or refinance transitionally. Each mode evaluates success differently.",
    subs: [
      { heading: "Mode: Sell", body: "Bridge finance → refurb → sell on completion. Returns two profit figures: profit (accounting, sale − all costs) and profitCash (to equity after finance). The gap measures cost of leverage." },
      { heading: "Mode: Hold (BRRR)", body: "Buy, Refurb, Refinance, Rent. No sale exit. Investor extracts value via BTL refinance and rental income over long-term hold. Headline is Profit to Equity — accounting profit is meaningless for BRRR.", callout: { type: "tip", text: "For BRRR, evaluate: DSCR ≥ 1.25×, positive monthly carry, capital released at refi, MOIC > 2× over hold. These are BTL metrics, not developer-trader metrics." } },
      { heading: "Mode: Refi", body: "Transitional — bridge for acquisition/refurb, then refinance to BTL mortgage. Explicitly models rate delta between bridge and BTL. Useful for investors undecided between sell and hold." },
      { heading: "Bridging math", body: "Monthly compound interest on drawn balance. Typical 0.65%–1.0% per month (8–12% annualised).", formula: "peakLoanBalance × bridgingRatePct × bridgingTermMonths  ≈  total interest" },
    ],
  },
  {
    id: "commercial", num: "07", label: "Commercial", full: "Commercial / Office / Industrial",
    tldr: "Yield-based valuation with WAULT discounting.",
    intro: "Exit value is net rental income capitalised at sector yield. WAULT (weighted average unexpired lease term) is the single most important discount driver.",
    subs: [
      { heading: "Simple vs Advanced", body: "Simple: whole scheme, single ERV + mgmt %. Advanced: individual units with ERV, passing rent, WAULT, void %, rent-free months, rent review type." },
      { heading: "GDV formula", formula: "GDV = netRent ÷ NIY ÷ (1 + purchasersCostsPct)" },
      { heading: "Rent review types", list: [
        { label: "Fixed", value: "3% or user-set % every N years" },
        { label: "OMR", value: "Open Market Rent — ERV re-caps at review" },
        { label: "RPI", value: "CPI-linked growth each review period" },
      ] },
      { heading: "Exit methods (Advanced)", body: "Either investment exit (NOI × 1/NIY) or vacant possession exit (area × VP psm). Choice drives the entire cashflow shape." },
    ],
  },
  {
    id: "mixeduse", num: "08", label: "Mixed Use", full: "Mixed Use Schemes",
    tldr: "Multi-zone schemes blending residential + commercial. Each zone analysed independently.",
    intro: "Every zone declares type, exit strategy, size, revenue, yield. BTR-style math for residential-hold, BTS-style for residential-sell, Commercial-style for commercial zones. Portfolio blended IRR sits on top.",
    subs: [
      { heading: "Zone structure", body: "zones[] array with { type, exitStrategy, size, revenue, exitYield }. Each computed in isolation, then combined into portfolio cashflows." },
      { heading: "Blended metrics", body: "totalGDV = Σ(zone.gdvZone). totalCost sums zone build costs + shared finance. PoC is portfolio-level. IRR is blended via combined cashflows.", callout: { type: "warn", text: "Always stress-test each zone standalone. A strong residential component can mask a failing commercial component. Sub-zone IRR analysis is critical for institutional capital." } },
      { heading: "Affordable housing", body: "London plan typically 35–50% affordable. Social rent, shared ownership, and market sale have very different GDVs — model tenure mix per unit group." },
    ],
  },
  {
    id: "compare", num: "09", label: "Simple ↔ Advanced", full: "Simple vs Advanced — Hotel",
    tldr: "Both modes produce valid but different numbers. Knowing why avoids surprises on the same deal.",
    intro: "The two engines use different deal conventions. Same inputs can produce different exit values, IRRs, and DSCRs — not because of bugs, but because they model different strategies.",
    subs: [
      { heading: "Side-by-side", table: { headers: ["Topic", "Simple", "Advanced"], rows: [
        ["Timeline", "programmMonths + stabMonths", "holdYears (any)"],
        ["NOI model", "Steady-state post-stab", "Per-year"],
        ["USALI cascade", "Optional single pct", "Full USALI by category"],
        ["Rate input", "Single 'Mortgage Rate'", "Benchmark + Margin"],
        ["Interest period", "Build phase only", "Full hold"],
        ["Capital structure", "Single LTC", "Single / Dual / Equity"],
        ["Non-operating", "In undistributedPct", "Separate RET + Insurance"],
        ["IM overlay", "—", "Optional"],
      ] } },
      { heading: "When Simple is right", body: "Short-hold refurb-and-flip. Quick sanity checks. Early-stage deal evaluation. Deals where Department GOP ≈ EBITDA is acceptable precision." },
      { heading: "When Advanced is right", body: "Stabilised acquisitions held 5+ years. IC-ready underwriting with cost transparency. Institutional deals with operator agreements defining per-category USALI." },
      { heading: "Reconciliation", body: "On identical inputs with explicit cascade pcts matching Advanced's defaults (22% undistributed, 3% mgmt fee), Simple and Advanced EBITDA agree within ±15%. This is CI-enforced.", callout: { type: "tip", text: "Seeing >20% gap on the same inputs? Check the cascade pcts and timeline alignment before assuming bug." } },
    ],
  },
  {
    id: "jurisdictions", num: "10", label: "Jurisdictions", full: "Multi-Currency Defaults",
    tldr: "15 currencies with market-standard defaults. Overrides always win.",
    intro: "Every jurisdiction defines its own purchaser's costs, opex percentages, DSCR floor, and local transfer-tax label. The engine picks them up automatically based on the currency field.",
    subs: [
      { heading: "Per-currency defaults", table: { headers: ["Currency", "Resi P.C.", "Comm P.C.", "Opex %", "DSCR"], rows: [
        ["GBP", "5.75%", "6.75%", "25%", "1.25×"],
        ["EUR", "8.00%", "9.50%", "22%", "1.20×"],
        ["USD", "3.00%", "4.00%", "30%", "1.25×"],
        ["AED", "4.00%", "4.00%", "20%", "1.30×"],
        ["SGD", "5.00%", "6.00%", "22%", "1.25×"],
        ["AUD", "5.50%", "6.50%", "25%", "1.25×"],
        ["CHF", "4.50%", "5.50%", "20%", "1.20×"],
        ["INR", "7.00%", "8.00%", "28%", "1.30×"],
      ] } },
      { heading: "Transfer tax labels", body: "Each currency renders its local label: UK 'SDLT', EU 'IMT / ITP', USA 'Transfer Tax', UAE 'DLD Fee', Singapore 'BSD'. User-visible in Cost Stack." },
    ],
  },
  {
    id: "tests", num: "11", label: "Testing", full: "What's Protecting the Engine",
    tldr: "76 tests run on every push. Deploy is blocked on red.",
    intro: "Every engine change flows through a comprehensive test gate. If anything breaks, CI catches it before users see it.",
    subs: [
      { heading: "Test categories", list: [
        { label: "IRR guards", value: "Pathological inputs never produce NaN" },
        { label: "SDLT bands", value: "UK residential bands verified exact" },
        { label: "Jurisdictions", value: "Profile resolution checked per currency" },
        { label: "Cashflow recon", value: "sum(cfs) = profit invariant" },
        { label: "Golden masters", value: "Headline metrics locked per asset" },
        { label: "Pathological inputs", value: "No crashes on 0s, empty arrays" },
        { label: "Stress fuzzer", value: "7 assets × 500 random = 3,500 calls" },
        { label: "Monte Carlo", value: "Distribution sampling + determinism" },
        { label: "Hotel reconciliation", value: "Simple ↔ Advanced alignment" },
      ] },
      { heading: "What CI blocks", body: "Any failure turns the push red. Vercel doesn't auto-deploy red commits. Failing tests name the exact engine + metric that regressed, so root cause is immediate." },
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
  const methIndex = METHODOLOGY.findIndex(m => m.id === activeMeth);
  const prevMeth = methIndex > 0 ? METHODOLOGY[methIndex - 1] : null;
  const nextMeth = methIndex < METHODOLOGY.length - 1 ? METHODOLOGY[methIndex + 1] : null;

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
    <>
      <style jsx>{`
        .learn-root { min-height:100vh; background:var(--bg); color:var(--text); display:grid; grid-template-columns:280px 1fr; font-family:var(--font-body, 'Poppins', system-ui); }
        .sidebar { background:linear-gradient(180deg, var(--bg1) 0%, var(--bg) 100%); border-right:1px solid var(--border); padding:28px 20px 40px; overflow-y:auto; position:sticky; top:0; height:100vh; }
        .back-btn { display:inline-flex; align-items:center; gap:6px; background:transparent; border:none; color:var(--text-d); font-size:12px; cursor:pointer; padding:4px 0; margin-bottom:20px; letter-spacing:.02em; transition:color .15s; font-family:inherit; }
        .back-btn:hover { color:var(--text); }
        .brand-title { font-size:22px; font-weight:700; letter-spacing:-.02em; margin:0; color:var(--text); }
        .brand-sub { font-size:11px; color:var(--text-d); margin-top:3px; letter-spacing:.02em; }
        .view-toggle { display:grid; grid-template-columns:1fr 1fr; gap:3px; background:var(--bg2); border:1px solid var(--border); border-radius:10px; padding:3px; margin:22px 0 26px; }
        .view-toggle button { padding:8px 10px; border-radius:7px; border:none; cursor:pointer; font-size:10.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; transition:all .15s; background:transparent; color:var(--text-d); font-family:inherit; }
        .view-toggle button.active { background:var(--gold); color:var(--bg); box-shadow:0 2px 6px rgba(0,0,0,.1); }
        .nav-label { font-size:10px; color:var(--text-d); text-transform:uppercase; letter-spacing:.12em; margin-bottom:10px; font-weight:700; padding:0 4px; }
        .nav-item { display:flex; align-items:flex-start; gap:10px; width:100%; text-align:left; padding:11px 12px; margin-bottom:2px; border-radius:8px; border:1px solid transparent; background:transparent; color:var(--text-m); cursor:pointer; transition:all .15s; font-family:inherit; }
        .nav-item:hover { background:var(--bg2); color:var(--text); }
        .nav-item.active { background:var(--gold-bg); border-color:var(--gold-border); color:var(--text); }
        .nav-item .num { font-family:var(--font-mono, 'JetBrains Mono', monospace); font-size:10px; color:var(--gold); font-weight:700; margin-top:2px; min-width:18px; letter-spacing:.02em; }
        .nav-item .lbl { font-size:13px; font-weight:600; line-height:1.3; }
        .nav-item .full { font-size:11px; color:var(--text-d); margin-top:2px; font-weight:400; line-height:1.3; }
        .nav-item.active .lbl { color:var(--gold); }

        .content { padding:64px 72px; max-width:1080px; overflow-x:hidden; }

        /* Eyebrow + title */
        .eyebrow { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
        .eyebrow .num { font-family:var(--font-mono, monospace); font-size:12px; color:var(--gold); font-weight:700; letter-spacing:.08em; }
        .eyebrow .divider { width:32px; height:1px; background:var(--gold); opacity:.6; }
        .eyebrow .kind { font-size:11px; color:var(--text-d); text-transform:uppercase; letter-spacing:.15em; font-weight:700; }
        .hero-title { font-size:48px; font-weight:700; letter-spacing:-.025em; line-height:1.05; margin:0 0 18px; color:var(--text); font-family:var(--font-display, inherit); }
        .tldr { font-size:18px; color:var(--gold); font-weight:500; line-height:1.45; margin:0 0 14px; max-width:720px; letter-spacing:-.005em; }
        .intro { font-size:16px; color:var(--text-m); line-height:1.7; margin:0 0 48px; max-width:720px; }

        /* Subsection card */
        .sub { margin-bottom:36px; padding-left:0; }
        .sub-heading { font-size:20px; font-weight:600; margin:0 0 14px; color:var(--text); letter-spacing:-.01em; font-family:var(--font-display, inherit); }
        .sub-body { font-size:14.5px; color:var(--text-m); line-height:1.7; margin:0 0 14px; max-width:760px; }

        /* Formula block */
        .formula {
          background:var(--bg1);
          border:1px solid var(--border);
          border-left:3px solid var(--gold);
          border-radius:8px;
          padding:18px 20px;
          font-family:var(--font-mono, 'JetBrains Mono', monospace);
          font-size:13px;
          color:var(--text);
          overflow-x:auto;
          margin:14px 0;
          line-height:1.8;
          white-space:pre;
          box-shadow:0 1px 0 rgba(0,0,0,.04);
        }
        .formula::before {
          content:"FORMULA";
          display:block;
          font-size:9.5px;
          color:var(--gold);
          font-weight:700;
          letter-spacing:.12em;
          margin-bottom:10px;
          font-family:var(--font-body, inherit);
        }

        /* Key-value list */
        .kv-list { background:var(--bg1); border:1px solid var(--border); border-radius:10px; overflow:hidden; margin:14px 0; }
        .kv-row { display:grid; grid-template-columns:220px 1fr; gap:20px; padding:14px 18px; border-top:1px solid var(--border); transition:background .15s; }
        .kv-row:first-child { border-top:none; }
        .kv-row:hover { background:var(--bg2); }
        .kv-label { font-size:13px; font-weight:600; color:var(--gold); font-family:var(--font-mono, monospace); letter-spacing:-.005em; }
        .kv-value { font-size:13.5px; color:var(--text-m); line-height:1.55; }

        /* Table */
        .tbl { background:var(--bg1); border:1px solid var(--border); border-radius:10px; overflow:hidden; margin:14px 0; }
        .tbl-header { background:var(--bg2); border-bottom:1px solid var(--border); }
        .tbl-row { display:grid; align-items:center; transition:background .15s; }
        .tbl-row:hover:not(.is-header) { background:var(--bg2); }
        .tbl-row + .tbl-row { border-top:1px solid var(--border); }
        .tbl-cell { padding:12px 16px; font-size:13px; color:var(--text-m); }
        .tbl-cell.first { font-weight:500; color:var(--text); }
        .tbl-cell.num { font-family:var(--font-mono, monospace); color:var(--gold); font-weight:600; }
        .tbl-cell.head { font-size:10px; text-transform:uppercase; letter-spacing:.08em; color:var(--text-d); font-weight:700; padding:12px 16px; }

        /* Callout */
        .callout { border-radius:12px; padding:16px 18px 16px 52px; position:relative; margin:16px 0; line-height:1.55; font-size:13.5px; color:var(--text); }
        .callout.tip { background:var(--green-bg); border:1px solid var(--gold-border); }
        .callout.warn { background:var(--amber-bg); border:1px solid var(--amber); }
        .callout.note { background:var(--blue-bg); border:1px solid var(--blue); }
        .callout::before { content:""; position:absolute; left:14px; top:14px; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; }
        .callout.tip::before { content:"→"; background:var(--gold); color:var(--bg); }
        .callout.warn::before { content:"!"; background:var(--amber); color:var(--bg); }
        .callout.note::before { content:"i"; background:var(--blue); color:var(--bg); font-style:italic; }

        /* Prev/next navigation */
        .meth-nav { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:72px; padding-top:32px; border-top:1px solid var(--border); }
        .meth-nav-btn { display:block; padding:18px 22px; background:var(--bg1); border:1px solid var(--border); border-radius:12px; text-decoration:none; color:inherit; cursor:pointer; transition:all .15s; font-family:inherit; text-align:left; }
        .meth-nav-btn:hover { border-color:var(--gold-border); background:var(--gold-bg); }
        .meth-nav-btn.right { text-align:right; }
        .meth-nav-btn .dir { font-size:10px; color:var(--text-d); text-transform:uppercase; letter-spacing:.12em; font-weight:700; margin-bottom:6px; }
        .meth-nav-btn .title { font-size:15px; color:var(--text); font-weight:600; letter-spacing:-.005em; }
        .meth-nav-btn:hover .title { color:var(--gold); }

        /* Download CTA */
        .download-cta { margin-top:36px; padding:22px 28px; background:linear-gradient(90deg, var(--bg1) 0%, var(--bg2) 100%); border:1px solid var(--gold-border); border-radius:14px; display:flex; align-items:center; justify-content:space-between; gap:24px; }
        .download-cta .ctx { flex:1; }
        .download-cta .hed { font-size:15px; color:var(--text); font-weight:600; margin:0 0 4px; }
        .download-cta .sub { font-size:13px; color:var(--text-m); margin:0; line-height:1.5; }
        .download-cta a { padding:10px 18px; background:var(--gold); color:var(--bg); border-radius:8px; font-size:13px; font-weight:700; text-decoration:none; letter-spacing:.02em; transition:transform .15s, box-shadow .15s; }
        .download-cta a:hover { transform:translateY(-1px); box-shadow:0 4px 12px var(--gold-bg); }

        /* Bench view header */
        .bench-hero { margin-bottom:40px; }
        .bench-hero h2 { font-size:42px; font-weight:700; letter-spacing:-.02em; margin:6px 0 12px; color:var(--text); font-family:var(--font-display, inherit); line-height:1.08; }
        .bench-hero p { font-size:15.5px; color:var(--text-m); line-height:1.65; margin:0; max-width:720px; }

        @media (max-width: 980px) {
          .learn-root { grid-template-columns:1fr; }
          .sidebar { position:static; height:auto; }
          .content { padding:40px 24px; }
          .hero-title { font-size:36px; }
          .bench-hero h2 { font-size:32px; }
        }
      `}</style>

      <div className="learn-root">
        {/* ── SIDEBAR ─────────────────────────────────────────────── */}
        <aside className="sidebar">
          <button className="back-btn" onClick={() => router.push("/dashboard")}>← Back to dashboard</button>
          <h1 className="brand-title">Learn</h1>
          <div className="brand-sub">Institutional reference</div>

          <div className="view-toggle">
            {(["benchmarks", "methodology"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={view === v ? "active" : ""}>{v}</button>
            ))}
          </div>

          {view === "benchmarks" && (
            <>
              <div className="nav-label">Asset Models</div>
              {MODELS.map((m, i) => (
                <button key={m.id} onClick={() => setActiveModel(m.id)} className={"nav-item" + (activeModel === m.id ? " active" : "")}>
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div className="lbl">{m.label}</div>
                    <div className="full">{m.full}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {view === "methodology" && (
            <>
              <div className="nav-label">Engine Sections</div>
              {METHODOLOGY.map(s => (
                <button key={s.id} onClick={() => setActiveMeth(s.id)} className={"nav-item" + (activeMeth === s.id ? " active" : "")}>
                  <span className="num">{s.num}</span>
                  <div>
                    <div className="lbl">{s.label}</div>
                    <div className="full">{s.full}</div>
                  </div>
                </button>
              ))}
            </>
          )}
        </aside>

        {/* ── CONTENT ─────────────────────────────────────────────── */}
        <main className="content">
          {view === "benchmarks" && <BenchmarksView model={MODELS.find(m => m.id === activeModel)!} data={bench} />}
          {view === "methodology" && (
            <>
              <MethodologyView section={meth} />
              {/* Prev / Next navigation */}
              <div className="meth-nav">
                {prevMeth ? (
                  <button className="meth-nav-btn" onClick={() => setActiveMeth(prevMeth.id)}>
                    <div className="dir">← Previous</div>
                    <div className="title">{prevMeth.full}</div>
                  </button>
                ) : <div />}
                {nextMeth ? (
                  <button className="meth-nav-btn right" onClick={() => setActiveMeth(nextMeth.id)}>
                    <div className="dir">Next →</div>
                    <div className="title">{nextMeth.full}</div>
                  </button>
                ) : <div />}
              </div>
              {/* Download CTA */}
              <div className="download-cta">
                <div className="ctx">
                  <div className="hed">Full methodology — downloadable reference</div>
                  <div className="sub">Every engine formula, every convention, every default. Share with your IC.</div>
                </div>
                <a href="/docs/calc-engine.pdf" target="_blank" rel="noreferrer">Download PDF →</a>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

// ─── BENCHMARKS VIEW ───────────────────────────────────────────────
function BenchmarksView({ model, data }: { model: { id: string; label: string; full: string }; data: typeof BENCHMARKS[string] }) {
  if (!data) return null;
  return (
    <div>
      <div className="eyebrow">
        <span className="num">Asset Model</span>
        <span className="divider" />
        <span className="kind">Benchmarks</span>
      </div>
      <div className="bench-hero">
        <h2>{model.full}</h2>
        <p>{data.description}</p>
      </div>

      {data.tip && (
        <div className="callout tip">
          <strong style={{ display: "block", fontSize: 10, letterSpacing: ".1em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 6 }}>Key formulas</strong>
          <div style={{ fontFamily: "var(--font-mono, monospace)" }}>{data.tip}</div>
        </div>
      )}
      {data.warning && (
        <div className="callout warn">
          <strong style={{ display: "block", fontSize: 10, letterSpacing: ".1em", color: "var(--amber)", textTransform: "uppercase", marginBottom: 6 }}>Watch out</strong>
          {data.warning}
        </div>
      )}

      <div className="tbl" style={{ marginTop: 24 }}>
        {data.rows.map((row, i) => (
          <div key={row.metric} className="tbl-row" style={{ gridTemplateColumns: "260px 140px 1fr", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
            <div className="tbl-cell first">
              <div style={{ fontWeight: 600 }}>{row.metric}</div>
              {row.desc && <div style={{ fontSize: 11, color: "var(--text-d)", marginTop: 2, fontWeight: 400 }}>{row.desc}</div>}
            </div>
            <div className="tbl-cell num">{row.range}</div>
            <div className="tbl-cell">{row.notes}</div>
          </div>
        ))}
      </div>

      {data.extra?.map(table => (
        <div key={table.title} style={{ marginTop: 32 }}>
          <h3 className="sub-heading">{table.title}</h3>
          <div className="tbl">
            <div className="tbl-row tbl-header is-header" style={{ gridTemplateColumns: `repeat(${table.headers.length}, 1fr)` }}>
              {table.headers.map(h => <div key={h} className="tbl-cell head">{h}</div>)}
            </div>
            {table.rows.map((row, i) => (
              <div key={i} className="tbl-row" style={{ gridTemplateColumns: `repeat(${table.headers.length}, 1fr)` }}>
                <div className="tbl-cell first">{row.col1}</div>
                <div className="tbl-cell num">{row.col2}</div>
                <div className="tbl-cell">{row.col3}</div>
                {row.col4 !== undefined && <div className="tbl-cell">{row.col4}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}

      <section style={{ marginTop: 64 }}>
        <div className="eyebrow">
          <span className="num">Coming Soon</span>
          <span className="divider" />
          <span className="kind">Curated Courses</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginTop: 18 }}>
          {COMING_SOON_COURSES.map(c => (
            <div key={c.title} style={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, opacity: 0.7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 10, padding: "3px 9px", background: "var(--bg3)", borderRadius: 999, color: "var(--text-d)", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600 }}>{c.level}</span>
                <span style={{ fontSize: 11, color: "var(--text-d)" }}>{c.duration}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 10px", color: "var(--text)", letterSpacing: "-.005em" }}>{c.title}</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {c.topics.map(t => (<span key={t} style={{ fontSize: 10.5, padding: "3px 8px", background: "var(--bg3)", borderRadius: 5, color: "var(--text-d)" }}>{t}</span>))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── METHODOLOGY VIEW ──────────────────────────────────────────────
function MethodologyView({ section }: { section: MethSection }) {
  return (
    <article>
      <div className="eyebrow">
        <span className="num">{section.num}</span>
        <span className="divider" />
        <span className="kind">Methodology</span>
      </div>
      <h2 className="hero-title">{section.full}</h2>
      <p className="tldr">{section.tldr}</p>
      <p className="intro">{section.intro}</p>

      {section.subs.map((sub, i) => (
        <div key={i} className="sub">
          {sub.heading && <h3 className="sub-heading">{sub.heading}</h3>}
          {sub.body && <p className="sub-body">{sub.body}</p>}
          {sub.formula && <pre className="formula">{sub.formula}</pre>}
          {sub.list && (
            <div className="kv-list">
              {sub.list.map((item, j) => (
                <div key={j} className="kv-row">
                  <div className="kv-label">{item.label}</div>
                  <div className="kv-value">{item.value}</div>
                </div>
              ))}
            </div>
          )}
          {sub.table && (
            <div className="tbl">
              <div className="tbl-row tbl-header is-header" style={{ gridTemplateColumns: `repeat(${sub.table.headers.length}, 1fr)` }}>
                {sub.table.headers.map(h => <div key={h} className="tbl-cell head">{h}</div>)}
              </div>
              {sub.table.rows.map((row, j) => (
                <div key={j} className="tbl-row" style={{ gridTemplateColumns: `repeat(${sub.table!.headers.length}, 1fr)` }}>
                  {row.map((cell, k) => (
                    <div key={k} className={"tbl-cell" + (k === 0 ? " first" : "") + (k === 1 ? " num" : "")}>{cell}</div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {sub.callout && <div className={"callout " + sub.callout.type}>{sub.callout.text}</div>}
        </div>
      ))}
    </article>
  );
}
