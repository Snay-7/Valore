with open("app/page.tsx", "r") as f:
    content = f.read()

# ─── FIX 1: Add scroll reveal + parallax + interactive demo CSS to CSS block ───
old_css_end = '''@media(max-width:480px){
  .asset-grid{grid-template-columns:1fr !important}
  .stats-grid{grid-template-columns:1fr !important}
}
`;'''

new_css_end = '''@media(max-width:480px){
  .asset-grid{grid-template-columns:1fr !important}
  .stats-grid{grid-template-columns:1fr !important}
}
@keyframes revealUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
@keyframes revealLeft{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
@keyframes revealRight{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.02)}}
.reveal{opacity:0;transition:none}.reveal.visible{animation:revealUp .7s cubic-bezier(.16,1,.3,1) forwards}
.reveal-l{opacity:0}.reveal-l.visible{animation:revealLeft .7s cubic-bezier(.16,1,.3,1) forwards}
.reveal-r{opacity:0}.reveal-r.visible{animation:revealRight .7s cubic-bezier(.16,1,.3,1) forwards}
.card-feature{cursor:default}.card-feature:hover .ficon{transform:scale(1.1);transition:transform .25s}
.price-card{transition:border-color .25s,transform .25s,box-shadow .25s}.price-card:hover{transform:translateY(-4px);box-shadow:0 24px 48px rgba(0,0,0,.4)}
.price-card.featured:hover{box-shadow:0 24px 48px rgba(201,168,76,.15)}
.persona-card{transition:border-color .25s,transform .25s,box-shadow .25s}
.persona-card:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.4)}
.demo-tab{transition:all .2s;cursor:pointer;border-bottom:2px solid transparent;padding:8px 16px;font-size:12px;color:var(--text-d);background:none;border-top:none;border-left:none;border-right:none;font-family:var(--font-body);white-space:nowrap}
.demo-tab.active{color:var(--gold);border-bottom-color:var(--gold)}
.demo-tab:hover{color:var(--text)}
.hero-mouse{transition:transform .1s ease-out}
`;'''

# ─── FIX 2: Add useRef for scroll reveal + parallax + demo state ───
old_useCallback = '''  const toLogin=useCallback(()=>{ setPage("login"); window.scrollTo(0,0); },[]);
  const toPage=useCallback((p:string)=>{ setPage(p); window.scrollTo(0,0); },[]);'''

new_useCallback = '''  const toLogin=useCallback(()=>{ setPage("login"); window.scrollTo(0,0); },[]);
  const toPage=useCallback((p:string)=>{ setPage(p); window.scrollTo(0,0); },[]);

  // Scroll reveal observer
  useEffect(()=>{
    const obs=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("visible"); obs.unobserve(e.target); } });
    },{threshold:0.12,rootMargin:"0px 0px -40px 0px"});
    const els=document.querySelectorAll(".reveal,.reveal-l,.reveal-r");
    els.forEach(el=>obs.observe(el));
    return ()=>obs.disconnect();
  },[page]);'''

# ─── FIX 3: Replace emoji persona pills with clean glyph versions ───
old_pills = '''                {[["◈","Developers"],["◎","Lenders & Banks"],["◉","Investment Managers"],["◫","Valuers & Surveyors"]].map(([icon,label])=>(
                  <span key={label} style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:20,padding:"5px 12px",fontSize:12,color:"var(--text-m)"}}><span style={{color:"var(--gold)",fontSize:10}}>{icon}</span> {label}</span>
                ))}'''

new_pills = '''                {[["◈","Developers"],["◎","Lenders & Banks"],["◉","Investment Managers"],["◫","Valuers & Surveyors"]].map(([icon,label])=>(
                  <span key={label} style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--bg2)",border:"1px solid var(--border-m)",borderRadius:20,padding:"6px 14px",fontSize:12,color:"var(--text-m)",letterSpacing:".02em"}}><span style={{color:"var(--gold)",fontSize:11,fontWeight:300}}>{icon}</span>{label}</span>
                ))}'''

# ─── FIX 4: Add reveal classes to hero div ───
old_hero_badge = '''              <div className="fu" style={{marginBottom:22,animationDelay:".1s"}}><span className="badge">◆ Institutional Development Appraisal Platform</span></div>'''
new_hero_badge = '''              <div className="fu" style={{marginBottom:22,animationDelay:".1s"}}><span className="badge">◆ Deal Intelligence Platform</span></div>'''

