"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, useRef, Suspense, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams } from "next/navigation";
import * as XLSX from "xlsx";
import {
  calcAll, calcHotelAdvanced, runMonteCarlo,
  fmt, fmtPct, fmtX, num,
} from "../../../lib/calc-engines";
import {
  applyOverrides, hasActiveOverrides,
  getSlidersForSnap as getSlidersForSnapOriginal, type SliderSpec, type Overrides,
} from "../../../lib/share-overrides";

// ─────────────────────────────────────────────────────────────────────────────
// VALORA — UNDERWRITE ROOM
//
// /share/[token] — the recipient experience.
//
// Architecture:
//   1. Load share_link by slug
//   2. Render gate based on access_mode (public | password | email)
//   3. On gate pass, create share_view row and start tracking
//   4. Render the Room: Hero + Assumption Ledger (left) + Body + Scenario Rail (right)
//   5. Every slider drag mutates `overrides` -> applyOverrides -> calcAll -> rerender
//   6. Every change is logged to share_input_overrides
//
// All math goes through lib/calc-engine.ts. NEVER reimplement here.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// FLIP SLIDERS — defined inline so we can ship without touching share-overrides.ts.
// Move these into lib/share-overrides.ts as part of the next refactor.
// ─────────────────────────────────────────────────────────────────────────────
const FLIP_SLIDERS: SliderSpec[] = [
  {
    path: "salePrice",
    label: "Sale Price",
    unit: "currency",
    getBase: (snap: any) => num(snap.salePrice ?? 0),
    getRange: (base: number) => [Math.round(base * 0.85), Math.round(base * 1.15)],
    step: 5000,
    hint: "Flex sale value ±15% to test price sensitivity.",
    // When user flexes salePrice, also clear salePricePsf so engine recomputes from new value
    clearPaths: ["salePricePsf"],
  },
  {
    path: "refurbBudget",
    label: "Refurb Budget",
    unit: "currency",
    getBase: (snap: any) => num(snap.refurbBudget ?? 0),
    getRange: (base: number) => [Math.round(base * 0.7), Math.round(base * 1.3)],
    step: 1000,
    hint: "Construction risk: ±30% on the refurb spend.",
    clearPaths: ["refurbPsf"],
  },
  {
    path: "bridgingTermMonths",
    label: "Bridge Term",
    unit: "months",
    getBase: (snap: any) => num(snap.bridgingTermMonths ?? 12),
    getRange: () => [3, 24],
    step: 1,
    hint: "Programme overrun extends interest cost.",
  },
  {
    path: "bridgingRatePct",
    label: "Bridging Rate",
    unit: "%",
    getBase: (snap: any) => num(snap.bridgingRatePct ?? 0.85),
    getRange: () => [0.5, 1.5],
    step: 0.05,
    hint: "Monthly bridging rate — typically 0.6–1.0%pm.",
  },
];

