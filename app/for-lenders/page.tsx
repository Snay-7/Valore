"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/* ════════════════════════════════════════════════════════════════════
   VALORA — /for-lenders  (banks, debt funds, specialist lenders)
   ════════════════════════════════════════════════════════════════════ */

const CALENDLY = "https://calendly.com/hello-valoraplatform/30min";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --navy:#1A1E26; --navy-d:#0F1115; --navy-m:#242933;
  --cream:#F5F0E1; --cream-d:#EAE5D8; --cream-l:#FAF6ED;
  --text:#0F1115; --text-m:#3D4351; --text-d:#6B7280; --text-faint:#A0A5AE;
  --green:#2E9E72; --green-l:#52C498; --green-hot:#6DFFB1;
  --green-bg:rgba(46,158,114,.08); --green-border:rgba(46,158,114,.25);
  --gold:#A8843A;
  --border:rgba(15,17,21,.08); --border-m:rgba(15,17,21,.16);
  --font-display:'Poppins',system-ui,-apple-system,sans-serif;
  --font-body:'Poppins',system-ui,-apple-system,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
  --ease:cubic-bezier(0.16,1,0.3,1);
}
html,body{font-family:var(--font-body);background:var(--cream);color:var(--text);line-height:1.55;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
button{font-family:inherit;cursor:pointer;border:none;background:none}
ul{list-style:none}
.fade-up{opacity:0;transform:translateY(24px);transition:opacity .8s var(--ease),transform .8s var(--ease)}
.fade-up.in{opacity:1;transform:translateY(0)}
.btn{display:inline-flex;align-items:center;gap:8px;border-radius:10px;font-weight:600;font-family:var(--font-body);transition:all .2s var(--ease);border:1px solid transparent;letter-spacing:-.005em;cursor:pointer}
.btn-lg{padding:14px 24px;font-size:15px}
.btn-sm{padding:8px 14px;font-size:13px}
.btn-primary{background:var(--green);color:#fff;border-color:var(--green)}
.btn-primary:hover{background:var(--green-l);border-color:var(--green-l);transform:translateY(-1px)}
.btn-ghost{background:transparent;color:var(--text);border-color:var(--border-m)}
.btn-ghost:hover{background:var(--cream-d);border-color:var(--text-m)}
.h1{font-size:64px;font-weight:800;line-height:1.05;letter-spacing:-.04em;color:var(--text)}
.h1 em{font-style:normal;color:var(--green);position:relative}
.h2{font-size:42px;font-weight:700;line-height:1.1;letter-spacing:-.025em;color:var(--text)}
.lede{font-size:19px;line-height:1.55;color:var(--text-m);font-weight:400;max-width:720px}
.eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;color:var(--green)}

.nav{position:sticky;top:0;z-index:50;background:rgba(245,240,225,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
.nav-inner{max-width:1240px;margin:0 auto;padding:18px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.nav-logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;letter-spacing:-.02em}
.nav-logo-mark{width:28px;height:28px;border-radius:7px;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px}
.nav-links{display:flex;align-items:center;gap:28px}
.nav-links a{font-size:14px;color:var(--text-m);font-weight:500;cursor:pointer}
.nav-links a:hover{color:var(--text)}
.nav-cta{display:flex;align-items:center;gap:10px}
.nav-dropdown{position:relative;display:flex;align-items:center}
.nav-dropdown-trigger{display:flex;align-items:center;gap:4px;cursor:pointer;font-size:14px;color:var(--text-m);font-weight:500;transition:color .15s}
.nav-dropdown-trigger::after{content:"▾";font-size:10px;opacity:.6;margin-left:2px;transition:transform .2s var(--ease)}
.nav-dropdown:hover .nav-dropdown-trigger{color:var(--text)}
.nav-dropdown:hover .nav-dropdown-trigger::after{transform:rotate(180deg)}
.nav-dropdown-menu{position:absolute;top:100%;left:-20px;margin-top:8px;background:#fff;border:1px solid var(--border);border-radius:14px;padding:12px;min-width:380px;box-shadow:0 16px 50px rgba(15,17,21,.10);opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .18s var(--ease),transform .18s var(--ease),visibility .18s var(--ease);z-index:100}
.nav-dropdown:hover .nav-dropdown-menu,.nav-dropdown:focus-within .nav-dropdown-menu{opacity:1;visibility:visible;transform:translateY(0)}
.nav-dropdown-item{display:flex;align-items:flex-start;gap:12px;padding:12px;border-radius:10px;cursor:pointer;transition:background .15s var(--ease);text-decoration:none}
.nav-dropdown-item:hover{background:var(--cream-l)}
.nav-dropdown-item-icon{width:38px;height:38px;border-radius:9px;background:var(--green-bg);color:var(--green);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:700;font-size:15px;border:1px solid var(--green-border)}
.nav-dropdown-item-title{font-size:14px;font-weight:600;color:var(--text);margin-bottom:3px;letter-spacing:-.01em}
.nav-dropdown-item-desc{font-size:12px;color:var(--text-d);line-height:1.4}

.hero{padding:88px 32px 72px;max-width:1240px;margin:0 auto}
.hero-grid{display:grid;grid-template-columns:1fr;gap:56px;align-items:center}
.hero-eyebrow{margin-bottom:18px}
.hero-cta{display:flex;gap:12px;margin-top:28px;flex-wrap:wrap}
.hero-trust{margin-top:28px;display:flex;gap:18px;align-items:center;font-size:13px;color:var(--text-d);flex-wrap:wrap}
.hero-trust-dot{width:5px;height:5px;border-radius:50%;background:var(--green);display:inline-block;margin-right:8px}

.pains{padding:88px 32px;max-width:1240px;margin:0 auto;border-top:1px solid var(--border)}
.pains-header{max-width:780px;margin-bottom:48px}
.pains-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.pain-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:28px;transition:all .2s var(--ease)}
.pain-card:hover{border-color:var(--text-m);transform:translateY(-2px)}
.pain-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(168,132,58,.1);color:var(--gold);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 10px;border-radius:99px;margin-bottom:14px}
.pain-title{font-size:20px;font-weight:700;margin-bottom:8px;letter-spacing:-.015em;color:var(--text)}
.pain-body{font-size:15px;line-height:1.55;color:var(--text-m)}

.solution{padding:88px 32px;background:var(--cream-l);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.solution-inner{max-width:1240px;margin:0 auto}
.solution-header{max-width:780px;margin-bottom:48px}
.solution-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.solution-card{background:#fff;border:1px solid var(--green-border);border-radius:16px;padding:28px;position:relative;overflow:hidden}
.solution-num{font-size:54px;font-weight:800;color:var(--green);line-height:1;letter-spacing:-.04em;margin-bottom:8px;font-family:var(--font-display);opacity:.5}
.solution-title{font-size:20px;font-weight:700;margin-bottom:8px;letter-spacing:-.015em;color:var(--text)}
.solution-body{font-size:15px;line-height:1.55;color:var(--text-m)}
.solution-tag{position:absolute;top:24px;right:24px;background:var(--green-bg);color:var(--green);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 10px;border-radius:99px;border:1px solid var(--green-border)}

.trust-strip{padding:48px 32px;background:var(--navy);color:#fff}
.trust-inner{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center}
.trust-stat-num{font-size:38px;font-weight:800;letter-spacing:-.03em;color:var(--green-hot);font-family:var(--font-display);line-height:1}
.trust-stat-lbl{font-size:12px;color:rgba(255,255,255,.6);margin-top:8px;letter-spacing:.06em;text-transform:uppercase;font-weight:600}

.cta-block{padding:96px 32px;text-align:center;max-width:920px;margin:0 auto}
.cta-block .h2{margin-bottom:18px}
.cta-block .lede{margin:0 auto 36px}
.cta-pricing{display:inline-flex;align-items:center;gap:10px;background:var(--green-bg);border:1px solid var(--green-border);border-radius:99px;padding:8px 18px;font-size:13px;font-weight:600;color:var(--green);margin-bottom:28px}

.footer{background:var(--navy);color:rgba(255,255,255,.7);padding:56px 32px 32px;border-top:1px solid var(--border)}
.footer-inner{max-width:1240px;margin:0 auto}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:48px;margin-bottom:36px}
.footer-brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;color:#fff;margin-bottom:14px}
.footer-brand-mark{width:28px;height:28px;border-radius:7px;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px}
.footer-tagline{font-size:14px;color:rgba(255,255,255,.5);max-width:340px;line-height:1.6}
.footer-col-h{font-size:11px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;color:#fff;margin-bottom:14px}
.footer-col a{display:block;font-size:14px;color:rgba(255,255,255,.6);padding:6px 0}
.footer-col a:hover{color:#fff}
.footer-bottom{border-top:1px solid rgba(255,255,255,.1);padding-top:24px;display:flex;justify-content:space-between;align-items:center;font-size:13px;color:rgba(255,255,255,.4)}

@media (max-width:900px){
  .h1{font-size:42px}
  .h2{font-size:30px}
  .hero{padding:64px 22px 48px}
  .pains,.solution,.cta-block{padding:64px 22px}
  .nav-links{display:none}
  .nav-inner{padding:14px 22px}
  .pains-grid,.solution-grid{grid-template-columns:1fr}
  .trust-inner{grid-template-columns:repeat(2,1fr);gap:24px}
  .footer-grid{grid-template-columns:1fr;gap:32px}
  .footer-bottom{flex-direction:column;gap:10px;text-align:center}
  .hero-cta{flex-direction:column;align-items:stretch}
  .hero-cta .btn{justify-content:center}
}
`;

const PAINS = [
  {
    tag: "Speed",
    title: "Indicative term sheet by Friday? Maybe.",
    body: "Borrower asks for indicative pricing on Tuesday. By Friday, your credit team is still arguing about the DSCR assumption. The deal goes to a faster lender — even though your terms would have won.",
  },
  {
    tag: "Inconsistency",
    title: "Every borrower's spreadsheet is different",
    body: "OM from broker A is in Excel. Borrower B sent a PDF. Sponsor C built their own template. Your analyst spends four hours reformatting cash flows before they can stress-test anything.",
  },
  {
    tag: "Stress testing",
    title: "What if rates rise 200bps? You don't know yet.",
    body: "Every stress scenario means rebuilding the model from scratch with someone else's assumptions. Sensitivity tables get skipped under deadline pressure — and risk catches it three weeks into committee review.",
  },
  {
    tag: "Audit defensibility",
    title: "Risk asks for a defensible trail. You hand them a spreadsheet.",
    body: "When risk team or external audit pulls the deal file, they get a 47-tab Excel workbook nobody outside finance can navigate. Every assumption needs a memo. Every memo needs a chase.",
  },
];

const SOLUTIONS = [
  {
    num: "01",
    tag: "Speed",
    title: "Borrower deck to indicative terms in 90 seconds",
    body: "Drop in the OM. Valora extracts asset class, NOI, debt structure, and produces DSCR, ICR, debt yield, LTV, LTC instantly. Return indicative pricing the same day the broker calls. Close more deals at better margins.",
  },
  {
    num: "02",
    tag: "Standardisation",
    title: "Any borrower input. One model.",
    body: "Whatever the borrower sends — Excel, PDF, OM, scanned term sheet — Valora ingests it into a single standardised cash flow. Your credit team works with one format, every deal.",
  },
  {
    num: "03",
    tag: "Stress testing",
    title: "Pre-built rate, cap, and NOI shocks",
    body: "Standard stress scenarios are built in: +200bps rate, +100bps cap, –10% NOI, refinancing risk at exit. Run the full battery in seconds. Customise the firm-wide scenarios so every deal gets the same lens.",
  },
  {
    num: "04",
    tag: "Audit trail",
    title: "Risk-team-ready PDF, every assumption logged",
    body: "Every output is a branded PDF with the full assumption ladder visible, RICS-aligned methodology section, and a traceable change log. Risk and audit get a defensible artefact, not a spreadsheet.",
  },
];

export default function ForLenders() {
  const router = useRouter();

  useEffect(() => {
    const els = document.querySelectorAll(".fade-up");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            <div className="nav-logo-mark">◆</div>
            <span>Valora</span>
          </a>
          <div className="nav-links">
            <div className="nav-dropdown">
              <span className="nav-dropdown-trigger">Made for</span>
              <div className="nav-dropdown-menu">
                <a className="nav-dropdown-item" onClick={() => router.push("/for-funds")}>
                  <div className="nav-dropdown-item-icon">F</div>
                  <div>
                    <div className="nav-dropdown-item-title">For funds &amp; family offices</div>
                    <div className="nav-dropdown-item-desc">
                      Underwrite a deal in 60 seconds. Not 6 weeks.
                    </div>
                  </div>
                </a>
                <a className="nav-dropdown-item" onClick={() => router.push("/for-developers")}>
                  <div className="nav-dropdown-item-icon">D</div>
                  <div>
                    <div className="nav-dropdown-item-title">For developers &amp; operators</div>
                    <div className="nav-dropdown-item-desc">
                      Every scheme. Every scenario. One source of truth.
                    </div>
                  </div>
                </a>
                <a className="nav-dropdown-item" onClick={() => router.push("/for-lenders")}>
                  <div className="nav-dropdown-item-icon">L</div>
                  <div>
                    <div className="nav-dropdown-item-title">For lenders &amp; banks</div>
                    <div className="nav-dropdown-item-desc">
                      Borrower deck to credit committee in one afternoon.
                    </div>
                  </div>
                </a>
                <a className="nav-dropdown-item" onClick={() => router.push("/for-valuers")}>
                  <div className="nav-dropdown-item-icon">V</div>
                  <div>
                    <div className="nav-dropdown-item-title">For valuers &amp; surveyors</div>
                    <div className="nav-dropdown-item-desc">
                      Red Book reports without the all-nighter.
                    </div>
                  </div>
                </a>
              </div>
            </div>
            <a onClick={() => router.push("/#products")}>Underwriting</a>
            <a onClick={() => router.push("/#products")}>Valuation</a>
            <a onClick={() => router.push("/#pricing")}>Pricing</a>
          </div>
          <div className="nav-cta">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => window.open(CALENDLY, "_blank")}
            >
              Book a demo
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => router.push("/auth")}>
              Start free →
            </button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy fade-up">
            <div className="eyebrow hero-eyebrow">For lenders &amp; banks</div>
            <h1 className="h1">
              From borrower deck to credit committee.
              <br />
              <em>In one afternoon.</em>
            </h1>
            <p className="lede" style={{ marginTop: 22 }}>
              Built for banks, debt funds, and specialist lenders. DSCR, LTV, debt yield, ICR —
              instantly stress-tested, audit-trail ready, defensible to risk and audit on day one.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => router.push("/auth")}>
                Start free →
              </button>
              <button
                className="btn btn-ghost btn-lg"
                onClick={() => window.open(CALENDLY, "_blank")}
              >
                Book a 20-min walkthrough
              </button>
            </div>
            <div className="hero-trust">
              <span>
                <span className="hero-trust-dot" />
                Pre-built rate &amp; cap stress scenarios
              </span>
              <span>
                <span className="hero-trust-dot" />
                RICS Red Book aligned methodology
              </span>
              <span>
                <span className="hero-trust-dot" />
                Audit-ready PDF on every deal
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="pains">
        <div className="pains-header fade-up">
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            The lender&rsquo;s week
          </div>
          <h2 className="h2">Four reasons your credit committee runs slow.</h2>
          <p className="lede" style={{ marginTop: 18 }}>
            We talked to credit officers and risk leads at banks, debt funds, and specialist
            lenders. The same four bottlenecks come up every cycle.
          </p>
        </div>
        <div className="pains-grid">
          {PAINS.map((p) => (
            <div key={p.title} className="pain-card fade-up">
              <span className="pain-tag">{p.tag}</span>
              <div className="pain-title">{p.title}</div>
              <div className="pain-body">{p.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="solution">
        <div className="solution-inner">
          <div className="solution-header fade-up">
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              How Valora answers each one
            </div>
            <h2 className="h2">Faster pricing. Tighter risk. Defensible output.</h2>
          </div>
          <div className="solution-grid">
            {SOLUTIONS.map((s) => (
              <div key={s.title} className="solution-card fade-up">
                <span className="solution-tag">{s.tag}</span>
                <div className="solution-num">{s.num}</div>
                <div className="solution-title">{s.title}</div>
                <div className="solution-body">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="trust-inner">
          <div>
            <div className="trust-stat-num">90s</div>
            <div className="trust-stat-lbl">Borrower deck to indicative terms</div>
          </div>
          <div>
            <div className="trust-stat-num">5+</div>
            <div className="trust-stat-lbl">Stress scenarios pre-built</div>
          </div>
          <div>
            <div className="trust-stat-num">100%</div>
            <div className="trust-stat-lbl">Audit-traceable assumptions</div>
          </div>
          <div>
            <div className="trust-stat-num">£0</div>
            <div className="trust-stat-lbl">Setup fee, ever</div>
          </div>
        </div>
      </section>

      <section className="cta-block">
        <div className="cta-pricing">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} />
          Enterprise tier: from $1,500/mo · 15+ seats · custom risk integration available
        </div>
        <h2 className="h2">Stop losing borrowers to faster lenders.</h2>
        <p className="lede" style={{ marginTop: 14 }}>
          Sign up free, run your next live deal through Valora, and see indicative terms returned
          the same afternoon the broker calls.
        </p>
        <div className="hero-cta" style={{ justifyContent: "center", marginTop: 32 }}>
          <button className="btn btn-primary btn-lg" onClick={() => router.push("/auth")}>
            Start free →
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => window.open(CALENDLY, "_blank")}>
            Book a walkthrough
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <div className="footer-brand-mark">◆</div>
                <span>Valora</span>
              </div>
              <div className="footer-tagline">
                AI Copilot for Real Estate Investors. Real Estate Deal Intelligence from one
                sentence to IC-ready output.
              </div>
            </div>
            <div className="footer-col">
              <div className="footer-col-h">Product</div>
              <a href="/#products">Underwriting</a>
              <a href="/#products">Valuation</a>
              <a href="/#pricing">Pricing</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-h">Made for</div>
              <a href="/for-funds">Funds</a>
              <a href="/for-developers">Developers</a>
              <a href="/for-lenders">Lenders</a>
              <a href="/for-valuers">Valuers</a>
            </div>
          </div>
          <div className="footer-bottom">
            <div>© 2026 Valora. All rights reserved.</div>
            <div>Made for real estate investors who think in basis points.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
