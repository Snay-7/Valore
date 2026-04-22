"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
/* ═══════════════════════════════════════════════════════════════════
   VALORA — LANDING PAGE
   Hero: Copilot as the face of the product.
   Tagline: "One sentence. Full underwrite."
   ═══════════════════════════════════════════════════════════════════ */
const CALENDLY = "https://calendly.com/hello-valoraplatform/30min";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --navy:#1A1E26; --navy-d:#0F1115; --navy-m:#242933;
  --cream:#F5F0E1; --cream-d:#EAE5D8; --cream-l:#FAF6ED;
  --text:#0F1115; --text-m:#3D4351; --text-d:#6B7280; --text-faint:#A0A5AE;
  --green:#2E9E72; --green-l:#52C498; --green-bg:rgba(46,158,114,.08); --green-border:rgba(46,158,114,.25);
  --gold:#A8843A;
  --border:rgba(15,17,21,.08); --border-m:rgba(15,17,21,.16);
  --border-dark:rgba(255,255,255,.08); --border-dark-m:rgba(255,255,255,.16);
  --font-display:'Poppins',system-ui,-apple-system,sans-serif;
  --font-body:'Poppins',system-ui,-apple-system,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
  --ease:cubic-bezier(0.16,1,0.3,1);
}
html,body{background:var(--cream);color:var(--text);font-family:var(--font-body);font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;scroll-behavior:smooth}
body{overflow-x:hidden}
img,svg{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
button{font-family:inherit;cursor:pointer}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulseGreen{0%,100%{box-shadow:0 0 0 0 rgba(82,196,152,.5)}50%{box-shadow:0 0 0 8px rgba(82,196,152,0)}}
@keyframes typingDot{0%,80%,100%{opacity:.3;transform:scale(.9)}40%{opacity:1;transform:scale(1.1)}}
@keyframes blinkCursor{0%,100%{opacity:1}50%{opacity:0}}
.fade-up{animation:fadeUp .6s var(--ease) both}
.typing-dot{animation:typingDot 1.2s infinite ease-in-out}

/* ── NAV ── */
.nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(10px);background:rgba(245,240,225,.85);border-bottom:1px solid var(--border)}
.nav-inner{max-width:1240px;margin:0 auto;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.nav-logo{display:flex;align-items:center;gap:10px;font-family:var(--font-display);font-weight:700;font-size:20px;letter-spacing:-.02em;color:var(--navy)}
.nav-logo-mark{width:24px;height:24px;border-radius:6px;background:var(--green);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px}
.nav-links{display:flex;gap:28px;font-size:14px;font-weight:500;color:var(--text-m)}
.nav-links a{transition:color .15s}
.nav-links a:hover{color:var(--navy)}
.nav-cta{display:flex;gap:10px;align-items:center}

/* ── Buttons ── */
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:10px;font-family:var(--font-body);font-size:14px;font-weight:600;letter-spacing:-.005em;cursor:pointer;transition:all .2s var(--ease);border:1px solid transparent;text-decoration:none;white-space:nowrap}
.btn-primary{background:var(--green);color:#fff;border-color:var(--green)}
.btn-primary:hover{background:var(--green-l);border-color:var(--green-l);transform:translateY(-1px)}
.btn-ghost{background:transparent;color:var(--navy);border-color:var(--border-m)}
.btn-ghost:hover{border-color:var(--navy);background:rgba(15,17,21,.03)}
.btn-dark{background:var(--navy);color:var(--cream);border-color:var(--navy)}
.btn-dark:hover{background:#000}
.btn-lg{padding:14px 26px;font-size:15px}
.btn-sm{padding:8px 14px;font-size:13px}

/* ── Sections ── */
.section{padding:96px 32px}
.section-narrow{max-width:880px;margin:0 auto}
.section-wide{max-width:1240px;margin:0 auto}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--green);margin-bottom:18px}
.eyebrow-mark{width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;color:var(--green);font-size:10px}
.h1{font-family:var(--font-display);font-size:64px;font-weight:700;letter-spacing:-.035em;line-height:1.04;color:var(--navy)}
.h2{font-family:var(--font-display);font-size:44px;font-weight:700;letter-spacing:-.03em;line-height:1.1;color:var(--navy)}
.h3{font-family:var(--font-display);font-size:22px;font-weight:600;letter-spacing:-.02em;line-height:1.25;color:var(--navy)}
.lede{font-size:19px;line-height:1.55;color:var(--text-m);font-weight:400}
.small{font-size:13px;color:var(--text-d)}

