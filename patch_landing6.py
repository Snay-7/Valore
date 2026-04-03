with open("app/page.tsx", "r") as f:
    content = f.read()

results = []

# ─── FIX 1: Replace emoji persona icons with geometric glyphs ───
emoji_replacements = [
    ('{icon:"🏗",title:"Property Developers"', '{icon:"◈",title:"Property Developers"'),
    ('{icon:"🏦",title:"Lenders & Banks"', '{icon:"◎",title:"Lenders & Banks"'),
    ('{icon:"💼",title:"Investment Managers"', '{icon:"◉",title:"Investment Managers"'),
    ('{icon:"📐",title:"Valuers & Surveyors"', '{icon:"◫",title:"Valuers & Surveyors"'),
    ('{icon:"🤝",title:"JV Partners & Equity"', '{icon:"⊛",title:"JV Partners & Equity"'),
    ('{icon:"🏢",title:"Asset Managers"', '{icon:"⊞",title:"Asset Managers"'),
]

count = 0
for old, new in emoji_replacements:
    if old in content:
        content = content.replace(old, new)
        count += 1
results.append(f"✅ {count}/6 persona emoji icons replaced")

# ─── FIX 2: Replace the entire Built For section with interactive selector ───
old_builtfor = '''      {/* Built For Section */}
      <section style={{padding:"80px 0",background:"var(--bg1)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
        <div className="container">
          <div className="reveal" style={{textAlign:"center",marginBottom:52}}>
            <div className="badge" style={{marginBottom:16}}>Built For</div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,48px)",fontWeight:300,lineHeight:1.1,marginBottom:14}}>One platform.<br/><em className="grad-text" style={{fontStyle:"italic"}}>Every professional in the room.</em></h2>
            <p style={{fontSize:15,color:"var(--text-m)",maxWidth:500,margin:"0 auto",lineHeight:1.7}}>Valora is designed for every person who touches a development deal — not just the developer.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {[
              {icon:"◈",title:"Property Developers",color:"var(--gold)",points:["Run BTR, BTS, Hotel and Flip appraisals in minutes","True monthly cashflows with S-curve drawdown","DSCR, IRR, equity multiple and break-even yield","AI sense check flags issues before credit committee","Share live appraisals with lenders and investors"]},
              {icon:"◎",title:"Lenders & Banks",color:"var(--blue)",points:["Review borrower appraisals on a standardised model","Monthly cashflow shows exact drawdown profile","DSCR and ICR auto-checked against your covenant","Live link — always the latest version of the model","AI sense check flags LTC, yield and cost issues"]},
              {icon:"◉",title:"Investment Managers",color:"var(--green)",points:["Stress test development opportunities before committing","Sensitivity matrices show risk across 45 scenarios","Promote waterfall models JV distributions in real time","Track your portfolio pipeline with Kanban boards","Team workspace keeps your whole team aligned"]},
              {icon:"◫",title:"Valuers & Surveyors",color:"var(--amber)",points:["Residual land value calculated automatically","Exit yield sensitivity with RAG colour coding","SDLT calculated across all modes including SPV","Model stabilisation voids and rent-free periods","Export branded PDF reports for client delivery"]},
              {icon:"⊛",title:"JV Partners & Equity",color:"var(--gold)",points:["3-tier promote waterfall with configurable IRR hurdles","Visual distribution split across all tiers","Scenario-aware — updates as assumptions change","Shared workspace for transparent deal review","Live investor portal — no stale email attachments"]},
              {icon:"⊞",title:"Asset Managers",color:"var(--blue)",points:["Track live developments across your portfolio","Tasks and notes linked directly to each deal","Activity feed logs every update and stage move","Role-based access — control what your team sees","Multi-firm workspace for complex structures"]},
            ].map((persona,i)=>(
              <div key={i} className="persona-card reveal" style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:26,animationDelay:`${i*0.08}s`}}>
                <div style={{width:40,height:40,borderRadius:10,background:persona.color+"14",border:`1px solid ${persona.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:persona.color,marginBottom:14,fontWeight:300}}>{persona.icon}</div>
                <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:500,color:"var(--text)",marginBottom:14}}>{persona.title}</div>
                <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8}}>
                  {persona.points.map((p,j)=>(
                    <li key={j} style={{display:"flex",gap:8,alignItems:"flex-start",fontSize:12,color:"var(--text-m)",lineHeight:1.5}}>
                      <span style={{color:persona.color,fontSize:10,marginTop:3,flexShrink:0}}>✓</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>'''

