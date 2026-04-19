"use client";
declare const process: { env: Record<string, string | undefined> };
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
/* ═══════════════════════════════════════════════════════════════════════
   VALORA — PRICING v2
   Rebranded to the Valora design system. Dual-theme (follows the user's
   dashboard preference via body.light + html[data-theme] + localStorage)
   with the same unified sync used across dashboard/pipeline/tasks/team.
   All Stripe checkout logic, Supabase auth and search-param handling
   byte-identical. Poppins + JetBrains Mono typography.
   ═══════════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ─── VALORA TOKENS — DARK (default) ─── */
:root,
:root[data-theme="dark"]{
  --val-bg-app:#0F1115;--val-bg-panel:#1A1E26;--val-bg-panel-2:#242933;--val-bg-panel-3:#2D3340;
  --val-bg-overlay:rgba(15,17,21,0.72);
  --val-text:#F6F4EF;--val-text-mid:#C8CCD4;--val-text-dim:#949CA0;--val-text-faint:#6B7280;
  --val-gold:#C9A84C;
  --val-green:#52C498;--val-green-tint:rgba(82,196,152,0.12);--val-green-deep:#2E7D58;
  --val-amber:#F0A429;--val-amber-tint:rgba(240,164,41,0.12);
  --val-red:#F4645F;--val-red-tint:rgba(244,100,95,0.12);
  --val-blue:#5CA5DC;--val-blue-tint:rgba(92,165,220,0.12);
  --val-border:#383E4A;--val-border-lt:#4A505C;--val-border-accent:rgba(82,196,152,0.35);
  --val-font-body:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  --val-font-mono:'JetBrains Mono','SF Mono','Consolas',monospace;
  --val-r-xs:4px;--val-r-sm:6px;--val-r-md:8px;--val-r-lg:10px;--val-r-xl:12px;--val-r-pill:999px;
  --val-ease:cubic-bezier(0.16,1,0.3,1);
  --val-dur:180ms;
  /* Legacy aliases — existing inline styles keep working */
  --gold:var(--val-green);--gold-l:#5DD3A4;--gold-bg:var(--val-green-tint);--gold-border:var(--val-border-accent);
  --bg:var(--val-bg-app);--bg1:var(--val-bg-panel);--bg2:var(--val-bg-panel);
  --bg3:var(--val-bg-panel-2);--bg4:var(--val-bg-panel-3);--bg5:#383E4A;
  --text:var(--val-text);--text-m:var(--val-text-mid);--text-d:var(--val-text-dim);
  --border:var(--val-border);--border-m:var(--val-border-lt);
  --green:var(--val-green);--red:var(--val-red);--amber:var(--val-amber);--blue:var(--val-blue);--purple:#a78bfa;
  --font-display:var(--val-font-body);--font-body:var(--val-font-body);--font-mono:var(--val-font-mono);
}

/* ─── LIGHT ─── */
body.light,
:root[data-theme="light"]{
  --val-bg-app:#F8F5EE;--val-bg-panel:#FFFFFF;--val-bg-panel-2:#F2EEE4;--val-bg-panel-3:#EAE5D8;
  --val-bg-overlay:rgba(15,17,21,0.5);
  --val-text:#0F1115;--val-text-mid:#3D4351;--val-text-dim:#6B7280;--val-text-faint:#A0A5AE;
  --val-gold:#A8843A;
  --val-green:#2E9E72;--val-green-tint:rgba(46,158,114,0.10);--val-green-deep:#1F7050;
  --val-amber:#C57E14;--val-amber-tint:rgba(197,126,20,0.10);
  --val-red:#C24844;--val-red-tint:rgba(194,72,68,0.10);
  --val-blue:#2D7AB5;--val-blue-tint:rgba(45,122,181,0.10);
  --val-border:rgba(15,17,21,0.10);--val-border-lt:rgba(15,17,21,0.18);--val-border-accent:rgba(46,158,114,0.35);
  --gold-l:#1F7050;
  --purple:#7C3AED;
}

body{background:var(--val-bg-app);color:var(--val-text);font-family:var(--val-font-body);font-size:14px;line-height:1.45;font-weight:400;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
::selection{background:var(--val-green-tint);color:var(--val-text)}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--val-border-lt);border-radius:var(--val-r-pill);border:2px solid var(--val-bg-app)}
::-webkit-scrollbar-thumb:hover{background:var(--val-text-dim)}

@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}

