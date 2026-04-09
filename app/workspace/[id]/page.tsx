"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold-l:#e2c97e;--gold-bg:rgba(201,168,76,0.06);--gold-border:rgba(201,168,76,0.18);
  --bg:#06070a;--bg1:#0b0d10;--bg2:#0f1116;--bg3:#14171e;--bg4:#1a1e27;
  --text:#eceae4;--text-m:#8a9099;--text-d:#3d4350;
  --border:rgba(255,255,255,0.055);--border-m:rgba(255,255,255,0.1);
  --green:#3ddc84;--red:#f4645f;--amber:#f0a429;--blue:#5b9cf6;--purple:#a78bfa;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
  --panel-w:440px;
}
html,body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased;height:100%}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}

/* Metric cards */
.metric{
  position:relative;background:var(--bg2);border:1px solid var(--border);
  border-radius:14px;padding:20px 22px;overflow:hidden;
  transition:border-color .25s,transform .2s;cursor:default;
}
.metric::before{
  content:'';position:absolute;inset:0;
  background:radial-gradient(circle at 80% 20%,rgba(201,168,76,.04) 0%,transparent 60%);
  pointer-events:none;
}
.metric:hover{border-color:rgba(201,168,76,.15);transform:translateY(-1px)}
.metric-label{font-size:9px;color:var(--text-d);text-transform:uppercase;letter-spacing:.12em;margin-bottom:10px;font-weight:500}
.metric-value{font-family:var(--font-mono);font-size:22px;font-weight:500;line-height:1}
.metric-sub{font-size:10px;color:var(--text-d);margin-top:6px;font-family:var(--font-mono)}

/* Action cards */
.action-card{
  background:var(--bg2);border:1px solid var(--border);border-radius:14px;
  padding:22px;cursor:pointer;transition:all .2s;text-align:left;width:100%;
  display:flex;flex-direction:column;gap:12px;position:relative;overflow:hidden;
}
.action-card::after{
  content:'';position:absolute;bottom:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(201,168,76,.2),transparent);
  opacity:0;transition:opacity .2s;
}
.action-card:hover{border-color:var(--gold-border);transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.5)}
.action-card:hover::after{opacity:1}
.action-card.active{border-color:var(--gold-border);background:rgba(201,168,76,.04)}

/* Side panel */
.side-panel{
  position:fixed;top:0;right:0;bottom:0;width:var(--panel-w);
  background:var(--bg1);border-left:1px solid var(--border-m);
  display:flex;flex-direction:column;z-index:100;
  box-shadow:-20px 0 60px rgba(0,0,0,.6);
}
.panel-enter{animation:slideIn .3s cubic-bezier(.16,1,.3,1) forwards}
.panel-exit{animation:slideOut .25s ease-in forwards}

/* Overlay */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:99;backdrop-filter:blur(2px)}

/* Form elements */
.field-label{font-size:10px;color:var(--text-d);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px;font-weight:500}
.field-input{
  width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;
  padding:10px 12px;color:var(--text);font-family:var(--font-body);font-size:13px;
  outline:none;transition:border-color .2s;
}
.field-input:focus{border-color:var(--gold-border)}
.field-input::placeholder{color:var(--text-d)}
select.field-input option{background:var(--bg3)}
textarea.field-input{resize:vertical;min-height:80px}

/* Task item */
.task-item{
  background:var(--bg3);border:1px solid var(--border);border-radius:10px;
  padding:14px 16px;transition:border-color .2s;
}
.task-item:hover{border-color:var(--border-m)}

/* Note item */
.note-item{
  background:var(--bg3);border:1px solid var(--border);border-radius:10px;
  padding:14px 16px;transition:border-color .2s;
}
.note-item:hover{border-color:var(--border-m)}

/* Priority badge */
.badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;letter-spacing:.04em}

/* Scrollbar */
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border-m);border-radius:2px}

/* Nav */
.nav-btn{
  background:none;border:1px solid var(--border);border-radius:6px;
  color:var(--text-m);cursor:pointer;padding:5px 14px;
  font-family:var(--font-body);font-size:11px;letter-spacing:.04em;
  transition:all .2s;white-space:nowrap;
}
.nav-btn:hover{border-color:var(--gold-border);color:var(--gold)}

