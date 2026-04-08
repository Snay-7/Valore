"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

// ── Asset focus options (multi-select → stored in profiles.asset_focus) ──────
const ASSET_FOCUS_OPTIONS = [
  { key: "BTR",        label: "Build to Rent",  soon: false },
  { key: "BTS",        label: "Build to Sell",  soon: false },
  { key: "Hotel",      label: "Hotel",          soon: false },
  { key: "Flip",       label: "House Flip",     soon: false },
  { key: "Industrial", label: "Industrial",     soon: true  },
  { key: "Commercial", label: "Commercial",     soon: true  },
  { key: "MixedUse",   label: "Mixed Use",      soon: true  },
];

// ── Role / profession (single select → stored in profiles.role) ───────────────
const ROLES = [
  { key: "developer", label: "Developer",  description: "I originate and deliver development schemes" },
  { key: "investor",  label: "Investor",   description: "I deploy capital into real estate opportunities" },
  { key: "advisor",   label: "Advisor",    description: "I advise clients on development or investment strategy" },
  { key: "surveyor",  label: "Surveyor",   description: "I provide valuation, feasibility or due diligence" },
  { key: "analyst",   label: "Analyst",    description: "I build financial models and appraisals" },
];

// ── First deal cards (single select → /appraisal?type=X) ─────────────────────
const DEAL_TYPES = [
  {
    key: "BTR", label: "Build to Rent", sub: "BTR",
    description: "Multi-unit residential held for rental income. GDV, NOI, exit yield and IRR.",
    metrics: ["Exit Yield", "IRR", "DSCR"], time: "~3 min", color: "#c9a84c",
    icon: <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><rect x="4" y="12" width="20" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M2 13L14 4L26 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="10" y="18" width="4" height="7" rx="0.75" stroke="currentColor" strokeWidth="1.2"/><rect x="7" y="15" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/><rect x="18" y="15" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/></svg>,
  },
  {
    key: "BTS", label: "Build to Sell", sub: "BTS",
    description: "Residential development for sale. Unit mix, GDV, profit on cost and absorption.",
    metrics: ["Profit on Cost", "IRR", "Break-even psf"], time: "~3 min", color: "#5b9cf6",
    icon: <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><rect x="4" y="12" width="20" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M2 13L14 4L26 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M11 25V19h6v6" stroke="currentColor" strokeWidth="1.2"/><circle cx="21" cy="8" r="4" fill="#06070a" stroke="currentColor" strokeWidth="1.2"/><path d="M19.5 8l1 1 2-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    key: "Hotel", label: "Hotel", sub: "Hotel",
    description: "Hospitality acquisition or development. ADR, occupancy, EBITDA, cap rate exit.",
    metrics: ["RevPAR", "EBITDA", "Exit Cap Rate"], time: "~4 min", color: "#3ddc84",
    icon: <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><rect x="3" y="8" width="22" height="17" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 12h22" stroke="currentColor" strokeWidth="1"/><rect x="7" y="15" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/><rect x="12.5" y="15" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/><rect x="18" y="15" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/><rect x="7" y="20" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1"/><rect x="18" y="20" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1"/><path d="M11 5h6M14 5V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  },
  {
    key: "Flip", label: "House Flip", sub: "Flip",
    description: "Quick residential refurb and sale. Purchase, refurb budget, finance and profit.",
    metrics: ["ROI", "IRR", "Profit"], time: "~2 min", color: "#f0a429",
    icon: <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><path d="M5 14L14 6L23 14V24H18V19H10V24H5V14Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M19 8V5h3v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 22l3 3M21 25l3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold-l:#e2c97e;--gold-bg:rgba(201,168,76,0.07);--gold-border:rgba(201,168,76,0.2);
  --bg:#06070a;--bg1:#0c0e12;--bg2:#12151a;--bg3:#191d24;--bg4:#21262f;
  --text:#eceae4;--text-m:#7d8590;--text-d:#3d4249;
  --border:rgba(255,255,255,0.06);--border-m:rgba(255,255,255,0.12);
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.onb-wrap{
  min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:48px 20px;position:relative;overflow:hidden;
}
.onb-grid-bg{
  position:fixed;inset:0;pointer-events:none;
  background-image:linear-gradient(rgba(201,168,76,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.03) 1px,transparent 1px);
  background-size:60px 60px;
  mask-image:radial-gradient(ellipse 80% 70% at 50% 50%,black 40%,transparent 100%);
}
.onb-glow{
  position:fixed;top:50%;left:50%;transform:translate(-50%,-60%);
  width:700px;height:500px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(201,168,76,0.05) 0%,transparent 70%);
  pointer-events:none;
}
.onb-logo{animation:fadeIn .6s ease both;margin-bottom:44px;}
.onb-header{text-align:center;margin-bottom:36px;animation:fadeUp .6s ease .1s both;}
.onb-eyebrow{
  font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);
  font-family:var(--font-body);font-weight:600;margin-bottom:14px;
  display:flex;align-items:center;justify-content:center;gap:10px;
}
.onb-eyebrow::before,.onb-eyebrow::after{content:'';flex:1;max-width:40px;height:1px;background:rgba(201,168,76,.3);}
.onb-title{
  font-family:var(--font-display);font-size:clamp(32px,4.5vw,50px);font-weight:300;
  color:var(--text);line-height:1.1;margin-bottom:12px;
}
.onb-title em{font-style:italic;color:var(--gold);}
.onb-sub{font-size:14px;color:var(--text-m);line-height:1.6;max-width:400px;margin:0 auto;}
.onb-steps{display:flex;align-items:center;margin-bottom:40px;animation:fadeUp .6s ease .18s both;}
.onb-step{display:flex;align-items:center;gap:7px;}
.onb-step-num{
  width:21px;height:21px;border-radius:50%;border:1px solid var(--gold-border);
  display:flex;align-items:center;justify-content:center;
  font-size:9px;font-family:var(--font-mono);color:var(--gold);background:var(--gold-bg);flex-shrink:0;
}
.onb-step-label{font-size:11px;color:var(--text-m);white-space:nowrap;}
.onb-step-line{width:26px;height:1px;background:var(--border);margin:0 4px;}
.section-label{
  font-size:10px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--text-d);font-family:var(--font-body);font-weight:600;
  margin-bottom:12px;text-align:center;width:100%;
}
.section-hint{color:var(--text-d);font-weight:400;text-transform:none;letter-spacing:0;font-size:9px;}

