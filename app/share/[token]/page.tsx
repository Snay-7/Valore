"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect, Suspense } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams } from "next/navigation";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ── DARK THEME ── */
.theme-dark{
  --bg:#06070a;--bg1:#0c0e12;--bg2:#12151a;--bg3:#191d24;--bg4:#21262f;--bg5:#2a303b;
  --text:#eceae4;--text-m:#7d8590;--text-d:#3d4249;
  --border:rgba(255,255,255,0.06);--border-m:rgba(255,255,255,0.12);
  --card-bg:#12151a;--card-border:rgba(255,255,255,0.06);
  --section-bg:#0c0e12;--divider:rgba(255,255,255,0.06);
  --tog-bg:#191d24;--tog-active:#c9a84c;--tog-text:#7d8590;
}

/* ── LIGHT THEME ── */
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

/* ── TOGGLE ── */
.theme-toggle{display:flex;align-items:center;background:var(--tog-bg);border-radius:20px;padding:3px;gap:2px;border:1px solid var(--border)}
.theme-toggle button{padding:5px 12px;border-radius:16px;border:none;cursor:pointer;font-family:var(--font-body);font-size:11px;font-weight:500;letter-spacing:.04em;transition:all .2s;background:transparent;color:var(--tog-text)}
.theme-toggle button.active{background:var(--tog-active);color:#06070a}

/* ── HERO ── */
.hero{padding:48px 0 40px;border-bottom:1px solid var(--divider);position:relative;overflow:hidden}
.hero-inner{max-width:1080px;margin:0 auto;padding:0 48px}
.hero-eyebrow{display:flex;align-items:center;gap:8px;margin-bottom:18px;flex-wrap:wrap}
.hero-title{font-family:var(--font-display);font-size:clamp(36px,5vw,64px);font-weight:300;line-height:1.05;letter-spacing:-.01em;margin-bottom:8px}
.hero-subtitle{font-size:14px;color:var(--text-m);letter-spacing:.02em}

/* ── METRIC STRIP ── */
.metric-strip{display:grid;gap:0;border:1px solid var(--border);border-radius:12px;overflow:hidden;margin:36px 0}
.metric-strip-inner{display:grid}
.metric-cell{padding:20px 24px;border-right:1px solid var(--border);position:relative}
.metric-cell:last-child{border-right:none}
.metric-cell-label{font-size:10px;color:var(--text-d);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;font-family:var(--font-body)}
.metric-cell-value{font-family:var(--font-display);font-size:clamp(28px,3vw,40px);font-weight:300;line-height:1;letter-spacing:-.01em}
.metric-cell-sub{font-size:11px;color:var(--text-d);margin-top:6px;font-family:var(--font-mono)}

/* ── INSTITUTIONAL STRIP ── */
.inst-strip{display:grid;gap:0;border:1px solid var(--gold-border);border-radius:10px;overflow:hidden;background:var(--gold-bg);margin-bottom:36px}
.inst-cell{padding:14px 20px;border-right:1px solid var(--gold-border)}
.inst-cell:last-child{border-right:none}
.inst-cell-label{font-size:9px;color:var(--gold);text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px}
.inst-cell-value{font-family:var(--font-mono);font-size:15px;font-weight:500;color:var(--text)}

/* ── CONTENT ── */
.content-wrap{max-width:1080px;margin:0 auto;padding:40px 48px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.three-col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
.section-hdr{font-size:9px;text-transform:uppercase;letter-spacing:.14em;color:var(--text-d);margin-bottom:14px;font-family:var(--font-body);font-weight:600}
.data-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;padding:20px 22px}
.data-row{display:flex;justify-content:space-between;align-items:baseline;padding:9px 0;border-bottom:1px solid var(--divider);gap:16px}
.data-row:last-child{border-bottom:none}
.data-label{font-size:12px;color:var(--text-m);flex-shrink:0}
.data-value{font-family:var(--font-mono);font-size:12px;font-weight:500;text-align:right}
.data-label-bold{font-size:12px;color:var(--text);font-weight:600;flex-shrink:0}
.data-value-bold{font-family:var(--font-mono);font-size:13px;font-weight:600;text-align:right}
.section-gap{margin-bottom:28px}

/* ── POC BAR ── */
.poc-bar-wrap{background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;padding:18px 22px;margin-bottom:28px}
.poc-bar-track{height:5px;background:var(--bg4);border-radius:3px;overflow:hidden;margin:10px 0 6px}
.poc-bar-fill{height:100%;border-radius:3px;transition:width .8s cubic-bezier(.16,1,.3,1)}

/* ── UNIT MIX ── */
.unit-table{width:100%;border-collapse:collapse}
.unit-th{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:var(--text-d);padding:0 0 10px;border-bottom:1px solid var(--divider);text-align:left;font-family:var(--font-body);font-weight:600}
.unit-th:not(:first-child){text-align:right}
.unit-td{font-size:12px;color:var(--text-m);padding:9px 0;border-bottom:1px solid var(--divider);vertical-align:top}
.unit-td:not(:first-child){text-align:right;font-family:var(--font-mono)}
.unit-td-name{color:var(--text);font-weight:500}

/* ── FOOTER ── */
.share-footer{border-top:1px solid var(--divider);padding:24px 48px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;max-width:1080px;margin:0 auto}

/* ── BADGE ── */
.badge{display:inline-flex;align-items:center;gap:5px;background:var(--gold-bg);border:1px solid var(--gold-border);color:var(--gold);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:.06em}
.badge-type{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:.06em}

/* ── DIVIDER ── */
.sec-divider{height:1px;background:var(--divider);margin:32px 0}

@media(max-width:768px){
  .hero-inner,.content-wrap{padding:24px 20px}
  .hero-title{font-size:clamp(28px,6vw,42px)}
  .metric-strip-inner{grid-template-columns:1fr 1fr !important}
  .metric-cell{border-right:none;border-bottom:1px solid var(--border)}
  .inst-strip{grid-template-columns:1fr 1fr !important}
  .inst-cell{border-right:none;border-bottom:1px solid var(--gold-border)}
  .inst-cell:last-child{border-bottom:none}
  .two-col,.three-col{grid-template-columns:1fr}
  .share-footer{padding:20px}
}
@media(max-width:480px){
  .metric-strip-inner{grid-template-columns:1fr !important}
  .inst-strip{grid-template-columns:1fr !important}
}
`;

const fmt=(n:number,prefix="£")=>{
  if(!isFinite(n)||isNaN(n))return"—";
  const abs=Math.abs(n);
  if(abs>=1e9)return`${prefix}${(n/1e9).toFixed(2)}bn`;
  if(abs>=1e6)return`${prefix}${(n/1e6).toFixed(2)}m`;
  if(abs>=1e3)return`${prefix}${(n/1e3).toFixed(0)}k`;
  return`${prefix}${n.toFixed(0)}`;
};
const fmtPct=(n:number)=>(!isFinite(n)||isNaN(n)?"—":`${(n*100).toFixed(1)}%`);
const fmtX=(n:number)=>(!isFinite(n)||isNaN(n)||n===0?"—":`${n.toFixed(2)}×`);
const num=(v:string)=>parseFloat(String(v).replace(/[£,%\s]/g,""))||0;

function calcCosts(snap:any){
  const t=snap.assetType||"BTR";
  if(t==="BTR"||t==="BTS"){
    const units=snap.units||[];
    const totalSqft=units.reduce((s:number,u:any)=>s+num(String(u.count))*num(String(u.size)),0);
    const buildCost=totalSqft*num(String(snap.buildCostPsf||0));
    const profFees=buildCost*(num(String(snap.professionalFeesPct||0))/100);
    const contingency=buildCost*(num(String(snap.contingencyPct||0))/100);
    const gdvBts=t==="BTS"?units.reduce((s:number,u:any)=>s+num(String(u.count))*num(String(u.size))*num(String(u.salePricePsf)),0):0;
    const agentFee=t==="BTS"?gdvBts*(num(String(snap.agentFeePct||0))/100):0;
    const mktg=t==="BTS"?gdvBts*(num(String(snap.marketingPct||0))/100):0;
    return{landCost:num(String(snap.landCost||0)),buildCost,profFees,contingency,otherCosts:num(String(snap.otherCosts||0)),agentAndMarketing:agentFee+mktg,totalSqft,buildCostPsf:num(String(snap.buildCostPsf||0))};
  }
  if(t==="Hotel"){
    const capex=num(String(snap.capexBudget||0));
    return{landCost:num(String(snap.purchasePrice||0)),buildCost:capex,profFees:capex*(num(String(snap.professionalFeesPct||0))/100),contingency:capex*(num(String(snap.contingencyPct||0))/100),otherCosts:num(String(snap.otherCosts||0)),agentAndMarketing:0,totalSqft:0,buildCostPsf:0};
  }
  const refurb=num(String(snap.refurbBudget||0));
  return{landCost:num(String(snap.purchasePrice||0)),buildCost:refurb,profFees:refurb*(num(String(snap.professionalFeesPct||0))/100),contingency:refurb*(num(String(snap.contingencyPct||0))/100),otherCosts:num(String(snap.otherCosts||0)),agentAndMarketing:0,totalSqft:0,buildCostPsf:0};
}

const TYPE_COLOR:Record<string,string>={BTR:"#c9a84c",BTS:"#4a8ae8",Hotel:"#d4891a",Flip:"#2da870"};
const TYPE_BG:Record<string,string>={BTR:"rgba(201,168,76,.12)",BTS:"rgba(74,138,232,.12)",Hotel:"rgba(212,137,26,.12)",Flip:"rgba(45,168,112,.12)"};

function SharePage(){
  const params=useParams();
  const token=params?.token as string;
  const[appraisal,setAppraisal]=useState<any>(null);
  const[loading,setLoading]=useState(true);
  const[notFound,setNotFound]=useState(false);
  const[theme,setTheme]=useState<"dark"|"light">("dark");

  useEffect(()=>{
    if(!token)return;
    const load=async()=>{
      const{data}=await supabase.from("appraisals").select("*").eq("share_token",token).single();
      if(!data){setNotFound(true);setLoading(false);return;}
      setAppraisal(data);setLoading(false);
    };
    load();
  },[token]);

  if(loading)return(
    <div style={{minHeight:"100vh",background:"#06070a",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:32,height:32,border:"2px solid rgba(201,168,76,.2)",borderTopColor:"#c9a84c",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(notFound)return(
    <div style={{minHeight:"100vh",background:"#06070a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:"0 24px",textAlign:"center"}}>
      <style>{CSS}</style>
      <div style={{fontFamily:"var(--font-display)",fontSize:48,color:"#3d4249",fontWeight:300}}>◈</div>
      <div style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,color:"#eceae4"}}>Appraisal not found</div>
      <div style={{fontSize:14,color:"#3d4249"}}>This link may have expired or been revoked.</div>
    </div>
  );

  const snap=appraisal?.snapshot||{};
  const assetType=snap.assetType||"BTR";
  const sym={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[snap.currency]||"£";
  const gdv=appraisal.gdv||0;
  const totalCost=appraisal.total_cost||0;
  const profit=appraisal.profit||0;
  const poc=appraisal.profit_on_cost||0;
  const irr=appraisal.irr_unlevered||0;
  const irrLevered=appraisal.irr_levered||0;
  const pocColor=poc>0.2?"var(--green)":poc>0.1?"var(--amber)":"var(--red)";
  const annualRate=(num(String(snap.benchmarkRate||3.97))+num(String(snap.marginOverBenchmark||2.5)))/100;
  const costs=calcCosts(snap);
  const loanAmount=(costs.landCost+costs.buildCost)*(num(String(snap.ltc||65))/100);
  const arrangementFee=loanAmount*(num(String(snap.arrangementFeePct||1))/100);
  const buildMonths=Math.max(1,Math.round(num(String(snap.programmMonths||24))));
  const interestEst=loanAmount*annualRate*(buildMonths/12)*0.55;
  const totalFinanceCost=arrangementFee+interestEst;

  // Pull institutional metrics from DB if available (saved by calc engine)
  // These come from the appraisal record snapshot or calculated fields
  const snapMoic=snap.moic||0;
  const snapDscr=snap.dscr||0;
  const snapPayback=snap.paybackMonth||null;

  // ── ASSET-SPECIFIC DATA ──────────────────────────────────────────────────

  // Hero metrics — per asset type
  const heroMetrics=assetType==="BTR"?[
    {label:"GDV / Exit Value",value:fmt(gdv,sym),color:"var(--gold)"},
    {label:"Profit",value:fmt(profit,sym),color:profit>0?"var(--green)":"var(--red)"},
    {label:"Profit on Cost",value:fmtPct(poc),color:pocColor},
    {label:"IRR (Unlevered)",value:fmtPct(irr),color:"var(--blue)"},
  ]:assetType==="BTS"?[
    {label:"GDV",value:fmt(gdv,sym),color:"var(--gold)"},
    {label:"Profit",value:fmt(profit,sym),color:profit>0?"var(--green)":"var(--red)"},
    {label:"Profit on Cost",value:fmtPct(poc),color:pocColor},
    {label:"IRR (Unlevered)",value:fmtPct(irr),color:"var(--blue)"},
  ]:assetType==="Hotel"?[
    {label:"Exit Value",value:fmt(gdv,sym),color:"var(--gold)"},
    {label:"Profit",value:fmt(profit,sym),color:profit>0?"var(--green)":"var(--red)"},
    {label:"Return on Cost",value:fmtPct(poc),color:pocColor},
    {label:"IRR (Unlevered)",value:fmtPct(irr),color:"var(--blue)"},
  ]:[
    {label:"Sale Price",value:fmt(gdv,sym),color:"var(--gold)"},
    {label:"Profit",value:fmt(profit,sym),color:profit>0?"var(--green)":"var(--red)"},
    {label:"ROI on Cost",value:fmtPct(poc),color:pocColor},
    {label:"IRR (Annualised)",value:fmtPct(irr),color:"var(--blue)"},
  ];

  // Institutional metrics strip — per asset type
  const instMetrics=assetType==="BTR"?[
    {label:"IRR (Levered)",value:fmtPct(irrLevered)},
    {label:"Equity Multiple",value:fmtX(snapMoic)},
    {label:"DSCR / ICR",value:fmtX(snapDscr)},
    {label:"Yield on Cost",value:snap.exitYield?`${snap.exitYield}%`:"—"},
  ]:assetType==="BTS"?[
    {label:"IRR (Levered)",value:fmtPct(irrLevered)},
    {label:"Equity Multiple",value:fmtX(snapMoic)},
    {label:"Profit on GDV",value:gdv>0?fmtPct((profit)/gdv):"—"},
    {label:"Absorption",value:snap.absorptionMonths?`${snap.absorptionMonths}m`:"—"},
  ]:assetType==="Hotel"?[
    {label:"IRR (Levered)",value:fmtPct(irrLevered)},
    {label:"Equity Multiple",value:fmtX(snapMoic)},
    {label:"DSCR / ICR",value:fmtX(snapDscr)},
    {label:"Yield on Cost",value:snap.exitCapRate?`${snap.exitCapRate}%`:"—"},
  ]:[
    {label:"IRR (Annualised)",value:fmtPct(irr)},
    {label:"Equity Multiple",value:fmtX(snapMoic)},
    {label:"Bridging Rate",value:snap.bridgingRatePct?`${snap.bridgingRatePct}%pm`:"—"},
    {label:"Hold Period",value:snap.bridgingTermMonths?`${snap.bridgingTermMonths}m`:"—"},
  ];

  // Returns rows — per asset type
  const returnsRows=assetType==="BTR"?[
    ["GDV (Exit)",fmt(gdv,sym),"var(--gold)",true],
    ["Total Cost",fmt(totalCost,sym),"var(--text-m)",false],
    ["Profit",fmt(profit,sym),profit>0?"var(--green)":"var(--red)",false],
    ["Profit on Cost",fmtPct(poc),pocColor,false],
    ["Yield on Cost",snap.exitYield?fmtPct(snap.exitYield/100):"—","var(--text-m)",false],
    ["IRR (Unlevered)",fmtPct(irr),"var(--blue)",false],
    ["IRR (Levered)",fmtPct(irrLevered),"var(--blue)",false],
  ]:assetType==="BTS"?[
    ["GDV",fmt(gdv,sym),"var(--gold)",true],
    ["Total Cost",fmt(totalCost,sym),"var(--text-m)",false],
    ["Profit",fmt(profit,sym),profit>0?"var(--green)":"var(--red)",false],
    ["Profit on Cost",fmtPct(poc),pocColor,false],
    ["Profit on GDV",gdv>0?fmtPct(profit/gdv):"—","var(--text-m)",false],
    ["IRR (Unlevered)",fmtPct(irr),"var(--blue)",false],
    ["IRR (Levered)",fmtPct(irrLevered),"var(--blue)",false],
  ]:assetType==="Hotel"?[
    ["Exit Value",fmt(gdv,sym),"var(--gold)",true],
    ["Total Investment",fmt(totalCost,sym),"var(--text-m)",false],
    ["Profit",fmt(profit,sym),profit>0?"var(--green)":"var(--red)",false],
    ["Return on Cost",fmtPct(poc),pocColor,false],
    ["IRR (Unlevered)",fmtPct(irr),"var(--blue)",false],
    ["IRR (Levered)",fmtPct(irrLevered),"var(--blue)",false],
  ]:[
    ["Sale Price",fmt(gdv,sym),"var(--gold)",true],
    ["Total Cost",fmt(totalCost,sym),"var(--text-m)",false],
    ["Net Proceeds",fmt(profit+totalCost,sym),"var(--text-m)",false],
    ["Profit",fmt(profit,sym),profit>0?"var(--green)":"var(--red)",false],
    ["ROI on Cost",fmtPct(poc),pocColor,false],
    ["IRR (Annualised)",fmtPct(irr),"var(--blue)",false],
  ];

  // Programme display
  const programme=assetType==="BTR"?`${snap.programmMonths||"—"}m build · ${snap.stabilisationMonths||"—"}m stabilisation`
    :assetType==="BTS"?`${snap.programmMonths||"—"}m build · ${snap.absorptionMonths||"—"}m absorption`
    :assetType==="Hotel"?`${snap.programmMonths||"—"}m refurb · ${snap.stabilisationMonths||"—"}m stabilisation`
    :`${snap.bridgingTermMonths||snap.programmMonths||"—"}m hold`;

  // Project details — per asset type
  const detailRows=assetType==="BTR"?[
    ["Asset Type","Build to Rent"],
    ["Location",snap.location||"—"],
    ["Currency",snap.currency||"GBP"],
    ["Programme",programme],
    ["Exit Yield",snap.exitYield?`${snap.exitYield}%`:"—"],
    ["Finance Rate",annualRate>0?`${(annualRate*100).toFixed(2)}% all-in`:"—"],
    ["LTC Ratio",snap.ltc?`${snap.ltc}%`:"—"],
  ]:assetType==="BTS"?[
    ["Asset Type","Build to Sell"],
    ["Location",snap.location||"—"],
    ["Currency",snap.currency||"GBP"],
    ["Programme",programme],
    ["Units",snap.units?snap.units.reduce((s:number,u:any)=>s+num(String(u.count)),0).toString():"—"],
    ["Finance Rate",annualRate>0?`${(annualRate*100).toFixed(2)}% all-in`:"—"],
    ["LTC Ratio",snap.ltc?`${snap.ltc}%`:"—"],
  ]:assetType==="Hotel"?[
    ["Asset Type","Hotel Acquisition"],
    ["Location",snap.location||"—"],
    ["Rooms",snap.rooms?.toString()||"—"],
    ["Star Rating",snap.starRating?`${snap.starRating}★`:"—"],
    ["Programme",programme],
    ["Exit Cap Rate",snap.exitCapRate?`${snap.exitCapRate}%`:"—"],
    ["Finance Rate",annualRate>0?`${(annualRate*100).toFixed(2)}% all-in`:"—"],
  ]:[
    ["Asset Type","House Flip"],
    ["Location",snap.location||"—"],
    ["Currency",snap.currency||"GBP"],
    ["Hold Period",programme],
    ["Sale Price",fmt(num(String(snap.salePrice||0)),sym)],
    ["Agent Fee",snap.agentFeePct?`${snap.agentFeePct}%`:"—"],
  ];

  // Cost rows — per asset type
  const costRows=assetType==="BTR"||assetType==="BTS"?[
    {label:"Land / Acquisition",value:costs.landCost,sub:undefined as string|undefined},
    {label:"Build Cost",value:costs.buildCost,sub:costs.buildCostPsf>0?`${sym}${costs.buildCostPsf}psf · ${Math.round(costs.totalSqft).toLocaleString()}sqft`:undefined},
    {label:"Professional Fees",value:costs.profFees,sub:undefined},
    {label:"Contingency",value:costs.contingency,sub:undefined},
    ...(costs.otherCosts>0?[{label:"Other Costs",value:costs.otherCosts,sub:undefined}]:[]),
    ...(costs.agentAndMarketing>0?[{label:"Agent & Marketing",value:costs.agentAndMarketing,sub:undefined}]:[]),
    {label:"Arrangement Fee",value:arrangementFee,amber:true,sub:undefined},
    {label:"Interest (Est.)",value:interestEst,amber:true,sub:undefined},
    {label:"Total Cost",value:totalCost,bold:true,sub:undefined},
  ]:assetType==="Hotel"?[
    {label:"Purchase Price",value:costs.landCost,sub:undefined},
    {label:"CapEx Budget",value:costs.buildCost,sub:undefined},
    {label:"Professional Fees",value:costs.profFees,sub:undefined},
    {label:"Contingency",value:costs.contingency,sub:undefined},
    ...(costs.otherCosts>0?[{label:"Other Costs",value:costs.otherCosts,sub:undefined}]:[]),
    {label:"Arrangement Fee",value:arrangementFee,amber:true,sub:undefined},
    {label:"Interest (Est.)",value:interestEst,amber:true,sub:undefined},
    {label:"Total Investment",value:totalCost,bold:true,sub:undefined},
  ]:[
    {label:"Purchase Price",value:costs.landCost,sub:undefined},
    {label:"Refurb Budget",value:costs.buildCost,sub:undefined},
    {label:"Professional Fees",value:costs.profFees,sub:undefined},
    {label:"Contingency",value:costs.contingency,sub:undefined},
    ...(costs.otherCosts>0?[{label:"Other Costs",value:costs.otherCosts,sub:undefined}]:[]),
    {label:"Finance Cost",value:totalFinanceCost,amber:true,sub:undefined},
    {label:"Total Cost",value:totalCost,bold:true,sub:undefined},
  ];

  const typeCol=TYPE_COLOR[assetType]||"var(--gold)";
  const typeBg=TYPE_BG[assetType]||"rgba(201,168,76,.12)";
  const metricCols=heroMetrics.length;

  return(
    <div className={`page-wrap theme-${theme}`}>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <div style={{borderBottom:"1px solid var(--border)",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 48px",background:"var(--bg1)"}}>
        <span style={{fontFamily:"var(--font-display)",fontSize:20,color:"var(--gold)",letterSpacing:".12em",fontWeight:300}}>VALORA</span>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div className="theme-toggle">
            <button className={theme==="dark"?"active":""} onClick={()=>setTheme("dark")}>Dark</button>
            <button className={theme==="light"?"active":""} onClick={()=>setTheme("light")}>Light</button>
          </div>
          <span style={{fontSize:10,color:"var(--text-d)",background:"var(--bg3)",padding:"4px 10px",borderRadius:6,letterSpacing:".06em",textTransform:"uppercase"}}>Read-only</span>
        </div>
      </div>

      {/* ── GOLD ACCENT LINE ── */}
      <div style={{height:2,background:`linear-gradient(90deg,${typeCol},transparent 70%)`}}/>

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow fade-up">
            <span className="badge-type" style={{background:typeBg,color:typeCol}}>{assetType}</span>
            <span style={{fontSize:12,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{snap.currency||"GBP"}</span>
            {snap.location&&<><span style={{color:"var(--text-d)"}}>·</span><span style={{fontSize:12,color:"var(--text-d)"}}>{snap.location}</span></>}
          </div>
          <h1 className="hero-title fade-up" style={{animationDelay:".08s"}}>{appraisal.name||"Untitled Appraisal"}</h1>
          <p className="hero-subtitle fade-up" style={{animationDelay:".14s"}}>{programme}</p>

          {/* Metric strip */}
          <div className="metric-strip fade-up" style={{animationDelay:".2s"}}>
            <div className="metric-strip-inner" style={{gridTemplateColumns:`repeat(${metricCols},1fr)`}}>
              {heroMetrics.map((m,i)=>(
                <div key={m.label} className="metric-cell" style={{background:i===0?`${typeCol}08`:"var(--card-bg)"}}>
                  <div className="metric-cell-label">{m.label}</div>
                  <div className="metric-cell-value" style={{color:m.color}}>{m.value}</div>
                  {i===2&&<div className="metric-cell-sub">{poc>0.2?`${((poc-0.2)*100).toFixed(1)}% above 20% target`:`${((0.2-poc)*100).toFixed(1)}% below target`}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Institutional strip */}
          <div className="inst-strip fade-up" style={{animationDelay:".28s",gridTemplateColumns:`repeat(${instMetrics.length},1fr)`}}>
            {instMetrics.map(m=>(
              <div key={m.label} className="inst-cell">
                <div className="inst-cell-label">{m.label}</div>
                <div className="inst-cell-value">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="content-wrap">

        {/* PoC Bar */}
        <div className="poc-bar-wrap section-gap fade-up" style={{animationDelay:".32s"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text-d)",marginBottom:2}}>
            <span style={{textTransform:"uppercase",letterSpacing:".1em",fontSize:10}}>Return vs 20% Target</span>
            <span style={{fontFamily:"var(--font-mono)",fontWeight:600,color:pocColor}}>{fmtPct(poc)}</span>
          </div>
          <div className="poc-bar-track">
            <div className="poc-bar-fill" style={{width:`${Math.min((poc/0.3)*100,100)}%`,background:poc>0.2?`linear-gradient(90deg,var(--green),#1a8a58)`:`linear-gradient(90deg,var(--amber),#b5720f)`}}/>
          </div>
          <div style={{fontSize:10,color:"var(--text-d)",textAlign:"right"}}>
            {poc>0.2?`${((poc-0.2)*100).toFixed(1)}% above target`:`${((0.2-poc)*100).toFixed(1)}% below target`}
          </div>
        </div>

        {/* Returns + Details */}
        <div className="two-col section-gap fade-up" style={{animationDelay:".36s"}}>
          <div>
            <div className="section-hdr">Returns Summary</div>
            <div className="data-card">
              {returnsRows.map(([l,v,c,bold]:any)=>(
                <div key={l} className="data-row">
                  <span className={bold?"data-label-bold":"data-label"}>{l}</span>
                  <span className={bold?"data-value-bold":"data-value"} style={{color:c||"var(--text-m)"}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="section-hdr">Project Details</div>
            <div className="data-card">
              {detailRows.map(([l,v]:string[])=>(
                <div key={l} className="data-row">
                  <span className="data-label">{l}</span>
                  <span className="data-value" style={{color:"var(--text-m)"}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="section-gap fade-up" style={{animationDelay:".4s"}}>
          <div className="section-hdr">Cost Breakdown</div>
          <div className="data-card">
            {costRows.map((item:any)=>(
              <div key={item.label} className="data-row" style={{borderBottom:item.bold?"none":"1px solid var(--divider)"}}>
                <div>
                  <span className={item.bold?"data-label-bold":"data-label"} style={{color:item.bold?"var(--gold)":item.amber?"var(--amber)":"var(--text-m)"}}>{item.label}</span>
                  {item.sub&&<span style={{fontSize:10,color:"var(--text-d)",marginLeft:8,fontFamily:"var(--font-mono)"}}>{item.sub}</span>}
                </div>
                <span className={item.bold?"data-value-bold":"data-value"} style={{color:item.bold?"var(--gold)":item.amber?"var(--amber)":"var(--text-m)"}}>{fmt(item.value||0,sym)}</span>
              </div>
            ))}
          </div>
          {/* Build metrics for BTR/BTS */}
          {(assetType==="BTR"||assetType==="BTS")&&costs.buildCostPsf>0&&(
            <div className="three-col" style={{marginTop:12}}>
              {[
                {label:"Build Cost psf",value:`${sym}${costs.buildCostPsf}psf`},
                {label:"Total GIA",value:`${Math.round(costs.totalSqft).toLocaleString()} sqft`},
                {label:"LTC Ratio",value:`${snap.ltc||65}%`},
              ].map(item=>(
                <div key={item.label} style={{background:"var(--card-bg)",border:"1px solid var(--card-border)",borderRadius:8,padding:"12px 14px"}}>
                  <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:5}}>{item.label}</div>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:14,color:"var(--text-m)",fontWeight:500}}>{item.value}</div>
                </div>
              ))}
            </div>
          )}
          {/* Hotel specific metrics */}
          {assetType==="Hotel"&&(
            <div className="three-col" style={{marginTop:12}}>
              {[
                {label:"Rooms",value:snap.rooms?.toString()||"—"},
                {label:"ADR",value:snap.adr?`${sym}${snap.adr}`:"—"},
                {label:"Occupancy",value:snap.occupancy?`${snap.occupancy}%`:"—"},
              ].map(item=>(
                <div key={item.label} style={{background:"var(--card-bg)",border:"1px solid var(--card-border)",borderRadius:8,padding:"12px 14px"}}>
                  <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:5}}>{item.label}</div>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:14,color:"var(--text-m)",fontWeight:500}}>{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unit Mix — BTR/BTS only */}
        {snap.units?.length>0&&(
          <div className="section-gap fade-up" style={{animationDelay:".44s"}}>
            <div className="section-hdr">Unit Mix</div>
            <div className="data-card" style={{padding:"16px 22px"}}>
              <table className="unit-table">
                <thead>
                  <tr>
                    <th className="unit-th">Type</th>
                    <th className="unit-th" style={{textAlign:"right"}}>Units</th>
                    {assetType==="BTS"&&<th className="unit-th" style={{textAlign:"right"}}>Price psf</th>}
                    {assetType==="BTR"&&<th className="unit-th" style={{textAlign:"right"}}>Rent pcm</th>}
                    <th className="unit-th" style={{textAlign:"right"}}>Size</th>
                    <th className="unit-th" style={{textAlign:"right"}}>{assetType==="BTS"?"Revenue":"Gross pa"}</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.units.map((u:any,i:number)=>{
                    const gross=assetType==="BTS"
                      ?num(String(u.count))*num(String(u.size))*num(String(u.salePricePsf))
                      :num(String(u.count))*num(String(u.rentPcm))*12;
                    return(
                      <tr key={i}>
                        <td className="unit-td unit-td-name">{u.type}</td>
                        <td className="unit-td">{u.count}</td>
                        {assetType==="BTS"&&<td className="unit-td">{sym}{u.salePricePsf}psf</td>}
                        {assetType==="BTR"&&<td className="unit-td">{sym}{u.rentPcm}pcm</td>}
                        <td className="unit-td">{u.size} sqft</td>
                        <td className="unit-td" style={{color:"var(--gold)"}}>{fmt(gross,sym)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sec-divider"/>
        <div className="share-footer fade-up" style={{animationDelay:".5s",padding:"0"}}>
          <div>
            <span style={{fontFamily:"var(--font-display)",fontSize:18,color:"var(--gold)",letterSpacing:".12em",fontWeight:300}}>VALORA</span>
            <div style={{fontSize:10,color:"var(--text-d)",marginTop:3,letterSpacing:".08em",textTransform:"uppercase"}}>Institutional Development Appraisal</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:"var(--text-d)",marginBottom:6}}>Strictly Confidential · For Authorised Recipients Only</div>
            <a href="https://valoraplatform.io" target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"var(--gold)",textDecoration:"none",letterSpacing:".04em"}}>valoraplatform.io ↗</a>
          </div>
        </div>
        <div style={{height:32}}/>
      </div>
    </div>
  );
}

export default function SharePageWrapper(){
  return(
    <Suspense fallback={
      <div style={{minHeight:"100vh",background:"#06070a",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:32,height:32,border:"2px solid rgba(201,168,76,.2)",borderTopColor:"#c9a84c",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <SharePage/>
    </Suspense>
  );
}
