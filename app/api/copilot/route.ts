const { data: usage } = await supabase.from("copilot_usage").select("*").eq("user_id", userId).single();
const limit = planLimits[tier];
if ((usage?.messages_used || 0) >= limit + (usage?.messages_bonus || 0)) {
  return NextResponse.json({ 
    error: "quota_exceeded",
    reply: "You've used your Copilot allowance for this month. Top up or upgrade to keep going.",
    upgradeUrl: "/pricing",
    topUpUrl: "/pricing#topup"
  }, { status: 429 });
}
// ... call Claude ...
// On success:
await supabase.rpc("increment_copilot_usage", { uid: userId });
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

/**
 * ════════════════════════════════════════════════════════════════════
 * VALORA COPILOT API
 * ════════════════════════════════════════════════════════════════════
 * Two contexts:
 *   • dashboard  — user describes a deal → Claude parses → suggest_create
 *   • appraisal  — user asks/modifies current deal → suggest_edit or text
 *
 * Requires env: ANTHROPIC_API_KEY  (set in Vercel → Settings → Environment)
 * ════════════════════════════════════════════════════════════════════
 */

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-5";

// ── Tools ──────────────────────────────────────────────────────────
const suggestCreateTool: Anthropic.Messages.Tool = {
  name: "suggest_create",
  description:
    "Create a new appraisal deal parsed from the user's description. Call this when the user describes a deal they want to build (e.g. 'Hotel in Mayfair, 80 keys, £45m'). Always include assetType. Use reasonable industry defaults for any field the user didn't mention.",
  input_schema: {
    type: "object",
    properties: {
      description: {
        type: "string",
        description: "One-sentence summary of the deal for the Apply card.",
      },
      payload: {
        type: "object",
        description:
          "Deal data keyed by Valora field names. MUST include assetType.",
        properties: {
          assetType: {
            type: "string",
            enum: ["BTR", "BTS", "Hotel", "Flip", "MixedUse", "Commercial", "Industrial"],
          },
          name: { type: "string" },
          location: { type: "string" },
          currency: { type: "string", enum: ["GBP", "USD", "EUR", "AED", "SGD", "AUD"] },
          // Hotel
          rooms: { type: "number" },
          adr: { type: "number", description: "Average daily rate" },
          occupancy: { type: "number", description: "Occupancy %, 0-100" },
          purchasePrice: { type: "number" },
          capexBudget: { type: "number" },
          starRating: { type: "number" },
          holdYears: { type: "number" },
          ltc: { type: "number", description: "Loan-to-cost %, 0-100" },
          // BTR/BTS
          units: { type: "number" },
          avgUnitSize: { type: "number", description: "sq ft" },
          avgRent: { type: "number", description: "£ per month" },
          avgSalePrice: { type: "number" },
          // Flip
          refurbBudget: { type: "number" },
          saleValue: { type: "number" },
          holdMonths: { type: "number" },
          // Commercial
          sqft: { type: "number" },
          rentPerSqft: { type: "number" },
          exitCapRate: { type: "number", description: "%, 0-100" },
        },
        required: ["assetType"],
      },
    },
    required: ["description", "payload"],
  },
};

const suggestEditTool: Anthropic.Messages.Tool = {
  name: "suggest_edit",
  description:
    "Suggest changes to one or more fields in the current appraisal. Call this when the user asks for a scenario ('what if exit cap is 5.5%?') or a direct edit ('change ADR to £200'). Keep the payload narrow — only the fields that need to change.",
  input_schema: {
    type: "object",
    properties: {
      description: {
        type: "string",
        description: "One-sentence summary of the change for the Apply card.",
      },
      payload: {
        type: "object",
        description: "Partial deal-data update (only the fields to change).",
      },
    },
    required: ["description", "payload"],
  },
};

