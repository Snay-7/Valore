import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { dealSummary } = await req.json();

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
        messages: [
          {
            role: "user",
            content: `You are an expert property investment analyst writing a professional investment memorandum. Based on the following deal data, write concise, compelling content for an institutional investor brochure.

Deal Data:
${dealSummary}

Respond ONLY with a JSON object (no markdown, no backticks) with these exact keys:
{
  "executiveSummary": "2-3 sentences summarising the opportunity, location appeal, and headline returns",
  "dealStrengths": "3-4 specific strengths of this deal based on the numbers and asset type",
  "riskAssessment": "2-3 key risks to consider and how they might be mitigated",
  "marketComparables": "Brief commentary on market context, typical yields/returns for this asset type and location if known, and how this deal compares"
}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const text = data.content?.map((c: any) => c.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
