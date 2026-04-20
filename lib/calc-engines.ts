// ─────────────────────────────────────────────────────────────────────────────
// Valora — Calculation Engines
// Pure, framework-agnostic math. NO React, NO Supabase, NO browser APIs.
// Safe to import from server components, API routes, tests, or Worker threads.
//
// Imported by: app/page.tsx (live appraisal UI) and __tests__/engines.test.ts
// ─────────────────────────────────────────────────────────────────────────────

// ─── SHARED TYPES ────────────────────────────────────────────────────────────
export type AssetType = "BTR"|"BTS"|"Hotel"|"Flip"|"MixedUse"|"Commercial"|"Industrial";
export type SensMetric = "poc"|"irr"|"moic"|"profit";
export type SensCell = { poc:number; irr:number; moic:number; profit:number };
export type JurisdictionProfile = {
  purchasersCostsResi: number;
  purchasersCostsComm: number;
  opexPctResi: number;
  commercialMgmtPct: number;
  dscrFloor: number;
  transferTaxLabel: string;
};

function calcSDLT(price:number,mode:'auto'|'manual'|'none',txType:'residential'|'commercial'|'mixed'|'spv',override:number,surcharge:boolean):number{
  if(mode==='none')return 0;
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
  // Guard: IRR is undefined for empty, all-zero, all-positive, or all-negative cashflows.
  // Without this guard, the bisection fallback can return absurd results (e.g. 450%) for pathological inputs.
  if(!cashflows||cashflows.length<2)return 0;
  if(cashflows.every(c=>c===0))return 0;
  if(!cashflows.some(c=>c<0))return 0; // no capital outflow → no meaningful IRR
  if(!cashflows.some(c=>c>0))return 0; // no capital return → complete loss
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
function calcFinanceCostMonthly(p:{landCost:number;sdlt:number;buildCost:number;buildMonths:number;annualRate:number;ltcPct:number;arrangementFeePct:number;exitFeePct?:number;costProfile:string;presaleDelayMonths?:number;}):{totalFinanceCost:number;arrangementFee:number;interestCost:number;exitFee:number;monthlyInterestArr:number[];monthlyDrawArr:number[];peakLoanBalance:number;loanAmount:number}{
  const{landCost,sdlt,buildCost,buildMonths,annualRate,ltcPct,arrangementFeePct,exitFeePct=0,costProfile,presaleDelayMonths=0}=p;
  const mRate=annualRate/12;
  const loanAmount=(landCost+sdlt+buildCost)*ltcPct;
  const landDraw=(landCost+sdlt)*ltcPct;
  const buildLoanTotal=buildCost*ltcPct;
  const profile=buildDrawdownProfile(buildMonths,costProfile);
  const monthlyDrawArr:number[]=[],monthlyInterestArr:number[]=[];
  let bal=0;
  const delayMonths=Math.min(Math.max(0,Math.round(presaleDelayMonths)),buildMonths);
  for(let m=0;m<buildMonths;m++){
    if(m<delayMonths){
      monthlyDrawArr.push(0);monthlyInterestArr.push(0);
    } else {
      const isFirstDraw=(m===delayMonths);
      const draw=isFirstDraw?landDraw+buildLoanTotal*profile[m]:buildLoanTotal*profile[m];
      bal+=draw;const interest=bal*mRate;bal+=interest;
      monthlyDrawArr.push(draw);monthlyInterestArr.push(interest);
    }
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
// ─────────────────────────────────────────────────────────────────────────────
// Sensitivity matrix — multi-metric cells + user-selectable display metric
// Each cell stores all 4 metrics so the picker can switch view instantly.
// ─────────────────────────────────────────────────────────────────────────────
function toSensCell(res:any):SensCell{
  return{
    poc:(res.poc??res.roi??0) as number,
    irr:(res.irr??0) as number,
    moic:(res.moic??0) as number,
    profit:(res.profit??0) as number,
  };
}
function sensCellClass(value:number,metric:SensMetric):string{
  switch(metric){
    case"irr":    return value>=0.15?"cell-g":value>=0.08?"cell-a":"cell-r";
    case"moic":   return value>=2.0 ?"cell-g":value>=1.5 ?"cell-a":"cell-r";
    case"profit": return value>0    ?"cell-g":value===0  ?"cell-a":"cell-r";
    case"poc":
    default:      return value>=0.20?"cell-g":value>=0.10?"cell-a":"cell-r";
  }
}
function fmtSensCell(value:number,metric:SensMetric,currencySymbol:string="£"):string{
  switch(metric){
    case"moic":   return fmtX(value);
    case"profit": return fmt(value,currencySymbol);
    case"irr":
    case"poc":
    default:      return fmtPct(value);
  }
}
function sensMetricLabel(metric:SensMetric):string{
  switch(metric){
    case"irr":    return "IRR";
    case"moic":   return "Equity Multiple";
    case"profit": return "Profit";
    case"poc":
    default:      return "Profit on Cost";
  }
}
function sensMetricShort(metric:SensMetric):string{
  switch(metric){
    case"irr":    return "IRR";
    case"moic":   return "MOIC";
    case"profit": return "Profit";
    case"poc":
    default:      return "PoC";
  }
}
function sensLegend(metric:SensMetric):[string,string][]{
  switch(metric){
    case"irr":    return [["rgba(61,220,132,.15)","≥ 15%"],["rgba(240,164,41,.12)","8–15%"],["rgba(244,100,95,.12)","< 8%"]];
    case"moic":   return [["rgba(61,220,132,.15)","≥ 2.0×"],["rgba(240,164,41,.12)","1.5–2.0×"],["rgba(244,100,95,.12)","< 1.5×"]];
    case"profit": return [["rgba(61,220,132,.15)","Positive"],["rgba(240,164,41,.12)","Break-even"],["rgba(244,100,95,.12)","Loss"]];
    case"poc":
    default:      return [["rgba(61,220,132,.15)","> 20%"],["rgba(240,164,41,.12)","10–20%"],["rgba(244,100,95,.12)","< 10%"]];
  }
}
// ─────────────────────────────────────────────────────────────────────────────
// Valuation & operating-cost defaults — shared across every hold-model engine so
// net-to-gross, purchaser's costs and profit definitions are applied consistently
// across Mixed Use, Commercial, BTR and Hotel. Override per-zone or per-deal via
// data.opexPct / data.mgmtPct / data.purchasersCostsPct (exposed in the UI).
//
// UK market defaults (applied when user hasn't set an explicit override):
//   • Residential BTR opex: 25% of gross rent (mgmt + voids + repairs + SC shortfall + insurance)
//   • Commercial FRI mgmt:   3% of gross rent (tenant pays repairs/SC/insurance; LL carries AM fee + non-recoverables)
//   • Purchaser's costs:     5.75% residential investment, 6.75% commercial / mixed
//   • Passing rent default:  100% of ERV (only discount if user explicitly provides passingRent)
// ─────────────────────────────────────────────────────────────────────────────
const VAL_DEFAULTS={
  RESI_OPEX_PCT:0.25,
  COMM_MGMT_PCT:0.03,
  PC_RESI_INVESTMENT:0.0575,
  PC_COMMERCIAL:0.0675,
} as const;
// ─────────────────────────────────────────────────────────────────────────────
// JURISDICTION_PROFILES — currency-keyed defaults so non-UK deals get sensible
// market-standard benchmarks without user override. Explicit per-zone / per-deal
// values always win over the jurisdiction default.
//
// Sources: RICS Valuation Practice (UK), HCA 2023; Knight Frank Europe Capital
// Markets (EUR); CBRE Middle East Market Outlook 2024 (AED); CBRE US 2024
// (USD); JLL APAC (SGD, AUD); CBRE LATAM (BRL, MXN). Numbers reflect typical
// institutional investment deals in each market — retail/SME deals vary.
// ─────────────────────────────────────────────────────────────────────────────
const JURISDICTION_PROFILES:Record<string,JurisdictionProfile>={
  GBP:{purchasersCostsResi:0.0575,purchasersCostsComm:0.0675,opexPctResi:0.25,commercialMgmtPct:0.03,dscrFloor:1.25,transferTaxLabel:"SDLT"},
  EUR:{purchasersCostsResi:0.08,  purchasersCostsComm:0.095, opexPctResi:0.22,commercialMgmtPct:0.04,dscrFloor:1.20,transferTaxLabel:"IMT / ITP"},
  USD:{purchasersCostsResi:0.03,  purchasersCostsComm:0.04,  opexPctResi:0.30,commercialMgmtPct:0.05,dscrFloor:1.25,transferTaxLabel:"Transfer Tax"},
  AED:{purchasersCostsResi:0.04,  purchasersCostsComm:0.04,  opexPctResi:0.20,commercialMgmtPct:0.05,dscrFloor:1.30,transferTaxLabel:"DLD Fee"},
  SGD:{purchasersCostsResi:0.05,  purchasersCostsComm:0.06,  opexPctResi:0.22,commercialMgmtPct:0.04,dscrFloor:1.25,transferTaxLabel:"BSD"},
  AUD:{purchasersCostsResi:0.055, purchasersCostsComm:0.065, opexPctResi:0.25,commercialMgmtPct:0.04,dscrFloor:1.25,transferTaxLabel:"Stamp Duty"},
  BRL:{purchasersCostsResi:0.05,  purchasersCostsComm:0.06,  opexPctResi:0.28,commercialMgmtPct:0.05,dscrFloor:1.20,transferTaxLabel:"ITBI"},
  MXN:{purchasersCostsResi:0.06,  purchasersCostsComm:0.07,  opexPctResi:0.30,commercialMgmtPct:0.05,dscrFloor:1.25,transferTaxLabel:"ISAI"},
  COP:{purchasersCostsResi:0.04,  purchasersCostsComm:0.05,  opexPctResi:0.30,commercialMgmtPct:0.05,dscrFloor:1.25,transferTaxLabel:"Impuesto Registro"},
  CLP:{purchasersCostsResi:0.03,  purchasersCostsComm:0.04,  opexPctResi:0.28,commercialMgmtPct:0.05,dscrFloor:1.25,transferTaxLabel:"IVA Transferencia"},
  CAD:{purchasersCostsResi:0.035, purchasersCostsComm:0.045, opexPctResi:0.28,commercialMgmtPct:0.04,dscrFloor:1.25,transferTaxLabel:"LTT"},
  CHF:{purchasersCostsResi:0.045, purchasersCostsComm:0.055, opexPctResi:0.20,commercialMgmtPct:0.03,dscrFloor:1.20,transferTaxLabel:"Handänderungssteuer"},
  JPY:{purchasersCostsResi:0.07,  purchasersCostsComm:0.08,  opexPctResi:0.22,commercialMgmtPct:0.04,dscrFloor:1.20,transferTaxLabel:"Registration Tax"},
  HKD:{purchasersCostsResi:0.045, purchasersCostsComm:0.05,  opexPctResi:0.20,commercialMgmtPct:0.03,dscrFloor:1.25,transferTaxLabel:"Stamp Duty"},
  INR:{purchasersCostsResi:0.07,  purchasersCostsComm:0.08,  opexPctResi:0.28,commercialMgmtPct:0.05,dscrFloor:1.30,transferTaxLabel:"Stamp Duty"},
};
function getJurisdictionProfile(currency?:string):JurisdictionProfile{
  const key=(currency||"GBP").toUpperCase();
  return JURISDICTION_PROFILES[key]||JURISDICTION_PROFILES.GBP;
}
function resolveOpexPct(z:any,data:any,useClass:string):number{
  const explicit=z?.opexPct??z?.mgmtPct??data?.opexPct??data?.mgmtPct;
  if(explicit!==undefined&&explicit!==null&&explicit!==""){return num(String(explicit))/100;}
  const profile=getJurisdictionProfile(data?.currency);
  return useClass==="residential"?profile.opexPctResi:profile.commercialMgmtPct;
}
function resolvePurchasersCostsPct(z:any,data:any,useClass:string):number{
  const explicit=z?.purchasersCostsPct??data?.purchasersCostsPct;
  if(explicit!==undefined&&explicit!==null&&explicit!==""){return num(String(explicit))/100;}
  const profile=getJurisdictionProfile(data?.currency);
  return useClass==="residential"?profile.purchasersCostsResi:profile.purchasersCostsComm;
}
function resolveDscrFloor(data:any):number{
  const explicit=data?.dscrFloor;
  if(explicit!==undefined&&explicit!==null&&explicit!==""){return num(String(explicit));}
  return getJurisdictionProfile(data?.currency).dscrFloor;
}
// Capitalise an NOI into net capital value (net of purchaser's costs)
function calcNetCapitalValue(noi:number,yieldPct:number,pcPct:number):number{
  if(yieldPct<=0)return 0;
  return (noi/yieldPct)/(1+pcPct);
}
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
  const sdltStruct=data.sdltStructure||(data.sdltShareDeal?"share":"standard");
  const sdltPct=sdltStruct==="none"?0:sdltStruct==="share"?0.005:num(String(data.sdltOverride??0))||0.05;
  const sdlt=data.sdltMode==="manual"?num(String(data.sdltOverride)):purchasePrice*sdltPct;
  const legalCosts=num(String(data.legalCosts??500000));
  const financingDD=num(String(data.financingDD??250000));
  const wiInsurance=data.wiInsuranceEnabled?num(String(data.wiInsurance??150000)):0;
  const workingCapital=data.workingCapitalEnabled?num(String(data.workingCapital??0)):0;

  // CapEx
  const capex=num(String(data.capexBudget||5000000));
  const capexPerKey=rooms>0?capex/rooms:0;
  // VAT / IVA on CapEx
  const _isSplitVatAdv=usesSplitVAT(data.currency||"GBP")||!!data.vatSplitMode;
  const _isRecoverableAdv=data.vatRecoverable!==undefined?!!data.vatRecoverable:vatIsRecoverable(data.currency||"GBP");
  const _profFeesAdv=capex*(num(String(data.professionalFeesPct||5))/100);
  const _hardVatPctAdv=_isSplitVatAdv?num(String(data.hardCostsVatPct||0))/100:num(String(data.vatPct||0))/100;
  const _softVatPctAdv=_isSplitVatAdv?num(String(data.softCostsVatPct||0))/100:num(String(data.vatPct||0))/100;
  const _vatRawAdv=capex*_hardVatPctAdv+_profFeesAdv*_softVatPctAdv;
  const vatAdv=_isRecoverableAdv?0:_vatRawAdv;
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
  const _exitNOI=stabilisedNOI;
  const exitValue=exitCapRate>0?_exitNOI/exitCapRate:0;
  const exitValuePerKey=rooms>0?exitValue/rooms:0;
  const disposalCosts=exitValue*disposalCostPct;
  const netExitProceeds=exitValue-disposalCosts;

  // Total investment — day 1 capital outlay only (opex flows through NOI, not capitalised)
  const totalCost=purchasePrice+sdlt+legalCosts+financingDD+wiInsurance+capex+vatAdv+arrangementFee+exitFee+brokerageFee+interestTotal+imAcqFee+imBasePATotal+workingCapital;
  const equity=Math.max(0,totalCost-loanAmount);
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

  // ── CANONICAL CASHFLOWS ────────────────────────────────────────────────────
  // All items that are in totalCost must flow through cfs[] with correct timing so
  // profit ties to sum(lCfs). Prior bug: VAT, arrangement fee, brokerage fee, exit fee,
  // interest total, and IM base PA sat in totalCost but were excluded from uCfs[0],
  // causing unlevered IRR to systematically overstate returns on hotel acquisitions.
  const _imBasePA=imEnabled?num(String(data.imBasePA??250000)):0;
  const _annualOpex=supportingCosts+operatorFees+_imBasePA;
  // Day-1 capital — EVERYTHING paid upfront (exit fee flows at exit; interest annualised)
  const _day1Out=purchasePrice+sdlt+legalCosts+financingDD+wiInsurance+capex+vatAdv+arrangementFee+brokerageFee+imAcqFee+workingCapital;
  // Exit = gross exit value − disposal costs − exit fee
  const _exitNetOfFees=netExitProceeds-exitFee;

  // Unlevered (asset-level): day-1 out + NOI less opex per year + exit net of fees
  const uCfs=[
    -_day1Out,
    ...yearRevenue.slice(0,holdYears-1).map(y=>y.noi-_annualOpex),
    _exitNetOfFees+(yearRevenue[holdYears-1].noi-_annualOpex),
  ];

  // Levered: day-1 out net of loan proceeds, NOI minus opex minus annual interest each year,
  // exit net of fees and loan repayment.
  // sum(lCfs) = accountingProfit by construction (ties to MOIC via equity × (moic-1)).
  const lCfs=[
    -(_day1Out-loanAmount),
    ...yearRevenue.slice(0,holdYears-1).map(y=>y.noi-_annualOpex-annualInterest),
    (_exitNetOfFees-loanAmount)+(yearRevenue[holdYears-1].noi-_annualOpex-annualInterest),
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
  // Entry RevPAR (Year 1) = ADR × Occupancy. Stabilised RevPAR is exposed as revparStabilised below.
  const revpar=num(String(data.adr))*(num(String(data.occupancy))/100);
  const revenuePa=stabilisedYear.totalRev;
  const ebitda=stabilisedEBITDA;
  const interestCost=interestTotal;
  const yoc=totalCost>0?stabilisedNOI/totalCost:0;
  const stabilisedValue=exitCapRate>0?stabilisedNOI/exitCapRate:0;

  return{
    yearRevenue,stabilisedNOI,stabilisedEBITDA,totalNOI,
    purchasePrice,pricePerKey,capexPerKey,exitValue,exitValuePerKey,disposalCosts,netExitProceeds,
    entryYieldNOI,entryYieldEBITDA,
    sdlt,legalCosts,financingDD,wiInsurance,workingCapital,
    loanAmount,interestTotal,arrangementFee,exitFee,brokerageFee,
    imAcqFee,imBasePATotal,imIncentiveProfit,imIncentiveSales,
    totalCost,equity,profit,poc,moic,dscr,
    vat:vatAdv,
    irr:irrUnlevered,irrLevered,
    // UI-compatible aliases
    totalInvestment,revpar,revenuePa,ebitda,interestCost,capex,yoc,stabilisedValue,
    paybackMonth,
    ebitdaPerKey:rooms>0?stabilisedEBITDA/rooms:0,
    noiPerKey:rooms>0?stabilisedNOI/rooms:0,
    noiConversion:stabilisedYear.totalRev>0?stabilisedNOI/stabilisedYear.totalRev:0,
    revparStabilised:stabilisedYear.revpar,
    revenueStabilised:stabilisedYear.totalRev,
    ffePa:stabilisedYear.ffe||0,
    ffe:stabilisedYear.ffe||0,
    noi:stabilisedYear.noi||0,
  };
}

// ─── VAT LABEL HELPER ─────────────────────────────────────────────────────────
function vatLabel(currency:string):string{
  const map:Record<string,string>={GBP:"VAT (UK)",USD:"Sales Tax (US)",EUR:"IVA (EU)",AED:"VAT (UAE)",MXN:"IVA (MX)",BRL:"ICMS/ISS (BR)",COP:"IVA (CO)",CLP:"IVA (CL)",PEN:"IGV (PE)",ARS:"IVA (AR)",SGD:"GST (SG)",AUD:"GST (AU)",JPY:"Consumption Tax (JP)",CHF:"MWST (CH)",CAD:"GST/HST (CA)",HKD:"Tax (HK)",INR:"GST (IN)",TRY:"KDV (TR)",ZAR:"VAT (ZA)",THB:"VAT (TH)",IDR:"PPN (ID)",PHP:"VAT (PH)",KWD:"Tax (KW)",QAR:"Tax (QA)",BHD:"Tax (BH)"};
  return map[currency]||"Construction Tax";
}
// Currencies where hard/soft costs are taxed at different rates (sunk cost jurisdictions)
function usesSplitVAT(currency:string):boolean{
  return ["EUR","BRL","COP","CLP","PEN","ARS"].includes(currency);
}
// Currencies where VAT is recoverable (exclude from total cost)
function vatIsRecoverable(currency:string):boolean{
  return currency==="GBP";
}
// Helper text per currency
function vatHelperText(currency:string,isSplit:boolean):string{
  if(currency==="GBP") return "UK: 0% resi new build (zero-rated) · 20% commercial · Recoverable via VAT return — excluded from total cost";
  if(currency==="USD") return "Sales tax on construction varies by state — often 0% on materials. Set 0% if exempt in your jurisdiction.";
  if(currency==="EUR") return "IVA is a sunk cost — not recoverable. Hard costs (build) and soft costs (fees) are typically taxed at different rates.";
  if(currency==="AED") return "UAE VAT is 5% flat on all construction costs — sunk cost, not recoverable for most residential developers.";
  if(currency==="AUD"||currency==="SGD"||currency==="CAD") return "GST is generally recoverable for registered developers — set 0% if claiming input credits.";
  if(["BRL","COP","CLP","PEN","ARS"].includes(currency)) return "Construction tax is a sunk cost in most LATAM jurisdictions — not recoverable. Hard and soft costs may be taxed differently.";
  return "Set applicable rate for your jurisdiction. Leave 0% if construction tax does not apply.";
}
// ─────────────────────────────────────────────────────────────────────────────
// calcCommercialAdvanced — Year-by-year hold model for Commercial & Industrial
// ─────────────────────────────────────────────────────────────────────────────
function calcCommercialAdvanced(data:any):Record<string,any>{
  const SQM_TO_SQFT=10.7639;
  const isSqft=(data.areaUnit||"sqft")==="sqft";
  const units:any[]=data.units||[];
  const holdYears=Math.max(1,Math.round(num(String(data.holdYears||5))));

  // Per-unit year-by-year NOI
  const yearlyNOI:number[]=Array(holdYears).fill(0);
  const unitYearData:any[]=[];

  units.forEach((u:any)=>{
    const areaNative=num(String(u.areaSqm||0));
    const erv=num(String(u.erv||0));
    const passingRent=num(String(u.passingRent||0));
    const wault=num(String(u.wault??5));
    const voidPct=num(String(u.voidPct??5))/100;
    const rentFreeMonths=num(String(u.rentFreeMonths||0));
    const reviewType=u.rentReviewType||data.rentReviewType||"fixed";
    const reviewPct=num(String(u.rentReviewPct??data.rentReviewPct??3))/100;
    const reviewYears=Math.max(1,num(String(u.rentReviewYears??data.rentReviewYears??5)));
    const mgmtPct=num(String(u.mgmtPct??data.mgmtPct??10))/100;
    const grossErv=areaNative*erv;
    const grossPassing=areaNative*passingRent;
    const unitYears:any[]=[];
    for(let yr=1;yr<=holdYears;yr++){
      let income=0;
      if(yr<=Math.floor(rentFreeMonths/12)){
        income=0;
      }else if(yr<=Math.ceil(wault)){
        income=grossPassing;
      }else{
        const reviewsApplied=Math.floor((yr-1)/reviewYears);
        let reviewedErv=grossErv;
        if(reviewType==="fixed"){reviewedErv=grossErv*Math.pow(1+reviewPct,reviewsApplied);}
        else{reviewedErv=grossErv*(1+reviewPct*reviewsApplied);}
        income=reviewedErv*(1-voidPct);
      }
      const netIncome=income*(1-mgmtPct);
      unitYears.push({yr,grossIncome:income,netIncome,grossErv,grossPassing});
      yearlyNOI[yr-1]+=netIncome;
    }
    unitYearData.push({label:u.label||"Unit",unitYears,grossErv,grossPassing,wault,voidPct});
  });

  // Costs
  const landCost=num(String(data.landCost||0));
  const sdlt=calcSDLT(landCost,data.sdltMode??"auto",data.sdltTransactionType??"commercial",data.sdltOverride??0,data.sdltSurcharge??false);
  const totalAreaNative=units.reduce((s:number,u:any)=>s+num(String(u.areaSqm||0)),0);
  const totalAreaSqm=isSqft?totalAreaNative/SQM_TO_SQFT:totalAreaNative;
  const buildCost=totalAreaSqm*num(String(data.buildCostPsm||0));
  const profFees=buildCost*(num(String(data.professionalFeesPct||8))/100);
  const contingency=buildCost*(num(String(data.contingencyPct||5))/100);
  const isSplitVatC=usesSplitVAT(data.currency||"GBP")||!!data.vatSplitMode;
  const isRecoverableC=data.vatRecoverable!==undefined?!!data.vatRecoverable:vatIsRecoverable(data.currency||"GBP");
  const hardVatPctC=isSplitVatC?num(String(data.hardCostsVatPct||0))/100:num(String(data.vatPct||0))/100;
  const softVatPctC=isSplitVatC?num(String(data.softCostsVatPct||0))/100:num(String(data.vatPct||0))/100;
  const vatRawC=buildCost*hardVatPctC+(profFees+contingency)*softVatPctC;
  const vat=isRecoverableC?0:vatRawC;
  const cil=num(String(data.cilPsf||0))*totalAreaSqm;
  const s106=num(String(data.s106||0));
  const annualRate=(num(String(data.benchmarkRate))+num(String(data.marginOverBenchmark)))/100;
  const ltcPct=num(String(data.ltc||60))/100;
  const buildMonths=Math.max(1,Math.round(num(String(data.programmMonths||18))));
  const stabMonths=Math.max(0,Math.round(num(String(data.stabilisationMonths||12))));
  const totalBuildCost=buildCost+profFees+contingency+vat+cil+s106;
  const fin=calcFinanceCostMonthly({landCost:landCost+sdlt,sdlt:0,buildCost:totalBuildCost,buildMonths,annualRate,ltcPct,arrangementFeePct:num(String(data.arrangementFeePct||1))/100,costProfile:data.costProfile??"straight"});
  const totalCost=landCost+sdlt+totalBuildCost+fin.totalFinanceCost;
  const equity=Math.max(0,totalCost-fin.loanAmount);

  // Exit — capitalise NOI and deduct purchaser's costs so GDV is the institutional transferable value
  const niy=num(String(data.niy||5.5))/100;
  const stabilisedNOI=yearlyNOI[holdYears-1]||yearlyNOI[0]||0;
  const exitNOI=stabilisedNOI;
  const commPcPct=resolvePurchasersCostsPct(null,data,"commercial");
  const exitValue=calcNetCapitalValue(exitNOI,niy,commPcPct);
  const totalHoldNOI=yearlyNOI.reduce((s,n)=>s+n,0);

  // IRR cashflows
  const totalMonths=buildMonths+stabMonths+holdYears*12;
  const uCfs:number[]=Array(totalMonths).fill(0);
  const lCfs:number[]=Array(totalMonths).fill(0);
  const equityRatio=totalCost>0?equity/totalCost:1;
  uCfs[0]-=landCost+sdlt+fin.arrangementFee;
  lCfs[0]-=(landCost+sdlt)*equityRatio+fin.arrangementFee;
  const buildProfile=buildDrawdownProfile(buildMonths,data.costProfile??"straight");
  for(let m=0;m<buildMonths;m++){const draw=totalBuildCost*buildProfile[m];uCfs[m]-=draw;lCfs[m]-=draw*equityRatio+(fin.monthlyInterestArr[m]??0);}
  for(let yr=0;yr<holdYears;yr++){
    const monthlyNOI=yearlyNOI[yr]/12;
    for(let m=0;m<12;m++){
      const idx=buildMonths+stabMonths+yr*12+m;
      if(idx<totalMonths){uCfs[idx]+=monthlyNOI;lCfs[idx]+=monthlyNOI-(fin.peakLoanBalance*annualRate)/12;}
    }
  }
  uCfs[totalMonths-1]+=exitValue;
  lCfs[totalMonths-1]+=exitValue-fin.peakLoanBalance;

  const irr=Math.pow(1+calcIRR(uCfs),12)-1;
  const irrLevered=equity>0?Math.pow(1+calcIRR(lCfs),12)-1:0;
  // Two PoC definitions — developer margin vs total-return (incl. hold NOI)
  const developmentProfit=exitValue-totalCost;
  const pocDev=totalCost>0?developmentProfit/totalCost:0;
  const profit=developmentProfit+totalHoldNOI;
  const poc=totalCost>0?profit/totalCost:0;
  const moic=equity>0?(equity+profit)/equity:0;
  const annualDebtService=fin.peakLoanBalance*annualRate;
  const dscr=annualDebtService>0?stabilisedNOI/annualDebtService:Infinity;
  const yoc=totalCost>0?stabilisedNOI/totalCost:0;
  const paybackMonth=calcPaybackMonth(uCfs);
  const totalErv=units.reduce((s:number,u:any)=>s+num(String(u.areaSqm||0))*num(String(u.erv||0)),0);
  const totalPassing=units.reduce((s:number,u:any)=>s+num(String(u.areaSqm||0))*num(String(u.passingRent||0)),0);

  return{
    gdv:exitValue,exitValue,profit,poc,moic,irr,irrLevered,yoc,dscr,
    developmentProfit,pocDev,developmentMargin:pocDev,
    equity,totalCost,landCost,sdlt,buildCost,profFees,contingency,vat,cil,s106,
    totalFinanceCost:fin.totalFinanceCost,arrangementFee:fin.arrangementFee,
    interestCost:fin.interestCost,loanAmount:fin.loanAmount,peakLoanBalance:fin.peakLoanBalance,
    totalErv,totalPassing,stabilisedNOI,exitNOI,totalHoldNOI,
    yearlyNOI,unitYearData,holdYears,
    avgWault:units.length>0?units.reduce((s:number,u:any)=>{const a=num(String(u.areaSqm||0));return s+num(String(u.wault??5))*(a/Math.max(totalAreaNative,1));},0):0,
    paybackMonth,uCfs,lCfs,buildMonths,stabMonths,totalMonths,
    totalAreaSqm,totalAreaNative,
    totalAreaSqft:isSqft?totalAreaNative:totalAreaNative*10.7639,
    niy,exitMethod:"investment",
    breakEvenYield:totalCost>0?stabilisedNOI/totalCost:0,
    rlv:exitValue*(1-0.20)-totalBuildCost-fin.totalFinanceCost-sdlt,
    financeRate:annualRate,
    purchasersCostsPct:commPcPct,
    sensMatrix:(()=>{
      // Sensitivity uses the same net-of-purchaser's-costs basis as the headline
      // so the centre cell reconciles to the headline PoC.
      // Returns SensCell[][] so UI metric picker can switch view without recomputing.
      const niySteps=[niy*0.9,niy*0.95,niy,niy*1.05,niy*1.10];
      const ervSteps=[0.9,0.95,1,1.05,1.10];
      // Snapshot cashflow without exit so we can substitute per-cell exit values for IRR
      const baseUCfs=[...uCfs];baseUCfs[totalMonths-1]-=exitValue;
      return niySteps.map((n:number)=>ervSteps.map((e:number)=>{
        const adjNOI=exitNOI*e;
        const adjExit=calcNetCapitalValue(adjNOI,n,commPcPct);
        const adjProfit=adjExit-totalCost+totalHoldNOI;
        const adjCfs=[...baseUCfs];adjCfs[totalMonths-1]+=adjExit;
        const rawIrr=calcIRR(adjCfs);
        const adjIrr=isFinite(rawIrr)&&rawIrr>-1?Math.pow(1+rawIrr,12)-1:0;
        return{
          poc:totalCost>0?adjProfit/totalCost:0,
          irr:adjIrr,
          moic:equity>0?(equity+adjProfit)/equity:0,
          profit:adjProfit,
        } as SensCell;
      }));
    })(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// calcMixedUseAdvanced — Year-by-year hold for Mixed Use (residential + commercial zones)
// ─────────────────────────────────────────────────────────────────────────────
function calcMixedUseAdvanced(data:any):Record<string,any>{
  const zones:any[]=data.zones||[];
  const holdYears=Math.max(1,Math.round(num(String(data.holdYears||5))));
  const annualRate=(num(String(data.benchmarkRate||3.97))+num(String(data.marginOverBenchmark||2.5)))/100;
  const ltcPct=num(String(data.ltc||60))/100;
  const buildMonths=Math.max(1,Math.round(num(String(data.programmMonths||24))));
  const arrangementFeePct=num(String(data.arrangementFeePct||1))/100;

  // Per-zone year-by-year income
  const yearlyNOI:number[]=Array(holdYears).fill(0);
  let totalBuildCost=0;
  let totalGDV=0;
  const zoneYearData:any[]=[];

  zones.forEach((z:any)=>{
    const isResidential=z.type==="residential"||!z.type;
    // Default units to 1 to match Simple engine (line 14151) and UI display (line 38791).
    // Legacy zones may be missing z.units entirely; ||1 preserves GDV continuity.
    const units=num(String(z.units||1));
    const sizeSqft=num(String(z.sizeSqft||0));
    const buildCostPsf=num(String(z.buildCostPsf||0));
    const zoneBuildCost=units*sizeSqft*buildCostPsf;
    totalBuildCost+=zoneBuildCost;

    if(isResidential){
      // Residential zone — sell or hold
      const exitStrategy=z.exitStrategy||"sell";
      if(exitStrategy==="sell"){
        // Sales revenue — goes into exit value ONLY.
        // Do NOT push to yearlyNOI (that's for hold income during holdYears).
        // Prior bug: this line double-counted sales revenue as hold NOI, inflating profit.
        const salePricePsf=num(String(z.salePricePsf||0));
        const saleRevenue=units*sizeSqft*salePricePsf;
        const agentFeePct=num(String(data.agentFeePct??1.5))/100;
        const agentFee=saleRevenue*agentFeePct;
        totalGDV+=saleRevenue-agentFee;
      } else {
        // BTR hold — rental income each year
        // Net-to-gross via resolveOpexPct (default 25% BTR opex — mgmt + voids + repairs + SC).
        // Capital value is taken net of purchaser's costs so GDV = institutional transferable value.
        const rentPcm=num(String(z.rentPcm||0));
        const grossRentPa=units*rentPcm*12;
        const opexPct=resolveOpexPct(z,data,"residential");
        const netRentPa=grossRentPa*(1-opexPct);
        for(let yr=0;yr<holdYears;yr++) yearlyNOI[yr]+=netRentPa;
        const exitYield=num(String(z.exitYield||5))/100;
        const pcPct=resolvePurchasersCostsPct(z,data,"residential");
        const zoneGDV=calcNetCapitalValue(netRentPa,exitYield,pcPct);
        totalGDV+=zoneGDV;
      }
      zoneYearData.push({label:z.label||"Residential",type:"residential",exitStrategy:z.exitStrategy||"sell"});
    } else {
      // Commercial zone — year-by-year lease cashflows
      // rentPcm interpreted as £/UNIT/MONTH (matches UI label) — converted to annual total.
      // Passing rent defaults to ERV (no silent 10% discount); override via z.passingRent if known.
      const rentPcm=num(String(z.rentPcm||z.erv||0));
      const grossErv=units*rentPcm*12; // total gross annual rent for this zone
      const passingOverride=z.passingRent!==undefined&&z.passingRent!==null&&z.passingRent!==""
        ?num(String(z.passingRent))*units*12
        :NaN;
      const passingRent=isFinite(passingOverride)?passingOverride:grossErv;
      const wault=num(String(z.wault||5));
      const voidPct=num(String(z.voidPct||5))/100;
      const rfMonths=num(String(z.rentFreeMonths||0));
      const reviewPct=num(String(z.rentReviewPct??data.rentReviewPct??3))/100;
      const reviewYears=Math.max(1,num(String(z.rentReviewYears??data.rentReviewYears??5)));
      const mgmtPct=resolveOpexPct(z,data,"commercial");
      const grossPassing=passingRent;
      const exitYield=num(String(z.exitYield||5.5))/100;
      const zoneNOI:number[]=[];

      for(let yr=1;yr<=holdYears;yr++){
        let income=0;
        if(yr<=Math.floor(rfMonths/12)) income=0;
        else if(yr<=Math.ceil(wault)) income=grossPassing;
        else {
          const reviewsApplied=Math.floor((yr-1)/reviewYears);
          const reviewedErv=grossErv*Math.pow(1+reviewPct,reviewsApplied);
          income=reviewedErv*(1-voidPct);
        }
        const net=income*(1-mgmtPct);
        zoneNOI.push(net);
        yearlyNOI[yr-1]+=net;
      }
      const stabNOI=zoneNOI[holdYears-1]||zoneNOI[0]||0;
      const pcPct=resolvePurchasersCostsPct(z,data,"commercial");
      const zoneGDV=calcNetCapitalValue(stabNOI,exitYield,pcPct);
      totalGDV+=zoneGDV;
      zoneYearData.push({label:z.label||"Commercial",type:"commercial",zoneNOI});
    }
  });

  // Finance
  const landCost=num(String(data.landCost||0));
  const sdlt=calcSDLT(landCost,data.sdltMode??"auto",data.sdltTransactionType??"mixed",data.sdltOverride??0,data.sdltSurcharge??false);
  const profFees=totalBuildCost*(num(String(data.professionalFeesPct||8))/100);
  const contingency=totalBuildCost*(num(String(data.contingencyPct||5))/100);
  // VAT handled via recoverable toggle — same treatment as BTR engine
  const isRecoverableVatMUA=data.vatRecoverable!==undefined?!!data.vatRecoverable:vatIsRecoverable(data.currency||"GBP");
  const vatRaw=totalBuildCost*(num(String(data.vatPct||0))/100);
  const vat=isRecoverableVatMUA?0:vatRaw;
  // CIL — new-build floorspace only. Uses total zone sqft as approximation (zone-level CIL exempt flags handled in simple engine).
  const zoneGIA=zones.reduce((s:number,z:any)=>s+num(String(z.units||1))*num(String(z.sizeSqft||0)),0);
  const cil=num(String(data.cilPsf||0))*zoneGIA;
  // Section 106 is a hard cash obligation — NEVER classed as recoverable. Flows into total cost always.
  const s106=num(String(data.s106||0));
  const totalBC=totalBuildCost+profFees+contingency+vat+cil+s106;
  const fin=calcFinanceCostMonthly({landCost:landCost+sdlt,sdlt:0,buildCost:totalBC,buildMonths,annualRate,ltcPct,arrangementFeePct,costProfile:data.costProfile??"straight"});
  const totalCost=landCost+sdlt+totalBC+fin.totalFinanceCost;
  const equity=Math.max(0,totalCost-fin.loanAmount);
  const totalHoldNOI=yearlyNOI.reduce((s,n)=>s+n,0);
  const stabilisedNOI=yearlyNOI[holdYears-1]||0;
  const exitValue=totalGDV;
  // Two profit / PoC definitions:
  //   • developmentMargin / pocDev = (Exit Value − Total Cost) / Total Cost  ← traditional developer's margin
  //   • profit / poc (incl. Hold)  = (Exit Value + Hold NOI − Total Cost) / Total Cost  ← total-return appraisal
  const developmentProfit=exitValue-totalCost;
  const pocDev=totalCost>0?developmentProfit/totalCost:0;
  const profit=developmentProfit+totalHoldNOI;
  const poc=totalCost>0?profit/totalCost:0;
  const moic=equity>0?(equity+profit)/equity:0;
  const yoc=totalCost>0?stabilisedNOI/totalCost:0;
  const dscr=(fin.peakLoanBalance*annualRate)>0?stabilisedNOI/(fin.peakLoanBalance*annualRate):Infinity;

  // IRR cashflows
  const totalMonths=buildMonths+holdYears*12;
  const uCfs:number[]=Array(totalMonths).fill(0);
  const lCfs:number[]=Array(totalMonths).fill(0);
  const eqRatio=totalCost>0?equity/totalCost:1;
  uCfs[0]-=landCost+sdlt+fin.arrangementFee;
  lCfs[0]-=(landCost+sdlt)*eqRatio+fin.arrangementFee;
  const bp=buildDrawdownProfile(buildMonths,data.costProfile??"straight");
  for(let m=0;m<buildMonths;m++){const d=totalBC*bp[m];uCfs[m]-=d;lCfs[m]-=d*eqRatio+(fin.monthlyInterestArr[m]??0);}
  for(let yr=0;yr<holdYears;yr++){
    const mNOI=yearlyNOI[yr]/12;
    for(let m=0;m<12;m++){
      const idx=buildMonths+yr*12+m;
      if(idx<totalMonths){uCfs[idx]+=mNOI;lCfs[idx]+=mNOI-(fin.peakLoanBalance*annualRate)/12;}
    }
  }
  uCfs[totalMonths-1]+=exitValue;
  lCfs[totalMonths-1]+=exitValue-fin.peakLoanBalance;
  const irr=Math.pow(1+calcIRR(uCfs),12)-1;
  const irrLevered=equity>0?Math.pow(1+calcIRR(lCfs),12)-1:0;
  const paybackMonth=calcPaybackMonth(uCfs);

  // For appraisal PDF compatibility (appraisal PDF reads zoneResults + totalSqft).
  // CRITICAL: this display calc must mirror the main zone GDV logic above so that
  // sum(zoneResults.gdvZone) === totalGDV — otherwise the Zone Profit Contribution
  // panel reconciles to a different number than the Returns Summary.
  // Parking excluded from GIA denominator — cost/sqft should be based on saleable/let floorspace only.
  const totalSqftAdvanced=zones.reduce((s:number,z:any)=>{
    if((z.type||"").toLowerCase()==="parking") return s;
    return s+num(String(z.units||1))*num(String(z.sizeSqft||0));
  },0);
  const zoneResultsForDisplay=zones.map((z:any)=>{
    const zUnits=num(String(z.units||1));
    const sizeSqft=num(String(z.sizeSqft||0));
    const zoneTotalSqft=zUnits*sizeSqft;
    const buildCostPsf=num(String(z.buildCostPsf||0));
    const zoneBuildCost=zoneTotalSqft*buildCostPsf;
    const isResidential=z.type==="residential"||!z.type;
    const exitStrategy=z.exitStrategy||"sell";
    const exitYield=num(String(z.exitYield||(isResidential?5:5.5)))/100;
    let gdvZone=0;
    if(isResidential&&exitStrategy==="sell"){
      const salePricePsf=num(String(z.salePricePsf||0));
      const saleRevenue=zUnits*sizeSqft*salePricePsf;
      const agentFeePctDisp=num(String(data.agentFeePct??1.5))/100;
      gdvZone=saleRevenue*(1-agentFeePctDisp); // net of user's agent fee — matches main calc
    } else if(isResidential){
      const rentPcm=num(String(z.rentPcm||0));
      const grossRentPa=zUnits*rentPcm*12;
      const opexPct=resolveOpexPct(z,data,"residential");
      const netRentPa=grossRentPa*(1-opexPct);
      const pcPct=resolvePurchasersCostsPct(z,data,"residential");
      gdvZone=calcNetCapitalValue(netRentPa,exitYield,pcPct);
    } else {
      // Commercial — replicate the year-N stabilised NOI used in the main calc
      const rentPcm=num(String(z.rentPcm||z.erv||0));
      const grossErv=zUnits*rentPcm*12;
      const passingOverride=z.passingRent!==undefined&&z.passingRent!==null&&z.passingRent!==""
        ?num(String(z.passingRent))*zUnits*12
        :NaN;
      const passingRent=isFinite(passingOverride)?passingOverride:grossErv;
      const wault=num(String(z.wault||5));
      const voidPct=num(String(z.voidPct||5))/100;
      const rfMonths=num(String(z.rentFreeMonths||0));
      const reviewPct=num(String(z.rentReviewPct??data.rentReviewPct??3))/100;
      const reviewYears=Math.max(1,num(String(z.rentReviewYears??data.rentReviewYears??5)));
      const mgmtPct=resolveOpexPct(z,data,"commercial");
      let stabIncome=0;
      for(let yr=1;yr<=holdYears;yr++){
        if(yr<=Math.floor(rfMonths/12)) stabIncome=0;
        else if(yr<=Math.ceil(wault)) stabIncome=passingRent;
        else {
          const reviewsApplied=Math.floor((yr-1)/reviewYears);
          const reviewedErv=grossErv*Math.pow(1+reviewPct,reviewsApplied);
          stabIncome=reviewedErv*(1-voidPct);
        }
      }
      const stabNOI=stabIncome*(1-mgmtPct);
      const pcPct=resolvePurchasersCostsPct(z,data,"commercial");
      gdvZone=calcNetCapitalValue(stabNOI,exitYield,pcPct);
    }
    return{label:z.label||z.type||"Zone",type:z.type||"residential",gdvZone,totalBuildCost:zoneBuildCost,totalSqft:zoneTotalSqft,exitYield};
  });

  return{
    // Headline figures (incl. hold-period income)
    gdv:exitValue,exitValue,totalGDV:exitValue,profit,poc,moic,irr,irrLevered,yoc,dscr,
    // Developer's margin — GDV vs Cost only, no hold NOI blended in
    developmentProfit,pocDev,developmentMargin:pocDev,
    margin:exitValue>0?profit/exitValue:0,
    equity,totalCost,landCost,sdlt,buildCost:totalBuildCost,totalBuildCost,profFees,contingency,vat,cil,s106,
    totalFinanceCost:fin.totalFinanceCost,arrangementFee:fin.arrangementFee,
    interestCost:fin.interestCost,loanAmount:fin.loanAmount,peakLoanBalance:fin.peakLoanBalance,
    stabilisedNOI,totalHoldNOI,yearlyNOI,zoneYearData,holdYears,
    paybackMonth,uCfs,lCfs,buildMonths,totalMonths,
    niy:num(String(data.niy||5))/100,
    financeRate:annualRate,
    rlv:exitValue*(1-0.20)-totalBC-fin.totalFinanceCost-sdlt,
    totalSqft:totalSqftAdvanced,zoneResults:zoneResultsForDisplay,
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
    const isSplitVat=usesSplitVAT(data.currency||"GBP")||!!data.vatSplitMode;
    const isRecoverableVat=data.vatRecoverable!==undefined?!!data.vatRecoverable:vatIsRecoverable(data.currency||"GBP");
    const hardVatPct=isSplitVat?num(String(data.hardCostsVatPct||0))/100:num(String(data.vatPct||0))/100;
    const softVatPct=isSplitVat?num(String(data.softCostsVatPct||0))/100:num(String(data.vatPct||0))/100;
    const vatRaw=buildCost*hardVatPct+(profFees+contingency)*softVatPct;
    const vat=isRecoverableVat?0:vatRaw;
    const cil=num(String(data.cilPsf||0))*totalSqft;
    const s106=num(String(data.s106||0));
    const devCost=buildCost+profFees+contingency+otherCosts+vat+cil+s106;
    const annualRate=(num(String(data.benchmarkRate))+num(String(data.marginOverBenchmark)))/100;
    const ltcPct=num(String(data.ltc))/100;
    const buildMonths=Math.max(1,Math.round(num(String(data.programmMonths))));
    const stabMonths=Math.max(1,Math.round(num(String(data.stabilisationMonths))));
    const totalMonths=buildMonths+stabMonths;
    const presaleDelayMonthsBTR=Math.max(0,num(String(data.presaleDelayMonths||0)));
    const fin=calcFinanceCostMonthly({landCost,sdlt,buildCost:devCost,buildMonths,annualRate,ltcPct,arrangementFeePct:num(String(data.arrangementFeePct))/100,costProfile:data.costProfile??"scurve",presaleDelayMonths:presaleDelayMonthsBTR});
    const totalCost=landCost+sdlt+devCost+fin.totalFinanceCost;
    const profit=gdv-totalCost;
    const poc=totalCost>0?profit/totalCost:0;
    const yoc=totalCost>0?noi/totalCost:0;
    // RLV uses profit-on-GDV (20%) convention — matches Commercial, Industrial, MixedUse
    const rlv=gdv*(1-0.20)-devCost-fin.totalFinanceCost-sdlt;
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
    return{gdv,noi,grossRentPa,totalSqft,totalUnits,landCost,sdlt,buildCost,profFees,contingency,devCost,vat,cil,s106,totalFinanceCost:fin.totalFinanceCost,arrangementFee:fin.arrangementFee,interestCost:fin.interestCost,loanAmount:fin.loanAmount,peakLoanBalance:fin.peakLoanBalance,monthlyInterestArr:fin.monthlyInterestArr,monthlyDrawArr:fin.monthlyDrawArr,totalCost,profit,poc,yoc,irr,irrLevered,rlv,dscr,moic,equity,paybackMonth,breakEvenYield,financeRate:annualRate,buildProfile,buildMonths,stabMonths,totalMonths,uCfs,lCfs};
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
    const isSplitVatBTS=usesSplitVAT(data.currency||"GBP")||!!data.vatSplitMode;
    const isRecoverableVatBTS=data.vatRecoverable!==undefined?!!data.vatRecoverable:vatIsRecoverable(data.currency||"GBP");
    const hardVatPctBTS=isSplitVatBTS?num(String(data.hardCostsVatPct||0))/100:num(String(data.vatPct||0))/100;
    const softVatPctBTS=isSplitVatBTS?num(String(data.softCostsVatPct||0))/100:num(String(data.vatPct||0))/100;
    const vatRawBTS=buildCost*hardVatPctBTS+(profFees+contingency)*softVatPctBTS;
    const vat=isRecoverableVatBTS?0:vatRawBTS;
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
    const presaleDelayMonthsBTS=Math.max(0,num(String(data.presaleDelayMonths||0)));
    const fin=calcFinanceCostMonthly({landCost,sdlt,buildCost:buildCosts,buildMonths,annualRate,ltcPct,arrangementFeePct:num(String(data.arrangementFeePct))/100,costProfile:data.costProfile??"scurve",presaleDelayMonths:presaleDelayMonthsBTS});
    const totalCost=landCost+sdlt+devCost+fin.totalFinanceCost;
    const profit=gdv-totalCost;
    const poc=totalCost>0?profit/totalCost:0;
    const margin=gdv>0?profit/gdv:0;
    // Equity definition: sell costs (agent fees + marketing) are paid from sale proceeds at exit,
    // not upfront, so day-1 equity = totalCost − loanAmount − sellCosts.
    // Prior bug: MOIC used one equity (incl. sellCosts) while lCfs used another (excl. sellCosts),
    // causing Equity Multiple and Levered IRR to derive from different capital bases.
    const equity=Math.max(0,totalCost-fin.loanAmount-sellCosts);
    const moic=equity>0?(equity+profit)/equity:0;
    const buildProfile=buildDrawdownProfile(buildMonths,data.costProfile??"scurve");
    // Equity ratio for the lCfs draws — now uses the SAME equity figure as MOIC
    const equityRatio=(equity+fin.loanAmount)>0?equity/(equity+fin.loanAmount):0;
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
    return{gdv,totalSqft,totalUnits,landCost,sdlt,buildCost,profFees,contingency,devCost,vat,cil,s106,totalFinanceCost:fin.totalFinanceCost,arrangementFee:fin.arrangementFee,interestCost:fin.interestCost,loanAmount:fin.loanAmount,peakLoanBalance:fin.peakLoanBalance,monthlyInterestArr:fin.monthlyInterestArr,monthlyDrawArr:fin.monthlyDrawArr,totalCost,profit,poc,margin,irr,irrLevered,equity,moic,paybackMonth,breakEvenPsf,financeRate:annualRate,buildProfile,buildMonths,absMonths,totalMonths,uCfs,lCfs};
  }
  if(assetType==="Hotel"){
    const hr=calcHotelRev(data);
    const revpar=num(String(data.adr))*(num(String(data.occupancy))/100);
    const noiMode=data.noiMode||"normalised";
    const actualNoiInput=num(String(data.actualNoi||0));
    const normalisedEbitda=hr.totalEbitda;
    // UNIFIED FF&E convention — % of revenue (industry standard for hotel underwriting).
    // Prior bug: normalisedNoi used 3% of EBITDA; exitNOI/hotelNOI used 3% of revenue;
    // actualNoi back-calculated EBITDA via /0.97 (implying 3% of EBITDA). Three conventions
    // in one function caused NOI and DSCR to drift between normalised and actual modes.
    const ffePctUnified=num(String(data.ffePct||3))/100;
    const ffeReserveRev=hr.totalRev*ffePctUnified;
    const normalisedNoi=Math.max(0,normalisedEbitda-ffeReserveRev);
    // Actual-NOI mode: user supplies NOI directly; EBITDA = NOI + FF&E reserve (on revenue)
    const ebitda=noiMode==="actual"&&actualNoiInput>0?actualNoiInput+ffeReserveRev:normalisedEbitda;
    const actualNoi=noiMode==="actual"&&actualNoiInput>0?actualNoiInput:normalisedNoi;
    const revenuePa=hr.totalRev;
    const stabilisedCapRate=num(String(data.stabilisedCapRate))/100;
    const exitCapRate=num(String(data.exitCapRate))/100;
    const revparGrowth=num(String(data.revparGrowthPct))/100;
    // In Actual NOI mode, capitalise actual NOI directly (not back-calculated EBITDA)
    const exitNOI=noiMode==="actual"&&actualNoiInput>0?actualNoiInput:Math.max(0,ebitda-(hr.totalRev*(num(String(data.ffePct||3))/100)));
    const stabilisedValue=stabilisedCapRate>0?ebitda/stabilisedCapRate:0;
    const exitValue=exitCapRate>0?(exitNOI*(1+revparGrowth))/exitCapRate:0;
    const purchasePrice=num(String(data.purchasePrice));
    const sdlt=calcSDLT(purchasePrice,data.sdltMode??"auto",data.sdltTransactionType??"commercial",data.sdltOverride??0,data.sdltSurcharge??false);
    const capex=num(String(data.capexBudget));
    const profFees=capex*(num(String(data.professionalFeesPct))/100);
    const contingency=capex*(num(String(data.contingencyPct))/100);
    const otherCosts=num(String(data.otherCosts));
    const isSplitVatH=usesSplitVAT(data.currency||"GBP")||!!data.vatSplitMode;
    const isRecoverableVatH=data.vatRecoverable!==undefined?!!data.vatRecoverable:vatIsRecoverable(data.currency||"GBP");
    const hardVatPctH=isSplitVatH?num(String(data.hardCostsVatPct||0))/100:num(String(data.vatPct||0))/100;
    const softVatPctH=isSplitVatH?num(String(data.softCostsVatPct||0))/100:num(String(data.vatPct||0))/100;
    const vatRawH=capex*hardVatPctH+profFees*softVatPctH;
    const vat=isRecoverableVatH?0:vatRawH;
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
    const hotelNOI=noiMode==="actual"&&actualNoiInput>0?actualNoiInput:Math.max(0,ebitda-ffeReserve);
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
    return{revpar,revenuePa,noiMode,normalisedNoi,actualNoiUsed:actualNoi,ebitda,noi:hotelNOI,ffe:ffeReserve,ffePa:ffeReserve,stabilisedValue,exitValue,purchasePrice,sdlt,capex,hardCost,profFees,contingency,otherCosts,vat,s106,totalFinanceCost:fin.totalFinanceCost,arrangementFee:fin.arrangementFee,interestCost:fin.interestCost,loanAmount:fin.loanAmount,peakLoanBalance:fin.peakLoanBalance,monthlyInterestArr:fin.monthlyInterestArr,monthlyDrawArr:fin.monthlyDrawArr,totalInvestment,profit,poc,yoc,irr,irrLevered,equity,moic,dscr,paybackMonth,financeRate:annualRate,buildProfile,buildMonths,stabMonths,totalMonths,uCfs,lCfs};
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
      // Legacy flat-budget / psf mode — convert sqm inputs to sqft internally so
      // downstream math is always in sqft. Prior bug: sqm mode without Area Model
      // treated raw sqm inputs as sqft, producing ~10.76× area/price errors.
      const rawArea=num(String(data.propertySqft||0));
      const propertySqftInternal=unitSys==="sqm"?rawArea*SQM_TO_SQFT:rawArea;
      const rawRefurbPsf=num(String(data.refurbPsf||0));
      const refurbPsfInternal=unitSys==="sqm"?rawRefurbPsf/SQM_TO_SQFT:rawRefurbPsf;
      refurb=propertySqftInternal>0&&refurbPsfInternal>0
        ?propertySqftInternal*refurbPsfInternal
        :num(String(data.refurbBudget||0));
      totalArea=propertySqftInternal;
      existingAreaSqft=propertySqftInternal;
    }
    const propertySqft=totalArea; // always sqft now (both branches)

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
    const isSplitVatFlip=usesSplitVAT(data.currency||"GBP")||!!data.vatSplitMode;
    const isRecoverableVatFlip=data.vatRecoverable!==undefined?!!data.vatRecoverable:vatIsRecoverable(data.currency||"GBP");
    const hardVatPctFlip=isSplitVatFlip?num(String(data.hardCostsVatPct||0))/100:num(String(data.vatPct||0))/100;
    const softVatPctFlip=isSplitVatFlip?num(String(data.softCostsVatPct||0))/100:num(String(data.vatPct||0))/100;
    const vatRawFlip=refurb*hardVatPctFlip+profFees*softVatPctFlip;
    const vat=isRecoverableVatFlip?0:vatRawFlip;
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
    // DSCR: only meaningful when rent is coming in (hold mode with tenant)
    // For vacant hold: N/A (rent=0 → NaN signal)
    // For sell mode: use ICR = gross profit / total bridge interest
    const annualNOI=(netRentPm-monthlyOpex)*12;
    const annualDebtService=refiInterestPm*12;
    let dscr:number;
    if(flipMode==="hold"&&holdOccupancy==="tenanted"&&annualDebtService>0){
      // Income-based DSCR (lenders' standard for held, income-producing assets)
      dscr=annualNOI>0?annualNOI/annualDebtService:0;
    } else if(flipMode==="hold"&&holdOccupancy!=="tenanted"){
      // Vacant hold — DSCR is not meaningful, flag as NaN (display layer shows "N/A — Vacant")
      dscr=NaN;
    } else if(flipMode==="sell"&&bridgingInterest>0){
      // Sell mode: Interest Cover Ratio = gross profit before finance / total bridge interest
      // Tells lender how many times gross project profit covers interest cost
      const grossProfitBeforeFinance=(salePrice*(1-num(String(data.agentFeePct||1.5))/100))-(purchase+sdlt+refurb+profFees+contingency+other+vat+s106);
      dscr=grossProfitBeforeFinance>0?grossProfitBeforeFinance/bridgingInterest:0;
    } else {
      dscr=0;
    }

    // ── Total costs (for cost-stack display) ──────────────────────────────────
    // Development-phase finance only. Refi interest during hold flows through the monthly
    // cashflow (operating expense) — NOT totalCost. Counting both double-subtracts it.
    const totalFinanceCost=flipMode==="hold"
      ?bridgingInterest+arrangementFee+refiArrangement
      :bridgingInterest+arrangementFee;
    const totalCost=purchase+sdlt+refurb+profFees+contingency+other+vat+s106+totalFinanceCost;
    const agentFees=salePrice*(num(String(data.agentFeePct||1.5))/100);
    const netProceeds=salePrice-agentFees;

    // ── CANONICAL CASHFLOW ─────────────────────────────────────────────────────
    // All return metrics (Profit, Equity In, MOIC, IRR, Payback) derive from ONE monthly
    // cashflow array built from REAL cash events. This fixes the prior "Bug 1" family:
    //   - bridgingInterest is no longer double-counted (it accumulates into peakLoanBalance
    //     which is repaid at exit — it must NOT also sit inside day-0 equity)
    //   - refi-month first-month-of-hold-income double-count is removed
    //   - Math.max(0, equityIn) no longer discards signal on cash-out / negative-equity deals
    //
    // Layout:
    //   M0:   -(purchase + sdlt + arrangementFee + profFees + other + vat + s106 + day-1 refiArr)
    //         + landLoan (bridging loan against land drawn day 1)
    //   M1..Mbridge: refurb draw + contingency draw (equity share = cost minus build-loan tranche)
    //   Mbridge (SELL mode): sellMonths of zero then exit: +netProceeds − peakLoanBalance
    //   Mbridge (HOLD mode): +cashOutRefi at refi event, then leaseUp/stab/hold months of
    //                        net cashflow, then exit: +netProceeds − refiLoan
    // ──────────────────────────────────────────────────────────────────────────
    const bM=Math.max(1,Math.round(bridgingMonths));
    const sM=Math.max(0,Math.round(sellMonths));
    const rfM=Math.max(0,Math.round(refiMonths));
    const leaseUpMonths=flipMode==="hold"?Math.max(0,Math.round(num(String(data.leaseUpMonths||0)))):0;
    const stabMonths=flipMode==="hold"?Math.max(0,Math.round(num(String(data.stabilisationMonths||0)))):0;
    const refurbPerMonth=refurb/bM;
    const contingencyPerMonth=contingency/bM;
    const buildLoanPerMonth=buildLoan/bM;
    const day0Equity=purchase+sdlt+arrangementFee+profFees+other+vat+s106+(flipMode==="hold"?refiArrangement:0)-landLoan;
    const monthlyRefurbEquity=refurbPerMonth+contingencyPerMonth-buildLoanPerMonth;

    const cfs:number[]=[];
    cfs.push(-day0Equity);
    for(let m=1;m<=bM;m++) cfs.push(-monthlyRefurbEquity);
    if(flipMode==="hold"){
      // Refi event: cashOutRefi = refiLoan − peakLoanBalance (positive = cash back, negative = top-up)
      cfs.push(cashOutRefi);
      // Lease-up: refi interest + opex accrue, no rent
      for(let m=0;m<leaseUpMonths;m++) cfs.push(-refiInterestPm-monthlyOpex);
      // Stabilisation: rent ramps from 0 to full
      for(let m=0;m<stabMonths;m++){
        const occ=(m+1)/stabMonths;
        cfs.push(netRentPm*occ-refiInterestPm-monthlyOpex);
      }
      // Stabilised hold phase
      const holdPhaseMonths=Math.max(0,rfM-leaseUpMonths-stabMonths);
      for(let m=0;m<holdPhaseMonths;m++) cfs.push(netCashflowPm);
      // Exit: repay refi loan, take sale proceeds
      cfs.push(netProceeds-refiLoan);
    } else {
      // Sell mode: marketing + absorption period
      for(let m=0;m<sM;m++) cfs.push(0);
      // Exit: repay peak bridge balance (includes rolled interest)
      cfs.push(netProceeds-peakLoanBalance);
    }

    // ── Derive ALL metrics from cfs[] ──────────────────────────────────────────
    // netEquityDeployed = peak cumulative capital at risk (= −min of running cumulative)
    let cumRun=0,cumMin=0;
    for(const cf of cfs){cumRun+=cf;if(cumRun<cumMin)cumMin=cumRun;}
    const netEquityDeployed=Math.max(0,-cumMin);
    // Profit = sum of all cashflows (net of equity in, capital returned)
    const profit=cfs.reduce((s,cf)=>s+cf,0);
    // Equity In for display = peak equity deployed
    const equityIn=netEquityDeployed;
    const equity=netEquityDeployed;
    // MOIC on net equity deployed: (equity + profit) / equity — ties to IRR by construction
    const moic=netEquityDeployed>0?(netEquityDeployed+profit)/netEquityDeployed:0;
    // ROI on total cost (traditional developer view — uses accounting totalCost)
    const roi=totalCost>0?profit/totalCost:0;
    const roiEquity=netEquityDeployed>0?profit/netEquityDeployed:0;

    // ── IRR from canonical cfs[] ──────────────────────────────────────────────
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
      totalCost,salePrice,agentFees,netProceeds,profit,profitAccounting:profit,profitCash:profit,roi,roiEquity,moic,irr,equity,
      paybackMonth,financeRate:bridgingRatePm*12,grossYield,netYield,flipMode,
      bridgingMonths,sellMonths,refiMonths,totalHoldMonths,dscr,
      propertySqft,existingAreaSqft,newAreaSqft,totalArea,
      refurbPsfDisplay:dispRefurbPsf,salePricePsfDisplay:dispSalePricePsf,totalCostPsfDisplay:dispTotalCostPsf,
      unitSystem:unitSys,useAreaModel,
      monthlyInterestArr,cfs,
      holdOccupancy,rentPcm,voidPct,
    };
  }
  if(assetType==="MixedUse"){
    const zones:any[]=(data.zones||[]);
    const landCost=num(String(data.landCost||0));
    const sdlt=calcSDLT(landCost,data.sdltMode??"auto",data.sdltTransactionType??"mixed",data.sdltOverride??0,data.sdltSurcharge??false);
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
      const isRecoverableVatMU=data.vatRecoverable!==undefined?!!data.vatRecoverable:vatIsRecoverable(data.currency||"GBP");
      const vatRawMU=(buildCost+buildCost*profFeesPct)*zVatPct;
      const vat=isRecoverableVatMU?0:vatRawMU;
      const profFees=buildCost*profFeesPct;
      const contingency=buildCost*contingencyPct;
      const cil=totalSqft*cilPsf*(z.status==="refurb"||z.status==="active"?0:1); // CIL on new build floorspace; refurb/active zones exempt
      const totalBuildCost=buildCost+profFees+contingency+vat+cil;

      // Exit / GDV — applies shared net-to-gross + purchaser's costs so Simple mode
      // uses the same valuation basis as Advanced. Sell-resi stays on salePricePsf basis.
      const exitStrategy=z.exitStrategy||"sell";
      const salePricePsf=num(String(z.salePricePsf||0));
      const rentPcm=num(String(z.rentPcm||0));
      const exitYield=num(String(z.exitYield||0))/100;
      const isResidentialZ=z.type==="residential";
      let gdvZone=0;
      if(exitStrategy==="sell"&&isResidentialZ){
        gdvZone=totalSqft*salePricePsf;
      } else if(exitStrategy==="sell"&&!isResidentialZ&&exitYield>0){
        // Commercial sale — investment valuation basis (NOI ÷ yield, net of PCs)
        const grossRent=rentPcm*units*12;
        const mgmtPct=resolveOpexPct(z,data,"commercial");
        const noi=grossRent*(1-mgmtPct);
        const pcPct=resolvePurchasersCostsPct(z,data,"commercial");
        gdvZone=calcNetCapitalValue(noi,exitYield,pcPct);
      } else if(exitStrategy==="hold"){
        const grossRent=rentPcm*units*12;
        const useClass=isResidentialZ?"residential":"commercial";
        const opexPct=resolveOpexPct(z,data,useClass);
        const noi=grossRent*(1-opexPct);
        const pcPct=resolvePurchasersCostsPct(z,data,useClass);
        gdvZone=calcNetCapitalValue(noi,exitYield,pcPct);
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
    const normalisedGDV=zoneResults.reduce((s:number,z:any)=>s+z.gdvZone,0);
    const totalGDV=normalisedGDV;
    const normalisedNoi=normalisedGDV;
    // Exclude parking from GIA denominator so £/sqft metrics reflect saleable / let floorspace
    const totalSqft=zoneResults.reduce((s:number,z:any)=>((z.type||"").toLowerCase()==="parking"?s:s+z.totalSqft),0);
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
    const isSqft=(data.areaUnit||"sqft")==="sqft";
    const units:any[]=data.units||[];
    const landCost=num(String(data.landCost||0));
    const sdlt=calcSDLT(landCost,data.sdltMode??"auto",data.sdltTransactionType??"commercial",data.sdltOverride??0,data.sdltSurcharge??false);
    const buildCostPerUnit=num(String(data.buildCostPsm||0));
    // Total lettable area — stored in user's unit, convert to sqm for finance calcs
    const totalAreaNative=units.reduce((s:number,u:any)=>s+num(String(u.areaSqm||0)),0);
    const totalAreaSqm=isSqft?totalAreaNative/SQM_TO_SQFT:totalAreaNative;
    const totalAreaSqft=isSqft?totalAreaNative:totalAreaNative*SQM_TO_SQFT;
    const buildCost=totalAreaNative*buildCostPerUnit;
    const profFees=buildCost*(num(String(data.professionalFeesPct||8))/100);
    const contingency=buildCost*(num(String(data.contingencyPct||5))/100);
    const otherCosts=num(String(data.otherCosts||0));
    const isSplitVatCom=usesSplitVAT(data.currency||"GBP")||!!data.vatSplitMode;
    const isRecoverableVatCom=data.vatRecoverable!==undefined?!!data.vatRecoverable:vatIsRecoverable(data.currency||"GBP");
    const hardVatPctCom=isSplitVatCom?num(String(data.hardCostsVatPct||0))/100:num(String(data.vatPct||20))/100;
    const softVatPctCom=isSplitVatCom?num(String(data.softCostsVatPct||0))/100:num(String(data.vatPct||20))/100;
    const vatRawCom=buildCost*hardVatPctCom+(profFees+contingency)*softVatPctCom;
    const vat=isRecoverableVatCom?0:vatRawCom;
    const cil=num(String(data.cilPsf||0))*totalAreaSqft;
    const s106=num(String(data.s106||0));
    const devCost=buildCost+profFees+contingency+otherCosts+vat+cil+s106;

    // ── Per-unit revenue ────────────────────────────────────────────────────
    const unitResults=units.map((u:any)=>{
      const areaNative=num(String(u.areaSqm||0));
      const areaSqm=isSqft?areaNative/SQM_TO_SQFT:areaNative;
      const erv=num(String(u.erv||0)); // £/sqft or £/sqm per year
      const passingRent=num(String(u.passingRent||0));
      const wault=num(String(u.wault??5));
      const voidPct=num(String(u.voidPct??5))/100;
      const rentFreeMonths=num(String(u.rentFreeMonths||0));
      const grossErv=areaNative*erv;
      const grossPassing=areaNative*passingRent;
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
    const effectiveNoi=totalNetPassing;
    const normalisedNoi=totalNetPassing;
    let gdv=0;
    if(exitMethod==="investment"){
      gdv=niy>0?effectiveNoi/niy:0;
    } else if(exitMethod==="equivalent"){
      // Proper UK hardcore/term+reversion equivalent yield valuation
      // Term: PV of passing rent annuity for WAULT years at equivalent yield
      // Reversion: PV of ERV in perpetuity deferred by WAULT years at equivalent yield
      if(equivalentYield>0){
        const pvAnnuity=(income:number,rate:number,years:number)=>years>0?income*(1-Math.pow(1+rate,-years))/rate:0;
        const pvPerpetuity=(income:number,rate:number,years:number)=>(income/rate)/Math.pow(1+rate,years);
        gdv=pvAnnuity(effectiveNoi,equivalentYield,avgWault)+pvPerpetuity(totalErv,equivalentYield,avgWault);
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
    // Build SensCell[][] so UI can switch metric (poc/irr/moic/profit) without recomputing.
    // Snapshot uCfs without exit so we can substitute per-cell exit values for IRR.
    const baseUCfs=[...uCfs];baseUCfs[totalMonths-1]-=gdv;
    const sensMatrix:SensCell[][]=niySteps.map(n=>rentSteps.map(e=>{
      const mNoi=totalNetPassing*(1+e/100);
      const mGdv=(n/100)>0?mNoi/(n/100):0;
      const mProfit=mGdv-totalCost;
      const adjCfs=[...baseUCfs];adjCfs[totalMonths-1]+=mGdv;
      const rawIrr2=calcIRR(adjCfs);
      const mIrr=isFinite(rawIrr2)&&rawIrr2>-1?Math.pow(1+rawIrr2,12)-1:0;
      return{
        poc:totalCost>0?mProfit/totalCost:0,
        irr:mIrr,
        moic:equity>0?(equity+mProfit)/equity:0,
        profit:mProfit,
      };
    }));

    return{
      totalAreaSqm,totalAreaSqft,buildCost,devCost,vat,cil,s106,normalisedNoi,effectiveNoi,
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
  if(assetType==="Industrial"){
    const SQM_TO_SQFT=10.7639;
    const isSqft=(data.areaUnit||"sqft")==="sqft";
    const units:any[]=data.units||[];
    const landCost=num(String(data.landCost||0));
    const sdlt=calcSDLT(landCost,data.sdltMode??"auto",data.sdltTransactionType??"commercial",data.sdltOverride??0,data.sdltSurcharge??false);
    const buildCostPerUnit=num(String(data.buildCostPsm||0));
    const totalAreaNative=units.reduce((s:number,u:any)=>s+num(String(u.areaSqm||0)),0);
    const totalAreaSqm=isSqft?totalAreaNative/SQM_TO_SQFT:totalAreaNative;
    const totalAreaSqft=isSqft?totalAreaNative:totalAreaNative*SQM_TO_SQFT;
    const buildCost=totalAreaNative*buildCostPerUnit;
    const profFees=buildCost*(num(String(data.professionalFeesPct||8))/100);
    const contingency=buildCost*(num(String(data.contingencyPct||5))/100);
    const otherCosts=num(String(data.otherCosts||0));
    const isSplitVatInd=usesSplitVAT(data.currency||"GBP")||!!data.vatSplitMode;
    const isRecoverableVatInd=data.vatRecoverable!==undefined?!!data.vatRecoverable:vatIsRecoverable(data.currency||"GBP");
    const hardVatPctInd=isSplitVatInd?num(String(data.hardCostsVatPct||0))/100:num(String(data.vatPct||20))/100;
    const softVatPctInd=isSplitVatInd?num(String(data.softCostsVatPct||0))/100:num(String(data.vatPct||20))/100;
    const vatRawInd=buildCost*hardVatPctInd+(profFees+contingency)*softVatPctInd;
    const vat=isRecoverableVatInd?0:vatRawInd;
    const cil=num(String(data.cilPsf||0))*totalAreaSqft;
    const s106=num(String(data.s106||0));
    const devCost=buildCost+profFees+contingency+otherCosts+vat+cil+s106;
    const unitResults=units.map((u:any)=>{
      const areaNative=num(String(u.areaSqm||0));
      const erv=num(String(u.erv||0));
      const passingRent=num(String(u.passingRent||0));
      const wault=num(String(u.wault??5));
      const voidPct=num(String(u.voidPct??5))/100;
      const rentFreeMonths=num(String(u.rentFreeMonths||0));
      const grossErv=areaNative*erv;
      const grossPassing=areaNative*passingRent;
      const netPassing=grossPassing*(1-voidPct);
      const rentFreeCost=grossErv*(rentFreeMonths/12);
      return{id:u.id,label:u.label||"Unit",use:u.use||"warehouse",
        areaNative,erv,passingRent,wault,voidPct,rentFreeMonths,
        grossErv,grossPassing,netPassing,rentFreeCost};
    });
    const totalErv=unitResults.reduce((s:number,u:any)=>s+u.grossErv,0);
    const totalPassing=unitResults.reduce((s:number,u:any)=>s+u.grossPassing,0);
    const totalNetPassing=unitResults.reduce((s:number,u:any)=>s+u.netPassing,0);
    const totalRentFreeCost=unitResults.reduce((s:number,u:any)=>s+u.rentFreeCost,0);
    const avgWault=units.length>0?unitResults.reduce((s:number,u:any)=>s+u.wault*(u.areaNative/Math.max(totalAreaNative,1)),0):0;
    const exitMethod=data.exitMethod||"investment";
    const niy=num(String(data.niy||5.0))/100;
    const equivalentYield=num(String(data.equivalentYield||5.25))/100;
    const vpValuePsm=num(String(data.vpValuePsm||0));
    const effectiveNoi=totalNetPassing;
    const normalisedNoi=totalNetPassing;
    let gdv=0;
    if(exitMethod==="investment"){gdv=niy>0?effectiveNoi/niy:0;}
    else if(exitMethod==="equivalent"){
      if(equivalentYield>0){
        const pvA=(income:number,rate:number,years:number)=>years>0?income*(1-Math.pow(1+rate,-years))/rate:0;
        const pvP=(income:number,rate:number,years:number)=>(income/rate)/Math.pow(1+rate,years);
        gdv=pvA(effectiveNoi,equivalentYield,avgWault)+pvP(totalErv,equivalentYield,avgWault);
      }
    } else {gdv=totalAreaSqm*vpValuePsm;}
    const annualRate=(num(String(data.benchmarkRate||3.97))+num(String(data.marginOverBenchmark||2.5)))/100;
    const ltcPct=num(String(data.ltc||60))/100;
    const buildMonths=Math.max(1,Math.round(num(String(data.programmMonths||12))));
    const stabMonths=Math.max(1,Math.round(num(String(data.stabilisationMonths||6))));
    const totalMonths=buildMonths+stabMonths;
    const fin=calcFinanceCostMonthly({landCost,sdlt,buildCost:devCost,buildMonths,annualRate,ltcPct,arrangementFeePct:num(String(data.arrangementFeePct||1.0))/100,costProfile:"scurve"});
    const totalCost=landCost+sdlt+devCost+fin.totalFinanceCost;
    const profit=gdv-totalCost;
    const poc=totalCost>0?profit/totalCost:0;
    const margin=gdv>0?profit/gdv:0;
    const yoc=totalCost>0?totalNetPassing/totalCost:0;
    const rlv=gdv*(1-0.20)-devCost-fin.totalFinanceCost-sdlt;
    const equity=Math.max(0,totalCost-fin.loanAmount);
    const moic=equity>0?(equity+profit)/equity:0;
    const annualDebtService=fin.peakLoanBalance*annualRate;
    const dscr=annualDebtService>0?totalNetPassing/annualDebtService:Infinity;
    const breakEvenRentNative=totalAreaNative>0?totalCost*(niy>0?niy:0.05)/totalAreaNative:0;
    const breakEvenYield=gdv>0?totalNetPassing/totalCost:0;
    const buildProfile=buildDrawdownProfile(buildMonths,"scurve");
    const equityRatio=totalCost>0?equity/totalCost:1;
    const uCfs:number[]=Array(totalMonths).fill(0);
    const lCfs:number[]=Array(totalMonths).fill(0);
    uCfs[0]-=landCost+sdlt+fin.arrangementFee;
    lCfs[0]-=(landCost+sdlt)*equityRatio+fin.arrangementFee;
    for(let m=0;m<buildMonths;m++){const draw=devCost*buildProfile[m];uCfs[m]-=draw;lCfs[m]-=draw*equityRatio+(fin.monthlyInterestArr[m]??0);}
    for(let m=0;m<stabMonths;m++){const ramp=(m+1)/stabMonths;const mNOI=(totalNetPassing*ramp)/12;const idx=buildMonths+m;uCfs[idx]+=mNOI;lCfs[idx]+=mNOI-(fin.peakLoanBalance*annualRate)/12;}
    uCfs[totalMonths-1]+=gdv;lCfs[totalMonths-1]+=gdv-fin.peakLoanBalance;
    const rawIrr=calcIRR(uCfs);
    const irr=isFinite(rawIrr)&&rawIrr>-1?Math.pow(1+rawIrr,12)-1:0;
    const rawIrrL=equity>0?calcIRR(lCfs):0;
    const irrLevered=equity>0&&isFinite(rawIrrL)&&rawIrrL>-1&&rawIrrL<100?Math.pow(1+rawIrrL,12)-1:0;
    const paybackMonth=calcPaybackMonth(uCfs);
    const niySteps=[-0.5,-0.25,0,0.25,0.5].map(d=>niy*100+d);
    const rentSteps=[-10,-5,0,5,10];
    // Build SensCell[][] so UI can switch metric (poc/irr/moic/profit) without recomputing.
    // Snapshot uCfs without exit so we can substitute per-cell exit values for IRR.
    const baseUCfs=[...uCfs];baseUCfs[totalMonths-1]-=gdv;
    const sensMatrix:SensCell[][]=niySteps.map(n=>rentSteps.map(e=>{
      const mNoi=totalNetPassing*(1+e/100);
      const mGdv=(n/100)>0?mNoi/(n/100):0;
      const mProfit=mGdv-totalCost;
      const adjCfs=[...baseUCfs];adjCfs[totalMonths-1]+=mGdv;
      const rawIrr2=calcIRR(adjCfs);
      const mIrr=isFinite(rawIrr2)&&rawIrr2>-1?Math.pow(1+rawIrr2,12)-1:0;
      return{
        poc:totalCost>0?mProfit/totalCost:0,
        irr:mIrr,
        moic:equity>0?(equity+mProfit)/equity:0,
        profit:mProfit,
      };
    }));
    return{totalAreaSqm,totalAreaSqft,totalAreaNative,buildCost,devCost,vat,cil,s106,normalisedNoi,effectiveNoi,
      totalErv,totalPassing,totalNetPassing,totalRentFreeCost,avgWault,
      gdv,exitMethod,niy,equivalentYield,vpValuePsm,landCost,sdlt,profFees,contingency,
      totalFinanceCost:fin.totalFinanceCost,arrangementFee:fin.arrangementFee,
      interestCost:fin.interestCost,loanAmount:fin.loanAmount,peakLoanBalance:fin.peakLoanBalance,
      monthlyInterestArr:fin.monthlyInterestArr,
      totalCost,profit,poc,margin,yoc,rlv,equity,moic,dscr,
      breakEvenRentNative,breakEvenYield,irr,irrLevered,paybackMonth,
      financeRate:annualRate,buildMonths,stabMonths,totalMonths,
      buildProfile,uCfs,lCfs,sensMatrix,unitResults};
  }
    return{};
}

// ─────────────────────────────────────────────────────────────────────────────
// MONTE CARLO + STRESS HARNESS (Phase 3 — stochastic sensitivity)
// Pure functions, deterministic under a fixed seed (Mulberry32 PRNG).
// Gated behind Pro tier in the UI; exposed here for tests + Stochastic panel.
// ─────────────────────────────────────────────────────────────────────────────

type MCDistTriangular={kind:"triangular";min:number;mode:number;max:number};
type MCDistNormal={kind:"normal";mean:number;stdev:number;clipMin?:number;clipMax?:number};
type MCDistUniform={kind:"uniform";min:number;max:number};
type MCDistFixed={kind:"fixed";value:number};
type MCDistribution=MCDistTriangular|MCDistNormal|MCDistUniform|MCDistFixed;

type MCConfig={
  iterations:number;                                // e.g. 1000 (tests) / 10000 (prod)
  seed?:number;                                     // deterministic when set
  distributions:Record<string,MCDistribution>;      // map from deal-field path → dist
  metrics?:string[];                                // which result keys to band (default: irr,moic,profit,poc)
};

type MCBand={p10:number;p50:number;p90:number;mean:number;stdev:number;min:number;max:number;n:number};
type MCResult={
  metrics:Record<string,MCBand>;                    // one band per requested metric
  samples:Record<string,number[]>;                  // raw draws per metric (for histograms)
  nDropped:number;                                  // runs discarded (NaN / non-finite)
  seedUsed:number;
};

// Mulberry32 — tiny, fast, well-distributed; enough for sensitivity work.
function mulberry32(seed:number):()=>number{
  let a=seed>>>0;
  return function():number{
    a=(a+0x6D2B79F5)>>>0;
    let t=a;
    t=Math.imul(t^(t>>>15),t|1);
    t^=t+Math.imul(t^(t>>>7),t|61);
    return(((t^(t>>>14))>>>0)/4294967296);
  };
}

// Draw one sample from a distribution using a uniform rng in [0,1).
function sampleDistribution(d:MCDistribution,rng:()=>number):number{
  if(d.kind==="fixed")return d.value;
  if(d.kind==="uniform")return d.min+rng()*(d.max-d.min);
  if(d.kind==="triangular"){
    // Inverse CDF of triangular(min,mode,max).
    const u=rng(),a=d.min,b=d.max,c=d.mode;
    const fc=(c-a)/(b-a);
    if(u<fc)return a+Math.sqrt(u*(b-a)*(c-a));
    return b-Math.sqrt((1-u)*(b-a)*(b-c));
  }
  // normal: Box-Muller with optional hard clip
  const u1=Math.max(1e-12,rng()),u2=rng();
  const z=Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);
  let x=d.mean+d.stdev*z;
  if(d.clipMin!==undefined&&x<d.clipMin)x=d.clipMin;
  if(d.clipMax!==undefined&&x>d.clipMax)x=d.clipMax;
  return x;
}

// Deep-clone a deal dict (JSON-safe — our deal objects are plain data).
function cloneDeal<T>(d:T):T{return JSON.parse(JSON.stringify(d));}

// Apply a dot-path write (e.g. "exitYield" or "units.0.rentPcm") to a deal clone.
function applyPath(obj:any,path:string,value:number):void{
  const parts=path.split(".");
  let cur=obj;
  for(let i=0;i<parts.length-1;i++){
    const p=parts[i];
    if(cur[p]===undefined||cur[p]===null)return;  // silently skip missing paths
    cur=cur[p];
  }
  cur[parts[parts.length-1]]=value;
}

// Percentile helper: linear interpolation on a pre-sorted array.
function percentile(sorted:number[],p:number):number{
  if(sorted.length===0)return NaN;
  if(sorted.length===1)return sorted[0];
  const idx=(sorted.length-1)*p;
  const lo=Math.floor(idx),hi=Math.ceil(idx);
  if(lo===hi)return sorted[lo];
  const frac=idx-lo;
  return sorted[lo]*(1-frac)+sorted[hi]*frac;
}

// Run N iterations of calcAll(assetType, perturbedDeal), collect P10/P50/P90 per metric.
function runMonteCarlo(assetType:string,baseDeal:any,config:MCConfig):MCResult{
  const N=Math.max(1,Math.floor(config.iterations||1000));
  const seed=config.seed??((Date.now()*9301+49297)%233280);
  const rng=mulberry32(seed);
  const metricKeys=config.metrics&&config.metrics.length>0?config.metrics:["irr","moic","profit","poc"];
  const samples:Record<string,number[]>={};
  for(const k of metricKeys)samples[k]=[];
  let nDropped=0;
  const distPaths=Object.keys(config.distributions);
  for(let i=0;i<N;i++){
    const deal=cloneDeal(baseDeal);
    for(const path of distPaths){
      const v=sampleDistribution(config.distributions[path],rng);
      applyPath(deal,path,v);
    }
    let out:Record<string,any>={};
    try{out=calcAll(assetType,deal);}catch{nDropped++;continue;}
    let ok=true;
    const row:Record<string,number>={};
    for(const k of metricKeys){
      const v=Number(out[k]);
      if(!Number.isFinite(v)){ok=false;break;}
      row[k]=v;
    }
    if(!ok){nDropped++;continue;}
    for(const k of metricKeys)samples[k].push(row[k]);
  }
  const metrics:Record<string,MCBand>={};
  for(const k of metricKeys){
    const arr=samples[k].slice().sort((a,b)=>a-b);
    const n=arr.length;
    if(n===0){
      metrics[k]={p10:NaN,p50:NaN,p90:NaN,mean:NaN,stdev:NaN,min:NaN,max:NaN,n:0};
      continue;
    }
    const mean=arr.reduce((s,x)=>s+x,0)/n;
    const variance=arr.reduce((s,x)=>s+(x-mean)*(x-mean),0)/Math.max(1,n-1);
    metrics[k]={
      p10:percentile(arr,0.10),
      p50:percentile(arr,0.50),
      p90:percentile(arr,0.90),
      mean,stdev:Math.sqrt(variance),
      min:arr[0],max:arr[n-1],n
    };
  }
  return{metrics,samples,nDropped,seedUsed:seed};
}

// ─── DEFAULTS ─────────────────────────────────────────────────────────────────
const DEFAULTS={
  BTR:{assetType:"BTR",vatPct:0,hardCostsVatPct:0,softCostsVatPct:0,vatSplitMode:false,vatRecoverable:true,cilPsf:0,s106:0,name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:36,stabilisationMonths:12,presaleDelayMonths:0,units:[{type:"1 Bed OMR",count:80,rentPcm:2200,size:550},{type:"2 Bed OMR",count:60,rentPcm:2900,size:750},{type:"3 Bed OMR",count:30,rentPcm:3600,size:1000},{type:"1 Bed DMR",count:40,rentPcm:1650,size:550},{type:"2 Bed DMR",count:22,rentPcm:2175,size:750}],exitYield:4.15,niy:4.0,voidPct:1.5,opexPsf:8,landCost:15000000,buildCostPsf:285,siteAreaSqft:195000,professionalFeesPct:8,contingencyPct:5,otherCosts:500000,ltc:65,marginOverBenchmark:2.5,arrangementFeePct:1.0,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:12,tier2DevShare:30,tier3Hurdle:18,tier3DevShare:40,costProfile:"scurve",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:true},
  BTS:{assetType:"BTS",vatPct:0,hardCostsVatPct:0,softCostsVatPct:0,vatSplitMode:false,vatRecoverable:true,cilPsf:0,s106:0,name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:30,stabilisationMonths:6,presaleDelayMonths:0,units:[{type:"1 Bed",count:40,salePricePsf:900,size:550},{type:"2 Bed",count:60,salePricePsf:850,size:800},{type:"3 Bed",count:20,salePricePsf:800,size:1100},{type:"Penthouse",count:5,salePricePsf:1400,size:1800}],agentFeePct:1.5,marketingPct:1.0,absorptionMonths:18,landCost:8000000,buildCostPsf:260,siteAreaSqft:110000,professionalFeesPct:8,contingencyPct:5,otherCosts:300000,ltc:60,marginOverBenchmark:2.5,arrangementFeePct:1.0,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:15,tier2DevShare:30,tier3Hurdle:20,tier3DevShare:40,costProfile:"scurve",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:true},
  Hotel:{assetType:"Hotel",vatPct:20,hardCostsVatPct:0,softCostsVatPct:0,vatSplitMode:false,vatRecoverable:false,cilPsf:0,s106:0,name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,noiMode:"normalised",actualNoi:0,programmMonths:24,stabilisationMonths:18,rooms:120,adr:180,occupancy:72,starRating:4,revparGrowthPct:2.5,roomsMarginPct:75,fnbEnabled:true,fnbRevenuePerOccRoom:45,fnbUtilisationPct:70,fnbMarginPct:30,spaEnabled:false,spaRevenuePerRoomPa:800,spaUtilisationPct:40,spaMarginPct:35,gymEnabled:false,gymMembershipRevPa:50000,gymGuestRevPerOccRoom:8,gymMarginPct:60,meetingEnabled:false,meetingRooms:4,meetingAvgDayRate:1200,meetingUtilisationPct:45,meetingMarginPct:40,exitCapRate:6.5,stabilisedCapRate:6.0,purchasePrice:18000000,capexBudget:5000000,professionalFeesPct:5,contingencyPct:8,otherCosts:200000,ltc:60,marginOverBenchmark:3.0,arrangementFeePct:1.5,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:14,tier2DevShare:30,tier3Hurdle:20,tier3DevShare:40,costProfile:"straight",sdltMode:"auto" as const,sdltTransactionType:"commercial" as const,sdltOverride:0,sdltSurcharge:false,hotelFinanceType:"full"},
  Commercial:{assetType:"Commercial",name:"",location:"",currency:"GBP",noiMode:"normalised",actualNoi:0,benchmark:"SONIA",benchmarkRate:3.97,
    programmMonths:18,stabilisationMonths:12,areaUnit:"sqft",
    landCost:5000000,buildCostPsm:120,
    professionalFeesPct:8,contingencyPct:5,otherCosts:100000,
    vatPct:20,cilPsf:0,s106:0,
    ltc:60,marginOverBenchmark:2.5,arrangementFeePct:1.0,
    sdltMode:"auto" as const,sdltTransactionType:"commercial" as const,sdltOverride:0,sdltSurcharge:false,
    exitMethod:"investment" as const,
    niy:5.5,equivalentYield:5.75,vpValuePsm:8000,
    rentReviewType:"fixed" as const,rentReviewPct:3,rentReviewYears:5,
    holdYears:5,mgmtPct:10,commercialMode:"simple",
    units:[
      {id:"u1",label:"Ground Floor Retail",use:"retail",areaSqm:5000,erv:32,passingRent:28,wault:5,voidPct:5,rentFreeMonths:6,rentReviewType:"fixed",rentReviewPct:3,rentReviewYears:5,mgmtPct:10},
      {id:"u2",label:"Office Floor 1",use:"office",areaSqm:8000,erv:42,passingRent:40,wault:3,voidPct:10,rentFreeMonths:3,rentReviewType:"fixed",rentReviewPct:3,rentReviewYears:5,mgmtPct:10},
    ],
  },
  MixedUse:{assetType:"MixedUse",name:"",location:"",currency:"GBP",noiMode:"normalised",actualNoi:0,benchmark:"SONIA",benchmarkRate:3.97,benchmark_rate:"SONIA",holdYears:5,mixedUseMode:"simple",
    programmMonths:24,landCost:3000000,
    vatPct:0,cilPsf:0,s106:0,
    ltc:60,marginOverBenchmark:2.5,arrangementFeePct:1.0,
    professionalFeesPct:8,contingencyPct:5,
    sdltMode:"auto" as const,sdltTransactionType:"mixed" as const,sdltOverride:0,sdltSurcharge:false,
    zones:[
      {id:"z1",label:"Residential",type:"residential",exitStrategy:"sell",status:"new_build",
       units:10,sizeSqft:700,buildCostPsf:260,salePricePsf:800,rentPcm:0,exitYield:5,vatPct:0,startMonth:0},
      {id:"z2",label:"Ground Floor Retail",type:"commercial",exitStrategy:"sell",status:"new_build",
       units:1,sizeSqft:1200,buildCostPsf:180,salePricePsf:0,rentPcm:3000,exitYield:6.5,vatPct:20,startMonth:0},
    ],
  },
  Flip:{assetType:"Flip",vatPct:0,s106:0,name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:9,stabilisationMonths:0,sellMonths:3,purchasePrice:450000,propertySqft:900,refurbBudget:85000,refurbPsf:95,salePrice:620000,salePricePsf:688,agentFeePct:1.5,bridgingRatePct:0.85,bridgingTermMonths:6,flipLTV:75,arrangementFeePct:2.0,professionalFeesPct:2,contingencyPct:10,otherCosts:5000,flipMode:"sell",holdOccupancy:"vacant",refiRatePct:6.0,refiTermMonths:24,refiLTV:75,refiArrangementPct:1.0,rentPcm:2200,voidPct:5,holdOpexPm:200,costProfile:"straight",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:true,areaModelOn:false,unitSystem:"sqft",existingArea:900,newArea:0,existingCostPsf:95,newCostPsf:180,architectPct:0,structEngPct:0,interiorPct:0,ffeCost:0,otherProfFees:0},
  Industrial:{assetType:"Industrial",name:"",location:"",currency:"GBP",noiMode:"normalised",actualNoi:0,benchmark:"SONIA",benchmarkRate:3.97,
    programmMonths:12,stabilisationMonths:6,areaUnit:"sqft",
    landCost:3000000,buildCostPsm:85,
    professionalFeesPct:8,contingencyPct:5,otherCosts:50000,
    vatPct:20,cilPsf:0,s106:0,
    ltc:60,marginOverBenchmark:2.5,arrangementFeePct:1.0,
    sdltMode:"auto" as const,sdltTransactionType:"commercial" as const,sdltOverride:0,sdltSurcharge:false,
    exitMethod:"investment" as const,
    niy:5.0,equivalentYield:5.25,vpValuePsm:5000,
    rentReviewType:"fixed" as const,rentReviewPct:3,rentReviewYears:5,
    holdYears:5,mgmtPct:8,commercialMode:"simple",
    units:[
      {id:"u1",label:"Unit 1 — Warehouse",use:"warehouse",areaSqm:10000,erv:8,passingRent:7.5,wault:5,voidPct:5,rentFreeMonths:3,rentReviewType:"fixed",rentReviewPct:3,rentReviewYears:5,mgmtPct:8},
      {id:"u2",label:"Unit 2 — Light Industrial",use:"light_industrial",areaSqm:5000,erv:10,passingRent:9,wault:3,voidPct:10,rentFreeMonths:3,rentReviewType:"fixed",rentReviewPct:3,rentReviewYears:5,mgmtPct:8},
    ],
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports — everything above is exposed to the UI + tests.
// ─────────────────────────────────────────────────────────────────────────────
export {
  calcSDLT, calcIRR, buildDrawdownProfile, calcFinanceCostMonthly,
  calcPaybackMonth, findBreakEvenYield, findBreakEvenSalePsf,
  fmt, fmtPct, fmtX, num, irrCol,
  toSensCell, sensCellClass, fmtSensCell, sensMetricLabel, sensMetricShort, sensLegend,
  VAL_DEFAULTS, JURISDICTION_PROFILES, getJurisdictionProfile,
  resolveOpexPct, resolvePurchasersCostsPct, resolveDscrFloor,
  calcNetCapitalValue,
  calcHotelRev, calcHotelAdvanced,
  vatLabel, usesSplitVAT, vatIsRecoverable, vatHelperText,
  calcCommercialAdvanced, calcMixedUseAdvanced,
  calcAll,
  DEFAULTS,
  // Phase 3 — Monte Carlo + stress harness
  runMonteCarlo, sampleDistribution, mulberry32,
};
export type { MCDistribution, MCConfig, MCResult, MCBand };