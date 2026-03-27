"use client";import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════
   VALORA — Complete Marketing Site + Login
   Aesthetic: Dark institutional editorial
   Inspired by: Bloomberg Terminal × Stripe × Linear
   Beats: Aprao on depth, AI, branding, UX
═══════════════════════════════════════════════ */

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

/* ─ Animations ─ */
@keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes slide-right{from{transform:translateX(-100%)}to{transform:translateX(0)}}
@keyframes float{0%,100%{transform:translateY(0) rotate(-0.5deg)}50%{transform:translateY(-14px) rotate(0.5deg)}}
@keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes pulse-ring{0%{box-shadow:0 0 0 0 rgba(201,168,76,0.3)}70%{box-shadow:0 0 0 12px rgba(201,168,76,0)}100%{box-shadow:0 0 0 0 rgba(201,168,76,0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes counter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}

.fu{opacity:0;animation:fu .65s cubic-bezier(.16,1,.3,1) forwards}
.fi{opacity:0;animation:fi .5s ease forwards}
.float{animation:float 9s ease-in-out infinite}
.float2{animation:float2 6s ease-in-out infinite}

/* ─ Nav ─ */
.nav{position:fixed;top:0;left:0;right:0;z-index:200;height:60px;display:flex;align-items:center;padding:0 40px;transition:background .3s,border-color .3s;border-bottom:1px solid transparent}
.nav.on{background:rgba(6,7,10,.9);backdrop-filter:blur(24px) saturate(180%);border-color:var(--border)}

/* ─ Buttons ─ */
.btn-primary{display:inline-flex;align-items:center;gap:8px;background:var(--gold);color:#06070a;padding:12px 26px;border-radius:7px;font-family:var(--font-body);font-size:13px;font-weight:600;letter-spacing:.05em;border:none;cursor:pointer;transition:background .2s,transform .15s}
.btn-primary:hover{background:var(--gold-l);transform:translateY(-1px)}
.btn-primary:active{transform:translateY(0)}
.btn-ghost{display:inline-flex;align-items:center;gap:8px;background:transparent;color:var(--text);padding:11px 24px;border-radius:7px;font-family:var(--font-body);font-size:13px;font-weight:500;border:1px solid var(--border-m);cursor:pointer;transition:all .2s}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-text{background:none;border:none;color:var(--text-m);font-family:var(--font-body);font-size:13px;cursor:pointer;transition:color .2s;padding:4px 0}
.btn-text:hover{color:var(--gold)}

/* ─ Cards ─ */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:24px}
.card-feature{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:28px;transition:border-color .25s,transform .25s;position:relative;overflow:hidden}
.card-feature::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at top left,rgba(201,168,76,.05) 0%,transparent 60%);opacity:0;transition:opacity .3s}
.card-feature:hover{border-color:rgba(201,168,76,.35);transform:translateY(-3px)}
.card-feature:hover::after{opacity:1}

/* ─ Input ─ */
.inp{width:100%;padding:13px 16px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--font-body);font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s}
.inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.1)}
.inp::placeholder{color:var(--text-d)}
.inp-wrap{position:relative}
.inp-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-d);font-size:15px;pointer-events:none}
.inp-with-icon{padding-left:42px}

/* ─ Badge ─ */
.badge{display:inline-flex;align-items:center;gap:6px;background:var(--gold-bg);border:1px solid var(--gold-border);color:var(--gold);padding:4px 12px;border-radius:20px;font-size:11px;font-weight:500;letter-spacing:.05em}
.badge-green{background:rgba(61,220,132,.08);border-color:rgba(61,220,132,.2);color:var(--green)}
.badge-blue{background:rgba(91,156,246,.08);border-color:rgba(91,156,246,.2);color:var(--blue)}
.badge-red{background:rgba(244,100,95,.08);border-color:rgba(244,100,95,.2);color:var(--red)}

/* ─ Divider ─ */
.gold-line{height:1px;background:linear-gradient(90deg,var(--gold),transparent);transform-origin:left}

/* ─ Section ─ */
.section{padding:100px 0}
.container{max-width:1140px;margin:0 auto;padding:0 40px}

/* ─ Testimonial ─ */
.testi{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:32px;display:flex;flex-direction:column;gap:20px}
.stars{display:flex;gap:3px;color:var(--gold);font-size:13px}

/* ─ Pricing ─ */
.price-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:36px;position:relative;overflow:hidden;transition:border-color .25s}
.price-card.featured{border-color:rgba(201,168,76,.4);background:var(--bg3)}
.price-card.featured::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--gold) 40%,var(--gold-l),transparent)}

/* ─ Feature icon ─ */
.ficon{width:44px;height:44px;border-radius:11px;background:var(--gold-bg);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--gold);margin-bottom:18px;flex-shrink:0}

/* ─ Login ─ */
.login-wrap{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}
.login-left{background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:40px 60px;position:relative;overflow:hidden}
.login-right{display:flex;align-items:center;justify-content:center;padding:40px;background:var(--bg)}
.login-card{background:var(--bg2);border:1px solid var(--border-m);border-radius:18px;padding:44px 40px;width:100%;max-width:440px;position:relative;overflow:hidden}
.login-card::before{content:'';position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.tab-switch{display:flex;background:var(--bg3);border-radius:9px;padding:3px;gap:0}
.tab-btn{flex:1;padding:9px 16px;border-radius:7px;font-size:12px;font-weight:500;background:transparent;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);transition:all .2s}
.tab-btn.active{background:var(--bg4);color:var(--text);border:1px solid var(--border)}

/* ─ Ticker ─ */
.ticker-wrap{overflow:hidden;white-space:nowrap;background:var(--bg1);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:14px 0}
.ticker-inner{display:inline-flex;gap:60px;animation:ticker 40s linear infinite}
.ticker-item{display:inline-flex;align-items:center;gap:10px;font-size:12px;color:var(--text-m);letter-spacing:.04em}

