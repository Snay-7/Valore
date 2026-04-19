"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
/* ═══════════════════════════════════════════════════════════════════════
   VALORA — TASKS v2
   Rebranded to the Valora design system (tokens + component primitives).
   Logic, Supabase calls, filters, modals and handlers preserved verbatim.
   Theme sync matches dashboard + pipeline: body.light + html[data-theme]
   + localStorage(valora-theme, val-theme) with cross-page/tab listeners.
   ═══════════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ─── VALORA TOKENS — DARK (default) ─── */
:root,
:root[data-theme="dark"]{
  --val-bg-app:#0F1115;--val-bg-panel:#1A1E26;--val-bg-panel-2:#242933;--val-bg-panel-3:#2D3340;
  --val-bg-overlay:rgba(15,17,21,0.72);
  --val-text:#F6F4EF;--val-text-mid:#C8CCD4;--val-text-dim:#949CA0;--val-text-faint:#6B7280;
  --val-gold:#C9A84C;
  --val-green:#52C498;--val-green-tint:rgba(82,196,152,0.12);--val-green-deep:#2E7D58;
  --val-amber:#F0A429;--val-amber-tint:rgba(240,164,41,0.12);
  --val-red:#F4645F;--val-red-tint:rgba(244,100,95,0.12);
  --val-blue:#5CA5DC;--val-blue-tint:rgba(92,165,220,0.12);
  --val-border:#383E4A;--val-border-lt:#4A505C;--val-border-accent:rgba(82,196,152,0.35);
  --val-font-body:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  --val-font-mono:'JetBrains Mono','SF Mono','Consolas',monospace;
  --val-r-xs:4px;--val-r-sm:6px;--val-r-md:8px;--val-r-lg:10px;--val-r-xl:12px;--val-r-pill:999px;
  --val-ease:cubic-bezier(0.16,1,0.3,1);
  --val-dur:180ms;
  /* ─── LEGACY ALIASES — keep old inline styles working ─── */
  --gold:var(--val-green);--gold-l:#5DD3A4;--gold-bg:var(--val-green-tint);--gold-border:var(--val-border-accent);
  --bg:var(--val-bg-app);--bg1:var(--val-bg-panel);--bg2:var(--val-bg-panel);
  --bg3:var(--val-bg-panel-2);--bg4:var(--val-bg-panel-3);--bg5:#383E4A;
  --text:var(--val-text);--text-m:var(--val-text-mid);--text-d:var(--val-text-dim);
  --border:var(--val-border);--border-m:var(--val-border-lt);
  --green:var(--val-green);--red:var(--val-red);--amber:var(--val-amber);--blue:var(--val-blue);--purple:#a78bfa;
  --font-display:var(--val-font-body);--font-body:var(--val-font-body);--font-mono:var(--val-font-mono);
}

/* ─── LIGHT THEME — dual selector for cross-page parity ─── */
body.light,
:root[data-theme="light"]{
  --val-bg-app:#F8F5EE;--val-bg-panel:#FFFFFF;--val-bg-panel-2:#F2EEE4;--val-bg-panel-3:#EAE5D8;
  --val-bg-overlay:rgba(15,17,21,0.5);
  --val-text:#0F1115;--val-text-mid:#3D4351;--val-text-dim:#6B7280;--val-text-faint:#A0A5AE;
  --val-gold:#A8843A;
  --val-green:#2E9E72;--val-green-tint:rgba(46,158,114,0.10);--val-green-deep:#1F7050;
  --val-amber:#C57E14;--val-amber-tint:rgba(197,126,20,0.10);
  --val-red:#C24844;--val-red-tint:rgba(194,72,68,0.10);
  --val-blue:#2D7AB5;--val-blue-tint:rgba(45,122,181,0.10);
  --val-border:rgba(15,17,21,0.10);--val-border-lt:rgba(15,17,21,0.18);--val-border-accent:rgba(46,158,114,0.35);
  --gold-l:#1F7050;
  --purple:#7C3AED;
}

