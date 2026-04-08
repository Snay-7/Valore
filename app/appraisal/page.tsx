"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback, Suspense } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
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
.section-title{font-family:var(--font-display);font-size:18px;font-weight:400;color:var(--text);margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid var(--border)}
.output-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bg4)}
.output-label{font-size:12px;color:var(--text-m)}
.output-value{font-family:var(--font-mono);font-size:13px;font-weight:500}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:7px;padding:10px 20px;font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:background .2s;display:inline-flex;align-items:center;gap:8px}
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
    const devCost=buildCost+profFees+contingency+otherCosts;
    const annualRate=(num(String(data.benchmarkRate))+num(String(data.marginOverBenchmark)))/100;
    const ltcPct=num(String(data.ltc))/100;
    const buildMonths=Math.max(1,Math.round(num(String(data.programmMonths))));
    const stabMonths=Math.max(1,Math.round(num(String(data.stabilisationMonths))));
    const totalMonths=buildMonths+stabMonths;
    const fin=calcFinanceCostMonthly({landCost,sdlt,buildCost,buildMonths,annualRate,ltcPct,arrangementFeePct:num(String(data.arrangementFeePct))/100,costProfile:data.costProfile??"scurve"});
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
    return{gdv,noi,grossRentPa,totalSqft,totalUnits,landCost,sdlt,buildCost,devCost,totalFinanceCost:fin.totalFinanceCost,arrangementFee:fin.arrangementFee,interestCost:fin.interestCost,loanAmount:fin.loanAmount,peakLoanBalance:fin.peakLoanBalance,monthlyInterestArr:fin.monthlyInterestArr,monthlyDrawArr:fin.monthlyDrawArr,totalCost,profit,poc,yoc,irr,irrLevered,rlv,dscr,moic,equity,paybackMonth,breakEvenYield,financeRate:annualRate,buildProfile,buildMonths,stabMonths,totalMonths,uCfs,lCfs};
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
    const buildCosts=buildCost+profFees+contingency+otherCosts;
    const sellCosts=agentFees+marketing;
    const devCost=buildCosts+sellCosts;
    const annualRate=(num(String(data.benchmarkRate))+num(String(data.marginOverBenchmark)))/100;
    const ltcPct=num(String(data.ltc))/100;
    const buildMonths=Math.max(1,Math.round(num(String(data.programmMonths))));
    const absMonths=Math.max(1,Math.round(num(String(data.absorptionMonths))));
    const totalMonths=buildMonths+absMonths;
    const fin=calcFinanceCostMonthly({landCost,sdlt,buildCost:buildCosts,buildMonths,annualRate,ltcPct,arrangementFeePct:num(String(data.arrangementFeePct))/100,costProfile:data.costProfile??"scurve"});
    const totalCost=landCost+sdlt+devCost+fin.totalFinanceCost;
    const profit=gdv-totalCost;
    const poc=totalCost>0?profit/totalCost:0;
    const margin=gdv>0?profit/gdv:0;
    const equity=Math.max(0,totalCost-fin.loanAmount);
    const moic=equity>0?(equity+profit)/equity:0;
    const buildProfile=buildDrawdownProfile(buildMonths,data.costProfile??"scurve");
    const equityRatio=totalCost>0?equity/totalCost:1;
    const netSalesPm=(gdv-sellCosts)/absMonths;
    const loanRepayPm=fin.peakLoanBalance/absMonths;
    const uCfs:number[]=Array(totalMonths).fill(0);
    const lCfs:number[]=Array(totalMonths).fill(0);
    uCfs[0]-=landCost+sdlt+fin.arrangementFee;
    lCfs[0]-=(landCost+sdlt)*equityRatio+fin.arrangementFee;
    for(let m=0;m<buildMonths;m++){const devDraw=buildCosts*buildProfile[m];uCfs[m]-=devDraw;lCfs[m]-=devDraw*equityRatio+(fin.monthlyInterestArr[m]??0);}
    for(let m=0;m<absMonths;m++){const idx=buildMonths+m;const remainingLoan=Math.max(0,fin.peakLoanBalance-loanRepayPm*m);uCfs[idx]+=netSalesPm;lCfs[idx]+=netSalesPm-loanRepayPm-(remainingLoan*annualRate)/12;}
    const rawIrr=calcIRR(uCfs);
    const irr=isFinite(rawIrr)&&rawIrr>-1?Math.pow(1+rawIrr,12)-1:0;
    const rawIrrL=equity>0?calcIRR(lCfs):0;
    const irrLevered=equity>0&&isFinite(rawIrrL)&&rawIrrL>-1&&rawIrrL<100?Math.pow(1+rawIrrL,12)-1:0;
    const paybackMonth=calcPaybackMonth(uCfs);
    const breakEvenPsf=findBreakEvenSalePsf(units.map((u:any)=>({count:num(String(u.count)),size:num(String(u.size)),salePricePsf:num(String(u.salePricePsf))})),totalCost);
    return{gdv,totalSqft,totalUnits,landCost,sdlt,buildCost,devCost,totalFinanceCost:fin.totalFinanceCost,arrangementFee:fin.arrangementFee,interestCost:fin.interestCost,loanAmount:fin.loanAmount,peakLoanBalance:fin.peakLoanBalance,monthlyInterestArr:fin.monthlyInterestArr,monthlyDrawArr:fin.monthlyDrawArr,totalCost,profit,poc,margin,irr,irrLevered,equity,moic,paybackMonth,breakEvenPsf,financeRate:annualRate,buildProfile,buildMonths,absMonths,totalMonths,uCfs,lCfs};
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
    const hardCost=purchasePrice+sdlt+capex+profFees+contingency+otherCosts;
    const annualRate=(num(String(data.benchmarkRate))+num(String(data.marginOverBenchmark)))/100;
    const ltcPct=num(String(data.ltc))/100;
    const buildMonths=Math.max(1,Math.round(num(String(data.programmMonths))));
    const stabMonths=Math.max(1,Math.round(num(String(data.stabilisationMonths))));
    const totalMonths=buildMonths+stabMonths;
    const fin=calcFinanceCostMonthly({landCost:purchasePrice+sdlt,sdlt:0,buildCost:capex+profFees+contingency+otherCosts,buildMonths,annualRate,ltcPct,arrangementFeePct:num(String(data.arrangementFeePct))/100,costProfile:data.costProfile??"straight"});
    const totalInvestment=hardCost+fin.totalFinanceCost;
    const profit=exitValue-totalInvestment;
    const poc=totalInvestment>0?profit/totalInvestment:0;
    const yoc=totalInvestment>0?ebitda/totalInvestment:0;
    const equity=Math.max(0,totalInvestment-fin.loanAmount);
    const moic=equity>0?(equity+profit)/equity:0;
    const annualDebtService=fin.peakLoanBalance*annualRate;
    const dscr=annualDebtService>0?ebitda/annualDebtService:Infinity;
    const buildProfile=buildDrawdownProfile(buildMonths,data.costProfile??"straight");
    const equityRatio=totalInvestment>0?equity/totalInvestment:1;
    const capexTotal=capex+profFees+contingency+otherCosts;
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
    return{revpar,revenuePa,ebitda,stabilisedValue,exitValue,purchasePrice,sdlt,capex,hardCost,totalFinanceCost:fin.totalFinanceCost,arrangementFee:fin.arrangementFee,interestCost:fin.interestCost,loanAmount:fin.loanAmount,peakLoanBalance:fin.peakLoanBalance,monthlyInterestArr:fin.monthlyInterestArr,monthlyDrawArr:fin.monthlyDrawArr,totalInvestment,profit,poc,yoc,irr,irrLevered,equity,moic,dscr,paybackMonth,financeRate:annualRate,buildProfile,buildMonths,stabMonths,totalMonths,uCfs,lCfs};
  }
  if(assetType==="Flip"){
    const purchase=num(String(data.purchasePrice));
    const sdlt=calcSDLT(purchase,data.sdltMode??"auto",data.sdltTransactionType??"residential",data.sdltOverride??0,data.sdltSurcharge??false);
    // Size & psf
    const propertySqft=num(String(data.propertySqft||0));
    const refurbPsf=num(String(data.refurbPsf||0));
    const salePricePsf=num(String(data.salePricePsf||0));
    // Refurb: use psf if both size and psf set, else use flat budget
    const refurb=propertySqft>0&&refurbPsf>0?propertySqft*refurbPsf:num(String(data.refurbBudget||0));
    const profFees=refurb*(num(String(data.professionalFeesPct))/100);
    const contingency=refurb*(num(String(data.contingencyPct))/100);
    const other=num(String(data.otherCosts));
    // Sale price: use psf if both set, else use flat
    const salePrice=propertySqft>0&&salePricePsf>0?propertySqft*salePricePsf:num(String(data.salePrice||0));
    // Finance mode: bridging only | bridging + refinance (hold)
    const flipMode=data.flipMode||"sell"; // sell | hold
    const bridgingRatePm=num(String(data.bridgingRatePct||0.85))/100;
    const bridgingMonths=num(String(data.bridgingTermMonths||9));
    const ltv=num(String(data.flipLTV||75))/100;
    const loanAmount=purchase*ltv;
    const arrangementFee=loanAmount*(num(String(data.arrangementFeePct||2.0))/100);
    const bridgingInterest=loanAmount*bridgingRatePm*bridgingMonths;
    // Refinance (hold mode)
    const refiRate=num(String(data.refiRatePct||6.0))/100;
    const refiMonths=num(String(data.refiTermMonths||24));
    const refiLTV=num(String(data.refiLTV||75))/100;
    const refiLoan=salePrice*refiLTV; // refinance against GDV
    const refiInterestPm=refiLoan*(refiRate/12);
    const rentPcm=num(String(data.rentPcm||0));
    const voidPct=num(String(data.voidPct||5))/100;
    const netRentPm=rentPcm*(1-voidPct);
    const monthlyOpex=num(String(data.holdOpexPm||200)); // service charge, insurance etc
    const netCashflowPm=netRentPm-refiInterestPm-monthlyOpex;
    const totalHoldMonths=bridgingMonths+refiMonths;
    const refiArrangement=refiLoan*(num(String(data.refiArrangementPct||1.0))/100);
    // Total finance cost
    const totalFinanceCost=flipMode==="hold"
      ?bridgingInterest+arrangementFee+refiArrangement+(refiInterestPm*refiMonths)
      :bridgingInterest+arrangementFee;
    const totalCost=purchase+sdlt+refurb+profFees+contingency+other+totalFinanceCost;
    // Sale
    const agentFees=salePrice*(num(String(data.agentFeePct||1.5))/100);
    const netProceeds=salePrice-agentFees;
    const profit=flipMode==="hold"
      ?(netProceeds-refiLoan)+(netCashflowPm*refiMonths)-(purchase+sdlt+refurb+profFees+contingency+other+bridgingInterest+arrangementFee+refiArrangement-loanAmount)
      :netProceeds-totalCost;
    const roi=totalCost>0?profit/totalCost:0;
    const equity=Math.max(0,totalCost-loanAmount);
    const roiEquity=equity>0?profit/equity:0;
    const moic=equity>0?(equity+profit)/equity:0;
    // Cashflows
    let cfs:number[];
    if(flipMode==="hold"){
      const equityIn=purchase*(1-ltv)+sdlt+refurb+profFees+contingency+other+bridgingInterest+arrangementFee+refiArrangement;
      cfs=[-equityIn,...Array(Math.round(refiMonths)-1).fill(netCashflowPm),netCashflowPm+(netProceeds-refiLoan)];
    } else {
      cfs=[-equity,...Array(Math.max(0,Math.round(bridgingMonths)-1)).fill(0),netProceeds-loanAmount];
    }
    const irr=Math.pow(1+calcIRR(cfs),12)-1;
    const paybackMonth=calcPaybackMonth(cfs);
    // Yield on cost (hold mode)
    const grossYield=salePrice>0?(rentPcm*12)/salePrice:0;
    const netYield=salePrice>0?(netRentPm*12)/salePrice:0;
    return{
      purchase,sdlt,refurb,refurbPsf:propertySqft>0?refurb/propertySqft:0,
      propertySqft,salePricePsf:propertySqft>0?salePrice/propertySqft:0,
      profFees,contingency,totalFinanceCost,loanAmount,bridgingInterest,arrangementFee,
      refiLoan,refiInterestPm,refiArrangement,netCashflowPm,netRentPm,
      totalCost,salePrice,agentFees,netProceeds,profit,roi,roiEquity,moic,irr,equity,
      paybackMonth,financeRate:bridgingRatePm*12,grossYield,netYield,flipMode,
      bridgingMonths,refiMonths,totalHoldMonths,
    };
  }
  return{};
}
// ─── DEFAULTS ─────────────────────────────────────────────────────────────────
const DEFAULTS={
  BTR:{assetType:"BTR",name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:36,stabilisationMonths:12,units:[{type:"1 Bed OMR",count:80,rentPcm:2200,size:550},{type:"2 Bed OMR",count:60,rentPcm:2900,size:750},{type:"3 Bed OMR",count:30,rentPcm:3600,size:1000},{type:"1 Bed DMR",count:40,rentPcm:1650,size:550},{type:"2 Bed DMR",count:22,rentPcm:2175,size:750}],exitYield:4.15,niy:4.0,voidPct:1.5,opexPsf:8,landCost:15000000,buildCostPsf:285,siteAreaSqft:195000,professionalFeesPct:8,contingencyPct:5,otherCosts:500000,ltc:65,marginOverBenchmark:2.5,arrangementFeePct:1.0,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:12,tier2DevShare:30,tier3Hurdle:18,tier3DevShare:40,costProfile:"scurve",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:true},
  BTS:{assetType:"BTS",name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:30,stabilisationMonths:6,units:[{type:"1 Bed",count:40,salePricePsf:900,size:550},{type:"2 Bed",count:60,salePricePsf:850,size:800},{type:"3 Bed",count:20,salePricePsf:800,size:1100},{type:"Penthouse",count:5,salePricePsf:1400,size:1800}],agentFeePct:1.5,marketingPct:1.0,absorptionMonths:18,landCost:8000000,buildCostPsf:260,siteAreaSqft:110000,professionalFeesPct:8,contingencyPct:5,otherCosts:300000,ltc:60,marginOverBenchmark:2.5,arrangementFeePct:1.0,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:15,tier2DevShare:30,tier3Hurdle:20,tier3DevShare:40,costProfile:"scurve",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:true},
  Hotel:{assetType:"Hotel",name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:24,stabilisationMonths:18,rooms:120,adr:180,occupancy:72,starRating:4,revparGrowthPct:2.5,roomsMarginPct:75,fnbEnabled:true,fnbRevenuePerOccRoom:45,fnbUtilisationPct:70,fnbMarginPct:30,spaEnabled:false,spaRevenuePerRoomPa:800,spaUtilisationPct:40,spaMarginPct:35,gymEnabled:false,gymMembershipRevPa:50000,gymGuestRevPerOccRoom:8,gymMarginPct:60,meetingEnabled:false,meetingRooms:4,meetingAvgDayRate:1200,meetingUtilisationPct:45,meetingMarginPct:40,exitCapRate:6.5,stabilisedCapRate:6.0,purchasePrice:18000000,capexBudget:5000000,professionalFeesPct:5,contingencyPct:8,otherCosts:200000,ltc:60,marginOverBenchmark:3.0,arrangementFeePct:1.5,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:14,tier2DevShare:30,tier3Hurdle:20,tier3DevShare:40,costProfile:"straight",sdltMode:"auto" as const,sdltTransactionType:"commercial" as const,sdltOverride:0,sdltSurcharge:false},
  Flip:{assetType:"Flip",name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:9,stabilisationMonths:0,purchasePrice:450000,propertySqft:900,refurbBudget:85000,refurbPsf:95,salePrice:620000,salePricePsf:688,agentFeePct:1.5,bridgingRatePct:0.85,bridgingTermMonths:6,flipLTV:75,arrangementFeePct:2.0,professionalFeesPct:2,contingencyPct:10,otherCosts:5000,flipMode:"sell",refiRatePct:6.0,refiTermMonths:24,refiLTV:75,refiArrangementPct:1.0,rentPcm:2200,voidPct:5,holdOpexPm:200,costProfile:"straight",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:false},
};
type AssetType="BTR"|"BTS"|"Hotel"|"Flip";
type BrochureContent={executiveSummary:string;dealStrengths:string;riskAssessment:string;marketComparables:string};

