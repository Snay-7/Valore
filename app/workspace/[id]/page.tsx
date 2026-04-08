"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold-l:#e2c97e;--gold-bg:rgba(201,168,76,0.07);--gold-border:rgba(201,168,76,0.2);
  --bg:#06070a;--bg1:#0c0e12;--bg2:#12151a;--bg3:#191d24;--bg4:#21262f;
  --text:#eceae4;--text-m:#7d8590;--text-d:#3d4249;
  --border:rgba(255,255,255,0.06);--border-m:rgba(255,255,255,0.12);
  --green:#3ddc84;--red:#f4645f;--amber:#f0a429;--blue:#5b9cf6;--purple:#a78bfa;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:24px;cursor:pointer;transition:border-color .2s,transform .15s;animation:fadeIn .3s ease both;position:relative}
.card:hover{border-color:var(--gold-border);transform:translateY(-2px)}
.metric-pill{background:var(--bg3);border-radius:8px;padding:10px 14px}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:7px;padding:10px 20px;font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:background .2s}
.btn-primary:hover{background:var(--gold-l)}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:8px 16px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.nav-item{width:100%;display:flex;align-items:center;padding:9px 12px;border-radius:7px;font-size:13px;color:var(--text-m);background:transparent;border:1px solid transparent;cursor:pointer;font-family:var(--font-body);transition:all .15s;text-align:left;margin-bottom:2px}
.nav-item:hover{color:var(--text);background:var(--bg3)}
.nav-item.active{color:var(--gold);background:rgba(201,168,76,.08);border-color:var(--gold-border);font-weight:600}
.sidebar{width:220px;background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}
.mobile-topbar{display:none;align-items:center;justify-content:space-between;padding:16px 20px;background:var(--bg1);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg1);border-top:1px solid var(--border);z-index:100;padding:8px 0 env(safe-area-inset-bottom,16px)}
.bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 4px;background:none;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);font-size:9px;letter-spacing:.06em;text-transform:uppercase;transition:color .2s}
.bottom-nav-item.active{color:var(--gold)}
.bottom-nav-item svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
@media(max-width:768px){
  .sidebar{display:none}
  .bottom-nav{display:flex}
  .mobile-topbar{display:flex}
  .main-content{margin-left:0!important;max-width:100vw!important;padding:20px 16px 100px!important}
  .cards-grid{grid-template-columns:1fr!important}
}
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
const CURRENCY_SYMBOLS: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$" };

