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
  --green:#3ddc84;--red:#f4645f;--amber:#f0a429;--blue:#5b9cf6;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
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
.avatar{width:36px;height:36px;border-radius:50%;background:var(--gold-bg);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--gold);flex-shrink:0}
.role-badge{font-size:10px;padding:2px 8px;border-radius:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.role-admin{background:rgba(201,168,76,.12);color:var(--gold)}
.role-member{background:rgba(91,156,246,.1);color:var(--blue)}
.invite-row{display:flex;align-items:center;gap:14px;padding:10px 0;border-bottom:1px solid var(--bg4)}
.tag-pending{background:rgba(240,164,41,.1);color:var(--amber);font-size:10px;padding:2px 8px;border-radius:10px}
@media(max-width:768px){.page-grid{grid-template-columns:1fr !important}}
`;

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
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string|null>(null);
  const [inviteError, setInviteError] = useState<string|null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setUser(session.user);

      // Check subscription
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", session.user.id).maybeSingle();
      setSubscription(sub);

      // Load firm membership
      const { data: memberRow } = await supabase.from("firm_members").select("*, firms(*)").eq("user_id", session.user.id).maybeSingle();

      if (memberRow) {
        setFirm(memberRow.firms);
        setFirmName(memberRow.firms?.name || "");
        setIsAdmin(memberRow.role === "admin");
        await loadTeam(memberRow.firm_id);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const loadTeam = async (firmId: string) => {
    const { data: m } = await supabase.from("firm_members").select("*, user:user_id(email)").eq("firm_id", firmId);
    setMembers(m || []);
    const { data: inv } = await supabase.from("firm_invites").select("*").eq("firm_id", firmId).is("accepted_at", null);
    setInvites(inv || []);
  };

  const createFirm = async () => {
    if (!firmName.trim() || !user) return;
    setSavingFirm(true);
    // Create firm
    const { data: newFirm, error } = await supabase.from("firms").insert({ name: firmName.trim(), owner_id: user.id }).select().single();
    if (error || !newFirm) { setSavingFirm(false); return; }
    // Add owner as admin
    await supabase.from("firm_members").insert({ firm_id: newFirm.id, user_id: user.id, role: "admin", invited_by: user.id });
    setFirm(newFirm);
    setIsAdmin(true);
    await loadTeam(newFirm.id);
    setSavingFirm(false);
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
    // Create invite record
    const { data: invite, error } = await supabase.from("firm_invites").insert({
      firm_id: firm.id,
      email: inviteEmail.trim().toLowerCase(),
      role: "member",
      invited_by: user.id,
    }).select().single();

    if (error) { setInviteError("Failed to create invite. This email may already be invited."); setInviting(false); return; }

    const link = `${window.location.origin}/invite/${invite.token}`;
    setInviteLink(link);

    // Try to send via API (email)
    try {
      await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), firmName: firm.name, inviteLink: link, inviterEmail: user.email }),
      });
    } catch (e) { /* email optional — link still works */ }

    setInvites(prev => [...prev, invite]);
    setInviteEmail("");
    setInviting(false);
  };

  const copyInviteLink = async (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const removeMember = async (memberId: string) => {
    await supabase.from("firm_members").delete().eq("id", memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const revokeInvite = async (inviteId: string) => {
    await supabase.from("firm_invites").delete().eq("id", inviteId);
    setInvites(prev => prev.filter(i => i.id !== inviteId));
  };

  const tier = subscription?.tier || "free";
  const isEnterprise = tier === "enterprise";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{ background: "var(--bg1)", borderBottom: "1px solid var(--border)", padding: "0 40px", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--gold)", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 300, cursor: "pointer", letterSpacing: ".1em" }}>VALORA</button>
        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
        <button onClick={() => router.push("/dashboard")} className="btn-ghost" style={{ padding: "5px 12px", fontSize: 11 }}>Dashboard</button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--text-d)" }}>{user?.email}</span>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 40px" }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>Team</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 300, marginBottom: 8 }}>Team Collaboration</h1>
          <p style={{ fontSize: 14, color: "var(--text-m)" }}>Invite team members, share projects and manage your firm workspace.</p>
        </div>

        {/* Enterprise gate */}
        {!isEnterprise && (
          <div style={{ background: "linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.04))", border: "1px solid var(--gold-border)", borderRadius: 14, padding: "28px 32px", marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 300, color: "var(--gold)", marginBottom: 6 }}>Enterprise Feature</div>
              <p style={{ fontSize: 13, color: "var(--text-m)", maxWidth: 440, lineHeight: 1.6 }}>
                Team collaboration is available on the Enterprise plan (£499/mo). Invite unlimited team members, assign projects, and manage roles across your firm.
              </p>
            </div>
            <button className="btn-primary" onClick={() => router.push("/pricing")} style={{ padding: "12px 24px", flexShrink: 0 }}>Upgrade to Enterprise →</button>
          </div>
        )}

        <div className="page-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, opacity: !isEnterprise ? 0.4 : 1, pointerEvents: !isEnterprise ? "none" : "auto" }}>

          {/* Left — Firm & Members */}
          <div>
            {/* Firm setup */}
            <div className="card">
              <div className="section-title">
                {firm ? "Firm Workspace" : "Create Your Firm Workspace"}
              </div>
              {!firm ? (
                <div>
                  <p style={{ fontSize: 13, color: "var(--text-m)", marginBottom: 16, lineHeight: 1.6 }}>Create a shared workspace for your team. All invited members will be able to access shared projects.</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input className="inp" value={firmName} onChange={e => setFirmName(e.target.value)} placeholder="e.g. Harrington Capital" style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && createFirm()} />
                    <button className="btn-primary" onClick={createFirm} disabled={savingFirm || !firmName.trim()}>
                      {savingFirm ? "Creating…" : "Create Workspace"}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Workspace Name</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input className="inp" value={firmName} onChange={e => setFirmName(e.target.value)} style={{ flex: 1 }} readOnly={!isAdmin} />
                    {isAdmin && <button className="btn-ghost" onClick={saveFirmName} disabled={savingFirm}>{savingFirm ? "Saving…" : "Save"}</button>}
                  </div>
                </div>
              )}
            </div>

            {/* Members list */}
            {firm && (
              <div className="card">
                <div className="section-title">Team Members ({members.length})</div>
                {members.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--text-d)", textAlign: "center", padding: "20px 0" }}>No members yet — invite your team using the form.</div>
                ) : (
                  members.map((m, i) => (
                    <div key={m.id} className="member-row">
                      <div className="avatar">{(m.user?.email || "?")[0].toUpperCase()}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{m.user?.email || "—"}</div>
                        <div style={{ fontSize: 11, color: "var(--text-d)", marginTop: 2 }}>
                          Joined {new Date(m.joined_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      <span className={`role-badge ${m.role === "admin" ? "role-admin" : "role-member"}`}>{m.role}</span>
                      {isAdmin && m.user_id !== user?.id && (
                        <button className="btn-danger" onClick={() => removeMember(m.id)}>Remove</button>
                      )}
                      {m.user_id === user?.id && (
                        <span style={{ fontSize: 11, color: "var(--text-d)" }}>You</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pending invites */}
            {firm && invites.length > 0 && (
              <div className="card">
                <div className="section-title">Pending Invites ({invites.length})</div>
                {invites.map(inv => (
                  <div key={inv.id} className="invite-row">
                    <div className="avatar" style={{ background: "rgba(240,164,41,.1)", borderColor: "rgba(240,164,41,.2)", color: "var(--amber)" }}>✉</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "var(--text)" }}>{inv.email}</div>
                      <div style={{ fontSize: 11, color: "var(--text-d)", marginTop: 2 }}>
                        Invited {new Date(inv.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                    <span className="tag-pending">Pending</span>
                    <button className="btn-ghost" onClick={() => copyInviteLink(inv.token)} style={{ fontSize: 11, padding: "4px 10px" }}>Copy Link</button>
                    {isAdmin && <button className="btn-danger" onClick={() => revokeInvite(inv.id)}>Revoke</button>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Invite form */}
          <div>
            {firm && isAdmin && (
              <div className="card" style={{ position: "sticky", top: 24 }}>
                <div className="section-title">Invite a Team Member</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 6 }}>Email Address</label>
                  <input className="inp" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@firm.com" onKeyDown={e => e.key === "Enter" && sendInvite()} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 10, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 6 }}>Role</label>
                  <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--blue)" }}>Member — can create & edit projects</div>
                </div>
                <button className="btn-primary" onClick={sendInvite} disabled={inviting || !inviteEmail.trim()} style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                  {inviting ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,.2)", borderTopColor: "#06070a", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />Sending…</> : "Send Invite →"}
                </button>

                {inviteError && (
                  <div style={{ marginTop: 12, background: "rgba(244,100,95,.1)", border: "1px solid rgba(244,100,95,.2)", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "var(--red)" }}>{inviteError}</div>
                )}

                {inviteLink && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, color: "var(--green)", marginBottom: 8 }}>✓ Invite created — share this link:</div>
                    <div style={{ background: "var(--bg3)", borderRadius: 7, padding: "9px 12px", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gold)", wordBreak: "break-all", marginBottom: 8 }}>{inviteLink}</div>
                    <button className="btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 12 }} onClick={() => { navigator.clipboard.writeText(inviteLink); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }}>
                      {copiedLink ? "✓ Copied!" : "Copy Invite Link"}
                    </button>
                    <p style={{ fontSize: 11, color: "var(--text-d)", marginTop: 10, lineHeight: 1.5 }}>If you set up email sending, the invite was also emailed to {inviteEmail || "the recipient"}.</p>
                  </div>
                )}
              </div>
            )}

            {firm && !isAdmin && (
              <div className="card">
                <div style={{ fontSize: 13, color: "var(--text-m)", lineHeight: 1.7 }}>
                  You are a <strong style={{ color: "var(--blue)" }}>Member</strong> of <strong style={{ color: "var(--text)" }}>{firm.name}</strong>. Contact your workspace admin to invite additional team members.
                </div>
              </div>
            )}

            {/* Info card */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginTop: 16 }}>
              <div style={{ fontSize: 11, color: "var(--text-d)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>How it works</div>
              {[
                ["1", "Create your firm workspace above"],
                ["2", "Invite team members by email"],
                ["3", "They click the link and join your workspace"],
                ["4", "Assign projects to team members from the dashboard"],
              ].map(([n, t]) => (
                <div key={n} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--gold)", flexShrink: 0, marginTop: 1 }}>{n}</div>
                  <div style={{ fontSize: 12, color: "var(--text-m)", lineHeight: 1.5 }}>{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
