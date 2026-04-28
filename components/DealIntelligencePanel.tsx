"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// VALORA — DealIntelligencePanel
//
// Slide-in right-side panel for managing one deal: Overview / Sharing / Intelligence.
// Mounted from /portfolio when a card is clicked. All data fetched in one RPC call.
//
// Three tabs:
//   • Overview      — appraisal headlines + recent activity sparkline
//   • Sharing       — active links list + create/revoke/copy/edit
//   • Intelligence  — per-viewer cards + aggregate sensitivity heat
//
// All write actions go through Supabase RPCs (revoke_share_link, update_share_link,
// create_share_link). All reads through get_deal_intelligence (single round trip).
// ─────────────────────────────────────────────────────────────────────────────

const PANEL_CSS = `
@keyframes valora-panel-in{from{transform:translateX(100%)}to{transform:translateX(0)}}
@keyframes valora-overlay-in{from{opacity:0}to{opacity:1}}
@keyframes valora-spin{to{transform:rotate(360deg)}}

.dip-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(3px);z-index:300;animation:valora-overlay-in .15s ease both;display:flex;justify-content:flex-end;}
.dip-panel{
  width:min(720px, 96vw);
  height:100vh;
  background:var(--bg);
  border-left:1px solid var(--border-m);
  box-shadow:-30px 0 60px rgba(0,0,0,0.35);
  display:flex;flex-direction:column;
  animation:valora-panel-in .25s cubic-bezier(.16,1,.3,1) both;
  overflow:hidden;
}
.dip-header{
  padding:22px 26px 0;
  border-bottom:1px solid var(--border);
  background:var(--bg2);
}
.dip-header-row{
  display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:18px;
}
.dip-title{
  font-family:var(--font-display);font-size:22px;font-weight:700;
  letter-spacing:-.025em;line-height:1.2;color:var(--text);
}
.dip-subtitle{
  font-size:12px;color:var(--text-d);margin-top:4px;font-weight:500;
  display:flex;align-items:center;gap:8px;flex-wrap:wrap;
}
.dip-pill{
  display:inline-flex;align-items:center;font-size:10px;font-weight:600;
  padding:3px 10px;border-radius:4px;letter-spacing:.02em;
  background:var(--gold-bg);color:var(--gold);border:1px solid var(--gold-border);
}
.dip-actions{display:flex;gap:6px;flex-shrink:0}
.dip-btn-close{
  background:none;border:none;color:var(--text-d);cursor:pointer;
  padding:6px 9px;border-radius:6px;font-size:18px;line-height:1;
  transition:all .15s ease;
}
.dip-btn-close:hover{background:var(--bg3);color:var(--text)}
.dip-btn-open{
  background:var(--gold);color:var(--bg);border:none;border-radius:8px;
  padding:8px 14px;font-family:var(--font-body);font-size:12px;font-weight:600;
  cursor:pointer;display:inline-flex;align-items:center;gap:5px;
  transition:background .15s ease;
}
.dip-btn-open:hover{background:var(--gold-l)}

.dip-tabs{display:flex;gap:0;border-top:1px solid transparent}
.dip-tab{
  background:none;border:none;border-bottom:2px solid transparent;
  padding:12px 18px;font-size:12px;font-weight:600;
  color:var(--text-d);cursor:pointer;font-family:var(--font-body);
  letter-spacing:.04em;text-transform:uppercase;
  transition:all .15s ease;margin-bottom:-1px;
  display:flex;align-items:center;gap:7px;
}
.dip-tab:hover{color:var(--text-m)}
.dip-tab.active{color:var(--gold);border-bottom-color:var(--gold)}
.dip-tab-count{
  background:var(--bg3);color:var(--text-d);
  border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700;
  letter-spacing:0;text-transform:none;
}
.dip-tab.active .dip-tab-count{background:var(--gold-bg);color:var(--gold)}

.dip-body{flex:1;overflow-y:auto;padding:24px 26px}

.dip-section-title{
  font-size:10px;color:var(--text-d);text-transform:uppercase;
  letter-spacing:.14em;font-weight:600;margin-bottom:12px;
}
.dip-empty{
  text-align:center;padding:48px 20px;
  background:var(--bg2);border:1px dashed var(--border-m);
  border-radius:10px;
}
.dip-empty-icon{font-size:30px;color:var(--text-d);margin-bottom:10px;opacity:0.5}
.dip-empty-title{font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px;font-family:var(--font-display);letter-spacing:-.01em}
.dip-empty-sub{font-size:12px;color:var(--text-d);max-width:340px;margin:0 auto 14px;line-height:1.55;font-weight:500}

.dip-card{
  background:var(--bg2);border:1px solid var(--border);border-radius:10px;
  padding:14px 16px;margin-bottom:10px;
}
.dip-card-row{display:flex;justify-content:space-between;align-items:center;gap:12px}

/* ── Overview metrics ── */
.dip-metric-grid{
  display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));
  gap:10px;margin-bottom:18px;
}
.dip-metric-cell{
  background:var(--bg2);border:1px solid var(--border);border-radius:8px;
  padding:12px 14px;
}
.dip-metric-label{
  font-size:9px;color:var(--text-d);text-transform:uppercase;
  letter-spacing:.1em;font-weight:600;margin-bottom:5px;
}
.dip-metric-value{
  font-family:var(--font-mono);font-size:17px;font-weight:600;
  letter-spacing:-.01em;
}

/* ── Share link list ── */
.dip-link-card{
  background:var(--bg2);border:1px solid var(--border);border-radius:10px;
  padding:14px 16px;margin-bottom:10px;transition:border-color .15s;
}
.dip-link-card:hover{border-color:var(--border-m)}
.dip-link-card.revoked{opacity:0.55}
.dip-link-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px}
.dip-link-label{font-size:13px;font-weight:600;color:var(--text);font-family:var(--font-display);letter-spacing:-.005em}
.dip-link-meta{font-size:10px;color:var(--text-d);font-family:var(--font-mono);letter-spacing:0;margin-top:3px}
.dip-link-mode{
  display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;
  padding:2px 8px;border-radius:4px;letter-spacing:.02em;
}
.dip-link-mode.public{background:rgba(92,165,220,.1);color:var(--blue);border:1px solid rgba(92,165,220,.25)}
.dip-link-mode.password{background:rgba(240,164,41,.1);color:var(--amber);border:1px solid rgba(240,164,41,.28)}
.dip-link-mode.email{background:var(--gold-bg);color:var(--gold);border:1px solid var(--gold-border)}
.dip-link-stats{display:flex;gap:14px;font-size:11px;color:var(--text-m);font-family:var(--font-mono);font-weight:500;margin:8px 0}
.dip-link-stat{display:flex;align-items:center;gap:4px}
.dip-link-stat-label{color:var(--text-d);font-family:var(--font-body);font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:600}
.dip-link-actions{display:flex;gap:6px;justify-content:flex-end;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)}

.dip-mini-btn{
  background:transparent;color:var(--text-m);border:1px solid var(--border-m);
  border-radius:6px;padding:5px 10px;font-size:11px;font-weight:500;
  cursor:pointer;font-family:var(--font-body);transition:all .15s ease;
}
.dip-mini-btn:hover{border-color:var(--gold);color:var(--gold)}
.dip-mini-btn.danger{border-color:rgba(244,100,95,.3)}
.dip-mini-btn.danger:hover{border-color:var(--red);color:var(--red);background:rgba(244,100,95,.06)}

.dip-create-link-btn{
  width:100%;background:var(--gold-bg);color:var(--gold);
  border:1px dashed var(--gold-border);border-radius:10px;
  padding:14px;font-family:var(--font-body);font-size:13px;font-weight:600;
  cursor:pointer;transition:all .15s ease;margin-bottom:14px;
  display:flex;align-items:center;justify-content:center;gap:6px;
}
.dip-create-link-btn:hover{background:var(--gold);color:var(--bg);border-style:solid}

/* ── Viewer cards ── */
.dip-viewer-card{
  background:var(--bg2);border:1px solid var(--border);border-radius:10px;
  padding:14px 16px;margin-bottom:10px;cursor:pointer;
  transition:border-color .15s,transform .15s;
}
.dip-viewer-card:hover{border-color:var(--gold-border);transform:translateY(-1px)}
.dip-viewer-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
.dip-viewer-id{font-size:13px;font-weight:600;color:var(--text);font-family:var(--font-display);letter-spacing:-.005em}
.dip-viewer-anonymous{color:var(--text-m);font-style:italic;font-weight:500}
.dip-viewer-when{font-size:10px;color:var(--text-d);font-family:var(--font-mono)}
.dip-viewer-stats{display:flex;gap:16px;margin:8px 0 4px;font-size:11px;color:var(--text-m);font-weight:500}
.dip-engagement-dots{display:inline-flex;gap:2px;margin-left:4px}
.dip-engagement-dot{width:5px;height:5px;border-radius:50%;background:var(--bg5)}
.dip-engagement-dot.lit{background:var(--gold)}
.dip-viewer-flexed{
  display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;
  padding-top:8px;border-top:1px solid var(--border);
}
.dip-flex-chip{
  font-size:10px;font-family:var(--font-mono);font-weight:500;
  background:var(--bg3);color:var(--text-m);
  padding:3px 8px;border-radius:4px;letter-spacing:0;
}

/* ── Aggregate heat ── */
.dip-heat-row{
  display:grid;grid-template-columns:140px 1fr 70px;gap:12px;
  align-items:center;padding:9px 0;border-bottom:1px solid var(--border);
  font-size:12px;
}
.dip-heat-row:last-child{border-bottom:none}
.dip-heat-label{font-weight:500;color:var(--text-m)}
.dip-heat-bar{height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;position:relative}
.dip-heat-fill{height:100%;background:linear-gradient(90deg,var(--gold-l),var(--gold));border-radius:3px;transition:width .4s ease}
.dip-heat-count{font-family:var(--font-mono);font-size:11px;color:var(--text-d);text-align:right;font-weight:500}

/* ── Loader ── */
.dip-loader{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:60px 20px;gap:10px;
}
.dip-loader-spinner{width:24px;height:24px;border:2px solid var(--border-m);border-top-color:var(--gold);border-radius:50%;animation:valora-spin .7s linear infinite}
.dip-loader-text{font-size:11px;color:var(--text-d);text-transform:uppercase;letter-spacing:.1em;font-weight:600}
`;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n: number, sym = "£") => {
  if (!n || !isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${sym}${(n / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${sym}${(n / 1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${sym}${(n / 1e3).toFixed(0)}k`;
  return `${sym}${n.toFixed(0)}`;
};
const fmtPct = (n: number) => (n == null || !isFinite(n) ? "—" : `${(n * 100).toFixed(1)}%`);
const fmtX = (n: number) => (n == null || !isFinite(n) || n === 0 ? "—" : `${n.toFixed(2)}×`);

const timeAgo = (iso: string): string => {
  if (!iso) return "—";
  const sec = (Date.now() - new Date(iso).getTime()) / 1000;
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
  if (sec < 7 * 86400) return `${Math.round(sec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const formatDuration = (seconds: number): string => {
  if (!seconds) return "—";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£", USD: "$", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$",
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type ShareLink = {
  id: string;
  slug: string;
  appraisal_id: string;
  appraisal_name: string;
  created_at: string;
  access_mode: "public" | "password" | "email";
  expires_at: string | null;
  revoked_at: string | null;
  label: string | null;
  can_export_excel: boolean;
  can_save_scenarios: boolean;
  can_see_stochastic: boolean;
};

type ShareView = {
  id: string;
  share_link_id: string;
  slug: string;
  link_label: string | null;
  recipient_email: string | null;
  recipient_session_id: string;
  opened_at: string;
  last_active_at: string;
  total_active_seconds: number;
  sections_viewed: string[];
  scenarios_created: number;
  excel_exported: boolean;
  live_score: number;
  override_count: number;
};

type OverrideAggregate = {
  input_path: string;
  flex_count: number;
  avg_delta: number;
  avg_new_value: number;
  distinct_viewers: number;
};

type IntelligenceData = {
  links: ShareLink[];
  views: ShareView[];
  override_aggregate: OverrideAggregate[];
  totals: {
    active_links: number;
    total_links: number;
    total_views: number;
    unique_viewers: number;
    total_scenarios_saved: number;
    last_activity: string | null;
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function DealIntelligencePanel({
  project, onClose, onOpenAppraisal,
}: {
  project: any;
  onClose: () => void;
  onOpenAppraisal: () => void;
}) {
  const [tab, setTab] = useState<"overview" | "sharing" | "intelligence">("overview");
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const sym = CURRENCY_SYMBOLS[project.currency] || "£";
  const latest = project.appraisals?.[0];

  // ── Load intelligence data ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: rpcData, error } = await supabase.rpc("get_deal_intelligence", {
        p_project_id: project.id,
      });
      if (cancelled) return;
      if (error) {
        console.error("Failed to load intelligence:", error);
        setData({ links: [], views: [], override_aggregate: [], totals: { active_links: 0, total_links: 0, total_views: 0, unique_viewers: 0, total_scenarios_saved: 0, last_activity: null } });
      } else {
        setData(rpcData as IntelligenceData);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [project.id, refreshKey]);

  // ── ESC to close ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleRevoke = useCallback(async (linkId: string) => {
    if (!confirm("Revoke this share link? Anyone with the URL will lose access immediately.")) return;
    const { error } = await supabase.rpc("revoke_share_link", { p_link_id: linkId });
    if (error) {
      alert(`Could not revoke: ${error.message}`);
      return;
    }
    setRefreshKey(k => k + 1);
  }, []);

  const handleCopyLink = useCallback(async (slug: string) => {
    const url = `${window.location.origin}/share/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }, []);

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="dip-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{PANEL_CSS}</style>
      <div className="dip-panel">
        {/* HEADER */}
        <div className="dip-header">
          <div className="dip-header-row">
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="dip-title">{project.name || "Untitled"}</div>
              <div className="dip-subtitle">
                <span className="dip-pill">{project.asset_type}</span>
                <span>{project.location || "No location set"}</span>
                {data?.totals.last_activity && (
                  <span style={{ color: "var(--gold)", fontWeight: 600 }}>
                    · Last opened {timeAgo(data.totals.last_activity)}
                  </span>
                )}
              </div>
            </div>
            <div className="dip-actions">
              <button className="dip-btn-open" onClick={onOpenAppraisal}>
                Open Appraisal →
              </button>
              <button className="dip-btn-close" onClick={onClose} title="Close (Esc)">×</button>
            </div>
          </div>

          <div className="dip-tabs">
            <button className={`dip-tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>
              Overview
            </button>
            <button className={`dip-tab ${tab === "sharing" ? "active" : ""}`} onClick={() => setTab("sharing")}>
              Sharing
              {data && data.totals.active_links > 0 && (
                <span className="dip-tab-count">{data.totals.active_links}</span>
              )}
            </button>
            <button className={`dip-tab ${tab === "intelligence" ? "active" : ""}`} onClick={() => setTab("intelligence")}>
              Intelligence
              {data && data.totals.total_views > 0 && (
                <span className="dip-tab-count">{data.totals.total_views}</span>
              )}
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="dip-body">
          {loading && (
            <div className="dip-loader">
              <div className="dip-loader-spinner" />
              <div className="dip-loader-text">Loading intelligence</div>
            </div>
          )}

          {!loading && tab === "overview" && (
            <OverviewTab project={project} latest={latest} sym={sym} totals={data?.totals} />
          )}

          {!loading && tab === "sharing" && data && (
            <SharingTab
              links={data.links}
              project={project}
              onRevoke={handleRevoke}
              onCopy={handleCopyLink}
              onCreated={() => setRefreshKey(k => k + 1)}
            />
          )}

          {!loading && tab === "intelligence" && data && (
            <IntelligenceTab views={data.views} overrideAggregate={data.override_aggregate} sym={sym} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab({ project, latest, sym, totals }: any) {
  if (!latest) {
    return (
      <div className="dip-empty">
        <div className="dip-empty-icon">◆</div>
        <div className="dip-empty-title">No appraisal yet</div>
        <div className="dip-empty-sub">This project hasn't had its appraisal saved. Open the editor to set up the deal model.</div>
      </div>
    );
  }

  const profitColor = latest.profit > 0 ? "var(--green)" : "var(--red)";
  const pocColor = latest.profit_on_cost > 0.2 ? "var(--green)" : latest.profit_on_cost > 0.1 ? "var(--amber)" : "var(--red)";

  return (
    <>
      <div className="dip-section-title">Headline Metrics</div>
      <div className="dip-metric-grid">
        <Metric label="GDV / Exit Value" value={fmt(latest.gdv, sym)} color="var(--gold)" />
        <Metric label="Total Cost" value={fmt(latest.total_cost, sym)} color="var(--text-m)" />
        <Metric label="Profit" value={fmt(latest.profit, sym)} color={profitColor} />
        <Metric label="Profit on Cost" value={fmtPct(latest.profit_on_cost)} color={pocColor} />
        <Metric label="IRR (Unlevered)" value={fmtPct(latest.irr_unlevered)} color="var(--blue)" />
        <Metric label="Status" value={latest.status || "draft"} color="var(--text-m)" />
      </div>

      {totals && totals.total_views > 0 && (
        <>
          <div className="dip-section-title" style={{ marginTop: 24 }}>Engagement</div>
          <div className="dip-metric-grid">
            <Metric label="Active Links" value={String(totals.active_links)} color="var(--gold)" />
            <Metric label="Total Views" value={String(totals.total_views)} color="var(--text)" />
            <Metric label="Unique Viewers" value={String(totals.unique_viewers)} color="var(--text)" />
            <Metric label="Scenarios Saved" value={String(totals.total_scenarios_saved)} color="var(--blue)" />
          </div>
        </>
      )}

      <div className="dip-section-title" style={{ marginTop: 24 }}>Project Detail</div>
      <div className="dip-card">
        <DataRow label="Asset Type" value={project.asset_type} />
        <DataRow label="Location" value={project.location || "—"} />
        <DataRow label="Currency" value={project.currency || "GBP"} />
        <DataRow label="Created" value={new Date(project.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
        <DataRow label="Appraisal Versions" value={String(project.appraisals?.length || 0)} last />
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: SHARING
// ─────────────────────────────────────────────────────────────────────────────
function SharingTab({ links, project, onRevoke, onCopy, onCreated }: any) {
  const [showCreate, setShowCreate] = useState(false);

  if (!showCreate && links.length === 0) {
    return (
      <>
        <div className="dip-empty">
          <div className="dip-empty-icon">◈</div>
          <div className="dip-empty-title">No share links yet</div>
          <div className="dip-empty-sub">
            Create a link to share this deal as a live, interactive Underwrite Room. Recipients can flex assumptions, run Monte Carlo, and you'll see exactly what they probe.
          </div>
          <button
            className="dip-btn-open"
            onClick={() => setShowCreate(true)}
            style={{ marginTop: 6 }}
          >
            + Create share link
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {!showCreate && (
        <button className="dip-create-link-btn" onClick={() => setShowCreate(true)}>
          + Create new share link
        </button>
      )}

      {showCreate && (
        <CreateLinkForm
          project={project}
          onCancel={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); onCreated(); }}
        />
      )}

      {links.map((link: ShareLink) => {
        const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
        const isRevoked = !!link.revoked_at;
        const status = isRevoked ? "revoked" : isExpired ? "expired" : "active";
        return (
          <div key={link.id} className={`dip-link-card ${isRevoked || isExpired ? "revoked" : ""}`}>
            <div className="dip-link-top">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="dip-link-label">{link.label || "Untitled link"}</div>
                <div className="dip-link-meta">
                  /share/{link.slug.slice(0, 12)}…  ·  Created {timeAgo(link.created_at)}
                  {link.expires_at && !isExpired && !isRevoked && <> · Expires {new Date(link.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</>}
                </div>
              </div>
              <span className={`dip-link-mode ${link.access_mode}`}>
                {link.access_mode === "public" && "🌐 Public"}
                {link.access_mode === "password" && "🔒 Password"}
                {link.access_mode === "email" && "✉ Email-gated"}
              </span>
            </div>

            {status !== "active" && (
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--red)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600, marginTop: 4 }}>
                {status === "revoked" ? "Revoked " + timeAgo(link.revoked_at!) : "Expired " + timeAgo(link.expires_at!)}
              </div>
            )}

            {status === "active" && (
              <div className="dip-link-actions">
                <button className="dip-mini-btn" onClick={() => onCopy(link.slug)}>Copy URL</button>
                <button className="dip-mini-btn" onClick={() => window.open(`/share/${link.slug}`, "_blank")}>Open</button>
                <button className="dip-mini-btn danger" onClick={() => onRevoke(link.id)}>Revoke</button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE LINK FORM
// ─────────────────────────────────────────────────────────────────────────────
function CreateLinkForm({ project, onCancel, onCreated }: any) {
  const [label, setLabel] = useState("");
  const [accessMode, setAccessMode] = useState<"public" | "password" | "email">("public");
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const latest = project.appraisals?.[0];
    if (!latest) {
      setError("No appraisal saved on this project yet — open the editor and save first.");
      return;
    }
    if (accessMode === "password" && !password.trim()) {
      setError("Password required for password-protected links.");
      return;
    }
    setBusy(true);
    const { data, error: rpcErr } = await supabase.rpc("create_share_link", {
      p_appraisal_id: latest.id,
      p_access_mode: accessMode,
      p_password: accessMode === "password" ? password : null,
      p_expires_at: expiresAt || null,
      p_label: label.trim() || null,
    });
    setBusy(false);
    if (rpcErr) {
      setError(rpcErr.message);
      return;
    }
    // Copy to clipboard automatically
    const url = `${window.location.origin}/share/${data}`;
    try { await navigator.clipboard.writeText(url); } catch {}
    onCreated();
  };

  return (
    <div className="dip-card" style={{ borderColor: "var(--gold-border)", background: "var(--gold-bg)" }}>
      <div className="dip-section-title" style={{ marginBottom: 14, color: "var(--gold)" }}>New Share Link</div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 600, display: "block", marginBottom: 5 }}>
          Label <span style={{ color: "var(--text-d)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(your reference, not shown to recipient)</span>
        </label>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="e.g. Brookfield IC, Knight Frank teaser"
          style={{ width: "100%", padding: "9px 12px", background: "var(--bg)", border: "1px solid var(--border-m)", borderRadius: 7, color: "var(--text)", fontSize: 13, fontFamily: "var(--font-body)", outline: "none" }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 600, display: "block", marginBottom: 5 }}>Access Mode</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {([
            ["public", "🌐 Public", "Anyone with link"],
            ["password", "🔒 Password", "Restricted access"],
            ["email", "✉ Email", "Capture viewer email"],
          ] as const).map(([mode, label, sub]) => (
            <button
              key={mode}
              onClick={() => setAccessMode(mode)}
              style={{
                padding: "9px 8px", border: `1px solid ${accessMode === mode ? "var(--gold)" : "var(--border-m)"}`,
                borderRadius: 7, background: accessMode === mode ? "var(--gold-bg)" : "var(--bg)",
                color: accessMode === mode ? "var(--gold)" : "var(--text-m)",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)",
                display: "flex", flexDirection: "column", gap: 2, transition: "all .15s ease",
              }}
            >
              <span>{label}</span>
              <span style={{ fontSize: 9, fontWeight: 500, opacity: 0.7 }}>{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {accessMode === "password" && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 600, display: "block", marginBottom: 5 }}>Password</label>
          <input
            type="text"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Share this with your recipient separately"
            style={{ width: "100%", padding: "9px 12px", background: "var(--bg)", border: "1px solid var(--border-m)", borderRadius: 7, color: "var(--text)", fontSize: 13, fontFamily: "var(--font-mono)", outline: "none" }}
          />
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 600, display: "block", marginBottom: 5 }}>
          Expiry <span style={{ color: "var(--text-d)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          type="date"
          value={expiresAt}
          onChange={e => setExpiresAt(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          style={{ width: "100%", padding: "9px 12px", background: "var(--bg)", border: "1px solid var(--border-m)", borderRadius: 7, color: "var(--text)", fontSize: 13, fontFamily: "var(--font-body)", outline: "none" }}
        />
      </div>

      {error && (
        <div style={{ background: "rgba(244,100,95,.1)", border: "1px solid rgba(244,100,95,.3)", borderRadius: 7, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: "var(--red)", fontWeight: 500 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 6 }}>
        <button className="dip-mini-btn" onClick={onCancel} style={{ flex: 1, padding: "9px 14px", fontSize: 12 }}>Cancel</button>
        <button className="dip-btn-open" onClick={submit} disabled={busy} style={{ flex: 2, padding: "9px 14px" }}>
          {busy ? "Creating…" : "Create & Copy URL"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: INTELLIGENCE
// ─────────────────────────────────────────────────────────────────────────────
function IntelligenceTab({ views, overrideAggregate, sym }: { views: ShareView[]; overrideAggregate: OverrideAggregate[]; sym: string }) {
  if (views.length === 0) {
    return (
      <div className="dip-empty">
        <div className="dip-empty-icon">👁</div>
        <div className="dip-empty-title">No views yet</div>
        <div className="dip-empty-sub">
          When recipients open one of your share links, you'll see them here — including how long they spent, which sections they read, and which assumptions they flexed.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dip-section-title">Recipients ({views.length})</div>
      {views.map((v) => <ViewerCard key={v.id} view={v} />)}

      {overrideAggregate.length > 0 && (
        <>
          <div className="dip-section-title" style={{ marginTop: 24 }}>Aggregate sensitivity heat</div>
          <div className="dip-card" style={{ padding: "10px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--text-d)", marginBottom: 12, fontWeight: 500, lineHeight: 1.5 }}>
              Which assumptions recipients flexed most. If multiple viewers pull the same lever in the same direction, that's the market telling you something.
            </div>
            {(() => {
              const maxFlex = Math.max(...overrideAggregate.map(o => o.flex_count));
              return overrideAggregate.map((agg) => (
                <div key={agg.input_path} className="dip-heat-row">
                  <div className="dip-heat-label">{prettyInputPath(agg.input_path)}</div>
                  <div className="dip-heat-bar">
                    <div className="dip-heat-fill" style={{ width: `${(agg.flex_count / maxFlex) * 100}%` }} />
                  </div>
                  <div className="dip-heat-count">{agg.flex_count} {agg.flex_count === 1 ? "flex" : "flexes"}</div>
                </div>
              ));
            })()}
          </div>
        </>
      )}
    </>
  );
}

function ViewerCard({ view }: { view: ShareView }) {
  const identifier = view.recipient_email || `Anonymous viewer · ${view.recipient_session_id.slice(2, 8)}`;
  const isAnon = !view.recipient_email;

  return (
    <div className="dip-viewer-card" onClick={() => { /* TODO: drill-in modal in v1.1 */ }}>
      <div className="dip-viewer-top">
        <div className={`dip-viewer-id ${isAnon ? "dip-viewer-anonymous" : ""}`}>{identifier}</div>
        <div className="dip-viewer-when">{timeAgo(view.last_active_at)}</div>
      </div>
      <div className="dip-viewer-stats">
        <span>⏱ {formatDuration(view.total_active_seconds)}</span>
        <span>⚡ {view.override_count} flexes</span>
        {view.scenarios_created > 0 && <span style={{ color: "var(--gold)" }}>✦ {view.scenarios_created} scenarios saved</span>}
        {view.excel_exported && <span style={{ color: "var(--blue)" }}>↓ Excel exported</span>}
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
          Engagement
          <span className="dip-engagement-dots">
            {[1,2,3,4,5].map(n => <span key={n} className={`dip-engagement-dot ${n <= view.live_score ? "lit" : ""}`} />)}
          </span>
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED ATOMS
// ─────────────────────────────────────────────────────────────────────────────
function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="dip-metric-cell">
      <div className="dip-metric-label">{label}</div>
      <div className="dip-metric-value" style={{ color }}>{value}</div>
    </div>
  );
}

function DataRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: last ? "none" : "1px solid var(--divider, var(--border))", fontSize: 12 }}>
      <span style={{ color: "var(--text-m)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// Pretty-print a dot-path field name for the heat map
function prettyInputPath(path: string): string {
  const map: Record<string, string> = {
    exitCapRate: "Exit Cap Rate",
    adr: "ADR",
    occupancy: "Occupancy",
    capexBudget: "CapEx Budget",
    ltc: "Loan-to-Cost",
    exitYield: "Exit Yield",
    buildCostPsf: "Build Cost / sqft",
    salePricePsf: "Sale Price / sqft",
    rentPcm: "Rent / month",
    niy: "Net Initial Yield",
    holdYears: "Hold Period",
  };
  return map[path] || path;
}