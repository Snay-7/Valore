with open("app/page.tsx", "r") as f:
    content = f.read()

results = []

# Fix hero pills - find whatever version is there
import re

# Find the pills section and replace it
old_pills_v1 = '''                {[["🏗","Developers"],["🏦","Lenders & Banks"],["💼","Investment Managers"],["📐","Valuers & Surveyors"]].map(([icon,label])=>(
                  <span key={label} style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:20,padding:"5px 12px",fontSize:12,color:"var(--text-m)"}}>{icon} {label}</span>
                ))}'''

old_pills_v2 = '''                {[["◈","Developers"],["◎","Lenders & Banks"],["◉","Investment Managers"],["◫","Valuers & Surveyors"]].map(([icon,label])=>(
                  <span key={label} style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:20,padding:"5px 12px",fontSize:12,color:"var(--text-m)"}}><span style={{color:"var(--gold)",fontSize:10}}>{icon}</span> {label}</span>
                ))}'''

new_pills = '''                {[["◈","Developers"],["◎","Lenders & Banks"],["◉","Investment Managers"],["◫","Valuers & Surveyors"]].map(([icon,label])=>(
                  <span key={label} style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--bg2)",border:"1px solid var(--border-m)",borderRadius:20,padding:"6px 14px",fontSize:12,color:"var(--text-m)",letterSpacing:".02em"}}><span style={{color:"var(--gold)",fontSize:11,fontWeight:300}}>{icon}</span>{label}</span>
                ))}'''

if old_pills_v1 in content:
    content = content.replace(old_pills_v1, new_pills)
    results.append("✅ Hero pills v1 fixed")
elif old_pills_v2 in content:
    content = content.replace(old_pills_v2, new_pills)
    results.append("✅ Hero pills v2 fixed")
else:
    # Just find any pills-like section
    if '"Developers"' in content and 'borderRadius:20' in content:
        results.append("⚠️ Pills found but string mismatch — check manually")
    else:
        results.append("❌ Hero pills not found at all")

# Fix persona cards - find what's actually there
old_persona_v1 = '''              <div key={i} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:26,transition:"border-color .25s,transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=persona.color+"55";e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none"}}>
                <div style={{fontSize:20,marginBottom:12,color:persona.color,fontWeight:300}}>{persona.icon}</div>'''

old_persona_v2 = '''              <div key={i} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:26,transition:"border-color .25s,transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=persona.color+"55";e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none"}}>
                <div style={{fontSize:28,marginBottom:12}}>{persona.icon}</div>'''

new_persona = '''              <div key={i} className="persona-card reveal" style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14,padding:26,animationDelay:`${i*0.08}s`}}>
                <div style={{width:40,height:40,borderRadius:10,background:persona.color+"14",border:`1px solid ${persona.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:persona.color,marginBottom:14,fontWeight:300}}>{persona.icon}</div>'''

if old_persona_v1 in content:
    content = content.replace(old_persona_v1, new_persona)
    results.append("✅ Persona cards v1 fixed")
elif old_persona_v2 in content:
    content = content.replace(old_persona_v2, new_persona)
    results.append("✅ Persona cards v2 fixed")
else:
    # Try to find what's actually there
    idx = content.find("persona.icon")
    if idx > 0:
        print("Found persona.icon at:", idx)
        print("Context:", repr(content[idx-200:idx+100]))
    results.append("❌ Persona cards not found — check output above")

with open("app/page.tsx", "w") as f:
    f.write(content)

for r in results:
    print(r)
