"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════════
   VALORA — VALUATIONS LIST PAGE
   Drop at: app/valuations/page.tsx
   ───────────────────────────────────────────────────────────────────
   Dedicated list of the user's saved valuations. Mirrors /portfolio's
   sidebar + chrome but swaps the grid for valuation-specific cards:
   estimated value, £/sqft, comps count, confidence pill.
   Click a card → /valuation?id=<uuid> to rehydrate.
   ═══════════════════════════════════════════════════════════════════ */

const CALENDLY = "https://calendly.com/hello-valoraplatform/30min";

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
body{background:var(--bg);color:var(--text);font-family:var(--font-body);font-size:14px;-webkit-font-smoothing:antialiased}
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
.card:hover{border-color:var(--gold-border);transform:translateY(-1px)}
.metrics-panel{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;background:var(--bg3);border-radius:8px;padding:12px;}
.metric-cell{display:flex;flex-direction:column;gap:3px}
.metric-cell__label{font-size:10px;font-weight:600;color:var(--text-d);text-transform:uppercase;letter-spacing:0.08em;}
.metric-cell__value{font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-0.01em;}
.btn-primary{background:var(--gold);color:var(--bg);border:none;border-radius:8px;padding:10px 20px;font-family:var(--font-body);font-size:13px;font-weight:600;letter-spacing:-0.01em;cursor:pointer;transition:background .2s var(--ease),transform .1s var(--ease);display:inline-flex;align-items:center;justify-content:center;gap:6px;}
.btn-primary:hover{background:var(--gold-l)}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border-m);border-radius:8px;padding:9px 18px;font-family:var(--font-body);font-size:13px;font-weight:500;cursor:pointer;transition:all .2s var(--ease);display:inline-flex;align-items:center;justify-content:center;gap:6px;}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-demo{display:flex;align-items:center;gap:8px;background:transparent;color:var(--gold);border:1px solid var(--gold-border);border-radius:8px;padding:9px 14px;font-family:var(--font-body);font-size:12px;font-weight:500;cursor:pointer;transition:all .2s var(--ease);width:100%;margin-bottom:2px;}
.btn-demo:hover{background:var(--gold-bg);border-color:var(--gold)}
.menu-btn{background:none;border:none;color:var(--text-d);cursor:pointer;padding:6px 10px;border-radius:6px;font-size:16px;line-height:1;}
.menu-btn:hover{background:var(--bg4);color:var(--text)}
.card-menu{position:absolute;top:14px;right:14px;z-index:10}
.dropdown{position:absolute;top:100%;right:0;background:var(--bg2);border:1px solid var(--border-m);border-radius:8px;padding:4px;min-width:180px;box-shadow:0 8px 24px rgba(0,0,0,.25);animation:fadeIn .12s var(--ease);}
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
.sidebar{width:224px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;z-index:100;flex-shrink:0;}
body.light .sidebar,:root[data-theme="light"] .sidebar{background:var(--bg1)}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg2);border-top:1px solid var(--border);z-index:100;padding:6px 0 env(safe-area-inset-bottom,12px);}
.bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;background:none;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);font-size:9px;letter-spacing:.04em;text-transform:uppercase;transition:color .2s var(--ease);}
.bottom-nav-item.active{color:var(--gold)}
.bottom-nav-item svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.mobile-topbar{display:none;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--bg2);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50;}
.filter-tabs{display:flex;gap:0;margin-bottom:20px;border-bottom:1px solid var(--border);overflow-x:auto;}
.filter-tab{padding:10px 16px;font-size:12px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;color:var(--text-d);cursor:pointer;font-family:var(--font-body);transition:all .2s var(--ease);white-space:nowrap;flex-shrink:0;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:-1px;}
.filter-tab:hover{color:var(--text-m)}
.filter-tab.active{color:var(--gold);border-bottom-color:var(--gold);font-weight:700}
.pill{display:inline-flex;align-items:center;font-size:10px;font-weight:600;padding:3px 10px;border-radius:4px;letter-spacing:0.02em;}
.pill--type{background:var(--gold-bg);color:var(--gold);border:1px solid var(--gold-border)}
.pill--muted{background:rgba(148,156,160,.12);color:var(--text-d);border:1px solid var(--border);text-transform:capitalize;}
.pill--shared{background:rgba(92,165,220,.12);color:var(--blue);border:1px solid rgba(92,165,220,.28)}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;}
.page-header h1{font-family:var(--font-display);font-size:34px;font-weight:700;letter-spacing:-0.03em;line-height:1;color:var(--text);}
.search-row{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;}
.search-inp{flex:1;min-width:260px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:9px;color:var(--text);font-family:var(--font-body);font-size:13px;outline:none;transition:border-color .2s;}
.search-inp:focus{border-color:var(--gold)}
.search-inp::placeholder{color:var(--text-d)}
@media(max-width:1100px){.cards-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:900px){.stats-strip{grid-template-columns:repeat(3,1fr)}.cards-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){
  .sidebar{display:none}
  .bottom-nav{display:flex}
  .mobile-topbar{display:flex}
  .main-content{padding:16px 14px 90px!important}
  .cards-grid{grid-template-columns:1fr}
  .stats-strip{grid-template-columns:repeat(2,1fr)}
  .stat-cell{border-bottom:1px solid var(--border)}
  .page-header{flex-direction:column;align-items:flex-start!important;gap:10px!important}
}
`;

const fmt = (n: number, prefix = "£") => {
  if (!n || !isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${prefix}${(n / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${prefix}${(n / 1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${prefix}${(n / 1e3).toFixed(0)}k`;
  return `${prefix}${Math.round(n).toLocaleString()}`;
};