/* ═══ PLAN CARD ═══ */
.plan-card{
  background:var(--val-bg-panel);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-xl);
  padding:32px;
  transition:border-color var(--val-dur) var(--val-ease),transform .2s var(--val-ease),box-shadow var(--val-dur) var(--val-ease);
  animation:fadeIn .4s var(--val-ease) both;
  display:flex;flex-direction:column;
}
.plan-card:hover{
  border-color:var(--val-border-accent);
  transform:translateY(-3px);
  box-shadow:0 12px 40px rgba(0,0,0,.35);
}
body.light .plan-card:hover,
:root[data-theme="light"] .plan-card:hover{box-shadow:0 12px 40px rgba(15,17,21,.10)}
.plan-card.featured{
  border-color:var(--val-green);
  background:linear-gradient(135deg,var(--val-bg-panel) 0%,var(--val-green-tint) 100%);
}

/* ═══ FEATURE ROWS ═══ */
.feature-row{
  display:flex;align-items:flex-start;gap:10px;
  padding:8px 0;font-size:13px;color:var(--val-text-mid);
  font-weight:500;
}
.feature-check{color:var(--val-green);font-size:14px;font-weight:700;flex-shrink:0;margin-top:1px}
.feature-x{color:var(--val-text-dim);font-size:14px;flex-shrink:0;margin-top:1px;font-weight:500}

/* ═══ BUTTONS ═══ */
.btn-primary{
  background:var(--val-green);color:var(--val-bg-app);
  border:none;border-radius:var(--val-r-md);
  padding:14px 28px;
  font-family:var(--val-font-body);font-size:14px;font-weight:600;letter-spacing:-.015em;
  cursor:pointer;transition:background var(--val-dur) var(--val-ease),transform .1s var(--val-ease);
  width:100%;display:block;text-align:center;
}
.btn-primary:hover{background:#5DD3A4;transform:translateY(-1px)}
body.light .btn-primary:hover,
:root[data-theme="light"] .btn-primary:hover{background:var(--val-green-deep)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-ghost{
  background:transparent;color:var(--val-text-mid);
  border:1px solid var(--val-border-lt);border-radius:var(--val-r-md);
  padding:13px 28px;
  font-family:var(--val-font-body);font-size:14px;font-weight:600;letter-spacing:-.015em;
  cursor:pointer;transition:all var(--val-dur) var(--val-ease);
  width:100%;display:block;text-align:center;
}
.btn-ghost:hover{border-color:var(--val-green);color:var(--val-green)}

/* ═══ BILLING TOGGLE ═══ */
.toggle{
  display:flex;align-items:center;gap:0;
  background:var(--val-bg-panel);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-pill);padding:4px;
}
.toggle-opt{
  padding:8px 20px;border-radius:var(--val-r-pill);
  font-size:13px;font-weight:500;letter-spacing:-.015em;
  cursor:pointer;transition:all var(--val-dur) var(--val-ease);
  font-family:var(--val-font-body);
  color:var(--val-text-dim);
}
.toggle-opt.active{background:var(--val-green);color:var(--val-bg-app);font-weight:700}

/* ═══ GRID ═══ */
.plans-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:20px;
  max-width:1000px;margin:0 auto;
}

