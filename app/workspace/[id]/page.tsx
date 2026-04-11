"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";


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
html,body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}


@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{transform:translateX(110%)}to{transform:translateX(0)}}
@keyframes slideOut{from{transform:translateX(0)}to{transform:translateX(110%)}}
@keyframes overlayIn{from{opacity:0}to{opacity:1}}
@keyframes overlayOut{from{opacity:1}to{opacity:0}}
@keyframes taskIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}


/* ── Metric cards ── */
.metric{
  background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);
  padding:22px 24px;position:relative;overflow:hidden;transition:border-color .3s,transform .2s;
}
.metric::after{
  content:'';position:absolute;top:0;right:0;width:80px;height:80px;
  background:radial-gradient(circle,rgba(82,196,152,.06) 0%,transparent 70%);
  pointer-events:none;
}
.metric:hover{border-color:rgba(82,196,152,.12);transform:translateY(-1px)}
.metric-label{font-size:9px;font-weight:600;color:var(--text-d);text-transform:uppercase;letter-spacing:.14em;margin-bottom:10px}
.metric-val{font-family:var(--font-mono);font-size:24px;font-weight:500;letter-spacing:-.02em;line-height:1}
.metric-hint{font-size:10px;color:var(--text-d);margin-top:7px;font-family:var(--font-mono)}


/* ── Action cards ── */
.act{
  background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);
  padding:24px;cursor:pointer;transition:border-color .25s,transform .2s,box-shadow .25s;
  text-align:left;width:100%;display:flex;flex-direction:column;gap:14px;
  position:relative;overflow:hidden;
}
.act::before{
  content:'';position:absolute;inset:0;opacity:0;transition:opacity .25s;
  background:linear-gradient(135deg,rgba(82,196,152,.04) 0%,transparent 60%);
}
.act:hover{border-color:var(--gold-border);transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,.5)}
.act:hover::before{opacity:1}
.act.open{border-color:var(--gold-border);background:rgba(82,196,152,.03)}
.act-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.act-title{font-family:var(--font-display);font-size:18px;font-weight:500;letter-spacing:.01em;line-height:1}
.act-desc{font-size:11px;color:var(--text-d);line-height:1.6;margin-top:2px}
.act-foot{font-size:10px;color:var(--text-d);font-family:var(--font-mono);margin-top:auto;padding-top:4px;border-top:1px solid var(--border)}


/* ── Panel ── */
.panel{
  position:fixed;top:0;right:0;bottom:0;width:var(--panel-w);
  background:var(--bg1);border-left:1px solid var(--border-m);
  display:flex;flex-direction:column;z-index:100;
  box-shadow:-30px 0 80px rgba(0,0,0,.7);
}
.panel-enter{animation:slideIn .32s cubic-bezier(.16,1,.3,1) both}
.panel-exit{animation:slideOut .22s ease-in both}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99;backdrop-filter:blur(3px)}
.overlay-in{animation:overlayIn .2s ease both}
.overlay-out{animation:overlayOut .22s ease both}


/* ── Panel form ── */
.fl{font-size:10px;font-weight:600;color:var(--text-d);text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px}
.fi{
  width:100%;background:var(--bg3);border:1px solid var(--border-m);border-radius:9px;
  padding:10px 13px;color:var(--text);font-family:var(--font-body);font-size:13px;
  outline:none;transition:border-color .2s;
}
.fi:focus{border-color:var(--gold-border)}
.fi::placeholder{color:var(--text-d)}
select.fi option{background:var(--bg3)}
textarea.fi{resize:vertical;min-height:90px;line-height:1.6}


/* ── Task item ── */
.task{
  background:var(--bg3);border:1px solid var(--border);border-radius:11px;
  padding:14px 16px;transition:border-color .2s,opacity .2s;
  animation:taskIn .2s ease both;
}
.task:hover{border-color:var(--border-m)}
.task.done{opacity:.45}


