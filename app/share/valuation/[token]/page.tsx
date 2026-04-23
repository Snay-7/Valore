"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { downloadValuationPDF } from "../../../../lib/valuation-brochure";
/* ═══════════════════════════════════════════════════════════════════
   VALORA — Public Valuation Share Page
   Drop at: app/share/valuation/[token]/page.tsx
   Anonymous read via RLS policy "Anyone views shared valuations"
   (only rows WHERE share_token IS NOT NULL are selectable).
   ═══════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F8F5EE;--bg1:#FFFFFF;--bg2:#FFFFFF;--bg3:#F2EEE4;--bg4:#EAE5D8;
  --text:#0F1115;--text-m:#3D4351;--text-d:#6B7280;
  --gold:#2E9E72;--gold-l:#25855E;--gold-bg:rgba(46,158,114,.08);--gold-border:rgba(46,158,114,.28);
  --green:#2E9E72;--red:#C24844;--amber:#C57E14;
  --accent-gold:#A8843A;
  --border:rgba(15,17,21,.08);--border-m:rgba(15,17,21,.16);
  --font-display:'Poppins',system-ui,sans-serif;
  --font-body:'Poppins',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
  --ease:cubic-bezier(0.16,1,0.3,1);
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);font-size:14px;-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.shr-nav{background:var(--bg1);border-bottom:1px solid var(--border);padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.shr-brand{display:flex;align-items:center;gap:10px;cursor:pointer}
.shr-brand-mark{width:26px;height:26px;border-radius:7px;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800}
.shr-brand-name{font-family:var(--font-display);font-size:17px;font-weight:700;letter-spacing:-.02em;color:var(--text)}
.shr-nav-right{display:flex;align-items:center;gap:12px}
.shr-chip{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);background:var(--gold-bg);border:1px solid var(--gold-border);padding:5px 12px;border-radius:99px}
.shr-try-btn{background:var(--green);color:#fff;border:none;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;text-decoration:none;letter-spacing:-.01em;transition:all .15s}
.shr-try-btn:hover{background:var(--gold-l);transform:translateY(-1px)}
.shr-main{max-width:900px;margin:32px auto;padding:0 24px 80px}
.shr-card{background:var(--bg1);border:1px solid var(--border);border-radius:16px;padding:32px;margin-bottom:20px;animation:fadeIn .4s var(--ease) both;box-shadow:0 4px 16px rgba(15,17,21,.04)}
.shr-card-h{font-size:11px;font-weight:700;color:var(--text-d);letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px}
.shr-big{font-family:var(--font-display);font-size:48px;font-weight:800;letter-spacing:-.03em;line-height:1.02;color:var(--text);font-variant-numeric:tabular-nums}
.shr-range{display:flex;align-items:baseline;gap:14px;font-size:14px;color:var(--text-d);margin-top:8px;font-weight:500;font-variant-numeric:tabular-nums}
.shr-range strong{color:var(--text-m);font-weight:700}
.shr-confidence{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-top:16px}
.shr-confidence.high{background:rgba(46,158,114,.12);color:var(--green);border:1px solid var(--gold-border)}
.shr-confidence.medium{background:rgba(197,126,20,.1);color:var(--amber);border:1px solid rgba(197,126,20,.3)}
.shr-confidence.low{background:rgba(194,72,68,.08);color:var(--red);border:1px solid rgba(194,72,68,.25)}
.shr-meta{display:flex;gap:28px;flex-wrap:wrap;font-size:13px;color:var(--text-d);margin-top:20px;border-top:1px solid var(--border);padding-top:18px}
.shr-meta strong{color:var(--text-m);font-weight:700;margin-right:6px}
.shr-comps{width:100%;border-collapse:collapse;font-size:13px}
.shr-comps th{text-align:left;font-size:10px;font-weight:700;color:var(--text-d);letter-spacing:.1em;text-transform:uppercase;padding:10px 12px;border-bottom:1px solid var(--border)}
.shr-comps td{padding:14px 12px;border-bottom:1px solid var(--border);color:var(--text-m);font-weight:500;font-variant-numeric:tabular-nums}
.shr-comps td.addr{color:var(--text);font-weight:700}
.shr-comps td.num{text-align:right}
.shr-comps tr:last-child td{border-bottom:none}
.shr-comps td.notes{font-size:12px;color:var(--text-d);font-style:italic;font-weight:500;margin-top:4px;display:block}
.shr-list{display:flex;flex-direction:column;gap:11px;margin:0;padding:0;list-style:none}
.shr-list li{position:relative;padding-left:26px;font-size:14px;color:var(--text-m);line-height:1.55;font-weight:500}
.shr-list li::before{content:"→";position:absolute;left:0;top:0;color:var(--green);font-weight:800}
.shr-risks li::before{content:"⚠";color:var(--amber);font-size:15px}
.shr-footer-cta{background:linear-gradient(135deg,#1A1E26 0%,#242933 100%);color:#fff;border-radius:16px;padding:36px;margin-top:24px;text-align:center}
.shr-footer-cta h3{font-family:var(--font-display);font-size:26px;font-weight:700;letter-spacing:-.02em;line-height:1.2;margin-bottom:10px;color:#fff}
.shr-footer-cta h3 em{font-style:normal;color:#6DFFB1}
.shr-footer-cta p{font-size:14px;color:rgba(255,255,255,.72);margin-bottom:20px;line-height:1.5}
.shr-footer-cta a{display:inline-flex;align-items:center;gap:8px;background:var(--green);color:#fff;padding:12px 26px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:-.01em;transition:all .15s}
.shr-footer-cta a:hover{background:var(--gold-l);transform:translateY(-1px)}
.shr-loading{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}
.shr-404{max-width:500px;margin:80px auto;text-align:center;padding:0 24px}
.shr-404 h2{font-family:var(--font-display);font-size:28px;font-weight:700;color:var(--text);margin-bottom:12px;letter-spacing:-.02em}
.shr-404 p{color:var(--text-d);font-size:14px;line-height:1.6;margin-bottom:20px}
`;
function fmtMoney(n: number | undefined, currency = "GBP"): string {
  if (n == null || !isFinite(n)) return "—";
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "AED" ? "AED " : currency === "SGD" ? "S$" : currency === "AUD" ? "A$" : currency === "CHF" ? "CHF " : currency === "JPY" ? "¥" : "£";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${sym}${(n / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${sym}${(n / 1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${sym}${Math.round(n / 1e3)}k`;
  return `${sym}${Math.round(n)}`;
}
function fmtPsqft(n: number | undefined, currency = "GBP"): string {
  if (n == null || !isFinite(n)) return "—";
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "AED" ? "AED " : currency === "SGD" ? "S$" : currency === "AUD" ? "A$" : currency === "CHF" ? "CHF " : currency === "JPY" ? "¥" : "£";
  return `${sym}${Math.round(n).toLocaleString()}`;
}
type Valuation = {
  address?: string; jurisdiction?: string; currency?: string; propertyType?: string;
  bedrooms?: number; sqft?: number; condition?: string; tenure?: string;
  estimatedValue?: { low: number; central: number; high: number };
  pricePerSqft?: number;
  comparables?: Array<{ address: string; price: number; currency?: string; date?: string; sqft?: number; pricePerSqft?: number; distanceMiles?: number; notes?: string }>;
  valuationDrivers?: string[]; risks?: string[]; methodology?: string;
  confidence?: "low" | "medium" | "high";
};
export default function SharedValuationPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params?.token || "";
  const [loading, setLoading] = useState(true);
  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase
        .from("valuations")
        .select("data, created_at")
        .eq("share_token", token)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
      } else {
        setValuation(data.data as Valuation);
        setCreatedAt(data.created_at);
      }
      setLoading(false);
    })();
  }, [token]);
  const downloadPDF = () => {
    if (valuation) downloadValuationPDF(valuation);
  };
  if (loading) {
    return (
      <div>
        <style>{CSS}</style>
        <div className="shr-loading">
          <div style={{ width: 28, height: 28, border: "2px solid rgba(46,158,114,.15)", borderTopColor: "#2E9E72", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
          <div style={{ fontSize: 12, color: "var(--text-d)", letterSpacing: ".08em", textTransform: "uppercase" }}>Loading valuation…</div>
        </div>
      </div>
    );
  }
  if (notFound || !valuation) {
    return (
      <div>
        <style>{CSS}</style>
        <nav className="shr-nav">
          <div className="shr-brand" onClick={() => router.push("/")}>
            <div className="shr-brand-mark">◆</div>
            <div className="shr-brand-name">Valora</div>
          </div>
          <a className="shr-try-btn" href="/auth">Start free</a>
        </nav>
        <div className="shr-404">
          <h2>Valuation not found</h2>
          <p>This share link has expired, been removed, or was mistyped. If you want to run a valuation of your own, Valora&rsquo;s free plan unlocks one full appraisal.</p>
          <a className="shr-try-btn" href="/auth">Try it free →</a>
        </div>
      </div>
    );
  }
  const ccy = valuation.currency || "GBP";
  const v = valuation;
  return (
    <div>
      <style>{CSS}</style>
      {/* Nav */}
      <nav className="shr-nav">
        <div className="shr-brand" onClick={() => router.push("/")}>
          <div className="shr-brand-mark">◆</div>
          <div className="shr-brand-name">Valora</div>
        </div>
        <div className="shr-nav-right">
          <div className="shr-chip">◆ Shared valuation</div>
          <a className="shr-try-btn" href="/auth">Start free</a>
        </div>
      </nav>
      <div className="shr-main">
        {/* HEADLINE */}
        <div className="shr-card">
          <div className="shr-card-h">Estimated Value</div>
          <div className="shr-big">{fmtMoney(v.estimatedValue?.central, ccy)}</div>
          <div className="shr-range">
            <span>Range</span>
            <strong>{fmtMoney(v.estimatedValue?.low, ccy)}</strong>
            <span>→</span>
            <strong>{fmtMoney(v.estimatedValue?.high, ccy)}</strong>
          </div>
          {v.confidence && (
            <div className={`shr-confidence ${v.confidence}`}>● {v.confidence} confidence</div>
          )}
          <div className="shr-meta">
            {v.address && <div><strong>Address</strong>{v.address}</div>}
            {v.propertyType && <div><strong>Type</strong>{v.propertyType}</div>}
            {v.sqft && <div><strong>Size</strong>{v.sqft.toLocaleString()} sqft</div>}
            {v.bedrooms !== undefined && <div><strong>Beds</strong>{v.bedrooms}</div>}
            {v.tenure && <div><strong>Tenure</strong>{v.tenure.replace(/_/g,' ')}</div>}
            {v.condition && <div><strong>Condition</strong>{v.condition.replace(/_/g,' ')}</div>}
            {v.pricePerSqft && <div><strong>Price / sqft</strong>{fmtPsqft(v.pricePerSqft, ccy)}</div>}
            {v.methodology && <div><strong>Method</strong>{v.methodology.replace(/_/g,' ')}</div>}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
            <button onClick={downloadPDF} style={{
              background: "var(--green)", color: "#fff", border: "none",
              borderRadius: 9, padding: "11px 22px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", letterSpacing: "-.01em",
            }}>⬇ Download full PDF report</button>
          </div>
        </div>
        {/* COMPARABLES */}
        {v.comparables && v.comparables.length > 0 && (
          <div className="shr-card">
            <div className="shr-card-h">Comparables ({v.comparables.length})</div>
            <table className="shr-comps">
              <thead>
                <tr>
                  <th>Address</th>
                  <th style={{ textAlign: "right" }}>Price</th>
                  <th style={{ textAlign: "right" }}>Sqft</th>
                  <th style={{ textAlign: "right" }}>Price/sqft</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Distance</th>
                </tr>
              </thead>
              <tbody>
                {v.comparables.map((c, i) => (
                  <tr key={i}>
                    <td className="addr">
                      {c.address}
                      {c.notes && <span className="notes">{c.notes}</span>}
                    </td>
                    <td className="num">{fmtMoney(c.price, c.currency || ccy)}</td>
                    <td className="num">{c.sqft ? c.sqft.toLocaleString() : "—"}</td>
                    <td className="num">{c.pricePerSqft ? fmtPsqft(c.pricePerSqft, c.currency || ccy) : "—"}</td>
                    <td>{c.date || "—"}</td>
                    <td className="num">{c.distanceMiles != null ? `${c.distanceMiles.toFixed(1)} mi` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* DRIVERS */}
        {v.valuationDrivers && v.valuationDrivers.length > 0 && (
          <div className="shr-card">
            <div className="shr-card-h">Valuation Drivers</div>
            <ul className="shr-list">
              {v.valuationDrivers.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
        )}
        {/* RISKS */}
        {v.risks && v.risks.length > 0 && (
          <div className="shr-card">
            <div className="shr-card-h">Risks</div>
            <ul className="shr-list shr-risks">
              {v.risks.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
        {/* Disclosure */}
        <div style={{ fontSize: 11, color: "var(--text-d)", lineHeight: 1.6, padding: "0 6px", marginTop: 10 }}>
          <strong style={{ color: "var(--text-m)" }}>Note:</strong> This is a directional comparative market valuation produced by Valora Copilot. It is not a RICS or Red Book formal valuation. Shared valuations are provided for internal decision-support only.
          {createdAt && <> · Generated {new Date(createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</>}
        </div>
        {/* Convert CTA */}
        <div className="shr-footer-cta">
          <h3>Value your own property in <em>30 seconds.</em></h3>
          <p>Describe any property — anywhere in the world. Full valuation, comparables, and IC-ready PDF.</p>
          <a href="/auth">Start free →</a>
        </div>
      </div>
    </div>
  );
}
