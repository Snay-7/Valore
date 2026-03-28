"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback, Suspense } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

/* ═══════════════════════════════════════════
   VALORA — Appraisal Editor
   All 4 asset types: BTR, BTS, Hotel, Flip
   Tabbed layout with live calculation engine
═══════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold-l:#e2c97e;--gold-bg:rgba(201,168,76,0.07);--gold-border:rgba(201,168,76,0.2);
  --bg:#06070a;--bg1:#0c0e12;--bg2:#12151a;--bg3:#191d24;--bg4:#21262f;--bg5:#2a303b;
  --text:#eceae4;--text-m:#7d8590;--text-d:#3d4249;
  --border:rgba(255,255,255,0.06);--border-m:rgba(255,255,255,0.12);
  --green:#3ddc84;--red:#f4645f;--amber:#f0a429;--blue:#5b9cf6;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.inp{width:100%;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font-mono);font-size:13px;outline:none;transition:border-color .2s,box-shadow .2s}
.inp:focus{border-color:var(--gold);box-shadow:0 0 0 2px rgba(201,168,76,.1)}
.inp::placeholder{color:var(--text-d);font-family:var(--font-body)}
.inp-label{font-size:10px;color:var(--text-d);text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px;display:block}
.inp-group{margin-bottom:14px}
.inp-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.inp-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.tab{padding:10px 18px;font-size:12px;color:var(--text-d);cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;font-family:var(--font-body);background:none;border-top:none;border-left:none;border-right:none}
.tab:hover{color:var(--text-m)}
.tab.active{color:var(--gold);border-bottom-color:var(--gold)}
.section-title{font-family:var(--font-display);font-size:18px;font-weight:400;color:var(--text);margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid var(--border)}
.output-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bg4)}
.output-label{font-size:12px;color:var(--text-m)}
.output-value{font-family:var(--font-mono);font-size:13px;font-weight:500}
.badge{display:inline-flex;align-items:center;gap:6px;background:var(--gold-bg);border:1px solid var(--gold-border);color:var(--gold);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:500;letter-spacing:.05em}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:7px;padding:10px 20px;font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:background .2s;display:inline-flex;align-items:center;gap:8px}
.btn-primary:hover{background:var(--gold-l)}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:9px 18px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.unit-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 28px;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid var(--bg4)}
.sens-cell{text-align:center;padding:7px 4px;border-radius:5px;font-family:var(--font-mono);font-size:11px;font-weight:500}
.cell-r{background:rgba(244,100,95,.12);color:var(--red)}
.cell-a{background:rgba(240,164,41,.1);color:var(--amber)}
.cell-g{background:rgba(61,220,132,.09);color:var(--green)}
.cell-base{outline:2px solid var(--gold)}
.waterfall-tier{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:10px}
.cf-row{display:grid;grid-template-columns:80px repeat(6,1fr);gap:4px;padding:5px 0;border-bottom:1px solid var(--bg4);font-size:11px}
.cf-header{font-size:9px;color:var(--text-d);text-transform:uppercase;letter-spacing:.06em}
.save-indicator{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-d)}
select.inp{cursor:pointer}
@media(max-width:768px){
  .inp-row{grid-template-columns:1fr}
  .inp-row-3{grid-template-columns:1fr 1fr}
  .unit-row{grid-template-columns:1fr 1fr 1fr 28px}
  .editor-layout{grid-template-columns:1fr !important}
  .output-panel{position:static !important;height:auto !important}
}
`;

/* —— SDLT Calculator (UK banded rates, multi-mode) —— */
function calcSDLT(
  price: number,
  mode: 'auto' | 'manual',
  txType: 'residential' | 'commercial' | 'mixed' | 'spv',
  override: number,
  surcharge: boolean
): number {
  if (mode === 'manual') return override;
  if (price <= 0 || txType === 'spv') return 0;

  let sdlt = 0;

  if (txType === 'residential') {
    const bands: [number, number, number][] = [
      [0,       250000,   0.00],
      [250000,  925000,   0.05],
      [925000,  1500000,  0.10],
      [1500000, Infinity, 0.12],
    ];
    for (const [low, high, rate] of bands) {
      if (price > low) sdlt += (Math.min(price, high) - low) * (surcharge ? rate + 0.03 : rate);
    }
  } else {
    // Commercial / Mixed-Use
    const bands: [number, number, number][] = [
      [0,      150000,   0.00],
      [150000, 250000,   0.02],
      [250000, Infinity, 0.05],
    ];
    for (const [low, high, rate] of bands) {
      if (price > low) sdlt += (Math.min(price, high) - low) * rate;
    }
  }

  return Math.round(sdlt);
}

/* ─── IRR Calculator (Newton-Raphson) ─── */
function calcIRR(cashflows: number[]): number {
  let rate = 0.1;
  for (let i = 0; i < 100; i++) {
    let npv = 0, dnpv = 0;
    cashflows.forEach((cf, t) => {
      const d = Math.pow(1 + rate, t);
      npv += cf / d;
      dnpv -= t * cf / (d * (1 + rate));
    });
    if (Math.abs(npv) < 0.01) break;
    rate -= npv / dnpv;
  }
  return isFinite(rate) ? rate : 0;
}

