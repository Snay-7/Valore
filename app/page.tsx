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
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeSlideIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes screenFadeIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes revealUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
@keyframes revealLeft{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
@keyframes revealRight{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
.fu{opacity:0;animation:fu .65s cubic-bezier(.16,1,.3,1) forwards}
.reveal{opacity:0;transition:none}.reveal.visible{animation:revealUp .7s cubic-bezier(.16,1,.3,1) forwards}
.reveal-l{opacity:0}.reveal-l.visible{animation:revealLeft .7s cubic-bezier(.16,1,.3,1) forwards}
.reveal-r{opacity:0}.reveal-r.visible{animation:revealRight .7s cubic-bezier(.16,1,.3,1) forwards}
.nav{position:fixed;top:0;left:0;right:0;z-index:200;height:60px;display:flex;align-items:center;padding:0 48px;transition:background .3s,border-color .3s;border-bottom:1px solid transparent}
.nav.on{background:rgba(6,7,10,.96);backdrop-filter:blur(24px);border-color:var(--border)}
.nav-links{display:flex;gap:36px;margin-right:36px}
.nav-links a{font-size:11px;letter-spacing:.08em;color:var(--text-m);transition:color .2s;cursor:pointer;text-transform:uppercase}
.nav-links a:hover{color:var(--gold)}
.nav-btns{display:flex;gap:10px}
.hamburger{display:none;background:none;border:none;cursor:pointer;flex-direction:column;gap:5px;padding:4px}
.hamburger span{display:block;width:22px;height:1px;background:var(--text-m);transition:all .3s}
.mobile-menu{display:none;position:fixed;inset:0;z-index:199;background:rgba(6,7,10,.99);padding:80px 40px 40px;flex-direction:column;gap:0}
.mobile-menu.open{display:flex}
.mobile-menu a{font-size:28px;font-family:var(--font-display);font-weight:300;color:var(--text);padding:18px 0;border-bottom:1px solid var(--border);cursor:pointer}
.btn-primary{display:inline-flex;align-items:center;gap:8px;background:var(--gold);color:#06070a;padding:12px 26px;border-radius:5px;font-family:var(--font-body);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;border:none;cursor:pointer;transition:background .2s,transform .15s}
.btn-primary:hover{background:var(--gold-l);transform:translateY(-1px)}
.btn-ghost{display:inline-flex;align-items:center;gap:8px;background:transparent;color:var(--text-m);padding:11px 24px;border-radius:5px;font-family:var(--font-body);font-size:11px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;border:1px solid var(--border-m);cursor:pointer;transition:all .2s}
.btn-ghost:hover{border-color:var(--gold-border);color:var(--gold)}
.card-feature{background:var(--bg2);border:1px solid var(--border);border-radius:11px;padding:30px;transition:border-color .25s,transform .25s}
.card-feature:hover{border-color:rgba(201,168,76,.2);transform:translateY(-2px)}
.inp{width:100%;padding:13px 16px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--font-body);font-size:14px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.08)}
.inp::placeholder{color:var(--text-d)}
.badge{display:inline-flex;align-items:center;gap:6px;background:var(--gold-bg);border:1px solid var(--gold-border);color:var(--gold);padding:4px 14px;border-radius:2px;font-size:9px;font-weight:500;letter-spacing:.12em;text-transform:uppercase}
.badge-blue{background:rgba(91,156,246,.08);border-color:rgba(91,156,246,.2);color:var(--blue)}
.badge-green{background:rgba(61,220,132,.08);border-color:rgba(61,220,132,.2);color:var(--green)}
.container{max-width:1140px;margin:0 auto;padding:0 48px}
.grad-text{background:linear-gradient(135deg,var(--gold-l) 0%,var(--gold) 50%,#a07030 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.glow{position:absolute;border-radius:50%;pointer-events:none}
.section-label{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:12px;margin-bottom:20px}
.section-label::before{content:'';width:24px;height:1px;background:var(--gold);flex-shrink:0}
.ticker-wrap{overflow:hidden;white-space:nowrap;background:var(--bg1);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:13px 0}
.ticker-inner{display:inline-flex;gap:56px;animation:ticker 55s linear infinite}
.ticker-item{display:inline-flex;align-items:center;gap:10px;font-size:10px;color:var(--text-d);letter-spacing:.1em;text-transform:uppercase}
.showcase-tab{padding:8px 16px;border-radius:3px;font-size:10px;font-family:var(--font-body);font-weight:500;letter-spacing:.08em;text-transform:uppercase;background:transparent;border:1px solid transparent;color:var(--text-d);cursor:pointer;transition:all .2s;white-space:nowrap}
.showcase-tab:hover{color:var(--text-m)}
.showcase-tab.active{background:var(--bg3);border-color:var(--border-m);color:var(--gold)}
.asset-tile{display:flex;flex-direction:column;gap:6px;padding:14px 16px;border-radius:8px;border:1px solid var(--border);background:var(--bg3);cursor:pointer;transition:all .2s;position:relative}
.asset-tile:hover{border-color:var(--gold-border);background:var(--bg4)}
.asset-tile.selected{background:var(--gold-bg);border-color:var(--gold)}
.demo-tab{transition:all .2s;cursor:pointer;border-bottom:1px solid transparent;padding:8px 16px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-d);background:none;border-top:none;border-left:none;border-right:none;font-family:var(--font-body);white-space:nowrap}
.demo-tab.active{color:var(--gold);border-bottom-color:var(--gold)}
.demo-tab:hover{color:var(--text-m)}
.price-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:36px;position:relative;overflow:hidden;transition:border-color .25s,transform .25s,box-shadow .25s}
.price-card:hover{transform:translateY(-3px);box-shadow:0 20px 48px rgba(0,0,0,.4)}
.price-card.featured{border-color:rgba(201,168,76,.28);background:var(--bg3)}
.price-card.featured:hover{box-shadow:0 20px 48px rgba(201,168,76,.1)}
.video-modal-overlay{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.94);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease}
.video-modal{position:relative;width:90vw;max-width:960px;border-radius:10px;overflow:hidden;border:1px solid rgba(201,168,76,.12);box-shadow:0 40px 80px rgba(0,0,0,.8)}
.video-close{position:absolute;top:14px;right:14px;z-index:10;background:rgba(6,7,10,.8);border:1px solid rgba(255,255,255,.1);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-m);font-size:18px;transition:all .2s}
.video-close:hover{border-color:var(--gold);color:var(--gold)}
.sticky-cta{position:fixed;bottom:0;left:0;right:0;z-index:150;background:rgba(6,7,10,.97);backdrop-filter:blur(20px);border-top:1px solid rgba(201,168,76,.12);padding:14px 48px;display:flex;align-items:center;justify-content:space-between;gap:16px;transform:translateY(100%);transition:transform .4s cubic-bezier(.16,1,.3,1)}
.sticky-cta.visible{transform:translateY(0)}
.cta-strip{background:linear-gradient(135deg,rgba(201,168,76,.06) 0%,rgba(201,168,76,.02) 100%);border:1px solid rgba(201,168,76,.1);border-radius:8px;padding:36px 44px;display:flex;align-items:center;justify-content:space-between;gap:24px;margin:64px 0 0}
.support-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:40px 0}
.support-card{background:var(--bg2);border:1px solid var(--border);border-radius:11px;padding:30px;transition:border-color .25s,transform .2s;cursor:pointer}
.support-card:hover{border-color:rgba(201,168,76,.2);transform:translateY(-2px)}
.faq-item{border-bottom:1px solid var(--border)}
.faq-q{display:flex;justify-content:space-between;align-items:center;padding:20px 0;cursor:pointer;font-size:14px;color:var(--text);font-weight:500}
.faq-a{font-size:13px;color:var(--text-m);line-height:1.85;padding-bottom:20px}
.legal-content{max-width:760px;margin:0 auto;padding:120px 40px 80px}
.legal-content h1{font-family:var(--font-display);font-size:clamp(32px,4vw,52px);font-weight:300;margin-bottom:12px}
.legal-content .meta{font-size:10px;color:var(--text-d);margin-bottom:48px;padding-bottom:20px;border-bottom:1px solid var(--border);letter-spacing:.06em}
.legal-content h2{font-family:var(--font-display);font-size:22px;font-weight:500;color:var(--text);margin:40px 0 14px}
.legal-content p{font-size:14px;color:var(--text-m);line-height:1.85;margin-bottom:16px}
.legal-content ul{list-style:none;margin-bottom:16px}
.legal-content ul li{font-size:14px;color:var(--text-m);line-height:1.8;padding:6px 0 6px 20px;position:relative;border-bottom:1px solid var(--bg2)}
.legal-content ul li::before{content:"◆";position:absolute;left:0;color:var(--gold);font-size:8px;top:12px}
.legal-content a{color:var(--gold);text-decoration:underline;text-underline-offset:3px}
.workspace-card{background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:16px 18px;transition:border-color .2s}
.workspace-card:hover{border-color:var(--gold-border)}
.login-wrap{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}
.login-left{background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:44px 64px;position:relative;overflow:hidden}
.login-right{display:flex;align-items:center;justify-content:center;padding:40px;background:var(--bg)}
.login-card{background:var(--bg2);border:1px solid var(--border-m);border-radius:14px;padding:44px 40px;width:100%;max-width:440px;position:relative;overflow:hidden}
.login-card::before{content:'';position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.tab-switch{display:flex;background:var(--bg3);border-radius:7px;padding:3px}
.tab-btn{flex:1;padding:9px 16px;border-radius:5px;font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;background:transparent;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);transition:all .2s}
.tab-btn.active{background:var(--bg4);color:var(--text);border:1px solid var(--border)}
.ficon{width:40px;height:40px;border-radius:9px;background:var(--gold-bg);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:15px;color:var(--gold);flex-shrink:0}
.testimonial{background:var(--bg2);border:1px solid var(--border);border-radius:11px;padding:36px;transition:border-color .25s}
.testimonial:hover{border-color:rgba(201,168,76,.15)}
.testimonial-author{display:flex;align-items:center;gap:14px;padding-top:20px;border-top:1px solid var(--border)}
.testimonial-avatar{width:36px;height:36px;border-radius:50%;background:var(--bg3);border:1px solid var(--border-m);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--gold);font-family:var(--font-mono);flex-shrink:0}
@media(max-width:768px){
  .nav{padding:0 20px;height:56px}.nav-links,.nav-btns{display:none}.hamburger{display:flex}
  .container{padding:0 20px}
  .hero-grid{grid-template-columns:1fr !important}.hero-right{display:none !important}
  .features-grid{grid-template-columns:1fr !important}
  .asset-grid{grid-template-columns:repeat(2,1fr) !important}
  .pricing-grid{grid-template-columns:1fr !important;max-width:100% !important}
  .footer-grid{grid-template-columns:1fr !important;gap:32px !important}
  .footer-bottom{flex-direction:column !important;gap:16px !important;text-align:center}
  .login-wrap{grid-template-columns:1fr}.login-left{display:none}.login-right{padding:24px 20px}.login-card{padding:32px 24px}
  .why-grid{grid-template-columns:1fr !important}.lender-grid{grid-template-columns:1fr !important}
  .pipeline-section{grid-template-columns:1fr !important}.workspace-section{grid-template-columns:1fr !important}
  .support-grid{grid-template-columns:1fr !important}
  .hero-btns{flex-direction:column !important}.hero-btns button{width:100%}
  .cta-btns{flex-direction:column !important;align-items:center}
  .legal-content{padding:100px 20px 60px}.showcase-tabs{overflow-x:auto}
  .sticky-cta{padding:10px 20px;flex-direction:column;gap:8px}.sticky-cta-text{display:none}
  .cta-strip{flex-direction:column;text-align:center;padding:28px 24px}
  .video-section-grid{grid-template-columns:1fr !important}
  .testimonials-grid{grid-template-columns:1fr !important}
  .problem-inner{grid-template-columns:1fr !important}
  .built-for-grid{grid-template-columns:1fr !important}
}
@media(max-width:480px){.asset-grid{grid-template-columns:1fr !important}}
`;


const CALENDLY = "https://calendly.com/hello-valoraplatform/30min";
const SCREENSHOTS = {
  analysis:    "/screenshots/analysis-btr.png",
  cashflow:    "/screenshots/cashflow.png",
  pipeline:    "/screenshots/pipeline.png",
  portfolio:   "/screenshots/portfolio.png",
  workspace:   "/screenshots/workspace.png",
  sensitivity: "/screenshots/analysis-bts.png",
};
const FEATURES = [
  { icon:"◈", label:"True Monthly Cash Flow Engine", desc:"Full month-by-month P&L from acquisition to exit. S-curve drawdown model with interest rolled monthly on actual drawn balances — no approximations.", tag:"Core" },
  { icon:"◈", label:"Residual Land Value", desc:"Real-time RLV calculation that updates as you type. Uses exact cashflow interest for maximum accuracy. Instantly shows what you can afford to pay for land.", tag:"Valuation" },
  { icon:"◈", label:"Sensitivity Matrices", desc:"45-scenario yield vs rent matrices with colour-coded RAG. Exit yield, levered profit, and profit on cost — all recalculated live using the full finance model.", tag:"Risk" },
  { icon:"◈", label:"Live Benchmark Curves", desc:"SONIA, SOFR, EURIBOR, EIBOR, SORA, AONIA, TONA, SARON, CORRA, HONIA. Finance costs calculated against the actual forward curve, not a flat estimate.", tag:"Finance" },
  { icon:"◈", label:"3-Tier Promote Waterfall", desc:"Configurable IRR hurdles with developer and investor allocations across all tiers. Visual split bar per hurdle. Fully scenario-aware.", tag:"JV" },
  { icon:"◈", label:"DSCR / ICR & Equity Multiple", desc:"Debt service cover ratio, ICR, equity multiple (MOIC), payback period and break-even yield — the exact metrics a lender or equity partner will stress test.", tag:"Institutional" },
  { icon:"◈", label:"AI Sense Check", desc:"Automatically benchmarks your assumptions against market data. Flags DSCR breaches, aggressive exit yields, LTC limits, and build cost issues before credit committee.", tag:"AI" },
  { icon:"◈", label:"AI Investor Brochures", desc:"Upload photos, generate a full investment memorandum. Branded PDF with live share links — investors always see the latest version.", tag:"AI" },
  { icon:"◈", label:"Team Workspace", desc:"Collaborate on appraisals with your team. Shared workspace with notes, tasks, activity feed and role-based permissions — everything linked to the deal.", tag:"Team" },
  { icon:"◈", label:"Property Transfer Tax Engine", desc:"Auto-calculates UK SDLT across all modes. International deal? Switch to Override for IMT, DLD Fee, Grunderwerbsteuer and any jurisdiction globally.", tag:"Tax" },
  { icon:"◈", label:"Deal Pipeline & Tasks", desc:"Kanban pipeline boards with customisable stages. Tasks, notes and activity feed on every deal. Move projects from Prospect through to Completion.", tag:"PM" },
  { icon:"◈", label:"IRR — Levered & Unlevered", desc:"True levered IRR using monthly equity cash flows with progressive loan repayment. Unlevered IRR includes the full stabilisation ramp — not a simplified endpoint model.", tag:"Returns" },
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


function VideoModal({onClose}:{onClose:()=>void}) {
  useEffect(()=>{ const fn=(e:KeyboardEvent)=>{ if(e.key==="Escape") onClose(); }; window.addEventListener("keydown",fn); return()=>window.removeEventListener("keydown",fn); },[onClose]);
  return(
    <div className="video-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="video-modal">
        <button className="video-close" onClick={onClose}>×</button>
        <video src="/videos/how-to-appraisal.mp4" controls autoPlay style={{width:"100%",display:"block",background:"#06070a"}}/>
      </div>
    </div>
  );
}


function CTAStrip({onLogin,text,btn}:{onLogin:()=>void;text:string;btn:string}) {
  return (
    <div className="cta-strip">
      <div>
        <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(18px,2vw,26px)",fontWeight:300,color:"var(--text)",marginBottom:8,letterSpacing:".01em"}}>{text}</div>
        <div style={{fontSize:10,color:"var(--text-d)",letterSpacing:".1em",textTransform:"uppercase"}}>No credit card required · 14-day free trial · Cancel anytime</div>
      </div>
      <button className="btn-primary" onClick={onLogin} style={{padding:"13px 32px",flexShrink:0,whiteSpace:"nowrap"}}>{btn}</button>
    </div>
  );
}


function AssetSelectorCard({onLogin}:{onLogin:()=>void}) {
  const [selected,setSelected]=useState<string|null>(null);
  const assets=[
    {key:"BTR",label:"Build to Rent",icon:"◈",color:"#c9a84c",sub:"Residential income-producing"},
    {key:"BTS",label:"Build to Sell",icon:"◎",color:"#5b9cf6",sub:"Development & conversion"},
    {key:"Hotel",label:"Hotel",icon:"◉",color:"#f0a429",sub:"Acquisition & repositioning"},
    {key:"Flip",label:"House Flip",icon:"◫",color:"#3ddc84",sub:"Refurb & quick exit"},
  ];
  return (
    <div style={{background:"rgba(18,21,26,0.97)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:28,width:340,boxShadow:"0 40px 80px rgba(0,0,0,.8),0 0 0 1px rgba(201,168,76,.05)",position:"relative",animation:"fadeSlideIn .7s cubic-bezier(.16,1,.3,1) .6s both"}}>
      <div style={{position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg,transparent,#c9a84c,transparent)"}}/>
      <div style={{fontSize:12,fontWeight:500,color:"var(--text)",marginBottom:4,letterSpacing:".01em"}}>What would you like to model?</div>
      <div style={{fontSize:10,color:"var(--text-d)",marginBottom:20,letterSpacing:".06em",textTransform:"uppercase"}}>Choose an asset type to get started</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        {assets.map(a=>(
          <button key={a.key} className={`asset-tile ${selected===a.key?"selected":""}`} onClick={()=>setSelected(a.key)}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
              {selected===a.key&&<div style={{position:"absolute",top:10,right:10,width:14,height:14,borderRadius:"50%",background:a.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#06070a",fontWeight:700}}>✓</div>}
              <span style={{fontSize:13,color:a.color}}>{a.icon}</span>
              <span style={{fontSize:10,fontWeight:600,color:selected===a.key?a.color:"var(--text)",letterSpacing:".06em"}}>{a.key}</span>
            </div>
            <div style={{fontSize:11,color:"var(--text-m)"}}>{a.label}</div>
            <div style={{fontSize:10,color:"var(--text-d)",lineHeight:1.3,marginTop:1}}>{a.sub}</div>
          </button>
        ))}
      </div>
      <button onClick={onLogin} style={{width:"100%",padding:"13px",borderRadius:7,background:selected?"var(--gold)":"rgba(201,168,76,0.1)",border:selected?"none":"1px solid rgba(201,168,76,0.2)",color:selected?"#06070a":"var(--gold)",fontFamily:"var(--font-body)",fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",transition:"all .25s",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        {selected?`Model ${selected} →`:"Get Started — Free Trial →"}
      </button>
      <div style={{textAlign:"center",fontSize:10,color:"var(--text-d)",marginTop:10,letterSpacing:".06em",textTransform:"uppercase"}}>No credit card required · 14-day free trial</div>
    </div>
  );
}


function ProductShowcase() {
  const [active,setActive]=useState(0);
  const tabs=[
    {label:"Returns Analysis",desc:"GDV, IRR, DSCR, equity multiple — all live as you type",img:SCREENSHOTS.analysis},
    {label:"Monthly Cashflow",desc:"True S-curve drawdown with interest rolled on drawn balances",img:SCREENSHOTS.cashflow},
    {label:"Deal Pipeline",desc:"Kanban board from Prospect to Completion with live metrics",img:SCREENSHOTS.pipeline},
    {label:"Portfolio View",desc:"All active deals, total GDV, avg PoC and IRR at a glance",img:SCREENSHOTS.portfolio},
    {label:"Team Workspace",desc:"Tasks, notes and activity — everyone on the same deal",img:SCREENSHOTS.workspace},
    {label:"Sensitivity Matrix",desc:"45-scenario RAG matrix across exit yield and rent",img:SCREENSHOTS.sensitivity},
  ];
  const t=tabs[active];
  return (
    <section style={{padding:"80px 0 0",background:"var(--bg)",borderTop:"1px solid var(--border)"}}>
      <div className="container">
        <div className="reveal" style={{textAlign:"center",marginBottom:44}}>
          <div className="badge" style={{marginBottom:20}}>Platform Tour</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,48px)",fontWeight:300,lineHeight:1.08,marginBottom:12}}>See every corner<br/><em className="grad-text" style={{fontStyle:"italic"}}>of the platform</em></h2>
          <p style={{fontSize:14,color:"var(--text-m)",maxWidth:420,margin:"0 auto",lineHeight:1.8}}>{t.desc}</p>
        </div>
        <div className="showcase-tabs" style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:28}}>
          {tabs.map((tab,i)=>(<button key={i} className={`showcase-tab ${active===i?"active":""}`} onClick={()=>setActive(i)}>{tab.label}</button>))}
        </div>
        <div style={{position:"relative",borderRadius:"10px 10px 0 0",overflow:"hidden",border:"1px solid var(--border-m)",borderBottom:"none",boxShadow:"0 -20px 60px rgba(0,0,0,.5)",background:"var(--bg1)"}}>
          <div style={{background:"var(--bg2)",borderBottom:"1px solid var(--border)",padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",gap:5}}>{["#f4645f","#f0a429","#3ddc84"].map(c=><div key={c} style={{width:9,height:9,borderRadius:"50%",background:c,opacity:.55}}/>)}</div>
            <div style={{flex:1,background:"var(--bg3)",borderRadius:3,padding:"4px 12px",fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)",maxWidth:300,margin:"0 auto",textAlign:"center",letterSpacing:".06em"}}>app.valoraplatform.io</div>
          </div>
          <div key={active} style={{animation:"screenFadeIn .35s cubic-bezier(.16,1,.3,1)",lineHeight:0}}>
            <img src={t.img} alt={t.label} style={{width:"100%",display:"block",objectFit:"cover",maxHeight:520,objectPosition:"top"}} onError={(e)=>{(e.target as HTMLImageElement).style.display="none";(e.target as HTMLImageElement).parentElement!.style.minHeight="400px";(e.target as HTMLImageElement).parentElement!.style.background="var(--bg2)";}}/>
          </div>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:80,background:"linear-gradient(transparent,var(--bg))",pointerEvents:"none"}}/>
        </div>
      </div>
    </section>
  );
}


const PipelineMock=()=>(
  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,width:"100%"}}>
    {PIPELINE_COLS.map((col)=>(
      <div key={col.stage} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:9,padding:"12px 10px",display:"flex",flexDirection:"column",gap:8,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:5,height:5,borderRadius:"50%",background:col.color}}/><span style={{fontSize:9,color:"var(--text-m)",textTransform:"uppercase",letterSpacing:".1em",fontWeight:600}}>{col.stage}</span></div>
          <span style={{fontSize:10,background:"var(--bg5)",color:"var(--text-d)",borderRadius:10,padding:"1px 7px"}}>{col.count}</span>
        </div>
        {col.items.map((item)=>(
          <div key={item.name} style={{background:"var(--bg4)",border:"1px solid var(--border)",borderRadius:7,padding:"10px 10px 8px"}}>
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
          <img src="data:image/png;base64,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" alt="Valora" style={{height:32,width:"auto"}}/>
        </div>
        <div className="nav-links">
          {isHome?[["Features","#features"],["Why Valora","#why"],["Pricing","#pricing"],["For Lenders","#lenders"]].map(([l,h])=><a key={l} href={h}>{l}</a>):<a onClick={()=>onPage("landing")}>← Back</a>}
        </div>
        <div className="nav-btns">
          <button className="btn-ghost" onClick={()=>window.open(CALENDLY,"_blank")} style={{padding:"8px 18px",borderColor:"var(--gold-border)",color:"var(--gold)",gap:8}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Book a Demo
          </button>
          <button className="btn-ghost" onClick={onLogin} style={{padding:"8px 18px"}}>Sign In</button>
          <button className="btn-primary" onClick={onLogin} style={{padding:"9px 20px"}}>Make your first appraisal →</button>
        </div>
        <button className="hamburger" onClick={()=>setMenuOpen(p=>!p)} aria-label="Menu">
          <span style={{transform:menuOpen?"rotate(45deg) translateY(6px)":"none"}}/>
          <span style={{opacity:menuOpen?0:1}}/>
          <span style={{transform:menuOpen?"rotate(-45deg) translateY(-6px)":"none"}}/>
        </button>
      </nav>
      <div className={`mobile-menu ${menuOpen?"open":""}`}>
        {isHome?[["Features","#features"],["Why Valora","#why"],["Pricing","#pricing"],["Support","support"],["Privacy","privacy"],["Terms","terms"]].map(([l,h])=>h.startsWith("#")?<a key={l} href={h} onClick={()=>setMenuOpen(false)}>{l}</a>:<a key={l} onClick={()=>{setMenuOpen(false);onPage(h)}}>{l}</a>):<a onClick={()=>{setMenuOpen(false);onPage("landing")}}>← Home</a>}
        <div style={{marginTop:36,display:"flex",flexDirection:"column",gap:12}}>
          <button className="btn-ghost" onClick={()=>{setMenuOpen(false);window.open(CALENDLY,"_blank")}} style={{justifyContent:"center",borderColor:"var(--gold-border)",color:"var(--gold)"}}>Book a Demo</button>
          <button className="btn-ghost" onClick={()=>{setMenuOpen(false);onLogin()}} style={{justifyContent:"center"}}>Sign In</button>
          <button className="btn-primary" onClick={()=>{setMenuOpen(false);onLogin()}} style={{justifyContent:"center"}}>Make your first appraisal →</button>
        </div>
      </div>
    </>
  );
}


function Footer({onPage}:any) {
  return (
    <footer style={{background:"var(--bg1)",borderTop:"1px solid var(--border)",padding:"64px 0 40px"}}>
      <div className="container">
        <div className="footer-grid" style={{display:"grid",gridTemplateColumns:"2.5fr 1fr 1fr 1fr",gap:48,marginBottom:48}}>
          <div>
            <img src="data:image/png;base64,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" alt="Valora" style={{height:28,width:"auto",marginBottom:16,cursor:"pointer"}} onClick={()=>onPage("landing")}/>
            <p style={{fontSize:13,color:"var(--text-d)",lineHeight:1.85,maxWidth:280,marginBottom:20}}>Institutional development appraisal software for property developers, valuers, lenders and investment professionals.</p>
          </div>
          {[
            {h:"Platform",links:[["Features","landing"],["Pricing","landing"],["Support","support"]]},
            {h:"Asset Types",links:[["Build to Rent","landing"],["Build to Sell","landing"],["Hotel","landing"],["House Flip","landing"]]},
            {h:"Company",links:[["Support","support"],["Privacy","privacy"],["Terms","terms"],["Cookies","cookies"]]},
          ].map(col=>(
            <div key={col.h}>
              <div style={{fontSize:9,letterSpacing:".18em",textTransform:"uppercase",color:"var(--text-d)",fontWeight:500,marginBottom:18}}>{col.h}</div>
              {col.links.map(([l,p])=>(<div key={l} style={{fontSize:13,color:"var(--text-m)",marginBottom:11,cursor:"pointer",transition:"color .2s"}} onClick={()=>onPage(p)} onMouseEnter={e=>(e.target as HTMLElement).style.color="var(--gold)"} onMouseLeave={e=>(e.target as HTMLElement).style.color="var(--text-m)"}>{l}</div>))}
            </div>
          ))}
        </div>
        <div className="footer-bottom" style={{borderTop:"1px solid var(--border)",paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{fontSize:11,color:"var(--text-d)",letterSpacing:".04em"}}>© 2026 Valora Technologies Ltd. All rights reserved. Registered in England & Wales.</div>
          <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
            {[["Privacy","privacy"],["Terms","terms"],["Cookies","cookies"],["Accessibility","accessibility"]].map(([l,p])=>(<span key={l} style={{fontSize:11,color:"var(--text-d)",cursor:"pointer",letterSpacing:".04em",transition:"color .2s"}} onClick={()=>onPage(p)} onMouseEnter={e=>(e.target as HTMLElement).style.color="var(--gold)"} onMouseLeave={e=>(e.target as HTMLElement).style.color="var(--text-d)"}>{l}</span>))}
          </div>
        </div>
      </div>
    </footer>
  );
}


function BuiltForSection({onLogin}:{onLogin:()=>void}) {
  const [active,setActive]=useState(0);
  const personas=[
    {icon:"◈",label:"Developers",color:"var(--gold)",headline:"Model any deal with investment-bank rigour",desc:"From a £2m house flip to a £500m BTR fund — Valora handles new-build, conversion, refurbishment and income-producing assets. True monthly cashflows, DSCR checking, promote waterfalls and AI sense check, all in one place.",points:[["◆","All 4 asset types","BTR, BTS, Hotel, Flip — new-build, conversion & income-producing"],["◆","True monthly CF","S-curve drawdown with interest rolled on actual drawn balances"],["◆","DSCR / ICR & IRR","Auto-calculated. Flagged before credit committee sees it"],["◆","AI Sense Check","Benchmarks your assumptions against market data in real time"],["◆","Live share links","Investors and lenders always see the latest version"]]},
    {icon:"◎",label:"Lenders & Banks",color:"var(--blue)",headline:"Underwriting you can trust, every time",desc:"Valora produces the exact format a senior underwriter needs to approve a development loan. Monthly cashflow shows precise drawdown profile, DSCR checked automatically, and the model is always current.",points:[["◆","Standardised model","Every borrower appraisal in one consistent format"],["◆","Drawdown profile","Monthly cashflow shows exactly how the facility is drawn"],["◆","DSCR / ICR auto-checked","Flagged when debt service cover drops below covenant"],["◆","Live link","Always the latest model — no stale email attachments"],["◆","AI Sense Check","LTC, exit yield and build cost issues flagged upfront"]]},
    {icon:"◉",label:"Investment Managers",color:"var(--green)",headline:"Stress test before you commit a single pound",desc:"Run 45-scenario sensitivity matrices, model promote waterfalls across IRR hurdles, and track your entire development pipeline from prospect to completion — all from one platform.",points:[["◆","45-scenario matrices","Exit yield vs rent — RAG coded, recalculated live"],["◆","Promote waterfall","3-tier with configurable IRR hurdles and visual distribution split"],["◆","Deal pipeline","Kanban board from Prospect through to Completion"],["◆","Team workspace","Your whole team on the same live model"],["◆","Portfolio view","Track GDV, IRR and PoC across all active deals"]]},
    {icon:"◫",label:"Valuers & Advisors",color:"var(--amber)",headline:"RLV, sensitivity and transfer tax — all automated",desc:"Residual land value updates as you type. Exit yield sensitivity matrices with colour-coded RAG. UK SDLT auto-calculated, with override for any jurisdiction globally. Branded PDF exports for client delivery.",points:[["◆","Live RLV","Residual land value recalculated on every keystroke"],["◆","Sensitivity matrices","Exit yield and rent sensitivity with 45 RAG-coded scenarios"],["◆","Transfer Tax Engine","UK SDLT auto-calculated. Override for IMT, DLD Fee, Grunderwerbsteuer and any jurisdiction."],["◆","Stabilisation modelling","Void periods and rent-free modelled in the cashflow"],["◆","Branded PDF","Professional export with your firm details for client delivery"]]},
  ];
  const p=personas[active];
  return (
    <section style={{padding:"100px 0",background:"var(--bg1)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
      <div className="container">
        <div className="reveal" style={{textAlign:"center",marginBottom:56}}>
          <div className="section-label" style={{justifyContent:"center",marginBottom:20}}>Built For</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,52px)",fontWeight:300,lineHeight:1.06,marginBottom:14}}>One platform.<br/><em className="grad-text" style={{fontStyle:"italic"}}>Every professional in the room.</em></h2>
        </div>
        <div className="reveal" style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:56}}>
          {personas.map((persona,i)=>(
            <button key={i} onClick={()=>setActive(i)} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 22px",borderRadius:3,border:`1px solid ${active===i?persona.color+"55":"var(--border)"}`,background:active===i?persona.color+"08":"transparent",color:active===i?persona.color:"var(--text-m)",fontSize:10,fontFamily:"var(--font-body)",cursor:"pointer",transition:"all .2s",fontWeight:active===i?500:400,letterSpacing:".08em",textTransform:"uppercase"}}>
              <span style={{fontSize:12}}>{persona.icon}</span>{persona.label}
            </button>
          ))}
        </div>
        <div key={active} className="built-for-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:56,alignItems:"center",animation:"revealUp .4s cubic-bezier(.16,1,.3,1) forwards"}}>
          <div>
            <div style={{fontSize:9,color:p.color,textTransform:"uppercase",letterSpacing:".14em",marginBottom:16,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:14}}>{p.icon}</span>{p.label}</div>
            <h3 style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,2.5vw,36px)",fontWeight:300,lineHeight:1.1,marginBottom:20,color:"var(--text)"}}>{p.headline}</h3>
            <p style={{fontSize:14,color:"var(--text-m)",lineHeight:1.85,marginBottom:28,fontWeight:300}}>{p.desc}</p>
            <button className="btn-primary" onClick={onLogin} style={{padding:"12px 24px"}}>Make your first appraisal →</button>
          </div>
          <div style={{display:"flex",flexDirection:"column"}}>
            {p.points.map(([icon,title,sub],j)=>(
              <div key={j} style={{display:"flex",gap:16,padding:"16px 0",borderBottom:j<p.points.length-1?"1px solid var(--border)":"none"}}>
                <span style={{color:p.color,fontSize:7,marginTop:6,flexShrink:0}}>◆</span>
                <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:4}}>{title}</div><div style={{fontSize:12,color:"var(--text-d)",lineHeight:1.65}}>{sub}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


function WorkspaceDemo() {
  const [activeTab,setActiveTab]=useState(0);
  const tabs=["Overview","Tasks","Notes","Activity"];
  const taskData=[{task:"Review exit yield assumptions",assignee:"JH",due:"2 Apr",status:"Working on it",color:"var(--amber)"},{task:"Confirm build cost with QS",assignee:"PS",due:"4 Apr",status:"Not Started",color:"var(--text-d)"},{task:"Send appraisal to lender",assignee:"MA",due:"5 Apr",status:"Done",color:"var(--green)"},{task:"Update unit mix — 3 bed count",assignee:"SC",due:"3 Apr",status:"Stuck",color:"var(--red)"}];
  const noteData=[{note:"Lender confirmed they need DSCR above 1.3× — currently 1.62×, comfortable margin.",author:"JH",time:"2h ago"},{note:"QS flagged potential 8% uplift on RC frame. Sensitivity run — still viable at 41% PoC.",author:"PS",time:"5h ago"}];
  const overviewData=[{label:"GDV",value:"£208.5m",color:"var(--gold)"},{label:"Profit on Cost",value:"43.7%",color:"var(--green)"},{label:"IRR (Unlev.)",value:"24.3%",color:"var(--blue)"},{label:"DSCR / ICR",value:"1.62×",color:"var(--green)"}];
  return (
    <div>
      <div style={{display:"flex",overflowX:"auto",marginBottom:16,borderBottom:"1px solid var(--border)"}}>
        {tabs.map((t,i)=>(<button key={t} className={`demo-tab ${activeTab===i?"active":""}`} onClick={()=>setActiveTab(i)}>{t}</button>))}
      </div>
      {activeTab===0&&(<div style={{display:"flex",flexDirection:"column",gap:8}}>{overviewData.map((item,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"var(--bg3)",borderRadius:6}}><span style={{fontSize:12,color:"var(--text-m)"}}>{item.label}</span><span style={{fontSize:13,fontFamily:"var(--font-mono)",fontWeight:600,color:item.color}}>{item.value}</span></div>))}</div>)}
      {activeTab===1&&(<div style={{display:"flex",flexDirection:"column",gap:8}}>{taskData.map((item,i)=>(<div key={i} style={{background:"var(--bg3)",borderRadius:6,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:"var(--text)",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.task}</div><div style={{fontSize:10,color:"var(--text-d)",letterSpacing:".04em"}}>{item.assignee} · {item.due}</div></div><span style={{fontSize:9,padding:"2px 8px",borderRadius:2,background:item.color+"18",color:item.color,whiteSpace:"nowrap",fontWeight:500,letterSpacing:".06em",textTransform:"uppercase"}}>{item.status}</span></div>))}</div>)}
      {activeTab===2&&(<div style={{display:"flex",flexDirection:"column",gap:10}}>{noteData.map((item,i)=>(<div key={i} style={{background:"var(--bg3)",borderRadius:6,padding:"14px 16px"}}><div style={{fontSize:12,color:"var(--text)",lineHeight:1.7,marginBottom:8}}>{item.note}</div><div style={{fontSize:10,color:"var(--text-d)",letterSpacing:".04em"}}>{item.author} · {item.time}</div></div>))}</div>)}
      {activeTab===3&&(<div style={{display:"flex",flexDirection:"column",gap:0}}>{[{action:"Moved to Under Offer",user:"JH",time:"1h ago",icon:"→"},{action:"Task completed: Send appraisal to lender",user:"MA",time:"3h ago",icon:"✓"},{action:"Note added",user:"PS",time:"5h ago",icon:"◆"},{action:"Exit yield updated 5.25% → 5.0%",user:"JH",time:"Yesterday",icon:"⟳"}].map((item,i)=>(<div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid var(--bg4)"}}><div style={{width:26,height:26,borderRadius:"50%",background:"var(--bg4)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"var(--gold)",flexShrink:0}}>{item.icon}</div><div><div style={{fontSize:12,color:"var(--text-m)"}}>{item.action}</div><div style={{fontSize:10,color:"var(--text-d)",marginTop:2,letterSpacing:".04em"}}>{item.user} · {item.time}</div></div></div>))}</div>)}
    </div>
  );
}


export default function App() {
  const [page,setPage]=useState("landing");
  const scrolled=useScrolled();
  const toLogin=useCallback(()=>{ setPage("login"); window.scrollTo(0,0); },[]);
  const toPage=useCallback((p:string)=>{ setPage(p); window.scrollTo(0,0); },[]);
  useEffect(()=>{
    const obs=new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("visible"); obs.unobserve(e.target); } }); },{threshold:0.1,rootMargin:"0px 0px -40px 0px"});
    const els=document.querySelectorAll(".reveal,.reveal-l,.reveal-r");
    els.forEach(el=>obs.observe(el));
    return ()=>obs.disconnect();
  },[page]);
  useEffect(()=>{ const params=new URLSearchParams(window.location.search); if(params.get("invited")==="true") toLogin(); },[toLogin]);
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
  const [stickyVisible,setStickyVisible]=useState(false);
  const [openFaq,setOpenFaq]=useState<any>(null);
  useEffect(()=>{ const fn=()=>setStickyVisible(window.scrollY>500); window.addEventListener("scroll",fn,{passive:true}); return()=>window.removeEventListener("scroll",fn); },[]);

  const PLANS=[
    {name:"Free",price:"$0",period:"",desc:"Start modelling today. No card needed.",features:["3 active projects","All real estate models","Monthly cashflow engine","DSCR / ICR & equity multiple","Deal Pipeline & Tasks","Plain PDF export"],featured:false,cta:"Start for free →"},
    {name:"Pro",price:"$149",period:"/mo",desc:"When your deal needs an audience.",features:["Unlimited projects","All real estate models","Monthly cashflow engine","DSCR / ICR, MOIC & break-even","AI Brochure PDF","AI Sense Check","Live investor share links","Priority support"],featured:true,cta:"Start free trial →"},
    {name:"Enterprise",price:"$499",period:"/mo",desc:"For firms and investment teams.",features:["Everything in Pro","Full team workspace with roles","Multi-firm support","White label PDF exports","Dedicated onboarding","SLA support"],featured:false,cta:"Start free trial →"},
  ];

  const FAQS=[
    {q:"What is property development appraisal software?",a:"Property development appraisal software helps developers, investors and advisors model the financial viability of a real estate deal — including cashflows, returns, debt, tax and sensitivity analysis. Valora replaces the spreadsheet with a structured, auditable model built specifically for development finance."},
    {q:"Which real estate models does Valora include?",a:"Valora includes models for Build to Rent (BTR), Build to Sell (BTS), Hotel acquisition and repositioning, and House Flip. Industrial, Commercial and Mixed-Use models are coming soon. All models are available on every plan — Free, Pro and Enterprise."},
    {q:"How is Valora different from a spreadsheet?",a:"Spreadsheets break. Formulas get overwritten. Versions multiply. Valora gives you a purpose-built development finance model with automatic DSCR checking, live sensitivity matrices, AI Sense Check, and live share links — all in one place, always up to date."},
    {q:"Can I share my appraisal with investors or lenders?",a:"Yes. Pro and Enterprise plans include live share links. Anyone with the link sees your latest numbers in real time — no email attachments, no stale versions, no 'which model did you send?'"},
    {q:"What is DSCR and does Valora calculate it automatically?",a:"DSCR (Debt Service Cover Ratio) measures how comfortably your deal services its debt. Valora calculates DSCR and ICR automatically and flags when you drop below the standard 1.25× lender covenant — before your credit committee does."},
    {q:"Is Valora suitable for smaller developers and investors?",a:"Yes. The Free plan is designed for individual developers, investors and deal sourcers. You get three full appraisals, all models, and all the core analysis tools. Upgrade to Pro when your deal needs a live investor link or unlimited projects."},
    {q:"Do I need a credit card to start?",a:"No. The Free plan requires no payment details. Create an account and model your first deal in under 5 minutes."},
  ];

  return (
    <div itemScope itemType="https://schema.org/SoftwareApplication">
      {/* ── SEO SCHEMA ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        "@context":"https://schema.org",
        "@graph":[
          {"@type":"SoftwareApplication","name":"Valora Platform","applicationCategory":"BusinessApplication","operatingSystem":"Web",
           "offers":[{"@type":"Offer","price":"0","priceCurrency":"USD","name":"Free"},{"@type":"Offer","price":"149","priceCurrency":"USD","name":"Pro"},{"@type":"Offer","price":"499","priceCurrency":"USD","name":"Enterprise"}],
           "description":"Property development appraisal software for real estate developers, investors and advisors. Model BTR, BTS, hotel and residential deals with institutional-grade cashflow analysis, DSCR checking, AI Sense Check and live investor share links.",
           "url":"https://valoraplatform.io","image":"https://valoraplatform.io/og-image.png",
           "aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"47"}},
          {"@type":"FAQPage","mainEntity":FAQS.map(f=>({
            "@type":"Question","name":f.q,
            "acceptedAnswer":{"@type":"Answer","text":f.a}
          }))}
        ]
      })}}/>

      <Nav onLogin={onLogin} onPage={onPage} scrolled={scrolled} currentPage="landing"/>

      {/* ══════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════ */}
      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden",paddingTop:80}} aria-label="Property development appraisal software hero">
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 65% 45%,rgba(201,168,76,.055) 0%,transparent 58%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px)",backgroundSize:"64px 64px",pointerEvents:"none"}}/>
        <div className="container" style={{position:"relative",zIndex:1}}>
          <div className="hero-grid" style={{display:"grid",gridTemplateColumns:"52% 48%",gap:72,alignItems:"center"}}>
            <div>
              {/* Eyebrow — SEO keyword signal */}
              <div className="fu" style={{marginBottom:18,animationDelay:".1s"}}>
                <span style={{fontSize:9,letterSpacing:".18em",textTransform:"uppercase",color:"var(--gold)",display:"inline-flex",alignItems:"center",gap:10}}>
                  <span style={{width:20,height:1,background:"var(--gold)",display:"inline-block"}}/>
                  Property Development Appraisal Software
                </span>
              </div>

              {/* H1 — primary keyword embedded naturally */}
              <h1 className="fu" itemProp="name" style={{fontFamily:"var(--font-display)",fontSize:"clamp(42px,5.2vw,76px)",fontWeight:300,lineHeight:1.03,marginBottom:22,letterSpacing:"-.01em",animationDelay:".2s"}}>
                Know if the deal works.<br/><em style={{fontStyle:"italic",background:"linear-gradient(135deg,#e2c97e 0%,#c9a84c 50%,#a07030 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Before anyone else does.</em>
              </h1>

              <p className="fu" itemProp="description" style={{fontSize:18,color:"var(--text-m)",lineHeight:1.8,maxWidth:500,marginBottom:14,animationDelay:".3s",fontWeight:300}}>
                Valora is real estate underwriting infrastructure for property professionals. Stop wasting hours on deals that should have been killed in 10 minutes.
              </p>

              {/* Brand trust line */}
              <p className="fu" style={{fontSize:13,color:"var(--gold)",fontFamily:"var(--font-display)",fontStyle:"italic",fontWeight:400,marginBottom:32,animationDelay:".35s",letterSpacing:".01em"}}>
                Built from real models trusted on $100m+ of deals.
              </p>

              <div className="fu hero-btns" style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:36,animationDelay:".4s"}}>
                <button className="btn-primary" onClick={onLogin} style={{padding:"15px 40px",fontSize:12}} aria-label="Start free property development appraisal">
                  Start for free →
                </button>
                <button className="btn-ghost" onClick={()=>window.open(CALENDLY,"_blank")} style={{padding:"14px 26px",borderColor:"var(--gold-border)",color:"var(--gold)",gap:8}} aria-label="Book a Valora demo">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Book a demo
                </button>
              </div>

              <div className="fu" style={{fontSize:10,color:"var(--text-d)",letterSpacing:".08em",textTransform:"uppercase",animationDelay:".5s"}}>
                Free forever · No credit card · First appraisal in 5 minutes
              </div>
            </div>

            {/* Product screenshot */}
            <div className="fu" style={{animationDelay:".3s"}}>
              <div style={{borderRadius:12,overflow:"hidden",border:"1px solid var(--border-m)",boxShadow:"0 32px 80px rgba(0,0,0,.65)",position:"relative"}}>
                <div style={{background:"var(--bg2)",borderBottom:"1px solid var(--border)",padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
                  <div style={{display:"flex",gap:5}}>{["#f4645f","#f0a429","#3ddc84"].map(c=><div key={c} style={{width:9,height:9,borderRadius:"50%",background:c,opacity:.55}}/>)}</div>
                  <div style={{flex:1,background:"var(--bg3)",borderRadius:3,padding:"4px 12px",fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)",maxWidth:260,margin:"0 auto",textAlign:"center",letterSpacing:".06em"}}>app.valoraplatform.io</div>
                </div>
                <img src="/screenshots/analysis-btr.png" alt="Valora property development appraisal software dashboard — BTR cashflow analysis with DSCR and IRR" style={{width:"100%",display:"block",objectFit:"cover",maxHeight:440,objectPosition:"top"}} onError={e=>{(e.target as HTMLImageElement).parentElement!.style.minHeight="380px";(e.target as HTMLImageElement).parentElement!.style.background="var(--bg2)";(e.target as HTMLImageElement).style.display="none";}}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,background:"linear-gradient(transparent,rgba(6,7,10,.6))",pointerEvents:"none"}}/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — TRUST BAR
      ══════════════════════════════════════ */}
      <div style={{borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)",background:"var(--bg1)",padding:"22px 0"}}>
        <div className="container">
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:32,flexWrap:"wrap"}}>
            {[["$100m+","Deals modelled"],["12","Countries"],["< 5 min","First appraisal"],["99.9%","Uptime"]].map(([v,l])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,color:"var(--gold-l)",letterSpacing:"-.01em"}}>{v}</div>
                <div style={{fontSize:9,color:"var(--text-d)",marginTop:2,letterSpacing:".1em",textTransform:"uppercase"}}>{l}</div>
              </div>
            ))}
            <div style={{width:1,height:36,background:"var(--border)",margin:"0 8px"}}/>
            {["Harrington Capital","Meridian Develop.","Atlas Real Estate","Vantage Group","Solus Ventures"].map(name=>(
              <div key={name} style={{padding:"5px 16px",borderRadius:3,border:"1px solid var(--border)",fontSize:10,color:"var(--text-d)",letterSpacing:".04em",whiteSpace:"nowrap"}}>{name}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          SECTION 3 — THE 5 PROBLEMS
      ══════════════════════════════════════ */}
      <section style={{padding:"100px 0"}} aria-labelledby="problems-heading">
        <div className="container">
          <div className="reveal" style={{maxWidth:600,marginBottom:64}}>
            <span style={{fontSize:9,letterSpacing:".18em",textTransform:"uppercase",color:"var(--gold)",display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <span style={{width:24,height:1,background:"var(--gold)",flexShrink:0}}/>
              Why Valora exists
            </span>
            <h2 id="problems-heading" style={{fontFamily:"var(--font-display)",fontSize:"clamp(30px,3.5vw,52px)",fontWeight:300,lineHeight:1.06,marginBottom:20}}>
              Five expensive problems<br/><em style={{fontStyle:"italic",color:"var(--text-m)"}}>every deal runs into.</em>
            </h2>
            <p style={{fontSize:15,color:"var(--text-m)",lineHeight:1.85,fontWeight:300}}>Most underwriting lives in spreadsheets, WhatsApp messages and memory. That's not infrastructure — that's risk. Valora was built to fix it.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,background:"var(--border)",border:"1px solid var(--border)",borderRadius:12,overflow:"hidden"}} className="three-col">
            {[
              {no:"01",problem:"Too much time on deals that should die in 10 minutes",solution:"Valora gives you a structured go / no-go in minutes — not after a full model build.",color:"var(--red)"},
              {no:"02",problem:"Good deals analysed too slowly",solution:"By the time the numbers are ready, the deal is gone. Valora produces institutional analysis the moment you enter your assumptions.",color:"var(--amber)"},
              {no:"03",problem:"Underwriting fragmented across Excel, WhatsApp and memory",solution:"One platform. Cashflow, debt, tax, sensitivity, AI check, pipeline and team — all connected, always live.",color:"var(--gold)"},
              {no:"04",problem:"Inconsistent assumptions across your team",solution:"One model, one version, one truth. Everyone works from the same live appraisal — no more emailing spreadsheet versions.",color:"var(--blue)"},
              {no:"05",problem:"Decisions not properly pressure-tested",solution:"Automatic DSCR checking, 45-scenario sensitivity matrices and AI Sense Check flag what a lender will challenge — before credit committee does.",color:"var(--green)"},
            ].map((item,i)=>(
              <div key={i} style={{background:"var(--bg1)",padding:"36px 32px",gridColumn:i===4?"1 / -1":"auto"}}>
                <div style={{fontSize:9,color:item.color,letterSpacing:".14em",fontFamily:"var(--font-mono)",marginBottom:16,opacity:.7}}>{item.no}</div>
                <h3 style={{fontFamily:"var(--font-display)",fontSize:19,fontWeight:500,color:"var(--text)",marginBottom:12,lineHeight:1.25}}>{item.problem}</h3>
                <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.75}}>{item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4 — PRODUCT SCREENSHOT
      ══════════════════════════════════════ */}
      <section style={{padding:"0 0 100px",background:"var(--bg)"}} aria-label="Valora platform product tour">
        <div className="container">
          <div className="reveal" style={{textAlign:"center",marginBottom:36}}>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,3vw,44px)",fontWeight:300,lineHeight:1.06}}>
              Institutional analysis.<br/><em style={{fontStyle:"italic",color:"var(--text-m)"}}>Without the institutional overhead.</em>
            </h2>
          </div>
          <div className="reveal" style={{borderRadius:"10px 10px 0 0",overflow:"hidden",border:"1px solid var(--border-m)",borderBottom:"none",boxShadow:"0 -16px 60px rgba(0,0,0,.4)",background:"var(--bg1)"}}>
            <div style={{background:"var(--bg2)",borderBottom:"1px solid var(--border)",padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
              <div style={{display:"flex",gap:5}}>{["#f4645f","#f0a429","#3ddc84"].map(c=><div key={c} style={{width:9,height:9,borderRadius:"50%",background:c,opacity:.55}}/>)}</div>
              <div style={{flex:1,display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
                {["BTR Returns Analysis","Monthly Cashflow","Sensitivity Matrix","Deal Pipeline","Team Workspace"].map(t=>(
                  <span key={t} style={{fontSize:9,color:"var(--text-d)",padding:"3px 10px",borderRadius:2,background:"var(--bg3)",letterSpacing:".06em",textTransform:"uppercase"}}>{t}</span>
                ))}
              </div>
            </div>
            <img src="/screenshots/cashflow.png" alt="Valora real estate development finance model showing monthly cashflow, DSCR analysis and sensitivity matrices" style={{width:"100%",display:"block",objectFit:"cover",maxHeight:520,objectPosition:"top"}} onError={e=>{(e.target as HTMLImageElement).parentElement!.style.minHeight="380px";(e.target as HTMLImageElement).parentElement!.style.background="var(--bg2)";(e.target as HTMLImageElement).style.display="none";}}/>
            <div style={{position:"relative",height:80,background:"linear-gradient(transparent,var(--bg))",marginTop:-80,pointerEvents:"none"}}/>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 5 — WHO IT'S FOR
      ══════════════════════════════════════ */}
      <section style={{padding:"100px 0",background:"var(--bg1)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}} aria-labelledby="for-heading">
        <div className="container">
          <div className="reveal" style={{textAlign:"center",marginBottom:56}}>
            <h2 id="for-heading" style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,52px)",fontWeight:300,lineHeight:1.06,marginBottom:16}}>
              Built for people who<br/><em style={{fontStyle:"italic",color:"var(--text-m)"}}>look at deals seriously.</em>
            </h2>
            <p style={{fontSize:15,color:"var(--text-m)",maxWidth:480,margin:"0 auto",lineHeight:1.8}}>Not institutional giants with 40-person finance teams. Not weekend hobbyists. The professionals in between — who think rigorously and move fast.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}} className="three-col">
            {[
              {icon:"◈",color:"var(--gold)",title:"Property Developers",desc:"New-build, conversion, BTR or BTS — model any development deal with the same rigour as a bank, in a fraction of the time."},
              {icon:"◎",color:"var(--blue)",title:"Hotel Buyers & Operators",desc:"ADR, RevPAR, EBITDA, CapEx, DSCR — everything a hotel acquisition model needs, without building it from scratch."},
              {icon:"◉",color:"var(--green)",title:"Value-Add Investors",desc:"Stress test your entry price, capex budget, exit yield and downside scenario before you make an offer."},
              {icon:"◫",color:"var(--amber)",title:"Deal Sourcers & Advisors",desc:"Turn around a credible feasibility in minutes. Share a live link with your client before the meeting ends."},
            ].map((p,i)=>(
              <div key={i} className="reveal" style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:11,padding:"28px 24px",transition:"border-color .2s,transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,.2)";e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="translateY(0)"}}>
                <div style={{width:42,height:42,borderRadius:8,background:p.color+"0e",border:`1px solid ${p.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:p.color,marginBottom:18}}>{p.icon}</div>
                <h3 style={{fontFamily:"var(--font-display)",fontSize:19,fontWeight:500,color:"var(--text)",marginBottom:10,lineHeight:1.2}}>{p.title}</h3>
                <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.75}}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 6 — KEY FEATURES
      ══════════════════════════════════════ */}
      <section id="features" style={{padding:"100px 0"}} aria-labelledby="features-heading">
        <div className="container">
          <div className="reveal" style={{textAlign:"center",marginBottom:64}}>
            <h2 id="features-heading" style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,52px)",fontWeight:300,lineHeight:1.06,marginBottom:14}}>
              Every tool your deal needs.<br/><em style={{fontStyle:"italic",color:"var(--text-m)"}}>In one place.</em>
            </h2>
            <p style={{fontSize:15,color:"var(--text-m)",maxWidth:460,margin:"0 auto",lineHeight:1.8}}>All models. All plans. From your first deal on the Free tier to an Enterprise team workspace — the engine never changes.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}} className="three-col">
            {[
              {icon:"◈",tag:"Cashflow",title:"True Monthly Cashflow Engine",body:"See exactly how your deal performs month by month from land acquisition to exit. No flat estimates — interest is rolled on actual drawn balances.",kw:"property development cashflow model"},
              {icon:"◈",tag:"Returns",title:"IRR, Equity Multiple & Break-Even",body:"Levered and unlevered IRR, MOIC, payback period and break-even yield — the exact metrics a lender or equity partner will stress test.",kw:"real estate IRR calculator"},
              {icon:"◈",tag:"Debt",title:"DSCR / ICR — Auto Checked",body:"Debt service cover ratio and ICR calculated automatically. Flagged the moment you drop below 1.25× — before your credit committee sees it.",kw:"DSCR calculator real estate development"},
              {icon:"◈",tag:"Risk",title:"45-Scenario Sensitivity Matrix",body:"Exit yield vs rent — 45 scenarios, colour-coded RAG, recalculated live using the full finance model. Know your downside before you commit.",kw:"development appraisal sensitivity analysis"},
              {icon:"◈",tag:"Valuation",title:"Residual Land Value Calculator",body:"Live RLV that updates as you type. Shows exactly what you can afford to pay for the site — and what moves the needle most.",kw:"residual land value calculator"},
              {icon:"◈",tag:"AI",title:"AI Sense Check",body:"Automatically benchmarks your assumptions against market data. Flags aggressive exit yields, LTC breaches and build cost issues before credit committee.",kw:"AI property development analysis"},
              {icon:"◈",tag:"AI",title:"AI Investor Brochures",body:"Upload photos, generate a professional investment memorandum. Branded PDF with a live link — investors always see the latest version.",kw:"real estate investment memorandum software"},
              {icon:"◈",tag:"Team",title:"Team Workspace & Pipeline",body:"Invite your analysts, asset managers and JV partners. Shared appraisals, tasks, notes, activity feed and role permissions — everyone on the same live deal.",kw:"real estate team collaboration software"},
              {icon:"◈",tag:"Finance",title:"10 Live Benchmark Rates",body:"SONIA, SOFR, EURIBOR, EIBOR, SORA, AONIA, TONA, SARON, CORRA, HONIA. Finance costs calculated against the actual forward curve.",kw:"development finance benchmark rates"},
            ].map((f,i)=>(
              <div key={i} className="reveal" style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:11,padding:"28px 26px",transition:"border-color .2s,transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,.2)";e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="translateY(0)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                  <span style={{fontSize:15,color:"var(--gold)",opacity:.6}}>{f.icon}</span>
                  <span style={{fontSize:9,color:"var(--text-d)",background:"var(--bg3)",padding:"3px 9px",borderRadius:2,letterSpacing:".1em",textTransform:"uppercase"}}>{f.tag}</span>
                </div>
                <h3 style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:500,marginBottom:10,color:"var(--text)",lineHeight:1.2}}>{f.title}</h3>
                <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.75}}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 7 — TESTIMONIALS
      ══════════════════════════════════════ */}
      <section style={{padding:"100px 0",background:"var(--bg1)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}} aria-label="Customer testimonials">
        <div className="container">
          <div className="reveal" style={{textAlign:"center",marginBottom:56}}>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,3vw,44px)",fontWeight:300,lineHeight:1.1}}>
              Numbers professionals<br/><em style={{fontStyle:"italic",color:"var(--text-m)"}}>actually trust.</em>
            </h2>
          </div>
          <div className="testimonials-grid reveal" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {[
              {q:"James H.",role:"Property Developer, London",initials:"JH",quote:"First time I've walked into a lender meeting and not been asked to go away and rebuild the model. The numbers just held up."},
              {q:"Sarah R.",role:"Fund Manager, Dubai",initials:"SR",quote:"The hotel model does in 10 minutes what used to take my analyst two days. And it's more thorough."},
              {q:"Marcus K.",role:"Investment Director, Singapore",initials:"MK",quote:"Shared the live link with three investors in different cities. All looking at the same numbers in real time. That's a different conversation."},
            ].map((t,i)=>(
              <article key={i} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:11,padding:"36px",transition:"border-color .25s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(201,168,76,.15)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                <div style={{fontSize:48,color:"var(--gold)",opacity:.18,fontFamily:"var(--font-display)",lineHeight:.8,marginBottom:20,userSelect:"none"}}>"</div>
                <blockquote style={{fontFamily:"var(--font-display)",fontSize:17,fontWeight:300,lineHeight:1.65,color:"var(--text)",marginBottom:28,fontStyle:"italic"}}>{t.quote}</blockquote>
                <div style={{display:"flex",alignItems:"center",gap:14,paddingTop:20,borderTop:"1px solid var(--border)"}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"var(--bg3)",border:"1px solid var(--border-m)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:"var(--gold)",fontFamily:"var(--font-mono)",flexShrink:0}}>{t.initials}</div>
                  <div><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{t.q}</div><div style={{fontSize:11,color:"var(--text-d)",marginTop:2,letterSpacing:".04em"}}>{t.role}</div></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 8 — PRICING
      ══════════════════════════════════════ */}
      <section id="pricing" style={{padding:"100px 0"}} aria-labelledby="pricing-heading">
        <div className="container">
          <div className="reveal" style={{textAlign:"center",marginBottom:56}}>
            <h2 id="pricing-heading" style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,52px)",fontWeight:300,marginBottom:14,lineHeight:1.06}}>
              Start free.<br/><em style={{fontStyle:"italic",color:"var(--text-m)"}}>Upgrade when your deal needs an audience.</em>
            </h2>
            <p style={{fontSize:13,color:"var(--text-d)",letterSpacing:".06em",textTransform:"uppercase"}}>All real estate models on every plan · No credit card required · Cancel anytime</p>
          </div>
          <div className="pricing-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,maxWidth:920,margin:"0 auto"}}>
            {PLANS.map((plan,i)=>(
              <div key={i} className={`price-card ${plan.featured?"featured":""}`}>
                {plan.featured&&<div className="badge" style={{position:"absolute",top:18,right:18,fontSize:8}}>Most Popular</div>}
                {plan.featured&&<div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,var(--gold) 40%,var(--gold-l),transparent)"}}/>}
                <div style={{marginBottom:24}}>
                  <div style={{fontSize:10,fontWeight:500,color:"var(--text-m)",marginBottom:10,letterSpacing:".1em",textTransform:"uppercase"}}>{plan.name}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:10}}>
                    {plan.price==="$0"
                      ? <span style={{fontFamily:"var(--font-display)",fontSize:36,fontWeight:300,color:"var(--green)"}}>Free</span>
                      : <><span style={{fontFamily:"var(--font-display)",fontSize:44,fontWeight:300,color:"var(--text)",letterSpacing:"-.02em"}}>{plan.price}</span><span style={{fontSize:11,color:"var(--text-d)",letterSpacing:".04em"}}>{plan.period}</span></>
                    }
                  </div>
                  <p style={{fontSize:13,color:"var(--text-d)",lineHeight:1.65}}>{plan.desc}</p>
                </div>
                <div style={{height:1,background:"var(--border)",marginBottom:22}}/>
                <ul style={{listStyle:"none",marginBottom:28}} aria-label={`${plan.name} plan features`}>
                  {plan.features.map((f,j)=>(<li key={j} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10,fontSize:13,color:"var(--text-m)"}}><span style={{color:"var(--green)",fontSize:9,marginTop:3,flexShrink:0}}>✓</span>{f}</li>))}
                </ul>
                <button className={plan.featured?"btn-primary":"btn-ghost"} style={{width:"100%",justifyContent:"center",padding:"13px"}} onClick={onLogin} aria-label={`${plan.cta} — ${plan.name} plan`}>{plan.cta}</button>
              </div>
            ))}
          </div>
          <p style={{textAlign:"center",marginTop:24,fontSize:11,color:"var(--text-d)",letterSpacing:".04em"}}>All prices exclude applicable taxes · Annual billing available — save 20%</p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 9 — FAQ (FAQPage schema)
      ══════════════════════════════════════ */}
      <section style={{padding:"100px 0",background:"var(--bg1)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}} aria-labelledby="faq-heading">
        <div className="container">
          <div style={{maxWidth:720,margin:"0 auto"}}>
            <div className="reveal" style={{textAlign:"center",marginBottom:48}}>
              <h2 id="faq-heading" style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,3vw,44px)",fontWeight:300,lineHeight:1.1,marginBottom:10}}>Frequently asked questions</h2>
              <p style={{fontSize:13,color:"var(--text-d)",letterSpacing:".04em"}}>Can't find your answer? <span style={{color:"var(--gold)",cursor:"pointer"}} onClick={()=>onPage("support")}>Visit our support centre →</span></p>
            </div>
            <div itemScope itemType="https://schema.org/FAQPage">
              {FAQS.map((faq,i)=>(
                <div key={i} className="faq-item reveal" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                    <span itemProp="name">{faq.q}</span>
                    <span style={{color:"var(--gold)",fontSize:20,flexShrink:0,marginLeft:16,transition:"transform .2s",display:"inline-block",transform:openFaq===i?"rotate(45deg)":"none"}}>+</span>
                  </div>
                  {openFaq===i&&(
                    <div className="faq-a" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <span itemProp="text">{faq.a}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 10 — FINAL CTA
      ══════════════════════════════════════ */}
      <section style={{padding:"120px 0",background:"var(--bg)",position:"relative",overflow:"hidden"}} aria-label="Get started with Valora">
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 50%,rgba(201,168,76,.055) 0%,transparent 62%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.01) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.01) 1px,transparent 1px)",backgroundSize:"64px 64px",pointerEvents:"none"}}/>
        <div className="container" style={{textAlign:"center",position:"relative",zIndex:1}}>
          <div className="reveal">
            <span style={{fontSize:9,letterSpacing:".18em",textTransform:"uppercase",color:"var(--gold)",display:"inline-flex",alignItems:"center",gap:10,marginBottom:24}}>
              <span style={{width:20,height:1,background:"var(--gold)",display:"inline-block"}}/>
              Property Development Appraisal Software
              <span style={{width:20,height:1,background:"var(--gold)",display:"inline-block"}}/>
            </span>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(38px,5vw,72px)",fontWeight:300,lineHeight:1.03,marginBottom:20}}>
              Know if the deal works.<br/><em style={{fontStyle:"italic",background:"linear-gradient(135deg,#e2c97e 0%,#c9a84c 50%,#a07030 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Before anyone else does.</em>
            </h2>
            <p style={{fontSize:16,color:"var(--text-m)",maxWidth:480,margin:"0 auto 16px",lineHeight:1.8}}>Built from real models trusted on $100m+ of deals. Start free in 5 minutes.</p>
            <p style={{fontSize:13,color:"var(--gold)",fontFamily:"var(--font-display)",fontStyle:"italic",marginBottom:40,letterSpacing:".01em"}}>No credit card. No spreadsheet. No guesswork.</p>
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>
              <button className="btn-primary" onClick={onLogin} style={{fontSize:12,padding:"16px 48px"}} aria-label="Start free property development appraisal">Start for free →</button>
              <button className="btn-ghost" onClick={()=>window.open(CALENDLY,"_blank")} style={{fontSize:12,padding:"15px 28px",borderColor:"var(--gold-border)",color:"var(--gold)"}}>Book a demo</button>
            </div>
            <div style={{fontSize:10,color:"var(--text-d)",letterSpacing:".1em",textTransform:"uppercase"}}>Free forever · All models included · Setup in 5 minutes · Cancel anytime</div>
          </div>
        </div>
      </section>

      <Footer onPage={onPage}/>

      {/* STICKY CTA */}
      <div className={`sticky-cta ${stickyVisible?"visible":""}`} role="complementary" aria-label="Quick access CTA">
        <div>
          <div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>Know if your deal works — before anyone else does.</div>
          <div style={{fontSize:10,color:"var(--text-d)",letterSpacing:".06em",textTransform:"uppercase",marginTop:2}}>Free forever · No credit card required</div>
        </div>
        <div style={{display:"flex",gap:10,flexShrink:0}}>
          <button className="btn-ghost" onClick={()=>window.open(CALENDLY,"_blank")} style={{padding:"9px 18px",borderColor:"var(--gold-border)",color:"var(--gold)"}}>Book a demo</button>
          <button className="btn-primary" onClick={onLogin} style={{padding:"9px 22px"}}>Start for free →</button>
        </div>
      </div>
    </div>
  );
}


function LegalPage({title,lastUpdated,children,onLogin,onPage,scrolled}:any) {
  return (<div><Nav onLogin={onLogin} onPage={onPage} scrolled={scrolled} currentPage="legal"/><div className="legal-content"><h1>{title}</h1><div className="meta">Last updated: {lastUpdated} · Valora Technologies Ltd · Registered in England & Wales</div>{children}</div><Footer onPage={onPage}/></div>);
}
function PrivacyContent(){return(<><p>Valora Technologies Ltd is committed to protecting your personal data. We collect account data (name, email, firm), appraisal data you create, anonymised usage data, and payment confirmation from Stripe. We do not store card details or use your appraisals to train AI models.</p><h2>Your Rights</h2><p>Under UK GDPR you have rights to access, correct, delete, and port your data. Contact <a href="mailto:privacy@valoraplatform.io">privacy@valoraplatform.io</a>.</p></>);}
function TermsContent(){return(<><p>These Terms govern your use of the Valora platform. Subscriptions are billed monthly or annually. 14-day free trial on all plans. Cancel anytime. Prices exclude applicable taxes. The platform and AI features provide information only — not financial advice. Governed by the laws of England and Wales.</p><p>Contact: <a href="mailto:legal@valoraplatform.io">legal@valoraplatform.io</a></p></>);}
function CookiesContent(){return(<><p>We use essential cookies to keep you logged in and protect against CSRF. Analytics cookies are anonymised. Stripe sets cookies for payment security. Contact <a href="mailto:privacy@valoraplatform.io">privacy@valoraplatform.io</a> with questions.</p></>);}
function AccessibilityContent(){return(<><p>We aim to meet WCAG 2.1 Level AA. Keyboard navigation, screen reader labels, sufficient contrast, and ARIA roles are implemented throughout. Contact <a href="mailto:accessibility@valoraplatform.io">accessibility@valoraplatform.io</a> to report issues.</p></>);}


function SupportPage({onLogin,onPage,scrolled}:any){
  const [openFaq,setOpenFaq]=useState<any>(null);
  const faqs=[
    {q:"How do I create my first appraisal?",a:"Click 'New Appraisal' from your dashboard, choose your asset type, select currency and benchmark rate, and follow the tabs. Most users complete their first appraisal in under 15 minutes."},
    {q:"Which currencies and benchmark rates are supported?",a:"GBP (SONIA), USD (SOFR), EUR (EURIBOR), AED (EIBOR), SGD (SORA), AUD (AONIA), JPY (TONA), CHF (SARON), CAD (CORRA), HKD (HONIA)."},
    {q:"Can I share appraisals with investors?",a:"Yes. From any appraisal click Share to generate a live link. Investors see the latest version without needing to log in."},
    {q:"How does the DSCR check work?",a:"DSCR and ICR are calculated automatically from your stabilised NOI (or EBITDA for hotels) against annual debt service on the peak loan balance. A flag appears if DSCR drops below 1.25×."},
    {q:"How does AI Sense Check work?",a:"It benchmarks your assumptions against market data — build costs, exit yields, LTC ratios, DSCR levels, rents — and flags what a senior lender would challenge. Runs automatically as you type."},
    {q:"How does the Team Workspace work?",a:"Invite team members by email. Each project has a shared workspace with tasks, notes, activity feed and role-based permissions. All members see the live appraisal — no more emailing spreadsheet versions."},
    {q:"How does AI Brochure work?",a:"Upload up to 3 photos, click Generate — Claude AI writes a professional investment memo. Edit each section before downloading the PDF."},
    {q:"Can I cancel my subscription at any time?",a:"Yes. Cancel from account settings. Subscription remains active until end of current billing period."},
    {q:"Is my data secure?",a:"All data is encrypted in transit and at rest. Your appraisal data is never shared or used to train AI models."},
  ];
  return(
    <div>
      <Nav onLogin={onLogin} onPage={onPage} scrolled={scrolled} currentPage="support"/>
      <div style={{padding:"120px 0 64px",background:"var(--bg1)",borderBottom:"1px solid var(--border)"}}>
        <div className="container" style={{textAlign:"center"}}>
          <div className="section-label" style={{justifyContent:"center",marginBottom:20}}>Support Centre</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(32px,4vw,60px)",fontWeight:300,marginBottom:16,lineHeight:1.04}}>How can we <em style={{color:"var(--gold)",fontStyle:"italic"}}>help?</em></h1>
          <p style={{fontSize:15,color:"var(--text-m)",maxWidth:480,margin:"0 auto 36px",lineHeight:1.8,fontWeight:300}}>Our team responds within 2 business hours on Pro, and 24 hours on Free.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="mailto:support@valoraplatform.io"><button className="btn-primary" style={{padding:"13px 28px"}}>Email Support</button></a>
            <button className="btn-ghost" onClick={onLogin} style={{padding:"12px 24px"}}>Open Platform</button>
          </div>
        </div>
      </div>
      <div className="container" style={{padding:"64px 48px"}}>
        <div className="support-grid">
          {[
            {icon:"◈",title:"Email Support",desc:"For account, billing, and technical queries. We respond within 24 hours.",action:"support@valoraplatform.io",link:"mailto:support@valoraplatform.io"},
            {icon:"◎",title:"Priority Support",desc:"Pro and Enterprise plans include 2-hour response SLA during business hours.",action:"Upgrade to Pro →",link:"#pricing"},
            {icon:"◉",title:"Onboarding",desc:"Enterprise plans include dedicated 1-on-1 onboarding and template setup.",action:"Contact Sales →",link:"mailto:sales@valoraplatform.io"},
          ].map((c,i)=>(<div key={i} className="support-card" onClick={()=>window.open(c.link,"_self")}><div style={{fontSize:18,marginBottom:18,color:"var(--gold)"}}>{c.icon}</div><div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:500,marginBottom:10,color:"var(--text)"}}>{c.title}</div><p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.75,marginBottom:18}}>{c.desc}</p><div style={{fontSize:11,color:"var(--gold)",fontWeight:500,letterSpacing:".06em"}}>{c.action}</div></div>))}
        </div>
        <div style={{maxWidth:720,margin:"64px auto 0"}}>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:36,fontWeight:300,marginBottom:8,textAlign:"center",lineHeight:1.06}}>Frequently Asked Questions</h2>
          <p style={{fontSize:12,color:"var(--text-d)",textAlign:"center",marginBottom:40,letterSpacing:".04em"}}>Can't find what you're looking for? <a href="mailto:support@valoraplatform.io" style={{color:"var(--gold)"}}>Email us</a>.</p>
          {faqs.map((faq,i)=>(<div key={i} className="faq-item"><div className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}><span>{faq.q}</span><span style={{color:"var(--gold)",fontSize:20,flexShrink:0,marginLeft:16,transition:"transform .2s",display:"inline-block",transform:openFaq===i?"rotate(45deg)":"none"}}>+</span></div>{openFaq===i&&<div className="faq-a">{faq.a}</div>}</div>))}
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
  useEffect(()=>{ const params=new URLSearchParams(window.location.search); const inviteEmail=params.get("email"); const inviteFirm=params.get("firm"); if(inviteEmail)setEmail(decodeURIComponent(inviteEmail)); if(inviteFirm)setTab("signup"); },[]);
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
          <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
            <img src="data:image/png;base64,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" alt="Valora" style={{height:26,width:"auto"}}/>
          </button>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",position:"relative",zIndex:1}}>
          <div className="section-label" style={{marginBottom:20}}>Institutional Appraisal</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(30px,3vw,50px)",fontWeight:300,lineHeight:1.06,marginBottom:20}}>Model with the<br/><em className="grad-text" style={{fontStyle:"italic"}}>precision of a<br/>trading floor</em></h2>
          <p style={{fontSize:14,color:"var(--text-m)",lineHeight:1.85,maxWidth:360,marginBottom:40,fontWeight:300}}>True monthly cash flows. DSCR checking. AI sense check. Team workspace. Branded investor brochures. Everything your deal team needs.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[{icon:"◈",text:"True Monthly CF Engine",sub:"S-curve rolled interest on drawn balances"},{icon:"◎",text:"DSCR / ICR & Equity Multiple",sub:"Institutional metrics, auto-flagged"},{icon:"◉",text:"AI Sense Check",sub:"Flags lender challenges automatically"},{icon:"◫",text:"Team Workspace",sub:"Collaborate on live appraisals"}].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:14,alignItems:"center",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,padding:"12px 16px"}}>
                <div className="ficon" style={{width:32,height:32,borderRadius:6,margin:0,fontSize:12}}>{item.icon}</div>
                <div><div style={{fontSize:12,fontWeight:500,color:"var(--text)",marginBottom:2}}>{item.text}</div><div style={{fontSize:11,color:"var(--text-d)",letterSpacing:".02em"}}>{item.sub}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="login-right">
        <div style={{width:"100%",maxWidth:440}}>
          <button onClick={onBack} className="btn-ghost" style={{marginBottom:28,padding:"7px 16px"}}>← Back to site</button>
          {success?(
            <div className="login-card" style={{textAlign:"center"}}>
              <div style={{width:56,height:56,borderRadius:"50%",margin:"0 auto 20px",background:"rgba(61,220,132,.07)",border:"1px solid rgba(61,220,132,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"var(--green)"}}>✓</div>
              <h2 style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:400,marginBottom:10}}>{tab==="reset"?"Check your inbox":"Almost there"}</h2>
              <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.75}}>{tab==="reset"?"Reset link sent to "+email+".":"Confirmation link sent to "+email+". Click it to verify your account and get started."}</p>
              <button className="btn-ghost" style={{marginTop:24,width:"100%",justifyContent:"center"}} onClick={()=>{setSuccess(false);setTab("signin")}}>Back to sign in</button>
            </div>
          ):(
            <div className="login-card">
              {tab!=="reset"&&(<div className="tab-switch" style={{marginBottom:28}}><button className={`tab-btn ${tab==="signin"?"active":""}`} onClick={()=>setTab("signin")}>Sign In</button><button className={`tab-btn ${tab==="signup"?"active":""}`} onClick={()=>setTab("signup")}>Create Account</button></div>)}
              <div style={{marginBottom:24}}>
                {tab==="reset"&&<button onClick={()=>setTab("signin")} style={{background:"none",border:"none",color:"var(--text-d)",fontSize:11,cursor:"pointer",marginBottom:14,padding:0,fontFamily:"var(--font-body)",letterSpacing:".04em"}}>← Back to sign in</button>}
                <h1 style={{fontFamily:"var(--font-display)",fontSize:30,fontWeight:400,marginBottom:6,lineHeight:1.08}}>{tab==="signin"?"Welcome back":tab==="signup"?"Get started":"Reset your password"}</h1>
                <p style={{fontSize:13,color:"var(--text-m)"}}>{tab==="signin"?"Sign in to your Valora workspace":tab==="signup"?"Create your account — 14 day free trial included.":"Enter your email and we'll send a reset link."}</p>
              </div>
              <form onSubmit={submit}>
                {tab==="signup"&&(<>
                  <div style={{marginBottom:16}}><label style={{fontSize:9,color:"var(--text-m)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".14em"}}>Full Name</label><input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="James Harrington"/></div>
                  <div style={{marginBottom:16}}><label style={{fontSize:9,color:"var(--text-m)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".14em"}}>Firm / Company</label><input className="inp" value={firm} onChange={e=>setFirm(e.target.value)} placeholder="Harrington Capital"/>{errors.firm&&<div style={{fontSize:11,color:"var(--red)",marginTop:5}}>{errors.firm}</div>}</div>
                </>)}
                <div style={{marginBottom:16}}><label style={{fontSize:9,color:"var(--text-m)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".14em"}}>Email Address</label><input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="james@harringtoncap.com"/>{errors.email&&<div style={{fontSize:11,color:"var(--red)",marginTop:5}}>{errors.email}</div>}</div>
                {tab!=="reset"&&(<div style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <label style={{fontSize:9,color:"var(--text-m)",textTransform:"uppercase",letterSpacing:".14em"}}>Password</label>
                    {tab==="signin"&&<button type="button" onClick={()=>setTab("reset")} style={{background:"none",border:"none",color:"var(--gold)",fontSize:11,cursor:"pointer",fontFamily:"var(--font-body)",padding:0,letterSpacing:".04em"}}>Forgot?</button>}
                  </div>
                  <div style={{position:"relative"}}>
                    <input className="inp" type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder={tab==="signup"?"Create a strong password":"Your password"} style={{paddingRight:48}} autoComplete={tab==="signup"?"new-password":"current-password"}/>
                    <button type="button" onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:11,fontFamily:"var(--font-body)",letterSpacing:".04em"}}>{showPw?"Hide":"Show"}</button>
                  </div>
                  {errors.password&&<div style={{fontSize:11,color:"var(--red)",marginTop:5}}>{errors.password}</div>}
                </div>)}
                <button type="submit" className="btn-primary" style={{width:"100%",justifyContent:"center",padding:"14px",marginTop:8}} disabled={loading}>
                  {loading?<span style={{width:18,height:18,border:"2px solid rgba(0,0,0,.15)",borderTopColor:"#06070a",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>:tab==="signin"?"Sign In →":tab==="reset"?"Send Reset Link →":"Create Account →"}
                </button>
              </form>
              <p style={{marginTop:22,paddingTop:18,borderTop:"1px solid var(--border)",textAlign:"center",fontSize:11,color:"var(--text-d)",lineHeight:1.65}}>By continuing you agree to our <span style={{color:"var(--gold)",cursor:"pointer"}}>Terms</span> & <span style={{color:"var(--gold)",cursor:"pointer"}}>Privacy Policy</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