# ─── FIX 5: Make workspace demo interactive with tab state ───
old_workspace_tabs = '''              <div style={{display:"flex",gap:0,marginBottom:16,borderBottom:"1px solid var(--border)"}}>
                {["Overview","Tasks","Notes","Activity"].map((t,i)=>(
                  <div key={t} style={{padding:"8px 14px",fontSize:11,color:i===1?"var(--gold)":"var(--text-d)",borderBottom:i===1?"2px solid var(--gold)":"2px solid transparent",cursor:"pointer"}}>{t}</div>
                ))}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[{task:"Review exit yield assumptions",assignee:"JH",due:"2 Apr",status:"Working on it",color:"var(--amber)"},{task:"Confirm build cost with QS",assignee:"PS",due:"4 Apr",status:"Not Started",color:"var(--text-d)"},{task:"Send appraisal to lender",assignee:"MA",due:"5 Apr",status:"Done",color:"var(--green)"},{task:"Update unit mix — 3 bed count",assignee:"SC",due:"3 Apr",status:"Stuck",color:"var(--red)"}].map((item,i)=>(
                  <div key={i} style={{background:"var(--bg3)",borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                    <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:"var(--text)",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.task}</div><div style={{fontSize:10,color:"var(--text-d)"}}>{item.assignee} · {item.due}</div></div>
                    <span style={{fontSize:9,padding:"2px 8px",borderRadius:20,background:item.color+"18",color:item.color,whiteSpace:"nowrap",fontWeight:500}}>{item.status}</span>
                  </div>
                ))}
              </div>'''

new_workspace_tabs = '''              <WorkspaceDemo/>'''

# ─── FIX 6: Add reveal classes to stats section ───
old_stats_section = '''      <section style={{padding:"70px 0",background:"var(--bg1)",borderBottom:"1px solid var(--border)"}}>
        <div className="container">
          <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0}}>
            {STATS.map((s,i)=>(
              <div key={i} style={{textAlign:"center",padding:"20px 0",borderLeft:i>0?"1px solid var(--border)":"none"}}>'''

new_stats_section = '''      <section style={{padding:"70px 0",background:"var(--bg1)",borderBottom:"1px solid var(--border)"}}>
        <div className="container">
          <div className="stats-grid reveal" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0}}>
            {STATS.map((s,i)=>(
              <div key={i} style={{textAlign:"center",padding:"20px 0",borderLeft:i>0?"1px solid var(--border)":"none"}}>'''

# ─── FIX 7: Add reveal to Built For section heading ───
old_builtfor_heading = '''          <div style={{textAlign:"center",marginBottom:52}}>
            <div className="badge" style={{marginBottom:16}}>Built For</div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,48px)",fontWeight:300,lineHeight:1.1,marginBottom:14}}>One platform.<br/><em className="grad-text" style={{fontStyle:"italic"}}>Every professional in the room.</em></h2>
            <p style={{fontSize:15,color:"var(--text-m)",maxWidth:500,margin:"0 auto",lineHeight:1.7}}>Valora is designed for every person who touches a development deal — not just the developer.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {['''

new_builtfor_heading = '''          <div className="reveal" style={{textAlign:"center",marginBottom:52}}>
            <div className="badge" style={{marginBottom:16}}>Built For</div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,48px)",fontWeight:300,lineHeight:1.1,marginBottom:14}}>One platform.<br/><em className="grad-text" style={{fontStyle:"italic"}}>Every professional in the room.</em></h2>
            <p style={{fontSize:15,color:"var(--text-m)",maxWidth:500,margin:"0 auto",lineHeight:1.7}}>Valora is designed for every person who touches a development deal — not just the developer.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {['''

# ─── FIX 8: Update persona card class and icon rendering ───
old_persona_card = '''              <div key={i} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:26,transition:"border-color .25s,transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=persona.color+"55";e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none"}}>
                <div style={{fontSize:20,marginBottom:12,color:persona.color,fontWeight:300}}>{persona.icon}</div>'''

new_persona_card = '''              <div key={i} className="persona-card reveal" style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:26,animationDelay:`${i*0.08}s`}}>
                <div style={{width:40,height:40,borderRadius:10,background:persona.color+"14",border:`1px solid ${persona.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:persona.color,marginBottom:14,fontWeight:300}}>{persona.icon}</div>'''

# ─── FIX 9: Add reveal to features heading ───
old_features_heading = '''          <div style={{textAlign:"center",marginBottom:70}}>
            <div className="badge" style={{marginBottom:20}}>Platform Capabilities</div>'''
new_features_heading = '''          <div className="reveal" style={{textAlign:"center",marginBottom:70}}>
            <div className="badge" style={{marginBottom:20}}>Platform Capabilities</div>'''

# ─── FIX 10: Add reveal to feature cards ───
old_feature_card = '''              <div key={i} className="card-feature">'''
new_feature_card = '''              <div key={i} className="card-feature reveal" style={{animationDelay:`${i*0.05}s`}}>'''

# ─── FIX 11: Add reveal to testimonials ───
old_testi_card = '''              <div key={i} className="testi">'''
new_testi_card = '''              <div key={i} className="testi reveal" style={{animationDelay:`${i*0.07}s`}}>'''

# ─── FIX 12: Add reveal to pricing cards ───
old_price_card = '''              <div key={i} className={`price-card ${plan.featured?"featured":""}`}>'''
new_price_card = '''              <div key={i} className={`price-card ${plan.featured?"featured":""} reveal`} style={{animationDelay:`${i*0.1}s`}}>'''

# ─── Apply all replacements ───
results = []

