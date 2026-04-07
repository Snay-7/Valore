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
.filter-btn.active{background:rgba(201,168,76,.08);border-color:var(--gold-border);color:var(--gold)}
.project-group{margin-bottom:32px;animation:fadeIn .3s ease both}
.project-group-header{display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px 10px 0 0;border-bottom:none;flex-wrap:wrap}
.inp{width:100%;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font-body);font-size:13px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold)}
.inp::placeholder{color:var(--text-d)}
.edit-modal{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200}
.edit-card{background:var(--bg2);border:1px solid var(--border-m);border-radius:14px;padding:28px;width:480px;max-width:calc(100vw - 40px)}

/* Desktop sidebar */
.sidebar{width:220px;background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}

/* Mobile top bar */
.mobile-topbar{display:none;align-items:center;justify-content:space-between;padding:16px 20px;background:var(--bg1);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50}

/* Bottom nav */
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg1);border-top:1px solid var(--border);z-index:100;padding:8px 0 env(safe-area-inset-bottom,16px)}
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

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="sidebar">
        <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid var(--border)" }}>
          <img src="data:image/png;base64,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" alt="Valora" style={{ height: "26px", width: "auto" }}/>
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
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABACAYAAACunKHjAAARFElEQVR42u1ba4wcV5X+zrlV3T1vjz0zjh+Jg0kgjIkMSVg2gLa9UQQCwUoI1YDYaBGr3V/AAmJBgRB6GgKBhdVGrJQFgXbDovzIFJBdIEtexJ687DwMIcadzcMJY+zxzNjz7ulHVd1z9kdVdbdNkhnb4wkslNWe6R5p6p7vfuc73zm3BvjTBQCgU96z58WfTU2BBgagrT+cmsoTAAwMDGj8fop2JT8rDYyq78O+UoEUCmDsyfOpn+9pWe9LXYO+r6u6GP1dYF+pDT3ty2n5RXr15QOXdnW0XWRFHSPIwCXLABGghhwFqREVVxQZAGCjhsGO45JZqobH6P7fjqS/a82YAHARkHdfufVNfetyb6mHEoCUSElUoIYRgDUIQ2aQGhFRMFnDZCVSdh2S2UrtKQcAPA/s+7BEzoUD63I/IhCY43iYY7YxAY5hUIK96zCYCUyEjMNQAC74tyP3j+0b8mDWKE0IhQI2futbHTtetf6HW/s7zi9XQwCAiEIBWFGEkQCK5L1AFRBVMBGsKGZfqL+PAcD3YQsF8D2Pj//kxHz9disq1cDWq3Vrq7XI1uqRrdYju1QNbaUa2Uo1sotLoV1YDOxcuR5NL9Tr1oqe199+AwHqwVsTNox4HheLRXnnG3s+2r8ud/7x+VqtUo+icjWMFqthtFQLbaUW2iC0thbGMdSCyFZrka3UwsCKyvjxJf9/Hjn6o4a4lEpxnk3O1z4fRNYywTXMzEzGMWwMs4n/kXFdNo7DxjhsDJNDhOxCJZTu9sxV78u/6t1Dvm89zzPnmg0HB329/DWb+rb0t308ikQYyDCRY5gcx7BjmI1jjDGGjWPYuA4b1zHGcZizGccJAmvHJupfVoAaQPg+bD6fdx58YqK0WAm/l8sYJlLLHFOKmMAEEFH8SldDcXqkKbOlr+0GADw4OKjntkrkTbEI+bMd6z61cX3bJisqjsPMRDDMMEyNlDZEMNx8uQ7Z7naX5yvB9x46ePRXw/m8Oanc7BodFQXo8Gz1xnoQLTqOYSZSw3HgcdCAqkIJjeABwDVswkjsQG/bzmveftGHisWijJwjVhQAHh4etfmdGy+8oL/jI9aqMJMxTDAm1jcigKnle6Z0EzXjGl6shIvPTJZvUAVhdFROAqIIyK583jx+YOr5hUr4zVzGMDNZSoJOA2cmMAACNW6G+CZkRXVrX/vnN2zY0HUwZsWql9QdIx4RQa+4pP8f13dnuxI2ELfsPBHBMS0gIAUHknUNT83W/nXvLyfGhnflTRGQ39mxsbExLRTAD9ynv+jrbftwe9bptKLKRMTpTVIwEhBMkjaGiawVu64zu2FDJ03f9N0fPVzI553RsTFZTeP0kY+U9OE7tr7+ddt6vi2ipHEGEBIWaLq+JD1aqCtZ1/CJ+fr0XU9OfOATn6gHxe/Fa+MX80V79uT5wOH52ZmF+o3GMBlDYkyKNoMSxNObcfJ5fGPiWmj1vPXtn7n0gp7e4T2jdjVZsaMUs+HirV3DGddklmqRRpGQSFOSTKz0jZLfog9qDNPEbOXGsbH5uR0lr+F5XgwIjI6O2kKhwLc/MHbzzGL9uVzGMUTU2FUnybsm7ZqgGyYOImv7erID+Su2/AMRdMTzeDVA8DyY9/u+fcebNl+5vjv73nItsKJqIqsIrcDa2DsgWVu6OQlrpbPN5amZ6m9u+/kL3yoUCjzk+42YXmqBWiqVCEAwW659DgoyDCWi5CYE01Ipko/j6hGzg2uBlfVdmU/lB/vP80Z8Kbz0vVYOBDwogEsu7L0hlzEchgpRILKCKFJECRjWKkQ0ASPWCtdlZSI6Nlu7FkBlRxyfLgcEfN+PWTF62J9ZqO3NZRzDDGtSNqRp0VDmhhjBEHEYifR2Zbt2XtL/JSLoDs+js2ODZ4Z8337wqu3v7O3MXLVUC60CJooEkRWEVtBghmjyXpCkjO3IuWZ8eukXt/380A9OZcPLAhGbrGLcic5Urg0jgWGiBgvQrM8pCKm/IAKMIVOrWxlYn/vwu9687XXeiC+FwhmzglJf0rcu92UriijZddGYFUjstKoi/Xlk4++hQKUW4YWj5c8CsElcumIgfB92xPPMj/ceuX+2XP9pZ5vLHDcsjdwjRiN4bqnXzERWRbs7MuY1F3R+lQiaiNOZsIGLxaIM7XrVX3e2u28sV0NrrZowkgYgViQGRbTBBFFFaMU6hszY5OLoDx/4zd1aKPCL9UHL7pAPHwTg8PjiFxYrocSsiMtlyowGGxIgjImZYZhNtWZl84b293j57W97v+9bz4M5QzY43R3u9Uu1SINQKEpSILKCMBKEUawNYdRkQhTFm76wFMqh8bnrCMBQwvLTB8KHvc3zzJ2Pj/9yerF+a1vGMAhRzIgWkWykBiXMiBVbodrZ5tL2LR03KkCn25ClbHhfftvH2nPOayu1SESVUxCs6EmvSASqDZZEGYfN+HRl5Gf7jj10m+e9ZFe8opw96PuqCjo0PlNcWAorWYcZiKsItdpZiimiaDpRJjLlWmg397W/7W+ufvV7TrMhY9/3Zfv2joHONvdzlXqkVpSsbQneKqwV2BZxtLE+KEA8txjUnj22OKwK8uG/9I1WspoiIP6Qx7v3Hz80NVf7t6xrmAk2ZQO32NrU4qWims4EiEi3be4qAMgMrtB65/N5BqBv2Np/bdY1fbXAWhHlyMYzhpPYkIhjWi1Ca63rEB+brv7H7sfHn/aHPH65GcmKVXzIj1V/328mvjKzUJvKuoYZJNzSfabpETdmgEg8IIHCLCyFsr47e9mH3nHxB4vFohTy+WVZsavZ0HUpAKjCapwSTZFMUyIWTGsVQSTKRHxivjb3zLGFYVXQqeXyjIEAYtUvlRZmpuZq33Acw2BoMsBqWG5CPP1RibtU0aSsiVIUiWzua79+40Z0YNcuWZYVo6MCAEdnK/9SD22kIFZRFY1/d2qcUnFMWWGtimHi47P1r+19cnLKH/J4ufHhaSm4XyqhUADf9N2Z/ZddvP6ans5sr1hV5jgRVGOLq8lYTBNARBWqSvXISndHZsP6zq6pm77zw33LNWSjgHqeZ+6879Gpi7Z0v7Y96+ysh9YSwEhYF/+X7FQ8gpO2rOGFpfDI7tJz13zyk5CP3lxadjZyugYn9QK18ROVAqCUbE4ctKaLQbJbgNWm6VGNG7L+nsx1O7f1rFtJQ5aM2unEbPWrtSAKRJStqEoCcOvLpgsB0fR8vXDkCKqllsZqNYFItKLA/3n3oVuPTVcO5LKGRcSmKRCbGoGVpoqLaLpxVA+s9HZl+9906cbPEEGX04oiIJ4HHn1y8teVuv1v1zUsorbhIKVposJIxHEMz5frT97+4Nj3C4UC+76/oiHymVjetCGzhycr19YCS6mjU40NTWp50/QAKNGLuOOt1a309eQ+dtXOrVuG94zaZRuyuOpRuRx8PYzigbxNAGiW0mblnlkIrgMQlV7CPK0WEPB93454nhnZ/fzPJqYru7OuYyIrDWbGi0Oi6k0Kx4wBVYNIutsznRdd0FFYSUPmA7ZQAP38iYnHwlDuy7jMkY1ZoWn3GVprDJm5cv2+n+w9fIf3MuZp1YBosd76zJHy9dV6JMyE0Eoj6IaIEVo0Im2UYObKdenpzH7o6jee9zrPX74hS6fslSD6SgI4peloRWFVKYpU5hbrn4/J6J9WPGcORGK9f7bv8EPHppdGso4xItrYAdsSeFrmYm+hEFEKI5GMQ5kLNnV9kbB8Q5aevdz96NHd9cA+6BjmIBQroggjta7DvFgNf3LXY+N7CwXw6R4wndWw5OBgbL2fHSt/Ya4cLBnDpBIrdCyYTe1o1P0UDIWzVItsb1f2ve+6cvNbhlbQkKWsKNeDLyWdJdl44EBRJPXjMRsIxdOP5ayAKBZj633vE0efnZytfCfrMoci1lpt1PVmfW9qRVrLwkhgDJtN6zuLcRJ5WAkr7nn02N21IHrIMURBJEEuw1yP5Na9T07+2vPis9DTjeWszx38UolUgeHhzP6NvZm/y7lOW2gFBKJUzCT5apP0oObpOYehtZ1t7kWbe3MP/ODOvYc8D6ZUetm6b8bGIBdu6p7NZcwHwkjgOlxdWAre/8JEeWGo1ChYa8eIdETuD3n8xHMTx6fma/9MDBZRSYUsSrUhWVpjqiQKoOEv0Nfb9uV4Y7xlXDeiQgF8z2NH7oisPNrblXHC0N60+5cTY0MeGGfAhlVhRKv1vv3u2ce2rl93TXvWWRdEVqFEVpvB2mSg2poyCnAYie1sz5x//sb20shPHz7geZ4plUrLsSJ89ZaewGF6+1PHl9574kQ1HBo6MzasFiMa1vvIEVRn5uvXqYJEVEW12YQl0WsinnH1QOovqB5Y7c5lbgCQHRz0X7ZNHx1FBADTJ5b+6+hM+V1PPz29mLT9Z3yQtKrHcbGJ8fG373zN473dmZ31wAoxmXT3iXBSGU2dpyggVmxbzjHjx5c+fvuDh785kkytTyOOszp0Zqzq5QOAnZwtf9paJRAo7TVEFNIyQxBtfq+iUAIFoWh3Z/a6bdt61nkjvqxgoygpuWd98r6qQPg+rOd55o594/fOLgZ35zJO0iDFOx9J02GmYACxkKqAg8ja9qwZuOLC3o+tpCEDsGoPsPHqp0lsbSdOlD9bqUXKRI2mrPWlego74hQx9VCkq939xJtfP7ARu0Zl9Vl7DqvGKe5PPc8zP773kfGLtnS/uqsj84ZaEE+XWstnS9VoHBuqgqyI7cg5HRmH2m6+Ze6OQj5vVvM0fc2AAACvVKI9AL7R5hzobnf/npldKwIoKBVHhcbn+MnXlpJKkVXNuubSvs42/98fOTANgEfP8ZN654R2RUCGPI/3lY4/N7NQvyXjMMcDJG3JQWo4zqb1js+yg0gEQHtPj1sgQEtneW665uXzVJBVoTsu7N94xSXdBzKusyGMRAngdGvTdr0xyDlp3KfiOGSPTpT/YvTA1D7vHD+yeC6FSHbtypvS2PGJ+cXw644h0sRkpdMqaVSRpr/QBkBQh9ntW5e7Pkm4P1hGAAAVCqBbbkHmrRdvfyqXcbbVQ6tEYJXmKC82Wi0IJh0qE4nrME/OlvP3PDZx/wpYccbG6lyXJi2VQGNjqC0sRV8AELMicZXSkgrNSVZsyymeaaiqak9H7msA3MHBZYPU38fUSE2WFArgn+49fOvCUv1Jx2G2Vm3qJYiavQilJbXFgEVWEETiAkBxGHquWLwWZkWTyZIsVuxnknihaLbnjePBpIKEVhpjehHQ3GL90wBCbwiMc1RG18S1xdYb5q7HjtxVrob3ZjPGqMS53uhKcbLLTOaQplyN7rz/V5O7/5Crxotec0vBtfXQtg6qWrSiMeRVaDzgnVoIhtdiXWsGRMqK3b84tn+pGt2adZkjK7b18DZ9VtKKSi5ruB7YH+x/avIRbw3+7GGt/+KGAehbdvRv39TXcQBANrKSPFAQD2oo9tzKRPXfTpUv2//M9NNpEfl/wYg0CzwP/PDB44fKleDbrsMsEjuKdHBjRaxrmKv18Pv7n5n+X+8s5pC/z4xoWO8/3z4wcN6WXMkwr7MiFHeeqhQ/dlU+caIyuO/ZmfG1YMMrIpax9YZ55IWpyWrd/pNh4siqJEIpGddwpW6/ue/ZmaNrxYZXihEN6+3f3N++bXv2KWbaoqKWDRkVnJiYKl/8+POzC3SWbvH3nRENk1U6frxcrobDTEShiDARlavRV/Y/PzufnFEo/gguSk7A3asv33zwr956gf3LyzaVNgHtyedrylZ+BYFIrXdYCaLPOoY4jOSLx4BK8vkfBRtOvZwrd/QXL9+0qT1hAuFP1x/5dQYPq//pOhfX/wG2tH7yj4gcnQAAAABJRU5ErkJggg==" alt="Valora" style={{ height: "24px", width: "auto" }}/>
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
                        {task.completed && <span style={{ fontSize: 11, color: "#06070a", fontWeight: 700 }}>✓</span>}
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
