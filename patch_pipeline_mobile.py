with open("app/pipeline/page.tsx", "r") as f:
    content = f.read()

# Fix 1: Add mobile CSS
old_css_end = '''.stage-action:hover{border-color:var(--gold);color:var(--gold)}
`;'''

new_css_end = '''.stage-action:hover{border-color:var(--gold);color:var(--gold)}
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
`;'''

# Fix 2: Add class to nav for hiding on mobile
old_nav = '''      <nav style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"0 16px",height:50,display:"flex",alignItems:"center",gap:10,flexShrink:0,zIndex:10}}>'''
new_nav = '''      <nav className="desktop-nav" style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"0 16px",height:50,display:"flex",alignItems:"center",gap:10,flexShrink:0,zIndex:10}}>'''

# Fix 3: Add class to kanban board
old_board = '''      <div style={{flex:1,overflowX:"auto",overflowY:"hidden",padding:"14px 16px",display:"flex",gap:10,alignItems:"flex-start",WebkitOverflowScrolling:"touch" as any}}>'''
new_board = '''      <div className="kanban-board" style={{flex:1,overflowX:"auto",overflowY:"hidden",padding:"14px 16px",display:"flex",gap:10,alignItems:"flex-start",WebkitOverflowScrolling:"touch" as any}}>'''

# Fix 4: Add bottom nav before closing div
old_end = '''    </div>
  );
}'''

new_end = '''      {/* MOBILE BOTTOM NAV */}
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
}'''

results = []

if old_css_end in content:
    content = content.replace(old_css_end, new_css_end)
    results.append("✅ Mobile CSS added")
else:
    results.append("❌ CSS end not found")

if old_nav in content:
    content = content.replace(old_nav, new_nav)
    results.append("✅ Nav class added")
else:
    results.append("❌ Nav not found")

if old_board in content:
    content = content.replace(old_board, new_board)
    results.append("✅ Board class added")
else:
    results.append("❌ Board not found")

if old_end in content:
    content = content.replace(old_end, new_end)
    results.append("✅ Bottom nav added")
else:
    results.append("❌ End not found")

with open("app/pipeline/page.tsx", "w") as f:
    f.write(content)

for r in results:
    print(r)
