"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
/* ═══════════════════════════════════════════════════════════════════════
   VALORA — NOTES v2
   Rebranded to the Valora design system. All Supabase / auto-save / mobile
   drawer logic preserved verbatim. Theme sync unified with the rest of
   the app (body.light + html[data-theme] + localStorage).
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
  --green:var(--val-green);--red:var(--val-red);--amber:var(--val-amber);--blue:var(--val-blue);
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
}
html,body{background:var(--val-bg-app);color:var(--val-text);font-family:var(--val-font-body);font-size:14px;line-height:1.45;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
::selection{background:var(--val-green-tint);color:var(--val-text)}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--val-border-lt);border-radius:var(--val-r-pill);border:2px solid var(--val-bg-app)}
::-webkit-scrollbar-thumb:hover{background:var(--val-text-dim)}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}

/* ═══ SIDEBAR (matches tasks/team conventions) ═══ */
.sidebar{
  width:232px;background:var(--val-bg-panel);
  border-right:1px solid var(--val-border);
  display:flex;flex-direction:column;
  position:fixed;top:0;left:0;bottom:0;z-index:100;
}
.main-wrap{margin-left:232px;padding:40px 40px;flex:1}
.nav-item{
  width:100%;display:flex;align-items:center;
  padding:8px 12px;border-radius:var(--val-r-md);
  font-size:14px;font-weight:500;color:var(--val-text-mid);
  background:transparent;border:1px solid transparent;cursor:pointer;
  font-family:var(--val-font-body);transition:all var(--val-dur) var(--val-ease);
  text-align:left;margin-bottom:2px;
}
.nav-item:hover{color:var(--val-text);background:rgba(255,255,255,0.04)}
body.light .nav-item:hover,
:root[data-theme="light"] .nav-item:hover{background:rgba(15,17,21,0.04)}
.nav-item.active{color:var(--val-green);background:var(--val-green-tint);font-weight:600}

/* ═══ BUTTONS ═══ */
.btn-primary{
  background:var(--val-green);color:var(--val-bg-app);
  border:none;border-radius:var(--val-r-sm);
  height:34px;padding:0 16px;
  font-family:var(--val-font-body);font-size:13px;font-weight:600;letter-spacing:-.015em;
  cursor:pointer;transition:background var(--val-dur) var(--val-ease),transform .1s var(--val-ease);
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
}
.btn-primary:hover{background:#5DD3A4;transform:translateY(-1px)}
body.light .btn-primary:hover,
:root[data-theme="light"] .btn-primary:hover{background:var(--val-green-deep)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-ghost{
  background:transparent;color:var(--val-text-mid);
  border:1px solid var(--val-border-lt);border-radius:var(--val-r-sm);
  height:32px;padding:0 14px;
  font-family:var(--val-font-body);font-size:12px;font-weight:600;letter-spacing:-.015em;
  cursor:pointer;transition:all var(--val-dur) var(--val-ease);
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
}
.btn-ghost:hover{border-color:var(--val-text-dim);color:var(--val-text)}

/* ═══ NOTE CARD ═══ */
.note-card{
  background:var(--val-bg-panel);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-lg);
  padding:18px;
  cursor:pointer;transition:all var(--val-dur) var(--val-ease);
  animation:fadeUp .25s var(--val-ease) both;
  position:relative;overflow:hidden;
}
.note-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:var(--val-green);opacity:0;transition:opacity var(--val-dur) var(--val-ease);
}
.note-card:hover{
  border-color:var(--val-border-accent);
  transform:translateY(-2px);
  box-shadow:0 4px 20px rgba(0,0,0,.2);
}
body.light .note-card:hover,
:root[data-theme="light"] .note-card:hover{box-shadow:0 4px 20px rgba(15,17,21,.08)}
.note-card:hover::before{opacity:1}
.note-card.selected{border-color:var(--val-green);box-shadow:0 0 0 3px var(--val-green-tint)}
.note-card.selected::before{opacity:1}

