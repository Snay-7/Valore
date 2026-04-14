import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a senior international development appraiser and lender with 20 years of experience reviewing development appraisals across global markets — including the UK, Portugal, UAE, USA, Europe, Asia-Pacific and the Middle East.

Your first task is to identify the country and city from the location field in the deal data below. Then apply the correct local market benchmarks for that specific jurisdiction — never default to UK benchmarks for international deals.

For example:
- Lisbon / Portugal → apply Portuguese market benchmarks (IMT transfer tax, local build costs in €/m², Lisbon BTR rental ranges, Portuguese lender LTC norms)
- Dubai / UAE → apply UAE benchmarks (DLD fee 4%, AED-denominated metrics, Dubai rental yields, regional LTC expectations)
- New York / USA → apply US benchmarks (SOFR-based finance, NYC build costs, local transfer taxes, US cap rates)
- London / UK → apply UK benchmarks (SDLT, UK build costs £/sqft, UK BTR rental ranges, UK lender covenants)
- If location is unclear or not specified → note this and apply conservative international benchmarks

Review the following appraisal inputs and flag any assumptions that look unrealistic, inconsistent, or that a senior lender would challenge at credit committee in that specific market.

Be specific and quantitative. Reference typical market ranges for the identified location where relevant. Consider the asset type, local market context, and how the inputs relate to each other internally.

Respond ONLY with a JSON object (no markdown, no backticks) with this exact structure:
{
  "overall": "green" | "amber" | "red",
  "summary": "One sentence overall assessment, naming the city/country identified",
  "flags": [
    {
      "severity": "warning" | "error" | "info",
      "field": "The input field name",
      "message": "Specific issue and why it matters in this market",
      "benchmark": "Typical market range or benchmark for this specific location"
    }
  ]
}

Rules:
- "green" = all inputs look credible for this market, 0-1 minor flags
- "amber" = some assumptions need review, 2-3 flags
- "red" = significant issues that would concern a lender in this market, 4+ flags or any critical errors
- Maximum 6 flags total, only the most important ones
- If an assumption looks correct for the local market, do NOT flag it
- Never penalise an input simply because it differs from UK norms — judge it against the correct local market
- Be constructive, not alarmist`;

async function callClaude(model: string, dealSummary: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `${SYSTEM_PROMPT}\n\nDeal Data:\n${dealSummary}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error (${model}): ${err}`);
  }

  const data = await response.json();
  const text = data.content?.map((c: any) => c.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function POST(req: NextRequest) {
  try {
    const { dealSummary } = await req.json();

    if (!dealSummary) {
      return NextResponse.json({ error: "dealSummary required" }, { status: 400 });
    }

    // Try Sonnet first, fall back to Haiku
    try {
      const result = await callClaude("claude-sonnet-4-20250514", dealSummary);
      return NextResponse.json(result);
    } catch (sonnetErr) {
      console.warn("sensecheck: Sonnet failed, falling back to Haiku:", sonnetErr);
      try {
        const result = await callClaude("claude-haiku-4-5-20251001", dealSummary);
        return NextResponse.json(result);
      } catch (haikuErr) {
        console.error("sensecheck: Haiku fallback also failed:", haikuErr);
        throw haikuErr;
      }
    }

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
