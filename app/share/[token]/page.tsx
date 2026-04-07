"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect, Suspense } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams } from "next/navigation";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.theme-dark{
  --bg:#06070a;--bg1:#0c0e12;--bg2:#12151a;--bg3:#191d24;--bg4:#21262f;--bg5:#2a303b;
  --text:#eceae4;--text-m:#7d8590;--text-d:#3d4249;
  --border:rgba(255,255,255,0.06);--border-m:rgba(255,255,255,0.12);
  --card-bg:#12151a;--card-border:rgba(255,255,255,0.06);
  --section-bg:#0c0e12;--divider:rgba(255,255,255,0.06);
  --tog-bg:#191d24;--tog-active:#c9a84c;--tog-text:#7d8590;
}
.theme-light{
  --bg:#f8f7f4;--bg1:#ffffff;--bg2:#ffffff;--bg3:#f3f1ec;--bg4:#e8e4dc;--bg5:#d8d4cb;
  --text:#1a1814;--text-m:#6b6560;--text-d:#9c9890;
  --border:rgba(0,0,0,0.08);--border-m:rgba(0,0,0,0.14);
  --card-bg:#ffffff;--card-border:rgba(0,0,0,0.08);
  --section-bg:#f3f1ec;--divider:rgba(0,0,0,0.07);
  --tog-bg:#e8e4dc;--tog-active:#c9a84c;--tog-text:#6b6560;
}
:root{
  --gold:#c9a84c;--gold-l:#e2c97e;--gold-bg:rgba(201,168,76,0.08);--gold-border:rgba(201,168,76,0.25);
  --green:#2da870;--red:#d94f4a;--amber:#d4891a;--blue:#4a8ae8;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}
body{font-family:var(--font-body);-webkit-font-smoothing:antialiased;transition:background .3s,color .3s}
.page-wrap{background:var(--bg);color:var(--text);min-height:100vh;transition:background .3s,color .3s}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both}
.theme-toggle{display:flex;align-items:center;background:var(--tog-bg);border-radius:20px;padding:3px;gap:2px;border:1px solid var(--border)}
.theme-toggle button{padding:5px 12px;border-radius:16px;border:none;cursor:pointer;font-family:var(--font-body);font-size:11px;font-weight:500;letter-spacing:.04em;transition:all .2s;background:transparent;color:var(--tog-text)}
.theme-toggle button.active{background:var(--tog-active);color:#06070a}
.hero{padding:48px 0 40px;border-bottom:1px solid var(--divider);position:relative;overflow:hidden}
.hero-inner{max-width:1080px;margin:0 auto;padding:0 48px}
.hero-eyebrow{display:flex;align-items:center;gap:8px;margin-bottom:18px;flex-wrap:wrap}
.hero-title{font-family:var(--font-display);font-size:clamp(36px,5vw,64px);font-weight:300;line-height:1.05;letter-spacing:-.01em;margin-bottom:8px}
.hero-subtitle{font-size:14px;color:var(--text-m);letter-spacing:.02em}
.metric-strip{display:grid;gap:0;border:1px solid var(--border);border-radius:12px;overflow:hidden;margin:36px 0}
.metric-strip-inner{display:grid}
.metric-cell{padding:20px 24px;border-right:1px solid var(--border);position:relative}
.metric-cell:last-child{border-right:none}
.metric-cell-label{font-size:10px;color:var(--text-d);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;font-family:var(--font-body)}
.metric-cell-value{font-family:var(--font-display);font-size:clamp(28px,3vw,40px);font-weight:300;line-height:1;letter-spacing:-.01em}
.metric-cell-sub{font-size:11px;color:var(--text-d);margin-top:6px;font-family:var(--font-mono)}
.inst-strip{display:grid;gap:0;border:1px solid var(--gold-border);border-radius:10px;overflow:hidden;background:var(--gold-bg);margin-bottom:36px}
.inst-cell{padding:14px 20px;border-right:1px solid var(--gold-border)}
.inst-cell:last-child{border-right:none}
.inst-cell-label{font-size:9px;color:var(--gold);text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px}
.inst-cell-value{font-family:var(--font-mono);font-size:15px;font-weight:500;color:var(--text)}
.content-wrap{max-width:1080px;margin:0 auto;padding:40px 48px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.three-col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
.six-col{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
.section-hdr{font-size:9px;text-transform:uppercase;letter-spacing:.14em;color:var(--text-d);margin-bottom:14px;font-family:var(--font-body);font-weight:600}
.data-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;padding:20px 22px}
.data-row{display:flex;justify-content:space-between;align-items:baseline;padding:9px 0;border-bottom:1px solid var(--divider);gap:16px}
.data-row:last-child{border-bottom:none}
.data-label{font-size:12px;color:var(--text-m);flex-shrink:0}
.data-value{font-family:var(--font-mono);font-size:12px;font-weight:500;text-align:right}
.data-label-bold{font-size:12px;color:var(--text);font-weight:600;flex-shrink:0}
.data-value-bold{font-family:var(--font-mono);font-size:13px;font-weight:600;text-align:right}
.section-gap{margin-bottom:28px}
.poc-bar-wrap{background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;padding:18px 22px;margin-bottom:28px}
.poc-bar-track{height:5px;background:var(--bg4);border-radius:3px;overflow:hidden;margin:10px 0 6px}
.poc-bar-fill{height:100%;border-radius:3px;transition:width .8s cubic-bezier(.16,1,.3,1)}
.unit-table{width:100%;border-collapse:collapse}
.unit-th{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:var(--text-d);padding:0 0 10px;border-bottom:1px solid var(--divider);text-align:left;font-family:var(--font-body);font-weight:600}
.unit-th:not(:first-child){text-align:right}
.unit-td{font-size:12px;color:var(--text-m);padding:9px 0;border-bottom:1px solid var(--divider);vertical-align:top}
.unit-td:not(:first-child){text-align:right;font-family:var(--font-mono)}
.unit-td-name{color:var(--text);font-weight:500}
.share-footer{border-top:1px solid var(--divider);padding:24px 48px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;max-width:1080px;margin:0 auto}
.badge{display:inline-flex;align-items:center;gap:5px;background:var(--gold-bg);border:1px solid var(--gold-border);color:var(--gold);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:.06em}
.badge-type{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:.06em}
.adv-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(212,137,26,.12);border:1px solid rgba(212,137,26,.3);color:#d4891a;padding:3px 9px;border-radius:20px;font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}
.sec-divider{height:1px;background:var(--divider);margin:32px 0}
/* Cashflow table */
.cf-table{width:100%;border-collapse:collapse;font-size:11px}
.cf-th{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-d);padding:6px 10px;border-bottom:1px solid var(--divider);text-align:right;font-family:var(--font-body);white-space:nowrap}
.cf-th:first-child{text-align:left}
.cf-td{padding:7px 10px;border-bottom:1px solid var(--divider);font-family:var(--font-mono);font-size:11px;text-align:right;color:var(--text-m)}
.cf-td:first-child{text-align:left;color:var(--text-m);font-family:var(--font-body)}
.cf-tr-exit .cf-td{color:var(--gold)}
/* Per key grid */
.per-key-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
.per-key-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:14px 16px}
.per-key-label{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:var(--text-d);margin-bottom:6px}
.per-key-value{font-family:var(--font-mono);font-size:16px;font-weight:500}
/* Summary return cards */
.return-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}
.return-card{background:var(--bg3);border:1px solid var(--border);border-radius:9px;padding:14px 16px}
.return-card-label{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-d);margin-bottom:6px}
.return-card-value{font-family:var(--font-mono);font-size:17px;font-weight:600}
@media(max-width:768px){
  .hero-inner,.content-wrap{padding:24px 20px}
  .hero-title{font-size:clamp(28px,6vw,42px)}
  .metric-strip-inner{grid-template-columns:1fr 1fr !important}
  .metric-cell{border-right:none;border-bottom:1px solid var(--border)}
  .inst-strip{grid-template-columns:1fr 1fr !important}
  .inst-cell{border-right:none;border-bottom:1px solid var(--gold-border)}
  .inst-cell:last-child{border-bottom:none}
  .two-col,.three-col,.six-col,.per-key-grid,.return-cards{grid-template-columns:1fr 1fr}
  .share-footer{padding:20px}
}
@media(max-width:480px){
  .metric-strip-inner,.inst-strip,.return-cards{grid-template-columns:1fr !important}
  .per-key-grid{grid-template-columns:1fr 1fr}
}
`;

const fmt = (n: number, prefix = "£") => {
  if (!isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${n < 0 ? "-" : ""}${prefix}${(Math.abs(n) / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${n < 0 ? "-" : ""}${prefix}${(Math.abs(n) / 1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${n < 0 ? "-" : ""}${prefix}${(Math.abs(n) / 1e3).toFixed(0)}k`;
  return `${n < 0 ? "-" : ""}${prefix}${Math.abs(n).toFixed(0)}`;
};
const fmtPct = (n: number) => (!isFinite(n) || isNaN(n) ? "—" : `${(n * 100).toFixed(1)}%`);
const fmtX = (n: number) => (!isFinite(n) || isNaN(n) || n === 0 ? "—" : `${n.toFixed(2)}×`);
const num = (v: string) => parseFloat(String(v).replace(/[£,%\s]/g, "")) || 0;

