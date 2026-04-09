"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
const CALENDLY = "https://calendly.com/hello-valoraplatform/30min";
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
.card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;cursor:pointer;transition:border-color .2s,transform .15s,box-shadow .2s;animation:fadeIn .3s ease both;position:relative}
.card:hover{border-color:var(--gold-border);transform:translateY(-1px);box-shadow:0 6px 24px rgba(0,0,0,.4)}
.card.trashed{opacity:.6;border-style:dashed}
.metric-pill{background:var(--bg3);border-radius:7px;padding:8px 10px}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200;animation:fadeIn .15s ease}
.modal{background:var(--bg2);border:1px solid var(--border-m);border-radius:16px;padding:28px;width:460px;max-width:calc(100vw - 32px)}
.inp{width:100%;padding:9px 11px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font-mono);font-size:13px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold)}
.inp::placeholder{color:var(--text-d);font-family:var(--font-body)}
.inp-label{font-size:10px;color:var(--text-d);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;display:block}
.inp-group{margin-bottom:12px}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:7px;padding:9px 18px;font-family:var(--font-body);font-size:12px;font-weight:600;cursor:pointer;transition:background .2s}
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
.dropdown{position:absolute;top:100%;right:0;background:var(--bg3);border:1px solid var(--border-m);border-radius:8px;padding:4px;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.5);animation:fadeIn .1s ease}
.dropdown-item{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;font-size:12px;cursor:pointer;transition:background .15s;width:100%;border:none;background:none;color:var(--text-m);font-family:var(--font-body);text-align:left}
.dropdown-item:hover{background:var(--bg4);color:var(--text)}
.dropdown-item.danger{color:var(--red)}
.dropdown-item.danger:hover{background:rgba(244,100,95,.1);color:var(--red)}
.stats-strip{display:flex;background:var(--bg2);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:24px}
.act-tab{background:none;border:1px solid transparent;font-family:var(--font-body);font-size:12px;cursor:pointer;padding:5px 14px;border-radius:6px;transition:all .2s;letter-spacing:.03em}
.act-tab.on{background:var(--bg3);color:var(--text);border-color:var(--border-m)}
.act-tab.off{color:var(--text-d)}
.act-tab.off:hover{color:var(--text-m)}
.stat-cell{flex:1;padding:12px 16px;border-right:1px solid var(--border);display:flex;flex-direction:column;gap:3px}
.stat-cell:last-child{border-right:none}
.cards-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.nav-item{width:100%;display:flex;align-items:center;padding:8px 12px;border-radius:7px;font-size:13px;color:var(--text-m);background:transparent;border:1px solid transparent;cursor:pointer;font-family:var(--font-body);transition:all .15s;text-align:left;margin-bottom:2px}
.nav-item:hover{color:var(--text);background:var(--bg3)}
.nav-item.active{color:var(--gold);background:rgba(201,168,76,.08);border-color:var(--gold-border);font-weight:600}
.nav-item.danger-item{color:var(--text-m)}
.nav-item.danger-item:hover{color:var(--text);background:var(--bg3)}
.nav-item.active-danger{color:var(--red);background:rgba(244,100,95,.06);border-color:rgba(244,100,95,.2);font-weight:600}
.sidebar{width:210px;background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg1);border-top:1px solid var(--border);z-index:100;padding:6px 0 env(safe-area-inset-bottom,12px)}
.bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 4px;background:none;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);font-size:9px;letter-spacing:.06em;text-transform:uppercase;transition:color .2s;position:relative}
.bottom-nav-item.active{color:var(--gold)}
.bottom-nav-item svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.mobile-topbar{display:none;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--bg1);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50}
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
const fmtPct = (n: number) => (!n || !isFinite(n) || isNaN(n) ? "—" : `${(n * 100).toFixed(1)}%`);
const ASSET_TYPES = ["BTR", "BTS", "Hotel", "Flip"];
const CURRENCIES = ["GBP", "USD", "EUR", "AED", "SGD", "AUD"];
const CURRENCY_SYMBOLS: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$" };
const TRASH_DAYS = 3;


