"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
/* ═══════════════════════════════════════════════════════════════════════
   VALORA — LEARN v2
   Rebranded to the Valora design system. Dark navy sidebar (Navigation +
   Benchmarks) + dark hero with green radial glow + light/dark content area
   with benchmark tables, RAG pill chips, tip/warn boxes, coming-soon
   course cards. All data (MODELS, BENCHMARKS, COMING_SOON_COURSES)
   preserved verbatim. Theme sync unified with dashboard + pipeline + tasks
   + team + notes + workspace.
   ═══════════════════════════════════════════════════════════════════════ */
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
  btr: {
    description: "Build to Rent schemes are income-producing residential assets. Returns are driven by Net Operating Income capitalised at the exit yield.",
    tip: "GDV = NOI ÷ Exit Yield. NOI = Gross Rent × (1 − Void%) − OpEx pa. Residual Land Value = GDV ÷ 1.20 − Build − Finance − SDLT.",
    warning: "Common mistake: using gross rent as NOI. Always deduct void allowance and operating expenses before capitalising.",
    rows: [
      { metric: "Exit Yield", desc: "Capitalisation rate at sale", range: "4.0 – 6.5%", rag: [">20% compressed (<4%)", "4–5% prime", "5–6.5% regional"], notes: "Prime London 3.5–4.5%, regional 5–6.5%. Lower = higher value but more risk." },
      { metric: "Void Allowance", desc: "Vacancy / vacant possession", range: "5 – 10%", rag: ["5–7% stabilised", "7–10% acceptable", ">10% stressed"], notes: "Stabilised BTR 5%. New schemes in lease-up 8–12%." },
      { metric: "OpEx psf pa", desc: "Running costs per sqft", range: "£8 – £20", rag: ["<£12 efficient", "£12–18 typical", ">£18 heavy"], notes: "Management, maintenance, insurance. Amenity-heavy schemes £15–20+." },
      { metric: "Profit on Cost", desc: "Development return", range: "15 – 25%", rag: [">20% target", "15–20% acceptable", "<15% fails viability"], notes: "20% is the institutional minimum. Sub-15% usually fails planning viability." },
      { metric: "IRR (Unlevered)", desc: "Total cost annualised return", range: "8 – 18%", rag: [">12% strong", "8–12% acceptable", "<8% weak"], notes: "Annualised over full programme including stabilisation period." },
      { metric: "DSCR / ICR", desc: "Debt service coverage ratio", range: "1.25 – 2.0×", rag: [">1.5× comfortable", "1.25–1.5× minimum", "<1.25× lender risk"], notes: "Lender covenant typically 1.25× minimum. Below = refinancing risk." },
      { metric: "Build Cost psf", desc: "Construction cost", range: "£180 – £450", rag: ["—", "—", "—"], notes: "Refurb £150–250, newbuild flatted £220–350, prime London £350–500+." },
      { metric: "Programme (months)", range: "18 – 42", rag: ["—", "—", "—"], notes: "Refurb 6–18m, mid-size newbuild 24–36m, large schemes 36–60m." },
    ],
  },
  bts: {
    description: "Build to Sell schemes sell completed units on the open market. GDV is the sum of all unit values and profit is driven by sale price vs total development cost.",
    tip: "GDV = Σ(Units × Size × Sale psf). Break-even psf = Total Cost × 1.20 ÷ Total Area. Target 20% PoC before committing to land.",
    warning: "Common mistake: forgetting agent fees, marketing and SDLT in cost stack. These can easily total 3–5% of GDV.",
    rows: [
      { metric: "Sale Price psf", range: "£400 – £2,500+", rag: ["—", "—", "—"], notes: "Outer London £500–900, inner London £900–1,500, prime central £1,500–3,000+. Always check local comps." },
      { metric: "Build Cost psf", range: "£180 – £500", rag: ["—", "—", "—"], notes: "Flatted residential £200–350 typical. High-spec or central London £300–500+." },
      { metric: "Profit on Cost", desc: "Primary return metric", range: "15 – 25%", rag: [">20% target", "15–20% acceptable", "<15% borderline"], notes: "Developers typically require 20% minimum. Planning uncertainty increases the minimum." },
      { metric: "Profit on GDV", desc: "Margin on sales", range: "12 – 20%", rag: [">15% target", "12–15% acceptable", "<12% thin"], notes: "Cross-check: ~15–17% healthy for newbuild residential." },
      { metric: "Agent Fees", range: "1.0 – 2.0%", rag: ["—", "—", "—"], notes: "Typically 1.5% of GDV. Off-plan pre-sales may be 2%+." },
      { metric: "Marketing", range: "0.5 – 2.0%", rag: ["—", "—", "—"], notes: "Small schemes 0.5–1%, larger schemes 1–2%." },
      { metric: "Absorption (months)", desc: "Sell-out period", range: "6 – 36", rag: ["—", "—", "—"], notes: "20 units ~6–12m, 100 units ~18–24m, 200+ units 24–48m." },
      { metric: "Professional Fees", range: "8 – 15% of build", rag: ["8–10% normal", "10–13% high", ">15% excessive"], notes: "Architects, engineers, QS, planning, legal. 10% of hard costs is typical." },
    ],
  },
  hotel: {
    description: "Hotels are valued on capitalised EBITDA. The exit value is driven by NOI (EBITDA minus FF&E reserve) divided by the exit cap rate. RevPAR is the primary operational KPI.",
    tip: "Exit Value = NOI ÷ Exit Cap Rate. NOI = EBITDA − FF&E Reserve. RevPAR = ADR × Occupancy%. EBITDA per key is the best cross-sectional benchmark.",
    warning: "FF&E reserve (typically 3% of revenue) is mandatory from Year 3. Forgetting it overstates NOI and exit value — a 3% reserve on £50m revenue = £1.5m pa.",
    rows: [
      { metric: "ADR", desc: "Average Daily Rate", range: "£60 – £1,200+", rag: ["—", "—", "—"], notes: "Budget £60–90, 3★ £90–150, 4★ £150–300, 5★ £350–800. London commands 40–60% premium over UK average." },
      { metric: "Occupancy", range: "55 – 85%", rag: [">72% strong", "60–72% acceptable", "<60% stressed"], notes: "London luxury average 72–78%. 85%+ exceptional. Sub-60% tests debt service." },
      { metric: "RevPAR", desc: "ADR × Occupancy%", range: "£50 – £900+", rag: ["—", "—", "—"], notes: "Primary hotel KPI. London 5★ £350–600. Always compare to AI comps for your location." },
      { metric: "GOP Margin", desc: "EBITDA ÷ Revenue", range: "25 – 50%", rag: [">38% strong", "28–38% acceptable", "<28% weak"], notes: "Luxury hotels 35–45%, midscale 25–35%. Below 25% is operationally stressed." },
      { metric: "Exit Cap Rate", range: "3.5 – 9%", rag: ["4–6% prime", "6–7% secondary", ">7% distressed"], notes: "London luxury 3.5–5.5%, regional UK 5.5–7.5%, budget/limited service 7–10%." },
      { metric: "EBITDA per Key", range: "£10k – £150k+", rag: ["—", "—", "—"], notes: "Budget £10–20k, 4★ £30–60k, 5★ London £60–120k. Best cross-sectional benchmark." },
      { metric: "FF&E Reserve", desc: "% of total revenue", range: "3 – 5%", rag: ["3% standard", "2% low", "<2% risk"], notes: "Mandatory from Yr 3. Branded hotels often require 4–5% contractually." },
      { metric: "Price per Key", desc: "Acquisition cost", range: "£50k – £2.5m+", rag: ["—", "—", "—"], notes: "Budget £50–150k, 4★ regional £150–400k, 4★ London £400–800k, 5★ London £800k–2m+." },
    ],
    extra: [
      {
        title: "Revenue stream benchmarks",
        headers: ["Stream", "% of Total Revenue", "GOP Margin", "Notes"],
        rows: [
          { col1: "Rooms", col2: "60 – 80%", col3: "70–80%", col4: "Core revenue. High margin due to low variable cost per occupied room." },
          { col1: "F&B", col2: "15 – 30%", col3: "25–35%", col4: "High cost stream. Capture rate 40–70% of occupied room guests." },
          { col1: "Spa", col2: "3 – 8%", col3: "30–45%", col4: "Luxury only. Rev per available room £800–2,000 pa." },
          { col1: "Events / Meetings", col2: "5 – 15%", col3: "30–45%", col4: "Utilisation 40–65%. Day delegate rate £100–400." },
          { col1: "Gym", col2: "1 – 3%", col3: "55–70%", col4: "High margin, small revenue. Mainly amenity value." },
        ],
      },
    ],
  },
  flip: {
    description: "Residential flips buy, refurbish and sell (or hold) residential property. Returns are driven by GDV uplift vs total cost. Finance cost is critical on short holds.",
    tip: "Total Cost = Purchase + SDLT + Refurb + Prof Fees + Finance + Other. Finance = Loan × Rate%pm × Months. Always model exit costs before committing to purchase.",
    warning: "Bridging rates above 1.0%pm are very expensive. On a £500k loan for 12 months at 1%pm, interest alone = £60k+ before arrangement fees.",
    rows: [
      { metric: "Refurb Cost psf", range: "£30 – £200", rag: ["—", "—", "—"], notes: "Light cosmetic £30–50, full renovation £60–120, high-spec London £100–200+." },
      { metric: "ROI on Cost", desc: "Profit ÷ Total Cost", range: "10 – 30%", rag: [">20% strong", "12–20% acceptable", "<12% thin"], notes: "For 6-month hold, 20% ROI = ~40% annualised. Always account for all costs." },
      { metric: "Bridging Rate", range: "0.65 – 1.0% pm", rag: ["<0.75% competitive", "0.75–1.0% normal", ">1.0% expensive"], notes: "UK typical 0.65–0.85%pm. Above 1% is high — erodes returns quickly on longer holds." },
      { metric: "LTV (Bridge)", range: "65 – 75%", rag: ["<70% conservative", "70–75% standard", ">75% rare"], notes: "Most lenders cap at 75% LTV (day 1 value). Some 70% against OMV." },
      { metric: "GDV Uplift", desc: "Value add vs purchase", range: "15 – 40%", rag: [">25% strong", "15–25% viable", "<15% marginal"], notes: "Below 15% rarely justifies refurb cost plus finance and transaction costs." },
      { metric: "Agent Fees (Exit)", range: "1.0 – 2.5%", rag: ["—", "—", "—"], notes: "Typically 1.5–2% of GDV. Include in every flip model from day one." },
      { metric: "BTL Yield (Hold mode)", range: "4 – 8%", rag: [">5% viable", "4–5% thin", "<4% negative carry"], notes: "Gross yield. Net yield after costs typically 1.5–2% lower. Must cover mortgage." },
      { metric: "Hold Period", range: "3 – 18 months", rag: ["—", "—", "—"], notes: "Every additional month adds finance cost. 6–12m typical. Model sensitivity." },
    ],
  },
  commercial: {
    description: "Commercial property is valued by capitalising net rental income at the appropriate sector yield. WAULT (weighted average unexpired lease term) is critical to value.",
    tip: "GDV = Net Rent pa ÷ NIY. Ensure you use passing rent (not ERV) unless the property is fully let at market rent. Void allowance is applied to ERV not passing rent.",
    warning: "Sub-3 year WAULT is heavily discounted — often 50–100bps wider yield. Always check lease expiry profile before assuming full ERV capitalisation.",
    rows: [
      { metric: "NIY", desc: "Net Initial Yield", range: "4.0 – 12%", rag: ["—", "—", "—"], notes: "Prime London office 4–5.5%, grade B office 6–8%, prime retail 5–7%, industrial 4–6%." },
      { metric: "ERV psf", desc: "Estimated Rental Value", range: "£20 – £140 psf", rag: ["—", "—", "—"], notes: "West End £90–140, City £65–95, major regional £25–50, out-of-town £12–30 psf pa." },
      { metric: "Void Allowance", range: "5 – 20%", rag: ["<8% low risk", "8–15% moderate", ">15% speculative"], notes: "Prime fully let 0–5%. Refurb/repositioning 10–25% during lease-up." },
      { metric: "WAULT", desc: "Weighted avg lease term", range: "3 – 15+ years", rag: [">7yr strong", "3–7yr acceptable", "<3yr risk premium"], notes: "Longer WAULT = more secure income = lower exit yield required." },
      { metric: "Profit on Cost", range: "15 – 25%", rag: [">20% target", "15–20% acceptable", "<15% borderline"], notes: "Same thresholds as residential. 20% is the institutional minimum." },
      { metric: "OpEx psf pa", range: "£5 – £25", rag: ["—", "—", "—"], notes: "Grade A office £12–20 (service charge + rates). Industrial £3–8 psf." },
    ],
    extra: [
      {
        title: "UK sector yield guide (2024–25)",
        headers: ["Sector", "Prime NIY", "Secondary NIY", "Market trend"],
        rows: [
          { col1: "Office — London West End", col2: "3.75 – 4.5%", col3: "6.0 – 9.0%", col4: "Bifurcated — prime ESG-compliant holding, secondary under pressure." },
          { col1: "Office — City of London", col2: "4.25 – 5.5%", col3: "6.5 – 10%", col4: "Occupier flight to quality continues." },
          { col1: "Industrial / Logistics", col2: "4.0 – 5.5%", col3: "5.5 – 7.5%", col4: "Yields stabilised after 2022–23 correction. Rental growth supportive." },
          { col1: "Retail — High Street", col2: "6.0 – 8.0%", col3: "10 – 15%+", col4: "Structural headwinds. Leisure/F&B repurposing ongoing." },
          { col1: "Retail — Out of Town", col2: "6.5 – 8.5%", col3: "9 – 14%", col4: "Food-anchored parks outperforming fashion-led." },
          { col1: "Build-to-Rent (PRS)", col2: "3.75 – 5.0%", col3: "5.0 – 6.5%", col4: "Rental growth offsetting yield pressure in many markets." },
        ],
      },
    ],
  },
  mixeduse: {
    description: "Mixed use schemes combine residential and commercial uses. Each zone must be analysed independently first — a strong residential element can mask a failing commercial component.",
    tip: "Analyse each zone independently. If any zone fails viability on its own, the blended return masks the problem. Run sensitivity on the commercial component — it carries the most market risk.",
    warning: "Affordable housing obligations (typically 25–50% of units in London) significantly reduce GDV. Always model affordable tenure mix separately — social rent vs shared ownership have very different values.",
    rows: [
      { metric: "Zone Split (GFA)", desc: "% per use class", range: "Varies by site", rag: ["—", "—", "—"], notes: "Ground floor commercial + upper residential most common. Commercial GFA typically 10–30% of scheme." },
      { metric: "Residential PoC", range: "15 – 25%", rag: [">20%", "15–20%", "<15%"], notes: "Apply BTR or BTS benchmarks to residential component based on exit strategy." },
      { metric: "Commercial GDV", range: "NIY capitalisation", rag: ["—", "—", "—"], notes: "Capitalise at appropriate sector yield. Ground floor retail prime London 4.5–6%, secondary 7–10%." },
      { metric: "Blended PoC", range: "18 – 25%", rag: [">22% target", "18–22% acceptable", "<18% risk"], notes: "Blended PoC should exceed the higher of each component's standalone threshold + 2–3% risk premium." },
      { metric: "Affordable Housing", range: "25 – 50% of units", rag: ["—", "—", "—"], notes: "London plan 35–50%. Social rent, shared ownership and market sale all have different GDV implications." },
      { metric: "S106 / CIL", desc: "Planning obligations", range: "£0 – £200+ psf", rag: ["—", "—", "—"], notes: "Mayoral CIL Zone 1 £185 psf. Borough CIL additional. S106 negotiated per-scheme." },
      { metric: "LTC Finance", range: "55 – 65%", rag: ["<60% conservative", "60–65% standard", ">65% stretched"], notes: "Blended facility across whole scheme. Some lenders tranche by use class." },
    ],
  },
  finance: {
    description: "Development finance and SDLT are typically the largest variable costs after land and construction. Getting these right from day one avoids nasty surprises in the cost stack.",
    tip: "Finance cost = Arrangement Fee + Rolled Interest + Exit Fee. Interest compounds monthly on drawn balance — the S-curve drawdown means peak loan isn't reached until late in the build.",
    warning: "Never use a flat rate on peak loan for interest calculations — it overstates cost. Valora uses true monthly compounding on drawn balances, which is the institutional standard.",
    rows: [
      { metric: "LTC", desc: "Loan to Cost", range: "55 – 70%", rag: ["<65% conservative", "65–70% standard", ">75% stretched"], notes: "Senior development finance 60–65% typical. Mezzanine can push to 80–85% total but at very high cost." },
      { metric: "Margin over SONIA", range: "2.0 – 4.5%", rag: ["2.0–3.0% competitive", "3.0–4.0% normal", ">4.0% expensive"], notes: "Senior lenders 2.25–3.5% over SONIA. Bridging 0.65–1.0%pm all-in." },
      { metric: "Arrangement Fee", range: "1.0 – 2.0%", rag: ["1.0–1.5% standard", "1.5–2.0% high", ">2.0% expensive"], notes: "Charged on day 1 loan amount. 1.5% is most common. Exit fee 0.5–1% sometimes added." },
      { metric: "Professional Fees", range: "8 – 15% of build", rag: ["8–10% normal", "10–13% high", ">15% excessive"], notes: "Architects, engineers, QS, planning, legal. 10% of hard costs is typical." },
      { metric: "Contingency", range: "5 – 15%", rag: ["8–10% recommended", "5–8% low", "<5% risky"], notes: "Refurb 5–8%, newbuild 8–12%, complex/brownfield 10–15%. Never below 5%." },
      { metric: "SONIA Base Rate", range: "3.5 – 5.5% (2024–25)", rag: ["—", "—", "—"], notes: "Check live rate — Valora uses real-time SONIA in the benchmark field." },
    ],
    extra: [
      {
        title: "SDLT — residential rates",
        headers: ["Band", "Standard rate", "With 3% surcharge", "Notes"],
        rows: [
          { col1: "£0 – £250,000", col2: "0%", col3: "3%", col4: "Surcharge applies if you own another property." },
          { col1: "£250,001 – £925,000", col2: "5%", col3: "8%", col4: "Applied to the portion in this band only." },
          { col1: "£925,001 – £1,500,000", col2: "10%", col3: "13%", col4: "" },
          { col1: "£1,500,001+", col2: "12%", col3: "15%", col4: "Highest band — significant on prime assets." },
        ],
      },
      {
        title: "SDLT — commercial rates",
        headers: ["Band", "Rate", "Notes", ""],
        rows: [
          { col1: "£0 – £150,000", col2: "0%", col3: "Applies to commercial & mixed-use transactions.", col4: "" },
          { col1: "£150,001 – £250,000", col2: "2%", col3: "", col4: "" },
          { col1: "£250,001+", col2: "5%", col3: "SPV / share deal = 0.5% stamp duty on shares instead.", col4: "" },
        ],
      },
    ],
  },
};
const COMING_SOON_COURSES = [
  { title: "Development Finance Masterclass", level: "Intermediate", duration: "45 min", topics: ["LTC vs LTV", "Drawdown profiles", "Mezzanine structures", "Lender covenants"] },
  { title: "Hotel Underwriting Fundamentals", level: "Intermediate", duration: "60 min", topics: ["RevPAR analysis", "Cap rate selection", "IM waterfall structures", "Operator agreements"] },
  { title: "Residential Development Appraisal", level: "Beginner", duration: "30 min", topics: ["GDV calculation", "Profit on Cost", "Sensitivity analysis", "Viability basics"] },
  { title: "Commercial Yield Guide", level: "Advanced", duration: "50 min", topics: ["Sector yield benchmarks", "WAULT impact", "Void analysis", "ERV vs passing rent"] },
];
// ═══════════════════════════════════════════════════════════════════
// METHODOLOGY — how Valora's calc engine computes each model
// Uses the same visual components as Benchmarks (tip-box, warn-box,
// bench-card tables, section-label, mono) to stay on-brand.
// ═══════════════════════════════════════════════════════════════════
type MethSub = {
  heading?: string;
  body?: string;
  formula?: string;
  kv?: { label: string; value: string }[];
  table?: { headers: string[]; rows: string[][] };
  note?: string;
  warn?: string;
};
type MethSection = { id: string; label: string; full: string; tldr: string; intro: string; subs: MethSub[] };

