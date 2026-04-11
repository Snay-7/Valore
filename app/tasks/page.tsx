"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";


const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#52C498;--gold-l:#72D4AE;--gold-bg:rgba(82,196,152,0.08);--gold-border:rgba(82,196,152,0.22);
  --bg:#0D1017;--bg1:#252D3F;--bg2:#141920;--bg3:#1A2030;--bg4:#202840;--bg5:#2A3350;
  --text:#F0EEE8;--text-m:#8B93A5;--text-d:#4D5570;
  --border:rgba(255,255,255,0.07);--border-m:rgba(255,255,255,0.13);
  --green:#52C498;--red:#D45252;--amber:#E0A030;--blue:#4A80C4;--purple:#a78bfa;
  --font-display:'Inter',system-ui,sans-serif;
  --font-body:'Inter',system-ui,sans-serif;
  --font-mono:'DM Mono',monospace;
}
body.light{
  --gold:#2A8A64;--gold-l:#1F7050;--gold-bg:rgba(82,196,152,0.09);--gold-border:rgba(82,196,152,0.25);
  --bg:#F8F9FA;--bg1:#252D3F;--bg2:#FFFFFF;--bg3:#F8F9FA;--bg4:#E8EAED;--bg5:#DDE0E6;
  --text:#1E2433;--text-m:#5A6478;--text-d:#9AA3AF;
  --border:#E8EAED;--border-m:#D0D4DC;
  --green:#2A8A64;--red:#C04040;--amber:#B07820;--blue:#2A5FAA;--purple:#7C3AED;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.nav-item{width:100%;display:flex;align-items:center;padding:9px 12px;border-radius:7px;font-size:13px;color:var(--text-m);background:transparent;border:1px solid transparent;cursor:pointer;font-family:var(--font-body);transition:all .15s;text-align:left;margin-bottom:2px}
.nav-item:hover{color:#F0EEE8;background:rgba(255,255,255,0.07)}
.nav-item.active{color:var(--gold);background:rgba(82,196,152,.08);border-color:var(--gold-border);font-weight:600}
.btn-primary{background:var(--gold);color:#0D1017;border:none;border-radius:7px;padding:9px 18px;font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:background .2s;display:inline-flex;align-items:center;gap:8px}
.btn-primary:hover{background:var(--gold-l)}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:8px 16px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.task-row{display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border-bottom:1px solid var(--bg4);transition:background .15s;border-radius:8px;position:relative}
.task-row:hover{background:var(--bg3)}
.task-row:hover .task-actions{opacity:1}
.task-row.completed{opacity:.5}
.task-actions{opacity:0;transition:opacity .15s;display:flex;gap:4px;flex-shrink:0}
.checkbox{width:18px;height:18px;border-radius:4px;border:1.5px solid var(--border-m);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;transition:all .2s}
.checkbox.checked{background:var(--green);border-color:var(--green)}
.priority-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
.tag{font-size:10px;padding:2px 8px;border-radius:10px;font-weight:500;letter-spacing:.03em}
.tag-urgent{background:rgba(244,100,95,.12);color:var(--red)}
.tag-high{background:rgba(240,164,41,.1);color:var(--amber)}
.tag-medium{background:rgba(91,156,246,.1);color:var(--blue)}
.tag-low{background:rgba(125,133,144,.12);color:var(--text-d)}
.filter-btn{padding:6px 14px;border-radius:6px;font-size:12px;background:transparent;border:1px solid var(--border);color:var(--text-d);cursor:pointer;font-family:var(--font-body);transition:all .2s;white-space:nowrap}
.filter-btn:hover{border-color:var(--gold);color:var(--gold)}
.filter-btn.active{background:rgba(82,196,152,.08);border-color:var(--gold-border);color:var(--gold)}
.project-group{margin-bottom:32px;animation:fadeIn .3s ease both}
.project-group-header{display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px 10px 0 0;border-bottom:none;flex-wrap:wrap}
.inp{width:100%;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font-body);font-size:13px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold)}
.inp::placeholder{color:var(--text-d)}
.edit-modal{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200}
.edit-card{background:var(--bg2);border:1px solid var(--border-m);border-radius:14px;padding:28px;width:480px;max-width:calc(100vw - 40px)}


/* Desktop sidebar */
.sidebar{width:220px;background:#252D3F;border-right:none;display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}


/* Mobile top bar */
.mobile-topbar{display:none;align-items:center;justify-content:space-between;padding:16px 20px;background:var(--bg1);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50}


/* Bottom nav */
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:#252D3F;border-top:1px solid rgba(255,255,255,0.07);z-index:100;padding:8px 0 env(safe-area-inset-bottom,16px)}
.bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 4px;background:none;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);font-size:9px;letter-spacing:.06em;text-transform:uppercase;transition:color .2s;position:relative}
.bottom-nav-item.active{color:var(--gold)}
.bottom-nav-item svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}


