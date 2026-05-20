import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
const r = await page.evaluate(() => {
  return {
    htmlTransform: getComputedStyle(document.documentElement).transform,
    bodyTransform: getComputedStyle(document.body).transform,
    htmlScrollTop: document.documentElement.scrollTop,
    bodyScrollTop: document.body.scrollTop,
    windowScrollY: window.scrollY,
    windowPageYOffset: window.pageYOffset,
    htmlClass: document.documentElement.className,
    bodyClass: document.body.className,
    lenisHtml: document.documentElement.getAttribute("data-lenis-prevent"),
  };
});
console.log(JSON.stringify(r, null, 2));
await browser.close();
