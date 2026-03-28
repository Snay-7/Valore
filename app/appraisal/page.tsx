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
.cf-row{display:grid;grid-template-columns:80px repeat(6,1fr);gap:4px;padding:5px 0;border-bottom:1px solid var(--bg4);font-size:11px}
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
@media(max-width:768px){
  .inp-row{grid-template-columns:1fr}
  .inp-row-3{grid-template-columns:1fr 1fr}
  .unit-row{grid-template-columns:1fr 1fr 1fr 28px}
  .editor-layout{grid-template-columns:1fr !important}
  .output-panel{position:static !important;height:auto !important}
}
`;

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
const fmt=(n:number,prefix="£")=>{
  if(!isFinite(n)||isNaN(n))return"—";
  const abs=Math.abs(n);
  if(abs>=1e9)return`${prefix}${(n/1e9).toFixed(2)}bn`;
  if(abs>=1e6)return`${prefix}${(n/1e6).toFixed(2)}m`;
  if(abs>=1e3)return`${prefix}${(n/1e3).toFixed(0)}k`;
  return`${prefix}${n.toFixed(0)}`;
};
const fmtPct=(n:number)=>(!isFinite(n)||isNaN(n)?"—":`${(n*100).toFixed(1)}%`);
const num=(v:string)=>parseFloat(v.replace(/[£,%\s]/g,""))||0;

const DEFAULTS={
  BTR:{assetType:"BTR",name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:36,stabilisationMonths:12,units:[{type:"1 Bed OMR",count:80,rentPcm:2200,size:550},{type:"2 Bed OMR",count:60,rentPcm:2900,size:750},{type:"3 Bed OMR",count:30,rentPcm:3600,size:1000},{type:"1 Bed DMR",count:40,rentPcm:1650,size:550},{type:"2 Bed DMR",count:22,rentPcm:2175,size:750}],exitYield:4.15,niy:4.0,voidPct:1.5,opexPsf:8,landCost:15000000,buildCostPsf:285,siteAreaSqft:195000,professionalFeesPct:8,contingencyPct:5,otherCosts:500000,ltc:65,marginOverBenchmark:2.5,arrangementFeePct:1.0,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:12,tier2DevShare:30,tier3Hurdle:18,tier3DevShare:40,costProfile:"scurve",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:true},
  BTS:{assetType:"BTS",name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:30,stabilisationMonths:6,units:[{type:"1 Bed",count:40,salePricePsf:900,size:550},{type:"2 Bed",count:60,salePricePsf:850,size:800},{type:"3 Bed",count:20,salePricePsf:800,size:1100},{type:"Penthouse",count:5,salePricePsf:1400,size:1800}],agentFeePct:1.5,marketingPct:1.0,absorptionMonths:18,landCost:8000000,buildCostPsf:260,siteAreaSqft:110000,professionalFeesPct:8,contingencyPct:5,otherCosts:300000,ltc:60,marginOverBenchmark:2.5,arrangementFeePct:1.0,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:15,tier2DevShare:30,tier3Hurdle:20,tier3DevShare:40,costProfile:"scurve",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:true},
  Hotel:{assetType:"Hotel",name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:24,stabilisationMonths:18,rooms:120,adr:180,occupancy:72,starRating:4,revparGrowthPct:2.5,roomsMarginPct:75,fnbEnabled:true,fnbRevenuePerOccRoom:45,fnbUtilisationPct:70,fnbMarginPct:30,spaEnabled:false,spaRevenuePerRoomPa:800,spaUtilisationPct:40,spaMarginPct:35,gymEnabled:false,gymMembershipRevPa:50000,gymGuestRevPerOccRoom:8,gymMarginPct:60,meetingEnabled:false,meetingRooms:4,meetingAvgDayRate:1200,meetingUtilisationPct:45,meetingMarginPct:40,exitCapRate:6.5,stabilisedCapRate:6.0,purchasePrice:18000000,capexBudget:5000000,professionalFeesPct:5,contingencyPct:8,otherCosts:200000,ltc:60,marginOverBenchmark:3.0,arrangementFeePct:1.5,tier1Hurdle:8,tier1DevShare:20,tier2Hurdle:14,tier2DevShare:30,tier3Hurdle:20,tier3DevShare:40,costProfile:"straight",sdltMode:"auto" as const,sdltTransactionType:"commercial" as const,sdltOverride:0,sdltSurcharge:false},
  Flip:{assetType:"Flip",name:"",location:"",currency:"GBP",benchmark:"SONIA",benchmarkRate:3.97,programmMonths:9,stabilisationMonths:0,purchasePrice:450000,refurbBudget:85000,salePrice:620000,agentFeePct:1.5,bridgingRatePct:0.85,bridgingTermMonths:9,arrangementFeePct:2.0,professionalFeesPct:2,contingencyPct:10,otherCosts:5000,costProfile:"straight",sdltMode:"auto" as const,sdltTransactionType:"residential" as const,sdltOverride:0,sdltSurcharge:false},
};
type AssetType="BTR"|"BTS"|"Hotel"|"Flip";
type BrochureContent={executiveSummary:string;dealStrengths:string;riskAssessment:string;marketComparables:string};

function SDLTBlock({data,set,r,currencySymbol}:{data:any;set:(f:string,v:any)=>void;r:any;currencySymbol:string}){
  return(<div className="inp-group" style={{gridColumn:"1 / -1"}}>
    <label className="inp-label">SDLT</label>
    <div style={{display:"flex",gap:8,marginBottom:8}}>
      <button onClick={()=>set("sdltMode","auto")} style={{padding:"4px 14px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"var(--font-body)",fontSize:12,fontWeight:600,background:data.sdltMode!=="manual"?"var(--gold)":"rgba(255,255,255,0.07)",color:data.sdltMode!=="manual"?"#06070a":"var(--text-m)"}}>Auto</button>
      <button onClick={()=>set("sdltMode","manual")} style={{padding:"4px 14px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"var(--font-body)",fontSize:12,fontWeight:600,background:data.sdltMode==="manual"?"var(--gold)":"rgba(255,255,255,0.07)",color:data.sdltMode==="manual"?"#06070a":"var(--text-m)"}}>Override</button>
    </div>
    {data.sdltMode!=="manual"&&(<div style={{display:"flex",flexDirection:"column",gap:8}}>
      <select className="inp" value={data.sdltTransactionType??"residential"} onChange={e=>set("sdltTransactionType",e.target.value)}>
        <option value="residential">Residential</option><option value="commercial">Commercial / Non-Residential</option>
        <option value="mixed">Mixed-Use</option><option value="spv">SPV Share Deal (Exempt)</option>
      </select>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <input type="checkbox" id="sdltSurcharge" checked={data.sdltSurcharge??true} onChange={e=>set("sdltSurcharge",e.target.checked)}/>
        <label htmlFor="sdltSurcharge" className="inp-label" style={{marginBottom:0,fontSize:12}}>+3% surcharge (additional dwelling / company purchase)</label>
      </div>
      <div className="inp" style={{color:"var(--gold)",cursor:"not-allowed"}}>
        {fmt(r.sdlt||0,currencySymbol)}
        {data.sdltTransactionType==="spv"&&<span style={{marginLeft:8,fontSize:11,color:"var(--green)",fontFamily:"var(--font-mono)"}}>EXEMPT</span>}
      </div>
    </div>)}
    {data.sdltMode==="manual"&&<input className="inp" type="number" placeholder="Enter SDLT amount" value={data.sdltOverride??0} onChange={e=>set("sdltOverride",+e.target.value)}/>}
  </div>);
}

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

/* ─── Plain PDF ─── */
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
  const W=210,M=20;let y=M;
  const gold=[201,168,76],dark=[6,7,10],grey=[125,133,144],white=[255,255,255],green=[61,220,132],red=[244,100,95];
  doc.setFillColor(...dark as [number,number,number]);doc.rect(0,0,210,297,"F");
  doc.setFillColor(...gold as [number,number,number]);doc.rect(0,0,210,2,"F");
  doc.setTextColor(...gold as [number,number,number]);doc.setFontSize(22);doc.setFont("helvetica","bold");doc.text("VALORA",M,y+8);
  doc.setTextColor(...grey as [number,number,number]);doc.setFontSize(8);doc.setFont("helvetica","normal");
  doc.text(`Generated ${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}`,W-M,y+8,{align:"right"});
  doc.text(userEmail||"",W-M,y+14,{align:"right"});y+=24;
  doc.setTextColor(...white as [number,number,number]);doc.setFontSize(20);doc.setFont("helvetica","bold");doc.text(data.name||"Untitled Appraisal",M,y);y+=8;
  doc.setFontSize(10);doc.setFont("helvetica","normal");doc.setTextColor(...grey as [number,number,number]);
  doc.text(`${data.location||"No location"} · ${assetType} · ${data.currency||"GBP"}`,M,y);y+=10;
  doc.setDrawColor(...gold as [number,number,number]);doc.setLineWidth(0.3);doc.line(M,y,W-M,y);y+=8;
  const r=results as any;
  const metrics=assetType==="BTR"?[{label:"GDV",value:fmt(r.gdv,currencySymbol)},{label:"Profit on Cost",value:fmtPct(r.poc)},{label:"IRR",value:fmtPct(r.irr)},{label:"Yield on Cost",value:fmtPct(r.yoc)}]:assetType==="BTS"?[{label:"GDV",value:fmt(r.gdv,currencySymbol)},{label:"Profit on Cost",value:fmtPct(r.poc)},{label:"IRR",value:fmtPct(r.irr)},{label:"Profit on GDV",value:fmtPct(r.margin)}]:assetType==="Hotel"?[{label:"Exit Value",value:fmt(r.exitValue,currencySymbol)},{label:"EBITDA pa",value:fmt(r.ebitda,currencySymbol)},{label:"IRR",value:fmtPct(r.irr)},{label:"Return on Cost",value:fmtPct(r.poc)}]:[{label:"Sale Price",value:fmt(r.salePrice,currencySymbol)},{label:"Profit",value:fmt(r.profit,currencySymbol)},{label:"ROI on Cost",value:fmtPct(r.roi)},{label:"IRR",value:fmtPct(r.irr)}];
  const boxW=(W-M*2-9)/4;
  metrics.forEach((m,i)=>{const x=M+i*(boxW+3);doc.setFillColor(18,21,26);doc.roundedRect(x,y,boxW,18,2,2,"F");doc.setTextColor(...grey as [number,number,number]);doc.setFontSize(7);doc.text(m.label.toUpperCase(),x+3,y+6);doc.setTextColor(...gold as [number,number,number]);doc.setFontSize(11);doc.setFont("helvetica","bold");doc.text(m.value,x+3,y+14);doc.setFont("helvetica","normal");});
  y+=26;
  const drawSection=(title:string,rows:[string,string,boolean?][],startY:number)=>{
    doc.setTextColor(...gold as [number,number,number]);doc.setFontSize(11);doc.setFont("helvetica","bold");doc.text(title,M,startY);
    doc.setLineWidth(0.2);doc.setDrawColor(...gold as [number,number,number]);doc.line(M,startY+2,W-M,startY+2);
    let ry=startY+8;
    rows.forEach(([label,value,isPositive],idx)=>{
      if(ry>270){doc.addPage();doc.setFillColor(...dark as [number,number,number]);doc.rect(0,0,210,297,"F");ry=20;}
      if(idx%2===0){doc.setFillColor(12,14,18);doc.rect(M,ry-4,W-M*2,7,"F");}
      doc.setTextColor(...grey as [number,number,number]);doc.setFontSize(9);doc.setFont("helvetica","normal");doc.text(label,M+2,ry);
      const col=isPositive===undefined?white:isPositive?green:red;
      doc.setTextColor(...col as [number,number,number]);doc.setFont("helvetica","bold");doc.text(value,W-M-2,ry,{align:"right"});doc.setFont("helvetica","normal");ry+=7;
    });
    return ry+4;
  };
  if(assetType==="BTR"){
    y=drawSection("Returns Summary",[["GDV (Exit)",fmt(r.gdv,currencySymbol)],["Gross NOI pa",fmt(r.noi,currencySymbol)],["Total Cost",fmt(r.totalCost,currencySymbol)],["Profit",fmt(r.profit,currencySymbol),r.profit>0],["Profit on Cost",fmtPct(r.poc),r.poc>0.1],["Yield on Cost",fmtPct(r.yoc)],["IRR (Unlevered)",fmtPct(r.irr)],["Residual Land Value",fmt(r.rlv,currencySymbol)]],y);
    y=drawSection("Cost Breakdown",[["Land / Acquisition",fmt(r.landCost,currencySymbol)],["SDLT",fmt(r.sdlt,currencySymbol)],["Build Cost",fmt(r.buildCost,currencySymbol)],["Finance Cost",fmt(r.totalFinanceCost,currencySymbol)],["Total Cost",fmt(r.totalCost,currencySymbol)]],y);
    if(data.units?.length)y=drawSection("Unit Mix",[...data.units.map((u:any)=>[u.type,`${u.count} units · ${currencySymbol}${u.rentPcm}pcm`] as [string,string])],y);
  }else if(assetType==="BTS"){
    y=drawSection("Returns Summary",[["GDV",fmt(r.gdv,currencySymbol)],["Total Units",r.totalUnits?.toString()||"—"],["Total Cost",fmt(r.totalCost,currencySymbol)],["Profit",fmt(r.profit,currencySymbol),r.profit>0],["Profit on Cost",fmtPct(r.poc),r.poc>0.1],["IRR (Unlevered)",fmtPct(r.irr)]],y);
    y=drawSection("Cost Breakdown",[["Land",fmt(r.landCost,currencySymbol)],["SDLT",fmt(r.sdlt,currencySymbol)],["Build Cost",fmt(r.buildCost,currencySymbol)],["Finance",fmt(r.totalFinanceCost,currencySymbol)],["Total",fmt(r.totalCost,currencySymbol)]],y);
  }else if(assetType==="Hotel"){
    y=drawSection("Returns Summary",[["RevPAR",fmt(r.revpar,currencySymbol)],["EBITDA pa",fmt(r.ebitda,currencySymbol)],["Exit Value",fmt(r.exitValue,currencySymbol)],["Total Investment",fmt(r.totalInvestment,currencySymbol)],["Profit",fmt(r.profit,currencySymbol),r.profit>0],["Return on Cost",fmtPct(r.poc),r.poc>0.1],["IRR",fmtPct(r.irr)]],y);
    y=drawSection("Cost Breakdown",[["Purchase",fmt(r.purchasePrice,currencySymbol)],["SDLT",fmt(r.sdlt,currencySymbol)],["CapEx",fmt(r.capex,currencySymbol)],["Finance",fmt(r.totalFinanceCost,currencySymbol)],["Total",fmt(r.totalInvestment,currencySymbol)]],y);
  }else{
    y=drawSection("Returns Summary",[["Purchase Price",fmt(r.purchase,currencySymbol)],["SDLT",fmt(r.sdlt,currencySymbol)],["Refurb",fmt(r.refurb,currencySymbol)],["Finance",fmt(r.totalFinanceCost,currencySymbol)],["Total Cost",fmt(r.totalCost,currencySymbol)],["Net Proceeds",fmt(r.netProceeds,currencySymbol)],["Profit",fmt(r.profit,currencySymbol),r.profit>0],["ROI",fmtPct(r.roi),r.roi>0.1],["IRR",fmtPct(r.irr)]],y);
  }
  y=drawSection("Project Details",[["Asset Type",assetType],["Location",data.location||"—"],["Currency",data.currency||"GBP"],["Programme",`${data.programmMonths} months`],["Benchmark",`${data.benchmark} + ${data.marginOverBenchmark}%`]],y);
  doc.setFillColor(...gold as [number,number,number]);doc.rect(0,292,210,5,"F");
  doc.setTextColor(...dark as [number,number,number]);doc.setFontSize(7);doc.setFont("helvetica","bold");
  doc.text("VALORA · Institutional Development Appraisal",M,296);doc.text(`Confidential · ${new Date().toLocaleDateString("en-GB")}`,W-M,296,{align:"right"});
  doc.save(`Valora_${(data.name||"Appraisal").replace(/\s+/g,"_")}_${new Date().toISOString().slice(0,10)}.pdf`);
}

/* ─── AI Brochure PDF ─── */
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

  /* PAGE 1 — Cover */
  doc.setFillColor(...dark as [number,number,number]);doc.rect(0,0,210,297,"F");
  // Gold left sidebar
  doc.setFillColor(...gold as [number,number,number]);doc.rect(0,0,4,297,"F");
  // Photos strip if provided
  if(photos.length>0){
    const phH=photos.length>=2?80:60;
    const phW=photos.length>=2?W/photos.length:W*0.6;
    photos.slice(0,3).forEach((ph,i)=>{
      try{doc.addImage(ph,"JPEG",i*phW,0,phW,phH);}catch(e){}
    });
    // Dark overlay on photo
    doc.setFillColor(6,7,10);doc.setGState(doc.GState({opacity:0.55}));
    doc.rect(0,0,W,photos.length>0?80:0,"F");
    doc.setGState(doc.GState({opacity:1}));
  }
  // VALORA mark
  doc.setTextColor(...gold as [number,number,number]);doc.setFontSize(10);doc.setFont("helvetica","bold");
  doc.text("VALORA",M,photos.length>0?20:16);
  doc.setFontSize(7);doc.setFont("helvetica","normal");doc.setTextColor(...grey as [number,number,number]);
  doc.text("INVESTMENT MEMORANDUM",M,photos.length>0?26:22);

  const titleY=photos.length>0?95:50;
  doc.setTextColor(...white as [number,number,number]);doc.setFontSize(28);doc.setFont("helvetica","bold");
  const titleLines=doc.splitTextToSize(data.name||"Investment Opportunity",W-M*2);
  doc.text(titleLines,M,titleY);
  doc.setFontSize(12);doc.setFont("helvetica","normal");doc.setTextColor(...gold as [number,number,number]);
  doc.text(`${data.location||""}  ·  ${assetType}`,M,titleY+titleLines.length*10+4);

  // Key metrics on cover
  const metricsY=titleY+titleLines.length*10+20;
  const metrics=assetType==="BTR"?[["GDV",fmt(r.gdv,currencySymbol)],["Profit on Cost",fmtPct(r.poc)],["IRR",fmtPct(r.irr)],["Yield on Cost",fmtPct(r.yoc)]]:assetType==="BTS"?[["GDV",fmt(r.gdv,currencySymbol)],["Profit on Cost",fmtPct(r.poc)],["IRR",fmtPct(r.irr)],["Profit on GDV",fmtPct(r.margin)]]:assetType==="Hotel"?[["Exit Value",fmt(r.exitValue,currencySymbol)],["EBITDA pa",fmt(r.ebitda,currencySymbol)],["IRR",fmtPct(r.irr)],["Return on Cost",fmtPct(r.poc)]]:[["Sale Price",fmt(r.salePrice,currencySymbol)],["Profit",fmt(r.profit,currencySymbol)],["ROI",fmtPct(r.roi)],["IRR",fmtPct(r.irr)]];
  const mW=(W-M*2-12)/4;
  metrics.forEach(([l,v],i)=>{
    const x=M+i*(mW+4);
    doc.setFillColor(...bg2 as [number,number,number]);doc.roundedRect(x,metricsY,mW,20,2,2,"F");
    doc.setDrawColor(...gold as [number,number,number]);doc.setLineWidth(0.5);doc.roundedRect(x,metricsY,mW,20,2,2,"S");
    doc.setTextColor(...grey as [number,number,number]);doc.setFontSize(6.5);doc.setFont("helvetica","normal");doc.text(String(l).toUpperCase(),x+3,metricsY+7);
    doc.setTextColor(...gold as [number,number,number]);doc.setFontSize(11);doc.setFont("helvetica","bold");doc.text(String(v),x+3,metricsY+16);
  });

  // Gold footer bar cover
  doc.setFillColor(...gold as [number,number,number]);doc.rect(0,291,W,6,"F");
  doc.setTextColor(...dark as [number,number,number]);doc.setFontSize(7);doc.setFont("helvetica","bold");
  doc.text("STRICTLY PRIVATE & CONFIDENTIAL",M,295.5);
  doc.text(new Date().toLocaleDateString("en-GB",{month:"long",year:"numeric"}),W-M,295.5,{align:"right"});

  /* PAGE 2 — AI Content */
  doc.addPage();
  doc.setFillColor(...dark as [number,number,number]);doc.rect(0,0,210,297,"F");
  doc.setFillColor(...gold as [number,number,number]);doc.rect(0,0,4,297,"F");

  const wrapText=(doc:any,text:string,x:number,startY:number,maxW:number,lineH:number)=>{
    const lines=doc.splitTextToSize(text,maxW);
    lines.forEach((line:string,i:number)=>{
      if(startY+i*lineH>278){doc.addPage();doc.setFillColor(...dark as [number,number,number]);doc.rect(0,0,210,297,"F");doc.setFillColor(...gold as [number,number,number]);doc.rect(0,0,4,297,"F");startY=20-i*lineH;}
      doc.text(line,x,startY+i*lineH);
    });
    return startY+lines.length*lineH+4;
  };

  let py=20;
  // Page header
  doc.setTextColor(...gold as [number,number,number]);doc.setFontSize(9);doc.setFont("helvetica","bold");doc.text("VALORA",M,py);
  doc.setTextColor(...grey as [number,number,number]);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text(data.name||"",W-M,py,{align:"right"});
  py+=10;

  const sections:[string,keyof BrochureContent][]=[
    ["Executive Summary","executiveSummary"],
    ["Deal Strengths","dealStrengths"],
    ["Risk Assessment","riskAssessment"],
    ["Market Comparables","marketComparables"],
  ];

  sections.forEach(([title,key])=>{
    if(py>260){doc.addPage();doc.setFillColor(...dark as [number,number,number]);doc.rect(0,0,210,297,"F");doc.setFillColor(...gold as [number,number,number]);doc.rect(0,0,4,297,"F");py=20;}
    doc.setTextColor(...gold as [number,number,number]);doc.setFontSize(11);doc.setFont("helvetica","bold");doc.text(title,M,py);
    doc.setLineWidth(0.2);doc.setDrawColor(...gold as [number,number,number]);doc.line(M,py+2,W-M,py+2);py+=9;
    doc.setTextColor(...white as [number,number,number]);doc.setFontSize(9);doc.setFont("helvetica","normal");
    py=wrapText(doc,content[key]||"",M,py,W-M*2,5);
    py+=6;
  });

  // Returns table on last section
  if(py<240){
    doc.setTextColor(...gold as [number,number,number]);doc.setFontSize(11);doc.setFont("helvetica","bold");doc.text("Financial Summary",M,py);
    doc.setLineWidth(0.2);doc.line(M,py+2,W-M,py+2);py+=9;
    const rows=assetType==="BTR"?[["GDV (Exit)",fmt(r.gdv,currencySymbol)],["Total Cost",fmt(r.totalCost,currencySymbol)],["Profit",fmt(r.profit,currencySymbol)],["Profit on Cost",fmtPct(r.poc)],["IRR",fmtPct(r.irr)]]:assetType==="BTS"?[["GDV",fmt(r.gdv,currencySymbol)],["Profit",fmt(r.profit,currencySymbol)],["Profit on Cost",fmtPct(r.poc)],["IRR",fmtPct(r.irr)]]:assetType==="Hotel"?[["Exit Value",fmt(r.exitValue,currencySymbol)],["EBITDA pa",fmt(r.ebitda,currencySymbol)],["Profit",fmt(r.profit,currencySymbol)],["IRR",fmtPct(r.irr)]]:[["Sale Price",fmt(r.salePrice,currencySymbol)],["Profit",fmt(r.profit,currencySymbol)],["ROI",fmtPct(r.roi)],["IRR",fmtPct(r.irr)]];
    rows.forEach(([l,v],i)=>{
      if(i%2===0){doc.setFillColor(12,14,18);doc.rect(M,py-4,W-M*2,7,"F");}
      doc.setTextColor(...grey as [number,number,number]);doc.setFontSize(9);doc.setFont("helvetica","normal");doc.text(String(l),M+2,py);
      doc.setTextColor(...gold as [number,number,number]);doc.setFont("helvetica","bold");doc.text(String(v),W-M-2,py,{align:"right"});doc.setFont("helvetica","normal");py+=7;
    });
  }

  // Footer
  doc.setFillColor(...gold as [number,number,number]);doc.rect(0,291,W,6,"F");
  doc.setTextColor(...dark as [number,number,number]);doc.setFontSize(7);doc.setFont("helvetica","bold");
  doc.text("VALORA · Institutional Development Appraisal",M,295.5);
  doc.text(`Confidential · ${new Date().toLocaleDateString("en-GB")}`,W-M,295.5,{align:"right"});

  doc.save(`Valora_Brochure_${(data.name||"Deal").replace(/\s+/g,"_")}_${new Date().toISOString().slice(0,10)}.pdf`);
}

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
  // Delete
  const[deleteModal,setDeleteModal]=useState(false);
  const[deleting,setDeleting]=useState(false);
  // AI Brochure
  const[brochureModal,setBrochureModal]=useState(false);
  const[brochurePhotos,setBrochurePhotos]=useState<string[]>([]);
  const[brochureContent,setBrochureContent]=useState<BrochureContent|null>(null);
  const[generatingBrochure,setGeneratingBrochure]=useState(false);
  const[brochureError,setBrochureError]=useState<string|null>(null);
  const[downloadingBrochure,setDownloadingBrochure]=useState(false);

  useEffect(()=>{
    const init=async()=>{
      const{data:{session}}=await supabase.auth.getSession();
      if(!session){router.push("/");return;}
      setUser(session.user);
    };
    init();
  },[router]);

  useEffect(()=>{
    if(!appraisalParam||!user)return;
    const load=async()=>{
      setLoading(true);
      const{data:appr}=await supabase.from("appraisals").select("*").eq("id",appraisalParam).single();
      if(appr){
        setAppraisalId(appr.id);
        setCurrentProjectId(appr.project_id);
        if(appr.snapshot){
          const snap=appr.snapshot;
          const type=(snap.assetType||"BTR") as AssetType;
          setAssetType(type);setData(snap);setSaved(true);
        }
        if(appr.share_token)setLiveLink(`${window.location.origin}/share/${appr.share_token}`);
      }
      setLoading(false);
    };
    load();
  },[appraisalParam,user]);

  const set=useCallback((field:string,value:any)=>{
    setData((prev:any)=>({...prev,[field]:value}));
    setSaved(false);setSaveError(null);
  },[]);

  const switchAssetType=(type:AssetType)=>{
    setAssetType(type);setData({...DEFAULTS[type]});setActiveTab("general");setSaved(false);setSaveError(null);
  };
  const updateUnit=(index:number,field:string,value:any)=>{
    const units=[...data.units];units[index]={...units[index],[field]:value};set("units",units);
  };
  const addUnit=()=>{
    const units=[...(data.units||[])];
    units.push(assetType==="BTS"?{type:"New Type",count:10,salePricePsf:800,size:700}:{type:"New Type",count:10,rentPcm:2000,size:700});
    set("units",units);
  };
  const removeUnit=(i:number)=>{set("units",data.units.filter((_:any,idx:number)=>idx!==i));};

  const calcHotelRev=useCallback((d:any)=>{
    const rooms=num(String(d.rooms));const occRoomNights=rooms*365*(num(String(d.occupancy))/100);
    const roomsRev=num(String(d.adr))*occRoomNights;const roomsEbitda=roomsRev*(num(String(d.roomsMarginPct??75))/100);
    const fnbRev=d.fnbEnabled?num(String(d.fnbRevenuePerOccRoom??45))*occRoomNights*(num(String(d.fnbUtilisationPct??70))/100):0;const fnbEbitda=fnbRev*(num(String(d.fnbMarginPct??30))/100);
    const spaRev=d.spaEnabled?num(String(d.spaRevenuePerRoomPa??800))*rooms*(num(String(d.spaUtilisationPct??40))/100):0;const spaEbitda=spaRev*(num(String(d.spaMarginPct??35))/100);
    const gymRev=d.gymEnabled?num(String(d.gymMembershipRevPa??50000))+num(String(d.gymGuestRevPerOccRoom??8))*occRoomNights:0;const gymEbitda=gymRev*(num(String(d.gymMarginPct??60))/100);
    const meetingRev=d.meetingEnabled?num(String(d.meetingRooms??4))*num(String(d.meetingAvgDayRate??1200))*365*(num(String(d.meetingUtilisationPct??45))/100):0;const meetingEbitda=meetingRev*(num(String(d.meetingMarginPct??40))/100);
    const totalRev=roomsRev+fnbRev+spaRev+gymRev+meetingRev;const totalEbitda=roomsEbitda+fnbEbitda+spaEbitda+gymEbitda+meetingEbitda;
    return{roomsRev,roomsEbitda,fnbRev,fnbEbitda,spaRev,spaEbitda,gymRev,gymEbitda,meetingRev,meetingEbitda,totalRev,totalEbitda};
  },[]);

  const calc=useCallback(()=>{
    if(assetType==="BTR"){
      const units=data.units||[];
      const totalUnits=units.reduce((s:number,u:any)=>s+(num(String(u.count))||0),0);
      const totalSqft=units.reduce((s:number,u:any)=>s+(num(String(u.count))*num(String(u.size))),0);
      const grossRentPa=units.reduce((s:number,u:any)=>s+(num(String(u.count))*num(String(u.rentPcm))*12),0);
      const voidAdjustment=1-(num(String(data.voidPct))/100);const opexPa=totalSqft*num(String(data.opexPsf));
      const noi=grossRentPa*voidAdjustment-opexPa;const gdv=noi/(num(String(data.exitYield))/100);
      const landCost=num(String(data.landCost));const sdlt=calcSDLT(landCost,data.sdltMode??"auto",data.sdltTransactionType??"residential",data.sdltOverride??0,data.sdltSurcharge??true);
      const buildCost=totalSqft*num(String(data.buildCostPsf));const profFees=buildCost*(num(String(data.professionalFeesPct))/100);const contingency=buildCost*(num(String(data.contingencyPct))/100);const otherCosts=num(String(data.otherCosts));const devCost=buildCost+profFees+contingency+otherCosts;
      const financeRate=(num(String(data.benchmarkRate))+num(String(data.marginOverBenchmark)))/100;const loanAmount=(landCost+devCost)*(num(String(data.ltc))/100);
      const arrangementFee=loanAmount*(num(String(data.arrangementFeePct))/100);const interestEst=loanAmount*financeRate*(num(String(data.programmMonths))/12)*0.6;const totalFinanceCost=arrangementFee+interestEst;
      const totalCost=landCost+sdlt+devCost+totalFinanceCost;const profit=gdv-totalCost;const poc=totalCost>0?profit/totalCost:0;const yoc=totalSqft>0?noi/totalCost:0;
      const buildMonths=num(String(data.programmMonths));
      const stabMonths=num(String(data.stabilisationMonths));
      const totalMonths=Math.round(buildMonths+stabMonths);
      // Unlevered: lump cost at 0, exit at end
      const uCfs:number[]=Array(totalMonths).fill(0);
      uCfs[0]=-totalCost;
      uCfs[totalMonths-1]+=gdv;
      const irr=Math.pow(1+calcIRR(uCfs),12)-1;
      // Levered: equity at 0, exit proceeds minus loan at end
      const equity=totalCost-loanAmount;
      const equityRatio=totalCost>0?equity/totalCost:1;
      const lCfs:number[]=Array(totalMonths).fill(0);
      lCfs[0]=-equity;
      lCfs[totalMonths-1]+=gdv-loanAmount;
      const irrLevered=equity>0?Math.pow(1+calcIRR(lCfs),12)-1:0;
      // RLV — what you can afford to pay for the land given target return
      const targetReturn=0.20;
      const rlv=gdv/(1+targetReturn)-devCost-totalFinanceCost-sdlt;
      return{gdv,noi,grossRentPa,totalSqft,totalUnits,landCost,sdlt,buildCost,devCost,totalFinanceCost,totalCost,profit,poc,yoc,irr,irrLevered,rlv,financeRate,loanAmount};
    }
    if(assetType==="BTS"){
      const units=data.units||[];const gdv=units.reduce((s:number,u:any)=>s+(num(String(u.count))*num(String(u.size))*num(String(u.salePricePsf))),0);const totalSqft=units.reduce((s:number,u:any)=>s+(num(String(u.count))*num(String(u.size))),0);const totalUnits=units.reduce((s:number,u:any)=>s+num(String(u.count)),0);
      const agentFees=gdv*(num(String(data.agentFeePct))/100);const marketing=gdv*(num(String(data.marketingPct))/100);const landCost=num(String(data.landCost));const sdlt=calcSDLT(landCost,data.sdltMode??"auto",data.sdltTransactionType??"residential",data.sdltOverride??0,data.sdltSurcharge??true);
      const buildCost=totalSqft*num(String(data.buildCostPsf));const profFees=buildCost*(num(String(data.professionalFeesPct))/100);const contingency=buildCost*(num(String(data.contingencyPct))/100);const otherCosts=num(String(data.otherCosts));const devCost=buildCost+profFees+contingency+otherCosts+agentFees+marketing;
      const financeRate=(num(String(data.benchmarkRate))+num(String(data.marginOverBenchmark)))/100;const loanAmount=(landCost+devCost)*(num(String(data.ltc))/100);const arrangementFee=loanAmount*(num(String(data.arrangementFeePct))/100);const interestEst=loanAmount*financeRate*(num(String(data.programmMonths))/12)*0.5;const totalFinanceCost=arrangementFee+interestEst;
      const totalCost=landCost+sdlt+devCost+totalFinanceCost;const profit=gdv-totalCost;const poc=totalCost>0?profit/totalCost:0;const margin=gdv>0?profit/gdv:0;
      const buildMonths=Math.round(num(String(data.programmMonths)));
      const absMonths=Math.max(1,Math.round(num(String(data.absorptionMonths))));
      const totalMonths=buildMonths+absMonths;
      // Unlevered: pay total cost at month 0, receive GDV spread over absorption
      const salesPm=gdv/absMonths;
      const cfs:number[]=Array(totalMonths).fill(0);
      cfs[0]=-totalCost;
      for(let m=buildMonths;m<totalMonths;m++)cfs[m]+=salesPm;
      const irr=Math.pow(1+calcIRR(cfs),12)-1;
      // Levered: pay equity at month 0, receive GDV spread over absorption minus loan repay at end
      const equity=totalCost-loanAmount;
      const lCfs:number[]=Array(totalMonths).fill(0);
      lCfs[0]=-equity;
      for(let m=buildMonths;m<totalMonths-1;m++)lCfs[m]+=salesPm;
      lCfs[totalMonths-1]+=salesPm-loanAmount; // repay loan on last sale month
      const irrLevered=equity>0?Math.pow(1+calcIRR(lCfs),12)-1:0;
      return{gdv,totalSqft,totalUnits,landCost,sdlt,buildCost,devCost,totalFinanceCost,totalCost,profit,poc,margin,irr,irrLevered,loanAmount,financeRate};
    }
    if(assetType==="Hotel"){
      const hr=calcHotelRev(data);const revpar=num(String(data.adr))*(num(String(data.occupancy))/100);const revenuePa=hr.totalRev;const ebitda=hr.totalEbitda;
      const stabilisedValue=ebitda/(num(String(data.stabilisedCapRate))/100);const exitValue=ebitda*(1+num(String(data.revparGrowthPct))/100)/(num(String(data.exitCapRate))/100);
      const purchasePrice=num(String(data.purchasePrice));const sdlt=calcSDLT(purchasePrice,data.sdltMode??"auto",data.sdltTransactionType??"commercial",data.sdltOverride??0,data.sdltSurcharge??false);
      const capex=num(String(data.capexBudget));const profFees=capex*(num(String(data.professionalFeesPct))/100);const contingency=capex*(num(String(data.contingencyPct))/100);const totalCost=purchasePrice+sdlt+capex+profFees+contingency+num(String(data.otherCosts));
      const financeRate=(num(String(data.benchmarkRate))+num(String(data.marginOverBenchmark)))/100;const loanAmount=totalCost*(num(String(data.ltc))/100);const interestEst=loanAmount*financeRate*(num(String(data.programmMonths))/12)*0.5;const arrangementFee=loanAmount*(num(String(data.arrangementFeePct))/100);const totalFinanceCost=interestEst+arrangementFee;
      const totalInvestment=totalCost+totalFinanceCost;const profit=exitValue-totalInvestment;const poc=totalInvestment>0?profit/totalInvestment:0;const yoc=totalInvestment>0?ebitda/totalInvestment:0;
      const totalMonths=Math.round(num(String(data.programmMonths))+num(String(data.stabilisationMonths)));
      const buildMo=Math.round(num(String(data.programmMonths)));
      const uCfs:number[]=[];
      for(let m=0;m<totalMonths;m++){uCfs.push(m<buildMo?-totalInvestment/buildMo:(m===totalMonths-1?exitValue:0));}
      const irr=Math.pow(1+calcIRR(uCfs),12)-1;
      const equity=totalInvestment-loanAmount;
      const eqRatio=totalInvestment>0?equity/totalInvestment:1;
      const lCfs:number[]=[];
      for(let m=0;m<totalMonths;m++){lCfs.push(m<buildMo?-(totalInvestment/buildMo)*eqRatio:(m===totalMonths-1?exitValue-loanAmount:0));}
      const irrLevered=equity>0?Math.pow(1+calcIRR(lCfs),12)-1:0;
      return{revpar,revenuePa,ebitda,stabilisedValue,exitValue,purchasePrice,sdlt,capex,totalCost,totalFinanceCost,totalInvestment,profit,poc,yoc,irr,irrLevered,loanAmount};
    }
    if(assetType==="Flip"){
      const purchase=num(String(data.purchasePrice));const sdlt=calcSDLT(purchase,data.sdltMode??"auto",data.sdltTransactionType??"residential",data.sdltOverride??0,data.sdltSurcharge??false);
      const refurb=num(String(data.refurbBudget));const profFees=refurb*(num(String(data.professionalFeesPct))/100);const contingency=refurb*(num(String(data.contingencyPct))/100);const other=num(String(data.otherCosts));
      const bridgingRate=num(String(data.bridgingRatePct))/100/12;const bridgingMonths=num(String(data.bridgingTermMonths));const loanAmount=(purchase+refurb)*0.75;
      const bridgingInterest=loanAmount*bridgingRate*bridgingMonths;const arrangementFee=loanAmount*(num(String(data.arrangementFeePct))/100);const totalFinanceCost=bridgingInterest+arrangementFee;
      const totalCost=purchase+sdlt+refurb+profFees+contingency+other+totalFinanceCost;const salePrice=num(String(data.salePrice));const agentFees=salePrice*(num(String(data.agentFeePct))/100);const netProceeds=salePrice-agentFees;
      const profit=netProceeds-totalCost;const roi=totalCost>0?profit/totalCost:0;const roiEquity=(totalCost-loanAmount)>0?profit/(totalCost-loanAmount):0;
      const cfs=[-totalCost,...Array(bridgingMonths-1).fill(0),netProceeds];const irr=Math.pow(1+calcIRR(cfs),12)-1;
      return{purchase,sdlt,refurb,profFees,contingency,totalFinanceCost,totalCost,salePrice,agentFees,netProceeds,profit,roi,roiEquity,irr,loanAmount,bridgingInterest};
    }
    return{};
  },[assetType,data,calcHotelRev]);

  const results=calc();
  const hotelRev=assetType==="Hotel"?calcHotelRev(data):null;

  const sensitivity=useCallback(()=>{
    if(assetType!=="BTR")return null;
    const yields=[-0.5,-0.25,0,0.25,0.5].map(d=>num(String(data.exitYield))+d);
    const rents=[-200,-100,0,100,200].map(d=>1+d/(data.units?.[0]?.rentPcm||2000));
    return yields.map(y=>rents.map(rf=>{
      const units=data.units||[];
      const grossRent=units.reduce((s:number,u:any)=>s+num(String(u.count))*num(String(u.rentPcm))*rf*12,0);
      const voidAdj=1-(num(String(data.voidPct))/100);
      const totalSqft=units.reduce((s:number,u:any)=>s+num(String(u.count))*num(String(u.size)),0);
      const noi=grossRent*voidAdj-totalSqft*num(String(data.opexPsf));
      const gdv=noi/(y/100);const r=calc();
      return r.totalCost>0?(gdv-r.totalCost)/r.totalCost:0;
    }));
  },[assetType,data,calc]);
  const sensMatrix=sensitivity();

  /* ─── SAVE ─── */
  const save=async()=>{
    if(!user){setSaveError("Not logged in");return;}
    setSaving(true);setSaveError(null);
    const r=results as any;
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
        profit_on_cost:r.poc||r.roi||0,irr_unlevered:r.irr||0,programme_months:num(String(data.programmMonths)),firm_id:null,
        snapshot:{...data,assetType},
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

  /* ─── DELETE ─── */
  const deleteAppraisal=async()=>{
    if(!appraisalId||!user)return;
    setDeleting(true);
    const{error}=await supabase.from("appraisals").delete().eq("id",appraisalId);
    if(!error){router.push("/dashboard");}
    else{setSaveError("Delete failed");setDeleting(false);setDeleteModal(false);}
  };

  /* ─── LIVE LINK ─── */
  const generateLiveLink=async()=>{
    if(!appraisalId){setSaveError("Save the appraisal first");return;}
    setGeneratingLink(true);
    const token=Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);
    await supabase.from("appraisals").update({share_token:token}).eq("id",appraisalId);
    const link=`${window.location.origin}/share/${token}`;
    setLiveLink(link);setGeneratingLink(false);
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

  /* ─── AI BROCHURE ─── */
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
    const r=results as any;
    const currSym={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";
    const dealSummary=`
