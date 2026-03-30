"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
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

        const shared = (sharedProjects || []).map((pm: any) => ({ id: pm.project_id, ...pm.projects, _shared: true }));
        setProjects(shared);
      } else {
        // Member sees only assigned projects
        const { data: assigned } = await supabase
          .from("project_members")
          .select("*, projects(*, appraisals(id, gdv, profit, profit_on_cost, irr_unlevered, status))")
          .eq("user_id", u.id)
          .eq("firm_id", memberRow.firm_id);

        setProjects((assigned || []).map((pm: any) => ({ id: pm.project_id, ...pm.projects })));
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
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--gold)", letterSpacing: ".1em", fontWeight: 300 }}>VALORA</div>
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
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--gold)", letterSpacing: ".1em", fontWeight: 300 }}>VALORA</div>
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
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                          {firmMembers.map(m => (
                            <label key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 8px", borderRadius: 6, background: assigningProject === p.id && selectedMembers.includes(m.user_id) ? "var(--gold-bg)" : "transparent", transition: "background .15s" }}>
                              <input
                                type="checkbox"
                                checked={assigningProject === p.id && selectedMembers.includes(m.user_id)}
                                onChange={e => {
                                  setAssigningProject(p.id);
                                  setSelectedMembers(prev => e.target.checked ? [...prev, m.user_id] : prev.filter(id => id !== m.user_id));
                                }}
                                style={{ accentColor: "var(--gold)" }}
                              />
                              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "var(--gold)", fontWeight: 600 }}>
                                {m.user_id.toString()[0].toUpperCase()}
                              </div>
                              <span style={{ fontSize: 12, color: "var(--text-m)" }}>{m.role}</span>
                            </label>
                          ))}
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
                    <div key={p.id} className="card" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => openProject(p)}>
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
