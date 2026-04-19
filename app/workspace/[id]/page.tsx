"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
/* ═══════════════════════════════════════════════════════════════════════
   VALORA — WORKSPACE DETAIL v2
   Rebranded to Valora design system. Matches the mockup: asset/status
   chips + big title + 6-up metric tiles + 3 Project Actions + Deal
   Snapshot row. Side panel (Tasks / Notes) preserved verbatim. All
   Supabase calls byte-identical. Unified theme sync + dual-selector light.
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
  /* Page-local vars the layout depends on */
  --radius:var(--val-r-xl);
  --panel-w:440px;
  /* Legacy aliases */
  --gold:var(--val-green);--gold-l:#5DD3A4;--gold-bg:var(--val-green-tint);--gold-border:var(--val-border-accent);
  --bg:var(--val-bg-app);--bg1:var(--val-bg-panel);--bg2:var(--val-bg-panel);
  --bg3:var(--val-bg-panel-2);--bg4:var(--val-bg-panel-3);--bg5:#383E4A;
  --text:var(--val-text);--text-m:var(--val-text-mid);--text-d:var(--val-text-dim);
  --border:var(--val-border);--border-m:var(--val-border-lt);
  --green:var(--val-green);--red:var(--val-red);--amber:var(--val-amber);--blue:var(--val-blue);--purple:#a78bfa;
  --font-display:var(--val-font-body);--font-body:var(--val-font-body);--font-mono:var(--val-font-mono);
}

/* ─── LIGHT ─── */
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

html,body{background:var(--val-bg-app);color:var(--val-text);font-family:var(--val-font-body);font-size:14px;line-height:1.45;font-weight:400;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
::selection{background:var(--val-green-tint);color:var(--val-text)}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--val-border-lt);border-radius:var(--val-r-pill);border:2px solid var(--val-bg-app)}
::-webkit-scrollbar-thumb:hover{background:var(--val-text-dim)}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{transform:translateX(110%)}to{transform:translateX(0)}}
@keyframes slideOut{from{transform:translateX(0)}to{transform:translateX(110%)}}
@keyframes overlayIn{from{opacity:0}to{opacity:1}}
@keyframes overlayOut{from{opacity:1}to{opacity:0}}
@keyframes taskIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

/* ═══ METRIC TILES (6-up grid) ═══ */
.metric{
  background:var(--val-bg-panel);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-lg);
  padding:20px 22px;
  position:relative;overflow:hidden;
  transition:border-color var(--val-dur) var(--val-ease),transform .15s var(--val-ease);
}
.metric::after{
  content:'';position:absolute;top:0;right:0;width:80px;height:80px;
  background:radial-gradient(circle,var(--val-green-tint) 0%,transparent 70%);
  pointer-events:none;opacity:.55;
}
.metric:hover{border-color:var(--val-border-lt);transform:translateY(-1px)}
.metric-label{font-size:10px;font-weight:600;color:var(--val-text-dim);text-transform:uppercase;letter-spacing:.14em;margin-bottom:10px}
.metric-val{
  font-family:var(--val-font-body);font-size:28px;font-weight:700;letter-spacing:-.025em;line-height:1;
  font-variant-numeric:tabular-nums;
}
.metric-hint{font-size:11px;color:var(--val-text-dim);margin-top:8px;font-weight:500}