new_builtfor = '''      {/* Built For Section — Interactive Selector */}
      <BuiltForSection/>'''

if old_builtfor in content:
    content = content.replace(old_builtfor, new_builtfor)
    results.append("✅ Built For section replaced with interactive selector")
else:
    results.append("❌ Built For section not found")

# ─── FIX 3: Fix feature card icons — remove box, just use large glyph ───
old_ficon = '''                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                  <div className="ficon">{f.icon}</div>
                  <span style={{fontSize:9,color:"var(--text-d)",background:"var(--bg4)",padding:"3px 9px",borderRadius:20,letterSpacing:".08em",textTransform:"uppercase",marginTop:2}}>{f.tag}</span>
                </div>'''

new_ficon = '''                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                  <div style={{fontSize:22,color:"var(--gold)",opacity:.8,fontWeight:300,lineHeight:1}}>{f.icon}</div>
                  <span style={{fontSize:9,color:"var(--text-d)",background:"var(--bg4)",padding:"3px 9px",borderRadius:20,letterSpacing:".08em",textTransform:"uppercase",marginTop:2}}>{f.tag}</span>
                </div>'''

if old_ficon in content:
    content = content.replace(old_ficon, new_ficon)
    results.append("✅ Feature card icons updated")
else:
    results.append("❌ Feature card icons not found")

