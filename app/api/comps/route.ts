import { NextRequest, NextResponse } from "next/server";

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
    const isCommercial = assetType === "Commercial" || assetType === "Industrial";

    const systemPrompt = `You are a property market data analyst with access to web search.
Find REAL, CURRENT comparable property data for investment appraisals.
Use the web_search tool to search for actual recent transactions and listings.
Search Rightmove, Zoopla, Land Registry (UK), or equivalent portals for the relevant country.
After searching, respond ONLY with a single valid JSON object. No markdown, no explanation, no text outside the JSON.`;

    const userPrompt = isCommercial
      ? `Find real commercial property comparables near: ${location}
Asset type: ${assetType}, Currency: ${currency || "GBP"}
${purchasePrice ? `Investment: ${sym}${Number(purchasePrice).toLocaleString()}` : ""}
${sqft ? `Size: ${sqft} sqft` : ""}
Return ONLY this JSON (real addresses, no placeholders):
{"comparables":[{"address":"real address","price":1200000,"sqft":3500,"pricePsf":343,"type":"Retail","sold":"2025-Q1","notes":"Fully let"}],"rentalComps":[{"address":"real address","rentPcm":8500,"sqft":3500,"rentPsf":29,"type":"Retail","notes":"New 5yr lease"}],"marketContext":"2-3 sentences on local commercial market","avgPricePsf":340,"avgRentPsf":28,"typicalYield":6.5,"yieldRange":{"low":5.5,"high":7.5},"dataSource":"Rightmove Commercial / CoStar","dataDate":"April 2026"}`
      : `Find real residential property comparables near: ${location}
${sqft ? `Size: ~${sqft} sqft` : ""}${bedrooms ? `, ${bedrooms} bedrooms` : ""}
${purchasePrice ? `Purchase: ${sym}${Number(purchasePrice).toLocaleString()}` : ""}
${salePrice ? `Target sale: ${sym}${Number(salePrice).toLocaleString()}` : ""}
Currency: ${currency || "GBP"}
Search Rightmove sold prices and Zoopla rentals. Find properties sold in last 12 months.
Return ONLY this JSON (real addresses, no placeholders):
{"comparables":[{"address":"real street, area","price":450000,"sqft":850,"pricePsf":529,"bedrooms":3,"type":"Terraced","sold":"2025-Q4","notes":"Refurbished kitchen"}],"rentalComps":[{"address":"real street, area","rentPcm":1800,"bedrooms":3,"type":"Terraced","notes":"Newly let"}],"marketContext":"2-3 sentences on local market and price trends","avgPricePsf":520,"priceRange":{"low":380000,"high":580000},"refurbUplift":{"low":25000,"high":55000,"notes":"Typical refurb uplift"},"avgRentPcm":1750,"grossYieldRange":{"low":4.2,"high":5.8},"dataSource":"Rightmove / Zoopla / Land Registry","dataDate":"April 2026"}
Include 4-5 sold comps and 3-4 rental comps.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2500,
        system: systemPrompt,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any).error?.message || `Anthropic API error ${response.status}`);
    }

    const result = await response.json();

    const fullText = (result.content || [])
      .map((b: any) => (b.type === "text" ? b.text : ""))
      .filter(Boolean)
      .join("\n");

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
