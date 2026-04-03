"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

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
html{height:100%}
body{height:100%;background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased;overflow:hidden}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}

.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:6px 12px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:7px;padding:7px 14px;font-family:var(--font-body);font-size:12px;font-weight:600;cursor:pointer;transition:background .2s;white-space:nowrap;flex-shrink:0}
.btn-primary:hover{background:var(--gold-l)}

.deal-card{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;cursor:grab;transition:border-color .2s,box-shadow .2s;animation:fadeIn .2s ease;user-select:none;position:relative}
.deal-card:hover{border-color:var(--gold-border);box-shadow:0 4px 16px rgba(0,0,0,.4)}
.deal-card.dragging{opacity:.4;cursor:grabbing}
.deal-card.selected{border-color:var(--gold)}

.col-wrap{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px;width:220px;flex-shrink:0;display:flex;flex-direction:column;max-height:100%}
.col-wrap.drag-over{background:rgba(201,168,76,.04);border-color:var(--gold-border)}

.asset-badge{font-size:9px;padding:2px 7px;border-radius:4px;font-weight:600;letter-spacing:.04em;font-family:var(--font-body)}
.task-count{position:absolute;top:10px;right:10px;background:var(--gold);color:#06070a;border-radius:8px;padding:0 5px;font-size:9px;font-weight:700;font-family:var(--font-mono);line-height:18px}

.inp{width:100%;padding:8px 11px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font-body);font-size:12px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold)}
.inp::placeholder{color:var(--text-d)}

.panel{position:fixed;top:0;right:0;width:min(400px,100vw);height:100%;background:var(--bg1);border-left:1px solid var(--border-m);z-index:60;display:flex;flex-direction:column;animation:slideIn .18s ease;overflow:hidden}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:59;backdrop-filter:blur(3px)}
.panel-tab{padding:9px 14px;font-size:11px;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;font-family:var(--font-body);background:none;border-top:none;border-left:none;border-right:none;color:var(--text-d);text-transform:uppercase;letter-spacing:.06em;white-space:nowrap}
.panel-tab.active{color:var(--gold);border-bottom-color:var(--gold)}

.task-item{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:11px;margin-bottom:7px;transition:border-color .2s}
.task-item:hover{border-color:var(--border-m)}
.task-item.done{opacity:.45}
.note-item{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:11px;margin-bottom:7px}
.activity-row{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--bg4)}
.priority-badge{font-size:9px;padding:2px 6px;border-radius:4px;font-weight:600;font-family:var(--font-body);letter-spacing:.04em}