const CURRENCY_SYMBOLS: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", AED: "AED ", SGD: "S$", AUD: "A$" };

type Valuation = {
  id: string;
  address?: string | null;
  jurisdiction?: string | null;
  currency?: string | null;
  property_type?: string | null;
  estimated_central?: number | null;
  confidence?: "low" | "medium" | "high" | null;
  share_token?: string | null;
  created_at: string;
  data: any;
};

export default function ValuationsListPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [confFilter, setConfFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [subscription, setSubscription] = useState<any>(null);
  const [hasFirm, setHasFirm] = useState(false);
  const [projectCount, setProjectCount] = useState(0);

  // Theme — same detect + sync pattern as /portfolio so the two pages agree
  const detectTheme = (): "dark" | "light" => {
    if (typeof document === "undefined") return "light";
    if (document.body?.classList.contains("light")) return "light";
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    try {
      for (const key of ["valora-theme", "val-theme", "theme"]) {
        const v = localStorage.getItem(key);
        if (v === "light" || v === "dark") return v;
      }
    } catch {}
    return "light";
  };
  const [theme, setTheme] = useState<"dark" | "light">(() => detectTheme());
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    document.body.classList.toggle("light", theme === "light");
    try { localStorage.setItem("valora-theme", theme); localStorage.setItem("val-theme", theme); } catch {}
  }, [theme]);

  const tier = subscription?.tier || "free";
  const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
  const isTrialing = !!(trialEndsAt && trialEndsAt > new Date());
  const isPro = tier === "professional" || tier === "enterprise" || isTrialing;

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);
      const { data } = await supabase
        .from("valuations")
        .select("id, address, jurisdiction, currency, property_type, estimated_central, confidence, share_token, created_at, data")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      setValuations((data || []) as Valuation[]);
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", session.user.id).maybeSingle();
      setSubscription(sub);
      const { data: firm } = await supabase.from("firm_members").select("id").eq("user_id", session.user.id).maybeSingle();
      setHasFirm(!!firm);
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("created_by", session.user.id).is("deleted_at", null)
        .then(({ count }) => setProjectCount(count ?? 0));
      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest(".card-menu")) setOpenMenuId(null); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); router.push("/"); };

  const openValuation = (v: Valuation) => { router.push(`/valuation?id=${v.id}`); };

  const deleteValuation = async (id: string, addr: string) => {
    setOpenMenuId(null);
    if (!confirm(`Delete valuation for ${addr}?`)) return;
    await supabase.from("valuations").delete().eq("id", id);
    setValuations(prev => prev.filter(v => v.id !== id));
  };

  const shareValuation = async (v: Valuation) => {
    setOpenMenuId(null);
    let token = v.share_token;
    if (!token) {
      token = (Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8) + Date.now().toString(36)).slice(0, 22);
      await supabase.from("valuations").update({ share_token: token }).eq("id", v.id);
      setValuations(prev => prev.map(x => x.id === v.id ? { ...x, share_token: token } : x));
    }
    const url = `${window.location.origin}/share/valuation/${token}`;
    try { await navigator.clipboard.writeText(url); alert(`Share link copied to clipboard:\n${url}`); }
    catch { alert(`Share link:\n${url}`); }
  };

  // Filter
  const filtered = valuations.filter(v => {
    if (confFilter !== "all" && v.confidence !== confFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const blob = [v.address, v.jurisdiction, v.property_type, v.currency].filter(Boolean).join(" ").toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  });

  // Stats
  const totalEst = valuations.reduce((s, v) => s + (v.estimated_central || 0), 0);
  const withSqft = valuations.filter(v => v.data?.pricePerSqft);
  const avgPsqft = withSqft.length ? withSqft.reduce((s, v) => s + (v.data.pricePerSqft || 0), 0) / withSqft.length : 0;
  const highConf = valuations.filter(v => v.confidence === "high").length;
  const jurisdictions = new Set(valuations.map(v => v.jurisdiction).filter(Boolean)).size;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0F1115", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <span style={{ fontFamily: "'Poppins',system-ui,sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: "-.03em", color: "#F6F4EF" }}>Valora</span>
      <div style={{ width: 28, height: 28, border: "2px solid rgba(82,196,152,.15)", borderTopColor: "#52C498", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", display: "flex" }}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var keys=['valora-theme','val-theme','theme'];for(var i=0;i<keys.length;i++){var v=localStorage.getItem(keys[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='light';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');else if(document.body)document.body.classList.remove('light');}catch(e){}})()` }} />

      {/* ── SIDEBAR ── */}
      <div className="sidebar">
        <div style={{ padding: "20px 20px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, letterSpacing: "-.03em", color: "var(--text)" }}>Valora</span>
          <div style={{ fontSize: 9, color: "var(--text-d)", letterSpacing: ".18em", textTransform: "uppercase", marginTop: 3, fontWeight: 600 }}>Institutional Real Estate AI</div>
        </div>
        <div style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".14em", padding: "0 12px", marginBottom: 8, fontWeight: 600 }}>My Work</div>
          <button className="nav-item" onClick={() => router.push("/dashboard")} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--gold)", fontSize: 14, lineHeight: 1 }}>◆</span>
            <span>Copilot</span>
          </button>
          <button className="nav-item" onClick={() => router.push("/portfolio")} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
            <span>Portfolio</span>
            {projectCount > 0 && <span style={{ background: "rgba(148,156,160,.16)", color: "var(--text-d)", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{projectCount}</span>}
          </button>
          <button className="nav-item active" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--gold)", fontSize: 13 }}>◈</span>
              <span>Valuations</span>
            </span>
            {valuations.length > 0 && <span style={{ background: "var(--gold-bg)", color: "var(--gold)", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700, border: "1px solid var(--gold-border)" }}>{valuations.length}</span>}
          </button>
          <button className="nav-item" onClick={() => router.push("/pipeline")}>Pipeline</button>
          <button className="nav-item" onClick={() => router.push("/tasks")}>Tasks</button>
          <button className="nav-item" onClick={() => router.push("/notes")}>Notes</button>
          <button className="nav-item" onClick={() => router.push("/learn")} style={{ color: "var(--gold)" }}>✦ Learn</button>
          {hasFirm && (<>
            <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
            <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".14em", padding: "0 12px", marginBottom: 8, fontWeight: 600 }}>Team</div>
            <button className="nav-item" onClick={() => router.push("/workspace")} style={{ color: "var(--gold)" }}>◈ Workspace</button>
            <button className="nav-item" onClick={() => router.push("/team")}>Team</button>
          </>)}
          {!hasFirm && <button className="nav-item" onClick={() => router.push("/team")}>Team</button>}
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
              <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
                style={{ padding: "5px 10px", borderRadius: 999, border: "1px solid var(--border-m)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "var(--text-d)", fontSize: 10, fontWeight: 600, letterSpacing: ".03em" }}>
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
          <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, letterSpacing: "-.03em", color: "var(--text)" }}>Valora</span>
          <button className="btn-primary" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => router.push("/valuation")}>◈ New</button>
        </div>

        <div className="page-header">
          <div>
            <h1><span style={{ color: "var(--gold)", marginRight: 10 }}>◈</span>Valuations</h1>
            <p style={{ fontSize: 14, color: "var(--text-d)", marginTop: 8, fontWeight: 500 }}>
              {valuations.length === 0
                ? "Cross-border property valuations. Paste a listing URL or describe a property — the Copilot does the rest in 60 seconds."
                : <>{valuations.length} valuation{valuations.length !== 1 ? "s" : ""} · {fmt(totalEst)} total estimated · {jurisdictions} market{jurisdictions !== 1 ? "s" : ""}</>
              }
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" onClick={() => router.push("/dashboard")}><span style={{ color: "var(--gold)" }}>◆</span> Copilot</button>
            <button className="btn-primary" onClick={() => router.push("/valuation")}>◈ New Valuation</button>
          </div>
        </div>

        {valuations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14 }}>
            <div style={{ fontSize: 44, marginBottom: 14, color: "var(--gold)" }}>◈</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, fontFamily: "var(--font-display)", letterSpacing: "-.02em" }}>No valuations yet</h2>
            <p style={{ fontSize: 14, color: "var(--text-d)", maxWidth: 500, margin: "0 auto 26px", lineHeight: 1.6 }}>
              Start with a Rightmove, Zoopla, or Zillow URL — or just describe the property. 3 free valuations, any market.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => router.push("/valuation")} style={{ padding: "11px 22px" }}>◈ New Valuation</button>
              <button className="btn-ghost" onClick={() => router.push("/dashboard")} style={{ padding: "11px 22px" }}>◆ Open Copilot</button>
            </div>
          </div>
        ) : (
          <>
            <div className="stats-strip">
              {[
                { label: "Valuations", value: String(valuations.length), color: "var(--text)" },
                { label: "Total Est.", value: fmt(totalEst), color: "var(--accent-gold)" },
                { label: "Avg £/sqft", value: avgPsqft ? fmt(avgPsqft) : "—", color: "var(--text-m)" },
                { label: "High Conf.", value: String(highConf), color: highConf > 0 ? "var(--green)" : "var(--text-m)" },
                { label: "Markets", value: String(jurisdictions), color: "var(--text-m)" },
              ].map(s => (
                <div key={s.label} className="stat-cell">
                  <span className="stat-cell__label">{s.label}</span>
                  <span className="stat-cell__value" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            <div className="search-row">
              <input className="search-inp" placeholder="Search address, market, property type…" value={search} onChange={e => setSearch(e.target.value)} />
              <div className="filter-tabs" style={{ borderBottom: "none", marginBottom: 0 }}>
                {(["all", "high", "medium", "low"] as const).map(c => {
                  const count = c === "all" ? valuations.length : valuations.filter(v => v.confidence === c).length;
                  return (
                    <button key={c} className={`filter-tab ${confFilter === c ? "active" : ""}`} onClick={() => setConfFilter(c)}>
                      {c === "all" ? "All" : c} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-d)", fontSize: 14 }}>
                No valuations match your filter.
              </div>
            ) : (
              <div className="cards-grid">
                {filtered.map((v, i) => {
                  const sym = CURRENCY_SYMBOLS[v.currency || "GBP"] || "£";
                  const confColor = v.confidence === "high" ? "var(--green)" : v.confidence === "medium" ? "var(--amber)" : v.confidence === "low" ? "var(--red)" : "var(--text-d)";
                  const confBg = v.confidence === "high" ? "rgba(82,196,152,.12)" : v.confidence === "medium" ? "rgba(240,164,41,.1)" : v.confidence === "low" ? "rgba(244,100,95,.08)" : "var(--bg3)";
                  const addrShort = v.address || `${v.property_type || "Property"} · ${v.jurisdiction || "—"}`;
                  const psqft = v.data?.pricePerSqft;
                  const sqft = v.data?.sqft;
                  const beds = v.data?.bedrooms;

                  return (
                    <div key={v.id} className="card" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => openValuation(v)}>
                      <div className="card-menu" onClick={e => e.stopPropagation()}>
                        <button className="menu-btn" onClick={() => setOpenMenuId(openMenuId === v.id ? null : v.id)}>···</button>
                        {openMenuId === v.id && (
                          <div className="dropdown">
                            <button className="dropdown-item" onClick={() => openValuation(v)}>Open Valuation</button>
                            <button className="dropdown-item" onClick={() => shareValuation(v)}>Copy Share Link</button>
                            <button className="dropdown-item danger" onClick={() => deleteValuation(v.id, addrShort)}>Delete</button>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span className="pill pill--type">◈ Valuation</span>
                        {v.jurisdiction && <span className="pill pill--muted">{v.jurisdiction}</span>}
                        {v.share_token && <span className="pill pill--shared">shared</span>}
                        <span style={{ fontSize: 11, color: "var(--text-d)", marginLeft: "auto", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                          {new Date(v.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 3, fontFamily: "var(--font-display)", letterSpacing: "-.02em", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                          {addrShort}
                        </h3>
                        <p style={{ fontSize: 12, color: "var(--text-d)", fontWeight: 500 }}>
                          {v.property_type || "Property"}{beds ? ` · ${beds} bed${beds !== 1 ? "s" : ""}` : ""}{sqft ? ` · ${sqft.toLocaleString()} sqft` : ""}
                        </p>
                      </div>
                      <div className="metrics-panel">
                        {[
                          { label: "Estimate", value: v.estimated_central ? fmt(v.estimated_central, sym) : "—", color: "var(--accent-gold)" },
                          { label: `${sym}/sqft`, value: psqft ? fmt(psqft, sym) : "—", color: "var(--text-m)" },
                          { label: "Comps", value: String(v.data?.comparables?.length || 0), color: "var(--text-m)" },
                        ].map(m => (
                          <div key={m.label} className="metric-cell">
                            <div className="metric-cell__label">{m.label}</div>
                            <div className="metric-cell__value" style={{ color: m.color }}>{m.value}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--text-d)", fontWeight: 500 }}>
                        {v.confidence ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: confBg, color: confColor, border: `1px solid ${confColor}`, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
                            ● {v.confidence}
                          </span>
                        ) : <span />}
                        <span style={{ color: "var(--gold)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>Open →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <button className="bottom-nav-item" onClick={() => router.push("/dashboard")}>
          <svg viewBox="0 0 24 24"><path d="M12 2L2 8.5v7L12 22l10-6.5v-7L12 2z"/><path d="M12 2v20"/></svg>
          Copilot
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/portfolio")}>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Portfolio
        </button>
        <button className="bottom-nav-item active">
          <svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/><path d="M12 8v6"/></svg>
          Valuations
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/pipeline")}>
          <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          Pipeline
        </button>
        <button className="bottom-nav-item" onClick={() => router.push("/learn")}>
          <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
          Learn
        </button>
      </nav>
    </div>
  );
}