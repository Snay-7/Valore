"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";


const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#52C498;--gold-l:#72D4AE;--gold-bg:rgba(82,196,152,0.08);--gold-border:rgba(82,196,152,0.22);
  --bg:#0D1017;--bg1:#252D3F;--bg2:#141920;--bg3:#1A2030;--bg4:#202840;--bg5:#2A3350;
  --text:#F0EEE8;--text-m:#8B93A5;--text-d:#4D5570;
  --border:rgba(255,255,255,0.07);--border-m:rgba(255,255,255,0.13);
  --green:#52C498;--red:#D45252;--amber:#E0A030;--blue:#4A80C4;
  --font-display:'Inter',system-ui,sans-serif;
  --font-body:'Inter',system-ui,sans-serif;
  --font-mono:'DM Mono',monospace;
}
body.light{
  --gold:#2A8A64;--gold-l:#1F7050;--gold-bg:rgba(82,196,152,0.09);--gold-border:rgba(82,196,152,0.25);
  --bg:#F8F9FA;--bg1:#252D3F;--bg2:#FFFFFF;--bg3:#F8F9FA;--bg4:#E8EAED;--bg5:#DDE0E6;
  --text:#1E2433;--text-m:#5A6478;--text-d:#9AA3AF;
  --border:#E8EAED;--border-m:#D0D4DC;
  --green:#2A8A64;--red:#C04040;--amber:#B07820;--blue:#2A5FAA;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

.sidebar{width:210px;background:#252D3F;border-right:none;display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}
.nav-item{width:100%;display:flex;align-items:center;padding:8px 12px;border-radius:7px;font-size:13px;color:#8B93A5;background:transparent;border:1px solid transparent;cursor:pointer;font-family:var(--font-body);transition:all .15s;text-align:left;margin-bottom:2px}
.nav-item:hover{color:#F0EEE8;background:rgba(255,255,255,0.07)}
.nav-item.active{color:#52C498;background:rgba(82,196,152,.12);border-color:rgba(82,196,152,.25);font-weight:600}

.btn-primary{background:var(--gold);color:#fff;border:none;border-radius:8px;padding:9px 18px;font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:7px}
.btn-primary:hover{background:var(--gold-l);transform:translateY(-1px)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border-m);border-radius:8px;padding:8px 16px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:7px}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-danger{background:transparent;color:var(--red);border:1px solid rgba(192,64,64,.25);border-radius:6px;padding:6px 12px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s}
.btn-danger:hover{background:rgba(192,64,64,.08);border-color:var(--red)}

.note-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;cursor:pointer;transition:all .2s;animation:fadeUp .25s ease both;position:relative;overflow:hidden}
.note-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--gold);opacity:0;transition:opacity .2s}
.note-card:hover{border-color:var(--gold-border);transform:translateY(-2px);box-shadow:0 4px 20px rgba(42,138,100,.08)}
.note-card:hover::before{opacity:1}
.note-card.selected{border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-bg)}
.note-card.selected::before{opacity:1}

.note-editor{background:var(--bg2);border:1px solid var(--border);border-radius:12px;display:flex;flex-direction:column;animation:slideIn .2s ease both;height:100%;overflow:hidden}
.editor-textarea{width:100%;flex:1;background:transparent;border:none;color:var(--text);font-family:var(--font-body);font-size:15px;line-height:1.8;padding:24px;outline:none;resize:none;min-height:300px}
.editor-textarea::placeholder{color:var(--text-d)}

.search-inp{width:100%;padding:9px 12px 9px 36px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--font-body);font-size:13px;outline:none;transition:all .2s}
.search-inp:focus{border-color:var(--gold);background:var(--bg2);box-shadow:0 0 0 3px var(--gold-bg)}
.search-inp::placeholder{color:var(--text-d)}