/* ─ Gradient text ─ */
.grad-text{background:linear-gradient(135deg,var(--gold-l) 0%,var(--gold) 50%,#a07030 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.shimmer-text{background:linear-gradient(135deg,var(--gold-l),var(--gold),var(--gold-l));background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite}

/* ─ Radial glow ─ */
.glow{position:absolute;border-radius:50%;pointer-events:none}

/* ─ Number ticker animation ─ */
@keyframes numUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
`;

/* ─────────────────────────────────────
   DATA
───────────────────────────────────── */
const FEATURES = [
  { icon:"⟳", label:"Monthly Cash Flow Engine", desc:"Full month-by-month P&L from acquisition to exit. S-curve, straight-line and front-loaded cost profiles. Interest capitalised using live benchmark forward curves — not a rough estimate.", tag:"Core" },
  { icon:"◈", label:"Residual Land Value", desc:"Real-time RLV calculation that updates as you type. Set your target return as % of GDV or % of costs. More accurate than Aprao's estimate — uses actual cashflow interest, not the half-facility shortcut.", tag:"Valuation" },
  { icon:"▦", label:"3×3 Sensitivity Matrices", desc:"Three full 45-scenario matrices: Exit Price, Levered Profit, Profit on Cost. Yield vs rent with colour-coded RAG and base case highlighted. Automatic, no setup needed.", tag:"Risk" },
  { icon:"◎", label:"Live Benchmark Curves", desc:"SONIA, SOFR, EURIBOR, EIBOR, SORA, AONIA, TONA, SARON, CORRA, HONIA. Finance costs calculated month-by-month against the actual forward curve — not a flat rate assumption.", tag:"Finance" },
  { icon:"◉", label:"3-Tier Promote Waterfall", desc:"Configurable IRR hurdles with developer and investor allocations calculated across all tiers. Visual split bar per hurdle. Fully scenario-aware — changes when you adjust any input.", tag:"JV" },
  { icon:"⬡", label:"AI Market Comparables", desc:"Claude AI benchmarks your specific assumptions against current market data. Verdict rating, specific risks, suggested amendments with financial impact. Optionally included in investor brochures.", tag:"AI" },
  { icon:"⬛", label:"Branded Investor Brochures", desc:"Full-bleed documents with your firm's colours and logo. Live share links so investors always see the latest version — no email attachments, no stale PDFs.", tag:"Reporting" },
  { icon:"≡", label:"Scenario Manager", desc:"Base, Bear, Bull cases with fully independent inputs. Side-by-side comparison table showing GDV, cost, profit, PoC and IRR across all three scenarios simultaneously.", tag:"Planning" },
  { icon:"◷", label:"Audit Trail", desc:"Every input change timestamped with user name, field, old and new value. Essential for investment committee governance, lender due diligence, and team accountability.", tag:"Compliance" },
  { icon:"⊞", label:"Auto SDLT Calculator", desc:"Full UK SDLT banding (5%/10%/15%/17% company rates) calculated automatically from purchase price. Other jurisdictions apply appropriate transfer tax rates. Updates instantly.", tag:"Tax" },
  { icon:"◫", label:"Project Pipeline Boards", desc:"Kanban-style deal pipeline with customisable stages (Prospect → Feasibility → Under Offer → In Development). Shared team boards and private personal boards.", tag:"PM" },
  { icon:"⊙", label:"Template Library", desc:"Save any appraisal as a reusable template. Pre-built templates for BTR, BTS, hotel, and residential flips. Share templates across your entire team.", tag:"Workflow" },
];

const TESTIMONIALS = [
  { q:"We replaced three Excel models with Valora. The monthly CF engine and sensitivity matrices are exactly what we needed for our BTR fund.", name:"James Harrington", role:"MD, Harrington Capital", stars:5, tag:"BTR" },
  { q:"The AI market review flagged that our exit yield was aggressive before we took the appraisal to the investment committee. That alone saved us embarrassment.", name:"Priya Sharma", role:"Head of Development Finance, Apex Developments", stars:5, tag:"BTR" },
  { q:"The branded brochure is extraordinary. We share a live link and investors see the model update in real time. No more email attachments with stale numbers.", name:"Marcus Al-Rashid", role:"Partner, Gulf Bridge Investments", stars:5, tag:"Hotel" },
  { q:"The SONIA forward curve integration is a detail that shows real industry understanding. Our lender reviewed the CF and approved it without a single question.", name:"Sophie Chen", role:"Development Director, Meridian Homes", stars:5, tag:"BTS" },
  { q:"Finally an appraisal tool that understands hotel repositioning. The ADR, RevPAR and cap rate logic is native, not a spreadsheet hack.", name:"Tom Reeves", role:"Principal, Atlas Real Estate", stars:5, tag:"Hotel" },
  { q:"The promote waterfall is something no other appraisal tool offers. Our JV partners were impressed we could show the distribution split in real time.", name:"Charlotte Davies", role:"Investment Manager, NorthStar Capital", stars:5, tag:"JV" },
];

const STATS = [
  { value:60, suffix:"bn+", prefix:"£", label:"GDV Modelled" },
  { value:30000, suffix:"+", prefix:"", label:"Deals Analysed" },
  { value:18, suffix:"", prefix:"", label:"Currencies Supported" },
  { value:99.9, suffix:"%", prefix:"", label:"Platform Uptime", dec:1 },
];

/* ─────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────── */
function Counter({ target, suffix = "", prefix = "", dec = 0, dur = 2200 }: { target: number, suffix?: string, prefix?: string, dec?: number, dur?: number }) {
  const [n, setN] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true);
        const t0 = performance.now();
       const tick = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(+(eased * target).toFixed(dec));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, dur, dec, started]);
  return <span ref={ref}>{prefix}{n.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────
   USE SCROLL
───────────────────────────────────── */
function useScrolled(threshold = 30) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

/* ─────────────────────────────────────
   FLOATING UI MOCK — appraisal card
───────────────────────────────────── */
const AppraisalMock = () => (
  <div className="float" style={{ background:"var(--bg3)", border:"1px solid rgba(255,255,255,.1)", borderRadius:14, padding:"20px 22px", width:290, boxShadow:"0 40px 80px rgba(0,0,0,.7)", position:"absolute" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
      <div>
        <div style={{ fontSize:10, color:"var(--text-d)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:3 }}>Chiswick Tower · BTR</div>
        <div className="badge" style={{ fontSize:9 }}>✓ Analysis Complete</div>
      </div>
    </div>
    {[["GDV (Exit)","£208.5m","var(--text)"],["Profit on Cost","43.7%","var(--green)"],["IRR (Unlevered)","39.7%","var(--blue)"],["Yield on Cost","5.67%","var(--gold)"]].map(([l,v,c])=>(
      <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid var(--bg5)", fontSize:12 }}>
        <span style={{ color:"var(--text-m)" }}>{l}</span>
        <span style={{ color:c, fontFamily:"var(--font-mono)", fontWeight:500 }}>{v}</span>
      </div>
    ))}
    <div style={{ marginTop:14, height:6, background:"var(--bg5)", borderRadius:3, overflow:"hidden" }}>
      <div style={{ height:"100%", width:"74%", background:"linear-gradient(90deg,var(--gold),var(--gold-l))", borderRadius:3 }} />
    </div>
    <div style={{ fontSize:9, color:"var(--text-d)", marginTop:5, textAlign:"right" }}>74% toward 20% PoC target</div>
  </div>
);

const SensitivityMock = () => (
  <div className="float2" style={{ background:"var(--bg3)", border:"1px solid rgba(255,255,255,.1)", borderRadius:14, padding:"18px 20px", width:230, boxShadow:"0 30px 60px rgba(0,0,0,.6)", position:"absolute", animationDelay:"2.5s" }}>
    <div style={{ fontSize:9, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:10 }}>Sensitivity · PoC %</div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:3 }}>
      {[["12.1%","r"],["15.4%","a"],["18.7%","a"],["16.8%","a"],["21.5%","g"],["24.2%","g"],["22.1%","g"],["27.3%","g"],["31.8%","g"]].map(([v,t],i)=>(
        <div key={i} style={{ fontSize:10, textAlign:"center", padding:"5px 2px", borderRadius:4, fontFamily:"var(--font-mono)",
          background:t==="r"?"rgba(244,100,95,.12)":t==="a"?"rgba(240,164,41,.1)":"rgba(61,220,132,.09)",
          color:t==="r"?"var(--red)":t==="a"?"var(--amber)":"var(--green)",
          border:i===4?"1px solid var(--gold)":"1px solid transparent",
          fontWeight:i===4?600:400,
        }}>{v}</div>
      ))}
    </div>
  </div>
);

const AIReviewMock = () => (
  <div style={{ background:"var(--bg3)", border:"1px solid rgba(91,156,246,.25)", borderRadius:12, padding:"14px 16px", width:240, boxShadow:"0 20px 40px rgba(0,0,0,.5)", position:"absolute" }}>
    <div style={{ fontSize:9, color:"var(--blue)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:8, fontWeight:500 }}>⬡ AI Market Review</div>
    <div style={{ fontSize:11, color:"var(--green)", fontWeight:600, marginBottom:6 }}>Strong · Above target</div>
    <div style={{ fontSize:10, color:"var(--text-m)", lineHeight:1.6, marginBottom:8 }}>Exit yield 4.15% is competitive vs London BTR market range of 3.75–4.50%.</div>
    <div style={{ fontSize:10, color:"var(--text-d)", borderTop:"1px solid var(--border)", paddingTop:8 }}>▸ Consider reducing void from 2% to 1.5% — adds ~£1.2m to NOI</div>
  </div>
);

/* ─────────────────────────────────────
   PIPELINE BOARD MOCK
───────────────────────────────────── */
const PIPELINE_COLS = [
  {
    stage:"Prospect", color:"var(--text-d)", count:2,
    items:[
      { name:"Hammersmith BTR", type:"BTR", poc:"—", currency:"£", gdv:"" },
      { name:"Peckham Rye Flats", type:"BTS", poc:"—", currency:"£", gdv:"" },
    ],
  },
  {
    stage:"Feasibility", color:"var(--amber)", count:2,
    items:[
      { name:"Chiswick Tower", type:"BTR", poc:"43.7%", currency:"£", gdv:"208.5m" },
      { name:"Shoreditch Hotel", type:"Hotel", poc:"22.1%", currency:"£", gdv:"42.0m" },
    ],
  },
  {
    stage:"Under Offer", color:"var(--blue)", count:1,
    items:[
      { name:"Notting Hill Flip", type:"Flip", poc:"31.2%", currency:"£", gdv:"1.25m" },
    ],
  },
  {
    stage:"In Development", color:"var(--green)", count:1,
    items:[
      { name:"Dubai Marina", type:"BTS", poc:"22.5%", currency:"د.إ", gdv:"380m" },
    ],
  },
];

const TYPE_COLORS = { BTR:"var(--gold)", BTS:"var(--blue)", Hotel:"var(--amber)", Flip:"var(--green)" };

const PipelineMock = () => (
  <div style={{
    display:"grid",
    gridTemplateColumns:"repeat(4,1fr)",
    gap:10,
    width:"100%",
  }}>
    {PIPELINE_COLS.map((col) => (
      <div key={col.stage} style={{
        background:"var(--bg3)",
        border:"1px solid var(--border)",
        borderRadius:10,
        padding:"12px 10px",
        display:"flex",
        flexDirection:"column",
        gap:8,
        minWidth:0,
      }}>
        {/* Column header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:col.color, flexShrink:0 }} />
            <span style={{ fontSize:10, color:"var(--text-m)", textTransform:"uppercase", letterSpacing:".09em", fontWeight:600, lineHeight:1.2 }}>{col.stage}</span>
          </div>
          <span style={{ fontSize:10, background:"var(--bg5)", color:"var(--text-d)", borderRadius:10, padding:"1px 7px", fontWeight:500 }}>{col.count}</span>
        </div>

        {/* Cards */}
        {col.items.map((item) => (
          <div key={item.name} style={{
            background:"var(--bg4)",
            border:"1px solid var(--border)",
            borderRadius:8,
            padding:"10px 10px 8px",
          }}>
            {/* Type badge */}
            <div style={{ marginBottom:6 }}>
              <span style={{
                fontSize:9, fontWeight:600, letterSpacing:".06em",
                color: TYPE_COLORS[item.type as keyof typeof TYPE_COLORS] || "var(--text-d)",
                background: (TYPE_COLORS[item.type as keyof typeof TYPE_COLORS] || "var(--text-d)") + "14",
                padding:"2px 7px", borderRadius:10,
              }}>{item.type}</span>
            </div>
            {/* Name */}
            <div style={{ fontSize:11, fontWeight:500, color:"var(--text)", lineHeight:1.35, marginBottom:8 }}>{item.name}</div>
            {/* Metrics row */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:10, color:"var(--text-d)", fontFamily:"var(--font-mono)" }}>
                {item.gdv ? `${item.currency}${item.gdv}` : "—"}
              </span>
              <span style={{
                fontSize:10,
                fontFamily:"var(--font-mono)",
                fontWeight:600,
                color: item.poc === "—" ? "var(--text-d)" : parseFloat(item.poc) >= 20 ? "var(--green)" : "var(--amber)",
              }}>{item.poc}</span>
            </div>
          </div>
        ))}

        {/* Empty slot indicator */}
        <div style={{
          border:"1px dashed var(--bg5)",
          borderRadius:8,
          height:32,
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          fontSize:16,
          color:"var(--text-d)",
          opacity:0.5,
        }}>+</div>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────
   ROOT APP
───────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("landing");
  const toLogin = useCallback(() => { setPage("login"); window.scrollTo(0,0); }, []);
  const toLanding = useCallback(() => { setPage("landing"); window.scrollTo(0,0); }, []);

  return (
    <>
      <style>{CSS}</style>
      {page === "landing" ? <Landing onLogin={toLogin} /> : <Login onBack={toLanding} />}
    </>
  );
}

/* ═══════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════ */
function Landing({ onLogin }) {
  const scrolled = useScrolled();
  const [activeFeature, setActiveFeature] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div>
      {/* ── NAV ── */}
      <nav className={`nav ${scrolled ? "on" : ""}`}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginRight:"auto" }}>
          <span style={{ fontFamily:"var(--font-display)", fontSize:26, fontWeight:300, color:"var(--gold)", letterSpacing:".1em" }}>VALORA</span>
          <span style={{ fontSize:9, color:"var(--text-d)", letterSpacing:".18em", textTransform:"uppercase", marginTop:3 }}>Pro</span>
        </div>
        <div style={{ display:"flex", gap:32, marginRight:36 }}>
          {[["Features","#features"],["Why Valora","#why"],["Pricing","#pricing"],["For Lenders","#lenders"]].map(([l,h])=>(
            <a key={l} href={h} style={{ fontSize:13, color:"var(--text-m)", transition:"color .2s", letterSpacing:".02em" }}
              onMouseEnter={e=>e.target.style.color="var(--gold)"}
              onMouseLeave={e=>e.target.style.color="var(--text-m)"}>{l}</a>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn-ghost" onClick={onLogin} style={{ padding:"8px 18px" }}>Sign In</button>
          <button className="btn-primary" onClick={onLogin} style={{ padding:"9px 20px" }}>Start Free Trial</button>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", position:"relative", overflow:"hidden", paddingTop:80 }}>
        {/* Background elements */}
        <div className="glow" style={{ width:800, height:600, top:"10%", left:"40%", background:"radial-gradient(ellipse,rgba(201,168,76,.06) 0%,transparent 65%)" }} />
        <div className="glow" style={{ width:400, height:400, top:"60%", left:"5%", background:"radial-gradient(ellipse,rgba(91,156,246,.04) 0%,transparent 65%)" }} />
        {/* Grid */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }} />
        {/* Horizontal accent line */}
        <div style={{ position:"absolute", top:"50%", left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,.1) 30%,rgba(201,168,76,.1) 70%,transparent)", pointerEvents:"none" }} />

        <div className="container" style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"grid", gridTemplateColumns:"55% 45%", gap:60, alignItems:"center" }}>
            {/* Left */}
            <div>
              <div className="fu d-1" style={{ marginBottom:22 }}>
                <span className="badge">◆ Institutional Development Appraisal Platform</span>
              </div>
              <h1 className="fu d-2" style={{ fontFamily:"var(--font-display)", fontSize:"clamp(44px,5vw,72px)", fontWeight:300, lineHeight:1.06, marginBottom:28, letterSpacing:"-.01em" }}>
                The appraisal platform<br/>
                <em className="grad-text" style={{ fontStyle:"italic" }}>serious developers</em><br/>
                actually use
              </h1>
              <p className="fu d-3" style={{ fontSize:17, color:"var(--text-m)", lineHeight:1.75, maxWidth:500, marginBottom:36 }}>
                Model BTR, BTS, hotel and residential flip projects with investment-bank rigour. Monthly cash flows, live benchmark curves, AI market comparables, and branded investor brochures — all in one platform.
              </p>
              <div className="fu d-4" style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:44 }}>
                <button className="btn-primary" onClick={onLogin} style={{ fontSize:14, padding:"14px 30px" }}>Start Free Trial — No Card Needed</button>
                <button className="btn-ghost" style={{ fontSize:14, padding:"13px 24px" }}>Watch 3-min Demo ▶</button>
              </div>
              {/* Social proof strip */}
              <div className="fu d-5" style={{ display:"flex", gap:28, paddingTop:28, borderTop:"1px solid var(--border)" }}>
                {[["£60bn+","GDV modelled"],["30,000+","Deals analysed"],["10","Benchmark rates"],["ISO 27001","Certified"]].map(([v,l])=>(
                  <div key={l}>
                    <div style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:500, color:"var(--gold-l)" }}>{v}</div>
                    <div style={{ fontSize:11, color:"var(--text-d)", marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating cards */}
            <div className="fu d-5" style={{ position:"relative", height:520 }}>
              <AppraisalMock style={{ top:30, right:0 }} />
              <SensitivityMock style={{ bottom:50, left:10 }} />
              <AIReviewMock style={{ top:250, left:20 }} />
              {/* SONIA tag */}
              <div style={{ position:"absolute", top:0, right:20, background:"var(--bg3)", border:"1px solid var(--border-m)", borderRadius:8, padding:"7px 13px", fontSize:11, fontFamily:"var(--font-mono)", color:"var(--blue)" }}>
                SONIA 3.97% <span style={{ color:"var(--text-d)" }}>+2.5% → 6.47% all-in</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TICKER ══ */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...Array(2)].map((_,ri)=>(
            ["Monthly Cash Flow","Residual Land Value","Live SONIA Curve","Sensitivity Matrices","3-Tier Waterfall","AI Comparables","Branded Brochures","Audit Trail","Auto SDLT","Scenario Manager","Pipeline Boards","Template Library","Multi-Currency","Team Collaboration","Lender Reports"].map((item,i)=>(
              <span key={`${ri}-${i}`} className="ticker-item">
                <span style={{ color:"var(--gold)", fontSize:10 }}>◆</span>{item}
              </span>
            ))
          ))}
        </div>
      </div>

      {/* ══ STATS ══ */}
      <section style={{ padding:"70px 0", background:"var(--bg1)", borderBottom:"1px solid var(--border)" }}>
        <div className="container">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0 }}>
            {STATS.map((s,i)=>(
              <div key={i} style={{ textAlign:"center", padding:"20px 0", borderLeft:i>0?"1px solid var(--border)":"none" }}>
                <div style={{ fontFamily:"var(--font-display)", fontSize:52, fontWeight:300, color:"var(--gold-l)", lineHeight:1 }}>
                  <Counter target={s.value} prefix={s.prefix} suffix={s.suffix} dec={s.dec||0} />
                </div>
                <div style={{ fontSize:11, color:"var(--text-d)", marginTop:8, letterSpacing:".09em", textTransform:"uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES GRID ══ */}
      <section id="features" className="section">
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:70 }}>
            <div className="badge" style={{ marginBottom:20 }}>Platform Capabilities</div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(32px,4vw,52px)", fontWeight:300, lineHeight:1.1, marginBottom:18 }}>
              Everything Aprao does,<br/>
              <em className="grad-text" style={{ fontStyle:"italic" }}>plus everything it doesn't</em>
            </h2>
            <p style={{ fontSize:16, color:"var(--text-m)", maxWidth:520, margin:"0 auto", lineHeight:1.7 }}>
              Built from real institutional appraisal models. Every calculation validated against live deal flow across BTR, BTS, hotel and residential.
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            {FEATURES.map((f,i)=>(
              <div key={i} className="card-feature">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                  <div className="ficon">{f.icon}</div>
                  <span style={{ fontSize:9, color:"var(--text-d)", background:"var(--bg4)", padding:"3px 9px", borderRadius:20, letterSpacing:".08em", textTransform:"uppercase", marginTop:2 }}>{f.tag}</span>
                </div>
                <h3 style={{ fontFamily:"var(--font-display)", fontSize:17, fontWeight:500, marginBottom:10, color:"var(--text)" }}>{f.label}</h3>
                <p style={{ fontSize:13, color:"var(--text-m)", lineHeight:1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PIPELINE BOARD SHOWCASE ══ */}
      <section style={{ padding:"90px 0", background:"var(--bg1)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }}>
        <div className="container">

          {/* Top: text left, bullets right */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"flex-start", marginBottom:48 }}>
            <div>
              <div className="badge" style={{ marginBottom:20 }}>Project Management</div>
              <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,3vw,44px)", fontWeight:300, lineHeight:1.1, marginBottom:18 }}>
                Your entire deal pipeline,<br/>
                <em style={{ color:"var(--gold)", fontStyle:"italic" }}>one place</em>
              </h2>
              <p style={{ fontSize:15, color:"var(--text-m)", lineHeight:1.8 }}>
                Kanban pipeline boards with customisable deal stages. Move projects from Prospect through to Completion. Private personal boards and shared team boards. Every appraisal linked, always in sync.
              </p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 24px", alignContent:"start", paddingTop:8 }}>
              {[
                ["Customisable stages","Name your deal stages to match your exact workflow."],
                ["Personal & team boards","Private boards plus shared team views — both in one account."],
                ["Archive & restore","Remove clutter without losing any project history."],
                ["Multiple appraisals","Link several appraisal scenarios to a single deal card."],
              ].map(([title, sub], i) => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:28, height:28, borderRadius:7, background:"var(--gold-bg)", border:"1px solid var(--gold-border)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--gold)", fontSize:12, flexShrink:0, marginTop:1 }}>✓</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:"var(--text)", marginBottom:3 }}>{title}</div>
                    <div style={{ fontSize:12, color:"var(--text-d)", lineHeight:1.55 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full-width board mock */}
          <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:16, padding:"20px 20px 24px" }}>
            {/* Mock toolbar */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, paddingBottom:14, borderBottom:"1px solid var(--border)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontFamily:"var(--font-display)", fontSize:15, fontWeight:500, color:"var(--text)" }}>Harrington Capital</div>
                <div style={{ fontSize:10, color:"var(--text-d)", background:"var(--bg4)", padding:"2px 10px", borderRadius:20, letterSpacing:".08em", textTransform:"uppercase" }}>Deal Pipeline</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ fontSize:11, color:"var(--text-d)" }}>6 active deals</div>
                <div style={{ width:1, height:14, background:"var(--border)" }} />
                <div style={{ fontSize:11, color:"var(--gold)", cursor:"pointer" }}>+ New Project</div>
              </div>
            </div>

            {/* Board */}
            <PipelineMock />

            {/* Mock footer */}
            <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid var(--border)", display:"flex", gap:20 }}>
              {[["6","Active"],["2","Completed"],["£253m","Total GDV"],["29.4%","Avg PoC"]].map(([v,l])=>(
                <div key={l} style={{ display:"flex", gap:6, alignItems:"baseline" }}>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:13, fontWeight:500, color:"var(--text)" }}>{v}</span>
                  <span style={{ fontSize:11, color:"var(--text-d)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ══ ASSET TYPES ══ */}
      <section style={{ padding:"90px 0" }}>
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div className="badge" style={{ marginBottom:20 }}>Asset Coverage</div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,3.5vw,48px)", fontWeight:300, lineHeight:1.12 }}>
              Four specialist models.<br/>
              <em className="grad-text" style={{ fontStyle:"italic" }}>Not a generic spreadsheet.</em>
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            {[
              { abbr:"BTR", color:"var(--gold)", label:"Build to Rent", desc:"OMR/DMR unit tables, NIY, exit yields, OpEx budget, stabilisation ramp, promote waterfall, benchmark curves", badge:"Most Popular" },
              { abbr:"BTS", color:"var(--blue)", label:"Build to Sell", desc:"£/sqft sales price, unit absorption schedule, phased drawdowns, agent fees, margin by phase", badge:"" },
              { abbr:"HTL", color:"var(--amber)", label:"Hotel Acquisition", desc:"ADR, occupancy, RevPAR, EBITDA margin, cap rate, CapEx repositioning budget, stabilisation timeline", badge:"" },
              { abbr:"FLP", color:"var(--green)", label:"House Flip", desc:"Purchase price, SDLT, refurb budget, bridging finance, hold period, ROI on equity deployed", badge:"" },
            ].map((t,i)=>(
              <div key={i} style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:14, padding:24, position:"relative", transition:"border-color .25s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=t.color+"66"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                {t.badge&&<div className="badge" style={{ position:"absolute", top:16, right:16, fontSize:9 }}>{t.badge}</div>}
                <div style={{ width:48, height:48, borderRadius:10, background:t.color+"14", border:`1px solid ${t.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:t.color, fontFamily:"var(--font-mono)", marginBottom:16 }}>{t.abbr}</div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:500, color:"var(--text)", marginBottom:10 }}>{t.label}</div>
                <div style={{ fontSize:12, color:"var(--text-m)", lineHeight:1.65 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY VALORA ══ */}
      <section id="why" style={{ padding:"100px 0", background:"var(--bg1)", borderTop:"1px solid var(--border)" }}>
        <div className="container">

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:72 }}>
            <div className="badge" style={{ marginBottom:20 }}>Why Valora</div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(30px,3.5vw,52px)", fontWeight:300, lineHeight:1.1, marginBottom:20 }}>
              Built for the complexity<br/>
              <em className="grad-text" style={{ fontStyle:"italic" }}>real deals demand</em>
            </h2>
            <p style={{ fontSize:16, color:"var(--text-m)", maxWidth:540, margin:"0 auto", lineHeight:1.75 }}>
              Spreadsheets break. Generic tools make assumptions your deals don't. Valora was built by developers who needed a platform that understood the actual mechanics of property finance.
            </p>
          </div>

          {/* Three-column pain → solution cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:64 }}>
            {[
              {
                problem:"Spreadsheet errors cost deals",
                stat:"80%",
                statLabel:"of spreadsheets contain at least one material error",
                solution:"Valora's calculation engine is audited, version-controlled, and produces consistent results across every appraisal — with a full field-level audit trail.",
                icon:"⚠",
                color:"var(--red)",
              },
              {
                problem:"Generic tools don't speak property",
                stat:"0",
                statLabel:"standard finance tools understand NIY, OMR/DMR splits, or promote waterfalls",
                solution:"Every input, every metric, every output is purpose-built for property development — from SDLT bands to stabilisation ramps to JV distributions.",
                icon:"⊠",
                color:"var(--amber)",
              },
              {
                problem:"Investors and lenders need more",
                stat:"1",
                statLabel:"link is all it takes for investors to see your live appraisal",
                solution:"Branded brochures, live investor portals, lender-formatted cashflows and AI market comparables — all generated directly from the same model, no reformatting.",
                icon:"◈",
                color:"var(--gold)",
              },
            ].map((card, i) => (
              <div key={i} style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:16, padding:32, display:"flex", flexDirection:"column", gap:20 }}>
                {/* Icon */}
                <div style={{ width:44, height:44, borderRadius:11, background:card.color+"12", border:`1px solid ${card.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:card.color }}>
                  {card.icon}
                </div>
                {/* Problem */}
                <div>
                  <div style={{ fontSize:10, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:6, fontWeight:500 }}>The Problem</div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:500, color:"var(--text)", lineHeight:1.2 }}>{card.problem}</div>
                </div>
                {/* Stat */}
                <div style={{ background:card.color+"08", border:`1px solid ${card.color}20`, borderRadius:10, padding:"14px 16px" }}>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:36, fontWeight:300, color:card.color, lineHeight:1, marginBottom:6 }}>{card.stat}</div>
                  <div style={{ fontSize:12, color:"var(--text-m)", lineHeight:1.5 }}>{card.statLabel}</div>
                </div>
                {/* Solution */}
                <div>
                  <div style={{ fontSize:10, color:"var(--green)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:8, fontWeight:500 }}>The Valora Solution</div>
                  <p style={{ fontSize:13, color:"var(--text-m)", lineHeight:1.7 }}>{card.solution}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Solution pillars — horizontal strip */}
          <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:16, padding:"36px 40px" }}>
            <div style={{ textAlign:"center", marginBottom:36 }}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:24, fontWeight:300, color:"var(--text)", marginBottom:8 }}>
                One platform. The complete workflow.
              </div>
              <p style={{ fontSize:14, color:"var(--text-m)" }}>From first feasibility to signed investment agreement.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:0 }}>
              {[
                { n:"01", label:"Model", icon:"⟳", desc:"Revenue, costs, cashflow, finance — all live" },
                { n:"02", label:"Analyse", icon:"▦", desc:"Sensitivity, IRR, yield on cost, scenarios" },
                { n:"03", label:"Stress Test", icon:"◉", desc:"Promote waterfall, lender terms, AI review" },
                { n:"04", label:"Present", icon:"⬛", desc:"Branded brochure, live investor portal" },
                { n:"05", label:"Govern", icon:"◷", desc:"Audit trail, team access, version control" },
              ].map((step, i) => (
                <div key={i} style={{ textAlign:"center", padding:"0 20px", borderLeft: i > 0 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:11, color:"var(--text-d)", marginBottom:12, letterSpacing:".1em" }}>{step.n}</div>
                  <div style={{ width:44, height:44, borderRadius:"50%", margin:"0 auto 14px", background:"var(--gold-bg)", border:"1px solid var(--gold-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"var(--gold)" }}>{step.icon}</div>
                  <div style={{ fontSize:14, fontWeight:500, color:"var(--text)", marginBottom:6 }}>{step.label}</div>
                  <div style={{ fontSize:11, color:"var(--text-d)", lineHeight:1.55 }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ══ FOR LENDERS ══ */}
      <section id="lenders" style={{ padding:"90px 0" }}>
        <div className="container">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"center" }}>
            <div>
              <div className="badge badge-blue" style={{ marginBottom:20 }}>For Lenders & Banks</div>
              <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,3vw,44px)", fontWeight:300, lineHeight:1.12, marginBottom:20 }}>
                Reports your underwriting<br/>
                team will <em style={{ color:"var(--gold)", fontStyle:"italic" }}>actually trust</em>
              </h2>
              <p style={{ fontSize:15, color:"var(--text-m)", lineHeight:1.8, marginBottom:28 }}>
                Valora's standardised format is designed for lender review. The monthly cashflow shows exactly how your facility will be drawn down month-by-month, with interest calculated on actual drawn balances — giving you and your lender a precise, defensible cost of finance.
              </p>
              {[
                ["Cashflow-based interest calculation","Interest calculated on drawn balances, not estimated lump-sum"],
                ["Lender-formatted reports","Professional PDF with your developer's branding + standardised data"],
                ["Live share links","Lenders always see the latest version — no stale email attachments"],
                ["Override mode","Match your appraisal exactly to the lender's assumed debt costs"],
              ].map(([title,sub],i)=>(
                <div key={i} style={{ display:"flex", gap:14, marginBottom:18 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:"var(--gold-bg)", border:"1px solid var(--gold-border)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--gold)", fontSize:14, flexShrink:0 }}>✓</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:"var(--text)", marginBottom:3 }}>{title}</div>
                    <div style={{ fontSize:12, color:"var(--text-d)" }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:14, padding:24 }}>
                <div style={{ fontSize:10, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:16 }}>Finance Calculation — Cashflow Method</div>
                {[
                  ["Month","Drawn Balance","Interest","Net CF"],
                  ["Oct 2028","£8.2m","£44,733","(£892k)"],
                  ["Nov 2028","£11.7m","£63,788","(£1.2m)"],
                  ["Dec 2028","£16.4m","£89,400","(£1.7m)"],
                  ["Jan 2029","£22.1m","£120,495","(£2.1m)"],
                  ["Feb 2029","£29.8m","£162,455","(£3.1m)"],
                ].map((row,i)=>(
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", padding:`${i===0?6:8}px 0`, borderBottom:"1px solid var(--bg4)", fontSize:i===0?9:11 }}>
                    {row.map((cell,j)=>(
                      <div key={j} style={{ color:i===0?"var(--text-d)":j===2?"var(--amber)":j===3?"var(--red)":"var(--text-m)", fontFamily:i>0?"var(--font-mono)":"var(--font-body)", fontWeight:i===0?500:400, textTransform:i===0?"uppercase":"none", letterSpacing:i===0?".07em":"0" }}>{cell}</div>
                    ))}
                  </div>
                ))}
                <div style={{ marginTop:14, padding:"10px 0", borderTop:"1px solid var(--gold)44", display:"flex", justifyContent:"space-between", fontSize:12 }}>
                  <span style={{ color:"var(--text-m)" }}>Total interest (cashflow method)</span>
                  <span style={{ color:"var(--gold)", fontFamily:"var(--font-mono)", fontWeight:600 }}>£22,155,314</span>
                </div>
                <div style={{ fontSize:10, color:"var(--green)", marginTop:6 }}>✓ Draws only on what's needed — more accurate than half-facility estimate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WORKFLOW ══ */}
      <section style={{ padding:"80px 0", background:"var(--bg1)", borderTop:"1px solid var(--border)" }}>
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,3vw,44px)", fontWeight:300 }}>
              From site to signed deal —
              <em className="grad-text" style={{ fontStyle:"italic" }}> under an hour</em>
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:0, position:"relative" }}>
            <div style={{ position:"absolute", top:28, left:"10%", right:"10%", height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,.3),rgba(201,168,76,.3),rgba(201,168,76,.3),transparent)" }} />
            {[
              { n:"01", title:"New Appraisal", desc:"Pick asset type, currency, benchmark. 30 seconds." },
              { n:"02", title:"Input Revenue", desc:"Unit mix, rents, yields. Live NOI as you type." },
              { n:"03", title:"Model Costs", desc:"S-curve profiles, phased drawdowns, auto SDLT." },
              { n:"04", title:"Run the Model", desc:"Monthly CF, IRR, sensitivity, waterfall — instant." },
              { n:"05", title:"Share Brochure", desc:"Branded report. Live investor link. Done." },
            ].map((step,i)=>(
              <div key={i} style={{ textAlign:"center", padding:"0 16px", position:"relative" }}>
                <div style={{ width:58, height:58, borderRadius:"50%", margin:"0 auto 20px", background:"var(--bg2)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontSize:18, fontWeight:500, color:"var(--gold)", position:"relative", zIndex:1 }}>{step.n}</div>
                <div style={{ fontSize:14, fontWeight:500, color:"var(--text)", marginBottom:8 }}>{step.title}</div>
                <div style={{ fontSize:12, color:"var(--text-m)", lineHeight:1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ padding:"90px 0" }}>
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div className="badge" style={{ marginBottom:20 }}>What Developers Say</div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(26px,3vw,42px)", fontWeight:300 }}>
              Used by developers across London,<br/>the Gulf, and Southeast Asia
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className="testi">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div className="stars">{"★".repeat(t.stars)}</div>
                  <span style={{ fontSize:9, color:"var(--text-d)", background:"var(--bg4)", padding:"2px 8px", borderRadius:20, letterSpacing:".08em", textTransform:"uppercase" }}>{t.tag}</span>
                </div>
                <p style={{ fontSize:13, color:"var(--text-m)", lineHeight:1.8, fontStyle:"italic" }}>"{t.q}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"var(--gold-bg)", border:"1px solid var(--gold-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, color:"var(--gold)" }}>{t.name.split(" ").map(n=>n[0]).join("")}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:"var(--text)" }}>{t.name}</div>
                    <div style={{ fontSize:11, color:"var(--text-d)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" style={{ padding:"90px 0", background:"var(--bg1)", borderTop:"1px solid var(--border)" }}>
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div className="badge" style={{ marginBottom:20 }}>Pricing</div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(28px,3.5vw,48px)", fontWeight:300, marginBottom:14 }}>
              Start free. Scale as you grow.
            </h2>
            <p style={{ fontSize:15, color:"var(--text-m)" }}>14-day free trial on all plans. No credit card required.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, maxWidth:920, margin:"0 auto" }}>
            {[
              { name:"Starter", price:"£195", period:"/mo", desc:"For individual developers and valuers running 1–2 projects at a time.", features:["5 active appraisals","BTR, BTS, Hotel, Flip models","Monthly cash flow engine","Sensitivity matrices","PDF brochures","3 users"], featured:false, cta:"Start Free Trial" },
              { name:"Professional", price:"£595", period:"/mo", desc:"For growing teams working on multiple developments simultaneously.", features:["Unlimited appraisals","All asset types + specialist models","Scenario manager (3 scenarios)","3-tier promote waterfall","AI market comparables","Branded investor brochures","Audit trail","Live investor portal links","Excel export","8 users"], featured:true, cta:"Start Free Trial" },
              { name:"Enterprise", price:"Custom", period:"", desc:"For funds, institutional developers and multi-team platforms.", features:["Unlimited users + workspaces","White-label platform","SSO & RBAC","Custom integrations & API","Dedicated onboarding","2-hour SLA support","Custom reporting templates","Lender portal access"], featured:false, cta:"Contact Sales" },
            ].map((plan,i)=>(
              <div key={i} className={`price-card ${plan.featured?"featured":""}`}>
                {plan.featured&&<div className="badge" style={{ position:"absolute", top:18, right:18, fontSize:9 }}>Most Popular</div>}
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:"var(--text-m)", marginBottom:10 }}>{plan.name}</div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:10 }}>
                    <span style={{ fontFamily:"var(--font-display)", fontSize:42, fontWeight:300, color:"var(--text)", letterSpacing:"-.02em" }}>{plan.price}</span>
                    <span style={{ fontSize:13, color:"var(--text-d)" }}>{plan.period}</span>
                  </div>
                  <p style={{ fontSize:13, color:"var(--text-d)", lineHeight:1.6 }}>{plan.desc}</p>
                </div>
                <div style={{ height:1, background:"var(--border)", marginBottom:22 }} />
                <ul style={{ listStyle:"none", marginBottom:28 }}>
                  {plan.features.map((f,j)=>(
                    <li key={j} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:9, fontSize:13, color:"var(--text-m)" }}>
                      <span style={{ color:"var(--green)", fontSize:11, marginTop:1, flexShrink:0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button className={plan.featured?"btn-primary":"btn-ghost"} style={{ width:"100%", justifyContent:"center", padding:"13px" }} onClick={onLogin}>{plan.cta}</button>
              </div>
            ))}
          </div>
          <p style={{ textAlign:"center", marginTop:28, fontSize:12, color:"var(--text-d)" }}>All prices exclude VAT. Annual billing available at 20% discount. RICS CPD accreditation in progress.</p>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding:"100px 0", position:"relative", overflow:"hidden" }}>
        <div className="glow" style={{ width:700, height:500, top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:"radial-gradient(ellipse,rgba(201,168,76,.09) 0%,transparent 65%)" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }} />
        <div className="container" style={{ textAlign:"center", position:"relative", zIndex:1 }}>
          <div className="badge" style={{ marginBottom:24 }}>Get Started Today</div>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(34px,4.5vw,64px)", fontWeight:300, lineHeight:1.08, marginBottom:24 }}>
            The platform your investors,<br/>
            lenders and team all need
          </h2>
          <p style={{ fontSize:17, color:"var(--text-m)", maxWidth:520, margin:"0 auto 40px", lineHeight:1.75 }}>
            Join developers across London and the Middle East who have replaced their Excel models with Valora's institutional-grade appraisal engine.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn-primary" onClick={onLogin} style={{ fontSize:15, padding:"15px 36px" }}>Start 14-Day Free Trial →</button>
            <button className="btn-ghost" style={{ fontSize:15, padding:"14px 28px" }}>Book a Live Demo</button>
          </div>
          <div style={{ marginTop:32, fontSize:12, color:"var(--text-d)", display:"flex", justifyContent:"center", gap:24, flexWrap:"wrap" }}>
            {["No credit card required","Setup in 5 minutes","Full feature access","ISO 27001 certified"].map(t=>(
              <span key={t} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ color:"var(--green)", fontSize:10 }}>●</span>{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background:"var(--bg1)", borderTop:"1px solid var(--border)", padding:"56px 0 36px" }}>
        <div className="container">
          <div style={{ display:"grid", gridTemplateColumns:"2.5fr 1fr 1fr 1fr", gap:48, marginBottom:48 }}>
            <div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:28, fontWeight:300, color:"var(--gold)", letterSpacing:".1em", marginBottom:16 }}>VALORA</div>
              <p style={{ fontSize:13, color:"var(--text-d)", lineHeight:1.8, maxWidth:280, marginBottom:20 }}>
                Institutional development appraisal software for property developers, valuers, lenders and investment professionals.
              </p>
              <div style={{ display:"flex", gap:16 }}>
                {["ISO 27001","SOC 2","GDPR"].map(cert=>(
                  <div key={cert} style={{ fontSize:9, color:"var(--text-d)", border:"1px solid var(--border)", padding:"3px 8px", borderRadius:4, letterSpacing:".06em" }}>{cert}</div>
                ))}
              </div>
            </div>
            {[
              { h:"Platform", links:["Features","Pricing","Security","API","Changelog"] },
              { h:"Asset Types", links:["Build to Rent","Build to Sell","Hotel Acquisition","House Flips","Mixed Use"] },
              { h:"Company", links:["About","Blog","Careers","Contact","Support"] },
            ].map(col=>(
              <div key={col.h}>
                <div style={{ fontSize:10, letterSpacing:".14em", textTransform:"uppercase", color:"var(--text-d)", fontWeight:500, marginBottom:16 }}>{col.h}</div>
                {col.links.map(l=>(
                  <div key={l} style={{ fontSize:13, color:"var(--text-m)", marginBottom:10, cursor:"pointer", transition:"color .2s" }}
                    onMouseEnter={e=>e.target.style.color="var(--gold)"}
                    onMouseLeave={e=>e.target.style.color="var(--text-m)"}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid var(--border)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <div style={{ fontSize:12, color:"var(--text-d)" }}>© 2025 Valora Technologies Ltd. All rights reserved. Registered in England & Wales.</div>
            <div style={{ display:"flex", gap:20 }}>
              {["Privacy","Terms","Cookies","Accessibility"].map(l=>(
                <span key={l} style={{ fontSize:12, color:"var(--text-d)", cursor:"pointer" }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════ */
function Login({ onBack }) {
  const [tab, setTab] = useState("signin"); // signin | signup | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [firm, setFirm] = useState("");
  const [assetFocus, setAssetFocus] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email || !email.includes("@")) e.email = "Valid email required";
    if (tab !== "reset" && password.length < 8) e.password = "8+ characters required";
    if (tab === "signup" && !firm.trim()) e.firm = "Firm name required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); }, 1600);
  };

  const field = (label, id, type="text", placeholder="", val, setVal, err) => (
    <div style={{ marginBottom:16 }}>
      <label style={{ fontSize:11, color:"var(--text-m)", display:"block", marginBottom:6, letterSpacing:".07em", textTransform:"uppercase" }} htmlFor={id}>{label}</label>
      <input id={id} className="inp" type={type} placeholder={placeholder} value={val} onChange={e=>setVal(e.target.value)} autoComplete={type==="password"?"current-password":"email"} />
      {err&&<div style={{ fontSize:11, color:"var(--red)", marginTop:5 }}>{err}</div>}
    </div>
  );

  return (
    <div className="login-wrap">
      {/* ── LEFT: Brand ── */}
      <div className="login-left">
        {/* Grid bg */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)", backgroundSize:"50px 50px", pointerEvents:"none" }} />
        <div className="glow" style={{ width:500, height:500, bottom:0, left:"-10%", background:"radial-gradient(ellipse,rgba(201,168,76,.06) 0%,transparent 65%)" }} />

        {/* Logo */}
        <div style={{ position:"relative", zIndex:1, paddingBottom:32 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:10, padding:0 }}>
            <span style={{ fontFamily:"var(--font-display)", fontSize:28, fontWeight:300, color:"var(--gold)", letterSpacing:".1em" }}>VALORA</span>
            <span style={{ fontSize:9, color:"var(--text-d)", letterSpacing:".18em", textTransform:"uppercase" }}>Pro</span>
          </button>
        </div>

        {/* Hero copy */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", position:"relative", zIndex:1 }}>
          <div className="badge" style={{ marginBottom:20, width:"fit-content" }}>◆ Institutional Appraisal</div>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(30px,3vw,48px)", fontWeight:300, lineHeight:1.1, marginBottom:20 }}>
            Model with the<br/>
            <em className="grad-text" style={{ fontStyle:"italic" }}>precision of a<br/>trading floor</em>
          </h2>
          <p style={{ fontSize:14, color:"var(--text-m)", lineHeight:1.8, maxWidth:360, marginBottom:40 }}>
            Monthly cash flows against live benchmark curves. AI market comparables. Branded investor brochures. Everything your deal team needs.
          </p>

          {/* Feature pills */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { icon:"⟳", text:"Monthly CF Engine", sub:"SONIA / SOFR / EURIBOR forward curves" },
              { icon:"▦", text:"3×3 Sensitivity Matrices", sub:"45-scenario yield vs rent analysis" },
              { icon:"⬡", text:"AI Market Review", sub:"Benchmarked against live comparables" },
              { icon:"◉", text:"3-Tier Promote Waterfall", sub:"JV distribution — no other tool has this" },
            ].map((item,i)=>(
              <div key={i} className="fu" style={{ animationDelay:`${.2+i*.08}s`, display:"flex", gap:14, alignItems:"center", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10, padding:"12px 16px" }}>
                <div className="ficon" style={{ width:36, height:36, borderRadius:8, margin:0, fontSize:14 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:"var(--text)", marginBottom:2 }}>{item.text}</div>
                  <div style={{ fontSize:11, color:"var(--text-d)" }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust footer */}
        <div style={{ position:"relative", zIndex:1, paddingTop:28, borderTop:"1px solid var(--border)", display:"flex", gap:20, flexWrap:"wrap" }}>
          {["ISO 27001 Certified","GDPR Compliant","256-bit AES","99.9% Uptime"].map(t=>(
            <span key={t} style={{ fontSize:11, color:"var(--text-d)", display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ color:"var(--green)", fontSize:9 }}>●</span>{t}
            </span>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div className="login-right">
        <div style={{ width:"100%", maxWidth:440 }}>
          {/* Back btn */}
          <button onClick={onBack} className="btn-ghost" style={{ marginBottom:28, padding:"7px 16px", fontSize:12 }}>← Back to site</button>

          {success ? (
            /* ─ Success state ─ */
            <div className="login-card" style={{ textAlign:"center" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", margin:"0 auto 20px", background:"rgba(61,220,132,.1)", border:"1px solid rgba(61,220,132,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, color:"var(--green)", animation:"pulse-ring 2s ease" }}>✓</div>
              <h2 style={{ fontFamily:"var(--font-display)", fontSize:26, fontWeight:400, marginBottom:10 }}>
                {tab === "signin" ? "Signing you in…" : tab === "reset" ? "Check your inbox" : "Application received"}
              </h2>
              <p style={{ fontSize:13, color:"var(--text-m)", lineHeight:1.7 }}>
                {tab === "signin" ? "Redirecting to your workspace in a moment." : tab === "reset" ? "We've sent a password reset link to " + email : "We review every application personally. Expect to hear from us within 24 hours."}
              </p>
              {tab !== "signin" && (
                <button className="btn-ghost" style={{ marginTop:24, width:"100%", justifyContent:"center" }} onClick={()=>{setSuccess(false);setTab("signin")}}>Back to sign in</button>
              )}
            </div>
          ) : (
            <div className="login-card">
              {/* Tab switcher — not shown for reset */}
              {tab !== "reset" && (
                <div className="tab-switch" style={{ marginBottom:28 }}>
                  <button className={`tab-btn ${tab==="signin"?"active":""}`} onClick={()=>setTab("signin")}>Sign In</button>
                  <button className={`tab-btn ${tab==="signup"?"active":""}`} onClick={()=>setTab("signup")}>Request Access</button>
                </div>
              )}

              {/* Header */}
              <div style={{ marginBottom:24 }}>
                {tab === "reset" && (
                  <button onClick={()=>setTab("signin")} style={{ background:"none", border:"none", color:"var(--text-d)", fontSize:12, cursor:"pointer", marginBottom:14, padding:0, fontFamily:"var(--font-body)", display:"flex", alignItems:"center", gap:6 }}>
                    ← Back to sign in
                  </button>
                )}
                <h1 style={{ fontFamily:"var(--font-display)", fontSize:28, fontWeight:400, marginBottom:6, letterSpacing:"-.01em" }}>
                  {tab==="signin" ? "Welcome back" : tab==="signup" ? "Request access" : "Reset your password"}
                </h1>
                <p style={{ fontSize:13, color:"var(--text-m)" }}>
                  {tab==="signin" ? "Sign in to your Valora workspace" : tab==="signup" ? "Valora is invite-only. We'll be in touch within 24 hours." : "Enter your email and we'll send a reset link."}
                </p>
              </div>

              <form onSubmit={submit}>
                {/* Signup extras */}
                {tab === "signup" && (
                  <>
                    {field("Full Name","name","text","James Harrington",name,setName,errors.name)}
                    {field("Firm / Company","firm","text","Harrington Capital",firm,setFirm,errors.firm)}
                  </>
                )}

                {/* Email */}
                {field("Email Address","email","email","james@harringtoncap.com",email,setEmail,errors.email)}

                {/* Password */}
                {tab !== "reset" && (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <label style={{ fontSize:11, color:"var(--text-m)", letterSpacing:".07em", textTransform:"uppercase" }}>Password</label>
                      {tab === "signin" && <button type="button" onClick={()=>setTab("reset")} style={{ background:"none", border:"none", color:"var(--gold)", fontSize:11, cursor:"pointer", fontFamily:"var(--font-body)", padding:0 }}>Forgot?</button>}
                    </div>
                    <div style={{ position:"relative" }}>
                      <input id="pw" className="inp" type={showPw?"text":"password"} placeholder={tab==="signup"?"Create a strong password":"Your password"} value={password} onChange={e=>setPassword(e.target.value)} style={{ paddingRight:44 }} autoComplete={tab==="signup"?"new-password":"current-password"} />
                      <button type="button" onClick={()=>setShowPw(p=>!p)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"var(--text-d)", cursor:"pointer", fontSize:13, fontFamily:"var(--font-body)" }}>{showPw?"Hide":"Show"}</button>
                    </div>
                    {errors.password&&<div style={{ fontSize:11, color:"var(--red)", marginTop:5 }}>{errors.password}</div>}
                    {tab === "signup" && (
                      <div style={{ marginTop:6, display:"flex", gap:4 }}>
                        {[1,2,3,4].map(i=><div key={i} style={{ flex:1, height:3, borderRadius:2, background:password.length>=(i*2)?i<=2?"var(--amber)":"var(--green)":"var(--bg5)", transition:"background .3s" }}/>)}
                      </div>
                    )}
                  </div>
                )}

                {/* Signup asset focus */}
                {tab === "signup" && (
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:11, color:"var(--text-m)", display:"block", marginBottom:6, letterSpacing:".07em", textTransform:"uppercase" }}>Primary Asset Focus</label>
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

                {/* Remember me */}
                {tab === "signin" && (
                  <label style={{ display:"flex", alignItems:"center", gap:10, fontSize:12, color:"var(--text-m)", marginBottom:20, cursor:"pointer" }}>
                    <input type="checkbox" style={{ width:"auto", accentColor:"var(--gold)" }} />
                    Keep me signed in for 30 days
                  </label>
                )}

                <button type="submit" className="btn-primary" style={{ width:"100%", justifyContent:"center", padding:"14px", fontSize:14, marginTop:tab==="signin"?0:8 }} disabled={loading}>
                  {loading ? (
                    <span style={{ width:18, height:18, border:"2px solid rgba(0,0,0,.15)", borderTopColor:"#06070a", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }} />
                  ) : tab==="signin" ? "Sign In →" : tab==="reset" ? "Send Reset Link →" : "Request Access →"}
                </button>

                {/* Divider */}
                <div style={{ display:"flex", alignItems:"center", gap:14, margin:"18px 0" }}>
                  <div style={{ flex:1, height:1, background:"var(--border)" }} />
                  <span style={{ fontSize:11, color:"var(--text-d)" }}>or</span>
                  <div style={{ flex:1, height:1, background:"var(--border)" }} />
                </div>

                {/* SSO */}
                <button type="button" className="btn-ghost" style={{ width:"100%", justifyContent:"center", padding:"13px", gap:10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google Workspace
                </button>
              </form>

              {/* Legal */}
              <p style={{ marginTop:22, paddingTop:18, borderTop:"1px solid var(--border)", textAlign:"center", fontSize:11, color:"var(--text-d)", lineHeight:1.6 }}>
                By continuing you agree to our{" "}
                <span style={{ color:"var(--gold)", cursor:"pointer" }}>Terms of Service</span>
                {" & "}
                <span style={{ color:"var(--gold)", cursor:"pointer" }}>Privacy Policy</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
