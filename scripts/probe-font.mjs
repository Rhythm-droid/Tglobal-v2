import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
const heroH = await page.evaluate(() => document.querySelector("main > section")?.getBoundingClientRect().height ?? 0);
await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), (heroH - 1080) * 0.97);
await page.waitForTimeout(700);
const r = await page.evaluate(() => {
  const span = document.querySelector('main > section ul[aria-label="Industries served"] span');
  const cs = getComputedStyle(span);
  return { fs: cs.fontSize, lh: cs.lineHeight, h: span.getBoundingClientRect().height };
});
console.log(r);
await browser.close();
