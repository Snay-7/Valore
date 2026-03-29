"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

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
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:24px;cursor:pointer;transition:border-color .2s,transform .15s,box-shadow .2s;animation:fadeIn .3s ease both;position:relative}
.card:hover{border-color:var(--gold-border);transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.4)}
.card.trashed{opacity:.6;border-style:dashed}
.metric-pill{background:var(--bg3);border-radius:8px;padding:10px 14px}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:100;animation:fadeIn .15s ease}
.modal{background:var(--bg2);border:1px solid var(--border-m);border-radius:16px;padding:32px;width:480px;max-width:calc(100vw - 40px)}
.inp{width:100%;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font-mono);font-size:13px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold)}
.inp::placeholder{color:var(--text-d);font-family:var(--font-body)}
.inp-label{font-size:10px;color:var(--text-d);text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px;display:block}
.inp-group{margin-bottom:14px}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:7px;padding:10px 20px;font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:background .2s}
.btn-primary:hover{background:var(--gold-l)}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:9px 18px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-danger{background:transparent;color:var(--red);border:1px solid rgba(244,100,95,.3);border-radius:6px;padding:5px 10px;font-family:var(--font-body);font-size:11px;cursor:pointer;transition:all .2s}
.btn-danger:hover{background:rgba(244,100,95,.1);border-color:var(--red)}
select.inp{cursor:pointer}
.menu-btn{background:none;border:none;color:var(--text-d);cursor:pointer;padding:4px 8px;border-radius:4px;font-size:16px;line-height:1;transition:all .2s;position:relative;z-index:2}
.menu-btn:hover{background:var(--bg4);color:var(--text)}
.card-menu{position:absolute;top:16px;right:16px;z-index:10}
.dropdown{position:absolute;top:100%;right:0;background:var(--bg3);border:1px solid var(--border-m);border-radius:8px;padding:4px;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.5);animation:fadeIn .1s ease}
.dropdown-item{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;font-size:12px;cursor:pointer;transition:background .15s;width:100%;border:none;background:none;color:var(--text-m);font-family:var(--font-body);text-align:left}
.dropdown-item:hover{background:var(--bg4);color:var(--text)}
.dropdown-item.danger{color:var(--red)}
.dropdown-item.danger:hover{background:rgba(244,100,95,.1);color:var(--red)}
.trash-banner{background:rgba(244,100,95,.06);border:1px solid rgba(244,100,95,.15);border-radius:10px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
`;

const fmt = (n: number, prefix = "£") => {
  if (!n || !isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${prefix}${(n / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${prefix}${(n / 1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${prefix}${(n / 1e3).toFixed(0)}k`;
  return `${prefix}${n.toFixed(0)}`;
};
const fmtPct = (n: number) => (!n || !isFinite(n) || isNaN(n) ? "—" : `${(n * 100).toFixed(1)}%`);

const ASSET_TYPES = ["BTR", "BTS", "Hotel", "Flip"];
const CURRENCIES = ["GBP", "USD", "EUR", "AED", "SGD", "AUD"];
const CURRENCY_SYMBOLS: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$" };
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  draft:     { bg: "rgba(125,133,144,.12)", color: "#7d8590" },
  active:    { bg: "rgba(91,156,246,.1)",   color: "#5b9cf6" },
  completed: { bg: "rgba(61,220,132,.08)",  color: "#3ddc84" },
  archived:  { bg: "rgba(244,100,95,.08)",  color: "#f4645f" },
};