/* Submit btn */
.submit-btn{
  background:var(--gold);color:#06070a;border:none;border-radius:8px;
  padding:10px 20px;font-family:var(--font-body);font-size:13px;font-weight:600;
  cursor:pointer;transition:opacity .2s;width:100%;
}
.submit-btn:hover{opacity:.9}
.submit-btn:disabled{opacity:.4;cursor:not-allowed}

.divider{height:1px;background:var(--border);margin:24px 0}

/* Visibility pill */
.vis-pill{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;font-size:10px;background:rgba(91,156,246,.1);color:var(--blue);border:1px solid rgba(91,156,246,.2)}
`;

const fmt = (n: number, prefix = "£") => {
  if (n === null || n === undefined || !isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${prefix}${(n / 1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${prefix}${(n / 1e3).toFixed(0)}k`;
  return `${prefix}${n.toFixed(0)}`;
};
const fmtPct = (n: number) => (!n || !isFinite(n) || isNaN(n) ? "—" : `${(n * 100).toFixed(1)}%`);
const CURR: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$" };

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; dot: string }> = {
  low:    { color: "#3ddc84", bg: "rgba(61,220,132,.1)",  dot: "#3ddc84" },
  medium: { color: "#f0a429", bg: "rgba(240,164,41,.1)",  dot: "#f0a429" },
  high:   { color: "#f4645f", bg: "rgba(244,100,95,.1)",  dot: "#f4645f" },
  urgent: { color: "#a78bfa", bg: "rgba(167,139,250,.1)", dot: "#a78bfa" },
};

type PanelMode = "tasks" | "notes" | null;