const METHODOLOGY: MethSection[] = [
  {
    id: "foundation", label: "Foundation", full: "Shared Engine",
    tldr: "Deterministic building blocks every asset engine sits on top of.",
    intro: "Every Valora engine reduces to a small set of tested, pure functions. Understanding these lets you trace any number back to first principles — which is exactly what an IC analyst will want to do.",
    subs: [
      { heading: "Cashflow conventions — uCfs & lCfs", body: "Every engine emits two cashflow arrays. uCfs (unlevered) is asset-level: what the property generated, before debt. lCfs (levered) is equity-level: what the investor received, net of debt service and loan payoff. The invariant sum(uCfs) \u2248 profit holds for every engine except Hotel (where a documented stabilisation-NOI gap exists)." },
      { heading: "IRR calculation", body: "Monthly-compounded Newton-Raphson. Pathological inputs (all-zero arrays, negative-only flows, degenerate shapes) are guarded and return 0 rather than NaN or Infinity. Monthly IRR is annualised via (1 + monthlyIRR)\u00b9\u00b2 \u2212 1.", formula: "calcIRR(cashflows)  \u2192  annualised IRR" },
      { heading: "Drawdown profiles", body: "Construction costs flow over programmMonths in one of two shapes. S-curve models a realistic build ramp; straight-line applies equal slices. S-curve fits development; straight-line fits acquisition + stabilisation.", formula: "buildDrawdownProfile(months, 'scurve' | 'straight')  \u2192  number[]" },
      { heading: "Finance cost helper", body: "calcFinanceCostMonthly simulates a construction loan drawn monthly per profile. Interest accrues only on the drawn balance (not the full loan), then capitalises into principal at exit. Returns totalFinanceCost, arrangementFee, interestCost, exitFee, peakLoanBalance, and monthly arrays." },
      { heading: "Jurisdictional defaults", body: "15 currencies shipped with market-standard defaults: purchaser's costs (residential + commercial), opex percentages, DSCR floor, local transfer-tax label. User overrides always take precedence.", note: "Currencies not in the list fall back to GBP. Explicit per-deal overrides via data.opexPct, data.dscrFloor etc. always win." },
      { heading: "Sensitivity + Monte Carlo + Stress fuzzer", body: "Each sensitivity cell stores all four metrics (poc, irr, moic, profit) so the UI picker switches instantly. Monte Carlo accepts triangular / normal / uniform / fixed distributions with a deterministic PRNG seed. CI runs 3,500 random inputs on every push to ensure no NaN or phantom IRR ever leaks." },
    ],
  },
  {
    id: "btr-eng", label: "BTR", full: "Build to Rent",
    tldr: "Ground-up residential, held for rental income, exited at stabilised yield.",
    intro: "Returns are driven by Net Operating Income capitalised at the exit yield. The strength of the thesis is the spread between yield-on-cost and exit yield.",
    subs: [
      { heading: "Revenue & NOI", formula: "grossRentPa = \u03a3(unit.count \u00d7 unit.rentPcm \u00d7 12)\nNOI = grossRent \u00d7 (1 \u2212 voidPct) \u2212 opexPct \u00d7 grossRent\nGDV = NOI \u00f7 exitYield" },
      { heading: "Cashflow shape", body: "Day 1: Land + SDLT. Months 1 \u2192 programmMonths: Build drawn on profile, interest capitalised. Months programmMonths \u2192 totalMonths: Rent ramps linearly from 0 \u2192 100% during stabilisation. Exit at totalMonths." },
      { heading: "Residual Land Value", formula: "RLV = GDV \u00d7 0.80 \u2212 devCosts \u2212 financeCosts \u2212 SDLT" },
      { heading: "What you get back", kv: [
        { label: "GDV", value: "Institutional exit value at stabilised yield" },
        { label: "NOI", value: "Stabilised Yr 1 net operating income" },
        { label: "PoC / YoC", value: "Profit on Cost, Yield on Cost" },
        { label: "IRR, IRR Levered", value: "Annualised from monthly cashflows" },
        { label: "DSCR", value: "NOI \u00f7 annual debt service" },
        { label: "MOIC", value: "(Equity + Profit) \u00f7 Equity" },
        { label: "RLV", value: "Residual land value at 20% profit-on-GDV" },
      ] },
    ],
  },
  {
    id: "bts-eng", label: "BTS", full: "Build to Sell",
    tldr: "Sold to end-buyers at completion. No hold, no rental income.",
    intro: "Profit is driven by sale price psf vs development cost. Absorption timing materially affects IRR \u2014 the risk isn't rental, it's price discovery.",
    subs: [
      { heading: "Revenue model", formula: "GDV = \u03a3(unit.count \u00d7 unit.size \u00d7 unit.salePricePsf)\n      \u2212 agent fees (1.5% default)\n      \u2212 marketing (1% default)" },
      { heading: "Absorption timing", body: "Sales close over absorptionMonths from end of construction. 20-unit scheme absorbs in 6\u201312 months, 100-unit in 18\u201324, 200+ in 24\u201348. IRR is highly sensitive to this." },
      { heading: "How BTS differs from BTR", body: "No NOI, no yield input, no DSCR (there's no income to service debt with post-construction). Profit on Cost and Profit on GDV are the only headline metrics." },
      { heading: "Break-even sale price", formula: "breakEvenPsf = (totalCost \u00d7 1.20) \u00f7 totalArea" },
    ],
  },
  {
    id: "hotel-simple-eng", label: "Hotel \u2022 Simple", full: "Hotel \u2014 Simple Engine",
    tldr: "Quick-view underwriting for refurb-and-flip strategies.",
    intro: "Designed for 3\u20134 year holds: buy, refurb, stabilise, sell. Simple engine produces institutional output for this narrow use case with a tiny input surface.",
    subs: [
      { heading: "Revenue model", formula: "revenue = roomsRev + fnbRev + spaRev + gymRev + meetingRev\n  (each: per-key \u00d7 occupancy \u00d7 365)" },
      { heading: "USALI cascade \u2014 opt-in", body: "If the user enters undistributedPct, mgmtFeePct, or incentiveFeePct, Simple applies the full USALI cascade to produce institutional EBITDA. Defaults are 0 \u2014 existing deals behave exactly as before.", formula: "Rooms GOP + F&B GOP + ...  =  Department GOP\n  \u2212 Undistributed (undistributedPct \u00d7 revenue)\n  \u2212 Base Mgmt Fee (mgmtFeePct \u00d7 revenue)\n  \u2212 Incentive Fee (incentiveFeePct \u00d7 GOP after undistributed)\n  =  EBITDA\n  \u2212 FF&E Reserve (3% of revenue)\n  =  NOI" },
      { heading: "Exit capitalisation", formula: "exitValue = (NOI \u00d7 (1 + revparGrowthPct)) \u00f7 exitCapRate" },
      { heading: "Actual NOI override", body: "noiMode='actual' lets the user plug a known stabilised NOI (e.g. from the operator), bypassing the ADR/occupancy-derived figure. Engine uses it for exit cap, DSCR, and yield-on-cost." },
      { heading: "Interest handling", body: "Build-phase interest is capitalised into the loan principal. Stabilisation-phase interest is serviced from the ramping EBITDA (correctly applied in levered cashflow, but not currently shown as a line item in Finance Cost Summary).", note: "Simple engine timeline is programmMonths + stabilisationMonths. No separate 'operating hold' phase. For long-term stabilised holds, use Advanced." },
    ],
  },
  {
    id: "hotel-advanced-eng", label: "Hotel \u2022 Advanced", full: "Hotel \u2014 Advanced Engine",
    tldr: "Full USALI year-by-year institutional hotel model.",
    intro: "Designed for stabilised acquisition + operating hold + exit (5+ years). Each year has its own assumptions. Every USALI category is a separate editable input.",
    subs: [
      { heading: "Year-by-year revenue", body: "Occupancy and ADR can vary per year via yearOcc / yearAdr, or default to headline. Each year produces its own total revenue, Department GOP, EBITDA, and NOI." },
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
      { heading: "Capital structure", kv: [
        { label: "Single", value: "One LTC loan covering purchase + CapEx" },
        { label: "Dual", value: "Separate acquisition loan + capex facility at different rates" },
        { label: "Equity", value: "No debt \u2014 all-equity acquisition" },
      ] },
      { heading: "Interest calculation", body: "Total interest is computed as loanAmount \u00d7 (benchmarkRate + marginOverBenchmark) \u00d7 holdYears. This is paid over the hold, serviced from NOI \u2014 not capitalised.", warn: "This differs from Simple mode's build-phase capitalisation. Both are valid but different. See 'Simple \u2194 Advanced' for the comparison." },
      { heading: "IM (Investment Manager) overlay", body: "Optional layer for deals with external IM \u2014 acquisition fee (one-off), base annual charge, and incentive fees on sales and profit. Activate with imEnabled = true." },
    ],
  },
  {
    id: "flip-eng", label: "Flip", full: "Residential Flip",
    tldr: "Individual residential \u2014 three distinct modes with mode-specific metrics.",
    intro: "One engine, three strategies: sell on completion, hold as BTL, or refinance transitionally. Each mode evaluates success differently.",
    subs: [
      { heading: "Mode: Sell", body: "Bridge \u2192 refurb \u2192 sell on completion. Returns two profit figures: profit (accounting, sale \u2212 all costs) and profitCash (to equity after finance). The gap measures cost of leverage." },
      { heading: "Mode: Hold (BRRR)", body: "Buy, Refurb, Refinance, Rent. No sale exit. Investor extracts value via BTL refinance and rental income over long-term hold. Headline is Profit to Equity \u2014 accounting profit is meaningless here.", note: "For BRRR, evaluate: DSCR \u2265 1.25\u00d7, positive monthly carry, capital released at refi, MOIC > 2\u00d7 over hold. These are BTL metrics, not developer-trader metrics." },
      { heading: "Mode: Refi", body: "Transitional \u2014 bridge for acquisition/refurb, then refinance to BTL mortgage. Explicitly models rate delta between bridge and BTL. Useful for investors undecided between sell and hold." },
      { heading: "Bridging math", formula: "peakLoanBalance \u00d7 bridgingRatePct \u00d7 bridgingTermMonths  \u2248  total interest\n  (monthly compound on drawn balance, 0.65\u20131.0% per month = 8\u201312% annualised)" },
    ],
  },
  {
    id: "commercial-eng", label: "Commercial", full: "Commercial / Office / Industrial",
    tldr: "Yield-based valuation with WAULT discounting.",
    intro: "Exit value is net rental income capitalised at sector yield. WAULT (weighted average unexpired lease term) is the single most important discount driver.",
    subs: [
      { heading: "Simple vs Advanced", body: "Simple: whole scheme, single ERV + mgmt %. Advanced: individual units with ERV, passing rent, WAULT, void %, rent-free months, rent review type." },
      { heading: "GDV formula", formula: "GDV = netRent \u00f7 NIY \u00f7 (1 + purchasersCostsPct)" },
      { heading: "Rent review types", kv: [
        { label: "Fixed", value: "3% or user-set % every N years" },
        { label: "OMR", value: "Open Market Rent \u2014 ERV re-caps at review" },
        { label: "RPI", value: "CPI-linked growth each review period" },
      ] },
      { heading: "Exit methods (Advanced)", body: "Either investment exit (NOI \u00d7 1/NIY) or vacant possession exit (area \u00d7 VP psm). Choice drives the entire cashflow shape." },
    ],
  },
  {
    id: "mixeduse-eng", label: "Mixed Use", full: "Mixed Use Schemes",
    tldr: "Multi-zone schemes blending residential + commercial.",
    intro: "Every zone declares type, exit strategy, size, revenue, yield. BTR-style math for residential-hold, BTS-style for residential-sell, Commercial-style for commercial zones. Portfolio IRR sits on top.",
    subs: [
      { heading: "Zone structure", body: "zones[] array with { type, exitStrategy, size, revenue, exitYield }. Each zone computed in isolation, then combined into portfolio cashflows." },
      { heading: "Blended metrics", body: "totalGDV = \u03a3(zone.gdvZone). totalCost sums zone build costs + shared finance. PoC is portfolio-level. IRR is blended via combined cashflows.", warn: "Always stress-test each zone standalone. A strong residential component can mask a failing commercial component. Sub-zone IRR analysis is critical." },
      { heading: "Affordable housing", body: "London plan typically 35\u201350% affordable. Social rent, shared ownership, and market sale have very different GDVs \u2014 model tenure mix per unit group." },
    ],
  },
  {
    id: "compare-eng", label: "Simple \u2194 Advanced", full: "Simple vs Advanced \u2014 Hotel",
    tldr: "Both modes are valid but use different deal conventions.",
    intro: "Same inputs can produce different exit values, IRRs, and DSCRs \u2014 not because of bugs, but because each mode models a different strategy.",
    subs: [
      { heading: "Side-by-side", table: { headers: ["Topic", "Simple", "Advanced"], rows: [
        ["Timeline", "programmMonths + stabMonths", "holdYears (any)"],
        ["NOI model", "Steady-state post-stab", "Per-year"],
        ["USALI cascade", "Optional single pct", "Full USALI by category"],
        ["Rate input", "Single Mortgage Rate", "Benchmark + Margin"],
        ["Interest period", "Build phase only", "Full hold"],
        ["Capital structure", "Single LTC", "Single / Dual / Equity"],
        ["Non-operating", "In undistributedPct", "Separate RET + Insurance"],
        ["IM overlay", "\u2014", "Optional"],
      ] } },
      { heading: "When Simple is right", body: "Short-hold refurb-and-flip. Quick sanity checks. Early-stage deal evaluation. Deals where Department GOP \u2248 EBITDA is acceptable precision." },
      { heading: "When Advanced is right", body: "Stabilised acquisitions held 5+ years. IC-ready underwriting with cost transparency. Institutional deals with operator agreements defining per-category USALI." },
      { heading: "Reconciliation", body: "On identical inputs with explicit cascade pcts matching Advanced's defaults (22% undistributed, 3% mgmt fee), Simple and Advanced EBITDA agree within \u00b115%. CI-enforced.", note: "Seeing >20% gap on the same inputs? Check the cascade pcts and timeline alignment before assuming bug." },
    ],
  },
  {
    id: "jurisdictions-eng", label: "Jurisdictions", full: "Multi-Currency Defaults",
    tldr: "15 currencies with market-standard defaults. Overrides always win.",
    intro: "Every jurisdiction defines purchaser's costs, opex percentages, DSCR floor, and local transfer-tax label. Engine picks them up automatically based on the currency field.",
    subs: [
      { heading: "Per-currency defaults", table: { headers: ["Currency", "Resi P.C.", "Comm P.C.", "Opex %", "DSCR"], rows: [
        ["GBP", "5.75%", "6.75%", "25%", "1.25\u00d7"],
        ["EUR", "8.00%", "9.50%", "22%", "1.20\u00d7"],
        ["USD", "3.00%", "4.00%", "30%", "1.25\u00d7"],
        ["AED", "4.00%", "4.00%", "20%", "1.30\u00d7"],
        ["SGD", "5.00%", "6.00%", "22%", "1.25\u00d7"],
        ["AUD", "5.50%", "6.50%", "25%", "1.25\u00d7"],
        ["CHF", "4.50%", "5.50%", "20%", "1.20\u00d7"],
        ["INR", "7.00%", "8.00%", "28%", "1.30\u00d7"],
      ] } },
      { heading: "Transfer tax labels", body: "Each currency renders its local label: UK 'SDLT', EU 'IMT / ITP', USA 'Transfer Tax', UAE 'DLD Fee', Singapore 'BSD'. User-visible in Cost Stack." },
    ],
  },
  {
    id: "tests-eng", label: "Testing", full: "What's Protecting the Engine",
    tldr: "76 tests run on every push. Deploy is blocked on red.",
    intro: "Every engine change flows through a comprehensive test gate. If anything breaks, CI catches it before users see it.",
    subs: [
      { heading: "Test categories", kv: [
        { label: "IRR guards", value: "Pathological inputs never produce NaN" },
        { label: "SDLT bands", value: "UK residential bands verified exact" },
        { label: "Jurisdictions", value: "Profile resolution checked per currency" },
        { label: "Cashflow recon", value: "sum(cfs) = profit invariant" },
        { label: "Golden masters", value: "Headline metrics locked per asset" },
        { label: "Pathological inputs", value: "No crashes on 0s, empty arrays" },
        { label: "Stress fuzzer", value: "7 assets \u00d7 500 random = 3,500 calls" },
        { label: "Monte Carlo", value: "Distribution sampling + determinism" },
        { label: "Hotel reconciliation", value: "Simple \u2194 Advanced alignment" },
      ] },
      { heading: "What CI blocks", body: "Any failure turns the push red. Vercel doesn't auto-deploy red commits. Failing tests name the exact engine + metric that regressed, so root cause is immediate." },
    ],
  },
];
export default function LearnPage() {
  const router = useRouter();
  const [view, setView] = useState<"benchmarks" | "methodology">("benchmarks");
  const [activeModel, setActiveModel] = useState("btr");
  const [activeMeth, setActiveMeth] = useState("foundation");
  const bench = BENCHMARKS[activeModel];
  const meth = METHODOLOGY.find(s => s.id === activeMeth) || METHODOLOGY[0];
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
    const applyTheme = (t: "dark" | "light") => {
      document.documentElement.setAttribute("data-theme", t);
      document.body.classList.toggle("light", t === "light");
      try { localStorage.setItem("valora-theme", t); } catch {}
      try { localStorage.setItem("val-theme", t); } catch {}
    };
    const resync = () => applyTheme(detectTheme());
    resync();
    const onStorage = (e: StorageEvent) => { if (e.key && /theme/i.test(e.key)) resync(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", resync);
    document.addEventListener("visibilitychange", resync);
    const bodyObs = new MutationObserver(resync);
    bodyObs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    const htmlObs = new MutationObserver(resync);
    htmlObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", resync);
      document.removeEventListener("visibilitychange", resync);
      bodyObs.disconnect();
      htmlObs.disconnect();
    };
  }, []);
  return (
    <div style={{ minHeight: "100vh", background: "var(--val-bg-app)", display: "flex", fontFamily: "var(--val-font-body)" }}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

/* ─── VALORA TOKENS — DARK (default) ─── */
:root,
:root[data-theme="dark"]{
  --val-bg-app:#0F1115;--val-bg-panel:#1A1E26;--val-bg-panel-2:#242933;--val-bg-panel-3:#2D3340;
  --val-text:#F6F4EF;--val-text-mid:#C8CCD4;--val-text-dim:#949CA0;--val-text-faint:#6B7280;
  --val-gold:#C9A84C;
  --val-green:#52C498;--val-green-tint:rgba(82,196,152,0.12);--val-green-deep:#2E7D58;
  --val-amber:#F0A429;--val-amber-tint:rgba(240,164,41,0.12);
  --val-red:#F4645F;--val-red-tint:rgba(244,100,95,0.12);
  --val-blue:#5CA5DC;--val-blue-tint:rgba(92,165,220,0.12);
  --val-border:#383E4A;--val-border-lt:#4A505C;--val-border-accent:rgba(82,196,152,0.35);
  --val-font-body:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  --val-font-mono:'JetBrains Mono','SF Mono','Consolas',monospace;
  --val-r-xs:4px;--val-r-sm:6px;--val-r-md:8px;--val-r-lg:10px;--val-r-xl:12px;--val-r-pill:999px;
  --val-ease:cubic-bezier(0.16,1,0.3,1);
  --val-dur:180ms;
  --sidebar-w:232px;
  --val-navy:#1A1E26;
}
/* ─── LIGHT ─── */
body.light,
:root[data-theme="light"]{
  --val-bg-app:#F8F5EE;--val-bg-panel:#FFFFFF;--val-bg-panel-2:#F2EEE4;--val-bg-panel-3:#EAE5D8;
  --val-text:#0F1115;--val-text-mid:#3D4351;--val-text-dim:#6B7280;--val-text-faint:#A0A5AE;
  --val-gold:#A8843A;
  --val-green:#2E9E72;--val-green-tint:rgba(46,158,114,0.10);--val-green-deep:#1F7050;
  --val-amber:#C57E14;--val-amber-tint:rgba(197,126,20,0.10);
  --val-red:#C24844;--val-red-tint:rgba(194,72,68,0.10);
  --val-blue:#2D7AB5;--val-blue-tint:rgba(45,122,181,0.10);
  --val-border:rgba(15,17,21,0.10);--val-border-lt:rgba(15,17,21,0.18);--val-border-accent:rgba(46,158,114,0.35);
  /* Sidebar + hero stay dark-navy in both themes (matches mockup) */
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:var(--val-font-body);font-size:14px;line-height:1.45;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}

/* ─── SIDEBAR (always dark navy — matches mockup) ─── */
.sidebar{
  width:var(--sidebar-w);background:var(--val-navy);
  min-height:100vh;position:sticky;top:0;
  display:flex;flex-direction:column;flex-shrink:0;
  border-right:1px solid rgba(255,255,255,.05);
}
.nav-item{
  width:100%;text-align:left;
  padding:9px 14px;border:none;background:transparent;
  color:rgba(246,244,239,.55);font-size:13px;font-weight:500;letter-spacing:-.005em;
  cursor:pointer;border-radius:var(--val-r-md);
  transition:all var(--val-dur) var(--val-ease);
  display:flex;align-items:center;gap:8px;
  font-family:var(--val-font-body);
}
.nav-item:hover{background:rgba(255,255,255,.06);color:rgba(246,244,239,.95)}
.nav-item.active{background:var(--val-green-tint);color:var(--val-green);font-weight:600}

/* ─── MAIN ─── */
.main{flex:1;padding:0;overflow-y:auto}

/* ─── HERO (dark navy with green glow) ─── */
.hero{
  background:var(--val-navy);
  padding:48px 44px 40px;
  position:relative;overflow:hidden;
  border-bottom:1px solid rgba(255,255,255,.05);
}
.hero::after{
  content:"";position:absolute;right:-60px;top:-60px;width:340px;height:340px;
  border-radius:50%;
  background:radial-gradient(circle,rgba(82,196,152,.10) 0%,transparent 60%);
  pointer-events:none;
}
.model-pill{
  display:inline-flex;align-items:center;gap:6px;
  padding:7px 16px;border-radius:var(--val-r-pill);
  border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);
  color:rgba(246,244,239,.7);font-size:12px;font-weight:500;letter-spacing:-.015em;
  cursor:pointer;transition:all var(--val-dur) var(--val-ease);white-space:nowrap;
  font-family:var(--val-font-body);
}
.model-pill:hover{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
.model-pill.active{background:var(--val-green-tint);border-color:var(--val-border-accent);color:var(--val-green);font-weight:600}

/* ─── CONTENT ─── */
.content{padding:36px 44px;max-width:1080px;color:var(--val-text);background:var(--val-bg-app)}
.section-label{
  font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;
  color:var(--val-text-dim);margin-bottom:14px;
}

/* ─── BENCH CARD / TABLE ─── */
.bench-card{
  background:var(--val-bg-panel);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-lg);overflow:hidden;margin-bottom:24px;
}
table{width:100%;border-collapse:collapse}
th{
  text-align:left;padding:12px 18px;
  font-size:11px;font-weight:600;
  color:var(--val-text-dim);text-transform:uppercase;letter-spacing:.08em;
  border-bottom:1px solid var(--val-border);
  background:var(--val-bg-panel-2);white-space:nowrap;
}
td{
  padding:14px 18px;
  border-bottom:1px solid var(--val-border);
  font-size:13px;color:var(--val-text);vertical-align:top;line-height:1.55;
}
tr:last-child td{border-bottom:none}
tr:hover td{background:var(--val-bg-panel-2)}
.metric-name{font-weight:600;color:var(--val-text);letter-spacing:-.015em}
.metric-desc{font-size:11px;color:var(--val-text-dim);margin-top:3px;font-weight:500}
.mono{font-family:var(--val-font-mono);font-size:12px;font-variant-numeric:tabular-nums;font-weight:500}

