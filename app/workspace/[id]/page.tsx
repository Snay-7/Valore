"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter, useParams } from "next/navigation";

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
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:7px;padding:10px 20px;font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:background .2s}
.btn-primary:hover{background:var(--gold-l)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:8px 16px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.nav-item{width:100%;display:flex;align-items:center;padding:9px 12px;border-radius:7px;font-size:13px;color:var(--text-m);background:transparent;border:1px solid transparent;cursor:pointer;font-family:var(--font-body);transition:all .15s;text-align:left;margin-bottom:2px}
.nav-item:hover{color:var(--text);background:var(--bg3)}
.nav-item.active{color:var(--gold);background:rgba(201,168,76,.08);border-color:var(--gold-border);font-weight:600}
.sidebar{width:220px;background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}
.tab{padding:10px 18px;border:none;background:transparent;color:var(--text-m);font-family:var(--font-body);font-size:13px;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s}
.tab.active{color:var(--gold);border-bottom-color:var(--gold)}
.task-row{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;margin-bottom:8px;animation:fadeIn .2s ease both}
.task-row:hover{border-color:var(--border-m)}
.note-row{padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;margin-bottom:10px;animation:fadeIn .2s ease both}
.activity-row{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)}
.avatar{width:32px;height:32px;border-radius:50%;background:var(--gold-bg);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--gold);font-weight:600;flex-shrink:0}
.input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:10px 14px;color:var(--text);font-family:var(--font-body);font-size:13px;outline:none;transition:border-color .2s}
.input:focus{border-color:var(--gold-border)}
.select{background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:8px 12px;color:var(--text);font-family:var(--font-body);font-size:12px;outline:none;cursor:pointer}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg1);border-top:1px solid var(--border);z-index:100;padding:8px 0 env(safe-area-inset-bottom,16px)}
.bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 4px;background:none;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);font-size:9px;letter-spacing:.06em;text-transform:uppercase;transition:color .2s}
.bottom-nav-item.active{color:var(--gold)}
.bottom-nav-item svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.mobile-topbar{display:none;align-items:center;justify-content:space-between;padding:16px 20px;background:var(--bg1);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50}
.member-check{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;cursor:pointer;transition:background .15s}
.member-check:hover{background:var(--bg4)}
@media(max-width:768px){
  .sidebar{display:none}
  .bottom-nav{display:flex}
  .mobile-topbar{display:flex}
  .main-content{margin-left:0!important;padding:20px 16px 100px!important}
}
`;

const fmt = (n: number, prefix = "£") => {
  if (!n || !isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${prefix}${(n/1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${prefix}${(n/1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${prefix}${(n/1e3).toFixed(0)}k`;
  return `${prefix}${n.toFixed(0)}`;
};
const fmtPct = (n: number) => (!n || !isFinite(n) || isNaN(n) ? "—" : `${(n*100).toFixed(1)}%`);
const CURRENCY_SYMBOLS: Record<string,string> = { GBP:"£", USD:"$", EUR:"€", AED:"د.إ", SGD:"S$", AUD:"A$" };

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [firm, setFirm] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [memberRole, setMemberRole] = useState<string>("member");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview"|"tasks"|"notes"|"activity">("overview");
  const [firmMembers, setFirmMembers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("not_started");
  const [addingTask, setAddingTask] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  // visibility: empty array = everyone, otherwise specific user_ids
  const [noteVisibility, setNoteVisibility] = useState<string[]>([]); // empty = everyone
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      const u = session.user;
      setUser(u);

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

      const { data: proj } = await supabase
        .from("projects")
        .select("*, appraisals(id, gdv, profit, profit_on_cost, irr_unlevered, status)")
        .eq("id", projectId)
        .maybeSingle();

      if (!proj) { router.push("/workspace"); return; }
      setProject(proj);

      const { data: members } = await supabase
        .from("firm_members")
        .select("*")
        .eq("firm_id", memberRow.firm_id);
      setFirmMembers(members || []);

      let taskData;
      if (admin) {
        const { data } = await supabase.from("tasks").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
        taskData = data;
      } else {
        const { data } = await supabase.from("tasks").select("*").eq("project_id", projectId).or(`assigned_to.eq.${u.id},created_by.eq.${u.id}`).order("created_at", { ascending: false });
        taskData = data;
      }
      setTasks(taskData || []);

      // Load notes visible to this user
      const { data: allNotes } = await supabase
        .from("notes")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      // Filter: show if visible_to is empty/null (everyone) OR user's id is in visible_to
      const visibleNotes = (allNotes || []).filter(n =>
        !n.visible_to || n.visible_to.length === 0 || n.visible_to.includes(u.id) || n.user_id === u.id
      );
      setNotes(visibleNotes);

      const { data: actData } = await supabase
        .from("activity_log")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      setActivity(actData || []);

      setLoading(false);
    };
    init();
  }, [router, projectId]);

  const logActivity = async (action: string, details: any = {}) => {
    if (!user || !firm) return;
    await supabase.from("activity_log").insert({
      project_id: projectId, firm_id: firm.id, user_id: user.id, user_email: user.email, action, details,
    });
    const { data } = await supabase.from("activity_log").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
    setActivity(data || []);
  };

  const refreshData = async () => {
    if (!user || !projectId) return;
    let t;
    if (isAdmin) {
      const { data } = await supabase.from("tasks").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
      t = data;
    } else {
      const { data } = await supabase.from("tasks").select("*").eq("project_id", projectId).or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`).order("created_at", { ascending: false });
      t = data;
    }
    setTasks(t || []);

    const { data: allNotes } = await supabase.from("notes").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
    const visibleNotes = (allNotes || []).filter(n =>
      !n.visible_to || n.visible_to.length === 0 || n.visible_to.includes(user.id) || n.user_id === user.id
    );
    setNotes(visibleNotes);

    const { data: a } = await supabase.from("activity_log").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
    setActivity(a || []);
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    if (status === "done") {
      const task = tasks.find(t => t.id === taskId);
      const move = window.confirm(`Move "${task?.title}" to completed?`);
      await supabase.from("tasks").update({ status: "done", completed: move }).eq("id", taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "done", completed: move } : t));
      await logActivity("task_completed", { title: task?.title });
    } else {
      await supabase.from("tasks").update({ status, completed: false }).eq("id", taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, completed: false } : t));
    }
  };

  const deleteTask = async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await logActivity("task_deleted", {});
  };

  const addTask = async () => {
    if (!newTask.trim() || !user) return;
    setAddingTask(true);
    const assignee = firmMembers.find(m => m.user_id === newTaskAssignee);
    await supabase.from("tasks").insert({
      project_id: projectId, firm_id: firm?.id, title: newTask.trim(),
      assigned_to: newTaskAssignee || null, assigned_to_email: assignee?.email || null,
      priority: newTaskPriority, due_date: newTaskDue || null, due_time: newTaskTime || null,
      status: newTaskStatus, completed: false,
      created_by: user.id, created_by_email: user.email,
    });
    const { data } = await supabase.from("tasks").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
    setTasks(data || []);
    await logActivity("task_created", { title: newTask.trim() });
    setNewTask(""); setNewTaskAssignee(""); setNewTaskPriority("medium"); setNewTaskDue(""); setNewTaskTime(""); setNewTaskStatus("not_started");
    setAddingTask(false);
  };

  const toggleTask = async (task: any) => {
    await supabase.from("tasks").update({ completed: !task.completed }).eq("id", task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
    await logActivity(task.completed ? "task_reopened" : "task_completed", { title: task.title });
  };

  const toggleMemberVisibility = (userId: string) => {
    setNoteVisibility(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const visibilityLabel = () => {
    if (noteVisibility.length === 0) return "Everyone can see this";
    const names = noteVisibility.map(id => {
      const m = firmMembers.find(m => m.user_id === id);
      return m?.email?.split("@")[0] || "member";
    });
    return `Visible to: you + ${names.join(", ")}`;
  };

  const addNote = async () => {
    if (!newNote.trim() || !user) return;
    setAddingNote(true);
    const now = new Date().toISOString();
    // visible_to: empty = everyone, otherwise specific user_ids (always include creator)
    const visibleTo = noteVisibility.length > 0 ? [...noteVisibility, user.id] : [];
    const { data: inserted } = await supabase.from("notes").insert({
      project_id: projectId,
      user_id: user.id,
      body: newNote.trim(),
      source: "workspace",
      visible_to: visibleTo,
      created_at: now,
      updated_at: now,
    }).select().single();

    if (inserted) setNotes(prev => [inserted, ...prev]);
    await logActivity("note_added", { preview: newNote.trim().slice(0, 60) });
    setNewNote("");
    setNoteVisibility([]);
    setVisibilityOpen(false);
    setAddingNote(false);
  };

  const deleteNote = async (noteId: string, creatorId: string) => {
    if (creatorId !== user?.id && !isAdmin) return;
    await supabase.from("notes").delete().eq("id", noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const otherMembers = firmMembers.filter(m => m.user_id !== user?.id);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#06070a", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:32, height:32, border:"2px solid rgba(201,168,76,.2)", borderTopColor:"#c9a84c", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const latest = project?.appraisals?.[0];
  const sym = CURRENCY_SYMBOLS[project?.currency] || "£";
  const canEdit = isAdmin || memberRole === "editor";

  const Sidebar = () => (
    <div className="sidebar">
      <div style={{ padding:"24px 24px 20px", borderBottom:"1px solid var(--border)" }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:22, color:"var(--gold)", letterSpacing:".1em", fontWeight:300 }}>VALORA</div>
        <div style={{ fontSize:9, color:"var(--text-d)", letterSpacing:".14em", textTransform:"uppercase", marginTop:2 }}>Development Appraisal</div>
      </div>
      <div style={{ padding:"16px 12px", flex:1 }}>
        <div style={{ fontSize:9, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".12em", padding:"0 12px", marginBottom:8 }}>Workspace</div>
        <button className="nav-item" onClick={() => router.push("/workspace")}>← All Projects</button>
        <button className="nav-item active">{project?.name || "Project"}</button>
        {isAdmin && <button className="nav-item" onClick={() => router.push("/team")}>Team</button>}
        <div style={{ height:1, background:"var(--border)", margin:"12px 0" }} />
        <div style={{ fontSize:9, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".12em", padding:"0 12px", marginBottom:8 }}>My Account</div>
        <button className="nav-item" onClick={() => router.push("/dashboard")}>My Portfolio</button>
        <button className="nav-item" onClick={() => router.push("/tasks")}>My Tasks</button>
      </div>
      <div style={{ padding:"16px 16px 20px", borderTop:"1px solid var(--border)" }}>
        <div style={{ fontSize:11, color:"var(--text-d)", marginBottom:6 }}>{user?.email}</div>
        <div style={{ fontSize:10, color:"var(--gold)", marginBottom:8 }}>{firm?.name}</div>
        <button className="nav-item" style={{ fontSize:12 }} onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}>Sign Out</button>
      </div>
    </div>
  );

  const BottomNav = () => (
    <nav className="bottom-nav">
      <button className="bottom-nav-item" onClick={() => router.push("/workspace")}>
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Projects
      </button>
      <button className="bottom-nav-item" onClick={() => router.push("/tasks")}>
        <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        Tasks
      </button>
      <button className="bottom-nav-item" onClick={() => router.push("/dashboard")}>
        <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
        Portfolio
      </button>
    </nav>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", fontFamily:"var(--font-body)", display:"flex" }}>
      <style>{CSS}</style>
      <Sidebar />
      <div className="main-content" style={{ marginLeft:220, flex:1, minWidth:0, padding:"48px 40px" }}>
        <div className="mobile-topbar">
          <div style={{ fontFamily:"var(--font-display)", fontSize:20, color:"var(--gold)", letterSpacing:".1em", fontWeight:300 }}>VALORA</div>
          <button onClick={() => router.push("/workspace")} style={{ background:"none", border:"none", color:"var(--text-m)", cursor:"pointer", fontSize:13 }}>← Back</button>
        </div>

        <div style={{ marginBottom:32 }}>
          <button onClick={() => router.push("/workspace")} style={{ background:"none", border:"none", color:"var(--text-m)", cursor:"pointer", fontSize:12, marginBottom:16, padding:0 }}>← Back to Workspace</button>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ fontSize:11, color:"var(--gold)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:8 }}>{project?.asset_type}</div>
              <h1 style={{ fontFamily:"var(--font-display)", fontSize:40, fontWeight:300, marginBottom:4 }}>{project?.name}</h1>
              <p style={{ fontSize:14, color:"var(--text-m)" }}>{project?.location} · <span style={{ color:"var(--gold)" }}>{memberRole}</span></p>
            </div>
            {canEdit && latest && (
              <button className="btn-primary" onClick={() => router.push(`/appraisal?project=${projectId}&appraisal=${latest.id}`)}>Open Appraisal →</button>
            )}
          </div>
        </div>

        <div style={{ display:"flex", borderBottom:"1px solid var(--border)", marginBottom:32 }}>
          {(["overview","tasks","notes","activity"] as const).map(t => (
            <button key={t} className={`tab${tab===t?" active":""}`} onClick={() => { setTab(t); refreshData(); }}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              {t === "notes" && notes.length > 0 && <span style={{ marginLeft:6, fontSize:10, color:"var(--text-d)", fontFamily:"var(--font-mono)" }}>({notes.length})</span>}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div style={{ animation:"fadeIn .3s ease" }}>
            {latest ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12, marginBottom:32 }}>
                {[
                  { label:"GDV", value:fmt(latest.gdv, sym), color:"var(--gold)" },
                  { label:"Profit", value:fmt(latest.profit, sym), color:latest.profit>0?"var(--green)":"var(--red)" },
                  { label:"PoC", value:fmtPct(latest.profit_on_cost), color:latest.profit_on_cost>0.2?"var(--green)":latest.profit_on_cost>0.1?"var(--amber)":"var(--red)" },
                  { label:"IRR", value:fmtPct(latest.irr_unlevered), color:"var(--blue)" },
                ].map(m => (
                  <div key={m.label} style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10, padding:"16px 20px" }}>
                    <div style={{ fontSize:9, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:8 }}>{m.label}</div>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:20, fontWeight:500, color:m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10, padding:24, marginBottom:32, color:"var(--text-d)", fontSize:14 }}>No appraisal data yet.</div>
            )}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10, padding:20 }}>
                <div style={{ fontSize:11, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:12 }}>Project Info</div>
                {[
                  { label:"Stage", value:project?.stage||"—" },
                  { label:"Currency", value:project?.currency||"GBP" },
                  { label:"Created", value:project?.created_at?new Date(project.created_at).toLocaleDateString("en-GB"):"—" },
                  { label:"Status", value:latest?.status||"draft" },
                ].map(r => (
                  <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--border)", fontSize:13 }}>
                    <span style={{ color:"var(--text-d)" }}>{r.label}</span>
                    <span style={{ color:"var(--text)" }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10, padding:20 }}>
                <div style={{ fontSize:11, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:12 }}>Activity Summary</div>
                {[
                  { label:"Tasks", value:tasks.length, color:"var(--gold)" },
                  { label:"Completed", value:tasks.filter(t=>t.completed).length, color:"var(--green)" },
                  { label:"Notes", value:notes.length, color:"var(--gold)" },
                  { label:"Activity Log", value:activity.length, color:"var(--gold)" },
                ].map(r => (
                  <div key={r.label} style={{ padding:"8px 0", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", fontSize:13 }}>
                    <span style={{ color:"var(--text-m)" }}>{r.label}</span><span style={{ color:r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TASKS */}
        {tab === "tasks" && (
          <div style={{ animation:"fadeIn .3s ease" }}>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
              <button className="btn-ghost" onClick={refreshData} style={{ fontSize:11 }}>↻ Refresh</button>
            </div>
            {canEdit && (
              <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10, padding:20, marginBottom:24 }}>
                <div style={{ fontSize:13, color:"var(--text-m)", marginBottom:12, fontWeight:500 }}>Add Task</div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <input className="input" style={{ flex:2, minWidth:200 }} placeholder="Task title…" value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} />
                  <select className="select" value={newTaskAssignee} onChange={e=>setNewTaskAssignee(e.target.value)}>
                    <option value="">Assign to…</option>
                    {firmMembers.map(m=><option key={m.user_id} value={m.user_id}>{m.email||m.role}</option>)}
                  </select>
                  <select className="select" value={newTaskPriority} onChange={e=>setNewTaskPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <input className="input" style={{ width:140 }} type="date" value={newTaskDue} onChange={e=>setNewTaskDue(e.target.value)} />
                  <input className="input" style={{ width:120 }} type="time" value={newTaskTime} onChange={e=>setNewTaskTime(e.target.value)} />
                  <select className="select" value={newTaskStatus} onChange={e=>setNewTaskStatus(e.target.value)}>
                    <option value="not_started">Not Started</option>
                    <option value="pending">Pending</option>
                    <option value="stuck">Stuck</option>
                  </select>
                  <button className="btn-primary" onClick={addTask} disabled={addingTask||!newTask.trim()}>{addingTask?"Adding…":"Add Task"}</button>
                </div>
              </div>
            )}
            {tasks.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-d)", fontSize:14 }}>No tasks yet.</div>
            ) : (
            <>
              {tasks.filter(t => !t.completed).map(t => (
                <div key={t.id} className="task-row" style={{ borderLeft:`3px solid ${
                  t.due_date && new Date(t.due_date) < new Date() ? "var(--red)" :
                  t.status==="working_on_it" ? "var(--blue)" :
                  t.status==="stuck" ? "var(--red)" :
                  t.status==="pending" ? "var(--amber)" : "var(--border)"
                }`, paddingLeft:14 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:"var(--text)", fontWeight:500, marginBottom:4 }}>{t.title}</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                      <span style={{ fontSize:11, color:"var(--text-d)" }}>👤 {t.created_by_email || "Unknown"}</span>
                      {t.assigned_to_email&&<span style={{ fontSize:11, color:"var(--text-m)" }}>→ {t.assigned_to_email}</span>}
                      {t.due_date&&<span style={{ fontSize:11, color: new Date(t.due_date) < new Date() ? "var(--red)" : "var(--text-d)", fontFamily:"var(--font-mono)" }}>📅 {new Date(t.due_date).toLocaleDateString("en-GB")}{t.due_time ? ` ${t.due_time}` : ""}</span>}
                      <span style={{ fontSize:10, color:t.priority==="high"||t.priority==="urgent"?"var(--red)":t.priority==="medium"?"var(--amber)":"var(--text-d)", textTransform:"uppercase", letterSpacing:".06em", background:"var(--bg3)", padding:"1px 7px", borderRadius:8 }}>{t.priority}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
                    {canEdit ? (
                      <select value={t.status || "not_started"} onChange={e => updateTaskStatus(t.id, e.target.value)}
                        style={{ background: t.status==="working_on_it" ? "rgba(91,156,246,.15)" : t.status==="stuck" ? "rgba(244,100,95,.15)" : t.status==="pending" ? "rgba(240,164,41,.15)" : "var(--bg3)", border: `1px solid ${t.status==="working_on_it" ? "var(--blue)" : t.status==="stuck" ? "var(--red)" : t.status==="pending" ? "var(--amber)" : "var(--border)"}`, borderRadius:8, padding:"5px 10px", color: t.status==="working_on_it" ? "var(--blue)" : t.status==="stuck" ? "var(--red)" : t.status==="pending" ? "var(--amber)" : "var(--text-m)", fontFamily:"var(--font-body)", fontSize:12, cursor:"pointer", fontWeight:500 }}>
                        <option value="not_started">Not Started</option>
                        <option value="working_on_it">Working on it</option>
                        <option value="pending">Pending</option>
                        <option value="stuck">Stuck</option>
                        <option value="done">Done</option>
                      </select>
                    ) : (
                      <span style={{ fontSize:11, color:"var(--text-d)" }}>{t.status||"not started"}</span>
                    )}
                    {canEdit && t.status === "done" && !t.completed && (
                      <button onClick={async () => { await supabase.from("tasks").update({ completed: true }).eq("id", t.id); setTasks(prev => prev.map(x => x.id === t.id ? { ...x, completed: true } : x)); }}
                        style={{ background:"rgba(61,220,132,.1)", border:"1px solid rgba(61,220,132,.3)", borderRadius:5, color:"var(--green)", cursor:"pointer", fontSize:11, padding:"4px 8px" }}>↓ Move to Completed</button>
                    )}
                    {canEdit && <button onClick={()=>deleteTask(t.id)} style={{ background:"none", border:"1px solid rgba(244,100,95,.3)", borderRadius:5, color:"var(--red)", cursor:"pointer", fontSize:11, padding:"4px 8px" }}>Delete</button>}
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.completed).length > 0 && (
                <div style={{ marginTop:32 }}>
                  <div style={{ fontSize:11, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:12, padding:"0 4px" }}>
                    ✓ Completed ({tasks.filter(t => t.completed).length})
                  </div>
                  {tasks.filter(t => t.completed).map(t => (
                    <div key={t.id} className="task-row" style={{ opacity:0.4 }}>
                      <input type="checkbox" checked={true} onChange={()=>toggleTask(t)} style={{ accentColor:"#c9a84c", width:16, height:16, flexShrink:0, cursor:"pointer" }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, textDecoration:"line-through", color:"var(--text-d)" }}>{t.title}</div>
                      </div>
                      <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:"rgba(61,220,132,.1)", color:"var(--green)", fontWeight:500 }}>Completed</span>
                      {canEdit && <button onClick={()=>deleteTask(t.id)} style={{ background:"none", border:"none", color:"var(--red)", cursor:"pointer", fontSize:14, padding:"0 4px" }}>×</button>}
                    </div>
                  ))}
                </div>
              )}
            </>
            )}
          </div>
        )}

        {/* NOTES */}
        {tab === "notes" && (
          <div style={{ animation:"fadeIn .3s ease" }}>
            {canEdit && (
              <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10, padding:20, marginBottom:24 }}>
                <textarea className="input" rows={3} placeholder="Add a note or comment…" value={newNote} onChange={e=>setNewNote(e.target.value)} style={{ resize:"vertical", marginBottom:14 }} />

                {/* Visibility selector */}
                <div style={{ marginBottom:14 }}>
                  <button
                    onClick={() => setVisibilityOpen(o => !o)}
                    style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:7, padding:"7px 12px", color:"var(--text-m)", fontSize:12, cursor:"pointer", fontFamily:"var(--font-body)", display:"flex", alignItems:"center", gap:8, transition:"border-color .2s" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    {visibilityLabel()}
                    <span style={{ marginLeft:"auto", fontSize:10 }}>{visibilityOpen ? "▲" : "▼"}</span>
                  </button>

                  {visibilityOpen && (
                    <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 4px", marginTop:6 }}>
                      <div style={{ fontSize:10, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".08em", padding:"4px 10px 8px" }}>
                        Who can see this note? (all ticked = everyone)
                      </div>

                      {/* Everyone option */}
                      <label className="member-check">
                        <input
                          type="checkbox"
                          checked={noteVisibility.length === 0}
                          onChange={() => setNoteVisibility([])}
                          style={{ accentColor:"var(--gold)", width:14, height:14 }}
                        />
                        <div style={{ width:26, height:26, borderRadius:"50%", background:"var(--gold-bg)", border:"1px solid var(--gold-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"var(--gold)", fontWeight:600 }}>✦</div>
                        <span style={{ fontSize:12, color:"var(--text)" }}>Everyone on this project</span>
                      </label>

                      {/* Individual members */}
                      {otherMembers.map(m => (
                        <label key={m.id} className="member-check">
                          <input
                            type="checkbox"
                            checked={noteVisibility.length === 0 || noteVisibility.includes(m.user_id)}
                            onChange={() => {
                              if (noteVisibility.length === 0) {
                                // switching from "everyone" to specific — pre-select all others except this one
                                setNoteVisibility(otherMembers.filter(x => x.user_id !== m.user_id).map(x => x.user_id));
                              } else {
                                toggleMemberVisibility(m.user_id);
                              }
                            }}
                            style={{ accentColor:"var(--gold)", width:14, height:14 }}
                          />
                          <div style={{ width:26, height:26, borderRadius:"50%", background:"var(--bg4)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"var(--text-m)", fontWeight:600 }}>
                            {(m.email || m.role || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontSize:12, color:"var(--text)" }}>{m.email || "Team member"}</span>
                            <span style={{ fontSize:10, color:"var(--text-d)", marginLeft:6 }}>{m.role}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <button className="btn-primary" onClick={addNote} disabled={addingNote||!newNote.trim()}>
                  {addingNote ? "Saving…" : "Add Note"}
                </button>
              </div>
            )}

            {notes.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-d)", fontSize:14 }}>No notes visible to you yet.</div>
            ) : notes.map(n => {
              const isRestricted = n.visible_to && n.visible_to.length > 0;
              const canDelete = n.user_id === user?.id || isAdmin;
              return (
                <div key={n.id} className="note-row" style={{ borderLeft: isRestricted ? "3px solid var(--amber)" : "3px solid var(--border)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div className="avatar">{(user?.email||"?")[0].toUpperCase()}</div>
                      <div>
                        <div style={{ fontSize:12, color:"var(--text-m)" }}>{user?.email}</div>
                        <div style={{ fontSize:11, color:"var(--text-d)" }}>{new Date(n.created_at).toLocaleString("en-GB")}</div>
                      </div>
                      {isRestricted && (
                        <span style={{ fontSize:9, color:"var(--amber)", background:"rgba(240,164,41,.1)", padding:"2px 7px", borderRadius:4, border:"1px solid rgba(240,164,41,.2)" }}>
                          🔒 Restricted
                        </span>
                      )}
                    </div>
                    {canDelete && (
                      <button onClick={() => deleteNote(n.id, n.user_id)} style={{ background:"none", border:"none", color:"var(--text-d)", cursor:"pointer", fontSize:16, padding:"0 4px" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-d)")}>×</button>
                    )}
                  </div>
                  <div style={{ fontSize:13, color:"var(--text)", lineHeight:1.6, whiteSpace:"pre-wrap" }}>{n.body}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* ACTIVITY */}
        {tab === "activity" && (
          <div style={{ animation:"fadeIn .3s ease" }}>
            {activity.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-d)", fontSize:14 }}>No activity yet.</div>
            ) : activity.map(a => (
              <div key={a.id} className="activity-row">
                <div className="avatar">{(a.user_email||"?")[0].toUpperCase()}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13 }}><span style={{ color:"var(--gold)" }}>{a.user_email}</span> {a.action.replace(/_/g," ")}{a.details?.title&&<span style={{ color:"var(--text-m)" }}> · {a.details.title}</span>}</div>
                  <div style={{ fontSize:11, color:"var(--text-d)", marginTop:2 }}>{new Date(a.created_at).toLocaleString("en-GB")}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