const TYPE_COLOR: Record<string, string> = { BTR: "#c9a84c", BTS: "#4a8ae8", Hotel: "#d4891a", Flip: "#2da870" };
const TYPE_BG: Record<string, string> = { BTR: "rgba(201,168,76,.12)", BTS: "rgba(74,138,232,.12)", Hotel: "rgba(212,137,26,.12)", Flip: "rgba(45,168,112,.12)" };

function calcCosts(snap: any) {
  const t = snap.assetType || "BTR";
  if (t === "BTR" || t === "BTS") {
    const units = snap.units || [];
    const totalSqft = units.reduce((s: number, u: any) => s + num(String(u.count)) * num(String(u.size)), 0);
    const buildCost = totalSqft * num(String(snap.buildCostPsf || 0));
    const profFees = buildCost * (num(String(snap.professionalFeesPct || 0)) / 100);
    const contingency = buildCost * (num(String(snap.contingencyPct || 0)) / 100);
    const gdvBts = t === "BTS" ? units.reduce((s: number, u: any) => s + num(String(u.count)) * num(String(u.size)) * num(String(u.salePricePsf)), 0) : 0;
    const agentFee = t === "BTS" ? gdvBts * (num(String(snap.agentFeePct || 0)) / 100) : 0;
    const mktg = t === "BTS" ? gdvBts * (num(String(snap.marketingPct || 0)) / 100) : 0;
    return { landCost: num(String(snap.landCost || 0)), buildCost, profFees, contingency, otherCosts: num(String(snap.otherCosts || 0)), agentAndMarketing: agentFee + mktg, totalSqft, buildCostPsf: num(String(snap.buildCostPsf || 0)) };
  }
  if (t === "Hotel") {
    const capex = num(String(snap.capexBudget || 0));
    return { landCost: num(String(snap.purchasePrice || 0)), buildCost: capex, profFees: 0, contingency: 0, otherCosts: 0, agentAndMarketing: 0, totalSqft: 0, buildCostPsf: 0 };
  }
  const refurb = num(String(snap.refurbBudget || 0));
  return { landCost: num(String(snap.purchasePrice || 0)), buildCost: refurb, profFees: refurb * (num(String(snap.professionalFeesPct || 0)) / 100), contingency: refurb * (num(String(snap.contingencyPct || 0)) / 100), otherCosts: num(String(snap.otherCosts || 0)), agentAndMarketing: 0, totalSqft: 0, buildCostPsf: 0 };
}

