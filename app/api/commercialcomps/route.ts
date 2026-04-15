import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { location, assetType, currency, areaUnit } = await req.json();

    if (!location) {
      return NextResponse.json({ error: "Location required" }, { status: 400 });
    }

    const currSym = currency === "EUR" ? "€" : currency === "USD" ? "$" : "£";
    const isIndustrial = assetType === "Industrial";

    const systemPrompt = `You are a commercial real estate market analyst. 
Return ONLY valid JSON — no markdown, no explanation, no backticks.
Base your analysis on real market data. Be specific to the location provided.`;

    const userPrompt = `Provide current ${isIndustrial ? "industrial" : "commercial office/retail"} property market data for: ${location}

Return exactly this JSON structure:
{
  "rentPSF": {
    "prime": number,
    "secondary": number,
    "unit": "${areaUnit === "sqm" ? "sqm" : "sqft"}",
    "currency": "${currSym}",
    "trend": "rising" | "stable" | "softening",
    "note": "brief market context (max 15 words)"
  },
  "yields": {
    "primeNIY": number,
    "secondaryNIY": number,
    "trend": "compressing" | "stable" | "expanding",
    "note": "brief yield context (max 15 words)"
  },
  "wault": {
    "typical": number,
    "prime": number,
    "note": "brief WAULT context (max 12 words)"
  },
  "voidRate": {
    "prime": number,
    "secondary": number,
    "unit": "percent"
  },
  "comparables": [
    {
      "address": "specific address or area",
      "type": "${isIndustrial ? "warehouse/logistics/light industrial" : "office/retail/mixed"}",
      "size": "sqft figure",
      "rentPSF": number,
      "date": "Q1/Q2/Q3/Q4 + year",
      "tenant": "tenant name or type",
      "leaseLength": "years"
    }
  ],
  "investmentSales": [
    {
      "address": "specific address or area",
      "price": "price figure with currency",
      "niy": number,
      "date": "Q1/Q2/Q3/Q4 + year",
      "vendor": "vendor type",
      "purchaser": "purchaser type"
    }
  ],
  "aiFlag": "any significant market flag or risk in 15 words or less",
  "confidence": "high" | "medium" | "low",
  "dataDate": "approximate data currency e.g. Q1 2026"
}

Provide 3 comparable lettings and 2 investment sales.
Use real, specific addresses and real market figures where possible.
All rent figures in ${currSym} per ${areaUnit === "sqm" ? "sqm" : "sqft"} per year.
All yield figures as decimal (e.g. 0.055 for 5.5%).`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const aiData = await response.json();
    const raw = aiData.content[0]?.text || "";

    let parsed;
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response", raw }, { status: 500 });
    }

    return NextResponse.json({ success: true, comps: parsed });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