/* ─── Format helpers ─── */
const fmt = (n: number, prefix = "£") => {
  if (!isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${prefix}${(n / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${prefix}${(n / 1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${prefix}${(n / 1e3).toFixed(0)}k`;
  return `${prefix}${n.toFixed(0)}`;
};
const fmtPct = (n: number) => (!isFinite(n) || isNaN(n) ? "—" : `${(n * 100).toFixed(1)}%`);
const num = (v: string) => parseFloat(v.replace(/[£,%\s]/g, "")) || 0;

/* ─── Default state by asset type ─── */
const DEFAULTS = {
  BTR: {
    assetType: "BTR", name: "", location: "", currency: "GBP", benchmark: "SONIA", benchmarkRate: 3.97,
    programmMonths: 36, stabilisationMonths: 12,
    units: [
      { type: "1 Bed OMR", count: 80, rentPcm: 2200, size: 550 },
      { type: "2 Bed OMR", count: 60, rentPcm: 2900, size: 750 },
      { type: "3 Bed OMR", count: 30, rentPcm: 3600, size: 1000 },
      { type: "1 Bed DMR", count: 40, rentPcm: 1650, size: 550 },
      { type: "2 Bed DMR", count: 22, rentPcm: 2175, size: 750 },
    ],
    exitYield: 4.15, niy: 4.0, voidPct: 1.5, opexPsf: 8,
    landCost: 15000000, buildCostPsf: 285, siteAreaSqft: 195000,
    professionalFeesPct: 8, contingencyPct: 5, otherCosts: 500000,
    ltc: 65, marginOverBenchmark: 2.5, arrangementFeePct: 1.0,
    tier1Hurdle: 8, tier1DevShare: 20,
    tier2Hurdle: 12, tier2DevShare: 30,
    tier3Hurdle: 18, tier3DevShare: 40,
    costProfile: "scurve",
    sdltMode: "auto" as const,
sdltTransactionType: "residential" as const,
sdltOverride: 0,
sdltSurcharge: true,
  },
  BTS: {
    assetType: "BTS", name: "", location: "", currency: "GBP", benchmark: "SONIA", benchmarkRate: 3.97,
    programmMonths: 30, stabilisationMonths: 6,
    units: [
      { type: "1 Bed", count: 40, salePricePsf: 900, size: 550 },
      { type: "2 Bed", count: 60, salePricePsf: 850, size: 800 },
      { type: "3 Bed", count: 20, salePricePsf: 800, size: 1100 },
      { type: "Penthouse", count: 5, salePricePsf: 1400, size: 1800 },
    ],
    agentFeePct: 1.5, marketingPct: 1.0, absorptionMonths: 18,
    landCost: 8000000, buildCostPsf: 260, siteAreaSqft: 110000,
    professionalFeesPct: 8, contingencyPct: 5, otherCosts: 300000,
    ltc: 60, marginOverBenchmark: 2.5, arrangementFeePct: 1.0,
    tier1Hurdle: 8, tier1DevShare: 20,
    tier2Hurdle: 15, tier2DevShare: 30,
    tier3Hurdle: 20, tier3DevShare: 40,
    costProfile: "scurve",
    sdltMode: "auto" as const,
sdltTransactionType: "residential" as const,
sdltOverride: 0,
sdltSurcharge: true,
  },
  Hotel: {
    assetType: "Hotel", name: "", location: "", currency: "GBP", benchmark: "SONIA", benchmarkRate: 3.97,
    programmMonths: 24, stabilisationMonths: 18,
    rooms: 120, adr: 180, occupancy: 72, starRating: 4,
    revparGrowthPct: 2.5, ebitdaMarginPct: 28,
    purchasePrice: 18000000, capexBudget: 5000000,
    exitCapRate: 6.5, stabilisedCapRate: 6.0,
    professionalFeesPct: 5, contingencyPct: 8, otherCosts: 200000,
    ltc: 60, marginOverBenchmark: 3.0, arrangementFeePct: 1.5,
    tier1Hurdle: 8, tier1DevShare: 20,
    tier2Hurdle: 14, tier2DevShare: 30,
    tier3Hurdle: 20, tier3DevShare: 40,
    costProfile: "straight",
    sdltMode: "auto" as const,
sdltTransactionType: "residential" as const,
sdltOverride: 0,
sdltSurcharge: true,
  },
  Flip: {
    assetType: "Flip", name: "", location: "", currency: "GBP", benchmark: "SONIA", benchmarkRate: 3.97,
    programmMonths: 9, stabilisationMonths: 0,
    purchasePrice: 450000, refurbBudget: 85000,
    salePrice: 620000, agentFeePct: 1.5,
    bridgingRatePct: 0.85, bridgingTermMonths: 9,
    arrangementFeePct: 2.0,
    professionalFeesPct: 2, contingencyPct: 10, otherCosts: 5000,
    costProfile: "straight",
    sdltMode: "auto" as const,
sdltTransactionType: "residential" as const,
sdltOverride: 0,
sdltSurcharge: true,
  },
};

type AssetType = "BTR" | "BTS" | "Hotel" | "Flip";

function AppraisalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const [assetType, setAssetType] = useState<AssetType>("BTR");
  const [data, setData] = useState<any>({ ...DEFAULTS.BTR });
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [appraisalId, setAppraisalId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);
    };
    init();
  }, [router]);

  const set = useCallback((field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const switchAssetType = (type: AssetType) => {
    setAssetType(type);
    setData({ ...DEFAULTS[type] });
    setActiveTab("general");
    setSaved(false);
  };

  const updateUnit = (index: number, field: string, value: any) => {
    const units = [...data.units];
    units[index] = { ...units[index], [field]: value };
    set("units", units);
  };

  const addUnit = () => {
    const units = [...(data.units || [])];
    units.push(assetType === "BTS"
      ? { type: "New Type", count: 10, salePricePsf: 800, size: 700 }
      : { type: "New Type", count: 10, rentPcm: 2000, size: 700 });
    set("units", units);
  };

  const removeUnit = (i: number) => {
    const units = data.units.filter((_: any, idx: number) => idx !== i);
    set("units", units);
  };

  /* ─── CALCULATION ENGINE ─── */
  const calc = useCallback(() => {
    if (assetType === "BTR") {
      const units = data.units || [];
      const totalUnits = units.reduce((s: number, u: any) => s + (num(String(u.count)) || 0), 0);
      const totalSqft = units.reduce((s: number, u: any) => s + (num(String(u.count)) * num(String(u.size))), 0);
      const grossRentPa = units.reduce((s: number, u: any) => s + (num(String(u.count)) * num(String(u.rentPcm)) * 12), 0);
      const voidAdjustment = 1 - (num(String(data.voidPct)) / 100);
      const opexPa = totalSqft * num(String(data.opexPsf));
      const noi = grossRentPa * voidAdjustment - opexPa;
      const gdv = noi / (num(String(data.exitYield)) / 100);
      const landCost = num(String(data.landCost));
      const sdlt = calcSDLT(landCost, data.sdltMode ?? 'auto', data.sdltTransactionType ?? 'residential', data.sdltOverride ?? 0, data.sdltSurcharge ?? true);
      const buildCost = totalSqft * num(String(data.buildCostPsf));
      const profFees = buildCost * (num(String(data.professionalFeesPct)) / 100);
      const contingency = buildCost * (num(String(data.contingencyPct)) / 100);
      const otherCosts = num(String(data.otherCosts));
      const devCost = buildCost + profFees + contingency + otherCosts;
      const financeRate = (num(String(data.benchmarkRate)) + num(String(data.marginOverBenchmark))) / 100;
      const loanAmount = (landCost + devCost) * (num(String(data.ltc)) / 100);
      const arrangementFee = loanAmount * (num(String(data.arrangementFeePct)) / 100);
      const interestEst = loanAmount * financeRate * (num(String(data.programmMonths)) / 12) * 0.6;
      const totalFinanceCost = arrangementFee + interestEst;
      const totalCost = landCost + sdlt + devCost + totalFinanceCost;
      const profit = gdv - totalCost;
      const poc = totalCost > 0 ? profit / totalCost : 0;
      const yoc = totalSqft > 0 ? noi / totalCost : 0;
      // IRR approximation
      const months = num(String(data.programmMonths)) + num(String(data.stabilisationMonths));
      const cfs = [-totalCost];
      for (let m = 1; m < months; m++) cfs.push(0);
      cfs.push(gdv);
      const irrMonthly = calcIRR(cfs);
      const irr = Math.pow(1 + irrMonthly, 12) - 1;
      const rlv = gdv * (1 - (poc > 0 ? poc : 0.2)) - devCost - totalFinanceCost;
      return { gdv, noi, grossRentPa, totalSqft, totalUnits, landCost, sdlt, buildCost, devCost, totalFinanceCost, totalCost, profit, poc, yoc, irr, rlv, financeRate, loanAmount };
    }
    if (assetType === "BTS") {
      const units = data.units || [];
      const gdv = units.reduce((s: number, u: any) => s + (num(String(u.count)) * num(String(u.size)) * num(String(u.salePricePsf))), 0);
      const totalSqft = units.reduce((s: number, u: any) => s + (num(String(u.count)) * num(String(u.size))), 0);
      const totalUnits = units.reduce((s: number, u: any) => s + num(String(u.count)), 0);
      const agentFees = gdv * (num(String(data.agentFeePct)) / 100);
      const marketing = gdv * (num(String(data.marketingPct)) / 100);
      const landCost = num(String(data.landCost));
      const sdlt = calcSDLT(landCost, data.sdltMode ?? 'auto', data.sdltTransactionType ?? 'residential', data.sdltOverride ?? 0, data.sdltSurcharge ?? true);
      const buildCost = totalSqft * num(String(data.buildCostPsf));
      const profFees = buildCost * (num(String(data.professionalFeesPct)) / 100);
      const contingency = buildCost * (num(String(data.contingencyPct)) / 100);
      const otherCosts = num(String(data.otherCosts));
      const devCost = buildCost + profFees + contingency + otherCosts + agentFees + marketing;
      const financeRate = (num(String(data.benchmarkRate)) + num(String(data.marginOverBenchmark))) / 100;
      const loanAmount = (landCost + devCost) * (num(String(data.ltc)) / 100);
      const arrangementFee = loanAmount * (num(String(data.arrangementFeePct)) / 100);
      const interestEst = loanAmount * financeRate * (num(String(data.programmMonths)) / 12) * 0.5;
      const totalFinanceCost = arrangementFee + interestEst;
      const totalCost = landCost + sdlt + devCost + totalFinanceCost;
      const profit = gdv - totalCost;
      const poc = totalCost > 0 ? profit / totalCost : 0;
      const margin = gdv > 0 ? profit / gdv : 0;
      const months = num(String(data.programmMonths)) + num(String(data.absorptionMonths));
      const cfs = [-totalCost];
      for (let m = 1; m < months; m++) cfs.push(gdv / num(String(data.absorptionMonths)));
      const irrMonthly = calcIRR(cfs);
      const irr = Math.pow(1 + irrMonthly, 12) - 1;
      return { gdv, totalSqft, totalUnits, landCost, sdlt, buildCost, devCost, totalFinanceCost, totalCost, profit, poc, margin, irr, loanAmount, financeRate };
    }
    if (assetType === "Hotel") {
      const rooms = num(String(data.rooms));
      const adr = num(String(data.adr));
      const occ = num(String(data.occupancy)) / 100;
      const revpar = adr * occ;
      const revenuePa = revpar * rooms * 365;
      const ebitda = revenuePa * (num(String(data.ebitdaMarginPct)) / 100);
      const stabilisedValue = ebitda / (num(String(data.stabilisedCapRate)) / 100);
      const exitValue = ebitda * (1 + num(String(data.revparGrowthPct)) / 100) / (num(String(data.exitCapRate)) / 100);
      const purchasePrice = num(String(data.purchasePrice));
      const sdlt = calcSDLT(purchasePrice, data.sdltMode ?? 'auto', data.sdltTransactionType ?? 'residential', data.sdltOverride ?? 0, data.sdltSurcharge ?? true);
      const capex = num(String(data.capexBudget));
      const profFees = capex * (num(String(data.professionalFeesPct)) / 100);
      const contingency = capex * (num(String(data.contingencyPct)) / 100);
      const totalCost = purchasePrice + sdlt + capex + profFees + contingency + num(String(data.otherCosts));
      const financeRate = (num(String(data.benchmarkRate)) + num(String(data.marginOverBenchmark))) / 100;
      const loanAmount = totalCost * (num(String(data.ltc)) / 100);
      const interestEst = loanAmount * financeRate * (num(String(data.programmMonths)) / 12) * 0.5;
      const arrangementFee = loanAmount * (num(String(data.arrangementFeePct)) / 100);
      const totalFinanceCost = interestEst + arrangementFee;
      const totalInvestment = totalCost + totalFinanceCost;
      const profit = exitValue - totalInvestment;
      const poc = totalInvestment > 0 ? profit / totalInvestment : 0;
      const yoc = totalInvestment > 0 ? ebitda / totalInvestment : 0;
      const months = num(String(data.programmMonths)) + num(String(data.stabilisationMonths));
      const cfs = [-totalInvestment, ...Array(months - 1).fill(0), exitValue];
      const irrMonthly = calcIRR(cfs);
      const irr = Math.pow(1 + irrMonthly, 12) - 1;
      return { revpar, revenuePa, ebitda, stabilisedValue, exitValue, purchasePrice, sdlt, capex, totalCost, totalFinanceCost, totalInvestment, profit, poc, yoc, irr, loanAmount };
    }
    if (assetType === "Flip") {
      const purchase = num(String(data.purchasePrice));
      const sdlt = calcSDLT(purchasePrice, data.sdltMode ?? 'auto', data.sdltTransactionType ?? 'residential', data.sdltOverride ?? 0, data.sdltSurcharge ?? true);
      const refurb = num(String(data.refurbBudget));
      const profFees = refurb * (num(String(data.professionalFeesPct)) / 100);
      const contingency = refurb * (num(String(data.contingencyPct)) / 100);
      const other = num(String(data.otherCosts));
      const bridgingRate = num(String(data.bridgingRatePct)) / 100 / 12;
      const bridgingMonths = num(String(data.bridgingTermMonths));
      const loanAmount = (purchase + refurb) * 0.75;
      const bridgingInterest = loanAmount * bridgingRate * bridgingMonths;
      const arrangementFee = loanAmount * (num(String(data.arrangementFeePct)) / 100);
      const totalFinanceCost = bridgingInterest + arrangementFee;
      const totalCost = purchase + sdlt + refurb + profFees + contingency + other + totalFinanceCost;
      const salePrice = num(String(data.salePrice));
      const agentFees = salePrice * (num(String(data.agentFeePct)) / 100);
      const netProceeds = salePrice - agentFees;
      const profit = netProceeds - totalCost;
      const roi = totalCost > 0 ? profit / totalCost : 0;
      const roiEquity = (totalCost - loanAmount) > 0 ? profit / (totalCost - loanAmount) : 0;
      const cfs = [-totalCost, ...Array(bridgingMonths - 1).fill(0), netProceeds];
      const irrMonthly = calcIRR(cfs);
      const irr = Math.pow(1 + irrMonthly, 12) - 1;
      return { purchase, sdlt, refurb, profFees, contingency, totalFinanceCost, totalCost, salePrice, agentFees, netProceeds, profit, roi, roiEquity, irr, loanAmount, bridgingInterest };
    }
    return {};
  }, [assetType, data]);

  const results = calc();

  /* ─── SENSITIVITY ─── */
  const sensitivity = useCallback(() => {
    if (assetType !== "BTR") return null;
    const yields = [-0.5, -0.25, 0, 0.25, 0.5].map(d => num(String(data.exitYield)) + d);
    const rents = [-200, -100, 0, 100, 200].map(d => 1 + d / (data.units?.[0]?.rentPcm || 2000));
    return yields.map(y => rents.map(rf => {
      const units = data.units || [];
      const grossRent = units.reduce((s: number, u: any) => s + num(String(u.count)) * num(String(u.rentPcm)) * rf * 12, 0);
      const voidAdj = 1 - (num(String(data.voidPct)) / 100);
      const totalSqft = units.reduce((s: number, u: any) => s + num(String(u.count)) * num(String(u.size)), 0);
      const noi = grossRent * voidAdj - totalSqft * num(String(data.opexPsf));
      const gdv = noi / (y / 100);
      const r = calc();
      const poc = r.totalCost > 0 ? (gdv - r.totalCost) / r.totalCost : 0;
      return poc;
    }));
  }, [assetType, data, calc]);

  const sensMatrix = sensitivity();

  /* ─── SAVE ─── */
  const save = async () => {
    if (!user) return;
    setSaving(true);
    const r = results as any;
    const payload = {
      created_by: user.id,
      name: data.name || "Untitled Appraisal",
      scenario: "base",
      status: "draft",
      units_omr: assetType === "BTR" ? (data.units?.filter((u: any) => u.type?.includes("OMR")).reduce((s: number, u: any) => s + num(String(u.count)), 0)) : 0,
      units_dmr: assetType === "BTR" ? (data.units?.filter((u: any) => u.type?.includes("DMR")).reduce((s: number, u: any) => s + num(String(u.count)), 0)) : 0,
      rent_omr_pcm: assetType === "BTR" ? (data.units?.[0]?.rentPcm || 0) : 0,
      exit_yield: num(String(data.exitYield || 0)) / 100,
      land_cost: num(String(data.landCost || data.purchasePrice || 0)),
      gdv: r.gdv || r.exitValue || r.salePrice || 0,
      total_cost: r.totalCost || r.totalInvestment || 0,
      profit: r.profit || 0,
      profit_on_cost: r.poc || r.roi || 0,
      irr_unlevered: r.irr || 0,
      programme_months: num(String(data.programmMonths)),
      firm_id: null,
    };

    let result;
    if (projectId) {
      payload["project_id" as any] = projectId;
      payload["firm_id" as any] = null;
    }

    if (appraisalId) {
      result = await supabase.from("appraisals").update(payload).eq("id", appraisalId).select().single();
    } else {
      if (!projectId) {
        // Create a project first
        const { data: proj } = await supabase.from("projects").insert({
          name: data.name || "New Project",
          location: data.location || "",
          asset_type: assetType,
          currency: data.currency || "GBP",
          benchmark_rate: data.benchmark || "SONIA",
          created_by: user.id,
          firm_id: null,
        }).select().single();
        if (proj) payload["project_id" as any] = proj.id;
      }
      result = await supabase.from("appraisals").insert(payload).select().single();
    }

    if (result?.data) {
      setAppraisalId(result.data.id);
      setSaved(true);
    }
    setSaving(false);
  };

  /* ─── TABS ─── */
  const TABS_BTR = ["general", "revenue", "costs", "finance", "cashflow", "analysis"];
  const TABS_BTS = ["general", "revenue", "costs", "finance", "analysis"];
  const TABS_HOTEL = ["general", "revenue", "costs", "finance", "analysis"];
  const TABS_FLIP = ["general", "costs", "finance", "analysis"];
  const TABS = assetType === "BTR" ? TABS_BTR : assetType === "BTS" ? TABS_BTS : assetType === "Hotel" ? TABS_HOTEL : TABS_FLIP;

  const TAB_LABELS: Record<string, string> = {
    general: "General", revenue: "Revenue", costs: "Costs", finance: "Finance", cashflow: "Cash Flow", analysis: "Analysis"
  };

  const currencies = ["GBP", "USD", "EUR", "AED", "SGD", "AUD", "JPY", "CHF", "CAD", "HKD"];
  const benchmarks = ["SONIA", "SOFR", "EURIBOR", "EIBOR", "SORA", "AONIA", "TONA", "SARON", "CORRA", "HONIA"];
  const currencySymbol = { GBP: "£", USD: "$", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$", JPY: "¥", CHF: "Fr", CAD: "C$", HKD: "HK$" }[data.currency] || "£";

  const r = results as any;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}>
      <style>{CSS}</style>

      {/* ── Top Nav ── */}
      <div style={{ background: "var(--bg1)", borderBottom: "1px solid var(--border)", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--gold)", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 300, cursor: "pointer", letterSpacing: ".1em" }}>VALORA</button>
        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
        <span style={{ fontSize: 12, color: "var(--text-d)" }}>← </span>
        <button onClick={() => router.push("/dashboard")} className="btn-ghost" style={{ padding: "5px 12px", fontSize: 11 }}>Dashboard</button>
        <div style={{ flex: 1 }} />
        <div className="save-indicator">
          {saving && <span style={{ width: 12, height: 12, border: "1.5px solid var(--gold)", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />}
          {saved && !saving && <><span style={{ color: "var(--green)", fontSize: 12 }}>✓</span><span>Saved</span></>}
          {!saved && !saving && <span style={{ animation: "pulse 2s infinite" }}>Unsaved changes</span>}
        </div>
        <button className="btn-primary" onClick={save} disabled={saving} style={{ padding: "8px 18px", fontSize: 12 }}>
          {saving ? "Saving…" : "Save Appraisal"}
        </button>
      </div>

      {/* ── Asset Type Switcher ── */}
      <div style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "0 24px", display: "flex", alignItems: "center", gap: 8, height: 46 }}>
        <span style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".1em", marginRight: 8 }}>Asset Type:</span>
        {(["BTR", "BTS", "Hotel", "Flip"] as AssetType[]).map(t => (
          <button key={t} onClick={() => switchAssetType(t)} style={{
            padding: "5px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid",
            background: assetType === t ? "rgba(201,168,76,.12)" : "transparent",
            borderColor: assetType === t ? "var(--gold)" : "var(--border)",
            color: assetType === t ? "var(--gold)" : "var(--text-d)",
            fontFamily: "var(--font-body)", transition: "all .2s",
          }}>{t}</button>
        ))}
        <div style={{ flex: 1 }} />
        <input className="inp" value={data.name} onChange={e => set("name", e.target.value)} placeholder="Appraisal name…" style={{ width: 240, padding: "6px 12px", fontSize: 13 }} />
      </div>

      {/* ── Main Editor Layout ── */}
      <div className="editor-layout" style={{ display: "grid", gridTemplateColumns: "1fr 320px", minHeight: "calc(100vh - 102px)" }}>

        {/* ── Left: Tabs + Inputs ── */}
        <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
          {/* Tab bar */}
          <div style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", display: "flex", overflowX: "auto", padding: "0 16px" }}>
            {TABS.map(t => (
              <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{TAB_LABELS[t]}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>

            {/* ── GENERAL TAB ── */}
            {activeTab === "general" && (
              <div>
                <div className="section-title">Project Details</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Project Name</label>
                    <input className="inp" value={data.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Chiswick Tower" />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Location</label>
                    <input className="inp" value={data.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Hammersmith, London" />
                  </div>
                </div>
                <div className="inp-row-3">
                  <div className="inp-group">
                    <label className="inp-label">Currency</label>
                    <select className="inp" value={data.currency} onChange={e => set("currency", e.target.value)}>
                      {currencies.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Benchmark Rate</label>
                    <select className="inp" value={data.benchmark} onChange={e => set("benchmark", e.target.value)}>
                      {benchmarks.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">{data.benchmark} Rate (%)</label>
                    <input className="inp" type="number" step="0.01" value={data.benchmarkRate} onChange={e => set("benchmarkRate", e.target.value)} />
                  </div>
                </div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Programme (months)</label>
                    <input className="inp" type="number" value={data.programmMonths} onChange={e => set("programmMonths", e.target.value)} />
                  </div>
                  {assetType !== "Flip" && (
                    <div className="inp-group">
                      <label className="inp-label">Stabilisation (months)</label>
                      <input className="inp" type="number" value={data.stabilisationMonths} onChange={e => set("stabilisationMonths", e.target.value)} />
                    </div>
                  )}
                </div>
                <div className="inp-group">
                  <label className="inp-label">Cost Profile</label>
                  <select className="inp" value={data.costProfile} onChange={e => set("costProfile", e.target.value)}>
                    <option value="scurve">S-Curve (recommended)</option>
                    <option value="straight">Straight-Line</option>
                    <option value="frontloaded">Front-Loaded</option>
                  </select>
                </div>
              </div>
            )}

            {/* ── REVENUE TAB ── */}
            {activeTab === "revenue" && assetType === "BTR" && (
              <div>
                <div className="section-title">Unit Mix & Rents</div>
                {/* Header */}
                <div className="unit-row" style={{ borderBottom: "1px solid var(--gold)44" }}>
                  {["Unit Type", "Count", "Rent (pcm)", "Size (sqft)", "Gross Pa", ""].map((h, i) => (
                    <div key={i} style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".07em" }}>{h}</div>
                  ))}
                </div>
                {(data.units || []).map((u: any, i: number) => {
                  const grossPa = num(String(u.count)) * num(String(u.rentPcm)) * 12;
                  return (
                    <div key={i} className="unit-row">
                      <input className="inp" value={u.type} onChange={e => updateUnit(i, "type", e.target.value)} style={{ padding: "6px 8px", fontSize: 12 }} />
                      <input className="inp" type="number" value={u.count} onChange={e => updateUnit(i, "count", e.target.value)} style={{ padding: "6px 8px", fontSize: 12 }} />
                      <input className="inp" type="number" value={u.rentPcm} onChange={e => updateUnit(i, "rentPcm", e.target.value)} style={{ padding: "6px 8px", fontSize: 12 }} />
                      <input className="inp" type="number" value={u.size} onChange={e => updateUnit(i, "size", e.target.value)} style={{ padding: "6px 8px", fontSize: 12 }} />
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-m)" }}>{fmt(grossPa, currencySymbol)}</div>
                      <button onClick={() => removeUnit(i)} style={{ background: "none", border: "none", color: "var(--text-d)", cursor: "pointer", fontSize: 16, padding: 0 }}>×</button>
                    </div>
                  );
                })}
                <button className="btn-ghost" onClick={addUnit} style={{ marginTop: 12, fontSize: 11 }}>+ Add Unit Type</button>

                <div className="section-title" style={{ marginTop: 28 }}>Exit Assumptions</div>
                <div className="inp-row-3">
                  <div className="inp-group">
                    <label className="inp-label">Exit Yield (%)</label>
                    <input className="inp" type="number" step="0.05" value={data.exitYield} onChange={e => set("exitYield", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">NIY (%)</label>
                    <input className="inp" type="number" step="0.05" value={data.niy} onChange={e => set("niy", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Void (%)</label>
                    <input className="inp" type="number" step="0.1" value={data.voidPct} onChange={e => set("voidPct", e.target.value)} />
                  </div>
                </div>
                <div className="inp-group">
                  <label className="inp-label">OpEx (psf pa)</label>
                  <input className="inp" type="number" value={data.opexPsf} onChange={e => set("opexPsf", e.target.value)} />
                </div>
              </div>
            )}

            {activeTab === "revenue" && assetType === "BTS" && (
              <div>
                <div className="section-title">Unit Mix & Sales</div>
                <div className="unit-row" style={{ borderBottom: "1px solid var(--gold)44" }}>
                  {["Unit Type", "Count", "Price (psf)", "Size (sqft)", "Revenue", ""].map((h, i) => (
                    <div key={i} style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".07em" }}>{h}</div>
                  ))}
                </div>
                {(data.units || []).map((u: any, i: number) => {
                  const rev = num(String(u.count)) * num(String(u.size)) * num(String(u.salePricePsf));
                  return (
                    <div key={i} className="unit-row">
                      <input className="inp" value={u.type} onChange={e => updateUnit(i, "type", e.target.value)} style={{ padding: "6px 8px", fontSize: 12 }} />
                      <input className="inp" type="number" value={u.count} onChange={e => updateUnit(i, "count", e.target.value)} style={{ padding: "6px 8px", fontSize: 12 }} />
                      <input className="inp" type="number" value={u.salePricePsf} onChange={e => updateUnit(i, "salePricePsf", e.target.value)} style={{ padding: "6px 8px", fontSize: 12 }} />
                      <input className="inp" type="number" value={u.size} onChange={e => updateUnit(i, "size", e.target.value)} style={{ padding: "6px 8px", fontSize: 12 }} />
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-m)" }}>{fmt(rev, currencySymbol)}</div>
                      <button onClick={() => removeUnit(i)} style={{ background: "none", border: "none", color: "var(--text-d)", cursor: "pointer", fontSize: 16, padding: 0 }}>×</button>
                    </div>
                  );
                })}
                <button className="btn-ghost" onClick={addUnit} style={{ marginTop: 12, fontSize: 11 }}>+ Add Unit Type</button>
                <div className="section-title" style={{ marginTop: 28 }}>Sales Costs</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Agent Fee (%)</label>
                    <input className="inp" type="number" step="0.1" value={data.agentFeePct} onChange={e => set("agentFeePct", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Marketing (%)</label>
                    <input className="inp" type="number" step="0.1" value={data.marketingPct} onChange={e => set("marketingPct", e.target.value)} />
                  </div>
                </div>
                <div className="inp-group">
                  <label className="inp-label">Absorption Period (months)</label>
                  <input className="inp" type="number" value={data.absorptionMonths} onChange={e => set("absorptionMonths", e.target.value)} />
                </div>
              </div>
            )}

            {activeTab === "revenue" && assetType === "Hotel" && (
              <div>
                <div className="section-title">Hotel Trading</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Number of Rooms</label>
                    <input className="inp" type="number" value={data.rooms} onChange={e => set("rooms", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Star Rating</label>
                    <select className="inp" value={data.starRating} onChange={e => set("starRating", e.target.value)}>
                      {[3, 4, 5].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">ADR ({currencySymbol})</label>
                    <input className="inp" type="number" value={data.adr} onChange={e => set("adr", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Occupancy (%)</label>
                    <input className="inp" type="number" value={data.occupancy} onChange={e => set("occupancy", e.target.value)} />
                  </div>
                </div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">EBITDA Margin (%)</label>
                    <input className="inp" type="number" value={data.ebitdaMarginPct} onChange={e => set("ebitdaMarginPct", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">RevPAR Growth (%pa)</label>
                    <input className="inp" type="number" step="0.1" value={data.revparGrowthPct} onChange={e => set("revparGrowthPct", e.target.value)} />
                  </div>
                </div>
                <div className="section-title" style={{ marginTop: 24 }}>Exit Assumptions</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Stabilised Cap Rate (%)</label>
                    <input className="inp" type="number" step="0.1" value={data.stabilisedCapRate} onChange={e => set("stabilisedCapRate", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Exit Cap Rate (%)</label>
                    <input className="inp" type="number" step="0.1" value={data.exitCapRate} onChange={e => set("exitCapRate", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* ── COSTS TAB ── */}
            {activeTab === "costs" && assetType !== "Flip" && assetType !== "Hotel" && (
              <div>
                <div className="section-title">Land</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Land Cost ({currencySymbol})</label>
                    <input className="inp" type="number" value={data.landCost} onChange={e => set("landCost", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">SDLT (auto-calculated)</label>
                    <div className="inp" style={{ color: "var(--amber)", cursor: "not-allowed" }}>{fmt(r.sdlt || 0, currencySymbol)}</div>
                  </div>
                </div>
                <div className="section-title" style={{ marginTop: 24 }}>Build Costs</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Build Cost (psf)</label>
                    <input className="inp" type="number" value={data.buildCostPsf} onChange={e => set("buildCostPsf", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Site Area (sqft)</label>
                    <input className="inp" type="number" value={data.siteAreaSqft} onChange={e => set("siteAreaSqft", e.target.value)} />
                  </div>
                </div>
                <div className="inp-row-3">
                  <div className="inp-group">
                    <label className="inp-label">Professional Fees (%)</label>
                    <input className="inp" type="number" step="0.5" value={data.professionalFeesPct} onChange={e => set("professionalFeesPct", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Contingency (%)</label>
                    <input className="inp" type="number" step="0.5" value={data.contingencyPct} onChange={e => set("contingencyPct", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Other Costs ({currencySymbol})</label>
                    <input className="inp" type="number" value={data.otherCosts} onChange={e => set("otherCosts", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "costs" && assetType === "Hotel" && (
              <div>
                <div className="section-title">Acquisition</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Purchase Price ({currencySymbol})</label>
                    <input className="inp" type="number" value={data.purchasePrice} onChange={e => set("purchasePrice", e.target.value)} />
                  </div>
                  <div className="inp-group" style={{ gridColumn: "1 / -1" }}>
  <label className="inp-label">SDLT</label>
  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
    <button
      onClick={() => set("sdltMode", "auto")}
      style={{
        padding: "4px 14px", borderRadius: 6, border: "none", cursor: "pointer",
        fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
        background: data.sdltMode !== "manual" ? "var(--gold)" : "rgba(255,255,255,0.07)",
        color: data.sdltMode !== "manual" ? "#06070a" : "var(--text-muted)",
      }}
    >Auto</button>
    <button
      onClick={() => set("sdltMode", "manual")}
      style={{
        padding: "4px 14px", borderRadius: 6, border: "none", cursor: "pointer",
        fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
        background: data.sdltMode === "manual" ? "var(--gold)" : "rgba(255,255,255,0.07)",
        color: data.sdltMode === "manual" ? "#06070a" : "var(--text-muted)",
      }}
    >Override</button>
  </div>

  {data.sdltMode !== "manual" && (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <select
        className="inp"
        value={data.sdltTransactionType ?? "residential"}
        onChange={e => set("sdltTransactionType", e.target.value)}
      >
        <option value="residential">Residential</option>
        <option value="commercial">Commercial / Non-Residential</option>
        <option value="mixed">Mixed-Use</option>
        <option value="spv">SPV Share Deal (Exempt)</option>
      </select>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          id="sdltSurcharge"
          checked={data.sdltSurcharge ?? true}
          onChange={e => set("sdltSurcharge", e.target.checked)}
        />
        <label htmlFor="sdltSurcharge" className="inp-label" style={{ marginBottom: 0, fontSize: 12 }}>
          +3% surcharge (additional dwelling / company purchase)
        </label>
      </div>
      <div className="inp" style={{ color: "var(--gold)", cursor: "not-allowed" }}>
        {fmt(r.sdlt || 0, currencySymbol)}
        {data.sdltTransactionType === "spv" && (
          <span style={{ marginLeft: 8, fontSize: 11, color: "var(--green)", fontFamily: "var(--font-mono)" }}>EXEMPT</span>
        )}
      </div>
    </div>
  )}

  {data.sdltMode === "manual" && (
    <input
      className="inp"
      type="number"
      placeholder="Enter SDLT amount"
      value={data.sdltOverride ?? 0}
      onChange={e => set("sdltOverride", +e.target.value)}
    />
  )}
</div>
                </div>
                <div className="section-title" style={{ marginTop: 24 }}>CapEx & Costs</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">CapEx Budget ({currencySymbol})</label>
                    <input className="inp" type="number" value={data.capexBudget} onChange={e => set("capexBudget", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Other Costs ({currencySymbol})</label>
                    <input className="inp" type="number" value={data.otherCosts} onChange={e => set("otherCosts", e.target.value)} />
                  </div>
                </div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Professional Fees (%)</label>
                    <input className="inp" type="number" step="0.5" value={data.professionalFeesPct} onChange={e => set("professionalFeesPct", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Contingency (%)</label>
                    <input className="inp" type="number" step="0.5" value={data.contingencyPct} onChange={e => set("contingencyPct", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "costs" && assetType === "Flip" && (
              <div>
                <div className="section-title">Acquisition</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Purchase Price ({currencySymbol})</label>
                    <input className="inp" type="number" value={data.purchasePrice} onChange={e => set("purchasePrice", e.target.value)} />
                  </div>
                  <div className="inp-group" style={{ gridColumn: "1 / -1" }}>
  <label className="inp-label">SDLT</label>
  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
    <button
      onClick={() => set("sdltMode", "auto")}
      style={{
        padding: "4px 14px", borderRadius: 6, border: "none", cursor: "pointer",
        fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
        background: data.sdltMode !== "manual" ? "var(--gold)" : "rgba(255,255,255,0.07)",
        color: data.sdltMode !== "manual" ? "#06070a" : "var(--text-muted)",
      }}
    >Auto</button>
    <button
      onClick={() => set("sdltMode", "manual")}
      style={{
        padding: "4px 14px", borderRadius: 6, border: "none", cursor: "pointer",
        fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
        background: data.sdltMode === "manual" ? "var(--gold)" : "rgba(255,255,255,0.07)",
        color: data.sdltMode === "manual" ? "#06070a" : "var(--text-muted)",
      }}
    >Override</button>
  </div>

  {data.sdltMode !== "manual" && (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <select
        className="inp"
        value={data.sdltTransactionType ?? "residential"}
        onChange={e => set("sdltTransactionType", e.target.value)}
      >
        <option value="residential">Residential</option>
        <option value="commercial">Commercial / Non-Residential</option>
        <option value="mixed">Mixed-Use</option>
        <option value="spv">SPV Share Deal (Exempt)</option>
      </select>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          id="sdltSurcharge"
          checked={data.sdltSurcharge ?? true}
          onChange={e => set("sdltSurcharge", e.target.checked)}
        />
        <label htmlFor="sdltSurcharge" className="inp-label" style={{ marginBottom: 0, fontSize: 12 }}>
                  +3% surcharge (additional dwelling / company purchase)
                </label>
              </div>
            </div>
          )}

          {data.sdltMode === "manual" && (
            <input
              className="inp"
              type="number"
              placeholder="Enter SDLT amount"
              value={data.sdltOverride ?? 0}
              onChange={e => set("sdltOverride", +e.target.value)}
            />
          )}
        </div>
                <div className="section-title" style={{ marginTop: 24 }}>Refurbishment</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Refurb Budget ({currencySymbol})</label>
                    <input className="inp" type="number" value={data.refurbBudget} onChange={e => set("refurbBudget", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Other Costs ({currencySymbol})</label>
                    <input className="inp" type="number" value={data.otherCosts} onChange={e => set("otherCosts", e.target.value)} />
                  </div>
                </div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Professional Fees (%)</label>
                    <input className="inp" type="number" step="0.5" value={data.professionalFeesPct} onChange={e => set("professionalFeesPct", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Contingency (%)</label>
                    <input className="inp" type="number" step="0.5" value={data.contingencyPct} onChange={e => set("contingencyPct", e.target.value)} />
                  </div>
                </div>
                <div className="section-title" style={{ marginTop: 24 }}>Sale</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Sale Price ({currencySymbol})</label>
                    <input className="inp" type="number" value={data.salePrice} onChange={e => set("salePrice", e.target.value)} />
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Agent Fee (%)</label>
                    <input className="inp" type="number" step="0.1" value={data.agentFeePct} onChange={e => set("agentFeePct", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* ── FINANCE TAB ── */}
            {activeTab === "finance" && (
              <div>
                <div className="section-title">Development Finance</div>
                {assetType !== "Flip" ? (
                  <>
                    <div className="inp-row">
                      <div className="inp-group">
                        <label className="inp-label">LTC Ratio (%)</label>
                        <input className="inp" type="number" step="1" value={data.ltc} onChange={e => set("ltc", e.target.value)} />
                      </div>
                      <div className="inp-group">
                        <label className="inp-label">Margin over {data.benchmark} (%)</label>
                        <input className="inp" type="number" step="0.1" value={data.marginOverBenchmark} onChange={e => set("marginOverBenchmark", e.target.value)} />
                      </div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group">
                        <label className="inp-label">Arrangement Fee (%)</label>
                        <input className="inp" type="number" step="0.1" value={data.arrangementFeePct} onChange={e => set("arrangementFeePct", e.target.value)} />
                      </div>
                      <div className="inp-group">
                        <label className="inp-label">All-in Rate (auto)</label>
                        <div className="inp" style={{ color: "var(--blue)", cursor: "not-allowed" }}>
                          {r.financeRate ? `${(r.financeRate * 100).toFixed(2)}%` : "—"}
                        </div>
                      </div>
                    </div>
                    <div className="inp-group">
                      <label className="inp-label">Loan Amount (auto)</label>
                      <div className="inp" style={{ color: "var(--amber)", cursor: "not-allowed" }}>{fmt(r.loanAmount || 0, currencySymbol)}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="inp-row">
                      <div className="inp-group">
                        <label className="inp-label">Bridging Rate (%pm)</label>
                        <input className="inp" type="number" step="0.05" value={data.bridgingRatePct} onChange={e => set("bridgingRatePct", e.target.value)} />
                      </div>
                      <div className="inp-group">
                        <label className="inp-label">Term (months)</label>
                        <input className="inp" type="number" value={data.bridgingTermMonths} onChange={e => set("bridgingTermMonths", e.target.value)} />
                      </div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group">
                        <label className="inp-label">Arrangement Fee (%)</label>
                        <input className="inp" type="number" step="0.1" value={data.arrangementFeePct} onChange={e => set("arrangementFeePct", e.target.value)} />
                      </div>
                      <div className="inp-group">
                        <label className="inp-label">Loan Amount (auto)</label>
                        <div className="inp" style={{ color: "var(--amber)", cursor: "not-allowed" }}>{fmt(r.loanAmount || 0, currencySymbol)}</div>
                      </div>
                    </div>
                  </>
                )}

                {assetType !== "Flip" && (
                  <>
                    <div className="section-title" style={{ marginTop: 28 }}>Promote Waterfall</div>
                    {[1, 2, 3].map(tier => (
                      <div key={tier} className="waterfall-tier">
                        <div style={{ fontSize: 12, color: "var(--gold)", fontWeight: 500, marginBottom: 12 }}>Tier {tier}</div>
                        <div className="inp-row">
                          <div className="inp-group">
                            <label className="inp-label">IRR Hurdle (%)</label>
                            <input className="inp" type="number" value={data[`tier${tier}Hurdle`]} onChange={e => set(`tier${tier}Hurdle`, e.target.value)} />
                          </div>
                          <div className="inp-group">
                            <label className="inp-label">Developer Share (%)</label>
                            <input className="inp" type="number" value={data[`tier${tier}DevShare`]} onChange={e => set(`tier${tier}DevShare`, e.target.value)} />
                          </div>
                        </div>
                        <div style={{ height: 6, background: "var(--bg4)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${data[`tier${tier}DevShare`]}%`, background: "linear-gradient(90deg,var(--gold),var(--gold-l))", borderRadius: 3 }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-d)", marginTop: 4 }}>
                          <span>Developer: {data[`tier${tier}DevShare`]}%</span>
                          <span>Investor: {100 - data[`tier${tier}DevShare`]}%</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ── CASHFLOW TAB (BTR only) ── */}
            {activeTab === "cashflow" && assetType === "BTR" && (
              <div>
                <div className="section-title">Monthly Cash Flow (Indicative)</div>
                <div style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 16 }}>
                  {data.costProfile === "scurve" ? "S-Curve" : data.costProfile === "frontloaded" ? "Front-Loaded" : "Straight-Line"} cost profile · {data.programmMonths} month programme
                </div>
                <div style={{ overflowX: "auto" }}>
                  <div className="cf-row" style={{ marginBottom: 8 }}>
                    <div className="cf-header">Month</div>
                    <div className="cf-header">Cost Draw</div>
                    <div className="cf-header">Cum. Draw</div>
                    <div className="cf-header">Interest</div>
                    <div className="cf-header">Net CF</div>
                    <div className="cf-header">Cum. Cost</div>
                    <div className="cf-header">% Complete</div>
                  </div>
                  {Array.from({ length: Math.min(num(String(data.programmMonths)), 36) }, (_, m) => {
                    const months = num(String(data.programmMonths));
                    const totalCost = r.buildCost || 0;
                    let pct = 0;
                    if (data.costProfile === "scurve") {
                      pct = 1 / (1 + Math.exp(-10 * ((m + 1) / months - 0.5)));
                    } else if (data.costProfile === "frontloaded") {
                      pct = Math.sqrt((m + 1) / months);
                    } else {
                      pct = (m + 1) / months;
                    }
                    const prevPct = m === 0 ? 0 : (data.costProfile === "scurve"
                      ? 1 / (1 + Math.exp(-10 * (m / months - 0.5)))
                      : data.costProfile === "frontloaded"
                        ? Math.sqrt(m / months)
                        : m / months);
                    const draw = totalCost * (pct - prevPct);
                    const cumDraw = totalCost * pct;
                    const finRate = r.financeRate || 0;
                    const interest = cumDraw * (finRate / 12);
                    const netCf = -(draw + interest);
                    const cumCost = cumDraw + (r.landCost || 0) + (r.sdlt || 0);
                    return (
                      <div key={m} className="cf-row" style={{ background: m % 2 === 0 ? "transparent" : "rgba(255,255,255,.015)" }}>
                        <div style={{ color: "var(--text-d)" }}>M{m + 1}</div>
                        <div style={{ color: "var(--red)", fontFamily: "var(--font-mono)" }}>{fmt(draw, currencySymbol)}</div>
                        <div style={{ color: "var(--text-m)", fontFamily: "var(--font-mono)" }}>{fmt(cumDraw, currencySymbol)}</div>
                        <div style={{ color: "var(--amber)", fontFamily: "var(--font-mono)" }}>{fmt(interest, currencySymbol)}</div>
                        <div style={{ color: "var(--red)", fontFamily: "var(--font-mono)" }}>{fmt(netCf, currencySymbol)}</div>
                        <div style={{ color: "var(--text-m)", fontFamily: "var(--font-mono)" }}>{fmt(cumCost, currencySymbol)}</div>
                        <div style={{ color: "var(--green)" }}>{(pct * 100).toFixed(0)}%</div>
                      </div>
                    );
                  })}
                  <div className="cf-row" style={{ background: "rgba(201,168,76,.05)", borderTop: "1px solid var(--gold)44" }}>
                    <div style={{ color: "var(--gold)", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600 }}>EXIT</div>
                    <div />
                    <div />
                    <div />
                    <div style={{ color: "var(--green)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmt(r.gdv || 0, currencySymbol)}</div>
                    <div />
                    <div style={{ color: "var(--green)" }}>100%</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ANALYSIS TAB ── */}
            {activeTab === "analysis" && (
              <div>
                <div className="section-title">Returns Summary</div>
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                  {assetType === "BTR" && (
                    <>
                      {[
                        ["GDV (Exit)", fmt(r.gdv, currencySymbol), "var(--gold)"],
                        ["Gross NOI pa", fmt(r.noi, currencySymbol), "var(--text)"],
                        ["Total Build Cost", fmt(r.buildCost, currencySymbol), "var(--text-m)"],
                        ["Total Finance Cost", fmt(r.totalFinanceCost, currencySymbol), "var(--amber)"],
                        ["Total Cost", fmt(r.totalCost, currencySymbol), "var(--text-m)"],
                        ["Profit", fmt(r.profit, currencySymbol), r.profit > 0 ? "var(--green)" : "var(--red)"],
                        ["Profit on Cost", fmtPct(r.poc), r.poc > 0.2 ? "var(--green)" : r.poc > 0.1 ? "var(--amber)" : "var(--red)"],
                        ["Yield on Cost", fmtPct(r.yoc), "var(--blue)"],
                        ["IRR (Unlevered)", fmtPct(r.irr), "var(--blue)"],
                        ["Residual Land Value", fmt(r.rlv, currencySymbol), "var(--gold)"],
                      ].map(([l, v, c]) => (
                        <div key={l as string} className="output-row">
                          <span className="output-label">{l}</span>
                          <span className="output-value" style={{ color: c as string }}>{v}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {assetType === "BTS" && (
                    <>
                      {[
                        ["GDV", fmt(r.gdv, currencySymbol), "var(--gold)"],
                        ["Total Units", r.totalUnits?.toString() || "—", "var(--text)"],
                        ["Total Sqft", r.totalSqft?.toLocaleString() || "—", "var(--text-m)"],
                        ["Total Cost", fmt(r.totalCost, currencySymbol), "var(--text-m)"],
                        ["Profit", fmt(r.profit, currencySymbol), r.profit > 0 ? "var(--green)" : "var(--red)"],
                        ["Profit on Cost", fmtPct(r.poc), r.poc > 0.2 ? "var(--green)" : r.poc > 0.1 ? "var(--amber)" : "var(--red)"],
                        ["Profit on GDV", fmtPct(r.margin), r.margin > 0.15 ? "var(--green)" : "var(--amber)"],
                        ["IRR (Unlevered)", fmtPct(r.irr), "var(--blue)"],
                      ].map(([l, v, c]) => (
                        <div key={l as string} className="output-row">
                          <span className="output-label">{l}</span>
                          <span className="output-value" style={{ color: c as string }}>{v}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {assetType === "Hotel" && (
                    <>
                      {[
                        ["RevPAR", fmt(r.revpar, currencySymbol), "var(--gold)"],
                        ["Revenue pa", fmt(r.revenuePa, currencySymbol), "var(--text)"],
                        ["EBITDA pa", fmt(r.ebitda, currencySymbol), "var(--green)"],
                        ["Stabilised Value", fmt(r.stabilisedValue, currencySymbol), "var(--text-m)"],
                        ["Exit Value", fmt(r.exitValue, currencySymbol), "var(--gold)"],
                        ["Total Investment", fmt(r.totalInvestment, currencySymbol), "var(--text-m)"],
                        ["Profit", fmt(r.profit, currencySymbol), r.profit > 0 ? "var(--green)" : "var(--red)"],
                        ["Return on Cost", fmtPct(r.poc), r.poc > 0.15 ? "var(--green)" : "var(--amber)"],
                        ["Yield on Cost", fmtPct(r.yoc), "var(--blue)"],
                        ["IRR", fmtPct(r.irr), "var(--blue)"],
                      ].map(([l, v, c]) => (
                        <div key={l as string} className="output-row">
                          <span className="output-label">{l}</span>
                          <span className="output-value" style={{ color: c as string }}>{v}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {assetType === "Flip" && (
                    <>
                      {[
                        ["Purchase Price", fmt(r.purchase, currencySymbol), "var(--text)"],
                        ["SDLT", fmt(r.sdlt, currencySymbol), "var(--amber)"],
                        ["Refurb Budget", fmt(r.refurb, currencySymbol), "var(--text-m)"],
                        ["Finance Cost", fmt(r.totalFinanceCost, currencySymbol), "var(--amber)"],
                        ["Total Cost", fmt(r.totalCost, currencySymbol), "var(--text-m)"],
                        ["Net Sale Proceeds", fmt(r.netProceeds, currencySymbol), "var(--gold)"],
                        ["Profit", fmt(r.profit, currencySymbol), r.profit > 0 ? "var(--green)" : "var(--red)"],
                        ["ROI on Total Cost", fmtPct(r.roi), r.roi > 0.15 ? "var(--green)" : "var(--amber)"],
                        ["ROI on Equity", fmtPct(r.roiEquity), r.roiEquity > 0.25 ? "var(--green)" : "var(--amber)"],
                        ["IRR (Annualised)", fmtPct(r.irr), "var(--blue)"],
                      ].map(([l, v, c]) => (
                        <div key={l as string} className="output-row">
                          <span className="output-label">{l}</span>
                          <span className="output-value" style={{ color: c as string }}>{v}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Sensitivity Matrix (BTR only) */}
                {assetType === "BTR" && sensMatrix && (
                  <div>
                    <div className="section-title">Sensitivity — Profit on Cost %</div>
                    <div style={{ fontSize: 11, color: "var(--text-d)", marginBottom: 12 }}>Exit yield (rows) vs rent multiplier (columns)</div>
                    <div style={{ display: "grid", gridTemplateColumns: "80px repeat(5,1fr)", gap: 4, fontSize: 10 }}>
                      <div />
                      {["-10%", "-5%", "Base", "+5%", "+10%"].map(h => (
                        <div key={h} style={{ textAlign: "center", color: "var(--text-d)", padding: "4px", textTransform: "uppercase", letterSpacing: ".06em" }}>{h}</div>
                      ))}
                      {sensMatrix.map((row: number[], yi: number) => {
                        const yields = [-0.5, -0.25, 0, 0.25, 0.5];
                        const yieldVal = num(String(data.exitYield)) + yields[yi];
                        return (
                          <>
                            <div key={`y${yi}`} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6, color: "var(--text-d)" }}>{yieldVal.toFixed(2)}%</div>
                            {row.map((poc: number, ri: number) => {
                              const isBase = yi === 2 && ri === 2;
                              const cls = poc > 0.20 ? "cell-g" : poc > 0.10 ? "cell-a" : "cell-r";
                              return (
                                <div key={ri} className={`sens-cell ${cls} ${isBase ? "cell-base" : ""}`}>
                                  {(poc * 100).toFixed(1)}%
                                </div>
                              );
                            })}
                          </>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                      {[["rgba(61,220,132,.15)", "> 20%"], ["rgba(240,164,41,.12)", "10–20%"], ["rgba(244,100,95,.12)", "< 10%"]].map(([bg, l]) => (
                        <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--text-d)" }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: bg }} />{l}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ── Right: Live Output Panel ── */}
        <div className="output-panel" style={{ padding: 20, position: "sticky", top: 0, height: "calc(100vh - 102px)", overflowY: "auto", background: "var(--bg1)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 300, color: "var(--text)", marginBottom: 4 }}>
            {data.name || "New Appraisal"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-d)", marginBottom: 20 }}>
            {data.location || "No location"} · {assetType} · {data.currency}
          </div>

          {/* Key metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            {assetType === "BTR" && [
              { label: "GDV", value: fmt(r.gdv, currencySymbol), color: "var(--gold)" },
              { label: "Profit on Cost", value: fmtPct(r.poc), color: r.poc > 0.2 ? "var(--green)" : r.poc > 0.1 ? "var(--amber)" : "var(--red)" },
              { label: "IRR", value: fmtPct(r.irr), color: "var(--blue)" },
              { label: "Yield on Cost", value: fmtPct(r.yoc), color: "var(--text)" },
            ].map(m => (
              <div key={m.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 9, padding: 12 }}>
                <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 300, color: m.color }}>{m.value}</div>
              </div>
            ))}
            {assetType === "BTS" && [
              { label: "GDV", value: fmt(r.gdv, currencySymbol), color: "var(--gold)" },
              { label: "Profit on Cost", value: fmtPct(r.poc), color: r.poc > 0.2 ? "var(--green)" : "var(--amber)" },
              { label: "IRR", value: fmtPct(r.irr), color: "var(--blue)" },
              { label: "Profit on GDV", value: fmtPct(r.margin), color: "var(--text)" },
            ].map(m => (
              <div key={m.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 9, padding: 12 }}>
                <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 300, color: m.color }}>{m.value}</div>
              </div>
            ))}
            {assetType === "Hotel" && [
              { label: "Exit Value", value: fmt(r.exitValue, currencySymbol), color: "var(--gold)" },
              { label: "Return on Cost", value: fmtPct(r.poc), color: r.poc > 0.15 ? "var(--green)" : "var(--amber)" },
              { label: "IRR", value: fmtPct(r.irr), color: "var(--blue)" },
              { label: "RevPAR", value: fmt(r.revpar, currencySymbol), color: "var(--text)" },
            ].map(m => (
              <div key={m.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 9, padding: 12 }}>
                <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 300, color: m.color }}>{m.value}</div>
              </div>
            ))}
            {assetType === "Flip" && [
              { label: "Sale Price", value: fmt(r.salePrice, currencySymbol), color: "var(--gold)" },
              { label: "Profit", value: fmt(r.profit, currencySymbol), color: r.profit > 0 ? "var(--green)" : "var(--red)" },
              { label: "ROI on Cost", value: fmtPct(r.roi), color: r.roi > 0.15 ? "var(--green)" : "var(--amber)" },
              { label: "IRR", value: fmtPct(r.irr), color: "var(--blue)" },
            ].map(m => (
              <div key={m.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 9, padding: 12 }}>
                <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 300, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Cost breakdown */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Cost Breakdown</div>
            {assetType === "BTR" && [
              { label: "Land + SDLT", value: (r.landCost || 0) + (r.sdlt || 0), color: "var(--text-m)" },
              { label: "Build Cost", value: r.buildCost, color: "var(--text-m)" },
              { label: "Dev Costs", value: r.devCost, color: "var(--text-m)" },
              { label: "Finance", value: r.totalFinanceCost, color: "var(--amber)" },
              { label: "Total", value: r.totalCost, color: "var(--gold)", bold: true },
            ].map((item: any) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--bg4)", fontSize: 12 }}>
                <span style={{ color: "var(--text-m)" }}>{item.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", color: item.color, fontWeight: item.bold ? 600 : 400 }}>{fmt(item.value || 0, currencySymbol)}</span>
              </div>
            ))}
            {assetType === "Flip" && [
              { label: "Purchase + SDLT", value: (r.purchase || 0) + (r.sdlt || 0), color: "var(--text-m)" },
              { label: "Refurb + Fees", value: (r.refurb || 0) + (r.profFees || 0) + (r.contingency || 0), color: "var(--text-m)" },
              { label: "Finance", value: r.totalFinanceCost, color: "var(--amber)" },
              { label: "Total", value: r.totalCost, color: "var(--gold)", bold: true },
            ].map((item: any) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--bg4)", fontSize: 12 }}>
                <span style={{ color: "var(--text-m)" }}>{item.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", color: item.color, fontWeight: item.bold ? 600 : 400 }}>{fmt(item.value || 0, currencySymbol)}</span>
              </div>
            ))}
          </div>

          {/* PoC progress bar */}
          {(r.poc !== undefined) && (
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
                <span style={{ color: "var(--text-d)" }}>Return vs 20% Target</span>
                <span style={{ color: r.poc > 0.2 ? "var(--green)" : "var(--amber)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmtPct(r.poc)}</span>
              </div>
              <div style={{ height: 6, background: "var(--bg4)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min((r.poc / 0.3) * 100, 100)}%`, background: r.poc > 0.2 ? "linear-gradient(90deg,var(--green),#2ab06a)" : "linear-gradient(90deg,var(--amber),#d4920a)", borderRadius: 3, transition: "width .3s" }} />
              </div>
              <div style={{ fontSize: 9, color: "var(--text-d)", marginTop: 6, textAlign: "right" }}>
                {r.poc > 0.2 ? `${((r.poc - 0.2) * 100).toFixed(1)}% above target` : `${((0.2 - r.poc) * 100).toFixed(1)}% below target`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}export default function AppraisalPageWrapper() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:"100vh", background:"#06070a", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:32, height:32, border:"2px solid rgba(201,168,76,.2)", borderTopColor:"#c9a84c", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <AppraisalPage/>
    </Suspense>
  );
}
