"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import CopilotPanel from "../../components/CopilotPanel";
import { downloadValuationPDF } from "../../lib/valuation-brochure";
/* ═══════════════════════════════════════════════════════════════════
   VALORA — VALUATION PAGE (V1)
   Copilot on the left (context="valuation") produces a property
   valuation via suggest_valuation. Result renders on the right.
   Global-market support. Session-only for V1 (no DB persistence yet).
   ═══════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0F1115;--bg1:#1A1E26;--bg2:#1A1E26;--bg3:#242933;--bg4:#2D3340;
  --text:#F6F4EF;--text-m:#C8CCD4;--text-d:#949CA0;
  --gold:#52C498;--gold-l:#72D4AE;--gold-bg:rgba(82,196,152,.10);--gold-border:rgba(82,196,152,.28);
  --green:#52C498;--red:#F4645F;--amber:#F0A429;--blue:#5CA5DC;
  --accent-gold:#C9A84C;
  --border:rgba(255,255,255,.08);--border-m:rgba(255,255,255,.14);
  --font-display:'Poppins',system-ui,sans-serif;
  --font-body:'Poppins',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
  --ease:cubic-bezier(0.16,1,0.3,1);
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);font-size:14px;-webkit-font-smoothing:antialiased}
body.light,
:root[data-theme="light"]{
  --bg:#F8F5EE;--bg1:#FFFFFF;--bg2:#FFFFFF;--bg3:#F2EEE4;--bg4:#EAE5D8;
  --text:#0F1115;--text-m:#3D4351;--text-d:#6B7280;
  --gold:#2E9E72;--gold-l:#25855E;--gold-bg:rgba(46,158,114,.08);--gold-border:rgba(46,158,114,.28);
  --green:#2E9E72;--red:#C24844;--amber:#C57E14;--blue:#2D7AB5;
  --accent-gold:#A8843A;
  --border:rgba(15,17,21,.08);--border-m:rgba(15,17,21,.16);
}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.val-nav{background:var(--bg1);border-bottom:1px solid var(--border);padding:0 16px;height:56px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:100}
.val-logo{font-family:var(--font-display);font-size:18px;font-weight:700;letter-spacing:-.03em;color:var(--text);cursor:pointer}
.val-btn-back{background:transparent;color:var(--text-m);border:1px solid var(--border-m);border-radius:6px;padding:6px 14px;font-family:var(--font-body);font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
.val-btn-back:hover{border-color:var(--text);color:var(--text)}
.val-layout{display:grid;grid-template-columns:auto 1fr;min-height:calc(100vh - 56px)}
.val-copilot-wrap{position:sticky;top:56px;height:calc(100vh - 56px);align-self:start;z-index:50;border-right:1px solid var(--border);background:var(--bg1)}
.val-main{padding:32px 40px;overflow-y:auto}
@media(max-width:900px){
  .val-layout{grid-template-columns:1fr}
  .val-copilot-wrap{display:none}
}
.val-empty{max-width:620px;margin:80px auto;text-align:center;color:var(--text-d);font-size:14px;line-height:1.65}
.val-empty-h{font-family:var(--font-display);font-size:28px;font-weight:700;letter-spacing:-.025em;color:var(--text);margin-bottom:12px}
.val-empty-sub{font-size:14px;color:var(--text-d);margin-bottom:24px}
.val-chip{display:inline-block;background:var(--gold-bg);border:1px solid var(--gold-border);color:var(--gold);font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:5px 12px;border-radius:99px;margin-bottom:16px}
.val-card{background:var(--bg1);border:1px solid var(--border);border-radius:14px;padding:28px;margin-bottom:20px;animation:fadeIn .35s var(--ease) both}
.val-card-h{font-size:11px;font-weight:700;color:var(--text-d);letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px}
.val-big{font-family:var(--font-display);font-size:44px;font-weight:700;letter-spacing:-.03em;line-height:1.05;color:var(--text);font-variant-numeric:tabular-nums}
.val-big-range{display:flex;align-items:baseline;gap:14px;font-size:14px;color:var(--text-d);margin-top:6px;font-weight:500;font-variant-numeric:tabular-nums}
.val-big-range strong{color:var(--text-m);font-weight:700}
.val-confidence{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-top:14px}
.val-confidence.high{background:rgba(82,196,152,.12);color:var(--gold);border:1px solid var(--gold-border)}
.val-confidence.medium{background:rgba(240,164,41,.1);color:var(--amber);border:1px solid rgba(240,164,41,.3)}
.val-confidence.low{background:rgba(244,100,95,.08);color:var(--red);border:1px solid rgba(244,100,95,.25)}
.val-meta{display:flex;gap:24px;flex-wrap:wrap;font-size:13px;color:var(--text-d);margin-top:16px;border-top:1px solid var(--border);padding-top:16px}
.val-meta strong{color:var(--text-m);font-weight:700;margin-right:6px}
.val-comps{width:100%;border-collapse:collapse;font-size:13px}
.val-comps th{text-align:left;font-size:10px;font-weight:700;color:var(--text-d);letter-spacing:.1em;text-transform:uppercase;padding:10px 12px;border-bottom:1px solid var(--border)}
.val-comps td{padding:12px;border-bottom:1px solid var(--border);color:var(--text-m);font-weight:500;font-variant-numeric:tabular-nums}
.val-comps td.addr{color:var(--text);font-weight:600}
.val-comps td.num{text-align:right}
.val-comps tr:last-child td{border-bottom:none}
.val-comps td.notes{font-size:12px;color:var(--text-d);font-style:italic}
.val-list{display:flex;flex-direction:column;gap:10px;margin:0;padding:0;list-style:none}
.val-list li{position:relative;padding-left:22px;font-size:13.5px;color:var(--text-m);line-height:1.55;font-weight:500}
.val-list li::before{content:"→";position:absolute;left:0;top:0;color:var(--gold);font-weight:700}
.val-risks li::before{content:"⚠";color:var(--amber);font-size:14px}
.val-footer{display:flex;gap:10px;margin-top:8px}
.val-btn-primary{background:var(--green);color:var(--bg);border:none;border-radius:8px;padding:12px 24px;font-family:var(--font-body);font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;letter-spacing:-.01em}
.val-btn-primary:hover{background:var(--gold-l);transform:translateY(-1px)}
.val-btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
.val-btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border-m);border-radius:8px;padding:12px 20px;font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:all .15s}
.val-btn-ghost:hover{border-color:var(--text);color:var(--text)}
`;
// Generate a URL-safe random token (base36, ~13 chars) — sufficient for share links.
function generateShareToken(): string {
  const rand = () => Math.random().toString(36).slice(2, 8);
  return (rand() + rand() + Date.now().toString(36)).slice(0, 22);
}
function fmtMoney(n: number, currency = "GBP"): string {
  if (!n || !isFinite(n)) return "—";
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "AED" ? "AED " : currency === "SGD" ? "S$" : currency === "AUD" ? "A$" : "£";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${sym}${(n / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${sym}${(n / 1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${sym}${(n / 1e3).toFixed(0)}k`;
  return `${sym}${n.toFixed(0)}`;
}
type Valuation = {
  address?: string;
  jurisdiction?: string;
  currency?: string;
  propertyType?: string;
  bedrooms?: number;
  sqft?: number;
  condition?: string;
  tenure?: string;
  estimatedValue?: { low: number; central: number; high: number };
  pricePerSqft?: number;
  comparables?: Array<{ address: string; price: number; currency?: string; date?: string; sqft?: number; pricePerSqft?: number; distanceMiles?: number; notes?: string }>;
  valuationDrivers?: string[];
  risks?: string[];
  methodology?: string;
  confidence?: "low" | "medium" | "high";
};
export default function ValuationPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [valuationId, setValuationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tierLoading, setTierLoading] = useState(true);
  const [isPaidTier, setIsPaidTier] = useState(false);
  const [trialUsed, setTrialUsed] = useState(0);
  const TRIAL_LIMIT = 3;
  // Theme sync
  useEffect(() => {
    const detect = (): "dark"|"light" => {
      if (typeof document === "undefined") return "light";
      if (document.body?.classList.contains("light")) return "light";
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr === "light" || attr === "dark") return attr;
      try { const v = localStorage.getItem("valora-theme"); if (v === "light" || v === "dark") return v; } catch {}
      return "light";
    };
    const apply = (t: "dark"|"light") => {
      document.documentElement.setAttribute("data-theme", t);
      document.body.classList.toggle("light", t === "light");
    };
    apply(detect());
    const obs = new MutationObserver(() => apply(detect()));
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  // Auth + tier check + free-trial valuation count
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth"); return; }
      setUser(session.user);
      const { data: sub } = await supabase.from("subscriptions").select("tier, status").eq("user_id", session.user.id).maybeSingle();
      const t = (sub?.tier || "free").toLowerCase();
      const s = (sub?.status || "").toLowerCase();
      const paid = t === "professional" || t === "pro" || t === "enterprise" || s === "trialing";
      setIsPaidTier(paid);
      if (!paid) {
        // Count existing valuations against the trial cap
        const { count } = await supabase
          .from("valuations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", session.user.id);
        setTrialUsed(count ?? 0);
      }
      setTierLoading(false);
    })();
  }, [router]);
  const onApply = async (payload: Record<string, any>) => {
    const v = payload as Valuation;
    setValuation(v);
    setValuationId(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    // Persist the valuation to Supabase (fire-and-forget — UI not blocked)
    if (user) {
      setSaving(true);
      try {
        const row = {
          user_id: user.id,
          data: v,
          address: v.address || null,
          jurisdiction: v.jurisdiction || null,
          currency: v.currency || null,
          property_type: v.propertyType || null,
          estimated_central: v.estimatedValue?.central ?? null,
          confidence: v.confidence || null,
        };
        const { data, error } = await supabase.from("valuations").insert(row).select("id").single();
        if (!error && data?.id) {
          setValuationId(data.id);
          if (!isPaidTier) setTrialUsed(prev => prev + 1);
        }
      } catch {}
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!valuation) return;
    setDownloading(true);
    try {
      downloadValuationPDF(valuation);
    } catch (e: any) {
      alert(`PDF export failed: ${e?.message || "unknown error"}`);
    }
    setDownloading(false);
  };

  // Generate (or reuse) a share token + copy the public URL to clipboard.
  const handleShare = async () => {
    if (!valuationId || !valuation) {
      alert("Save the valuation first (Apply) before sharing.");
      return;
    }
    setSharing(true); setCopied(false);
    try {
      // Check if we already have a share_token on this row
      const { data: existing } = await supabase
        .from("valuations")
        .select("share_token")
        .eq("id", valuationId)
        .single();

      let token = existing?.share_token as string | null;
      if (!token) {
        token = generateShareToken();
        const { error } = await supabase
          .from("valuations")
          .update({ share_token: token })
          .eq("id", valuationId);
        if (error) throw error;
      }
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/share/valuation/${token}`;
      setShareUrl(url);
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {}
    } catch (e: any) {
      alert(`Share failed: ${e?.message || "unknown error"}`);
    }
    setSharing(false);
  };
  if (!user) return null;

  // Trial exhausted — free/starter users who've used all 3 free valuations see the upgrade gate
  const trialExhausted = !isPaidTier && trialUsed >= TRIAL_LIMIT;
  if (!tierLoading && trialExhausted) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}>
        <style>{CSS}</style>
        <script dangerouslySetInnerHTML={{__html:`(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var k=['valora-theme','val-theme','theme'];for(var i=0;i<k.length;i++){var v=localStorage.getItem(k[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='light';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');else if(document.body)document.body.classList.remove('light');}catch(e){}})()`}}/>
        <div className="val-nav">
          <span className="val-logo" onClick={() => router.push("/dashboard")}>Valora</span>
          <div style={{ width: 1, height: 18, background: "var(--border)" }}/>
          <button className="val-btn-back" onClick={() => router.push("/dashboard")}>← Dashboard</button>
          <div style={{ flex: 1 }}/>
          <div style={{ fontSize: 11, color: "var(--text-d)", letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 700 }}>◆ Valuation</div>
        </div>
        <div style={{ maxWidth: 720, margin: "80px auto", padding: "0 32px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--gold-bg)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, marginBottom: 22 }}>
            ◆ Trial used — 3 / 3 valuations
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1.1, color: "var(--text)", marginBottom: 16 }}>
            You&rsquo;ve used your 3 free valuations.
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-d)", lineHeight: 1.55, marginBottom: 36, maxWidth: 560, margin: "0 auto 36px" }}>
            Upgrade to Pro for unlimited cross-border valuations, shareable investor reports, IC-ready PDFs, and every feature of the underwriting platform.
          </p>
          <div style={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, marginBottom: 28, textAlign: "left" }}>
            <div style={{ fontSize: 11, color: "var(--text-d)", letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 14 }}>What Pro unlocks</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Unlimited valuations — anywhere in the world",
                "Unlimited appraisals across all 7 asset classes",
                "Full Copilot — 300 AI messages / month",
                "Monte Carlo + stress tests + sensitivity matrices",
                "Live investor share links (live models, not static)",
                "IC-ready PDF brochures and valuation reports",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "var(--text-m)", fontWeight: 500, lineHeight: 1.5 }}>
                  <span style={{ color: "var(--green)", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => router.push("/pricing")} style={{ background: "var(--green)", color: "var(--bg)", border: "none", borderRadius: 9, padding: "14px 26px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "-.01em" }}>
              See plans →
            </button>
            <button onClick={() => router.push("/dashboard")} style={{ background: "transparent", color: "var(--text-m)", border: "1px solid var(--border-m)", borderRadius: 9, padding: "14px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Back to Copilot
            </button>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-d)", marginTop: 24, letterSpacing: ".02em" }}>
            14-day free trial on Pro · cancel anytime
          </div>
        </div>
      </div>
    );
  }
  if (tierLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{CSS}</style>
        <div style={{ width: 28, height: 28, border: "2px solid rgba(82,196,152,.15)", borderTopColor: "#52C498", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      </div>
    );
  }
  const ccy = valuation?.currency || "GBP";
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var k=['valora-theme','val-theme','theme'];for(var i=0;i<k.length;i++){var v=localStorage.getItem(k[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='light';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');else if(document.body)document.body.classList.remove('light');}catch(e){}})()`}}/>
      {/* Nav */}
      <div className="val-nav">
        <span className="val-logo" onClick={() => router.push("/dashboard")}>Valora</span>
        <div style={{ width: 1, height: 18, background: "var(--border)" }}/>
        <button className="val-btn-back" onClick={() => router.push("/dashboard")}>← Dashboard</button>
        <div style={{ flex: 1 }}/>
        <div style={{ fontSize: 11, color: "var(--text-d)", letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 700 }}>◆ Valuation</div>
      </div>
      {/* Layout */}
      <div className="val-layout">
        <div className="val-copilot-wrap">
          <CopilotPanel
            context="valuation"
            dealName="valuation"
            onApply={onApply}
          />
        </div>
        <div className="val-main">
          {/* Trial counter banner — only for free users who still have valuations left */}
          {!isPaidTier && !tierLoading && trialUsed < TRIAL_LIMIT && (
            <div style={{
              maxWidth: 880, margin: "0 auto 24px",
              background: "var(--gold-bg)", border: "1px solid var(--gold-border)",
              borderRadius: 10, padding: "12px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap",
            }}>
              <div style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600, lineHeight: 1.5 }}>
                <strong style={{ fontWeight: 800 }}>◆ Free trial — {trialUsed} / {TRIAL_LIMIT} valuations used.</strong>
                {" "}Upgrade to Pro for unlimited valuations + IC-ready PDFs.
              </div>
              <button onClick={() => router.push("/pricing")} style={{
                background: "var(--green)", color: "var(--bg)", border: "none",
                borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", letterSpacing: "-.01em", flexShrink: 0,
              }}>See Pro →</button>
            </div>
          )}
          {!valuation && (
            <div className="val-empty">
              <div className="val-chip">◆ Valuation Copilot</div>
              <div className="val-empty-h">Describe a property to value.</div>
              <div className="val-empty-sub">
                Type what you&rsquo;re looking at — anywhere in the world. The Copilot produces a price range, comparables, valuation drivers, and risks.
              </div>
              <div style={{ fontSize: 12, color: "var(--text-d)", lineHeight: 1.6, marginTop: 20 }}>
                Examples:
                <ul style={{ listStyle: "none", marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  <li style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-m)" }}>&gt; 3-bed terrace in Fulham, 1,200 sqft, refurbished</li>
                  <li style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-m)" }}>&gt; 2-bed condo in Miami Beach, 1,100 sqft, ocean view</li>
                  <li style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-m)" }}>&gt; 5-bed villa in Emirates Hills, Dubai, private pool</li>
                  <li style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-m)" }}>&gt; Office building, Singapore CBD, 15,000 sqft, Grade A</li>
                </ul>
              </div>
            </div>
          )}
          {valuation && (
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              {/* HEADLINE VALUE */}
              <div className="val-card">
                <div className="val-card-h">Estimated Value</div>
                <div className="val-big">{fmtMoney(valuation.estimatedValue?.central ?? 0, ccy)}</div>
                <div className="val-big-range">
                  <span>Range</span>
                  <strong>{fmtMoney(valuation.estimatedValue?.low ?? 0, ccy)}</strong>
                  <span>→</span>
                  <strong>{fmtMoney(valuation.estimatedValue?.high ?? 0, ccy)}</strong>
                </div>
                {valuation.confidence && (
                  <div className={`val-confidence ${valuation.confidence}`}>
                    ● {valuation.confidence} confidence
                  </div>
                )}
                <div className="val-meta">
                  {valuation.address && <div><strong>Address</strong>{valuation.address}</div>}
                  {valuation.propertyType && <div><strong>Type</strong>{valuation.propertyType}</div>}
                  {valuation.sqft && <div><strong>Size</strong>{valuation.sqft.toLocaleString()} sqft</div>}
                  {valuation.bedrooms !== undefined && <div><strong>Beds</strong>{valuation.bedrooms}</div>}
                  {valuation.tenure && <div><strong>Tenure</strong>{valuation.tenure.replace(/_/g,' ')}</div>}
                  {valuation.condition && <div><strong>Condition</strong>{valuation.condition.replace(/_/g,' ')}</div>}
                  {valuation.pricePerSqft && <div><strong>Price / sqft</strong>{fmtMoney(valuation.pricePerSqft, ccy)}</div>}
                  {valuation.methodology && <div><strong>Method</strong>{valuation.methodology.replace(/_/g,' ')}</div>}
                </div>
              </div>
              {/* COMPARABLES */}
              {valuation.comparables && valuation.comparables.length > 0 && (
                <div className="val-card">
                  <div className="val-card-h">Comparables ({valuation.comparables.length})</div>
                  <table className="val-comps">
                    <thead>
                      <tr>
                        <th>Address</th>
                        <th style={{ textAlign: "right" }}>Price</th>
                        <th style={{ textAlign: "right" }}>Sqft</th>
                        <th style={{ textAlign: "right" }}>£/sqft</th>
                        <th>Date</th>
                        <th style={{ textAlign: "right" }}>Dist</th>
                      </tr>
                    </thead>
                    <tbody>
                      {valuation.comparables.map((c, i) => (
                        <tr key={i}>
                          <td className="addr">
                            {c.address}
                            {c.notes && <div className="notes">{c.notes}</div>}
                          </td>
                          <td className="num">{fmtMoney(c.price, c.currency || ccy)}</td>
                          <td className="num">{c.sqft ? c.sqft.toLocaleString() : "—"}</td>
                          <td className="num">{c.pricePerSqft ? fmtMoney(c.pricePerSqft, c.currency || ccy) : "—"}</td>
                          <td>{c.date || "—"}</td>
                          <td className="num">{c.distanceMiles !== undefined ? `${c.distanceMiles.toFixed(1)}mi` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* DRIVERS */}
              {valuation.valuationDrivers && valuation.valuationDrivers.length > 0 && (
                <div className="val-card">
                  <div className="val-card-h">Valuation Drivers</div>
                  <ul className="val-list">
                    {valuation.valuationDrivers.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}
              {/* RISKS */}
              {valuation.risks && valuation.risks.length > 0 && (
                <div className="val-card">
                  <div className="val-card-h">Risks</div>
                  <ul className="val-list val-risks">
                    {valuation.risks.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {/* FOOTER ACTIONS */}
              <div className="val-footer">
                <button className="val-btn-primary" onClick={handleDownloadPDF} disabled={downloading}>
                  {downloading ? "Generating PDF…" : "⬇ Download PDF report"}
                </button>
                <button className="val-btn-ghost" onClick={handleShare} disabled={sharing || !valuationId}>
                  {sharing ? "Generating link…" : "🔗 Share"}
                </button>
                <button className="val-btn-ghost" onClick={() => { setValuation(null); setValuationId(null); setShareUrl(null); setCopied(false); }}>+ New valuation</button>
                {saving && <span style={{ fontSize: 12, color: "var(--text-d)", alignSelf: "center" }}>Saving…</span>}
                {!saving && valuationId && !shareUrl && <span style={{ fontSize: 12, color: "var(--green)", alignSelf: "center", fontWeight: 600 }}>✓ Saved</span>}
              </div>
              {/* Share URL row — appears after Share is clicked */}
              {shareUrl && (
                <div style={{
                  marginTop: 14, padding: "12px 16px",
                  background: "var(--bg1)", border: "1px solid var(--gold-border)",
                  borderRadius: 10, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--green)", letterSpacing: ".12em", textTransform: "uppercase", flexShrink: 0 }}>
                    {copied ? "✓ Copied" : "Share link"}
                  </div>
                  <div style={{ flex: 1, minWidth: 280, fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text)", wordBreak: "break-all" }}>
                    {shareUrl}
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); }}
                    style={{
                      background: "transparent", color: "var(--text-m)", border: "1px solid var(--border-m)",
                      borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                    }}>
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer" style={{
                    background: "var(--green)", color: "#fff", border: "none",
                    borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 700,
                    textDecoration: "none", flexShrink: 0,
                  }}>Open ↗</a>
                </div>
              )}
              <div style={{ fontSize: 11, color: "var(--text-d)", marginTop: 16, lineHeight: 1.55, maxWidth: 640 }}>
                <strong style={{ color: "var(--text-m)" }}>Note:</strong> Comparables are produced by the Copilot from global market knowledge. Treat as directional; we will integrate live land-registry data in V2. Use the confidence badge as your guide.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