# ─── FIX 4: Add BuiltForSection component before WorkspaceDemo ───
builtfor_component = '''
function BuiltForSection() {
  const [active, setActive] = useState(0);
  const personas = [
    {
      icon:"◈", label:"Developers", color:"var(--gold)",
      headline:"Model any deal with investment-bank rigour",
      desc:"From a £2m house flip to a £500m BTR fund — Valora handles the full complexity of any development project. True monthly cashflows, DSCR checking, promote waterfalls and AI sense check, all in one place.",
      points:[
        ["◆","All 4 asset types","BTR, BTS, Hotel, Flip — each with specialist inputs and metrics"],
        ["◆","True monthly CF","S-curve drawdown with interest rolled on actual drawn balances"],
        ["◆","DSCR / ICR & IRR","Auto-calculated. Flagged before credit committee sees it"],
        ["◆","AI Sense Check","Benchmarks your assumptions against market data in real time"],
        ["◆","Live share links","Investors and lenders always see the latest version"],
      ]
    },
    {
      icon:"◎", label:"Lenders & Banks", color:"var(--blue)",
      headline:"Underwriting you can trust, every time",
      desc:"Valora produces the exact format a senior underwriter needs to approve a development loan. Monthly cashflow shows precise drawdown profile, DSCR checked automatically, and the model is always current.",
      points:[
        ["◆","Standardised model","Every borrower appraisal in one consistent format"],
        ["◆","Drawdown profile","Monthly cashflow shows exactly how the facility is drawn"],
        ["◆","DSCR / ICR auto-checked","Flagged when debt service cover drops below covenant"],
        ["◆","Live link","Always the latest model — no stale email attachments"],
        ["◆","AI Sense Check","LTC, exit yield and build cost issues flagged upfront"],
      ]
    },
    {
      icon:"◉", label:"Investment Managers", color:"var(--green)",
      headline:"Stress test before you commit a single pound",
      desc:"Run 45-scenario sensitivity matrices, model promote waterfalls across IRR hurdles, and track your entire development pipeline from prospect to completion — all from one platform.",
      points:[
        ["◆","45-scenario matrices","Exit yield vs rent — RAG coded, recalculated live"],
        ["◆","Promote waterfall","3-tier with configurable IRR hurdles and visual distribution split"],
        ["◆","Deal pipeline","Kanban board from Prospect through to Completion"],
        ["◆","Team workspace","Your whole team on the same live model"],
        ["◆","Portfolio view","Track GDV, IRR and PoC across all active deals"],
      ]
    },
    {
      icon:"◫", label:"Valuers & Advisors", color:"var(--amber)",
      headline:"RLV, sensitivity and SDLT — all automated",
      desc:"Residual land value updates as you type. Exit yield sensitivity matrices with colour-coded RAG. Full UK SDLT calculator including SPV and mixed-use modes. Branded PDF exports for client delivery.",
      points:[
        ["◆","Live RLV","Residual land value recalculated on every keystroke"],
        ["◆","Sensitivity matrices","Exit yield and rent sensitivity with 45 RAG-coded scenarios"],
        ["◆","Auto SDLT","Full UK banding — residential, commercial, mixed-use, SPV"],
        ["◆","Stabilisation modelling","Void periods and rent-free modelled in the cashflow"],
        ["◆","Branded PDF","Professional export with your firm details for client delivery"],
      ]
    },
  ];
  const p = personas[active];
  return (
    <section style={{padding:"90px 0",background:"var(--bg1)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
      <div className="container">
        <div className="reveal" style={{textAlign:"center",marginBottom:56}}>
          <div className="badge" style={{marginBottom:16}}>Built For</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,48px)",fontWeight:300,lineHeight:1.1,marginBottom:14}}>One platform.<br/><em className="grad-text" style={{fontStyle:"italic"}}>Every professional in the room.</em></h2>
        </div>
        {/* Role selector */}
        <div className="reveal" style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:48}}>
          {personas.map((persona,i)=>(
            <button key={i} onClick={()=>setActive(i)} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:8,border:`1px solid ${active===i?persona.color+"88":"var(--border)"}`,background:active===i?persona.color+"0f":"transparent",color:active===i?persona.color:"var(--text-m)",fontSize:13,fontFamily:"var(--font-body)",cursor:"pointer",transition:"all .2s",fontWeight:active===i?500:400}}>
              <span style={{fontSize:14}}>{persona.icon}</span>
              {persona.label}
            </button>
          ))}
        </div>
        {/* Content panel */}
        <div key={active} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"center",animation:"revealUp .4s cubic-bezier(.16,1,.3,1) forwards"}}>
          <div>
            <div style={{fontSize:11,color:p.color,textTransform:"uppercase",letterSpacing:".1em",marginBottom:14,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{p.icon}</span>{p.label}</div>
            <h3 style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,2.5vw,34px)",fontWeight:300,lineHeight:1.15,marginBottom:18,color:"var(--text)"}}>{p.headline}</h3>
            <p style={{fontSize:14,color:"var(--text-m)",lineHeight:1.8,marginBottom:0}}>{p.desc}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:0,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}>
            {p.points.map(([icon,title,sub],j)=>(
              <div key={j} style={{display:"flex",gap:16,padding:"16px 20px",borderBottom:j<p.points.length-1?"1px solid var(--border)":"none",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="var(--bg3)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span style={{color:p.color,fontSize:9,marginTop:4,flexShrink:0}}>{icon}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:2}}>{title}</div>
                  <div style={{fontSize:12,color:"var(--text-d)",lineHeight:1.5}}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

'''

if 'function WorkspaceDemo()' in content:
    content = content.replace('function WorkspaceDemo()', builtfor_component + 'function WorkspaceDemo()')
    results.append("✅ BuiltForSection component added")
else:
    results.append("❌ WorkspaceDemo not found to insert before")

# ─── FIX 5: Add mobile CSS for built for section ───
old_mobile_css = '''  .support-grid{grid-template-columns:1fr !important}
  .hero-btns{flex-direction:column !important}
  .hero-btns button{width:100%}
  .cta-btns{flex-direction:column !important;align-items:center}'''

new_mobile_css = '''  .support-grid{grid-template-columns:1fr !important}
  .hero-btns{flex-direction:column !important}
  .hero-btns button{width:100%}
  .cta-btns{flex-direction:column !important;align-items:center}
  .builtfor-grid{grid-template-columns:1fr !important;gap:24px !important}'''

if old_mobile_css in content:
    content = content.replace(old_mobile_css, new_mobile_css)
    results.append("✅ Mobile CSS for built for added")
else:
    results.append("❌ Mobile CSS target not found")

with open("app/page.tsx", "w") as f:
    f.write(content)

for r in results:
    print(r)
