"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect, Suspense } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams } from "next/navigation";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold-l:#e2c97e;--gold-bg:rgba(201,168,76,0.07);--gold-border:rgba(201,168,76,0.2);
  --bg:#06070a;--bg1:#0c0e12;--bg2:#12151a;--bg3:#191d24;--bg4:#21262f;
  --text:#eceae4;--text-m:#7d8590;--text-d:#3d4249;
  --border:rgba(255,255,255,0.06);--green:#3ddc84;--red:#f4645f;--amber:#f0a429;--blue:#5b9cf6;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.output-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--bg4);gap:12px}
.output-label{font-size:13px;color:var(--text-m);flex-shrink:0}
.output-value{font-family:var(--font-mono);font-size:13px;font-weight:500;text-align:right}
.section-title{font-family:var(--font-display);font-size:20px;font-weight:400;color:var(--text);margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--border)}
.metric-card{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:16px;animation:fadeIn .3s ease both}
.metrics-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:36px}
.content-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.page-pad{padding:40px}
.nav-pad{padding:0 40px}
.title-size{font-size:44px}
@media(max-width:768px){
  .metrics-grid{grid-template-columns:1fr 1fr}
  .content-grid{grid-template-columns:1fr}
  .page-pad{padding:24px 16px}
  .nav-pad{padding:0 16px}
  .title-size{font-size:28px}
  .output-label{font-size:12px}
  .output-value{font-size:12px}
}
@media(max-width:400px){
  .metrics-grid{grid-template-columns:1fr 1fr}
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

function SharePage(){
  const params=useParams();
  const token=params?.token as string;
  const[appraisal,setAppraisal]=useState<any>(null);
  const[loading,setLoading]=useState(true);
  const[notFound,setNotFound]=useState(false);

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
      <div style={{fontFamily:"var(--font-display)",fontSize:48,color:"var(--text-d)",fontWeight:300}}>◈</div>
      <div style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,color:"var(--text)"}}>Appraisal not found</div>
      <div style={{fontSize:14,color:"var(--text-d)"}}>This link may have expired or been revoked.</div>
    </div>
  );

  const snap=appraisal?.snapshot||{};
  const assetType=snap.assetType||"BTR";
  const currencySymbol={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"}[snap.currency]||"£";

  const gdv=appraisal.gdv||0;
  const totalCost=appraisal.total_cost||0;
  const profit=appraisal.profit||0;
  const poc=appraisal.profit_on_cost||0;
  const irr=appraisal.irr_unlevered||0;
  const pocColor=poc>0.2?"var(--green)":poc>0.1?"var(--amber)":"var(--red)";

  const returnsRows=assetType==="BTR"?[
    ["GDV (Exit)",fmt(gdv,currencySymbol),"var(--gold)"],
    ["Total Cost",fmt(totalCost,currencySymbol),"var(--text-m)"],
    ["Profit",fmt(profit,currencySymbol),profit>0?"var(--green)":"var(--red)"],
    ["Profit on Cost",fmtPct(poc),pocColor],
    ["IRR (Unlevered)",fmtPct(irr),"var(--blue)"],
    ["Programme",`${appraisal.programme_months} months`,"var(--text-m)"],
  ]:assetType==="BTS"?[
    ["GDV",fmt(gdv,currencySymbol),"var(--gold)"],
    ["Total Cost",fmt(totalCost,currencySymbol),"var(--text-m)"],
    ["Profit",fmt(profit,currencySymbol),profit>0?"var(--green)":"var(--red)"],
    ["Profit on Cost",fmtPct(poc),pocColor],
    ["IRR (Unlevered)",fmtPct(irr),"var(--blue)"],
    ["Programme",`${snap.programmMonths||"—"} months`,"var(--text-m)"],
  ]:assetType==="Hotel"?[
    ["Exit Value",fmt(gdv,currencySymbol),"var(--gold)"],
    ["Total Investment",fmt(totalCost,currencySymbol),"var(--text-m)"],
    ["Profit",fmt(profit,currencySymbol),profit>0?"var(--green)":"var(--red)"],
    ["Return on Cost",fmtPct(poc),pocColor],
    ["IRR",fmtPct(irr),"var(--blue)"],
  ]:[
    ["Sale Price",fmt(gdv,currencySymbol),"var(--gold)"],
    ["Total Cost",fmt(totalCost,currencySymbol),"var(--text-m)"],
    ["Profit",fmt(profit,currencySymbol),profit>0?"var(--green)":"var(--red)"],
    ["ROI",fmtPct(poc),pocColor],
    ["IRR",fmtPct(irr),"var(--blue)"],
  ];

  const detailRows=[
    ["Asset Type",assetType,"var(--gold)"],
    ["Location",snap.location||"—","var(--text-m)"],
    ["Currency",snap.currency||"GBP","var(--text-m)"],
    ["Programme",`${snap.programmMonths||"—"} months`,"var(--text-m)"],
    snap.stabilisationMonths?["Stabilisation",`${snap.stabilisationMonths} months`,"var(--text-m)"]:null,
    snap.exitYield?["Exit Yield",`${snap.exitYield}%`,"var(--text-m)"]:null,
    snap.landCost?["Asset / Acquisition",fmt(snap.landCost||snap.purchasePrice||0,currencySymbol),"var(--text-m)"]:null,
  ].filter(Boolean) as string[][];

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"var(--font-body)"}}>
      <style>{CSS}</style>

      {/* Nav */}
      <div style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}} className="nav-pad">
        <span style={{fontFamily:"var(--font-display)",fontSize:20,color:"var(--gold)",letterSpacing:".1em",fontWeight:300}}>VALORA</span>
        <span style={{fontSize:11,color:"var(--text-d)",background:"rgba(255,255,255,.05)",padding:"4px 10px",borderRadius:6}}>Read-only</span>
      </div>

      {/* Gold accent */}
      <div style={{height:3,background:"linear-gradient(90deg,var(--gold),transparent)"}}/>

      <div style={{maxWidth:900,margin:"0 auto"}} className="page-pad">

        {/* Title block */}
        <div style={{marginBottom:32,animation:"fadeIn .4s ease"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
            <span style={{fontSize:11,padding:"3px 10px",borderRadius:10,background:"var(--gold-bg)",color:"var(--gold)",fontWeight:600,letterSpacing:".04em"}}>{assetType}</span>
            <span style={{fontSize:11,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{snap.currency||"GBP"}</span>
            <span style={{fontSize:11,color:"var(--text-d)"}}>·</span>
            <span style={{fontSize:11,color:"var(--text-d)"}}>{snap.location||"No location"}</span>
          </div>
          <h1 className="title-size" style={{fontFamily:"var(--font-display)",fontWeight:300,marginBottom:4,lineHeight:1.1}}>{appraisal.name||"Untitled Appraisal"}</h1>
        </div>

        {/* Key metrics */}
        <div className="metrics-grid">
          {[
            {label:assetType==="Flip"?"Sale Price":"GDV / Exit Value",value:fmt(gdv,currencySymbol),color:"var(--gold)"},
            {label:"Profit",value:fmt(profit,currencySymbol),color:profit>0?"var(--green)":"var(--red)"},
            {label:"Profit on Cost",value:fmtPct(poc),color:pocColor},
            {label:"IRR",value:fmtPct(irr),color:"var(--blue)"},
          ].map((m,i)=>(
            <div key={m.label} className="metric-card" style={{animationDelay:`${i*0.06}s`}}>
              <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>{m.label}</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,color:m.color,lineHeight:1}}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* PoC bar */}
        <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:16,marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:12}}>
            <span style={{color:"var(--text-d)"}}>Return vs 20% Target</span>
            <span style={{color:pocColor,fontFamily:"var(--font-mono)",fontWeight:600}}>{fmtPct(poc)}</span>
          </div>
          <div style={{height:6,background:"var(--bg4)",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min((poc/0.3)*100,100)}%`,background:poc>0.2?"linear-gradient(90deg,var(--green),#2ab06a)":"linear-gradient(90deg,var(--amber),#d4920a)",borderRadius:3,transition:"width .6s ease"}}/>
          </div>
          <div style={{fontSize:10,color:"var(--text-d)",marginTop:6,textAlign:"right"}}>
            {poc>0.2?`${((poc-0.2)*100).toFixed(1)}% above target`:`${((0.2-poc)*100).toFixed(1)}% below target`}
          </div>
        </div>

        {/* Returns + Details */}
        <div className="content-grid">
          <div>
            <div className="section-title">Returns Summary</div>
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"4px 16px"}}>
              {returnsRows.map(([l,v,c]:any)=>(
                <div key={l} className="output-row">
                  <span className="output-label">{l}</span>
                  <span className="output-value" style={{color:c}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="section-title">Project Details</div>
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"4px 16px"}}>
              {detailRows.map(([l,v,c]:any)=>(
                <div key={l} className="output-row">
                  <span className="output-label">{l}</span>
                  <span className="output-value" style={{color:c}}>{v}</span>
                </div>
              ))}
            </div>

            {/* Unit mix for BTR/BTS */}
            {snap.units?.length>0&&(
              <div style={{marginTop:20}}>
                <div className="section-title">Unit Mix</div>
                <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"4px 16px"}}>
                  {snap.units.map((u:any,i:number)=>(
                    <div key={i} className="output-row">
                      <span className="output-label">{u.type}</span>
                      <span className="output-value" style={{color:"var(--text-m)",fontSize:11}}>
                        {u.count} × {assetType==="BTS"?`${currencySymbol}${u.salePricePsf}psf`:`${currencySymbol}${u.rentPcm}pcm`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{marginTop:48,paddingTop:20,borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <span style={{fontFamily:"var(--font-display)",fontSize:18,color:"var(--gold)",letterSpacing:".1em",fontWeight:300}}>VALORA</span>
          <span style={{fontSize:11,color:"var(--text-d)"}}>Institutional Development Appraisal · Confidential</span>
        </div>
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
