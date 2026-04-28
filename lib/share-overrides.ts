// ─────────────────────────────────────────────────────────────────────────────
// Valora — lib/share-overrides.ts
//
// Tiny helper for the Underwrite Room. Takes the sponsor's snapshot and a
// recipient's overrides (e.g. { "exitCapRate": 6.25, "adr": 195 }) and
// produces a new snapshot ready to feed into calcAll().
//
// Uses dot-path notation so any field is reachable, including nested arrays
// like "units.0.rentPcm". Mirrors the path semantics of the existing Monte
// Carlo applyPath() helper in lib/calc-engine.ts so behaviour is consistent.
// ─────────────────────────────────────────────────────────────────────────────

export type Overrides = Record<string, number | string | boolean>;

/**
 * Deep-clone a snapshot. JSON-safe because all snap values are plain data
 * (the engine never touches functions, dates, or class instances).
 */
function cloneSnap<T>(snap: T): T {
  return JSON.parse(JSON.stringify(snap));
}

/**
 * Apply a single dot-path write. Silently no-ops if the path is missing —
 * this matches Monte Carlo's applyPath behaviour and prevents a typo'd
 * override from throwing on the share page.
 */
function applyPath(obj: any, path: string, value: any): void {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] === undefined || cur[p] === null) return;
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

/**
 * Merge recipient overrides onto a sponsor snapshot. Non-mutating —
 * returns a new object so the sponsor's original is preserved.
 *
 * Usage:
 *   const liveSnap = applyOverrides(appraisal.snapshot, recipientOverrides);
 *   const liveResults = calcAll(liveSnap.assetType, liveSnap);
 */
export function applyOverrides(snap: any, overrides: Overrides, sliders?: SliderSpec[]): any {
  if (!overrides || Object.keys(overrides).length === 0) return snap;
  const out = cloneSnap(snap);
  for (const [path, value] of Object.entries(overrides)) {
    applyPath(out, path, value);
    const spec = sliders?.find(s => s.path === path);
    if (spec?.clearPaths) {
      for (const clearPath of spec.clearPaths) {
        applyPath(out, clearPath, undefined);
      }
    }
  }
  return out;
}

/**
 * Returns true if every override has been reset (or none were set).
 * Used to render the "Custom" badge vs. "Sponsor's case" badge.
 */
export function hasActiveOverrides(overrides: Overrides | null | undefined): boolean {
  return !!overrides && Object.keys(overrides).length > 0;
}

/**
 * Slider definitions per asset type. The Underwrite Room reads from this
 * list to render the Assumption Ledger. Each slider knows its path (for
 * applyOverrides), its label, its unit, its base value field on the snap,
 * and how to compute its min/max range from the base value.
 *
 * Ranges are deliberately conservative — wide enough to express plausible
 * downside/upside, narrow enough that the slider feel is "real". Every
 * range is symmetric around the sponsor's base case.
 */
export type SliderSpec = {
  path: string;
  label: string;
  unit: "%" | "bps" | "currency" | "ratio" | "months" | "count";
  /** Pull the sponsor's base value from the snap. Must return a finite number. */
  getBase: (snap: any) => number;
  /** Compute [min, max] from the base value. */
  getRange: (base: number) => [number, number];
  /** Step size for the slider. */
  step: number;
  /** Optional: hint text shown under the slider. */
  hint?: string;
  /** Optional: only show if predicate true (e.g. hide LTC slider for all-equity deals). */
  visible?: (snap: any) => boolean;
  /** Also reset these paths to undefined when this slider moves. */
  clearPaths?: string[];
};

const num = (v: any): number => {
  const n = parseFloat(String(v ?? "").replace(/[£,%\s]/g, ""));
  return isFinite(n) ? n : 0;
};

/**
 * The five sliders for Hotel Advanced. Order = display order in the ledger.
 * Decided 27 Apr 2026:
 *   1. Exit Cap Rate (±150bps) — biggest IRR driver
 *   2. ADR (±20%) — propagates through every year unless year overrides set
 *   3. Occupancy (±15pp) — second biggest revenue driver
 *   4. CapEx Budget (±30%) — most-questioned cost line
 *   5. LTC (0–75%) — toggle from all-equity to fully-levered
 */
export const HOTEL_ADVANCED_SLIDERS: SliderSpec[] = [
  {
    path: "exitCapRate",
    label: "Exit Cap Rate",
    unit: "%",
    getBase: (snap) => num(snap.exitCapRate ?? 5.75),
    getRange: (base) => [Math.max(0.5, base - 1.5), base + 1.5],
    step: 0.05,
    hint: "Capitalises stabilised NOI into exit value. Single biggest IRR lever.",
  },
  {
    path: "adr",
    label: "ADR",
    unit: "currency",
    getBase: (snap) => num(snap.adr ?? 180),
    getRange: (base) => [Math.max(1, base * 0.8), base * 1.2],
    step: 1,
    hint: "Average Daily Rate. Propagates through every year of the model.",
    clearPaths: ["yearAdr"],
  },
  {
    path: "occupancy",
    label: "Occupancy",
    unit: "%",
    getBase: (snap) => num(snap.occupancy ?? 72),
    getRange: (base) => [Math.max(20, base - 15), Math.min(100, base + 15)],
    step: 0.5,
    hint: "Stabilised occupancy. Drives RevPAR alongside ADR.",
    clearPaths: ["yearOcc"],
  },
  {
    path: "capexBudget",
    label: "CapEx Budget",
    unit: "currency",
    getBase: (snap) => num(snap.capexBudget ?? 5_000_000),
    getRange: (base) => [Math.max(0, base * 0.7), base * 1.3],
    step: 50_000,
    hint: "Total capital expenditure budget. The most-questioned cost line.",
  },
  {
    path: "ltc",
    label: "Loan-to-Cost",
    unit: "%",
    getBase: (snap) => num(snap.ltc ?? 60),
    getRange: () => [0, 75],
    step: 1,
    hint: "0% = all-equity, 75% = fully-levered. Watch IRR fan out as leverage rises.",
    visible: (snap) => snap.capStructure !== "equity",
  },
];

/**
 * Slider sets for other asset types. Hotel Advanced is shipped first; these
 * are the planned defaults for v1.1 onward. Each set follows the same
 * principle: 5 highest-leverage inputs, ranked by what an LP would push back on.
 */
export const SLIDER_SETS: Record<string, SliderSpec[]> = {
  HotelAdvanced: HOTEL_ADVANCED_SLIDERS,
  // ── v1.1 placeholders — implement same shape as above ────────────────────
  // BTR:        [exitYield, buildCostPsf, rentPcm-proportional, ltc, allInRate]
  // BTS:        [salePricePsf-proportional, buildCostPsf, absorptionMonths, ltc]
  // HotelSimple:[adr, occupancy, exitCapRate, capexBudget, ltc]
  // Flip:       [salePrice, refurbBudget, bridgingMonths, bridgingRatePct]
  // Commercial: [niy, ervProportional, buildCostPsm]
  // Industrial: [niy, ervProportional, buildCostPsm]
  // MixedUse:   [ltc, perZoneExitYield...] (special case — per-zone sliders)
};

/**
 * Convenience: pick the slider set for a given snap. Returns the Hotel
 * Advanced set if hotelMode='advanced', otherwise null until v1.1 ships
 * the rest.
 */
export function getSlidersForSnap(snap: any): SliderSpec[] | null {
  if (!snap) return null;
  if (snap.assetType === "Hotel" && snap.hotelMode === "advanced") {
    return HOTEL_ADVANCED_SLIDERS;
  }
  return null;
}