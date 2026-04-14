import { NextRequest, NextResponse } from "next/server";

const CURRENCY_NAMES: Record<string, string> = {
  GBP: "GBP (£)", USD: "USD ($)", EUR: "EUR (€)", AED: "AED (د.إ)",
  SGD: "SGD (S$)", AUD: "AUD (A$)", JPY: "JPY (¥)", CHF: "CHF (Fr)",
  CAD: "CAD (C$)", HKD: "HKD (HK$)", MXN: "MXN ($MX)", BRL: "BRL (R$)",
  COP: "COP (COP$)", CLP: "CLP (CLP$)", PEN: "PEN (S/)", ARS: "ARS (AR$)",
  INR: "INR (₹)", TRY: "TRY (₺)", ZAR: "ZAR (R)", THB: "THB (฿)",
  IDR: "IDR (Rp)", PHP: "PHP (₱)", KWD: "KWD (KD)", QAR: "QAR (QR)", BHD: "BHD (BD)",
};

const PROMPT = (location: string, currencyName: string, currency: string) =>
  `New-build residential apartment sale prices per square foot in ${location} in ${currencyName}. Use 2024-2025 market data.

Return ONLY this JSON, no other text:
{"low":0,"high":0,"avg":0,"notes":"one sentence on source or market context","currency":"${currency}"}`;

async function callClaude(model: string, location: string, currencyName: string, currency: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      messages: [{ role: "user", content: PROMPT(location, currencyName, currency) }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error (${model}): ${err}`);
  }

  const data = await response.json();
  const text = data.content
    ?.filter((c: any) => c.type === "text")
    ?.map((c: any) => c.text || "")
    ?.join("") || "";

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON in response");

  return JSON.parse(text.slice(first, last + 1));
}

export async function POST(req: NextRequest) {
  try {
    const { location, currency } = await req.json();

    if (!location) {
      return NextResponse.json({ error: "Location required" }, { status: 400 });
    }

    const currencyName = CURRENCY_NAMES[currency] || currency;

    // Try Sonnet first, fall back to Haiku
    try {
      const result = await callClaude("claude-sonnet-4-20250514", location, currencyName, currency);
      return NextResponse.json(result);
    } catch (sonnetErr) {
      console.warn("btspsf: Sonnet failed, falling back to Haiku:", sonnetErr);
      try {
        const result = await callClaude("claude-haiku-4-5-20251001", location, currencyName, currency);
        return NextResponse.json(result);
      } catch (haikusErr) {
        console.error("btspsf: Haiku fallback also failed:", haikusErr);
        throw haikusErr;
      }
    }

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
