"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold-bg:rgba(201,168,76,0.07);--gold-border:rgba(201,168,76,0.2);
  --bg:#06070a;--bg1:#0c0e12;--bg2:#12151a;--bg3:#191d24;
  --text:#eceae4;--text-m:#7d8590;--text-d:#3d4249;
  --border:rgba(255,255,255,0.06);
  --green:#3ddc84;--red:#f4645f;--amber:#f0a429;--blue:#5b9cf6;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.action-btn{display:flex;flex-direction:column;align-items:flex-start;gap:8px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;cursor:pointer;transition:border-color .2s,transform .15s,box-shadow .2s;font-family:var(--font-body);text-align:left;width:100%}
.action-btn:hover{border-color:var(--gold-border);transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.4)}
.metric-card{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:16px 20px}
`;

const fmt = (n: number, prefix = "£") => {
  if (!n || !isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${prefix}${(n / 1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${prefix}${(n / 1e3).toFixed(0)}k`;
  return `${prefix}${n.toFixed(0)}`;
};
const fmtPct = (n: number) => (!n || !isFinite(n) || isNaN(n) ? "—" : `${(n * 100).toFixed(1)}%`);
const CURRENCY_SYMBOLS: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$" };

export default function WorkspaceProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [appraisal, setAppraisal] = useState<any>(null);
  const [appraisalCount, setAppraisalCount] = useState(0);
  const [firm, setFirm] = useState<any>(null);
  const [memberRole, setMemberRole] = useState<string>("member");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!projectId) { router.push("/workspace"); return; }
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }

      // Get firm membership
      const { data: memberRow } = await supabase
        .from("firm_members")
        .select("firm_id, role, firms(id, name)")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (memberRow?.firms) {
        setFirm(memberRow.firms);
        setMemberRole(memberRow.role || "member");
      }

      // Fetch project directly (no nested join)
      const { data: proj, error: projErr } = await supabase
        .from("projects")
        .select("id, name, location, asset_type, currency, firm_id, created_by, stage")
        .eq("id", projectId)
        .maybeSingle();

      if (projErr || !proj) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProject(proj);

      // Fetch latest appraisal separately (no nested join)
      const { data: appraisals } = await supabase
        .from("appraisals")
        .select("id, gdv, total_cost, profit, profit_on_cost, irr_unlevered, status, created_at, snapshot")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (appraisals && appraisals.length > 0) {
        setAppraisal(appraisals[0]);
        setAppraisalCount(appraisals.length);
      }

      setLoading(false);
    };
    init();
  }, [projectId, router]);

  const openAppraisal = () => {
    if (appraisal) {
      router.push(`/appraisal?project=${projectId}&appraisal=${appraisal.id}`);
    } else {
      router.push(`/appraisal?project=${projectId}`);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <style>{CSS}</style>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, color: "var(--text-d)" }}>Project not found</div>
      <p style={{ fontSize: 13, color: "var(--text-d)" }}>You may not have access to this project.</p>
      <button onClick={() => router.push("/workspace")} style={{ background: "var(--gold)", color: "#06070a", border: "none", borderRadius: 8, padding: "10px 20px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        ← Back to Workspace
      </button>
    </div>
  );

  const sym = CURRENCY_SYMBOLS[project?.currency] || "£";
  const pocColor = appraisal?.profit_on_cost > 0.2 ? "var(--green)" : appraisal?.profit_on_cost > 0.1 ? "var(--amber)" : "var(--red)";
  const snap = appraisal?.snapshot || {};

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{ background: "var(--bg1)", borderBottom: "1px solid var(--border)", padding: "0 24px", height: 52, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 40 }}>
        <button onClick={() => router.push("/workspace")}
          style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-m)", cursor: "pointer", padding: "4px 12px", fontFamily: "var(--font-body)", fontSize: 12, transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-m)"; }}>
          ← Workspace
        </button>
        {firm && <span style={{ fontSize: 11, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".1em" }}>{firm.name}</span>}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em" }}>{memberRole}</span>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "36px 24px", animation: "fadeIn .3s ease" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            {project?.asset_type && (
              <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 8, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 600, letterSpacing: ".04em" }}>
                {project.asset_type}
              </span>
            )}
            <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 8, background: "rgba(125,133,144,.1)", color: "var(--text-m)" }}>
              {appraisal?.status || "draft"}
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 300, letterSpacing: ".02em", marginBottom: 4 }}>
            {project?.name || "Untitled Project"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-m)" }}>{project?.location || "No location set"}</p>
        </div>

        {/* Metrics */}
        {appraisal ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 32 }}>
            {[
              { label: "GDV", value: fmt(appraisal.gdv, sym), color: "var(--gold)" },
              { label: "Total Cost", value: fmt(appraisal.total_cost, sym), color: "var(--text)" },
              { label: "Profit", value: fmt(appraisal.profit, sym), color: appraisal.profit > 0 ? "var(--green)" : "var(--red)" },
              { label: "Profit on Cost", value: fmtPct(appraisal.profit_on_cost), color: pocColor },
              { label: "IRR (Unlevered)", value: fmtPct(appraisal.irr_unlevered), color: "var(--blue)" },
              { label: "Appraisals", value: String(appraisalCount), color: "var(--text-m)" },
            ].map(m => (
              <div key={m.label} className="metric-card">
                <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 500, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px", marginBottom: 32, fontSize: 13, color: "var(--text-d)" }}>
            No appraisal saved yet — open the project to start.
          </div>
        )}

        <div style={{ height: 1, background: "var(--border)", marginBottom: 24 }} />

        {/* Actions */}
        <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>

          <button className="action-btn" onClick={openAppraisal}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--gold-bg)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)" }}>Open Appraisal</div>
            <div style={{ fontSize: 11, color: "var(--text-d)" }}>View and edit the full model</div>
          </button>

          <button className="action-btn" onClick={() => router.push(`/tasks?project=${projectId}`)}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(91,156,246,.08)", border: "1px solid rgba(91,156,246,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--blue)" }}>Tasks</div>
            <div style={{ fontSize: 11, color: "var(--text-d)" }}>View project tasks & actions</div>
          </button>

          <button className="action-btn" onClick={() => router.push(`/notes?project=${projectId}`)}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(61,220,132,.06)", border: "1px solid rgba(61,220,132,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>Notes</div>
            <div style={{ fontSize: 11, color: "var(--text-d)" }}>Add comments & deal notes</div>
          </button>
        </div>

        {/* Deal snapshot from saved appraisal */}
        {snap && Object.keys(snap).length > 0 && (
          <>
            <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>Deal Info</div>
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: 24 }}>
              {snap.assetType && <div><div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>Type</div><div style={{ fontSize: 13, color: "var(--gold)", fontFamily: "var(--font-mono)" }}>{snap.assetType}</div></div>}
              {snap.location && <div><div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>Location</div><div style={{ fontSize: 13, color: "var(--text)" }}>{snap.location}</div></div>}
              {snap.currency && <div><div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>Currency</div><div style={{ fontSize: 13, color: "var(--text-m)", fontFamily: "var(--font-mono)" }}>{snap.currency}</div></div>}
              {snap.programmMonths && <div><div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>Programme</div><div style={{ fontSize: 13, color: "var(--text-m)", fontFamily: "var(--font-mono)" }}>{snap.programmMonths}m</div></div>}
              {snap.exitYield && <div><div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>Exit Yield</div><div style={{ fontSize: 13, color: "var(--text-m)", fontFamily: "var(--font-mono)" }}>{snap.exitYield}%</div></div>}
            </div>
          </>
        )}

        {appraisal?.created_at && (
          <div style={{ marginTop: 20, fontSize: 11, color: "var(--text-d)" }}>
            Last saved {new Date(appraisal.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        )}
      </div>
    </div>
  );
}
