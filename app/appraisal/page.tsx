"use client";
export const dynamic = 'force-dynamic'
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  /* ── Valora Dark Mode ── */
  --gold:#52C498;--gold-l:#72D4AE;--gold-bg:rgba(82,196,152,0.08);--gold-border:rgba(82,196,152,0.22);
  --bg:#0D1017;--bg1:#252D3F;--bg2:#141920;--bg3:#1A2030;--bg4:#202840;--bg5:#2A3350;
  --text:#F0EEE8;--text-m:#8B93A5;--text-d:#4D5570;
  --border:rgba(255,255,255,0.07);--border-m:rgba(255,255,255,0.13);
  --green:#52C498;--red:#D45252;--amber:#E0A030;--blue:#4A80C4;
  --font-display:'Inter',system-ui,sans-serif;
  --font-body:'Inter',system-ui,sans-serif;
  --font-mono:'DM Mono',monospace;
}
body.light{
  /* ── Valora Light Mode (default) — Slate & Sage ── */
  --gold:#2A8A64;--gold-l:#1F7050;--gold-bg:rgba(82,196,152,0.09);--gold-border:rgba(82,196,152,0.25);
  --bg:#F8F9FA;--bg1:#252D3F;--bg2:#FFFFFF;--bg3:#F8F9FA;--bg4:#E8EAED;--bg5:#DDE0E6;
  --text:#1E2433;--text-m:#5A6478;--text-d:#9AA3AF;
  --border:#E8EAED;--border-m:#D0D4DC;
  --green:#2A8A64;--red:#C04040;--amber:#B07820;--blue:#2A5FAA;
}
body.light .cell-r{background:rgba(192,64,64,.08);color:var(--red)}
body.light .cell-a{background:rgba(176,120,32,.08);color:var(--amber)}
body.light .cell-g{background:rgba(42,138,100,.09);color:var(--green)}
body.light .modal-overlay{background:rgba(0,0,0,.4)}
body.light .btn-primary{color:#ffffff}
body.light .ai-generating{background:linear-gradient(90deg,var(--bg3) 25%,var(--bg4) 50%,var(--bg3) 75%);background-size:200% 100%}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
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
.section-title{font-family:var(--font-body);font-size:15px;font-weight:600;color:var(--text);margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid var(--border);letter-spacing:-.01em}
.output-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bg4)}
.output-label{font-size:12px;color:var(--text-m)}
.output-value{font-family:var(--font-mono);font-size:13px;font-weight:500}
.btn-primary{background:var(--gold);color:#0D1017;border:none;border-radius:7px;padding:10px 20px;font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:background .2s;display:inline-flex;align-items:center;gap:8px}
.btn-primary:hover{background:var(--gold-l)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:9px 18px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-danger{background:transparent;color:var(--red);border:1px solid rgba(244,100,95,.3);border-radius:7px;padding:5px 12px;font-family:var(--font-body);font-size:11px;cursor:pointer;transition:all .2s}
.btn-danger:hover{background:rgba(244,100,95,.1);border-color:var(--red)}
.unit-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 28px;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid var(--bg4)}
.sens-cell{text-align:center;padding:7px 4px;border-radius:5px;font-family:var(--font-mono);font-size:11px;font-weight:500}
.cell-r{background:rgba(244,100,95,.12);color:var(--red)}
.cell-a{background:rgba(240,164,41,.1);color:var(--amber)}
.cell-g{background:rgba(61,220,132,.09);color:var(--green)}
.cell-base{outline:2px solid var(--gold)}
.waterfall-tier{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:10px}
.cf-row{display:grid;grid-template-columns:60px repeat(7,1fr);gap:4px;padding:5px 0;border-bottom:1px solid var(--bg4);font-size:11px}
.cf-header{font-size:9px;color:var(--text-d);text-transform:uppercase;letter-spacing:.06em}
.save-indicator{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-d)}
select.inp{cursor:pointer}
.rev-stream{border:1px solid var(--border);border-radius:10px;margin-bottom:10px;overflow:hidden}
.rev-stream-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;cursor:pointer;background:var(--bg2);transition:background .2s}
.rev-stream-hdr:hover{background:var(--bg3)}
.rev-stream-body{padding:16px;background:var(--bg1);border-top:1px solid var(--border)}
.share-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:all .2s;flex:1}
.share-btn:hover{border-color:var(--gold-border);background:var(--bg3)}
.share-btn:disabled{opacity:.4;cursor:not-allowed}
.share-btn-icon{font-size:18px}
.share-btn-label{font-size:9px;color:var(--text-m);text-transform:uppercase;letter-spacing:.06em;font-family:var(--font-body);text-align:center}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:200;animation:fadeIn .15s ease}
.modal{background:var(--bg2);border:1px solid var(--border-m);border-radius:16px;padding:32px;width:640px;max-width:calc(100vw - 32px);max-height:90vh;overflow-y:auto}
.modal-sm{width:440px}
.ai-section{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:12px}
.ai-section-label{font-size:10px;color:var(--gold);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;display:block;font-family:var(--font-body)}
.ai-textarea{width:100%;background:var(--bg4);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--font-body);font-size:12px;line-height:1.65;padding:10px 12px;outline:none;resize:vertical;min-height:90px;transition:border-color .2s}
.ai-textarea:focus{border-color:var(--gold)}
.photo-slot{width:80px;height:80px;border:1px dashed var(--border-m);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;position:relative;transition:border-color .2s;flex-shrink:0}
.photo-slot:hover{border-color:var(--gold)}
.photo-slot img{width:100%;height:100%;object-fit:cover}
.ai-generating{background:linear-gradient(90deg,var(--bg3) 25%,var(--bg4) 50%,var(--bg3) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px;height:90px}
.metric-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;font-size:10px;font-family:var(--font-mono);font-weight:600}
.badge-green{background:rgba(61,220,132,.1);color:var(--green)}
.badge-red{background:rgba(244,100,95,.12);color:var(--red)}
.badge-amber{background:rgba(240,164,41,.1);color:var(--amber)}
.panel-toggle{display:none;align-items:center;justify-content:space-between;padding:12px 20px;background:var(--bg2);border-top:1px solid var(--border);border-bottom:1px solid var(--border);cursor:pointer;font-size:12px;color:var(--gold);font-family:var(--font-body);font-weight:600;user-select:none}
.strategy-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}@media(max-width:900px){.strategy-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:600px){.strategy-grid{grid-template-columns:1fr!important}}.sens-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px}
.editor-pad{padding:24px}
@media(max-width:768px){.editor-pad{padding:16px 14px}.output-panel{padding:14px !important}.name-inp{width:100px !important;font-size:11px !important}}
@media(max-width:420px){.name-inp{display:none !important}}
@media(max-width:768px){
  .inp{padding:8px 10px;font-size:12px}
  .inp-group{margin-bottom:10px}
  .inp-row{grid-template-columns:1fr}
  .inp-row-3{grid-template-columns:1fr 1fr}
  .inp-label{font-size:9px;margin-bottom:3px}
  .unit-row{grid-template-columns:1fr 1fr 60px 28px;gap:4px}
  .unit-row .unit-gross{display:none}
  .editor-layout{grid-template-columns:1fr !important;display:flex !important;flex-direction:column !important}
  .output-panel{position:static !important;height:auto !important;border-left:none !important;border-top:1px solid var(--border) !important;order:2}
  .editor-main{order:1}
  .modal{width:calc(100vw - 20px) !important;padding:18px !important;max-height:88vh}
  .share-btn{padding:8px 4px;min-width:0}
  .share-btn-label{font-size:8px}
  .share-btn svg{width:16px;height:16px}
  .sens-cell{padding:5px 2px;font-size:10px}
  .tab{padding:7px 11px;font-size:11px}
  .section-title{font-size:15px;margin-bottom:14px;padding-bottom:8px}
  .waterfall-tier{padding:10px}
  .cf-row{grid-template-columns:40px repeat(4,1fr);font-size:10px}
  .cf-col-hide{display:none}
  .panel-toggle{display:flex !important}
  .rev-stream-hdr{padding:10px 12px}
  .rev-stream-body{padding:12px}
  .output-row{padding:6px 0}
  .output-label{font-size:11px}
  .output-value{font-size:12px}
}
@media(max-width:480px){
  .inp-row-3{grid-template-columns:1fr}
  .share-btn-label{display:none}
}
`;
// ─── CALC ENGINE ──────────────────────────────────────────────────────────────
function calcSDLT(price:number,mode:'auto'|'manual',txType:'residential'|'commercial'|'mixed'|'spv',override:number,surcharge:boolean):number{
  if(mode==='manual')return override;
  if(price<=0||txType==='spv')return 0;
  let sdlt=0;
  if(txType==='residential'){
    const bands:[number,number,number][]=[[ 0,250000,0.00],[250000,925000,0.05],[925000,1500000,0.10],[1500000,Infinity,0.12]];
    for(const[low,high,rate]of bands)if(price>low)sdlt+=(Math.min(price,high)-low)*(surcharge?rate+0.03:rate);
  }else{
    const bands:[number,number,number][]= [[0,150000,0.00],[150000,250000,0.02],[250000,Infinity,0.05]];
    for(const[low,high,rate]of bands)if(price>low)sdlt+=(Math.min(price,high)-low)*rate;
  }
  return Math.round(sdlt);
}
function calcIRR(cashflows:number[]):number{
  const npv=(rate:number)=>cashflows.reduce((s,cf,t)=>s+cf/Math.pow(1+rate,t),0);
  let lo=-0.999,hi=10.0;
  if(npv(lo)*npv(hi)>0){
    let rate=0.01;
    for(let i=0;i<200;i++){
      let n=0,d=0;
      cashflows.forEach((cf,t)=>{const disc=Math.pow(1+rate,t);n+=cf/disc;d-=t*cf/(disc*(1+rate));});
      if(Math.abs(d)<1e-10)break;
      const next=rate-n/d;
      if(Math.abs(next-rate)<1e-8)return isFinite(next)?next:0;
      rate=next;
    }
    return (isFinite(rate)&&rate>-1)?rate:0;
  }
  for(let i=0;i<100;i++){
    const mid=(lo+hi)/2;
    if(Math.abs(hi-lo)<1e-8)return mid;
    if(npv(mid)*npv(lo)<=0)hi=mid;else lo=mid;
  }
  return (lo+hi)/2;
}
function buildDrawdownProfile(months:number,costProfile:string):number[]{
  if(months<=0)return[];
  return Array.from({length:months},(_,m)=>{
    const t=(m+1)/months,tP=m/months;
    if(costProfile==='scurve'){const s=(x:number)=>1/(1+Math.exp(-10*(x-0.5)));return s(t)-s(tP);}
    if(costProfile==='frontloaded')return Math.sqrt(t)-Math.sqrt(tP);
    return t-tP;
  });
}
function calcFinanceCostMonthly(p:{landCost:number;sdlt:number;buildCost:number;buildMonths:number;annualRate:number;ltcPct:number;arrangementFeePct:number;exitFeePct?:number;costProfile:string;}):{totalFinanceCost:number;arrangementFee:number;interestCost:number;exitFee:number;monthlyInterestArr:number[];monthlyDrawArr:number[];peakLoanBalance:number;loanAmount:number}{
  const{landCost,sdlt,buildCost,buildMonths,annualRate,ltcPct,arrangementFeePct,exitFeePct=0,costProfile}=p;
  const mRate=annualRate/12;
  const loanAmount=(landCost+sdlt+buildCost)*ltcPct;
  const landDraw=(landCost+sdlt)*ltcPct;
  const buildLoanTotal=buildCost*ltcPct;
  const profile=buildDrawdownProfile(buildMonths,costProfile);
  const monthlyDrawArr:number[]=[],monthlyInterestArr:number[]=[];
  let bal=0;
  for(let m=0;m<buildMonths;m++){
    const draw=m===0?landDraw+buildLoanTotal*profile[m]:buildLoanTotal*profile[m];
    bal+=draw;const interest=bal*mRate;bal+=interest;
    monthlyDrawArr.push(draw);monthlyInterestArr.push(interest);
  }
  const peakLoanBalance=bal;
  const interestCost=monthlyInterestArr.reduce((a,b)=>a+b,0);
  const arrangementFee=loanAmount*arrangementFeePct;
  const exitFee=peakLoanBalance*exitFeePct;
  return{totalFinanceCost:arrangementFee+interestCost+exitFee,arrangementFee,interestCost,exitFee,monthlyInterestArr,monthlyDrawArr,peakLoanBalance,loanAmount};
}
function calcPaybackMonth(cfs:number[]):number|null{
  let cum=0;for(let m=0;m<cfs.length;m++){cum+=cfs[m];if(cum>=0)return m+1;}return null;
}
function findBreakEvenYield(noi:number,totalCost:number,targetPoC=0.20):number{return noi/(totalCost*(1+targetPoC));}
function findBreakEvenSalePsf(units:{count:number;size:number;salePricePsf:number}[],totalCost:number,targetPoC=0.20):number{
  const gdvBase=units.reduce((s,u)=>s+u.count*u.size*u.salePricePsf,0);
  const mult=(totalCost*(1+targetPoC))/(gdvBase||1);
  const totalArea=units.reduce((s,u)=>s+u.count*u.size,0);
  return units.reduce((s,u)=>s+(u.count*u.size*u.salePricePsf*mult)/(totalArea||1),0);
}
const fmt=(n:number,prefix="£")=>{
  if(!isFinite(n)||isNaN(n))return"—";
  const abs=Math.abs(n);
  if(abs>=1e9)return`${prefix}${(n/1e9).toFixed(2)}bn`;
  if(abs>=1e6)return`${prefix}${(n/1e6).toFixed(2)}m`;
  if(abs>=1e3)return`${prefix}${(n/1e3).toFixed(0)}k`;
  return`${prefix}${n.toFixed(0)}`;
};
const fmtPct=(n:number)=>(!isFinite(n)||isNaN(n)||Math.abs(n)>100?"—":`${(n*100).toFixed(1)}%`);
const fmtX=(n:number)=>(!isFinite(n)||isNaN(n)||Math.abs(n)>1000?"—":`${n.toFixed(2)}×`);
const num=(v:string)=>parseFloat(v.replace(/[£,%\s]/g,""))||0;
const irrCol=(irr:number)=>irr>=0.15?"var(--green)":irr>=0.08?"var(--amber)":"var(--red)";
function calcHotelRev(d:any){
  const rooms=num(String(d.rooms));const occRoomNights=rooms*365*(num(String(d.occupancy))/100);
  const roomsRev=num(String(d.adr))*occRoomNights;const roomsEbitda=roomsRev*(num(String(d.roomsMarginPct??75))/100);
  const fnbRev=d.fnbEnabled?num(String(d.fnbRevenuePerOccRoom??45))*occRoomNights*(num(String(d.fnbUtilisationPct??70))/100):0;const fnbEbitda=fnbRev*(num(String(d.fnbMarginPct??30))/100);
  const spaRev=d.spaEnabled?num(String(d.spaRevenuePerRoomPa??800))*rooms*(num(String(d.spaUtilisationPct??40))/100):0;const spaEbitda=spaRev*(num(String(d.spaMarginPct??35))/100);
  const gymRev=d.gymEnabled?num(String(d.gymMembershipRevPa??50000))+num(String(d.gymGuestRevPerOccRoom??8))*occRoomNights:0;const gymEbitda=gymRev*(num(String(d.gymMarginPct??60))/100);
  const meetingRev=d.meetingEnabled?num(String(d.meetingRooms??4))*num(String(d.meetingAvgDayRate??1200))*365*(num(String(d.meetingUtilisationPct??45))/100):0;const meetingEbitda=meetingRev*(num(String(d.meetingMarginPct??40))/100);
  const totalRev=roomsRev+fnbRev+spaRev+gymRev+meetingRev;const totalEbitda=roomsEbitda+fnbEbitda+spaEbitda+gymEbitda+meetingEbitda;
  return{roomsRev,roomsEbitda,fnbRev,fnbEbitda,spaRev,spaEbitda,gymRev,gymEbitda,meetingRev,meetingEbitda,totalRev,totalEbitda};
}
function calcHotelAdvanced(data:any):Record<string,any>{
  const rooms=num(String(data.rooms||203));
  const holdYears=num(String(data.holdYears||5));
  const currency=data.currency||"GBP";
































































  // Year by year revenue
  const years=Array.from({length:holdYears},(_,i)=>i);
  const yearData=years.map(i=>({
    occ:num(String((data.yearOcc||[])[i]??data.occupancy??72))/100,
    adr:num(String((data.yearAdr||[])[i]??data.adr??180)),
  }));
































































  const yearRevenue=yearData.map((y,i)=>{
    const occRoomNights=rooms*365*y.occ;
    const roomsRev=y.adr*occRoomNights;
    const roomsMargin=num(String(data.roomsMarginPct??75))/100;
    const roomsEbitda=roomsRev*roomsMargin;
    // F&B
    const fnbEnabled=data.fnbEnabled!==false;
    const fnbRev=fnbEnabled?(y.occ*rooms*365)*(num(String(data.fnbRevenuePerOccRoom??45)))*(num(String(data.fnbUtilisationPct??70))/100):0;
    const fnbEbitda=fnbEnabled?fnbRev*(num(String(data.fnbMarginPct??30))/100):0;
    const totalRev=roomsRev+fnbRev;
    const totalEbitda=roomsEbitda+fnbEbitda;
    // Undistributed expenses
    const itPct=num(String(data.itPct??0.7))/100;
    const agPct=num(String(data.agPct??5.0))/100;
    const smPct=num(String(data.smPct??8.5))/100;
    const pomPct=num(String(data.pomPct??1.8))/100;
    const utilPct=num(String(data.utilPct??2.2))/100;
    const undistributed=totalRev*(itPct+agPct+smPct+pomPct+utilPct);
    const mgmtFeePct=num(String(data.mgmtFeePct??2.0))/100;
    const mgmtFee=totalRev*mgmtFeePct;
    // Non-operating
    const retPct=num(String(data.realEstateTaxPct??7.5))/100;
    const insPct=num(String(data.insurancePct??0.5))/100;
    const nonOp=totalRev*(retPct+insPct);
    // FF&E — steps up from Year 3
    const ffePct=i>=2?num(String(data.ffePct??3.0))/100:0;
    const ffe=totalRev*ffePct;
    const ebitda=totalEbitda-undistributed-mgmtFee-nonOp;
    const noi=ebitda-ffe;
    return{roomsRev,fnbRev,totalRev,totalEbitda,undistributed,mgmtFee,nonOp,ffe,ebitda,noi,occ:y.occ,adr:y.adr,revpar:y.adr*y.occ};
  });
































































  const stabilisedYear=yearRevenue[yearRevenue.length-1]||yearRevenue[0];
  const stabilisedNOI=stabilisedYear.noi;
  const stabilisedEBITDA=stabilisedYear.ebitda;
  const totalNOI=yearRevenue.reduce((s,y)=>s+y.noi,0);
































































  // Purchase price & entry yields
  const purchasePrice=num(String(data.purchasePrice||18000000));
  const entryYieldNOI=purchasePrice>0?yearRevenue[0].noi/purchasePrice:0;
  const entryYieldEBITDA=purchasePrice>0?yearRevenue[0].ebitda/purchasePrice:0;
  const pricePerKey=rooms>0?purchasePrice/rooms:0;
































































  // Transaction costs
  const capStructure=data.capStructure||"single";
  const sdltPct=data.sdltShareDeal?0.005:num(String(data.sdltOverride??0))||0.05;
  const sdlt=data.sdltMode==="manual"?num(String(data.sdltOverride)):purchasePrice*sdltPct;
  const legalCosts=num(String(data.legalCosts??500000));
  const financingDD=num(String(data.financingDD??250000));
  const wiInsurance=data.wiInsuranceEnabled?num(String(data.wiInsurance??150000)):0;
  const workingCapital=data.workingCapitalEnabled?num(String(data.workingCapital??0)):0;
































































  // CapEx
  const capex=num(String(data.capexBudget||5000000));
  const capexPerKey=rooms>0?capex/rooms:0;
  const disposalCostPct=num(String(data.disposalCostPct??3.0))/100;
































































  // Supporting & operator costs (annual)
  const supportingCosts=num(String(data.supportingCostsPA??100000));
  const operatorFees=num(String(data.operatorFeesPA??0));
































































  // Finance — capital structure
  let loanAmount=0,interestTotal=0,arrangementFee=0,exitFee=0,brokerageFee=0;
  const allInRate=(num(String(data.benchmarkRate??3.97))+num(String(data.marginOverBenchmark??3.0)))/100;
































































  if(capStructure==="single"){
    const ltc=num(String(data.ltc??60))/100;
    loanAmount=(purchasePrice+capex)*ltc;
    arrangementFee=loanAmount*(num(String(data.arrangementFeePct??1.5))/100);
    exitFee=loanAmount*(num(String(data.exitFeePct??1.0))/100);
    brokerageFee=loanAmount*(num(String(data.brokerageFeePct??0.5))/100);
    interestTotal=loanAmount*allInRate*holdYears;
  } else if(capStructure==="dual"){
    const acqLTV=num(String(data.acqLTV??65))/100;
    const capexLTC=num(String(data.capexLTC??50))/100;
    const acqLoan=purchasePrice*acqLTV;
    const capexLoan=capex*capexLTC;
    loanAmount=acqLoan+capexLoan;
    arrangementFee=loanAmount*(num(String(data.arrangementFeePct??1.25))/100);
    exitFee=acqLoan*(num(String(data.exitFeePct??1.0))/100);
    brokerageFee=loanAmount*(num(String(data.brokerageFeePct??0.5))/100);
    const acqRate=(num(String(data.acqRate??6.25))/100);
    const capexRate=(num(String(data.capexRate??6.25))/100);
    interestTotal=acqLoan*acqRate*holdYears+capexLoan*capexRate*holdYears;
  } else if(capStructure==="equity"){
    loanAmount=0;interestTotal=0;arrangementFee=0;exitFee=0;brokerageFee=0;
  }
































































  // IM fees
  const imEnabled=data.imEnabled||false;
  const imAcqFee=imEnabled?num(String(data.imAcqFee??300000)):0;
  const imBasePATotal=imEnabled?num(String(data.imBasePA??250000))*holdYears:0;
































































  // Exit / disposal
  const exitCapRate=num(String(data.exitCapRate??5.75))/100;
  const exitValue=exitCapRate>0?stabilisedNOI/exitCapRate:0;
  const exitValuePerKey=rooms>0?exitValue/rooms:0;
  const disposalCosts=exitValue*disposalCostPct;
  const netExitProceeds=exitValue-disposalCosts;
































































  // Total investment — day 1 capital outlay only (opex flows through NOI, not capitalised)
  const totalCost=purchasePrice+sdlt+legalCosts+financingDD+wiInsurance+capex+arrangementFee+exitFee+brokerageFee+interestTotal+imAcqFee+imBasePATotal+workingCapital;
  const equity=totalCost-loanAmount;
  // Profit: exit proceeds + NOI during hold (net of opex) minus total investment
  const netNOI=totalNOI-(supportingCosts+operatorFees)*holdYears;
  const profit=netExitProceeds+netNOI-totalCost;
  const poc=totalCost>0?profit/totalCost:0;
  const moic=equity>0?(equity+profit)/equity:0;
































































  // IRR — simple approximation
  // IM incentive fees (on profit)
  const imIncentiveProfit=imEnabled?(num(String(data.imIncentiveProfitPct??10))/100)*Math.max(profit,0):0;
  const imIncentiveSales=imEnabled?(num(String(data.imIncentiveSalesPct??1))/100)*exitValue:0;
































































  const dscr=interestTotal>0&&holdYears>0?stabilisedNOI/(interestTotal/holdYears):999;
































































  // IRR cashflow construction
  // One-off fees paid Day 1 (not spread annually)
  const dayOneFinanceFees=arrangementFee+exitFee+brokerageFee;
  // Annual interest only (evenly spread — hotel debt is typically interest-rolled or serviced annually)
  const annualInterest=holdYears>0?interestTotal/holdYears:0;
































































  // Unlevered: total asset cost out day 1, NOI in each year, gross exit proceeds at end
  // (ignores capital structure — pure asset-level return)
  const unleveredDayOne=-(purchasePrice+sdlt+legalCosts+financingDD+wiInsurance+capex+workingCapital+(imAcqFee||0));
  const uCfs=[
    unleveredDayOne,
    ...yearRevenue.slice(0,holdYears-1).map(y=>y.noi-supportingCosts-operatorFees),
    exitValue+(yearRevenue[holdYears-1].noi-supportingCosts-operatorFees),
  ];
































































  // Levered: equity out day 1, NOI minus annual interest each year, net exit after loan repayment at end
  // equity = totalCost - loanAmount (what investor actually puts in)
  const lCfs=[
    -equity,
    ...yearRevenue.slice(0,holdYears-1).map(y=>y.noi-supportingCosts-operatorFees-annualInterest),
    (netExitProceeds-loanAmount)+(yearRevenue[holdYears-1].noi-supportingCosts-operatorFees-annualInterest),
  ];
































































  const irrUnlevered=calcIRR(uCfs);
































































  // Levered IRR — only meaningful when there is positive equity and a loan
  // If all-equity or negative equity (over-leveraged), fall back to unlevered
  let irrLevered=irrUnlevered;
  if(loanAmount>0&&equity>0&&equity<totalCost){
    const rawLevered=calcIRR(lCfs);
    // Sanity check: levered IRR should be finite and not extreme
    // If debt is destructive (levered < unlevered) that's mathematically valid
    // but we cap at a sensible range to avoid display nonsense from bad inputs
    if(isFinite(rawLevered)&&rawLevered>-1&&rawLevered<50){
      irrLevered=rawLevered;
    }
  }
































































  // Payback — month when cumulative levered cashflows turn positive
  let cumulative=lCfs[0];
  let paybackMonth:number|null=null;
  for(let i=1;i<lCfs.length;i++){
    cumulative+=lCfs[i];
    if(cumulative>=0){paybackMonth=i*12;break;}
  }
































































  // Alias fields to match what the UI / Returns Summary / sidebar expect
  const totalInvestment=totalCost;
  const revpar=stabilisedYear.revpar;
  const revenuePa=stabilisedYear.totalRev;
  const ebitda=stabilisedEBITDA;
  const interestCost=interestTotal;
  const yoc=totalCost>0?stabilisedNOI/totalCost:0;
  const stabilisedValue=exitCapRate>0?stabilisedNOI/exitCapRate:0;
































































  return{
    yearRevenue,stabilisedNOI,stabilisedEBITDA,totalNOI,
    purchasePrice,pricePerKey,capexPerKey,exitValue,exitValuePerKey,disposalCosts,netExitProceeds,
    entryYieldNOI,entryYieldEBITDA,
    sdlt,legalCosts,financingDD,wiInsurance,
    loanAmount,interestTotal,arrangementFee,exitFee,brokerageFee,
    imAcqFee,imBasePATotal,imIncentiveProfit,imIncentiveSales,
    totalCost,equity,profit,poc,moic,dscr,
    irr:irrUnlevered,irrLevered,
    // UI-compatible aliases
    totalInvestment,revpar,revenuePa,ebitda,interestCost,capex,yoc,stabilisedValue,
    paybackMonth,
    ebitdaPerKey:rooms>0?stabilisedEBITDA/rooms:0,
    noiPerKey:rooms>0?stabilisedNOI/rooms:0,
    noiConversion:stabilisedYear.totalRev>0?stabilisedNOI/stabilisedYear.totalRev:0,
    revparStabilised:stabilisedYear.revpar,
    revenueStabilised:stabilisedYear.totalRev,
  };
}
































































// ─── VAT LABEL HELPER ─────────────────────────────────────────────────────────
function vatLabel(currency:string):string{
  const map:Record<string,string>={GBP:"VAT (UK)",USD:"Sales Tax (US)",EUR:"VAT (EU)",AED:"VAT (UAE)",SGD:"GST (SG)",AUD:"GST (AU)",JPY:"Consumption Tax (JP)",CHF:"VAT (CH)",CAD:"GST/HST (CA)",HKD:"Tax (HK)"};
  return map[currency]||"VAT / Tax";
}
function calcAll(assetType:string,data:any):Record<string,any>{
  if(assetType==="BTR"){
    const units=data.units||[];
    const totalUnits=units.reduce((s:number,u:any)=>s+(num(String(u.count))||0),0);
    const totalSqft=units.reduce((s:number,u:any)=>s+num(String(u.count))*num(String(u.size)),0);
    const grossRentPa=units.reduce((s:number,u:any)=>s+num(String(u.count))*num(String(u.rentPcm))*12,0);
    const voidPct=num(String(data.voidPct))/100;
    const opexPa=totalSqft*num(String(data.opexPsf));
    const noi=grossRentPa*(1-voidPct)-opexPa;
    const exitYield=num(String(data.exitYield))/100;
    const gdv=exitYield>0?noi/exitYield:0;
    const landCost=num(String(data.landCost));
    const sdlt=calcSDLT(landCost,data.sdltMode??"auto",data.sdltTransactionType??"residential",data.sdltOverride??0,data.sdltSurcharge??true);
    const buildCost=totalSqft*num(String(data.buildCostPsf));
    const profFees=buildCost*(num(String(data.professionalFeesPct))/100);
    const contingency=buildCost*(num(String(data.contingencyPct))/100);
    const otherCosts=num(String(data.otherCosts));
    const vatPct=num(String(data.vatPct||0))/100;
    const vat=(buildCost+profFees)*vatPct;
    const cil=num(String(data.cilPsf||0))*totalSqft;
    const s106=num(String(data.s106||0));
    const devCost=buildCost+profFees+contingency+otherCosts+vat+cil+s106;
    const annualRate=(num(String(data.benchmarkRate))+num(String(data.marginOverBenchmark)))/100;
    const ltcPct=num(String(data.ltc))/100;
    const buildMonths=Math.max(1,Math.round(num(String(data.programmMonths))));
    const stabMonths=Math.max(1,Math.round(num(String(data.stabilisationMonths))));
    const totalMonths=buildMonths+stabMonths;
    const fin=calcFinanceCostMonthly({landCost,sdlt,buildCost:devCost,buildMonths,annualRate,ltcPct,arrangementFeePct:num(String(data.arrangementFeePct))/100,costProfile:data.costProfile??"scurve"});
    const totalCost=landCost+sdlt+devCost+fin.totalFinanceCost;
    const profit=gdv-totalCost;
    const poc=totalCost>0?profit/totalCost:0;
    const yoc=totalCost>0?noi/totalCost:0;
    const rlv=gdv/1.20-devCost-fin.totalFinanceCost-sdlt;
    const annualDebtService=fin.peakLoanBalance*annualRate;
    const dscr=annualDebtService>0?noi/annualDebtService:Infinity;
    const equity=Math.max(0,totalCost-fin.loanAmount);
    const moic=equity>0?(equity+profit)/equity:0;
    const buildProfile=buildDrawdownProfile(buildMonths,data.costProfile??"scurve");
    const equityRatio=totalCost>0?equity/totalCost:1;
    const uCfs:number[]=Array(totalMonths).fill(0);
    const lCfs:number[]=Array(totalMonths).fill(0);
    uCfs[0]-=landCost+sdlt+fin.arrangementFee;
    lCfs[0]-=(landCost+sdlt)*equityRatio+fin.arrangementFee;
    for(let m=0;m<buildMonths;m++){const devDraw=devCost*buildProfile[m];uCfs[m]-=devDraw;lCfs[m]-=devDraw*equityRatio+(fin.monthlyInterestArr[m]??0);}
    const startOcc=0.50;const endOcc=1-voidPct;
    for(let m=0;m<stabMonths;m++){const occ=startOcc+(endOcc-startOcc)*((m+1)/stabMonths);const mNOI=(grossRentPa*occ-opexPa)/12;const idx=buildMonths+m;uCfs[idx]+=mNOI;lCfs[idx]+=mNOI-(fin.peakLoanBalance*annualRate)/12;}
    uCfs[totalMonths-1]+=gdv;lCfs[totalMonths-1]+=gdv-fin.peakLoanBalance;
    const irr=Math.pow(1+calcIRR(uCfs),12)-1;
    const rawIrrLBTR=equity>0?calcIRR(lCfs):0;
    const irrLevered=equity>0&&isFinite(rawIrrLBTR)&&rawIrrLBTR>-1&&rawIrrLBTR<100?Math.pow(1+rawIrrLBTR,12)-1:0;
    const paybackMonth=calcPaybackMonth(uCfs);
    const breakEvenYield=findBreakEvenYield(noi,totalCost);
    return{gdv,noi,grossRentPa,totalSqft,totalUnits,landCost,sdlt,buildCost,devCost,vat,cil,s106,totalFinanceCost:fin.totalFinanceCost,arrangementFee:fin.arrangementFee,interestCost:fin.interestCost,loanAmount:fin.loanAmount,peakLoanBalance:fin.peakLoanBalance,monthlyInterestArr:fin.monthlyInterestArr,monthlyDrawArr:fin.monthlyDrawArr,totalCost,profit,poc,yoc,irr,irrLevered,rlv,dscr,moic,equity,paybackMonth,breakEvenYield,financeRate:annualRate,buildProfile,buildMonths,stabMonths,totalMonths,uCfs,lCfs};
  }
  if(assetType==="BTS"){
    const units=data.units||[];
    const gdv=units.reduce((s:number,u:any)=>s+num(String(u.count))*num(String(u.size))*num(String(u.salePricePsf)),0);
    const totalSqft=units.reduce((s:number,u:any)=>s+num(String(u.count))*num(String(u.size)),0);
    const totalUnits=units.reduce((s:number,u:any)=>s+num(String(u.count)),0);
    const agentFees=gdv*(num(String(data.agentFeePct))/100);
    const marketing=gdv*(num(String(data.marketingPct))/100);
    const landCost=num(String(data.landCost));
    const sdlt=calcSDLT(landCost,data.sdltMode??"auto",data.sdltTransactionType??"residential",data.sdltOverride??0,data.sdltSurcharge??true);
    const buildCost=totalSqft*num(String(data.buildCostPsf));
    const profFees=buildCost*(num(String(data.professionalFeesPct))/100);
    const contingency=buildCost*(num(String(data.contingencyPct))/100);
    const otherCosts=num(String(data.otherCosts));
    const vatPct=num(String(data.vatPct||0))/100;
    const vat=(buildCost+profFees)*vatPct;
    const cil=num(String(data.cilPsf||0))*totalSqft;
    const s106=num(String(data.s106||0));
    const buildCosts=buildCost+profFees+contingency+otherCosts+vat+cil+s106;
    const sellCosts=agentFees+marketing;
    const devCost=buildCosts+sellCosts;
    const annualRate=(num(String(data.benchmarkRate))+num(String(data.marginOverBenchmark)))/100;
    const ltcPct=num(String(data.ltc))/100;
    const buildMonths=Math.max(1,Math.round(num(String(data.programmMonths))));
    const absMonths=Math.max(1,Math.round(num(String(data.absorptionMonths)))); // guard: min 1 prevents division by zero below
    const totalMonths=buildMonths+absMonths;
    const fin=calcFinanceCostMonthly({landCost,sdlt,buildCost:buildCosts,buildMonths,annualRate,ltcPct,arrangementFeePct:num(String(data.arrangementFeePct))/100,costProfile:data.costProfile??"scurve"});
    const totalCost=landCost+sdlt+devCost+fin.totalFinanceCost;
    const profit=gdv-totalCost;
    const poc=totalCost>0?profit/totalCost:0;
    const margin=gdv>0?profit/gdv:0;
    const equity=Math.max(0,totalCost-fin.loanAmount);
    const moic=equity>0?(equity+profit)/equity:0;
    const buildProfile=buildDrawdownProfile(buildMonths,data.costProfile??"scurve");
    // IRR equity: sell costs (agent + marketing) are paid from sale proceeds, not upfront
    // So equity deployed for IRR = totalCost - loanAmount - sellCosts
    const irrEquity=Math.max(0,totalCost-fin.loanAmount-sellCosts);
    const equityRatio=totalCost>0?equity/totalCost:1;
    const netSalesPm=(gdv-sellCosts)/absMonths;
    const loanRepayPm=fin.peakLoanBalance/absMonths;
    const uCfs:number[]=Array(totalMonths).fill(0);
    const lCfs:number[]=Array(totalMonths).fill(0);
    uCfs[0]-=landCost+sdlt+fin.arrangementFee;
    lCfs[0]-=(landCost+sdlt)*(irrEquity/(irrEquity+fin.loanAmount+sellCosts||1))+fin.arrangementFee;
    for(let m=0;m<buildMonths;m++){const devDraw=buildCosts*buildProfile[m];uCfs[m]-=devDraw;lCfs[m]-=devDraw*(irrEquity/(irrEquity+fin.loanAmount+sellCosts||1))+(fin.monthlyInterestArr[m]??0);}
    for(let m=0;m<absMonths;m++){const idx=buildMonths+m;const remainingLoan=Math.max(0,fin.peakLoanBalance-loanRepayPm*m);uCfs[idx]+=netSalesPm;lCfs[idx]+=netSalesPm-loanRepayPm-(remainingLoan*annualRate)/12;}
    const rawIrr=calcIRR(uCfs);
    const irr=isFinite(rawIrr)&&rawIrr>-1?Math.pow(1+rawIrr,12)-1:0;
    const rawIrrL=equity>0?calcIRR(lCfs):0;
    const irrLevered=equity>0&&isFinite(rawIrrL)&&rawIrrL>-1&&rawIrrL<100?Math.pow(1+rawIrrL,12)-1:0;
    const paybackMonth=calcPaybackMonth(uCfs);
    const breakEvenPsf=findBreakEvenSalePsf(units.map((u:any)=>({count:num(String(u.count)),size:num(String(u.size)),salePricePsf:num(String(u.salePricePsf))})),totalCost);
    return{gdv,totalSqft,totalUnits,landCost,sdlt,buildCost,devCost,vat,cil,s106,totalFinanceCost:fin.totalFinanceCost,arrangementFee:fin.arrangementFee,interestCost:fin.interestCost,loanAmount:fin.loanAmount,peakLoanBalance:fin.peakLoanBalance,monthlyInterestArr:fin.monthlyInterestArr,monthlyDrawArr:fin.monthlyDrawArr,totalCost,profit,poc,margin,irr,irrLevered,equity,moic,paybackMonth,breakEvenPsf,financeRate:annualRate,buildProfile,buildMonths,absMonths,totalMonths,uCfs,lCfs};
  }
  if(assetType==="Hotel"){
    const hr=calcHotelRev(data);
    const revpar=num(String(data.adr))*(num(String(data.occupancy))/100);
    const revenuePa=hr.totalRev;const ebitda=hr.totalEbitda;
    const stabilisedCapRate=num(String(data.stabilisedCapRate))/100;
    const exitCapRate=num(String(data.exitCapRate))/100;
    const revparGrowth=num(String(data.revparGrowthPct))/100;
    const stabilisedValue=stabilisedCapRate>0?ebitda/stabilisedCapRate:0;
    const exitValue=exitCapRate>0?(ebitda*(1+revparGrowth))/exitCapRate:0;
    const purchasePrice=num(String(data.purchasePrice));
    const sdlt=calcSDLT(purchasePrice,data.sdltMode??"auto",data.sdltTransactionType??"commercial",data.sdltOverride??0,data.sdltSurcharge??false);
    const capex=num(String(data.capexBudget));
    const profFees=capex*(num(String(data.professionalFeesPct))/100);
    const contingency=capex*(num(String(data.contingencyPct))/100);
    const otherCosts=num(String(data.otherCosts));
    const vatPct=num(String(data.vatPct||0))/100;
    const vat=(capex+profFees)*vatPct;
    const s106=num(String(data.s106||0));
    const hardCost=purchasePrice+sdlt+capex+profFees+contingency+otherCosts+vat+s106;
    const annualRate=(num(String(data.benchmarkRate))+num(String(data.marginOverBenchmark)))/100;
    const ltcPct=num(String(data.ltc))/100;
    const buildMonths=Math.max(1,Math.round(num(String(data.programmMonths))));
    const stabMonths=Math.max(1,Math.round(num(String(data.stabilisationMonths))));
    const totalMonths=buildMonths+stabMonths;
    const fin=calcFinanceCostMonthly({landCost:purchasePrice+sdlt,sdlt:0,buildCost:capex+profFees+contingency+otherCosts+vat+s106,buildMonths,annualRate,ltcPct,arrangementFeePct:num(String(data.arrangementFeePct))/100,costProfile:data.costProfile??"straight"});
    const totalInvestment=hardCost+fin.totalFinanceCost;
    const profit=exitValue-totalInvestment;
    const poc=totalInvestment>0?profit/totalInvestment:0;
    const yoc=totalInvestment>0?ebitda/totalInvestment:0;
    const equity=Math.max(0,totalInvestment-fin.loanAmount);
    const moic=equity>0?(equity+profit)/equity:0;
    const annualDebtService=fin.peakLoanBalance*annualRate;
    // DSCR: use NOI (EBITDA less FF&E reserve at 3% of revenue) — industry standard for hotel ICR
    const ffeReserve=hr.totalRev*(num(String(data.ffePct||3))/100);
    const hotelNOI=Math.max(0,ebitda-ffeReserve);
    const dscr=annualDebtService>0?hotelNOI/annualDebtService:Infinity;
    const buildProfile=buildDrawdownProfile(buildMonths,data.costProfile??"straight");
    const equityRatio=totalInvestment>0?equity/totalInvestment:1;
    const capexTotal=capex+profFees+contingency+otherCosts+vat+s106;
    const uCfs:number[]=Array(totalMonths).fill(0);
    const lCfs:number[]=Array(totalMonths).fill(0);
    uCfs[0]-=purchasePrice+sdlt+fin.arrangementFee;
    lCfs[0]-=(purchasePrice+sdlt)*equityRatio+fin.arrangementFee;
    for(let m=0;m<buildMonths;m++){const draw=capexTotal*buildProfile[m];uCfs[m]-=draw;lCfs[m]-=draw*equityRatio+(fin.monthlyInterestArr[m]??0);}
    for(let m=0;m<stabMonths;m++){const rampFrac=(m+1)/stabMonths;const mEbitda=(ebitda*rampFrac)/12;const idx=buildMonths+m;uCfs[idx]+=mEbitda;lCfs[idx]+=mEbitda-(fin.peakLoanBalance*annualRate)/12;}
    uCfs[totalMonths-1]+=exitValue;lCfs[totalMonths-1]+=exitValue-fin.peakLoanBalance;
    const irr=Math.pow(1+calcIRR(uCfs),12)-1;
    const irrLevered=equity>0?Math.pow(1+calcIRR(lCfs),12)-1:0;
    const paybackMonth=calcPaybackMonth(uCfs);
    return{revpar,revenuePa,ebitda,stabilisedValue,exitValue,purchasePrice,sdlt,capex,hardCost,vat,s106,totalFinanceCost:fin.totalFinanceCost,arrangementFee:fin.arrangementFee,interestCost:fin.interestCost,loanAmount:fin.loanAmount,peakLoanBalance:fin.peakLoanBalance,monthlyInterestArr:fin.monthlyInterestArr,monthlyDrawArr:fin.monthlyDrawArr,totalInvestment,profit,poc,yoc,irr,irrLevered,equity,moic,dscr,paybackMonth,financeRate:annualRate,buildProfile,buildMonths,stabMonths,totalMonths,uCfs,lCfs};
  }
  if(assetType==="Flip"){
    const purchase=num(String(data.purchasePrice));
    const sdlt=calcSDLT(purchase,data.sdltMode??"auto",data.sdltTransactionType??"residential",data.sdltOverride??0,data.sdltSurcharge??false);
    const flipMode=data.flipMode||"sell";
    const useAreaModel=!!data.areaModelOn;
    const unitSys=data.unitSystem||"sqft"; // "sqft"|"sqm"
    const SQM_TO_SQFT=10.7639;
















    // ── Area model ──────────────────────────────────────────────────────────
    let refurb=0,totalArea=0,existingAreaSqft=0,newAreaSqft=0;
    let refurbExisting=0,refurbNew=0;
    if(useAreaModel){
      // Convert inputs to sqft internally
      const exA=num(String(data.existingArea||0));
      const nwA=num(String(data.newArea||0));
      existingAreaSqft=unitSys==="sqm"?exA*SQM_TO_SQFT:exA;
      newAreaSqft=unitSys==="sqm"?nwA*SQM_TO_SQFT:nwA;
      totalArea=existingAreaSqft+newAreaSqft;
      const exCost=num(String(data.existingCostPsf||0));
      const nwCost=num(String(data.newCostPsf||0));
      // If user entered costs in sqm, convert to psf
      const exCostPsf=unitSys==="sqm"?exCost/SQM_TO_SQFT:exCost;
      const nwCostPsf=unitSys==="sqm"?nwCost/SQM_TO_SQFT:nwCost;
      refurbExisting=existingAreaSqft*exCostPsf;
      refurbNew=newAreaSqft*nwCostPsf;
      refurb=refurbExisting+refurbNew;
    } else {
      // Legacy flat-budget / psf mode
      const propertySqft=num(String(data.propertySqft||0));
      const refurbPsf=num(String(data.refurbPsf||0));
      refurb=propertySqft>0&&refurbPsf>0?propertySqft*refurbPsf:num(String(data.refurbBudget||0));
      totalArea=propertySqft;
      existingAreaSqft=propertySqft;
    }
    const propertySqft=useAreaModel?totalArea:num(String(data.propertySqft||0));
















    // ── Professional & Fit-Out fees ─────────────────────────────────────────
    const architectPct=num(String(data.architectPct||0));
    const structEngPct=num(String(data.structEngPct||0));
    const interiorPct=num(String(data.interiorPct||0));
    const ffeCost=num(String(data.ffeCost||0));
    const otherProfFees=num(String(data.otherProfFees||0));
    const hasDetailedProfFees=architectPct>0||structEngPct>0||interiorPct>0||ffeCost>0||otherProfFees>0;
    let profFees=0;
    if(hasDetailedProfFees){
      profFees=(refurb*(architectPct+structEngPct+interiorPct)/100)+ffeCost+otherProfFees;
    } else {
      profFees=refurb*(num(String(data.professionalFeesPct||2))/100);
    }
    const contingency=refurb*(num(String(data.contingencyPct||10))/100);
    const other=num(String(data.otherCosts||0));
    const vatPct=num(String(data.vatPct||0))/100;
    const vat=(refurb+profFees)*vatPct;
    const s106=num(String(data.s106||0));
















    // ── Sale price ───────────────────────────────────────────────────────────
    const salePricePsfRaw=num(String(data.salePricePsf||0));
    const salePricePsfInternal=unitSys==="sqm"&&salePricePsfRaw>0?salePricePsfRaw/SQM_TO_SQFT:salePricePsfRaw;
    const salePriceFlat=num(String(data.salePrice||0));
    const salePrice=propertySqft>0&&salePricePsfInternal>0?propertySqft*salePricePsfInternal:salePriceFlat;
    const salePricePsfDisplay=propertySqft>0&&salePrice>0?salePrice/propertySqft:0;
















    // ── Programme ─────────────────────────────────────────────────────────────
    const bridgingRatePm=num(String(data.bridgingRatePct||0.85))/100;
    const bridgingMonths=Math.max(1,num(String(data.bridgingTermMonths||6))); // construction
    const sellMonths=flipMode==="sell"?Math.max(0,num(String(data.sellMonths||3))):0; // sell absorption
    const flipCapStructure=data.flipCapStructure||"bridge";
    const ltv=flipCapStructure==="equity"?0:num(String(data.flipLTV||75))/100;
    const arrangementFeePct=flipCapStructure==="equity"?0:num(String(data.arrangementFeePct||2.0))/100;
    // Land loan drawn on day 1; build cost drawn straight-line over bridging term
    const landLoan=purchase*ltv;
    const buildLoan=refurb*ltv; // LTV applied to refurb cost portion too
    const arrangementFee=(landLoan+buildLoan)*arrangementFeePct;
    // Rolled interest: month-by-month on actual drawn balance
    let rolledBalance=landLoan; // day-1 draw
    let totalBridgingInterest=0;
    const buildDrawPerMonth=buildLoan/bridgingMonths;
    const monthlyInterestArr:number[]=[];
    for(let m=0;m<bridgingMonths;m++){
      const monthInt=rolledBalance*bridgingRatePm;
      totalBridgingInterest+=monthInt;
      rolledBalance+=monthInt+buildDrawPerMonth; // roll interest + draw next slice
      monthlyInterestArr.push(monthInt);
    }
    const peakLoanBalance=rolledBalance; // balance after all draws + rolled interest
    const loanAmount=landLoan+buildLoan; // total committed facility
    const bridgingInterest=totalBridgingInterest;
















    // ── Refinance (hold mode) ─────────────────────────────────────────────────
    const refiRate=num(String(data.refiRatePct||6.0))/100;
    const refiMonths=Math.max(1,num(String(data.refiTermMonths||24)));
    const refiLTV=num(String(data.refiLTV||75))/100;
    const refiLoan=salePrice*refiLTV;
    const refiInterestPm=refiLoan*(refiRate/12);
    const refiArrangement=refiLoan*(num(String(data.refiArrangementPct||1.0))/100);
    // Cash-out refi: if refi loan > peak bridge balance, surplus cash is returned to investor at refi date
    // If refi loan < peak bridge balance, investor must inject additional equity to repay bridge shortfall
    const cashOutRefi=refiLoan-peakLoanBalance; // positive = cash back, negative = equity top-up required
    const holdOccupancy=data.holdOccupancy||"vacant";
    const rentPcm=holdOccupancy==="tenanted"?num(String(data.rentPcm||0)):0;
    const voidPct=holdOccupancy==="tenanted"?num(String(data.voidPct||5))/100:0;
    const netRentPm=rentPcm*(1-voidPct);
    const monthlyOpex=num(String(data.holdOpexPm||200));
    const netCashflowPm=netRentPm-refiInterestPm-monthlyOpex;
    const totalHoldMonths=flipMode==="hold"?bridgingMonths+refiMonths:bridgingMonths+sellMonths;
    // DSCR: based on refi loan NOI/debt-service only — unaffected by bridge or equity position
    const annualNOI=(netRentPm-monthlyOpex)*12;
    const annualDebtService=refiInterestPm*12;
    const dscr=annualDebtService>0&&annualNOI>0?annualNOI/annualDebtService:0;
















    // ── Total costs & profit ──────────────────────────────────────────────────
    const totalFinanceCost=flipMode==="hold"
      ?bridgingInterest+arrangementFee+refiArrangement+(refiInterestPm*refiMonths)
      :bridgingInterest+arrangementFee;
    const totalCost=purchase+sdlt+refurb+profFees+contingency+other+vat+s106+totalFinanceCost;
    const agentFees=salePrice*(num(String(data.agentFeePct||1.5))/100);
    const netProceeds=salePrice-agentFees;
    // equityIn: gross equity deployed, net of initial bridging loan drawn.
    // If cash-out refi returns capital, netEquityDeployed is lower — reflects true capital at risk.
    const equityIn=purchase+sdlt+refurb+profFees+contingency+other+vat+s106+bridgingInterest+arrangementFee+(flipMode==="hold"?refiArrangement:0)-loanAmount;
    // Net equity actually at risk after refi cash-out (can be reduced if refi > bridge balance)
    const netEquityDeployed=flipMode==="hold"?Math.max(0,equityIn-Math.max(0,cashOutRefi)):equityIn;
    const equity=Math.max(0,equityIn);
    const profit=flipMode==="hold"
      // profit = exit proceeds (net of refi loan) + hold cashflows - net equity deployed
      // cash-out at refi is NOT profit (it's return of capital), so we use equityIn not netEquityDeployed here
      ?(netProceeds-refiLoan)+(netCashflowPm*refiMonths)-equityIn
      :netProceeds-totalCost;
    const roi=totalCost>0?profit/totalCost:0;
    const roiEquity=equity>0?profit/equity:0;
    // MOIC on net equity deployed: counts cash-out refi as return of capital in the multiple
    const totalReturn=profit+Math.max(0,cashOutRefi); // cash returned + profit at exit
    const moic=netEquityDeployed>0?(netEquityDeployed+totalReturn)/netEquityDeployed:equity>0?(equity+profit)/equity:0;
















    // ── IRR cashflows ─────────────────────────────────────────────────────────
    let cfs:number[];
    if(flipMode==="hold"){
      // Bridge phase: equity out day 0, zeros during refurb
      // Refi month: cashOut inflow (positive = money back, negative = top-up injection)
      // Hold phase: monthly net cashflow
      // Exit month: net proceeds after repaying refi loan
      const bridgeZeros=Array(Math.max(0,Math.round(bridgingMonths)-1)).fill(0);
      // At refi month: cashOutRefi is cash returned (or injected if negative)
      const refiMonthCf=cashOutRefi+netCashflowPm; // cash-out + first month of hold income
      cfs=[-equity,...bridgeZeros,refiMonthCf,...Array(Math.max(0,Math.round(refiMonths)-1)).fill(netCashflowPm),netCashflowPm+(netProceeds-refiLoan)];
    } else {
      // Sell mode: construction phase (zeros), then sell period (zeros), proceeds at end
      const constructZeros=Array(Math.max(0,Math.round(bridgingMonths)-1)).fill(0);
      const sellZeros=Array(Math.max(0,Math.round(sellMonths))).fill(0);
      cfs=[-equity,...constructZeros,...sellZeros,netProceeds-peakLoanBalance];
    }
    const irr=Math.pow(1+calcIRR(cfs),12)-1;
    const paybackMonth=calcPaybackMonth(cfs);
    const grossYield=salePrice>0?(rentPcm*12)/salePrice:0;
    const netYield=salePrice>0?(netRentPm*12)/salePrice:0;
    // Per-sqft metrics (display in selected unit system)
    const dispArea=unitSys==="sqm"?propertySqft/SQM_TO_SQFT:propertySqft;
    const dispRefurbPsf=dispArea>0?refurb/dispArea:0;
    const dispSalePricePsf=dispArea>0?salePrice/dispArea:0;
    const dispTotalCostPsf=dispArea>0?totalCost/dispArea:0;
    return{
      purchase,sdlt,refurb,refurbExisting,refurbNew,
      profFees,contingency,other,vat,s106,totalFinanceCost,
      loanAmount,peakLoanBalance,bridgingInterest,arrangementFee,
      refiLoan,refiInterestPm,refiArrangement,netCashflowPm,netRentPm,cashOutRefi,netEquityDeployed,
      totalCost,salePrice,agentFees,netProceeds,profit,roi,roiEquity,moic,irr,equity,
      paybackMonth,financeRate:bridgingRatePm*12,grossYield,netYield,flipMode,
      bridgingMonths,sellMonths,refiMonths,totalHoldMonths,dscr,
      propertySqft,existingAreaSqft,newAreaSqft,totalArea,
      refurbPsfDisplay:dispRefurbPsf,salePricePsfDisplay:dispSalePricePsf,totalCostPsfDisplay:dispTotalCostPsf,
      unitSystem:unitSys,useAreaModel,
      monthlyInterestArr,cfs,
    };
  }
  if(assetType==="MixedUse"){
    const zones:any[]=(data.zones||[]);
    const landCost=num(String(data.landCost||0));
    const sdlt=calcSDLT(landCost,data.sdltMode??"auto","mixed",data.sdltOverride??0,data.sdltSurcharge??false);
    const profFeesPct=num(String(data.professionalFeesPct||8))/100;
    const contingencyPct=num(String(data.contingencyPct||5))/100;
    const vatSchemePct=num(String(data.vatPct||0))/100; // scheme-level VAT fallback
    const cilPsf=num(String(data.cilPsf||0));
    const s106=num(String(data.s106||0));
    const annualRate=(num(String(data.benchmarkRate||3.97))+num(String(data.marginOverBenchmark||2.5)))/100;
    const ltcPct=num(String(data.ltc||60))/100;
    const arrFeePct=num(String(data.arrangementFeePct||1.0))/100;
    const buildMonths=Math.max(1,Math.round(num(String(data.programmMonths||24))));
















    // ── Per-zone calculations ────────────────────────────────────────────────
    const zoneResults=zones.map((z:any)=>{
      const units=num(String(z.units||1));
      const sizeSqft=num(String(z.sizeSqft||0));
      const totalSqft=units*sizeSqft;
      const buildCostPsf=num(String(z.buildCostPsf||0));
      const buildCost=totalSqft*buildCostPsf;
      const zVatPct=num(String(z.vatPct??vatSchemePct*100))/100;
      const vat=(buildCost+buildCost*profFeesPct)*zVatPct;
      const profFees=buildCost*profFeesPct;
      const contingency=buildCost*contingencyPct;
      const cil=totalSqft*cilPsf*(z.status==="refurb"||z.status==="active"?0:1); // CIL on new build floorspace; refurb/active zones exempt
      const totalBuildCost=buildCost+profFees+contingency+vat+cil;
















      // Exit / GDV
      const exitStrategy=z.exitStrategy||"sell";
      const salePricePsf=num(String(z.salePricePsf||0));
      const rentPcm=num(String(z.rentPcm||0));
      const exitYield=num(String(z.exitYield||0))/100;
      let gdvZone=0;
      if(exitStrategy==="sell"&&z.type==="residential"){
        gdvZone=totalSqft*salePricePsf; // totalSqft=units*sizeSqft; salePricePsf drives GDV
      } else if(exitStrategy==="sell"&&z.type!=="residential"&&exitYield>0){
        const noi=rentPcm*units*12;
        gdvZone=noi/exitYield;
      } else if(exitStrategy==="hold"){
        const noi=rentPcm*units*12;
        gdvZone=exitYield>0?noi/exitYield:0;
      }
















      // Active income (trading during build)
      const status=z.status||"new_build";
      const activeIncomePm=status==="active"?rentPcm*units:0;
      const startMonth=num(String(z.startMonth||0));
















      return{
        id:z.id,label:z.label||"Zone",type:z.type,exitStrategy,status,
        units,sizeSqft,totalSqft,buildCost,profFees,contingency,vat,cil,totalBuildCost,
        gdvZone,rentPcm:rentPcm*units,exitYield,activeIncomePm,startMonth,
      };
    });
















    // ── Scheme totals ────────────────────────────────────────────────────────
    const totalBuildCost=zoneResults.reduce((s:number,z:any)=>s+z.totalBuildCost,0);
    const totalGDV=zoneResults.reduce((s:number,z:any)=>s+z.gdvZone,0);
    const totalSqft=zoneResults.reduce((s:number,z:any)=>s+z.totalSqft,0);
    const schemeS106=s106;
    const totalDevCost=totalBuildCost+schemeS106;
















    // ── Finance ──────────────────────────────────────────────────────────────
    const fin=calcFinanceCostMonthly({
      landCost,sdlt,buildCost:totalDevCost,buildMonths,
      annualRate,ltcPct,arrangementFeePct:arrFeePct,costProfile:"scurve"
    });
















    // ── Monthly cashflow — active income offsets carry costs ─────────────────
    // GDV lands at buildMonths (practical completion = sales/refi trigger)
    const totalMonths=buildMonths+1;
    const buildProfile=buildDrawdownProfile(buildMonths,"scurve");
    // ── Returns (pre-computed for cashflow equity ratio) ────────────────────
    const totalCost=landCost+sdlt+totalDevCost+fin.totalFinanceCost;
    const profit=totalGDV-totalCost;
    const poc=totalCost>0?profit/totalCost:0;
    const margin=totalGDV>0?profit/totalGDV:0;
    const equity=Math.max(0,totalCost-fin.loanAmount);
    const moic=equity>0?(equity+profit)/equity:0;
    const muEquityRatio=totalCost>0?equity/totalCost:1;
    const uCfs:number[]=Array(totalMonths).fill(0);
    const lCfs:number[]=Array(totalMonths).fill(0);
    uCfs[0]-=landCost+sdlt+fin.arrangementFee;
    lCfs[0]-=(landCost+sdlt)*muEquityRatio+fin.arrangementFee;
    for(let m=0;m<buildMonths;m++){
      const draw=totalDevCost*buildProfile[m];
      const activeIncome=zoneResults.reduce((s:number,z:any)=>s+(m>=z.startMonth?z.activeIncomePm:0),0);
      uCfs[m]-=draw;
      uCfs[m]+=activeIncome; // active trading income offsets carry costs
      lCfs[m]-=draw*muEquityRatio+(fin.monthlyInterestArr[m]??0);
      lCfs[m]+=activeIncome;
    }
    uCfs[totalMonths-1]+=totalGDV; // exit proceeds at completion
    lCfs[totalMonths-1]+=totalGDV-fin.peakLoanBalance;
    const rawIrr=calcIRR(uCfs);
    const irr=isFinite(rawIrr)&&rawIrr>-1?Math.pow(1+rawIrr,12)-1:0;
    const rawIrrL=equity>0?calcIRR(lCfs):0;
    const irrLevered=equity>0&&isFinite(rawIrrL)&&rawIrrL>-1&&rawIrrL<100?Math.pow(1+rawIrrL,12)-1:0;
    const paybackMonth=calcPaybackMonth(uCfs);
















    return{
      landCost,sdlt,totalBuildCost,totalDevCost,totalGDV,totalSqft,
      s106:schemeS106,totalFinanceCost:fin.totalFinanceCost,
      arrangementFee:fin.arrangementFee,interestCost:fin.interestCost,
      loanAmount:fin.loanAmount,peakLoanBalance:fin.peakLoanBalance,
      totalCost,profit,poc,margin,irr,irrLevered,equity,moic,paybackMonth,
      buildMonths,totalMonths,uCfs,lCfs,zoneResults,
      financeRate:annualRate,
    };
  }
  if(assetType==="Commercial"){
    const SQM_TO_SQFT=10.7639;
    const units:any[]=data.units||[];
    const landCost=num(String(data.landCost||0));
    const sdlt=calcSDLT(landCost,data.sdltMode??"auto",data.sdltTransactionType??"commercial",data.sdltOverride??0,data.sdltSurcharge??false);
    const buildCostPsm=num(String(data.buildCostPsm||0));
    // Total lettable area from units (sqm)
    const totalAreaSqm=units.reduce((s:number,u:any)=>s+num(String(u.areaSqm||0)),0);
    const totalAreaSqft=totalAreaSqm*SQM_TO_SQFT;
    const buildCost=totalAreaSqm*buildCostPsm;
    const profFees=buildCost*(num(String(data.professionalFeesPct||8))/100);
    const contingency=buildCost*(num(String(data.contingencyPct||5))/100);
    const otherCosts=num(String(data.otherCosts||0));
    const vatPct=num(String(data.vatPct||20))/100;
    const vat=(buildCost+profFees)*vatPct;
    const cil=num(String(data.cilPsf||0))*totalAreaSqft;
    const s106=num(String(data.s106||0));
    const devCost=buildCost+profFees+contingency+otherCosts+vat+cil+s106;
















    // ── Per-unit revenue ────────────────────────────────────────────────────
    const unitResults=units.map((u:any)=>{
      const areaSqm=num(String(u.areaSqm||0));
      const erv=num(String(u.erv||0)); // £/sqm/yr ERV
      const passingRent=num(String(u.passingRent||0)); // £/sqm/yr passing
      const wault=num(String(u.wault||0)); // years
      const voidPct=num(String(u.voidPct||0))/100;
      const rentFreeMonths=num(String(u.rentFreeMonths||0));
      const grossErv=areaSqm*erv;
      const grossPassing=areaSqm*passingRent;
      const netPassing=grossPassing*(1-voidPct);
      const rentFreeCost=grossErv*(rentFreeMonths/12);
      const reversion=grossErv-grossPassing; // reversionary uplift
      return{id:u.id,label:u.label||"Unit",use:u.use||"office",
        areaSqm,erv,passingRent,wault,voidPct,rentFreeMonths,
        grossErv,grossPassing,netPassing,rentFreeCost,reversion};
    });
















    // ── Scheme income ───────────────────────────────────────────────────────
    const totalErv=unitResults.reduce((s:number,u:any)=>s+u.grossErv,0);
    const totalPassing=unitResults.reduce((s:number,u:any)=>s+u.grossPassing,0);
    const totalNetPassing=unitResults.reduce((s:number,u:any)=>s+u.netPassing,0);
    const totalRentFreeCost=unitResults.reduce((s:number,u:any)=>s+u.rentFreeCost,0);
    const avgWault=units.length>0?unitResults.reduce((s:number,u:any)=>s+u.wault*(u.areaSqm/Math.max(totalAreaSqm,1)),0):0;
    // Reversionary yield (passing as % of ERV)
    const reversionaryPct=totalErv>0?totalPassing/totalErv:1;
















    // ── Rent review uplift ───────────────────────────────────────────────────
    const rentReviewType=data.rentReviewType||"fixed";
    const rentReviewPct=num(String(data.rentReviewPct||3))/100;
    const rentReviewYears=Math.max(1,num(String(data.rentReviewYears||5)));
    // Projected ERV at next review
    const reviewMultiplier=rentReviewType==="fixed"?Math.pow(1+rentReviewPct,rentReviewYears):1+rentReviewPct; // CPI/RPI: single period uplift
    const projectedErv=totalErv*reviewMultiplier;
















    // ── Exit valuation — three methods ──────────────────────────────────────
    const exitMethod=data.exitMethod||"investment";
    const niy=num(String(data.niy||5.5))/100;
    const equivalentYield=num(String(data.equivalentYield||5.75))/100;
    const vpValuePsm=num(String(data.vpValuePsm||0));
    let gdv=0;
    if(exitMethod==="investment"){
      gdv=niy>0?totalNetPassing/niy:0;
    } else if(exitMethod==="equivalent"){
      // Proper UK hardcore/term+reversion equivalent yield valuation
      // Term: PV of passing rent annuity for WAULT years at equivalent yield
      // Reversion: PV of ERV in perpetuity deferred by WAULT years at equivalent yield
      if(equivalentYield>0){
        const pvAnnuity=(income:number,rate:number,years:number)=>years>0?income*(1-Math.pow(1+rate,-years))/rate:0;
        const pvPerpetuity=(income:number,rate:number,years:number)=>(income/rate)/Math.pow(1+rate,years);
        gdv=pvAnnuity(totalNetPassing,equivalentYield,avgWault)+pvPerpetuity(totalErv,equivalentYield,avgWault);
      }
    } else {
      // Vacant possession / B&M
      gdv=totalAreaSqm*vpValuePsm;
    }
















    // ── Finance ──────────────────────────────────────────────────────────────
    const annualRate=(num(String(data.benchmarkRate||3.97))+num(String(data.marginOverBenchmark||2.5)))/100;
    const ltcPct=num(String(data.ltc||60))/100;
    const buildMonths=Math.max(1,Math.round(num(String(data.programmMonths||18))));
    const stabMonths=Math.max(1,Math.round(num(String(data.stabilisationMonths||12))));
    const totalMonths=buildMonths+stabMonths;
    const fin=calcFinanceCostMonthly({landCost,sdlt,buildCost:devCost,buildMonths,annualRate,ltcPct,
      arrangementFeePct:num(String(data.arrangementFeePct||1.0))/100,costProfile:"scurve"});
















    // ── Returns ──────────────────────────────────────────────────────────────
    const totalCost=landCost+sdlt+devCost+fin.totalFinanceCost;
    const profit=gdv-totalCost;
    const poc=totalCost>0?profit/totalCost:0;
    const margin=gdv>0?profit/gdv:0;
    const yoc=totalCost>0?totalNetPassing/totalCost:0;
    const rlv=gdv*(1-0.20)-devCost-fin.totalFinanceCost-sdlt; // 20% developer profit target
    const equity=Math.max(0,totalCost-fin.loanAmount);
    const moic=equity>0?(equity+profit)/equity:0;
    const annualDebtService=fin.peakLoanBalance*annualRate;
    const dscr=annualDebtService>0?totalNetPassing/annualDebtService:Infinity;
    // Break-even rent & yield
    const breakEvenRentPsm=totalAreaSqm>0?totalCost*(niy>0?niy:0.055)/totalAreaSqm:0;
    const breakEvenYield=gdv>0?totalNetPassing/totalCost:0;
















    // ── Cashflows (monthly) ───────────────────────────────────────────────────
    const buildProfile=buildDrawdownProfile(buildMonths,"scurve");
    const equityRatio=totalCost>0?equity/totalCost:1;
    const uCfs:number[]=Array(totalMonths).fill(0);
    const lCfs:number[]=Array(totalMonths).fill(0);
    uCfs[0]-=landCost+sdlt+fin.arrangementFee;
    lCfs[0]-=(landCost+sdlt)*equityRatio+fin.arrangementFee;
    for(let m=0;m<buildMonths;m++){
      const draw=devCost*buildProfile[m];
      uCfs[m]-=draw; lCfs[m]-=draw*equityRatio+(fin.monthlyInterestArr[m]??0);
    }
    // Stabilisation: NOI ramps from 0 to stabilised over stabMonths
    for(let m=0;m<stabMonths;m++){
      const ramp=(m+1)/stabMonths;
      const mNOI=(totalNetPassing*ramp)/12;
      const idx=buildMonths+m;
      uCfs[idx]+=mNOI; lCfs[idx]+=mNOI-(fin.peakLoanBalance*annualRate)/12;
    }
    uCfs[totalMonths-1]+=gdv; lCfs[totalMonths-1]+=gdv-fin.peakLoanBalance;
    const rawIrr=calcIRR(uCfs);
    const irr=isFinite(rawIrr)&&rawIrr>-1?Math.pow(1+rawIrr,12)-1:0;
    const rawIrrL=equity>0?calcIRR(lCfs):0;
    const irrLevered=equity>0&&isFinite(rawIrrL)&&rawIrrL>-1&&rawIrrL<100?Math.pow(1+rawIrrL,12)-1:0;
    const paybackMonth=calcPaybackMonth(uCfs);
















    // ── Sensitivity: NIY (rows) × passing rent shift % (cols) ────────────────
    // Base income = totalNetPassing so base case matches returns summary exactly
    const niySteps=[-0.5,-0.25,0,0.25,0.5].map(d=>niy*100+d);
    const rentSteps=[-10,-5,0,5,10];
    const sensMatrix=niySteps.map(n=>rentSteps.map(e=>{
      const mNoi=totalNetPassing*(1+e/100);
      const mGdv=(n/100)>0?mNoi/(n/100):0;
      return totalCost>0?(mGdv-totalCost)/totalCost:0;
    }));
















    return{
      totalAreaSqm,totalAreaSqft,buildCost,devCost,vat,cil,s106,
      totalErv,totalPassing,totalNetPassing,totalRentFreeCost,avgWault,
      reversionaryPct,projectedErv,rentReviewType,reviewMultiplier,
      gdv,exitMethod,niy,equivalentYield,vpValuePsm,
      landCost,sdlt,profFees,contingency,
      totalFinanceCost:fin.totalFinanceCost,arrangementFee:fin.arrangementFee,
      interestCost:fin.interestCost,loanAmount:fin.loanAmount,peakLoanBalance:fin.peakLoanBalance,
      monthlyInterestArr:fin.monthlyInterestArr,
      totalCost,profit,poc,margin,yoc,rlv,equity,moic,dscr,
      breakEvenRentPsm,breakEvenYield,irr,irrLevered,paybackMonth,
      financeRate:annualRate,buildMonths,stabMonths,totalMonths,
      buildProfile,uCfs,lCfs,sensMatrix,unitResults,
    };
  }
  return{};
}
// ─── DEFAULTS ─────────────────────────────────────────────────────────────────
const DEFAULTS={
  BTR:{assetType:"BTR",vatPct:0,cilPsf:0,s106:0,name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:36,stabilisationMonths:12,units:[{type:"1 Bed OMR",count:80,rentPcm:2200,size:550},{type:"2 Bed OMR",count:60,rentPcm:2900,size:750},{type:"3 Bed OMR",count:30,rentPcm:3600,size:1000},{type:"1 Bed DMR",count:40,rentPcm:1650,size:550},{type:"2 Bed DMR",count:22,rentPcm:2175,size:750}],exitYield:4.15,niy:4.0,voidPct:1.5,opexPsf:8,landCost:15000000,buildCostPsf:285,siteAreaSqft:195000,professionalFeesPct:8,contingencyPct:5,otherCosts:500000,ltc:65,marginOverBenchmark:2.5,arrangementFeePct:1.0,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:12,tier2DevShare:30,tier3Hurdle:18,tier3DevShare:40,costProfile:"scurve",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:true},
  BTS:{assetType:"BTS",vatPct:0,cilPsf:0,s106:0,name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:30,stabilisationMonths:6,units:[{type:"1 Bed",count:40,salePricePsf:900,size:550},{type:"2 Bed",count:60,salePricePsf:850,size:800},{type:"3 Bed",count:20,salePricePsf:800,size:1100},{type:"Penthouse",count:5,salePricePsf:1400,size:1800}],agentFeePct:1.5,marketingPct:1.0,absorptionMonths:18,landCost:8000000,buildCostPsf:260,siteAreaSqft:110000,professionalFeesPct:8,contingencyPct:5,otherCosts:300000,ltc:60,marginOverBenchmark:2.5,arrangementFeePct:1.0,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:15,tier2DevShare:30,tier3Hurdle:20,tier3DevShare:40,costProfile:"scurve",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:true},
  Hotel:{assetType:"Hotel",vatPct:20,cilPsf:0,s106:0,name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:24,stabilisationMonths:18,rooms:120,adr:180,occupancy:72,starRating:4,revparGrowthPct:2.5,roomsMarginPct:75,fnbEnabled:true,fnbRevenuePerOccRoom:45,fnbUtilisationPct:70,fnbMarginPct:30,spaEnabled:false,spaRevenuePerRoomPa:800,spaUtilisationPct:40,spaMarginPct:35,gymEnabled:false,gymMembershipRevPa:50000,gymGuestRevPerOccRoom:8,gymMarginPct:60,meetingEnabled:false,meetingRooms:4,meetingAvgDayRate:1200,meetingUtilisationPct:45,meetingMarginPct:40,exitCapRate:6.5,stabilisedCapRate:6.0,purchasePrice:18000000,capexBudget:5000000,professionalFeesPct:5,contingencyPct:8,otherCosts:200000,ltc:60,marginOverBenchmark:3.0,arrangementFeePct:1.5,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:14,tier2DevShare:30,tier3Hurdle:20,tier3DevShare:40,costProfile:"straight",sdltMode:"auto" as const,sdltTransactionType:"commercial" as const,sdltOverride:0,sdltSurcharge:false,hotelFinanceType:"full"},
  Commercial:{assetType:"Commercial",name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,
    programmMonths:18,stabilisationMonths:12,
    landCost:5000000,buildCostPsm:1200,
    professionalFeesPct:8,contingencyPct:5,otherCosts:100000,
    vatPct:20,cilPsf:0,s106:0,
    ltc:60,marginOverBenchmark:2.5,arrangementFeePct:1.0,
    sdltMode:"auto" as const,sdltTransactionType:"commercial" as const,sdltOverride:0,sdltSurcharge:false,
    exitMethod:"investment" as const,
    niy:5.5,equivalentYield:5.75,vpValuePsm:8000,
    rentReviewType:"fixed" as const,rentReviewPct:3,rentReviewYears:5,
    units:[
      {id:"u1",label:"Ground Floor Retail",use:"retail",areaSqm:500,erv:350,passingRent:300,wault:5,voidPct:5,rentFreeMonths:6},
      {id:"u2",label:"Office Floor 1",use:"office",areaSqm:800,erv:450,passingRent:420,wault:3,voidPct:10,rentFreeMonths:3},
    ],
  },
  MixedUse:{assetType:"MixedUse",name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,benchmark_rate:"SONIA",
    programmMonths:24,landCost:3000000,
    vatPct:0,cilPsf:0,s106:0,
    ltc:60,marginOverBenchmark:2.5,arrangementFeePct:1.0,
    professionalFeesPct:8,contingencyPct:5,
    sdltMode:"auto" as const,sdltTransactionType:"mixed" as const,sdltOverride:0,sdltSurcharge:false,
    zones:[
      {id:"z1",label:"Residential",type:"residential",exitStrategy:"sell",status:"new_build",
       units:10,sizeSqft:700,buildCostPsf:260,salePricePsf:800,rentPcm:0,exitYield:0,vatPct:0,startMonth:0},
      {id:"z2",label:"Ground Floor Retail",type:"commercial",exitStrategy:"sell",status:"new_build",
       units:1,sizeSqft:1200,buildCostPsf:180,salePricePsf:0,rentPcm:3000,exitYield:6.5,vatPct:20,startMonth:0},
    ],
  },
  Flip:{assetType:"Flip",vatPct:0,s106:0,name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:9,stabilisationMonths:0,sellMonths:3,purchasePrice:450000,propertySqft:900,refurbBudget:85000,refurbPsf:95,salePrice:620000,salePricePsf:688,agentFeePct:1.5,bridgingRatePct:0.85,bridgingTermMonths:6,flipLTV:75,arrangementFeePct:2.0,professionalFeesPct:2,contingencyPct:10,otherCosts:5000,flipMode:"sell",holdOccupancy:"vacant",refiRatePct:6.0,refiTermMonths:24,refiLTV:75,refiArrangementPct:1.0,rentPcm:2200,voidPct:5,holdOpexPm:200,costProfile:"straight",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:false,areaModelOn:false,unitSystem:"sqft",existingArea:900,newArea:0,existingCostPsf:95,newCostPsf:180,architectPct:0,structEngPct:0,interiorPct:0,ffeCost:0,otherProfFees:0},
};
type AssetType="BTR"|"BTS"|"Hotel"|"Flip"|"MixedUse"|"Commercial";
type BrochureContent={executiveSummary:string;dealStrengths:string;riskAssessment:string;marketComparables:string;highlights?:string[];risks?:string[];marketContext?:string};
































































































// ─── SHARED CASHFLOW CHART ────────────────────────────────────────────────────
function CashflowChart({uCfs,totalMonths,buildMonths,exitLabel,currencySymbol,phaseLabels}:{uCfs:number[];totalMonths:number;buildMonths:number;exitLabel:string;currencySymbol:string;phaseLabels?:string[]}){
  if(!uCfs||uCfs.length===0)return null;
  const maxAbs=Math.max(...uCfs.map(v=>Math.abs(v)),1);
  let cumulative=0;
  const rows=uCfs.map((cf,m)=>{cumulative+=cf;return{cf,cum:cumulative,m};});
  return(
    <div>
      {/* Bar chart */}
      <div style={{overflowX:"auto",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"flex-end",gap:2,height:120,minWidth:Math.max(400,uCfs.length*14)}}>
          {uCfs.map((cf,m)=>{
            const pct=Math.abs(cf)/maxAbs;
            const h=Math.max(2,pct*110);
            const isExit=m===totalMonths-1;
            return(
              <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                {cf>0&&<div style={{width:"100%",height:h,background:isExit?"var(--gold)":"var(--green)",borderRadius:"2px 2px 0 0",opacity:.85}}/>}
                <div style={{width:"100%",height:2,background:"var(--border)"}}/>
                {cf<0&&<div style={{width:"100%",height:Math.abs(cf)/maxAbs*110,background:"var(--red)",borderRadius:"0 0 2px 2px",opacity:.7}}/>}
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"var(--text-d)",marginTop:4,fontFamily:"var(--font-mono)"}}>
          <span>Month 1</span>
          {phaseLabels?phaseLabels.map((l,i)=><span key={i}>{l}</span>):<span>Build ({buildMonths}m)</span>}
          <span>Exit M{totalMonths}</span>
        </div>
      </div>
      {/* Legend */}
      <div style={{display:"flex",gap:16,marginBottom:16,flexWrap:"wrap"}}>
        {[["var(--red)","Cash out"],["var(--green)","Cash in"],["var(--gold)",exitLabel||"Exit proceeds"]].map(([c,l])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--text-d)"}}><div style={{width:10,height:10,borderRadius:2,background:c as string}}/>{l}</div>
        ))}
        <div style={{marginLeft:"auto",fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>
          Payback: {rows.find(r=>r.cum>=0)?`Month ${rows.find(r=>r.cum>=0)!.m+1}`:"Beyond horizon"}
        </div>
      </div>
      {/* Table */}
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"var(--font-mono)"}}>
          <thead>
            <tr style={{borderBottom:"1px solid var(--border)"}}>
              {["Month","Cashflow","Cumulative"].map(h=>(
                <th key={h} style={{padding:"6px 8px",textAlign:"left",fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.filter(({cf,m})=>Math.abs(cf)>0||(m===totalMonths-1)).map(({cf,cum,m})=>{
              const isExit=m===totalMonths-1;
              return(
                <tr key={m} style={{borderBottom:"1px solid var(--bg4)",background:isExit?"rgba(201,168,76,.04)":"transparent"}}>
                  <td style={{padding:"5px 8px",color:"var(--text-d)"}}>{m+1}{isExit?" (Exit)":""}</td>
                  <td style={{padding:"5px 8px",color:cf>=0?"var(--green)":"var(--red)"}}>{cf>=0?"+":""}{currencySymbol}{Math.abs(Math.round(cf)).toLocaleString()}</td>
                  <td style={{padding:"5px 8px",color:cum>=0?"var(--green)":"var(--text-m)"}}>{cum>=0?"+":""}{currencySymbol}{Math.abs(Math.round(cum)).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// ─── VAT / CIL / S106 BLOCK ───────────────────────────────────────────────────
function VATCILBlock({data,set,r,currencySymbol,showCIL=true}:{data:any;set:(f:string,v:any)=>void;r:any;currencySymbol:string;showCIL?:boolean}){
  const currency=data.currency||"GBP";
  const vLabel=vatLabel(currency);
  const buildBase=r.totalBuildCost||(r.buildCost||r.capex||r.refurb||0)+(r.profFees||0);
  const vatAmt=buildBase*(num(String(data.vatPct||0))/100);
  const cilAmt=showCIL?(r.totalSqft||r.propertySqft||0)*num(String(data.cilPsf||0)):0;
  const s106Amt=num(String(data.s106||0));
  const hasAny=vatAmt>0||cilAmt>0||s106Amt>0;
  return(
    <div style={{marginTop:20}}>
      <div className="section-title">Planning & Tax Costs</div>
      <div className="inp-row-3">
        <div className="inp-group">
          <label className="inp-label">{vLabel} on Build + Fees (%)</label>
          <input className="inp" type="number" step="1" value={data.vatPct??""} onChange={e=>set("vatPct",e.target.value)} placeholder="e.g. 20"/>
          <div style={{fontSize:9,color:"var(--text-d)",marginTop:3}}>{currency==="GBP"?"UK: 0% resi new build · 20% commercial":"Applied to build cost + professional fees"}</div>
        </div>
        {showCIL&&<div className="inp-group">
          <label className="inp-label">CIL (£/sqft new floorspace)</label>
          <input className="inp" type="number" step="1" value={data.cilPsf??""} onChange={e=>set("cilPsf",e.target.value)} placeholder="0"/>
          <div style={{fontSize:9,color:"var(--text-d)",marginTop:3}}>Community Infrastructure Levy — check local authority rate</div>
        </div>}
        <div className="inp-group">
          <label className="inp-label">Section 106 ({currencySymbol})</label>
          <input className="inp" type="number" value={data.s106??""} onChange={e=>set("s106",e.target.value)} placeholder="0"/>
          <div style={{fontSize:9,color:"var(--text-d)",marginTop:3}}>Negotiated planning obligation — lump sum</div>
        </div>
      </div>
      {hasAny&&(
        <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 14px",marginTop:8,display:"flex",gap:20,flexWrap:"wrap"}}>
          {vatAmt>0&&<div style={{fontSize:11,fontFamily:"var(--font-mono)"}}><span style={{color:"var(--text-d)"}}>{vLabel}: </span><span style={{color:"var(--amber)"}}>{currencySymbol}{Math.round(vatAmt).toLocaleString()}</span></div>}
          {cilAmt>0&&<div style={{fontSize:11,fontFamily:"var(--font-mono)"}}><span style={{color:"var(--text-d)"}}>CIL: </span><span style={{color:"var(--amber)"}}>{currencySymbol}{Math.round(cilAmt).toLocaleString()}</span></div>}
          {s106Amt>0&&<div style={{fontSize:11,fontFamily:"var(--font-mono)"}}><span style={{color:"var(--text-d)"}}>S106: </span><span style={{color:"var(--amber)"}}>{currencySymbol}{Math.round(s106Amt).toLocaleString()}</span></div>}
          <div style={{marginLeft:"auto",fontSize:11,fontFamily:"var(--font-mono)"}}><span style={{color:"var(--text-d)"}}>Total: </span><span style={{color:"var(--gold)",fontWeight:600}}>{currencySymbol}{Math.round(vatAmt+cilAmt+s106Amt).toLocaleString()}</span></div>
        </div>
      )}
    </div>
  );
}
// ─── PROPERTY TAX BLOCK ───────────────────────────────────────────────────────
function SDLTBlock({data,set,r,currencySymbol}:{data:any;set:(f:string,v:any)=>void;r:any;currencySymbol:string}){
  const[overrideStr,setOverrideStr]=useState(()=>data.sdltOverride===0?"":String(data.sdltOverride));
  return(
    <div className="inp-group" style={{gridColumn:"1 / -1"}}>
      <label className="inp-label">Property Tax</label>
































































      {/* ── Info banner ── */}
      <div style={{background:"rgba(201,168,76,0.07)",border:"1px solid rgba(201,168,76,0.2)",borderRadius:7,padding:"8px 12px",marginBottom:10,display:"flex",alignItems:"flex-start",gap:8}}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0,marginTop:2}} xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="7" r="6.5" stroke="#52C498" strokeWidth="0.75"/>
          <rect x="6.4" y="6" width="1.2" height="4.5" rx="0.6" fill="#52C498"/>
          <circle cx="7" cy="4.2" r="0.7" fill="#52C498"/>
        </svg>
        <span style={{fontSize:11,color:"var(--text-m)",lineHeight:1.6}}>
          <strong style={{color:"var(--gold)"}}>Auto mode uses UK SDLT rates.</strong> If you are in another country, use <strong style={{color:"var(--text)"}}>Override</strong> and enter your local property transfer tax — e.g. IMT (Portugal), Transfer Tax (USA), DLD Fee (UAE), Stamp Duty (Australia), Grunderwerbsteuer (Germany).
        </span>
      </div>
































































      {/* ── Toggle buttons ── */}
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <button onClick={()=>set("sdltMode","auto")} style={{padding:"4px 14px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"var(--font-body)",fontSize:12,fontWeight:600,background:data.sdltMode!=="manual"?"var(--gold)":"rgba(255,255,255,0.07)",color:data.sdltMode!=="manual"?"#0f1115":"var(--text-m)"}}>Auto</button>
        <button onClick={()=>set("sdltMode","manual")} style={{padding:"4px 14px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"var(--font-body)",fontSize:12,fontWeight:600,background:data.sdltMode==="manual"?"var(--gold)":"rgba(255,255,255,0.07)",color:data.sdltMode==="manual"?"#0f1115":"var(--text-m)"}}>Override</button>
      </div>
































































      {/* ── Auto mode ── */}
      {data.sdltMode!=="manual"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <select className="inp" value={data.sdltTransactionType??"residential"} onChange={e=>set("sdltTransactionType",e.target.value)}>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial / Non-Residential</option>
            <option value="mixed">Mixed-Use</option>
            <option value="spv">SPV Share Deal (Exempt)</option>
          </select>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <input type="checkbox" id="sdltSurcharge" checked={data.sdltSurcharge??true} onChange={e=>set("sdltSurcharge",e.target.checked)}/>
            <label htmlFor="sdltSurcharge" className="inp-label" style={{marginBottom:0,fontSize:12}}>+3% surcharge (additional dwelling / company purchase)</label>
          </div>
          <div className="inp" style={{color:"var(--gold)",cursor:"not-allowed"}}>
            {fmt(r.sdlt||0,currencySymbol)}
            {data.sdltTransactionType==="spv"&&<span style={{marginLeft:8,fontSize:11,color:"var(--green)",fontFamily:"var(--font-mono)"}}>EXEMPT</span>}
          </div>
        </div>
      )}
































































      {/* ── Manual override — currency prefix + clearable zero ── */}
      {data.sdltMode==="manual"&&(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontFamily:"var(--font-mono)",fontSize:13,color:"var(--text-d)",pointerEvents:"none",userSelect:"none"}}>{currencySymbol}</span>
            <input
              className="inp"
              type="number"
              min="0"
              placeholder="0"
              value={overrideStr}
              onChange={e=>{
                setOverrideStr(e.target.value);
                set("sdltOverride",e.target.value===""?0:parseFloat(e.target.value)||0);
              }}
              style={{paddingLeft:26}}
            />
          </div>
          <div style={{fontSize:10,color:"var(--text-d)",fontStyle:"italic",paddingLeft:2}}>
            Enter as a <strong style={{color:"var(--text)"}}>flat amount</strong> (e.g. 45000) or a <strong style={{color:"var(--text)"}}>% of purchase price</strong> converted to a figure — e.g. IMT Portugal = 6.5% × price. Used directly in all cost calculations.
          </div>
        </div>
      )}
    </div>
  );
}
































































// ─── REV STREAM ───────────────────────────────────────────────────────────────
function RevStream({title,icon,enabled,onToggle,summary,open,onOpen,children}:{title:string;icon:string;enabled:boolean;onToggle:()=>void;summary:string;open:boolean;onOpen:()=>void;children:React.ReactNode;}){
  return(<div className="rev-stream" style={{borderColor:enabled?"var(--gold-border)":"var(--border)"}}>
    <div className="rev-stream-hdr" onClick={onOpen}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {icon&&<span style={{fontSize:16}}>{icon}</span>}
        <span style={{fontSize:13,fontWeight:600,color:enabled?"var(--text)":"var(--text-d)"}}>{title}</span>
        {enabled&&<span style={{fontSize:10,color:"var(--green)",fontFamily:"var(--font-mono)",background:"rgba(61,220,132,.1)",padding:"2px 7px",borderRadius:4}}>ON</span>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {enabled&&<span style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--gold)"}}>{summary}</span>}
        <span style={{fontSize:10,color:"var(--text-d)"}}>{open?"▲":"▼"}</span>
      </div>
    </div>
    {open&&(<div className="rev-stream-body">
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{position:"relative",width:36,height:20,background:enabled?"var(--gold)":"var(--bg4)",borderRadius:10,cursor:"pointer",transition:"background .2s",flexShrink:0}} onClick={onToggle}>
          <div style={{position:"absolute",top:2,left:enabled?18:2,width:16,height:16,background:"#fff",borderRadius:"50%",transition:"left .2s"}}/>
        </div>
        <span style={{fontSize:12,color:"var(--text-m)"}}>{enabled?`${title} included in EBITDA`:`${title} excluded — toggle to include`}</span>
      </div>
      {children}
    </div>)}
  </div>);
}
































































// ─── V MARK DRAW HELPER (jsPDF) ───────────────────────────────────────────────
// Draws the V mark at (x,y) with given height in mm. Uses filled polygons.


































































// ─── PDF GENERATORS ───────────────────────────────────────────────────────────
async function generatePDF(data:any,results:any,assetType:string,currencySymbol:string,userEmail:string){
  if(!(window as any).jspdf){
    await new Promise<void>((resolve,reject)=>{
      const s=document.createElement("script");
      s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload=()=>resolve();s.onerror=()=>reject();document.head.appendChild(s);
    });
  }
  const{jsPDF}=(window as any).jspdf;
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210,H=297,M=14;
  // Slate & Sage palette — print-friendly
  const gold=[42,138,100] as [number,number,number];    // sage green accent
  const dark=[248,249,250] as [number,number,number];   // #F8F9FA light bg
  const bg2=[255,255,255] as [number,number,number];    // white cards
  const bg3=[248,249,250] as [number,number,number];    // light alternate rows
  const bg4=[232,234,237] as [number,number,number];    // border tone
  const grey=[90,100,120] as [number,number,number];    // secondary text
  const white=[30,36,51] as [number,number,number];     // #1E2433 primary text
  const green=[42,138,100] as [number,number,number];   // sage positive
  const red=[192,64,64] as [number,number,number];      // muted red
  const amber=[176,120,32] as [number,number,number];   // muted amber
  const blue=[42,95,170] as [number,number,number];     // muted blue
  const r=results as any;
  const colW=88;const colL=M;const colR=M+colW+8;
  const today=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});








  // ── Helper: draw a full-width section header ─────────────────────────────
  const sectionHeader=(doc:any,title:string,y:number)=>{
    doc.setFillColor(...bg2);doc.rect(M,y-5,W-M*2,8,"F");
    doc.setFillColor(...gold);doc.rect(M,y-5,2,8,"F");
    doc.setTextColor(...gold);doc.setFontSize(8);doc.setFont("helvetica","bold");
    doc.text(title.toUpperCase(),M+5,y);
    return y+8;
  };








  // ── Helper: two-column row ───────────────────────────────────────────────
  const drawCol=(title:string,rows:[string,string,[number,number,number]?][],x:number,startY:number,w:number)=>{
    doc.setTextColor(...gold);doc.setFontSize(8);doc.setFont("helvetica","bold");doc.text(title.toUpperCase(),x,startY);
    doc.setFillColor(...gold);doc.rect(x,startY+1.5,w,0.3,"F");let ry=startY+8;
    rows.forEach(([label,value,color],idx)=>{
      if(ry>H-14)return;
      if(idx%2===0){doc.setFillColor(...bg3);doc.rect(x,ry-4,w,7,"F");}
      doc.setTextColor(...grey);doc.setFontSize(7.5);doc.setFont("helvetica","normal");doc.text(String(label),x+2,ry);
      doc.setTextColor(...(color||white) as [number,number,number]);doc.setFont("helvetica","bold");doc.text(String(value),x+w-1,ry,{align:"right"});
      doc.setFont("helvetica","normal");ry+=7;
    });return ry+4;
  };








  // ── Helper: horizontal bar chart (cashflow) ───────────────────────────────
  const drawCashflowBars=(cfs:number[],x:number,y:number,w:number,h:number,sym:string)=>{
    if(!cfs||cfs.length===0)return y;
    const maxAbs=Math.max(...cfs.map(Math.abs),1);
    const barW=Math.min((w-4)/cfs.length,6);
    const midX=x+w/2;
    doc.setFontSize(5);doc.setTextColor(...grey);
    cfs.forEach((cf,i)=>{
      const pct=Math.abs(cf)/maxAbs;
      const bh=Math.max(0.5,pct*(h/2-2));
      const bx=x+2+i*(barW+0.5);
      const isExit=i===cfs.length-1;
      if(cf>0){
        const col=isExit?gold:green;
        doc.setFillColor(...col);doc.rect(bx,y+h/2-bh,barW,bh,"F");
      }else if(cf<0){
        doc.setFillColor(...red);doc.rect(bx,y+h/2,barW,bh,"F");
      }
    });
    doc.setDrawColor(...grey);doc.setLineWidth(0.2);doc.line(x,y+h/2,x+w,y+h/2);
    return y+h+4;
  };








  // ── Helper: sensitivity mini-table ────────────────────────────────────────
  const drawSensTable=(matrix:number[][],rowLabels:string[],colLabels:string[],x:number,y:number,w:number,title:string)=>{
    if(!matrix||matrix.length===0)return y;
    doc.setTextColor(...gold);doc.setFontSize(7);doc.setFont("helvetica","bold");doc.text(title,x,y);y+=4;
    const cols=colLabels.length+1;const cw=w/cols;const rh=6;
    // Header row
    doc.setFillColor(...bg3);doc.rect(x,y,w,rh,"F");
    doc.setFontSize(5.5);doc.setTextColor(...grey);doc.setFont("helvetica","bold");
    colLabels.forEach((l,i)=>doc.text(l,x+cw*(i+1)+cw/2,y+4,{align:"center"}));
    y+=rh;
    matrix.forEach((row,ri)=>{
      if(ri%2===0){doc.setFillColor(...bg4);doc.rect(x,y,w,rh,"F");}
      doc.setTextColor(...grey);doc.setFont("helvetica","normal");doc.setFontSize(5.5);doc.text(rowLabels[ri]||"",x+2,y+4);
      row.forEach((poc,ci)=>{
        const col=poc>0.20?green:poc>0.10?amber:red;
        const isBase=ri===2&&ci===2;
        if(isBase){doc.setFillColor(...gold);doc.rect(x+cw*(ci+1),y,cw,rh,"F");}
        doc.setTextColor(...(isBase?[26,26,26] as [number,number,number]:col));doc.setFont("helvetica",isBase?"bold":"normal");
        doc.text(`${(poc*100).toFixed(1)}%`,x+cw*(ci+1)+cw/2,y+4,{align:"center"});
      });
      y+=rh;
    });
    return y+6;
  };








  // ── Helper: mini page header ──────────────────────────────────────────────
  const pageHeader=(doc:any,subtitle:string)=>{
    doc.setFillColor(...dark);doc.rect(0,0,W,H,"F");
    doc.setFillColor(...gold);doc.rect(0,0,4,H,"F");
    doc.setFillColor(...bg2);doc.rect(4,0,W-4,18,"F");
    doc.setTextColor(...white);doc.setFontSize(11);doc.setFont("helvetica","bold");doc.text("Valora",M,10);
    doc.setTextColor(...grey);doc.setFontSize(6);doc.setFont("helvetica","normal");doc.text(subtitle,W-M,10,{align:"right"});
    doc.text(today,W-M,15,{align:"right"});
    doc.setFillColor(...gold);doc.rect(4,18,W-4,0.4,"F");
  };








  const pageFooter=(doc:any,pageNum:number,total:number)=>{
    doc.setFillColor(...gold);doc.rect(0,H-8,W,8,"F");
    doc.setFillColor(...dark);doc.rect(0,H-8,4,8,"F");
    doc.setTextColor(26,26,26);doc.setFontSize(6.5);doc.setFont("helvetica","bold");
    doc.text("Valora  ·  Institutional Development Appraisal",M,H-3);
    doc.text(`Confidential  ·  Page ${pageNum} of ${total}`,W-M,H-3,{align:"right"});
  };








  const programmLabel=assetType==="BTS"?`${data.programmMonths||30}m build · ${data.absorptionMonths||18}m absorption`:
    assetType==="BTR"?`${data.programmMonths||36}m build · ${data.stabilisationMonths||12}m stabilisation`:
    `${data.programmMonths||12} months`;








  // ════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ════════════════════════════════════════════════════════════
  doc.setFillColor(...dark);doc.rect(0,0,W,H,"F");
  doc.setFillColor(...gold);doc.rect(0,0,4,H,"F");
  // Top header band
  doc.setFillColor(...bg2);doc.rect(4,0,W-4,50,"F");
  doc.setFillColor(...gold);doc.rect(4,50,W-4,0.5,"F");
  doc.setTextColor(...white);doc.setFontSize(22);doc.setFont("helvetica","bold");doc.text("Valora",M,20);
  doc.setTextColor(...grey);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text("DEVELOPMENT APPRAISAL",M+13,27);
  doc.setTextColor(...grey);doc.setFontSize(6.5);doc.text(today,W-M,12,{align:"right"});




  // Confidential badge




  // Deal title
  doc.setTextColor(...white);doc.setFontSize(26);doc.setFont("helvetica","bold");
  const titleLines=doc.splitTextToSize(data.name||"Untitled Appraisal",W-M*2-10);
  doc.text(titleLines,M,70);
  doc.setFontSize(11);doc.setFont("helvetica","normal");doc.setTextColor(...gold);
  doc.text(`${data.location||"No location"}  ·  ${assetType}  ·  ${data.currency||"GBP"}`,M,70+titleLines.length*11+4);








  // KPI metric strip
  const kpiY=70+titleLines.length*11+18;
  const kpiAll=assetType==="BTR"||assetType==="BTS"?[
    {l:"GDV",v:fmt(r.gdv||0,currencySymbol),c:gold},
    {l:"Total Cost",v:fmt(r.totalCost||0,currencySymbol),c:white},
    {l:"Profit",v:fmt(r.profit||0,currencySymbol),c:(r.profit||0)>0?green:red},
    {l:"Profit on Cost",v:fmtPct(r.poc||0),c:(r.poc||0)>0.2?green:(r.poc||0)>0.1?amber:red},
    {l:"IRR (Unlevered)",v:fmtPct(r.irr||0),c:(r.irr||0)>=0.15?green:(r.irr||0)>=0.08?amber:red},
    {l:"Equity Multiple",v:fmtX(r.moic||0),c:gold},
  ]:assetType==="Hotel"?[
    {l:"Exit Value",v:fmt(r.exitValue||r.gdv||0,currencySymbol),c:gold},
    {l:"EBITDA pa",v:fmt(r.ebitda||0,currencySymbol),c:green},
    {l:"Return on Cost",v:fmtPct(r.poc||0),c:(r.poc||0)>0.15?green:amber},
    {l:"IRR (Levered)",v:fmtPct(r.irrLevered||r.irr||0),c:(r.irrLevered||0)>=0.15?green:amber},
    {l:"DSCR / ICR",v:r.dscr>0?fmtX(r.dscr):"—",c:r.dscr>=1.25?green:amber},
    {l:"Equity Multiple",v:fmtX(r.moic||0),c:gold},
  ]:assetType==="Commercial"||assetType==="MixedUse"?[
    {l:"GDV / Exit",v:fmt(r.totalGDV||r.gdv||0,currencySymbol),c:gold},
    {l:"Total Cost",v:fmt(r.totalCost||0,currencySymbol),c:white},
    {l:"Profit",v:fmt(r.profit||0,currencySymbol),c:(r.profit||0)>0?green:red},
    {l:"Profit on Cost",v:fmtPct(r.poc||0),c:(r.poc||0)>0.2?green:(r.poc||0)>0.1?amber:red},
    {l:"IRR",v:fmtPct(r.irr||0),c:(r.irr||0)>=0.15?green:amber},
    {l:"Equity Multiple",v:fmtX(r.moic||0),c:gold},
  ]:[
    {l:"Purchase Price",v:fmt(r.purchase||0,currencySymbol),c:white},
    {l:"Total Cost",v:fmt(r.totalCost||0,currencySymbol),c:white},
    {l:"Profit",v:fmt(r.profit||0,currencySymbol),c:(r.profit||0)>0?green:red},
    {l:"ROI on Cost",v:fmtPct(r.roi||0),c:(r.roi||0)>0.15?green:amber},
    {l:"IRR",v:fmtPct(r.irr||0),c:white},
    {l:"Equity Multiple",v:fmtX(r.moic||0),c:gold},
  ];
  const kCols=6;const kW=(W-M*2-M)/kCols;
  kpiAll.forEach(({l,v,c},i)=>{
    const x=M+i*(kW+2);
    doc.setFillColor(...bg2);doc.roundedRect(x,kpiY,kW,22,2,2,"F");
    doc.setDrawColor(...c);doc.setLineWidth(0.4);doc.roundedRect(x,kpiY,kW,22,2,2,"S");
    doc.setTextColor(...grey);doc.setFontSize(5.5);doc.setFont("helvetica","normal");doc.text(l.toUpperCase(),x+3,kpiY+7);
    doc.setTextColor(...c);doc.setFontSize(9.5);doc.setFont("helvetica","bold");doc.text(String(v),x+3,kpiY+17);
  });








  // Divider and quick facts strip
  const factsY=kpiY+32;
  doc.setFillColor(...bg3);doc.rect(M,factsY,W-M*2,22,"F");
  doc.setDrawColor(...bg4);doc.setLineWidth(0.2);doc.rect(M,factsY,W-M*2,22,"S");
  const facts=assetType==="BTR"||assetType==="BTS"?[
    ["Units",String(r.totalUnits||"—")],["GIA",r.totalSqft?`${r.totalSqft.toLocaleString()} sqft`:"—"],
    ["Programme",programmLabel],["LTC",`${data.ltc||0}%`],["Finance Rate",`${((num(String(data.benchmarkRate||0))+num(String(data.marginOverBenchmark||0))).toFixed(2))}%`],
  ]:assetType==="Hotel"?[
    ["Rooms",String(data.rooms||"—")],["ADR",`${currencySymbol}${data.adr||0}`],["Occupancy",`${data.occupancy||0}%`],
    ["RevPAR",fmt(r.revpar||0,currencySymbol)],["Programme",programmLabel],
  ]:assetType==="Commercial"?[
    ["GIA",r.totalAreaSqft?`${Math.round(r.totalAreaSqft).toLocaleString()} sqft`:"—"],
    ["Units",String((data.units||[]).length)],["Exit Method",data.exitMethod||"NIY"],
    ["Programme",`${data.buildMonths||12}m`],["Benchmark Yield",`${data.niy||0}%`],
  ]:assetType==="MixedUse"?[
    ["Zones",String((data.zones||[]).length)],["Total GIA",r.totalSqft?`${Math.round(r.totalSqft).toLocaleString()} sqft`:"—"],
    ["Programme",`${data.programmMonths||24}m`],["Blended IRR",fmtPct(r.irr||0)],["Peak Loan",fmt(r.peakLoanBalance||0,currencySymbol)],
  ]:[
    ["Property",data.propertySqft?`${data.propertySqft} sqft`:"—"],["Bridging Rate",`${data.bridgingRatePct||0}%pm`],
    ["LTV",`${data.flipLTV||75}%`],["Bridge Term",`${data.bridgingTermMonths||6}m`],["Exit",data.flipMode==="hold"?"Hold (BTL)":"Sell"],
  ];
  const fW=(W-M*2)/facts.length;
  facts.forEach(([l,v],i)=>{
    const x=M+i*fW;
    if(i>0){doc.setDrawColor(...bg4);doc.setLineWidth(0.2);doc.line(x,factsY+3,x,factsY+19);}
    doc.setTextColor(...grey);doc.setFontSize(5.5);doc.setFont("helvetica","normal");doc.text(l.toUpperCase(),x+4,factsY+9);
    doc.setTextColor(...white);doc.setFontSize(8);doc.setFont("helvetica","bold");doc.text(String(v),x+4,factsY+17);
  });








  // Watermark / decorative element
  doc.setTextColor(201,168,76);doc.setFontSize(120);doc.setFont("helvetica","bold");
  doc.setGState&&doc.setGState(doc.GState({opacity:0.03}));
  doc.text("V",W/2,H-40,{align:"center"});
  doc.setGState&&doc.setGState(doc.GState({opacity:1}));








  pageFooter(doc,1,4);








  // ════════════════════════════════════════════════════════════
  // PAGE 2 — FINANCIAL SUMMARY
  // ════════════════════════════════════════════════════════════
  doc.addPage();pageHeader(doc,`${data.name||"Appraisal"}  ·  Financial Summary`);
  let lY=26,rY=26;








  if(assetType==="BTR"){
    lY=drawCol("Returns",[
      ["GDV (Exit)",fmt(r.gdv,currencySymbol),gold],["Gross NOI pa",fmt(r.noi,currencySymbol),white],
      ["Gross Yield on Cost",fmtPct(r.yoc),white],["Total Cost",fmt(r.totalCost,currencySymbol),grey],
      ["Equity In",fmt(r.equity||0,currencySymbol),gold],["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],
      ["Profit on Cost",fmtPct(r.poc),r.poc>0.2?green:r.poc>0.1?amber:red],
      ["IRR (Unlevered)",fmtPct(r.irr),r.irr>=0.15?green:r.irr>=0.08?amber:red],
      ["IRR (Levered)",fmtPct(r.irrLevered),r.irrLevered>=0.15?green:r.irrLevered>=0.08?amber:red],
      ["Equity Multiple",fmtX(r.moic),gold],["DSCR / ICR",r.dscr>0?fmtX(r.dscr):"—",r.dscr>=1.25?green:amber],
      ["Payback",r.paybackMonth?`Month ${r.paybackMonth}`:"—",white],
      ["Break-even Yield",fmtPct(r.breakEvenYield),white],["RLV",fmt(r.rlv,currencySymbol),gold],
    ],colL,lY,colW)||lY;
    rY=drawCol("Cost Stack",[
      ["Land / Acquisition",fmt(r.landCost,currencySymbol),grey],["SDLT / Property Tax",fmt(r.sdlt,currencySymbol),grey],
      ["Build Cost",fmt(r.buildCost,currencySymbol),grey],["Professional Fees",fmt(r.devCost-r.buildCost-r.arrangementFee-r.interestCost,currencySymbol),grey],
      ["Contingency",`${data.contingencyPct||5}% — ${fmt((r.buildCost||0)*(data.contingencyPct||5)/100,currencySymbol)}`,grey],
      ...(r.vat>0?[["VAT",fmt(r.vat,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ...(r.cil>0?[["CIL",fmt(r.cil,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ...(r.s106>0?[["Section 106",fmt(r.s106,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),amber],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),amber],
      ["Total Finance Cost",fmt(r.totalFinanceCost,currencySymbol),amber],
      ["Total Cost",fmt(r.totalCost,currencySymbol),gold],
    ],colR,rY,colW)||rY;
    rY=drawCol("Assumptions",[
      ["Exit Yield",`${data.exitYield||0}%`,white],["NIY",`${data.niy||0}%`,white],
      ["Void",`${data.voidPct||0}%`,white],["OpEx psf",`${currencySymbol}${data.opexPsf||0}`,white],
      ["Programme",programmLabel,white],["LTC",`${data.ltc||0}%`,white],
      ["All-in Rate",`${(num(String(data.benchmarkRate||0))+num(String(data.marginOverBenchmark||0))).toFixed(2)}%`,white],
      ["Arrangement Fee",`${data.arrangementFeePct||1}%`,white],
      ["Prof. Fees",`${data.professionalFeesPct||8}%`,white],["Contingency",`${data.contingencyPct||5}%`,white],
    ],colR,rY,colW)||rY;
  }else if(assetType==="BTS"){
    lY=drawCol("Returns",[
      ["GDV",fmt(r.gdv,currencySymbol),gold],["Total Units",String(r.totalUnits||0),white],
      ["Total GIA",r.totalSqft?`${r.totalSqft.toLocaleString()} sqft`:"—",white],
      ["Total Cost",fmt(r.totalCost,currencySymbol),grey],["Equity In",fmt(r.equity||0,currencySymbol),gold],
      ["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],
      ["Profit on Cost",fmtPct(r.poc),r.poc>0.2?green:r.poc>0.1?amber:red],
      ["Profit on GDV",fmtPct(r.margin),white],
      ["IRR (Unlevered)",fmtPct(r.irr),r.irr>=0.15?green:r.irr>=0.08?amber:red],
      ["IRR (Levered)",fmtPct(r.irrLevered),r.irrLevered>=0.15?green:r.irrLevered>=0.08?amber:red],
      ["Equity Multiple",fmtX(r.moic),gold],["Break-even psf",r.breakEvenPsf?`${currencySymbol}${Math.round(r.breakEvenPsf)}`:"-",white],
    ],colL,lY,colW)||lY;
    rY=drawCol("Cost Stack",[
      ["Land / Acquisition",fmt(r.landCost,currencySymbol),grey],["SDLT",fmt(r.sdlt,currencySymbol),grey],
      ["Build Cost",fmt(r.buildCost,currencySymbol),grey],
      ...(r.vat>0?[["VAT",fmt(r.vat,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ...(r.cil>0?[["CIL",fmt(r.cil,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ...(r.s106>0?[["Section 106",fmt(r.s106,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),amber],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),amber],
      ["Total Cost",fmt(r.totalCost,currencySymbol),gold],
    ],colR,rY,colW)||rY;
    rY=drawCol("Assumptions",[
      ["Programme",programmLabel,white],["Absorption",`${data.absorptionMonths||18}m`,white],
      ["LTC",`${data.ltc||0}%`,white],["All-in Rate",`${(num(String(data.benchmarkRate||0))+num(String(data.marginOverBenchmark||0))).toFixed(2)}%`,white],
      ["Agent Fee",`${data.agentFeePct||1.5}%`,white],["Marketing",`${data.marketingPct||1}%`,white],
      ["Prof. Fees",`${data.professionalFeesPct||8}%`,white],["Contingency",`${data.contingencyPct||5}%`,white],
    ],colR,rY,colW)||rY;
  }else if(assetType==="Hotel"){
    lY=drawCol("Returns",[
      ["RevPAR",fmt(r.revpar,currencySymbol),gold],["Total Revenue pa",fmt(r.revenuePa||0,currencySymbol),white],
      ["EBITDA pa",fmt(r.ebitda,currencySymbol),green],["Exit Value",fmt(r.exitValue,currencySymbol),gold],
      ["Total Investment",fmt(r.totalInvestment,currencySymbol),grey],["Equity In",fmt(r.equity||0,currencySymbol),gold],
      ["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],
      ["Return on Cost",fmtPct(r.poc),r.poc>0.15?green:amber],["DSCR / ICR",r.dscr>0?fmtX(r.dscr):"—",r.dscr>=1.25?green:red],
      ["IRR (Unlevered)",fmtPct(r.irr),r.irr>=0.15?green:r.irr>=0.08?amber:red],
      ["IRR (Levered)",fmtPct(r.irrLevered),r.irrLevered>=0.15?green:r.irrLevered>=0.08?amber:red],
      ["Equity Multiple",fmtX(r.moic),gold],["Payback",r.paybackMonth?`Month ${r.paybackMonth}`:"—",white],
    ],colL,lY,colW)||lY;
    rY=drawCol("Cost Stack",[
      ["Purchase Price",fmt(r.purchasePrice||data.purchasePrice||0,currencySymbol),grey],
      ["SDLT",fmt(r.sdlt||0,currencySymbol),grey],["CapEx",fmt(r.capex,currencySymbol),grey],
      ...(r.vat>0?[["VAT",fmt(r.vat,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),amber],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),amber],
      ["Total Finance Cost",fmt(r.totalFinanceCost||0,currencySymbol),amber],["Equity In",fmt(r.equity||0,currencySymbol),gold],
      ["Total Investment",fmt(r.totalInvestment,currencySymbol),gold],
    ],colR,rY,colW)||rY;
    rY=drawCol("Assumptions",[
      ["Rooms",String(data.rooms||0),white],["Star Rating",`${data.starRating||4} Star`,white],
      ["ADR",`${currencySymbol}${data.adr||0}`,white],["Occupancy",`${data.occupancy||0}%`,white],
      ["Exit Cap Rate",`${data.exitCapRate||0}%`,white],["Stabilised Cap Rate",`${data.stabilisedCapRate||0}%`,white],
      ["Programme",programmLabel,white],["LTC",`${data.ltc||0}%`,white],
    ],colR,rY,colW)||rY;
  }else if(assetType==="Flip"){
    lY=drawCol("Returns",[
      ["Purchase Price",fmt(r.purchase,currencySymbol),grey],["SDLT / Tax",fmt(r.sdlt,currencySymbol),grey],
      ["Refurb Budget",fmt(r.refurb,currencySymbol),grey],["Professional Fees",fmt(r.profFees,currencySymbol),grey],
      ["Total Finance Cost",fmt(r.totalFinanceCost,currencySymbol),amber],["Total Cost",fmt(r.totalCost,currencySymbol),grey],
      ["Equity In",fmt(r.equity||0,currencySymbol),gold],["Net Sale Proceeds",fmt(r.netProceeds,currencySymbol),gold],
      ...(r.cashOutRefi>100?[["Cash Released at Refi",fmt(r.cashOutRefi,currencySymbol),green] as [string,string,[number,number,number]]]:[] as any),
      ...(r.cashOutRefi<-100?[["Equity Top-up at Refi",fmt(Math.abs(r.cashOutRefi),currencySymbol),red] as [string,string,[number,number,number]]]:[] as any),
      ["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],
      ["ROI on Total Cost",fmtPct(r.roi),r.roi>0.15?green:amber],
      ["Equity Multiple",fmtX(r.moic),gold],["IRR (Annualised)",fmtPct(r.irr),white],
      ...(r.flipMode==="hold"?[["DSCR / ICR",r.dscr>0?fmtX(r.dscr):"N/A (vacant)",r.dscr>=1.25?green:r.dscr>0?amber:grey] as [string,string,[number,number,number]]]:[] as any),
    ],colL,lY,colW)||lY;
    rY=drawCol("Property & Finance",[
      ["Location",data.location||"—",white],["Property Size",data.propertySqft?`${data.propertySqft} sqft`:"—",white],
      ["Bridging Rate",`${data.bridgingRatePct||0}%pm`,white],["LTV",`${data.flipLTV||75}%`,white],
      ["Bridge Term",`${data.bridgingTermMonths||6}m`,white],["Peak Loan Balance",fmt(r.peakLoanBalance||0,currencySymbol),amber],
      ["Arrangement Fee",`${data.arrangementFeePct||2}%`,white],["Exit Strategy",r.flipMode==="hold"?"Hold (BTL)":"Sell on Completion",white],
      ...(r.flipMode==="hold"?[
        ["Refi LTV",`${data.refiLTV||75}%`,white],["Refi Rate",`${data.refiRatePct||6}% pa`,white],
        ["Hold Term",`${data.refiTermMonths||24}m`,white],["Occupancy",r.holdOccupancy==="tenanted"?"Tenanted":"Vacant",white],
        ...(r.holdOccupancy==="tenanted"?[["Gross Yield",fmtPct(r.grossYield||0),white],["Net Yield",fmtPct(r.netYield||0),white]] as any:[] as any),
      ] as any:[] as any),
    ],colR,rY,colW)||rY;
  }else if(assetType==="MixedUse"){
    lY=drawCol("Blended Returns",[
      ["Total GDV",fmt(r.totalGDV||0,currencySymbol),gold],["Total Cost",fmt(r.totalCost,currencySymbol),grey],
      ["Equity In",fmt(r.equity||0,currencySymbol),gold],["Total Finance Cost",fmt(r.totalFinanceCost,currencySymbol),amber],
      ["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],
      ["Profit on Cost",fmtPct(r.poc||0),r.poc>0.2?green:r.poc>0.1?amber:red],
      ["Profit on GDV",fmtPct(r.margin||0),white],["IRR (Blended)",fmtPct(r.irr||0),r.irr>=0.15?green:amber],
      ["Equity Multiple",fmtX(r.moic||0),gold],
    ],colL,lY,colW)||lY;
    rY=drawCol("Zone Breakdown",
      (r.zoneResults||[]).slice(0,8).map((z:any)=>[
        z.label||z.type,`${fmt(z.gdvZone||0,currencySymbol)} GDV`,
        (z.gdvZone||0)-(z.totalBuildCost||0)>0?green:red
      ] as [string,string,[number,number,number]]),
    colR,rY,colW)||rY;
    rY=drawCol("Scheme Details",[
      ["Programme",`${data.programmMonths||24}m`,white],["Zones",String((data.zones||[]).length),white],
      ["Total GIA",r.totalSqft?`${Math.round(r.totalSqft).toLocaleString()} sqft`:"—",white],
      ["LTC",`${data.ltc||60}%`,white],["Peak Loan",fmt(r.peakLoanBalance||0,currencySymbol),amber],
    ],colR,rY,colW)||rY;
  }else if(assetType==="Commercial"){
    lY=drawCol("Returns",[
      ["GDV / Exit Value",fmt(r.gdv||0,currencySymbol),gold],["Total ERV pa",fmt(r.totalERV||0,currencySymbol),white],
      ["Net Passing Rent pa",fmt(r.totalNetPassing||0,currencySymbol),white],["Yield on Cost",fmtPct(r.yoc||0),white],
      ["Total Cost",fmt(r.totalCost,currencySymbol),grey],["Equity In",fmt(r.equity||0,currencySymbol),gold],
      ["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],
      ["Profit on Cost",fmtPct(r.poc||0),r.poc>0.2?green:r.poc>0.1?amber:red],
      ["DSCR / ICR",r.dscr>0?fmtX(r.dscr):"—",r.dscr>=1.25?green:amber],
      ["IRR (Unlevered)",fmtPct(r.irr||0),r.irr>=0.15?green:amber],
      ["IRR (Levered)",fmtPct(r.irrLevered||0),r.irrLevered>=0.15?green:amber],
      ["Equity Multiple",fmtX(r.moic||0),gold],["Break-even Rent",r.breakEvenRent?`${currencySymbol}${Math.round(r.breakEvenRent)}/sqft/yr`:"—",white],
      ["RLV",fmt(r.rlv||0,currencySymbol),gold],
    ],colL,lY,colW)||lY;
    rY=drawCol("Cost Stack",[
      ["Land / Acquisition",fmt(r.landCost||0,currencySymbol),grey],["SDLT",fmt(r.sdlt||0,currencySymbol),grey],
      ["Build Cost",fmt(r.buildCost||0,currencySymbol),grey],
      ...(r.vat>0?[["VAT",fmt(r.vat,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ...(r.cil>0?[["CIL",fmt(r.cil,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ...(r.s106>0?[["Section 106",fmt(r.s106,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ["Arrangement Fee",fmt(r.arrangementFee||0,currencySymbol),amber],["Interest (Rolled)",fmt(r.interestCost||0,currencySymbol),amber],
      ["Total Cost",fmt(r.totalCost||0,currencySymbol),gold],
    ],colR,rY,colW)||rY;
    rY=drawCol("Assumptions",[
      ["Exit Method",data.exitMethod==="vp"?"Vacant Possession":data.exitMethod==="equivalent"?"Equiv. Yield":"NIY Cap Rate",white],
      ["NIY",`${data.niy||0}%`,white],["Avg WAULT",r.avgWAULT?`${r.avgWAULT.toFixed(1)} yrs`:"—",white],
      ["Programme",`${data.buildMonths||12}m build`,white],["LTC",`${data.ltc||60}%`,white],
    ],colR,rY,colW)||rY;
  }








  // Unit Mix table — BTR/BTS only
  if((assetType==="BTR"||assetType==="BTS")&&(data.units||[]).length>0){
    const tableY=Math.max(lY,rY)+4;
    if(tableY<H-30){
      const tW=W-M*2;
      doc.setTextColor(...gold);doc.setFontSize(8);doc.setFont("helvetica","bold");doc.text("UNIT MIX",M,tableY);
      doc.setFillColor(...gold);doc.rect(M,tableY+1.5,tW,0.3,"F");
      const hdrs=assetType==="BTS"?["Type","Units","Size (sqft)","Price psf","Revenue"]:["Type","Units","Size (sqft)","Rent pcm","Gross pa"];
      const hW=[tW*0.35,tW*0.12,tW*0.16,tW*0.18,tW*0.19];let hx=M+2;let ty=tableY+9;
      doc.setFontSize(6.5);doc.setFont("helvetica","bold");doc.setTextColor(...grey);
      hdrs.forEach((h,i)=>{doc.text(h,hx,ty);hx+=hW[i];});ty+=6;
      (data.units||[]).slice(0,8).forEach((u:any,i:number)=>{
        if(ty>H-20)return;
        if(i%2===0){doc.setFillColor(...bg3);doc.rect(M,ty-4,tW,7,"F");}
        const gross=assetType==="BTS"?u.count*u.size*u.salePricePsf:u.count*(u.rentPcm||0)*12;
        const vals=[u.type||"—",String(u.count||0),String(u.size||0),
          assetType==="BTS"?`${currencySymbol}${u.salePricePsf||0}`:`${currencySymbol}${u.rentPcm||0}`,
          fmt(gross,currencySymbol)];
        let vx=M+2;doc.setFontSize(7.5);doc.setFont("helvetica","normal");
        vals.forEach((v,vi)=>{
          doc.setTextColor(...(vi===4?gold:vi===0?white:grey));
          doc.text(String(v),vx,ty);vx+=hW[vi];
        });ty+=7;
      });
      if(ty<H-20){
        const totalUnits=(data.units||[]).reduce((s:number,u:any)=>s+Number(u.count||0),0);
        const totalGross=assetType==="BTS"?(data.units||[]).reduce((s:number,u:any)=>s+Number(u.count||0)*Number(u.size||0)*Number(u.salePricePsf||0),0):(data.units||[]).reduce((s:number,u:any)=>s+Number(u.count||0)*Number(u.rentPcm||0)*12,0);
        doc.setFillColor(...bg2);doc.rect(M,ty-4,tW,7,"F");
        doc.setFontSize(7.5);doc.setFont("helvetica","bold");
        doc.setTextColor(...white);doc.text("TOTAL",M+2,ty);
        doc.setTextColor(...white);doc.text(String(totalUnits),M+hW[0]+2,ty);
        doc.setTextColor(...gold);doc.text(fmt(totalGross,currencySymbol),M+hW[0]+hW[1]+hW[2]+hW[3]+2,ty);
      }
    }
  }








  pageFooter(doc,2,4);








  // ════════════════════════════════════════════════════════════
  // PAGE 3 — CASHFLOW + SENSITIVITY
  // ════════════════════════════════════════════════════════════
  doc.addPage();pageHeader(doc,`${data.name||"Appraisal"}  ·  Cashflow & Sensitivity`);
  let py=26;








  // Cashflow chart
  py=sectionHeader(doc,"Monthly Cashflow (Unlevered)",py);py+=4;
  const cfs:number[]=r.uCfs||r.cfs||[];
  if(cfs.length>0){
    py=drawCashflowBars(cfs,M,py,W-M*2,36,currencySymbol);
    // Phase labels
    doc.setFontSize(5.5);doc.setTextColor(...grey);doc.setFont("helvetica","normal");
    doc.text("Month 1",M,py);doc.text(`Exit M${cfs.length}`,W-M,py,{align:"right"});
    // Payback callout
    let cumX=0;const paybackM=cfs.findIndex((_,i,a)=>{cumX+=a[i];return cumX>=0;});
    if(paybackM>=0){
      const pctX=M+(paybackM/cfs.length)*(W-M*2);
      doc.setDrawColor(...gold);doc.setLineWidth(0.3);doc.line(pctX,py-40,pctX,py+2);
      doc.setTextColor(...gold);doc.text(`Payback M${paybackM+1}`,pctX,py+5);
    }
    py+=10;
    // Monthly table — key months only
    py=sectionHeader(doc,"Key Cashflow Months",py);py+=4;
    const keyRows=cfs.map((cf,m)=>({cf,m,cum:cfs.slice(0,m+1).reduce((a,b)=>a+b,0)}))
      .filter(({cf,m})=>Math.abs(cf)>0||m===cfs.length-1)
      .slice(0,12);
    const tW2=W-M*2;const cols2=["Month","Event","Cashflow","Cumulative"];const cW2=[tW2*0.12,tW2*0.38,tW2*0.25,tW2*0.25];
    doc.setFillColor(...bg3);doc.rect(M,py-4,tW2,7,"F");
    doc.setFontSize(6);doc.setFont("helvetica","bold");doc.setTextColor(...grey);
    let cx2=M+2;cols2.forEach((h,i)=>{doc.text(h,cx2,py);cx2+=cW2[i];});py+=5;
    const eventLabel=(m:number,cf:number)=>{
      if(m===0)return"Equity deployed";
      if(m===cfs.length-1)return"Exit / sale proceeds";
      if(assetType==="Flip"&&r.flipMode==="hold"&&m===Math.round(r.bridgingMonths||6))return"Refinance event";
      if(cf<0)return"Cost / draw";return"Income";
    };
    keyRows.forEach(({cf,m,cum},i)=>{
      if(py>H-20)return;
      if(i%2===0){doc.setFillColor(...bg4);doc.rect(M,py-3,tW2,6,"F");}
      const isExit=m===cfs.length-1;
      doc.setFontSize(6.5);doc.setFont("helvetica","normal");
      let cx3=M+2;
      doc.setTextColor(...grey);doc.text(`M${m+1}${isExit?" (Exit)":""}`,cx3,py);cx3+=cW2[0];
      doc.setTextColor(...white);doc.text(eventLabel(m,cf),cx3,py);cx3+=cW2[1];
      doc.setTextColor(...(cf>=0?green:red));doc.text(`${cf>=0?"+":""}${currencySymbol}${Math.abs(Math.round(cf)).toLocaleString()}`,cx3,py);cx3+=cW2[2];
      doc.setTextColor(...(cum>=0?green:white));doc.text(`${cum>=0?"+":""}${currencySymbol}${Math.abs(Math.round(cum)).toLocaleString()}`,cx3,py);
      py+=6;
    });
  }








  py+=6;








  // Sensitivity matrix
  if(assetType==="BTR"||assetType==="BTS"){
    const sm=r.sensMatrix;
    if(sm&&sm.length>0){
      py=drawSensTable(sm,
        (assetType==="BTS"?["+10% sale","+5% sale","Base","-5% sale","-10% sale"]:[`${(num(String(data.exitYield))-0.5).toFixed(2)}%`,`${(num(String(data.exitYield))-0.25).toFixed(2)}%`,`${num(String(data.exitYield)).toFixed(2)}%`,`${(num(String(data.exitYield))+0.25).toFixed(2)}%`,`${(num(String(data.exitYield))+0.5).toFixed(2)}%`]),
        ["-10%","-5%","Base","+5%","+10%"],
        M,py,W-M*2,
        assetType==="BTS"?"Sensitivity: Sale Price × Build Cost — Profit on Cost":"Sensitivity: Exit Yield × Rent Shift — Profit on Cost"
      );
    }
  }else if(assetType==="Flip"){
    const salePctSteps=[10,5,0,-5,-10];
    const refurbPctSteps=[-10,-5,0,5,10];
    const flipSens=salePctSteps.map(sp=>refurbPctSteps.map(rp=>{
      const modSale=(r.salePrice||0)*(1+sp/100);
      const modRefurb=(r.refurb||0)*(1+rp/100);
      const modProfFees=modRefurb*(num(String(data.professionalFeesPct))/100);
      const modCont=modRefurb*(num(String(data.contingencyPct))/100);
      const modTotal=(r.purchase||0)+(r.sdlt||0)+modRefurb+modProfFees+modCont+(r.other||0)+(r.totalFinanceCost||0);
      const agentF=modSale*(num(String(data.agentFeePct||1.5))/100);
      const modProfit=(modSale-agentF)-modTotal;
      return modTotal>0?modProfit/modTotal:0;
    }));
    py=drawSensTable(flipSens,
      ["+10% sale","+5% sale","Base","-5% sale","-10% sale"],
      ["-10% refurb","-5% refurb","Base","+5% refurb","+10% refurb"],
      M,py,W-M*2,"Sensitivity: Sale Price × Refurb Cost — Profit on Cost"
    );
  }else if(assetType==="Commercial"&&r.sensMatrix){
    const niyBase=num(String(data.niy||6));
    py=drawSensTable(r.sensMatrix,
      [`${(niyBase-0.5).toFixed(2)}%`,`${(niyBase-0.25).toFixed(2)}%`,`${niyBase.toFixed(2)}%`,`${(niyBase+0.25).toFixed(2)}%`,`${(niyBase+0.5).toFixed(2)}%`],
      ["-10%","-5%","Base","+5%","+10%"],
      M,py,W-M*2,"Sensitivity: NIY × ERV Shift — Profit on Cost"
    );
  }








  // Legend
  if(py<H-20){
    py+=4;
    [[green,"> 20% PoC"],[amber,"10-20% PoC"],[red,"< 10% PoC"],[gold,"Base case"]].forEach(([c,l],i)=>{
      doc.setFillColor(...(c as [number,number,number]));doc.roundedRect(M+i*42,py,3,3,0.5,0.5,"F");
      doc.setTextColor(...grey);doc.setFontSize(6);doc.setFont("helvetica","normal");doc.text(String(l),M+i*42+5,py+2.5);
    });
  }








  pageFooter(doc,3,4);








  // ════════════════════════════════════════════════════════════
  // PAGE 4 — ASSUMPTIONS & DISCLAIMER
  // ════════════════════════════════════════════════════════════
  doc.addPage();pageHeader(doc,`${data.name||"Appraisal"}  ·  Assumptions & Disclaimer`);
  let ay=26;








  ay=sectionHeader(doc,"Key Assumptions",ay);ay+=6;
  const assumptionGroups:[string,[string,string][]][]=[
    ["Project",[
      ["Name",data.name||"—"],["Location",data.location||"—"],["Asset Type",assetType],
      ["Currency",data.currency||"GBP"],["Date",today],
    ]],
    ["Programme",[
      ["Build Period",`${data.programmMonths||data.bridgingTermMonths||12} months`],
      ...(data.absorptionMonths?[["Absorption",`${data.absorptionMonths}m`] as [string,string]]:[] as any),
      ...(data.stabilisationMonths?[["Stabilisation",`${data.stabilisationMonths}m`] as [string,string]]:[] as any),
    ]],
    ["Finance",[
      ...(data.ltc?[["LTC",`${data.ltc}%`] as [string,string]]:[] as any),
      ...(data.bridgingRatePct?[["Bridging Rate",`${data.bridgingRatePct}%pm`] as [string,string]]:[] as any),
      ...(data.benchmarkRate?[["Benchmark Rate",`${data.benchmarkRate}%`] as [string,string]]:[] as any),
      ...(data.marginOverBenchmark?[["Margin over Benchmark",`${data.marginOverBenchmark}%`] as [string,string]]:[] as any),
      ...(data.arrangementFeePct?[["Arrangement Fee",`${data.arrangementFeePct}%`] as [string,string]]:[] as any),
    ]],
    ["Costs",[
      ...(data.professionalFeesPct?[["Professional Fees",`${data.professionalFeesPct}%`] as [string,string]]:[] as any),
      ...(data.contingencyPct?[["Contingency",`${data.contingencyPct}%`] as [string,string]]:[] as any),
      ...(r.vat>0?[["VAT",fmt(r.vat,currencySymbol)] as [string,string]]:[] as any),
      ...(r.cil>0?[["CIL",fmt(r.cil,currencySymbol)] as [string,string]]:[] as any),
      ...(r.s106>0?[["Section 106",fmt(r.s106,currencySymbol)] as [string,string]]:[] as any),
    ]],
  ];
  const gCols=2;const gW=(W-M*2-8)/gCols;
  let gx=M;let gy=ay;let gcol=0;
  assumptionGroups.forEach(([title,rows])=>{
    if(rows.length===0)return;
    if(gy>H-50){gy=ay;gx+=gW+8;gcol++;}
    doc.setFillColor(...bg3);doc.rect(gx,gy-2,gW,8,"F");
    doc.setFillColor(...gold);doc.rect(gx,gy-2,2,8,"F");
    doc.setTextColor(...gold);doc.setFontSize(7);doc.setFont("helvetica","bold");doc.text(title.toUpperCase(),gx+5,gy+3);
    gy+=10;
    rows.forEach(([l,v],i)=>{
      if(i%2===0){doc.setFillColor(...bg4);doc.rect(gx,gy-3,gW,6,"F");}
      doc.setFontSize(6.5);doc.setFont("helvetica","normal");
      doc.setTextColor(...grey);doc.text(l,gx+3,gy);
      doc.setTextColor(...white);doc.setFont("helvetica","bold");doc.text(String(v),gx+gW-2,gy,{align:"right"});
      gy+=6;
    });
    gy+=6;
  });








  // Disclaimer box
  const discY=H-60;
  doc.setFillColor(...bg3);doc.roundedRect(M,discY,W-M*2,48,2,2,"F");
  doc.setDrawColor(...grey);doc.setLineWidth(0.2);doc.roundedRect(M,discY,W-M*2,48,2,2,"S");
  doc.setTextColor(...amber);doc.setFontSize(7);doc.setFont("helvetica","bold");doc.text("IMPORTANT DISCLAIMER",M+5,discY+8);
  const disclaimer="This appraisal has been prepared using the Valora platform for indicative purposes only. It is based on assumptions and projections that may not reflect actual market conditions, planning outcomes, build costs, or financing terms. This document does not constitute financial, investment, legal, or tax advice. Recipients should conduct their own due diligence and seek appropriate professional advice before making any investment decision. Valuations, IRR figures, and profit projections are forward-looking estimates and are not guaranteed. Past performance of similar investments is not a reliable indicator of future results. Valora and its affiliates accept no liability for decisions made based on this document.";
  const dLines=doc.splitTextToSize(disclaimer,W-M*2-10);
  doc.setTextColor(...grey);doc.setFontSize(6);doc.setFont("helvetica","normal");
  dLines.slice(0,8).forEach((line:string,i:number)=>doc.text(line,M+5,discY+16+i*5.5));








  pageFooter(doc,4,4);








  doc.save(`Valora_${(data.name||"Appraisal").replace(/\s+/g,"_")}_${new Date().toISOString().slice(0,10)}.pdf`);
}








async function generateBrochurePDF(data:any,r:any,assetType:string,currencySymbol:string,content:BrochureContent,photos:string[],hotelMode="simple",hotelAdv:any=null,hotelComps:any=null){
  if(!(window as any).jspdf){
    await new Promise<void>((resolve,reject)=>{
      const s=document.createElement("script");
      s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload=()=>resolve();s.onerror=()=>reject();document.head.appendChild(s);
    });
  }
  const{jsPDF}=(window as any).jspdf;
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210,M=18;
  // Slate & Sage palette — print-friendly
  const gold=[42,138,100] as [number,number,number];    // sage green accent
  const dark=[248,249,250] as [number,number,number];   // light bg
  const grey=[90,100,120] as [number,number,number];    // secondary text
  const white=[30,36,51] as [number,number,number];     // #1E2433 primary text
  const bg2=[255,255,255] as [number,number,number];    // white cards
  const bg3=[248,249,250] as [number,number,number];    // alternate rows
  const bg4=[232,234,237] as [number,number,number];    // border tone
  const green=[42,138,100] as [number,number,number];   // sage positive
  const red=[192,64,64] as [number,number,number];      // muted red
  const amber=[176,120,32] as [number,number,number];   // muted amber
  const blue=[42,95,170] as [number,number,number];     // muted blue
  const isHotelAdv=assetType==="Hotel"&&hotelMode==="advanced"&&hotelAdv;
  const today=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});








  const wrapText=(doc:any,text:string,x:number,startY:number,maxW:number,lineH:number)=>{
    const lines=doc.splitTextToSize(text,maxW);
    let sy=startY;
    lines.forEach((line:string,i:number)=>{
      if(sy+lineH>278){doc.addPage();doc.setFillColor(...dark);doc.rect(0,0,210,297,"F");doc.setFillColor(...gold);doc.rect(0,0,4,297,"F");sy=20;}
      doc.text(line,x,sy);sy+=lineH;
    });
    return sy+3;
  };








  const pageFooter=(doc:any,pageNum:number)=>{
    doc.setFillColor(...gold);doc.rect(0,291,W,6,"F");
    doc.setTextColor(26,26,26);doc.setFontSize(6.5);doc.setFont("helvetica","bold");
    doc.text("Valora  ·  Institutional Development Appraisal",M,295.5);
    doc.text(`Strictly Private & Confidential  ·  Page ${pageNum}  ·  ${today}`,W-M,295.5,{align:"right"});
  };








  // ════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ════════════════════════════════════════════════════════════
  doc.setFillColor(...dark);doc.rect(0,0,W,297,"F");
  doc.setFillColor(...gold);doc.rect(0,0,4,297,"F");








  // Hero photo(s)
  if(photos.length>0){
    const phH=photos.length>=2?100:75;
    const phW=W/Math.min(photos.length,3);
    photos.slice(0,3).forEach((ph,i)=>{
      try{doc.addImage(ph,"JPEG",i*phW,0,phW,phH);}catch(e){}
    });
    doc.setFillColor(6,7,10);doc.setGState&&doc.setGState(doc.GState({opacity:0.55}));
    doc.rect(0,0,W,photos.length>0?100:0,"F");
    doc.setGState&&doc.setGState(doc.GState({opacity:1}));
  }








  // Branding overlay
  const brandY=photos.length>0?8:12;
  doc.setTextColor(255,255,255);doc.setFontSize(14);doc.setFont("helvetica","bold");doc.text("Valora",M,brandY+9);
  doc.setTextColor(...grey);doc.setFontSize(6.5);doc.setFont("helvetica","normal");
  doc.setTextColor(255,255,255);doc.setFontSize(8);doc.setFont("helvetica","normal");doc.text("INVESTMENT MEMORANDUM",M,brandY+17);








  // Deal title
  const titleY=photos.length>0?112:55;
  doc.setTextColor(...white);doc.setFontSize(30);doc.setFont("helvetica","bold");
  const titleLines=doc.splitTextToSize(data.name||"Investment Opportunity",W-M*2);
  doc.text(titleLines,M,titleY);








  const subtitleY=titleY+titleLines.length*12+5;
  doc.setFontSize(11);doc.setFont("helvetica","normal");doc.setTextColor(...gold);
  doc.text(`${data.location||""}  ·  ${assetType}  ·  ${data.currency||"GBP"}`,M,subtitleY);








  // Divider
  doc.setDrawColor(...gold);doc.setLineWidth(0.5);doc.line(M,subtitleY+6,W-M,subtitleY+6);








  // Executive tagline
  const tagY=subtitleY+14;
  if(content.executiveSummary){
    const tagLines=doc.splitTextToSize(content.executiveSummary.trim(),150);
    doc.setTextColor(...white);doc.setFontSize(8.5);doc.setFont("helvetica","normal");
    tagLines.slice(0,4).forEach((l:string,i:number)=>doc.text(l,M,tagY+i*5.5));
  }








  // KPI cards — 6 metrics in 2 rows of 3
  const kpiY=tagY+20;
  const kpiData=isHotelAdv?[
    {l:"Exit Value",v:fmt(hotelAdv.exitValue||r.exitValue||0,currencySymbol),c:gold},
    {l:"EBITDA pa",v:fmt(hotelAdv.ebitda||r.ebitda||0,currencySymbol),c:green},
    {l:"Return on Cost",v:fmtPct(hotelAdv.poc||r.poc||0),c:(hotelAdv.poc||r.poc||0)>0.15?green:amber},
    {l:"IRR (Unlevered)",v:fmtPct(hotelAdv.irr||r.irr||0),c:(hotelAdv.irr||r.irr||0)>=0.10?green:amber},
    {l:"IRR (Levered)",v:fmtPct(hotelAdv.irrLevered||r.irrLevered||0),c:(hotelAdv.irrLevered||r.irrLevered||0)>=0.10?blue:amber},
    {l:"Equity Multiple",v:fmtX(hotelAdv.moic||r.moic||0),c:gold},
    {l:"DSCR / ICR",v:(hotelAdv.dscr||r.dscr||0)>0?fmtX(hotelAdv.dscr||r.dscr||0):"—",c:(hotelAdv.dscr||r.dscr||0)>=1.25?green:amber},
    {l:"Equity In",v:fmt(hotelAdv.equity||r.equity||0,currencySymbol),c:amber},
    {l:"RevPAR",v:`${currencySymbol}${Math.round(Number(data.adr||0)*Number(data.occupancy||0)/100)}`,c:blue},
  ]:assetType==="BTR"||assetType==="BTS"?[
    {l:"GDV",v:fmt(r.gdv||0,currencySymbol),c:gold},
    {l:"Profit",v:fmt(r.profit||0,currencySymbol),c:(r.profit||0)>0?green:red},
    {l:"Profit on Cost",v:fmtPct(r.poc||0),c:(r.poc||0)>0.2?green:(r.poc||0)>0.1?amber:red},
    {l:"IRR (Unlevered)",v:fmtPct(r.irr||0),c:(r.irr||0)>=0.15?green:amber},
    {l:"IRR (Levered)",v:fmtPct(r.irrLevered||0),c:(r.irrLevered||0)>=0.15?green:amber},
    {l:"Equity Multiple",v:fmtX(r.moic||0),c:gold},
  ]:assetType==="Flip"?[
    {l:"Purchase Price",v:fmt(r.purchase||0,currencySymbol),c:white},
    {l:"Total Cost",v:fmt(r.totalCost||0,currencySymbol),c:white},
    {l:"Profit",v:fmt(r.profit||0,currencySymbol),c:(r.profit||0)>0?green:red},
    {l:"ROI on Cost",v:fmtPct(r.roi||0),c:(r.roi||0)>0.15?green:amber},
    {l:"IRR",v:fmtPct(r.irr||0),c:white},
    {l:"Equity Multiple",v:fmtX(r.moic||0),c:gold},
  ]:[
    {l:"GDV / Exit",v:fmt(r.totalGDV||r.gdv||r.exitValue||0,currencySymbol),c:gold},
    {l:"Profit",v:fmt(r.profit||0,currencySymbol),c:(r.profit||0)>0?green:red},
    {l:"Profit on Cost",v:fmtPct(r.poc||0),c:(r.poc||0)>0.2?green:(r.poc||0)>0.1?amber:red},
    {l:"IRR",v:fmtPct(r.irr||0),c:(r.irr||0)>=0.15?green:amber},
    {l:"Equity Multiple",v:fmtX(r.moic||0),c:gold},
    {l:"Equity In",v:fmt(r.equity||0,currencySymbol),c:white},
  ];
  const kCols2=3;const kW2=(W-M*2-4)/kCols2;const kH=22;
  kpiData.forEach(({l,v,c},i)=>{
    const col=i%kCols2;const row=Math.floor(i/kCols2);
    const x=M+col*(kW2+2);const y=kpiY+row*(kH+3);
    doc.setFillColor(...bg2);doc.roundedRect(x,y,kW2,kH,2,2,"F");
    doc.setDrawColor(...c);doc.setLineWidth(0.4);doc.roundedRect(x,y,kW2,kH,2,2,"S");
    doc.setTextColor(...grey);doc.setFontSize(5.5);doc.setFont("helvetica","normal");doc.text(l.toUpperCase(),x+4,y+8);
    doc.setTextColor(...c);doc.setFontSize(11);doc.setFont("helvetica","bold");doc.text(String(v),x+4,y+18);
  });








  pageFooter(doc,1);

  // ════════════════════════════════════════════════════════════
  // HOTEL — EXTENDED INSTITUTIONAL REPORT (7 pages)
  // ════════════════════════════════════════════════════════════
  if(assetType==="Hotel"){
    const hr=isHotelAdv?hotelAdv:r;
    const rooms2=Number(data.rooms)||0;
    let pageNum=2;

    // ── Helper functions ────────────────────────────────────────
    const newHotelPage=(title:string)=>{
      doc.addPage();
      doc.setFillColor(248,249,250);doc.rect(0,0,W,297,"F");
      doc.setFillColor(37,45,63);doc.rect(0,0,W,14,"F");
      doc.setTextColor(255,255,255);doc.setFontSize(10);doc.setFont("helvetica","bold");doc.text("Valora",M,10);
      doc.setTextColor(160,190,175);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text((data.name||"").toUpperCase(),W-M,10,{align:"right"});
      doc.setFillColor(42,138,100);doc.rect(0,14,W,1,"F");
      doc.setTextColor(37,45,63);doc.setFontSize(15);doc.setFont("helvetica","bold");doc.text(title,M,27);
      doc.setFillColor(42,138,100);doc.rect(M,30,W-M*2,0.4,"F");
      return 38;
    };
    const hSection=(y:number,label:string)=>{
      doc.setFillColor(37,45,63);doc.rect(M,y,W-M*2,6,"F");
      doc.setTextColor(160,200,180);doc.setFontSize(6);doc.setFont("helvetica","bold");
      doc.text(label.toUpperCase(),M+3,y+4);
      return y+9;
    };
    const hRow=(y:number,l:string,v:string,c:[number,number,number]=white,bold=false)=>{
      doc.setTextColor(...grey);doc.setFontSize(7.5);doc.setFont("helvetica","normal");doc.text(l,M+3,y);
      doc.setTextColor(...c);doc.setFont("helvetica",bold?"bold":"normal");doc.text(v,W-M,y,{align:"right"});
      doc.setFillColor(220,222,226);doc.rect(M,y+2,W-M*2,0.12,"F");
      return y+8;
    };
    const hPageFooter=(n:number)=>{
      doc.setFillColor(42,138,100);doc.rect(0,290,W,7,"F");
      doc.setTextColor(255,255,255);doc.setFontSize(6.5);doc.setFont("helvetica","bold");
      doc.text("Valora  ·  Institutional Hotel Investment Report",M,294.5);
      doc.text(`Strictly Private & Confidential  ·  Page ${n}  ·  ${today}`,W-M,294.5,{align:"right"});
    };

    // Hard clip — text physically cannot render past right margin
    const clipText=(fn:()=>void)=>{
      // Instead of jsPDF clipping (unreliable), truncate lines at right margin
      // by only rendering the portion that fits — use splitTextToSize as hard barrier
      fn();
    };
    // Tight split width so lines never exceed page — used for all body text
    const splitSafe=(text:string,w:number=W-M*2-10)=>doc.splitTextToSize(text.trim(),w);

    // ── PAGE 2: EXECUTIVE SUMMARY ───────────────────────────────
    let sp=newHotelPage("Executive Summary");
    const maxY=278; // leave room for footer
    const checkPage=()=>{ if(sp>maxY){hPageFooter(pageNum++);sp=newHotelPage("Executive Summary (cont.)");} };

    if(content.executiveSummary){
      sp=hSection(sp,"Investment Thesis");
      const esL=doc.splitTextToSize(content.executiveSummary.trim(),150);
      doc.setTextColor(...white);doc.setFontSize(8);doc.setFont("helvetica","normal");
      esL.forEach((l:string)=>{doc.text(l,M,sp);sp+=5.0;checkPage();});
      sp+=5;
    }
    if(content.dealStrengths){
      checkPage();
      sp=hSection(sp,"Investment Highlights");
      const highlights=content.dealStrengths.split(/(?<=[.!;])\s+/).map((s:string)=>s.trim()).filter((s:string)=>s.length>15).slice(0,6);
      highlights.forEach((h:string)=>{
        const hl=doc.splitTextToSize(h,148);
        const blockH=hl.length*5.2+4;
        if(sp+blockH>maxY){hPageFooter(pageNum++);sp=newHotelPage("Executive Summary (cont.)");}
        doc.setFillColor(42,138,100);doc.rect(M,sp-2,1.5,Math.max(hl.length*5.0,4),"F");
        doc.setTextColor(...white);doc.setFontSize(7.5);doc.setFont("helvetica","normal");
        hl.forEach((l:string,i:number)=>doc.text(l,M+5,sp+i*5.0));
        sp+=blockH;
      });
      sp+=3;
    }
    if(content.riskAssessment){
      checkPage();
      sp=hSection(sp,"Key Risk Factors");
      const risks=content.riskAssessment.split(/(?<=[.!;])\s+/).map((s:string)=>s.trim()).filter((s:string)=>s.length>15).slice(0,4);
      risks.forEach((h:string)=>{
        const rl=doc.splitTextToSize(h,148);
        const blockH=rl.length*5.2+4;
        if(sp+blockH>maxY){hPageFooter(pageNum++);sp=newHotelPage("Key Risk Factors (cont.)");}
        doc.setFillColor(192,64,64);doc.rect(M,sp-2,1.5,Math.max(rl.length*5.0,4),"F");
        doc.setTextColor(...white);doc.setFontSize(7.5);doc.setFont("helvetica","normal");
        rl.forEach((l:string,i:number)=>doc.text(l,M+5,sp+i*5.0));
        sp+=blockH;
      });
      sp+=3;
    }
    if(content.marketComparables){
      checkPage();
      sp=hSection(sp,"Market Context");
      const ml=doc.splitTextToSize(content.marketComparables.trim(),150);
      doc.setTextColor(...white);doc.setFontSize(8);doc.setFont("helvetica","normal");
      ml.forEach((l:string)=>{doc.text(l,M,sp);sp+=5.0;checkPage();});
    }
    hPageFooter(pageNum++);

    // ── PAGE 3: HOTEL OPERATIONS & REVENUE ─────────────────────
    sp=newHotelPage("Hotel Operations & Revenue");

    // Key metrics bar
    const kmItems=[
      {l:"Rooms",v:String(rooms2)},{l:"Star Rating",v:`${data.starRating||4} Star`},
      {l:"ADR",v:`${currencySymbol}${Number(data.adr||0).toFixed(0)}`},
      {l:"Occupancy",v:`${data.occupancy||0}%`},
      {l:"RevPAR",v:`${currencySymbol}${Math.round(Number(data.adr||0)*Number(data.occupancy||0)/100)}`},
      {l:"EBITDA pa",v:fmt(hr.ebitda||0,currencySymbol)},
    ];
    const kmW=(W-M*2-2)/kmItems.length;
    kmItems.forEach(({l,v},i)=>{
      const kx=M+i*(kmW+0.4);
      doc.setFillColor(i===4||i===5?230:248,i===4||i===5?245:249,i===4||i===5?238:250);
      doc.roundedRect(kx,sp,kmW,18,1.5,1.5,"F");
      doc.setDrawColor(i===4||i===5?42:220,i===4||i===5?138:222,i===4||i===5?100:226);
      doc.setLineWidth(0.3);doc.roundedRect(kx,sp,kmW,18,1.5,1.5,"S");
      doc.setTextColor(...grey);doc.setFontSize(5.5);doc.setFont("helvetica","normal");doc.text(l.toUpperCase(),kx+2,sp+6);
      doc.setTextColor(i===4||i===5?42:37,i===4||i===5?138:45,i===4||i===5?100:63);
      doc.setFontSize(9);doc.setFont("helvetica","bold");doc.text(v,kx+2,sp+14);
    });
    sp+=24;

    // Revenue by stream — always use calcHotelRev for stream breakdown
    sp=hSection(sp,"Revenue by Stream (pa)");
    const hotelRevStreams=calcHotelRev(data);
    const revSt:any[]=[
      ["Rooms Revenue",hotelRevStreams.roomsRev||0,green],
      ...(data.fnbEnabled&&hotelRevStreams.fnbRev>0?[["F&B Revenue",hotelRevStreams.fnbRev,white]]:[]),
      ...(data.spaEnabled&&hotelRevStreams.spaRev>0?[["Spa Revenue",hotelRevStreams.spaRev,white]]:[]),
      ...(data.gymEnabled&&hotelRevStreams.gymRev>0?[["Gym Revenue",hotelRevStreams.gymRev,white]]:[]),
      ...(data.meetingEnabled&&hotelRevStreams.meetingRev>0?[["Events Revenue",hotelRevStreams.meetingRev,white]]:[]),
    ];
    const totalStream=hotelRevStreams.totalRev||1;
    revSt.forEach((rs:any)=>{
      if(!rs)return;
      const [l,v,c]=rs;const pct=v/totalStream;
      const barMaxW=W-M*2-55;const barW=Math.max(pct*barMaxW,0.5);
      doc.setTextColor(...grey);doc.setFontSize(7.5);doc.setFont("helvetica","normal");doc.text(l,M+3,sp);
      if(barMaxW>0){doc.setFillColor(220,240,232);doc.rect(M+52,sp-4,barMaxW,6,"F");}
      if(barW>0){doc.setFillColor(42,138,100);doc.rect(M+52,sp-4,barW,6,"F");}
      doc.setTextColor(...c);doc.setFont("helvetica","bold");doc.setFontSize(7.5);
      doc.text(fmt(v,currencySymbol),W-M,sp,{align:"right"});
      doc.setTextColor(...grey);doc.setFontSize(6);
      doc.text(`${(pct*100).toFixed(0)}%`,M+52+barW+2,sp);
      sp+=9;
    });
    sp+=4;

    // Year-by-year if advanced
    if(isHotelAdv&&hr.yearRevenue?.length>0){
      sp=hSection(sp,"Year-by-Year Operating Performance");
      const yrs=hr.yearRevenue.slice(0,7);
      const yrW=(W-M*2-30)/yrs.length;
      doc.setFillColor(37,45,63);doc.rect(M,sp,W-M*2,8,"F");
      doc.setTextColor(255,255,255);doc.setFontSize(6);doc.setFont("helvetica","bold");
      doc.text("",M+3,sp+5);
      yrs.forEach((y:any,i:number)=>{
        doc.setTextColor(i===yrs.length-1?180:255,i===yrs.length-1?220:255,i===yrs.length-1?190:255);
        doc.text(`Yr ${i+1}`,M+32+i*yrW+yrW/2,sp+5,{align:"center"});
      });
      sp+=8;
      [
        {l:"Revenue",vals:yrs.map((y:any)=>fmt(y.totalRev,currencySymbol)),c:grey},
        {l:"EBITDA",vals:yrs.map((y:any)=>fmt(y.ebitda,currencySymbol)),c:green},
        {l:"GOP Margin",vals:yrs.map((y:any)=>y.totalRev>0?fmtPct(y.ebitda/y.totalRev):"—"),c:white},
        {l:"FF&E",vals:yrs.map((y:any)=>fmt(y.ffe||0,currencySymbol)),c:amber},
        {l:"NOI",vals:yrs.map((y:any)=>fmt(y.noi,currencySymbol)),c:green,bold:true},
      ].forEach(({l,vals,c,bold}:{l:string,vals:string[],c:[number,number,number],bold?:boolean},ri)=>{
        if(ri%2===0){doc.setFillColor(248,249,250);doc.rect(M,sp,W-M*2,7,"F");}
        doc.setTextColor(...grey);doc.setFontSize(7);doc.setFont("helvetica",bold?"bold":"normal");doc.text(l,M+3,sp+4.5);
        vals.forEach((v,i)=>{
          doc.setTextColor(...c);doc.setFont("helvetica",bold?"bold":"normal");
          doc.text(v,M+32+i*yrW+yrW/2,sp+4.5,{align:"center"});
        });
        sp+=7;
      });
    }
    hPageFooter(pageNum++);

    // ── PAGE 4: MARKET COMPARABLES ─────────────────────────────
    sp=newHotelPage("Market Comparables & Positioning");
    if(hotelComps){
      sp=hSection(sp,"ADR Market Benchmarks — "+hotelComps.location_identified);
      const bW3=(W-M*2-4)/3;
      ["3star","4star","5star"].forEach((key,i)=>{
        const b=hotelComps.benchmarks?.[key];if(!b)return;
        const starNum=i+3;const isCurr=starNum===Number(data.starRating||4);
        const bx=M+i*(bW3+2);
        doc.setFillColor(isCurr?225:248,isCurr?242:249,isCurr?234:250);
        doc.roundedRect(bx,sp,bW3,32,2,2,"F");
        doc.setDrawColor(isCurr?42:220,isCurr?138:222,isCurr?100:226);
        doc.setLineWidth(isCurr?0.8:0.3);doc.roundedRect(bx,sp,bW3,32,2,2,"S");
        doc.setTextColor(isCurr?42:90,isCurr?138:100,isCurr?100:120);
        doc.setFontSize(7.5);doc.setFont("helvetica","bold");
        doc.text(`${starNum} Star${isCurr?" — Yours":""}`,bx+4,sp+9);
        doc.setTextColor(37,45,63);doc.setFontSize(11);doc.setFont("helvetica","bold");
        doc.text(`${currencySymbol}${b.low}–${currencySymbol}${b.high}`,bx+4,sp+19);
        doc.setTextColor(...grey);doc.setFontSize(7);doc.setFont("helvetica","normal");
        doc.text(`Avg: ${currencySymbol}${b.avg}`,bx+4,sp+27);
      });
      sp+=38;

      // Your ADR vs market
      const myADR=Number(data.adr||0);
      const starKey=`${Math.round(Number(data.starRating||4))}star`;
      const matchingStar=hotelComps.benchmarks?.[starKey]||hotelComps.benchmarks?.["5star"]||hotelComps.benchmarks?.["4star"];
      const b4Star=matchingStar;
      if(b4Star){
        const mktAvg=Number(b4Star.avg);const diff=mktAvg>0?((myADR-mktAvg)/mktAvg)*100:0;
        const posC=diff>20?red:diff>5?amber:green;
        const bgC=diff>20?[252,235,235]:diff>5?[250,238,218]:[225,242,234];
        if(bgC&&bgC.length===3){doc.setFillColor(...bgC as any);doc.roundedRect(M,sp,W-M*2,22,2,2,"F");}
        doc.setTextColor(...posC);doc.setFontSize(8);doc.setFont("helvetica","bold");
        doc.text(`Your ADR: ${currencySymbol}${myADR}   Market Avg (${data.starRating||4}★): ${currencySymbol}${mktAvg}   Variance: ${diff>0?"+":""}${diff.toFixed(1)}%`,M+5,sp+9);
        if(hotelComps.assessment_note){
          doc.setTextColor(...grey);doc.setFontSize(7);doc.setFont("helvetica","normal");
          const aLines=doc.splitTextToSize(hotelComps.assessment_note,W-M*2-10);
          doc.text(aLines[0]||"",M+5,sp+16);
        }
        sp+=28;
      }

      if(hotelComps.market_context){
        sp=hSection(sp,"Market Context");
        const ctxL=doc.splitTextToSize(hotelComps.market_context,146);
        doc.setTextColor(...white);doc.setFontSize(8);doc.setFont("helvetica","normal");
        ctxL.slice(0,8).forEach((l:string)=>{doc.text(l,M,sp);sp+=5.0;});sp+=4;
      }

      if(hotelComps.comparable_hotels?.length>0){
        sp=hSection(sp,"Comparable Hotels");
        const hdrCols=[[M+3,"Hotel"],[M+110,"Stars"],[W-M-3,"ADR"]];
        doc.setFillColor(37,45,63);doc.rect(M,sp,W-M*2,8,"F");
        doc.setTextColor(255,255,255);doc.setFontSize(6.5);doc.setFont("helvetica","bold");
        hdrCols.forEach(([x,l])=>doc.text(l as string,x as number,sp+5,{align:x===W-M?"right":"left"}));
        sp+=8;
        hotelComps.comparable_hotels.slice(0,10).forEach((h:any,i:number)=>{
          if(i%2===0){doc.setFillColor(248,249,250);doc.rect(M,sp,W-M*2,7,"F");}
          doc.setTextColor(...white);doc.setFontSize(7.5);doc.setFont("helvetica","normal");doc.text(h.name||"",M+3,sp+4.5);
          doc.setTextColor(...grey);doc.text(h.stars?`${h.stars} Star`:"",M+110,sp+4.5);
          doc.setTextColor(42,138,100);doc.setFont("helvetica","bold");
          doc.text(h.adr_approx?`${currencySymbol}${h.adr_approx}`:"—",W-M-3,sp+4.5,{align:"right"});
          sp+=7;
        });
      }
    }else{
      doc.setFillColor(248,249,250);doc.roundedRect(M,sp,W-M*2,30,2,2,"F");
      doc.setTextColor(...grey);doc.setFontSize(9);doc.setFont("helvetica","normal");
      doc.text("Run 'Pull AI Comps' in the Revenue tab to include market comparables.",M+5,sp+18);
      sp+=36;
    }
    hPageFooter(pageNum++);

    // ── PAGE 5: FINANCIAL SUMMARY ───────────────────────────────
    sp=newHotelPage("Financial Summary");
    const halfW=(W-M*2-8)/2;
    let lPos=sp,rPos=sp;

    lPos=hSection(lPos,"P&L Summary");
    [[`Total Revenue pa`,fmt(hr.revenuePa||r.revenuePa||0,currencySymbol),grey],
     [`EBITDA pa`,fmt(hr.ebitda||0,currencySymbol),green],
     [`FF&E Reserve pa`,fmt(hr.ffePa||hr.ffe||r.ffe||0,currencySymbol),amber],
     [`NOI pa`,fmt(hr.noi||r.noi||0,currencySymbol),(hr.noi||r.noi||0)>0?green:amber],
     [``,``,white],[`Exit Value`,fmt(hr.exitValue||r.exitValue||0,currencySymbol),green],
     [`Total Investment`,fmt(hr.totalInvestment||r.totalCost||0,currencySymbol),white],
     [`Equity In`,fmt(hr.equity||r.equity||0,currencySymbol),amber],
     [`Profit`,fmt(hr.profit||r.profit||0,currencySymbol),(hr.profit||r.profit||0)>0?green:red],
     [`Return on Cost`,fmtPct(hr.poc||r.poc||0),(hr.poc||r.poc||0)>0.15?green:amber],
     [`DSCR / ICR`,(hr.dscr||r.dscr||0)>0?fmtX(hr.dscr||r.dscr||0):"—",(hr.dscr||r.dscr||0)>=1.25?green:amber],
     [`IRR (Unlevered)`,fmtPct(hr.irr||r.irr||0),(hr.irr||r.irr||0)>=0.1?green:amber],
     [`IRR (Levered)`,fmtPct(hr.irrLevered||r.irrLevered||0),(hr.irrLevered||r.irrLevered||0)>=0.1?green:red],
     [`Equity Multiple`,fmtX(hr.moic||r.moic||0),(hr.moic||r.moic||0)>=1.5?green:amber],
    ].forEach(([l,v,c]:any)=>{
      if(!l){lPos+=4;return;}
      doc.setTextColor(...grey);doc.setFontSize(7.5);doc.setFont("helvetica","normal");doc.text(l,M+3,lPos);
      doc.setTextColor(...c);doc.setFont("helvetica","bold");doc.text(v,M+halfW-2,lPos,{align:"right"});
      doc.setFillColor(220,222,226);doc.rect(M,lPos+2,halfW,0.12,"F");lPos+=8;
    });

    rPos=hSection(rPos,"Per Key Metrics");
    [[`Purchase / Key`,fmt(hr.pricePerKey||0,currencySymbol),white],
     [`CapEx / Key`,fmt(hr.capexPerKey||0,currencySymbol),amber],
     [`Exit Value / Key`,fmt(hr.exitValuePerKey||0,currencySymbol),green],
     [`EBITDA / Key`,fmt(hr.ebitdaPerKey||0,currencySymbol),green],
     [`NOI / Key`,fmt(hr.noiPerKey||0,currencySymbol),green],
     [`Entry Yield (NOI)`,fmtPct(hr.entryYieldNOI||0),white],
     [`Entry Yield (EBITDA)`,fmtPct(hr.entryYieldEBITDA||0),white],
     [`NOI Conversion`,fmtPct(hr.noiConversion||0),white],
    ].forEach(([l,v,c]:any)=>{
      const rx=M+halfW+10;
      doc.setTextColor(...grey);doc.setFontSize(7.5);doc.setFont("helvetica","normal");doc.text(l,rx+3,rPos);
      doc.setTextColor(...c);doc.setFont("helvetica","bold");doc.text(v,W-M,rPos,{align:"right"});
      doc.setFillColor(220,222,226);doc.rect(rx,rPos+2,halfW,0.12,"F");rPos+=8;
    });

    if(Math.max(lPos,rPos)-sp>0){doc.setFillColor(220,222,226);doc.rect(M+halfW+5,sp,0.3,Math.max(Math.max(lPos,rPos)-sp,0.1),"F");}

    let cy2=Math.max(lPos,rPos)+6;
    cy2=hSection(cy2,"Cost Stack");
    [[`Purchase Price`,fmt(Number(data.purchasePrice||0),currencySymbol),white],
     [`CapEx Budget`,fmt(Number(data.capexBudget||0),currencySymbol),white],
     [`SDLT`,fmt(r.sdlt||0,currencySymbol),white],
     [`Arrangement Fee`,fmt(hr.arrangementFee||r.arrangementFee||0,currencySymbol),amber],
     [`Interest (Rolled)`,fmt(hr.interestCost||r.interestCost||0,currencySymbol),amber],
     [`Total Finance Cost`,fmt(hr.totalFinanceCost||(( hr.arrangementFee||r.arrangementFee||0)+(hr.interestCost||r.interestCost||0)),currencySymbol),amber],
     [`Total Investment`,fmt(hr.totalInvestment||r.totalCost||0,currencySymbol),green],
    ].forEach(([l,v,c]:any,i)=>{
      const isTotal=i===6;
      if(isTotal){doc.setFillColor(225,242,234);doc.rect(M,cy2-3,W-M*2,10,"F");}
      doc.setTextColor(...grey);doc.setFontSize(isTotal?8:7.5);doc.setFont("helvetica",isTotal?"bold":"normal");doc.text(l,M+3,cy2);
      doc.setTextColor(...c);doc.setFont("helvetica","bold");doc.text(v,W-M,cy2,{align:"right"});
      doc.setFillColor(220,222,226);doc.rect(M,cy2+2,W-M*2,0.12,"F");cy2+=8;
    });
    hPageFooter(pageNum++);

    // ── PAGE 6: CASHFLOW ────────────────────────────────────────
    sp=newHotelPage("Investor Cashflow");
    if(isHotelAdv&&hr.yearRevenue?.length>0){
      sp=hSection(sp,"Year-by-Year Investor Cashflow");
      const yrs3=hr.yearRevenue.slice(0,7);
      const yrW3=(W-M*2-30)/(yrs3.length+1);  // +1 for Day 1 column
      doc.setFillColor(37,45,63);doc.rect(M,sp,W-M*2,8,"F");
      doc.setTextColor(255,255,255);doc.setFontSize(6);doc.setFont("helvetica","bold");
      doc.text("",M+3,sp+5);
      doc.text("Day 1",M+32+yrW3/2,sp+5,{align:"center"});
      yrs3.forEach((y:any,i:number)=>{
        doc.setTextColor(i===yrs3.length-1?180:255,i===yrs3.length-1?220:255,i===yrs3.length-1?190:255);
        doc.text(`Yr ${i+1}${i===yrs3.length-1?" *":""}`,M+32+(i+1)*yrW3+yrW3/2,sp+5,{align:"center"});
      });
      sp+=8;
      [{l:"Revenue",d1:null,vals:yrs3.map((y:any)=>y.totalRev),c:grey,bold:false},
       {l:"EBITDA",d1:null,vals:yrs3.map((y:any)=>y.ebitda),c:green,bold:false},
       {l:"FF&E Reserve",d1:null,vals:yrs3.map((y:any)=>y.ffe||0),c:amber,bold:false},
       {l:"NOI",d1:null,vals:yrs3.map((y:any)=>y.noi),c:green,bold:true},
       {l:"Equity Out",d1:-(hr.equity||r.equity||0),vals:Array(yrs3.length).fill(null),c:red,bold:false},
       {l:"Exit Proceeds",d1:null,vals:[...Array(yrs3.length-1).fill(null),hr.netExitProceeds||0],c:green,bold:true},
      ].forEach(({l,d1,vals,c,bold},ri)=>{
        if(ri%2===0){doc.setFillColor(248,249,250);doc.rect(M,sp,W-M*2,7,"F");}
        doc.setTextColor(...grey);doc.setFontSize(7);doc.setFont("helvetica",bold?"bold":"normal");doc.text(l,M+3,sp+4.5);
        doc.setTextColor(...(d1!==null&&d1!==0?red:grey));doc.setFontSize(6.5);
        doc.text(d1!==null&&d1!==0?`(${fmt(Math.abs(d1),currencySymbol)})`:"—",M+32+yrW3/2,sp+4.5,{align:"center"});
        (vals as any[]).forEach((v:any,i:number)=>{
          const isExitCell=i===yrs3.length-1&&l==="Exit Proceeds";
          doc.setTextColor(...(v===null?grey:v<0?red:c as any));
          doc.setFont("helvetica",bold||isExitCell?"bold":"normal");
          doc.text(v===null?"—":fmt(Math.abs(v),currencySymbol),M+32+(i+1)*yrW3+yrW3/2,sp+4.5,{align:"center"});
        });
        sp+=7;
      });
      sp+=4;
      doc.setTextColor(...grey);doc.setFontSize(6);doc.setFont("helvetica","normal");
      doc.text(`* Yr ${yrs3.length} includes exit proceeds`,M,sp);sp+=10;
    }

    sp=hSection(sp,"Returns Summary");
    const retKPIs=[
      {l:"Total Investment",v:fmt(hr.totalInvestment||r.totalCost||0,currencySymbol),c:white},
      {l:"Profit (pre-incentive)",v:fmt(hr.profit||r.profit||0,currencySymbol),c:(hr.profit||r.profit||0)>0?green:red},
      {l:"Return on Cost",v:fmtPct(hr.poc||r.poc||0),c:(hr.poc||r.poc||0)>0.15?green:amber},
      {l:"IRR (Unlevered)",v:fmtPct(hr.irr||r.irr||0),c:(hr.irr||r.irr||0)>=0.1?green:amber},
      {l:"IRR (Levered)",v:fmtPct(hr.irrLevered||r.irrLevered||0),c:(hr.irrLevered||r.irrLevered||0)>=0.1?green:amber},
      {l:"Equity Multiple",v:fmtX(hr.moic||r.moic||0),c:(hr.moic||r.moic||0)>=1.5?green:amber},
      {l:"DSCR / ICR",v:(hr.dscr||r.dscr||0)>0?fmtX(hr.dscr||r.dscr||0):"—",c:(hr.dscr||r.dscr||0)>=1.25?green:amber},
      {l:"Payback",v:hr.paybackMonth?`Month ${hr.paybackMonth}`:"—",c:white},
    ];
    const retCols=4;const retW=(W-M*2-2)/retCols;
    retKPIs.forEach(({l,v,c},i)=>{
      const rx=M+(i%retCols)*(retW+0.5);const ry=sp+Math.floor(i/retCols)*18;
      doc.setFillColor(255,255,255);doc.roundedRect(rx,ry,retW,14,1.5,1.5,"F");
      doc.setDrawColor(220,222,226);doc.setLineWidth(0.3);doc.roundedRect(rx,ry,retW,14,1.5,1.5,"S");
      doc.setTextColor(...grey);doc.setFontSize(5.5);doc.setFont("helvetica","normal");doc.text(l.toUpperCase(),rx+3,ry+5.5);
      doc.setTextColor(...c);doc.setFontSize(9);doc.setFont("helvetica","bold");doc.text(v,rx+3,ry+12);
    });
    sp+=Math.ceil(retKPIs.length/retCols)*18+6;

    if(data.imEnabled&&hr&&(hr.imIncentiveProfit>0||hr.imIncentiveSales>0)){
      sp=hSection(sp,"IM Incentive Fee Waterfall");
      doc.setFillColor(250,238,218);doc.roundedRect(M,sp,W-M*2,28,2,2,"F");
      doc.setDrawColor(176,120,32);doc.setLineWidth(0.3);doc.roundedRect(M,sp,W-M*2,28,2,2,"S");
      doc.setTextColor(176,120,32);doc.setFontSize(8);doc.setFont("helvetica","bold");
      doc.text("Incentive Fee Structure Applies — Pre-incentive returns shown above",M+5,sp+9);
      const feeItems=[
        [`On Sales (${fmtPct(hr.imIncentiveSalesPct||0.01)})`,fmt(hr.imIncentiveSales||0,currencySymbol)],
        [`On Profit (${fmtPct(hr.imIncentiveProfitPct||0.10)})`,fmt(hr.imIncentiveProfit||0,currencySymbol)],
        ["Total Incentive Fee",fmt((hr.imIncentiveSales||0)+(hr.imIncentiveProfit||0),currencySymbol)],
      ];
      feeItems.forEach(([l,v],i)=>{
        doc.setTextColor(...grey);doc.setFontSize(7);doc.setFont("helvetica",i===2?"bold":"normal");
        doc.text(l,M+5,sp+16+i*5);doc.text(v,W-M-5,sp+16+i*5,{align:"right"});
      });
      sp+=34;
    }
    hPageFooter(pageNum++);

    // ── PAGE 7: SENSITIVITY & ASSUMPTIONS ──────────────────────
    sp=newHotelPage("Sensitivity Analysis & Assumptions");

    sp=hSection(sp,"Sensitivity: Exit Cap Rate × ADR Shift (Profit on Cost)");
    const capRates3=[...[-1.0,-0.5,0,0.5,1.0].map(d=>(Number(data.exitCapRate||6)+d)/100)];
    const adrShifts3=[-0.10,-0.05,0,0.05,0.10];
    const totalInv3=hr.totalInvestment||r.totalCost||1;
    const baseEBITDA3=hr.ebitda||r.ebitda||0;
    const sm3=capRates3.map(cap=>adrShifts3.map(adrS=>{
      const adjE=baseEBITDA3*(1+adrS);
      const exit=cap>0?adjE/cap:0;
      return totalInv3>0?(exit-totalInv3)/totalInv3:0;
    }));
    const sCW3=(W-M*2)/(adrShifts3.length+1);const sRH3=8;
    doc.setFillColor(37,45,63);doc.rect(M,sp,W-M*2,sRH3,"F");
    doc.setTextColor(255,255,255);doc.setFontSize(6);doc.setFont("helvetica","bold");
    doc.text("Cap Rate",M+3,sp+5);
    adrShifts3.forEach((s,i)=>doc.text(`ADR ${s>0?"+":""}${(s*100).toFixed(0)}%`,M+sCW3*(i+1)+sCW3/2,sp+5,{align:"center"}));
    sp+=sRH3;
    sm3.forEach((row3,ri)=>{
      const isBaseR=ri===2;
      if(ri%2===0&&!isBaseR){doc.setFillColor(248,249,250);doc.rect(M,sp,W-M*2,sRH3,"F");}
      doc.setTextColor(...grey);doc.setFontSize(6);doc.setFont("helvetica",isBaseR?"bold":"normal");
      doc.text(`${(capRates3[ri]*100).toFixed(1)}%`,M+3,sp+5);
      row3.forEach((poc3,ci)=>{
        const c3=poc3>0.20?green:poc3>0.10?amber:red;
        const isBase3=ri===2&&ci===2;
        if(isBase3){doc.setFillColor(42,138,100);doc.rect(M+sCW3*(ci+1),sp,sCW3,sRH3,"F");}
        doc.setTextColor(...(isBase3?[255,255,255]:c3) as any);
        doc.setFont("helvetica",isBase3?"bold":"normal");doc.setFontSize(6.5);
        doc.text(`${(poc3*100).toFixed(1)}%`,M+sCW3*(ci+1)+sCW3/2,sp+5,{align:"center"});
      });
      sp+=sRH3;
    });
    [[green,">20% PoC"],[amber,"10–20% PoC"],[red,"<10% PoC"],[gold,"Base"]].forEach(([c,l],i)=>{
      doc.setFillColor(...c as any);doc.roundedRect(M+i*44,sp+3,3,3,0.5,0.5,"F");
      doc.setTextColor(...grey);doc.setFontSize(5.5);doc.text(l as string,M+i*44+5,sp+5.5);
    });
    sp+=14;

    sp=hSection(sp,"Key Assumptions");
    const asmItems=[
      ["Asset","Hotel — "+data.name],["Location",data.location||"—"],["Date",today],
      ["Rooms",String(rooms2)],["Star Rating",`${data.starRating||4} Star`],
      ["ADR",`${currencySymbol}${Number(data.adr||0).toFixed(0)}`],
      ["Occupancy",`${data.occupancy||0}%`],
      ["Exit Cap Rate",`${data.exitCapRate||6}%`],["Hold Period",`${data.holdYears||5} years`],
      ["LTC",`${data.ltc||60}%`],["Benchmark Rate",`${data.benchmarkRate||3.97}%`],
      ["Margin",`${data.marginOverBenchmark||2.75}%`],
      ["Arrangement Fee",`${data.arrangementFeePct||1.5}%`],
      ["FF&E Reserve",`${data.ffePct||3}%`],
      ["Professional Fees",`${data.professionalFeesPct||5}%`],
    ];
    const asmCW3=(W-M*2-4)/2;
    asmItems.forEach(([l,v],i)=>{
      const ax=M+(i%2)*(asmCW3+4);const ay=sp+Math.floor(i/2)*7;
      doc.setTextColor(...grey);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text(l,ax+2,ay);
      doc.setTextColor(...white);doc.setFont("helvetica","bold");doc.text(v||"—",ax+asmCW3,ay,{align:"right"});
      doc.setFillColor(220,222,226);doc.rect(ax,ay+2,asmCW3,0.12,"F");
    });
    sp+=Math.ceil(asmItems.length/2)*7+8;

    // Disclaimer
    const dY3=Math.max(sp,258);
    doc.setFillColor(248,249,250);doc.roundedRect(M,dY3,W-M*2,28,2,2,"F");
    doc.setDrawColor(220,222,226);doc.setLineWidth(0.2);doc.roundedRect(M,dY3,W-M*2,28,2,2,"S");
    doc.setTextColor(176,120,32);doc.setFontSize(6.5);doc.setFont("helvetica","bold");doc.text("IMPORTANT DISCLAIMER",M+4,dY3+7);
    const disc4=doc.splitTextToSize("This report has been prepared using the Valora platform for indicative purposes only and does not constitute financial, investment, legal or tax advice. Based on assumptions that may not reflect actual market conditions. Recipients should conduct independent due diligence. Projections are forward-looking estimates and not guaranteed. Valora accepts no liability for decisions made based on this document.",W-M*2-8);
    doc.setTextColor(...grey);doc.setFontSize(6);doc.setFont("helvetica","normal");
    disc4.slice(0,4).forEach((l:string,i:number)=>doc.text(l,M+4,dY3+13+i*4.5));
    hPageFooter(pageNum++);

    doc.save(`Valora_Hotel_Report_${(data.name||"Hotel").replace(/\s+/g,"_")}_${new Date().toISOString().slice(0,10)}.pdf`);
    return;
  }









  // ════════════════════════════════════════════════════════════
  // PAGE 2 — AI NARRATIVE
  // ════════════════════════════════════════════════════════════
  doc.addPage();doc.setFillColor(...dark);doc.rect(0,0,210,297,"F");doc.setFillColor(...gold);doc.rect(0,0,4,297,"F");
  let py2=20;
  doc.setTextColor(...white);doc.setFontSize(11);doc.setFont("helvetica","bold");doc.text("Valora",M,py2);
  doc.setTextColor(...grey);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text(data.name||"",W-M,py2,{align:"right"});py2+=12;








  const sections:[string,keyof BrochureContent][]=[
    ["Executive Summary","executiveSummary"],
    ["Investment Highlights","dealStrengths"],
    ["Risk Factors","riskAssessment"],
    ["Market Context & Comparables","marketComparables"],
  ];
  sections.forEach(([title,key])=>{
    if(!content[key])return;
    if(py2>255){doc.addPage();doc.setFillColor(...dark);doc.rect(0,0,210,297,"F");doc.setFillColor(...gold);doc.rect(0,0,4,297,"F");py2=20;}
    // Section header with gold left bar
    doc.setFillColor(...bg3);doc.rect(M,py2-2,W-M*2,10,"F");
    doc.setFillColor(...gold);doc.rect(M,py2-2,2,10,"F");
    doc.setTextColor(...gold);doc.setFontSize(9);doc.setFont("helvetica","bold");doc.text(title.toUpperCase(),M+6,py2+5);
    py2+=14;
    doc.setTextColor(...white);doc.setFontSize(8.5);doc.setFont("helvetica","normal");
    py2=wrapText(doc,String(content[key]||""),M,py2,W-M*2,5.5);
    py2+=4;
  });








  pageFooter(doc,2);








  // ════════════════════════════════════════════════════════════
  // PAGE 3 — FINANCIAL DETAIL (ALL MODELS)
  // ════════════════════════════════════════════════════════════
  doc.addPage();doc.setFillColor(...dark);doc.rect(0,0,210,297,"F");doc.setFillColor(...gold);doc.rect(0,0,4,297,"F");
  const colW3=80;const colL3=M;const colR3=M+colW3+10;
  let lY3=20;let rY3=20;








  // Header
  doc.setTextColor(...white);doc.setFontSize(11);doc.setFont("helvetica","bold");doc.text("Valora",M,20);
  doc.setTextColor(...grey);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text("FINANCIAL DETAIL",W-M,20,{align:"right"});
  doc.setFillColor(...gold);doc.rect(M,23,W-M*2,0.3,"F");lY3=28;rY3=28;








  const drawColB=(title:string,rows:[string,string,[number,number,number]?][],x:number,sy:number,w:number)=>{
    doc.setTextColor(...gold);doc.setFontSize(8);doc.setFont("helvetica","bold");doc.text(title.toUpperCase(),x,sy);
    doc.setFillColor(...gold);doc.rect(x,sy+1.5,w,0.3,"F");let ry2=sy+8;
    rows.forEach(([label,value,color],idx)=>{
      if(ry2>279)return;
      if(idx%2===0){doc.setFillColor(...bg3);doc.rect(x,ry2-4,w,7,"F");}
      doc.setTextColor(...grey);doc.setFontSize(7.5);doc.setFont("helvetica","normal");doc.text(String(label),x+2,ry2);
      doc.setTextColor(...(color||white) as [number,number,number]);doc.setFont("helvetica","bold");doc.text(String(value),x+w-1,ry2,{align:"right"});
      doc.setFont("helvetica","normal");ry2+=7;
    });return ry2+4;
  };








  if(assetType==="BTR"||assetType==="BTS"){
    lY3=drawColB("Returns",[
      ["GDV",fmt(r.gdv||0,currencySymbol),gold],["Total Units",String(r.totalUnits||0),white],
      ["Total GIA",r.totalSqft?`${r.totalSqft.toLocaleString()} sqft`:"—",white],
      ["Equity In",fmt(r.equity||0,currencySymbol),gold],
      ["Profit",fmt(r.profit||0,currencySymbol),(r.profit||0)>0?green:red],
      ["Profit on Cost",fmtPct(r.poc||0),(r.poc||0)>0.2?green:(r.poc||0)>0.1?amber:red],
      ...(assetType==="BTR"?[["Yield on Cost",fmtPct(r.yoc||0),white],["DSCR / ICR",r.dscr>0?fmtX(r.dscr):"—",r.dscr>=1.25?green:amber]] as any:[] as any),
      ["IRR (Unlevered)",fmtPct(r.irr||0),(r.irr||0)>=0.15?green:amber],
      ["IRR (Levered)",fmtPct(r.irrLevered||0),(r.irrLevered||0)>=0.15?green:amber],
      ["Equity Multiple",fmtX(r.moic||0),gold],["Payback",r.paybackMonth?`M${r.paybackMonth}`:"—",white],
    ],colL3,lY3,colW3)||lY3;
    rY3=drawColB("Cost Stack",[
      ["Land",fmt(r.landCost||0,currencySymbol),grey],["SDLT",fmt(r.sdlt||0,currencySymbol),grey],
      ["Build Cost",fmt(r.buildCost||0,currencySymbol),grey],
      ...(r.vat>0?[["VAT",fmt(r.vat,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ...(r.cil>0?[["CIL",fmt(r.cil,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ...(r.s106>0?[["S106",fmt(r.s106,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ["Finance Cost",fmt(r.totalFinanceCost||0,currencySymbol),amber],
      ["Total Cost",fmt(r.totalCost||0,currencySymbol),gold],
    ],colR3,rY3,colW3)||rY3;
    rY3=drawColB("Finance",[
      ["LTC",`${data.ltc||0}%`,white],["Loan Amount",fmt(r.loanAmount||0,currencySymbol),amber],
      ["Peak Loan Balance",fmt(r.peakLoanBalance||0,currencySymbol),amber],
      ["Arrangement Fee",fmt(r.arrangementFee||0,currencySymbol),amber],
      ["Interest (Rolled)",fmt(r.interestCost||0,currencySymbol),amber],
      ["All-in Rate",r.financeRate?`${(r.financeRate*100).toFixed(2)}%`:"—",white],
    ],colR3,rY3,colW3)||rY3;
  }else if(assetType==="Hotel"){
    const hr=isHotelAdv?hotelAdv:r;
    lY3=drawColB("P&L Summary",[
      ["Total Revenue pa",fmt(hr.revenuePa||r.revenuePa||0,currencySymbol),white],
      ["EBITDA pa",fmt(hr.ebitda||r.ebitda||0,currencySymbol),green],
      ["FF&E Reserve pa",fmt(hr.ffePa||0,currencySymbol),amber],
      ["NOI pa",fmt(hr.noi||0,currencySymbol),green],
      ["Exit Value",fmt(hr.exitValue||r.exitValue||0,currencySymbol),gold],
      ["Total Investment",fmt(hr.totalCost||r.totalInvestment||0,currencySymbol),grey],
      ["Equity In",fmt(hr.equity||r.equity||0,currencySymbol),gold],
      ["Profit",fmt(hr.profit||r.profit||0,currencySymbol),(hr.profit||r.profit||0)>0?green:red],
      ["Return on Cost",fmtPct(hr.poc||r.poc||0),(hr.poc||r.poc||0)>0.15?green:amber],
      ["DSCR / ICR",(hr.dscr||r.dscr||0)>0?fmtX(hr.dscr||r.dscr||0):"—",(hr.dscr||r.dscr||0)>=1.25?green:amber],
      ["IRR (Unlevered)",fmtPct(hr.irr||r.irr||0),(hr.irr||r.irr||0)>=0.10?green:amber],
      ["IRR (Levered)",fmtPct(hr.irrLevered||r.irrLevered||0),(hr.irrLevered||r.irrLevered||0)>=0.10?green:amber],
      ["Equity Multiple",fmtX(hr.moic||r.moic||0),gold],
    ],colL3,lY3,colW3)||lY3;
    if(isHotelAdv){
      rY3=drawColB("Per Key Metrics",[
        ["Purchase / Key",fmt(hotelAdv.pricePerKey||0,currencySymbol),white],
        ["CapEx / Key",fmt(hotelAdv.capexPerKey||0,currencySymbol),white],
        ["Exit Value / Key",fmt(hotelAdv.exitValuePerKey||0,currencySymbol),gold],
        ["EBITDA / Key",fmt(hotelAdv.ebitdaPerKey||0,currencySymbol),green],
        ["NOI / Key",fmt(hotelAdv.noiPerKey||0,currencySymbol),green],
        ["Entry Yield (NOI)",fmtPct(hotelAdv.entryYieldNOI||0),white],
        ["Entry Yield (EBITDA)",fmtPct(hotelAdv.entryYieldEBITDA||0),white],
        ["NOI Conversion",fmtPct(hotelAdv.noiConversion||0),white],
      ],colR3,rY3,colW3)||rY3;
      // Year-by-year cashflow table
      const yr=hotelAdv.yearRevenue||[];
      if(yr.length>0&&rY3<260){
        rY3+=4;
        doc.setTextColor(...gold);doc.setFontSize(7);doc.setFont("helvetica","bold");doc.text("INVESTOR CASHFLOW",colR3,rY3);
        doc.setFillColor(...gold);doc.rect(colR3,rY3+1.5,colW3,0.3,"F");rY3+=8;
        const yrCols=["",`D1`,...yr.map((_:any,i:number)=>`Y${i+1}${i===yr.length-1?"*":""}`)];
        const ycW=colW3/yrCols.length;
        doc.setFontSize(5.5);doc.setTextColor(...grey);doc.setFont("helvetica","bold");
        yrCols.forEach((h,i)=>doc.text(String(h),colR3+i*ycW+ycW/2,rY3,{align:"center"}));rY3+=5;
        [{l:"Revenue",vals:[null,...yr.map((y:any)=>y.totalRev)],c:grey},
          {l:"EBITDA",vals:[null,...yr.map((y:any)=>y.ebitda)],c:white},
          {l:"NOI",vals:[null,...yr.map((y:any)=>y.noi)],c:green},
          {l:"Equity",vals:[-(hotelAdv.equity||0),...Array(yr.length).fill(null)],c:red},
          {l:"Exit",vals:[null,...Array(yr.length-1).fill(null),hotelAdv.netExitProceeds||0],c:gold},
        ].forEach((row,ri)=>{
          if(rY3>285)return;
          if(ri%2===0){doc.setFillColor(...bg4);doc.rect(colR3,rY3-3,colW3,5.5,"F");}
          doc.setFontSize(5.5);doc.setFont("helvetica",ri===2||ri===4?"bold":"normal");
          doc.setTextColor(...row.c);doc.text(row.l,colR3+2,rY3);
          row.vals.forEach((v:any,ci:number)=>{
            if(v===null){doc.setTextColor(50,55,65);doc.text("—",colR3+(ci+1)*ycW+ycW/2,rY3,{align:"center"});}
            else{doc.setTextColor(...(v<0?red:row.c) as [number,number,number]);doc.text(fmt(Math.abs(v),currencySymbol),colR3+(ci+1)*ycW+ycW/2,rY3,{align:"center"});}
          });rY3+=5.5;
        });
        doc.setFontSize(5);doc.setTextColor(...grey);doc.text("* Including exit proceeds",colR3,rY3);rY3+=4;
      }
    }else{
      rY3=drawColB("Investment",[
        ["Purchase",fmt(r.purchasePrice||data.purchasePrice||0,currencySymbol),grey],
        ["CapEx",fmt(r.capex||0,currencySymbol),grey],
        ["Finance Cost",fmt(r.totalFinanceCost||0,currencySymbol),amber],
        ["Equity In",fmt(r.equity||0,currencySymbol),gold],
        ["Total Investment",fmt(r.totalInvestment||0,currencySymbol),gold],
        ["LTC",`${data.ltc||0}%`,white],
        ["Peak Loan",fmt(r.peakLoanBalance||0,currencySymbol),amber],
      ],colR3,rY3,colW3)||rY3;
    }
  }else if(assetType==="Flip"){
    lY3=drawColB("Returns",[
      ["Purchase Price",fmt(r.purchase||0,currencySymbol),grey],["SDLT",fmt(r.sdlt||0,currencySymbol),grey],
      ["Refurb Budget",fmt(r.refurb||0,currencySymbol),grey],
      ["Prof Fees",fmt(r.profFees||0,currencySymbol),grey],
      ["Finance Cost",fmt(r.totalFinanceCost||0,currencySymbol),amber],
      ["Total Cost",fmt(r.totalCost||0,currencySymbol),grey],["Equity In",fmt(r.equity||0,currencySymbol),gold],
      ["Sale Price",fmt(r.salePrice||0,currencySymbol),gold],["Net Proceeds",fmt(r.netProceeds||0,currencySymbol),gold],
      ...(r.cashOutRefi>100?[["Cash at Refi",fmt(r.cashOutRefi,currencySymbol),green] as [string,string,[number,number,number]]]:[] as any),
      ["Profit",fmt(r.profit||0,currencySymbol),(r.profit||0)>0?green:red],
      ["ROI on Cost",fmtPct(r.roi||0),(r.roi||0)>0.15?green:amber],
      ["Equity Multiple",fmtX(r.moic||0),gold],["IRR",fmtPct(r.irr||0),white],
    ],colL3,lY3,colW3)||lY3;
    rY3=drawColB("Finance & Programme",[
      ["Bridging Rate",`${data.bridgingRatePct||0}%pm`,white],["LTV",`${data.flipLTV||75}%`,white],
      ["Bridge Term",`${data.bridgingTermMonths||6}m`,white],
      ["Peak Loan Balance",fmt(r.peakLoanBalance||0,currencySymbol),amber],
      ["Arrangement Fee",fmt(r.arrangementFee||0,currencySymbol),amber],
      ["Bridging Interest",fmt(r.bridgingInterest||0,currencySymbol),amber],
      ["Exit Strategy",r.flipMode==="hold"?"Hold — BTL":"Sell on Completion",white],
      ...(r.flipMode==="hold"?[
        ["Refi LTV",`${data.refiLTV||75}%`,white],["Refi Rate",`${data.refiRatePct||6}% pa`,white],
        ["Hold Term",`${data.refiTermMonths||24}m`,white],
        ["Monthly Cashflow",`${currencySymbol}${Math.round(Math.abs(r.netCashflowPm||0))}/mo`,r.netCashflowPm>=0?green:red],
        ["DSCR / ICR",r.dscr>0?fmtX(r.dscr):"N/A (vacant)",r.dscr>=1.25?green:r.dscr>0?amber:grey],
      ] as any:[] as any),
    ],colR3,rY3,colW3)||rY3;
  }else{
    lY3=drawColB("Returns",[
      ["GDV / Exit",fmt(r.totalGDV||r.gdv||r.exitValue||0,currencySymbol),gold],
      ["Total Cost",fmt(r.totalCost||0,currencySymbol),grey],["Equity In",fmt(r.equity||0,currencySymbol),gold],
      ["Profit",fmt(r.profit||0,currencySymbol),(r.profit||0)>0?green:red],
      ["Profit on Cost",fmtPct(r.poc||0),(r.poc||0)>0.2?green:(r.poc||0)>0.1?amber:red],
      ["IRR",fmtPct(r.irr||0),(r.irr||0)>=0.15?green:amber],
      ["Equity Multiple",fmtX(r.moic||0),gold],
    ],colL3,lY3,colW3)||lY3;
    rY3=drawColB("Cost Stack",[
      ["Land",fmt(r.landCost||0,currencySymbol),grey],["SDLT",fmt(r.sdlt||0,currencySymbol),grey],
      ["Build / Refurb",fmt(r.buildCost||r.refurb||0,currencySymbol),grey],
      ...(r.vat>0?[["VAT",fmt(r.vat,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ...(r.cil>0?[["CIL",fmt(r.cil,currencySymbol),amber] as [string,string,[number,number,number]]]:[] as any),
      ["Finance Cost",fmt(r.totalFinanceCost||0,currencySymbol),amber],
      ["Total Cost",fmt(r.totalCost||0,currencySymbol),gold],
    ],colR3,rY3,colW3)||rY3;
  }








  pageFooter(doc,3);








  // ════════════════════════════════════════════════════════════
  // PAGE 4 — SENSITIVITY + CASHFLOW VISUAL
  // ════════════════════════════════════════════════════════════
  doc.addPage();doc.setFillColor(...dark);doc.rect(0,0,210,297,"F");doc.setFillColor(...gold);doc.rect(0,0,4,297,"F");
  let sp=20;
  doc.setTextColor(...white);doc.setFontSize(11);doc.setFont("helvetica","bold");doc.text("Valora",M,sp);
  doc.setTextColor(...grey);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text("SENSITIVITY & CASHFLOW",W-M,sp,{align:"right"});
  doc.setFillColor(...gold);doc.rect(M,sp+3,W-M*2,0.3,"F");sp+=10;








  // Cashflow bar chart
  const cfs2:number[]=r.uCfs||r.cfs||[];
  if(cfs2.length>0){
    doc.setTextColor(...gold);doc.setFontSize(8);doc.setFont("helvetica","bold");doc.text("MONTHLY CASHFLOW (UNLEVERED)",M,sp);sp+=6;
    const maxAbs2=Math.max(...cfs2.map(Math.abs),1);
    const chartH=35;const bW=Math.min((W-M*2-4)/cfs2.length,5);
    cfs2.forEach((cf,i)=>{
      const pct=Math.abs(cf)/maxAbs2;const bh=Math.max(0.5,pct*(chartH/2));
      const bx=M+2+i*(bW+0.3);const isExit=i===cfs2.length-1;
      if(cf>0){doc.setFillColor(...(isExit?gold:green));doc.rect(bx,sp+chartH/2-bh,bW,bh,"F");}
      else if(cf<0){doc.setFillColor(...red);doc.rect(bx,sp+chartH/2,bW,bh,"F");}
    });
    doc.setDrawColor(...grey);doc.setLineWidth(0.15);doc.line(M,sp+chartH/2,W-M,sp+chartH/2);
    sp+=chartH+4;
    doc.setFontSize(5.5);doc.setTextColor(...grey);
    doc.text("Month 1",M,sp);doc.text(`Exit M${cfs2.length}`,W-M,sp,{align:"right"});
    [[green,"Cash in"],[red,"Cash out"],[gold,"Exit"]].forEach(([c,l],i)=>{
      doc.setFillColor(...(c as [number,number,number]));doc.rect(M+i*35,sp+3,3,3,"F");
      doc.setTextColor(...grey);doc.text(String(l),M+i*35+5,sp+5.5);
    });
    sp+=12;
  }








  // Sensitivity table
  const drawSens2=(matrix:number[][],rowLbls:string[],colLbls:string[],title:string)=>{
    if(!matrix||matrix.length===0)return;
    doc.setTextColor(...gold);doc.setFontSize(8);doc.setFont("helvetica","bold");doc.text(title.toUpperCase(),M,sp);sp+=5;
    const cols2b=colLbls.length+1;const cw2=( W-M*2)/cols2b;const rh2=7;
    doc.setFillColor(...bg3);doc.rect(M,sp,W-M*2,rh2,"F");
    doc.setFontSize(6);doc.setTextColor(...grey);doc.setFont("helvetica","bold");
    colLbls.forEach((l,i)=>doc.text(l,M+cw2*(i+1)+cw2/2,sp+4.5,{align:"center"}));sp+=rh2;
    matrix.forEach((row,ri)=>{
      if(ri%2===0){doc.setFillColor(...bg4);doc.rect(M,sp,W-M*2,rh2,"F");}
      doc.setTextColor(...grey);doc.setFont("helvetica","normal");doc.setFontSize(6);doc.text(rowLbls[ri]||"",M+2,sp+4.5);
      row.forEach((poc,ci)=>{
        const c=poc>0.20?green:poc>0.10?amber:red;
        const isBase=ri===2&&ci===2;
        if(isBase){doc.setFillColor(...gold);doc.rect(M+cw2*(ci+1),sp,cw2,rh2,"F");}
        doc.setTextColor(...(isBase?[26,26,26] as [number,number,number]:c));doc.setFont("helvetica",isBase?"bold":"normal");
        doc.text(`${(poc*100).toFixed(1)}%`,M+cw2*(ci+1)+cw2/2,sp+4.5,{align:"center"});
      });sp+=rh2;
    });
    // Legend
    sp+=4;
    [[green,"> 20%"],[amber,"10–20%"],[red,"< 10%"],[gold,"Base"]].forEach(([c,l],i)=>{
      doc.setFillColor(...(c as [number,number,number]));doc.roundedRect(M+i*40,sp,3,3,0.5,0.5,"F");
      doc.setTextColor(...grey);doc.setFontSize(5.5);doc.text(String(l),M+i*40+5,sp+2.5);
    });sp+=9;
  };








  if(assetType==="BTR"||assetType==="BTS"){
    const sm=r.sensMatrix;
    if(sm&&sm.length>0){
      const niyBase=num(String(data.exitYield||5));
      drawSens2(sm,
        assetType==="BTS"?["+10% sale","+5% sale","Base","-5% sale","-10% sale"]:
          [`${(niyBase-0.5).toFixed(2)}%`,`${(niyBase-0.25).toFixed(2)}%`,`${niyBase.toFixed(2)}%`,`${(niyBase+0.25).toFixed(2)}%`,`${(niyBase+0.5).toFixed(2)}%`],
        ["-10%","-5%","Base","+5%","+10%"],
        assetType==="BTS"?"Sensitivity: Sale Price × Build Cost":"Sensitivity: Exit Yield × Rent Shift"
      );
    }
  }else if(assetType==="Flip"){
    const salePctSteps=[10,5,0,-5,-10];
    const refurbPctSteps=[-10,-5,0,5,10];
    const fs=salePctSteps.map(sp2=>refurbPctSteps.map(rp=>{
      const mSale=(r.salePrice||0)*(1+sp2/100);const mRefurb=(r.refurb||0)*(1+rp/100);
      const mPF=mRefurb*(num(String(data.professionalFeesPct))/100);const mC=mRefurb*(num(String(data.contingencyPct))/100);
      const mT=(r.purchase||0)+(r.sdlt||0)+mRefurb+mPF+mC+(r.other||0)+(r.totalFinanceCost||0);
      const aF=mSale*(num(String(data.agentFeePct||1.5))/100);
      return mT>0?(mSale-aF-mT)/mT:0;
    }));
    drawSens2(fs,["+10% sale","+5% sale","Base","-5% sale","-10% sale"],
      ["-10% refurb","-5% refurb","Base","+5% refurb","+10% refurb"],"Sensitivity: Sale Price × Refurb Cost");
  }else if(r.sensMatrix){
    const niyBase=num(String(data.niy||6));
    drawSens2(r.sensMatrix,
      [`${(niyBase-0.5).toFixed(2)}%`,`${(niyBase-0.25).toFixed(2)}%`,`${niyBase.toFixed(2)}%`,`${(niyBase+0.25).toFixed(2)}%`,`${(niyBase+0.5).toFixed(2)}%`],
      ["-10%","-5%","Base","+5%","+10%"],"Sensitivity: NIY × ERV Shift"
    );
  }








  // Disclaimer strip
  if(sp<260){
    const dY=Math.max(sp+4,250);
    doc.setFillColor(...bg3);doc.roundedRect(M,dY,W-M*2,32,2,2,"F");
    doc.setDrawColor(...grey);doc.setLineWidth(0.15);doc.roundedRect(M,dY,W-M*2,32,2,2,"S");
    doc.setTextColor(...amber);doc.setFontSize(6.5);doc.setFont("helvetica","bold");doc.text("DISCLAIMER",M+5,dY+7);
    const disc2="For indicative purposes only. Based on assumptions that may not reflect actual market conditions. Does not constitute financial, investment, legal or tax advice. Recipients should conduct independent due diligence. Projections are not guaranteed. Valora accepts no liability for decisions made based on this document.";
    const dL=doc.splitTextToSize(disc2,W-M*2-10);
    doc.setTextColor(...grey);doc.setFontSize(5.5);doc.setFont("helvetica","normal");
    dL.slice(0,4).forEach((l:string,i:number)=>doc.text(l,M+5,dY+14+i*5));
  }








  pageFooter(doc,4);








  doc.save(`Valora_Brochure_${(data.name||"Deal").replace(/\s+/g,"_")}_${new Date().toISOString().slice(0,10)}.pdf`);
}
































// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
function AppraisalPage(){
  const router=useRouter();


  // Checklist — writes to localStorage so dashboard can read it
  const tickChecklist = (key: string) => {
    try {
      const raw = localStorage.getItem("valora_checklist");
      const current = raw ? JSON.parse(raw) : {};
      if (!current[key]) {
        current[key] = true;
        localStorage.setItem("valora_checklist", JSON.stringify(current));
      }
    } catch(e) {}
  };
  const searchParams=useSearchParams();
  const projectId=searchParams.get("project");
  const appraisalParam=searchParams.get("appraisal");
  const[assetType,setAssetType]=useState<AssetType>("BTR");
  const[data,setData]=useState<any>({...DEFAULTS.BTR});
  const[activeTab,setActiveTab]=useState("general");
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);
  const[saveError,setSaveError]=useState<string|null>(null);
  const[loading,setLoading]=useState(false);
  const[user,setUser]=useState<any>(null);
  const[appraisalId,setAppraisalId]=useState<string|null>(null);
  const[currentProjectId,setCurrentProjectId]=useState<string|null>(projectId);
  const[streamOpen,setStreamOpen]=useState({rooms:true,fnb:false,spa:false,gym:false,meeting:false});
  const[shareModal,setShareModal]=useState(false);
  const[liveLink,setLiveLink]=useState<string|null>(null);
  const[generatingLink,setGeneratingLink]=useState(false);
  const[linkCopied,setLinkCopied]=useState(false);
  const[generatingPDF,setGeneratingPDF]=useState(false);
  const[deleteModal,setDeleteModal]=useState(false);
  const[deleting,setDeleting]=useState(false);
  const[brochureModal,setBrochureModal]=useState(false);
  const[brochurePhotos,setBrochurePhotos]=useState<string[]>([]);
  const[brochureContent,setBrochureContent]=useState<BrochureContent|null>(null);
  const[generatingBrochure,setGeneratingBrochure]=useState(false);
  const[brochureError,setBrochureError]=useState<string|null>(null);
  const[downloadingBrochure,setDownloadingBrochure]=useState(false);
  const[senseResult,setSenseResult]=useState<{overall:string;summary:string;flags:{severity:string;field:string;message:string;benchmark:string}[]}|null>(null);
  const[senseRunning,setSenseRunning]=useState(false);
  const[hotelComps,setHotelComps]=useState<any>(null);
  const[strategyYield,setStrategyYield]=useState<number>(5);
  const[strategyPsf,setStrategyPsf]=useState<string>("");
  const[strategyPsfSuggesting,setStrategyPsfSuggesting]=useState(false);
  const[strategyPsfSuggestion,setStrategyPsfSuggestion]=useState<any>(null);
  const[hotelCompsRunning,setHotelCompsRunning]=useState(false);
  const[hotelCompsError,setHotelCompsError]=useState<string|null>(null);
  const[flipComps,setFlipComps]=useState<any>(null);
  const[flipCompsRunning,setFlipCompsRunning]=useState(false);
  const[flipCompsError,setFlipCompsError]=useState<string|null>(null);
  const[urlImport,setUrlImport]=useState("");
  const[urlImporting,setUrlImporting]=useState(false);
  const[urlImportError,setUrlImportError]=useState<string|null>(null);
  const[hotelMode,setHotelMode]=useState<"simple"|"advanced">("simple");
  const[flipComplexity,setFlipComplexity]=useState<"simple"|"advanced">("simple");
  const[theme,setTheme]=useState<"dark"|"light">(()=>{
    if(typeof window!=="undefined")return(localStorage.getItem("valora-theme")||"light") as "dark"|"light";
    return "light";
  });
  useEffect(()=>{
    document.body.classList.toggle("light",theme==="light");
    localStorage.setItem("valora-theme",theme);
  },[theme]);
  const[senseError,setSenseError]=useState<string|null>(null);
  const[senseOpen,setSenseOpen]=useState(true);
  const[subscription,setSubscription]=useState<any>(null);
  useEffect(()=>{
    const init=async()=>{
      const{data:{session}}=await supabase.auth.getSession();
      if(!session){router.push("/");return;}
      setUser(session.user);
      const{data:sub}=await supabase.from("subscriptions").select("*").eq("user_id",session.user.id).maybeSingle();
      setSubscription(sub);
    };
    init();
  },[router]);
  const tier=subscription?.tier||"free";
  const isPro=tier==="professional"||tier==="enterprise";
  const isTrialing=subscription?.status==="trialing";
  useEffect(()=>{
    if(!appraisalParam||!user)return;
    const load=async()=>{
      setLoading(true);
      const{data:appr}=await supabase.from("appraisals").select("*").eq("id",appraisalParam).single();
      if(appr){
        setAppraisalId(appr.id);setCurrentProjectId(appr.project_id);
        if(appr.snapshot){const snap=appr.snapshot;const type=(snap.assetType||"BTR") as AssetType;setAssetType(type);setData({...DEFAULTS[type],...snap});setSaved(true);tickChecklist("created_appraisal");if(snap.hotelMode)setHotelMode(snap.hotelMode);if(snap.flipComplexity)setFlipComplexity(snap.flipComplexity);if(snap.hotelFinanceType)set("hotelFinanceType",snap.hotelFinanceType);}
        // MixedUse: tab handled by TABS_MU — opens on general by default
        if(appr.share_token)setLiveLink(`${window.location.origin}/share/${appr.share_token}`);
      }
      setLoading(false);
    };
    load();
  },[appraisalParam,user]);
  // When opening a brand-new project (no appraisal yet), initialise assetType from the project row
  useEffect(()=>{
    if(appraisalParam||!projectId||!user)return;
    const loadProject=async()=>{
      const{data:proj}=await supabase.from("projects").select("asset_type,currency,name,location").eq("id",projectId).single();
      if(proj&&proj.asset_type){
        const type=proj.asset_type as AssetType;
        const defaults={...DEFAULTS[type]||DEFAULTS.BTR};
        if(proj.currency)defaults.currency=proj.currency;
        if(proj.name)defaults.name=proj.name;
        if(proj.location)defaults.location=proj.location;
        setAssetType(type);
        setData(defaults);
        setActiveTab(type==="MixedUse"?"zones":"general");
      }
    };
    loadProject();
  },[projectId,appraisalParam,user]);
  const set=useCallback((field:string,value:any)=>{
    // Allow empty string so user can fully clear a field before typing new value
    setData((prev:any)=>({...prev,[field]:value===""?undefined:value}));
    setSaved(false);setSaveError(null);setSenseResult(null);setSenseError(null);
  },[]);
  const switchAssetType=(type:AssetType)=>{setAssetType(type);setData({...DEFAULTS[type]});setActiveTab("general");setSaved(false);setSaveError(null);setSenseResult(null);setSenseError(null);};
  const updateUnit=(index:number,field:string,value:any)=>{const units=[...data.units];units[index]={...units[index],[field]:value};set("units",units);};
  const addUnit=()=>{const units=[...(data.units||[])];units.push(assetType==="BTS"?{type:"New Type",count:10,salePricePsf:800,size:700}:{type:"New Type",count:10,rentPcm:2000,size:700});set("units",units);};
  const removeUnit=(i:number)=>{set("units",data.units.filter((_:any,idx:number)=>idx!==i));};
  const calc=useCallback(()=>calcAll(assetType,data),[assetType,data]);
  const results=calc();
  const hotelRev=assetType==="Hotel"?calcHotelRev(data):null;
  const hotelAdv=assetType==="Hotel"&&hotelMode==="advanced"?calcHotelAdvanced(data):null;
  // When in Hotel Advanced mode, r points to hotelAdv so all UI (Returns Summary, sidebar, sensitivity) reads one consistent calc
  const r=(assetType==="Hotel"&&hotelMode==="advanced"&&hotelAdv?hotelAdv:results) as any;
  const sensitivity=useCallback(()=>{
    if(assetType==="BTR"){
      const yields=[-0.5,-0.25,0,0.25,0.5].map(d=>num(String(data.exitYield))+d);
      const rentMults=[-0.10,-0.05,0,0.05,0.10].map(d=>1+d);
      return yields.map(y=>rentMults.map(rf=>{
        const modData={...data,exitYield:y,units:(data.units||[]).map((u:any)=>({...u,rentPcm:num(String(u.rentPcm))*rf}))};
        return calcAll("BTR",modData).poc??0;
      }));
    }
    if(assetType==="BTS"){
      const saleMults=[1.10,1.05,1,0.95,0.90];
      const buildMults=[0.90,0.95,1,1.05,1.10];
      return saleMults.map(sm=>buildMults.map(bm=>{
        const modData={...data,buildCostPsf:num(String(data.buildCostPsf||0))*bm,units:(data.units||[]).map((u:any)=>({...u,salePricePsf:num(String(u.salePricePsf||0))*sm}))};
        return calcAll("BTS",modData).poc??0;
      }));
    }
    return null;
  },[assetType,data]);
  const sensMatrix=sensitivity();
  const suggestBTSPsf=async()=>{
    if(!data.location)return;
    setStrategyPsfSuggesting(true);setStrategyPsfSuggestion(null);
    try{
      const res=await fetch("/api/btspsf",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({location:data.location,currency:data.currency||"GBP"})});
      const d=await res.json();
      if(d.avg){
        setStrategyPsfSuggestion(d);
        setStrategyPsf(String(Math.round(d.avg)));
      }
    }catch(e:any){console.error(e);}
    setStrategyPsfSuggesting(false);
  };
































































  const runFlipCompsAI=async()=>{
    if(!data.location)return;
    setFlipCompsRunning(true);setFlipCompsError(null);setFlipComps(null);
    try{
      const res=await fetch("/api/comps",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          location:data.location,
          sqft:num(String(data.propertySqft||0)),
          bedrooms:data.bedrooms||"",
          purchasePrice:data.purchasePrice||0,
          salePrice:data.salePrice||0,
          currency:data.currency||"GBP",
          assetType:"Flip",
        })
      });
      const d=await res.json();
      if(!res.ok)throw new Error(d.error||`Error ${res.status}`);
      if(!d.comparables&&!d.marketContext)throw new Error("No property data returned — try a more specific location");
      setFlipComps(d);
    }catch(e:any){
      setFlipCompsError(e.message||"Failed to fetch comparables — try again with a more specific location");
    }
    setFlipCompsRunning(false);
  };
  const handleUrlImport=async()=>{
    if(!urlImport.trim())return;
    setUrlImporting(true);setUrlImportError(null);
    try{
      const res=await fetch("/api/sensecheck",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dealSummary:`Extract property details from this listing URL: ${urlImport}\n\nI cannot access URLs, but based on the URL pattern, extract what you can. For Rightmove URLs like rightmove.co.uk/properties/123, Zoopla URLs like zoopla.co.uk/for-sale/details/123, or Zillow URLs.\n\nRespond ONLY with JSON: {"purchasePrice":number,"propertySqft":number,"location":"...","bedrooms":number,"propertyType":"...","name":"...","confidence":"high|medium|low","notes":"..."}. If you cannot determine values, use null. Currency: GBP unless URL suggests otherwise.`})});
      const d=await res.json();
      // The sensecheck API returns flags/summary — we need to check if it returned our JSON
      if(d.purchasePrice||d.location){
        if(d.purchasePrice)set("purchasePrice",d.purchasePrice);
        if(d.propertySqft)set("propertySqft",d.propertySqft);
        if(d.location)set("location",d.location);
        if(d.name)set("name",d.name);
        setUrlImport("");
      } else {
        setUrlImportError("Could not extract details — enter manually or try a different URL format");
      }
    }catch(e:any){setUrlImportError("Import failed — please enter details manually");}
    setUrlImporting(false);
  };
  const runHotelComps=async()=>{
    if(!data.location)return;
    setHotelCompsRunning(true);setHotelCompsError(null);setHotelComps(null);
    try{
      const res=await fetch("/api/hotelcomps",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({location:data.location,starRating:num(String(data.starRating||4)),currency:data.currency||"GBP",currentADR:num(String(data.adr||0))})});
      const d=await res.json();
      if(d.error)setHotelCompsError(d.error);
      else setHotelComps(d);
    }catch(e:any){setHotelCompsError(e.message||"Failed to fetch comps");}
    setHotelCompsRunning(false);
  };
































































  const runStaticChecks=useCallback(()=>{
    setSenseError(null);
    const flags:any[]=[];
    const currSym={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";
    const isUK=!data.currency||data.currency==="GBP";
    const loc=(data.location||"").toLowerCase();
    const isLondon=isUK&&(loc.includes("london")||loc.includes("ec")||loc.includes("sw")||loc.includes("se")||loc.includes("n1")||loc.includes("e1")||loc.includes("w1"));
    const isMidlands=isUK&&(loc.includes("birmingham")||loc.includes("manchester")||loc.includes("leeds")||loc.includes("sheffield")||loc.includes("nottingham"));
    if(assetType==="BTR"){
      const buildCostPsf=num(String(data.buildCostPsf));const exitYield=num(String(data.exitYield));const voidPct=num(String(data.voidPct));const ltc=num(String(data.ltc));const opexPsf=num(String(data.opexPsf));const units=data.units||[];
      const bcLow=isLondon?280:isMidlands?200:180;const bcHigh=isLondon?450:isMidlands?320:280;
      if(buildCostPsf<bcLow)flags.push({severity:"warning",field:"Build Cost psf",message:`${currSym}${buildCostPsf}psf looks low for ${isLondon?"London":isMidlands?"the Midlands":"this location"} BTR.`,benchmark:`Typical range: ${currSym}${bcLow}–${currSym}${bcHigh}psf`});
      if(buildCostPsf>bcHigh)flags.push({severity:"warning",field:"Build Cost psf",message:`${currSym}${buildCostPsf}psf is above typical range.`,benchmark:`Typical range: ${currSym}${bcLow}–${currSym}${bcHigh}psf`});
      const yLow=isLondon?3.5:isMidlands?4.5:5.0;const yHigh=isLondon?5.5:isMidlands?6.5:7.0;
      if(exitYield<yLow)flags.push({severity:"warning",field:"Exit Yield",message:`${exitYield}% exit yield is very compressed.`,benchmark:`Typical BTR exit yield: ${yLow}–${yHigh}%`});
      if(exitYield>yHigh)flags.push({severity:"info",field:"Exit Yield",message:`${exitYield}% is above market.`,benchmark:`Typical BTR exit yield: ${yLow}–${yHigh}%`});
      if(voidPct<1)flags.push({severity:"info",field:"Void %",message:`${voidPct}% void is very optimistic.`,benchmark:"Typical stabilised void: 2–5%"});
      if(voidPct>10)flags.push({severity:"warning",field:"Void %",message:`${voidPct}% void is high.`,benchmark:"Typical stabilised void: 2–5%"});
      if(ltc>75)flags.push({severity:"error",field:"LTC Ratio",message:`${ltc}% LTC exceeds most lender limits.`,benchmark:"Typical senior debt: 55–70% LTC"});
      if(opexPsf<4)flags.push({severity:"warning",field:"OpEx psf",message:`${currSym}${opexPsf}psf OpEx looks low.`,benchmark:"Typical BTR OpEx: £6–12psf pa"});
      if(isFinite(r.dscr)){
        if(r.dscr<1.25)flags.push({severity:"error",field:"DSCR / ICR",message:`DSCR of ${r.dscr?.toFixed(2)}× is below the 1.25× lender covenant minimum.`,benchmark:"Most senior lenders require ICR ≥ 1.25×"});
        else if(r.dscr<1.50)flags.push({severity:"warning",field:"DSCR / ICR",message:`DSCR of ${r.dscr?.toFixed(2)}× is thin.`,benchmark:"Stress-tested DSCR: 1.35–2.0×"});
      }
      if(isUK){
      const rentBenchmarks:Record<string,{low:number;high:number}>=isLondon?{"1":{low:1600,high:3500},"2":{low:2200,high:5000},"3":{low:3000,high:7000},"studio":{low:1200,high:2500},"penthouse":{low:4000,high:12000}}:isMidlands?{"1":{low:800,high:1400},"2":{low:1000,high:1800},"3":{low:1200,high:2200},"studio":{low:600,high:1000},"penthouse":{low:1500,high:3000}}:{"1":{low:600,high:1200},"2":{low:800,high:1600},"3":{low:1000,high:2000},"studio":{low:500,high:900},"penthouse":{low:1200,high:2500}};
      units.forEach((u:any)=>{
        const rent=num(String(u.rentPcm));const size=num(String(u.size));const type=(u.type||"").toLowerCase();
        const bedKey=type.includes("studio")?"studio":type.includes("penthouse")?"penthouse":type.includes("3")?"3":type.includes("2")?"2":"1";
        const bench=rentBenchmarks[bedKey];
        if(rent>bench.high)flags.push({severity:"warning",field:`${u.type} Rent`,message:`${currSym}${rent}pcm is above typical market range.`,benchmark:`Typical ${u.type}: ${currSym}${bench.low}–${currSym}${bench.high}pcm`});
        if(rent<bench.low)flags.push({severity:"info",field:`${u.type} Rent`,message:`${currSym}${rent}pcm looks below market.`,benchmark:`Typical ${u.type}: ${currSym}${bench.low}–${currSym}${bench.high}pcm`});
        if(size>0){const rentPsf=rent/size;if(rentPsf>5)flags.push({severity:"warning",field:`${u.type} Rent/sqft`,message:`${u.type} rent implies ${currSym}${rentPsf.toFixed(2)}/sqft/month — very high.`,benchmark:"Typical BTR: £2.50–£4.50/sqft/month in London"});}
      });
      }
    }
    if(assetType==="BTS"){
      const buildCostPsf=num(String(data.buildCostPsf));const ltc=num(String(data.ltc));const units=data.units||[];
      const avgPsf=units.length?units.reduce((s:number,u:any)=>s+num(String(u.salePricePsf)),0)/units.length:0;
      const bcLow=isLondon?260:180;const bcHigh=isLondon?420:280;
      if(buildCostPsf<bcLow)flags.push({severity:"warning",field:"Build Cost psf",message:`${currSym}${buildCostPsf}psf build cost may be understated.`,benchmark:`Typical range: ${currSym}${bcLow}–${currSym}${bcHigh}psf`});
      if(ltc>70)flags.push({severity:"error",field:"LTC Ratio",message:`${ltc}% LTC is above typical senior debt limits for BTS.`,benchmark:"Typical senior debt: 55–65% LTC"});
      if(isLondon&&avgPsf<700)flags.push({severity:"warning",field:"Sale Price psf",message:`Average sale price of ${currSym}${Math.round(avgPsf)}psf is low for London.`,benchmark:"London residential: £800–£2,000psf+"});
      const absMonths=num(String(data.absorptionMonths));const totalUnits=units.reduce((s:number,u:any)=>s+num(String(u.count)),0);
      const salesPerMonth=absMonths>0?totalUnits/absMonths:0;
      if(salesPerMonth>8)flags.push({severity:"warning",field:"Absorption Period",message:`Selling ${Math.round(salesPerMonth)} units/month implies very fast absorption.`,benchmark:"Typical: 3–6 units/month"});
    }
    if(assetType==="Hotel"){
      const occupancy=num(String(data.occupancy));const adr=num(String(data.adr));const ltc=num(String(data.ltc));const stars=num(String(data.starRating));
      if(occupancy>85)flags.push({severity:"warning",field:"Occupancy",message:`${occupancy}% stabilised occupancy is very high.`,benchmark:"Typical stabilised hotel: 68–80%"});
      if(occupancy<50)flags.push({severity:"error",field:"Occupancy",message:`${occupancy}% occupancy would make this hotel unviable.`,benchmark:"Minimum viable: ~60%"});
      if(ltc>65)flags.push({severity:"warning",field:"LTC Ratio",message:`${ltc}% LTC is aggressive for hotel financing.`,benchmark:"Hotel senior debt: 50–60% LTC"});
      if(stars===5&&adr<250)flags.push({severity:"warning",field:"ADR",message:`${currSym}${adr} ADR is low for a 5-star hotel.`,benchmark:"5-star ADR: £300–£800+"});
      if(stars===3&&adr>200)flags.push({severity:"info",field:"ADR",message:`${currSym}${adr} ADR is high for a 3-star hotel.`,benchmark:"3-star ADR: £80–£150 typical"});
      if(isFinite(r.dscr)){
        if(r.dscr<1.25)flags.push({severity:"error",field:"DSCR / ICR",message:`DSCR of ${r.dscr?.toFixed(2)}× is below the 1.25× minimum.`,benchmark:"Hotel lenders require ICR ≥ 1.25×"});
        else if(r.dscr<1.50)flags.push({severity:"warning",field:"DSCR / ICR",message:`DSCR of ${r.dscr?.toFixed(2)}× is thin.`,benchmark:"Preferred DSCR: 1.50×+"});
      }
    }
    if(assetType==="Flip"){
      const bridgingRate=num(String(data.bridgingRatePct));const purchase=num(String(data.purchasePrice));const sale=num(String(data.salePrice));
      if(bridgingRate>1.2)flags.push({severity:"warning",field:"Bridging Rate",message:`${bridgingRate}%pm is above typical bridging rates.`,benchmark:"Typical bridging: 0.6–1.0%pm"});
      if(data.flipCapStructure==="bridge_refi"&&(data.holdOccupancy||"vacant")==="vacant"&&(r.netCashflowPm||0)<0){
        const totalDrain=Math.abs((r.netCashflowPm||0)*num(String(data.refiTermMonths||24)));
        flags.push({severity:"warning",field:"Vacant hold",message:`Property is vacant during hold — negative cashflow of ${currSym}${Math.round(Math.abs(r.netCashflowPm||0))}/mo. Total equity drain: ${currSym}${Math.round(totalDrain)}.`,benchmark:"Consider letting during hold to offset mortgage payments"});
      }
      if(data.flipCapStructure==="bridge_refi"&&(r.cashOutRefi||0)<-500){
        flags.push({severity:"warning",field:"Under-refinancing",message:`Refi loan is ${currSym}${Math.round(Math.abs(r.cashOutRefi||0))} short of the bridge balance — you will need to inject this as additional equity at refinance.`,benchmark:"Increase refi LTV or reduce purchase price to close the gap"});
      }
      if(data.flipCapStructure==="bridge_refi"&&(r.cashOutRefi||0)>1000){
        flags.push({severity:"info",field:"Cash-out refi",message:`Refi releases ${currSym}${Math.round(r.cashOutRefi||0)} back to you at refinance — bridge fully repaid with surplus. Net equity deployed is ${currSym}${Math.round(r.netEquityDeployed||0)}.`,benchmark:"Equity multiple is calculated on net equity deployed after cash-out"});
      }
      if(sale<purchase)flags.push({severity:"error",field:"Sale Price",message:"Sale price is below purchase price — this deal will make a loss.",benchmark:"Sale price must exceed total cost"});
      const uplift=purchase>0?(sale-purchase)/purchase*100:0;
      if(uplift>40)flags.push({severity:"warning",field:"Sale Price",message:`${uplift.toFixed(0)}% price uplift is very high.`,benchmark:"Typical refurb uplift: 15–30%"});
    }
    if(assetType==="MixedUse"){
      const zones=(data.zones||[]);
      if(zones.length===0)flags.push({severity:"error",field:"Zones",message:"No zones configured — add at least one zone to model this deal.",benchmark:"Mixed Use requires at least one zone"});
      const totalGDV=r.totalGDV||0;
      const totalCost=r.totalCost||0;
      if(totalCost>0&&totalGDV/totalCost<1.1)flags.push({severity:"warning",field:"GDV/Cost Ratio",message:`GDV of ${fmtPct(totalGDV/totalCost-1)} above cost is thin for a mixed-use scheme.`,benchmark:"Typical target: GDV 20–35% above total cost"});
      const irr=r.irr||0;
      if(irr>0&&irr<0.10)flags.push({severity:"warning",field:"Blended IRR",message:`${fmtPct(irr)} IRR is below typical hurdle for mixed-use development.`,benchmark:"Typical mixed-use IRR hurdle: 12–18% unlevered"});
      const poc=r.poc||0;
      if(poc>0&&poc<0.15)flags.push({severity:"warning",field:"Profit on Cost",message:`${fmtPct(poc)} PoC is below typical mixed-use target.`,benchmark:"Typical mixed-use PoC: 20–30%"});
    }
    if(assetType==="Commercial"){
      const units=(data.units||[]);
      if(units.length===0)flags.push({severity:"error",field:"Units",message:"No units configured — add at least one unit to model this deal.",benchmark:"Commercial requires at least one unit"});
      const niy=num(String(data.targetNIY||data.niy||0));
      if(niy>0&&niy<4.0)flags.push({severity:"warning",field:"Exit Yield / NIY",message:`${niy}% NIY is very compressed for commercial.`,benchmark:"UK commercial: office 4.5–6%, retail 5.5–8%, industrial 4–6%"});
      if(niy>10)flags.push({severity:"info",field:"Exit Yield / NIY",message:`${niy}% NIY implies a distressed or high-risk asset.`,benchmark:"Prime commercial: 4–7%"});
      const wault=r.wault||0;
      if(wault>0&&wault<2)flags.push({severity:"warning",field:"WAULT",message:`WAULT of ${wault.toFixed(1)} years is very short — significant re-let risk.`,benchmark:"Institutional buyers prefer WAULT 5+ years"});
      const poc=r.poc||0;
      if(poc>0&&poc<0.12)flags.push({severity:"warning",field:"Profit on Cost",message:`${fmtPct(poc)} PoC is tight for a commercial deal.`,benchmark:"Typical commercial development PoC: 15–25%"});
    }
    const programme=num(String(data.programmMonths));
    if(programme<6&&(assetType==="BTR"||assetType==="BTS"))flags.push({severity:"error",field:"Programme",message:`${programme} month programme is too short.`,benchmark:`Typical ${assetType} programme: 24–48 months`});
    if(programme<12&&(assetType==="MixedUse"||assetType==="Commercial"))flags.push({severity:"warning",field:"Programme",message:`${programme} month programme is very short for this asset type.`,benchmark:"Typical mixed-use / commercial: 18–36 months"});
    const margin=num(String(data.marginOverBenchmark));
    if(margin<1.5&&assetType!=="Flip")flags.push({severity:"info",field:"Finance Margin",message:`${margin}% margin over benchmark is tight.`,benchmark:"Typical development finance margin: 2.0–3.5%"});
    const overall=flags.filter(f=>f.severity==="error").length>0?"red":flags.filter(f=>f.severity==="warning").length>=2?"amber":flags.length===0?"green":"amber";
    const summary=overall==="green"?"All assumptions look credible — no major issues identified.":overall==="amber"?`${flags.length} assumption${flags.length!==1?"s":""} to review before presenting to a lender.`:`${flags.filter((f:any)=>f.severity==="error").length} critical issue${flags.filter((f:any)=>f.severity==="error").length!==1?"s":""} identified — address before proceeding.`;
    setSenseResult({overall,summary,flags});
  },[assetType,data,r]);
  const runAISenseCheck=async()=>{
    setSenseRunning(true);setSenseError(null);setSenseResult(null);
    const currSym={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";
    const dealSummary=`Asset Type: ${assetType} | Location: ${data.location||"Not specified"} | Currency: ${data.currency}
${assetType==="BTR"||assetType==="BTS"||assetType==="Hotel"||assetType==="MixedUse"||assetType==="Commercial"?`Programme: ${data.programmMonths} months`:""}
${assetType==="BTR"?`Units: ${(data.units||[]).map((u:any)=>`${u.count}x ${u.type} @ ${currSym}${u.rentPcm}pcm (${u.size}sqft)`).join(", ")}\nExit Yield: ${data.exitYield}% | Void: ${data.voidPct}% | OpEx: ${currSym}${data.opexPsf}psf\nBuild Cost: ${currSym}${data.buildCostPsf}psf`:""}
${assetType==="BTS"?`Units: ${(data.units||[]).map((u:any)=>`${u.count}x ${u.type} @ ${currSym}${u.salePricePsf}psf (${u.size}sqft)`).join(", ")}\nBuild Cost: ${currSym}${data.buildCostPsf}psf`:""}
${assetType==="Hotel"?`Rooms: ${data.rooms} | Stars: ${data.starRating} | ADR: ${currSym}${data.adr} | Occupancy: ${data.occupancy}%\nEBITDA: ${fmt(r.ebitda,currSym)}pa | DSCR: ${fmtX(r.dscr)}`:""}
${assetType==="Flip"?`Purchase: ${fmt(r.purchase||0,currSym)} | Refurb: ${fmt(r.refurb||0,currSym)} | Sale Price: ${fmt(r.salePrice||0,currSym)}\nBridging LTV: ${data.flipLTV||75}% | Rate: ${data.bridgingRatePct||0.85}%pm | Term: ${data.bridgingTermMonths||6}m\nMode: ${data.flipMode==="hold"?"Bridge + Hold (BTL)":"Bridge + Sell"}`:""}
${assetType==="MixedUse"?`Zones: ${(data.zones||[]).map((z:any)=>`${z.label||z.type} (${z.type}) ${currSym}${z.buildCostPsf||0}psf`).join(", ")}\nTotal GDV: ${fmt(r.totalGDV||0,currSym)} | Blended IRR: ${fmtPct(r.irr||0)}`:""}
${assetType==="Commercial"?`Units: ${(data.units||[]).map((u:any)=>`${u.label||u.type}: ${currSym}${u.erv||0}psf ERV, ${u.area||0}sqm`).join(", ")}\nExit Method: ${data.exitMethod||"NIY"} | NIY: ${data.targetNIY||data.niy||0}%`:""}
Finance: ${assetType==="Flip"?`Bridging rate ${data.bridgingRatePct||0}%pm | LTV ${data.flipLTV||75}%`:`LTC ${data.ltc||0}% | Benchmark: ${data.benchmark||"SONIA"} + ${data.marginOverBenchmark||0}% | All-in: ${r.financeRate?(r.financeRate*100).toFixed(2):"N/A"}%`}
Prof Fees: ${data.professionalFeesPct||0}% | Contingency: ${data.contingencyPct||0}%
Results: GDV/Exit ${fmt(r.gdv||r.totalGDV||r.exitValue||r.salePrice||0,currSym)} | Cost ${fmt(r.totalCost||r.totalInvestment||0,currSym)} | Profit ${fmt(r.profit||0,currSym)} | PoC ${fmtPct(r.poc||r.roi||0)} | IRR ${fmtPct(r.irr||0)} | MOIC ${fmtX(r.moic||0)} | DSCR ${r.dscr&&isFinite(r.dscr)?fmtX(r.dscr):"N/A (no debt)"}`.trim();
    try{
      const response=await fetch("/api/sensecheck",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dealSummary})});
      const parsed=await response.json();
      if(parsed.error)throw new Error(parsed.error);
      setSenseResult(parsed);
    }catch(err:any){setSenseError("AI check failed — static rules still apply.");console.error(err);}
    setSenseRunning(false);
  };
  useEffect(()=>{
    if(!data.programmMonths)return;
    const timer=setTimeout(()=>runStaticChecks(),600);
    return()=>clearTimeout(timer);
  },[JSON.stringify(data),assetType]); // eslint-disable-line react-hooks/exhaustive-deps
  const save=async()=>{
    if(!user){setSaveError("Not logged in");return;}
    setSaving(true);setSaveError(null);
    try{
      // Look up user's firm_id once — used for both project and appraisal inserts
      const{data:memberRow}=await supabase.from("firm_members").select("firm_id").eq("user_id",user.id).maybeSingle();
      const userFirmId=memberRow?.firm_id||null;
      let resolvedProjectId=currentProjectId;
      if(!resolvedProjectId){
        const{data:proj,error:projErr}=await supabase.from("projects").insert({name:data.name||"New Project",location:data.location||"",asset_type:assetType,currency:data.currency||"GBP",benchmark_rate:data.benchmark||"SONIA",created_by:user.id,firm_id:userFirmId}).select().single();
        if(projErr){setSaveError(`Could not create project: ${projErr.message}${projErr.message.includes("check")?" — the asset type may not be allowed yet. Run the database migration in Supabase.":""}`);setSaving(false);return;}
        resolvedProjectId=proj.id;setCurrentProjectId(proj.id);
      }
      const payload:Record<string,any>={
        created_by:user.id,project_id:resolvedProjectId,name:data.name||"Untitled Appraisal",scenario:"base",status:"draft",
        units_omr:assetType==="BTR"?(data.units?.filter((u:any)=>u.type?.includes("OMR")).reduce((s:number,u:any)=>s+num(String(u.count)),0)||0):0,
        units_dmr:assetType==="BTR"?(data.units?.filter((u:any)=>u.type?.includes("DMR")).reduce((s:number,u:any)=>s+num(String(u.count)),0)||0):0,
        rent_omr_pcm:assetType==="BTR"?(data.units?.[0]?.rentPcm||0):0,
        exit_yield:num(String(data.exitYield||0))/100,land_cost:num(String(data.landCost||data.purchasePrice||0)),
        gdv:r.gdv||r.totalGDV||r.exitValue||r.salePrice||0,total_cost:r.totalCost||r.totalInvestment||0,profit:r.profit||0,
        profit_on_cost:r.poc||r.roi||0,irr_unlevered:r.irr||0,irr_levered:r.irrLevered||0,programme_months:num(String(data.programmMonths)),firm_id:userFirmId,
        snapshot:{
          ...data,
          assetType,
          moic:r.moic||0,
          dscr:isFinite(r.dscr)&&r.dscr!==Infinity?r.dscr:0,
          paybackMonth:r.paybackMonth||null,
          hotelMode:assetType==="Hotel"?hotelMode:"simple",
          flipComplexity:assetType==="Flip"?flipComplexity:"simple",
          ...(assetType==="Hotel"&&hotelMode==="advanced"&&hotelAdv?{hotelAdv:{
            totalCost:hotelAdv.totalCost,equity:hotelAdv.equity,profit:hotelAdv.profit,
            poc:hotelAdv.poc,moic:hotelAdv.moic,irr:hotelAdv.irr,irrLevered:hotelAdv.irrLevered,
            dscr:hotelAdv.dscr,yoc:hotelAdv.yoc,revpar:hotelAdv.revpar,revenuePa:hotelAdv.revenuePa,
            ebitda:hotelAdv.ebitda,stabilisedNOI:hotelAdv.stabilisedNOI,stabilisedEBITDA:hotelAdv.stabilisedEBITDA,
            totalNOI:hotelAdv.totalNOI,exitValue:hotelAdv.exitValue,stabilisedValue:hotelAdv.stabilisedValue,
            purchasePrice:hotelAdv.purchasePrice,pricePerKey:hotelAdv.pricePerKey,capexPerKey:hotelAdv.capexPerKey,
            exitValuePerKey:hotelAdv.exitValuePerKey,ebitdaPerKey:hotelAdv.ebitdaPerKey,
            noiPerKey:hotelAdv.noiPerKey,noiConversion:hotelAdv.noiConversion,
            entryYieldNOI:hotelAdv.entryYieldNOI,entryYieldEBITDA:hotelAdv.entryYieldEBITDA,
            sdlt:hotelAdv.sdlt,legalCosts:hotelAdv.legalCosts,arrangementFee:hotelAdv.arrangementFee,
            interestTotal:hotelAdv.interestTotal,loanAmount:hotelAdv.loanAmount,paybackMonth:hotelAdv.paybackMonth,
            imAcqFee:hotelAdv.imAcqFee,imBasePATotal:hotelAdv.imBasePATotal,
            imIncentiveProfit:hotelAdv.imIncentiveProfit,imIncentiveSales:hotelAdv.imIncentiveSales,
            yearRevenue:hotelAdv.yearRevenue,disposalCosts:hotelAdv.disposalCosts,netExitProceeds:hotelAdv.netExitProceeds,
          }}:{}),
        },
      };
      let apprResult;
      if(appraisalId){
        const{data:updated,error:updErr}=await supabase.from("appraisals").update(payload).eq("id",appraisalId).select().single();
        if(updErr){setSaveError(`Update error: ${updErr.message}`);setSaving(false);return;}
        apprResult=updated;
      }else{
        const{data:inserted,error:insErr}=await supabase.from("appraisals").insert(payload).select().single();
        if(insErr){setSaveError(`Save error: ${insErr.message}`);setSaving(false);return;}
        apprResult=inserted;
      }
      if(apprResult){setAppraisalId(apprResult.id);setSaved(true);tickChecklist("created_appraisal");tickChecklist("saved_deal");}
    }catch(err:any){setSaveError(err?.message||"Unknown error");}
    setSaving(false);
  };
  const deleteAppraisal=async()=>{
    if(!appraisalId||!user)return;setDeleting(true);
    const{error}=await supabase.from("appraisals").delete().eq("id",appraisalId);
    if(!error){router.push("/dashboard");}else{setSaveError("Delete failed");setDeleting(false);setDeleteModal(false);}
  };
  const generateLiveLink=async()=>{
    if(!appraisalId){setSaveError("Save the appraisal first");return;}
    setGeneratingLink(true);
    const token=Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);
    await supabase.from("appraisals").update({share_token:token}).eq("id",appraisalId);tickChecklist("saved_deal");
    setLiveLink(`${window.location.origin}/share/${token}`);setGeneratingLink(false);
  };
  const copyLink=async()=>{if(!liveLink)return;await navigator.clipboard.writeText(liveLink);setLinkCopied(true);setTimeout(()=>setLinkCopied(false),2000);};
  const shareEmail=()=>{if(!liveLink)return;const subject=encodeURIComponent(`Valora Appraisal: ${data.name||"Untitled"}`);const body=encodeURIComponent(`Please find the appraisal here:\n\n${liveLink}`);window.open(`mailto:?subject=${subject}&body=${body}`);};
  const shareWhatsApp=()=>{if(!liveLink)return;const text=encodeURIComponent(`Valora Appraisal — ${data.name||"Untitled"}: ${liveLink}`);window.open(`https://wa.me/?text=${text}`);};
  const handleGeneratePDF=async()=>{
    setGeneratingPDF(true);
    try{const currSym={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";await generatePDF(data,results,assetType,currSym,"");tickChecklist("generated_pdf");}
    catch(e){console.error("PDF error:",e);}
    setGeneratingPDF(false);
  };
  const handlePhotoUpload=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const files=Array.from(e.target.files||[]);
    files.slice(0,3-brochurePhotos.length).forEach(file=>{
      const reader=new FileReader();
      reader.onload=ev=>{if(ev.target?.result)setBrochurePhotos(p=>[...p,ev.target!.result as string].slice(0,3));};
      reader.readAsDataURL(file);
    });
  };
  const generateBrochure=async()=>{
    setGeneratingBrochure(true);setBrochureError(null);setBrochureContent(null);
    const currSym={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";
    const isHotelAdv=assetType==="Hotel"&&hotelMode==="advanced"&&hotelAdv;
    const dealSummary=`Asset Type: ${assetType}${isHotelAdv?" (Institutional Advanced)":""}
Project Name: ${data.name||"Unnamed"}
Location: ${data.location||"Not specified"}
Currency: ${data.currency||"GBP"}
${isHotelAdv?`Hold Period: ${data.holdYears||5} years`:`Programme: ${data.programmMonths} months`}
































































Key Financials:
- ${isHotelAdv?"Exit Value":assetType==="Flip"?"Sale Price":"GDV / Exit Value"}: ${fmt(r.gdv||r.exitValue||r.salePrice||0,currSym)}
- Total Investment: ${fmt(r.totalCost||r.totalInvestment||0,currSym)}
- Profit: ${fmt(r.profit||0,currSym)}
- Return on Cost: ${fmtPct(r.poc||r.roi||0)}
- IRR (Unlevered): ${fmtPct(r.irr||0)}
- IRR (Levered): ${fmtPct(r.irrLevered||0)}
- Equity Multiple: ${fmtX(r.moic||0)}
${isHotelAdv?`
Hotel Institutional Metrics:
- Rooms: ${data.rooms} keys
- RevPAR: ${fmt(r.revpar,currSym)}
- Total Revenue pa: ${fmt(r.revenuePa,currSym)}
- EBITDA pa: ${fmt(r.ebitda,currSym)}
- Stabilised NOI: ${fmt(hotelAdv.stabilisedNOI,currSym)}
- GOP Margin: ${r.revenuePa>0?fmtPct(r.ebitda/r.revenuePa):"—"}
- EBITDA / Key: ${fmt(hotelAdv.ebitdaPerKey,currSym)}
- NOI / Key: ${fmt(hotelAdv.noiPerKey,currSym)}
- Purchase / Key: ${fmt(hotelAdv.pricePerKey,currSym)}
- Exit Value / Key: ${fmt(hotelAdv.exitValuePerKey,currSym)}
- Entry Yield (NOI): ${fmtPct(hotelAdv.entryYieldNOI)}
- DSCR / ICR: ${isFinite(r.dscr)?fmtX(r.dscr):"N/A (no debt service)"}
- Capital Structure: ${data.capStructure||"single"}
- Exit Cap Rate: ${data.exitCapRate}%
${data.imEnabled?`- Investment Manager: Yes (Acq fee ${fmt(hotelAdv.imAcqFee,currSym)}, Base ${fmt(hotelAdv.imBasePATotal,currSym)} total)`:""}`
:assetType==="BTR"?`- Exit Yield: ${data.exitYield}%\n- Gross NOI pa: ${fmt(r.noi,currSym)}\n- DSCR: ${fmtX(r.dscr)}\n- Total Units: ${r.totalUnits}`
:assetType==="Hotel"?`- RevPAR: ${fmt(r.revpar,currSym)}\n- EBITDA pa: ${fmt(r.ebitda,currSym)}\n- DSCR: ${fmtX(r.dscr)}\n- Rooms: ${data.rooms}`
:assetType==="Flip"?`- Purchase Price: ${fmt(r.purchase||0,currSym)}\n- Sale Price: ${fmt(r.salePrice||0,currSym)}`
:""}
































































Finance: ${isHotelAdv?`${data.capStructure||"Single"} facility · Interest ${fmt(hotelAdv.interestTotal,currSym)} total hold`:`LTC ${data.ltc||"N/A"}%, All-in rate ${r.financeRate?(r.financeRate*100).toFixed(2)+"%":"N/A"}`}`.trim();
    try{
      const response=await fetch("/api/brochure",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dealSummary})});
      const parsed=await response.json();
      if(parsed.error)throw new Error(parsed.error);
      setBrochureContent(parsed);
    }catch(err:any){setBrochureError("Failed to generate — check your connection and try again.");console.error("Brochure AI error:",err);}
    setGeneratingBrochure(false);
  };
  const handleDownloadBrochure=async()=>{
    if(!brochureContent||downloadingBrochure)return;
    setDownloadingBrochure(true);
    try{
      const currSym={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";
      await generateBrochurePDF(data,r,assetType,currSym,brochureContent,brochurePhotos,hotelMode,hotelAdv,assetType==="Hotel"?hotelComps:null);
      tickChecklist("generated_pdf");
    }catch(e:any){
      console.error("Brochure PDF error:",e);
      setBrochureError("PDF generation failed — "+( e?.message||"unknown error"));
    }finally{
      setDownloadingBrochure(false);
    }
  };
  const[panelOpen,setPanelOpen]=useState(true);
  const TABS_BTR=["general","revenue","costs","finance","cashflow","analysis"];
  const TABS_BTS=["general","revenue","costs","finance","cashflow","analysis"];
  const TABS_HOTEL=hotelMode==="advanced"?["general","revenue","costs","finance","im","cashflow","analysis"]:["general","revenue","costs","finance","cashflow","analysis"];
  const TABS_FLIP=flipComplexity==="advanced"?["general","costs","finance","comps","cashflow","analysis"]:["general","costs","finance","cashflow","analysis"];
  const TABS_MU=["general","zones","costs","finance","cashflow","analysis"];
  const TABS_COM=["general","revenue","costs","finance","cashflow","analysis"];
  const TABS=assetType==="BTR"?TABS_BTR:assetType==="BTS"?TABS_BTS:assetType==="Hotel"?TABS_HOTEL:assetType==="MixedUse"?TABS_MU:assetType==="Commercial"?TABS_COM:TABS_FLIP;
  const TAB_LABELS:Record<string,string>={general:"General",revenue:"Revenue",costs:"Costs",finance:"Finance",im:"IM & Costs",cashflow:"Cash Flow",analysis:"Analysis",comps:"Comparables",zones:"Zones",};
  const ASSET_LABELS:Record<string,string>={BTR:"BTR",BTS:"BTS",Hotel:"Hotel",Flip:"Flip",MixedUse:"Mixed Use",Commercial:"Commercial"};
  const currencies=["GBP","USD","EUR","AED","SGD","AUD","JPY","CHF","CAD","HKD"];
  const benchmarks=["SONIA","SOFR","EURIBOR","EIBOR","SORA","AONIA","TONA","SARON","CORRA","HONIA"];
  const currencySymbol={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";
  if(loading)return(
    <div style={{minHeight:"100vh",background:"#0D1017",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:16,fontWeight:600,letterSpacing:"-.02em",color:"#ffffff"}}>Valora</span>
      </div>
      <div style={{width:32,height:32,border:"2px solid rgba(201,168,76,.15)",borderTopColor:"#52C498",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <div style={{fontSize:12,color:"#3d4249",letterSpacing:".06em"}}>Loading appraisal…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"var(--font-body)"}}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){var t=localStorage.getItem('valora-theme')||'light';if(t==='light')document.body.classList.add('light');})()`}}/>
      {/* Nav */}
      <div style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"0 16px",height:56,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100}}>
        <button onClick={()=>router.push("/dashboard")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
          <span style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:16,fontWeight:600,letterSpacing:"-.02em",color:"#ffffff"}}>Valora</span>
        </button>
        <div style={{width:1,height:18,background:"var(--border)",flexShrink:0}}/>
        <button onClick={()=>router.push("/dashboard")} className="btn-ghost" style={{padding:"5px 10px",fontSize:11,flexShrink:0}}>← Back</button>
        <div style={{flex:1}}/>
        <div className="save-indicator" style={{flexShrink:0}}>
          {saving&&<><span style={{width:12,height:12,border:"1.5px solid var(--gold)",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite",flexShrink:0}}/></>}
          {saved&&!saving&&<><span style={{color:"var(--green)",fontSize:14}}>✓</span><span style={{fontSize:11}}>Saved</span></>}
          {saveError&&!saving&&<span style={{color:"var(--red)",fontSize:10,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{saveError}</span>}
          {!saved&&!saving&&!saveError&&<span style={{fontSize:11,animation:"pulse 2s infinite",color:"var(--amber)"}}>Unsaved</span>}
        </div>
        {appraisalId&&saved&&<button className="btn-danger" onClick={()=>setDeleteModal(true)} style={{flexShrink:0,padding:"5px 10px",fontSize:11}}>Delete</button>}
        <button className="btn-primary" onClick={save} disabled={saving} style={{padding:"8px 14px",fontSize:12,flexShrink:0}}>{saving?"…":"Save"}</button>
      </div>
      {/* Asset switcher */}
      <div style={{background:"var(--bg2)",borderBottom:"1px solid var(--border)",padding:"0 12px",display:"flex",alignItems:"center",gap:5,height:42,overflowX:"auto",flexShrink:0}}>
        <span style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginRight:2,flexShrink:0}}>Type:</span>
        {(["BTR","BTS","Hotel","Flip","MixedUse","Commercial"] as AssetType[]).map(t=>(
          <button key={t} onClick={()=>{if(appraisalId)return;switchAssetType(t);}} style={{padding:"3px 10px",borderRadius:5,fontSize:11,fontWeight:600,cursor:appraisalId?"not-allowed":"pointer",border:"1px solid",background:assetType===t?"rgba(201,168,76,.12)":"transparent",borderColor:assetType===t?"var(--gold)":"var(--border)",color:assetType===t?"var(--gold)":"var(--text-d)",fontFamily:"var(--font-body)",transition:"all .2s",opacity:appraisalId&&assetType!==t?0.35:1,flexShrink:0,whiteSpace:"nowrap"}}>{ASSET_LABELS[t]||t}</button>
        ))}
        {appraisalId&&<span style={{fontSize:9,color:"var(--text-d)",flexShrink:0}}>· locked</span>}
        <div style={{flex:1,minWidth:6}}/>
        {/* Simple / Advanced toggle — Hotel only, lives in the header bar */}
        {assetType==="Hotel"&&(
          <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
            <span style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em"}}>Mode:</span>
            <div style={{display:"flex",border:"1px solid var(--border)",borderRadius:6,overflow:"hidden"}}>
              {(["simple","advanced"] as const).map(m=>(
                <button key={m} onClick={()=>setHotelMode(m)} style={{padding:"3px 12px",background:hotelMode===m?"var(--gold)":"transparent",color:hotelMode===m?"#0D1017":"var(--text-d)",border:"none",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"var(--font-body)",transition:"all .15s",whiteSpace:"nowrap"}}>
                  {m==="simple"?"Simple":"Advanced"}
                </button>
              ))}
            </div>
          </div>
        )}
        {assetType==="Flip"&&(
          <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
            <span style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em"}}>Mode:</span>
            <div style={{display:"flex",border:"1px solid var(--border)",borderRadius:6,overflow:"hidden"}}>
              {(["simple","advanced"] as const).map(m=>(
                <button key={m} onClick={()=>setFlipComplexity(m)} style={{padding:"3px 12px",background:flipComplexity===m?"var(--gold)":"transparent",color:flipComplexity===m?"#0D1017":"var(--text-d)",border:"none",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"var(--font-body)",transition:"all .15s",whiteSpace:"nowrap"}}>
                  {m==="simple"?"Simple":"Advanced"}
                </button>
              ))}
            </div>
          </div>
        )}
        <input className="inp name-inp" value={data.name} onChange={e=>set("name",e.target.value)} placeholder="Name…" style={{padding:"4px 8px",fontSize:12,flexShrink:1,minWidth:0,width:120}}/>
      </div>
      <div className="editor-layout" style={{display:"grid",gridTemplateColumns:"1fr 320px",minHeight:"calc(100vh - 102px)"}}>
        <div className="editor-main" style={{borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column"}}>
          <div style={{background:"var(--bg2)",borderBottom:"1px solid var(--border)",display:"flex",overflowX:"auto",padding:"0 16px"}}>
            {TABS.map(t=><button key={t} className={`tab ${activeTab===t?"active":""}`} onClick={()=>setActiveTab(t)}>{TAB_LABELS[t]}</button>)}
          </div>
          <div style={{padding:24,overflowY:"auto",flex:1}} className="editor-pad">
            {/* GENERAL */}
            {activeTab==="general"&&(
              <div>
































































                <div className="section-title">Project Details</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Project Name</label><input className="inp" value={data.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Chiswick Tower"/></div>
                  <div className="inp-group"><label className="inp-label">Location</label><input className="inp" value={data.location} onChange={e=>set("location",e.target.value)} placeholder="e.g. Hammersmith, London" readOnly={!!appraisalId} style={{cursor:appraisalId?"not-allowed":"text",opacity:appraisalId?0.6:1}}/></div>
                </div>
                <div className="inp-row-3">
                  <div className="inp-group"><label className="inp-label">Currency</label><select className="inp" value={data.currency} onChange={e=>set("currency",e.target.value)}>{currencies.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div className="inp-group"><label className="inp-label">Benchmark Rate</label><select className="inp" value={data.benchmark} onChange={e=>set("benchmark",e.target.value)}>{benchmarks.map(b=><option key={b}>{b}</option>)}</select></div>
                  <div className="inp-group"><label className="inp-label">{data.benchmark} Rate (%)</label><input className="inp" type="number" step="0.01" value={data.benchmarkRate??""} onChange={e=>set("benchmarkRate",e.target.value)}/></div>
                </div>
                {assetType!=="Flip"&&(
                  <>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Programme (months)</label><input className="inp" type="number" value={data.programmMonths??""} onChange={e=>set("programmMonths",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Stabilisation (months)</label><input className="inp" type="number" value={data.stabilisationMonths??""} onChange={e=>set("stabilisationMonths",e.target.value)}/></div>
                    </div>
                    <div className="inp-group"><label className="inp-label">Cost Profile</label><select className="inp" value={data.costProfile} onChange={e=>set("costProfile",e.target.value)}><option value="scurve">S-Curve (recommended)</option><option value="straight">Straight-Line</option><option value="frontloaded">Front-Loaded</option></select></div>
                  </>
                )}
                {assetType==="Flip"&&(
                  <>
                    <div style={{height:1,background:"var(--border)",margin:"16px 0"}}/>
                    <div className="section-title">Programme</div>
                    <div className="inp-row">
                      <div className="inp-group">
                        <label className="inp-label">Construction Period (months)</label>
                        <input className="inp" type="number" min="1" value={data.bridgingTermMonths??""} onChange={e=>set("bridgingTermMonths",e.target.value)}/>
                        <div style={{fontSize:10,color:"var(--text-d)",marginTop:3}}>Refurb / fit-out period — drives bridging finance</div>
                      </div>
                      {(data.flipMode||"sell")==="sell"&&(
                        <div className="inp-group">
                          <label className="inp-label">Sell Period (months)</label>
                          <input className="inp" type="number" min="0" value={data.sellMonths??""} onChange={e=>set("sellMonths",e.target.value)}/>
                          <div style={{fontSize:10,color:"var(--text-d)",marginTop:3}}>Marketing + conveyancing after completion</div>
                        </div>
                      )}
                      {(data.flipCapStructure||"bridge")==="bridge_refi"&&(
                        <div className="inp-group">
                          <label className="inp-label">Hold Period (months)</label>
                          <input className="inp" type="number" min="1" value={data.refiTermMonths??""} onChange={e=>set("refiTermMonths",e.target.value)}/>
                          <div style={{fontSize:10,color:"var(--text-d)",marginTop:3}}>BTL hold period after bridge repaid</div>
                        </div>
                      )}
                    </div>
                    <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 14px",marginBottom:16}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                        <span style={{color:"var(--text-d)"}}>Construction</span>
                        <span style={{fontFamily:"var(--font-mono)",color:"var(--text)"}}>{data.bridgingTermMonths||6}m</span>
                      </div>
                      {(data.flipMode||"sell")==="sell"&&(
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginTop:4}}>
                          <span style={{color:"var(--text-d)"}}>Sell period</span>
                          <span style={{fontFamily:"var(--font-mono)",color:"var(--text)"}}>{data.sellMonths||3}m</span>
                        </div>
                      )}
                      {(data.flipCapStructure||"bridge")==="bridge_refi"&&(
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginTop:4}}>
                          <span style={{color:"var(--text-d)"}}>Hold period</span>
                          <span style={{fontFamily:"var(--font-mono)",color:"var(--text)"}}>{data.refiTermMonths||24}m</span>
                        </div>
                      )}
                      <div style={{height:1,background:"var(--border)",margin:"6px 0"}}/>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                        <span style={{color:"var(--text-m)",fontWeight:600}}>Total programme</span>
                        <span style={{fontFamily:"var(--font-mono)",color:"var(--gold)",fontWeight:600}}>
                          {(data.flipMode||"sell")==="sell"
                            ?(num(String(data.bridgingTermMonths||6))+num(String(data.sellMonths||3)))+"m"
                            :(num(String(data.bridgingTermMonths||6))+num(String(data.refiTermMonths||24)))+"m"
                          }
                        </span>
                      </div>
                    </div>
                  </>
                )}
                {/* Advanced Hotel — additional property details */}
                {assetType==="Hotel"&&hotelMode==="advanced"&&(
                  <>
                    <div style={{height:1,background:"var(--border)",margin:"20px 0"}}/>
                    <div className="section-title">Property Details</div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Address</label><input className="inp" value={data.address||""} onChange={e=>set("address",e.target.value)} placeholder="10 Pepys Street, London EC3N"/></div>
                      <div className="inp-group"><label className="inp-label">Tenure</label><select className="inp" value={data.tenure||"freehold"} onChange={e=>set("tenure",e.target.value)}><option value="freehold">Freehold</option><option value="leasehold">Leasehold</option><option value="share">Share of Freehold</option></select></div>
                    </div>
                    <div className="inp-row-3">
                      <div className="inp-group"><label className="inp-label">GFA (sqm)</label><input className="inp" type="number" value={data.gfaSqm??""} onChange={e=>set("gfaSqm",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Avg Room Size (sqm)</label><input className="inp" type="number" value={data.avgRoomSqm??""} onChange={e=>set("avgRoomSqm",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">No. of Floors</label><input className="inp" type="number" value={data.floors??""} onChange={e=>set("floors",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Year Built</label><input className="inp" type="number" value={data.yearBuilt??""} onChange={e=>set("yearBuilt",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Last Renovated</label><input className="inp" type="number" value={data.yearRenovated??""} onChange={e=>set("yearRenovated",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Hold Period (years)</label><select className="inp" value={data.holdYears??""} onChange={e=>set("holdYears",e.target.value)}>{[3,5,7,10].map(y=><option key={y} value={y}>{y} years</option>)}</select></div>
                      <div className="inp-group"><label className="inp-label">Brand / Franchise</label><input className="inp" value={data.brandFranchise||""} onChange={e=>set("brandFranchise",e.target.value)} placeholder="e.g. Accor / Pullman"/></div>
                    </div>
                    <div style={{height:1,background:"var(--border)",margin:"20px 0"}}/>
                    <div className="section-title">Facilities</div>
                    <div className="inp-row-3">
                      <div className="inp-group"><label className="inp-label">Meeting Rooms</label><input className="inp" type="number" value={data.meetingRoomCount??""} onChange={e=>set("meetingRoomCount",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Meeting Area (sqm)</label><input className="inp" type="number" value={data.meetingAreaSqm??""} onChange={e=>set("meetingAreaSqm",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Fitness Centre</label><select className="inp" value={data.hasFitness?"yes":"no"} onChange={e=>set("hasFitness",e.target.value==="yes")}><option value="yes">Yes</option><option value="no">No</option></select></div>
                    </div>
                  </>
                )}
              </div>
            )}
            {/* REVENUE BTR */}
            {activeTab==="revenue"&&assetType==="BTR"&&(
              <div>
                <div className="section-title">Unit Mix & Rents</div>
                <div className="unit-row" style={{borderBottom:"1px solid var(--gold)44"}}>
                  {["Unit Type","Count","Rent (pcm)","Size (sqft)"].map((h,i)=><div key={i} style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".07em"}}>{h}</div>)}
                  <div className="unit-gross" style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".07em"}}>Gross Pa</div>
                  <div/>
                </div>
                {(data.units||[]).map((u:any,i:number)=>{
                  const grossPa=num(String(u.count))*num(String(u.rentPcm))*12;
                  return(<div key={i} className="unit-row">
                    <input className="inp" value={u.type} onChange={e=>updateUnit(i,"type",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <input className="inp" type="number" value={u.count} onChange={e=>updateUnit(i,"count",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <input className="inp" type="number" value={u.rentPcm} onChange={e=>updateUnit(i,"rentPcm",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <input className="inp" type="number" value={u.size} onChange={e=>updateUnit(i,"size",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <div className="unit-gross" style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-m)"}}>{fmt(grossPa,currencySymbol)}</div>
                    <button onClick={()=>removeUnit(i)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:16,padding:0}}>×</button>
                  </div>);
                })}
                <button className="btn-ghost" onClick={addUnit} style={{marginTop:12,fontSize:11}}>+ Add Unit Type</button>
                <div className="section-title" style={{marginTop:28}}>Exit Assumptions</div>
                <div className="inp-row-3">
                  <div className="inp-group"><label className="inp-label">Exit Yield (%)</label><input className="inp" type="number" step="0.05" value={data.exitYield??""} onChange={e=>set("exitYield",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">NIY (%)</label><input className="inp" type="number" step="0.05" value={data.niy??""} onChange={e=>set("niy",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Void (%)</label><input className="inp" type="number" step="0.1" value={data.voidPct??""} onChange={e=>set("voidPct",e.target.value)}/></div>
                </div>
                <div className="inp-group"><label className="inp-label">OpEx (psf pa)</label><input className="inp" type="number" value={data.opexPsf??""} onChange={e=>set("opexPsf",e.target.value)}/></div>
              </div>
            )}
            {/* REVENUE BTS */}
            {activeTab==="revenue"&&assetType==="BTS"&&(
              <div>
                <div className="section-title">Unit Mix & Sales</div>
                <div className="unit-row" style={{borderBottom:"1px solid var(--gold)44"}}>
                  {["Unit Type","Count","Price (psf)","Size (sqft)"].map((h,i)=><div key={i} style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".07em"}}>{h}</div>)}
                  <div className="unit-gross" style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".07em"}}>Revenue</div>
                  <div/>
                </div>
                {(data.units||[]).map((u:any,i:number)=>{
                  const rev=num(String(u.count))*num(String(u.size))*num(String(u.salePricePsf));
                  return(<div key={i} className="unit-row">
                    <input className="inp" value={u.type} onChange={e=>updateUnit(i,"type",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <input className="inp" type="number" value={u.count} onChange={e=>updateUnit(i,"count",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <input className="inp" type="number" value={u.salePricePsf} onChange={e=>updateUnit(i,"salePricePsf",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <input className="inp" type="number" value={u.size} onChange={e=>updateUnit(i,"size",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <div className="unit-gross" style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-m)"}}>{fmt(rev,currencySymbol)}</div>
                    <button onClick={()=>removeUnit(i)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:16,padding:0}}>×</button>
                  </div>);
                })}
                <button className="btn-ghost" onClick={addUnit} style={{marginTop:12,fontSize:11}}>+ Add Unit Type</button>
                <div className="section-title" style={{marginTop:28}}>Sales Costs</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Agent Fee (%)</label><input className="inp" type="number" step="0.1" value={data.agentFeePct??""} onChange={e=>set("agentFeePct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Marketing (%)</label><input className="inp" type="number" step="0.1" value={data.marketingPct??""} onChange={e=>set("marketingPct",e.target.value)}/></div>
                </div>
                <div className="inp-group"><label className="inp-label">Absorption Period (months)</label><input className="inp" type="number" value={data.absorptionMonths??""} onChange={e=>set("absorptionMonths",e.target.value)}/></div>
              </div>
            )}
            {/* REVENUE HOTEL */}
            {activeTab==="revenue"&&assetType==="Hotel"&&(
              <div>
                {/* Advanced — year by year ADR + occupancy */}
                {hotelMode==="advanced"&&(
                  <div style={{marginBottom:20}}>
                    <div className="section-title">Year-by-Year Assumptions</div>
                    <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12}}>Set ADR and occupancy per year — disruption year(s) will show lower performance during renovation</div>
                    <div style={{overflowX:"auto"}}>
                      <div style={{display:"grid",gridTemplateColumns:`80px repeat(${data.holdYears||5},1fr)`,gap:6,minWidth:400}}>
                        <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em",paddingBottom:4}}/>
                        {Array.from({length:data.holdYears||5},(_,i)=>(
                          <div key={i} style={{fontSize:9,color:i===0?"var(--amber)":"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em",textAlign:"center",paddingBottom:4}}>
                            Yr {i+1}{i===0?" (disrupt.)":""}
                          </div>
                        ))}
                        <div style={{fontSize:10,color:"var(--text-m)",display:"flex",alignItems:"center"}}>ADR ({currencySymbol})</div>
                        {Array.from({length:data.holdYears||5},(_,i)=>(
                          <input key={i} className="inp" type="number" style={{padding:"5px 8px",fontSize:11,textAlign:"center"}}
                            value={(data.yearAdr||[])[i]??data.adr??180}
                            onChange={e=>{const arr=[...(data.yearAdr||Array(data.holdYears||5).fill(data.adr||180))];arr[i]=e.target.value;set("yearAdr",arr);}}
                          />
                        ))}
                        <div style={{fontSize:10,color:"var(--text-m)",display:"flex",alignItems:"center"}}>Occ (%)</div>
                        {Array.from({length:data.holdYears||5},(_,i)=>(
                          <input key={i} className="inp" type="number" style={{padding:"5px 8px",fontSize:11,textAlign:"center"}}
                            value={(data.yearOcc||[])[i]??data.occupancy??72}
                            onChange={e=>{const arr=[...(data.yearOcc||Array(data.holdYears||5).fill(data.occupancy||72))];arr[i]=e.target.value;set("yearOcc",arr);}}
                          />
                        ))}
                        <div style={{fontSize:10,color:"var(--text-d)",display:"flex",alignItems:"center"}}>RevPAR</div>
                        {Array.from({length:data.holdYears||5},(_,i)=>{
                          const adr=num(String((data.yearAdr||[])[i]??data.adr??180));
                          const occ=num(String((data.yearOcc||[])[i]??data.occupancy??72))/100;
                          return<div key={i} style={{padding:"5px 8px",background:"var(--bg3)",borderRadius:5,fontSize:11,fontFamily:"var(--font-mono)",color:"var(--blue)",textAlign:"center"}}>{currencySymbol}{Math.round(adr*occ)}</div>;
                        })}
                      </div>
                    </div>
                    {hotelAdv&&(
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:12}}>
                        {[
                          ["Stabilised NOI",fmt(hotelAdv.stabilisedNOI,currencySymbol),"var(--green)"],
                          ["Stabilised EBITDA",fmt(hotelAdv.stabilisedEBITDA,currencySymbol),"var(--gold)"],
                          ["Total NOI (hold)",fmt(hotelAdv.totalNOI,currencySymbol),"var(--blue)"],
                        ].map(([l,v,c])=>(
                          <div key={l} style={{background:"var(--bg3)",borderRadius:8,padding:"10px 12px",border:"1px solid var(--border)"}}>
                            <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{l}</div>
                            <div style={{fontFamily:"var(--font-mono)",fontSize:14,fontWeight:600,color:c}}>{v}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="section-title">Hotel Revenue Streams</div>
                <RevStream title="Rooms" icon="" enabled={true} onToggle={()=>{}} summary={fmt(hotelRev?.roomsRev||0,currencySymbol)+" pa"} open={streamOpen.rooms} onOpen={()=>setStreamOpen(s=>({...s,rooms:!s.rooms}))}>
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">Number of Rooms</label><input className="inp" type="number" value={data.rooms??""} onChange={e=>set("rooms",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Star Rating</label><select className="inp" value={data.starRating} onChange={e=>set("starRating",e.target.value)}>{[3,4,5].map(s=><option key={s}>{s}</option>)}</select></div>
                  </div>
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">ADR ({currencySymbol})</label><input className="inp" type="number" value={data.adr??""} onChange={e=>set("adr",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Occupancy (%)</label><input className="inp" type="number" value={data.occupancy??""} onChange={e=>set("occupancy",e.target.value)}/></div>
                  </div>
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">Rooms GOP Margin (%)</label><input className="inp" type="number" value={data.roomsMarginPct??""} onChange={e=>set("roomsMarginPct",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">RevPAR Growth (%pa)</label><input className="inp" type="number" step="0.1" value={data.revparGrowthPct} onChange={e=>set("revparGrowthPct",e.target.value)}/></div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"var(--bg3)",borderRadius:6,fontSize:12}}>
                    <span style={{color:"var(--text-m)"}}>Rooms Revenue pa</span>
                    <span style={{fontFamily:"var(--font-mono)",color:"var(--gold)"}}>{fmt(hotelRev?.roomsRev||0,currencySymbol)}</span>
                  </div>
                  {/* ── ADR BENCHMARKS ── */}
                  {(()=>{
                    const loc=(data.location||"").toLowerCase();
                    const stars=num(String(data.starRating||4));
                    const adr=num(String(data.adr||0));
                    const currSym2={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$"}[data.currency]||"£";
                    // Static benchmarks: [city_keywords, 3star, 4star, 5star] [low,high]
                    const CITY_BENCHMARKS:{keywords:string[];name:string;b3:[number,number];b4:[number,number];b5:[number,number]}[]=[
                      {keywords:["london","ec","wc","sw1","w1","e1","se1"],name:"London",b3:[90,160],b4:[180,320],b5:[350,900]},
                      {keywords:["manchester","salford"],name:"Manchester",b3:[70,120],b4:[130,220],b5:[220,380]},
                      {keywords:["edinburgh","glasgow"],name:"Scotland",b3:[75,130],b4:[140,240],b5:[240,420]},
                      {keywords:["birmingham","leeds","liverpool","sheffield","bristol"],name:"UK Regional",b3:[65,110],b4:[120,200],b5:[200,350]},
                      {keywords:["dubai","abu dhabi","uae"],name:"Dubai/UAE",b3:[120,200],b4:[200,380],b5:[380,1200]},
                      {keywords:["new york","nyc","manhattan"],name:"New York",b3:[150,250],b4:[280,500],b5:[500,1500]},
                      {keywords:["paris","france"],name:"Paris",b3:[100,180],b4:[200,380],b5:[380,1100]},
                      {keywords:["lisbon","porto","portugal"],name:"Lisbon",b3:[80,140],b4:[150,260],b5:[260,500]},
                      {keywords:["amsterdam","netherlands"],name:"Amsterdam",b3:[100,170],b4:[180,320],b5:[320,700]},
                      {keywords:["singapore"],name:"Singapore",b3:[120,200],b4:[220,400],b5:[400,900]},
                      {keywords:["miami","los angeles","san francisco","chicago"],name:"US Major City",b3:[130,220],b4:[250,450],b5:[450,1200]},
                    ];
                    const matched=CITY_BENCHMARKS.find(c=>c.keywords.some(k=>loc.includes(k)))||{name:"International",b3:[70,130],b4:[140,250],b5:[250,600]};
                    const benchmarks=[
                      {stars:3,label:"3★",range:matched.b3,color:"var(--text-m)"},
                      {stars:4,label:"4★",range:matched.b4,color:"var(--amber)"},
                      {stars:5,label:"5★",range:matched.b5,color:"var(--gold)"},
                    ];
                    const selected=benchmarks.find(b=>b.stars===stars)||benchmarks[1];
                    const [low,high]=selected.range;
                    const inRange=adr>=low&&adr<=high;
                    const above=adr>high;
                    const statusColor=inRange?"var(--green)":above?"var(--amber)":"var(--red)";
                    const statusText=inRange?"Within range":above?"Above typical range":"Below typical range";
                    return(
                      <div style={{marginTop:12,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:12}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                          <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em"}}>ADR Benchmarks — {matched.name}</div>
                          {adr>0&&<div style={{fontSize:9,color:statusColor,background:statusColor+"14",border:`1px solid ${statusColor}30`,borderRadius:10,padding:"2px 8px",fontWeight:600}}>{statusText}</div>}
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
                          {benchmarks.map(b=>(
                            <div key={b.stars} style={{background:b.stars===stars?"var(--bg4)":"var(--bg2)",border:`1px solid ${b.stars===stars?b.color+"44":"var(--border)"}`,borderRadius:6,padding:"8px 10px",textAlign:"center"}}>
                              <div style={{fontSize:10,color:b.stars===stars?b.color:"var(--text-d)",fontWeight:600,marginBottom:3}}>{b.label}</div>
                              <div style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--text-m)"}}>{currSym2}{b.range[0]}–{currSym2}{b.range[1]}</div>
                              {b.stars===stars&&adr>0&&(
                                <div style={{marginTop:4,height:3,background:"var(--bg5)",borderRadius:2,overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${Math.min(100,Math.max(0,((adr-b.range[0])/(b.range[1]-b.range[0]))*100))}%`,background:inRange?"var(--green)":above?"var(--amber)":"var(--red)",borderRadius:2,transition:"width .3s"}}/>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div style={{fontSize:9,color:"var(--text-d)"}}>Market benchmarks for {matched.name} · Your ADR: <span style={{color:statusColor,fontFamily:"var(--font-mono)",fontWeight:600}}>{currSym2}{adr}</span></div>
                      </div>
                    );
                  })()}
































































                  {/* ── AI HOTEL COMPS ── */}
                  <div style={{marginTop:10}}>
                    <button
                      onClick={runHotelComps}
                      disabled={hotelCompsRunning||!data.location}
                      style={{display:"flex",alignItems:"center",gap:6,background:hotelCompsRunning?"var(--bg3)":"var(--gold-bg)",border:"1px solid var(--gold-border)",borderRadius:6,color:hotelCompsRunning?"var(--text-d)":"var(--gold)",fontSize:10,padding:"6px 12px",cursor:hotelCompsRunning||!data.location?"not-allowed":"pointer",fontFamily:"var(--font-body)",fontWeight:600,width:"100%",justifyContent:"center",transition:"all .2s"}}
                    >
                      {hotelCompsRunning?(
                        <><span style={{width:10,height:10,border:"1.5px solid rgba(201,168,76,.2)",borderTopColor:"var(--gold)",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/> Pulling market comps…</>
                      ):(
                        <><span style={{fontSize:12}}>◈</span> {hotelComps?"Refresh AI Comps":"Pull AI Market Comps"} {!data.location&&"(add location first)"}</>
                      )}
                    </button>
                    {hotelCompsError&&<div style={{fontSize:10,color:"var(--red)",marginTop:6,padding:"6px 10px",background:"rgba(244,100,95,.06)",borderRadius:6}}>{hotelCompsError}</div>}
                    {hotelComps&&(
                      <div style={{marginTop:10,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:12,animation:"fadeIn .3s ease"}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                          <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em"}}>AI Market Comps — {hotelComps.location_identified}</div>
                          <div style={{fontSize:9,color:"var(--text-d)"}}>{hotelComps.data_year}</div>
                        </div>
                        {/* AI benchmarks grid */}
                        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
                          {["3star","4star","5star"].map((key,i)=>{
                            const b=hotelComps.benchmarks?.[key];
                            if(!b)return null;
                            const starNum=i+3;
                            const isCurrent=starNum===num(String(data.starRating||4));
                            const currSym3={GBP:"£",USD:"$",EUR:"€",AED:"د.إ"}[data.currency]||"£";
                            return(
                              <div key={key} style={{background:isCurrent?"var(--bg4)":"var(--bg2)",border:`1px solid ${isCurrent?"rgba(201,168,76,.3)":"var(--border)"}`,borderRadius:6,padding:"8px 10px"}}>
                                <div style={{fontSize:9,color:isCurrent?"var(--gold)":"var(--text-d)",fontWeight:600,marginBottom:3}}>{starNum}★ {isCurrent?"(yours)":""}</div>
                                <div style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--text-m)",marginBottom:2}}>{currSym3}{b.low}–{currSym3}{b.high}</div>
                                <div style={{fontSize:9,color:"var(--text-d)"}}>avg {currSym3}{b.avg}</div>
                                {b.notes&&<div style={{fontSize:8,color:"var(--text-d)",marginTop:3,lineHeight:1.4}}>{b.notes}</div>}
                              </div>
                            );
                          })}
                        </div>
                        {/* Assessment */}
                        {hotelComps.assessment_note&&(
                          <div style={{padding:"8px 10px",background:`${hotelComps.assessment==="green"?"rgba(61,220,132,.06)":hotelComps.assessment==="amber"?"rgba(240,164,41,.06)":"rgba(244,100,95,.06)"}`,border:`1px solid ${hotelComps.assessment==="green"?"rgba(61,220,132,.2)":hotelComps.assessment==="amber"?"rgba(240,164,41,.2)":"rgba(244,100,95,.2)"}`,borderRadius:6,marginBottom:10}}>
                            <div style={{fontSize:10,color:hotelComps.assessment==="green"?"var(--green)":hotelComps.assessment==="amber"?"var(--amber)":"var(--red)",fontWeight:600,marginBottom:2}}>{hotelComps.assessment==="green"?"✓":hotelComps.assessment==="amber"?"⚠":"✗"} ADR Assessment</div>
                            <div style={{fontSize:10,color:"var(--text-m)"}}>{hotelComps.assessment_note}</div>
                          </div>
                        )}
                        {/* Market context */}
                        {hotelComps.market_context&&(
                          <div style={{fontSize:10,color:"var(--text-m)",lineHeight:1.6,marginBottom:10}}>{hotelComps.market_context}</div>
                        )}
                        {/* Comparable hotels */}
                        {hotelComps.comparable_hotels?.length>0&&(
                          <div>
                            <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Comparable Hotels</div>
                            <div style={{display:"flex",flexDirection:"column",gap:4}}>
                              {hotelComps.comparable_hotels.map((h:any,i:number)=>(
                                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 8px",background:"var(--bg2)",borderRadius:5}}>
                                  <div>
                                    <span style={{fontSize:10,color:"var(--text)",fontWeight:500}}>{h.name}</span>
                                    <span style={{fontSize:9,color:"var(--text-d)",marginLeft:6}}>{h.stars}★</span>
                                    {h.notes&&<div style={{fontSize:9,color:"var(--text-d)"}}>{h.notes}</div>}
                                  </div>
                                  <span style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--gold)",fontWeight:600}}>{({GBP:"£",USD:"$",EUR:"€",AED:"د.إ"})[data.currency]||"£"}{h.adr_approx}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </RevStream>
                <RevStream title="Food & Beverage" icon="" enabled={data.fnbEnabled} onToggle={()=>set("fnbEnabled",!data.fnbEnabled)} summary={fmt(hotelRev?.fnbRev||0,currencySymbol)+" pa"} open={streamOpen.fnb} onOpen={()=>setStreamOpen(s=>({...s,fnb:!s.fnb}))}>
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">Revenue per Occ Room ({currencySymbol})</label><input className="inp" type="number" value={data.fnbRevenuePerOccRoom??""} onChange={e=>set("fnbRevenuePerOccRoom",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Capture Rate (%)</label><input className="inp" type="number" value={data.fnbUtilisationPct??""} onChange={e=>set("fnbUtilisationPct",e.target.value)}/></div>
                  </div>
                  <div className="inp-group"><label className="inp-label">F&B GOP Margin (%)</label><input className="inp" type="number" value={data.fnbMarginPct??""} onChange={e=>set("fnbMarginPct",e.target.value)}/></div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"var(--bg3)",borderRadius:6,fontSize:12}}>
                    <span style={{color:"var(--text-m)"}}>F&B Revenue pa</span>
                    <span style={{fontFamily:"var(--font-mono)",color:data.fnbEnabled?"var(--gold)":"var(--text-d)"}}>{fmt(hotelRev?.fnbRev||0,currencySymbol)}</span>
                  </div>
                </RevStream>
                <RevStream title="Spa & Wellness" icon="" enabled={data.spaEnabled} onToggle={()=>set("spaEnabled",!data.spaEnabled)} summary={fmt(hotelRev?.spaRev||0,currencySymbol)+" pa"} open={streamOpen.spa} onOpen={()=>setStreamOpen(s=>({...s,spa:!s.spa}))}>
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">Revenue per Room pa ({currencySymbol})</label><input className="inp" type="number" value={data.spaRevenuePerRoomPa??""} onChange={e=>set("spaRevenuePerRoomPa",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Utilisation (%)</label><input className="inp" type="number" value={data.spaUtilisationPct??""} onChange={e=>set("spaUtilisationPct",e.target.value)}/></div>
                  </div>
                  <div className="inp-group"><label className="inp-label">Spa GOP Margin (%)</label><input className="inp" type="number" value={data.spaMarginPct??""} onChange={e=>set("spaMarginPct",e.target.value)}/></div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"var(--bg3)",borderRadius:6,fontSize:12}}>
                    <span style={{color:"var(--text-m)"}}>Spa Revenue pa</span>
                    <span style={{fontFamily:"var(--font-mono)",color:data.spaEnabled?"var(--gold)":"var(--text-d)"}}>{fmt(hotelRev?.spaRev||0,currencySymbol)}</span>
                  </div>
                </RevStream>
                <RevStream title="Gym & Leisure" icon="" enabled={data.gymEnabled} onToggle={()=>set("gymEnabled",!data.gymEnabled)} summary={fmt(hotelRev?.gymRev||0,currencySymbol)+" pa"} open={streamOpen.gym} onOpen={()=>setStreamOpen(s=>({...s,gym:!s.gym}))}>
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">External Membership Rev pa ({currencySymbol})</label><input className="inp" type="number" value={data.gymMembershipRevPa??""} onChange={e=>set("gymMembershipRevPa",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Guest Rev per Occ Room ({currencySymbol})</label><input className="inp" type="number" value={data.gymGuestRevPerOccRoom??""} onChange={e=>set("gymGuestRevPerOccRoom",e.target.value)}/></div>
                  </div>
                  <div className="inp-group"><label className="inp-label">Gym GOP Margin (%)</label><input className="inp" type="number" value={data.gymMarginPct??""} onChange={e=>set("gymMarginPct",e.target.value)}/></div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"var(--bg3)",borderRadius:6,fontSize:12}}>
                    <span style={{color:"var(--text-m)"}}>Gym Revenue pa</span>
                    <span style={{fontFamily:"var(--font-mono)",color:data.gymEnabled?"var(--gold)":"var(--text-d)"}}>{fmt(hotelRev?.gymRev||0,currencySymbol)}</span>
                  </div>
                </RevStream>
                <RevStream title="Meeting Rooms & Events" icon="" enabled={data.meetingEnabled} onToggle={()=>set("meetingEnabled",!data.meetingEnabled)} summary={fmt(hotelRev?.meetingRev||0,currencySymbol)+" pa"} open={streamOpen.meeting} onOpen={()=>setStreamOpen(s=>({...s,meeting:!s.meeting}))}>
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">Number of Meeting Rooms</label><input className="inp" type="number" value={data.meetingRooms??""} onChange={e=>set("meetingRooms",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Avg Day Rate ({currencySymbol})</label><input className="inp" type="number" value={data.meetingAvgDayRate??""} onChange={e=>set("meetingAvgDayRate",e.target.value)}/></div>
                  </div>
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">Utilisation (%)</label><input className="inp" type="number" value={data.meetingUtilisationPct??""} onChange={e=>set("meetingUtilisationPct",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Events GOP Margin (%)</label><input className="inp" type="number" value={data.meetingMarginPct??""} onChange={e=>set("meetingMarginPct",e.target.value)}/></div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"var(--bg3)",borderRadius:6,fontSize:12}}>
                    <span style={{color:"var(--text-m)"}}>Meetings Revenue pa</span>
                    <span style={{fontFamily:"var(--font-mono)",color:data.meetingEnabled?"var(--gold)":"var(--text-d)"}}>{fmt(hotelRev?.meetingRev||0,currencySymbol)}</span>
                  </div>
                </RevStream>
                <div style={{background:"var(--bg2)",border:"1px solid var(--gold-border)",borderRadius:10,padding:16,marginTop:8}}>
                  <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Total P&L Summary</div>
                  {([["Total Revenue pa",hotelRev?.totalRev||0,"var(--text)"],["Total EBITDA pa",hotelRev?.totalEbitda||0,"var(--green)"]] as any[]).map(([l,v,c])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--bg4)",fontSize:13}}>
                      <span style={{color:"var(--text-m)"}}>{l}</span>
                      <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:600}}>{fmt(v,currencySymbol)}</span>
                    </div>
                  ))}
                  <div style={{marginTop:16}}>
                    <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Exit Assumptions</div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Stabilised Cap Rate (%)</label><input className="inp" type="number" step="0.1" value={data.stabilisedCapRate} onChange={e=>set("stabilisedCapRate",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Exit Cap Rate (%)</label><input className="inp" type="number" step="0.1" value={data.exitCapRate} onChange={e=>set("exitCapRate",e.target.value)}/></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* COSTS BTR/BTS */}
            {activeTab==="costs"&&assetType!=="Flip"&&assetType!=="Hotel"&&assetType!=="MixedUse"&&assetType!=="Commercial"&&(
              <div>
                <div className="section-title">Acquisition</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Asset / Land Cost ({currencySymbol})</label><input className="inp" type="number" value={data.landCost} onChange={e=>set("landCost",e.target.value)}/></div>
                  <SDLTBlock data={data} set={set} r={r} currencySymbol={currencySymbol}/>
                </div>
                <div className="section-title" style={{marginTop:24}}>Build Costs</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Build Cost (psf)</label><input className="inp" type="number" value={data.buildCostPsf} onChange={e=>set("buildCostPsf",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Site Area (sqft)</label><input className="inp" type="number" value={data.siteAreaSqft} onChange={e=>set("siteAreaSqft",e.target.value)}/></div>
                </div>
                <div className="inp-row-3">
                  <div className="inp-group"><label className="inp-label">Professional Fees (%)</label><input className="inp" type="number" step="0.5" value={data.professionalFeesPct} onChange={e=>set("professionalFeesPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Contingency (%)</label><input className="inp" type="number" step="0.5" value={data.contingencyPct} onChange={e=>set("contingencyPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Other Costs ({currencySymbol})</label><input className="inp" type="number" value={data.otherCosts} onChange={e=>set("otherCosts",e.target.value)}/></div>
                </div>
                <VATCILBlock data={data} set={set} r={r} currencySymbol={currencySymbol}/>
              </div>
            )}
            {/* COSTS HOTEL */}
            {activeTab==="costs"&&assetType==="Hotel"&&(
              <div>
                <div className="section-title">Acquisition</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Purchase Price ({currencySymbol})</label><input className="inp" type="number" value={data.purchasePrice} onChange={e=>set("purchasePrice",e.target.value)}/></div>
                  <SDLTBlock data={data} set={set} r={r} currencySymbol={currencySymbol}/>
                </div>
                {/* Advanced — per key display */}
                {hotelMode==="advanced"&&data.purchasePrice&&data.rooms&&(
                  <div style={{fontSize:11,color:"var(--text-d)",marginTop:4,fontFamily:"var(--font-mono)"}}>
                    {currencySymbol}{Math.round(num(String(data.purchasePrice))/num(String(data.rooms))).toLocaleString()} per key
                    {" · "}Entry yield (NOI): <span style={{color:"var(--blue)"}}>{hotelAdv?fmtPct(hotelAdv.entryYieldNOI):"—"}</span>
                    {" · "}Entry yield (EBITDA): <span style={{color:"var(--blue)"}}>{hotelAdv?fmtPct(hotelAdv.entryYieldEBITDA):"—"}</span>
                  </div>
                )}
                <div className="section-title" style={{marginTop:24}}>CapEx & Costs</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">CapEx Budget ({currencySymbol})</label><input className="inp" type="number" value={data.capexBudget} onChange={e=>set("capexBudget",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Other Costs ({currencySymbol})</label><input className="inp" type="number" value={data.otherCosts} onChange={e=>set("otherCosts",e.target.value)}/></div>
                </div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Professional Fees (%)</label><input className="inp" type="number" step="0.5" value={data.professionalFeesPct} onChange={e=>set("professionalFeesPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Contingency (%)</label><input className="inp" type="number" step="0.5" value={data.contingencyPct} onChange={e=>set("contingencyPct",e.target.value)}/></div>
                </div>
                <VATCILBlock data={data} set={set} r={r} currencySymbol={currencySymbol} showCIL={false}/>
                {/* Advanced — transaction costs */}
                {hotelMode==="advanced"&&(
                  <>
                    <div style={{height:1,background:"var(--border)",margin:"20px 0"}}/>
                    <div className="section-title">Transaction Costs</div>
                    <div className="inp-row">
                      <div className="inp-group">
                        <label className="inp-label">SDLT Structure</label>
                        <select className="inp" value={data.sdltShareDeal?"share":"standard"} onChange={e=>set("sdltShareDeal",e.target.value==="share")}>
                          <option value="standard">Standard (5%)</option>
                          <option value="share">Share Deal (0.5%)</option>
                        </select>
                      </div>
                      <div className="inp-group"><label className="inp-label">Legal Costs ({currencySymbol})</label><input className="inp" type="number" value={data.legalCosts??""} onChange={e=>set("legalCosts",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Financing DD ({currencySymbol})</label><input className="inp" type="number" value={data.financingDD??""} onChange={e=>set("financingDD",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Disposal Costs (%)</label><input className="inp" type="number" step="0.5" value={data.disposalCostPct??""} onChange={e=>set("disposalCostPct",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group">
                        <label className="inp-label" style={{display:"flex",alignItems:"center",gap:6}}>
                          <input type="checkbox" checked={data.wiInsuranceEnabled||false} onChange={e=>set("wiInsuranceEnabled",e.target.checked)} style={{width:14,height:14}}/>
                          W&I Insurance ({currencySymbol})
                        </label>
                        <input className="inp" type="number" value={data.wiInsurance??""} onChange={e=>set("wiInsurance",e.target.value)} disabled={!data.wiInsuranceEnabled} style={{opacity:data.wiInsuranceEnabled?1:0.4}}/>
                      </div>
                      <div className="inp-group">
                        <label className="inp-label" style={{display:"flex",alignItems:"center",gap:6}}>
                          <input type="checkbox" checked={data.workingCapitalEnabled||false} onChange={e=>set("workingCapitalEnabled",e.target.checked)} style={{width:14,height:14}}/>
                          Working Capital ({currencySymbol})
                        </label>
                        <input className="inp" type="number" value={data.workingCapital??""} onChange={e=>set("workingCapital",e.target.value)} disabled={!data.workingCapitalEnabled} style={{opacity:data.workingCapitalEnabled?1:0.4}}/>
                      </div>
                    </div>
                    <div style={{height:1,background:"var(--border)",margin:"20px 0"}}/>
                    <div className="section-title">Ongoing Costs (pa)</div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Supporting Costs pa ({currencySymbol})</label><input className="inp" type="number" value={data.supportingCostsPA??""} onChange={e=>set("supportingCostsPA",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Hotel Operator Fees pa ({currencySymbol})</label><input className="inp" type="number" value={data.operatorFeesPA??""} onChange={e=>set("operatorFeesPA",e.target.value)}/></div>
                    </div>
                  </>
                )}
              </div>
            )}
            {/* COSTS FLIP */}
            {activeTab==="costs"&&assetType==="Flip"&&(
              <div>
                {/* URL Import */}
                <div style={{background:"var(--gold-bg)",border:"1px solid var(--gold-border)",borderRadius:10,padding:14,marginBottom:20}}>
                  <div style={{fontSize:11,color:"var(--gold)",fontWeight:600,marginBottom:8}}>◈ Import from Listing URL</div>
                  <div style={{fontSize:11,color:"var(--text-d)",marginBottom:10}}>Paste a Rightmove, Zoopla or Zillow URL — AI will attempt to extract price, size and location</div>
                  <div style={{display:"flex",gap:8}}>
                    <input className="inp" value={urlImport} onChange={e=>setUrlImport(e.target.value)} placeholder="https://www.rightmove.co.uk/properties/..." style={{flex:1,fontSize:12}}/>
                    <button onClick={handleUrlImport} disabled={urlImporting||!urlImport.trim()} className="btn-primary" style={{padding:"8px 14px",fontSize:12,flexShrink:0}}>
                      {urlImporting?<><span style={{width:10,height:10,border:"2px solid rgba(82,196,152,0.15)",borderTopColor:"#52C498",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Importing…</>:"Import"}
                    </button>
                  </div>
                  {urlImportError&&<div style={{fontSize:11,color:"var(--amber)",marginTop:6}}>{urlImportError}</div>}
                </div>
































































                {/* Exit Strategy */}
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:11,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Exit Strategy</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {([{key:"sell",label:"Sell",desc:"Refurb & sell on completion"},{key:"hold",label:"Hold (BTL)",desc:"Bridge → refinance & rent"}] as const).map(opt=>(
                      <button key={opt.key} onClick={()=>set("flipMode",opt.key)} style={{padding:"10px 12px",borderRadius:8,border:`1px solid ${(data.flipMode||"sell")===opt.key?"var(--gold)":"var(--border)"}`,background:(data.flipMode||"sell")===opt.key?"var(--gold-bg)":"var(--bg3)",cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
                        <div style={{fontSize:12,fontWeight:600,color:(data.flipMode||"sell")===opt.key?"var(--gold)":"var(--text)",marginBottom:2}}>{opt.label}</div>
                        <div style={{fontSize:10,color:"var(--text-d)"}}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
































































                <div className="section-title">Acquisition</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Purchase Price ({currencySymbol})</label><input className="inp" type="number" value={data.purchasePrice} onChange={e=>set("purchasePrice",e.target.value)}/></div>
                  {!data.areaModelOn&&<div className="inp-group"><label className="inp-label">Property Size ({data.unitSystem||"sqft"})</label><input className="inp" type="number" value={data.propertySqft||""} onChange={e=>set("propertySqft",e.target.value)} placeholder={`e.g. ${(data.unitSystem||"sqft")==="sqm"?"84":"900"}`}/></div>}
                </div>
                {!data.areaModelOn&&data.propertySqft>0&&data.purchasePrice>0&&(
                  <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12,fontFamily:"var(--font-mono)"}}>
                    Purchase price: <span style={{color:"var(--blue)"}}>{currencySymbol}{Math.round(num(String(data.purchasePrice))/(r.propertySqft||1))}/{data.unitSystem||"sqft"}</span>
                  </div>
                )}
                <SDLTBlock data={data} set={set} r={r} currencySymbol={currencySymbol}/>
































































                {/* Unit system toggle */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                  <div className="section-title" style={{margin:0,padding:0,border:"none"}}>Refurbishment</div>
                  <div style={{display:"flex",gap:0,borderRadius:6,border:"1px solid var(--border)",overflow:"hidden"}}>
                    {(["sqft","sqm"] as const).map(u=>(
                      <button key={u} onClick={()=>set("unitSystem",u)} style={{padding:"5px 14px",fontSize:11,fontFamily:"var(--font-mono)",background:(data.unitSystem||"sqft")===u?"var(--gold)":"var(--bg3)",color:(data.unitSystem||"sqft")===u?"#0D1017":"var(--text-m)",border:"none",cursor:"pointer",fontWeight:600,transition:"all .15s"}}>{u}</button>
                    ))}
                  </div>
                </div>
















                {/* Area model toggle — advanced only */}
                {flipComplexity==="advanced"&&(
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 14px",marginBottom:16,cursor:"pointer"}} onClick={()=>set("areaModelOn",!data.areaModelOn)}>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>Area Model</div>
                      <div style={{fontSize:11,color:"var(--text-d)",marginTop:2}}>Separate existing refurb vs new-build / extension areas with individual costs</div>
                    </div>
                    <div style={{width:36,height:20,borderRadius:10,background:data.areaModelOn?"var(--gold)":"var(--bg5)",position:"relative",transition:"background .2s",flexShrink:0}}>
                      <div style={{position:"absolute",top:3,left:data.areaModelOn?18:3,width:14,height:14,borderRadius:7,background:"#fff",transition:"left .2s"}}/>
                    </div>
                  </div>
                )}
















                {data.areaModelOn?(
                  /* ── Area model on: show existing + new rows ── */
                  <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",marginBottom:16}}>
                    {/* Header */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 110px 110px 110px",gap:8,padding:"8px 14px",background:"var(--bg3)",borderBottom:"1px solid var(--border)"}}>
                      {["Zone","Area ("+( data.unitSystem||"sqft")+")","Cost /"+( data.unitSystem||"sqft"),"Total"].map(h=>(
                        <div key={h} style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em"}}>{h}</div>
                      ))}
                    </div>
                    {/* Existing row */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 110px 110px 110px",gap:8,padding:"10px 14px",borderBottom:"1px solid var(--border)",alignItems:"center"}}>
                      <div style={{fontSize:12,color:"var(--text-m)"}}>Existing (refurb)</div>
                      <input className="inp" type="number" value={data.existingArea||""} onChange={e=>set("existingArea",e.target.value)} placeholder="0" style={{padding:"6px 8px",fontSize:12}}/>
                      <input className="inp" type="number" value={data.existingCostPsf||""} onChange={e=>set("existingCostPsf",e.target.value)} placeholder="0" style={{padding:"6px 8px",fontSize:12}}/>
                      <div style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--amber)"}}>{fmt(r.refurbExisting||0,currencySymbol)}</div>
                    </div>
                    {/* New area row */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 110px 110px 110px",gap:8,padding:"10px 14px",borderBottom:"1px solid var(--border)",alignItems:"center"}}>
                      <div style={{fontSize:12,color:"var(--text-m)"}}>New build / ext.</div>
                      <input className="inp" type="number" value={data.newArea||""} onChange={e=>set("newArea",e.target.value)} placeholder="0" style={{padding:"6px 8px",fontSize:12}}/>
                      <input className="inp" type="number" value={data.newCostPsf||""} onChange={e=>set("newCostPsf",e.target.value)} placeholder="0" style={{padding:"6px 8px",fontSize:12}}/>
                      <div style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--amber)"}}>{fmt(r.refurbNew||0,currencySymbol)}</div>
                    </div>
                    {/* Totals */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 110px 110px 110px",gap:8,padding:"10px 14px",background:"var(--bg3)",alignItems:"center"}}>
                      <div style={{fontSize:11,fontWeight:600,color:"var(--text)"}}>Total</div>
                      <div style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text)"}}>{((data.unitSystem||"sqft")==="sqm"?(num(String(data.existingArea||0))+num(String(data.newArea||0))).toFixed(0):(r.totalArea||0).toFixed(0))} {data.unitSystem||"sqft"}</div>
                      <div style={{fontSize:10,color:"var(--text-d)"}}>blended</div>
                      <div style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--gold)",fontWeight:600}}>{fmt(r.refurb||0,currencySymbol)}</div>
                    </div>
                  </div>
                ):(
                  /* ── Area model off: legacy flat / psf inputs ── */
                  <>
                    <div className="inp-row">
                      <div className="inp-group">
                        <label className="inp-label">Refurb Budget ({currencySymbol})</label>
                        <input className="inp" type="number" value={data.refurbBudget||""} onChange={e=>{set("refurbBudget",e.target.value);if(data.propertySqft>0)set("refurbPsf",Math.round(num(e.target.value)/num(String(data.propertySqft))));}} placeholder="Total budget"/>
                      </div>
                      <div className="inp-group">
                        <label className="inp-label">Refurb Cost (/{data.unitSystem||"sqft"})</label>
                        <input className="inp" type="number" value={data.refurbPsf||""} onChange={e=>{set("refurbPsf",e.target.value);if(data.propertySqft>0)set("refurbBudget",Math.round(num(e.target.value)*num(String(data.propertySqft))));}} placeholder={`Cost per ${data.unitSystem||"sqft"}`}/>
                      </div>
                    </div>
                  </>
                )}
















                {/* Professional & Fit-Out fees — advanced only shows detail; simple shows single % */}
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Professional Fees</div>
                  {flipComplexity==="advanced"&&<div style={{fontSize:11,color:"var(--text-d)",marginBottom:10}}>Fill named lines for a detailed breakdown, or leave blank and use the % fallback below.</div>}
                  {flipComplexity==="advanced"&&(
                    <>
                      <div className="inp-row">
                        <div className="inp-group"><label className="inp-label">Architect (% of refurb)</label><input className="inp" type="number" step="0.5" value={data.architectPct||""} onChange={e=>set("architectPct",e.target.value)} placeholder="e.g. 5"/></div>
                        <div className="inp-group"><label className="inp-label">Structural / Party Wall (%)</label><input className="inp" type="number" step="0.5" value={data.structEngPct||""} onChange={e=>set("structEngPct",e.target.value)} placeholder="e.g. 2"/></div>
                      </div>
                      <div className="inp-row">
                        <div className="inp-group"><label className="inp-label">Interior Designer (%)</label><input className="inp" type="number" step="0.5" value={data.interiorPct||""} onChange={e=>set("interiorPct",e.target.value)} placeholder="e.g. 3"/></div>
                        <div className="inp-group"><label className="inp-label">Furniture / FF&E ({currencySymbol})</label><input className="inp" type="number" value={data.ffeCost||""} onChange={e=>set("ffeCost",e.target.value)} placeholder="e.g. 25000"/></div>
                      </div>
                      <div className="inp-row">
                        <div className="inp-group"><label className="inp-label">Other Prof Fees ({currencySymbol})</label><input className="inp" type="number" value={data.otherProfFees||""} onChange={e=>set("otherProfFees",e.target.value)} placeholder="e.g. 5000"/></div>
                        <div className="inp-group"><label className="inp-label">Fallback — Prof Fees (%)</label><input className="inp" type="number" step="0.5" value={data.professionalFeesPct} onChange={e=>set("professionalFeesPct",e.target.value)} placeholder="Used if fields above are blank"/></div>
                      </div>
                    </>
                  )}
                  {flipComplexity==="simple"&&(
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Prof Fees (%)</label><input className="inp" type="number" step="0.5" value={data.professionalFeesPct} onChange={e=>set("professionalFeesPct",e.target.value)}/></div>
                    </div>
                  )}
                  {/* Live prof fees breakdown */}
                  {r.profFees>0&&(
                    <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text-d)",background:"var(--bg3)",borderRadius:6,padding:"8px 12px",marginTop:6}}>
                      Prof fees: <span style={{color:"var(--amber)"}}>{fmt(r.profFees,currencySymbol)}</span>
                      {(data.architectPct>0||data.structEngPct>0||data.interiorPct>0)&&(
                        <span style={{color:"var(--text-d)",marginLeft:8}}>
                          {data.architectPct>0&&` Arch ${fmt(r.refurb*(data.architectPct/100),currencySymbol)}`}
                          {data.structEngPct>0&&` · SE ${fmt(r.refurb*(data.structEngPct/100),currencySymbol)}`}
                          {data.interiorPct>0&&` · ID ${fmt(r.refurb*(data.interiorPct/100),currencySymbol)}`}
                          {data.ffeCost>0&&` · FF&E ${fmt(num(String(data.ffeCost)),currencySymbol)}`}
                        </span>
                      )}
                    </div>
                  )}
                </div>
















                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Contingency (%)</label><input className="inp" type="number" step="0.5" value={data.contingencyPct} onChange={e=>set("contingencyPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Other Costs ({currencySymbol})</label><input className="inp" type="number" value={data.otherCosts} onChange={e=>set("otherCosts",e.target.value)}/></div>
                </div>
                <VATCILBlock data={data} set={set} r={r} currencySymbol={currencySymbol} showCIL={false}/>
































































                <div className="section-title" style={{marginTop:24}}>{(data.flipMode||"sell")==="hold"?"GDV / Refinance Value":"Sale"}</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">{(data.flipMode||"sell")==="hold"?"GDV / Est. Value ({currencySymbol})":"Sale Price ({currencySymbol})"}</label>
                    <input className="inp" type="number" value={data.salePrice||""} onChange={e=>{set("salePrice",e.target.value);const area=r.propertySqft||num(String(data.propertySqft));if(area>0)set("salePricePsf",Math.round(num(e.target.value)/area));}}/>
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Sale / GDV (/{data.unitSystem||"sqft"})</label>
                    <input className="inp" type="number" value={data.salePricePsf||""} onChange={e=>{set("salePricePsf",e.target.value);const area=r.propertySqft||num(String(data.propertySqft));if(area>0)set("salePrice",Math.round(num(e.target.value)*area));}}/>
                  </div>
                </div>
                {(data.flipMode||"sell")==="sell"&&(
                  <div className="inp-group"><label className="inp-label">Agent Fee (%)</label><input className="inp" type="number" step="0.1" value={data.agentFeePct??""} onChange={e=>set("agentFeePct",e.target.value)}/></div>
                )}
                {/* Hold mode — rental inputs */}
                {(data.flipMode||"sell")==="hold"&&(
                  <>
                    <div className="section-title" style={{marginTop:24}}>Rental Income</div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Rent ({currencySymbol}/month)</label><input className="inp" type="number" value={data.rentPcm||""} onChange={e=>set("rentPcm",e.target.value)} placeholder="e.g. 2200"/></div>
                      <div className="inp-group"><label className="inp-label">Void / Vacancy (%)</label><input className="inp" type="number" step="0.5" value={data.voidPct??""} onChange={e=>set("voidPct",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Monthly OpEx ({currencySymbol})</label><input className="inp" type="number" value={data.holdOpexPm} onChange={e=>set("holdOpexPm",e.target.value)} placeholder="Service charge, insurance etc"/></div>
                      <div className="inp-group"><label className="inp-label">Agent Fee (%)</label><input className="inp" type="number" step="0.1" value={data.agentFeePct??""} onChange={e=>set("agentFeePct",e.target.value)}/></div>
                    </div>
                    {r.netCashflowPm!==undefined&&(
                      <div style={{background:r.netCashflowPm>0?"rgba(61,220,132,.07)":"rgba(244,100,95,.07)",border:`1px solid ${r.netCashflowPm>0?"rgba(61,220,132,.2)":"rgba(244,100,95,.2)"}`,borderRadius:8,padding:"10px 14px",fontSize:12,marginTop:4}}>
                        <span style={{color:"var(--text-m)"}}>Monthly net cashflow after refi interest: </span>
                        <span style={{fontFamily:"var(--font-mono)",color:r.netCashflowPm>0?"var(--green)":"var(--red)",fontWeight:600}}>{currencySymbol}{Math.round(r.netCashflowPm)}/mo</span>
                        <span style={{color:"var(--text-d)",marginLeft:8,fontSize:11}}>({currencySymbol}{Math.round(r.netCashflowPm*12)}/yr)</span>
                      </div>
                    )}
                  </>
                )}
































































                {/* Live cost summary */}
                <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginTop:20}}>
                  <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Cost Summary</div>
                  {[
                    ["Purchase",r.purchase||0,"var(--text-m)"],
                    ["Property Tax",r.sdlt||0,"var(--text-d)"],
                    ["Refurb",r.refurb||0,"var(--text-m)"],
                    ["Prof Fees + Contingency",(r.profFees||0)+(r.contingency||0),"var(--text-d)"],
                    ["Finance Cost",r.totalFinanceCost||0,"var(--amber)"],
                    ["Total Cost",r.totalCost||0,"var(--gold)"],
                  ].map(([l,v,c]:any)=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}>
                      <span style={{color:"var(--text-m)"}}>{l}</span>
                      <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:l==="Total Cost"?600:400}}>{fmt(v,currencySymbol)}</span>
                    </div>
                  ))}
                  {r.propertySqft>0&&r.refurb>0&&(
                    <div style={{fontSize:10,color:"var(--text-d)",marginTop:8,fontFamily:"var(--font-mono)"}}>
                      Refurb: <span style={{color:"var(--amber)"}}>{currencySymbol}{Math.round(r.refurbPsfDisplay||0)}/{r.unitSystem||"sqft"}</span>
                      {r.salePrice>0&&<> · Total cost: <span style={{color:"var(--text-m)"}}>{currencySymbol}{Math.round(r.totalCostPsfDisplay||0)}/{r.unitSystem||"sqft"}</span></>}
                      {r.salePrice>0&&<> · Sale: <span style={{color:r.salePrice>r.totalCost?"var(--green)":"var(--red)"}}>{currencySymbol}{Math.round(r.salePricePsfDisplay||0)}/{r.unitSystem||"sqft"}</span></>}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* FINANCE */}
            {activeTab==="finance"&&(
              <div>
                <div className="section-title">{assetType==="Hotel"&&hotelMode==="simple"?"Finance":"Development Finance"}</div>
                {/* Advanced Hotel — Capital Structure Selector */}
                {assetType==="Hotel"&&hotelMode==="advanced"&&(
                  <>
                    <div style={{marginBottom:20}}>
                      <div style={{fontSize:11,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Financing Structure</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                        {([
                          {key:"equity",label:"All Equity",desc:"No debt"},
                          {key:"single",label:"Single Facility",desc:"One LTC loan"},
                          {key:"dual",label:"Dual Facility",desc:"Acq + CapEx"},
                          {key:"fullstack",label:"Full Stack",desc:"Senior + Mezz"},
                        ] as const).map(opt=>(
                          <button key={opt.key} onClick={()=>set("capStructure",opt.key)} style={{padding:"10px 8px",borderRadius:8,border:`1px solid ${(data.capStructure||"single")===opt.key?"var(--gold)":"var(--border)"}`,background:(data.capStructure||"single")===opt.key?"var(--gold-bg)":"var(--bg3)",cursor:"pointer",textAlign:"center",transition:"all .2s"}}>
                            <div style={{fontSize:11,fontWeight:600,color:(data.capStructure||"single")===opt.key?"var(--gold)":"var(--text)",marginBottom:2}}>{opt.label}</div>
                            <div style={{fontSize:9,color:"var(--text-d)"}}>{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
































































                    {/* All Equity — no debt fields */}
                    {(data.capStructure||"single")==="equity"&&(
                      <div style={{padding:"16px",background:"var(--bg3)",borderRadius:8,border:"1px solid var(--border)",marginBottom:20}}>
                        <div style={{fontSize:12,color:"var(--text-d)"}}>No debt — returns calculated on full equity investment.</div>
                      </div>
                    )}
































































                    {/* Single Facility */}
                    {(data.capStructure||"single")==="single"&&(
                      <>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">LTC Ratio (%)</label><input className="inp" type="number" step="1" value={data.ltc??""} onChange={e=>set("ltc",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Interest Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.marginOverBenchmark??""} onChange={e=>set("marginOverBenchmark",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct??""} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Exit Fee (%)</label><input className="inp" type="number" step="0.1" value={data.exitFeePct} onChange={e=>set("exitFeePct",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Brokerage Fee (%)</label><input className="inp" type="number" step="0.1" value={data.brokerageFeePct} onChange={e=>set("brokerageFeePct",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Loan Amount (auto)</label><div className="inp" style={{color:"var(--amber)",cursor:"not-allowed"}}>{hotelAdv?fmt(hotelAdv.loanAmount,currencySymbol):"—"}</div></div>
                        </div>
                      </>
                    )}
































































                    {/* Dual Facility */}
                    {(data.capStructure||"single")==="dual"&&(
                      <>
                        <div style={{fontSize:11,color:"var(--gold)",fontWeight:600,marginBottom:10}}>Acquisition Facility</div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">LTV (%)</label><input className="inp" type="number" step="1" value={data.acqLTV} onChange={e=>set("acqLTV",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Interest Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.acqRate} onChange={e=>set("acqRate",e.target.value)}/></div>
                        </div>
                        <div style={{fontSize:11,color:"var(--blue)",fontWeight:600,margin:"16px 0 10px"}}>CapEx Facility</div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">LTC (%)</label><input className="inp" type="number" step="1" value={data.capexLTC} onChange={e=>set("capexLTC",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Interest Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.capexRate} onChange={e=>set("capexRate",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct??""} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Brokerage Fee (%)</label><input className="inp" type="number" step="0.1" value={data.brokerageFeePct} onChange={e=>set("brokerageFeePct",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Exit Fee (%)</label><input className="inp" type="number" step="0.1" value={data.exitFeePct} onChange={e=>set("exitFeePct",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Total Loan (auto)</label><div className="inp" style={{color:"var(--amber)",cursor:"not-allowed"}}>{hotelAdv?fmt(hotelAdv.loanAmount,currencySymbol):"—"}</div></div>
                        </div>
                        <div style={{fontSize:10,color:"var(--text-d)",marginTop:4}}>
                          Acq: {currencySymbol}{hotelAdv?fmt(num(String(data.purchasePrice||0))*num(String(data.acqLTV||65))/100,currencySymbol):"—"} · CapEx: {hotelAdv?fmt(num(String(data.capexBudget||0))*num(String(data.capexLTC||50))/100,currencySymbol):"—"}
                        </div>
                      </>
                    )}
































































                    {/* Full Stack */}
                    {(data.capStructure||"single")==="fullstack"&&(
                      <>
                        <div style={{fontSize:11,color:"var(--gold)",fontWeight:600,marginBottom:10}}>Senior Debt</div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Senior LTV (%)</label><input className="inp" type="number" step="1" value={data.seniorLTV} onChange={e=>set("seniorLTV",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Senior Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.seniorRate} onChange={e=>set("seniorRate",e.target.value)}/></div>
                        </div>
                        <div style={{fontSize:11,color:"var(--amber)",fontWeight:600,margin:"16px 0 10px"}}>Mezzanine</div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Mezz LTV (%)</label><input className="inp" type="number" step="1" value={data.mezzLTV} onChange={e=>set("mezzLTV",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Mezz Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.mezzRate} onChange={e=>set("mezzRate",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct??""} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Exit Fee (%)</label><input className="inp" type="number" step="0.1" value={data.exitFeePct} onChange={e=>set("exitFeePct",e.target.value)}/></div>
                        </div>
                      </>
                    )}
































































                    {/* Optional lines */}
                    {(data.capStructure||"single")!=="equity"&&(
                      <div style={{marginTop:16,display:"flex",gap:16,flexWrap:"wrap"}}>
                        <label style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--text-m)",cursor:"pointer"}}>
                          <input type="checkbox" checked={data.hedgingEnabled||false} onChange={e=>set("hedgingEnabled",e.target.checked)} style={{width:14,height:14}}/>
                          Day 1 Hedging / Swap
                        </label>
                        {data.hedgingEnabled&&<input className="inp" type="number" value={data.hedgingCost??""} onChange={e=>set("hedgingCost",e.target.value)} placeholder="Cost £" style={{width:120}}/>}
                      </div>
                    )}
































































                    {/* Finance summary */}
                    {hotelAdv&&(data.capStructure||"single")!=="equity"&&(
                      <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginTop:20}}>
                        <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Finance Cost Summary</div>
                        {([
                          ["Total Loan",hotelAdv.loanAmount,"var(--text)"],
                          ["Arrangement Fee",hotelAdv.arrangementFee,"var(--amber)"],
                          ["Brokerage Fee",hotelAdv.brokerageFee,"var(--amber)"],
                          ["Exit Fee",hotelAdv.exitFee,"var(--amber)"],
                          ["Interest (Total Hold)",hotelAdv.interestTotal,"var(--amber)"],
                        ] as any[]).map(([l,v,c])=>(
                          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}>
                            <span style={{color:"var(--text-m)"}}>{l}</span>
                            <span style={{fontFamily:"var(--font-mono)",color:c}}>{fmt(v||0,currencySymbol)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{height:1,background:"var(--border)",margin:"24px 0"}}/>
                  </>
                )}
                {assetType==="Hotel"&&hotelMode==="simple"&&(
                  <>
                    {/* Finance Structure Selector */}
                    <div style={{marginBottom:20}}>
                      <div style={{fontSize:11,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Finance Structure</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                        {([
                          {key:"equity",label:"All Equity",desc:"No debt"},
                          {key:"purchase",label:"Purchase Finance",desc:"Acquisition loan only"},
                          {key:"full",label:"Purchase + Dev Finance",desc:"Acquisition & capex facility"},
                        ] as const).map(opt=>(
                          <button key={opt.key} onClick={()=>set("hotelFinanceType",opt.key)} style={{padding:"10px 8px",borderRadius:8,border:`1px solid ${(data.hotelFinanceType||"full")===opt.key?"var(--gold)":"var(--border)"}`,background:(data.hotelFinanceType||"full")===opt.key?"var(--gold-bg)":"var(--bg3)",cursor:"pointer",textAlign:"center",transition:"all .2s"}}>
                            <div style={{fontSize:11,fontWeight:600,color:(data.hotelFinanceType||"full")===opt.key?"var(--gold)":"var(--text)",marginBottom:2}}>{opt.label}</div>
                            <div style={{fontSize:9,color:"var(--text-d)"}}>{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>


                    {/* All Equity */}
                    {(data.hotelFinanceType||"full")==="equity"&&(
                      <div style={{padding:16,background:"var(--bg3)",borderRadius:8,border:"1px solid var(--border)",marginBottom:20}}>
                        <div style={{fontSize:12,color:"var(--text-d)"}}>No debt — returns calculated on full equity investment.</div>
                      </div>
                    )}


                    {/* Purchase Finance only */}
                    {(data.hotelFinanceType||"full")==="purchase"&&(
                      <>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">LTV (%)</label><input className="inp" type="number" step="1" value={data.ltc??""} onChange={e=>set("ltc",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Mortgage Rate (% pa)</label><input className="inp" type="number" step="0.1" value={data.marginOverBenchmark??""} onChange={e=>set("marginOverBenchmark",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct??""} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Loan Amount (auto)</label><div className="inp" style={{color:"var(--blue)",cursor:"not-allowed"}}>{fmt(r.loanAmount||0,currencySymbol)}</div></div>
                        </div>
                      </>
                    )}


                    {/* Purchase + Development Finance */}
                    {(data.hotelFinanceType||"full")==="full"&&(
                      <>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Build Programme (months)</label><input className="inp" type="number" value={data.programmMonths??""} onChange={e=>set("programmMonths",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Stabilisation (months)</label><input className="inp" type="number" value={data.stabilisationMonths??""} onChange={e=>set("stabilisationMonths",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">LTC Ratio (%)</label><input className="inp" type="number" step="1" value={data.ltc??""} onChange={e=>set("ltc",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Margin over {data.benchmark||"SONIA"} (%)</label><input className="inp" type="number" step="0.1" value={data.marginOverBenchmark??""} onChange={e=>set("marginOverBenchmark",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct??""} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">All-in Rate (auto)</label><div className="inp" style={{color:"var(--blue)",cursor:"not-allowed"}}>{r.financeRate?`${(r.financeRate*100).toFixed(2)}%`:"—"}</div></div>
                        </div>
                      </>
                    )}


                    {/* Finance Cost Breakdown — show for purchase and full */}
                    {(data.hotelFinanceType||"full")!=="equity"&&(
                      <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginBottom:20}}>
                        <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Finance Cost Breakdown</div>
                        {[
                          ["Loan Amount",fmt(r.loanAmount||0,currencySymbol),"var(--text-m)"],
                          ["Peak Loan Balance",fmt(r.peakLoanBalance||0,currencySymbol),"var(--amber)"],
                          ["Arrangement Fee",fmt(r.arrangementFee||0,currencySymbol),"var(--text-d)"],
                          ["Interest (Rolled)",fmt(r.interestCost||0,currencySymbol),"var(--amber)"],
                          ["Total Finance Cost",fmt(r.totalFinanceCost||0,currencySymbol),"var(--gold)"],
                        ].map(([l,v,c]:any)=>(
                          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}>
                            <span style={{color:"var(--text-m)"}}>{l}</span>
                            <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:l==="Total Finance Cost"?600:400}}>{v}</span>
                          </div>
                        ))}
                        <div style={{fontSize:10,color:"var(--text-d)",marginTop:8,fontStyle:"italic"}}>S-curve drawdown on total investment cost. Interest rolled monthly on drawn balance.</div>
                      </div>
                    )}
                  </>
                )}
                {assetType==="Commercial"&&(
                  <>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">LTC Ratio (%)</label><input className="inp" type="number" step="1" value={data.ltc??""} onChange={e=>set("ltc",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Margin over {data.benchmark||"SONIA"} (%)</label><input className="inp" type="number" step="0.1" value={data.marginOverBenchmark??""} onChange={e=>set("marginOverBenchmark",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct??""} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">All-in Rate (auto)</label><div className="inp" style={{color:"var(--blue)",cursor:"not-allowed"}}>{r.financeRate?`${(r.financeRate*100).toFixed(2)}%`:"—"}</div></div>
                    </div>
                    <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginBottom:20}}>
                      <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Finance Cost Breakdown</div>
                      {[
                        ["Loan Amount",fmt(r.loanAmount||0,currencySymbol),"var(--text-m)"],
                        ["Peak Loan Balance",fmt(r.peakLoanBalance||0,currencySymbol),"var(--amber)"],
                        ["Arrangement Fee",fmt(r.arrangementFee||0,currencySymbol),"var(--text-d)"],
                        ["Interest (Rolled)",fmt(r.interestCost||0,currencySymbol),"var(--amber)"],
                        ["Total Finance Cost",fmt(r.totalFinanceCost||0,currencySymbol),"var(--gold)"],
                      ].map(([l,v,c]:any)=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}>
                          <span style={{color:"var(--text-m)"}}>{l}</span>
                          <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:l==="Total Finance Cost"?600:400}}>{v}</span>
                        </div>
                      ))}
                      <div style={{fontSize:10,color:"var(--text-d)",marginTop:8,fontStyle:"italic"}}>S-curve drawdown on total development cost. Interest rolled monthly on drawn balance.</div>
                    </div>
                  </>
                )}
                {assetType==="MixedUse"&&(
                  <>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Build Programme (months)</label><input className="inp" type="number" value={data.programmMonths??""} onChange={e=>set("programmMonths",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">LTC Ratio (%)</label><input className="inp" type="number" step="1" value={data.ltc??""} onChange={e=>set("ltc",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Margin over {data.benchmark||"SONIA"} (%)</label><input className="inp" type="number" step="0.1" value={data.marginOverBenchmark??""} onChange={e=>set("marginOverBenchmark",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct??""} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                    </div>
                    <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:12,marginTop:8}}>
                      {[
                        ["Committed Facility",r.loanAmount||0,"var(--text-m)"],
                        ["Peak Loan Balance",r.peakLoanBalance||0,"var(--amber)"],
                        ["Interest Cost",r.interestCost||0,"var(--amber)"],
                        ["Arrangement Fee",r.arrangementFee||0,"var(--text-d)"],
                        ["Total Finance Cost",r.totalFinanceCost||0,"var(--gold)"],
                      ].map(([l,v,c]:any)=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:"1px solid var(--bg4)"}}>
                          <span style={{color:"var(--text-m)"}}>{l}</span>
                          <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:l==="Total Finance Cost"?600:400}}>{currencySymbol}{Math.round(v).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {(assetType==="BTR"||assetType==="BTS"||assetType==="Commercial"||assetType==="MixedUse")&&(
                  <>
                    <div style={{marginBottom:20}}>
                      <div style={{fontSize:11,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Financing Structure</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                        {([{key:"equity",label:"All Equity",desc:"No debt"},{key:"single",label:"Single Facility",desc:"One LTC loan"},{key:"dual",label:"Dual Facility",desc:"Acq + build"},{key:"fullstack",label:"Full Stack",desc:"Senior + Mezz"}] as const).map(opt=>(
                          <button key={opt.key} onClick={()=>set("capStructure",opt.key)} style={{padding:"10px 8px",borderRadius:8,border:`1px solid ${(data.capStructure||"single")===opt.key?"var(--gold)":"var(--border)"}`,background:(data.capStructure||"single")===opt.key?"var(--gold-bg)":"var(--bg3)",cursor:"pointer",textAlign:"center",transition:"all .2s"}}>
                            <div style={{fontSize:11,fontWeight:600,color:(data.capStructure||"single")===opt.key?"var(--gold)":"var(--text)",marginBottom:2}}>{opt.label}</div>
                            <div style={{fontSize:9,color:"var(--text-d)"}}>{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    {(data.capStructure||"single")==="equity"&&(
                      <div style={{padding:"16px",background:"var(--bg3)",borderRadius:8,border:"1px solid var(--border)",marginBottom:20}}>
                        <div style={{fontSize:12,color:"var(--text-d)"}}>No debt — returns calculated on full equity investment.</div>
                      </div>
                    )}
                    {(data.capStructure||"single")==="single"&&(
                      <>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">LTC Ratio (%)</label><input className="inp" type="number" step="1" value={data.ltc??""} onChange={e=>set("ltc",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Margin over {data.benchmark||"SONIA"} (%)</label><input className="inp" type="number" step="0.1" value={data.marginOverBenchmark??""} onChange={e=>set("marginOverBenchmark",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct??""} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Exit Fee (%)</label><input className="inp" type="number" step="0.1" value={data.exitFeePct??""} onChange={e=>set("exitFeePct",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">All-in Rate (auto)</label><div className="inp" style={{color:"var(--blue)",cursor:"not-allowed"}}>{r.financeRate?`${(r.financeRate*100).toFixed(2)}%`:"—"}</div></div>
                          <div className="inp-group"><label className="inp-label">Loan Amount (auto)</label><div className="inp" style={{color:"var(--amber)",cursor:"not-allowed"}}>{fmt(r.loanAmount||0,currencySymbol)}</div></div>
                        </div>
                      </>
                    )}
                    {(data.capStructure||"single")==="dual"&&(
                      <>
                        <div style={{fontSize:11,color:"var(--gold)",fontWeight:600,marginBottom:10}}>Land / Acquisition Facility</div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">LTV (%)</label><input className="inp" type="number" step="1" value={data.acqLTV??""} onChange={e=>set("acqLTV",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.acqRate??""} onChange={e=>set("acqRate",e.target.value)}/></div>
                        </div>
                        <div style={{fontSize:11,color:"var(--blue)",fontWeight:600,margin:"16px 0 10px"}}>Development / Build Facility</div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">LTC (%)</label><input className="inp" type="number" step="1" value={data.capexLTC??""} onChange={e=>set("capexLTC",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.capexRate??""} onChange={e=>set("capexRate",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct??""} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Exit Fee (%)</label><input className="inp" type="number" step="0.1" value={data.exitFeePct??""} onChange={e=>set("exitFeePct",e.target.value)}/></div>
                        </div>
                      </>
                    )}
                    {(data.capStructure||"single")==="fullstack"&&(
                      <>
                        <div style={{fontSize:11,color:"var(--gold)",fontWeight:600,marginBottom:10}}>Senior Debt</div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Senior LTV (%)</label><input className="inp" type="number" step="1" value={data.seniorLTV??""} onChange={e=>set("seniorLTV",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Senior Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.seniorRate??""} onChange={e=>set("seniorRate",e.target.value)}/></div>
                        </div>
                        <div style={{fontSize:11,color:"var(--amber)",fontWeight:600,margin:"16px 0 10px"}}>Mezzanine</div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Mezz LTV (%)</label><input className="inp" type="number" step="1" value={data.mezzLTV??""} onChange={e=>set("mezzLTV",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Mezz Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.mezzRate??""} onChange={e=>set("mezzRate",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct??""} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Exit Fee (%)</label><input className="inp" type="number" step="0.1" value={data.exitFeePct??""} onChange={e=>set("exitFeePct",e.target.value)}/></div>
                        </div>
                      </>
                    )}
                    {(data.capStructure||"single")!=="equity"&&(
                      <div style={{marginTop:16,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
                        <label style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--text-m)",cursor:"pointer"}}>
                          <input type="checkbox" checked={data.hedgingEnabled||false} onChange={e=>set("hedgingEnabled",e.target.checked)} style={{width:14,height:14}}/>
                          Day 1 Hedging / Rate Cap
                        </label>
                        {data.hedgingEnabled&&<input className="inp" type="number" value={data.hedgingCost??""} onChange={e=>set("hedgingCost",e.target.value)} placeholder="Cost £" style={{width:140}}/>}
                      </div>
                    )}
                    {(data.capStructure||"single")!=="equity"&&(r.totalFinanceCost||0)>0&&(
                      <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginTop:20}}>
                        <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Finance Cost Breakdown</div>
                        {[["Loan Amount",r.loanAmount||0,"var(--text-m)"],["Peak Loan Balance",r.peakLoanBalance||0,"var(--amber)"],["Arrangement Fee",r.arrangementFee||0,"var(--text-d)"],["Interest (Rolled)",r.interestCost||0,"var(--amber)"],["Total Finance Cost",r.totalFinanceCost||0,"var(--gold)"]].map(([l,v,c]:any)=>(
                          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}>
                            <span style={{color:"var(--text-m)"}}>{l}</span>
                            <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:l==="Total Finance Cost"?600:400}}>{fmt(v,currencySymbol)}</span>
                          </div>
                        ))}
                        <div style={{fontSize:10,color:"var(--text-d)",marginTop:8,fontStyle:"italic"}}>S-curve drawdown · interest rolled monthly on drawn balance.</div>
                      </div>
                    )}
                    {(assetType==="BTR"||assetType==="BTS")&&(
                      <>
                        <div className="section-title" style={{marginTop:28}}>Promote Waterfall</div>
                        {[1,2,3].map(tier=>(
                          <div key={tier} className="waterfall-tier">
                            <div style={{fontSize:12,color:"var(--gold)",fontWeight:500,marginBottom:12}}>Tier {tier}</div>
                            <div className="inp-row">
                              <div className="inp-group"><label className="inp-label">IRR Hurdle (%)</label><input className="inp" type="number" value={data[`tier${tier}Hurdle`]} onChange={e=>set(`tier${tier}Hurdle`,e.target.value)}/></div>
                              <div className="inp-group"><label className="inp-label">Developer Share (%)</label><input className="inp" type="number" value={data[`tier${tier}DevShare`]} onChange={e=>set(`tier${tier}DevShare`,e.target.value)}/></div>
                            </div>
                            <div style={{height:6,background:"var(--bg4)",borderRadius:3,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${data[`tier${tier}DevShare`]}%`,background:"linear-gradient(90deg,var(--gold),var(--gold-l))",borderRadius:3}}/>
                            </div>
                            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--text-d)",marginTop:4}}>
                              <span>Developer: {data[`tier${tier}DevShare`]}%</span><span>Investor: {100-data[`tier${tier}DevShare`]}%</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
                {assetType==="Flip"&&<>
                    {/* Capital structure selector — full 3-option in advanced, simple bridging only in simple */}
                    <div className="section-title" style={{marginBottom:12}}>Finance</div>
                    {flipComplexity==="advanced"&&(
                      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
                        {[{key:"equity",label:"All Equity"},{key:"bridge",label:"Bridging Loan"},{key:"bridge_refi",label:"Bridge + Refi"}].map(opt=>(
                          <button key={opt.key} onClick={()=>{set("flipCapStructure",opt.key);set("flipMode",opt.key==="bridge_refi"?"hold":"sell");}}
                            style={{padding:"8px 16px",borderRadius:7,border:`1px solid ${(data.flipCapStructure||"bridge")===opt.key?"var(--gold)":"var(--border)"}`,background:(data.flipCapStructure||"bridge")===opt.key?"var(--gold-bg)":"var(--bg3)",color:(data.flipCapStructure||"bridge")===opt.key?"var(--gold)":"var(--text-m)",fontSize:11,fontWeight:500,cursor:"pointer",transition:"all .2s",fontFamily:"var(--font-body)"}}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {(data.flipCapStructure||"bridge")!=="equity"&&(
                      <>
                        <div style={{fontSize:11,color:"var(--gold)",fontWeight:600,marginBottom:12}}>Bridging Finance</div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">LTV (%)</label><input className="inp" type="number" step="1" value={data.flipLTV} onChange={e=>set("flipLTV",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Rate (%pm)</label><input className="inp" type="number" step="0.05" value={data.bridgingRatePct} onChange={e=>set("bridgingRatePct",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Term (months)</label><input className="inp" type="number" value={data.bridgingTermMonths??""} onChange={e=>set("bridgingTermMonths",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct??""} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                        </div>
                      </>
                    )}
                    {(data.flipCapStructure||"bridge")==="equity"&&(
                      <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:12,marginBottom:16,fontSize:12,color:"var(--text-d)"}}>
                        All-equity deal — no bridging finance. Full purchase + refurb funded from equity.
                      </div>
                    )}
                    <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:12,marginBottom:16}}>
                      {[
                        ["Committed Facility",fmt(r.loanAmount||0,currencySymbol),"var(--text-m)"],
                        ["Peak Drawn Balance",fmt(r.peakLoanBalance||0,currencySymbol),"var(--amber)"],
                        ["Interest (rolled)",fmt(r.bridgingInterest||0,currencySymbol),"var(--amber)"],
                        ["Arrangement Fee",fmt(r.arrangementFee||0,currencySymbol),"var(--text-d)"],
                      ].map(([l,v,c]:any)=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:"1px solid var(--bg4)"}}>
                          <span style={{color:"var(--text-m)"}}>{l}</span>
                          <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:500}}>{v}</span>
                        </div>
                      ))}
                      <div style={{fontSize:10,color:"var(--text-d)",marginTop:6,fontStyle:"italic"}}>Interest rolled monthly on drawn balance — straight-line draw over bridge term.</div>
                    </div>
                    {(data.flipCapStructure||"bridge")==="bridge_refi"&&(
                      <>
                        <div style={{height:1,background:"var(--border)",margin:"16px 0"}}/>
                        <div style={{fontSize:11,color:"var(--blue)",fontWeight:600,marginBottom:12}}>Refinance (BTL Mortgage) — after month {data.bridgingTermMonths||6}</div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Refi LTV (%)</label><input className="inp" type="number" step="1" value={data.refiLTV} onChange={e=>set("refiLTV",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Refi Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.refiRatePct} onChange={e=>set("refiRatePct",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Hold Term (months)</label><input className="inp" type="number" value={data.refiTermMonths??""} onChange={e=>set("refiTermMonths",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.refiArrangementPct} onChange={e=>set("refiArrangementPct",e.target.value)}/></div>
                        </div>
                        {/* Vacancy toggle */}
                        <div style={{marginBottom:14}}>
                          <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Property status during hold</div>
                          <div style={{display:"flex",gap:8}}>
                            {[{key:"vacant",label:"Vacant"},{key:"tenanted",label:"Tenanted / let"}].map(opt=>(
                              <button key={opt.key} onClick={()=>set("holdOccupancy",opt.key)}
                                style={{padding:"7px 16px",borderRadius:7,border:`1px solid ${(data.holdOccupancy||"vacant")===opt.key?"var(--gold)":"var(--border)"}`,background:(data.holdOccupancy||"vacant")===opt.key?"var(--gold-bg)":"var(--bg3)",color:(data.holdOccupancy||"vacant")===opt.key?"var(--gold)":"var(--text-m)",fontSize:11,fontWeight:500,cursor:"pointer",transition:"all .2s",fontFamily:"var(--font-body)"}}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Rental income inputs — only when tenanted */}
                        {(data.holdOccupancy||"vacant")==="tenanted"&&(
                          <div className="inp-row">
                            <div className="inp-group"><label className="inp-label">Rent (pcm)</label><input className="inp" type="number" step="50" value={data.rentPcm??""} onChange={e=>set("rentPcm",e.target.value)}/></div>
                            <div className="inp-group"><label className="inp-label">Void / vacancy (%)</label><input className="inp" type="number" step="1" value={data.voidPct??""} onChange={e=>set("voidPct",e.target.value)}/></div>
                          </div>
                        )}
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Monthly opex ({currencySymbol})</label><input className="inp" type="number" step="50" value={data.holdOpexPm??""} onChange={e=>set("holdOpexPm",e.target.value)}/></div>
                        </div>
                        {(r.refiLoan||0)>0&&(
                          <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:12}}>
                            <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Monthly cashflow during hold</div>
                            {(()=>{
                              const isVacant=(data.holdOccupancy||"vacant")==="vacant";
                              const grossRent=isVacant?0:num(String(data.rentPcm||0));
                              const voidDeduct=isVacant?0:grossRent*(num(String(data.voidPct||5))/100);
                              const netRent=grossRent-voidDeduct;
                              const refiInt=r.refiInterestPm||0;
                              const opex=num(String(data.holdOpexPm||200));
                              const netCf=r.netCashflowPm||0;
                              const holdMos=Math.round(num(String(data.refiTermMonths||24)));
                              const totalDrain=netCf*holdMos;
                              const rows=[
                                ["Refi loan",fmt(r.refiLoan||0,currencySymbol),"var(--text-m)",false],
                                ["Bridge balance repaid",`- ${currencySymbol}${Math.round(r.peakLoanBalance||0)}`,"var(--red)",false],
                                ...((r.cashOutRefi||0)>100?[["Cash released to you",`+ ${currencySymbol}${Math.round(r.cashOutRefi||0)}`,"var(--green)",true]]:[] as any[]),
                                ...((r.cashOutRefi||0)<-100?[["Equity top-up required",`- ${currencySymbol}${Math.round(Math.abs(r.cashOutRefi||0))}`,"var(--red)",true]]:[] as any[]),
                                isVacant
                                  ?["Rental income","Vacant — £0/mo","var(--text-d)",false]
                                  :["Gross rent",`+ ${currencySymbol}${Math.round(grossRent)}/mo`,"var(--green)",false],
                                ...(!isVacant&&voidDeduct>0?[["Vacancy deduction",`- ${currencySymbol}${Math.round(voidDeduct)}/mo`,"var(--red)",false]]:[] as any[]),
                                ...(!isVacant?[["Net rent",`= ${currencySymbol}${Math.round(netRent)}/mo`,"var(--green)",false]]:[] as any[]),
                                ["Refi interest",`- ${currencySymbol}${Math.round(refiInt)}/mo`,"var(--red)",false],
                                ["Running opex",`- ${currencySymbol}${Math.round(opex)}/mo`,"var(--amber)",false],
                                ["Net monthly",`${netCf>=0?"+ ":""}${currencySymbol}${Math.round(Math.abs(netCf))}/mo`,netCf>=0?"var(--green)":"var(--red)",true],
                                ["Total over hold",`${totalDrain>=0?"+ ":""}${currencySymbol}${Math.round(Math.abs(totalDrain))}`,totalDrain>=0?"var(--green)":"var(--red)",true],
                                ...(!isVacant?[
                                  ["Gross yield",fmtPct(r.grossYield||0),"var(--blue)",false],
                                  ["Net yield",fmtPct(r.netYield||0),"var(--blue)",false],
                                  ["DSCR / ICR",(r.dscr||0)>0?fmtX(r.dscr):"—",(r.dscr||0)>=1.25?"var(--green)":(r.dscr||0)>0?"var(--amber)":"var(--text-d)",false],
                                ] as any[]:[] as any[]),
                              ];
                              return rows.map(([l,v,c,bold]:any,i:number)=>(
                                <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:"1px solid var(--bg4)",background:bold?"rgba(201,168,76,0.04)":"transparent"}}>
                                  <span style={{color:bold?"var(--text)":"var(--text-m)",fontWeight:bold?600:400}}>{l}</span>
                                  <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:bold?600:500}}>{v}</span>
                                </div>
                              ));
                            })()}
                            {/* Cash-out refi banner */}
                            {(r.cashOutRefi||0)>100&&(
                              <div style={{marginTop:8,padding:"8px 10px",background:"rgba(61,220,132,0.06)",border:"1px solid rgba(61,220,132,0.2)",borderRadius:6,fontSize:11,color:"var(--green)"}}>
                                💰 Refi releases <strong>{currencySymbol}{Math.round(r.cashOutRefi||0)}</strong> cash back to you at refinance — bridge fully repaid + surplus returned. This reduces your net equity at risk and boosts your equity multiple.
                              </div>
                            )}
                            {/* Under-refi warning */}
                            {(r.cashOutRefi||0)<-100&&(
                              <div style={{marginTop:8,padding:"8px 10px",background:"rgba(240,164,41,0.06)",border:"1px solid rgba(240,164,41,0.25)",borderRadius:6,fontSize:11,color:"var(--amber)"}}>
                                ⚠ Refi loan is <strong>{currencySymbol}{Math.round(Math.abs(r.cashOutRefi||0))}</strong> short of the bridge balance — you will need to inject this extra equity at refinance to repay the bridging lender.
                              </div>
                            )}
                            {/* Negative monthly cashflow warning */}
                            {(r.netCashflowPm||0)<0&&(
                              <div style={{marginTop:8,padding:"8px 10px",background:"rgba(244,100,95,0.06)",border:"1px solid rgba(244,100,95,0.2)",borderRadius:6,fontSize:11,color:"var(--red)"}}>
                                ⚠ Negative monthly cashflow — you will need to fund {currencySymbol}{Math.round(Math.abs((r.netCashflowPm||0)*Math.round(num(String(data.refiTermMonths||24)))))} from equity during the hold period.
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </>}
              </div>
            )}
















            {/* ─── MIXED USE — GENERAL TAB ────────────────────────────────────────── */}
            {activeTab==="general"&&assetType==="MixedUse"&&(
              <div>
                <div className="section-title">Project Details</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Project Name</label><input className="inp" value={data.name||""} onChange={e=>set("name",e.target.value)} placeholder="e.g. Chiswick Mixed Use"/></div>
                  <div className="inp-group"><label className="inp-label">Location</label><input className="inp" value={data.location||""} onChange={e=>set("location",e.target.value)} placeholder="e.g. Chiswick, London"/></div>
                </div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Currency</label>
                    <select className="inp" value={data.currency||"GBP"} onChange={e=>set("currency",e.target.value)}>
                      {["GBP","USD","EUR","AED","SGD","AUD","JPY","CHF","CAD","HKD"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="inp-group"><label className="inp-label">Programme (months)</label><input className="inp" type="number" value={data.programmMonths??""} onChange={e=>set("programmMonths",e.target.value)}/></div>
                </div>
                <div className="section-title" style={{marginTop:24}}>Benchmark Rate</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Benchmark</label>
                    <select className="inp" value={data.benchmark||"SONIA"} onChange={e=>set("benchmark",e.target.value)}>
                      {["SONIA","SOFR","EURIBOR","EIBOR","SORA","AONIA","TONA","SARON","CORRA","HONIA"].map(b=><option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="inp-group"><label className="inp-label">{data.benchmark||"SONIA"} Rate (%)</label><input className="inp" type="number" step="0.01" value={data.benchmarkRate??""} onChange={e=>set("benchmarkRate",e.target.value)}/></div>
                </div>
                <div style={{marginTop:24,padding:"14px 16px",background:"var(--gold-bg)",border:"1px solid var(--gold-border)",borderRadius:10}}>
                  <div style={{fontSize:12,fontWeight:600,color:"var(--gold)",marginBottom:4}}>Next: Configure your zones</div>
                  <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12}}>Add each component of your scheme — residential, commercial, retail, parking — with individual costs and exit strategies.</div>
                  <button className="btn-primary" style={{fontSize:12,padding:"7px 16px"}} onClick={()=>setActiveTab("zones")}>Go to Zones →</button>
                </div>
              </div>
            )}
















            {/* ─── MIXED USE — ZONES TAB ──────────────────────────────────────────── */}
            {activeTab==="zones"&&assetType==="MixedUse"&&(
              <div>
                <div className="section-title">Zone Configuration</div>
                <div style={{fontSize:12,color:"var(--text-d)",marginBottom:16}}>Each zone has its own use type, size, cost and exit strategy. Active zones (already trading) offset carry costs during the build programme.</div>
                {(data.zones||[]).map((z:any,zi:number)=>{
                  const zr=(r.zoneResults||[])[zi]||{};
                  const updateZone=(field:string,val:any)=>{
                    const zones=[...(data.zones||[])];
                    zones[zi]={...zones[zi],[field]:val};
                    set("zones",zones);
                  };
                  return(
                    <div key={z.id||zi} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:16,marginBottom:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                        <input className="inp" value={z.label||""} onChange={e=>updateZone("label",e.target.value)} style={{fontWeight:600,fontSize:13,flex:1}} placeholder="Zone name"/>
                        <select className="inp" value={z.type||"residential"} onChange={e=>updateZone("type",e.target.value)} style={{width:140,fontSize:12}}>
                          {["residential","commercial","retail","office","restaurant","parking","custom"].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                        </select>
                        <select className="inp" value={z.status||"new_build"} onChange={e=>updateZone("status",e.target.value)} style={{width:140,fontSize:12}}>
                          <option value="new_build">New Build</option>
                          <option value="refurb">Refurb</option>
                          <option value="active">Active (trading now)</option>
                          <option value="vacant">Vacant</option>
                        </select>
                        <button className="btn-danger" onClick={()=>{const zones=(data.zones||[]).filter((_:any,i:number)=>i!==zi);set("zones",zones);}}>✕</button>
                      </div>
                      <div className="inp-row-3">
                        <div className="inp-group"><label className="inp-label">Units / floors</label><input className="inp" type="number" value={z.units||1} onChange={e=>updateZone("units",e.target.value)}/></div>
                        <div className="inp-group"><label className="inp-label">Size per unit (sqft)</label><input className="inp" type="number" value={z.sizeSqft||""} onChange={e=>updateZone("sizeSqft",e.target.value)}/></div>
                        <div className="inp-group"><label className="inp-label">Build cost (psf)</label><input className="inp" type="number" value={z.buildCostPsf||""} onChange={e=>updateZone("buildCostPsf",e.target.value)}/></div>
                      </div>
                      <div className="inp-row-3">
                        <div className="inp-group">
                          <label className="inp-label">Exit strategy</label>
                          <select className="inp" value={z.exitStrategy||"sell"} onChange={e=>updateZone("exitStrategy",e.target.value)} style={{fontSize:12}}>
                            <option value="sell">Sell</option>
                            <option value="hold">Hold / retain</option>
                          </select>
                        </div>
                        {(z.type==="residential"&&(z.exitStrategy||"sell")==="sell")&&<div className="inp-group"><label className="inp-label">Sale price (psf)</label><input className="inp" type="number" value={z.salePricePsf||""} onChange={e=>updateZone("salePricePsf",e.target.value)}/></div>}
                        {(z.type!=="residential"||(z.exitStrategy||"sell")==="hold")&&<div className="inp-group"><label className="inp-label">Rent ({currencySymbol}/unit/mo)</label><input className="inp" type="number" value={z.rentPcm||""} onChange={e=>updateZone("rentPcm",e.target.value)}/></div>}
                        {(z.type!=="residential"||(z.exitStrategy||"sell")==="hold")&&<div className="inp-group"><label className="inp-label">Exit yield (%)</label><input className="inp" type="number" step="0.25" value={z.exitYield||""} onChange={e=>updateZone("exitYield",e.target.value)}/></div>}
                      </div>
                      <div className="inp-row">
                        <div className="inp-group"><label className="inp-label">{vatLabel(data.currency||"GBP")} on build + fees (%)</label><input className="inp" type="number" step="1" value={z.vatPct??""} onChange={e=>updateZone("vatPct",e.target.value)} placeholder="e.g. 20"/></div>
                        {z.status==="active"&&<div className="inp-group"><label className="inp-label">Trading income starts (month)</label><input className="inp" type="number" value={z.startMonth||0} onChange={e=>updateZone("startMonth",e.target.value)}/></div>}
                      </div>
                      {/* Zone result summary */}
                      {zr.totalBuildCost>0&&(
                        <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:10,padding:"8px 12px",background:"var(--bg3)",borderRadius:8,fontSize:11,fontFamily:"var(--font-mono)"}}>
                          <span><span style={{color:"var(--text-d)"}}>Build: </span><span style={{color:"var(--amber)"}}>{currencySymbol}{Math.round(zr.totalBuildCost).toLocaleString()}</span></span>
                          <span><span style={{color:"var(--text-d)"}}>GDV: </span><span style={{color:"var(--gold)"}}>{currencySymbol}{Math.round(zr.gdvZone).toLocaleString()}</span></span>
                          <span><span style={{color:"var(--text-d)"}}>Profit: </span><span style={{color:zr.gdvZone-zr.totalBuildCost>0?"var(--green)":"var(--red)"}}>{currencySymbol}{Math.round(zr.gdvZone-zr.totalBuildCost).toLocaleString()}</span></span>
                          <span><span style={{color:"var(--text-d)"}}>GIA: </span><span style={{color:"var(--text-m)"}}>{Math.round(zr.totalSqft).toLocaleString()} sqft</span></span>
                          {zr.activeIncomePm>0&&<span><span style={{color:"var(--text-d)"}}>Trading income: </span><span style={{color:"var(--blue)"}}>{currencySymbol}{Math.round(zr.activeIncomePm)}/mo</span></span>}
                          {zr.vat>0&&<span><span style={{color:"var(--text-d)"}}>{vatLabel(data.currency||"GBP")}: </span><span style={{color:"var(--amber)"}}>{currencySymbol}{Math.round(zr.vat).toLocaleString()}</span></span>}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button className="btn-ghost" style={{width:"100%",marginTop:4,justifyContent:"center"}} onClick={()=>{
                  const zones=[...(data.zones||[])];
                  const id="z"+Date.now();
                  zones.push({id,label:"New Zone",type:"residential",exitStrategy:"sell",status:"new_build",units:1,sizeSqft:700,buildCostPsf:260,salePricePsf:800,rentPcm:0,exitYield:0,vatPct:0,startMonth:0});
                  set("zones",zones);
                }}>+ Add zone</button>
              </div>
            )}
















            {/* ─── MIXED USE — COSTS TAB ──────────────────────────────────────────── */}
            {activeTab==="costs"&&assetType==="MixedUse"&&(
              <div>
                <div className="section-title">Acquisition</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Land Cost ({currencySymbol})</label><input className="inp" type="number" value={data.landCost} onChange={e=>set("landCost",e.target.value)}/></div>
                  <SDLTBlock data={data} set={set} r={r} currencySymbol={currencySymbol}/>
                </div>
                <div className="section-title" style={{marginTop:24}}>Scheme-level Fees</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Professional Fees (% of total build)</label><input className="inp" type="number" step="0.5" value={data.professionalFeesPct} onChange={e=>set("professionalFeesPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Contingency (%)</label><input className="inp" type="number" step="0.5" value={data.contingencyPct} onChange={e=>set("contingencyPct",e.target.value)}/></div>
                </div>
                <VATCILBlock data={data} set={set} r={r} currencySymbol={currencySymbol} showCIL={true}/>
                {/* Cost summary */}
                {r.totalBuildCost>0&&(
                  <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginTop:20}}>
                    <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Scheme Cost Summary</div>
                    {[
                      ["Land",r.landCost||0,"var(--text-m)"],
                      ["Property Tax (SDLT)",r.sdlt||0,"var(--text-d)"],
                      ["Total Build Cost",r.totalBuildCost||0,"var(--text-m)"],
                      ["Section 106",r.s106||0,"var(--amber)"],
                      ["Finance Cost",r.totalFinanceCost||0,"var(--amber)"],
                      ["Total",r.totalCost||0,"var(--gold)"],
                    ].map(([l,v,c]:any)=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}>
                        <span style={{color:"var(--text-m)"}}>{l}</span>
                        <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:l==="Total"?600:400}}>{currencySymbol}{Math.round(v).toLocaleString()}</span>
                      </div>
                    ))}
                    {r.totalSqft>0&&<div style={{fontSize:10,color:"var(--text-d)",marginTop:8,fontFamily:"var(--font-mono)"}}>
                      Total GIA: {Math.round(r.totalSqft).toLocaleString()} sqft
                      {r.totalCost>0&&<> · Cost/sqft: {currencySymbol}{Math.round(r.totalCost/r.totalSqft)}</>}
                    </div>}
                  </div>
                )}
              </div>
            )}
















            {/* ─── MIXED USE — ANALYSIS TAB ──────────────────────────────────────── */}
            {activeTab==="analysis"&&assetType==="MixedUse"&&(
              <div>
                <div className="section-title">Returns Summary</div>
                <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:20,marginBottom:20}}>
                  {[
                    ["Total GDV",currencySymbol+Math.round(r.totalGDV||0).toLocaleString(),"var(--gold)"],
                    ["Total Cost",currencySymbol+Math.round(r.totalCost||0).toLocaleString(),"var(--text-m)"],
                    ["Equity In",currencySymbol+Math.round(r.equity||0).toLocaleString(),"var(--gold)"],
                    ["Finance Cost",currencySymbol+Math.round(r.totalFinanceCost||0).toLocaleString(),"var(--amber)"],
                    ["Peak Loan Balance",currencySymbol+Math.round(r.peakLoanBalance||0).toLocaleString(),"var(--amber)"],
                    ["Profit",currencySymbol+Math.round(r.profit||0).toLocaleString(),(r.profit||0)>0?"var(--green)":"var(--red)"],
                    ["Profit on Cost",fmtPct(r.poc||0),(r.poc||0)>0.20?"var(--green)":(r.poc||0)>0.10?"var(--amber)":"var(--red)"],
                    ["Profit on GDV",fmtPct(r.margin||0),"var(--text-m)"],
                    ["IRR (Blended)",fmtPct(r.irr||0),irrCol(r.irr||0)],
                    ["Equity Multiple",fmtX(r.moic||0),(r.moic||0)>1.5?"var(--green)":"var(--text)"],
                  ].map(([l,v,c]:any)=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                </div>
















                {/* Zone-by-zone breakdown */}
                <div className="section-title">Zone Profit Contribution</div>
                {(r.zoneResults||[]).map((zr:any,i:number)=>(
                  <div key={i} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{zr.label}</div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:10,color:"var(--text-d)",background:"var(--bg4)",padding:"2px 8px",borderRadius:4}}>{zr.type}</span>
                        <span style={{fontSize:10,color:"var(--text-d)",background:"var(--bg4)",padding:"2px 8px",borderRadius:4}}>{zr.exitStrategy}</span>
                        {zr.status==="active"&&<span style={{fontSize:10,color:"var(--blue)",background:"rgba(91,156,246,.1)",padding:"2px 8px",borderRadius:4}}>trading</span>}
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                      {[
                        {l:"Build Cost",v:currencySymbol+Math.round(zr.totalBuildCost||0).toLocaleString(),c:"var(--text-m)"},
                        {l:"GDV",v:currencySymbol+Math.round(zr.gdvZone||0).toLocaleString(),c:"var(--gold)"},
                        {l:"Contribution",v:currencySymbol+Math.round((zr.gdvZone||0)-(zr.totalBuildCost||0)).toLocaleString(),c:(zr.gdvZone||0)-(zr.totalBuildCost||0)>0?"var(--green)":"var(--red)"},
                        {l:"GIA",v:Math.round(zr.totalSqft||0).toLocaleString()+" sqft",c:"var(--text-d)"},
                      ].map(m=>(
                        <div key={m.l} style={{background:"var(--bg2)",borderRadius:6,padding:"8px 10px"}}>
                          <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{m.l}</div>
                          <div style={{fontFamily:"var(--font-mono)",fontSize:13,fontWeight:600,color:m.c}}>{m.v}</div>
                        </div>
                      ))}
                    </div>
                    {/* Margin bar */}
                    {zr.gdvZone>0&&(
                      <div style={{marginTop:10}}>
                        <div style={{height:4,background:"var(--bg4)",borderRadius:2,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(100,Math.max(0,((zr.gdvZone-zr.totalBuildCost)/zr.gdvZone)*100))}%`,background:(zr.gdvZone-zr.totalBuildCost)/zr.gdvZone>0.15?"var(--green)":"var(--amber)",borderRadius:2}}/>
                        </div>
                        <div style={{fontSize:9,color:"var(--text-d)",marginTop:3,fontFamily:"var(--font-mono)"}}>
                          Zone margin on GDV: {(((zr.gdvZone-zr.totalBuildCost)/zr.gdvZone)*100).toFixed(1)}%
                          {zr.activeIncomePm>0&&<span style={{color:"var(--blue)",marginLeft:10}}>Active income: {currencySymbol}{Math.round(zr.activeIncomePm)}/mo offsets carry costs</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}








                {/* MixedUse sensitivity: GDV shift (rows) × total cost shift (cols) */}
                {(()=>{
                  const gdvSteps=[1.10,1.05,1,0.95,0.90];
                  const costSteps=[0.90,0.95,1,1.05,1.10];
                  const muSens=gdvSteps.map(gs=>costSteps.map(cs=>{
                    const modZones=(data.zones||[]).map((z:any)=>({...z,salePricePsf:num(String(z.salePricePsf||0))*gs,rentPcm:num(String(z.rentPcm||0))*gs,buildCostPsf:num(String(z.buildCostPsf||0))*cs}));
                    const res=calcAll("MixedUse",{...data,zones:modZones});
                    return res.poc??0;
                  }));
                  return(
                    <div style={{marginTop:24,marginBottom:28}}>
                      <div className="section-title">Sensitivity — Profit on Cost %</div>
                      <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12}}>GDV shift (rows) × total cost shift (columns)</div>
                      <div className="sens-wrap">
                        <div style={{display:"grid",gridTemplateColumns:"72px repeat(5,1fr)",gap:4,fontSize:10,minWidth:380}}>
                          <div/>
                          {["-10%","-5%","Base","+5%","+10%"].map(h=>(<div key={h} style={{textAlign:"center",color:"var(--text-d)",padding:"4px",textTransform:"uppercase",letterSpacing:".06em"}}>{h}</div>))}
                          {muSens.map((row:number[],si:number)=>(
                            <React.Fragment key={si}>
                              <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6,color:"var(--text-d)"}}>{["+10%","+5%","Base","-5%","-10%"][si]} GDV</div>
                              {row.map((poc:number,ri:number)=>(
                                <div key={ri} className={`sens-cell ${poc>0.20?"cell-g":poc>0.10?"cell-a":"cell-r"} ${si===2&&ri===2?"cell-base":""}`}>{(poc*100).toFixed(1)}%</div>
                              ))}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <div style={{fontSize:10,color:"var(--text-d)",marginTop:8}}>Base case matches Returns Summary above. Finance costs held constant.</div>
                    </div>
                  );
                })()}
              </div>
            )}
















            {/* ══════════════════════════════════════════════════════════════
                COMMERCIAL — GENERAL TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab==="general"&&assetType==="Commercial"&&(
              <div>
                <div className="section-title">Project Details</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Project Name</label><input className="inp" value={data.name||""} onChange={e=>set("name",e.target.value)} placeholder="e.g. Farringdon Office Block"/></div>
                  <div className="inp-group"><label className="inp-label">Location</label><input className="inp" value={data.location||""} onChange={e=>set("location",e.target.value)} placeholder="e.g. Farringdon, London"/></div>
                </div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Currency</label>
                    <select className="inp" value={data.currency||"GBP"} onChange={e=>set("currency",e.target.value)}>
                      {["GBP","USD","EUR","AED","SGD","AUD","JPY","CHF","CAD","HKD"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="inp-group"><label className="inp-label">Programme (months)</label><input className="inp" type="number" value={data.programmMonths??""} onChange={e=>set("programmMonths",e.target.value)}/></div>
                </div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Benchmark</label>
                    <select className="inp" value={data.benchmark||"SONIA"} onChange={e=>set("benchmark",e.target.value)}>
                      {["SONIA","SOFR","EURIBOR","EIBOR","SORA","AONIA","TONA","SARON","CORRA","HONIA"].map(b=><option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="inp-group"><label className="inp-label">{data.benchmark||"SONIA"} Rate (%)</label><input className="inp" type="number" step="0.01" value={data.benchmarkRate??""} onChange={e=>set("benchmarkRate",e.target.value)}/></div>
                </div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Stabilisation (months)</label><input className="inp" type="number" value={data.stabilisationMonths??""} onChange={e=>set("stabilisationMonths",e.target.value)}/></div>
                </div>
              </div>
            )}
















            {/* ══════════════════════════════════════════════════════════════
                COMMERCIAL — REVENUE TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab==="revenue"&&assetType==="Commercial"&&(
              <div>
                <div className="section-title">Lettable Units</div>
                <div style={{fontSize:12,color:"var(--text-d)",marginBottom:16}}>Add each lettable unit or floor. ERV and passing rent in {currencySymbol}/sqm/yr.</div>
















                {/* Unit table header */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 80px 80px 60px 60px 28px",gap:6,padding:"6px 10px",background:"var(--bg3)",borderRadius:"8px 8px 0 0",border:"1px solid var(--border)",borderBottom:"none"}}>
                  {["Label","Area (sqm)","ERV /sqm","Passing /sqm","WAULT (yrs)","Void %","RF (mo)",""].map(h=>(
                    <div key={h} style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em"}}>{h}</div>
                  ))}
                </div>
















                {(data.units||[]).map((u:any,ui:number)=>{
                  const ur=(r.unitResults||[])[ui]||{};
                  const upd=(f:string,v:any)=>{const units=[...(data.units||[])];units[ui]={...units[ui],[f]:v};set("units",units);};
                  return(
                    <div key={u.id||ui} style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 80px 80px 60px 60px 28px",gap:6,padding:"8px 10px",background:"var(--bg2)",border:"1px solid var(--border)",borderTop:"none"}}>
                      <input className="inp" value={u.label||""} onChange={e=>upd("label",e.target.value)} style={{fontSize:12,padding:"5px 8px"}} placeholder="Unit name"/>
                      <input className="inp" type="number" value={u.areaSqm||""} onChange={e=>upd("areaSqm",e.target.value)} style={{fontSize:12,padding:"5px 8px"}}/>
                      <input className="inp" type="number" value={u.erv||""} onChange={e=>upd("erv",e.target.value)} style={{fontSize:12,padding:"5px 8px"}}/>
                      <input className="inp" type="number" value={u.passingRent||""} onChange={e=>upd("passingRent",e.target.value)} style={{fontSize:12,padding:"5px 8px"}}/>
                      <input className="inp" type="number" step="0.5" value={u.wault||""} onChange={e=>upd("wault",e.target.value)} style={{fontSize:12,padding:"5px 8px"}}/>
                      <input className="inp" type="number" value={u.voidPct||""} onChange={e=>upd("voidPct",e.target.value)} style={{fontSize:12,padding:"5px 8px"}}/>
                      <input className="inp" type="number" value={u.rentFreeMonths||""} onChange={e=>upd("rentFreeMonths",e.target.value)} style={{fontSize:12,padding:"5px 8px"}}/>
                      <button className="btn-danger" onClick={()=>set("units",(data.units||[]).filter((_:any,i:number)=>i!==ui))} style={{padding:"4px 6px",fontSize:12}}>✕</button>
                    </div>
                  );
                })}
                {/* Totals row */}
                {(data.units||[]).length>0&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 80px 80px 60px 60px 28px",gap:6,padding:"8px 10px",background:"var(--bg3)",border:"1px solid var(--border)",borderTop:"1px solid var(--gold-border)",borderRadius:"0 0 8px 8px"}}>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--text)"}}>Total / Avg</div>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text)"}}>{Math.round(r.totalAreaSqm||0)}</div>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--gold)"}}>{currencySymbol}{r.totalAreaSqm>0?Math.round((r.totalErv||0)/r.totalAreaSqm):0}</div>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text-m)"}}>{currencySymbol}{r.totalAreaSqm>0?Math.round((r.totalPassing||0)/r.totalAreaSqm):0}</div>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--blue)"}}>{(r.avgWault||0).toFixed(1)} yrs</div>
                    <div/>
                    <div/>
                    <div/>
                  </div>
                )}
















                <button className="btn-ghost" style={{width:"100%",marginTop:8,justifyContent:"center"}} onClick={()=>{
                  const units=[...(data.units||[])];
                  units.push({id:"u"+Date.now(),label:"New Unit",use:"office",areaSqm:500,erv:400,passingRent:400,wault:5,voidPct:5,rentFreeMonths:3});
                  set("units",units);
                }}>+ Add unit</button>
















                {/* Income summary */}
                {(r.totalErv||0)>0&&(
                  <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginTop:20}}>
                    <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Income Summary</div>
                    {[
                      ["Total ERV pa",fmt(r.totalErv||0,currencySymbol),"var(--gold)"],
                      ["Passing Rent pa",fmt(r.totalPassing||0,currencySymbol),"var(--text-m)"],
                      ["Net Passing (after void)",fmt(r.totalNetPassing||0,currencySymbol),"var(--text)"],
                      ["Reversionary Gap",fmt((r.totalErv||0)-(r.totalPassing||0),currencySymbol),(r.totalErv||0)>=(r.totalPassing||0)?"var(--green)":"var(--red)"],
                      ["Rent-Free Cost",fmt(r.totalRentFreeCost||0,currencySymbol),"var(--amber)"],
                      ["Avg WAULT",`${(r.avgWault||0).toFixed(1)} yrs`,"var(--blue)"],
                      ["ERV /sqm/yr",r.totalAreaSqm>0?`${currencySymbol}${Math.round((r.totalErv||0)/r.totalAreaSqm)}`:"—","var(--text-m)"],
                    ].map(([l,v,c]:any)=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}>
                        <span style={{color:"var(--text-m)"}}>{l}</span>
                        <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:500}}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
















                {/* Rent review */}
                <div className="section-title" style={{marginTop:24}}>Rent Review</div>
                <div className="inp-row-3">
                  <div className="inp-group">
                    <label className="inp-label">Review type</label>
                    <select className="inp" value={data.rentReviewType||"fixed"} onChange={e=>set("rentReviewType",e.target.value)}>
                      <option value="fixed">Fixed %</option>
                      <option value="cpi">CPI-linked</option>
                      <option value="rpi">RPI-linked</option>
                      <option value="omo">Open Market (OMO)</option>
                    </select>
                  </div>
                  <div className="inp-group"><label className="inp-label">{data.rentReviewType==="cpi"?"CPI rate (%)":data.rentReviewType==="rpi"?"RPI rate (%)":"Uplift (%)"}</label><input className="inp" type="number" step="0.5" value={data.rentReviewPct??""} onChange={e=>set("rentReviewPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Review period (yrs)</label><input className="inp" type="number" value={data.rentReviewYears??""} onChange={e=>set("rentReviewYears",e.target.value)}/></div>
                </div>
                {(r.projectedErv||0)>0&&(
                  <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text-d)",marginTop:4}}>
                    ERV after {data.rentReviewYears||5}-yr review: <span style={{color:"var(--green)"}}>{fmt(r.projectedErv||0,currencySymbol)}</span>
                    <span style={{marginLeft:12}}>Uplift: <span style={{color:"var(--green)"}}>{(((r.reviewMultiplier||1)-1)*100).toFixed(1)}%</span></span>
                  </div>
                )}
















                {/* Exit method */}
                <div className="section-title" style={{marginTop:24}}>Exit Valuation Method</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
                  {([
                    {key:"investment",label:"Investment Sale",desc:"NIY capitalisation of net passing rent"},
                    {key:"equivalent",label:"Equivalent Yield",desc:"Blend of initial + reversionary yield"},
                    {key:"vp",label:"Vacant Possession",desc:"Physical asset value per sqm (B&M / alt use)"},
                  ] as const).map(opt=>(
                    <button key={opt.key} onClick={()=>set("exitMethod",opt.key)} style={{padding:"10px 12px",borderRadius:8,border:`1px solid ${(data.exitMethod||"investment")===opt.key?"var(--gold)":"var(--border)"}`,background:(data.exitMethod||"investment")===opt.key?"var(--gold-bg)":"var(--bg3)",cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
                      <div style={{fontSize:12,fontWeight:600,color:(data.exitMethod||"investment")===opt.key?"var(--gold)":"var(--text)",marginBottom:3}}>{opt.label}</div>
                      <div style={{fontSize:10,color:"var(--text-d)"}}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
                {(data.exitMethod||"investment")==="investment"&&(
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">NIY / Exit Cap Rate (%)</label><input className="inp" type="number" step="0.25" value={data.niy??""} onChange={e=>set("niy",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">GDV (auto)</label><div className="inp" style={{color:"var(--gold)",cursor:"not-allowed"}}>{fmt(r.gdv||0,currencySymbol)}</div></div>
                  </div>
                )}
                {(data.exitMethod||"investment")==="equivalent"&&(
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">Initial Yield / NIY (%)</label><input className="inp" type="number" step="0.25" value={data.niy??""} onChange={e=>set("niy",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Equivalent Yield (%)</label><input className="inp" type="number" step="0.25" value={data.equivalentYield??""} onChange={e=>set("equivalentYield",e.target.value)}/></div>
                  </div>
                )}
                {data.exitMethod==="vp"&&(
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">VP Value ({currencySymbol}/sqm)</label><input className="inp" type="number" value={data.vpValuePsm??""} onChange={e=>set("vpValuePsm",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">GDV (auto)</label><div className="inp" style={{color:"var(--gold)",cursor:"not-allowed"}}>{fmt(r.gdv||0,currencySymbol)}</div></div>
                  </div>
                )}
              </div>
            )}
















            {/* ══════════════════════════════════════════════════════════════
                COMMERCIAL — COSTS TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab==="costs"&&assetType==="Commercial"&&(
              <div>
                <div className="section-title">Acquisition</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Land Cost ({currencySymbol})</label><input className="inp" type="number" value={data.landCost??""} onChange={e=>set("landCost",e.target.value)}/></div>
                  <SDLTBlock data={data} set={set} r={r} currencySymbol={currencySymbol}/>
                </div>
                <div className="section-title" style={{marginTop:24}}>Build Costs</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Build Cost ({currencySymbol}/sqm)</label><input className="inp" type="number" value={data.buildCostPsm??""} onChange={e=>set("buildCostPsm",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Total Area (sqm) — from units</label><div className="inp" style={{color:"var(--blue)",cursor:"not-allowed"}}>{Math.round(r.totalAreaSqm||0)} sqm</div></div>
                </div>
                {r.buildCost>0&&<div style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text-d)",marginBottom:12}}>Total build cost: <span style={{color:"var(--amber)"}}>{fmt(r.buildCost||0,currencySymbol)}</span></div>}
                <div className="inp-row-3">
                  <div className="inp-group"><label className="inp-label">Professional Fees (%)</label><input className="inp" type="number" step="0.5" value={data.professionalFeesPct??""} onChange={e=>set("professionalFeesPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Contingency (%)</label><input className="inp" type="number" step="0.5" value={data.contingencyPct??""} onChange={e=>set("contingencyPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Other Costs ({currencySymbol})</label><input className="inp" type="number" value={data.otherCosts??""} onChange={e=>set("otherCosts",e.target.value)}/></div>
                </div>
                <VATCILBlock data={data} set={set} r={r} currencySymbol={currencySymbol} showCIL={true}/>
                {/* Cost summary */}
                {(r.totalCost||0)>0&&(
                  <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginTop:20}}>
                    <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Cost Summary</div>
                    {[
                      ["Land",r.landCost||0,"var(--text-m)"],
                      ["SDLT",r.sdlt||0,"var(--text-d)"],
                      ["Build Cost",r.buildCost||0,"var(--text-m)"],
                      ["Prof Fees + Contingency",(r.profFees||0)+(r.contingency||0),"var(--text-d)"],
                      ...(r.vat>0?[[vatLabel(data.currency||"GBP"),r.vat,"var(--amber)"]]:[] as any),
                      ...(r.cil>0?[["CIL",r.cil,"var(--amber)"]]:[] as any),
                      ...(r.s106>0?[["Section 106",r.s106,"var(--amber)"]]:[] as any),
                      ["Finance Cost",r.totalFinanceCost||0,"var(--amber)"],
                      ["Total",r.totalCost||0,"var(--gold)"],
                    ].map(([l,v,c]:any)=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}>
                        <span style={{color:"var(--text-m)"}}>{l}</span>
                        <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:l==="Total"?600:400}}>{fmt(v,currencySymbol)}</span>
                      </div>
                    ))}
                    {r.totalAreaSqm>0&&<div style={{fontSize:10,color:"var(--text-d)",marginTop:8,fontFamily:"var(--font-mono)"}}>
                      Cost/sqm: <span style={{color:"var(--text-m)"}}>{currencySymbol}{Math.round((r.totalCost||0)/r.totalAreaSqm)}</span>
                    </div>}
                  </div>
                )}
              </div>
            )}
















            {/* ══════════════════════════════════════════════════════════════
                COMMERCIAL — CASHFLOW TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab==="cashflow"&&assetType==="Commercial"&&(
              <div>
                <div className="section-title">Cashflow</div>
                <div style={{fontSize:12,color:"var(--text-d)",marginBottom:16}}>
                  S-curve build draw · {r.buildMonths}m construction · {r.stabMonths}m letting-up ramp · exit at {r.exitMethod==="vp"?"VP value":r.exitMethod==="equivalent"?"equivalent yield":"NIY"}
                </div>
                <CashflowChart uCfs={r.uCfs||[]} totalMonths={r.totalMonths||0} buildMonths={r.buildMonths||0} exitLabel={r.exitMethod==="vp"?"VP exit":r.exitMethod==="equivalent"?"EY exit":"NIY exit"} currencySymbol={currencySymbol} phaseLabels={[`Build (${r.buildMonths}m)`,`Letting-up (${r.stabMonths}m)`]}/>
              </div>
            )}
































            {/* ══════════════════════════════════════════════════════════════
                COMMERCIAL — ANALYSIS TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab==="analysis"&&assetType==="Commercial"&&(
              <div>
                <div className="section-title">Returns Summary</div>
                <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:20,marginBottom:20}}>
                  {([
                    ["GDV",fmt(r.gdv||0,currencySymbol),"var(--gold)"],
                    ["Total ERV pa",fmt(r.totalErv||0,currencySymbol),"var(--text)"],
                    ["Net Passing Rent pa",fmt(r.totalNetPassing||0,currencySymbol),"var(--text-m)"],
                    ["Total Cost",fmt(r.totalCost||0,currencySymbol),"var(--text-m)"],
                    ["Equity In",fmt(r.equity||0,currencySymbol),"var(--gold)"],
                    [vatLabel(data.currency||"GBP"),(r.vat||0)>0?fmt(r.vat||0,currencySymbol):"—",(r.vat||0)>0?"var(--amber)":"var(--text-d)"],
                    ["CIL",(r.cil||0)>0?fmt(r.cil||0,currencySymbol):"—",(r.cil||0)>0?"var(--amber)":"var(--text-d)"],
                    ["Section 106",(r.s106||0)>0?fmt(r.s106||0,currencySymbol):"—",(r.s106||0)>0?"var(--amber)":"var(--text-d)"],
                    ["Finance Cost",fmt(r.totalFinanceCost||0,currencySymbol),"var(--amber)"],
                    ["Peak Loan Balance",fmt(r.peakLoanBalance||0,currencySymbol),"var(--amber)"],
                    ["Profit",fmt(r.profit||0,currencySymbol),(r.profit||0)>0?"var(--green)":"var(--red)"],
                    ["Profit on Cost",fmtPct(r.poc||0),(r.poc||0)>0.2?"var(--green)":(r.poc||0)>0.1?"var(--amber)":"var(--red)"],
                    ["Profit on GDV",fmtPct(r.margin||0),"var(--text-m)"],
                    ["Yield on Cost",fmtPct(r.yoc||0),"var(--blue)"],
                    ["DSCR",isFinite(r.dscr||0)?r.dscr>0?fmtX(r.dscr):"—":"—",(r.dscr||0)>=1.5?"var(--green)":(r.dscr||0)>=1.25?"var(--amber)":"var(--red)"],
                    ["Residual Land Value",fmt(r.rlv||0,currencySymbol),(r.rlv||0)>0?"var(--gold)":"var(--red)"],
                    ["Break-even Rent",r.totalAreaSqm>0?`${currencySymbol}${Math.round(r.breakEvenRentPsm||0)}/sqm/yr`:"—","var(--text-m)"],
                    ["Break-even Yield",fmtPct(r.breakEvenYield||0),"var(--text-m)"],
                    ["IRR (Unlevered)",fmtPct(r.irr||0),irrCol(r.irr||0)],
                    ["IRR (Levered)",fmtPct(r.irrLevered||0),irrCol(r.irrLevered||0)],
                    ["Equity Multiple",fmtX(r.moic||0),(r.moic||0)>1.5?"var(--green)":"var(--text)"],
                    ["Avg WAULT",`${(r.avgWault||0).toFixed(1)} yrs`,"var(--blue)"],
                    ["Reversion to ERV",(r.totalErv||0)>0?fmtPct(((r.totalErv||0)-(r.totalPassing||0))/(r.totalErv||1)):"—","var(--text-d)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                </div>
















                {/* Sensitivity matrix: NIY rows × ERV shift cols */}
                {(r.sensMatrix||[]).length>0&&(
                  <div style={{marginBottom:28}}>
                    <div className="section-title">Sensitivity — Profit on Cost %</div>
                    <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12}}>NIY / exit cap rate (rows) × net passing rent shift (columns)</div>
                    <div className="sens-wrap">
                      <div style={{display:"grid",gridTemplateColumns:"70px repeat(5,1fr)",gap:4,minWidth:380}}>
                        <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",display:"flex",alignItems:"flex-end",paddingBottom:4}}>NIY ↕</div>
                        {["-10%","-5%","Base","+5%","+10%"].map(h=><div key={h} style={{textAlign:"center",color:"var(--text-d)",padding:"4px",fontSize:10}}>{h}</div>)}
                        {(r.sensMatrix||[]).map((row:number[],si:number)=>{
                          const niyVal=((r.niy||0.055)*100+[-0.5,-0.25,0,0.25,0.5][si]).toFixed(2);
                          return(
                            <React.Fragment key={si}>
                              <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6,color:"var(--text-d)",fontFamily:"var(--font-mono)",fontSize:10}}>{niyVal}%</div>
                              {row.map((poc:number,ri:number)=>(
                                <div key={ri} className={`sens-cell ${poc>0.20?"cell-g":poc>0.10?"cell-a":"cell-r"} ${si===2&&ri===2?"cell-base":""}`}>{(poc*100).toFixed(1)}%</div>
                              ))}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:16,marginTop:10}}>
                      {([["rgba(61,220,132,.15)","> 20%"],["rgba(240,164,41,.12)","10–20%"],["rgba(244,100,95,.12)","< 10%"]] as [string,string][]).map(([bg,l])=>(
                        <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--text-d)"}}><div style={{width:10,height:10,borderRadius:2,background:bg}}/>{l}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* COMPARABLES TAB — Flip only */}
            {activeTab==="comps"&&assetType==="Flip"&&(
              <div>
                <div className="section-title">Market Comparables</div>
                <div style={{fontSize:12,color:"var(--text-d)",marginBottom:4}}>
                  Live comparable search for <strong style={{color:"var(--text-m)"}}>{data.location||"your location"}</strong> — powered by web search.
                </div>
                <div style={{fontSize:11,color:"var(--text-d)",marginBottom:16,padding:"8px 12px",background:"var(--bg3)",borderRadius:6,borderLeft:"3px solid var(--gold)"}}>
                  ◈ Uses real-time web search to pull current sold prices and rental listings from Rightmove, Zoopla and Land Registry. For best results add a specific location (e.g. "Hackney, London" or "Didsbury, Manchester").
                </div>
                {!data.location&&(
                  <div style={{fontSize:11,color:"var(--amber)",padding:"8px 12px",background:"rgba(240,164,41,.06)",border:"1px solid rgba(240,164,41,.2)",borderRadius:6,marginBottom:12}}>
                    ⚠ Add a location in the General tab first to get accurate comparables.
                  </div>
                )}
                {/* Comps gated to Pro + trial — free users see upgrade prompt */}
                {(isPro||isTrialing)?(
                  <button
                    onClick={runFlipCompsAI}
                    disabled={flipCompsRunning||!data.location}
                    style={{display:"flex",alignItems:"center",gap:6,background:flipCompsRunning?"var(--bg3)":"var(--gold-bg)",border:"1px solid var(--gold-border)",borderRadius:6,color:flipCompsRunning?"var(--text-d)":"var(--gold)",fontSize:11,padding:"10px 16px",cursor:flipCompsRunning||!data.location?"not-allowed":"pointer",fontFamily:"var(--font-body)",fontWeight:600,width:"100%",justifyContent:"center",marginBottom:16,transition:"all .2s"}}
                  >
                    {flipCompsRunning
                      ?<><span style={{width:10,height:10,border:"1.5px solid rgba(201,168,76,.2)",borderTopColor:"var(--gold)",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/> Searching live property data…</>
                      :<><span style={{fontSize:13}}>⌖</span>{flipComps?"Refresh Comparables":"Search Live Comparables"}{!data.location?" (add location first)":""}</>
                    }
                  </button>
                ):(
                  <div style={{marginBottom:16,padding:"12px 16px",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:6,textAlign:"center"}}>
                    <div style={{fontSize:12,color:"var(--text-m)",fontWeight:600,marginBottom:4}}>✦ Pro feature</div>
                    <div style={{fontSize:11,color:"var(--text-d)",marginBottom:10}}>Live comparable search is available on the Pro plan. Your 14-day trial includes full access.</div>
                    <button onClick={()=>router.push("/pricing")} style={{padding:"7px 20px",background:"var(--gold)",border:"none",borderRadius:5,color:"#0D1017",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"var(--font-body)"}}>
                      Upgrade to Pro
                    </button>
                  </div>
                )}
                {flipCompsError&&<div style={{fontSize:11,color:"var(--red)",padding:"8px 12px",background:"rgba(244,100,95,.06)",borderRadius:6,marginBottom:12}}>{flipCompsError}</div>}
                {flipComps&&(
                  <div style={{animation:"fadeIn .3s ease"}}>
                    {/* Data source badge */}
                    {(flipComps.dataSource||flipComps.dataDate)&&(
                      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                        {flipComps.dataSource&&<span style={{fontSize:10,color:"var(--text-d)",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:4,padding:"3px 8px"}}>Source: {flipComps.dataSource}</span>}
                        {flipComps.dataDate&&<span style={{fontSize:10,color:"var(--text-d)",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:4,padding:"3px 8px"}}>As of: {flipComps.dataDate}</span>}
                        <span style={{fontSize:10,color:"var(--amber)",background:"rgba(240,164,41,.06)",border:"1px solid rgba(240,164,41,.15)",borderRadius:4,padding:"3px 8px"}}>AI-assisted — verify before transacting</span>
                      </div>
                    )}
                    {/* Market context */}
                    {flipComps.marketContext&&<div style={{fontSize:12,color:"var(--text-m)",lineHeight:1.7,marginBottom:16,padding:"10px 14px",background:"var(--bg3)",borderRadius:8,borderLeft:"3px solid var(--gold)"}}>{flipComps.marketContext}</div>}
                    {/* Price range summary */}
                    {flipComps.priceRange&&(
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
                        {[
                          {l:"Price range",v:`${currencySymbol}${Math.round(flipComps.priceRange.low/1000)}k–${currencySymbol}${Math.round(flipComps.priceRange.high/1000)}k`,c:"var(--text-m)"},
                          {l:"Avg £/sqft",v:flipComps.avgPricePsf?`${currencySymbol}${flipComps.avgPricePsf}/sqft`:"—",c:"var(--gold)"},
                          {l:"Avg rent",v:flipComps.avgRentPcm?`${currencySymbol}${flipComps.avgRentPcm}/mo`:"—",c:"var(--green)"},
                        ].map(m=>(
                          <div key={m.l} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px"}}>
                            <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{m.l}</div>
                            <div style={{fontFamily:"var(--font-mono)",fontSize:13,fontWeight:600,color:m.c}}>{m.v}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Sold comps */}
                    {flipComps.comparables?.length>0&&(
                      <div style={{marginBottom:20}}>
                        <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Sold Comparables</div>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                          {flipComps.comparables.map((c:any,i:number)=>(
                            <div key={i} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 14px"}}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                                <div>
                                  <div style={{fontSize:12,color:"var(--text)",fontWeight:500}}>{c.address}</div>
                                  <div style={{fontSize:10,color:"var(--text-d)",marginTop:2}}>{c.bedrooms}bed · {c.type}{c.sqft?` · ${c.sqft}sqft`:""} · {c.sold}</div>
                                </div>
                                <div style={{textAlign:"right"}}>
                                  <div style={{fontFamily:"var(--font-mono)",fontSize:13,color:"var(--gold)",fontWeight:600}}>{fmt(c.price,currencySymbol)}</div>
                                  {c.pricePsf&&<div style={{fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{currencySymbol}{c.pricePsf}/sqft</div>}
                                </div>
                              </div>
                              {c.notes&&<div style={{fontSize:10,color:"var(--text-d)",fontStyle:"italic"}}>{c.notes}</div>}
                            </div>
                          ))}
                        </div>
                        {flipComps.avgPricePsf&&(
                          <div style={{marginTop:8,padding:"10px 12px",background:"var(--gold-bg)",border:"1px solid var(--gold-border)",borderRadius:6,fontSize:11}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:data.propertySqft>0?6:0}}>
                              <span style={{color:"var(--text-d)"}}>Market avg psf: <span style={{color:"var(--gold)",fontFamily:"var(--font-mono)",fontWeight:600}}>{currencySymbol}{flipComps.avgPricePsf}/sqft</span></span>
                              {data.propertySqft>0&&<span style={{color:"var(--text-d)"}}>Implied value: <span style={{color:"var(--green)",fontFamily:"var(--font-mono)",fontWeight:600}}>{fmt(flipComps.avgPricePsf*num(String(data.propertySqft)),currencySymbol)}</span></span>}
                            </div>
                            {data.propertySqft>0&&(
                              <button
                                onClick={()=>{const v=Math.round(flipComps.avgPricePsf*num(String(data.propertySqft)));set("salePrice",v);set("salePricePsf",flipComps.avgPricePsf);}}
                                style={{width:"100%",padding:"6px",background:"transparent",border:"1px dashed var(--gold-border)",borderRadius:5,color:"var(--gold)",fontSize:11,cursor:"pointer",fontFamily:"var(--font-body)",marginTop:4}}
                              >
                                ↗ Apply market avg as sale price ({fmt(flipComps.avgPricePsf*num(String(data.propertySqft)),currencySymbol)})
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Refurb uplift */}
                    {flipComps.refurbUplift&&(
                      <div style={{marginBottom:20,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:14}}>
                        <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Typical Refurb Uplift</div>
                        <div style={{fontSize:12,color:"var(--text-m)",marginBottom:4}}>{currencySymbol}{flipComps.refurbUplift.low}–{currencySymbol}{flipComps.refurbUplift.high} uplift on a property this size</div>
                        {flipComps.refurbUplift.notes&&<div style={{fontSize:11,color:"var(--text-d)",fontStyle:"italic"}}>{flipComps.refurbUplift.notes}</div>}
                      </div>
                    )}
                    {/* Rental comps */}
                    {flipComps.rentalComps?.length>0&&(
                      <div>
                        <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Rental Comparables</div>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                          {flipComps.rentalComps.map((c:any,i:number)=>(
                            <div key={i} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <div>
                                <div style={{fontSize:12,color:"var(--text)",fontWeight:500}}>{c.address}</div>
                                <div style={{fontSize:10,color:"var(--text-d)",marginTop:2}}>{c.bedrooms}bed · {c.type}{c.notes?` · ${c.notes}`:""}</div>
                              </div>
                              <div style={{fontFamily:"var(--font-mono)",fontSize:13,color:"var(--green)",fontWeight:600}}>{currencySymbol}{c.rentPcm}/mo</div>
                            </div>
                          ))}
                        </div>
                        {flipComps.avgRentPcm&&(
                          <div style={{marginTop:8,padding:"8px 12px",background:"rgba(61,220,132,.06)",border:"1px solid rgba(61,220,132,.2)",borderRadius:6,fontSize:11,display:"flex",justifyContent:"space-between"}}>
                            <span style={{color:"var(--text-d)"}}>Market avg rent</span>
                            <span style={{color:"var(--green)",fontFamily:"var(--font-mono)",fontWeight:600}}>{currencySymbol}{flipComps.avgRentPcm}/mo</span>
                          </div>
                        )}
                        {flipComps.grossYieldRange&&(
                          <div style={{marginTop:6,padding:"8px 12px",background:"rgba(91,156,246,.06)",border:"1px solid rgba(91,156,246,.2)",borderRadius:6,fontSize:11,display:"flex",justifyContent:"space-between"}}>
                            <span style={{color:"var(--text-d)"}}>Typical gross yield range</span>
                            <span style={{color:"var(--blue)",fontFamily:"var(--font-mono)",fontWeight:600}}>{flipComps.grossYieldRange.low}% – {flipComps.grossYieldRange.high}%</span>
                          </div>
                        )}
                        {/* Apply avg rent to deal */}
                        {flipComps.avgRentPcm>0&&(
                          <button
                            onClick={()=>set("rentPcm",flipComps.avgRentPcm)}
                            style={{marginTop:8,width:"100%",padding:"8px",background:"transparent",border:"1px dashed var(--border)",borderRadius:6,color:"var(--text-d)",fontSize:11,cursor:"pointer",fontFamily:"var(--font-body)",transition:"all .2s"}}
                            onMouseEnter={e=>(e.currentTarget.style.borderColor="var(--gold)",e.currentTarget.style.color="var(--gold)")}
                            onMouseLeave={e=>(e.currentTarget.style.borderColor="var(--border)",e.currentTarget.style.color="var(--text-d)")}
                          >
                            ↗ Apply avg rent ({currencySymbol}{flipComps.avgRentPcm}/mo) to this deal
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* IM FEES TAB — Advanced Hotel only */}
            {activeTab==="im"&&assetType==="Hotel"&&hotelMode==="advanced"&&(
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <div className="section-title">Investment Manager</div>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"var(--text-m)",cursor:"pointer"}}>
                    <input type="checkbox" checked={data.imEnabled||false} onChange={e=>set("imEnabled",e.target.checked)} style={{width:16,height:16}}/>
                    IM involved in this deal
                  </label>
                </div>
                {!data.imEnabled?(
                  <div style={{padding:"40px 20px",textAlign:"center",background:"var(--bg3)",borderRadius:10,border:"1px solid var(--border)"}}>
                    <div style={{fontSize:14,color:"var(--text-d)",marginBottom:8}}>No investment manager</div>
                    <div style={{fontSize:12,color:"var(--text-d)"}}>Toggle above if an IM is involved. Covers acquisition fee, base charge and incentive fees.</div>
                  </div>
                ):(
                  <>
                    <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:16,marginBottom:16}}>
                      <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>One-Off Fees</div>
                      <div className="inp-row">
                        <div className="inp-group"><label className="inp-label">Acquisition Fee ({currencySymbol})</label><input className="inp" type="number" value={data.imAcqFee??""} onChange={e=>set("imAcqFee",e.target.value)}/></div>
                        <div className="inp-group"><label className="inp-label">Fee Type</label><select className="inp" value={data.imAcqFeeType||"fixed"} onChange={e=>set("imAcqFeeType",e.target.value)}><option value="fixed">Fixed £</option><option value="pct">% of Purchase Price</option></select></div>
                      </div>
                    </div>
                    <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:16,marginBottom:16}}>
                      <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Recurring Fees (Annual)</div>
                      <div className="inp-row">
                        <div className="inp-group"><label className="inp-label">Base Annual Charge ({currencySymbol} pa)</label><input className="inp" type="number" value={data.imBasePA??""} onChange={e=>set("imBasePA",e.target.value)}/></div>
                        <div className="inp-group"><label className="inp-label">Charged On</label><select className="inp" value={data.imBaseChargedOn||"minimum"} onChange={e=>set("imBaseChargedOn",e.target.value)}><option value="minimum">Fixed Minimum</option><option value="revenue">% of Revenue</option></select></div>
                      </div>
                    </div>
                    <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:16,marginBottom:16}}>
                      <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Incentive Fees (on Exit)</div>
                      <div className="inp-row">
                        <div className="inp-group"><label className="inp-label">On Gross Sales (%)</label><input className="inp" type="number" step="0.1" value={data.imIncentiveSalesPct??""} onChange={e=>set("imIncentiveSalesPct",e.target.value)}/></div>
                        <div className="inp-group"><label className="inp-label">On Net Profit (%)</label><input className="inp" type="number" step="0.5" value={data.imIncentiveProfitPct??""} onChange={e=>set("imIncentiveProfitPct",e.target.value)}/></div>
                      </div>
                    </div>
                    {/* IM fee summary */}
                    {hotelAdv&&(
                      <div style={{background:"var(--gold-bg)",border:"1px solid var(--gold-border)",borderRadius:10,padding:16}}>
                        <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>IM Fee Summary</div>
                        {([
                          ["Acquisition Fee (one-off)",hotelAdv.imAcqFee],
                          [`Base Charge (${data.holdYears||5} years)`,hotelAdv.imBasePATotal],
                          ["Incentive on Sales",hotelAdv.imIncentiveSales],
                          ["Incentive on Profit",hotelAdv.imIncentiveProfit],
                          ["Total IM Fees",(hotelAdv.imAcqFee||0)+(hotelAdv.imBasePATotal||0)+(hotelAdv.imIncentiveSales||0)+(hotelAdv.imIncentiveProfit||0)],
                        ] as any[]).map(([l,v],i)=>(
                          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<4?"1px solid var(--gold-border)":"none",fontSize:12}}>
                            <span style={{color:i===4?"var(--gold)":"var(--text-m)",fontWeight:i===4?600:400}}>{l}</span>
                            <span style={{fontFamily:"var(--font-mono)",color:i===4?"var(--gold)":"var(--amber)",fontWeight:i===4?600:400}}>{fmt(v||0,currencySymbol)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
































































                {/* Undistributed expenses — Advanced */}
                <div style={{height:1,background:"var(--border)",margin:"24px 0"}}/>
                <div className="section-title">Undistributed Expenses</div>
                <div style={{fontSize:11,color:"var(--text-d)",marginBottom:14}}>As % of total revenue — used in Advanced P&L model</div>
                <div className="inp-row-3">
                  <div className="inp-group"><label className="inp-label">Info & Telecom (%)</label><input className="inp" type="number" step="0.1" value={data.itPct??""} onChange={e=>set("itPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Admin & General (%)</label><input className="inp" type="number" step="0.1" value={data.agPct??""} onChange={e=>set("agPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Sales & Marketing (%)</label><input className="inp" type="number" step="0.1" value={data.smPct??""} onChange={e=>set("smPct",e.target.value)}/></div>
                </div>
                <div className="inp-row-3">
                  <div className="inp-group"><label className="inp-label">POM (%)</label><input className="inp" type="number" step="0.1" value={data.pomPct??""} onChange={e=>set("pomPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Utilities (%)</label><input className="inp" type="number" step="0.1" value={data.utilPct??""} onChange={e=>set("utilPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Mgmt Fee (%)</label><input className="inp" type="number" step="0.1" value={data.mgmtFeePct??""} onChange={e=>set("mgmtFeePct",e.target.value)}/></div>
                </div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Real Estate Tax (%)</label><input className="inp" type="number" step="0.1" value={data.realEstateTaxPct??""} onChange={e=>set("realEstateTaxPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Insurance (%)</label><input className="inp" type="number" step="0.1" value={data.insurancePct??""} onChange={e=>set("insurancePct",e.target.value)}/></div>
                </div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">FF&E Reserve (% from Yr3)</label><input className="inp" type="number" step="0.5" value={data.ffePct??""} onChange={e=>set("ffePct",e.target.value)}/></div>
                </div>
              </div>
            )}
































































            {/* CASHFLOW HOTEL */}
            {activeTab==="cashflow"&&assetType==="Hotel"&&hotelMode==="simple"&&(
              <div>
                <div className="section-title">Cashflow</div>
                <div style={{fontSize:12,color:"var(--text-d)",marginBottom:16}}>
                  {r.buildMonths}m refurb / fit-out · {r.stabMonths}m ramp-up to stabilised EBITDA · exit at cap rate
                </div>
                <CashflowChart uCfs={r.uCfs||[]} totalMonths={r.totalMonths||0} buildMonths={r.buildMonths||0} exitLabel="Exit value" currencySymbol={currencySymbol} phaseLabels={[`Refurb (${r.buildMonths}m)`,`Stabilisation (${r.stabMonths}m)`]}/>
              </div>
            )}








            {/* CASHFLOW HOTEL ADVANCED — annual year-by-year */}
            {activeTab==="cashflow"&&assetType==="Hotel"&&hotelMode==="advanced"&&hotelAdv&&(()=>{
              const adv=hotelAdv;
              const holdYears=adv.yearRevenue?.length||5;
              const sym=currencySymbol;
              const fmt2=(n:number)=>{const a=Math.abs(n);return(n<0?"-":"")+sym+(a>=1e6?(a/1e6).toFixed(2)+"m":a>=1e3?(a/1e3).toFixed(0)+"k":a.toFixed(0));};
              const rows=adv.yearRevenue||[];
              const equity=adv.equity||0;
              const netExit=adv.netExitProceeds||0;
              const cumulativeArr:number[]=[];
              let cum=-equity;
              cumulativeArr.push(cum);
              rows.forEach((y:any,i:number)=>{
                const noi=y.noi-(adv.supportingCosts||0)-(adv.operatorFees||0);
                cum+= i===holdYears-1?noi+netExit:noi;
                cumulativeArr.push(cum);
              });
              const payback=cumulativeArr.findIndex(v=>v>=0);
              return(
                <div>
                  <div className="section-title">Cashflow — Year by Year</div>
                  <div style={{fontSize:12,color:"var(--text-d)",marginBottom:20}}>
                    {holdYears}-year hold · {adv.rooms} keys · exit at {((adv.exitCapRate||0)*100).toFixed(2)}% cap rate
                  </div>
                  {/* Bar chart */}
                  <div style={{display:"flex",gap:4,alignItems:"flex-end",height:140,marginBottom:12,padding:"0 4px"}}>
                    {[{label:"Day 1",val:-equity,isExit:false},...rows.map((y:any,i:number)=>({label:`Y${i+1}`,val:y.noi-(adv.supportingCosts||0)-(adv.operatorFees||0)+(i===holdYears-1?netExit:0),isExit:i===holdYears-1}))].map((item,idx)=>{
                      const allVals=[-equity,...rows.map((y:any,i:number)=>y.noi-(adv.supportingCosts||0)-(adv.operatorFees||0)+(i===holdYears-1?netExit:0))];
                      const maxAbs=Math.max(...allVals.map(Math.abs),1);
                      const pct=Math.abs(item.val)/maxAbs;
                      const h=Math.max(4,Math.round(pct*110));
                      const isNeg=item.val<0;
                      const col=item.isExit?"var(--gold)":isNeg?"var(--red)":"var(--green)";
                      return(
                        <div key={idx} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                          <div style={{fontSize:9,color:"var(--text-d)",textAlign:"center",whiteSpace:"nowrap"}}>{fmt2(item.val)}</div>
                          <div style={{width:"100%",height:h,background:col,borderRadius:"2px 2px 0 0",opacity:.85,minHeight:4}}/>
                          <div style={{fontSize:9,color:"var(--text-d)"}}>{item.label}</div>
                        </div>
                      );
                    })}
                  </div>
                  {payback>0&&<div style={{fontSize:11,color:"var(--green)",marginBottom:16}}>✓ Payback at Year {payback}</div>}
                  {/* Year table */}
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                      <thead>
                        <tr style={{borderBottom:"1px solid var(--border)"}}>
                          {["Year","Revenue","EBITDA","NOI","Cumulative"].map(h=>(
                            <th key={h} style={{padding:"6px 8px",textAlign:"right",color:"var(--text-d)",fontWeight:400,fontSize:10,textTransform:"uppercase",letterSpacing:".06em",whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((y:any,i:number)=>(
                          <tr key={i} style={{borderBottom:"1px solid var(--border)",background:i%2===0?"var(--bg2)":"var(--bg3)"}}>
                            <td style={{padding:"7px 8px",color:"var(--text-d)",textAlign:"right",fontFamily:"var(--font-mono)"}}>{i===0?"Entry":`Y${i+1}`}</td>
                            <td style={{padding:"7px 8px",color:"var(--text)",textAlign:"right",fontFamily:"var(--font-mono)"}}>{fmt2(y.totalRev)}</td>
                            <td style={{padding:"7px 8px",color:"var(--amber)",textAlign:"right",fontFamily:"var(--font-mono)"}}>{fmt2(y.ebitda)}</td>
                            <td style={{padding:"7px 8px",color:"var(--green)",textAlign:"right",fontFamily:"var(--font-mono)"}}>{fmt2(y.noi)}</td>
                            <td style={{padding:"7px 8px",color:cumulativeArr[i+1]>=0?"var(--green)":"var(--red)",textAlign:"right",fontFamily:"var(--font-mono)",fontWeight:500}}>{fmt2(cumulativeArr[i+1])}</td>
                          </tr>
                        ))}
                        <tr style={{borderTop:"1px solid var(--border-m)",background:"var(--bg1)"}}>
                          <td colSpan={3} style={{padding:"7px 8px",color:"var(--text-d)",fontSize:10,textTransform:"uppercase",letterSpacing:".06em"}}>Exit proceeds</td>
                          <td colSpan={2} style={{padding:"7px 8px",color:"var(--gold)",textAlign:"right",fontFamily:"var(--font-mono)",fontWeight:600}}>{fmt2(netExit)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
































            {activeTab==="cashflow"&&assetType==="BTR"&&(
              <div>
                <div className="section-title">Cashflow</div>
                <div style={{fontSize:12,color:"var(--text-d)",marginBottom:16}}>
                  {data.costProfile==="scurve"?"S-Curve":data.costProfile==="frontloaded"?"Front-Loaded":"Straight-Line"} · {r.buildMonths}m build · {r.stabMonths}m stabilisation · exit at GDV
                </div>
                <CashflowChart uCfs={r.uCfs||[]} totalMonths={r.totalMonths||0} buildMonths={r.buildMonths||0} exitLabel="GDV exit" currencySymbol={currencySymbol} phaseLabels={[`Build (${r.buildMonths}m)`,`Stabilisation (${r.stabMonths}m)`]}/>
              </div>
            )}
















            {activeTab==="cashflow"&&assetType==="BTS"&&(
              <div>
                <div className="section-title">Cashflow</div>
                <div style={{fontSize:12,color:"var(--text-d)",marginBottom:16}}>
                  {data.costProfile==="scurve"?"S-Curve":"Straight-Line"} · {r.buildMonths}m build · {r.absMonths}m absorption · sales proceeds received over absorption period
                </div>
                <CashflowChart uCfs={r.uCfs||[]} totalMonths={r.totalMonths||0} buildMonths={r.buildMonths||0} exitLabel="Sales proceeds" currencySymbol={currencySymbol} phaseLabels={[`Build (${r.buildMonths}m)`,`Absorption (${r.absMonths}m)`]}/>
              </div>
            )}
















            {activeTab==="cashflow"&&assetType==="Flip"&&(()=>{
              // Use the cfs array from the calc engine directly — authoritative, includes cashOutRefi event
              const cfs:number[]=r.cfs||[];
              const bm=Math.max(1,Math.round(r.bridgingMonths||0));
              const sm=Math.max(0,Math.round(r.sellMonths||0));
              const rm=Math.max(1,Math.round(r.refiMonths||0));
              const isHold=r.flipMode==="hold";
              const cashOut=r.cashOutRefi||0;
              const refiInterestPm=r.refiInterestPm||0;
              const netCfPm=r.netCashflowPm||0;
              const isVacant=(r.holdOccupancy||"vacant")==="vacant";
              const totalMos=isHold?(bm+rm):(bm+sm);
              const maxAbs=Math.max(...cfs.map(Math.abs),1);
              // Label each month for the table
              const monthLabel=(m:number):string=>{
                if(m===0) return "Equity deployed";
                if(!isHold){
                  if(m<bm) return `Refurb M${m+1}`;
                  if(m<bm+sm) return `Sell period M${m-bm+1}`;
                  return "Net sale proceeds";
                }
                // hold mode
                if(m<bm) return `Refurb M${m+1}`;
                if(m===bm) return cashOut>100?"Refi — cash released":cashOut<-100?"Refi — equity top-up":"Refi — bridge repaid";
                if(m===bm+rm) return "Sale — refi loan repaid";
                return isVacant?`Hold M${m-bm+1} (vacant — carrying cost)`:`Hold M${m-bm+1} (net rental income)`;
              };
              // Colour each bar: red=outflow, green=inflow, gold=refi event or exit
              const barColour=(m:number,cf:number):string=>{
                if(isHold&&m===bm) return "var(--gold)"; // refi event
                if(m===totalMos-1) return "var(--gold)"; // exit
                return cf>=0?"var(--green)":"var(--red)";
              };
              let cum=0;
              const rows=cfs.map((cf,m)=>{cum+=cf;return{cf,cum,m,label:monthLabel(m),colour:barColour(m,cf)};});
              return(
                <div>
                  <div className="section-title">Cashflow</div>
                  <div style={{fontSize:12,color:"var(--text-d)",marginBottom:4}}>
                    {isHold
                      ?`Construction (${bm}m) → refinance → hold (${rm}m) → sale`
                      :`Construction (${bm}m) → sell period (${sm}m) → proceeds`
                    }
                  </div>
                  {/* Phase summary strip */}
                  {isHold&&(
                    <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                      {[
                        {label:`Bridge (${bm}m)`,color:"var(--red)",note:`${currencySymbol}${Math.round(r.peakLoanBalance||0)} peak loan`},
                        {label:"Refi event",color:"var(--gold)",note:cashOut>100?`${currencySymbol}${Math.round(cashOut)} cash back`:cashOut<-100?`${currencySymbol}${Math.round(Math.abs(cashOut))} top-up needed`:`Bridge fully repaid`},
                        {label:`Hold (${rm}m)`,color:netCfPm>=0?"var(--green)":"var(--red)",note:isVacant?`${currencySymbol}${Math.round(Math.abs(netCfPm))}/mo carrying cost`:`${currencySymbol}${Math.round(netCfPm)}/mo net income`},
                        {label:"Exit",color:"var(--gold)",note:`${currencySymbol}${Math.round((r.netProceeds||0)-(r.refiLoan||0))} net`},
                      ].map(p=>(
                        <div key={p.label} style={{background:"var(--bg3)",border:`1px solid var(--border)`,borderLeft:`3px solid ${p.color}`,borderRadius:6,padding:"6px 10px",minWidth:110}}>
                          <div style={{fontSize:10,fontWeight:600,color:p.color,marginBottom:2}}>{p.label}</div>
                          <div style={{fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{p.note}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Bar chart */}
                  <div style={{overflowX:"auto",marginBottom:20}}>
                    <div style={{display:"flex",alignItems:"flex-end",gap:2,height:140,minWidth:Math.max(400,cfs.length*16)}}>
                      {cfs.map((cf,m)=>{
                        const pct=Math.abs(cf)/maxAbs;
                        const h=Math.max(2,pct*130);
                        const col=barColour(m,cf);
                        const isRefi=isHold&&m===bm;
                        const isExit=m===totalMos-1;
                        return(
                          <div key={m} title={`M${m+1}: ${monthLabel(m)}
${cf>=0?"+":"-"}${currencySymbol}${Math.abs(Math.round(cf)).toLocaleString()}`}
                            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"default"}}>
                            {cf>0&&<div style={{width:"100%",height:h,background:col,borderRadius:"2px 2px 0 0",opacity:.9,outline:isRefi||isExit?"2px solid var(--gold)":"none"}}/>}
                            <div style={{width:"100%",height:2,background:"var(--border)"}}/>
                            {cf<0&&<div style={{width:"100%",height:h,background:col,borderRadius:"0 0 2px 2px",opacity:.85}}/>}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"var(--text-d)",marginTop:4,fontFamily:"var(--font-mono)"}}>
                      <span>M1</span>
                      {isHold&&<span style={{color:"var(--gold)"}}>↑ Refi M{bm+1}</span>}
                      <span>Exit M{totalMos}</span>
                    </div>
                  </div>
                  {/* Legend */}
                  <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}}>
                    {[["var(--red)","Cash out / cost"],["var(--green)","Cash in / income"],["var(--gold)",isHold?"Refi event + Exit":"Sale proceeds"]].map(([c,l])=>(
                      <div key={l as string} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--text-d)"}}><div style={{width:10,height:10,borderRadius:2,background:c as string}}/>{l}</div>
                    ))}
                    <div style={{marginLeft:"auto",fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>
                      Payback: {rows.find(row=>row.cum>=0)?`Month ${rows.find(row=>row.cum>=0)!.m+1}`:"Beyond horizon"}
                    </div>
                  </div>
                  {/* Monthly table — shows ALL months with descriptive labels */}
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"var(--font-mono)"}}>
                      <thead>
                        <tr style={{borderBottom:"1px solid var(--border)"}}>
                          {["Month","Event","Cashflow","Cumulative"].map(h=>(
                            <th key={h} style={{padding:"6px 8px",textAlign:"left",fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(({cf,cum,m,label,colour})=>{
                          const isRefi=isHold&&m===bm;
                          const isExit=m===totalMos-1;
                          const isBridgeZero=!isHold?false:(m>0&&m<bm);
                          if(isBridgeZero&&Math.abs(cf)<1) return(
                            <tr key={m} style={{borderBottom:"1px solid var(--bg4)",opacity:.45}}>
                              <td style={{padding:"4px 8px",color:"var(--text-d)"}}>{m+1}</td>
                              <td style={{padding:"4px 8px",color:"var(--text-d)",fontStyle:"italic"}}>Refurb in progress</td>
                              <td style={{padding:"4px 8px",color:"var(--text-d)"}}>—</td>
                              <td style={{padding:"4px 8px",color:cum>=0?"var(--green)":"var(--text-m)"}}>{cum>=0?"+":""}{currencySymbol}{Math.abs(Math.round(cum)).toLocaleString()}</td>
                            </tr>
                          );
                          return(
                            <tr key={m} style={{borderBottom:"1px solid var(--bg4)",background:isRefi?"rgba(201,168,76,.08)":isExit?"rgba(201,168,76,.04)":"transparent",fontWeight:isRefi||isExit?600:400}}>
                              <td style={{padding:"5px 8px",color:"var(--text-d)"}}>{m+1}{isExit?" (Exit)":""}{isRefi?" (Refi)":""}</td>
                              <td style={{padding:"5px 8px",color:isRefi?"var(--gold)":isExit?"var(--gold)":"var(--text-m)"}}>{label}</td>
                              <td style={{padding:"5px 8px",color:cf>=0?"var(--green)":"var(--red)"}}>{cf>=0?"+":""}{currencySymbol}{Math.abs(Math.round(cf)).toLocaleString()}</td>
                              <td style={{padding:"5px 8px",color:cum>=0?"var(--green)":"var(--text-m)"}}>{cum>=0?"+":""}{currencySymbol}{Math.abs(Math.round(cum)).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Hold mode income/cost breakdown footnote */}
                  {isHold&&(
                    <div style={{marginTop:16,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 14px",fontSize:11}}>
                      <div style={{fontWeight:600,color:"var(--text-m)",marginBottom:8}}>Hold period breakdown (per month)</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8}}>
                        {[
                          {l:"Refi loan",v:`${currencySymbol}${Math.round(r.refiLoan||0).toLocaleString()}`,c:"var(--text-d)"},
                          {l:"Refi rate",v:`${(((r.refiInterestPm||0)/(r.refiLoan||1))*12*100).toFixed(2)}% pa`,c:"var(--text-d)"},
                          {l:"Monthly interest",v:`-${currencySymbol}${Math.round(refiInterestPm).toLocaleString()}`,c:"var(--red)"},
                          ...(isVacant?[
                            {l:"Rental income",v:`Vacant — ${currencySymbol}0`,c:"var(--text-d)"},
                          ]:[
                            {l:"Gross rent",v:`+${currencySymbol}${Math.round((r.netRentPm||0)/(1-(r.voidPct||0)/100)||0).toLocaleString()}/mo`,c:"var(--green)"},
                            {l:"Net rent (after void)",v:`+${currencySymbol}${Math.round(r.netRentPm||0).toLocaleString()}/mo`,c:"var(--green)"},
                          ]) as any[],
                          {l:"Running opex",v:`-${currencySymbol}${Math.round(Math.abs((r.netRentPm||0)-refiInterestPm-netCfPm)||0).toLocaleString()}/mo`,c:"var(--amber)"},
                          {l:"Net monthly",v:`${netCfPm>=0?"+":"-"}${currencySymbol}${Math.round(Math.abs(netCfPm)).toLocaleString()}/mo`,c:netCfPm>=0?"var(--green)":"var(--red)"},
                          ...(cashOut>100?[{l:"Cash released at refi",v:`+${currencySymbol}${Math.round(cashOut).toLocaleString()}`,c:"var(--green)"}]:
                             cashOut<-100?[{l:"Equity top-up at refi",v:`-${currencySymbol}${Math.round(Math.abs(cashOut)).toLocaleString()}`,c:"var(--red)"}]:[]) as any[],
                          {l:"DSCR",v:(r.dscr||0)>0?`${(r.dscr||0).toFixed(2)}×`:"N/A (vacant)",c:(r.dscr||0)>=1.25?"var(--green)":(r.dscr||0)>0?"var(--amber)":"var(--text-d)"},
                        ].map((item:any)=>(
                          <div key={item.l} style={{background:"var(--bg2)",borderRadius:6,padding:"7px 10px"}}>
                            <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>{item.l}</div>
                            <div style={{fontFamily:"var(--font-mono)",fontSize:12,fontWeight:600,color:item.c}}>{item.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
















            {activeTab==="cashflow"&&assetType==="MixedUse"&&(
              <div>
                <div className="section-title">Cashflow</div>
                <div style={{fontSize:12,color:"var(--text-d)",marginBottom:16}}>
                  {r.buildMonths}m programme · active zone income offsets carry costs during build · GDV at completion
                </div>
                <CashflowChart uCfs={r.uCfs||[]} totalMonths={r.totalMonths||0} buildMonths={r.buildMonths||0} exitLabel="GDV / exit" currencySymbol={currencySymbol} phaseLabels={[`Build (${r.buildMonths}m)`,""]}/>
              </div>
            )}
















            {/* ANALYSIS */}
            {activeTab==="analysis"&&(
              <div>
                {/* Advanced Hotel — Per Key Metrics + Year-by-year CF */}
                {assetType==="Hotel"&&hotelMode==="advanced"&&hotelAdv&&(
                  <>
                    {/* Per key panel */}
                    <div style={{marginBottom:24}}>
                      <div className="section-title">Per Key Metrics</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
                        {[
                          {label:"Purchase per Key",value:fmt(hotelAdv.pricePerKey,currencySymbol),color:"var(--text)"},
                          {label:"CapEx per Key",value:fmt(hotelAdv.capexPerKey,currencySymbol),color:"var(--amber)"},
                          {label:"Exit Value per Key",value:fmt(hotelAdv.exitValuePerKey,currencySymbol),color:"var(--gold)"},
                          {label:"EBITDA per Key",value:fmt(hotelAdv.ebitdaPerKey,currencySymbol),color:"var(--green)"},
                          {label:"NOI per Key",value:fmt(hotelAdv.noiPerKey,currencySymbol),color:"var(--blue)"},
                          {label:"NOI Conversion",value:fmtPct(hotelAdv.noiConversion),color:"var(--text-m)"},
                        ].map(m=>(
                          <div key={m.label} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px"}}>
                            <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{m.label}</div>
                            <div style={{fontFamily:"var(--font-mono)",fontSize:14,fontWeight:600,color:m.color}}>{m.value}</div>
                          </div>
                        ))}
                      </div>
































































                      {/* Entry yields */}
                      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:16}}>
                        <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px"}}>
                          <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Entry Yield (vs NOI)</div>
                          <div style={{fontFamily:"var(--font-mono)",fontSize:14,fontWeight:600,color:"var(--blue)"}}>{fmtPct(hotelAdv.entryYieldNOI)}</div>
                        </div>
                        <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px"}}>
                          <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Entry Yield (vs EBITDA)</div>
                          <div style={{fontFamily:"var(--font-mono)",fontSize:14,fontWeight:600,color:"var(--blue)"}}>{fmtPct(hotelAdv.entryYieldEBITDA)}</div>
                        </div>
                      </div>
                    </div>
































































                    {/* Year-by-year investor cashflow */}
                    <div style={{marginBottom:24}}>
                      <div className="section-title">Investor Cashflow — Year by Year</div>
                      <div style={{overflowX:"auto"}}>
                        {(()=>{
                          const yrs=data.holdYears||5;
                          const cols=yrs+1;
                          const headers=["Day 1",...Array.from({length:yrs},(_,i)=>`Yr ${i+1}${i===yrs-1?" (Exit)":""}`)];
                          const rows=[
                            {label:"Revenue",values:hotelAdv.yearRevenue.map((y:any)=>y.totalRev),color:"var(--text-m)",bold:false},
                            {label:"EBITDA",values:hotelAdv.yearRevenue.map((y:any)=>y.ebitda),color:"var(--text)",bold:false},
                            {label:"FF&E",values:hotelAdv.yearRevenue.map((y:any)=>-y.ffe),color:"var(--amber)",bold:false},
                            {label:"NOI",values:hotelAdv.yearRevenue.map((y:any)=>y.noi),color:"var(--green)",bold:true},
                          ];
                          return(
                            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,minWidth:480}}>
                              <thead>
                                <tr>
                                  <th style={{width:90,textAlign:"left",padding:"4px 6px",color:"var(--text-d)",fontWeight:400,fontSize:9,textTransform:"uppercase",letterSpacing:".06em",borderBottom:"1px solid var(--border)"}}></th>
                                  {headers.map((h,i)=><th key={i} style={{textAlign:"center",padding:"4px 6px",color:i===yrs?"var(--gold)":"var(--text-d)",fontWeight:i===yrs?600:400,fontSize:9,textTransform:"uppercase",letterSpacing:".06em",borderBottom:"1px solid var(--border)",whiteSpace:"nowrap"}}>{h}</th>)}
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row,ri)=>(
                                  <tr key={ri}>
                                    <td style={{padding:"5px 6px",color:row.color,fontWeight:row.bold?600:400,fontSize:10,borderBottom:"1px solid var(--border)"}}>{row.label}</td>
                                    {[null,...row.values].map((v:any,ci:number)=>(
                                      <td key={ci} style={{padding:"5px 6px",background:ci%2===0?"var(--bg3)":"transparent",fontFamily:"var(--font-mono)",fontSize:10,color:v===null?"var(--text-d)":v<0?"var(--red)":row.color,textAlign:"center",borderBottom:"1px solid var(--border)"}}>
                                        {v===null?"—":fmt(Math.abs(v),currencySymbol)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                                <tr style={{borderTop:"2px solid var(--border)"}}>
                                  <td style={{padding:"5px 6px",color:"var(--red)",fontSize:10,fontWeight:600}}>Equity Out</td>
                                  {[-(r.equity||0),...Array(yrs).fill(null)].map((v:any,ci:number)=>(
                                    <td key={ci} style={{padding:"5px 6px",background:ci%2===0?"var(--bg3)":"transparent",fontFamily:"var(--font-mono)",fontSize:10,color:v===null?"var(--text-d)":"var(--red)",textAlign:"center"}}>
                                      {v===null?"—":fmt(Math.abs(v),currencySymbol)}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td style={{padding:"5px 6px",color:"var(--gold)",fontSize:10,fontWeight:600}}>Disposal</td>
                                  {[null,...Array(yrs-1).fill(null),hotelAdv.netExitProceeds].map((v:any,ci:number)=>(
                                    <td key={ci} style={{padding:"5px 6px",background:ci%2===0?"var(--bg3)":"transparent",fontFamily:"var(--font-mono)",fontSize:10,color:v===null?"var(--text-d)":"var(--gold)",textAlign:"center",fontWeight:ci===yrs?600:400}}>
                                      {v===null?"—":fmt(Math.abs(v),currencySymbol)}
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          );
                        })()}
                      </div>
                      {/* Summary returns */}
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:14}}>
                        {[
                          {label:"Total Investment",value:fmt(r.totalCost,currencySymbol),color:"var(--text)"},
                          {label:"Profit (before incentive)",value:fmt(r.profit,currencySymbol),color:r.profit>0?"var(--green)":"var(--red)"},
                          {label:"Equity Multiple",value:fmtX(r.moic),color:r.moic>2?"var(--green)":"var(--amber)"},
                          {label:"IRR (Levered)",value:fmtPct(r.irrLevered||r.irr),color:irrCol(r.irrLevered||r.irr||0)},
                        ].map(m=>(
                          <div key={m.label} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px"}}>
                            <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{m.label}</div>
                            <div style={{fontFamily:"var(--font-mono)",fontSize:15,fontWeight:600,color:m.color}}>{m.value}</div>
                          </div>
                        ))}
                      </div>
                      {/* IM incentive fees if applicable */}
                      {data.imEnabled&&hotelAdv&&(hotelAdv.imIncentiveProfit>0||hotelAdv.imIncentiveSales>0)&&(
                        <div style={{marginTop:10,padding:"10px 14px",background:"rgba(201,168,76,.06)",border:"1px solid var(--gold-border)",borderRadius:8,fontSize:11,color:"var(--text-m)"}}>
                          <span style={{color:"var(--gold)",fontWeight:600}}>IM Incentive Fees: </span>
                          On sales {fmt(hotelAdv.imIncentiveSales,currencySymbol)} + On profit {fmt(hotelAdv.imIncentiveProfit,currencySymbol)} = {fmt(hotelAdv.imIncentiveSales+hotelAdv.imIncentiveProfit,currencySymbol)}
                          {" · "}Returns shown before incentive fee
                        </div>
                      )}
                    </div>
                    <div style={{height:1,background:"var(--border)",marginBottom:24}}/>
                  </>
                )}
                <div className="section-title">Returns Summary</div>
                <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:20,marginBottom:20}}>
                  {assetType==="BTR"&&([
                    ["GDV (Exit)",fmt(r.gdv,currencySymbol),"var(--gold)"],["Gross NOI pa",fmt(r.noi,currencySymbol),"var(--text)"],["Total Cost",fmt(r.totalCost,currencySymbol),"var(--text-m)"],["Equity In",fmt(r.equity||0,currencySymbol),"var(--gold)"],["Total Build Cost",fmt(r.buildCost,currencySymbol),"var(--text-m)"],["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),"var(--amber)"],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),"var(--amber)"],["Total Finance Cost",fmt(r.totalFinanceCost,currencySymbol),"var(--amber)"],[vatLabel(data.currency||"GBP"),r.vat>0?fmt(r.vat,currencySymbol):"—",r.vat>0?"var(--amber)":"var(--text-d)"],["CIL",r.cil>0?fmt(r.cil,currencySymbol):"—",r.cil>0?"var(--amber)":"var(--text-d)"],["Section 106",r.s106>0?fmt(r.s106,currencySymbol):"—",r.s106>0?"var(--amber)":"var(--text-d)"],["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],["Profit on Cost",fmtPct(r.poc),r.poc>0.2?"var(--green)":r.poc>0.1?"var(--amber)":"var(--red)"],["Yield on Cost",fmtPct(r.yoc),"var(--blue)"],["IRR (Unlevered)",fmtPct(r.irr),irrCol(r.irr||0)],["IRR (Levered)",fmtPct(r.irrLevered),irrCol(r.irrLevered||0)],["Equity Multiple (MOIC)",fmtX(r.moic),r.moic>2?"var(--green)":"var(--text)"],["DSCR / ICR",isFinite(r.dscr)?fmtX(r.dscr):"—",r.dscr>=1.5?"var(--green)":r.dscr>=1.25?"var(--amber)":"var(--red)"],["Payback Period",r.paybackMonth?`Month ${r.paybackMonth}`:"Beyond horizon","var(--text-m)"],["Break-even Exit Yield",fmtPct(r.breakEvenYield),"var(--text-m)"],["Residual Land Value",fmt(r.rlv,currencySymbol),"var(--gold)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                  {assetType==="BTS"&&([
                    ["GDV",fmt(r.gdv,currencySymbol),"var(--gold)"],["Total Units",r.totalUnits?.toString()||"—","var(--text)"],["Total Sqft",r.totalSqft?.toLocaleString()||"—","var(--text-m)"],["Total Cost",fmt(r.totalCost,currencySymbol),"var(--text-m)"],["Equity In",fmt(r.equity||0,currencySymbol),"var(--gold)"],["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),"var(--amber)"],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),"var(--amber)"],[vatLabel(data.currency||"GBP"),r.vat>0?fmt(r.vat,currencySymbol):"—",r.vat>0?"var(--amber)":"var(--text-d)"],["CIL",r.cil>0?fmt(r.cil,currencySymbol):"—",r.cil>0?"var(--amber)":"var(--text-d)"],["Section 106",r.s106>0?fmt(r.s106,currencySymbol):"—",r.s106>0?"var(--amber)":"var(--text-d)"],["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],["Profit on Cost",fmtPct(r.poc),r.poc>0.2?"var(--green)":r.poc>0.1?"var(--amber)":"var(--red)"],["Profit on GDV",fmtPct(r.margin),r.margin>0.15?"var(--green)":"var(--amber)"],["IRR (Unlevered)",fmtPct(r.irr),irrCol(r.irr||0)],["IRR (Levered)",fmtPct(r.irrLevered),irrCol(r.irrLevered||0)],["Equity Multiple (MOIC)",fmtX(r.moic),r.moic>2?"var(--green)":"var(--text)"],["Payback Period",r.paybackMonth?`Month ${r.paybackMonth}`:"Beyond horizon","var(--text-m)"],["Break-even Sale psf",r.breakEvenPsf?`${currencySymbol}${Math.round(r.breakEvenPsf)}psf`:"—","var(--text-m)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                  {assetType==="Hotel"&&(()=>{
                    const hRev=hotelMode==="advanced"&&r.revenuePa>0?r.revenuePa:hotelRev?.totalRev||0;
                    const hEbitda=hotelMode==="advanced"?r.ebitda:hotelRev?.totalEbitda||0;
                    const rooms=num(String(data.rooms));
                    return([
                      ["RevPAR",fmt(r.revpar||0,currencySymbol),"var(--gold)"],
                      ["Total Revenue pa",fmt(hRev,currencySymbol),"var(--text)"],
                      ["EBITDA pa",fmt(hEbitda,currencySymbol),"var(--green)"],
                      ["GOP Margin",hRev>0?fmtPct(hEbitda/hRev):"—","var(--green)"],
                      ["EBITDA per Room",rooms>0?fmt(hEbitda/rooms,currencySymbol):"—","var(--text-m)"],
                      ["Stabilised Value",fmt(r.stabilisedValue||0,currencySymbol),"var(--text-m)"],
                      ["Exit Value",fmt(r.exitValue||0,currencySymbol),"var(--gold)"],
                      ["Arrangement Fee",fmt(r.arrangementFee||0,currencySymbol),"var(--amber)"],
                      ["Interest (Rolled)",fmt(r.interestCost||0,currencySymbol),"var(--amber)"],
                      ["Total Investment",fmt(r.totalInvestment||r.totalCost||0,currencySymbol),"var(--text-m)"],
                      ["Equity In",fmt(r.equity||0,currencySymbol),"var(--gold)"],
                      [vatLabel(data.currency||"GBP"),(r.vat||0)>0?fmt(r.vat,currencySymbol):"—",(r.vat||0)>0?"var(--amber)":"var(--text-d)"],
                      ["Section 106",(r.s106||0)>0?fmt(r.s106,currencySymbol):"—",(r.s106||0)>0?"var(--amber)":"var(--text-d)"],
                      ["Profit",fmt(r.profit||0,currencySymbol),(r.profit||0)>0?"var(--green)":"var(--red)"],
                      ["Return on Cost",fmtPct(r.poc||0),(r.poc||0)>0.15?"var(--green)":"var(--amber)"],
                      ["Yield on Cost",fmtPct(r.yoc||0),"var(--blue)"],
                      ["IRR (Unlevered)",fmtPct(r.irr||0),irrCol(r.irr||0)],
                      ["IRR (Levered)",fmtPct(r.irrLevered||0),irrCol(r.irrLevered||0)],
                      ["Equity Multiple (MOIC)",fmtX(r.moic||0),(r.moic||0)>2?"var(--green)":"var(--text)"],
                      ["DSCR / ICR",isFinite(r.dscr||0)?fmtX(r.dscr||0):"—",(r.dscr||0)>=1.5?"var(--green)":(r.dscr||0)>=1.25?"var(--amber)":"var(--red)"],
                      ["Payback Period",r.paybackMonth?`Month ${r.paybackMonth}`:"Beyond horizon","var(--text-m)"],
                    ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>);
                  })()}
                  {assetType==="Flip"&&([
                    ["Purchase Price",fmt(r.purchase,currencySymbol),"var(--text)"],
                    ["Property Tax",fmt(r.sdlt,currencySymbol),"var(--amber)"],
                    ["Refurb Cost",fmt(r.refurb,currencySymbol),"var(--text-m)"],
                    [`Refurb /${r.unitSystem||"sqft"}`,r.propertySqft>0?`${currencySymbol}${Math.round(r.refurbPsfDisplay||0)}/${r.unitSystem||"sqft"}`:"—","var(--text-d)"],
                    ["Prof Fees + Contingency",fmt((r.profFees||0)+(r.contingency||0),currencySymbol),"var(--text-d)"],
                    [vatLabel(data.currency||"GBP"),(r.vat||0)>0?fmt(r.vat,currencySymbol):"—",(r.vat||0)>0?"var(--amber)":"var(--text-d)"],
                    ["Section 106",(r.s106||0)>0?fmt(r.s106,currencySymbol):"—",(r.s106||0)>0?"var(--amber)":"var(--text-d)"],
                    ["Finance Cost",fmt(r.totalFinanceCost,currencySymbol),"var(--amber)"],
                    ["Peak Loan Balance",fmt(r.peakLoanBalance||0,currencySymbol),"var(--amber)"],
                    ["Total Cost",fmt(r.totalCost,currencySymbol),"var(--text-m)"],
                    [`Total Cost /${r.unitSystem||"sqft"}`,r.propertySqft>0?`${currencySymbol}${Math.round(r.totalCostPsfDisplay||0)}/${r.unitSystem||"sqft"}`:"—","var(--text-d)"],
                    ["Equity In",fmt(r.equity||0,currencySymbol),"var(--gold)"],
                    ...(r.flipMode==="hold"&&(r.cashOutRefi||0)>100?[[`Cash Released at Refi`,fmt(r.cashOutRefi||0,currencySymbol),"var(--green)"]] as any[]:[] as any[]),
                    ...(r.flipMode==="hold"&&(r.cashOutRefi||0)<-100?[[`Equity Top-up at Refi`,fmt(Math.abs(r.cashOutRefi||0),currencySymbol),"var(--red)"]] as any[]:[] as any[]),
                    ...(r.flipMode==="hold"?(r.netEquityDeployed||0)!==(r.equity||0)?[[`Net Equity Deployed`,fmt(r.netEquityDeployed||0,currencySymbol),"var(--gold)"]] as any[]:[] as any[]:[] as any[]),
                    ["Net Sale Proceeds",fmt(r.netProceeds,currencySymbol),"var(--gold)"],
                    [`Sale /${r.unitSystem||"sqft"}`,r.propertySqft>0?`${currencySymbol}${Math.round(r.salePricePsfDisplay||0)}/${r.unitSystem||"sqft"}`:"—","var(--text-d)"],
                    ["Gross Yield",r.flipMode==="hold"?fmtPct(r.grossYield||0):"—","var(--blue)"],
                    ["Net Yield",r.flipMode==="hold"?fmtPct(r.netYield||0):"—","var(--blue)"],
                    ["Monthly Cashflow",r.flipMode==="hold"?`${currencySymbol}${Math.round(r.netCashflowPm||0)}/mo`:"—",(r.netCashflowPm||0)>0?"var(--green)":"var(--text-d)"],
                    ["DSCR",r.flipMode==="hold"&&r.dscr>0?fmtX(r.dscr):"—",r.flipMode==="hold"?r.dscr>=1.25?"var(--green)":r.dscr>=1.0?"var(--amber)":"var(--red)":"var(--text-d)"],
                    ["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],
                    ["ROI on Total Cost",fmtPct(r.roi),r.roi>0.15?"var(--green)":"var(--amber)"],
                    ["ROI on Equity",fmtPct(r.roiEquity),r.roiEquity>0.25?"var(--green)":"var(--amber)"],
                    ["Equity Multiple (MOIC)",fmtX(r.moic),r.moic>1.5?"var(--green)":"var(--text)"],
                    ["IRR (Annualised)",fmtPct(r.irr),"var(--blue)"],
                    ["Payback Period",r.paybackMonth?`Month ${r.paybackMonth}`:"—","var(--text-m)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                </div>
                {/* ── FLIP SENSITIVITY MATRIX — sale price % × refurb cost % → profit on cost ── */}
                {assetType==="Flip"&&(()=>{
                  const baseSalePrice=r.salePrice||0;
                  const baseRefurb=r.refurb||0;
                  const salePctSteps=[10,5,0,-5,-10];
                  const refurbPctSteps=[-10,-5,0,5,10];
                  // Build 5×5 matrix: rows = sale price % (top=best), cols = refurb cost % (left=cheapest)
                  const flipSensMatrix=salePctSteps.map(sp=>{
                    const modSalePrice=baseSalePrice*(1+sp/100);
                    return refurbPctSteps.map(rp=>{
                      const modRefurb=baseRefurb*(1+rp/100);
                      // Rebuild key numbers with modified sale price + refurb
                      const modProfFees=modRefurb*(num(String(data.professionalFeesPct))/100);
                      const modContingency=modRefurb*(num(String(data.contingencyPct))/100);
                      const purchase=r.purchase||0;
                      const sdlt=r.sdlt||0;
                      const other=num(String(data.otherCosts));
                      const totalFinanceCost=r.totalFinanceCost||0;
                      const modTotalCost=purchase+sdlt+modRefurb+modProfFees+modContingency+other+totalFinanceCost;
                      const agentFees=modSalePrice*(num(String(data.agentFeePct||1.5))/100);
                      const modNetProceeds=modSalePrice-agentFees;
                      const modProfit=modNetProceeds-modTotalCost;
                      return modTotalCost>0?modProfit/modTotalCost:0;
                    });
                  });
                  return(
                    <div style={{marginBottom:28}}>
                      <div className="section-title">Sensitivity — Profit on Cost %</div>
                      <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12}}>Sale price shift (rows) × refurb cost shift (columns)</div>
                      <div className="sens-wrap">
                        <div style={{display:"grid",gridTemplateColumns:"70px repeat(5,1fr)",gap:4,fontSize:10,minWidth:380}}>
                          <div style={{display:"flex",alignItems:"flex-end",paddingBottom:4,color:"var(--text-d)",fontSize:9,letterSpacing:".06em",textTransform:"uppercase"}}>Sale ↕</div>
                          {refurbPctSteps.map(rp=>(
                            <div key={rp} style={{textAlign:"center",color:"var(--text-d)",padding:"4px",fontFamily:"var(--font-mono)"}}>{rp>0?"+":""}{rp}%</div>
                          ))}
                          {flipSensMatrix.map((row:number[],si:number)=>(
                            <React.Fragment key={si}>
                              <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{salePctSteps[si]>0?"+":""}{salePctSteps[si]}%</div>
                              {row.map((poc:number,ri:number)=>(
                                <div key={ri} className={`sens-cell ${poc>0.20?"cell-g":poc>0.10?"cell-a":"cell-r"} ${si===2&&ri===2?"cell-base":""}`}>{(poc*100).toFixed(1)}%</div>
                              ))}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:16,marginTop:12,flexWrap:"wrap"}}>
                        {([["rgba(61,220,132,.15)","> 20%"],["rgba(240,164,41,.12)","10–20%"],["rgba(244,100,95,.12)","< 10%"]] as [string,string][]).map(([bg,l])=>(
                          <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--text-d)"}}><div style={{width:10,height:10,borderRadius:2,background:bg}}/>{l}</div>
                        ))}
                        <div style={{marginLeft:"auto",fontSize:10,color:"var(--text-d)"}}>Finance costs held constant</div>
                      </div>
                    </div>
                  );
                })()}
                {assetType==="Hotel"&&(()=>{
                  // Hotel sensitivity: exit cap rate (rows) × ADR absolute amount (columns)
                  const baseCapRate=num(String(data.exitCapRate||6.5));
                  const baseADR=num(String(data.adr||180));
                  // ADR steps: ±£20 and ±£10 around base (absolute £ values, not %)
                  const adrStep=Math.round(baseADR*0.1/5)*5||10; // ~10% rounded to nearest £5
                  const adrValues=[-2,-1,0,1,2].map(d=>Math.round(baseADR+d*adrStep));
                  const capRates=[-0.5,-0.25,0,0.25,0.5].map(d=>baseCapRate+d);
                  const hotelSensMatrix=capRates.map(cr=>adrValues.map(adr=>{
                    const modData={...data,exitCapRate:cr,adr,yearAdr:null,yearOcc:null};
                    // Use the appropriate calc engine — advanced if in advanced mode
                    const res=hotelMode==="advanced"?calcHotelAdvanced(modData):calcAll("Hotel",modData);
                    return res.poc??0;
                  }));
                  return(
                    <div style={{marginBottom:28}}>
                      <div className="section-title">Sensitivity — Return on Cost %</div>
                      <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12}}>Exit cap rate (rows) × ADR {currencySymbol}/night (columns)</div>
                      <div className="sens-wrap">
                        <div style={{display:"grid",gridTemplateColumns:"80px repeat(5,1fr)",gap:4,fontSize:10,minWidth:400}}>
                          <div/>
                          {adrValues.map(adr=><div key={adr} style={{textAlign:"center",color:"var(--text-d)",padding:"4px",fontFamily:"var(--font-mono)"}}>{currencySymbol}{adr}</div>)}
                          {hotelSensMatrix.map((row:number[],yi:number)=>{
                            const capVal=capRates[yi];
                            return(<React.Fragment key={yi}>
                              <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6,color:"var(--text-d)"}}>{capVal.toFixed(2)}%</div>
                              {row.map((poc:number,ri:number)=>(
                                <div key={ri} className={`sens-cell ${poc>0.15?"cell-g":poc>0.08?"cell-a":"cell-r"} ${yi===2&&ri===2?"cell-base":""}`}>{(poc*100).toFixed(1)}%</div>
                              ))}
                            </React.Fragment>);
                          })}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:16,marginTop:12}}>
                        {[["rgba(61,220,132,.15)","> 15%"],["rgba(240,164,41,.12)","8–15%"],["rgba(244,100,95,.12)","< 8%"]].map(([bg,l])=>(
                          <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--text-d)"}}><div style={{width:10,height:10,borderRadius:2,background:bg}}/>{l}</div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
































































                                {(assetType==="BTR"||assetType==="BTS")&&sensMatrix&&(
                  <div style={{marginBottom:28}}>
                    <div className="section-title">Sensitivity — Profit on Cost %</div>
                    <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12}}>
                      {assetType==="BTS"?"Sale price psf (rows) × build cost psf (columns)":"Exit yield (rows) × rent shift (columns)"}
                    </div>
                    <div className="sens-wrap">
                      <div style={{display:"grid",gridTemplateColumns:"80px repeat(5,1fr)",gap:4,fontSize:10,minWidth:400}}>
                        <div/>
                        {(assetType==="BTS"?["-10%","-5%","Base","+5%","+10%"]:["-10%","-5%","Base","+5%","+10%"]).map(h=><div key={h} style={{textAlign:"center",color:"var(--text-d)",padding:"4px",textTransform:"uppercase",letterSpacing:".06em"}}>{h}</div>)}
                        {sensMatrix.map((row:number[],yi:number)=>{
                          const rowLabel=assetType==="BTS"
                            ?["+10%","+5%","Base","-5%","-10%"][yi]+" sale"
                            :(num(String(data.exitYield))+[-0.5,-0.25,0,0.25,0.5][yi]).toFixed(2)+"%";
                          return(<React.Fragment key={yi}>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6,color:"var(--text-d)"}}>{rowLabel}</div>
                            {row.map((poc:number,ri:number)=>(
                              <div key={ri} className={`sens-cell ${poc>0.20?"cell-g":poc>0.10?"cell-a":"cell-r"} ${yi===2&&ri===2?"cell-base":""}`}>{(poc*100).toFixed(1)}%</div>
                            ))}
                          </React.Fragment>);
                        })}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:16,marginTop:12}}>
                      {[["rgba(61,220,132,.15)","> 20%"],["rgba(240,164,41,.12)","10–20%"],["rgba(244,100,95,.12)","< 10%"]].map(([bg,l])=>(
                        <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--text-d)"}}><div style={{width:10,height:10,borderRadius:2,background:bg}}/>{l}</div>
                      ))}
                    </div>
                  </div>
                )}
                {/* ── STRATEGY COMPARISON — BTR vs BTS only ──────────────────────── */}
                {(assetType==="BTR"||assetType==="BTS")&&(()=>{
                  const currSym2={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";
                  // Build shared inputs from current deal
                  const sharedLand=num(String(data.landCost||data.purchasePrice||0));
                  const sharedBuildPsf=num(String(data.buildCostPsf||0));
                  const sharedSite=num(String(data.siteAreaSqft||0));
                  const sharedLTC=num(String(data.ltc||60));
                  const sharedMargin=num(String(data.marginOverBenchmark||2.5));
                  const sharedArrangement=num(String(data.arrangementFeePct||1.0));
                  const sharedProfFees=num(String(data.professionalFeesPct||8));
                  const sharedContingency=num(String(data.contingencyPct||5));
                  const sharedBenchmarkRate=num(String(data.benchmarkRate||3.97));
































































                  // Strategy definitions — same land, same build, different revenue model
                  // Strategy comparison — BTR vs BTS
                  // BTS sale price derived from BTR rents capitalised at selected yield
                  // This gives a genuine apples-to-apples comparison on the same site
































































                  // Derive BTS units from BTR units
                  // Priority: 1) Manual psf input  2) Yield capitalisation  3) Defaults
                  const manualPsf=num(strategyPsf);
                  const btsUnitsFromBTR=(assetType==="BTR"&&(data.units||[]).length>0)
                    ?(data.units||[]).map((u:any)=>{
                        let salePricePsf:number;
                        if(manualPsf>0){
                          // Use manual/AI suggested psf directly
                          salePricePsf=manualPsf;
                        } else {
                          // Capitalise rent at selected yield
                          const annualRentPsf=num(String(u.rentPcm))*12/Math.max(num(String(u.size)),1);
                          salePricePsf=annualRentPsf/(strategyYield/100);
                        }
                        return{type:u.type.replace(" OMR","").replace(" DMR",""),count:u.count,salePricePsf:Math.round(salePricePsf),size:u.size};
                      })
                    :DEFAULTS.BTS.units;
































































                  // For BTS use actual site area and units, otherwise fall back to defaults
                  const btsSiteArea=sharedSite>0?sharedSite:110000;
                  const btsBuildPsf=sharedBuildPsf>0?sharedBuildPsf:260;
































































                  const strategies=[
                    {
                      key:"BTR", label:"Build to Rent", color:"var(--gold)", icon:"◈",
                      desc:"Income-producing, exit at stabilised yield",
                      data:{
                        ...(assetType==="BTR"?data:DEFAULTS.BTR),
                        landCost:sharedLand, buildCostPsf:sharedBuildPsf||285, siteAreaSqft:sharedSite||195000,
                        ltc:sharedLTC, marginOverBenchmark:sharedMargin, arrangementFeePct:sharedArrangement,
                        professionalFeesPct:sharedProfFees, contingencyPct:sharedContingency,
                        benchmarkRate:sharedBenchmarkRate, currency:data.currency,
                        programmMonths:num(String(data.programmMonths||36)),
                        stabilisationMonths:num(String(data.stabilisationMonths||12)),
                      }
                    },
                    {
                      key:"BTS", label:"Build to Sell", color:"var(--blue)", icon:"◎",
                      desc:`Sale price derived from rent at ${strategyYield}% yield`,
                      data:{...DEFAULTS.BTS,
                        units:btsUnitsFromBTR,
                        landCost:sharedLand, buildCostPsf:btsBuildPsf, siteAreaSqft:btsSiteArea,
                        ltc:sharedLTC, marginOverBenchmark:sharedMargin, arrangementFeePct:sharedArrangement,
                        professionalFeesPct:sharedProfFees, contingencyPct:sharedContingency,
                        benchmarkRate:sharedBenchmarkRate, currency:data.currency,
                        programmMonths:30, absorptionMonths:18,
                      }
                    },
                  ];
































































                  const results=strategies.map(s=>({...s, r:calcAll(s.key,s.data)}));
































































                  // Find best strategy by IRR
                  const bestIRR=Math.max(...results.map(s=>s.r.irr||s.r.annualisedIrr||0));
































































                  return(
                    <div style={{marginBottom:28}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:8}}>
                        <div className="section-title">Strategy Comparison</div>
                        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                          {/* Manual psf input */}
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:10,color:"var(--text-d)"}}>Sale price psf:</span>
                            <input
                              type="number"
                              value={strategyPsf}
                              onChange={e=>{setStrategyPsf(e.target.value);setStrategyPsfSuggestion(null);}}
                              placeholder="or use yield →"
                              style={{width:90,padding:"3px 8px",background:"var(--bg3)",border:`1px solid ${strategyPsf?"var(--gold-border)":"var(--border)"}`,borderRadius:5,color:"var(--text)",fontFamily:"var(--font-mono)",fontSize:11,outline:"none"}}
                            />
                            <button
                              onClick={suggestBTSPsf}
                              disabled={strategyPsfSuggesting||!data.location}
                              style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:5,border:"1px solid var(--gold-border)",background:"var(--gold-bg)",color:"var(--gold)",fontSize:10,cursor:strategyPsfSuggesting||!data.location?"not-allowed":"pointer",fontFamily:"var(--font-body)",fontWeight:600,opacity:!data.location?0.5:1}}
                            >
                              {strategyPsfSuggesting?<span style={{width:8,height:8,border:"1.5px solid rgba(201,168,76,.3)",borderTopColor:"var(--gold)",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>:"◈"}
                              {strategyPsfSuggesting?"…":"AI suggest"}
                            </button>
                            {strategyPsf&&<button onClick={()=>{setStrategyPsf("");setStrategyPsfSuggestion(null);}} style={{fontSize:9,color:"var(--text-d)",background:"none",border:"none",cursor:"pointer",padding:"2px 4px"}}>✕ clear</button>}
                          </div>
                          {/* Yield selector — used when no manual psf */}
                          <div style={{display:"flex",alignItems:"center",gap:6,opacity:strategyPsf?0.4:1,transition:"opacity .2s"}}>
                            <span style={{fontSize:10,color:"var(--text-d)"}}>or yield:</span>
                            <div style={{display:"flex",gap:4}}>
                              {[4,5,6].map(y=>(
                                <button key={y} onClick={()=>{setStrategyYield(y);setStrategyPsf("");}} style={{padding:"2px 10px",borderRadius:5,border:`1px solid ${!strategyPsf&&strategyYield===y?"var(--gold)":"var(--border)"}`,background:!strategyPsf&&strategyYield===y?"var(--gold-bg)":"transparent",color:!strategyPsf&&strategyYield===y?"var(--gold)":"var(--text-d)",fontSize:10,cursor:"pointer",fontFamily:"var(--font-body)",fontWeight:!strategyPsf&&strategyYield===y?600:400}}>{y}%</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* AI suggestion banner */}
                      {strategyPsfSuggestion&&(
                        <div style={{background:"var(--gold-bg)",border:"1px solid var(--gold-border)",borderRadius:6,padding:"6px 12px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                          <div style={{fontSize:10,color:"var(--text-m)"}}>
                            <span style={{color:"var(--gold)",fontWeight:600}}>AI suggestion: </span>
                            {({GBP:"£",USD:"$",EUR:"€",AED:"د.إ"})[data.currency]||""}{strategyPsfSuggestion.low}–{({GBP:"£",USD:"$",EUR:"€",AED:"د.إ"})[data.currency]||""}{strategyPsfSuggestion.high}psf · avg {({GBP:"£",USD:"$",EUR:"€",AED:"د.إ"})[data.currency]||""}{strategyPsfSuggestion.avg}psf
                            {strategyPsfSuggestion.notes&&<span style={{color:"var(--text-d)",marginLeft:6}}>· {strategyPsfSuggestion.notes}</span>}
                          </div>
                          <span style={{fontSize:9,color:"var(--text-d)"}}>Applied ✓</span>
                        </div>
                      )}
                      <div style={{fontSize:11,color:"var(--text-d)",marginBottom:16}}>
                        Current strategy: <span style={{color:"var(--gold)",fontWeight:600}}>{assetType}</span>
                        {" · "}{strategyPsf?`BTS sale price: ${({GBP:"£",USD:"$",EUR:"€",AED:"د.إ"})[data.currency]||""}${strategyPsf}psf`:`BTS sale price derived from rent at ${strategyYield}% yield`}
                        {" · "}same land, build cost and finance
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
                        {results.map(s=>{
                          const isCurrent=s.key===assetType;
                          const irr=s.r.irr||s.r.annualisedIrr||0;
                          const poc=s.r.poc||s.r.roi||0;
                          const gdv=s.r.gdv||s.r.exitValue||s.r.salePrice||s.r.totalInvestment||0;
                          const isBest=irr===bestIRR&&irr>0;
                          return(
                            <div key={s.key} style={{
                              background:isCurrent?"rgba(201,168,76,0.07)":"var(--bg3)",
                              border:`1px solid ${isCurrent?"rgba(201,168,76,.4)":isBest?"rgba(61,220,132,.25)":"var(--border)"}`,
                              borderRadius:12,padding:16,position:"relative",
                              transition:"border-color .2s",
                            }}>
                              {isCurrent&&<div style={{position:"absolute",top:-1,left:"10%",right:"10%",height:2,background:"linear-gradient(90deg,transparent,var(--gold),transparent)",borderRadius:2}}/>}
                              {isBest&&!isCurrent&&<div style={{position:"absolute",top:8,right:8,fontSize:8,color:"var(--green)",background:"rgba(61,220,132,.1)",border:"1px solid rgba(61,220,132,.2)",borderRadius:10,padding:"1px 6px",fontWeight:600,letterSpacing:".06em"}}>BEST IRR</div>}
                              {isCurrent&&<div style={{position:"absolute",top:8,right:8,fontSize:8,color:"var(--gold)",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.2)",borderRadius:10,padding:"1px 6px",fontWeight:600,letterSpacing:".06em"}}>CURRENT</div>}
                              
                              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
                                <span style={{fontSize:14,color:s.color}}>{s.icon}</span>
                                <div>
                                  <div style={{fontSize:11,fontWeight:600,color:isCurrent?s.color:"var(--text)",lineHeight:1.2}}>{s.label}</div>
                                  <div style={{fontSize:9,color:"var(--text-d)",marginTop:1}}>{s.desc}</div>
                                </div>
                              </div>
































































                              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                                {[
                                  {label:"GDV / Exit",value:gdv>0?fmt(gdv,currSym2):"—",color:"var(--text)"},
                                  {label:"Profit on Cost",value:poc>0?fmtPct(poc):"—",color:poc>0.20?"var(--green)":poc>0.10?"var(--amber)":"var(--red)"},
                                  {label:"IRR",value:irr>0?fmtPct(irr):"—",color:irr>0.15?"var(--green)":irr>0.08?"var(--amber)":"var(--text-m)"},
                                  {label:"Programme",value:`${s.data.programmMonths||s.data.bridgingTermMonths||9}m`,color:"var(--text-m)"},
                                ].map(m=>(
                                  <div key={m.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 8px",background:"var(--bg4)",borderRadius:6}}>
                                    <span style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".07em"}}>{m.label}</span>
                                    <span style={{fontSize:11,fontFamily:"var(--font-mono)",fontWeight:600,color:m.color}}>{m.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{marginTop:10,fontSize:10,color:"var(--text-d)",display:"flex",alignItems:"center",gap:6}}>
                        <span style={{color:"var(--amber)"}}>◆</span>
                        Strategy comparison uses indicative defaults for each model. Numbers are directional — not a substitute for a full appraisal per strategy.
                      </div>
                    </div>
                  );
                })()}
































































                                <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:20}}>
                  <div className="section-title" style={{marginBottom:16}}>Share & Export</div>
                  <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                    <button className="share-btn" onClick={()=>setShareModal(true)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      <span className="share-btn-label">Live Link</span>
                    </button>
                    <button className="share-btn" onClick={handleGeneratePDF} disabled={generatingPDF}>
                      {generatingPDF?<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-m)" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-m)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>}
                      <span className="share-btn-label">{generatingPDF?"Generating…":"Plain PDF"}</span>
                    </button>
                    <button className="share-btn" onClick={()=>{if(!isPro&&!isTrialing){router.push("/pricing");return;}setBrochureModal(true);setBrochureContent(null);setBrochurePhotos([]);setBrochureError(null);}} style={{borderColor:"rgba(201,168,76,.25)",opacity:(!isPro&&!isTrialing)?0.6:1}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <span className="share-btn-label" style={{color:"var(--gold)"}}>{(!isPro&&!isTrialing)?"Upgrade":"AI Brochure"}</span>
                    </button>
                    <button className="share-btn" onClick={()=>{if(!liveLink){setSaveError("Generate live link first");return;}shareEmail();}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-m)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <span className="share-btn-label">Email</span>
                    </button>
                    <button className="share-btn" onClick={()=>{if(!liveLink){setSaveError("Generate live link first");return;}shareWhatsApp();}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-m)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                      <span className="share-btn-label">WhatsApp</span>
                    </button>
                  </div>
                  {!saved&&<div style={{fontSize:11,color:"var(--amber)",marginTop:8}}>⚠ Save the appraisal before sharing</div>}
                  {saved&&appraisalId&&<div style={{fontSize:11,color:"var(--text-d)"}}>Appraisal saved · ready to share</div>}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="panel-toggle" onClick={()=>setPanelOpen(o=>!o)}>
          <span>Results & Metrics</span>
          <span style={{fontSize:16,transform:panelOpen?"rotate(180deg)":"none",transition:"transform .2s"}}>▾</span>
        </div>
        {/* RIGHT PANEL */}
        <div className="output-panel" style={{padding:20,position:"sticky",top:0,height:"calc(100vh - 102px)",overflowY:"auto",background:"var(--bg1)",display:panelOpen?"block":"none"}}>
          <div style={{fontFamily:"var(--font-body)",fontSize:18,fontWeight:700,letterSpacing:"-.02em",color:"var(--text)",marginBottom:4}}>{data.name||"New Appraisal"}</div>
          <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12}}>{data.location||"No location"} · {assetType} · {data.currency}</div>
          {/* ── EQUITY IN — always visible ── */}
          <div style={{background:"var(--bg2)",border:"1px solid rgba(201,168,76,.35)",borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:9,color:"var(--gold)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:3}}>Equity In</div>
              <div style={{fontFamily:"var(--font-mono)",fontSize:24,fontWeight:600,color:"var(--gold)"}}>{fmt(r.equity||0,currencySymbol)}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:3}}>of Total Cost</div>
              <div style={{fontFamily:"var(--font-mono)",fontSize:13,color:"var(--text-m)"}}>{r.totalCost||r.totalInvestment?fmtPct((r.equity||0)/(r.totalCost||r.totalInvestment||1)):"—"}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
            {assetType==="BTR"&&[{label:"GDV",value:fmt(r.gdv,currencySymbol),color:"var(--gold)"},{label:"Profit on Cost",value:fmtPct(r.poc),color:r.poc>0.2?"var(--green)":r.poc>0.1?"var(--amber)":"var(--red)"},{label:"IRR (Unlevered)",value:fmtPct(r.irr),color:"var(--blue)"},{label:"IRR (Levered)",value:fmtPct(r.irrLevered),color:"var(--blue)"}].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}><div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div><div style={{fontFamily:"var(--font-mono)",fontSize:18,fontWeight:600,color:m.color}}>{m.value}</div></div>))}
            {assetType==="BTS"&&[{label:"GDV",value:fmt(r.gdv,currencySymbol),color:"var(--gold)"},{label:"Profit on Cost",value:fmtPct(r.poc),color:r.poc>0.2?"var(--green)":"var(--amber)"},{label:"IRR",value:fmtPct(r.irr),color:"var(--blue)"},{label:"Profit on GDV",value:fmtPct(r.margin),color:"var(--text)"}].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}><div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div><div style={{fontFamily:"var(--font-mono)",fontSize:18,fontWeight:600,color:m.color}}>{m.value}</div></div>))}
            {assetType==="Hotel"&&[{label:"Exit Value",value:fmt(r.exitValue,currencySymbol),color:"var(--gold)"},{label:"EBITDA pa",value:fmt(r.ebitda,currencySymbol),color:"var(--green)"},{label:"IRR",value:fmtPct(r.irr),color:"var(--blue)"},{label:"Return on Cost",value:fmtPct(r.poc),color:r.poc>0.15?"var(--green)":"var(--amber)"}].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}><div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div><div style={{fontFamily:"var(--font-mono)",fontSize:18,fontWeight:600,color:m.color}}>{m.value}</div></div>))}
            {assetType==="Commercial"&&[
              {label:"GDV",value:fmt(r.gdv||0,currencySymbol),color:"var(--gold)"},
              {label:"Profit",value:fmt(r.profit||0,currencySymbol),color:(r.profit||0)>0?"var(--green)":"var(--red)"},
              {label:"Profit on Cost",value:fmtPct(r.poc||0),color:(r.poc||0)>0.2?"var(--green)":"var(--amber)"},
              {label:"IRR (Unlev.)",value:fmtPct(r.irr||0),color:"var(--blue)"},
            ].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}><div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div><div style={{fontFamily:"var(--font-mono)",fontSize:18,fontWeight:600,color:m.color}}>{m.value}</div></div>))}
            {assetType==="MixedUse"&&[
              {label:"Total GDV",value:currencySymbol+(Math.round(r.totalGDV||0)).toLocaleString(),color:"var(--gold)"},
              {label:"Profit",value:currencySymbol+(Math.round(r.profit||0)).toLocaleString(),color:(r.profit||0)>0?"var(--green)":"var(--red)"},
              {label:"Profit on Cost",value:fmtPct(r.poc||0),color:(r.poc||0)>0.20?"var(--green)":"var(--amber)"},
              {label:"Blended IRR",value:fmtPct(r.irr||0),color:"var(--blue)"},
            ].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}><div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div><div style={{fontFamily:"var(--font-mono)",fontSize:18,fontWeight:600,color:m.color}}>{m.value}</div></div>))}
            {assetType==="Flip"&&[
              {label:r.flipMode==="hold"?"GDV / Value":"Sale Price",value:fmt(r.salePrice,currencySymbol),color:"var(--gold)"},
              {label:"Profit",value:fmt(r.profit,currencySymbol),color:r.profit>0?"var(--green)":"var(--red)"},
              {label:r.flipMode==="hold"?"Net Yield":"ROI on Cost",value:r.flipMode==="hold"?fmtPct(r.netYield||0):fmtPct(r.roi),color:r.roi>0.15?"var(--green)":"var(--amber)"},
              {label:"IRR",value:fmtPct(r.irr),color:"var(--blue)"},
            ].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}><div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div><div style={{fontFamily:"var(--font-mono)",fontSize:18,fontWeight:600,color:m.color}}>{m.value}</div></div>))}
          </div>
          <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginBottom:16}}>
            <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Institutional Metrics</div>
            {([
              ["Equity Multiple",fmtX(r.moic),r.moic>2?"var(--green)":r.moic>1.5?"var(--amber)":"var(--red)"],
              ...(assetType==="BTR"||assetType==="Hotel"?[["DSCR / ICR",isFinite(r.dscr)?fmtX(r.dscr):"—",r.dscr>=1.5?"var(--green)":r.dscr>=1.25?"var(--amber)":"var(--red)"]] as any[]:[]),
              ...(assetType==="Hotel"?[[
                "GOP Margin",
                hotelMode==="advanced"&&r.revenuePa>0?fmtPct(r.ebitda/r.revenuePa):hotelRev&&hotelRev.totalRev>0?fmtPct(hotelRev.totalEbitda/hotelRev.totalRev):"—",
                "var(--green)"
              ],[
                "EBITDA / Room",
                hotelMode==="advanced"&&r.ebitda&&num(String(data.rooms))>0?fmt(r.ebitda/num(String(data.rooms)),currencySymbol):hotelRev&&num(String(data.rooms))>0?fmt(hotelRev.totalEbitda/num(String(data.rooms)),currencySymbol):"—",
                "var(--text-m)"
              ]] as any[]:[]),
              ["Payback",r.paybackMonth?`Month ${r.paybackMonth}`:"—","var(--text-m)"],
              ...(assetType==="BTR"?[["Break-even Yield",fmtPct(r.breakEvenYield),"var(--text-m)"],["Residual Land Value",fmt(r.rlv,currencySymbol),"var(--gold)"]] as any[]:[]),
              ...(assetType==="BTS"?[["Break-even psf",r.breakEvenPsf?`${currencySymbol}${Math.round(r.breakEvenPsf)}psf`:"—","var(--text-m)"]] as any[]:[]),
            ] as any[]).map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}>
                <span style={{color:"var(--text-m)"}}>{l}</span>
                <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>
          {assetType==="Hotel"&&hotelRev&&(
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginBottom:16}}>
              <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Revenue Breakdown</div>
              {([["Rooms",hotelRev.roomsRev,hotelRev.roomsEbitda,true],["F&B",hotelRev.fnbRev,hotelRev.fnbEbitda,data.fnbEnabled],["Spa",hotelRev.spaRev,hotelRev.spaEbitda,data.spaEnabled],["Gym",hotelRev.gymRev,hotelRev.gymEbitda,data.gymEnabled],["Meetings",hotelRev.meetingRev,hotelRev.meetingEbitda,data.meetingEnabled]] as any[]).filter(([,,,en])=>en).map(([label,rev,ebitda]:any)=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid var(--bg4)",fontSize:11}}>
                  <span style={{color:"var(--text-m)",width:60}}>{label}</span>
                  <span style={{fontFamily:"var(--font-mono)",color:"var(--text-m)"}}>{fmt(rev,currencySymbol)}</span>
                  <span style={{fontFamily:"var(--font-mono)",color:"var(--green)",fontSize:10}}>{fmt(ebitda,currencySymbol)}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:12,marginTop:4}}>
                <span style={{color:"var(--gold)",fontWeight:600}}>Total EBITDA</span>
                <span style={{fontFamily:"var(--font-mono)",color:"var(--green)",fontWeight:600}}>{fmt(hotelRev.totalEbitda,currencySymbol)}</span>
              </div>
            </div>
          )}
          <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginBottom:16}}>
            <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Cost Breakdown</div>
            {assetType==="BTR"&&([{label:"Land + Property Tax",value:(r.landCost||0)+(r.sdlt||0),color:"var(--text-m)"},{label:"Build Cost",value:r.buildCost,color:"var(--text-m)"},{label:"Dev Costs (total)",value:r.devCost,color:"var(--text-m)"},...(r.vat>0?[{label:vatLabel(data.currency||"GBP"),value:r.vat,color:"var(--amber)"}]:[]),...(r.cil>0?[{label:"CIL",value:r.cil,color:"var(--amber)"}]:[]),...(r.s106>0?[{label:"Section 106",value:r.s106,color:"var(--amber)"}]:[]),{label:"Arrangement Fee",value:r.arrangementFee,color:"var(--amber)"},{label:"Interest (Rolled)",value:r.interestCost,color:"var(--amber)"},{label:"Total Finance Cost",value:r.totalFinanceCost,color:"var(--amber)"},{label:"Total Cost",value:r.totalCost,color:"var(--gold)",bold:true}] as any[]).map((item:any)=>(<div key={item.label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}><span style={{color:"var(--text-m)"}}>{item.label}</span><span style={{fontFamily:"var(--font-mono)",color:item.color,fontWeight:item.bold?600:400}}>{fmt(item.value||0,currencySymbol)}</span></div>))}
            {assetType==="BTS"&&([{label:"Land + Property Tax",value:(r.landCost||0)+(r.sdlt||0),color:"var(--text-m)"},{label:"Build Cost",value:r.buildCost,color:"var(--text-m)"},{label:"Arrangement Fee",value:r.arrangementFee,color:"var(--amber)"},{label:"Interest (Rolled)",value:r.interestCost,color:"var(--amber)"},{label:"Total Finance Cost",value:r.totalFinanceCost,color:"var(--amber)"},{label:"Total Cost",value:r.totalCost,color:"var(--gold)",bold:true}] as any[]).map((item:any)=>(<div key={item.label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}><span style={{color:"var(--text-m)"}}>{item.label}</span><span style={{fontFamily:"var(--font-mono)",color:item.color,fontWeight:item.bold?600:400}}>{fmt(item.value||0,currencySymbol)}</span></div>))}
            {assetType==="Hotel"&&([{label:"Purchase + Property Tax",value:(r.purchasePrice||0)+(r.sdlt||0),color:"var(--text-m)"},{label:"CapEx",value:r.capex,color:"var(--text-m)"},{label:"Arrangement Fee",value:r.arrangementFee,color:"var(--amber)"},{label:"Interest (Rolled)",value:r.interestCost,color:"var(--amber)"},{label:"Total Investment",value:r.totalInvestment,color:"var(--gold)",bold:true}] as any[]).map((item:any)=>(<div key={item.label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}><span style={{color:"var(--text-m)"}}>{item.label}</span><span style={{fontFamily:"var(--font-mono)",color:item.color,fontWeight:item.bold?600:400}}>{fmt(item.value||0,currencySymbol)}</span></div>))}
            {assetType==="Flip"&&([
              {label:"Purchase + Property Tax",value:(r.purchase||0)+(r.sdlt||0),color:"var(--text-m)"},
              {label:"Refurb",value:r.refurb||0,color:"var(--text-m)"},
              {label:"Prof Fees + Contingency",value:(r.profFees||0)+(r.contingency||0),color:"var(--text-d)"},
              {label:"Finance Cost",value:r.totalFinanceCost||0,color:"var(--amber)"},
              {label:"Total",value:r.totalCost||0,color:"var(--gold)",bold:true},
            ] as any[]).map((item:any)=>(<div key={item.label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}><span style={{color:"var(--text-m)"}}>{item.label}</span><span style={{fontFamily:"var(--font-mono)",color:item.color,fontWeight:item.bold?600:400}}>{fmt(item.value||0,currencySymbol)}</span></div>))}
          </div>
          {(r.poc!==undefined)&&(
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:11}}>
                <span style={{color:"var(--text-d)"}}>Return vs 20% Target</span>
                <span style={{color:r.poc>0.2?"var(--green)":"var(--amber)",fontFamily:"var(--font-mono)",fontWeight:600}}>{fmtPct(r.poc)}</span>
              </div>
              <div style={{height:6,background:"var(--bg4)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min((r.poc/0.3)*100,100)}%`,background:r.poc>0.2?"linear-gradient(90deg,var(--green),#2ab06a)":"linear-gradient(90deg,var(--amber),#d4920a)",borderRadius:3,transition:"width .3s"}}/>
              </div>
              <div style={{fontSize:9,color:"var(--text-d)",marginTop:6,textAlign:"right"}}>
                {r.poc>0.2?`${((r.poc-0.2)*100).toFixed(1)}% above target`:`${((0.2-r.poc)*100).toFixed(1)}% below target`}
              </div>
            </div>
          )}
          <div style={{background:"var(--bg2)",border:`1px solid ${senseResult?senseResult.overall==="green"?"rgba(61,220,132,.3)":senseResult.overall==="red"?"rgba(244,100,95,.3)":"rgba(240,164,41,.3)":"var(--border)"}`,borderRadius:10,padding:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:senseOpen?12:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setSenseOpen(o=>!o)}>
                <span style={{fontSize:14}}>{senseResult?senseResult.overall==="green"?"✓":senseResult.overall==="red"?"⚠":"⚡":"🔍"}</span>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:senseResult?senseResult.overall==="green"?"var(--green)":senseResult.overall==="red"?"var(--red)":"var(--amber)":"var(--text-m)"}}>
                    {senseResult?senseResult.overall==="green"?"Assumptions look credible":senseResult.overall==="red"?"Critical issues found":`${senseResult.flags.length} assumption${senseResult.flags.length!==1?"s":""} to review`:"AI Sense Check"}
                  </div>
                  {senseResult&&<div style={{fontSize:10,color:"var(--text-d)",marginTop:1}}>{senseOpen?"click to collapse":"click to expand"}</div>}
                </div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={runStaticChecks} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:5,color:"var(--text-m)",fontSize:10,padding:"4px 8px",cursor:"pointer",fontFamily:"var(--font-body)"}}>Quick</button>
                <button onClick={()=>{if(!isPro&&!isTrialing){router.push("/pricing");return;}runAISenseCheck();}} disabled={senseRunning} style={{background:senseRunning?"var(--bg3)":(!isPro&&!isTrialing)?"var(--bg3)":"var(--gold)",border:(!isPro&&!isTrialing)?"1px solid var(--border)":"none",borderRadius:5,color:senseRunning||(!isPro&&!isTrialing)?"var(--text-d)":"#0D1017",fontSize:10,padding:"4px 8px",cursor:senseRunning?"not-allowed":"pointer",fontFamily:"var(--font-body)",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                  {senseRunning?<><span style={{width:8,height:8,border:"1.5px solid var(--text-d)",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Checking…</>:(!isPro&&!isTrialing)?"✦ Pro only":"✦ AI Check"}
                </button>
              </div>
            </div>
            {senseOpen&&(
              <>
                {!senseResult&&!senseRunning&&<div style={{fontSize:11,color:"var(--text-d)",lineHeight:1.5}}>Run a quick static check or use AI for a deep expert review. DSCR, break-even, and finance costs included.</div>}
                {senseRunning&&<div style={{display:"flex",flexDirection:"column",gap:6}}>{["Checking build costs…","Reviewing finance structure…","Validating DSCR…"].map((m,i)=><div key={i} style={{height:28,background:"linear-gradient(90deg,var(--bg3) 25%,var(--bg4) 50%,var(--bg3) 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite",borderRadius:5}}/>)}</div>}
                {senseError&&<div style={{fontSize:11,color:"var(--amber)",marginBottom:8}}>{senseError}</div>}
                {senseResult&&!senseRunning&&(
                  <div>
                    <div style={{fontSize:11,color:"var(--text-m)",marginBottom:12,lineHeight:1.5}}>{senseResult.summary}</div>
                    {senseResult.flags.length===0&&<div style={{fontSize:11,color:"var(--green)",background:"rgba(61,220,132,.07)",borderRadius:6,padding:"8px 10px"}}>✓ No issues flagged — assumptions within market ranges.</div>}
                    {senseResult.flags.map((flag:any,i:number)=>(
                      <div key={i} style={{background:"var(--bg3)",borderRadius:7,padding:10,marginBottom:8,borderLeft:`3px solid ${flag.severity==="error"?"var(--red)":flag.severity==="warning"?"var(--amber)":"var(--blue)"}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                          <span style={{fontSize:10,fontWeight:600,color:flag.severity==="error"?"var(--red)":flag.severity==="warning"?"var(--amber)":"var(--blue)",textTransform:"uppercase",letterSpacing:".05em"}}>{flag.field}</span>
                          <span style={{fontSize:9,color:"var(--text-d)",background:"var(--bg4)",padding:"1px 6px",borderRadius:4}}>{flag.severity}</span>
                        </div>
                        <div style={{fontSize:11,color:"var(--text)",lineHeight:1.5,marginBottom:4}}>{flag.message}</div>
                        {flag.benchmark&&<div style={{fontSize:10,color:"var(--text-d)",fontStyle:"italic"}}>{flag.benchmark}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {/* SHARE MODAL */}
      {shareModal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShareModal(false);}}>
          <div className="modal">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontFamily:"var(--font-body)",fontSize:20,fontWeight:700,letterSpacing:"-.02em"}}>Share Appraisal</div>
              <button onClick={()=>setShareModal(false)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:20}}>×</button>
            </div>
            <p style={{fontSize:13,color:"var(--text-d)",marginBottom:28}}>{data.name||"Untitled"} · {assetType} · {data.location||"No location"}</p>
            <div style={{background:"var(--bg3)",borderRadius:10,padding:16,marginBottom:16}}>
              <div style={{fontSize:11,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Live Link</div>
              {!liveLink?(
                <button className="btn-primary" onClick={generateLiveLink} disabled={generatingLink||!saved} style={{width:"100%",justifyContent:"center"}}>{generatingLink?"Generating…":!saved?"Save appraisal first":"Generate Live Link"}</button>
              ):(
                <>
                  <div style={{background:"var(--bg4)",borderRadius:7,padding:"10px 12px",fontFamily:"var(--font-mono)",fontSize:11,color:"var(--gold)",wordBreak:"break-all",marginBottom:10}}>{liveLink}</div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn-primary" onClick={copyLink} style={{flex:1,justifyContent:"center"}}>{linkCopied?"✓ Copied!":"Copy Link"}</button>
                    <button className="btn-ghost" onClick={shareEmail} style={{flex:1,justifyContent:"center"}}>Email</button>
                    <button className="btn-ghost" onClick={shareWhatsApp} style={{flex:1,justifyContent:"center"}}>WhatsApp</button>
                  </div>
                </>
              )}
              <p style={{fontSize:11,color:"var(--text-d)",marginTop:10}}>Anyone with this link can view the full appraisal — no login required.</p>
            </div>
          </div>
        </div>
      )}
      {/* DELETE MODAL */}
      {deleteModal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setDeleteModal(false);}}>
          <div className="modal modal-sm">
            <div style={{fontFamily:"var(--font-body)",fontSize:20,fontWeight:700,letterSpacing:"-.02em",marginBottom:8,color:"var(--red)"}}>Delete Appraisal</div>
            <p style={{fontSize:13,color:"var(--text-m)",marginBottom:8}}>This will permanently delete <strong style={{color:"var(--text)"}}>{data.name||"this appraisal"}</strong>.</p>
            <p style={{fontSize:12,color:"var(--text-d)",marginBottom:28}}>This action cannot be undone.</p>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-ghost" onClick={()=>setDeleteModal(false)} style={{flex:1,justifyContent:"center"}}>Cancel</button>
              <button onClick={deleteAppraisal} disabled={deleting} style={{flex:1,background:"var(--red)",color:"#fff",border:"none",borderRadius:7,padding:"10px 20px",fontFamily:"var(--font-body)",fontSize:13,fontWeight:600,cursor:"pointer",opacity:deleting?.6:1}}>{deleting?"Deleting…":"Delete Permanently"}</button>
            </div>
          </div>
        </div>
      )}
      {/* AI BROCHURE MODAL */}
      {brochureModal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setBrochureModal(false);}}>
          <div className="modal" style={{width:660}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontFamily:"var(--font-body)",fontSize:20,fontWeight:700,letterSpacing:"-.02em"}}>✨ AI Brochure</div>
              <button onClick={()=>setBrochureModal(false)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:20}}>×</button>
            </div>
            <p style={{fontSize:13,color:"var(--text-d)",marginBottom:24}}>{data.name||"Untitled"} · {assetType} · {data.location||"No location"}</p>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Project Photos (optional, up to 3)</div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                {brochurePhotos.map((ph,i)=>(
                  <div key={i} className="photo-slot" style={{border:"1px solid var(--gold-border)"}}>
                    <img src={ph} alt=""/>
                    <button onClick={()=>setBrochurePhotos(p=>p.filter((_,idx)=>idx!==i))} style={{position:"absolute",top:2,right:2,background:"rgba(0,0,0,.7)",border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                  </div>
                ))}
                {brochurePhotos.length<3&&(
                  <label className="photo-slot" style={{cursor:"pointer"}}>
                    <div style={{textAlign:"center"}}><div style={{fontSize:20,marginBottom:4}}>📷</div><div style={{fontSize:9,color:"var(--text-d)"}}>Add photo</div></div>
                    <input type="file" accept="image/*" multiple style={{display:"none"}} onChange={handlePhotoUpload}/>
                  </label>
                )}
                <div style={{fontSize:11,color:"var(--text-d)",marginLeft:4}}>Photos appear on the brochure cover page.</div>
              </div>
            </div>
            {!brochureContent&&(<button className="btn-primary" onClick={generateBrochure} disabled={generatingBrochure} style={{width:"100%",justifyContent:"center",marginBottom:16,padding:"13px"}}>{generatingBrochure?<><span style={{width:14,height:14,border:"2px solid rgba(82,196,152,0.15)",borderTopColor:"#52C498",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/> Analysing deal data…</>:"Generate AI Analysis →"}</button>)}
            {brochureError&&<div style={{background:"rgba(244,100,95,.1)",border:"1px solid rgba(244,100,95,.3)",borderRadius:8,padding:12,fontSize:12,color:"var(--red)",marginBottom:16}}>{brochureError}</div>}
            {generatingBrochure&&(<div>{["Executive Summary","Deal Strengths","Risk Assessment","Market Comparables"].map(s=>(<div key={s} style={{marginBottom:12}}><div style={{fontSize:10,color:"var(--gold)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>{s}</div><div className="ai-generating"/></div>))}</div>)}
            {brochureContent&&!generatingBrochure&&(
              <div>
                {(["executiveSummary","dealStrengths","riskAssessment","marketComparables"] as (keyof BrochureContent)[]).map(key=>{
                  const labels={executiveSummary:"Executive Summary",dealStrengths:"Deal Strengths",riskAssessment:"Risk Assessment",marketComparables:"Market Comparables"};
                  return(<div key={key} className="ai-section"><span className="ai-section-label">{labels[key]}</span><textarea className="ai-textarea" value={brochureContent[key]} onChange={e=>setBrochureContent(prev=>prev?{...prev,[key]:e.target.value}:prev)}/></div>);
                })}
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <button className="btn-ghost" onClick={()=>{setBrochureContent(null);generateBrochure();}} style={{flex:1,justifyContent:"center"}} disabled={generatingBrochure}>↺ Regenerate</button>
                  <button className="btn-primary" onClick={handleDownloadBrochure} disabled={downloadingBrochure} style={{flex:2,justifyContent:"center",padding:"12px"}}>{downloadingBrochure?<><span style={{width:14,height:14,border:"2px solid rgba(82,196,152,0.15)",borderTopColor:"#52C498",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/> Generating PDF…</>:"⬇ Download Brochure PDF"}</button>
                </div>
                <p style={{fontSize:11,color:"var(--text-d)",marginTop:10,textAlign:"center"}}>Edit any section above before downloading.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default function AppraisalPageWrapper(){
  return(
    <Suspense fallback={
      <div style={{minHeight:"100vh",background:"#0D1017",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:32,height:32,border:"2px solid rgba(82,196,152,.2)",borderTopColor:"#52C498",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <AppraisalPage/>
    </Suspense>
  );
}
