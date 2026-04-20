import { describe, it, expect } from "vitest";
import {
  runMonteCarlo, sampleDistribution, mulberry32, DEFAULTS,
  type MCDistribution, type MCConfig,
} from "@/lib/calc-engines";

// Monte Carlo sanity tests — Phase 3.
// The MC engine is deterministic under a fixed seed. These tests assert:
//   1. sampleDistribution returns values in the expected support for each kind.
//   2. Same seed → identical MCResult (byte-equal on metrics).
//   3. P10 ≤ P50 ≤ P90 for every banded metric.
//   4. No NaN in bands when all draws produce finite calcAll results.
//   5. Triangular around mode converges near mode for large N.
//   6. nDropped + sum(metric samples length) = iterations when metrics aligned.

describe("sampleDistribution — support + basic shape", () => {
  it("fixed returns value exactly", () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 20; i++) {
      expect(sampleDistribution({ kind: "fixed", value: 42 }, rng)).toBe(42);
    }
  });

  it("uniform samples stay within [min,max]", () => {
    const rng = mulberry32(2);
    const d: MCDistribution = { kind: "uniform", min: 0.1, max: 0.2 };
    for (let i = 0; i < 2000; i++) {
      const s = sampleDistribution(d, rng);
      expect(s).toBeGreaterThanOrEqual(0.1);
      expect(s).toBeLessThan(0.2 + 1e-12);
    }
  });

  it("triangular samples stay within [min,max]", () => {
    const rng = mulberry32(3);
    const d: MCDistribution = { kind: "triangular", min: 1, mode: 2, max: 5 };
    for (let i = 0; i < 2000; i++) {
      const s = sampleDistribution(d, rng);
      expect(s).toBeGreaterThanOrEqual(1 - 1e-9);
      expect(s).toBeLessThanOrEqual(5 + 1e-9);
    }
  });

  it("normal with clip respects bounds", () => {
    const rng = mulberry32(4);
    const d: MCDistribution = { kind: "normal", mean: 10, stdev: 3, clipMin: 5, clipMax: 15 };
    for (let i = 0; i < 2000; i++) {
      const s = sampleDistribution(d, rng);
      expect(s).toBeGreaterThanOrEqual(5);
      expect(s).toBeLessThanOrEqual(15);
    }
  });

  it("triangular mean is close to (min+mode+max)/3 for large N", () => {
    const rng = mulberry32(5);
    const d: MCDistribution = { kind: "triangular", min: 0, mode: 4, max: 6 };
    let sum = 0;
    const N = 20000;
    for (let i = 0; i < N; i++) sum += sampleDistribution(d, rng);
    const empMean = sum / N;
    const theoMean = (0 + 4 + 6) / 3; // ≈ 3.333
    expect(Math.abs(empMean - theoMean)).toBeLessThan(0.1);
  });
});