export default function WorkspacePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [firm, setFirm] = useState<any>(null);
  const [memberRole, setMemberRole] = useState<string>("member");
  const [projects, setProjects] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]); // admin: all firm projects
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [assigningProject, setAssigningProject] = useState<any>(null);
  const [firmMembers, setFirmMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"projects" | "assign">("projects");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      const u = session.user;
      setUser(u);

      // Get firm membership
      const { data: memberRow } = await supabase
        .from("firm_members")
        .select("*, firms(*)")
        .eq("user_id", u.id)
        .maybeSingle();

      if (!memberRow) { router.push("/dashboard"); return; }

      setFirm(memberRow.firms);
      setMemberRole(memberRow.role);
      const admin = memberRow.role === "admin";
      setIsAdmin(admin);

      if (admin) {
        // Admin sees all their projects + can assign
        const { data: ownProjects } = await supabase
          .from("projects")
          .select(`*, appraisals(id, gdv, profit, profit_on_cost, irr_unlevered, status)`)
          .eq("created_by", u.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false });
        setAllProjects(ownProjects || []);

        // Get firm members for assignment
        const { data: members } = await supabase
          .from("firm_members")
          .select("*")
          .eq("firm_id", memberRow.firm_id)
          .neq("user_id", u.id);
        setFirmMembers(members || []);

        // Also show projects shared with workspace
        const { data: sharedProjects } = await supabase
          .from("project_members")
          .select("*, projects(*, appraisals(id, gdv, profit, profit_on_cost, irr_unlevered, status))")
          .eq("firm_id", memberRow.firm_id);

        const shared = (sharedProjects || []).map((pm: any) => { const { id: _, ...rest } = pm.projects || {}; return { id: pm.project_id, ...rest, _shared: true }; });
        setProjects(shared);
      } else {
        // Member sees only assigned projects
        const { data: assigned } = await supabase
          .from("project_members")
          .select("*, projects(*, appraisals(id, gdv, profit, profit_on_cost, irr_unlevered, status))")
          .eq("user_id", u.id)
          .eq("firm_id", memberRow.firm_id);

        setProjects((assigned || []).map((pm: any) => { const { id: _, ...rest } = pm.projects || {}; return { id: pm.project_id, ...rest }; }));
      }

      setLoading(false);
    };
    init();
  }, [router]);

  const openProject = (project: any) => {
    router.push(`/workspace/${project.id}`);
  };

  const shareProject = async (projectId: string, memberIds: string[]) => {
    if (!firm || !user) return;
    setSaving(true);

    for (const memberId of memberIds) {
      await supabase.from("project_members").upsert({
        project_id: projectId,
        user_id: memberId,
        firm_id: firm.id,
        assigned_by: user.id,
      }, { onConflict: "project_id,user_id" });

      // Log activity
      await supabase.from("activity_log").insert({
        project_id: projectId,
        firm_id: firm.id,
        user_id: user.id,
        user_email: user.email,
        action: "project_shared",
        details: { assigned_to: memberId },
      });
    }

    setSaving(false);
    setAssigningProject(null);
    setSelectedMembers([]);

    // Refresh
    const { data: sharedProjects } = await supabase
      .from("project_members")
      .select("*, projects(*, appraisals(id, gdv, profit, profit_on_cost, irr_unlevered, status))")
      .eq("firm_id", firm.id);
    setProjects((sharedProjects || []).map((pm: any) => ({ id: pm.project_id, ...pm.projects, _shared: true })));
  };

  const removeFromWorkspace = async (projectId: string) => {
    if (!firm) return;
    await supabase.from("project_members").delete().eq("project_id", projectId).eq("firm_id", firm.id);
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const Sidebar = () => (
    <div className="sidebar">
      <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid var(--border)" }}>
        <img src="data:image/png;base64,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" alt="Valora" style={{ height: "26px", width: "auto" }}/>
        <div style={{ fontSize: 9, color: "var(--text-d)", letterSpacing: ".14em", textTransform: "uppercase", marginTop: 2 }}>Development Appraisal</div>
      </div>
      <div style={{ padding: "16px 12px", flex: 1 }}>
        <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 12px", marginBottom: 8 }}>Workspace</div>
        <button className="nav-item active">Projects</button>
        {isAdmin && <button className="nav-item" onClick={() => router.push("/team")}>Team</button>}
        <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
        <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 12px", marginBottom: 8 }}>My Account</div>
        <button className="nav-item" onClick={() => router.push("/dashboard")}>My Portfolio</button>
        <button className="nav-item" onClick={() => router.push("/tasks")}>My Tasks</button>
      </div>
      <div style={{ padding: "16px 16px 20px", borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--text-d)", marginBottom: 6 }}>{user?.email}</div>
        <div style={{ fontSize: 10, color: "var(--gold)", marginBottom: 8 }}>{firm?.name}</div>
        <button className="nav-item" style={{ fontSize: 12 }} onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}>Sign Out</button>
      </div>
    </div>
  );

  const BottomNav = () => (
    <nav className="bottom-nav">
      <button className="bottom-nav-item active">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Projects
      </button>
      <button className="bottom-nav-item" onClick={() => router.push("/tasks")}>
        <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        Tasks
      </button>
      {isAdmin && <button className="bottom-nav-item" onClick={() => router.push("/team")}>
        <svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
        Team
      </button>}
      <button className="bottom-nav-item" onClick={() => router.push("/dashboard")}>
        <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
        Portfolio
      </button>
    </nav>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", display: "flex" }}>
      <style>{CSS}</style>
      <Sidebar />

      <div className="main-content" style={{ marginLeft: 220, flex: 1, minWidth: 0, padding: "48px 40px" }}>

        <div className="mobile-topbar">
          <img src="data:image/png;base64,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" alt="Valora" style={{ height: "26px", width: "auto" }}/>
          <div style={{ fontSize: 12, color: "var(--gold)" }}>{firm?.name}</div>
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>
              {firm?.name}
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 300, marginBottom: 6 }}>
              Workspace
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-m)" }}>
              {projects.length} shared project{projects.length !== 1 ? "s" : ""} · {memberRole}
            </p>
          </div>
          {isAdmin && (
            <button
              className="btn-primary"
              onClick={() => setView(view === "assign" ? "projects" : "assign")}
              style={{ padding: "12px 24px" }}
            >
              {view === "assign" ? "← Back to Projects" : "+ Share Projects"}
            </button>
          )}
        </div>

        {/* ADMIN: Share projects view */}
        {isAdmin && view === "assign" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 300, marginBottom: 6 }}>Share Projects with Workspace</h2>
              <p style={{ fontSize: 13, color: "var(--text-m)" }}>Select a project then choose which members can access it.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {allProjects.map((p, i) => {
                const latest = p.appraisals?.[0];
                const sym = CURRENCY_SYMBOLS[p.currency] || "£";
                const isShared = projects.some(sp => sp.id === p.id);
                return (
                  <div key={p.id} style={{ background: "var(--bg2)", border: `1px solid ${isShared ? "var(--gold-border)" : "var(--border)"}`, borderRadius: 12, padding: 20, animationDelay: `${i * 0.04}s` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "var(--gold-bg)", color: "var(--gold)", display: "inline-block", marginBottom: 6 }}>{p.asset_type}</div>
                        <div style={{ fontSize: 15, fontWeight: 500, fontFamily: "var(--font-display)" }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-m)" }}>{p.location || "No location"}</div>
                      </div>
                      {isShared && <span style={{ fontSize: 10, color: "var(--green)", background: "rgba(61,220,132,.1)", padding: "2px 8px", borderRadius: 10, border: "1px solid rgba(61,220,132,.2)" }}>Shared</span>}
                    </div>
                    {latest && (
                      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        <div className="metric-pill" style={{ flex: 1 }}>
                          <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", marginBottom: 2 }}>GDV</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gold)" }}>{fmt(latest.gdv, sym)}</div>
                        </div>
                        <div className="metric-pill" style={{ flex: 1 }}>
                          <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", marginBottom: 2 }}>PoC</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-m)" }}>{fmtPct(latest.profit_on_cost)}</div>
                        </div>
                      </div>
                    )}

                    {/* Member selection */}
                    {firmMembers.length > 0 ? (
                      <div>
                        <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Share with</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                          {firmMembers.map(m => {
                            const isSelected = assigningProject === p.id && selectedMembers.includes(m.user_id);
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setAssigningProject(p.id);
                                  setSelectedMembers(prev =>
                                    prev.includes(m.user_id)
                                      ? prev.filter(id => id !== m.user_id)
                                      : [...prev, m.user_id]
                                  );
                                }}
                                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 20, border: `1px solid ${isSelected ? "var(--gold)" : "var(--border)"}`, background: isSelected ? "var(--gold-bg)" : "transparent", color: isSelected ? "var(--gold)" : "var(--text-m)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)", transition: "all .15s" }}
                              >
                                <div style={{ width: 20, height: 20, borderRadius: "50%", background: isSelected ? "var(--gold-bg)" : "var(--bg4)", border: `1px solid ${isSelected ? "var(--gold-border)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: isSelected ? "var(--gold)" : "var(--text-d)", fontWeight: 600 }}>
                                  {(m.email || m.role || "?")[0].toUpperCase()}
                                </div>
                                {m.email || m.role}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="btn-primary"
                            style={{ flex: 1, padding: "8px", fontSize: 12 }}
                            disabled={saving || assigningProject !== p.id || selectedMembers.length === 0}
                            onClick={() => shareProject(p.id, selectedMembers)}
                          >
                            {saving && assigningProject === p.id ? "Sharing…" : "Share →"}
                          </button>
                          {isShared && (
                            <button className="btn-ghost" style={{ padding: "8px 12px", fontSize: 11 }} onClick={() => removeFromWorkspace(p.id)}>
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: "var(--text-d)" }}>No members to share with yet. <span style={{ color: "var(--gold)", cursor: "pointer" }} onClick={() => router.push("/team")}>Invite team →</span></p>
                    )}
                  </div>
                );
              })}
              {allProjects.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", gridColumn: "1/-1" }}>
                  <p style={{ fontSize: 14, color: "var(--text-d)", marginBottom: 16 }}>No projects in your portfolio yet.</p>
                  <button className="btn-primary" onClick={() => router.push("/dashboard")}>Go to Portfolio →</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects grid */}
        {view === "projects" && (
          <>
            {projects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 300, color: "var(--text-d)", marginBottom: 16 }}>◈</div>
                <p style={{ fontSize: 16, color: "var(--text-d)", marginBottom: 8 }}>
                  {isAdmin ? "No projects shared yet" : "No projects assigned to you yet"}
                </p>
                <p style={{ fontSize: 13, color: "var(--text-d)", marginBottom: 24 }}>
              {isAdmin ? 'Share your appraisals with the team using the button above.' : 'Your workspace admin will assign projects to you.'}
                </p>
                {isAdmin && (
                  <button className="btn-primary" onClick={() => setView("assign")}>+ Share Projects</button>
                )}
              </div>
            ) : (
              <div className="cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {projects.map((p, i) => {
                  const latest = p.appraisals?.[0];
                  const sym = CURRENCY_SYMBOLS[p.currency] || "£";
                  const pocColor = latest?.profit_on_cost > 0.2 ? "var(--green)" : latest?.profit_on_cost > 0.1 ? "var(--amber)" : "var(--red)";
                  return (
                    <div key={p.id} className="card" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => { console.log('card click id:', p.id, 'full p:', JSON.stringify(p)); router.push(`/workspace/${p.id}`); }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 10, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 600 }}>{p.asset_type}</span>
                        <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 10, background: "rgba(125,133,144,.12)", color: "var(--text-m)" }}>{latest?.status || "draft"}</span>
                        <span style={{ fontSize: 10, color: "var(--text-d)", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
                          {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 500, marginBottom: 4, fontFamily: "var(--font-display)" }}>{p.name || "Untitled"}</h3>
                      <p style={{ fontSize: 12, color: "var(--text-m)", marginBottom: 18 }}>{p.location || "No location"}</p>
                      {latest ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                          {[
                            { label: "GDV", value: fmt(latest.gdv, sym), color: "var(--gold)" },
                            { label: "Profit", value: fmt(latest.profit, sym), color: latest?.profit > 0 ? "var(--green)" : "var(--red)" },
                            { label: "PoC", value: fmtPct(latest.profit_on_cost), color: pocColor },
                          ].map(m => (
                            <div key={m.label} className="metric-pill">
                              <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", marginBottom: 3 }}>{m.label}</div>
                              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, color: m.color }}>{m.value}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--text-d)" }}>No appraisal saved yet</div>
                      )}
                      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--bg4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "var(--text-d)" }}>{p.appraisals?.length || 0} appraisal{p.appraisals?.length !== 1 ? "s" : ""}</span>
                        <span style={{ fontSize: 11, color: "var(--gold)" }}>Open →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
