"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
/* ═══════════════════════════════════════════════════════════════════════
   VALORA — LANDING / MARKETING v2
   Single-theme LIGHT page (dark mode hurts conversion on marketing).
   Rebranded to match dashboard / pipeline / appraisal / workspace / tasks
   / team / notes / learn: Poppins + JetBrains Mono, Valora palette
   (#F8F5EE cream / #0F1115 navy / #2E9E72 sage / #A8843A gold).
   Dark sections (hero mock screenshots, footer, final CTA, pricing
   featured card, login left panel) use the canonical Valora dark
   surfaces (#0F1115 / #1A1E26 / #242933) so the visual transition when
   users sign in and land on the dashboard feels continuous.
   All Supabase auth + routing logic byte-identical. No body.light or
   html[data-theme] manipulation — landing just renders light always;
   the user's dashboard theme preference in localStorage stays untouched.
   ═══════════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ─── VALORA PALETTE — LIGHT only ─── */
:root{
  --sage:#2E9E72;--sage-l:#52C498;--sage-bg:rgba(46,158,114,0.10);--sage-border:rgba(46,158,114,0.25);
  --navy:#0F1115;--navy-l:#1A1E26;--navy-ll:#242933;
  --gold:#C9A84C;
  --bg:#F8F5EE;--bg2:#FFFFFF;--bg3:#F2EEE4;
  --text:#0F1115;--text-m:#3D4351;--text-d:#6B7280;
  --border:rgba(15,17,21,0.10);--border-m:rgba(15,17,21,0.18);
  --red:#C24844;--amber:#C57E14;--blue:#2D7AB5;
  --font:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  --mono:'JetBrains Mono','SF Mono','Consolas',monospace;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--font);font-size:14px;line-height:1.45;font-weight:400;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overflow-x:hidden}
a{text-decoration:none;color:inherit}
::selection{background:var(--sage-bg);color:var(--sage)}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--border-m);border-radius:2px}

@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}

.reveal{opacity:0;transform:translateY(20px);transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1)}
.reveal.visible{opacity:1;transform:translateY(0)}
.reveal-delay-1{transition-delay:.1s}
.reveal-delay-2{transition-delay:.2s}
.reveal-delay-3{transition-delay:.3s}
.reveal-delay-4{transition-delay:.4s}

.nav{position:fixed;top:0;left:0;right:0;z-index:200;height:64px;display:flex;align-items:center;padding:0 48px;transition:all .3s;background:rgba(248,245,238,0)}
.nav.on{background:rgba(248,245,238,.92);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);box-shadow:0 1px 0 var(--border)}
.nav-logo{font-size:20px;font-weight:700;letter-spacing:-.015em;color:var(--navy);cursor:pointer;flex-shrink:0}
.nav-links{display:flex;gap:32px;margin:0 auto}
.nav-links a{font-size:13px;color:var(--text-m);transition:color .2s;cursor:pointer;font-weight:500;letter-spacing:-.005em}
.nav-links a:hover{color:var(--text)}
.nav-btns{display:flex;gap:10px;align-items:center}

.btn-primary{display:inline-flex;align-items:center;gap:8px;background:var(--navy);color:#F6F4EF;padding:0 22px;height:38px;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:-.015em;border:none;cursor:pointer;transition:all .2s;font-family:var(--font);white-space:nowrap}
.btn-primary:hover{background:var(--navy-l);transform:translateY(-1px)}
.btn-sage{display:inline-flex;align-items:center;gap:8px;background:var(--sage);color:#fff;padding:0 22px;height:38px;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:-.015em;border:none;cursor:pointer;transition:all .2s;font-family:var(--font);white-space:nowrap}
.btn-sage:hover{background:#267F5C;transform:translateY(-1px)}
.btn-ghost{display:inline-flex;align-items:center;gap:8px;background:transparent;color:var(--text-m);padding:0 20px;height:36px;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:-.015em;border:1px solid var(--border-m);cursor:pointer;transition:all .2s;font-family:var(--font)}
.btn-ghost:hover{border-color:var(--navy);color:var(--navy)}

.container{max-width:1120px;margin:0 auto;padding:0 48px}

.chip{display:inline-flex;align-items:center;gap:6px;background:var(--sage-bg);border:1px solid var(--sage-border);color:var(--sage);padding:4px 12px;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:-.015em}

.stat-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:28px 24px;transition:all .2s}
.stat-card:hover{border-color:var(--sage-border);box-shadow:0 4px 20px rgba(46,158,114,.08)}
.feature-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:28px;transition:all .25s;position:relative;overflow:hidden}
.feature-card:hover{border-color:var(--sage-border);transform:translateY(-2px);box-shadow:0 8px 32px rgba(46,158,114,.08)}
.feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--sage-l),transparent);opacity:0;transition:opacity .25s}
.feature-card:hover::before{opacity:1}

.model-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;border:1px solid;font-family:var(--mono);font-variant-numeric:tabular-nums}

.price-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:36px;transition:all .25s;position:relative}
.price-card:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(15,17,21,.10)}
.price-card.featured{border:2px solid var(--sage);background:var(--navy);color:#F6F4EF}
.price-card.featured .price-desc{color:rgba(246,244,239,.6)}
.price-card.featured .price-feature{color:rgba(246,244,239,.82);border-color:rgba(255,255,255,.08)}
.price-card.featured .price-feature::before{color:var(--sage-l)}
.price-feature{display:flex;align-items:flex-start;gap:10px;padding:8px 0;font-size:13px;color:var(--text-m);border-bottom:1px solid var(--border);font-weight:500}
.price-feature::before{content:'✓';color:var(--sage);font-weight:700;flex-shrink:0;margin-top:1px}
.price-feature:last-child{border:none}

.faq-item{border-bottom:1px solid var(--border)}
.faq-q{display:flex;justify-content:space-between;align-items:center;padding:20px 0;cursor:pointer;font-size:15px;font-weight:600;color:var(--text);letter-spacing:-.015em;gap:16px}
.faq-a{font-size:14px;color:var(--text-m);line-height:1.75;padding-bottom:20px;font-weight:500}
.faq-icon{flex-shrink:0;width:22px;height:22px;border-radius:50%;border:1.5px solid var(--border-m);display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--text-d);transition:all .2s}
.faq-item.open .faq-icon{background:var(--sage);border-color:var(--sage);color:#fff}

.ticker-wrap{overflow:hidden;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--bg2);padding:14px 0}
.ticker-inner{display:inline-flex;gap:64px;animation:ticker 60s linear infinite}
.ticker-item{display:inline-flex;align-items:center;gap:10px;font-size:11px;color:var(--text-d);letter-spacing:.08em;text-transform:uppercase;font-weight:600;white-space:nowrap}
.ticker-dot{width:4px;height:4px;border-radius:50%;background:var(--sage-l);flex-shrink:0}

