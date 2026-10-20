# Misskey 9000 introduction

Japanese introduction website for Misskey 9000 (9k), built with Astro and served by Cloudflare Workers Static Assets at https://mk9k.a9z.dev/.

## Development

Use Node.js 24+ and pnpm 11.17.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm preview
```

The production output is `dist/`. The source is a purely static site with no runtime JavaScript, backend, database, analytics code or external font requests. Cloudflare may inject its account-configured Insights beacon into public browser responses; validation records that platform script separately.

## Deployment

`wrangler.jsonc` is the source of truth. The Worker name is `misskey-9k-site`; its only custom domain is `mk9k.a9z.dev`. Authenticate with an already authorized Cloudflare account, then run `pnpm deploy`. No credentials belong in this repository. Do not change other Workers, DNS records or Misskey production worktrees.

Git-based automatic deployment is deferred: Cloudflare Workers Builds requires an authorized repository connection and deployment build token. Configure a `main` production trigger with install `pnpm install --frozen-lockfile`, build `pnpm build`, deploy `pnpm exec wrangler deploy`. Do not create or broaden persistent credentials without the owner's approval.

## Content and evidence

Content checked on 2026-10-20 against the public `tamaina/misskey-a` repository:

- Latest public prerelease: [9000.0.0-beta.3](https://github.com/tamaina/misskey-a/releases/tag/9000.0.0-beta.3), tag commit `297fd7f2d1418f50f4135d034c45f4c1589ca7c1`.
- Feature claims: [tagged CHANGELOG](https://github.com/tamaina/misskey-a/blob/9000.0.0-beta.3/CHANGELOG.md), especially #1, #14, #17, #104, #119, #162, #191 and OAuth/MCP changes.
- Unmerged functionality is described separately; billing, P2P, channel federation and auth redesign are not advertised as ready. OIDC login is not connected. MCP is disabled by default and some features are experimental.
- `public/images/oauth-permission-selection.png` is copied from the tagged public repository's `docs/screenshots/`. It is a synthetic UI sample, explicitly labeled on the site. It contains no account or private-note data. It is not presented as a production screenshot.
- The site's 9k wordmark and orbital artwork are original presentation graphics, not an asserted upstream official logo.

When updating, recheck both the release tag and open PRs. A CHANGELOG heading of `9000.0.0` does not establish a stable release. The README/installation links refer to upstream and fork documentation; package and Docker distribution availability must not be assumed.

## Validation

```sh
pnpm exec playwright install chromium
pnpm build
pnpm preview --host 127.0.0.1
SITE_URL=http://127.0.0.1:4321 node scripts/validate.mjs
```

The script captures desktop and two mobile sizes, checks overflow, broken images, anchors, navigation, browser errors and axe WCAG A/AA findings. Output is ignored under `test-results/`. Use `SITE_URL=https://mk9k.a9z.dev` for public verification. `scripts/og.mjs` regenerates `public/og.png` (1200 × 630) and the path-based favicon after `pnpm build`.

## License

AGPL-3.0, matching the fork's licensing. The public UI sample retains its provenance described above.

## Initial validation (2026-10-20)

- Production build and Wrangler dry run passed.
- Desktop 1440×1000, mobile 390×844 and small mobile 320×780: no horizontal overflow, broken images, invalid anchors, page errors, or axe WCAG A/AA violations; start-section navigation passed.
- All eight distinct external/canonical links returned HTTP 200. Public OG, favicon, UI sample, robots and sitemap returned 200 with correct content types. Unknown path returned 404.
- HTTPS custom domain returned 200 and Cloudflare deployment reported 100% traffic to the published version.
- Visual checks cover typography, contrast, mobile stacking, visible focus styling and reduced-motion behavior. Automated checks do not establish complete accessibility conformance.
- On this shared host Chromium needed `ignoreDefaultArgs: ['--disable-dev-shm-usage']` so rendering uses `/dev/shm` instead of quota-limited temporary files. `BROWSER_EXECUTABLE` can point at an installed browser; ordinary setups can use the Playwright-installed default.

## SVG branding and icons

The custom 9k mark is a font-independent vector in `src/assets/brand-mark.svg`, reused by `BrandMark.astro`, the favicon and OG artwork. It is decorative; home links retain the accessible name “Misskey 9000 ホーム”. Prose references to 9k remain text.

Icons use the official [`@lucide/astro`](https://lucide.dev/guide/astro/getting-started) package (ISC license). Named imports render inline SVG at build time without browser JavaScript. Link icons supplement visible labels and are hidden from assistive technology. Feature cards use Bookmark, Share2, UserCheck and ShieldCheck; external links use ArrowUpRight consistently.
