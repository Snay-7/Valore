/* ═══════════════════════════════════════════════════════════════════
   VALORA — Valuation Report PDF generator
   Drop at: lib/valuation-brochure.ts
   Imports jsPDF client-side. Call from /valuation page on "Generate PDF".
   ═══════════════════════════════════════════════════════════════════ */
import { jsPDF } from "jspdf";

export type Valuation = {
  address?: string;
  jurisdiction?: string;
  currency?: string;
  propertyType?: string;
  bedrooms?: number;
  sqft?: number;
  condition?: string;
  tenure?: string;
  estimatedValue?: { low: number; central: number; high: number };
  pricePerSqft?: number;
  comparables?: Array<{
    address: string;
    price: number;
    currency?: string;
    date?: string;
    sqft?: number;
    pricePerSqft?: number;
    distanceMiles?: number;
    notes?: string;
  }>;
  valuationDrivers?: string[];
  risks?: string[];
  methodology?: string;
  confidence?: "low" | "medium" | "high";
};

// ── Colour tokens (brand-matched, RGB for jsPDF) ──
const NAVY: [number, number, number] = [15, 17, 21];         // #0F1115
const NAVY_M: [number, number, number] = [26, 30, 38];       // #1A1E26
const CREAM: [number, number, number] = [245, 240, 225];     // #F5F0E1
const CREAM_L: [number, number, number] = [250, 246, 237];   // #FAF6ED
const GREEN: [number, number, number] = [46, 158, 114];      // #2E9E72
const GREEN_HOT: [number, number, number] = [82, 196, 152];  // #52C498
const GOLD: [number, number, number] = [168, 132, 58];       // #A8843A
const TEXT_M: [number, number, number] = [61, 67, 81];       // #3D4351
const TEXT_D: [number, number, number] = [107, 114, 128];    // #6B7280
const BORDER: [number, number, number] = [226, 221, 207];    // softened cream for lines

