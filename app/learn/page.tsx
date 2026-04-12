"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function LearnPage() {
  const router = useRouter();
  const [activeModel, setActiveModel] = useState("btr");
  const bench = BENCHMARKS[activeModel];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex" }}>
      <style>{`
        :root{--bg:#f8f9fa;--bg2:#ffffff;--bg3:#f1f3f5;--bg4:#e8eaed;--border:#e2e5e9;--text:#1a1f2e;--text-m:#4a5568;--text-d:#9aa0ac;--gold:#2a8a64;--gold-light:#e1f5ee;--gold-border:rgba(42,138,100,.2);--navy:#252D3F;--sidebar-w:220px}
        @media(prefers-color-scheme:dark){:root{--bg:#0f1117;--bg2:#181c27;--bg3:#1e2330;--bg4:#252d3f;--border:#2a3040;--text:#e8edf5;--text-m:#8892a4;--text-d:#4a5568;--gold:#52c498;--gold-light:rgba(82,196,152,.08);--gold-border:rgba(82,196,152,.2)}}
        *{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',system-ui,sans-serif}
        .sidebar{width:var(--sidebar-w);background:var(--navy);min-height:100vh;position:sticky;top:0;display:flex;flex-direction:column;flex-shrink:0}
        .nav-item{width:100%;text-align:left;padding:9px 14px;border:none;background:transparent;color:rgba(255,255,255,.55);font-size:13px;cursor:pointer;border-radius:6px;transition:all .15s;display:flex;align-items:center;gap:8px}
        .nav-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.9)}
        .nav-item.active{background:rgba(82,196,152,.12);color:#52c498}
        .main{flex:1;padding:0;overflow-y:auto}
        .hero{background:var(--navy);padding:40px 40px 36px;position:relative;overflow:hidden}
        .hero::after{content:"";position:absolute;right:-40px;top:-40px;width:300px;height:300px;border-radius:50%;background:rgba(42,138,100,.08);pointer-events:none}
        .model-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:rgba(255,255,255,.7);font-size:12px;cursor:pointer;transition:all .15s;white-space:nowrap}
        .model-pill:hover{background:rgba(255,255,255,.1);color:#fff}
        .model-pill.active{background:rgba(42,138,100,.25);border-color:rgba(42,138,100,.5);color:#52c498}
        .content{padding:32px 40px;max-width:1000px}
        .section-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--text-d);margin-bottom:12px}
        .bench-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:24px}
        .bench-header{padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
        table{width:100%;border-collapse:collapse}
        th{text-align:left;padding:10px 16px;font-size:11px;font-weight:600;color:var(--text-d);text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--border);background:var(--bg3);white-space:nowrap}
        td{padding:12px 16px;border-bottom:1px solid var(--border);font-size:13px;color:var(--text);vertical-align:top;line-height:1.5}
        tr:last-child td{border-bottom:none}
        tr:hover td{background:var(--bg3)}
        .metric-name{font-weight:500;color:var(--text)}
        .metric-desc{font-size:11px;color:var(--text-d);margin-top:2px}
        .mono{font-family:'DM Mono',monospace;font-size:12px}
        .pill{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:500;margin:1px 1px}
        .pill-g{background:#e1f5ee;color:#085041}
        .pill-a{background:#faeeda;color:#633806}
        .pill-r{background:#fcebeb;color:#791f1f}
        .tip-box{padding:14px 18px;border-left:3px solid var(--gold);background:var(--gold-light);border-radius:0 8px 8px 0;font-size:13px;color:var(--text-m);line-height:1.7;margin-bottom:12px}
        .warn-box{padding:14px 18px;border-left:3px solid #c07030;background:rgba(192,112,48,.06);border-radius:0 8px 8px 0;font-size:13px;color:var(--text-m);line-height:1.7;margin-bottom:24px}
        .course-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;position:relative;overflow:hidden}
        .course-card::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#2a8a64,#52c498)}
        .badge{display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em}
        .badge-begin{background:#e1f5ee;color:#0f6e56}
        .badge-inter{background:#e6f1fb;color:#0c447c}
        .badge-adv{background:#faeeda;color:#633806}
        .soon-badge{position:absolute;top:16px;right:16px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:3px 8px;font-size:10px;color:var(--text-d);font-weight:500}
        .topic-tag{display:inline-block;padding:3px 8px;border-radius:6px;font-size:11px;background:var(--bg3);color:var(--text-m);margin:2px}
        @media(max-width:768px){.sidebar{display:none}.content{padding:20px}.hero{padding:24px 20px}}
      `}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", letterSpacing: "-.02em" }}>Valora</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", letterSpacing: ".18em", textTransform: "uppercase", marginTop: 2 }}>Development Appraisal</div>
        </div>
        <div style={{ padding: "14px 10px", flex: 1 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 10px", marginBottom: 6 }}>Navigation</div>
          <button className="nav-item" onClick={() => router.push("/dashboard")}>← Dashboard</button>
          <button className="nav-item active">Learn</button>
          <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "10px 0" }} />
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 10px", marginBottom: 6 }}>Benchmarks</div>
          {MODELS.map(m => (
            <button key={m.id} className={`nav-item ${activeModel === m.id ? "active" : ""}`} onClick={() => setActiveModel(m.id)}>
              {m.label} <span style={{ fontSize: 11, opacity: .5 }}>— {m.full}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="main">
        {/* Hero */}
        <div className="hero">
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 10 }}>Valora Learn</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-.03em", marginBottom: 8 }}>Benchmark Reference</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", maxWidth: 560, lineHeight: 1.6, marginBottom: 24 }}>
            Institutional benchmarks for every asset model. Use these when you're unsure about inputs — built from real market data and updated regularly.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MODELS.map(m => (
              <button key={m.id} className={`model-pill ${activeModel === m.id ? "active" : ""}`} onClick={() => setActiveModel(m.id)}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="content">
          {/* Description */}
          <p style={{ fontSize: 14, color: "var(--text-m)", lineHeight: 1.7, marginBottom: 20 }}>{bench.description}</p>

          {/* Key formula */}
          <div className="tip-box">
            <span style={{ fontWeight: 600, color: "var(--gold)", marginRight: 6 }}>Formula:</span>
            {bench.tip}
          </div>

          {/* Warning */}
          <div className="warn-box">
            <span style={{ fontWeight: 600, color: "#c07030", marginRight: 6 }}>Watch out:</span>
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
                        <span style={{ fontSize: 12, color: "var(--text-d)" }}>Contextual — see notes</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-m)" }}>{row.notes}</td>
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
                        <td style={{ fontSize: 12, color: "var(--text-m)" }}>{row.col3}</td>
                        {row.col4 !== undefined && <td style={{ fontSize: 12, color: "var(--text-m)" }}>{row.col4}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Coming soon courses */}
          <div style={{ marginTop: 40 }}>
            <div className="section-label">Courses — coming soon</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {COMING_SOON_COURSES.map((course, i) => (
                <div key={i} className="course-card">
                  <div className="soon-badge">Coming soon</div>
                  <span className={`badge ${course.level === "Beginner" ? "badge-begin" : course.level === "Advanced" ? "badge-adv" : "badge-inter"}`}>{course.level}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: "10px 0 6px", lineHeight: 1.3 }}>{course.title}</h3>
                  <div style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 12 }}>{course.duration}</div>
                  <div>{course.topics.map((t, ti) => <span key={ti} className="topic-tag">{t}</span>)}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 60 }} />
        </div>
      </div>
    </div>
  );
}
