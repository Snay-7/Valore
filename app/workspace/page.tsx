"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
/* ═══════════════════════════════════════════════════════════════════════
   VALORA — WORKSPACE v2 (list view)
   Rebranded to the Valora design system. All Supabase / router / state
   preserved verbatim. Theme sync matches dashboard + pipeline + tasks +
   team + notes: body.light + html[data-theme] + localStorage (valora-theme
   + val-theme) with cross-page/tab listeners.
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
  /* ─── LEGACY ALIASES — keep old inline styles working ─── */
  --gold:var(--val-green);--gold-l:#5DD3A4;--gold-bg:var(--val-green-tint);--gold-border:var(--val-border-accent);
  --bg:var(--val-bg-app);--bg1:var(--val-bg-panel);--bg2:var(--val-bg-panel);
  --bg3:var(--val-bg-panel-2);--bg4:var(--val-bg-panel-3);--bg5:#383E4A;
  --text:var(--val-text);--text-m:var(--val-text-mid);--text-d:var(--val-text-dim);
  --border:var(--val-border);--border-m:var(--val-border-lt);
  --green:var(--val-green);--red:var(--val-red);--amber:var(--val-amber);--blue:var(--val-blue);--purple:#a78bfa;
  --font-display:var(--val-font-body);--font-body:var(--val-font-body);--font-mono:var(--val-font-mono);
}

/* ─── LIGHT THEME — dual selector ─── */
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

html,body{background:var(--val-bg-app);color:var(--val-text);font-family:var(--val-font-body);font-size:14px;line-height:1.45;font-weight:400;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
::selection{background:var(--val-green-tint);color:var(--val-text)}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--val-border-lt);border-radius:var(--val-r-pill);border:2px solid var(--val-bg-app)}
::-webkit-scrollbar-thumb:hover{background:var(--val-text-dim)}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* ═══ PROJECT CARD ═══ */
.pcard{
  background:var(--val-bg-panel);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-xl);
  padding:22px;
  transition:border-color var(--val-dur) var(--val-ease),transform .15s var(--val-ease);
  animation:fadeUp .3s var(--val-ease) both;
}
.pcard:hover{border-color:var(--val-border-lt);transform:translateY(-1px)}

/* ═══ METRIC PILL (3-up on card) ═══ */
.metric-pill{background:var(--val-bg-panel-2);border-radius:var(--val-r-md);padding:10px 14px}