// Wrapper around the original getSlidersForSnap that adds Flip support.
// Keeps the generic page logic untouched.
function getSlidersForSnap(snap: any): SliderSpec[] | null {
  if (snap?.assetType === "Flip") return FLIP_SLIDERS;
  return getSlidersForSnapOriginal(snap);
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.theme-dark{
  --bg:#0D1017;--bg1:#141920;--bg2:#1A2030;--bg3:#202840;--bg4:#2A3350;
  --text:#F0EEE8;--text-m:#8B93A5;--text-d:#4D5570;
  --border:rgba(255,255,255,0.06);--border-m:rgba(255,255,255,0.12);
  --card-bg:#1A2030;--card-border:rgba(255,255,255,0.06);
  --section-bg:#141920;--divider:rgba(255,255,255,0.06);
  --rail-bg:#11161E;
  --slider-track:#202840;--slider-fill:#52C498;--slider-thumb:#F0EEE8;
}
.theme-light{
  --bg:#F8F9FA;--bg1:#F0F2F5;--bg2:#FFFFFF;--bg3:#F8F9FA;--bg4:#E8EAED;
  --text:#1E2433;--text-m:#5A6478;--text-d:#9AA3AF;
  --border:rgba(0,0,0,0.08);--border-m:rgba(0,0,0,0.13);
  --card-bg:#FFFFFF;--card-border:rgba(0,0,0,0.08);
  --section-bg:#F0F2F5;--divider:rgba(0,0,0,0.08);
  --rail-bg:#F2F4F7;
  --slider-track:#E8EAED;--slider-fill:#2A8A64;--slider-thumb:#1E2433;
}
:root{
  --gold:#52C498;--gold-l:#72D4AE;--gold-bg:rgba(82,196,152,0.08);--gold-border:rgba(82,196,152,0.25);
  --green:#2da870;--red:#d94f4a;--amber:#d4891a;--blue:#4a8ae8;
  --font-display:'Inter',system-ui,sans-serif;
  --font-body:'Inter',system-ui,sans-serif;
  --font-mono:'DM Mono',monospace;
  --transition-num:200ms cubic-bezier(.16,1,.3,1);
}
body{font-family:var(--font-body);-webkit-font-smoothing:antialiased;background:var(--bg);color:var(--text);transition:background .3s,color .3s}
.page-wrap{background:var(--bg);color:var(--text);min-height:100vh}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.fade-up{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both}
.fade-in{animation:fadeIn .3s ease both}

/* ── GATE ────────────────────────────────────────────────────────────────── */
.gate-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--bg)}
.gate-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:14px;padding:36px 32px;max-width:420px;width:100%;text-align:center}
.gate-icon{font-size:32px;margin-bottom:12px;color:var(--gold)}
.gate-title{font-family:var(--font-display);font-size:22px;font-weight:500;margin-bottom:6px;letter-spacing:-.01em}
.gate-sub{font-size:13px;color:var(--text-m);margin-bottom:24px;line-height:1.5}
.gate-input{width:100%;padding:12px 14px;border:1px solid var(--border-m);border-radius:8px;background:var(--bg);color:var(--text);font-family:var(--font-body);font-size:14px;margin-bottom:12px;outline:none;transition:border-color .2s}
.gate-input:focus{border-color:var(--gold)}
.gate-btn{width:100%;padding:12px 14px;border:none;border-radius:8px;background:var(--gold);color:#0D1017;font-family:var(--font-body);font-size:14px;font-weight:600;cursor:pointer;transition:opacity .2s}
.gate-btn:hover{opacity:.9}
.gate-btn:disabled{opacity:.5;cursor:not-allowed}
.gate-error{color:var(--red);font-size:12px;margin-bottom:12px;animation:fadeIn .2s ease both}
.gate-foot{margin-top:20px;padding-top:18px;border-top:1px solid var(--divider);font-size:11px;color:var(--text-d)}

/* ── ROOM LAYOUT ─────────────────────────────────────────────────────────── */
.room{display:grid;grid-template-columns:280px 1fr 0;min-height:100vh;transition:grid-template-columns .25s ease}
.room.with-rail{grid-template-columns:280px 1fr 320px}
.ledger{background:var(--rail-bg);border-right:1px solid var(--border);padding:16px 14px;overflow-y:auto;position:sticky;top:0;height:100vh}
.body{min-width:0;overflow-x:hidden}
.rail{background:var(--rail-bg);border-left:1px solid var(--border);padding:16px 14px;overflow-y:auto;position:sticky;top:0;height:100vh}

/* ── TOP BAR ─────────────────────────────────────────────────────────────── */
.topbar{height:54px;display:flex;align-items:center;justify-content:space-between;padding:0 32px;border-bottom:1px solid var(--border);background:var(--bg1);position:sticky;top:0;z-index:50}
.topbar-brand{font-family:var(--font-display);font-size:17px;font-weight:700;letter-spacing:-.03em}
.topbar-actions{display:flex;align-items:center;gap:10px}
.theme-toggle{display:flex;align-items:center;background:var(--bg3);border-radius:18px;padding:3px;gap:2px;border:1px solid var(--border)}
.theme-toggle button{padding:5px 11px;border-radius:14px;border:none;cursor:pointer;font-family:var(--font-body);font-size:11px;font-weight:500;letter-spacing:.04em;background:transparent;color:var(--text-m);transition:all .2s}
.theme-toggle button.active{background:var(--gold);color:#0D1017}
.scenario-badge{padding:4px 10px;border-radius:14px;font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;border:1px solid;background:transparent;cursor:default}
.scenario-badge.sponsor{color:var(--text-m);border-color:var(--border-m)}
.scenario-badge.custom{color:var(--gold);border-color:var(--gold-border);background:var(--gold-bg)}

/* ── HERO ────────────────────────────────────────────────────────────────── */
.hero{padding:32px 40px 28px;border-bottom:1px solid var(--divider);max-width:1200px}
.hero-title{font-family:var(--font-display);font-size:clamp(28px,4vw,46px);font-weight:300;line-height:1.05;letter-spacing:-.01em;margin:14px 0 6px}
.hero-eyebrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:11px;color:var(--text-d);letter-spacing:.04em;text-transform:uppercase}
.hero-sub{font-size:13px;color:var(--text-m);letter-spacing:.02em}
.metric-strip{display:grid;gap:0;border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-top:24px}
.metric-strip-inner{display:grid;grid-template-columns:repeat(5,1fr)}
.metric-cell{padding:18px 20px;border-right:1px solid var(--border);background:var(--card-bg);position:relative}
.metric-cell:last-child{border-right:none}
.metric-cell-label{font-size:9px;color:var(--text-d);text-transform:uppercase;letter-spacing:.1em;margin-bottom:7px;font-weight:600}
.metric-cell-value{font-family:var(--font-display);font-size:clamp(22px,2.5vw,32px);font-weight:300;line-height:1;letter-spacing:-.01em;transition:color var(--transition-num)}
.metric-cell-delta{font-size:10px;font-family:var(--font-mono);margin-top:5px;color:var(--text-d)}
.metric-cell-delta.up{color:var(--green)}
.metric-cell-delta.down{color:var(--red)}

/* ── BODY SECTIONS ───────────────────────────────────────────────────────── */
.section{padding:32px 40px;border-bottom:1px solid var(--divider);max-width:1200px}
.section-title{font-family:var(--font-display);font-size:18px;font-weight:500;letter-spacing:-.01em;margin-bottom:4px}
.section-sub{font-size:12px;color:var(--text-m);margin-bottom:20px}
.data-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:18px 20px}
.data-row{display:flex;justify-content:space-between;align-items:baseline;padding:8px 0;border-bottom:1px solid var(--divider);gap:16px}
.data-row:last-child{border-bottom:none}
.data-label{font-size:12px;color:var(--text-m)}
.data-value{font-family:var(--font-mono);font-size:12px;font-weight:500;text-align:right;transition:color var(--transition-num)}
.data-label-bold{font-size:12px;color:var(--text);font-weight:600}
.data-value-bold{font-family:var(--font-mono);font-size:13px;font-weight:600;text-align:right}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px}

/* ── ASSUMPTION LEDGER ───────────────────────────────────────────────────── */
.ledger-hdr{font-size:10px;color:var(--text-d);text-transform:uppercase;letter-spacing:.14em;font-weight:600;padding:6px 4px 14px;display:flex;justify-content:space-between;align-items:center}
.ledger-reset{font-size:10px;color:var(--gold);background:none;border:none;cursor:pointer;font-weight:600;padding:0;letter-spacing:.06em;text-transform:uppercase}
.ledger-reset:disabled{color:var(--text-d);cursor:default}
.slider-row{padding:14px 4px;border-bottom:1px solid var(--divider)}
.slider-row:last-child{border-bottom:none}
.slider-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
.slider-label{font-size:12px;color:var(--text);font-weight:500}
.slider-value{font-family:var(--font-mono);font-size:12px;font-weight:600;color:var(--gold)}
.slider-value.unchanged{color:var(--text-m)}
.slider-input{width:100%;-webkit-appearance:none;appearance:none;height:4px;background:var(--slider-track);border-radius:2px;outline:none;cursor:pointer}
.slider-input::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:var(--slider-thumb);cursor:pointer;border:2px solid var(--slider-fill);transition:transform .15s}
.slider-input::-webkit-slider-thumb:hover{transform:scale(1.15)}
.slider-input::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:var(--slider-thumb);cursor:pointer;border:2px solid var(--slider-fill);}
.slider-range{display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:9px;color:var(--text-d);margin-top:5px}
.slider-hint{font-size:10px;color:var(--text-d);line-height:1.4;margin-top:6px;font-style:italic}
.slider-row.flexed .slider-label::after{content:" •";color:var(--gold);font-weight:700}

/* ── CASHFLOW TABLE ──────────────────────────────────────────────────────── */
.cf-table{width:100%;border-collapse:collapse;font-size:11px}
.cf-th{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-d);padding:6px 10px;border-bottom:1px solid var(--divider);text-align:right;font-family:var(--font-body);font-weight:600;white-space:nowrap}
.cf-th:first-child{text-align:left}
.cf-td{padding:7px 10px;border-bottom:1px solid var(--divider);font-family:var(--font-mono);font-size:11px;text-align:right;color:var(--text-m);transition:color var(--transition-num)}
.cf-td:first-child{text-align:left;color:var(--text-m);font-family:var(--font-body)}

