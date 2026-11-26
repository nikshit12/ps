/** Weights are integer basis points of the entire fund (10,000 = 100%). */
export interface Holding {
  securityId: string;
  name: string;
  weightBps: number;
  kind?: "equity" | "cash";
}

export interface FundSnapshot {
  id: string;
  name: string;
  asOf: string;
  source: string;
  holdings: readonly Holding[];
}

const fixtureDate = "2026-09-30";
const fixtureSource = "Synthetic research fixture, September 2026";

export const syntheticFunds: FundSnapshot[] = [
  {
    id: "A", name: "Fund A", asOf: fixtureDate, source: fixtureSource,
    holdings: [
      { securityId: "X", name: "Security X", weightBps: 6000 },
      { securityId: "Y", name: "Security Y", weightBps: 4000 },
    ],
  },
  {
    id: "B", name: "Fund B", asOf: fixtureDate, source: fixtureSource,
    holdings: [
      { securityId: "X", name: "Security X", weightBps: 2500 },
      { securityId: "Z", name: "Security Z", weightBps: 7500 },
    ],
  },
  {
    id: "C", name: "Fund C", asOf: fixtureDate, source: fixtureSource,
    holdings: [
      { securityId: "Y", name: "Security Y", weightBps: 5000 },
      { securityId: "Z", name: "Security Z", weightBps: 5000 },
    ],
  },
];

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

export function formatBps(value: number): string {
  return percent.format(value / 10000);
}

function indexHoldings(snapshot: FundSnapshot) {
  const equities = new Map<string, { name: string; weightBps: number }>();
  let coverageBps = 0;
  let cashBps = 0;

  if (!snapshot.holdings.length) throw new Error("Holdings are unavailable.");
  for (const holding of snapshot.holdings) {
    const { securityId, weightBps, name } = holding;
    if (!securityId.trim() || !name.trim()) throw new Error("Holdings need a security ID and name.");
    if (!Number.isInteger(weightBps) || weightBps < 0 || weightBps > 10000) {
      throw new Error("Holding weights must be integer basis points from 0 to 10,000.");
    }
    coverageBps += weightBps;
    if (coverageBps > 10000) throw new Error("Total disclosed weight exceeds 100%.");
    if (holding.kind === "cash") {
      cashBps += weightBps;
      continue;
    }
    const previous = equities.get(securityId);
    equities.set(securityId, { name: previous?.name ?? name, weightBps: (previous?.weightBps ?? 0) + weightBps });
  }
  return { equities, coverageBps, cashBps };
}

export function calculateOverlap(left: FundSnapshot, right: FundSnapshot) {
  if (left.asOf !== right.asOf) throw new Error("Holdings must have the same as-of date.");
  const date = new Date(left.asOf + "T00:00:00Z");
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== left.asOf) {
    throw new Error("Invalid holdings as-of date.");
  }
  const a = indexHoldings(left);
  const b = indexHoldings(right);
  const contributors = [];
  let overlapBps = 0;
  for (const [securityId, position] of a.equities) {
    const rightBps = b.equities.get(securityId)?.weightBps ?? 0;
    const matchedBps = Math.min(position.weightBps, rightBps);
    if (matchedBps > 0) {
      contributors.push({ securityId, name: position.name, leftBps: position.weightBps, rightBps, overlapBps: matchedBps });
      overlapBps += matchedBps;
    }
  }
  contributors.sort((x, y) => y.overlapBps - x.overlapBps || x.securityId.localeCompare(y.securityId, "en"));
  const coverage: "complete" | "partial" = a.coverageBps === 10000 && b.coverageBps === 10000 ? "complete" : "partial";
  return {
    overlapBps, coverage, contributors,
    leftCoverageBps: a.coverageBps, rightCoverageBps: b.coverageBps,
    leftCashBps: a.cashBps, rightCashBps: b.cashBps,
  };
}
