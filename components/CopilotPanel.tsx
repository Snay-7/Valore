"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";

/* ════════════════════════════════════════════════════════════════════
   VALORA — COPILOT PANEL
   One component, two contexts:
     • "dashboard"  — login entry point, routes user to new appraisal
     • "appraisal"  — in-deal chat + auto-fill/edit
   Session-only. Collapsible rail. Claude integration ships in step 2.
   ════════════════════════════════════════════════════════════════════ */

type Suggestion = {
  description: string;            // "Change exit cap to 5.5%"
  payload: Record<string, any>;   // { exitCapRate: 5.5 } — fed to onApply
  applied?: boolean;
};

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  suggestion?: Suggestion;
  typing?: boolean;
  quotaExceeded?: boolean;
};

type QuotaState = {
  used: number;
  limit: number;
  bonus: number;
  tier: string;
};

type CopilotPanelProps = {
  context?: "dashboard" | "appraisal" | "valuation";  // default: "appraisal"
  dealName?: string;                          // "Leinster Square Hotel" (appraisal mode)
  assetType?: string;                         // "Hotel" | "BTR" | ...
  userName?: string;                          // "Snayder" — for dashboard greeting
  dealData?: Record<string, any>;             // appraisal: current form data, sent to /api/copilot
  dealMetrics?: Record<string, any>;          // appraisal: computed results (irr, moic, ...)
  onApply?: (payload: Record<string, any>) => void;   // edit current deal
  onCreate?: (payload: Record<string, any>) => void;  // create new deal
  onNewDeal?: (assetType: string) => void;    // dashboard: user picked asset — navigate
  onValuation?: () => void;                   // dashboard: user clicked Valuation card — route to /valuation
};

// ── Premium line-SVG asset icons (1.5px stroke, currentColor, architectural) ──
function AssetIcon({ type, size = 22 }: { type: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (type) {
    case "BTR": // Apartment block — 3x3 window grid with entry
      return (
        <svg {...common}>
          <rect x="4" y="2" width="16" height="20" rx="1" />
          <line x1="8" y1="6" x2="8.01" y2="6" />
          <line x1="12" y1="6" x2="12.01" y2="6" />
          <line x1="16" y1="6" x2="16.01" y2="6" />
          <line x1="8" y1="10" x2="8.01" y2="10" />
          <line x1="12" y1="10" x2="12.01" y2="10" />
          <line x1="16" y1="10" x2="16.01" y2="10" />
          <line x1="8" y1="14" x2="8.01" y2="14" />
          <line x1="12" y1="14" x2="12.01" y2="14" />
          <line x1="16" y1="14" x2="16.01" y2="14" />
          <rect x="10" y="18" width="4" height="4" />
        </svg>
      );
    case "BTS": // Pitched-roof house with door
      return (
        <svg {...common}>
          <path d="M3 11l9-8 9 8" />
          <path d="M5 9v12h14V9" />
          <rect x="10" y="14" width="4" height="7" />
          <line x1="8" y1="13" x2="8.01" y2="13" />
          <line x1="16" y1="13" x2="16.01" y2="13" />
        </svg>
      );
    case "Hotel": // Classical hotel — columns/entry portico
      return (
        <svg {...common}>
          <path d="M3 21V9l9-6 9 6v12" />
          <path d="M3 21h18" />
          <line x1="8" y1="12" x2="8.01" y2="12" />
          <line x1="12" y1="12" x2="12.01" y2="12" />
          <line x1="16" y1="12" x2="16.01" y2="12" />
          <line x1="8" y1="16" x2="8.01" y2="16" />
          <line x1="16" y1="16" x2="16.01" y2="16" />
          <path d="M10 21v-4h4v4" />
        </svg>
      );
    case "Flip": // Refresh/cycle — buy, renovate, sell
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 0114.85-6.85L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 01-14.85 6.85L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      );
    case "Commercial": // Office tower — banded floors
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx="0.5" />
          <path d="M5 8h14" />
          <path d="M5 13h14" />
          <path d="M5 18h14" />
          <line x1="9" y1="10.5" x2="9.01" y2="10.5" />
          <line x1="15" y1="10.5" x2="15.01" y2="10.5" />
          <line x1="9" y1="15.5" x2="9.01" y2="15.5" />
          <line x1="15" y1="15.5" x2="15.01" y2="15.5" />
          <rect x="10" y="19" width="4" height="2" />
        </svg>
      );
    case "MixedUse": // Two adjacent buildings — resi + commercial
      return (
        <svg {...common}>
          <path d="M2 21V11l5-3 5 3" />
          <path d="M12 21V7l5-3 5 3v14" />
          <path d="M2 21h20" />
          <line x1="5" y1="14" x2="5.01" y2="14" />
          <line x1="9" y1="14" x2="9.01" y2="14" />
          <line x1="15" y1="10" x2="15.01" y2="10" />
          <line x1="19" y1="10" x2="19.01" y2="10" />
          <line x1="15" y1="14" x2="15.01" y2="14" />
          <line x1="19" y1="14" x2="19.01" y2="14" />
          <line x1="15" y1="18" x2="15.01" y2="18" />
          <line x1="19" y1="18" x2="19.01" y2="18" />
        </svg>
      );
    case "Valuation": // Magnifier over a price indicator — research + value
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
          <line x1="11" y1="8" x2="11" y2="14"/>
        </svg>
      );
    default:
      return null;
  }
}
const ASSET_TYPES: { id: string; label: string; desc: string }[] = [
  { id: "BTR",        label: "Build to Rent",    desc: "Residential income, stabilised yield"   },
  { id: "BTS",        label: "Build to Sell",    desc: "Residential for open-market sale"       },
  { id: "Hotel",      label: "Hotel",            desc: "Acquisition, refurb, operating hold"    },
  { id: "Flip",       label: "Residential Flip", desc: "Buy, refurb, sell / hold / refinance"   },
  { id: "Commercial", label: "Commercial",       desc: "Office, retail, industrial yield deals" },
  { id: "MixedUse",   label: "Mixed Use",        desc: "Multi-zone: resi + commercial blended"  },
  { id: "Valuation",  label: "Valuation",        desc: "Price any property + IC-ready report"   },
];

