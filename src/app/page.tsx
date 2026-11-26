"use client";

import {useState} from "react";
import {syntheticFunds, calculateOverlap, formatBps} from "../lib/overlap";

const pairs = [["A","B"], ["A","C"], ["B","C"]] as const;

export default function Workspace() {
  const [pairIndex, setPairIndex] = useState(0);
  const [leftId, rightId] = pairs[pairIndex];
  const fund = (id: string) => syntheticFunds.find(item => item.id === id)!;
  const left = fund(leftId);
  const right = fund(rightId);
  const result = calculateOverlap(left, right);
  const percent = formatBps(result.overlapBps);
  const name = (id: string) => fund(id).name;
  const leader = result.contributors[0];

  return <>
    <a className="skip" href="#main">Skip to comparison</a>
    <header className="top"><div className="brand"><i aria-hidden="true">◧</i> Folio Research</div><span>Research workspace</span></header>
    <main id="main">
      <div className="heading"><div><p className="kicker">ETF research / Factsheets</p><h1>Holdings comparison</h1></div>
        <a className="download" href={`/factsheets/${leftId}-${rightId}.pdf`} download>Download PDF <span aria-hidden="true">↓</span></a></div>
      <div className="controls"><label htmlFor="pair">Compare funds</label>
        <select id="pair" value={pairIndex} onChange={event=>setPairIndex(Number(event.target.value))}>
          {pairs.map(([a,b],i)=><option key={a+b} value={i}>{name(a)} / {name(b)}</option>)}
        </select><small>Synthetic holdings · As of <time>{left.asOf}</time></small></div>
      <section className="overview" aria-labelledby="overlap"><div className="metric"><h2 id="overlap">{result.coverage === "partial" ? "Observed holdings overlap" : "Weighted overlap"}</h2>
        <strong aria-live="polite">{percent}</strong>
        <p>{leader ? `${leader.name} contributes ${formatBps(leader.overlapBps)} of portfolio weight to the overlap.` : "The disclosed portfolios have no shared equity holdings."}</p>
        {result.coverage === "partial" && <p>Disclosed coverage: {formatBps(result.leftCoverageBps)} and {formatBps(result.rightCoverageBps)}.</p>}
        <a href="#evidence">Inspect holdings <span aria-hidden="true">↘</span></a></div>
        <div className="distribution"><h2>Portfolio composition</h2>
          {[left,right].map(f=><div className="plot" key={f.id}><div className="plot-title">{f.name}</div>
            <div className="bar" aria-hidden="true">{f.holdings.map((h,i)=><span key={i} style={{flexBasis:formatBps(h.weightBps)}} className={result.contributors.some(c=>c.securityId===h.securityId)?"shared":"other"}/>)}</div>
            <div className="labels">{f.holdings.map((h,i)=><span key={i}>{h.securityId} {formatBps(h.weightBps)}</span>)}</div>
          </div>)}<small>Solid segments mark securities held by both funds. Overlap uses the smaller weight in each pair.</small>
        </div></section>
      <section id="evidence"><h2>Holdings evidence</h2>
        <div className="scroll"><table><caption>Portfolio weights and contribution to overlap</caption>
          <thead><tr><th scope="col">Security</th><th scope="col">{left.name}</th><th scope="col">{right.name}</th><th scope="col">Overlap</th></tr></thead>
          <tbody>{Array.from(new Set([...left.holdings,...right.holdings].map(h=>h.securityId))).map(id=>{
            const holding=(f: typeof left)=>f.holdings.filter(h=>h.securityId===id).reduce((total,h)=>total+h.weightBps,0);
            return <tr key={id}><th scope="row">{[...left.holdings,...right.holdings].find(h=>h.securityId===id)?.name}</th><td>{formatBps(holding(left))}</td><td>{formatBps(holding(right))}</td><td>{formatBps(result.contributors.find(c=>c.securityId===id)?.overlapBps ?? 0)}</td></tr>;
          })}</tbody><tfoot><tr><th scope="row" colSpan={3}>Total weighted overlap</th><td>{percent}</td></tr></tfoot></table></div>
      </section>
      <section className="sources"><h2>Sources &amp; methodology</h2><p>Sum the smaller portfolio weight of each shared security. Weights are percentages of the full portfolio.</p>
        <ul>{[left,right].map(f=><li key={f.id}>{f.name} · {f.source} · {f.asOf}</li>)}</ul></section>
    </main>
  </>;
}
