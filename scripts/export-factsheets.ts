import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { calculateOverlap, formatBps, syntheticFunds } from "../src/lib/overlap.ts";

type Fund = (typeof syntheticFunds)[number];

function escapeText(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function holdingsEvidence(fund: Fund, coverageBps: number): string {
  const rows = fund.holdings.map((holding) => `
    <tr><th scope="row">${escapeText(holding.name)} (${escapeText(holding.securityId)})</th>
    <td>${formatBps(holding.weightBps)}</td></tr>`).join("");
  return `
    <table><caption>${escapeText(fund.name)} · ${escapeText(fund.id)}</caption>
      <thead><tr><th scope="col">Disclosed security</th><th scope="col">Portfolio weight</th></tr></thead>
      <tbody>${rows}</tbody></table>
    <p class="source">Source: ${escapeText(fund.source)}. Holdings as of ${escapeText(fund.asOf)}.
      Disclosed coverage: ${formatBps(coverageBps)}.</p>`;
}

function factsheet(left: Fund, right: Fund): string {
  const result = calculateOverlap(left, right);
  const title = `Holdings overlap: ${left.name} and ${right.name}`;
  const label = result.coverage === "partial" ? "Observed overlap in disclosed holdings" : "Portfolio holdings overlap";
  const contributorRows = result.contributors.map((entry) => `
    <tr><th scope="row">${escapeText(entry.name)} (${escapeText(entry.securityId)})</th>
    <td>${formatBps(entry.leftBps)}</td><td>${formatBps(entry.rightBps)}</td>
    <td>${formatBps(entry.overlapBps)}</td></tr>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
    <title>${escapeText(title)}</title>
    <style>
      @page { size: letter; margin: .63in .72in; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #202020; font: 11pt/1.35 Arial, sans-serif; }
      h1 { font-size: 22pt; line-height: 1.15; margin: 0 0 5pt; }
      h2 { font-size: 14pt; margin: 14pt 0 5pt; }
      p { margin: 4pt 0; }
      .metric { font-weight: bold; font-size: 18pt; margin: 9pt 0; }
      table { border-collapse: collapse; width: 100%; font-size: 10.5pt; margin-top: 7pt; }
      caption { text-align: left; font-weight: bold; margin-bottom: 2pt; }
      th, td { text-align: right; padding: 3pt 5pt; border-bottom: 1px solid #bbb; }
      th:first-child { text-align: left; }
      tbody th { font-weight: normal; }
      .source { font-size: 9pt; color: #464646; }
    </style></head><body><main>
    <h1>${escapeText(title)}</h1>
    <p>Synthetic ETF comparison · Holdings as of ${escapeText(left.asOf)}</p>
    <p class="metric">${formatBps(result.overlapBps)} ${label.toLowerCase()}</p>
    <p>Each shared security contributes the smaller of its two portfolio weights.
      The sum of these contributions is the overlap.</p>
    <h2>Shared investments</h2>
    ${contributorRows ? `<table><caption>Contributions to overlap</caption><thead><tr>
      <th scope="col">Security</th><th scope="col">${escapeText(left.id)} weight</th>
      <th scope="col">${escapeText(right.id)} weight</th><th scope="col">Contribution</th>
      </tr></thead><tbody>${contributorRows}</tbody></table>` : "<p>No shared securities in the disclosed holdings.</p>"}
    <h2>Holdings evidence</h2>
    ${holdingsEvidence(left, result.leftCoverageBps)}
    ${holdingsEvidence(right, result.rightCoverageBps)}
    </main></body></html>`;
}

async function exportFactsheets(): Promise<void> {
  const directory = path.resolve("public/factsheets");
  await mkdir(directory, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH });
  try {
    const page = await browser.newPage();
    for (const [leftId, rightId] of [["A", "B"], ["A", "C"], ["B", "C"]]) {
      const left = syntheticFunds.find((fund) => fund.id === leftId);
      const right = syntheticFunds.find((fund) => fund.id === rightId);
      if (!left || !right) throw new Error(`Missing fixture for pair ${leftId}-${rightId}`);
      await page.setContent(factsheet(left, right));
      await page.pdf({
        path: path.join(directory, `${leftId}-${rightId}.pdf`),
        format: "Letter",
        preferCSSPageSize: true,
        tagged: true,
        outline: true,
      });
    }
  } finally {
    await browser.close();
  }
}

exportFactsheets().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