/* ── PER-KEY ─────────────────────────────────────────────────────────────── */
.per-key-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
.per-key-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:13px 14px}
.per-key-label{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:var(--text-d);margin-bottom:5px}
.per-key-value{font-family:var(--font-mono);font-size:15px;font-weight:500;transition:color var(--transition-num)}

/* ── STOCHASTIC ──────────────────────────────────────────────────────────── */
.mc-band{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}
.mc-band-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:14px 16px;text-align:center}
.mc-band-label{font-size:9px;color:var(--text-d);letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}
.mc-band-value{font-family:var(--font-mono);font-size:18px;font-weight:600}
.mc-band-card.p10 .mc-band-value{color:var(--red)}
.mc-band-card.p50 .mc-band-value{color:var(--text)}
.mc-band-card.p90 .mc-band-value{color:var(--green)}
.mc-histogram{display:flex;align-items:flex-end;gap:1px;height:80px;padding:8px 0;margin-bottom:8px}
.mc-bar{flex:1;background:var(--gold);opacity:.6;border-radius:1px 1px 0 0;transition:opacity .2s,height var(--transition-num)}
.mc-bar:hover{opacity:1}

/* ── BOTTOM ──────────────────────────────────────────────────────────────── */
.share-footer{padding:24px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;max-width:1200px;border-top:1px solid var(--divider)}
.btn-ghost{font-size:11px;color:var(--text-m);background:none;border:1px solid var(--border-m);border-radius:6px;padding:6px 12px;cursor:pointer;font-family:var(--font-body);transition:all .2s}
.btn-ghost:hover{border-color:var(--gold-border);color:var(--gold)}

/* ── RESPONSIVE ──────────────────────────────────────────────────────────── */
@media(max-width:1100px){
  .room,.room.with-rail{grid-template-columns:240px 1fr 0}
  .rail{display:none}
}
@media(max-width:768px){
  .room,.room.with-rail{grid-template-columns:1fr}
  .ledger{position:static;height:auto;max-height:none;border-right:none;border-bottom:1px solid var(--border)}
  .topbar,.hero,.section,.share-footer{padding-left:18px;padding-right:18px}
  .metric-strip-inner{grid-template-columns:1fr 1fr}
  .metric-cell{border-right:none;border-bottom:1px solid var(--border)}
  .two-col,.per-key-grid{grid-template-columns:1fr 1fr}
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// SESSION TRACKING — fingerprint that doesn't require cookies
// ─────────────────────────────────────────────────────────────────────────────
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const KEY = "valora-share-session";
  try {
    let s = sessionStorage.getItem(KEY);
    if (!s) {
      s = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(KEY, s);
    }
    return s;
  } catch {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: 32, height: 32, border: "2px solid rgba(82,196,152,.2)", borderTopColor: "#52C498", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// GATE — password / email / public
// ─────────────────────────────────────────────────────────────────────────────
function PasswordGate({ slug, onUnlock }: { slug: string; onUnlock: (linkId: string) => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!password) return;
    setBusy(true); setError(null);
    const { data, error: rpcErr } = await supabase.rpc("verify_share_password", {
      p_slug: slug, p_password: password,
    });
    setBusy(false);
    if (rpcErr || !data) {
      setError("Incorrect password.");
      return;
    }
    onUnlock(data as string);
  };

  return (
    <div className="gate-wrap">
      <div className="gate-card fade-up">
        <div className="gate-icon">◆</div>
        <div className="gate-title">Password required</div>
        <div className="gate-sub">This appraisal has been shared with restricted access. Enter the password provided by the sponsor.</div>
        {error && <div className="gate-error">{error}</div>}
        <input
          type="password" className="gate-input" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()} autoFocus
        />
        <button className="gate-btn" onClick={submit} disabled={busy || !password}>
          {busy ? "Verifying…" : "Unlock"}
        </button>
        <div className="gate-foot">Powered by Valora · Strictly Confidential</div>
      </div>
    </div>
  );
}

