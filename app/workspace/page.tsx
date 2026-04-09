"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold-bg:rgba(201,168,76,0.07);--gold-border:rgba(201,168,76,0.2);
  --bg:#06070a;--bg1:#0b0d10;--bg2:#0f1116;--bg3:#14171e;--bg4:#1a1e27;
  --text:#ede9e0;--text-m:#7a8390;--text-d:#363c46;
  --border:rgba(255,255,255,0.055);--border-m:rgba(255,255,255,0.1);
  --green:#3ddc84;--red:#f4645f;--amber:#f0a429;--blue:#5b9cf6;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}
html,body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.pcard{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:22px;transition:border-color .2s,transform .15s;animation:fadeUp .3s ease both}
.pcard:hover{border-color:var(--gold-border);transform:translateY(-1px)}
.metric-pill{background:var(--bg3);border-radius:8px;padding:10px 14px}
.btn-gold{background:var(--gold);color:#06070a;border:none;border-radius:8px;padding:9px 18px;font-family:var(--font-body);font-size:12px;font-weight:600;cursor:pointer;transition:opacity .2s}
.btn-gold:hover{opacity:.88}
.btn-gold:disabled{opacity:.35;cursor:not-allowed}
.btn-ghost{background:none;border:1px solid var(--border-m);border-radius:8px;padding:9px 14px;color:var(--text-m);font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s}
.btn-ghost:hover{color:var(--text)}
.nbtn{background:none;border:1px solid var(--border);border-radius:6px;color:var(--text-m);cursor:pointer;padding:5px 14px;font-family:var(--font-body);font-size:11px;letter-spacing:.04em;transition:all .2s}
.nbtn:hover{border-color:var(--gold-border);color:var(--gold)}
.tab{background:none;border:none;font-family:var(--font-body);font-size:13px;cursor:pointer;padding:10px 18px;color:var(--text-d);border-bottom:2px solid transparent;transition:all .2s}
.tab:hover{color:var(--text-m)}
.tab.on{color:var(--text);border-bottom-color:var(--gold)}
.mem-pill{padding:4px 11px;border-radius:20px;font-size:11px;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--text-m);font-family:var(--font-body);transition:all .15s}
.mem-pill.sel{border-color:var(--gold);background:var(--gold-bg);color:var(--gold)}
.ws-dropdown{position:absolute;top:calc(100% + 8px);left:0;min-width:220px;background:var(--bg2);border:1px solid var(--border-m);border-radius:12px;padding:6px;box-shadow:0 16px 40px rgba(0,0,0,.6);z-index:200;animation:fadeIn .15s ease}
.ws-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;cursor:pointer;transition:background .15s;border:none;background:none;width:100%;font-family:var(--font-body);text-align:left}
.ws-item:hover{background:var(--bg3)}
.ws-item.active{background:var(--gold-bg)}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:var(--border-m);border-radius:2px}
@media(max-width:768px){.cards-grid{grid-template-columns:1fr!important}.page-wrap{padding:24px 16px 80px!important}}
`;

const fmt = (n: number, p = "£") => {
  if (!n || !isFinite(n) || isNaN(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e6) return `${p}${(n/1e6).toFixed(2)}m`;
  if (a >= 1e3) return `${p}${(n/1e3).toFixed(0)}k`;
  return `${p}${n.toFixed(0)}`;
};
const fmtPct = (n: number) => (!n||!isFinite(n)||isNaN(n))?"—":`${(n*100).toFixed(1)}%`;
const CURR: Record<string,string> = {GBP:"£",USD:"$",EUR:"€",AED:"د.إ",SGD:"S$",AUD:"A$"};

interface Workspace {
  id: string;       // firm id
  name: string;
  role: string;     // admin | editor | viewer
  isOwn: boolean;   // true = their own firm
}

export default function WorkspacePage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user,         setUser]         = useState<any>(null);
  const [isPro,        setIsPro]        = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState<"projects"|"share">("projects");

  // Multi-workspace
  const [workspaces,   setWorkspaces]   = useState<Workspace[]>([]);
  const [activeWs,     setActiveWs]     = useState<Workspace|null>(null);
  const [showWsDrop,   setShowWsDrop]   = useState(false);

  // No firm state
  const [noFirm,       setNoFirm]       = useState(false);
  const [newFirmName,  setNewFirmName]  = useState("");
  const [creating,     setCreating]     = useState(false);

  // Per-workspace data
  const [myProjects,   setMyProjects]   = useState<any[]>([]);
  const [sharedIds,    setSharedIds]    = useState<Set<string>>(new Set());
  const [memberCards,  setMemberCards]  = useState<any[]>([]);
  const [firmMembers,  setFirmMembers]  = useState<any[]>([]);
  const [sharingId,    setSharingId]    = useState<string|null>(null);
  const [selectedM,    setSelectedM]    = useState<string[]>([]);
  const [savingShare,  setSavingShare]  = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setShowWsDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);

      // Subscription check
      const { data: sub } = await supabase.from("subscriptions")
        .select("tier, trial_ends_at").eq("user_id", session.user.id).maybeSingle();
      const tier = sub?.tier || "free";
      const trialing = sub?.trial_ends_at && new Date(sub.trial_ends_at) > new Date();
      setIsPro(tier === "professional" || tier === "enterprise" || !!trialing || tier === "starter");

      // Load ALL firm memberships for this user
      const { data: allMrRaw } = await supabase.from("firm_members")
        .select("*, firms(*)").eq("user_id", session.user.id);

      // Also check direct firm ownership (owner_id) for firms with no member row
      const { data: ownedFirms } = await supabase.from("firms")
        .select("*").eq("owner_id", session.user.id);

      // Merge: build synthetic member rows for owned firms not already in allMrRaw
      const existingFirmIds = new Set((allMrRaw||[]).map((r:any) => r.firm_id));
      const syntheticRows = (ownedFirms||[])
        .filter((f:any) => !existingFirmIds.has(f.id))
        .map((f:any) => ({ firm_id: f.id, role: "admin", firms: f }));
      const allMr = [...(allMrRaw||[]), ...syntheticRows];

      if (!allMr || allMr.length === 0) {
        setNoFirm(true); setLoading(false); return;
      }

      // Build workspace list
      const wsList: Workspace[] = allMr.map((mr: any) => ({
        id: mr.firm_id,
        name: mr.firms?.name || "My Workspace",
        role: mr.role || "member",
        isOwn: mr.role === "admin",
      }));

      setWorkspaces(wsList);

      // Default to own workspace (admin) first, then first available
      const defaultWs = wsList.find(w => w.isOwn) || wsList[0];
      setActiveWs(defaultWs);

      await loadWorkspaceData(session.user, defaultWs, allMr);
      setLoading(false);
    })();
  }, [router]);

  const loadWorkspaceData = async (u: any, ws: Workspace, allMr?: any[]) => {
    setMyProjects([]); setMemberCards([]); setSharedIds(new Set()); setFirmMembers([]);

    const isAdmin = ws.role === "admin";

    // Load team members
    const { data: tm } = await supabase.from("firm_members")
      .select("*").eq("firm_id", ws.id);
    setFirmMembers((tm||[]).filter((m:any) => m.user_id !== u.id));

    // Shared project ids
    const { data: pm } = await supabase.from("project_members")
      .select("project_id").eq("firm_id", ws.id);
    setSharedIds(new Set((pm||[]).map((x:any) => x.project_id)));

    if (isAdmin) {
      const { data: fp } = await supabase.from("projects")
        .select("*, appraisals(id,gdv,profit,profit_on_cost,irr_unlevered,status,created_at)")
        .eq("firm_id", ws.id).is("deleted_at", null)
        .order("created_at", { ascending: false });
      setMyProjects(fp || []);
    } else {
      // Member: show assigned projects
      const { data: assigned } = await supabase.from("project_members")
        .select("project_id, projects(*, appraisals(id,gdv,profit,profit_on_cost,irr_unlevered,status,created_at))")
        .eq("user_id", u.id).eq("firm_id", ws.id);
      setMemberCards((assigned||[]).map((a:any) => ({id: a.project_id, ...a.projects})));

      // Own projects available to share
      const { data: ownP } = await supabase.from("projects")
        .select("*, appraisals(id,gdv,profit,profit_on_cost,irr_unlevered,status,created_at)")
        .eq("created_by", u.id).is("deleted_at", null)
        .order("created_at", { ascending: false });
      setMyProjects(ownP || []);
    }
  };

  const switchWorkspace = async (ws: Workspace) => {
    setShowWsDrop(false);
    setActiveWs(ws);
    setTab("projects");
    setSharingId(null); setSelectedM([]);
    if (user) await loadWorkspaceData(user, ws);
  };

  const createFirm = async () => {
    if (!newFirmName.trim() || !user) return;
    setCreating(true);
    const { data: firm, error } = await supabase.from("firms")
      .insert({ name: newFirmName.trim(), owner_id: user.id }).select().single();
    if (firm && !error) {
      await supabase.from("firm_members").insert({
        firm_id: firm.id, user_id: user.id, role: "admin",
        invited_by: user.id, email: user.email,
      });
      await supabase.from("projects")
        .update({ firm_id: firm.id })
        .eq("created_by", user.id).is("firm_id", null);
      window.location.reload();
    }
    setCreating(false);
  };

  const shareWith = async (projectId: string) => {
    if (!activeWs || !user || selectedM.length === 0) return;
    setSavingShare(true);
    for (const uid of selectedM) {
      await supabase.from("project_members").upsert({
        project_id: projectId, user_id: uid, firm_id: activeWs.id, assigned_by: user.id,
      }, { onConflict: "project_id,user_id" });
    }
    setSharedIds(prev => new Set([...prev, projectId]));
    setSharingId(null); setSelectedM([]); setSavingShare(false);
  };

  const unshare = async (projectId: string) => {
    if (!activeWs) return;
    await supabase.from("project_members").delete().eq("project_id", projectId).eq("firm_id", activeWs.id);
    setSharedIds(prev => { const n = new Set(prev); n.delete(projectId); return n; });
  };

  const isAdmin = activeWs?.role === "admin";
  const displayCards = isAdmin ? myProjects : memberCards;

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#06070a", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:30, height:30, border:"2px solid rgba(201,168,76,.15)", borderTopColor:"#c9a84c", borderRadius:"50%", animation:"spin .8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (noFirm) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", fontFamily:"var(--font-body)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{CSS}</style>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 60% 40% at 50% 40%,rgba(201,168,76,.04) 0%,transparent 60%)" }}/>
      <div style={{ maxWidth:480, width:"100%", padding:"0 24px", position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:56, fontWeight:300, color:"var(--gold)", marginBottom:8 }}>◈</div>
        <h1 style={{ fontFamily:"var(--font-display)", fontSize:40, fontWeight:300, letterSpacing:".02em", marginBottom:12 }}>Create your Workspace</h1>
        <p style={{ fontSize:14, color:"var(--text-m)", marginBottom:40, lineHeight:1.6 }}>
          Your workspace is where your team collaborates on projects, tasks and appraisals.
        </p>
        <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:16, padding:32, textAlign:"left" }}>
          <label style={{ fontSize:10, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".1em", display:"block", marginBottom:8 }}>Workspace Name</label>
          <input value={newFirmName} onChange={e => setNewFirmName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && createFirm()}
            placeholder="e.g. Valora Capital, Apex Development..."
            autoFocus
            style={{ width:"100%", padding:"12px 16px", background:"var(--bg3)", border:"1px solid var(--border-m)", borderRadius:10, color:"var(--text)", fontFamily:"var(--font-body)", fontSize:14, outline:"none", marginBottom:24 }}/>
          <button onClick={createFirm} disabled={!newFirmName.trim()||creating}
            style={{ width:"100%", background:"var(--gold)", color:"#06070a", border:"none", borderRadius:10, padding:"13px 0", fontFamily:"var(--font-body)", fontSize:14, fontWeight:700, cursor:"pointer", opacity:!newFirmName.trim()?0.4:1 }}>
            {creating ? "Creating…" : "Create Workspace →"}
          </button>
        </div>
        <button onClick={() => router.push("/dashboard")}
          style={{ background:"none", border:"none", color:"var(--text-d)", fontSize:12, cursor:"pointer", marginTop:20, fontFamily:"var(--font-body)" }}>
          ← Back to Portfolio
        </button>
      </div>
    </div>
  );

  const ProjectCard = ({ p, i, showFooter }: { p: any; i: number; showFooter?: boolean }) => {
    const latest = (p.appraisals||[]).sort((a:any,b:any)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())[0];
    const sym = CURR[p.currency] || "£";
    const shared = sharedIds.has(p.id);
    const isSharingThis = sharingId === p.id;
    return (
      <div className="pcard" style={{ animationDelay:`${i*0.03}s` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <span style={{ fontSize:10, padding:"2px 9px", borderRadius:10, background:"var(--gold-bg)", color:"var(--gold)", fontWeight:600 }}>{p.asset_type}</span>
          <span style={{ fontSize:10, padding:"2px 9px", borderRadius:10, background:"rgba(125,133,144,.1)", color:"var(--text-m)" }}>{latest?.status||"draft"}</span>
          {shared && <span style={{ fontSize:10, color:"var(--green)", marginLeft:"auto", background:"rgba(61,220,132,.08)", padding:"1px 8px", borderRadius:10, border:"1px solid rgba(61,220,132,.2)" }}>✓ Shared</span>}
        </div>
        <div onClick={() => router.push(`/workspace/${p.id}`)} style={{ cursor:"pointer" }}>
          <h3 style={{ fontSize:17, fontWeight:500, fontFamily:"var(--font-display)", marginBottom:3 }}>{p.name||"Untitled"}</h3>
          <p style={{ fontSize:12, color:"var(--text-m)", marginBottom:14 }}>{p.location||"No location"}</p>
          {latest ? (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
              {[
                {l:"GDV",v:fmt(latest.gdv,sym),c:"var(--gold)"},
                {l:"Profit",v:fmt(latest.profit,sym),c:(latest.profit||0)>0?"var(--green)":"var(--red)"},
                {l:"PoC",v:fmtPct(latest.profit_on_cost),c:latest.profit_on_cost>0.2?"var(--green)":"var(--amber)"},
              ].map(m=>(
                <div key={m.l} className="metric-pill">
                  <div style={{ fontSize:9, color:"var(--text-d)", textTransform:"uppercase", marginBottom:2 }}>{m.l}</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:12, color:m.c }}>{m.v}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background:"var(--bg3)", borderRadius:7, padding:"8px 12px", fontSize:12, color:"var(--text-d)", marginBottom:14 }}>No appraisal saved yet</div>
          )}
        </div>
        {!showFooter ? (
          <div style={{ display:"flex", gap:8, paddingTop:12, borderTop:"1px solid var(--border)" }}>
            <button onClick={() => router.push(latest ? `/appraisal?project=${p.id}&appraisal=${latest.id}` : `/appraisal?project=${p.id}`)}
              style={{ flex:1, background:"none", border:"1px solid var(--border)", borderRadius:7, padding:"7px 0", fontSize:11, color:"var(--text-m)", cursor:"pointer", fontFamily:"var(--font-body)", transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold-border)";e.currentTarget.style.color="var(--gold)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-m)";}}>
              Open Appraisal
            </button>
            <button onClick={() => router.push(`/workspace/${p.id}`)}
              style={{ flex:1, background:"var(--gold-bg)", border:"1px solid var(--gold-border)", borderRadius:7, padding:"7px 0", fontSize:11, color:"var(--gold)", cursor:"pointer", fontFamily:"var(--font-body)", fontWeight:600 }}>
              Tasks & Notes →
            </button>
          </div>
        ) : (
          <div style={{ paddingTop:12, borderTop:"1px solid var(--border)" }}>
            {!isSharingThis ? (
              <div style={{ display:"flex", gap:8 }}>
                {!shared ? (
                  firmMembers.length > 0 ? (
                    <button className="btn-gold" style={{ flex:1, padding:"8px" }} onClick={() => { setSharingId(p.id); setSelectedM([]); }}>
                      Share with Team
                    </button>
                  ) : (
                    <button className="btn-ghost" style={{ flex:1, padding:"8px", fontSize:11 }} onClick={() => router.push("/team")}>
                      Invite members first →
                    </button>
                  )
                ) : (
                  <>
                    <button onClick={() => router.push(latest ? `/appraisal?project=${p.id}&appraisal=${latest.id}` : `/appraisal?project=${p.id}`)}
                      style={{ flex:1, background:"none", border:"1px solid var(--border)", borderRadius:7, padding:"7px 0", fontSize:11, color:"var(--text-m)", cursor:"pointer", fontFamily:"var(--font-body)", transition:"all .2s" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold-border)";e.currentTarget.style.color="var(--gold)";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-m)";}}>
                      Open Appraisal
                    </button>
                    <button className="btn-ghost" style={{ fontSize:11, padding:"7px 10px" }} onClick={() => unshare(p.id)}>Unshare</button>
                  </>
                )}
              </div>
            ) : (
              <div>
                <div style={{ fontSize:10, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>Share with</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                  {firmMembers.map((m:any) => {
                    const sel = selectedM.includes(m.user_id);
                    return (
                      <button key={m.id} className={`mem-pill ${sel?"sel":""}`}
                        onClick={() => setSelectedM(prev => sel ? prev.filter(x=>x!==m.user_id) : [...prev, m.user_id])}>
                        {m.Name || m.email || m.role}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="btn-gold" style={{ flex:1, padding:"8px", fontSize:12 }} disabled={savingShare||selectedM.length===0} onClick={() => shareWith(p.id)}>
                    {savingShare?"Sharing…":"Share →"}
                  </button>
                  <button className="btn-ghost" style={{ padding:"8px 12px" }} onClick={() => { setSharingId(null); setSelectedM([]); }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", fontFamily:"var(--font-body)" }}>
      <style>{CSS}</style>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, background:"radial-gradient(ellipse 60% 40% at 10% 50%,rgba(201,168,76,.025) 0%,transparent 55%)" }}/>

      {/* Nav */}
      <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(6,7,10,.92)", backdropFilter:"blur(16px)", borderBottom:"1px solid var(--border)", height:54, display:"flex", alignItems:"center", padding:"0 28px", gap:14 }}>
        <button className="nbtn" onClick={() => router.push("/dashboard")}>← Portfolio</button>

        {/* Workspace Switcher */}
        <div ref={dropdownRef} style={{ position:"relative" }}>
          <button
            onClick={() => setShowWsDrop(v => !v)}
            style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"1px solid var(--border)", borderRadius:8, padding:"5px 12px", cursor:"pointer", fontFamily:"var(--font-body)", transition:"all .2s", borderColor: showWsDrop ? "var(--gold-border)" : "var(--border)" }}>
            <span style={{ fontSize:11, color:"var(--gold)", letterSpacing:".02em" }}>◈</span>
            <span style={{ fontSize:12, color:"var(--text)", fontWeight:500 }}>{activeWs?.name || "Workspace"}</span>
            <span style={{ fontSize:9, color:"var(--text-d)", background:"var(--bg3)", padding:"1px 6px", borderRadius:4, fontWeight:600, textTransform:"uppercase" }}>{activeWs?.role}</span>
            <span style={{ fontSize:10, color:"var(--text-d)", marginLeft:2 }}>{showWsDrop ? "▲" : "▼"}</span>
          </button>

          {showWsDrop && (
            <div className="ws-dropdown">
              <div style={{ fontSize:9, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".1em", padding:"6px 12px 4px" }}>Your Workspaces</div>
              {workspaces.map(ws => (
                <button key={ws.id} className={`ws-item ${activeWs?.id === ws.id ? "active" : ""}`} onClick={() => switchWorkspace(ws)}>
                  <span style={{ fontSize:13, color:"var(--gold)" }}>◈</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:"var(--text)", fontWeight:500 }}>{ws.name}</div>
                    <div style={{ fontSize:10, color:"var(--text-d)", marginTop:1, textTransform:"uppercase", letterSpacing:".06em" }}>{ws.role}</div>
                  </div>
                  {activeWs?.id === ws.id && <span style={{ fontSize:10, color:"var(--gold)" }}>✓</span>}
                </button>
              ))}
              <div style={{ height:1, background:"var(--border)", margin:"4px 0" }}/>
              <button className="ws-item" onClick={() => { setShowWsDrop(false); setNoFirm(true); }}>
                <span style={{ fontSize:13, color:"var(--text-d)" }}>+</span>
                <div style={{ fontSize:12, color:"var(--text-m)" }}>New Workspace</div>
              </button>
            </div>
          )}
        </div>

        <div style={{ flex:1 }}/>
        <button className="nbtn" onClick={() => router.push("/tasks")}>Tasks</button>
        {isAdmin && <button className="nbtn" onClick={() => router.push("/team")}>+ Team</button>}
        <span style={{ fontSize:9, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".14em", padding:"3px 11px", border:"1px solid var(--border)", borderRadius:20, fontWeight:600 }}>{activeWs?.role}</span>
      </nav>

      <div className="page-wrap" style={{ maxWidth:1000, margin:"0 auto", padding:"40px 28px 80px", position:"relative", zIndex:1 }}>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:11, color:"var(--gold)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:8 }}>{activeWs?.name}</div>
          <h1 style={{ fontFamily:"var(--font-display)", fontSize:48, fontWeight:300, letterSpacing:".01em", marginBottom:6 }}>Workspace</h1>
          <p style={{ fontSize:13, color:"var(--text-m)" }}>
            {displayCards.length} project{displayCards.length !== 1 ? "s" : ""} · {activeWs?.role}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid var(--border)", marginBottom:32 }}>
          <button className={`tab ${tab==="projects"?"on":""}`} onClick={() => setTab("projects")}>Projects</button>
          <button className={`tab ${tab==="share"?"on":""}`} onClick={() => {
            if (!isPro) { router.push("/pricing"); return; }
            setTab("share");
          }}>
            {isPro ? "Share a Project" : "Share a Project ✦ Upgrade"}
          </button>
        </div>

        {/* PROJECTS TAB */}
        {tab === "projects" && (
          displayCards.length === 0 ? (
            <div style={{ textAlign:"center", padding:"80px 0" }}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:48, fontWeight:300, color:"var(--text-d)", marginBottom:16 }}>◈</div>
              <p style={{ fontSize:15, color:"var(--text-d)", marginBottom:8 }}>
                {isAdmin ? "No projects in this workspace yet" : "No projects shared with you yet"}
              </p>
              <p style={{ fontSize:13, color:"var(--text-d)", marginBottom:24 }}>
                {isAdmin ? "Use Share a Project to share with your team." : "Your workspace admin will share projects with you."}
              </p>
              {isAdmin && <button className="btn-gold" onClick={() => setTab("share")}>Share a Project →</button>}
            </div>
          ) : (
            <div className="cards-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
              {displayCards.map((p, i) => <ProjectCard key={p.id} p={p} i={i} showFooter={false} />)}
            </div>
          )
        )}

        {/* SHARE TAB */}
        {tab === "share" && (
          <>
            <div style={{ fontSize:13, color:"var(--text-m)", marginBottom:24 }}>
              Share your projects with team members. Shared projects appear in their workspace — not in their personal portfolio or pipeline.
            </div>
            {myProjects.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-d)", fontSize:13 }}>
                No projects to share.{" "}
                <span style={{ color:"var(--gold)", cursor:"pointer" }} onClick={() => router.push("/dashboard")}>Create one →</span>
              </div>
            ) : (
              <div className="cards-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
                {myProjects.map((p, i) => <ProjectCard key={p.id} p={p} i={i} showFooter={true} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