/* ═══ BUTTONS ═══ */
.btn-gold{
  background:var(--val-green);color:var(--val-bg-app);
  border:none;border-radius:var(--val-r-sm);
  height:34px;padding:0 16px;
  font-family:var(--val-font-body);font-size:13px;font-weight:600;letter-spacing:-0.015em;
  cursor:pointer;transition:background var(--val-dur) var(--val-ease);
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
}
.btn-gold:hover{background:#5DD3A4}
body.light .btn-gold:hover,
:root[data-theme="light"] .btn-gold:hover{background:var(--val-green-deep)}
.btn-gold:disabled{opacity:.35;cursor:not-allowed}
.btn-ghost{
  background:transparent;color:var(--val-text-mid);
  border:1px solid var(--val-border-lt);border-radius:var(--val-r-sm);
  height:32px;padding:0 14px;
  font-family:var(--val-font-body);font-size:12px;font-weight:600;letter-spacing:-0.015em;
  cursor:pointer;transition:all var(--val-dur) var(--val-ease);
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
}
.btn-ghost:hover{border-color:var(--val-text-dim);color:var(--val-text)}

/* ═══ TOP-NAV BUTTON ═══ */
.nbtn{
  background:transparent;border:1px solid var(--val-border);border-radius:var(--val-r-sm);
  color:var(--val-text-mid);cursor:pointer;
  padding:0 14px;height:30px;
  font-family:var(--val-font-body);font-size:12px;font-weight:500;letter-spacing:-0.015em;
  transition:all var(--val-dur) var(--val-ease);
  display:inline-flex;align-items:center;gap:4px;
}
.nbtn:hover{border-color:var(--val-border-lt);color:var(--val-text)}

/* ═══ TABS (Projects / Share a Project) ═══ */
.tab{
  background:transparent;border:none;
  font-family:var(--val-font-body);font-size:14px;font-weight:500;
  cursor:pointer;padding:12px 2px;margin-right:28px;
  color:var(--val-text-dim);border-bottom:2px solid transparent;
  transition:color var(--val-dur) var(--val-ease);
}
.tab:hover{color:var(--val-text-mid)}
.tab.on{color:var(--val-green);border-bottom-color:var(--val-green);font-weight:700}

/* ═══ MEMBER PILL (share-with picker) ═══ */
.mem-pill{
  padding:4px 11px;border-radius:var(--val-r-pill);
  font-size:11px;font-weight:500;
  cursor:pointer;border:1px solid var(--val-border);
  background:transparent;color:var(--val-text-mid);
  font-family:var(--val-font-body);transition:all var(--val-dur) var(--val-ease);
}
.mem-pill:hover{border-color:var(--val-border-lt);color:var(--val-text)}
.mem-pill.sel{border-color:var(--val-green);background:var(--val-green-tint);color:var(--val-green)}

/* ═══ RESPONSIVE ═══ */
@media(max-width:768px){
  .cards-grid{grid-template-columns:1fr!important}
  .page-wrap{padding:24px 16px 80px!important}
  .workspace-nav{padding:0 14px!important;gap:6px!important;height:auto!important;min-height:48px!important;flex-wrap:wrap!important}
  .workspace-nav .nbtn{font-size:10px!important;padding:0 8px!important;height:26px!important}
  .workspace-nav .firm-name{display:none!important}
  .workspace-nav .role-badge{font-size:8px!important;padding:2px 7px!important}
}
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
export default function WorkspacePage() {
  const router = useRouter();
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
  const [user,        setUser]        = useState<any>(null);
  const [firm,        setFirm]        = useState<any>(null);
  const [role,        setRole]        = useState("member");
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [isPro,       setIsPro]       = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [noFirm,      setNoFirm]      = useState(false);
  const [newFirmName, setNewFirmName] = useState("");
  const [creating,    setCreating]    = useState(false);
  const [tab,         setTab]         = useState<"projects"|"share">("projects");
  const [myProjects,  setMyProjects]  = useState<any[]>([]);
  const [sharedIds,   setSharedIds]   = useState<Set<string>>(new Set());
  const [memberCards, setMemberCards] = useState<any[]>([]);
  const [firmMembers, setFirmMembers] = useState<any[]>([]);
  const [sharingId,   setSharingId]   = useState<string|null>(null);
  const [selectedM,   setSelectedM]   = useState<string[]>([]);
  const [savingShare, setSavingShare] = useState(false);
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);
      const { data: mr } = await supabase.from("firm_members")
        .select("*, firms(*)").eq("user_id", session.user.id).maybeSingle();
      if (!mr) { setNoFirm(true); setLoading(false); return; }
      setFirm(mr.firms);
      setRole(mr.role || "member");
      const admin = mr.role === "admin";
      setIsAdmin(admin);
      const { data: sub } = await supabase.from("subscriptions")
        .select("tier, trial_ends_at").eq("user_id", session.user.id).maybeSingle();
      const tier = sub?.tier || "free";
      const trialing = sub?.trial_ends_at && new Date(sub.trial_ends_at) > new Date();
      setIsPro(tier === "professional" || tier === "enterprise" || !!trialing || tier === "starter");
      const { data: tm } = await supabase.from("firm_members")
        .select("*").eq("firm_id", mr.firm_id);
      setFirmMembers((tm||[]).filter((m:any) => m.user_id !== session.user.id));
      const { data: pm } = await supabase.from("project_members")
        .select("project_id").eq("firm_id", mr.firm_id);
      setSharedIds(new Set((pm||[]).map((x:any) => x.project_id)));
      if (admin) {
        const { data: fp } = await supabase.from("projects")
          .select("*, appraisals(id,gdv,profit,profit_on_cost,irr_unlevered,status,created_at)")
          .eq("firm_id", mr.firm_id).is("deleted_at", null)
          .order("created_at", { ascending: false });
        setMyProjects(fp || []);
      } else {
        const { data: assigned } = await supabase.from("project_members")
          .select("project_id, projects(*, appraisals(id,gdv,profit,profit_on_cost,irr_unlevered,status,created_at))")
          .eq("user_id", session.user.id).eq("firm_id", mr.firm_id);
        setMemberCards((assigned||[]).map((a:any) => ({id: a.project_id, ...a.projects})));
        const { data: ownP } = await supabase.from("projects")
          .select("*, appraisals(id,gdv,profit,profit_on_cost,irr_unlevered,status,created_at)")
          .eq("created_by", session.user.id).is("deleted_at", null)
          .order("created_at", { ascending: false });
        setMyProjects(ownP || []);
      }
      setLoading(false);
    })();
  }, [router]);
  const shareWith = async (projectId: string) => {
    if (!firm || !user || selectedM.length === 0) return;
    setSavingShare(true);
    for (const uid of selectedM) {
      await supabase.from("project_members").upsert({
        project_id: projectId, user_id: uid, firm_id: firm.id, assigned_by: user.id,
      }, { onConflict: "project_id,user_id" });
    }
    setSharedIds(prev => new Set([...prev, projectId]));
    setSharingId(null); setSelectedM([]); setSavingShare(false);
  };
  const unshare = async (projectId: string) => {
    if (!firm) return;
    await supabase.from("project_members").delete().eq("project_id", projectId).eq("firm_id", firm.id);
    setSharedIds(prev => { const n = new Set(prev); n.delete(projectId); return n; });
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
        .eq("created_by", user.id)
        .is("firm_id", null);
      router.refresh();
      window.location.reload();
    }
    setCreating(false);
  };
  const displayCards = isAdmin ? myProjects : memberCards;
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"var(--val-bg-app, #0F1115)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:30, height:30, border:"2px solid rgba(82,196,152,.15)", borderTopColor:"#52C498", borderRadius:"50%", animation:"spin .8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (noFirm) return (
    <div style={{ minHeight:"100vh", background:"var(--val-bg-app)", color:"var(--val-text)", fontFamily:"var(--val-font-body)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var keys=['valora-theme','val-theme','theme'];for(var i=0;i<keys.length;i++){var v=localStorage.getItem(keys[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='light';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');else if(document.body)document.body.classList.remove('light');try{localStorage.setItem('valora-theme',t);localStorage.setItem('val-theme',t);}catch(e){}}catch(e){}})()`}}/>
      <div style={{ maxWidth:480, width:"100%", padding:"0 24px", textAlign:"center" }}>
        <div style={{ fontFamily:"var(--val-font-body)", fontSize:56, fontWeight:700, color:"var(--val-green)", marginBottom:8, letterSpacing:"-.015em" }}>◈</div>
        <h1 style={{ fontFamily:"var(--val-font-body)", fontSize:34, fontWeight:700, letterSpacing:"-.03em", marginBottom:12, color:"var(--val-text)" }}>Create your Workspace</h1>
        <p style={{ fontSize:14, color:"var(--val-text-mid)", marginBottom:32, lineHeight:1.55, fontWeight:500 }}>
          Your workspace is where your team collaborates on projects, tasks and appraisals. Give it a name to get started.
        </p>
        <div style={{ background:"var(--val-bg-panel)", border:"1px solid var(--val-border)", borderRadius:"var(--val-r-xl)", padding:28, textAlign:"left" }}>
          <label style={{ fontSize:11, color:"var(--val-text-dim)", textTransform:"uppercase", letterSpacing:".04em", display:"block", marginBottom:8, fontWeight:600 }}>Workspace Name</label>
          <input
            value={newFirmName}
            onChange={e => setNewFirmName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && createFirm()}
            placeholder="e.g. Valora Capital, Apex Development..."
            autoFocus
            style={{ width:"100%", padding:"12px 16px", background:"var(--val-bg-panel-2)", border:"1px solid var(--val-border)", borderRadius:"var(--val-r-md)", color:"var(--val-text)", fontFamily:"var(--val-font-body)", fontSize:14, fontWeight:500, outline:"none", marginBottom:20, boxSizing:"border-box" }}
          />
          <button
            onClick={createFirm}
            disabled={!newFirmName.trim() || creating}
            className="btn-gold"
            style={{ width:"100%", height:44, fontSize:14 }}>
            {creating ? "Creating…" : "Create Workspace →"}
          </button>
        </div>
        <p style={{ fontSize:12, color:"var(--val-text-dim)", marginTop:20, fontWeight:500 }}>
          You can invite team members after setup.
        </p>
        <button onClick={() => router.push("/dashboard")} style={{ background:"none", border:"none", color:"var(--val-text-dim)", fontSize:12, cursor:"pointer", marginTop:12, fontFamily:"var(--val-font-body)", fontWeight:500 }}>
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
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <span style={{ fontSize:11, padding:"2px 10px", borderRadius:"var(--val-r-pill)", background:"var(--val-green-tint)", color:"var(--val-green)", fontWeight:600, letterSpacing:"-.015em", border:"1px solid var(--val-border-accent)" }}>{p.asset_type}</span>
          <span style={{ fontSize:11, padding:"2px 10px", borderRadius:"var(--val-r-pill)", background:"rgba(148,152,160,.12)", color:"var(--val-text-dim)", fontWeight:500, border:"1px solid var(--val-border)" }}>{latest?.status||"draft"}</span>
          {shared && <span style={{ fontSize:10, color:"var(--val-green)", marginLeft:"auto", background:"var(--val-green-tint)", padding:"2px 8px", borderRadius:"var(--val-r-pill)", border:"1px solid var(--val-border-accent)", fontWeight:600 }}>✓ Shared</span>}
        </div>
        <div onClick={() => router.push(`/workspace/${p.id}`)} style={{ cursor:"pointer" }}>
          <h3 style={{ fontSize:17, fontWeight:700, fontFamily:"var(--val-font-body)", marginBottom:4, letterSpacing:"-.015em", color:"var(--val-text)", lineHeight:1.3 }}>{p.name||"Untitled"}</h3>
          <p style={{ fontSize:12, color:"var(--val-text-dim)", marginBottom:14, fontWeight:500 }}>{p.location||"No location"}</p>
          {latest ? (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
              {[
                {l:"GDV",v:fmt(latest.gdv,sym),c:"var(--val-green)"},
                {l:"Profit",v:fmt(latest.profit,sym),c:(latest.profit||0)>0?"var(--val-green)":"var(--val-red)"},
                {l:"PoC",v:fmtPct(latest.profit_on_cost),c:latest.profit_on_cost>0.2?"var(--val-green)":"var(--val-amber)"},
              ].map(m=>(
                <div key={m.l} className="metric-pill">
                  <div style={{ fontSize:10, color:"var(--val-text-dim)", textTransform:"uppercase", letterSpacing:".04em", marginBottom:3, fontWeight:600 }}>{m.l}</div>
                  <div style={{ fontFamily:"var(--val-font-mono)", fontSize:12, color:m.c, fontWeight:600, fontVariantNumeric:"tabular-nums" }}>{m.v}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background:"var(--val-bg-panel-2)", borderRadius:"var(--val-r-md)", padding:"10px 14px", fontSize:12, color:"var(--val-text-dim)", marginBottom:14, fontWeight:500 }}>No appraisal saved yet</div>
          )}
        </div>
        {/* Action footer */}
        {!showFooter ? (
          <div style={{ display:"flex", gap:8, paddingTop:14, borderTop:"1px solid var(--val-border)" }}>
            <button onClick={() => router.push(latest ? `/appraisal?project=${p.id}&appraisal=${latest.id}` : `/appraisal?project=${p.id}`)}
              style={{ flex:1, background:"transparent", border:"1px solid var(--val-border-lt)", borderRadius:"var(--val-r-sm)", padding:"8px 0", fontSize:12, color:"var(--val-text-mid)", cursor:"pointer", fontFamily:"var(--val-font-body)", fontWeight:600, transition:"all var(--val-dur) var(--val-ease)" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--val-text-dim)";e.currentTarget.style.color="var(--val-text)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--val-border-lt)";e.currentTarget.style.color="var(--val-text-mid)";}}>
              Open Appraisal
            </button>
            <button onClick={() => router.push(`/workspace/${p.id}`)}
              style={{ flex:1, background:"var(--val-green-tint)", border:"1px solid var(--val-border-accent)", borderRadius:"var(--val-r-sm)", padding:"8px 0", fontSize:12, color:"var(--val-green)", cursor:"pointer", fontFamily:"var(--val-font-body)", fontWeight:600 }}>
              Tasks & Notes →
            </button>
          </div>
        ) : (
          <div style={{ paddingTop:14, borderTop:"1px solid var(--val-border)" }}>
            {!isSharingThis ? (
              <div style={{ display:"flex", gap:8 }}>
                {!shared ? (
                  firmMembers.length > 0 ? (
                    <button className="btn-gold" style={{ flex:1 }} onClick={() => { setSharingId(p.id); setSelectedM([]); }}>
                      Share with Team
                    </button>
                  ) : (
                    <button className="btn-ghost" style={{ flex:1 }} onClick={() => router.push("/team")}>
                      Invite members first →
                    </button>
                  )
                ) : (
                  <>
                    <button onClick={() => router.push(latest ? `/appraisal?project=${p.id}&appraisal=${latest.id}` : `/appraisal?project=${p.id}`)}
                      style={{ flex:1, background:"transparent", border:"1px solid var(--val-border-lt)", borderRadius:"var(--val-r-sm)", padding:"8px 0", fontSize:12, color:"var(--val-text-mid)", cursor:"pointer", fontFamily:"var(--val-font-body)", fontWeight:600 }}>
                      Open Appraisal
                    </button>
                    <button className="btn-ghost" onClick={() => unshare(p.id)}>Unshare</button>
                  </>
                )}
              </div>
            ) : (
              <div>
                <div style={{ fontSize:11, color:"var(--val-text-dim)", textTransform:"uppercase", letterSpacing:".04em", marginBottom:8, fontWeight:600 }}>Share with</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                  {firmMembers.map((m:any) => {
                    const sel = selectedM.includes(m.user_id);
                    return (
                      <button key={m.id} className={`mem-pill ${sel?"sel":""}`}
                        onClick={() => setSelectedM(prev => sel ? prev.filter(x=>x!==m.user_id) : [...prev, m.user_id])}>
                        {m.email || m.role}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="btn-gold" style={{ flex:1 }} disabled={savingShare||selectedM.length===0} onClick={() => shareWith(p.id)}>
                    {savingShare?"Sharing…":"Share →"}
                  </button>
                  <button className="btn-ghost" onClick={() => { setSharingId(null); setSelectedM([]); }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  return (
    <div style={{ minHeight:"100vh", background:"var(--val-bg-app)", color:"var(--val-text)", fontFamily:"var(--val-font-body)" }}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var keys=['valora-theme','val-theme','theme'];for(var i=0;i<keys.length;i++){var v=localStorage.getItem(keys[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='light';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');else if(document.body)document.body.classList.remove('light');try{localStorage.setItem('valora-theme',t);localStorage.setItem('val-theme',t);}catch(e){}}catch(e){}})()`}}/>
      {/* ── Top nav ── */}
      <nav className="workspace-nav" style={{ position:"sticky", top:0, zIndex:50, background:"var(--val-bg-panel)", backdropFilter:"blur(16px)", borderBottom:"1px solid var(--val-border)", height:56, display:"flex", alignItems:"center", padding:"0 24px", gap:12 }}>
        <button className="nbtn" onClick={() => router.push("/dashboard")}>← Portfolio</button>
        {firm && <><span style={{ color:"var(--val-text-dim)", fontSize:14 }}>/</span><span className="firm-name" style={{ fontSize:11, color:"var(--val-green)", textTransform:"uppercase", letterSpacing:".08em", fontWeight:600 }}>{firm.name}</span></>}
        <div style={{ flex:1 }}/>
        <button className="nbtn" onClick={() => router.push("/tasks")}>Tasks</button>
        {isAdmin && <button className="nbtn" onClick={() => router.push("/team")}>+ Team</button>}
        <span className="role-badge" style={{ fontSize:10, color:"var(--val-text-dim)", textTransform:"uppercase", letterSpacing:".12em", padding:"3px 11px", border:"1px solid var(--val-border)", borderRadius:"var(--val-r-pill)", fontWeight:600 }}>{role}</span>
      </nav>
      <div className="page-wrap" style={{ maxWidth:1040, margin:"0 auto", padding:"48px 28px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:11, color:"var(--val-green)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:10, fontWeight:600 }}>{firm?.name}</div>
          <h1 style={{ fontFamily:"var(--val-font-body)", fontSize:44, fontWeight:700, letterSpacing:"-.03em", marginBottom:8, color:"var(--val-text)", lineHeight:1 }}>Workspace</h1>
          <p style={{ fontSize:14, color:"var(--val-text-dim)", fontWeight:500 }}>
            {displayCards.length} project{displayCards.length !== 1 ? "s" : ""} · {role}
          </p>
        </div>
        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid var(--val-border)", marginBottom:28 }}>
          <button className={`tab ${tab==="projects"?"on":""}`} onClick={() => setTab("projects")}>Projects</button>
          <button className={`tab ${tab==="share"?"on":""}`} onClick={() => {
            if (!isPro) { router.push("/pricing"); return; }
            setTab("share");
          }}>
            {isPro ? "Share a Project" : "Share a Project ✦ Upgrade"}
          </button>
        </div>
        {/* ── PROJECTS TAB ── */}
        {tab === "projects" && (
          displayCards.length === 0 ? (
            <div style={{ textAlign:"center", padding:"80px 0" }}>
              <div style={{ fontFamily:"var(--val-font-body)", fontSize:48, fontWeight:700, color:"var(--val-text-dim)", marginBottom:16, letterSpacing:"-.015em" }}>◈</div>
              <p style={{ fontSize:16, color:"var(--val-text-dim)", marginBottom:8, fontWeight:500 }}>
                {isAdmin ? "No projects in your firm yet" : "No projects shared with you yet"}
              </p>
              <p style={{ fontSize:13, color:"var(--val-text-dim)", marginBottom:24, fontWeight:500 }}>
                {isAdmin ? "Use Share a Project to share with your team." : "Your workspace admin will share projects with you."}
              </p>
              {isAdmin && <button className="btn-gold" onClick={() => setTab("share")}>Share a Project →</button>}
            </div>
          ) : (
            <div className="cards-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
              {displayCards.map((p, i) => <ProjectCard key={p.id} p={p} i={i} showFooter={false} />)}
            </div>
          )
        )}
        {/* ── SHARE TAB ── */}
        {tab === "share" && (
          <>
            <div style={{ fontSize:13, color:"var(--val-text-mid)", marginBottom:24, fontWeight:500, lineHeight:1.55 }}>
              Share your projects with team members. Shared projects appear in their workspace — not in their personal portfolio or pipeline.
            </div>
            {myProjects.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:"var(--val-text-dim)", fontSize:13, fontWeight:500 }}>
                No projects to share.{" "}
                <span style={{ color:"var(--val-green)", cursor:"pointer", fontWeight:600 }} onClick={() => router.push("/dashboard")}>Create one →</span>
              </div>
            ) : (
              <div className="cards-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
                {myProjects.map((p, i) => <ProjectCard key={p.id} p={p} i={i} showFooter={true} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