body{background:var(--val-bg-app);color:var(--val-text);font-family:var(--val-font-body);font-size:14px;line-height:1.45;font-weight:400;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
::selection{background:var(--val-green-tint);color:var(--val-text)}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--val-border-lt);border-radius:var(--val-r-pill);border:2px solid var(--val-bg-app)}
::-webkit-scrollbar-thumb:hover{background:var(--val-text-dim)}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* ═══ SIDEBAR (matches val-sidebar from mockup) ═══ */
.sidebar{
  width:232px;background:var(--val-bg-panel);
  border-right:1px solid var(--val-border);
  display:flex;flex-direction:column;
  position:fixed;top:0;left:0;bottom:0;z-index:100;
}

/* ═══ NAV ITEMS (matches val-nav-item) ═══ */
.nav-item{
  width:100%;display:flex;align-items:center;
  padding:8px 12px;border-radius:var(--val-r-md);
  font-size:14px;font-weight:500;
  color:var(--val-text-mid);
  background:transparent;border:1px solid transparent;cursor:pointer;
  font-family:var(--val-font-body);transition:all var(--val-dur) var(--val-ease);
  text-align:left;margin-bottom:2px;
}
.nav-item:hover{color:var(--val-text);background:rgba(255,255,255,0.04)}
body.light .nav-item:hover,
:root[data-theme="light"] .nav-item:hover{background:rgba(15,17,21,0.04)}
.nav-item.active{color:var(--val-green);background:var(--val-green-tint);font-weight:600}
.nav-item.active:hover{background:var(--val-green-tint);color:var(--val-green)}

/* ═══ BUTTONS (matches val-btn) ═══ */
.btn-primary{
  background:var(--val-green);color:var(--val-bg-app);
  border:none;border-radius:var(--val-r-sm);
  height:34px;padding:0 16px;
  font-family:var(--val-font-body);font-size:13px;font-weight:600;letter-spacing:-0.015em;
  cursor:pointer;transition:background var(--val-dur) var(--val-ease),transform .1s var(--val-ease);
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
}
.btn-primary:hover{background:#5DD3A4}
body.light .btn-primary:hover,
:root[data-theme="light"] .btn-primary:hover{background:var(--val-green-deep)}
.btn-primary:active{transform:translateY(1px)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}

.btn-ghost{
  background:transparent;color:var(--val-text-mid);
  border:1px solid var(--val-border-lt);border-radius:var(--val-r-sm);
  height:32px;padding:0 14px;
  font-family:var(--val-font-body);font-size:12px;font-weight:600;letter-spacing:-0.015em;
  cursor:pointer;transition:all var(--val-dur) var(--val-ease);
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
}
.btn-ghost:hover{border-color:var(--val-text-dim);color:var(--val-text)}

/* ═══ TASK ROWS (matches empty-state + member-row hybrid) ═══ */
.task-row{
  display:flex;align-items:flex-start;gap:12px;
  padding:14px 16px;
  border-bottom:1px solid rgba(255,255,255,0.04);
  transition:background var(--val-dur) var(--val-ease);
  position:relative;
}
body.light .task-row,
:root[data-theme="light"] .task-row{border-bottom-color:rgba(15,17,21,0.05)}
.task-row:last-child{border-bottom:none}
.task-row:hover{background:var(--val-bg-panel-2)}
.task-row:hover .task-actions{opacity:1}
.task-row.completed{opacity:.55}
.task-actions{opacity:0;transition:opacity var(--val-dur) var(--val-ease);display:flex;gap:4px;flex-shrink:0}

.checkbox{
  width:18px;height:18px;border-radius:var(--val-r-xs);
  border:1.5px solid var(--val-border-lt);background:transparent;cursor:pointer;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;
  transition:all var(--val-dur) var(--val-ease);
}
.checkbox:hover{border-color:var(--val-green)}
.checkbox.checked{background:var(--val-green);border-color:var(--val-green)}
.priority-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}

/* ═══ TAG PILLS (matches val-chip) ═══ */
.tag{
  font-size:10px;padding:2px 8px;border-radius:var(--val-r-xs);
  font-weight:600;letter-spacing:.04em;text-transform:uppercase;
  display:inline-flex;align-items:center;
}
.tag-urgent{background:var(--val-red-tint);color:var(--val-red)}
.tag-high{background:var(--val-amber-tint);color:var(--val-amber)}
.tag-medium{background:var(--val-blue-tint);color:var(--val-blue)}
.tag-low{background:rgba(148,152,160,0.15);color:var(--val-text-dim)}