// ─── PROPERTY TAX BLOCK ───────────────────────────────────────────────────────
function SDLTBlock({data,set,r,currencySymbol}:{data:any;set:(f:string,v:any)=>void;r:any;currencySymbol:string}){
  const[overrideStr,setOverrideStr]=useState(()=>data.sdltOverride===0?"":String(data.sdltOverride));
  return(
    <div className="inp-group" style={{gridColumn:"1 / -1"}}>
      <label className="inp-label">Property Tax</label>

      {/* ── Info banner ── */}
      <div style={{background:"rgba(201,168,76,0.07)",border:"1px solid rgba(201,168,76,0.2)",borderRadius:7,padding:"8px 12px",marginBottom:10,display:"flex",alignItems:"flex-start",gap:8}}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0,marginTop:2}} xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="7" r="6.5" stroke="#c9a84c" strokeWidth="0.75"/>
          <rect x="6.4" y="6" width="1.2" height="4.5" rx="0.6" fill="#c9a84c"/>
          <circle cx="7" cy="4.2" r="0.7" fill="#c9a84c"/>
        </svg>
        <span style={{fontSize:11,color:"var(--text-m)",lineHeight:1.6}}>
          <strong style={{color:"var(--gold)"}}>Auto mode uses UK SDLT rates.</strong> If you are in another country, use <strong style={{color:"var(--text)"}}>Override</strong> and enter your local property transfer tax — e.g. IMT (Portugal), Transfer Tax (USA), DLD Fee (UAE), Stamp Duty (Australia), Grunderwerbsteuer (Germany).
        </span>
      </div>

      {/* ── Toggle buttons ── */}
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <button onClick={()=>set("sdltMode","auto")} style={{padding:"4px 14px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"var(--font-body)",fontSize:12,fontWeight:600,background:data.sdltMode!=="manual"?"var(--gold)":"rgba(255,255,255,0.07)",color:data.sdltMode!=="manual"?"#06070a":"var(--text-m)"}}>Auto</button>
        <button onClick={()=>set("sdltMode","manual")} style={{padding:"4px 14px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"var(--font-body)",fontSize:12,fontWeight:600,background:data.sdltMode==="manual"?"var(--gold)":"rgba(255,255,255,0.07)",color:data.sdltMode==="manual"?"#06070a":"var(--text-m)"}}>Override</button>
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
function drawVMarkPDF(doc:any,x:number,y:number,h:number,color:[number,number,number]){
  const s=h/115; // scale: SVG viewBox is 100×115
  const w=100*s;
  // Outer V polygon (pts in mm relative to x,y)
  const outer=[[0,0],[26*s,0],[50*s,58*s],[74*s,0],[100*s,0],[50*s,115*s]];
  // Inner cutout polygon
  const inner=[[17*s,0],[34*s,0],[50*s,38*s],[66*s,0],[83*s,0],[50*s,85*s]];
  doc.setFillColor(...color);
  doc.triangle(x+outer[0][0],y+outer[0][1],x+outer[1][0],y+outer[1][1],x+outer[5][0],y+outer[5][1],"F");
  doc.triangle(x+outer[1][0],y+outer[1][1],x+outer[4][0],y+outer[4][1],x+outer[5][0],y+outer[5][1],"F");
  doc.triangle(x+outer[1][0],y+outer[1][1],x+outer[2][0],y+outer[2][1],x+outer[4][0],y+outer[4][1],"F");
  doc.triangle(x+outer[2][0],y+outer[2][1],x+outer[3][0],y+outer[3][1],x+outer[4][0],y+outer[4][1],"F");
  // Knock out inner V with dark fill
  const bg=doc.internal.pageSize; // use dark background
  doc.setFillColor(6,7,10);
  doc.triangle(x+inner[0][0],y+inner[0][1],x+inner[1][0],y+inner[1][1],x+inner[5][0],y+inner[5][1],"F");
  doc.triangle(x+inner[1][0],y+inner[1][1],x+inner[4][0],y+inner[4][1],x+inner[5][0],y+inner[5][1],"F");
  doc.triangle(x+inner[1][0],y+inner[1][1],x+inner[2][0],y+inner[2][1],x+inner[4][0],y+inner[4][1],"F");
  doc.triangle(x+inner[2][0],y+inner[2][1],x+inner[3][0],y+inner[3][1],x+inner[4][0],y+inner[4][1],"F");
}

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
  const W=210,H=297;
  const gold=[201,168,76] as [number,number,number];
  const dark=[6,7,10] as [number,number,number];
  const bg2=[18,21,26] as [number,number,number];
  const bg3=[25,29,36] as [number,number,number];
  const grey=[125,133,144] as [number,number,number];
  const white=[236,234,228] as [number,number,number];
  const green=[61,220,132] as [number,number,number];
  const red=[244,100,95] as [number,number,number];
  const amber=[240,164,41] as [number,number,number];
  const r=results as any;
  const programmLabel=assetType==="BTS"?`${data.programmMonths}m build · ${data.absorptionMonths}m absorption`:assetType==="BTR"?`${data.programmMonths}m build · ${data.stabilisationMonths}m stabilisation`:`${data.programmMonths} months`;
  doc.setFillColor(...dark);doc.rect(0,0,W,H,"F");
  doc.setFillColor(...gold);doc.rect(0,0,5,H,"F");
  doc.setFillColor(...bg2);doc.rect(5,0,W-5,42,"F");
  doc.setFillColor(...gold);doc.rect(5,42,W-5,0.5,"F");
  drawVMarkPDF(doc,14,7,8,gold);doc.setTextColor(...gold);doc.setFontSize(18);doc.setFont("helvetica","bold");doc.text("VALORA",23,15);
  doc.setTextColor(...grey);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text("DEVELOPMENT APPRAISAL",14,21);
  doc.setTextColor(...grey);doc.setFontSize(7);doc.text(new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}),W-8,12,{align:"right"});doc.text(userEmail||"",W-8,18,{align:"right"});
  doc.setFillColor(201,168,76,30);doc.roundedRect(W-52,26,44,10,2,2,"F");
  doc.setTextColor(...gold);doc.setFontSize(7);doc.setFont("helvetica","bold");doc.text("STRICTLY CONFIDENTIAL",W-30,32.5,{align:"center"});
  doc.setTextColor(...white);doc.setFontSize(22);doc.setFont("helvetica","bold");doc.text(data.name||"Untitled Appraisal",14,58);
  doc.setFontSize(10);doc.setFont("helvetica","normal");doc.setTextColor(...grey);doc.text(`${data.location||"No location"}  ·  ${assetType}  ·  ${data.currency||"GBP"}`,14,66);
  const metrics=assetType==="BTR"
    ?[["GDV (Exit)",fmt(r.gdv,currencySymbol),gold],["Profit on Cost",fmtPct(r.poc),r.poc>0.2?green:r.poc>0.1?amber:red],["IRR (Unlevered)",fmtPct(r.irr),r.irr>=0.15?green:r.irr>=0.08?amber:red],["Equity Multiple",fmtX(r.moic),white]]
    :assetType==="BTS"
    ?[["GDV",fmt(r.gdv,currencySymbol),gold],["Profit on Cost",fmtPct(r.poc),r.poc>0.2?green:r.poc>0.1?amber:red],["IRR (Unlevered)",fmtPct(r.irr),r.irr>=0.15?green:r.irr>=0.08?amber:red],["Equity Multiple",fmtX(r.moic),white]]
    :assetType==="Hotel"
    ?[["Exit Value",fmt(r.exitValue,currencySymbol),gold],["Return on Cost",fmtPct(r.poc),r.poc>0.15?green:amber],["IRR (Unlevered)",fmtPct(r.irr),r.irr>=0.15?green:r.irr>=0.08?amber:red],["DSCR",fmtX(r.dscr),white]]
    :[["Sale Price",fmt(r.salePrice,currencySymbol),gold],["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],["ROI on Cost",fmtPct(r.roi),r.roi>0.15?green:amber],["Equity Multiple",fmtX(r.moic),white]];
  const mW=(W-14-8-9)/4;const mY=72;
  metrics.forEach(([label,value,color],i)=>{
    const x=14+i*(mW+3);
    doc.setFillColor(...bg2);doc.roundedRect(x,mY,mW,22,2,2,"F");
    doc.setDrawColor(...gold);doc.setLineWidth(0.3);doc.roundedRect(x,mY,mW,22,2,2,"S");
    doc.setTextColor(...grey);doc.setFontSize(6.5);doc.setFont("helvetica","normal");doc.text(String(label).toUpperCase(),x+3,mY+7);
    doc.setTextColor(...(color as [number,number,number]));doc.setFontSize(12);doc.setFont("helvetica","bold");doc.text(String(value),x+3,mY+18);
  });
  const colL=14,colR=115,colW=94,startY=104;let lY=startY,rY=startY;
  const drawCol=(title:string,rows:[string,string,[number,number,number]?][],x:number,startY:number,w:number)=>{
    doc.setTextColor(...gold);doc.setFontSize(9);doc.setFont("helvetica","bold");doc.text(title.toUpperCase(),x,startY);
    doc.setFillColor(...gold);doc.rect(x,startY+1.5,w,0.3,"F");let ry=startY+8;
    rows.forEach(([label,value,color],idx)=>{
      if(ry>280){return;}
      if(idx%2===0){doc.setFillColor(...bg3);doc.rect(x,ry-4,w,7,"F");}
      doc.setTextColor(...grey);doc.setFontSize(8);doc.setFont("helvetica","normal");doc.text(String(label),x+2,ry);
      doc.setTextColor(...(color||white) as [number,number,number]);doc.setFont("helvetica","bold");doc.text(String(value),x+w-1,ry,{align:"right"});
      doc.setFont("helvetica","normal");ry+=7;
    });return ry+6;
  };
  if(assetType==="BTR"){
    lY=drawCol("Returns",[["GDV (Exit)",fmt(r.gdv,currencySymbol),gold],["Gross NOI pa",fmt(r.noi,currencySymbol),white],["Total Cost",fmt(r.totalCost,currencySymbol),grey],["Equity In",fmt(r.equity||0,currencySymbol),gold],["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],["Profit on Cost",fmtPct(r.poc),r.poc>0.2?green:r.poc>0.1?amber:red],["Yield on Cost",fmtPct(r.yoc),white],["IRR (Unlevered)",fmtPct(r.irr),r.irr>=0.15?green:r.irr>=0.08?amber:red],["IRR (Levered)",fmtPct(r.irrLevered),r.irrLevered>=0.15?green:r.irrLevered>=0.08?amber:red],["Equity Multiple",fmtX(r.moic),gold],["DSCR / ICR",fmtX(r.dscr),r.dscr>=1.25?green:red],["Payback",r.paybackMonth?`Month ${r.paybackMonth}`:"—",white],["Break-even Yield",fmtPct(r.breakEvenYield),white],["Residual Land Value",fmt(r.rlv,currencySymbol),gold]],colL,lY,colW)||lY;
    rY=drawCol("Cost Breakdown",[["Land / Acquisition",fmt(r.landCost,currencySymbol),grey],["Property Tax",fmt(r.sdlt,currencySymbol),grey],["Build Cost",fmt(r.buildCost,currencySymbol),grey],["Prof. Fees + Contingency",fmt(r.devCost-r.buildCost,currencySymbol),grey],["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),amber],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),amber],["Equity In",fmt(r.equity||0,currencySymbol),gold],["Total Cost",fmt(r.totalCost,currencySymbol),gold]],colR,rY,colW)||rY;
    rY=drawCol("Project Details",[["Asset Type",assetType,white],["Location",data.location||"—",white],["Currency",data.currency||"GBP",white],["Programme",programmLabel,white],["Finance",`${data.ltc}% LTC · ${((num(String(data.benchmarkRate))+num(String(data.marginOverBenchmark))).toFixed(2))}% all-in`,white]],colR,rY,colW)||rY;
  }else if(assetType==="BTS"){
    lY=drawCol("Returns",[["GDV",fmt(r.gdv,currencySymbol),gold],["Total Units",r.totalUnits?.toString()||"—",white],["Total Cost",fmt(r.totalCost,currencySymbol),grey],["Equity In",fmt(r.equity||0,currencySymbol),gold],["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],["Profit on Cost",fmtPct(r.poc),r.poc>0.2?green:r.poc>0.1?amber:red],["Profit on GDV",fmtPct(r.margin),white],["IRR (Unlevered)",fmtPct(r.irr),r.irr>=0.15?green:r.irr>=0.08?amber:red],["IRR (Levered)",fmtPct(r.irrLevered),r.irrLevered>=0.15?green:r.irrLevered>=0.08?amber:red],["Equity Multiple",fmtX(r.moic),gold],["Payback",r.paybackMonth?`Month ${r.paybackMonth}`:"—",white],["Break-even psf",r.breakEvenPsf?`${currencySymbol}${Math.round(r.breakEvenPsf)}psf`:"—",white]],colL,lY,colW)||lY;
    rY=drawCol("Cost Breakdown",[["Land / Acquisition",fmt(r.landCost,currencySymbol),grey],["Property Tax",fmt(r.sdlt,currencySymbol),grey],["Build Cost",fmt(r.buildCost,currencySymbol),grey],["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),amber],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),amber],["Total Cost",fmt(r.totalCost,currencySymbol),gold]],colR,rY,colW)||rY;
    rY=drawCol("Project Details",[["Total Units",r.totalUnits?.toString()||"—",white],["Total Sqft",r.totalSqft?.toLocaleString()||"—",white],["Location",data.location||"—",white],["Programme",programmLabel,white],["Finance",`${data.ltc}% LTC · ${((num(String(data.benchmarkRate))+num(String(data.marginOverBenchmark))).toFixed(2))}% all-in`,white],["Equity In",fmt(r.equity||0,currencySymbol),gold]],colR,rY,colW)||rY;
  }else if(assetType==="Hotel"){
    lY=drawCol("Returns",[["RevPAR",fmt(r.revpar,currencySymbol),gold],["EBITDA pa",fmt(r.ebitda,currencySymbol),green],["Exit Value",fmt(r.exitValue,currencySymbol),gold],["Total Investment",fmt(r.totalInvestment,currencySymbol),grey],["Equity In",fmt(r.equity||0,currencySymbol),gold],["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],["Return on Cost",fmtPct(r.poc),r.poc>0.15?green:amber],["DSCR / ICR",fmtX(r.dscr),r.dscr>=1.25?green:red],["IRR (Unlevered)",fmtPct(r.irr),r.irr>=0.15?green:r.irr>=0.08?amber:red],["IRR (Levered)",fmtPct(r.irrLevered),r.irrLevered>=0.15?green:r.irrLevered>=0.08?amber:red],["Equity Multiple",fmtX(r.moic),gold],["Payback",r.paybackMonth?`Month ${r.paybackMonth}`:"—",white]],colL,lY,colW)||lY;
    rY=drawCol("Cost Breakdown",[["Purchase + Property Tax",fmt((r.purchasePrice||0)+(r.sdlt||0),currencySymbol),grey],["CapEx",fmt(r.capex,currencySymbol),grey],["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),amber],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),amber],["Equity In",fmt(r.equity||0,currencySymbol),gold],["Total Investment",fmt(r.totalInvestment,currencySymbol),gold]],colR,rY,colW)||rY;
    rY=drawCol("Project Details",[["Rooms",data.rooms?.toString()||"—",white],["Star Rating",data.starRating?`${data.starRating}★`:"—",white],["ADR",`${currencySymbol}${data.adr||0}`,white],["Occupancy",`${data.occupancy||0}%`,white],["Programme",programmLabel,white],["Exit Cap Rate",`${data.exitCapRate||0}%`,white],["Stabilised Cap Rate",`${data.stabilisedCapRate||0}%`,white]],colR,rY,colW)||rY;
    rY=drawCol("Finance",[["LTC Ratio",`${data.ltc||0}%`,white],["All-in Rate",r.financeRate?`${(r.financeRate*100).toFixed(2)}%`:"—",white],["Loan Amount",fmt(r.loanAmount||0,currencySymbol),amber],["Peak Loan Balance",fmt(r.peakLoanBalance||0,currencySymbol),amber]],colR,rY,colW)||rY;
  }else{
    lY=drawCol("Returns",[["Purchase Price",fmt(r.purchase,currencySymbol),grey],["Property Tax",fmt(r.sdlt,currencySymbol),grey],["Total Cost",fmt(r.totalCost,currencySymbol),grey],["Equity In",fmt(r.equity||0,currencySymbol),gold],["Net Sale Proceeds",fmt(r.netProceeds,currencySymbol),gold],["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],["ROI on Total Cost",fmtPct(r.roi),r.roi>0.15?green:amber],["Equity Multiple",fmtX(r.moic),gold],["IRR (Annualised)",fmtPct(r.irr),white],["Payback",r.paybackMonth?`Month ${r.paybackMonth}`:"—",white]],colL,lY,colW)||lY;
    rY=drawCol("Cost Breakdown",[["Purchase Price",fmt(r.purchase||0,currencySymbol),grey],["Property Tax",fmt(r.sdlt||0,currencySymbol),grey],["Refurb Budget",fmt(r.refurb||0,currencySymbol),grey],["Finance Cost",fmt(r.totalFinanceCost||0,currencySymbol),amber],["Total Cost",fmt(r.totalCost||0,currencySymbol),gold]],colR,rY,colW)||rY;
    rY=drawCol("Project Details",[["Location",data.location||"—",white],["Property Size",data.propertySqft>0?`${data.propertySqft} sqft`:"—",white],["Bridging Rate",`${data.bridgingRatePct||0}%pm`,white],["LTV",`${data.flipLTV||75}%`,white],["Hold Period",`${data.bridgingTermMonths||9} months`,white],["Agent Fee",`${data.agentFeePct||1.5}%`,white],["Exit Strategy",(data.flipMode||"sell")==="hold"?"Hold (BTL)":"Sell on Completion",white]],colR,rY,colW)||rY;
  }
  doc.setFillColor(...gold);doc.rect(0,H-8,W,8,"F");
  doc.setFillColor(...dark);doc.rect(0,H-8,5,8,"F");
  doc.setTextColor(...dark);doc.setFontSize(7);doc.setFont("helvetica","bold");
  doc.text("VALORA  ·  Institutional Development Appraisal Platform",14,H-3);
  doc.text(`Confidential  ·  ${new Date().toLocaleDateString("en-GB")}`,W-8,H-3,{align:"right"});
  doc.save(`Valora_${(data.name||"Appraisal").replace(/\s+/g,"_")}_${new Date().toISOString().slice(0,10)}.pdf`);
}
async function generateBrochurePDF(data:any,r:any,assetType:string,currencySymbol:string,content:BrochureContent,photos:string[],hotelMode="simple",hotelAdv:any=null){
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
  const gold=[201,168,76] as [number,number,number];
  const dark=[6,7,10] as [number,number,number];
  const grey=[125,133,144] as [number,number,number];
  const white=[255,255,255] as [number,number,number];
  const bg2=[18,21,26] as [number,number,number];
  const bg3=[25,29,36] as [number,number,number];
  const green=[61,220,132] as [number,number,number];
  const amber=[240,164,41] as [number,number,number];
  const blue=[91,156,246] as [number,number,number];
  const isHotelAdv=assetType==="Hotel"&&hotelMode==="advanced"&&hotelAdv;

  // ── PAGE 1: COVER ──────────────────────────────────────────────────────────
  doc.setFillColor(...dark);doc.rect(0,0,210,297,"F");
  doc.setFillColor(...gold);doc.rect(0,0,4,297,"F");
  if(photos.length>0){
    const phH=photos.length>=2?80:60;const phW=photos.length>=2?W/photos.length:W*0.6;
    photos.slice(0,3).forEach((ph,i)=>{try{doc.addImage(ph,"JPEG",i*phW,0,phW,phH);}catch(e){}});
    doc.setFillColor(6,7,10);doc.setGState(doc.GState({opacity:0.55}));doc.rect(0,0,W,photos.length>0?80:0,"F");doc.setGState(doc.GState({opacity:1}));
  }
  const _vY=photos.length>0?13:9;
  drawVMarkPDF(doc,M,_vY,7,gold);
  doc.setTextColor(...gold);doc.setFontSize(10);doc.setFont("helvetica","bold");doc.text("VALORA",M+9,photos.length>0?20:16);
  doc.setFontSize(7);doc.setFont("helvetica","normal");doc.setTextColor(...grey);
  doc.text(isHotelAdv?"INSTITUTIONAL INVESTMENT MEMORANDUM":"INVESTMENT MEMORANDUM",M,photos.length>0?26:22);
  const titleY=photos.length>0?95:50;
  doc.setTextColor(...white);doc.setFontSize(28);doc.setFont("helvetica","bold");
  const titleLines=doc.splitTextToSize(data.name||"Investment Opportunity",W-M*2);doc.text(titleLines,M,titleY);
  doc.setFontSize(12);doc.setFont("helvetica","normal");doc.setTextColor(...gold);
  const subtitle=isHotelAdv?`${data.location||""}  ·  Hotel  ·  ${data.holdYears||5}-Year Hold  ·  ${data.rooms} Keys`:`${data.location||""}  ·  ${assetType}`;
  doc.text(subtitle,M,titleY+titleLines.length*10+4);
  const metricsY=titleY+titleLines.length*10+20;
  // Metric cards — Advanced Hotel shows 6, others 4
  const metrics=isHotelAdv?[
    ["Exit Value",fmt(r.exitValue||r.gdv||0,currencySymbol)],
    ["EBITDA pa",fmt(r.ebitda||0,currencySymbol)],
    ["Return on Cost",fmtPct(r.poc||0)],
    ["IRR (Levered)",fmtPct(r.irrLevered||r.irr||0)],
    ["Equity Multiple",fmtX(r.moic||0)],
    ["DSCR / ICR",fmtX(r.dscr||0)],
  ]:assetType==="BTR"?[
    ["GDV",fmt(r.gdv,currencySymbol)],["Profit on Cost",fmtPct(r.poc)],["IRR",fmtPct(r.irr)],["Equity Multiple",fmtX(r.moic)],
  ]:assetType==="BTS"?[
    ["GDV",fmt(r.gdv,currencySymbol)],["Profit on Cost",fmtPct(r.poc)],["IRR",fmtPct(r.irr)],["Equity Multiple",fmtX(r.moic)],
  ]:assetType==="Hotel"?[
    ["Exit Value",fmt(r.exitValue||r.gdv||0,currencySymbol)],["EBITDA pa",fmt(r.ebitda||0,currencySymbol)],["Return on Cost",fmtPct(r.poc||0)],["DSCR",fmtX(r.dscr||0)],
  ]:[
    ["Sale Price",fmt(r.salePrice||0,currencySymbol)],["Profit",fmt(r.profit||0,currencySymbol)],["ROI",fmtPct(r.roi||0)],["Equity Multiple",fmtX(r.moic||0)],
  ];
  const cols=metrics.length;const mW=(W-M*2-(cols-1)*3)/cols;
  metrics.forEach(([l,v],i)=>{
    const x=M+i*(mW+3);
    doc.setFillColor(...bg2);doc.roundedRect(x,metricsY,mW,20,2,2,"F");
    doc.setDrawColor(...gold);doc.setLineWidth(0.5);doc.roundedRect(x,metricsY,mW,20,2,2,"S");
    doc.setTextColor(...grey);doc.setFontSize(6);doc.setFont("helvetica","normal");doc.text(String(l).toUpperCase(),x+3,metricsY+7);
    doc.setTextColor(...gold);doc.setFontSize(10);doc.setFont("helvetica","bold");doc.text(String(v),x+3,metricsY+16);
  });
  doc.setFillColor(...gold);doc.rect(0,291,W,6,"F");
  doc.setTextColor(...dark);doc.setFontSize(7);doc.setFont("helvetica","bold");
  doc.text("STRICTLY PRIVATE & CONFIDENTIAL",M,295.5);doc.text(new Date().toLocaleDateString("en-GB",{month:"long",year:"numeric"}),W-M,295.5,{align:"right"});

  // ── PAGE 2: AI NARRATIVE ───────────────────────────────────────────────────
  doc.addPage();doc.setFillColor(...dark);doc.rect(0,0,210,297,"F");doc.setFillColor(...gold);doc.rect(0,0,4,297,"F");
  const wrapText=(doc:any,text:string,x:number,startY:number,maxW:number,lineH:number)=>{
    const lines=doc.splitTextToSize(text,maxW);
    lines.forEach((line:string,i:number)=>{
      if(startY+i*lineH>278){doc.addPage();doc.setFillColor(...dark);doc.rect(0,0,210,297,"F");doc.setFillColor(...gold);doc.rect(0,0,4,297,"F");startY=20-i*lineH;}
      doc.text(line,x,startY+i*lineH);
    });
    return startY+lines.length*lineH+4;
  };
  let py=20;
  drawVMarkPDF(doc,M,py-7,7,gold);
  doc.setTextColor(...gold);doc.setFontSize(9);doc.setFont("helvetica","bold");doc.text("VALORA",M+9,py);
  doc.setTextColor(...grey);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text(data.name||"",W-M,py,{align:"right"});py+=10;
  const sections:[string,keyof BrochureContent][]=[["Executive Summary","executiveSummary"],["Deal Strengths","dealStrengths"],["Risk Assessment","riskAssessment"],["Market Comparables","marketComparables"]];
  sections.forEach(([title,key])=>{
    if(py>260){doc.addPage();doc.setFillColor(...dark);doc.rect(0,0,210,297,"F");doc.setFillColor(...gold);doc.rect(0,0,4,297,"F");py=20;}
    doc.setTextColor(...gold);doc.setFontSize(11);doc.setFont("helvetica","bold");doc.text(title,M,py);
    doc.setLineWidth(0.2);doc.setDrawColor(...gold);doc.line(M,py+2,W-M,py+2);py+=9;
    doc.setTextColor(...white);doc.setFontSize(9);doc.setFont("helvetica","normal");
    py=wrapText(doc,content[key]||"",M,py,W-M*2,5);py+=6;
  });
  doc.setFillColor(...gold);doc.rect(0,291,W,6,"F");
  doc.setTextColor(...dark);doc.setFontSize(7);doc.setFont("helvetica","bold");
  doc.text("VALORA · Institutional Development Appraisal",M,295.5);doc.text(`Confidential · ${new Date().toLocaleDateString("en-GB")}`,W-M,295.5,{align:"right"});

  // ── PAGE 3: HOTEL ADVANCED INSTITUTIONAL FINANCIALS ────────────────────────
  if(isHotelAdv){
    doc.addPage();doc.setFillColor(...dark);doc.rect(0,0,210,297,"F");doc.setFillColor(...gold);doc.rect(0,0,4,297,"F");
    let iy=20;
    drawVMarkPDF(doc,M,iy-7,7,gold);
    doc.setTextColor(...gold);doc.setFontSize(9);doc.setFont("helvetica","bold");doc.text("VALORA",M+9,iy);
    doc.setTextColor(...grey);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text("FINANCIAL SUMMARY — INSTITUTIONAL",W-M,iy,{align:"right"});iy+=14;

    // Per Key Metrics header
    doc.setTextColor(...gold);doc.setFontSize(10);doc.setFont("helvetica","bold");doc.text("PER KEY METRICS",M,iy);
    doc.setLineWidth(0.2);doc.setDrawColor(...gold);doc.line(M,iy+1.5,W-M,iy+1.5);iy+=8;
    const keyMetrics=[
      ["Purchase / Key",fmt(hotelAdv.pricePerKey||0,currencySymbol)],
      ["CapEx / Key",fmt(hotelAdv.capexPerKey||0,currencySymbol)],
      ["Exit Value / Key",fmt(hotelAdv.exitValuePerKey||0,currencySymbol)],
      ["EBITDA / Key",fmt(hotelAdv.ebitdaPerKey||0,currencySymbol)],
      ["NOI / Key",fmt(hotelAdv.noiPerKey||0,currencySymbol)],
      ["NOI Conversion",fmtPct(hotelAdv.noiConversion||0)],
      ["Entry Yield (NOI)",fmtPct(hotelAdv.entryYieldNOI||0)],
      ["Entry Yield (EBITDA)",fmtPct(hotelAdv.entryYieldEBITDA||0)],
    ];
    const kCols=4;const kW=(W-M*2-9)/kCols;
    keyMetrics.forEach(([l,v],i)=>{
      const col=i%kCols;const row=Math.floor(i/kCols);
      const x=M+col*(kW+3);const y=iy+row*18;
      doc.setFillColor(...bg3);doc.roundedRect(x,y,kW,14,1.5,1.5,"F");
      doc.setTextColor(...grey);doc.setFontSize(6);doc.setFont("helvetica","normal");doc.text(String(l).toUpperCase(),x+3,y+5.5);
      doc.setTextColor(...white);doc.setFontSize(9);doc.setFont("helvetica","bold");doc.text(String(v),x+3,y+11);
    });
    iy+=Math.ceil(keyMetrics.length/kCols)*18+10;

    // Cashflow table
    doc.setTextColor(...gold);doc.setFontSize(10);doc.setFont("helvetica","bold");doc.text("INVESTOR CASHFLOW — YEAR BY YEAR",M,iy);
    doc.setLineWidth(0.2);doc.setDrawColor(...gold);doc.line(M,iy+1.5,W-M,iy+1.5);iy+=8;
    const holdYears=hotelAdv.yearRevenue?.length||5;
    const cfCols=["",`Day 1`,...Array.from({length:holdYears},(_,i)=>`Yr ${i+1}${i===holdYears-1?" (Exit)":" "}`)];
    const colW2=(W-M*2)/(cfCols.length);
    // Header row
    doc.setFontSize(6.5);doc.setFont("helvetica","bold");
    cfCols.forEach((h,i)=>{
      doc.setTextColor(...grey);
      if(i===cfCols.length-1)doc.setTextColor(...gold);
      doc.text(String(h),M+i*colW2+(i>0?colW2/2:0),iy,{align:i>0?"center":"left"});
    });
    iy+=5;doc.setLineWidth(0.2);doc.setDrawColor(40,45,55);doc.line(M,iy-1,W-M,iy-1);
    const yr=hotelAdv.yearRevenue||[];
    const cfRows=[
      {label:"Revenue",vals:[null,...yr.map((y:any)=>y.totalRev)],c:grey},
      {label:"EBITDA",vals:[null,...yr.map((y:any)=>y.ebitda)],c:white},
      {label:"FF&E",vals:[null,...yr.map((y:any)=>-y.ffe)],c:amber},
      {label:"NOI",vals:[null,...yr.map((y:any)=>y.noi)],c:green,bold:true},
      {label:"Equity Out",vals:[-(hotelAdv.equity||0),...Array(holdYears).fill(null)],c:[244,100,95] as [number,number,number]},
      {label:"Disposal",vals:[null,...Array(holdYears-1).fill(null),hotelAdv.netExitProceeds||0],c:gold,bold:true},
    ];
    cfRows.forEach((row,ri)=>{
      if(ri%2===0){doc.setFillColor(20,24,30);doc.rect(M,iy-3,W-M*2,6,"F");}
      doc.setFontSize(6.5);doc.setFont("helvetica",row.bold?"bold":"normal");
      doc.setTextColor(...row.c);doc.text(row.label,M,iy);
      row.vals.forEach((v:any,ci:number)=>{
        const x=M+(ci+1)*colW2+colW2/2;
        if(v===null){doc.setTextColor(50,55,65);doc.text("—",x,iy,{align:"center"});}
        else{doc.setTextColor(...(v<0?[244,100,95]:row.c) as [number,number,number]);doc.text(fmt(Math.abs(v),currencySymbol),x,iy,{align:"center"});}
      });
      iy+=6;
    });
    iy+=6;

    // Summary return cards
    doc.setTextColor(...gold);doc.setFontSize(10);doc.setFont("helvetica","bold");doc.text("RETURNS SUMMARY",M,iy);
    doc.setLineWidth(0.2);doc.setDrawColor(...gold);doc.line(M,iy+1.5,W-M,iy+1.5);iy+=8;
    const retMetrics=[
      ["Total Investment",fmt(hotelAdv.totalCost||0,currencySymbol),white],
      ["Profit",fmt(hotelAdv.profit||0,currencySymbol),(hotelAdv.profit||0)>0?green:[244,100,95] as [number,number,number]],
      ["Return on Cost",fmtPct(hotelAdv.poc||0),(hotelAdv.poc||0)>0.15?green:amber],
      ["IRR (Unlevered)",fmtPct(hotelAdv.irr||0),blue],
      ["IRR (Levered)",fmtPct(hotelAdv.irrLevered||0),blue],
      ["Equity Multiple",fmtX(hotelAdv.moic||0),(hotelAdv.moic||0)>2?green:amber],
      ["DSCR / ICR",fmtX(hotelAdv.dscr||0),(hotelAdv.dscr||0)>=1.5?green:(hotelAdv.dscr||0)>=1.25?amber:[244,100,95] as [number,number,number]],
      ["Payback",hotelAdv.paybackMonth?`Month ${hotelAdv.paybackMonth}`:"Beyond horizon",grey],
    ];
    const rCols=4;const rW=(W-M*2-9)/rCols;
    retMetrics.forEach(([l,v,c],i)=>{
      const col=i%rCols;const row=Math.floor(i/rCols);
      const x=M+col*(rW+3);const y=iy+row*18;
      doc.setFillColor(...bg3);doc.roundedRect(x,y,rW,14,1.5,1.5,"F");
      doc.setDrawColor(...(c as [number,number,number]));doc.setLineWidth(0.3);doc.roundedRect(x,y,rW,14,1.5,1.5,"S");
      doc.setTextColor(...grey);doc.setFontSize(6);doc.setFont("helvetica","normal");doc.text(String(l).toUpperCase(),x+3,y+5.5);
      doc.setTextColor(...(c as [number,number,number]));doc.setFontSize(9);doc.setFont("helvetica","bold");doc.text(String(v),x+3,y+11);
    });

    doc.setFillColor(...gold);doc.rect(0,291,W,6,"F");
    doc.setTextColor(...dark);doc.setFontSize(7);doc.setFont("helvetica","bold");
    doc.text("VALORA · Institutional Development Appraisal",M,295.5);doc.text(`Confidential · ${new Date().toLocaleDateString("en-GB")}`,W-M,295.5,{align:"right"});
  }

  doc.save(`Valora_Brochure_${(data.name||"Deal").replace(/\s+/g,"_")}_${new Date().toISOString().slice(0,10)}.pdf`);
}


// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
function AppraisalPage(){
  const router=useRouter();
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
        if(appr.snapshot){const snap=appr.snapshot;const type=(snap.assetType||"BTR") as AssetType;setAssetType(type);setData(snap);setSaved(true);if(snap.hotelMode)setHotelMode(snap.hotelMode);}
        if(appr.share_token)setLiveLink(`${window.location.origin}/share/${appr.share_token}`);
      }
      setLoading(false);
    };
    load();
  },[appraisalParam,user]);
  const set=useCallback((field:string,value:any)=>{
    setData((prev:any)=>({...prev,[field]:value}));
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
    if(assetType!=="BTR")return null;
    const yields=[-0.5,-0.25,0,0.25,0.5].map(d=>num(String(data.exitYield))+d);
    const rentMults=[-0.10,-0.05,0,0.05,0.10].map(d=>1+d);
    return yields.map(y=>rentMults.map(rf=>{
      const modData={...data,exitYield:y,units:(data.units||[]).map((u:any)=>({...u,rentPcm:num(String(u.rentPcm))*rf}))};
      return calcAll("BTR",modData).poc??0;
    }));
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

  const runFlipComps=async()=>{
    if(!data.location&&!data.purchasePrice)return;
    setFlipCompsRunning(true);setFlipCompsError(null);setFlipComps(null);
    const currSym={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";
    try{
      const res=await fetch("/api/sensecheck",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dealSummary:`Provide residential property comparables for a house flip. Location: ${data.location||"UK"}. Property size: ${data.propertySqft||"unknown"} sqft. Purchase price: ${currSym}${data.purchasePrice||"unknown"}. Currency: ${data.currency||"GBP"}.\n\nRespond ONLY with a JSON object: {"comparables":[{"address":"...","price":number,"sqft":number,"pricePsf":number,"bedrooms":number,"type":"...","sold":"YYYY-MM","notes":"..."}],"marketContext":"...","avgPricePsf":number,"refurbUplift":{"low":number,"high":number,"notes":"..."},"rentalComps":[{"address":"...","rentPcm":number,"bedrooms":number,"type":"...","notes":"..."}],"avgRentPcm":number}. Include 4-5 sold comps and 3-4 rental comps. Use training knowledge only.`})});
      const d=await res.json();
      // Try to parse JSON from the AI sense check response
      if(d.flags||d.summary){
        // It returned sense check format — try to extract JSON from summary
        setFlipCompsError("Use the AI Comps button for comparable data");
      } else {
        setFlipComps(d);
      }
    }catch(e:any){setFlipCompsError(e.message||"Failed");}
    setFlipCompsRunning(false);
  };
  const runFlipCompsAI=async()=>{
    if(!data.location)return;
    setFlipCompsRunning(true);setFlipCompsError(null);setFlipComps(null);
    const currSym={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";
    const sqft=num(String(data.propertySqft||0));
    const beds=data.bedrooms||"unknown";
    try{
      const res=await fetch("/api/sensecheck",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dealSummary:`You are a property data assistant. Provide residential property market data for a house flip investment analysis.

Property details:
- Location: ${data.location}
- Size: ${sqft>0?sqft+"sqft":"unknown"}
- Purchase price: ${currSym}${data.purchasePrice||"unknown"}
- Currency: ${data.currency||"GBP"}

Respond ONLY with valid JSON (no markdown, no explanation) in this exact format:
{"comparables":[{"address":"Street, Area","price":350000,"sqft":850,"pricePsf":412,"bedrooms":3,"type":"Terraced","sold":"2024-Q3","notes":"Refurbished"},{"address":"Street, Area","price":380000,"sqft":920,"pricePsf":413,"bedrooms":3,"type":"Semi-detached","sold":"2024-Q2","notes":"Extended kitchen"}],"marketContext":"Brief 2-sentence market summary","avgPricePsf":410,"refurbUplift":{"low":25000,"high":45000,"notes":"Kitchen/bathroom focus"},"rentalComps":[{"address":"Street, Area","rentPcm":1800,"bedrooms":3,"type":"Terraced","notes":"Furnished"},{"address":"Street, Area","rentPcm":1950,"bedrooms":3,"type":"Semi-detached","notes":"Unfurnished"}],"avgRentPcm":1875}

Provide 4-5 sold comps and 3-4 rental comps. Use realistic figures based on your knowledge of ${data.location} property market. Do not include any text outside the JSON object.`})});
      const text=await res.text();
      // Parse JSON — the sensecheck API may wrap it
      const jsonMatch=text.match(/\{[\s\S]*\}/);
      if(!jsonMatch)throw new Error("No JSON in response");
      const d=JSON.parse(jsonMatch[0]);
      if(d.comparables||d.marketContext){setFlipComps(d);}
      else if(d.flags){throw new Error("No comps data returned — try again");}
      else{setFlipComps(d);}
    }catch(e:any){setFlipCompsError(e.message||"Failed to fetch comps — try again");}
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
      if(sale<purchase)flags.push({severity:"error",field:"Sale Price",message:"Sale price is below purchase price — this deal will make a loss.",benchmark:"Sale price must exceed total cost"});
      const uplift=purchase>0?(sale-purchase)/purchase*100:0;
      if(uplift>40)flags.push({severity:"warning",field:"Sale Price",message:`${uplift.toFixed(0)}% price uplift is very high.`,benchmark:"Typical refurb uplift: 15–30%"});
    }
    const programme=num(String(data.programmMonths));
    if(programme<6&&(assetType==="BTR"||assetType==="BTS"))flags.push({severity:"error",field:"Programme",message:`${programme} month programme is too short.`,benchmark:`Typical ${assetType} programme: 24–48 months`});
    const margin=num(String(data.marginOverBenchmark));
    if(margin<1.5)flags.push({severity:"info",field:"Finance Margin",message:`${margin}% margin over benchmark is tight.`,benchmark:"Typical development finance margin: 2.0–3.5%"});
    const overall=flags.filter(f=>f.severity==="error").length>0?"red":flags.filter(f=>f.severity==="warning").length>=2?"amber":flags.length===0?"green":"amber";
    const summary=overall==="green"?"All assumptions look credible — no major issues identified.":overall==="amber"?`${flags.length} assumption${flags.length!==1?"s":""} to review before presenting to a lender.`:`${flags.filter((f:any)=>f.severity==="error").length} critical issue${flags.filter((f:any)=>f.severity==="error").length!==1?"s":""} identified — address before proceeding.`;
    setSenseResult({overall,summary,flags});
  },[assetType,data,r]);
  const runAISenseCheck=async()=>{
    setSenseRunning(true);setSenseError(null);setSenseResult(null);
    const currSym={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";
    const dealSummary=`Asset Type: ${assetType} | Location: ${data.location||"Not specified"} | Currency: ${data.currency}
Programme: ${data.programmMonths} months ${assetType==="BTS"?`+ ${data.absorptionMonths}m absorption`:""}
${assetType==="BTR"?`Units: ${(data.units||[]).map((u:any)=>`${u.count}x ${u.type} @ ${currSym}${u.rentPcm}pcm (${u.size}sqft)`).join(", ")}\nExit Yield: ${data.exitYield}% | Void: ${data.voidPct}% | OpEx: ${currSym}${data.opexPsf}psf\nBuild Cost: ${currSym}${data.buildCostPsf}psf`:""}
${assetType==="BTS"?`Units: ${(data.units||[]).map((u:any)=>`${u.count}x ${u.type} @ ${currSym}${u.salePricePsf}psf (${u.size}sqft)`).join(", ")}\nBuild Cost: ${currSym}${data.buildCostPsf}psf`:""}
${assetType==="Hotel"?`Rooms: ${data.rooms} | Stars: ${data.starRating} | ADR: ${currSym}${data.adr} | Occupancy: ${data.occupancy}%\nEBITDA: ${fmt(r.ebitda,currSym)}pa | DSCR: ${fmtX(r.dscr)}`:""}
Finance: LTC ${data.ltc||data.bridgingRatePct}% | Benchmark: ${data.benchmark} + ${data.marginOverBenchmark}% | All-in: ${r.financeRate?(r.financeRate*100).toFixed(2):"N/A"}%
Prof Fees: ${data.professionalFeesPct}% | Contingency: ${data.contingencyPct}%
Results: GDV ${fmt(r.gdv||r.exitValue||r.salePrice||0,currSym)} | Cost ${fmt(r.totalCost||r.totalInvestment||0,currSym)} | Profit ${fmt(r.profit||0,currSym)} | PoC ${fmtPct(r.poc||r.roi||0)} | IRR ${fmtPct(r.irr||0)} | MOIC ${fmtX(r.moic||0)} | DSCR ${r.dscr?fmtX(r.dscr):"N/A"}`.trim();
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
      let resolvedProjectId=currentProjectId;
      if(!resolvedProjectId){
        const{data:proj,error:projErr}=await supabase.from("projects").insert({name:data.name||"New Project",location:data.location||"",asset_type:assetType,currency:data.currency||"GBP",benchmark_rate:data.benchmark||"SONIA",created_by:user.id,firm_id:null}).select().single();
        if(projErr){setSaveError(`Project error: ${projErr.message}`);setSaving(false);return;}
        resolvedProjectId=proj.id;setCurrentProjectId(proj.id);
      }
      const payload:Record<string,any>={
        created_by:user.id,project_id:resolvedProjectId,name:data.name||"Untitled Appraisal",scenario:"base",status:"draft",
        units_omr:assetType==="BTR"?(data.units?.filter((u:any)=>u.type?.includes("OMR")).reduce((s:number,u:any)=>s+num(String(u.count)),0)||0):0,
        units_dmr:assetType==="BTR"?(data.units?.filter((u:any)=>u.type?.includes("DMR")).reduce((s:number,u:any)=>s+num(String(u.count)),0)||0):0,
        rent_omr_pcm:assetType==="BTR"?(data.units?.[0]?.rentPcm||0):0,
        exit_yield:num(String(data.exitYield||0))/100,land_cost:num(String(data.landCost||data.purchasePrice||0)),
        gdv:r.gdv||r.exitValue||r.salePrice||0,total_cost:r.totalCost||r.totalInvestment||0,profit:r.profit||0,
        profit_on_cost:r.poc||r.roi||0,irr_unlevered:r.irr||0,irr_levered:r.irrLevered||0,programme_months:num(String(data.programmMonths)),firm_id:null,
        snapshot:{
          ...data,
          assetType,
          moic:r.moic||0,
          dscr:isFinite(r.dscr)&&r.dscr!==Infinity?r.dscr:0,
          paybackMonth:r.paybackMonth||null,
          hotelMode:assetType==="Hotel"?hotelMode:"simple",
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
      if(apprResult){setAppraisalId(apprResult.id);setSaved(true);}
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
    await supabase.from("appraisals").update({share_token:token}).eq("id",appraisalId);
    setLiveLink(`${window.location.origin}/share/${token}`);setGeneratingLink(false);
  };
  const copyLink=async()=>{if(!liveLink)return;await navigator.clipboard.writeText(liveLink);setLinkCopied(true);setTimeout(()=>setLinkCopied(false),2000);};
  const shareEmail=()=>{if(!liveLink)return;const subject=encodeURIComponent(`Valora Appraisal: ${data.name||"Untitled"}`);const body=encodeURIComponent(`Please find the appraisal here:\n\n${liveLink}`);window.open(`mailto:?subject=${subject}&body=${body}`);};
  const shareWhatsApp=()=>{if(!liveLink)return;const text=encodeURIComponent(`Valora Appraisal — ${data.name||"Untitled"}: ${liveLink}`);window.open(`https://wa.me/?text=${text}`);};
  const handleGeneratePDF=async()=>{
    setGeneratingPDF(true);
    try{const currSym={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";await generatePDF(data,results,assetType,currSym,user?.email||"");}
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
- DSCR / ICR: ${fmtX(r.dscr)}
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
    if(!brochureContent)return;setDownloadingBrochure(true);
    try{const currSym={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";await generateBrochurePDF(data,r,assetType,currSym,brochureContent,brochurePhotos,hotelMode,hotelAdv);}
    catch(e){console.error("Brochure PDF error:",e);}
    setDownloadingBrochure(false);
  };
  const[panelOpen,setPanelOpen]=useState(true);
  const TABS_BTR=["general","revenue","costs","finance","cashflow","analysis"];
  const TABS_BTS=["general","revenue","costs","finance","analysis"];
  const TABS_HOTEL=hotelMode==="advanced"?["general","revenue","costs","finance","im","cashflow","analysis"]:["general","revenue","costs","finance","cashflow","analysis"];
  const TABS_FLIP=["general","costs","finance","comps","analysis"];
  const TABS=assetType==="BTR"?TABS_BTR:assetType==="BTS"?TABS_BTS:assetType==="Hotel"?TABS_HOTEL:TABS_FLIP;
  const TAB_LABELS:Record<string,string>={general:"General",revenue:"Revenue",costs:"Costs",finance:"Finance",im:"IM & Costs",cashflow:"Cash Flow",analysis:"Analysis",comps:"Comparables"};
  const currencies=["GBP","USD","EUR","AED","SGD","AUD","JPY","CHF","CAD","HKD"];
  const benchmarks=["SONIA","SOFR","EURIBOR","EIBOR","SORA","AONIA","TONA","SARON","CORRA","HONIA"];
  const currencySymbol={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";
  if(loading)return(
    <div style={{minHeight:"100vh",background:"#06070a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <img src="data:image/png;base64,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" alt="Valora" style={{height:"28px",width:"auto",flexShrink:0}}/>
      </div>
      <div style={{width:32,height:32,border:"2px solid rgba(201,168,76,.15)",borderTopColor:"#c9a84c",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <div style={{fontSize:12,color:"#3d4249",letterSpacing:".06em"}}>Loading appraisal…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"var(--font-body)"}}>
      <style>{CSS}</style>
      {/* Nav */}
      <div style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"0 16px",height:56,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100}}>
        <button onClick={()=>router.push("/dashboard")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
          <img src="data:image/png;base64,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" alt="Valora" style={{height:"24px",width:"auto",flexShrink:0}}/>
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
        {(["BTR","BTS","Hotel","Flip"] as AssetType[]).map(t=>(
          <button key={t} onClick={()=>{if(appraisalId)return;switchAssetType(t);}} style={{padding:"3px 10px",borderRadius:5,fontSize:11,fontWeight:600,cursor:appraisalId?"not-allowed":"pointer",border:"1px solid",background:assetType===t?"rgba(201,168,76,.12)":"transparent",borderColor:assetType===t?"var(--gold)":"var(--border)",color:assetType===t?"var(--gold)":"var(--text-d)",fontFamily:"var(--font-body)",transition:"all .2s",opacity:appraisalId&&assetType!==t?0.35:1,flexShrink:0,whiteSpace:"nowrap"}}>{t}</button>
        ))}
        {appraisalId&&<span style={{fontSize:9,color:"var(--text-d)",flexShrink:0}}>· locked</span>}
        <div style={{flex:1,minWidth:6}}/>
        {/* Simple / Advanced toggle — Hotel only, lives in the header bar */}
        {assetType==="Hotel"&&(
          <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
            <span style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em"}}>Mode:</span>
            <div style={{display:"flex",border:"1px solid var(--border)",borderRadius:6,overflow:"hidden"}}>
              {(["simple","advanced"] as const).map(m=>(
                <button key={m} onClick={()=>setHotelMode(m)} style={{padding:"3px 12px",background:hotelMode===m?"var(--gold)":"transparent",color:hotelMode===m?"#06070a":"var(--text-d)",border:"none",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"var(--font-body)",transition:"all .15s",whiteSpace:"nowrap"}}>
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
                  <div className="inp-group"><label className="inp-label">{data.benchmark} Rate (%)</label><input className="inp" type="number" step="0.01" value={data.benchmarkRate} onChange={e=>set("benchmarkRate",e.target.value)}/></div>
                </div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Programme (months)</label><input className="inp" type="number" value={data.programmMonths} onChange={e=>set("programmMonths",e.target.value)}/></div>
                  {assetType!=="Flip"&&<div className="inp-group"><label className="inp-label">Stabilisation (months)</label><input className="inp" type="number" value={data.stabilisationMonths} onChange={e=>set("stabilisationMonths",e.target.value)}/></div>}
                </div>
                <div className="inp-group"><label className="inp-label">Cost Profile</label><select className="inp" value={data.costProfile} onChange={e=>set("costProfile",e.target.value)}><option value="scurve">S-Curve (recommended)</option><option value="straight">Straight-Line</option><option value="frontloaded">Front-Loaded</option></select></div>
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
                      <div className="inp-group"><label className="inp-label">GFA (sqm)</label><input className="inp" type="number" value={data.gfaSqm||9603} onChange={e=>set("gfaSqm",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Avg Room Size (sqm)</label><input className="inp" type="number" value={data.avgRoomSqm||25} onChange={e=>set("avgRoomSqm",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">No. of Floors</label><input className="inp" type="number" value={data.floors||7} onChange={e=>set("floors",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Year Built</label><input className="inp" type="number" value={data.yearBuilt||2000} onChange={e=>set("yearBuilt",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Last Renovated</label><input className="inp" type="number" value={data.yearRenovated||2019} onChange={e=>set("yearRenovated",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Hold Period (years)</label><select className="inp" value={data.holdYears||5} onChange={e=>set("holdYears",e.target.value)}>{[3,5,7,10].map(y=><option key={y} value={y}>{y} years</option>)}</select></div>
                      <div className="inp-group"><label className="inp-label">Brand / Franchise</label><input className="inp" value={data.brandFranchise||""} onChange={e=>set("brandFranchise",e.target.value)} placeholder="e.g. Accor / Pullman"/></div>
                    </div>
                    <div style={{height:1,background:"var(--border)",margin:"20px 0"}}/>
                    <div className="section-title">Facilities</div>
                    <div className="inp-row-3">
                      <div className="inp-group"><label className="inp-label">Meeting Rooms</label><input className="inp" type="number" value={data.meetingRoomCount||6} onChange={e=>set("meetingRoomCount",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Meeting Area (sqm)</label><input className="inp" type="number" value={data.meetingAreaSqm||320} onChange={e=>set("meetingAreaSqm",e.target.value)}/></div>
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
                  <div className="inp-group"><label className="inp-label">Exit Yield (%)</label><input className="inp" type="number" step="0.05" value={data.exitYield} onChange={e=>set("exitYield",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">NIY (%)</label><input className="inp" type="number" step="0.05" value={data.niy} onChange={e=>set("niy",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Void (%)</label><input className="inp" type="number" step="0.1" value={data.voidPct} onChange={e=>set("voidPct",e.target.value)}/></div>
                </div>
                <div className="inp-group"><label className="inp-label">OpEx (psf pa)</label><input className="inp" type="number" value={data.opexPsf} onChange={e=>set("opexPsf",e.target.value)}/></div>
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
                  <div className="inp-group"><label className="inp-label">Agent Fee (%)</label><input className="inp" type="number" step="0.1" value={data.agentFeePct} onChange={e=>set("agentFeePct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Marketing (%)</label><input className="inp" type="number" step="0.1" value={data.marketingPct} onChange={e=>set("marketingPct",e.target.value)}/></div>
                </div>
                <div className="inp-group"><label className="inp-label">Absorption Period (months)</label><input className="inp" type="number" value={data.absorptionMonths} onChange={e=>set("absorptionMonths",e.target.value)}/></div>
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
                    <div className="inp-group"><label className="inp-label">Number of Rooms</label><input className="inp" type="number" value={data.rooms} onChange={e=>set("rooms",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Star Rating</label><select className="inp" value={data.starRating} onChange={e=>set("starRating",e.target.value)}>{[3,4,5].map(s=><option key={s}>{s}</option>)}</select></div>
                  </div>
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">ADR ({currencySymbol})</label><input className="inp" type="number" value={data.adr} onChange={e=>set("adr",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Occupancy (%)</label><input className="inp" type="number" value={data.occupancy} onChange={e=>set("occupancy",e.target.value)}/></div>
                  </div>
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">Rooms GOP Margin (%)</label><input className="inp" type="number" value={data.roomsMarginPct??75} onChange={e=>set("roomsMarginPct",e.target.value)}/></div>
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
                    <div className="inp-group"><label className="inp-label">Revenue per Occ Room ({currencySymbol})</label><input className="inp" type="number" value={data.fnbRevenuePerOccRoom??45} onChange={e=>set("fnbRevenuePerOccRoom",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Capture Rate (%)</label><input className="inp" type="number" value={data.fnbUtilisationPct??70} onChange={e=>set("fnbUtilisationPct",e.target.value)}/></div>
                  </div>
                  <div className="inp-group"><label className="inp-label">F&B GOP Margin (%)</label><input className="inp" type="number" value={data.fnbMarginPct??30} onChange={e=>set("fnbMarginPct",e.target.value)}/></div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"var(--bg3)",borderRadius:6,fontSize:12}}>
                    <span style={{color:"var(--text-m)"}}>F&B Revenue pa</span>
                    <span style={{fontFamily:"var(--font-mono)",color:data.fnbEnabled?"var(--gold)":"var(--text-d)"}}>{fmt(hotelRev?.fnbRev||0,currencySymbol)}</span>
                  </div>
                </RevStream>
                <RevStream title="Spa & Wellness" icon="" enabled={data.spaEnabled} onToggle={()=>set("spaEnabled",!data.spaEnabled)} summary={fmt(hotelRev?.spaRev||0,currencySymbol)+" pa"} open={streamOpen.spa} onOpen={()=>setStreamOpen(s=>({...s,spa:!s.spa}))}>
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">Revenue per Room pa ({currencySymbol})</label><input className="inp" type="number" value={data.spaRevenuePerRoomPa??800} onChange={e=>set("spaRevenuePerRoomPa",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Utilisation (%)</label><input className="inp" type="number" value={data.spaUtilisationPct??40} onChange={e=>set("spaUtilisationPct",e.target.value)}/></div>
                  </div>
                  <div className="inp-group"><label className="inp-label">Spa GOP Margin (%)</label><input className="inp" type="number" value={data.spaMarginPct??35} onChange={e=>set("spaMarginPct",e.target.value)}/></div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"var(--bg3)",borderRadius:6,fontSize:12}}>
                    <span style={{color:"var(--text-m)"}}>Spa Revenue pa</span>
                    <span style={{fontFamily:"var(--font-mono)",color:data.spaEnabled?"var(--gold)":"var(--text-d)"}}>{fmt(hotelRev?.spaRev||0,currencySymbol)}</span>
                  </div>
                </RevStream>
                <RevStream title="Gym & Leisure" icon="" enabled={data.gymEnabled} onToggle={()=>set("gymEnabled",!data.gymEnabled)} summary={fmt(hotelRev?.gymRev||0,currencySymbol)+" pa"} open={streamOpen.gym} onOpen={()=>setStreamOpen(s=>({...s,gym:!s.gym}))}>
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">External Membership Rev pa ({currencySymbol})</label><input className="inp" type="number" value={data.gymMembershipRevPa??50000} onChange={e=>set("gymMembershipRevPa",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Guest Rev per Occ Room ({currencySymbol})</label><input className="inp" type="number" value={data.gymGuestRevPerOccRoom??8} onChange={e=>set("gymGuestRevPerOccRoom",e.target.value)}/></div>
                  </div>
                  <div className="inp-group"><label className="inp-label">Gym GOP Margin (%)</label><input className="inp" type="number" value={data.gymMarginPct??60} onChange={e=>set("gymMarginPct",e.target.value)}/></div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"var(--bg3)",borderRadius:6,fontSize:12}}>
                    <span style={{color:"var(--text-m)"}}>Gym Revenue pa</span>
                    <span style={{fontFamily:"var(--font-mono)",color:data.gymEnabled?"var(--gold)":"var(--text-d)"}}>{fmt(hotelRev?.gymRev||0,currencySymbol)}</span>
                  </div>
                </RevStream>
                <RevStream title="Meeting Rooms & Events" icon="" enabled={data.meetingEnabled} onToggle={()=>set("meetingEnabled",!data.meetingEnabled)} summary={fmt(hotelRev?.meetingRev||0,currencySymbol)+" pa"} open={streamOpen.meeting} onOpen={()=>setStreamOpen(s=>({...s,meeting:!s.meeting}))}>
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">Number of Meeting Rooms</label><input className="inp" type="number" value={data.meetingRooms??4} onChange={e=>set("meetingRooms",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Avg Day Rate ({currencySymbol})</label><input className="inp" type="number" value={data.meetingAvgDayRate??1200} onChange={e=>set("meetingAvgDayRate",e.target.value)}/></div>
                  </div>
                  <div className="inp-row">
                    <div className="inp-group"><label className="inp-label">Utilisation (%)</label><input className="inp" type="number" value={data.meetingUtilisationPct??45} onChange={e=>set("meetingUtilisationPct",e.target.value)}/></div>
                    <div className="inp-group"><label className="inp-label">Events GOP Margin (%)</label><input className="inp" type="number" value={data.meetingMarginPct??40} onChange={e=>set("meetingMarginPct",e.target.value)}/></div>
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
            {activeTab==="costs"&&assetType!=="Flip"&&assetType!=="Hotel"&&(
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
                      <div className="inp-group"><label className="inp-label">Legal Costs ({currencySymbol})</label><input className="inp" type="number" value={data.legalCosts??500000} onChange={e=>set("legalCosts",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Financing DD ({currencySymbol})</label><input className="inp" type="number" value={data.financingDD??250000} onChange={e=>set("financingDD",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Disposal Costs (%)</label><input className="inp" type="number" step="0.5" value={data.disposalCostPct??3.0} onChange={e=>set("disposalCostPct",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group">
                        <label className="inp-label" style={{display:"flex",alignItems:"center",gap:6}}>
                          <input type="checkbox" checked={data.wiInsuranceEnabled||false} onChange={e=>set("wiInsuranceEnabled",e.target.checked)} style={{width:14,height:14}}/>
                          W&I Insurance ({currencySymbol})
                        </label>
                        <input className="inp" type="number" value={data.wiInsurance??150000} onChange={e=>set("wiInsurance",e.target.value)} disabled={!data.wiInsuranceEnabled} style={{opacity:data.wiInsuranceEnabled?1:0.4}}/>
                      </div>
                      <div className="inp-group">
                        <label className="inp-label" style={{display:"flex",alignItems:"center",gap:6}}>
                          <input type="checkbox" checked={data.workingCapitalEnabled||false} onChange={e=>set("workingCapitalEnabled",e.target.checked)} style={{width:14,height:14}}/>
                          Working Capital ({currencySymbol})
                        </label>
                        <input className="inp" type="number" value={data.workingCapital??0} onChange={e=>set("workingCapital",e.target.value)} disabled={!data.workingCapitalEnabled} style={{opacity:data.workingCapitalEnabled?1:0.4}}/>
                      </div>
                    </div>
                    <div style={{height:1,background:"var(--border)",margin:"20px 0"}}/>
                    <div className="section-title">Ongoing Costs (pa)</div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Supporting Costs pa ({currencySymbol})</label><input className="inp" type="number" value={data.supportingCostsPA??100000} onChange={e=>set("supportingCostsPA",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Hotel Operator Fees pa ({currencySymbol})</label><input className="inp" type="number" value={data.operatorFeesPA??0} onChange={e=>set("operatorFeesPA",e.target.value)}/></div>
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
                      {urlImporting?<><span style={{width:10,height:10,border:"2px solid #06070a44",borderTopColor:"#06070a",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Importing…</>:"Import"}
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
                  <div className="inp-group"><label className="inp-label">Property Size (sqft)</label><input className="inp" type="number" value={data.propertySqft||""} onChange={e=>set("propertySqft",e.target.value)} placeholder="e.g. 900"/></div>
                </div>
                {data.propertySqft>0&&data.purchasePrice>0&&(
                  <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12,fontFamily:"var(--font-mono)"}}>
                    Purchase price: <span style={{color:"var(--blue)"}}>{currencySymbol}{Math.round(num(String(data.purchasePrice))/num(String(data.propertySqft)))}/sqft</span>
                  </div>
                )}
                <SDLTBlock data={data} set={set} r={r} currencySymbol={currencySymbol}/>

                <div className="section-title" style={{marginTop:24}}>Refurbishment</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">Refurb Budget ({currencySymbol})</label>
                    <input className="inp" type="number" value={data.refurbBudget||""} onChange={e=>{set("refurbBudget",e.target.value);if(data.propertySqft>0)set("refurbPsf",Math.round(num(e.target.value)/num(String(data.propertySqft))));}} placeholder="Total budget"/>
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Refurb Cost (psf)</label>
                    <input className="inp" type="number" value={data.refurbPsf||""} onChange={e=>{set("refurbPsf",e.target.value);if(data.propertySqft>0)set("refurbBudget",Math.round(num(e.target.value)*num(String(data.propertySqft))));}} placeholder="Cost per sqft"/>
                  </div>
                </div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Professional Fees (%)</label><input className="inp" type="number" step="0.5" value={data.professionalFeesPct} onChange={e=>set("professionalFeesPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Contingency (%)</label><input className="inp" type="number" step="0.5" value={data.contingencyPct} onChange={e=>set("contingencyPct",e.target.value)}/></div>
                </div>
                <div className="inp-group"><label className="inp-label">Other Costs ({currencySymbol})</label><input className="inp" type="number" value={data.otherCosts} onChange={e=>set("otherCosts",e.target.value)}/></div>

                <div className="section-title" style={{marginTop:24}}>{(data.flipMode||"sell")==="hold"?"GDV / Refinance Value":"Sale"}</div>
                <div className="inp-row">
                  <div className="inp-group">
                    <label className="inp-label">{(data.flipMode||"sell")==="hold"?"GDV / Est. Value ({currencySymbol})":"Sale Price ({currencySymbol})"}</label>
                    <input className="inp" type="number" value={data.salePrice||""} onChange={e=>{set("salePrice",e.target.value);if(data.propertySqft>0)set("salePricePsf",Math.round(num(e.target.value)/num(String(data.propertySqft))));}}/>
                  </div>
                  <div className="inp-group">
                    <label className="inp-label">Sale / GDV (psf)</label>
                    <input className="inp" type="number" value={data.salePricePsf||""} onChange={e=>{set("salePricePsf",e.target.value);if(data.propertySqft>0)set("salePrice",Math.round(num(e.target.value)*num(String(data.propertySqft))));}}/>
                  </div>
                </div>
                {(data.flipMode||"sell")==="sell"&&(
                  <div className="inp-group"><label className="inp-label">Agent Fee (%)</label><input className="inp" type="number" step="0.1" value={data.agentFeePct} onChange={e=>set("agentFeePct",e.target.value)}/></div>
                )}
                {/* Hold mode — rental inputs */}
                {(data.flipMode||"sell")==="hold"&&(
                  <>
                    <div className="section-title" style={{marginTop:24}}>Rental Income</div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Rent ({currencySymbol}/month)</label><input className="inp" type="number" value={data.rentPcm||""} onChange={e=>set("rentPcm",e.target.value)} placeholder="e.g. 2200"/></div>
                      <div className="inp-group"><label className="inp-label">Void / Vacancy (%)</label><input className="inp" type="number" step="0.5" value={data.voidPct} onChange={e=>set("voidPct",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Monthly OpEx ({currencySymbol})</label><input className="inp" type="number" value={data.holdOpexPm} onChange={e=>set("holdOpexPm",e.target.value)} placeholder="Service charge, insurance etc"/></div>
                      <div className="inp-group"><label className="inp-label">Agent Fee (%)</label><input className="inp" type="number" step="0.1" value={data.agentFeePct} onChange={e=>set("agentFeePct",e.target.value)}/></div>
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
                  {data.propertySqft>0&&r.refurb>0&&(
                    <div style={{fontSize:10,color:"var(--text-d)",marginTop:8,fontFamily:"var(--font-mono)"}}>
                      Refurb: {currencySymbol}{Math.round(r.refurb/num(String(data.propertySqft)))}/sqft
                      {r.salePrice>0&&<> · Uplift: <span style={{color:r.salePrice>r.totalCost?"var(--green)":"var(--red)"}}>{currencySymbol}{Math.round((r.salePrice-r.purchase)/num(String(data.propertySqft)))}/sqft</span></>}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* FINANCE */}
            {activeTab==="finance"&&(
              <div>
                <div className="section-title">Development Finance</div>
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
                          <div className="inp-group"><label className="inp-label">LTC Ratio (%)</label><input className="inp" type="number" step="1" value={data.ltc} onChange={e=>set("ltc",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Interest Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.marginOverBenchmark} onChange={e=>set("marginOverBenchmark",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
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
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
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
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
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
                        {data.hedgingEnabled&&<input className="inp" type="number" value={data.hedgingCost||0} onChange={e=>set("hedgingCost",e.target.value)} placeholder="Cost £" style={{width:120}}/>}
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
                {assetType!=="Flip"?(
                  <>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">LTC Ratio (%)</label><input className="inp" type="number" step="1" value={data.ltc} onChange={e=>set("ltc",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Margin over {data.benchmark} (%)</label><input className="inp" type="number" step="0.1" value={data.marginOverBenchmark} onChange={e=>set("marginOverBenchmark",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">All-in Rate (auto)</label><div className="inp" style={{color:"var(--blue)",cursor:"not-allowed"}}>{r.financeRate?`${(r.financeRate*100).toFixed(2)}%`:"—"}</div></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Loan Amount (auto)</label><div className="inp" style={{color:"var(--amber)",cursor:"not-allowed"}}>{fmt(r.loanAmount||0,currencySymbol)}</div></div>
                      <div className="inp-group"><label className="inp-label">Peak Loan Balance (rolled)</label><div className="inp" style={{color:"var(--amber)",cursor:"not-allowed"}}>{fmt(r.peakLoanBalance||0,currencySymbol)}</div></div>
                    </div>
                    <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginBottom:20}}>
                      <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Finance Cost Breakdown</div>
                      {([["Arrangement Fee",r.arrangementFee||0,"var(--amber)"],["Interest (Rolled Monthly)",r.interestCost||0,"var(--amber)"],["Total Finance Cost",r.totalFinanceCost||0,"var(--gold)"]] as any[]).map(([l,v,c])=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}>
                          <span style={{color:"var(--text-m)"}}>{l}</span>
                          <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:l==="Total Finance Cost"?600:400}}>{fmt(v,currencySymbol)}</span>
                        </div>
                      ))}
                      <div style={{fontSize:10,color:"var(--text-d)",marginTop:8,fontStyle:"italic"}}>Interest accrues monthly on drawn balance (rolled / PIK). Exact S-curve model.</div>
                    </div>
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
                ):(<>
                    <div style={{fontSize:11,color:"var(--gold)",fontWeight:600,marginBottom:12}}>Bridging Finance</div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">LTV (%)</label><input className="inp" type="number" step="1" value={data.flipLTV} onChange={e=>set("flipLTV",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Rate (%pm)</label><input className="inp" type="number" step="0.05" value={data.bridgingRatePct} onChange={e=>set("bridgingRatePct",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Term (months)</label><input className="inp" type="number" value={data.bridgingTermMonths} onChange={e=>set("bridgingTermMonths",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"var(--bg3)",borderRadius:6,fontSize:12,marginBottom:16}}>
                      <span style={{color:"var(--text-m)"}}>Loan Amount</span>
                      <span style={{fontFamily:"var(--font-mono)",color:"var(--amber)"}}>{fmt(r.loanAmount||0,currencySymbol)}</span>
                    </div>
                    {(data.flipMode||"sell")==="hold"&&(
                      <>
                        <div style={{height:1,background:"var(--border)",margin:"16px 0"}}/>
                        <div style={{fontSize:11,color:"var(--blue)",fontWeight:600,marginBottom:12}}>Refinance (BTL Mortgage) — after month {data.bridgingTermMonths||6}</div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Refi LTV (%)</label><input className="inp" type="number" step="1" value={data.refiLTV} onChange={e=>set("refiLTV",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Refi Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.refiRatePct} onChange={e=>set("refiRatePct",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Hold Term (months)</label><input className="inp" type="number" value={data.refiTermMonths} onChange={e=>set("refiTermMonths",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.refiArrangementPct} onChange={e=>set("refiArrangementPct",e.target.value)}/></div>
                        </div>
                        {(r.refiLoan||0)>0&&(
                          <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:12}}>
                            <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Refinance Summary</div>
                            {[
                              ["Refi Loan",fmt(r.refiLoan||0,currencySymbol),"var(--text-m)"],
                              ["Monthly Interest",`${currencySymbol}${Math.round(r.refiInterestPm||0)}/mo`,"var(--amber)"],
                              ["Net Cashflow pm",`${currencySymbol}${Math.round(r.netCashflowPm||0)}/mo`,(r.netCashflowPm||0)>0?"var(--green)":"var(--red)"],
                              ["Gross Yield",fmtPct(r.grossYield||0),"var(--blue)"],
                              ["Net Yield",fmtPct(r.netYield||0),"var(--blue)"],
                            ].map(([l,v,c]:any)=>(
                              <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:"1px solid var(--bg4)"}}>
                                <span style={{color:"var(--text-m)"}}>{l}</span>
                                <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:500}}>{v}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
            {/* COMPARABLES TAB — Flip only */}
            {activeTab==="comps"&&assetType==="Flip"&&(
              <div>
                <div className="section-title">Market Comparables</div>
                <div style={{fontSize:12,color:"var(--text-d)",marginBottom:16}}>AI-sourced sold comparables and rental comps for {data.location||"your location"}. Based on training knowledge — verify with live data.</div>
                <button
                  onClick={runFlipCompsAI}
                  disabled={flipCompsRunning||!data.location}
                  style={{display:"flex",alignItems:"center",gap:6,background:flipCompsRunning?"var(--bg3)":"var(--gold-bg)",border:"1px solid var(--gold-border)",borderRadius:6,color:flipCompsRunning?"var(--text-d)":"var(--gold)",fontSize:11,padding:"10px 16px",cursor:flipCompsRunning||!data.location?"not-allowed":"pointer",fontFamily:"var(--font-body)",fontWeight:600,width:"100%",justifyContent:"center",marginBottom:16,transition:"all .2s"}}
                >
                  {flipCompsRunning?<><span style={{width:10,height:10,border:"1.5px solid rgba(201,168,76,.2)",borderTopColor:"var(--gold)",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/> Pulling comparables…</>:<><span style={{fontSize:13}}>◈</span>{flipComps?"Refresh Comparables":"Pull AI Comparables"}{!data.location?" (add location first)":""}</>}
                </button>
                {flipCompsError&&<div style={{fontSize:11,color:"var(--red)",padding:"8px 12px",background:"rgba(244,100,95,.06)",borderRadius:6,marginBottom:12}}>{flipCompsError}</div>}
                {flipComps&&(
                  <div style={{animation:"fadeIn .3s ease"}}>
                    {/* Market context */}
                    {flipComps.marketContext&&<div style={{fontSize:12,color:"var(--text-m)",lineHeight:1.7,marginBottom:16,padding:"10px 14px",background:"var(--bg3)",borderRadius:8}}>{flipComps.marketContext}</div>}
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
                          <div style={{marginTop:8,padding:"8px 12px",background:"var(--gold-bg)",border:"1px solid var(--gold-border)",borderRadius:6,fontSize:11}}>
                            <span style={{color:"var(--text-d)"}}>Market avg: </span>
                            <span style={{color:"var(--gold)",fontFamily:"var(--font-mono)",fontWeight:600}}>{currencySymbol}{flipComps.avgPricePsf}/sqft</span>
                            {data.propertySqft>0&&<><span style={{color:"var(--text-d)",marginLeft:8}}>→ Your property implied value: </span><span style={{color:"var(--green)",fontFamily:"var(--font-mono)",fontWeight:600}}>{fmt(flipComps.avgPricePsf*num(String(data.propertySqft)),currencySymbol)}</span></>}
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
                        <div className="inp-group"><label className="inp-label">Acquisition Fee ({currencySymbol})</label><input className="inp" type="number" value={data.imAcqFee??300000} onChange={e=>set("imAcqFee",e.target.value)}/></div>
                        <div className="inp-group"><label className="inp-label">Fee Type</label><select className="inp" value={data.imAcqFeeType||"fixed"} onChange={e=>set("imAcqFeeType",e.target.value)}><option value="fixed">Fixed £</option><option value="pct">% of Purchase Price</option></select></div>
                      </div>
                    </div>
                    <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:16,marginBottom:16}}>
                      <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Recurring Fees (Annual)</div>
                      <div className="inp-row">
                        <div className="inp-group"><label className="inp-label">Base Annual Charge ({currencySymbol} pa)</label><input className="inp" type="number" value={data.imBasePA??250000} onChange={e=>set("imBasePA",e.target.value)}/></div>
                        <div className="inp-group"><label className="inp-label">Charged On</label><select className="inp" value={data.imBaseChargedOn||"minimum"} onChange={e=>set("imBaseChargedOn",e.target.value)}><option value="minimum">Fixed Minimum</option><option value="revenue">% of Revenue</option></select></div>
                      </div>
                    </div>
                    <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:16,marginBottom:16}}>
                      <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Incentive Fees (on Exit)</div>
                      <div className="inp-row">
                        <div className="inp-group"><label className="inp-label">On Gross Sales (%)</label><input className="inp" type="number" step="0.1" value={data.imIncentiveSalesPct??1.0} onChange={e=>set("imIncentiveSalesPct",e.target.value)}/></div>
                        <div className="inp-group"><label className="inp-label">On Net Profit (%)</label><input className="inp" type="number" step="0.5" value={data.imIncentiveProfitPct??10.0} onChange={e=>set("imIncentiveProfitPct",e.target.value)}/></div>
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
                  <div className="inp-group"><label className="inp-label">Info & Telecom (%)</label><input className="inp" type="number" step="0.1" value={data.itPct??0.7} onChange={e=>set("itPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Admin & General (%)</label><input className="inp" type="number" step="0.1" value={data.agPct??5.0} onChange={e=>set("agPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Sales & Marketing (%)</label><input className="inp" type="number" step="0.1" value={data.smPct??8.5} onChange={e=>set("smPct",e.target.value)}/></div>
                </div>
                <div className="inp-row-3">
                  <div className="inp-group"><label className="inp-label">POM (%)</label><input className="inp" type="number" step="0.1" value={data.pomPct??1.8} onChange={e=>set("pomPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Utilities (%)</label><input className="inp" type="number" step="0.1" value={data.utilPct??2.2} onChange={e=>set("utilPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Mgmt Fee (%)</label><input className="inp" type="number" step="0.1" value={data.mgmtFeePct??2.0} onChange={e=>set("mgmtFeePct",e.target.value)}/></div>
                </div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Real Estate Tax (%)</label><input className="inp" type="number" step="0.1" value={data.realEstateTaxPct??7.5} onChange={e=>set("realEstateTaxPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Insurance (%)</label><input className="inp" type="number" step="0.1" value={data.insurancePct??0.5} onChange={e=>set("insurancePct",e.target.value)}/></div>
                </div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">FF&E Reserve (% from Yr3)</label><input className="inp" type="number" step="0.5" value={data.ffePct??3.0} onChange={e=>set("ffePct",e.target.value)}/></div>
                </div>
              </div>
            )}

            {/* CASHFLOW HOTEL */}
            {activeTab==="cashflow"&&assetType==="Hotel"&&(
              <div>
                <div className="section-title">Monthly Cash Flow</div>
                <div style={{fontSize:12,color:"var(--text-d)",marginBottom:16}}>
                  {data.costProfile==="scurve"?"S-Curve":data.costProfile==="frontloaded"?"Front-Loaded":"Straight-Line"} · {r.buildMonths}m renovation/fit-out · {r.stabMonths}m stabilisation
                  <span style={{marginLeft:12,color:"var(--gold)",fontFamily:"var(--font-mono)",fontSize:11}}>Interest rolls monthly on drawn balance</span>
                </div>
                <div style={{overflowX:"auto"}}>
                  <div className="cf-row" style={{marginBottom:8}}>
                    {["Month","CapEx Draw","Loan Bal","Interest","EBITDA","Net CF","Cum CF","Phase"].map(h=><div key={h} className="cf-header">{h}</div>)}
                  </div>
                  {(r.monthlyDrawArr||[]).slice(0,Math.min((r.buildMonths||24),36)).map((draw:number,m:number)=>{
                    const interest=r.monthlyInterestArr?.[m]||0;
                    const loanBal=(r.monthlyDrawArr||[]).slice(0,m+1).reduce((a:number,b:number)=>a+b,0)*(r.ltcPct||0.60);
                    const cumCf=(r.uCfs||[]).slice(0,m+1).reduce((a:number,b:number)=>a+b,0);
                    const cumPct=((r.buildProfile||[]).slice(0,m+1).reduce((a:number,b:number)=>a+b,0)*100).toFixed(0);
                    return(<div key={`b${m}`} className="cf-row" style={{background:m%2===0?"transparent":"rgba(255,255,255,.015)"}}>
                      <div style={{color:"var(--text-d)"}}>R{m+1}</div>
                      <div style={{color:"var(--red)",fontFamily:"var(--font-mono)"}}>{fmt(draw,currencySymbol)}</div>
                      <div style={{color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{fmt(loanBal,currencySymbol)}</div>
                      <div style={{color:"var(--amber)",fontFamily:"var(--font-mono)"}}>{fmt(interest,currencySymbol)}</div>
                      <div style={{color:"var(--text-d)"}}>—</div>
                      <div style={{color:"var(--red)",fontFamily:"var(--font-mono)"}}>{fmt(r.uCfs?.[m]||0,currencySymbol)}</div>
                      <div style={{color:"var(--text-m)",fontFamily:"var(--font-mono)"}}>{fmt(cumCf,currencySymbol)}</div>
                      <div style={{color:"var(--amber)",fontSize:10}}>{cumPct}% done</div>
                    </div>);
                  })}
                  {Array.from({length:Math.min(r.stabMonths||18,18)},(_,m)=>{
                    const idx=(r.buildMonths||24)+m;
                    const ebitda=r.uCfs?.[idx]||0;
                    const cumCf=(r.uCfs||[]).slice(0,idx+1).reduce((a:number,b:number)=>a+b,0);
                    const rampPct=Math.round((0.4+0.6*((m+1)/(r.stabMonths||18)))*100);
                    return(<div key={`s${m}`} className="cf-row" style={{background:"rgba(61,220,132,.03)"}}>
                      <div style={{color:"var(--green)",fontSize:10}}>S{m+1}</div>
                      <div style={{color:"var(--text-d)"}}>—</div>
                      <div style={{color:"var(--text-d)"}}>—</div>
                      <div style={{color:"var(--amber)",fontFamily:"var(--font-mono)",fontSize:10}}>{fmt((r.peakLoanBalance||0)*(r.financeRate||0)/12,currencySymbol)}</div>
                      <div style={{color:"var(--green)",fontFamily:"var(--font-mono)"}}>{fmt(ebitda,currencySymbol)}</div>
                      <div style={{color:ebitda>=0?"var(--green)":"var(--red)",fontFamily:"var(--font-mono)"}}>{fmt(ebitda,currencySymbol)}</div>
                      <div style={{color:cumCf>=0?"var(--green)":"var(--text-m)",fontFamily:"var(--font-mono)"}}>{fmt(cumCf,currencySymbol)}</div>
                      <div style={{color:"var(--green)",fontSize:10}}>{rampPct}% occ</div>
                    </div>);
                  })}
                </div>
                <div style={{marginTop:12,display:"flex",gap:16,flexWrap:"wrap"}}>
                  {[["var(--red)","Renovation/CapEx"],["var(--amber)","Interest (Rolled)"],["var(--green)","EBITDA (Stabilisation)"]].map(([c,l])=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--text-d)"}}><div style={{width:10,height:10,borderRadius:2,background:c}}/>{l}</div>
                  ))}
                </div>
              </div>
            )}
            {/* CASHFLOW BTR */}
            {activeTab==="cashflow"&&assetType==="BTR"&&(
              <div>
                <div className="section-title">Monthly Cash Flow</div>
                <div style={{fontSize:12,color:"var(--text-d)",marginBottom:16}}>
                  {data.costProfile==="scurve"?"S-Curve":data.costProfile==="frontloaded"?"Front-Loaded":"Straight-Line"} · {r.buildMonths}m build · {r.stabMonths}m stabilisation
                  <span style={{marginLeft:12,color:"var(--gold)",fontFamily:"var(--font-mono)",fontSize:11}}>Interest rolls monthly on drawn balance</span>
                </div>
                <div style={{overflowX:"auto"}}>
                  <div className="cf-row" style={{marginBottom:8}}>
                    {["Month","Draw","Loan Bal","Interest","NOI","Net CF","Cum CF","% Done"].map(h=><div key={h} className="cf-header">{h}</div>)}
                  </div>
                  {(r.monthlyDrawArr||[]).slice(0,Math.min((r.buildMonths||36),36)).map((draw:number,m:number)=>{
                    const interest=r.monthlyInterestArr?.[m]||0;
                    const loanBal=r.monthlyDrawArr?.slice(0,m+1).reduce((a:number,b:number)=>a+b,0)||0;
                    const cumCf=(r.uCfs||[]).slice(0,m+1).reduce((a:number,b:number)=>a+b,0);
                    const cumPct=(r.buildProfile||[]).slice(0,m+1).reduce((a:number,b:number)=>a+b,0);
                    return(<div key={`b${m}`} className="cf-row" style={{background:m%2===0?"transparent":"rgba(255,255,255,.015)"}}>
                      <div style={{color:"var(--text-d)"}}>B{m+1}</div>
                      <div style={{color:"var(--red)",fontFamily:"var(--font-mono)"}}>{fmt(draw,currencySymbol)}</div>
                      <div style={{color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{fmt(loanBal*(r.ltcPct||0.65),currencySymbol)}</div>
                      <div style={{color:"var(--amber)",fontFamily:"var(--font-mono)"}}>{fmt(interest,currencySymbol)}</div>
                      <div style={{color:"var(--text-d)"}}>—</div>
                      <div style={{color:"var(--red)",fontFamily:"var(--font-mono)"}}>{fmt(r.uCfs?.[m]||0,currencySymbol)}</div>
                      <div style={{color:"var(--text-m)",fontFamily:"var(--font-mono)"}}>{fmt(cumCf,currencySymbol)}</div>
                      <div style={{color:"var(--green)"}}>{((cumPct)*100).toFixed(0)}%</div>
                    </div>);
                  })}
                  {Array.from({length:Math.min(r.stabMonths||12,12)},(_,m)=>{
                    const idx=(r.buildMonths||36)+m;
                    const noi=r.uCfs?.[idx]||0;
                    const cumCf=(r.uCfs||[]).slice(0,idx+1).reduce((a:number,b:number)=>a+b,0);
                    const occPct=Math.round((0.5+(0.5-((r.voidPct||2)/100))*((m+1)/(r.stabMonths||12)))*100);
                    return(<div key={`s${m}`} className="cf-row" style={{background:"rgba(61,220,132,.03)"}}>
                      <div style={{color:"var(--green)",fontSize:10}}>S{m+1}</div>
                      <div style={{color:"var(--text-d)"}}>—</div><div style={{color:"var(--text-d)"}}>—</div>
                      <div style={{color:"var(--amber)",fontFamily:"var(--font-mono)",fontSize:10}}>{fmt((r.peakLoanBalance||0)*(r.financeRate||0)/12,currencySymbol)}</div>
                      <div style={{color:"var(--green)",fontFamily:"var(--font-mono)"}}>{fmt(noi,currencySymbol)}</div>
                      <div style={{color:noi>=0?"var(--green)":"var(--red)",fontFamily:"var(--font-mono)"}}>{fmt(noi,currencySymbol)}</div>
                      <div style={{color:cumCf>=0?"var(--green)":"var(--text-m)",fontFamily:"var(--font-mono)"}}>{fmt(cumCf,currencySymbol)}</div>
                      <div style={{color:"var(--green)"}}>{occPct}% occ</div>
                    </div>);
                  })}
                  <div className="cf-row" style={{background:"rgba(201,168,76,.05)",borderTop:"1px solid var(--gold)44"}}>
                    <div style={{color:"var(--gold)",fontFamily:"var(--font-mono)",fontSize:11,fontWeight:600}}>EXIT</div>
                    <div/><div/><div/>
                    <div style={{color:"var(--green)",fontFamily:"var(--font-mono)",fontWeight:600,gridColumn:"span 2"}}>{fmt(r.gdv||0,currencySymbol)}</div>
                    <div/><div style={{color:"var(--green)"}}>100%</div>
                  </div>
                </div>
                {r.paybackMonth&&(<div style={{marginTop:16,padding:"10px 14px",background:"rgba(61,220,132,.06)",border:"1px solid rgba(61,220,132,.2)",borderRadius:8,fontSize:12,color:"var(--green)"}}>✓ Cumulative cash flow turns positive at <strong>Month {r.paybackMonth}</strong></div>)}
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
                        <div style={{display:"grid",gridTemplateColumns:`120px repeat(${(data.holdYears||5)+1},1fr)`,gap:4,minWidth:500,fontSize:10}}>
                          {["",`Day 1`,...Array.from({length:data.holdYears||5},(_,i)=>`Yr ${i+1} ${i===(data.holdYears||5)-1?"(Exit)":""}`)].map((h,i)=>(
                            <div key={i} style={{color:i===0?"transparent":i===(data.holdYears||5)+1?"var(--gold)":"var(--text-d)",textTransform:"uppercase",letterSpacing:".06em",padding:"4px 6px",textAlign:i>0?"center":"left"}}>{h}</div>
                          ))}
                          {[
                            {label:"Revenue",values:[null,...hotelAdv.yearRevenue.map((y:any)=>y.totalRev)],color:"var(--text-m)"},
                            {label:"EBITDA",values:[null,...hotelAdv.yearRevenue.map((y:any)=>y.ebitda)],color:"var(--text)"},
                            {label:"FF&E",values:[null,...hotelAdv.yearRevenue.map((y:any)=>-y.ffe)],color:"var(--amber)"},
                            {label:"NOI",values:[null,...hotelAdv.yearRevenue.map((y:any)=>y.noi)],color:"var(--green)",bold:true},
                            {label:"Equity Out",values:[-(r.equity||0),...Array(data.holdYears||5).fill(null)],color:"var(--red)"},
                            {label:"Disposal",values:[null,...Array((data.holdYears||5)-1).fill(null),hotelAdv.netExitProceeds],color:"var(--gold)",bold:true},
                          ].map((row,ri)=>(
                            <>
                              <div key={`l${ri}`} style={{fontSize:10,color:row.color,fontWeight:row.bold?600:400,display:"flex",alignItems:"center",padding:"4px 0"}}>{row.label}</div>
                              {row.values.map((v:any,ci:number)=>(
                                <div key={ci} style={{padding:"4px 6px",background:ci%2===0?"var(--bg3)":"transparent",borderRadius:4,fontFamily:"var(--font-mono)",fontSize:10,color:v===null?"var(--text-d)":v<0?"var(--red)":row.color,textAlign:"center"}}>
                                  {v===null?"—":fmt(Math.abs(v),currencySymbol)}
                                </div>
                              ))}
                            </>
                          ))}
                        </div>
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
                    ["GDV (Exit)",fmt(r.gdv,currencySymbol),"var(--gold)"],["Gross NOI pa",fmt(r.noi,currencySymbol),"var(--text)"],["Total Cost",fmt(r.totalCost,currencySymbol),"var(--text-m)"],["Equity In",fmt(r.equity||0,currencySymbol),"var(--gold)"],["Total Build Cost",fmt(r.buildCost,currencySymbol),"var(--text-m)"],["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),"var(--amber)"],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),"var(--amber)"],["Total Finance Cost",fmt(r.totalFinanceCost,currencySymbol),"var(--amber)"],["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],["Profit on Cost",fmtPct(r.poc),r.poc>0.2?"var(--green)":r.poc>0.1?"var(--amber)":"var(--red)"],["Yield on Cost",fmtPct(r.yoc),"var(--blue)"],["IRR (Unlevered)",fmtPct(r.irr),irrCol(r.irr||0)],["IRR (Levered)",fmtPct(r.irrLevered),irrCol(r.irrLevered||0)],["Equity Multiple (MOIC)",fmtX(r.moic),r.moic>2?"var(--green)":"var(--text)"],["DSCR / ICR",isFinite(r.dscr)?fmtX(r.dscr):"—",r.dscr>=1.5?"var(--green)":r.dscr>=1.25?"var(--amber)":"var(--red)"],["Payback Period",r.paybackMonth?`Month ${r.paybackMonth}`:"Beyond horizon","var(--text-m)"],["Break-even Exit Yield",fmtPct(r.breakEvenYield),"var(--text-m)"],["Residual Land Value",fmt(r.rlv,currencySymbol),"var(--gold)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                  {assetType==="BTS"&&([
                    ["GDV",fmt(r.gdv,currencySymbol),"var(--gold)"],["Total Units",r.totalUnits?.toString()||"—","var(--text)"],["Total Sqft",r.totalSqft?.toLocaleString()||"—","var(--text-m)"],["Total Cost",fmt(r.totalCost,currencySymbol),"var(--text-m)"],["Equity In",fmt(r.equity||0,currencySymbol),"var(--gold)"],["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),"var(--amber)"],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),"var(--amber)"],["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],["Profit on Cost",fmtPct(r.poc),r.poc>0.2?"var(--green)":r.poc>0.1?"var(--amber)":"var(--red)"],["Profit on GDV",fmtPct(r.margin),r.margin>0.15?"var(--green)":"var(--amber)"],["IRR (Unlevered)",fmtPct(r.irr),irrCol(r.irr||0)],["IRR (Levered)",fmtPct(r.irrLevered),irrCol(r.irrLevered||0)],["Equity Multiple (MOIC)",fmtX(r.moic),r.moic>2?"var(--green)":"var(--text)"],["Payback Period",r.paybackMonth?`Month ${r.paybackMonth}`:"Beyond horizon","var(--text-m)"],["Break-even Sale psf",r.breakEvenPsf?`${currencySymbol}${Math.round(r.breakEvenPsf)}psf`:"—","var(--text-m)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                  {assetType==="Hotel"&&([
                    ["RevPAR",fmt(r.revpar,currencySymbol),"var(--gold)"],["Total Revenue pa",fmt(r.revenuePa,currencySymbol),"var(--text)"],["EBITDA pa",fmt(r.ebitda,currencySymbol),"var(--green)"],["GOP Margin",hotelMode==="advanced"&&r.revenuePa>0?fmtPct(r.ebitda/r.revenuePa):hotelRev&&hotelRev.totalRev>0?fmtPct(hotelRev.totalEbitda/hotelRev.totalRev):"—","var(--green)"],["EBITDA per Room",hotelMode==="advanced"&&num(String(data.rooms))>0?fmt(r.ebitda/num(String(data.rooms)),currencySymbol):hotelRev&&num(String(data.rooms))>0?fmt(hotelRev.totalEbitda/num(String(data.rooms)),currencySymbol):"—","var(--text-m)"],["Stabilised Value",fmt(r.stabilisedValue,currencySymbol),"var(--text-m)"],["Exit Value",fmt(r.exitValue,currencySymbol),"var(--gold)"],["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),"var(--amber)"],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),"var(--amber)"],["Total Investment",fmt(r.totalInvestment,currencySymbol),"var(--text-m)"],["Equity In",fmt(r.equity||0,currencySymbol),"var(--gold)"],["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],["Return on Cost",fmtPct(r.poc),r.poc>0.15?"var(--green)":"var(--amber)"],["Yield on Cost",fmtPct(r.yoc),"var(--blue)"],["IRR (Unlevered)",fmtPct(r.irr),irrCol(r.irr||0)],["IRR (Levered)",fmtPct(r.irrLevered),irrCol(r.irrLevered||0)],["Equity Multiple (MOIC)",fmtX(r.moic),r.moic>2?"var(--green)":"var(--text)"],["DSCR / ICR",isFinite(r.dscr)?fmtX(r.dscr):"—",r.dscr>=1.5?"var(--green)":r.dscr>=1.25?"var(--amber)":"var(--red)"],["Payback Period",r.paybackMonth?`Month ${r.paybackMonth}`:"Beyond horizon","var(--text-m)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                  {assetType==="Flip"&&([
                    ["Purchase Price",fmt(r.purchase,currencySymbol),"var(--text)"],["Property Tax",fmt(r.sdlt,currencySymbol),"var(--amber)"],["Refurb Budget",fmt(r.refurb,currencySymbol),"var(--text-m)"],[`Refurb psf`,r.propertySqft>0?`${currencySymbol}${Math.round(r.refurb/r.propertySqft)}/sqft`:"—","var(--text-d)"],["Finance Cost",fmt(r.totalFinanceCost,currencySymbol),"var(--amber)"],["Total Cost",fmt(r.totalCost,currencySymbol),"var(--text-m)"],["Equity In",fmt(r.equity||0,currencySymbol),"var(--gold)"],["Net Sale Proceeds",fmt(r.netProceeds,currencySymbol),"var(--gold)"],["Gross Yield",r.flipMode==="hold"?fmtPct(r.grossYield||0):"—","var(--blue)"],["Net Yield",r.flipMode==="hold"?fmtPct(r.netYield||0):"—","var(--blue)"],["Monthly Cashflow",r.flipMode==="hold"?`${currencySymbol}${Math.round(r.netCashflowPm||0)}/mo`:"—",(r.netCashflowPm||0)>0?"var(--green)":"var(--text-d)"],["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],["ROI on Total Cost",fmtPct(r.roi),r.roi>0.15?"var(--green)":"var(--amber)"],["ROI on Equity",fmtPct(r.roiEquity),r.roiEquity>0.25?"var(--green)":"var(--amber)"],["Equity Multiple (MOIC)",fmtX(r.moic),r.moic>1.5?"var(--green)":"var(--text)"],["IRR (Annualised)",fmtPct(r.irr),"var(--blue)"],["Payback Period",r.paybackMonth?`Month ${r.paybackMonth}`:"—","var(--text-m)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                </div>
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
                            return(<>
                              <div key={`y${yi}`} style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6,color:"var(--text-d)"}}>{capVal.toFixed(2)}%</div>
                              {row.map((poc:number,ri:number)=>(
                                <div key={ri} className={`sens-cell ${poc>0.15?"cell-g":poc>0.08?"cell-a":"cell-r"} ${yi===2&&ri===2?"cell-base":""}`}>{(poc*100).toFixed(1)}%</div>
                              ))}
                            </>);
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

                                {assetType==="BTR"&&sensMatrix&&(
                  <div style={{marginBottom:28}}>
                    <div className="section-title">Sensitivity — Profit on Cost %</div>
                    <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12}}>Exit yield (rows) × rent shift (columns)</div>
                    <div className="sens-wrap">
                      <div style={{display:"grid",gridTemplateColumns:"80px repeat(5,1fr)",gap:4,fontSize:10,minWidth:400}}>
                        <div/>
                        {["-10%","-5%","Base","+5%","+10%"].map(h=><div key={h} style={{textAlign:"center",color:"var(--text-d)",padding:"4px",textTransform:"uppercase",letterSpacing:".06em"}}>{h}</div>)}
                        {sensMatrix.map((row:number[],yi:number)=>{
                          const yieldVal=num(String(data.exitYield))+[-0.5,-0.25,0,0.25,0.5][yi];
                          return(<>
                            <div key={`y${yi}`} style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6,color:"var(--text-d)"}}>{yieldVal.toFixed(2)}%</div>
                            {row.map((poc:number,ri:number)=>(
                              <div key={ri} className={`sens-cell ${poc>0.20?"cell-g":poc>0.10?"cell-a":"cell-r"} ${yi===2&&ri===2?"cell-base":""}`}>{(poc*100).toFixed(1)}%</div>
                            ))}
                          </>);
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
          <div style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:300,color:"var(--text)",marginBottom:4}}>{data.name||"New Appraisal"}</div>
          <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12}}>{data.location||"No location"} · {assetType} · {data.currency}</div>
          {/* ── EQUITY IN — always visible ── */}
          <div style={{background:"var(--bg2)",border:"1px solid rgba(201,168,76,.35)",borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:9,color:"var(--gold)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:3}}>Equity In</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:26,fontWeight:300,color:"var(--gold)"}}>{fmt(r.equity||0,currencySymbol)}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:3}}>of Total Cost</div>
              <div style={{fontFamily:"var(--font-mono)",fontSize:13,color:"var(--text-m)"}}>{r.totalCost||r.totalInvestment?fmtPct((r.equity||0)/(r.totalCost||r.totalInvestment||1)):"—"}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
            {assetType==="BTR"&&[{label:"GDV",value:fmt(r.gdv,currencySymbol),color:"var(--gold)"},{label:"Profit on Cost",value:fmtPct(r.poc),color:r.poc>0.2?"var(--green)":r.poc>0.1?"var(--amber)":"var(--red)"},{label:"IRR (Unlevered)",value:fmtPct(r.irr),color:"var(--blue)"},{label:"IRR (Levered)",value:fmtPct(r.irrLevered),color:"var(--blue)"}].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}><div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div><div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,color:m.color}}>{m.value}</div></div>))}
            {assetType==="BTS"&&[{label:"GDV",value:fmt(r.gdv,currencySymbol),color:"var(--gold)"},{label:"Profit on Cost",value:fmtPct(r.poc),color:r.poc>0.2?"var(--green)":"var(--amber)"},{label:"IRR",value:fmtPct(r.irr),color:"var(--blue)"},{label:"Profit on GDV",value:fmtPct(r.margin),color:"var(--text)"}].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}><div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div><div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,color:m.color}}>{m.value}</div></div>))}
            {assetType==="Hotel"&&[{label:"Exit Value",value:fmt(r.exitValue,currencySymbol),color:"var(--gold)"},{label:"EBITDA pa",value:fmt(r.ebitda,currencySymbol),color:"var(--green)"},{label:"IRR",value:fmtPct(r.irr),color:"var(--blue)"},{label:"Return on Cost",value:fmtPct(r.poc),color:r.poc>0.15?"var(--green)":"var(--amber)"}].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}><div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div><div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,color:m.color}}>{m.value}</div></div>))}
            {assetType==="Flip"&&[{label:r.flipMode==="hold"?"GDV / Value":"Sale Price",value:fmt(r.salePrice,currencySymbol),color:"var(--gold)"},{label:"Profit",value:fmt(r.profit,currencySymbol),color:r.profit>0?"var(--green)":"var(--red)"},{label:r.flipMode==="hold"?"Net Yield":"ROI on Cost",value:r.flipMode==="hold"?fmtPct(r.netYield||0):fmtPct(r.roi),color:r.roi>0.15?"var(--green)":"var(--amber)"},{label:"IRR",value:fmtPct(r.irr),color:"var(--blue)"}].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}><div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div><div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,color:m.color}}>{m.value}</div></div>))}
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
            {assetType==="BTR"&&([{label:"Land + Property Tax",value:(r.landCost||0)+(r.sdlt||0),color:"var(--text-m)"},{label:"Build Cost",value:r.buildCost,color:"var(--text-m)"},{label:"Dev Costs (total)",value:r.devCost,color:"var(--text-m)"},{label:"Arrangement Fee",value:r.arrangementFee,color:"var(--amber)"},{label:"Interest (Rolled)",value:r.interestCost,color:"var(--amber)"},{label:"Total Finance Cost",value:r.totalFinanceCost,color:"var(--amber)"},{label:"Total Cost",value:r.totalCost,color:"var(--gold)",bold:true}] as any[]).map((item:any)=>(<div key={item.label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}><span style={{color:"var(--text-m)"}}>{item.label}</span><span style={{fontFamily:"var(--font-mono)",color:item.color,fontWeight:item.bold?600:400}}>{fmt(item.value||0,currencySymbol)}</span></div>))}
            {assetType==="BTS"&&([{label:"Land + Property Tax",value:(r.landCost||0)+(r.sdlt||0),color:"var(--text-m)"},{label:"Build Cost",value:r.buildCost,color:"var(--text-m)"},{label:"Arrangement Fee",value:r.arrangementFee,color:"var(--amber)"},{label:"Interest (Rolled)",value:r.interestCost,color:"var(--amber)"},{label:"Total Finance Cost",value:r.totalFinanceCost,color:"var(--amber)"},{label:"Total Cost",value:r.totalCost,color:"var(--gold)",bold:true}] as any[]).map((item:any)=>(<div key={item.label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}><span style={{color:"var(--text-m)"}}>{item.label}</span><span style={{fontFamily:"var(--font-mono)",color:item.color,fontWeight:item.bold?600:400}}>{fmt(item.value||0,currencySymbol)}</span></div>))}
            {assetType==="Hotel"&&([{label:"Purchase + Property Tax",value:(r.purchasePrice||0)+(r.sdlt||0),color:"var(--text-m)"},{label:"CapEx",value:r.capex,color:"var(--text-m)"},{label:"Arrangement Fee",value:r.arrangementFee,color:"var(--amber)"},{label:"Interest (Rolled)",value:r.interestCost,color:"var(--amber)"},{label:"Total Investment",value:r.totalInvestment,color:"var(--gold)",bold:true}] as any[]).map((item:any)=>(<div key={item.label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}><span style={{color:"var(--text-m)"}}>{item.label}</span><span style={{fontFamily:"var(--font-mono)",color:item.color,fontWeight:item.bold?600:400}}>{fmt(item.value||0,currencySymbol)}</span></div>))}
            {assetType==="Flip"&&([{label:"Purchase + Property Tax",value:(r.purchase||0)+(r.sdlt||0),color:"var(--text-m)"},{label:"Refurb + Fees",value:(r.refurb||0)+(r.profFees||0)+(r.contingency||0),color:"var(--text-m)"},{label:"Finance Cost",value:r.totalFinanceCost,color:"var(--amber)"},{label:"Total",value:r.totalCost,color:"var(--gold)",bold:true}] as any[]).map((item:any)=>(<div key={item.label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}><span style={{color:"var(--text-m)"}}>{item.label}</span><span style={{fontFamily:"var(--font-mono)",color:item.color,fontWeight:item.bold?600:400}}>{fmt(item.value||0,currencySymbol)}</span></div>))}
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
                <button onClick={()=>{if(!isPro&&!isTrialing){router.push("/pricing");return;}runAISenseCheck();}} disabled={senseRunning} style={{background:senseRunning?"var(--bg3)":(!isPro&&!isTrialing)?"var(--bg3)":"var(--gold)",border:(!isPro&&!isTrialing)?"1px solid var(--border)":"none",borderRadius:5,color:senseRunning||(!isPro&&!isTrialing)?"var(--text-d)":"#06070a",fontSize:10,padding:"4px 8px",cursor:senseRunning?"not-allowed":"pointer",fontFamily:"var(--font-body)",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
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
              <div style={{fontFamily:"var(--font-display)",fontSize:26,fontWeight:300}}>Share Appraisal</div>
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
            <div style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:300,marginBottom:8,color:"var(--red)"}}>Delete Appraisal</div>
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
              <div style={{fontFamily:"var(--font-display)",fontSize:26,fontWeight:300}}>✨ AI Brochure</div>
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
            {!brochureContent&&(<button className="btn-primary" onClick={generateBrochure} disabled={generatingBrochure} style={{width:"100%",justifyContent:"center",marginBottom:16,padding:"13px"}}>{generatingBrochure?<><span style={{width:14,height:14,border:"2px solid #06070a44",borderTopColor:"#06070a",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/> Analysing deal data…</>:"Generate AI Analysis →"}</button>)}
            {brochureError&&<div style={{background:"rgba(244,100,95,.1)",border:"1px solid rgba(244,100,95,.3)",borderRadius:8,padding:12,fontSize:12,color:"var(--red)",marginBottom:16}}>{brochureError}</div>}
            {generatingBrochure&&(<div>{["Executive Summary","Deal Strengths","Risk Assessment","Market Comparables"].map(s=>(<div key={s} style={{marginBottom:12}}><div style={{fontSize:10,color:"var(--gold)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>{s}</div><div className="ai-generating"/></div>))}</div>)}
            {brochureContent&&!generatingBrochure&&(
              <div>
                {(["executiveSummary","dealStrengths","riskAssessment","marketComparables"] as (keyof BrochureContent)[]).map(key=>{
                  const labels={executiveSummary:"Executive Summary",dealStrengths:"Deal Strengths",riskAssessment:"Risk Assessment",marketComparables:"Market Comparables"};
                  return(<div key={key} className="ai-section"><span className="ai-section-label">{labels[key]}</span><textarea className="ai-textarea" value={brochureContent[key]} onChange={e=>setBrochureContent(prev=>prev?{...prev,[key]:e.target.value}:prev)}/></div>);
                })}
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <button className="btn-ghost" onClick={()=>setBrochureContent(null)} style={{flex:1,justifyContent:"center"}}>↺ Regenerate</button>
                  <button className="btn-primary" onClick={handleDownloadBrochure} disabled={downloadingBrochure} style={{flex:2,justifyContent:"center",padding:"12px"}}>{downloadingBrochure?<><span style={{width:14,height:14,border:"2px solid #06070a44",borderTopColor:"#06070a",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/> Generating PDF…</>:"⬇ Download Brochure PDF"}</button>
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
      <div style={{minHeight:"100vh",background:"#06070a",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:32,height:32,border:"2px solid rgba(201,168,76,.2)",borderTopColor:"#c9a84c",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <AppraisalPage/>
    </Suspense>
  );
}
