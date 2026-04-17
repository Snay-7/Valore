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
      mixedUseResiComps,
      mixedUseComComps,
    } = await req.json();

    // ── Build comps context block (only for this asset type) ──
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
        .map(
          (h: any) =>
            `  - ${h.name || "Hotel"} (${h.stars || "?"}★): ADR ${h.adr || "—"}, ${h.rooms || "?"} rooms`
        )
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
        .map(
          (c: any) =>
            `  - ${c.address || "Comp"}: ${c.price || "—"} (${c.sqft || "—"} sqft, ${c.pricePsf || "—"} psf)`
        )
        .join("\n");
      const rentals = (btrBtsComps.rentalComps || [])
        .slice(0, 6)
        .map(
          (c: any) =>
            `  - ${c.address || "Comp"}: ${c.rentPcm || "—"}/mo (${c.bedrooms || "?"} bed)`
        )
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
        .map(
          (c: any) =>
            `  - ${c.address || "Comp"}: ${c.soldPrice || c.price || "—"} (${c.sqft || "—"} sqft)`
        )
        .join("\n");
      compsBlock = `
LIVE MARKET COMPARABLES — USE THESE SPECIFIC FIGURES:
Avg Price PSF: ${flipComps.avgPricePsf || "—"}
Avg Rent PCM: ${flipComps.avgRentPcm || "—"}
Gross Yield Range: ${flipComps.grossYieldRange || "—"}
${flipComps.marketContext ? `Market context: ${flipComps.marketContext}` : ""}
${sold ? `Sold comparables:\n${sold}` : ""}
`.trim();
    } else if (
      (assetType === "Commercial" || assetType === "Industrial") &&
      commercialComps
    ) {
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
    } else if (
      assetType === "MixedUse" &&
      (mixedUseResiComps || mixedUseComComps)
    ) {
      // ── RESIDENTIAL SIDE (BTR + BTS merged) ──
      let resiBlock = "";
      if (mixedUseResiComps) {
        const rental = mixedUseResiComps.rental || {};
        const sales = mixedUseResiComps.sales || {};
        const rentalComps = (rental.rentalComps || [])
          .slice(0, 5)
          .map(
            (c: any) =>
              `  - ${c.address || "Comp"}: ${c.rentPcm || "—"}/mo (${c.bedrooms || c.beds || "?"} bed, ${c.size || "—"} sqft)`
          )
          .join("\n");
        const salesComps = (sales.comparables || [])
          .slice(0, 5)
          .map(
            (c: any) =>
              `  - ${c.address || "Comp"}: ${c.price || "—"} (${c.pricePsf || "—"} psf, ${c.size || "—"} sqft)`
          )
          .join("\n");
        resiBlock = `
── RESIDENTIAL COMPS ──
RENTAL MARKET (BTR):
- Avg rent PCM: ${rental.avgRentPcm || "—"}
- Gross yield range: ${rental.grossYieldRange || "—"}
${rental.marketContext ? `- Context: ${rental.marketContext}` : ""}
${rentalComps ? `- Comparables:\n${rentalComps}` : ""}

SALES MARKET (BTS / new-build):
- Avg price PSF: ${sales.avgPricePsf || "—"}
- Price range: ${sales.priceRange ? `${sales.priceRange.low}–${sales.priceRange.high}` : "—"}
${sales.marketContext ? `- Context: ${sales.marketContext}` : ""}
${salesComps ? `- Comparables:\n${salesComps}` : ""}
`.trim();
      }
      // ── COMMERCIAL SIDE ──
      let comBlock = "";
      if (mixedUseComComps) {
        const lettings = (mixedUseComComps.comparables || [])
          .slice(0, 5)
          .map(
            (c: any) =>
              `  - ${c.address || "Comp"}: ${c.rentPSF || "—"} psf (${c.type || "—"}, ${c.size || "—"})`
          )
          .join("\n");
        const sales = (mixedUseComComps.investmentSales || [])
          .slice(0, 5)
          .map(
            (s: any) =>
              `  - ${s.address || "Sale"}: ${s.price || "—"} @ ${s.niy || "—"} NIY`
          )
          .join("\n");
        comBlock = `
── COMMERCIAL COMPS ──
Prime rent PSF/yr: ${mixedUseComComps.rentPSF?.prime || "—"} (${mixedUseComComps.rentPSF?.trend || "—"})
Secondary rent PSF/yr: ${mixedUseComComps.rentPSF?.secondary || "—"}
Prime NIY: ${mixedUseComComps.yields?.primeNIY ? (mixedUseComComps.yields.primeNIY * 100).toFixed(2) + "%" : "—"}
Secondary NIY: ${mixedUseComComps.yields?.secondaryNIY ? (mixedUseComComps.yields.secondaryNIY * 100).toFixed(2) + "%" : "—"}
${mixedUseComComps.wault ? `Typical WAULT: ${mixedUseComComps.wault.typical} yrs` : ""}
${mixedUseComComps.aiFlag ? `Market flag: ${mixedUseComComps.aiFlag}` : ""}
${lettings ? `Comparable lettings:\n${lettings}` : ""}
${sales ? `Investment sales:\n${sales}` : ""}
`.trim();
      }
      compsBlock = `
LIVE MARKET COMPARABLES (MIXED USE — TWO SEPARATE MARKETS) — USE THESE SPECIFIC FIGURES:

${resiBlock}

${comBlock}
`.trim();
    }

    const prompt = `You are an expert property investment analyst writing a professional investment memorandum. Based on the following deal data, write concise, compelling content for an institutional investor brochure.

Deal Data:
${dealSummary}

${compsBlock ? compsBlock + "\n" : ""}
IMPORTANT INSTRUCTIONS:
- If LIVE MARKET COMPARABLES are provided above, you MUST reference these specific figures in the marketComparables section. Cite the actual ADR / rent PSF / NIY / yield / price numbers given. Name specific comparable properties when available.
- For MIXED USE deals, treat the residential and commercial markets as two DISTINCT benchmarks — discuss both sides separately and compare each component of the scheme against its relevant market (resi vs BTR/BTS, commercial zones vs prime/secondary NIY and rent PSF).
- Do NOT write generic market commentary that ignores the real data.
- Compare this deal's metrics directly against the comps (e.g. "Prime Mayfair NIY benchmark of 4.25% vs this deal's exit NIY of 5.50% — a 125bps cushion").
- If no comps are provided, give general market context appropriate to the asset type and location.

ZONE ORDERING (Mixed Use only):
- When mentioning scheme components in the executive summary, ALWAYS lead with the largest component by GDV (typically residential units), then commercial, then ancillary (parking, gym).
- Do NOT lead with parking spaces or minor commercial — residential unit count is the headline for BTR schemes.
- Example: "251 residential units with ground-floor commercial and parking" — not "220 parking spaces alongside residential".

BENCHMARK HONESTY:
- Use institutional benchmarks when describing returns — do not oversell.
- PoC: <8% weak, 8-15% marginal, 15-25% solid, 25%+ strong
- Unlevered IRR: <8% weak, 8-12% acceptable, 12-15% solid, 15%+ strong
- Levered IRR: <10% weak, 10-15% acceptable, 15-20% solid, 20%+ strong
- DSCR: <1.1× tight, 1.1-1.25× acceptable, 1.25-1.5× comfortable, 1.5×+ strong
- Debt Yield: <6% weak, 6-8% acceptable, 8-10% comfortable, 10%+ strong
- If IRR is below 8%, describe returns as "below institutional hurdle" — do not call 6.4% "strong" or "healthy".
- If Levered IRR is negative OR below Unlevered IRR, flag this as a financing structure issue in risk factors — it means the cost of debt exceeds asset yield on cost.

FLIP PROFIT FRAMING (Flip deals only):
- Flip deals may show TWO profit numbers: "Profit (Margin)" = accounting profit (sale - all costs including finance), and "Profit (to Equity)" = cashflow profit after financing (what the investor actually receives).
- ALWAYS reference both if both are present. The gap between them shows the cost of leverage.
- Never invent gross-margin percentages like "(Sale - Purchase) / Purchase". Use the actual Profit (Margin) / Total Cost = Return on Cost, and Profit (to Equity) / Equity = ROE.
- If MOIC is shown alongside, note that MOIC ties to Profit (to Equity), not Profit (Margin).

Respond ONLY with a JSON object (no markdown, no backticks) with these exact keys:
{
  "executiveSummary": "2-3 sentences summarising the opportunity, location appeal, and headline returns. LEAD WITH THE LARGEST ASSET COMPONENT, use benchmark-honest language (don't oversell marginal returns).",
  "dealStrengths": "3-4 specific strengths of this deal based on the numbers and asset type. Only call out metrics that genuinely meet institutional benchmarks.",
  "riskAssessment": "2-3 key risks to consider. If Levered IRR < Unlevered IRR, mention that financing costs exceed asset yield. If IRR is below hurdle, flag it. Be honest about what would make this deal hard to place with institutional capital.",
  "marketComparables": "Brief commentary on market context — reference the LIVE COMPARABLES above with specific numbers if provided, and compare how this deal stacks up. For Mixed Use, address residential AND commercial markets separately."
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
