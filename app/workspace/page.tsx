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
          <img src="data:image/png;base64,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" alt="Valora" style={{ height: "24px", width: "auto" }}/>
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
