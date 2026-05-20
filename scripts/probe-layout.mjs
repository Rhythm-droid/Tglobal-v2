import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const layout = await page.evaluate(() => {
  const all = Array.from(document.body.querySelectorAll("nav, header, main, main > *"));
  return all.map((s) => {
    const r = s.getBoundingClientRect();
    return {
      tag: s.tagName,
      cls: (typeof s.className === "string" ? s.className : "").slice(0, 100),
      y: Math.round(r.y),
      h: Math.round(r.height),
    };
  });
});
console.log(JSON.stringify(layout, null, 2));

const heroProbe = await page.evaluate(() => {
  const hero = document.querySelector("main > section");
  if (!hero) return { error: "no hero" };
  const pin = hero.querySelector("div");
  const hr = hero.getBoundingClientRect();
  const pr = pin ? pin.getBoundingClientRect() : null;
  return {
    heroRect: { x: hr.x, y: hr.y, w: hr.width, h: hr.height },
    heroOffsetTop: hero.offsetTop,
    heroOffsetParent: hero.offsetParent ? hero.offsetParent.tagName : null,
    pinRect: pr ? { x: pr.x, y: pr.y, w: pr.width, h: pr.height } : null,
    pinPosition: pin ? getComputedStyle(pin).position : null,
    pinTop: pin ? getComputedStyle(pin).top : null,
    pinTransform: pin ? getComputedStyle(pin).transform : null,
  };
});
console.log("HERO:", JSON.stringify(heroProbe, null, 2));

await browser.close();
