"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold-l:#e2c97e;--gold-d:#8a6e2f;--gold-bg:rgba(201,168,76,0.07);--gold-border:rgba(201,168,76,0.2);
  --bg:#06070a;--bg1:#0c0e12;--bg2:#12151a;--bg3:#191d24;--bg4:#21262f;--bg5:#2a303b;
  --text:#eceae4;--text-m:#7d8590;--text-d:#3d4249;
  --border:rgba(255,255,255,0.06);--border-m:rgba(255,255,255,0.12);
  --green:#3ddc84;--red:#f4645f;--amber:#f0a429;--blue:#5b9cf6;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased;overflow-x:hidden}
::selection{background:rgba(201,168,76,0.2);color:var(--gold-l)}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:var(--bg5)}
a{text-decoration:none;color:inherit}
@keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes float{0%,100%{transform:translateY(0) rotate(-0.5deg)}50%{transform:translateY(-14px) rotate(0.5deg)}}
@keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes spin{to{transform:rotate(360deg)}}
.fu{opacity:0;animation:fu .65s cubic-bezier(.16,1,.3,1) forwards}
.float{animation:float 9s ease-in-out infinite}
.float2{animation:float2 6s ease-in-out infinite}
.nav{position:fixed;top:0;left:0;right:0;z-index:200;height:60px;display:flex;align-items:center;padding:0 40px;transition:background .3s,border-color .3s;border-bottom:1px solid transparent}
.nav.on{background:rgba(6,7,10,.95);backdrop-filter:blur(24px);border-color:var(--border)}
.nav-links{display:flex;gap:32px;margin-right:36px}
.nav-links a{font-size:13px;color:var(--text-m);transition:color .2s;cursor:pointer}
.nav-links a:hover{color:var(--gold)}
.nav-btns{display:flex;gap:10px}
.hamburger{display:none;background:none;border:none;cursor:pointer;flex-direction:column;gap:4px;padding:4px}
.hamburger span{display:block;width:22px;height:1.5px;background:var(--text-m);border-radius:2px;transition:all .3s}
.mobile-menu{display:none;position:fixed;inset:0;z-index:199;background:rgba(6,7,10,.98);padding:80px 32px 40px;flex-direction:column}
.mobile-menu.open{display:flex}
.mobile-menu a{font-size:22px;font-family:var(--font-display);font-weight:300;color:var(--text);padding:16px 0;border-bottom:1px solid var(--border);cursor:pointer}
.btn-primary{display:inline-flex;align-items:center;gap:8px;background:var(--gold);color:#06070a;padding:12px 26px;border-radius:7px;font-family:var(--font-body);font-size:13px;font-weight:600;border:none;cursor:pointer;transition:background .2s,transform .15s}
.btn-primary:hover{background:var(--gold-l);transform:translateY(-1px)}
.btn-ghost{display:inline-flex;align-items:center;gap:8px;background:transparent;color:var(--text);padding:11px 24px;border-radius:7px;font-family:var(--font-body);font-size:13px;font-weight:500;border:1px solid var(--border-m);cursor:pointer;transition:all .2s}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.card-feature{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:28px;transition:border-color .25s,transform .25s}
.card-feature:hover{border-color:rgba(201,168,76,.35);transform:translateY(-3px)}
.inp{width:100%;padding:13px 16px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--font-body);font-size:14px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.1)}
.inp::placeholder{color:var(--text-d)}
.badge{display:inline-flex;align-items:center;gap:6px;background:var(--gold-bg);border:1px solid var(--gold-border);color:var(--gold);padding:4px 12px;border-radius:20px;font-size:11px;font-weight:500;letter-spacing:.05em}
.badge-blue{background:rgba(91,156,246,.08);border-color:rgba(91,156,246,.2);color:var(--blue)}
.section{padding:100px 0}
.container{max-width:1140px;margin:0 auto;padding:0 40px}
.testi{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:32px;display:flex;flex-direction:column;gap:20px}
.stars{display:flex;gap:3px;color:var(--gold);font-size:13px}
.price-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:36px;position:relative;overflow:hidden;transition:border-color .25s}
.price-card.featured{border-color:rgba(201,168,76,.4);background:var(--bg3)}
.price-card.featured::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--gold) 40%,var(--gold-l),transparent)}
.ficon{width:44px;height:44px;border-radius:11px;background:var(--gold-bg);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--gold);margin-bottom:18px;flex-shrink:0}
.login-wrap{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}
.login-left{background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:40px 60px;position:relative;overflow:hidden}
.login-right{display:flex;align-items:center;justify-content:center;padding:40px;background:var(--bg)}
.login-card{background:var(--bg2);border:1px solid var(--border-m);border-radius:18px;padding:44px 40px;width:100%;max-width:440px;position:relative;overflow:hidden}
.login-card::before{content:'';position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.tab-switch{display:flex;background:var(--bg3);border-radius:9px;padding:3px}
.tab-btn{flex:1;padding:9px 16px;border-radius:7px;font-size:12px;font-weight:500;background:transparent;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);transition:all .2s}
.tab-btn.active{background:var(--bg4);color:var(--text);border:1px solid var(--border)}
.ticker-wrap{overflow:hidden;white-space:nowrap;background:var(--bg1);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:14px 0}
.ticker-inner{display:inline-flex;gap:60px;animation:ticker 40s linear infinite}
.ticker-item{display:inline-flex;align-items:center;gap:10px;font-size:12px;color:var(--text-m);letter-spacing:.04em}
.grad-text{background:linear-gradient(135deg,var(--gold-l) 0%,var(--gold) 50%,#a07030 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.glow{position:absolute;border-radius:50%;pointer-events:none}
.support-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:40px 0}
.support-card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:28px;transition:border-color .25s,transform .2s;cursor:pointer}
.support-card:hover{border-color:rgba(201,168,76,.35);transform:translateY(-2px)}
.faq-item{border-bottom:1px solid var(--border)}
.faq-q{display:flex;justify-content:space-between;align-items:center;padding:18px 0;cursor:pointer;font-size:14px;color:var(--text);font-weight:500}
.faq-a{font-size:13px;color:var(--text-m);line-height:1.8;padding-bottom:18px}
.legal-content{max-width:760px;margin:0 auto;padding:120px 40px 80px}
.legal-content h1{font-family:var(--font-display);font-size:clamp(32px,4vw,52px);font-weight:300;margin-bottom:12px;color:var(--text)}
.legal-content .meta{font-size:12px;color:var(--text-d);margin-bottom:48px;padding-bottom:20px;border-bottom:1px solid var(--border)}
.legal-content h2{font-family:var(--font-display);font-size:22px;font-weight:500;color:var(--text);margin:40px 0 14px}
.legal-content p{font-size:14px;color:var(--text-m);line-height:1.85;margin-bottom:16px}
.legal-content ul{list-style:none;margin-bottom:16px}
.legal-content ul li{font-size:14px;color:var(--text-m);line-height:1.8;padding:6px 0 6px 16px;position:relative;border-bottom:1px solid var(--bg2)}
.legal-content ul li::before{content:"◆";position:absolute;left:0;color:var(--gold);font-size:8px;top:11px}
.legal-content a{color:var(--gold);text-decoration:underline;text-underline-offset:3px}
@media(max-width:768px){
  .nav{padding:0 20px;height:56px}
  .nav-links,.nav-btns{display:none}
  .hamburger{display:flex}
  .container{padding:0 20px}
  .section{padding:60px 0}
  .hero-grid{grid-template-columns:1fr !important}
  .hero-cards{display:none !important}
  .stats-grid{grid-template-columns:repeat(2,1fr) !important}
  .features-grid{grid-template-columns:1fr !important}
  .asset-grid{grid-template-columns:repeat(2,1fr) !important}
  .testi-grid{grid-template-columns:1fr !important}
  .pricing-grid{grid-template-columns:1fr !important;max-width:100% !important}
  .footer-grid{grid-template-columns:1fr !important;gap:32px !important}
  .footer-bottom{flex-direction:column !important;gap:16px !important;text-align:center}
  .login-wrap{grid-template-columns:1fr}
  .login-left{display:none}
  .login-right{padding:24px 20px}
  .login-card{padding:32px 24px}
  .why-grid{grid-template-columns:1fr !important}
  .lender-grid{grid-template-columns:1fr !important}
  .pipeline-section{grid-template-columns:1fr !important}
  .support-grid{grid-template-columns:1fr !important}
  .hero-btns{flex-direction:column !important}
  .hero-btns button{width:100%}
  .cta-btns{flex-direction:column !important;align-items:center}
  .legal-content{padding:100px 20px 60px}
}
@media(max-width:480px){
  .asset-grid{grid-template-columns:1fr !important}
  .stats-grid{grid-template-columns:1fr !important}
}
`;

const FEATURES = [
  { icon:"⟳", label:"Monthly Cash Flow Engine", desc:"Full month-by-month P&L from acquisition to exit. S-curve, straight-line and front-loaded cost profiles. Interest capitalised using live benchmark forward curves.", tag:"Core" },
  { icon:"◈", label:"Residual Land Value", desc:"Real-time RLV calculation that updates as you type. Set your target return as % of GDV or % of costs. Uses actual cashflow interest for maximum accuracy.", tag:"Valuation" },
  { icon:"▦", label:"Sensitivity Matrices", desc:"45-scenario yield vs rent matrices with colour-coded RAG. Exit yield, levered profit, and profit on cost — all updated live.", tag:"Risk" },
  { icon:"◎", label:"Live Benchmark Curves", desc:"SONIA, SOFR, EURIBOR, EIBOR, SORA, AONIA, TONA, SARON, CORRA, HONIA. Finance costs calculated against the actual forward curve.", tag:"Finance" },
  { icon:"◉", label:"3-Tier Promote Waterfall", desc:"Configurable IRR hurdles with developer and investor allocations across all tiers. Visual split bar per hurdle. Fully scenario-aware.", tag:"JV" },
  { icon:"⬡", label:"AI Sense Check", desc:"Automatically benchmarks your assumptions against market data. Flags what a senior lender would challenge — before you walk into credit committee.", tag:"AI" },
  { icon:"⬛", label:"AI Investor Brochures", desc:"Upload photos, generate a full investment memorandum with Claude AI. Branded PDF with live share links — investors always see the latest version.", tag:"AI" },
  { icon:"◫", label:"Deal Pipeline & Tasks", desc:"Kanban pipeline with tasks, notes and activity feed on every deal. Move projects from Prospect through to Completion.", tag:"PM" },
  { icon:"⊞", label:"Auto SDLT Calculator", desc:"Full UK SDLT banding — residential, commercial, mixed-use and SPV share deal modes. Calculated automatically from purchase price.", tag:"Tax" },
];

const TESTIMONIALS = [
  { q:"We replaced three Excel models with Valora. The monthly CF engine and sensitivity matrices are exactly what we needed for our BTR fund.", name:"James Harrington", role:"MD, Harrington Capital", stars:5, tag:"BTR" },
  { q:"The AI sense check flagged our exit yield was aggressive before we took the appraisal to investment committee. That alone saved us.", name:"Priya Sharma", role:"Head of Development Finance, Apex Developments", stars:5, tag:"BTR" },
  { q:"The AI brochure is extraordinary. We share a live link and investors see the model update in real time. No more stale email attachments.", name:"Marcus Al-Rashid", role:"Partner, Gulf Bridge Investments", stars:5, tag:"Hotel" },
  { q:"The SONIA forward curve integration shows real industry understanding. Our lender reviewed the CF and approved without a single question.", name:"Sophie Chen", role:"Development Director, Meridian Homes", stars:5, tag:"BTS" },
  { q:"Finally an appraisal tool that understands hotel repositioning. The ADR, RevPAR and cap rate logic is native, not a spreadsheet hack.", name:"Tom Reeves", role:"Principal, Atlas Real Estate", stars:5, tag:"Hotel" },
  { q:"The promote waterfall is something no other tool offers. Our JV partners were impressed we could show the distribution split in real time.", name:"Charlotte Davies", role:"Investment Manager, NorthStar Capital", stars:5, tag:"JV" },
];

const STATS = [
  { value:60, suffix:"bn+", prefix:"£", label:"GDV Modelled" },
  { value:30000, suffix:"+", prefix:"", label:"Deals Analysed" },
  { value:10, suffix:"", prefix:"", label:"Benchmark Rates" },
  { value:99.9, suffix:"%", prefix:"", label:"Platform Uptime", dec:1 },
];

const PIPELINE_COLS = [
  { stage:"Prospect", color:"var(--text-d)", count:2, items:[{ name:"Hammersmith BTR", type:"BTR", poc:"—", gdv:"" },{ name:"Peckham Rye Flats", type:"BTS", poc:"—", gdv:"" }]},
  { stage:"Feasibility", color:"var(--amber)", count:2, items:[{ name:"Chiswick Tower", type:"BTR", poc:"43.7%", gdv:"£208.5m" },{ name:"Shoreditch Hotel", type:"Hotel", poc:"22.1%", gdv:"£42.0m" }]},
  { stage:"Under Offer", color:"var(--blue)", count:1, items:[{ name:"Notting Hill Flip", type:"Flip", poc:"31.2%", gdv:"£1.25m" }]},
  { stage:"In Development", color:"var(--green)", count:1, items:[{ name:"Dubai Marina", type:"BTS", poc:"22.5%", gdv:"د.إ380m" }]},
];
const TYPE_COLORS:any = { BTR:"var(--gold)", BTS:"var(--blue)", Hotel:"var(--amber)", Flip:"var(--green)" };

function useScrolled(t=30) {
  const [s,setS]=useState(false);
  useEffect(()=>{ const fn=()=>setS(window.scrollY>t); window.addEventListener("scroll",fn,{passive:true}); return ()=>window.removeEventListener("scroll",fn); },[t]);
  return s;
}

function Counter({target,suffix="",prefix="",dec=0,dur=2200}:any) {
  const [n,setN]=useState(0);
  const [started,setStarted]=useState(false);
  const ref=useRef<any>(null);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{ if(e.isIntersecting&&!started){ setStarted(true); const t0=performance.now(); const tick=(now:number)=>{ const p=Math.min((now-t0)/dur,1),eased=1-Math.pow(1-p,3); setN(+(eased*target).toFixed(dec)); if(p<1)requestAnimationFrame(tick); }; requestAnimationFrame(tick); } },{threshold:0.4});
    if(ref.current)obs.observe(ref.current);
    return ()=>obs.disconnect();
  },[target,dur,dec,started]);
  return <span ref={ref}>{prefix}{n.toLocaleString()}{suffix}</span>;
}

const AppraisalMock = () => (
  <div className="float" style={{background:"var(--bg3)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:"20px 22px",width:290,boxShadow:"0 40px 80px rgba(0,0,0,.7)",position:"absolute"}}>
    <div style={{fontSize:10,color:"var(--text-d)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>Chiswick Tower · BTR</div>
    {[["GDV (Exit)","£208.5m","var(--text)"],["Profit on Cost","43.7%","var(--green)"],["IRR (Unlevered)","39.7%","var(--blue)"],["Yield on Cost","5.67%","var(--gold)"]].map(([l,v,c])=>(
      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--bg5)",fontSize:12}}>
        <span style={{color:"var(--text-m)"}}>{l}</span><span style={{color:c,fontFamily:"var(--font-mono)",fontWeight:500}}>{v}</span>
      </div>
    ))}
    <div style={{marginTop:14,height:6,background:"var(--bg5)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:"74%",background:"linear-gradient(90deg,var(--gold),var(--gold-l))",borderRadius:3}}/></div>
    <div style={{fontSize:9,color:"var(--text-d)",marginTop:5,textAlign:"right"}}>74% toward 20% PoC target</div>
  </div>
);

const SensitivityMock = () => (
  <div className="float2" style={{background:"var(--bg3)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:"18px 20px",width:230,boxShadow:"0 30px 60px rgba(0,0,0,.6)",position:"absolute",animationDelay:"2.5s"}}>
    <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Sensitivity · PoC %</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3}}>
      {[["12.1%","r"],["15.4%","a"],["18.7%","a"],["16.8%","a"],["21.5%","g"],["24.2%","g"],["22.1%","g"],["27.3%","g"],["31.8%","g"]].map(([v,t],i)=>(
        <div key={i} style={{fontSize:10,textAlign:"center",padding:"5px 2px",borderRadius:4,fontFamily:"var(--font-mono)",background:t==="r"?"rgba(244,100,95,.12)":t==="a"?"rgba(240,164,41,.1)":"rgba(61,220,132,.09)",color:t==="r"?"var(--red)":t==="a"?"var(--amber)":"var(--green)",border:i===4?"1px solid var(--gold)":"1px solid transparent",fontWeight:i===4?600:400}}>{v}</div>
      ))}
    </div>
  </div>
);

const PipelineMock = () => (
  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,width:"100%"}}>
    {PIPELINE_COLS.map((col)=>(
      <div key={col.stage} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 10px",display:"flex",flexDirection:"column",gap:8,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:"50%",background:col.color}}/><span style={{fontSize:9,color:"var(--text-m)",textTransform:"uppercase",letterSpacing:".09em",fontWeight:600}}>{col.stage}</span></div>
          <span style={{fontSize:10,background:"var(--bg5)",color:"var(--text-d)",borderRadius:10,padding:"1px 7px"}}>{col.count}</span>
        </div>
        {col.items.map((item)=>(
          <div key={item.name} style={{background:"var(--bg4)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 10px 8px"}}>
            <div style={{marginBottom:6}}><span style={{fontSize:9,fontWeight:600,letterSpacing:".06em",color:TYPE_COLORS[item.type]||"var(--text-d)",background:(TYPE_COLORS[item.type]||"var(--text-d)")+"14",padding:"2px 7px",borderRadius:10}}>{item.type}</span></div>
            <div style={{fontSize:11,fontWeight:500,color:"var(--text)",lineHeight:1.35,marginBottom:8}}>{item.name}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{item.gdv||"—"}</span>
              <span style={{fontSize:10,fontFamily:"var(--font-mono)",fontWeight:600,color:item.poc==="—"?"var(--text-d)":parseFloat(item.poc)>=20?"var(--green)":"var(--amber)"}}>{item.poc}</span>
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

function Nav({onLogin,onPage,scrolled,currentPage}:any) {
  const [menuOpen,setMenuOpen]=useState(false);
  const isHome=currentPage==="landing";
  return (
    <>
      <nav className={`nav ${scrolled?"on":""}`}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginRight:"auto",cursor:"pointer"}} onClick={()=>onPage("landing")}>
          <span style={{fontFamily:"var(--font-display)",fontSize:26,fontWeight:300,color:"var(--gold)",letterSpacing:".1em"}}>VALORA</span>
          <span style={{fontSize:9,color:"var(--text-d)",letterSpacing:".18em",textTransform:"uppercase",marginTop:3}}>Pro</span>
        </div>
        <div className="nav-links">
          {isHome ? [["Features","#features"],["Why Valora","#why"],["Pricing","#pricing"],["For Lenders","#lenders"]].map(([l,h])=><a key={l} href={h}>{l}</a>) : <a onClick={()=>onPage("landing")}>← Back to Home</a>}
        </div>
        <div className="nav-btns">
          <button className="btn-ghost" onClick={onLogin} style={{padding:"8px 18px"}}>Sign In</button>
          <button className="btn-primary" onClick={onLogin} style={{padding:"9px 20px"}}>Start Free Trial</button>
        </div>
        <button className="hamburger" onClick={()=>setMenuOpen(p=>!p)} aria-label="Menu">
          <span style={{transform:menuOpen?"rotate(45deg) translateY(5px)":"none"}}/>
          <span style={{opacity:menuOpen?0:1}}/>
          <span style={{transform:menuOpen?"rotate(-45deg) translateY(-5px)":"none"}}/>
        </button>
      </nav>
      <div className={`mobile-menu ${menuOpen?"open":""}`}>
        <div style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,color:"var(--gold)",letterSpacing:".1em",marginBottom:24,cursor:"pointer"}} onClick={()=>{setMenuOpen(false);onPage("landing")}}>VALORA</div>
        {isHome ? [["Features","#features"],["Why Valora","#why"],["Pricing","#pricing"],["Support","support"],["Privacy","privacy"],["Terms","terms"]].map(([l,h])=>h.startsWith("#")?<a key={l} href={h} onClick={()=>setMenuOpen(false)}>{l}</a>:<a key={l} onClick={()=>{setMenuOpen(false);onPage(h)}}>{l}</a>) : <a onClick={()=>{setMenuOpen(false);onPage("landing")}}>← Home</a>}
        <div style={{marginTop:32,display:"flex",flexDirection:"column",gap:12}}>
          <button className="btn-ghost" onClick={()=>{setMenuOpen(false);onLogin()}} style={{justifyContent:"center"}}>Sign In</button>
          <button className="btn-primary" onClick={()=>{setMenuOpen(false);onLogin()}} style={{justifyContent:"center"}}>Start Free Trial</button>
        </div>
      </div>
    </>
  );
}

function Footer({onPage}:any) {
  return (
    <footer style={{background:"var(--bg1)",borderTop:"1px solid var(--border)",padding:"56px 0 36px"}}>
      <div className="container">
        <div className="footer-grid" style={{display:"grid",gridTemplateColumns:"2.5fr 1fr 1fr 1fr",gap:48,marginBottom:48}}>
          <div>
            <div style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,color:"var(--gold)",letterSpacing:".1em",marginBottom:16,cursor:"pointer"}} onClick={()=>onPage("landing")}>VALORA</div>
            <p style={{fontSize:13,color:"var(--text-d)",lineHeight:1.8,maxWidth:280,marginBottom:20}}>Institutional development appraisal software for property developers, valuers, lenders and investment professionals.</p>
          </div>
          {[
            { h:"Platform", links:[["Features","landing"],["Pricing","landing"],["Support","support"]] },
            { h:"Asset Types", links:[["Build to Rent","landing"],["Build to Sell","landing"],["Hotel","landing"],["House Flip","landing"]] },
            { h:"Company", links:[["Support","support"],["Privacy","privacy"],["Terms","terms"],["Cookies","cookies"]] },
          ].map(col=>(
            <div key={col.h}>
              <div style={{fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:"var(--text-d)",fontWeight:500,marginBottom:16}}>{col.h}</div>
              {col.links.map(([l,p])=>(<div key={l} style={{fontSize:13,color:"var(--text-m)",marginBottom:10,cursor:"pointer"}} onClick={()=>onPage(p)} onMouseEnter={e=>(e.target as HTMLElement).style.color="var(--gold)"} onMouseLeave={e=>(e.target as HTMLElement).style.color="var(--text-m)"}>{l}</div>))}
            </div>
          ))}
        </div>
        <div className="footer-bottom" style={{borderTop:"1px solid var(--border)",paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{fontSize:12,color:"var(--text-d)"}}>© 2026 Valora Technologies Ltd. All rights reserved. Registered in England & Wales.</div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            {[["Privacy","privacy"],["Terms","terms"],["Cookies","cookies"],["Accessibility","accessibility"]].map(([l,p])=>(<span key={l} style={{fontSize:12,color:"var(--text-d)",cursor:"pointer"}} onClick={()=>onPage(p)} onMouseEnter={e=>(e.target as HTMLElement).style.color="var(--gold)"} onMouseLeave={e=>(e.target as HTMLElement).style.color="var(--text-d)"}>{l}</span>))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [page,setPage]=useState("landing");
  const scrolled=useScrolled();
  const toLogin=useCallback(()=>{ setPage("login"); window.scrollTo(0,0); },[]);
  const toPage=useCallback((p:string)=>{ setPage(p); window.scrollTo(0,0); },[]);
  return (
    <>
      <style>{CSS}</style>
      {page==="landing"&&<Landing onLogin={toLogin} onPage={toPage} scrolled={scrolled}/>}
      {page==="login"&&<Login onBack={()=>toPage("landing")}/>}
      {page==="support"&&<SupportPage onLogin={toLogin} onPage={toPage} scrolled={scrolled}/>}
      {page==="privacy"&&<LegalPage title="Privacy Policy" lastUpdated="1 March 2026" onLogin={toLogin} onPage={toPage} scrolled={scrolled}><PrivacyContent/></LegalPage>}
      {page==="terms"&&<LegalPage title="Terms of Service" lastUpdated="1 March 2026" onLogin={toLogin} onPage={toPage} scrolled={scrolled}><TermsContent/></LegalPage>}
      {page==="cookies"&&<LegalPage title="Cookie Policy" lastUpdated="1 March 2026" onLogin={toLogin} onPage={toPage} scrolled={scrolled}><CookiesContent/></LegalPage>}
      {page==="accessibility"&&<LegalPage title="Accessibility Statement" lastUpdated="1 March 2026" onLogin={toLogin} onPage={toPage} scrolled={scrolled}><AccessibilityContent/></LegalPage>}
    </>
  );
}

function Landing({onLogin,onPage,scrolled}:any) {
  const router=useRouter();
  return (
    <div>
      <Nav onLogin={onLogin} onPage={onPage} scrolled={scrolled} currentPage="landing"/>

      {/* HERO */}
      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden",paddingTop:80}}>
        <div className="glow" style={{width:800,height:600,top:"10%",left:"40%",background:"radial-gradient(ellipse,rgba(201,168,76,.06) 0%,transparent 65%)"}}/>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"}}/>
        <div className="container" style={{position:"relative",zIndex:1}}>
          <div className="hero-grid" style={{display:"grid",gridTemplateColumns:"55% 45%",gap:60,alignItems:"center"}}>
            <div>
              <div className="fu" style={{marginBottom:22,animationDelay:".1s"}}><span className="badge">◆ Institutional Development Appraisal Platform</span></div>
              <h1 className="fu" style={{fontFamily:"var(--font-display)",fontSize:"clamp(44px,5vw,72px)",fontWeight:300,lineHeight:1.06,marginBottom:28,letterSpacing:"-.01em",animationDelay:".2s"}}>
                The appraisal platform<br/><em className="grad-text" style={{fontStyle:"italic"}}>serious developers</em><br/>actually use
              </h1>
              <p className="fu" style={{fontSize:17,color:"var(--text-m)",lineHeight:1.75,maxWidth:500,marginBottom:36,animationDelay:".3s"}}>
                Model BTR, BTS, hotel and residential flip projects with investment-bank rigour. Monthly cash flows, live benchmark curves, AI sense check, and branded investor brochures — all in one platform.
              </p>
              <div className="fu hero-btns" style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:44,animationDelay:".4s"}}>
                <button className="btn-primary" onClick={onLogin} style={{fontSize:14,padding:"14px 30px"}}>Start Free Trial — No Card Needed</button>
                <button className="btn-ghost" style={{fontSize:14,padding:"13px 24px"}} onClick={()=>router.push("/pricing")}>View Pricing</button>
              </div>
              <div className="fu" style={{display:"flex",gap:28,paddingTop:28,borderTop:"1px solid var(--border)",flexWrap:"wrap",animationDelay:".5s"}}>
                {[["£60bn+","GDV modelled"],["30,000+","Deals analysed"],["10","Benchmark rates"],["14 days","Free trial"]].map(([v,l])=>(
                  <div key={l}><div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:500,color:"var(--gold-l)"}}>{v}</div><div style={{fontSize:11,color:"var(--text-d)",marginTop:2}}>{l}</div></div>
                ))}
              </div>
            </div>
            <div className="hero-cards fu" style={{position:"relative",height:520,animationDelay:".5s"}}>
              <AppraisalMock/>
              <SensitivityMock/>
              <div style={{position:"absolute",top:0,right:20,background:"var(--bg3)",border:"1px solid var(--border-m)",borderRadius:8,padding:"7px 13px",fontSize:11,fontFamily:"var(--font-mono)",color:"var(--blue)"}}>
                SONIA 3.97% <span style={{color:"var(--text-d)"}}>+2.5% → 6.47% all-in</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...Array(2)].map((_,ri)=>["Monthly Cash Flow","Residual Land Value","Live SONIA Curve","Sensitivity Matrices","3-Tier Waterfall","AI Sense Check","AI Brochures","Auto SDLT","Deal Pipeline","Tasks & Notes","Multi-Currency","Levered IRR","Share Links"].map((item,i)=>(
            <span key={`${ri}-${i}`} className="ticker-item"><span style={{color:"var(--gold)",fontSize:10}}>◆</span>{item}</span>
          )))}
        </div>
      </div>

      {/* STATS */}
      <section style={{padding:"70px 0",background:"var(--bg1)",borderBottom:"1px solid var(--border)"}}>
        <div className="container">
          <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0}}>
            {STATS.map((s,i)=>(
              <div key={i} style={{textAlign:"center",padding:"20px 0",borderLeft:i>0?"1px solid var(--border)":"none"}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:52,fontWeight:300,color:"var(--gold-l)",lineHeight:1}}><Counter target={s.value} prefix={s.prefix} suffix={s.suffix} dec={s.dec||0}/></div>
                <div style={{fontSize:11,color:"var(--text-d)",marginTop:8,letterSpacing:".09em",textTransform:"uppercase"}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section">
        <div className="container">
          <div style={{textAlign:"center",marginBottom:70}}>
            <div className="badge" style={{marginBottom:20}}>Platform Capabilities</div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(32px,4vw,52px)",fontWeight:300,lineHeight:1.1,marginBottom:18}}>Everything you need,<br/><em className="grad-text" style={{fontStyle:"italic"}}>precisely engineered</em></h2>
            <p style={{fontSize:16,color:"var(--text-m)",maxWidth:520,margin:"0 auto",lineHeight:1.7}}>Built from real institutional appraisal models. Every calculation validated against live deal flow across BTR, BTS, hotel and residential.</p>
          </div>
          <div className="features-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {FEATURES.map((f,i)=>(
              <div key={i} className="card-feature">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                  <div className="ficon">{f.icon}</div>
                  <span style={{fontSize:9,color:"var(--text-d)",background:"var(--bg4)",padding:"3px 9px",borderRadius:20,letterSpacing:".08em",textTransform:"uppercase",marginTop:2}}>{f.tag}</span>
                </div>
                <h3 style={{fontFamily:"var(--font-display)",fontSize:17,fontWeight:500,marginBottom:10,color:"var(--text)"}}>{f.label}</h3>
                <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.7}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PIPELINE */}
      <section style={{padding:"90px 0",background:"var(--bg1)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
        <div className="container">
          <div className="pipeline-section" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:64,alignItems:"flex-start",marginBottom:48}}>
            <div>
              <div className="badge" style={{marginBottom:20}}>Project Management</div>
              <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3vw,44px)",fontWeight:300,lineHeight:1.1,marginBottom:18}}>Your entire deal pipeline,<br/><em style={{color:"var(--gold)",fontStyle:"italic"}}>one place</em></h2>
              <p style={{fontSize:15,color:"var(--text-m)",lineHeight:1.8}}>Kanban pipeline boards with customisable deal stages. Tasks, notes and activity feed on every deal. Every appraisal linked, always in sync.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 24px",alignContent:"start",paddingTop:8}}>
              {[["Customisable stages","Name your stages to match your workflow."],["Tasks & notes","Add tasks with priorities and notes to every deal."],["Activity feed","Automatic log of every stage move and update."],["Multiple scenarios","Link several appraisals to a single deal card."]].map(([title,sub],i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{width:28,height:28,borderRadius:7,background:"var(--gold-bg)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--gold)",fontSize:12,flexShrink:0,marginTop:1}}>✓</div>
                  <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:3}}>{title}</div><div style={{fontSize:12,color:"var(--text-d)",lineHeight:1.55}}>{sub}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:16,padding:"20px 20px 24px",overflowX:"auto"}}>
            <div style={{minWidth:560}}><PipelineMock/></div>
          </div>
        </div>
      </section>

      {/* ASSET TYPES */}
      <section style={{padding:"90px 0"}}>
        <div className="container">
          <div style={{textAlign:"center",marginBottom:60}}>
            <div className="badge" style={{marginBottom:20}}>Asset Coverage</div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,48px)",fontWeight:300,lineHeight:1.12}}>Four specialist models.<br/><em className="grad-text" style={{fontStyle:"italic"}}>Not a generic spreadsheet.</em></h2>
          </div>
          <div className="asset-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
            {[
              {abbr:"BTR",color:"var(--gold)",label:"Build to Rent",desc:"OMR/DMR unit tables, NIY, exit yields, OpEx budget, stabilisation ramp, promote waterfall, benchmark curves",badge:"Most Popular"},
              {abbr:"BTS",color:"var(--blue)",label:"Build to Sell",desc:"£/sqft sales price, unit absorption schedule, phased drawdowns, agent fees, margin by phase",badge:""},
              {abbr:"HTL",color:"var(--amber)",label:"Hotel Acquisition",desc:"ADR, occupancy, RevPAR, EBITDA margin, cap rate, CapEx repositioning budget, stabilisation timeline",badge:""},
              {abbr:"FLP",color:"var(--green)",label:"House Flip",desc:"Purchase price, SDLT, refurb budget, bridging finance, hold period, ROI on equity deployed",badge:""},
            ].map((t,i)=>(
              <div key={i} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:24,position:"relative",transition:"border-color .25s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=t.color+"66"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                {t.badge&&<div className="badge" style={{position:"absolute",top:16,right:16,fontSize:9}}>{t.badge}</div>}
                <div style={{width:48,height:48,borderRadius:10,background:t.color+"14",border:`1px solid ${t.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:t.color,fontFamily:"var(--font-mono)",marginBottom:16}}>{t.abbr}</div>
                <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:500,color:"var(--text)",marginBottom:10}}>{t.label}</div>
                <div style={{fontSize:12,color:"var(--text-m)",lineHeight:1.65}}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY VALORA */}
      <section id="why" style={{padding:"100px 0",background:"var(--bg1)",borderTop:"1px solid var(--border)"}}>
        <div className="container">
          <div style={{textAlign:"center",marginBottom:72}}>
            <div className="badge" style={{marginBottom:20}}>Why Valora</div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(30px,3.5vw,52px)",fontWeight:300,lineHeight:1.1,marginBottom:20}}>Built for the complexity<br/><em className="grad-text" style={{fontStyle:"italic"}}>real deals demand</em></h2>
          </div>
          <div className="why-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {[
              {problem:"Spreadsheet errors cost deals",stat:"80%",statLabel:"of spreadsheets contain at least one material error",solution:"Valora's engine produces consistent results with live updating — no broken formulas, no version confusion.",icon:"⚠",color:"var(--red)"},
              {problem:"Generic tools don't speak property",stat:"0",statLabel:"standard finance tools understand NIY, OMR/DMR splits, or promote waterfalls",solution:"Every input is purpose-built for property development — from SDLT bands to stabilisation ramps to JV distributions.",icon:"⊠",color:"var(--amber)"},
              {problem:"Investors and lenders need more",stat:"1",statLabel:"link is all it takes for investors to see your live appraisal",solution:"AI brochures, live investor portals, and AI sense check — all from the same model.",icon:"◈",color:"var(--gold)"},
            ].map((card,i)=>(
              <div key={i} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:16,padding:32,display:"flex",flexDirection:"column",gap:20}}>
                <div style={{width:44,height:44,borderRadius:11,background:card.color+"12",border:`1px solid ${card.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:card.color}}>{card.icon}</div>
                <div>
                  <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>The Problem</div>
                  <div style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:500,color:"var(--text)",lineHeight:1.2}}>{card.problem}</div>
                </div>
                <div style={{background:card.color+"08",border:`1px solid ${card.color}20`,borderRadius:10,padding:"14px 16px"}}>
                  <div style={{fontFamily:"var(--font-display)",fontSize:36,fontWeight:300,color:card.color,lineHeight:1,marginBottom:6}}>{card.stat}</div>
                  <div style={{fontSize:12,color:"var(--text-m)",lineHeight:1.5}}>{card.statLabel}</div>
                </div>
                <div>
                  <div style={{fontSize:10,color:"var(--green)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>The Valora Solution</div>
                  <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.7}}>{card.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR LENDERS */}
      <section id="lenders" style={{padding:"90px 0"}}>
        <div className="container">
          <div className="lender-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:72,alignItems:"center"}}>
            <div>
              <div className="badge badge-blue" style={{marginBottom:20}}>For Lenders & Banks</div>
              <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3vw,44px)",fontWeight:300,lineHeight:1.12,marginBottom:20}}>Reports your underwriting<br/>team will <em style={{color:"var(--gold)",fontStyle:"italic"}}>actually trust</em></h2>
              <p style={{fontSize:15,color:"var(--text-m)",lineHeight:1.8,marginBottom:28}}>The monthly cashflow shows exactly how your facility will be drawn down, with interest calculated on actual drawn balances — giving you and your lender a precise, defensible cost of finance.</p>
              {[["Cashflow-based interest","Calculated on drawn balances, not estimated lump-sum"],["Live share links","Lenders always see the latest version"],["AI Sense Check","Flags exit yield, LTC, and build cost issues upfront"],["Lender-formatted reports","Professional PDF with standardised data"]].map(([title,sub],i)=>(
                <div key={i} style={{display:"flex",gap:14,marginBottom:18}}>
                  <div style={{width:36,height:36,borderRadius:8,background:"var(--gold-bg)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--gold)",fontSize:14,flexShrink:0}}>✓</div>
                  <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:3}}>{title}</div><div style={{fontSize:12,color:"var(--text-d)"}}>{sub}</div></div>
                </div>
              ))}
            </div>
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:24}}>
              <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:16}}>Finance Calculation — Cashflow Method</div>
              {[["Month","Drawn Balance","Interest","Net CF"],["Oct 2028","£8.2m","£44,733","(£892k)"],["Nov 2028","£11.7m","£63,788","(£1.2m)"],["Dec 2028","£16.4m","£89,400","(£1.7m)"],["Jan 2029","£22.1m","£120,495","(£2.1m)"],["Feb 2029","£29.8m","£162,455","(£3.1m)"]].map((row,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",padding:`${i===0?6:8}px 0`,borderBottom:"1px solid var(--bg4)",fontSize:i===0?9:11}}>
                  {row.map((cell,j)=><div key={j} style={{color:i===0?"var(--text-d)":j===2?"var(--amber)":j===3?"var(--red)":"var(--text-m)",fontFamily:i>0?"var(--font-mono)":"var(--font-body)",textTransform:i===0?"uppercase":"none",letterSpacing:i===0?".07em":"0"}}>{cell}</div>)}
                </div>
              ))}
              <div style={{marginTop:14,padding:"10px 0",borderTop:"1px solid var(--gold)44",display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span style={{color:"var(--text-m)"}}>Total interest (cashflow method)</span>
                <span style={{color:"var(--gold)",fontFamily:"var(--font-mono)",fontWeight:600}}>£22,155,314</span>
              </div>
              <div style={{fontSize:10,color:"var(--green)",marginTop:6}}>✓ More accurate than half-facility estimate</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{padding:"90px 0",background:"var(--bg1)",borderTop:"1px solid var(--border)"}}>
        <div className="container">
          <div style={{textAlign:"center",marginBottom:56}}>
            <div className="badge" style={{marginBottom:20}}>What Developers Say</div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,3vw,42px)",fontWeight:300}}>Used by developers across London,<br/>the Gulf, and Southeast Asia</h2>
          </div>
          <div className="testi-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className="testi">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div className="stars">{"★".repeat(t.stars)}</div>
                  <span style={{fontSize:9,color:"var(--text-d)",background:"var(--bg4)",padding:"2px 8px",borderRadius:20,textTransform:"uppercase"}}>{t.tag}</span>
                </div>
                <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.8,fontStyle:"italic"}}>"{t.q}"</p>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"var(--gold-bg)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:"var(--gold)",flexShrink:0}}>{t.name.split(" ").map((n:string)=>n[0]).join("")}</div>
                  <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{t.name}</div><div style={{fontSize:11,color:"var(--text-d)"}}>{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:"90px 0",borderTop:"1px solid var(--border)"}}>
        <div className="container">
          <div style={{textAlign:"center",marginBottom:60}}>
            <div className="badge" style={{marginBottom:20}}>Pricing</div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,48px)",fontWeight:300,marginBottom:14}}>
              Institutional-grade appraisals.<br/><em className="grad-text" style={{fontStyle:"italic"}}>Without the enterprise price tag.</em>
            </h2>
            <p style={{fontSize:15,color:"var(--text-m)"}}>14-day free trial on all plans. No credit card required.</p>
          </div>
          <div className="pricing-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,maxWidth:920,margin:"0 auto"}}>
            {[
              {
                name:"Starter",price:"£79",period:"/mo",
                desc:"For independent developers and investors getting started.",
                features:["Up to 5 active projects","All 4 asset types (BTR, BTS, Hotel, Flip)","Plain PDF export","Deal Pipeline & Tasks","Live share links","14-day free trial"],
                featured:false,cta:"Start Free Trial"
              },
              {
                name:"Professional",price:"£199",period:"/mo",
                desc:"For serious developers and investment teams.",
                features:["Unlimited projects","All 4 asset types","Plain PDF export","Deal Pipeline & Tasks","Live share links","AI Brochure PDF","AI Sense Check","Priority support","14-day free trial"],
                featured:true,cta:"Start Free Trial"
              },
              {
                name:"Enterprise",price:"£499",period:"/mo",
                desc:"For PropTech firms, agencies and institutional teams.",
                features:["Everything in Professional","Team collaboration (coming soon)","White label PDF exports","Custom benchmarks","Dedicated onboarding","SLA support"],
                featured:false,cta:"Start Free Trial"
              },
            ].map((plan,i)=>(
              <div key={i} className={`price-card ${plan.featured?"featured":""}`}>
                {plan.featured&&<div className="badge" style={{position:"absolute",top:18,right:18,fontSize:9}}>Most Popular</div>}
                <div style={{marginBottom:24}}>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--text-m)",marginBottom:10}}>{plan.name}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:10}}>
                    <span style={{fontFamily:"var(--font-display)",fontSize:42,fontWeight:300,color:"var(--text)",letterSpacing:"-.02em"}}>{plan.price}</span>
                    <span style={{fontSize:13,color:"var(--text-d)"}}>{plan.period}</span>
                  </div>
                  <p style={{fontSize:13,color:"var(--text-d)",lineHeight:1.6}}>{plan.desc}</p>
                </div>
                <div style={{height:1,background:"var(--border)",marginBottom:22}}/>
                <ul style={{listStyle:"none",marginBottom:28}}>
                  {plan.features.map((f,j)=>(
                    <li key={j} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:9,fontSize:13,color:"var(--text-m)"}}>
                      <span style={{color:"var(--green)",fontSize:11,marginTop:1,flexShrink:0}}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button className={plan.featured?"btn-primary":"btn-ghost"} style={{width:"100%",justifyContent:"center",padding:"13px"}} onClick={()=>router.push("/pricing")}>{plan.cta}</button>
              </div>
            ))}
          </div>
          <p style={{textAlign:"center",marginTop:28,fontSize:12,color:"var(--text-d)"}}>All prices exclude VAT. Annual billing available at 20% discount.</p>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"100px 0",background:"var(--bg1)",borderTop:"1px solid var(--border)",position:"relative",overflow:"hidden"}}>
        <div className="glow" style={{width:700,height:500,top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"radial-gradient(ellipse,rgba(201,168,76,.09) 0%,transparent 65%)"}}/>
        <div className="container" style={{textAlign:"center",position:"relative",zIndex:1}}>
          <div className="badge" style={{marginBottom:24}}>Get Started Today</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(34px,4.5vw,64px)",fontWeight:300,lineHeight:1.08,marginBottom:24}}>The platform your investors,<br/>lenders and team all need</h2>
          <p style={{fontSize:17,color:"var(--text-m)",maxWidth:520,margin:"0 auto 40px",lineHeight:1.75}}>Join developers across London and the Middle East who have replaced their Excel models with Valora's institutional-grade appraisal engine.</p>
          <div className="cta-btns" style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn-primary" onClick={onLogin} style={{fontSize:15,padding:"15px 36px"}}>Start 14-Day Free Trial →</button>
            <button className="btn-ghost" onClick={()=>router.push("/pricing")} style={{fontSize:15,padding:"14px 28px"}}>View Pricing</button>
          </div>
          <div style={{marginTop:32,fontSize:12,color:"var(--text-d)",display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
            {["No credit card required","Setup in 5 minutes","Full feature access","Cancel anytime"].map(t=>(
              <span key={t} style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"var(--green)",fontSize:10}}>●</span>{t}</span>
            ))}
          </div>
        </div>
      </section>

      <Footer onPage={onPage}/>
    </div>
  );
}

function LegalPage({title,lastUpdated,children,onLogin,onPage,scrolled}:any) {
  return (<div><Nav onLogin={onLogin} onPage={onPage} scrolled={scrolled} currentPage="legal"/><div className="legal-content"><h1>{title}</h1><div className="meta">Last updated: {lastUpdated} · Valora Technologies Ltd · Registered in England & Wales</div>{children}</div><Footer onPage={onPage}/></div>);
}

function PrivacyContent(){return(<><p>Valora Technologies Ltd is committed to protecting your personal data. We collect account data (name, email, firm), appraisal data you create, anonymised usage data, and payment confirmation from Stripe. We do not store card details or use your appraisals to train AI models.</p><h2>Your Rights</h2><p>Under UK GDPR you have rights to access, correct, delete, and port your data. Contact <a href="mailto:privacy@valoraplatform.io">privacy@valoraplatform.io</a>.</p></>);}
function TermsContent(){return(<><p>These Terms govern your use of the Valora platform. Subscriptions are billed monthly or annually. 14-day free trial on all plans. Cancel anytime. Prices exclude VAT. The platform and AI features provide information only — not financial advice. Governed by the laws of England and Wales.</p><p>Contact: <a href="mailto:legal@valoraplatform.io">legal@valoraplatform.io</a></p></>);}
function CookiesContent(){return(<><p>We use essential cookies to keep you logged in and protect against CSRF. Analytics cookies are anonymised. Stripe sets cookies for payment security. Contact <a href="mailto:privacy@valoraplatform.io">privacy@valoraplatform.io</a> with questions.</p></>);}
function AccessibilityContent(){return(<><p>We aim to meet WCAG 2.1 Level AA. Keyboard navigation, screen reader labels, sufficient contrast, and ARIA roles are implemented throughout. Contact <a href="mailto:accessibility@valoraplatform.io">accessibility@valoraplatform.io</a> to report issues.</p></>);}

function SupportPage({onLogin,onPage,scrolled}:any){
  const [openFaq,setOpenFaq]=useState<any>(null);
  const faqs=[
    {q:"How do I create my first appraisal?",a:"Click 'New Appraisal' from your dashboard, choose your asset type, select currency and benchmark rate, and follow the tabs. Most users complete their first appraisal in under 15 minutes."},
    {q:"Which currencies and benchmark rates are supported?",a:"GBP (SONIA), USD (SOFR), EUR (EURIBOR), AED (EIBOR), SGD (SORA), AUD (AONIA), JPY (TONA), CHF (SARON), CAD (CORRA), HKD (HONIA)."},
    {q:"Can I share appraisals with investors?",a:"Yes. From any appraisal click Share to generate a live link. Investors see the latest version without needing to log in."},
    {q:"How does AI Sense Check work?",a:"It benchmarks your assumptions against market data — build costs, exit yields, LTC ratios, rents — and flags what a senior lender would challenge. Runs automatically as you type."},
    {q:"How does AI Brochure work?",a:"Upload up to 3 photos, click Generate — Claude AI writes a professional investment memo. Edit each section before downloading the PDF."},
    {q:"Can I cancel my subscription at any time?",a:"Yes. Cancel from account settings. Subscription remains active until end of current billing period."},
    {q:"Is my data secure?",a:"All data is encrypted in transit and at rest. Your appraisal data is never shared or used to train AI models."},
  ];
  return(
    <div>
      <Nav onLogin={onLogin} onPage={onPage} scrolled={scrolled} currentPage="support"/>
      <div style={{padding:"120px 0 60px",background:"var(--bg1)",borderBottom:"1px solid var(--border)"}}>
        <div className="container" style={{textAlign:"center"}}>
          <div className="badge" style={{marginBottom:20}}>Support Centre</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(32px,4vw,56px)",fontWeight:300,marginBottom:16}}>How can we <em style={{color:"var(--gold)",fontStyle:"italic"}}>help?</em></h1>
          <p style={{fontSize:16,color:"var(--text-m)",maxWidth:500,margin:"0 auto 36px",lineHeight:1.7}}>Our team responds within 2 business hours on Professional, and 24 hours on Starter.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="mailto:support@valoraplatform.io"><button className="btn-primary" style={{fontSize:14,padding:"13px 28px"}}>Email Support</button></a>
            <button className="btn-ghost" onClick={onLogin} style={{fontSize:14,padding:"12px 24px"}}>Open Platform</button>
          </div>
        </div>
      </div>
      <div className="container" style={{padding:"60px 40px"}}>
        <div className="support-grid">
          {[
            {icon:"✉",title:"Email Support",desc:"For account, billing, and technical queries. We aim to respond within 24 hours.",action:"support@valoraplatform.io",link:"mailto:support@valoraplatform.io"},
            {icon:"⚡",title:"Priority Support",desc:"Professional and Enterprise plans include 2-hour response SLA during business hours.",action:"Upgrade to Professional →",link:"#pricing"},
            {icon:"◈",title:"Onboarding",desc:"Enterprise plans include dedicated 1-on-1 onboarding and template setup.",action:"Contact Sales →",link:"mailto:sales@valoraplatform.io"},
          ].map((c,i)=>(<div key={i} className="support-card" onClick={()=>window.open(c.link,"_self")}><div style={{fontSize:28,marginBottom:16,color:"var(--gold)"}}>{c.icon}</div><div style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:500,marginBottom:10,color:"var(--text)"}}>{c.title}</div><p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.7,marginBottom:16}}>{c.desc}</p><div style={{fontSize:13,color:"var(--gold)",fontWeight:500}}>{c.action}</div></div>))}
        </div>
        <div style={{maxWidth:720,margin:"60px auto 0"}}>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:32,fontWeight:300,marginBottom:8,textAlign:"center"}}>Frequently Asked Questions</h2>
          <p style={{fontSize:14,color:"var(--text-m)",textAlign:"center",marginBottom:40}}>Can't find what you're looking for? <a href="mailto:support@valoraplatform.io" style={{color:"var(--gold)"}}>Email us</a>.</p>
          {faqs.map((faq,i)=>(<div key={i} className="faq-item"><div className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}><span>{faq.q}</span><span style={{color:"var(--gold)",fontSize:18,flexShrink:0,marginLeft:16,transition:"transform .2s",transform:openFaq===i?"rotate(45deg)":"none"}}>+</span></div>{openFaq===i&&<div className="faq-a">{faq.a}</div>}</div>))}
        </div>
      </div>
      <Footer onPage={onPage}/>
    </div>
  );
}

function Login({onBack}:any){
  const [tab,setTab]=useState("signin");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [firm,setFirm]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [loading,setLoading]=useState(false);
  const [success,setSuccess]=useState(false);
  const [errors,setErrors]=useState<any>({});

  const validate=()=>{ const e:any={}; if(!email||!email.includes("@"))e.email="Valid email required"; if(tab!=="reset"&&password.length<8)e.password="8+ characters required"; if(tab==="signup"&&!firm.trim())e.firm="Firm name required"; setErrors(e); return Object.keys(e).length===0; };
  const submit=async(ev:any)=>{
    ev.preventDefault(); if(!validate())return; setLoading(true);
    if(tab==="signin"){const{error}=await supabase.auth.signInWithPassword({email,password}); if(error){setErrors({email:error.message});setLoading(false);return;} window.location.href="/dashboard";}
    else if(tab==="signup"){const{error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name,firm_name:firm}}}); if(error){setErrors({email:error.message});setLoading(false);return;} setLoading(false);setSuccess(true);}
    else if(tab==="reset"){const{error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/auth/callback`}); if(error){setErrors({email:error.message});setLoading(false);return;} setLoading(false);setSuccess(true);}
  };

  return(
    <div className="login-wrap">
      <div className="login-left">
        <div style={{position:"relative",zIndex:1,paddingBottom:32}}>
          <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:10,padding:0}}>
            <span style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,color:"var(--gold)",letterSpacing:".1em"}}>VALORA</span>
          </button>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",position:"relative",zIndex:1}}>
          <div className="badge" style={{marginBottom:20,width:"fit-content"}}>◆ Institutional Appraisal</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(30px,3vw,48px)",fontWeight:300,lineHeight:1.1,marginBottom:20}}>Model with the<br/><em className="grad-text" style={{fontStyle:"italic"}}>precision of a<br/>trading floor</em></h2>
          <p style={{fontSize:14,color:"var(--text-m)",lineHeight:1.8,maxWidth:360,marginBottom:40}}>Monthly cash flows against live benchmark curves. AI sense check. Branded investor brochures. Everything your deal team needs.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[{icon:"⟳",text:"Monthly CF Engine",sub:"SONIA / SOFR / EURIBOR forward curves"},{icon:"▦",text:"Sensitivity Matrices",sub:"45-scenario yield vs rent analysis"},{icon:"⬡",text:"AI Sense Check",sub:"Flags lender challenges automatically"},{icon:"⬛",text:"AI Investor Brochures",sub:"Branded PDF with live share links"}].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:14,alignItems:"center",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 16px"}}>
                <div className="ficon" style={{width:36,height:36,borderRadius:8,margin:0,fontSize:14}}>{item.icon}</div>
                <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:2}}>{item.text}</div><div style={{fontSize:11,color:"var(--text-d)"}}>{item.sub}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="login-right">
        <div style={{width:"100%",maxWidth:440}}>
          <button onClick={onBack} className="btn-ghost" style={{marginBottom:28,padding:"7px 16px",fontSize:12}}>← Back to site</button>
          {success?(
            <div className="login-card" style={{textAlign:"center"}}>
              <div style={{width:64,height:64,borderRadius:"50%",margin:"0 auto 20px",background:"rgba(61,220,132,.1)",border:"1px solid rgba(61,220,132,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,color:"var(--green)"}}>✓</div>
              <h2 style={{fontFamily:"var(--font-display)",fontSize:26,fontWeight:400,marginBottom:10}}>{tab==="reset"?"Check your inbox":"Account created"}</h2>
              <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.7}}>{tab==="reset"?`We've sent a reset link to ${email}.`:"Check your email to confirm your account, then sign in."}</p>
              <button className="btn-ghost" style={{marginTop:24,width:"100%",justifyContent:"center"}} onClick={()=>{setSuccess(false);setTab("signin")}}>Back to sign in</button>
            </div>
          ):(
            <div className="login-card">
              {tab!=="reset"&&(<div className="tab-switch" style={{marginBottom:28}}><button className={`tab-btn ${tab==="signin"?"active":""}`} onClick={()=>setTab("signin")}>Sign In</button><button className={`tab-btn ${tab==="signup"?"active":""}`} onClick={()=>setTab("signup")}>Create Account</button></div>)}
              <div style={{marginBottom:24}}>
                {tab==="reset"&&<button onClick={()=>setTab("signin")} style={{background:"none",border:"none",color:"var(--text-d)",fontSize:12,cursor:"pointer",marginBottom:14,padding:0,fontFamily:"var(--font-body)"}}>← Back to sign in</button>}
                <h1 style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:400,marginBottom:6}}>{tab==="signin"?"Welcome back":tab==="signup"?"Get started":"Reset your password"}</h1>
                <p style={{fontSize:13,color:"var(--text-m)"}}>{tab==="signin"?"Sign in to your Valora workspace":tab==="signup"?"Create your account — 14 day free trial included.":"Enter your email and we'll send a reset link."}</p>
              </div>
              <form onSubmit={submit}>
                {tab==="signup"&&(<>
                  <div style={{marginBottom:16}}><label style={{fontSize:11,color:"var(--text-m)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".07em"}}>Full Name</label><input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="James Harrington"/></div>
                  <div style={{marginBottom:16}}><label style={{fontSize:11,color:"var(--text-m)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".07em"}}>Firm / Company</label><input className="inp" value={firm} onChange={e=>setFirm(e.target.value)} placeholder="Harrington Capital"/>{errors.firm&&<div style={{fontSize:11,color:"var(--red)",marginTop:5}}>{errors.firm}</div>}</div>
                </>)}
                <div style={{marginBottom:16}}><label style={{fontSize:11,color:"var(--text-m)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".07em"}}>Email Address</label><input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="james@harringtoncap.com"/>{errors.email&&<div style={{fontSize:11,color:"var(--red)",marginTop:5}}>{errors.email}</div>}</div>
                {tab!=="reset"&&(<div style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <label style={{fontSize:11,color:"var(--text-m)",textTransform:"uppercase",letterSpacing:".07em"}}>Password</label>
                    {tab==="signin"&&<button type="button" onClick={()=>setTab("reset")} style={{background:"none",border:"none",color:"var(--gold)",fontSize:11,cursor:"pointer",fontFamily:"var(--font-body)",padding:0}}>Forgot?</button>}
                  </div>
                  <div style={{position:"relative"}}>
                    <input className="inp" type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder={tab==="signup"?"Create a strong password":"Your password"} style={{paddingRight:44}} autoComplete={tab==="signup"?"new-password":"current-password"}/>
                    <button type="button" onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:13,fontFamily:"var(--font-body)"}}>{showPw?"Hide":"Show"}</button>
                  </div>
                  {errors.password&&<div style={{fontSize:11,color:"var(--red)",marginTop:5}}>{errors.password}</div>}
                </div>)}
                <button type="submit" className="btn-primary" style={{width:"100%",justifyContent:"center",padding:"14px",fontSize:14,marginTop:8}} disabled={loading}>
                  {loading?<span style={{width:18,height:18,border:"2px solid rgba(0,0,0,.15)",borderTopColor:"#06070a",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>:tab==="signin"?"Sign In →":tab==="reset"?"Send Reset Link →":"Create Account →"}
                </button>
              </form>
              <p style={{marginTop:22,paddingTop:18,borderTop:"1px solid var(--border)",textAlign:"center",fontSize:11,color:"var(--text-d)",lineHeight:1.6}}>By continuing you agree to our <span style={{color:"var(--gold)",cursor:"pointer"}}>Terms</span> & <span style={{color:"var(--gold)",cursor:"pointer"}}>Privacy Policy</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