@media(max-width:768px){
  .plans-grid{grid-template-columns:1fr;max-width:440px}
  .plan-card{padding:26px}
}
`;
const PLANS = [
  {
    id: "starter",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "For developers exploring the platform.",
    priceIdMonthly: (process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE as string) || "",
    priceIdAnnual: (process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ANNUAL as string) || "",
    color: "var(--val-text-mid)",
    features: [
      { text: "1 full appraisal — all features unlocked", included: true },
      { text: "All 7 asset models (BTR, BTS, Hotel, Flip, Mixed Use, Commercial, Industrial)", included: true },
      { text: "AI Market Comps", included: true },
      { text: "Sensitivity matrix", included: true },
      { text: "Investment memorandum PDF", included: true },
      { text: "Workspace / portfolio", included: false },
      { text: "Unlimited appraisals", included: false },
      { text: "Live share links", included: false },
      { text: "AI Sense Check", included: false },
    ],
  },
  {
    id: "professional",
    name: "Pro",
    monthlyPrice: 149,
    annualPrice: 119,
    description: "For serious developers and investment teams.",
    priceIdMonthly: (process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE as string) || "",
    priceIdAnnual: (process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ANNUAL as string) || "",
    featured: true,
    badge: "Most Popular",
    color: "var(--val-green)",
    features: [
      { text: "Unlimited appraisals", included: true },
      { text: "All 7 asset models incl. Advanced modes", included: true },
      { text: "Full workspace & portfolio", included: true },
      { text: "Live investor share links", included: true },
      { text: "AI Market Comps (rent PSF, NIY, comparables)", included: true },
      { text: "Investment memorandum PDF", included: true },
      { text: "AI Sense Check", included: true },
      { text: "Year-by-year NOI hold model", included: true },
      { text: "Priority support", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 399,
    annualPrice: 319,
    description: "For firms and institutional investment teams.",
    priceIdMonthly: (process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE as string) || "",
    priceIdAnnual: (process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ANNUAL as string) || "",
    color: "var(--val-blue)",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "5 team members included", included: true },
      { text: "$75/user after 5 members", included: true },
      { text: "Shared firm workspace", included: true },
      { text: "White label PDF exports", included: true },
      { text: "Multi-currency team deals", included: true },
      { text: "Dedicated onboarding", included: true },
      { text: "SLA support", included: true },
    ],
  },
];
function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ── Unified theme sync (follows dashboard/pipeline/tasks/team) ──
  useEffect(() => {
    const detectTheme = (): "dark" | "light" => {
      if (typeof document === "undefined") return "light";
      if (document.body && document.body.classList.contains("light")) return "light";
      const htmlTheme = document.documentElement.getAttribute("data-theme");
      if (htmlTheme === "light" || htmlTheme === "dark") return htmlTheme;
      try {
        for (const key of ["valora-theme", "val-theme", "theme"]) {
          const v = localStorage.getItem(key);
          if (v === "light" || v === "dark") return v;
        }
      } catch {}
      return "light";
    };
    const applyTheme = (t: "dark" | "light") => {
      document.documentElement.setAttribute("data-theme", t);
      document.body.classList.toggle("light", t === "light");
      try { localStorage.setItem("valora-theme", t); } catch {}
      try { localStorage.setItem("val-theme", t); } catch {}
    };
    const resync = () => applyTheme(detectTheme());
    resync();
    const onStorage = (e: StorageEvent) => { if (e.key && /theme/i.test(e.key)) resync(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", resync);
    document.addEventListener("visibilitychange", resync);
    const bodyObs = new MutationObserver(resync);
    bodyObs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    const htmlObs = new MutationObserver(resync);
    htmlObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", resync);
      document.removeEventListener("visibilitychange", resync);
      bodyObs.disconnect();
      htmlObs.disconnect();
    };
  }, []);
  const [user, setUser] = useState<any>(null);
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const cancelled = searchParams.get("cancelled");
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", session.user.id).single();
        setSubscription(sub);
      }
    };
    init();
  }, []);
  const handleCheckout = async (plan: typeof PLANS[0]) => {
    if (!user) { router.push("/"); return; }
    setLoading(plan.id);
    const priceId = billing === "annual" && (plan as any).priceIdAnnual
      ? (plan as any).priceIdAnnual
      : plan.priceIdMonthly;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          userEmail: user.email,
          tier: plan.id,
        }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
    }
    setLoading(null);
  };
  const currentTier = subscription?.tier || "free";
  return (
    <div style={{ minHeight: "100vh", background: "var(--val-bg-app)", color: "var(--val-text)", fontFamily: "var(--val-font-body)", transition: "background .2s,color .2s" }}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var keys=['valora-theme','val-theme','theme'];for(var i=0;i<keys.length;i++){var v=localStorage.getItem(keys[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='light';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');else if(document.body)document.body.classList.remove('light');try{localStorage.setItem('valora-theme',t);localStorage.setItem('val-theme',t);}catch(e){}}catch(e){}})()`}}/>
      {/* Nav */}
      <nav style={{ background: "var(--val-bg-panel)", borderBottom: "1px solid var(--val-border)", padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span onClick={()=>router.push("/dashboard")} style={{fontFamily:"var(--val-font-body)",fontSize:20,fontWeight:700,letterSpacing:"-.015em",color:"var(--val-text)",cursor:"pointer"}}>Valora</span>
        {user && <button onClick={() => router.push("/dashboard")} style={{ background: "transparent", color: "var(--val-text-mid)", border: "1px solid var(--val-border-lt)", borderRadius: "var(--val-r-sm)", padding: "0 14px", height: 30, fontFamily: "var(--val-font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "-.015em", cursor: "pointer", transition: "all var(--val-dur) var(--val-ease)" }} onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--val-text-dim)";e.currentTarget.style.color="var(--val-text)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--val-border-lt)";e.currentTarget.style.color="var(--val-text-mid)";}}>Dashboard</button>}
      </nav>
      <div style={{ padding: "64px 24px", maxWidth: 1080, margin: "0 auto" }}>
        {/* Cancelled banner */}
        {cancelled && (
          <div style={{ background: "var(--val-amber-tint)", border: "1px solid rgba(240,164,41,.3)", borderRadius: "var(--val-r-md)", padding: "12px 20px", marginBottom: 32, fontSize: 13, color: "var(--val-amber)", textAlign: "center", fontWeight: 500 }}>
            Checkout cancelled — no charge was made. Choose a plan below to get started.
          </div>
        )}
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "var(--val-green)", textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 16, fontFamily: "var(--val-font-body)", fontWeight: 600 }}>Pricing</div>
          <h1 style={{ fontFamily: "var(--val-font-body)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, marginBottom: 18, lineHeight: 1.1, letterSpacing: "-.03em", color: "var(--val-text)" }}>
            Institutional-grade appraisals.<br />
            <span style={{ color: "var(--val-green)" }}>Without the enterprise price tag.</span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--val-text-mid)", maxWidth: 540, margin: "0 auto 32px", fontWeight: 500, lineHeight: 1.55 }}>
            14-day free trial on all plans. No credit card required to start.
          </p>
          {/* Billing toggle */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="toggle">
              <div className={`toggle-opt ${billing === "monthly" ? "active" : ""}`} onClick={() => setBilling("monthly")}>Monthly</div>
              <div className={`toggle-opt ${billing === "annual" ? "active" : ""}`} onClick={() => setBilling("annual")}>
                Annual <span style={{ fontSize: 11, color: billing === "annual" ? "var(--val-bg-app)" : "var(--val-green)", fontWeight: 700, marginLeft: 4 }}>Save 20%</span>
              </div>
            </div>
          </div>
        </div>
        {/* Plans */}
        <div className="plans-grid">
          {PLANS.map((plan, i) => {
            const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
            const isCurrent = currentTier === plan.id;
            const isLoading = loading === plan.id;
            return (
              <div key={plan.id} className={`plan-card ${plan.featured ? "featured" : ""}`} style={{ animationDelay: `${i * 0.1}s` }}>
                {plan.badge && (
                  <div style={{ background: "var(--val-green)", color: "var(--val-bg-app)", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: "var(--val-r-pill)", display: "inline-block", marginBottom: 16, letterSpacing: ".08em", textTransform: "uppercase", alignSelf: "flex-start" }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ fontFamily: "var(--val-font-body)", fontSize: 28, fontWeight: 700, color: plan.color, marginBottom: 6, letterSpacing: "-.03em", lineHeight: 1 }}>{plan.name}</div>
                <div style={{ fontSize: 13, color: "var(--val-text-dim)", marginBottom: 24, lineHeight: 1.55, fontWeight: 500 }}>{plan.description}</div>
                {/* Price */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontFamily: "var(--val-font-body)", fontSize: 48, fontWeight: 700, color: "var(--val-text)", lineHeight: 1, letterSpacing: "-.03em", fontVariantNumeric: "tabular-nums" }}>{price === 0 ? "Free" : `$${price}`}</span>
                    <span style={{ fontSize: 13, color: "var(--val-text-dim)", fontWeight: 500 }}>{price === 0 ? "" : "/mo"}</span>
                  </div>
                  {billing === "annual" && price > 0 && (
                    <div style={{ fontSize: 11, color: "var(--val-green)", marginTop: 6, fontWeight: 600 }}>${plan.monthlyPrice - price} saved per month</div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--val-text-dim)", marginTop: 6, fontWeight: 500 }}>14-day free trial · cancel anytime</div>
                </div>
                {/* CTA */}
                <div style={{ marginBottom: 28 }}>
                  {isCurrent ? (
                    <div style={{ background: "var(--val-green-tint)", border: "1px solid var(--val-border-accent)", borderRadius: "var(--val-r-md)", padding: "13px", textAlign: "center", fontSize: 13, color: "var(--val-green)", fontWeight: 700, letterSpacing: "-.015em" }}>
                      ✓ Current Plan
                    </div>
                  ) : (
                    <button
                      className={plan.featured ? "btn-primary" : "btn-ghost"}
                      onClick={() => handleCheckout(plan)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <span style={{ width: 14, height: 14, border: "2px solid rgba(15,17,21,.2)", borderTopColor: "var(--val-bg-app)", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
                          Redirecting…
                        </span>
                      ) : `Start free trial →`}
                    </button>
                  )}
                </div>
                {/* Features */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--val-text-dim)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 12, fontWeight: 600 }}>What's included</div>
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="feature-row">
                      <span className={f.included ? "feature-check" : "feature-x"}>{f.included ? "✓" : "—"}</span>
                      <span style={{ color: f.included ? "var(--val-text-mid)" : "var(--val-text-dim)" }}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {/* Trust signals */}
        <div style={{ textAlign: "center", marginTop: 64 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 36, flexWrap: "wrap", marginBottom: 32 }}>
            {[
              { text: "Secure payments via Stripe" },
              { text: "Cancel anytime, no lock-in" },
              { text: "14-day free trial included" },
              { text: "Institutional-grade security" },
            ].map((t:any) => (
              <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--val-text-dim)", fontWeight: 500 }}>
                <span style={{ color: "var(--val-green)", fontWeight: 700 }}>✓</span><span>{t.text}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "var(--val-text-dim)", fontWeight: 500 }}>
            Questions? Email <span style={{ color: "var(--val-green)", fontWeight: 600 }}>hello@valoraplatform.io</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function PricingPageWrapper() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--val-bg-app, #0F1115)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(82,196,152,.2)", borderTopColor: "#52C498", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <PricingPage />
    </Suspense>
  );
}