const APPRAISAL_PROMPTS = [
  "Why is my IRR so low?",
  "What if exit cap is 5.75%?",
  "How does DSCR improve?",
  "Create: Hotel in Bayswater, 58 keys, £16m, 60% LTC, 5-yr hold",
];

const DASHBOARD_PROMPTS = [
  "Hotel in Mayfair, 80 keys, 4-star, £45m",
  "Bayswater BTR, 120 units",
  "Soho flip, £1.8m, 6-month hold",
  "Mixed use in Shoreditch, 60% resi / 40% commercial",
];

// ── Theme palettes ──
const DARK_COLORS = {
  bg: "#1A1E26",
  bgSubtle: "rgba(255,255,255,.04)",
  bgHover: "rgba(255,255,255,.06)",
  border: "rgba(255,255,255,.08)",
  borderMid: "rgba(255,255,255,.1)",
  borderAccent: "rgba(82,196,152,.35)",
  text: "#F6F4EF",
  textMid: "rgba(246,244,239,.85)",
  textDim: "rgba(246,244,239,.55)",
  textFaint: "rgba(246,244,239,.35)",
  green: "#52C498",
  greenBg: "rgba(82,196,152,.12)",
  greenTint: "rgba(82,196,152,.08)",
  // User message bubble contrast
  userBubbleBg: "#52C498",
  userBubbleText: "#1A1E26",
  // Assistant message
  assistantBubbleBg: "rgba(255,255,255,.05)",
  // Button send disabled
  btnSendDisabled: "rgba(255,255,255,.08)",
  btnSendDisabledText: "rgba(246,244,239,.4)",
};
const LIGHT_COLORS = {
  bg: "#FFFFFF",
  bgSubtle: "#F8F5EE",
  bgHover: "#F2EEE4",
  border: "rgba(15,17,21,0.08)",
  borderMid: "rgba(15,17,21,0.14)",
  borderAccent: "rgba(46,158,114,0.35)",
  text: "#0F1115",
  textMid: "#3D4351",
  textDim: "#6B7280",
  textFaint: "#A0A5AE",
  green: "#2E9E72",
  greenBg: "rgba(46,158,114,0.12)",
  greenTint: "rgba(46,158,114,0.06)",
  userBubbleBg: "#2E9E72",
  userBubbleText: "#FFFFFF",
  assistantBubbleBg: "#F2EEE4",
  btnSendDisabled: "rgba(15,17,21,0.06)",
  btnSendDisabledText: "rgba(15,17,21,0.3)",
};

