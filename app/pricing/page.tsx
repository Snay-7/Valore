"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";


const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold-l:#e2c97e;--gold-bg:rgba(201,168,76,0.07);--gold-border:rgba(201,168,76,0.2);
  --bg:#06070a;--bg1:#0c0e12;--bg2:#12151a;--bg3:#191d24;--bg4:#21262f;
  --text:#eceae4;--text-m:#7d8590;--text-d:#3d4249;
  --border:rgba(255,255,255,0.06);--border-m:rgba(255,255,255,0.12);
  --green:#3ddc84;--red:#f4645f;--amber:#f0a429;--blue:#5b9cf6;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
.plan-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:32px;transition:border-color .2s,transform .2s,box-shadow .2s;animation:fadeIn .4s ease both;display:flex;flex-direction:column}
.plan-card:hover{border-color:var(--gold-border);transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.4)}
.plan-card.featured{border-color:var(--gold);background:linear-gradient(135deg,var(--bg2) 0%,rgba(201,168,76,.05) 100%)}
.feature-row{display:flex;align-items:flex-start;gap:10px;padding:8px 0;font-size:13px;color:var(--text-m)}
.feature-check{color:var(--green);font-size:14px;flex-shrink:0;margin-top:1px}
.feature-x{color:var(--text-d);font-size:14px;flex-shrink:0;margin-top:1px}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:8px;padding:14px 28px;font-family:var(--font-body);font-size:14px;font-weight:600;cursor:pointer;transition:background .2s,transform .1s;width:100%;display:block;text-align:center}
.btn-primary:hover{background:var(--gold-l);transform:translateY(-1px)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:8px;padding:13px 28px;font-family:var(--font-body);font-size:14px;cursor:pointer;transition:all .2s;width:100%;display:block;text-align:center}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.toggle{display:flex;align-items:center;gap:12px;background:var(--bg2);border:1px solid var(--border);border-radius:50px;padding:4px}
.toggle-opt{padding:8px 20px;border-radius:50px;font-size:13px;cursor:pointer;transition:all .2s;font-family:var(--font-body)}
.toggle-opt.active{background:var(--gold);color:#06070a;font-weight:600}
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
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE || "",
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ANNUAL || "",
    color: "var(--text-m)",
    features: [
      { text: "3 active projects", included: true },
      { text: "All 4 asset types (BTR, BTS, Hotel, Flip)", included: true },
      { text: "Plain PDF export", included: true },
      { text: "Deal Pipeline & Tasks", included: true },
      { text: "Live share links", included: true },
      { text: "AI Brochure PDF", included: false },
      { text: "AI Sense Check", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "professional",
    name: "Pro",
    monthlyPrice: 149,
    annualPrice: 119,
    description: "For serious developers and investment teams.",
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE || "",
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ANNUAL || "",
    featured: true,
    badge: "Most Popular",
    color: "var(--gold)",
    features: [
      { text: "Unlimited projects", included: true },
      { text: "All 4 asset types (BTR, BTS, Hotel, Flip)", included: true },
      { text: "Plain PDF export", included: true },
      { text: "Deal Pipeline & Tasks", included: true },
      { text: "Live share links", included: true },
      { text: "AI Brochure PDF", included: true },
      { text: "AI Sense Check", included: true },
      { text: "Priority support", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 499,
    annualPrice: 399,
    description: "For PropTech firms, agencies and institutional teams.",
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE || "",
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ANNUAL || "",
    color: "var(--blue)",
    features: [
      { text: "Unlimited projects", included: true },
      { text: "All 4 asset types (BTR, BTS, Hotel, Flip)", included: true },
      { text: "All Professional features", included: true },
      { text: "Team collaboration", included: true },
      { text: "White label PDF exports", included: true },
      { text: "Custom benchmarks", included: true },
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


      {/* Nav */}
      <nav style={{ background: "var(--bg1)", borderBottom: "1px solid var(--border)", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHMAAABkCAYAAAC1kA/FAAA77klEQVR42rW9aZAk1ZUm+p1zr7tHREbWlgVCIAQIqdACWgBtMJJoLSAk0K4WosdG6hkz9Y+xHus3Uo9Zd//o7h+PZ8+s9cze6/4j/Rn1eyOp26ZBQiAhEEiFgAIBRYGoYimgKKCoJauyKvcMd7/3nPfjXvfwiIzIzAJNlIVVRmRk+HLuPct3vnMOnfOWi2FZYH0Bny/vMKQzAFCIflhIpsBYIEjGYmag2rVI74XBDMh3vbrLvNKUqm5XRRcAiMxBVd1O4t9IRDMEBQB40R1pu/NfmCyUDVQZxhhwCUA9lEsAAiGAYABKABBILYgUgACkUPUAGCAGEQEq4XcAVMOxiAjVQ0Tqn6v3+78XCBSqCoYBkQFJ/ztEBF4ZbBSlX0aSMlQV3gGMSRAZCDwUJYpefploeZlVOsxGZsq8+LZN+C5L/KSqTqnqFAAo00I4tmZKAMEedCqXMNkniXVBRHYAMmlAR1QpNWIPquoUG1eYJHuQaALCBsQOCg+IgjWcL51/wQ6kCeOsqUmFy3elTFcYw/BEIFtdvIKUAQFYGcoKIoQLIYDIQFVBYBiTQNWDQWBDIKL6d6fm5ncdOXbySqEEYAOCAXsGSKAoICRRQNwQJodzYImCjEIjGy4AQdCVIJuPSiDDwhx4cBAmKa8SpodCBSAGwCUUPhxHLZjagCgUBVIruPDCCxXqQKqAeFjLcGVRX3+1sFQVAq0XE8D1OSohCIcZzAwVQD3ANkFvpcDc/NL2lZJmeoUDWQ/vS1hOwPHrbEt7aBHj85++Fuecue2Kdkro9ZbR6XShTPDeg5mRcLh5TBbGEqw1gAEE4eAgC2MMEpOCOew6YwjWhr9rtSdw+OjJK/7if/tvFy+u9PYaaqPwAqIEirAbCRQEQwCRAGpW7brh/4kwUpDNz4wV5KqHQDUsKCEDaBBAkiRY6S1PtVrpjKjAi8CwIEkEvfnp//rZL17z3b/8y7/E3OwJGBBUHAAFVOG9rwUpInDOwUkJ1aBlLLT+XSke8AIlA8DCR+GryfDqoTnc9H/+3zOlZ7SzDMt5D8zhOzyClrJZkmBu9vjfPvy7Xfj8Zz+J48dPIEsI5cpJlGUJYxIQWxhiaOPGMQPGEpjDFwksCIyEE7BBfaONIZBNUJQO77n0Q7j+2quf/O//77/u2rpt4krvFUJRXBRXZjyxKA4oNL6u1KlCiUHx94i/bwrudIRYa44xnyPDKIoCSZLNiFC8dgWxwOdLmNqSLd74lc9g+tB+LC0vAN5DfBnPw4NUIQBIFU4E4hxK78NuJAG7IHhVhZcSKgQlgqhB6RVqge7kG3DrrbdhZSW/OJvo7g1yMTCW4MqGklkpFVl7898/se/ZS14+cgyUpijVgS2h02mBSGEYMAnDZhY2YyQtg6SVIMsyZEmK1CbI2CJlRmIZlg2YBNAS1igS49GZyPD8c8/i6qs/hTe96U3fzfMShpNavWgUYm3XFKCgBUHiwXGHVp9pfnaUgMb9fvjvVQkARxUuo/Y3iAiJbUE8wVAK9YJWylhYnHn1S5+/9ntnnTmF3vICjHowebQzA0gBywDiuTMUlgHLhNQyWqlFK7HIbIJ2kqJlE7RMhozjvTRAlhC63S72PfMsdj+x7/Kk3d3rPAE2gRNF6TBwnaywUJPAUbb3rt88cDjtTEIpQVmW8FIGwYAGVio47gupdkQQBLOBMQaWg0CNIYAEzhXwrofllXl0JlJc+5mrb15cmvs3Tz6sWiKACQoOzk39DKqvFgpJbcM17uSgrhT/Kx9JkqAoHJgtVIDEGJyanf7WBRec80+f+cy1OHL4MDg6aakNNnBiog0RV2uvYHYMrLWwluPTgtMMMCmIExAsiEz/fiYWRBl+cefOZ0U5dSDAGiyvLF6cpK2wGbgvG/YKOLFIks048NL0n/5+3wF0J7dByYRdZywSNuChFU2UBIeBUxibwqYpTGKDUAhQknjzFR4Crw42ZRyefgWfuvYqvOm87TeXbrFLLFG9BhWr4OAAjVKT8f1KgM3nRh+rPi8UnnHxVC+rzxlLKIoCDAIpoN4jSQzKYvl//+pXPn/TRLcNYoZJLExi4aGAYawUJWzWgrEpyASHT8kAbAATPHpPDMcW3mQQ0walXZh0Epy2kbQytCY247EnnsfzLxy9OWl3HvTqkLtlZO10rytKFEXR12wEsBJAbFA4gKh913337b6mLA2MyVDkYWURRY9PFJDg+XGw7xBRCIKeV6Jo08JuMiZ4ua00hWUDqEdveRbqlnDDDZ/70fLS8QVQdBYwqDLWFg+vEsrpCrb+rNIqNTz8ucovsMRI0wSzp2b+4V3veOv2T378o+gtLyGxDAYhtcFsGGMw0WoHxxCDC5OZYTiJOzUJzoc1oCTsUk4tiC2UEhBnuPPO+34Ebt+lZGASBkNrE5Sl6cDCZ8MK70oQLLJ0EseOzHb3PPEMJjqbQpjhHdKEYDnaTiKwAlmShvCDKR5AQOpAcKBoIwwxDBmQBywILSJMtlIsnjqGT3z0/Xjfe3bA50sXExzUC0gBBoPZgNkE94YJyjFcAUOVoDLeFg47QOvt4nGOk6iG42vwNokUzhcgX8DC4Zv/4evYNNkCQ4KQjYUhQmpssPMKWGIk8X0GITEGlinYUEXwL4yDTQQgD2KBtQROGFu3vQH33/8YXjl08p+yZPO9AKDegYkAUVhikCi0EXoxkYIMoErwDkiz7i0PPbTn+sIzOGlBieFVwMzIsgSqCmstvPdIkqRetUQKYg3/k9ZqkZUBx0hNGxYWVgnkHXxvEf/hhi8Bml9mjYYFE3dyPzakehf2bzb3HSQdrz43ukNplfmgegcxh2NbY5AYhmGFK1fwgfdf+u2rPnoFVpbmkNhgCzkKzJANfkb0GwIgEb8PBCITP8cwUCTGQMsc1iiyhKDwyLI25uYd7rzjtzda23mQ2QRHTTWEcET19VPjJrBXB2KGqEKIQSbDq0dPnf3I7n1ob55CCQPTboOtgVeBMaZaBhBILczazafqBhkQJWBqAZqAJQFThixpIeEEi/ML+ND7L8eHP/C+H/QW57+UsADeBS2hWCVAHwU7oBZpNFjQ/NtRghqlbkOs1w/sqyfDhFjOFbDsUBZL3/r3X/8y2gnBF0Xt2FTCDz/b+knKUcBJ1FQMy0lwEJlhoZjIUpB34TjeY3LTVtx55wM4fGxh0iZtKIV4XsHB5oJrO9lc2BzshoaYhwGvgonJye/fvfP+7Sdnl5B0J1E4QZKlcM4FYZLA2r47X+1KROGCCWQYZBhKBJMmcCrR/hgkSQKXF1icn8WNN3wVmdV71RcguBrNCLtztGqkAc92tMrdMFBAleBpYBE0n5lNAF8g7y1c/LGPfuB7H/7gezF36ji6MXRjZtDAdaN2BMmEsI6tCb8jAhnUu0u8h4ogTYPWa09uwsuvTuNXv36AWhNT3xdD8OyDQ8k13gUhgdBgKMWGLMSVSMiDtIguNjAzu/Cbu3c+gHZ7C/JCYqzFUO9gCCAI0sSAjYDYQ1nrJwxDbbgQGIXNGCYxUFI4cSBSpGmKU6dO4e1vvQCf+NgVJ5YXZv/WcrAjAYMNx9TKfmmA1rSKNxUgHQ/VbQzxGVazZnUcKkBRFCAWEMqzb7zxS+j15uGLAuICnhyuGYBBgEAN6vdsGhyXINAoSAPACJQUTDY8jYUDod3dipt/didOzC38V00MShTw2guCM4Cwg8BDWIKAm8JktTAwIDiIz0HkUThBd3Lq3Q898vvJg4eOYtO2M5GXisRmtaqodqRlE57EQa00boiygq1C4MGJgqzUOp5sUE2zs9P44z/+Arqd7AdFvgxVDwMCE0E0gsk0LDSp488BoGGDAl3LC27+LyJIjAFBsLS88P9c/cmr7nzbhW/G7KnpAMM5B5F+aEBxhxJbEDPYGJg0qa+VOexQZq53aZqmsDaBc4LNW8/A3qcPYOd9D19vstb/5aHwKtHEVJalAlUGPeVoMy2Yk3DhFLIIZCxgW1jO6cZf73wYqhlAFgDD2hRsE5gkhVKwBwksLFIkSGGRgikNqy3akCrrkaa2DwFKcAIW5+dw3jln4dPXfOKgK/IvaVztgEQvklapRCB61acZ/A8LbUCQUc3W9kkVqkCe53DOpZ1W8tef/8J1mJudRr6yAFfmcEUJ7xXiGSoGqgYQU9vJxKRIOAkQJ1kYk0R7mcAggWWLhC3KwsOmLRBnuPnmO1EUfFWSpShcDhUCeQMjFuxN/DkFawp4hoEBa0DKGMpwEmK3yrnJS4/CE7LOlu/vfvypyw+8dBhZOglQAjIWSZLUaEbYgf0dYpijSx52K5HCBlwL1tqBNBUD6KQJZk9M49/f8BVMdOyDFDMTTby09pabqa0R4NtGw47B3dtwksAxFRaPC0Wnk6G3PP/opz5+5cKbz9mOYmUR7cRieXkR3geHRUWg4iDONzzuyj6aEH/H2Jtq54jBZCGwSNtdtDtb8dhjT+GhRx6/rdXd9B2hcG4MEzNWBPYE1nDfggAbECgJGFTE9JKG1SUG1qbhUlQBTp78+R33gG0bTqgWovc+GGF2EHagRGFMzDeqD7FndPFFBMzhb8JODbuSASQKlL0FvOGMCdz4tc8dXlice9HEYJvJhosAxZOvvOfgqjPbkeFFP1yiARB+9c8eiaGIozJMlTIThaIEcYk8n8f2bZ13f+3L16I3Pw0UBcq8gLUpvABSOri8B1/mgBQgrbBYiam9EpwoTGrA1oKsgfOKtJUBlmHSDJRkKCXBj/71pzBZ5+/JJHBeA3wID6aYU1JCP8XgIOzhFXAKiBRgRBUoGrBRoaa0DQwnxfPPvfjlR3Y/gU2bpwCy8NpXgzUaFsOVfpzJgFS47ZBjwcH7DSCEIk0Mjh55GV/4/Gfw5nPP+mavtziVGgtXuIHQJ9gxF/YkUzyP8ep0XI5zIOklLgq2r9KNoXhugpWl2We++qXP6rbNbSzOn4R6B8sGRVGgKAp4Xwbb7gPwUT8jYhZSdFLnflUVWacdU1YpPDE6k1PYed/v8NyBV65vdyZ294ocxiTwItGyCGgAqQrerKqv70HUdDLe0wNg0ww2zW751T07b+oVCrYpXClotToI6eX4jywM2cEYi8wqQTIjOgPBq9MINPR6BToTLXz1K9ftdOXc95gUWZb1BcnBoQrhD2CI68T1OEdmrVRYHb8qhWtSgY/f7ZyAycKXrnv++Wd9/+prrsLycg/eEdgaFK4MCQcAzhdwrkDpHUrvQr7SuSBkcfDegzScrzWELEvAHBaRMQZZp4Ne7vDTW2/faW16uwiiZhw85/q6aPA1obL56WgfInwwfNg5hyRt4cVXDl90969/C046ACcQEaRpOiC0piCD85MENsGQl1vtXo7K3xiDLMtwYvoYrrvu43jbhW/a4YpFcJXn8z6wFwxAPNqJGQcarJWrDDcsWZUCI1EkBIjr3fj1r37xu91Ohrm5OSStNpwoer0enHMoXQ7niig8D+di8tmFHeslCLYsS3jvUZaBreClRLvdBpNFd3Irbv/FXThw8ND+rN0JSI9EEMP7sAF0NVo96E8QBAZcv6jVZXQtNNxAJUIhgnZ3y1fu/u2uixZXHFrdzSCYmOYywbYpB89LGKym9mabz6ZAmydikvBZUo9WCvyn/3jDJUW++FeGBSZm4r26OuZ04uH9ePx17d3YvCEGBEZZxp3GYeFkrQT50uKOt1943vc+csXlOH7sFRhOoMLI8xwmsSh6KyjLPAgNvkaPvIaIQCKag5iQVufBKiiKHohCUp5tgiNHZnDzLbfdmLUm/syVGlNuGcQj3NcB3LmfjG+atSr5wOvFZCKAE4aQxcm5pat++audSLNuUFE+BL3Nvx2wjTC11zYsQJBEl4zqzISqYHbmOD5x1ZV4/6Xvuml5/uSX2KCGy4ZVTPgbWhP9GY4fRwo2xs1VKOTLAuJ7X/7qF69H2VtGb2kJTIqyLEMKQfvcqIHFFPO7VYzqvUeRl4BSWDANh2x5uYdWZxI/ufUOvHp05lvGtkAmGUgipEkC04gxK6hUGlBegB89wNq3mTX2V8tZ6hvmFVDTQtre9P3f3LeLXj08jbQ1gXZ7or/zYqoupOuo/rm+AAouet8J4oaKACwBrSwBqWJ5YR5/+qdfA3PvbF8WteoOKjOmjioWwgjcdZStGb0zqc9his5QYghFb+ljl733HTdd+t534uT0MXTSDEXRg4iDKmFxuRd2oEiN6ZZeUYqv3/NO4EoPcQpxirL06PV68N6hLD2MbeHAgVfxs5/fdXaaTd7ohFB6gbLB0tLSeYYZzrmGIKURkEnQhFqxFh1APkgvGFAek1IK+TcFo1RGL5fzfv7LX6EzsRl54QcAZmMIxgQnJ/zPQ7ul6RCF3eahATumkEoyxOgtLePS97wTH/l3l/9j0Vv6Eny4qEDOYxBMbUubWYNx4MB6D+dKIJ4Xk4dlt/iZa67C0vwMypXlYMNcsIHLKz0QmaBCVSECeNcnZfnI7/Fe4ZzAmAzOAVmWxXMWFKVHknbxP//tNkwfn9+VdjYd8RLMlPceWZa9NC4h4Ju2UyPqhkB8477KGJ9NADMK5wFKYLPOSzt/+9A3n3vhZbQ6m+ARKJlKAjKBfunVDUBulfoKuzxgt0kSmAppmsIYU4P4CSewhlHki/jGN76GLJHdhgXiFEwhGVvHi4bXzYo0F1T1c98pCmw8a23w3I3B0sLs37733e949G1vOw9HD78MywbLi0sQCY4NEVCWJZwT5L3wv8uDkyPi4NShVxYoS4+yULhSURYeRVGgVxbIywKtziY8/cyLuOOue6+Y3HLGBYVDYB6AVpms6lybmq5vZgxULAgtqJiQNalXMslYdaQaD2QsFGbhpz+7A5y04HxYjUqBXpG1EtiEayohsQ6lyUxcSah3tHeKVqsF50LM55zD/Pws3n3x2/H5z119cGXx1N+2bAITEq+rEtGnuxMHVDIrRB0sJ1Dn0crwg09/6qNYOHUCKiW8d8EuwQc1K331GnLABBEAXmrP1TkHiVokz3MYY1AUDkQGpScoW/zrv/0My7l8GZSAwCNt/XrXRBEFCq6HgiuwQBswWjP2ZA7Bf2YTMBuUhUeaTdzy8O4nr3n8yWfQ6W6CICBDnFiwCQwBkNRoT1OY1e6obypCWGI4iagOo9VqITEGiwuz+PoNX8CWLemP1ZWACwnxvLcMNgYgWpcLtBaVpIp7DQFSFvD5yseu/ND7Dl5w3lk4fuwwsiSFuAJeSohTqFOoK8MzOKoQ17eTFFV/MydKFFQnwWCl55Blm/Ho7n3Y9bvHL2q1N31HIoW1CtmGgUohrumoEumbkVUQU0cOoBKgYnWcOYyB1rnFePbee3CSQGy265ZbfwmhBEnWgRdGK+ugjIxwYwyq5CQb1LFmP4NPA8F7WZZIkgSAwPsSWZZgcX4O55y9HV/94vXP9pbmv2GJIGVICCepQVmWpwWyr37PB/VuCd710E7NvVd/4iOYPvoKrKE6XpSIu3rnIL6E+LJhG/2AQFUCraX6naqgV+ThvlAGojZuufWX8LA5p22obOTseYBxUTH46/iTAk2Hifo0DAbVJEeJP4kICIq8t9IVX6KVpnCeYLPu4hNP7f/ugw/twURnKwQGXgKzjpM07JzaE6OheJMGTpNEwYnt5wUhKIoCaZpiYf4UvvbHn8fZb9y6AOQgSKQ+FpFstrbNXMuzrV47VyBfnnv04x/7kLZTi8WFOVgbVGQpZYglfRmAdN93dLwPAIDzBcqyRFmE+FcEEVRYgZccIIelxWVMdrdh10N78Pvf77/eJK2XnMRzEq1BixrXrZj8/QKMAZIFazPlEEpuImjAqwxvlStTVRgoLGHRVkVAqijFgpPOP/7kpz+/eWFxBRMTm1F6hPRZzNxbmwLMfXVmzJC6jUADhTKGcMoebIP69GWO3vIStm6ZxA03fOHmudljx1PDNWRmrI2BM42NddfGbsMic0V+2ZvPPfOmK6+4FCemD8NySH1VNI6A7lTITtiJ3ns47wEJT4kIT1kGJEjUBThPenCuQJq2sLxS4ic/uQOi6QxxAOoHzAANqtjxyBUPaDWNVFEeFVsOcmjCz+2EYQnwZTDkDkDamXzp+QMv7/jNb3bB2AzWpiFsiMFzxY/pE6T6J1kBAYYsvFd4X4JYUZQlevlyYNIbA3WKmePT+Nx1n8JFO968d2VlBZYsbGrgfHFaBK5VwEUMd9TLjg9/6NKbISvQ0oViHQQ2XkCbPJwroC7UglQ7z0tUwRL4OyFMqXZtCS8FevkiiqKHVnsC9/32IRw4ePiirD35oI9EOUEg8ATGnoxJ7o1HsoSCJyxIwYEmokPlM9w3tBycowBEK8hwtAUKL4z2xLZ3/+wXd10/v7ASgnkBUhuCfKcyMh1V7VQiCiGKhmSzcw5sIoM8D8lfJsXK0gJSq/iTG796VZ4v/NBYrXOHqn5sdmS1tkEd5/YdIAtj7M5ut1s7LsYQSpeDbZ8tqFGl9oGCgMcWrm8/oR7qHaQsQuK6dFAh2KyF+eUebr7t59cTJ/tBSbjWWBzQpK002QP961oL+AiUUCiBoQKqdiRF1nUjISwi8X2Oz0gjRPDkNOvilen5q392+y+wZbILUoE4D5MkABG8uprcBe7jsIEtwIGLGjFRgwAQu8LH/J2HFCvoZIzpIy/jE1d9GO+95C03Lswe+e/W9mFCga+RGNaQfa/SZX0iFEOU4EUhWsWYMSYmc+S++x89aJMOhDy8Fih9GWNHwPto0+Iurb43qOGA7uT5CkQKqFsBSQkpSpAYFCWj1dmO2+/ciUPHZr5l2m04FVgmkJaN84hsYzLwSrVW5Mi3gmjNvA+QnsAj2lnyFfNCNqSaJKaL+qmXAASUTtHqbvovd/zyV+cfOPgKNm/eAmsDky9JEiRJtgo4qOLW5iqv3XvpM+fVC7I0gNqQAqo9fP3rX4Zhv0CQwBMSGVDbzTrIyvavx3a3NsXRI8cveuGFQ9i0eStWesuh1GIIPFHV2hZWTlB1bcYY5MVKoN7ETEpZKmwygVcPz+CenQ9sb3U3f670ijLafFYMlSxyXcjUP7ZfkyXR50fp+kD7sDfY/GKmQOIlIszMrvzoZ7ffDZN24CMRSpxGHJVBKjW1vnbpG7WJNRyGJo9V0Ov1IlOBcfzoMVx+6bvxgfdf9uf50sKX1LtIkaQacK7sV118JNSnDlHwzCkWuSLWtRhjUJS64/5dv4NJOhANgbxzDuIUYQNQX6ARrguQnYNSyIFCKw/Yw6YpCi9odbfinp27MH1s5kSWtoJqNYAxSQ3anw7gsVYczevFY2sdQFXhyhwkhE2bt1/5q3sfnHx87zNIO10YTkBCUN+A0kigvoQ6hY91i/1d4wfwx5pUJVTHhEWRo8xz3PDHX0bKuteyIDEh/VYJv7Lz/XK9eJkU+b3kB1JgqgonQLszuXf/cwf/7MCLhzDR3YqlpZVgRlylWgEBwamDRxCyetS7syxLMDNKJyC2KFXRntyMF186jN/e99Dl26beSHle1gtTKYAOo+x78/6O8swHiWg85OOOQUpGxWyr3ouOUikWc8vupv/xLz9B1t6MldzVgDRp2BXVyg431gSaYhTiMFAdUm/93eu9R7tlMXvqON7zrh346JUfeDZfXvh6FfIEknHgrkpsdaACUF3OEHyDiqxdXTrH7EQpBOXWrvt3PQ5QG2WhEA94X4bYMu4gkQbCI8GBqnhDwalhlBAs5x6cdXDn3fdhcUW+wTZr7EKJpf5m3RrT9XZrRfMUAsy2rdvWVK+jmj40309NIFd5YiRpeserr7x08O073vaFt114AXrLi6HegjTwX31gqYeioIo8VXnG8f+YWlIfqI4+4rVeHAhA6YIKvfAtF+Lue3Z+s/RUiDKIAGaqqs8xkEAgAORimFUlA2NsHZtcEAzSxE6fmJ6+/fw3n/OtbVu7KFYWQSAQhZxnn0WuIJ8AGnoqiEpk6HkIKbwSOlum8MLBI7j9jp2TWbb5Vi/9fg8BIUsCjKfx+4d241oV4H0KjoFWFXTN5PRGQOnm7q3ed07qAhuTpKBk4p9/8MNbUHoO3Fr1gLiAaypFDzAiKhLirAForNqh8VhJksRdEOKvdmIxf/I4zj/3LFx37ScWoC5CjT4SqWhAPQVmikRAmkebECaQNSgBeCQLj+55CsQtKNmGg+YayI/EMCUABb50EFfUPQsChmNx98770XN0hYOJu7yiweiAWRhFd9nIBhv+mdcDpNf6girJXJ2T8wpOJrDvmef//J7fPICJ7pa4y1xk6gXnp1f2Iq4qq7zF/nFC3rL00mciiKAol9HOLE6dOIbrPn01JjKL1AbAo58asoE8EGPogetSXnXjgjPmIWAk7e7+Z/e/eMn0iTkktlWVCkdqiEAkNp3wAkT7F5LIEpMLCbLWBA4ePIy9+567KWu171IOleEQheGk5g+HKjG/pkDXsqf9z1JfmKO4M03qw/AKqoQSVqnW5GlSQJRg0ol/+uH//MnOk/OLAEKDh/oYxsJ5BcQB0qclNjFHEh0sIIql3t47WBNAcV+u4A3bN+GLn7tWF+dO/JBJkVo75AD5+iaHzDzVcWiFRnEMa0RCHwcvQO7ost27n8REdwvyMuxAZq6zH+IDK6EsV+CLsm4340pB4QQ2mcBtP7/rH03S+r7HEFfXh3QZ1EPUjVSfa0UYq1kVDYh01JcMC3atL+WE0St7sMaEmM8YkMnw8qvH/u7nv/w12hOboBrQnTxfgcYSB1WFK/KBHTkAYEc8lIiQ5znyPG+oJoH4ArOnTuDTn/oozj37zH9WXwSMtHQ1utJ3tmhgV/avUQZUcgiNCN3Jrf984MVXL5+emcfE5BY4FeR5HrzWvIBlExAiExykPM9RekVeOkx0t2LPE0/h0KvHdydp56V+34fmfTM1Q3GjBU4byq2MxCtH2MZxwhwInJkDhEWAcHLwllt/ecWR4yfR7nShFAjTKyt58GR9CRVX0xQr8vCwcPv0kHi8MqSg1DvkS/Poti2+cP3Vd+bLCz9keNgkNH8ovQNbM4R08oji3djAyZcwhmrtsbBcXvbE3ucwsWkrPLheYEQGvvB1qq4oCsBY9IoSniycWtxzz33fZNO6uWLbVShPXU9Z2/PTE+ToaCI8lSTWZ26QDT5Ktws8bJrEVFlg2IkIupu2vnT42Mw/3Pbzu9HqbkGV7nHOwRXlQKVVE/UYF2s11XuFFIl4nDh2CB//2Ifx1vPfdHbeW/wYI4D2VVnEeo2equR7xURkY1CUJbKJzd/ft//FyZnZFaStLkrfhwurPGplPkK6C+h2t+HRR/fh6PTc1WlrYrEJCFSxcsVq59NsQjXObg42GxvDAh+1S0d9WeVtVo5AYkMDqJXlHN1N2668/c6dk888/wpsq4sid+gkGVzRg6Uk8nkCY6DRTCDsUB/SSt7F5LUTFKULDY8CLwIqDr3lBbAU+Px1n7rKF0t/Z2zob+K9D3gsaKANDYb6CdUFtUmrDvxhLIQNFnsOjz3+DLLOVngXPtvr9cBRI1V0ElcKlFLkzmDnfQ9vz9qb/6QsgrNTw6FRM1V4amjx9toaUY0E3OvK6XH8mDWqkps7pbJtWnuUjLL0qbEZTs0v/+O/3HI7smwTjMngnQPHXVrlPisV1oTL6vZkZbmKD+Ndn5nH6nDy+BFc+r5LcPG7dly1tHDqr9I0rRcY1MQamlHV1hw/Z6FKyJJWH3tVgyRtL+595vmLFpcKdLpdFCs9aOT6VJmj0D7NY9Om7Xjokd9jdqH4K6U0UHGGNE5FlwwLkRro1vrt4kZpzOHNx2MJzGskdpuf8T68drHCS52ABEjTVrGSl8gmt/zpfbse2f7Y759C1ppA0VuBIQ91BKit6YXOuX4FVqP4pp+J1wEvuhJ2ZhO4fAXqC3zuuk+DSXJf5EizUEqARhZIg6scAIyhli4acWTvPZx4kDUQTrC4VC7s2/scsrSNsgzt03ysy/RQuJgVml/Oset3j5+ddrrfIU7rcM3EbpmBOxNDFA79IwapIOvTXEYJtarNrB2gtWsx1naAqhK/cIP6YUFooGhBnGE5l7+6+ad3AJSBbRLSSlB4VwT6YH2SBAHFtFNwcqwNzkfRy+EKX69mQaQv9nowhjA7O41LLr4Il77vXd8ti5WPSVnAUGitGEjY0lC0/Xxt1ePIGBNUKIfOWc6HtBSb7MgTe5+9fGnFgW2GpZXg1boiD2q3ADZtPwsPPrwHRanXAzb0RdJBDdCE39aLIDZSKDyGf8A1Obnv7RFGvV+9V/fj0dCfx7uQ0AUcQopBwWQATaDOYKKz7TuPPf70Vb/b8zTsxFZ4TuBcD97nEJfXWKl3FCutktDtSh2868U+CjbWc1QJn1BaX69Uv4TlxWl88bPXoGV0f6qKRAFxZZ2iCvnMWNBECtFexIZLlBLtpTLEVw2rADUJjp9c+PrjTx1Aa/N2rJQeHgpDgMsdsskzcGRmBb9/6tmLsnbr+0QBQbdpirx0IWlQ3fyY2qtqIJtFyhvhKo2KM5Wp7ijGa5W/raWnV/1NI83UDAZUQ9zpxEz9y7/ditIzlgsX6RIC5wuolz4yQwRfQWjqIOL7fV4bMZtWDAnDKMsc1jAWF07hTWdP4YOXv/twb2n+uoSA1BpYE1umsY3prrLOg1YaZYAcpY08JggmbX9379MvbF8pgHZ3EnNLywAIeanYvPVMPLxnH5TtQY09DUR8TUjTusWNb/QieO2PtdSvmdq2fc0/XEvFxhcxT0hArO7tp0ojcO4dUsNPzxw/km6f2vaRSy5+B5bm50B1M17EUnEN7dvExyo0iV2yQteP8NEKAJDw2kusMI6hEQjnX/BWPPTQnj/xYJTeh8JcT7CJhfdFYNrDwKhpEDKoZsNVr0IVuMCQLi4szv5/WzdPvvPcc8/G4vwsvPeYOuONmJ4rcO99D203Jl0MmZXQYcxL1Ye3ctYrQLy6d9WGEfyhHutis2s5RhSzISN3a4xmmUNHL7YJsnb3b3566+3fXF5xNTVTNWZUJCSWpapErivDtJGFX53MrnOYFJyO+bmTOOvMrfijP/qwLsyf/J5hDJTjizgklqNjYldVkY1Udcxodya/8sSTT10llMBmkyiEMbl1Ox7Y9bvDymbGV2TyaH+TJIFERv84xt3r7ci5qhRjoLJog88+83q4VURlU9EvqDWItH6CNRkOH525+rbb7kJ3yxlYyl2j6CZUG6v6WKRTDpTJeW3mFKV+v+KTuqKse8rNzRzFH330/ThzauLvSDwSTupF0y+dQKR59klU0b2vnabaoUPgQJ2YXbh6/4GX0dk8hS1nnIPnDx7Biy+9+tdp0oFI8IattchdGRcyr0Jqmhg0/wE6qw5wkNeC7WgM/X9jKFGMqSp6CAFeCa325J/84q5fn318Zh5ZNgknGrL5UsZwpB+/ldG2VSmj5nGb6E6VzDZkYaDIV5bR7Vp89rOfOLyyvPAP3pcwtp8aq7L96yEsVfmEEuCEkLQ6f7P78acumdh0Bia3vhH3P/ToP6btyX8unYJNFhYm9VkPVA8IiL4Eyap7d7rNp9aijvLpbONRLnJgwffL2yuko/n5LMvgvaJwHknaxuzcyrdv+8U9SNqTEDWBxul93cRJ0Y8jpWpsJP1JBzWWG4UT2m6HFm4hlCyxODeNKz74bpx33lmTRb40xeRBKnClROQpeMR14+KqNkR8zH+GzpMSBwrYJEOSTeD4ydkrXnj5MJ45cAiHjp66y6btsJA4iV0/pO59VMXNFVz4WnbkWqHhqvfecv6FYykKzZ05jurfLJPr0zGkzuQrhdSQNQYJE6AlxOXIEsV/+/Z/1jdsNmANrO/Qv49rgTFZgA1cKf3dpAF7hXgYG6A9FYK4UPtPYcQDVlwP2858Mx545Hn84H/c/Ne2Pfl/kMlQFKHtS+3EGobA1ypw+EYLAdZaiLjQpls9siyFIcXC0goUCZjSmojWv5e+xmOrajOVkIKrioYryuR6yejhtjfjHFMe19RhI05RlRitGATBGfJ1cCxKdWGstRYrRR5uPjOWVvzFt99+N9qdzVhaLkKgLf0+PBVJq8qY1A2ktN9fqN8YwjXSWA6+LGCIcezoIVz+votwwZvP2KFl+UYSgiULeAmDAKqmyDBjW5VWXKUww8RCKEEvd1hYzqEwAAeQIFBIeERFQAQ5/MZCjXGh4LiRHsN1OxsicY3V7Tqot4mHk9wI8Zb62KkLABkIkpk9Tz5Ne59+AZu2noleIfGm8ED3ZfUNG13VSEaQupkrHKxaDlgvQ7C0dBzXfOrKb7p8+SajgtRmIY0lZV0kPC4or4J6jaFWcMAMvAbBamwu1fTgR/VSWI/hOC5i2Aj4Pmjy1gHYxwHxdf0IRtsAUg5kJQVUQnIXAJwKnABZq3OkKOW6n93xKxTC8EggsChciTI2SHLO1fyfACBU+c2yXyLh/RArItIovAeTYHnhFN719rfiXW+/4JtlvriD1I8BDDDoqPAwKlNpG60H8wzshYFE8yCxufkMtSE0sqZkuJZVhwqL1+XNrtVLZ5RuXr3Khl43s/mNi6rUZHWypXi0upO37336+Z17fv8Mtm47A14CPlup5sBNjY6Q83XoUjcXjrQTiALexe5dGCBpGxUsL8zi2qv/CAm5N4rPQ6tV7g+QAcl4QLtJadTBa+wDJ9rPV6rfMFVVCOvi4q8JNBjHDhulZocD9vqrtLkKY0yqAkuAjSMiFBxx1zBhJ2l3b/zlr3buXCkFZLI69quYbNWuC+xyH/va9dNl8GEAjKKMGZGoDkWgziO1CZZm53HBm9+ASy6+cKcrly+zNpbBDfUlAgIr0I8qrZd+9qaZsRi9CPyIHcUD8WwTl+1PnOg/qwzL8PvDzwFNuR7Nb5Tgmmq2ry6G55E04k2S6ERQpPV7JFkomU873SMvHDx0cNeDj6A7uQWlaGjWKxqKh0RDZVXEaivEqXlO/Ri0KqULatgVHuRCQ+KF2Wl88uP/Dq2UTpT5UiwxtKtw2Y3kFCkWCDcrmfvzyGQd+8jDxJ0NEQE28lhFgh6H4K8KUCvdXgPf1CcY192k+s2CDRnYJEBuXsKkAIVCQ8x3z8kTx2YufudF17QThjgHG0Me7wUCgWhs8y1VnNnPRIiGriEBmHCh1lhQ47zWMpaWc5z9pnNxcm7+Lw4eenWnSbsvSX2+VX0yBqq9Y//wwfswpNKkMURnsI1Ns0wveru1Wo12l4G6cn2N8oQ149DGZ3k87trPV1YFs4PdJaWeZzXKGxv+ThFBnpcghPrLqqBHldDKJhYPHT4+tevhPUjaHWjk1xR5XtvB5rGH6Z/e+7oHvGpAm4jT0PAfgC8LZClj5sRRfPLjH8FEJ9kNKcKMFlSdI7nRp8hEMCT2x2ruTpIBvu9gjL2G80i6ZoXAhiKHdTxiXiuTPYqltwooJjPgnSmqaqygWqu6Q9esCo6DbtSHzpSuBJLW1r/5zf0PZ4emT0BjOxd4Fxl8BWIlQwg5YuLXOTcwyqoe1ai2Lg+XGNqQlsh7s9g8meLKD1y6UC7PfqtlHQwF1Qxw4PNGU2GEQU5gJDTspRj4E4U25UKBK9RPyPfzvBUg0BeyrOokEl5SPc+lZtn5vlNXTTmqULbqdfPZXBi8kQzJ6TUaXH+qwQAp2Em4MTbDwnK54ze/fRBpZxNW8rLBIu/33ZGqZUuDLxQmEcSf426vwIaqaCgQqBWzJ6fxwfe/B2dObTooRQ8qDq1WC6KKJEnhGtTRhGPLbPTbumiDh6uCOrGwVuHVOKLzqHBwvfBwLZYen85WHsd830ij3nEnJ42AH+CFxx59+qJDh06i1ZmAk0BN5EbWgWJ1d40FO9+3XiI1R1XE1QToUKIevNHl+Xl0Oxmu/OBld64sz/8wSRL0egWMsYH7YzjiwB4ODh5hysHA9EAimI0U6rzGVNZGQpNR951fzwE34nmt1Qs2YJa1ykyztPNSXtBlv975MEyri7KR8SfRVadck4hFozqSWPbg+i1WxYV22BpacEM9jh56Ce+55CKc84apu1wEMyq1zWzgpARMcKaUhlN+fbVXjQgelXlaqwHjqEkN62WiNvIZs3XL1nUFtxZPZSPGem3UPzhZBHgCYGxn75HDR26/4PyzvzU1tTnMDvERwgOF3ntVd5woJBWJZXuoGykxASJ9gIEAiBcwE8qyQJa1MLlpyxf2PPH01ER36x3eK9iaGu6woYNGECEH9RC+J4xcZjWx/KGisGDdPkSvBQwYtTjGmUM+XUGMa5j4WlM6gQHgYK1F6RVsUjgxUzvvfwScdEGmD7BDNbZXCXBhLaSK6VWv3IY9NRw7McedJR7dVoKFk0fxzredhwvPP+eypfkT32CEJg+ILUub/d9Ho2G64bkpa3FgNzp0bj2GXs2b3ahufi1B7XocIjKoObPGJChVkE5uvuvZA4cvefLpgzA27Xus6mvCWEXN9K5RdORkIHSqvdyYrwzaUmLTfAcpl/CRK953heWyMCggPkdsvV53dW5mhyrwsi/cwdhyHJNuI0D5mhHDGALBWJs5LtYcJ9SNxEPjajqbD++D06FO+2VzbCHU2nvPzge/6Sk0cugXvPabKXlfTQ8Is1mCE0X19wKhnWgr69QcIucCHzdLDRYXTuCtF5yNd1x47o/U9bqs4XdodCoZrCDjug+Cxk7WyuM9/o3OJNtIVmXUAhnepWZq29SGZjiP0+NV0nh1L9fRLvWqxRJL0w0FegZZDtPh2WBxfm52spP8xYUXnIvlxTkwB+Y8GwNxcXJ7xQuKvWOrgeMKhM9ymC4YKq+rknMPawJSpQK84aw3YPeeJ15qtbu7XTW+AxxzCIzaIMcRh0wErvom0PhdNmoBjwtH1gPlN2IzzbatUxtaNePin1Ex6UYcgWbGgaLtCw6ixB4CBkw0NzN9+Mh7LnnX9SI5mIBSfChn12hvvdSwWuA1RkqI9qmNoQ9f+L2xEZHSgCyVrsTUGWfixMz89a8ePr7TJu2XyNj+olSO3xK/vl6AUfs34LixC3YEe2O9z61pmsbseF6vh/lGDrAWYrSuMY8J5oqSSI3G92xTHJ1e3PHgw0+iu2UKS0UP1qSNwp1Qnu7U9RtSaGhxUM0SqacZVHlEtvCKWF0GuGIF+coiPvqRK5Fm9sFKNQ9nIgLExwN5TxlxP4a7dm70Pq53jzcC9fFGPdL1QIFxCMhGCpEqexbgsj6WCzC6m874zv2/23P+ybllJGkbvV4RbWIZk9d+oA/CcEZFY3/36iZX6FH1ZGYsLi7W448LVw4JRKOXK4PMfeXaNq913aM80I0K53QJXRtuUHE6BzqdeKomNlUqOpKyqtFIDgYLy/76+x54DBPdM5HngR9bTdYVSGOyQBxJ6ENX5kBCDgKtbGhRlmH0Mgi9vESv8Gh1JnH/Aw/BCxcCC2NTlL6I7cxC/QwPsShGp/teX5j3WnfvWARoWO2uF7SuZ7Q3WmWmqg1QPGQqRBW5F9j25D89/uTzlxw6dAJT286s+wvU81Eq6r/oQI4TXsJkUN9v8FtRUcQrytKh1e3i6IlTeHr/gcs5bUVBxlJ+NBpcxObnw2V4w10716J1bGQDbAS2G7f5+HRIuOt92bi+CGvFrf0UV8g6VOu9Pl5iIGDkhS12PfgEmG09JbAqa6DYeSf0HIrJ4/jd/ZlcQaAVmy+ERAlsMoFHHnkCudfzREMPBKVQ1idxCgSpDAykAcL8Tx4zi2wjgPtr4fic9s7cSBrstQh+nN2t4kGiMCCOKczpqGA478swszPr7n/2uZevOXDwVXQ2bW1UaVXfLXFaugyUAZTiIz2kz3pwpcCJIm1N4IWDR7D/xVdvbHW33EI2iXWlgcbJcQBsP/wYzRUazOysba5OJxuy3r1bRegapSr7fXR0VYJ5IOMx1HZ0FHF6HJhcvR8aHFHUZAZS91RVMCkoAuaeAUmyu+57+PdP5j6FpwD/CcXB3QqIL2p4UAyhp4qSGLl4FLGyu5+hAWBaeHD3s3/u7eYfr/RcHLvMcL0eLCcgDR3TnTBK8QNzRyJLuO5ZNPysp8nzYIvU1Q4Tx66c/SHmw+BMc9EMbyxLIYXOOqbWpPlFa62MUSmwtVTCWkFyzepTbtRH+khWDuOnyKR4+cjMjc889zKyVjeA7sohhmSCsTZMzYv1kSGejHNATZwSJGGmVzaxCS++fASvTs8+SLYDm4YGFYaBLLWAaBwex/1cyQYbLq0XBaw3cXct5sdatbOsY4a+bBSx3ygsNd5JkIaTMUjfbPJORcKMj9JT9uieJ75feAuiVnR6HPK8QFFK6KmuEiZOhYAS8CXYK3zp4vyVFEItPLznqZucYEc/bJEBaoq1dqSQRgIB3J90OMy53YiDs565Wo80cFr5zD9ExmRdngsNCpVjv1GNY+lUDFrt7u5DR2Z27n36ebQ6m+Gch4FBXnqsFCWEDZyE/nkQAokArozNi4Gy9Ni8bTv2HziCV46e3D7R2fTjZseUZknEcKXYhib+nSZv53Tu+7jNNeDNjnNy1nJ8xgHn6/VPXVUMU/dLDZTp5rDw/nlE4ZBFURJsOvnjh/fsu2pxxcGaFrwXGBtKzkNT3qrxE4EjZbOqX/HEKCXBQ3uePtu2tvyZE204Yf1yP2PCEJzRdMqGXmmOaT4NYa1VDTauQGgk04P7WoFfT5D6h1qlgwy20X8fOpSECa4maeHUfI7de55G2prsd//SuMMM98MeUSScxAbBHpu3nokn9r2A6VNL3zLJRMihRuE1d+Oo7l4bQcI2eg9eC4Cw3pgs3ojDshH6yEarmVZnFmhNclL12sfdZlsZcg/Y1sS9j+995qJjJxcAm6F0OQx5lDG0qHBeiv3bnXOAzTC77PDY3v2TWWvy70snYRbL8MjfeiSGGQFy6wDbblgVj03CD3m7fyhqzqpak3Gg+bAK3qhQT3dlDv6N1Kx1isW8qhLnTcdpQyrwQljqldft238QSdaFEiHLMti6Z17YWZYZRV5CTYLWxCQe3/ccTs31bgRbWJsM8HAre1lPD2wy/EbOSKF1d9nroY1spD62ea/N1i3bhgpm+xOBNpJcXTV1b8zJD6ygRuxVzX0mhM4cVfqQo+1UxIl0iLNIKhIYA2maPDh97Mhd55579n/aurmD3vJisHkxfi2KAj7O/RSTYb4k3HP/HtKku9uYFGVZ1MNyRsFza5XKr+eMjIDaRvseq2ZmrhZa8zyGq8QGJiCOnzUtY+3GRlI142LLNWNNjKnHQLP9SpV8Ds5MLjzz+L7nUXiGkyZ7Pg9Jc5vAE6M1OYU9Tz6Pntgp5dAsODW8rvpaKwwb/v1GkvuvJT02DiId0W3k9fF+Tic8GX8hNNCKQ+OYDKmrpgJMx9TPeyoJlAi2Nbn/+ZdezY5MzyFtTaDwDoUrwsRZAVZKh2Sii5n5Hp49cJg4ac0om5qOSTJcQ7kabhyFvIzLXY67R5XX69GnmrzebMmawjzdfm5r2ctxbPjTWSSjVUZlT2P5AVmsFLTjsSf3P5t7C+cptnExcD5kXSidwO4n9qMU0zWcBCck2ta1NMVGwPPTrZA+HdV8uja2rgJbj/Jwuj1QN5JUrTpVDRAYQ0Kz7vjFGrp+MSgC3lWVWb/TlWWenjkxs7Bl89YvbN0yCV8WgBJ6pUPW3YIjM0vY9ejTZ3Nr8mSYxuGRMsWOIwwM2MbKPutY9kBTwByZ9oLT4xH36yuH/RWsmVlZy1bzRlhgr1Wnr5dVP11EqXLr6yKbqhkjp4Dt/PjJZ1+8SiQFcYperxdiTxg8/PjebzvwpHiq2e/DzsPrCRXGNS7caJvR041Rx30/v1bawlou+lqY7moBjZ4bqUO9AAaz+/331IemT6Y1WRyfXb734CvTsEkHxhLa7QwvvHgIr7x64uyk3dnvVcAIrda8Ak60Rm/WMwdrdZckog3Fka8H4hvVdWRVbF4deK323huxo+t5feM6fK23mKq6/2afVq5wO4TJPcaEbs8ma+Op5w5eUSCFmi68mcCzz7/yZXC6W5yPBUgytu/RyExEI1QZdT3jshvjhD5OU21kMM260wZVpI7jVLTeE0I4bbBgHK1wuLa/eilS4bHcj7Eg0Vw1immHdzv1U1Lee9jUAFICBBydXUj3HTiG97znHXhq3zM4Mbeyv9Vq7wUh9howwRuWwNQLWGwz9KnOhUesfLNKkIHk12fNN+HI5nSJ4fgQ4JEYN43BeddagNX7dqDV6Kq4bn21MHyAJkCwHh1iFNfodHFgiix4iEAN0Gp3792z71l647lv0X37XyZwikjIjb1fY/3lkOO11vVtVA2O+ptxlWH/Kx604/y3NjKIg+qtKZy1vNZxkODoncxjBUkNSuNagh5Y2TF1ZpngpQRr6F2XpimKooDEtm1VB7Cm6q7LIVZ1BcHY6xuliZoDb8ZpptXXMNq/GK5dGbdoRrVi4+Fuka+lMmmcV7tRsOF0KJ7jjl8ULvYaCpjq0tJSLLLlgTmTQq/NKXmt9amnE2e+3sf/D3FvEvLWGrX1AAAAAElFTkSuQmCC" alt="Valora" onClick={() => router.push("/dashboard")} style={{ height: "26px", width: "auto", cursor: "pointer" }}/>
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
                Annual <span style={{ fontSize: 11, color: billing === "annual" ? "#06070a" : "var(--green)", fontWeight: 600, marginLeft: 4 }}>Save 20%</span>
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
                  <div style={{ background: "var(--gold)", color: "#06070a", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 20, display: "inline-block", marginBottom: 16, letterSpacing: ".06em", textTransform: "uppercase" }}>
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
                          <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,.2)", borderTopColor: "#06070a", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
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
            ].map(t => (
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
      <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <PricingPage />
    </Suspense>
  );
}
