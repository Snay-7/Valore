"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Instrument+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold-l:#e2c97e;--gold-bg:rgba(201,168,76,0.07);--gold-border:rgba(201,168,76,0.2);
  --bg:#06070a;--bg1:#0c0e12;--bg2:#12151a;--bg3:#191d24;--bg4:#21262f;--bg5:#2a303b;
  --text:#eceae4;--text-m:#7d8590;--text-d:#3d4249;
  --border:rgba(255,255,255,0.06);--border-m:rgba(255,255,255,0.12);
  --green:#3ddc84;--red:#f4645f;--amber:#f0a429;--blue:#5b9cf6;--purple:#a78bfa;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
.inp{width:100%;padding:11px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--font-body);font-size:13px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold);box-shadow:0 0 0 2px rgba(201,168,76,.1)}
.inp::placeholder{color:var(--text-d)}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:7px;padding:10px 20px;font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:background .2s;display:inline-flex;align-items:center;gap:8px}
.btn-primary:hover{background:var(--gold-l)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:7px;padding:9px 16px;font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-danger{background:transparent;color:var(--red);border:1px solid rgba(244,100,95,.3);border-radius:6px;padding:5px 12px;font-family:var(--font-body);font-size:11px;cursor:pointer;transition:all .2s}
.btn-danger:hover{background:rgba(244,100,95,.1)}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:16px;animation:fadeIn .3s ease both}
.section-title{font-family:var(--font-display);font-size:20px;font-weight:400;color:var(--text);margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid var(--border)}
.member-row{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--bg4)}
.member-row:last-child{border-bottom:none}
.avatar{width:36px;height:36px;border-radius:50%;background:var(--gold-bg);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--gold);flex-shrink:0}
.role-badge{font-size:10px;padding:2px 8px;border-radius:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}
.role-admin{background:rgba(201,168,76,.12);color:var(--gold)}
.role-editor{background:rgba(91,156,246,.1);color:var(--blue)}
.role-viewer{background:rgba(125,133,144,.12);color:var(--text-m)}
.role-commenter{background:rgba(167,139,250,.1);color:var(--purple)}
.invite-row{display:flex;align-items:center;gap:14px;padding:10px 0;border-bottom:1px solid var(--bg4)}
.invite-row:last-child{border-bottom:none}
.tag-pending{background:rgba(240,164,41,.1);color:var(--amber);font-size:10px;padding:2px 8px;border-radius:10px;font-weight:600}
.role-select{background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--font-body);font-size:12px;padding:4px 8px;outline:none;cursor:pointer}
.role-select:focus{border-color:var(--gold)}
.seat-bar{height:4px;background:var(--bg4);border-radius:2px;overflow:hidden;margin-top:8px}
.seat-bar-fill{height:100%;background:var(--gold);border-radius:2px;transition:width .4s ease}
.sidebar{width:220px;background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}
.nav-item{width:100%;display:flex;align-items:center;padding:9px 12px;border-radius:7px;font-size:13px;color:var(--text-m);background:transparent;border:1px solid transparent;cursor:pointer;font-family:var(--font-body);transition:all .15s;text-align:left;margin-bottom:2px}
.nav-item:hover{color:var(--text);background:var(--bg3)}
.nav-item.active{color:var(--gold);background:rgba(201,168,76,.08);border-color:var(--gold-border);font-weight:600}
.mobile-topbar{display:none;align-items:center;justify-content:space-between;padding:16px 20px;background:var(--bg1);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg1);border-top:1px solid var(--border);z-index:100;padding:8px 0 env(safe-area-inset-bottom,16px)}
.bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 4px;background:none;border:none;color:var(--text-d);cursor:pointer;font-family:var(--font-body);font-size:9px;letter-spacing:.06em;text-transform:uppercase;transition:color .2s;position:relative}
.bottom-nav-item.active{color:var(--gold)}
.bottom-nav-item svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
@media(max-width:768px){
  .sidebar{display:none}
  .bottom-nav{display:flex}
  .mobile-topbar{display:flex}
  .main-content{margin-left:0!important;max-width:100vw!important;padding:20px 16px 100px!important}
  .page-grid{grid-template-columns:1fr!important}
}
`;

const ROLES = [
  { value: "admin",     label: "Admin",     desc: "Full access — manage members & all projects", color: "var(--gold)" },
  { value: "editor",    label: "Editor",    desc: "Can create & edit appraisals",                color: "var(--blue)" },
  { value: "viewer",    label: "Viewer",    desc: "Read-only access to assigned projects",        color: "var(--text-m)" },
  { value: "commenter", label: "Commenter", desc: "Can add notes & comments only",               color: "var(--purple)" },
];

const SEAT_LIMIT = 5;
const EXTRA_SEAT_PRICE = 50;
const TRIAL_DAYS = 14;

type Screen = "main" | "creating" | "success";

export default function TeamPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [firm, setFirm] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firmName, setFirmName] = useState("");
  const [savingFirm, setSavingFirm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [screen, setScreen] = useState<Screen>("main");
  const [createdFirmName, setCreatedFirmName] = useState("");
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isInTrial, setIsInTrial] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      const u = session.user;
      setUser(u);

      // Check subscription
      const { data: sub } = await supabase.from("subscriptions").select("tier").eq("user_id", u.id).maybeSingle();
      const tier = sub?.tier || "free";
      setIsEnterprise(tier === "enterprise" || tier === "professional");

      // Calculate trial
      const daysElapsed = (Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const daysLeft = Math.max(0, Math.ceil(TRIAL_DAYS - daysElapsed));
      setTrialDaysLeft(daysLeft);
      setIsInTrial(daysLeft > 0);

      // Load firm — no join to auth.users
      const { data: memberRow } = await supabase
        .from("firm_members")
        .select("*, firms(*)")
        .eq("user_id", u.id)
        .maybeSingle();
      if (memberRow?.firms) {
        setFirm(memberRow.firms);
        setFirmName(memberRow.firms.name || "");
        setIsAdmin(memberRow.role === "admin");
        await loadTeam(memberRow.firm_id);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  // ── KEY FIX: removed "*, user:user_id(email)" join that caused 400 ──
  const loadTeam = async (firmId: string) => {
    const { data: m } = await supabase
      .from("firm_members")
      .select("*")
      .eq("firm_id", firmId);
    setMembers(m || []);

    const { data: inv } = await supabase
      .from("firm_invites")
      .select("*")
      .eq("firm_id", firmId)
      .is("accepted_at", null);
    setInvites(inv || []);
  };

  const createFirm = async () => {
    if (!firmName.trim() || !user) return;
    if (!isEnterprise && !isInTrial) { router.push("/pricing"); return; }
    setScreen("creating");
    const { data: newFirm, error } = await supabase
      .from("firms")
      .insert({ name: firmName.trim() })
      .select()
      .single();
    if (error || !newFirm) { console.error(error); setScreen("main"); return; }
    await supabase.from("firm_members").insert({ firm_id: newFirm.id, user_id: user.id, role: "admin", invited_by: user.id });
    setCreatedFirmName(firmName.trim());
    setFirm(newFirm);
    setIsAdmin(true);
    await loadTeam(newFirm.id);
    setScreen("success");
  };

  const saveFirmName = async () => {
    if (!firm || !firmName.trim()) return;
    setSavingFirm(true);
    await supabase.from("firms").update({ name: firmName.trim() }).eq("id", firm.id);
    setFirm((f: any) => ({ ...f, name: firmName.trim() }));
    setSavingFirm(false);
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !firm) return;
    setInviting(true); setInviteError(null); setInviteLink(null);
    const { data: invite, error } = await supabase.from("firm_invites").insert({
      firm_id: firm.id,
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      invited_by: user.id,
    }).select().single();
    if (error) { setInviteError("Failed to create invite. This email may already be invited."); setInviting(false); return; }
    const link = `${window.location.origin}/invite/${invite.token}`;
    setInviteLink(link);
    try {
      await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), firmName: firm.name, inviteLink: link, inviterEmail: user.email, role: inviteRole }),
      });
    } catch (_) {}
    setInvites(prev => [...prev, invite]);
    setInviteEmail("");
    setInviting(false);
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    await supabase.from("firm_members").update({ role: newRole }).eq("id", memberId);
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
  };

  const removeMember = async (memberId: string) => {
    await supabase.from("firm_members").delete().eq("id", memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const revokeInvite = async (inviteId: string) => {
    await supabase.from("firm_invites").delete().eq("id", inviteId);
    setInvites(prev => prev.filter(i => i.id !== inviteId));
  };

  const copyLink = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const canCreate = isEnterprise || isInTrial;
  const seatsUsed = members.length;
  const totalSeats = members.length + invites.length;
  const seatPct = Math.min((seatsUsed / SEAT_LIMIT) * 100, 100);
  const extraSeats = Math.max(0, totalSeats - SEAT_LIMIT);
  const extraCost = extraSeats * EXTRA_SEAT_PRICE;
  const getRoleBadgeClass = (role: string) => ({ admin: "role-admin", editor: "role-editor", viewer: "role-viewer", commenter: "role-commenter" }[role] || "role-viewer");

  const Sidebar = () => (
    <div className="sidebar">
      <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--gold)", letterSpacing: ".1em", fontWeight: 300 }}>VALORA</div>
        <div style={{ fontSize: 9, color: "var(--text-d)", letterSpacing: ".14em", textTransform: "uppercase", marginTop: 2 }}>Development Appraisal</div>
      </div>
      <div style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 12px", marginBottom: 8 }}>Workspace</div>
        <button className="nav-item" onClick={() => router.push("/dashboard")}>Portfolio</button>
        <button className="nav-item" onClick={() => router.push("/pipeline")}>Pipeline</button>
        <button className="nav-item" onClick={() => router.push("/tasks")}>Tasks</button>
        <button className="nav-item active">Team</button>
        <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
        <div style={{ fontSize: 9, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".12em", padding: "0 12px", marginBottom: 8 }}>Manage</div>
        <button className="nav-item" onClick={() => router.push("/dashboard")}>Trash</button>
      </div>
      <div style={{ padding: "16px 16px 20px", borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--text-d)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
        <button className="nav-item" style={{ fontSize: 12 }} onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}>Sign Out</button>
      </div>
    </div>
  );

  const BottomNav = () => (
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
        <svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.85"/></svg>
        Team
      </button>
      <button className="bottom-nav-item" onClick={() => router.push("/dashboard")}>
        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        Trash
      </button>
    </nav>
  );

  // LOADING
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // CREATING
  if (screen === "creating") return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{CSS}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ fontSize: 14, color: "var(--text-d)" }}>Creating workspace…</p>
      </div>
    </div>
  );

  // SUCCESS
  if (screen === "success") return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)" }}>
      <style>{CSS}</style>
      <div style={{ textAlign: "center", maxWidth: 480, padding: "0 24px", animation: "scaleIn .4s ease" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gold-bg)", border: "2px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: 32, color: "var(--gold)" }}>✦</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 300, color: "var(--gold)", marginBottom: 14, letterSpacing: ".02em" }}>Workspace Created</h1>
        <p style={{ fontSize: 16, color: "var(--text-m)", lineHeight: 1.7, marginBottom: 8 }}>
          <strong style={{ color: "var(--text)" }}>{createdFirmName}</strong> is ready.
        </p>
        <p style={{ fontSize: 13, color: "var(--text-d)", marginBottom: 48, lineHeight: 1.7 }}>
          You're the admin. Invite your team, assign roles, and collaborate on appraisals together.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-ghost" onClick={() => setScreen("main")} style={{ padding: "12px 24px", fontSize: 13 }}>Invite Team Members →</button>
          <button className="btn-primary" onClick={() => router.push("/dashboard")} style={{ padding: "12px 28px", fontSize: 14 }}>Go to Dashboard →</button>
        </div>
      </div>
    </div>
  );

  // MAIN
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", display: "flex" }}>
      <style>{CSS}</style>
      <Sidebar />

      <div className="main-content" style={{ marginLeft: 220, flex: 1, minWidth: 0, padding: "48px 40px" }}>
        <div className="mobile-topbar">
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--gold)", letterSpacing: ".1em", fontWeight: 300 }}>VALORA</div>
          <div style={{ fontSize: 12, color: "var(--text-d)" }}>Team</div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>Team</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 300, marginBottom: 8 }}>
            {firm ? firm.name : "Team Collaboration"}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-m)" }}>
            {firm
              ? `${members.length} member${members.length !== 1 ? "s" : ""} · ${invites.length} pending invite${invites.length !== 1 ? "s" : ""}`
              : "Create a workspace and invite your team."}
          </p>
        </div>

        {/* Trial / upgrade banner */}
        {!firm && !isEnterprise && (
          <div style={{ background: isInTrial ? "rgba(61,220,132,.06)" : "var(--gold-bg)", border: `1px solid ${isInTrial ? "rgba(61,220,132,.2)" : "var(--gold-border)"}`, borderRadius: 12, padding: "16px 20px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            {isInTrial ? (
              <>
                <div>
                  <div style={{ fontSize: 13, color: "var(--green)", fontWeight: 600, marginBottom: 2 }}>✓ Free Trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining</div>
                  <div style={{ fontSize: 12, color: "var(--text-d)" }}>Full access to all features. Upgrade to Enterprise to keep access after your trial.</div>
                </div>
                <button className="btn-ghost" onClick={() => router.push("/pricing")} style={{ fontSize: 12, flexShrink: 0 }}>Upgrade to Enterprise →</button>
              </>
            ) : (
              <>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 300, color: "var(--gold)", marginBottom: 4 }}>Trial Ended — Enterprise Required</div>
                  <div style={{ fontSize: 12, color: "var(--text-m)" }}>Upgrade to Enterprise (£499/mo) to create workspaces. Free users can still join via invite link.</div>
                </div>
                <button className="btn-primary" onClick={() => router.push("/pricing")} style={{ flexShrink: 0 }}>Upgrade to Enterprise →</button>
              </>
            )}
          </div>
        )}

        <div className="page-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          <div>
            {/* Workspace card */}
            <div className="card">
              <div className="section-title">{firm ? "Workspace" : "Create Your Workspace"}</div>
              {!firm ? (
                <div>
                  <p style={{ fontSize: 13, color: "var(--text-m)", marginBottom: 20, lineHeight: 1.6 }}>
                    Create a shared workspace for your firm. Invited members need a Valora account (free or paid) to join.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input className="inp" value={firmName} onChange={e => setFirmName(e.target.value)} placeholder="e.g. Harrington Capital" style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && createFirm()} autoFocus />
                    <button className="btn-primary" onClick={createFirm} disabled={!firmName.trim()}>
                      {canCreate ? "Create Workspace" : "Upgrade to Create"}
                    </button>
                  </div>
                  <p style={{ fontSize: 11, marginTop: 10, color: isEnterprise ? "var(--gold)" : isInTrial ? "var(--green)" : "var(--text-d)" }}>
                    {isEnterprise ? "✦ Enterprise plan — unlimited workspaces" : isInTrial ? `✓ Free trial active — ${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} remaining` : "Workspace creation requires an Enterprise plan · £499/mo · Free users can join via invite"}
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--gold-bg)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 22, color: "var(--gold)", flexShrink: 0 }}>{firm.name[0]}</div>
                    <input className="inp" value={firmName} onChange={e => setFirmName(e.target.value)} readOnly={!isAdmin} style={{ flex: 1 }} />
                    {isAdmin && <button className="btn-ghost" onClick={saveFirmName} disabled={savingFirm}>{savingFirm ? "Saving…" : "Save"}</button>}
                  </div>
                  <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em" }}>Seats Used</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: seatsUsed >= SEAT_LIMIT ? "var(--amber)" : "var(--text-m)" }}>{seatsUsed} / {SEAT_LIMIT} included</span>
                    </div>
                    <div className="seat-bar"><div className="seat-bar-fill" style={{ width: `${seatPct}%`, background: seatsUsed >= SEAT_LIMIT ? "var(--amber)" : "var(--gold)" }} /></div>
                    {extraSeats > 0 && <div style={{ fontSize: 11, color: "var(--amber)", marginTop: 8 }}>+{extraSeats} extra seat{extraSeats > 1 ? "s" : ""} · £{extraCost}/mo additional</div>}
                  </div>
                </div>
              )}
            </div>

            {/* Members */}
            {firm && (
              <div className="card">
                <div className="section-title">Team Members ({members.length})</div>
                {members.length === 0
                  ? <div style={{ fontSize: 13, color: "var(--text-d)", textAlign: "center", padding: "24px 0" }}>No members yet — invite your team.</div>
                  : members.map(m => (
                    <div key={m.id} className="member-row">
                      <div className="avatar">{m.user_id?.toString()[0]?.toUpperCase() || "?"}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.user_id === user?.id ? user?.email : `Member ${m.user_id?.toString().slice(0, 8)}`}</div>
                        <div style={{ fontSize: 11, color: "var(--text-d)", marginTop: 2 }}>Joined {new Date(m.joined_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                      {isAdmin && m.user_id !== user?.id
                        ? <select className="role-select" value={m.role} onChange={e => updateMemberRole(m.id, e.target.value)}>{ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
                        : <span className={`role-badge ${getRoleBadgeClass(m.role)}`}>{m.role}</span>}
                      {m.user_id === user?.id && <span style={{ fontSize: 11, color: "var(--text-d)" }}>You</span>}
                      {isAdmin && m.user_id !== user?.id && <button className="btn-danger" onClick={() => removeMember(m.id)}>Remove</button>}
                    </div>
                  ))}
              </div>
            )}

            {/* Pending invites */}
            {firm && invites.length > 0 && (
              <div className="card">
                <div className="section-title">Pending Invites ({invites.length})</div>
                {invites.map(inv => (
                  <div key={inv.id} className="invite-row">
                    <div className="avatar" style={{ background: "rgba(240,164,41,.1)", borderColor: "rgba(240,164,41,.2)", color: "var(--amber)" }}>✉</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.email}</div>
                      <div style={{ fontSize: 11, color: "var(--text-d)", marginTop: 2 }}>{inv.role} · Invited {new Date(inv.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
                    </div>
                    <span className="tag-pending">Pending</span>
                    <button className="btn-ghost" onClick={() => copyLink(`${window.location.origin}/invite/${inv.token}`)} style={{ fontSize: 11, padding: "4px 10px" }}>{copiedLink ? "✓" : "Copy Link"}</button>
                    {isAdmin && <button className="btn-danger" onClick={() => revokeInvite(inv.id)}>Revoke</button>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div>
            {firm && isAdmin ? (
              <div className="card" style={{ position: "sticky", top: 24 }}>
                <div className="section-title">Invite a Team Member</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 6 }}>Email Address</label>
                  <input className="inp" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@firm.com" onKeyDown={e => e.key === "Enter" && sendInvite()} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 8 }}>Role</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {ROLES.map(r => (
                      <div key={r.value} onClick={() => setInviteRole(r.value)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: `1px solid ${inviteRole === r.value ? "var(--gold-border)" : "var(--border)"}`, background: inviteRole === r.value ? "var(--gold-bg)" : "var(--bg3)", cursor: "pointer", transition: "all .15s" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: inviteRole === r.value ? "var(--gold)" : "var(--text)" }}>{r.label}</div>
                          <div style={{ fontSize: 10, color: "var(--text-d)", marginTop: 1 }}>{r.desc}</div>
                        </div>
                        {inviteRole === r.value && <span style={{ color: "var(--gold)", fontSize: 14 }}>✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" onClick={sendInvite} disabled={inviting || !inviteEmail.trim()} style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                  {inviting ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,.2)", borderTopColor: "#06070a", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} /> Sending…</> : "Send Invite →"}
                </button>
                {inviteError && <div style={{ marginTop: 12, background: "rgba(244,100,95,.1)", border: "1px solid rgba(244,100,95,.2)", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "var(--red)" }}>{inviteError}</div>}
                {inviteLink && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, color: "var(--green)", marginBottom: 8 }}>✓ Invite created — share this link:</div>
                    <div style={{ background: "var(--bg3)", borderRadius: 7, padding: "9px 12px", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gold)", wordBreak: "break-all", marginBottom: 8 }}>{inviteLink}</div>
                    <button className="btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 12 }} onClick={() => copyLink(inviteLink)}>{copiedLink ? "✓ Copied!" : "Copy Invite Link"}</button>
                    <p style={{ fontSize: 11, color: "var(--text-d)", marginTop: 10, lineHeight: 1.5 }}>The invitee must sign in to Valora to accept. They'll get a free account if they don't have one.</p>
                  </div>
                )}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Seat Pricing</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-m)", marginBottom: 6 }}>
                    <span>Included seats</span><span style={{ color: "var(--gold)", fontFamily: "var(--font-mono)" }}>5 seats</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-m)" }}>
                    <span>Additional seats</span><span style={{ color: "var(--gold)", fontFamily: "var(--font-mono)" }}>£{EXTRA_SEAT_PRICE}/mo each</span>
                  </div>
                  {extraSeats > 0 && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "var(--text-m)" }}>Extra charges</span>
                      <span style={{ color: "var(--amber)", fontFamily: "var(--font-mono)" }}>£{extraCost}/mo</span>
                    </div>
                  )}
                </div>
              </div>
            ) : !firm ? (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>How it works</div>
                {[["✦","Create your workspace","Give your firm a name to get started"],["✉","Invite by email or link","Team members sign in with their Valora account"],["◈","Assign roles","Admin · Editor · Viewer · Commenter"],["▦","Collaborate","Members see their assigned appraisals & tasks"]].map(([icon, title, desc]) => (
                  <div key={title as string} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--gold-bg)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--gold)", flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 2 }}>{title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-d)", lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
