"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold-bg:rgba(201,168,76,0.07);--gold-border:rgba(201,168,76,0.2);
  --bg:#06070a;--bg1:#0b0d10;--bg2:#0f1116;--bg3:#14171e;--bg4:#1a1e27;
  --text:#ede9e0;--text-m:#7a8390;--text-d:#363c46;
  --border:rgba(255,255,255,0.055);--border-m:rgba(255,255,255,0.1);
  --green:#3ddc84;--red:#f4645f;--amber:#f0a429;--blue:#5b9cf6;--purple:#a78bfa;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}
html,body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* Nav */
.nbtn{background:none;border:1px solid var(--border);border-radius:6px;color:var(--text-m);cursor:pointer;padding:5px 14px;font-family:var(--font-body);font-size:11px;letter-spacing:.04em;transition:all .2s}
.nbtn:hover{border-color:var(--gold-border);color:var(--gold)}

/* Tabs */
.tab{background:none;border:none;font-family:var(--font-body);font-size:13px;cursor:pointer;padding:10px 18px;color:var(--text-d);border-bottom:2px solid transparent;transition:all .2s;letter-spacing:.03em}
.tab:hover{color:var(--text-m)}
.tab.on{color:var(--text);border-bottom-color:var(--gold)}

/* Cards */
.pcard{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:22px;transition:border-color .2s,transform .15s;cursor:pointer;animation:fadeUp .3s ease both}
.pcard:hover{border-color:var(--gold-border);transform:translateY(-1px)}
.metric-pill{background:var(--bg3);border-radius:8px;padding:10px 14px}

/* Member card */
.mcard{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:18px 20px;display:flex;align-items:center;gap:14px;animation:fadeUp .3s ease both}

/* Task row */
.trow{display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-bottom:1px solid var(--border)}
.trow:last-child{border-bottom:none}

/* Badge */
.badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;letter-spacing:.03em}

/* Share toggle */
.share-pill{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;cursor:pointer;border:1px solid;transition:all .2s;font-family:var(--font-body)}

