import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
const brand = await readFile(
  new URL("../src/assets/brand-mark.svg", import.meta.url),
  "utf8",
);
const pageHtml = await readFile(
  new URL("../dist/index.html", import.meta.url),
  "utf8",
);
const arrow = pageHtml.match(
  /<svg\b[^>]*class="[^"]*\bhero-arrow\b[^"]*"[^>]*>[\s\S]*?<\/svg>/,
)?.[0];
if (!arrow) throw new Error("Run pnpm build before regenerating brand assets.");
await writeFile(
  new URL("../public/favicon.svg", import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#253bd3"/><svg x="5" y="10" width="54" height="42" viewBox="0 0 202 140" fill="#f6f4eb">${brand.replace(/<svg[^>]*>|<\/svg>/g, "")}</svg></svg>`,
);
const browser = await chromium.launch({
  headless: true,
  ignoreDefaultArgs: ["--disable-dev-shm-usage"],
  ...(process.env.BROWSER_EXECUTABLE
    ? { executablePath: process.env.BROWSER_EXECUTABLE }
    : {}),
});
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(
  `<html lang="ja"><meta charset="UTF-8"><style>*{box-sizing:border-box}body{margin:0;background:#f6f4eb;color:#172b2a;font-family:'Noto Sans CJK JP',sans-serif;padding:62px}.label{font:700 15px Arial;letter-spacing:3px}h1{font-size:67px;line-height:1.5;letter-spacing:-3px;margin:45px 0 24px}h1 span{color:#253bd3}.art{position:absolute;right:38px;top:56px;width:390px;height:520px;background:#dbe8a8;border-radius:200px 200px 8px 8px;overflow:hidden}.number{position:absolute;top:125px;left:26px;width:325px;color:#253bd3;transform:rotate(-10deg)}.number svg{width:100%;height:auto}.arrow{position:absolute;right:35px;top:80px;width:80px;color:#253bd3}.arrow svg{width:100%;height:auto}.circle{position:absolute;width:480px;height:190px;border:1px solid #93a86b;border-radius:50%;transform:rotate(-40deg);top:160px;left:-50px}p{font-size:20px}.bottom{position:absolute;bottom:55px;font:700 13px Arial;letter-spacing:2px}</style><div class="label">MISSKEY 9000 / 9k</div><h1>いつものつながりに、<br/><span>次の工夫を。</span></h1><p>Misskey から派生した、分散型 SNS ソフトウェア。</p><div class="art"><div class="circle"></div><div class="number">${brand}</div><div class="arrow">${arrow}</div></div><div class="bottom">OPEN SOURCE. FEDERATED. / mk9k.a9z.dev</div></html>`,
);
await page.screenshot({ path: "public/og.png" });
await browser.close();
