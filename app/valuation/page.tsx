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
  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/auth"); return; }
      setUser(session.user);
    });
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
        if (!error && data?.id) setValuationId(data.id);
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
  if (!user) return null;
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
                <button className="val-btn-ghost" onClick={() => { setValuation(null); setValuationId(null); }}>+ New valuation</button>
                {saving && <span style={{ fontSize: 12, color: "var(--text-d)", alignSelf: "center" }}>Saving…</span>}
                {!saving && valuationId && <span style={{ fontSize: 12, color: "var(--green)", alignSelf: "center", fontWeight: 600 }}>✓ Saved</span>}
              </div>
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
