with open("app/dashboard/page.tsx", "r") as f:
    content = f.read()

# Fix 1: Add sign out to mobile bottom nav - replace Demo button with Sign Out
old_mobile_nav = '''        <button className="bottom-nav-item" onClick={() => window.open(CALENDLY, "_blank")}>
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Demo
        </button>'''

new_mobile_nav = '''        <button className="bottom-nav-item" onClick={() => window.open(CALENDLY, "_blank")}>
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Demo
        </button>
        <button className="bottom-nav-item" onClick={signOut}>
          <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>'''

# Fix 2: Make hasFirm default to false so workspace only shows for firm members
old_hafirm = '''  const [hasFirm, setHasFirm] = useState(true);'''
new_hafirm = '''  const [hasFirm, setHasFirm] = useState(false);'''

# Fix 3: Remove the project limit for non-pro users - everyone sees same dashboard
# Just change the limit display but allow creating projects always
old_limit_btn = '''                <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 12 }}
                  onClick={() => { if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; } setShowNewModal(true); }}>
                  + New Appraisal
                </button>'''
new_limit_btn = '''                <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 12 }}
                  onClick={() => setShowNewModal(true)}>
                  + New Appraisal
                </button>'''

old_mobile_new = '''            <button className="btn-primary" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => { if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; } setShowNewModal(true); }}>+ New</button>'''
new_mobile_new = '''            <button className="btn-primary" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => setShowNewModal(true)}>+ New</button>'''

results = []

if old_mobile_nav in content:
    content = content.replace(old_mobile_nav, new_mobile_nav)
    results.append("✅ Mobile sign out added")
else:
    results.append("❌ Mobile nav not found")

if old_hafirm in content:
    content = content.replace(old_hafirm, new_hafirm)
    results.append("✅ hasFirm default fixed")
else:
    results.append("❌ hasFirm not found")

if old_limit_btn in content:
    content = content.replace(old_limit_btn, new_limit_btn)
    results.append("✅ Desktop new button fixed")
else:
    results.append("❌ Desktop new button not found")

if old_mobile_new in content:
    content = content.replace(old_mobile_new, new_mobile_new)
    results.append("✅ Mobile new button fixed")
else:
    results.append("❌ Mobile new button not found")

with open("app/dashboard/page.tsx", "w") as f:
    f.write(content)

for r in results:
    print(r)