/* ═══ ACTION CARDS (3-up: Open Appraisal / Tasks / Notes) ═══ */
.act{
  background:var(--val-bg-panel);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-lg);
  padding:22px;
  cursor:pointer;
  transition:border-color var(--val-dur) var(--val-ease),transform .15s var(--val-ease),box-shadow var(--val-dur) var(--val-ease);
  text-align:left;width:100%;
  display:flex;flex-direction:column;gap:14px;
  position:relative;overflow:hidden;
  font-family:var(--val-font-body);
}
.act:hover{border-color:var(--val-border-accent);transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,.35)}
body.light .act:hover,
:root[data-theme="light"] .act:hover{box-shadow:0 12px 30px rgba(15,17,21,.10)}
.act.open{border-color:var(--val-border-accent);background:var(--val-green-tint)}
.act-icon{
  width:44px;height:44px;
  border-radius:var(--val-r-lg);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.act-title{
  font-family:var(--val-font-body);font-size:17px;font-weight:700;
  letter-spacing:-.015em;line-height:1;
}
.act-desc{font-size:12px;color:var(--val-text-dim);line-height:1.5;margin-top:4px;font-weight:500}
.act-foot{
  font-size:11px;color:var(--val-text-dim);
  margin-top:auto;padding-top:12px;
  border-top:1px solid var(--val-border);
  font-weight:500;
}

/* ═══ SIDE PANEL (slide-in) ═══ */
.panel{
  position:fixed;top:0;right:0;bottom:0;width:var(--panel-w);max-width:90vw;
  background:var(--val-bg-panel);
  border-left:1px solid var(--val-border);
  display:flex;flex-direction:column;z-index:100;
  box-shadow:-30px 0 80px rgba(0,0,0,.5);
}
body.light .panel,
:root[data-theme="light"] .panel{box-shadow:-30px 0 80px rgba(15,17,21,.18)}
.panel-enter{animation:slideIn .32s var(--val-ease) both}
.panel-exit{animation:slideOut .22s ease-in both}
.overlay{position:fixed;inset:0;background:var(--val-bg-overlay);z-index:99;backdrop-filter:blur(3px)}
.overlay-in{animation:overlayIn .2s ease both}
.overlay-out{animation:overlayOut .22s ease both}

/* ═══ PANEL FORM FIELDS ═══ */
.fl{font-size:11px;font-weight:600;color:var(--val-text-dim);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px}
.fi{
  width:100%;
  background:var(--val-bg-panel-2);
  border:1px solid var(--val-border);border-radius:var(--val-r-md);
  padding:10px 13px;
  color:var(--val-text);font-family:var(--val-font-body);font-size:13px;font-weight:500;
  outline:none;transition:border-color var(--val-dur) var(--val-ease),box-shadow var(--val-dur) var(--val-ease);
}
.fi:hover{border-color:var(--val-border-lt)}
.fi:focus{border-color:var(--val-green);box-shadow:0 0 0 3px var(--val-green-tint)}
.fi::placeholder{color:var(--val-text-faint);font-weight:400}
select.fi{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%23949CA0' stroke-width='1.5' fill='none' stroke-linecap='round'/></svg>");background-repeat:no-repeat;background-position:right 14px center;padding-right:32px}
textarea.fi{resize:vertical;min-height:90px;line-height:1.55}

/* ═══ TASK / NOTE ITEMS ═══ */
.task{
  background:var(--val-bg-panel-2);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-md);
  padding:14px 16px;
  transition:border-color var(--val-dur) var(--val-ease),opacity var(--val-dur) var(--val-ease);
  animation:taskIn .2s var(--val-ease) both;
}
.task:hover{border-color:var(--val-border-lt)}
.task.done{opacity:.45}
.note{
  background:var(--val-bg-panel-2);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-md);
  padding:16px;
  transition:border-color var(--val-dur) var(--val-ease);
  animation:taskIn .2s var(--val-ease) both;
}
.note:hover{border-color:var(--val-border-lt)}

/* ═══ BADGES ═══ */
.badge{
  display:inline-flex;align-items:center;gap:4px;
  padding:2px 8px;border-radius:var(--val-r-xs);
  font-size:10px;font-weight:600;letter-spacing:-.015em;white-space:nowrap;
  text-transform:capitalize;
}
.vis{
  display:inline-flex;align-items:center;gap:4px;
  padding:2px 9px;border-radius:var(--val-r-pill);
  font-size:10px;font-weight:500;
  background:var(--val-blue-tint);color:var(--val-blue);
  border:1px solid rgba(92,165,220,.25);
}

