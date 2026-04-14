import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { location, starRating, currency, currentADR } = await req.json();

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    const currSym: Record<string, string> = {
      GBP: "£", USD: "$", EUR: "€", AED: "د.إ",
      SGD: "S$", AUD: "A$", JPY: "¥", CHF: "Fr", CAD: "C$", HKD: "HK$",
    };
    const sym = currSym[currency || "GBP"] || "£";
    const starLabel = starRating >= 5 ? "5-star luxury" : starRating >= 4 ? "4-star upscale" : "3-star midscale";

    const systemPrompt = `You are a hotel investment analyst with deep knowledge of global hospitality markets.
You have access to web search. Use it to find ANNUAL AVERAGE ADR data — not peak season rates, not current booking prices.
Annual Average ADR = total rooms revenue for the full year divided by total occupied room nights for that year.
This is the metric used in hotel investment appraisals, STR reports, and institutional underwriting.
Sources to search: STR Global reports, HVS, JLL Hotels, CBRE Hotels, Cushman & Wakefield hospitality, local hotel association data, or reputable hospitality news.
Do NOT use Booking.com or Expedia current prices — those are point-in-time rack rates, not annual averages.
After searching, respond ONLY with valid JSON. No markdown, no explanation, no text outside the JSON.`;

    const userPrompt = `Find ANNUAL AVERAGE ADR benchmarks for hotels in: ${location}
Star category being appraised: ${starLabel} (${starRating} star)
Current ADR being modelled: ${sym}${currentADR}
Currency: ${currency || "GBP"}

Search for:
1. Annual average ADR for 3-star, 4-star and 5-star hotels in ${location} — use STR, HVS, JLL, or local hotel association data
2. Full-year occupancy rates (not peak season) for this market
3. RevPAR benchmarks if available
4. 3-5 specific comparable hotels with their reported annual ADR (from industry reports, not booking sites)
5. Key demand drivers and seasonality factors affecting annual averages in this market

IMPORTANT: Explicitly state whether data is annual average, trailing 12 months, or a specific year. Flag if you can only find seasonal/peak data.

Return ONLY this JSON:
{
  "benchmarks": {
    "3star": { "low": 0, "high": 0, "avg": 0, "occupancy": 0 },
    "4star": { "low": 0, "high": 0, "avg": 0, "occupancy": 0 },
    "5star": { "low": 0, "high": 0, "avg": 0, "occupancy": 0 }
  },
  "comparable_hotels": [
    { "name": "Hotel Name", "stars": 4, "adr": 0, "occupancy": 0, "revpar": 0, "notes": "Source and period" }
  ],
  "data_period": "Annual average 2024 / T12M to Q3 2024 / etc",
  "data_quality": "annual_average | trailing_12m | seasonal_estimate | limited_data",
  "data_quality_note": "Explain what data was found and any caveats",
  "assessment": "above_market | at_market | below_market | insufficient_data",
  "assessment_note": "1-2 sentences comparing ${sym}${currentADR} to the market annual average for ${starLabel} in ${location}",
  "seasonality_note": "Key seasonality factors — peak months, shoulder season, typical rate swing %",
  "market_context": "2-3 sentences on the ${location} hotel market — demand drivers, supply pipeline, trading outlook",
  "location_identified": "${location}"
}`;

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
        max_tokens: 3000,
        system: systemPrompt,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any).error?.message || `API error ${response.status}`);
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
        { error: "Could not find ADR data for this location — try a more specific city name" },
        { status: 422 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);

  } catch (err: any) {
    console.error("Hotel comps API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch hotel comparables" },
      { status: 500 }
    );
  }
}