/* ── HERO ── */
.hero{padding:72px 32px 96px;background:linear-gradient(180deg,var(--cream-l) 0%,var(--cream) 100%);position:relative;overflow:hidden}
.hero-grid{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1.1fr 1fr;gap:72px;align-items:center}
.hero-copy{max-width:560px}
.hero .h1{margin-bottom:22px}
.hero .h1 em{font-style:normal;color:var(--green);font-weight:700}
.hero .lede{margin-bottom:32px;max-width:500px}
.hero-cta{display:flex;gap:12px;align-items:center;margin-bottom:28px}
.hero-trust{font-size:13px;color:var(--text-d);font-weight:500;display:flex;align-items:center;gap:10px}
.hero-trust-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulseGreen 2s infinite}

/* Copilot demo card in hero */
.demo-card{background:#fff;border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:0 20px 60px rgba(15,17,21,.08),0 2px 6px rgba(15,17,21,.03);position:relative}
.demo-header{display:flex;align-items:center;gap:10px;padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid var(--border)}
.demo-logo{width:28px;height:28px;border-radius:8px;background:var(--green-bg);border:1px solid var(--green-border);display:flex;align-items:center;justify-content:center;color:var(--green);font-size:14px;font-weight:700}
.demo-title{font-size:13px;font-weight:600;color:var(--navy)}
.demo-subtitle{font-size:10px;color:var(--text-d);letterspacing:.08em;text-transform:uppercase;margin-top:2px}
.demo-bubble{padding:14px 16px;border-radius:12px;margin-bottom:12px;font-size:13.5px;line-height:1.55}
.demo-user{background:var(--green);color:#fff;margin-left:40px;border-radius:12px 12px 2px 12px;font-weight:500}
.demo-assistant{background:#F5F3EE;color:var(--text);margin-right:40px;border-radius:12px 12px 12px 2px}
.demo-assistant strong{color:var(--navy);font-weight:700}
.demo-suggestion{background:#F8F5EE;border:1px solid var(--green-border);border-radius:11px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:12px}
.demo-suggestion-label{font-size:9px;font-weight:700;color:var(--green);letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px}
.demo-suggestion-desc{font-size:12px;color:var(--navy);font-weight:500;line-height:1.4}
.demo-apply{background:var(--green);color:#fff;border:none;border-radius:7px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0}

/* ── TRUST STRIP ── */
.trust-strip{background:var(--navy);color:var(--cream);padding:32px}
.trust-inner{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:48px;align-items:center}
.trust-stat{text-align:center}
.trust-stat-num{font-family:var(--font-display);font-size:32px;font-weight:700;color:var(--green-l);letter-spacing:-.02em;line-height:1}
.trust-stat-lbl{font-size:11px;color:rgba(245,240,225,.6);text-transform:uppercase;letter-spacing:.12em;margin-top:8px;font-weight:500}

/* ── SPLIT CAPABILITIES ── */
.capabilities{background:var(--cream);padding:96px 32px}
.capabilities-header{text-align:center;max-width:720px;margin:0 auto 64px}
.capabilities-grid{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:32px}
.cap-card{background:#fff;border:1px solid var(--border);border-radius:18px;padding:36px;display:flex;flex-direction:column;gap:20px;transition:transform .25s var(--ease),border-color .25s var(--ease)}
.cap-card:hover{transform:translateY(-2px);border-color:var(--green-border)}
.cap-card-num{width:36px;height:36px;border-radius:10px;background:var(--green-bg);border:1px solid var(--green-border);color:var(--green);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:13px;font-weight:700}
.cap-demo{background:#FAF6ED;border:1px solid var(--border);border-radius:12px;padding:16px;font-family:var(--font-mono);font-size:12px;line-height:1.6;color:var(--text-m)}
.cap-demo-user{color:var(--green);font-weight:600;margin-bottom:8px}
.cap-demo-ai{color:var(--navy);font-weight:400}

/* ── ASSETS ── */
.assets{background:var(--navy);color:var(--cream);padding:96px 32px}
.assets-header{text-align:center;max-width:720px;margin:0 auto 64px}
.assets-header .h2{color:var(--cream)}
.assets-header .lede{color:rgba(245,240,225,.7)}
.assets-grid{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.asset-card{background:rgba(255,255,255,.03);border:1px solid var(--border-dark-m);border-radius:14px;padding:24px;transition:all .25s var(--ease)}
.asset-card:hover{background:rgba(82,196,152,.06);border-color:rgba(82,196,152,.35);transform:translateY(-2px)}
.asset-icon{width:28px;height:28px;color:var(--green-l);margin-bottom:14px}
.asset-name{font-size:16px;font-weight:700;color:var(--cream);letter-spacing:-.01em;margin-bottom:4px}
.asset-desc{font-size:12.5px;color:rgba(245,240,225,.6);line-height:1.5}

/* ── DIFFERENTIATORS ── */
.diff{padding:96px 32px;background:var(--cream)}
.diff-header{text-align:center;max-width:720px;margin:0 auto 64px}
.diff-grid{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
.diff-card{padding:0}
.diff-icon{width:44px;height:44px;border-radius:12px;background:var(--green-bg);border:1px solid var(--green-border);color:var(--green);display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.diff-card .h3{margin-bottom:10px}
.diff-card p{color:var(--text-m);font-size:14.5px;line-height:1.65}

/* ── FLOW ── */
.flow{padding:96px 32px;background:var(--cream-d)}
.flow-header{text-align:center;max-width:720px;margin:0 auto 64px}
.flow-steps{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:32px;position:relative}
.flow-step{background:#fff;border:1px solid var(--border);border-radius:18px;padding:28px;position:relative}
.flow-num{position:absolute;top:-16px;left:28px;background:var(--navy);color:var(--cream);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:13px;font-weight:700}
.flow-verb{font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--green);letter-spacing:.14em;text-transform:uppercase;margin:12px 0 8px}
.flow-what{font-family:var(--font-display);font-size:22px;font-weight:700;color:var(--navy);letter-spacing:-.02em;margin-bottom:10px}
.flow-how{font-size:13.5px;color:var(--text-m);line-height:1.6}

/* ── QUOTE ── */
.quote{background:var(--navy);color:var(--cream);padding:96px 32px;text-align:center}
.quote-inner{max-width:820px;margin:0 auto}
.quote-mark{font-family:var(--font-display);font-size:80px;color:var(--green-l);line-height:.7;margin-bottom:-20px;letter-spacing:-.04em}
.quote-body{font-family:var(--font-display);font-size:28px;font-weight:500;line-height:1.4;letter-spacing:-.015em;color:var(--cream);margin-bottom:32px}
.quote-attr{font-size:13px;color:rgba(245,240,225,.55);letter-spacing:.1em;text-transform:uppercase;font-weight:600}

/* ── PRICING ── */
.pricing{padding:96px 32px;background:var(--cream)}
.pricing-header{text-align:center;max-width:720px;margin:0 auto 64px}
.pricing-grid{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.price-card{background:#fff;border:1px solid var(--border);border-radius:18px;padding:32px;display:flex;flex-direction:column;gap:18px;transition:border-color .2s}
.price-card.featured{border:2px solid var(--green);transform:scale(1.02)}
.price-tier{font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--green)}
.price-amount{font-family:var(--font-display);font-size:40px;font-weight:700;letter-spacing:-.03em;color:var(--navy);line-height:1}
.price-amount small{font-size:14px;font-weight:500;color:var(--text-d)}
.price-feats{list-style:none;display:flex;flex-direction:column;gap:10px;font-size:14px;color:var(--text-m);margin:8px 0}
.price-feats li{display:flex;align-items:flex-start;gap:10px;line-height:1.45}
.price-feats li::before{content:"✓";color:var(--green);font-weight:700;flex-shrink:0}

/* ── FINAL CTA ── */
.final-cta{background:linear-gradient(135deg,var(--green) 0%,#1F8B5F 100%);color:#fff;padding:80px 32px;text-align:center}
.final-cta .h2{color:#fff;margin-bottom:16px}
.final-cta p{color:rgba(255,255,255,.9);font-size:17px;margin-bottom:32px}
.final-cta .btn-dark{background:var(--navy);border-color:var(--navy)}
.final-cta .btn-dark:hover{background:#000}
.final-cta .btn-ghost{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.3);color:#fff}
.final-cta .btn-ghost:hover{background:rgba(255,255,255,.16)}

/* ── FOOTER ── */
.footer{background:var(--navy);color:var(--cream);padding:56px 32px 32px}
.footer-grid{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:48px;margin-bottom:40px}
.footer-brand{display:flex;flex-direction:column;gap:12px}
.footer-logo{font-family:var(--font-display);font-size:22px;font-weight:700;color:var(--cream);letter-spacing:-.02em}
.footer-tagline{font-size:13px;color:rgba(245,240,225,.55);max-width:280px;line-height:1.55}
.footer-col-title{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(245,240,225,.4);margin-bottom:14px}
.footer-col a{display:block;font-size:13.5px;color:rgba(245,240,225,.75);padding:4px 0;transition:color .15s}
.footer-col a:hover{color:var(--green-l)}
.footer-bottom{max-width:1240px;margin:0 auto;padding-top:24px;border-top:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(245,240,225,.4)}

/* ── RESPONSIVE ── */
@media(max-width:900px){
  .section,.capabilities,.assets,.diff,.flow,.quote,.pricing{padding:64px 24px}
  .hero{padding:56px 24px}
  .hero-grid{grid-template-columns:1fr;gap:40px}
  .h1{font-size:44px}
  .h2{font-size:32px}
  .lede{font-size:17px}
  .trust-inner{grid-template-columns:repeat(2,1fr);gap:32px}
  .capabilities-grid,.diff-grid,.flow-steps,.pricing-grid{grid-template-columns:1fr}
  .assets-grid{grid-template-columns:repeat(2,1fr)}
  .nav-links{display:none}
  .footer-grid{grid-template-columns:1fr 1fr;gap:32px}
}
@media(max-width:520px){
  .assets-grid{grid-template-columns:1fr}
  .footer-grid{grid-template-columns:1fr}
  .footer-bottom{flex-direction:column;gap:10px;text-align:center}
  .hero-cta{flex-direction:column;align-items:stretch}
  .hero-cta .btn{justify-content:center}
}
`;

function AssetIcon({ type, size = 28 }: { type: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "BTR":
      return (<svg {...common}><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="8" y1="6" x2="8.01" y2="6"/><line x1="12" y1="6" x2="12.01" y2="6"/><line x1="16" y1="6" x2="16.01" y2="6"/><line x1="8" y1="10" x2="8.01" y2="10"/><line x1="12" y1="10" x2="12.01" y2="10"/><line x1="16" y1="10" x2="16.01" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/><rect x="10" y="18" width="4" height="4"/></svg>);
    case "BTS":
      return (<svg {...common}><path d="M3 11l9-8 9 8"/><path d="M5 9v12h14V9"/><rect x="10" y="14" width="4" height="7"/></svg>);
    case "Hotel":
      return (<svg {...common}><path d="M3 21V9l9-6 9 6v12"/><path d="M3 21h18"/><line x1="8" y1="12" x2="8.01" y2="12"/><line x1="12" y1="12" x2="12.01" y2="12"/><line x1="16" y1="12" x2="16.01" y2="12"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/><path d="M10 21v-4h4v4"/></svg>);
    case "Flip":
      return (<svg {...common}><path d="M3 12a9 9 0 0114.85-6.85L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-14.85 6.85L3 16"/><path d="M3 21v-5h5"/></svg>);
    case "Commercial":
      return (<svg {...common}><rect x="5" y="3" width="14" height="18" rx=".5"/><path d="M5 8h14"/><path d="M5 13h14"/><path d="M5 18h14"/><line x1="9" y1="10.5" x2="9.01" y2="10.5"/><line x1="15" y1="10.5" x2="15.01" y2="10.5"/><rect x="10" y="19" width="4" height="2"/></svg>);
    case "MixedUse":
      return (<svg {...common}><path d="M2 21V11l5-3 5 3"/><path d="M12 21V7l5-3 5 3v14"/><path d="M2 21h20"/><line x1="5" y1="14" x2="5.01" y2="14"/><line x1="15" y1="10" x2="15.01" y2="10"/><line x1="19" y1="10" x2="19.01" y2="10"/><line x1="15" y1="14" x2="15.01" y2="14"/><line x1="19" y1="14" x2="19.01" y2="14"/></svg>);
    default: return null;
  }
}

export default function Landing() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // If user is already signed in, send them to the dashboard.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { router.push("/dashboard"); return; }
      setCheckingAuth(false);
    });
  }, [router]);

  if (checkingAuth) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F0E1", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "2px solid rgba(46,158,114,.15)", borderTopColor: "#2E9E72", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="#" className="nav-logo"><span className="nav-logo-mark">◆</span> Valora</a>
          <div className="nav-links">
            <a href="#copilot">Copilot</a>
            <a href="#assets">Assets</a>
            <a href="#pricing">Pricing</a>
            <a href="/learn">Learn</a>
          </div>
          <div className="nav-cta">
            <button className="btn btn-ghost btn-sm" onClick={() => router.push("/auth")}>Sign in</button>
            <button className="btn btn-primary btn-sm" onClick={() => router.push("/auth")}>Start free</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy fade-up">
            <div className="eyebrow"><span className="eyebrow-mark">◆</span> Valora Copilot</div>
            <h1 className="h1">One sentence. <em>Full underwrite.</em></h1>
            <p className="lede">Describe your deal. Valora&rsquo;s Copilot builds the institutional model — IRR, DSCR, cashflows, sensitivities, and an IC-ready brochure. In seconds, not hours.</p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => router.push("/auth")}>Start free →</button>
              <button className="btn btn-ghost btn-lg" onClick={() => window.open(CALENDLY, "_blank")}>Book a demo</button>
            </div>
            <div className="hero-trust">
              <span className="hero-trust-dot" />
              Used by PE funds, family offices, and deal-desk analysts
            </div>
          </div>

          {/* Live-looking Copilot demo */}
          <div className="demo-card fade-up" style={{ animationDelay: ".15s" }}>
            <div className="demo-header">
              <div className="demo-logo">◆</div>
              <div>
                <div className="demo-title">Valora Copilot</div>
                <div className="demo-subtitle" style={{ fontSize: 10, color: "var(--text-d)", letterSpacing: ".08em", textTransform: "uppercase", marginTop: 2 }}>Dashboard · Session chat</div>
              </div>
            </div>
            <div className="demo-bubble demo-user">Hotel in Mayfair, 80 keys, 4-star, £45m, 60% LTC</div>
            <div className="demo-bubble demo-assistant">
              Modelled as a <strong>4-star Mayfair hotel</strong>. Assumed ADR £240, 74% occupancy, 5-yr hold, 6.00% exit cap — Prime London comps.
            </div>
            <div className="demo-suggestion">
              <div>
                <div className="demo-suggestion-label">Suggested create</div>
                <div className="demo-suggestion-desc">4-star hotel · 80 keys · £45m · 60% LTC · 5-yr hold</div>
              </div>
              <button className="demo-apply">Apply</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="trust-strip">
        <div className="trust-inner">
          <div className="trust-stat">
            <div className="trust-stat-num">£1.2bn</div>
            <div className="trust-stat-lbl">GDV Modelled</div>
          </div>
          <div className="trust-stat">
            <div className="trust-stat-num">30s</div>
            <div className="trust-stat-lbl">Idea → IC-ready</div>
          </div>
          <div className="trust-stat">
            <div className="trust-stat-num">7</div>
            <div className="trust-stat-lbl">Asset classes</div>
          </div>
        </div>
      </section>

      {/* ── DEMO VIDEO — real product footage, works on desktop + mobile ── */}
      <section style={{ padding: "96px 32px 48px", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="eyebrow"><span className="eyebrow-mark">◆</span> Watch it work</div>
            <h2 className="h2">60 seconds. Deal to IC.</h2>
            <p className="lede" style={{ marginTop: 14, maxWidth: 640, margin: "14px auto 0" }}>One sentence in. Full institutional model, shareable investor link, IC-ready PDF. Recorded live on production.</p>
          </div>

          <div style={{
            position: "relative",
            maxWidth: 1100, margin: "0 auto",
            borderRadius: 18, overflow: "hidden",
            border: "1px solid var(--border)",
            boxShadow: "0 40px 100px rgba(15,17,21,.12), 0 2px 6px rgba(15,17,21,.04)",
            background: "var(--navy)",
            aspectRatio: "16 / 9",
          }}>
            <video
              src="/copilot-demo.mp4"
              poster="/copilot-demo-poster.jpg"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
            >
              Your browser doesn&apos;t support HTML5 video. <a href="/copilot-demo.mp4">Download the demo</a>.
            </video>
          </div>

          <p className="small" style={{ textAlign: "center", marginTop: 18 }}>
            Try it live →{" "}
            <a onClick={() => router.push("/auth")} style={{ color: "var(--green)", fontWeight: 600, cursor: "pointer" }}>Start free</a>
          </p>
        </div>
      </section>

      {/* ── TWO CAPABILITIES ── */}
      <section className="capabilities" id="copilot">
        <div className="capabilities-header fade-up">
          <div className="eyebrow"><span className="eyebrow-mark">◆</span> How Copilot works</div>
          <h2 className="h2">Two ways it saves you hours.</h2>
          <p className="lede" style={{ marginTop: 14 }}>Build deals from scratch or pressure-test the ones you&rsquo;re already running — all in natural language.</p>
        </div>
        <div className="capabilities-grid">
          {/* Card 1: Create */}
          <div className="cap-card fade-up">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="cap-card-num">01</div>
              <h3 className="h3">Build a new deal</h3>
            </div>
            <p className="lede" style={{ fontSize: 16 }}>Describe it in one line. Copilot parses the asset type, fills institutional defaults, and creates a fully-modelled appraisal you can open instantly.</p>
            <div className="cap-demo">
              <div className="cap-demo-user">&gt; BTR in Manchester, 180 units, £58m build cost, 5% exit yield</div>
              <div className="cap-demo-ai">Modelled as Manchester BTR. 180 units · £58m build · £1,650 avg rent · 5.00% exit yield · 3% rental growth · 30-yr hold. Applied.</div>
            </div>
          </div>
          {/* Card 2: Analyse */}
          <div className="cap-card fade-up" style={{ animationDelay: ".1s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="cap-card-num">02</div>
              <h3 className="h3">Interrogate a live deal</h3>
            </div>
            <p className="lede" style={{ fontSize: 16 }}>Open any appraisal and ask questions. Copilot reads the actual numbers, runs scenarios, explains levers, and applies changes with one click.</p>
            <div className="cap-demo">
              <div className="cap-demo-user">&gt; Why is my IRR low?</div>
              <div className="cap-demo-ai">Exit cap 6.5% vs entry yield 7.8% — only 130 bps of compression over a 5-yr hold. Levers: raise ADR by 8%, extend hold to 7 yrs, or drop exit cap to 5.25%.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ASSETS ── */}
      <section className="assets" id="assets">
        <div className="assets-header fade-up">
          <div className="eyebrow" style={{ color: "var(--green-l)" }}><span className="eyebrow-mark">◆</span> Asset Coverage</div>
          <h2 className="h2">Seven asset classes. One engine.</h2>
          <p className="lede" style={{ marginTop: 14 }}>Every asset class modelled with its own institutional conventions — USALI cascades for hotels, zone-by-zone cashflows for mixed use, refurb-to-sale for flips.</p>
        </div>
        <div className="assets-grid">
          {[
            { id: "BTR", name: "Build to Rent", desc: "Stabilised residential income. Unit mix, rental growth, exit yield." },
            { id: "BTS", name: "Build to Sell", desc: "Residential for open-market sale. Absorption, pricing, VAT." },
            { id: "Hotel", name: "Hotel", desc: "Simple + USALI-cascade Advanced. ADR, occupancy, GOP, EBITDA." },
            { id: "Flip", name: "Residential Flip", desc: "Buy, refurb, sell or hold. SDLT, bridging, ROI on cost." },
            { id: "Commercial", name: "Commercial", desc: "Office, retail, industrial. Year-by-year NOI + rent reviews." },
            { id: "MixedUse", name: "Mixed Use", desc: "Multi-zone: resi + commercial blended. Zone-level P&L." },
          ].map(a => (
            <div key={a.id} className="asset-card fade-up">
              <div className="asset-icon"><AssetIcon type={a.id} size={28} /></div>
              <div className="asset-name">{a.name}</div>
              <div className="asset-desc">{a.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DIFFERENTIATORS ── */}
      <section className="diff">
        <div className="diff-header fade-up">
          <div className="eyebrow"><span className="eyebrow-mark">◆</span> How it&rsquo;s different</div>
          <h2 className="h2">Not a chatbot. An underwriting platform.</h2>
          <p className="lede" style={{ marginTop: 14 }}>Valora is built on a real calc engine with jurisdiction-aware defaults, peer-reviewed methodology, and IC-grade output.</p>
        </div>
        <div className="diff-grid">
          <div className="diff-card fade-up">
            <div className="diff-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h20v18H2z"/><path d="M2 9h20"/><path d="M9 3v18"/></svg>
            </div>
            <h3 className="h3">Institutional defaults</h3>
            <p>Jurisdiction-aware profiles — SDLT, VAT, SONIA, USALI. Industry-standard exit cap anchors. Comps drawn from Prime London, US major metros, and UAE institutional benchmarks.</p>
          </div>
          <div className="diff-card fade-up" style={{ animationDelay: ".1s" }}>
            <div className="diff-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>
            </div>
            <h3 className="h3">Live sensitivity</h3>
            <p>Monte Carlo, stress tests, and what-if scenarios without rebuilding the model. Change any field and watch IRR, DSCR, Debt Yield, PoC recompute instantly on the sidebar.</p>
          </div>
          <div className="diff-card fade-up" style={{ animationDelay: ".2s" }}>
            <div className="diff-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="9" y1="11" x2="15" y2="11"/></svg>
            </div>
            <h3 className="h3">IC-ready output</h3>
            <p>One click to a PDF brochure your investment committee would actually read. Executive summary, deal strengths, risk assessment, comps — all generated from the live model.</p>
          </div>
        </div>
      </section>

      {/* ── FLOW ── */}
      <section className="flow">
        <div className="flow-header fade-up">
          <div className="eyebrow"><span className="eyebrow-mark">◆</span> From idea to IC</div>
          <h2 className="h2">Three steps. Under a minute.</h2>
        </div>
        <div className="flow-steps">
          <div className="flow-step fade-up">
            <div className="flow-num">01</div>
            <div className="flow-verb">Describe</div>
            <div className="flow-what">One sentence.</div>
            <div className="flow-how">Type the deal as you&rsquo;d say it to an analyst. Copilot parses the asset type, location, capital stack, and hold period.</div>
          </div>
          <div className="flow-step fade-up" style={{ animationDelay: ".1s" }}>
            <div className="flow-num">02</div>
            <div className="flow-verb">Build</div>
            <div className="flow-what">Full model.</div>
            <div className="flow-how">Appraisal pre-filled with institutional defaults. Metrics compute live on the sidebar — GDV, profit, IRR, DSCR, payback. Edit any field.</div>
          </div>
          <div className="flow-step fade-up" style={{ animationDelay: ".2s" }}>
            <div className="flow-num">03</div>
            <div className="flow-verb">Present</div>
            <div className="flow-what">IC brochure.</div>
            <div className="flow-how">One-click PDF export. Cover page, executive summary, sensitivity matrix, cashflows, comps. Designed for the committee, not the analyst.</div>
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="quote">
        <div className="quote-inner fade-up">
          <div className="quote-mark">&ldquo;</div>
          <div className="quote-body">The most complete underwriting platform I&rsquo;ve seen. Valora collapses a two-hour analyst workflow into a conversation.</div>
          <div className="quote-attr">— Analyst, Mid-market PE Fund</div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="pricing" id="pricing">
        <div className="pricing-header fade-up">
          <div className="eyebrow"><span className="eyebrow-mark">◆</span> Pricing</div>
          <h2 className="h2">Start free. Upgrade when it earns its keep.</h2>
          <p className="lede" style={{ marginTop: 14 }}>14-day free trial on paid plans. Annual billing saves 20%. No credit card to start.</p>
        </div>
        <div className="pricing-grid">
          {/* Free */}
          <div className="price-card fade-up">
            <div className="price-tier">Free</div>
            <div className="price-amount">$0<small> /month</small></div>
            <div className="small" style={{ marginTop: -6 }}>Forever free</div>
            <ul className="price-feats">
              <li>1 full appraisal — all features unlocked</li>
              <li>All 7 asset models</li>
              <li>AI Market Comps + sensitivity matrix</li>
              <li>Investment memorandum PDF</li>
            </ul>
            <button className="btn btn-ghost" onClick={() => router.push("/auth")}>Start free</button>
          </div>
          {/* Pro */}
          <div className="price-card featured fade-up" style={{ animationDelay: ".08s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="price-tier">Pro</div>
              <span style={{ background: "var(--green)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 999, letterSpacing: ".1em", textTransform: "uppercase" }}>Most Popular</span>
            </div>
            <div className="price-amount">$119<small> /mo</small></div>
            <div className="small" style={{ marginTop: -6 }}>Billed annually · $149/mo monthly</div>
            <ul className="price-feats">
              <li>Unlimited appraisals</li>
              <li>Full Copilot — deal creation + analysis</li>
              <li>Live investor share links</li>
              <li>AI Sense Check + Monte Carlo</li>
              <li>Year-by-year NOI hold model</li>
            </ul>
            <button className="btn btn-primary" onClick={() => router.push("/pricing")}>Start 14-day trial</button>
          </div>
          {/* Enterprise */}
          <div className="price-card fade-up" style={{ animationDelay: ".16s" }}>
            <div className="price-tier">Enterprise</div>
            <div className="price-amount">$319<small> /mo</small></div>
            <div className="small" style={{ marginTop: -6 }}>Billed annually · $399/mo monthly</div>
            <ul className="price-feats">
              <li>Everything in Pro</li>
              <li>5 team members included ($75/user after)</li>
              <li>Shared firm workspace</li>
              <li>White-labelled PDF exports</li>
              <li>Dedicated onboarding + SLA</li>
            </ul>
            <button className="btn btn-ghost" onClick={() => window.open(CALENDLY, "_blank")}>Talk to us</button>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 32, fontSize: 13, color: "var(--text-d)" }}>
          Full breakdown on the <a href="/pricing" style={{ color: "var(--green)", fontWeight: 600 }}>pricing page</a> — compare monthly, annual, and feature-by-feature.
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final-cta">
        <h2 className="h2">Stop modelling. Start underwriting.</h2>
        <p>Try Valora free. No credit card. Three deals to see if it earns its place.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-dark btn-lg" onClick={() => router.push("/auth")}>Start free →</button>
          <button className="btn btn-ghost btn-lg" onClick={() => window.open(CALENDLY, "_blank")}>Book a demo</button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">◆ Valora</div>
            <div className="footer-tagline">Institutional real estate underwriting, at the speed of thought.</div>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Product</div>
            <a href="#copilot">Copilot</a>
            <a href="#assets">Asset classes</a>
            <a href="#pricing">Pricing</a>
            <a href="/learn">Methodology</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <a href="/about">About</a>
            <a href="/blog">Blog</a>
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer">Book a demo</a>
            <a href="mailto:hello@valoraplatform.io">Contact</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Legal</div>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/security">Security</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} Valora Platform Ltd.</div>
          <div>Made for institutional analysts.</div>
        </div>
      </footer>
    </div>
  );
}
