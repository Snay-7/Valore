"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import CopilotPanel from "../../components/CopilotPanel";
const CALENDLY = "https://calendly.com/hello-valoraplatform/30min";
/* ═══════════════════════════════════════════════════════════════════
   VALORA — DASHBOARD v3
   Full-screen Copilot experience (ChatGPT/Claude-style first screen).
   Portfolio lives at /portfolio. Dashboard = create a new deal only.
   ═══════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0F1115;--bg1:#1A1E26;--bg2:#1A1E26;--bg3:#242933;--bg4:#2D3340;--bg5:#383E4A;
  --text:#F6F4EF;--text-m:#C8CCD4;--text-d:#949CA0;
  --gold:#52C498;--gold-l:#72D4AE;--gold-bg:rgba(82,196,152,0.10);--gold-border:rgba(82,196,152,0.28);
  --green:#52C498;--red:#F4645F;--amber:#F0A429;--blue:#5CA5DC;
  --accent-gold:#C9A84C;
  --border:rgba(255,255,255,0.08);--border-m:rgba(255,255,255,0.14);
  --font-display:'Poppins',system-ui,sans-serif;
  --font-body:'Poppins',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
  --ease:cubic-bezier(0.16,1,0.3,1);
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);font-size:14px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
body.light,
:root[data-theme="light"]{
  --bg:#F8F5EE;--bg1:#FFFFFF;--bg2:#FFFFFF;--bg3:#F2EEE4;--bg4:#EAE5D8;--bg5:#D7D0C0;
  --text:#0F1115;--text-m:#3D4351;--text-d:#6B7280;
  --gold:#2E9E72;--gold-l:#25855E;--gold-bg:rgba(46,158,114,0.08);--gold-border:rgba(46,158,114,0.28);
  --green:#2E9E72;--red:#C24844;--amber:#C57E14;--blue:#2D7AB5;
  --accent-gold:#A8843A;
  --border:rgba(15,17,21,0.08);--border-m:rgba(15,17,21,0.16);
}
@keyframes spin{to{transform:rotate(360deg)}}
.nav-item{width:100%;display:flex;align-items:center;padding:9px 12px;border-radius:8px;font-size:13px;font-weight:500;color:var(--text-d);background:transparent;border:1px solid transparent;cursor:pointer;font-family:var(--font-body);transition:all .15s var(--ease);text-align:left;margin-bottom:2px;letter-spacing:-0.005em;}
.nav-item:hover{color:var(--text);background:rgba(255,255,255,0.04)}
.nav-item.active{color:var(--gold);background:var(--gold-bg);border-color:var(--gold-border);font-weight:600;}
.nav-item.danger-item{color:var(--text-m)}
.nav-item.danger-item:hover{color:var(--text);background:var(--bg3)}
.sidebar{
  width:224px;
  background:var(--bg2);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  position:sticky;top:0;height:100vh;
  z-index:100;flex-shrink:0;
}
body.light .sidebar,
:root[data-theme="light"] .sidebar{background:var(--bg1)}
.btn-demo{display:flex;align-items:center;gap:8px;background:transparent;color:var(--gold);border:1px solid var(--gold-border);border-radius:8px;padding:9px 14px;font-family:var(--font-body);font-size:12px;font-weight:500;cursor:pointer;transition:all .2s var(--ease);width:100%;margin-bottom:2px;}
.btn-demo:hover{background:var(--gold-bg);border-color:var(--gold)}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg2);border-top:1px solid var(--border);z-index:100;padding:6px 0 env(safe-area-inset-bottom,12px);}
.bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;background:none;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);font-size:9px;letter-spacing:.04em;text-transform:uppercase;transition:color .2s var(--ease);}
.bottom-nav-item.active{color:var(--gold)}
.bottom-nav-item svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.mobile-topbar{display:none;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--bg2);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50;}
@media(max-width:768px){
  .sidebar{display:none}
  .bottom-nav{display:flex}
  .mobile-topbar{display:flex}
}
`;
const ASSET_LABELS: Record<string,string> = {BTR:"BTR",BTS:"BTS",Hotel:"Hotel",Flip:"Flip",MixedUse:"Mixed Use",Commercial:"Commercial",Industrial:"Industrial"};
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  // ── Theme ──
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
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", t);
    document.body.classList.toggle("light", t === "light");
    try { localStorage.setItem("valora-theme", t); } catch {}
    try { localStorage.setItem("val-theme", t); } catch {}
  };
  const [theme, setTheme] = useState<"dark"|"light">(() => detectTheme());
  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => {
    let disposed = false;
    const resync = () => { if (disposed) return; const t = detectTheme(); setTheme(prev => prev === t ? prev : t); };
    const onStorage = (e: StorageEvent) => { if (e.key && /theme/i.test(e.key)) resync(); };
    const bodyObs = new MutationObserver(resync);
    bodyObs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    const htmlObs = new MutationObserver(resync);
    htmlObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", resync);
    document.addEventListener("visibilitychange", resync);
    return () => {
      disposed = true;
      bodyObs.disconnect(); htmlObs.disconnect();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", resync);
      document.removeEventListener("visibilitychange", resync);
    };
  }, []);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [totalProjectCount, setTotalProjectCount] = useState(0);
  const [hasFirm, setHasFirm] = useState(false);
  const tier = subscription?.tier || "free";
  const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
  const isTrialing = !!(trialEndsAt && trialEndsAt > new Date());
  const isEnterprise = tier === "enterprise" || isTrialing;
  const isPro = tier === "professional" || isEnterprise;
  const isStarter = tier === "starter";
  const activeProjectLimit = isPro ? Infinity : isStarter ? 10 : 3;
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);
      // Subscription + project count for gating
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", session.user.id).maybeSingle();
      setSubscription(sub);
      const { data: memberRow } = await supabase.from("firm_members").select("id").eq("user_id", session.user.id).maybeSingle();
      setHasFirm(!!memberRow);
      const { count } = await supabase.from("projects").select("*", { count: "exact", head: true }).eq("created_by", session.user.id).is("deleted_at", null);
      setTotalProjectCount(count || 0);
      setLoading(false);
    };
    init();
  }, [router]);
  const tickChecklist = (key: string) => {
    try {
      const raw = localStorage.getItem("valora_checklist");
      const current = raw ? JSON.parse(raw) : {};
      if (!current[key]) {
        current[key] = true;
        localStorage.setItem("valora_checklist", JSON.stringify(current));
      }
    } catch {}
  };
  const signOut = async () => { await supabase.auth.signOut(); router.push("/"); };
  // ── COPILOT HANDLERS ──────────────────────────────────────────────
  const onCopilotNewDeal = async (assetType: string) => {
    if (!user) return;
    if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; }
    const { data: proj, error } = await supabase.from("projects").insert({
      name: `New ${ASSET_LABELS[assetType] || assetType}`, location: "",
      asset_type: assetType, currency: "GBP",
      benchmark_rate: "SONIA", created_by: user.id, firm_id: null,
    }).select().single();
    if (proj && !error) { tickChecklist("created_appraisal"); router.push(`/appraisal?project=${proj.id}&fromCopilot=1`); }
  };
  const onCopilotCreate = async (payload: Record<string, any>) => {
    if (!user) return;
    if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; }
    const { data: proj, error } = await supabase.from("projects").insert({
      name: payload.name || `New ${ASSET_LABELS[payload.assetType] || payload.assetType || "Deal"}`,
      location: payload.location || "",
      asset_type: payload.assetType || "BTR",
      currency: payload.currency || "GBP",
      benchmark_rate: "SONIA", created_by: user.id, firm_id: null,
    }).select().single();
    if (proj && !error) {
      try { sessionStorage.setItem(`valora:copilotDraft:${proj.id}`, JSON.stringify(payload)); } catch {}
      tickChecklist("created_appraisal");
      router.push(`/appraisal?project=${proj.id}&fromCopilot=1`);
    }
  };
  const userFirstName = user?.email
    ? (user?.user_metadata?.full_name || user.email.split("@")[0]).split(" ")[0]
    : undefined;
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0F1115", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <span style={{fontFamily:"'Poppins',system-ui,sans-serif",fontSize:22,fontWeight:700,letterSpacing:"-.03em",color:"#F6F4EF"}}>Valora</span>
      <div style={{ width: 28, height: 28, border: "2px solid rgba(82,196,152,.15)", borderTopColor: "#52C498", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <div style={{ fontSize: 11, color: "#6B7280", letterSpacing: ".08em", textTransform: "uppercase" }}>Loading</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", display: "flex" }}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var keys=['valora-theme','val-theme','theme'];for(var i=0;i<keys.length;i++){var v=localStorage.getItem(keys[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='light';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');else if(document.body)document.body.classList.remove('light');try{localStorage.setItem('valora-theme',t);localStorage.setItem('val-theme',t);}catch(e){}}catch(e){}})()`}}/>
      {/* ── SIDEBAR ── */}
      <div className="sidebar">
        <div style={{ padding: "20px 20px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:700,letterSpacing:"-.03em",color:"var(--text)"}}>Valora</span>
          <div style={{ fontSize: 9, color: "var(--text-d)", letterSpacing: ".18em", textTransform: "uppercase", marginTop: 3, fontFamily:"var(--font-body)", fontWeight: 600 }}>Development Appraisal</div>
        </div>
        <div style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".14em", padding: "0 12px", marginBottom: 8, fontWeight: 600 }}>My Work</div>
          <button className="nav-item active" onClick={() => router.push("/dashboard")} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color: "var(--gold)", fontSize: 14, lineHeight:1 }}>◆</span>
            <span>Copilot</span>
          </button>
          <button className="nav-item" onClick={() => router.push("/portfolio")}>Portfolio</button>
          <button className="nav-item" onClick={() => router.push("/pipeline")}>Pipeline</button>
          <button className="nav-item" onClick={() => router.push("/tasks")}>Tasks</button>
          <button className="nav-item" onClick={() => router.push("/notes")}>Notes</button>
          <button className="nav-item" onClick={() => router.push("/learn")} style={{color:"var(--gold)"}}>✦ Learn</button>
          {hasFirm && (<>
            <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
            <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".14em", padding: "0 12px", marginBottom: 8, fontWeight: 600 }}>Team</div>
            <button className="nav-item" onClick={() => router.push("/workspace")} style={{ color: "var(--gold)" }}>◈ Workspace</button>
            <button className="nav-item" onClick={() => router.push("/team")}>Team</button>
          </>)}
          {!hasFirm && <button className="nav-item" onClick={() => router.push("/team")}>Team</button>}
          <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
          <button className="nav-item danger-item" onClick={() => router.push("/portfolio?view=trash")}>Trash</button>
          {!isPro && (<>
            <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
            <button className="nav-item" onClick={() => router.push("/pricing")} style={{ color: "var(--gold)", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", fontWeight: 600 }}>✦ Upgrade Plan</button>
          </>)}
        </div>
        <div style={{ padding: "12px 12px 0", borderTop: "1px solid var(--border)" }}>
          <button className="btn-demo" onClick={() => window.open(CALENDLY, "_blank")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Book a Demo
          </button>
          <div style={{ padding: "10px 0 14px" }}>
            <div style={{ fontSize: 11, color: "var(--text-d)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{user?.email}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <button className="nav-item" onClick={signOut} style={{ fontSize: 12, padding: "6px 8px", width: "auto" }}>Sign Out</button>
              <button
                onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
                style={{ padding: "5px 10px", borderRadius: 999, border: "1px solid var(--border-m)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "var(--text-d)", fontSize: 10, fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: ".03em" }}
              >
                {theme === "dark"
                  ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>Light</>
                  : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>Dark</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* ── MAIN: FULL-SCREEN COPILOT ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <span style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:700,letterSpacing:"-.03em",color:"var(--text)"}}>Valora</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border-m)", background: "var(--bg3)", cursor: "pointer", display: "flex", alignItems: "center" }}>
              {theme === "dark"
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-m)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-m)" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
            </button>
            <button onClick={signOut} title="Sign out" style={{padding:"6px 8px",border:"1px solid var(--border-m)",borderRadius:6,background:"var(--bg3)",cursor:"pointer",display:"flex",alignItems:"center"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-m)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
        <CopilotPanel
          context="dashboard"
          userName={userFirstName}
          onNewDeal={onCopilotNewDeal}
          onCreate={onCopilotCreate}
          onValuation={() => router.push("/valuation")}
        />
      </div>
      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <button className="bottom-nav-item active" onClick={() => router.push("/dashboard")}>
          <svg viewBox="0 0 24 24"><path d="M12 2L2 8.5v7L12 22l10-6.5v-7L12 2z"/><path d="M12 2v20"/></svg>
          Copilot
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/portfolio")}>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Portfolio
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/pipeline")}>
          <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          Pipeline
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/tasks")}>
          <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          Tasks
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/learn")}>
          <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
          Learn
        </button>
      </nav>
    </div>
  );
}
