import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url, assetType, currency } = await req.json();

    const currencySymbols: Record<string, string> = {
      GBP: "£", USD: "$", EUR: "€", AED: "د.إ", SGD: "S$", AUD: "A$"
    };
    const sym = currencySymbols[currency] || "£";

    const prompt = assetType === "Hotel"
      ? `You are a specialist hotel property data analyst. A user has provided this URL from a property listing site (Rightmove, Zoopla, Christie & Co, Savills Hotels, CBRE Hotels, JLL Hotels, LoopNet, CoStar, or similar):

URL: ${url}

Based on the URL structure, domain, path, and any identifiable patterns (property IDs, location slugs, price hints in URL), infer as much property data as possible for a hotel appraisal. Use your training knowledge of hotel property listings and typical market data.

The currency is ${currency} (${sym}).

Respond ONLY with a JSON object (no markdown, no backticks):
{
  "name": "project name / hotel name if inferrable, else descriptive name",
  "location": "city, area or address inferred from URL",
  "address": "full address if determinable",
  "purchasePrice": number or null,
  "rooms": number or null,
  "starRating": number (3, 4, or 5) or null,
  "gfa": number or null (gross floor area in sqm),
  "brand": "brand/operator name if identifiable" or null,
  "currency": "${currency}",
  "notes": "brief note on what was inferred and confidence level",
  "confidence": "high" | "medium" | "low"
}`
      : `You are a specialist residential property data analyst. A user has provided this URL from a property listing site (Rightmove, Zoopla, OnTheMarket, Zillow, Realtor.com, Domain.com.au, PropertyFinder UAE, or similar):

URL: ${url}

Based on the URL structure, domain, path, and any identifiable patterns (property IDs, location slugs, price hints, bedroom counts in URL), infer as much property data as possible for a property flip appraisal. Use your training knowledge of residential property listings and typical market data.

The currency is ${currency} (${sym}).

Respond ONLY with a JSON object (no markdown, no backticks):
{
  "name": "descriptive project name e.g. '3-bed Hackney Terrace Flip'",
  "location": "city, area or postcode inferred from URL",
  "address": "full address if determinable from URL",
  "purchasePrice": number or null,
  "propertySqft": number or null (property size in sqft),
  "bedrooms": number or null,
  "propertyType": "terraced" | "semi-detached" | "detached" | "flat" | "maisonette" | null,
  "currency": "${currency}",
  "notes": "brief note on what was inferred and confidence level",
  "confidence": "high" | "medium" | "low"
}`;

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
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to import from URL" }, { status: 500 });
  }
}
