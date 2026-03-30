"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";

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
.inp{width:100%;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font-body);font-size:13px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold)}
.inp::placeholder{color:var(--text-d)}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:7px;padding:9px 18px;font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:background .2s}
.btn-primary:hover{background:var(--gold-l)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:8px 14px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.tab-btn{padding:10px 20px;font-size:13px;background:none;border:none;border-bottom:2px solid transparent;color:var(--text-d);cursor:pointer;font-family:var(--font-body);transition:all .2s}
.tab-btn.active{border-bottom-color:var(--gold);color:var(--gold)}
.task-row{display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border-bottom:1px solid var(--bg4);transition:background .15s;border-radius:8px}
.task-row:hover{background:var(--bg3)}
.task-row.completed{opacity:.5}
.checkbox{width:18px;height:18px;border-radius:4px;border:1.5px solid var(--border-m);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;transition:all .2s}
.checkbox.checked{background:var(--green);border-color:var(--green)}
.priority-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
.comment-row{padding:14px 0;border-bottom:1px solid var(--bg4)}
.comment-row:last-child{border-bottom:none}
.activity-row{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--bg4)}
.activity-row:last-child{border-bottom:none}
.metric-pill{background:var(--bg3);border-radius:8px;padding:10px 14px}
.nav-item{width:100%;display:flex;align-items:center;padding:9px 12px;border-radius:7px;font-size:13px;color:var(--text-m);background:transparent;border:1px solid transparent;cursor:pointer;font-family:var(--font-body);transition:all .15s;text-align:left;margin-bottom:2px}
.nav-item:hover{color:var(--text);background:var(--bg3)}
.nav-item.active{color:var(--gold);background:rgba(201,168,76,.08);border-color:var(--gold-border);font-weight:600}
.sidebar{width:220px;background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}
@media(max-width:768px){
  .sidebar{display:none}
  .main-content{margin-left:0!important;max-width:100vw!important;padding:20px 16px 40px!important}
}
`;

const PRIORITY_CONFIG: Record<string, { dot: string; label: string }> = {
  urgent: { dot: "#f4645f", label: "Urgent" },
  high:   { dot: "#f0a429", label: "High" },
  medium: { dot: "#5b9cf6", label: "Medium" },
  low:    { dot: "#3d4249", label: "Low" },
};

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

export default function WorkspaceProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [appraisal, setAppraisal] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [firmMembers, setFirmMembers] = useState<any[]>([]);
  const [memberRole, setMemberRole] = useState("member");
  const [firm, setFirm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "tasks" | "notes" | "activity">("overview");

  // Task form
  const [newTask, setNewTask] = useState({ description: "", priority: "medium", assigned_to: "", due_at: "" });
  const [addingTask, setAddingTask] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  // Note form
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      const u = session.user;
      setUser(u);

      // Load project
      const { data: proj } = await supabase
        .from("projects")
        .select(`*, appraisals(*)`)
        .eq("id", projectId)
        .single();
      if (!proj) { router.push("/workspace"); return; }
      setProject(proj);
      setAppraisal(proj.appraisals?.[0] || null);

      // Get firm membership
      const { data: memberRow } = await supabase
        .from("firm_members")
        .select("*, firms(*)")
        .eq("user_id", u.id)
        .maybeSingle();
      if (memberRow) {
        setFirm(memberRow.firms);
        setMemberRole(memberRow.role);

        // Get firm members for task assignment
        const { data: members } = await supabase
          .from("firm_members")
          .select("*")
          .eq("firm_id", memberRow.firm_id);
        setFirmMembers(members || []);
      }

      // Load tasks
      const { data: t } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      setTasks(t || []);

      // Load notes
      const { data: n } = await supabase
        .from("notes")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      setNotes(n || []);

      // Load activity
      const { data: a } = await supabase
        .from("activity_log")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      setActivity(a || []);

      setLoading(false);
    };
    init();
  }, [projectId, router]);

  const logActivity = async (action: string, details?: any) => {
    if (!user || !firm) return;
    await supabase.from("activity_log").insert({
      project_id: projectId,
      firm_id: firm.id,
      user_id: user.id,
      user_email: user.email,
      action,
      details: details || {},
    });
    const { data: a } = await supabase.from("activity_log").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
    setActivity(a || []);
  };

  const addTask = async () => {
    if (!newTask.description.trim() || !user) return;
    setSavingTask(true);
    const assignedMember = firmMembers.find(m => m.user_id === newTask.assigned_to);
    const { data: task } = await supabase.from("tasks").insert({
      project_id: projectId,
      created_by: user.id,
      created_by_email: user.email,
      description: newTask.description.trim(),
      priority: newTask.priority,
      assigned_to: newTask.assigned_to || null,
      assigned_to_email: assignedMember ? assignedMember.user_id : null,
      assigned_by: user.id,
      due_at: newTask.due_at ? new Date(newTask.due_at).toISOString() : null,
      completed: false,
    }).select().single();

    if (task) {
      setTasks(prev => [task, ...prev]);
      await logActivity("task_created", { description: newTask.description, assigned_to: newTask.assigned_to || "unassigned" });
    }
    setNewTask({ description: "", priority: "medium", assigned_to: "", due_at: "" });
    setAddingTask(false);
    setSavingTask(false);
  };

  const toggleTask = async (task: any) => {
    const newVal = !task.completed;
    await supabase.from("tasks").update({ completed: newVal }).eq("id", task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: newVal } : t));
    await logActivity(newVal ? "task_completed" : "task_reopened", { description: task.description });
  };

  const addNote = async () => {
    if (!newNote.trim() || !user) return;
    setSavingNote(true);
    const { data: note } = await supabase.from("notes").insert({
      project_id: projectId,
      created_by: user.id,
      created_by_email: user.email,
      content: newNote.trim(),
    }).select().single();

    if (note) {
      setNotes(prev => [note, ...prev]);
      await logActivity("note_added", { preview: newNote.trim().slice(0, 50) });
    }
    setNewNote("");
    setSavingNote(false);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  const actionLabel = (action: string) => {
    const map: Record<string, string> = {
      task_created: "created a task",
      task_completed: "completed a task",
      task_reopened: "reopened a task",
      note_added: "added a note",
      project_shared: "shared this project",
    };
    return map[action] || action;
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const sym = CURRENCY_SYMBOLS[project?.currency] || "£";
  const canEdit = memberRole === "admin" || memberRole === "editor";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", display: "flex" }}>
      <style>{CSS}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--gold)", letterSpacing: ".1em", fontWeight: 300 }}>VALORA</div>
          <div style={{ fontSize: 9, color: "var(--text-d)", letterSpacing: ".14em", textTransform: "uppercase", marginTop: 2 }}>Development Appraisal</div>
        </div>
        <div style={{ padding: "16px 12px", flex: 1 }}>
          <button className="nav-item" onClick={() => router.push("/workspace")}>← Workspace</button>
          <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
          {["overview", "tasks", "notes", "activity"].map(t => (
            <button key={t} className={`nav-item ${tab === t ? "active" : ""}`} onClick={() => setTab(t as any)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "tasks" && tasks.filter(tk => !tk.completed).length > 0 && (
                <span style={{ marginLeft: "auto", background: "var(--amber)", color: "#06070a", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
                  {tasks.filter(tk => !tk.completed).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div style={{ padding: "16px 16px 20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--text-d)", marginBottom: 6 }}>{user?.email}</div>
          <div style={{ fontSize: 10, color: "var(--gold)" }}>{firm?.name}</div>
        </div>
      </div>

      {/* Main */}
      <div className="main-content" style={{ marginLeft: 220, flex: 1, minWidth: 0, padding: "48px 40px" }}>

        {/* Back + header */}
        <div style={{ marginBottom: 8 }}>
          <button className="btn-ghost" style={{ fontSize: 11, padding: "5px 12px", marginBottom: 16 }} onClick={() => router.push("/workspace")}>
            ← Back to Workspace
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 10, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 600 }}>{project?.asset_type}</span>
                <span style={{ fontSize: 10, color: "var(--text-d)", fontFamily: "var(--font-mono)" }}>
                  {memberRole} · {firm?.name}
                </span>
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, marginBottom: 4 }}>{project?.name}</h1>
              <p style={{ fontSize: 14, color: "var(--text-m)" }}>{project?.location || "No location"}</p>
            </div>
            {canEdit && (
              <button className="btn-primary" onClick={() => router.push(`/appraisal?project=${projectId}`)}>
                Open Appraisal →
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 32, marginTop: 24 }}>
          {["overview", "tasks", "notes", "activity"].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t as any)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "tasks" && tasks.filter(tk => !tk.completed).length > 0 && (
                <span style={{ marginLeft: 6, background: "var(--amber)", color: "#06070a", borderRadius: 10, padding: "0 6px", fontSize: 10, fontWeight: 700 }}>
                  {tasks.filter(tk => !tk.completed).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div>
            {appraisal ? (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
                  {[
                    { label: "GDV", value: fmt(appraisal.gdv, sym), color: "var(--gold)" },
                    { label: "Total Cost", value: fmt(appraisal.total_cost, sym), color: "var(--text)" },
                    { label: "Profit", value: fmt(appraisal.profit, sym), color: appraisal.profit > 0 ? "var(--green)" : "var(--red)" },
                    { label: "Profit on Cost", value: fmtPct(appraisal.profit_on_cost), color: appraisal.profit_on_cost > 0.2 ? "var(--green)" : "var(--amber)" },
                    { label: "IRR (Unlevered)", value: fmtPct(appraisal.irr_unlevered), color: "var(--blue)" },
                    { label: "IRR (Levered)", value: fmtPct(appraisal.irr_levered), color: "var(--blue)" },
                    { label: "Yield on Cost", value: fmtPct(appraisal.yield_on_cost), color: "var(--text-m)" },
                    { label: "Status", value: appraisal.status || "draft", color: "var(--text-m)" },
                  ].map(m => (
                    <div key={m.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px" }}>
                      <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>{m.label}</div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 300, color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Pipeline Status</div>
                    <div style={{ fontSize: 12, color: "var(--text-m)" }}>{project?.stage || "Prospect"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Prospect", "Feasibility", "Under Offer", "In Development", "Completed"].map(s => (
                      <div key={s} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 10, background: project?.stage === s ? "var(--gold-bg)" : "var(--bg3)", color: project?.stage === s ? "var(--gold)" : "var(--text-d)", border: `1px solid ${project?.stage === s ? "var(--gold-border)" : "var(--border)"}` }}>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontSize: 14, color: "var(--text-d)", marginBottom: 16 }}>No appraisal data yet.</p>
                {canEdit && <button className="btn-primary" onClick={() => router.push(`/appraisal?project=${projectId}`)}>Open Appraisal →</button>}
              </div>
            )}
          </div>
        )}

        {/* TASKS TAB */}
        {tab === "tasks" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 300 }}>Tasks</h2>
                <p style={{ fontSize: 12, color: "var(--text-d)", marginTop: 4 }}>
                  {tasks.filter(t => !t.completed).length} pending · {tasks.filter(t => t.completed).length} completed
                </p>
              </div>
              <button className="btn-primary" onClick={() => setAddingTask(!addingTask)}>
                {addingTask ? "Cancel" : "+ Add Task"}
              </button>
            </div>

            {/* Add task form */}
            {addingTask && (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--gold-border)", borderRadius: 12, padding: 20, marginBottom: 24, animation: "fadeIn .2s ease" }}>
                <div style={{ marginBottom: 12 }}>
                  <input className="inp" value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} placeholder="Task description…" autoFocus onKeyDown={e => e.key === "Enter" && addTask()} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 4 }}>Priority</label>
                    <select className="inp" value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 4 }}>Assign to</label>
                    <select className="inp" value={newTask.assigned_to} onChange={e => setNewTask(p => ({ ...p, assigned_to: e.target.value }))}>
                      <option value="">Unassigned</option>
                      {firmMembers.map(m => (
                        <option key={m.id} value={m.user_id}>{m.user_id === user?.id ? "Me" : `${m.role} (${m.user_id.slice(0, 8)})`}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 4 }}>Due Date</label>
                    <input type="datetime-local" className="inp" value={newTask.due_at} onChange={e => setNewTask(p => ({ ...p, due_at: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn-ghost" onClick={() => setAddingTask(false)} style={{ flex: 1 }}>Cancel</button>
                  <button className="btn-primary" onClick={addTask} disabled={savingTask || !newTask.description.trim()} style={{ flex: 2 }}>
                    {savingTask ? "Adding…" : "Add Task"}
                  </button>
                </div>
              </div>
            )}

            {/* Task list */}
            {tasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontSize: 14, color: "var(--text-d)" }}>No tasks yet — add the first one!</p>
              </div>
            ) : (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "4px 0" }}>
                {tasks.map(task => {
                  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                  const due = task.due_at ? new Date(task.due_at) : null;
                  const overdue = due && due < new Date() && !task.completed;
                  return (
                    <div key={task.id} className={`task-row ${task.completed ? "completed" : ""}`}>
                      <div className={`checkbox ${task.completed ? "checked" : ""}`} onClick={() => toggleTask(task)}>
                        {task.completed && <span style={{ fontSize: 11, color: "#06070a", fontWeight: 700 }}>✓</span>}
                      </div>
                      <div className="priority-dot" style={{ background: p.dot }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: task.completed ? "var(--text-d)" : "var(--text)", textDecoration: task.completed ? "line-through" : "none", marginBottom: 4 }}>
                          {task.description}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 8, background: "var(--bg3)", color: "var(--text-d)" }}>{p.label}</span>
                          {task.assigned_to_email && (
                            <span style={{ fontSize: 11, color: "var(--blue)" }}>→ {task.assigned_to === user?.id ? "You" : task.assigned_to?.slice(0, 8)}</span>
                          )}
                          {due && (
                            <span style={{ fontSize: 11, color: overdue ? "var(--red)" : "var(--text-d)", fontFamily: "var(--font-mono)" }}>
                              {overdue ? "⚠ " : ""}{due.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            </span>
                          )}
                          <span style={{ fontSize: 10, color: "var(--text-d)", marginLeft: "auto" }}>
                            by {task.created_by_email || task.created_by?.slice(0, 8)} · {formatTime(task.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* NOTES TAB */}
        {tab === "notes" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 300 }}>Notes & Comments</h2>
            </div>

            {/* Add note */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <textarea
                className="inp"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Add a note or comment…"
                style={{ minHeight: 80, resize: "vertical", fontFamily: "var(--font-body)", marginBottom: 12 }}
              />
              <button className="btn-primary" onClick={addNote} disabled={savingNote || !newNote.trim()}>
                {savingNote ? "Posting…" : "Post Note →"}
              </button>
            </div>

            {/* Notes list */}
            {notes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontSize: 14, color: "var(--text-d)" }}>No notes yet — be the first to add one!</p>
              </div>
            ) : (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "4px 20px" }}>
                {notes.map(note => (
                  <div key={note.id} className="comment-row">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--gold)", flexShrink: 0 }}>
                        {(note.created_by_email || note.created_by || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>
                          {note.created_by === user?.id ? "You" : note.created_by_email || `Member ${note.created_by?.slice(0, 8)}`}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-d)", marginLeft: 8 }}>{formatTime(note.created_at)}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-m)", lineHeight: 1.6, paddingLeft: 38 }}>{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {tab === "activity" && (
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 300, marginBottom: 24 }}>Activity Log</h2>
            {activity.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontSize: 14, color: "var(--text-d)" }}>No activity yet.</p>
              </div>
            ) : (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "4px 20px" }}>
                {activity.map(a => (
                  <div key={a.id} className="activity-row">
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--text-d)", flexShrink: 0 }}>
                      {(a.user_email || "?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
                        <strong style={{ color: a.user_id === user?.id ? "var(--gold)" : "var(--text)" }}>
                          {a.user_id === user?.id ? "You" : a.user_email || `Member ${a.user_id?.slice(0, 8)}`}
                        </strong>{" "}
                        {actionLabel(a.action)}
                        {a.details?.description && <span style={{ color: "var(--text-m)" }}> — "{a.details.description}"</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-d)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{formatTime(a.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