.mobile-topbar{display:none;align-items:center;justify-content:space-between;padding:12px 16px;background:#252D3F;border-bottom:1px solid rgba(255,255,255,0.07);position:sticky;top:0;z-index:50}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:#252D3F;border-top:1px solid rgba(255,255,255,0.07);z-index:100;padding:6px 0 env(safe-area-inset-bottom,12px)}
.bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 4px;background:none;border:none;color:rgba(240,238,232,.4);cursor:pointer;font-family:var(--font-body);font-size:9px;letter-spacing:.06em;text-transform:uppercase;transition:color .2s}
.bottom-nav-item.active{color:#52C498}
.bottom-nav-item svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}

.note-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:var(--gold-bg);color:var(--gold);border:1px solid var(--gold-border)}

@media(max-width:768px){
  .sidebar{display:none}
  .bottom-nav{display:flex}
  .mobile-topbar{display:flex}
  .main-wrap{margin-left:0!important;padding:16px 14px 90px!important;max-width:100vw!important}
  .notes-layout{grid-template-columns:1fr!important}
  .note-editor-col{display:none}
  .note-editor-col.mobile-open{display:flex!important;position:fixed;inset:0;z-index:150;padding:0;background:var(--bg)}
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
    <div style={{ minHeight: "100vh", background: "#0D1017", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <span onClick={()=>router.push("/dashboard")} style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:16,fontWeight:600,letterSpacing:"-.02em",color:"#ffffff",cursor:"pointer"}}>Valora</span>
      <div style={{ width: 26, height: 26, border: "2px solid rgba(82,196,152,.15)", borderTopColor: "#52C498", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );


  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", display: "flex" }}>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{__html:`(function(){var t=localStorage.getItem('valora-theme')||'light';if(t==='light')document.body.classList.add('light');})()`}}/>


      {/* ── SIDEBAR ── */}
      <div className="sidebar">
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <span onClick={()=>router.push("/dashboard")} style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:16,fontWeight:700,letterSpacing:"-.03em",color:"#ffffff",cursor:"pointer",display:"block",marginBottom:3}}>Valora</span>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: ".14em", textTransform: "uppercase" }}>Development Appraisal</div>
        </div>
        <div style={{ padding: "14px 10px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 10px", marginBottom: 6 }}>My Work</div>
          <button className="nav-item" onClick={() => router.push("/dashboard")}>Portfolio</button>
          <button className="nav-item" onClick={() => router.push("/pipeline")}>Pipeline</button>
          <button className="nav-item" onClick={() => router.push("/tasks")}>Tasks</button>
          <button className="nav-item active">Notes</button>
          {hasFirm && (<>
            <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
            <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 10px", marginBottom: 6 }}>Team</div>
            <button className="nav-item" onClick={() => router.push("/workspace")} style={{ color: "var(--gold)" }}>◈ Workspace</button>
            <button className="nav-item" onClick={() => router.push("/team")}>Team</button>
          </>)}
          {!hasFirm && <button className="nav-item" onClick={() => router.push("/team")}>Team</button>}
        </div>
        <div style={{ padding: "10px 10px 14px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--text-d)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          <button className="nav-item" onClick={signOut} style={{ fontSize: 12 }}>Sign Out</button>
        </div>
      </div>


      {/* ── MOBILE TOPBAR ── */}
      <div className="mobile-topbar">
        <img src="data:image/png;base64,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" alt="Valora" style={{ height: "24px", width: "auto" }}/>
        <button className="btn-primary" style={{ padding: "7px 14px", fontSize: 12 }} onClick={createNote}>+ Note</button>
      </div>


      {/* ── MAIN ── */}
      <div className="main-wrap" style={{ marginLeft: 210, flex: 1, padding: "32px", maxWidth: "calc(100vw - 210px)" }}>


        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.02em", color: "var(--text)", lineHeight: 1 }}>Notes</h1>
            <p style={{ fontSize: 13, color: "var(--text-d)", marginTop: 4 }}>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-d)" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="search-inp" placeholder="Search notes…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}


        {/* Empty state */}
        {notes.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--gold-bg)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 8, letterSpacing: "-.01em" }}>No notes yet</h3>
            <p style={{ fontSize: 14, color: "var(--text-m)", marginBottom: 28, maxWidth: 320, lineHeight: 1.6 }}>Capture thoughts, deal commentary, meeting notes and research — all in one place.</p>
            <button className="btn-primary" onClick={createNote} style={{ padding: "12px 28px", fontSize: 13 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create First Note
            </button>
          </div>
        )}


        {/* Notes layout — list + editor side by side */}
        {notes.length > 0 && (
          <div className="notes-layout" style={{ display: "grid", gridTemplateColumns: selectedId ? "300px 1fr" : "1fr", gap: 16, alignItems: "start" }}>


            {/* Note list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--text-d)", padding: "20px 0" }}>No notes match your search.</p>
              )}
              {filtered.map((note, i) => (
                <div
                  key={note.id}
                  className={`note-card ${selectedId === note.id ? "selected" : ""}`}
                  style={{ animationDelay: `${i * 0.03}s` }}
                  onClick={() => selectNote(note)}
                >
                  {/* Delete button */}
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteModal(note); }}
                    style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-d)", cursor: "pointer", padding: 4, borderRadius: 4, opacity: 0, transition: "opacity .15s" }}
                    className="note-delete-btn"
                    onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  </button>


                  <div style={{ fontSize: 14, fontWeight: 600, color: selectedId === note.id ? "var(--gold)" : "var(--text)", marginBottom: 6, paddingRight: 20, letterSpacing: "-.01em" }}>
                    {firstLine(note.body)}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-m)", lineHeight: 1.6, marginBottom: 10 }}>
                    {excerpt(note.body.split("\n").slice(1).join("\n") || note.body)}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-d)", fontFamily: "var(--font-mono)" }}>
                    {timeAgo(note.updated_at)}
                  </div>
                </div>
              ))}
            </div>


            {/* Editor */}
            {selectedId && (
              <div className={`note-editor-col ${mobileEditorOpen ? "mobile-open" : ""}`} style={{ display: "flex", flexDirection: "column", position: "sticky", top: 32 }}>
                <div className="note-editor">
                  {/* Editor toolbar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={closeEditor}>
                        ← Back
                      </button>
                      <span style={{ fontSize: 11, color: "var(--text-d)", fontFamily: "var(--font-mono)" }}>
                        {saving ? <><span style={{width:8,height:8,borderRadius:"50%",background:"var(--amber)",display:"inline-block",marginRight:6}}/>Saving…</> : <><span style={{width:8,height:8,borderRadius:"50%",background:"var(--green)",display:"inline-block",marginRight:6}}/>Saved</>}
                      </span>
                    </div>
                    <button
                      onClick={() => setDeleteModal(notes.find(n => n.id === selectedId))}
                      style={{ background: "none", border: "none", color: "var(--text-d)", cursor: "pointer", padding: "4px 8px", borderRadius: 5, fontSize: 11, fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: 5, transition: "color .15s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--text-d)")}
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
                  <div style={{ padding: "10px 18px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text-d)" }}>
                      {editorBody.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-d)", fontFamily: "var(--font-mono)" }}>
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, animation: "fadeIn .15s ease" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border-m)", borderRadius: 16, padding: 28, width: 400, maxWidth: "calc(100vw - 32px)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 300, marginBottom: 8, color: "var(--red)" }}>Delete Note</div>
            <p style={{ fontSize: 13, color: "var(--text-m)", marginBottom: 6 }}>
              This will permanently delete <strong style={{ color: "var(--text)" }}>"{firstLine(deleteModal.body)}"</strong>.
            </p>
            <p style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost" onClick={() => setDeleteModal(null)} style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
              <button
                onClick={deleteNote}
                disabled={deleting}
                style={{ flex: 1, background: "var(--red)", color: "#fff", border: "none", borderRadius: 7, padding: "9px 18px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: deleting ? 0.6 : 1 }}
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
