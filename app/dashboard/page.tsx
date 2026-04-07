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
.card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:24px;cursor:pointer;transition:border-color .2s,transform .15s,box-shadow .2s;animation:fadeIn .3s ease both}
.card:hover{border-color:var(--gold-border);transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.4)}
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
select.inp{cursor:pointer}
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
  draft:      { bg: "rgba(125,133,144,.12)", color: "#7d8590" },
  active:     { bg: "rgba(91,156,246,.1)",   color: "#5b9cf6" },
  completed:  { bg: "rgba(61,220,132,.08)",  color: "#3ddc84" },
  archived:   { bg: "rgba(244,100,95,.08)",  color: "#f4645f" },
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", location: "", asset_type: "BTR", currency: "GBP" });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);
      await loadProjects(session.user.id);
    };
    init();
  }, [router]);

  const loadProjects = async (userId: string) => {
    setLoading(true);
    // Fetch projects with their latest appraisal joined
    const { data: projectData } = await supabase
      .from("projects")
      .select(`
        *,
        appraisals (
          id, gdv, total_cost, profit, profit_on_cost, irr_unlevered, status, created_at
        )
      `)
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    setProjects(projectData || []);
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const createProject = async () => {
    if (!newProject.name.trim() || !user) return;
    setCreating(true);
    const { data: proj, error } = await supabase.from("projects").insert({
      name: newProject.name.trim(),
      location: newProject.location.trim(),
      asset_type: newProject.asset_type,
      currency: newProject.currency,
      benchmark_rate: "SONIA",
      created_by: user.id,
      firm_id: null,
    }).select().single();

    if (proj && !error) {
      setShowNewModal(false);
      setNewProject({ name: "", location: "", asset_type: "BTR", currency: "GBP" });
      router.push(`/appraisal?project=${proj.id}`);
    }
    setCreating(false);
  };

  const openProject = (project: any) => {
    const latestAppraisal = project.appraisals?.[0];
    if (latestAppraisal) {
      router.push(`/appraisal?project=${project.id}&appraisal=${latestAppraisal.id}`);
    } else {
      router.push(`/appraisal?project=${project.id}`);
    }
  };

  const filteredProjects = filter === "all"
    ? projects
    : projects.filter(p => p.asset_type === filter);

  // Stats
  const totalGDV = projects.reduce((s, p) => {
    const latest = p.appraisals?.[0];
    return s + (latest?.gdv || 0);
  }, 0);
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
        <img src="data:image/png;base64,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" alt="Valora" style={{height:"26px",width:"auto"}}/>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 12, color: "var(--text-d)", fontFamily: "var(--font-mono)" }}>{user?.email}</span>
          <button onClick={signOut} className="btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 40px" }}>

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

        {/* Portfolio stats (only if projects exist) */}
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
          <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
            {["all", ...ASSET_TYPES].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "8px 16px", fontSize: 12, cursor: "pointer", background: "none", border: "none",
                borderBottom: `2px solid ${filter === f ? "var(--gold)" : "transparent"}`,
                color: filter === f ? "var(--gold)" : "var(--text-d)",
                fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: ".06em",
                transition: "all .2s",
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

              return (
                <div key={p.id} className="card" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => openProject(p)}>
                  {/* Card header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
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
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
          <div className="modal">
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 300, marginBottom: 6 }}>New Appraisal</div>
            <p style={{ fontSize: 13, color: "var(--text-d)", marginBottom: 28 }}>Set up a new project to get started.</p>

            <div className="inp-group">
              <label className="inp-label">Project Name *</label>
              <input className="inp" placeholder="e.g. Chiswick Tower" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && createProject()} autoFocus />
            </div>
            <div className="inp-group">
              <label className="inp-label">Location</label>
              <input className="inp" placeholder="e.g. Hammersmith, London" value={newProject.location} onChange={e => setNewProject(p => ({ ...p, location: e.target.value }))} />
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
              <button className="btn-primary" onClick={createProject} disabled={!newProject.name.trim() || creating} style={{ flex: 2, opacity: !newProject.name.trim() ? 0.5 : 1 }}>
                {creating ? "Creating…" : "Create & Open →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
