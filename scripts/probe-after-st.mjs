import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
page.on("console", (m) => console.log(`[${m.type()}]`, m.text()));
page.on("pageerror", (e) => console.log("[err]", e.message));
await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);

const probe = await page.evaluate(() => {
  const hero = document.querySelector("main > section");
  const pin = hero?.querySelector("div");
  const canvases = Array.from(document.querySelectorAll("canvas"));
  const scrollY = window.scrollY;
  return {
    scrollY,
    docH: document.documentElement.scrollHeight,
    viewportH: window.innerHeight,
    heroRect: hero ? hero.getBoundingClientRect() : null,
    heroOffsetTop: hero ? hero.offsetTop : null,
    pinRect: pin ? pin.getBoundingClientRect() : null,
    pinComputed: pin ? {
      position: getComputedStyle(pin).position,
      top: getComputedStyle(pin).top,
      transform: getComputedStyle(pin).transform,
      width: getComputedStyle(pin).width,
      height: getComputedStyle(pin).height,
    } : null,
    pinParent: pin?.parentElement?.tagName,
    canvases: canvases.map((c) => {
      const r = c.getBoundingClientRect();
      return { w: c.width, h: c.height, y: r.y, x: r.x, rw: r.width, rh: r.height };
    }),
  };
});
console.log(JSON.stringify(probe, null, 2));
await browser.close();
