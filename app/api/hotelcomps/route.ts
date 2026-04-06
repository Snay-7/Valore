import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { location, starRating, currency, currentADR } = await req.json();

    if (!location) {
      return NextResponse.json({ error: "Location required" }, { status: 400 });
    }

    const currencyName = ({ GBP: "GBP (£)", USD: "USD ($)", EUR: "EUR (€)", AED: "AED (د.إ)" } as any)[currency] || currency;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [
          {
            role: "user",
            content: `You are a hotel investment analyst. Using your knowledge of hotel markets, provide ADR benchmarks for ${location}.

Return ONLY this JSON, no other text:
{"location_identified":"${location}","currency":"${currency}","data_year":"2024","benchmarks":{"3star":{"low":0,"high":0,"avg":0,"notes":""},"4star":{"low":0,"high":0,"avg":0,"notes":""},"5star":{"low":0,"high":0,"avg":0,"notes":""}},"market_context":"2 sentences max","assessment":"green","assessment_note":"one sentence comparing ADR of ${currentADR} ${currencyName} for ${starRating}-star","comparable_hotels":[{"name":"real hotel name","stars":${starRating},"adr_approx":0,"notes":""}]}

Rules: all values in ${currencyName}, assessment = green/amber/red only, max 3 real hotels.`,
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

    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      return NextResponse.json({ error: "No JSON in response" }, { status: 500 });
    }

    const parsed = JSON.parse(text.slice(firstBrace, lastBrace + 1));
    return NextResponse.json(parsed);

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