function EmailGate({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return (
    <div className="gate-wrap">
      <div className="gate-card fade-up">
        <div className="gate-icon">✉</div>
        <div className="gate-title">Enter your email to continue</div>
        <div className="gate-sub">The sponsor will be notified that you've opened this appraisal. Your email is used for access only — no marketing.</div>
        <input
          type="email" className="gate-input" placeholder="you@firm.com"
          value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => valid && e.key === "Enter" && onSubmit(email)} autoFocus
        />
        <button className="gate-btn" onClick={() => onSubmit(email)} disabled={!valid}>
          Continue
        </button>
        <div className="gate-foot">Powered by Valora · Strictly Confidential</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSUMPTION LEDGER (left rail)
// ─────────────────────────────────────────────────────────────────────────────
function AssumptionLedger({
  snap, sliders, overrides, onOverride, onReset, sym,
}: {
  snap: any;
  sliders: SliderSpec[];
  overrides: Overrides;
  onOverride: (path: string, value: number, originalValue: number) => void;
  onReset: () => void;
  sym: string;
}) {
  const visibleSliders = sliders.filter(s => !s.visible || s.visible(snap));
  const hasOverrides = hasActiveOverrides(overrides);

  return (
    <div className="ledger">
      <div className="ledger-hdr">
        <span>Assumptions</span>
        <button className="ledger-reset" onClick={onReset} disabled={!hasOverrides}>
          {hasOverrides ? "Reset" : "Sponsor's case"}
        </button>
      </div>
      {visibleSliders.map(spec => {
        const base = spec.getBase(snap);
        const [min, max] = spec.getRange(base);
        const current = (overrides[spec.path] as number) ?? base;
        const isFlexed = overrides[spec.path] !== undefined;
        const fmtVal = (v: number) => {
          if (spec.unit === "%") return `${v.toFixed(2)}%`;
          if (spec.unit === "currency") return fmt(v, sym);
          if (spec.unit === "ratio") return v.toFixed(2);
          if (spec.unit === "months") return `${Math.round(v)}m`;
          return v.toLocaleString();
        };
        return (
          <div key={spec.path} className={`slider-row ${isFlexed ? "flexed" : ""}`}>
            <div className="slider-top">
              <span className="slider-label">{spec.label}</span>
              <span className={`slider-value ${isFlexed ? "" : "unchanged"}`}>{fmtVal(current)}</span>
            </div>
            <input
              type="range" className="slider-input"
              min={min} max={max} step={spec.step} value={current}
              onChange={e => onOverride(spec.path, parseFloat(e.target.value), base)}
            />
            <div className="slider-range">
              <span>{fmtVal(min)}</span>
              <span>{fmtVal(max)}</span>
            </div>
            {spec.hint && <div className="slider-hint">{spec.hint}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE METRIC CELL — animates colour shift when value crosses thresholds
// ─────────────────────────────────────────────────────────────────────────────
function MetricCell({ label, value, delta, baseColor }: {
  label: string; value: string; delta?: { pct: number; absolute: string } | null; baseColor: string;
}) {
  return (
    <div className="metric-cell">
      <div className="metric-cell-label">{label}</div>
      <div className="metric-cell-value" style={{ color: baseColor }}>{value}</div>
      {delta && Math.abs(delta.pct) > 0.001 && (
        <div className={`metric-cell-delta ${delta.pct > 0 ? "up" : "down"}`}>
          {delta.pct > 0 ? "▲" : "▼"} {delta.absolute}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ROOM
// ─────────────────────────────────────────────────────────────────────────────
function UnderwriteRoom({
  link, appraisal, viewId,
}: {
  link: any; appraisal: any; viewId: string | null;
}) {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("valora-theme") as any) || "light";
  });
  useEffect(() => { try { localStorage.setItem("valora-theme", theme); } catch {} }, [theme]);

  const sponsorSnap = appraisal.snapshot || {};
  const assetType = sponsorSnap.assetType || "BTR";
  const sym = ({ GBP: "£", USD: "$", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$", JPY: "¥", CHF: "Fr", CAD: "C$", HKD: "HK$" } as any)[sponsorSnap.currency] || "£";

  // ── ASSET TYPE FLAGS ───────────────────────────────────────────────────────
  // Set up early so we can branch hero metrics, returns rows, info card and
  // exports without sprinkling string comparisons through the JSX.
  const isHotelAdv = assetType === "Hotel" && sponsorSnap.hotelMode === "advanced";
  const isFlip = assetType === "Flip";
  const isFlipHold = isFlip && sponsorSnap.flipMode === "hold";

  // ── OVERRIDES STATE ────────────────────────────────────────────────────────
  const [overrides, setOverrides] = useState<Overrides>({});
  const sliders = getSlidersForSnap(sponsorSnap);

  // ── LIVE COMPUTE ───────────────────────────────────────────────────────────
  // Single source of truth — every render recomputes from sponsor snap + overrides.
  // Both `live` and `sponsor` results are computed so we can show deltas vs. the
  // sponsor's case. Cheap because calcAll is pure and snap is small.
  const liveSnap = useMemo(() => applyOverrides(sponsorSnap, overrides, sliders || undefined), [sponsorSnap, overrides, sliders]);
  const liveResults = useMemo(() => {
    try { return calcAll(assetType, liveSnap); } catch { return {} as any; }
  }, [assetType, liveSnap]);
  const sponsorResults = useMemo(() => {
    try { return calcAll(assetType, sponsorSnap); } catch { return {} as any; }
  }, [assetType, sponsorSnap]);

  // For Hotel Advanced, also compute the rich hotelAdv block live
  const liveHotelAdv = useMemo(() => {
    if (assetType !== "Hotel" || sponsorSnap.hotelMode !== "advanced") return null;
    try { return calcHotelAdvanced(liveSnap); } catch { return null; }
  }, [assetType, sponsorSnap.hotelMode, liveSnap]);

  // ── OVERRIDE HANDLERS ──────────────────────────────────────────────────────
  // Debounce the DB log (don't fire on every keystroke of the slider drag).
  const logTimer = useRef<any>(null);
  const handleOverride = useCallback((path: string, value: number, originalValue: number) => {
    setOverrides(prev => ({ ...prev, [path]: value }));
    if (logTimer.current) clearTimeout(logTimer.current);
    logTimer.current = setTimeout(() => {
      if (!viewId) return;
      supabase.from("share_input_overrides").insert({
        share_view_id: viewId, input_path: path,
        original_value: originalValue, new_value: value, source: "manual",
      }).then(() => {});
    }, 600);
  }, [viewId]);

  const handleReset = useCallback(() => {
    setOverrides({});
    if (viewId) {
      supabase.from("share_input_overrides").insert({
        share_view_id: viewId, input_path: "*", original_value: 0, new_value: 0, source: "reset",
      }).then(() => {});
    }
  }, [viewId]);

  // ── HEARTBEAT — keep last_active_at fresh ─────────────────────────────────
  useEffect(() => {
    if (!viewId) return;
    const startedAt = Date.now();
    const beat = async () => {
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      await supabase.from("share_views").update({
        last_active_at: new Date().toISOString(),
        total_active_seconds: seconds,
      }).eq("id", viewId);
    };
    const iv = setInterval(beat, 15_000);
    const onUnload = () => { beat(); };
    window.addEventListener("beforeunload", onUnload);
    return () => { clearInterval(iv); window.removeEventListener("beforeunload", onUnload); beat(); };
  }, [viewId]);

  // ── HERO METRICS (asset-aware) ─────────────────────────────────────────────
  // Headline metric varies by asset:
  //   Hotel Advanced  → Exit Value
  //   Flip            → Sale Price (from engine — may be flat or psf*sqft)
  //   Everything else → GDV
  const liveHeadline = isHotelAdv && liveHotelAdv
    ? liveHotelAdv.exitValue
    : isFlip
    ? (liveResults.salePrice ?? liveResults.netProceeds ?? 0)
    : (liveResults.gdv ?? liveResults.exitValue ?? 0);
  const headlineLabel = isHotelAdv ? "Exit Value" : isFlip ? "Sale Price" : "GDV";

  // Profit — for Flip Hold, use profitCash (cash returned to equity) not accounting profit
  const liveProfit = isFlipHold
    ? (liveResults.profitCash ?? liveResults.profit ?? 0)
    : isHotelAdv && liveHotelAdv
    ? liveHotelAdv.profit
    : (liveResults.profit ?? 0);

  // Returns metric — Flip Sell uses ROI on cost, Flip Hold uses Net Yield, others use PoC
  const liveReturns = isFlipHold
    ? (liveResults.netYield ?? 0)
    : isFlip
    ? (liveResults.roi ?? 0)
    : isHotelAdv && liveHotelAdv
    ? liveHotelAdv.poc
    : (liveResults.poc ?? 0);
  const returnsLabel = isHotelAdv ? "Return on Cost"
    : isFlipHold ? "Net Yield"
    : isFlip ? "ROI on Cost"
    : "Profit on Cost";

  // IRR — Flip uses single annualised IRR; everything else uses levered
  const liveIrr = isHotelAdv && liveHotelAdv
    ? liveHotelAdv.irrLevered
    : (liveResults.irrLevered ?? liveResults.irr ?? 0);

  const liveEquity = isHotelAdv && liveHotelAdv
    ? liveHotelAdv.equity
    : (liveResults.equity ?? sponsorSnap.equity ?? 0);
  const liveMoic = isHotelAdv && liveHotelAdv
    ? liveHotelAdv.moic
    : (liveResults.moic ?? 0);

  // Sponsor-case equivalents for delta calculation — must mirror the live logic above
  const sponsorHeadline = isHotelAdv
    ? (sponsorResults.exitValue ?? 0)
    : isFlip
    ? (sponsorResults.salePrice ?? sponsorResults.netProceeds ?? 0)
    : (sponsorResults.gdv ?? sponsorResults.exitValue ?? 0);
  const sponsorProfit = isFlipHold
    ? (sponsorResults.profitCash ?? sponsorResults.profit ?? 0)
    : (sponsorResults.profit ?? 0);
  const sponsorReturns = isFlipHold
    ? (sponsorResults.netYield ?? 0)
    : isFlip
    ? (sponsorResults.roi ?? 0)
    : (sponsorResults.poc ?? 0);
  const sponsorIrr = sponsorResults.irrLevered ?? sponsorResults.irr ?? 0;

  const deltaPct = (live: number, sponsor: number): number => sponsor === 0 ? 0 : (live - sponsor) / Math.abs(sponsor);

  // Returns colouring — Flip yields use lower thresholds than development PoC
  const returnsColor = isFlipHold
    ? (liveReturns > 0.05 ? "var(--green)" : liveReturns > 0.03 ? "var(--amber)" : "var(--red)")
    : isFlip
    ? (liveReturns > 0.15 ? "var(--green)" : liveReturns > 0.08 ? "var(--amber)" : "var(--red)")
    : (liveReturns > 0.2 ? "var(--green)" : liveReturns > 0.1 ? "var(--amber)" : "var(--red)");
  const profitColor = liveProfit > 0 ? "var(--green)" : "var(--red)";

  // ── EXCEL EXPORT (carry over from existing page) ──────────────────────────
  const exportExcel = () => {
    if (!link?.can_export_excel) return;
    const wb = XLSX.utils.book_new();
    const summary = [
      ["VALORA — UNDERWRITE ROOM EXPORT"], [""],
      ["Project", appraisal.name || "Untitled"],
      ["Asset Type", assetType],
      ["Scenario", hasActiveOverrides(overrides) ? "Custom (recipient flexed)" : "Sponsor's case"],
      ["Exported", new Date().toISOString()], [""],
      ["RETURNS"],
      [headlineLabel, liveHeadline],
      ["Profit", liveProfit],
      [returnsLabel, `${(liveReturns * 100).toFixed(1)}%`],
      ["IRR", `${(liveIrr * 100).toFixed(1)}%`],
      ["Equity In", liveEquity],
      ["Equity Multiple", liveMoic],
      ...(hasActiveOverrides(overrides) ? [[""], ["RECIPIENT OVERRIDES"], ...Object.entries(overrides).map(([k, v]) => [k, v])] : []),
    ];
    const ws = XLSX.utils.aoa_to_sheet(summary);
    ws["!cols"] = [{ wch: 28 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, "Summary");
    XLSX.writeFile(wb, `${(appraisal.name || "Valora").replace(/[^a-zA-Z0-9]/g, "_")}_${hasActiveOverrides(overrides) ? "Custom" : "Base"}.xlsx`);
    if (viewId) supabase.from("share_views").update({ excel_exported: true }).eq("id", viewId);
  };

  // ── RETURNS SUMMARY ROWS — built per asset type ───────────────────────────
  // Defining as data so the JSX stays clean. Each row: [label, value, color, isBold]
  type Row = [string, string, string, boolean];
  const returnsRows: Row[] = isFlip
    ? [
        ["Purchase Price", fmt(liveResults.purchase ?? 0, sym), "var(--text-m)", false],
        ["Refurb", fmt(liveResults.refurb ?? 0, sym), "var(--text-m)", false],
        ["Total Cost", fmt(liveResults.totalCost ?? 0, sym), "var(--text-m)", false],
        ["Equity In", fmt(liveEquity, sym), "var(--gold)", false],
        [isFlipHold ? "GDV / Refi Value" : "Sale Price", fmt(liveHeadline, sym), "var(--gold)", true],
        ...(isFlipHold && (liveResults.cashOutRefi ?? 0) > 100
          ? [["Cash Released at Refi", fmt(liveResults.cashOutRefi, sym), "var(--green)", false] as Row]
          : []),
        ...(isFlipHold && (liveResults.cashOutRefi ?? 0) < -100
          ? [["Equity Top-up at Refi", fmt(Math.abs(liveResults.cashOutRefi), sym), "var(--red)", false] as Row]
          : []),
        [
          isFlipHold ? "Profit (to Equity)" : "Net Sale Proceeds",
          fmt(isFlipHold ? (liveResults.profitCash ?? 0) : (liveResults.netProceeds ?? 0), sym),
          "var(--gold)", false,
        ],
        ["Profit", fmt(liveProfit, sym), profitColor, false],
        [returnsLabel, fmtPct(liveReturns), returnsColor, false],
        ["IRR (Annualised)", fmtPct(liveIrr), "var(--blue)", false],
        ["Equity Multiple", fmtX(liveMoic), liveMoic > 1.5 ? "var(--green)" : "var(--text)", false],
        ...(isFlipHold
          ? [[
              "DSCR / ICR",
              isFinite(liveResults.dscr) && liveResults.dscr > 0 && liveResults.dscr < 999
                ? fmtX(liveResults.dscr)
                : "N/A",
              (liveResults.dscr ?? 0) >= 1.25 ? "var(--green)" : (liveResults.dscr ?? 0) > 0 ? "var(--amber)" : "var(--text-d)",
              false,
            ] as Row]
          : []),
        ["Payback", liveResults.paybackMonth ? `Month ${liveResults.paybackMonth}` : "—", "var(--text-m)", false],
      ]
    : [
        [isHotelAdv ? "Exit Value" : "GDV", fmt(liveHeadline, sym), "var(--gold)", true],
        ["Total Cost", fmt(liveResults.totalCost ?? liveResults.totalInvestment ?? 0, sym), "var(--text-m)", false],
        ["Equity In", fmt(liveEquity, sym), "var(--gold)", false],
        ["Profit", fmt(liveProfit, sym), profitColor, false],
        [returnsLabel, fmtPct(liveReturns), returnsColor, false],
        ["IRR (Unlevered)", fmtPct(liveResults.irr ?? 0), "var(--blue)", false],
        ["IRR (Levered)", fmtPct(liveIrr), "var(--blue)", false],
        ["Equity Multiple", fmtX(liveMoic), liveMoic > 2 ? "var(--green)" : "var(--text)", false],
        [
          "DSCR / ICR",
          isFinite(liveResults.dscr) && liveResults.dscr < 999 ? fmtX(liveResults.dscr) : "—",
          (liveResults.dscr ?? 0) >= 1.5 ? "var(--green)" : "var(--amber)",
          false,
        ],
      ];

  // ── INFO CARD ROWS — right side of the two-col, asset-aware ───────────────
  const infoRows: [string, string][] = [
    ["Asset Type", assetType + (isHotelAdv ? " (Advanced)" : isFlipHold ? " (Hold)" : isFlip ? " (Sell)" : "")],
    ["Location", sponsorSnap.location || "—"],
    ["Currency", sponsorSnap.currency || "GBP"],
    ...(isHotelAdv
      ? ([
          ["Rooms", String(sponsorSnap.rooms || "—")],
          ["Hold Period", `${sponsorSnap.holdYears || 5} years`],
          ["Exit Cap Rate (live)", `${num(liveSnap.exitCapRate ?? 0).toFixed(2)}%`],
          ["ADR (live)", fmt(num(liveSnap.adr ?? 0), sym)],
          ["Occupancy (live)", `${num(liveSnap.occupancy ?? 0).toFixed(1)}%`],
        ] as [string, string][])
      : isFlip
      ? ([
          ["Property Size", sponsorSnap.propertySqft ? `${sponsorSnap.propertySqft} sqft` : "—"],
          ["Strategy", isFlipHold ? "Hold (BTL)" : "Sell on Completion"],
          ["Refurb Period", `${sponsorSnap.programmMonths || 9}m`],
          ["Bridge Term (live)", `${Math.round(num(liveSnap.bridgingTermMonths ?? 12))}m`],
          ["Bridging Rate (live)", `${num(liveSnap.bridgingRatePct ?? 0).toFixed(2)}%pm`],
          ["LTV", `${sponsorSnap.flipLTV || 75}%`],
          ...(isFlipHold
            ? ([
                ["Hold Term", `${sponsorSnap.refiTermMonths || 24}m`],
                ["Occupancy", sponsorSnap.holdOccupancy === "tenanted" ? "Tenanted" : "Vacant"],
              ] as [string, string][])
            : []),
        ] as [string, string][])
      : ([
          ["Programme", `${sponsorSnap.programmMonths || "—"}m`],
        ] as [string, string][])),
  ];

  return (
    <div className={`page-wrap theme-${theme}`}>
      <style>{CSS}</style>

      {/* ── TOP BAR ── */}
      <div className="topbar">
        <div className="topbar-brand">Valora</div>
        <div className="topbar-actions">
          <span className={`scenario-badge ${hasActiveOverrides(overrides) ? "custom" : "sponsor"}`}>
            {hasActiveOverrides(overrides) ? "Custom Scenario" : "Sponsor's Case"}
          </span>
          <div className="theme-toggle">
            <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>Dark</button>
            <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>Light</button>
          </div>
        </div>
      </div>

      {/* ── ROOM ── */}
      <div className="room">
        {/* LEFT: ASSUMPTION LEDGER */}
        {sliders ? (
          <AssumptionLedger
            snap={sponsorSnap} sliders={sliders}
            overrides={overrides} onOverride={handleOverride} onReset={handleReset} sym={sym}
          />
        ) : (
          <div className="ledger">
            <div className="ledger-hdr"><span>Assumptions</span></div>
            <div style={{ fontSize: 11, color: "var(--text-d)", padding: "12px 4px", lineHeight: 1.5 }}>
              Live scenario controls coming soon for {assetType} deals. For now, this is the sponsor's published case.
            </div>
          </div>
        )}

        {/* CENTRE: BODY */}
        <div className="body">
          {/* HERO */}
          <div className="hero">
            <div className="hero-eyebrow">
              <span>{assetType}</span>
              {isHotelAdv && <span style={{ color: "var(--gold)" }}>· Advanced · USALI</span>}
              {isFlipHold && <span style={{ color: "var(--gold)" }}>· Hold (BTL)</span>}
              {isFlip && !isFlipHold && <span style={{ color: "var(--gold)" }}>· Sell on Completion</span>}
              <span>· {sponsorSnap.currency || "GBP"}</span>
              {sponsorSnap.location && <span>· {sponsorSnap.location}</span>}
            </div>
            <h1 className="hero-title">{appraisal.name || "Untitled Appraisal"}</h1>
            <div className="hero-sub">
              {isHotelAdv
                ? `${sponsorSnap.holdYears || 5}-year institutional hold · ${sponsorSnap.rooms || "—"} keys`
                : isFlip
                ? `${sponsorSnap.propertySqft ? `${sponsorSnap.propertySqft.toLocaleString()} sqft · ` : ""}${sponsorSnap.programmMonths || 9}m refurb · ${sponsorSnap.bridgingTermMonths || 12}m bridge${isFlipHold ? ` · ${sponsorSnap.refiTermMonths || 24}m hold` : ""}`
                : `${sponsorSnap.programmMonths || "—"}m programme`}
            </div>

            <div className="metric-strip">
              <div className="metric-strip-inner">
                <MetricCell
                  label={headlineLabel}
                  value={fmt(liveHeadline, sym)}
                  baseColor="var(--gold)"
                  delta={hasActiveOverrides(overrides) ? { pct: deltaPct(liveHeadline, sponsorHeadline), absolute: fmt(liveHeadline - sponsorHeadline, sym) } : null}
                />
                <MetricCell
                  label="Profit"
                  value={fmt(liveProfit, sym)}
                  baseColor={profitColor}
                  delta={hasActiveOverrides(overrides) ? { pct: deltaPct(liveProfit, sponsorProfit), absolute: fmt(liveProfit - sponsorProfit, sym) } : null}
                />
                <MetricCell
                  label={returnsLabel}
                  value={fmtPct(liveReturns)}
                  baseColor={returnsColor}
                  delta={hasActiveOverrides(overrides) ? { pct: liveReturns - sponsorReturns, absolute: `${((liveReturns - sponsorReturns) * 100).toFixed(1)}pp` } : null}
                />
                <MetricCell
                  label={isFlip ? "IRR" : "IRR (Levered)"}
                  value={fmtPct(liveIrr)}
                  baseColor="var(--blue)"
                  delta={hasActiveOverrides(overrides) ? { pct: liveIrr - sponsorIrr, absolute: `${((liveIrr - sponsorIrr) * 100).toFixed(1)}pp` } : null}
                />
                {/* Final tile: for Flip show Equity Multiple (more meaningful than Equity In),
                    for everyone else keep Equity In as before */}
                <MetricCell
                  label={isFlip ? "Equity Multiple" : "Equity In"}
                  value={isFlip ? fmtX(liveMoic) : fmt(liveEquity, sym)}
                  baseColor="var(--gold)"
                  delta={null}
                />
              </div>
            </div>
          </div>

          {/* RETURNS SUMMARY */}
          <div className="section">
            <div className="section-title">Returns Summary</div>
            <div className="section-sub">All values recompute live as you flex assumptions on the left.</div>
            <div className="two-col">
              <div className="data-card">
                {returnsRows.map(([l, v, c, bold]) => (
                  <div key={l} className="data-row">
                    <span className={bold ? "data-label-bold" : "data-label"}>{l}</span>
                    <span className={bold ? "data-value-bold" : "data-value"} style={{ color: c }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="data-card">
                {infoRows.map(([l, v]) => (
                  <div key={l} className="data-row">
                    <span className="data-label">{l}</span>
                    <span className="data-value" style={{ color: "var(--text-m)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* HOTEL ADVANCED — PER-KEY + CASHFLOW (only if applicable) */}
          {isHotelAdv && liveHotelAdv && (
            <>
              <div className="section">
                <div className="section-title">Per Key Metrics</div>
                <div className="section-sub">Live, recomputed from current assumptions.</div>
                <div className="per-key-grid">
                  {[
                    ["Purchase / Key", fmt(liveHotelAdv.pricePerKey || 0, sym), "var(--text)"],
                    ["CapEx / Key", fmt(liveHotelAdv.capexPerKey || 0, sym), "var(--amber)"],
                    ["Exit Value / Key", fmt(liveHotelAdv.exitValuePerKey || 0, sym), "var(--gold)"],
                    ["EBITDA / Key", fmt(liveHotelAdv.ebitdaPerKey || 0, sym), "var(--green)"],
                    ["NOI / Key", fmt(liveHotelAdv.noiPerKey || 0, sym), "var(--blue)"],
                    ["NOI Conversion", fmtPct(liveHotelAdv.noiConversion || 0), "var(--text-m)"],
                  ].map(([l, v, c]: any) => (
                    <div key={l} className="per-key-card">
                      <div className="per-key-label">{l}</div>
                      <div className="per-key-value" style={{ color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section">
                <div className="section-title">Investor Cashflow</div>
                <div className="section-sub">Year-by-year. Updates live as you flex inputs.</div>
                <div className="data-card" style={{ overflowX: "auto" }}>
                  <table className="cf-table">
                    <thead>
                      <tr>
                        <th className="cf-th"></th>
                        <th className="cf-th">Day 1</th>
                        {Array.from({ length: num(sponsorSnap.holdYears || 5) }, (_, i) => (
                          <th key={i} className="cf-th" style={{ color: i === num(sponsorSnap.holdYears || 5) - 1 ? "var(--gold)" : undefined }}>
                            Yr {i + 1}{i === num(sponsorSnap.holdYears || 5) - 1 ? " (Exit)" : ""}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Revenue", fn: (y: any) => y.totalRev, color: "var(--text-m)" },
                        { label: "EBITDA", fn: (y: any) => y.ebitda, color: "var(--text)" },
                        { label: "FF&E", fn: (y: any) => -y.ffe, color: "var(--amber)" },
                        { label: "NOI", fn: (y: any) => y.noi, color: "var(--green)", bold: true },
                      ].map(row => (
                        <tr key={row.label}>
                          <td className="cf-td" style={{ color: row.color, fontWeight: row.bold ? 600 : 400 }}>{row.label}</td>
                          <td className="cf-td">—</td>
                          {(liveHotelAdv.yearRevenue || []).map((y: any, i: number) => {
                            const v = row.fn(y);
                            return <td key={i} className="cf-td" style={{ color: v < 0 ? "var(--red)" : row.color, fontWeight: row.bold ? 600 : 400 }}>{fmt(Math.abs(v), sym)}</td>;
                          })}
                        </tr>
                      ))}
                      <tr>
                        <td className="cf-td" style={{ color: "var(--red)" }}>Equity Out</td>
                        <td className="cf-td" style={{ color: "var(--red)" }}>{fmt(liveHotelAdv.equity || 0, sym)}</td>
                        {Array.from({ length: num(sponsorSnap.holdYears || 5) }, (_, i) => (<td key={i} className="cf-td">—</td>))}
                      </tr>
                      <tr>
                        <td className="cf-td" style={{ color: "var(--gold)", fontWeight: 600 }}>Disposal (Net)</td>
                        <td className="cf-td">—</td>
                        {Array.from({ length: num(sponsorSnap.holdYears || 5) }, (_, i) => (
                          <td key={i} className="cf-td" style={{ color: "var(--gold)", fontWeight: 600 }}>
                            {i === num(sponsorSnap.holdYears || 5) - 1 ? fmt(liveHotelAdv.netExitProceeds || 0, sym) : "—"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* STOCHASTIC — Pro feature, owner-controlled */}
          {link?.can_see_stochastic && isHotelAdv && (
            <StochasticPanel snap={liveSnap} assetType={assetType} sym={sym} />
          )}

          {/* FOOTER */}
          <div className="share-footer">
            <div>
              <div className="topbar-brand" style={{ fontSize: 14 }}>Valora</div>
              <div style={{ fontSize: 10, color: "var(--text-d)", marginTop: 3, letterSpacing: ".08em", textTransform: "uppercase" }}>The Underwriting Room for Real Estate</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {link?.can_export_excel && (
                <button className="btn-ghost" onClick={exportExcel}>↓ Export Excel</button>
              )}
              <a href="https://valoraplatform.io" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--gold)", textDecoration: "none" }}>valoraplatform.io ↗</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STOCHASTIC PANEL — Monte Carlo on the recipient's current scenario
// ─────────────────────────────────────────────────────────────────────────────
function StochasticPanel({ snap, assetType, sym }: { snap: any; assetType: string; sym: string }) {
  // Default distributions for Hotel Advanced — triangular ±15% on the four
  // headline drivers, normal ±50bps on exit cap rate. These match the LP
  // intuition that "anything could happen but extremes are rare".
  const mcResult = useMemo(() => {
    try {
      return runMonteCarlo(assetType, snap, {
        iterations: 1500, // 1.5k is a sweet spot — fast on mobile, statistically meaningful
        seed: 42,         // deterministic so two viewers see the same bands
        distributions: {
          exitCapRate: { kind: "normal", mean: num(snap.exitCapRate ?? 5.75), stdev: 0.5, clipMin: 1, clipMax: 15 },
          adr: { kind: "triangular", min: num(snap.adr ?? 180) * 0.85, mode: num(snap.adr ?? 180), max: num(snap.adr ?? 180) * 1.15 },
          occupancy: { kind: "triangular", min: Math.max(20, num(snap.occupancy ?? 72) - 10), mode: num(snap.occupancy ?? 72), max: Math.min(100, num(snap.occupancy ?? 72) + 10) },
          capexBudget: { kind: "triangular", min: num(snap.capexBudget ?? 5e6) * 0.9, mode: num(snap.capexBudget ?? 5e6), max: num(snap.capexBudget ?? 5e6) * 1.2 },
        },
        metrics: ["irr", "moic", "profit", "poc"],
      });
    } catch { return null; }
  }, [snap, assetType]);

  if (!mcResult) return null;
  const irrBand = mcResult.metrics.irr;

  // Build histogram bins for IRR
  const samples = mcResult.samples.irr || [];
  const bins = 24;
  const lo = Math.min(...samples), hi = Math.max(...samples);
  const binWidth = (hi - lo) / bins;
  const counts = Array(bins).fill(0);
  samples.forEach(v => {
    const idx = Math.min(bins - 1, Math.floor((v - lo) / binWidth));
    counts[idx]++;
  });
  const maxCount = Math.max(...counts, 1);

  return (
    <div className="section">
      <div className="section-title">Stochastic — Monte Carlo</div>
      <div className="section-sub">{mcResult.metrics.irr.n.toLocaleString()} simulations across exit cap rate, ADR, occupancy and CapEx. The bars show the IRR distribution.</div>

      <div className="mc-band">
        <div className="mc-band-card p10">
          <div className="mc-band-label">P10 (Downside)</div>
          <div className="mc-band-value">{fmtPct(irrBand.p10)}</div>
        </div>
        <div className="mc-band-card p50">
          <div className="mc-band-label">P50 (Median)</div>
          <div className="mc-band-value">{fmtPct(irrBand.p50)}</div>
        </div>
        <div className="mc-band-card p90">
          <div className="mc-band-label">P90 (Upside)</div>
          <div className="mc-band-value">{fmtPct(irrBand.p90)}</div>
        </div>
      </div>

      <div className="data-card">
        <div style={{ fontSize: 10, color: "var(--text-d)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>IRR Distribution</div>
        <div className="mc-histogram">
          {counts.map((c, i) => (
            <div key={i} className="mc-bar" style={{ height: `${(c / maxCount) * 100}%` }} title={`${fmtPct(lo + i * binWidth)} – ${fmtPct(lo + (i + 1) * binWidth)}: ${c} runs`} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-d)" }}>
          <span>{fmtPct(lo)}</span><span>{fmtPct(hi)}</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-m)", marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--divider)" }}>
          Mean: <strong style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>{fmtPct(irrBand.mean)}</strong> ·
          {" "}Std Dev: <strong style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>{fmtPct(irrBand.stdev)}</strong> ·
          {" "}P(IRR &lt; 8%) ≈ <strong style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>{fmtPct(samples.filter(v => v < 0.08).length / samples.length)}</strong>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE — load link, gate, then mount Room
// ─────────────────────────────────────────────────────────────────────────────
function SharePage() {
  const params = useParams();
  const slug = params?.token as string;

  const [link, setLink] = useState<any>(null);
  const [appraisal, setAppraisal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);

  // ── LOAD LINK + APPRAISAL ─────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: linkData } = await supabase.from("share_links").select("*").eq("slug", slug).maybeSingle();
      if (!linkData) { setNotFound(true); setLoading(false); return; }
      // Check expiry / revocation client-side too (RLS already filters server-side)
      if (linkData.revoked_at || (linkData.expires_at && new Date(linkData.expires_at) < new Date())) {
        setNotFound(true); setLoading(false); return;
      }
      setLink(linkData);

      const { data: apprData } = await supabase.from("appraisals").select("*").eq("id", linkData.appraisal_id).maybeSingle();
      if (!apprData) { setNotFound(true); setLoading(false); return; }
      setAppraisal(apprData);

      // Public mode auto-unlocks
      if (linkData.access_mode === "public") setUnlocked(true);
      setLoading(false);
    })();
  }, [slug]);

  // ── ON UNLOCK: create share_view row ──────────────────────────────────────
  useEffect(() => {
    if (!unlocked || !link || viewId) return;
    (async () => {
      const sessionId = getOrCreateSessionId();
      const { data } = await supabase.from("share_views").insert({
        share_link_id: link.id,
        recipient_session_id: sessionId,
        recipient_email: recipientEmail,
        recipient_user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : null,
      }).select().single();
      if (data) setViewId(data.id);
    })();
  }, [unlocked, link, recipientEmail, viewId]);

  if (loading) return <Spinner />;
  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "0 24px", textAlign: "center" }}>
      <style>{CSS}</style>
      <div style={{ fontSize: 40, color: "var(--text-d)" }}>◈</div>
      <div style={{ fontFamily: "Inter", fontSize: 24, fontWeight: 300 }}>Appraisal not available</div>
      <div style={{ fontSize: 13, color: "var(--text-d)" }}>This link may have expired or been revoked by the sponsor.</div>
    </div>
  );

  // ── GATE BRANCHES ─────────────────────────────────────────────────────────
  if (!unlocked && link.access_mode === "password") {
    return <><style>{CSS}</style><PasswordGate slug={slug} onUnlock={() => setUnlocked(true)} /></>;
  }
  if (!unlocked && link.access_mode === "email") {
    return <><style>{CSS}</style><EmailGate onSubmit={(email) => { setRecipientEmail(email); setUnlocked(true); }} /></>;
  }

  return <UnderwriteRoom link={link} appraisal={appraisal} viewId={viewId} />;
}

export default function SharePageWrapper() {
  return <Suspense fallback={<Spinner />}><SharePage /></Suspense>;
}
