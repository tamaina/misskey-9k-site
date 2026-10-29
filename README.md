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

- Latest public prerelease: [9000.0.0-beta.4](https://github.com/tamaina/misskey-a/releases/tag/9000.0.0-beta.4), tag commit `31f01db50b1cbe4e9211cb03b249662b8ab61141`.
- Released feature claims: [beta.4 CHANGELOG](https://github.com/tamaina/misskey-a/blob/9000.0.0-beta.4/CHANGELOG.md). The introduction now follows the author’s grouping: MCP/OAuth, ActivityPub Ed25519, remote avatar decorations, client improvements, then feature structure, oRPC/Valibot and VVI.
- Editorial basis: [author edit af016bb](https://github.com/tamaina/misskey-a/commit/af016bb8f56e762d9864bc88710737c88a7b10a5) and the [updated CHANGELOG at 4085154](https://github.com/tamaina/misskey-a/blob/4085154bda21f0b200179c28e06682728f69bb27/CHANGELOG.md). Do not restore deleted promotional points or treat its 9000.0.0 heading as a stable release.
- Both [MCP self-event exclusion #215](https://github.com/tamaina/misskey-a/pull/215) and [Unicode list-name correction #217](https://github.com/tamaina/misskey-a/pull/217) are shipped in beta.4, not develop-only. Verified against the tagged `McpEventsService.ts`, `UserWebhookService.ts`, `relationships.contract.ts` and `string.schema.ts`: exclusion is scoped to the self-authored recipient’s MCP subscription; list names use 1–100 Unicode code points, not grapheme clusters.
- Beta.4 excludes posting-role policies #122, channel federation #136, recovery-code work #146 and reauthentication redesign #188. This site update does not assert deployment of beta.4 to any particular Misskey server. No production server or account permissions were changed.
- Unmerged functionality is described separately; billing, P2P, channel federation and auth redesign are not advertised as ready. OIDC login is not connected. MCP is disabled by default; the page states its configuration, proxy and permission requirements.
- `public/images/oauth-permission-selection.png` is copied from the tagged public repository's `docs/screenshots/`. It is a synthetic UI sample, explicitly labeled on the site. It contains no account or private-note data. It is not presented as a production screenshot.
- The Mi9k mark and Misskey 9000 wordmark are author-provided vectors; orbital artwork is site presentation graphics.

When updating, recheck both the release tag and open PRs. A CHANGELOG heading of `9000.0.0` does not establish a stable release. The README/installation links refer to upstream and fork documentation; package and Docker distribution availability must not be assumed.

## Validation

```sh
pnpm exec playwright install chromium
pnpm build
pnpm preview --host 127.0.0.1
SITE_URL=http://127.0.0.1:4321 node scripts/validate.mjs
node scripts/brand-review.mjs
```

The script captures desktop and two mobile sizes, checks overflow, broken images, anchors, navigation, browser errors and axe WCAG A/AA findings. Output is ignored under `.tmp/test-results/` (`VALIDATION_OUTPUT` can override it). Use `SITE_URL=https://mk9k.a9z.dev` for public verification. Run `pnpm build && pnpm brand && pnpm build` serially to regenerate and include the brand assets. `scripts/og.mjs` remains a compatibility entry point.

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

The author-provided vectors are `src/assets/mi9k-mark.svg` and `src/assets/misskey9000-wordmark.svg`. Their original path data, viewBoxes and transforms are preserved. Inline logos inherit `currentColor` and are decorative; home links retain the accessible name “Misskey 9000 ホーム”.

`pnpm brand` runs `scripts/brand-assets.mjs` using the existing Playwright Chromium installation (or `BROWSER_EXECUTABLE`). Build first so the generator can reuse the hero arrow from `dist/index.html`. It writes `public/og.png` (1200 × 630), SVG/ICO favicons, Apple/192/512/maskable icons and `site.webmanifest`; rebuild afterwards to copy them into `dist/`. Review captures from `node scripts/brand-review.mjs` go to `.tmp/shots/` (1440×900 desktop, 390×844 mobile, full pages and dark favicon). Path SHA-256 checks guard against shape changes; if the original exports are present in `.tmp/logo-src/`, paths, viewBoxes and transforms are also compared directly.

The transparent SVG favicon has 10% vertical padding and switches from black to cream in dark mode. PNG icons use opaque blue (`#253bd3`) with cream (`#f6f4eb`) marks, 12% vertical padding, and no baked-in corner rounding. ICO contains 16/32/48 px PNGs on the same blue background for contrast in both tab themes. The maskable mark is 56% of the square's height, fitting inside the central 80%-diameter safe circle. The static site's manifest uses `display: browser`.

Icons use the official [`@lucide/astro`](https://lucide.dev/guide/astro/getting-started) package (ISC license). Named imports render inline SVG at build time without browser JavaScript. Link icons supplement visible labels and are hidden from assistive technology. Feature cards use Plug, Network, Sparkles and PanelsTopLeft; external links use ArrowUpRight consistently.

## Unreleased PR section

Section 05 separates current public development work from beta.4; Get Started is section 06. Billing/wallet/P2P (#64/#81/#126) and authentication/recovery (#188/#146) are Draft and unmerged. Channel federation #136 is open and unmerged (the API's actual draft flag is false); its scope is remote subscription, receiving posts and author deletion, not remote posting or owner deletion of others' posts. The auth proposal explicitly excludes OIDC SSO. Each summary links directly to current PR evidence and makes no availability or release-date promise. The old release/develop status boxes in section 04 have been removed; beta.4 corrections are summarized with the shipped features.
