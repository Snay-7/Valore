"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
/* ═══════════════════════════════════════════════════════════════════════
   VALORA — TEAM v2
   Rebranded to the Valora design system — top nav (not sidebar), centered
   max-w 900px content, member-card with member-row items, val-grid-3 of
   role-cards. All invite / role-change / remove / create-firm logic and
   Supabase calls preserved verbatim. Theme sync unified with dashboard +
   pipeline + tasks (body.light + html[data-theme] + localStorage).
   ═══════════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ─── VALORA TOKENS — DARK (default) ─── */
:root,
:root[data-theme="dark"]{
  --val-bg-app:#0F1115;--val-bg-panel:#1A1E26;--val-bg-panel-2:#242933;--val-bg-panel-3:#2D3340;
  --val-bg-overlay:rgba(15,17,21,0.72);
  --val-text:#F6F4EF;--val-text-mid:#C8CCD4;--val-text-dim:#949CA0;--val-text-faint:#6B7280;
  --val-gold:#C9A84C;
  --val-green:#52C498;--val-green-tint:rgba(82,196,152,0.12);--val-green-deep:#2E7D58;
  --val-amber:#F0A429;--val-amber-tint:rgba(240,164,41,0.12);
  --val-red:#F4645F;--val-red-tint:rgba(244,100,95,0.12);
  --val-blue:#5CA5DC;--val-blue-tint:rgba(92,165,220,0.12);
  --val-border:#383E4A;--val-border-lt:#4A505C;--val-border-accent:rgba(82,196,152,0.35);
  --val-font-body:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  --val-font-mono:'JetBrains Mono','SF Mono','Consolas',monospace;
  --val-r-xs:4px;--val-r-sm:6px;--val-r-md:8px;--val-r-lg:10px;--val-r-xl:12px;--val-r-pill:999px;
  --val-ease:cubic-bezier(0.16,1,0.3,1);
  --val-dur:180ms;
  /* Legacy aliases */
  --gold:var(--val-green);--gold-l:#5DD3A4;--gold-bg:var(--val-green-tint);--gold-border:var(--val-border-accent);
  --bg:var(--val-bg-app);--bg1:var(--val-bg-panel);--bg2:var(--val-bg-panel);
  --bg3:var(--val-bg-panel-2);--bg4:var(--val-bg-panel-3);--bg5:#383E4A;
  --text:var(--val-text);--text-m:var(--val-text-mid);--text-d:var(--val-text-dim);
  --border:var(--val-border);--border-m:var(--val-border-lt);
  --green:var(--val-green);--red:var(--val-red);--amber:var(--val-amber);--blue:var(--val-blue);--purple:#a78bfa;
  --font-display:var(--val-font-body);--font-body:var(--val-font-body);--font-mono:var(--val-font-mono);
}

/* ─── LIGHT ─── */
body.light,
:root[data-theme="light"]{
  --val-bg-app:#F8F5EE;--val-bg-panel:#FFFFFF;--val-bg-panel-2:#F2EEE4;--val-bg-panel-3:#EAE5D8;
  --val-bg-overlay:rgba(15,17,21,0.5);
  --val-text:#0F1115;--val-text-mid:#3D4351;--val-text-dim:#6B7280;--val-text-faint:#A0A5AE;
  --val-gold:#A8843A;
  --val-green:#2E9E72;--val-green-tint:rgba(46,158,114,0.10);--val-green-deep:#1F7050;
  --val-amber:#C57E14;--val-amber-tint:rgba(197,126,20,0.10);
  --val-red:#C24844;--val-red-tint:rgba(194,72,68,0.10);
  --val-blue:#2D7AB5;--val-blue-tint:rgba(45,122,181,0.10);
  --val-border:rgba(15,17,21,0.10);--val-border-lt:rgba(15,17,21,0.18);--val-border-accent:rgba(46,158,114,0.35);
  --gold-l:#1F7050;
  --purple:#7C3AED;
}

body{background:var(--val-bg-app);color:var(--val-text);font-family:var(--val-font-body);font-size:14px;line-height:1.45;font-weight:400;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
::selection{background:var(--val-green-tint);color:var(--val-text)}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--val-border-lt);border-radius:var(--val-r-pill);border:2px solid var(--val-bg-app)}
::-webkit-scrollbar-thumb:hover{background:var(--val-text-dim)}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