/* Role pills */
.roles-grid{
  display:flex;flex-wrap:wrap;justify-content:center;gap:7px;
  width:100%;max-width:660px;margin-bottom:36px;
  animation:fadeUp .6s ease .25s both;
}
.role-pill{
  background:var(--bg2);border:1px solid var(--border);border-radius:8px;
  padding:9px 15px;cursor:pointer;transition:all .16s ease;
  display:flex;align-items:center;gap:7px;
}
.role-pill:hover{border-color:rgba(201,168,76,.3);background:var(--bg3);}
.role-pill.sel{border-color:var(--gold);background:rgba(201,168,76,.08);}
.role-pill-label{font-size:12px;font-weight:600;color:var(--text);transition:color .16s;}
.role-pill.sel .role-pill-label{color:var(--gold);}
.pill-check{
  width:13px;height:13px;border-radius:50%;background:var(--gold);
  display:flex;align-items:center;justify-content:center;
  opacity:0;transition:opacity .14s;flex-shrink:0;
}
.role-pill.sel .pill-check,.focus-pill.sel .pill-check{opacity:1;}

/* Asset focus pills */
.focus-grid{
  display:flex;flex-wrap:wrap;justify-content:center;gap:7px;
  width:100%;max-width:660px;margin-bottom:36px;
  animation:fadeUp .6s ease .3s both;
}
.focus-pill{
  background:var(--bg2);border:1px solid var(--border);border-radius:8px;
  padding:9px 15px;cursor:pointer;transition:all .16s ease;
  display:flex;align-items:center;gap:7px;
}
.focus-pill:hover:not(.soon){border-color:rgba(201,168,76,.3);background:var(--bg3);}
.focus-pill.sel{border-color:var(--gold);background:rgba(201,168,76,.08);}
.focus-pill.soon{cursor:default;opacity:.42;}
.focus-pill-label{font-size:12px;font-weight:600;color:var(--text);transition:color .16s;}
.focus-pill.sel .focus-pill-label{color:var(--gold);}
.soon-badge{
  font-size:8px;font-family:var(--font-mono);letter-spacing:.05em;
  background:var(--bg3);border:1px solid var(--border);color:var(--text-d);
  padding:1px 6px;border-radius:4px;
}
.divider{width:100%;max-width:880px;border:none;border-top:1px solid var(--border);margin:4px 0 32px;}

