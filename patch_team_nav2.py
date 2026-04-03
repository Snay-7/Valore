with open("app/team/page.tsx", "r") as f:
    content = f.read()

# Fix team page nav - replace with compact version that doesn't overflow
old_nav = '''      {/* Nav */}
      <nav style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"0 20px",height:52,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:40,overflowX:"auto"}}>
        <button onClick={()=>router.push("/dashboard")} style={{background:"none",border:"none",color:"var(--gold)",fontFamily:"var(--font-display)",fontSize:20,fontWeight:300,cursor:"pointer",letterSpacing:".1em"}}>VALORA</button>
        <div style={{width:1,height:16,background:"var(--border)"}}/>
        <button onClick={()=>router.push("/dashboard")} className="btn-ghost" style={{fontSize:11,padding:"4px 10px"}}>Dashboard</button>
        <button onClick={()=>router.push("/pipeline")} className="btn-ghost" style={{fontSize:11,padding:"4px 10px"}}>Pipeline</button>
        <button onClick={()=>router.push("/workspace")} className="btn-ghost" style={{fontSize:11,padding:"4px 10px"}}>Workspace</button>
        <button className="btn-ghost" style={{fontSize:11,padding:"4px 10px",borderColor:"var(--gold)",color:"var(--gold)"}}>Team</button>
        <div style={{flex:1}}/>
        <span style={{fontSize:11,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{user?.email}</span>
      </nav>'''

new_nav = '''      {/* Nav */}
      <nav style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"0 16px",height:52,display:"flex",alignItems:"center",gap:8,position:"sticky",top:0,zIndex:40,flexShrink:0}}>
        <button onClick={()=>router.push("/dashboard")} style={{background:"none",border:"none",color:"var(--gold)",fontFamily:"var(--font-display)",fontSize:18,fontWeight:300,cursor:"pointer",letterSpacing:".1em",flexShrink:0}}>VALORA</button>
        <div style={{flex:1}}/>
        <button onClick={()=>router.push("/dashboard")} className="btn-ghost" style={{fontSize:11,padding:"4px 10px",flexShrink:0}}>← Dashboard</button>
        <button onClick={async()=>{await supabase.auth.signOut();router.push("/");}} className="btn-ghost" style={{fontSize:11,padding:"4px 10px",flexShrink:0}}>Sign Out</button>
      </nav>'''

if old_nav in content:
    content = content.replace(old_nav, new_nav)
    print("✅ Team nav fixed")
else:
    # Try finding it another way
    if 'overflowX:"auto"' in content and 'Team</button>' in content:
        print("⚠️ Nav found but string mismatch — check whitespace")
    else:
        print("❌ Nav not found")

with open("app/team/page.tsx", "w") as f:
    f.write(content)
