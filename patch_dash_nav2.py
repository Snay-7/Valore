with open("app/dashboard/page.tsx", "r") as f:
    content = f.read()

# Fix bottom nav - replace entire bottom nav section
old_nav = '''      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <button className={`bottom-nav-item ${view === "portfolio" ? "active" : ""}`} onClick={() => setView("portfolio")}>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Portfolio
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/pipeline")}>
          <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          Pipeline
        </button>
        {hasFirm && (
          <button className="bottom-nav-item" onClick={() => router.push("/workspace")}>
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            Workspace
          </button>
        )}
        <button className="bottom-nav-item" onClick={() => router.push("/tasks")}>
          <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          Tasks
        </button>
        <button className="bottom-nav-item" onClick={() => window.open(CALENDLY, "_blank")}>
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Demo
        </button>
        <button className="bottom-nav-item" onClick={signOut}>
          <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </nav>'''

new_nav = '''      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <button className={`bottom-nav-item ${view === "portfolio" ? "active" : ""}`} onClick={() => setView("portfolio")}>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Portfolio
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/pipeline")}>
          <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          Pipeline
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/workspace")}>
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          Workspace
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/tasks")}>
          <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          Tasks
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/notes")}>
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Notes
        </button>
      </nav>'''

# Fix mobile topbar - add sign out button
old_topbar = '''        <div className="mobile-topbar">
          <div style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--gold)", letterSpacing: ".1em", fontWeight: 300 }}>VALORA</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" style={{ padding: "6px 10px", fontSize: 11 }} onClick={() => window.open(CALENDLY, "_blank")}>Book Demo</button>
            <button className="btn-primary" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => { if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; } setShowNewModal(true); }}>+ New</button>
          </div>
        </div>'''

new_topbar = '''        <div className="mobile-topbar">
          <div style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--gold)", letterSpacing: ".1em", fontWeight: 300 }}>VALORA</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn-primary" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => { if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; } setShowNewModal(true); }}>+ New</button>
            <button className="btn-ghost" style={{ padding: "6px 10px", fontSize: 11 }} onClick={signOut}>Sign Out</button>
          </div>
        </div>'''

results = []

if old_nav in content:
    content = content.replace(old_nav, new_nav)
    results.append("✅ Bottom nav fixed — Portfolio, Pipeline, Workspace, Tasks, Notes")
else:
    results.append("❌ Bottom nav not found")

if old_topbar in content:
    content = content.replace(old_topbar, new_topbar)
    results.append("✅ Mobile topbar updated with Sign Out")
else:
    results.append("❌ Mobile topbar not found")

with open("app/dashboard/page.tsx", "w") as f:
    f.write(content)

for r in results:
    print(r)