/* ═══ NOTE EDITOR ═══ */
.note-editor{
  background:var(--val-bg-panel);
  border:1px solid var(--val-border);
  border-radius:var(--val-r-lg);
  display:flex;flex-direction:column;
  animation:slideIn .2s var(--val-ease) both;
  height:100%;overflow:hidden;
}
.editor-textarea{
  width:100%;flex:1;
  background:transparent;border:none;
  color:var(--val-text);font-family:var(--val-font-body);
  font-size:15px;line-height:1.8;font-weight:400;
  padding:24px;outline:none;resize:none;min-height:300px;
}
.editor-textarea::placeholder{color:var(--val-text-faint)}

/* ═══ SEARCH ═══ */
.search-inp{
  width:100%;height:38px;
  padding:0 12px 0 36px;
  background:var(--val-bg-panel-2);
  border:1px solid var(--val-border);border-radius:var(--val-r-md);
  color:var(--val-text);font-family:var(--val-font-body);font-size:13px;font-weight:500;
  outline:none;
  transition:all var(--val-dur) var(--val-ease);
}
.search-inp:focus{
  border-color:var(--val-green);
  background:var(--val-bg-panel);
  box-shadow:0 0 0 3px var(--val-green-tint);
}
.search-inp::placeholder{color:var(--val-text-faint)}

/* ═══ MOBILE BARS ═══ */
.mobile-topbar{
  display:none;align-items:center;justify-content:space-between;
  padding:14px 16px;
  background:var(--val-bg-panel);
  border-bottom:1px solid var(--val-border);
  position:sticky;top:0;z-index:50;
}
.bottom-nav{
  display:none;position:fixed;bottom:0;left:0;right:0;
  background:var(--val-bg-panel);
  border-top:1px solid var(--val-border);
  z-index:100;padding:8px 0 env(safe-area-inset-bottom,16px);
}
.bottom-nav-item{
  flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;
  padding:6px 4px;background:none;border:none;
  color:var(--val-text-dim);cursor:pointer;font-family:var(--val-font-body);
  font-size:9px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;
  transition:color var(--val-dur) var(--val-ease);
}
.bottom-nav-item.active{color:var(--val-green)}
.bottom-nav-item svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}

