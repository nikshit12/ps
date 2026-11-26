# Folio Research

Compare three pairs of synthetic ETF portfolios, inspect the holdings behind their weighted overlap, and download one-page tagged PDF factsheets. Each dataset is dated and uses integer basis points.

## Run locally

With Node.js 22.13 or newer, run `npm ci` and `npm run dev`. Open the local URL printed by Next.js. Use `npm test` for the calculation suite and `npm run build` for the production build.

The fixture PDFs ship with the app. After changing the inputs or print template, run `npx playwright install chromium`, then `npm run exports`, and commit the updated PDFs. To use an existing Chrome installation, set `CHROMIUM_EXECUTABLE_PATH` to the browser executable.

See the [work record](docs/mvp-work.md) for accessibility verification and upcoming work.
