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
  --bg:#06070a;--bg1:#0c0e12;--bg2:#12151a;--bg3:#191d24;--bg4:#21262f;--bg5:#2a303b;
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
.nav-item{width:100%;display:flex;align-items:center;padding:9px 12px;border-radius:7px;font-size:13px;color:var(--text-m);background:transparent;border:1px solid transparent;cursor:pointer;font-family:var(--font-body);transition:all .15s;text-align:left;margin-bottom:2px}
.nav-item:hover{color:var(--text);background:var(--bg3)}
.nav-item.active{color:var(--gold);background:rgba(201,168,76,.08);border-color:var(--gold-border);font-weight:600}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:7px;padding:9px 18px;font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:background .2s;display:inline-flex;align-items:center;gap:8px}
.btn-primary:hover{background:var(--gold-l)}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:8px 16px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.task-row{display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border-bottom:1px solid var(--bg4);transition:background .15s;border-radius:8px}
.task-row:hover{background:var(--bg3)}
.task-row.completed{opacity:.5}
.checkbox{width:18px;height:18px;border-radius:4px;border:1.5px solid var(--border-m);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;transition:all .2s}
.checkbox.checked{background:var(--green);border-color:var(--green)}
.priority-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
.tag{font-size:10px;padding:2px 8px;border-radius:10px;font-weight:500;letter-spacing:.03em}
.tag-urgent{background:rgba(244,100,95,.12);color:var(--red)}
.tag-high{background:rgba(240,164,41,.1);color:var(--amber)}
.tag-medium{background:rgba(91,156,246,.1);color:var(--blue)}
.tag-low{background:rgba(125,133,144,.12);color:var(--text-d)}
.overdue{color:var(--red);font-size:11px;font-family:var(--font-mono)}
.filter-btn{padding:6px 14px;border-radius:6px;font-size:12px;background:transparent;border:1px solid var(--border);color:var(--text-d);cursor:pointer;font-family:var(--font-body);transition:all .2s}
.filter-btn:hover{border-color:var(--gold);color:var(--gold)}
.filter-btn.active{background:rgba(201,168,76,.08);border-color:var(--gold-border);color:var(--gold)}
.project-group{margin-bottom:32px;animation:fadeIn .3s ease both}
.project-group-header{display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px 10px 0 0;border-bottom:none}
.inp{width:100%;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font-body);font-size:13px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold)}
.inp::placeholder{color:var(--text-d)}
`;

const PRIORITY_CONFIG: Record<string, { label: string; dot: string; tag: string }> = {
  urgent: { label: "Urgent", dot: "#f4645f", tag: "tag-urgent" },
  high:   { label: "High",   dot: "#f0a429", tag: "tag-high" },
  medium: { label: "Medium", dot: "#5b9cf6", tag: "tag-medium" },
  low:    { label: "Low",    dot: "#3d4249", tag: "tag-low" },
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
      .eq("created_by", userId)
      .order("due_at", { ascending: true, nullsFirst: false });
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

  // Apply filters
  const now = new Date();
  const filtered = tasks.filter(t => {
    if (filter === "pending" && t.completed) return false;
    if (filter === "completed" && !t.completed) return false;
    if (filter === "overdue" && (t.completed || !t.due_at || new Date(t.due_at) >= now)) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !t.projects?.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by project name
  const grouped = filtered.reduce((acc: Record<string, any[]>, task) => {
    const projectName = task.projects?.name || "No Project";
    if (!acc[projectName]) acc[projectName] = [];
    acc[projectName].push(task);
    return acc;
  }, {});

  // Sort groups by project name
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

  const pendingCount = tasks.filter(t => !t.completed).length;
  const overdueCount = tasks.filter(t => !t.completed && t.due_at && new Date(t.due_at) < now).length;
  const completedCount = tasks.filter(t => t.completed).length;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", display: "flex" }}>
      <style>{CSS}</style>

      {/* Sidebar */}
      <div style={{ width: 220, background: "var(--bg1)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--gold)", letterSpacing: ".1em", fontWeight: 300 }}>VALORA</div>
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

      {/* Main content */}
      <div style={{ marginLeft: 220, flex: 1, minWidth: 0, padding: "48px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>Tasks</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, marginBottom: 6 }}>All Tasks</h1>
            <p style={{ fontSize: 13, color: "var(--text-d)" }}>
              {pendingCount} pending · {overdueCount > 0 && <span style={{ color: "var(--red)" }}>{overdueCount} overdue · </span>}{completedCount} completed
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
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
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {(["pending", "all", "overdue", "completed"] as const).map(f => (
              <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "overdue" && overdueCount > 0 && <span style={{ marginLeft: 4, background: "var(--red)", color: "#fff", borderRadius: 10, padding: "0px 5px", fontSize: 9, fontWeight: 700 }}>{overdueCount}</span>}
              </button>
            ))}
          </div>
          <div style={{ width: 1, height: 20, background: "var(--border)" }} />
          <div style={{ display: "flex", gap: 6 }}>
            {["all", "urgent", "high", "medium", "low"].map(p => (
              <button key={p} className={`filter-btn ${priorityFilter === p ? "active" : ""}`} onClick={() => setPriorityFilter(p)} style={{ fontSize: 11 }}>
                {p === "all" ? "All Priority" : PRIORITY_CONFIG[p]?.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <input className="inp" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" style={{ width: 220, padding: "7px 12px", fontSize: 12 }} />
        </div>

        {/* Task groups */}
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
              {/* Project header */}
              <div className="project-group-header">
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 600 }}>
                  {projectTasks[0]?.projects?.asset_type || "—"}
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", fontFamily: "var(--font-display)" }}>{projectName}</span>
                {projectTasks[0]?.projects?.location && (
                  <span style={{ fontSize: 11, color: "var(--text-d)" }}>{projectTasks[0].projects.location}</span>
                )}
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-d)" }}>
                  {projectTasks.filter((t:any) => !t.completed).length} pending · {projectTasks.length} total
                </span>
                <button className="btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => {
                  const projectId = projectTasks[0]?.project_id;
                  if (projectId) router.push(`/pipeline`);
                }}>View in Pipeline →</button>
              </div>

              {/* Task rows */}
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "4px 0" }}>
                {projectTasks.map((task: any) => {
                  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                  const due = task.due_at ? formatDue(task.due_at) : null;
                  return (
                    <div key={task.id} className={`task-row ${task.completed ? "completed" : ""}`}>
                      {/* Checkbox */}
                      <div className={`checkbox ${task.completed ? "checked" : ""}`} onClick={() => toggleComplete(task)}>
                        {task.completed && <span style={{ fontSize: 11, color: "#06070a", fontWeight: 700 }}>✓</span>}
                      </div>

                      {/* Priority dot */}
                      <div className="priority-dot" style={{ background: p.dot }} />

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: task.completed ? "var(--text-d)" : "var(--text)", textDecoration: task.completed ? "line-through" : "none", marginBottom: 4, lineHeight: 1.4 }}>
                          {task.description}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span className={`tag ${p.tag}`}>{p.label}</span>
                          {due && (
                            <span className={due.overdue ? "overdue" : ""} style={{ fontSize: 11, color: due.overdue ? "var(--red)" : "var(--text-d)", fontFamily: "var(--font-mono)" }}>
                              {due.overdue && "⚠ "}{due.text}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: "var(--text-d)" }}>
                            Added {new Date(task.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", color: "var(--text-d)", cursor: "pointer", fontSize: 16, padding: "0 4px", opacity: 0.5, transition: "opacity .2s" }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={e => (e.currentTarget.style.opacity = "0.5")}
                      >×</button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {tasks.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-d)", fontSize: 14 }}>
            No tasks match the current filters.
          </div>
        )}

      </div>
    </div>
  );
}