/* ═══ FILTER CHIPS (matches val-filter-chip) ═══ */
.filter-btn{
  height:32px;padding:0 14px;border-radius:var(--val-r-md);
  font-size:12px;font-weight:500;
  background:transparent;border:1px solid var(--val-border);
  color:var(--val-text-dim);cursor:pointer;
  font-family:var(--val-font-body);transition:all var(--val-dur) var(--val-ease);
  white-space:nowrap;
  display:inline-flex;align-items:center;gap:6px;
}
.filter-btn:hover{border-color:var(--val-border-lt);color:var(--val-text-mid)}
.filter-btn.active{
  background:var(--val-green-tint);
  border-color:var(--val-green);
  color:var(--val-green);
  font-weight:600;
}

/* ═══ PROJECT GROUPS ═══ */
.project-group{margin-bottom:28px;animation:fadeIn .3s var(--val-ease) both}
.project-group-header{
  display:flex;align-items:center;gap:10px;
  padding:14px 18px;
  background:var(--val-bg-panel);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-lg) var(--val-r-lg) 0 0;border-bottom:none;
  flex-wrap:wrap;
}

/* ═══ INPUTS (matches val-input) ═══ */
.inp{
  width:100%;height:40px;padding:0 12px;
  background:var(--val-bg-panel-2);
  border:1px solid var(--val-border);border-radius:var(--val-r-md);
  color:var(--val-text);
  font-family:var(--val-font-body);font-size:13px;font-weight:500;
  outline:none;
  transition:border-color var(--val-dur) var(--val-ease),box-shadow var(--val-dur) var(--val-ease);
}
.inp:hover{border-color:var(--val-border-lt)}
.inp:focus{border-color:var(--val-green);box-shadow:0 0 0 3px var(--val-green-tint)}
.inp::placeholder{color:var(--val-text-faint);font-family:var(--val-font-body);font-weight:400}
textarea.inp{height:auto;padding:10px 12px;line-height:1.5;resize:vertical}
select.inp{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%23949CA0' stroke-width='1.5' fill='none' stroke-linecap='round'/></svg>");background-repeat:no-repeat;background-position:right 14px center;padding-right:32px}

/* ═══ MODAL (matches val-modal) ═══ */
.edit-modal{
  position:fixed;inset:0;
  background:var(--val-bg-overlay);backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;z-index:200;
  animation:fadeIn .15s var(--val-ease);
}
.edit-card{
  background:var(--val-bg-panel);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-xl);padding:28px;
  width:480px;max-width:calc(100vw - 40px);
  box-shadow:0 20px 60px rgba(0,0,0,0.45);
}
body.light .edit-card,
:root[data-theme="light"] .edit-card{box-shadow:0 20px 60px rgba(15,17,21,0.15)}

/* ═══ MOBILE BARS ═══ */
.mobile-topbar{
  display:none;align-items:center;justify-content:space-between;
  padding:14px 16px;
  background:var(--val-bg-panel);
  border-bottom:1px solid var(--val-border);
  position:sticky;top:0;z-index:50;
}
.bottom-nav{
  display:none;position:fixed;bottom:0;left:0;right:0;
  background:var(--val-bg-panel);
  border-top:1px solid var(--val-border);
  z-index:100;padding:8px 0 env(safe-area-inset-bottom,16px);
}
.bottom-nav-item{
  flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;
  padding:6px 4px;background:none;border:none;
  color:var(--val-text-dim);cursor:pointer;
  font-family:var(--val-font-body);
  font-size:9px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;
  transition:color var(--val-dur) var(--val-ease);
}
.bottom-nav-item.active{color:var(--val-green)}
.bottom-nav-item svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}