@media(max-width:768px){
  .sidebar{display:none}
  .bottom-nav{display:flex}
  .mobile-topbar{display:flex}
  .main-content{margin-left:0!important;max-width:100vw!important;padding:20px 16px 100px!important}
  .task-actions{opacity:1!important}
  .filters-row{flex-direction:column;align-items:stretch!important}
  .filters-row .inp{width:100%!important}
  .stats-grid{grid-template-columns:repeat(2,1fr)!important}
}
`;


const PRIORITY_CONFIG: Record<string, { label: string; dot: string; tag: string }> = {
  urgent: { label: "Urgent", dot: "#D45252", tag: "tag-urgent" },
  high:   { label: "High",   dot: "#E0A030", tag: "tag-high" },
  medium: { label: "Medium", dot: "#4A80C4", tag: "tag-medium" },
  low:    { label: "Low",    dot: "#4D5570", tag: "tag-low" },
};


function formatDue(due: string) {
  const d = new Date(due);
  const now = new Date();
  const diff = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, overdue: true };
  if (diff === 0) return { text: "Due today", overdue: true };
  if (diff === 1) return { text: "Due tomorrow", overdue: false };
  return { text: `Due ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`, overdue: false };
}


export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all"|"pending"|"completed"|"overdue">("pending");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editForm, setEditForm] = useState({ description: "", priority: "medium", due_at: "" });
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);
      await loadTasks(session.user.id);
    };
    init();
  }, [router]);


  const loadTasks = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select(`*, projects(id, name, asset_type, location)`)
      .or(`created_by.eq.${userId},assigned_to.eq.${userId}`)
      .order("created_at", { ascending: false });
    setTasks(data || []);
    setLoading(false);
  };


  const toggleComplete = async (task: any) => {
    const newVal = !task.completed;
    await supabase.from("tasks").update({ completed: newVal }).eq("id", task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: newVal } : t));
  };


  const deleteTask = async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };


  const openEdit = (task: any) => {
    setEditingTask(task);
    setEditForm({
      description: task.description,
      priority: task.priority || "medium",
      due_at: task.due_at ? new Date(task.due_at).toISOString().slice(0, 16) : "",
    });
  };


  const saveEdit = async () => {
    if (!editingTask || !editForm.description.trim()) return;
    setSaving(true);
    const updates: any = {
      description: editForm.description.trim(),
      priority: editForm.priority,
      due_at: editForm.due_at ? new Date(editForm.due_at).toISOString() : null,
    };
    await supabase.from("tasks").update(updates).eq("id", editingTask.id);
    setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...updates } : t));
    setEditingTask(null);
    setSaving(false);
  };


  const now = new Date();
  const filtered = tasks.filter(t => {
    if (filter === "pending" && t.completed) return false;
    if (filter === "completed" && !t.completed) return false;
    if (filter === "overdue" && (t.completed || !t.due_at || new Date(t.due_at) >= now)) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !t.projects?.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });


  const grouped = filtered.reduce((acc: Record<string, any[]>, task) => {
    const key = task.projects?.name || "No Project";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});


  const sortedGroups = Object.entries(grouped as Record<string, any[]>).sort(([a], [b]) => a.localeCompare(b));
  const pendingCount = tasks.filter(t => !t.completed).length;
  const overdueCount = tasks.filter(t => !t.completed && t.due_at && new Date(t.due_at) < now).length;
  const completedCount = tasks.filter(t => t.completed).length;


  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0D1017", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid rgba(82,196,152,.2)", borderTopColor: "#52C498", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );


  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", display: "flex" }}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){var t=localStorage.getItem('valora-theme')||'light';if(t==='light')document.body.classList.add('light');})()`}}/>


      {/* ── DESKTOP SIDEBAR ── */}
      <div className="sidebar">
        <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid var(--border)" }}>
          <span style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:16,fontWeight:600,letterSpacing:"-.02em",color:"#ffffff"}}>Valora</span>
          <div style={{ fontSize: 9, color: "var(--text-d)", letterSpacing: ".14em", textTransform: "uppercase", marginTop: 2 }}>Development Appraisal</div>
        </div>
        <div style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 12px", marginBottom: 8 }}>Workspace</div>
          <button className="nav-item" onClick={() => router.push("/dashboard")}>Portfolio</button>
          <button className="nav-item" onClick={() => router.push("/pipeline")}>Pipeline</button>
          <button className="nav-item active">Tasks</button>
          <button className="nav-item" onClick={() => router.push("/team")}>Team</button>
          <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
          <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 12px", marginBottom: 8 }}>Manage</div>
          <button className="nav-item" onClick={() => router.push("/dashboard")}>Trash</button>
        </div>
        <div style={{ padding: "16px 16px 20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--text-d)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          <button className="nav-item" style={{ fontSize: 12 }} onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}>Sign Out</button>
        </div>
      </div>


      {/* ── MAIN CONTENT ── */}
      <div className="main-content" style={{ marginLeft: 220, flex: 1, minWidth: 0, padding: "48px 40px" }}>


        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <span style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:16,fontWeight:600,letterSpacing:"-.02em",color:"#ffffff"}}>Valora</span>
          <div style={{ fontSize: 12, color: "var(--text-d)" }}>{pendingCount} pending</div>
        </div>


        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>Tasks</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, marginBottom: 6 }}>All Tasks</h1>
          <p style={{ fontSize: 13, color: "var(--text-d)" }}>
            {pendingCount} pending · {overdueCount > 0 && <span style={{ color: "var(--red)" }}>{overdueCount} overdue · </span>}{completedCount} completed
          </p>
        </div>


        {/* Stats */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Tasks", value: tasks.length, color: "var(--text)" },
            { label: "Pending", value: pendingCount, color: "var(--amber)" },
            { label: "Overdue", value: overdueCount, color: "var(--red)" },
            { label: "Completed", value: completedCount, color: "var(--green)" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>


        {/* Filters */}
        <div className="filters-row" style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["pending", "all", "overdue", "completed"] as const).map(f => (
              <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "overdue" && overdueCount > 0 && <span style={{ marginLeft: 4, background: "var(--red)", color: "#fff", borderRadius: 10, padding: "0 5px", fontSize: 9, fontWeight: 700 }}>{overdueCount}</span>}
              </button>
            ))}
          </div>
          <div style={{ width: 1, height: 20, background: "var(--border)" }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["all", "urgent", "high", "medium", "low"].map(p => (
              <button key={p} className={`filter-btn ${priorityFilter === p ? "active" : ""}`} onClick={() => setPriorityFilter(p)} style={{ fontSize: 11 }}>
                {p === "all" ? "All Priority" : PRIORITY_CONFIG[p]?.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 160 }} />
          <input className="inp" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" style={{ width: 220, padding: "7px 12px", fontSize: 12 }} />
        </div>


        {/* Groups */}
        {sortedGroups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 300, color: "var(--text-d)", marginBottom: 16 }}>✓</div>
            <p style={{ fontSize: 16, color: "var(--text-d)", marginBottom: 8 }}>
              {filter === "pending" ? "No pending tasks" : filter === "overdue" ? "No overdue tasks" : "No tasks found"}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-d)" }}>Tasks are created from the Pipeline view on each deal card.</p>
          </div>
        ) : (
          sortedGroups.map(([projectName, projectTasks], gi) => (
            <div key={projectName} className="project-group" style={{ animationDelay: `${gi * 0.05}s` }}>
              <div className="project-group-header">
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 600 }}>
                  {projectTasks[0]?.projects?.asset_type || "—"}
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", fontFamily: "var(--font-display)" }}>{projectName}</span>
                {projectTasks[0]?.projects?.location && (
                  <span style={{ fontSize: 11, color: "var(--text-d)" }}>{projectTasks[0].projects.location}</span>
                )}
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-d)" }}>
                  {projectTasks.filter((t: any) => !t.completed).length} pending · {projectTasks.length} total
                </span>
                <button className="btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => router.push("/pipeline")}>Pipeline →</button>
              </div>
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "4px 0" }}>
                {projectTasks.map((task: any) => {
                  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                  const due = task.due_at ? formatDue(task.due_at) : null;
                  return (
                    <div key={task.id} className={`task-row ${task.completed ? "completed" : ""}`}>
                      <div className={`checkbox ${task.completed ? "checked" : ""}`} onClick={() => toggleComplete(task)}>
                        {task.completed && <span style={{ fontSize: 11, color: "#0D1017", fontWeight: 700 }}>✓</span>}
                      </div>
                      <div className="priority-dot" style={{ background: p.dot }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: task.completed ? "var(--text-d)" : "var(--text)", textDecoration: task.completed ? "line-through" : "none", marginBottom: 4, lineHeight: 1.4 }}>
                          {task.description}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span className={`tag ${p.tag}`}>{p.label}</span>
                          {due && (
                            <span style={{ fontSize: 11, color: due.overdue ? "var(--red)" : "var(--text-d)", fontFamily: "var(--font-mono)" }}>
                              {due.overdue && "⚠ "}{due.text}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: "var(--text-d)" }}>
                            Added {new Date(task.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                      <div className="task-actions">
                        <button
                          onClick={() => openEdit(task)}
                          style={{ padding: "4px 10px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-m)", fontSize: 11, cursor: "pointer", fontFamily: "var(--font-body)", transition: "all .15s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-m)"; }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          style={{ padding: "4px 10px", background: "var(--bg3)", border: "1px solid rgba(244,100,95,.3)", borderRadius: 5, color: "var(--red)", fontSize: 11, cursor: "pointer", fontFamily: "var(--font-body)", transition: "all .15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,100,95,.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "var(--bg3)"; }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>


      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <button className="bottom-nav-item" onClick={() => router.push("/dashboard")}>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Portfolio
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/pipeline")}>
          <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          Pipeline
        </button>
        <button className="bottom-nav-item active">
          <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          Tasks
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/team")}>
          <svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.85"/></svg>
          Team
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/dashboard")}>
          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          Trash
        </button>
      </nav>


      {/* Edit Modal */}
      {editingTask && (
        <div className="edit-modal" onClick={e => { if (e.target === e.currentTarget) setEditingTask(null); }}>
          <div className="edit-card">
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 300, marginBottom: 4 }}>Edit Task</div>
            <div style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 24 }}>{editingTask.projects?.name}</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 6 }}>Description</label>
              <textarea
                className="inp"
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                style={{ minHeight: 80, resize: "vertical", fontFamily: "var(--font-body)" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 6 }}>Priority</label>
                <select className="inp" value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 6 }}>Due Date</label>
                <input type="datetime-local" className="inp" value={editForm.due_at} onChange={e => setEditForm(f => ({ ...f, due_at: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost" onClick={() => setEditingTask(null)} style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
              <button className="btn-primary" onClick={saveEdit} disabled={saving || !editForm.description.trim()} style={{ flex: 2, justifyContent: "center" }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
