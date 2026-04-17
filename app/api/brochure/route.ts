import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      dealSummary,
      assetType,
      hotelComps,
      btrBtsComps,
      flipComps,
      commercialComps,
    } = await req.json();

    // ── Build comps context block (only the one relevant to this asset) ──
    let compsBlock = "";

    if (assetType === "Hotel" && hotelComps) {
      const benchmarks = hotelComps.benchmarks || {};
      const bmLines = Object.keys(benchmarks)
        .map((k) => {
          const b = benchmarks[k];
          if (!b) return "";
          return `  - ${k}: ADR avg ${b.avg || "—"}, range ${b.low || "—"}–${b.high || "—"}`;
        })
        .filter(Boolean)
        .join("\n");
      const hotelsList = (hotelComps.comparable_hotels || [])
        .slice(0, 8)
        .map((h: any) => `  - ${h.name || "Hotel"} (${h.stars || "?"}★): ADR ${h.adr || "—"}, ${h.rooms || "?"} rooms`)
        .join("\n");
      compsBlock = `
LIVE MARKET COMPARABLES — USE THESE SPECIFIC FIGURES:
Location identified: ${hotelComps.location_identified || "—"}
Star-rating benchmarks (ADR):
${bmLines}
${hotelComps.market_context ? `Market context: ${hotelComps.market_context}` : ""}
${hotelComps.assessment_note ? `Position vs market: ${hotelComps.assessment_note}` : ""}
${hotelsList ? `Comparable hotels:\n${hotelsList}` : ""}
`.trim();
    } else if ((assetType === "BTR" || assetType === "BTS") && btrBtsComps) {
      const sales = (btrBtsComps.comparables || [])
        .slice(0, 6)
        .map((c: any) => `  - ${c.address || "Comp"}: ${c.price || "—"} (${c.sqft || "—"} sqft, ${c.pricePsf || "—"} psf)`)
        .join("\n");
      const rentals = (btrBtsComps.rentalComps || [])
        .slice(0, 6)
        .map((c: any) => `  - ${c.address || "Comp"}: ${c.rentPcm || "—"}/mo (${c.bedrooms || "?"} bed)`)
        .join("\n");
      compsBlock = `
LIVE MARKET COMPARABLES — USE THESE SPECIFIC FIGURES:
Avg Price PSF: ${btrBtsComps.avgPricePsf || "—"}
Avg Rent PCM: ${btrBtsComps.avgRentPcm || "—"}
Gross Yield Range: ${btrBtsComps.grossYieldRange || "—"}
Data Source: ${btrBtsComps.dataSource || "AI Research"}
${btrBtsComps.marketContext ? `Market context: ${btrBtsComps.marketContext}` : ""}
${sales ? `Sales comparables:\n${sales}` : ""}
${rentals ? `Rental comparables:\n${rentals}` : ""}
`.trim();
    } else if (assetType === "Flip" && flipComps) {
      const sold = (flipComps.comparables || [])
        .slice(0, 6)
        .map((c: any) => `  - ${c.address || "Comp"}: ${c.soldPrice || c.price || "—"} (${c.sqft || "—"} sqft)`)
        .join("\n");
      compsBlock = `
LIVE MARKET COMPARABLES — USE THESE SPECIFIC FIGURES:
Avg Price PSF: ${flipComps.avgPricePsf || "—"}
Avg Rent PCM: ${flipComps.avgRentPcm || "—"}
Gross Yield Range: ${flipComps.grossYieldRange || "—"}
${flipComps.marketContext ? `Market context: ${flipComps.marketContext}` : ""}
${sold ? `Sold comparables:\n${sold}` : ""}
`.trim();
    } else if ((assetType === "Commercial" || assetType === "Industrial") && commercialComps) {
      const lettings = (commercialComps.comparables || [])
        .slice(0, 6)
        .map(
          (c: any) =>
            `  - ${c.address || "Comp"}: ${c.rentPSF || "—"} psf (${c.type || "—"}, ${c.size || "—"}, ${c.date || "—"})`
        )
        .join("\n");
      const sales = (commercialComps.investmentSales || [])
        .slice(0, 6)
        .map(
          (s: any) =>
            `  - ${s.address || "Sale"}: ${s.price || "—"} @ ${s.niy || "—"} NIY (${s.date || "—"})`
        )
        .join("\n");
      compsBlock = `
LIVE MARKET COMPARABLES — USE THESE SPECIFIC FIGURES:
Location: ${commercialComps.location || "—"} | Data date: ${commercialComps.dataDate || "—"} | Confidence: ${commercialComps.confidence || "—"}
Prime rent PSF/yr: ${commercialComps.rentPSF?.prime || "—"} (${commercialComps.rentPSF?.trend || "—"})
Secondary rent PSF/yr: ${commercialComps.rentPSF?.secondary || "—"}
Prime NIY: ${commercialComps.yields?.primeNIY ? (commercialComps.yields.primeNIY * 100).toFixed(2) + "%" : "—"} (${commercialComps.yields?.trend || "—"})
Secondary NIY: ${commercialComps.yields?.secondaryNIY ? (commercialComps.yields.secondaryNIY * 100).toFixed(2) + "%" : "—"}
${commercialComps.wault ? `Typical WAULT: ${commercialComps.wault.typical} yrs` : ""}
${commercialComps.voidRate?.prime ? `Prime void rate: ${commercialComps.voidRate.prime}%` : ""}
${commercialComps.aiFlag ? `Market flag: ${commercialComps.aiFlag}` : ""}
${lettings ? `Comparable lettings:\n${lettings}` : ""}
${sales ? `Investment sales:\n${sales}` : ""}
`.trim();
    }

    const prompt = `You are an expert property investment analyst writing a professional investment memorandum. Based on the following deal data, write concise, compelling content for an institutional investor brochure.

Deal Data:
${dealSummary}

${compsBlock ? compsBlock + "\n" : ""}
IMPORTANT INSTRUCTIONS:
- If LIVE MARKET COMPARABLES are provided above, you MUST reference these specific figures in the marketComparables section. Cite the actual ADR / rent PSF / NIY / yield / price numbers given. Name specific comparable properties when available.
- Do NOT write generic market commentary that ignores the real data.
- Compare this deal's metrics directly against the comps (e.g. "Prime Mayfair NIY benchmark of 4.25% vs this deal's exit NIY of 5.50% — a 125bps cushion").
- If no comps are provided, give general market context appropriate to the asset type and location.

Respond ONLY with a JSON object (no markdown, no backticks) with these exact keys:
{
  "executiveSummary": "2-3 sentences summarising the opportunity, location appeal, and headline returns",
  "dealStrengths": "3-4 specific strengths of this deal based on the numbers and asset type",
  "riskAssessment": "2-3 key risks to consider and how they might be mitigated",
  "marketComparables": "Brief commentary on market context — reference the LIVE COMPARABLES above with specific numbers if provided, and compare how this deal stacks up"
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
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
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
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
