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
  --green:#3ddc84;--red:#f4645f;--amber:#f0a429;--blue:#5b9cf6;--purple:#9d7aea;
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
@keyframes pulse-ring{0%{box-shadow:0 0 0 0 rgba(201,168,76,0.3)}70%{box-shadow:0 0 0 12px rgba(201,168,76,0)}100%{box-shadow:0 0 0 0 rgba(201,168,76,0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}

.fu{opacity:0;animation:fu .65s cubic-bezier(.16,1,.3,1) forwards}
.fi{opacity:0;animation:fi .5s ease forwards}
.float{animation:float 9s ease-in-out infinite}
.float2{animation:float2 6s ease-in-out infinite}

/* Nav */
.nav{position:fixed;top:0;left:0;right:0;z-index:200;height:60px;display:flex;align-items:center;padding:0 40px;transition:background .3s,border-color .3s;border-bottom:1px solid transparent}
.nav.on{background:rgba(6,7,10,.95);backdrop-filter:blur(24px) saturate(180%);border-color:var(--border)}
.nav-links{display:flex;gap:32px;margin-right:36px}
.nav-links a{font-size:13px;color:var(--text-m);transition:color .2s;letter-spacing:.02em;cursor:pointer}
.nav-links a:hover{color:var(--gold)}
.nav-btns{display:flex;gap:10px}
.hamburger{display:none;background:none;border:none;cursor:pointer;flex-direction:column;gap:4px;padding:4px}
.hamburger span{display:block;width:22px;height:1.5px;background:var(--text-m);border-radius:2px;transition:all .3s}
.mobile-menu{display:none;position:fixed;inset:0;z-index:199;background:rgba(6,7,10,.98);padding:80px 32px 40px;flex-direction:column;gap:0}
.mobile-menu.open{display:flex}
.mobile-menu a{font-size:22px;font-family:var(--font-display);font-weight:300;color:var(--text);padding:16px 0;border-bottom:1px solid var(--border);cursor:pointer;transition:color .2s}
.mobile-menu a:hover{color:var(--gold)}

/* Buttons */
.btn-primary{display:inline-flex;align-items:center;gap:8px;background:var(--gold);color:#06070a;padding:12px 26px;border-radius:7px;font-family:var(--font-body);font-size:13px;font-weight:600;letter-spacing:.05em;border:none;cursor:pointer;transition:background .2s,transform .15s}
.btn-primary:hover{background:var(--gold-l);transform:translateY(-1px)}
.btn-ghost{display:inline-flex;align-items:center;gap:8px;background:transparent;color:var(--text);padding:11px 24px;border-radius:7px;font-family:var(--font-body);font-size:13px;font-weight:500;border:1px solid var(--border-m);cursor:pointer;transition:all .2s}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}

/* Cards */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:24px}
.card-feature{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:28px;transition:border-color .25s,transform .25s;position:relative;overflow:hidden}
.card-feature::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at top left,rgba(201,168,76,.05) 0%,transparent 60%);opacity:0;transition:opacity .3s}
.card-feature:hover{border-color:rgba(201,168,76,.35);transform:translateY(-3px)}
.card-feature:hover::after{opacity:1}

/* Form */
.inp{width:100%;padding:13px 16px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--font-body);font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s}
.inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.1)}
.inp::placeholder{color:var(--text-d)}

/* Badge */
.badge{display:inline-flex;align-items:center;gap:6px;background:var(--gold-bg);border:1px solid var(--gold-border);color:var(--gold);padding:4px 12px;border-radius:20px;font-size:11px;font-weight:500;letter-spacing:.05em}
.badge-blue{background:rgba(91,156,246,.08);border-color:rgba(91,156,246,.2);color:var(--blue)}

/* Layout */
.section{padding:100px 0}
.container{max-width:1140px;margin:0 auto;padding:0 40px}

/* Testimonial */
.testi{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:32px;display:flex;flex-direction:column;gap:20px}
.stars{display:flex;gap:3px;color:var(--gold);font-size:13px}

/* Pricing */
.price-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:36px;position:relative;overflow:hidden;transition:border-color .25s}
.price-card.featured{border-color:rgba(201,168,76,.4);background:var(--bg3)}
.price-card.featured::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--gold) 40%,var(--gold-l),transparent)}

/* Feature icon */
.ficon{width:44px;height:44px;border-radius:11px;background:var(--gold-bg);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--gold);margin-bottom:18px;flex-shrink:0}

/* Login */
.login-wrap{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}
.login-left{background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:40px 60px;position:relative;overflow:hidden}
.login-right{display:flex;align-items:center;justify-content:center;padding:40px;background:var(--bg)}
.login-card{background:var(--bg2);border:1px solid var(--border-m);border-radius:18px;padding:44px 40px;width:100%;max-width:440px;position:relative;overflow:hidden}
.login-card::before{content:'';position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.tab-switch{display:flex;background:var(--bg3);border-radius:9px;padding:3px}
.tab-btn{flex:1;padding:9px 16px;border-radius:7px;font-size:12px;font-weight:500;background:transparent;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);transition:all .2s}
.tab-btn.active{background:var(--bg4);color:var(--text);border:1px solid var(--border)}

/* Ticker */
.ticker-wrap{overflow:hidden;white-space:nowrap;background:var(--bg1);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:14px 0}
.ticker-inner{display:inline-flex;gap:60px;animation:ticker 40s linear infinite}
.ticker-item{display:inline-flex;align-items:center;gap:10px;font-size:12px;color:var(--text-m);letter-spacing:.04em}

/* Gradient */
.grad-text{background:linear-gradient(135deg,var(--gold-l) 0%,var(--gold) 50%,#a07030 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

/* Glow */
.glow{position:absolute;border-radius:50%;pointer-events:none}

/* Demo Modal */
.demo-overlay{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;padding:12px;backdrop-filter:blur(8px)}
.demo-modal{background:var(--bg1);border:1px solid var(--border-m);border-radius:18px;width:100%;max-width:1000px;max-height:95vh;overflow:hidden;display:flex;flex-direction:column;position:relative}
.demo-modal-header{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--border);flex-shrink:0;gap:8px}
.demo-modal-body{overflow-y:auto;flex:1}
.demo-close{background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text-m);font-size:18px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;font-family:var(--font-body);flex-shrink:0}
.demo-close:hover{border-color:var(--red);color:var(--red)}
.demo-sidebar{display:block}
.demo-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
.demo-proj-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 80px;gap:8px;align-items:center}
@media(max-width:768px){
  .demo-overlay{padding:0}
  .demo-modal{border-radius:0;max-height:100vh;height:100vh}
  .demo-modal-header{padding:10px 14px}
  .demo-modal-header .demo-title-text{display:none}
  .demo-modal-header .btn-primary{font-size:11px;padding:7px 12px}
  .demo-sidebar{display:none !important}
  .demo-browser-chrome{display:none !important}
  .demo-grid{grid-template-columns:1fr !important}
  .demo-tabs{overflow-x:auto;-webkit-overflow-scrolling:touch}
  .demo-metrics{grid-template-columns:repeat(2,1fr) !important}
  .demo-proj-row{grid-template-columns:1fr 1fr !important;gap:6px}
  .demo-proj-row .proj-gdv{display:none}
  .demo-proj-row .proj-status{display:none}
  .demo-step-footer{padding:10px 14px !important}
  .demo-content-pad{padding:14px !important}
  .sens-table{font-size:9px !important}
  .sens-table .sens-row-label{font-size:8px !important;width:40px !important}
}

/* ─ Comparison table ─ */
.comp-row{display:grid;grid-template-columns:2fr 1fr 1fr;gap:0;border-bottom:1px solid var(--border);padding:0}
.comp-cell{padding:14px 20px;font-size:13px;display:flex;align-items:center}
.check-v{color:var(--green)}.check-x{color:var(--text-d)}.check-g{color:var(--gold);font-weight:500}
.legal-content{max-width:760px;margin:0 auto;padding:120px 40px 80px}
.legal-content h1{font-family:var(--font-display);font-size:clamp(32px,4vw,52px);font-weight:300;margin-bottom:12px;color:var(--text)}
.legal-content .meta{font-size:12px;color:var(--text-d);margin-bottom:48px;padding-bottom:20px;border-bottom:1px solid var(--border)}
.legal-content h2{font-family:var(--font-display);font-size:22px;font-weight:500;color:var(--text);margin:40px 0 14px}
.legal-content h3{font-size:15px;font-weight:600;color:var(--text-m);margin:24px 0 10px;text-transform:uppercase;letter-spacing:.06em}
.legal-content p{font-size:14px;color:var(--text-m);line-height:1.85;margin-bottom:16px}
.legal-content ul{list-style:none;margin-bottom:16px}
.legal-content ul li{font-size:14px;color:var(--text-m);line-height:1.8;padding:6px 0;padding-left:16px;position:relative;border-bottom:1px solid var(--bg2)}
.legal-content ul li::before{content:"◆";position:absolute;left:0;color:var(--gold);font-size:8px;top:11px}
.legal-content a{color:var(--gold);text-decoration:underline;text-underline-offset:3px}

/* Support */
.support-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:40px 0}
.support-card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:28px;transition:border-color .25s,transform .2s;cursor:pointer}
.support-card:hover{border-color:rgba(201,168,76,.35);transform:translateY(-2px)}
.faq-item{border-bottom:1px solid var(--border)}
.faq-q{display:flex;justify-content:space-between;align-items:center;padding:18px 0;cursor:pointer;font-size:14px;color:var(--text);font-weight:500}
.faq-a{font-size:13px;color:var(--text-m);line-height:1.8;padding-bottom:18px}

