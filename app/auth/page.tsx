"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════════
   VALORA — AUTH PAGE
   Sign in / Sign up with email+password or magic link.
   Drop at: app/auth/page.tsx
   Callback is at app/auth/callback/route.ts (unchanged).
   ═══════════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --cream:#F5F0E1; --cream-l:#FAF6ED;
  --navy:#1A1E26; --navy-d:#0F1115;
  --text:#0F1115; --text-m:#3D4351; --text-d:#6B7280; --text-faint:#A0A5AE;
  --green:#2E9E72; --green-l:#52C498; --green-bg:rgba(46,158,114,.08); --green-border:rgba(46,158,114,.28);
  --red:#C24844; --amber:#C57E14;
  --border:rgba(15,17,21,.1); --border-m:rgba(15,17,21,.18);
  --font:'Poppins',system-ui,sans-serif;
  --ease:cubic-bezier(0.16,1,0.3,1);
}
html,body{background:var(--cream);color:var(--text);font-family:var(--font);font-size:15px;-webkit-font-smoothing:antialiased}
body{min-height:100vh}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}

.auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 24px}
.auth-card{width:100%;max-width:440px;background:#fff;border:1px solid var(--border);border-radius:18px;padding:40px;box-shadow:0 24px 60px rgba(15,17,21,.06),0 1px 3px rgba(15,17,21,.04);animation:fadeUp .4s var(--ease) both}

.auth-logo{display:flex;align-items:center;gap:10px;margin-bottom:32px}
.auth-logo-mark{width:28px;height:28px;border-radius:7px;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700}
.auth-logo-name{font-size:18px;font-weight:700;letter-spacing:-.02em;color:var(--navy)}

.auth-tabs{display:flex;background:var(--cream);border-radius:10px;padding:4px;margin-bottom:24px}
.auth-tab{flex:1;padding:9px 0;border:none;background:transparent;font-family:inherit;font-size:13px;font-weight:600;color:var(--text-d);cursor:pointer;border-radius:7px;transition:all .18s var(--ease);letter-spacing:-.005em}
.auth-tab.active{background:#fff;color:var(--navy);box-shadow:0 1px 3px rgba(15,17,21,.06)}

.auth-h{font-size:22px;font-weight:700;letter-spacing:-.025em;color:var(--navy);margin-bottom:6px;line-height:1.2}
.auth-sub{font-size:13.5px;color:var(--text-d);margin-bottom:24px;line-height:1.55}

.auth-field{margin-bottom:14px}
.auth-label{display:block;font-size:11px;font-weight:600;color:var(--text-d);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px}
.auth-input{width:100%;padding:11px 14px;background:var(--cream-l);border:1px solid var(--border);border-radius:9px;font-family:inherit;font-size:14px;font-weight:500;color:var(--text);outline:none;transition:border-color .18s var(--ease),box-shadow .18s var(--ease)}
.auth-input:focus{border-color:var(--green);box-shadow:0 0 0 3px var(--green-bg)}
.auth-input::placeholder{color:var(--text-faint)}

.auth-btn{width:100%;padding:13px;background:var(--green);color:#fff;border:none;border-radius:9px;font-family:inherit;font-size:14px;font-weight:600;letter-spacing:-.005em;cursor:pointer;transition:background .18s var(--ease),transform .08s var(--ease);display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px}
.auth-btn:hover{background:#1F7050}
.auth-btn:active{transform:translateY(1px)}
.auth-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}

.auth-divider{display:flex;align-items:center;gap:12px;margin:22px 0;font-size:10px;color:var(--text-faint);letter-spacing:.14em;text-transform:uppercase;font-weight:600}
.auth-divider::before,.auth-divider::after{content:"";flex:1;height:1px;background:var(--border)}

.auth-link-btn{width:100%;padding:11px;background:transparent;color:var(--text-m);border:1px solid var(--border-m);border-radius:9px;font-family:inherit;font-size:13.5px;font-weight:500;cursor:pointer;transition:all .18s var(--ease);display:flex;align-items:center;justify-content:center;gap:8px}
.auth-link-btn:hover{border-color:var(--navy);color:var(--navy)}

.auth-footer{text-align:center;margin-top:20px;font-size:12.5px;color:var(--text-d);line-height:1.5}
.auth-footer a{color:var(--green);font-weight:600;cursor:pointer}
.auth-footer a:hover{text-decoration:underline}

.auth-error{background:rgba(194,72,68,.08);border:1px solid rgba(194,72,68,.3);color:var(--red);padding:11px 14px;border-radius:9px;font-size:12.5px;font-weight:500;margin-bottom:14px;line-height:1.5}
.auth-success{background:var(--green-bg);border:1px solid var(--green-border);color:var(--green);padding:11px 14px;border-radius:9px;font-size:12.5px;font-weight:500;margin-bottom:14px;line-height:1.5}

.spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}

.auth-back{position:absolute;top:24px;left:24px;display:flex;align-items:center;gap:6px;background:transparent;border:none;color:var(--text-d);font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;padding:8px 10px;border-radius:7px;transition:all .15s}
.auth-back:hover{color:var(--navy);background:rgba(15,17,21,.04)}
`;

type Mode = "signin" | "signup";

function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const errorParam = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "confirmation_failed" ? "Email confirmation link expired or invalid. Try signing in or requesting a new one." : null
  );
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect straight to dashboard if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push(nextParam || "/dashboard");
    });
  }, [router, nextParam]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true); setError(null); setSuccess(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) { setError(friendlyError(error.message)); return; }
    if (data?.user) router.push(nextParam || "/dashboard");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError(null); setSuccess(null);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() || null },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) { setError(friendlyError(error.message)); return; }
    if (data?.user?.identities?.length === 0) {
      setError("An account with that email already exists. Try signing in.");
      return;
    }
    setSuccess("Check your email — we sent a confirmation link. Click it to finish signing up.");
  };

  const handleMagicLink = async () => {
    if (!email.trim()) { setError("Enter your email first."); return; }
    setLoading(true); setError(null); setSuccess(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) { setError(friendlyError(error.message)); return; }
    setSuccess("Magic link sent — check your inbox and click to sign in.");
  };

  const handleReset = async () => {
    if (!email.trim()) { setError("Enter your email, then click 'Forgot password'."); return; }
    setLoading(true); setError(null); setSuccess(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/account/reset`,
    });
    setLoading(false);
    if (error) { setError(friendlyError(error.message)); return; }
    setSuccess("Password reset link sent. Check your inbox.");
  };

  return (
    <div className="auth-wrap">
      <style>{CSS}</style>
      <button className="auth-back" onClick={() => router.push("/")}>← Back</button>
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">◆</div>
          <div className="auth-logo-name">Valora</div>
        </div>

        <div className="auth-tabs" role="tablist">
          <button className={`auth-tab ${mode === "signin" ? "active" : ""}`} onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}>Sign in</button>
          <button className={`auth-tab ${mode === "signup" ? "active" : ""}`} onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}>Sign up</button>
        </div>

        <h1 className="auth-h">
          {mode === "signin" ? "Welcome back." : "Start underwriting."}
        </h1>
        <p className="auth-sub">
          {mode === "signin"
            ? "Sign in to your Valora workspace."
            : "Free forever. One full appraisal unlocked, all features included."}
        </p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp}>
          {mode === "signup" && (
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-name">Your name</label>
              <input id="auth-name" className="auth-input" type="text" placeholder="Jane Smith" value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" />
            </div>
          )}
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-email">Work email</label>
            <input id="auth-email" className="auth-input" type="email" placeholder="you@firm.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-password">Password</label>
            <input id="auth-password" className="auth-input" type="password" placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={mode === "signup" ? 8 : undefined} />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {mode === "signin" ? "Sign in →" : "Create account →"}
          </button>
        </form>

        {mode === "signin" && (
          <div style={{ textAlign: "right", marginTop: 10, marginBottom: 4 }}>
            <a onClick={handleReset} style={{ fontSize: 12, color: "var(--text-d)", cursor: "pointer", fontWeight: 500, textDecoration: "none" }} onMouseOver={e => (e.currentTarget.style.color = "var(--green)")} onMouseOut={e => (e.currentTarget.style.color = "var(--text-d)")}>Forgot password?</a>
          </div>
        )}

        <div className="auth-divider">or</div>

        <button className="auth-link-btn" type="button" onClick={handleMagicLink} disabled={loading || !email.trim()}>
          {loading ? <div style={{ width: 14, height: 14, border: "2px solid rgba(15,17,21,.2)", borderTopColor: "var(--navy)", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> : "✦"} Email me a magic link
        </button>

        <div className="auth-footer">
          {mode === "signin" ? (
            <>New to Valora? <a onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}>Create an account</a></>
          ) : (
            <>Already have an account? <a onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}>Sign in</a></>
          )}
        </div>
      </div>
    </div>
  );
}

// Translate Supabase error messages into something human
function friendlyError(msg: string): string {
  const m = (msg || "").toLowerCase();
  if (m.includes("invalid login credentials")) return "Wrong email or password.";
  if (m.includes("email not confirmed")) return "Check your email — confirmation link still pending.";
  if (m.includes("user already registered") || m.includes("already exists")) return "That email already has an account. Try signing in.";
  if (m.includes("rate limit") || m.includes("over_email_send_rate_limit")) return "Too many attempts. Wait a minute and try again.";
  if (m.includes("password") && m.includes("6 characters")) return "Password must be at least 6 characters.";
  if (m.includes("password should be") || m.includes("weak password")) return "Password too weak — use at least 8 characters with a mix of letters and numbers.";
  return msg || "Something went wrong. Please try again.";
}

export default function AuthPageWrapper() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#F5F0E1", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "2px solid rgba(46,158,114,.15)", borderTopColor: "#2E9E72", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <AuthPage />
    </Suspense>
  );
}
