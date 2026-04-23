import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * ════════════════════════════════════════════════════════════════════
 * VALORA — BROCHURE UPLOAD / OM-TO-MODEL API
 * ════════════════════════════════════════════════════════════════════
 * Drop at: app/api/brochure-upload/route.ts
 * ────────────────────────────────────────────────────────────────────
 * Accepts a PDF offering memorandum (OM) via multipart/form-data and
 * extracts a structured deal payload using Claude Sonnet's native PDF
 * reading — text + visual content (charts, rendered P&Ls, comparables
 * graphics). Returns a payload matching Valora's appraisal field names,
 * plus flags the underwriter needs to verify.
 *
 * Usage from the client:
 *   const fd = new FormData();
 *   fd.append("file", pdfFile);
 *   fd.append("context", "Asking price £116m, off-market"); // optional
 *   fetch("/api/brochure-upload", {
 *     method: "POST",
 *     headers: { Authorization: `Bearer ${session.access_token}` },
 *     body: fd,
 *   });
 *
 * Quota: free tier gets 1 extraction (trial), Pro+ unlimited.
 *
 * Required env:
 *   ANTHROPIC_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 * ════════════════════════════════════════════════════════════════════
 */

export const runtime = "nodejs";
export const maxDuration = 60;   // Claude PDF reads can take 15-30s on long decks
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-5";
const MAX_PDF_BYTES = 10 * 1024 * 1024;  // 10MB — covers 99% of OMs

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// ── Extraction tool schema ────────────────────────────────────────
// One tool with a flexible payload — fields vary by asset type, so we list
// every plausible field and let Claude fill only what's present.
const createDealFromOmTool: Anthropic.Messages.Tool = {
  name: "create_deal_from_om",
  description:
    "Extract a complete deal model from the uploaded offering memorandum. Read text AND visual content (P&L charts, comparable graphics, floor plans with annotations). Return the structured payload, a one-sentence description, confidence rating, and flags the underwriter should verify.",
  input_schema: {
    type: "object",
    properties: {
      description: {
        type: "string",
        description: "One-sentence summary for the analyst's review card, e.g. '332-key Hampton by Hilton Waterloo — £116m asking, long leasehold.'",
      },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low"],
        description: "How confident in the extracted data. Low if many fields were inferred from context or the deck lacked financial detail.",
      },
      payload: {
        type: "object",
        description: "Deal data keyed by Valora field names. MUST include assetType.",
        properties: {
          assetType: { type: "string", enum: ["BTR", "BTS", "Hotel", "Flip", "MixedUse", "Commercial", "Industrial"] },
          name: { type: "string", description: "Project/property name, e.g. 'Hampton by Hilton Waterloo' or 'Hammersmith Grove'." },
          location: { type: "string", description: "Short locality, e.g. 'Waterloo, London' or 'Marylebone, W1H'." },
          address: { type: "string", description: "Full postal address if stated." },
          currency: { type: "string", enum: ["GBP", "USD", "EUR", "AED", "SGD", "AUD"] },

          // Hotel
          rooms: { type: "number", description: "Number of keys." },
          adr: { type: "number", description: "Average daily rate, local currency." },
          occupancy: { type: "number", description: "0-100." },
          starRating: { type: "number", description: "1-5." },
          brand: { type: "string" },

          // Flip / residential trade
          purchasePrice: { type: "number", description: "Asking/acquisition price, raw number (£1.99m → 1990000)." },
          refurbBudget: { type: "number" },
          saleValue: { type: "number" },
          holdMonths: { type: "number" },

          // BTR / BTS / development
          units: { type: "number", description: "Total residential units (private + affordable)." },
          affordableUnits: { type: "number", description: "Of total units, how many are affordable/social/LLR." },
          avgUnitSize: { type: "number", description: "sqft, average across all units." },
          avgRent: { type: "number", description: "£ per month per unit (if stated)." },
          avgRentPsf: { type: "number", description: "£ per sqft per year (common in BTR decks)." },
          avgSalePrice: { type: "number" },

          // Development costs
          landCost: { type: "number", description: "Land + acquisition cost in local currency raw." },
          constructionCost: { type: "number" },
          gdv: { type: "number", description: "Gross development value if stated." },
          planningCosts: { type: "number" },

          // Commercial / Industrial
          sqft: { type: "number", description: "Lettable area." },
          rentPerSqft: { type: "number", description: "£/sqft/year." },

          // Shared
          holdYears: { type: "number" },
          ltc: { type: "number", description: "Loan-to-cost %, 0-100." },
          ltv: { type: "number", description: "Loan-to-value %, 0-100." },
          exitCapRate: { type: "number", description: "%, 0-100." },
          entryYield: { type: "number", description: "NEY or NIY %, 0-100." },
          tenure: {
            type: "string",
            enum: ["freehold", "leasehold", "long_leasehold", "fee_simple", "strata"],
            description: "Dominant tenure. For mixed-tenure properties, pick dominant + add a flag.",
          },
          leaseYearsRemaining: { type: "number" },
          openingYear: { type: "number", description: "For hotels — year opened / trading." },
          gia: { type: "number", description: "Gross internal area, sqft." },
          giaSqm: { type: "number", description: "Transparency echo if source uses sqm." },

          // Mixed-use summary
          secondaryUses: {
            type: "string",
            description: "Brief summary of non-primary uses, e.g. '17k sqft gym + 28k sqft office + 10k sqft amenity'.",
          },

          // Upside / narrative
          upsideNotes: {
            type: "string",
            description: "Short free-text on upside levers called out in the deck (key additions, planning options, rent growth headroom, etc).",
          },
        },
        required: ["assetType"],
      },
      flags: {
        type: "array",
        description: "Things the underwriter must verify, aggressive assumptions in the broker's base case, or data that had to be inferred. Be institutionally sharp.",
        items: {
          type: "object",
          properties: {
            severity: { type: "string", enum: ["info", "warning", "critical"] },
            message: { type: "string" },
          },
          required: ["severity", "message"],
        },
      },
      sourceNotes: {
        type: "string",
        description: "Brief note of which pages contributed which data, e.g. 'Summary facts from page 2; financials from page 10; ADR/occupancy read from P&L chart on page 12.'",
      },
    },
    required: ["description", "confidence", "payload"],
  },
};