describe("runMonteCarlo — determinism + band ordering", () => {
  it("same seed → identical metrics (BTR)", () => {
    const base = (DEFAULTS as any).BTR;
    const cfg: MCConfig = {
      iterations: 200,
      seed: 12345,
      distributions: {
        exitYield: { kind: "triangular", min: 3.5, mode: 4.15, max: 5.0 },
        voidPct:   { kind: "uniform", min: 1, max: 4 },
      },
    };
    const a = runMonteCarlo("BTR", base, cfg);
    const b = runMonteCarlo("BTR", base, cfg);
    expect(a.metrics.irr.p50).toBe(b.metrics.irr.p50);
    expect(a.metrics.moic.p10).toBe(b.metrics.moic.p10);
    expect(a.metrics.profit.p90).toBe(b.metrics.profit.p90);
    expect(a.seedUsed).toBe(b.seedUsed);
  });

  it("P10 ≤ P50 ≤ P90 for every metric (Hotel)", () => {
    const base = (DEFAULTS as any).Hotel;
    const cfg: MCConfig = {
      iterations: 500,
      seed: 99,
      distributions: {
        occupancy:    { kind: "triangular", min: 60, mode: 72, max: 82 },
        adr:          { kind: "normal", mean: 180, stdev: 25, clipMin: 120, clipMax: 260 },
        exitCapRate:  { kind: "triangular", min: 5.5, mode: 6.5, max: 8.0 },
      },
      metrics: ["irr", "moic", "profit", "poc"],
    };
    const r = runMonteCarlo("Hotel", base, cfg);
    for (const k of ["irr", "moic", "profit", "poc"]) {
      const b = r.metrics[k];
      expect(Number.isFinite(b.p10)).toBe(true);
      expect(Number.isFinite(b.p50)).toBe(true);
      expect(Number.isFinite(b.p90)).toBe(true);
      expect(b.p10).toBeLessThanOrEqual(b.p50);
      expect(b.p50).toBeLessThanOrEqual(b.p90);
      expect(b.min).toBeLessThanOrEqual(b.p10);
      expect(b.max).toBeGreaterThanOrEqual(b.p90);
      expect(b.n).toBeGreaterThan(0);
    }
  });

  it("returns nDropped=0 when distributions are benign (BTS)", () => {
    const base = (DEFAULTS as any).BTS;
    const cfg: MCConfig = {
      iterations: 100,
      seed: 7,
      distributions: {
        "units.0.salePricePsf": { kind: "triangular", min: 800, mode: 900, max: 1000 },
      },
    };
    const r = runMonteCarlo("BTS", base, cfg);
    expect(r.nDropped).toBe(0);
    expect(r.metrics.irr.n).toBe(100);
  });

  it("dotted paths into array indices work (MixedUse zones)", () => {
    const base = (DEFAULTS as any).MixedUse;
    const cfg: MCConfig = {
      iterations: 50,
      seed: 11,
      distributions: {
        "zones.0.salePricePsf": { kind: "uniform", min: 750, mode: undefined as any, max: 900 } as any,
        "zones.1.rentPcm":      { kind: "triangular", min: 2500, mode: 3000, max: 3500 },
      },
    };
    // Replace the malformed uniform with correct shape
    cfg.distributions["zones.0.salePricePsf"] = { kind: "uniform", min: 750, max: 900 };
    const r = runMonteCarlo("MixedUse", base, cfg);
    expect(r.metrics.irr.n).toBeGreaterThan(0);
    expect(Number.isFinite(r.metrics.irr.p50)).toBe(true);
  });

  it("different seeds produce different samples (distribution is not constant)", () => {
    const base = (DEFAULTS as any).BTR;
    const cfg1: MCConfig = {
      iterations: 200, seed: 1,
      distributions: { exitYield: { kind: "uniform", min: 3, max: 6 } },
    };
    const cfg2: MCConfig = {
      iterations: 200, seed: 2,
      distributions: { exitYield: { kind: "uniform", min: 3, max: 6 } },
    };
    const a = runMonteCarlo("BTR", base, cfg1);
    const b = runMonteCarlo("BTR", base, cfg2);
    expect(a.metrics.irr.p50).not.toBe(b.metrics.irr.p50);
  });

  it("unknown dot-path is silently ignored (no throw, no band corruption)", () => {
    const base = (DEFAULTS as any).BTR;
    const cfg: MCConfig = {
      iterations: 50, seed: 100,
      distributions: {
        "notARealField":             { kind: "uniform", min: 0, max: 1 },
        "units.99.fieldNotPresent":  { kind: "uniform", min: 0, max: 1 },
        "exitYield":                 { kind: "triangular", min: 3.5, mode: 4.15, max: 5.0 },
      },
    };
    const r = runMonteCarlo("BTR", base, cfg);
    expect(Number.isFinite(r.metrics.irr.p50)).toBe(true);
  });
});

describe("mulberry32 — PRNG sanity", () => {
  it("is deterministic", () => {
    const a = mulberry32(42), b = mulberry32(42);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });

  it("produces values in [0,1)", () => {
    const r = mulberry32(999);
    for (let i = 0; i < 10000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("empirical mean ≈ 0.5 for large N", () => {
    const r = mulberry32(12321);
    let sum = 0;
    const N = 50000;
    for (let i = 0; i < N; i++) sum += r();
    expect(Math.abs(sum / N - 0.5)).toBeLessThan(0.01);
  });
});