.stage-action{flex:1;padding:5px 0;background:var(--bg4);border:1px solid var(--border);border-radius:5px;color:var(--text-d);font-size:10px;cursor:pointer;font-family:var(--font-body);transition:all .15s;text-align:center}
.stage-action:hover{border-color:var(--gold);color:var(--gold)}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg1);border-top:1px solid var(--border);z-index:100;padding:6px 0 env(safe-area-inset-bottom,12px)}
.bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 4px;background:none;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);font-size:9px;letter-spacing:.06em;text-transform:uppercase;transition:color .2s}
.bottom-nav-item.active{color:var(--gold)}
.bottom-nav-item svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
@media(max-width:768px){
  body{overflow:auto!important}
  html{height:auto!important}
  .desktop-nav{display:none!important}
  .bottom-nav{display:flex!important}
  .kanban-board{flex-direction:column!important;overflow-x:hidden!important;overflow-y:auto!important;height:auto!important;padding-bottom:100px!important}
  .col-wrap{width:100%!important;max-height:none!important;height:auto!important}
}
`;

const fmt=(n:number,prefix="£")=>{if(!n||!isFinite(n)||isNaN(n))return"—";const abs=Math.abs(n);if(abs>=1e9)return`${prefix}${(n/1e9).toFixed(2)}bn`;if(abs>=1e6)return`${prefix}${(n/1e6).toFixed(2)}m`;if(abs>=1e3)return`${prefix}${(n/1e3).toFixed(0)}k`;return`${prefix}${n.toFixed(0)}`;};
const fmtPct=(n:number)=>(!n||!isFinite(n)||isNaN(n)?"—":`${(n*100).toFixed(1)}%`);
const fmtDate=(d:string)=>new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"});
const fmtDateTime=(d:string)=>new Date(d).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
const CURRENCY_SYMBOLS:Record<string,string>={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"};

const STAGES=[
  {id:"prospect",      label:"Prospect",       color:"#7d8590"},
  {id:"feasibility",   label:"Feasibility",    color:"#f0a429"},
  {id:"under_offer",   label:"Under Offer",    color:"#5b9cf6"},
  {id:"in_development",label:"In Development", color:"#c9a84c"},
  {id:"completed",     label:"Completed",      color:"#3ddc84"},
];
const ASSET_COLORS:Record<string,{bg:string;color:string}>={
  BTR:{bg:"rgba(201,168,76,.12)",color:"#c9a84c"},
  BTS:{bg:"rgba(91,156,246,.12)",color:"#5b9cf6"},
  Hotel:{bg:"rgba(240,164,41,.12)",color:"#f0a429"},
  Flip:{bg:"rgba(61,220,132,.1)",color:"#3ddc84"},
};
const PRIORITY_STYLES:Record<string,{bg:string;color:string;label:string}>={
  low:{bg:"rgba(125,133,144,.15)",color:"#7d8590",label:"Low"},
  medium:{bg:"rgba(91,156,246,.15)",color:"#5b9cf6",label:"Medium"},
  high:{bg:"rgba(240,164,41,.15)",color:"#f0a429",label:"High"},
  urgent:{bg:"rgba(244,100,95,.15)",color:"#f4645f",label:"Urgent"},
};

export default function PipelinePage(){
  const router=useRouter();
  const[user,setUser]=useState<any>(null);
  const[projects,setProjects]=useState<any[]>([]);
  const[tasks,setTasks]=useState<Record<string,any[]>>({});
  const[notes,setNotes]=useState<Record<string,any[]>>({});
  const[activity,setActivity]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[draggingId,setDraggingId]=useState<string|null>(null);
  const[dragOverCol,setDragOverCol]=useState<string|null>(null);
  const dragItem=useRef<any>(null);
  const[selectedProject,setSelectedProject]=useState<any>(null);
  const[panelTab,setPanelTab]=useState<"tasks"|"notes"|"activity">("tasks");
  const[newTask,setNewTask]=useState({description:"",due_at:"",priority:"medium"});
  const[savingTask,setSavingTask]=useState(false);
  const[newNote,setNewNote]=useState("");
  const[savingNote,setSavingNote]=useState(false);

  useEffect(()=>{
    const init=async()=>{
      const{data:{session}}=await supabase.auth.getSession();
      if(!session){router.push("/");return;}
      setUser(session.user);
      await loadAll(session.user.id);
    };
    init();
  },[router]);

  const loadAll=async(userId:string)=>{
    setLoading(true);
    const[{data:projData},{data:taskData},{data:noteData},{data:actData}]=await Promise.all([
      supabase.from("projects").select(`*,appraisals(id,gdv,profit,profit_on_cost,irr_unlevered,status,created_at)`).eq("created_by",userId).is("deleted_at",null).order("created_at",{ascending:false}),
      supabase.from("tasks").select("*").or(`created_by.eq.${userId},assigned_to.eq.${userId}`).order("created_at",{ascending:false}),
      // ── unified notes table — filter by user and only project-linked notes ──
      supabase.from("notes").select("*").eq("user_id",userId).not("project_id","is",null).order("created_at",{ascending:false}),
      supabase.from("activity").select("*").eq("created_by",userId).order("created_at",{ascending:false}).limit(50),
    ]);
    setProjects(projData||[]);
    const tm:Record<string,any[]>={};
    (taskData||[]).forEach(t=>{if(!tm[t.project_id])tm[t.project_id]=[];tm[t.project_id].push(t);});
    setTasks(tm);
    const nm:Record<string,any[]>={};
    (noteData||[]).forEach(n=>{if(n.project_id){if(!nm[n.project_id])nm[n.project_id]=[];nm[n.project_id].push(n);}});
    setNotes(nm);
    setActivity(actData||[]);
    setLoading(false);
  };

  const logActivity=async(projectId:string,action:string,meta?:any)=>{
    if(!user)return;
    const{data:a}=await supabase.from("activity").insert({project_id:projectId,created_by:user.id,action,meta}).select().single();
    if(a)setActivity(prev=>[a,...prev].slice(0,50));
  };

  const moveProject=async(projectId:string,newStage:string)=>{
    const p=projects.find(x=>x.id===projectId);
    const old=p?.pipeline_stage||"prospect";
    if(old===newStage)return;
    setProjects(prev=>prev.map(x=>x.id===projectId?{...x,pipeline_stage:newStage}:x));
    await supabase.from("projects").update({pipeline_stage:newStage}).eq("id",projectId);
    await logActivity(projectId,`Moved to ${STAGES.find(s=>s.id===newStage)?.label||newStage}`,{from:old,to:newStage});
  };

  const onDragStart=(e:React.DragEvent,p:any)=>{dragItem.current=p;setDraggingId(p.id);e.dataTransfer.effectAllowed="move";};
  const onDragEnd=()=>{setDraggingId(null);setDragOverCol(null);};
  const onDragOver=(e:React.DragEvent,sid:string)=>{e.preventDefault();setDragOverCol(sid);};
  const onDrop=(e:React.DragEvent,sid:string)=>{
    e.preventDefault();
    if(dragItem.current&&(dragItem.current.pipeline_stage||"prospect")!==sid)moveProject(dragItem.current.id,sid);
    setDraggingId(null);setDragOverCol(null);dragItem.current=null;
  };

  const openPanel=(p:any,tab:"tasks"|"notes"|"activity"="tasks")=>{setSelectedProject(p);setPanelTab(tab);};
  const openProject=(p:any)=>{const l=p.appraisals?.[0];router.push(l?`/appraisal?project=${p.id}&appraisal=${l.id}`:`/appraisal?project=${p.id}`);};

  const addTask=async()=>{
    if(!newTask.description.trim()||!selectedProject||!user)return;
    setSavingTask(true);
    const{data}=await supabase.from("tasks").insert({
      project_id:selectedProject.id,created_by:user.id,created_by_email:user.email,
      title:newTask.description.trim(),description:newTask.description.trim(),
      due_date:newTask.due_at||null,priority:newTask.priority,status:"not_started",completed:false,
    }).select().single();
    if(data){
      setTasks(prev=>({...prev,[selectedProject.id]:[...(prev[selectedProject.id]||[]),data]}));
      setNewTask({description:"",due_at:"",priority:"medium"});
      await logActivity(selectedProject.id,`Task added: "${data.description}"`,{priority:data.priority});
    }
    setSavingTask(false);
  };

  const toggleTask=async(task:any)=>{
    const u={...task,completed:!task.completed};
    await supabase.from("tasks").update({completed:u.completed}).eq("id",task.id);
    setTasks(prev=>({...prev,[task.project_id]:prev[task.project_id].map(t=>t.id===task.id?u:t)}));
    if(u.completed)await logActivity(task.project_id,`Task completed: "${task.description}"`);
  };

  const deleteTask=async(task:any)=>{
    await supabase.from("tasks").delete().eq("id",task.id);
    setTasks(prev=>({...prev,[task.project_id]:prev[task.project_id].filter(t=>t.id!==task.id)}));
  };

  // ── UNIFIED addNote — writes to shared notes table ──
  const addNote=async()=>{
    if(!newNote.trim()||!selectedProject||!user)return;
    setSavingNote(true);
    const now=new Date().toISOString();
    const{data}=await supabase.from("notes").insert({
      user_id:user.id,
      project_id:selectedProject.id,
      body:newNote.trim(),
      source:"pipeline",
      created_at:now,
      updated_at:now,
    }).select().single();
    if(data){
      setNotes(prev=>({...prev,[selectedProject.id]:[data,...(prev[selectedProject.id]||[])]}));
      setNewNote("");
      await logActivity(selectedProject.id,`Note added`,{preview:data.body.slice(0,60)});
    }
    setSavingNote(false);
  };

  const deleteNote=async(note:any)=>{
    await supabase.from("notes").delete().eq("id",note.id).eq("user_id",user.id);
    setNotes(prev=>({...prev,[note.project_id]:prev[note.project_id].filter(n=>n.id!==note.id)}));
  };

  const totalGDV=projects.reduce((s,p)=>s+(p.appraisals?.[0]?.gdv||0),0);
  const avgPoC=(()=>{const v=projects.filter(p=>p.appraisals?.[0]?.profit_on_cost);return v.length?v.reduce((s,p)=>s+(p.appraisals[0].profit_on_cost||0),0)/v.length:0;})();
  const active=projects.filter(p=>p.pipeline_stage!=="completed").length;
  const done=projects.filter(p=>p.pipeline_stage==="completed").length;
  const openTasks=Object.values(tasks).flat().filter(t=>!t.completed).length;

  if(loading)return(
    <div style={{minHeight:"100vh",background:"#06070a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
      <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:22,color:"#c9a84c",letterSpacing:".12em",fontWeight:300}}>VALORA</div>
      <div style={{width:26,height:26,border:"2px solid rgba(201,168,76,.15)",borderTopColor:"#c9a84c",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <div style={{fontSize:11,color:"#3d4249",letterSpacing:".06em"}}>Loading pipeline…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div style={{height:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"var(--font-body)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav className="desktop-nav" style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"0 16px",height:50,display:"flex",alignItems:"center",gap:10,flexShrink:0,zIndex:10}}>
        <button onClick={()=>router.push("/dashboard")} style={{background:"none",border:"none",color:"var(--gold)",fontFamily:"var(--font-display)",fontSize:19,fontWeight:300,cursor:"pointer",letterSpacing:".1em",marginRight:4}}>VALORA</button>
        <div style={{width:1,height:16,background:"var(--border)"}}/>
        <button onClick={()=>router.push("/dashboard")} className="btn-ghost" style={{fontSize:11,padding:"4px 10px"}}>Dashboard</button>
        <button className="btn-ghost" style={{fontSize:11,padding:"4px 10px",borderColor:"var(--gold)",color:"var(--gold)"}}>Pipeline</button>
        <button onClick={()=>router.push("/tasks")} className="btn-ghost" style={{fontSize:11,padding:"4px 10px"}}>Tasks</button>
        <button onClick={()=>router.push("/notes")} className="btn-ghost" style={{fontSize:11,padding:"4px 10px"}}>Notes</button>
        <div style={{flex:1}}/>
        {openTasks>0&&<span style={{fontSize:11,color:"var(--amber)",background:"rgba(240,164,41,.1)",padding:"2px 9px",borderRadius:8,fontFamily:"var(--font-mono)",flexShrink:0}}>{openTasks} open</span>}
      </nav>

      {/* PAGE HEADER */}
      <div style={{padding:"14px 16px 12px",flexShrink:0,borderBottom:"1px solid var(--border)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:12}}>
          <div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:26,fontWeight:300,letterSpacing:".02em",lineHeight:1}}>Deal Pipeline</h1>
            <p style={{fontSize:11,color:"var(--text-d)",marginTop:3}}>{projects.length} deal{projects.length!==1?"s":""} · drag to move stage</p>
          </div>
          <button className="btn-primary" onClick={()=>router.push("/dashboard")}>+ New</button>
        </div>
        <div style={{display:"flex",gap:0,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden"}}>
          {[
            {label:"Active",value:String(active),color:"var(--blue)"},
            {label:"Done",value:String(done),color:"var(--green)"},
            {label:"GDV",value:fmt(totalGDV),color:"var(--gold)"},
            {label:"Avg PoC",value:fmtPct(avgPoC),color:avgPoC>0.2?"var(--green)":avgPoC>0.1?"var(--amber)":"var(--text-m)"},
            {label:"Tasks",value:String(openTasks),color:openTasks>0?"var(--amber)":"var(--text-d)"},
          ].map((s,i,arr)=>(
            <div key={s.label} style={{flex:1,padding:"8px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:2,borderRight:i<arr.length-1?"1px solid var(--border)":"none"}}>
              <span style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".07em"}}>{s.label}</span>
              <span style={{fontFamily:"var(--font-mono)",fontSize:13,fontWeight:600,color:s.color}}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="kanban-board" style={{flex:1,overflowX:"auto",overflowY:"hidden",padding:"14px 16px",display:"flex",gap:10,alignItems:"flex-start",WebkitOverflowScrolling:"touch" as any}}>
        {STAGES.map(stage=>{
          const cols=projects.filter(p=>(p.pipeline_stage||"prospect")===stage.id);
          const gdv=cols.reduce((s,p)=>s+(p.appraisals?.[0]?.gdv||0),0);
          return(
            <div key={stage.id} className={`col-wrap ${dragOverCol===stage.id?"drag-over":""}`}
              style={{height:"100%"}}
              onDragOver={e=>onDragOver(e,stage.id)} onDrop={e=>onDrop(e,stage.id)}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:gdv>0?4:10,flexShrink:0}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:stage.color,flexShrink:0}}/>
                <span style={{fontSize:10,fontWeight:600,color:stage.color,textTransform:"uppercase",letterSpacing:".07em"}}>{stage.label}</span>
                <span style={{fontSize:10,color:"var(--text-d)",background:"var(--bg4)",borderRadius:8,padding:"0 6px",fontFamily:"var(--font-mono)"}}>{cols.length}</span>
              </div>
              {gdv>0&&<div style={{fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)",marginBottom:10}}>{fmt(gdv)}</div>}
              <div style={{flex:1,overflowY:"auto",minHeight:80}}>
                {cols.length===0&&(
                  <div style={{border:"1px dashed var(--border)",borderRadius:7,padding:"14px 8px",textAlign:"center",fontSize:10,color:"var(--text-d)"}}>Drop here</div>
                )}
                {cols.map(project=>{
                  const latest=project.appraisals?.[0];
                  const poc=latest?.profit_on_cost;
                  const sym=CURRENCY_SYMBOLS[project.currency]||"£";
                  const ac=ASSET_COLORS[project.asset_type]||ASSET_COLORS.BTR;
                  const pt=(tasks[project.id]||[]).filter(t=>!t.completed);
                  const pn=(notes[project.id]||[]).length;
                  return(
                    <div key={project.id}
                      className={`deal-card ${draggingId===project.id?"dragging":""} ${selectedProject?.id===project.id?"selected":""}`}
                      draggable onDragStart={e=>onDragStart(e,project)} onDragEnd={onDragEnd}
                      onClick={()=>openPanel(project,"tasks")}>
                      {pt.length>0&&<div className="task-count">{pt.length}</div>}
                      <div style={{marginBottom:6,paddingRight:pt.length>0?22:0}}>
                        <span className="asset-badge" style={{background:ac.bg,color:ac.color}}>{project.asset_type||"BTR"}</span>
                      </div>
                      <div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:1,lineHeight:1.25,fontFamily:"var(--font-display)"}}>{project.name||"Untitled"}</div>
                      <div style={{fontSize:10,color:"var(--text-d)",marginBottom:8}}>{project.location||"—"}</div>
                      {latest?(
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                          <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text-m)"}}>{fmt(latest.gdv,sym)}</span>
                          <span style={{fontFamily:"var(--font-mono)",fontSize:11,fontWeight:600,color:poc>0.2?"var(--green)":poc>0.1?"var(--amber)":"var(--red)"}}>{fmtPct(poc)}</span>
                        </div>
                      ):(
                        <div style={{fontSize:10,color:"var(--text-d)",marginBottom:8}}>No appraisal yet</div>
                      )}
                      {(pt.length>0||pn>0)&&(
                        <div style={{display:"flex",gap:4,marginBottom:8}}>
                          {pt.length>0&&<span style={{fontSize:9,color:"var(--amber)",background:"rgba(240,164,41,.1)",padding:"1px 6px",borderRadius:4}}>✓ {pt.length}</span>}
                          {pn>0&&<span style={{fontSize:9,color:"var(--text-d)",background:"var(--bg4)",padding:"1px 6px",borderRadius:4}}>📝 {pn}</span>}
                        </div>
                      )}
                      <div style={{paddingTop:8,borderTop:"1px solid var(--bg4)",marginBottom:8}} onClick={e=>e.stopPropagation()}>
                        <select value={project.pipeline_stage||"prospect"}
                          onChange={e=>{e.stopPropagation();moveProject(project.id,e.target.value);}}
                          style={{width:"100%",background:"var(--bg4)",border:"1px solid var(--border)",borderRadius:5,color:"var(--text-d)",fontFamily:"var(--font-body)",fontSize:10,padding:"3px 6px",cursor:"pointer",outline:"none"}}>
                          {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                      </div>
                      <div style={{display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
                        <button className="stage-action" onClick={e=>{e.stopPropagation();openPanel(project,"tasks");}}>Tasks</button>
                        <button className="stage-action" onClick={e=>{e.stopPropagation();openPanel(project,"notes");}}>Notes</button>
                        <button className="stage-action" style={{color:"var(--text-d)"}} onClick={e=>{e.stopPropagation();openProject(project);}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--green)";e.currentTarget.style.color="var(--green)";}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-d)";}}>Open →</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={()=>router.push("/dashboard")}
                style={{width:"100%",marginTop:8,padding:"6px",background:"transparent",border:"1px dashed var(--border)",borderRadius:7,color:"var(--text-d)",fontSize:10,cursor:"pointer",fontFamily:"var(--font-body)",flexShrink:0}}
                onMouseEnter={e=>{(e.target as HTMLElement).style.borderColor="var(--gold)";(e.target as HTMLElement).style.color="var(--gold)"}}
                onMouseLeave={e=>{(e.target as HTMLElement).style.borderColor="var(--border)";(e.target as HTMLElement).style.color="var(--text-d)"}}>
                + Add
              </button>
            </div>
          );
        })}
      </div>

      {/* SIDE PANEL */}
      {selectedProject&&(
        <>
          <div className="overlay" onClick={()=>setSelectedProject(null)}/>
          <div className="panel">
            <div style={{padding:"16px 16px 0",borderBottom:"1px solid var(--border)",flexShrink:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div style={{flex:1,minWidth:0,paddingRight:8}}>
                  <div style={{fontFamily:"var(--font-display)",fontSize:19,fontWeight:300,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selectedProject.name||"Untitled"}</div>
                  <div style={{fontSize:11,color:"var(--text-d)",marginTop:1}}>{selectedProject.location||"—"} · {selectedProject.asset_type}</div>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <button className="btn-ghost" style={{fontSize:10,padding:"4px 9px"}} onClick={()=>openProject(selectedProject)}>Open ↗</button>
                  <button onClick={()=>setSelectedProject(null)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:22,lineHeight:1,padding:"0 2px"}}>×</button>
                </div>
              </div>
              <div style={{display:"flex",overflowX:"auto",marginTop:10}}>
                {(["tasks","notes","activity"] as const).map(tab=>(
                  <button key={tab} className={`panel-tab ${panelTab===tab?"active":""}`} onClick={()=>setPanelTab(tab)}>
                    {tab==="tasks"?`Tasks (${(tasks[selectedProject.id]||[]).filter(t=>!t.completed).length})`:tab==="notes"?`Notes (${(notes[selectedProject.id]||[]).length})`:"Activity"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{flex:1,overflowY:"auto",padding:16}}>

              {panelTab==="tasks"&&(
                <div>
                  <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginBottom:18}}>
                    <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>New Task</div>
                    <textarea className="inp" placeholder="Task description…" value={newTask.description}
                      onChange={e=>setNewTask(p=>({...p,description:e.target.value}))}
                      style={{resize:"none",height:64,marginBottom:8,fontFamily:"var(--font-body)"}}/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                      <div>
                        <div style={{fontSize:10,color:"var(--text-d)",marginBottom:3}}>Due date</div>
                        <input className="inp" type="datetime-local" value={newTask.due_at} onChange={e=>setNewTask(p=>({...p,due_at:e.target.value}))} style={{fontSize:11,colorScheme:"dark"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:10,color:"var(--text-d)",marginBottom:3}}>Priority</div>
                        <select className="inp" value={newTask.priority} onChange={e=>setNewTask(p=>({...p,priority:e.target.value}))} style={{fontSize:11,cursor:"pointer"}}>
                          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <button style={{width:"100%",background:"var(--gold)",color:"#06070a",border:"none",borderRadius:7,padding:"9px",fontFamily:"var(--font-body)",fontSize:12,fontWeight:600,cursor:"pointer",opacity:!newTask.description.trim()||savingTask?.6:1}}
                      onClick={addTask} disabled={!newTask.description.trim()||savingTask}>
                      {savingTask?"Adding…":"+ Add Task"}
                    </button>
                  </div>
                  {(tasks[selectedProject.id]||[]).length===0
                    ?<div style={{textAlign:"center",padding:"32px 0",color:"var(--text-d)",fontSize:13}}>No tasks yet</div>
                    :<>
                      {(tasks[selectedProject.id]||[]).filter(t=>!t.completed).map(task=>{
                        const p=PRIORITY_STYLES[task.priority]||PRIORITY_STYLES.medium;
                        const overdue=task.due_at&&new Date(task.due_at)<new Date();
                        return(
                          <div key={task.id} className="task-item">
                            <div style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                              <button onClick={()=>toggleTask(task)} style={{width:17,height:17,borderRadius:4,border:"1.5px solid var(--border-m)",background:"none",cursor:"pointer",flexShrink:0,marginTop:2}}
                                onMouseEnter={e=>(e.currentTarget.style.borderColor="var(--green)")}
                                onMouseLeave={e=>(e.currentTarget.style.borderColor="var(--border-m)")}/>
                              <div style={{flex:1}}>
                                <div style={{fontSize:13,marginBottom:5,lineHeight:1.4}}>{task.description}</div>
                                <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                                  <span className="priority-badge" style={{background:p.bg,color:p.color}}>{p.label}</span>
                                  {task.due_at&&<span style={{fontSize:10,color:overdue?"var(--red)":"var(--text-d)",fontFamily:"var(--font-mono)"}}>{overdue?"⚠ ":""}{fmtDateTime(task.due_at)}</span>}
                                </div>
                              </div>
                              <button onClick={()=>deleteTask(task)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:14,padding:0,flexShrink:0}}
                                onMouseEnter={e=>(e.currentTarget.style.color="var(--red)")}
                                onMouseLeave={e=>(e.currentTarget.style.color="var(--text-d)")}>×</button>
                            </div>
                          </div>
                        );
                      })}
                      {(tasks[selectedProject.id]||[]).filter(t=>t.completed).length>0&&<>
                        <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",margin:"14px 0 8px"}}>Completed</div>
                        {(tasks[selectedProject.id]||[]).filter(t=>t.completed).map(task=>(
                          <div key={task.id} className="task-item done">
                            <div style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                              <button onClick={()=>toggleTask(task)} style={{width:17,height:17,borderRadius:4,border:"1.5px solid var(--green)",background:"var(--green)",cursor:"pointer",flexShrink:0,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                <span style={{color:"#06070a",fontSize:9,fontWeight:700}}>✓</span>
                              </button>
                              <div style={{flex:1,textDecoration:"line-through",fontSize:13,color:"var(--text-d)"}}>{task.description}</div>
                              <button onClick={()=>deleteTask(task)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:14,padding:0}}>×</button>
                            </div>
                          </div>
                        ))}
                      </>}
                    </>
                  }
                </div>
              )}

              {panelTab==="notes"&&(
                <div>
                  <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginBottom:18}}>
                    <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>New Note</div>
                    <textarea className="inp" placeholder="Add a note…" value={newNote} onChange={e=>setNewNote(e.target.value)}
                      style={{resize:"none",height:80,marginBottom:8,fontFamily:"var(--font-body)",lineHeight:1.6}}/>
                    <button style={{width:"100%",background:"var(--gold)",color:"#06070a",border:"none",borderRadius:7,padding:"9px",fontFamily:"var(--font-body)",fontSize:12,fontWeight:600,cursor:"pointer",opacity:!newNote.trim()||savingNote?.6:1}}
                      onClick={addNote} disabled={!newNote.trim()||savingNote}>{savingNote?"Saving…":"+ Add Note"}</button>
                  </div>
                  {(notes[selectedProject.id]||[]).length===0
                    ?<div style={{textAlign:"center",padding:"32px 0",color:"var(--text-d)",fontSize:13}}>No notes yet</div>
                    :(notes[selectedProject.id]||[]).map(note=>(
                      <div key={note.id} className="note-item">
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                          <span style={{fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{fmtDate(note.created_at)}</span>
                          <button onClick={()=>deleteNote(note)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:13,padding:0}}
                            onMouseEnter={e=>(e.currentTarget.style.color="var(--red)")}
                            onMouseLeave={e=>(e.currentTarget.style.color="var(--text-d)")}>×</button>
                        </div>
                        <div style={{fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{note.body}</div>
                      </div>
                    ))
                  }
                </div>
              )}

              {panelTab==="activity"&&(
                <div>
                  {activity.filter(a=>a.project_id===selectedProject.id).length===0
                    ?<div style={{textAlign:"center",padding:"32px 0",color:"var(--text-d)",fontSize:13}}>No activity yet</div>
                    :activity.filter(a=>a.project_id===selectedProject.id).map(act=>(
                      <div key={act.id} className="activity-row">
                        <div style={{width:26,height:26,borderRadius:"50%",background:"var(--bg3)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11}}>
                          {act.action.startsWith("Moved")?"→":act.action.startsWith("Task completed")?"✓":act.action.startsWith("Task added")?"✚":"📝"}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,marginBottom:1}}>{act.action}</div>
                          {act.meta?.preview&&<div style={{fontSize:11,color:"var(--text-d)",fontStyle:"italic"}}>"{act.meta.preview}{act.meta.preview?.length>=60?"…":""}"</div>}
                          <div style={{fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)",marginTop:2}}>{fmtDateTime(act.created_at)}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {/* MOBILE BOTTOM NAV */}
      <nav className="bottom-nav">
        <button className="bottom-nav-item" onClick={()=>router.push("/dashboard")}>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Portfolio
        </button>
        <button className="bottom-nav-item active">
          <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          Pipeline
        </button>
        <button className="bottom-nav-item" onClick={()=>router.push("/tasks")}>
          <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          Tasks
        </button>
        <button className="bottom-nav-item" onClick={()=>router.push("/notes")}>
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Notes
        </button>
        <button className="bottom-nav-item" onClick={async()=>{await supabase.auth.signOut();router.push("/");}}>
          <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </nav>
    </div>
  );
}