/* Buttons */
.btn-gold{background:var(--gold);color:#06070a;border:none;border-radius:8px;padding:9px 18px;font-family:var(--font-body);font-size:12px;font-weight:600;cursor:pointer;transition:opacity .2s}
.btn-gold:hover{opacity:.88}
.btn-gold:disabled{opacity:.35;cursor:not-allowed}
.btn-ghost{background:none;border:1px solid var(--border-m);border-radius:8px;padding:9px 14px;color:var(--text-m);font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s}
.btn-ghost:hover{color:var(--text);border-color:var(--border-m)}

::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:var(--border-m);border-radius:2px}
`;

const fmt = (n: number, p = "£") => {
  if (!n || !isFinite(n) || isNaN(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e6) return `${p}${(n/1e6).toFixed(2)}m`;
  if (a >= 1e3) return `${p}${(n/1e3).toFixed(0)}k`;
  return `${p}${n.toFixed(0)}`;
};
const fmtPct = (n: number) => (!n||!isFinite(n)||isNaN(n))?"—":`${(n*100).toFixed(1)}%`;
const CURR: Record<string,string> = {GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$"};
const PRI: Record<string,{c:string;bg:string}> = {
  low:{c:"#3ddc84",bg:"rgba(61,220,132,.1)"},
  medium:{c:"#f0a429",bg:"rgba(240,164,41,.1)"},
  high:{c:"#f4645f",bg:"rgba(244,100,95,.1)"},
  urgent:{c:"#a78bfa",bg:"rgba(167,139,250,.1)"},
};

export default function WorkspacePage() {
  const router = useRouter();
  const [user,      setUser]      = useState<any>(null);
  const [firm,      setFirm]      = useState<any>(null);
  const [role,      setRole]      = useState("member");
  const [isAdmin,   setIsAdmin]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState<"projects"|"tasks"|"team">("projects");

  // Projects
  const [firmProjects,   setFirmProjects]   = useState<any[]>([]); // all firm projects (admin)
  const [sharedIds,      setSharedIds]      = useState<Set<string>>(new Set()); // which are in project_members
  const [memberProjects, setMemberProjects] = useState<any[]>([]); // assigned to me (member)
  const [sharing,        setSharing]        = useState<string|null>(null);
  const [members,        setMembers]        = useState<any[]>([]);
  const [selectedM,      setSelectedM]      = useState<string[]>([]);
  const [savingShare,    setSavingShare]    = useState(false);

  // Tasks
  const [tasks,    setTasks]    = useState<any[]>([]);
  const [tFilter,  setTFilter]  = useState<"open"|"done"|"all">("open");

  // Team
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);

      const { data: mr } = await supabase.from("firm_members")
        .select("*, firms(*)")
        .eq("user_id", session.user.id).maybeSingle();
      if (!mr) { router.push("/dashboard"); return; }

      setFirm(mr.firms);
      setRole(mr.role || "member");
      const admin = mr.role === "admin";
      setIsAdmin(admin);

      // Load team members
      const { data: tm } = await supabase.from("firm_members")
        .select("*").eq("firm_id", mr.firm_id);
      setTeamMembers(tm || []);
      setMembers((tm||[]).filter((m:any) => m.user_id !== session.user.id));

      // Load tasks for whole firm
      const { data: allTasks } = await supabase.from("project_tasks")
        .select("*, projects(name)")
        .eq("firm_id", mr.firm_id)
        .order("created_at", { ascending: false });
      setTasks(allTasks || []);

      if (admin) {
        // All firm projects
        const { data: fp } = await supabase.from("projects")
          .select("*, appraisals(id,gdv,profit,profit_on_cost,irr_unlevered,status,created_at)")
          .eq("firm_id", mr.firm_id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false });
        setFirmProjects(fp || []);

        // Which ones are shared
        const { data: pm } = await supabase.from("project_members")
          .select("project_id").eq("firm_id", mr.firm_id);
        setSharedIds(new Set((pm||[]).map((x:any) => x.project_id)));
      } else {
        // Member: only assigned projects
        const { data: assigned } = await supabase.from("project_members")
          .select("project_id, projects(*, appraisals(id,gdv,profit,profit_on_cost,irr_unlevered,status,created_at))")
          .eq("user_id", session.user.id).eq("firm_id", mr.firm_id);
        setMemberProjects((assigned||[]).map((pm:any) => ({id: pm.project_id, ...pm.projects})));
      }

      setLoading(false);
    })();
  }, [router]);

  const toggleShare = async (projectId: string) => {
    if (!firm || !user) return;
    const isShared = sharedIds.has(projectId);
    if (isShared) {
      await supabase.from("project_members").delete().eq("project_id", projectId).eq("firm_id", firm.id);
      setSharedIds(prev => { const n = new Set(prev); n.delete(projectId); return n; });
    } else {
      setSharing(projectId);
      setSelectedM([]);
    }
  };

  const shareWith = async (projectId: string) => {
    if (!firm || !user || selectedM.length === 0) return;
    setSavingShare(true);
    for (const uid of selectedM) {
      await supabase.from("project_members").upsert({
        project_id: projectId, user_id: uid, firm_id: firm.id, assigned_by: user.id,
      }, { onConflict: "project_id,user_id" });
    }
    setSharedIds(prev => new Set([...prev, projectId]));
    setSharing(null); setSelectedM([]); setSavingShare(false);
  };

  const toggleTask = async (t: any) => {
    const s = t.status === "done" ? "open" : "done";
    await supabase.from("project_tasks").update({ status: s }).eq("id", t.id);
    setTasks(p => p.map(x => x.id === t.id ? { ...x, status: s } : x));
  };

  const deleteTask = async (id: string) => {
    await supabase.from("project_tasks").delete().eq("id", id);
    setTasks(p => p.filter(x => x.id !== id));
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 30, height: 30, border: "2px solid rgba(201,168,76,.15)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const displayProjects = isAdmin ? firmProjects : memberProjects;
  const filteredTasks = tasks.filter(t => tFilter === "all" ? true : t.status === tFilter);
  const openCount = tasks.filter(t => t.status !== "done").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}>
      <style>{CSS}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 60% 40% at 10% 50%,rgba(201,168,76,.025) 0%,transparent 55%)" }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(6,7,10,.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", height: 54, display: "flex", alignItems: "center", padding: "0 28px", gap: 14 }}>
        <button className="nbtn" onClick={() => router.push("/dashboard")}>← Portfolio</button>
        {firm && <><span style={{ color: "var(--text-d)", fontSize: 14 }}>/</span><span style={{ fontSize: 11, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".1em" }}>{firm.name}</span></>}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".14em", padding: "3px 11px", border: "1px solid var(--border)", borderRadius: 20, fontWeight: 600 }}>{role}</span>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 28px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>{firm?.name}</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 300, letterSpacing: ".01em", marginBottom: 6 }}>Workspace</h1>
          <p style={{ fontSize: 13, color: "var(--text-m)" }}>
            {displayProjects.length} project{displayProjects.length !== 1 ? "s" : ""} · {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""} · {openCount} open task{openCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 32 }}>
          {(["projects","tasks","team"] as const).map(t => (
            <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
              {t === "tasks" ? `Tasks${openCount > 0 ? ` (${openCount})` : ""}` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── PROJECTS TAB ── */}
        {tab === "projects" && (
          <>
            {isAdmin && (
              <div style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 20 }}>
                Click a project to open its detail page. Toggle <span style={{ color: "var(--gold)" }}>Share</span> to make it visible to team members.
              </div>
            )}

            {displayProjects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 300, color: "var(--text-d)", marginBottom: 16 }}>◈</div>
                <p style={{ fontSize: 15, color: "var(--text-d)", marginBottom: 8 }}>
                  {isAdmin ? "No projects in your firm yet" : "No projects assigned to you yet"}
                </p>
                {isAdmin && <button className="btn-gold" onClick={() => router.push("/dashboard")} style={{ marginTop: 16 }}>Go to Portfolio →</button>}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
                {displayProjects.map((p, i) => {
                  const latest = (p.appraisals||[]).sort((a:any,b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                  const sym = CURR[p.currency] || "£";
                  const shared = sharedIds.has(p.id);
                  const isSharingThis = sharing === p.id;
                  return (
                    <div key={p.id} className="pcard" style={{ animationDelay: `${i * 0.03}s` }}>
                      {/* Card header */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 10, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 600 }}>{p.asset_type}</span>
                        <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 10, background: "rgba(125,133,144,.1)", color: "var(--text-m)" }}>{latest?.status || "draft"}</span>
                        {isAdmin && (
                          <button
                            className="share-pill"
                            style={{ marginLeft: "auto", color: shared ? "var(--green)" : "var(--text-d)", borderColor: shared ? "rgba(61,220,132,.3)" : "var(--border)", background: shared ? "rgba(61,220,132,.07)" : "transparent" }}
                            onClick={e => { e.stopPropagation(); toggleShare(p.id); }}
                          >
                            {shared ? "✓ Shared" : "Share"}
                          </button>
                        )}
                      </div>

                      {/* Click area → detail page */}
                      <div onClick={() => router.push(`/workspace/${p.id}`)} style={{ cursor: "pointer" }}>
                        <h3 style={{ fontSize: 17, fontWeight: 500, fontFamily: "var(--font-display)", marginBottom: 3 }}>{p.name || "Untitled"}</h3>
                        <p style={{ fontSize: 12, color: "var(--text-m)", marginBottom: 14 }}>{p.location || "No location"}</p>

                        {latest ? (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                            {[
                              { l: "GDV", v: fmt(latest.gdv, sym), c: "var(--gold)" },
                              { l: "Profit", v: fmt(latest.profit, sym), c: (latest.profit||0) > 0 ? "var(--green)" : "var(--red)" },
                              { l: "PoC", v: fmtPct(latest.profit_on_cost), c: latest.profit_on_cost > 0.2 ? "var(--green)" : "var(--amber)" },
                            ].map(m => (
                              <div key={m.l} className="metric-pill">
                                <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", marginBottom: 2 }}>{m.l}</div>
                                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: m.c }}>{m.v}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ background: "var(--bg3)", borderRadius: 7, padding: "8px 12px", fontSize: 12, color: "var(--text-d)", marginBottom: 14 }}>No appraisal saved yet</div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                          <span style={{ fontSize: 11, color: "var(--text-d)" }}>{p.appraisals?.length || 0} appraisal{p.appraisals?.length !== 1 ? "s" : ""}</span>
                          <span style={{ fontSize: 11, color: "var(--gold)" }}>View detail →</span>
                        </div>
                      </div>

                      {/* Share member selector */}
                      {isAdmin && isSharingThis && members.length > 0 && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
                          <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Share with</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                            {members.map((m:any) => {
                              const sel = selectedM.includes(m.user_id);
                              return (
                                <button key={m.id} onClick={() => setSelectedM(prev => sel ? prev.filter(x => x !== m.user_id) : [...prev, m.user_id])}
                                  style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${sel ? "var(--gold)" : "var(--border)"}`, background: sel ? "var(--gold-bg)" : "transparent", color: sel ? "var(--gold)" : "var(--text-m)", fontSize: 11, cursor: "pointer", fontFamily: "var(--font-body)", transition: "all .15s" }}>
                                  {m.email || m.role}
                                </button>
                              );
                            })}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn-gold" style={{ flex: 1, padding: "8px", fontSize: 12 }} disabled={savingShare || selectedM.length === 0} onClick={() => shareWith(p.id)}>
                              {savingShare ? "Sharing…" : "Share →"}
                            </button>
                            <button className="btn-ghost" style={{ padding: "8px 12px" }} onClick={() => { setSharing(null); setSelectedM([]); }}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── TASKS TAB ── */}
        {tab === "tasks" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {(["open","done","all"] as const).map(f => (
                  <button key={f} onClick={() => setTFilter(f)}
                    style={{ background: tFilter === f ? "var(--bg3)" : "none", border: `1px solid ${tFilter === f ? "var(--border-m)" : "transparent"}`, borderRadius: 7, padding: "5px 14px", color: tFilter === f ? "var(--text)" : "var(--text-d)", fontFamily: "var(--font-body)", fontSize: 12, cursor: "pointer", transition: "all .2s" }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === "open" && openCount > 0 && <span style={{ marginLeft: 5, background: "var(--blue)", color: "#fff", borderRadius: 8, padding: "0 5px", fontSize: 9, fontWeight: 700 }}>{openCount}</span>}
                  </button>
                ))}
              </div>
              <button className="btn-gold" style={{ padding: "7px 16px", fontSize: 12 }} onClick={() => router.push("/tasks")}>
                All Tasks Page →
              </button>
            </div>

            {filteredTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-d)", fontSize: 13 }}>No {tFilter} tasks</div>
            ) : (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "4px 20px" }}>
                {filteredTasks.map(t => {
                  const pc = PRI[t.priority] || PRI.medium;
                  const done = t.status === "done";
                  return (
                    <div key={t.id} className="trow">
                      <button onClick={() => toggleTask(t)}
                        style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${done ? "var(--green)" : "var(--border-m)"}`, background: done ? "var(--green)" : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
                        {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#06070a" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: done ? "var(--text-d)" : "var(--text)", textDecoration: done ? "line-through" : "none", marginBottom: 5 }}>{t.title}</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                          <span className="badge" style={{ background: pc.bg, color: pc.c }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: pc.c }} />
                            {t.priority}
                          </span>
                          {t.projects?.name && <span style={{ fontSize: 10, color: "var(--gold)", opacity: .8 }}>{t.projects.name}</span>}
                          {t.due_date && <span style={{ fontSize: 10, color: "var(--text-d)", fontFamily: "var(--font-mono)" }}>Due {new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                          {t.urgency && t.urgency !== "normal" && <span className="badge" style={{ background: "rgba(240,164,41,.1)", color: "var(--amber)" }}>{t.urgency}</span>}
                        </div>
                      </div>
                      <button onClick={() => router.push(`/workspace/${t.project_id}`)}
                        style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 10px", color: "var(--text-d)", fontSize: 10, cursor: "pointer", flexShrink: 0, fontFamily: "var(--font-body)", transition: "all .2s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold-border)"; e.currentTarget.style.color = "var(--gold)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-d)"; }}>
                        Open
                      </button>
                      <button onClick={() => deleteTask(t.id)}
                        style={{ background: "none", border: "none", color: "var(--text-d)", cursor: "pointer", fontSize: 11, fontFamily: "var(--font-body)", transition: "color .15s", padding: "0 4px" }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--text-d)"}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── TEAM TAB ── */}
        {tab === "team" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "var(--text-m)" }}>{teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""} in {firm?.name}</p>
              {isAdmin && <button className="btn-gold" style={{ padding: "7px 16px", fontSize: 12 }} onClick={() => router.push("/team")}>Manage Team →</button>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
              {teamMembers.map((m, i) => {
                const initial = (m.email || m.role || "?")[0].toUpperCase();
                const memberTasks = tasks.filter(t => t.created_by === m.user_id);
                const openTasks = memberTasks.filter(t => t.status !== "done").length;
                const isMe = m.user_id === user?.id;
                return (
                  <div key={m.id} className="mcard" style={{ animationDelay: `${i * 0.04}s` }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, var(--gold-bg), rgba(201,168,76,.03))`, border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500, color: "var(--gold)", flexShrink: 0 }}>
                      {initial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.email || "Team Member"} {isMe && <span style={{ fontSize: 10, color: "var(--text-d)" }}>(you)</span>}
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 6, background: m.role === "admin" ? "var(--gold-bg)" : "rgba(125,133,144,.1)", color: m.role === "admin" ? "var(--gold)" : "var(--text-d)", fontWeight: 600 }}>
                          {m.role || "member"}
                        </span>
                        {openTasks > 0 && (
                          <span style={{ fontSize: 10, color: "var(--blue)" }}>{openTasks} open task{openTasks > 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Projects assigned to each member (admin view) */}
            {isAdmin && (
              <div style={{ marginTop: 36 }}>
                <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 16, fontWeight: 600 }}>Shared Projects</div>
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "4px 20px" }}>
                  {firmProjects.filter(p => sharedIds.has(p.id)).length === 0 ? (
                    <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "var(--text-d)" }}>No projects shared yet — go to the Projects tab to share</div>
                  ) : (
                    firmProjects.filter(p => sharedIds.has(p.id)).map(p => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                        onClick={() => router.push(`/workspace/${p.id}`)}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 2 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-d)" }}>{p.location || "No location"} · {p.asset_type}</div>
                        </div>
                        <span style={{ fontSize: 10, color: "var(--green)", background: "rgba(61,220,132,.07)", border: "1px solid rgba(61,220,132,.2)", padding: "2px 9px", borderRadius: 10 }}>Shared</span>
                        <span style={{ fontSize: 11, color: "var(--gold)" }}>→</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
