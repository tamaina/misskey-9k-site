import { chromium, firefox } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await (process.env.BROWSER_TYPE === 'firefox' ? firefox : chromium).launch({headless:true,ignoreDefaultArgs:['--disable-dev-shm-usage'],...(process.env.BROWSER_EXECUTABLE ? {executablePath:process.env.BROWSER_EXECUTABLE} : {})});
await mkdir('test-results',{recursive:true});
const base=process.env.SITE_URL || 'http://127.0.0.1:4321';
const report={base,pages:[]};
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844],['small-mobile',320,780]]){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'networkidle'});
 await page.evaluate(async()=>{await Promise.all([...document.images].map(async image=>{image.loading='eager';await image.decode().catch(()=>{});}));});
 await page.screenshot({path:`test-results/${name}.png`,fullPage:true});
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 const structure=await page.evaluate(()=>({title:document.title,lang:document.documentElement.lang,h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),badAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.querySelector(a.getAttribute('href'))).map(a=>a.href),links:[...new Set([...document.links].map(a=>a.href))]}));
 await page.getByRole('link',{name:'9k をはじめる'}).click();
 await page.waitForTimeout(700);
 const navigation=await page.evaluate(()=>location.hash==='#start');
 report.pages.push({name,width,errors,structure,navigation,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
 await context.close();
}
await writeFile('test-results/validation.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));await browser.close();
if(report.pages.some(p=>p.errors.length||p.structure.overflow||p.structure.brokenImages.length||p.structure.badAnchors.length||p.violations.length||!p.navigation))process.exitCode=1;
