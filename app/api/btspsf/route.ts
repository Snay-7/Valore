import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { location, currency } = await req.json();

    if (!location) {
      return NextResponse.json({ error: "Location required" }, { status: 400 });
    }

    const currencyName = ({ GBP:"GBP (£)", USD:"USD ($)", EUR:"EUR (€)", AED:"AED (د.إ)", SGD:"SGD (S$)", AUD:"AUD (A$)" } as any)[currency] || currency;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `New-build residential apartment sale prices per square foot in ${location} in ${currencyName}. Use 2024-2025 market data.

Return ONLY this JSON, no other text:
{"low":0,"high":0,"avg":0,"notes":"one sentence on source or market context","currency":"${currency}"}`,
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const text = data.content?.filter((c: any) => c.type === "text")?.map((c: any) => c.text || "")?.join("") || "";
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first === -1 || last === -1) return NextResponse.json({ error: "No JSON" }, { status: 500 });
    const parsed = JSON.parse(text.slice(first, last + 1));
    return NextResponse.json(parsed);

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
