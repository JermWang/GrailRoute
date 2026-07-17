# Environment variables

Every variable this repository reads, and where to set it. Verified against the
source — this is the complete list, not a sample.

## Quick reference

| Variable | Needed for | Required? | Set where | Read at |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Metadata, OG images, `robots.txt`, `sitemap.xml` | Recommended for production | Vercel → Environment Variables, or `.env.local` | Build |
| `NEXT_PUBLIC_GRAILROUTE_ASSET_CONTRACT` | Reading each wallet's tokenized-card balance | Optional | Vercel → Environment Variables, or `.env.local` | Build |
| `VERCEL_PROJECT_PRODUCTION_URL` | Fallback origin when `NEXT_PUBLIC_SITE_URL` is unset | Automatic | Supplied by Vercel | Build |
| `NODE_ENV` | Enables the missing-origin build warning | Automatic | Supplied by Next.js | Build |
| `CHROME_PATH` | `npm run video:render` only | Optional | Local shell | Runtime (script) |
| `CODEX_SANDBOX` | Cloudflare/Sites dev HMR polling | Automatic | Supplied by Codex sandbox | Dev only |

Nothing here is a secret today. See [Security](#security) before adding one.

## Production setup (Vercel)

Set these under **Settings → Environment Variables**, scoped to **Production**
(and **Preview**, if you want previews to self-reference correctly):

```text
NEXT_PUBLIC_SITE_URL=https://grail-route.vercel.app
```

Then **redeploy**. These values are read at build time, so changing a variable
has no effect until the next build.

---

## `NEXT_PUBLIC_SITE_URL`

The canonical public origin. Used for `metadataBase`, `og:image`,
`twitter:image`, `robots.txt`, and `sitemap.xml`.

- **Format:** full origin including scheme, no trailing slash — `https://grail-route.vercel.app`
- **Read by:** [`app/site.ts`](../app/site.ts)

**Why it matters.** These routes are statically prerendered, so the origin is
frozen into the HTML at build time. The resolution order is:

1. `NEXT_PUBLIC_SITE_URL`
2. `VERCEL_PROJECT_PRODUCTION_URL` (Vercel supplies this automatically)
3. `http://localhost:3000`

If both are missing, the build bakes `localhost:3000` into every social preview
and points crawlers at a dev host. The build prints a loud warning when it falls
back — if you see this in the Vercel build log, the variable is not set:

```text
[grailroute] WARNING: neither NEXT_PUBLIC_SITE_URL nor VERCEL_PROJECT_PRODUCTION_URL is set.
```

Setting it explicitly is recommended even on Vercel: it survives a custom domain
and does not depend on "Automatically expose System Environment Variables"
staying enabled.

## `NEXT_PUBLIC_GRAILROUTE_ASSET_CONTRACT`

The ERC-721 contract whose `balanceOf(address)` is read for the connected
wallet.

- **Format:** checksummed address — `0x...`
- **Read by:** [`app/page.tsx`](../app/page.tsx)

Leave it empty until a contract is deployed. Unset, the app still does wallet
discovery, connection, network switching, and native balances, and truthfully
reports that no tokenized-card contract is configured.

**This address is only read while the wallet is on Robinhood Chain.** Reads are
routed through the connected provider, so they answer for whatever network the
wallet is on; the app checks `eth_chainId` first and refuses to read off-chain
rather than render another chain's data as GrailRoute inventory. A contract
deployed to the same address on another chain therefore cannot leak into the UI.

## `VERCEL_PROJECT_PRODUCTION_URL`

Supplied automatically by Vercel as the project's production domain, without a
scheme. Used only as the fallback when `NEXT_PUBLIC_SITE_URL` is unset. Do not
set this by hand.

## `NODE_ENV`

Set automatically by Next.js (`development` / `production`). Only used to decide
whether to print the missing-origin warning. Do not set this by hand.

## `CHROME_PATH`

Only used by `npm run video:render`, which drives a headless browser to
regenerate the motion film. Not used by the application.

The script tries `CHROME_PATH` first, then falls back to the default Windows
Chrome and Edge install paths. Set it only if the render fails to find a
browser:

```bash
CHROME_PATH="/path/to/chrome" npm run video:render
```

## `CODEX_SANDBOX`

Read by [`vite.config.ts`](../vite.config.ts) to enable filesystem polling for
HMR under the macOS Seatbelt sandbox, which blocks FSEvents. Only affects the
Cloudflare/Sites dev server. Do not set this by hand.

---

## Local development

```bash
cp .env.example .env.local
```

`.env.local` is gitignored (`.env*` is ignored, `.env.example` is the sole
exception). Both application variables are optional locally — the app runs
without either.

## Not environment variables

- **Cloudflare D1 / R2 bindings** live in [`.openai/hosting.json`](../.openai/hosting.json), not the environment. Both are `null` today, so no database is bound.
- **Wrangler/Miniflare paths** (`WRANGLER_WRITE_LOGS`, `WRANGLER_LOG_PATH`, `MINIFLARE_REGISTRY_PATH`) are set by `vite.config.ts` to keep tool state project-local. They are tooling defaults, not configuration.

## Security

**`NEXT_PUBLIC_*` variables are compiled into the client bundle and are public.**
Anyone can read them by viewing source. That is correct for a contract address
and a site URL — both are public information.

Never give a secret a `NEXT_PUBLIC_` prefix. When this project gains one — an
indexer key, a custody-partner credential, a database URL — it must:

- be named **without** the `NEXT_PUBLIC_` prefix, so it stays server-side;
- be read only in server code (a route handler or server component), never in
  [`app/page.tsx`](../app/page.tsx), which is a client component;
- be set in Vercel's dashboard, never committed — including to `.env.example`,
  which is tracked.

No secret is currently used anywhere in this repository.
