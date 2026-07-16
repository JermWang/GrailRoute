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

Copy `.env.example` to `.env.local` when a GrailRoute asset contract is available:

```text
NEXT_PUBLIC_GRAILROUTE_ASSET_CONTRACT=0x...
```

Without that value, wallet discovery, account connection, network switching, and native balances still work; the application truthfully reports that no tokenized-card contract is configured.

## Useful commands

- `npm test` — validate the Sites build and server-rendered shell
- `npm run lint` — check application source
- `npm run video:render` — regenerate the 15-second full-HD motion film
- `npm run db:generate` — generate optional D1 migrations

See Vercel’s official [Next.js deployment guide](https://vercel.com/docs/frameworks/full-stack/nextjs) and [project configuration reference](https://vercel.com/docs/project-configuration/vercel-json) for platform details.