/* ═══ RESPONSIVE ═══ */
@media(max-width:768px){
  .sidebar{display:none}
  .bottom-nav{display:flex}
  .mobile-topbar{display:flex}
  .main-content{margin-left:0!important;max-width:100vw!important;padding:20px 16px 100px!important}
  .task-actions{opacity:1!important}
  .filters-row{flex-direction:column;align-items:stretch!important}
  .filters-row .inp{width:100%!important}
  .stats-grid{grid-template-columns:repeat(2,1fr)!important}
  .project-group-header{padding:10px 12px;gap:8px}
}
`;
const PRIORITY_CONFIG: Record<string, { label: string; dot: string; tag: string }> = {
  urgent: { label: "Urgent", dot: "var(--val-red)",   tag: "tag-urgent" },
  high:   { label: "High",   dot: "var(--val-amber)", tag: "tag-high" },
  medium: { label: "Medium", dot: "var(--val-blue)",  tag: "tag-medium" },
  low:    { label: "Low",    dot: "var(--val-text-dim)", tag: "tag-low" },
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
  // ── Unified theme sync (follows dashboard/pipeline toggles) ──
  useEffect(() => {
    const detectTheme = (): "dark" | "light" => {
      if (typeof document === "undefined") return "light";
      if (document.body && document.body.classList.contains("light")) return "light";
      const htmlTheme = document.documentElement.getAttribute("data-theme");
      if (htmlTheme === "light" || htmlTheme === "dark") return htmlTheme;
      try {
        for (const key of ["valora-theme", "val-theme", "theme"]) {
          const v = localStorage.getItem(key);
          if (v === "light" || v === "dark") return v;
        }
      } catch {}
      return "light";
    };
    const applyTheme = (t: "dark" | "light") => {
      document.documentElement.setAttribute("data-theme", t);
      document.body.classList.toggle("light", t === "light");
      try { localStorage.setItem("valora-theme", t); } catch {}
      try { localStorage.setItem("val-theme", t); } catch {}
    };
    const resync = () => applyTheme(detectTheme());
    resync();
    const onStorage = (e: StorageEvent) => { if (e.key && /theme/i.test(e.key)) resync(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", resync);
    document.addEventListener("visibilitychange", resync);
    const bodyObs = new MutationObserver(resync);
    bodyObs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    const htmlObs = new MutationObserver(resync);
    htmlObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", resync);
      document.removeEventListener("visibilitychange", resync);
      bodyObs.disconnect();
      htmlObs.disconnect();
    };
  }, []);
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
    <div style={{ minHeight: "100vh", background: "var(--val-bg-app, #0F1115)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid rgba(82,196,152,.2)", borderTopColor: "#52C498", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  return (
    <div style={{ minHeight: "100vh", background: "var(--val-bg-app)", color: "var(--val-text)", fontFamily: "var(--val-font-body)", display: "flex" }}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var keys=['valora-theme','val-theme','theme'];for(var i=0;i<keys.length;i++){var v=localStorage.getItem(keys[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='light';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');else if(document.body)document.body.classList.remove('light');try{localStorage.setItem('valora-theme',t);localStorage.setItem('val-theme',t);}catch(e){}}catch(e){}})()`}}/>
      {/* ── DESKTOP SIDEBAR ── */}
      <div className="sidebar">
        <div style={{ padding: "20px 20px 18px", borderBottom: "1px solid var(--val-border)" }}>
          <span style={{fontFamily:"var(--val-font-body)",fontSize:22,fontWeight:700,letterSpacing:"-.015em",color:"var(--val-text)",lineHeight:1}}>Valora</span>
          <div style={{ fontSize: 10, color: "var(--val-text-dim)", letterSpacing: ".14em", textTransform: "uppercase", marginTop: 4, fontWeight: 500 }}>Development Appraisal</div>
        </div>
        <div style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "var(--val-text-dim)", textTransform: "uppercase", letterSpacing: ".14em", padding: "0 12px", marginBottom: 8, fontWeight: 600 }}>Workspace</div>
          <button className="nav-item" onClick={() => router.push("/dashboard")}>Portfolio</button>
          <button className="nav-item" onClick={() => router.push("/pipeline")}>Pipeline</button>
          <button className="nav-item active">Tasks</button>
          <button className="nav-item" onClick={() => router.push("/team")}>Team</button>
          <div style={{ height: 1, background: "var(--val-border)", margin: "12px 0" }} />
          <div style={{ fontSize: 10, color: "var(--val-text-dim)", textTransform: "uppercase", letterSpacing: ".14em", padding: "0 12px", marginBottom: 8, fontWeight: 600 }}>Manage</div>
          <button className="nav-item" onClick={() => router.push("/dashboard")}>Trash</button>
        </div>
        <div style={{ padding: "16px 16px 20px", borderTop: "1px solid var(--val-border)" }}>
          <div style={{ fontSize: 11, color: "var(--val-text-dim)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{user?.email}</div>
          <button className="nav-item" style={{ fontSize: 12 }} onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}>Sign Out</button>
        </div>
      </div>
      {/* ── MAIN CONTENT ── */}
      <div className="main-content" style={{ marginLeft: 232, flex: 1, minWidth: 0, padding: "40px 40px" }}>
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <span style={{fontFamily:"var(--val-font-body)",fontSize:18,fontWeight:700,letterSpacing:"-.015em",color:"var(--val-text)"}}>Valora</span>
          <div style={{ fontSize: 12, color: "var(--val-text-dim)", fontWeight: 500 }}>{pendingCount} pending</div>
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: "var(--val-green)", textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 8, fontWeight: 600 }}>Tasks</div>
          <h1 style={{ fontFamily: "var(--val-font-body)", fontSize: 34, fontWeight: 700, marginBottom: 8, letterSpacing: "-.03em", lineHeight: 1, color: "var(--val-text)" }}>All Tasks</h1>
          <p style={{ fontSize: 14, color: "var(--val-text-dim)", fontWeight: 500 }}>
            {pendingCount} pending · {overdueCount > 0 && <span style={{ color: "var(--val-red)" }}>{overdueCount} overdue · </span>}{completedCount} completed
          </p>
        </div>
        {/* Stats — 4-up stat-card (mockup) */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Tasks", value: tasks.length, color: "var(--val-text)" },
            { label: "Pending",     value: pendingCount, color: "var(--val-amber)" },
            { label: "Overdue",     value: overdueCount, color: "var(--val-red)" },
            { label: "Completed",   value: completedCount, color: "var(--val-green)" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--val-bg-panel)", border: "1px solid var(--val-border)", borderRadius: 10, padding: "20px" }}>
              <div style={{ fontSize: 11, color: "var(--val-text-dim)", textTransform: "uppercase", letterSpacing: ".14em", fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--val-font-body)", fontSize: 48, fontWeight: 700, color: s.color, marginTop: 8, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
            </div>
          ))}
        </div>
        {/* Filters */}
        <div className="filters-row" style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["pending", "all", "overdue", "completed"] as const).map(f => (
              <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "overdue" && overdueCount > 0 && <span style={{ marginLeft: 2, background: "var(--val-red)", color: "#fff", borderRadius: 10, padding: "0 6px", fontSize: 9, fontWeight: 700 }}>{overdueCount}</span>}
              </button>
            ))}
          </div>
          <div style={{ width: 1, height: 20, background: "var(--val-border)" }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["all", "urgent", "high", "medium", "low"].map(p => (
              <button key={p} className={`filter-btn ${priorityFilter === p ? "active" : ""}`} onClick={() => setPriorityFilter(p)}>
                {p === "all" ? "All Priority" : PRIORITY_CONFIG[p]?.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 160 }} />
          <input className="inp" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" style={{ width: 280 }} />
        </div>
        {/* Groups */}
        {sortedGroups.length === 0 ? (
          <div style={{ padding: "64px 32px", textAlign: "center", background: "var(--val-bg-panel)", border: "1px dashed var(--val-border)", borderRadius: 10 }}>
            <div style={{ fontSize: 48, color: "var(--val-text-dim)", marginBottom: 12, lineHeight: 1 }}>✓</div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--val-text)", margin: 0 }}>
              {filter === "pending" ? "No pending tasks" : filter === "overdue" ? "No overdue tasks" : "No tasks found"}
            </h3>
            <div style={{ fontSize: 13, color: "var(--val-text-dim)", marginTop: 8, fontWeight: 500 }}>Tasks are created from the Pipeline view on each deal card.</div>
          </div>
        ) : (
          sortedGroups.map(([projectName, projectTasks], gi) => (
            <div key={projectName} className="project-group" style={{ animationDelay: `${gi * 0.05}s` }}>
              <div className="project-group-header">
                <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 4, background: "var(--val-green-tint)", color: "var(--val-green)", fontWeight: 600, letterSpacing: "-.015em" }}>
                  {projectTasks[0]?.projects?.asset_type || "—"}
                </span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--val-text)", letterSpacing: "-.015em" }}>{projectName}</span>
                {projectTasks[0]?.projects?.location && (
                  <span style={{ fontSize: 12, color: "var(--val-text-dim)", fontWeight: 500 }}>{projectTasks[0].projects.location}</span>
                )}
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--val-text-dim)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                  {projectTasks.filter((t: any) => !t.completed).length} pending · {projectTasks.length} total
                </span>
                <button className="btn-ghost" style={{ fontSize: 11, height: 28, padding: "0 10px" }} onClick={() => router.push("/pipeline")}>Pipeline →</button>
              </div>
              <div style={{ background: "var(--val-bg-panel)", border: "1px solid var(--val-border)", borderTop: "none", borderRadius: "0 0 10px 10px" }}>
                {projectTasks.map((task: any) => {
                  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                  const due = task.due_at ? formatDue(task.due_at) : null;
                  return (
                    <div key={task.id} className={`task-row ${task.completed ? "completed" : ""}`}>
                      <div className={`checkbox ${task.completed ? "checked" : ""}`} onClick={() => toggleComplete(task)}>
                        {task.completed && <span style={{ fontSize: 11, color: "var(--val-bg-app)", fontWeight: 700 }}>✓</span>}
                      </div>
                      <div className="priority-dot" style={{ background: p.dot }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: task.completed ? "var(--val-text-dim)" : "var(--val-text)", textDecoration: task.completed ? "line-through" : "none", marginBottom: 5, lineHeight: 1.45, fontWeight: 500 }}>
                          {task.description}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span className={`tag ${p.tag}`}>{p.label}</span>
                          {due && (
                            <span style={{ fontSize: 11, color: due.overdue ? "var(--val-red)" : "var(--val-text-dim)", fontFamily: "var(--val-font-mono)", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                              {due.overdue && "⚠ "}{due.text}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: "var(--val-text-dim)", fontWeight: 500 }}>
                            Added {new Date(task.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                      <div className="task-actions">
                        <button className="btn-ghost" onClick={() => openEdit(task)} style={{ height: 28, padding: "0 12px", fontSize: 11 }}>Edit</button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          style={{ padding: "0 12px", height: 28, background: "transparent", border: "1px solid rgba(244,100,95,.3)", borderRadius: "var(--val-r-sm)", color: "var(--val-red)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "var(--val-font-body)", transition: "all .15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "var(--val-red-tint)"; e.currentTarget.style.borderColor = "var(--val-red)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(244,100,95,.3)"; }}
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
            <div style={{ fontFamily: "var(--val-font-body)", fontSize: 22, fontWeight: 700, letterSpacing: "-.015em", color: "var(--val-text)", marginBottom: 4 }}>Edit Task</div>
            <div style={{ fontSize: 12, color: "var(--val-text-dim)", marginBottom: 24, fontWeight: 500 }}>{editingTask.projects?.name}</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: "var(--val-text-dim)", textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 6, fontWeight: 600 }}>Description</label>
              <textarea
                className="inp"
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                style={{ minHeight: 80 }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--val-text-dim)", textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 6, fontWeight: 600 }}>Priority</label>
                <select className="inp" value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--val-text-dim)", textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 6, fontWeight: 600 }}>Due Date</label>
                <input type="datetime-local" className="inp" value={editForm.due_at} onChange={e => setEditForm(f => ({ ...f, due_at: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost" onClick={() => setEditingTask(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" onClick={saveEdit} disabled={saving || !editForm.description.trim()} style={{ flex: 2 }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