/* ─── RAG PILLS ─── */
.pill{
  display:inline-block;padding:2px 8px;border-radius:var(--val-r-xs);
  font-size:11px;font-weight:600;letter-spacing:-.015em;margin:1px 1px;
}
.pill-g{background:var(--val-green-tint);color:var(--val-green)}
.pill-a{background:var(--val-amber-tint);color:var(--val-amber)}
.pill-r{background:var(--val-red-tint);color:var(--val-red)}

/* ─── TIP / WARN BOXES ─── */
.tip-box{
  padding:14px 18px;border-left:3px solid var(--val-green);
  background:var(--val-green-tint);border-radius:0 var(--val-r-md) var(--val-r-md) 0;
  font-size:13px;color:var(--val-text-mid);line-height:1.7;margin-bottom:14px;font-weight:500;
}
.warn-box{
  padding:14px 18px;border-left:3px solid var(--val-amber);
  background:var(--val-amber-tint);border-radius:0 var(--val-r-md) var(--val-r-md) 0;
  font-size:13px;color:var(--val-text-mid);line-height:1.7;margin-bottom:24px;font-weight:500;
}

/* ─── COURSE CARDS ─── */
.course-card{
  background:var(--val-bg-panel);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-lg);
  padding:22px;
  position:relative;overflow:hidden;
  transition:border-color var(--val-dur) var(--val-ease);
}
.course-card:hover{border-color:var(--val-border-lt)}
.course-card::before{
  content:"";position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--val-green-deep),var(--val-green));
}
.badge{
  display:inline-block;padding:2px 9px;border-radius:var(--val-r-xs);
  font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;
}
.badge-begin{background:var(--val-green-tint);color:var(--val-green)}
.badge-inter{background:var(--val-blue-tint);color:var(--val-blue)}
.badge-adv{background:var(--val-amber-tint);color:var(--val-amber)}
.soon-badge{
  position:absolute;top:18px;right:18px;
  background:var(--val-bg-panel-2);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-sm);
  padding:3px 9px;font-size:10px;color:var(--val-text-dim);font-weight:600;
  letter-spacing:-.015em;
}
.topic-tag{
  display:inline-block;padding:3px 9px;border-radius:var(--val-r-xs);
  font-size:11px;background:var(--val-bg-panel-2);color:var(--val-text-mid);margin:2px;
  font-weight:500;letter-spacing:-.015em;
}