/* ── Note item ── */
.note{
  background:var(--bg3);border:1px solid var(--border);border-radius:11px;
  padding:16px;transition:border-color .2s;animation:taskIn .2s ease both;
}
.note:hover{border-color:var(--border-m)}


/* ── Badges ── */
.badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;letter-spacing:.03em;white-space:nowrap}
.vis{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:20px;font-size:10px;background:rgba(91,156,246,.08);color:var(--blue);border:1px solid rgba(91,156,246,.18)}


/* ── Buttons ── */
.btn-gold{background:var(--gold);color:#0D1017;border:none;border-radius:9px;padding:10px 20px;font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:opacity .2s}
.btn-gold:hover{opacity:.88}
.btn-gold:disabled{opacity:.35;cursor:not-allowed}
.btn-ghost{background:none;border:1px solid var(--border-m);border-radius:9px;padding:10px 16px;color:var(--text-m);font-family:var(--font-body);font-size:13px;cursor:pointer;transition:all .2s}
.btn-ghost:hover{border-color:var(--border-m);color:var(--text)}
.btn-add{
  width:100%;background:transparent;border:1px dashed rgba(255,255,255,.1);border-radius:10px;
  padding:13px;color:var(--text-d);font-size:12px;cursor:pointer;font-family:var(--font-body);
  transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;
}
.btn-add:hover{border-color:var(--gold-border);color:var(--gold);background:var(--gold-bg)}
.btn-del{background:none;border:none;color:var(--text-d);cursor:pointer;font-size:11px;font-family:var(--font-body);transition:color .15s;padding:2px 4px}
.btn-del:hover{color:var(--red)}


/* ── Scrollbar ── */
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:var(--border-m);border-radius:2px}


/* ── Nav btn ── */
.nbtn{background:none;border:1px solid var(--border);border-radius:7px;color:var(--text-m);cursor:pointer;padding:5px 14px;font-family:var(--font-body);font-size:11px;letter-spacing:.04em;transition:all .2s}
.nbtn:hover{border-color:var(--gold-border);color:var(--gold)}


/* ── Section label ── */
.slabel{font-size:9px;font-weight:600;color:var(--text-d);text-transform:uppercase;letter-spacing:.16em;margin-bottom:14px}


/* ── Divider ── */
.div{height:1px;background:var(--border);margin:28px 0}


/* Snapshot row */
.snap-item{display:flex;flex-direction:column;gap:4px}
.snap-k{font-size:9px;font-weight:600;color:var(--text-d);text-transform:uppercase;letter-spacing:.1em}
.snap-v{font-size:13px;font-family:var(--font-mono)}
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
  low:    {c:"#52C498",bg:"rgba(61,220,132,.1)"},
  medium: {c:"#E0A030",bg:"rgba(240,164,41,.1)"},
  high:   {c:"#D45252",bg:"rgba(244,100,95,.1)"},
  urgent: {c:"#a78bfa",bg:"rgba(167,139,250,.1)"},
};


type Panel = "tasks"|"notes"|null;


