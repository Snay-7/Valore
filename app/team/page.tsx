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
.btn-danger{background:transparent;color:var(--red);border:1px solid rgba(244,100,95,.25);border-radius:6px;padding:4px 10px;font-family:var(--font-body);font-size:11px;cursor:pointer;transition:all .2s}
.btn-danger:hover{background:rgba(244,100,95,.08);border-color:var(--red)}
.inp{width:100%;padding:9px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font-body);font-size:13px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold)}
.inp::placeholder{color:var(--text-d)}
select.inp{cursor:pointer}
.member-row{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--border);animation:fadeIn .2s ease}
.member-row:last-child{border-bottom:none}
.avatar{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;font-family:var(--font-body);flex-shrink:0}
.role-badge{font-size:10px;padding:2px 8px;border-radius:4px;font-weight:600;font-family:var(--font-body);letter-spacing:.04em;cursor:pointer;transition:all .2s;border:1px solid transparent}
.status-badge{font-size:9px;padding:2px 7px;border-radius:4px;font-weight:500;font-family:var(--font-body)}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:200;animation:fadeIn .15s ease}
.modal{background:var(--bg2);border:1px solid var(--border-m);border-radius:14px;padding:28px;width:460px;max-width:calc(100vw - 32px)}
@media(max-width:768px){
  .main{padding:16px !important}
  .member-row{flex-wrap:wrap;gap:10px}
  .member-actions{margin-left:0 !important;width:100%}
}
`;

const ROLES = [
  { id:"admin",  label:"Admin",  desc:"Full access — manage team, all projects",   bg:"rgba(201,168,76,.12)", color:"#c9a84c" },
  { id:"editor", label:"Editor", desc:"Create and edit appraisals and tasks",        bg:"rgba(91,156,246,.12)",  color:"#5b9cf6" },
  { id:"viewer", label:"Viewer", desc:"Read-only access to all shared projects",     bg:"rgba(61,220,132,.1)",   color:"#3ddc84" },
];

const AVATAR_COLORS = [
  {bg:"rgba(201,168,76,.2)",color:"#c9a84c"},
  {bg:"rgba(91,156,246,.2)",color:"#5b9cf6"},
  {bg:"rgba(61,220,132,.15)",color:"#3ddc84"},
  {bg:"rgba(240,164,41,.15)",color:"#f0a429"},
  {bg:"rgba(244,100,95,.15)",color:"#f4645f"},
];

function initials(email:string){
  const parts=email.split("@")[0].split(/[._-]/);
  if(parts.length>=2)return(parts[0][0]+parts[1][0]).toUpperCase();
  return email.slice(0,2).toUpperCase();
}

function avatarColor(email:string){
  let h=0;for(let i=0;i<email.length;i++)h=email.charCodeAt(i)+((h<<5)-h);
  return AVATAR_COLORS[Math.abs(h)%AVATAR_COLORS.length];
}

export default function TeamPage(){
  const router=useRouter();
  const[user,setUser]=useState<any>(null);
  const[firm,setFirm]=useState<any>(null);
  const[members,setMembers]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[inviteModal,setInviteModal]=useState(false);
  const[inviteEmail,setInviteEmail]=useState("");
  const[inviteRole,setInviteRole]=useState("editor");
  const[inviting,setInviting]=useState(false);
  const[inviteError,setInviteError]=useState<string|null>(null);
  const[inviteSuccess,setInviteSuccess]=useState(false);
  const[removingId,setRemovingId]=useState<string|null>(null);
  const[confirmRemove,setConfirmRemove]=useState<any>(null);
  const[editingRole,setEditingRole]=useState<string|null>(null);
  const[firmNameEdit,setFirmNameEdit]=useState(false);
  const[firmName,setFirmName]=useState("");
  const[savingFirmName,setSavingFirmName]=useState(false);
  const[createFirmModal,setCreateFirmModal]=useState(false);
  const[newFirmName,setNewFirmName]=useState("");
  const[creatingFirm,setCreatingFirm]=useState(false);

  useEffect(()=>{
    const init=async()=>{
      const{data:{session}}=await supabase.auth.getSession();
      if(!session){router.push("/");return;}
      setUser(session.user);
      await loadTeam(session.user.id,session.user.email||"");
    };
    init();
  },[router]);

  const loadTeam=async(userId:string,userEmail:string)=>{
    setLoading(true);
    // Get firm membership
    const{data:memberRow}=await supabase.from("firm_members").select("*,firms(*)").eq("user_id",userId).maybeSingle();
    if(memberRow?.firms){
      const f=memberRow.firms as any;
      setFirm(f);
      setFirmName(f.name||"");
      // Load all members of this firm
      const{data:allMembers}=await supabase.from("firm_members").select("*").eq("firm_id",f.id).order("created_at",{ascending:true});
      setMembers(allMembers||[]);
    }else{
      setFirm(null);
      setMembers([]);
    }
    setLoading(false);
  };

  const createFirm=async()=>{
    if(!newFirmName.trim()||!user)return;
    setCreatingFirm(true);
    // Create firm
    const{data:f,error:fe}=await supabase.from("firms").insert({name:newFirmName.trim(),created_by:user.id}).select().single();
    if(fe||!f){setCreatingFirm(false);return;}
    // Add creator as admin
    await supabase.from("firm_members").insert({firm_id:f.id,user_id:user.id,email:user.email,role:"admin",status:"active",invited_by:user.id});
    setCreatingFirm(false);
    setCreateFirmModal(false);
    setNewFirmName("");
    await loadTeam(user.id,user.email||"");
  };

  const sendInvite=async()=>{
    if(!inviteEmail.trim()||!firm||!user)return;
    setInviting(true);setInviteError(null);
    // Check not already a member
    const existing=members.find(m=>m.email.toLowerCase()===inviteEmail.trim().toLowerCase());
    if(existing){setInviteError("This person is already in your team.");setInviting(false);return;}
    const{error}=await supabase.from("firm_members").insert({
      firm_id:firm.id,email:inviteEmail.trim().toLowerCase(),
      role:inviteRole,status:"pending",invited_by:user.id,
    });
    if(error){setInviteError("Failed to send invite — try again.");setInviting(false);return;}
    setInviteSuccess(true);
    setInviteEmail("");
    setInviteRole("editor");
    await loadTeam(user.id,user.email||"");
    setTimeout(()=>{setInviteSuccess(false);setInviteModal(false);},1800);
    setInviting(false);
  };

  const updateRole=async(memberId:string,newRole:string)=>{
    setEditingRole(memberId);
    await supabase.from("firm_members").update({role:newRole}).eq("id",memberId);
    setMembers(prev=>prev.map(m=>m.id===memberId?{...m,role:newRole}:m));
    setEditingRole(null);
  };

  const removeMember=async(member:any)=>{
    setRemovingId(member.id);
    await supabase.from("firm_members").delete().eq("id",member.id);
    setMembers(prev=>prev.filter(m=>m.id!==member.id));
    setConfirmRemove(null);
    setRemovingId(null);
  };

  const saveFirmName=async()=>{
    if(!firmName.trim()||!firm)return;
    setSavingFirmName(true);
    await supabase.from("firms").update({name:firmName.trim()}).eq("id",firm.id);
    setFirm((f:any)=>({...f,name:firmName.trim()}));
    setSavingFirmName(false);
    setFirmNameEdit(false);
  };

  const myMember=members.find(m=>m.user_id===user?.id);
  const isAdmin=myMember?.role==="admin";
  const activeMembers=members.filter(m=>m.status==="active");
  const pendingMembers=members.filter(m=>m.status==="pending");

  if(loading)return(
    <div style={{minHeight:"100vh",background:"#06070a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
      <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:22,color:"#c9a84c",letterSpacing:".12em",fontWeight:300}}>VALORA</div>
      <div style={{width:26,height:26,border:"2px solid rgba(201,168,76,.15)",borderTopColor:"#c9a84c",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"var(--font-body)"}}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"0 20px",height:52,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:40}}>
        <button onClick={()=>router.push("/dashboard")} style={{background:"none",border:"none",color:"var(--gold)",fontFamily:"var(--font-display)",fontSize:20,fontWeight:300,cursor:"pointer",letterSpacing:".1em"}}>VALORA</button>
        <div style={{width:1,height:16,background:"var(--border)"}}/>
        <button onClick={()=>router.push("/dashboard")} className="btn-ghost" style={{fontSize:11,padding:"4px 10px"}}>Dashboard</button>
        <button onClick={()=>router.push("/pipeline")} className="btn-ghost" style={{fontSize:11,padding:"4px 10px"}}>Pipeline</button>
        <button className="btn-ghost" style={{fontSize:11,padding:"4px 10px",borderColor:"var(--gold)",color:"var(--gold)"}}>Team</button>
        <div style={{flex:1}}/>
        <span style={{fontSize:11,color:"var(--text-d)",fontFamily:"var(--font-mono)"}}>{user?.email}</span>
      </nav>

      <div className="main" style={{maxWidth:760,margin:"0 auto",padding:"32px 24px"}}>

        {/* No firm yet */}
        {!firm&&(
          <div style={{textAlign:"center",padding:"60px 0"}}>
            <div style={{fontFamily:"var(--font-display)",fontSize:40,fontWeight:300,color:"var(--text-d)",marginBottom:12}}>◈</div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,marginBottom:8}}>No workspace yet</h1>
            <p style={{fontSize:13,color:"var(--text-d)",marginBottom:28,maxWidth:360,margin:"0 auto 28px"}}>Create a firm workspace to invite your team, share appraisals and collaborate on deals.</p>
            <button className="btn-primary" style={{padding:"12px 28px",fontSize:13}} onClick={()=>setCreateFirmModal(true)}>+ Create Team Workspace</button>
          </div>
        )}

        {/* Firm exists */}
        {firm&&(
          <>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,gap:12}}>
              <div>
                {firmNameEdit?(
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                    <input className="inp" value={firmName} onChange={e=>setFirmName(e.target.value)}
                      style={{fontSize:20,padding:"6px 10px",fontFamily:"var(--font-display)",fontWeight:300,width:280}}
                      onKeyDown={e=>e.key==="Enter"&&saveFirmName()} autoFocus/>
                    <button className="btn-primary" onClick={saveFirmName} disabled={savingFirmName} style={{padding:"6px 14px",fontSize:12}}>{savingFirmName?"Saving…":"Save"}</button>
                    <button className="btn-ghost" onClick={()=>{setFirmNameEdit(false);setFirmName(firm.name);}} style={{padding:"6px 12px",fontSize:12}}>Cancel</button>
                  </div>
                ):(
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                    <h1 style={{fontFamily:"var(--font-display)",fontSize:30,fontWeight:300,letterSpacing:".02em"}}>{firm.name||"My Team"}</h1>
                    {isAdmin&&<button onClick={()=>setFirmNameEdit(true)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:12,fontFamily:"var(--font-body)",padding:"2px 6px",borderRadius:4,transition:"color .2s"}}
                      onMouseEnter={e=>(e.currentTarget.style.color="var(--gold)")}
                      onMouseLeave={e=>(e.currentTarget.style.color="var(--text-d)")}>Edit</button>}
                  </div>
                )}
                <p style={{fontSize:12,color:"var(--text-d)"}}>{activeMembers.length} member{activeMembers.length!==1?"s":""}{pendingMembers.length>0?` · ${pendingMembers.length} pending invite${pendingMembers.length!==1?"s":""}`:""}</p>
              </div>
              {isAdmin&&(
                <button className="btn-primary" onClick={()=>{setInviteModal(true);setInviteError(null);setInviteSuccess(false);}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  Invite Member
                </button>
              )}
            </div>

            {/* Role legend */}
            <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
              {ROLES.map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8}}>
                  <span style={{fontSize:10,padding:"1px 7px",borderRadius:4,fontWeight:600,background:r.bg,color:r.color}}>{r.label}</span>
                  <span style={{fontSize:11,color:"var(--text-d)"}}>{r.desc}</span>
                </div>
              ))}
            </div>

            {/* Active members */}
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"4px 20px",marginBottom:16}}>
              <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".09em",padding:"14px 0 10px",borderBottom:"1px solid var(--border)"}}>Active Members ({activeMembers.length})</div>
              {activeMembers.length===0&&<div style={{textAlign:"center",padding:"24px 0",color:"var(--text-d)",fontSize:13}}>No active members yet</div>}
              {activeMembers.map(member=>{
                const ac=avatarColor(member.email||"");
                const role=ROLES.find(r=>r.id===member.role)||ROLES[1];
                const isMe=member.user_id===user?.id;
                return(
                  <div key={member.id} className="member-row">
                    <div className="avatar" style={{background:ac.bg,color:ac.color}}>{initials(member.email||"?")}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:500,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {member.email}
                        {isMe&&<span style={{fontSize:10,color:"var(--text-d)",marginLeft:8,fontWeight:400}}>you</span>}
                      </div>
                      <div style={{fontSize:11,color:"var(--text-d)",marginTop:2,fontFamily:"var(--font-mono)"}}>
                        Joined {new Date(member.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"})}
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}} className="member-actions">
                      {/* Role selector */}
                      {isAdmin&&!isMe?(
                        <select value={member.role}
                          onChange={e=>updateRole(member.id,e.target.value)}
                          disabled={editingRole===member.id}
                          style={{background:role.bg,border:`1px solid ${role.color}44`,borderRadius:5,color:role.color,fontFamily:"var(--font-body)",fontSize:11,padding:"3px 8px",cursor:"pointer",outline:"none",fontWeight:600}}>
                          {ROLES.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
                        </select>
                      ):(
                        <span className="role-badge" style={{background:role.bg,color:role.color,borderColor:`${role.color}44`}}>{role.label}</span>
                      )}
                      {/* Remove */}
                      {isAdmin&&!isMe&&(
                        <button className="btn-danger" onClick={()=>setConfirmRemove(member)}>Remove</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pending invites */}
            {pendingMembers.length>0&&(
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"4px 20px"}}>
                <div style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".09em",padding:"14px 0 10px",borderBottom:"1px solid var(--border)"}}>Pending Invites ({pendingMembers.length})</div>
                {pendingMembers.map(member=>{
                  const role=ROLES.find(r=>r.id===member.role)||ROLES[1];
                  return(
                    <div key={member.id} className="member-row" style={{opacity:.7}}>
                      <div className="avatar" style={{background:"var(--bg4)",color:"var(--text-d)",fontSize:18}}>✉</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,color:"var(--text-m)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{member.email}</div>
                        <div style={{fontSize:11,color:"var(--text-d)",marginTop:2}}>Invite sent · awaiting acceptance</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                        <span className="status-badge" style={{background:"rgba(240,164,41,.1)",color:"var(--amber)"}}>Pending</span>
                        <span className="role-badge" style={{background:role.bg,color:role.color,borderColor:`${role.color}44`}}>{role.label}</span>
                        {isAdmin&&(
                          <button className="btn-danger" onClick={()=>setConfirmRemove(member)}>Cancel</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* INVITE MODAL */}
      {inviteModal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setInviteModal(false);}}>
          <div className="modal">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:300}}>Invite Member</div>
              <button onClick={()=>setInviteModal(false)} style={{background:"none",border:"none",color:"var(--text-d)",cursor:"pointer",fontSize:22,lineHeight:1}}>×</button>
            </div>
            <p style={{fontSize:12,color:"var(--text-d)",marginBottom:24}}>They'll receive an invite to join {firm?.name||"your team"} on Valora.</p>

            {inviteSuccess?(
              <div style={{textAlign:"center",padding:"24px 0"}}>
                <div style={{fontSize:32,marginBottom:8}}>✓</div>
                <div style={{fontSize:14,color:"var(--green)",fontWeight:500}}>Invite sent successfully</div>
              </div>
            ):(
              <>
                <div style={{marginBottom:14}}>
                  <label style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:5}}>Email Address</label>
                  <input className="inp" type="email" placeholder="colleague@company.com" value={inviteEmail}
                    onChange={e=>setInviteEmail(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&sendInvite()} autoFocus/>
                </div>
                <div style={{marginBottom:20}}>
                  <label style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:5}}>Role</label>
                  <div style={{display:"flex",gap:8}}>
                    {ROLES.map(r=>(
                      <button key={r.id} onClick={()=>setInviteRole(r.id)}
                        style={{flex:1,padding:"10px 8px",borderRadius:8,border:`1px solid ${inviteRole===r.id?r.color+"66":"var(--border)"}`,background:inviteRole===r.id?r.bg:"var(--bg3)",cursor:"pointer",transition:"all .2s",textAlign:"center"}}>
                        <div style={{fontSize:11,fontWeight:600,color:inviteRole===r.id?r.color:"var(--text-m)",fontFamily:"var(--font-body)",marginBottom:3}}>{r.label}</div>
                        <div style={{fontSize:10,color:"var(--text-d)",lineHeight:1.3}}>{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {inviteError&&<div style={{background:"rgba(244,100,95,.08)",border:"1px solid rgba(244,100,95,.25)",borderRadius:7,padding:"10px 14px",fontSize:12,color:"var(--red)",marginBottom:14}}>{inviteError}</div>}
                <div style={{display:"flex",gap:8}}>
                  <button className="btn-ghost" onClick={()=>setInviteModal(false)} style={{flex:1,justifyContent:"center"}}>Cancel</button>
                  <button className="btn-primary" onClick={sendInvite} disabled={!inviteEmail.trim()||inviting} style={{flex:2,justifyContent:"center"}}>
                    {inviting?"Sending…":"Send Invite"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM REMOVE MODAL */}
      {confirmRemove&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setConfirmRemove(null);}}>
          <div className="modal" style={{width:400}}>
            <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,marginBottom:8,color:"var(--red)"}}>
              {confirmRemove.status==="pending"?"Cancel Invite":"Remove Member"}
            </div>
            <p style={{fontSize:13,color:"var(--text-m)",marginBottom:6}}>
              {confirmRemove.status==="pending"
                ?`Cancel the invite sent to ${confirmRemove.email}?`
                :`Remove ${confirmRemove.email} from ${firm?.name||"your team"}?`}
            </p>
            <p style={{fontSize:12,color:"var(--text-d)",marginBottom:24}}>They will lose access to all shared projects.</p>
            <div style={{display:"flex",gap:8}}>
              <button className="btn-ghost" onClick={()=>setConfirmRemove(null)} style={{flex:1,justifyContent:"center"}}>Cancel</button>
              <button onClick={()=>removeMember(confirmRemove)} disabled={removingId===confirmRemove.id}
                style={{flex:1,background:"var(--red)",color:"#fff",border:"none",borderRadius:7,padding:"9px 18px",fontFamily:"var(--font-body)",fontSize:13,fontWeight:600,cursor:"pointer",opacity:removingId===confirmRemove.id?.6:1}}>
                {removingId===confirmRemove.id?"Removing…":confirmRemove.status==="pending"?"Cancel Invite":"Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE FIRM MODAL */}
      {createFirmModal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setCreateFirmModal(false);}}>
          <div className="modal">
            <div style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:300,marginBottom:6}}>Create Team Workspace</div>
            <p style={{fontSize:12,color:"var(--text-d)",marginBottom:22}}>Give your firm or team a name to get started.</p>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:10,color:"var(--text-d)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:5}}>Firm / Team Name</label>
              <input className="inp" placeholder="e.g. Andrade Capital" value={newFirmName}
                onChange={e=>setNewFirmName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&createFirm()} autoFocus/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn-ghost" onClick={()=>setCreateFirmModal(false)} style={{flex:1,justifyContent:"center"}}>Cancel</button>
              <button className="btn-primary" onClick={createFirm} disabled={!newFirmName.trim()||creatingFirm} style={{flex:2,justifyContent:"center"}}>
                {creatingFirm?"Creating…":"Create Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