/* ═══ BUTTONS ═══ */
.btn-primary{
  background:var(--val-green);color:var(--val-bg-app);
  border:none;border-radius:var(--val-r-sm);
  height:34px;padding:0 16px;
  font-family:var(--val-font-body);font-size:13px;font-weight:600;letter-spacing:-0.015em;
  cursor:pointer;transition:background var(--val-dur) var(--val-ease),transform .1s var(--val-ease);
  white-space:nowrap;
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
}
.btn-primary:hover{background:#5DD3A4}
body.light .btn-primary:hover,
:root[data-theme="light"] .btn-primary:hover{background:var(--val-green-deep)}
.btn-primary:active{transform:translateY(1px)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}

.btn-ghost{
  background:transparent;color:var(--val-text-mid);
  border:1px solid var(--val-border-lt);border-radius:var(--val-r-sm);
  height:32px;padding:0 14px;
  font-family:var(--val-font-body);font-size:12px;font-weight:600;letter-spacing:-0.015em;
  cursor:pointer;transition:all var(--val-dur) var(--val-ease);
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  white-space:nowrap;
}
.btn-ghost:hover{border-color:var(--val-text-dim);color:var(--val-text)}

.btn-danger{
  background:transparent;color:var(--val-red);
  border:1px solid rgba(244,100,95,.3);border-radius:var(--val-r-sm);
  height:28px;padding:0 12px;
  font-family:var(--val-font-body);font-size:11px;font-weight:600;letter-spacing:-0.015em;
  cursor:pointer;transition:all var(--val-dur) var(--val-ease);
}
.btn-danger:hover{background:var(--val-red-tint);border-color:var(--val-red)}

/* ═══ INPUTS ═══ */
.inp{
  width:100%;height:40px;padding:0 12px;
  background:var(--val-bg-panel-2);
  border:1px solid var(--val-border);border-radius:var(--val-r-md);
  color:var(--val-text);
  font-family:var(--val-font-body);font-size:13px;font-weight:500;
  outline:none;
  transition:border-color var(--val-dur) var(--val-ease),box-shadow var(--val-dur) var(--val-ease);
}
.inp:hover{border-color:var(--val-border-lt)}
.inp:focus{border-color:var(--val-green);box-shadow:0 0 0 3px var(--val-green-tint)}
.inp::placeholder{color:var(--val-text-faint);font-family:var(--val-font-body);font-weight:400}
select.inp{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%23949CA0' stroke-width='1.5' fill='none' stroke-linecap='round'/></svg>");background-repeat:no-repeat;background-position:right 14px center;padding-right:32px}

/* ═══ MEMBER ROW (matches mockup .member-row) ═══ */
.member-row{
  display:flex;align-items:center;gap:16px;
  padding:14px 0;
  border-bottom:1px solid var(--val-border);
  animation:fadeIn .2s var(--val-ease);
}
.member-row:last-child{border-bottom:none}

/* ═══ AVATAR (matches mockup .member-avatar) ═══ */
.avatar{
  width:44px;height:44px;
  border-radius:var(--val-r-pill);
  display:grid;place-items:center;
  font-size:14px;font-weight:700;
  flex-shrink:0;letter-spacing:.02em;
}

/* ═══ MODAL (matches val-modal) ═══ */
.modal-overlay{
  position:fixed;inset:0;
  background:var(--val-bg-overlay);backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;z-index:200;
  animation:fadeIn .15s var(--val-ease);
}
.modal{
  background:var(--val-bg-panel);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-xl);padding:28px;
  width:480px;max-width:calc(100vw - 32px);
  max-height:90vh;overflow-y:auto;
  box-shadow:0 20px 60px rgba(0,0,0,0.45);
}
body.light .modal,
:root[data-theme="light"] .modal{box-shadow:0 20px 60px rgba(15,17,21,0.15)}

/* ═══ RESPONSIVE ═══ */
@media(max-width:768px){
  .main{padding:24px 16px !important}
  .member-row{flex-wrap:wrap;gap:12px}
  .member-actions{width:100% !important;margin-left:0 !important;justify-content:flex-start !important}
  .page-header{flex-direction:column !important;align-items:flex-start !important;gap:14px !important}
  .val-grid-3{grid-template-columns:1fr !important}
}
`;
const ROLES=[
  {id:"admin", label:"Admin",  desc:"Full access — manage team & all projects", tintVar:"--val-green-tint", colorVar:"--val-green", proOnly:true},
  {id:"editor",label:"Editor", desc:"Create and edit appraisals and tasks",      tintVar:"--val-blue-tint",  colorVar:"--val-blue",  proOnly:false},
  {id:"viewer",label:"Viewer", desc:"Read-only access to shared projects",       tintVar:"--val-green-tint", colorVar:"--val-green", proOnly:false},
];
const AVATAR_BG=[
  {tint:"var(--val-green-tint)",c:"var(--val-green)"},
  {tint:"var(--val-blue-tint)", c:"var(--val-blue)"},
  {tint:"rgba(82,196,152,0.18)",c:"var(--val-green)"},
  {tint:"var(--val-amber-tint)",c:"var(--val-amber)"},
  {tint:"var(--val-red-tint)",  c:"var(--val-red)"},
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
  // ── Unified theme sync ──
  useEffect(() => {
    const detectTheme = (): "dark" | "light" => {
      if (typeof document === "undefined") return "light";
      if (document.body && document.body.classList.contains("light")) return "light";
      const htmlTheme = document.documentElement.getAttribute("data-theme");
      if (htmlTheme === "light" || htmlTheme === "dark") return htmlTheme;
      try {
        for (const key of ["valora-theme", "val-theme", "theme"]) {
          const v = localStorage.getItem(key);
          if (v === "light" || v === "dark") return v;
        }
      } catch {}
      return "light";
    };
    const applyTheme = (t: "dark" | "light") => {
      document.documentElement.setAttribute("data-theme", t);
      document.body.classList.toggle("light", t === "light");
      try { localStorage.setItem("valora-theme", t); } catch {}
      try { localStorage.setItem("val-theme", t); } catch {}
    };
    const resync = () => applyTheme(detectTheme());
    resync();
    const onStorage = (e: StorageEvent) => { if (e.key && /theme/i.test(e.key)) resync(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", resync);
    document.addEventListener("visibilitychange", resync);
    const bodyObs = new MutationObserver(resync);
    bodyObs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    const htmlObs = new MutationObserver(resync);
    htmlObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", resync);
      document.removeEventListener("visibilitychange", resync);
      bodyObs.disconnect();
      htmlObs.disconnect();
    };
  }, []);
  const tickChecklist = (key: string) => {
    try {
      const raw = localStorage.getItem("valora_checklist");
      const current = raw ? JSON.parse(raw) : {};
      if (!current[key]) {
        current[key] = true;
        localStorage.setItem("valora_checklist", JSON.stringify(current));
      }
    } catch(e) {}
  };
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
    const{data:myRow}=await supabase.from("firm_members").select("*,firms(*)").eq("user_id",uid).maybeSingle();
    if(myRow?.firms){
      const f=myRow.firms as any;
      setFirm(f);setNameVal(f.name||"");
      const{data:allMembers}=await supabase.from("firm_members").select("*").eq("firm_id",f.id).order("joined_at",{ascending:true});
      setMembers(allMembers||[]);
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
    if(member.email)return member.email;
    if(userProfiles[member.user_id])return userProfiles[member.user_id];
    if(member.user_id===user?.id)return user.email||"—";
    return member.user_id?.slice(0,8)+"…"||"—";
  };
  const getMemberName=(member:any):string=>{
    if(member.Name)return member.Name;
    return getMemberEmail(member);
  };
  const createFirm=async()=>{
    if(!newFirmName.trim()||!user)return;
    setCreating(true);
    const{data:f,error:fe}=await supabase.from("firms").insert({name:newFirmName.trim(),owner_id:user.id}).select().single();
    if(fe||!f){setCreating(false);return;}
    await supabase.from("firm_members").insert({firm_id:f.id,user_id:user.id,role:"admin",invited_by:user.id});
    setCreating(false);setCreateModal(false);setNewFirmName("");
    await load(user.id);
  };
  const sendInvite=async()=>{
    const email=inviteEmail.trim().toLowerCase();
    if(!email||!firm||!user)return;
    setInviting(true);setInviteErr(null);
    if(members.find(m=>m.email?.toLowerCase()===email&&m.user_id)){
      setInviteErr("This person is already in your team.");setInviting(false);return;
    }
    const token=crypto.randomUUID();
    const{error:tokenErr}=await supabase.from("firm_invites").insert({
      firm_id:firm.id,email,role:inviteRole,invited_by:user.id,token,
    });
    if(tokenErr){setInviteErr(tokenErr.message||"Failed to create invite.");setInviting(false);return;}
    await supabase.from("firm_members").upsert(
      {firm_id:firm.id,email,role:inviteRole,invited_by:user.id},
      {onConflict:"firm_id,email",ignoreDuplicates:true}
    );
    const inviteLink=`${window.location.origin}/invite/${token}`;
    try{
      const res=await fetch("/api/invite",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,firmName:firm.name,inviteLink,inviterEmail:user.email,role:inviteRole}),
      });
      const result=await res.json();
      if(!result.sent){console.warn("Email not sent:",result.error||result.message);}
    }catch(emailErr){console.warn("Email send failed:",emailErr);}
    tickChecklist("invited_team");
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
  const tier=subscription?.tier||"free";
  const trialEndsAt=subscription?.trial_ends_at?new Date(subscription.trial_ends_at):null;
  const isTrialing=trialEndsAt&&trialEndsAt>new Date();
  const trialDaysLeft=isTrialing?Math.ceil((trialEndsAt!.getTime()-Date.now())/(1000*60*60*24)):0;
  const isEnterprise=tier==="enterprise"||isTrialing;
  const isPro=tier==="professional"||isEnterprise;
  const canInvite=isPro;
  const canCreateFirm=isPro;
  if(loading)return(
    <div style={{minHeight:"100vh",background:"var(--val-bg-app, #0F1115)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
      <span style={{fontFamily:"'Poppins',system-ui,sans-serif",fontSize:22,fontWeight:700,letterSpacing:"-.015em",color:"var(--val-text, #F6F4EF)"}}>Valora</span>
      <div style={{width:26,height:26,border:"2px solid rgba(82,196,152,.15)",borderTopColor:"#52C498",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <div style={{fontSize:11,color:"var(--val-text-dim, #6B7280)",letterSpacing:".08em",textTransform:"uppercase",fontWeight:500}}>Loading team…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  return(
    <div style={{minHeight:"100vh",background:"var(--val-bg-app)",color:"var(--val-text)",fontFamily:"var(--val-font-body)"}}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var keys=['valora-theme','val-theme','theme'];for(var i=0;i<keys.length;i++){var v=localStorage.getItem(keys[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='light';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');else if(document.body)document.body.classList.remove('light');try{localStorage.setItem('valora-theme',t);localStorage.setItem('val-theme',t);}catch(e){}}catch(e){}})()`}}/>
      {/* ── TOP NAV (matches .team-topnav mockup) ── */}
      <nav style={{height:56,background:"var(--val-bg-panel)",borderBottom:"1px solid var(--val-border)",padding:"0 24px",display:"flex",alignItems:"center",position:"sticky",top:0,zIndex:40}}>
        <span onClick={()=>router.push("/dashboard")} style={{fontFamily:"var(--val-font-body)",fontSize:22,fontWeight:700,letterSpacing:"-.015em",color:"var(--val-text)",cursor:"pointer"}}>Valora</span>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>router.push("/dashboard")} className="btn-ghost" style={{height:28,padding:"0 12px",fontSize:12}}>← Dashboard</button>
          <button onClick={async()=>{await supabase.auth.signOut();router.push("/");}} className="btn-ghost" style={{height:28,padding:"0 12px",fontSize:12}}>Sign Out</button>
        </div>
      </nav>
      <div className="main" style={{maxWidth:900,margin:"0 auto",padding:"64px 24px",overflowX:"hidden"}}>
        {/* No firm */}
        {!firm&&(
          <div style={{textAlign:"center",padding:"80px 0"}}>
            <div style={{fontFamily:"var(--val-font-body)",fontSize:44,fontWeight:700,color:"var(--val-text-dim)",marginBottom:16,letterSpacing:"-.015em"}}>◈</div>
            <h1 style={{fontFamily:"var(--val-font-body)",fontSize:28,fontWeight:700,marginBottom:10,letterSpacing:"-.015em",color:"var(--val-text)"}}>No team workspace yet</h1>
            <p style={{fontSize:14,color:"var(--val-text-dim)",marginBottom:32,maxWidth:380,margin:"0 auto 32px",fontWeight:500,lineHeight:1.5}}>Create a workspace to invite your team, assign roles and collaborate on deals.</p>
            {canCreateFirm ? (
              <button className="btn-primary" style={{height:40,padding:"0 24px",fontSize:13}} onClick={()=>setCreateModal(true)}>+ Create Team Workspace</button>
            ) : (
              <div>
                <button className="btn-primary" style={{height:40,padding:"0 24px",fontSize:13,background:"var(--val-bg-panel)",border:"1px solid var(--val-border-accent)",color:"var(--val-green)"}} onClick={()=>router.push("/pricing")}>✦ Upgrade to Create Team</button>
                <p style={{fontSize:11,color:"var(--val-text-dim)",marginTop:12,fontWeight:500}}>Available on Pro and Enterprise plans.</p>
              </div>
            )}
          </div>
        )}
        {/* Firm exists */}
        {firm&&(
          <>
            {/* Header */}
            <div className="page-header" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,gap:16}}>
              <div>
                {editName?(
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                    <input className="inp" value={nameVal} onChange={e=>setNameVal(e.target.value)}
                      style={{fontSize:22,padding:"0 12px",height:40,fontFamily:"var(--val-font-body)",fontWeight:700,letterSpacing:"-.015em",width:280}}
                      onKeyDown={e=>{if(e.key==="Enter")saveName();if(e.key==="Escape"){setEditName(false);setNameVal(firm.name);}}}
                      autoFocus/>
                    <button className="btn-primary" onClick={saveName} disabled={savingName||!nameVal.trim()}>{savingName?"Saving…":"Save"}</button>
                    <button className="btn-ghost" onClick={()=>{setEditName(false);setNameVal(firm.name);}}>Cancel</button>
                  </div>
                ):(
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
                    <h1 style={{fontFamily:"var(--val-font-body)",fontSize:34,fontWeight:700,letterSpacing:"-.03em",lineHeight:1,color:"var(--val-text)"}}>{firm.name||"My Team"}</h1>
                    <button onClick={()=>setEditName(true)} className="btn-ghost" style={{height:28,padding:"0 10px",fontSize:11}}>Rename</button>
                  </div>
                )}
                <p style={{fontSize:13,color:"var(--val-text-dim)",fontWeight:500}}>{members.length} member{members.length!==1?"s":""} · {isAdmin?"Admin":"Member"}</p>
              </div>
              {canInvite ? (
                <button className="btn-primary" onClick={()=>{setShowInvite(true);setInviteErr(null);setInviteOk(false);setInviteEmail("");setInviteRole("editor");}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  Invite Member
                </button>
              ) : (
                <button className="btn-primary" onClick={()=>router.push("/pricing")} style={{background:"var(--val-bg-panel)",border:"1px solid var(--val-border-accent)",color:"var(--val-green)"}}>
                  ✦ Upgrade to Invite
                </button>
              )}
            </div>
            {/* Trial banner */}
            {isTrialing&&(
              <div style={{background:"var(--val-green-tint)",border:"1px solid var(--val-border-accent)",borderRadius:10,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--val-green)",marginBottom:2,letterSpacing:"-.015em"}}>✦ Enterprise Trial — {trialDaysLeft} day{trialDaysLeft!==1?"s":""} remaining</div>
                  <div style={{fontSize:12,color:"var(--val-text-mid)",fontWeight:500}}>You have full access to all features during your trial.</div>
                </div>
                <button className="btn-primary" onClick={()=>router.push("/pricing")} style={{height:30,padding:"0 14px",fontSize:12,flexShrink:0}}>Upgrade Now</button>
              </div>
            )}
            {/* Free/Starter upgrade prompt */}
            {!isPro&&!isTrialing&&(
              <div style={{background:"var(--val-bg-panel)",border:"1px solid var(--val-border)",borderRadius:10,padding:28,marginBottom:20,textAlign:"center"}}>
                <div style={{fontFamily:"var(--val-font-body)",fontSize:22,fontWeight:700,letterSpacing:"-.015em",marginBottom:8,color:"var(--val-text)"}}>Upgrade to invite your team</div>
                <p style={{fontSize:13,color:"var(--val-text-mid)",marginBottom:20,maxWidth:420,margin:"0 auto 20px",fontWeight:500,lineHeight:1.5}}>Pro users can invite other Pro collaborators. Enterprise gets full team workspace with roles and shared projects.</p>
                <button className="btn-primary" onClick={()=>router.push("/pricing")} style={{height:40,padding:"0 24px"}}>View Plans →</button>
              </div>
            )}
            {/* Members list (matches .member-card from mockup) */}
            <div style={{background:"var(--val-bg-panel)",border:"1px solid var(--val-border)",borderRadius:10,padding:"0 20px",marginBottom:24}}>
              <div style={{fontSize:11,color:"var(--val-text-dim)",textTransform:"uppercase",letterSpacing:".14em",padding:"16px 0 12px",borderBottom:"1px solid var(--val-border)",fontWeight:600}}>
                Team Members ({members.length})
              </div>
              {members.length===0&&(
                <div style={{textAlign:"center",padding:"32px 0",color:"var(--val-text-dim)",fontSize:13,fontWeight:500}}>No members yet — invite your team</div>
              )}
              {members.map(m=>{
                const email=getMemberEmail(m);
                const ac=avColor(email);
                const role=ROLES.find(r=>r.id===m.role)||ROLES[1];
                const isMe=m.user_id===user?.id;
                return(
                  <div key={m.id} className="member-row">
                    <div className="avatar" style={{background:ac.tint,color:ac.c}}>{initials(email)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <span style={{fontSize:15,fontWeight:700,color:"var(--val-text)",letterSpacing:"-.015em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:360}}>{getMemberName(m)}</span>
                        {isMe&&<span style={{fontSize:10,color:"var(--val-text-dim)",background:"rgba(148,152,160,0.12)",border:"1px solid var(--val-border)",padding:"1px 8px",borderRadius:999,flexShrink:0,fontWeight:600,letterSpacing:"-.015em"}}>you</span>}
                      </div>
                      {getMemberName(m)!==email&&<div style={{fontSize:12,color:"var(--val-text-dim)",marginTop:2,fontWeight:500}}>{email}</div>}
                      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,padding:"2px 10px",borderRadius:999,fontWeight:600,background:`var(${role.tintVar})`,color:`var(${role.colorVar})`,border:`1px solid var(${role.colorVar})`,letterSpacing:"-.015em"}}>{role.label}</span>
                        <span style={{fontSize:11,color:"var(--val-text-dim)",fontFamily:"var(--val-font-mono)",fontVariantNumeric:"tabular-nums",fontWeight:500}}>
                          {m.joined_at?`Joined ${fmtDate(m.joined_at)}`:"Pending"}
                        </span>
                      </div>
                    </div>
                    {!isMe&&(
                      <div className="member-actions" style={{display:"flex",gap:6,flexShrink:0,marginLeft:"auto"}}>
                        <button className="btn-ghost" style={{height:28,padding:"0 12px",fontSize:11}}
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
            {/* Role guide (val-grid-3 of role-cards from mockup) */}
            <div className="val-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {ROLES.map(r=>(
                <div key={r.id} style={{background:"var(--val-bg-panel)",border:"1px solid var(--val-border)",borderRadius:10,padding:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <span style={{fontSize:11,padding:"2px 10px",borderRadius:999,fontWeight:600,background:`var(${r.tintVar})`,color:`var(${r.colorVar})`,border:`1px solid var(${r.colorVar})`,letterSpacing:"-.015em"}}>{r.label}</span>
                    {r.proOnly&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:4,fontWeight:700,background:"var(--val-green-deep)",color:"#fff",letterSpacing:".04em"}}>PRO</span>}
                  </div>
                  <div style={{fontSize:13,color:"var(--val-text-dim)",lineHeight:1.5,fontWeight:500}}>{r.desc}</div>
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
              <div style={{fontFamily:"var(--val-font-body)",fontSize:22,fontWeight:700,letterSpacing:"-.015em",color:"var(--val-text)"}}>Invite Member</div>
              <button onClick={()=>setShowInvite(false)} style={{background:"none",border:"none",color:"var(--val-text-dim)",cursor:"pointer",fontSize:22,lineHeight:1}}>×</button>
            </div>
            <p style={{fontSize:13,color:"var(--val-text-dim)",marginBottom:22,fontWeight:500}}>Invite someone to join <strong style={{color:"var(--val-text)",fontWeight:600}}>{firm?.name}</strong>.</p>
            {inviteOk?(
              <div style={{textAlign:"center",padding:"32px 0"}}>
                <div style={{fontSize:40,color:"var(--val-green)",marginBottom:8}}>✓</div>
                <div style={{fontSize:14,color:"var(--val-green)",fontWeight:600,letterSpacing:"-.015em"}}>Invite sent to {inviteEmail}</div>
                <div style={{fontSize:12,color:"var(--val-text-dim)",marginTop:6,fontWeight:500}}>They'll receive an email with a link to join {firm?.name}</div>
              </div>
            ):(
              <>
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:11,color:"var(--val-text-dim)",textTransform:"uppercase",letterSpacing:".04em",display:"block",marginBottom:6,fontWeight:600}}>Email Address *</label>
                  <input className="inp" type="email" placeholder="colleague@company.com"
                    value={inviteEmail} onChange={e=>{setInviteEmail(e.target.value);setInviteErr(null);}}
                    onKeyDown={e=>e.key==="Enter"&&sendInvite()} autoFocus/>
                </div>
                <div style={{marginBottom:20}}>
                  <label style={{fontSize:11,color:"var(--val-text-dim)",textTransform:"uppercase",letterSpacing:".04em",display:"block",marginBottom:10,fontWeight:600}}>Role</label>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                    {ROLES.map(r=>{
                      const locked=r.proOnly&&!isPro;
                      const active=inviteRole===r.id&&!locked;
                      return(
                        <button key={r.id} onClick={()=>locked?router.push("/pricing"):setInviteRole(r.id)}
                          style={{padding:"12px 8px",borderRadius:"var(--val-r-md)",border:`1px solid ${active?`var(${r.colorVar})`:"var(--val-border)"}`,background:active?`var(${r.tintVar})`:"var(--val-bg-panel-2)",cursor:"pointer",transition:"all .15s var(--val-ease)",textAlign:"center",outline:"none",position:"relative",opacity:locked?.6:1,fontFamily:"var(--val-font-body)"}}>
                          {locked&&<span style={{position:"absolute",top:6,right:6,fontSize:9,background:"var(--val-green-deep)",color:"#fff",padding:"1px 6px",borderRadius:4,fontWeight:700,letterSpacing:".04em"}}>PRO</span>}
                          <div style={{fontSize:12,fontWeight:600,color:active?`var(${r.colorVar})`:"var(--val-text-mid)",marginBottom:3,letterSpacing:"-.015em"}}>{r.label}</div>
                          <div style={{fontSize:10,color:"var(--val-text-dim)",lineHeight:1.4,fontWeight:500}}>{locked?"Upgrade to Pro to assign":r.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {inviteErr&&<div style={{background:"var(--val-red-tint)",border:"1px solid rgba(244,100,95,.3)",borderRadius:"var(--val-r-md)",padding:"10px 14px",fontSize:12,color:"var(--val-red)",marginBottom:14,fontWeight:500}}>{inviteErr}</div>}
                <div style={{display:"flex",gap:8}}>
                  <button className="btn-ghost" onClick={()=>setShowInvite(false)} style={{flex:1,height:40}}>Cancel</button>
                  <button className="btn-primary" onClick={sendInvite} disabled={!inviteEmail.trim()||inviting} style={{flex:2,height:40}}>
                    {inviting?<><span style={{width:12,height:12,border:"1.5px solid rgba(15,17,21,0.4)",borderTopColor:"var(--val-bg-app)",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Adding…</>:"Add Member →"}
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
          <div className="modal" style={{width:460}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontFamily:"var(--val-font-body)",fontSize:22,fontWeight:700,letterSpacing:"-.015em",color:"var(--val-text)"}}>Change Role</div>
              <button onClick={()=>setRoleModal(null)} style={{background:"none",border:"none",color:"var(--val-text-dim)",cursor:"pointer",fontSize:22,lineHeight:1}}>×</button>
            </div>
            <p style={{fontSize:13,color:"var(--val-text-dim)",marginBottom:20,fontWeight:500}}>{getMemberEmail(roleModal)}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:20}}>
              {ROLES.map(r=>{
                const locked=r.proOnly&&!isPro;
                const active=newRole===r.id&&!locked;
                return(
                  <button key={r.id} onClick={()=>locked?router.push("/pricing"):setNewRole(r.id)}
                    style={{padding:"12px 8px",borderRadius:"var(--val-r-md)",border:`1px solid ${active?`var(${r.colorVar})`:"var(--val-border)"}`,background:active?`var(${r.tintVar})`:"var(--val-bg-panel-2)",cursor:"pointer",transition:"all .15s var(--val-ease)",textAlign:"center",outline:"none",position:"relative",opacity:locked?.6:1,fontFamily:"var(--val-font-body)"}}>
                    {locked&&<span style={{position:"absolute",top:6,right:6,fontSize:9,background:"var(--val-green-deep)",color:"#fff",padding:"1px 6px",borderRadius:4,fontWeight:700,letterSpacing:".04em"}}>PRO</span>}
                    <div style={{fontSize:12,fontWeight:600,color:active?`var(${r.colorVar})`:"var(--val-text-mid)",marginBottom:3,letterSpacing:"-.015em"}}>{r.label}</div>
                    <div style={{fontSize:10,color:"var(--val-text-dim)",lineHeight:1.4,fontWeight:500}}>{locked?"Upgrade to Pro to assign":r.desc}</div>
                  </button>
                );
              })}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn-ghost" onClick={()=>setRoleModal(null)} style={{flex:1,height:40}}>Cancel</button>
              <button className="btn-primary" onClick={changeRole} disabled={savingRole||newRole===roleModal.role} style={{flex:1,height:40}}>
                {savingRole?"Saving…":"Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── REMOVE MODAL ── */}
      {removeModal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setRemoveModal(null);}}>
          <div className="modal" style={{width:420}}>
            <div style={{fontFamily:"var(--val-font-body)",fontSize:22,fontWeight:700,letterSpacing:"-.015em",marginBottom:8,color:"var(--val-red)"}}>Remove Member</div>
            <p style={{fontSize:13,color:"var(--val-text-mid)",marginBottom:6,fontWeight:500}}>Remove {getMemberEmail(removeModal)} from {firm?.name}?</p>
            <p style={{fontSize:12,color:"var(--val-text-dim)",marginBottom:24,fontWeight:500}}>They will lose access to all shared projects immediately.</p>
            <div style={{display:"flex",gap:8}}>
              <button className="btn-ghost" onClick={()=>setRemoveModal(null)} style={{flex:1,height:40}}>Cancel</button>
              <button onClick={removeMember} disabled={removing}
                style={{flex:1,height:40,background:"var(--val-red)",color:"#fff",border:"none",borderRadius:"var(--val-r-sm)",padding:"0 18px",fontFamily:"var(--val-font-body)",fontSize:13,fontWeight:600,letterSpacing:"-.015em",cursor:"pointer",opacity:removing?.6:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
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
            <div style={{fontFamily:"var(--val-font-body)",fontSize:22,fontWeight:700,letterSpacing:"-.015em",marginBottom:6,color:"var(--val-text)"}}>Create Team Workspace</div>
            <p style={{fontSize:13,color:"var(--val-text-dim)",marginBottom:22,fontWeight:500}}>Give your firm or team a name. You can rename it anytime.</p>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:11,color:"var(--val-text-dim)",textTransform:"uppercase",letterSpacing:".04em",display:"block",marginBottom:6,fontWeight:600}}>Firm / Team Name *</label>
              <input className="inp" placeholder="e.g. Andrade Capital" value={newFirmName}
                onChange={e=>setNewFirmName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&createFirm()} autoFocus/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn-ghost" onClick={()=>setCreateModal(false)} style={{flex:1,height:40}}>Cancel</button>
              <button className="btn-primary" onClick={createFirm} disabled={!newFirmName.trim()||creating} style={{flex:2,height:40}}>
                {creating?"Creating…":"Create Workspace →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
