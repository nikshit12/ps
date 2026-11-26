# MVP work record

Milestone 1 has a running comparison page and downloadable PDF factsheets for three synthetic fund pairs. Chrome generates the fixture PDFs ahead of time from the same analytics module as the page. This prototype tests tagged output before choosing the production rendering engine.

| Task | State | Evidence |
|---|---|---|
| M1-01 · Calculate overlap | Complete | Four automated tests pass, including 25% entirely attributable to X, duplicate positions, partial disclosures, cash exclusions and invalid snapshots. |
| M1-02 · Show accessible holdings evidence | Implemented | Production browser checks verified the keyboard skip link, all three pair selections, percentage updates and no document overflow at 375px. |
| M1-03 · Export tagged PDFs | Implemented | Three successful downloads, each one US Letter page with tagged headings, tables, source and date. PDF tags and reading-order text inspected after correcting the headline. |
| M1-04 · Verify accessibility with assistive technology | Ready for QA | Run formal PDF/UA validation and manual screen-reader checks on the web and PDF. Verify title, percentage, contributor, source and table header navigation. Record any fixes before marking milestone 1 complete. |

[Architecture and milestone exit criteria](architecture-etf-reports/architecture-etf-reports.md)
