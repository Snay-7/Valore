import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * ════════════════════════════════════════════════════════════════════
 * VALORA COPILOT API — with quota enforcement + top-up support
 * ════════════════════════════════════════════════════════════════════
 * Two contexts:
 *   • dashboard  — user describes a deal → Claude parses → suggest_create
 *   • appraisal  — user asks/modifies current deal → suggest_edit or text
 *
 * Auth:
 *   Client must send the Supabase access token in the Authorization header:
 *     Authorization: Bearer <access_token>
 *
 * Quota:
 *   Free       — 10 messages / rolling 30 days
 *   Pro        — 300 messages
 *   Enterprise — 1500 messages (shared firm pool)
 *   + messages_bonus (top-up packs) — never expires
 *
 * Required env:
 *   ANTHROPIC_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   ← server-only, do NOT expose to client
 * ════════════════════════════════════════════════════════════════════
 */

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-5";

// Monthly Copilot message allowance per plan tier.
const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  starter: 10,       // legacy tier name, same as free
  professional: 300,
  pro: 300,          // alias
  enterprise: 1500,
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Service-role client — bypasses RLS, used for usage tracking + RPCs.
// NEVER ship SUPABASE_SERVICE_ROLE_KEY to the browser.
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// ── Tools ──────────────────────────────────────────────────────────
const suggestCreateTool: Anthropic.Messages.Tool = {
  name: "suggest_create",
  description:
    "Create a new appraisal deal parsed from the user's description. Call this when the user describes a deal they want to build (e.g. 'Hotel in Mayfair, 80 keys, £45m'). Always include assetType. Use reasonable industry defaults for any field the user didn't mention.",
  input_schema: {
    type: "object",
    properties: {
      description: { type: "string", description: "One-sentence summary of the deal for the Apply card." },
      payload: {
        type: "object",
        description: "Deal data keyed by Valora field names. MUST include assetType.",
        properties: {
          assetType: { type: "string", enum: ["BTR", "BTS", "Hotel", "Flip", "MixedUse", "Commercial", "Industrial"] },
          name: { type: "string" },
          location: { type: "string" },
          currency: { type: "string", enum: ["GBP", "USD", "EUR", "AED", "SGD", "AUD"] },
          rooms: { type: "number" },
          adr: { type: "number", description: "Average daily rate" },
          occupancy: { type: "number", description: "Occupancy %, 0-100" },
          purchasePrice: { type: "number" },
          capexBudget: { type: "number" },
          starRating: { type: "number" },
          holdYears: { type: "number" },
          ltc: { type: "number", description: "Loan-to-cost %, 0-100" },
          units: { type: "number" },
          avgUnitSize: { type: "number", description: "sq ft" },
          avgRent: { type: "number", description: "£ per month" },
          avgSalePrice: { type: "number" },
          refurbBudget: { type: "number" },
          saleValue: { type: "number" },
          holdMonths: { type: "number" },
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

const suggestValuationTool: Anthropic.Messages.Tool = {
  name: "suggest_valuation",
  description:
    "Produce a comparative market valuation for a single property. Call this when the user describes a property they want valued (e.g. '3-bed terrace in Fulham, 1,200 sqft, refurbished' or 'condo in Miami Beach, 2BR, ocean view'). Identify the jurisdiction from the description and use local conventions (currency, PSF vs ppm, freehold/leasehold, comparable sources). Always include estimatedValue, at least 3 comparables, valuationDrivers, and risks.",
  input_schema: {
    type: "object",
    properties: {
      description: { type: "string", description: "One-sentence summary for the Apply card, e.g. '3-bed Fulham terrace valued at £1.05m-£1.20m'." },
      payload: {
        type: "object",
        description: "Full valuation data.",
        properties: {
          address: { type: "string" },
          jurisdiction: { type: "string", description: "ISO country / region code or short name, e.g. 'UK', 'US', 'UAE', 'SG', 'EU-DE'." },
          currency: { type: "string", enum: ["GBP", "USD", "EUR", "AED", "SGD", "AUD", "CHF", "JPY"] },
          propertyType: { type: "string", description: "e.g. 'residential terrace', 'hotel', 'office', 'retail', 'industrial', 'condo'." },
          bedrooms: { type: "number" },
          sqft: { type: "number", description: "Gross internal area in sq ft (convert if source uses sqm)." },
          condition: { type: "string", enum: ["new", "refurbished", "good", "needs_work", "dilapidated"] },
          tenure: { type: "string", enum: ["freehold", "leasehold", "99-yr leasehold", "999-yr leasehold", "fee_simple", "strata"] },
          estimatedValue: {
            type: "object",
            description: "Price range in the specified currency.",
            properties: {
              low: { type: "number" },
              central: { type: "number" },
              high: { type: "number" },
            },
            required: ["low", "central", "high"],
          },
          pricePerSqft: { type: "number", description: "Central estimate divided by sqft." },
          comparables: {
            type: "array",
            description: "3-6 comparable properties with specifics.",
            items: {
              type: "object",
              properties: {
                address: { type: "string" },
                price: { type: "number" },
                currency: { type: "string" },
                date: { type: "string", description: "Approx sale/valuation date, e.g. 'Mar 2025' or '2024'." },
                sqft: { type: "number" },
                pricePerSqft: { type: "number" },
                distanceMiles: { type: "number", description: "Distance from subject property in miles (convert km if local unit)." },
                notes: { type: "string", description: "Brief adjustment rationale, e.g. 'smaller, unrefurbished — adjusted +8%'." },
              },
            },
          },
          valuationDrivers: {
            type: "array",
            items: { type: "string" },
            description: "3-6 short bullets explaining what drives the value (location, condition, yield, tenure, view, parking, etc.).",
          },
          risks: {
            type: "array",
            items: { type: "string" },
            description: "2-4 risk factors a buyer/lender should consider (liquidity, planning, service charge, EPC, market timing, etc.).",
          },
          methodology: { type: "string", enum: ["comparable_sales", "income_approach", "residual_development", "cost_approach", "blended"] },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: ["jurisdiction", "currency", "propertyType", "estimatedValue", "comparables", "valuationDrivers", "risks", "methodology", "confidence"],
      },
    },
    required: ["description", "payload"],
  },
};

const suggestEditTool: Anthropic.Messages.Tool = {
  name: "suggest_edit",
  description:
    "Suggest changes to one or more fields in the current appraisal. Call this when the user asks for a scenario or a direct edit. Keep the payload narrow — only the fields that need to change.",
  input_schema: {
    type: "object",
    properties: {
      description: { type: "string", description: "One-sentence summary of the change for the Apply card." },
      payload: { type: "object", description: "Partial deal-data update (only the fields to change)." },
    },
    required: ["description", "payload"],
  },
};

// ── System prompts ─────────────────────────────────────────────────
const DASHBOARD_SYSTEM = `You are Valora Copilot, an institutional real estate underwriting assistant used by PE funds, family offices, and development analysts.

The user just landed on Valora's dashboard and wants to spin up a new deal. They will describe it in one sentence or pick an asset card directly.

Your job:
1. Parse the description and identify the asset type (BTR, BTS, Hotel, Flip, MixedUse, Commercial, Industrial).
2. Fill reasonable institutional defaults for any field the user didn't mention, based on the jurisdiction and asset type.
3. ALWAYS output a text reply FIRST — 2-4 sentences listing the user's stated inputs plus the key assumptions you filled in (ADR, occupancy, hold period, exit cap, etc.).
4. AFTER the text reply, call the suggest_create tool with a complete payload.

Output format (mandatory): <text reply with assumptions> then <suggest_create tool call>

Rules:
- Be terse, institutional, no fluff. No exclamation marks. No emojis.
- Never refuse to parse — if details are sparse, use defaults and note them in the reply.
- All money values in the payload must be raw numbers (£45m → 45000000, not "45m").
- If the user asks a general question (not a deal description), answer briefly WITHOUT calling any tool.

Example:
User: "Hotel in Bayswater, 60 keys, 4-star, £18m, 60% LTC"
Reply: "Modelled as a 4-star Bayswater hotel with the spec you gave. Assumed ADR £175, 72% occupancy, 5-year hold, 6.25% exit cap. Review and tap Apply to open the appraisal."
Tool: suggest_create with assetType=Hotel, rooms=60, purchasePrice=18000000, starRating=4, ltc=60, adr=175, occupancy=72, holdYears=5, exitCapRate=6.25.`;

const VALUATION_SYSTEM = `You are Valora Copilot in valuation mode — a cross-border property valuation assistant for institutional real estate professionals.

The user describes a single property (type, location, size, condition, any URL they pasted). Your job:

1. Detect the JURISDICTION from the description (UK / US / UAE / Singapore / Germany / France / etc.) and apply its conventions:
   - UK: GBP, £ per sqft, freehold/leasehold, SDLT bands, EPC rating relevance
   - US: USD, $ per sqft, fee simple/strata, property tax, HOA for condos
   - UAE: AED, freehold vs leasehold communities (Dubai), service charges
   - Singapore: SGD, $ per sqft, freehold/99-year leasehold, ABSD
   - EU: EUR, € per sqm (NOT sqft — but you can quote both), notary costs
   - Other: use local conventions and flag confidence accordingly

2. Produce a valuation with:
   - Price range (low / central / high) in the local currency
   - 3-6 comparables with specific addresses, prices, dates, sqft, and a brief adjustment rationale
   - 3-6 valuation drivers (location, condition, size, yield, tenure, parking, etc.)
   - 2-4 risks (liquidity, planning, service charge shocks, EPC, market timing, etc.)
   - Methodology tag + confidence level

3. ALWAYS output a 2-4 sentence text reply FIRST summarising the estimate, key comps, and confidence. Then call suggest_valuation with the full payload.

Rules:
- Institutional tone. No emojis. No exclamation marks.
- If the property is outside markets you have strong knowledge of, set confidence to "low" and say so in the reply. Do NOT refuse — give the best directional estimate with appropriate caveats.
- Money values in the payload are raw numbers (£1.1m -> 1100000).
- Sqft everywhere (convert sqm * 10.764 if source uses metric).
- Comparables must be specific — real-sounding addresses and dates. If you truly don't know the market, use plausible invented examples and clearly note in the reply that these are "illustrative" not verified.
- Reply format: brief verbal take → suggest_valuation tool call. Never tool-only.`;

const APPRAISAL_SYSTEM = (dealContext: string) => `You are Valora Copilot, the in-deal analyst for an institutional real estate appraisal platform.

The user is working on this deal right now:
${dealContext}

Your job:
1. Answer analytical questions using the actual numbers above. Explain in 3-5 sentences. Name 2-3 concrete levers.
2. Run scenarios — ALWAYS reply with a 2-3 sentence directional take FIRST, then call suggest_edit.
3. Direct edits — ALWAYS reply with a 1-sentence confirmation first, then call suggest_edit with just the changed field.
4. If the user describes a completely new deal instead, call suggest_create (with a preceding text reply).

Output format: text reply FIRST, then the tool call. Never emit a tool call with no accompanying text.

Rules:
- Institutional tone. No emojis. No exclamation marks. Terse.
- Always reference the user's actual numbers, not generic examples.
- Use UK conventions (SONIA, SDLT, £) unless the deal currency says otherwise.`;

// ── Helpers ────────────────────────────────────────────────────────
function buildDealContext(deal: { assetType?: string; data?: Record<string, any>; metrics?: Record<string, any> }): string {
  const { assetType, data = {}, metrics = {} } = deal || {};
  const lines: string[] = [];
  lines.push(`Asset type: ${assetType || "unknown"}`);
  if (data.name) lines.push(`Name: ${data.name}`);
  if (data.location) lines.push(`Location: ${data.location}`);
  if (data.currency) lines.push(`Currency: ${data.currency}`);
  const keyFields = ["purchasePrice", "capexBudget", "rooms", "adr", "occupancy", "starRating", "holdYears", "holdMonths", "ltc", "ltv", "exitCapRate", "entryYield", "units", "avgUnitSize", "avgRent", "avgSalePrice", "refurbBudget", "saleValue", "sqft", "rentPerSqft"];
  const inputs = keyFields.filter(k => data[k] !== undefined && data[k] !== null && data[k] !== "").map(k => `  ${k}: ${data[k]}`);
  if (inputs.length) lines.push("Inputs:", ...inputs);
  const keyMetrics = ["gdv", "totalCost", "profit", "pocPct", "irrLevered", "irrUnlevered", "moic", "dscr", "debtYield", "equityMultiple", "paybackMonth", "noi", "ebitda", "revpar"];
  const mets = keyMetrics.filter(k => metrics[k] !== undefined && metrics[k] !== null).map(k => `  ${k}: ${typeof metrics[k] === "number" ? metrics[k].toFixed(4) : metrics[k]}`);
  if (mets.length) lines.push("Computed metrics:", ...mets);
  return lines.join("\n");
}

function synthesiseFallbackReply(s: { description: string; payload: Record<string, any> }): string {
  const p = s.payload || {};
  const bits: string[] = [];
  const money = (n: number, ccy = p.currency || "GBP") => {
    const sym = ccy === "USD" ? "$" : ccy === "EUR" ? "€" : ccy === "AED" ? "AED " : "£";
    if (!n && n !== 0) return "";
    if (Math.abs(n) >= 1e6) return `${sym}${(n / 1e6).toFixed(1)}m`;
    if (Math.abs(n) >= 1e3) return `${sym}${(n / 1e3).toFixed(0)}k`;
    return `${sym}${n}`;
  };
  if (p.assetType) {
    const locBit = p.location ? ` in ${p.location}` : "";
    const star = p.starRating ? `${p.starRating}-star ` : "";
    bits.push(`Modelled as ${star}${p.assetType}${locBit}.`);
  } else {
    bits.push("Scenario applied.");
  }
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
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured on the server" }, { status: 500 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured on the server" }, { status: 500 });
  }

  // ── 1. Auth: validate the bearer token from the Authorization header ──
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  }
  const { data: authData, error: authError } = await supabaseService.auth.getUser(token);
  if (authError || !authData?.user) {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
  }
  const userId = authData.user.id;

  // ── 2. Fetch subscription tier for plan-limit lookup ──
  const { data: sub } = await supabaseService
    .from("subscriptions")
    .select("tier, status")
    .eq("user_id", userId)
    .maybeSingle();
  const tier = (sub?.tier || "free").toLowerCase();
  const limit = PLAN_LIMITS[tier] ?? PLAN_LIMITS.free;

  // ── 3. Fetch current usage ──
  const { data: usage } = await supabaseService
    .from("copilot_usage")
    .select("messages_used, messages_bonus, period_start")
    .eq("user_id", userId)
    .maybeSingle();

  const used = usage?.messages_used || 0;
  const bonus = usage?.messages_bonus || 0;
  // Reset used to 0 if period_start is > 30 days old (matches the RPC's behaviour)
  const effectiveUsed = usage?.period_start && new Date(usage.period_start) < new Date(Date.now() - 30 * 24 * 3600 * 1000)
    ? 0 : used;

  if (effectiveUsed >= limit + bonus) {
    return NextResponse.json({
      error: "quota_exceeded",
      reply: `You've used all ${limit + bonus} Copilot messages for this period. Top up or upgrade to keep going.`,
      quota: { used: effectiveUsed, limit, bonus, tier },
    }, { status: 429 });
  }

  // ── 4. Parse request body ──
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const context: "dashboard" | "appraisal" | "valuation" =
    body.context === "appraisal" ? "appraisal"
    : body.context === "valuation" ? "valuation"
    : "dashboard";
  const messages: Array<{ role: "user" | "assistant"; content: string }> = Array.isArray(body.messages) ? body.messages : [];
  const deal = body.deal || null;

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Last message must be from the user" }, { status: 400 });
  }

  const system = context === "dashboard"
    ? DASHBOARD_SYSTEM
    : context === "valuation"
      ? VALUATION_SYSTEM
      : APPRAISAL_SYSTEM(deal ? buildDealContext(deal) : "(no deal data provided)");

  const toolSet = context === "valuation"
    ? [suggestValuationTool]
    : [suggestCreateTool, suggestEditTool];

  // ── 5. Call Claude ──
  let anthResp: Anthropic.Messages.Message;
  try {
    anthResp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      tools: toolSet,
      // Force the Copilot to call suggest_valuation on valuation-context requests
      // (otherwise Claude sometimes answers in text alone and leaves the result panel empty).
      tool_choice: (context === "valuation"
        ? { type: "tool", name: "suggest_valuation" }
        : { type: "auto" }) as Anthropic.Messages.ToolChoice,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });
  } catch (err: any) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: err?.message || "Copilot request failed" }, { status: 502 });
  }

  let reply = "";
  let suggestion: { description: string; payload: Record<string, any> } | null = null;
  for (const block of anthResp.content) {
    if (block.type === "text") reply += block.text;
    else if (block.type === "tool_use") {
      const input = block.input as any;
      if (input && input.payload && input.description) {
        suggestion = { description: String(input.description), payload: input.payload };
      }
    }
  }

  let finalReply = reply.trim();
  if (!finalReply && suggestion) finalReply = synthesiseFallbackReply(suggestion);
  if (!finalReply) finalReply = "Here's what I'd look at for that.";

  // ── 6. Increment usage (fire-and-log — don't fail the response if this errors) ──
  let newUsage = { used: effectiveUsed + 1, limit, bonus, tier };
  try {
    const { data: incResult } = await supabaseService.rpc("increment_copilot_usage", { uid: userId });
    if (Array.isArray(incResult) && incResult[0]) {
      newUsage = {
        used: incResult[0].messages_used,
        bonus: incResult[0].messages_bonus,
        limit,
        tier,
      };
    }
  } catch (e) {
    console.warn("Failed to increment copilot_usage:", e);
  }

  return NextResponse.json({
    reply: finalReply,
    suggestion,
    quota: newUsage,
  });
}