// ── System prompts ─────────────────────────────────────────────────
const DASHBOARD_SYSTEM = `You are Valora Copilot, an institutional real estate underwriting assistant used by PE funds, family offices, and development analysts.

The user just landed on Valora's dashboard and wants to spin up a new deal. They will describe it in one sentence or pick an asset card directly.

Your job:
1. Parse the description and identify the asset type (BTR, BTS, Hotel, Flip, MixedUse, Commercial, Industrial).
2. Fill reasonable institutional defaults for any field the user didn't mention, based on the jurisdiction and asset type (e.g. 72% occupancy for mid-scale UK hotels, 5.5% exit cap for Prime London commercial, 60% LTC for hotel dev, etc.).
3. ALWAYS output a text reply FIRST — 2-4 sentences listing the user's stated inputs plus the key assumptions you filled in (ADR, occupancy, hold period, exit cap, etc.). The user needs to see what defaults you picked BEFORE hitting Apply.
4. AFTER the text reply, call the suggest_create tool with a complete payload.

Output format (mandatory):
   <text reply with assumptions>
   <suggest_create tool call>

Rules:
- Be terse, institutional, no fluff. No exclamation marks. No emojis.
- Never refuse to parse — if details are sparse, use defaults and note them in the reply.
- All money values in the payload must be raw numbers (£45m → 45000000, not "45m").
- If the user asks a general question (not a deal description), answer briefly WITHOUT calling any tool.

Example:
User: "Hotel in Bayswater, 60 keys, 4-star, £18m, 60% LTC"
Your text reply: "Modelled as a 4-star Bayswater hotel with the spec you gave. I've assumed ADR £175, 72% occupancy (mid-scale Bayswater comp), 5-year hold, and a 6.25% exit cap. Review and tap Apply to open the appraisal."
Your tool call: suggest_create with assetType=Hotel, rooms=60, purchasePrice=18000000, starRating=4, ltc=60, adr=175, occupancy=72, holdYears=5, exitCapRate=6.25, etc.`;

const APPRAISAL_SYSTEM = (dealContext: string) => `You are Valora Copilot, the in-deal analyst for an institutional real estate appraisal platform.

The user is working on this deal right now:
${dealContext}

Your job:
1. Answer analytical questions ("why is my IRR low?", "is DSCR healthy?") using the actual numbers above. Explain in 3-5 sentences. Name 2-3 concrete levers.
2. Run scenarios ("what if exit cap is 5.5%?") — ALWAYS reply with 2-3 sentences explaining the directional impact FIRST, then call suggest_edit with the field change so the user can Apply it.
3. Direct edits ("change ADR to £200", "increase LTC to 65%") — ALWAYS reply with a 1-sentence confirmation first, then call suggest_edit with the changed field.
4. If the user describes a completely new deal instead, call suggest_create (also with a preceding text reply).

Output format: text reply FIRST, then the tool call. Never emit a tool call with no accompanying text — the user needs context before clicking Apply.

Rules:
- Institutional tone. No emojis. No exclamation marks. Terse.
- Always reference the user's actual numbers, not generic examples.
- If the user asks for a scenario, pair a brief verbal take with a suggest_edit call.
- Use UK conventions by default (SONIA, SDLT, £) unless the deal currency says otherwise.`;

// ── Helper: compact deal summary for appraisal context ─────────────
function buildDealContext(deal: {
  assetType?: string;
  data?: Record<string, any>;
  metrics?: Record<string, any>;
}): string {
  const { assetType, data = {}, metrics = {} } = deal || {};
  const lines: string[] = [];
  lines.push(`Asset type: ${assetType || "unknown"}`);
  if (data.name) lines.push(`Name: ${data.name}`);
  if (data.location) lines.push(`Location: ${data.location}`);
  if (data.currency) lines.push(`Currency: ${data.currency}`);

  // Key input fields — we pick ~15 that most often drive the conversation
  const keyFields = [
    "purchasePrice", "capexBudget", "rooms", "adr", "occupancy", "starRating",
    "holdYears", "holdMonths", "ltc", "ltv", "exitCapRate", "entryYield",
    "units", "avgUnitSize", "avgRent", "avgSalePrice",
    "refurbBudget", "saleValue",
    "sqft", "rentPerSqft",
  ];
  const inputs = keyFields
    .filter((k) => data[k] !== undefined && data[k] !== null && data[k] !== "")
    .map((k) => `  ${k}: ${data[k]}`);
  if (inputs.length) lines.push("Inputs:", ...inputs);

  // Metrics (computed results)
  const keyMetrics = ["gdv", "totalCost", "profit", "pocPct", "irrLevered", "irrUnlevered", "moic", "dscr", "debtYield", "equityMultiple", "paybackMonth", "noi", "ebitda", "revpar"];
  const mets = keyMetrics
    .filter((k) => metrics[k] !== undefined && metrics[k] !== null)
    .map((k) => `  ${k}: ${typeof metrics[k] === "number" ? metrics[k].toFixed(4) : metrics[k]}`);
  if (mets.length) lines.push("Computed metrics:", ...mets);

  return lines.join("\n");
}

