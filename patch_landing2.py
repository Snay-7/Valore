with open("app/page.tsx", "r") as f:
    content = f.read()

# Fix 1: Update hero headline and subheadline
old_hero = '''              <h1 className="fu" style={{fontFamily:"var(--font-display)",fontSize:"clamp(44px,5vw,72px)",fontWeight:300,lineHeight:1.06,marginBottom:28,letterSpacing:"-.01em",animationDelay:".2s"}}>
                The appraisal platform<br/><em className="grad-text" style={{fontStyle:"italic"}}>serious developers</em><br/>actually use
              </h1>
              <p className="fu" style={{fontSize:17,color:"var(--text-m)",lineHeight:1.75,maxWidth:500,marginBottom:36,animationDelay:".3s"}}>
                Model BTR, BTS, hotel and residential flip projects with investment-bank rigour. True monthly cash flows, live benchmark curves, DSCR checking, team workspace, AI sense check — all in one platform.
              </p>'''

new_hero = '''              <h1 className="fu" style={{fontFamily:"var(--font-display)",fontSize:"clamp(40px,5vw,68px)",fontWeight:300,lineHeight:1.06,marginBottom:20,letterSpacing:"-.01em",animationDelay:".2s"}}>
                The deal intelligence platform<br/>for <em className="grad-text" style={{fontStyle:"italic"}}>property professionals</em>
              </h1>
              <p className="fu" style={{fontSize:17,color:"var(--text-m)",lineHeight:1.75,maxWidth:520,marginBottom:24,animationDelay:".3s"}}>
                Whether you're developing, lending, investing or advising — Valora gives you institutional-grade appraisals, live cashflows, and team collaboration in one place.
              </p>
              {/* Who it's for */}
              <div className="fu" style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:32,animationDelay:".35s"}}>
                {[["🏗","Developers"],["🏦","Lenders & Banks"],["💼","Investment Managers"],["📐","Valuers & Surveyors"]].map(([icon,label])=>(
                  <span key={label} style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:20,padding:"5px 12px",fontSize:12,color:"var(--text-m)"}}>{icon} {label}</span>
                ))}
              </div>
              {/* 3 benefit statements */}
              <div className="fu" style={{display:"flex",flexDirection:"column",gap:10,marginBottom:32,animationDelay:".38s"}}>
                {[
                  ["◈","Model any deal","BTR, BTS, Hotel, Flip. True monthly cashflows, DSCR, IRR, sensitivity matrices."],
                  ["⟳","Share with confidence","Live links for investors and lenders. They always see the latest version."],
                  ["◫","Work as a team","Shared workspace, tasks, notes and role permissions — everyone on the same deal."],
                ].map(([icon,title,desc])=>(
                  <div key={title} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <span style={{color:"var(--gold)",fontSize:14,marginTop:1,flexShrink:0}}>{icon}</span>
                    <span style={{fontSize:14,color:"var(--text-m)"}}><strong style={{color:"var(--text)",fontWeight:500}}>{title}</strong> — {desc}</span>
                  </div>
                ))}
              </div>'''

# Fix 2: Add "Built for" persona section before features section
old_features_section = '''      <section id="features" className="section">'''

new_features_section = '''      {/* Built For Section */}
      <section style={{padding:"80px 0",background:"var(--bg1)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
        <div className="container">
          <div style={{textAlign:"center",marginBottom:52}}>
            <div className="badge" style={{marginBottom:16}}>Built For</div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,48px)",fontWeight:300,lineHeight:1.1,marginBottom:14}}>One platform.<br/><em className="grad-text" style={{fontStyle:"italic"}}>Every professional in the room.</em></h2>
            <p style={{fontSize:15,color:"var(--text-m)",maxWidth:500,margin:"0 auto",lineHeight:1.7}}>Valora is designed for every person who touches a development deal — not just the developer.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {[
              {icon:"🏗",title:"Property Developers",color:"var(--gold)",points:["Run BTR, BTS, Hotel and Flip appraisals in minutes","True monthly cashflows with S-curve drawdown","DSCR, IRR, equity multiple and break-even yield","AI sense check flags issues before credit committee","Share live appraisals with lenders and investors"]},
              {icon:"🏦",title:"Lenders & Banks",color:"var(--blue)",points:["Review borrower appraisals on a standardised model","Monthly cashflow shows exact drawdown profile","DSCR and ICR auto-checked against your covenant","Live link — always the latest version of the model","AI sense check flags LTC, yield and cost issues"]},
              {icon:"💼",title:"Investment Managers",color:"var(--green)",points:["Stress test development opportunities before committing","Sensitivity matrices show risk across 45 scenarios","Promote waterfall models JV distributions in real time","Track your portfolio pipeline with Kanban boards","Team workspace keeps your whole team aligned"]},
              {icon:"📐",title:"Valuers & Surveyors",color:"var(--amber)",points:["Residual land value calculated automatically","Exit yield sensitivity with RAG colour coding","SDLT calculated across all modes including SPV","Model stabilisation voids and rent-free periods","Export branded PDF reports for client delivery"]},
              {icon:"🤝",title:"JV Partners & Equity",color:"var(--gold)",points:["3-tier promote waterfall with configurable IRR hurdles","Visual distribution split across all tiers","Scenario-aware — updates as assumptions change","Shared workspace for transparent deal review","Live investor portal — no stale email attachments"]},
              {icon:"🏢",title:"Asset Managers",color:"var(--blue)",points:["Track live developments across your portfolio","Tasks and notes linked directly to each deal","Activity feed logs every update and stage move","Role-based access — control what your team sees","Multi-firm workspace for complex structures"]},
            ].map((persona,i)=>(
              <div key={i} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:26,transition:"border-color .25s,transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=persona.color+"55";e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none"}}>
                <div style={{fontSize:28,marginBottom:12}}>{persona.icon}</div>
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
      </section>

      <section id="features" className="section">'''

results = []

if old_hero in content:
    content = content.replace(old_hero, new_hero)
    results.append("✅ Hero updated")
else:
    results.append("❌ Hero not found")

if old_features_section in content:
    content = content.replace(old_features_section, new_features_section)
    results.append("✅ Built For section added")
else:
    results.append("❌ Features section not found")

with open("app/page.tsx", "w") as f:
    f.write(content)

for r in results:
    print(r)
