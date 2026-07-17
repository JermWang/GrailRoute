# GrailRoute

GrailRoute is a wallet-native Pokémon TCG marketplace concept built around authenticated physical cards, 1:1 digital titles, intent-based routing, and atomic settlement on Robinhood Chain.

## Project layout

```text
app/            Next.js application and UI
public/         Production images, video, icons, and social preview
artifacts/      Final downloadable creative exports
docs/design/    Claude Design handoff and motion source
scripts/        Reproducible creative-export tooling
tests/          Server-rendered application checks

build/          OpenAI Sites build integration
db/             Optional Cloudflare D1 layer
worker/         OpenAI Sites worker entrypoint
```

The deployable web application lives at the repository root. Do not select `app/` as a separate Vercel Root Directory.

## Vercel deployment

Import `JermWang/GrailRoute` from GitHub with these settings:

- Root Directory: `./`
- Framework Preset: Next.js
- Install Command: `npm ci`
- Build Command: `npm run build:vercel`
- Output Directory: leave blank so Vercel uses the Next.js default

The committed `vercel.json` supplies the framework, install, development, and build settings automatically. Every GitHub push can therefore use the native Next.js build instead of the Cloudflare/Vinext build.

## Local development

For the Vercel/Next.js runtime:

```bash
npm ci
npm run dev
npm run build
```

For the existing OpenAI Sites runtime:

```bash
npm run dev:sites
npm run build:sites
```

## Environment

See [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) for every variable, what reads
it, and where to set it.

Copy `.env.example` to `.env.local`:

```text
NEXT_PUBLIC_GRAILROUTE_ASSET_CONTRACT=0x...   # optional
NEXT_PUBLIC_SITE_URL=https://your-domain.com  # optional
```

Without an asset contract, wallet discovery, account connection, network switching, and native balances still work; the application truthfully reports that no tokenized-card contract is configured.

`NEXT_PUBLIC_SITE_URL` sets the canonical origin for metadata, Open Graph images, `robots.txt`, and `sitemap.xml`. On Vercel it is inferred from `VERCEL_PROJECT_PRODUCTION_URL`, so it is only needed for a custom domain or another host. It is deliberately not read from request headers: doing so would opt every route out of static generation.

## Onchain data policy

Wallet reads are routed through the connected EVM provider, so they answer for whatever network that wallet is on. GrailRoute therefore checks `eth_chainId` first and refuses to read balances off Robinhood Chain, showing a "Switch to Robinhood Chain" prompt instead. Data from another chain is never rendered as GrailRoute inventory.

## Useful commands

- `npm test` — validate the Sites build and server-rendered shell
- `npm run lint` — check application source
- `npm run video:render` — regenerate the 15-second full-HD motion film
- `npm run db:generate` — generate optional D1 migrations

See Vercel’s official [Next.js deployment guide](https://vercel.com/docs/frameworks/full-stack/nextjs) and [project configuration reference](https://vercel.com/docs/project-configuration/vercel-json) for platform details.
