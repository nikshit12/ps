import { strict as assert } from "node:assert";
import { test } from "node:test";
import { calculateOverlap, formatBps, syntheticFunds, type Holding } from "../src/lib/overlap.ts";

const [a, b] = syntheticFunds;
const withHoldings = (holdings: Holding[]) => ({ ...a, holdings });

test("architecture fixture overlaps by 25%, entirely in X", () => {
  const result = calculateOverlap(a, b);
  assert.equal(result.coverage, "complete");
  assert.equal(result.overlapBps, 2500);
  assert.equal(formatBps(result.overlapBps), "25%");
  assert.deepEqual(result.contributors, [
    { securityId: "X", name: "Security X", leftBps: 6000, rightBps: 2500, overlapBps: 2500 },
  ]);
  assert.equal(calculateOverlap(b, a).overlapBps, result.overlapBps);
});

test("aggregates positions and reports observed overlap against original full-fund weights", () => {
  const result = calculateOverlap(withHoldings([
    { ...a.holdings[0], weightBps: 1200 }, { ...a.holdings[0], weightBps: 900 },
  ]), b);
  assert.equal(result.leftCoverageBps, 2100);
  assert.equal(result.coverage, "partial");
  assert.equal(result.overlapBps, 2100);
});

test("cash remains disclosed but contributes zero equity overlap", () => {
  const cash = withHoldings([{ securityId: "USD", kind: "cash", name: "Cash", weightBps: 10000 }]);
  const result = calculateOverlap(cash, cash);
  assert.equal(result.leftCashBps, 10000);
  assert.equal(result.coverage, "complete");
  assert.equal(result.overlapBps, 0);
  assert.deepEqual(result.contributors, []);
});

test("rejects missing, incompatible or invalid snapshots", () => {
  for (const weightBps of [-1, 0.5, NaN, Infinity, 10001]) {
    assert.throws(() => calculateOverlap(withHoldings([{ ...a.holdings[0], weightBps }]), b), /weights/);
  }
  assert.throws(() => calculateOverlap(withHoldings([]), b), /unavailable/);
  assert.throws(() => calculateOverlap(withHoldings([...a.holdings, a.holdings[0]]), b), /exceeds/);
  assert.throws(() => calculateOverlap(a, { ...b, asOf: "2026-08-31" }), /same as-of/);
  assert.throws(() => calculateOverlap({ ...a, asOf: "2026-02-30" }, { ...b, asOf: "2026-02-30" }), /Invalid/);
});
