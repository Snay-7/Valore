"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold-l:#e2c97e;--gold-bg:rgba(201,168,76,0.07);--gold-border:rgba(201,168,76,0.2);
  --bg:#06070a;--bg1:#0c0e12;--bg2:#12151a;--bg3:#191d24;--bg4:#21262f;
  --text:#eceae4;--text-m:#7d8590;--text-d:#3d4249;
  --border:rgba(255,255,255,0.06);--border-m:rgba(255,255,255,0.12);
  --green:#3ddc84;--red:#f4645f;--amber:#f0a429;--blue:#5b9cf6;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:7px;padding:9px 18px;font-family:var(--font-body);font-size:12px;font-weight:600;cursor:pointer;transition:background .2s;white-space:nowrap;display:inline-flex;align-items:center;gap:6px}
.btn-primary:hover{background:var(--gold-l)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:7px 14px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-danger{background:transparent;color:var(--red);border:1px solid rgba(244,100,95,.25);border-radius:6px;padding:5px 12px;font-family:var(--font-body);font-size:11px;cursor:pointer;transition:all .2s}
.btn-danger:hover{background:rgba(244,100,95,.08);border-color:var(--red)}
.inp{width:100%;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font-body);font-size:13px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold);box-shadow:0 0 0 2px rgba(201,168,76,.08)}
.inp::placeholder{color:var(--text-d)}
select.inp{cursor:pointer}
.member-row{display:flex;align-items:center;gap:14px;padding:16px 0;border-bottom:1px solid var(--border);animation:fadeIn .2s ease}
.member-row:last-child{border-bottom:none}
.avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;flex-shrink:0;letter-spacing:.02em}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:200;animation:fadeIn .15s ease}
.modal{background:var(--bg2);border:1px solid var(--border-m);border-radius:16px;padding:28px;width:480px;max-width:calc(100vw - 32px);max-height:90vh;overflow-y:auto}
@media(max-width:768px){
  .main{padding:16px !important}
  .member-row{flex-wrap:wrap;gap:10px}
  .member-actions{width:100% !important;margin-left:0 !important}
  .page-header{flex-direction:column !important;align-items:flex-start !important;gap:12px !important}
}
`;

const ROLES=[
  {id:"admin", label:"Admin",  desc:"Full access — manage team & all projects", bg:"rgba(201,168,76,.12)", color:"#c9a84c", proOnly:true},
  {id:"editor",label:"Editor", desc:"Create and edit appraisals and tasks",      bg:"rgba(91,156,246,.12)", color:"#5b9cf6", proOnly:false},
  {id:"viewer",label:"Viewer", desc:"Read-only access to shared projects",       bg:"rgba(61,220,132,.1)",  color:"#3ddc84", proOnly:false},
];

const AVATAR_BG=[
  {bg:"rgba(201,168,76,.18)",c:"#c9a84c"},
  {bg:"rgba(91,156,246,.18)",c:"#5b9cf6"},
  {bg:"rgba(61,220,132,.15)",c:"#3ddc84"},
  {bg:"rgba(240,164,41,.15)",c:"#f0a429"},
  {bg:"rgba(244,100,95,.15)",c:"#f4645f"},
];

function initials(email:string){
  if(!email)return"?";
  const p=email.split("@")[0].split(/[._-]/);
  return p.length>=2?(p[0][0]+p[1][0]).toUpperCase():email.slice(0,2).toUpperCase();
}
function avColor(str:string){
  let h=0;for(let i=0;i<str.length;i++)h=str.charCodeAt(i)+((h<<5)-h);
  return AVATAR_BG[Math.abs(h)%AVATAR_BG.length];
}
function fmtDate(d:string){return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"});}

export default function TeamPage(){
  const router=useRouter();
  const[user,setUser]=useState<any>(null);
  const[firm,setFirm]=useState<any>(null);
  const[members,setMembers]=useState<any[]>([]);
  const[userProfiles,setUserProfiles]=useState<Record<string,string>>({});
  const[loading,setLoading]=useState(true);
  const[subscription,setSubscription]=useState<any>(null);

  // Invite
  const[showInvite,setShowInvite]=useState(false);
  const[inviteEmail,setInviteEmail]=useState("");
  const[inviteRole,setInviteRole]=useState("editor");
  const[inviting,setInviting]=useState(false);
  const[inviteErr,setInviteErr]=useState<string|null>(null);
  const[inviteOk,setInviteOk]=useState(false);

  // Role change
  const[roleModal,setRoleModal]=useState<any>(null);
  const[newRole,setNewRole]=useState("editor");
  const[savingRole,setSavingRole]=useState(false);

  // Remove
  const[removeModal,setRemoveModal]=useState<any>(null);
  const[removing,setRemoving]=useState(false);

  // Firm name
  const[editName,setEditName]=useState(false);
  const[nameVal,setNameVal]=useState("");
  const[savingName,setSavingName]=useState(false);

  // Create firm
  const[createModal,setCreateModal]=useState(false);
  const[newFirmName,setNewFirmName]=useState("");
  const[creating,setCreating]=useState(false);

  useEffect(()=>{
    const init=async()=>{
      const{data:{session}}=await supabase.auth.getSession();
      if(!session){router.push("/");return;}
      setUser(session.user);
      const{data:sub}=await supabase.from("subscriptions").select("*").eq("user_id",session.user.id).maybeSingle();
      setSubscription(sub);
      await load(session.user.id);
    };
    init();
  },[router]);

  const load=async(uid:string)=>{
    setLoading(true);
    // Find firm membership for this user
    const{data:myRow}=await supabase.from("firm_members").select("*,firms(*)").eq("user_id",uid).maybeSingle();
    if(myRow?.firms){
      const f=myRow.firms as any;
      setFirm(f);setNameVal(f.name||"");
      // Load all members
      const{data:allMembers}=await supabase.from("firm_members").select("*").eq("firm_id",f.id).order("joined_at",{ascending:true});
      setMembers(allMembers||[]);
      // Load email addresses for all user_ids from auth.users via profiles or use email from member row
      // Try to get emails from a profiles table if it exists
      const uids=(allMembers||[]).map((m:any)=>m.user_id).filter(Boolean);
      if(uids.length>0){
        const{data:profiles}=await supabase.from("profiles").select("id,email").in("id",uids);
        if(profiles){
          const map:Record<string,string>={};
          profiles.forEach((p:any)=>{if(p.id&&p.email)map[p.id]=p.email;});
          setUserProfiles(map);
        }
      }
    }else{
      setFirm(null);setMembers([]);
    }
    setLoading(false);
  };

  const getMemberEmail=(member:any):string=>{
    // Try various sources for email
    if(member.email)return member.email;
    if(userProfiles[member.user_id])return userProfiles[member.user_id];
    if(member.user_id===user?.id)return user.email||"—";
    return member.user_id?.slice(0,8)+"…"||"—";
  };

  const createFirm=async()=>{
    if(!newFirmName.trim()||!user)return;
    setCreating(true);
    const{data:f,error:fe}=await supabase.from("firms").insert({name:newFirmName.trim(),created_by:user.id}).select().single();
    if(fe||!f){setCreating(false);return;}
    await supabase.from("firm_members").insert({firm_id:f.id,user_id:user.id,role:"admin",invited_by:user.id});
    setCreating(false);setCreateModal(false);setNewFirmName("");
    await load(user.id);
  };

  const sendInvite=async()=>{
    const email=inviteEmail.trim().toLowerCase();
    if(!email||!firm||!user)return;
    setInviting(true);setInviteErr(null);

    // Check not already a member
    if(members.find(m=>m.email?.toLowerCase()===email)){
      setInviteErr("This person is already in your team.");setInviting(false);return;
    }

    // 1. Insert into firm_members — store email directly
    const{error:ie}=await supabase.from("firm_members").insert({
      firm_id:firm.id,email,role:inviteRole,invited_by:user.id,
    });
    if(ie){setInviteErr(ie.message||"Failed to add member.");setInviting(false);return;}

    // 2. Send invite email via API route
    try{
      const inviteLink=`${window.location.origin}?invited=true&firm=${encodeURIComponent(firm.name)}&email=${encodeURIComponent(email)}`;
      const res=await fetch("/api/invite",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          email,
          firmName:firm.name,
          inviteLink,
          inviterEmail:user.email,
          role:inviteRole,
        }),
      });
      const result=await res.json();
      if(!result.sent){
        // Email failed but member was added — still show success
        console.warn("Email not sent:",result.error||result.message);
      }
    }catch(emailErr){
      console.warn("Email send failed:",emailErr);
      // Don't block — member is already added
    }

    setInviteOk(true);
    await load(user.id);
    setTimeout(()=>{setInviteOk(false);setShowInvite(false);setInviteEmail("");setInviteRole("editor");},1600);
    setInviting(false);
  };

  const changeRole=async()=>{
    if(!roleModal)return;
    setSavingRole(true);
    await supabase.from("firm_members").update({role:newRole}).eq("id",roleModal.id);
    setMembers(prev=>prev.map(m=>m.id===roleModal.id?{...m,role:newRole}:m));
    setSavingRole(false);setRoleModal(null);
  };

  const removeMember=async()=>{
    if(!removeModal)return;
    setRemoving(true);
    await supabase.from("firm_members").delete().eq("id",removeModal.id);
    setMembers(prev=>prev.filter(m=>m.id!==removeModal.id));
    setRemoving(false);setRemoveModal(null);
  };

  const saveName=async()=>{
    if(!nameVal.trim()||!firm)return;
    setSavingName(true);
    await supabase.from("firms").update({name:nameVal.trim()}).eq("id",firm.id);
    setFirm((f:any)=>({...f,name:nameVal.trim()}));
    setSavingName(false);setEditName(false);
  };

  const myMember=members.find(m=>m.user_id===user?.id);
  const isAdmin=myMember?.role==="admin";
  const isPro=(subscription?.tier==="professional"||subscription?.tier==="enterprise"||subscription?.status==="trialing");

  if(loading)return(
    <div style={{minHeight:"100vh",background:"#06070a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
      <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:22,color:"#c9a84c",letterSpacing:".12em",fontWeight:300}}>VALORA</div>
      <div style={{width:26,height:26,border:"2px solid rgba(201,168,76,.15)",borderTopColor:"#c9a84c",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <div style={{fontSize:11,color:"#3d4249",letterSpacing:".06em"}}>Loading team…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"var(--font-body)"}}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"0 20px",height:52,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:40}}>
        <button onClick={()=>router.push("/dashboard")} style={{background:"none",border:"none",color:"var(--gold)",fontFamily:"var(--font-display)",fontSize:20,fontWeight:300,cursor:"pointer",letterSpacing:".1em"}}>VALORA</button>
        <div style={{width:1,height:16,background:"var(--border)"}}/>
        <button onClick={()=>router.push("/dashboard")} className="btn-ghost" style={{fontSize:11,padding:"4px 10px"}}>Dashboard</button>
        <button onClick={()=>router.push("/pipeline")} className="btn-ghost" style={{fontSize:11,padding:"4px 10px"}}>Pipeline</button>
        <button onClick={()=>router.push("/workspace")} className="btn-ghost" style={{fontSize:11,padding:"4px 10px"}}>Workspace</button>
        <button className="btn-ghost" style={{fontSize:11,padding:"4px 10px",borderColor:"var(--gold)",color:"var(--gold)"}}>Team</button>
        <div style={{flex:1}}/>
        <span style={{fontSize:11,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{user?.email}</span>
      </nav>

      <div className="main" style={{maxWidth:720,margin:"0 auto",padding:"32px 24px"}}>

        {/* No firm */}
        {!firm&&(
          <div style={{textAlign:"center",padding:"80px 0"}}>
            <div style={{fontFamily:"var(--font-display)",fontSize:44,fontWeight:300,color:"var(--text-d)",marginBottom:16}}>◈</div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,marginBottom:8}}>No team workspace yet</h1>
            <p style={{fontSize:13,color:"var(--text-d)",marginBottom:32,maxWidth:360,margin:"0 auto 32px"}}>Create a workspace to invite your team, assign roles and collaborate on deals.</p>
            <button className="btn-primary" style={{padding:"12px 28px",fontSize:13}} onClick={()=>setCreateModal(true)}>+ Create Team Workspace</button>
          </div>
        )}

        {/* Firm exists */}
        {firm&&(
          <>
            {/* Header */}
            <div className="page-header" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,gap:12}}>
              <div>
                {editName?(
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                    <input className="inp" value={nameVal} onChange={e=>setNameVal(e.target.value)}
                      style={{fontSize:22,padding:"6px 12px",fontFamily:"var(--font-display)",fontWeight:300,width:240}}
                      onKeyDown={e=>{if(e.key==="Enter")saveName();if(e.key==="Escape"){setEditName(false);setNameVal(firm.name);}}}
                      autoFocus/>
                    <button className="btn-primary" onClick={saveName} disabled={savingName||!nameVal.trim()} style={{padding:"7px 14px",fontSize:12}}>{savingName?"Saving…":"Save"}</button>
                    <button className="btn-ghost" onClick={()=>{setEditName(false);setNameVal(firm.name);}} style={{padding:"7px 12px",fontSize:12}}>Cancel</button>
                  </div>
                ):(
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                    <h1 style={{fontFamily:"var(--font-display)",fontSize:30,fontWeight:300,letterSpacing:".02em",textTransform:"none"}}>{firm.name||"My Team"}</h1>
                    <button onClick={()=>setEditName(true)} style={{background:"none",border:"1px solid var(--border)",borderRadius:5,color:"var(--text-d)",cursor:"pointer",fontSize:11,fontFamily:"var(--font-body)",padding:"2px 8px",transition:"all .2s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold)";e.currentTarget.style.color="var(--gold)";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-d)";}}>
                      Rename
                    </button>
                  </div>
                )}
                <p style={{fontSize:12,color:"var(--text-d)"}}>{members.length} member{members.length!==1?"s":""} · {isAdmin?"Admin":"Member"}</p>
              </div>
              <button className="btn-primary" onClick={()=>{setShowInvite(true);setInviteErr(null);setInviteOk(false);setInviteEmail("");setInviteRole("editor");}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                Invite Member
              </button>
            </div>

            {/* Members list */}
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"0 20px",marginBottom:20}}>
              <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".09em",padding:"14px 0 12px",borderBottom:"1px solid var(--border)"}}>
                Team Members ({members.length})
              </div>
              {members.length===0&&(
                <div style={{textAlign:"center",padding:"28px 0",color:"var(--text-d)",fontSize:13}}>No members yet — invite your team</div>
              )}
              {members.map(m=>{
                const email=getMemberEmail(m);
                const ac=avColor(email);
                const role=ROLES.find(r=>r.id===m.role)||ROLES[1];
                const isMe=m.user_id===user?.id;
                return(
                  <div key={m.id} className="member-row">
                    <div className="avatar" style={{background:ac.bg,color:ac.c}}>{initials(email)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:300}}>{email}</span>
                        {isMe&&<span style={{fontSize:10,color:"var(--text-d)",background:"var(--bg4)",padding:"1px 6px",borderRadius:4,flexShrink:0}}>you</span>}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5,flexWrap:"wrap"}}>
                        <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,fontWeight:600,background:role.bg,color:role.color}}>{role.label}</span>
                        <span style={{fontSize:10,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>
                          {m.joined_at?`Joined ${fmtDate(m.joined_at)}`:"Pending"}
                        </span>
                      </div>
                    </div>
                    {!isMe&&(
                      <div className="member-actions" style={{display:"flex",gap:6,flexShrink:0,marginLeft:"auto"}}>
                        <button className="btn-ghost" style={{fontSize:11,padding:"5px 12px"}}
                          onClick={()=>{setRoleModal(m);setNewRole(m.role);}}>
                          Change Role
                        </button>
                        <button className="btn-danger" onClick={()=>setRemoveModal(m)}>Remove</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Role guide */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {ROLES.map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,flex:1,minWidth:180}}>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,fontWeight:600,background:r.bg,color:r.color,flexShrink:0}}>{r.label}</span>
                  {r.proOnly&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:3,fontWeight:700,background:"var(--gold)",color:"#06070a",flexShrink:0}}>PRO</span>}
                  <span style={{fontSize:11,color:"var(--text-d)"}}>{r.desc}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── INVITE MODAL ── */}
      {showInvite&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowInvite(false);}}>
          <div className="modal">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:300}}>Invite Member</div>
              <button onClick={()=>setShowInvite(false)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:22,lineHeight:1}}>×</button>
            </div>
            <p style={{fontSize:12,color:"var(--text-d)",marginBottom:22}}>Invite someone to join <strong style={{color:"var(--text)",fontWeight:500}}>{firm?.name}</strong>.</p>
            {inviteOk?(
              <div style={{textAlign:"center",padding:"32px 0"}}>
                <div style={{fontSize:40,color:"var(--green)",marginBottom:8}}>✓</div>
                <div style={{fontSize:14,color:"var(--green)",fontWeight:500}}>Invite sent to {inviteEmail}</div>
                <div style={{fontSize:12,color:"var(--text-d)",marginTop:6}}>They'll receive an email with a link to join {firm?.name}</div>
              </div>
            ):(
              <>
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:6}}>Email Address *</label>
                  <input className="inp" type="email" placeholder="colleague@company.com"
                    value={inviteEmail} onChange={e=>{setInviteEmail(e.target.value);setInviteErr(null);}}
                    onKeyDown={e=>e.key==="Enter"&&sendInvite()} autoFocus/>
                </div>
                <div style={{marginBottom:20}}>
                  <label style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:10}}>Role</label>
                  <div style={{display:"flex",gap:8}}>
                    {ROLES.map(r=>{
                      const locked=r.proOnly&&!isPro;
                      return(
                        <button key={r.id} onClick={()=>locked?router.push("/pricing"):setInviteRole(r.id)}
                          style={{flex:1,padding:"12px 8px",borderRadius:8,border:`1px solid ${inviteRole===r.id&&!locked?r.color+"88":"var(--border)"}`,background:inviteRole===r.id&&!locked?r.bg:"var(--bg3)",cursor:"pointer",transition:"all .2s",textAlign:"center",outline:"none",position:"relative",opacity:locked?.6:1}}>
                          {locked&&<span style={{position:"absolute",top:6,right:6,fontSize:9,background:"var(--gold)",color:"#06070a",padding:"1px 5px",borderRadius:3,fontWeight:700}}>PRO</span>}
                          <div style={{fontSize:11,fontWeight:600,color:inviteRole===r.id&&!locked?r.color:"var(--text-m)",fontFamily:"var(--font-body)",marginBottom:3}}>{r.label}</div>
                          <div style={{fontSize:10,color:"var(--text-d)",lineHeight:1.3}}>{locked?"Upgrade to Pro to assign":r.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {inviteErr&&<div style={{background:"rgba(244,100,95,.08)",border:"1px solid rgba(244,100,95,.25)",borderRadius:7,padding:"10px 14px",fontSize:12,color:"var(--red)",marginBottom:14}}>{inviteErr}</div>}
                <div style={{display:"flex",gap:8}}>
                  <button className="btn-ghost" onClick={()=>setShowInvite(false)} style={{flex:1,justifyContent:"center"}}>Cancel</button>
                  <button className="btn-primary" onClick={sendInvite} disabled={!inviteEmail.trim()||inviting} style={{flex:2,justifyContent:"center"}}>
                    {inviting?<><span style={{width:12,height:12,border:"1.5px solid #06070a44",borderTopColor:"#06070a",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Adding…</>:"Add Member →"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── CHANGE ROLE MODAL ── */}
      {roleModal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setRoleModal(null);}}>
          <div className="modal" style={{width:440}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300}}>Change Role</div>
              <button onClick={()=>setRoleModal(null)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:22,lineHeight:1}}>×</button>
            </div>
            <p style={{fontSize:12,color:"var(--text-d)",marginBottom:20}}>{getMemberEmail(roleModal)}</p>
            <div style={{display:"flex",gap:8,marginBottom:20}}>
              {ROLES.map(r=>{
                const locked=r.proOnly&&!isPro;
                return(
                  <button key={r.id} onClick={()=>locked?router.push("/pricing"):setNewRole(r.id)}
                    style={{flex:1,padding:"12px 8px",borderRadius:8,border:`1px solid ${newRole===r.id&&!locked?r.color+"88":"var(--border)"}`,background:newRole===r.id&&!locked?r.bg:"var(--bg3)",cursor:"pointer",transition:"all .2s",textAlign:"center",outline:"none",position:"relative",opacity:locked?.6:1}}>
                    {locked&&<span style={{position:"absolute",top:6,right:6,fontSize:9,background:"var(--gold)",color:"#06070a",padding:"1px 5px",borderRadius:3,fontWeight:700}}>PRO</span>}
                    <div style={{fontSize:11,fontWeight:600,color:newRole===r.id&&!locked?r.color:"var(--text-m)",fontFamily:"var(--font-body)",marginBottom:3}}>{r.label}</div>
                    <div style={{fontSize:10,color:"var(--text-d)",lineHeight:1.3}}>{locked?"Upgrade to Pro to assign":r.desc}</div>
                  </button>
                );
              })}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn-ghost" onClick={()=>setRoleModal(null)} style={{flex:1,justifyContent:"center"}}>Cancel</button>
              <button className="btn-primary" onClick={changeRole} disabled={savingRole||newRole===roleModal.role} style={{flex:1,justifyContent:"center"}}>
                {savingRole?"Saving…":"Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REMOVE MODAL ── */}
      {removeModal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setRemoveModal(null);}}>
          <div className="modal" style={{width:400}}>
            <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,marginBottom:8,color:"var(--red)"}}>Remove Member</div>
            <p style={{fontSize:13,color:"var(--text-m)",marginBottom:6}}>Remove {getMemberEmail(removeModal)} from {firm?.name}?</p>
            <p style={{fontSize:12,color:"var(--text-d)",marginBottom:24}}>They will lose access to all shared projects immediately.</p>
            <div style={{display:"flex",gap:8}}>
              <button className="btn-ghost" onClick={()=>setRemoveModal(null)} style={{flex:1,justifyContent:"center"}}>Cancel</button>
              <button onClick={removeMember} disabled={removing}
                style={{flex:1,background:"var(--red)",color:"#fff",border:"none",borderRadius:7,padding:"9px 18px",fontFamily:"var(--font-body)",fontSize:13,fontWeight:600,cursor:"pointer",opacity:removing?.6:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                {removing?<><span style={{width:12,height:12,border:"1.5px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Removing…</>:"Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE FIRM MODAL ── */}
      {createModal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setCreateModal(false);}}>
          <div className="modal">
            <div style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:300,marginBottom:6}}>Create Team Workspace</div>
            <p style={{fontSize:12,color:"var(--text-d)",marginBottom:22}}>Give your firm or team a name. You can rename it anytime.</p>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:6}}>Firm / Team Name *</label>
              <input className="inp" placeholder="e.g. Andrade Capital" value={newFirmName}
                onChange={e=>setNewFirmName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&createFirm()} autoFocus/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn-ghost" onClick={()=>setCreateModal(false)} style={{flex:1,justifyContent:"center"}}>Cancel</button>
              <button className="btn-primary" onClick={createFirm} disabled={!newFirmName.trim()||creating} style={{flex:2,justifyContent:"center"}}>
                {creating?"Creating…":"Create Workspace →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
