// Run against pnpm preview after generating brand assets and rebuilding.
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const base = process.env.SITE_URL || 'http://127.0.0.1:4321';
await mkdir('.tmp/shots', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ignoreDefaultArgs: ['--disable-dev-shm-usage'],
  ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}),
});
try {
  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `.tmp/shots/${name}.png` });
    // Also capture the hero below the mobile fold and the footer for logo review.
    await page.screenshot({ path: `.tmp/shots/${name}-full.png`, fullPage: true });
    await page.close();
  }
  const page = await browser.newPage({
    viewport: { width: 320, height: 320 }, colorScheme: 'dark', deviceScaleFactor: 1,
  });
  await page.goto(base);
  await page.setContent('<style>body{margin:0;background:#172b2a;display:grid;place-items:center;height:100vh}img{width:256px;height:256px}</style><img src="/favicon.svg" alt="Dark scheme Mi9k favicon">');
  await page.locator('img').evaluate(img => img.decode());
  await page.screenshot({ path: '.tmp/shots/favicon-dark.png' });
} finally { await browser.close(); }
