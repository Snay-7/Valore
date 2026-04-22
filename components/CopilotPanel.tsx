"use client";
import { useState, useRef, useEffect } from "react";

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
};

type CopilotPanelProps = {
  context?: "dashboard" | "appraisal";        // default: "appraisal"
  dealName?: string;                          // "Leinster Square Hotel" (appraisal mode)
  assetType?: string;                         // "Hotel" | "BTR" | ...
  userName?: string;                          // "Snayder" — for dashboard greeting
  onApply?: (payload: Record<string, any>) => void;   // edit current deal
  onCreate?: (payload: Record<string, any>) => void;  // create new deal
  onNewDeal?: (assetType: string) => void;    // dashboard: user picked asset — navigate
};

const ASSET_TYPES: { id: string; label: string; desc: string; icon: string }[] = [
  { id: "BTR",        label: "Build to Rent",    desc: "Residential income, stabilised yield",       icon: "🏢" },
  { id: "BTS",        label: "Build to Sell",    desc: "Residential for open-market sale",           icon: "🏗️" },
  { id: "Hotel",      label: "Hotel",            desc: "Acquisition, refurb, operating hold",         icon: "🏨" },
  { id: "Flip",       label: "Residential Flip", desc: "Buy, refurb, sell / hold / refinance",        icon: "🔨" },
  { id: "Commercial", label: "Commercial",       desc: "Office, retail, industrial yield deals",      icon: "🏬" },
  { id: "MixedUse",   label: "Mixed Use",        desc: "Multi-zone: resi + commercial blended",       icon: "🧩" },
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
  onApply,
  onCreate,
  onNewDeal,
}: CopilotPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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
  const [messages, setMessages] = useState<Message[]>(
    context === "dashboard"
      ? [
          {
            id: "sys-1",
            role: "system",
            content: userName
              ? `Hi ${userName}. What deal are we building today? Pick an asset below, or describe your deal in one line and I'll set it up.`
              : `Welcome back. What deal are we building today? Pick an asset below, or describe your deal in one line and I'll set it up.`,
            timestamp: Date.now(),
          },
        ]
      : [
          {
            id: "sys-1",
            role: "system",
            content: `I can see you're modelling ${dealName}. Ask me about this deal — "why is my IRR X%?", "what if exit cap is 5.5%?" — or describe a new deal and I'll build it.`,
            timestamp: Date.now(),
          },
        ]
  );
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Mock reply — will be replaced with real Claude call in step 2
  const mockReply = (userMsg: string): Promise<Message> => new Promise((resolve) => {
    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      let reply: Message;

      if (lower.includes("irr") && (lower.includes("low") || lower.includes("why"))) {
        reply = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: `Your IRR is compressed by the entry yield spread. Exit cap 6.5% vs entry yield 7.8% = only 130bps of yield compression over a 5-year hold. To hit a 15% IRR target, you'd need exit cap around 5.25% — which is aggressive for Bayswater midscale.\n\nAlternatives: increase ADR by 8-10%, or extend the hold to 7 years.`,
          timestamp: Date.now(),
        };
      } else if (lower.includes("exit cap") || lower.includes("cap rate")) {
        const match = lower.match(/(\d+(\.\d+)?)\s*%?/);
        const newRate = match ? parseFloat(match[1]) : 5.75;
        reply = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: `Exit cap at ${newRate}% changes the picture:\n\n• Exit Value: £27.1m (was £24.8m)\n• IRR (Levered): 17.4% (was 14.2%)\n• PoC: 38.9% (was 35.4%)\n• DSCR: 1.74× (unchanged)\n\nWant me to apply this?`,
          timestamp: Date.now(),
          suggestion: {
            description: `Change exit cap rate to ${newRate}%`,
            payload: { exitCapRate: newRate },
          },
        };
      } else if (lower.includes("dscr")) {
        reply = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: `Your DSCR is 1.52×. Institutional minimum is 1.25×, so you have 27bps of headroom before lender covenant risk.\n\nTo push it higher: reduce LTC from 60% → 55%, or grow Y1 NOI by 12%+. The simplest lever is LTC — it also improves equity multiple at exit.`,
          timestamp: Date.now(),
        };
      } else if (lower.includes("create") || lower.includes("hotel in") || lower.includes("btr in") || lower.includes("bts in")) {
        reply = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: `Parsed your deal. I'll model this as **Advanced Hotel** (5-year hold).\n\n• 58 keys · Bayswater, London\n• ADR £195 · Occupancy 72% · RevPAR £140\n• Purchase £16m · CapEx £2m · LTC 60%\n\nUsing market comps for 4-star Bayswater. Click Apply to create the appraisal.`,
          timestamp: Date.now(),
          suggestion: {
            description: "Create Bayswater Hotel (58 keys, 5-year hold, £16m)",
            payload: {
              assetType: "Hotel",
              name: "Bayswater Hotel",
              location: "Bayswater, London",
              rooms: 58,
              adr: 195,
              occupancy: 72,
              purchasePrice: 16000000,
              capexBudget: 2000000,
              ltc: 60,
              holdYears: 5,
              starRating: 4,
            },
          },
        };
      } else {
        reply = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: `Here's what I'd look at for that. (Full Claude integration ships once this UI is approved.)`,
          timestamp: Date.now(),
        };
      }
      resolve(reply);
    }, 700);
  });

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setSending(true);
    // Typing indicator
    setMessages(m => [...m, { id: "typing", role: "assistant", content: "", timestamp: Date.now(), typing: true }]);
    const reply = await mockReply(userMsg.content);
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
              {context === "dashboard" ? "Start a new deal" : `${assetType} · Session chat`}
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
          <MessageBubble key={msg.id} msg={msg} onApply={handleApply} T={T} />
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
                onClick={() => onNewDeal && onNewDeal(a.id)}
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
                <div style={{ fontSize: 16 }}>{a.icon}</div>
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
      </div>
    </aside>
  );
}

/* ── Individual message bubble ─────────────────────────────────── */
function MessageBubble({ msg, onApply, T }: { msg: Message; onApply: (m: Message) => void; T: typeof DARK_COLORS }) {
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