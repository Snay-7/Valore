"use client";

declare const process: { env: Record<string, string | undefined> };

import { useState, useEffect } from "react";

import { supabase } from "../../lib/supabase";

import { useRouter, useSearchParams } from "next/navigation";

import { Suspense } from "react";

















const CSS = `

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{

  --gold:#52C498;--gold-l:#72D4AE;--gold-bg:rgba(82,196,152,0.08);--gold-border:rgba(82,196,152,0.22);

  --bg:#0D1017;--bg1:#252D3F;--bg2:#141920;--bg3:#1A2030;--bg4:#202840;--bg5:#2A3350;

  --text:#F0EEE8;--text-m:#8B93A5;--text-d:#4D5570;

  --border:rgba(255,255,255,0.07);--border-m:rgba(255,255,255,0.13);

  --green:#52C498;--red:#D45252;--amber:#E0A030;--blue:#4A80C4;--purple:#a78bfa;

  --font-display:'Inter',system-ui,sans-serif;

  --font-body:'Inter',system-ui,sans-serif;

  --font-mono:'DM Mono',monospace;

}

body.light{

  --gold:#2A8A64;--gold-l:#1F7050;--gold-bg:rgba(82,196,152,0.09);--gold-border:rgba(82,196,152,0.25);

  --bg:#F8F9FA;--bg1:#252D3F;--bg2:#FFFFFF;--bg3:#F8F9FA;--bg4:#E8EAED;--bg5:#DDE0E6;

  --text:#1E2433;--text-m:#5A6478;--text-d:#9AA3AF;

  --border:#E8EAED;--border-m:#D0D4DC;

  --green:#2A8A64;--red:#C04040;--amber:#B07820;--blue:#2A5FAA;--purple:#7C3AED;

}

body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}

@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

@keyframes spin{to{transform:rotate(360deg)}}

.plan-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:32px;transition:border-color .2s,transform .2s,box-shadow .2s;animation:fadeIn .4s ease both;display:flex;flex-direction:column}

.plan-card:hover{border-color:var(--gold-border);transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.4)}

.plan-card.featured{border-color:var(--gold);background:linear-gradient(135deg,var(--bg2) 0%,rgba(82,196,152,.05) 100%)}

.feature-row{display:flex;align-items:flex-start;gap:10px;padding:8px 0;font-size:13px;color:var(--text-m)}

.feature-check{color:var(--green);font-size:14px;flex-shrink:0;margin-top:1px}

.feature-x{color:var(--text-d);font-size:14px;flex-shrink:0;margin-top:1px}

.btn-primary{background:var(--gold);color:#0D1017;border:none;border-radius:8px;padding:14px 28px;font-family:var(--font-body);font-size:14px;font-weight:600;cursor:pointer;transition:background .2s,transform .1s;width:100%;display:block;text-align:center}

.btn-primary:hover{background:var(--gold-l);transform:translateY(-1px)}

.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}

.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:8px;padding:13px 28px;font-family:var(--font-body);font-size:14px;cursor:pointer;transition:all .2s;width:100%;display:block;text-align:center}

.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}

.toggle{display:flex;align-items:center;gap:12px;background:var(--bg2);border:1px solid var(--border);border-radius:50px;padding:4px}

.toggle-opt{padding:8px 20px;border-radius:50px;font-size:13px;cursor:pointer;transition:all .2s;font-family:var(--font-body)}

.toggle-opt.active{background:var(--gold);color:#0D1017;font-weight:600}

.toggle-opt:not(.active){color:var(--text-d)}

.plans-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1000px;margin:0 auto}

@media(max-width:768px){

  .plans-grid{grid-template-columns:1fr;max-width:420px}

  .plan-card{padding:24px}

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

    color: "var(--text-m)",

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

    color: "var(--gold)",

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

    color: "var(--blue)",

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

  const [user, setUser] = useState<any>(null);

  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

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

    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}>

      <style>{CSS}</style>

      <script dangerouslySetInnerHTML={{__html:`(function(){var t=localStorage.getItem('valora-theme')||'light';if(t==='light')document.body.classList.add('light');})()`}}/>

















      {/* Nav */}

      <nav style={{ background: "var(--bg1)", borderBottom: "1px solid var(--border)", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        <span onClick={()=>router.push("/dashboard")} style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:16,fontWeight:600,letterSpacing:"-.02em",color:"#ffffff",cursor:"pointer"}}>Valora</span>

        {user && <button onClick={() => router.push("/dashboard")} style={{ background: "transparent", color: "var(--text-m)", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 14px", fontFamily: "var(--font-body)", fontSize: 12, cursor: "pointer" }}>Dashboard</button>}

      </nav>

















      <div style={{ padding: "64px 24px", maxWidth: 1080, margin: "0 auto" }}>

















        {/* Cancelled banner */}

        {cancelled && (

          <div style={{ background: "rgba(240,164,41,.1)", border: "1px solid rgba(240,164,41,.3)", borderRadius: 10, padding: "12px 20px", marginBottom: 32, fontSize: 13, color: "var(--amber)", textAlign: "center" }}>

            Checkout cancelled — no charge was made. Choose a plan below to get started.

          </div>

        )}

















        {/* Header */}

        <div style={{ textAlign: "center", marginBottom: 48 }}>

          <div style={{ fontSize: 11, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".15em", marginBottom: 16, fontFamily: "var(--font-body)" }}>Pricing</div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 300, marginBottom: 16, lineHeight: 1.1 }}>

            Institutional-grade appraisals.<br />

            <span style={{ color: "var(--gold)" }}>Without the enterprise price tag.</span>

          </h1>

          <p style={{ fontSize: 16, color: "var(--text-m)", maxWidth: 520, margin: "0 auto 32px" }}>

            14-day free trial on all plans. No credit card required to start.

          </p>

















          {/* Billing toggle */}

          <div style={{ display: "flex", justifyContent: "center" }}>

            <div className="toggle">

              <div className={`toggle-opt ${billing === "monthly" ? "active" : ""}`} onClick={() => setBilling("monthly")}>Monthly</div>

              <div className={`toggle-opt ${billing === "annual" ? "active" : ""}`} onClick={() => setBilling("annual")}>

                Annual <span style={{ fontSize: 11, color: billing === "annual" ? "#0D1017" : "var(--green)", fontWeight: 600, marginLeft: 4 }}>Save 20%</span>

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

                  <div style={{ background: "var(--gold)", color: "#0D1017", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 20, display: "inline-block", marginBottom: 16, letterSpacing: ".06em", textTransform: "uppercase" }}>

                    {plan.badge}

                  </div>

                )}

















                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, color: plan.color, marginBottom: 4 }}>{plan.name}</div>

                <div style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 24, lineHeight: 1.5 }}>{plan.description}</div>

















                {/* Price */}

                <div style={{ marginBottom: 24 }}>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>

                    <span style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 300, color: "var(--text)", lineHeight: 1 }}>{price === 0 ? "Free" : `$${price}`}</span>

                    <span style={{ fontSize: 13, color: "var(--text-d)" }}>/mo</span>

                  </div>

                  {billing === "annual" && (

                    <div style={{ fontSize: 11, color: "var(--green)", marginTop: 4 }}>${plan.monthlyPrice - price} saved per month</div>

                  )}

                  <div style={{ fontSize: 11, color: "var(--text-d)", marginTop: 4 }}>14-day free trial · cancel anytime</div>

                </div>

















                {/* CTA */}

                <div style={{ marginBottom: 28 }}>

                  {isCurrent ? (

                    <div style={{ background: "rgba(61,220,132,.1)", border: "1px solid rgba(61,220,132,.3)", borderRadius: 8, padding: "13px", textAlign: "center", fontSize: 13, color: "var(--green)", fontWeight: 600 }}>

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

                          <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,.2)", borderTopColor: "#0D1017", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />

                          Redirecting…

                        </span>

                      ) : `Start free trial →`}

                    </button>

                  )}

                </div>

















                {/* Features */}

                <div style={{ flex: 1 }}>

                  <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>What's included</div>

                  {plan.features.map((f, fi) => (

                    <div key={fi} className="feature-row">

                      <span className={f.included ? "feature-check" : "feature-x"}>{f.included ? "✓" : "—"}</span>

                      <span style={{ color: f.included ? "var(--text-m)" : "var(--text-d)" }}>{f.text}</span>

                    </div>

                  ))}

                </div>

              </div>

            );

          })}

        </div>

















        {/* Trust signals */}

        <div style={{ textAlign: "center", marginTop: 64 }}>

          <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap", marginBottom: 32 }}>

            {[

              { text: "Secure payments via Stripe" },

              { text: "Cancel anytime, no lock-in" },

              { text: "14-day free trial included" },

              { text: "Institutional-grade security" },

            ].map((t:any) => (

              <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-d)" }}>

                <span>{t.icon}</span><span>{t.text}</span>

              </div>

            ))}

          </div>

          <div style={{ fontSize: 13, color: "var(--text-d)" }}>

            Questions? Email <span style={{ color: "var(--gold)" }}>hello@valoraplatform.io</span>

          </div>

        </div>

















      </div>

    </div>

  );

}

















export default function PricingPageWrapper() {

  return (

    <Suspense fallback={

      <div style={{ minHeight: "100vh", background: "#0D1017", display: "flex", alignItems: "center", justifyContent: "center" }}>

        <div style={{ width: 32, height: 32, border: "2px solid rgba(82,196,152,.2)", borderTopColor: "#52C498", borderRadius: "50%", animation: "spin .7s linear infinite" }} />

        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      </div>

    }>

      <PricingPage />

    </Suspense>

  );

}