// ── Synthesise a readable reply from a suggestion payload ─────────
// Used when Claude emits only a tool call without a text block.
function synthesiseFallbackReply(s: { description: string; payload: Record<string, any> }): string {
  const p = s.payload || {};
  const bits: string[] = [];

  // Money formatter
  const money = (n: number, ccy = p.currency || "GBP") => {
    const sym = ccy === "USD" ? "$" : ccy === "EUR" ? "€" : ccy === "AED" ? "AED " : "£";
    if (!n && n !== 0) return "";
    if (Math.abs(n) >= 1e6) return `${sym}${(n / 1e6).toFixed(1)}m`;
    if (Math.abs(n) >= 1e3) return `${sym}${(n / 1e3).toFixed(0)}k`;
    return `${sym}${n}`;
  };

  // Opening line
  if (p.assetType) {
    const locBit = p.location ? ` in ${p.location}` : "";
    const star = p.starRating ? `${p.starRating}-star ` : "";
    bits.push(`Modelled as ${star}${p.assetType}${locBit}.`);
  } else {
    bits.push("Scenario applied.");
  }

  // Key spec line
  const spec: string[] = [];
  if (p.rooms) spec.push(`${p.rooms} keys`);
  if (p.units) spec.push(`${p.units} units`);
  if (p.purchasePrice) spec.push(`${money(p.purchasePrice)} purchase`);
  if (p.ltc) spec.push(`${p.ltc}% LTC`);
  if (p.ltv) spec.push(`${p.ltv}% LTV`);
  if (p.adr) spec.push(`ADR ${money(p.adr)}`);
  if (p.occupancy) spec.push(`${p.occupancy}% occupancy`);
  if (p.exitCapRate) spec.push(`exit cap ${p.exitCapRate}%`);
  if (p.holdYears) spec.push(`${p.holdYears}-yr hold`);
  if (p.holdMonths) spec.push(`${p.holdMonths}-mo hold`);
  if (spec.length) bits.push(spec.join(" · ") + ".");

  bits.push("Review and tap Apply to open the appraisal.");
  return bits.join(" ");
}

// ── POST handler ───────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured on the server" },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const context: "dashboard" | "appraisal" = body.context === "appraisal" ? "appraisal" : "dashboard";
  const messages: Array<{ role: "user" | "assistant"; content: string }> = Array.isArray(body.messages) ? body.messages : [];
  const deal = body.deal || null;

  // Guard — at least one user message
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Last message must be from the user" }, { status: 400 });
  }

  const system =
    context === "dashboard"
      ? DASHBOARD_SYSTEM
      : APPRAISAL_SYSTEM(deal ? buildDealContext(deal) : "(no deal data provided)");

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      tools: [suggestCreateTool, suggestEditTool],
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    let reply = "";
    let suggestion: { description: string; payload: Record<string, any> } | null = null;

    for (const block of response.content) {
      if (block.type === "text") {
        reply += block.text;
      } else if (block.type === "tool_use") {
        const input = block.input as any;
        if (input && input.payload && input.description) {
          suggestion = {
            description: String(input.description),
            payload: input.payload,
          };
        }
      }
    }

    // Defensive fallback: if Claude skipped the text block but produced a
    // tool call, synthesise a short summary from the payload so the user
    // isn't staring at the generic stub.
    let finalReply = reply.trim();
    if (!finalReply && suggestion) {
      finalReply = synthesiseFallbackReply(suggestion);
    }
    if (!finalReply) finalReply = "Here's what I'd look at for that.";

    return NextResponse.json({
      reply: finalReply,
      suggestion,
    });
  } catch (err: any) {
    console.error("Copilot API error:", err);
    return NextResponse.json(
      { error: err?.message || "Copilot request failed" },
      { status: 500 }
    );
  }
}
