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

  // Total investment
  const annualOpex=(supportingCosts+operatorFees)*holdYears;
  const totalCost=purchasePrice+sdlt+legalCosts+financingDD+wiInsurance+capex+arrangementFee+exitFee+brokerageFee+interestTotal+imAcqFee+imBasePATotal+annualOpex+workingCapital;
  const equity=totalCost-loanAmount;
  const profit=netExitProceeds+totalNOI-totalCost;
  const poc=totalCost>0?profit/totalCost:0;
  const moic=equity>0?(equity+profit)/equity:0;

  // IRR — simple approximation
  const cfs=[-equity,...yearRevenue.map(y=>y.noi-supportingCosts-operatorFees),netExitProceeds-loanAmount+yearRevenue[holdYears-1].noi-supportingCosts-operatorFees];
  const irr=calcIRR(cfs);

  // IM incentive fees (on profit)
  const imIncentiveProfit=imEnabled?(num(String(data.imIncentiveProfitPct??10))/100)*Math.max(profit,0):0;
  const imIncentiveSales=imEnabled?(num(String(data.imIncentiveSalesPct??1))/100)*exitValue:0;

  const dscr=interestTotal>0&&holdYears>0?stabilisedNOI/(interestTotal/holdYears):999;

  return{
    yearRevenue,stabilisedNOI,stabilisedEBITDA,totalNOI,
    purchasePrice,pricePerKey,capexPerKey,exitValue,exitValuePerKey,disposalCosts,netExitProceeds,
    entryYieldNOI,entryYieldEBITDA,
    sdlt,legalCosts,financingDD,wiInsurance,
    loanAmount,interestTotal,arrangementFee,exitFee,brokerageFee,
    imAcqFee,imBasePATotal,imIncentiveProfit,imIncentiveSales,
    totalCost,equity,profit,poc,moic,irr,dscr,
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
    const refurb=num(String(data.refurbBudget));
    const profFees=refurb*(num(String(data.professionalFeesPct))/100);
    const contingency=refurb*(num(String(data.contingencyPct))/100);
    const other=num(String(data.otherCosts));
    const bridgingRatePm=num(String(data.bridgingRatePct))/100;
    const bridgingMonths=num(String(data.bridgingTermMonths));
    const loanAmount=(purchase+refurb)*0.75;
    const bridgingInterest=loanAmount*bridgingRatePm*bridgingMonths;
    const arrangementFee=loanAmount*(num(String(data.arrangementFeePct))/100);
    const totalFinanceCost=bridgingInterest+arrangementFee;
    const totalCost=purchase+sdlt+refurb+profFees+contingency+other+totalFinanceCost;
    const salePrice=num(String(data.salePrice));
    const agentFees=salePrice*(num(String(data.agentFeePct))/100);
    const netProceeds=salePrice-agentFees;
    const profit=netProceeds-totalCost;
    const roi=totalCost>0?profit/totalCost:0;
    const equity=Math.max(0,totalCost-loanAmount);
    const roiEquity=equity>0?profit/equity:0;
    const moic=equity>0?(equity+profit)/equity:0;
    const cfs=[-totalCost,...Array(Math.max(0,Math.round(bridgingMonths)-1)).fill(0),netProceeds];
    const irr=Math.pow(1+calcIRR(cfs),12)-1;
    const paybackMonth=calcPaybackMonth(cfs);
    return{purchase,sdlt,refurb,profFees,contingency,totalFinanceCost,loanAmount,bridgingInterest,arrangementFee,totalCost,salePrice,agentFees,netProceeds,profit,roi,roiEquity,moic,irr,equity,paybackMonth,financeRate:bridgingRatePm*12};
  }
  return{};
}
// ─── DEFAULTS ─────────────────────────────────────────────────────────────────
const DEFAULTS={
  BTR:{assetType:"BTR",name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:36,stabilisationMonths:12,units:[{type:"1 Bed OMR",count:80,rentPcm:2200,size:550},{type:"2 Bed OMR",count:60,rentPcm:2900,size:750},{type:"3 Bed OMR",count:30,rentPcm:3600,size:1000},{type:"1 Bed DMR",count:40,rentPcm:1650,size:550},{type:"2 Bed DMR",count:22,rentPcm:2175,size:750}],exitYield:4.15,niy:4.0,voidPct:1.5,opexPsf:8,landCost:15000000,buildCostPsf:285,siteAreaSqft:195000,professionalFeesPct:8,contingencyPct:5,otherCosts:500000,ltc:65,marginOverBenchmark:2.5,arrangementFeePct:1.0,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:12,tier2DevShare:30,tier3Hurdle:18,tier3DevShare:40,costProfile:"scurve",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:true},
  BTS:{assetType:"BTS",name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:30,stabilisationMonths:6,units:[{type:"1 Bed",count:40,salePricePsf:900,size:550},{type:"2 Bed",count:60,salePricePsf:850,size:800},{type:"3 Bed",count:20,salePricePsf:800,size:1100},{type:"Penthouse",count:5,salePricePsf:1400,size:1800}],agentFeePct:1.5,marketingPct:1.0,absorptionMonths:18,landCost:8000000,buildCostPsf:260,siteAreaSqft:110000,professionalFeesPct:8,contingencyPct:5,otherCosts:300000,ltc:60,marginOverBenchmark:2.5,arrangementFeePct:1.0,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:15,tier2DevShare:30,tier3Hurdle:20,tier3DevShare:40,costProfile:"scurve",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:true},
  Hotel:{assetType:"Hotel",name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:24,stabilisationMonths:18,rooms:120,adr:180,occupancy:72,starRating:4,revparGrowthPct:2.5,roomsMarginPct:75,fnbEnabled:true,fnbRevenuePerOccRoom:45,fnbUtilisationPct:70,fnbMarginPct:30,spaEnabled:false,spaRevenuePerRoomPa:800,spaUtilisationPct:40,spaMarginPct:35,gymEnabled:false,gymMembershipRevPa:50000,gymGuestRevPerOccRoom:8,gymMarginPct:60,meetingEnabled:false,meetingRooms:4,meetingAvgDayRate:1200,meetingUtilisationPct:45,meetingMarginPct:40,exitCapRate:6.5,stabilisedCapRate:6.0,purchasePrice:18000000,capexBudget:5000000,professionalFeesPct:5,contingencyPct:8,otherCosts:200000,ltc:60,marginOverBenchmark:3.0,arrangementFeePct:1.5,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:14,tier2DevShare:30,tier3Hurdle:20,tier3DevShare:40,costProfile:"straight",sdltMode:"auto" as const,sdltTransactionType:"commercial" as const,sdltOverride:0,sdltSurcharge:false},
  Flip:{assetType:"Flip",name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:9,stabilisationMonths:0,purchasePrice:450000,refurbBudget:85000,salePrice:620000,agentFeePct:1.5,bridgingRatePct:0.85,bridgingTermMonths:9,arrangementFeePct:2.0,professionalFeesPct:2,contingencyPct:10,otherCosts:5000,costProfile:"straight",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:false},
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
  doc.setTextColor(...gold);doc.setFontSize(18);doc.setFont("helvetica","bold");doc.text("VALORA",14,15);
  doc.setTextColor(...grey);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text("DEVELOPMENT APPRAISAL",14,21);
  doc.setTextColor(...grey);doc.setFontSize(7);doc.text(new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}),W-8,12,{align:"right"});doc.text(userEmail||"",W-8,18,{align:"right"});
  doc.setFillColor(201,168,76,30);doc.roundedRect(W-52,26,44,10,2,2,"F");
  doc.setTextColor(...gold);doc.setFontSize(7);doc.setFont("helvetica","bold");doc.text("STRICTLY CONFIDENTIAL",W-30,32.5,{align:"center"});
  doc.setTextColor(...white);doc.setFontSize(22);doc.setFont("helvetica","bold");doc.text(data.name||"Untitled Appraisal",14,58);
  doc.setFontSize(10);doc.setFont("helvetica","normal");doc.setTextColor(...grey);doc.text(`${data.location||"No location"}  ·  ${assetType}  ·  ${data.currency||"GBP"}`,14,66);
  const metrics=assetType==="BTR"
    ?[["GDV (Exit)",fmt(r.gdv,currencySymbol),gold],["Profit on Cost",fmtPct(r.poc),r.poc>0.2?green:r.poc>0.1?amber:red],["IRR (Unlevered)",fmtPct(r.irr),white],["Equity Multiple",fmtX(r.moic),white]]
    :assetType==="BTS"
    ?[["GDV",fmt(r.gdv,currencySymbol),gold],["Profit on Cost",fmtPct(r.poc),r.poc>0.2?green:r.poc>0.1?amber:red],["IRR (Unlevered)",fmtPct(r.irr),white],["Equity Multiple",fmtX(r.moic),white]]
    :assetType==="Hotel"
    ?[["Exit Value",fmt(r.exitValue,currencySymbol),gold],["Return on Cost",fmtPct(r.poc),r.poc>0.15?green:amber],["IRR (Unlevered)",fmtPct(r.irr),white],["DSCR",fmtX(r.dscr),white]]
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
    lY=drawCol("Returns",[["GDV (Exit)",fmt(r.gdv,currencySymbol),gold],["Gross NOI pa",fmt(r.noi,currencySymbol),white],["Total Cost",fmt(r.totalCost,currencySymbol),grey],["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],["Profit on Cost",fmtPct(r.poc),r.poc>0.2?green:r.poc>0.1?amber:red],["Yield on Cost",fmtPct(r.yoc),white],["IRR (Unlevered)",fmtPct(r.irr),white],["IRR (Levered)",fmtPct(r.irrLevered),white],["Equity Multiple",fmtX(r.moic),gold],["DSCR / ICR",fmtX(r.dscr),r.dscr>=1.25?green:red],["Payback",r.paybackMonth?`Month ${r.paybackMonth}`:"—",white],["Break-even Yield",fmtPct(r.breakEvenYield),white],["Residual Land Value",fmt(r.rlv,currencySymbol),gold]],colL,lY,colW)||lY;
    rY=drawCol("Cost Breakdown",[["Land / Acquisition",fmt(r.landCost,currencySymbol),grey],["Property Tax",fmt(r.sdlt,currencySymbol),grey],["Build Cost",fmt(r.buildCost,currencySymbol),grey],["Prof. Fees + Contingency",fmt(r.devCost-r.buildCost,currencySymbol),grey],["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),amber],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),amber],["Peak Loan Balance",fmt(r.peakLoanBalance,currencySymbol),grey],["Total Cost",fmt(r.totalCost,currencySymbol),gold]],colR,rY,colW)||rY;
    rY=drawCol("Project Details",[["Asset Type",assetType,white],["Location",data.location||"—",white],["Currency",data.currency||"GBP",white],["Programme",programmLabel,white],["Finance",`${data.ltc}% LTC · ${((num(String(data.benchmarkRate))+num(String(data.marginOverBenchmark))).toFixed(2))}% all-in`,white]],colR,rY,colW)||rY;
  }else if(assetType==="BTS"){
    lY=drawCol("Returns",[["GDV",fmt(r.gdv,currencySymbol),gold],["Total Units",r.totalUnits?.toString()||"—",white],["Total Cost",fmt(r.totalCost,currencySymbol),grey],["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],["Profit on Cost",fmtPct(r.poc),r.poc>0.2?green:r.poc>0.1?amber:red],["Profit on GDV",fmtPct(r.margin),white],["IRR (Unlevered)",fmtPct(r.irr),white],["IRR (Levered)",fmtPct(r.irrLevered),white],["Equity Multiple",fmtX(r.moic),gold],["Payback",r.paybackMonth?`Month ${r.paybackMonth}`:"—",white],["Break-even psf",r.breakEvenPsf?`${currencySymbol}${Math.round(r.breakEvenPsf)}psf`:"—",white]],colL,lY,colW)||lY;
    rY=drawCol("Cost Breakdown",[["Land / Acquisition",fmt(r.landCost,currencySymbol),grey],["Property Tax",fmt(r.sdlt,currencySymbol),grey],["Build Cost",fmt(r.buildCost,currencySymbol),grey],["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),amber],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),amber],["Total Cost",fmt(r.totalCost,currencySymbol),gold]],colR,rY,colW)||rY;
  }else if(assetType==="Hotel"){
    lY=drawCol("Returns",[["RevPAR",fmt(r.revpar,currencySymbol),gold],["EBITDA pa",fmt(r.ebitda,currencySymbol),green],["Exit Value",fmt(r.exitValue,currencySymbol),gold],["Total Investment",fmt(r.totalInvestment,currencySymbol),grey],["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],["Return on Cost",fmtPct(r.poc),r.poc>0.15?green:amber],["DSCR / ICR",fmtX(r.dscr),r.dscr>=1.25?green:red],["IRR (Unlevered)",fmtPct(r.irr),white],["IRR (Levered)",fmtPct(r.irrLevered),white],["Equity Multiple",fmtX(r.moic),gold],["Payback",r.paybackMonth?`Month ${r.paybackMonth}`:"—",white]],colL,lY,colW)||lY;
    rY=drawCol("Cost Breakdown",[["Purchase + Property Tax",fmt((r.purchasePrice||0)+(r.sdlt||0),currencySymbol),grey],["CapEx",fmt(r.capex,currencySymbol),grey],["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),amber],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),amber],["Total Investment",fmt(r.totalInvestment,currencySymbol),gold]],colR,rY,colW)||rY;
  }else{
    lY=drawCol("Returns",[["Purchase Price",fmt(r.purchase,currencySymbol),grey],["Property Tax",fmt(r.sdlt,currencySymbol),grey],["Total Cost",fmt(r.totalCost,currencySymbol),grey],["Net Sale Proceeds",fmt(r.netProceeds,currencySymbol),gold],["Profit",fmt(r.profit,currencySymbol),r.profit>0?green:red],["ROI on Total Cost",fmtPct(r.roi),r.roi>0.15?green:amber],["Equity Multiple",fmtX(r.moic),gold],["IRR (Annualised)",fmtPct(r.irr),white],["Payback",r.paybackMonth?`Month ${r.paybackMonth}`:"—",white]],colL,lY,colW)||lY;
  }
  doc.setFillColor(...gold);doc.rect(0,H-8,W,8,"F");
  doc.setFillColor(...dark);doc.rect(0,H-8,5,8,"F");
  doc.setTextColor(...dark);doc.setFontSize(7);doc.setFont("helvetica","bold");
  doc.text("VALORA  ·  Institutional Development Appraisal Platform",14,H-3);
  doc.text(`Confidential  ·  ${new Date().toLocaleDateString("en-GB")}`,W-8,H-3,{align:"right"});
  doc.save(`Valora_${(data.name||"Appraisal").replace(/\s+/g,"_")}_${new Date().toISOString().slice(0,10)}.pdf`);
}
async function generateBrochurePDF(data:any,results:any,assetType:string,currencySymbol:string,content:BrochureContent,photos:string[]){
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
  const gold=[201,168,76],dark=[6,7,10],grey=[125,133,144],white=[255,255,255],bg2=[18,21,26];
  const r=results as any;
  doc.setFillColor(...dark as [number,number,number]);doc.rect(0,0,210,297,"F");
  doc.setFillColor(...gold as [number,number,number]);doc.rect(0,0,4,297,"F");
  if(photos.length>0){
    const phH=photos.length>=2?80:60;const phW=photos.length>=2?W/photos.length:W*0.6;
    photos.slice(0,3).forEach((ph,i)=>{try{doc.addImage(ph,"JPEG",i*phW,0,phW,phH);}catch(e){}});
    doc.setFillColor(6,7,10);doc.setGState(doc.GState({opacity:0.55}));doc.rect(0,0,W,photos.length>0?80:0,"F");doc.setGState(doc.GState({opacity:1}));
  }
  doc.setTextColor(...gold as [number,number,number]);doc.setFontSize(10);doc.setFont("helvetica","bold");doc.text("VALORA",M,photos.length>0?20:16);
  doc.setFontSize(7);doc.setFont("helvetica","normal");doc.setTextColor(...grey as [number,number,number]);doc.text("INVESTMENT MEMORANDUM",M,photos.length>0?26:22);
  const titleY=photos.length>0?95:50;
  doc.setTextColor(...white as [number,number,number]);doc.setFontSize(28);doc.setFont("helvetica","bold");
  const titleLines=doc.splitTextToSize(data.name||"Investment Opportunity",W-M*2);doc.text(titleLines,M,titleY);
  doc.setFontSize(12);doc.setFont("helvetica","normal");doc.setTextColor(...gold as [number,number,number]);doc.text(`${data.location||""}  ·  ${assetType}`,M,titleY+titleLines.length*10+4);
  const metricsY=titleY+titleLines.length*10+20;
  const metrics=assetType==="BTR"?[["GDV",fmt(r.gdv,currencySymbol)],["Profit on Cost",fmtPct(r.poc)],["IRR",fmtPct(r.irr)],["Equity Multiple",fmtX(r.moic)]]:assetType==="BTS"?[["GDV",fmt(r.gdv,currencySymbol)],["Profit on Cost",fmtPct(r.poc)],["IRR",fmtPct(r.irr)],["Equity Multiple",fmtX(r.moic)]]:assetType==="Hotel"?[["Exit Value",fmt(r.exitValue,currencySymbol)],["EBITDA pa",fmt(r.ebitda,currencySymbol)],["IRR",fmtPct(r.irr)],["DSCR",fmtX(r.dscr)]]:[["Sale Price",fmt(r.salePrice,currencySymbol)],["Profit",fmt(r.profit,currencySymbol)],["ROI",fmtPct(r.roi)],["Equity Multiple",fmtX(r.moic)]];
  const mW=(W-M*2-12)/4;
  metrics.forEach(([l,v],i)=>{
    const x=M+i*(mW+4);
    doc.setFillColor(...bg2 as [number,number,number]);doc.roundedRect(x,metricsY,mW,20,2,2,"F");
    doc.setDrawColor(...gold as [number,number,number]);doc.setLineWidth(0.5);doc.roundedRect(x,metricsY,mW,20,2,2,"S");
    doc.setTextColor(...grey as [number,number,number]);doc.setFontSize(6.5);doc.setFont("helvetica","normal");doc.text(String(l).toUpperCase(),x+3,metricsY+7);
    doc.setTextColor(...gold as [number,number,number]);doc.setFontSize(11);doc.setFont("helvetica","bold");doc.text(String(v),x+3,metricsY+16);
  });
  doc.setFillColor(...gold as [number,number,number]);doc.rect(0,291,W,6,"F");
  doc.setTextColor(...dark as [number,number,number]);doc.setFontSize(7);doc.setFont("helvetica","bold");
  doc.text("STRICTLY PRIVATE & CONFIDENTIAL",M,295.5);doc.text(new Date().toLocaleDateString("en-GB",{month:"long",year:"numeric"}),W-M,295.5,{align:"right"});
  doc.addPage();doc.setFillColor(...dark as [number,number,number]);doc.rect(0,0,210,297,"F");doc.setFillColor(...gold as [number,number,number]);doc.rect(0,0,4,297,"F");
  const wrapText=(doc:any,text:string,x:number,startY:number,maxW:number,lineH:number)=>{
    const lines=doc.splitTextToSize(text,maxW);
    lines.forEach((line:string,i:number)=>{if(startY+i*lineH>278){doc.addPage();doc.setFillColor(...dark as [number,number,number]);doc.rect(0,0,210,297,"F");doc.setFillColor(...gold as [number,number,number]);doc.rect(0,0,4,297,"F");startY=20-i*lineH;}doc.text(line,x,startY+i*lineH);});
    return startY+lines.length*lineH+4;
  };
  let py=20;
  doc.setTextColor(...gold as [number,number,number]);doc.setFontSize(9);doc.setFont("helvetica","bold");doc.text("VALORA",M,py);
  doc.setTextColor(...grey as [number,number,number]);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text(data.name||"",W-M,py,{align:"right"});py+=10;
  const sections:[string,keyof BrochureContent][]=[["Executive Summary","executiveSummary"],["Deal Strengths","dealStrengths"],["Risk Assessment","riskAssessment"],["Market Comparables","marketComparables"]];
  sections.forEach(([title,key])=>{
    if(py>260){doc.addPage();doc.setFillColor(...dark as [number,number,number]);doc.rect(0,0,210,297,"F");doc.setFillColor(...gold as [number,number,number]);doc.rect(0,0,4,297,"F");py=20;}
    doc.setTextColor(...gold as [number,number,number]);doc.setFontSize(11);doc.setFont("helvetica","bold");doc.text(title,M,py);
    doc.setLineWidth(0.2);doc.setDrawColor(...gold as [number,number,number]);doc.line(M,py+2,W-M,py+2);py+=9;
    doc.setTextColor(...white as [number,number,number]);doc.setFontSize(9);doc.setFont("helvetica","normal");
    py=wrapText(doc,content[key]||"",M,py,W-M*2,5);py+=6;
  });
  doc.setFillColor(...gold as [number,number,number]);doc.rect(0,291,W,6,"F");
  doc.setTextColor(...dark as [number,number,number]);doc.setFontSize(7);doc.setFont("helvetica","bold");
  doc.text("VALORA · Institutional Development Appraisal",M,295.5);doc.text(`Confidential · ${new Date().toLocaleDateString("en-GB")}`,W-M,295.5,{align:"right"});
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
        if(appr.snapshot){const snap=appr.snapshot;const type=(snap.assetType||"BTR") as AssetType;setAssetType(type);setData(snap);setSaved(true);}
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
  const r=results as any;
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
        snapshot:{...data,assetType,moic:r.moic||0,dscr:isFinite(r.dscr)&&r.dscr!==Infinity?r.dscr:0},
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
    const dealSummary=`Asset Type: ${assetType}\nProject Name: ${data.name||"Unnamed"}\nLocation: ${data.location||"Not specified"}\nCurrency: ${data.currency||"GBP"}\nProgramme: ${data.programmMonths} months\n\nKey Financials:\n- GDV / Exit Value: ${fmt(r.gdv||r.exitValue||r.salePrice||0,currSym)}\n- Total Cost / Investment: ${fmt(r.totalCost||r.totalInvestment||0,currSym)}\n- Profit: ${fmt(r.profit||0,currSym)}\n- Profit on Cost: ${fmtPct(r.poc||r.roi||0)}\n- IRR: ${fmtPct(r.irr||0)}\n- Equity Multiple: ${fmtX(r.moic||0)}\n${assetType==="BTR"?`- Exit Yield: ${data.exitYield}%\n- Gross NOI pa: ${fmt(r.noi,currSym)}\n- DSCR: ${fmtX(r.dscr)}\n- Break-even Yield: ${fmtPct(r.breakEvenYield)}\n- Total Units: ${r.totalUnits}`:``}${assetType==="Hotel"?`- RevPAR: ${fmt(r.revpar,currSym)}\n- EBITDA pa: ${fmt(r.ebitda,currSym)}\n- DSCR: ${fmtX(r.dscr)}\n- Rooms: ${data.rooms}`:``}${assetType==="Flip"?`- Purchase Price: ${fmt(r.purchase,currSym)}\n- Sale Price: ${fmt(r.salePrice,currSym)}`:``}\n\nFinance: LTC ${data.ltc||"N/A"}%, All-in rate ${r.financeRate?(r.financeRate*100).toFixed(2)+"%":"N/A"}`.trim();
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
    try{const currSym={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";await generateBrochurePDF(data,results,assetType,currSym,brochureContent,brochurePhotos);}
    catch(e){console.error("Brochure PDF error:",e);}
    setDownloadingBrochure(false);
  };
  const[panelOpen,setPanelOpen]=useState(true);
  const TABS_BTR=["general","revenue","costs","finance","cashflow","analysis"];
  const TABS_BTS=["general","revenue","costs","finance","analysis"];
  const TABS_HOTEL=hotelMode==="advanced"?["general","revenue","costs","finance","im","cashflow","analysis"]:["general","revenue","costs","finance","cashflow","analysis"];
  const TABS_FLIP=["general","costs","finance","analysis"];
  const TABS=assetType==="BTR"?TABS_BTR:assetType==="BTS"?TABS_BTS:assetType==="Hotel"?TABS_HOTEL:TABS_FLIP;
  const TAB_LABELS:Record<string,string>={general:"General",revenue:"Revenue",costs:"Costs",finance:"Finance",im:"IM & Costs",cashflow:"Cash Flow",analysis:"Analysis"};
  const currencies=["GBP","USD","EUR","AED","SGD","AUD","JPY","CHF","CAD","HKD"];
  const benchmarks=["SONIA","SOFR","EURIBOR","EIBOR","SORA","AONIA","TONA","SARON","CORRA","HONIA"];
  const currencySymbol={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";
  if(loading)return(
    <div style={{minHeight:"100vh",background:"#06070a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:24,color:"#c9a84c",letterSpacing:".12em",fontWeight:300}}>VALORA</div>
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
        <button onClick={()=>router.push("/dashboard")} style={{background:"none",border:"none",color:"var(--gold)",fontFamily:"var(--font-display)",fontSize:20,fontWeight:300,cursor:"pointer",letterSpacing:".1em",flexShrink:0}}>VALORA</button>
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
                <div className="section-title">Acquisition</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Purchase Price ({currencySymbol})</label><input className="inp" type="number" value={data.purchasePrice} onChange={e=>set("purchasePrice",e.target.value)}/></div>
                  <SDLTBlock data={data} set={set} r={r} currencySymbol={currencySymbol}/>
                </div>
                <div className="section-title" style={{marginTop:24}}>Refurbishment</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Refurb Budget ({currencySymbol})</label><input className="inp" type="number" value={data.refurbBudget} onChange={e=>set("refurbBudget",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Other Costs ({currencySymbol})</label><input className="inp" type="number" value={data.otherCosts} onChange={e=>set("otherCosts",e.target.value)}/></div>
                </div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Professional Fees (%)</label><input className="inp" type="number" step="0.5" value={data.professionalFeesPct} onChange={e=>set("professionalFeesPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Contingency (%)</label><input className="inp" type="number" step="0.5" value={data.contingencyPct} onChange={e=>set("contingencyPct",e.target.value)}/></div>
                </div>
                <div className="section-title" style={{marginTop:24}}>Sale</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Sale Price ({currencySymbol})</label><input className="inp" type="number" value={data.salePrice} onChange={e=>set("salePrice",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Agent Fee (%)</label><input className="inp" type="number" step="0.1" value={data.agentFeePct} onChange={e=>set("agentFeePct",e.target.value)}/></div>
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
                          <div className="inp-group"><label className="inp-label">LTC Ratio (%)</label><input className="inp" type="number" step="1" value={data.ltc||60} onChange={e=>set("ltc",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Interest Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.marginOverBenchmark||3.0} onChange={e=>set("marginOverBenchmark",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct||1.5} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Exit Fee (%)</label><input className="inp" type="number" step="0.1" value={data.exitFeePct||1.0} onChange={e=>set("exitFeePct",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Brokerage Fee (%)</label><input className="inp" type="number" step="0.1" value={data.brokerageFeePct||0.5} onChange={e=>set("brokerageFeePct",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Loan Amount (auto)</label><div className="inp" style={{color:"var(--amber)",cursor:"not-allowed"}}>{hotelAdv?fmt(hotelAdv.loanAmount,currencySymbol):"—"}</div></div>
                        </div>
                      </>
                    )}

                    {/* Dual Facility */}
                    {(data.capStructure||"single")==="dual"&&(
                      <>
                        <div style={{fontSize:11,color:"var(--gold)",fontWeight:600,marginBottom:10}}>Acquisition Facility</div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">LTV (%)</label><input className="inp" type="number" step="1" value={data.acqLTV||65} onChange={e=>set("acqLTV",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Interest Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.acqRate||6.25} onChange={e=>set("acqRate",e.target.value)}/></div>
                        </div>
                        <div style={{fontSize:11,color:"var(--blue)",fontWeight:600,margin:"16px 0 10px"}}>CapEx Facility</div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">LTC (%)</label><input className="inp" type="number" step="1" value={data.capexLTC||50} onChange={e=>set("capexLTC",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Interest Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.capexRate||6.25} onChange={e=>set("capexRate",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct||1.25} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Brokerage Fee (%)</label><input className="inp" type="number" step="0.1" value={data.brokerageFeePct||0.5} onChange={e=>set("brokerageFeePct",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Exit Fee (%)</label><input className="inp" type="number" step="0.1" value={data.exitFeePct||1.0} onChange={e=>set("exitFeePct",e.target.value)}/></div>
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
                          <div className="inp-group"><label className="inp-label">Senior LTV (%)</label><input className="inp" type="number" step="1" value={data.seniorLTV||55} onChange={e=>set("seniorLTV",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Senior Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.seniorRate||6.25} onChange={e=>set("seniorRate",e.target.value)}/></div>
                        </div>
                        <div style={{fontSize:11,color:"var(--amber)",fontWeight:600,margin:"16px 0 10px"}}>Mezzanine</div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Mezz LTV (%)</label><input className="inp" type="number" step="1" value={data.mezzLTV||70} onChange={e=>set("mezzLTV",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Mezz Rate (%pa)</label><input className="inp" type="number" step="0.1" value={data.mezzRate||12.0} onChange={e=>set("mezzRate",e.target.value)}/></div>
                        </div>
                        <div className="inp-row">
                          <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct||1.5} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                          <div className="inp-group"><label className="inp-label">Exit Fee (%)</label><input className="inp" type="number" step="0.1" value={data.exitFeePct||1.0} onChange={e=>set("exitFeePct",e.target.value)}/></div>
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
                ):(
                  <>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Bridging Rate (%pm)</label><input className="inp" type="number" step="0.05" value={data.bridgingRatePct} onChange={e=>set("bridgingRatePct",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Term (months)</label><input className="inp" type="number" value={data.bridgingTermMonths} onChange={e=>set("bridgingTermMonths",e.target.value)}/></div>
                    </div>
                    <div className="inp-row">
                      <div className="inp-group"><label className="inp-label">Arrangement Fee (%)</label><input className="inp" type="number" step="0.1" value={data.arrangementFeePct} onChange={e=>set("arrangementFeePct",e.target.value)}/></div>
                      <div className="inp-group"><label className="inp-label">Loan Amount (auto)</label><div className="inp" style={{color:"var(--amber)",cursor:"not-allowed"}}>{fmt(r.loanAmount||0,currencySymbol)}</div></div>
                    </div>
                  </>
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
                            {label:"Equity Out",values:[-(hotelAdv.equity||0),...Array(data.holdYears||5).fill(null)],color:"var(--red)"},
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
                          {label:"Total Investment",value:fmt(hotelAdv.totalCost,currencySymbol),color:"var(--text)"},
                          {label:"Profit (before incentive)",value:fmt(hotelAdv.profit,currencySymbol),color:hotelAdv.profit>0?"var(--green)":"var(--red)"},
                          {label:"Equity Multiple",value:fmtX(hotelAdv.moic),color:hotelAdv.moic>2?"var(--green)":"var(--amber)"},
                          {label:"IRR",value:fmtPct(hotelAdv.irr),color:hotelAdv.irr>0.15?"var(--green)":hotelAdv.irr>0.08?"var(--amber)":"var(--red)"},
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
                    ["GDV (Exit)",fmt(r.gdv,currencySymbol),"var(--gold)"],["Gross NOI pa",fmt(r.noi,currencySymbol),"var(--text)"],["Total Build Cost",fmt(r.buildCost,currencySymbol),"var(--text-m)"],["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),"var(--amber)"],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),"var(--amber)"],["Total Finance Cost",fmt(r.totalFinanceCost,currencySymbol),"var(--amber)"],["Total Cost",fmt(r.totalCost,currencySymbol),"var(--text-m)"],["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],["Profit on Cost",fmtPct(r.poc),r.poc>0.2?"var(--green)":r.poc>0.1?"var(--amber)":"var(--red)"],["Yield on Cost",fmtPct(r.yoc),"var(--blue)"],["IRR (Unlevered)",fmtPct(r.irr),"var(--blue)"],["IRR (Levered)",fmtPct(r.irrLevered),"var(--blue)"],["Equity Multiple (MOIC)",fmtX(r.moic),r.moic>2?"var(--green)":"var(--text)"],["DSCR / ICR",isFinite(r.dscr)?fmtX(r.dscr):"—",r.dscr>=1.5?"var(--green)":r.dscr>=1.25?"var(--amber)":"var(--red)"],["Payback Period",r.paybackMonth?`Month ${r.paybackMonth}`:"Beyond horizon","var(--text-m)"],["Break-even Exit Yield",fmtPct(r.breakEvenYield),"var(--text-m)"],["Residual Land Value",fmt(r.rlv,currencySymbol),"var(--gold)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                  {assetType==="BTS"&&([
                    ["GDV",fmt(r.gdv,currencySymbol),"var(--gold)"],["Total Units",r.totalUnits?.toString()||"—","var(--text)"],["Total Sqft",r.totalSqft?.toLocaleString()||"—","var(--text-m)"],["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),"var(--amber)"],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),"var(--amber)"],["Total Cost",fmt(r.totalCost,currencySymbol),"var(--text-m)"],["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],["Profit on Cost",fmtPct(r.poc),r.poc>0.2?"var(--green)":r.poc>0.1?"var(--amber)":"var(--red)"],["Profit on GDV",fmtPct(r.margin),r.margin>0.15?"var(--green)":"var(--amber)"],["IRR (Unlevered)",fmtPct(r.irr),"var(--blue)"],["IRR (Levered)",fmtPct(r.irrLevered),"var(--blue)"],["Equity Multiple (MOIC)",fmtX(r.moic),r.moic>2?"var(--green)":"var(--text)"],["Payback Period",r.paybackMonth?`Month ${r.paybackMonth}`:"Beyond horizon","var(--text-m)"],["Break-even Sale psf",r.breakEvenPsf?`${currencySymbol}${Math.round(r.breakEvenPsf)}psf`:"—","var(--text-m)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                  {assetType==="Hotel"&&([
                    ["RevPAR",fmt(r.revpar,currencySymbol),"var(--gold)"],["Total Revenue pa",fmt(r.revenuePa,currencySymbol),"var(--text)"],["EBITDA pa",fmt(r.ebitda,currencySymbol),"var(--green)"],["GOP Margin",hotelRev&&hotelRev.totalRev>0?fmtPct(hotelRev.totalEbitda/hotelRev.totalRev):"—","var(--green)"],["EBITDA per Room",hotelRev&&num(String(data.rooms))>0?fmt(hotelRev.totalEbitda/num(String(data.rooms)),currencySymbol):"—","var(--text-m)"],["Stabilised Value",fmt(r.stabilisedValue,currencySymbol),"var(--text-m)"],["Exit Value",fmt(r.exitValue,currencySymbol),"var(--gold)"],["Arrangement Fee",fmt(r.arrangementFee,currencySymbol),"var(--amber)"],["Interest (Rolled)",fmt(r.interestCost,currencySymbol),"var(--amber)"],["Total Investment",fmt(r.totalInvestment,currencySymbol),"var(--text-m)"],["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],["Return on Cost",fmtPct(r.poc),r.poc>0.15?"var(--green)":"var(--amber)"],["Yield on Cost",fmtPct(r.yoc),"var(--blue)"],["IRR (Unlevered)",fmtPct(r.irr),"var(--blue)"],["IRR (Levered)",fmtPct(r.irrLevered),"var(--blue)"],["Equity Multiple (MOIC)",fmtX(r.moic),r.moic>2?"var(--green)":"var(--text)"],["DSCR / ICR",isFinite(r.dscr)?fmtX(r.dscr):"—",r.dscr>=1.5?"var(--green)":r.dscr>=1.25?"var(--amber)":"var(--red)"],["Payback Period",r.paybackMonth?`Month ${r.paybackMonth}`:"Beyond horizon","var(--text-m)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                  {assetType==="Flip"&&([
                    ["Purchase Price",fmt(r.purchase,currencySymbol),"var(--text)"],["Property Tax",fmt(r.sdlt,currencySymbol),"var(--amber)"],["Refurb Budget",fmt(r.refurb,currencySymbol),"var(--text-m)"],["Finance Cost",fmt(r.totalFinanceCost,currencySymbol),"var(--amber)"],["Total Cost",fmt(r.totalCost,currencySymbol),"var(--text-m)"],["Net Sale Proceeds",fmt(r.netProceeds,currencySymbol),"var(--gold)"],["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],["ROI on Total Cost",fmtPct(r.roi),r.roi>0.15?"var(--green)":"var(--amber)"],["ROI on Equity",fmtPct(r.roiEquity),r.roiEquity>0.25?"var(--green)":"var(--amber)"],["Equity Multiple (MOIC)",fmtX(r.moic),r.moic>1.5?"var(--green)":"var(--text)"],["IRR (Annualised)",fmtPct(r.irr),"var(--blue)"],["Payback Period",r.paybackMonth?`Month ${r.paybackMonth}`:"—","var(--text-m)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                </div>
                {assetType==="Hotel"&&(()=>{
                  // Hotel sensitivity: exit cap rate (rows) × ADR shift (columns)
                  const baseCapRate=num(String(data.exitCapRate||6.5));
                  const baseADR=num(String(data.adr||180));
                  const capRates=[-0.5,-0.25,0,0.25,0.5].map(d=>baseCapRate+d);
                  const adrMults=[-0.10,-0.05,0,0.05,0.10].map(d=>1+d);
                  const hotelSensMatrix=capRates.map(cr=>adrMults.map(am=>{
                    const modData={...data,exitCapRate:cr,adr:baseADR*am};
                    const res=calcAll("Hotel",modData);
                    return res.poc??0;
                  }));
                  return(
                    <div style={{marginBottom:28}}>
                      <div className="section-title">Sensitivity — Return on Cost %</div>
                      <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12}}>Exit cap rate (rows) × ADR shift (columns)</div>
                      <div className="sens-wrap">
                        <div style={{display:"grid",gridTemplateColumns:"80px repeat(5,1fr)",gap:4,fontSize:10,minWidth:400}}>
                          <div/>
                          {["-10%","-5%","Base","+5%","+10%"].map(h=><div key={h} style={{textAlign:"center",color:"var(--text-d)",padding:"4px",textTransform:"uppercase",letterSpacing:".06em"}}>{h}</div>)}
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
          <div style={{fontSize:11,color:"var(--text-d)",marginBottom:20}}>{data.location||"No location"} · {assetType} · {data.currency}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
            {assetType==="BTR"&&[{label:"GDV",value:fmt(r.gdv,currencySymbol),color:"var(--gold)"},{label:"Profit on Cost",value:fmtPct(r.poc),color:r.poc>0.2?"var(--green)":r.poc>0.1?"var(--amber)":"var(--red)"},{label:"IRR (Unlevered)",value:fmtPct(r.irr),color:"var(--blue)"},{label:"IRR (Levered)",value:fmtPct(r.irrLevered),color:"var(--blue)"}].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}><div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div><div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,color:m.color}}>{m.value}</div></div>))}
            {assetType==="BTS"&&[{label:"GDV",value:fmt(r.gdv,currencySymbol),color:"var(--gold)"},{label:"Profit on Cost",value:fmtPct(r.poc),color:r.poc>0.2?"var(--green)":"var(--amber)"},{label:"IRR",value:fmtPct(r.irr),color:"var(--blue)"},{label:"Profit on GDV",value:fmtPct(r.margin),color:"var(--text)"}].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}><div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div><div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,color:m.color}}>{m.value}</div></div>))}
            {assetType==="Hotel"&&[{label:"Exit Value",value:fmt(r.exitValue,currencySymbol),color:"var(--gold)"},{label:"EBITDA pa",value:fmt(r.ebitda,currencySymbol),color:"var(--green)"},{label:"IRR",value:fmtPct(r.irr),color:"var(--blue)"},{label:"Return on Cost",value:fmtPct(r.poc),color:r.poc>0.15?"var(--green)":"var(--amber)"}].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}><div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div><div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,color:m.color}}>{m.value}</div></div>))}
            {assetType==="Flip"&&[{label:"Sale Price",value:fmt(r.salePrice,currencySymbol),color:"var(--gold)"},{label:"Profit",value:fmt(r.profit,currencySymbol),color:r.profit>0?"var(--green)":"var(--red)"},{label:"ROI on Cost",value:fmtPct(r.roi),color:r.roi>0.15?"var(--green)":"var(--amber)"},{label:"IRR",value:fmtPct(r.irr),color:"var(--blue)"}].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}><div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div><div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,color:m.color}}>{m.value}</div></div>))}
          </div>
          <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginBottom:16}}>
            <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Institutional Metrics</div>
            {([
              ["Equity Multiple",fmtX(r.moic),r.moic>2?"var(--green)":r.moic>1.5?"var(--amber)":"var(--red)"],
              ...(assetType==="BTR"||assetType==="Hotel"?[["DSCR / ICR",isFinite(r.dscr)?fmtX(r.dscr):"—",r.dscr>=1.5?"var(--green)":r.dscr>=1.25?"var(--amber)":"var(--red)"]] as any[]:[]),
              ...(assetType==="Hotel"&&hotelRev?[["GOP Margin",hotelRev.totalRev>0?fmtPct(hotelRev.totalEbitda/hotelRev.totalRev):"—","var(--green)"],["EBITDA / Room",num(String(data.rooms))>0?fmt(hotelRev.totalEbitda/num(String(data.rooms)),currencySymbol):"—","var(--text-m)"]] as any[]:[]),
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
