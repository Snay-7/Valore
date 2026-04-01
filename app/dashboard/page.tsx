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
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:24px;cursor:pointer;transition:border-color .2s,transform .15s,box-shadow .2s;animation:fadeIn .3s ease both;position:relative}
.card:hover{border-color:var(--gold-border);transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.4)}
.card.trashed{opacity:.6;border-style:dashed}
.metric-pill{background:var(--bg3);border-radius:8px;padding:10px 14px}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200;animation:fadeIn .15s ease}
.modal{background:var(--bg2);border:1px solid var(--border-m);border-radius:16px;padding:32px;width:480px;max-width:calc(100vw - 40px)}
.inp{width:100%;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font-mono);font-size:13px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold)}
.inp::placeholder{color:var(--text-d);font-family:var(--font-body)}
.inp-label{font-size:10px;color:var(--text-d);text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px;display:block}
.inp-group{margin-bottom:14px}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:7px;padding:10px 20px;font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:background .2s}
.btn-primary:hover{background:var(--gold-l)}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:9px 18px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-danger{background:transparent;color:var(--red);border:1px solid rgba(244,100,95,.3);border-radius:6px;padding:5px 10px;font-family:var(--font-body);font-size:11px;cursor:pointer;transition:all .2s}
.btn-danger:hover{background:rgba(244,100,95,.1);border-color:var(--red)}
.btn-demo{display:flex;align-items:center;gap:8px;background:transparent;color:var(--gold);border:1px solid var(--gold-border);border-radius:7px;padding:9px 16px;font-family:var(--font-body);font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;width:100%;margin-bottom:2px}
.btn-demo:hover{background:var(--gold-bg);border-color:var(--gold)}
select.inp{cursor:pointer}
.menu-btn{background:none;border:none;color:var(--text-d);cursor:pointer;padding:4px 8px;border-radius:4px;font-size:16px;line-height:1;transition:all .2s;position:relative;z-index:2}
.menu-btn:hover{background:var(--bg4);color:var(--text)}
.card-menu{position:absolute;top:16px;right:16px;z-index:10}
.dropdown{position:absolute;top:100%;right:0;background:var(--bg3);border:1px solid var(--border-m);border-radius:8px;padding:4px;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.5);animation:fadeIn .1s ease}
.dropdown-item{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;font-size:12px;cursor:pointer;transition:background .15s;width:100%;border:none;background:none;color:var(--text-m);font-family:var(--font-body);text-align:left}
.dropdown-item:hover{background:var(--bg4);color:var(--text)}
.dropdown-item.danger{color:var(--red)}
.dropdown-item.danger:hover{background:rgba(244,100,95,.1);color:var(--red)}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:36px}
.cards-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.nav-item{width:100%;display:flex;align-items:center;padding:9px 12px;border-radius:7px;font-size:13px;color:var(--text-m);background:transparent;border:1px solid transparent;cursor:pointer;font-family:var(--font-body);transition:all .15s;text-align:left;margin-bottom:2px}
.nav-item:hover{color:var(--text);background:var(--bg3)}
.nav-item.active{color:var(--gold);background:rgba(201,168,76,.08);border-color:var(--gold-border);font-weight:600}
.nav-item.danger-item{color:var(--text-m)}
.nav-item.danger-item:hover{color:var(--text);background:var(--bg3)}
.nav-item.active-danger{color:var(--red);background:rgba(244,100,95,.06);border-color:rgba(244,100,95,.2);font-weight:600}
.sidebar{width:220px;background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg1);border-top:1px solid var(--border);z-index:100;padding:8px 0 env(safe-area-inset-bottom,16px)}
.bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 4px;background:none;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);font-size:9px;letter-spacing:.06em;text-transform:uppercase;transition:color .2s;position:relative}
.bottom-nav-item.active{color:var(--gold)}
.bottom-nav-item svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.mobile-topbar{display:none;align-items:center;justify-content:space-between;padding:16px 20px;background:var(--bg1);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50}
.demo-banner{background:var(--gold-bg);border:1px solid var(--gold-border);border-radius:10px;padding:14px 16px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
@media(max-width:900px){.cards-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){
  .sidebar{display:none}
  .bottom-nav{display:flex}
  .mobile-topbar{display:flex}
  .main-content{margin-left:0!important;max-width:100vw!important;padding:20px 16px 100px!important}
  .cards-grid{grid-template-columns:1fr}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
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
  const [hasFirm, setHasFirm] = useState(true);

  const tier = subscription?.tier || "free";
  const isPro = tier === "professional" || tier === "enterprise";
  const isStarter = tier === "starter";
  const activeProjectLimit = isPro ? Infinity : isStarter ? 5 : 3;

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
    const active: any[] = [];
    const trashed: any[] = [];
    let totalCount = 0;

    (all || []).forEach(p => {
      if (!p.deleted_at) {
        active.push(p);
        totalCount++;
      } else {
        const deletedAt = new Date(p.deleted_at);
        const daysInTrash = (now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysInTrash < TRASH_DAYS) {
          trashed.push({ ...p, _daysLeft: Math.ceil(TRASH_DAYS - daysInTrash) });
          totalCount++;
        } else {
          supabase.from("appraisals").delete().eq("project_id", p.id).then(() =>
            supabase.from("projects").delete().eq("id", p.id)
          );
        }
      }
    });

    setProjects(active);
    setTrashedProjects(trashed);
    setTotalProjectCount(totalCount);
    setLoading(false);
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
    if (proj && !error) {
      setShowNewModal(false);
      setNewProject({ name: "", location: "", asset_type: "BTR", currency: "GBP" });
      router.push(`/appraisal?project=${proj.id}`);
    }
    setCreating(false);
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
    if (project) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setTrashedProjects(prev => [...prev, { ...project, deleted_at: now, _daysLeft: TRASH_DAYS }]);
    }
  };

  const restoreProject = async (projectId: string) => {
    await supabase.from("projects").update({ deleted_at: null }).eq("id", projectId);
    const project = trashedProjects.find(p => p.id === projectId);
    if (project) {
      const { _daysLeft, deleted_at, ...restored } = project;
      setTrashedProjects(prev => prev.filter(p => p.id !== projectId));
      setProjects(prev => [{ ...restored, deleted_at: null }, ...prev]);
    }
  };

  const permanentlyDelete = async (projectId: string) => {
    await supabase.from("appraisals").delete().eq("project_id", projectId);
    await supabase.from("projects").delete().eq("id", projectId);
    setTrashedProjects(prev => prev.filter(p => p.id !== projectId));
    setConfirmDelete(null);
  };

  const emptyTrash = async () => {
    for (const p of trashedProjects) {
      await supabase.from("appraisals").delete().eq("project_id", p.id);
      await supabase.from("projects").delete().eq("id", p.id);
    }
    setTrashedProjects([]);
    setConfirmDelete(null);
  };

  const filteredProjects = filter === "all" ? projects : projects.filter(p => p.asset_type === filter);
  const totalGDV = projects.reduce((s, p) => s + (p.appraisals?.[0]?.gdv || 0), 0);
  const avgPoC = (() => {
    const valid = projects.filter(p => p.appraisals?.[0]?.profit_on_cost);
    if (!valid.length) return 0;
    return valid.reduce((s, p) => s + (p.appraisals[0].profit_on_cost || 0), 0) / valid.length;
  })();

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", display: "flex" }}>
      <style>{CSS}</style>

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="sidebar">
        <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--gold)", letterSpacing: ".1em", fontWeight: 300 }}>VALORA</div>
          <div style={{ fontSize: 9, color: "var(--text-d)", letterSpacing: ".14em", textTransform: "uppercase", marginTop: 2 }}>Development Appraisal</div>
        </div>
        <div style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 12px", marginBottom: 8 }}>My Work</div>
          <button className={`nav-item ${view === "portfolio" ? "active" : ""}`} onClick={() => setView("portfolio")}>Portfolio</button>
          <button className="nav-item" onClick={() => router.push("/pipeline")}>Pipeline</button>
          <button className="nav-item" onClick={() => router.push("/tasks")}>Tasks</button>
          {hasFirm && (
            <>
              <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
              <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 12px", marginBottom: 8 }}>Team</div>
              <button className="nav-item" onClick={() => router.push("/workspace")} style={{ color: "var(--gold)" }}>◈ Workspace</button>
              <button className="nav-item" onClick={() => router.push("/team")}>Team</button>
            </>
          )}
          {!hasFirm && (
            <button className="nav-item" onClick={() => router.push("/team")}>Team</button>
          )}
          <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
          <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 12px", marginBottom: 8 }}>Manage</div>
          <button className={`nav-item ${view === "trash" ? "active-danger" : "danger-item"}`} onClick={() => setView("trash")} style={{ justifyContent: "space-between" }}>
            <span>Trash</span>
            {trashedProjects.length > 0 && (
              <span style={{ background: "var(--red)", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{trashedProjects.length}</span>
            )}
          </button>
          {!isPro && (
            <>
              <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
              <button className="nav-item" onClick={() => router.push("/pricing")} style={{ color: "var(--gold)", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", fontWeight: 600, fontSize: 12 }}>
                ✦ Upgrade Plan
              </button>
            </>
          )}
        </div>
        {/* Book a Demo — bottom of sidebar */}
        <div style={{ padding: "12px 12px 0", borderTop: "1px solid var(--border)" }}>
          <button className="btn-demo" onClick={() => window.open(CALENDLY, "_blank")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Book a Demo
          </button>
          <div style={{ padding: "12px 0 16px", borderTop: "none" }}>
            <div style={{ fontSize: 11, color: "var(--text-d)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
            <button className="nav-item" onClick={signOut} style={{ fontSize: 12 }}>Sign Out</button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content" style={{ marginLeft: 220, flex: 1, minWidth: 0, padding: "48px 40px", maxWidth: "calc(100vw - 220px)" }}>

        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--gold)", letterSpacing: ".1em", fontWeight: 300 }}>VALORA</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" style={{ padding: "7px 12px", fontSize: 11 }} onClick={() => window.open(CALENDLY, "_blank")}>Book Demo</button>
            <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 12 }}
              onClick={() => {
                if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; }
                setShowNewModal(true);
              }}>
              + New
            </button>
          </div>
        </div>

        {/* TRASH VIEW */}
        {view === "trash" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 300, marginBottom: 6 }}>Trash</h1>
                <p style={{ fontSize: 13, color: "var(--text-d)" }}>Projects deleted within the last {TRASH_DAYS} days.</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-ghost" onClick={() => setView("portfolio")} style={{ fontSize: 12 }}>← Portfolio</button>
                {trashedProjects.length > 0 && (
                  <button className="btn-danger" onClick={() => setConfirmDelete({ type: "all" })} style={{ padding: "8px 16px", fontSize: 12 }}>Empty Trash</button>
                )}
              </div>
            </div>
            {trashedProjects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🗑</div>
                <p style={{ fontSize: 16, color: "var(--text-d)", fontFamily: "var(--font-display)" }}>Trash is empty</p>
              </div>
            ) : (
              <div className="cards-grid">
                {trashedProjects.map((p, i) => {
                  const latest = p.appraisals?.[0];
                  const sym = CURRENCY_SYMBOLS[p.currency] || "£";
                  return (
                    <div key={p.id} className="card trashed" style={{ animationDelay: `${i * 0.04}s`, cursor: "default" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 10, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 500 }}>{p.asset_type}</span>
                        <span style={{ fontSize: 10, color: "var(--red)", fontFamily: "var(--font-mono)" }}>Deletes in {p._daysLeft}d</span>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 2, fontFamily: "var(--font-display)" }}>{p.name || "Untitled"}</h3>
                      <p style={{ fontSize: 12, color: "var(--text-m)", marginBottom: 16 }}>{p.location || "No location"}</p>
                      {latest && (
                        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
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
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-ghost" onClick={() => restoreProject(p.id)} style={{ flex: 1, fontSize: 11, padding: "6px" }}>Restore</button>
                        <button className="btn-danger" onClick={() => setConfirmDelete({ type: "single", project: p })} style={{ flex: 1, padding: "6px" }}>Delete Forever</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PORTFOLIO VIEW */}
        {view === "portfolio" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, marginBottom: 6, letterSpacing: ".02em" }}>Portfolio</h1>
                <p style={{ fontSize: 13, color: "var(--text-d)" }}>
                  {projects.length} project{projects.length !== 1 ? "s" : ""}
                  {projects.length > 0 && ` · ${fmt(totalGDV)} total GDV · avg ${fmtPct(avgPoC)} PoC`}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <button className="btn-primary" style={{ padding: "12px 24px", fontSize: 13 }}
                  onClick={() => {
                    if (!isPro && totalProjectCount >= activeProjectLimit) { router.push("/pricing"); return; }
                    setShowNewModal(true);
                  }}>
                  + New Appraisal
                </button>
                {!isPro && (
                  <div style={{ fontSize: 11, color: "var(--text-d)" }}>
                    {totalProjectCount}/{activeProjectLimit === Infinity ? "∞" : activeProjectLimit} projects
                    {totalProjectCount >= activeProjectLimit && (
                      <span style={{ color: "var(--amber)", marginLeft: 6 }}>
                        · <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/pricing")}>Upgrade to add more</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Book a Demo banner — shown to free/starter users */}
            {!isPro && projects.length > 0 && (
              <div className="demo-banner">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)", marginBottom: 2 }}>Want a guided walkthrough?</div>
                  <div style={{ fontSize: 12, color: "var(--text-m)" }}>Book a free 30-min demo with our team — we'll walk through your deals live.</div>
                </div>
                <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 12, flexShrink: 0 }} onClick={() => window.open(CALENDLY, "_blank")}>
                  📅 Book a Demo
                </button>
              </div>
            )}

            {/* Empty state with demo CTA */}
            {projects.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 300, color: "var(--text-d)", marginBottom: 16 }}>◈</div>
                <p style={{ fontSize: 16, color: "var(--text-d)", marginBottom: 8 }}>No projects yet</p>
                <p style={{ fontSize: 13, color: "var(--text-d)", marginBottom: 32 }}>Create your first appraisal or book a demo to get started.</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn-primary" onClick={() => setShowNewModal(true)} style={{ padding: "14px 32px", fontSize: 14 }}>+ Create First Appraisal</button>
                  <button className="btn-ghost" onClick={() => window.open(CALENDLY, "_blank")} style={{ padding: "13px 24px", fontSize: 14 }}>📅 Book a Demo</button>
                </div>
              </div>
            )}

            {!isPro && totalProjectCount >= activeProjectLimit && (
              <div style={{ background: "rgba(240,164,41,.06)", border: "1px solid rgba(240,164,41,.2)", borderRadius: 10, padding: "12px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ fontSize: 13, color: "var(--amber)" }}>
                  You've reached your {activeProjectLimit}-project limit.
                </div>
                <button className="btn-primary" onClick={() => router.push("/pricing")} style={{ padding: "7px 16px", fontSize: 12 }}>Upgrade →</button>
              </div>
            )}

            {projects.length > 0 && (
              <div className="stats-grid">
                {[
                  { label: "Total Projects", value: projects.length.toString(), color: "var(--text)" },
                  { label: "Total GDV", value: fmt(totalGDV), color: "var(--gold)" },
                  { label: "Avg Profit on Cost", value: fmtPct(avgPoC), color: avgPoC > 0.2 ? "var(--green)" : "var(--amber)" },
                  { label: "Active Appraisals", value: projects.reduce((s, p) => s + (p.appraisals?.length || 0), 0).toString(), color: "var(--blue)" },
                ].map(stat => (
                  <div key={stat.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px" }}>
                    <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 8 }}>{stat.label}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Filter tabs */}
            {projects.length > 0 && (
              <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
                {["all", ...ASSET_TYPES].map(f => {
                  const count = f === "all" ? projects.length : projects.filter(p => p.asset_type === f).length;
                  return (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: "10px 16px", fontSize: 12, background: "none", border: "none", borderBottom: `2px solid ${filter === f ? "var(--gold)" : "transparent"}`, color: filter === f ? "var(--gold)" : "var(--text-d)", cursor: "pointer", fontFamily: "var(--font-body)", transition: "all .2s", textTransform: f === "all" ? "uppercase" : "none", letterSpacing: ".04em", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {f === "all" ? "ALL" : f} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {filteredProjects.length > 0 && (
              <div className="cards-grid">
                {filteredProjects.map((p, i) => {
                  const latest = p.appraisals?.[0];
                  const sym = CURRENCY_SYMBOLS[p.currency] || "£";
                  const pocColor = latest?.profit_on_cost > 0.2 ? "var(--green)" : latest?.profit_on_cost > 0.1 ? "var(--amber)" : "var(--red)";
                  const statusStyle = { bg: "rgba(125,133,144,.12)", color: "#7d8590" };
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
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 10, background: "var(--gold-bg)", color: "var(--gold)", fontWeight: 600, letterSpacing: ".04em" }}>{p.asset_type}</span>
                        <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 10, background: statusStyle.bg, color: statusStyle.color }}>{latest?.status || "draft"}</span>
                        <span style={{ fontSize: 10, color: "var(--text-d)", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
                          {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 500, marginBottom: 4, fontFamily: "var(--font-display)", letterSpacing: ".02em" }}>{p.name || "Untitled"}</h3>
                      <p style={{ fontSize: 12, color: "var(--text-m)", marginBottom: 18 }}>{p.location || "No location set"}</p>
                      {latest ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                          {[
                            { label: "GDV", value: fmt(latest.gdv, sym), color: "var(--gold)" },
                            { label: "Profit", value: fmt(latest.profit, sym), color: latest.profit > 0 ? "var(--green)" : "var(--red)" },
                            { label: "PoC", value: fmtPct(latest.profit_on_cost), color: pocColor },
                          ].map(m => (
                            <div key={m.label} className="metric-pill">
                              <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>{m.label}</div>
                              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, color: m.color }}>{m.value}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--text-d)" }}>
                          No appraisal saved yet — click to open
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--bg4)" }}>
                        <span style={{ fontSize: 11, color: "var(--text-d)" }}>
                          {p.appraisals?.length || 0} appraisal{p.appraisals?.length !== 1 ? "s" : ""}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--gold)", fontFamily: "var(--font-mono)" }}>
                          {latest?.irr_unlevered ? `IRR ${fmtPct(latest.irr_unlevered)}` : "Open →"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* New Project Modal */}
        {showNewModal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
            <div className="modal">
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 300, marginBottom: 6 }}>New Appraisal</div>
              <p style={{ fontSize: 13, color: "var(--text-d)", marginBottom: 28 }}>Set up a new project to get started.</p>
              <div className="inp-group">
                <label className="inp-label">Project Name *</label>
                <input className="inp" placeholder="e.g. Chiswick Tower" value={newProject.name}
                  onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && createProject()} autoFocus />
              </div>
              <div className="inp-group">
                <label className="inp-label">Location</label>
                <input className="inp" placeholder="e.g. Hammersmith, London" value={newProject.location}
                  onChange={e => setNewProject(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button className="btn-ghost" onClick={() => setShowNewModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-primary" onClick={createProject} disabled={!newProject.name.trim() || creating} style={{ flex: 2, opacity: !newProject.name.trim() ? 0.5 : 1 }}>
                  {creating ? "Creating…" : "Create & Open →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {confirmDelete && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
            <div className="modal" style={{ width: 420 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 300, marginBottom: 8, color: "var(--red)" }}>
                {confirmDelete.type === "all" ? "Empty Trash" : "Delete Permanently"}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-m)", marginBottom: 8 }}>
                {confirmDelete.type === "all"
                  ? `This will permanently delete all ${trashedProjects.length} projects in the trash.`
                  : `This will permanently delete "${confirmDelete.project?.name || "this project"}" and all its appraisals.`}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 28 }}>This action cannot be undone.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-ghost" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancel</button>
                <button
                  onClick={() => confirmDelete.type === "all" ? emptyTrash() : permanentlyDelete(confirmDelete.project.id)}
                  style={{ flex: 1, background: "var(--red)", color: "#fff", border: "none", borderRadius: 7, padding: "10px 20px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
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
        {hasFirm && (
          <button className="bottom-nav-item" onClick={() => router.push("/workspace")}>
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            Workspace
          </button>
        )}
        <button className="bottom-nav-item" onClick={() => router.push("/tasks")}>
          <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          Tasks
        </button>
        <button className="bottom-nav-item" onClick={() => window.open(CALENDLY, "_blank")}>
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Demo
        </button>
      </nav>

    </div>
  );
}
