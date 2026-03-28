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
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:7px 16px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:7px;padding:8px 18px;font-family:var(--font-body);font-size:12px;font-weight:600;cursor:pointer;transition:background .2s}
.btn-primary:hover{background:var(--gold-l)}
.deal-card{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:8px;cursor:grab;transition:border-color .2s,box-shadow .2s,transform .15s;animation:fadeIn .2s ease;user-select:none}
.deal-card:hover{border-color:var(--gold-border);box-shadow:0 4px 20px rgba(0,0,0,.4)}
.deal-card.dragging{opacity:.5;transform:scale(.97);cursor:grabbing}
.deal-card.drag-over{border-color:var(--gold);box-shadow:0 0 0 2px rgba(201,168,76,.2)}
.column{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px;min-height:200px;flex:1;min-width:200px;transition:background .2s}
.column.drag-target{background:rgba(201,168,76,.05);border-color:var(--gold-border)}
.column-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.stage-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.asset-badge{font-size:9px;padding:2px 8px;border-radius:4px;font-weight:600;letter-spacing:.04em;font-family:var(--font-body)}
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

const CURRENCY_SYMBOLS:Record<string,string>={GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$",JPY:"¥",CHF:"Fr",CAD:"C$",HKD:"HK$"};

const STAGES=[
  {id:"prospect",    label:"Prospect",       color:"#7d8590",dot:"#7d8590"},
  {id:"feasibility", label:"Feasibility",    color:"#f0a429",dot:"#f0a429"},
  {id:"under_offer", label:"Under Offer",    color:"#5b9cf6",dot:"#5b9cf6"},
  {id:"in_development",label:"In Development",color:"#c9a84c",dot:"#c9a84c"},
  {id:"completed",   label:"Completed",      color:"#3ddc84",dot:"#3ddc84"},
];

const ASSET_COLORS:Record<string,{bg:string;color:string}>={
  BTR:{bg:"rgba(201,168,76,.12)",color:"#c9a84c"},
  BTS:{bg:"rgba(91,156,246,.12)",color:"#5b9cf6"},
  Hotel:{bg:"rgba(240,164,41,.12)",color:"#f0a429"},
  Flip:{bg:"rgba(61,220,132,.1)",color:"#3ddc84"},
};

export default function PipelinePage(){
  const router=useRouter();
  const[user,setUser]=useState<any>(null);
  const[projects,setProjects]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[draggingId,setDraggingId]=useState<string|null>(null);
  const[dragOverCol,setDragOverCol]=useState<string|null>(null);
  const dragItem=useRef<any>(null);

  useEffect(()=>{
    const init=async()=>{
      const{data:{session}}=await supabase.auth.getSession();
      if(!session){router.push("/");return;}
      setUser(session.user);
      await loadProjects(session.user.id);
    };
    init();
  },[router]);

  const loadProjects=async(userId:string)=>{
    setLoading(true);
    const{data}=await supabase
      .from("projects")
      .select(`*, appraisals(id,gdv,profit,profit_on_cost,irr_unlevered,status,created_at)`)
      .eq("created_by",userId)
      .order("created_at",{ascending:false});
    setProjects(data||[]);
    setLoading(false);
  };

  const moveProject=async(projectId:string,newStage:string)=>{
    setProjects(prev=>prev.map(p=>p.id===projectId?{...p,pipeline_stage:newStage}:p));
    await supabase.from("projects").update({pipeline_stage:newStage}).eq("id",projectId);
  };

  /* Drag handlers */
  const onDragStart=(e:React.DragEvent,project:any)=>{
    dragItem.current=project;
    setDraggingId(project.id);
    e.dataTransfer.effectAllowed="move";
  };
  const onDragEnd=()=>{setDraggingId(null);setDragOverCol(null);};
  const onDragOver=(e:React.DragEvent,stageId:string)=>{e.preventDefault();setDragOverCol(stageId);};
  const onDrop=(e:React.DragEvent,stageId:string)=>{
    e.preventDefault();
    if(dragItem.current&&dragItem.current.pipeline_stage!==stageId){
      moveProject(dragItem.current.id,stageId);
    }
    setDraggingId(null);setDragOverCol(null);dragItem.current=null;
  };

  const openProject=(project:any)=>{
    const latest=project.appraisals?.[0];
    if(latest)router.push(`/appraisal?project=${project.id}&appraisal=${latest.id}`);
    else router.push(`/appraisal?project=${project.id}`);
  };

  // Stats
  const totalGDV=projects.reduce((s,p)=>s+(p.appraisals?.[0]?.gdv||0),0);
  const avgPoC=(()=>{
    const valid=projects.filter(p=>p.appraisals?.[0]?.profit_on_cost);
    if(!valid.length)return 0;
    return valid.reduce((s,p)=>s+(p.appraisals[0].profit_on_cost||0),0)/valid.length;
  })();
  const active=projects.filter(p=>p.pipeline_stage!=="completed").length;
  const completed=projects.filter(p=>p.pipeline_stage==="completed").length;

  if(loading)return(
    <div style={{minHeight:"100vh",background:"#06070a",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:32,height:32,border:"2px solid rgba(201,168,76,.2)",borderTopColor:"#c9a84c",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"var(--font-body)",display:"flex",flexDirection:"column"}}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"0 32px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <button onClick={()=>router.push("/dashboard")} style={{background:"none",border:"none",color:"var(--gold)",fontFamily:"var(--font-display)",fontSize:20,fontWeight:300,cursor:"pointer",letterSpacing:".1em"}}>VALORA</button>
          <div style={{width:1,height:18,background:"var(--border)"}}/>
          <button onClick={()=>router.push("/dashboard")} className="btn-ghost" style={{fontSize:11}}>Dashboard</button>
          <button className="btn-ghost" style={{fontSize:11,borderColor:"var(--gold)",color:"var(--gold)"}}>Pipeline</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:11,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{user?.email}</span>
        </div>
      </nav>

      {/* Header */}
      <div style={{padding:"28px 32px 20px",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}>
          <div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:36,fontWeight:300,marginBottom:4,letterSpacing:".02em"}}>Deal Pipeline</h1>
            <p style={{fontSize:13,color:"var(--text-d)"}}>{projects.length} project{projects.length!==1?"s":""} · drag cards to update stage</p>
          </div>
          <button className="btn-primary" onClick={()=>router.push("/dashboard")}>+ New Appraisal</button>
        </div>

        {/* Stats bar */}
        <div style={{display:"flex",gap:24,padding:"12px 20px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10}}>
          {[
            {label:"Active",value:active.toString(),color:"var(--blue)"},
            {label:"Completed",value:completed.toString(),color:"var(--green)"},
            {label:"Total GDV",value:fmt(totalGDV),color:"var(--gold)"},
            {label:"Avg PoC",value:fmtPct(avgPoC),color:avgPoC>0.2?"var(--green)":avgPoC>0.1?"var(--amber)":"var(--text-m)"},
          ].map(s=>(
            <div key={s.label} style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:11,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".07em"}}>{s.label}</span>
              <span style={{fontFamily:"var(--font-mono)",fontSize:14,fontWeight:600,color:s.color}}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      <div style={{flex:1,overflowX:"auto",padding:"0 32px 32px"}}>
        <div style={{display:"flex",gap:12,minWidth:"fit-content",height:"100%"}}>
          {STAGES.map(stage=>{
            const stageProjects=projects.filter(p=>(p.pipeline_stage||"prospect")===stage.id);
            const stageGDV=stageProjects.reduce((s,p)=>s+(p.appraisals?.[0]?.gdv||0),0);
            return(
              <div
                key={stage.id}
                className={`column ${dragOverCol===stage.id?"drag-target":""}`}
                style={{width:220,flexShrink:0}}
                onDragOver={e=>onDragOver(e,stage.id)}
                onDrop={e=>onDrop(e,stage.id)}
              >
                {/* Column header */}
                <div className="column-header">
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div className="stage-dot" style={{background:stage.dot}}/>
                    <span style={{fontSize:11,fontWeight:600,color:stage.color,textTransform:"uppercase",letterSpacing:".07em"}}>{stage.label}</span>
                    <span style={{fontSize:11,color:"var(--text-d)",background:"var(--bg4)",borderRadius:10,padding:"1px 7px",fontFamily:"var(--font-mono)"}}>{stageProjects.length}</span>
                  </div>
                </div>
                {stageGDV>0&&(
                  <div style={{fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)",marginBottom:12,marginTop:-8}}>
                    {fmt(stageGDV)} GDV
                  </div>
                )}

                {/* Cards */}
                <div style={{minHeight:120}}>
                  {stageProjects.length===0&&(
                    <div style={{border:"1px dashed var(--border)",borderRadius:8,padding:"20px 12px",textAlign:"center",fontSize:11,color:"var(--text-d)"}}>
                      Drop here
                    </div>
                  )}
                  {stageProjects.map(project=>{
                    const latest=project.appraisals?.[0];
                    const poc=latest?.profit_on_cost;
                    const pocColor=poc>0.2?"var(--green)":poc>0.1?"var(--amber)":poc?"var(--red)":"var(--text-d)";
                    const sym=CURRENCY_SYMBOLS[project.currency]||"£";
                    const assetColor=ASSET_COLORS[project.asset_type]||ASSET_COLORS.BTR;
                    return(
                      <div
                        key={project.id}
                        className={`deal-card ${draggingId===project.id?"dragging":""}`}
                        draggable
                        onDragStart={e=>onDragStart(e,project)}
                        onDragEnd={onDragEnd}
                        onClick={()=>openProject(project)}
                      >
                        {/* Asset type badge */}
                        <div style={{marginBottom:8}}>
                          <span className="asset-badge" style={{background:assetColor.bg,color:assetColor.color}}>
                            {project.asset_type||"BTR"}
                          </span>
                        </div>

                        {/* Project name */}
                        <div style={{fontSize:14,fontWeight:500,color:"var(--text)",marginBottom:2,lineHeight:1.3,fontFamily:"var(--font-display)",letterSpacing:".01em"}}>
                          {project.name||"Untitled"}
                        </div>
                        <div style={{fontSize:11,color:"var(--text-d)",marginBottom:12}}>{project.location||"No location"}</div>

                        {/* Metrics */}
                        {latest?(
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-m)"}}>{fmt(latest.gdv,sym)}</span>
                            <span style={{fontFamily:"var(--font-mono)",fontSize:12,fontWeight:600,color:pocColor}}>{fmtPct(poc)}</span>
                          </div>
                        ):(
                          <div style={{fontSize:10,color:"var(--text-d)"}}>No appraisal yet</div>
                        )}

                        {/* Stage selector — quick move */}
                        <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--bg4)"}}>
                          <select
                            value={project.pipeline_stage||"prospect"}
                            onChange={e=>{e.stopPropagation();moveProject(project.id,e.target.value);}}
                            onClick={e=>e.stopPropagation()}
                            style={{width:"100%",background:"var(--bg4)",border:"1px solid var(--border)",borderRadius:5,color:"var(--text-d)",fontFamily:"var(--font-body)",fontSize:10,padding:"3px 6px",cursor:"pointer",outline:"none"}}
                          >
                            {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add to this stage */}
                <button
                  onClick={()=>router.push("/dashboard")}
                  style={{width:"100%",marginTop:8,padding:"8px",background:"transparent",border:"1px dashed var(--border)",borderRadius:8,color:"var(--text-d)",fontSize:11,cursor:"pointer",fontFamily:"var(--font-body)",transition:"all .2s"}}
                  onMouseEnter={e=>{(e.target as HTMLElement).style.borderColor="var(--gold)";(e.target as HTMLElement).style.color="var(--gold)"}}
                  onMouseLeave={e=>{(e.target as HTMLElement).style.borderColor="var(--border)";(e.target as HTMLElement).style.color="var(--text-d)"}}
                >+ Add deal</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}