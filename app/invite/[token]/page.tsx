"use client";
export const dynamic = 'force-dynamic'
import { useState, useEffect, Suspense } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Instrument+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold-l:#e2c97e;--gold-bg:rgba(201,168,76,0.07);--gold-border:rgba(201,168,76,0.2);
  --bg:#06070a;--bg1:#0c0e12;--bg2:#12151a;--bg3:#191d24;--bg4:#21262f;
  --text:#eceae4;--text-m:#7d8590;--text-d:#3d4249;
  --border:rgba(255,255,255,0.06);--border-m:rgba(255,255,255,0.12);
  --green:#3ddc84;--red:#f4645f;--blue:#5b9cf6;--purple:#a78bfa;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
.inp{width:100%;padding:13px 16px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--font-body);font-size:14px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.1)}
.inp::placeholder{color:var(--text-d)}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:8px;padding:14px 28px;font-family:var(--font-body);font-size:14px;font-weight:600;cursor:pointer;transition:background .2s;width:100%;display:block;text-align:center}
.btn-primary:hover{background:var(--gold-l)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.btn-ghost{background:transparent;color:var(--text-m);border:1px solid var(--border);border-radius:8px;padding:13px 28px;font-family:var(--font-body);font-size:13px;cursor:pointer;transition:all .2s;width:100%;display:block;text-align:center;margin-top:10px}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.tab{flex:1;padding:9px;border-radius:7px;font-size:12px;font-weight:500;border:none;cursor:pointer;font-family:var(--font-body);transition:all .2s}
.tab.active{background:var(--bg4);border:1px solid var(--border);color:var(--text)}
.tab.inactive{background:transparent;border:1px solid transparent;color:var(--text-d)}
`;

const ROLE_CONFIG: Record<string, { label: string; color: string; desc: string }> = {
  admin:     { label: "Admin",     color: "var(--gold)",   desc: "Full access — manage members & all projects" },
  editor:    { label: "Editor",    color: "var(--blue)",   desc: "Can create & edit appraisals" },
  viewer:    { label: "Viewer",    color: "var(--text-m)", desc: "Read-only access to assigned projects" },
  commenter: { label: "Commenter", color: "var(--purple)", desc: "Can add notes & comments only" },
  member:    { label: "Member",    color: "var(--blue)",   desc: "Access to shared workspace projects" },
};

function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [alreadyAccepted, setAlreadyAccepted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");

  useEffect(() => {
    const init = async () => {
      const { data: inv } = await supabase
        .from("firm_invites")
        .select("*, firms(name)")
        .eq("token", token)
        .single();

      if (!inv) { setInvalid(true); setLoading(false); return; }
      if (inv.accepted_at) { setAlreadyAccepted(true); setInvite(inv); setLoading(false); return; }

      setInvite(inv);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else if (inv.email) {
        setEmail(inv.email);
        setAuthMode("signin");
      }
      setLoading(false);
    };
    init();
  }, [token]);

  const acceptInvite = async (userId: string) => {
    if (!invite) return;
    setJoining(true);
    setJoinError(null);

    try {
      // ── Step 1: Try to find a placeholder row by email ──
      const { data: existing } = await supabase
        .from("firm_members")
        .select("id")
        .eq("firm_id", invite.firm_id)
        .eq("email", invite.email)
        .maybeSingle();

      if (existing) {
        // Update the placeholder with the real user_id
        const { error: updateErr } = await supabase
          .from("firm_members")
          .update({ user_id: userId, joined_at: new Date().toISOString() })
          .eq("id", existing.id);

        if (updateErr) {
          console.error("firm_members update error:", updateErr);
          // Fall through to upsert
        } else {
          // Update succeeded — mark invite accepted and finish
          await supabase.from("firm_invites")
            .update({ accepted_at: new Date().toISOString() })
            .eq("id", invite.id);
          setJoined(true);
          setJoining(false);
          setTimeout(() => router.push("/dashboard"), 2000);
          return;
        }
      }

      // ── Step 2: Upsert by (firm_id, user_id) ──
      const { error: upsertErr } = await supabase
        .from("firm_members")
        .upsert(
          {
            firm_id: invite.firm_id,
            user_id: userId,
            email: invite.email,
            role: invite.role || "member",
            invited_by: invite.invited_by,
            joined_at: new Date().toISOString(),
          },
          { onConflict: "firm_id,user_id", ignoreDuplicates: false }
        );

      if (upsertErr) {
        console.error("firm_members upsert error:", upsertErr);

        // ── Step 3: Plain insert as last resort ──
        const { error: insertErr } = await supabase
          .from("firm_members")
          .insert({
            firm_id: invite.firm_id,
            user_id: userId,
            email: invite.email,
            role: invite.role || "member",
            invited_by: invite.invited_by,
            joined_at: new Date().toISOString(),
          });

        if (insertErr) {
          console.error("firm_members insert error:", insertErr);
          setJoinError(
            `Failed to join workspace: ${insertErr.message}. ` +
            `Please ask your admin to check RLS permissions on firm_members.`
          );
          setJoining(false);
          return;
        }
      }

      // ── Mark invite accepted ──
      const { error: inviteErr } = await supabase
        .from("firm_invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);

      if (inviteErr) {
        console.error("firm_invites update error (non-fatal):", inviteErr);
      }

      setJoined(true);
      setJoining(false);
      setTimeout(() => router.push("/dashboard"), 2000);

    } catch (err: any) {
      console.error("acceptInvite unexpected error:", err);
      setJoinError("Something went wrong. Please try again or contact your admin.");
      setJoining(false);
    }
  };

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: { invited_to_firm: invite?.firm_id },
        },
      });
      if (error) { setAuthError(error.message); return; }
      if (data.user) {
        setUser(data.user);
        await acceptInvite(data.user.id);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setAuthError(error.message); return; }
      if (data.user) {
        setUser(data.user);
        await acceptInvite(data.user.id);
      }
    }
  };

  const roleInfo = ROLE_CONFIG[invite?.role] || ROLE_CONFIG.member;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <style>{CSS}</style>

      <div style={{ width: "100%", maxWidth: 440, animation: "fadeIn .4s ease" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 300, color: "var(--gold)", letterSpacing: ".1em", marginBottom: 4 }}>VALORA</div>
          <div style={{ fontSize: 11, color: "var(--text-d)", letterSpacing: ".1em", textTransform: "uppercase" }}>Institutional Development Appraisal</div>
        </div>

        {/* INVALID */}
        {invalid && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 40, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(244,100,95,.1)", border: "1px solid rgba(244,100,95,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 22, color: "var(--red)" }}>⚠</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 300, marginBottom: 10, color: "var(--red)" }}>Invalid Invite</div>
            <p style={{ fontSize: 13, color: "var(--text-m)", lineHeight: 1.7, marginBottom: 24 }}>This invite link is invalid or has expired. Ask your team admin to send a new invite.</p>
            <button className="btn-ghost" onClick={() => router.push("/")}>Back to Valora</button>
          </div>
        )}

        {/* ALREADY ACCEPTED */}
        {alreadyAccepted && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 40, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 22, color: "var(--gold)" }}>✦</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 300, marginBottom: 10 }}>Already Accepted</div>
            <p style={{ fontSize: 13, color: "var(--text-m)", lineHeight: 1.7, marginBottom: 24 }}>
              This invite to <strong style={{ color: "var(--text)" }}>{invite?.firms?.name}</strong> has already been accepted.
            </p>
            <button className="btn-primary" onClick={() => router.push("/dashboard")}>Go to Dashboard →</button>
          </div>
        )}

        {/* JOINED SUCCESS */}
        {joined && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 40, textAlign: "center", animation: "scaleIn .4s ease" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(61,220,132,.08)", border: "2px solid rgba(61,220,132,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28, color: "var(--green)" }}>✓</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 300, marginBottom: 10, color: "var(--green)" }}>Welcome aboard!</div>
            <p style={{ fontSize: 14, color: "var(--text-m)", lineHeight: 1.7 }}>
              You've joined <strong style={{ color: "var(--text)" }}>{invite?.firms?.name}</strong> as <strong style={{ color: roleInfo.color }}>{roleInfo.label}</strong>.
            </p>
            <p style={{ fontSize: 12, color: "var(--text-d)", marginTop: 16 }}>Taking you to your dashboard…</p>
            <div style={{ marginTop: 20, height: 2, background: "var(--bg3)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "var(--gold)", borderRadius: 2, animation: "grow 2s linear forwards" }} />
            </div>
            <style>{`@keyframes grow{from{width:0}to{width:100%}}`}</style>
          </div>
        )}

        {/* MAIN INVITE CARD */}
        {invite && !joined && !invalid && !alreadyAccepted && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border-m)", borderRadius: 16, padding: 36, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1, background: "linear-gradient(90deg,transparent,var(--gold),transparent)" }} />

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 10 }}>Team Invitation</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 300, marginBottom: 8, lineHeight: 1.2 }}>You've been invited</div>
              <p style={{ fontSize: 14, color: "var(--text-m)", lineHeight: 1.6 }}>
                Join <strong style={{ color: "var(--text)" }}>{invite.firms?.name}</strong> on Valora
              </p>
            </div>

            {/* Role badge */}
            <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "14px 16px", marginBottom: 28, display: "flex", alignItems: "center", gap: 12, border: "1px solid var(--border)" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: roleInfo.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: roleInfo.color, marginBottom: 2 }}>{roleInfo.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-d)" }}>{roleInfo.desc}</div>
              </div>
            </div>

            {/* Join error */}
            {joinError && (
              <div style={{ background: "rgba(244,100,95,.08)", border: "1px solid rgba(244,100,95,.25)", borderRadius: 8, padding: "12px 14px", fontSize: 12, color: "var(--red)", marginBottom: 20, lineHeight: 1.6 }}>
                <strong style={{ display: "block", marginBottom: 4 }}>Could not join workspace</strong>
                {joinError}
              </div>
            )}

            {/* Already logged in */}
            {user ? (
              <div>
                <div style={{ background: "var(--bg3)", borderRadius: 9, padding: "12px 16px", marginBottom: 20, border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--gold)", flexShrink: 0 }}>
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 1 }}>Signed in as</div>
                    <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                  </div>
                </div>
                <button className="btn-primary" onClick={() => acceptInvite(user.id)} disabled={joining}>
                  {joining ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span style={{ width: 14, height: 14, border: "2px solid rgba(6,7,10,.3)", borderTopColor: "#06070a", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
                      Joining workspace…
                    </span>
                  ) : `Accept & Join ${invite.firms?.name} →`}
                </button>
                <button className="btn-ghost" onClick={async () => { await supabase.auth.signOut(); setUser(null); setJoinError(null); }}>
                  Sign in with a different account
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuth}>
                {/* Auth tabs */}
                <div style={{ display: "flex", background: "var(--bg3)", borderRadius: 9, padding: 3, marginBottom: 20, gap: 3 }}>
                  {(["signup", "signin"] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => setAuthMode(mode)} className={`tab ${authMode === mode ? "active" : "inactive"}`}>
                      {mode === "signup" ? "Create Account" : "Sign In"}
                    </button>
                  ))}
                </div>

                <p style={{ fontSize: 12, color: "var(--text-d)", marginBottom: 16, lineHeight: 1.5 }}>
                  {authMode === "signup"
                    ? "Create a free Valora account to accept this invitation."
                    : "Sign in to your existing Valora account."}
                </p>

                <div style={{ marginBottom: 12 }}>
                  <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" required />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <input className="inp" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={authMode === "signup" ? "Create a password (8+ chars)" : "Your password"} required minLength={authMode === "signup" ? 8 : 1} />
                </div>

                {authError && (
                  <div style={{ background: "rgba(244,100,95,.1)", border: "1px solid rgba(244,100,95,.2)", borderRadius: 7, padding: "10px 14px", fontSize: 12, color: "var(--red)", marginBottom: 16, lineHeight: 1.5 }}>
                    {authError}
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={joining}>
                  {joining ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span style={{ width: 14, height: 14, border: "2px solid rgba(6,7,10,.3)", borderTopColor: "#06070a", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
                      Joining…
                    </span>
                  ) : authMode === "signup" ? "Create Account & Join →" : "Sign In & Join →"}
                </button>

                <p style={{ fontSize: 11, color: "var(--text-d)", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
                  {authMode === "signup"
                    ? <><span>Already have an account? </span><span style={{ color: "var(--gold)", cursor: "pointer" }} onClick={() => setAuthMode("signin")}>Sign in</span></>
                    : <><span>Don't have an account? </span><span style={{ color: "var(--gold)", cursor: "pointer" }} onClick={() => setAuthMode("signup")}>Create one free</span></>}
                </p>
              </form>
            )}
          </div>
        )}

        {!invalid && (
          <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-d)", marginTop: 20, lineHeight: 1.6 }}>
            <span style={{ color: "var(--gold)", cursor: "pointer" }} onClick={() => router.push("/")}>valoraplatform.io</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function InvitePageWrapper() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#06070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <InvitePage />
    </Suspense>
  );
}
