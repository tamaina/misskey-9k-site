import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const root = new URL('../', import.meta.url);
const blue = '#253bd3';
const cream = '#f6f4eb';
const hashes = {
  'mi9k-mark': 'a480a263374af44986796ce0e654f69496a5a9d2d9ee73738594ffb514706c03',
  'misskey9000-wordmark': '52374a7946fdaa248102f2dd6adfc77234b1dc5b32453c107c44d0f5de39d2d6',
};
const logos = {};
for (const [name, hash] of Object.entries(hashes)) {
  const svg = await readFile(new URL(`src/assets/${name}.svg`, root), 'utf8');
  const paths = [...svg.matchAll(/\bd="([^"]*)"/g)].map(m => m[1]);
  assert.equal(paths.length, 1, `${name}: expected one original path`);
  assert.equal(createHash('sha256').update(paths[0]).digest('hex'), hash, `${name}: original path changed`);
  // Original exports are optional, gitignored inputs; compare bytes and geometry when present.
  let source;
  try { source = await readFile(new URL(`.tmp/logo-src/${name}.svg`, root), 'utf8'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (source) {
    assert.deepEqual(paths, [...source.matchAll(/\bd="([^"]*)"/g)].map(m => m[1]));
    for (const attr of ['viewBox', 'transform']) {
      const values = text => [...text.matchAll(new RegExp(`\\b${attr}="([^"]*)"`, 'g'))].map(m => m[1]);
      assert.deepEqual(values(svg), values(source), `${name}: ${attr} changed`);
    }
  }
  logos[name] = svg.trim();
}
const mark = logos['mi9k-mark'];
const wordmark = logos['misskey9000-wordmark'];
const pageHtml = await readFile(new URL('dist/index.html', root), 'utf8');
const arrow = pageHtml.match(/<svg\b[^>]*class="[^"]*\bhero-arrow\b[^"]*"[^>]*>[\s\S]*?<\/svg>/)?.[0];
if (!arrow) throw new Error('Run pnpm build before pnpm brand.');
const innerMark = mark.replace(/<svg\b[^>]*>|<\/svg>/g, '');
// A 146.3568 square gives the unchanged mark 10% vertical padding.
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-23.569025 -14.63568 146.3568 146.3568" fill="#000000"><style>@media(prefers-color-scheme:dark){:root{fill:${cream}}}</style>${innerMark}</svg>\n`;
await writeFile(new URL('public/favicon.svg', root), favicon);
const manifest = {
  name: 'Misskey 9000', short_name: 'Mi9k', lang: 'ja', start_url: '/', display: 'browser',
  theme_color: blue, background_color: blue,
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
await writeFile(new URL('public/site.webmanifest', root), JSON.stringify(manifest, null, 2) + '\n');
const browser = await chromium.launch({
  headless: true,
  ignoreDefaultArgs: ['--disable-dev-shm-usage'],
  ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}),
});
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  async function icon(size, fraction) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><style>html,body{margin:0;width:100%;height:100%;background:${blue}}body{display:grid;place-items:center;color:${cream}}svg{height:${fraction * 100}%;width:auto;display:block}</style>${mark}</html>`);
    return page.screenshot({ type: 'png' });
  }
  for (const [file, size, fraction] of [
    ['apple-touch-icon.png', 180, .76], ['icon-192.png', 192, .76],
    ['icon-512.png', 512, .76],
    // A centred 48% × 56% mark fits entirely inside the maskable 80%-diameter circle.
    ['icon-maskable-512.png', 512, .56],
  ]) await writeFile(new URL(`public/${file}`, root), await icon(size, fraction));
  const entries = [];
  for (const size of [16, 32, 48]) entries.push({ size, png: await icon(size, .8) });
  const header = Buffer.alloc(6 + 16 * entries.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  let offset = header.length;
  for (const [i, { size, png }] of entries.entries()) {
    const at = 6 + i * 16;
    header[at] = size; header[at + 1] = size;
    header.writeUInt16LE(1, at + 4); header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(png.length, at + 8); header.writeUInt32LE(offset, at + 12);
    offset += png.length;
  }
  await writeFile(new URL('public/favicon.ico', root), Buffer.concat([header, ...entries.map(e => e.png)]));
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`<html lang="ja"><meta charset="UTF-8"><style>*{box-sizing:border-box}body{margin:0;background:${cream};color:#172b2a;font-family:'Noto Sans CJK JP',sans-serif;padding:45px 62px}.brand{width:195px;height:78px;color:${blue}}.brand svg{width:100%;height:100%}h1{font-size:67px;line-height:1.5;letter-spacing:-3px;margin:26px 0 24px}h1 span{color:${blue}}.art{position:absolute;right:38px;top:56px;width:390px;height:520px;background:#dbe8a8;border-radius:200px 200px 8px 8px;overflow:hidden}.mark{position:absolute;top:110px;left:75px;width:230px;color:${blue};transform:rotate(-10deg)}.mark svg{width:100%;height:auto}.arrow{position:absolute;right:30px;top:65px;width:75px;color:${blue}}.arrow svg{width:100%;height:auto}.circle{position:absolute;width:480px;height:190px;border:1px solid #93a86b;border-radius:50%;transform:rotate(-40deg);top:160px;left:-50px}p{font-size:20px}.bottom{position:absolute;bottom:55px;font:700 13px Arial;letter-spacing:2px}</style><div class="brand">${wordmark}</div><h1>いつものつながりに、<br/><span>次の工夫を。</span></h1><p>Misskey から派生した、分散型 SNS ソフトウェア。</p><div class="art"><div class="circle"></div><div class="mark">${mark}</div><div class="arrow">${arrow}</div></div><div class="bottom">OPEN SOURCE. FEDERATED. / mk9k.a9z.dev</div></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL('public/og.png', root).pathname });
} finally { await browser.close(); }
console.log('Brand assets generated; original path hashes and available source geometry verified.');
