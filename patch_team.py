with open("app/team/page.tsx", "r") as f:
    content = f.read()

# Fix 1: Update tier detection to include trial and proper tiers
old_tier = '''  const myMember=members.find(m=>m.user_id===user?.id);
  const isAdmin=myMember?.role==="admin";
  const isPro=(subscription?.tier==="professional"||subscription?.tier==="enterprise"||subscription?.status==="trialing");'''

new_tier = '''  const myMember=members.find(m=>m.user_id===user?.id);
  const isAdmin=myMember?.role==="admin";
  const tier=subscription?.tier||"free";
  const trialEndsAt=subscription?.trial_ends_at?new Date(subscription.trial_ends_at):null;
  const isTrialing=trialEndsAt&&trialEndsAt>new Date();
  const trialDaysLeft=isTrialing?Math.ceil((trialEndsAt!.getTime()-Date.now())/(1000*60*60*24)):0;
  const isEnterprise=tier==="enterprise"||isTrialing;
  const isPro=tier==="professional"||isEnterprise;
  const canInvite=isPro; // Pro can invite other Pro, Enterprise gets full workspace
  const canCreateFirm=isPro;'''

# Fix 2: Gate invite button - only show for Pro+
old_invite_btn = '''              <button className="btn-primary" onClick={()=>{setShowInvite(true);setInviteErr(null);setInviteOk(false);setInviteEmail("");setInviteRole("editor");}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                Invite Member
              </button>'''

new_invite_btn = '''              {canInvite ? (
                <button className="btn-primary" onClick={()=>{setShowInvite(true);setInviteErr(null);setInviteOk(false);setInviteEmail("");setInviteRole("editor");}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  Invite Member
                </button>
              ) : (
                <button className="btn-primary" onClick={()=>router.push("/pricing")} style={{background:"var(--bg3)",border:"1px solid var(--gold-border)",color:"var(--gold)"}}>
                  ✦ Upgrade to Invite
                </button>
              )}'''

# Fix 3: Add trial banner after firm header
old_members_header = '''            {/* Members list */}
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"0 20px",marginBottom:20}}>'''

new_members_header = '''            {/* Trial banner */}
            {isTrialing&&(
              <div style={{background:"rgba(201,168,76,.08)",border:"1px solid var(--gold-border)",borderRadius:10,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:"var(--gold)",marginBottom:1}}>✦ Enterprise Trial — {trialDaysLeft} day{trialDaysLeft!==1?"s":""} remaining</div>
                  <div style={{fontSize:11,color:"var(--text-m)"}}>You have full access to all features during your trial.</div>
                </div>
                <button className="btn-primary" onClick={()=>router.push("/pricing")} style={{fontSize:11,padding:"6px 14px",flexShrink:0}}>Upgrade Now</button>
              </div>
            )}

            {/* Free/Starter upgrade prompt */}
            {!isPro&&!isTrialing&&(
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"24px",marginBottom:20,textAlign:"center"}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,marginBottom:8}}>Upgrade to invite your team</div>
                <p style={{fontSize:13,color:"var(--text-m)",marginBottom:20,maxWidth:400,margin:"0 auto 20px"}}>Pro users can invite other Pro collaborators. Enterprise gets full team workspace with roles and shared projects.</p>
                <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                  <button className="btn-primary" onClick={()=>router.push("/pricing")} style={{padding:"10px 24px"}}>View Plans →</button>
                </div>
              </div>
            )}

            {/* Members list */}
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"0 20px",marginBottom:20}}>'''

# Fix 4: Gate create firm button
old_create_btn = '''            <button className="btn-primary" style={{padding:"12px 28px",fontSize:13}} onClick={()=>setCreateModal(true)}>+ Create Team Workspace</button>'''
new_create_btn = '''            {canCreateFirm ? (
              <button className="btn-primary" style={{padding:"12px 28px",fontSize:13}} onClick={()=>setCreateModal(true)}>+ Create Team Workspace</button>
            ) : (
              <div>
                <button className="btn-primary" style={{padding:"12px 28px",fontSize:13,background:"var(--bg3)",border:"1px solid var(--gold-border)",color:"var(--gold)"}} onClick={()=>router.push("/pricing")}>✦ Upgrade to Create Team</button>
                <p style={{fontSize:11,color:"var(--text-d)",marginTop:12}}>Available on Pro and Enterprise plans.</p>
              </div>
            )}'''

results = []

if old_tier in content:
    content = content.replace(old_tier, new_tier)
    results.append("✅ Tier detection updated")
else:
    results.append("❌ Tier detection not found")

if old_invite_btn in content:
    content = content.replace(old_invite_btn, new_invite_btn)
    results.append("✅ Invite button gated")
else:
    results.append("❌ Invite button not found")

if old_members_header in content:
    content = content.replace(old_members_header, new_members_header)
    results.append("✅ Trial banner + upgrade prompt added")
else:
    results.append("❌ Members header not found")

if old_create_btn in content:
    content = content.replace(old_create_btn, new_create_btn)
    results.append("✅ Create firm button gated")
else:
    results.append("❌ Create firm button not found")

with open("app/team/page.tsx", "w") as f:
    f.write(content)

for r in results:
    print(r)
