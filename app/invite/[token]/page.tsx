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
  --bg:#06070a;--bg1:#0c0e12;--bg2:#12151a;--bg3:#191d24;
  --text:#eceae4;--text-m:#7d8590;--text-d:#3d4249;
  --border:rgba(255,255,255,0.06);--border-m:rgba(255,255,255,0.12);
  --green:#3ddc84;--red:#f4645f;
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Instrument Sans',system-ui,sans-serif;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.inp{width:100%;padding:13px 16px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--font-body);font-size:14px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.1)}
.inp::placeholder{color:var(--text-d)}
.btn-primary{background:var(--gold);color:#06070a;border:none;border-radius:8px;padding:14px 28px;font-family:var(--font-body);font-size:14px;font-weight:600;cursor:pointer;transition:background .2s;width:100%;display:block;text-align:center}
.btn-primary:hover{background:var(--gold-l)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
`;

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string|null>(null);
  const [authMode, setAuthMode] = useState<"signin"|"signup">("signup");

  useEffect(() => {
    const init = async () => {
      // Load invite
      const { data: inv } = await supabase.from("firm_invites").select("*, firms(name)").eq("token", token).single();
      if (!inv) { setInvalid(true); setLoading(false); return; }
      if (inv.accepted_at) { setAlreadyAccepted(true); setLoading(false); return; }
      setInvite(inv);

      // Check if already logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
      setLoading(false);
    };
    init();
  }, [token]);

  const acceptInvite = async (userId: string) => {
    if (!invite) return;
    setJoining(true);
    // Check not already a member
    const { data: existing } = await supabase.from("firm_members").select("id").eq("firm_id", invite.firm_id).eq("user_id", userId).maybeSingle();
    if (!existing) {
      await supabase.from("firm_members").insert({ firm_id: invite.firm_id, user_id: userId, role: invite.role || "member", invited_by: invite.invited_by });
    }
    // Mark invite accepted
    await supabase.from("firm_invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);
    setJoined(true);
    setJoining(false);
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setAuthError(null);
    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setAuthError(error.message); return; }
      if (data.user) { setUser(data.user); await acceptInvite(data.user.id); }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setAuthError(error.message); return; }
      if (data.user) { setUser(data.user); await acceptInvite(data.user.id); }
    }
  };

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

        {invalid && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⚠</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 300, marginBottom: 8, color: "var(--red)" }}>Invalid Invite</div>
            <p style={{ fontSize: 13, color: "var(--text-m)", lineHeight: 1.6 }}>This invite link is invalid or has expired. Ask your team admin to send a new invite.</p>
          </div>
        )}

        {alreadyAccepted && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>✓</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 300, marginBottom: 8 }}>Already Accepted</div>
            <p style={{ fontSize: 13, color: "var(--text-m)", lineHeight: 1.6, marginBottom: 20 }}>This invite has already been used.</p>
            <button className="btn-primary" onClick={() => router.push("/dashboard")}>Go to Dashboard →</button>
          </div>
        )}

        {joined && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px", background: "rgba(61,220,132,.1)", border: "1px solid rgba(61,220,132,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "var(--green)" }}>✓</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, marginBottom: 8 }}>Welcome to the team!</div>
            <p style={{ fontSize: 13, color: "var(--text-m)", lineHeight: 1.6 }}>You've joined <strong style={{ color: "var(--text)" }}>{invite?.firms?.name}</strong>. Redirecting to your dashboard…</p>
          </div>
        )}

        {invite && !joined && !invalid && !alreadyAccepted && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border-m)", borderRadius: 16, padding: 32, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg,transparent,var(--gold),transparent)" }} />

            <div style={{ marginBottom: 24, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>Team Invite</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 300, marginBottom: 6 }}>You've been invited</div>
              <p style={{ fontSize: 13, color: "var(--text-m)" }}>
                Join <strong style={{ color: "var(--text)" }}>{invite.firms?.name}</strong> on Valora
              </p>
            </div>

            {user ? (
              <div>
                <p style={{ fontSize: 13, color: "var(--text-m)", marginBottom: 20, textAlign: "center", lineHeight: 1.6 }}>
                  Signed in as <strong style={{ color: "var(--text)" }}>{user.email}</strong>.<br/>Click below to join the workspace.
                </p>
                <button className="btn-primary" onClick={() => acceptInvite(user.id)} disabled={joining}>
                  {joining ? "Joining…" : `Join ${invite.firms?.name} →`}
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuth}>
                <div style={{ display: "flex", background: "var(--bg3)", borderRadius: 9, padding: 3, marginBottom: 20 }}>
                  {(["signup", "signin"] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => setAuthMode(mode)} style={{ flex: 1, padding: "8px", borderRadius: 7, fontSize: 12, fontWeight: 500, background: authMode === mode ? "var(--bg4)" : "transparent", border: authMode === mode ? "1px solid var(--border)" : "none", color: authMode === mode ? "var(--text)" : "var(--text-d)", cursor: "pointer", fontFamily: "var(--font-body)", transition: "all .2s" }}>
                      {mode === "signup" ? "Create Account" : "Sign In"}
                    </button>
                  ))}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" required />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <input className="inp" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={authMode === "signup" ? "Create a password (8+ chars)" : "Your password"} required />
                </div>
                {authError && <div style={{ background: "rgba(244,100,95,.1)", border: "1px solid rgba(244,100,95,.2)", borderRadius: 7, padding: "10px 12px", fontSize: 12, color: "var(--red)", marginBottom: 14 }}>{authError}</div>}
                <button type="submit" className="btn-primary">
                  {authMode === "signup" ? `Create Account & Join →` : `Sign In & Join →`}
                </button>
              </form>
            )}
          </div>
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