const TRASH_DAYS = 3;

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [trashedProjects, setTrashedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", location: "", asset_type: "BTR", currency: "GBP" });
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"portfolio"|"trash">("portfolio");
  const [openMenuId, setOpenMenuId] = useState<string|null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);
      await loadProjects(session.user.id);
    };
    init();
  }, [router]);

  // Close menu on outside click
  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const loadProjects = async (userId: string) => {
    setLoading(true);
    const { data: all } = await supabase
      .from("projects")
      .select(`*, appraisals(id, gdv, total_cost, profit, profit_on_cost, irr_unlevered, status, created_at)`)
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    const now = new Date();
    const active: any[] = [];
    const trashed: any[] = [];

    (all || []).forEach(p => {
      if (!p.deleted_at) {
        active.push(p);
      } else {
        const deletedAt = new Date(p.deleted_at);
        const daysInTrash = (now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysInTrash < TRASH_DAYS) {
          trashed.push({ ...p, _daysLeft: Math.ceil(TRASH_DAYS - daysInTrash) });
        } else {
          // Auto-purge expired trash
          supabase.from("appraisals").delete().eq("project_id", p.id).then(() =>
            supabase.from("projects").delete().eq("id", p.id)
          );
        }
      }
    });

    setProjects(active);
    setTrashedProjects(trashed);
    setLoading(false);
  };

  const signOut = async () => { await supabase.auth.signOut(); router.push("/"); };

  const createProject = async () => {
    if (!newProject.name.trim() || !user) return;
    setCreating(true);
    const { data: proj, error } = await supabase.from("projects").insert({
      name: newProject.name.trim(), location: newProject.location.trim(),
      asset_type: newProject.asset_type, currency: newProject.currency,
      benchmark_rate: "SONIA", created_by: user.id, firm_id: null,
    }).select().single();
    if (proj && !error) {
      setShowNewModal(false);
      setNewProject({ name: "", location: "", asset_type: "BTR", currency: "GBP" });
      router.push(`/appraisal?project=${proj.id}`);
    }
    setCreating(false);
  };

  const openProject = (project: any) => {
    const latest = project.appraisals?.[0];
    if (latest) router.push(`/appraisal?project=${project.id}&appraisal=${latest.id}`);
    else router.push(`/appraisal?project=${project.id}`);
  };

  const moveToTrash = async (projectId: string) => {
    setOpenMenuId(null);
    const now = new Date().toISOString();
    await supabase.from("projects").update({ deleted_at: now }).eq("id", projectId);
    // Update state immediately — move from active to trashed
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setTrashedProjects(prev => [...prev, { ...project, deleted_at: now, _daysLeft: TRASH_DAYS }]);
    }
  };

  const restoreProject = async (projectId: string) => {
    await supabase.from("projects").update({ deleted_at: null }).eq("id", projectId);
    // Update state immediately — move from trashed to active
    const project = trashedProjects.find(p => p.id === projectId);
    if (project) {
      const { _daysLeft, deleted_at, ...restored } = project;
      setTrashedProjects(prev => prev.filter(p => p.id !== projectId));
      setProjects(prev => [{ ...restored, deleted_at: null }, ...prev]);
    }
  };

  const permanentlyDelete = async (projectId: string) => {
    await supabase.from("appraisals").delete().eq("project_id", projectId);
    await supabase.from("projects").delete().eq("id", projectId);
    setTrashedProjects(prev => prev.filter(p => p.id !== projectId));
    setConfirmDelete(null);
  };

  const emptyTrash = async () => {
    for (const p of trashedProjects) {
      await supabase.from("appraisals").delete().eq("project_id", p.id);
      await supabase.from("projects").delete().eq("id", p.id);
    }
    setTrashedProjects([]);
    setConfirmDelete(null);
  };

  const filteredProjects = filter === "all" ? projects : projects.filter(p => p.asset_type === filter);
  const totalGDV = projects.reduce((s, p) => s + (p.appraisals?.[0]?.gdv || 0), 0);
  const avgPoC = (() => {
    const valid = projects.filter(p => p.appraisals?.[0]?.profit_on_cost);
    if (!valid.length) return 0;
    return valid.reduce((s, p) => s + (p.appraisals[0].profit_on_cost || 0), 0) / valid.length;
  })();

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{ background: "var(--bg1)", borderBottom: "1px solid var(--border)", padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--gold)", letterSpacing: ".1em", fontWeight: 300 }}>VALORA</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/pipeline")} className="btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }}>Pipeline</button>
          <button
            onClick={() => setView(v => v === "trash" ? "portfolio" : "trash")}
            className="btn-ghost"
            style={{ padding: "6px 14px", fontSize: 12, position: "relative", borderColor: view === "trash" ? "var(--red)" : undefined, color: view === "trash" ? "var(--red)" : undefined }}
          >
            🗑 Trash
            {trashedProjects.length > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, background: "var(--red)", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                {trashedProjects.length}
              </span>
            )}
          </button>
          <span style={{ fontSize: 12, color: "var(--text-d)", fontFamily: "var(--font-mono)" }}>{user?.email}</span>
          <button onClick={signOut} className="btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 40px" }}>

        {/* ── TRASH VIEW ── */}
        {view === "trash" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 300, marginBottom: 6 }}>Trash</h1>
                <p style={{ fontSize: 13, color: "var(--text-d)" }}>Projects deleted within the last {TRASH_DAYS} days. Restore or delete permanently.</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-ghost" onClick={() => setView("portfolio")} style={{ fontSize: 12 }}>← Back to Portfolio</button>
                {trashedProjects.length > 0 && (
                  <button className="btn-danger" onClick={() => setConfirmDelete({ type: "all" })} style={{ padding: "8px 16px", fontSize: 12 }}>Empty Trash</button>
                )}
              </div>
            </div>

            {trashedProjects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🗑</div>
                <p style={{ fontSize: 16, color: "var(--text-d)", fontFamily: "var(--font-display)" }}>Trash is empty</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {trashedProjects.map((p, i) => {
                  const latest = p.appraisals?.[0];
                  const sym = CURRENCY_SYMBOLS[p.currency] || "£";
                  return (
                    <div key={p.id} className="card trashed" style={{ animationDelay: `${i * 0.04}s`, cursor: "default" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 10, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 500 }}>{p.asset_type || "BTR"}</span>
                        <span style={{ fontSize: 10, color: "var(--red)", fontFamily: "var(--font-mono)" }}>Deletes in {p._daysLeft}d</span>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 2, fontFamily: "var(--font-display)" }}>{p.name || "Untitled"}</h3>
                      <p style={{ fontSize: 12, color: "var(--text-m)", marginBottom: 16 }}>{p.location || "No location"}</p>
                      {latest && (
                        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                          <div className="metric-pill" style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2 }}>GDV</div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gold)" }}>{fmt(latest.gdv, sym)}</div>
                          </div>
                          <div className="metric-pill" style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2 }}>PoC</div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-m)" }}>{fmtPct(latest.profit_on_cost)}</div>
                          </div>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => restoreProject(p.id)}
                          className="btn-ghost"
                          style={{ flex: 1, fontSize: 11, padding: "7px", justifyContent: "center", display: "flex" }}
                        >↩ Restore</button>
                        <button
                          onClick={() => setConfirmDelete({ type: "single", project: p })}
                          className="btn-danger"
                          style={{ flex: 1, fontSize: 11, padding: "7px" }}
                        >Delete Forever</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PORTFOLIO VIEW ── */}
        {view === "portfolio" && (
          <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, marginBottom: 6, letterSpacing: ".02em" }}>Portfolio</h1>
                <p style={{ fontSize: 13, color: "var(--text-d)" }}>
                  {projects.length} project{projects.length !== 1 ? "s" : ""}
                  {projects.length > 0 && ` · ${fmt(totalGDV)} total GDV · avg ${fmtPct(avgPoC)} PoC`}
                </p>
              </div>
              <button onClick={() => setShowNewModal(true)} className="btn-primary" style={{ padding: "12px 24px", fontSize: 13 }}>
                + New Appraisal
              </button>
            </div>

            {/* Trash banner */}
            {trashedProjects.length > 0 && (
              <div className="trash-banner">
                <span style={{ fontSize: 13, color: "var(--text-m)" }}>
                  🗑 <strong style={{ color: "var(--text)" }}>{trashedProjects.length}</strong> project{trashedProjects.length !== 1 ? "s" : ""} in Trash — will be permanently deleted in up to {TRASH_DAYS} days
                </span>
                <button onClick={() => setView("trash")} className="btn-ghost" style={{ fontSize: 11, padding: "5px 12px" }}>View Trash</button>
              </div>
            )}

            {/* Portfolio stats */}
            {projects.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 36 }}>
                {[
                  { label: "Total Projects", value: projects.length.toString(), color: "var(--text)" },
                  { label: "Total GDV", value: fmt(totalGDV), color: "var(--gold)" },
                  { label: "Avg Profit on Cost", value: fmtPct(avgPoC), color: avgPoC > 0.2 ? "var(--green)" : avgPoC > 0.1 ? "var(--amber)" : "var(--red)" },
                  { label: "Active Appraisals", value: projects.filter(p => p.appraisals?.length > 0).length.toString(), color: "var(--blue)" },
                ].map(s => (
                  <div key={s.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px" }}>
                    <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Filter tabs */}
            {projects.length > 0 && (
              <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)" }}>
                {["all", ...ASSET_TYPES].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: "8px 16px", fontSize: 12, cursor: "pointer", background: "none", border: "none",
                    borderBottom: `2px solid ${filter === f ? "var(--gold)" : "transparent"}`,
                    color: filter === f ? "var(--gold)" : "var(--text-d)",
                    fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: ".06em", transition: "all .2s",
                  }}>{f === "all" ? `All (${projects.length})` : `${f} (${projects.filter(p => p.asset_type === f).length})`}</button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {filteredProjects.length === 0 && (
              <div style={{ textAlign: "center", padding: "100px 0" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--text-d)", marginBottom: 20, fontWeight: 300 }}>◈</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 300, marginBottom: 12 }}>
                  {filter === "all" ? "No appraisals yet" : `No ${filter} projects`}
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-d)", marginBottom: 32 }}>
                  {filter === "all" ? "Create your first appraisal to get started." : `Switch to a different filter or create a new ${filter} appraisal.`}
                </p>
                <button onClick={() => setShowNewModal(true)} className="btn-primary" style={{ padding: "14px 32px", fontSize: 14 }}>
                  Create First Appraisal →
                </button>
              </div>
            )}

            {/* Project grid */}
            {filteredProjects.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {filteredProjects.map((p, i) => {
                  const latest = p.appraisals?.[0];
                  const poc = latest?.profit_on_cost;
                  const pocColor = poc > 0.2 ? "var(--green)" : poc > 0.1 ? "var(--amber)" : poc ? "var(--red)" : "var(--text-d)";
                  const sym = CURRENCY_SYMBOLS[p.currency] || "£";
                  const status = latest?.status || "draft";
                  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.draft;
                  const menuOpen = openMenuId === p.id;

                  return (
                    <div key={p.id} className="card" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => openProject(p)}>

                      {/* ⋯ Menu button */}
                      <div className="card-menu" onClick={e => e.stopPropagation()}>
                        <button
                          className="menu-btn"
                          onClick={e => { e.stopPropagation(); setOpenMenuId(menuOpen ? null : p.id); }}
                        >⋯</button>
                        {menuOpen && (
                          <div className="dropdown">
                            <button className="dropdown-item" onClick={() => openProject(p)}>
                              <span>↗</span> Open Appraisal
                            </button>
                            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }}/>
                            <button className="dropdown-item danger" onClick={() => { moveToTrash(p.id); }}>
                              <span>🗑</span> Move to Trash
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Card header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingRight: 28 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 10, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 500, letterSpacing: ".04em" }}>
                            {p.asset_type || "BTR"}
                          </span>
                          <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 10, background: statusStyle.bg, color: statusStyle.color, fontWeight: 500, letterSpacing: ".04em" }}>
                            {status}
                          </span>
                        </div>
                        <span style={{ fontSize: 10, color: "var(--text-d)", fontFamily: "var(--font-mono)" }}>
                          {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                        </span>
                      </div>

                      {/* Project name + location */}
                      <h3 style={{ fontSize: 17, fontWeight: 500, marginBottom: 4, fontFamily: "var(--font-display)", letterSpacing: ".02em" }}>{p.name || "Untitled"}</h3>
                      <p style={{ fontSize: 12, color: "var(--text-m)", marginBottom: 18 }}>{p.location || "No location set"}</p>

                      {/* Key metrics */}
                      {latest ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                          {[
                            { label: "GDV", value: fmt(latest.gdv, sym), color: "var(--gold)" },
                            { label: "Profit", value: fmt(latest.profit, sym), color: latest.profit > 0 ? "var(--green)" : "var(--red)" },
                            { label: "PoC", value: fmtPct(latest.profit_on_cost), color: pocColor },
                          ].map(m => (
                            <div key={m.label} className="metric-pill">
                              <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>{m.label}</div>
                              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, color: m.color }}>{m.value}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--text-d)" }}>
                          No appraisal saved yet — click to open
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--bg4)" }}>
                        <span style={{ fontSize: 11, color: "var(--text-d)" }}>
                          {p.appraisals?.length || 0} appraisal{p.appraisals?.length !== 1 ? "s" : ""}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--gold)", fontFamily: "var(--font-mono)" }}>
                          {latest?.irr_unlevered ? `IRR ${fmtPct(latest.irr_unlevered)}` : "Open →"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
          <div className="modal">
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 300, marginBottom: 6 }}>New Appraisal</div>
            <p style={{ fontSize: 13, color: "var(--text-d)", marginBottom: 28 }}>Set up a new project to get started.</p>
            <div className="inp-group">
              <label className="inp-label">Project Name *</label>
              <input className="inp" placeholder="e.g. Chiswick Tower" value={newProject.name}
                onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && createProject()} autoFocus />
            </div>
            <div className="inp-group">
              <label className="inp-label">Location</label>
              <input className="inp" placeholder="e.g. Hammersmith, London" value={newProject.location}
                onChange={e => setNewProject(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="inp-group">
                <label className="inp-label">Asset Type</label>
                <select className="inp" value={newProject.asset_type} onChange={e => setNewProject(p => ({ ...p, asset_type: e.target.value }))}>
                  {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="inp-group">
                <label className="inp-label">Currency</label>
                <select className="inp" value={newProject.currency} onChange={e => setNewProject(p => ({ ...p, currency: e.target.value }))}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn-ghost" onClick={() => setShowNewModal(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" onClick={createProject} disabled={!newProject.name.trim() || creating}
                style={{ flex: 2, opacity: !newProject.name.trim() ? 0.5 : 1 }}>
                {creating ? "Creating…" : "Create & Open →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Permanent Delete Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
          <div className="modal" style={{ width: 420 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 300, marginBottom: 8, color: "var(--red)" }}>
              {confirmDelete.type === "all" ? "Empty Trash" : "Delete Permanently"}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-m)", marginBottom: 8 }}>
              {confirmDelete.type === "all"
                ? `This will permanently delete all ${trashedProjects.length} projects in the trash.`
                : `This will permanently delete "${confirmDelete.project?.name || "this project"}" and all its appraisals.`}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 28 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancel</button>
              <button
                onClick={() => confirmDelete.type === "all" ? emptyTrash() : permanentlyDelete(confirmDelete.project.id)}
                style={{ flex: 1, background: "var(--red)", color: "#fff", border: "none", borderRadius: 7, padding: "10px 20px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                {confirmDelete.type === "all" ? "Empty Trash" : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