export default function WorkspaceProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading]   = useState(true);
  const [project, setProject]   = useState<any>(null);
  const [appraisal, setAppraisal] = useState<any>(null);
  const [appraisalCount, setAppraisalCount] = useState(0);
  const [firm, setFirm]         = useState<any>(null);
  const [memberRole, setMemberRole] = useState("member");
  const [firmMembers, setFirmMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  // Panel state
  const [panel, setPanel]       = useState<PanelMode>(null);
  const [panelClosing, setPanelClosing] = useState(false);

  // Tasks state
  const [tasks, setTasks]       = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDue, setTaskDue]   = useState("");
  const [taskUrgency, setTaskUrgency] = useState("normal");
  const [taskVisible, setTaskVisible] = useState("team");
  const [taskSaving, setTaskSaving] = useState(false);

  // Notes state
  const [notes, setNotes]       = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteVisible, setNoteVisible] = useState("team");
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    if (!projectId) { router.push("/workspace"); return; }
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setCurrentUser(session.user);

      const { data: memberRow } = await supabase
        .from("firm_members")
        .select("firm_id, role, firms(id, name)")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (memberRow?.firms) {
        setFirm(memberRow.firms);
        setMemberRole(memberRow.role || "member");
        // Load firm members for visibility
        const { data: members } = await supabase
          .from("firm_members")
          .select("user_id, email, role")
          .eq("firm_id", memberRow.firm_id);
        setFirmMembers(members || []);
      }

      const { data: proj, error } = await supabase
        .from("projects")
        .select("id, name, location, asset_type, currency, firm_id, created_by, stage")
        .eq("id", projectId)
        .maybeSingle();

      if (error || !proj) { setNotFound(true); setLoading(false); return; }
      setProject(proj);

      const { data: appraisals } = await supabase
        .from("appraisals")
        .select("id, gdv, total_cost, profit, profit_on_cost, irr_unlevered, status, created_at, snapshot")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (appraisals?.length) { setAppraisal(appraisals[0]); setAppraisalCount(appraisals.length); }
      setLoading(false);
    };
    init();
  }, [projectId, router]);

  const openPanel = (mode: PanelMode) => {
    if (panel === mode) { closePanel(); return; }
    setPanel(mode);
    setPanelClosing(false);
    if (mode === "tasks") loadTasks();
    if (mode === "notes") loadNotes();
  };

  const closePanel = () => {
    setPanelClosing(true);
    setTimeout(() => { setPanel(null); setPanelClosing(false); }, 240);
  };

  const loadTasks = async () => {
    setTasksLoading(true);
    const { data } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    setTasks(data || []);
    setTasksLoading(false);
  };

  const loadNotes = async () => {
    setNotesLoading(true);
    const { data } = await supabase
      .from("project_notes")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    setNotes(data || []);
    setNotesLoading(false);
  };

  const saveTask = async () => {
    if (!taskTitle.trim() || !currentUser) return;
    setTaskSaving(true);
    const { data, error } = await supabase.from("project_tasks").insert({
      project_id: projectId,
      firm_id: project?.firm_id,
      created_by: currentUser.id,
      title: taskTitle.trim(),
      priority: taskPriority,
      urgency: taskUrgency,
      due_date: taskDue || null,
      visible_to: taskVisible,
      status: "open",
    }).select().single();
    if (!error && data) {
      setTasks(prev => [data, ...prev]);
      setTaskTitle(""); setTaskDue(""); setTaskPriority("medium");
      setTaskUrgency("normal"); setTaskVisible("team");
      setShowTaskForm(false);
    }
    setTaskSaving(false);
  };

  const saveNote = async () => {
    if (!noteText.trim() || !currentUser) return;
    setNoteSaving(true);
    const { data, error } = await supabase.from("project_notes").insert({
      project_id: projectId,
      firm_id: project?.firm_id,
      created_by: currentUser.id,
      content: noteText.trim(),
      visible_to: noteVisible,
    }).select().single();
    if (!error && data) {
      setNotes(prev => [data, ...prev]);
      setNoteText(""); setNoteVisible("team");
    }
    setNoteSaving(false);
  };

  const toggleTaskDone = async (task: any) => {
    const newStatus = task.status === "done" ? "open" : "done";
    await supabase.from("project_tasks").update({ status: newStatus }).eq("id", task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
  };

  const deleteNote = async (id: string) => {
    await supabase.from("project_notes").delete().eq("id", id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const openAppraisal = () => {
    router.push(appraisal
      ? `/appraisal?project=${projectId}&appraisal=${appraisal.id}`
      : `/appraisal?project=${projectId}`
    );
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,.15)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <style>{CSS}</style>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 300, color: "var(--text-d)", letterSpacing: ".02em" }}>Project not found</div>
      <p style={{ fontSize: 13, color: "var(--text-d)" }}>You may not have access to this project.</p>
      <button onClick={() => router.push("/workspace")} className="submit-btn" style={{ width: "auto", padding: "10px 24px" }}>← Back to Workspace</button>
    </div>
  );

  const sym = CURR[project?.currency] || "£";
  const snap = appraisal?.snapshot || {};
  const pocVal = appraisal?.profit_on_cost;
  const pocColor = pocVal > 0.2 ? "var(--green)" : pocVal > 0.1 ? "var(--amber)" : pocVal > 0 ? "var(--red)" : "var(--text-d)";

  const metrics = [
    { label: "GDV", value: fmt(appraisal?.gdv, sym), color: "var(--gold)", sub: "Gross Development Value" },
    { label: "Total Cost", value: fmt(appraisal?.total_cost, sym), color: "var(--text)", sub: "All-in cost" },
    { label: "Profit", value: fmt(appraisal?.profit, sym), color: (appraisal?.profit || 0) > 0 ? "var(--green)" : "var(--red)", sub: appraisal ? "" : "—" },
    { label: "Profit on Cost", value: fmtPct(pocVal), color: pocColor, sub: "" },
    { label: "IRR Unlevered", value: fmtPct(appraisal?.irr_unlevered), color: "var(--blue)", sub: "" },
    { label: "Appraisals", value: String(appraisalCount || 0), color: "var(--text-m)", sub: "saved versions" },
  ];

  const panelOpen = panel !== null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}>
      <style>{CSS}</style>

      {/* Subtle background texture */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(201,168,76,.025) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(91,156,246,.02) 0%, transparent 40%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ background: "rgba(6,7,10,.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", padding: "0 28px", height: 54, display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 50 }}>
        <button className="nav-btn" onClick={() => router.push("/workspace")}>← Workspace</button>
        {firm && (
          <>
            <span style={{ color: "var(--border-m)", fontSize: 14 }}>/</span>
            <span style={{ fontSize: 11, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".1em" }}>{firm.name}</span>
          </>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", padding: "3px 10px", border: "1px solid var(--border)", borderRadius: 20 }}>{memberRole}</span>
      </nav>

      {/* Main content — shifts left when panel open */}
      <div style={{ transition: "padding-right .3s cubic-bezier(.16,1,.3,1)", paddingRight: panelOpen ? "var(--panel-w)" : 0, position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "44px 28px 60px" }}>

          {/* Header */}
          <div style={{ marginBottom: 36, animation: "fadeUp .4s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              {project?.asset_type && (
                <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 600, letterSpacing: ".06em", border: "1px solid var(--gold-border)" }}>
                  {project.asset_type}
                </span>
              )}
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,.04)", color: "var(--text-d)", border: "1px solid var(--border)" }}>
                {appraisal?.status || "draft"}
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 300, letterSpacing: ".01em", lineHeight: 1.05, marginBottom: 8 }}>
              {project?.name || "Untitled Project"}
            </h1>
            {project?.location && (
              <p style={{ fontSize: 13, color: "var(--text-m)", display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {project.location}
              </p>
            )}
          </div>

          {/* Thin gold rule */}
          <div style={{ height: "1px", background: "linear-gradient(90deg, var(--gold-border), transparent)", marginBottom: 32, animation: "fadeUp .4s .05s ease both", opacity: 0, animationFillMode: "forwards" }} />

          {/* Metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 36, animation: "fadeUp .4s .1s ease both", opacity: 0, animationFillMode: "forwards" }}>
            {metrics.map(m => (
              <div key={m.label} className="metric">
                <div className="metric-label">{m.label}</div>
                <div className="metric-value" style={{ color: m.color }}>{m.value}</div>
                {m.sub && <div className="metric-sub">{m.sub}</div>}
              </div>
            ))}
          </div>

          {/* Section label */}
          <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 16, fontWeight: 500, animation: "fadeUp .4s .15s ease both", opacity: 0, animationFillMode: "forwards" }}>
            Project Actions
          </div>

          {/* Action cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 40, animation: "fadeUp .4s .2s ease both", opacity: 0, animationFillMode: "forwards" }}>

            {/* Open Appraisal */}
            <button className="action-card" onClick={openAppraisal}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, rgba(201,168,76,.15), rgba(201,168,76,.05))", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gold)", marginBottom: 3, fontFamily: "var(--font-display)", letterSpacing: ".02em", fontSize: 16 }}>Open Appraisal</div>
                <div style={{ fontSize: 11, color: "var(--text-d)", lineHeight: 1.5 }}>View and edit the full development model</div>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-d)", fontFamily: "var(--font-mono)", marginTop: "auto" }}>
                {appraisalCount > 0 ? `${appraisalCount} version${appraisalCount > 1 ? "s" : ""}` : "No saves yet"}
              </div>
            </button>

            {/* Tasks */}
            <button className={`action-card${panel === "tasks" ? " active" : ""}`} onClick={() => openPanel("tasks")}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, rgba(91,156,246,.15), rgba(91,156,246,.05))", border: "1px solid rgba(91,156,246,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--blue)", marginBottom: 3, letterSpacing: ".02em" }}>Tasks</div>
                <div style={{ fontSize: 11, color: "var(--text-d)", lineHeight: 1.5 }}>Project actions with priority & due dates</div>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-d)", fontFamily: "var(--font-mono)", marginTop: "auto" }}>
                {tasks.filter(t => t.status !== "done").length > 0 ? `${tasks.filter(t => t.status !== "done").length} open` : "Click to view"}
              </div>
            </button>

            {/* Notes */}
            <button className={`action-card${panel === "notes" ? " active" : ""}`} onClick={() => openPanel("notes")}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, rgba(61,220,132,.1), rgba(61,220,132,.03))", border: "1px solid rgba(61,220,132,.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--green)", marginBottom: 3, letterSpacing: ".02em" }}>Notes</div>
                <div style={{ fontSize: 11, color: "var(--text-d)", lineHeight: 1.5 }}>Deal commentary visible to the team</div>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-d)", fontFamily: "var(--font-mono)", marginTop: "auto" }}>
                {notes.length > 0 ? `${notes.length} note${notes.length > 1 ? "s" : ""}` : "Click to view"}
              </div>
            </button>
          </div>

          {/* Deal snapshot */}
          {snap && Object.keys(snap).length > 0 && (
            <div style={{ animation: "fadeUp .4s .25s ease both", opacity: 0, animationFillMode: "forwards" }}>
              <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 14, fontWeight: 500 }}>Deal Snapshot</div>
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: 28 }}>
                {[
                  snap.assetType && { k: "Type", v: snap.assetType, c: "var(--gold)" },
                  snap.location  && { k: "Location", v: snap.location, c: "var(--text)" },
                  snap.currency  && { k: "Currency", v: snap.currency, c: "var(--text-m)" },
                  snap.programmMonths && { k: "Programme", v: `${snap.programmMonths}m`, c: "var(--text-m)" },
                  snap.exitYield && { k: "Exit Yield", v: `${snap.exitYield}%`, c: "var(--text-m)" },
                  snap.benchmarkRate && { k: "Benchmark", v: `${snap.benchmarkRate}%`, c: "var(--text-m)" },
                ].filter(Boolean).map((item: any) => (
                  <div key={item.k}>
                    <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>{item.k}</div>
                    <div style={{ fontSize: 13, color: item.c, fontFamily: "var(--font-mono)" }}>{item.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {appraisal?.created_at && (
            <div style={{ marginTop: 24, fontSize: 11, color: "var(--text-d)", fontFamily: "var(--font-mono)" }}>
              Last saved {new Date(appraisal.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {panelOpen && (
        <div className="overlay" onClick={closePanel} style={{ animation: panelClosing ? "none" : "fadeIn .2s ease", opacity: panelClosing ? 0 : 1, transition: "opacity .24s" }} />
      )}

      {/* Side Panel */}
      {panelOpen && (
        <div className={`side-panel ${panelClosing ? "panel-exit" : "panel-enter"}`}>

          {/* Panel header */}
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 2 }}>
                {project?.name}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, letterSpacing: ".02em", color: panel === "tasks" ? "var(--blue)" : "var(--green)" }}>
                {panel === "tasks" ? "Tasks" : "Notes"}
              </div>
            </div>
            <button onClick={closePanel} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-m)", cursor: "pointer", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-m)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
              ×
            </button>
          </div>

          {/* Panel body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

            {/* ── TASKS PANEL ── */}
            {panel === "tasks" && (
              <>
                {/* Add task button / form toggle */}
                {!showTaskForm ? (
                  <button onClick={() => setShowTaskForm(true)}
                    style={{ width: "100%", background: "rgba(91,156,246,.06)", border: "1px dashed rgba(91,156,246,.25)", borderRadius: 10, padding: "12px", color: "var(--blue)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)", marginBottom: 20, transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(91,156,246,.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(91,156,246,.06)"}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Task
                  </button>
                ) : (
                  <div style={{ background: "var(--bg3)", border: "1px solid var(--border-m)", borderRadius: 12, padding: "18px", marginBottom: 20 }}>
                    <div style={{ marginBottom: 12 }}>
                      <div className="field-label">Task Title</div>
                      <input className="field-input" placeholder="e.g. Chase planning approval" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} autoFocus />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                      <div>
                        <div className="field-label">Priority</div>
                        <select className="field-input" value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div>
                        <div className="field-label">Urgency</div>
                        <select className="field-input" value={taskUrgency} onChange={e => setTaskUrgency(e.target.value)}>
                          <option value="normal">Normal</option>
                          <option value="soon">Soon</option>
                          <option value="immediate">Immediate</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                      <div>
                        <div className="field-label">Due Date</div>
                        <input className="field-input" type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)} />
                      </div>
                      <div>
                        <div className="field-label">Visible To</div>
                        <select className="field-input" value={taskVisible} onChange={e => setTaskVisible(e.target.value)}>
                          <option value="team">Whole Team</option>
                          <option value="admin">Admins Only</option>
                          <option value="me">Just Me</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="submit-btn" onClick={saveTask} disabled={taskSaving || !taskTitle.trim()}>
                        {taskSaving ? "Saving…" : "Add Task"}
                      </button>
                      <button onClick={() => { setShowTaskForm(false); setTaskTitle(""); }}
                        style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", color: "var(--text-m)", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)", transition: "all .2s" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Task list */}
                {tasksLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                    <div style={{ width: 22, height: 22, border: "2px solid rgba(91,156,246,.2)", borderTopColor: "var(--blue)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                  </div>
                ) : tasks.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-d)", fontSize: 13 }}>No tasks yet</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {tasks.map(task => {
                      const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                      const done = task.status === "done";
                      return (
                        <div key={task.id} className="task-item" style={{ opacity: done ? 0.5 : 1 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                            <button onClick={() => toggleTaskDone(task)}
                              style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${done ? "var(--green)" : "var(--border-m)"}`, background: done ? "var(--green)" : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
                              {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#06070a" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                            </button>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, color: done ? "var(--text-d)" : "var(--text)", textDecoration: done ? "line-through" : "none", marginBottom: 6 }}>
                                {task.title}
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                <span className="badge" style={{ background: pc.bg, color: pc.color }}>
                                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: pc.dot }} />
                                  {task.priority}
                                </span>
                                {task.urgency && task.urgency !== "normal" && (
                                  <span className="badge" style={{ background: "rgba(240,164,41,.1)", color: "var(--amber)" }}>{task.urgency}</span>
                                )}
                                {task.due_date && (
                                  <span style={{ fontSize: 10, color: "var(--text-d)", fontFamily: "var(--font-mono)" }}>
                                    Due {new Date(task.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                  </span>
                                )}
                                {task.visible_to && (
                                  <span className="vis-pill">
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg>
                                    {task.visible_to === "team" ? "Team" : task.visible_to === "admin" ? "Admins" : "Me"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── NOTES PANEL ── */}
            {panel === "notes" && (
              <>
                {/* Add note */}
                <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px", marginBottom: 20 }}>
                  <div style={{ marginBottom: 10 }}>
                    <div className="field-label">New Note</div>
                    <textarea className="field-input" placeholder="Add a deal note, observation or comment…" value={noteText} onChange={e => setNoteText(e.target.value)} rows={3} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <select className="field-input" value={noteVisible} onChange={e => setNoteVisible(e.target.value)} style={{ padding: "8px 12px" }}>
                        <option value="team">Visible to: Whole Team</option>
                        <option value="admin">Visible to: Admins Only</option>
                        <option value="me">Visible to: Just Me</option>
                      </select>
                    </div>
                    <button className="submit-btn" onClick={saveNote} disabled={noteSaving || !noteText.trim()} style={{ width: "auto", padding: "9px 18px" }}>
                      {noteSaving ? "…" : "Post"}
                    </button>
                  </div>
                </div>

                {/* Notes list */}
                {notesLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                    <div style={{ width: 22, height: 22, border: "2px solid rgba(61,220,132,.2)", borderTopColor: "var(--green)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                  </div>
                ) : notes.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-d)", fontSize: 13 }}>No notes yet</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {notes.map(note => (
                      <div key={note.id} className="note-item">
                        <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, marginBottom: 10, whiteSpace: "pre-wrap" }}>
                          {note.content}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, color: "var(--text-d)", fontFamily: "var(--font-mono)" }}>
                            {new Date(note.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          {note.visible_to && (
                            <span className="vis-pill">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                              {note.visible_to === "team" ? "Team" : note.visible_to === "admin" ? "Admins" : "Me"}
                            </span>
                          )}
                          <div style={{ flex: 1 }} />
                          {note.created_by === currentUser?.id && (
                            <button onClick={() => deleteNote(note.id)}
                              style={{ background: "none", border: "none", color: "var(--text-d)", cursor: "pointer", fontSize: 11, fontFamily: "var(--font-body)", transition: "color .2s" }}
                              onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
                              onMouseLeave={e => e.currentTarget.style.color = "var(--text-d)"}>
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