patches = [
    (old_css_end, new_css_end, "CSS animations"),
    (old_useCallback, new_useCallback, "Scroll reveal observer"),
    (old_pills, new_pills, "Hero pills"),
    (old_hero_badge, new_hero_badge, "Hero badge"),
    (old_workspace_tabs, new_workspace_tabs, "Workspace demo"),
    (old_stats_section, new_stats_section, "Stats reveal"),
    (old_builtfor_heading, new_builtfor_heading, "Built For reveal"),
    (old_persona_card, new_persona_card, "Persona cards"),
    (old_features_heading, new_features_heading, "Features heading"),
    (old_feature_card, new_feature_card, "Feature cards"),
    (old_testi_card, new_testi_card, "Testimonial cards"),
    (old_price_card, new_price_card, "Pricing cards"),
]

for old, new, label in patches:
    if old in content:
        content = content.replace(old, new)
        results.append(f"✅ {label}")
    else:
        results.append(f"❌ {label} not found")

# ─── Add WorkspaceDemo component before the App function ───
workspace_component = '''
function WorkspaceDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Overview","Tasks","Notes","Activity"];
  const taskData = [
    {task:"Review exit yield assumptions",assignee:"JH",due:"2 Apr",status:"Working on it",color:"var(--amber)"},
    {task:"Confirm build cost with QS",assignee:"PS",due:"4 Apr",status:"Not Started",color:"var(--text-d)"},
    {task:"Send appraisal to lender",assignee:"MA",due:"5 Apr",status:"Done",color:"var(--green)"},
    {task:"Update unit mix — 3 bed count",assignee:"SC",due:"3 Apr",status:"Stuck",color:"var(--red)"},
  ];
  const noteData = [
    {note:"Lender confirmed they need DSCR above 1.3× — currently 1.62×, comfortable margin.",author:"JH",time:"2h ago"},
    {note:"QS flagged potential 8% uplift on RC frame. Sensitivity run — still viable at 41% PoC.",author:"PS",time:"5h ago"},
  ];
  const overviewData = [
    {label:"GDV",value:"£208.5m",color:"var(--gold)"},
    {label:"Profit on Cost",value:"43.7%",color:"var(--green)"},
    {label:"IRR (Unlev.)",value:"24.3%",color:"var(--blue)"},
    {label:"DSCR / ICR",value:"1.62×",color:"var(--green)"},
  ];
  return (
    <div>
      <div style={{display:"flex",overflowX:"auto",marginBottom:16,borderBottom:"1px solid var(--border)"}}>
        {tabs.map((t,i)=>(
          <button key={t} className={`demo-tab ${activeTab===i?"active":""}`} onClick={()=>setActiveTab(i)}>{t}</button>
        ))}
      </div>
      {activeTab===0&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {overviewData.map((item,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"var(--bg3)",borderRadius:8}}>
              <span style={{fontSize:12,color:"var(--text-m)"}}>{item.label}</span>
              <span style={{fontSize:13,fontFamily:"var(--font-mono)",fontWeight:600,color:item.color}}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
      {activeTab===1&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {taskData.map((item,i)=>(
            <div key={i} style={{background:"var(--bg3)",borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,color:"var(--text)",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.task}</div>
                <div style={{fontSize:10,color:"var(--text-d)"}}>{item.assignee} · {item.due}</div>
              </div>
              <span style={{fontSize:9,padding:"2px 8px",borderRadius:20,background:item.color+"18",color:item.color,whiteSpace:"nowrap",fontWeight:500}}>{item.status}</span>
            </div>
          ))}
        </div>
      )}
      {activeTab===2&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {noteData.map((item,i)=>(
            <div key={i} style={{background:"var(--bg3)",borderRadius:8,padding:"12px 14px"}}>
              <div style={{fontSize:12,color:"var(--text)",lineHeight:1.6,marginBottom:8}}>{item.note}</div>
              <div style={{fontSize:10,color:"var(--text-d)"}}>{item.author} · {item.time}</div>
            </div>
          ))}
        </div>
      )}
      {activeTab===3&&(
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          {[
            {action:"Moved to Under Offer",user:"JH",time:"1h ago",icon:"→"},
            {action:"Task completed: Send appraisal to lender",user:"MA",time:"3h ago",icon:"✓"},
            {action:"Note added",user:"PS",time:"5h ago",icon:"◆"},
            {action:"Exit yield updated 5.25% → 5.0%",user:"JH",time:"Yesterday",icon:"⟳"},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid var(--bg4)"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:"var(--bg4)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"var(--gold)",flexShrink:0}}>{item.icon}</div>
              <div><div style={{fontSize:12,color:"var(--text-m)"}}>{item.action}</div><div style={{fontSize:10,color:"var(--text-d)",marginTop:2}}>{item.user} · {item.time}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'''

# Insert WorkspaceDemo before App function
if 'export default function App()' in content:
    content = content.replace('export default function App()', workspace_component + 'export default function App()')
    results.append("✅ WorkspaceDemo component added")
else:
    results.append("❌ App function not found")

with open("app/page.tsx", "w") as f:
    f.write(content)

for r in results:
    print(r)