@media(max-width:900px){
  .sidebar{display:none}
  .content{padding:24px 20px}
  .hero{padding:28px 20px}
}
      `}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var keys=['valora-theme','val-theme','theme'];for(var i=0;i<keys.length;i++){var v=localStorage.getItem(keys[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='light';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');else if(document.body)document.body.classList.remove('light');try{localStorage.setItem('valora-theme',t);localStorage.setItem('val-theme',t);}catch(e){}}catch(e){}})()`}}/>
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#F6F4EF", letterSpacing: "-.015em", lineHeight: 1 }}>Valora</div>
          <div style={{ fontSize: 10, color: "rgba(246,244,239,.35)", letterSpacing: ".14em", textTransform: "uppercase", marginTop: 4, fontWeight: 500 }}>Development Appraisal</div>
        </div>
        <div style={{ padding: "16px 10px", flex: 1 }}>
          <div style={{ fontSize: 10, color: "rgba(246,244,239,.35)", textTransform: "uppercase", letterSpacing: ".14em", padding: "0 12px", marginBottom: 8, fontWeight: 600 }}>Navigation</div>
          <button className="nav-item" onClick={() => router.push("/dashboard")}>← Dashboard</button>
          <button className="nav-item active">Learn</button>
          <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "12px 8px" }} />
          <div style={{ fontSize: 10, color: "rgba(246,244,239,.35)", textTransform: "uppercase", letterSpacing: ".14em", padding: "0 12px", marginBottom: 8, fontWeight: 600 }}>Benchmarks</div>
          {MODELS.map(m => (
            <button key={m.id} className={`nav-item ${view === "benchmarks" && activeModel === m.id ? "active" : ""}`} onClick={() => { setView("benchmarks"); setActiveModel(m.id); }}>
              {m.label} <span style={{ fontSize: 11, opacity: .5, fontWeight: 400 }}>— {m.full}</span>
            </button>
          ))}
          <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "12px 8px" }} />
          <div style={{ fontSize: 10, color: "rgba(246,244,239,.35)", textTransform: "uppercase", letterSpacing: ".14em", padding: "0 12px", marginBottom: 8, fontWeight: 600 }}>Methodology</div>
          {METHODOLOGY.map(s => (
            <button key={s.id} className={`nav-item ${view === "methodology" && activeMeth === s.id ? "active" : ""}`} onClick={() => { setView("methodology"); setActiveMeth(s.id); }}>
              {s.label} <span style={{ fontSize: 11, opacity: .5, fontWeight: 400 }}>— {s.full}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Main content */}
      <div className="main">
        {/* Hero — switches between Benchmarks and Methodology contexts */}
        {view === "benchmarks" ? (
          <div className="hero">
            <div style={{ fontSize: 11, color: "rgba(246,244,239,.4)", textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 12, fontWeight: 600 }}>Valora Learn</div>
            <h1 style={{ fontSize: 34, fontWeight: 700, color: "#F6F4EF", letterSpacing: "-.03em", marginBottom: 10, lineHeight: 1.1 }}>Benchmark Reference</h1>
            <p style={{ fontSize: 14, color: "rgba(246,244,239,.55)", maxWidth: 600, lineHeight: 1.6, marginBottom: 26, fontWeight: 500 }}>
              Institutional benchmarks for every asset model. Use these when you're unsure about inputs — built from real market data and updated regularly.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {MODELS.map(m => (
                <button key={m.id} className={`model-pill ${activeModel === m.id ? "active" : ""}`} onClick={() => { setView("benchmarks"); setActiveModel(m.id); }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="hero">
            <div style={{ fontSize: 11, color: "rgba(246,244,239,.4)", textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 12, fontWeight: 600 }}>Valora Learn · Methodology</div>
            <h1 style={{ fontSize: 34, fontWeight: 700, color: "#F6F4EF", letterSpacing: "-.03em", marginBottom: 10, lineHeight: 1.1 }}>{meth.full}</h1>
            <p style={{ fontSize: 14, color: "rgba(246,244,239,.55)", maxWidth: 700, lineHeight: 1.6, marginBottom: 26, fontWeight: 500 }}>
              {meth.tldr}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {METHODOLOGY.slice(0, 7).map(s => (
                <button key={s.id} className={`model-pill ${activeMeth === s.id ? "active" : ""}`} onClick={() => { setView("methodology"); setActiveMeth(s.id); }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="content">{view === "methodology" ? (
          <>
            <p style={{ fontSize: 14, color: "var(--val-text-mid)", lineHeight: 1.7, marginBottom: 24, fontWeight: 500 }}>{meth.intro}</p>
            {meth.subs.map((sub, i) => (
              <div key={i} style={{ marginBottom: 22 }}>
                {sub.heading && <div className="section-label" style={{ marginTop: 10 }}>{sub.heading}</div>}
                {sub.body && <p style={{ fontSize: 13.5, color: "var(--val-text-mid)", lineHeight: 1.7, marginBottom: 10, fontWeight: 500, maxWidth: 820 }}>{sub.body}</p>}
                {sub.formula && (
                  <div className="tip-box" style={{ fontFamily: "var(--val-font-mono)", fontSize: 12, whiteSpace: "pre-wrap" as const, lineHeight: 1.75 }}>
                    <span style={{ fontWeight: 600, color: "var(--val-green)", marginRight: 6, fontFamily: "var(--val-font-body)" }}>Formula:</span>
                    {sub.formula}
                  </div>
                )}
                {sub.kv && (
                  <div className="bench-card" style={{ marginTop: 6 }}>
                    <table>
                      <tbody>
                        {sub.kv.map((item, j) => (
                          <tr key={j}>
                            <td style={{ width: "32%" }}><span className="metric-name" style={{ fontFamily: "var(--val-font-mono)", color: "var(--val-green)" }}>{item.label}</span></td>
                            <td style={{ fontSize: 13, color: "var(--val-text-mid)" }}>{item.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {sub.table && (
                  <div className="bench-card" style={{ marginTop: 6 }}>
                    <table>
                      <thead><tr>{sub.table.headers.map((h, hi) => <th key={hi}>{h}</th>)}</tr></thead>
                      <tbody>
                        {sub.table.rows.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td key={ci} style={{ fontSize: 12.5, color: ci === 1 ? "var(--val-green)" : ci === 0 ? "var(--val-text)" : "var(--val-text-mid)", fontFamily: ci === 1 ? "var(--val-font-mono)" : "inherit", fontWeight: ci === 0 ? 600 : 500 }}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {sub.note && (
                  <div className="tip-box">
                    <span style={{ fontWeight: 600, color: "var(--val-green)", marginRight: 6 }}>Note:</span>
                    {sub.note}
                  </div>
                )}
                {sub.warn && (
                  <div className="warn-box">
                    <span style={{ fontWeight: 600, color: "var(--val-amber)", marginRight: 6 }}>Watch out:</span>
                    {sub.warn}
                  </div>
                )}
              </div>
            ))}
            {(() => {
              const idx = METHODOLOGY.findIndex(s => s.id === activeMeth);
              const prev = idx > 0 ? METHODOLOGY[idx - 1] : null;
              const next = idx < METHODOLOGY.length - 1 ? METHODOLOGY[idx + 1] : null;
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 36, paddingTop: 22, borderTop: "1px solid var(--val-border)" }}>
                  {prev ? (
                    <button onClick={() => setActiveMeth(prev.id)} style={{ textAlign: "left", padding: "14px 18px", background: "var(--val-bg-panel)", border: "1px solid var(--val-border)", borderRadius: "var(--val-r-lg)", cursor: "pointer", fontFamily: "inherit" }}>
                      <div style={{ fontSize: 10, color: "var(--val-text-dim)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600, marginBottom: 4 }}>← Previous</div>
                      <div style={{ fontSize: 13, color: "var(--val-text)", fontWeight: 600, letterSpacing: "-.015em" }}>{prev.full}</div>
                    </button>
                  ) : <div />}
                  {next ? (
                    <button onClick={() => setActiveMeth(next.id)} style={{ textAlign: "right", padding: "14px 18px", background: "var(--val-bg-panel)", border: "1px solid var(--val-border)", borderRadius: "var(--val-r-lg)", cursor: "pointer", fontFamily: "inherit" }}>
                      <div style={{ fontSize: 10, color: "var(--val-text-dim)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600, marginBottom: 4 }}>Next →</div>
                      <div style={{ fontSize: 13, color: "var(--val-text)", fontWeight: 600, letterSpacing: "-.015em" }}>{next.full}</div>
                    </button>
                  ) : <div />}
                </div>
              );
            })()}
            <div style={{ height: 40 }} />
          </>
        ) : (<>
          {/* Description */}
          <p style={{ fontSize: 14, color: "var(--val-text-mid)", lineHeight: 1.7, marginBottom: 20, fontWeight: 500 }}>{bench.description}</p>
          {/* Key formula */}
          <div className="tip-box">
            <span style={{ fontWeight: 600, color: "var(--val-green)", marginRight: 6 }}>Formula:</span>
            {bench.tip}
          </div>
          {/* Warning */}
          <div className="warn-box">
            <span style={{ fontWeight: 600, color: "var(--val-amber)", marginRight: 6 }}>Watch out:</span>
            {bench.warning}
          </div>
          {/* Main benchmark table */}
          <div className="section-label">Input & metric benchmarks</div>
          <div className="bench-card">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "22%" }}>Metric</th>
                  <th style={{ width: "16%" }}>Typical range</th>
                  <th style={{ width: "30%" }}>RAG thresholds</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {bench.rows.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <div className="metric-name">{row.metric}</div>
                      {row.desc && <div className="metric-desc">{row.desc}</div>}
                    </td>
                    <td><span className="mono">{row.range}</span></td>
                    <td>
                      {row.rag && row.rag[0] !== "—" ? (
                        <>
                          <span className="pill pill-g">{row.rag[0]}</span>
                          <span className="pill pill-a">{row.rag[1]}</span>
                          <span className="pill pill-r">{row.rag[2]}</span>
                        </>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--val-text-dim)", fontWeight: 500 }}>Contextual — see notes</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--val-text-mid)", fontWeight: 500 }}>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Extra tables */}
          {bench.extra?.map((ext, ei) => (
            <div key={ei}>
              <div className="section-label" style={{ marginTop: 8 }}>{ext.title}</div>
              <div className="bench-card">
                <table>
                  <thead>
                    <tr>{ext.headers.map((h, hi) => <th key={hi}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {ext.rows.map((row, ri) => (
                      <tr key={ri}>
                        <td><div className="metric-name">{row.col1}</div></td>
                        <td><span className="mono">{row.col2}</span></td>
                        <td style={{ fontSize: 12, color: "var(--val-text-mid)", fontWeight: 500 }}>{row.col3}</td>
                        {row.col4 !== undefined && <td style={{ fontSize: 12, color: "var(--val-text-mid)", fontWeight: 500 }}>{row.col4}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {/* Coming soon courses */}
          <div style={{ marginTop: 44 }}>
            <div className="section-label">Courses — coming soon</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {COMING_SOON_COURSES.map((course, i) => (
                <div key={i} className="course-card">
                  <div className="soon-badge">Coming soon</div>
                  <span className={`badge ${course.level === "Beginner" ? "badge-begin" : course.level === "Advanced" ? "badge-adv" : "badge-inter"}`}>{course.level}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--val-text)", margin: "12px 0 6px", lineHeight: 1.3, letterSpacing: "-.015em" }}>{course.title}</h3>
                  <div style={{ fontSize: 12, color: "var(--val-text-dim)", marginBottom: 12, fontWeight: 500 }}>{course.duration}</div>
                  <div>{course.topics.map((t, ti) => <span key={ti} className="topic-tag">{t}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 60 }} />
        </>)}</div>
      </div>
    </div>
  );
}