export default function CopilotPanel({
  context = "appraisal",
  dealName = "this deal",
  assetType = "Hotel",
  userName,
  dealData,
  dealMetrics,
  onApply,
  onCreate,
  onNewDeal,
  onValuation,
}: CopilotPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [quota, setQuota] = useState<QuotaState | null>(null);
  const [showTopup, setShowTopup] = useState(false);

  // ── Voice input (Web Speech API) ──
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputBeforeVoiceRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setVoiceSupported(true);
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = (typeof navigator !== "undefined" && navigator.language) || "en-GB";
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += chunk;
        else interim += chunk;
      }
      const base = inputBeforeVoiceRef.current;
      const joined = (base ? base.trimEnd() + " " : "") + (final || interim);
      setInput(joined);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      try { recognitionRef.current.stop(); } catch {}
      setListening(false);
      return;
    }
    // Starting: remember what's already in the textarea so we can append
    inputBeforeVoiceRef.current = input;
    try {
      recognitionRef.current.start();
      setListening(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch {
      setListening(false);
    }
  };

  // ── Theme detection (matches the learn/dashboard/pipeline pattern) ──
  useEffect(() => {
    const detectTheme = (): "dark" | "light" => {
      if (typeof document === "undefined") return "dark";
      if (document.body?.classList.contains("light")) return "light";
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr === "light" || attr === "dark") return attr;
      try { const v = localStorage.getItem("valora-theme"); if (v === "light" || v === "dark") return v; } catch {}
      return "dark";
    };
    const apply = () => setTheme(detectTheme());
    apply();
    const obs = new MutationObserver(apply);
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("storage", apply);
    return () => { obs.disconnect(); window.removeEventListener("storage", apply); };
  }, []);

  // ── Colour palette for the current theme ──
  const T = theme === "light" ? LIGHT_COLORS : DARK_COLORS;
  const [messages, setMessages] = useState<Message[]>(() => {
    if (context === "dashboard") {
      return [{
        id: "sys-1",
        role: "system",
        content: userName
          ? `Hi ${userName}. What deal are we building today? Pick an asset below, or describe your deal in one line and I'll set it up.`
          : `Welcome back. What deal are we building today? Pick an asset below, or describe your deal in one line and I'll set it up.`,
        timestamp: Date.now(),
      }];
    }
    if (context === "valuation") {
      return [{
        id: "sys-1",
        role: "system",
        content: `Describe a property to value — anywhere in the world. I'll produce a price range, 4-6 comparables, key valuation drivers, and risks. Paste a listing URL too if you have one.`,
        timestamp: Date.now(),
      }];
    }
    return [{
      id: "sys-1",
      role: "system",
      content: `I can see you're modelling ${(dealName && dealName.trim()) ? `your ${assetType} — ${dealName}` : `this ${assetType} deal`}. Ask me about this deal — "why is my IRR X%?", "what if exit cap is 5.5%?" — or describe a new deal and I'll build it.`,
      timestamp: Date.now(),
    }];
  });
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Auto-grow the input textarea to fit its content (capped at 220px)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  }, [input]);

  // Real Claude-backed reply via /api/copilot
  const fetchReply = async (history: Message[]): Promise<Message> => {
    // Build the message transcript Claude sees — strip system messages + typing indicators.
    const transcript = history
      .filter((m) => (m.role === "user" || m.role === "assistant") && !m.typing && m.content.trim().length > 0)
      .map((m) => ({ role: m.role, content: m.content }));

    const body: Record<string, any> = { context, messages: transcript };
    if (context === "appraisal") {
      body.deal = { assetType, data: dealData || {}, metrics: dealMetrics || {} };
    }

    // Grab the current Supabase session token for auth
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({} as any));

      // Update quota state regardless of success/error — server always returns it when known
      if (data.quota) setQuota(data.quota);

      if (res.status === 429 || data.error === "quota_exceeded") {
        // Quota exhausted — render a system-style message with top-up CTAs
        return {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: String(data.reply || "You've used all your Copilot messages for this period. Top up or upgrade to keep going."),
          timestamp: Date.now(),
          quotaExceeded: true,
        };
      }
      if (!res.ok) {
        return {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: `Couldn't reach Copilot: ${data.error || `HTTP ${res.status}`}. Try again in a moment.`,
          timestamp: Date.now(),
        };
      }
      const reply: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: String(data.reply || "").trim() || "Here's what I'd look at for that.",
        timestamp: Date.now(),
      };
      if (data.suggestion && data.suggestion.payload && data.suggestion.description) {
        reply.suggestion = {
          description: String(data.suggestion.description),
          payload: data.suggestion.payload,
        };
      }
      return reply;
    } catch (e: any) {
      return {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: `Network error — ${e?.message || "could not reach /api/copilot"}. Retry when you're back online.`,
        timestamp: Date.now(),
      };
    }
  };

  // Top-up checkout
  const handleTopup = async (pack: "50" | "250" | "1000") => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { alert("Please sign in first."); return; }
    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ pack }),
      });
      const { url, error } = await res.json();
      if (error) { alert(error); return; }
      if (url) window.location.href = url;
    } catch (e: any) {
      alert(e?.message || "Top-up failed");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    // Snapshot history including the new user message, so fetchReply sees it
    const nextHistory = [...messages, userMsg];
    setMessages([...nextHistory, { id: "typing", role: "assistant", content: "", timestamp: Date.now(), typing: true }]);
    setInput("");
    setSending(true);
    const reply = await fetchReply(nextHistory);
    setMessages(m => [...m.filter(x => !x.typing), reply]);
    setSending(false);
  };

  const handleApply = (msg: Message) => {
    if (!msg.suggestion) return;
    const { payload } = msg.suggestion;
    // If payload has assetType, treat as Create; otherwise Edit
    if (payload.assetType && onCreate) onCreate(payload);
    else if (onApply) onApply(payload);
    // Mark as applied
    setMessages(ms => ms.map(m => m.id === msg.id
      ? { ...m, suggestion: { ...m.suggestion!, applied: true } }
      : m
    ));
  };

  const handleSuggestedPrompt = (p: string) => {
    setInput(p);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── DASHBOARD HERO LAYOUT ──
  // Full-screen ChatGPT/Claude-style first-screen: centered greeting, asset
  // cards, prominent input. On first message, flips to chat view with input
  // pinned to the bottom (transcript above, send-area below).
  if (context === "dashboard") {
    const hasChat = messages.length > 1;
    return (
      <section style={{
        flex: 1, minHeight: "calc(100vh - 8px)",
        background: T.bg,
        color: T.text,
        fontFamily: "var(--val-font-body, 'Poppins', system-ui)",
        display: "flex", flexDirection: "column",
        position: "relative",
      }}>
        {/* ── Empty / first-visit state ── */}
        {!hasChat && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "48px 24px 32px", gap: 28,
            width: "100%", maxWidth: 780, margin: "0 auto",
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: T.greenBg, border: `1px solid ${T.borderAccent}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.green, fontSize: 26, fontWeight: 700,
              }}>◆</div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".18em", color: T.textFaint, fontWeight: 600, marginBottom: 8 }}>
                  Valora Copilot
                </div>
                <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-.025em", color: T.text, lineHeight: 1.15 }}>
                  {userName ? `Hi ${userName} — what deal are we building?` : `What deal are we building today?`}
                </div>
                <div style={{ fontSize: 14, color: T.textDim, marginTop: 10, lineHeight: 1.5 }}>
                  Pick an asset below, or describe your deal in one line and I&rsquo;ll set it up for you.
                </div>
              </div>
            </div>

            {/* Input (primary CTA) */}
            <div style={{ width: "100%", maxWidth: 640 }}>
              <div style={{
                display: "flex", gap: 8, alignItems: "flex-end",
                background: T.bgSubtle,
                border: `1px solid ${T.borderMid}`,
                borderRadius: 14, padding: "12px 12px 12px 16px",
                boxShadow: theme === "light" ? "0 1px 3px rgba(15,17,21,0.04)" : "0 1px 3px rgba(0,0,0,0.2)",
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your deal — e.g. Hotel in Mayfair, 80 keys, £45m…"
                  rows={1}
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: T.text, fontSize: 15, resize: "none",
                    fontFamily: "inherit", lineHeight: 1.5, minHeight: 28, maxHeight: 160,
                  }}
                />
                <MicButton listening={listening} supported={voiceSupported} onToggle={toggleVoice} T={T} />
                <button onClick={handleSend} disabled={!input.trim() || sending} style={{
                  background: input.trim() && !sending ? T.green : T.btnSendDisabled,
                  color: input.trim() && !sending ? "#FFFFFF" : T.btnSendDisabledText,
                  border: "none", borderRadius: 8, padding: "10px 16px",
                  fontSize: 14, fontWeight: 700, cursor: input.trim() && !sending ? "pointer" : "not-allowed",
                  fontFamily: "inherit", transition: "all 150ms",
                }}>↵ Send</button>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, justifyContent: "center" }}>
                {DASHBOARD_PROMPTS.map(p => (
                  <button key={p} onClick={() => handleSuggestedPrompt(p)} style={{
                    background: "transparent",
                    border: `1px solid ${T.border}`,
                    borderRadius: 99, padding: "5px 13px",
                    color: T.textDim, fontSize: 11.5,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 150ms",
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = T.borderAccent; e.currentTarget.style.color = T.text; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textDim; }}
                  >{p}</button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", maxWidth: 480, color: T.textFaint }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em", fontWeight: 600 }}>or pick an asset</div>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            {/* Asset grid */}
            <div className="valora-copilot-asset-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10, width: "100%",
            }}>
              {ASSET_TYPES.map(a => (
                <button
                  key={a.id}
                  onClick={() => { if (a.id === "Valuation") { onValuation && onValuation(); } else { onNewDeal && onNewDeal(a.id); } }}
                  style={{
                    background: T.bgSubtle,
                    border: `1px solid ${T.borderMid}`,
                    borderRadius: 10, padding: "14px 14px",
                    color: T.textMid,
                    cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    transition: "all 150ms", display: "flex", flexDirection: "column", gap: 5,
                    minHeight: 92,
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = T.greenTint;
                    e.currentTarget.style.borderColor = T.borderAccent;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = T.bgSubtle;
                    e.currentTarget.style.borderColor = T.borderMid;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ color: T.green, display: "inline-flex" }}><AssetIcon type={a.id} size={22} /></div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: "-.01em" }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.35 }}>{a.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 10, color: T.textFaint, letterSpacing: ".04em", marginTop: 4 }}>
              Session-only conversation · clears on refresh
            </div>
            <UsagePill quota={quota} T={T} onTopup={() => setShowTopup(true)} />
          </div>
        )}

        {/* ── Active chat state (post first message) ── */}
        {hasChat && (
          <>
            <div ref={scrollRef} style={{
              flex: 1, overflowY: "auto",
              padding: "32px 24px 20px",
              display: "flex", flexDirection: "column", gap: 16,
            }}>
              <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
                {messages.map(msg => (
                  <MessageBubble key={msg.id} msg={msg} onApply={handleApply} onOpenTopup={() => setShowTopup(true)} T={T} />
                ))}
              </div>
            </div>
            <div style={{
              borderTop: `1px solid ${T.border}`,
              background: T.bg,
              padding: "16px 24px 20px",
            }}>
              <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
                <div style={{
                  display: "flex", gap: 8, alignItems: "flex-end",
                  background: T.bgSubtle,
                  border: `1px solid ${T.borderMid}`,
                  borderRadius: 12, padding: "10px 10px 10px 14px",
                }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Reply, or describe another deal…"
                    rows={1}
                    style={{
                      flex: 1, background: "transparent", border: "none", outline: "none",
                      color: T.text, fontSize: 14, resize: "none",
                      fontFamily: "inherit", lineHeight: 1.5, minHeight: 22, maxHeight: 140,
                    }}
                  />
                  <MicButton listening={listening} supported={voiceSupported} onToggle={toggleVoice} T={T} size="sm" />
                  <button onClick={handleSend} disabled={!input.trim() || sending} style={{
                    background: input.trim() && !sending ? T.green : T.btnSendDisabled,
                    color: input.trim() && !sending ? "#FFFFFF" : T.btnSendDisabledText,
                    border: "none", borderRadius: 7, padding: "9px 14px",
                    fontSize: 13, fontWeight: 700, cursor: input.trim() && !sending ? "pointer" : "not-allowed",
                    fontFamily: "inherit", transition: "all 150ms",
                  }}>↵ Send</button>
                </div>
                <div style={{ fontSize: 10, color: T.textFaint, marginTop: 8, textAlign: "center", letterSpacing: ".02em" }}>
                  Session-only · clears on refresh
                </div>
                <UsagePill quota={quota} T={T} onTopup={() => setShowTopup(true)} />
              </div>
            </div>
          </>
        )}

        {/* Responsive: asset grid collapses 3→2→1 */}
        <style jsx>{`
          @media (max-width: 720px) {
            :global(.valora-copilot-asset-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          }
          @media (max-width: 460px) {
            :global(.valora-copilot-asset-grid) { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <TopupModal open={showTopup} onClose={() => setShowTopup(false)} onBuy={(p) => { setShowTopup(false); handleTopup(p); }} T={T} />
      </section>
    );
  }

  // ── APPRAISAL LAYOUT (unchanged: vertical rail + panel) ──
  if (collapsed) {
    return (
      <aside style={{
        width: 48, background: T.bg,
        borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "16px 0", gap: 18, flexShrink: 0,
      }}>
        <button onClick={() => setCollapsed(false)} title="Open Copilot" style={{
          background: T.green, color: "#FFFFFF",
          border: "none", borderRadius: 8, width: 32, height: 32,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 15, fontWeight: 700,
        }}>◆</button>
        <div style={{
          writingMode: "vertical-rl", transform: "rotate(180deg)",
          fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase",
          color: T.textFaint, fontWeight: 600,
        }}>AI Copilot</div>
      </aside>
    );
  }

  return (
    <aside style={{
      width: 340, background: T.bg,
      borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column",
      flexShrink: 0, color: T.text,
      fontFamily: "var(--val-font-body, 'Poppins', system-ui)",
    }}>
      {/* Header */}
      <div style={{
        padding: "18px 18px 14px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: T.greenBg,
            border: `1px solid ${T.borderAccent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.green, fontSize: 14, fontWeight: 700,
          }}>◆</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-.015em", color: T.text }}>Valora Copilot</div>
            <div style={{ fontSize: 10, color: T.textFaint, letterSpacing: ".04em", marginTop: 1 }}>
              {context === "dashboard" ? "Start a new deal" : context === "valuation" ? "Valuation · Session chat" : `${assetType} · Session chat`}
            </div>
          </div>
        </div>
        <button onClick={() => setCollapsed(true)} title="Collapse" style={{
          background: "transparent", border: "none", color: T.textDim,
          cursor: "pointer", fontSize: 14, padding: "4px 6px", borderRadius: 6,
        }}>←</button>
      </div>

      {/* Messages scroll area */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: "auto", padding: "18px 14px",
        display: "flex", flexDirection: "column", gap: 14,
      }}>
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} onApply={handleApply} onOpenTopup={() => setShowTopup(true)} T={T} />
        ))}
      </div>

      {/* Dashboard mode — show asset-type cards before any conversation */}
      {context === "dashboard" && messages.length <= 1 && (
        <div style={{ padding: "0 14px 12px" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".14em", color: T.textFaint, marginBottom: 10, fontWeight: 600 }}>Pick an asset</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {ASSET_TYPES.map(a => (
              <button
                key={a.id}
                onClick={() => { if (a.id === "Valuation") { onValuation && onValuation(); } else { onNewDeal && onNewDeal(a.id); } }}
                style={{
                  background: T.bgSubtle,
                  border: `1px solid ${T.borderMid}`,
                  borderRadius: 9, padding: "12px 10px",
                  color: T.textMid,
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                  transition: "all 150ms", display: "flex", flexDirection: "column", gap: 4,
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = T.greenTint;
                  e.currentTarget.style.borderColor = T.borderAccent;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = T.bgSubtle;
                  e.currentTarget.style.borderColor = T.borderMid;
                }}
              >
                <div style={{ color: T.green, display: "inline-flex" }}><AssetIcon type={a.id} size={18} /></div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text, letterSpacing: "-.01em" }}>{a.label}</div>
                <div style={{ fontSize: 10, color: T.textDim, lineHeight: 1.3 }}>{a.desc}</div>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".14em", color: T.textFaint, margin: "18px 0 8px", fontWeight: 600 }}>Or describe your deal</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {DASHBOARD_PROMPTS.map(p => (
              <button key={p} onClick={() => handleSuggestedPrompt(p)} style={{
                background: T.bgSubtle,
                border: `1px solid ${T.border}`,
                borderRadius: 7, padding: "8px 10px",
                color: T.textDim, fontSize: 11,
                cursor: "pointer", textAlign: "left",
                fontFamily: "inherit", transition: "all 150ms", lineHeight: 1.4,
              }}>{p}</button>
            ))}
          </div>
        </div>
      )}

      {/* Appraisal mode — conversational prompt suggestions */}
      {context === "appraisal" && messages.length <= 1 && (
        <div style={{ padding: "0 14px 10px" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".14em", color: T.textFaint, marginBottom: 8, fontWeight: 600 }}>Try asking</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {APPRAISAL_PROMPTS.map(p => (
              <button key={p} onClick={() => handleSuggestedPrompt(p)} style={{
                background: T.bgSubtle,
                border: `1px solid ${T.border}`,
                borderRadius: 7, padding: "8px 10px",
                color: T.textMid, fontSize: 11.5,
                cursor: "pointer", textAlign: "left",
                fontFamily: "inherit", transition: "all 150ms",
              }}>{p}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: "12px 14px 14px",
        borderTop: `1px solid ${T.border}`,
      }}>
        <div style={{
          display: "flex", gap: 6, alignItems: "flex-end",
          background: T.bgSubtle,
          border: `1px solid ${T.borderMid}`,
          borderRadius: 10, padding: "8px 8px 8px 12px",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Copilot — or describe a new deal…"
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: T.text, fontSize: 13, resize: "none",
              fontFamily: "inherit", lineHeight: 1.5, minHeight: 20, maxHeight: 120,
            }}
          />
          <MicButton listening={listening} supported={voiceSupported} onToggle={toggleVoice} T={T} size="sm" />
          <button onClick={handleSend} disabled={!input.trim() || sending} style={{
            background: input.trim() && !sending ? T.green : T.btnSendDisabled,
            color: input.trim() && !sending ? "#FFFFFF" : T.btnSendDisabledText,
            border: "none", borderRadius: 7, padding: "7px 12px",
            fontSize: 13, fontWeight: 700, cursor: input.trim() && !sending ? "pointer" : "not-allowed",
            fontFamily: "inherit", transition: "all 150ms",
          }}>↵</button>
        </div>
        <div style={{ fontSize: 10, color: T.textFaint, marginTop: 8, textAlign: "center", letterSpacing: ".02em" }}>
          Session-only. Clears on refresh.
        </div>
        <UsagePill quota={quota} T={T} onTopup={() => setShowTopup(true)} />
      </div>
      <TopupModal open={showTopup} onClose={() => setShowTopup(false)} onBuy={(p) => { setShowTopup(false); handleTopup(p); }} T={T} />
    </aside>
  );
}

/* ── Individual message bubble ─────────────────────────────────── */
/* ── Mic button — voice input via Web Speech API ──────────────── */
function MicButton({ listening, supported, onToggle, T, size = "md" }: {
  listening: boolean; supported: boolean; onToggle: () => void; T: typeof DARK_COLORS; size?: "md" | "sm";
}) {
  if (!supported) return null;
  const s = size === "sm" ? { pad: "7px 10px", icon: 15 } : { pad: "10px 12px", icon: 17 };
  return (
    <button
      type="button"
      onClick={onToggle}
      title={listening ? "Stop recording" : "Dictate your message"}
      aria-label={listening ? "Stop recording" : "Start voice input"}
      style={{
        background: listening ? "#F4645F" : "transparent",
        color: listening ? "#FFFFFF" : T.textDim,
        border: `1px solid ${listening ? "#F4645F" : T.borderMid}`,
        borderRadius: 7,
        padding: s.pad,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 150ms",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="3" width="6" height="12" rx="3"/>
        <path d="M5 11a7 7 0 0 0 14 0"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="8" y1="22" x2="16" y2="22"/>
      </svg>
      {listening && (
        <span style={{
          position: "absolute", top: -3, right: -3,
          width: 10, height: 10, borderRadius: "50%",
          background: "#F4645F",
          animation: "mic-pulse 1s infinite",
        }} />
      )}
      <style jsx>{`
        @keyframes mic-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(244,100,95,.6); transform: scale(1); }
          50%     { box-shadow: 0 0 0 6px rgba(244,100,95,0); transform: scale(1.15); }
        }
      `}</style>
    </button>
  );
}

/* ── Usage pill — compact "237 / 300 · +50 bonus" indicator ──────── */
function UsagePill({ quota, T, onTopup }: { quota: QuotaState | null; T: typeof DARK_COLORS; onTopup: () => void }) {
  if (!quota) return null;
  const total = quota.limit + quota.bonus;
  const pct = total > 0 ? quota.used / total : 0;
  const colour = pct >= 0.95 ? "#C24844" : pct >= 0.8 ? "#C57E14" : T.textFaint;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 6 }}>
      <div style={{ fontSize: 10, color: colour, letterSpacing: ".04em", fontWeight: 600 }}>
        {quota.used} / {quota.limit}{quota.bonus > 0 ? ` · +${quota.bonus} bonus` : ""} messages
      </div>
      <button onClick={onTopup} style={{
        background: "transparent", border: `1px solid ${T.border}`, color: T.textDim,
        borderRadius: 99, padding: "2px 10px", fontSize: 10, fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit", letterSpacing: ".02em",
      }}>+ Top up</button>
    </div>
  );
}

/* ── Top-up modal ──────────────────────────────────────────────── */
function TopupModal({ open, onClose, onBuy, T }: { open: boolean; onClose: () => void; onBuy: (p: "50" | "250" | "1000") => void; T: typeof DARK_COLORS }) {
  if (!open) return null;
  const packs: { id: "50" | "250" | "1000"; msgs: number; price: number; badge?: string }[] = [
    { id: "50",   msgs: 50,   price: 9 },
    { id: "250",  msgs: 250,  price: 29, badge: "Best value" },
    { id: "1000", msgs: 1000, price: 89 },
  ];
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,17,21,.55)",
        backdropFilter: "blur(4px)", zIndex: 500,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.bg, border: `1px solid ${T.borderMid}`, borderRadius: 14,
          padding: 28, maxWidth: 520, width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,.4)",
          fontFamily: "var(--val-font-body, 'Poppins', system-ui)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", color: T.text }}>Top up Copilot</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.textDim, fontSize: 22, cursor: "pointer", padding: 4, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ fontSize: 13, color: T.textDim, marginBottom: 20, lineHeight: 1.55 }}>
          Bonus messages roll over forever — they never expire.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {packs.map(p => (
            <button key={p.id} onClick={() => onBuy(p.id)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              padding: "14px 16px", borderRadius: 10,
              background: p.badge ? T.greenTint : T.bgSubtle,
              border: `1px solid ${p.badge ? T.borderAccent : T.border}`,
              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              transition: "all 150ms",
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = T.borderAccent; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = p.badge ? T.borderAccent : T.border; }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: "-.01em" }}>+{p.msgs} messages</span>
                  {p.badge && <span style={{ background: T.green, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, letterSpacing: ".08em", textTransform: "uppercase" }}>{p.badge}</span>}
                </div>
                <div style={{ fontSize: 11, color: T.textDim }}>One-time · never expires</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.green, letterSpacing: "-.02em", fontVariantNumeric: "tabular-nums" }}>${p.price}</div>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: T.textFaint, marginTop: 16, textAlign: "center" }}>
          Secure payment via Stripe. Need unlimited? <a href="/pricing" style={{ color: T.green, fontWeight: 600 }}>Upgrade to Pro →</a>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onApply, onOpenTopup, T }: { msg: Message; onApply: (m: Message) => void; onOpenTopup?: () => void; T: typeof DARK_COLORS }) {
  if (msg.typing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", alignSelf: "flex-start", background: T.assistantBubbleBg, borderRadius: 10 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: "50%",
            background: T.green,
            animation: `copilot-typing 1.2s infinite ease-in-out ${i * 0.15}s`,
          }} />
        ))}
        <style jsx>{`
          @keyframes copilot-typing {
            0%, 80%, 100% { opacity: .3; transform: scale(0.9); }
            40% { opacity: 1; transform: scale(1.1); }
          }
        `}</style>
      </div>
    );
  }

  if (msg.role === "system") {
    return (
      <div style={{
        padding: "12px 14px", background: T.greenTint,
        border: `1px solid ${T.borderAccent}`, borderRadius: 9,
        fontSize: 12, color: T.textMid, lineHeight: 1.55,
      }}>{msg.content}</div>
    );
  }

  // Quota-exceeded state — dedicated bubble with top-up + upgrade CTAs
  if (msg.quotaExceeded) {
    return (
      <div style={{
        padding: "14px 16px",
        background: "rgba(240,164,41,.08)",
        border: "1px solid rgba(240,164,41,.35)",
        borderRadius: 10,
        fontSize: 12.5, color: T.text, lineHeight: 1.55,
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", color: "#C57E14", fontWeight: 700 }}>Quota reached</div>
        <div>{msg.content}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {onOpenTopup && (
            <button onClick={onOpenTopup} style={{
              background: T.green, color: "#FFFFFF",
              border: "none", borderRadius: 7, padding: "8px 14px",
              fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>Top up messages</button>
          )}
          <a href="/pricing" style={{
            background: "transparent", color: T.text,
            border: `1px solid ${T.borderMid}`, borderRadius: 7, padding: "8px 14px",
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none",
          }}>Upgrade plan →</a>
        </div>
      </div>
    );
  }

  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", gap: 6 }}>
      <div style={{
        maxWidth: "92%",
        padding: "10px 13px",
        background: isUser ? T.userBubbleBg : T.assistantBubbleBg,
        color: isUser ? T.userBubbleText : T.text,
        borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
        fontSize: 12.5, lineHeight: 1.55,
        whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const,
        fontWeight: isUser ? 600 : 400,
      }}>
        {renderContent(msg.content)}
      </div>

      {/* Apply-suggestion card (for assistant messages with a suggestion) */}
      {!isUser && msg.suggestion && (
        <div style={{
          width: "92%", padding: "10px 12px", background: T.bgSubtle,
          border: `1px solid ${msg.suggestion.applied ? T.green : T.borderAccent}`,
          borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: T.green, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>
              {msg.suggestion.applied ? "Applied ✓" : "Suggested change"}
            </div>
            <div style={{ fontSize: 11.5, color: T.text, lineHeight: 1.4 }}>{msg.suggestion.description}</div>
          </div>
          {!msg.suggestion.applied && (
            <button onClick={() => onApply(msg)} style={{
              background: T.green, color: "#FFFFFF",
              border: "none", borderRadius: 6, padding: "6px 12px",
              fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: ".02em",
            }}>Apply</button>
          )}
        </div>
      )}
    </div>
  );
}

/* Render assistant content with light markdown support (** bold **, • bullets, newlines) */
function renderContent(content: string): JSX.Element[] {
  const parts = content.split("\n");
  return parts.map((line, i) => {
    // Bold: **text**
    const segments = line.split(/(\*\*[^*]+\*\*)/g).map((seg, j) => {
      if (seg.startsWith("**") && seg.endsWith("**")) {
        return <strong key={j}>{seg.slice(2, -2)}</strong>;
      }
      return <span key={j}>{seg}</span>;
    });
    return (
      <div key={i} style={{ minHeight: line ? undefined : 8 }}>{segments}</div>
    );
  });
}