/* Deal type cards */
.cards-grid{
  display:grid;grid-template-columns:repeat(4,1fr);gap:11px;
  width:100%;max-width:880px;margin-bottom:32px;
  animation:fadeUp .6s ease .35s both;
}
.asset-card{
  background:var(--bg2);border:1px solid var(--border);border-radius:12px;
  padding:18px 16px;cursor:pointer;transition:all .18s ease;
  position:relative;overflow:hidden;display:flex;flex-direction:column;gap:11px;
}
.asset-card::before{
  content:'';position:absolute;inset:0;border-radius:12px;
  background:linear-gradient(135deg,rgba(201,168,76,0.06) 0%,transparent 60%);
  opacity:0;transition:opacity .18s;
}
.asset-card:hover{border-color:rgba(201,168,76,.35);transform:translateY(-2px);box-shadow:0 8px 26px rgba(0,0,0,.38);}
.asset-card:hover::before{opacity:1;}
.asset-card.sel{border-color:var(--gold);background:rgba(201,168,76,.07);transform:translateY(-2px);box-shadow:0 8px 26px rgba(0,0,0,.38),0 0 0 1px rgba(201,168,76,.15);}
.asset-card.sel::before{opacity:1;}
.card-icon{
  width:38px;height:38px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  background:var(--bg3);border:1px solid var(--border);transition:all .18s;flex-shrink:0;
}
.asset-card:hover .card-icon,.asset-card.sel .card-icon{background:rgba(201,168,76,.1);border-color:rgba(201,168,76,.25);}
.card-badge{
  position:absolute;top:11px;right:11px;
  font-size:8px;font-family:var(--font-mono);color:var(--text-d);
  background:var(--bg3);border:1px solid var(--border);
  padding:2px 6px;border-radius:7px;letter-spacing:.06em;
}
.asset-card.sel .card-badge{color:var(--gold);background:rgba(201,168,76,.1);border-color:rgba(201,168,76,.2);}
.card-label{font-size:13px;font-weight:600;color:var(--text);}
.card-desc{font-size:10px;color:var(--text-d);line-height:1.5;flex:1;}
.card-metrics{display:flex;flex-wrap:wrap;gap:3px;margin-top:auto;}
.card-metric{
  font-size:8px;font-family:var(--font-mono);padding:2px 5px;border-radius:3px;
  background:var(--bg3);color:var(--text-d);border:1px solid var(--border);white-space:nowrap;
}
.asset-card.sel .card-metric{background:rgba(201,168,76,.08);color:var(--gold);border-color:rgba(201,168,76,.2);}
.card-time{font-size:9px;color:var(--text-d);font-family:var(--font-mono);display:flex;align-items:center;gap:3px;margin-top:4px;}