export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
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
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [myNotes, setMyNotes] = useState<any[]>([]);
  const [actTab, setActTab] = useState<"tasks"|"notes">("tasks");
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
  const isStarter = tier === "starter";
  const activeProjectLimit = isPro ? Infinity : isStarter ? 10 : 3;


  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);
      const { data: memberRow } = await supabase.from("firm_members").select("id, firm_id").eq("user_id", session.user.id).maybeSingle();
      setHasFirm(!!memberRow);
      await loadProjects(session.user.id, memberRow?.firm_id || null);
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", session.user.id).maybeSingle();
      setSubscription(sub);
      // Load team tasks & notes
      if (memberRow?.firm_id) {
        const { data: allTasks } = await supabase.from("project_tasks").select("*, projects(name)").eq("firm_id", memberRow.firm_id).order("created_at", { ascending: false }).limit(30);
        setMyTasks(allTasks || []);
        const { data: allNotes } = await supabase.from("project_notes").select("*, projects(name)").eq("firm_id", memberRow.firm_id).order("created_at", { ascending: false }).limit(20);
        setMyNotes(allNotes || []);
      }
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


  const loadProjects = async (userId: string, firmId: string | null = null) => {
    setLoading(true);
    // Fetch own projects
    const { data: ownProjects } = await supabase
      .from("projects")
      .select(`*, appraisals(id, gdv, total_cost, profit, profit_on_cost, irr_unlevered, status, created_at)`)
      .eq("created_by", userId)
      .order("created_at", { ascending: false });
    // Fetch firm projects (projects created by teammates in the same firm)
    let firmProjects: any[] = [];
    if (firmId) {
      const { data: fp } = await supabase
        .from("projects")
        .select(`*, appraisals(id, gdv, total_cost, profit, profit_on_cost, irr_unlevered, status, created_at)`)
        .eq("firm_id", firmId)
        .neq("created_by", userId)
        .order("created_at", { ascending: false });
      firmProjects = fp || [];
    }
    // Deduplicate by id and merge
    const seen = new Set<string>();
    const all: any[] = [];
    for (const p of [...(ownProjects || []), ...firmProjects]) {
      if (!seen.has(p.id)) { seen.add(p.id); all.push(p); }
    }
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
    const { data: myMember } = await supabase.from("firm_members").select("firm_id").eq("user_id", user.id).maybeSingle();
    const userFirmId = myMember?.firm_id || null;
    const { data: proj, error } = await supabase.from("projects").insert({
      name: newProject.name.trim(), location: newProject.location.trim(),
      asset_type: newProject.asset_type, currency: newProject.currency,
      benchmark_rate: "SONIA", created_by: user.id, firm_id: userFirmId,
    }).select().single();
    if (proj && !error) { setShowNewModal(false); setNewProject({ name: "", location: "", asset_type: "BTR", currency: "GBP" }); router.push(`/appraisal?project=${proj.id}`); }
    setCreating(false);
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
      const { data: urlMember } = await supabase.from("firm_members").select("firm_id").eq("user_id", user.id).maybeSingle();
      const urlFirmId = urlMember?.firm_id || null;
      const { data: proj, error } = await supabase.from("projects").insert({
        name: projectName,
        location: d.location || "",
        asset_type: urlImportType,
        currency: urlImportCurrency,
        benchmark_rate: "SONIA",
        created_by: user.id,
        firm_id: urlFirmId,
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
  const avgPoC = (() => { const v = projects.filter(p => p.appraisals?.[0]?.profit_on_cost); return v.length ? v.reduce((s, p) => s + (p.appraisals[0].profit_on_cost || 0), 0) / v.length : 0; })();


  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <img src="data:image/png;base64,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" alt="Valora" style={{ height: "32px", width: "auto" }}/>
      <div style={{ width: 26, height: 26, border: "2px solid rgba(201,168,76,.15)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <div style={{ fontSize: 11, color: "#3d4249", letterSpacing: ".06em" }}>Loading…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );


  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", display: "flex" }}>
      <style>{CSS}</style>


      {/* ── SIDEBAR ── */}
      <div className="sidebar">
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
          <img src="data:image/png;base64,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" alt="Valora" style={{ height: "26px", width: "auto" }}/>
          <div style={{ fontSize: 9, color: "var(--text-d)", letterSpacing: ".14em", textTransform: "uppercase", marginTop: 2 }}>Development Appraisal</div>
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
          <div style={{ padding: "10px 0 14px" }}>
            <div style={{ fontSize: 11, color: "var(--text-d)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
            <button className="nav-item" onClick={signOut} style={{ fontSize: 12 }}>Sign Out</button>
          </div>
        </div>
      </div>


      {/* ── MAIN ── */}
      <div className="main-content" style={{ marginLeft: 210, flex: 1, minWidth: 0, padding: "32px 32px", maxWidth: "calc(100vw - 210px)" }}>


        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVUAAABQCAYAAACptuYpAABWyElEQVR42u19eZwcV3X1ue9VVfd09+ybRqstydvIu43BC54xZguY5GPpIQQcIOxx2L84HwTcakhCSAgJO5gECMEs0yYQiAGDAbXBxsaWjReNN0m2tpE0o9l7q656735/vKrumkGSNdLIFtBXv/6NNJrpruXVffeee+65QMMa1rCGNaxhDWtYwxp2Ihot/EYGEJsGBgSQBzBwyF8cDL5u6Onh6Pe3jI3V3nOkJ8+5HNSJevLpNGT/2AAd7mcWnt/BznMTgHw+rwBwY0k1rGENe8odd+O4Gtawhv0hODwBQD/nnBVXNCflOh8goTkpJZiIGBDMAsIS5IFYEkMohsPMNpilFII1syMF2UTQlpT2ZKH6ix/dsev7GUBkAX2inDQziAh81cWrr+5scc52q9qFALQGCOxrAAKsLCnmNLPQALRmyQoEQQpMyhKkFGubWWvFqG7fMf31+3bMTAfXtBGxNqxhf6BmhX8ZGIDI56Glzf0re5OfVpphSRH4B4IUBArchRAEKSnwyAQpAEsKkCBIAogIibiFA9PlN+/e7562cfv+sSyRwAngWDMZCAB8+YaOMy44rfOrXa1xuJ6CZuMHtQ6/Ap7SUJprO4+vNJjrHlNrRlNM4om9hbHinPwaMxNRIwBuWMMaThVAPg9lIrjRzzUn7Nd1tMTOLbu+FoKEZoYkQugwhAAIBCEIYCYAkFIwAhdsS8LkHKmetqbW809reT8RvTMzMCCz+fzT7lQ3jKSJKKff+sc9H21JOjw+U3aZYWlmaMXQDAgClGawcZzEDDAztDb/z8xggAnQxYpvbd9ffNPWycnZoSGSwImLITesYQ07/iaj/xgZgRwZge7uTDzclnDeQEQkBElBJIQgIaUQUpAgMn8PvycECUsKQQRBwc8CkFVfc0vCOVP79PUbNm+ZygAi/zSmxuk05IdyI+rKC1c+Y8NJrR9TSjMzbHOaJBjm2IkgwnMmInPOwd9JmJ8lgBNNtr1vovSrm27f+TfpdFrmciMNh9qwhv2Bm4j+I5eDSqchb71n7y+m59wfxGOWYGYliGD+AETBC/WXFOZtiAgmeAWIiNyq4kTcSp2yJvXPzMCGdPppzY37+zPMgHXGquaPNidsaGaWgmrpvZTm+Ml4VRABUhAEGfjDkgKWNNCHY0uqekrt3Ff82+DqNVZTw47VGtjR75tTjfqG0bHK+8qur6UQRASICFYoiALnSsErsioChyQIsKSQcyVPL+9MvPzZZ/Wd/8pcTqUXRMdPZZSazWb1y5590pUn9TVf4SutLCmkEMHxCoMNC0G11S2DcxOifs6Bc/VTCUuMz1T+57Yt+zcNp9PyRKaONeyEd4Lh+zQKnL+PTjUHqEwmI+58dOz+6aI3nIhbAgwlJIJiVd2hGv9jsMZo9Ao2mKslCQBzc8IRZ65t/WcGkE6nn5bF39+fYQDOqataPpqIWcwAog41wC7MRRFhpGpe4XmL4N+2JUSh7LmPjc5lmUG5XCNK/QM1PsHep2EnZKQKANksGKDdEzPXFspeybYlCSIW9NtbcxiZRvdbEfwgEcGWQhYrnl7elXjOS5+9+jlDuZxKp5/aaDUzMCCz2ax+1fPWvmxlT/KciudrSSSlECa9D6PUMDINjh1BZIoA9hAGKvCbYlLsHi9/5c4Hx+7PDaVFrlGcaljDGnY4p5oF9FA6Le7eMrXrwIz7mZgtBBg69JrGCQWRXAAHhLhjmPrXHS1Ba2bbEljRnfw3AFYQNT51KdrgoAaQXNvbnCWAtQKJgP6FIM0PI9MQOxVR54oaxMExW4iJGXdi8yNTH85kIIZyuUaU0bCGNexJIlUAuVyOmUF3bZ/86NSce8BxpACxliJM+1Fzoggca0izCh1WWOyxhJCFsqeWdyXPesXAyS/NZrM6nU4/JdHqcDotstmsfuUVJ72tszV+6kyxqhWzCPmmRAAJ1BynbZnoVUpR4+aGmDIRtG1JsW3PzJce2z25Z8NImnACNTU0rGENO4GdKgCdG0qL0dG5ifEZ95+kIBIglpIikWokZQ6KPGIe5lrHKbUGEcBrepN/ByDW39/POP7VTrGlP8e9yWTPqt7m97ie0r7P5CsN3zfEfnDIVoCp7Is6BCCDiDX4no47ltg/WR79+QO7/jGIUhsOtWENa9gRO1UM5XI6k4H439t3fvLATGVrLCYlATp0lAQCBVhk6JiieGQEAYAQJEqur/u6Eqe+9oXrX5PNZnVmYOC4RqvD6TRls9ADz+x+d2drrK9U8VgDQmmGrxlKsXGsNe9OdfZCQLWSgiAtAdsSLAVo297Zf5mdxWQQpTZS/4Y1rGHzzHqS/+eREQgA7r7xUra7Lf5fUlCtc4rBECBQhIaEAGclBMUqrjMFNDMpzdzX2fShjg7kMDhYQD5/vJyT2NKf4/POaFuztq/lbWXX14ohBDO0Nu1QbA6udhGEAASC6DooymkmMLNuitvi8b1zD/7v7bs+m8lkxFA2e7RR6sHONxqxP1WOeiGN52BZAx/F+x12PR3nc1n4WU/HdV30cWcyoJGRNPWHymeDMNJngQVqb1x77J6+9XCkxifaNX4qj+2ILpzpFsqp171w/S9XdCcvdT2liEgaHxoQ5oFaG2uUckVEYNSjVmao1pQjH9w2+bdf+uFj/zCcTsuhXG7Jq+fh+77xJad95pTlLX85VXB9Kcgyhxg4/gj+W4MrRFjlp5r7EwIKgMzft2/oe7/cmQuvx1Fd8MgV1xokxG/fZK1rl/K4LADmg3/uQX7uSJ8gEvRk70fQmsPlsLSLmJ58STOfOM95BhAb0mn60xtvVHoRx0VE+Na3XiE/85kxWkqpSRNDHMmN4SNyKVpr2jg4KAFgE/LI56Hx9NQefmu9aW0WiBDg666DyGaX/riO0KlC5nJQA+f0Dl7U33NLkP5LojAcmE9FCjuvQBSBAEKvCm6KSZ4re6Ub80+cOfL49M7gV/RSLtqNDL7szO6zLz9v+a+JYGnFROHBAfM7p7Cg6DYPG4ZKxW358I7p2z/53yOXD6fTOMZN4GDCMgTTFPFUaLJSJIqLXncKMpfwWASA8iLuiwXACX6eUW/yYAB+5OvxgrHs4LOt4KsbHENN/+bpjpjS6bQYHh7WRvWtZi3PP3fFycmUdUYsJk7ubm1ywdomIaqVqs8Tc1WtlX5w+77CI/c9Nrk3eh5B4MBLdG4H060I1yoFf6cFmZaI3GsK7q862PFwJiMGN20ST5PucAxA9RA7w5Jnykcc4oeR39XPX/e/61a0vLjs+koIIZm55lRlyE8NKUhk0unwk0JHpZlVeyomH3xi8jNf+J9H/mqpo9Xw/d501WnfWtmTHJopVJUlhQS41rwQOk6g3ooa7tpRTNWSpHzF8md3773yJ/fs+Vm4wSzmeNKAzAHqov7O5/S1Jz9PgkqsmYjI18y2ZpZgWAD7tiUVM+Ye3TX+8pEdpf0LHN8xR6hE4PTgSV9uTTkX+T6zlKQFkfJ8FfMUO8wMQWQVK/7sfQ/OPnv71NTMoRZecC30Vc9cdWlvd9N/eJ6OA2BBYB04VUHEUlIl4Vg8MVf58dd/sv0dmcyxRwgBhM/POWflinWrEj8iIRIAK9awQGDHFiWt4BCh6lgk90+67//Gz7Z991iyjKO1dBryxhtJhdHyRad0n3PSqtSru5pjgx0t8dXxmOxNNVmwLGEilfBiM+BrjaqnUXb9Yqni75wteveMzZRuyv18x/8CmIusd71Y5xBeiz+7cu0HVvQkrq56ugLzOLOvIJXWAmDNDKE1CwDEDMEEhmYozRJErDVbAISU5BLgE3DAssTDhZI/War49z68e+ZXDz0xvWPB5+rj6FwFAO5f17JufW/btwGkQOwSwFJI10iTCntqrvLTH989+p6lWI+LwVRrlkMOzKDLz565blln4nlxR1paG7G7aCdS+PgRzU/NotCAAMmK6+tVXak3nXdmz/Xp4dwDmY1Lc2LpNGQ6l9NXnLv8ko4W5+VzpaoCIH2lg5Q/OE7NtX2XmMABDUAKYWQANQCwitm2fGz39I9/cs+en3EmIyibXfQDmQvebbZAD63spBXJJjuhtDYFPmCeQ2cATY5Exet42ciO0mcHBgZkfgnUvdJpSCLoy89d9ozejsTrbFn/bPO5NgBAKUbckdgzXrxp+9TUTHDOB/384f4ME7Lc3RH/25OWNZ9aKFXN+9Wwnvr9l4Lg2OK0C07t/Gw2O/HI0WxOUdsYrDTb1qm+rsSZjiVraWx4HUO1sUTcQtnVK4MN7qlUaaDhdFqYgIFp6IqTrl7dk3xDayp2aUdLTAKAr2oFU6WqimkB9BJkgKIl6SQ7WuJnCMIZrtfy6tNXt+/cO1H6zq/v3/+JoVzu8WhGeaQH199vMNz21tgpJ/e1nDpdqEIG144Z0GH9waiy1SAUHQRSdeSCa2uplgIRLkMnwVcaq5clS5eftezOA7Pl7//o7h1fz+Vy+wnAdcdJZzkzMCCy+by/rq/tr9b0pM4uVnyzJrgOBUlJ0NrZcNaKjo9ns5N7DpFBHrVHPzLHkIPKDaXFLx44cM++ifLXY7YUANRCh0ALAA1QXajESAYCliBUleaOlphz8SkdHyACB9X0Y49S+zNMAK/oTvyd1pClioIyuyoUM1RAp/IVG31UXf+eYQVo6OD/CESTcy7f+9jURgIwNJI92mPkgQFYD+88sHe25H3SV1pXPFWteEpXPaVdT2nP19r1lK5Ufa/k+joRs94AwBocXBq5xGHTcMFdLbF3CAJPF6rVUsXXhbKni2VfF8u+LlV87SntFyu+fny08DEc5pwzgKBsVl+0vqO/OWFfOTlbUWVX6ZKrdMVV2nWVrlSVLrvmNV3wqk0xi884uf0vAfCTjbE5UnOarKqvuFyuKl1yfVVyfT1X9nSx7Om5kqdLFb9aKvtaSioB88fgHH88j3gol1PPvWDFi/7mz86+89ln9/3nuhWtlyebbFl2lV8q+9rzNYPARCQJZAFkMWARkSUEWSCyGBCer7lU9vRc2VOe0qqzObb6rLUd7/w/zzn5N2948amfBNCby0FlBgasxR6o73FprlDVxYpfnSl6erbo6ULZ04VgTZTc4GtF6WLZ1xVX1b/v+rrkKl2qKD1X8nSh5OlC2VOzRc+fLrh+qeIpx5KJjtbYFaeuavv4a593xn3pgTVZBtqzgD4O3ZUim8+rk09O9rYm7NeWKr6qekq5ntJV3zxrrqd1qeJXE3FL9iyLvTF4PsWSHcBifngoaAh4eOf0R6bn3KIthWATrEIKMZ9CFWUBBEUhKUTgaAmSSJaqvjp5WUv6hc/su+yVS9C+mk5DUjarn//Mvue1NTsDs8V6lKq5TqHSzDVH62vjQJVmszuHzlezsiwhRg8Uv3LXw2O/+tYxiqYEYD2myuXPeb7ybClsQURkxLuFkXElIYhsz2ekmqzzn3Nu3xXZLHgJFh5RNqvPWdPa1pZy/shXTLYl7FDGscYiAzjhWLJS9e+4bcv+TZlMRhzqnEPFsbVrWt+ciFu2VsyWFELKQBqRKEBRap9hu55CV0vstaev7urLGmztmBdyPGapQOlXMEMAEDL4TIS1R0EC4KesNTq4X8zM1huvOvXfrryg76ZVPclnVKq+mi15SinNmtmCkZAkMJOJBrlW5MU8NTiCWSkkCCRZQ5Zcn4tlz0/F7Zaz1na8/X2vPvv2F1zQ9yfZfN4fXmRjjWItmCAILKQkcw+FkbyU0sh62pYQtkXCtkT9Z2r3F0IIc50DuUwpiCwpyGKG9HzNxZKn5kpVP+bI3vUrW69741Wn3nrh6e1nhsp4S3XtBwYGTOrf255uTthtvtYspZDBs2XOyRyjxQSkmpw39/Yimc9DYYl484td1Hrj4IC86+EDj+6dLH3esaUQgpQgzFOtEhH1qgWyAPVmAUlQipFqsnH6qo6/Z0CkcUxiK6FoSqy3NfFvYBa+ZlLaCL7UHapR9dfB902ag1pawwwoxWxLQWNT5ermLWMfYoC2HHs7qk6n03LzyNTOsqt/ErMlMVjVUqggxTK1NNaWFGhtcd5ikuhjE6EJ+cBrVrS8viXpdPpK+1IQhdzikKdjNhNNuw+UrweATZs2HWp9iHQup9f2JnvakrHXVj3NGpDm+hnnwEFKGBYFHUuQ1qw6WmItzzi97bUAOGMegGMyr+TZBJYhqyNyOUGRZ4SfIlm9MAU/+eRk77WvOuvms9d1vlMK0nNFTyvNkgAJ1GvS5tpT/U+IoAUbv680FNfXaq2qJAQRkeUr5lLF87vbm9Zefv7y7/75C9e/eyiXU5zJiCN1Er5mO4rjhscmDqJAZ6Z/hLx0qtdKUO8+DJ8lHQi9g0BCkpRCWJ6veK7keZ0t8TMv3rDslsFz+i5dQsdKm8xmnUjG7bcxg42+c71uEhanpSDBilVbyu7rX977SgCcTi9NtLroN8nm8zqTgbj9vv3/PD5THo/btZkrkV55zO+2ivIaIj8DQBYqnjqpr/nyl12+6sVGbOXo2lfTaYhsNquf+4zlf9GSdPrnSp7igOivuH6TtWYoraG0hmbA83XN6foqjGC1koLE6IHSp+7bMfNELp1eIuzHoHkzFe9jVV8zMwkOHDlFmBIgkq6nOBW3X3TOGe0bAlD/qG/4xk0mKuxojb8h+CwBEDiy4bE2LbgzBW/75m27vs1ASNs5KGZFAF/Q3/3n7S2xNqW1sqWgUCeBOdi8uI63hc+p7zO3tzjXtLaiLTiuY3J2QhCDyMB9ZkRDvf2YECmSHv/qfxrGoV5waufpr7pk3S9X96aeU6x4nmYIIUmEmRozR9Tewo2N2Wyy7APsE+BrZsWgkE4dKV3Xi63GT5BVrvjatoQ6b33nx69+wfpP0SKaa7SCE3Y/UuCKww2pvukDSmk2uu5c58wys2Zmxeb/lDJwmq6tgSBQCSIXy4TAdqHsqSbH6j1zbfsPLjur74JcDioYdXQMUaqBhC87a9mLWlJOv1tVmoLnpu5ygittyiYEEBJx550A5PDwU4ypRu8BNg2Ix8eK+3fuL/6TuUZQkfUbpPpBtCrmL56a0lVws3ylYVuCT1vd/gEAdnqRrIRaQSAHfcGpqa7etvgHyq7PipmUYmitoZWGF2CmoQNlRh1HVdpgqZrh+ZotKcTeydL0XVvGPsoMWirRlHDh/PI3+/Klin9XkyMFEVTwUAXFMlOl93ytbEs0rWlvDjCfo4vqggIVP/+ivj9uSdgbyq6Za6gjw7ZMNMHaloLGZkrfGh9HYaN5IA923rQxn1etrWjraml6DzMzQCIcORM6VMMKCaMwhCI7ouL5uqM5vnLwzNUvJwIPHGNXnZKkw6CY5m/YdVF1EFgf3/Q/A4gbCeqUlR0rnveMFT9e3p1cP1eq+pLIDoXQw9g9KvQOhmJmZUlBiZglm2K2lYjZViJuWcm4LZscSaZ2yj5zMLsIdanNiBCQ8Hwtqr72Lji166+ufuG6D2fzef9wGOuGDWb8ui3hEkUj/OBBj3QbkgBijqR48GqKma+OLciWghwpybFEiAkoCmh09ZpLnWopANiWkKWKr5JNVssZJ7UMr+/oaAEyOJZNdnAwowFgeXfTmyxJrCOQntb1EwuZSUQkfKV1W9I5+7Kzeq4gWhKo7eh2hmw+rzKZjPh2/onP7ZssPxpzLAlAhypPIS1EhEwA1L/HTDVMk5nBGnKm4Ore9qaLXjFw8muHcjm12PbVdNoMHGiKJ9fFHWt51dcgMlFgtCWVYSgqmk1UqhlBoSqMVDU0syYisW+ilN26rzA+NJRe0oGFmzaZa16qeJ8A5kcEzKh1chFB+Epzc8L+07NWt7YHUeOiF1xQoEJXS9M7KVAMq2cVtTdkx5Ky7Pozj+2Zux4AHWqe2MDAgCSAL9+w+qr2Fqev6ikdMtIoMiECB0m8jXMDtNK8sif5egBi0CiIHbWZDr/5DPpolFpjA9BxTf9pYyYDZiRffHHff6/uSa0qlD1fCGGFqXA0+guV2wjQcUdKQSTHpyvujv2FXz8+OnfjyM7pGx/dNXPj43vnfrJ7vLCvXNUi7liWbQnSrFV4ZmFFPqzOE4g8X1uVqu+dsbr9A1ddvPL12XzeP1T2t2WLKdpZlvSJAhGkIBASwjjSsKmHGZgqVMtTc25pcs4tTc66c5Nz7vT0XHV8tlQdmy1Wx2aL1ZJbVRCCZLLJtuKOJCFISUGwIjzw8P2kFLJY9rzu1vjaC89t/WA2m9XD6fRRBw/ZbJYvOqPr2am4/fyqp5gESVD0WtW2CEO6NeufY45Aa9J5n4EQj53mZR3l7/GGkREBoLhrrJDt62y6QUrS0TC7lt5EPQEDOjjm0ImwEbkmXzGvW9H8NwC+jsHBymLaV00EmBHZbPau5V2Ju1sSzgWlsqeEJClMJw+EMBiuEMExGMAFOtgIgvREpxwpRg8UH78xv+MLwXsuadoYAuJbNu/9bsvla3Y1OdYqT2lNRKIWwRvamah6WrUk7WVrVrRe/cDOmU8ODAxY+XzeX0z0RNmsvvjMvtObE/YlblWxkELUWzZqN0bFbGmNz1S+98iOmScOxxseHBzU+Xxe9LY3vZUZrNl0gXAkotEasKVgM4iWaxNoA+KaLFWVbks5lz7vor7nZrPZHx8LvUpppjqYWj+neiAeJqskjpdHHU6nBWWz6jXPX/exk5c1XzQ553pSkG1Wt+nVFggKuQbDVokmW7pVRdv2zN22fXQmd9/j0z98fHTu0YO8fdvAecuedcbqthd2t8b/fFlHU3vZU8r3uZ6oU3COZD6t6mnp2ILPXNvxL3v3F386PDy8K8Bm+OAQSqQmEtwl5hC2Y5aSqFT2Zr71s+3PdYu8HwBcUfGoBF0EvHBjWdHRlFjV3dze2mKd0d0Wf157cyzd1hxrLZV9DYKoYay1LAYgIqvs+rqtOfbmc9cv+6ehXG4cR0XITwPI8aqe1FuaYhLFiq8FkQAYTMaNhpOR53WxEUnPZ51KOFecc0rrOdnszG9CXvlTGqkGTACdyWTEf9+6Y3jvgdJdiZhVo1jNa1cNrk4dX6kXM0IeHABRrHi6uy2+/lVXrr3maHasTZuyAoCenHb/OXy6wtCfg6dfax1gpqhNRtVaR0dRs6+YRqdK1wIojxg60VITlHlgAHIvUCqW/S9LSWCwRiQ1jJbjlWZuS1qvNVHd4uhVYYV+eWfs/8Ycy/GVVqbSXJ8WGzA3hOsp7D4w9wUAlDsEkzOMBi49a9kLUgnr0mLFZ82mQEWRxM2xJVeqigT9drEjiNy0ZQk+qaflLeZxOPpCXDxmKRKk6SAK6vNw1eNYmHplLqeec8GKK05d1fqWkuv5AOwoho+QB21SYNXcZMu9B0p7Nv1m9LUfzz142Xdv2/WJx0fnHmVmGh5Oy/AVFJum8/fu+9Hn/+fhd/3Xj584b8uOqa8JkIw7Jg+kBeoGOsDMK1Wlu1rj7Wed1vVFIuJMJnPIKxEyDEI9j4NBOdCkE5bYOVWp7JqqVHaVSthXBMYATAWvyT2T5d13PDL2wM13jQ5/7Sfb3/SDX++5cNf+wndjjhRgk8mKiGBRgImTp7ROxq2WVb32q6OF1cX4sVwupzes717XmnRe6itmQWGUGuDBxg9woeJpXzErHUQEzFCsdSImaVl781/W/PNTnf6HhzoyMkIA/K17Cu8vuT5JSdDgWmrJjEjlkmvRaQheGzA7LA6Bqp7i1b3Jd69d2966ZZHSgPk8/EwG4pZ7RnMzBfde25LS97VSmoPG49CJMrTSdawl+ApmFXOkHJ+ubP7Rr/Z8+3B0oiWIVjUAjM1WvlB2/TlLCEkgrjMoatG+dKuKYzHr/IFzlz9nkfQqGsrl1JrW1rbmhP1St6oAmv+7zICvtIrZkmaK1Z/+8r7x2zKZDB3qvAPnx2uXp94UsyWzNpuBDjOQIDQUgmjk8amPVTx/P5kMgTm41wHWarlVhY5m5yUDZ/eeOZTLHRNfkWtpD9cr2JFs6Hg61mEzTBJnndT2j60JhzzFVC/SBvkl1wqkKh6z5MM7pu/84vceuux7t+36KmcyYsDgnoKIeGgop8JX0HRB6TRkJjNgPbFvesdnv/Pw1bc9sP+dxbJflYLgm8qRubYh5GY+X1Sqvlrb1/zcF1zU92yjYXzwa6yDngMdfT7DQKjGOmDpw0oGPsPC/Nmf4UtkAJFOQ2YGBqxtu2e3fuVHW186eqC0yXGkUIpV+MwbvDb4u2JigBMx+6UAaOMiIaGARcLrl8Xf0pywE75SioJdInJO2pKCdu4vfL7s+tssKaCZg1oqSaWZkzHr6rV97atzORxTYfiYUqJcLqeG02l50x07b9kzXrq5ybEka1YhwK2DcLuejvE8PmjU2QqCKLm+6myJ9116Ssf7jkYaMMAreXKm+lHmAEsNdqTw88O0MNyNde3/QJWqwu4Dc9eaDSN7PGMcnU6n5b2PTIwWy9734o4k0HxHFmYoGqwFEbpanGuwCHpVeO3OO7v1Na1Jp0NrrWRtHMN8ipvSmvZNlz8XifgPulaGcjn9jDN6N3Q0O3/kVpWBNBGyFsxz6diS5orV0Z/eu/f/zRS922KWAFE9g7GkgC0FmKFSCcdes7zlGgB8tNGqN6cE2ExymFdRRz3iN2sRS57+h7zoP7p4+VUruhMXlau+soSQ8xkw5tJoDR2zpNzy+NRt/5rbMrh/xn0iMzBgUTarA0jnUI6EczmobDbvAxA/zwxY3771iU/eev/+17lVX1lSaG32rOC5qhWwSDPQnLDFuuVtHwEghw8xcUMHtQZmXaOihc9HJAiGJUTY16+BeapZ4UtnAZ3LQWXzef+CC2ATAVu2Tb+7XPHZtgxOVHsGA4wdREJrpqaYPAVAKtxMjhjPzufVqX2pro5U/GrXU8wcij3VKINsS6Ky65dGdh3Y6Pr6v838PISQJSnNqiVpx0/ui78ax9gMcMwLLYccCMCWHVMfmC5UYUlBOlI5DKkUdfK9nke2D9NQrQEGyUpV6ZXdybdduK591cZNeZVZxDGG0epP7x3NzZaq98XscHesL7had5UOK/8MpbSKOVJMzlR++PN79v/sqZmOmgMAmp31P+V6Wkf0vGsPZIAFStdTnGyynn/hKT1rg771J70mAV3JbknYf6mZ5z0kZtqBkTSMOVLOFr2tP96+52ZDo4I6XDRw+qrUm5NxO67BSohAGcQQK6GZtSBg/1T5BwDU+ETpy1VfQwohRFCsoDquKF1PcVeL86enr+7qSx8tbSxuDiBs9wyzD0Y9E2Lm48KnCp3Umu7mtzm2ZF/pGmm/VkxiQ1eLOZJ2jhX2fulHDw1lMplqJgORXQQ+Hvq/K7J5P5Pud27+9e5vjOyc/ifbEkGROLJuaik8ZLHic2dr/OLLzl12GmWz+mC0Jc3Mhrsd1DgitKOQMSMEcdxxDyVKclDbvBnedddB3PXY+AOz5eqDji1F2AC+sCKvFEMK6l2/OrUKi2AAZYLC6fo17Ve3pJxlyteaIuUCQxWDsi1Js0Xvx4UCxg/MeP9ZKHmuECRNzMXQmoWvNBIx6x3t7Wg9lmaAY3eqOahvpdMyf+++u3ePF26ImQqF0pFI0Pd1LaXgeTtVFAtiCAJVPKXbUrGWM0/pyhKBQ1xwkdGqni36/0YAhQtEB+2oKqBOaQZ849CZBFHZ9f29E6VrGU/NdNSAXkW/fGj/nWXXy8dtSczGoUWdHwBSWqummEws6479ZVCBP+x9GxiARQT+o4tWPLs54ZzhVpWW4TjuGpfUFKGFIEwXvX/H4WlUYmM+r848OdnblnJeU8OsUKfHaVPYkHMlr/zYjrnr02nIH941+oOZgnufYwuhlNZhNxszIAByPaVak7G2DSenriGAh9OLb1WWVcEcgZxCZTSxYPIElp5SJSib1f1rEsvaW+IXu1VVUz0Io+QQBrAkwfc1Pbh98v3lMkb3/u//ymPRucjmRrzh4bT8+k+2/+OuscLDTY5lMEvMZzxIs3Gq1qQt1i1Lvco8IAMHc6oipGmFTiHEPW1LhOJCBCSPgu4yIAAo39e/MMGUNnhFZPMJNUPijtSn9XRUgiLrEVmNg93ivI4ZbLToaEEhjoTna4xNl/8DgPz1yL6H58r+r2xLELHJBMlEy6o15Sw7Y2XPUFj7eFqcKgBs6Tftq3ePTG0cmy67goh8pTnsVPJ1UIphrm1zUQpxDWM1G70slD29ojvxqkvP6N2w2PbVfB6KAfrZPaPfLLn+NlsKoTTrqFOvUboCnKvJkWJytvrN/P37H8yln7rpqCG9anLGvT6oYiOqoFAjzzMJt6rR3GS/prsbqSBdPKQD2mT4erI15bxXSgGtmWvRaj0tYseWslj2Sg8+MZWDoVGpQ1S3iQBev6rrjc0Jp8P1fV3rpqzxG1nFHYmZYvW23zw+cddKrHQA6LEp94ZgYeuopGIAcQhfae7rTLy6D0gE0eqiHKtydE0hPUIRq7Uc1Dp/ltilhhvbqu62l7ck7HZPKQUg6EKIHAixSsZtsW+ydPfNd41+hTMZcf3mzd6xFju3fGaMAMzt2F/8BwaTlKb0LyLjgAJKo2AGEnHrKgBy46ZNB73HIa+8vu5ooSiSJMu3FxNFRlN0ZhQQnWEXrIX6LDuCJOJUko54swk52Fec0/fcZNw+u+T6HPVpzAzla2UJErOl6r13PXzgJs5kGICemq18xvN0Tc0opN0JQdzVHP8rAM7g4NFtfEviVLNZ075677bxrXvGy592bCHArFTABTUwgK713ZvQf36hyHxfQ7MpWKWa7Pjpa9v+nhdfHeZBE3FV5sr+p2KOJBU4FR1pUzWEf2YAolDxp3ccmPnbpST6H+kGAIDy9+//7lzJe0RKIbWGDgF8qkUMEEpp1Zywey9cvzIdPNSHchOSsll97vqO05ri9gsrrm8Cw0hFN8y4YrakYsX70mM7Z7YHbIuDkv3TwzkNINGRir2+6ivWRmumpkFLZCIazUx7x8v/BQAtY+s8AHh459h/TRfcSSmEjGJ/QXQpqr7SXa2xk86/ZMWr6Sgqv56vRXh+4iDK3iGRyFfaWsp7d02PIc73dDRdaFuCuc4WqkMO5lqz0hp7JkrfJAAbD936u7hnLp9XDNBP7nniB2OT5cmYLU2xE/MZNwyQ52skYvK05e3x5YGWq5i/YEhH5f7N5jSf+ghAaMWLPvYN5jqxFLQMQL2+EWaypi0cbPjkdKB45J8xPGwQ2fZW51opCL5vUuR6pkcwXf+E6bnqDQB40Fx/+tXI+PfLFf+xuB0yE0xxz/O1TiXss5/Z3/PCbBZ6YGDxtNMlA++z+bxmBv30rl0f3zdZmm6KWcLXmuf110eqslQjZfK8yNVgOJBTc67uaYv98RXnLr9kaNHRqiHKb99W+krZ9UcdSwilTOActqkGHVUqZksxXXC/uHlkaufQEJaU6H8kG0CQYlQKZe8/pCFca9Qo9PVNKYyym+PWNQDoUPSqzIBRf1q/quXVybglfK2ViGREIfGaADlX8vixJ+b+HYeBPAYGTN/GCy9c8bL2ZmddxVUagFARXJyZdcyWcqZQ3f7jzXuGmU3UO5xOy5EdpX3TBe8mO+j9Z56Pe4YP2MrO1BsA8KEiqUOCjAyiiNZEGAHVU/9gjtpSF6mGhzUAJOLW6UbrhEStg7AOa7EQQk7OupUt22Z+wIEzXKq1kxtOi7k5TMxV/J+bgpyprkc3LhBIac2JuB3rX9u+BgAyC3JrEbTPRruqdER6sJamS1rssxHS89psW14ZtOfKeiZRzzBsS8DXXHp810QBALJPgttmArbEuad2XtjeHLvc87W2LCFruH2AFduWkIWyN/HEntmvhr4hCEjcYlXlLEmA6UeqOWNLEne1OtcAoJ6exVMql3Kt6Y2DA3LXRHl011j57zSzIII2hF8OxKkjmobzWkYjFKvgQa2adlFa25f6SLQosBhntX1qaqZQ8v/VsQUpxToE3YNIVUtJslj29m/bMfOPzKBgDtBTamFhaOd+94ZSxZ+TgmQQz82jB4FIVjylU03OeZee1fPMbPagsmmUzefV2vb21pYm502+r0EwizhKYwsKcyiUvZt+/dj4fZlMhg4FeQStf9zb2fSmMEUMOQQ1qURmLQThwJz7dQCVjYMGmw0eKBqdmPtyyfVZkGlnjTaGACTLVaU722IXPvcZy68kIiyKXlVBTbdVL6DpeYGko9YMS0h3CW8bCTOrzUnF7Y4amTwKP5huPRaCaK7kP7Flx+RDSz0iJ4AAaLbg3WY6BIMMkOvYdYB365gtRWdrvA8ARg4isxlK+/MCBkotFmJoMX9iwZNeo7e/cL2Ty0E998K+17annBXBGCaax8U264ktKeD5asf2/cXxejJ1mAg4wN9XdyfeEXek7QdYrQp8SpAtKCEECiX/u1v3FcaDll0O9Yn3TM79R6Hslc0zV2v9k56vORW3n3/eKV3PzuUWL0+4pBu4aV+F+ObPtn1211hhZ8yWQjHr+lIyxaIwNQpFN8KFEOWuApCzJU93tMUuf8FFK15Mh+HZHS613r5r+ivlij8mJEnP1zUnrzSzbQk6MFP99Mju2cmNGzNLOtJlMRtAOg35yK6J0bmK/82gUVyF6Ww4L0tQGBEK0dvW9J4gXlqI80kAfO6ZLS9tTtjdnjJRKtcq0QGkIAX5imnX6OyXzUN2cPpYSPZ/7gV9l3W0xi6tVLUGQWquI7+swVIKOV1wizv3lP4jzFrqxbgM/Wzz/p9Pzrl3OrYgzayU1lDKvIPR2GUddyx5Um/q3VgkvUqIGjsV8yq+giClgCXNg8uCl5QiF/jRlJSii5lrGnh1fNJkHZYgMHgEAL71rfSSIrubkAcA3j9VHq96ClKISMNFvSVUEjhmS9i2PBkA+hdoyuogc6tLeEaj/XCgJ8NxWAwMDFj9/f3WwMDAQV+ZgQFrOJ2WROBP/Wiru2Ft+6Wnr2r7gK9Za801AaEwoDKZI2sioFDy7gbA4aZ8uNs+lMupM0/u6e1oif+x5+ta4RSR4jeBhFv1MTpeuAEAjfTka6N10um0fOCxme2zpepNUlCgGMcImkh0zJHobo9dczSb4FJnRTwyAgJQHpuqXOv7TILAWs9P9WoOVdd6OCK7Sz1iVZohBfHKruRHAVhBX+6RPhw8MAD56N7CgaLrf9ySgnyzncFXrG0pRNlV27dPjn7MjFPIPn2T4YLM+8CByucqntKSSIpAQ2G+OhFkyVVIJewXnX56V99C9apNphJqxWPWe1WQKtSKFgH+yZqVYwmaLrgP3bpl/KeZDMSTkf37uhLvjNuWBLGOVreDqbMqZktMz1VvvvOR/U8EWp46Uo0TALB7rHQjB3zSekdN2LFDsuz63NEcu/Lyc1ecMpTLLYpKR0Fn0W8NUIpKT/LS81RXt7aylMGgiCALqk8dCMRGBcH1jk/dMyykxJrkiK80GPM3vDDNDuE2KRADgL2FAs0r6EQKOyELgCPRrmniAW8emZrJ5/P+yMhINZ/P+wd7ZfN5fyiXU8zoTA+sedtzzl32vVST3aUVk2UFndihSpeotYyKQtnD2FT5q4CZHntYLDWIUtetiL+rLeW0sGYdiqQJYUTxCVBxR4q5sn/nrx+ZuPW3m1pMFjUxVf28rzSk0YINBY1k1decill/cs669g2LbQawltw/1PvwhztaYteu6kmdP1fylCCSYYRtFp954ANqX9C6SjVxCHNntSiUPNXVGtvw4met+rNsdtdXFzNjKIxWd+6Z++L6NW3vEYK6fcUaBI47UoxPlz+yYwcqIyOQeBoHw+UAFZzXvav6kj9ob4692K36iokkhxgAB1LyzH4ybiVP70y84WHg78JxK0ElVF12Vs9gc8I+M1CjksRUKzyIgHckJdFcsfoJADObNg1YwEHxWTGUy6mLzupY2Z6KPb/i+cza4KtRyoogEm5V0c79xRtwkBbXEEMc2Tv75VNWNF/b1uz0VH3NQdN62N5KvtJ+S8KJr+mJ/w2AN25IpwlHQm2LAVQDjWvdPwaeiBRDLElLPnSwIKUiNjijBkOCDLUsnIUWHIhjCxeoC5gstcWCZEQQwCIcrR4dLRMUb4K73JdKhcMCjSxexF+EQU19wmqQ3YDk4Hm97xVCFGTweVqzpc2GpUmSTsZEqaetySOiyx1bPrct5fT6ilHxFEtp9HvDj6oVwJhVLGbJ0fHSA/n79t9+BPOi6JXm+U+0N8de7yvzYER1dLlWHAf2TZa+BkAB85tacjko49vHNvV1JX7T1uycU3F9xUEsozX7yYQd62pN/BUw9bZ0GuJImZbW8bjJQTqpd+ydu7azJX6LEKgJ1i6UFTPE7KAgE9zMuqQMgcGkNPOKrsRGAN/q7895OHLBBTZiHbOTq5anvpRqcv7fdMH1mhOOXa6qB2/ZvPc/l3ro19Ha2FiOAGBizv1cc8K+ChHdzTD8CesFVV8jHrPe1AJ8dtOm/BQRaHiYNRFRT3vinbYl4HmapaSFRHSO2ULOFb3pX2+f+jYOo5k6nE7TUC6HlR3Nf52MWy2zZc+XZsRHLcVmZp2IWWL/VOmBW+/f9/3geBdeS84MDFjZfH5y5vTuG3s7mv7SV1oBZEUr9MQkXU9zZ2v85f0rW64dyuUmj+Q+m2EkgFbz11foUMKD8XnpVaomJye1p5cfUuMgyL5hCeoEgI0bB3U2m1+69D/gZE/MVC5xbAnNrIxvNyIroXMNtxmltXsICAUilG2KykGaDYk0GI4tmgbPXf5BS4o6HRJ1bL0GzAZRcdXXqFSVYoawpAgE0RkCVFOoAwPSElxxFZ7YP/O3MBNPxeHueWZgQGbzef8ll65+VXvK6S1VfCVMHaJWUWPW2ralnCm449u2l77BAFH2t99zcBASgD8x5w43J61zFTOHcmYEkkppbk5aQ6evTnwolyvtwxHOsTouyj1htPqju0Z/uudA8WcxW0rzIIUNAXVNAHMVqOZoa62r9VUpSq6v21tiJ6evWPsX2SwWJbYShO60c6z0ea15RgohHUvQbMF7PwAvgCue9qHwYTfYrb/Z9+OS69/rWEIyQ4F43tERQVR9rZNN1upnnrf8UiLwBRdcYBERTlmeOKe5yX6eW1VMAiLalhvEKypmS8yVq1/bu7dw4DA0KpHO5XR7O1o7UrFXVjwN1hC1va7eCaeJgNli9SvM7G8c2mBzJkOcyYjwNZxOy72nFWg4nZZ7pss3zJY8GPWghQ82kecr3dEcazv3tO63hA/Qk103WzNRRNiP6rBEHQYQgOAlxVRDIZMKM41TEA7WuNCodfCRrxhEtM4U2ZdW8WwQAwBAK3uS0rFEgArWU35dr2iT4YCLx0163cPzMdV6XSOKSdZ/3wQ9FU+pYsXzS67yS67vl13fL1Q8v1Tx/WLF84tlzy9UPH+u7PluVTERSUuGzJP5YtXBpufFHcvaPV787B1bJr5/JFFqKGzelrTfE6VmzWu4EKQdW6DiqdzewtzE9W++wMpkMpTJQDAzZTIZkU6nZU8PmDMZMT5buaFc8WccS1o1KClsXU3YHcu7Wl+PRbSuWsfLSYxks0QA9oxX3tXZEtsshJDKXNGaSlKYSqpApClszSSaL5CrGeR6ijub7Q/3r2z5Vno4N1XjHB0Ztmrl89M71vSmPtvX2fS+ybnqzT+7d/T7xzrRc6ktiDz8Ytn/VEvC/hJRffsPoRFooxsiHEJrq/1/Adz0satSfMVm8KmrO16RiMtYuer7UgiLArI1h4oYRHK66PqP7Z79LAAcakRMZmBAUD7vv6R/9dUdLbHeUsVXljRQRKi2xMxsSWGNTVXGc5t2/FeQgVWzyB7sLdX12AwAt6/saLppzbLmF1ddX4kAO45GncxAZ1vszQD+ZWM+72WfJFpVmimkytWoeWGhot73D7XEkWqQGvuFslcUogkMZhEMZCeEAj5MFVdxzBarLzy9vf/uh6cexBJO7dxwTQ8jD+5qi58mRZCqR3QH6nMCQK6nMFVy984D8Wsps54XfZKR/IMM1l8IaTBTbWROvY06EpKj1rEcyUIjanGoOVcmQV7SsZ0dY4WbvnfbzncFU3sP+zyn00aq4soLegebE05/xVO6JhJEqEW/lhCyWPKqv3pw4nPMwFuu3+zBrD9kszSPgUFmve5c0dGUW9njvNHXWoFhBUwKoTRzqsl6U28vPpHPo3Qk2dNxc6o5QAW6nA90t8VuWLui+XWlsqcAyPCIQn3ToD86oMUwKKhE6kBhShCJiqtUayrWec7p3e8mmv3g4TQ/DxIFagA0Pl78fCpuvePAbPUfcAJaSK965NHif6fOsf45Ebc7fdNqRUxcC1qJIN2q4lSTc/nA2b39V2TzW/pSqa725thrTbuvELXR0zV5RdZNjiUOTLk/vvexyYcON3p646ZNKkskO5udvzSFD8MONxHg/NTPtgS98cWn3mBbgkDwhSEe1kYvEZjApI3yGylf8Tq3qgCGIDHfz9lSiKpSqrs1ftLLBk56JeWf+K8AOjgkHqotoTlQ+BIcWfLB0x1W4plpSaPEb37rFXJoKKdcTz1AoAspuDt1LJMgCMTMfltzzD65r+15dz08tWWjGZ+8FMdC6aGcbmlBR8y2XhbEKxIL+L8MsGMJMVdwyw89Pr4jyN74YNW+qHMK2QB1UZVgjkMo/xSmTZFp7wxDlayhCDw/Ag4iem3bQtiWcHbsK9z09Vu2vYIZPtGTy2wGEJfsaG56vyUJZVcxCQNH0LwpFiAN8MB5PZ+wJXm+H6JVEMyamUhL4+cliIlIVH1fr/ONuL0M30gICN/XqiXhnHRKT8+r9+8fu94EaPCfFqcK1KevXnr69N92tNh/Enes1qqnWYj6tsYRjl/YRRTiqxxJpzSzmCt7ujVhveei9R1fSOdyi5nVrQFg8/apnZ7Sz75/x8z9IUxxgvnVAAOemjm11PS1ZNx+p2ZWAmSFEXxYQFCaVTJuWT0dTe8B8Bfn9Lf9SWvKWVkOMKYIPAaz4ohcT9G+icongEOPnjYFL1IvvmTFCzpb42eUXV8TQYSUrFpBhINOnbjV1ZZynqcD/DccHSIE1XC58CEPhcJdT4EMjSWsthrMlxhaMeK2RG9b/N0AbsDgoEY+/2TVf5CpRtQda7Bu/IAHDVra3v/PGI4opmbdOypV9RdsNo86WT5sySYmSwqs6Eq8moB/5cFBnc0fO646nIYQOajBtcte2dkSW1au+gpEkurRoHGAzOxYkkoVtX3baGVP4CjnPTNSipq8dw2SQz2bnE9eBUKJ6XA9yKANi9kIENRuQfDLInDDWjObirzn7h0t/fN3bt1xXZBuHwmdURKROvektjNbk86VFU8xiGR4NGHRU5IJ0JocK9aSsJ8TDvvEgjbtumZs/VyrvgokxQOM2bAeAIBbks5bAXxx0yYoepIsWRxnJ6E3Dg7I2x+ZGN17oHy9JYXQHHTV8Pw2uHoXRP0kw2aBoL2VKq6vbUsmVq1o/SABnF68AAfdv2PmXuCEc6ZRDJgB4PGxuc+Vq74XtncCv9V+KV1PI+7IoVQK3R2tzitDrI8j4yOCtkDtWEJMF9yHfnHf3jsPB3sEE2nR05Z4v20Fwukh4Z9Q02oIu5iqnuJi2VOVqlLFsqfmilVVKHtqplhVc8Wqmit5qlj2VMn11VypqgInjbpUXzhjqeYgZani67bm2LkveuaKZxxSBzTsCvKUNMlMwOUNH/yIwhIzoHxtL21WYaLNHePFm6bm3LlaG27kRhnamZBVT6mV3ckLrrp49dXBQL5jDWYI6TQYsM9c1/FGyxK19kw9T7+Yg0eKMVOq/gCAvu7yy3/rs9lQa2sdadFpHTocnW1+UrHp2vKZ2QfBB+Arzb5S2jeURcxrQ61HqKzjjsSe8eId926bvPA7t+74YCi5eSQw3nDacJfXrmp5cyphC+ZATjJS+K61u8OMRipVfFV2fVVxfVV2lapUlXKrSpUr5nuV4HuVqq+qgcTYQjU3QSSrvuZk3DrvWf3dLyAyXYZPeaFqIaUmnYb8zYOzHzkwU9kZs6X0Net5gtURzdPoogjlAsMuKIBkseLr9pT9hgvWdZ0/vHhxY848Bed8rBtRJgPxyBNzj5Qq/k2OJYiCglC0E8USgnylOe5YyUvOWPHFmCWfXfU0gYIotdaWQuFECUzPup8GMLN9+wUHvQYZmIm0z79oxTmpuH3xXMljBmRI1A4dah2LMz2iJjImKYR5BSmUpNr3hRRE0pJC2pahA0pRx9/mt0USfK05bgta1pW8Fjh8N51tM8EwROY5UbO4I6IggpZ6I9WcyYh7H5kYnSlWb7MtwYBp2uAaLhmmwEy2Jfis9e0f6+lJ9n7o1lv9YxHlzqT77aGhnPrTK0/+vycvaz6/UvW1ICFrXN0Q+jEXVE4Xqvz4nuI3AWAk/9scUEGs582WE4ZDGr5fKEIej1kyEbNkqsmymhOOlYrbVjJuWYm4ZTXFLCseswRzXZA85JqHUp8AKObI+K/u3//YF958gU1HXhcRQ7mcOrkn2duaiv25Zyh5MoyJzfGGHVr1jd9M+omsywXrM8BjJUCyJn0bFdjXdUTEsSVaks57AfCTCa08FQ6Gx8YGaPvU1MzeA8V/kcHgmHoPOAd0jwXtqrWydXTqJ5Nm1o4t5brVqffRIkSba04eTz996kmLfIaRgLGZ6idcT4EB0gv0LYNIiDyleXVP8k8AxD2l69eUa0UbjpmUa//mHaNfBYDNmzcfFBPaGDSFd7bEr405UvhKqzoLw9yXsOMmgtrMU4gPdUwR4GuIRI6s6z+ndaSYEilQmgdZiIqnuT3l/PFlZ3edGhQwxMIbaRaw5WuGihZZarJyka/H466HEMruseL1VU+RFTDQRaRYFIDLolzxeUVnomfosjXfZeb4jTmooxDroEy638nmRqovfNbyl5y9ruPDhkZlZjFF23SD4pBybIHRA8UHfvHA3sc4kxG5g1yJ+bhnHWKyBEFKI5ZT9XR18yMHPvHIzun3bds9+zeP7pr+24d3Tmcf3jXzocd2zXzkoZ0z/7hnvPCbpphFzNBGMUvUurKkNHWRvs7Eua98zsn//JbrN3uZI5wQHJL9zzu96zUdLbGU1oGWLxvIwfd1MM0jSPUXjNGpRZ+RRVufvB2dPsK1bJmjIbSZr8UtSfuy89Z1rw8YCuJInepxISfng/bVH9y55/oDM5UHHVsKpevtq+akouo+dUFpjfpCMbkFrGLF1y1J5+XPuaD3otwixVZ+FywcZX3nlv23FcrevU0xS0iYMeCiPic+vCbkKa7r/RJFcEqAiJVjC5qa824cH0ch6Hg6KI2Ksll9+vLmU+O2SJddnynA6EKubOgENbMG2DfiT6y0ZqW1Dr6yr7VJD9mMKfY1zCx7zfWX0to3jRghBjuPuE2+0qo9FbPWL29/Nw6jtao80qH0fVCQq6WDYS+41gwKCvNBN9FSvGrUwZvu2P0/oxPlO+OOFEY2liPFnppjF6WKr05f3fqsd7yi/4fxJizP5+EPD6dlOE7lkI4UEJmBAYsAzuZGqi+5dNXQZWf23ZCM28LztUkDhAjWRn2erRSEiqtox1jpQwAKQ4eeuRb0YtQ3hJqAvAZLAiTB/Z9f7vzQDbds/8f/vHnrP3315m3/cMNPtm38+k+2ZW64Zfv7h3+2/X0/vnPPSybn3GnbEtCaddjsEx6TEJAl1/dXdCWvee4zll9pJr0+6bNLgSRkU0vSeUfg/AQQDiw0jl8IgmawVsEaDNeaZp8Rrjn2faV8rbWPYG0C8IngE1Ht58BcGxtPZLIxzayScSve3eG8O6g90JEWqo4XX5NHRiAAVHZPlD7UmnSGJZFWkYgqqmIV9udz0Pcxr1vCAORsS1v0tiX/DsDzg0mKv09+NYxWvbmK/08dzfyN0LEx5vNWg4dACFF7Nmr0NBCxJUgWyl5xbKLysbB4eKhoYCiXQ//6zle1phy7WPF9SWSpwEGEGKjWDNuWwrGEiOC7mDenhYMCRXTESWTPrvNnGW416K767W1dVn3Nna2x15y9NpkJpmz+VmHS9bUEh4UxxrxjIoIAwbEkiDkGgL+4+R5vae9TlghQj+ycyS7raPpB3JGsFAeTFSKFNHMRZMn11emr2gbf+fKzb7/3kQPXDg3lhqP38oPXGcxzw4YeTqf7WYiszjIYBsPtftNVp71//cqWd8UdiVLFZwRZTCAkDa4vAZWIWXLkialf/vTuPd8LoJqDQiBMrOsDOSlS46AoZ1xcuGF58tr+S2dyW7bI/u7uefdhsmmP/NSPtu7etnvmfees7/qcIFKR8zaNBCAoxSIRs8S6vuZP3wJcBKRLQO6QMMDAACTl4b/omSv+qL05ttp1lZIiULqKqN5pDVgWkeUIOS/yjji2eeNhONo9RjWWTNh9VqmamNfwew2U4PvMzQnr1Wt7k9lcrjh+qEK59VRGX0Er5rd7WmP5rtamAbfsKYooyOtIQ0DIleMF/t4wBEiWKr5qTTnPu+K85X+cy+W+dyRUh9+xaFUDoJ/dPfq9lw+cNNqadJZXPRVU4utVzJDmooN+QQr4mcaZsYrHLGv3WOVHYV/+kNn1DxoNxOPx1am4fItSDBlOo+R5veFsWwLTBXc7M+4QBEvrGnRpg8iXAh4Y2jzr2txGCjIozVKHnR7Mngb6l7UnnqGDm1qfMW/OruL5fmvSSZ21btlr7t++7eNBN82847elEb8mAZDC/GgrYJNqZpRc3bZ8eXNnixVz3EpZV31tO5bwSgROMEgzU9USPgAkA58YqjJpZvKD6Mh2tOXZwt++vTgWruvguv5wWUf8Kxec1v06X3k+a1gBlaueUhvYRBYqnlrVlVzTkYp9a8Pa9j9/YnTuO3c9PL1p1/jstmAWVdTazz2t/Yyz1nS+eGVP4s+XdyZXVj2ly64fFPcjhZp6kYXjtqTx6UrpgccPvJUIHpmGi4PPqNKm4l1X5A+08MJI01RAuThREgGNkQ/iTPyA/vb5ZR1NLz2pr+X5hYqnKKRQBmV1KUiUXc/vam06feiKkz88nMu963Cj1wcHMzqfz6KzLf5OMLPSGlKKBU6SOOYQZgrViUpV/9yS5Pm+JhLsCUgfYMsgBazNYZBkMLHSQpvDYjIOlALS/6rmhHNJbeBwQC7wlPZTTU7raatbr96+v/gvAwOQ4RDPp8WpBq4CAPSOvaVMMm5vAkC1DouINGCtQyDYUaRADSsx437NoDKtmZd3NX0QwA8C3cMTojtqqaL7YLGVCiXv3ztaYteRbyrx9S4SMp43nNMOMi5LMxQ4WMCK9x4ofxr1vnw+CI1KUA7qyjM7rmprjve51aD1b0EUKgQxGOKhx2feesdDY7cswTn2XfPSMx4zEzCZiQK6YVApYA1R9TU3J+z3Avjyxnx+emEzQNy2DGmKIxFxGGUZfNkqVnys6k2+++ruk95qdAJC8lM45i4QAguGL9a0Rbk+AppAggTYklLOlaoTX5/Yce7OmZkpmKm1OuD9vr0l6fSvXd58kVv1fSmkFWLMApFhgMEstpgtcdqqthef1Nv84g1rO6puVT+ome9zq8r1lI7FbNEiBJ3fknBO7myJQWmgUPaUYa5RMI66TqGqPdSW8DXDHnli+v/d9dDUlsM5rWCzFCGmGDaLhBmRZqPgrJRGifymJ8H5NDPo4g2z17Sl4psTTTLpVjUbzYq6Eh1AsuR6/vKuxNsvP3fZzfl8/ocHY6QEKmnq4jO6Lk/G7MvLVaVBJHXU25nbrYlI7jlQvvbn945+eQnWZfylz16ztTlhL3c9XcNPmSFcT0Ha8q0APpXP46At89ZTHH0pc/H25Xs6Yv+7rCNxVdn1g4aAIKqIUDnCaDXqbGueFiQLJU+lEvaFz79w+Z/ncqNf+n2LVkPazhP7Kl9oa3beG3dkQus6DTAUpgkneNRGFAdFirgj5cRs5de3bdm/ic30nsPQqLLWqu7kG2GUjmtiJ+HiVYp1zJZifKb88B0Pjf3y55kBa9OmmrL74q0fciib2ztVcG/qbI0P+cr3GbAofPBMdCdcT6mu1vjyl1yy6k/o9l1fWeggqpYSUgSesl59qI/DDiCLmC1tQWSTqE0bDZ1lMIWA6gIiNcnF+vUVwhTaYo4EwC4tYG9uzGaJCIXb7x57afxiecfKnuSqStX3Q42D+iAhE1UDEEozihVfEQE9bU2ObYnzpaDzo4VGpRmup+F6vq80gsp1bQIxokkuEWBJ8iwp7M2PHPjM92/f+akna54wcR7pUG+FwwnIFIXcDDQR04fXpM0CetPggHXHSH7r8q7Ehzac1P4xT2hfM1vRdB0A+T6LuCPFur7mT9z6m3354f5MhTAf8x3uzzAhi1W9qbfGHImy62tBJCK9HQCYHUvK6YI7tW178bvDw2l5y0e3i+euXasBYMvYGB1sjR4KLFw2d6/16Zu3Vsqu/6X25tgHq75SzCTYFC1E1dOqybHWX3pOz4tvu2/sOwfzOdZT7inM2dBjo3N/35xwXmRLI7AQltui2BzPawaoNwdwBEgvuYrbW+PXArhhcBBePv97Fa3qADIZPW116hvNCfuNJdf3iciq4VXRKrOJ7mpbuGZgfLr6BQAYGiKBg/Bzw2jguRes+KP2lHNepaq0bZnpp3XSZdAaRYRCqfpvACqbNsE6immg0c8FANq1r/zR3rbEK2yLpOa6WhlF0lEpiFd0J94O4OuDg4N+Pp+vLRO/4tvMLKMSiVrreVUCo4bG0GCmQCZA6BCCNkvFq8neUaTgE3E8gqAVs89MZVd5tpR6oUNJvwIyl5sYtRJ42RXnL795RXeyo1j2fCGMEE0k6o3ix5IZcD3FblWxECauqHE4GaSM1rUlFkxpVTpsS2VoxdqyiG1L2nc/Ov61b/x0+9uPtOuQhElwxAJFmFo0GIz1pfiTP1f5YOLDUC73iZakPbSsPXFR2fWVkCKIrs11loKE6ynV29F0yiuuWPMRymbfuWDDFJTN8rnrO/pbm2MvNaJtJHkBRqqYVVyQNVfxv75zZmZqy2fGrOs3b/au37z5qDNEADQ6Xfhyqsm61pLSCVhiNW0jIQjJmP3XAL4XNAM85ZSqhT5VpdNp8cDWyTum59wvOLaUwYaM+kNVXzg16lWEx1qr6BJJ1/V1kyNPe+6FK95r1PDTAr9HFo45GZ2ofKJU8X0CSdb827XFCN9Ta0M7my1Wn/j5vaM3mAmxBycVhWT/3o74X4MIZp4X5k1kUFqzFCSnC+7Mlq1G3epYx4KEAta/eGDvPVNzlV/alhGwRqRbJ3Dnsuz63NkSP/8Fz1h5RTab1VHytZLCcO5DEfRI0wgW4PIBQYLYNNuGzKEaDG2q6ERB4Fv7Q4LCoJVE8PsTBxFoCTOxux6ZuPsn94y+YPdYcVtzwrEsQT4z65q+ReSehVQCSxJZlhBklMDMi0iSICGDzot5NKFI3UFr9h1bCreq5V0PH/i7r/94+9WcyVCAnz+pIwwa5uYVcqL/G4qkOb48kk2Ut+RyTID/8OPTb5sre660BMJpFjXpyPpMKLWqO3XN5ef3PTsfYQOEI9HXL29+fUvCjjNDCTFfCIwBSBJyaq5S3bFn6t+AukD6sQUyEPc/OvN4qeJ/27aIwKzD6yPIiN2n4vbF557W/kwicHrBWEnxNDkKZgZt3Tf3kblSddaSRMxmOB+o7khrrADUq3JR/lhQ9aSqp7mj2Xn7+vUdLcNHMZHzBDeVyUDc/fD+Bwsl77ammEWSSIXSdtFotU74hpaSMDXnfQ2AO3io0dOBsv8l/d3ntiTsy8ummixrmFqQJktBqikuUShVc48eXt1qUbZpk9G4HJt0P+56GqyZaltq0OgQ3GeO2ZJP6ku+C6hNi60VqrSRbZ8nwoOoKA8hMsEzOvKkjkUy5k/5peg3w1lqdGSbRToNee8jE3d/6X+2Xj6yY+rbILIScUsEfQ2a58nxBZN9mWqc7ZDetDBqjpL6mZm11koScSrhWPuny+P5+/a97hu3bPtgRJzkiO+RiOAZNI+rUfuOEJY6osw2C+jLBwasOx4+cM/OscI/SkFSaVZ19a7ajDKqehqOJeUpfc2fBxBLI22aUPJ5taY7saytOfZGTzEzQ2odhSXYaLHagqYL1V/cu212ayaTWRqxmgAbmJgtf9L1tBEyjkTyBNbxmERva+IdwXOEp92pAtBDQ2mxZdvUrqlC9Z8sSwhmI1ZVn7IaITMHwHRUGxL16p9QWqtUk71sfWf8/wXtq4s5rxPeAYfNADNF/99U0E1negOZIy3NDIAFkY5ZUpQqXmHrZPELUWx2oQ2Hyv69yTfZlmBPa59AmshU75Vm7fmGpl+uKLV3ovpZs+aWhr4WjhP/wa933TI56+6MORIB1zWsj5gXiMpVX7cknRdceGrnMyib1ZtCGTYXYB0ZJmFmTWoA2sipkvmeZq00a9/MKtO1zzAVYQ1mzZo1GJoiyw+AhjaiU4JIU/C+dJh5TaFjnSiXRz/33YdfcfsD+964f6r8aMyRViyY3ulrrdjgFEzRKDEqZ0d1XdOQfcEMLQDftgSlmmxZrPj4zaMHhr9xy6OX/HTz6H9mBgasQCjniB2qFGbdWERs9HBZI2ykAgfnC+V7Qh35vTUwwPdv2/UPE7OVzS0JWzKzLwiaiLSg4B4RRKnieR0tsf4/uXTVh4dyOTX5wvU2AD771K5XtDXH2rTSviXJQCMMzSaZ0oIIVV/x5Jz3MfOcZJfkWc4ZZVK686HJewql6q8tKeAr7ZtOUNYIpq42OfKlp61pPSkosImn26kil8vpTAZi5KFdn54uVPdZkqTSZtxJXWWH53H9gPliKxRUQJkhy67Pban4W887rXN5MBng9yZazeWM88nft/cHsyXv8aaYZcVsSTFbkG0JsqUgKYgs81U0xaWYLfnf2bp1cvdvjTeJbKhDuZw6Y03reR0J5y1Ks7AE2UJASCGEbQkRc6SwpBDNCUtOF6ubb71/9N5MJiOWUIiGN5ooujhTqH42bksRdywZd6RwLPPZthTCsoTQGrIt6dBZ6zreDgCDgwNmPWiQZZETs4VwbCmbYpZoikkRs6VoikkRd8zf47b5GrOFaHKkiMcs4ThSSEsIKUlYlhC2JYWU5t9SkrAtIRxbCNsWwnGkcCwhHUcKW5IDTD7pPQMgOJMR//2Lnf/x4f/8zQW/2rL/ul1jxa2aWSTjtow5lgEaAcXMvtba12CltdZas/aVVtDsg6BIgB1LUiJuiaa4ZZUqfuXRPTPfz/9m7xVf+uFjr9w97m5NpyGPBufWGjHHlkJawnYsIRxbiphlrpVjS2nbQoAopp1FjagOBz9WH9sz/Y5SRVGTY1mWJYRjCXNvLSFsS5Alhe37Gif1tfz1Hz1r9aWf/NHW6tr29tbetvhfCSJIKWzbEiJmSeGYYxKOJUSyyZazRW/bL+/fd0swuHPJ+uYCAWtvrqI/aUkSjiUt2zJr0TKClaK9OeasW556b1AjoKevUBW56CMjENunMHNasfrBZDzxRRMd8DxtVUQKUyGXlWt4CoU0Dap62k8l7Pa+jsT77sXE24MxI0eEAf0uONahNARyqBYq3ieaE/b7PKUUiCwEwkAGChEkCHpmztP7J0ufx2FGT6fTacrlcjipt/kSxxHjbtV3OdCOAgNSkg54kFx2lZgqGHWrkZGRJd2sAmyWtmyd+Pfu9vjVrUm73UTHIbHajORlkFZKy7gtnnnaqqbl2Wx+FACk4krFVTs1sx1Et6aDsZaucaAHasIvEZSjhIESOTLevlbrCuZ6cX2KARERCwZgCSFKVTWxTHbrSYw/qb+ibBYDAwPWrfl84YafbP8wgI9ddcnqFy1rj/9Ze0vswpYme2VLypHhgMKFCzMkpVeqChOFysxMsfrQdNG7+cFtk9/c/OjEwwAQpPuLVl3bsMFUxctVf3S6WB2tuMonsAymfuvwYRSAqHqqQGy7iw0GgkLr7au7m69b3pV4S6WqvXAAYCT6hmLmuC3jqSb51wT8n4GTYhdblmgtlKu7AKKQy2w0QliASDNDzha9zwDwh4bSEsgtmb5DKMM5snvv99pTq++KO3KN1lwlmHqDBitdZhtMz+rtRTKXQxGR1pen0yiTAWWzcF5++Zr7kk32KZWqMqOMA+caSsixrokjz3sKOGhxZWbl2ELumyi9Pn/f/q+caALUS2kdHWhhBmndSpY1UzvHkIU2MQENoHiEVXiZyyEJ07IX3WBCBCvET8tPwanZ3UBsvP7Z84q9AGR3N2hwEOXove0EmifCVL1+vAuHRPICyIeiqCnmN9/Mg1kj1yEq4FRc7FofTqfFK2/MqUg9qPXSDd0n9XYkzksmrNObm5xUyfU3gJFSWrMtxeMaGK1U/J2Fqn/XnfdObB0vlfbVTiiTERuRxRKMAxIAEguuhY6ce/jvo1oDXIf7UyGUDBx0Lpz9rJUrvTt27y4HTABnwX2qqb52dkJMTIABFJ6CdSlaW1tbZ2ZmPAC6D8Beczx28NyUMU/4+mm20Pk977zlL+nrSXzPrSoFQk1sNyxWcKgcHilkhXfM16yaHCkLFf/Om36161knytypp3vDWuIo/HhT1X6fqHCHPc90GmJ4OMNCZDUv8owFET54+eUW8nn9uyAOtHDD/x1cN4t+/xMCdwyd4P+5dM1trc3OJRXXCO5GxzZEK7NRicCgrVHFbElPjBdedNeW8Zt/n6PURdw3fhrf73ie18GO5elYx0txPSiTAY2MpKl/bIw2XNPD6fSwBgApBCt9ndi4cZPYMNLDOeTC1mX+HVlTS3F/T/R1uTDbOXGcaugELzu795mrepK/0oYrKerUlwiBW9cLWZoZWrFqiks5U/Bu/snde17YiFIb1rCGPZ12QkjmjYyYMSI/+nlx1+qexLnNTc4Zvq9VIAIRdE7UGwNqrICQGSDI3ztefO3eyfKenjzEyB9GGtmwhjXsBLQTpvsolzMB6eR49a8rnqqAiHzF7CtTvTUTADBP2V1r7SfilpgtVr9zz9bJO9JpiNyJNSqFGkusYQ1rONWny/RQGuKObeNbZwrV/4jZQoBZ6YjSfVSNhxkspRBVTxf3jrtZANSfO+Ei1EbE3LCGNZzq0xqtagZo5/6pvy+UvWkhSdTaV8ERGhWglFZxW4pCufrVkZ2TI+k0xO9SNbRhDWvY76edcGNIRtKQt/7Km13elYw3J+wrPF/XhZmDPmzNYCGIfKVndowVrx6frswOjTQiw4Y1rGGNSPWg0WomA7Hzicq/lir+LsfoAphZqhRRYbKkmC1WP/nQE9M7htJYGiGFhjWsYQ37fYtUw+O69+FyeXl3opiM2y+pGlEPEYy+1Y4thFvVo4+OF1/7rhm3+tmRRoTasIY1rBGpHtLyeSN39/N79n6lUK6OSEHS87UKolS2paBCpfqRnTtnpgK1ooZTbVjDGtZwqocxDuTuqhNz1Y3h5E2ltbalEIWyt/XRffu/kslAhMIHDWtYwxrWcKqHsVCT8tcj47lSxb/NlkJqzUozaGrO/cD+/SgGjrcRpTasYQ17uox+Z5yq8azmy8RsJRuov8tSxfvlnQ8d+PYfQH9/wxrWsBPf+HfKqZp5VpC/2Tr5k7Lrf8+xpSiVveuA35+JqQ1rWMMa9pRaMFSLLji1+7Jnn92bO1TI3bCGNaxhDTs6azjUhjXsD++Z/5157n+XxjkTo1GYaljDGoFUwxrWsIY17A9+R2jsDA1rWMMadhT2/wEbve4noI/kvAAAAABJRU5ErkJggg==" alt="Valora" style={{ height: "24px", width: "auto" }}/>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn-primary" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => { if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; } setShowNewModal(true); }}>+ New</button>
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
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 500 }}>{p.asset_type}</span>
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


            {/* Trial banner */}
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
                  { label: "Avg PoC", value: fmtPct(avgPoC), color: avgPoC > 0.2 ? "var(--green)" : "var(--amber)" },
                  { label: "Appraisals", value: String(projects.reduce((s, p) => s + (p.appraisals?.length || 0), 0)), color: "var(--blue)" },
                ].map(stat => (
                  <div key={stat.label} className="stat-cell">
                    <span style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".09em" }}>{stat.label}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 300, color: stat.color, lineHeight: 1.1 }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            )}


            {/* Empty state */}
            {projects.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, color: "var(--text-d)", marginBottom: 12 }}>◈</div>
                <p style={{ fontSize: 15, color: "var(--text-d)", marginBottom: 6 }}>No projects yet</p>
                <p style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 24 }}>Create your first appraisal or book a demo to get started.</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn-primary" onClick={() => setShowNewModal(true)} style={{ padding: "12px 28px", fontSize: 13 }}>+ Create First Appraisal</button>
                  <button className="btn-ghost" onClick={() => window.open(CALENDLY, "_blank")} style={{ padding: "11px 20px", fontSize: 13 }}>Book a Demo</button>
                </div>
              </div>
            )}


            {/* Filter tabs */}
            {projects.length > 0 && (
              <div className="filter-tabs">
                {["all", ...ASSET_TYPES].map(f => {
                  const count = f === "all" ? projects.length : projects.filter(p => p.asset_type === f).length;
                  return (
                    <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                      {f === "all" ? "ALL" : f} ({count})
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
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 600, letterSpacing: ".04em" }}>{p.asset_type}</span>
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
            {/* Team Activity */}
            {hasFirm && (myTasks.length > 0 || myNotes.length > 0) && (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", marginTop: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-m)", textTransform: "uppercase", letterSpacing: ".1em" }}>Team Activity</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className={`act-tab ${actTab === "tasks" ? "on" : "off"}`} onClick={() => setActTab("tasks")}>
                      Tasks {myTasks.filter(t => t.status !== "done").length > 0 && (
                        <span style={{ marginLeft: 4, background: "var(--blue)", color: "#fff", borderRadius: 8, padding: "0 5px", fontSize: 9, fontWeight: 700 }}>
                          {myTasks.filter(t => t.status !== "done").length}
                        </span>
                      )}
                    </button>
                    <button className={`act-tab ${actTab === "notes" ? "on" : "off"}`} onClick={() => setActTab("notes")}>Notes</button>
                  </div>
                </div>
                {actTab === "tasks" && (
                  myTasks.length === 0
                    ? <p style={{ fontSize: 12, color: "var(--text-d)", textAlign: "center", padding: "20px 0" }}>No tasks yet</p>
                    : myTasks.map(t => {
                        const priColors: Record<string,string> = { low: "#3ddc84", medium: "#f0a429", high: "#f4645f", urgent: "#a78bfa" };
                        const done = t.status === "done";
                        return (
                          <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: priColors[t.priority] || "#f0a429", flexShrink: 0, marginTop: 5 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, color: done ? "var(--text-d)" : "var(--text)", textDecoration: done ? "line-through" : "none", marginBottom: 2 }}>{t.title}</div>
                              <div style={{ display: "flex", gap: 8, fontSize: 10, color: "var(--text-d)", flexWrap: "wrap" }}>
                                {t.projects?.name && <span style={{ color: "var(--gold)", opacity: .7 }}>{t.projects.name}</span>}
                                {t.due_date && <span>Due {new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                              </div>
                            </div>
                            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 4, background: done ? "rgba(61,220,132,.1)" : "rgba(240,164,41,.1)", color: done ? "var(--green)" : "var(--amber)", flexShrink: 0 }}>{done ? "done" : "open"}</span>
                          </div>
                        );
                      })
                )}
                {actTab === "notes" && (
                  myNotes.length === 0
                    ? <p style={{ fontSize: 12, color: "var(--text-d)", textAlign: "center", padding: "20px 0" }}>No notes yet</p>
                    : myNotes.map(n => (
                        <div key={n.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                          <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5, marginBottom: 3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>{n.content}</div>
                          <div style={{ display: "flex", gap: 8, fontSize: 10, color: "var(--text-d)" }}>
                            {n.projects?.name && <span style={{ color: "var(--gold)", opacity: .7 }}>{n.projects.name}</span>}
                            <span>{new Date(n.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                        </div>
                      ))
                )}
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
                    <><span style={{ width: 12, height: 12, border: "2px solid rgba(6,7,10,.3)", borderTopColor: "#06070a", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />Importing…</>
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
                    {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
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