@media(max-width:768px){
  .sidebar{display:none!important}
  .bottom-nav{display:flex}
  .mobile-topbar{display:flex}
  .notes-root{display:block!important}
  .main-wrap{margin-left:0!important;padding:16px 14px 90px!important;max-width:100vw!important;width:100vw!important}
  .notes-layout{grid-template-columns:1fr!important}
  .note-editor-col{display:none}
  .note-editor-col.mobile-open{display:flex!important;position:fixed;inset:0;z-index:150;padding:0;background:var(--val-bg-app)}
}
`;
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function excerpt(body: string, max = 80): string {
  const clean = body.trim();
  if (!clean) return "Empty note";
  return clean.length > max ? clean.slice(0, max) + "…" : clean;
}
function firstLine(body: string): string {
  const line = body.trim().split("\n")[0] || "";
  return line.length > 40 ? line.slice(0, 40) + "…" : line || "Untitled";
}
export default function NotesPage() {
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
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorBody, setEditorBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const [hasFirm, setHasFirm] = useState(false);
  const saveTimer = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);
      const { data: memberRow } = await supabase.from("firm_members").select("id").eq("user_id", session.user.id).maybeSingle();
      setHasFirm(!!memberRow);
      await loadNotes(session.user.id);
    };
    init();
  }, [router]);
  const loadNotes = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    setNotes(data || []);
    setLoading(false);
  };
  // Auto-save on editorBody change
  useEffect(() => {
    if (!selectedId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNote(), 800);
    return () => clearTimeout(saveTimer.current);
  }, [editorBody]);
  const saveNote = async () => {
    if (!selectedId || !user) return;
    setSaving(true);
    const { data } = await supabase
      .from("notes")
      .update({ body: editorBody, updated_at: new Date().toISOString() })
      .eq("id", selectedId)
      .eq("user_id", user.id)
      .select()
      .single();
    if (data) {
      setNotes(prev => prev.map(n => n.id === selectedId ? { ...n, body: editorBody, updated_at: data.updated_at } : n));
    }
    setSaving(false);
  };
  const createNote = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notes")
      .insert({ user_id: user.id, body: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .select()
      .single();
    if (data) {
      setNotes(prev => [data, ...prev]);
      selectNote(data);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };
  const selectNote = (note: any) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (selectedId) saveNote();
    setSelectedId(note.id);
    setEditorBody(note.body || "");
    setMobileEditorOpen(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };
  const deleteNote = async () => {
    if (!deleteModal || !user) return;
    setDeleting(true);
    await supabase.from("notes").delete().eq("id", deleteModal.id).eq("user_id", user.id);
    setNotes(prev => prev.filter(n => n.id !== deleteModal.id));
    if (selectedId === deleteModal.id) { setSelectedId(null); setEditorBody(""); setMobileEditorOpen(false); }
    setDeleteModal(null);
    setDeleting(false);
  };
  const closeEditor = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await saveNote();
    setSelectedId(null);
    setEditorBody("");
    setMobileEditorOpen(false);
  };
  const filtered = notes.filter(n =>
    search.trim() === "" || n.body?.toLowerCase().includes(search.toLowerCase())
  );
  const signOut = async () => { await supabase.auth.signOut(); router.push("/"); };
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--val-bg-app, #0F1115)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <span onClick={()=>router.push("/dashboard")} style={{fontFamily:"'Poppins',system-ui,sans-serif",fontSize:22,fontWeight:700,letterSpacing:"-.015em",color:"var(--val-text, #F6F4EF)",cursor:"pointer"}}>Valora</span>
      <div style={{ width: 26, height: 26, border: "2px solid rgba(82,196,152,.15)", borderTopColor: "#52C498", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  return (
    <div className="notes-root" style={{ minHeight: "100vh", background: "var(--val-bg-app)", color: "var(--val-text)", fontFamily: "var(--val-font-body)", display: "flex" }}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){try{var t=null;if(document.body&&document.body.classList.contains('light'))t='light';if(!t){var h=document.documentElement.getAttribute('data-theme');if(h==='light'||h==='dark')t=h;}if(!t){var keys=['valora-theme','val-theme','theme'];for(var i=0;i<keys.length;i++){var v=localStorage.getItem(keys[i]);if(v==='light'||v==='dark'){t=v;break;}}}if(!t)t='light';document.documentElement.setAttribute('data-theme',t);if(t==='light'&&document.body)document.body.classList.add('light');else if(document.body)document.body.classList.remove('light');try{localStorage.setItem('valora-theme',t);localStorage.setItem('val-theme',t);}catch(e){}}catch(e){}})()`}}/>
      {/* ── SIDEBAR ── */}
      <div className="sidebar">
        <div style={{ padding: "20px 20px 18px", borderBottom: "1px solid var(--val-border)" }}>
          <span onClick={()=>router.push("/dashboard")} style={{fontFamily:"var(--val-font-body)",fontSize:22,fontWeight:700,letterSpacing:"-.015em",color:"var(--val-text)",cursor:"pointer",display:"block",marginBottom:4,lineHeight:1}}>Valora</span>
          <div style={{ fontSize: 10, color: "var(--val-text-dim)", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 500 }}>Development Appraisal</div>
        </div>
        <div style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "var(--val-text-dim)", textTransform: "uppercase", letterSpacing: ".14em", padding: "0 12px", marginBottom: 8, fontWeight: 600 }}>My Work</div>
          <button className="nav-item" onClick={() => router.push("/dashboard")}>Portfolio</button>
          <button className="nav-item" onClick={() => router.push("/pipeline")}>Pipeline</button>
          <button className="nav-item" onClick={() => router.push("/tasks")}>Tasks</button>
          <button className="nav-item active">Notes</button>
          {hasFirm && (<>
            <div style={{ height: 1, background: "var(--val-border)", margin: "12px 0" }} />
            <div style={{ fontSize: 10, color: "var(--val-text-dim)", textTransform: "uppercase", letterSpacing: ".14em", padding: "0 12px", marginBottom: 8, fontWeight: 600 }}>Team</div>
            <button className="nav-item" onClick={() => router.push("/workspace")} style={{ color: "var(--val-green)" }}>◈ Workspace</button>
            <button className="nav-item" onClick={() => router.push("/team")}>Team</button>
          </>)}
          {!hasFirm && <button className="nav-item" onClick={() => router.push("/team")}>Team</button>}
        </div>
        <div style={{ padding: "14px 16px 20px", borderTop: "1px solid var(--val-border)" }}>
          <div style={{ fontSize: 11, color: "var(--val-text-dim)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{user?.email}</div>
          <button className="nav-item" onClick={signOut} style={{ fontSize: 12, padding: "6px 8px" }}>Sign Out</button>
        </div>
      </div>
      {/* ── MOBILE TOPBAR ── */}
      <div className="mobile-topbar">
        <span style={{fontFamily:"var(--val-font-body)",fontSize:18,fontWeight:700,letterSpacing:"-.015em",color:"var(--val-text)"}}>Valora</span>
        <button className="btn-primary" style={{ height:28, padding:"0 14px", fontSize: 12 }} onClick={createNote}>+ Note</button>
      </div>
      {/* ── MAIN ── */}
      <div className="main-wrap" style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-.03em", color: "var(--val-text)", lineHeight: 1 }}>Notes</h1>
            <p style={{ fontSize: 14, color: "var(--val-text-dim)", marginTop: 6, fontWeight: 500 }}>
              {notes.length > 0 ? `${notes.length} note${notes.length !== 1 ? "s" : ""} · Capture thoughts, deal commentary and meeting notes` : "Capture thoughts, deal commentary and meeting notes"}
            </p>
          </div>
          <button className="btn-primary" onClick={createNote}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Note
          </button>
        </div>
        {/* Search */}
        {notes.length > 0 && (
          <div style={{ position: "relative", marginBottom: 20 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--val-text-dim)" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="search-inp" placeholder="Search notes…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}
        {/* Empty state */}
        {notes.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "var(--val-r-xl)", background: "var(--val-green-tint)", border: "1px solid var(--val-border-accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--val-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--val-text)", marginBottom: 8, letterSpacing: "-.02em" }}>No notes yet</h3>
            <p style={{ fontSize: 14, color: "var(--val-text-mid)", marginBottom: 28, maxWidth: 340, lineHeight: 1.6, fontWeight: 500 }}>Capture thoughts, deal commentary, meeting notes and research — all in one place.</p>
            <button className="btn-primary" onClick={createNote} style={{ height: 40, padding: "0 24px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create First Note
            </button>
          </div>
        )}
        {/* Notes layout — list + editor side by side */}
        {notes.length > 0 && (
          <div className="notes-layout" style={{ display: "grid", gridTemplateColumns: selectedId ? "320px 1fr" : "1fr", gap: 16, alignItems: "start" }}>
            {/* Note list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--val-text-dim)", padding: "20px 0", fontWeight: 500 }}>No notes match your search.</p>
              )}
              {filtered.map((note, i) => (
                <div
                  key={note.id}
                  className={`note-card ${selectedId === note.id ? "selected" : ""}`}
                  style={{ animationDelay: `${i * 0.03}s` }}
                  onClick={() => selectNote(note)}
                >
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteModal(note); }}
                    style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--val-text-dim)", cursor: "pointer", padding: 4, borderRadius: "var(--val-r-xs)", opacity: 0, transition: "opacity var(--val-dur) var(--val-ease)" }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--val-red)" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  </button>
                  <div style={{ fontSize: 14, fontWeight: 700, color: selectedId === note.id ? "var(--val-green)" : "var(--val-text)", marginBottom: 6, paddingRight: 20, letterSpacing: "-.015em" }}>
                    {firstLine(note.body)}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--val-text-mid)", lineHeight: 1.6, marginBottom: 10, fontWeight: 500 }}>
                    {excerpt(note.body.split("\n").slice(1).join("\n") || note.body)}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--val-text-dim)", fontFamily: "var(--val-font-mono)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                    {timeAgo(note.updated_at)}
                  </div>
                </div>
              ))}
            </div>
            {/* Editor */}
            {selectedId && (
              <div className={`note-editor-col ${mobileEditorOpen ? "mobile-open" : ""}`} style={{ display: "flex", flexDirection: "column", position: "sticky", top: 40 }}>
                <div className="note-editor">
                  {/* Editor toolbar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--val-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button className="btn-ghost" style={{ height:28, padding: "0 10px", fontSize: 11 }} onClick={closeEditor}>
                        ← Back
                      </button>
                      <span style={{ fontSize: 11, color: "var(--val-text-dim)", fontFamily: "var(--val-font-mono)", fontWeight: 500, display: "inline-flex", alignItems: "center" }}>
                        {saving ? <><span style={{width:8,height:8,borderRadius:"50%",background:"var(--val-amber)",display:"inline-block",marginRight:6}}/>Saving…</> : <><span style={{width:8,height:8,borderRadius:"50%",background:"var(--val-green)",display:"inline-block",marginRight:6}}/>Saved</>}
                      </span>
                    </div>
                    <button
                      onClick={() => setDeleteModal(notes.find(n => n.id === selectedId))}
                      style={{ background: "none", border: "none", color: "var(--val-text-dim)", cursor: "pointer", padding: "4px 8px", borderRadius: "var(--val-r-xs)", fontSize: 11, fontFamily: "var(--val-font-body)", fontWeight: 500, display: "flex", alignItems: "center", gap: 5, transition: "color var(--val-dur) var(--val-ease)" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--val-red)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--val-text-dim)")}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                      Delete
                    </button>
                  </div>
                  {/* Textarea */}
                  <textarea
                    ref={textareaRef}
                    className="editor-textarea"
                    placeholder="Start writing…"
                    value={editorBody}
                    onChange={e => setEditorBody(e.target.value)}
                    style={{ flex: 1, minHeight: "calc(100vh - 260px)" }}
                  />
                  {/* Footer */}
                  <div style={{ padding: "12px 18px", borderTop: "1px solid var(--val-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--val-text-dim)", fontWeight: 500 }}>
                      {editorBody.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <span style={{ fontSize: 11, color: "var(--val-text-dim)", fontFamily: "var(--val-font-mono)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                      {new Date(notes.find(n => n.id === selectedId)?.updated_at || "").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* ── DELETE MODAL ── */}
      {deleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "var(--val-bg-overlay)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, animation: "fadeIn .15s ease" }}>
          <div style={{ background: "var(--val-bg-panel)", border: "1px solid var(--val-border)", borderRadius: "var(--val-r-xl)", padding: 28, width: 420, maxWidth: "calc(100vw - 32px)", boxShadow: "0 20px 60px rgba(0,0,0,0.45)" }}>
            <div style={{ fontFamily: "var(--val-font-body)", fontSize: 22, fontWeight: 700, letterSpacing: "-.015em", marginBottom: 8, color: "var(--val-red)" }}>Delete Note</div>
            <p style={{ fontSize: 13, color: "var(--val-text-mid)", marginBottom: 6, fontWeight: 500 }}>
              This will permanently delete <strong style={{ color: "var(--val-text)", fontWeight: 600 }}>"{firstLine(deleteModal.body)}"</strong>.
            </p>
            <p style={{ fontSize: 12, color: "var(--val-text-dim)", marginBottom: 24, fontWeight: 500 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost" onClick={() => setDeleteModal(null)} style={{ flex: 1, height: 40 }}>Cancel</button>
              <button
                onClick={deleteNote}
                disabled={deleting}
                style={{ flex: 1, background: "var(--val-red)", color: "#fff", border: "none", borderRadius: "var(--val-r-sm)", height: 40, fontFamily: "var(--val-font-body)", fontSize: 13, fontWeight: 600, letterSpacing: "-.015em", cursor: "pointer", opacity: deleting ? 0.6 : 1 }}
              >
                {deleting ? "Deleting…" : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <button className="bottom-nav-item" onClick={() => router.push("/dashboard")}>
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
        <button className="bottom-nav-item active">
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Notes
        </button>
      </nav>
    </div>
  );
}
