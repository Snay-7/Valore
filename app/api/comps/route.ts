import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

export async function POST(req: NextRequest) {
  try {
    const { location, sqft, bedrooms, purchasePrice, salePrice, currency, assetType } = await req.json();

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    const currSym: Record<string, string> = {
      GBP: "£", USD: "$", EUR: "€", AED: "د.إ",
      SGD: "S$", AUD: "A$", JPY: "¥", CHF: "Fr", CAD: "C$", HKD: "HK$",
    };
    const sym = currSym[currency] || "£";

    // Build context-aware prompt depending on asset type
    const isResidential = !assetType || assetType === "Flip" || assetType === "BTR" || assetType === "BTS";
    const isCommercial = assetType === "Commercial" || assetType === "Industrial";
    const isMixed = assetType === "MixedUse";

    const systemPrompt = `You are a property market data analyst with access to web search.
Your job is to find REAL, CURRENT comparable property data for investment appraisals.
Use the web_search tool to search for actual recent transactions and listings — do NOT use generic placeholder addresses.
Search Rightmove, Zoopla, Land Registry (UK), or equivalent portals for the relevant country.
After searching, respond ONLY with a single valid JSON object. No markdown, no explanation, no text outside the JSON.`;

    let userPrompt: string;

    if (isCommercial || isMixed) {
      userPrompt = `Find real commercial property comparables near: ${location}
Asset type: ${assetType}
Currency: ${currency || "GBP"}
${purchasePrice ? `Purchase/investment: ${sym}${Number(purchasePrice).toLocaleString()}` : ""}
${sqft ? `Size: ${sqft} sqft` : ""}

Search for:
1. Recent commercial sales/lettings in ${location}
2. Current asking rents and yields for similar assets

Return ONLY this JSON:
{
  "comparables": [
    {"address": "real address", "price": 1200000, "sqft": 3500, "pricePsf": 343, "type": "Retail/Office/Industrial", "sold": "2025-Q1", "notes": "Fully let at completion"}
  ],
  "rentalComps": [
    {"address": "real address", "rentPcm": 8500, "sqft": 3500, "rentPsf": 29, "type": "Retail", "notes": "New 5yr lease"}
  ],
  "marketContext": "2-3 sentences on local commercial market, yields, demand",
  "avgPricePsf": 340,
  "avgRentPsf": 28,
  "typicalYield": 6.5,
  "yieldRange": {"low": 5.5, "high": 7.5},
  "dataSource": "Rightmove Commercial / CoStar / EGi",
  "dataDate": "April 2026"
}`;
    } else {
      userPrompt = `Find real residential property comparables near: ${location}
${sqft ? `Property size: ~${sqft} sqft` : ""}
${bedrooms ? `Bedrooms: ${bedrooms}` : ""}
${purchasePrice ? `Purchase price: ${sym}${Number(purchasePrice).toLocaleString()}` : ""}
${salePrice ? `Target sale: ${sym}${Number(salePrice).toLocaleString()}` : ""}
Currency: ${currency || "GBP"}

Search Rightmove sold prices and Zoopla rental listings for ${location}. Find properties sold in the last 12 months.

Return ONLY this JSON:
{
  "comparables": [
    {"address": "real street address, area", "price": 450000, "sqft": 850, "pricePsf": 529, "bedrooms": 3, "type": "Terraced", "sold": "2025-Q4", "notes": "Extended kitchen, refurbished"}
  ],
  "rentalComps": [
    {"address": "real street address, area", "rentPcm": 1800, "bedrooms": 3, "type": "Terraced", "notes": "Newly let, furnished"}
  ],
  "marketContext": "2-3 sentences on local market conditions, price trends, buyer demand",
  "avgPricePsf": 520,
  "priceRange": {"low": 380000, "high": 580000},
  "refurbUplift": {"low": 25000, "high": 55000, "notes": "Typical uplift from full refurb in this area"},
  "avgRentPcm": 1750,
  "grossYieldRange": {"low": 4.2, "high": 5.8},
  "dataSource": "Rightmove / Zoopla / Land Registry",
  "dataDate": "April 2026"
}
Include 4-5 sold comps and 3-4 rental comps. Use real addresses — not generic placeholders.`;
    }

    // Call Anthropic with web search enabled
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      system: systemPrompt,
      // @ts-ignore — web_search is a beta tool, type may not be in SDK yet
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: userPrompt }],
    });

    // Extract all text blocks from the response (tool_use blocks are ignored)
    const fullText = response.content
      .map((block: any) => (block.type === "text" ? block.text : ""))
      .filter(Boolean)
      .join("\n");

    // Strip any accidental markdown fences and parse JSON
    const clean = fullText.replace(/```json|```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        { error: "No property data found — try a more specific location (e.g. 'Hackney, London')" },
        { status: 422 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);

  } catch (err: any) {
    console.error("Comps API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch comparables" },
      { status: 500 }
    );
  }
}