/* ═══ BUTTONS ═══ */
.btn-gold{
  background:var(--val-green);color:var(--val-bg-app);
  border:none;border-radius:var(--val-r-sm);
  height:34px;padding:0 16px;
  font-family:var(--val-font-body);font-size:13px;font-weight:600;letter-spacing:-.015em;
  cursor:pointer;transition:background var(--val-dur) var(--val-ease);
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
}
.btn-gold:hover{background:#5DD3A4}
body.light .btn-gold:hover,
:root[data-theme="light"] .btn-gold:hover{background:var(--val-green-deep)}
.btn-gold:disabled{opacity:.35;cursor:not-allowed}
.btn-ghost{
  background:transparent;
  border:1px solid var(--val-border-lt);border-radius:var(--val-r-sm);
  height:34px;padding:0 14px;
  color:var(--val-text-mid);
  font-family:var(--val-font-body);font-size:13px;font-weight:600;letter-spacing:-.015em;
  cursor:pointer;transition:all var(--val-dur) var(--val-ease);
  display:inline-flex;align-items:center;justify-content:center;
}
.btn-ghost:hover{border-color:var(--val-text-dim);color:var(--val-text)}
.btn-add{
  width:100%;
  background:transparent;border:1px dashed var(--val-border-lt);
  border-radius:var(--val-r-md);padding:13px;
  color:var(--val-text-dim);font-size:12px;font-weight:500;
  cursor:pointer;font-family:var(--val-font-body);
  transition:all var(--val-dur) var(--val-ease);
  display:flex;align-items:center;justify-content:center;gap:6px;
}
.btn-add:hover{border-color:var(--val-green);color:var(--val-green);background:var(--val-green-tint)}
.btn-del{
  background:none;border:none;
  color:var(--val-text-dim);cursor:pointer;
  font-size:11px;font-family:var(--val-font-body);font-weight:500;
  transition:color var(--val-dur) var(--val-ease);padding:2px 4px;
}
.btn-del:hover{color:var(--val-red)}

/* ═══ NAV BUTTON ═══ */
.nbtn{
  background:transparent;border:1px solid var(--val-border);border-radius:var(--val-r-sm);
  color:var(--val-text-mid);cursor:pointer;
  padding:0 14px;height:30px;
  font-family:var(--val-font-body);font-size:12px;font-weight:500;letter-spacing:-.015em;
  transition:all var(--val-dur) var(--val-ease);
  display:inline-flex;align-items:center;
}
.nbtn:hover{border-color:var(--val-border-lt);color:var(--val-text)}

/* ═══ SECTION LABEL ═══ */
.slabel{
  font-size:11px;font-weight:600;color:var(--val-text-dim);
  text-transform:uppercase;letter-spacing:.14em;
  margin-bottom:14px;
}

/* ═══ DEAL SNAPSHOT ═══ */
.snap-item{display:flex;flex-direction:column;gap:6px}
.snap-k{font-size:10px;font-weight:600;color:var(--val-text-dim);text-transform:uppercase;letter-spacing:.12em}
.snap-v{font-size:14px;font-family:var(--val-font-mono);font-weight:500;font-variant-numeric:tabular-nums}

/* ═══ RESPONSIVE ═══ */
@media(max-width:900px){
  .metrics-grid{grid-template-columns:repeat(2,1fr)!important}
  .actions-grid{grid-template-columns:1fr!important}
}
@media(max-width:640px){
  .metrics-grid{grid-template-columns:1fr!important}
  .detail-nav{padding:0 16px!important;gap:8px!important}
  .detail-main{padding:28px 18px 60px!important}
  .detail-title{font-size:36px!important}
}
`;
const fmt = (n: number, p = "£") => {
  if (n == null || !isFinite(n) || isNaN(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e6) return `${p}${(n/1e6).toFixed(2)}m`;
  if (a >= 1e3) return `${p}${(n/1e3).toFixed(0)}k`;
  return `${p}${n.toFixed(0)}`;
};
const fmtPct = (n: number) => (!n || !isFinite(n) || isNaN(n)) ? "—" : `${(n*100).toFixed(1)}%`;
const CURR: Record<string,string> = {GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$"};
const PRI: Record<string,{c:string;bg:string}> = {
  low:    {c:"var(--val-green)", bg:"var(--val-green-tint)"},
  medium: {c:"var(--val-amber)", bg:"var(--val-amber-tint)"},
  high:   {c:"var(--val-red)",   bg:"var(--val-red-tint)"},
  urgent: {c:"#a78bfa",          bg:"rgba(167,139,250,.12)"},
};
type Panel = "tasks"|"notes"|null;
export default function WorkspaceProjectPage() {
  const router = useRouter();
  const params = useParams();
  const pid = params?.id as string;
  // ── Unified theme sync ──
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
  const [loading,  setLoading]  = useState(true);
  const [project,  setProject]  = useState<any>(null);
  const [appr,     setAppr]     = useState<any>(null);
  const [apprCnt,  setApprCnt]  = useState(0);
  const [firm,     setFirm]     = useState<any>(null);
  const [role,     setRole]     = useState("member");
  const [me,       setMe]       = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [panel,    setPanel]    = useState<Panel>(null);
  const [closing,  setClosing]  = useState(false);
  const [tasks,    setTasks]    = useState<any[]>([]);
  const [tLoad,    setTLoad]    = useState(false);
  const [tForm,    setTForm]    = useState(false);
  const [tTitle,   setTTitle]   = useState("");
  const [tPri,     setTPri]     = useState("medium");
  const [tUrg,     setTUrg]     = useState("normal");
  const [tDue,     setTDue]     = useState("");
  const [tVis,     setTVis]     = useState("team");
  const [tSaving,  setTSaving]  = useState(false);
  const [notes,    setNotes]    = useState<any[]>([]);
  const [nLoad,    setNLoad]    = useState(false);
  const [nText,    setNText]    = useState("");
  const [nVis,     setNVis]     = useState("team");
  const [nSaving,  setNSaving]  = useState(false);
  useEffect(() => {
    if (!pid) { router.push("/workspace"); return; }
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setMe(session.user);
      const { data: mr } = await supabase.from("firm_members")
        .select("firm_id,role,firms(id,name)").eq("user_id", session.user.id).maybeSingle();
      if (mr?.firms) { setFirm(mr.firms); setRole(mr.role || "member"); }
      const { data: proj, error } = await supabase.from("projects")
        .select("id,name,location,asset_type,currency,firm_id,created_by,stage")
        .eq("id", pid).maybeSingle();
      if (error || !proj) { setNotFound(true); setLoading(false); return; }
      setProject(proj);
      const { data: appraisals } = await supabase.from("appraisals")
        .select("id,gdv,total_cost,profit,profit_on_cost,irr_unlevered,status,created_at,snapshot")
        .eq("project_id", pid).order("created_at",{ascending:false}).limit(5);
      if (appraisals?.length) { setAppr(appraisals[0]); setApprCnt(appraisals.length); }
      setLoading(false);
    })();
  }, [pid, router]);
  const openPanel = (p: Panel) => {
    if (panel === p) { closePanel(); return; }
    setPanel(p); setClosing(false);
    if (p === "tasks") loadTasks();
    if (p === "notes") loadNotes();
  };
  const closePanel = () => { setClosing(true); setTimeout(() => { setPanel(null); setClosing(false); }, 230); };
  const loadTasks = async () => {
    setTLoad(true);
    const { data } = await supabase.from("project_tasks").select("*").eq("project_id",pid).order("created_at",{ascending:false});
    setTasks(data||[]); setTLoad(false);
  };
  const loadNotes = async () => {
    setNLoad(true);
    const { data } = await supabase.from("project_notes").select("*").eq("project_id",pid).order("created_at",{ascending:false});
    setNotes(data||[]); setNLoad(false);
  };
  const addTask = async () => {
    if (!tTitle.trim()||!me) return;
    setTSaving(true);
    const { data, error } = await supabase.from("project_tasks").insert({
      project_id:pid, firm_id:project?.firm_id, created_by:me.id,
      title:tTitle.trim(), priority:tPri, urgency:tUrg,
      due_date:tDue||null, visible_to:tVis, status:"open",
    }).select().single();
    if (!error&&data) { setTasks(p=>[data,...p]); setTTitle(""); setTDue(""); setTPri("medium"); setTUrg("normal"); setTVis("team"); setTForm(false); }
    setTSaving(false);
  };
  const toggleTask = async (t: any) => {
    const s = t.status==="done"?"open":"done";
    await supabase.from("project_tasks").update({status:s}).eq("id",t.id);
    setTasks(p=>p.map(x=>x.id===t.id?{...x,status:s}:x));
  };
  const deleteTask = async (id: string) => {
    await supabase.from("project_tasks").delete().eq("id",id);
    setTasks(p=>p.filter(x=>x.id!==id));
  };
  const addNote = async () => {
    if (!nText.trim()||!me) return;
    setNSaving(true);
    const { data, error } = await supabase.from("project_notes").insert({
      project_id:pid, firm_id:project?.firm_id, created_by:me.id,
      content:nText.trim(), visible_to:nVis,
    }).select().single();
    if (!error&&data) { setNotes(p=>[data,...p]); setNText(""); setNVis("team"); }
    setNSaving(false);
  };
  const deleteNote = async (id: string) => {
    await supabase.from("project_notes").delete().eq("id",id);
    setNotes(p=>p.filter(x=>x.id!==id));
  };
  if (loading) return (
    <div style={{minHeight:"100vh",background:"var(--val-bg-app, #0F1115)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:30,height:30,border:"2px solid rgba(82,196,152,.15)",borderTopColor:"#52C498",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (notFound) return (
    <div style={{minHeight:"100vh",background:"var(--val-bg-app)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20}}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var keys=['valora-theme','val-theme','theme'];for(var i=0;i<keys.length;i++){var v=localStorage.getItem(keys[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='light';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');else if(document.body)document.body.classList.remove('light');try{localStorage.setItem('valora-theme',t);localStorage.setItem('val-theme',t);}catch(e){}}catch(e){}})()`}}/>
      <div style={{fontFamily:"var(--val-font-body)",fontSize:30,fontWeight:700,color:"var(--val-text)",letterSpacing:"-.015em"}}>Project not found</div>
      <button onClick={()=>router.push("/workspace")} className="btn-gold">← Back to Workspace</button>
    </div>
  );
  const sym = CURR[project?.currency]||"£";
  const snap = appr?.snapshot||{};
  const poc = appr?.profit_on_cost;
  const pocC = poc>0.2?"var(--val-green)":poc>0.1?"var(--val-amber)":poc>0?"var(--val-red)":"var(--val-text-dim)";
  const isOpen = panel!==null;
  return (
    <div style={{minHeight:"100vh",background:"var(--val-bg-app)",color:"var(--val-text)",fontFamily:"var(--val-font-body)"}}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var keys=['valora-theme','val-theme','theme'];for(var i=0;i<keys.length;i++){var v=localStorage.getItem(keys[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='light';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');else if(document.body)document.body.classList.remove('light');try{localStorage.setItem('valora-theme',t);localStorage.setItem('val-theme',t);}catch(e){}}catch(e){}})()`}}/>
      {/* ── Top nav ── */}
      <nav className="detail-nav" style={{position:"sticky",top:0,zIndex:50,background:"var(--val-bg-panel)",backdropFilter:"blur(16px)",borderBottom:"1px solid var(--val-border)",height:56,display:"flex",alignItems:"center",padding:"0 24px",gap:12}}>
        <button className="nbtn" onClick={()=>router.push("/workspace")}>← Workspace</button>
        {firm&&<><span style={{color:"var(--val-text-dim)",fontSize:14}}>/</span><span style={{fontSize:11,color:"var(--val-green)",textTransform:"uppercase",letterSpacing:".08em",fontWeight:600}}>{firm.name}</span></>}
        <div style={{flex:1}}/>
        <span className="role-badge" style={{fontSize:10,color:"var(--val-text-dim)",textTransform:"uppercase",letterSpacing:".12em",padding:"3px 11px",border:"1px solid var(--val-border)",borderRadius:"var(--val-r-pill)",fontWeight:600}}>{role}</span>
      </nav>
      {/* ── Main (shifts left when panel open) ── */}
      <div style={{transition:"padding-right .32s var(--val-ease)",paddingRight:isOpen?"var(--panel-w)":0,position:"relative",zIndex:1}}>
        <div className="detail-main" style={{maxWidth:960,margin:"0 auto",padding:"48px 32px 80px"}}>
          {/* Header */}
          <div style={{marginBottom:32,animation:"fadeUp .35s var(--val-ease) both"}}>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {project?.asset_type&&<span style={{fontSize:11,fontWeight:600,padding:"2px 10px",borderRadius:"var(--val-r-pill)",background:"var(--val-green-tint)",color:"var(--val-green)",border:"1px solid var(--val-border-accent)",letterSpacing:"-.015em"}}>{project.asset_type}</span>}
              <span style={{fontSize:11,padding:"2px 10px",borderRadius:"var(--val-r-pill)",background:"rgba(148,152,160,.12)",color:"var(--val-text-dim)",border:"1px solid var(--val-border)",fontWeight:500}}>{appr?.status||"draft"}</span>
            </div>
            <h1 className="detail-title" style={{fontFamily:"var(--val-font-body)",fontSize:56,fontWeight:700,letterSpacing:"-.03em",lineHeight:1.02,marginBottom:10,color:"var(--val-text)"}}>
              {project?.name||"Untitled Project"}
            </h1>
            {project?.location&&(
              <p style={{fontSize:14,color:"var(--val-text-dim)",display:"flex",alignItems:"center",gap:6,fontWeight:500}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--val-green)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {project.location}
              </p>
            )}
          </div>
          {/* Subtle rule */}
          <div style={{height:1,background:"linear-gradient(90deg,var(--val-border-accent),var(--val-border) 40%,transparent)",marginBottom:32,animation:"fadeUp .35s .04s var(--val-ease) both"}}/>
          {/* Metrics — 6-up (3-cols desktop, 2 on tablet, 1 on mobile) */}
          <div className="metrics-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:40,animation:"fadeUp .35s .08s var(--val-ease) both"}}>
            {[
              {l:"GDV",v:fmt(appr?.gdv,sym),c:"var(--val-green)",h:"Gross Development Value"},
              {l:"Total Cost",v:fmt(appr?.total_cost,sym),c:"var(--val-text)",h:"All-in cost"},
              {l:"Profit",v:fmt(appr?.profit,sym),c:(appr?.profit||0)>0?"var(--val-green)":"var(--val-red)",h:""},
              {l:"Profit on Cost",v:fmtPct(poc),c:pocC,h:""},
              {l:"IRR Unlevered",v:fmtPct(appr?.irr_unlevered),c:"var(--val-blue)",h:""},
              {l:"Appraisals",v:String(apprCnt||0),c:"var(--val-text-mid)",h:"saved versions"},
            ].map(m=>(
              <div key={m.l} className="metric">
                <div className="metric-label">{m.l}</div>
                <div className="metric-val" style={{color:m.c}}>{m.v}</div>
                {m.h&&<div className="metric-hint">{m.h}</div>}
              </div>
            ))}
          </div>
          {/* Actions section */}
          <div className="slabel" style={{animation:"fadeUp .35s .14s var(--val-ease) both"}}>Project Actions</div>
          <div className="actions-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:44,animation:"fadeUp .35s .18s var(--val-ease) both"}}>
            {/* Open Appraisal */}
            <button className="act" onClick={()=>router.push(appr?`/appraisal?project=${pid}&appraisal=${appr.id}`:`/appraisal?project=${pid}`)}>
              <div className="act-icon" style={{background:"var(--val-green-tint)",border:"1px solid var(--val-border-accent)"}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--val-green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <div className="act-title" style={{color:"var(--val-green)"}}>Open Appraisal</div>
                <div className="act-desc">View and edit the full development model</div>
              </div>
              <div className="act-foot">{apprCnt>0?`${apprCnt} saved version${apprCnt>1?"s":""}`:"No saves yet"}</div>
            </button>
            {/* Tasks */}
            <button className={`act${panel==="tasks"?" open":""}`} onClick={()=>openPanel("tasks")}>
              <div className="act-icon" style={{background:"var(--val-blue-tint)",border:"1px solid rgba(92,165,220,.3)"}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--val-blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <div>
                <div className="act-title" style={{color:"var(--val-blue)"}}>Tasks</div>
                <div className="act-desc">Track actions with priority, urgency & due dates</div>
              </div>
              <div className="act-foot">
                {tasks.filter(t=>t.status!=="done").length>0
                  ?`${tasks.filter(t=>t.status!=="done").length} open task${tasks.filter(t=>t.status!=="done").length>1?"s":""}`
                  :"Click to manage"}
              </div>
            </button>
            {/* Notes */}
            <button className={`act${panel==="notes"?" open":""}`} onClick={()=>openPanel("notes")}>
              <div className="act-icon" style={{background:"var(--val-green-tint)",border:"1px solid var(--val-border-accent)"}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--val-green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <div className="act-title" style={{color:"var(--val-green)"}}>Notes</div>
                <div className="act-desc">Deal commentary visible to the team</div>
              </div>
              <div className="act-foot">{notes.length>0?`${notes.length} note${notes.length>1?"s":""}`:"Click to add"}</div>
            </button>
          </div>
          {/* Deal snapshot */}
          {snap&&Object.keys(snap).length>0&&(
            <div style={{animation:"fadeUp .35s .24s var(--val-ease) both"}}>
              <div className="slabel">Deal Snapshot</div>
              <div style={{background:"var(--val-bg-panel)",border:"1px solid var(--val-border)",borderRadius:"var(--val-r-lg)",padding:"22px 26px",display:"flex",flexWrap:"wrap",gap:40}}>
                {[
                  snap.assetType&&{k:"Type",v:snap.assetType,c:"var(--val-green)"},
                  snap.location&&{k:"Location",v:snap.location,c:"var(--val-text)"},
                  snap.currency&&{k:"Currency",v:snap.currency,c:"var(--val-text-mid)"},
                  snap.programmMonths&&{k:"Programme",v:`${snap.programmMonths}m`,c:"var(--val-text-mid)"},
                  snap.exitYield&&{k:"Exit Yield",v:`${snap.exitYield}%`,c:"var(--val-text-mid)"},
                  snap.benchmarkRate&&{k:"Benchmark",v:`${snap.benchmarkRate}%`,c:"var(--val-text-mid)"},
                ].filter(Boolean).map((x:any)=>(
                  <div key={x.k} className="snap-item">
                    <span className="snap-k">{x.k}</span>
                    <span className="snap-v" style={{color:x.c}}>{x.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {appr?.created_at&&(
            <div style={{marginTop:24,fontSize:12,color:"var(--val-text-dim)",fontWeight:500}}>
              Last saved {new Date(appr.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
            </div>
          )}
        </div>
      </div>
      {/* Overlay */}
      {isOpen&&<div className={`overlay ${closing?"overlay-out":"overlay-in"}`} onClick={closePanel}/>}
      {/* ── Side Panel ── */}
      {isOpen&&(
        <div className={`panel ${closing?"panel-exit":"panel-enter"}`}>
          <div style={{padding:"22px 26px 18px",borderBottom:"1px solid var(--val-border)",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:"var(--val-text-dim)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>{project?.name}</div>
                <h2 style={{fontFamily:"var(--val-font-body)",fontSize:22,fontWeight:700,letterSpacing:"-.015em",color:panel==="tasks"?"var(--val-blue)":"var(--val-green)"}}>
                  {panel==="tasks"?"Tasks":"Notes"}
                </h2>
              </div>
              <button onClick={closePanel} style={{background:"transparent",border:"1px solid var(--val-border)",borderRadius:"var(--val-r-sm)",color:"var(--val-text-dim)",cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,transition:"all var(--val-dur) var(--val-ease)",marginTop:2,flexShrink:0}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--val-border-lt)";e.currentTarget.style.color="var(--val-text)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--val-border)";e.currentTarget.style.color="var(--val-text-dim)";}}>
                ×
              </button>
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
            {/* ── TASKS ── */}
            {panel==="tasks"&&(
              <>
                {!tForm?(
                  <button className="btn-add" onClick={()=>setTForm(true)} style={{marginBottom:20}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Task
                  </button>
                ):(
                  <div style={{background:"var(--val-bg-panel-2)",border:"1px solid var(--val-border)",borderRadius:"var(--val-r-md)",padding:18,marginBottom:20}}>
                    <div style={{marginBottom:12}}>
                      <div className="fl">Task Title</div>
                      <input className="fi" placeholder="e.g. Chase planning consent" value={tTitle} onChange={e=>setTTitle(e.target.value)} autoFocus onKeyDown={e=>e.key==="Enter"&&addTask()}/>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                      <div>
                        <div className="fl">Priority</div>
                        <select className="fi" value={tPri} onChange={e=>setTPri(e.target.value)}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div>
                        <div className="fl">Urgency</div>
                        <select className="fi" value={tUrg} onChange={e=>setTUrg(e.target.value)}>
                          <option value="normal">Normal</option>
                          <option value="soon">Soon</option>
                          <option value="immediate">Immediate</option>
                        </select>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                      <div>
                        <div className="fl">Due Date</div>
                        <input className="fi" type="date" value={tDue} onChange={e=>setTDue(e.target.value)}/>
                      </div>
                      <div>
                        <div className="fl">Visible To</div>
                        <select className="fi" value={tVis} onChange={e=>setTVis(e.target.value)}>
                          <option value="team">Whole Team</option>
                          <option value="admin">Admins Only</option>
                          <option value="me">Just Me</option>
                        </select>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn-gold" onClick={addTask} disabled={tSaving||!tTitle.trim()} style={{flex:1}}>
                        {tSaving?"Saving…":"Add Task"}
                      </button>
                      <button className="btn-ghost" onClick={()=>{setTForm(false);setTTitle("");}}>Cancel</button>
                    </div>
                  </div>
                )}
                {tLoad?(
                  <div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}>
                    <div style={{width:22,height:22,border:"2px solid rgba(92,165,220,.15)",borderTopColor:"var(--val-blue)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
                  </div>
                ):tasks.length===0?(
                  <div style={{textAlign:"center",padding:"48px 0",color:"var(--val-text-dim)",fontSize:13,fontWeight:500}}>No tasks yet</div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {tasks.map((t,i)=>{
                      const pc=PRI[t.priority]||PRI.medium;
                      const done=t.status==="done";
                      return(
                        <div key={t.id} className={`task${done?" done":""}`} style={{animationDelay:`${i*0.04}s`}}>
                          <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                            <button onClick={()=>toggleTask(t)}
                              style={{width:18,height:18,borderRadius:"var(--val-r-xs)",border:`1.5px solid ${done?"var(--val-green)":"var(--val-border-lt)"}`,background:done?"var(--val-green)":"transparent",cursor:"pointer",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all var(--val-dur) var(--val-ease)"}}>
                              {done&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--val-bg-app)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                            </button>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13,color:done?"var(--val-text-dim)":"var(--val-text)",textDecoration:done?"line-through":"none",marginBottom:8,lineHeight:1.4,fontWeight:500}}>
                                {t.title}
                              </div>
                              <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                                <span className="badge" style={{background:pc.bg,color:pc.c}}>
                                  <span style={{width:5,height:5,borderRadius:"50%",background:"currentColor",flexShrink:0}}/>
                                  {t.priority}
                                </span>
                                {t.urgency&&t.urgency!=="normal"&&(
                                  <span className="badge" style={{background:"var(--val-amber-tint)",color:"var(--val-amber)"}}>{t.urgency}</span>
                                )}
                                {t.due_date&&(
                                  <span style={{fontSize:11,color:"var(--val-text-dim)",fontFamily:"var(--val-font-mono)",fontVariantNumeric:"tabular-nums",fontWeight:500}}>
                                    Due {new Date(t.due_date).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
                                  </span>
                                )}
                                {t.visible_to&&(
                                  <span className="vis">
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                    {t.visible_to==="team"?"Team":t.visible_to==="admin"?"Admins":"Me"}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button className="btn-del" onClick={()=>deleteTask(t.id)} title="Delete task">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
            {/* ── NOTES ── */}
            {panel==="notes"&&(
              <>
                <div style={{background:"var(--val-bg-panel-2)",border:"1px solid var(--val-border)",borderRadius:"var(--val-r-md)",padding:16,marginBottom:20}}>
                  <div style={{marginBottom:10}}>
                    <div className="fl">New Note</div>
                    <textarea className="fi" placeholder="Add a deal note, observation or comment…" value={nText} onChange={e=>setNText(e.target.value)} rows={3}/>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <select className="fi" value={nVis} onChange={e=>setNVis(e.target.value)} style={{padding:"8px 12px",flex:1}}>
                      <option value="team">Visible to: Whole Team</option>
                      <option value="admin">Visible to: Admins Only</option>
                      <option value="me">Visible to: Just Me</option>
                    </select>
                    <button className="btn-gold" onClick={addNote} disabled={nSaving||!nText.trim()} style={{whiteSpace:"nowrap"}}>
                      {nSaving?"…":"Post Note"}
                    </button>
                  </div>
                </div>
                {nLoad?(
                  <div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}>
                    <div style={{width:22,height:22,border:"2px solid rgba(82,196,152,.15)",borderTopColor:"var(--val-green)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
                  </div>
                ):notes.length===0?(
                  <div style={{textAlign:"center",padding:"48px 0",color:"var(--val-text-dim)",fontSize:13,fontWeight:500}}>No notes yet</div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {notes.map((n,i)=>(
                      <div key={n.id} className="note" style={{animationDelay:`${i*0.04}s`}}>
                        <p style={{fontSize:13,color:"var(--val-text)",lineHeight:1.6,marginBottom:10,whiteSpace:"pre-wrap",fontWeight:500}}>{n.content}</p>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:11,color:"var(--val-text-dim)",fontFamily:"var(--val-font-mono)",fontVariantNumeric:"tabular-nums",fontWeight:500}}>
                            {new Date(n.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
                          </span>
                          {n.visible_to&&(
                            <span className="vis">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                              {n.visible_to==="team"?"Team":n.visible_to==="admin"?"Admins":"Me"}
                            </span>
                          )}
                          <div style={{flex:1}}/>
                          <button className="btn-del" onClick={()=>deleteNote(n.id)}>Delete</button>
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
