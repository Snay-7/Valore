"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
const CALENDLY = "https://calendly.com/hello-valoraplatform/30min";
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  /* Dark mode — Slate & Sage */
  --gold:#52C498;--gold-l:#72D4AE;--gold-bg:rgba(82,196,152,0.08);--gold-border:rgba(82,196,152,0.22);
  --bg:#0D1017;--bg1:#252D3F;--bg2:#141920;--bg3:#1A2030;--bg4:#202840;--bg5:#2A3350;
  --text:#F0EEE8;--text-m:#8B93A5;--text-d:#4D5570;
  --border:rgba(255,255,255,0.07);--border-m:rgba(255,255,255,0.13);
  --green:#52C498;--red:#D45252;--amber:#E0A030;--blue:#4A80C4;
  --font-display:'Inter',system-ui,sans-serif;
  --font-body:'Inter',system-ui,sans-serif;
  --font-mono:'DM Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
body.light{
  /* Light mode (default) — Slate & Sage */
  --gold:#2A8A64;--gold-l:#1F7050;--gold-bg:rgba(82,196,152,0.09);--gold-border:rgba(82,196,152,0.25);
  --bg:#F8F9FA;--bg1:#252D3F;--bg2:#FFFFFF;--bg3:#F8F9FA;--bg4:#E8EAED;--bg5:#DDE0E6;
  --text:#1E2433;--text-m:#5A6478;--text-d:#9AA3AF;
  --border:#E8EAED;--border-m:#D0D4DC;
  --green:#2A8A64;--red:#C04040;--amber:#B07820;--blue:#2A5FAA;
}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:18px;cursor:pointer;transition:border-color .15s,box-shadow .15s;animation:fadeIn .3s ease both}
.card:hover{border-color:var(--gold-border);box-shadow:0 2px 12px rgba(82,196,152,0.06)}
.card.trashed{opacity:.5;border-style:dashed}
.metric-pill{background:var(--bg3);border-radius:5px;padding:6px 10px}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:200;animation:fadeIn .15s ease}
.modal{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:24px;width:460px;max-width:calc(100vw - 32px)}
.inp{width:100%;padding:9px 11px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font-mono);font-size:13px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold)}
.inp::placeholder{color:var(--text-d);font-family:var(--font-body)}
.inp-label{font-size:10px;color:var(--text-d);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;display:block}
.inp-group{margin-bottom:12px}
.btn-primary{background:var(--gold);color:#0D1017;border:none;border-radius:7px;padding:9px 18px;font-family:var(--font-body);font-size:12px;font-weight:600;cursor:pointer;transition:background .2s}
.btn-primary:hover{background:var(--gold-l)}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:8px 16px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-danger{background:transparent;color:var(--red);border:1px solid rgba(244,100,95,.3);border-radius:6px;padding:5px 10px;font-family:var(--font-body);font-size:11px;cursor:pointer;transition:all .2s}
.btn-danger:hover{background:rgba(244,100,95,.1);border-color:var(--red)}
.btn-demo{display:flex;align-items:center;gap:8px;background:transparent;color:var(--gold);border:1px solid var(--gold-border);border-radius:7px;padding:8px 14px;font-family:var(--font-body);font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;width:100%;margin-bottom:2px}
.btn-demo:hover{background:var(--gold-bg);border-color:var(--gold)}
select.inp{cursor:pointer}
.menu-btn{background:none;border:none;color:var(--text-d);cursor:pointer;padding:4px 8px;border-radius:4px;font-size:16px;line-height:1;transition:all .2s;position:relative;z-index:2}
.menu-btn:hover{background:var(--bg4);color:var(--text)}
.card-menu{position:absolute;top:14px;right:14px;z-index:10}
.dropdown{position:absolute;top:100%;right:0;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:4px;min-width:160px;box-shadow:0 4px 12px rgba(0,0,0,.12);animation:fadeIn .1s ease}
.dropdown-item{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;font-size:12px;cursor:pointer;transition:background .15s;width:100%;border:none;background:none;color:var(--text-m);font-family:var(--font-body);text-align:left}
.dropdown-item:hover{background:var(--bg4);color:var(--text)}
.dropdown-item.danger{color:var(--red)}
.dropdown-item.danger:hover{background:rgba(244,100,95,.1);color:var(--red)}
.stats-strip{display:flex;background:var(--bg2);border:1px solid var(--border);border-radius:6px;overflow:hidden;margin-bottom:20px}
.stat-cell{flex:1;padding:12px 16px;border-right:1px solid var(--border);display:flex;flex-direction:column;gap:3px}
.stat-cell:last-child{border-right:none}
.cards-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.nav-item{width:100%;display:flex;align-items:center;padding:8px 12px;border-radius:7px;font-size:13px;color:#8B93A5;background:transparent;border:1px solid transparent;cursor:pointer;font-family:var(--font-body);transition:all .15s;text-align:left;margin-bottom:2px}
.nav-item:hover{color:#F0EEE8;background:rgba(255,255,255,0.07)}
.nav-item.active{color:#52C498;background:rgba(82,196,152,.12);border-color:rgba(82,196,152,.25);font-weight:600}
.nav-item.danger-item{color:var(--text-m)}
.nav-item.danger-item:hover{color:var(--text);background:var(--bg3)}
.nav-item.active-danger{color:#D45252;background:rgba(212,82,82,.08);border-color:rgba(212,82,82,.2);font-weight:600}
.sidebar{width:210px;background:#252D3F;border-right:none;display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg1);border-top:1px solid var(--border);z-index:100;padding:6px 0 env(safe-area-inset-bottom,12px)}
.bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 4px;background:none;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);font-size:9px;letter-spacing:.06em;text-transform:uppercase;transition:color .2s;position:relative}
.bottom-nav-item.active{color:var(--gold)}
.bottom-nav-item svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.mobile-topbar{display:none;align-items:center;justify-content:space-between;padding:12px 16px;background:#252D3F;border-bottom:1px solid rgba(255,255,255,0.07);position:sticky;top:0;z-index:50}
.demo-banner{background:var(--gold-bg);border:1px solid var(--gold-border);border-radius:10px;padding:12px 16px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.filter-tabs{display:flex;gap:0;margin-bottom:20px;border-bottom:1px solid var(--border);overflow-x:auto}
.filter-tab{padding:8px 14px;font-size:12px;background:none;border:none;border-bottom:2px solid transparent;color:var(--text-d);cursor:pointer;font-family:var(--font-body);transition:all .2s;white-space:nowrap;flex-shrink:0;letter-spacing:.03em}
.filter-tab.active{color:var(--gold);border-bottom-color:var(--gold)}
@media(max-width:900px){.cards-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){
  .sidebar{display:none}
  .bottom-nav{display:flex}
  .mobile-topbar{display:flex}
  .main-content{margin-left:0!important;max-width:100vw!important;padding:16px 14px 90px!important}
  .cards-grid{grid-template-columns:1fr}
  .stats-strip{flex-wrap:wrap}
  .stat-cell{min-width:50%;border-bottom:1px solid var(--border)}
  .page-header{flex-direction:column;align-items:flex-start!important;gap:10px!important}
  .page-header-actions{flex-direction:row!important;width:100%}
}
`;
const fmt = (n: number, prefix = "£") => {
  if (!n || !isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${prefix}${(n / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${prefix}${(n / 1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${prefix}${(n / 1e3).toFixed(0)}k`;
  return `${prefix}${n.toFixed(0)}`;
};
const fmtPct = (n: number) => (n === null || n === undefined || !isFinite(n) || isNaN(n) ? "—" : `${(n * 100).toFixed(1)}%`);
const ASSET_TYPES = ["BTR", "BTS", "Hotel", "Flip", "MixedUse", "Commercial"];
const ASSET_LABELS: Record<string,string> = {BTR:"BTR",BTS:"BTS",Hotel:"Hotel",Flip:"Flip",MixedUse:"Mixed Use",Commercial:"Commercial"};
const CURRENCIES = ["GBP", "USD", "EUR", "AED", "SGD", "AUD"];
const CURRENCY_SYMBOLS: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$" };
const TRASH_DAYS = 3;
































export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<"dark"|"light">(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("valora-theme") || "light") as "dark"|"light";
    return "light";
  });
  useEffect(() => {
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem("valora-theme", theme);
  }, [theme]);
  const [projects, setProjects] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [experienceLevel, setExperienceLevel] = useState<string|null>(null);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoDismissed, setVideoDismissed] = useState(false);
  const [checklistDone, setChecklistDone] = useState<Record<string,boolean>>({});
  const [checklistDismissed, setChecklistDismissed] = useState(false);
  const [trashedProjects, setTrashedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", location: "", asset_type: "BTR", currency: "GBP" });
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"portfolio"|"trash">("portfolio");
  const [openMenuId, setOpenMenuId] = useState<string|null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [totalProjectCount, setTotalProjectCount] = useState(0);
  const [hasFirm, setHasFirm] = useState(false);
  // URL Import state
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlImport, setUrlImport] = useState("");
  const [urlImportType, setUrlImportType] = useState<"Flip"|"Hotel">("Flip");
  const [urlImportCurrency, setUrlImportCurrency] = useState("GBP");
  const [urlImporting, setUrlImporting] = useState(false);
  const [urlImportError, setUrlImportError] = useState<string|null>(null);
  const tier = subscription?.tier || "free";
  const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
  const isTrialing = trialEndsAt && trialEndsAt > new Date();
  const trialDaysLeft = isTrialing ? Math.ceil((trialEndsAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const isEnterprise = tier === "enterprise" || isTrialing;
  const isPro = tier === "professional" || isEnterprise;




  // Onboarding — show once if user hasn't set experience level
  useEffect(() => {
    const done = localStorage.getItem("valora_onboarding_done");
    const dismissed = localStorage.getItem("valora_video_dismissed");
    if (dismissed) setVideoDismissed(true);
    const clRaw = localStorage.getItem("valora_checklist");
    if (clRaw) { try { setChecklistDone(JSON.parse(clRaw)); } catch(e){} }
    const clDismissed = localStorage.getItem("valora_checklist_dismissed");
    if (clDismissed) setChecklistDismissed(true);
    if (user?.id) {
      // Check Supabase first — if experience_level exists, onboarding is done
      supabase
        .from("profiles")
        .select("experience_level")
        .eq("id", user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.experience_level) {
            setExperienceLevel(profile.experience_level);
            setOnboardingDone(true);
            localStorage.setItem("valora_onboarding_done", "true");
          } else if (!done) {
            setShowOnboarding(true);
          } else {
            setOnboardingDone(true);
          }
        });
    } else if (done) {
      setOnboardingDone(true);
    }
  }, [user]);




  const tickChecklist = (key: string) => {
    setChecklistDone(prev => {
      const next = { ...prev, [key]: true };
      localStorage.setItem("valora_checklist", JSON.stringify(next));
      // Auto-dismiss if all 4 done
      if (Object.keys(next).length >= 4) {
        setTimeout(() => {
          setChecklistDismissed(true);
          localStorage.setItem("valora_checklist_dismissed", "true");
        }, 1200);
      }
      return next;
    });
  };

  const completeOnboarding = async (level: string) => {
    setExperienceLevel(level);
    localStorage.setItem("valora_onboarding_done", "true");
    localStorage.setItem("valora_experience_level", level);
    // Save to Supabase profiles table
    if (user?.id) {
      await supabase
        .from("profiles")
        .upsert({ id: user.id, experience_level: level, updated_at: new Date().toISOString() })
        .eq("id", user.id);
    }
    setOnboardingDone(true);
    setShowOnboarding(false);
  };




  const dismissVideo = () => {
    setVideoDismissed(true);
    localStorage.setItem("valora_video_dismissed", "true");
  };
  const isStarter = tier === "starter";
  const activeProjectLimit = isPro ? Infinity : isStarter ? 10 : 3;
































  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);
      await loadProjects(session.user.id);
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", session.user.id).maybeSingle();
      setSubscription(sub);
      const { data: memberRow } = await supabase.from("firm_members").select("id").eq("user_id", session.user.id).maybeSingle();
      setHasFirm(!!memberRow);
    };
    init();
  }, [router]);
































  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".card-menu")) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
































  const loadProjects = async (userId: string) => {
    setLoading(true);
    const { data: all } = await supabase
      .from("projects")
      .select(`*, appraisals(id, gdv, total_cost, profit, profit_on_cost, irr_unlevered, status, created_at)`)
      .eq("created_by", userId)
      .order("created_at", { ascending: false });
    const now = new Date();
    const active: any[] = [], trashed: any[] = [];
    let totalCount = 0;
    (all || []).forEach(p => {
      if (!p.deleted_at) { active.push(p); totalCount++; }
      else {
        const daysInTrash = (now.getTime() - new Date(p.deleted_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysInTrash < TRASH_DAYS) { trashed.push({ ...p, _daysLeft: Math.ceil(TRASH_DAYS - daysInTrash) }); totalCount++; }
        else { supabase.from("appraisals").delete().eq("project_id", p.id).then(() => supabase.from("projects").delete().eq("id", p.id)); }
      }
    });
    setProjects(active); setTrashedProjects(trashed); setTotalProjectCount(totalCount); setLoading(false);
  };
































  const signOut = async () => { await supabase.auth.signOut(); router.push("/"); };
































  const createProject = async () => {
    if (!newProject.name.trim() || !user) return;
    setCreating(true);
    const { data: proj, error } = await supabase.from("projects").insert({
      name: newProject.name.trim(), location: newProject.location.trim(),
      asset_type: newProject.asset_type, currency: newProject.currency,
      benchmark_rate: "SONIA", created_by: user.id, firm_id: null,
    }).select().single();
    if (proj && !error) { setShowNewModal(false); setNewProject({ name: "", location: "", asset_type: "BTR", currency: "GBP" }); router.push(`/appraisal?project=${proj.id}`); }
    setCreating(false);
    tickChecklist("created_appraisal");
  };
































  const createFromUrl = async () => {
    if (!urlImport.trim() || !user) return;
    setUrlImporting(true); setUrlImportError(null);
    try {
      const res = await fetch("/api/urlimport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlImport.trim(), assetType: urlImportType, currency: urlImportCurrency }),
      });
      const d = await res.json();
      if (d.error) { setUrlImportError(d.error); setUrlImporting(false); return; }
      // Create the project with inferred data
      const projectName = d.name || `${urlImportType} — ${d.location || "Imported"}`;
      const { data: proj, error } = await supabase.from("projects").insert({
        name: projectName,
        location: d.location || "",
        asset_type: urlImportType,
        currency: urlImportCurrency,
        benchmark_rate: "SONIA",
        created_by: user.id,
        firm_id: null,
      }).select().single();
      if (!proj || error) { setUrlImportError("Failed to create project"); setUrlImporting(false); return; }
      // Build appraisal data payload from inferred fields
      const appraisalData: Record<string, any> = {
        name: projectName,
        location: d.location || "",
        currency: urlImportCurrency,
      };
      if (urlImportType === "Flip") {
        if (d.purchasePrice) appraisalData.purchasePrice = d.purchasePrice;
        if (d.propertySqft) appraisalData.propertySqft = d.propertySqft;
        if (d.address) appraisalData.address = d.address;
      } else if (urlImportType === "Hotel") {
        if (d.purchasePrice) appraisalData.purchasePrice = d.purchasePrice;
        if (d.rooms) appraisalData.rooms = d.rooms;
        if (d.starRating) appraisalData.starRating = d.starRating;
        if (d.gfa) appraisalData.gfa = d.gfa;
        if (d.brand) appraisalData.brand = d.brand;
        if (d.address) appraisalData.address = d.address;
      }
      // Save initial appraisal record with pre-filled data
      const { data: appr } = await supabase.from("appraisals").insert({
        project_id: proj.id,
        data: appraisalData,
        status: "draft",
      }).select().single();
      setShowUrlModal(false);
      setUrlImport(""); setUrlImportError(null);
      if (appr) router.push(`/appraisal?project=${proj.id}&appraisal=${appr.id}`);
      else router.push(`/appraisal?project=${proj.id}`);
    } catch (e: any) {
      setUrlImportError(e.message || "Failed to import");
    }
    setUrlImporting(false);
  };
































  const openProject = (project: any) => {
    const latest = project.appraisals?.[0];
    if (latest) router.push(`/appraisal?project=${project.id}&appraisal=${latest.id}`);
    else router.push(`/appraisal?project=${project.id}`);
  };
































  const moveToTrash = async (projectId: string) => {
    setOpenMenuId(null);
    const now = new Date().toISOString();
    await supabase.from("projects").update({ deleted_at: now }).eq("id", projectId);
    const project = projects.find(p => p.id === projectId);
    if (project) { setProjects(prev => prev.filter(p => p.id !== projectId)); setTrashedProjects(prev => [...prev, { ...project, deleted_at: now, _daysLeft: TRASH_DAYS }]); }
  };
































  const restoreProject = async (projectId: string) => {
    await supabase.from("projects").update({ deleted_at: null }).eq("id", projectId);
    const project = trashedProjects.find(p => p.id === projectId);
    if (project) { const { _daysLeft, deleted_at, ...restored } = project; setTrashedProjects(prev => prev.filter(p => p.id !== projectId)); setProjects(prev => [{ ...restored, deleted_at: null }, ...prev]); }
  };
































  const permanentlyDelete = async (projectId: string) => {
    await supabase.from("appraisals").delete().eq("project_id", projectId);
    await supabase.from("projects").delete().eq("id", projectId);
    setTrashedProjects(prev => prev.filter(p => p.id !== projectId));
    setConfirmDelete(null);
  };
































  const emptyTrash = async () => {
    for (const p of trashedProjects) { await supabase.from("appraisals").delete().eq("project_id", p.id); await supabase.from("projects").delete().eq("id", p.id); }
    setTrashedProjects([]); setConfirmDelete(null);
  };
































  const filteredProjects = filter === "all" ? projects : projects.filter(p => p.asset_type === filter);
  const totalGDV = projects.reduce((s, p) => s + (p.appraisals?.[0]?.gdv || 0), 0);
  const totalProfit = projects.reduce((s, p) => s + (p.appraisals?.[0]?.profit || 0), 0);
  const avgPoC = (() => { const v = projects.filter(p => p.appraisals?.[0]?.profit_on_cost != null); return v.length ? v.reduce((s, p) => s + (p.appraisals[0].profit_on_cost || 0), 0) / v.length : 0; })();
  const avgIRR = (() => { const v = projects.filter(p => p.appraisals?.[0]?.irr_unlevered); return v.length ? v.reduce((s, p) => s + (p.appraisals[0].irr_unlevered || 0), 0) / v.length : 0; })();
































  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0D1017", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <span style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:18,fontWeight:600,letterSpacing:"-.02em",color:"#ffffff"}}>Valora</span>
      <div style={{ width: 26, height: 26, border: "2px solid rgba(82,196,152,.15)", borderTopColor: "#52C498", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <div style={{ fontSize: 11, color: "#3d4249", letterSpacing: ".06em" }}>Loading…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
































  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", display: "flex" }}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){var t=localStorage.getItem('valora-theme')||'light';if(t==='light')document.body.classList.add('light');})()`}}/>
































      {/* ── SIDEBAR ── */}
      <div className="sidebar">
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
          <span style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:16,fontWeight:600,letterSpacing:"-.02em",color:"#ffffff"}}>Valora</span>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: ".18em", textTransform: "uppercase", marginTop: 2, fontFamily:"var(--font-body)" }}>Development Appraisal</div>
        </div>
































        <div style={{ padding: "14px 10px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 10px", marginBottom: 6 }}>My Work</div>
          <button className={`nav-item ${view === "portfolio" ? "active" : ""}`} onClick={() => setView("portfolio")}>Portfolio</button>
          <button className="nav-item" onClick={() => router.push("/pipeline")}>Pipeline</button>
          <button className="nav-item" onClick={() => router.push("/tasks")}>Tasks</button>
          <button className="nav-item" onClick={() => router.push("/notes")}>Notes</button>
          {hasFirm && (<>
            <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
            <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 10px", marginBottom: 6 }}>Team</div>
            <button className="nav-item" onClick={() => router.push("/workspace")} style={{ color: "var(--gold)" }}>◈ Workspace</button>
            <button className="nav-item" onClick={() => router.push("/team")}>Team</button>
          </>)}
          {!hasFirm && <button className="nav-item" onClick={() => router.push("/team")}>Team</button>}
          <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
          <button className={`nav-item ${view === "trash" ? "active-danger" : "danger-item"}`} onClick={() => setView("trash")} style={{ justifyContent: "space-between" }}>
            <span>Trash</span>
            {trashedProjects.length > 0 && <span style={{ background: "var(--red)", color: "#fff", borderRadius: 10, padding: "0 6px", fontSize: 10, fontWeight: 700 }}>{trashedProjects.length}</span>}
          </button>
          {!isPro && (<>
            <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
            <button className="nav-item" onClick={() => router.push("/pricing")} style={{ color: "var(--gold)", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", fontWeight: 600, fontSize: 12 }}>✦ Upgrade Plan</button>
          </>)}
        </div>
































        <div style={{ padding: "10px 10px 0", borderTop: "1px solid var(--border)" }}>
          <button className="btn-demo" onClick={() => window.open(CALENDLY, "_blank")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Book a Demo
          </button>
          {/* ── GETTING STARTED CHECKLIST ── */}
          {!checklistDismissed && onboardingDone && !showOnboarding && (
            <div style={{ margin:"0 0 12px", padding:"12px 10px", background:"rgba(82,196,152,.06)", border:"1px solid rgba(82,196,152,.14)", borderRadius:8 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontSize:9, fontWeight:700, color:"#52C498", textTransform:"uppercase", letterSpacing:".1em" }}>Getting started</div>
                <button onClick={() => { setChecklistDismissed(true); localStorage.setItem("valora_checklist_dismissed","true"); }} style={{ background:"none", border:"none", color:"rgba(255,255,255,.2)", cursor:"pointer", fontSize:14, lineHeight:1, padding:0 }}>×</button>
              </div>
              {[
                { key:"created_appraisal", label:"Create first appraisal" },
                { key:"saved_deal", label:"Save a deal" },
                { key:"generated_pdf", label:"Generate a PDF" },
                { key:"invited_team", label:"Invite a teammate" },
              ].map(step => {
                const done = !!checklistDone[step.key];
                return (
                  <div key={step.key} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0" }}>
                    <div style={{ width:14, height:14, borderRadius:"50%", border:`1.5px solid ${done?"#52C498":"rgba(255,255,255,.2)"}`, background:done?"#52C498":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .3s" }}>
                      {done && <svg width="8" height="8" viewBox="0 0 10 10"><polyline points="2,5 4,7 8,3" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    </div>
                    <span style={{ fontSize:10, color:done?"rgba(240,238,232,.5)":"rgba(240,238,232,.75)", textDecoration:done?"line-through":"none", transition:"all .3s" }}>{step.label}</span>
                  </div>
                );
              })}
              {/* Progress bar */}
              <div style={{ height:2, background:"rgba(255,255,255,.08)", borderRadius:2, marginTop:10, overflow:"hidden" }}>
                <div style={{ height:"100%", background:"#52C498", borderRadius:2, width:`${Object.values(checklistDone).filter(Boolean).length * 25}%`, transition:"width .4s ease" }}/>
              </div>
            </div>
          )}

          <div style={{ padding: "10px 0 14px" }}>
            <div style={{ fontSize: 11, color: "var(--text-d)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <button className="nav-item" onClick={signOut} style={{ fontSize: 12 }}>Sign Out</button>
              <button
                onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
                style={{ padding: "4px 8px", borderRadius: 5, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "var(--text-d)", fontSize: 10, fontFamily: "var(--font-body)" }}
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
































      {/* ── MAIN ── */}
      <div className="main-content" style={{ marginLeft: 210, flex: 1, minWidth: 0, padding: "32px 32px", maxWidth: "calc(100vw - 210px)" }}>
































        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <span style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:15,fontWeight:600,letterSpacing:"-.02em",color:"#ffffff"}}>Valora</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn-primary" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => { if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; } setShowNewModal(true); }}>+ New</button>
            <button
              onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg3)", cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              {theme === "dark"
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-m)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-m)" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            <button className="btn-ghost" style={{ padding: "6px 10px", fontSize: 11 }} onClick={signOut}>Sign Out</button>
          </div>
        </div>
































        {/* ── TRASH VIEW ── */}
        {view === "trash" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 300, marginBottom: 4 }}>Trash</h1>
                <p style={{ fontSize: 12, color: "var(--text-d)" }}>Projects deleted within the last {TRASH_DAYS} days.</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-ghost" onClick={() => setView("portfolio")} style={{ fontSize: 12 }}>← Back</button>
                {trashedProjects.length > 0 && <button className="btn-danger" onClick={() => setConfirmDelete({ type: "all" })} style={{ padding: "7px 14px", fontSize: 12 }}>Empty Trash</button>}
              </div>
            </div>
            {trashedProjects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🗑</div>
                <p style={{ fontSize: 15, color: "var(--text-d)", fontFamily: "var(--font-display)" }}>Trash is empty</p>
              </div>
            ) : (
              <div className="cards-grid">
                {trashedProjects.map((p, i) => {
                  const latest = p.appraisals?.[0]; const sym = CURRENCY_SYMBOLS[p.currency] || "£";
                  return (
                    <div key={p.id} className="card trashed" style={{ animationDelay: `${i * 0.04}s`, cursor: "default" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 500 }}>{ASSET_LABELS[p.asset_type] || p.asset_type}</span>
                        <span style={{ fontSize: 10, color: "var(--red)", fontFamily: "var(--font-mono)" }}>Deletes in {p._daysLeft}d</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 2, fontFamily: "var(--font-display)" }}>{p.name || "Untitled"}</h3>
                      <p style={{ fontSize: 12, color: "var(--text-m)", marginBottom: 14 }}>{p.location || "No location"}</p>
                      {latest && (
                        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                          <div className="metric-pill" style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2 }}>GDV</div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gold)" }}>{fmt(latest.gdv, sym)}</div>
                          </div>
                          <div className="metric-pill" style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2 }}>PoC</div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-m)" }}>{fmtPct(latest.profit_on_cost)}</div>
                          </div>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn-ghost" onClick={() => restoreProject(p.id)} style={{ flex: 1, fontSize: 11, padding: "5px" }}>Restore</button>
                        <button className="btn-danger" onClick={() => setConfirmDelete({ type: "single", project: p })} style={{ flex: 1, padding: "5px" }}>Delete Forever</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
































        {/* ── PORTFOLIO VIEW ── */}
        {view === "portfolio" && (
          <>
            {/* Page header — compact */}
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12 }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 300, letterSpacing: ".02em", lineHeight: 1 }}>Portfolio</h1>
                {projects.length > 0 && (
                  <p style={{ fontSize: 12, color: "var(--text-d)", marginTop: 3 }}>
                    {projects.length} project{projects.length !== 1 ? "s" : ""} · {fmt(totalGDV)} GDV · avg {fmtPct(avgPoC)} PoC
                  </p>
                )}
              </div>
              <div className="page-header-actions" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-ghost" style={{ padding: "9px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, borderColor: "var(--gold-border)", color: "var(--gold)" }}
                    onClick={() => setShowUrlModal(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                    Import URL
                  </button>
                  <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 12 }}
                    onClick={() => { if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; } setShowNewModal(true); }}>
                    + New Appraisal
                  </button>
                </div>
                {!isPro && (
                  <div style={{ fontSize: 11, color: "var(--text-d)" }}>
                    {totalProjectCount}/{activeProjectLimit === Infinity ? "∞" : activeProjectLimit} projects
                    {totalProjectCount >= activeProjectLimit && <span style={{ color: "var(--amber)", marginLeft: 4, cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/pricing")}>Upgrade</span>}
                  </div>
                )}
              </div>
            </div>
































            {/* ── WELCOME MODAL ── */}
            {showOnboarding && (
              <div style={{ position:"fixed", inset:0, background:"rgba(30,36,51,.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, backdropFilter:"blur(4px)" }}>
                <div style={{ background:"var(--bg2)", border:"1px solid var(--border-m)", borderRadius:16, padding:"32px 32px 28px", width:460, maxWidth:"calc(100vw - 32px)", position:"relative", animation:"fadeIn .25s ease" }}>
                  {onboardingStep === 0 && (
                    <>
                      {/* Icon */}
                      <div style={{ width:44, height:44, borderRadius:10, background:"var(--gold-bg)", border:"1px solid var(--gold-border)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      </div>
                      <div style={{ fontSize:11, fontWeight:600, color:"var(--gold)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:8 }}>Welcome to Valora</div>
                      <div style={{ fontSize:22, fontWeight:700, color:"var(--text)", letterSpacing:"-.02em", lineHeight:1.2, marginBottom:8 }}>Your workspace is ready.</div>
                      <div style={{ fontSize:14, color:"var(--text-m)", lineHeight:1.65, marginBottom:24 }}>
                        Model your first deal in under 5 minutes. Tell us how you work so we can set the right defaults.
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                        {[
                          { key:"beginner", label:"Just exploring", sub:"New to property appraisal — I want to learn the basics", icon:"◎" },
                          { key:"intermediate", label:"Experienced investor", sub:"I've run deals before — I need a faster, cleaner model", icon:"◈" },
                          { key:"professional", label:"Professional underwriter", sub:"Development finance, fund management or advisory", icon:"◉" },
                        ].map(opt => (
                          <button key={opt.key} onClick={() => { setOnboardingStep(1); completeOnboarding(opt.key); }}
                            style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:10, border:"1px solid var(--border)", background:"var(--bg3)", cursor:"pointer", textAlign:"left", transition:"all .15s", width:"100%" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="var(--gold)"; (e.currentTarget as HTMLElement).style.background="var(--gold-bg)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="var(--border)"; (e.currentTarget as HTMLElement).style.background="var(--bg3)"; }}>
                            <span style={{ fontSize:18, color:"var(--gold)", flexShrink:0 }}>{opt.icon}</span>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:2 }}>{opt.label}</div>
                              <div style={{ fontSize:11, color:"var(--text-d)" }}>{opt.sub}</div>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-d)" strokeWidth="2" strokeLinecap="round" style={{ marginLeft:"auto", flexShrink:0 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </button>
                        ))}
                      </div>
                      <div style={{ fontSize:11, color:"var(--text-d)", textAlign:"center" }}>You can change this anytime · No credit card required</div>
                    </>
                  )}
                  {onboardingStep === 1 && (
                    <>
                      <div style={{ width:44, height:44, borderRadius:10, background:"var(--gold-bg)", border:"1px solid var(--gold-border)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div style={{ fontSize:22, fontWeight:700, color:"var(--text)", letterSpacing:"-.02em", marginBottom:8 }}>You're all set.</div>
                      <div style={{ fontSize:14, color:"var(--text-m)", lineHeight:1.65, marginBottom:24 }}>
                        Your first appraisal takes about 3 minutes. Pick an asset type and the model does the rest.
                      </div>
                      <button className="btn-primary" style={{ width:"100%", padding:"13px", fontSize:13, justifyContent:"center" }} onClick={() => { setShowOnboarding(false); setShowNewModal(true); }}>
                        Model my first deal →
                      </button>
                      <button onClick={() => setShowOnboarding(false)} style={{ width:"100%", background:"none", border:"none", fontSize:12, color:"var(--text-d)", cursor:"pointer", padding:"10px", marginTop:4 }}>
                        Explore the dashboard first
                      </button>
                      <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:16, paddingTop:16, borderTop:"1px solid var(--border)" }}>
                        {["3 free appraisals","All 7 models","No credit card"].map(t => (
                          <div key={t} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--text-d)" }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            {t}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}




            {/* ── VIDEO MODAL ── */}
            {showVideoModal && (
              <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300 }}
                onClick={e => { if (e.target === e.currentTarget) setShowVideoModal(false); }}>
                <div style={{ position:"relative", width:"90vw", maxWidth:900, borderRadius:10, overflow:"hidden", border:"1px solid rgba(82,196,152,.12)", boxShadow:"0 40px 80px rgba(0,0,0,.8)" }}>
                  <button onClick={() => setShowVideoModal(false)} style={{ position:"absolute", top:12, right:12, zIndex:10, background:"rgba(6,7,10,.8)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"50%", width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--text-m)", fontSize:16, transition:"all .2s" }}>×</button>
                  {/* Replace with YouTube embed once URL is available */}
                  <div style={{ background:"var(--bg2)", aspectRatio:"16/9", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ textAlign:"center", color:"var(--text-d)" }}>
                      <div style={{ fontSize:32, marginBottom:12 }}>▶</div>
                      <div style={{ fontSize:13 }}>Walkthrough video coming soon</div>
                    </div>
                  </div>
                </div>
              </div>
            )}




            {/* ── EMPTY STATE — shown when 0 appraisals ── */}
            {projects.length === 0 && !videoDismissed && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 20px", textAlign:"center", animation:"fadeIn .4s ease" }}>
                {/* Demo deal preview */}
                <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:12, padding:"16px 20px", marginBottom:20, width:"100%", maxWidth:480, textAlign:"left", opacity:.6, pointerEvents:"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                    <span style={{ background:"var(--gold-bg)", color:"var(--gold)", fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:4, border:"1px solid var(--gold-border)" }}>FLIP</span>
                    <span style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>Jay Mews SW7</span>
                    <span style={{ fontSize:11, color:"var(--text-d)" }}>· South Kensington</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                    {[["GDV","£6.61m","var(--green)"],["Profit","£892k","var(--green)"],["PoC","18.4%","var(--green)"]].map(([l,v,c])=>(
                      <div key={l} style={{ background:"var(--bg3)", borderRadius:6, padding:"8px 10px" }}>
                        <div style={{ fontSize:9, color:"var(--text-d)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:3 }}>{l}</div>
                        <div style={{ fontSize:14, fontWeight:700, color:c as string }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* CTA */}
                <div style={{ width:52, height:52, borderRadius:12, background:"var(--gold-bg)", border:"1px solid var(--gold-border)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                </div>
                <div style={{ fontSize:20, fontWeight:700, color:"var(--text)", letterSpacing:"-.02em", marginBottom:8 }}>Model your first deal</div>
                <div style={{ fontSize:14, color:"var(--text-m)", lineHeight:1.65, marginBottom:24, maxWidth:360 }}>
                  BTR, BTS, Hotel, Flip, Mixed Use, Commercial or Industrial. Pick your deal type and start in 2 minutes.
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
                  <button className="btn-primary" style={{ padding:"12px 24px", fontSize:13 }} onClick={() => { if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; } setShowNewModal(true); }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Create First Appraisal
                  </button>
                  <button className="btn-ghost" style={{ padding:"11px 18px", fontSize:12 }} onClick={dismissVideo}>
                    Skip for now
                  </button>
                </div>
              </div>
            )}




            {/* Trial banner */}
            {isTrialing && (
              <div style={{ background:"rgba(82,196,152,.08)", border:"1px solid var(--gold-border)", borderRadius:10, padding:"12px 16px", marginBottom:18, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--gold)", marginBottom:1 }}>✦ Enterprise Trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining</div>
                  <div style={{ fontSize:11, color:"var(--text-m)" }}>Full access to all features. Upgrade before your trial ends.</div>
                </div>
                <button className="btn-primary" style={{ padding:"6px 14px", fontSize:11, flexShrink:0 }} onClick={() => router.push("/pricing")}>Upgrade Now</button>
              </div>
            )}
































            {/* Demo banner */}
            {!isPro && projects.length > 0 && (
              <div className="demo-banner">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", marginBottom: 1 }}>Want a guided walkthrough?</div>
                  <div style={{ fontSize: 11, color: "var(--text-m)" }}>Book a free 30-min demo — we'll walk through your deals live.</div>
                </div>
                <button className="btn-primary" style={{ padding: "7px 16px", fontSize: 12, flexShrink: 0 }} onClick={() => window.open(CALENDLY, "_blank")}>Book Demo</button>
              </div>
            )}
































            {/* Upgrade limit warning */}
            {!isPro && totalProjectCount >= activeProjectLimit && (
              <div style={{ background: "rgba(240,164,41,.06)", border: "1px solid rgba(240,164,41,.2)", borderRadius: 8, padding: "10px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, color: "var(--amber)" }}>You've reached your {activeProjectLimit}-project limit.</div>
                <button className="btn-primary" onClick={() => router.push("/pricing")} style={{ padding: "6px 14px", fontSize: 12 }}>Upgrade →</button>
              </div>
            )}
































            {/* Stats strip — compact single row */}
            {projects.length > 0 && (
              <div className="stats-strip">
                {[
                  { label: "Projects", value: String(projects.length), color: "var(--text)" },
                  { label: "Total GDV", value: fmt(totalGDV), color: "var(--gold)" },
                  { label: "Total Profit", value: fmt(totalProfit), color: totalProfit > 0 ? "var(--green)" : "var(--red)" },
                  { label: "Avg PoC", value: fmtPct(avgPoC), color: avgPoC > 0.2 ? "var(--green)" : avgPoC > 0.1 ? "var(--amber)" : "var(--text-m)" },
                  { label: "Avg IRR", value: fmtPct(avgIRR), color: avgIRR > 0.15 ? "var(--green)" : avgIRR > 0.08 ? "var(--amber)" : "var(--text-m)" },
                ].map(stat => (
                  <div key={stat.label} className="stat-cell">
                    <span style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".09em" }}>{stat.label}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 300, color: stat.color, lineHeight: 1.1 }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            )}

































































            {/* Filter tabs */}
            {projects.length > 0 && (
              <div className="filter-tabs">
                {["all", ...ASSET_TYPES].map(f => {
                  const count = f === "all" ? projects.length : projects.filter(p => p.asset_type === f).length;
                  return (
                    <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                      {f === "all" ? "ALL" : (ASSET_LABELS[f] || f)} ({count})
                    </button>
                  );
                })}
              </div>
            )}
































            {/* Project cards */}
            {filteredProjects.length > 0 && (
              <div className="cards-grid">
                {filteredProjects.map((p, i) => {
                  const latest = p.appraisals?.[0];
                  const sym = CURRENCY_SYMBOLS[p.currency] || "£";
                  const pocColor = latest?.profit_on_cost > 0.2 ? "var(--green)" : latest?.profit_on_cost > 0.1 ? "var(--amber)" : "var(--red)";
                  return (
                    <div key={p.id} className="card" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => openProject(p)}>
                      <div className="card-menu" onClick={e => e.stopPropagation()}>
                        <button className="menu-btn" onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}>···</button>
                        {openMenuId === p.id && (
                          <div className="dropdown">
                            <button className="dropdown-item" onClick={() => openProject(p)}>Open Appraisal</button>
                            <button className="dropdown-item" onClick={() => router.push("/pipeline")}>View in Pipeline</button>
                            <button className="dropdown-item danger" onClick={() => moveToTrash(p.id)}>Move to Trash</button>
                          </div>
                        )}
                      </div>
































                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 600, letterSpacing: ".04em" }}>{ASSET_LABELS[p.asset_type] || p.asset_type}</span>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: "rgba(125,133,144,.1)", color: "#7d8590" }}>{latest?.status || "draft"}</span>
                        <span style={{ fontSize: 10, color: "var(--text-d)", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
                          {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                        </span>
                      </div>
































                      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 3, fontFamily: "var(--font-display)", letterSpacing: ".02em" }}>{p.name || "Untitled"}</h3>
                      <p style={{ fontSize: 12, color: "var(--text-m)", marginBottom: 14 }}>{p.location || "No location set"}</p>
































                      {latest ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                          {[
                            { label: "GDV", value: fmt(latest.gdv, sym), color: "var(--gold)" },
                            { label: "Profit", value: fmt(latest.profit, sym), color: latest.profit > 0 ? "var(--green)" : "var(--red)" },
                            { label: "PoC", value: fmtPct(latest.profit_on_cost), color: pocColor },
                          ].map(m => (
                            <div key={m.label} className="metric-pill">
                              <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2 }}>{m.label}</div>
                              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, color: m.color }}>{m.value}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ background: "var(--bg3)", borderRadius: 7, padding: "9px 12px", fontSize: 12, color: "var(--text-d)" }}>No appraisal saved yet</div>
                      )}
































                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--bg4)" }}>
                        <span style={{ fontSize: 11, color: "var(--text-d)" }}>{p.appraisals?.length || 0} appraisal{p.appraisals?.length !== 1 ? "s" : ""}</span>
                        <span style={{ fontSize: 11, color: "var(--gold)", fontFamily: "var(--font-mono)" }}>{latest?.irr_unlevered ? `IRR ${fmtPct(latest.irr_unlevered)}` : "Open →"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
































        {/* ── URL IMPORT MODAL ── */}
        {showUrlModal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowUrlModal(false); setUrlImportError(null); } }}>
            <div className="modal" style={{ width: 500 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 300 }}>Import from URL</div>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 22 }}>
                Paste a listing URL from Rightmove, Zoopla, Christie & Co, Savills Hotels or similar — Valora will extract the property data and pre-fill your appraisal.
              </p>
































              {/* Asset type selector */}
              <div className="inp-group">
                <label className="inp-label">Asset Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["Flip", "Hotel"] as const).map(t => (
                    <button key={t} onClick={() => setUrlImportType(t)} style={{
                      padding: "10px 14px", borderRadius: 8, border: `1px solid ${urlImportType === t ? "var(--gold)" : "var(--border)"}`,
                      background: urlImportType === t ? "var(--gold-bg)" : "var(--bg3)",
                      color: urlImportType === t ? "var(--gold)" : "var(--text-m)",
                      cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: urlImportType === t ? 600 : 400,
                      transition: "all .2s", textAlign: "left",
                    }}>
                      <div style={{ fontSize: 14, marginBottom: 2, fontWeight: 600 }}>{t}</div>
                      <div style={{ fontSize: 10, color: urlImportType === t ? "var(--gold)" : "var(--text-d)", fontWeight: 400 }}>
                        {t === "Flip" ? "Residential — Rightmove, Zoopla, Zillow" : "Hotel — Christie & Co, Savills, JLL Hotels"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
































              {/* Currency */}
              <div className="inp-group">
                <label className="inp-label">Currency</label>
                <select className="inp" value={urlImportCurrency} onChange={e => setUrlImportCurrency(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
































              {/* URL input */}
              <div className="inp-group">
                <label className="inp-label">Listing URL</label>
                <input
                  className="inp"
                  placeholder={urlImportType === "Flip" ? "https://www.rightmove.co.uk/properties/..." : "https://www.christieandco.com/listing/..."}
                  value={urlImport}
                  onChange={e => { setUrlImport(e.target.value); setUrlImportError(null); }}
                  onKeyDown={e => e.key === "Enter" && createFromUrl()}
                  autoFocus
                  style={{ fontFamily: "var(--font-body)", fontSize: 12 }}
                />
              </div>
































              {/* Info note */}
              <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 12px", marginBottom: 16, fontSize: 11, color: "var(--text-d)", lineHeight: 1.6 }}>
                ◆ Valora uses AI to infer property data from the URL pattern. The more detail in the URL, the better the extraction. You can always edit fields after import.
              </div>
































              {urlImportError && (
                <div style={{ background: "rgba(244,100,95,.1)", border: "1px solid rgba(244,100,95,.3)", borderRadius: 7, padding: "10px 12px", marginBottom: 12, fontSize: 12, color: "var(--red)" }}>
                  {urlImportError}
                </div>
              )}
































              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-ghost" onClick={() => { setShowUrlModal(false); setUrlImportError(null); setUrlImport(""); }} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-primary" onClick={createFromUrl} disabled={!urlImport.trim() || urlImporting} style={{ flex: 2, opacity: !urlImport.trim() ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {urlImporting ? (
                    <><span style={{ width: 12, height: 12, border: "2px solid rgba(6,7,10,.3)", borderTopColor: "#0D1017", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />Importing…</>
                  ) : "Import & Open →"}
                </button>
              </div>
            </div>
          </div>
        )}
































        {/* ── NEW PROJECT MODAL ── */}
        {showNewModal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
            <div className="modal">
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 300, marginBottom: 4 }}>New Appraisal</div>
              <p style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 22 }}>Set up a new project to get started.</p>
              <div className="inp-group">
                <label className="inp-label">Project Name *</label>
                <input className="inp" placeholder="e.g. Chiswick Tower" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} onKeyDown={e => e.key === "Enter" && createProject()} autoFocus />
              </div>
              <div className="inp-group">
                <label className="inp-label">Location</label>
                <input className="inp" placeholder="e.g. Hammersmith, London" value={newProject.location} onChange={e => setNewProject(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="inp-group">
                  <label className="inp-label">Asset Type</label>
                  <select className="inp" value={newProject.asset_type} onChange={e => setNewProject(p => ({ ...p, asset_type: e.target.value }))}>
                    {ASSET_TYPES.map(t => <option key={t} value={t}>{ASSET_LABELS[t] || t}</option>)}
                  </select>
                </div>
                <div className="inp-group">
                  <label className="inp-label">Currency</label>
                  <select className="inp" value={newProject.currency} onChange={e => setNewProject(p => ({ ...p, currency: e.target.value }))}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button className="btn-ghost" onClick={() => setShowNewModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-primary" onClick={createProject} disabled={!newProject.name.trim() || creating} style={{ flex: 2, opacity: !newProject.name.trim() ? 0.5 : 1 }}>
                  {creating ? "Creating…" : "Create & Open →"}
                </button>
              </div>
            </div>
          </div>
        )}
































        {/* ── CONFIRM DELETE MODAL ── */}
        {confirmDelete && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
            <div className="modal" style={{ width: 400 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 300, marginBottom: 6, color: "var(--red)" }}>
                {confirmDelete.type === "all" ? "Empty Trash" : "Delete Permanently"}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-m)", marginBottom: 6 }}>
                {confirmDelete.type === "all" ? `This will permanently delete all ${trashedProjects.length} projects.` : `This will permanently delete "${confirmDelete.project?.name || "this project"}".`}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 24 }}>This action cannot be undone.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-ghost" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancel</button>
                <button onClick={() => confirmDelete.type === "all" ? emptyTrash() : permanentlyDelete(confirmDelete.project.id)}
                  style={{ flex: 1, background: "var(--red)", color: "#fff", border: "none", borderRadius: 7, padding: "9px 18px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {confirmDelete.type === "all" ? "Empty Trash" : "Delete Forever"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
































      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <button className={`bottom-nav-item ${view === "portfolio" ? "active" : ""}`} onClick={() => setView("portfolio")}>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Portfolio
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/pipeline")}>
          <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          Pipeline
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/workspace")}>
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          Workspace
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/tasks")}>
          <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          Tasks
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/notes")}>
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Notes
        </button>
      </nav>
    </div>
  );
}