Asset Type: ${assetType}
Project Name: ${data.name||"Unnamed"}
Location: ${data.location||"Not specified"}
Currency: ${data.currency||"GBP"}
Programme: ${data.programmMonths} months

Key Financials:
- GDV / Exit Value: ${fmt(r.gdv||r.exitValue||r.salePrice||0,currSym)}
- Total Cost / Investment: ${fmt(r.totalCost||r.totalInvestment||0,currSym)}
- Profit: ${fmt(r.profit||0,currSym)}
- Profit on Cost: ${fmtPct(r.poc||r.roi||0)}
- IRR: ${fmtPct(r.irr||0)}
${assetType==="BTR"?`- Exit Yield: ${data.exitYield}%\n- Gross NOI pa: ${fmt(r.noi,currSym)}\n- Total Units: ${r.totalUnits}`:``}
${assetType==="Hotel"?`- RevPAR: ${fmt(r.revpar,currSym)}\n- EBITDA pa: ${fmt(r.ebitda,currSym)}\n- Rooms: ${data.rooms}`:``}
${assetType==="Flip"?`- Purchase Price: ${fmt(r.purchase,currSym)}\n- Sale Price: ${fmt(r.salePrice,currSym)}`:``}

Finance: LTC ${data.ltc||"N/A"}%, All-in rate ${r.financeRate?(r.financeRate*100).toFixed(2)+"%" :"N/A"}
`.trim();

    try{
      const response=await fetch("/api/brochure",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({dealSummary}),
      });
      const parsed=await response.json();
      if(parsed.error)throw new Error(parsed.error);
      setBrochureContent(parsed);
    }catch(err:any){
      setBrochureError("Failed to generate — check your connection and try again.");
      console.error("Brochure AI error:",err);
    }
    setGeneratingBrochure(false);
  };

  const handleDownloadBrochure=async()=>{
    if(!brochureContent)return;
    setDownloadingBrochure(true);
    try{
      const currSym={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";
      await generateBrochurePDF(data,results,assetType,currSym,brochureContent,brochurePhotos);
    }catch(e){console.error("Brochure PDF error:",e);}
    setDownloadingBrochure(false);
  };

  const TABS_BTR=["general","revenue","costs","finance","cashflow","analysis"];
  const TABS_BTS=["general","revenue","costs","finance","analysis"];
  const TABS_HOTEL=["general","revenue","costs","finance","analysis"];
  const TABS_FLIP=["general","costs","finance","analysis"];
  const TABS=assetType==="BTR"?TABS_BTR:assetType==="BTS"?TABS_BTS:assetType==="Hotel"?TABS_HOTEL:TABS_FLIP;
  const TAB_LABELS:Record<string,string>={general:"General",revenue:"Revenue",costs:"Costs",finance:"Finance",cashflow:"Cash Flow",analysis:"Analysis"};
  const currencies=["GBP","USD","EUR","AED","SGD","AUD","JPY","CHF","CAD","HKD"];
  const benchmarks=["SONIA","SOFR","EURIBOR","EIBOR","SORA","AONIA","TONA","SARON","CORRA","HONIA"];
  const currencySymbol={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[data.currency]||"£";
  const r=results as any;

  if(loading)return(
    <div style={{minHeight:"100vh",background:"#06070a",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:32,height:32,border:"2px solid rgba(201,168,76,.2)",borderTopColor:"#c9a84c",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"var(--font-body)"}}>
      <style>{CSS}</style>

      {/* Nav */}
      <div style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"0 24px",height:56,display:"flex",alignItems:"center",gap:16}}>
        <button onClick={()=>router.push("/dashboard")} style={{background:"none",border:"none",color:"var(--gold)",fontFamily:"var(--font-display)",fontSize:20,fontWeight:300,cursor:"pointer",letterSpacing:".1em"}}>VALORA</button>
        <div style={{width:1,height:18,background:"var(--border)"}}/>
        <button onClick={()=>router.push("/dashboard")} className="btn-ghost" style={{padding:"5px 12px",fontSize:11}}>Dashboard</button>
        <div style={{flex:1}}/>
        <div className="save-indicator">
          {saving&&<span style={{width:12,height:12,border:"1.5px solid var(--gold)",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>}
          {saved&&!saving&&<><span style={{color:"var(--green)",fontSize:12}}>✓</span><span>Saved</span></>}
          {saveError&&!saving&&<span style={{color:"var(--red)",fontSize:11}}>{saveError}</span>}
          {!saved&&!saving&&!saveError&&<span style={{animation:"pulse 2s infinite"}}>Unsaved changes</span>}
        </div>
        {appraisalId&&saved&&(
          <button className="btn-danger" onClick={()=>setDeleteModal(true)}>Delete</button>
        )}
        <button className="btn-primary" onClick={save} disabled={saving} style={{padding:"8px 18px",fontSize:12}}>{saving?"Saving…":"Save Appraisal"}</button>
      </div>

      {/* Asset switcher */}
      <div style={{background:"var(--bg2)",borderBottom:"1px solid var(--border)",padding:"0 24px",display:"flex",alignItems:"center",gap:8,height:46}}>
        <span style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".1em",marginRight:8}}>Asset Type:</span>
        {(["BTR","BTS","Hotel","Flip"] as AssetType[]).map(t=>(
          <button key={t} onClick={()=>switchAssetType(t)} style={{padding:"5px 14px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:"1px solid",background:assetType===t?"rgba(201,168,76,.12)":"transparent",borderColor:assetType===t?"var(--gold)":"var(--border)",color:assetType===t?"var(--gold)":"var(--text-d)",fontFamily:"var(--font-body)",transition:"all .2s"}}>{t}</button>
        ))}
        <div style={{flex:1}}/>
        <input className="inp" value={data.name} onChange={e=>set("name",e.target.value)} placeholder="Appraisal name…" style={{width:240,padding:"6px 12px",fontSize:13}}/>
      </div>

      <div className="editor-layout" style={{display:"grid",gridTemplateColumns:"1fr 320px",minHeight:"calc(100vh - 102px)"}}>
        <div style={{borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column"}}>
          <div style={{background:"var(--bg2)",borderBottom:"1px solid var(--border)",display:"flex",overflowX:"auto",padding:"0 16px"}}>
            {TABS.map(t=><button key={t} className={`tab ${activeTab===t?"active":""}`} onClick={()=>setActiveTab(t)}>{TAB_LABELS[t]}</button>)}
          </div>
          <div style={{padding:24,overflowY:"auto",flex:1}}>

            {/* GENERAL */}
            {activeTab==="general"&&(
              <div>
                <div className="section-title">Project Details</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Project Name</label><input className="inp" value={data.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Chiswick Tower"/></div>
                  <div className="inp-group"><label className="inp-label">Location</label><input className="inp" value={data.location} onChange={e=>set("location",e.target.value)} placeholder="e.g. Hammersmith, London"/></div>
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
              </div>
            )}

            {/* REVENUE BTR */}
            {activeTab==="revenue"&&assetType==="BTR"&&(
              <div>
                <div className="section-title">Unit Mix & Rents</div>
                <div className="unit-row" style={{borderBottom:"1px solid var(--gold)44"}}>
                  {["Unit Type","Count","Rent (pcm)","Size (sqft)","Gross Pa",""].map((h,i)=><div key={i} style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".07em"}}>{h}</div>)}
                </div>
                {(data.units||[]).map((u:any,i:number)=>{
                  const grossPa=num(String(u.count))*num(String(u.rentPcm))*12;
                  return(<div key={i} className="unit-row">
                    <input className="inp" value={u.type} onChange={e=>updateUnit(i,"type",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <input className="inp" type="number" value={u.count} onChange={e=>updateUnit(i,"count",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <input className="inp" type="number" value={u.rentPcm} onChange={e=>updateUnit(i,"rentPcm",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <input className="inp" type="number" value={u.size} onChange={e=>updateUnit(i,"size",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-m)"}}>{fmt(grossPa,currencySymbol)}</div>
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
                  {["Unit Type","Count","Price (psf)","Size (sqft)","Revenue",""].map((h,i)=><div key={i} style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".07em"}}>{h}</div>)}
                </div>
                {(data.units||[]).map((u:any,i:number)=>{
                  const rev=num(String(u.count))*num(String(u.size))*num(String(u.salePricePsf));
                  return(<div key={i} className="unit-row">
                    <input className="inp" value={u.type} onChange={e=>updateUnit(i,"type",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <input className="inp" type="number" value={u.count} onChange={e=>updateUnit(i,"count",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <input className="inp" type="number" value={u.salePricePsf} onChange={e=>updateUnit(i,"salePricePsf",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <input className="inp" type="number" value={u.size} onChange={e=>updateUnit(i,"size",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-m)"}}>{fmt(rev,currencySymbol)}</div>
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
                <div className="section-title" style={{marginTop:24}}>CapEx & Costs</div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">CapEx Budget ({currencySymbol})</label><input className="inp" type="number" value={data.capexBudget} onChange={e=>set("capexBudget",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Other Costs ({currencySymbol})</label><input className="inp" type="number" value={data.otherCosts} onChange={e=>set("otherCosts",e.target.value)}/></div>
                </div>
                <div className="inp-row">
                  <div className="inp-group"><label className="inp-label">Professional Fees (%)</label><input className="inp" type="number" step="0.5" value={data.professionalFeesPct} onChange={e=>set("professionalFeesPct",e.target.value)}/></div>
                  <div className="inp-group"><label className="inp-label">Contingency (%)</label><input className="inp" type="number" step="0.5" value={data.contingencyPct} onChange={e=>set("contingencyPct",e.target.value)}/></div>
                </div>
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
                    <div className="inp-group"><label className="inp-label">Loan Amount (auto)</label><div className="inp" style={{color:"var(--amber)",cursor:"not-allowed"}}>{fmt(r.loanAmount||0,currencySymbol)}</div></div>
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
                {assetType!=="Flip"&&(
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
                          <span>Developer: {data[`tier${tier}DevShare`]}%</span>
                          <span>Investor: {100-data[`tier${tier}DevShare`]}%</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* CASHFLOW BTR */}
            {activeTab==="cashflow"&&assetType==="BTR"&&(
              <div>
                <div className="section-title">Monthly Cash Flow (Indicative)</div>
                <div style={{fontSize:12,color:"var(--text-d)",marginBottom:16}}>{data.costProfile==="scurve"?"S-Curve":data.costProfile==="frontloaded"?"Front-Loaded":"Straight-Line"} cost profile · {data.programmMonths} month programme</div>
                <div style={{overflowX:"auto"}}>
                  <div className="cf-row" style={{marginBottom:8}}>
                    {["Month","Cost Draw","Cum. Draw","Interest","Net CF","Cum. Cost","% Complete"].map(h=><div key={h} className="cf-header">{h}</div>)}
                  </div>
                  {Array.from({length:Math.min(num(String(data.programmMonths)),36)},(_,m)=>{
                    const months=num(String(data.programmMonths));const totalCost=r.buildCost||0;
                    let pct=0;
                    if(data.costProfile==="scurve")pct=1/(1+Math.exp(-10*((m+1)/months-0.5)));
                    else if(data.costProfile==="frontloaded")pct=Math.sqrt((m+1)/months);
                    else pct=(m+1)/months;
                    const prevPct=m===0?0:(data.costProfile==="scurve"?1/(1+Math.exp(-10*(m/months-0.5))):data.costProfile==="frontloaded"?Math.sqrt(m/months):m/months);
                    const draw=totalCost*(pct-prevPct);const cumDraw=totalCost*pct;
                    const interest=cumDraw*((r.financeRate||0)/12);const netCf=-(draw+interest);const cumCost=cumDraw+(r.landCost||0)+(r.sdlt||0);
                    return(<div key={m} className="cf-row" style={{background:m%2===0?"transparent":"rgba(255,255,255,.015)"}}>
                      <div style={{color:"var(--text-d)"}}>M{m+1}</div>
                      <div style={{color:"var(--red)",fontFamily:"var(--font-mono)"}}>{fmt(draw,currencySymbol)}</div>
                      <div style={{color:"var(--text-m)",fontFamily:"var(--font-mono)"}}>{fmt(cumDraw,currencySymbol)}</div>
                      <div style={{color:"var(--amber)",fontFamily:"var(--font-mono)"}}>{fmt(interest,currencySymbol)}</div>
                      <div style={{color:"var(--red)",fontFamily:"var(--font-mono)"}}>{fmt(netCf,currencySymbol)}</div>
                      <div style={{color:"var(--text-m)",fontFamily:"var(--font-mono)"}}>{fmt(cumCost,currencySymbol)}</div>
                      <div style={{color:"var(--green)"}}>{(pct*100).toFixed(0)}%</div>
                    </div>);
                  })}
                  <div className="cf-row" style={{background:"rgba(201,168,76,.05)",borderTop:"1px solid var(--gold)44"}}>
                    <div style={{color:"var(--gold)",fontFamily:"var(--font-mono)",fontSize:11,fontWeight:600}}>EXIT</div>
                    <div/><div/><div/>
                    <div style={{color:"var(--green)",fontFamily:"var(--font-mono)",fontWeight:600}}>{fmt(r.gdv||0,currencySymbol)}</div>
                    <div/><div style={{color:"var(--green)"}}>100%</div>
                  </div>
                </div>
              </div>
            )}

            {/* ANALYSIS */}
            {activeTab==="analysis"&&(
              <div>
                <div className="section-title">Returns Summary</div>
                <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:20,marginBottom:20}}>
                  {assetType==="BTR"&&([
                    ["GDV (Exit)",fmt(r.gdv,currencySymbol),"var(--gold)"],["Gross NOI pa",fmt(r.noi,currencySymbol),"var(--text)"],
                    ["Total Build Cost",fmt(r.buildCost,currencySymbol),"var(--text-m)"],["Total Finance Cost",fmt(r.totalFinanceCost,currencySymbol),"var(--amber)"],
                    ["Total Cost",fmt(r.totalCost,currencySymbol),"var(--text-m)"],["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],
                    ["Profit on Cost",fmtPct(r.poc),r.poc>0.2?"var(--green)":r.poc>0.1?"var(--amber)":"var(--red)"],
                    ["Yield on Cost",fmtPct(r.yoc),"var(--blue)"],
                    ["IRR (Unlevered)",fmtPct(r.irr),"var(--blue)"],
                    ["IRR (Levered)",fmtPct(r.irrLevered),"var(--blue)"],
                    ["Residual Land Value",fmt(r.rlv,currencySymbol),"var(--gold)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                  {assetType==="BTS"&&([
                    ["GDV",fmt(r.gdv,currencySymbol),"var(--gold)"],["Total Units",r.totalUnits?.toString()||"—","var(--text)"],
                    ["Total Sqft",r.totalSqft?.toLocaleString()||"—","var(--text-m)"],["Total Cost",fmt(r.totalCost,currencySymbol),"var(--text-m)"],
                    ["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],
                    ["Profit on Cost",fmtPct(r.poc),r.poc>0.2?"var(--green)":r.poc>0.1?"var(--amber)":"var(--red)"],
                    ["Profit on GDV",fmtPct(r.margin),r.margin>0.15?"var(--green)":"var(--amber)"],
                    ["IRR (Unlevered)",fmtPct(r.irr),"var(--blue)"],
                    ["IRR (Levered)",fmtPct(r.irrLevered),"var(--blue)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                  {assetType==="Hotel"&&([
                    ["RevPAR",fmt(r.revpar,currencySymbol),"var(--gold)"],["Total Revenue pa",fmt(r.revenuePa,currencySymbol),"var(--text)"],
                    ["EBITDA pa",fmt(r.ebitda,currencySymbol),"var(--green)"],["Stabilised Value",fmt(r.stabilisedValue,currencySymbol),"var(--text-m)"],
                    ["Exit Value",fmt(r.exitValue,currencySymbol),"var(--gold)"],["Total Investment",fmt(r.totalInvestment,currencySymbol),"var(--text-m)"],
                    ["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],
                    ["Return on Cost",fmtPct(r.poc),r.poc>0.15?"var(--green)":"var(--amber)"],
                    ["Yield on Cost",fmtPct(r.yoc),"var(--blue)"],
                    ["IRR (Unlevered)",fmtPct(r.irr),"var(--blue)"],
                    ["IRR (Levered)",fmtPct(r.irrLevered),"var(--blue)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                  {assetType==="Flip"&&([
                    ["Purchase Price",fmt(r.purchase,currencySymbol),"var(--text)"],["SDLT",fmt(r.sdlt,currencySymbol),"var(--amber)"],
                    ["Refurb Budget",fmt(r.refurb,currencySymbol),"var(--text-m)"],["Finance Cost",fmt(r.totalFinanceCost,currencySymbol),"var(--amber)"],
                    ["Total Cost",fmt(r.totalCost,currencySymbol),"var(--text-m)"],["Net Sale Proceeds",fmt(r.netProceeds,currencySymbol),"var(--gold)"],
                    ["Profit",fmt(r.profit,currencySymbol),r.profit>0?"var(--green)":"var(--red)"],
                    ["ROI on Total Cost",fmtPct(r.roi),r.roi>0.15?"var(--green)":"var(--amber)"],
                    ["ROI on Equity",fmtPct(r.roiEquity),r.roiEquity>0.25?"var(--green)":"var(--amber)"],
                    ["IRR (Annualised)",fmtPct(r.irr),"var(--blue)"],
                  ] as any[]).map(([l,v,c])=><div key={l} className="output-row"><span className="output-label">{l}</span><span className="output-value" style={{color:c}}>{v}</span></div>)}
                </div>

                {assetType==="BTR"&&sensMatrix&&(
                  <div style={{marginBottom:28}}>
                    <div className="section-title">Sensitivity — Profit on Cost %</div>
                    <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12}}>Exit yield (rows) vs rent multiplier (columns)</div>
                    <div style={{display:"grid",gridTemplateColumns:"80px repeat(5,1fr)",gap:4,fontSize:10}}>
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
                    <div style={{display:"flex",gap:16,marginTop:12}}>
                      {[["rgba(61,220,132,.15)","> 20%"],["rgba(240,164,41,.12)","10–20%"],["rgba(244,100,95,.12)","< 10%"]].map(([bg,l])=>(
                        <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--text-d)"}}><div style={{width:10,height:10,borderRadius:2,background:bg}}/>{l}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SHARE & EXPORT ── */}
                <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:20}}>
                  <div className="section-title" style={{marginBottom:16}}>Share & Export</div>
                  <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                    <button className="share-btn" onClick={()=>setShareModal(true)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      <span className="share-btn-label">Live Link</span>
                    </button>
                    <button className="share-btn" onClick={handleGeneratePDF} disabled={generatingPDF}>
                      {generatingPDF
                        ?<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-m)" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                        :<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-m)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                      }
                      <span className="share-btn-label">{generatingPDF?"Generating…":"Plain PDF"}</span>
                    </button>
                    <button className="share-btn" onClick={()=>{setBrochureModal(true);setBrochureContent(null);setBrochurePhotos([]);setBrochureError(null);}} style={{borderColor:"rgba(201,168,76,.25)"}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <span className="share-btn-label" style={{color:"var(--gold)"}}>AI Brochure</span>
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

        {/* RIGHT PANEL */}
        <div className="output-panel" style={{padding:20,position:"sticky",top:0,height:"calc(100vh - 102px)",overflowY:"auto",background:"var(--bg1)"}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:300,color:"var(--text)",marginBottom:4}}>{data.name||"New Appraisal"}</div>
          <div style={{fontSize:11,color:"var(--text-d)",marginBottom:20}}>{data.location||"No location"} · {assetType} · {data.currency}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
            {assetType==="BTR"&&[
              {label:"GDV",value:fmt(r.gdv,currencySymbol),color:"var(--gold)"},
              {label:"Profit on Cost",value:fmtPct(r.poc),color:r.poc>0.2?"var(--green)":r.poc>0.1?"var(--amber)":"var(--red)"},
              {label:"IRR (Unlevered)",value:fmtPct(r.irr),color:"var(--blue)"},
              {label:"IRR (Levered)",value:fmtPct(r.irrLevered),color:"var(--blue)"},
            ].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}>
              <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,color:m.color}}>{m.value}</div>
            </div>))}
            {assetType==="BTS"&&[
              {label:"GDV",value:fmt(r.gdv,currencySymbol),color:"var(--gold)"},
              {label:"Profit on Cost",value:fmtPct(r.poc),color:r.poc>0.2?"var(--green)":"var(--amber)"},
              {label:"IRR",value:fmtPct(r.irr),color:"var(--blue)"},
              {label:"Profit on GDV",value:fmtPct(r.margin),color:"var(--text)"},
            ].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}>
              <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,color:m.color}}>{m.value}</div>
            </div>))}
            {assetType==="Hotel"&&[
              {label:"Exit Value",value:fmt(r.exitValue,currencySymbol),color:"var(--gold)"},
              {label:"EBITDA pa",value:fmt(r.ebitda,currencySymbol),color:"var(--green)"},
              {label:"IRR",value:fmtPct(r.irr),color:"var(--blue)"},
              {label:"Return on Cost",value:fmtPct(r.poc),color:r.poc>0.15?"var(--green)":"var(--amber)"},
            ].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}>
              <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,color:m.color}}>{m.value}</div>
            </div>))}
            {assetType==="Flip"&&[
              {label:"Sale Price",value:fmt(r.salePrice,currencySymbol),color:"var(--gold)"},
              {label:"Profit",value:fmt(r.profit,currencySymbol),color:r.profit>0?"var(--green)":"var(--red)"},
              {label:"ROI on Cost",value:fmtPct(r.roi),color:r.roi>0.15?"var(--green)":"var(--amber)"},
              {label:"IRR",value:fmtPct(r.irr),color:"var(--blue)"},
            ].map(m=>(<div key={m.label} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:12}}>
              <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{m.label}</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,color:m.color}}>{m.value}</div>
            </div>))}
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
            {assetType==="BTR"&&([{label:"Land + SDLT",value:(r.landCost||0)+(r.sdlt||0),color:"var(--text-m)"},{label:"Build Cost",value:r.buildCost,color:"var(--text-m)"},{label:"Dev Costs",value:r.devCost,color:"var(--text-m)"},{label:"Finance",value:r.totalFinanceCost,color:"var(--amber)"},{label:"Total",value:r.totalCost,color:"var(--gold)",bold:true}] as any[]).map((item:any)=>(
              <div key={item.label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}>
                <span style={{color:"var(--text-m)"}}>{item.label}</span>
                <span style={{fontFamily:"var(--font-mono)",color:item.color,fontWeight:item.bold?600:400}}>{fmt(item.value||0,currencySymbol)}</span>
              </div>
            ))}
            {assetType==="Hotel"&&([{label:"Purchase + SDLT",value:(r.purchasePrice||0)+(r.sdlt||0),color:"var(--text-m)"},{label:"CapEx",value:r.capex,color:"var(--text-m)"},{label:"Finance",value:r.totalFinanceCost,color:"var(--amber)"},{label:"Total Investment",value:r.totalInvestment,color:"var(--gold)",bold:true}] as any[]).map((item:any)=>(
              <div key={item.label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}>
                <span style={{color:"var(--text-m)"}}>{item.label}</span>
                <span style={{fontFamily:"var(--font-mono)",color:item.color,fontWeight:item.bold?600:400}}>{fmt(item.value||0,currencySymbol)}</span>
              </div>
            ))}
            {assetType==="Flip"&&([{label:"Purchase + SDLT",value:(r.purchase||0)+(r.sdlt||0),color:"var(--text-m)"},{label:"Refurb + Fees",value:(r.refurb||0)+(r.profFees||0)+(r.contingency||0),color:"var(--text-m)"},{label:"Finance",value:r.totalFinanceCost,color:"var(--amber)"},{label:"Total",value:r.totalCost,color:"var(--gold)",bold:true}] as any[]).map((item:any)=>(
              <div key={item.label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}>
                <span style={{color:"var(--text-m)"}}>{item.label}</span>
                <span style={{fontFamily:"var(--font-mono)",color:item.color,fontWeight:item.bold?600:400}}>{fmt(item.value||0,currencySymbol)}</span>
              </div>
            ))}
          </div>

          {(r.poc!==undefined)&&(
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:14}}>
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
        </div>
      </div>

      {/* ── SHARE MODAL ── */}
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
                <button className="btn-primary" onClick={generateLiveLink} disabled={generatingLink||!saved} style={{width:"100%",justifyContent:"center"}}>
                  {generatingLink?"Generating…":!saved?"Save appraisal first":"Generate Live Link"}
                </button>
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
            <div style={{display:"flex",gap:8}}>
              <button className="share-btn" onClick={shareEmail}><span className="share-btn-icon">✉️</span><span className="share-btn-label">Email</span></button>
              <button className="share-btn" onClick={shareWhatsApp}><span className="share-btn-icon">💬</span><span className="share-btn-label">WhatsApp</span></button>
            </div>
            {(!liveLink)&&<p style={{fontSize:11,color:"var(--amber)",marginTop:12}}>Generate a live link above first to share via email or WhatsApp.</p>}
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteModal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setDeleteModal(false);}}>
          <div className="modal modal-sm">
            <div style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:300,marginBottom:8,color:"var(--red)"}}>Delete Appraisal</div>
            <p style={{fontSize:13,color:"var(--text-m)",marginBottom:8}}>This will permanently delete <strong style={{color:"var(--text)"}}>{data.name||"this appraisal"}</strong>.</p>
            <p style={{fontSize:12,color:"var(--text-d)",marginBottom:28}}>This action cannot be undone. The project will remain but the appraisal data will be lost.</p>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-ghost" onClick={()=>setDeleteModal(false)} style={{flex:1,justifyContent:"center"}}>Cancel</button>
              <button onClick={deleteAppraisal} disabled={deleting} style={{flex:1,background:"var(--red)",color:"#fff",border:"none",borderRadius:7,padding:"10px 20px",fontFamily:"var(--font-body)",fontSize:13,fontWeight:600,cursor:"pointer",opacity:deleting?.6:1}}>
                {deleting?"Deleting…":"Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI BROCHURE MODAL ── */}
      {brochureModal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setBrochureModal(false);}}>
          <div className="modal" style={{width:660}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:26,fontWeight:300}}>✨ AI Brochure</div>
              <button onClick={()=>setBrochureModal(false)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:20}}>×</button>
            </div>
            <p style={{fontSize:13,color:"var(--text-d)",marginBottom:24}}>{data.name||"Untitled"} · {assetType} · {data.location||"No location"}</p>

            {/* Photo upload */}
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
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:20,marginBottom:4}}>📷</div>
                      <div style={{fontSize:9,color:"var(--text-d)"}}>Add photo</div>
                    </div>
                    <input type="file" accept="image/*" multiple style={{display:"none"}} onChange={handlePhotoUpload}/>
                  </label>
                )}
                <div style={{fontSize:11,color:"var(--text-d)",marginLeft:4}}>Photos appear on the brochure cover page.</div>
              </div>
            </div>

            {/* Generate button */}
            {!brochureContent&&(
              <button className="btn-primary" onClick={generateBrochure} disabled={generatingBrochure} style={{width:"100%",justifyContent:"center",marginBottom:16,padding:"13px"}}>
                {generatingBrochure?(
                  <><span style={{width:14,height:14,border:"2px solid #06070a44",borderTopColor:"#06070a",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/> Analysing deal data…</>
                ):"Generate AI Analysis →"}
              </button>
            )}

            {brochureError&&(
              <div style={{background:"rgba(244,100,95,.1)",border:"1px solid rgba(244,100,95,.3)",borderRadius:8,padding:12,fontSize:12,color:"var(--red)",marginBottom:16}}>{brochureError}</div>
            )}

            {/* Loading shimmer */}
            {generatingBrochure&&(
              <div>
                {["Executive Summary","Deal Strengths","Risk Assessment","Market Comparables"].map(s=>(
                  <div key={s} style={{marginBottom:12}}>
                    <div style={{fontSize:10,color:"var(--gold)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>{s}</div>
                    <div className="ai-generating"/>
                  </div>
                ))}
              </div>
            )}

            {/* Editable preview */}
            {brochureContent&&!generatingBrochure&&(
              <div>
                {(["executiveSummary","dealStrengths","riskAssessment","marketComparables"] as (keyof BrochureContent)[]).map(key=>{
                  const labels={executiveSummary:"Executive Summary",dealStrengths:"Deal Strengths",riskAssessment:"Risk Assessment",marketComparables:"Market Comparables"};
                  return(
                    <div key={key} className="ai-section">
                      <span className="ai-section-label">{labels[key]}</span>
                      <textarea className="ai-textarea" value={brochureContent[key]} onChange={e=>setBrochureContent(prev=>prev?{...prev,[key]:e.target.value}:prev)}/>
                    </div>
                  );
                })}
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <button className="btn-ghost" onClick={()=>{setBrochureContent(null);}} style={{flex:1,justifyContent:"center"}}>↺ Regenerate</button>
                  <button className="btn-primary" onClick={handleDownloadBrochure} disabled={downloadingBrochure} style={{flex:2,justifyContent:"center",padding:"12px"}}>
                    {downloadingBrochure?(
                      <><span style={{width:14,height:14,border:"2px solid #06070a44",borderTopColor:"#06070a",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/> Generating PDF…</>
                    ):"⬇ Download Brochure PDF"}
                  </button>
                </div>
                <p style={{fontSize:11,color:"var(--text-d)",marginTop:10,textAlign:"center"}}>Edit any section above before downloading. All content is editable.</p>
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