/* CTA */
.onb-cta{display:flex;flex-direction:column;align-items:center;gap:13px;animation:fadeUp .6s ease .42s both;}
.selected-hint{font-size:11px;color:var(--text-d);font-family:var(--font-mono);animation:fadeIn .2s ease;}
.selected-hint span{color:var(--gold);}
.btn-start{
  background:var(--gold);color:#06070a;border:none;border-radius:9px;
  padding:13px 38px;font-family:var(--font-body);font-size:14px;font-weight:700;
  cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;gap:9px;letter-spacing:.02em;
}
.btn-start:hover:not(:disabled){background:var(--gold-l);transform:translateY(-1px);box-shadow:0 6px 22px rgba(201,168,76,.28);}
.btn-start:disabled{opacity:.36;cursor:not-allowed;}
.btn-start svg{transition:transform .18s;}
.btn-start:hover:not(:disabled) svg{transform:translateX(3px);}
.btn-skip{
  background:none;border:none;color:var(--text-d);font-family:var(--font-body);font-size:12px;cursor:pointer;
  padding:4px 8px;text-decoration:underline;text-underline-offset:3px;text-decoration-color:transparent;transition:all .18s;
}
.btn-skip:hover{color:var(--text-m);text-decoration-color:var(--text-d);}
@media(max-width:768px){
  .cards-grid{grid-template-columns:repeat(2,1fr);}
  .onb-steps{flex-wrap:wrap;justify-content:center;gap:8px;}
  .onb-step-line{display:none;}
  .onb-title{font-size:30px;}
}
@media(max-width:480px){
  .cards-grid{grid-template-columns:1fr 1fr;}
  .asset-card{padding:13px 11px;}
}
`;

const CheckIcon = () => (
  <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
    <path d="M1.5 4l2 2 3-3" stroke="#06070a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [assetFocus, setAssetFocus] = useState<string[]>([]);
  const [dealType, setDealType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      const { count } = await supabase
        .from("appraisals")
        .select("id", { count: "exact", head: true })
        .eq("created_by", session.user.id);
      / if ((count ?? 0) > 0) { router.push("/dashboard"); return; }  ← comment this line out
      if ((count ?? 0) > 0) { router.push("/dashboard"); return; }
      setLoading(false);
    };
    check();
  }, [router]);

  const toggleFocus = (key: string) => {
    setAssetFocus(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleStart = async () => {
    if (!dealType) return;
    setStarting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const updates: Record<string, any> = {};
      if (role) updates.profession = role;
      if (assetFocus.length > 0) updates.asset_focus = assetFocus.join(",");
      if (Object.keys(updates).length > 0) {
        await supabase.from("profiles").update(updates).eq("id", session.user.id);
      }
    }
    router.push(`/appraisal?type=${dealType}`);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 24, height: 24, border: "2px solid rgba(201,168,76,.15)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="onb-wrap">
      <style>{CSS}</style>
      <div className="onb-grid-bg" />
      <div className="onb-glow" />

      {/* Logo */}
      <div className="onb-logo">
        <svg width="90" height="22" viewBox="0 0 90 22" fill="none">
          <path d="M8 2L14 18L20 2" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 2L14 12L18 2" stroke="#06070a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <text x="26" y="16" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="17" fontWeight="400" fill="#eceae4" letterSpacing="0.12em">VALORA</text>
        </svg>
      </div>

      {/* Header */}
      <div className="onb-header">
        <div className="onb-eyebrow">Welcome to Valora</div>
        <h1 className="onb-title">
          Run your first deal in<br /><em>under 3 minutes</em>
        </h1>
        <p className="onb-sub">
          Tell us a bit about yourself, then pick a deal type and Valora handles the numbers instantly.
        </p>
      </div>

      {/* Steps */}
      <div className="onb-steps">
        {[
          { n: "1", label: "Your role" },
          { n: "2", label: "Asset focus" },
          { n: "3", label: "First deal" },
          { n: "4", label: "See returns" },
        ].map((s, i) => (
          <div key={s.n} className="onb-step">
            <div className="onb-step-num">{s.n}</div>
            <span className="onb-step-label">{s.label}</span>
            {i < 3 && <div className="onb-step-line" />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Role ── */}
      <div className="section-label">What best describes you?</div>
      <div className="roles-grid">
        {ROLES.map(r => (
          <div
            key={r.key}
            className={`role-pill${role === r.key ? " sel" : ""}`}
            onClick={() => setRole(prev => prev === r.key ? null : r.key)}
            title={r.description}
          >
            <span className="role-pill-label">{r.label}</span>
            <div className="pill-check"><CheckIcon /></div>
          </div>
        ))}
      </div>

      {/* ── Step 2: Asset Focus (multi-select) ── */}
      <div className="section-label">
        Which asset classes do you work with?&nbsp;
        <span className="section-hint">(select all that apply)</span>
      </div>
      <div className="focus-grid">
        {ASSET_FOCUS_OPTIONS.map(a => (
          <div
            key={a.key}
            className={`focus-pill${assetFocus.includes(a.key) ? " sel" : ""}${a.soon ? " soon" : ""}`}
            onClick={() => !a.soon && toggleFocus(a.key)}
          >
            <span className="focus-pill-label">{a.label}</span>
            {a.soon
              ? <span className="soon-badge">Soon</span>
              : <div className="pill-check"><CheckIcon /></div>
            }
          </div>
        ))}
      </div>

      <hr className="divider" />

      {/* ── Step 3: First deal ── */}
      <div className="section-label" style={{ marginBottom: 16 }}>What would you like to run first?</div>
      <div className="cards-grid">
        {DEAL_TYPES.map(a => (
          <div
            key={a.key}
            className={`asset-card${dealType === a.key ? " sel" : ""}`}
            onClick={() => setDealType(a.key)}
          >
            <div className="card-badge">{a.sub}</div>
            <div className="card-icon" style={{ color: dealType === a.key ? a.color : "var(--text-m)" }}>
              {a.icon}
            </div>
            <div className="card-label">{a.label}</div>
            <div className="card-desc">{a.description}</div>
            <div>
              <div className="card-metrics">
                {a.metrics.map(m => <span key={m} className="card-metric">{m}</span>)}
              </div>
              <div className="card-time">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1"/><path d="M5 3v2.5l1.5 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
                {a.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="onb-cta">
        {dealType && (
          <div className="selected-hint">
            Starting with <span>{DEAL_TYPES.find(a => a.key === dealType)?.label}</span> — pre-filled with realistic defaults
          </div>
        )}
        <button className="btn-start" disabled={!dealType || starting} onClick={handleStart}>
          {starting ? "Loading…" : "Start Appraisal"}
          {!starting && (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="#06070a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <button className="btn-skip" onClick={() => router.push("/dashboard")}>
          Skip — go to dashboard
        </button>
      </div>
    </div>
  );
}
