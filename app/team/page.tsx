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
  const tier=subscription?.tier||"free";
  const trialEndsAt=subscription?.trial_ends_at?new Date(subscription.trial_ends_at):null;
  const isTrialing=trialEndsAt&&trialEndsAt>new Date();
  const trialDaysLeft=isTrialing?Math.ceil((trialEndsAt!.getTime()-Date.now())/(1000*60*60*24)):0;
  const isEnterprise=tier==="enterprise"||isTrialing;
  const isPro=tier==="professional"||isEnterprise;
  const canInvite=isPro; // Pro can invite other Pro, Enterprise gets full workspace
  const canCreateFirm=isPro;

  if(loading)return(
    <div style={{minHeight:"100vh",background:"#06070a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHMAAABkCAYAAAC1kA/FAAA77klEQVR42rW9aZAk1ZUm+p1zr7tHREbWlgVCIAQIqdACWgBtMJJoLSAk0K4WosdG6hkz9Y+xHus3Uo9Zd//o7h+PZ8+s9cze6/4j/Rn1eyOp26ZBQiAhEEiFgAIBRYGoYimgKKCoJauyKvcMd7/3nPfjXvfwiIzIzAJNlIVVRmRk+HLuPct3vnMOnfOWi2FZYH0Bny/vMKQzAFCIflhIpsBYIEjGYmag2rVI74XBDMh3vbrLvNKUqm5XRRcAiMxBVd1O4t9IRDMEBQB40R1pu/NfmCyUDVQZxhhwCUA9lEsAAiGAYABKABBILYgUgACkUPUAGCAGEQEq4XcAVMOxiAjVQ0Tqn6v3+78XCBSqCoYBkQFJ/ztEBF4ZbBSlX0aSMlQV3gGMSRAZCDwUJYpefploeZlVOsxGZsq8+LZN+C5L/KSqTqnqFAAo00I4tmZKAMEedCqXMNkniXVBRHYAMmlAR1QpNWIPquoUG1eYJHuQaALCBsQOCg+IgjWcL51/wQ6kCeOsqUmFy3elTFcYw/BEIFtdvIKUAQFYGcoKIoQLIYDIQFVBYBiTQNWDQWBDIKL6d6fm5ncdOXbySqEEYAOCAXsGSKAoICRRQNwQJodzYImCjEIjGy4AQdCVIJuPSiDDwhx4cBAmKa8SpodCBSAGwCUUPhxHLZjagCgUBVIruPDCCxXqQKqAeFjLcGVRX3+1sFQVAq0XE8D1OSohCIcZzAwVQD3ANkFvpcDc/NL2lZJmeoUDWQ/vS1hOwPHrbEt7aBHj85++Fuecue2Kdkro9ZbR6XShTPDeg5mRcLh5TBbGEqw1gAEE4eAgC2MMEpOCOew6YwjWhr9rtSdw+OjJK/7if/tvFy+u9PYaaqPwAqIEirAbCRQEQwCRAGpW7brh/4kwUpDNz4wV5KqHQDUsKCEDaBBAkiRY6S1PtVrpjKjAi8CwIEkEvfnp//rZL17z3b/8y7/E3OwJGBBUHAAFVOG9rwUpInDOwUkJ1aBlLLT+XSke8AIlA8DCR+GryfDqoTnc9H/+3zOlZ7SzDMt5D8zhOzyClrJZkmBu9vjfPvy7Xfj8Zz+J48dPIEsI5cpJlGUJYxIQWxhiaOPGMQPGEpjDFwksCIyEE7BBfaONIZBNUJQO77n0Q7j+2quf/O//77/u2rpt4krvFUJRXBRXZjyxKA4oNL6u1KlCiUHx94i/bwrudIRYa44xnyPDKIoCSZLNiFC8dgWxwOdLmNqSLd74lc9g+tB+LC0vAN5DfBnPw4NUIQBIFU4E4hxK78NuJAG7IHhVhZcSKgQlgqhB6RVqge7kG3DrrbdhZSW/OJvo7g1yMTCW4MqGklkpFVl7898/se/ZS14+cgyUpijVgS2h02mBSGEYMAnDZhY2YyQtg6SVIMsyZEmK1CbI2CJlRmIZlg2YBNAS1igS49GZyPD8c8/i6qs/hTe96U3fzfMShpNavWgUYm3XFKCgBUHiwXGHVp9pfnaUgMb9fvjvVQkARxUuo/Y3iAiJbUE8wVAK9YJWylhYnHn1S5+/9ntnnTmF3vICjHowebQzA0gBywDiuTMUlgHLhNQyWqlFK7HIbIJ2kqJlE7RMhozjvTRAlhC63S72PfMsdj+x7/Kk3d3rPAE2gRNF6TBwnaywUJPAUbb3rt88cDjtTEIpQVmW8FIGwYAGVio47gupdkQQBLOBMQaWg0CNIYAEzhXwrofllXl0JlJc+5mrb15cmvs3Tz6sWiKACQoOzk39DKqvFgpJbcM17uSgrhT/Kx9JkqAoHJgtVIDEGJyanf7WBRec80+f+cy1OHL4MDg6aakNNnBiog0RV2uvYHYMrLWwluPTgtMMMCmIExAsiEz/fiYWRBl+cefOZ0U5dSDAGiyvLF6cpK2wGbgvG/YKOLFIks048NL0n/5+3wF0J7dByYRdZywSNuChFU2UBIeBUxibwqYpTGKDUAhQknjzFR4Crw42ZRyefgWfuvYqvOm87TeXbrFLLFG9BhWr4OAAjVKT8f1KgM3nRh+rPi8UnnHxVC+rzxlLKIoCDAIpoN4jSQzKYvl//+pXPn/TRLcNYoZJLExi4aGAYawUJWzWgrEpyASHT8kAbAATPHpPDMcW3mQQ0walXZh0Epy2kbQytCY247EnnsfzLxy9OWl3HvTqkLtlZO10rytKFEXR12wEsBJAbFA4gKh913337b6mLA2MyVDkYWURRY9PFJDg+XGw7xBRCIKeV6Jo08JuMiZ4ua00hWUDqEdveRbqlnDDDZ/70fLS8QVQdBYwqDLWFg+vEsrpCrb+rNIqNTz8ucovsMRI0wSzp2b+4V3veOv2T378o+gtLyGxDAYhtcFsGGMw0WoHxxCDC5OZYTiJOzUJzoc1oCTsUk4tiC2UEhBnuPPO+34Ebt+lZGASBkNrE5Sl6cDCZ8MK70oQLLJ0EseOzHb3PPEMJjqbQpjhHdKEYDnaTiKwAlmShvCDKR5AQOpAcKBoIwwxDBmQBywILSJMtlIsnjqGT3z0/Xjfe3bA50sXExzUC0gBBoPZgNkE94YJyjFcAUOVoDLeFg47QOvt4nGOk6iG42vwNokUzhcgX8DC4Zv/4evYNNkCQ4KQjYUhQmpssPMKWGIk8X0GITEGlinYUEXwL4yDTQQgD2KBtQROGFu3vQH33/8YXjl08p+yZPO9AKDegYkAUVhikCi0EXoxkYIMoErwDkiz7i0PPbTn+sIzOGlBieFVwMzIsgSqCmstvPdIkqRetUQKYg3/k9ZqkZUBx0hNGxYWVgnkHXxvEf/hhi8Bml9mjYYFE3dyPzakehf2bzb3HSQdrz43ukNplfmgegcxh2NbY5AYhmGFK1fwgfdf+u2rPnoFVpbmkNhgCzkKzJANfkb0GwIgEb8PBCITP8cwUCTGQMsc1iiyhKDwyLI25uYd7rzjtzda23mQ2QRHTTWEcET19VPjJrBXB2KGqEKIQSbDq0dPnf3I7n1ob55CCQPTboOtgVeBMaZaBhBILczazafqBhkQJWBqAZqAJQFThixpIeEEi/ML+ND7L8eHP/C+H/QW57+UsADeBS2hWCVAHwU7oBZpNFjQ/NtRghqlbkOs1w/sqyfDhFjOFbDsUBZL3/r3X/8y2gnBF0Xt2FTCDz/b+knKUcBJ1FQMy0lwEJlhoZjIUpB34TjeY3LTVtx55wM4fGxh0iZtKIV4XsHB5oJrO9lc2BzshoaYhwGvgonJye/fvfP+7Sdnl5B0J1E4QZKlcM4FYZLA2r47X+1KROGCCWQYZBhKBJMmcCrR/hgkSQKXF1icn8WNN3wVmdV71RcguBrNCLtztGqkAc92tMrdMFBAleBpYBE0n5lNAF8g7y1c/LGPfuB7H/7gezF36ji6MXRjZtDAdaN2BMmEsI6tCb8jAhnUu0u8h4ogTYPWa09uwsuvTuNXv36AWhNT3xdD8OyDQ8k13gUhgdBgKMWGLMSVSMiDtIguNjAzu/Cbu3c+gHZ7C/JCYqzFUO9gCCAI0sSAjYDYQ1nrJwxDbbgQGIXNGCYxUFI4cSBSpGmKU6dO4e1vvQCf+NgVJ5YXZv/WcrAjAYMNx9TKfmmA1rSKNxUgHQ/VbQzxGVazZnUcKkBRFCAWEMqzb7zxS+j15uGLAuICnhyuGYBBgEAN6vdsGhyXINAoSAPACJQUTDY8jYUDod3dipt/didOzC38V00MShTw2guCM4Cwg8BDWIKAm8JktTAwIDiIz0HkUThBd3Lq3Q898vvJg4eOYtO2M5GXisRmtaqodqRlE57EQa00boiygq1C4MGJgqzUOp5sUE2zs9P44z/+Arqd7AdFvgxVDwMCE0E0gsk0LDSp488BoGGDAl3LC27+LyJIjAFBsLS88P9c/cmr7nzbhW/G7KnpAMM5B5F+aEBxhxJbEDPYGJg0qa+VOexQZq53aZqmsDaBc4LNW8/A3qcPYOd9D19vstb/5aHwKtHEVJalAlUGPeVoMy2Yk3DhFLIIZCxgW1jO6cZf73wYqhlAFgDD2hRsE5gkhVKwBwksLFIkSGGRgikNqy3akCrrkaa2DwFKcAIW5+dw3jln4dPXfOKgK/IvaVztgEQvklapRCB61acZ/A8LbUCQUc3W9kkVqkCe53DOpZ1W8tef/8J1mJudRr6yAFfmcEUJ7xXiGSoGqgYQU9vJxKRIOAkQJ1kYk0R7mcAggWWLhC3KwsOmLRBnuPnmO1EUfFWSpShcDhUCeQMjFuxN/DkFawp4hoEBa0DKGMpwEmK3yrnJS4/CE7LOlu/vfvypyw+8dBhZOglQAjIWSZLUaEbYgf0dYpijSx52K5HCBlwL1tqBNBUD6KQJZk9M49/f8BVMdOyDFDMTTby09pabqa0R4NtGw47B3dtwksAxFRaPC0Wnk6G3PP/opz5+5cKbz9mOYmUR7cRieXkR3geHRUWg4iDONzzuyj6aEH/H2Jtq54jBZCGwSNtdtDtb8dhjT+GhRx6/rdXd9B2hcG4MEzNWBPYE1nDfggAbECgJGFTE9JKG1SUG1qbhUlQBTp78+R33gG0bTqgWovc+GGF2EHagRGFMzDeqD7FndPFFBMzhb8JODbuSASQKlL0FvOGMCdz4tc8dXlice9HEYJvJhosAxZOvvOfgqjPbkeFFP1yiARB+9c8eiaGIozJMlTIThaIEcYk8n8f2bZ13f+3L16I3Pw0UBcq8gLUpvABSOri8B1/mgBQgrbBYiam9EpwoTGrA1oKsgfOKtJUBlmHSDJRkKCXBj/71pzBZ5+/JJHBeA3wID6aYU1JCP8XgIOzhFXAKiBRgRBUoGrBRoaa0DQwnxfPPvfjlR3Y/gU2bpwCy8NpXgzUaFsOVfpzJgFS47ZBjwcH7DSCEIk0Mjh55GV/4/Gfw5nPP+mavtziVGgtXuIHQJ9gxF/YkUzyP8ep0XI5zIOklLgq2r9KNoXhugpWl2We++qXP6rbNbSzOn4R6B8sGRVGgKAp4Xwbb7gPwUT8jYhZSdFLnflUVWacdU1YpPDE6k1PYed/v8NyBV65vdyZ294ocxiTwItGyCGgAqQrerKqv70HUdDLe0wNg0ww2zW751T07b+oVCrYpXClotToI6eX4jywM2cEYi8wqQTIjOgPBq9MINPR6BToTLXz1K9ftdOXc95gUWZb1BcnBoQrhD2CI68T1OEdmrVRYHb8qhWtSgY/f7ZyAycKXrnv++Wd9/+prrsLycg/eEdgaFK4MCQcAzhdwrkDpHUrvQr7SuSBkcfDegzScrzWELEvAHBaRMQZZp4Ne7vDTW2/faW16uwiiZhw85/q6aPA1obL56WgfInwwfNg5hyRt4cVXDl90969/C046ACcQEaRpOiC0piCD85MENsGQl1vtXo7K3xiDLMtwYvoYrrvu43jbhW/a4YpFcJXn8z6wFwxAPNqJGQcarJWrDDcsWZUCI1EkBIjr3fj1r37xu91Ohrm5OSStNpwoer0enHMoXQ7niig8D+di8tmFHeslCLYsS3jvUZaBreClRLvdBpNFd3Irbv/FXThw8ND+rN0JSI9EEMP7sAF0NVo96E8QBAZcv6jVZXQtNNxAJUIhgnZ3y1fu/u2uixZXHFrdzSCYmOYywbYpB89LGKym9mabz6ZAmydikvBZUo9WCvyn/3jDJUW++FeGBSZm4r26OuZ04uH9ePx17d3YvCEGBEZZxp3GYeFkrQT50uKOt1943vc+csXlOH7sFRhOoMLI8xwmsSh6KyjLPAgNvkaPvIaIQCKag5iQVufBKiiKHohCUp5tgiNHZnDzLbfdmLUm/syVGlNuGcQj3NcB3LmfjG+atSr5wOvFZCKAE4aQxcm5pat++audSLNuUFE+BL3Nvx2wjTC11zYsQJBEl4zqzISqYHbmOD5x1ZV4/6Xvuml5/uSX2KCGy4ZVTPgbWhP9GY4fRwo2xs1VKOTLAuJ7X/7qF69H2VtGb2kJTIqyLEMKQfvcqIHFFPO7VYzqvUeRl4BSWDANh2x5uYdWZxI/ufUOvHp05lvGtkAmGUgipEkC04gxK6hUGlBegB89wNq3mTX2V8tZ6hvmFVDTQtre9P3f3LeLXj08jbQ1gXZ7or/zYqoupOuo/rm+AAouet8J4oaKACwBrSwBqWJ5YR5/+qdfA3PvbF8WteoOKjOmjioWwgjcdZStGb0zqc9his5QYghFb+ljl733HTdd+t534uT0MXTSDEXRg4iDKmFxuRd2oEiN6ZZeUYqv3/NO4EoPcQpxirL06PV68N6hLD2MbeHAgVfxs5/fdXaaTd7ohFB6gbLB0tLSeYYZzrmGIKURkEnQhFqxFh1APkgvGFAek1IK+TcFo1RGL5fzfv7LX6EzsRl54QcAZmMIxgQnJ/zPQ7ul6RCF3eahATumkEoyxOgtLePS97wTH/l3l/9j0Vv6Eny4qEDOYxBMbUubWYNx4MB6D+dKIJ4Xk4dlt/iZa67C0vwMypXlYMNcsIHLKz0QmaBCVSECeNcnZfnI7/Fe4ZzAmAzOAVmWxXMWFKVHknbxP//tNkwfn9+VdjYd8RLMlPceWZa9NC4h4Ju2UyPqhkB8477KGJ9NADMK5wFKYLPOSzt/+9A3n3vhZbQ6m+ARKJlKAjKBfunVDUBulfoKuzxgt0kSmAppmsIYU4P4CSewhlHki/jGN76GLJHdhgXiFEwhGVvHi4bXzYo0F1T1c98pCmw8a23w3I3B0sLs37733e949G1vOw9HD78MywbLi0sQCY4NEVCWJZwT5L3wv8uDkyPi4NShVxYoS4+yULhSURYeRVGgVxbIywKtziY8/cyLuOOue6+Y3HLGBYVDYB6AVpms6lybmq5vZgxULAgtqJiQNalXMslYdaQaD2QsFGbhpz+7A5y04HxYjUqBXpG1EtiEayohsQ6lyUxcSah3tHeKVqsF50LM55zD/Pws3n3x2/H5z119cGXx1N+2bAITEq+rEtGnuxMHVDIrRB0sJ1Dn0crwg09/6qNYOHUCKiW8d8EuwQc1K331GnLABBEAXmrP1TkHiVokz3MYY1AUDkQGpScoW/zrv/0My7l8GZSAwCNt/XrXRBEFCq6HgiuwQBswWjP2ZA7Bf2YTMBuUhUeaTdzy8O4nr3n8yWfQ6W6CICBDnFiwCQwBkNRoT1OY1e6obypCWGI4iagOo9VqITEGiwuz+PoNX8CWLemP1ZWACwnxvLcMNgYgWpcLtBaVpIp7DQFSFvD5yseu/ND7Dl5w3lk4fuwwsiSFuAJeSohTqFOoK8MzOKoQ17eTFFV/MydKFFQnwWCl55Blm/Ho7n3Y9bvHL2q1N31HIoW1CtmGgUohrumoEumbkVUQU0cOoBKgYnWcOYyB1rnFePbee3CSQGy265ZbfwmhBEnWgRdGK+ugjIxwYwyq5CQb1LFmP4NPA8F7WZZIkgSAwPsSWZZgcX4O55y9HV/94vXP9pbmv2GJIGVICCepQVmWpwWyr37PB/VuCd710E7NvVd/4iOYPvoKrKE6XpSIu3rnIL6E+LJhG/2AQFUCraX6naqgV+ThvlAGojZuufWX8LA5p22obOTseYBxUTH46/iTAk2Hifo0DAbVJEeJP4kICIq8t9IVX6KVpnCeYLPu4hNP7f/ugw/twURnKwQGXgKzjpM07JzaE6OheJMGTpNEwYnt5wUhKIoCaZpiYf4UvvbHn8fZb9y6AOQgSKQ+FpFstrbNXMuzrV47VyBfnnv04x/7kLZTi8WFOVgbVGQpZYglfRmAdN93dLwPAIDzBcqyRFmE+FcEEVRYgZccIIelxWVMdrdh10N78Pvf77/eJK2XnMRzEq1BixrXrZj8/QKMAZIFazPlEEpuImjAqwxvlStTVRgoLGHRVkVAqijFgpPOP/7kpz+/eWFxBRMTm1F6hPRZzNxbmwLMfXVmzJC6jUADhTKGcMoebIP69GWO3vIStm6ZxA03fOHmudljx1PDNWRmrI2BM42NddfGbsMic0V+2ZvPPfOmK6+4FCemD8NySH1VNI6A7lTITtiJ3ns47wEJT4kIT1kGJEjUBThPenCuQJq2sLxS4ic/uQOi6QxxAOoHzAANqtjxyBUPaDWNVFEeFVsOcmjCz+2EYQnwZTDkDkDamXzp+QMv7/jNb3bB2AzWpiFsiMFzxY/pE6T6J1kBAYYsvFd4X4JYUZQlevlyYNIbA3WKmePT+Nx1n8JFO968d2VlBZYsbGrgfHFaBK5VwEUMd9TLjg9/6NKbISvQ0oViHQQ2XkCbPJwroC7UglQ7z0tUwRL4OyFMqXZtCS8FevkiiqKHVnsC9/32IRw4ePiirD35oI9EOUEg8ATGnoxJ7o1HsoSCJyxIwYEmokPlM9w3tBycowBEK8hwtAUKL4z2xLZ3/+wXd10/v7ASgnkBUhuCfKcyMh1V7VQiCiGKhmSzcw5sIoM8D8lfJsXK0gJSq/iTG796VZ4v/NBYrXOHqn5sdmS1tkEd5/YdIAtj7M5ut1s7LsYQSpeDbZ8tqFGl9oGCgMcWrm8/oR7qHaQsQuK6dFAh2KyF+eUebr7t59cTJ/tBSbjWWBzQpK002QP961oL+AiUUCiBoQKqdiRF1nUjISwi8X2Oz0gjRPDkNOvilen5q392+y+wZbILUoE4D5MkABG8uprcBe7jsIEtwIGLGjFRgwAQu8LH/J2HFCvoZIzpIy/jE1d9GO+95C03Lswe+e/W9mFCga+RGNaQfa/SZX0iFEOU4EUhWsWYMSYmc+S++x89aJMOhDy8Fih9GWNHwPto0+Iurb43qOGA7uT5CkQKqFsBSQkpSpAYFCWj1dmO2+/ciUPHZr5l2m04FVgmkJaN84hsYzLwSrVW5Mi3gmjNvA+QnsAj2lnyFfNCNqSaJKaL+qmXAASUTtHqbvovd/zyV+cfOPgKNm/eAmsDky9JEiRJtgo4qOLW5iqv3XvpM+fVC7I0gNqQAqo9fP3rX4Zhv0CQwBMSGVDbzTrIyvavx3a3NsXRI8cveuGFQ9i0eStWesuh1GIIPFHV2hZWTlB1bcYY5MVKoN7ETEpZKmwygVcPz+CenQ9sb3U3f670ijLafFYMlSxyXcjUP7ZfkyXR50fp+kD7sDfY/GKmQOIlIszMrvzoZ7ffDZN24CMRSpxGHJVBKjW1vnbpG7WJNRyGJo9V0Ov1IlOBcfzoMVx+6bvxgfdf9uf50sKX1LtIkaQacK7sV118JNSnDlHwzCkWuSLWtRhjUJS64/5dv4NJOhANgbxzDuIUYQNQX6ARrguQnYNSyIFCKw/Yw6YpCi9odbfinp27MH1s5kSWtoJqNYAxSQ3anw7gsVYczevFY2sdQFXhyhwkhE2bt1/5q3sfnHx87zNIO10YTkBCUN+A0kigvoQ6hY91i/1d4wfwx5pUJVTHhEWRo8xz3PDHX0bKuteyIDEh/VYJv7Lz/XK9eJkU+b3kB1JgqgonQLszuXf/cwf/7MCLhzDR3YqlpZVgRlylWgEBwamDRxCyetS7syxLMDNKJyC2KFXRntyMF186jN/e99Dl26beSHle1gtTKYAOo+x78/6O8swHiWg85OOOQUpGxWyr3ouOUikWc8vupv/xLz9B1t6MldzVgDRp2BXVyg431gSaYhTiMFAdUm/93eu9R7tlMXvqON7zrh346JUfeDZfXvh6FfIEknHgrkpsdaACUF3OEHyDiqxdXTrH7EQpBOXWrvt3PQ5QG2WhEA94X4bYMu4gkQbCI8GBqnhDwalhlBAs5x6cdXDn3fdhcUW+wTZr7EKJpf5m3RrT9XZrRfMUAsy2rdvWVK+jmj40309NIFd5YiRpeserr7x08O073vaFt114AXrLi6HegjTwX31gqYeioIo8VXnG8f+YWlIfqI4+4rVeHAhA6YIKvfAtF+Lue3Z+s/RUiDKIAGaqqs8xkEAgAORimFUlA2NsHZtcEAzSxE6fmJ6+/fw3n/OtbVu7KFYWQSAQhZxnn0WuIJ8AGnoqiEpk6HkIKbwSOlum8MLBI7j9jp2TWbb5Vi/9fg8BIUsCjKfx+4d241oV4H0KjoFWFXTN5PRGQOnm7q3ed07qAhuTpKBk4p9/8MNbUHoO3Fr1gLiAaypFDzAiKhLirAForNqh8VhJksRdEOKvdmIxf/I4zj/3LFx37ScWoC5CjT4SqWhAPQVmikRAmkebECaQNSgBeCQLj+55CsQtKNmGg+YayI/EMCUABb50EFfUPQsChmNx98770XN0hYOJu7yiweiAWRhFd9nIBhv+mdcDpNf6girJXJ2T8wpOJrDvmef//J7fPICJ7pa4y1xk6gXnp1f2Iq4qq7zF/nFC3rL00mciiKAol9HOLE6dOIbrPn01JjKL1AbAo58asoE8EGPogetSXnXjgjPmIWAk7e7+Z/e/eMn0iTkktlWVCkdqiEAkNp3wAkT7F5LIEpMLCbLWBA4ePIy9+567KWu171IOleEQheGk5g+HKjG/pkDXsqf9z1JfmKO4M03qw/AKqoQSVqnW5GlSQJRg0ol/+uH//MnOk/OLAEKDh/oYxsJ5BcQB0qclNjFHEh0sIIql3t47WBNAcV+u4A3bN+GLn7tWF+dO/JBJkVo75AD5+iaHzDzVcWiFRnEMa0RCHwcvQO7ost27n8REdwvyMuxAZq6zH+IDK6EsV+CLsm4340pB4QQ2mcBtP7/rH03S+r7HEFfXh3QZ1EPUjVSfa0UYq1kVDYh01JcMC3atL+WE0St7sMaEmM8YkMnw8qvH/u7nv/w12hOboBrQnTxfgcYSB1WFK/KBHTkAYEc8lIiQ5znyPG+oJoH4ArOnTuDTn/oozj37zH9WXwSMtHQ1utJ3tmhgV/avUQZUcgiNCN3Jrf984MVXL5+emcfE5BY4FeR5HrzWvIBlExAiExykPM9RekVeOkx0t2LPE0/h0KvHdydp56V+34fmfTM1Q3GjBU4byq2MxCtH2MZxwhwInJkDhEWAcHLwllt/ecWR4yfR7nShFAjTKyt58GR9CRVX0xQr8vCwcPv0kHi8MqSg1DvkS/Poti2+cP3Vd+bLCz9keNgkNH8ovQNbM4R08oji3djAyZcwhmrtsbBcXvbE3ucwsWkrPLheYEQGvvB1qq4oCsBY9IoSniycWtxzz33fZNO6uWLbVShPXU9Z2/PTE+ToaCI8lSTWZ26QDT5Ktws8bJrEVFlg2IkIupu2vnT42Mw/3Pbzu9HqbkGV7nHOwRXlQKVVE/UYF2s11XuFFIl4nDh2CB//2Ifx1vPfdHbeW/wYI4D2VVnEeo2equR7xURkY1CUJbKJzd/ft//FyZnZFaStLkrfhwurPGplPkK6C+h2t+HRR/fh6PTc1WlrYrEJCFSxcsVq59NsQjXObg42GxvDAh+1S0d9WeVtVo5AYkMDqJXlHN1N2668/c6dk888/wpsq4sid+gkGVzRg6Uk8nkCY6DRTCDsUB/SSt7F5LUTFKULDY8CLwIqDr3lBbAU+Px1n7rKF0t/Z2zob+K9D3gsaKANDYb6CdUFtUmrDvxhLIQNFnsOjz3+DLLOVngXPtvr9cBRI1V0ElcKlFLkzmDnfQ9vz9qb/6QsgrNTw6FRM1V4amjx9toaUY0E3OvK6XH8mDWqkps7pbJtWnuUjLL0qbEZTs0v/+O/3HI7smwTjMngnQPHXVrlPisV1oTL6vZkZbmKD+Ndn5nH6nDy+BFc+r5LcPG7dly1tHDqr9I0rRcY1MQamlHV1hw/Z6FKyJJWH3tVgyRtL+595vmLFpcKdLpdFCs9aOT6VJmj0D7NY9Om7Xjokd9jdqH4K6U0UHGGNE5FlwwLkRro1vrt4kZpzOHNx2MJzGskdpuf8T68drHCS52ABEjTVrGSl8gmt/zpfbse2f7Y759C1ppA0VuBIQ91BKit6YXOuX4FVqP4pp+J1wEvuhJ2ZhO4fAXqC3zuuk+DSXJf5EizUEqARhZIg6scAIyhli4acWTvPZx4kDUQTrC4VC7s2/scsrSNsgzt03ysy/RQuJgVml/Oset3j5+ddrrfIU7rcM3EbpmBOxNDFA79IwapIOvTXEYJtarNrB2gtWsx1naAqhK/cIP6YUFooGhBnGE5l7+6+ad3AJSBbRLSSlB4VwT6YH2SBAHFtFNwcqwNzkfRy+EKX69mQaQv9nowhjA7O41LLr4Il77vXd8ti5WPSVnAUGitGEjY0lC0/Xxt1ePIGBNUKIfOWc6HtBSb7MgTe5+9fGnFgW2GpZXg1boiD2q3ADZtPwsPPrwHRanXAzb0RdJBDdCE39aLIDZSKDyGf8A1Obnv7RFGvV+9V/fj0dCfx7uQ0AUcQopBwWQATaDOYKKz7TuPPf70Vb/b8zTsxFZ4TuBcD97nEJfXWKl3FCutktDtSh2868U+CjbWc1QJn1BaX69Uv4TlxWl88bPXoGV0f6qKRAFxZZ2iCvnMWNBECtFexIZLlBLtpTLEVw2rADUJjp9c+PrjTx1Aa/N2rJQeHgpDgMsdsskzcGRmBb9/6tmLsnbr+0QBQbdpirx0IWlQ3fyY2qtqIJtFyhvhKo2KM5Wp7ijGa5W/raWnV/1NI83UDAZUQ9zpxEz9y7/ditIzlgsX6RIC5wuolz4yQwRfQWjqIOL7fV4bMZtWDAnDKMsc1jAWF07hTWdP4YOXv/twb2n+uoSA1BpYE1umsY3prrLOg1YaZYAcpY08JggmbX9379MvbF8pgHZ3EnNLywAIeanYvPVMPLxnH5TtQY09DUR8TUjTusWNb/QieO2PtdSvmdq2fc0/XEvFxhcxT0hArO7tp0ojcO4dUsNPzxw/km6f2vaRSy5+B5bm50B1M17EUnEN7dvExyo0iV2yQteP8NEKAJDw2kusMI6hEQjnX/BWPPTQnj/xYJTeh8JcT7CJhfdFYNrDwKhpEDKoZsNVr0IVuMCQLi4szv5/WzdPvvPcc8/G4vwsvPeYOuONmJ4rcO99D203Jl0MmZXQYcxL1Ye3ctYrQLy6d9WGEfyhHutis2s5RhSzISN3a4xmmUNHL7YJsnb3b3566+3fXF5xNTVTNWZUJCSWpapErivDtJGFX53MrnOYFJyO+bmTOOvMrfijP/qwLsyf/J5hDJTjizgklqNjYldVkY1Udcxodya/8sSTT10llMBmkyiEMbl1Ox7Y9bvDymbGV2TyaH+TJIFERv84xt3r7ci5qhRjoLJog88+83q4VURlU9EvqDWItH6CNRkOH525+rbb7kJ3yxlYyl2j6CZUG6v6WKRTDpTJeW3mFKV+v+KTuqKse8rNzRzFH330/ThzauLvSDwSTupF0y+dQKR59klU0b2vnabaoUPgQJ2YXbh6/4GX0dk8hS1nnIPnDx7Biy+9+tdp0oFI8IattchdGRcyr0Jqmhg0/wE6qw5wkNeC7WgM/X9jKFGMqSp6CAFeCa325J/84q5fn318Zh5ZNgknGrL5UsZwpB+/ldG2VSmj5nGb6E6VzDZkYaDIV5bR7Vp89rOfOLyyvPAP3pcwtp8aq7L96yEsVfmEEuCEkLQ6f7P78acumdh0Bia3vhH3P/ToP6btyX8unYJNFhYm9VkPVA8IiL4Eyap7d7rNp9aijvLpbONRLnJgwffL2yuko/n5LMvgvaJwHknaxuzcyrdv+8U9SNqTEDWBxul93cRJ0Y8jpWpsJP1JBzWWG4UT2m6HFm4hlCyxODeNKz74bpx33lmTRb40xeRBKnClROQpeMR14+KqNkR8zH+GzpMSBwrYJEOSTeD4ydkrXnj5MJ45cAiHjp66y6btsJA4iV0/pO59VMXNFVz4WnbkWqHhqvfecv6FYykKzZ05jurfLJPr0zGkzuQrhdSQNQYJE6AlxOXIEsV/+/Z/1jdsNmANrO/Qv49rgTFZgA1cKf3dpAF7hXgYG6A9FYK4UPtPYcQDVlwP2858Mx545Hn84H/c/Ne2Pfl/kMlQFKHtS+3EGobA1ypw+EYLAdZaiLjQpls9siyFIcXC0goUCZjSmojWv5e+xmOrajOVkIKrioYryuR6yejhtjfjHFMe19RhI05RlRitGATBGfJ1cCxKdWGstRYrRR5uPjOWVvzFt99+N9qdzVhaLkKgLf0+PBVJq8qY1A2ktN9fqN8YwjXSWA6+LGCIcezoIVz+votwwZvP2KFl+UYSgiULeAmDAKqmyDBjW5VWXKUww8RCKEEvd1hYzqEwAAeQIFBIeERFQAQ5/MZCjXGh4LiRHsN1OxsicY3V7Tqot4mHk9wI8Zb62KkLABkIkpk9Tz5Ne59+AZu2noleIfGm8ED3ZfUNG13VSEaQupkrHKxaDlgvQ7C0dBzXfOrKb7p8+SajgtRmIY0lZV0kPC4or4J6jaFWcMAMvAbBamwu1fTgR/VSWI/hOC5i2Aj4Pmjy1gHYxwHxdf0IRtsAUg5kJQVUQnIXAJwKnABZq3OkKOW6n93xKxTC8EggsChciTI2SHLO1fyfACBU+c2yXyLh/RArItIovAeTYHnhFN719rfiXW+/4JtlvriD1I8BDDDoqPAwKlNpG60H8wzshYFE8yCxufkMtSE0sqZkuJZVhwqL1+XNrtVLZ5RuXr3Khl43s/mNi6rUZHWypXi0upO37336+Z17fv8Mtm47A14CPlup5sBNjY6Q83XoUjcXjrQTiALexe5dGCBpGxUsL8zi2qv/CAm5N4rPQ6tV7g+QAcl4QLtJadTBa+wDJ9rPV6rfMFVVCOvi4q8JNBjHDhulZocD9vqrtLkKY0yqAkuAjSMiFBxx1zBhJ2l3b/zlr3buXCkFZLI69quYbNWuC+xyH/va9dNl8GEAjKKMGZGoDkWgziO1CZZm53HBm9+ASy6+cKcrly+zNpbBDfUlAgIr0I8qrZd+9qaZsRi9CPyIHcUD8WwTl+1PnOg/qwzL8PvDzwFNuR7Nb5Tgmmq2ry6G55E04k2S6ERQpPV7JFkomU873SMvHDx0cNeDj6A7uQWlaGjWKxqKh0RDZVXEaivEqXlO/Ri0KqULatgVHuRCQ+KF2Wl88uP/Dq2UTpT5UiwxtKtw2Y3kFCkWCDcrmfvzyGQd+8jDxJ0NEQE28lhFgh6H4K8KUCvdXgPf1CcY192k+s2CDRnYJEBuXsKkAIVCQ8x3z8kTx2YufudF17QThjgHG0Me7wUCgWhs8y1VnNnPRIiGriEBmHCh1lhQ47zWMpaWc5z9pnNxcm7+Lw4eenWnSbsvSX2+VX0yBqq9Y//wwfswpNKkMURnsI1Ns0wveru1Wo12l4G6cn2N8oQ149DGZ3k87trPV1YFs4PdJaWeZzXKGxv+ThFBnpcghPrLqqBHldDKJhYPHT4+tevhPUjaHWjk1xR5XtvB5rGH6Z/e+7oHvGpAm4jT0PAfgC8LZClj5sRRfPLjH8FEJ9kNKcKMFlSdI7nRp8hEMCT2x2ruTpIBvu9gjL2G80i6ZoXAhiKHdTxiXiuTPYqltwooJjPgnSmqaqygWqu6Q9esCo6DbtSHzpSuBJLW1r/5zf0PZ4emT0BjOxd4Fxl8BWIlQwg5YuLXOTcwyqoe1ai2Lg+XGNqQlsh7s9g8meLKD1y6UC7PfqtlHQwF1Qxw4PNGU2GEQU5gJDTspRj4E4U25UKBK9RPyPfzvBUg0BeyrOokEl5SPc+lZtn5vlNXTTmqULbqdfPZXBi8kQzJ6TUaXH+qwQAp2Em4MTbDwnK54ze/fRBpZxNW8rLBIu/33ZGqZUuDLxQmEcSf426vwIaqaCgQqBWzJ6fxwfe/B2dObTooRQ8qDq1WC6KKJEnhGtTRhGPLbPTbumiDh6uCOrGwVuHVOKLzqHBwvfBwLZYen85WHsd830ij3nEnJ42AH+CFxx59+qJDh06i1ZmAk0BN5EbWgWJ1d40FO9+3XiI1R1XE1QToUKIevNHl+Xl0Oxmu/OBld64sz/8wSRL0egWMsYH7YzjiwB4ODh5hysHA9EAimI0U6rzGVNZGQpNR951fzwE34nmt1Qs2YJa1ykyztPNSXtBlv975MEyri7KR8SfRVadck4hFozqSWPbg+i1WxYV22BpacEM9jh56Ce+55CKc84apu1wEMyq1zWzgpARMcKaUhlN+fbVXjQgelXlaqwHjqEkN62WiNvIZs3XL1nUFtxZPZSPGem3UPzhZBHgCYGxn75HDR26/4PyzvzU1tTnMDvERwgOF3ntVd5woJBWJZXuoGykxASJ9gIEAiBcwE8qyQJa1MLlpyxf2PPH01ER36x3eK9iaGu6woYNGECEH9RC+J4xcZjWx/KGisGDdPkSvBQwYtTjGmUM+XUGMa5j4WlM6gQHgYK1F6RVsUjgxUzvvfwScdEGmD7BDNbZXCXBhLaSK6VWv3IY9NRw7McedJR7dVoKFk0fxzredhwvPP+eypfkT32CEJg+ILUub/d9Ho2G64bkpa3FgNzp0bj2GXs2b3ahufi1B7XocIjKoObPGJChVkE5uvuvZA4cvefLpgzA27Xus6mvCWEXN9K5RdORkIHSqvdyYrwzaUmLTfAcpl/CRK953heWyMCggPkdsvV53dW5mhyrwsi/cwdhyHJNuI0D5mhHDGALBWJs5LtYcJ9SNxEPjajqbD++D06FO+2VzbCHU2nvPzge/6Sk0cugXvPabKXlfTQ8Is1mCE0X19wKhnWgr69QcIucCHzdLDRYXTuCtF5yNd1x47o/U9bqs4XdodCoZrCDjug+Cxk7WyuM9/o3OJNtIVmXUAhnepWZq29SGZjiP0+NV0nh1L9fRLvWqxRJL0w0FegZZDtPh2WBxfm52spP8xYUXnIvlxTkwB+Y8GwNxcXJ7xQuKvWOrgeMKhM9ymC4YKq+rknMPawJSpQK84aw3YPeeJ15qtbu7XTW+AxxzCIzaIMcRh0wErvom0PhdNmoBjwtH1gPlN2IzzbatUxtaNePin1Ex6UYcgWbGgaLtCw6ixB4CBkw0NzN9+Mh7LnnX9SI5mIBSfChn12hvvdSwWuA1RkqI9qmNoQ9f+L2xEZHSgCyVrsTUGWfixMz89a8ePr7TJu2XyNj+olSO3xK/vl6AUfs34LixC3YEe2O9z61pmsbseF6vh/lGDrAWYrSuMY8J5oqSSI3G92xTHJ1e3PHgw0+iu2UKS0UP1qSNwp1Qnu7U9RtSaGhxUM0SqacZVHlEtvCKWF0GuGIF+coiPvqRK5Fm9sFKNQ9nIgLExwN5TxlxP4a7dm70Pq53jzcC9fFGPdL1QIFxCMhGCpEqexbgsj6WCzC6m874zv2/23P+ybllJGkbvV4RbWIZk9d+oA/CcEZFY3/36iZX6FH1ZGYsLi7W448LVw4JRKOXK4PMfeXaNq913aM80I0K53QJXRtuUHE6BzqdeKomNlUqOpKyqtFIDgYLy/76+x54DBPdM5HngR9bTdYVSGOyQBxJ6ENX5kBCDgKtbGhRlmH0Mgi9vESv8Gh1JnH/Aw/BCxcCC2NTlL6I7cxC/QwPsShGp/teX5j3WnfvWARoWO2uF7SuZ7Q3WmWmqg1QPGQqRBW5F9j25D89/uTzlxw6dAJT286s+wvU81Eq6r/oQI4TXsJkUN9v8FtRUcQrytKh1e3i6IlTeHr/gcs5bUVBxlJ+NBpcxObnw2V4w10716J1bGQDbAS2G7f5+HRIuOt92bi+CGvFrf0UV8g6VOu9Pl5iIGDkhS12PfgEmG09JbAqa6DYeSf0HIrJ4/jd/ZlcQaAVmy+ERAlsMoFHHnkCudfzREMPBKVQ1idxCgSpDAykAcL8Tx4zi2wjgPtr4fic9s7cSBrstQh+nN2t4kGiMCCOKczpqGA478swszPr7n/2uZevOXDwVXQ2bW1UaVXfLXFaugyUAZTiIz2kz3pwpcCJIm1N4IWDR7D/xVdvbHW33EI2iXWlgcbJcQBsP/wYzRUazOysba5OJxuy3r1bRegapSr7fXR0VYJ5IOMx1HZ0FHF6HJhcvR8aHFHUZAZS91RVMCkoAuaeAUmyu+57+PdP5j6FpwD/CcXB3QqIL2p4UAyhp4qSGLl4FLGyu5+hAWBaeHD3s3/u7eYfr/RcHLvMcL0eLCcgDR3TnTBK8QNzRyJLuO5ZNPysp8nzYIvU1Q4Tx66c/SHmw+BMc9EMbyxLIYXOOqbWpPlFa62MUSmwtVTCWkFyzepTbtRH+khWDuOnyKR4+cjMjc889zKyVjeA7sohhmSCsTZMzYv1kSGejHNATZwSJGGmVzaxCS++fASvTs8+SLYDm4YGFYaBLLWAaBwex/1cyQYbLq0XBaw3cXct5sdatbOsY4a+bBSx3ygsNd5JkIaTMUjfbPJORcKMj9JT9uieJ75feAuiVnR6HPK8QFFK6KmuEiZOhYAS8CXYK3zp4vyVFEItPLznqZucYEc/bJEBaoq1dqSQRgIB3J90OMy53YiDs565Wo80cFr5zD9ExmRdngsNCpVjv1GNY+lUDFrt7u5DR2Z27n36ebQ6m+Gch4FBXnqsFCWEDZyE/nkQAokArozNi4Gy9Ni8bTv2HziCV46e3D7R2fTjZseUZknEcKXYhib+nSZv53Tu+7jNNeDNjnNy1nJ8xgHn6/VPXVUMU/dLDZTp5rDw/nlE4ZBFURJsOvnjh/fsu2pxxcGaFrwXGBtKzkNT3qrxE4EjZbOqX/HEKCXBQ3uePtu2tvyZE204Yf1yP2PCEJzRdMqGXmmOaT4NYa1VDTauQGgk04P7WoFfT5D6h1qlgwy20X8fOpSECa4maeHUfI7de55G2prsd//SuMMM98MeUSScxAbBHpu3nokn9r2A6VNL3zLJRMihRuE1d+Oo7l4bQcI2eg9eC4Cw3pgs3ojDshH6yEarmVZnFmhNclL12sfdZlsZcg/Y1sS9j+995qJjJxcAm6F0OQx5lDG0qHBeiv3bnXOAzTC77PDY3v2TWWvy70snYRbL8MjfeiSGGQFy6wDbblgVj03CD3m7fyhqzqpak3Gg+bAK3qhQT3dlDv6N1Kx1isW8qhLnTcdpQyrwQljqldft238QSdaFEiHLMti6Z17YWZYZRV5CTYLWxCQe3/ccTs31bgRbWJsM8HAre1lPD2wy/EbOSKF1d9nroY1spD62ea/N1i3bhgpm+xOBNpJcXTV1b8zJD6ygRuxVzX0mhM4cVfqQo+1UxIl0iLNIKhIYA2maPDh97Mhd55579n/aurmD3vJisHkxfi2KAj7O/RSTYb4k3HP/HtKku9uYFGVZ1MNyRsFza5XKr+eMjIDaRvseq2ZmrhZa8zyGq8QGJiCOnzUtY+3GRlI142LLNWNNjKnHQLP9SpV8Ds5MLjzz+L7nUXiGkyZ7Pg9Jc5vAE6M1OYU9Tz6Pntgp5dAsODW8rvpaKwwb/v1GkvuvJT02DiId0W3k9fF+Tic8GX8hNNCKQ+OYDKmrpgJMx9TPeyoJlAi2Nbn/+ZdezY5MzyFtTaDwDoUrwsRZAVZKh2Sii5n5Hp49cJg4ac0om5qOSTJcQ7kabhyFvIzLXY67R5XX69GnmrzebMmawjzdfm5r2ctxbPjTWSSjVUZlT2P5AVmsFLTjsSf3P5t7C+cptnExcD5kXSidwO4n9qMU0zWcBCck2ta1NMVGwPPTrZA+HdV8uja2rgJbj/Jwuj1QN5JUrTpVDRAYQ0Kz7vjFGrp+MSgC3lWVWb/TlWWenjkxs7Bl89YvbN0yCV8WgBJ6pUPW3YIjM0vY9ejTZ3Nr8mSYxuGRMsWOIwwM2MbKPutY9kBTwByZ9oLT4xH36yuH/RWsmVlZy1bzRlhgr1Wnr5dVP11EqXLr6yKbqhkjp4Dt/PjJZ1+8SiQFcYperxdiTxg8/PjebzvwpHiq2e/DzsPrCRXGNS7caJvR041Rx30/v1bawlou+lqY7moBjZ4bqUO9AAaz+/331IemT6Y1WRyfXb734CvTsEkHxhLa7QwvvHgIr7x64uyk3dnvVcAIrda8Ak60Rm/WMwdrdZckog3Fka8H4hvVdWRVbF4deK323huxo+t5feM6fK23mKq6/2afVq5wO4TJPcaEbs8ma+Op5w5eUSCFmi68mcCzz7/yZXC6W5yPBUgytu/RyExEI1QZdT3jshvjhD5OU21kMM260wZVpI7jVLTeE0I4bbBgHK1wuLa/eilS4bHcj7Eg0Vw1immHdzv1U1Lee9jUAFICBBydXUj3HTiG97znHXhq3zM4Mbeyv9Vq7wUh9howwRuWwNQLWGwz9KnOhUesfLNKkIHk12fNN+HI5nSJ4fgQ4JEYN43BeddagNX7dqDV6Kq4bn21MHyAJkCwHh1iFNfodHFgiix4iEAN0Gp3792z71l647lv0X37XyZwikjIjb1fY/3lkOO11vVtVA2O+ptxlWH/Kx604/y3NjKIg+qtKZy1vNZxkODoncxjBUkNSuNagh5Y2TF1ZpngpQRr6F2XpimKooDEtm1VB7Cm6q7LIVZ1BcHY6xuliZoDb8ZpptXXMNq/GK5dGbdoRrVi4+Fuka+lMmmcV7tRsOF0KJ7jjl8ULvYaCpjq0tJSLLLlgTmTQq/NKXmt9amnE2e+3sf/D3FvEvLWGrX1AAAAAElFTkSuQmCC" alt="Valora" style={{height:"32px",width:"auto"}}/>
      <div style={{width:26,height:26,border:"2px solid rgba(201,168,76,.15)",borderTopColor:"#c9a84c",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <div style={{fontSize:11,color:"#3d4249",letterSpacing:".06em"}}>Loading team…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"var(--font-body)"}}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"0 16px",height:52,display:"flex",alignItems:"center",gap:8,position:"sticky",top:0,zIndex:40,flexShrink:0}}>
        <img src="data:image/png;base64,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" alt="Valora" onClick={()=>router.push("/dashboard")} style={{height:"26px",width:"auto",cursor:"pointer",flexShrink:0}}/>
        <div style={{flex:1}}/>
        <button onClick={()=>router.push("/dashboard")} className="btn-ghost" style={{fontSize:11,padding:"4px 10px",flexShrink:0}}>← Dashboard</button>
        <button onClick={async()=>{await supabase.auth.signOut();router.push("/");}} className="btn-ghost" style={{fontSize:11,padding:"4px 10px",flexShrink:0}}>Sign Out</button>
      </nav>

      <div className="main" style={{maxWidth:720,margin:"0 auto",padding:"32px 24px",overflowX:"hidden"}}>

        {/* No firm */}
        {!firm&&(
          <div style={{textAlign:"center",padding:"80px 0"}}>
            <div style={{fontFamily:"var(--font-display)",fontSize:44,fontWeight:300,color:"var(--text-d)",marginBottom:16}}>◈</div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,marginBottom:8}}>No team workspace yet</h1>
            <p style={{fontSize:13,color:"var(--text-d)",marginBottom:32,maxWidth:360,margin:"0 auto 32px"}}>Create a workspace to invite your team, assign roles and collaborate on deals.</p>
            {canCreateFirm ? (
              <button className="btn-primary" style={{padding:"12px 28px",fontSize:13}} onClick={()=>setCreateModal(true)}>+ Create Team Workspace</button>
            ) : (
              <div>
                <button className="btn-primary" style={{padding:"12px 28px",fontSize:13,background:"var(--bg3)",border:"1px solid var(--gold-border)",color:"var(--gold)"}} onClick={()=>router.push("/pricing")}>✦ Upgrade to Create Team</button>
                <p style={{fontSize:11,color:"var(--text-d)",marginTop:12}}>Available on Pro and Enterprise plans.</p>
              </div>
            )}
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
              {canInvite ? (
                <button className="btn-primary" onClick={()=>{setShowInvite(true);setInviteErr(null);setInviteOk(false);setInviteEmail("");setInviteRole("editor");}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  Invite Member
                </button>
              ) : (
                <button className="btn-primary" onClick={()=>router.push("/pricing")} style={{background:"var(--bg3)",border:"1px solid var(--gold-border)",color:"var(--gold)"}}>
                  ✦ Upgrade to Invite
                </button>
              )}
            </div>

            {/* Trial banner */}
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

