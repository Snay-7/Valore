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
      <img src="data:image/png;base64,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" alt="Valora" style={{height:"32px",width:"auto"}}/>
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
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHMAAABkCAYAAAC1kA/FAAA77klEQVR42rW9aZAk1ZUm+p1zr7tHREbWlgVCIAQIqdACWgBtMJJoLSAk0K4WosdG6hkz9Y+xHus3Uo9Zd//o7h+PZ8+s9cze6/4j/Rn1eyOp26ZBQiAhEEiFgAIBRYGoYimgKKCoJauyKvcMd7/3nPfjXvfwiIzIzAJNlIVVRmRk+HLuPct3vnMOnfOWi2FZYH0Bny/vMKQzAFCIflhIpsBYIEjGYmag2rVI74XBDMh3vbrLvNKUqm5XRRcAiMxBVd1O4t9IRDMEBQB40R1pu/NfmCyUDVQZxhhwCUA9lEsAAiGAYABKABBILYgUgACkUPUAGCAGEQEq4XcAVMOxiAjVQ0Tqn6v3+78XCBSqCoYBkQFJ/ztEBF4ZbBSlX0aSMlQV3gGMSRAZCDwUJYpefploeZlVOsxGZsq8+LZN+C5L/KSqTqnqFAAo00I4tmZKAMEedCqXMNkniXVBRHYAMmlAR1QpNWIPquoUG1eYJHuQaALCBsQOCg+IgjWcL51/wQ6kCeOsqUmFy3elTFcYw/BEIFtdvIKUAQFYGcoKIoQLIYDIQFVBYBiTQNWDQWBDIKL6d6fm5ncdOXbySqEEYAOCAXsGSKAoICRRQNwQJodzYImCjEIjGy4AQdCVIJuPSiDDwhx4cBAmKa8SpodCBSAGwCUUPhxHLZjagCgUBVIruPDCCxXqQKqAeFjLcGVRX3+1sFQVAq0XE8D1OSohCIcZzAwVQD3ANkFvpcDc/NL2lZJmeoUDWQ/vS1hOwPHrbEt7aBHj85++Fuecue2Kdkro9ZbR6XShTPDeg5mRcLh5TBbGEqw1gAEE4eAgC2MMEpOCOew6YwjWhr9rtSdw+OjJK/7if/tvFy+u9PYaaqPwAqIEirAbCRQEQwCRAGpW7brh/4kwUpDNz4wV5KqHQDUsKCEDaBBAkiRY6S1PtVrpjKjAi8CwIEkEvfnp//rZL17z3b/8y7/E3OwJGBBUHAAFVOG9rwUpInDOwUkJ1aBlLLT+XSke8AIlA8DCR+GryfDqoTnc9H/+3zOlZ7SzDMt5D8zhOzyClrJZkmBu9vjfPvy7Xfj8Zz+J48dPIEsI5cpJlGUJYxIQWxhiaOPGMQPGEpjDFwksCIyEE7BBfaONIZBNUJQO77n0Q7j+2quf/O//77/u2rpt4krvFUJRXBRXZjyxKA4oNL6u1KlCiUHx94i/bwrudIRYa44xnyPDKIoCSZLNiFC8dgWxwOdLmNqSLd74lc9g+tB+LC0vAN5DfBnPw4NUIQBIFU4E4hxK78NuJAG7IHhVhZcSKgQlgqhB6RVqge7kG3DrrbdhZSW/OJvo7g1yMTCW4MqGklkpFVl7898/se/ZS14+cgyUpijVgS2h02mBSGEYMAnDZhY2YyQtg6SVIMsyZEmK1CbI2CJlRmIZlg2YBNAS1igS49GZyPD8c8/i6qs/hTe96U3fzfMShpNavWgUYm3XFKCgBUHiwXGHVp9pfnaUgMb9fvjvVQkARxUuo/Y3iAiJbUE8wVAK9YJWylhYnHn1S5+/9ntnnTmF3vICjHowebQzA0gBywDiuTMUlgHLhNQyWqlFK7HIbIJ2kqJlE7RMhozjvTRAlhC63S72PfMsdj+x7/Kk3d3rPAE2gRNF6TBwnaywUJPAUbb3rt88cDjtTEIpQVmW8FIGwYAGVio47gupdkQQBLOBMQaWg0CNIYAEzhXwrofllXl0JlJc+5mrb15cmvs3Tz6sWiKACQoOzk39DKqvFgpJbcM17uSgrhT/Kx9JkqAoHJgtVIDEGJyanf7WBRec80+f+cy1OHL4MDg6aakNNnBiog0RV2uvYHYMrLWwluPTgtMMMCmIExAsiEz/fiYWRBl+cefOZ0U5dSDAGiyvLF6cpK2wGbgvG/YKOLFIks048NL0n/5+3wF0J7dByYRdZywSNuChFU2UBIeBUxibwqYpTGKDUAhQknjzFR4Crw42ZRyefgWfuvYqvOm87TeXbrFLLFG9BhWr4OAAjVKT8f1KgM3nRh+rPi8UnnHxVC+rzxlLKIoCDAIpoN4jSQzKYvl//+pXPn/TRLcNYoZJLExi4aGAYawUJWzWgrEpyASHT8kAbAATPHpPDMcW3mQQ0walXZh0Epy2kbQytCY247EnnsfzLxy9OWl3HvTqkLtlZO10rytKFEXR12wEsBJAbFA4gKh913337b6mLA2MyVDkYWURRY9PFJDg+XGw7xBRCIKeV6Jo08JuMiZ4ua00hWUDqEdveRbqlnDDDZ/70fLS8QVQdBYwqDLWFg+vEsrpCrb+rNIqNTz8ucovsMRI0wSzp2b+4V3veOv2T378o+gtLyGxDAYhtcFsGGMw0WoHxxCDC5OZYTiJOzUJzoc1oCTsUk4tiC2UEhBnuPPO+34Ebt+lZGASBkNrE5Sl6cDCZ8MK70oQLLJ0EseOzHb3PPEMJjqbQpjhHdKEYDnaTiKwAlmShvCDKR5AQOpAcKBoIwwxDBmQBywILSJMtlIsnjqGT3z0/Xjfe3bA50sXExzUC0gBBoPZgNkE94YJyjFcAUOVoDLeFg47QOvt4nGOk6iG42vwNokUzhcgX8DC4Zv/4evYNNkCQ4KQjYUhQmpssPMKWGIk8X0GITEGlinYUEXwL4yDTQQgD2KBtQROGFu3vQH33/8YXjl08p+yZPO9AKDegYkAUVhikCi0EXoxkYIMoErwDkiz7i0PPbTn+sIzOGlBieFVwMzIsgSqCmstvPdIkqRetUQKYg3/k9ZqkZUBx0hNGxYWVgnkHXxvEf/hhi8Bml9mjYYFE3dyPzakehf2bzb3HSQdrz43ukNplfmgegcxh2NbY5AYhmGFK1fwgfdf+u2rPnoFVpbmkNhgCzkKzJANfkb0GwIgEb8PBCITP8cwUCTGQMsc1iiyhKDwyLI25uYd7rzjtzda23mQ2QRHTTWEcET19VPjJrBXB2KGqEKIQSbDq0dPnf3I7n1ob55CCQPTboOtgVeBMaZaBhBILczazafqBhkQJWBqAZqAJQFThixpIeEEi/ML+ND7L8eHP/C+H/QW57+UsADeBS2hWCVAHwU7oBZpNFjQ/NtRghqlbkOs1w/sqyfDhFjOFbDsUBZL3/r3X/8y2gnBF0Xt2FTCDz/b+knKUcBJ1FQMy0lwEJlhoZjIUpB34TjeY3LTVtx55wM4fGxh0iZtKIV4XsHB5oJrO9lc2BzshoaYhwGvgonJye/fvfP+7Sdnl5B0J1E4QZKlcM4FYZLA2r47X+1KROGCCWQYZBhKBJMmcCrR/hgkSQKXF1icn8WNN3wVmdV71RcguBrNCLtztGqkAc92tMrdMFBAleBpYBE0n5lNAF8g7y1c/LGPfuB7H/7gezF36ji6MXRjZtDAdaN2BMmEsI6tCb8jAhnUu0u8h4ogTYPWa09uwsuvTuNXv36AWhNT3xdD8OyDQ8k13gUhgdBgKMWGLMSVSMiDtIguNjAzu/Cbu3c+gHZ7C/JCYqzFUO9gCCAI0sSAjYDYQ1nrJwxDbbgQGIXNGCYxUFI4cSBSpGmKU6dO4e1vvQCf+NgVJ5YXZv/WcrAjAYMNx9TKfmmA1rSKNxUgHQ/VbQzxGVazZnUcKkBRFCAWEMqzb7zxS+j15uGLAuICnhyuGYBBgEAN6vdsGhyXINAoSAPACJQUTDY8jYUDod3dipt/didOzC38V00MShTw2guCM4Cwg8BDWIKAm8JktTAwIDiIz0HkUThBd3Lq3Q898vvJg4eOYtO2M5GXisRmtaqodqRlE57EQa00boiygq1C4MGJgqzUOp5sUE2zs9P44z/+Arqd7AdFvgxVDwMCE0E0gsk0LDSp488BoGGDAl3LC27+LyJIjAFBsLS88P9c/cmr7nzbhW/G7KnpAMM5B5F+aEBxhxJbEDPYGJg0qa+VOexQZq53aZqmsDaBc4LNW8/A3qcPYOd9D19vstb/5aHwKtHEVJalAlUGPeVoMy2Yk3DhFLIIZCxgW1jO6cZf73wYqhlAFgDD2hRsE5gkhVKwBwksLFIkSGGRgikNqy3akCrrkaa2DwFKcAIW5+dw3jln4dPXfOKgK/IvaVztgEQvklapRCB61acZ/A8LbUCQUc3W9kkVqkCe53DOpZ1W8tef/8J1mJudRr6yAFfmcEUJ7xXiGSoGqgYQU9vJxKRIOAkQJ1kYk0R7mcAggWWLhC3KwsOmLRBnuPnmO1EUfFWSpShcDhUCeQMjFuxN/DkFawp4hoEBa0DKGMpwEmK3yrnJS4/CE7LOlu/vfvypyw+8dBhZOglQAjIWSZLUaEbYgf0dYpijSx52K5HCBlwL1tqBNBUD6KQJZk9M49/f8BVMdOyDFDMTTby09pabqa0R4NtGw47B3dtwksAxFRaPC0Wnk6G3PP/opz5+5cKbz9mOYmUR7cRieXkR3geHRUWg4iDONzzuyj6aEH/H2Jtq54jBZCGwSNtdtDtb8dhjT+GhRx6/rdXd9B2hcG4MEzNWBPYE1nDfggAbECgJGFTE9JKG1SUG1qbhUlQBTp78+R33gG0bTqgWovc+GGF2EHagRGFMzDeqD7FndPFFBMzhb8JODbuSASQKlL0FvOGMCdz4tc8dXlice9HEYJvJhosAxZOvvOfgqjPbkeFFP1yiARB+9c8eiaGIozJMlTIThaIEcYk8n8f2bZ13f+3L16I3Pw0UBcq8gLUpvABSOri8B1/mgBQgrbBYiam9EpwoTGrA1oKsgfOKtJUBlmHSDJRkKCXBj/71pzBZ5+/JJHBeA3wID6aYU1JCP8XgIOzhFXAKiBRgRBUoGrBRoaa0DQwnxfPPvfjlR3Y/gU2bpwCy8NpXgzUaFsOVfpzJgFS47ZBjwcH7DSCEIk0Mjh55GV/4/Gfw5nPP+mavtziVGgtXuIHQJ9gxF/YkUzyP8ep0XI5zIOklLgq2r9KNoXhugpWl2We++qXP6rbNbSzOn4R6B8sGRVGgKAp4Xwbb7gPwUT8jYhZSdFLnflUVWacdU1YpPDE6k1PYed/v8NyBV65vdyZ294ocxiTwItGyCGgAqQrerKqv70HUdDLe0wNg0ww2zW751T07b+oVCrYpXClotToI6eX4jywM2cEYi8wqQTIjOgPBq9MINPR6BToTLXz1K9ftdOXc95gUWZb1BcnBoQrhD2CI68T1OEdmrVRYHb8qhWtSgY/f7ZyAycKXrnv++Wd9/+prrsLycg/eEdgaFK4MCQcAzhdwrkDpHUrvQr7SuSBkcfDegzScrzWELEvAHBaRMQZZp4Ne7vDTW2/faW16uwiiZhw85/q6aPA1obL56WgfInwwfNg5hyRt4cVXDl90969/C046ACcQEaRpOiC0piCD85MENsGQl1vtXo7K3xiDLMtwYvoYrrvu43jbhW/a4YpFcJXn8z6wFwxAPNqJGQcarJWrDDcsWZUCI1EkBIjr3fj1r37xu91Ohrm5OSStNpwoer0enHMoXQ7niig8D+di8tmFHeslCLYsS3jvUZaBreClRLvdBpNFd3Irbv/FXThw8ND+rN0JSI9EEMP7sAF0NVo96E8QBAZcv6jVZXQtNNxAJUIhgnZ3y1fu/u2uixZXHFrdzSCYmOYywbYpB89LGKym9mabz6ZAmydikvBZUo9WCvyn/3jDJUW++FeGBSZm4r26OuZ04uH9ePx17d3YvCEGBEZZxp3GYeFkrQT50uKOt1943vc+csXlOH7sFRhOoMLI8xwmsSh6KyjLPAgNvkaPvIaIQCKag5iQVufBKiiKHohCUp5tgiNHZnDzLbfdmLUm/syVGlNuGcQj3NcB3LmfjG+atSr5wOvFZCKAE4aQxcm5pat++audSLNuUFE+BL3Nvx2wjTC11zYsQJBEl4zqzISqYHbmOD5x1ZV4/6Xvuml5/uSX2KCGy4ZVTPgbWhP9GY4fRwo2xs1VKOTLAuJ7X/7qF69H2VtGb2kJTIqyLEMKQfvcqIHFFPO7VYzqvUeRl4BSWDANh2x5uYdWZxI/ufUOvHp05lvGtkAmGUgipEkC04gxK6hUGlBegB89wNq3mTX2V8tZ6hvmFVDTQtre9P3f3LeLXj08jbQ1gXZ7or/zYqoupOuo/rm+AAouet8J4oaKACwBrSwBqWJ5YR5/+qdfA3PvbF8WteoOKjOmjioWwgjcdZStGb0zqc9his5QYghFb+ljl733HTdd+t534uT0MXTSDEXRg4iDKmFxuRd2oEiN6ZZeUYqv3/NO4EoPcQpxirL06PV68N6hLD2MbeHAgVfxs5/fdXaaTd7ohFB6gbLB0tLSeYYZzrmGIKURkEnQhFqxFh1APkgvGFAek1IK+TcFo1RGL5fzfv7LX6EzsRl54QcAZmMIxgQnJ/zPQ7ul6RCF3eahATumkEoyxOgtLePS97wTH/l3l/9j0Vv6Eny4qEDOYxBMbUubWYNx4MB6D+dKIJ4Xk4dlt/iZa67C0vwMypXlYMNcsIHLKz0QmaBCVSECeNcnZfnI7/Fe4ZzAmAzOAVmWxXMWFKVHknbxP//tNkwfn9+VdjYd8RLMlPceWZa9NC4h4Ju2UyPqhkB8477KGJ9NADMK5wFKYLPOSzt/+9A3n3vhZbQ6m+ARKJlKAjKBfunVDUBulfoKuzxgt0kSmAppmsIYU4P4CSewhlHki/jGN76GLJHdhgXiFEwhGVvHi4bXzYo0F1T1c98pCmw8a23w3I3B0sLs37733e949G1vOw9HD78MywbLi0sQCY4NEVCWJZwT5L3wv8uDkyPi4NShVxYoS4+yULhSURYeRVGgVxbIywKtziY8/cyLuOOue6+Y3HLGBYVDYB6AVpms6lybmq5vZgxULAgtqJiQNalXMslYdaQaD2QsFGbhpz+7A5y04HxYjUqBXpG1EtiEayohsQ6lyUxcSah3tHeKVqsF50LM55zD/Pws3n3x2/H5z119cGXx1N+2bAITEq+rEtGnuxMHVDIrRB0sJ1Dn0crwg09/6qNYOHUCKiW8d8EuwQc1K331GnLABBEAXmrP1TkHiVokz3MYY1AUDkQGpScoW/zrv/0My7l8GZSAwCNt/XrXRBEFCq6HgiuwQBswWjP2ZA7Bf2YTMBuUhUeaTdzy8O4nr3n8yWfQ6W6CICBDnFiwCQwBkNRoT1OY1e6obypCWGI4iagOo9VqITEGiwuz+PoNX8CWLemP1ZWACwnxvLcMNgYgWpcLtBaVpIp7DQFSFvD5yseu/ND7Dl5w3lk4fuwwsiSFuAJeSohTqFOoK8MzOKoQ17eTFFV/MydKFFQnwWCl55Blm/Ho7n3Y9bvHL2q1N31HIoW1CtmGgUohrumoEumbkVUQU0cOoBKgYnWcOYyB1rnFePbee3CSQGy265ZbfwmhBEnWgRdGK+ugjIxwYwyq5CQb1LFmP4NPA8F7WZZIkgSAwPsSWZZgcX4O55y9HV/94vXP9pbmv2GJIGVICCepQVmWpwWyr37PB/VuCd710E7NvVd/4iOYPvoKrKE6XpSIu3rnIL6E+LJhG/2AQFUCraX6naqgV+ThvlAGojZuufWX8LA5p22obOTseYBxUTH46/iTAk2Hifo0DAbVJEeJP4kICIq8t9IVX6KVpnCeYLPu4hNP7f/ugw/twURnKwQGXgKzjpM07JzaE6OheJMGTpNEwYnt5wUhKIoCaZpiYf4UvvbHn8fZb9y6AOQgSKQ+FpFstrbNXMuzrV47VyBfnnv04x/7kLZTi8WFOVgbVGQpZYglfRmAdN93dLwPAIDzBcqyRFmE+FcEEVRYgZccIIelxWVMdrdh10N78Pvf77/eJK2XnMRzEq1BixrXrZj8/QKMAZIFazPlEEpuImjAqwxvlStTVRgoLGHRVkVAqijFgpPOP/7kpz+/eWFxBRMTm1F6hPRZzNxbmwLMfXVmzJC6jUADhTKGcMoebIP69GWO3vIStm6ZxA03fOHmudljx1PDNWRmrI2BM42NddfGbsMic0V+2ZvPPfOmK6+4FCemD8NySH1VNI6A7lTITtiJ3ns47wEJT4kIT1kGJEjUBThPenCuQJq2sLxS4ic/uQOi6QxxAOoHzAANqtjxyBUPaDWNVFEeFVsOcmjCz+2EYQnwZTDkDkDamXzp+QMv7/jNb3bB2AzWpiFsiMFzxY/pE6T6J1kBAYYsvFd4X4JYUZQlevlyYNIbA3WKmePT+Nx1n8JFO968d2VlBZYsbGrgfHFaBK5VwEUMd9TLjg9/6NKbISvQ0oViHQQ2XkCbPJwroC7UglQ7z0tUwRL4OyFMqXZtCS8FevkiiqKHVnsC9/32IRw4ePiirD35oI9EOUEg8ATGnoxJ7o1HsoSCJyxIwYEmokPlM9w3tBycowBEK8hwtAUKL4z2xLZ3/+wXd10/v7ASgnkBUhuCfKcyMh1V7VQiCiGKhmSzcw5sIoM8D8lfJsXK0gJSq/iTG796VZ4v/NBYrXOHqn5sdmS1tkEd5/YdIAtj7M5ut1s7LsYQSpeDbZ8tqFGl9oGCgMcWrm8/oR7qHaQsQuK6dFAh2KyF+eUebr7t59cTJ/tBSbjWWBzQpK002QP961oL+AiUUCiBoQKqdiRF1nUjISwi8X2Oz0gjRPDkNOvilen5q392+y+wZbILUoE4D5MkABG8uprcBe7jsIEtwIGLGjFRgwAQu8LH/J2HFCvoZIzpIy/jE1d9GO+95C03Lswe+e/W9mFCga+RGNaQfa/SZX0iFEOU4EUhWsWYMSYmc+S++x89aJMOhDy8Fih9GWNHwPto0+Iurb43qOGA7uT5CkQKqFsBSQkpSpAYFCWj1dmO2+/ciUPHZr5l2m04FVgmkJaN84hsYzLwSrVW5Mi3gmjNvA+QnsAj2lnyFfNCNqSaJKaL+qmXAASUTtHqbvovd/zyV+cfOPgKNm/eAmsDky9JEiRJtgo4qOLW5iqv3XvpM+fVC7I0gNqQAqo9fP3rX4Zhv0CQwBMSGVDbzTrIyvavx3a3NsXRI8cveuGFQ9i0eStWesuh1GIIPFHV2hZWTlB1bcYY5MVKoN7ETEpZKmwygVcPz+CenQ9sb3U3f670ijLafFYMlSxyXcjUP7ZfkyXR50fp+kD7sDfY/GKmQOIlIszMrvzoZ7ffDZN24CMRSpxGHJVBKjW1vnbpG7WJNRyGJo9V0Ov1IlOBcfzoMVx+6bvxgfdf9uf50sKX1LtIkaQacK7sV118JNSnDlHwzCkWuSLWtRhjUJS64/5dv4NJOhANgbxzDuIUYQNQX6ARrguQnYNSyIFCKw/Yw6YpCi9odbfinp27MH1s5kSWtoJqNYAxSQ3anw7gsVYczevFY2sdQFXhyhwkhE2bt1/5q3sfnHx87zNIO10YTkBCUN+A0kigvoQ6hY91i/1d4wfwx5pUJVTHhEWRo8xz3PDHX0bKuteyIDEh/VYJv7Lz/XK9eJkU+b3kB1JgqgonQLszuXf/cwf/7MCLhzDR3YqlpZVgRlylWgEBwamDRxCyetS7syxLMDNKJyC2KFXRntyMF186jN/e99Dl26beSHle1gtTKYAOo+x78/6O8swHiWg85OOOQUpGxWyr3ouOUikWc8vupv/xLz9B1t6MldzVgDRp2BXVyg431gSaYhTiMFAdUm/93eu9R7tlMXvqON7zrh346JUfeDZfXvh6FfIEknHgrkpsdaACUF3OEHyDiqxdXTrH7EQpBOXWrvt3PQ5QG2WhEA94X4bYMu4gkQbCI8GBqnhDwalhlBAs5x6cdXDn3fdhcUW+wTZr7EKJpf5m3RrT9XZrRfMUAsy2rdvWVK+jmj40309NIFd5YiRpeserr7x08O073vaFt114AXrLi6HegjTwX31gqYeioIo8VXnG8f+YWlIfqI4+4rVeHAhA6YIKvfAtF+Lue3Z+s/RUiDKIAGaqqs8xkEAgAORimFUlA2NsHZtcEAzSxE6fmJ6+/fw3n/OtbVu7KFYWQSAQhZxnn0WuIJ8AGnoqiEpk6HkIKbwSOlum8MLBI7j9jp2TWbb5Vi/9fg8BIUsCjKfx+4d241oV4H0KjoFWFXTN5PRGQOnm7q3ed07qAhuTpKBk4p9/8MNbUHoO3Fr1gLiAaypFDzAiKhLirAForNqh8VhJksRdEOKvdmIxf/I4zj/3LFx37ScWoC5CjT4SqWhAPQVmikRAmkebECaQNSgBeCQLj+55CsQtKNmGg+YayI/EMCUABb50EFfUPQsChmNx98770XN0hYOJu7yiweiAWRhFd9nIBhv+mdcDpNf6girJXJ2T8wpOJrDvmef//J7fPICJ7pa4y1xk6gXnp1f2Iq4qq7zF/nFC3rL00mciiKAol9HOLE6dOIbrPn01JjKL1AbAo58asoE8EGPogetSXnXjgjPmIWAk7e7+Z/e/eMn0iTkktlWVCkdqiEAkNp3wAkT7F5LIEpMLCbLWBA4ePIy9+567KWu171IOleEQheGk5g+HKjG/pkDXsqf9z1JfmKO4M03qw/AKqoQSVqnW5GlSQJRg0ol/+uH//MnOk/OLAEKDh/oYxsJ5BcQB0qclNjFHEh0sIIql3t47WBNAcV+u4A3bN+GLn7tWF+dO/JBJkVo75AD5+iaHzDzVcWiFRnEMa0RCHwcvQO7ost27n8REdwvyMuxAZq6zH+IDK6EsV+CLsm4340pB4QQ2mcBtP7/rH03S+r7HEFfXh3QZ1EPUjVSfa0UYq1kVDYh01JcMC3atL+WE0St7sMaEmM8YkMnw8qvH/u7nv/w12hOboBrQnTxfgcYSB1WFK/KBHTkAYEc8lIiQ5znyPG+oJoH4ArOnTuDTn/oozj37zH9WXwSMtHQ1utJ3tmhgV/avUQZUcgiNCN3Jrf984MVXL5+emcfE5BY4FeR5HrzWvIBlExAiExykPM9RekVeOkx0t2LPE0/h0KvHdydp56V+34fmfTM1Q3GjBU4byq2MxCtH2MZxwhwInJkDhEWAcHLwllt/ecWR4yfR7nShFAjTKyt58GR9CRVX0xQr8vCwcPv0kHi8MqSg1DvkS/Poti2+cP3Vd+bLCz9keNgkNH8ovQNbM4R08oji3djAyZcwhmrtsbBcXvbE3ucwsWkrPLheYEQGvvB1qq4oCsBY9IoSniycWtxzz33fZNO6uWLbVShPXU9Z2/PTE+ToaCI8lSTWZ26QDT5Ktws8bJrEVFlg2IkIupu2vnT42Mw/3Pbzu9HqbkGV7nHOwRXlQKVVE/UYF2s11XuFFIl4nDh2CB//2Ifx1vPfdHbeW/wYI4D2VVnEeo2equR7xURkY1CUJbKJzd/ft//FyZnZFaStLkrfhwurPGplPkK6C+h2t+HRR/fh6PTc1WlrYrEJCFSxcsVq59NsQjXObg42GxvDAh+1S0d9WeVtVo5AYkMDqJXlHN1N2668/c6dk888/wpsq4sid+gkGVzRg6Uk8nkCY6DRTCDsUB/SSt7F5LUTFKULDY8CLwIqDr3lBbAU+Px1n7rKF0t/Z2zob+K9D3gsaKANDYb6CdUFtUmrDvxhLIQNFnsOjz3+DLLOVngXPtvr9cBRI1V0ElcKlFLkzmDnfQ9vz9qb/6QsgrNTw6FRM1V4amjx9toaUY0E3OvK6XH8mDWqkps7pbJtWnuUjLL0qbEZTs0v/+O/3HI7smwTjMngnQPHXVrlPisV1oTL6vZkZbmKD+Ndn5nH6nDy+BFc+r5LcPG7dly1tHDqr9I0rRcY1MQamlHV1hw/Z6FKyJJWH3tVgyRtL+595vmLFpcKdLpdFCs9aOT6VJmj0D7NY9Om7Xjokd9jdqH4K6U0UHGGNE5FlwwLkRro1vrt4kZpzOHNx2MJzGskdpuf8T68drHCS52ABEjTVrGSl8gmt/zpfbse2f7Y759C1ppA0VuBIQ91BKit6YXOuX4FVqP4pp+J1wEvuhJ2ZhO4fAXqC3zuuk+DSXJf5EizUEqARhZIg6scAIyhli4acWTvPZx4kDUQTrC4VC7s2/scsrSNsgzt03ysy/RQuJgVml/Oset3j5+ddrrfIU7rcM3EbpmBOxNDFA79IwapIOvTXEYJtarNrB2gtWsx1naAqhK/cIP6YUFooGhBnGE5l7+6+ad3AJSBbRLSSlB4VwT6YH2SBAHFtFNwcqwNzkfRy+EKX69mQaQv9nowhjA7O41LLr4Il77vXd8ti5WPSVnAUGitGEjY0lC0/Xxt1ePIGBNUKIfOWc6HtBSb7MgTe5+9fGnFgW2GpZXg1boiD2q3ADZtPwsPPrwHRanXAzb0RdJBDdCE39aLIDZSKDyGf8A1Obnv7RFGvV+9V/fj0dCfx7uQ0AUcQopBwWQATaDOYKKz7TuPPf70Vb/b8zTsxFZ4TuBcD97nEJfXWKl3FCutktDtSh2868U+CjbWc1QJn1BaX69Uv4TlxWl88bPXoGV0f6qKRAFxZZ2iCvnMWNBECtFexIZLlBLtpTLEVw2rADUJjp9c+PrjTx1Aa/N2rJQeHgpDgMsdsskzcGRmBb9/6tmLsnbr+0QBQbdpirx0IWlQ3fyY2qtqIJtFyhvhKo2KM5Wp7ijGa5W/raWnV/1NI83UDAZUQ9zpxEz9y7/ditIzlgsX6RIC5wuolz4yQwRfQWjqIOL7fV4bMZtWDAnDKMsc1jAWF07hTWdP4YOXv/twb2n+uoSA1BpYE1umsY3prrLOg1YaZYAcpY08JggmbX9379MvbF8pgHZ3EnNLywAIeanYvPVMPLxnH5TtQY09DUR8TUjTusWNb/QieO2PtdSvmdq2fc0/XEvFxhcxT0hArO7tp0ojcO4dUsNPzxw/km6f2vaRSy5+B5bm50B1M17EUnEN7dvExyo0iV2yQteP8NEKAJDw2kusMI6hEQjnX/BWPPTQnj/xYJTeh8JcT7CJhfdFYNrDwKhpEDKoZsNVr0IVuMCQLi4szv5/WzdPvvPcc8/G4vwsvPeYOuONmJ4rcO99D203Jl0MmZXQYcxL1Ye3ctYrQLy6d9WGEfyhHutis2s5RhSzISN3a4xmmUNHL7YJsnb3b3566+3fXF5xNTVTNWZUJCSWpapErivDtJGFX53MrnOYFJyO+bmTOOvMrfijP/qwLsyf/J5hDJTjizgklqNjYldVkY1Udcxodya/8sSTT10llMBmkyiEMbl1Ox7Y9bvDymbGV2TyaH+TJIFERv84xt3r7ci5qhRjoLJog88+83q4VURlU9EvqDWItH6CNRkOH525+rbb7kJ3yxlYyl2j6CZUG6v6WKRTDpTJeW3mFKV+v+KTuqKse8rNzRzFH330/ThzauLvSDwSTupF0y+dQKR59klU0b2vnabaoUPgQJ2YXbh6/4GX0dk8hS1nnIPnDx7Biy+9+tdp0oFI8IattchdGRcyr0Jqmhg0/wE6qw5wkNeC7WgM/X9jKFGMqSp6CAFeCa325J/84q5fn318Zh5ZNgknGrL5UsZwpB+/ldG2VSmj5nGb6E6VzDZkYaDIV5bR7Vp89rOfOLyyvPAP3pcwtp8aq7L96yEsVfmEEuCEkLQ6f7P78acumdh0Bia3vhH3P/ToP6btyX8unYJNFhYm9VkPVA8IiL4Eyap7d7rNp9aijvLpbONRLnJgwffL2yuko/n5LMvgvaJwHknaxuzcyrdv+8U9SNqTEDWBxul93cRJ0Y8jpWpsJP1JBzWWG4UT2m6HFm4hlCyxODeNKz74bpx33lmTRb40xeRBKnClROQpeMR14+KqNkR8zH+GzpMSBwrYJEOSTeD4ydkrXnj5MJ45cAiHjp66y6btsJA4iV0/pO59VMXNFVz4WnbkWqHhqvfecv6FYykKzZ05jurfLJPr0zGkzuQrhdSQNQYJE6AlxOXIEsV/+/Z/1jdsNmANrO/Qv49rgTFZgA1cKf3dpAF7hXgYG6A9FYK4UPtPYcQDVlwP2858Mx545Hn84H/c/Ne2Pfl/kMlQFKHtS+3EGobA1ypw+EYLAdZaiLjQpls9siyFIcXC0goUCZjSmojWv5e+xmOrajOVkIKrioYryuR6yejhtjfjHFMe19RhI05RlRitGATBGfJ1cCxKdWGstRYrRR5uPjOWVvzFt99+N9qdzVhaLkKgLf0+PBVJq8qY1A2ktN9fqN8YwjXSWA6+LGCIcezoIVz+votwwZvP2KFl+UYSgiULeAmDAKqmyDBjW5VWXKUww8RCKEEvd1hYzqEwAAeQIFBIeERFQAQ5/MZCjXGh4LiRHsN1OxsicY3V7Tqot4mHk9wI8Zb62KkLABkIkpk9Tz5Ne59+AZu2noleIfGm8ED3ZfUNG13VSEaQupkrHKxaDlgvQ7C0dBzXfOrKb7p8+SajgtRmIY0lZV0kPC4or4J6jaFWcMAMvAbBamwu1fTgR/VSWI/hOC5i2Aj4Pmjy1gHYxwHxdf0IRtsAUg5kJQVUQnIXAJwKnABZq3OkKOW6n93xKxTC8EggsChciTI2SHLO1fyfACBU+c2yXyLh/RArItIovAeTYHnhFN719rfiXW+/4JtlvriD1I8BDDDoqPAwKlNpG60H8wzshYFE8yCxufkMtSE0sqZkuJZVhwqL1+XNrtVLZ5RuXr3Khl43s/mNi6rUZHWypXi0upO37336+Z17fv8Mtm47A14CPlup5sBNjY6Q83XoUjcXjrQTiALexe5dGCBpGxUsL8zi2qv/CAm5N4rPQ6tV7g+QAcl4QLtJadTBa+wDJ9rPV6rfMFVVCOvi4q8JNBjHDhulZocD9vqrtLkKY0yqAkuAjSMiFBxx1zBhJ2l3b/zlr3buXCkFZLI69quYbNWuC+xyH/va9dNl8GEAjKKMGZGoDkWgziO1CZZm53HBm9+ASy6+cKcrly+zNpbBDfUlAgIr0I8qrZd+9qaZsRi9CPyIHcUD8WwTl+1PnOg/qwzL8PvDzwFNuR7Nb5Tgmmq2ry6G55E04k2S6ERQpPV7JFkomU873SMvHDx0cNeDj6A7uQWlaGjWKxqKh0RDZVXEaivEqXlO/Ri0KqULatgVHuRCQ+KF2Wl88uP/Dq2UTpT5UiwxtKtw2Y3kFCkWCDcrmfvzyGQd+8jDxJ0NEQE28lhFgh6H4K8KUCvdXgPf1CcY192k+s2CDRnYJEBuXsKkAIVCQ8x3z8kTx2YufudF17QThjgHG0Me7wUCgWhs8y1VnNnPRIiGriEBmHCh1lhQ47zWMpaWc5z9pnNxcm7+Lw4eenWnSbsvSX2+VX0yBqq9Y//wwfswpNKkMURnsI1Ns0wveru1Wo12l4G6cn2N8oQ149DGZ3k87trPV1YFs4PdJaWeZzXKGxv+ThFBnpcghPrLqqBHldDKJhYPHT4+tevhPUjaHWjk1xR5XtvB5rGH6Z/e+7oHvGpAm4jT0PAfgC8LZClj5sRRfPLjH8FEJ9kNKcKMFlSdI7nRp8hEMCT2x2ruTpIBvu9gjL2G80i6ZoXAhiKHdTxiXiuTPYqltwooJjPgnSmqaqygWqu6Q9esCo6DbtSHzpSuBJLW1r/5zf0PZ4emT0BjOxd4Fxl8BWIlQwg5YuLXOTcwyqoe1ai2Lg+XGNqQlsh7s9g8meLKD1y6UC7PfqtlHQwF1Qxw4PNGU2GEQU5gJDTspRj4E4U25UKBK9RPyPfzvBUg0BeyrOokEl5SPc+lZtn5vlNXTTmqULbqdfPZXBi8kQzJ6TUaXH+qwQAp2Em4MTbDwnK54ze/fRBpZxNW8rLBIu/33ZGqZUuDLxQmEcSf426vwIaqaCgQqBWzJ6fxwfe/B2dObTooRQ8qDq1WC6KKJEnhGtTRhGPLbPTbumiDh6uCOrGwVuHVOKLzqHBwvfBwLZYen85WHsd830ij3nEnJ42AH+CFxx59+qJDh06i1ZmAk0BN5EbWgWJ1d40FO9+3XiI1R1XE1QToUKIevNHl+Xl0Oxmu/OBld64sz/8wSRL0egWMsYH7YzjiwB4ODh5hysHA9EAimI0U6rzGVNZGQpNR951fzwE34nmt1Qs2YJa1ykyztPNSXtBlv975MEyri7KR8SfRVadck4hFozqSWPbg+i1WxYV22BpacEM9jh56Ce+55CKc84apu1wEMyq1zWzgpARMcKaUhlN+fbVXjQgelXlaqwHjqEkN62WiNvIZs3XL1nUFtxZPZSPGem3UPzhZBHgCYGxn75HDR26/4PyzvzU1tTnMDvERwgOF3ntVd5woJBWJZXuoGykxASJ9gIEAiBcwE8qyQJa1MLlpyxf2PPH01ER36x3eK9iaGu6woYNGECEH9RC+J4xcZjWx/KGisGDdPkSvBQwYtTjGmUM+XUGMa5j4WlM6gQHgYK1F6RVsUjgxUzvvfwScdEGmD7BDNbZXCXBhLaSK6VWv3IY9NRw7McedJR7dVoKFk0fxzredhwvPP+eypfkT32CEJg+ILUub/d9Ho2G64bkpa3FgNzp0bj2GXs2b3ahufi1B7XocIjKoObPGJChVkE5uvuvZA4cvefLpgzA27Xus6mvCWEXN9K5RdORkIHSqvdyYrwzaUmLTfAcpl/CRK953heWyMCggPkdsvV53dW5mhyrwsi/cwdhyHJNuI0D5mhHDGALBWJs5LtYcJ9SNxEPjajqbD++D06FO+2VzbCHU2nvPzge/6Sk0cugXvPabKXlfTQ8Is1mCE0X19wKhnWgr69QcIucCHzdLDRYXTuCtF5yNd1x47o/U9bqs4XdodCoZrCDjug+Cxk7WyuM9/o3OJNtIVmXUAhnepWZq29SGZjiP0+NV0nh1L9fRLvWqxRJL0w0FegZZDtPh2WBxfm52spP8xYUXnIvlxTkwB+Y8GwNxcXJ7xQuKvWOrgeMKhM9ymC4YKq+rknMPawJSpQK84aw3YPeeJ15qtbu7XTW+AxxzCIzaIMcRh0wErvom0PhdNmoBjwtH1gPlN2IzzbatUxtaNePin1Ex6UYcgWbGgaLtCw6ixB4CBkw0NzN9+Mh7LnnX9SI5mIBSfChn12hvvdSwWuA1RkqI9qmNoQ9f+L2xEZHSgCyVrsTUGWfixMz89a8ePr7TJu2XyNj+olSO3xK/vl6AUfs34LixC3YEe2O9z61pmsbseF6vh/lGDrAWYrSuMY8J5oqSSI3G92xTHJ1e3PHgw0+iu2UKS0UP1qSNwp1Qnu7U9RtSaGhxUM0SqacZVHlEtvCKWF0GuGIF+coiPvqRK5Fm9sFKNQ9nIgLExwN5TxlxP4a7dm70Pq53jzcC9fFGPdL1QIFxCMhGCpEqexbgsj6WCzC6m874zv2/23P+ybllJGkbvV4RbWIZk9d+oA/CcEZFY3/36iZX6FH1ZGYsLi7W448LVw4JRKOXK4PMfeXaNq913aM80I0K53QJXRtuUHE6BzqdeKomNlUqOpKyqtFIDgYLy/76+x54DBPdM5HngR9bTdYVSGOyQBxJ6ENX5kBCDgKtbGhRlmH0Mgi9vESv8Gh1JnH/Aw/BCxcCC2NTlL6I7cxC/QwPsShGp/teX5j3WnfvWARoWO2uF7SuZ7Q3WmWmqg1QPGQqRBW5F9j25D89/uTzlxw6dAJT286s+wvU81Eq6r/oQI4TXsJkUN9v8FtRUcQrytKh1e3i6IlTeHr/gcs5bUVBxlJ+NBpcxObnw2V4w10716J1bGQDbAS2G7f5+HRIuOt92bi+CGvFrf0UV8g6VOu9Pl5iIGDkhS12PfgEmG09JbAqa6DYeSf0HIrJ4/jd/ZlcQaAVmy+ERAlsMoFHHnkCudfzREMPBKVQ1idxCgSpDAykAcL8Tx4zi2wjgPtr4fic9s7cSBrstQh+nN2t4kGiMCCOKczpqGA478swszPr7n/2uZevOXDwVXQ2bW1UaVXfLXFaugyUAZTiIz2kz3pwpcCJIm1N4IWDR7D/xVdvbHW33EI2iXWlgcbJcQBsP/wYzRUazOysba5OJxuy3r1bRegapSr7fXR0VYJ5IOMx1HZ0FHF6HJhcvR8aHFHUZAZS91RVMCkoAuaeAUmyu+57+PdP5j6FpwD/CcXB3QqIL2p4UAyhp4qSGLl4FLGyu5+hAWBaeHD3s3/u7eYfr/RcHLvMcL0eLCcgDR3TnTBK8QNzRyJLuO5ZNPysp8nzYIvU1Q4Tx66c/SHmw+BMc9EMbyxLIYXOOqbWpPlFa62MUSmwtVTCWkFyzepTbtRH+khWDuOnyKR4+cjMjc889zKyVjeA7sohhmSCsTZMzYv1kSGejHNATZwSJGGmVzaxCS++fASvTs8+SLYDm4YGFYaBLLWAaBwex/1cyQYbLq0XBaw3cXct5sdatbOsY4a+bBSx3ygsNd5JkIaTMUjfbPJORcKMj9JT9uieJ75feAuiVnR6HPK8QFFK6KmuEiZOhYAS8CXYK3zp4vyVFEItPLznqZucYEc/bJEBaoq1dqSQRgIB3J90OMy53YiDs565Wo80cFr5zD9ExmRdngsNCpVjv1GNY+lUDFrt7u5DR2Z27n36ebQ6m+Gch4FBXnqsFCWEDZyE/nkQAokArozNi4Gy9Ni8bTv2HziCV46e3D7R2fTjZseUZknEcKXYhib+nSZv53Tu+7jNNeDNjnNy1nJ8xgHn6/VPXVUMU/dLDZTp5rDw/nlE4ZBFURJsOvnjh/fsu2pxxcGaFrwXGBtKzkNT3qrxE4EjZbOqX/HEKCXBQ3uePtu2tvyZE204Yf1yP2PCEJzRdMqGXmmOaT4NYa1VDTauQGgk04P7WoFfT5D6h1qlgwy20X8fOpSECa4maeHUfI7de55G2prsd//SuMMM98MeUSScxAbBHpu3nokn9r2A6VNL3zLJRMihRuE1d+Oo7l4bQcI2eg9eC4Cw3pgs3ojDshH6yEarmVZnFmhNclL12sfdZlsZcg/Y1sS9j+995qJjJxcAm6F0OQx5lDG0qHBeiv3bnXOAzTC77PDY3v2TWWvy70snYRbL8MjfeiSGGQFy6wDbblgVj03CD3m7fyhqzqpak3Gg+bAK3qhQT3dlDv6N1Kx1isW8qhLnTcdpQyrwQljqldft238QSdaFEiHLMti6Z17YWZYZRV5CTYLWxCQe3/ccTs31bgRbWJsM8HAre1lPD2wy/EbOSKF1d9nroY1spD62ea/N1i3bhgpm+xOBNpJcXTV1b8zJD6ygRuxVzX0mhM4cVfqQo+1UxIl0iLNIKhIYA2maPDh97Mhd55579n/aurmD3vJisHkxfi2KAj7O/RSTYb4k3HP/HtKku9uYFGVZ1MNyRsFza5XKr+eMjIDaRvseq2ZmrhZa8zyGq8QGJiCOnzUtY+3GRlI142LLNWNNjKnHQLP9SpV8Ds5MLjzz+L7nUXiGkyZ7Pg9Jc5vAE6M1OYU9Tz6Pntgp5dAsODW8rvpaKwwb/v1GkvuvJT02DiId0W3k9fF+Tic8GX8hNNCKQ+OYDKmrpgJMx9TPeyoJlAi2Nbn/+ZdezY5MzyFtTaDwDoUrwsRZAVZKh2Sii5n5Hp49cJg4ac0om5qOSTJcQ7kabhyFvIzLXY67R5XX69GnmrzebMmawjzdfm5r2ctxbPjTWSSjVUZlT2P5AVmsFLTjsSf3P5t7C+cptnExcD5kXSidwO4n9qMU0zWcBCck2ta1NMVGwPPTrZA+HdV8uja2rgJbj/Jwuj1QN5JUrTpVDRAYQ0Kz7vjFGrp+MSgC3lWVWb/TlWWenjkxs7Bl89YvbN0yCV8WgBJ6pUPW3YIjM0vY9ejTZ3Nr8mSYxuGRMsWOIwwM2MbKPutY9kBTwByZ9oLT4xH36yuH/RWsmVlZy1bzRlhgr1Wnr5dVP11EqXLr6yKbqhkjp4Dt/PjJZ1+8SiQFcYperxdiTxg8/PjebzvwpHiq2e/DzsPrCRXGNS7caJvR041Rx30/v1bawlou+lqY7moBjZ4bqUO9AAaz+/331IemT6Y1WRyfXb734CvTsEkHxhLa7QwvvHgIr7x64uyk3dnvVcAIrda8Ak60Rm/WMwdrdZckog3Fka8H4hvVdWRVbF4deK323huxo+t5feM6fK23mKq6/2afVq5wO4TJPcaEbs8ma+Op5w5eUSCFmi68mcCzz7/yZXC6W5yPBUgytu/RyExEI1QZdT3jshvjhD5OU21kMM260wZVpI7jVLTeE0I4bbBgHK1wuLa/eilS4bHcj7Eg0Vw1immHdzv1U1Lee9jUAFICBBydXUj3HTiG97znHXhq3zM4Mbeyv9Vq7wUh9howwRuWwNQLWGwz9KnOhUesfLNKkIHk12fNN+HI5nSJ4fgQ4JEYN43BeddagNX7dqDV6Kq4bn21MHyAJkCwHh1iFNfodHFgiix4iEAN0Gp3792z71l647lv0X37XyZwikjIjb1fY/3lkOO11vVtVA2O+ptxlWH/Kx604/y3NjKIg+qtKZy1vNZxkODoncxjBUkNSuNagh5Y2TF1ZpngpQRr6F2XpimKooDEtm1VB7Cm6q7LIVZ1BcHY6xuliZoDb8ZpptXXMNq/GK5dGbdoRrVi4+Fuka+lMmmcV7tRsOF0KJ7jjl8ULvYaCpjq0tJSLLLlgTmTQq/NKXmt9amnE2e+3sf/D3FvEvLWGrX1AAAAAElFTkSuQmCC" alt="Valora" onClick={()=>router.push("/dashboard")} style={{height:"28px",width:"auto",cursor:"pointer",marginRight:4}}/>
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