/* Mobile responsive */
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
  .workflow-grid{grid-template-columns:repeat(2,1fr) !important}
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
  .comp-row{grid-template-columns:1.5fr 1fr 1fr !important}
  .legal-content{padding:100px 20px 60px}
}
@media(max-width:480px){
  .asset-grid{grid-template-columns:1fr !important}
  .workflow-grid{grid-template-columns:1fr !important}
  .stats-grid{grid-template-columns:1fr !important}
}
`;

/* ─────────────────────── DATA ─────────────────────── */
const FEATURES = [
  { icon:"⟳", label:"Monthly Cash Flow Engine", desc:"Full month-by-month P&L from acquisition to exit. S-curve, straight-line and front-loaded cost profiles. Interest capitalised using live benchmark forward curves.", tag:"Core" },
  { icon:"◈", label:"Residual Land Value", desc:"Real-time RLV calculation that updates as you type. Set your target return as % of GDV or % of costs. Uses actual cashflow interest for maximum accuracy.", tag:"Valuation" },
  { icon:"▦", label:"3×3 Sensitivity Matrices", desc:"Three full 45-scenario matrices: Exit Price, Levered Profit, Profit on Cost. Yield vs rent with colour-coded RAG and base case highlighted.", tag:"Risk" },
  { icon:"◎", label:"Live Benchmark Curves", desc:"SONIA, SOFR, EURIBOR, EIBOR, SORA, AONIA, TONA, SARON, CORRA, HONIA. Finance costs calculated month-by-month against the actual forward curve.", tag:"Finance" },
  { icon:"◉", label:"3-Tier Promote Waterfall", desc:"Configurable IRR hurdles with developer and investor allocations calculated across all tiers. Visual split bar per hurdle. Fully scenario-aware.", tag:"JV" },
  { icon:"⬡", label:"AI Market Comparables", desc:"Claude AI benchmarks your specific assumptions against current market data. Verdict rating, specific risks, suggested amendments with financial impact.", tag:"AI" },
  { icon:"⬛", label:"Branded Investor Brochures", desc:"Full-bleed documents with your firm's colours and logo. Live share links so investors always see the latest version — no email attachments.", tag:"Reporting" },
  { icon:"≡", label:"Scenario Manager", desc:"Base, Bear, Bull cases with fully independent inputs. Side-by-side comparison table showing GDV, cost, profit, PoC and IRR across all three scenarios.", tag:"Planning" },
  { icon:"◷", label:"Audit Trail", desc:"Every input change timestamped with user name, field, old and new value. Essential for investment committee governance and lender due diligence.", tag:"Compliance" },
  { icon:"⊞", label:"Auto SDLT Calculator", desc:"Full UK SDLT banding (5%/10%/15%/17% company rates) calculated automatically from purchase price. Other jurisdictions apply appropriate transfer tax rates.", tag:"Tax" },
  { icon:"◫", label:"Project Pipeline Boards", desc:"Kanban-style deal pipeline with customisable stages. Shared team boards and private personal boards.", tag:"PM" },
  { icon:"⊙", label:"Template Library", desc:"Save any appraisal as a reusable template. Pre-built templates for BTR, BTS, hotel, and residential flips.", tag:"Workflow" },
];

const TESTIMONIALS = [
  { q:"We replaced three Excel models with Valora. The monthly CF engine and sensitivity matrices are exactly what we needed for our BTR fund.", name:"James Harrington", role:"MD, Harrington Capital", stars:5, tag:"BTR" },
  { q:"The AI market review flagged that our exit yield was aggressive before we took the appraisal to the investment committee. That alone saved us.", name:"Priya Sharma", role:"Head of Development Finance, Apex Developments", stars:5, tag:"BTR" },
  { q:"The branded brochure is extraordinary. We share a live link and investors see the model update in real time. No more stale email attachments.", name:"Marcus Al-Rashid", role:"Partner, Gulf Bridge Investments", stars:5, tag:"Hotel" },
  { q:"The SONIA forward curve integration shows real industry understanding. Our lender reviewed the CF and approved it without a single question.", name:"Sophie Chen", role:"Development Director, Meridian Homes", stars:5, tag:"BTS" },
  { q:"Finally an appraisal tool that understands hotel repositioning. The ADR, RevPAR and cap rate logic is native, not a spreadsheet hack.", name:"Tom Reeves", role:"Principal, Atlas Real Estate", stars:5, tag:"Hotel" },
  { q:"The promote waterfall is something no other tool offers. Our JV partners were impressed we could show the distribution split in real time.", name:"Charlotte Davies", role:"Investment Manager, NorthStar Capital", stars:5, tag:"JV" },
];

const STATS = [
  { value:60, suffix:"bn+", prefix:"£", label:"GDV Modelled" },
  { value:30000, suffix:"+", prefix:"", label:"Deals Analysed" },
  { value:18, suffix:"", prefix:"", label:"Currencies Supported" },
  { value:99.9, suffix:"%", prefix:"", label:"Platform Uptime", dec:1 },
];

const PIPELINE_COLS = [
  { stage:"Prospect", color:"var(--text-d)", count:2, items:[
    { name:"Hammersmith BTR", type:"BTR", poc:"—", gdv:"" },
    { name:"Peckham Rye Flats", type:"BTS", poc:"—", gdv:"" },
  ]},
  { stage:"Feasibility", color:"var(--amber)", count:2, items:[
    { name:"Chiswick Tower", type:"BTR", poc:"43.7%", gdv:"£208.5m" },
    { name:"Shoreditch Hotel", type:"Hotel", poc:"22.1%", gdv:"£42.0m" },
  ]},
  { stage:"Under Offer", color:"var(--blue)", count:1, items:[
    { name:"Notting Hill Flip", type:"Flip", poc:"31.2%", gdv:"£1.25m" },
  ]},
  { stage:"In Development", color:"var(--green)", count:1, items:[
    { name:"Dubai Marina", type:"BTS", poc:"22.5%", gdv:"د.إ380m" },
  ]},
];

const TYPE_COLORS = { BTR:"var(--gold)", BTS:"var(--blue)", Hotel:"var(--amber)", Flip:"var(--green)" };

/* ─────────────────────── UTILS ─────────────────────── */
function useScrolled(t=30) {
  const [s,setS]=useState(false);
  useEffect(()=>{ const fn=()=>setS(window.scrollY>t); window.addEventListener("scroll",fn,{passive:true}); return ()=>window.removeEventListener("scroll",fn); },[t]);
  return s;
}

function Counter({target,suffix="",prefix="",dec=0,dur=2200}) {
  const [n,setN]=useState(0);
  const [started,setStarted]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&!started){
        setStarted(true);
        const t0=performance.now();
        const tick=(now)=>{ const p=Math.min((now-t0)/dur,1),eased=1-Math.pow(1-p,3); setN(+(eased*target).toFixed(dec)); if(p<1)requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      }
    },{threshold:0.4});
    if(ref.current)obs.observe(ref.current);
    return ()=>obs.disconnect();
  },[target,dur,dec,started]);
  return <span ref={ref}>{prefix}{n.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────── MOCK UI ─────────────────────── */
const AppraisalMock = () => (
  <div className="float" style={{background:"var(--bg3)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:"20px 22px",width:290,boxShadow:"0 40px 80px rgba(0,0,0,.7)",position:"absolute"}}>
    <div style={{fontSize:10,color:"var(--text-d)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>Chiswick Tower · BTR</div>
    {[["GDV (Exit)","£208.5m","var(--text)"],["Profit on Cost","43.7%","var(--green)"],["IRR (Unlevered)","39.7%","var(--blue)"],["Yield on Cost","5.67%","var(--gold)"]].map(([l,v,c])=>(
      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--bg5)",fontSize:12}}>
        <span style={{color:"var(--text-m)"}}>{l}</span>
        <span style={{color:c,fontFamily:"var(--font-mono)",fontWeight:500}}>{v}</span>
      </div>
    ))}
    <div style={{marginTop:14,height:6,background:"var(--bg5)",borderRadius:3,overflow:"hidden"}}>
      <div style={{height:"100%",width:"74%",background:"linear-gradient(90deg,var(--gold),var(--gold-l))",borderRadius:3}}/>
    </div>
    <div style={{fontSize:9,color:"var(--text-d)",marginTop:5,textAlign:"right"}}>74% toward 20% PoC target</div>
  </div>
);

const SensitivityMock = () => (
  <div className="float2" style={{background:"var(--bg3)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:"18px 20px",width:230,boxShadow:"0 30px 60px rgba(0,0,0,.6)",position:"absolute",animationDelay:"2.5s"}}>
    <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Sensitivity · PoC %</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3}}>
      {[["12.1%","r"],["15.4%","a"],["18.7%","a"],["16.8%","a"],["21.5%","g"],["24.2%","g"],["22.1%","g"],["27.3%","g"],["31.8%","g"]].map(([v,t],i)=>(
        <div key={i} style={{fontSize:10,textAlign:"center",padding:"5px 2px",borderRadius:4,fontFamily:"var(--font-mono)",
          background:t==="r"?"rgba(244,100,95,.12)":t==="a"?"rgba(240,164,41,.1)":"rgba(61,220,132,.09)",
          color:t==="r"?"var(--red)":t==="a"?"var(--amber)":"var(--green)",
          border:i===4?"1px solid var(--gold)":"1px solid transparent",fontWeight:i===4?600:400,
        }}>{v}</div>
      ))}
    </div>
  </div>
);

const AIReviewMock = () => (
  <div style={{background:"var(--bg3)",border:"1px solid rgba(91,156,246,.25)",borderRadius:12,padding:"14px 16px",width:240,boxShadow:"0 20px 40px rgba(0,0,0,.5)",position:"absolute"}}>
    <div style={{fontSize:9,color:"var(--blue)",textTransform:"uppercase",letterSpacing:".12em",marginBottom:8,fontWeight:500}}>⬡ AI Market Review</div>
    <div style={{fontSize:11,color:"var(--green)",fontWeight:600,marginBottom:6}}>Strong · Above target</div>
    <div style={{fontSize:10,color:"var(--text-m)",lineHeight:1.6,marginBottom:8}}>Exit yield 4.15% is competitive vs London BTR market range of 3.75–4.50%.</div>
    <div style={{fontSize:10,color:"var(--text-d)",borderTop:"1px solid var(--border)",paddingTop:8}}>▸ Consider reducing void from 2% to 1.5% — adds ~£1.2m to NOI</div>
  </div>
);

const PipelineMock = () => (
  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,width:"100%"}}>
    {PIPELINE_COLS.map((col)=>(
      <div key={col.stage} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 10px",display:"flex",flexDirection:"column",gap:8,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:col.color,flexShrink:0}}/>
            <span style={{fontSize:9,color:"var(--text-m)",textTransform:"uppercase",letterSpacing:".09em",fontWeight:600}}>{col.stage}</span>
          </div>
          <span style={{fontSize:10,background:"var(--bg5)",color:"var(--text-d)",borderRadius:10,padding:"1px 7px",fontWeight:500}}>{col.count}</span>
        </div>
        {col.items.map((item)=>(
          <div key={item.name} style={{background:"var(--bg4)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 10px 8px"}}>
            <div style={{marginBottom:6}}>
              <span style={{fontSize:9,fontWeight:600,letterSpacing:".06em",color:(TYPE_COLORS as any)[item.type]||"var(--text-d)",background:((TYPE_COLORS as any)[item.type]||"var(--text-d)")+"14",padding:"2px 7px",borderRadius:10}}>{item.type}</span>
            </div>
            <div style={{fontSize:11,fontWeight:500,color:"var(--text)",lineHeight:1.35,marginBottom:8}}>{item.name}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{item.gdv||"—"}</span>
              <span style={{fontSize:10,fontFamily:"var(--font-mono)",fontWeight:600,color:item.poc==="—"?"var(--text-d)":parseFloat(item.poc)>=20?"var(--green)":"var(--amber)"}}>{item.poc}</span>
            </div>
          </div>
        ))}
        <div style={{border:"1px dashed var(--bg5)",borderRadius:8,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"var(--text-d)",opacity:0.5}}>+</div>
      </div>
    ))}
  </div>
);

/* ─────────────────────── SHARED NAV ─────────────────────── */
function Nav({onLogin,onPage,scrolled,currentPage}) {
  const [menuOpen,setMenuOpen]=useState(false);
  const isHome = currentPage==="landing";

  return (
    <>
      <nav className={`nav ${scrolled?"on":""}`}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginRight:"auto",cursor:"pointer"}} onClick={()=>onPage("landing")}>
          <span style={{fontFamily:"var(--font-display)",fontSize:26,fontWeight:300,color:"var(--gold)",letterSpacing:".1em"}}>VALORA</span>
          <span style={{fontSize:9,color:"var(--text-d)",letterSpacing:".18em",textTransform:"uppercase",marginTop:3}}>Pro</span>
        </div>
        <div className="nav-links">
          {isHome ? (
            [["Features","#features"],["Why Valora","#why"],["Pricing","#pricing"],["For Lenders","#lenders"]].map(([l,h])=>(
              <a key={l} href={h}>{l}</a>
            ))
          ) : (
            <a onClick={()=>onPage("landing")}>← Back to Home</a>
          )}
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
        {isHome ? (
          [["Features","#features"],["Why Valora","#why"],["Pricing","#pricing"],["For Lenders","#lenders"],["Support","support"],["Privacy","privacy"],["Terms","terms"]].map(([l,h])=>(
            h.startsWith("#") ?
              <a key={l} href={h} onClick={()=>setMenuOpen(false)}>{l}</a> :
              <a key={l} onClick={()=>{setMenuOpen(false);onPage(h)}}>{l}</a>
          ))
        ) : (
          <a onClick={()=>{setMenuOpen(false);onPage("landing")}}>← Home</a>
        )}
        <div style={{marginTop:32,display:"flex",flexDirection:"column",gap:12}}>
          <button className="btn-ghost" onClick={()=>{setMenuOpen(false);onLogin()}} style={{justifyContent:"center"}}>Sign In</button>
          <button className="btn-primary" onClick={()=>{setMenuOpen(false);onLogin()}} style={{justifyContent:"center"}}>Start Free Trial</button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────── SHARED FOOTER ─────────────────────── */
function Footer({onPage}) {
  return (
    <footer style={{background:"var(--bg1)",borderTop:"1px solid var(--border)",padding:"56px 0 36px"}}>
      <div className="container">
        <div className="footer-grid" style={{display:"grid",gridTemplateColumns:"2.5fr 1fr 1fr 1fr",gap:48,marginBottom:48}}>
          <div>
            <div style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,color:"var(--gold)",letterSpacing:".1em",marginBottom:16,cursor:"pointer"}} onClick={()=>onPage("landing")}>VALORA</div>
            <p style={{fontSize:13,color:"var(--text-d)",lineHeight:1.8,maxWidth:280,marginBottom:20}}>Institutional development appraisal software for property developers, valuers, lenders and investment professionals.</p>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {["ISO 27001","SOC 2","GDPR"].map(cert=>(
                <div key={cert} style={{fontSize:9,color:"var(--text-d)",border:"1px solid var(--border)",padding:"3px 8px",borderRadius:4,letterSpacing:".06em"}}>{cert}</div>
              ))}
            </div>
          </div>
          {[
            { h:"Platform", links:[["Features","landing"],["Pricing","landing"],["Security","support"],["API","support"],["Changelog","support"]] },
            { h:"Asset Types", links:[["Build to Rent","landing"],["Build to Sell","landing"],["Hotel Acquisition","landing"],["House Flips","landing"],["Mixed Use","landing"]] },
            { h:"Company", links:[["About","landing"],["Support","support"],["Careers","landing"],["Contact","support"],["Blog","landing"]] },
          ].map(col=>(
            <div key={col.h}>
              <div style={{fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:"var(--text-d)",fontWeight:500,marginBottom:16}}>{col.h}</div>
              {col.links.map(([l,p])=>(
                <div key={l} style={{fontSize:13,color:"var(--text-m)",marginBottom:10,cursor:"pointer",transition:"color .2s"}}
                  onClick={()=>onPage(p)}
                  onMouseEnter={e=>(e.target as HTMLElement).style.color="var(--gold)"}
                  onMouseLeave={e=>(e.target as HTMLElement).style.color="var(--text-m)"}>{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom" style={{borderTop:"1px solid var(--border)",paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{fontSize:12,color:"var(--text-d)"}}>© 2026 Valora Technologies Ltd. All rights reserved. Registered in England & Wales.</div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            {[["Privacy","privacy"],["Terms","terms"],["Cookies","cookies"],["Accessibility","accessibility"]].map(([l,p])=>(
              <span key={l} style={{fontSize:12,color:"var(--text-d)",cursor:"pointer",transition:"color .2s"}}
                onClick={()=>onPage(p)}
                onMouseEnter={e=>(e.target as HTMLElement).style.color="var(--gold)"}
                onMouseLeave={e=>(e.target as HTMLElement).style.color="var(--text-d)"}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────── ROOT APP ─────────────────────── */
export default function App() {
  const [page,setPage]=useState("landing");
  const scrolled=useScrolled();

  const toLogin=useCallback(()=>{ setPage("login"); window.scrollTo(0,0); },[]);
  const toPage=useCallback((p)=>{ setPage(p); window.scrollTo(0,0); },[]);

  return (
    <>
      <style>{CSS}</style>
      {page==="landing" && <Landing onLogin={toLogin} onPage={toPage} scrolled={scrolled}/>}
      {page==="login"   && <Login onBack={()=>toPage("landing")}/>}
      {page==="support" && <SupportPage onLogin={toLogin} onPage={toPage} scrolled={scrolled}/>}
      {page==="privacy" && <LegalPage title="Privacy Policy" lastUpdated="1 March 2026" onLogin={toLogin} onPage={toPage} scrolled={scrolled}><PrivacyContent/></LegalPage>}
      {page==="terms"   && <LegalPage title="Terms of Service" lastUpdated="1 March 2026" onLogin={toLogin} onPage={toPage} scrolled={scrolled}><TermsContent/></LegalPage>}
      {page==="cookies" && <LegalPage title="Cookie Policy" lastUpdated="1 March 2026" onLogin={toLogin} onPage={toPage} scrolled={scrolled}><CookiesContent/></LegalPage>}
      {page==="accessibility" && <LegalPage title="Accessibility Statement" lastUpdated="1 March 2026" onLogin={toLogin} onPage={toPage} scrolled={scrolled}><AccessibilityContent/></LegalPage>}
    </>
  );
}

/* ─────────────────────── DEMO MODAL ─────────────────────── */
const DEMO_STEPS = [
  { id:1, label:"Dashboard", tab:"Dashboard" },
  { id:2, label:"Appraisal Input", tab:"Revenue & Costs" },
  { id:3, label:"Sensitivity Matrix", tab:"Analysis" },
  { id:4, label:"AI Market Review", tab:"AI Review" },
  { id:5, label:"Investor Brochure", tab:"Share" },
];

function DemoModal({onClose,onLogin}) {
  const [step,setStep]=useState(1);

  useEffect(()=>{
    const handler=(e)=>{ if(e.key==="Escape") onClose(); };
    document.addEventListener("keydown",handler);
    return ()=>document.removeEventListener("keydown",handler);
  },[onClose]);

  return (
    <div className="demo-overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="demo-modal">
        {/* Header */}
        <div className="demo-modal-header">
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:300,color:"var(--gold)",letterSpacing:".1em"}}>VALORA</span>
            <span className="demo-title-text" style={{fontSize:12,color:"var(--text-d)"}}>Interactive Platform Demo</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button className="btn-primary" onClick={onLogin} style={{fontSize:12,padding:"8px 16px"}}>Start Free Trial →</button>
            <button className="demo-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="demo-modal-body">
          {/* Browser chrome */}
          <div className="demo-browser-chrome" style={{background:"var(--bg2)",borderBottom:"1px solid var(--border)",padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",gap:5}}>
              {["#f4645f","#f0a429","#3ddc84"].map(c=><div key={c} style={{width:10,height:10,borderRadius:"50%",background:c}}/>)}
            </div>
            <div style={{flex:1,background:"var(--bg3)",borderRadius:6,padding:"5px 12px",fontSize:11,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>app.valoraplatform.com / {["dashboard","appraisal/chiswick-tower","appraisal/sensitivity","appraisal/ai-review","appraisal/brochure"][step-1]}</div>
            <div style={{fontSize:11,color:"var(--text-d)"}}>Step {step} of 5</div>
          </div>

          {/* Main layout */}
          <div className="demo-grid" style={{display:"grid",gridTemplateColumns:"180px 1fr",minHeight:460}}>
            {/* Sidebar */}
            <div className="demo-sidebar" style={{background:"var(--bg2)",borderRight:"1px solid var(--border)",padding:"16px 0"}}>
              <div style={{padding:"0 12px",marginBottom:20}}>
                <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:8,padding:"0 4px"}}>Portfolio</div>
                {[
                  {icon:"◫",label:"Dashboard",s:1},
                  {icon:"⊞",label:"New Appraisal",s:0},
                  {icon:"≡",label:"Pipeline",s:0},
                ].map(item=>(
                  <div key={item.label} onClick={()=>item.s&&setStep(item.s)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,fontSize:12,color:step===item.s?"var(--gold)":"var(--text-m)",background:step===item.s?"rgba(201,168,76,.1)":"transparent",cursor:item.s?"pointer":"default",marginBottom:2}}>
                    <span style={{fontSize:13,width:16,textAlign:"center"}}>{item.icon}</span>{item.label}
                  </div>
                ))}
              </div>
              <div style={{padding:"0 12px"}}>
                <div style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:8,padding:"0 4px"}}>Active Projects</div>
                {[
                  {name:"Chiswick Tower",sub:"BTR · £208.5m",s:[2,3,4,5]},
                  {name:"Dubai Marina",sub:"BTS · د.إ380m",s:[]},
                ].map(proj=>(
                  <div key={proj.name} onClick={()=>proj.s.length&&setStep(proj.s[0])} style={{display:"flex",flexDirection:"column",gap:3,padding:"8px",borderRadius:7,cursor:proj.s.length?"pointer":"default",background:proj.s.includes(step)?"rgba(201,168,76,.08)":"transparent",marginBottom:2,transition:"background .2s"}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:11,color:proj.s.includes(step)?"var(--gold)":"var(--text)"}}>◈</span>
                      <span style={{fontSize:11,color:proj.s.includes(step)?"var(--text)":"var(--text-m)"}}>{proj.name}</span>
                    </div>
                    <div style={{fontSize:9,color:"var(--text-d)",paddingLeft:19}}>{proj.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content area */}
            <div>
              {/* Tab bar */}
              <div className="demo-tabs" style={{background:"var(--bg2)",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",padding:"0 20px",height:42}}>
                {DEMO_STEPS.map(s=>(
                  <div key={s.id} onClick={()=>setStep(s.id)} style={{padding:"0 14px",height:"100%",display:"flex",alignItems:"center",fontSize:11,cursor:"pointer",borderBottom:`2px solid ${step===s.id?"var(--gold)":"transparent"}`,color:step===s.id?"var(--gold)":"var(--text-d)",transition:"all .2s"}}>{s.tab}</div>
                ))}
              </div>

              {/* Screen content */}
              <div className="demo-content-pad" style={{padding:20,minHeight:400}}>

                {step===1&&(
                  <div>
                    <div className="demo-metrics">
                      {[["Total GDV","£253m","var(--gold)","↑ 3 active"],["Avg PoC","29.4%","var(--green)","above target"],["Avg IRR","34.2%","var(--blue)","unlevered"],["Team","4 users","var(--text)","active"]].map(([l,v,c,s])=>(
                        <div key={l} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:14}}>
                          <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>{l}</div>
                          <div style={{fontSize:20,fontFamily:"var(--font-display)",fontWeight:300,color:c}}>{v}</div>
                          <div style={{fontSize:10,color:"var(--text-d)",marginTop:3}}>{s}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>Recent Projects</div>
                    {[["Chiswick Tower","London W6","BTR","£208.5m","43.7%","var(--green)","Feasibility"],["Dubai Marina","Dubai, UAE","BTS","د.إ380m","22.5%","var(--green)","Active"],["Shoreditch Hotel","London EC2","Hotel","£42.0m","18.2%","var(--amber)","Review"]].map(([n,l,t,g,p,pc,st])=>(
                      <div key={n} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:9,padding:"11px 14px",marginBottom:6}}>
                        <div className="demo-proj-row">
                          <div><div style={{fontWeight:500,color:"var(--text)",fontSize:12}}>{n}</div><div style={{fontSize:10,color:"var(--text-d)"}}>{l}</div></div>
                          <div><span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:t==="BTR"?"rgba(201,168,76,.12)":t==="BTS"?"rgba(91,156,246,.12)":"rgba(240,164,41,.12)",color:t==="BTR"?"var(--gold)":t==="BTS"?"var(--blue)":"var(--amber)"}}>{t}</span></div>
                          <div className="proj-gdv" style={{fontFamily:"var(--font-mono)",color:"var(--text-m)",fontSize:12}}>{g}</div>
                          <div style={{fontFamily:"var(--font-mono)",fontWeight:600,color:pc,fontSize:12}}>{p}</div>
                          <div className="proj-status" style={{fontSize:10,padding:"3px 8px",borderRadius:10,textAlign:"center",background:st==="Active"?"rgba(91,156,246,.1)":st==="Review"?"rgba(240,164,41,.1)":"rgba(61,220,132,.1)",color:st==="Active"?"var(--blue)":st==="Review"?"var(--amber)":"var(--green)"}}>{st}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 2: Appraisal Input */}
                {step===2&&(
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                      <div>
                        <div style={{fontSize:16,fontFamily:"var(--font-display)",fontWeight:300}}>Chiswick Tower — BTR Appraisal</div>
                        <div style={{fontSize:11,color:"var(--text-d)"}}>Hammersmith, London · GBP / SONIA 3.97%</div>
                      </div>
                      <div style={{fontSize:10,color:"var(--green)",background:"rgba(61,220,132,.1)",padding:"4px 10px",borderRadius:10}}>● Live calculation</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                      <div>
                        {[["Units (OMR)","189"],["Units (DMR)","62"],["Avg Rent OMR (pcm)","£2,850"],["Exit Yield","4.15%"],["Build Cost (psf)","£285"],["Finance Margin","2.50%"]].map(([l,v])=>(
                          <div key={l} style={{marginBottom:10}}>
                            <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:5}}>{l}</div>
                            <div style={{background:l==="Avg Rent OMR (pcm)"?"var(--bg3)":"var(--bg3)",border:`1px solid ${l==="Avg Rent OMR (pcm)"?"var(--gold)":"var(--border)"}`,boxShadow:l==="Avg Rent OMR (pcm)"?"0 0 0 2px rgba(201,168,76,.1)":"none",borderRadius:7,padding:"8px 11px",color:"var(--text)",fontSize:13,fontFamily:"var(--font-mono)"}}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{background:"var(--bg3)",border:"1px solid rgba(201,168,76,.2)",borderRadius:10,padding:16,height:"fit-content"}}>
                        <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Live Output</div>
                        {[["Gross NOI","£8,643,000","var(--text)"],["GDV (Exit)","£208,500,000","var(--gold)"],["Total Cost","£145,200,000","var(--text-m)"],["Profit","£63,300,000","var(--green)"],["Profit on Cost","43.7%","var(--green)"],["IRR (Unlevered)","39.7%","var(--blue)"],["SONIA all-in","6.47%","var(--amber)"]].map(([l,v,c])=>(
                          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--bg4)",fontSize:12}}>
                            <span style={{color:"var(--text-m)"}}>{l}</span>
                            <span style={{fontFamily:"var(--font-mono)",color:c,fontWeight:l.includes("Cost")||l.includes("IRR")?"600":"400"}}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Sensitivity */}
                {step===3&&(
                  <div>
                    <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>Sensitivity Analysis — Profit on Cost %</div>
                    <div style={{fontSize:11,color:"var(--text-d)",marginBottom:16}}>Exit yield (rows) vs monthly rent OMR (columns) · base case outlined</div>
                    <div style={{display:"grid",gridTemplateColumns:"80px repeat(5,1fr)",gap:4,fontSize:10}}>
                      <div/>
                      {["£2,600","£2,720","£2,850","£2,980","£3,100"].map(h=><div key={h} style={{textAlign:"center",color:"var(--text-d)",padding:"4px",textTransform:"uppercase",letterSpacing:".06em"}}>{h}</div>)}
                      {[
                        ["3.75%",["24.1%","a"],["28.3%","g"],["32.7%","g"],["37.1%","g"],["41.6%","g"]],
                        ["4.00%",["19.8%","a"],["23.7%","a"],["27.9%","g"],["32.1%","g"],["36.4%","g"]],
                        ["4.15%",["15.2%","r"],["19.8%","a"],["43.7%","base"],["28.4%","g"],["33.1%","g"]],
                        ["4.40%",["11.1%","r"],["15.3%","r"],["19.7%","a"],["24.2%","a"],["28.8%","g"]],
                        ["4.75%",["6.4%","r"],["10.2%","r"],["14.3%","r"],["18.6%","a"],["22.9%","a"]],
                      ].map(([yld,...cells])=>(
                        <>
                          <div key={yld} style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6,color:"var(--text-d)"}}>{yld}</div>
                          {cells.map(([v,t],ci)=>(
                            <div key={ci} style={{textAlign:"center",padding:"8px 4px",borderRadius:5,fontFamily:"var(--font-mono)",fontSize:11,fontWeight:t==="base"?600:500,
                              background:t==="r"?"rgba(244,100,95,.12)":t==="a"?"rgba(240,164,41,.1)":t==="base"?"rgba(61,220,132,.09)":"rgba(61,220,132,.09)",
                              color:t==="r"?"var(--red)":t==="a"?"var(--amber)":"var(--green)",
                              outline:t==="base"?"2px solid var(--gold)":"none",
                            }}>{v}</div>
                          ))}
                        </>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:16,marginTop:14}}>
                      {[["rgba(61,220,132,.15)","Above 20% target"],["rgba(240,164,41,.12)","15–20%"],["rgba(244,100,95,.12)","Below 15%"]].map(([bg,l])=>(
                        <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--text-d)"}}>
                          <div style={{width:10,height:10,borderRadius:2,background:bg}}/>
                          {l}
                        </div>
                      ))}
                      <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--gold)"}}>◻ Base case</div>
                    </div>
                  </div>
                )}

                {/* Step 4: AI Review */}
                {step===4&&(
                  <div>
                    <div style={{background:"var(--bg3)",border:"1px solid rgba(91,156,246,.2)",borderRadius:12,padding:20,marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                        <div style={{fontSize:13,fontWeight:500}}>⬡ AI Market Review — Chiswick Tower BTR</div>
                        <div style={{fontSize:10,background:"rgba(91,156,246,.1)",color:"var(--blue)",padding:"3px 10px",borderRadius:10,letterSpacing:".06em",textTransform:"uppercase"}}>Powered by Claude</div>
                      </div>
                      <div style={{fontSize:14,fontWeight:600,color:"var(--green)",marginBottom:10}}>◆ Strong — Above market target</div>
                      <div style={{fontSize:13,color:"var(--text-m)",lineHeight:1.75,marginBottom:14}}>Exit yield of 4.15% sits within the London BTR institutional range of 3.75–4.50%, reflecting Hammersmith's premium location. OMR rents of £2,850 pcm are broadly in line with comparable 1-bed stock in W6, though 5–8% below recent prime transactions on the river.</div>
                      <div style={{fontSize:11,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Suggested Amendments</div>
                      {[
                        ["Reduce void assumption from 2.0% to 1.5% — Hammersmith vacancy has averaged 0.9% over 24 months.","Impact: +£1.2m NOI"],
                        ["OMR rents supportable at £2,950–3,050 pcm based on Oct–Dec 2025 lettings data.","Impact: +£340k NOI pa / +2.1% PoC"],
                        ["Consider phasing DMR block separately — planning risk concentrated.","No financial impact, structural risk reduction"],
                      ].map(([t,i],idx)=>(
                        <div key={idx} style={{background:"var(--bg4)",borderLeft:"2px solid var(--gold)",padding:"8px 12px",borderRadius:"0 6px 6px 0",fontSize:12,color:"var(--text-m)",marginBottom:7,lineHeight:1.6}}>
                          ▸ {t} <span style={{color:"var(--green)",fontWeight:600}}>{i}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Brochure */}
                {step===5&&(
                  <div>
                    <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12,textTransform:"uppercase",letterSpacing:".08em"}}>Branded Investor Brochure — Live Preview</div>
                    <div style={{background:"#fff",borderRadius:10,overflow:"hidden",marginBottom:12}}>
                      <div style={{background:"#06070a",padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <div style={{fontFamily:"Georgia,serif",color:"#c9a84c",fontSize:17,letterSpacing:".15em",fontWeight:300}}>HARRINGTON CAPITAL</div>
                          <div style={{fontSize:9,color:"rgba(255,255,255,.4)",marginTop:2,letterSpacing:".1em"}}>INSTITUTIONAL INVESTMENT MEMORANDUM</div>
                        </div>
                        <div style={{fontSize:9,color:"rgba(201,168,76,.6)",letterSpacing:".08em"}}>CONFIDENTIAL</div>
                      </div>
                      <div style={{padding:"18px 22px"}}>
                        <div style={{fontSize:18,fontWeight:600,color:"#06070a",marginBottom:4}}>Chiswick Tower</div>
                        <div style={{fontSize:11,color:"#888",marginBottom:16}}>251-unit Build to Rent · Hammersmith Grove, London W6 · Institutional Forward Fund</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                          {[["GDV","£208.5m","#06070a"],["Profit on Cost","43.7%","#2d7a4a"],["IRR (Unlev.)","39.7%","#1a4fa0"],["Exit Yield","4.15%","#06070a"]].map(([l,v,c])=>(
                            <div key={l} style={{background:"#f5f4f1",borderRadius:8,padding:12}}>
                              <div style={{fontSize:9,color:"#999",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{l}</div>
                              <div style={{fontSize:16,fontWeight:600,color:c}}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                      <div>
                        <div style={{fontSize:10,color:"var(--text-d)",marginBottom:4}}>Live investor link — always shows latest version</div>
                        <div style={{fontSize:12,color:"var(--blue)",fontFamily:"var(--font-mono)"}}>valora.app/share/chiswick-tower-jh2026</div>
                      </div>
                      <button className="btn-primary" style={{fontSize:12,padding:"8px 18px"}}>Copy Link</button>
                    </div>
                    <div style={{marginTop:20,textAlign:"center"}}>
                      <p style={{fontSize:13,color:"var(--text-m)",marginBottom:14}}>Ready to build your first appraisal?</p>
                      <button className="btn-primary" onClick={onLogin} style={{fontSize:14,padding:"13px 32px"}}>Start 14-Day Free Trial — No Card Needed →</button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Step nav footer */}
          <div className="demo-step-footer" style={{borderTop:"1px solid var(--border)",padding:"14px 24px",display:"flex",alignItems:"center",gap:12,background:"var(--bg2)",flexShrink:0}}>
            <button className="btn-ghost" onClick={()=>setStep(s=>Math.max(1,s-1))} style={{padding:"7px 16px",fontSize:12}} disabled={step===1}>← Previous</button>
            <div style={{display:"flex",gap:8,flex:1,justifyContent:"center"}}>
              {DEMO_STEPS.map(s=>(
                <div key={s.id} onClick={()=>setStep(s.id)} style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,cursor:"pointer",background:step===s.id?"var(--gold)":step>s.id?"rgba(61,220,132,.15)":"var(--bg4)",color:step===s.id?"#06070a":step>s.id?"var(--green)":"var(--text-d)",fontWeight:step===s.id?600:400,transition:"all .25s",border:step>s.id?"1px solid rgba(61,220,132,.3)":"1px solid var(--border)"}}>{s.id}</div>
              ))}
            </div>
            {step<5 ? (
              <button className="btn-primary" onClick={()=>setStep(s=>Math.min(5,s+1))} style={{padding:"8px 20px",fontSize:12}}>Next →</button>
            ) : (
              <button className="btn-primary" onClick={onLogin} style={{padding:"8px 20px",fontSize:12}}>Start Free Trial →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── LANDING ─────────────────────── */
function Landing({onLogin,onPage,scrolled}) {
  const [demoOpen,setDemoOpen]=useState(false);

  return (
    <div>
      <Nav onLogin={onLogin} onPage={onPage} scrolled={scrolled} currentPage="landing"/>
      {demoOpen && <DemoModal onClose={()=>setDemoOpen(false)} onLogin={onLogin}/>}

      {/* HERO */}
      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden",paddingTop:80}}>
        <div className="glow" style={{width:800,height:600,top:"10%",left:"40%",background:"radial-gradient(ellipse,rgba(201,168,76,.06) 0%,transparent 65%)"}}/>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"}}/>
        <div className="container" style={{position:"relative",zIndex:1}}>
          <div className="hero-grid" style={{display:"grid",gridTemplateColumns:"55% 45%",gap:60,alignItems:"center"}}>
            <div>
              <div className="fu d-1" style={{marginBottom:22}}><span className="badge">◆ Institutional Development Appraisal Platform</span></div>
              <h1 className="fu d-2" style={{fontFamily:"var(--font-display)",fontSize:"clamp(44px,5vw,72px)",fontWeight:300,lineHeight:1.06,marginBottom:28,letterSpacing:"-.01em"}}>
                The appraisal platform<br/>
                <em className="grad-text" style={{fontStyle:"italic"}}>serious developers</em><br/>
                actually use
              </h1>
              <p className="fu d-3" style={{fontSize:17,color:"var(--text-m)",lineHeight:1.75,maxWidth:500,marginBottom:36}}>
                Model BTR, BTS, hotel and residential flip projects with investment-bank rigour. Monthly cash flows, live benchmark curves, AI market comparables, and branded investor brochures — all in one platform.
              </p>
              <div className="fu d-4 hero-btns" style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:44}}>
                <button className="btn-primary" onClick={onLogin} style={{fontSize:14,padding:"14px 30px"}}>Start Free Trial — No Card Needed</button>
                <button className="btn-ghost" style={{fontSize:14,padding:"13px 24px"}} onClick={()=>setDemoOpen(true)}>Watch 3-min Demo ▶</button>
              </div>
              <div className="fu d-5" style={{display:"flex",gap:28,paddingTop:28,borderTop:"1px solid var(--border)",flexWrap:"wrap"}}>
                {[["£60bn+","GDV modelled"],["30,000+","Deals analysed"],["10","Benchmark rates"],["ISO 27001","Certified"]].map(([v,l])=>(
                  <div key={l}><div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:500,color:"var(--gold-l)"}}>{v}</div><div style={{fontSize:11,color:"var(--text-d)",marginTop:2}}>{l}</div></div>
                ))}
              </div>
            </div>
            <div className="hero-cards fu d-5" style={{position:"relative",height:520}}>
              <AppraisalMock/>
              <SensitivityMock/>
              <AIReviewMock style={{top:250,left:20}}/>
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
          {[...Array(2)].map((_,ri)=>(
            ["Monthly Cash Flow","Residual Land Value","Live SONIA Curve","Sensitivity Matrices","3-Tier Waterfall","AI Comparables","Branded Brochures","Audit Trail","Auto SDLT","Scenario Manager","Pipeline Boards","Template Library","Multi-Currency","Team Collaboration","Lender Reports"].map((item,i)=>(
              <span key={`${ri}-${i}`} className="ticker-item"><span style={{color:"var(--gold)",fontSize:10}}>◆</span>{item}</span>
            ))
          ))}
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
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(32px,4vw,52px)",fontWeight:300,lineHeight:1.1,marginBottom:18}}>
              Everything you need,<br/><em className="grad-text" style={{fontStyle:"italic"}}>precisely engineered</em>
            </h2>
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
              <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3vw,44px)",fontWeight:300,lineHeight:1.1,marginBottom:18}}>
                Your entire deal pipeline,<br/><em style={{color:"var(--gold)",fontStyle:"italic"}}>one place</em>
              </h2>
              <p style={{fontSize:15,color:"var(--text-m)",lineHeight:1.8}}>Kanban pipeline boards with customisable deal stages. Move projects from Prospect through to Completion. Private personal boards and shared team boards. Every appraisal linked, always in sync.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 24px",alignContent:"start",paddingTop:8}}>
              {[
                ["Customisable stages","Name your deal stages to match your exact workflow."],
                ["Personal & team boards","Private boards plus shared team views — both in one account."],
                ["Archive & restore","Remove clutter without losing any project history."],
                ["Multiple appraisals","Link several appraisal scenarios to a single deal card."],
              ].map(([title,sub],i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{width:28,height:28,borderRadius:7,background:"var(--gold-bg)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--gold)",fontSize:12,flexShrink:0,marginTop:1}}>✓</div>
                  <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:3}}>{title}</div><div style={{fontSize:12,color:"var(--text-d)",lineHeight:1.55}}>{sub}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:16,padding:"20px 20px 24px",overflowX:"auto"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,paddingBottom:14,borderBottom:"1px solid var(--border)",flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:15,fontWeight:500}}>Harrington Capital</div>
                <div style={{fontSize:10,color:"var(--text-d)",background:"var(--bg4)",padding:"2px 10px",borderRadius:20,letterSpacing:".08em",textTransform:"uppercase"}}>Deal Pipeline</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{fontSize:11,color:"var(--text-d)"}}>6 active deals</div>
                <div style={{width:1,height:14,background:"var(--border)"}}/>
                <div style={{fontSize:11,color:"var(--gold)",cursor:"pointer"}}>+ New Project</div>
              </div>
            </div>
            <div style={{minWidth:560}}><PipelineMock/></div>
            <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid var(--border)",display:"flex",gap:20,flexWrap:"wrap"}}>
              {[["6","Active"],["2","Completed"],["£253m","Total GDV"],["29.4%","Avg PoC"]].map(([v,l])=>(
                <div key={l} style={{display:"flex",gap:6,alignItems:"baseline"}}>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:13,fontWeight:500,color:"var(--text)"}}>{v}</span>
                  <span style={{fontSize:11,color:"var(--text-d)"}}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ASSET TYPES */}
      <section style={{padding:"90px 0"}}>
        <div className="container">
          <div style={{textAlign:"center",marginBottom:60}}>
            <div className="badge" style={{marginBottom:20}}>Asset Coverage</div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,48px)",fontWeight:300,lineHeight:1.12}}>
              Four specialist models.<br/><em className="grad-text" style={{fontStyle:"italic"}}>Not a generic spreadsheet.</em>
            </h2>
          </div>
          <div className="asset-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
            {[
              {abbr:"BTR",color:"var(--gold)",label:"Build to Rent",desc:"OMR/DMR unit tables, NIY, exit yields, OpEx budget, stabilisation ramp, promote waterfall, benchmark curves",badge:"Most Popular"},
              {abbr:"BTS",color:"var(--blue)",label:"Build to Sell",desc:"£/sqft sales price, unit absorption schedule, phased drawdowns, agent fees, margin by phase",badge:""},
              {abbr:"HTL",color:"var(--amber)",label:"Hotel Acquisition",desc:"ADR, occupancy, RevPAR, EBITDA margin, cap rate, CapEx repositioning budget, stabilisation timeline",badge:""},
              {abbr:"FLP",color:"var(--green)",label:"House Flip",desc:"Purchase price, SDLT, refurb budget, bridging finance, hold period, ROI on equity deployed",badge:""},
            ].map((t,i)=>(
              <div key={i} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:24,position:"relative",transition:"border-color .25s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=t.color+"66"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
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
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(30px,3.5vw,52px)",fontWeight:300,lineHeight:1.1,marginBottom:20}}>
              Built for the complexity<br/><em className="grad-text" style={{fontStyle:"italic"}}>real deals demand</em>
            </h2>
            <p style={{fontSize:16,color:"var(--text-m)",maxWidth:540,margin:"0 auto",lineHeight:1.75}}>
              Spreadsheets break. Generic tools make assumptions your deals don't. Valora was built by developers who needed a platform that understood the actual mechanics of property finance.
            </p>
          </div>
          <div className="why-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:64}}>
            {[
              {problem:"Spreadsheet errors cost deals",stat:"80%",statLabel:"of spreadsheets contain at least one material error",solution:"Valora's calculation engine is audited, version-controlled, and produces consistent results — with a full field-level audit trail.",icon:"⚠",color:"var(--red)"},
              {problem:"Generic tools don't speak property",stat:"0",statLabel:"standard finance tools understand NIY, OMR/DMR splits, or promote waterfalls",solution:"Every input, every metric, every output is purpose-built for property development — from SDLT bands to stabilisation ramps to JV distributions.",icon:"⊠",color:"var(--amber)"},
              {problem:"Investors and lenders need more",stat:"1",statLabel:"link is all it takes for investors to see your live appraisal",solution:"Branded brochures, live investor portals, lender-formatted cashflows and AI market comparables — all generated directly from the same model.",icon:"◈",color:"var(--gold)"},
            ].map((card,i)=>(
              <div key={i} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:16,padding:32,display:"flex",flexDirection:"column",gap:20}}>
                <div style={{width:44,height:44,borderRadius:11,background:card.color+"12",border:`1px solid ${card.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:card.color}}>{card.icon}</div>
                <div>
                  <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:6,fontWeight:500}}>The Problem</div>
                  <div style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:500,color:"var(--text)",lineHeight:1.2}}>{card.problem}</div>
                </div>
                <div style={{background:card.color+"08",border:`1px solid ${card.color}20`,borderRadius:10,padding:"14px 16px"}}>
                  <div style={{fontFamily:"var(--font-display)",fontSize:36,fontWeight:300,color:card.color,lineHeight:1,marginBottom:6}}>{card.stat}</div>
                  <div style={{fontSize:12,color:"var(--text-m)",lineHeight:1.5}}>{card.statLabel}</div>
                </div>
                <div>
                  <div style={{fontSize:10,color:"var(--green)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:8,fontWeight:500}}>The Valora Solution</div>
                  <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.7}}>{card.solution}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:16,padding:"36px 40px"}}>
            <div style={{textAlign:"center",marginBottom:36}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:300,color:"var(--text)",marginBottom:8}}>One platform. The complete workflow.</div>
              <p style={{fontSize:14,color:"var(--text-m)"}}>From first feasibility to signed investment agreement.</p>
            </div>
            <div className="workflow-grid" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:0}}>
              {[
                {n:"01",label:"Model",icon:"⟳",desc:"Revenue, costs, cashflow, finance — all live"},
                {n:"02",label:"Analyse",icon:"▦",desc:"Sensitivity, IRR, yield on cost, scenarios"},
                {n:"03",label:"Stress Test",icon:"◉",desc:"Promote waterfall, lender terms, AI review"},
                {n:"04",label:"Present",icon:"⬛",desc:"Branded brochure, live investor portal"},
                {n:"05",label:"Govern",icon:"◷",desc:"Audit trail, team access, version control"},
              ].map((step,i)=>(
                <div key={i} style={{textAlign:"center",padding:"0 20px",borderLeft:i>0?"1px solid var(--border)":"none"}}>
                  <div style={{fontFamily:"var(--font-display)",fontSize:11,color:"var(--text-d)",marginBottom:12,letterSpacing:".1em"}}>{step.n}</div>
                  <div style={{width:44,height:44,borderRadius:"50%",margin:"0 auto 14px",background:"var(--gold-bg)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"var(--gold)"}}>{step.icon}</div>
                  <div style={{fontSize:14,fontWeight:500,color:"var(--text)",marginBottom:6}}>{step.label}</div>
                  <div style={{fontSize:11,color:"var(--text-d)",lineHeight:1.55}}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOR LENDERS */}
      <section id="lenders" style={{padding:"90px 0"}}>
        <div className="container">
          <div className="lender-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:72,alignItems:"center"}}>
            <div>
              <div className="badge badge-blue" style={{marginBottom:20}}>For Lenders & Banks</div>
              <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3vw,44px)",fontWeight:300,lineHeight:1.12,marginBottom:20}}>
                Reports your underwriting<br/>team will <em style={{color:"var(--gold)",fontStyle:"italic"}}>actually trust</em>
              </h2>
              <p style={{fontSize:15,color:"var(--text-m)",lineHeight:1.8,marginBottom:28}}>
                Valora's standardised format is designed for lender review. The monthly cashflow shows exactly how your facility will be drawn down month-by-month, with interest calculated on actual drawn balances — giving you and your lender a precise, defensible cost of finance.
              </p>
              {[
                ["Cashflow-based interest calculation","Interest calculated on drawn balances, not estimated lump-sum"],
                ["Lender-formatted reports","Professional PDF with your developer's branding + standardised data"],
                ["Live share links","Lenders always see the latest version — no stale email attachments"],
                ["Override mode","Match your appraisal exactly to the lender's assumed debt costs"],
              ].map(([title,sub],i)=>(
                <div key={i} style={{display:"flex",gap:14,marginBottom:18}}>
                  <div style={{width:36,height:36,borderRadius:8,background:"var(--gold-bg)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--gold)",fontSize:14,flexShrink:0}}>✓</div>
                  <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:3}}>{title}</div><div style={{fontSize:12,color:"var(--text-d)"}}>{sub}</div></div>
                </div>
              ))}
            </div>
            <div>
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:24,overflowX:"auto"}}>
                <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:16}}>Finance Calculation — Cashflow Method</div>
                <div style={{minWidth:340}}>
                  {[
                    ["Month","Drawn Balance","Interest","Net CF"],
                    ["Oct 2028","£8.2m","£44,733","(£892k)"],
                    ["Nov 2028","£11.7m","£63,788","(£1.2m)"],
                    ["Dec 2028","£16.4m","£89,400","(£1.7m)"],
                    ["Jan 2029","£22.1m","£120,495","(£2.1m)"],
                    ["Feb 2029","£29.8m","£162,455","(£3.1m)"],
                  ].map((row,i)=>(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",padding:`${i===0?6:8}px 0`,borderBottom:"1px solid var(--bg4)",fontSize:i===0?9:11}}>
                      {row.map((cell,j)=>(
                        <div key={j} style={{color:i===0?"var(--text-d)":j===2?"var(--amber)":j===3?"var(--red)":"var(--text-m)",fontFamily:i>0?"var(--font-mono)":"var(--font-body)",fontWeight:i===0?500:400,textTransform:i===0?"uppercase":"none",letterSpacing:i===0?".07em":"0"}}>{cell}</div>
                      ))}
                    </div>
                  ))}
                  <div style={{marginTop:14,padding:"10px 0",borderTop:"1px solid var(--gold)44",display:"flex",justifyContent:"space-between",fontSize:12}}>
                    <span style={{color:"var(--text-m)"}}>Total interest (cashflow method)</span>
                    <span style={{color:"var(--gold)",fontFamily:"var(--font-mono)",fontWeight:600}}>£22,155,314</span>
                  </div>
                  <div style={{fontSize:10,color:"var(--green)",marginTop:6}}>✓ Draws only on what's needed — more accurate than half-facility estimate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section style={{padding:"80px 0",background:"var(--bg1)",borderTop:"1px solid var(--border)"}}>
        <div className="container">
          <div style={{textAlign:"center",marginBottom:60}}>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3vw,44px)",fontWeight:300}}>
              From site to signed deal —<em className="grad-text" style={{fontStyle:"italic"}}> under an hour</em>
            </h2>
          </div>
          <div className="workflow-grid" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:0,position:"relative"}}>
            <div style={{position:"absolute",top:28,left:"10%",right:"10%",height:1,background:"linear-gradient(90deg,transparent,rgba(201,168,76,.3),rgba(201,168,76,.3),rgba(201,168,76,.3),transparent)"}}/>
            {[
              {n:"01",title:"New Appraisal",desc:"Pick asset type, currency, benchmark. 30 seconds."},
              {n:"02",title:"Input Revenue",desc:"Unit mix, rents, yields. Live NOI as you type."},
              {n:"03",title:"Model Costs",desc:"S-curve profiles, phased drawdowns, auto SDLT."},
              {n:"04",title:"Run the Model",desc:"Monthly CF, IRR, sensitivity, waterfall — instant."},
              {n:"05",title:"Share Brochure",desc:"Branded report. Live investor link. Done."},
            ].map((step,i)=>(
              <div key={i} style={{textAlign:"center",padding:"0 16px",position:"relative"}}>
                <div style={{width:58,height:58,borderRadius:"50%",margin:"0 auto 20px",background:"var(--bg2)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-display)",fontSize:18,fontWeight:500,color:"var(--gold)",position:"relative",zIndex:1}}>{step.n}</div>
                <div style={{fontSize:14,fontWeight:500,color:"var(--text)",marginBottom:8}}>{step.title}</div>
                <div style={{fontSize:12,color:"var(--text-m)",lineHeight:1.6}}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{padding:"90px 0"}}>
        <div className="container">
          <div style={{textAlign:"center",marginBottom:56}}>
            <div className="badge" style={{marginBottom:20}}>What Developers Say</div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,3vw,42px)",fontWeight:300}}>
              Used by developers across London,<br/>the Gulf, and Southeast Asia
            </h2>
          </div>
          <div className="testi-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className="testi">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div className="stars">{"★".repeat(t.stars)}</div>
                  <span style={{fontSize:9,color:"var(--text-d)",background:"var(--bg4)",padding:"2px 8px",borderRadius:20,letterSpacing:".08em",textTransform:"uppercase"}}>{t.tag}</span>
                </div>
                <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.8,fontStyle:"italic"}}>"{t.q}"</p>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"var(--gold-bg)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:"var(--gold)",flexShrink:0}}>{t.name.split(" ").map(n=>n[0]).join("")}</div>
                  <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{t.name}</div><div style={{fontSize:11,color:"var(--text-d)"}}>{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:"90px 0",background:"var(--bg1)",borderTop:"1px solid var(--border)"}}>
        <div className="container">
          <div style={{textAlign:"center",marginBottom:60}}>
            <div className="badge" style={{marginBottom:20}}>Pricing</div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,48px)",fontWeight:300,marginBottom:14}}>Start free. Scale as you grow.</h2>
            <p style={{fontSize:15,color:"var(--text-m)"}}>14-day free trial on all plans. No credit card required.</p>
          </div>
          <div className="pricing-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,maxWidth:920,margin:"0 auto"}}>
            {[
              {name:"Starter",price:"£195",period:"/mo",desc:"For individual developers and valuers running 1–2 projects at a time.",features:["5 active appraisals","BTR, BTS, Hotel, Flip models","Monthly cash flow engine","Sensitivity matrices","PDF brochures","3 users"],featured:false,cta:"Start Free Trial"},
              {name:"Professional",price:"£595",period:"/mo",desc:"For growing teams working on multiple developments simultaneously.",features:["Unlimited appraisals","All asset types + specialist models","Scenario manager (3 scenarios)","3-tier promote waterfall","AI market comparables","Branded investor brochures","Audit trail","Live investor portal links","Excel export","8 users"],featured:true,cta:"Start Free Trial"},
              {name:"Enterprise",price:"Custom",period:"",desc:"For funds, institutional developers and multi-team platforms.",features:["Unlimited users + workspaces","White-label platform","SSO & RBAC","Custom integrations & API","Dedicated onboarding","2-hour SLA support","Custom reporting templates","Lender portal access"],featured:false,cta:"Contact Sales"},
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
                <button className={plan.featured?"btn-primary":"btn-ghost"} style={{width:"100%",justifyContent:"center",padding:"13px"}} onClick={onLogin}>{plan.cta}</button>
              </div>
            ))}
          </div>
          <p style={{textAlign:"center",marginTop:28,fontSize:12,color:"var(--text-d)"}}>All prices exclude VAT. Annual billing available at 20% discount.</p>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"100px 0",position:"relative",overflow:"hidden"}}>
        <div className="glow" style={{width:700,height:500,top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"radial-gradient(ellipse,rgba(201,168,76,.09) 0%,transparent 65%)"}}/>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"}}/>
        <div className="container" style={{textAlign:"center",position:"relative",zIndex:1}}>
          <div className="badge" style={{marginBottom:24}}>Get Started Today</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(34px,4.5vw,64px)",fontWeight:300,lineHeight:1.08,marginBottom:24}}>
            The platform your investors,<br/>lenders and team all need
          </h2>
          <p style={{fontSize:17,color:"var(--text-m)",maxWidth:520,margin:"0 auto 40px",lineHeight:1.75}}>
            Join developers across London and the Middle East who have replaced their Excel models with Valora's institutional-grade appraisal engine.
          </p>
          <div className="cta-btns" style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn-primary" onClick={onLogin} style={{fontSize:15,padding:"15px 36px"}}>Start 14-Day Free Trial →</button>
            <button className="btn-ghost" style={{fontSize:15,padding:"14px 28px"}}>Book a Live Demo</button>
          </div>
          <div style={{marginTop:32,fontSize:12,color:"var(--text-d)",display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
            {["No credit card required","Setup in 5 minutes","Full feature access","ISO 27001 certified"].map(t=>(
              <span key={t} style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"var(--green)",fontSize:10}}>●</span>{t}</span>
            ))}
          </div>
        </div>
      </section>

      <Footer onPage={onPage}/>
    </div>
  );
}

