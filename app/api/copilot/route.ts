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
3. Call the suggest_create tool with a complete payload.
4. Reply with a tight 2-sentence confirmation listing the key assumptions so the user can sanity-check before hitting Apply.

Rules:
- Be terse, institutional, no fluff. No exclamation marks.
- Never refuse to parse — if details are sparse, use defaults and note them in the reply.
- All money values in the payload must be raw numbers (£45m → 45000000, not "45m").
- If the user asks a general question (not a deal description), answer briefly WITHOUT calling any tool.`;

const APPRAISAL_SYSTEM = (dealContext: string) => `You are Valora Copilot, the in-deal analyst for an institutional real estate appraisal platform.

The user is working on this deal right now:
${dealContext}

Your job:
1. Answer analytical questions ("why is my IRR low?", "is DSCR healthy?") using the actual numbers above. Explain in 3-5 sentences. Name 2-3 concrete levers.
2. Run scenarios ("what if exit cap is 5.5%?") — estimate the impact directionally, then call suggest_edit with the field change so the user can Apply it.
3. Direct edits ("change ADR to £200", "increase LTC to 65%") — call suggest_edit immediately with just the changed field.
4. If the user describes a completely new deal instead, call suggest_create.

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

    return NextResponse.json({
      reply: reply.trim() || "Here's what I'd look at for that.",
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
