"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState, Suspense } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
const CALENDLY = "https://calendly.com/hello-valoraplatform/30min";
/* ═══════════════════════════════════════════════════════════════════
   VALORA — PORTFOLIO PAGE
   Was previously embedded in /dashboard. Now a standalone page.
   /dashboard is Copilot-only; /portfolio is project management.
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
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;cursor:pointer;display:flex;flex-direction:column;gap:14px;transition:border-color .2s var(--ease),transform .2s var(--ease);animation:fadeIn .3s var(--ease) both;position:relative;}
.card:hover{border-color:var(--border-m);transform:translateY(-1px)}
.card.trashed{opacity:.55;border-style:dashed}
.metrics-panel{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;background:var(--bg3);border-radius:8px;padding:12px;}
.metric-cell{display:flex;flex-direction:column;gap:3px}
.metric-cell__label{font-size:10px;font-weight:600;color:var(--text-d);text-transform:uppercase;letter-spacing:0.08em;}
.metric-cell__value{font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-0.01em;}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200;animation:fadeIn .15s var(--ease)}
.modal{background:var(--bg2);border:1px solid var(--border-m);border-radius:14px;padding:28px;width:460px;max-width:calc(100vw - 32px);box-shadow:0 20px 60px rgba(0,0,0,0.4);}
.inp{width:100%;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--font-mono);font-size:13px;font-weight:500;outline:none;transition:border-color .2s var(--ease),box-shadow .2s var(--ease);}
.inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-bg)}
.inp::placeholder{color:var(--text-d);font-family:var(--font-body);font-weight:400}
.inp-label{font-size:10px;color:var(--text-d);text-transform:uppercase;letter-spacing:0.12em;font-weight:600;margin-bottom:6px;display:block;}
.inp-group{margin-bottom:14px}
select.inp{cursor:pointer;font-family:var(--font-body)}
.btn-primary{background:var(--gold);color:var(--bg);border:none;border-radius:8px;padding:10px 20px;font-family:var(--font-body);font-size:13px;font-weight:600;letter-spacing:-0.01em;cursor:pointer;transition:background .2s var(--ease),transform .1s var(--ease);display:inline-flex;align-items:center;justify-content:center;gap:6px;}
.btn-primary:hover{background:var(--gold-l)}
.btn-primary:active{transform:translateY(1px)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border-m);border-radius:8px;padding:9px 18px;font-family:var(--font-body);font-size:13px;font-weight:500;cursor:pointer;transition:all .2s var(--ease);display:inline-flex;align-items:center;justify-content:center;gap:6px;}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-danger{background:transparent;color:var(--red);border:1px solid rgba(244,100,95,.35);border-radius:6px;padding:6px 12px;font-family:var(--font-body);font-size:11px;font-weight:500;cursor:pointer;transition:all .2s var(--ease);}
.btn-danger:hover{background:rgba(244,100,95,.1);border-color:var(--red)}
.btn-demo{display:flex;align-items:center;gap:8px;background:transparent;color:var(--gold);border:1px solid var(--gold-border);border-radius:8px;padding:9px 14px;font-family:var(--font-body);font-size:12px;font-weight:500;cursor:pointer;transition:all .2s var(--ease);width:100%;margin-bottom:2px;}
.btn-demo:hover{background:var(--gold-bg);border-color:var(--gold)}
.menu-btn{background:none;border:none;color:var(--text-d);cursor:pointer;padding:6px 10px;border-radius:6px;font-size:16px;line-height:1;transition:all .2s var(--ease);position:relative;z-index:2;}
.menu-btn:hover{background:var(--bg4);color:var(--text)}
.card-menu{position:absolute;top:14px;right:14px;z-index:10}
.dropdown{position:absolute;top:100%;right:0;background:var(--bg2);border:1px solid var(--border-m);border-radius:8px;padding:4px;min-width:170px;box-shadow:0 8px 24px rgba(0,0,0,.25);animation:fadeIn .12s var(--ease);}
.dropdown-item{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;transition:background .15s var(--ease);width:100%;border:none;background:none;color:var(--text-m);font-family:var(--font-body);text-align:left;}
.dropdown-item:hover{background:var(--bg4);color:var(--text)}
.dropdown-item.danger{color:var(--red)}
.dropdown-item.danger:hover{background:rgba(244,100,95,.1);color:var(--red)}
.stats-strip{display:grid;grid-template-columns:repeat(5,1fr);background:var(--bg2);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:24px;}
.stat-cell{padding:16px 20px;border-right:1px solid var(--border);display:flex;flex-direction:column;gap:4px;}
.stat-cell:last-child{border-right:none}
.stat-cell__label{font-size:10px;color:var(--text-d);text-transform:uppercase;letter-spacing:0.12em;font-weight:600;}
.stat-cell__value{font-family:var(--font-display);font-size:22px;font-weight:700;letter-spacing:-0.02em;line-height:1.1;font-variant-numeric:tabular-nums;}
.cards-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.nav-item{width:100%;display:flex;align-items:center;padding:9px 12px;border-radius:8px;font-size:13px;font-weight:500;color:var(--text-d);background:transparent;border:1px solid transparent;cursor:pointer;font-family:var(--font-body);transition:all .15s var(--ease);text-align:left;margin-bottom:2px;letter-spacing:-0.005em;}
.nav-item:hover{color:var(--text);background:rgba(255,255,255,0.04)}
.nav-item.active{color:var(--gold);background:var(--gold-bg);border-color:var(--gold-border);font-weight:600;}
.nav-item.danger-item{color:var(--text-m)}
.nav-item.danger-item:hover{color:var(--text);background:var(--bg3)}
.nav-item.active-danger{color:var(--red);background:rgba(244,100,95,.08);border-color:rgba(244,100,95,.22);font-weight:600;}
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
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg2);border-top:1px solid var(--border);z-index:100;padding:6px 0 env(safe-area-inset-bottom,12px);}
.bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;background:none;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);font-size:9px;letter-spacing:.04em;text-transform:uppercase;transition:color .2s var(--ease);}
.bottom-nav-item.active{color:var(--gold)}
.bottom-nav-item svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.mobile-topbar{display:none;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--bg2);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50;}
.demo-banner{background:var(--gold-bg);border:1px solid var(--gold-border);border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.filter-tabs{display:flex;gap:0;margin-bottom:20px;border-bottom:1px solid var(--border);overflow-x:auto;}
.filter-tab{padding:10px 16px;font-size:12px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;color:var(--text-d);cursor:pointer;font-family:var(--font-body);transition:all .2s var(--ease);white-space:nowrap;flex-shrink:0;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:-1px;}
.filter-tab:hover{color:var(--text-m)}
.filter-tab.active{color:var(--gold);border-bottom-color:var(--gold);font-weight:700}
.pill{display:inline-flex;align-items:center;font-size:10px;font-weight:600;padding:3px 10px;border-radius:4px;letter-spacing:0.02em;}
.pill--type{background:var(--gold-bg);color:var(--gold);border:1px solid var(--gold-border)}
.pill--status{background:rgba(148,156,160,.12);color:var(--text-d);border:1px solid var(--border);text-transform:capitalize;}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;}
.page-header h1{font-family:var(--font-display);font-size:34px;font-weight:700;letter-spacing:-0.03em;line-height:1;color:var(--text);}
@media(max-width:1100px){.cards-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:900px){
  .stats-strip{grid-template-columns:repeat(3,1fr)}
  .cards-grid{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:768px){
  .sidebar{display:none}
  .bottom-nav{display:flex}
  .mobile-topbar{display:flex}
  .main-content{padding:16px 14px 90px!important}
  .cards-grid{grid-template-columns:1fr}
  .stats-strip{grid-template-columns:repeat(2,1fr)}
  .stat-cell{border-bottom:1px solid var(--border)}
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
const ASSET_TYPES = ["BTR", "BTS", "Hotel", "Flip", "MixedUse", "Commercial", "Industrial"];
const ASSET_LABELS: Record<string,string> = {BTR:"BTR",BTS:"BTS",Hotel:"Hotel",Flip:"Flip",MixedUse:"Mixed Use",Commercial:"Commercial"};
const CURRENCIES = ["GBP", "USD", "EUR", "AED", "SGD", "AUD"];
const CURRENCY_SYMBOLS: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$" };
const TRASH_DAYS = 3;
function Portfolio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view") === "trash" ? "trash" : "portfolio";
  const [user, setUser] = useState<any>(null);
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
  const [projects, setProjects] = useState<any[]>([]);
  const [trashedProjects, setTrashedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", location: "", asset_type: "BTR", currency: "GBP" });
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"portfolio"|"trash">(initialView);
  const [openMenuId, setOpenMenuId] = useState<string|null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [totalProjectCount, setTotalProjectCount] = useState(0);
  const [hasFirm, setHasFirm] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlImport, setUrlImport] = useState("");
  const [urlImportType, setUrlImportType] = useState<"Flip"|"Hotel">("Flip");
  const [urlImportCurrency, setUrlImportCurrency] = useState("GBP");
  const [urlImporting, setUrlImporting] = useState(false);
  const [urlImportError, setUrlImportError] = useState<string|null>(null);
  const tier = subscription?.tier || "free";
  const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
  const isTrialing = !!(trialEndsAt && trialEndsAt > new Date());
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
      await loadProjects(session.user.id);
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", session.user.id).maybeSingle();
      setSubscription(sub);
      const { data: memberRow } = await supabase.from("firm_members").select("id").eq("user_id", session.user.id).maybeSingle();
      setHasFirm(!!memberRow);
    };
    init();
  }, [router]);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest(".card-menu")) setOpenMenuId(null); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const loadProjects = async (userId: string) => {
    setLoading(true);
    const { data: all } = await supabase.from("projects").select(`*, appraisals(id, gdv, total_cost, profit, profit_on_cost, irr_unlevered, status, created_at)`).eq("created_by", userId).order("created_at", { ascending: false });
    const now = new Date();
    const active: any[] = [], trashed: any[] = [];
    let totalCount = 0;
    (all || []).forEach((p: any) => {
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
  };
  const createFromUrl = async () => {
    if (!urlImport.trim() || !user) return;
    setUrlImporting(true); setUrlImportError(null);
    try {
      const res = await fetch("/api/urlimport", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: urlImport.trim(), assetType: urlImportType, currency: urlImportCurrency }) });
      const d = await res.json();
      if (d.error) { setUrlImportError(d.error); setUrlImporting(false); return; }
      const projectName = d.name || `${urlImportType} — ${d.location || "Imported"}`;
      const { data: proj, error } = await supabase.from("projects").insert({
        name: projectName, location: d.location || "",
        asset_type: urlImportType, currency: urlImportCurrency,
        benchmark_rate: "SONIA", created_by: user.id, firm_id: null,
      }).select().single();
      if (!proj || error) { setUrlImportError("Failed to create project"); setUrlImporting(false); return; }
      const appraisalData: Record<string, any> = { name: projectName, location: d.location || "", currency: urlImportCurrency };
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
      const { data: appr } = await supabase.from("appraisals").insert({ project_id: proj.id, data: appraisalData, status: "draft" }).select().single();
      setShowUrlModal(false); setUrlImport(""); setUrlImportError(null);
      if (appr) router.push(`/appraisal?project=${proj.id}&appraisal=${appr.id}`);
      else router.push(`/appraisal?project=${proj.id}`);
    } catch (e: any) { setUrlImportError(e.message || "Failed to import"); }
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
    const project = projects.find((p: any) => p.id === projectId);
    if (project) { setProjects((prev: any[]) => prev.filter((p: any) => p.id !== projectId)); setTrashedProjects((prev: any[]) => [...prev, { ...project, deleted_at: now, _daysLeft: TRASH_DAYS }]); }
  };
  const restoreProject = async (projectId: string) => {
    await supabase.from("projects").update({ deleted_at: null }).eq("id", projectId);
    const project = trashedProjects.find((p: any) => p.id === projectId);
    if (project) { const { _daysLeft, deleted_at, ...restored } = project; setTrashedProjects((prev: any[]) => prev.filter((p: any) => p.id !== projectId)); setProjects((prev: any[]) => [{ ...restored, deleted_at: null }, ...prev]); }
  };
  const permanentlyDelete = async (projectId: string) => {
    await supabase.from("appraisals").delete().eq("project_id", projectId);
    await supabase.from("projects").delete().eq("id", projectId);
    setTrashedProjects((prev: any[]) => prev.filter((p: any) => p.id !== projectId));
    setConfirmDelete(null);
  };
  const emptyTrash = async () => {
    for (const p of trashedProjects) { await supabase.from("appraisals").delete().eq("project_id", p.id); await supabase.from("projects").delete().eq("id", p.id); }
    setTrashedProjects([]); setConfirmDelete(null);
  };
  const filteredProjects = filter === "all" ? projects : projects.filter((p: any) => p.asset_type === filter);
  const totalGDV = projects.reduce((s: number, p: any) => s + (p.appraisals?.[0]?.gdv || 0), 0);
  const totalProfit = projects.reduce((s: number, p: any) => s + (p.appraisals?.[0]?.profit || 0), 0);
  const avgPoC = (() => { const v = projects.filter((p: any) => p.appraisals?.[0]?.profit_on_cost != null); return v.length ? v.reduce((s: number, p: any) => s + (p.appraisals[0].profit_on_cost || 0), 0) / v.length : 0; })();
  const avgIRR = (() => { const v = projects.filter((p: any) => p.appraisals?.[0]?.irr_unlevered); return v.length ? v.reduce((s: number, p: any) => s + (p.appraisals[0].irr_unlevered || 0), 0) / v.length : 0; })();
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
          <button className="nav-item" onClick={() => router.push("/dashboard")} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color: "var(--gold)", fontSize: 14, lineHeight:1 }}>◆</span>
            <span>Copilot</span>
          </button>
          <button className={`nav-item ${view === "portfolio" ? "active" : ""}`} onClick={() => { setView("portfolio"); }}>Portfolio</button>
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
          <button className={`nav-item ${view === "trash" ? "active-danger" : "danger-item"}`} onClick={() => setView("trash")} style={{ justifyContent: "space-between" }}>
            <span>Trash</span>
            {trashedProjects.length > 0 && <span style={{ background: "var(--red)", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{trashedProjects.length}</span>}
          </button>
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
      {/* ── MAIN ── */}
      <div className="main-content" style={{ flex: 1, minWidth: 0, padding: "40px 40px", overflowX: "hidden" }}>
        <div className="mobile-topbar">
          <span style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:700,letterSpacing:"-.03em",color:"var(--text)"}}>Valora</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn-primary" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => { if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; } setShowNewModal(true); }}>+ New</button>
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
        {view === "trash" && (
          <div>
            <div className="page-header">
              <div>
                <h1>Trash</h1>
                <p style={{ fontSize: 13, color: "var(--text-d)", marginTop: 8, fontWeight: 500 }}>Projects deleted within the last {TRASH_DAYS} days.</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-ghost" onClick={() => setView("portfolio")}>← Back</button>
                {trashedProjects.length > 0 && <button className="btn-danger" onClick={() => setConfirmDelete({ type: "all" })} style={{ padding: "9px 18px", fontSize: 12 }}>Empty Trash</button>}
              </div>
            </div>
            {trashedProjects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: .4 }}>🗑</div>
                <p style={{ fontSize: 16, color: "var(--text-d)", fontFamily: "var(--font-display)", fontWeight: 500 }}>Trash is empty</p>
              </div>
            ) : (
              <div className="cards-grid">
                {trashedProjects.map((p: any, i: number) => {
                  const latest = p.appraisals?.[0]; const sym = CURRENCY_SYMBOLS[p.currency] || "£";
                  return (
                    <div key={p.id} className="card trashed" style={{ animationDelay: `${i * 0.04}s`, cursor: "default" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="pill pill--type">{ASSET_LABELS[p.asset_type] || p.asset_type}</span>
                        <span style={{ fontSize: 11, color: "var(--red)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>Deletes in {p._daysLeft}d</span>
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, fontFamily: "var(--font-display)", letterSpacing: "-.02em" }}>{p.name || "Untitled"}</h3>
                        <p style={{ fontSize: 12, color: "var(--text-d)", fontWeight: 500 }}>{p.location || "No location"}</p>
                      </div>
                      {latest && (
                        <div className="metrics-panel" style={{ gridTemplateColumns: "1fr 1fr" }}>
                          <div className="metric-cell">
                            <div className="metric-cell__label">GDV</div>
                            <div className="metric-cell__value" style={{ color: "var(--accent-gold)" }}>{fmt(latest.gdv, sym)}</div>
                          </div>
                          <div className="metric-cell">
                            <div className="metric-cell__label">PoC</div>
                            <div className="metric-cell__value" style={{ color: "var(--text-m)" }}>{fmtPct(latest.profit_on_cost)}</div>
                          </div>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn-ghost" onClick={() => restoreProject(p.id)} style={{ flex: 1, fontSize: 12, padding: "8px" }}>Restore</button>
                        <button className="btn-danger" onClick={() => setConfirmDelete({ type: "single", project: p })} style={{ flex: 1, padding: "8px" }}>Delete Forever</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {view === "portfolio" && (
          <>
            <div className="page-header">
              <div>
                <h1>Portfolio</h1>
                {projects.length > 0 && (
                  <p style={{ fontSize: 14, color: "var(--text-d)", marginTop: 8, fontWeight: 500 }}>
                    {projects.length} project{projects.length !== 1 ? "s" : ""} · {fmt(totalGDV)} GDV · avg {fmtPct(avgPoC)} PoC
                  </p>
                )}
              </div>
              <div className="page-header-actions" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-ghost" onClick={() => router.push("/dashboard")} title="Start a new deal with the Copilot">
                    <span style={{ color: "var(--gold)" }}>◆</span> Copilot
                  </button>
                  <button className="btn-ghost" onClick={() => setShowUrlModal(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                    Import URL
                  </button>
                  <button className="btn-primary" onClick={() => { if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; } setShowNewModal(true); }}>
                    + New Appraisal
                  </button>
                </div>
                {!isPro && (
                  <div style={{ fontSize: 11, color: "var(--text-d)", fontWeight: 500 }}>
                    {totalProjectCount}/{activeProjectLimit === Infinity ? "∞" : activeProjectLimit} projects
                    {totalProjectCount >= activeProjectLimit && <span style={{ color: "var(--amber)", marginLeft: 4, cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/pricing")}>Upgrade</span>}
                  </div>
                )}
              </div>
            </div>
            {isTrialing && (
              <div style={{ background:"var(--gold-bg)", border:"1px solid var(--gold-border)", borderRadius:12, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--gold)", marginBottom:2, letterSpacing: "-.01em" }}>✦ Enterprise Trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining</div>
                  <div style={{ fontSize:12, color:"var(--text-m)", fontWeight: 500 }}>Full access to all features. Upgrade before your trial ends.</div>
                </div>
                <button className="btn-primary" style={{ padding:"8px 16px", fontSize:12, flexShrink:0 }} onClick={() => router.push("/pricing")}>Upgrade Now</button>
              </div>
            )}
            {!isPro && projects.length > 0 && (
              <div className="demo-banner">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", marginBottom: 2, letterSpacing: "-.01em" }}>Want a guided walkthrough?</div>
                  <div style={{ fontSize: 12, color: "var(--text-m)", fontWeight: 500 }}>Book a free 30-min demo — we&apos;ll walk through your deals live.</div>
                </div>
                <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 12, flexShrink: 0 }} onClick={() => window.open(CALENDLY, "_blank")}>Book Demo</button>
              </div>
            )}
            {!isPro && totalProjectCount >= activeProjectLimit && (
              <div style={{ background: "rgba(240,164,41,.08)", border: "1px solid rgba(240,164,41,.25)", borderRadius: 10, padding: "12px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, color: "var(--amber)", fontWeight: 600 }}>You&apos;ve reached your {activeProjectLimit}-project limit.</div>
                <button className="btn-primary" onClick={() => router.push("/pricing")} style={{ padding: "7px 16px", fontSize: 12 }}>Upgrade →</button>
              </div>
            )}
            {projects.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14 }}>
                <div style={{ fontSize: 40, marginBottom: 14, color: "var(--gold)" }}>◆</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, fontFamily: "var(--font-display)", letterSpacing: "-.02em" }}>No deals yet</h2>
                <p style={{ fontSize: 13, color: "var(--text-d)", maxWidth: 420, margin: "0 auto 22px", lineHeight: 1.6 }}>Start with the Copilot — describe your deal in one line, or pick an asset type and fill the fields yourself.</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn-primary" onClick={() => router.push("/dashboard")} style={{ padding: "10px 20px" }}>◆ Open Copilot</button>
                  <button className="btn-ghost" onClick={() => setShowNewModal(true)} style={{ padding: "10px 20px" }}>+ New Appraisal</button>
                </div>
              </div>
            )}
            {projects.length > 0 && (
              <div className="stats-strip">
                {[
                  { label: "Projects", value: String(projects.length), color: "var(--text)" },
                  { label: "Total GDV", value: fmt(totalGDV), color: "var(--accent-gold)" },
                  { label: "Total Profit", value: fmt(totalProfit), color: totalProfit > 0 ? "var(--green)" : "var(--red)" },
                  { label: "Avg PoC", value: fmtPct(avgPoC), color: avgPoC > 0.2 ? "var(--green)" : avgPoC > 0.1 ? "var(--amber)" : "var(--text-m)" },
                  { label: "Avg IRR", value: fmtPct(avgIRR), color: avgIRR > 0.15 ? "var(--green)" : avgIRR > 0.08 ? "var(--amber)" : "var(--text-m)" },
                ].map(stat => (
                  <div key={stat.label} className="stat-cell">
                    <span className="stat-cell__label">{stat.label}</span>
                    <span className="stat-cell__value" style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            )}
            {projects.length > 0 && (
              <div className="filter-tabs">
                {["all", ...ASSET_TYPES].map(f => {
                  const count = f === "all" ? projects.length : projects.filter((p: any) => p.asset_type === f).length;
                  return (
                    <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                      {f === "all" ? "All" : (ASSET_LABELS[f] || f)} ({count})
                    </button>
                  );
                })}
              </div>
            )}
            {filteredProjects.length > 0 && (
              <div className="cards-grid">
                {filteredProjects.map((p: any, i: number) => {
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
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="pill pill--type">{ASSET_LABELS[p.asset_type] || p.asset_type}</span>
                        <span className="pill pill--status">{latest?.status || "draft"}</span>
                        <span style={{ fontSize: 11, color: "var(--text-d)", marginLeft: "auto", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                          {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div>
                        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 3, fontFamily: "var(--font-display)", letterSpacing: "-.02em", lineHeight: 1.25 }}>{p.name || "Untitled"}</h3>
                        <p style={{ fontSize: 12, color: "var(--text-d)", fontWeight: 500 }}>{p.location || "No location set"}</p>
                      </div>
                      {latest ? (
                        <div className="metrics-panel">
                          {[
                            { label: "GDV", value: fmt(latest.gdv, sym), color: "var(--accent-gold)" },
                            { label: "Profit", value: fmt(latest.profit, sym), color: latest.profit > 0 ? "var(--green)" : "var(--red)" },
                            { label: "PoC", value: fmtPct(latest.profit_on_cost), color: pocColor },
                          ].map(m => (
                            <div key={m.label} className="metric-cell">
                              <div className="metric-cell__label">{m.label}</div>
                              <div className="metric-cell__value" style={{ color: m.color }}>{m.value}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "var(--text-d)", fontWeight: 500 }}>No appraisal saved yet</div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--text-d)", fontWeight: 500 }}>
                        <span>{p.appraisals?.length || 0} appraisal{p.appraisals?.length !== 1 ? "s" : ""}</span>
                        <span style={{ color: "var(--gold)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{latest?.irr_unlevered ? `IRR ${fmtPct(latest.irr_unlevered)}` : "Open →"}</span>
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
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>Import from URL</div>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 22, fontWeight: 500, lineHeight: 1.55 }}>
                Paste a listing URL from Rightmove, Zoopla, Christie &amp; Co, Savills Hotels or similar — Valora will extract the property data and pre-fill your appraisal.
              </p>
              <div className="inp-group">
                <label className="inp-label">Asset Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["Flip", "Hotel"] as const).map(t => (
                    <button key={t} onClick={() => setUrlImportType(t)} style={{
                      padding: "12px 14px", borderRadius: 10, border: `1px solid ${urlImportType === t ? "var(--gold)" : "var(--border)"}`,
                      background: urlImportType === t ? "var(--gold-bg)" : "var(--bg3)",
                      color: urlImportType === t ? "var(--gold)" : "var(--text-m)",
                      cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: urlImportType === t ? 700 : 500,
                      transition: "all .2s var(--ease)", textAlign: "left",
                    }}>
                      <div style={{ fontSize: 14, marginBottom: 2, fontWeight: 700 }}>{t}</div>
                      <div style={{ fontSize: 10, color: urlImportType === t ? "var(--gold)" : "var(--text-d)", fontWeight: 500 }}>
                        {t === "Flip" ? "Residential — Rightmove, Zoopla, Zillow" : "Hotel — Christie & Co, Savills, JLL Hotels"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="inp-group">
                <label className="inp-label">Currency</label>
                <select className="inp" value={urlImportCurrency} onChange={e => setUrlImportCurrency(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="inp-group">
                <label className="inp-label">Listing URL</label>
                <input className="inp"
                  placeholder={urlImportType === "Flip" ? "https://www.rightmove.co.uk/properties/..." : "https://www.christieandco.com/listing/..."}
                  value={urlImport} onChange={e => { setUrlImport(e.target.value); setUrlImportError(null); }}
                  onKeyDown={e => e.key === "Enter" && createFromUrl()} autoFocus
                  style={{ fontFamily: "var(--font-body)", fontSize: 12 }} />
              </div>
              <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 12px", marginBottom: 16, fontSize: 11, color: "var(--text-d)", lineHeight: 1.6, fontWeight: 500 }}>
                ◆ Valora uses AI to infer property data from the URL pattern. The more detail in the URL, the better the extraction. You can always edit fields after import.
              </div>
              {urlImportError && (
                <div style={{ background: "rgba(244,100,95,.1)", border: "1px solid rgba(244,100,95,.3)", borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontSize: 12, color: "var(--red)", fontWeight: 500 }}>
                  {urlImportError}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-ghost" onClick={() => { setShowUrlModal(false); setUrlImportError(null); setUrlImport(""); }} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-primary" onClick={createFromUrl} disabled={!urlImport.trim() || urlImporting} style={{ flex: 2 }}>
                  {urlImporting ? (
                    <><span style={{ width: 12, height: 12, border: "2px solid rgba(15,17,21,.3)", borderTopColor: "#0F1115", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />Importing…</>
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
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: "-.02em" }}>New Appraisal</div>
              <p style={{ fontSize: 13, color: "var(--text-d)", marginBottom: 24, fontWeight: 500 }}>Set up a new project to get started.</p>
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
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn-ghost" onClick={() => setShowNewModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-primary" onClick={createProject} disabled={!newProject.name.trim() || creating} style={{ flex: 2 }}>
                  {creating ? "Creating…" : "Create & Open →"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ── CONFIRM DELETE MODAL ── */}
        {confirmDelete && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
            <div className="modal" style={{ width: 420 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 8, color: "var(--red)", letterSpacing: "-.02em" }}>
                {confirmDelete.type === "all" ? "Empty Trash" : "Delete Permanently"}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-m)", marginBottom: 6, fontWeight: 500 }}>
                {confirmDelete.type === "all" ? `This will permanently delete all ${trashedProjects.length} projects.` : `This will permanently delete "${confirmDelete.project?.name || "this project"}".`}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 24, fontWeight: 500 }}>This action cannot be undone.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-ghost" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancel</button>
                <button onClick={() => confirmDelete.type === "all" ? emptyTrash() : permanentlyDelete(confirmDelete.project.id)}
                  style={{ flex: 1, background: "var(--red)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {confirmDelete.type === "all" ? "Empty Trash" : "Delete Forever"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <button className="bottom-nav-item" onClick={() => router.push("/dashboard")}>
          <svg viewBox="0 0 24 24"><path d="M12 2L2 8.5v7L12 22l10-6.5v-7L12 2z"/><path d="M12 2v20"/></svg>
          Copilot
        </button>
        <button className="bottom-nav-item active" onClick={() => setView("portfolio")}>
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
export default function PortfolioPageWrapper() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#0F1115", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "2px solid rgba(82,196,152,.15)", borderTopColor: "#52C498", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <Portfolio />
    </Suspense>
  );
}
