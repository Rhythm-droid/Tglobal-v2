import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);

const dom = await page.evaluate(() => {
  function describe(el, depth = 0) {
    if (!el || depth > 6) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      cls: (typeof el.className === "string" ? el.className : "").slice(0, 80),
      pos: cs.position,
      y: Math.round(r.y),
      h: Math.round(r.height),
      children: Array.from(el.children).slice(0, 8).map((c) => describe(c, depth + 1)),
    };
  }
  const hero = document.querySelector("main > section");
  return describe(hero);
});
console.log(JSON.stringify(dom, null, 2));
await browser.close();
