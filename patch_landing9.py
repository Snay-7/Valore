with open("app/page.tsx", "r") as f:
    content = f.read()

results = []

old = '''          <div style={{display:"flex",flexDirection:"column",gap:0,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}>
            {p.points.map(([icon,title,sub],j)=>(
              <div key={j} style={{display:"flex",gap:16,padding:"16px 20px",borderBottom:j<p.points.length-1?"1px solid var(--border)":"none",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="var(--bg3)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span style={{color:p.color,fontSize:9,marginTop:4,flexShrink:0}}>{icon}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:2}}>{title}</div>
                  <div style={{fontSize:12,color:"var(--text-d)",lineHeight:1.5}}>{sub}</div>
                </div>
              </div>
            ))}
          </div>'''

new = '''          <div style={{display:"flex",flexDirection:"column",paddingTop:8}}>
            {p.points.map(([icon,title,sub],j)=>(
              <div key={j} style={{display:"flex",gap:14,padding:"14px 0",borderBottom:j<p.points.length-1?"1px solid var(--border)":"none"}}>
                <span style={{color:p.color,fontSize:8,marginTop:5,flexShrink:0}}>◆</span>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:3}}>{title}</div>
                  <div style={{fontSize:12,color:"var(--text-d)",lineHeight:1.5}}>{sub}</div>
                </div>
              </div>
            ))}
          </div>'''

if old in content:
    content = content.replace(old, new)
    results.append("✅ Built For panel fixed")
else:
    results.append("❌ Not found")

with open("app/page.tsx", "w") as f:
    f.write(content)

for r in results:
    print(r)
