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
html,body{height:100%}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased;overflow-x:hidden}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:7px 14px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:7px;padding:8px 16px;font-family:var(--font-body);font-size:12px;font-weight:600;cursor:pointer;transition:background .2s;white-space:nowrap}
.btn-primary:hover{background:var(--gold-l)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.deal-card{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:8px;cursor:grab;transition:border-color .2s,box-shadow .2s,transform .15s;animation:fadeIn .2s ease;user-select:none;position:relative}
.deal-card:hover{border-color:var(--gold-border);box-shadow:0 4px 20px rgba(0,0,0,.4)}
.deal-card.dragging{opacity:.5;transform:scale(.97);cursor:grabbing}
.column{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;min-height:160px;flex:1;min-width:210px;max-width:260px;transition:background .2s;flex-shrink:0}
.column.drag-target{background:rgba(201,168,76,.05);border-color:var(--gold-border)}
.column-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.stage-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.asset-badge{font-size:9px;padding:2px 7px;border-radius:4px;font-weight:600;letter-spacing:.04em;font-family:var(--font-body)}
.inp{width:100%;padding:9px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font-body);font-size:12px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold)}
.inp::placeholder{color:var(--text-d)}
.panel{position:fixed;top:0;right:0;width:min(420px,100vw);height:100vh;background:var(--bg1);border-left:1px solid var(--border-m);z-index:50;display:flex;flex-direction:column;animation:slideIn .2s ease;overflow:hidden}
.panel-tab{padding:10px 14px;font-size:11px;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;font-family:var(--font-body);background:none;border-top:none;border-left:none;border-right:none;color:var(--text-d);text-transform:uppercase;letter-spacing:.06em;white-space:nowrap}
.panel-tab.active{color:var(--gold);border-bottom-color:var(--gold)}
.task-item{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;transition:border-color .2s}
.task-item:hover{border-color:var(--border-m)}
.task-item.done{opacity:.5}
.note-item{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px}
.activity-item{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--bg4)}
.priority-badge{font-size:9px;padding:2px 7px;border-radius:4px;font-weight:600;font-family:var(--font-body);letter-spacing:.04em}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:49;backdrop-filter:blur(2px)}
.task-count{position:absolute;top:10px;right:10px;background:var(--gold);color:#06070a;border-radius:10px;padding:1px 6px;font-size:9px;font-weight:700;font-family:var(--font-mono)}
.stats-bar{display:flex;gap:0;padding:0;background:var(--bg2);border:1px solid var(--border);border-radius:10px;overflow:hidden;flex-wrap:wrap}
.stat-item{display:flex;flex-direction:column;gap:3px;padding:12px 20px;border-right:1px solid var(--border);flex:1;min-width:90px}
.stat-item:last-child{border-right:none}
.board-wrap{flex:1;overflow-x:auto;overflow-y:hidden;padding:0 20px 24px;-webkit-overflow-scrolling:touch}
.board-inner{display:flex;gap:10px;height:100%;min-width:max-content;padding-bottom:4px}
@media(max-width:768px){
  .nav-links{display:none}
  .board-wrap{padding:0 12px 20px}
  .page-header{padding:16px 12px 12px !important}
  .stats-bar{flex-wrap:wrap}
  .stat-item{min-width:calc(50% - 1px);border-bottom:1px solid var(--border)}
  .panel{width:100vw;border-left:none;border-top:1px solid var(--border-m)}
  .column{min-width:200px;max-width:220px}
  .header-actions{flex-direction:column;align-items:flex-start !important;gap:12px !important}
}
`;

const fmt=(n:number,prefix="£")=>{
  if(!n||!isFinite(n)||isNaN(n))return"—";
  const abs=Math.abs(n);
  if(abs>=1e9)return`${prefix}${(n/1e9).toFixed(2)}bn`;
  if(abs>=1e6)return`${prefix}${(n/1e6).toFixed(2)}m`;
  if(abs>=1e3)return`${prefix}${(n/1e3).toFixed(0)}k`;
  return`${prefix}${n.toFixed(0)}`;
};
const fmtPct=(n:number)=>(!n||!isFinite(n)||isNaN(n)?"—":`${(n*100).toFixed(1)}%`);
const fmtDate=(d:string)=>new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"});
const fmtDateTime=(d:string)=>new Date(d).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});

const CURRENCY_SYMBOLS:Record<string,string>={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"};

const STAGES=[
  {id:"prospect",      label:"Prospect",        color:"#7d8590",dot:"#7d8590"},
  {id:"feasibility",   label:"Feasibility",     color:"#f0a429",dot:"#f0a429"},
  {id:"under_offer",   label:"Under Offer",     color:"#5b9cf6",dot:"#5b9cf6"},
  {id:"in_development",label:"In Development",  color:"#c9a84c",dot:"#c9a84c"},
  {id:"completed",     label:"Completed",       color:"#3ddc84",dot:"#3ddc84"},
];

const ASSET_COLORS:Record<string,{bg:string;color:string}>={
  BTR:{bg:"rgba(201,168,76,.12)",color:"#c9a84c"},
  BTS:{bg:"rgba(91,156,246,.12)",color:"#5b9cf6"},
  Hotel:{bg:"rgba(240,164,41,.12)",color:"#f0a429"},
  Flip:{bg:"rgba(61,220,132,.1)",color:"#3ddc84"},
};

const PRIORITY_STYLES:Record<string,{bg:string;color:string;label:string}>={
  low:    {bg:"rgba(125,133,144,.15)",color:"#7d8590",label:"Low"},
  medium: {bg:"rgba(91,156,246,.15)", color:"#5b9cf6",label:"Medium"},
  high:   {bg:"rgba(240,164,41,.15)", color:"#f0a429",label:"High"},
  urgent: {bg:"rgba(244,100,95,.15)", color:"#f4645f",label:"Urgent"},
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
      supabase.from("projects").select(`*, appraisals(id,gdv,profit,profit_on_cost,irr_unlevered,status,created_at)`).eq("created_by",userId).is("deleted_at",null).order("created_at",{ascending:false}),
      supabase.from("tasks").select("*").or(`created_by.eq.${userId},assigned_to.eq.${userId}`).order("created_at",{ascending:false}),
      supabase.from("notes").select("*").eq("created_by",userId).order("created_at",{ascending:false}),
      supabase.from("activity").select("*").eq("created_by",userId).order("created_at",{ascending:false}).limit(50),
    ]);
    setProjects(projData||[]);
    const taskMap:Record<string,any[]>={};
    (taskData||[]).forEach(t=>{if(!taskMap[t.project_id])taskMap[t.project_id]=[];taskMap[t.project_id].push(t);});
    setTasks(taskMap);
    const noteMap:Record<string,any[]>={};
    (noteData||[]).forEach(n=>{if(!noteMap[n.project_id])noteMap[n.project_id]=[];noteMap[n.project_id].push(n);});
    setNotes(noteMap);
    setActivity(actData||[]);
    setLoading(false);
  };

  const logActivity=async(projectId:string,action:string,meta?:any)=>{
    if(!user)return;
    const{data:newAct}=await supabase.from("activity").insert({project_id:projectId,created_by:user.id,action,meta}).select().single();
    if(newAct)setActivity(prev=>[newAct,...prev].slice(0,50));
  };

  const moveProject=async(projectId:string,newStage:string)=>{
    const project=projects.find(p=>p.id===projectId);
    const oldStage=project?.pipeline_stage||"prospect";
    if(oldStage===newStage)return;
    setProjects(prev=>prev.map(p=>p.id===projectId?{...p,pipeline_stage:newStage}:p));
    await supabase.from("projects").update({pipeline_stage:newStage}).eq("id",projectId);
    await logActivity(projectId,`Moved to ${STAGES.find(s=>s.id===newStage)?.label||newStage}`,{from:oldStage,to:newStage});
  };

  const onDragStart=(e:React.DragEvent,project:any)=>{dragItem.current=project;setDraggingId(project.id);e.dataTransfer.effectAllowed="move";};
  const onDragEnd=()=>{setDraggingId(null);setDragOverCol(null);};
  const onDragOver=(e:React.DragEvent,stageId:string)=>{e.preventDefault();setDragOverCol(stageId);};
  const onDrop=(e:React.DragEvent,stageId:string)=>{
    e.preventDefault();
    if(dragItem.current&&dragItem.current.pipeline_stage!==stageId)moveProject(dragItem.current.id,stageId);
    setDraggingId(null);setDragOverCol(null);dragItem.current=null;
  };

  const openPanel=(project:any,tab:"tasks"|"notes"|"activity"="tasks")=>{setSelectedProject(project);setPanelTab(tab);};
  const openProject=(project:any)=>{
    const latest=project.appraisals?.[0];
    if(latest)router.push(`/appraisal?project=${project.id}&appraisal=${latest.id}`);
    else router.push(`/appraisal?project=${project.id}`);
  };

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
    const updated={...task,completed:!task.completed};
    await supabase.from("tasks").update({completed:updated.completed}).eq("id",task.id);
    setTasks(prev=>({...prev,[task.project_id]:prev[task.project_id].map(t=>t.id===task.id?updated:t)}));
    if(updated.completed)await logActivity(task.project_id,`Task completed: "${task.description}"`);
  };

  const deleteTask=async(task:any)=>{
    await supabase.from("tasks").delete().eq("id",task.id);
    setTasks(prev=>({...prev,[task.project_id]:prev[task.project_id].filter(t=>t.id!==task.id)}));
  };

  const addNote=async()=>{
    if(!newNote.trim()||!selectedProject||!user)return;
    setSavingNote(true);
    const{data}=await supabase.from("notes").insert({
      project_id:selectedProject.id,created_by:user.id,content:newNote.trim(),
    }).select().single();
    if(data){
      setNotes(prev=>({...prev,[selectedProject.id]:[data,...(prev[selectedProject.id]||[])]}));
      setNewNote("");
      await logActivity(selectedProject.id,`Note added`,{preview:data.content.slice(0,60)});
    }
    setSavingNote(false);
  };

  const deleteNote=async(note:any)=>{
    await supabase.from("notes").delete().eq("id",note.id);
    setNotes(prev=>({...prev,[note.project_id]:prev[note.project_id].filter(n=>n.id!==note.id)}));
  };

  const totalGDV=projects.reduce((s,p)=>s+(p.appraisals?.[0]?.gdv||0),0);
  const avgPoC=(()=>{const valid=projects.filter(p=>p.appraisals?.[0]?.profit_on_cost);if(!valid.length)return 0;return valid.reduce((s,p)=>s+(p.appraisals[0].profit_on_cost||0),0)/valid.length;})();
  const active=projects.filter(p=>p.pipeline_stage!=="completed").length;
  const completed=projects.filter(p=>p.pipeline_stage==="completed").length;
  const totalTasks=Object.values(tasks).flat().filter(t=>!t.completed).length;

  if(loading)return(
    <div style={{minHeight:"100vh",background:"#06070a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:24,color:"#c9a84c",letterSpacing:".12em",fontWeight:300}}>VALORA</div>
      <div style={{width:28,height:28,border:"2px solid rgba(201,168,76,.15)",borderTopColor:"#c9a84c",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <div style={{fontSize:11,color:"#3d4249",letterSpacing:".06em"}}>Loading pipeline…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",height:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"var(--font-body)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"0 20px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,position:"sticky",top:0,zIndex:40}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>router.push("/dashboard")} style={{background:"none",border:"none",color:"var(--gold)",fontFamily:"var(--font-display)",fontSize:20,fontWeight:300,cursor:"pointer",letterSpacing:".1em"}}>VALORA</button>
          <div style={{width:1,height:18,background:"var(--border)"}}/>
          <div className="nav-links" style={{display:"flex",gap:6}}>
            <button onClick={()=>router.push("/dashboard")} className="btn-ghost" style={{fontSize:11,padding:"5px 10px"}}>Dashboard</button>
            <button className="btn-ghost" style={{fontSize:11,padding:"5px 10px",borderColor:"var(--gold)",color:"var(--gold)"}}>Pipeline</button>
            <button onClick={()=>router.push("/tasks")} className="btn-ghost" style={{fontSize:11,padding:"5px 10px"}}>Tasks</button>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {totalTasks>0&&(
            <span style={{fontSize:11,color:"var(--amber)",fontFamily:"var(--font-mono)",background:"rgba(240,164,41,.1)",padding:"3px 10px",borderRadius:10,whiteSpace:"nowrap"}}>
              {totalTasks} open
            </span>
          )}
          <span style={{fontSize:11,color:"var(--text-d)",fontFamily:"var(--font-mono)",display:"none"}} className="user-email">{user?.email}</span>
        </div>
      </nav>

      {/* Page header */}
      <div className="page-header" style={{padding:"20px 20px 16px",flexShrink:0}}>
        <div className="header-actions" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16,gap:12}}>
          <div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:32,fontWeight:300,marginBottom:3,letterSpacing:".02em"}}>Deal Pipeline</h1>
            <p style={{fontSize:12,color:"var(--text-d)"}}>{projects.length} project{projects.length!==1?"s":""} · drag cards to move stage · click for tasks & notes</p>
          </div>
          <button className="btn-primary" onClick={()=>router.push("/dashboard")}>+ New Appraisal</button>
        </div>

        {/* Stats bar */}
        <div className="stats-bar">
          {[
            {label:"Active",value:active.toString(),color:"var(--blue)"},
            {label:"Completed",value:completed.toString(),color:"var(--green)"},
            {label:"Total GDV",value:fmt(totalGDV),color:"var(--gold)"},
            {label:"Avg PoC",value:fmtPct(avgPoC),color:avgPoC>0.2?"var(--green)":avgPoC>0.1?"var(--amber)":"var(--text-m)"},
            {label:"Open Tasks",value:totalTasks.toString(),color:totalTasks>0?"var(--amber)":"var(--text-d)"},
          ].map(s=>(
            <div key={s.label} className="stat-item">
              <span style={{fontSize:9,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em"}}>{s.label}</span>
              <span style={{fontFamily:"var(--font-mono)",fontSize:16,fontWeight:600,color:s.color}}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban board — scrolls horizontally, fills remaining height */}
      <div className="board-wrap">
        <div className="board-inner">
          {STAGES.map(stage=>{
            const stageProjects=projects.filter(p=>(p.pipeline_stage||"prospect")===stage.id);
            const stageGDV=stageProjects.reduce((s,p)=>s+(p.appraisals?.[0]?.gdv||0),0);
            return(
              <div key={stage.id} className={`column ${dragOverCol===stage.id?"drag-target":""}`}
                onDragOver={e=>onDragOver(e,stage.id)} onDrop={e=>onDrop(e,stage.id)}
                style={{display:"flex",flexDirection:"column"}}>
                <div className="column-header">
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div className="stage-dot" style={{background:stage.dot}}/>
                    <span style={{fontSize:10,fontWeight:600,color:stage.color,textTransform:"uppercase",letterSpacing:".07em"}}>{stage.label}</span>
                    <span style={{fontSize:10,color:"var(--text-d)",background:"var(--bg4)",borderRadius:10,padding:"1px 6px",fontFamily:"var(--font-mono)"}}>{stageProjects.length}</span>
                  </div>
                </div>
                {stageGDV>0&&<div style={{fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)",marginBottom:10,marginTop:-6}}>{fmt(stageGDV)}</div>}

                <div style={{flex:1,overflowY:"auto",minHeight:100}}>
                  {stageProjects.length===0&&(
                    <div style={{border:"1px dashed var(--border)",borderRadius:8,padding:"16px 10px",textAlign:"center",fontSize:11,color:"var(--text-d)"}}>Drop here</div>
                  )}
                  {stageProjects.map(project=>{
                    const latest=project.appraisals?.[0];
                    const poc=latest?.profit_on_cost;
                    const pocColor=poc>0.2?"var(--green)":poc>0.1?"var(--amber)":poc?"var(--red)":"var(--text-d)";
                    const sym=CURRENCY_SYMBOLS[project.currency]||"£";
                    const assetColor=ASSET_COLORS[project.asset_type]||ASSET_COLORS.BTR;
                    const projectTasks=(tasks[project.id]||[]).filter(t=>!t.completed);
                    const projectNotes=(notes[project.id]||[]).length;
                    const isSelected=selectedProject?.id===project.id;

                    return(
                      <div key={project.id}
                        className={`deal-card ${draggingId===project.id?"dragging":""}`}
                        style={{borderColor:isSelected?"var(--gold)":"undefined"}}
                        draggable
                        onDragStart={e=>onDragStart(e,project)}
                        onDragEnd={onDragEnd}
                        onClick={()=>openPanel(project,"tasks")}
                      >
                        {projectTasks.length>0&&<div className="task-count">{projectTasks.length}</div>}

                        <div style={{marginBottom:6,paddingRight:projectTasks.length>0?24:0}}>
                          <span className="asset-badge" style={{background:assetColor.bg,color:assetColor.color}}>{project.asset_type||"BTR"}</span>
                        </div>
                        <div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:2,lineHeight:1.3,fontFamily:"var(--font-display)"}}>{project.name||"Untitled"}</div>
                        <div style={{fontSize:11,color:"var(--text-d)",marginBottom:8}}>{project.location||"No location"}</div>

                        {latest?(
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                            <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text-m)"}}>{fmt(latest.gdv,sym)}</span>
                            <span style={{fontFamily:"var(--font-mono)",fontSize:11,fontWeight:600,color:pocColor}}>{fmtPct(poc)}</span>
                          </div>
                        ):(
                          <div style={{fontSize:10,color:"var(--text-d)",marginBottom:8}}>No appraisal yet</div>
                        )}

                        <div style={{display:"flex",gap:4,marginBottom:8}}>
                          {projectTasks.length>0&&<span style={{fontSize:9,color:"var(--amber)",background:"rgba(240,164,41,.1)",padding:"1px 6px",borderRadius:4}}>✓ {projectTasks.length}</span>}
                          {projectNotes>0&&<span style={{fontSize:9,color:"var(--text-d)",background:"var(--bg4)",padding:"1px 6px",borderRadius:4}}>📝 {projectNotes}</span>}
                        </div>

                        <div style={{paddingTop:8,borderTop:"1px solid var(--bg4)"}}>
                          <select value={project.pipeline_stage||"prospect"}
                            onChange={e=>{e.stopPropagation();moveProject(project.id,e.target.value);}}
                            onClick={e=>e.stopPropagation()}
                            style={{width:"100%",background:"var(--bg4)",border:"1px solid var(--border)",borderRadius:5,color:"var(--text-d)",fontFamily:"var(--font-body)",fontSize:10,padding:"3px 6px",cursor:"pointer",outline:"none"}}>
                            {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </div>

                        <div style={{display:"flex",gap:4,marginTop:8}} onClick={e=>e.stopPropagation()}>
                          <button onClick={e=>{e.stopPropagation();openPanel(project,"tasks");}}
                            style={{flex:1,padding:"5px 0",background:"var(--bg4)",border:"1px solid var(--border)",borderRadius:5,color:"var(--text-m)",fontSize:10,cursor:"pointer",fontFamily:"var(--font-body)",transition:"all .2s"}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold)";e.currentTarget.style.color="var(--gold)";}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-m)";}}>
                            Tasks {projectTasks.length>0&&`(${projectTasks.length})`}
                          </button>
                          <button onClick={e=>{e.stopPropagation();openPanel(project,"notes");}}
                            style={{flex:1,padding:"5px 0",background:"var(--bg4)",border:"1px solid var(--border)",borderRadius:5,color:"var(--text-m)",fontSize:10,cursor:"pointer",fontFamily:"var(--font-body)",transition:"all .2s"}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--blue)";e.currentTarget.style.color="var(--blue)";}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-m)";}}>
                            Notes
                          </button>
                          <button onClick={e=>{e.stopPropagation();openProject(project);}}
                            style={{flex:1,padding:"5px 0",background:"var(--bg4)",border:"1px solid var(--border)",borderRadius:5,color:"var(--text-m)",fontSize:10,cursor:"pointer",fontFamily:"var(--font-body)",transition:"all .2s"}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--green)";e.currentTarget.style.color="var(--green)";}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-m)";}}>
                            Open →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button onClick={()=>router.push("/dashboard")}
                  style={{width:"100%",marginTop:8,padding:"7px",background:"transparent",border:"1px dashed var(--border)",borderRadius:8,color:"var(--text-d)",fontSize:11,cursor:"pointer",fontFamily:"var(--font-body)",transition:"all .2s",flexShrink:0}}
                  onMouseEnter={e=>{(e.target as HTMLElement).style.borderColor="var(--gold)";(e.target as HTMLElement).style.color="var(--gold)"}}
                  onMouseLeave={e=>{(e.target as HTMLElement).style.borderColor="var(--border)";(e.target as HTMLElement).style.color="var(--text-d)"}}>
                  + Add deal
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SIDE PANEL */}
      {selectedProject&&(
        <>
          <div className="overlay" onClick={()=>setSelectedProject(null)}/>
          <div className="panel">
            <div style={{padding:"18px 20px 0",borderBottom:"1px solid var(--border)",flexShrink:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div style={{flex:1,minWidth:0,paddingRight:8}}>
                  <div style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:300,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selectedProject.name||"Untitled"}</div>
                  <div style={{fontSize:11,color:"var(--text-d)",marginTop:2}}>{selectedProject.location||"No location"} · {selectedProject.asset_type}</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                  <button className="btn-ghost" style={{fontSize:10,padding:"4px 10px"}} onClick={()=>openProject(selectedProject)}>Open ↗</button>
                  <button onClick={()=>setSelectedProject(null)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:22,lineHeight:1,padding:"0 2px"}}>×</button>
                </div>
              </div>
              <div style={{display:"flex",gap:0,marginTop:10,overflowX:"auto"}}>
                {(["tasks","notes","activity"] as const).map(tab=>(
                  <button key={tab} className={`panel-tab ${panelTab===tab?"active":""}`} onClick={()=>setPanelTab(tab)}>
                    {tab==="tasks"?`Tasks (${(tasks[selectedProject.id]||[]).filter(t=>!t.completed).length})`:tab==="notes"?`Notes (${(notes[selectedProject.id]||[]).length})`:"Activity"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{flex:1,overflowY:"auto",padding:20}}>
              {/* TASKS */}
              {panelTab==="tasks"&&(
                <div>
                  <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:16,marginBottom:20}}>
                    <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>New Task</div>
                    <textarea className="inp" placeholder="Task description…" value={newTask.description}
                      onChange={e=>setNewTask(p=>({...p,description:e.target.value}))}
                      style={{resize:"none",height:70,marginBottom:10,fontFamily:"var(--font-body)"}}/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                      <div>
                        <div style={{fontSize:10,color:"var(--text-d)",marginBottom:4}}>Due date</div>
                        <input className="inp" type="datetime-local" value={newTask.due_at}
                          onChange={e=>setNewTask(p=>({...p,due_at:e.target.value}))} style={{fontSize:11,colorScheme:"dark"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:10,color:"var(--text-d)",marginBottom:4}}>Priority</div>
                        <select className="inp" value={newTask.priority} onChange={e=>setNewTask(p=>({...p,priority:e.target.value}))} style={{fontSize:11,cursor:"pointer"}}>
                          <option value="low">Low</option><option value="medium">Medium</option>
                          <option value="high">High</option><option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <button className="btn-primary" onClick={addTask} disabled={!newTask.description.trim()||savingTask} style={{width:"100%",justifyContent:"center",display:"flex"}}>
                      {savingTask?"Adding…":"+ Add Task"}
                    </button>
                  </div>
                  {(tasks[selectedProject.id]||[]).length===0?(
                    <div style={{textAlign:"center",padding:"40px 0",color:"var(--text-d)",fontSize:13}}>No tasks yet</div>
                  ):(
                    <>
                      {(tasks[selectedProject.id]||[]).filter(t=>!t.completed).map(task=>{
                        const p=PRIORITY_STYLES[task.priority]||PRIORITY_STYLES.medium;
                        const isOverdue=task.due_at&&new Date(task.due_at)<new Date();
                        return(
                          <div key={task.id} className="task-item">
                            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                              <button onClick={()=>toggleTask(task)} style={{width:18,height:18,borderRadius:4,border:"1.5px solid var(--border-m)",background:"none",cursor:"pointer",flexShrink:0,marginTop:1,transition:"all .2s"}}
                                onMouseEnter={e=>(e.currentTarget.style.borderColor="var(--green)")}
                                onMouseLeave={e=>(e.currentTarget.style.borderColor="var(--border-m)")}/>
                              <div style={{flex:1}}>
                                <div style={{fontSize:13,color:"var(--text)",marginBottom:6,lineHeight:1.4}}>{task.description}</div>
                                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                                  <span className="priority-badge" style={{background:p.bg,color:p.color}}>{p.label}</span>
                                  {task.due_at&&<span style={{fontSize:10,color:isOverdue?"var(--red)":"var(--text-d)",fontFamily:"var(--font-mono)"}}>{isOverdue?"⚠ ":""}{fmtDateTime(task.due_at)}</span>}
                                </div>
                              </div>
                              <button onClick={()=>deleteTask(task)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:14,padding:0,flexShrink:0}}
                                onMouseEnter={e=>(e.currentTarget.style.color="var(--red)")}
                                onMouseLeave={e=>(e.currentTarget.style.color="var(--text-d)")}>×</button>
                            </div>
                          </div>
                        );
                      })}
                      {(tasks[selectedProject.id]||[]).filter(t=>t.completed).length>0&&(
                        <div>
                          <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",margin:"16px 0 8px"}}>Completed</div>
                          {(tasks[selectedProject.id]||[]).filter(t=>t.completed).map(task=>(
                            <div key={task.id} className="task-item done">
                              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                                <button onClick={()=>toggleTask(task)} style={{width:18,height:18,borderRadius:4,border:"1.5px solid var(--green)",background:"var(--green)",cursor:"pointer",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                  <span style={{color:"#06070a",fontSize:10,fontWeight:700}}>✓</span>
                                </button>
                                <div style={{flex:1,textDecoration:"line-through",fontSize:13,color:"var(--text-d)"}}>{task.description}</div>
                                <button onClick={()=>deleteTask(task)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:14,padding:0}}>×</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* NOTES */}
              {panelTab==="notes"&&(
                <div>
                  <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:16,marginBottom:20}}>
                    <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>New Note</div>
                    <textarea className="inp" placeholder="Add a note about this deal…" value={newNote}
                      onChange={e=>setNewNote(e.target.value)}
                      style={{resize:"none",height:90,marginBottom:10,fontFamily:"var(--font-body)",lineHeight:1.6}}/>
                    <button className="btn-primary" onClick={addNote} disabled={!newNote.trim()||savingNote} style={{width:"100%",justifyContent:"center",display:"flex"}}>
                      {savingNote?"Saving…":"+ Add Note"}
                    </button>
                  </div>
                  {(notes[selectedProject.id]||[]).length===0?(
                    <div style={{textAlign:"center",padding:"40px 0",color:"var(--text-d)",fontSize:13}}>No notes yet</div>
                  ):(
                    (notes[selectedProject.id]||[]).map(note=>(
                      <div key={note.id} className="note-item">
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                          <span style={{fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{fmtDate(note.created_at)}</span>
                          <button onClick={()=>deleteNote(note)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:13,padding:0}}
                            onMouseEnter={e=>(e.currentTarget.style.color="var(--red)")}
                            onMouseLeave={e=>(e.currentTarget.style.color="var(--text-d)")}>×</button>
                        </div>
                        <div style={{fontSize:13,color:"var(--text)",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{note.content}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ACTIVITY */}
              {panelTab==="activity"&&(
                <div>
                  {activity.filter(a=>a.project_id===selectedProject.id).length===0?(
                    <div style={{textAlign:"center",padding:"40px 0",color:"var(--text-d)",fontSize:13}}>No activity yet</div>
                  ):(
                    activity.filter(a=>a.project_id===selectedProject.id).map((act)=>(
                      <div key={act.id} className="activity-item">
                        <div style={{width:28,height:28,borderRadius:"50%",background:"var(--bg3)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12}}>
                          {act.action.startsWith("Moved")?"→":act.action.startsWith("Task completed")?"✓":act.action.startsWith("Task added")?"✚":act.action.startsWith("Note")?"📝":"·"}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,color:"var(--text)",marginBottom:2}}>{act.action}</div>
                          {act.meta?.preview&&<div style={{fontSize:11,color:"var(--text-d)",fontStyle:"italic"}}>"{act.meta.preview}{act.meta.preview?.length>=60?"…":""}"</div>}
                          <div style={{fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)",marginTop:3}}>{fmtDateTime(act.created_at)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