.screenshot-frame{background:#1A1E26;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.06);box-shadow:0 40px 80px rgba(15,17,21,.22)}
.screen-bar{background:#242933;padding:12px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,.05)}
.screen-dot{width:10px;height:10px;border-radius:50%}
.screen-content{padding:20px;background:#0F1115}
.mock-card{background:#1A1E26;border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:14px}
.mock-label{font-size:10px;color:#949CA0;text-transform:uppercase;letter-spacing:.12em;margin-bottom:4px;font-family:var(--mono);font-weight:600}
.mock-value{font-size:20px;font-weight:700;color:#F6F4EF;font-family:var(--mono);font-variant-numeric:tabular-nums;letter-spacing:-.015em}
.mock-badge{display:inline-block;background:rgba(82,196,152,.15);color:#52C498;font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;margin-top:4px;font-family:var(--mono);letter-spacing:-.015em}
.mock-badge-red{background:rgba(244,100,95,.15);color:#F4645F}

.hamburger{display:none;background:none;border:none;cursor:pointer;flex-direction:column;gap:5px;padding:4px}
.hamburger span{display:block;width:22px;height:1.5px;background:var(--text-m);transition:all .3s}
.mobile-menu{display:none;position:fixed;inset:0;z-index:199;background:rgba(248,245,238,.98);padding:80px 40px 40px;flex-direction:column;gap:0;backdrop-filter:blur(20px)}
.mobile-menu.open{display:flex}
.mobile-menu a{font-size:24px;font-weight:700;color:var(--text);padding:16px 0;border-bottom:1px solid var(--border);cursor:pointer;letter-spacing:-.02em}

.inp{width:100%;padding:13px 16px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--font);font-size:14px;font-weight:500;outline:none;transition:all .2s}
.inp:focus{border-color:var(--sage);box-shadow:0 0 0 3px var(--sage-bg);background:var(--bg2)}
.inp::placeholder{color:var(--text-d)}

@media(max-width:900px){
  .login-wrap{grid-template-columns:1fr !important}
  .login-left{display:none !important}
  .login-right{padding:24px 20px !important}
  .nav{padding:0 20px;height:56px}
  .nav-links,.nav-btns{display:none}
  .hamburger{display:flex}
  .container{padding:0 20px}
  .hero-cols{grid-template-columns:1fr !important}
  .hero-right{display:none !important}
  .features-grid{grid-template-columns:1fr !important}
  .stats-grid{grid-template-columns:1fr 1fr !important}
  .pricing-grid{grid-template-columns:1fr !important;max-width:480px !important}
  .footer-grid{grid-template-columns:1fr !important;gap:32px !important}
  .footer-bottom{flex-direction:column !important;gap:12px !important;text-align:center}
  section{padding:64px 0 !important}
  .hero-btns{flex-direction:column !important}
  .hero-btns button,.hero-btns a{width:100%;justify-content:center}
  .three-col{grid-template-columns:1fr !important}
}
@media(max-width:600px){
  .stats-grid{grid-template-columns:1fr !important}
  .pricing-grid{max-width:100% !important}
}
`;
const PLANS = [
  {
    name:"Free",price:"$0",period:"",desc:"1 full appraisal — all features unlocked. No card needed.",
    features:["1 full appraisal — fully unlocked","All 7 asset models","AI Market Comps","Investment memorandum PDF","Sensitivity matrix · IRR · DSCR · RLV"],
    featured:false,cta:"Start free →"
  },
  {
    name:"Pro",price:"$149",period:"/mo",desc:"For active developers, lenders and advisors.",
    features:["Unlimited appraisals","All 7 asset models + Advanced modes","Full workspace & portfolio","AI Market Comps (rent PSF, NIY, comparables)","Investment memorandum PDF","AI Sense Check","Year-by-year NOI hold model","Live investor share links"],
    featured:true,cta:"Start 14-day trial →"
  },
  {
    name:"Enterprise",price:"$399",period:"/mo",desc:"For firms and investment teams.",
    features:["Everything in Pro","5 team members included","$75/user after 5 members","Shared firm workspace","White label PDF exports","Dedicated onboarding & SLA"],
    featured:false,cta:"Book a demo →"
  },
];
const FEATURES = [
  {icon:"▦",label:"True Monthly Cashflow",desc:"See exactly where your deal makes — or loses — money. Full month-by-month cashflow with S-curve drawdown and interest rolled on actual drawn balances.",tag:"Core"},
  {icon:"▣",label:"Residual Land Value",desc:"Know exactly what you can pay — instantly. Real-time RLV that updates as you type, using exact cashflow interest.",tag:"Valuation"},
  {icon:"▤",label:"Sensitivity Matrices",desc:"Instantly see how fragile your returns are. 45-scenario yield vs rent matrices with RAG colour coding, recalculated live.",tag:"Risk"},
  {icon:"▥",label:"Live Benchmark Curves",desc:"Finance costs priced like the market — not guessed. Live SONIA, SOFR, EURIBOR and 6 more.",tag:"Finance"},
  {icon:"◈",label:"3-Tier Promote Waterfall",desc:"Align investor and developer returns with precision. Configurable IRR hurdles, visual split per tier, scenario-aware.",tag:"JV"},
  {icon:"◉",label:"DSCR / ICR & Equity Multiple",desc:"Underwrite like a lender — not just an investor. DSCR, ICR, equity multiple, payback period and break-even yield — exactly what a lender stress tests.",tag:"Institutional"},
  {icon:"◎",label:"AI Sense Check",desc:"Benchmarks your assumptions against market data. Flags DSCR breaches, aggressive yields and LTC limits automatically.",tag:"AI"},
  {icon:"◫",label:"Deal Pipeline",desc:"Kanban boards from Prospect to Completion. Tasks, notes and activity feed on every deal — everything linked.",tag:"PM"},
];
const FAQS = [
  {q:"Which real estate models are included?",a:"All 7 models — BTR, BTS, Hotel, House Flip, Mixed Use, Commercial and Industrial. Free includes 1 full appraisal with all models unlocked. Pro and Enterprise include unlimited appraisals."},
  {q:"Can I share appraisals with investors or lenders?",a:"Yes. Pro and Enterprise plans include live share links. Anyone with the link sees your latest numbers in real time — no email attachments, no stale versions."},
  {q:"Do I need a credit card to start?",a:"No. The Free plan requires no payment details. Create an account and model your first deal in under 5 minutes."},
  {q:"Is Valora suitable for smaller developers?",a:"Yes. The Free plan is designed for individual developers, investors and deal sourcers. Three full appraisals with all models and all core analysis tools."},
  {q:"How accurate is the cashflow engine?",a:"Valora uses a true monthly cashflow model with S-curve drawdown and interest rolled on actual drawn balances — the same method institutional lenders use internally."},
];
const MODELS = [
  {key:"BTR",label:"Build to Rent",color:"#2E9E72",bg:"rgba(46,158,114,.10)"},
  {key:"BTS",label:"Build to Sell",color:"#2D7AB5",bg:"rgba(45,122,181,.10)"},
  {key:"Hotel",label:"Hotel",color:"#A8843A",bg:"rgba(168,132,58,.12)"},
  {key:"Flip",label:"House Flip",color:"#2E9E72",bg:"rgba(46,158,114,.10)"},
  {key:"Mixed Use",label:"Mixed Use",color:"#3D4351",bg:"rgba(61,67,81,.08)"},
  {key:"Commercial",label:"Commercial",color:"#C24844",bg:"rgba(194,72,68,.08)"},
  {key:"Industrial",label:"Industrial",color:"#3D4351",bg:"rgba(61,67,81,.08)"},
];
function useScrolled(t=40){
  const [s,setS]=useState(false);
  useEffect(()=>{const fn=()=>setS(window.scrollY>t);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn);},[t]);
  return s;
}
function useReveal(){
  useEffect(()=>{
    const obs=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");obs.unobserve(e.target);}});},{threshold:0.08,rootMargin:"0px 0px -40px 0px"});
    document.querySelectorAll(".reveal").forEach(el=>obs.observe(el));
    return()=>obs.disconnect();
  },[]);
}
function Counter({target,suffix="",prefix="",dec=0,dur=2000}:any){
  const [n,setN]=useState(0);
  const [started,setStarted]=useState(false);
  const ref=useRef<any>(null);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!started){setStarted(true);const t0=performance.now();const tick=(now:number)=>{const p=Math.min((now-t0)/dur,1),eased=1-Math.pow(1-p,4);setN(+(eased*target).toFixed(dec));if(p<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);}},{threshold:0.4});
    if(ref.current)obs.observe(ref.current);
    return()=>obs.disconnect();
  },[target,dur,dec,started]);
  return <span ref={ref}>{prefix}{n.toLocaleString()}{suffix}</span>;
}
function Nav({onLogin,isHome,onPage}:any){
  const scrolled=useScrolled();
  const [menuOpen,setMenuOpen]=useState(false);
  return(
    <>
      <nav className={`nav${scrolled?" on":""}`}>
        <span className="nav-logo" onClick={()=>onPage("landing")}>Valora</span>
        <div className="nav-links">
          {isHome&&[["Features","#features"],["Pricing","#pricing"],["FAQ","#faq"]].map(([l,h])=><a key={l} href={h}>{l}</a>)}
        </div>
        <div className="nav-btns">
          <button className="btn-ghost" onClick={onLogin} style={{height:34,padding:"0 16px",fontSize:12}}>Sign in</button>
          <button className="btn-sage" onClick={onLogin} style={{height:34,padding:"0 18px",fontSize:12}}>Start free</button>
        </div>
        <button className="hamburger" onClick={()=>setMenuOpen(true)}>
          <span/><span/><span/>
        </button>
      </nav>
      {menuOpen&&(
        <div className={`mobile-menu${menuOpen?" open":""}`}>
          <button onClick={()=>setMenuOpen(false)} style={{position:"absolute",top:20,right:20,background:"none",border:"none",fontSize:24,cursor:"pointer",color:"var(--text-m)"}}>×</button>
          {isHome&&[["Features","#features"],["Pricing","#pricing"],["FAQ","#faq"]].map(([l,h])=><a key={l} href={h} onClick={()=>setMenuOpen(false)}>{l}</a>)}
          <div style={{marginTop:32,display:"flex",flexDirection:"column",gap:10}}>
            <button className="btn-ghost" onClick={()=>{setMenuOpen(false);onLogin();}} style={{width:"100%",justifyContent:"center"}}>Sign in</button>
            <button className="btn-sage" onClick={()=>{setMenuOpen(false);onLogin();}} style={{width:"100%",justifyContent:"center"}}>Start free →</button>
          </div>
        </div>
      )}
    </>
  );
}
function Footer({onPage}:any){
  return(
    <footer style={{background:"var(--navy)",color:"rgba(246,244,239,.72)",padding:"64px 0 32px",marginTop:80}}>
      <div className="container">
        <div className="footer-grid" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:48,marginBottom:48}}>
          <div>
            <div style={{fontSize:22,fontWeight:700,color:"#F6F4EF",letterSpacing:"-.015em",marginBottom:12}}>Valora</div>
            <div style={{fontSize:13,lineHeight:1.7,maxWidth:280,marginBottom:20,fontWeight:500}}>Professional property development appraisal. Built for developers, advisors and investment teams.</div>
            <div style={{fontSize:11,color:"rgba(246,244,239,.38)",fontWeight:500}}>© {new Date().getFullYear()} Valora. All rights reserved.</div>
          </div>
          {[
            {h:"Product",links:[["Features","#features"],["Pricing","#pricing"],["Asset Models","#features"]]},
            {h:"Legal",links:[["Privacy Policy","privacy"],["Terms of Use","terms"],["Support","support"]]},
            {h:"Asset Models",links:[["Build to Rent","landing"],["Build to Sell","landing"],["Hotel","landing"],["House Flip","landing"],["Mixed Use","landing"],["Commercial","landing"]]},
          ].map(({h,links})=>(
            <div key={h}>
              <div style={{fontSize:11,fontWeight:600,color:"rgba(246,244,239,.42)",textTransform:"uppercase",letterSpacing:".12em",marginBottom:16}}>{h}</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {links.map(([l,href])=>(
                  <a key={l} onClick={()=>href.startsWith("#")?document.querySelector(href)?.scrollIntoView({behavior:"smooth"}):onPage(href)} style={{fontSize:13,color:"rgba(246,244,239,.66)",cursor:"pointer",transition:"color .2s",fontWeight:500}} onMouseEnter={e=>(e.currentTarget.style.color="#F6F4EF")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(246,244,239,.66)")}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="footer-bottom" style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:24,borderTop:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{fontSize:11,color:"rgba(246,244,239,.34)",fontWeight:500}}>Built for property professionals. Not financial advice.</div>
          <div style={{display:"flex",gap:16}}>
            {[["Privacy","privacy"],["Terms","terms"]].map(([l,p])=>(
              <a key={l} onClick={()=>onPage(p)} style={{fontSize:11,color:"rgba(246,244,239,.44)",cursor:"pointer",fontWeight:500}}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
// ── MAIN LANDING PAGE ────────────────────────────────────────────────────────
function LandingPage({onLogin,onPage}:any){
  const [openFaq,setOpenFaq]=useState<number|null>(null);
  useReveal();
  return(
    <div style={{minHeight:"100vh"}}>
      {/* ── HERO ── */}
      <section style={{padding:"140px 0 100px",background:"var(--bg)"}}>
        <div className="container">
          <div className="hero-cols" style={{display:"grid",gridTemplateColumns:"54% 46%",gap:80,alignItems:"center"}}>
            <div>
              <div className="chip" style={{marginBottom:24,animation:"fadeUp .5s ease both"}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"var(--sage)",display:"inline-block"}}/>
                AI-powered · Free to start, no card
              </div>
              <h1 style={{fontSize:"clamp(38px,4.5vw,60px)",fontWeight:700,lineHeight:1.08,letterSpacing:"-.03em",color:"var(--navy)",marginBottom:20,animation:"fadeUp .6s .05s ease both",opacity:0}}>
                Know if a deal works<br/>
                in 5 minutes.<br/>
                <span style={{color:"var(--sage)"}}>Not 5 hours.</span>
              </h1>
              <p style={{fontSize:"clamp(15px,1.5vw,18px)",color:"var(--text-m)",lineHeight:1.7,maxWidth:540,marginBottom:32,animation:"fadeUp .6s .12s ease both",opacity:0,fontWeight:500}}>
                Not a spreadsheet. An <strong style={{color:"var(--navy)",fontWeight:600}}>AI appraisal engine</strong> with seven asset models, live benchmarks and investor-ready outputs — clarity in minutes, not days.
              </p>
              <div className="hero-btns" style={{display:"flex",gap:12,flexWrap:"wrap",animation:"fadeUp .6s .18s ease both",opacity:0}}>
                <button className="btn-sage" onClick={onLogin} style={{height:46,padding:"0 28px",fontSize:14}}>
                  Start free — no card needed
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button className="btn-ghost" onClick={()=>window.open("https://calendly.com/hello-valoraplatform/30min","_blank")} style={{height:46,padding:"0 24px",fontSize:14}}>
                  Book a demo
                </button>
              </div>
              {/* Micro-proof line */}
              <div style={{display:"inline-flex",alignItems:"center",gap:8,marginTop:22,padding:"7px 14px",background:"var(--sage-bg)",border:"1px solid var(--sage-border)",borderRadius:999,animation:"fadeUp .6s .24s ease both",opacity:0}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{fontSize:12,color:"var(--sage)",fontWeight:600,letterSpacing:"-.015em"}}>Used to evaluate £1M–£500M+ opportunities</span>
              </div>
            </div>
            {/* ── HERO MOCKUP ── */}
            <div className="hero-right" style={{animation:"fadeUp .7s .15s ease both",opacity:0}}>
              <div className="screenshot-frame">
                <div className="screen-bar">
                  <div className="screen-dot" style={{background:"#FF5F57"}}/>
                  <div className="screen-dot" style={{background:"#FFBD2E"}}/>
                  <div className="screen-dot" style={{background:"#28C840"}}/>
                  <div style={{flex:1,textAlign:"center",fontSize:10,color:"rgba(246,244,239,.28)",fontFamily:"var(--mono)",fontWeight:500}}>Valora — Jay Mews SW7</div>
                </div>
                <div className="screen-content">
                  <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                    {["Flip","BTR","BTS","Hotel"].map((m,i)=>(
                      <div key={m} className="model-pill" style={{color:i===0?"#52C498":"#949CA0",background:i===0?"rgba(82,196,152,.15)":"transparent",borderColor:i===0?"rgba(82,196,152,.35)":"rgba(255,255,255,.07)"}}>{m}</div>
                    ))}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                    <div className="mock-card"><div className="mock-label">Profit on Cost</div><div className="mock-value" style={{fontSize:18}}>18.4%</div><div className="mock-badge">On target</div></div>
                    <div className="mock-card"><div className="mock-label">IRR Levered</div><div className="mock-value" style={{fontSize:18}}>24.1%</div><div className="mock-badge">Strong</div></div>
                    <div className="mock-card"><div className="mock-label">GDV</div><div className="mock-value" style={{fontSize:18,color:"#C9A84C"}}>£6.6m</div><div className="mock-badge">Live</div></div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                    <div className="mock-card"><div className="mock-label">Total Cost</div><div className="mock-value" style={{fontSize:16}}>£5.3m</div></div>
                    <div className="mock-card"><div className="mock-label">Equity Multiple</div><div className="mock-value" style={{fontSize:16}}>2.31×</div><div className="mock-badge">MOIC</div></div>
                  </div>
                  <div className="mock-card" style={{padding:"12px 14px"}}>
                    <div className="mock-label" style={{marginBottom:8}}>Monthly Cashflow</div>
                    <div style={{display:"flex",alignItems:"flex-end",gap:3,height:32}}>
                      {[15,25,35,28,45,38,52,44,60,55,70,48,82,75,90,68,95,85,72,55,40,25,18,12].map((h,i)=>(
                        <div key={i} style={{flex:1,height:`${h}%`,background:i<20?"rgba(82,196,152,.35)":"rgba(82,196,152,.7)",borderRadius:"2px 2px 0 0",minWidth:0}}/>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── TICKER ── */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...Array(2)].map((_,r)=>(
            <div key={r} style={{display:"inline-flex",gap:64,alignItems:"center"}}>
              {["Build to Rent","Build to Sell","Hotel","House Flip","Mixed Use","Commercial","Industrial","Monthly Cashflow","Sensitivity Analysis","DSCR / ICR","Promote Waterfall","Residual Land Value","AI Sense Check","Live Share Links"].map(t=>(
                <div key={t} className="ticker-item"><div className="ticker-dot"/>{t}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* ── STATS ── */}
      <section style={{padding:"80px 0"}}>
        <div className="container">
          <div className="stats-grid reveal" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
            {[
              {n:7,suffix:"",label:"Asset models",sub:"BTR to Industrial"},
              {n:3,suffix:"",label:"AI tools built-in",sub:"Sense · Comps · Copilot"},
              {n:45,suffix:"",label:"Sensitivity scenarios",sub:"Per matrix, live"},
              {n:14,suffix:"-day",label:"Free trial",sub:"No card required"},
            ].map(({n,suffix,label,sub})=>(
              <div key={label} className="stat-card">
                <div style={{fontSize:40,fontWeight:700,letterSpacing:"-.03em",color:"var(--navy)",fontFamily:"var(--mono)",fontVariantNumeric:"tabular-nums",lineHeight:1}}>
                  <Counter target={n} suffix={suffix}/>
                </div>
                <div style={{fontSize:14,fontWeight:700,color:"var(--text)",marginTop:10,letterSpacing:"-.015em"}}>{label}</div>
                <div style={{fontSize:12,color:"var(--text-d)",marginTop:3,fontWeight:500}}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── WHY VALORA ── */}
      <section style={{padding:"88px 0"}}>
        <div className="container">
          <div className="reveal" style={{maxWidth:720,margin:"0 auto",textAlign:"center"}}>
            <div className="chip" style={{marginBottom:20}}>Why Valora</div>
            <h2 style={{fontSize:"clamp(28px,3.2vw,44px)",fontWeight:700,letterSpacing:"-.03em",color:"var(--navy)",lineHeight:1.12,marginBottom:24}}>
              Most deals don't fail<br/>because of the asset.<br/>
              <span style={{color:"var(--sage)"}}>They fail because of the assumptions.</span>
            </h2>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",marginBottom:28}}>
              {["Wrong build cost","Overestimated revenue","Unrealistic timelines"].map(t=>(
                <div key={t} style={{padding:"8px 16px",borderRadius:8,background:"var(--bg2)",border:"1px solid var(--border)",fontSize:13,color:"var(--text-m)",fontWeight:500,letterSpacing:"-.015em"}}>
                  {t}
                </div>
              ))}
            </div>
            <p style={{fontSize:16,color:"var(--text-m)",lineHeight:1.65,fontWeight:500,maxWidth:560,margin:"0 auto"}}>
              Valora surfaces this in real time. <strong style={{color:"var(--navy)",fontWeight:700}}>Know before you commit capital.</strong>
            </p>
          </div>
        </div>
      </section>
      {/* ── AI SECTION ── */}
      <section style={{padding:"96px 0",background:"var(--navy)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 60% 40% at 20% 30%,rgba(82,196,152,.08) 0%,transparent 60%),radial-gradient(ellipse 50% 40% at 85% 70%,rgba(82,196,152,.05) 0%,transparent 55%)"}}/>
        <div className="container" style={{position:"relative",zIndex:1}}>
          <div className="reveal" style={{textAlign:"center",maxWidth:640,margin:"0 auto 52px"}}>
            <div className="chip" style={{marginBottom:16,background:"rgba(82,196,152,.15)",borderColor:"rgba(82,196,152,.35)"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"var(--sage-l)",display:"inline-block"}}/>
              AI Intelligence
            </div>
            <h2 style={{fontSize:"clamp(30px,3.2vw,44px)",fontWeight:700,letterSpacing:"-.03em",color:"#F6F4EF",lineHeight:1.1,marginBottom:14}}>
              AI that thinks like<br/><span style={{color:"var(--sage-l)"}}>an underwriter.</span>
            </h2>
            <div style={{fontSize:15,color:"var(--sage-l)",fontWeight:700,letterSpacing:"-.015em",marginBottom:18}}>
              Not just automation — decision intelligence.
            </div>
            <p style={{fontSize:16,color:"rgba(246,244,239,.65)",lineHeight:1.65,fontWeight:500,maxWidth:560,margin:"0 auto"}}>
              Three AI features that replace hours of spreadsheet work — benchmarking, comp analysis and scenario reasoning happen automatically as you model.
            </p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18,maxWidth:1040,margin:"0 auto"}} className="features-grid reveal reveal-delay-1">
            {[
              {icon:"◎",title:"AI Sense Check",desc:"Benchmarks your assumptions against market data in real time. Flags aggressive yields, stretched LTC, DSCR breaches and unrealistic build costs — exactly what a senior lender will challenge.",tag:"Auto-flag risks"},
              {icon:"⊛",title:"AI Market Comps",desc:"Pulls rent PSF, NIY, sale comparables and local transaction data for your postcode. Ranks the most relevant comps and explains why — no more manual CoStar digging.",tag:"Comparable evidence"},
              {icon:"✦",title:"AI Copilot",desc:"Your underwriting partner, embedded in every deal. Ask questions in plain English, challenge assumptions, explore scenarios. From \"why doesn't this deal work?\" to \"what fixes it?\" — Valora answers in real time.",tag:"Coming soon"},
            ].map(f=>(
              <div key={f.title} style={{background:"rgba(255,255,255,.035)",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,padding:"26px 24px",transition:"all .25s cubic-bezier(.16,1,.3,1)",position:"relative"}}
                onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="rgba(82,196,152,.35)";(e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,.08)";(e.currentTarget as HTMLDivElement).style.transform="none";}}>
                <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:44,height:44,borderRadius:10,background:"rgba(82,196,152,.15)",border:"1px solid rgba(82,196,152,.3)",color:"var(--sage-l)",fontSize:20,marginBottom:16}}>{f.icon}</div>
                <div style={{display:"inline-block",fontSize:10,fontWeight:700,color:"var(--sage-l)",background:"rgba(82,196,152,.12)",border:"1px solid rgba(82,196,152,.25)",borderRadius:4,padding:"2px 8px",marginBottom:10,letterSpacing:".08em",textTransform:"uppercase"}}>{f.tag}</div>
                <div style={{fontSize:16,fontWeight:700,color:"#F6F4EF",marginBottom:8,letterSpacing:"-.015em",lineHeight:1.25}}>{f.title}</div>
                <div style={{fontSize:13,color:"rgba(246,244,239,.62)",lineHeight:1.65,fontWeight:500}}>{f.desc}</div>
              </div>
            ))}
          </div>
          <div className="reveal reveal-delay-2" style={{textAlign:"center",marginTop:44}}>
            <div style={{fontSize:12,color:"rgba(246,244,239,.42)",fontWeight:500,letterSpacing:".04em"}}>Your data is never used to train AI models.</div>
          </div>
        </div>
      </section>
      {/* ── FEATURES ── */}
      <section id="features" style={{padding:"80px 0",background:"var(--bg3)"}}>
        <div className="container">
          <div className="reveal" style={{maxWidth:580,marginBottom:56}}>
            <div className="chip" style={{marginBottom:16}}>What's inside</div>
            <h2 style={{fontSize:"clamp(28px,3vw,42px)",fontWeight:700,letterSpacing:"-.03em",color:"var(--navy)",lineHeight:1.12,marginBottom:16}}>
              The full institutional stack.<br/><span style={{color:"var(--sage)"}}>Built into one platform.</span>
            </h2>
            <p style={{fontSize:16,color:"var(--text-m)",lineHeight:1.7,fontWeight:500}}>
              Not a simple calculator. A full institutional-grade appraisal engine — the kind that used to cost tens of thousands in consulting fees or proprietary software licences.
            </p>
          </div>
          <div className="features-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
            {FEATURES.map((f,i)=>(
              <div key={f.label} className={`feature-card reveal reveal-delay-${Math.min(i%4+1,4)}`}>
                <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:38,height:38,borderRadius:8,background:"var(--sage-bg)",border:"1px solid var(--sage-border)",color:"var(--sage)",fontSize:17,marginBottom:16}}>{f.icon}</div>
                <div style={{display:"inline-block",fontSize:10,fontWeight:600,color:"var(--sage)",background:"var(--sage-bg)",border:"1px solid var(--sage-border)",borderRadius:4,padding:"2px 8px",marginBottom:10,letterSpacing:".04em",textTransform:"uppercase"}}>{f.tag}</div>
                <div style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:8,lineHeight:1.3,letterSpacing:"-.015em"}}>{f.label}</div>
                <div style={{fontSize:13,color:"var(--text-m)",lineHeight:1.6,fontWeight:500}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── TRADITIONAL VS VALORA ── */}
      <section style={{padding:"80px 0"}}>
        <div className="container">
          <div className="reveal" style={{maxWidth:520,margin:"0 auto 48px",textAlign:"center"}}>
            <div className="chip" style={{marginBottom:16}}>The difference</div>
            <h2 style={{fontSize:"clamp(28px,3vw,40px)",fontWeight:700,letterSpacing:"-.03em",color:"var(--navy)",lineHeight:1.12}}>
              Stop guessing.<br/><span style={{color:"var(--sage)"}}>Start underwriting like an institution.</span>
            </h2>
          </div>
          <div className="three-col reveal" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,maxWidth:840,margin:"0 auto"}}>
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"28px 26px"}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".12em",marginBottom:20}}>Traditional tools</div>
              {["Manual modelling","Static outputs","Assumption guessing","Hours of work"].map((t,i,arr)=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i===arr.length-1?"none":"1px solid var(--border)",fontSize:14,color:"var(--text-d)",fontWeight:500,letterSpacing:"-.015em"}}>
                  <span style={{color:"var(--text-d)",fontSize:14,fontWeight:600,flexShrink:0}}>×</span>{t}
                </div>
              ))}
            </div>
            <div style={{background:"var(--bg2)",border:"2px solid var(--sage-border)",borderRadius:12,padding:"28px 26px",position:"relative"}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--sage)",textTransform:"uppercase",letterSpacing:".12em",marginBottom:20}}>Valora</div>
              {["Instant analysis","Dynamic scenarios","AI-backed benchmarking","Minutes to clarity"].map((t,i,arr)=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i===arr.length-1?"none":"1px solid var(--border)",fontSize:14,color:"var(--navy)",fontWeight:600,letterSpacing:"-.015em"}}>
                  <span style={{color:"var(--sage)",fontSize:14,fontWeight:700,flexShrink:0}}>✓</span>{t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ── MODELS ── */}
      <section style={{padding:"80px 0"}}>
        <div className="container">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center"}} className="three-col">
            <div className="reveal">
              <div className="chip" style={{marginBottom:16}}>Asset coverage</div>
              <h2 style={{fontSize:"clamp(26px,2.8vw,40px)",fontWeight:700,letterSpacing:"-.03em",color:"var(--navy)",lineHeight:1.12,marginBottom:16}}>
                Every asset class.<br/>One platform.
              </h2>
              <p style={{fontSize:15,color:"var(--text-m)",lineHeight:1.7,marginBottom:32,fontWeight:500}}>
                Switch between models instantly. Your team works on BTR, you're modelling a Hotel, a colleague runs a Flip — all in the same workspace, all with the same accuracy.
              </p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {MODELS.map(m=>(
                  <div key={m.key} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,background:m.bg,color:m.color,fontSize:12,fontWeight:600,border:`1px solid ${m.color}40`,letterSpacing:"-.015em"}}>
                    {m.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal reveal-delay-2">
              <div className="screenshot-frame">
                <div className="screen-bar">
                  <div className="screen-dot" style={{background:"#FF5F57"}}/><div className="screen-dot" style={{background:"#FFBD2E"}}/><div className="screen-dot" style={{background:"#28C840"}}/>
                  <div style={{flex:1,textAlign:"center",fontSize:10,color:"rgba(246,244,239,.28)",fontFamily:"var(--mono)",fontWeight:500}}>Deal Pipeline</div>
                </div>
                <div style={{padding:16,background:"#0F1115",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[
                    {stage:"Prospect",color:"#949CA0",deals:[{n:"Hammersmith BTR",t:"BTR"},{n:"Peckham Rye",t:"BTS"}]},
                    {stage:"Under Offer",color:"#5CA5DC",deals:[{n:"Notting Hill",t:"Flip"}]},
                    {stage:"In Dev",color:"#52C498",deals:[{n:"Dubai Marina",t:"BTS"}]},
                  ].map(col=>(
                    <div key={col.stage} style={{background:"#1A1E26",borderRadius:10,padding:12,border:"1px solid rgba(255,255,255,.06)"}}>
                      <div style={{fontSize:9,color:col.color,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:10,fontFamily:"var(--font)"}}>{col.stage} · {col.deals.length}</div>
                      {col.deals.map(d=>(
                        <div key={d.n} style={{background:"#242933",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"9px 11px",marginBottom:6}}>
                          <div style={{fontSize:11,fontWeight:700,color:"#F6F4EF",marginBottom:5,letterSpacing:"-.015em"}}>{d.n}</div>
                          <div style={{display:"inline-block",fontSize:9,padding:"2px 7px",borderRadius:4,background:"rgba(82,196,152,.15)",color:"#52C498",fontFamily:"var(--mono)",fontWeight:600}}>{d.t}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── TESTIMONIALS (real quotes from Max + Rodrigo, lightly anonymised) ── */}
      <section style={{padding:"80px 0",background:"var(--bg3)"}}>
        <div className="container">
          <div className="reveal" style={{textAlign:"center",maxWidth:580,margin:"0 auto 48px"}}>
            <div className="chip" style={{marginBottom:16}}>In their words</div>
            <h2 style={{fontSize:"clamp(28px,3vw,40px)",fontWeight:700,letterSpacing:"-.03em",color:"var(--navy)",lineHeight:1.12}}>
              Used on real deals — <span style={{color:"var(--sage)"}}>not demo data.</span>
            </h2>
          </div>
          <div className="three-col reveal" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,maxWidth:920,margin:"0 auto"}}>
            {/* Quote 1 — Max, on speed (validates hero 5-minute claim) */}
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"28px 28px 24px",display:"flex",flexDirection:"column"}}>
              <div style={{fontSize:42,lineHeight:.8,color:"var(--sage)",opacity:.38,marginBottom:6,fontFamily:"var(--font)",fontWeight:700}}>&ldquo;</div>
              <blockquote style={{fontSize:16,color:"var(--text)",lineHeight:1.6,fontWeight:500,marginBottom:20,flex:1,letterSpacing:"-.01em"}}>
                I can cut through the noise in the market and find the real deals in <strong style={{color:"var(--navy)",fontWeight:700}}>literally 5 minutes</strong>. I&apos;ll press to buy the licence for the whole year.
              </blockquote>
              <div style={{display:"flex",alignItems:"center",gap:12,paddingTop:20,borderTop:"1px solid var(--border)"}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:"var(--sage-bg)",border:"1px solid var(--sage-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"var(--sage)",fontWeight:700,letterSpacing:".02em"}}>MB</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--navy)",letterSpacing:"-.015em"}}>Max B.</div>
                  <div style={{fontSize:11,color:"var(--text-d)",fontWeight:500}}>Principal · UK property investor</div>
                </div>
              </div>
            </div>
            {/* Quote 2 — Rodrigo, on institutional rigour */}
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"28px 28px 24px",display:"flex",flexDirection:"column"}}>
              <div style={{fontSize:42,lineHeight:.8,color:"var(--sage)",opacity:.38,marginBottom:6,fontFamily:"var(--font)",fontWeight:700}}>&ldquo;</div>
              <blockquote style={{fontSize:16,color:"var(--text)",lineHeight:1.6,fontWeight:500,marginBottom:20,flex:1,letterSpacing:"-.01em"}}>
                Really strong tool. We&apos;ll keep using Valora for <strong style={{color:"var(--navy)",fontWeight:700}}>validation and scenario testing</strong> in our underwriting projects.
              </blockquote>
              <div style={{display:"flex",alignItems:"center",gap:12,paddingTop:20,borderTop:"1px solid var(--border)"}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(45,122,181,.10)",border:"1px solid rgba(45,122,181,.28)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"var(--blue)",fontWeight:700,letterSpacing:".02em"}}>RM</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--navy)",letterSpacing:"-.015em"}}>Rodrigo M.</div>
                  <div style={{fontSize:11,color:"var(--text-d)",fontWeight:500}}>Investment Principal · LatAM hotel investor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── PRICING ── */}
      <section id="pricing" style={{padding:"80px 0",background:"var(--bg3)"}}>
        <div className="container">
          <div className="reveal" style={{textAlign:"center",maxWidth:540,margin:"0 auto 56px"}}>
            <div className="chip" style={{marginBottom:16}}>Pricing</div>
            <h2 style={{fontSize:"clamp(28px,3vw,42px)",fontWeight:700,letterSpacing:"-.03em",color:"var(--navy)",lineHeight:1.12,marginBottom:16}}>
              Start free. Scale when you're ready.
            </h2>
            <p style={{fontSize:15,color:"var(--text-m)",lineHeight:1.6,fontWeight:500}}>No credit card. No setup fees. Three full appraisals free, all models included.</p>
          </div>
          <div className="pricing-grid reveal" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,maxWidth:960,margin:"0 auto"}}>
            {PLANS.map((plan,i)=>(
              <div key={plan.name} className={`price-card${plan.featured?" featured":""}`}>
                {plan.featured&&<div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",background:"var(--sage)",color:"#fff",fontSize:10,fontWeight:700,padding:"4px 16px",borderRadius:"0 0 8px 8px",letterSpacing:".06em",textTransform:"uppercase"}}>Most Popular</div>}
                <div style={{fontSize:12,fontWeight:700,color:plan.featured?"rgba(246,244,239,.55)":"var(--text-d)",marginBottom:14,letterSpacing:".12em",textTransform:"uppercase"}}>{plan.name}</div>
                <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:10}}>
                  <span style={{fontSize:42,fontWeight:700,letterSpacing:"-.03em",color:plan.featured?"#F6F4EF":"var(--navy)",fontFamily:"var(--mono)",fontVariantNumeric:"tabular-nums",lineHeight:1}}>{plan.price}</span>
                  <span style={{fontSize:14,color:plan.featured?"rgba(246,244,239,.55)":"var(--text-d)",fontWeight:500}}>{plan.period}</span>
                </div>
                <div className="price-desc" style={{fontSize:13,color:"var(--text-m)",marginBottom:24,lineHeight:1.55,fontWeight:500}}>{plan.desc}</div>
                <button onClick={onLogin}
                  style={{width:"100%",height:44,borderRadius:8,fontSize:13,fontWeight:600,letterSpacing:"-.015em",cursor:"pointer",marginBottom:24,background:plan.featured?"var(--sage)":"transparent",color:plan.featured?"#fff":"var(--navy)",border:plan.featured?"none":"2px solid var(--navy)",fontFamily:"var(--font)",transition:"all .2s"}}
                  onMouseEnter={e=>{if(!plan.featured){(e.currentTarget as HTMLButtonElement).style.background="var(--navy)";(e.currentTarget as HTMLButtonElement).style.color="#F6F4EF";}}}
                  onMouseLeave={e=>{if(!plan.featured){(e.currentTarget as HTMLButtonElement).style.background="transparent";(e.currentTarget as HTMLButtonElement).style.color="var(--navy)";}}}>
                  {plan.cta}
                </button>
                <div style={{display:"flex",flexDirection:"column",gap:0}}>
                  {plan.features.map(f=>(<div key={f} className="price-feature">{f}</div>))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── FAQ ── */}
      <section id="faq" style={{padding:"80px 0"}}>
        <div className="container" style={{maxWidth:720,margin:"0 auto"}}>
          <div className="reveal" style={{textAlign:"center",marginBottom:48}}>
            <div className="chip" style={{marginBottom:16}}>FAQ</div>
            <h2 style={{fontSize:"clamp(26px,2.8vw,40px)",fontWeight:700,letterSpacing:"-.03em",color:"var(--navy)",lineHeight:1.12}}>
              Common questions
            </h2>
          </div>
          <div className="reveal">
            {FAQS.map((faq,i)=>(
              <div key={i} className={`faq-item${openFaq===i?" open":""}`}>
                <div className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                  <span>{faq.q}</span>
                  <div className="faq-icon">{openFaq===i?"−":"+"}</div>
                </div>
                {openFaq===i&&<div className="faq-a">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── FINAL CTA ── */}
      <section style={{padding:"80px 0",background:"var(--navy)"}}>
        <div className="container" style={{textAlign:"center"}}>
          <div className="reveal">
            <div style={{fontSize:"clamp(30px,3.5vw,52px)",fontWeight:700,letterSpacing:"-.03em",color:"#F6F4EF",lineHeight:1.12,marginBottom:18}}>
              Model your next deal<br/><span style={{color:"var(--sage-l)"}}>in under 5 minutes.</span>
            </div>
            <p style={{fontSize:16,color:"rgba(246,244,239,.65)",marginBottom:36,maxWidth:500,margin:"0 auto 36px",fontWeight:500,lineHeight:1.55}}>
              No credit card. No setup. Three full appraisals free — all models, all analysis tools included.
            </p>
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="btn-sage" onClick={onLogin} style={{height:48,padding:"0 32px",fontSize:15}}>Start free →</button>
              <button onClick={()=>window.open("https://calendly.com/hello-valoraplatform/30min","_blank")} style={{background:"transparent",color:"rgba(246,244,239,.75)",border:"1px solid rgba(255,255,255,.2)",borderRadius:8,height:48,padding:"0 28px",fontSize:15,cursor:"pointer",fontFamily:"var(--font)",fontWeight:600,letterSpacing:"-.015em",transition:"all .2s"}} onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(255,255,255,.5)";(e.currentTarget as HTMLButtonElement).style.color="#F6F4EF";}} onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(255,255,255,.2)";(e.currentTarget as HTMLButtonElement).style.color="rgba(246,244,239,.75)";}}>
                Book a demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
// ── SUPPORT PAGE ─────────────────────────────────────────────────────────────
function SupportPage({onLogin,onPage}:any){
  const [openFaq,setOpenFaq]=useState<any>(null);
  const faqs=[
    {q:"How do I create my first appraisal?",a:"Click 'New Appraisal' from your dashboard, choose your asset type, select currency and benchmark rate, and follow the tabs. Most users complete their first appraisal in under 15 minutes."},
    {q:"Which currencies and benchmark rates are supported?",a:"GBP (SONIA), USD (SOFR), EUR (EURIBOR), AED (EIBOR), SGD (SORA), AUD (AONIA), JPY (TONA), CHF (SARON), CAD (CORRA), HKD (HONIA)."},
    {q:"Can I share appraisals with investors?",a:"Yes. From any appraisal click Share to generate a live link. Investors see the latest version without needing to log in."},
    {q:"How does DSCR checking work?",a:"DSCR and ICR are calculated automatically from your stabilised NOI against annual debt service on the peak loan balance. A flag appears if DSCR drops below 1.25×."},
    {q:"How does AI Sense Check work?",a:"It benchmarks your assumptions against market data and flags what a senior lender would challenge — build costs, exit yields, LTC ratios, DSCR levels, rents. Runs automatically as you type."},
    {q:"Can I cancel my subscription?",a:"Yes. Cancel from account settings. Subscription remains active until end of current billing period."},
    {q:"Is my data secure?",a:"All data is encrypted in transit and at rest. Your appraisal data is never shared or used to train AI models."},
  ];
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <Nav onLogin={onLogin} onPage={onPage} isHome={false}/>
      <div style={{padding:"120px 0 64px",background:"var(--bg3)",borderBottom:"1px solid var(--border)"}}>
        <div className="container" style={{textAlign:"center"}}>
          <div className="chip" style={{marginBottom:16,display:"inline-flex"}}>Support Centre</div>
          <h1 style={{fontSize:"clamp(32px,4vw,52px)",fontWeight:700,letterSpacing:"-.03em",color:"var(--navy)",marginBottom:16,lineHeight:1.1}}>How can we help?</h1>
          <p style={{fontSize:15,color:"var(--text-m)",maxWidth:460,margin:"0 auto 36px",lineHeight:1.7,fontWeight:500}}>Our team responds within 2 business hours on Pro, and 24 hours on Free.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="mailto:support@valoraplatform.io"><button className="btn-sage" style={{height:44,padding:"0 28px"}}>Email Support</button></a>
            <button className="btn-ghost" onClick={onLogin} style={{height:44,padding:"0 24px"}}>Open Platform</button>
          </div>
        </div>
      </div>
      <div className="container" style={{padding:"64px 48px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:64}} className="three-col">
          {[
            {icon:"✉",title:"Email Support",desc:"For account, billing, and technical queries.",action:"support@valoraplatform.io",link:"mailto:support@valoraplatform.io"},
            {icon:"⚡",title:"Priority Support",desc:"Pro and Enterprise plans include 2-hour response SLA.",action:"Upgrade to Pro →",link:"#pricing"},
            {icon:"◈",title:"Onboarding",desc:"Enterprise plans include dedicated 1-on-1 onboarding.",action:"Contact Sales →",link:"mailto:sales@valoraplatform.io"},
          ].map((c,i)=>(
            <div key={i} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:28,cursor:"pointer",transition:"all .2s"}} onClick={()=>window.open(c.link,"_self")} onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="var(--sage-border)";(e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)";}} onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="var(--border)";(e.currentTarget as HTMLDivElement).style.transform="none";}}>
              <div style={{fontSize:22,marginBottom:14,color:"var(--sage)"}}>{c.icon}</div>
              <div style={{fontSize:16,fontWeight:700,marginBottom:8,color:"var(--navy)",letterSpacing:"-.015em"}}>{c.title}</div>
              <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.65,marginBottom:16,fontWeight:500}}>{c.desc}</p>
              <div style={{fontSize:12,color:"var(--sage)",fontWeight:600}}>{c.action}</div>
            </div>
          ))}
        </div>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <h2 style={{fontSize:30,fontWeight:700,letterSpacing:"-.03em",marginBottom:32,textAlign:"center",color:"var(--navy)",lineHeight:1.12}}>Frequently Asked Questions</h2>
          {faqs.map((faq,i)=>(
            <div key={i} className={`faq-item${openFaq===i?" open":""}`}>
              <div className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                <span>{faq.q}</span>
                <div className="faq-icon">{openFaq===i?"−":"+"}</div>
              </div>
              {openFaq===i&&<div className="faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
      <Footer onPage={onPage}/>
    </div>
  );
}
// ── LEGAL PAGES ───────────────────────────────────────────────────────────────
function LegalPage({title,lastUpdated,children,onLogin,onPage}:any){
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <Nav onLogin={onLogin} onPage={onPage} isHome={false}/>
      <div style={{maxWidth:720,margin:"0 auto",padding:"120px 40px 80px"}}>
        <button onClick={()=>onPage("landing")} className="btn-ghost" style={{marginBottom:32,height:32,padding:"0 14px",fontSize:12}}>← Back</button>
        <h1 style={{fontSize:"clamp(28px,3.5vw,44px)",fontWeight:700,letterSpacing:"-.03em",color:"var(--navy)",marginBottom:8,lineHeight:1.12}}>{title}</h1>
        <div style={{fontSize:11,color:"var(--text-d)",marginBottom:40,paddingBottom:20,borderBottom:"1px solid var(--border)",letterSpacing:".04em",fontWeight:500}}>Last updated: {lastUpdated} · Valora Technologies Ltd · Registered in England & Wales</div>
        <div style={{fontSize:14,color:"var(--text-m)",lineHeight:1.8,fontWeight:500}}>{children}</div>
      </div>
      <Footer onPage={onPage}/>
    </div>
  );
}
function PrivacyContent(){return(<><p style={{marginBottom:16}}>Valora Technologies Ltd is committed to protecting your personal data. We collect account data (name, email, firm), appraisal data you create, anonymised usage data, and payment confirmation from Stripe. We do not store card details or use your appraisals to train AI models.</p><h2 style={{fontSize:20,fontWeight:700,color:"var(--navy)",margin:"32px 0 12px",letterSpacing:"-.015em"}}>Your Rights</h2><p>Under UK GDPR you have rights to access, correct, delete, and port your data. Contact <a href="mailto:privacy@valoraplatform.io" style={{color:"var(--sage)",fontWeight:600}}>privacy@valoraplatform.io</a>.</p></>);}
function TermsContent(){return(<><p style={{marginBottom:16}}>These Terms govern your use of the Valora platform. Subscriptions are billed monthly or annually. 14-day free trial on all plans. Cancel anytime. Prices exclude applicable taxes.</p><p>The platform and AI features provide information only — not financial advice. Governed by the laws of England and Wales.</p><p style={{marginTop:16}}>Contact: <a href="mailto:legal@valoraplatform.io" style={{color:"var(--sage)",fontWeight:600}}>legal@valoraplatform.io</a></p></>);}
function CookiesContent(){return(<><p>We use essential cookies to keep you logged in and protect against CSRF. Analytics cookies are anonymised. Stripe sets cookies for payment security. Contact <a href="mailto:privacy@valoraplatform.io" style={{color:"var(--sage)",fontWeight:600}}>privacy@valoraplatform.io</a> with questions.</p></>);}
// ── LOGIN ─────────────────────────────────────────────────────────────────────
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
  useEffect(()=>{const params=new URLSearchParams(window.location.search);const inviteEmail=params.get("email");const inviteFirm=params.get("firm");if(inviteEmail)setEmail(decodeURIComponent(inviteEmail));if(inviteFirm)setTab("signup");},[]);
  const validate=()=>{const e:any={};if(!email||!email.includes("@"))e.email="Valid email required";if(tab!=="reset"&&password.length<8)e.password="8+ characters required";if(tab==="signup"&&!firm.trim())e.firm="Firm name required";setErrors(e);return Object.keys(e).length===0;};
  const submit=async(ev:any)=>{
    ev.preventDefault();if(!validate())return;setLoading(true);
    if(tab==="signin"){const{error}=await supabase.auth.signInWithPassword({email,password});if(error){setErrors({email:error.message});setLoading(false);return;}window.location.href="/dashboard";}
    else if(tab==="signup"){const{error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name,firm_name:firm}}});if(error){setErrors({email:error.message});setLoading(false);return;}setLoading(false);setSuccess(true);}
    else if(tab==="reset"){const{error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/auth/callback`});if(error){setErrors({email:error.message});setLoading(false);return;}setLoading(false);setSuccess(true);}
  };
  return(
    <div style={{minHeight:"100vh",display:"grid",gridTemplateColumns:"1fr 1fr"}} className="login-wrap">
      <div className="login-left" style={{background:"var(--navy)",display:"flex",flexDirection:"column",padding:"48px 64px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 30% 50%, rgba(82,196,152,.08) 0%, transparent 60%)",pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontSize:22,fontWeight:700,color:"#F6F4EF",letterSpacing:"-.015em",marginBottom:48,cursor:"pointer"}} onClick={onBack}>Valora</div>
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontSize:11,fontWeight:600,color:"rgba(82,196,152,.85)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:20}}>Development Appraisal</div>
            <h2 style={{fontSize:"clamp(28px,2.8vw,42px)",fontWeight:700,letterSpacing:"-.03em",color:"#F6F4EF",lineHeight:1.1,marginBottom:20}}>
              Model with the<br/><span style={{color:"var(--sage-l)"}}>precision of a<br/>trading floor.</span>
            </h2>
            <p style={{fontSize:14,color:"rgba(246,244,239,.62)",lineHeight:1.8,maxWidth:380,marginBottom:36,fontWeight:500}}>True monthly cash flows. DSCR checking. AI sense check. Team workspace. Branded investor brochures.</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[{icon:"▦",text:"True Monthly CF Engine",sub:"S-curve rolled interest on drawn balances"},{icon:"▣",text:"DSCR / ICR & Equity Multiple",sub:"Institutional metrics, auto-flagged"},{icon:"▤",text:"AI Sense Check",sub:"Flags lender challenges automatically"},{icon:"▥",text:"Team Workspace",sub:"Collaborate on live appraisals"}].map((item,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"center",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,padding:"11px 14px"}}>
                  <div style={{width:32,height:32,borderRadius:8,background:"rgba(82,196,152,.15)",border:"1px solid rgba(82,196,152,.28)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"var(--sage-l)",flexShrink:0}}>{item.icon}</div>
                  <div><div style={{fontSize:12,fontWeight:700,color:"#F6F4EF",marginBottom:2,letterSpacing:"-.015em"}}>{item.text}</div><div style={{fontSize:11,color:"rgba(246,244,239,.48)",fontWeight:500}}>{item.sub}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="login-right" style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40,background:"var(--bg)"}}>
        <div style={{width:"100%",maxWidth:420}}>
          <button onClick={onBack} className="btn-ghost" style={{marginBottom:28,height:32,padding:"0 14px",fontSize:12}}>← Back to site</button>
          {success?(
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:"44px 40px",textAlign:"center"}}>
              <div style={{width:52,height:52,borderRadius:"50%",margin:"0 auto 20px",background:"var(--sage-bg)",border:"1px solid var(--sage-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"var(--sage)",fontWeight:700}}>✓</div>
              <h2 style={{fontSize:26,fontWeight:700,letterSpacing:"-.025em",marginBottom:10,color:"var(--navy)"}}>{tab==="reset"?"Check your inbox":"Almost there"}</h2>
              <p style={{fontSize:13,color:"var(--text-m)",lineHeight:1.7,fontWeight:500}}>{tab==="reset"?"Reset link sent to "+email+".":"Confirmation link sent to "+email+". Click it to verify your account."}</p>
              <button className="btn-ghost" style={{marginTop:24,width:"100%",justifyContent:"center",height:40}} onClick={()=>{setSuccess(false);setTab("signin");}}>Back to sign in</button>
            </div>
          ):(
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:"44px 40px"}}>
              {tab!=="reset"&&(
                <div style={{display:"flex",background:"var(--bg3)",borderRadius:8,padding:3,marginBottom:28}}>
                  {[["signin","Sign In"],["signup","Create Account"]].map(([t,l])=>(
                    <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"9px 16px",borderRadius:6,fontSize:12,fontWeight:600,letterSpacing:"-.015em",background:tab===t?"var(--bg2)":"transparent",color:tab===t?"var(--navy)":"var(--text-d)",border:tab===t?"1px solid var(--border)":"none",cursor:"pointer",fontFamily:"var(--font)",transition:"all .2s"}}>{l}</button>
                  ))}
                </div>
              )}
              <div style={{marginBottom:24}}>
                {tab==="reset"&&<button onClick={()=>setTab("signin")} style={{background:"none",border:"none",color:"var(--text-d)",fontSize:11,cursor:"pointer",marginBottom:14,padding:0,fontFamily:"var(--font)",fontWeight:500}}>← Back to sign in</button>}
                <h1 style={{fontSize:26,fontWeight:700,letterSpacing:"-.025em",marginBottom:6,color:"var(--navy)"}}>{tab==="signin"?"Welcome back":tab==="signup"?"Get started":"Reset password"}</h1>
                <p style={{fontSize:13,color:"var(--text-m)",fontWeight:500}}>{tab==="signin"?"Sign in to your Valora workspace":tab==="signup"?"Create your account — 14 day free trial included.":"We'll send a reset link to your email."}</p>
              </div>
              <form onSubmit={submit}>
                {tab==="signup"&&(<>
                  <div style={{marginBottom:14}}><label style={{fontSize:11,color:"var(--text-d)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".04em",fontWeight:600}}>Full Name</label><input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="James Harrington"/></div>
                  <div style={{marginBottom:14}}><label style={{fontSize:11,color:"var(--text-d)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".04em",fontWeight:600}}>Firm / Company</label><input className="inp" value={firm} onChange={e=>setFirm(e.target.value)} placeholder="Harrington Capital"/>{errors.firm&&<div style={{fontSize:11,color:"var(--red)",marginTop:5,fontWeight:500}}>{errors.firm}</div>}</div>
                </>)}
                <div style={{marginBottom:14}}><label style={{fontSize:11,color:"var(--text-d)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".04em",fontWeight:600}}>Email</label><input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="james@harringtoncap.com"/>{errors.email&&<div style={{fontSize:11,color:"var(--red)",marginTop:5,fontWeight:500}}>{errors.email}</div>}</div>
                {tab!=="reset"&&(<div style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <label style={{fontSize:11,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".04em",fontWeight:600}}>Password</label>
                    {tab==="signin"&&<button type="button" onClick={()=>setTab("reset")} style={{background:"none",border:"none",color:"var(--sage)",fontSize:11,cursor:"pointer",fontFamily:"var(--font)",padding:0,fontWeight:600}}>Forgot?</button>}
                  </div>
                  <div style={{position:"relative"}}>
                    <input className="inp" type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder={tab==="signup"?"Create a strong password":"Your password"} style={{paddingRight:48}} autoComplete={tab==="signup"?"new-password":"current-password"}/>
                    <button type="button" onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:11,fontFamily:"var(--font)",fontWeight:500}}>{showPw?"Hide":"Show"}</button>
                  </div>
                  {errors.password&&<div style={{fontSize:11,color:"var(--red)",marginTop:5,fontWeight:500}}>{errors.password}</div>}
                </div>)}
                <button type="submit" className="btn-sage" style={{width:"100%",justifyContent:"center",height:46,marginTop:8}} disabled={loading}>
                  {loading?<span style={{width:18,height:18,border:"2px solid rgba(255,255,255,.25)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>:tab==="signin"?"Sign In →":tab==="reset"?"Send Reset Link →":"Create Account →"}
                </button>
              </form>
              <p style={{marginTop:20,paddingTop:16,borderTop:"1px solid var(--border)",textAlign:"center",fontSize:11,color:"var(--text-d)",lineHeight:1.65,fontWeight:500}}>By continuing you agree to our <span style={{color:"var(--sage)",cursor:"pointer",fontWeight:600}}>Terms</span> & <span style={{color:"var(--sage)",cursor:"pointer",fontWeight:600}}>Privacy Policy</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState("landing");
  const [loading,setLoading]=useState(true);
  const router=useRouter();
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session){router.push("/dashboard");return;}
      setLoading(false);
    });
    const params=new URLSearchParams(window.location.search);
    if(params.get("invited")==="true"){setPage("login");setLoading(false);}
  },[router]);
  const toLogin=useCallback(()=>{setPage("login");window.scrollTo(0,0);},[]);
  const toPage=useCallback((p:string)=>{setPage(p);window.scrollTo(0,0);},[]);
  if(loading)return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{CSS}</style>
      <div style={{width:28,height:28,border:"2px solid var(--border-m)",borderTopColor:"var(--sage)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
    </div>
  );
  return(
    <>
      <style>{CSS}</style>
      {page==="landing"&&<><Nav onLogin={toLogin} onPage={toPage} isHome={true}/><LandingPage onLogin={toLogin} onPage={toPage}/><Footer onPage={toPage}/></>}
      {page==="login"&&<Login onBack={()=>toPage("landing")}/>}
      {page==="support"&&<SupportPage onLogin={toLogin} onPage={toPage}/>}
      {page==="privacy"&&<LegalPage title="Privacy Policy" lastUpdated="1 March 2026" onLogin={toLogin} onPage={toPage}><PrivacyContent/></LegalPage>}
      {page==="terms"&&<LegalPage title="Terms of Service" lastUpdated="1 March 2026" onLogin={toLogin} onPage={toPage}><TermsContent/></LegalPage>}
      {page==="cookies"&&<LegalPage title="Cookie Policy" lastUpdated="1 March 2026" onLogin={toLogin} onPage={toPage}><CookiesContent/></LegalPage>}
    </>
  );
}