// ── HOTEL ADVANCED SHARE SECTION ─────────────────────────────────────────────
function HotelAdvancedShare({ snap, sym }: { snap: any; sym: string }) {
  const ha = snap.hotelAdv || {};
  const holdYears = num(String(snap.holdYears || 5));
  const rooms = num(String(snap.rooms || 0));
  const yr = ha.yearRevenue || [];
  const capStructure = snap.capStructure || "single";
  const capStructureLabel: Record<string, string> = { equity: "All Equity", single: "Single Facility", dual: "Dual Facility", fullstack: "Full Stack" };

  return (
    <>
      {/* ── PER KEY METRICS ── */}
      <div className="section-gap fade-up" style={{ animationDelay: ".36s" }}>
        <div className="section-hdr">Per Key Metrics</div>
        <div className="per-key-grid">
          {[
            { label: "Purchase / Key", value: fmt(ha.pricePerKey || 0, sym), color: "var(--text)" },
            { label: "CapEx / Key", value: fmt(ha.capexPerKey || 0, sym), color: "var(--amber)" },
            { label: "Exit Value / Key", value: fmt(ha.exitValuePerKey || 0, sym), color: "var(--gold)" },
            { label: "EBITDA / Key", value: fmt(ha.ebitdaPerKey || 0, sym), color: "var(--green)" },
            { label: "NOI / Key", value: fmt(ha.noiPerKey || 0, sym), color: "var(--blue)" },
            { label: "NOI Conversion", value: fmtPct(ha.noiConversion || 0), color: "var(--text-m)" },
          ].map(m => (
            <div key={m.label} className="per-key-card">
              <div className="per-key-label">{m.label}</div>
              <div className="per-key-value" style={{ color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
        {/* Entry yields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
          {[
            { label: "Entry Yield (vs NOI)", value: fmtPct(ha.entryYieldNOI || 0) },
            { label: "Entry Yield (vs EBITDA)", value: fmtPct(ha.entryYieldEBITDA || 0) },
          ].map(m => (
            <div key={m.label} className="per-key-card">
              <div className="per-key-label">{m.label}</div>
              <div className="per-key-value" style={{ color: "var(--blue)" }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── INVESTOR CASHFLOW ── */}
      <div className="section-gap fade-up" style={{ animationDelay: ".4s" }}>
        <div className="section-hdr">Investor Cashflow — Year by Year</div>
        <div className="data-card" style={{ padding: "16px 0", overflowX: "auto" }}>
          <table className="cf-table">
            <thead>
              <tr>
                <th className="cf-th" style={{ textAlign: "left", paddingLeft: 18 }}></th>
                <th className="cf-th">Day 1</th>
                {Array.from({ length: holdYears }, (_, i) => (
                  <th key={i} className="cf-th" style={{ color: i === holdYears - 1 ? "var(--gold)" : undefined }}>
                    Yr {i + 1}{i === holdYears - 1 ? " (Exit)" : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Revenue", fn: (y: any) => y.totalRev, day1: null, color: "var(--text-m)" },
                { label: "EBITDA", fn: (y: any) => y.ebitda, day1: null, color: "var(--text)" },
                { label: "FF&E", fn: (y: any) => -y.ffe, day1: null, color: "var(--amber)" },
                { label: "NOI", fn: (y: any) => y.noi, day1: null, color: "var(--green)", bold: true },
                { label: "Equity Out", fn: () => null, day1: -(ha.equity || 0), color: "var(--red)" },
                { label: "Disposal (Net)", fn: (_: any, i: number) => i === holdYears - 1 ? (ha.netExitProceeds || 0) : null, day1: null, color: "var(--gold)", bold: true },
              ].map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,.02)" }}>
                  <td className="cf-td" style={{ paddingLeft: 18, fontWeight: row.bold ? 600 : 400, color: row.color }}>{row.label}</td>
                  <td className="cf-td" style={{ color: row.day1 !== null && row.day1 !== undefined ? "var(--red)" : "var(--text-d)" }}>
                    {row.day1 !== null && row.day1 !== undefined ? fmt(Math.abs(row.day1), sym) : "—"}
                  </td>
                  {Array.from({ length: holdYears }, (_, i) => {
                    const v = yr[i] !== undefined ? row.fn(yr[i], i) : null;
                    return (
                      <td key={i} className="cf-td" style={{ color: v === null ? "var(--text-d)" : v < 0 ? "var(--red)" : row.color, fontWeight: row.bold ? 600 : 400 }}>
                        {v === null ? "—" : fmt(Math.abs(v), sym)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {/* Summary return cards */}
          <div className="return-cards" style={{ padding: "0 18px 4px" }}>
            {[
              { label: "Total Investment", value: fmt(ha.totalCost || 0, sym), color: "var(--text)" },
              { label: "Profit", value: fmt(ha.profit || 0, sym), color: (ha.profit || 0) > 0 ? "var(--green)" : "var(--red)" },
              { label: "Equity Multiple", value: fmtX(ha.moic || 0), color: (ha.moic || 0) > 2 ? "var(--green)" : "var(--amber)" },
              { label: "IRR (Levered)", value: fmtPct(ha.irrLevered || 0), color: (ha.irrLevered || 0) > 0.15 ? "var(--green)" : (ha.irrLevered || 0) > 0.08 ? "var(--amber)" : "var(--red)" },
            ].map(m => (
              <div key={m.label} className="return-card">
                <div className="return-card-label">{m.label}</div>
                <div className="return-card-value" style={{ color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RETURNS + DEAL STRUCTURE ── */}
      <div className="two-col section-gap fade-up" style={{ animationDelay: ".44s" }}>
        <div>
          <div className="section-hdr">Returns Summary</div>
          <div className="data-card">
            {[
              ["RevPAR", fmt(ha.revpar || 0, sym), "var(--gold)", false],
              ["Total Revenue pa", fmt(ha.revenuePa || 0, sym), "var(--text-m)", false],
              ["EBITDA pa", fmt(ha.ebitda || 0, sym), "var(--green)", false],
              ["Stabilised NOI", fmt(ha.stabilisedNOI || 0, sym), "var(--text-m)", false],
              ["Exit Value", fmt(ha.exitValue || 0, sym), "var(--gold)", true],
              ["Total Investment", fmt(ha.totalCost || 0, sym), "var(--text-m)", false],
              ["Profit", fmt(ha.profit || 0, sym), (ha.profit || 0) > 0 ? "var(--green)" : "var(--red)", false],
              ["Return on Cost", fmtPct(ha.poc || 0), (ha.poc || 0) > 0.15 ? "var(--green)" : "var(--amber)", false],
              ["Yield on Cost", fmtPct(ha.yoc || 0), "var(--blue)", false],
              ["IRR (Unlevered)", fmtPct(ha.irr || 0), "var(--blue)", false],
              ["IRR (Levered)", fmtPct(ha.irrLevered || 0), "var(--blue)", false],
              ["Equity Multiple", fmtX(ha.moic || 0), (ha.moic || 0) > 2 ? "var(--green)" : "var(--text)", false],
              ["DSCR / ICR", isFinite(ha.dscr) && ha.dscr < 999 ? fmtX(ha.dscr) : "—", (ha.dscr || 0) >= 1.5 ? "var(--green)" : (ha.dscr || 0) >= 1.25 ? "var(--amber)" : "var(--red)", false],
              ["Payback Period", ha.paybackMonth ? `Month ${ha.paybackMonth}` : "Beyond horizon", "var(--text-m)", false],
            ].map(([l, v, c, bold]: any) => (
              <div key={l} className="data-row">
                <span className={bold ? "data-label-bold" : "data-label"}>{l}</span>
                <span className={bold ? "data-value-bold" : "data-value"} style={{ color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-hdr">Deal Structure</div>
          <div className="data-card" style={{ marginBottom: 16 }}>
            {[
              ["Rooms", rooms > 0 ? rooms.toString() : "—", "var(--text)"],
              ["Hold Period", `${holdYears} years`, "var(--text-m)"],
              ["Capital Structure", capStructureLabel[capStructure] || capStructure, "var(--text-m)"],
              ["Exit Cap Rate", snap.exitCapRate ? `${snap.exitCapRate}%` : "—", "var(--text-m)"],
              ["Brand / Franchise", snap.hotelBrand || "—", "var(--text-m)"],
              ["Location", snap.location || "—", "var(--text-m)"],
              ["Tenure", snap.tenure || "—", "var(--text-m)"],
            ].map(([l, v, c]: any) => (
              <div key={l} className="data-row">
                <span className="data-label">{l}</span>
                <span className="data-value" style={{ color: c }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="section-hdr">Cost Breakdown</div>
          <div className="data-card">
            {[
              ["Purchase Price", fmt(ha.purchasePrice || 0, sym), "var(--text-m)", false],
              ["Property Tax (SDLT)", fmt(ha.sdlt || 0, sym), "var(--text-m)", false],
              ["Legal & DD Costs", fmt((ha.legalCosts || 0) + (snap.financingDD || 0), sym), "var(--text-m)", false],
              ["CapEx Budget", fmt(num(String(snap.capexBudget || 0)), sym), "var(--text-m)", false],
              ["Arrangement Fee", fmt(ha.arrangementFee || 0, sym), "var(--amber)", false],
              ["Interest (Total Hold)", fmt(ha.interestTotal || 0, sym), "var(--amber)", false],
              ...((ha.imAcqFee || 0) > 0 ? [["IM Acquisition Fee", fmt(ha.imAcqFee, sym), "var(--amber)", false]] : []),
              ...((ha.imBasePATotal || 0) > 0 ? [["IM Base Charge (total)", fmt(ha.imBasePATotal, sym), "var(--amber)", false]] : []),
              ["Total Investment", fmt(ha.totalCost || 0, sym), "var(--gold)", true],
            ].map(([l, v, c, bold]: any) => (
              <div key={l} className="data-row">
                <span className={bold ? "data-label-bold" : "data-label"} style={{ color: bold ? "var(--gold)" : undefined }}>{l}</span>
                <span className={bold ? "data-value-bold" : "data-value"} style={{ color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── IM FEES (if applicable) ── */}
      {((ha.imAcqFee || 0) + (ha.imBasePATotal || 0) + (ha.imIncentiveProfit || 0) + (ha.imIncentiveSales || 0) > 0) && (
        <div className="section-gap fade-up" style={{ animationDelay: ".48s" }}>
          <div className="section-hdr">Investment Manager Fees</div>
          <div className="data-card" style={{ borderColor: "rgba(201,168,76,.2)", background: "rgba(201,168,76,.04)" }}>
            {[
              ["Acquisition Fee (one-off)", fmt(ha.imAcqFee || 0, sym)],
              ["Base Annual Charge (total hold)", fmt(ha.imBasePATotal || 0, sym)],
              ["Incentive on Gross Sales", fmt(ha.imIncentiveSales || 0, sym)],
              ["Incentive on Profit", fmt(ha.imIncentiveProfit || 0, sym)],
              ["Total IM Fees", fmt((ha.imAcqFee || 0) + (ha.imBasePATotal || 0) + (ha.imIncentiveProfit || 0) + (ha.imIncentiveSales || 0), sym)],
            ].map(([l, v], i, arr) => (
              <div key={l} className="data-row" style={{ borderBottom: i === arr.length - 1 ? "none" : undefined }}>
                <span className={i === arr.length - 1 ? "data-label-bold" : "data-label"} style={{ color: i === arr.length - 1 ? "var(--gold)" : undefined }}>{l}</span>
                <span className={i === arr.length - 1 ? "data-value-bold" : "data-value"} style={{ color: i === arr.length - 1 ? "var(--gold)" : "var(--amber)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── SIMPLE HOTEL / OTHER ASSET SHARE SECTION ─────────────────────────────────
function StandardShare({ snap, sym, appraisal }: { snap: any; sym: string; appraisal: any }) {
  const assetType = snap.assetType || "BTR";
  const gdv = appraisal.gdv || 0;
  const totalCost = appraisal.total_cost || 0;
  const profit = appraisal.profit || 0;
  const poc = appraisal.profit_on_cost || 0;
  const irr = appraisal.irr_unlevered || 0;
  const irrLevered = appraisal.irr_levered || 0;
  const pocColor = poc > 0.2 ? "var(--green)" : poc > 0.1 ? "var(--amber)" : "var(--red)";
  const annualRate = (num(String(snap.benchmarkRate || 3.97)) + num(String(snap.marginOverBenchmark || 2.5))) / 100;
  const costs = calcCosts(snap);
  const loanAmount = (costs.landCost + costs.buildCost) * (num(String(snap.ltc || 65)) / 100);
  const arrangementFee = loanAmount * (num(String(snap.arrangementFeePct || 1)) / 100);
  const buildMonths = Math.max(1, Math.round(num(String(snap.programmMonths || 24))));
  const interestEst = loanAmount * annualRate * (buildMonths / 12) * 0.55;
  const totalFinanceCost = arrangementFee + interestEst;
  const snapMoic = snap.moic || 0;
  const snapDscr = snap.dscr || 0;

  const returnsRows = assetType === "BTR" ? [
    ["GDV (Exit)", fmt(gdv, sym), "var(--gold)", true],
    ["Total Cost", fmt(totalCost, sym), "var(--text-m)", false],
    ["Profit", fmt(profit, sym), profit > 0 ? "var(--green)" : "var(--red)", false],
    ["Profit on Cost", fmtPct(poc), pocColor, false],
    ["Yield on Cost", snap.exitYield ? fmtPct(snap.exitYield / 100) : "—", "var(--text-m)", false],
    ["IRR (Unlevered)", fmtPct(irr), "var(--blue)", false],
    ["IRR (Levered)", fmtPct(irrLevered), "var(--blue)", false],
  ] : assetType === "BTS" ? [
    ["GDV", fmt(gdv, sym), "var(--gold)", true],
    ["Total Cost", fmt(totalCost, sym), "var(--text-m)", false],
    ["Profit", fmt(profit, sym), profit > 0 ? "var(--green)" : "var(--red)", false],
    ["Profit on Cost", fmtPct(poc), pocColor, false],
    ["Profit on GDV", gdv > 0 ? fmtPct(profit / gdv) : "—", "var(--text-m)", false],
    ["IRR (Unlevered)", fmtPct(irr), "var(--blue)", false],
    ["IRR (Levered)", fmtPct(irrLevered), "var(--blue)", false],
  ] : assetType === "Hotel" ? [
    ["Exit Value", fmt(gdv, sym), "var(--gold)", true],
    ["Total Investment", fmt(totalCost, sym), "var(--text-m)", false],
    ["Profit", fmt(profit, sym), profit > 0 ? "var(--green)" : "var(--red)", false],
    ["Return on Cost", fmtPct(poc), pocColor, false],
    ["IRR (Unlevered)", fmtPct(irr), "var(--blue)", false],
    ["IRR (Levered)", fmtPct(irrLevered), "var(--blue)", false],
  ] : [
    ["Sale Price", fmt(gdv, sym), "var(--gold)", true],
    ["Total Cost", fmt(totalCost, sym), "var(--text-m)", false],
    ["Net Proceeds", fmt(profit + totalCost, sym), "var(--text-m)", false],
    ["Profit", fmt(profit, sym), profit > 0 ? "var(--green)" : "var(--red)", false],
    ["ROI on Cost", fmtPct(poc), pocColor, false],
    ["IRR (Annualised)", fmtPct(irr), "var(--blue)", false],
  ];

  const detailRows = assetType === "BTR" ? [
    ["Asset Type", "Build to Rent"], ["Location", snap.location || "—"], ["Currency", snap.currency || "GBP"],
    ["Programme", `${snap.programmMonths || "—"}m build · ${snap.stabilisationMonths || "—"}m stabilisation`],
    ["Exit Yield", snap.exitYield ? `${snap.exitYield}%` : "—"], ["Finance Rate", annualRate > 0 ? `${(annualRate * 100).toFixed(2)}% all-in` : "—"], ["LTC Ratio", snap.ltc ? `${snap.ltc}%` : "—"],
  ] : assetType === "BTS" ? [
    ["Asset Type", "Build to Sell"], ["Location", snap.location || "—"], ["Currency", snap.currency || "GBP"],
    ["Programme", `${snap.programmMonths || "—"}m build · ${snap.absorptionMonths || "—"}m absorption`],
    ["Units", snap.units ? snap.units.reduce((s: number, u: any) => s + num(String(u.count)), 0).toString() : "—"],
    ["Finance Rate", annualRate > 0 ? `${(annualRate * 100).toFixed(2)}% all-in` : "—"], ["LTC Ratio", snap.ltc ? `${snap.ltc}%` : "—"],
  ] : assetType === "Hotel" ? [
    ["Asset Type", "Hotel — Simple Mode"], ["Location", snap.location || "—"], ["Rooms", snap.rooms?.toString() || "—"],
    ["Star Rating", snap.starRating ? `${snap.starRating}★` : "—"],
    ["Programme", `${snap.programmMonths || "—"}m refurb · ${snap.stabilisationMonths || "—"}m stabilisation`],
    ["Exit Cap Rate", snap.exitCapRate ? `${snap.exitCapRate}%` : "—"], ["Finance Rate", annualRate > 0 ? `${(annualRate * 100).toFixed(2)}% all-in` : "—"],
  ] : [
    ["Asset Type", "House Flip"], ["Location", snap.location || "—"], ["Currency", snap.currency || "GBP"],
    ["Hold Period", `${snap.bridgingTermMonths || snap.programmMonths || "—"}m`],
    ["Sale Price", fmt(num(String(snap.salePrice || 0)), sym)], ["Agent Fee", snap.agentFeePct ? `${snap.agentFeePct}%` : "—"],
  ];

  const costRows = assetType === "BTR" || assetType === "BTS" ? [
    { label: "Land / Acquisition", value: costs.landCost },
    { label: "Build Cost", value: costs.buildCost, sub: costs.buildCostPsf > 0 ? `${sym}${costs.buildCostPsf}psf · ${Math.round(costs.totalSqft).toLocaleString()}sqft` : undefined },
    { label: "Professional Fees", value: costs.profFees },
    { label: "Contingency", value: costs.contingency },
    ...(costs.otherCosts > 0 ? [{ label: "Other Costs", value: costs.otherCosts }] : []),
    ...(costs.agentAndMarketing > 0 ? [{ label: "Agent & Marketing", value: costs.agentAndMarketing }] : []),
    { label: "Arrangement Fee", value: arrangementFee, amber: true },
    { label: "Interest (Est.)", value: interestEst, amber: true },
    { label: "Total Cost", value: totalCost, bold: true },
  ] : assetType === "Hotel" ? [
    { label: "Purchase Price", value: costs.landCost },
    { label: "CapEx Budget", value: costs.buildCost },
    { label: "Arrangement Fee", value: arrangementFee, amber: true },
    { label: "Interest (Est.)", value: interestEst, amber: true },
    { label: "Total Investment", value: totalCost, bold: true },
  ] : [
    { label: "Purchase Price", value: costs.landCost },
    { label: "Refurb Budget", value: costs.buildCost },
    { label: "Finance Cost", value: totalFinanceCost, amber: true },
    { label: "Total Cost", value: totalCost, bold: true },
  ];

  return (
    <>
      <div className="two-col section-gap fade-up" style={{ animationDelay: ".36s" }}>
        <div>
          <div className="section-hdr">Returns Summary</div>
          <div className="data-card">
            {returnsRows.map(([l, v, c, bold]: any) => (
              <div key={l} className="data-row">
                <span className={bold ? "data-label-bold" : "data-label"}>{l}</span>
                <span className={bold ? "data-value-bold" : "data-value"} style={{ color: c || "var(--text-m)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="section-hdr">Project Details</div>
          <div className="data-card">
            {detailRows.map(([l, v]: string[]) => (
              <div key={l} className="data-row">
                <span className="data-label">{l}</span>
                <span className="data-value" style={{ color: "var(--text-m)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="section-gap fade-up" style={{ animationDelay: ".4s" }}>
        <div className="section-hdr">Cost Breakdown</div>
        <div className="data-card">
          {costRows.map((item: any) => (
            <div key={item.label} className="data-row">
              <div>
                <span className={item.bold ? "data-label-bold" : "data-label"} style={{ color: item.bold ? "var(--gold)" : item.amber ? "var(--amber)" : "var(--text-m)" }}>{item.label}</span>
                {item.sub && <span style={{ fontSize: 10, color: "var(--text-d)", marginLeft: 8, fontFamily: "var(--font-mono)" }}>{item.sub}</span>}
              </div>
              <span className={item.bold ? "data-value-bold" : "data-value"} style={{ color: item.bold ? "var(--gold)" : item.amber ? "var(--amber)" : "var(--text-m)" }}>{fmt(item.value || 0, sym)}</span>
            </div>
          ))}
        </div>
      </div>
      {snap.units?.length > 0 && (
        <div className="section-gap fade-up" style={{ animationDelay: ".44s" }}>
          <div className="section-hdr">Unit Mix</div>
          <div className="data-card" style={{ padding: "16px 22px" }}>
            <table className="unit-table">
              <thead>
                <tr>
                  <th className="unit-th">Type</th>
                  <th className="unit-th" style={{ textAlign: "right" }}>Units</th>
                  {assetType === "BTS" && <th className="unit-th" style={{ textAlign: "right" }}>Price psf</th>}
                  {assetType === "BTR" && <th className="unit-th" style={{ textAlign: "right" }}>Rent pcm</th>}
                  <th className="unit-th" style={{ textAlign: "right" }}>Size</th>
                  <th className="unit-th" style={{ textAlign: "right" }}>{assetType === "BTS" ? "Revenue" : "Gross pa"}</th>
                </tr>
              </thead>
              <tbody>
                {snap.units.map((u: any, i: number) => {
                  const gross = assetType === "BTS"
                    ? num(String(u.count)) * num(String(u.size)) * num(String(u.salePricePsf))
                    : num(String(u.count)) * num(String(u.rentPcm)) * 12;
                  return (
                    <tr key={i}>
                      <td className="unit-td unit-td-name">{u.type}</td>
                      <td className="unit-td">{u.count}</td>
                      {assetType === "BTS" && <td className="unit-td">{sym}{u.salePricePsf}psf</td>}
                      {assetType === "BTR" && <td className="unit-td">{sym}{u.rentPcm}pcm</td>}
                      <td className="unit-td">{u.size} sqft</td>
                      <td className="unit-td" style={{ color: "var(--gold)" }}>{fmt(gross, sym)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

// ── MAIN SHARE PAGE ───────────────────────────────────────────────────────────
function SharePage() {
  const params = useParams();
  const token = params?.token as string;
  const [appraisal, setAppraisal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      const { data } = await supabase.from("appraisals").select("*").eq("share_token", token).single();
      if (!data) { setNotFound(true); setLoading(false); return; }
      setAppraisal(data); setLoading(false);
    };
    load();
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 24px", textAlign: "center" }}>
      <style>{CSS}</style>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 48, color: "#3d4249", fontWeight: 300 }}>◈</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, color: "#eceae4" }}>Appraisal not found</div>
      <div style={{ fontSize: 14, color: "#3d4249" }}>This link may have expired or been revoked.</div>
    </div>
  );

  const snap = appraisal?.snapshot || {};
  const assetType = snap.assetType || "BTR";
  const isHotelAdvanced = assetType === "Hotel" && snap.hotelMode === "advanced" && snap.hotelAdv;
  const sym = { GBP: "£", USD: "$", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$", JPY: "¥", CHF: "Fr", CAD: "C$", HKD: "HK$" }[snap.currency as string] || "£";

  // Hero metrics — advanced hotel uses hotelAdv fields
  const ha = snap.hotelAdv || {};
  const gdv = appraisal.gdv || 0;
  const profit = appraisal.profit || 0;
  const poc = appraisal.profit_on_cost || 0;
  const irr = appraisal.irr_unlevered || 0;
  const irrLevered = appraisal.irr_levered || 0;
  const pocColor = poc > 0.2 ? "var(--green)" : poc > 0.1 ? "var(--amber)" : "var(--red)";

  const heroMetrics = isHotelAdvanced ? [
    { label: "Exit Value", value: fmt(ha.exitValue || gdv, sym), color: "var(--gold)" },
    { label: "Profit", value: fmt(ha.profit || profit, sym), color: (ha.profit || profit) > 0 ? "var(--green)" : "var(--red)" },
    { label: "Return on Cost", value: fmtPct(ha.poc || poc), color: (ha.poc || poc) > 0.15 ? "var(--green)" : "var(--amber)" },
    { label: "IRR (Levered)", value: fmtPct(ha.irrLevered || irrLevered), color: "var(--blue)" },
  ] : assetType === "BTR" ? [
    { label: "GDV / Exit Value", value: fmt(gdv, sym), color: "var(--gold)" },
    { label: "Profit", value: fmt(profit, sym), color: profit > 0 ? "var(--green)" : "var(--red)" },
    { label: "Profit on Cost", value: fmtPct(poc), color: pocColor },
    { label: "IRR (Unlevered)", value: fmtPct(irr), color: "var(--blue)" },
  ] : assetType === "BTS" ? [
    { label: "GDV", value: fmt(gdv, sym), color: "var(--gold)" },
    { label: "Profit", value: fmt(profit, sym), color: profit > 0 ? "var(--green)" : "var(--red)" },
    { label: "Profit on Cost", value: fmtPct(poc), color: pocColor },
    { label: "IRR (Unlevered)", value: fmtPct(irr), color: "var(--blue)" },
  ] : assetType === "Hotel" ? [
    { label: "Exit Value", value: fmt(gdv, sym), color: "var(--gold)" },
    { label: "Profit", value: fmt(profit, sym), color: profit > 0 ? "var(--green)" : "var(--red)" },
    { label: "Return on Cost", value: fmtPct(poc), color: pocColor },
    { label: "IRR (Unlevered)", value: fmtPct(irr), color: "var(--blue)" },
  ] : [
    { label: "Sale Price", value: fmt(gdv, sym), color: "var(--gold)" },
    { label: "Profit", value: fmt(profit, sym), color: profit > 0 ? "var(--green)" : "var(--red)" },
    { label: "ROI on Cost", value: fmtPct(poc), color: pocColor },
    { label: "IRR (Annualised)", value: fmtPct(irr), color: "var(--blue)" },
  ];

  const instMetrics = isHotelAdvanced ? [
    { label: "Equity Multiple", value: fmtX(ha.moic || snap.moic || 0) },
    { label: "DSCR / ICR", value: isFinite(ha.dscr) && ha.dscr < 999 ? fmtX(ha.dscr) : "—" },
    { label: "GOP Margin", value: ha.revenuePa > 0 ? fmtPct(ha.ebitda / ha.revenuePa) : "—" },
    { label: "EBITDA / Room", value: snap.rooms > 0 ? fmt(ha.ebitda / num(String(snap.rooms)), sym) : "—" },
    { label: "Payback", value: ha.paybackMonth ? `Month ${ha.paybackMonth}` : "—" },
    { label: "Hold Period", value: `${snap.holdYears || 5} years` },
  ] : assetType === "BTR" ? [
    { label: "IRR (Levered)", value: fmtPct(irrLevered) },
    { label: "Equity Multiple", value: fmtX(snap.moic || 0) },
    { label: "DSCR / ICR", value: fmtX(snap.dscr || 0) },
    { label: "Yield on Cost", value: snap.exitYield ? `${snap.exitYield}%` : "—" },
  ] : assetType === "BTS" ? [
    { label: "IRR (Levered)", value: fmtPct(irrLevered) },
    { label: "Equity Multiple", value: fmtX(snap.moic || 0) },
    { label: "Profit on GDV", value: gdv > 0 ? fmtPct(profit / gdv) : "—" },
    { label: "Absorption", value: snap.absorptionMonths ? `${snap.absorptionMonths}m` : "—" },
  ] : assetType === "Hotel" ? [
    { label: "IRR (Levered)", value: fmtPct(irrLevered) },
    { label: "Equity Multiple", value: fmtX(snap.moic || 0) },
    { label: "DSCR / ICR", value: fmtX(snap.dscr || 0) },
    { label: "Yield on Cost", value: snap.exitCapRate ? `${snap.exitCapRate}%` : "—" },
  ] : [
    { label: "IRR (Annualised)", value: fmtPct(irr) },
    { label: "Equity Multiple", value: fmtX(snap.moic || 0) },
    { label: "Bridging Rate", value: snap.bridgingRatePct ? `${snap.bridgingRatePct}%pm` : "—" },
    { label: "Hold Period", value: snap.bridgingTermMonths ? `${snap.bridgingTermMonths}m` : "—" },
  ];

  const typeCol = TYPE_COLOR[assetType] || "var(--gold)";
  const typeBg = TYPE_BG[assetType] || "rgba(201,168,76,.12)";
  const displayPoc = isHotelAdvanced ? (ha.poc || poc) : poc;
  const displayPocColor = isHotelAdvanced
    ? ((ha.poc || poc) > 0.15 ? "var(--green)" : "var(--amber)")
    : pocColor;
  const programme = isHotelAdvanced
    ? `${snap.holdYears || 5}-year institutional hold · ${snap.rooms || "—"} keys`
    : assetType === "BTR" ? `${snap.programmMonths || "—"}m build · ${snap.stabilisationMonths || "—"}m stabilisation`
      : assetType === "BTS" ? `${snap.programmMonths || "—"}m build · ${snap.absorptionMonths || "—"}m absorption`
        : assetType === "Hotel" ? `${snap.programmMonths || "—"}m refurb · ${snap.stabilisationMonths || "—"}m stabilisation`
          : `${snap.bridgingTermMonths || snap.programmMonths || "—"}m hold`;

  return (
    <div className={`page-wrap theme-${theme}`}>
      <style>{CSS}</style>
      {/* NAV */}
      <div style={{ borderBottom: "1px solid var(--border)", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", background: "var(--bg1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <img src="data:image/png;base64,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" alt="Valora" style={{ height: "28px", width: "auto" }}/>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="theme-toggle">
            <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>Dark</button>
            <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>Light</button>
          </div>
          <span style={{ fontSize: 10, color: "var(--text-d)", background: "var(--bg3)", padding: "4px 10px", borderRadius: 6, letterSpacing: ".06em", textTransform: "uppercase" }}>Read-only</span>
        </div>
      </div>
      {/* GOLD ACCENT LINE */}
      <div style={{ height: 2, background: `linear-gradient(90deg,${typeCol},transparent 70%)` }} />
      {/* HERO */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow fade-up">
            <span className="badge-type" style={{ background: typeBg, color: typeCol }}>{assetType}</span>
            {isHotelAdvanced && <span className="adv-badge">Advanced · Institutional</span>}
            <span style={{ fontSize: 12, color: "var(--text-d)", fontFamily: "var(--font-mono)" }}>{snap.currency || "GBP"}</span>
            {snap.location && <><span style={{ color: "var(--text-d)" }}>·</span><span style={{ fontSize: 12, color: "var(--text-d)" }}>{snap.location}</span></>}
          </div>
          <h1 className="hero-title fade-up" style={{ animationDelay: ".08s" }}>{appraisal.name || "Untitled Appraisal"}</h1>
          <p className="hero-subtitle fade-up" style={{ animationDelay: ".14s" }}>{programme}</p>
          {/* Metric strip */}
          <div className="metric-strip fade-up" style={{ animationDelay: ".2s" }}>
            <div className="metric-strip-inner" style={{ gridTemplateColumns: `repeat(${heroMetrics.length},1fr)` }}>
              {heroMetrics.map((m, i) => (
                <div key={m.label} className="metric-cell" style={{ background: i === 0 ? `${typeCol}08` : "var(--card-bg)" }}>
                  <div className="metric-cell-label">{m.label}</div>
                  <div className="metric-cell-value" style={{ color: m.color }}>{m.value}</div>
                  {i === 2 && <div className="metric-cell-sub">
                    {displayPoc > 0.15 ? `${((displayPoc - 0.15) * 100).toFixed(1)}% above 15% target` : `${((0.15 - displayPoc) * 100).toFixed(1)}% below target`}
                  </div>}
                </div>
              ))}
            </div>
          </div>
          {/* Institutional strip */}
          <div className="inst-strip fade-up" style={{ animationDelay: ".28s", gridTemplateColumns: `repeat(${instMetrics.length},1fr)` }}>
            {instMetrics.map(m => (
              <div key={m.label} className="inst-cell">
                <div className="inst-cell-label">{m.label}</div>
                <div className="inst-cell-value">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* CONTENT */}
      <div className="content-wrap">
        {/* PoC / RoC bar */}
        <div className="poc-bar-wrap section-gap fade-up" style={{ animationDelay: ".32s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-d)", marginBottom: 2 }}>
            <span style={{ textTransform: "uppercase", letterSpacing: ".1em", fontSize: 10 }}>
              {isHotelAdvanced ? "Return on Cost vs 15% Target" : "Return vs 20% Target"}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: displayPocColor }}>{fmtPct(displayPoc)}</span>
          </div>
          <div className="poc-bar-track">
            <div className="poc-bar-fill" style={{
              width: `${Math.min((displayPoc / (isHotelAdvanced ? 0.25 : 0.3)) * 100, 100)}%`,
              background: displayPoc > (isHotelAdvanced ? 0.15 : 0.2) ? "linear-gradient(90deg,var(--green),#1a8a58)" : "linear-gradient(90deg,var(--amber),#b5720f)"
            }} />
          </div>
          <div style={{ fontSize: 10, color: "var(--text-d)", textAlign: "right" }}>
            {displayPoc > (isHotelAdvanced ? 0.15 : 0.2)
              ? `${((displayPoc - (isHotelAdvanced ? 0.15 : 0.2)) * 100).toFixed(1)}% above target`
              : `${(((isHotelAdvanced ? 0.15 : 0.2) - displayPoc) * 100).toFixed(1)}% below target`}
          </div>
        </div>

        {/* Asset-specific body */}
        {isHotelAdvanced
          ? <HotelAdvancedShare snap={snap} sym={sym} />
          : <StandardShare snap={snap} sym={sym} appraisal={appraisal} />
        }

        {/* Footer */}
        <div className="sec-divider" />
        <div className="share-footer fade-up" style={{ animationDelay: ".5s", padding: "0" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <img src="data:image/png;base64,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" alt="Valora" style={{ height: "24px", width: "auto" }}/>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-d)", marginTop: 3, letterSpacing: ".08em", textTransform: "uppercase" }}>Institutional Development Appraisal</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "var(--text-d)", marginBottom: 6 }}>Strictly Confidential · For Authorised Recipients Only</div>
            <a href="https://valoraplatform.io" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--gold)", textDecoration: "none", letterSpacing: ".04em" }}>valoraplatform.io ↗</a>
          </div>
        </div>
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}

export default function SharePageWrapper() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <SharePage />
    </Suspense>
  );
}
