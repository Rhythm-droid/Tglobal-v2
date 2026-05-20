import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);

const heroH = await page.evaluate(() => document.querySelector("main > section")?.getBoundingClientRect().height ?? 0);
const vh = await page.evaluate(() => window.innerHeight);
const pinRange = heroH - vh;

await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), pinRange * 0.97);
await page.waitForTimeout(700);

const result = await page.evaluate(() => {
  const list = document.querySelector('main > section ul[aria-label="Industries served"]');
  if (!list) return { error: "no list" };
  const items = Array.from(list.children).map((li, i) => {
    const r = li.getBoundingClientRect();
    return { i, label: li.textContent.trim(), y: Math.round(r.y), h: Math.round(r.height) };
  });
  const listRect = list.getBoundingClientRect();
  const wrapper = list.parentElement;
  const wrapperRect = wrapper.getBoundingClientRect();
  return {
    vh: window.innerHeight,
    listRect: { y: listRect.y, h: listRect.height },
    listComputedTransform: getComputedStyle(list).transform,
    wrapperRect: { y: wrapperRect.y, h: wrapperRect.height },
    wrapperComputedTransform: getComputedStyle(wrapper).transform,
    items,
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