const OM_SYSTEM = `You are Valora's Brochure Extractor, reading an institutional real estate offering memorandum (OM) on behalf of an analyst who needs to build an underwriting model.

Your job: extract every modelable fact from the PDF — BOTH text content AND visual content (charts, rendered P&L tables, comparables graphics, floor plans with annotations). You can read PDFs natively including images — use that capability fully.

Output, via the create_deal_from_om tool:
1. A one-sentence description for the analyst's Review card.
2. A confidence rating (high/medium/low) based on how much you had to infer vs extract.
3. A payload with as many fields as the OM supports — do NOT invent fields you can't verify from the document or user-supplied context.
4. Flags — things the analyst MUST verify, aggressive broker assumptions, or missing data the user provided in their context message.
5. Source notes — brief mention of which pages contributed which data.

Rules:
- Always identify the DOMINANT asset type (BTR, Hotel, Flip, etc). If the deck covers multiple uses, pick the primary one and note the rest in payload.secondaryUses.
- Raw numbers: £45m → 45000000, not "45m". Percentages as numbers: 6.5 (not 0.065).
- Sqft preferred. If source uses sqm, convert (sqm × 10.764 ≈ sqft) and also emit giaSqm for transparency.
- For multi-tenure properties (freehold building with leasehold flats inside), pick the dominant tenure for the payload and add a flag describing the structure.
- If the asking price isn't stated in the deck but the user provided it in their context message, USE that value and add an INFO flag saying "Asking price supplied by analyst, not in deck." Similarly for any other analyst-supplied field.
- NEVER guess numbers that aren't in the deck or context. Leave fields undefined rather than invent. Every fabricated number destroys the analyst's trust in the whole extraction.
- Flags must be INSTITUTIONALLY SHARP. Good examples:
    • "Broker's base case shows 78% occupancy — Waterloo submarket tracks closer to 72% on RevPAR index. Stress test."
    • "NEY 4.15% is tight for secondary London BTR at 20% affordable — comparable schemes trade 4.5–4.75%."
    • "Planning consent assumed by July 2027 — significant downside risk if delayed; JRL's Gateway 2 track record partly mitigates."
    • "215-year head lease with ground rent not disclosed — requires legal DD before underwriting as quasi-freehold."
    • "P&L shown as image on pages 12-13; ADR/occupancy read from chart, verify against broker DD pack."
- Keep flag messages to one sentence, two max.
- NO emojis. NO exclamation marks. Institutional analyst tone throughout.

You MUST call the create_deal_from_om tool. Never respond with plain text alone.`;