export default function WorkspaceProjectPage() {
  const router = useRouter();
  const params = useParams();
  const pid = params?.id as string;


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


  // tasks
  const [tasks,    setTasks]    = useState<any[]>([]);
  const [tLoad,    setTLoad]    = useState(false);
  const [tForm,    setTForm]    = useState(false);
  const [tTitle,   setTTitle]   = useState("");
  const [tPri,     setTPri]     = useState("medium");
  const [tUrg,     setTUrg]     = useState("normal");
  const [tDue,     setTDue]     = useState("");
  const [tVis,     setTVis]     = useState("team");
  const [tSaving,  setTSaving]  = useState(false);


  // notes
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
    <div style={{minHeight:"100vh",background:"#0D1017",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:30,height:30,border:"2px solid rgba(82,196,152,.1)",borderTopColor:"#52C498",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );


  if (notFound) return (
    <div style={{minHeight:"100vh",background:"#0D1017",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20}}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){var t=localStorage.getItem('valora-theme')||'light';if(t==='light')document.body.classList.add('light');})()`}}/>
      <div style={{fontFamily:"var(--font-display)",fontSize:34,fontWeight:300,color:"var(--text-d)"}}>Project not found</div>
      <button onClick={()=>router.push("/workspace")} className="btn-gold" style={{padding:"10px 24px"}}>← Back to Workspace</button>
    </div>
  );


  const sym = CURR[project?.currency]||"£";
  const snap = appr?.snapshot||{};
  const poc = appr?.profit_on_cost;
  const pocC = poc>0.2?"var(--green)":poc>0.1?"var(--amber)":poc>0?"var(--red)":"var(--text-d)";
  const isOpen = panel!==null;


  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"var(--font-body)"}}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){var t=localStorage.getItem('valora-theme')||'light';if(t==='light')document.body.classList.add('light');})()`}}/>


      {/* Ambient glow */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
        background:"radial-gradient(ellipse 60% 40% at 15% 60%,rgba(82,196,152,.03) 0%,transparent 60%), radial-gradient(ellipse 50% 50% at 85% 20%,rgba(91,156,246,.025) 0%,transparent 55%)"}}/>


      {/* ── Nav ── */}
      <nav style={{position:"sticky",top:0,zIndex:50,background:"rgba(6,7,10,.92)",backdropFilter:"blur(16px)",borderBottom:"1px solid var(--border)",height:54,display:"flex",alignItems:"center",padding:"0 28px",gap:12}}>
        <button className="nbtn" onClick={()=>router.push("/workspace")}>← Workspace</button>
        {firm&&<><span style={{color:"var(--text-d)",fontSize:14,marginLeft:2}}>/</span><span style={{fontSize:11,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".1em"}}>{firm.name}</span></>}
        <div style={{flex:1}}/>
        <span style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".14em",padding:"3px 11px",border:"1px solid var(--border)",borderRadius:20,fontWeight:600}}>{role}</span>
      </nav>


      {/* ── Main (shifts left when panel open) ── */}
      <div style={{transition:"padding-right .32s cubic-bezier(.16,1,.3,1)",paddingRight:isOpen?"var(--panel-w)":0,position:"relative",zIndex:1}}>
        <div style={{maxWidth:840,margin:"0 auto",padding:"48px 28px 80px"}}>


          {/* Header */}
          <div style={{marginBottom:40,animation:"fadeUp .35s ease both"}}>
            <div style={{display:"flex",gap:7,marginBottom:14}}>
              {project?.asset_type&&<span style={{fontSize:10,fontWeight:600,padding:"3px 11px",borderRadius:20,background:"var(--gold-bg)",color:"var(--gold)",border:"1px solid var(--gold-border)",letterSpacing:".06em"}}>{project.asset_type}</span>}
              <span style={{fontSize:10,padding:"3px 11px",borderRadius:20,background:"rgba(255,255,255,.03)",color:"var(--text-d)",border:"1px solid var(--border)"}}>{appr?.status||"draft"}</span>
            </div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:52,fontWeight:300,letterSpacing:".01em",lineHeight:1.03,marginBottom:10}}>
              {project?.name||"Untitled Project"}
            </h1>
            {project?.location&&(
              <p style={{fontSize:13,color:"var(--text-m)",display:"flex",alignItems:"center",gap:6}}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {project.location}
              </p>
            )}
          </div>


          {/* Gold rule */}
          <div style={{height:1,background:"linear-gradient(90deg,rgba(82,196,152,.3),rgba(82,196,152,.05) 60%,transparent)",marginBottom:36,animation:"fadeUp .35s .04s ease both",opacity:0,animationFillMode:"forwards"}}/>


          {/* Metrics */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:40,animation:"fadeUp .35s .08s ease both",opacity:0,animationFillMode:"forwards"}}>
            {[
              {l:"GDV",v:fmt(appr?.gdv,sym),c:"var(--gold)",h:"Gross Development Value"},
              {l:"Total Cost",v:fmt(appr?.total_cost,sym),c:"var(--text)",h:"All-in cost"},
              {l:"Profit",v:fmt(appr?.profit,sym),c:(appr?.profit||0)>0?"var(--green)":"var(--red)",h:""},
              {l:"Profit on Cost",v:fmtPct(poc),c:pocC,h:""},
              {l:"IRR Unlevered",v:fmtPct(appr?.irr_unlevered),c:"var(--blue)",h:""},
              {l:"Appraisals",v:String(apprCnt||0),c:"var(--text-m)",h:"saved versions"},
            ].map(m=>(
              <div key={m.l} className="metric">
                <div className="metric-label">{m.l}</div>
                <div className="metric-val" style={{color:m.c}}>{m.v}</div>
                {m.h&&<div className="metric-hint">{m.h}</div>}
              </div>
            ))}
          </div>


          {/* Actions label */}
          <div className="slabel" style={{animation:"fadeUp .35s .14s ease both",opacity:0,animationFillMode:"forwards"}}>Project Actions</div>


          {/* Action cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:44,animation:"fadeUp .35s .18s ease both",opacity:0,animationFillMode:"forwards"}}>


            {/* Open Appraisal */}
            <button className="act" onClick={()=>router.push(appr?`/appraisal?project=${pid}&appraisal=${appr.id}`:`/appraisal?project=${pid}`)}>
              <div className="act-icon" style={{background:"linear-gradient(135deg,rgba(82,196,152,.18),rgba(82,196,152,.06))",border:"1px solid var(--gold-border)"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <div className="act-title" style={{color:"var(--gold)"}}>Open Appraisal</div>
                <div className="act-desc">View and edit the full development model</div>
              </div>
              <div className="act-foot">{apprCnt>0?`${apprCnt} saved version${apprCnt>1?"s":""}`:"No saves yet"}</div>
            </button>


            {/* Tasks */}
            <button className={`act${panel==="tasks"?" open":""}`} onClick={()=>openPanel("tasks")}>
              <div className="act-icon" style={{background:"linear-gradient(135deg,rgba(91,156,246,.15),rgba(91,156,246,.05))",border:"1px solid rgba(91,156,246,.22)"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <div>
                <div className="act-title" style={{color:"var(--blue)"}}>Tasks</div>
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
              <div className="act-icon" style={{background:"linear-gradient(135deg,rgba(61,220,132,.1),rgba(61,220,132,.03))",border:"1px solid rgba(61,220,132,.18)"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <div className="act-title" style={{color:"var(--green)"}}>Notes</div>
                <div className="act-desc">Deal commentary visible to the team</div>
              </div>
              <div className="act-foot">{notes.length>0?`${notes.length} note${notes.length>1?"s":""}`:"Click to add"}</div>
            </button>
          </div>


          {/* Deal snapshot */}
          {snap&&Object.keys(snap).length>0&&(
            <div style={{animation:"fadeUp .35s .24s ease both",opacity:0,animationFillMode:"forwards"}}>
              <div className="slabel">Deal Snapshot</div>
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"22px 26px",display:"flex",flexWrap:"wrap",gap:32}}>
                {[
                  snap.assetType&&{k:"Type",v:snap.assetType,c:"var(--gold)"},
                  snap.location&&{k:"Location",v:snap.location,c:"var(--text)"},
                  snap.currency&&{k:"Currency",v:snap.currency,c:"var(--text-m)"},
                  snap.programmMonths&&{k:"Programme",v:`${snap.programmMonths}m`,c:"var(--text-m)"},
                  snap.exitYield&&{k:"Exit Yield",v:`${snap.exitYield}%`,c:"var(--text-m)"},
                  snap.benchmarkRate&&{k:"Benchmark",v:`${snap.benchmarkRate}%`,c:"var(--text-m)"},
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
            <div style={{marginTop:22,fontSize:11,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>
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


          {/* Panel header */}
          <div style={{padding:"22px 26px 18px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:10,fontWeight:600,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".12em",marginBottom:4}}>{project?.name}</div>
                <h2 style={{fontFamily:"var(--font-display)",fontSize:26,fontWeight:400,letterSpacing:".02em",color:panel==="tasks"?"var(--blue)":"var(--green)"}}>
                  {panel==="tasks"?"Tasks":"Notes"}
                </h2>
              </div>
              <button onClick={closePanel} style={{background:"none",border:"1px solid var(--border)",borderRadius:7,color:"var(--text-d)",cursor:"pointer",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,transition:"all .2s",marginTop:2,flexShrink:0}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="var(--border-m)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                ×
              </button>
            </div>
          </div>


          {/* Panel scroll body */}
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
                  <div style={{background:"var(--bg3)",border:"1px solid var(--border-m)",borderRadius:12,padding:18,marginBottom:20}}>
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
                    <div style={{width:22,height:22,border:"2px solid rgba(91,156,246,.15)",borderTopColor:"var(--blue)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
                  </div>
                ):tasks.length===0?(
                  <div style={{textAlign:"center",padding:"48px 0",color:"var(--text-d)",fontSize:13}}>No tasks yet</div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {tasks.map((t,i)=>{
                      const pc=PRI[t.priority]||PRI.medium;
                      const done=t.status==="done";
                      return(
                        <div key={t.id} className={`task${done?" done":""}`} style={{animationDelay:`${i*0.04}s`}}>
                          <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                            {/* Checkbox */}
                            <button onClick={()=>toggleTask(t)}
                              style={{width:18,height:18,borderRadius:5,border:`1.5px solid ${done?"var(--green)":"var(--border-m)"}`,background:done?"var(--green)":"transparent",cursor:"pointer",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                              {done&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0D1017" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                            </button>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13,color:done?"var(--text-d)":"var(--text)",textDecoration:done?"line-through":"none",marginBottom:7,lineHeight:1.4}}>
                                {t.title}
                              </div>
                              <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
                                <span className="badge" style={{background:pc.bg,color:pc.c}}>
                                  <span style={{width:5,height:5,borderRadius:"50%",background:pc.c,flexShrink:0}}/>
                                  {t.priority}
                                </span>
                                {t.urgency&&t.urgency!=="normal"&&(
                                  <span className="badge" style={{background:"rgba(240,164,41,.1)",color:"var(--amber)"}}>{t.urgency}</span>
                                )}
                                {t.due_date&&(
                                  <span style={{fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>
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
                            {/* Delete */}
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
                <div style={{background:"var(--bg3)",border:"1px solid var(--border-m)",borderRadius:12,padding:16,marginBottom:20}}>
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
                    <button className="btn-gold" onClick={addNote} disabled={nSaving||!nText.trim()} style={{padding:"9px 20px",whiteSpace:"nowrap"}}>
                      {nSaving?"…":"Post Note"}
                    </button>
                  </div>
                </div>


                {nLoad?(
                  <div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}>
                    <div style={{width:22,height:22,border:"2px solid rgba(61,220,132,.15)",borderTopColor:"var(--green)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
                  </div>
                ):notes.length===0?(
                  <div style={{textAlign:"center",padding:"48px 0",color:"var(--text-d)",fontSize:13}}>No notes yet</div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {notes.map((n,i)=>(
                      <div key={n.id} className="note" style={{animationDelay:`${i*0.04}s`}}>
                        <p style={{fontSize:13,color:"var(--text)",lineHeight:1.65,marginBottom:10,whiteSpace:"pre-wrap"}}>{n.content}</p>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>
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