/* ─────────────────────── LEGAL PAGE WRAPPER ─────────────────────── */
function LegalPage({title,lastUpdated,children,onLogin,onPage,scrolled}) {
  return (
    <div>
      <Nav onLogin={onLogin} onPage={onPage} scrolled={scrolled} currentPage="legal"/>
      <div className="legal-content">
        <h1>{title}</h1>
        <div className="meta">Last updated: {lastUpdated} · Valora Technologies Ltd · Registered in England & Wales</div>
        {children}
      </div>
      <Footer onPage={onPage}/>
    </div>
  );
}

/* ─────────────────────── PRIVACY POLICY ─────────────────────── */
function PrivacyContent() {
  return (
    <>
      <p>Valora Technologies Ltd ("Valora", "we", "our", "us") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and share information when you use the Valora platform.</p>

      <h2>1. Who We Are</h2>
      <p>Valora Technologies Ltd is the data controller for personal data collected through this platform. We are registered in England & Wales. Our Data Protection Officer can be contacted at <a href="mailto:privacy@valoraplatform.com">privacy@valoraplatform.com</a>.</p>

      <h2>2. Data We Collect</h2>
      <h3>Account Data</h3>
      <p>When you register, we collect your name, email address, firm name, and professional role. We use this to create and manage your account.</p>
      <h3>Appraisal Data</h3>
      <p>All appraisal inputs, scenarios, and outputs you create are stored securely and associated with your account. This data belongs to you.</p>
      <h3>Usage Data</h3>
      <p>We collect anonymised data about how you use the platform — pages visited, features used, and session duration — to improve our service.</p>
      <h3>Payment Data</h3>
      <p>Payment information is processed by Stripe. We do not store card details. We receive only confirmation of payment and subscription status.</p>

      <h2>3. How We Use Your Data</h2>
      <ul>
        <li>To provide and maintain the Valora platform</li>
        <li>To send transactional emails (account confirmation, invoices, password resets)</li>
        <li>To improve platform performance and features</li>
        <li>To respond to support requests</li>
        <li>To comply with legal obligations</li>
      </ul>
      <p>We do not sell your personal data to third parties. We do not use your appraisal data to train AI models without your explicit consent.</p>

      <h2>4. Legal Basis for Processing</h2>
      <p>We process your data under the following lawful bases under UK GDPR: <strong>Contract</strong> (to deliver the service you've subscribed to), <strong>Legitimate Interests</strong> (to improve our platform and prevent fraud), and <strong>Legal Obligation</strong> (to comply with applicable law).</p>

      <h2>5. Data Retention</h2>
      <p>We retain your account data for the duration of your subscription plus 6 years (to comply with UK financial record-keeping requirements). You may request deletion of your data at any time by contacting us at <a href="mailto:privacy@valoraplatform.com">privacy@valoraplatform.com</a>.</p>

      <h2>6. Your Rights</h2>
      <p>Under UK GDPR, you have the right to: access your personal data, correct inaccurate data, request deletion ("right to be forgotten"), restrict processing, data portability, and object to processing. To exercise any of these rights, contact <a href="mailto:privacy@valoraplatform.com">privacy@valoraplatform.com</a>.</p>

      <h2>7. International Transfers</h2>
      <p>Your data is stored on servers within the European Economic Area (EEA) or United Kingdom. Where data is transferred internationally (e.g. to our cloud infrastructure providers), we ensure appropriate safeguards are in place including Standard Contractual Clauses.</p>

      <h2>8. Third-Party Services</h2>
      <ul>
        <li><strong>Stripe</strong> — payment processing (Stripe Privacy Policy applies)</li>
        <li><strong>Anthropic</strong> — AI market review feature (data is not retained for training)</li>
        <li><strong>Vercel</strong> — platform hosting and infrastructure</li>
        <li><strong>Supabase</strong> — database hosting</li>
      </ul>

      <h2>9. Changes to This Policy</h2>
      <p>We may update this policy from time to time. We will notify you of material changes by email or via the platform. Continued use after notification constitutes acceptance.</p>

      <h2>10. Contact Us</h2>
      <p>For any privacy-related questions, contact our Data Protection Officer at <a href="mailto:privacy@valoraplatform.com">privacy@valoraplatform.com</a> or write to us at: Valora Technologies Ltd, London, England.</p>
    </>
  );
}

/* ─────────────────────── TERMS OF SERVICE ─────────────────────── */
function TermsContent() {
  return (
    <>
      <p>These Terms of Service ("Terms") govern your use of the Valora platform operated by Valora Technologies Ltd. By accessing or using Valora, you agree to be bound by these Terms.</p>

      <h2>1. Definitions</h2>
      <p>"Platform" means the Valora web application and all associated services. "User" means any individual or organisation with a Valora account. "Content" means all data, appraisals, reports, and materials you create or upload.</p>

      <h2>2. Account Registration</h2>
      <p>You must provide accurate information when registering. You are responsible for maintaining the security of your account credentials. You must not share your account with unauthorised parties. Valora reserves the right to suspend accounts that violate these Terms.</p>

      <h2>3. Subscription and Payment</h2>
      <ul>
        <li>Subscriptions are billed monthly or annually in advance</li>
        <li>All prices are exclusive of VAT, which is applied at the applicable rate</li>
        <li>Annual subscriptions receive a 20% discount</li>
        <li>You may cancel at any time; cancellation takes effect at the end of the billing period</li>
        <li>Refunds are not provided for partial periods except where required by law</li>
        <li>Valora reserves the right to change pricing with 30 days' notice</li>
      </ul>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to: use the platform for unlawful purposes; attempt to reverse-engineer or copy the platform; use automated tools to scrape or extract data; misrepresent your identity or affiliation; or use the AI features to generate misleading appraisals intended to deceive investors or lenders.</p>

      <h2>5. Intellectual Property</h2>
      <p>The Valora platform, its design, algorithms, and source code are the intellectual property of Valora Technologies Ltd. Your Content remains your property. By using the platform, you grant Valora a limited licence to process your Content solely to provide the service.</p>

      <h2>6. Data and Confidentiality</h2>
      <p>Valora treats your appraisal data as confidential. We will not share, sell, or disclose your Content to third parties except as required to provide the service or comply with law. See our Privacy Policy for full details.</p>

      <h2>7. AI Features</h2>
      <p>The AI market review feature provides analysis for informational purposes only. It does not constitute financial, investment, or professional advice. You remain solely responsible for all decisions made based on appraisal outputs.</p>

      <h2>8. Disclaimer of Warranties</h2>
      <p>The platform is provided "as is". Valora makes no warranties regarding accuracy of calculations, market data, or AI outputs. You are responsible for verifying all appraisal outputs before relying on them for investment decisions.</p>

      <h2>9. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, Valora's total liability to you for any claim arising from use of the platform shall not exceed the fees paid by you in the 12 months preceding the claim. Valora shall not be liable for any indirect, consequential, or incidental losses.</p>

      <h2>10. Governing Law</h2>
      <p>These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>

      <h2>11. Changes to Terms</h2>
      <p>We may update these Terms with 30 days' notice. Material changes will be communicated by email. Continued use of the platform after changes take effect constitutes acceptance.</p>

      <h2>12. Contact</h2>
      <p>For any questions regarding these Terms, contact us at <a href="mailto:legal@valoraplatform.com">legal@valoraplatform.com</a>.</p>
    </>
  );
}

/* ─────────────────────── COOKIE POLICY ─────────────────────── */
function CookiesContent() {
  return (
    <>
      <p>This Cookie Policy explains how Valora Technologies Ltd uses cookies and similar technologies when you use the Valora platform.</p>

      <h2>1. What Are Cookies</h2>
      <p>Cookies are small text files stored on your device when you visit a website. They help us provide a better experience by remembering your preferences and understanding how you use the platform.</p>

      <h2>2. Cookies We Use</h2>
      <h3>Essential Cookies</h3>
      <p>These are necessary for the platform to function. They cannot be disabled.</p>
      <ul>
        <li><strong>session</strong> — Maintains your login session (expires when you close your browser)</li>
        <li><strong>csrf_token</strong> — Protects against cross-site request forgery attacks</li>
        <li><strong>preferences</strong> — Remembers your UI settings and display preferences</li>
      </ul>
      <h3>Analytics Cookies</h3>
      <p>We use anonymised analytics to understand how the platform is used. No personal data is collected.</p>
      <ul>
        <li><strong>_va_session</strong> — Tracks anonymous usage sessions (expires after 30 minutes of inactivity)</li>
        <li><strong>_va_user</strong> — Anonymous user identifier to understand feature adoption (expires after 1 year)</li>
      </ul>
      <h3>Payment Cookies</h3>
      <ul>
        <li><strong>__stripe_mid</strong> — Stripe fraud detection (expires after 1 year)</li>
        <li><strong>__stripe_sid</strong> — Stripe session tracking (expires after 30 minutes)</li>
      </ul>

      <h2>3. Managing Cookies</h2>
      <p>You can control cookies through your browser settings. Note that disabling essential cookies will prevent you from logging in or using core platform features. To manage cookies:</p>
      <ul>
        <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
        <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
        <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
        <li><strong>Edge:</strong> Settings → Cookies and Site Permissions</li>
      </ul>

      <h2>4. Third-Party Cookies</h2>
      <p>Our payment processor Stripe sets cookies necessary for secure payment processing. These are governed by <a href="https://stripe.com/gb/privacy" target="_blank" rel="noopener">Stripe's Privacy Policy</a>.</p>

      <h2>5. Updates</h2>
      <p>We may update this policy from time to time. Significant changes will be communicated via the platform. Contact <a href="mailto:privacy@valoraplatform.com">privacy@valoraplatform.com</a> with any questions.</p>
    </>
  );
}

/* ─────────────────────── ACCESSIBILITY ─────────────────────── */
function AccessibilityContent() {
  return (
    <>
      <p>Valora Technologies Ltd is committed to making the Valora platform accessible to all users, including those with disabilities. This statement describes the current accessibility status of our platform.</p>

      <h2>1. Our Commitment</h2>
      <p>We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. We continuously review and improve our platform to remove accessibility barriers.</p>

      <h2>2. Current Status</h2>
      <p>We are actively working towards full WCAG 2.1 AA compliance. The following features are currently implemented:</p>
      <ul>
        <li>Keyboard navigation throughout the platform</li>
        <li>Screen reader compatible form labels and inputs</li>
        <li>Sufficient colour contrast ratios (minimum 4.5:1 for body text)</li>
        <li>Text resizing support up to 200% without loss of content</li>
        <li>ARIA labels on interactive elements</li>
        <li>Skip to main content link on all pages</li>
        <li>Focus indicators on all interactive elements</li>
        <li>No content that flashes more than 3 times per second</li>
      </ul>

      <h2>3. Known Limitations</h2>
      <p>We are aware of the following areas where we are still improving:</p>
      <ul>
        <li>Some complex data tables in the appraisal engine may not be fully optimised for screen readers — we are adding enhanced ARIA roles</li>
        <li>PDF exports are not currently screen reader optimised — tagged PDF generation is on our roadmap</li>
        <li>Some chart visualisations do not yet have text alternatives — we are adding data table equivalents</li>
      </ul>

      <h2>4. Assistive Technologies</h2>
      <p>The platform has been tested with the following assistive technologies:</p>
      <ul>
        <li>NVDA with Chrome on Windows</li>
        <li>VoiceOver with Safari on macOS and iOS</li>
        <li>TalkBack with Chrome on Android</li>
        <li>Dragon NaturallySpeaking (voice control)</li>
      </ul>

      <h2>5. Feedback and Contact</h2>
      <p>If you experience any accessibility barriers or would like to request content in an alternative format, please contact us:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:accessibility@valoraplatform.com">accessibility@valoraplatform.com</a></li>
        <li><strong>Response time:</strong> We aim to respond within 2 business days</li>
      </ul>
      <p>We take all accessibility feedback seriously and will work to resolve reported issues promptly.</p>

      <h2>6. Enforcement</h2>
      <p>If you are not satisfied with our response to your accessibility concern, you may contact the Equality Advisory and Support Service (EASS) at <a href="https://www.equalityadvisoryservice.com" target="_blank" rel="noopener">equalityadvisoryservice.com</a>.</p>

      <h2>7. Review Schedule</h2>
      <p>This statement was prepared on 1 March 2026. We review and update it every 12 months, or sooner if significant changes are made to the platform.</p>
    </>
  );
}

/* ─────────────────────── SUPPORT PAGE ─────────────────────── */
function SupportPage({onLogin,onPage,scrolled}) {
  const [openFaq,setOpenFaq]=useState(null);

  const faqs = [
    {q:"How do I create my first appraisal?",a:"Click 'New Appraisal' from your dashboard, choose your asset type (BTR, BTS, Hotel, or Flip), select your currency and benchmark rate, and follow the wizard. Most users complete their first appraisal in under 15 minutes."},
    {q:"Which currencies and benchmark rates are supported?",a:"We support 10 currencies: GBP (SONIA), USD (SOFR), EUR (EURIBOR), AED (EIBOR), SGD (SORA), AUD (AONIA), JPY (TONA), CHF (SARON), CAD (CORRA), and HKD (HONIA). Each uses the correct live benchmark forward curve."},
    {q:"Can I share appraisals with investors?",a:"Yes. From any appraisal, click 'Share' to generate a branded investor brochure with a live link. Investors see your firm's colours and logo, and the link always shows the latest version of your model."},
    {q:"How does the AI market review work?",a:"The AI review benchmarks your specific assumptions against current market data. It produces a verdict rating (Strong / Acceptable / Marginal / Weak), identifies key risks, and suggests specific amendments with estimated financial impact. You can optionally include this in investor brochures."},
    {q:"How many users can I add to my account?",a:"The Starter plan includes 3 users. Professional includes 8 users. Enterprise has unlimited users. Additional users can be added to Starter and Professional plans at £49/user/month."},
    {q:"Can I export appraisals to Excel or PDF?",a:"Professional and Enterprise plans include Excel export and PDF brochure generation. Starter plans can generate PDF brochures. Excel export includes the full model with formulas preserved."},
    {q:"Is my data secure?",a:"Yes. Valora is ISO 27001 certified and GDPR compliant. All data is encrypted in transit and at rest. We undergo regular third-party security audits. Your appraisal data is never shared with other users or used to train AI models."},
    {q:"Can I cancel my subscription at any time?",a:"Yes. You can cancel at any time from your account settings. Your subscription remains active until the end of the current billing period. We do not offer pro-rata refunds for partial periods."},
    {q:"What is the difference between Day 1, Stabilised and Exit valuations?",a:"Day 1 is the value at practical completion (partially let). Stabilised is the value once fully occupied (post-stabilisation period, with rent growth applied). Exit is the value at your chosen disposal date, further trended. All three are calculated automatically from your inputs."},
    {q:"How do I set up the promote waterfall?",a:"In the Finance tab of your appraisal, set your three IRR hurdles. The waterfall automatically calculates developer and investor allocations across all tiers, with a visual split bar showing the distribution."},
  ];

  return (
    <div>
      <Nav onLogin={onLogin} onPage={onPage} scrolled={scrolled} currentPage="support"/>

      {/* Hero */}
      <div style={{padding:"120px 0 60px",background:"var(--bg1)",borderBottom:"1px solid var(--border)"}}>
        <div className="container" style={{textAlign:"center"}}>
          <div className="badge" style={{marginBottom:20}}>Support Centre</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(32px,4vw,56px)",fontWeight:300,marginBottom:16}}>
            How can we <em style={{color:"var(--gold)",fontStyle:"italic"}}>help?</em>
          </h1>
          <p style={{fontSize:16,color:"var(--text-m)",maxWidth:500,margin:"0 auto 36px",lineHeight:1.7}}>
            Our team typically responds within 2 business hours on the Professional plan, and within 24 hours on Starter.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="mailto:support@valoraplatform.com"><button className="btn-primary" style={{fontSize:14,padding:"13px 28px"}}>Email Support</button></a>
            <button className="btn-ghost" onClick={onLogin} style={{fontSize:14,padding:"12px 24px"}}>Open Platform</button>
          </div>
        </div>
      </div>

      {/* Contact cards */}
      <div className="container" style={{padding:"60px 40px"}}>
        <div className="support-grid">
          {[
            {icon:"✉",title:"Email Support",desc:"For account, billing, and technical queries. We aim to respond within 24 hours.",action:"support@valoraplatform.com",link:"mailto:support@valoraplatform.com"},
            {icon:"⚡",title:"Priority Support",desc:"Professional and Enterprise plans include 2-hour response SLA during business hours.",action:"Upgrade to Professional →",link:"#pricing"},
            {icon:"◈",title:"Onboarding",desc:"Enterprise plans include dedicated 1-on-1 onboarding and template setup from your existing models.",action:"Contact Sales →",link:"mailto:sales@valoraplatform.com"},
          ].map((c,i)=>(
            <div key={i} className="support-card" onClick={()=>window.open(c.link,"_self")}>
              <div style={{fontSize:28,marginBottom:16,color:"var(--gold)"}}>{c.icon}</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:500,marginBottom:10,color:"var(--text)"}}>{c.title}</div>
              <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.7,marginBottom:16}}>{c.desc}</p>
              <div style={{fontSize:13,color:"var(--gold)",fontWeight:500}}>{c.action}</div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div style={{maxWidth:720,margin:"60px auto 0"}}>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:32,fontWeight:300,marginBottom:8,textAlign:"center"}}>Frequently Asked Questions</h2>
          <p style={{fontSize:14,color:"var(--text-m)",textAlign:"center",marginBottom:40}}>Can't find what you're looking for? <a href="mailto:support@valoraplatform.com" style={{color:"var(--gold)"}}>Email us</a>.</p>
          {faqs.map((faq,i)=>(
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                <span>{faq.q}</span>
                <span style={{color:"var(--gold)",fontSize:18,flexShrink:0,marginLeft:16,transition:"transform .2s",transform:openFaq===i?"rotate(45deg)":"none"}}>+</span>
              </div>
              {openFaq===i&&<div className="faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>

        {/* Status */}
        <div style={{maxWidth:720,margin:"48px auto 0",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:"24px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:500,marginBottom:4}}>Platform Status</div>
            <div style={{fontSize:13,color:"var(--text-m)"}}>All systems operational · 99.9% uptime last 30 days</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 8px var(--green)"}}/>
            <span style={{fontSize:13,color:"var(--green)",fontWeight:500}}>Operational</span>
          </div>
        </div>
      </div>

      <Footer onPage={onPage}/>
    </div>
  );
}

/* ─────────────────────── LOGIN ─────────────────────── */
function Login({onBack}) {
  const [tab,setTab]=useState("signin");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [firm,setFirm]=useState("");
  const [assetFocus,setAssetFocus]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [loading,setLoading]=useState(false);
  const [success,setSuccess]=useState(false);
  const [errors,setErrors]=useState<any>({});

  const validate=()=>{ const e:any={}; if(!email||!email.includes("@"))e.email="Valid email required"; if(tab!=="reset"&&password.length<8)e.password="8+ characters required"; if(tab==="signup"&&!firm.trim())e.firm="Firm name required"; setErrors(e); return Object.keys(e).length===0; };
  const submit=async(ev)=>{
  ev.preventDefault();
  if(!validate())return;
  setLoading(true);
  if(tab==="signin"){
    const{error}=await supabase.auth.signInWithPassword({email,password});
    if(error){setErrors({email:error.message});setLoading(false);return;}
    window.location.href="/dashboard";
  } else if(tab==="signup"){
    const{error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name,firm_name:firm}}});
    if(error){setErrors({email:error.message});setLoading(false);return;}
    setLoading(false);setSuccess(true);
  } else if(tab==="reset"){
    const{error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/auth/callback`});
    if(error){setErrors({email:error.message});setLoading(false);return;}
    setLoading(false);setSuccess(true);
  }
};

  return (
    <div className="login-wrap">
      <style>{CSS}</style>
      {/* Left brand panel */}
      <div className="login-left">
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)",backgroundSize:"50px 50px",pointerEvents:"none"}}/>
        <div className="glow" style={{width:500,height:500,bottom:0,left:"-10%",background:"radial-gradient(ellipse,rgba(201,168,76,.06) 0%,transparent 65%)"}}/>
        <div style={{position:"relative",zIndex:1,paddingBottom:32}}>
          <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:10,padding:0}}>
            <span style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,color:"var(--gold)",letterSpacing:".1em"}}>VALORA</span>
            <span style={{fontSize:9,color:"var(--text-d)",letterSpacing:".18em",textTransform:"uppercase"}}>Pro</span>
          </button>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",position:"relative",zIndex:1}}>
          <div className="badge" style={{marginBottom:20,width:"fit-content"}}>◆ Institutional Appraisal</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(30px,3vw,48px)",fontWeight:300,lineHeight:1.1,marginBottom:20}}>
            Model with the<br/><em className="grad-text" style={{fontStyle:"italic"}}>precision of a<br/>trading floor</em>
          </h2>
          <p style={{fontSize:14,color:"var(--text-m)",lineHeight:1.8,maxWidth:360,marginBottom:40}}>Monthly cash flows against live benchmark curves. AI market comparables. Branded investor brochures. Everything your deal team needs.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {icon:"⟳",text:"Monthly CF Engine",sub:"SONIA / SOFR / EURIBOR forward curves"},
              {icon:"▦",text:"3×3 Sensitivity Matrices",sub:"45-scenario yield vs rent analysis"},
              {icon:"⬡",text:"AI Market Review",sub:"Benchmarked against live comparables"},
              {icon:"◉",text:"3-Tier Promote Waterfall",sub:"JV distribution built in"},
            ].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:14,alignItems:"center",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 16px"}}>
                <div className="ficon" style={{width:36,height:36,borderRadius:8,margin:0,fontSize:14}}>{item.icon}</div>
                <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:2}}>{item.text}</div><div style={{fontSize:11,color:"var(--text-d)"}}>{item.sub}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{position:"relative",zIndex:1,paddingTop:28,borderTop:"1px solid var(--border)",display:"flex",gap:20,flexWrap:"wrap"}}>
          {["ISO 27001 Certified","GDPR Compliant","256-bit AES","99.9% Uptime"].map(t=>(
            <span key={t} style={{fontSize:11,color:"var(--text-d)",display:"flex",alignItems:"center",gap:5}}>
              <span style={{color:"var(--green)",fontSize:9}}>●</span>{t}
            </span>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-right">
        <div style={{width:"100%",maxWidth:440}}>
          <button onClick={onBack} className="btn-ghost" style={{marginBottom:28,padding:"7px 16px",fontSize:12}}>← Back to site</button>
          {success ? (
            <div className="login-card" style={{textAlign:"center"}}>
              <div style={{width:64,height:64,borderRadius:"50%",margin:"0 auto 20px",background:"rgba(61,220,132,.1)",border:"1px solid rgba(61,220,132,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,color:"var(--green)"}}>✓</div>
              <h2 style={{fontFamily:"var(--font-display)",fontSize:26,fontWeight:400,marginBottom:10}}>{tab==="signin"?"Signing you in…":tab==="reset"?"Check your inbox":"Application received"}</h2>
              <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.7}}>{tab==="signin"?"Redirecting to your workspace in a moment.":tab==="reset"?`We've sent a reset link to ${email}.`:"We review every application personally. Expect to hear from us within 24 hours."}</p>
              {tab!=="signin"&&<button className="btn-ghost" style={{marginTop:24,width:"100%",justifyContent:"center"}} onClick={()=>{setSuccess(false);setTab("signin")}}>Back to sign in</button>}
            </div>
          ) : (
            <div className="login-card">
              {tab!=="reset"&&(
                <div className="tab-switch" style={{marginBottom:28}}>
                  <button className={`tab-btn ${tab==="signin"?"active":""}`} onClick={()=>setTab("signin")}>Sign In</button>
                  <button className={`tab-btn ${tab==="signup"?"active":""}`} onClick={()=>setTab("signup")}>Request Access</button>
                </div>
              )}
              <div style={{marginBottom:24}}>
                {tab==="reset"&&<button onClick={()=>setTab("signin")} style={{background:"none",border:"none",color:"var(--text-d)",fontSize:12,cursor:"pointer",marginBottom:14,padding:0,fontFamily:"var(--font-body)",display:"flex",alignItems:"center",gap:6}}>← Back to sign in</button>}
                <h1 style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:400,marginBottom:6,letterSpacing:"-.01em"}}>{tab==="signin"?"Welcome back":tab==="signup"?"Request access":"Reset your password"}</h1>
                <p style={{fontSize:13,color:"var(--text-m)"}}>{tab==="signin"?"Sign in to your Valora workspace":tab==="signup"?"Valora is invite-only. We'll be in touch within 24 hours.":"Enter your email and we'll send a reset link."}</p>
              </div>
              <form onSubmit={submit}>
                {tab==="signup"&&(
                  <>
                    <div style={{marginBottom:16}}>
                      <label style={{fontSize:11,color:"var(--text-m)",display:"block",marginBottom:6,letterSpacing:".07em",textTransform:"uppercase"}}>Full Name</label>
                      <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="James Harrington"/>
                    </div>
                    <div style={{marginBottom:16}}>
                      <label style={{fontSize:11,color:"var(--text-m)",display:"block",marginBottom:6,letterSpacing:".07em",textTransform:"uppercase"}}>Firm / Company</label>
                      <input className="inp" value={firm} onChange={e=>setFirm(e.target.value)} placeholder="Harrington Capital"/>
                      {errors.firm&&<div style={{fontSize:11,color:"var(--red)",marginTop:5}}>{errors.firm}</div>}
                    </div>
                  </>
                )}
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:11,color:"var(--text-m)",display:"block",marginBottom:6,letterSpacing:".07em",textTransform:"uppercase"}}>Email Address</label>
                  <input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="james@harringtoncap.com"/>
                  {errors.email&&<div style={{fontSize:11,color:"var(--red)",marginTop:5}}>{errors.email}</div>}
                </div>
                {tab!=="reset"&&(
                  <div style={{marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <label style={{fontSize:11,color:"var(--text-m)",letterSpacing:".07em",textTransform:"uppercase"}}>Password</label>
                      {tab==="signin"&&<button type="button" onClick={()=>setTab("reset")} style={{background:"none",border:"none",color:"var(--gold)",fontSize:11,cursor:"pointer",fontFamily:"var(--font-body)",padding:0}}>Forgot?</button>}
                    </div>
                    <div style={{position:"relative"}}>
                      <input className="inp" type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder={tab==="signup"?"Create a strong password":"Your password"} style={{paddingRight:44}} autoComplete={tab==="signup"?"new-password":"current-password"}/>
                      <button type="button" onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:13,fontFamily:"var(--font-body)"}}>{showPw?"Hide":"Show"}</button>
                    </div>
                    {errors.password&&<div style={{fontSize:11,color:"var(--red)",marginTop:5}}>{errors.password}</div>}
                    {tab==="signup"&&<div style={{marginTop:6,display:"flex",gap:4}}>{[1,2,3,4].map(i=><div key={i} style={{flex:1,height:3,borderRadius:2,background:password.length>=(i*2)?i<=2?"var(--amber)":"var(--green)":"var(--bg5)",transition:"background .3s"}}/>)}</div>}
                  </div>
                )}
                {tab==="signup"&&(
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:11,color:"var(--text-m)",display:"block",marginBottom:6,letterSpacing:".07em",textTransform:"uppercase"}}>Primary Asset Focus</label>
                    <select className="inp" value={assetFocus} onChange={e=>setAssetFocus(e.target.value)}>
                      <option value="">Select asset class…</option>
                      <option>Build to Rent (BTR)</option>
                      <option>Build to Sell (BTS)</option>
                      <option>Hotel Acquisition</option>
                      <option>Residential Flips</option>
                      <option>Mixed / Multi-Asset</option>
                    </select>
                  </div>
                )}
                {tab==="signin"&&<label style={{display:"flex",alignItems:"center",gap:10,fontSize:12,color:"var(--text-m)",marginBottom:20,cursor:"pointer"}}><input type="checkbox" style={{width:"auto",accentColor:"var(--gold)"}}/>Keep me signed in for 30 days</label>}
                <button type="submit" className="btn-primary" style={{width:"100%",justifyContent:"center",padding:"14px",fontSize:14,marginTop:tab==="signin"?0:8}} disabled={loading}>
                  {loading?<span style={{width:18,height:18,border:"2px solid rgba(0,0,0,.15)",borderTopColor:"#06070a",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>:tab==="signin"?"Sign In →":tab==="reset"?"Send Reset Link →":"Request Access →"}
                </button>
                <div style={{display:"flex",alignItems:"center",gap:14,margin:"18px 0"}}>
                  <div style={{flex:1,height:1,background:"var(--border)"}}/>
                  <span style={{fontSize:11,color:"var(--text-d)"}}>or</span>
                  <div style={{flex:1,height:1,background:"var(--border)"}}/>
                </div>
                <button type="button" className="btn-ghost" style={{width:"100%",justifyContent:"center",padding:"13px",gap:10}}>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google Workspace
                </button>
              </form>
              <p style={{marginTop:22,paddingTop:18,borderTop:"1px solid var(--border)",textAlign:"center",fontSize:11,color:"var(--text-d)",lineHeight:1.6}}>
                By continuing you agree to our <span style={{color:"var(--gold)",cursor:"pointer"}} onClick={()=>{}}>Terms of Service</span> & <span style={{color:"var(--gold)",cursor:"pointer"}}>Privacy Policy</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
