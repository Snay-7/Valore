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

The user describes a single property (type, location, size, condition) and may paste a listing URL. Your job:

0. URL HANDLING: if the user pastes a listing URL from Rightmove, Zoopla, OnTheMarket, Zillow, Realtor.com, Redfin, Bayut, PropertyFinder, PropertyGuru, 99.co, Immobilienscout24, SeLoger or similar, the server may have already fetched the listing and appended a block labelled "[Listing data fetched from URL — use this as ground truth for address, price, sqft, bedrooms]" to the user's message. When that block is present:
   - Treat the address, price, sqft, and bedroom values in that block as GROUND TRUTH. Copy them verbatim into payload.address / payload.estimatedValue.central / payload.sqft / payload.bedrooms.
   - The listed price is the ASKING PRICE, not necessarily market value — but anchor your central estimate within ±10% of it unless you have a strong reason otherwise, and explain the delta in valuationDrivers.
   - You may now confidently say "based on the listing" (not "based on the URL") in the reply.
   If that block is NOT present (server couldn't reach the site, or the site is not whitelisted), fall back to extracting what you can from the URL structure — address fragments, property IDs, location slugs — and say "based on the listing you shared" while flagging confidence as "low" or "medium".

1. Detect the JURISDICTION from the description or URL domain (UK / US / UAE / Singapore / Germany / France / etc.) and apply its conventions:
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
- Reply format: brief verbal take → suggest_valuation tool call. Never tool-only.

CRITICAL — respect user-specified values exactly:
- If the user states a specific number of bedrooms, bathrooms, sqft, sqm, price, year built, or any other quantity, that value MUST appear verbatim in your payload. Do not substitute your own "typical" number.
- Example: user says "8 beds" → payload.bedrooms = 8. Not 4, not 6, not what you think is typical.
- Example: user says "1,200 sqft" → payload.sqft = 1200. Do not round or "normalise".
- Example: user says "200 sqm" → payload.sqft = 2153 (converted, not invented).
- Only infer missing values the user did NOT specify. Specified values are ground truth.`;

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

// ── URL import (SSRF-safe listing fetch) ───────────────────────────
// Whitelist of hostnames we'll fetch from. Exact suffix match
// (e.g. "www.rightmove.co.uk" matches "rightmove.co.uk"). Anything else is refused.
const LISTING_HOST_WHITELIST = [
  // UK
  "rightmove.co.uk", "zoopla.co.uk", "onthemarket.com", "primelocation.com", "savills.co.uk", "knightfrank.co.uk", "foxtons.co.uk",
  // US
  "zillow.com", "redfin.com", "realtor.com", "trulia.com", "compass.com", "homes.com", "loopnet.com",
  // UAE
  "bayut.com", "propertyfinder.ae", "dubizzle.com",
  // Singapore / APAC
  "propertyguru.com.sg", "99.co", "edgeprop.sg",
  // Australia
  "domain.com.au", "realestate.com.au",
  // EU
  "immobilienscout24.de", "immowelt.de", "seloger.com", "leboncoin.fr", "idealista.com", "idealista.it", "idealista.pt", "funda.nl", "immobiliare.it", "fotocasa.es",
];

function isListingHostAllowed(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^www\./, "");
  return LISTING_HOST_WHITELIST.some(allowed => h === allowed || h.endsWith("." + allowed));
}

// Strip HTML tags, collapse whitespace, and cap length — gives the LLM a tight context block.
function htmlToSummary(html: string, maxChars = 2000): string {
  // Kill script/style blocks entirely
  const noScript = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  const text = noScript.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxChars ? text.slice(0, maxChars) + "…" : text;
}

// Pull meta tags, og tags, and JSON-LD blocks from a listing page.
// Returns a compact plain-text brief (≤2.5k chars) suitable for appending to the
// user's prompt. Returns null on any fetch/parse failure — caller falls back to
// URL-slug extraction inside the Copilot prompt.
async function extractPropertyFromUrl(url: string): Promise<string | null> {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return null; }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  if (!isListingHostAllowed(parsed.hostname)) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let html = "";
  try {
    const res = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        // Realistic UA — many listing sites block naked fetch() calls.
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html") && !ct.includes("application/xhtml")) return null;
    // Cap to first ~600KB — listing pages have hero data near the top.
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf.slice(0, 600_000));
    html = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }

  if (!html) return null;

  // Extract <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract meta tags we care about
  const metaPick = (names: string[]): string => {
    for (const n of names) {
      const re = new RegExp(`<meta[^>]+(?:name|property)=["']${n}["'][^>]+content=["']([^"']+)["']`, "i");
      const m = html.match(re);
      if (m) return m[1].trim();
      const reAlt = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${n}["']`, "i");
      const mAlt = html.match(reAlt);
      if (mAlt) return mAlt[1].trim();
    }
    return "";
  };
  const ogTitle = metaPick(["og:title", "twitter:title"]);
  const ogDesc = metaPick(["og:description", "twitter:description", "description"]);
  const ogLocale = metaPick(["og:locale"]);
  const ogSite = metaPick(["og:site_name"]);

  // Extract all JSON-LD blocks and pull Residence / House / Product / RealEstateListing / Offer data.
  const jsonLdBlocks: any[] = [];
  const ldRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ldMatch: RegExpExecArray | null;
  while ((ldMatch = ldRegex.exec(html)) && jsonLdBlocks.length < 8) {
    try {
      const raw = ldMatch[1].trim();
      const parsedLd = JSON.parse(raw);
      if (Array.isArray(parsedLd)) jsonLdBlocks.push(...parsedLd);
      else jsonLdBlocks.push(parsedLd);
    } catch {
      // Ignore malformed blocks
    }
  }

  // Pick the first block that looks like a property / offer / product.
  const propBlock = jsonLdBlocks.find((b) => {
    const t = (b["@type"] || "").toString().toLowerCase();
    return ["residence", "house", "apartment", "singlefamilyresidence", "product", "realestatelisting", "accommodation", "place", "offer"].some(k => t.includes(k));
  });

  // Extract price/sqft/bedrooms hints from the body HTML as a fallback (site-agnostic regex sweep).
  const bodyText = htmlToSummary(html, 8000);
  const priceHint = bodyText.match(/(?:£|\$|€|AED\s?|S\$)\s?[\d,]+(?:\.\d+)?\s?(?:m|k|million|thousand)?/gi)?.slice(0, 4) || [];
  const bedsHint = bodyText.match(/(\d+)\s*(?:bed(?:room)?s?)\b/gi)?.slice(0, 3) || [];
  const bathsHint = bodyText.match(/(\d+)\s*(?:bath(?:room)?s?)\b/gi)?.slice(0, 3) || [];
  const sqftHint = bodyText.match(/[\d,]+\s*(?:sq\s?ft|sqft|sq\.?\s?ft|square\s?feet|sqm|sq\s?m|m²)/gi)?.slice(0, 3) || [];

  const parts: string[] = [];
  parts.push(`URL: ${parsed.toString()}`);
  if (ogSite) parts.push(`Source: ${ogSite}`);
  if (title) parts.push(`Title: ${title}`);
  if (ogTitle && ogTitle !== title) parts.push(`OG title: ${ogTitle}`);
  if (ogDesc) parts.push(`Description: ${ogDesc}`);
  if (ogLocale) parts.push(`Locale: ${ogLocale}`);
  if (propBlock) {
    // Compact JSON-LD summary
    const pb = propBlock;
    const pbName = pb.name || pb.headline;
    const pbAddr = typeof pb.address === "string" ? pb.address : pb.address ? Object.values(pb.address).filter(v => typeof v === "string").join(", ") : "";
    const pbOffer = pb.offers || pb.offer;
    const pbPrice = pbOffer?.price || pbOffer?.priceSpecification?.price;
    const pbCcy = pbOffer?.priceCurrency || pbOffer?.priceSpecification?.priceCurrency;
    const pbArea = pb.floorSize?.value || pb.floorSize;
    const pbBeds = pb.numberOfBedrooms || pb.numberOfRooms;
    const pbBaths = pb.numberOfBathroomsTotal || pb.numberOfBathrooms;
    if (pbName) parts.push(`Listing name: ${pbName}`);
    if (pbAddr) parts.push(`Address: ${pbAddr}`);
    if (pbPrice) parts.push(`Price: ${pbCcy || ""} ${pbPrice}`.trim());
    if (pbArea) parts.push(`Floor size: ${typeof pbArea === "object" ? JSON.stringify(pbArea) : pbArea}`);
    if (pbBeds) parts.push(`Bedrooms: ${pbBeds}`);
    if (pbBaths) parts.push(`Bathrooms: ${pbBaths}`);
  }
  if (priceHint.length) parts.push(`Price hints: ${priceHint.join(" · ")}`);
  if (bedsHint.length) parts.push(`Bedroom hints: ${bedsHint.join(" · ")}`);
  if (bathsHint.length) parts.push(`Bathroom hints: ${bathsHint.join(" · ")}`);
  if (sqftHint.length) parts.push(`Area hints: ${sqftHint.join(" · ")}`);

  const summary = parts.join("\n");
  return summary.length > 2500 ? summary.slice(0, 2500) + "…" : summary;
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

  // ── 2. Parse request body (must happen before the valuation gate) ──
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

  // ── 3. Fetch subscription tier for plan-limit lookup ──
  const { data: sub } = await supabaseService
    .from("subscriptions")
    .select("tier, status")
    .eq("user_id", userId)
    .maybeSingle();
  const tier = (sub?.tier || "free").toLowerCase();
  const status = (sub?.status || "").toLowerCase();
  const isTrialing = status === "trialing";
  const isPaidTier = tier === "professional" || tier === "pro" || tier === "enterprise" || isTrialing;
  const limit = PLAN_LIMITS[tier] ?? PLAN_LIMITS.free;

  // Valuation: free/starter tier gets 3 valuations as a trial, then the upgrade gate.
  // Pro+ (and trialing) = unlimited.
  const VALUATION_FREE_LIMIT = 3;
  if (context === "valuation" && !isPaidTier) {
    const { count: valCount } = await supabaseService
      .from("valuations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    const valsUsed = valCount ?? 0;
    if (valsUsed >= VALUATION_FREE_LIMIT) {
      return NextResponse.json({
        error: "valuation_trial_exhausted",
        reply: `You've used all ${VALUATION_FREE_LIMIT} of your free valuations. Upgrade to Pro for unlimited cross-border valuations, shareable reports, and IC-ready PDFs.`,
        upgradeUrl: "/pricing",
        trial: { used: valsUsed, limit: VALUATION_FREE_LIMIT },
      }, { status: 403 });
    }
  }

  // ── 4. Fetch current usage ──
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

  // ── 5. Build system prompt + toolset ──
  const system = context === "dashboard"
    ? DASHBOARD_SYSTEM
    : context === "valuation"
      ? VALUATION_SYSTEM
      : APPRAISAL_SYSTEM(deal ? buildDealContext(deal) : "(no deal data provided)");

  const toolSet = context === "valuation"
    ? [suggestValuationTool]
    : [suggestCreateTool, suggestEditTool];

  // ── 5b. Valuation URL import — if the last user message contains a listing URL,
  // fetch the page server-side and splice a [Listing data] block into the prompt.
  // Gracefully degrades: if the fetch fails or is blocked by the site, the Copilot
  // falls back to URL-slug extraction per the VALUATION_SYSTEM instructions.
  let urlImported: { url: string; chars: number } | null = null;
  const outgoingMessages = messages.map(m => ({ role: m.role, content: m.content }));
  if (context === "valuation") {
    const lastUser = outgoingMessages[outgoingMessages.length - 1];
    const urlMatch = lastUser.content.match(/https?:\/\/[^\s<>"']+/);
    if (urlMatch) {
      try {
        const extracted = await extractPropertyFromUrl(urlMatch[0]);
        if (extracted) {
          urlImported = { url: urlMatch[0], chars: extracted.length };
          lastUser.content = `${lastUser.content}\n\n[Listing data fetched from URL — use this as ground truth for address, price, sqft, bedrooms]\n${extracted}`;
        }
      } catch (e) {
        console.warn("URL import failed:", e);
      }
    }
  }

  // ── 6. Call Claude ──
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
      messages: outgoingMessages,
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

  // ── 7. Increment usage (fire-and-log — don't fail the response if this errors) ──
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
    urlImported,
  });
}