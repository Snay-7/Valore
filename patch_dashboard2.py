with open("app/dashboard/page.tsx", "r") as f:
    content = f.read()

# Fix 1: Update tier detection with trial support and correct limits
old_tier = '''  const tier = subscription?.tier || "free";
  const isPro = tier === "professional" || tier === "enterprise";
  const isStarter = tier === "starter";
  const activeProjectLimit = isPro ? Infinity : isStarter ? 5 : 3;'''

new_tier = '''  const tier = subscription?.tier || "free";
  const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
  const isTrialing = trialEndsAt && trialEndsAt > new Date();
  const trialDaysLeft = isTrialing ? Math.ceil((trialEndsAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const isEnterprise = tier === "enterprise" || isTrialing;
  const isPro = tier === "professional" || isEnterprise;
  const isStarter = tier === "starter";
  const activeProjectLimit = isPro ? Infinity : isStarter ? 10 : 3;'''

# Fix 2: Add trial banner in portfolio view after page header
old_demo_banner = '''            {/* Demo banner */}
            {!isPro && projects.length > 0 && ('''

new_demo_banner = '''            {/* Trial banner */}
            {isTrialing && (
              <div style={{ background:"rgba(201,168,76,.08)", border:"1px solid var(--gold-border)", borderRadius:10, padding:"12px 16px", marginBottom:18, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--gold)", marginBottom:1 }}>✦ Enterprise Trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining</div>
                  <div style={{ fontSize:11, color:"var(--text-m)" }}>Full access to all features. Upgrade before your trial ends.</div>
                </div>
                <button className="btn-primary" style={{ padding:"6px 14px", fontSize:11, flexShrink:0 }} onClick={() => router.push("/pricing")}>Upgrade Now</button>
              </div>
            )}

            {/* Demo banner */}
            {!isPro && projects.length > 0 && ('''

# Fix 3: Update project limit display to show correct limits
old_limit = '''                {!isPro && (
                  <div style={{ fontSize: 11, color: "var(--text-d)" }}>
                    {totalProjectCount}/{activeProjectLimit === Infinity ? "∞" : activeProjectLimit}
                    {totalProjectCount >= activeProjectLimit && <span style={{ color: "var(--amber)", marginLeft: 4, cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/pricing")}>Upgrade</span>}
                  </div>
                )}'''

new_limit = '''                {!isPro && (
                  <div style={{ fontSize: 11, color: "var(--text-d)" }}>
                    {totalProjectCount}/{activeProjectLimit === Infinity ? "∞" : activeProjectLimit} projects
                    {totalProjectCount >= activeProjectLimit && <span style={{ color: "var(--amber)", marginLeft: 4, cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/pricing")}>Upgrade</span>}
                  </div>
                )}'''

# Fix 4: Re-add project limit check on new appraisal button (soft gate - redirect to pricing)
old_new_btn = '''                <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 12 }}
                  onClick={() => setShowNewModal(true)}>
                  + New Appraisal
                </button>'''

new_new_btn = '''                <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 12 }}
                  onClick={() => { if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; } setShowNewModal(true); }}>
                  + New Appraisal
                </button>'''

old_mobile_btn = '''            <button className="btn-primary" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => setShowNewModal(true)}>+ New</button>'''
new_mobile_btn = '''            <button className="btn-primary" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => { if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; } setShowNewModal(true); }}>+ New</button>'''

results = []

if old_tier in content:
    content = content.replace(old_tier, new_tier)
    results.append("✅ Tier detection updated")
else:
    results.append("❌ Tier detection not found")

if old_demo_banner in content:
    content = content.replace(old_demo_banner, new_demo_banner)
    results.append("✅ Trial banner added")
else:
    results.append("❌ Demo banner not found")

if old_limit in content:
    content = content.replace(old_limit, new_limit)
    results.append("✅ Project limit display updated")
else:
    results.append("❌ Project limit not found")

if old_new_btn in content:
    content = content.replace(old_new_btn, new_new_btn)
    results.append("✅ Desktop new button limit restored")
else:
    results.append("❌ Desktop new button not found")

if old_mobile_btn in content:
    content = content.replace(old_mobile_btn, new_mobile_btn)
    results.append("✅ Mobile new button limit restored")
else:
    results.append("❌ Mobile new button not found")

with open("app/dashboard/page.tsx", "w") as f:
    f.write(content)

for r in results:
    print(r)