// ── POST handler ──────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured on the server" }, { status: 500 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured on the server" }, { status: 500 });
  }

  // ── 1. Auth ──
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  const { data: authData, error: authError } = await supabaseService.auth.getUser(token);
  if (authError || !authData?.user) return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
  const userId = authData.user.id;

  // ── 2. Quota: free gets 1 extraction as a trial, Pro+ unlimited ──
  const { data: sub } = await supabaseService
    .from("subscriptions")
    .select("tier, status")
    .eq("user_id", userId)
    .maybeSingle();
  const tier = (sub?.tier || "free").toLowerCase();
  const status = (sub?.status || "").toLowerCase();
  const isPaid = ["professional", "pro", "enterprise"].includes(tier) || status === "trialing";
  const OM_FREE_LIMIT = 1;
  if (!isPaid) {
    const { count } = await supabaseService
      .from("om_extractions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) >= OM_FREE_LIMIT) {
      return NextResponse.json({
        error: "om_trial_exhausted",
        message: `You've used your free brochure extraction (${OM_FREE_LIMIT} on the free plan). Upgrade to Pro for unlimited OM-to-Model.`,
        upgradeUrl: "/pricing",
      }, { status: 403 });
    }
  }

  // ── 3. Parse multipart body ──
  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: "Invalid multipart/form-data body" }, { status: 400 }); }

  const file = formData.get("file");
  const userContext = String(formData.get("context") || "").trim();
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded — include 'file' in form data" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: `Unsupported file type: ${file.type || "unknown"}. Please upload a PDF.` }, { status: 415 });
  }
  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json({
      error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max ${MAX_PDF_BYTES / 1024 / 1024}MB.`,
    }, { status: 413 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
  }

  // ── 4. Base64 encode the PDF ──
  const pdfBuf = Buffer.from(await file.arrayBuffer());
  const pdfBase64 = pdfBuf.toString("base64");

  // ── 5. Build the user message: document block + optional context ──
  const contextParts: string[] = [
    `Filename: ${file.name}`,
    `File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
  ];
  if (userContext) contextParts.push(`Extra context from the analyst (use this alongside the document):\n"""\n${userContext}\n"""`);
  contextParts.push(
    "Extract the deal model from the document (reading text AND visual content). Call create_deal_from_om with the full payload."
  );

  const userContent: Anthropic.Messages.ContentBlockParam[] = [
    {
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
    } as any,
    { type: "text", text: contextParts.join("\n\n") },
  ];

  // ── 6. Call Claude ──
  let anthResp: Anthropic.Messages.Message;
  const t0 = Date.now();
  try {
    anthResp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3000,
      system: OM_SYSTEM,
      tools: [createDealFromOmTool],
      tool_choice: { type: "tool", name: "create_deal_from_om" },
      messages: [{ role: "user", content: userContent as any }],
    });
  } catch (err: any) {
    console.error("Anthropic OM extract error:", err?.message || err);
    return NextResponse.json({
      error: err?.message || "Brochure extraction failed",
      hint: "If this is a scanned/image-only PDF, Claude may not read all content. Try a text-based PDF if available.",
    }, { status: 502 });
  }
  const elapsedMs = Date.now() - t0;

  // ── 7. Parse the tool response ──
  let description = "";
  let confidence: "high" | "medium" | "low" = "medium";
  let payload: Record<string, any> | null = null;
  let flags: Array<{ severity: string; message: string }> = [];
  let sourceNotes = "";
  for (const block of anthResp.content) {
    if (block.type === "tool_use") {
      const input = block.input as any;
      if (input && input.payload && typeof input.payload === "object") {
        payload = input.payload;
        description = typeof input.description === "string" ? input.description.trim() : "";
        confidence = (["high", "medium", "low"].includes(input.confidence) ? input.confidence : "medium") as any;
        flags = Array.isArray(input.flags)
          ? input.flags.filter((f: any) => f && typeof f.message === "string")
          : [];
        sourceNotes = typeof input.sourceNotes === "string" ? input.sourceNotes.trim() : "";
      }
    }
  }

  if (!payload) {
    return NextResponse.json({
      error: "No structured data extracted from PDF",
      hint: "The document may be unreadable or the extraction was truncated. Try a smaller PDF or add more context.",
      stopReason: anthResp.stop_reason,
    }, { status: 502 });
  }
  if (anthResp.stop_reason === "max_tokens") {
    console.warn("OM extract hit max_tokens — payload may be partial", { userId, filename: file.name });
    flags.push({
      severity: "warning",
      message: "Extraction response was truncated — some fields or flags may be missing. Consider re-running with a more focused context message.",
    });
  }

  // ── 8. Log usage (don't fail the response if log fails) ──
  try {
    await supabaseService.from("om_extractions").insert({
      user_id: userId,
      filename: file.name,
      file_size: file.size,
      asset_type: payload.assetType || null,
      confidence,
      flag_count: flags.length,
      elapsed_ms: elapsedMs,
      user_context: userContext || null,
    });
  } catch (e) {
    console.warn("Failed to log om_extractions:", e);
  }

  return NextResponse.json({
    description,
    confidence,
    payload,
    flags,
    sourceNotes,
    filename: file.name,
    elapsedMs,
  });
}