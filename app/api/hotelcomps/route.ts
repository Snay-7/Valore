import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { location, starRating, currency, currentADR } = await req.json();

    if (!location) {
      return NextResponse.json({ error: "Location required" }, { status: 400 });
    }

    const currencyName = { GBP: "GBP (£)", USD: "USD ($)", EUR: "EUR (€)", AED: "AED (د.إ)" }[currency] || currency;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [
          {
            role: "user",
            content: `You are a hotel investment analyst. Search for current Average Daily Rate (ADR) benchmarks for hotels in ${location}.

Find ADR data for 3-star, 4-star, and 5-star hotels in ${location}. Use recent market data (2024-2025).

The developer is modelling a ${starRating}-star hotel with a current ADR of ${currencyName} ${currentADR}.

Return ONLY a JSON object with no markdown or backticks:
{
  "location_identified": "City, Country",
  "currency": "${currency}",
  "data_year": "2024 or 2025",
  "benchmarks": {
    "3star": { "low": number, "high": number, "avg": number, "notes": "brief context" },
    "4star": { "low": number, "high": number, "avg": number, "notes": "brief context" },
    "5star": { "low": number, "high": number, "avg": number, "notes": "brief context" }
  },
  "market_context": "2-3 sentence summary of hotel market conditions in this location",
  "assessment": "green | amber | red",
  "assessment_note": "One sentence on how the current ADR of ${currentADR} compares to market for ${starRating}-star",
  "comparable_hotels": [
    { "name": "Hotel name", "stars": 4, "adr_approx": 220, "notes": "brief note" }
  ]
}

All monetary values must be in ${currencyName}. Maximum 3 comparable hotels. Only real, named hotels.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const text = data.content
      ?.filter((c: any) => c.type === "text")
      ?.map((c: any) => c.text || "")
      ?.join("") || "";

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
