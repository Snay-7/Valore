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
            content: `You are a senior UK development appraiser and lender with 20 years experience reviewing development appraisals. Review the following appraisal inputs and flag any assumptions that look unrealistic, inconsistent, or that a senior lender would challenge at credit committee.

Be specific and quantitative. Reference typical market ranges where relevant. Consider the asset type, location, and how the inputs relate to each other internally.

Deal Data:
${dealSummary}

Respond ONLY with a JSON object (no markdown, no backticks) with this exact structure:
{
  "overall": "green" | "amber" | "red",
  "summary": "One sentence overall assessment",
  "flags": [
    {
      "severity": "warning" | "error" | "info",
      "field": "The input field name",
      "message": "Specific issue and why it matters",
      "benchmark": "Typical market range or benchmark for context"
    }
  ]
}

Rules:
- "green" = all inputs look credible, 0-1 minor flags
- "amber" = some assumptions need review, 2-3 flags  
- "red" = significant issues that would concern a lender, 4+ flags or any critical errors
- Maximum 6 flags total, only the most important ones
- If an assumption looks fine, do NOT flag it
- Be constructive, not alarmist`,
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