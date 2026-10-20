import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_EXECUTABLE
    ? { executablePath: process.env.BROWSER_EXECUTABLE }
    : {}),
});
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(
  `<html lang="ja"><meta charset="UTF-8"><style>*{box-sizing:border-box}body{margin:0;background:#f6f4eb;color:#172b2a;font-family:'Noto Sans CJK JP',sans-serif;padding:62px}.label{font:700 15px Arial;letter-spacing:3px}h1{font-size:67px;line-height:1.5;letter-spacing:-3px;margin:45px 0 24px}h1 span{color:#253bd3}.art{position:absolute;right:38px;top:56px;width:390px;height:520px;background:#dbe8a8;border-radius:200px 200px 8px 8px;overflow:hidden}.number{position:absolute;top:65px;left:35px;font:900 260px Arial;letter-spacing:-40px;color:#253bd3;transform:rotate(-10deg)}.arrow{position:absolute;right:35px;top:80px;font-size:80px;color:#253bd3}.circle{position:absolute;width:480px;height:190px;border:1px solid #93a86b;border-radius:50%;transform:rotate(-40deg);top:160px;left:-50px}p{font-size:20px}.bottom{position:absolute;bottom:55px;font:700 13px Arial;letter-spacing:2px}</style><div class="label">MISSKEY 9000 / 9k</div><h1>いつものつながりに、<br/><span>次の工夫を。</span></h1><p>Misskey から派生した、分散型 SNS ソフトウェア。</p><div class="art"><div class="circle"></div><div class="number">9k</div><div class="arrow">↗</div></div><div class="bottom">OPEN SOURCE. FEDERATED. / mk9k.a9z.dev</div></html>`,
);
await page.screenshot({ path: "public/og.png" });
await browser.close();