// ── Helpers ──
function money(n: number | undefined, currency = "GBP"): string {
  if (n == null || !isFinite(n)) return "—";
  const sym =
    currency === "USD" ? "$" :
    currency === "EUR" ? "€" :
    currency === "AED" ? "AED " :
    currency === "SGD" ? "S$" :
    currency === "AUD" ? "A$" :
    currency === "CHF" ? "CHF " :
    currency === "JPY" ? "¥" : "£";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${sym}${(n / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${sym}${(n / 1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${sym}${Math.round(n / 1e3)}k`;
  return `${sym}${Math.round(n)}`;
}
function moneyFull(n: number | undefined, currency = "GBP"): string {
  if (n == null || !isFinite(n)) return "—";
  const sym =
    currency === "USD" ? "$" :
    currency === "EUR" ? "€" :
    currency === "AED" ? "AED " :
    currency === "SGD" ? "S$" :
    currency === "AUD" ? "A$" :
    currency === "CHF" ? "CHF " :
    currency === "JPY" ? "¥" : "£";
  return `${sym}${Math.round(n).toLocaleString()}`;
}
// Strip non-ASCII glyphs jsPDF can't render
function ascii(s: string | undefined): string {
  if (!s) return "";
  return s
    .replace(/—/g, "-").replace(/–/g, "-")
    .replace(/×/g, "x").replace(/≥/g, ">=").replace(/≤/g, "<=")
    .replace(/£/g, "£").replace(/€/g, "€"); // keep these — jsPDF handles them
}

// ── Main export ──
export function generateValuationPDF(v: Valuation, opts?: { firmName?: string; preparedBy?: string }): jsPDF {
  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 48; // margin
  const ccy = v.currency || "GBP";

  pdf.setFont("helvetica");

  // ── PAGE 1 · COVER ──────────────────────────────────────────────
  pdf.setFillColor(...NAVY);
  pdf.rect(0, 0, W, H, "F");

  // Subtle green gradient bar top
  pdf.setFillColor(...GREEN);
  pdf.rect(0, 0, W, 4, "F");

  // Logo mark
  pdf.setFillColor(...GREEN_HOT);
  pdf.roundedRect(M, M + 12, 34, 34, 6, 6, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("V", M + 17, M + 34, { align: "center" });

  // Valora wordmark
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Valora", M + 46, M + 34);
  pdf.setTextColor(160, 165, 174);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("VALUATION REPORT", M + 46, M + 46);

  // Eyebrow
  pdf.setTextColor(109, 255, 177);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  const eyebrow = (v.jurisdiction ? `${v.jurisdiction.toUpperCase()} · ` : "") + "COMPARATIVE MARKET VALUATION";
  pdf.text(eyebrow, M, H / 2 - 90);

  // Headline value
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(48);
  pdf.setFont("helvetica", "bold");
  pdf.text(moneyFull(v.estimatedValue?.central, ccy), M, H / 2 - 40);

  // Range
  pdf.setTextColor(200, 204, 212);
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "normal");
  const range = `${moneyFull(v.estimatedValue?.low, ccy)}  —  ${moneyFull(v.estimatedValue?.high, ccy)}`;
  pdf.text(`Estimated range: ${range}`, M, H / 2 - 14);

  // Address / property line
  pdf.setTextColor(246, 244, 239);
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  const addr = ascii(v.address || (v.propertyType ? v.propertyType : "Subject property"));
  const addrLines = pdf.splitTextToSize(addr, W - M * 2);
  pdf.text(addrLines, M, H / 2 + 26);

  // Meta row at bottom
  const metaY = H - M - 80;
  pdf.setDrawColor(40, 45, 55);
  pdf.line(M, metaY, W - M, metaY);
  pdf.setTextColor(160, 165, 174);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  const metas: Array<[string, string]> = [
    ["TYPE", ascii(v.propertyType || "—")],
    ["SIZE", v.sqft ? `${v.sqft.toLocaleString()} sqft` : "—"],
    ["BEDS", v.bedrooms != null ? String(v.bedrooms) : "—"],
    ["TENURE", ascii(v.tenure?.replace(/_/g, " ") || "—")],
    ["CONFIDENCE", (v.confidence || "medium").toUpperCase()],
  ];
  const metaColW = (W - M * 2) / metas.length;
  metas.forEach((pair, i) => {
    const x = M + i * metaColW;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(140, 145, 155);
    pdf.setFontSize(7);
    pdf.text(pair[0], x, metaY + 16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.text(pair[1], x, metaY + 34);
  });

  // Footer
  pdf.setTextColor(109, 255, 177);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("VALORAPLATFORM.IO", M, H - M + 8);
  pdf.setTextColor(110, 115, 125);
  pdf.setFont("helvetica", "normal");
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  pdf.text(today, W - M, H - M + 8, { align: "right" });

  // ── PAGE 2 · EXECUTIVE SUMMARY + VALUE ─────────────────────────
  pdf.addPage();
  paintPageBg(pdf, W, H);
  let y = drawHeader(pdf, "Executive Summary", W, M) + 18;

  pdf.setTextColor(...TEXT_M);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  const summary =
    `Central estimate of ${moneyFull(v.estimatedValue?.central, ccy)}, with a working range of ` +
    `${moneyFull(v.estimatedValue?.low, ccy)} to ${moneyFull(v.estimatedValue?.high, ccy)}. ` +
    `Valuation methodology: ${(v.methodology || "comparable_sales").replace(/_/g, " ")}. ` +
    `Confidence assessed as ${v.confidence || "medium"}.`;
  const lines = pdf.splitTextToSize(ascii(summary), W - M * 2);
  pdf.text(lines, M, y);
  y += lines.length * 15 + 22;

  // Estimated value card
  pdf.setFillColor(...CREAM_L);
  pdf.roundedRect(M, y, W - M * 2, 120, 10, 10, "F");
  pdf.setDrawColor(...BORDER);
  pdf.roundedRect(M, y, W - M * 2, 120, 10, 10, "S");

  pdf.setTextColor(...TEXT_D);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("ESTIMATED VALUE", M + 18, y + 22);

  pdf.setTextColor(...NAVY);
  pdf.setFontSize(34);
  pdf.setFont("helvetica", "bold");
  pdf.text(moneyFull(v.estimatedValue?.central, ccy), M + 18, y + 58);

  pdf.setTextColor(...TEXT_D);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Low  ${moneyFull(v.estimatedValue?.low, ccy)}    |    High  ${moneyFull(v.estimatedValue?.high, ccy)}`, M + 18, y + 78);

  if (v.pricePerSqft) {
    pdf.setTextColor(...GOLD);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${moneyFull(v.pricePerSqft, ccy)} / sqft`, M + 18, y + 98);
  }

  // Confidence badge (top-right of card)
  const conf = v.confidence || "medium";
  const confColor: [number, number, number] = conf === "high" ? GREEN : conf === "low" ? [194, 72, 68] : [197, 126, 20];
  pdf.setFillColor(...confColor);
  const confLabel = `${conf.toUpperCase()} CONFIDENCE`;
  const cW = pdf.getTextWidth(confLabel) + 18;
  pdf.roundedRect(W - M - 18 - cW, y + 14, cW, 20, 10, 10, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text(confLabel, W - M - 18 - cW + 9, y + 27);
  y += 140;

  // Property details grid
  pdf.setTextColor(...TEXT_D);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("PROPERTY DETAILS", M, y);
  y += 18;

  const details: Array<[string, string]> = [
    ["Address", ascii(v.address || "—")],
    ["Jurisdiction", ascii(v.jurisdiction || "—")],
    ["Property type", ascii(v.propertyType || "—")],
    ["Size", v.sqft ? `${v.sqft.toLocaleString()} sqft` : "—"],
    ["Bedrooms", v.bedrooms != null ? String(v.bedrooms) : "—"],
    ["Tenure", ascii(v.tenure?.replace(/_/g, " ") || "—")],
    ["Condition", ascii(v.condition?.replace(/_/g, " ") || "—")],
    ["Methodology", ascii(v.methodology?.replace(/_/g, " ") || "—")],
  ];
  const colW = (W - M * 2) / 2;
  details.forEach((pair, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = M + col * colW;
    const yy = y + row * 26;
    pdf.setTextColor(...TEXT_D);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(pair[0].toUpperCase(), x, yy);
    pdf.setTextColor(...NAVY);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text(pair[1], x, yy + 14);
  });

  // Footer
  drawFooter(pdf, W, H, M, 2);

  // ── PAGE 3 · COMPARABLES ────────────────────────────────────────
  if (v.comparables && v.comparables.length) {
    pdf.addPage();
    paintPageBg(pdf, W, H);
    y = drawHeader(pdf, `Comparables (${v.comparables.length})`, W, M) + 20;

    // Table header
    const cols = [
      { key: "address", label: "Address", w: 180, align: "left" as const },
      { key: "price",   label: "Price",   w: 70,  align: "right" as const },
      { key: "sqft",    label: "Sqft",    w: 50,  align: "right" as const },
      { key: "psqft",   label: "/sqft",   w: 60,  align: "right" as const },
      { key: "date",    label: "Date",    w: 60,  align: "left" as const },
      { key: "dist",    label: "Dist",    w: 80,  align: "right" as const },
    ];
    const rowX = M;
    pdf.setFillColor(...CREAM_L);
    pdf.rect(rowX, y - 14, W - M * 2, 24, "F");

    pdf.setTextColor(...TEXT_D);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    let cx = rowX + 12;
    cols.forEach(col => {
      const tx = col.align === "right" ? cx + col.w - 12 : cx;
      pdf.text(col.label.toUpperCase(), tx, y + 2, { align: col.align });
      cx += col.w;
    });
    y += 18;

    // Table rows
    pdf.setFont("helvetica", "normal");
    v.comparables.forEach((c, i) => {
      if (y > H - M - 60) {
        pdf.addPage();
        paintPageBg(pdf, W, H);
        y = drawHeader(pdf, `Comparables (continued)`, W, M) + 20;
      }
      pdf.setDrawColor(...BORDER);
      pdf.line(rowX, y + 24, W - M, y + 24);

      let cx2 = rowX + 12;
      // Address + notes
      pdf.setTextColor(...NAVY);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      const addrLines = pdf.splitTextToSize(ascii(c.address), cols[0].w - 12);
      pdf.text(addrLines[0] || "", cx2, y + 8);
      if (c.notes) {
        pdf.setTextColor(...TEXT_D);
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(7.5);
        const noteLines = pdf.splitTextToSize(ascii(c.notes), cols[0].w - 12);
        pdf.text(noteLines[0] || "", cx2, y + 20);
      }
      cx2 += cols[0].w;

      // Price
      pdf.setTextColor(...NAVY);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(money(c.price, c.currency || ccy), cx2 + cols[1].w - 12, y + 8, { align: "right" });
      cx2 += cols[1].w;

      // Sqft
      pdf.setTextColor(...TEXT_M);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(c.sqft ? c.sqft.toLocaleString() : "—", cx2 + cols[2].w - 12, y + 8, { align: "right" });
      cx2 += cols[2].w;

      // Price/sqft
      pdf.text(c.pricePerSqft ? money(c.pricePerSqft, c.currency || ccy) : "—", cx2 + cols[3].w - 12, y + 8, { align: "right" });
      cx2 += cols[3].w;

      // Date
      pdf.text(ascii(c.date || "—"), cx2, y + 8);
      cx2 += cols[4].w;

      // Distance
      pdf.text(c.distanceMiles != null ? `${c.distanceMiles.toFixed(1)} mi` : "—", cx2 + cols[5].w - 12, y + 8, { align: "right" });

      y += 34;
    });
    drawFooter(pdf, W, H, M, 3);
  }

  // ── PAGE 4 · DRIVERS + RISKS ───────────────────────────────────
  pdf.addPage();
  paintPageBg(pdf, W, H);
  y = drawHeader(pdf, "Valuation Drivers", W, M) + 20;

  if (v.valuationDrivers && v.valuationDrivers.length) {
    v.valuationDrivers.forEach(d => {
      if (y > H - M - 100) {
        pdf.addPage();
        paintPageBg(pdf, W, H);
        y = drawHeader(pdf, "Valuation Drivers (continued)", W, M) + 20;
      }
      pdf.setTextColor(...GREEN);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("->", M, y);
      pdf.setTextColor(...TEXT_M);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const dLines = pdf.splitTextToSize(ascii(d), W - M * 2 - 22);
      pdf.text(dLines, M + 18, y);
      y += dLines.length * 14 + 10;
    });
    y += 12;
  }

  // Risks
  if (v.risks && v.risks.length) {
    if (y > H - M - 180) {
      pdf.addPage();
      paintPageBg(pdf, W, H);
      y = M + 30;
    }
    pdf.setTextColor(...NAVY);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Risks", M, y);
    y += 18;
    v.risks.forEach(r => {
      if (y > H - M - 80) {
        pdf.addPage();
        paintPageBg(pdf, W, H);
        y = drawHeader(pdf, "Risks (continued)", W, M) + 20;
      }
      pdf.setTextColor(197, 126, 20);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("!", M, y);
      pdf.setTextColor(...TEXT_M);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const rLines = pdf.splitTextToSize(ascii(r), W - M * 2 - 22);
      pdf.text(rLines, M + 18, y);
      y += rLines.length * 14 + 10;
    });
  }

  // ── PAGE N · METHODOLOGY NOTE ──────────────────────────────────
  pdf.addPage();
  paintPageBg(pdf, W, H);
  y = drawHeader(pdf, "Methodology & Disclosure", W, M) + 20;

  pdf.setTextColor(...TEXT_M);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  const methodText =
    `This valuation has been produced by Valora Copilot using a ${(v.methodology || "comparable_sales").replace(/_/g, " ")} approach. ` +
    `The central figure of ${moneyFull(v.estimatedValue?.central, ccy)} represents the midpoint of a working range that reflects ` +
    `recent market comparables and qualitative adjustments for condition, size, tenure, location and outlook.\n\n` +
    `The comparables shown have been selected from market-available sales data and adjusted by the analyst to reflect ` +
    `differences from the subject property. Where numerical adjustments are cited in the adjustment notes, they ` +
    `represent directional percentage impact on price, not final transacted values.\n\n` +
    `This report is produced for internal decision-support and is not a RICS or Red Book formal valuation. ` +
    `It should not be relied upon for secured lending or regulated purposes without an accompanying ` +
    `professional valuation. Confidence level is stated on the cover page.\n\n` +
    `Generated by Valora · valoraplatform.io · ${today}.`;

  const methLines = pdf.splitTextToSize(ascii(methodText), W - M * 2);
  methLines.forEach((line: string) => {
    if (y > H - M - 30) {
      pdf.addPage();
      paintPageBg(pdf, W, H);
      y = M + 30;
    }
    pdf.text(line, M, y);
    y += 14;
  });

  // Stamp page numbers (skip cover)
  const pageCount = pdf.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setTextColor(...TEXT_D);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${i} / ${pageCount}`, W - M, H - M + 8, { align: "right" });
    pdf.setTextColor(...GREEN);
    pdf.setFont("helvetica", "bold");
    pdf.text("VALORA · VALUATION REPORT", M, H - M + 8);
  }

  return pdf;
}

// ── Page helpers ──
function paintPageBg(pdf: jsPDF, W: number, H: number) {
  pdf.setFillColor(...CREAM);
  pdf.rect(0, 0, W, H, "F");
}
function drawHeader(pdf: jsPDF, title: string, W: number, M: number): number {
  // Top navigation strip
  pdf.setFillColor(...NAVY);
  pdf.rect(0, 0, W, 36, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("Valora", M, 23);
  pdf.setTextColor(109, 255, 177);
  pdf.setFontSize(8);
  pdf.text("VALUATION REPORT", M + 56, 23);
  pdf.setTextColor(160, 165, 174);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text("valoraplatform.io", W - M, 23, { align: "right" });

  // Page title
  pdf.setTextColor(...NAVY);
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text(title, M, M + 44);
  return M + 48;
}
function drawFooter(pdf: jsPDF, W: number, H: number, M: number, _pageNum: number) {
  pdf.setDrawColor(...BORDER);
  pdf.line(M, H - M - 8, W - M, H - M - 8);
}

// ── Convenience: download with a filename ──
export function downloadValuationPDF(v: Valuation, filename?: string) {
  const pdf = generateValuationPDF(v);
  const stem = filename || `Valora-Valuation-${(v.address || "Property").replace(/[^a-zA-Z0-9-_ ]/g, "").slice(0, 48) || "Property"}`;
  pdf.save(`${stem}.pdf`);
}
